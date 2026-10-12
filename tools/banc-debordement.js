#!/usr/bin/env node
/* ============================================================================
   banc-debordement.js — RIEN NE SORT DE L'ECRAN (2026-10-11, etape 0 du plan
   de lisibilite de l'administration)
   ----------------------------------------------------------------------------
   POURQUOI. La regle de la maison est « aucune barre de defilement, tout tient
   en 1400 × 833 ». La sonde jetable qui la mesurait (outils-jetables/
   sonde-debord.js) a disparu du poste : plus rien ne gardait l'ecran au moment
   d'aerer les fenetres. Ce banc la remplace, VERSIONNE.

   ── CE QU'IL REEMPLOIE ─────────────────────────────────────────────────────
   Le montage EPROUVE de banc-zones-mortes.js, recopie (un banc dont on rend le
   coeur interchangeable est un banc qu'on neutralise sans le voir) : meme
   gabarit, memes jeux de reponses, meme pilote a iframe, Chrome sans tete a
   profil jetable, ferme PAR SON PROFIL. Un seul Chrome a la fois, par lots
   sequentiels (regle du poste : jamais plus d'un ou deux Chrome).
   Seuls changent le coeur (debordement-coeur.js), la taille de l'iframe et le
   rapport.

   ── LA DETTE ───────────────────────────────────────────────────────────────
   tools/debordement-dette.json liste les fenetres qui debordaient DEJA le jour
   ou ce banc est ne. Le banc echoue sur un debordement NOUVEAU ou AGGRAVE, et
   signale celles de la dette qui sont revenues dans le cadre (a retirer).

   ── USAGE ──────────────────────────────────────────────────────────────────
     node tools/banc-debordement.js               # toutes, 1400 x 833, nuit
     node tools/banc-debordement.js --detache     # 1080 x 780 (fenetre detachee)
     node tools/banc-debordement.js telephonie cles
     node tools/banc-debordement.js --dette       # reecrit la dette (a la main, sciemment)
   ============================================================================ */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const RACINE = path.resolve(__dirname, '..');
const DOS_FEN = path.join(RACINE, 'src', 'fenetres');
const REPONSES = require('./reponses-fenetres.js');
const COEUR = fs.readFileSync(path.join(__dirname, 'debordement-coeur.js'), 'utf8');
const DETTE_F = path.join(__dirname, 'debordement-dette.json');

const ARGS = process.argv.slice(2);
const OPT = (n) => ARGS.includes(n);
const GARDER = OPT('--garder');
const CHOISIES = ARGS.filter((a) => !a.startsWith('--'));
const MODES = OPT('--jour') ? ['jour'] : ['nuit'];
const DETACHE = OPT('--detache');
const HAUT = DETACHE ? 780 : 833;
const ECRIRE_DETTE = OPT('--dette');
const PAR_LOT = 18;
/* --jeu=N : rend le N-ieme jeu de reponses de la fenetre (0 par defaut) — pour voir un
   onglet ou un editeur que le premier jeu n'ouvre pas. Ne sert qu'a la main, avec --garder. */
const JEU_N = Number((ARGS.find((a) => a.startsWith('--jeu=')) || '--jeu=0').slice(6)) || 0;

/* ── L ELASTICITE ──────────────────────────────────────────────────────────
   ⚠ LA QUESTION N EST PAS << reste-t-il du vide ? >> MAIS << le contenu
   SUIT-IL la fenetre ? >>. Ce sont deux defauts differents : un ecran peut
   etre bien rempli a 1100 px et laisser 600 px morts a 1700 px parce que ses
   colonnes sont figees. On rend donc le MEME ecran a DEUX largeurs et on
   compare la largeur REELLEMENT PEINTE. Si elle ne bouge pas, la mise en page
   est statique — et c est exactement ce qu il signale sur la phototheque et
   l explorateur.
   ⚠ On compare la largeur PEINTE (deduite des colonnes vivantes), PAS le cadre
   des elements : le conteneur exterieur s etend toujours a la fenetre, et une
   mesure qui l inclut rend 1100/1100 partout — elle ne peut donc RIEN dire. */
const LARGEURS = [DETACHE ? 1080 : 1400];

