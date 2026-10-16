#!/usr/bin/env node
/* ============================================================================
   audit-boutons.js — CHAQUE BOUTON DE CHAQUE FENÊTRE FAIT-IL QUELQUE CHOSE ? (2026-10-15)
   ----------------------------------------------------------------------------
   POURQUOI. Sa demande du 2026-10-15 : « passer un contrôle fin et précis sur
   l'ensemble des fonctions de l'administration afin de t'assurer que le rôle de
   chaque option est fonctionnel ». Les bancs existants regardent la page POSÉE
   (contrastes, débordements, clic droit) ; aucun n'appuyait sur les boutons.
   ⚠ C'EST UN AUDIT, PAS UNE BARRIÈRE : à lancer à la main, il n'est dans aucun
   workflow et rend toujours 0. Il dresse une liste ; c'est un humain qui juge.
   ── CE QU'IL FAIT ──────────────────────────────────────────────────────────
   Pour chaque fenêtre × chaque scénario de reponses-fenetres.js :
     1. INVENTAIRE : la page rendue avec son jeu (faux pont qui rend la réponse
        du jeu, ou {ok:true}), la liste des boutons VISIBLES et ACTIFS (40 au plus) ;
     2. pour CHAQUE bouton : une iframe NEUVE du même scénario, page stable, un
        vrai clic (mousedown, mouseup, click), ~700 ms d'observation —
        exceptions, appels au pont, mutations du DOM, szConfirmer (ACCEPTÉE
        d'office, pour suivre l'action jusqu'à son appel), confirm / prompt /
        open / presse-papier / sélecteur de fichier / téléchargement (NOTÉS) ;
     3. classement : ERREUR (exception) · APPEL (au moins une op) · VISIBLE
        (DOM changé, boîte, effet natif ou hors page) · MUET (rien : suspect) ;
     4. chaque op appelée doit exister dans OPS de assets/js/pont.js (site) ET
        dans OPS_PONT de src/main.js (coquille) — sinon DÉFAUT.
   Le cœur (ce qui tourne dans la page) est audit-boutons-coeur.js.
   ── LE MONTAGE ─────────────────────────────────────────────────────────────
   Celui de banc-clic-droit.js : Chrome sans tête à profil JETABLE, UN SEUL à la
   fois, lots séquentiels, fermé par son profil (on ne tue QUE nos processus).
   Dans ce Chrome, un pilote garde quelques iframes en vol (--paralleles=N, 4 par
   défaut) : c'est toujours un seul navigateur, et chaque iframe est NEUVE.
   ── USAGE ──────────────────────────────────────────────────────────────────
     node tools/audit-boutons.js                     # tout (long : voir --lot)
     node tools/audit-boutons.js coupons caisse      # quelques fenêtres
     node tools/audit-boutons.js --lot=1/4           # le premier quart des fenêtres
     node tools/audit-boutons.js --jeu=0             # le premier scénario seulement
   Options : --paralleles=N (iframes en vol, 4) · --max=N (boutons par rendu, 40)
             --obs=MS (observation après le clic, 700) · --par-lot=N (scénarios
             par Chrome, 12) · --garder (garde le dossier temporaire)
   Rapport : console + tools/audit-boutons-rapport.json. Un passage FILTRÉ (noms,
   --lot, --jeu) FUSIONNE ses fenêtres dans le rapport existant ; un passage
   complet le réécrit.
   ============================================================================ */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const RACINE = path.resolve(__dirname, '..');
const SITE = path.resolve(RACINE, '..', 'Sandriza');
const DOS_FEN = path.join(RACINE, 'src', 'fenetres');
const REPONSES = require('./reponses-fenetres.js');
const COEUR = fs.readFileSync(path.join(__dirname, 'audit-boutons-coeur.js'), 'utf8');
const RAPPORT_F = path.join(__dirname, 'audit-boutons-rapport.json');

