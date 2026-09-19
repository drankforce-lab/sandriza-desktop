#!/usr/bin/env node
/* ============================================================================
   banc-zones-mortes.js — L'ESPACE PERDU DANS LES FENETRES, MESURE A L'ECRAN
   ----------------------------------------------------------------------------
   POURQUOI IL EXISTE. On veut savoir OU l'application respire mal : quelles
   fenetres laissent de grandes plages vides, ou la largeur s'arrete a
   mi-parcours, ou une bande morte coupe l'ecran en deux. C'est une question de
   MISE EN PAGE, pas de couleur — donc un autre banc.

   ⚠⚠ ET SURTOUT : CETTE QUESTION NE SE POSE PAS AU FICHIER. La lecon de #129 a
   coute un rapport entierement faux — j'avais releve les couleurs LITTERALES
   des 101 fenetres et annonce un defaut que `CSS_THEMES`, appendu en dernier,
   effacait au rendu. Une question de STYLE se pose AU MOTEUR. Un vide se
   mesure pareil : une carte peut avoir `max-width` dans son fichier et occuper
   tout l'ecran chez quelqu'un, ou l'inverse.

   ── CE QU'IL REEMPLOIE, ET CE QU'IL NE TOUCHE PAS ──────────────────────────
   Il reprend le montage EPROUVE de `banc-contraste-rendu.js` : le meme gabarit
   de page (`banc-contraste-rendu-page.html`), les memes jeux de reponses
   (`reponses-fenetres.js`), le meme pilote a iframe, le meme Chrome sans tete
   avec un profil jetable. SEUL LE COEUR DE MESURE CHANGE.
   ⚠ Il ne MODIFIE pas le banc de contraste : un garde de production dont on
   rend le coeur interchangeable est un garde qu'on peut neutraliser sans que
   rien ne le dise.

   ── CE QU'IL COUTE ─────────────────────────────────────────────────────────
   Un mode par defaut (nuit), un scenario par fenetre : ~102 rendus, soit SIX
   lancements de Chrome sequentiels. C'est l'ordre de grandeur de l'etape 1ad
   (7 lancements), qui passe sur ce poste. `--deux-modes` double.

   ── USAGE ──────────────────────────────────────────────────────────────────
     node tools/banc-zones-mortes.js                # toutes, mode nuit
     node tools/banc-zones-mortes.js --deux-modes   # nuit + jour
     node tools/banc-zones-mortes.js --jour         # mode jour seulement
     node tools/banc-zones-mortes.js studio caisse  # quelques fenetres
     node tools/banc-zones-mortes.js --garder       # garde le dossier temporaire
   ============================================================================ */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const RACINE = path.resolve(__dirname, '..');
const DOS_FEN = path.join(RACINE, 'src', 'fenetres');
const REPONSES = require('./reponses-fenetres.js');
const COEUR = fs.readFileSync(path.join(__dirname, 'zones-mortes-coeur.js'), 'utf8');

const ARGS = process.argv.slice(2);
const OPT = (n) => ARGS.includes(n);
const GARDER = OPT('--garder');
const CHOISIES = ARGS.filter((a) => !a.startsWith('--'));
const MODES = OPT('--deux-modes') ? ['nuit', 'jour'] : (OPT('--jour') ? ['jour'] : ['nuit']);
const PAR_LOT = 18;

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
const ELASTIQUE = OPT('--elastique');
const LARGEURS = ELASTIQUE ? [1100, 1700] : [1100];

/* ── --gros : LA LISTE PLEINE ──────────────────────────────────────────────
   ⚠⚠ SANS CA, LA MESURE DES COLONNES NE VEUT RIEN DIRE — et elle m a trompe.
   Les jeux d epreuve portent 1 a 8 elements. Une grille a qui l on donne huit
   vignettes ne peut PAS en montrer douze par rangee, quelle que soit la
   largeur : on mesure alors la taille du JEU, pas l elasticite de la grille.
   `photos` a repondu << 8 -> 8 colonnes >> et j ai failli conclure a une
   grille figee, alors que son CSS est `auto-fill` et parfaitement correct.
   ➡ On gonfle donc les tableaux du jeu en repetant leurs entrees, avec des
   identifiants distincts pour que rien ne se confonde. */
