#!/usr/bin/env node
/* ============================================================================
   banc-clic-droit.js — LE CLIC DROIT RÉPOND-IL, ET DIT-IL QUELQUE CHOSE ? (2026-10-13)
   ----------------------------------------------------------------------------
   POURQUOI. Sa demande du 2026-10-13 : « passe l'ensemble des fonctions de
   l'administration, et là où tu vois un gain, ajoute le menu contextuel ». Le
   socle pose désormais UN menu partout (JS_CTX : les boutons de la ligne, plus
   « Ouvrir ») ; trois fenêtres ont le leur, et le tableau de bord / les
   cartes-cadeaux un menu propre. Rien ne vérifiait qu'un clic droit, dans
   chacune des 108 fenêtres, ouvre bien un menu LISIBLE sans rien casser.
   ── CE QU'IL REEMPLOIE ─────────────────────────────────────────────────────
   Le montage de banc-debordement.js, RECOPIÉ (même gabarit, mêmes jeux de
   réponses, même pilote à iframe, Chrome sans tête à profil jetable fermé par
   son profil, lots séquentiels). Le cœur est clicdroit-coeur.js.
   ── CE QUI FAIT ÉCHOUER ────────────────────────────────────────────────────
     · une exception levée pendant un clic droit ;
     · une entrée de menu sans libellé (un pictogramme seul) ;
     · le TÉMOIN muet : une page dont la ligne porte un bouton « Modifier » DOIT
       ouvrir un menu qui le propose — sinon les « 0 » du banc ne valent rien.
   Le reste est un INVENTAIRE : par fenêtre, les lignes vues, les menus ouverts,
   les entrées proposées.
   ── USAGE ──────────────────────────────────────────────────────────────────
     node tools/banc-clic-droit.js                 # toutes
     node tools/banc-clic-droit.js coupons tableau # quelques-unes
   ============================================================================ */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const RACINE = path.resolve(__dirname, '..');
const DOS_FEN = path.join(RACINE, 'src', 'fenetres');
const REPONSES = require('./reponses-fenetres.js');
const COEUR = fs.readFileSync(path.join(__dirname, 'clicdroit-coeur.js'), 'utf8');
const DETTE_F = path.join(__dirname, 'debordement-dette.json');

const ARGS = process.argv.slice(2);
const OPT = (n) => ARGS.includes(n);
const GARDER = OPT('--garder');
const CHOISIES = ARGS.filter((a) => !a.startsWith('--'));
const MODES = OPT('--jour') ? ['jour'] : ['nuit'];
const DETACHE = OPT('--detache');
/* SZ_DEB_L / SZ_DEB_H (2026-10-12) : une taille a la main, pour garder de la MARGE sur ce poste — sous Linux
   (travail << contrastes >>) les polices sont plus larges, et ce qui tient ici a 1080 peut y deborder de 47 px. */
const HAUT = Number(process.env.SZ_DEB_H) || (DETACHE ? 780 : 833);
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
const LARGEURS = [Number(process.env.SZ_DEB_L) || (DETACHE ? 1080 : 1400)];

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
  /* ⚠ LE TEMOIN : une ligne qui porte un bouton « Modifier », sous le JS du socle. Si le banc n'y voit pas de
     menu proposant « Modifier », ses relevés ne prouvent rien. */
  const SOCLE = require(path.join(DOS_FEN, 'socle.js'));
  out.push({ nom: '_temoin', jeu: { id: '', reponses: {} }, fabrique: () =>
    '<!doctype html><html><head><meta charset="utf-8"><style>' + SOCLE.CSS_SOCLE + '</style></head><body>'
    + '<table><tbody><tr data-id="t1"><td>Ligne témoin</td><td><button>Modifier</button></td></tr></tbody></table>'
    + '<script>var T=function(x){return x;};' + SOCLE.JS_DIRE() + '<\/script></body></html>' });
  return out;
}

function pagePilote(adresses, largeur) {
  const liste = JSON.stringify(adresses);
  return '<!doctype html><meta charset="utf-8"><title>banc-clic-droit</title>\n'
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

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-ctx-'));
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
        /* SZ_DEB_POLICE (2026-10-12) : imposer une police pour mesurer comme LINUX sur ce poste. Le travail
           << contrastes >> tourne sous Linux, ou la police par defaut (DejaVu Sans) a presque les metriques de
           Verdana — plus large que Segoe UI : ce qui tient ici debordait la-bas de 11 a 47 px. Avant de pousser
           une retouche de mise en page : SZ_DEB_POLICE=Verdana node tools/banc-debordement.js --detache */
        if (process.env.SZ_DEB_POLICE) page = page.replace(/<\/head>/i, (m) => '<style>*{font-family:' + JSON.stringify(process.env.SZ_DEB_POLICE) + ',sans-serif!important}</style>' + m);
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

  console.log('== CLIC DROIT — essayé au rendu (' + LARGEURS[0] + ' x ' + HAUT + ') ==');
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

  rapport(lignes, liste.length, rates, lotsMorts, liste.map((f) => f.nom));
  if (!GARDER) { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} }
  else console.log('   (dossier garde : ' + tmp + ')');
}

function rapport(lignes, nbFenetres, rates, lotsMorts, noms) {
  const mes = [];
  for (const l of lignes) {
    if (!l.startsWith('CTX|')) continue;
    const p = l.split('|');
    mes.push({ nom: String(p[1]).split('@')[0], lignes: +p[2], essayees: +p[3], menus: +p[4], vides: +p[5], entrees: p[6] || '', err: p[7] || '' });
  }
  console.log('');
  if (!mes.length) { console.log('✗ AUCUN RELEVÉ — le banc n a rien vu. Ne pas lire ce silence comme un bon résultat.'); process.exit(1); }
  const tem = mes.find((m) => m.nom === '_temoin');
  if (!tem || !tem.menus || tem.entrees.indexOf('Modifier') < 0) { console.log('✗ LE TÉMOIN N A PAS OUVERT SON MENU — les relevés ne prouvent rien.'); process.exit(1); }
  let fautes = 0;
  const avec = [], sans = [];
  for (const m of mes) {
    if (m.nom === '_temoin') continue;
    if (m.err) { fautes++; console.log('  ✗ ' + m.nom + ' : exception au clic droit — ' + m.err); }
    if (m.vides) { fautes++; console.log('  ✗ ' + m.nom + ' : ' + m.vides + ' entrée(s) sans libellé (pictogramme seul)'); }
    if (m.menus) avec.push(m); else if (m.lignes) sans.push(m);
  }
  console.log('== MENUS OUVERTS (' + avec.length + ' fenêtre(s)) ==');
  for (const m of avec) console.log('  ' + m.nom.padEnd(22) + ' ' + m.menus + '/' + m.essayees + '  ' + m.entrees);
  console.log('');
  console.log('== LIGNES SANS MENU (' + sans.length + ' fenêtre(s) — aucune action sur la ligne : rien à proposer) ==');
  console.log('  ' + sans.map((m) => m.nom).join(', '));
  if (rates) console.log('  (' + rates + ' fabrique(s) en échec)');
  if (lotsMorts) console.log('  ⚠ ' + lotsMorts + ' lot(s) muet(s)');
  console.log('');
  if (fautes) { console.log('>>> ' + fautes + ' faute(s)'); process.exit(1); }
  console.log('✓ CLIC DROIT : témoin vu, ' + avec.length + ' fenêtre(s) avec menu, aucune exception, aucune entrée muette');
}

main();