const ARGS = process.argv.slice(2);
const OPT = (n) => ARGS.includes(n);
const VAL = (n, d) => { const a = ARGS.find((x) => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3) : d; };
const GARDER = OPT('--garder');
const CHOISIES = ARGS.filter((a) => !a.startsWith('--'));
const JEU_N = VAL('jeu', null) === null ? null : Number(VAL('jeu'));
const PARALLELES = Math.max(1, Math.min(8, Number(VAL('paralleles', 4)) || 4));
const MAXB = Number(VAL('max', 40)) || 40;
const OBS = Number(VAL('obs', 700)) || 700;
const PAR_LOT = Number(VAL('par-lot', 12)) || 12;
const LOT = (() => { const v = VAL('lot', ''); const m = /^(\d+)\/(\d+)$/.exec(v); return m ? { k: +m[1], n: +m[2] } : null; })();
const LARGEUR = 1400, HAUT = 833;
const FILTRE = !!(CHOISIES.length || LOT || JEU_N !== null);

/* Les appels qui partent SANS geste de l'usager (minuteries du socle) : ils ne
   font pas d'un bouton un bouton « qui appelle ». */
const OPS_FOND = new Set(['session:activite', 'lots:etat', 'verrous:liste', 'brouillon:ecrire']);
const OPS_SOCLE = { 'session:activite': { ok: true }, 'lots:etat': { ok: true, lots: [] } };

/* ── LES DEUX FRAGMENTS DU CŒUR ──────────────────────────────────────────── */
const _morceau = (marque) => {
  const parts = COEUR.split('/* ==== ' + marque + ' ==== */');
  if (parts.length < 2) throw new Error('cœur sans morceau ' + marque);
  return parts[1].split('/* ==== ')[0].trim();
};
const PROLOGUE_BRUT = _morceau('PROLOGUE');
const EPILOGUE_BRUT = _morceau('EPILOGUE');
/* ⚠ REMPLACEMENT PAR FONCTION : dans une chaîne de remplacement, « $& » est un motif. */
const prologue = (jeu) => '<script>\n' + PROLOGUE_BRUT.replace('__REPONSES__',
  () => JSON.stringify(Object.assign({}, OPS_SOCLE, jeu.reponses || {}, { __emprunts: jeu.emprunts || {} })).replace(/<\/script/gi, '<\\/script')) + '\n</script>';
const epilogue = (nom, scen) => '<script>\n' + EPILOGUE_BRUT
  .split('__NOM__').join(JSON.stringify(nom))
  .split('__SCEN__').join(JSON.stringify(scen)) + '\n</script>';

/* ── LES DEUX LISTES D'OPÉRATIONS ────────────────────────────────────────── */
function opsDuSite() {
  const src = fs.readFileSync(path.join(SITE, 'assets', 'js', 'pont.js'), 'utf8');
  const d = src.indexOf('const OPS = {');
  if (d < 0) throw new Error('pont.js : « const OPS = { » introuvable');
  const f = src.indexOf('\n  };', d);
  const bloc = src.slice(d, f);
  const s = new Set();
  for (const m of bloc.matchAll(/^\s*'([^'\n]+)'\s*:/gm)) s.add(m[1]);
  return s;
}
function opsDeLaCoquille() {
  const src = fs.readFileSync(path.join(RACINE, 'src', 'main.js'), 'utf8');
  const d = src.indexOf('const OPS_PONT = new Set([');
  if (d < 0) throw new Error('main.js : « const OPS_PONT = new Set([ » introuvable');
  const f = src.indexOf('\n]);', d);
  const bloc = src.slice(d, f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const s = new Set();
  for (const m of bloc.matchAll(/'([^'\n]+)'/g)) s.add(m[1]);
  return { set: s, src };
}

/* ── CHROME (recopié de banc-clic-droit.js : on ne tue que NOS navigateurs) ── */
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
let JETON = null;
const PIDS = new Set();
function tuerArbre(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/F', '/T', '/FI', 'PID eq ' + pid, '/FI', 'IMAGENAME eq chrome.exe'], { stdio: 'ignore', timeout: 30000 });
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
        "Where-Object { $_.CommandLine -like '*" + JETON + "*' }) | ForEach-Object { $_.ProcessId }",
      ], { encoding: 'utf8', timeout: 60000 });
      const pids = String((r && r.stdout) || '').split(/\s+/).map(Number).filter(Boolean);
      for (const pid of pids) spawnSync('taskkill', ['/F', '/T', '/PID', String(pid)], { stdio: 'ignore', timeout: 30000 });
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