const GROS = OPT('--gros') ? 120 : 0;
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

const PIDS = new Set();
function tuerNosChrome() {
  for (const pid of [...PIDS]) {
    try {
      if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
      else process.kill(-pid, 'SIGKILL');
    } catch (e) {}
    PIDS.delete(pid);
  }
}
process.on('exit', tuerNosChrome);
process.on('SIGINT', () => { tuerNosChrome(); process.exit(130); });

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
    if (Array.isArray(brut) && brut.length) jeu = brut[0];
    else if (brut && typeof brut === 'object') jeu = { id: '', reponses: brut };
    else jeu = { id: '', reponses: {} };
    out.push({ nom, fabrique, jeu });
  }
  return out;
}

function pagePilote(adresses, largeur) {
  const liste = JSON.stringify(adresses);
  return '<!doctype html><meta charset="utf-8"><title>banc-zones-mortes</title>\n'
    + '<style>html,body{margin:0;height:100%}iframe{border:0;width:' + largeur + 'px;height:760px}</style>\n'
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

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-zm-'));
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

  console.log('== ZONES MORTES — mesurees au rendu ==');
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
      '--window-size=' + (bloc.L + 100) + ',900',
      '--noerrdialogs', '--disable-crash-reporter', '--disable-breakpad',
      ...(process.env.CI ? ['--no-sandbox'] : []),
      '--enable-logging', '--v=1', '--log-file=' + journal,
      '--user-data-dir=' + profil,
      'file:///' + pilote.replace(/\\/g, '/'),
    ], { stdio: 'ignore', detached: process.platform !== 'win32' });
    if (nav && nav.pid) PIDS.add(nav.pid);
    try { nav.on('exit', () => PIDS.delete(nav.pid)); nav.on('error', () => PIDS.delete(nav.pid)); nav.unref(); } catch (e) {}

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
  const mesures = [];
  const vides = [];
  const grilles = [];
  for (const l of lignes) {
    if (l.startsWith('ZM|')) {
      const p = l.split('|');
      if (p.length < 18) continue;
      mesures.push({
        contexte: p[1], w: +p[2], h: +p[3], mort: +p[4],
        droite: +p[5], bas: +p[6], gauche: +p[7], haut: +p[8],
        bande: +p[9], bandeOu: +p[10], utileL: +p[11], utileH: +p[12], els: +p[13],
        trouL: +p[14], trouH: +p[15], trouX: +p[16], trouY: +p[17],
      });
    } else if (l.startsWith('GRILLE|')) {
      const p = l.split('|');
      if (p.length < 7) continue;
      grilles.push({ contexte: p[1], rang: +p[2], cols: +p[3], rangees: +p[4], larg: +p[5], n: +p[6] });
    } else if (l.startsWith('ZM-VIDE|')) {
      const p = l.split('|');
      vides.push({ contexte: p[1], pourquoi: p.slice(2).join('|') });
    }
  }

  console.log('');
  if (!mesures.length) {
    console.log('✗ AUCUNE MESURE — le banc n a rien vu. Ne pas lire ce silence comme un bon resultat.');
    process.exit(1);
  }

  /* ⚠ ON CLASSE PAR LE TROU, PAS PAR LE POURCENTAGE. 85 % de vide reparti en
     rembourrages est une page aeree ; 85 % dont un bloc de 600x400 d un seul
     tenant est un defaut de mise en page. Le pourcentage decrit, le rectangle
     DESIGNE — et c est lui qu on va corriger. */
  mesures.sort((a, b) => (b.trouL * b.trouH) - (a.trouL * a.trouH));
  console.log('== LES PLUS GRANDS TROUS (fenetre 1100x760) ==');
  console.log('');
  /* ⚠ LE COMPTE D ELEMENTS EST LA COLONNE QUI EMPECHE DE SE TROMPER DE DEFAUT.
     Un grand trou avec 12 elements, c est un ecran qui n a rien rendu ou une
     liste vide ; le meme trou avec 300 elements, c est une mise en page qui
     laisse un vide MALGRE son contenu. Sans ce nombre, on corrigerait la mise
     en page d un ecran dont le seul tort est d avoir peu de donnees. */
  console.log('   le trou d un seul tenant   ou            vide total   elements   ecran');
  console.log('   ------------------------   -----------   ----------   --------   -----');
  for (const m of mesures.slice(0, 32)) {
    const aire = Math.round(100 * (m.trouL * m.trouH) / (m.w * m.h));
    const t = (m.trouL + ' x ' + m.trouH + ' px  (' + aire + ' % de l ecran)').padEnd(26);
    const ou = ('x' + m.trouX + ' y' + m.trouY).padEnd(13);
    const pct = (m.mort.toFixed(1) + ' %').padStart(8);
    const el = String(m.els).padStart(8);
    console.log('   ' + t + ' ' + ou + ' ' + pct + '   ' + el + '   ' + m.contexte);
  }

  /* ── L ELASTICITE : le contenu suit-il la fenetre ? ───────────────────── */
  if (ELASTIQUE) {
    const par = {};
    for (const m of mesures) {
      const mm = /^(.+)@(\d+)\/(.+)mode?$|^(.+)@(\d+)\/(.+)$/.exec(m.contexte);
      if (!mm) continue;
      const nom = mm[1] || mm[4];
      const L = +(mm[2] || mm[5]);
      const mode = mm[3] || mm[6];
      const cle = nom + '/' + mode;
      (par[cle] = par[cle] || {})[L] = m;
    }
    const rangs = [];
    for (const cle of Object.keys(par)) {
      const a = par[cle][LARGEURS[0]], b = par[cle][LARGEURS[1]];
      if (!a || !b) continue;
      /* ⚠⚠ ON NE MESURE PAS LA << LARGEUR PEINTE >>, ET C EST UNE FAUTE DEJA
         PAYEE DEUX FOIS AUJOURD HUI. La largeur peinte = la fenetre moins ses
         bords morts : une simple barre d en-tete pleine largeur la met a 100 %
         alors que la GRILLE en dessous n a pas bouge d un pixel. On mesurerait
         le DECOR en croyant mesurer le CONTENU — exactement l erreur de la
         colonne << largeur utile >>, et celle de #129 avant elle.
         ➡ LA BONNE QUESTION : la largeur qu on vient d offrir, ou est-elle
         allee ? Si elle finit dans le plus grand trou, le contenu ne suit pas. */
      const offert = b.w - a.w;
      const absorbe = Math.max(0, b.trouL - a.trouL);   // ce que le VIDE a pris
      const part = offert ? Math.max(0, 100 - Math.round(100 * absorbe / offert)) : 100;
      rangs.push({ cle, part, absorbe, offert, ta: a.trouL, tb: b.trouL,
        morta: a.mort, mortb: b.mort });
    }
    rangs.sort((x, y) => x.part - y.part);
    console.log('');
    console.log('== LA LARGEUR OFFERTE VA-T-ELLE AU CONTENU, OU AU VIDE ? ('
      + LARGEURS[0] + 'px -> ' + LARGEURS[1] + 'px) ==');
    console.log('');
    console.log('   au contenu   le trou passe de   absorbe par le vide   vide total   ecran');
    console.log('   ----------   ----------------   -------------------   ----------   -----');
    for (const r of rangs.slice(0, 40)) {
      const s = (r.part + ' %').padStart(10);
      const t = (r.ta + ' -> ' + r.tb + ' px').padEnd(16);
      const ab = (r.absorbe + ' / ' + r.offert + ' px').padEnd(19);
      const vd = (r.morta.toFixed(0) + ' -> ' + r.mortb.toFixed(0) + ' %').padEnd(10);
      console.log('   ' + s + '   ' + t + '   ' + ab + '   ' + vd + '   ' + r.cle);
    }
    /* ⚠⚠ CE TABLEAU-CI EST LE SEUL QUI REPONDE VRAIMENT. Celui du dessus a un
       BIAIS MECANIQUE : le plus grand trou est presque toujours la zone SOUS le
       contenu, et elle s elargit avec la fenetre meme quand la grille au-dessus
       s etire parfaitement. Il accusait 79 ecrans sur 103 — un chiffre qui ne
       voulait rien dire. On le garde pour decrire le vide, PAS pour conclure. */
    const parG = {};
    for (const g of grilles) {
      if (g.rang !== 0) continue;                 // la plus grosse grille seulement
      const mm = /^(.+)@(\d+)\/(.+)$/.exec(g.contexte);
      if (!mm) continue;
      const cle = mm[1] + '/' + mm[3];
      (parG[cle] = parG[cle] || {})[+mm[2]] = g;
    }
    const gr = [];
    for (const cle of Object.keys(parG)) {
      const a = parG[cle][LARGEURS[0]], b = parG[cle][LARGEURS[1]];
      if (!a || !b) continue;
      gr.push({ cle, ca: a.cols, cb: b.cols, la: a.larg, lb: b.larg, n: a.n });
    }
    /* Figee = la grille garde le MEME nombre de colonnes alors qu on lui a
       donne 600 px de plus. C est verifiable, et ca ne peut pas vouloir dire
       autre chose. */
    const figees = gr.filter((g) => g.cb <= g.ca && g.ca > 1);
    const etroites = gr.filter((g) => g.lb <= g.la + 20);
    console.log('');
    console.log('== LES GRILLES GAGNENT-ELLES DES COLONNES ? (la vraie question) ==');
    console.log('');
    console.log('   colonnes     largeur de la grille   elements   ecran');
    console.log('   ----------   --------------------   --------   -----');
    for (const g of gr.sort((x, y) => (x.cb - x.ca) - (y.cb - y.ca)).slice(0, 30)) {
      const c = (g.ca + ' -> ' + g.cb).padEnd(10);
      const L = (g.la + ' -> ' + g.lb + ' px').padEnd(20);
      console.log('   ' + c + '   ' + L + '   ' + String(g.n).padStart(8) + '   ' + g.cle);
    }
    console.log('');
    console.log('   ' + figees.length + ' grille(s) sur ' + gr.length
      + ' NE GAGNENT AUCUNE COLONNE avec 600 px de plus.');
    console.log('   ' + etroites.length + ' grille(s) ne S ELARGISSENT MEME PAS (largeur figee).');
  }

  console.log('');
  console.log('   ' + mesures.length + ' rendu(s) mesure(s) sur ' + nbFenetres + ' fenetre(s)'
    + (rates ? ' — ' + rates + ' fabrique(s) en echec' : ''));
  if (vides.length) {
    console.log('');
    console.log('⚠ ' + vides.length + ' rendu(s) N ONT RIEN DESSINE — ils ne sont PAS dans le classement.');
    console.log('   Une page vide mesure 100 % de vide : la laisser en tete serait le pire des faux positifs.');
    for (const v of vides.slice(0, 12)) console.log('     · ' + v.contexte + ' — ' + v.pourquoi);
  }
  if (lotsMorts) {
    console.log('');
    console.log('⚠ ' + lotsMorts + ' lot(s) n ont pas rendu leur temoin de fin : leurs ecrans manquent au classement.');
  }
}

main();