/* ── --gros : LA LISTE PLEINE ──────────────────────────────────────────────
   ⚠⚠ SANS CA, LA MESURE DES COLONNES NE VEUT RIEN DIRE — et elle m a trompe.
   Les jeux d epreuve portent 1 a 8 elements. Une grille a qui l on donne huit
   vignettes ne peut PAS en montrer douze par rangee, quelle que soit la
   largeur : on mesure alors la taille du JEU, pas l elasticite de la grille.
   `photos` a repondu << 8 -> 8 colonnes >> et j ai failli conclure a une
   grille figee, alors que son CSS est `auto-fill` et parfaitement correct.
   ➡ On gonfle donc les tableaux du jeu en repetant leurs entrees, avec des
   identifiants distincts pour que rien ne se confonde. */
const GROS = OPT('--gros') ? 120 : 0;   // --gros : liste pleine (les 13 provinces de taxes)
function gonfler(v, prof) {
  if (!GROS || prof > 4) return v;
  if (Array.isArray(v)) {
    if (!v.length || v.length >= GROS) return v.map((x) => gonfler(x, prof + 1));
    const out = [];
    for (let i = 0; i < GROS; i++) {
      const src = v[i % v.length];
      if (src && typeof src === 'object' && !Array.isArray(src)) {
        const c = Object.assign({}, src);
        /* Les identifiants doivent differer : deux lignes de meme id peuvent
           etre dedupliquees par la fenetre, et l on remesurerait le jeu court. */
        for (const k of ['id', 'cle', 'ref', 'sku', 'code']) {
          if (typeof c[k] === 'string') c[k] = c[k] + '_' + i;
        }
        out.push(c);
      } else out.push(src);
    }
    return out;
  }
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) o[k] = gonfler(v[k], prof + 1);
    return o;
  }
  return v;
}

/* ── LE GABARIT, DECOUPE COMME DANS LE BANC DE CONTRASTE ─────────────────── */
const GABARIT = fs.readFileSync(path.join(__dirname, 'banc-contraste-rendu-page.html'), 'utf8');
const _morceau = (marque) => {
  const parts = GABARIT.split('<!-- ==== ' + marque + ' ==== -->');
  if (parts.length < 2) throw new Error('gabarit sans morceau ' + marque);
  return parts[1].split('<!-- ==== ')[0].trim();
};
const PROLOGUE_BRUT = _morceau('PROLOGUE');
const EPILOGUE_BRUT = _morceau('EPILOGUE');

const OPS_SOCLE = { 'session:activite': { ok: true }, 'lots:etat': { ok: true, lots: [] } };

const prologue = (jeu) =>
  PROLOGUE_BRUT.replace('__REPONSES__',
    () => JSON.stringify(Object.assign({}, OPS_SOCLE, gonfler(jeu.reponses || {}, 0))));

/* ⚠ REMPLACEMENT PAR FONCTION, ET CE N'EST PAS UN DETAIL : dans une chaine de
   remplacement, `$&` et consorts sont des motifs. Un coeur qui en contiendrait
   un seul serait recopie de travers, sans un mot. */
const epilogue = (nom, mode) => EPILOGUE_BRUT
  .replace('__COEUR__', () => COEUR)
  .split('__CONTEXTE__').join(JSON.stringify(nom + '/' + mode))
  .split('__NOM__').join(JSON.stringify(nom));

/* ── CHROME ──────────────────────────────────────────────────────────────── */
function trouverChrome() {
  const cands = [
    path.join(process.env['ProgramFiles'] || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['LOCALAPPDATA'] || '', 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const c of cands) { try { if (c && fs.existsSync(c)) return c; } catch (e) {} }
  return null;
}

/* ⚠⚠ LE MENAGE QUI NE FAISAIT RIEN — MESURE LE 2026-09-19 : apres deux passages
   de ce banc, 260 processus chrome.exe etaient encore en vie et la machine
   n'avait plus que 0,33 Go libres sur 15,6.
   La cause est une PARTICULARITE DE WINDOWS, deja trouvee et deja corrigee dans
   le banc voisin (banc-contraste-rendu.js) : Chrome s'y RELANCE dans un second
   processus et le premier rend la main tout de suite. Le numero rendu par
   `spawn` n'est donc plus celui du navigateur — pire, son `exit` retirait le
   numero de PIDS, si bien que `tuerNosChrome` parcourait un ensemble VIDE et
   rapportait un succes sans rien tuer. Un menage qui se termine bien n'est pas
   un menage qui a eu lieu.
   ➡ On RETROUVE le vrai navigateur par son dossier temporaire (le jeton), et on
   tue SON arbre : le pere par sa ligne de commande, les enfants par le pere
   (les moteurs de rendu ne portent pas `--user-data-dir`, un filtre par dossier
   ne les verrait jamais). Le balayage par numero reste en premier rideau.
   ⚠ Le jeton ne vise QUE nos navigateurs : le poste avait 558 processus chrome
   qui etaient ceux de l'utilisateur, et ils doivent survivre au banc. */
let JETON = null;                      // nom du dossier temporaire de CETTE execution
const PIDS = new Set();

function tuerArbre(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      /* ⚠ ON VERIFIE QUE C'EST ENCORE UN CHROME. Le lanceur Windows meurt en une
         fraction de seconde et son numero peut avoir ete REATTRIBUE : tuer un
         arbre par numero seul, c'est risquer de tuer le processus de quelqu'un
         d'autre. Les deux filtres se cumulent, et taskkill ne tue que ce qui
         satisfait les deux. */
      spawnSync('taskkill', ['/F', '/T', '/FI', 'PID eq ' + pid, '/FI', 'IMAGENAME eq chrome.exe'],
        { stdio: 'ignore', timeout: 30000 });
    } else {
      try { process.kill(-pid, 'SIGKILL'); } catch (e) { try { process.kill(pid, 'SIGKILL'); } catch (e2) {} }
    }
  } catch (e) {}
  PIDS.delete(pid);
}