/* ── LES FENÊTRES ET LEURS SCÉNARIOS (énumérés, jamais recopiés) ───────────── */
function fenetres() {
  let noms = fs.readdirSync(DOS_FEN).filter((x) => x.endsWith('.js') && x !== 'socle.js').sort().map((f) => f.replace(/\.js$/, ''));
  if (CHOISIES.length) {
    const inconnues = CHOISIES.filter((c) => !noms.includes(c) && c !== '_temoin');
    if (inconnues.length) console.log('   ⚠ fenêtre(s) inconnue(s) : ' + inconnues.join(', '));
    noms = noms.filter((n) => CHOISIES.includes(n));
  }
  if (LOT) {
    const t = Math.ceil(noms.length / LOT.n);
    noms = noms.slice((LOT.k - 1) * t, LOT.k * t);
  }
  const out = [];
  for (const nom of noms) {
    let mod;
    try { mod = require(path.join(DOS_FEN, nom + '.js')); } catch (e) { out.push({ nom, rate: 'require : ' + e.message, cas: [] }); continue; }
    const fabrique = Object.values(mod).find((v) => typeof v === 'function');
    if (!fabrique) continue;
    const brut = REPONSES[nom + '.js'];
    let cas;
    if (Array.isArray(brut) && brut.length) {
      /* ⚠ LES EMPRUNTS (2026-10-16). Chaque scénario ne simule que l'onglet qu'il
         dessine ; un clic sur l'onglet VOISIN recevait {ok:true} vide et
         l'audit criait à l'exception — les 85 « erreurs » de la 52ᵉ séance, toutes
         de ce type. Une op absente d'un scénario reçoit donc la réponse d'un
         scénario voisin de la MÊME fenêtre (de préférence une qui réussit),
         marquée « ~ » dans le rapport. Rien n'est emprunté hors de la fenêtre, et
         reponses-fenetres.js n'est pas modifié : les autres bancs ne voient rien. */
      const voisines = {};
      for (const j of brut) for (const [op, r] of Object.entries(j.reponses || {}))
        if (!(op in voisines) || (voisines[op] && voisines[op].ok === false && !(r && r.ok === false))) voisines[op] = r;
      cas = brut.map((j, i) => {
        const emprunts = {};
        for (const [op, r] of Object.entries(voisines)) if (!(op in (j.reponses || {}))) emprunts[op] = r;
        return { i, nom: j.nom || ('cas ' + i), jeu: Object.assign({}, j, { emprunts }) };
      });
    }
    else if (brut && typeof brut === 'object') cas = [{ i: 0, nom: 'unique', jeu: { id: '', reponses: brut } }];
    else cas = [{ i: 0, nom: 'sans jeu', jeu: { id: '', reponses: {} } }];
    if (JEU_N !== null) cas = cas.filter((c) => c.i === Math.min(JEU_N, cas.length - 1));
    out.push({ nom, fabrique, cas });
  }
  /* ⚠ LE TÉMOIN : quatre boutons dont on CONNAÎT la réponse, sous le JS du socle.
     Si le banc ne les classe pas MUET / VISIBLE / APPEL / ERREUR, ses relevés
     ne valent rien — et c'est surtout le MUET qui compte : un écouteur global
     du socle qui toucherait au DOM à chaque clic ferait passer tous les muets
     pour vivants. */
  {
    const SOCLE = require(path.join(DOS_FEN, 'socle.js'));
    out.push({ nom: '_temoin', cas: [{ i: 0, nom: 'témoin', jeu: { id: '', reponses: {} } }], fabrique: () =>
      '<!doctype html><html><head><meta charset="utf-8"><style>' + SOCLE.CSS_SOCLE + '</style></head><body>'
      + '<button id="t-muet">Muet</button><button id="t-vis">Visible</button>'
      + '<button id="t-appel">Appel</button><button id="t-err">Erreur</button><div id="t-sortie"></div>'
      + '<script>var T=function(x){return x;};var P=window.szPont;' + SOCLE.JS_DIRE()
      + 'document.getElementById("t-vis").onclick=function(){document.getElementById("t-sortie").textContent="vu";};'
      + 'document.getElementById("t-appel").onclick=function(){szConfirmer({titre:"Témoin",oui:"Oui"}).then(function(ok){if(ok)P.appeler("temoin:op",1);});};'
      + 'document.getElementById("t-err").onclick=function(){null.x();};'
      + '<\/script></body></html>' });
  }
  return out;
}

function pagePilote(pages) {
  return '<!doctype html><meta charset="utf-8"><title>audit-boutons</title>\n'
    + '<style>html,body{margin:0}iframe{position:absolute;left:0;top:0;border:0;width:' + LARGEUR + 'px;height:' + HAUT + 'px;background:#fff}</style>\n'
    + '<script>\n'
    + 'var PAGES = ' + JSON.stringify(pages) + ', N = ' + PARALLELES + ', MAX = ' + MAXB + ', OBS = ' + OBS + ';\n'
    + 'var file = PAGES.map(function (u) { return { u: u, b: -1 }; });\n'
    + 'var cases = [], finDite = false;\n'
    + 'function dire(x) { console.log("ELG-AB|" + encodeURIComponent(JSON.stringify(x))); }\n'
    + 'function lancer(c) {\n'
    + '  if (c.timer) { clearTimeout(c.timer); c.timer = null; }\n'
    + '  if (c.f) { try { c.f.remove(); } catch (e) {} c.f = null; }\n'
    + '  if (!file.length) { c.t = null; finir(); return; }\n'
    + '  var t = file.shift(); c.t = t;\n'
    + '  var f = document.createElement("iframe"); c.f = f;\n'
    + '  f.src = t.u + "?b=" + t.b + "&max=" + MAX + "&obs=" + OBS;\n'
    + '  document.body.appendChild(f);\n'
    + '  c.timer = setTimeout(function () { dire({ mode: "delai", u: t.u, b: t.b }); lancer(c); }, 12000 + OBS);\n'
    + '}\n'
    + 'function finir() {\n'
    + '  if (finDite) return;\n'
    + '  for (var i = 0; i < cases.length; i++) if (cases[i].t) return;\n'
    + '  if (file.length) return;\n'
    + '  finDite = true; console.log("ELG-AB-FIN|" + PAGES.length);\n'
    + '}\n'
    + 'window.addEventListener("message", function (e) {\n'
    + '  if (!e.data || !e.data.ab) return;\n'
    + '  var c = null;\n'
    + '  for (var i = 0; i < cases.length; i++) if (cases[i].f && cases[i].f.contentWindow === e.source) c = cases[i];\n'
    + '  if (!c || !c.t) return;\n'
    + '  var x = e.data.x; x.u = c.t.u; dire(x);\n'
    + '  if (x.mode === "inv" && !x.panne) { var n = Math.min(x.total || 0, MAX); for (var k = 0; k < n; k++) file.push({ u: c.t.u, b: k }); }\n'
    + '  var cc = c; setTimeout(function () { lancer(cc); }, 0);\n'
    + '});\n'
    + 'window.addEventListener("load", function () { for (var i = 0; i < N; i++) { var c = {}; cases.push(c); lancer(c); } });\n'
    + '</script>';
}

const dormir = (ms) => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} };

function lireNouveau(journal, etat) {
  try {
    const st = fs.statSync(journal);
    if (st.size <= etat.pos) return '';
    const fd = fs.openSync(journal, 'r');
    const buf = Buffer.alloc(st.size - etat.pos);
    fs.readSync(fd, buf, 0, buf.length, etat.pos);
    fs.closeSync(fd);
    etat.pos = st.size;
    const txt = etat.reste + buf.toString('utf8');
    const k = txt.lastIndexOf('\n');
    etat.reste = k >= 0 ? txt.slice(k + 1) : txt;
    return k >= 0 ? txt.slice(0, k + 1) : '';
  } catch (e) { return ''; }
}