function tuerNosChrome() {
  for (const pid of Array.from(PIDS)) tuerArbre(pid);
  if (!JETON) return 0;
  try {
    if (process.platform === 'win32') {
      const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
        "@(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | " +
        "Where-Object { $_.CommandLine -like '*" + JETON + "*' }) | " +
        'ForEach-Object { $_.ProcessId }',
      ], { encoding: 'utf8', timeout: 60000 });
      const pids = String((r && r.stdout) || '').split(/\s+/).map(Number).filter(Boolean);
      for (const pid of pids) {
        spawnSync('taskkill', ['/F', '/T', '/PID', String(pid)], { stdio: 'ignore', timeout: 30000 });
      }
      return pids.length;
    }
    spawnSync('pkill', ['-f', JETON], { stdio: 'ignore', timeout: 30000 });
  } catch (e) {}
  return 0;
}

let menageFait = false;
const menageFinal = () => { if (menageFait) return; menageFait = true; tuerNosChrome(); };
process.on('exit', menageFinal);
process.on('SIGINT', () => { menageFinal(); process.exit(130); });
process.on('SIGTERM', () => { menageFinal(); process.exit(143); });
process.on('uncaughtException', (e) => { menageFinal(); console.error(e); process.exit(1); });

/* ── LES FENETRES ────────────────────────────────────────────────────────── */
/* ⚠ ON ENUMERE LE DOSSIER, on ne recopie pas une liste : une liste ecrite a la
   main se perime a la premiere fenetre ajoutee, et le banc continue de passer
   au vert en mesurant une application amputee. */
function fenetres() {
  const out = [];
  for (const f of fs.readdirSync(DOS_FEN).filter((x) => x.endsWith('.js')).sort()) {
    const nom = f.replace(/\.js$/, '');
    if (f === 'socle.js') continue;
    if (CHOISIES.length && !CHOISIES.includes(nom)) continue;
    let mod;
    try { mod = require(path.join(DOS_FEN, f)); } catch (e) { continue; }
    const fabrique = Object.values(mod).find((v) => typeof v === 'function');
    if (!fabrique) continue;
    const brut = REPONSES[f];
    let jeu = null;
    if (Array.isArray(brut) && brut.length) jeu = brut[Math.min(JEU_N, brut.length - 1)];
    else if (brut && typeof brut === 'object') jeu = { id: '', reponses: brut };
    else jeu = { id: '', reponses: {} };
    out.push({ nom, fabrique, jeu });
  }
  /* ⚠ LE TEMOIN (2026-10-11) : une page qui deborde EXPRES — un bouton 1500 px plus bas que la
     fenetre, hors de toute zone qui defile. Le premier passage complet a rendu « 0 debordement »
     sur 108 fenetres : un zero partout ne prouve rien tant que la sonde n'a pas montre qu'elle
     VOIT un debordement. Si le temoin n'est pas releve, le banc echoue. */
  out.push({ nom: '_temoin', jeu: { id: '', reponses: {} }, fabrique: () =>
    '<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">'
    + '<div style="height:2300px"></div><button id="temoin-bas">Hors champ</button></body></html>' });
  return out;
}

function pagePilote(adresses, largeur) {
  const liste = JSON.stringify(adresses);
  return '<!doctype html><meta charset="utf-8"><title>banc-debordement</title>\n'
    + '<style>html,body{margin:0;height:100%}iframe{border:0;width:' + largeur + 'px;height:' + HAUT + 'px}</style>\n'
    + '<iframe id="f"></iframe>\n<script>\n'
    + 'var LISTE = ' + liste + ';\n'
    + 'var i = -1, minuterie = null;\n'
    + 'function suivant() {\n'
    + '  if (minuterie) { clearTimeout(minuterie); minuterie = null; }\n'
    + '  i++;\n'
    + '  if (i >= LISTE.length) {\n'
    + '    console.log("ELG-CR-FIN|" + LISTE.length);\n'
    + '    setTimeout(function () { try { window.close(); } catch (e) {} }, 1500);\n'
    + '    return;\n'
    + '  }\n'
    + '  document.getElementById("f").src = LISTE[i];\n'
    + '  minuterie = setTimeout(function () {\n'
    + '    console.log("ELG-CR|MUETTE " + LISTE[i]);\n'
    + '    suivant();\n'
    + '  }, 4500);\n'
    + '}\n'
    + 'window.addEventListener("message", function (e) { if (e.data === "sz-fini") suivant(); });\n'
    + 'suivant();\n'
    + '</script>';
}

const dormir = (ms) => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} };