function main() {
  const t0 = Date.now();
  const chrome = trouverChrome();
  if (!chrome) { console.error('✗ Chrome introuvable.'); process.exit(0); }
  const liste = fenetres();
  if (!liste.length) { console.error('✗ aucune fenêtre.'); process.exit(0); }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-ab-'));
  JETON = path.basename(tmp);
  const pages = [];             // { fic, nom, scen }
  const rates = [];
  for (const f of liste) {
    if (f.rate) { rates.push(f.nom + ' : ' + f.rate); continue; }
    for (const c of f.cas) {
      let brut;
      try { brut = String(f.fabrique(c.jeu.id || '')); }
      catch (e) { rates.push(f.nom + ' / ' + c.nom + ' : la fabrique a levé — ' + e.message); continue; }
      let page = /<head[^>]*>/i.test(brut) ? brut.replace(/<head([^>]*)>/i, (m) => m + '\n' + prologue(c.jeu)) : prologue(c.jeu) + brut;
      /* ⚠ LE DERNIER </body> : un jeu peut porter une page HTML entière dans une chaîne. */
      const fin = page.toLowerCase().lastIndexOf('</body>');
      const ep = epilogue(f.nom, c.nom);
      page = (fin >= 0) ? page.slice(0, fin) + ep + page.slice(fin) : page + ep;
      const fic = f.nom + '--' + c.i + '.html';
      fs.writeFileSync(path.join(tmp, fic), page, 'utf8');
      pages.push({ fic, nom: f.nom, scen: c.nom });
    }
  }
  const nbLots = Math.ceil(pages.length / PAR_LOT);
  console.log('== AUDIT DES BOUTONS — ' + liste.length + ' fenêtre(s), ' + pages.length + ' scénario(s), '
    + nbLots + ' lot(s) de ' + PAR_LOT + ', ' + PARALLELES + ' iframe(s) en vol, observation ' + OBS + ' ms ==');

  const res = [];
  let lotsMorts = 0;
  for (let l = 0; l < nbLots; l++) {
    const lot = pages.slice(l * PAR_LOT, (l + 1) * PAR_LOT);
    const tl = Date.now();
    const pilote = path.join(tmp, '_pilote-' + l + '.html');
    const journal = path.join(tmp, 'chrome-' + l + '.log');
    const profil = path.join(tmp, 'profil-' + l);
    fs.writeFileSync(pilote, pagePilote(lot.map((p) => p.fic)), 'utf8');
    const nav = spawn(chrome, [
      '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
      '--no-first-run', '--no-default-browser-check', '--disable-extensions',
      '--window-size=' + (LARGEUR + 100) + ',' + (HAUT + 120),
      '--noerrdialogs', '--disable-crash-reporter', '--disable-breakpad',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
      ...(process.env.CI ? ['--no-sandbox'] : []),
      '--enable-logging', '--v=0', '--log-file=' + journal,
      '--user-data-dir=' + profil,
      'file:///' + pilote.replace(/\\/g, '/'),
    ], { stdio: 'ignore', detached: process.platform !== 'win32' });
    if (nav && nav.pid) PIDS.add(nav.pid);
    try { nav.on('error', () => PIDS.delete(nav.pid)); nav.unref(); } catch (e) {}

    const etat = { pos: 0, reste: '' };
    let fini = false, immobile = Date.now(), vus = 0;
    const plafond = Date.now() + 60 * 60 * 1000;
    while (Date.now() < plafond) {
      const txt = lireNouveau(journal, etat);
      if (txt) {
        for (const m of txt.matchAll(/ELG-AB\|([^"\s]+)/g)) {
          try { const x = JSON.parse(decodeURIComponent(m[1])); res.push(x); vus++; immobile = Date.now(); } catch (e) {}
        }
        if (/ELG-AB-FIN\|/.test(txt)) { fini = true; break; }
      }
      if (Date.now() - immobile > 45000) break;   // plus rien depuis 45 s : le moteur est tombé
      dormir(300);
    }
    tuerNosChrome();
    if (!fini) lotsMorts++;
    const noms = Array.from(new Set(lot.map((p) => p.nom))).join(' ');
    console.log('   lot ' + (l + 1) + '/' + nbLots + (fini ? ' ok' : ' MUET') + '  ' + vus + ' relevé(s) en '
      + Math.round((Date.now() - tl) / 1000) + ' s  [' + noms.slice(0, 90) + ']');
  }
  const duree = Math.round((Date.now() - t0) / 1000);
  rapport(res, pages, rates, lotsMorts, duree, liste.map((f) => f.nom));
  if (!GARDER) { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} }
  else console.log('   (dossier gardé : ' + tmp + ')');
  process.exit(0);
}

/* ── LE CLASSEMENT ────────────────────────────────────────────────────────── */
function classer(x) {
  if (x.panne) return 'ERREUR';
  if (x.err && x.err.length) return 'ERREUR';
  const ops = (x.ops || []).filter((o) => !OPS_FOND.has(o.op));
  if (ops.length) return 'APPEL';
  if ((x.muts && x.muts.n) || (x.conf && x.conf.length) || (x.hors && x.hors.length) || (x.natifs && x.natifs.length) || x.coche || x.valeur) return 'VISIBLE';
  return 'MUET';
}

function rapport(res, pages, rates, lotsMorts, duree, nomsFen) {
  const parFic = {};
  for (const p of pages) parFic[p.fic] = p;
  const site = opsDuSite();
  const coq = opsDeLaCoquille();
  const F = {};      // par fenêtre
  const fen = (n) => F[n] || (F[n] = { essayes: 0, classes: { ERREUR: 0, APPEL: 0, VISIBLE: 0, MUET: 0 }, erreurs: [], muets: [],
    visibles: [], appels: [], errCharge: [], ops: {}, delais: [], instables: [], tronques: [], bruit: [], inventaire: {} });
  const inv = {};    // fic -> inventaire
  for (const x of res) if (x.mode === 'inv') inv[x.u] = x;

  for (const x of res) {
    const p = parFic[x.u] || { nom: x.nom || '?', scen: x.scen || '?' };
    const W = fen(p.nom);
    if (x.mode === 'delai') { W.delais.push(p.scen + (x.b >= 0 ? ' / bouton ' + x.b : ' / inventaire')); continue; }
    if (x.mode === 'inv') {
      W.inventaire[p.scen] = x.total;
      if (x.couverts) { W.couverts = (W.couverts || 0) + x.couverts; (W.couvertsEx = W.couvertsEx || []).push(p.scen + ' : ' + (x.couvEx || []).join(' ; ')); }
      if (x.bruit) W.bruit.push(p.scen + ' : ' + x.bruit + ' mutation(s) sans geste (' + (x.bruitEx || []).join(' ; ') + ')');
      if (x.total > MAXB) W.tronques.push(p.scen + ' (' + x.total + ' boutons, ' + MAXB + ' essayés)');
      for (const e of (x.errCharge || [])) W.errCharge.push(p.scen + ' : ' + e);
      for (const o of (x.opsCharge || [])) { const op = o.replace(/\*$/, ''); W.ops[op] = W.ops[op] || { charge: 0, clic: 0 }; W.ops[op].charge++; }
      if (x.panne) W.erreurs.push({ scen: p.scen, bouton: '(inventaire)', msg: x.panne });
      continue;
    }
    if (x.absent) { W.instables.push(p.scen + ' / bouton ' + x.b + ' absent au rechargement'); continue; }
    W.essayes++;
    const k = classer(x);
    W.classes[k]++;
    const i = inv[x.u];
    const attendu = i && i.boutons && i.boutons[x.b];
    if (attendu && attendu.l !== x.l) W.instables.push(p.scen + ' / bouton ' + x.b + ' : « ' + attendu.l + ' » devenu « ' + x.l + ' »');
    const bouton = (x.l || '(sans libellé)') + '  {' + x.s + '}';
    for (const o of (x.ops || [])) { W.ops[o.op] = W.ops[o.op] || { charge: 0, clic: 0 }; W.ops[o.op].clic++; }
    if (k === 'ERREUR') {
      const defaut = (x.ops || []).some((o) => !o.jeu && !OPS_FOND.has(o.op));
      W.erreurs.push({ scen: p.scen, bouton, msg: (x.err || [x.panne]).join(' / '),
        ops: (x.ops || []).map((o) => o.op + (o.jeu === 'emprunt' ? '~' : o.jeu ? '' : '*')), reponseParDefaut: defaut, instable: !!x.instable });
    } else if (k === 'MUET') {
      W.muets.push({ scen: p.scen, bouton, dejaActif: !!x.deja, focus: x.focus || '', instable: !!x.instable });
    } else if (k === 'APPEL') {
      W.appels.push({ scen: p.scen, bouton, ops: (x.ops || []).filter((o) => !OPS_FOND.has(o.op)).map((o) => o.op + (o.jeu === 'emprunt' ? '~' : o.jeu ? '' : '*') + ' ' + o.args),
        conf: (x.conf || []).map((c) => c.titre + ' → ' + c.oui), hors: x.hors || [] });
    } else {
      W.visibles.push({ scen: p.scen, bouton, muts: x.muts ? x.muts.n : 0, ex: x.muts ? x.muts.ex : [], coche: !!x.coche, valeur: !!x.valeur,
        conf: (x.conf || []).map((c) => c.titre + ' → ' + c.oui), hors: x.hors || [], natifs: x.natifs || [] });
    }
  }

  /* Le témoin d'abord : s'il ne répond pas comme attendu, le reste ne vaut rien. */
  let temoinOk = true;
  const T = F._temoin;
  if (T) {
    const vu = (lib, k) => {
      if (k === 'MUET') return T.muets.some((m) => m.bouton.startsWith(lib));
      if (k === 'ERREUR') return T.erreurs.some((m) => m.bouton.startsWith(lib));
      if (k === 'APPEL') return T.appels.some((m) => m.bouton.startsWith(lib) && m.ops.some((o) => o.startsWith('temoin:op')) && m.conf.length);
      return T.visibles.some((m) => m.bouton.startsWith(lib));
    };
    const att = [['Muet', 'MUET'], ['Visible', 'VISIBLE'], ['Appel', 'APPEL'], ['Erreur', 'ERREUR']];
    const rates2 = att.filter(([l, k]) => !vu(l, k));
    temoinOk = !rates2.length;
    if (!temoinOk) console.log('✗ LE TÉMOIN N’EST PAS CLASSÉ COMME ATTENDU (' + rates2.map((r) => r[0]).join(', ') + ') — les relevés ci-dessous ne prouvent rien.');
    delete F._temoin;
  }

  /* Les ops : présentes des DEUX côtés ? */
  const toutesOps = {};
  for (const n of Object.keys(F)) for (const op of Object.keys(F[n].ops)) (toutesOps[op] = toutesOps[op] || new Set()).add(n);
  const inconnues = [];
  for (const op of Object.keys(toutesOps).sort()) {
    const s = site.has(op), c = coq.set.has(op);
    if (s && c) continue;
    inconnues.push({ op, site: s, coquille: c, ailleursDansMain: !c && coq.src.includes("'" + op + "'"), fenetres: Array.from(toutesOps[op]) });
  }

  const tot = { fenetres: 0, scenarios: 0, boutons: 0, ERREUR: 0, APPEL: 0, VISIBLE: 0, MUET: 0, opsInconnues: inconnues.length, delais: 0, erreursAuChargement: 0 };
  for (const n of Object.keys(F)) {
    const W = F[n];
    tot.fenetres++; tot.scenarios += Object.keys(W.inventaire).length; tot.boutons += W.essayes;
    for (const k of ['ERREUR', 'APPEL', 'VISIBLE', 'MUET']) tot[k] += W.classes[k];
    tot.delais += W.delais.length; tot.erreursAuChargement += W.errCharge.length;
  }

  /* ── CONSOLE ── */
  const L = console.log;
  L('');
  L('== RÉSUMÉ ==  ' + tot.fenetres + ' fenêtres · ' + tot.scenarios + ' scénarios · ' + tot.boutons + ' boutons actionnés en ' + Math.floor(duree / 60) + ' min ' + (duree % 60) + ' s');
  L('   ERREUR ' + tot.ERREUR + ' · APPEL ' + tot.APPEL + ' · VISIBLE ' + tot.VISIBLE + ' · MUET ' + tot.MUET
    + ' · ops inconnues d’un côté ' + tot.opsInconnues + ' · délais ' + tot.delais + ' · erreurs au chargement ' + tot.erreursAuChargement
    + (lotsMorts ? ' · ⚠ ' + lotsMorts + ' lot(s) muet(s)' : '') + (temoinOk ? ' · témoin vu' : ' · ✗ TÉMOIN RATÉ'));
  if (rates.length) { L(''); L('== FABRIQUES EN ÉCHEC =='); rates.forEach((r) => L('  ✗ ' + r)); }
  L('');
  L('== OPS INCONNUES D’UN CÔTÉ (' + inconnues.length + ') ==');
  for (const o of inconnues) L('  ✗ ' + o.op.padEnd(34) + (o.site ? '' : ' ABSENTE du site (pont.js)') + (o.coquille ? '' : ' ABSENTE de OPS_PONT (main.js)' + (o.ailleursDansMain ? ' — citée ailleurs dans main.js' : '')) + '  ← ' + o.fenetres.join(', '));
  L('');
  L('== PAR FENÊTRE ==   (* = op répondue par défaut {ok:true}, absente du jeu)');
  for (const n of Object.keys(F).sort()) {
    const W = F[n], c = W.classes;
    L('  ' + n.padEnd(20) + String(W.essayes).padStart(4) + ' bouton(s)  E ' + c.ERREUR + ' · A ' + c.APPEL + ' · V ' + c.VISIBLE + ' · M ' + c.MUET
      + (W.couverts ? ' · sous surcouche (non essayés) ' + W.couverts : '') + (W.delais.length ? ' · délais ' + W.delais.length : '') + (W.instables.length ? ' · instables ' + W.instables.length : ''));
    for (const e of W.erreurs) L('      ✗ ERREUR  [' + e.scen + '] ' + e.bouton + ' — ' + e.msg + (e.reponseParDefaut ? '  (après une réponse PAR DÉFAUT : à confirmer)' : ''));
    for (const e of W.errCharge.slice(0, 3)) L('      ! au chargement : ' + e);
    for (const m of W.muets) L('      · MUET    [' + m.scen + '] ' + m.bouton + (m.dejaActif ? '  (choix déjà actif)' : '') + (m.focus ? '  (focus → ' + m.focus + ')' : ''));
    for (const d of W.delais.slice(0, 5)) L('      ⌛ délai : ' + d);
    for (const d of W.tronques) L('      ✂ tronqué : ' + d);
    for (const d of W.bruit.slice(0, 2)) L('      ~ bruit de fond : ' + d);
    for (const d of W.instables.slice(0, 3)) L('      ≠ instable : ' + d);
    const ops = Object.keys(W.ops).sort();
    if (ops.length) L('      ops : ' + ops.join(', '));
  }
  L('');
  L('== RÉSUMÉ ==  boutons ' + tot.boutons + ' · ERREUR ' + tot.ERREUR + ' · MUET ' + tot.MUET + ' · ops inconnues ' + tot.opsInconnues);

  /* ── FICHIER ── */
  let doc = { date: new Date().toISOString(), fenetres: {} };
  if (FILTRE) { try { const ancien = JSON.parse(fs.readFileSync(RAPPORT_F, 'utf8')); if (ancien && ancien.fenetres) doc.fenetres = ancien.fenetres; } catch (e) {} }
  const date = new Date().toISOString();
  for (const n of Object.keys(F)) doc.fenetres[n] = Object.assign({ date }, F[n]);
  /* Les totaux et les ops inconnues sont RECALCULÉS sur tout ce que contient le fichier (fusion des lots). */
  const T2 = { fenetres: 0, scenarios: 0, boutons: 0, ERREUR: 0, APPEL: 0, VISIBLE: 0, MUET: 0, delais: 0, erreursAuChargement: 0 };
  const ops2 = {};
  for (const n of Object.keys(doc.fenetres)) {
    const W = doc.fenetres[n];
    T2.fenetres++; T2.scenarios += Object.keys(W.inventaire || {}).length; T2.boutons += W.essayes;
    for (const k of ['ERREUR', 'APPEL', 'VISIBLE', 'MUET']) T2[k] += W.classes[k];
    T2.delais += (W.delais || []).length; T2.erreursAuChargement += (W.errCharge || []).length;
    for (const op of Object.keys(W.ops || {})) (ops2[op] = ops2[op] || []).push(n);
  }
  const inconnues2 = Object.keys(ops2).sort().filter((op) => !(site.has(op) && coq.set.has(op)))
    .map((op) => ({ op, site: site.has(op), coquille: coq.set.has(op), fenetres: ops2[op] }));
  T2.opsInconnues = inconnues2.length;
  doc.date = date;
  doc.dernierPassage = { duree_s: duree, fenetres: nomsFen.length, filtre: FILTRE ? ARGS.join(' ') : '', temoin: temoinOk, lotsMuets: lotsMorts, fabriquesEnEchec: rates };
  doc.totaux = T2;
  doc.opsInconnues = inconnues2;
  doc.legende = { ERREUR: 'exception pendant ~' + OBS + ' ms après le clic', APPEL: 'au moins une op du pont (hors minuteries du socle)',
    VISIBLE: 'DOM changé, valeur de champ changée, case cochée, boîte, effet natif (szPont.*) ou hors page (presse-papier, fichier, lien…)', MUET: 'rien du tout : suspect',
    etoile: 'op* = répondue par défaut {ok:true}, absente du jeu de réponses',
    tilde: 'op~ = réponse empruntée à un scénario voisin de la même fenêtre' };
  fs.writeFileSync(RAPPORT_F, JSON.stringify(doc, null, 1), 'utf8');
  L('   rapport : ' + path.relative(RACINE, RAPPORT_F) + (FILTRE ? ' (fusionné : ' + T2.fenetres + ' fenêtre(s) au total)' : ''));
}

main();