function main() {
  const chrome = trouverChrome();
  if (!chrome) { console.error('✗ Chrome introuvable — ce banc ne peut pas mesurer sans navigateur.'); process.exit(1); }

  const liste = fenetres();
  if (!liste.length) { console.error('✗ aucune fenetre a mesurer.'); process.exit(1); }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-deb-'));
  JETON = path.basename(tmp);          // ce qui distingue NOS navigateurs des siens
  const adresses = [];
  let rates = 0;
  for (const f of liste) {
    let brut;
    try { brut = String(f.fabrique(f.jeu.id || '')); }
    catch (e) { rates++; console.error('   ✗ ' + f.nom + ' : la fabrique a leve — ' + e.message); continue; }
    for (const mode of MODES) {
      for (const L of LARGEURS) {
        let page = brut.replace(/<head([^>]*)>/i, (m) => m + '\n' + prologue(f.jeu));
        if (!/<head/i.test(brut)) page = prologue(f.jeu) + brut;
        /* ⚠ LE DERNIER </body>, JAMAIS LE PREMIER : un jeu de reponses peut
           contenir une page HTML entiere (l apercu d un courriel), et le premier
           se trouve alors DANS une chaine. */
        const fin = page.toLowerCase().lastIndexOf('</body>');
        const ep = epilogue(f.nom + '@' + L, mode);
        page = (fin >= 0) ? page.slice(0, fin) + ep + page.slice(fin) : page + ep;
        const nomF = f.nom + '-' + mode + '-' + L + '.html';
        fs.writeFileSync(path.join(tmp, nomF), page, 'utf8');
        adresses.push({ url: nomF + '?m=' + mode, L });
      }
    }
  }

  console.log('== DEBORDEMENTS — mesures au rendu (' + LARGEURS[0] + ' x ' + HAUT + ') ==');
  console.log('   ' + liste.length + ' fenetre(s) x ' + MODES.length + ' mode(s) = '
    + adresses.length + ' rendu(s), par lots de ' + PAR_LOT);

  const lignes = [];
  let lots = 0, lotsMorts = 0;
  /* ⚠ UN LOT NE MELANGE PAS DEUX LARGEURS : la taille de l iframe est posee
     dans la page pilote, une fois pour toutes. Melanger rendrait des mesures
     faites a une largeur sous l etiquette de l autre — le genre de faute qui
     ne se voit jamais dans le resultat. */
  const parLargeur = [];
  for (const L of LARGEURS) {
    const s = adresses.filter((a) => a.L === L);
    for (let d = 0; d < s.length; d += PAR_LOT) parLargeur.push({ L, lot: s.slice(d, d + PAR_LOT) });
  }
  const nbLots = parLargeur.length;
  for (const bloc of parLargeur) {
    const lot = bloc.lot.map((a) => a.url);
    lots++;
    const pilote = path.join(tmp, '_pilote-' + lots + '.html');
    const journal = path.join(tmp, 'chrome-' + lots + '.log');
    const profil = path.join(tmp, 'profil-' + lots);
    fs.writeFileSync(pilote, pagePilote(lot, bloc.L), 'utf8');

    const nav = spawn(chrome, [
      '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
      '--no-first-run', '--no-default-browser-check', '--disable-extensions',
      '--window-size=' + (bloc.L + 100) + ',' + (HAUT + 120),
      '--noerrdialogs', '--disable-crash-reporter', '--disable-breakpad',
      ...(process.env.CI ? ['--no-sandbox'] : []),
      '--enable-logging', '--v=1', '--log-file=' + journal,
      '--user-data-dir=' + profil,
      'file:///' + pilote.replace(/\\/g, '/'),
    ], { stdio: 'ignore', detached: process.platform !== 'win32' });
    if (nav && nav.pid) PIDS.add(nav.pid);
    /* ⚠ ON NE RETIRE PLUS LE NUMERO A LA SORTIE : sous Windows le lanceur meurt
       aussitot, et le retirer vidait PIDS avant tout menage (voir tuerNosChrome). */
    try { nav.on('error', () => PIDS.delete(nav.pid)); nav.unref(); } catch (e) {}

    /* On attend LE TEMOIN, jamais une duree devinee — et un filet contre le
       silence : plus rien pendant 25 s, le moteur est tombe. */
    const jusqua = Date.now() + 20000 + 2500 * lot.length;
    let vusAvant = -1, immobile = Date.now(), fini = false;
    while (Date.now() < jusqua) {
      try {
        if (fs.existsSync(journal)) {
          const txt = fs.readFileSync(journal, 'utf8');
          if (/ELG-CR-FIN\|/.test(txt)) { fini = true; break; }
          const vus = (txt.match(/ELG-CR\|COMPTES/g) || []).length;
          if (vus !== vusAvant) { vusAvant = vus; immobile = Date.now(); }
          else if (Date.now() - immobile > 25000) break;
        }
      } catch (e) {}
      dormir(250);
    }
    try {
      const log = fs.readFileSync(journal, 'utf8');
      for (const l of (log.match(/ELG-CR\|[^\r\n]+/g) || [])) {
        lignes.push(l.slice('ELG-CR|'.length).split('", source:')[0].replace(/["\s]+$/, ''));
      }
    } catch (e) {}
    tuerNosChrome();
    if (!fini) lotsMorts++;
    process.stdout.write('   lot ' + lots + '/' + nbLots + ' (' + bloc.L + 'px)'
      + (fini ? ' ok' : ' MUET') + '\n');
  }

  rapport(lignes, liste.length, rates, lotsMorts);
  if (!GARDER) { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} }
  else console.log('   (dossier garde : ' + tmp + ')');
}

function rapport(lignes, nbFenetres, rates, lotsMorts) {
  const mes = [];
  for (const l of lignes) {
    if (!l.startsWith('DEB|')) continue;
    const p = l.split('|');
    if (p.length < 9) continue;
    const nom = String(p[1]).split('@')[0];
    mes.push({ nom, pageH: +p[3], pageW: +p[4], hors: +p[5], defilants: +p[6], vus: +p[7], detail: p.slice(8).join('|') });
  }
  // Les zones qui defilent, fenetre par fenetre (une fenetre peut avoir plusieurs contextes : on garde le pire).
  const zones = {};
  for (const l of lignes) {
    if (!l.startsWith('ZON|')) continue;
    const p = l.split('|'); const nom = String(p[1]).split('@')[0]; const n = +p[2] || 0;
    if (nom === '_temoin' || !n) continue;
    if (!zones[nom] || n > zones[nom].n) zones[nom] = { n, detail: p.slice(3).join('|') };
  }
  console.log('');
  if (!mes.length) { console.log('✗ AUCUNE MESURE — le banc n a rien vu. Ne pas lire ce silence comme un bon resultat.'); process.exit(1); }
  const fautif = (m) => m.hors > 0 || m.pageH > 2 || m.pageW > 2;
  const tem = mes.find((m) => m.nom === '_temoin');
  if (!tem || !fautif(tem)) { console.log('✗ LE TEMOIN N A PAS ETE VU — la sonde ne detecte pas un debordement certain : ses « 0 » ne valent rien.'); process.exit(1); }
  console.log('   ✓ temoin vu : page H ' + tem.pageH + ' px, ' + tem.hors + ' controle(s) hors d atteinte — la sonde voit un debordement.');
  for (let ti = mes.length - 1; ti >= 0; ti--) if (mes[ti].nom === '_temoin') mes.splice(ti, 1);
  nbFenetres = nbFenetres - 1;
  const cle = DETACHE ? 'detache' : 'principal';
  let dette = {};
  try { dette = (JSON.parse(fs.readFileSync(DETTE_F, 'utf8')) || {})[cle] || {}; } catch (e) { dette = {}; }
  const fautes = mes.filter(fautif).sort((a, b) => (b.hors - a.hors) || (b.pageH - a.pageH));
  console.log('   fenetre                 page H   page L   hors d atteinte   (dans une zone qui defile)   exemples');
  console.log('   ---------------------   ------   ------   ---------------   --------------------------   --------');
  for (const m of fautes) {
    const d = dette[m.nom];
    const etat = !d ? '  ✗ NOUVEAU' : (m.hors > d.hors || m.pageH > d.pageH + 8) ? '  ✗ AGGRAVE' : '  (dette)';
    console.log('   ' + m.nom.padEnd(21) + ' ' + String(m.pageH).padStart(6) + ' ' + String(m.pageW).padStart(8) + ' '
      + String(m.hors).padStart(17) + ' ' + String(m.defilants).padStart(28) + '   ' + m.detail.slice(0, 120) + etat);
  }
  const nouvelles = fautes.filter((m) => { const d = dette[m.nom]; return !d || m.hors > d.hors || m.pageH > d.pageH + 8; });
  const gueries = Object.keys(dette).filter((n) => mes.some((m) => m.nom === n && !fautif(m)));
  console.log('');
  console.log('   ' + mes.length + ' fenetre(s) mesuree(s) sur ' + nbFenetres + (rates ? ' — ' + rates + ' fabrique(s) en echec' : '')
    + ' ; ' + fautes.length + ' deborde(nt), dont ' + nouvelles.length + ' nouveau(x) ou aggrave(s).');
  if (gueries.length) console.log('   ✓ revenues dans le cadre (a retirer de la dette) : ' + gueries.join(', '));
  const pags = lignes.filter((l) => l.startsWith('PAG|') && !/^PAG\|_temoin/.test(l));
  if (pags.length) {
    console.log('');
    console.log('   LISTES EN PAGES (visibles / total — pied) :');
    const vus = new Set();
    for (const l of pags) { const p = l.split('|'); const k = String(p[1]).split('@')[0] + ' ' + p[2]; if (vus.has(k)) continue; vus.add(k); console.log('   ' + k.padEnd(34) + ' ' + String(p[3]).padStart(9) + '   ' + p.slice(4).join('|')); }
  }
  const zn = Object.keys(zones).sort((a, b) => zones[b].n - zones[a].n);
  console.log('');
  console.log('   ZONES QUI DEFILENT (glissiere visible — sa regle : pagination, jamais de barre) : ' + zn.length + ' fenetre(s)');
  for (const n of zn) console.log('   ' + n.padEnd(21) + ' ' + String(zones[n].n).padStart(3) + '   ' + zones[n].detail.slice(0, 150));
  if (lotsMorts) console.log('⚠ ' + lotsMorts + ' lot(s) muet(s) : leurs fenetres manquent a la mesure.');
  if (ECRIRE_DETTE) {
    let tout = {};
    try { tout = JSON.parse(fs.readFileSync(DETTE_F, 'utf8')) || {}; } catch (e) { tout = {}; }
    tout[cle] = {};
    for (const m of fautes) tout[cle][m.nom] = { hors: m.hors, pageH: m.pageH };
    tout._note = 'Debordements CONNUS le jour de leur releve (banc-debordement.js --dette). Le banc echoue sur tout debordement nouveau ou aggrave.';
    fs.writeFileSync(DETTE_F, JSON.stringify(tout, null, 2) + '\n', 'utf8');
    console.log('   dette reecrite : ' + fautes.length + ' fenetre(s) (' + cle + ').');
    return;
  }
  /* 🔴 SA REGLE (2026-10-12) : << aucun scroll bar dans l application >>. A la taille principale et avec les
     jeux ordinaires, une SEULE zone qui defile fait echouer le banc — en fenetre detachee aussi (1080 x 780,
     depuis le 2026-10-12). --gros la nomme sans echouer : les jeux gonfles touchent aussi des ensembles fixes. */
  if (!GROS && zn.length) { console.log('\n>>> ' + zn.length + ' fenetre(s) avec une zone qui DEFILE — paginer (data-pages), jamais de glissiere'); process.exitCode = 1; }
  if (nouvelles.length || lotsMorts) { console.log('\n>>> ' + nouvelles.length + ' debordement(s) nouveau(x) ou aggrave(s)'); process.exitCode = 1; }
  else console.log('\n>>> aucun debordement nouveau');
}

main();
