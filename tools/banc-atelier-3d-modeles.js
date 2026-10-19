#!/usr/bin/env node
/* ============================================================================
   banc-atelier-3d-modeles.js — L APERÇU 3D OUVRE LE BON MODÈLE (2026-10-18)
   ----------------------------------------------------------------------------
   Son bogue : « dans l'Atelier, si je suis dans l'Aperçu 3D, que je reviens dans
   la bibliothèque et que j'ouvre un AUTRE modèle en vue 3D, ça me ramène dans
   l'ancien ».

   La vraie fenêtre Atelier, dans Chrome sans tête (invisible : rien ne s affiche
   sur le poste), avec DEUX modèles (un t-shirt A, une chemise B). Pour chaque
   chemin d ouverture de la vue 3D :
     tuile    la tuile « 3D » de la fiche (data-v3)
     mini     le double-clic sur la mini-vue qui tourne
     ctx      le menu contextuel de la carte › Aperçu 3D
     fichier  la fiche du modèle › menu Fichier › Aperçu 3D
     depart   la fenêtre ouverte sur « 3d:A » (DEPART), puis la tuile de B
   on ouvre A en 3D, on revient à la bibliothèque, on ouvre B — et l on exige que
   la vue montre B : le modèle de la vue (V3), le corps calculé (V3.r), ce que le
   moteur WebGL a construit (GLV.r) et ses toiles (GLV.cle), et la sélection, deux
   secondes après encore (rien ne doit revenir à A).

     node tools/banc-atelier-3d-modeles.js
     node tools/banc-atelier-3d-modeles.js --sortie <dossier>   # garde les captures
     SZ_VITE=1 …    on quitte A avant même qu il soit chargé, et l on ouvre B aussitôt
     SZ_PERTE=1 …   le contexte WebGL de la vue 3D est PERDU pendant qu on est dans la bibliothèque (B doit prendre un
                    canevas NEUF), puis encore une fois dans la vue de B (remplacé et redessiné)

   Toujours (le correctif défensif) : JUSTE APRÈS le clic qui ouvre B, avant tout calcul, le canevas ne garde plus rien
   de A (aucun pixel, GLV.dessineId vidé). La perte SILENCIEUSE (contexte perdu, pas encore signalé) ne se provoque pas
   dans SwiftShader : ces deux vérifications en couvrent les deux remèdes.

   Par défaut, on reste 2,6 s dans A (la vignette part et la fenêtre reçoit son actualisation), puis 1,2 s
   dans la bibliothèque (la mini-vue de B tourne) avant d ouvrir B.

   Chaque chemin dans les deux affichages de la bibliothèque (cartes, liste) : Chrome est lancé une fois par
   essai (10 lancements, séquentiels).
   Le site (son cœur 3D) : ../Sandriza ou SZ_SITE.
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const RACINE = path.resolve(__dirname, '..');
const SITE = path.resolve(process.env.SZ_SITE || path.join(RACINE, '..', 'Sandriza'));
process.chdir(RACINE);
const { pageAtelier } = require('../src/fenetres/atelier.js');
const REP = require('./reponses-fenetres.js');
const ARGS = process.argv.slice(2);
const arg = (k) => { const i = ARGS.indexOf(k); return i >= 0 ? ARGS[i + 1] : null; };
const SORTIE = arg('--sortie') ? path.resolve(arg('--sortie')) : null;
const CHEMINS = ['tuile', 'mini', 'ctx', 'fichier', 'depart'];

function chrome() {
  const l = [process.env.SZ_CHROME || '',
    path.join(process.env['ProgramFiles'] || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['LOCALAPPDATA'] || '', 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return l.find((p) => p && fs.existsSync(p));
}
// ne fermer QUE les Chrome lancés par ce banc (leur profil est dans notre dossier temporaire) — jamais celui de l utilisatrice
function fermerNosChrome(tmp) {
  const motif = path.join(tmp, 'profil');
  if (process.platform !== 'win32') { try { spawnSync('pkill', ['-f', motif], { stdio: 'ignore', timeout: 30000 }); } catch (e) {} return; }
  try {
    const r = spawnSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*" + motif.replace(/'/g, "''") + "*' } | Select-Object -ExpandProperty ProcessId"],
      { encoding: 'utf8', timeout: 60000 });
    String(r.stdout || '').split(/\s+/).filter(Boolean).forEach((pid) => spawnSync('taskkill', ['/F', '/T', '/PID', pid], { stdio: 'ignore', timeout: 30000 }));
  } catch (e) {}
}

const jeux = REP['atelier.js'] || (REP.REPONSES && REP.REPONSES['atelier.js']);
const scen = jeux[0];

// les deux modèles, tracés par le vrai cœur du site
const SCRIPT_MODELES = function () {
  var A = window.Atelier, T = ['XS', 'S', 'M', 'L', 'XL'], out = [];
  [['banc_a', 'tshirt', 'T-shirt A', { encolure: 'ronde', manche: 'courte', longueur: 22 }], ['banc_b', 'chemise', 'Chemise B', null]].forEach(function (d) {
    var ap = A.apercuCoeur({ base: d[1], taille: 'M', options: d[3] || undefined });
    var pr = A.preparerCoeur({ base: d[1], options: d[3] || undefined, tailleBase: 'M', pieces: ap.pieces });
    out.push({ id: d[0], createdAt: '2026-10-18T00:00:00Z', updatedAt: '2026-10-18T00:00:00Z', nom: d[2], ref: '', categorie: 'hauts', etat: 'brouillon',
      base: d[1], options: d[3] || {}, aisances: {}, tailleBase: 'M', tailles: T, pieces: pr.pieces, assemblages: pr.assemblages || [], edite: false,
      instantanes: [], motif: null, design3d: null, photo3d: null, planche: null, produitId: '', notes: '', version: 1, versions: [{ n: 1, date: '2026-10-18T00:00:00Z', note: 'banc' }] });
  });
  localStorage.setItem('elg_atelier_modeles', JSON.stringify(out));
  localStorage.setItem('sz-atelier-mannequin', '1');
  localStorage.setItem('sz-atelier-genre', '{}');
  localStorage.setItem('sz-atelier-vue', window.__szB3m.vueb);
};

// le parcours, dans la page (ES5)
const SCRIPT_PAGE = function () {
  var B = window.__szB3m, CH = B.chemin, n0 = Date.now(), etapes = [];
  function log(s) { console.log(s); }
  function envoyer(cle, txt) { var T = 3000; for (var i = 0, k = 0; i < txt.length; i += T, k++) log('B3M|' + cle + '|' + k + '|' + txt.slice(i, i + T)); log('B3M|' + cle + '|fin|'); }
  function fin(err) { if (err) envoyer('erreur', err); envoyer('etapes', JSON.stringify(etapes)); log('B3M-FIN'); }
  function attendre(cond, quoi, puis) { var t0 = Date.now(); (function boucle() { var ok = false; try { ok = cond(); } catch (e) {} if (ok) return puis();
    if (Date.now() - t0 > 30000) { var v = mo() && mo().v3(), g = mo() && mo().glv(); return fin('attente trop longue : ' + quoi + ' ' + JSON.stringify({ vue: mo() && mo().vue(), v3: v && v.id, r: !!(v && v.r), mesh: !!(v && v.mesh), gl: !!g, glr: !!(g && v && g.r === v.r), cle: g && String(g.cle || '').split('|')[0], glNon: v && v.glNon })); } setTimeout(boucle, 100); })(); }
  function clic(el) { if (!el) throw new Error('élément introuvable'); el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); }
  var mo = function () { return window.__szBanc3d.moteur; };
  // l état de la vue 3D : quel modèle, quel corps, ce que WebGL a construit
  function etat(nom) { var v = mo().v3(), g = mo().glv();
    var e = { etape: nom, vue: mo().vue(), sel: mo().sel(), v3: v ? v.id : null, r: v && v.r ? v.r.base : null, glOk: !!(v && g && g.r && g.r === v.r), glBase: g && g.r ? g.r.base : null, cle: g ? String(g.cle || '').split('|')[0] : null, titre: (document.querySelector('.st-etat, #v3-etat') || {}).textContent || '' };
    etapes.push(e); return e; }
  function pret3d(id) { return function () { var v = mo().v3(), g = mo().glv(); return mo().vue() === '3d' && v && v.id === id && v.mesh && g && g.r === v.r && String(g.cle || '').indexOf(id + '|') === 0; }; }
  function image(cle) { log('B3M-ECRAN|' + cle); var cv = document.getElementById('v3-canevas'); if (cv) try { envoyer('img:' + cle, cv.toDataURL('image/png')); } catch (e) {} }
  // 1) A en 3D (par la tuile, ou déjà ouvert par DEPART)
  function etape1() {
    if (CH !== 'depart') { clic(document.querySelector('[data-sel="banc_a"]')); attendre(function () { return document.querySelector('[data-v3="banc_a"]'); }, 'fiche A', function () { clic(document.querySelector('[data-v3="banc_a"]')); suite1(); }); }
    else suite1();
  }
  function suite1() { if (B.vite) { return setTimeout(etape2, 30); } attendre(pret3d('banc_a'), 'vue 3D de A', function () { etat('A ouvert'); image('A'); cvA = document.getElementById('v3-canevas'); setTimeout(etape2, 2600); }); }
  // 2) retour à la bibliothèque
  function etape2() { clic(document.getElementById('v3-retour')); attendre(function () { return mo().vue() === 'biblio'; }, 'retour bibliothèque', function () { etat('retour'); if (B.perte) { var g0 = mo().glv(), x = g0 && g0.gl && g0.gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } setTimeout(etape3, B.vite ? 0 : 1200); }); }
  // 3) B, par le chemin voulu
  function etape3() {
    clic(document.querySelector('[data-sel="banc_b"]'));
    attendre(function () { return document.querySelector('[data-v3="banc_b"]'); }, 'fiche B', function () {
      if (CH === 'tuile' || CH === 'depart') { clic(document.querySelector('[data-v3="banc_b"]')); return etape4(); }
      if (CH === 'mini') return attendre(function () { var m = mo().mini(); return m.id === 'banc_b' && m.v3 && m.cv && m.cv.isConnected; }, 'mini-vue de B', function () {
        mo().mini().cv.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window })); etape4(); });
      if (CH === 'ctx') { var carte = document.querySelector('[data-ctx-ligne="banc_b"]'); var l = window.szCtxEntrees(carte) || [];
        var it = l.filter(function (x) { return x.lib && /3D/.test(x.lib); })[0]; if (!it) return fin('menu contextuel sans « Aperçu 3D »'); it.fn(); return etape4(); }
      if (CH === 'fichier') { clic(document.querySelector('[data-ouvrir="banc_b"]'));
        return attendre(function () { return mo().vue() === 'modele' && document.querySelector('[data-st-menu="fichier"]'); }, 'fiche du modèle B', function () {
          clic(document.querySelector('[data-st-menu="fichier"]'));
          attendre(function () { return [].slice.call(document.querySelectorAll('button, [role="menuitem"]')).some(function (b) { return /^Aperçu 3D/.test((b.textContent || '').trim()); }); }, 'menu Fichier', function () {
            var b = [].slice.call(document.querySelectorAll('button, [role="menuitem"]')).filter(function (x) { return /^Aperçu 3D/.test((x.textContent || '').trim()); })[0]; clic(b); etape4(); }); }); }
    });
  }
  // 4) la vue doit montrer B — et le montrer encore deux secondes plus tard
  // le canevas de la scène : combien de pixels non transparents (0 : effacé)
  function opaques() { var cv = document.getElementById('v3-canevas'); if (!cv || !cv.width) return -1; var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
    var g = c.getContext('2d'); g.drawImage(cv, 0, 0); var d = g.getImageData(0, 0, c.width, c.height).data, n = 0; for (var i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; }
  var cvA = null, imm = null;
  function etape4() {
    // (le correctif défensif) JUSTE APRÈS le clic, avant que B soit calculé : plus rien de A dans le canevas
    var g0 = mo().glv(); imm = { dessineId: g0 ? g0.dessineId : null, opaques: opaques(), memeCanevas: document.getElementById('v3-canevas') === cvA };
    etapes.push({ etape: 'juste après le clic', imm: imm }); var tClic = Date.now(); image('B-juste-apres-le-clic'); setTimeout(function () { image('B-pendant-le-calcul'); }, 200);
    if (imm.dessineId === 'banc_a' || imm.opaques > 0) return fin('l image de A est encore dans le canevas de B : ' + JSON.stringify(imm));
    if (B.perte && imm.memeCanevas) return fin('contexte perdu, et pourtant le canevas de A est repris');
    attendre(pret3d('banc_b'), 'vue 3D de B (elle montre : ' + JSON.stringify((function () { var v = mo().v3(), g = mo().glv(); return { v3: v && v.id, cle: g && g.cle && String(g.cle).split('|')[0] }; })()) + ')', function () {
      etat('B ouvert'); etapes.push({ etape: 'délai du clic à B dessiné', ms: Date.now() - tClic });
      if (B.perte) { var cvB = document.getElementById('v3-canevas'), x = mo().glv().gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); mo().peindre();
        return attendre(function () { var g = mo().glv(), cv = document.getElementById('v3-canevas'); return cv && cv !== cvB && g && g.cv === cv && g.dessineId === 'banc_b' && !g.gl.isContextLost(); }, 'un canevas neuf après la perte, dans la vue de B', function () {
          etapes.push({ etape: 'perte dans B : canevas remplacé et redessiné' }); setTimeout(function () { var e = etat('B, 2 s après'); image('B'); fin(e.v3 === 'banc_b' && e.cle === 'banc_b' && e.glOk && e.sel === 'banc_b' ? '' : 'la vue ne montre plus B'); }, 2000); }); }
      setTimeout(function () { var e = etat('B, 2 s après'); image('B'); fin(e.v3 === 'banc_b' && e.cle === 'banc_b' && e.glOk && e.sel === 'banc_b' ? '' : 'la vue ne montre plus B'); }, 2000); });
  }
  attendre(function () { return mo() && document.querySelector('[data-sel="banc_a"], [data-v3="banc_a"], #v3-canevas'); }, 'la bibliothèque', function () { try { etape1(); } catch (e) { fin(String(e && e.stack || e)); } });
};

function page(chemin, vueb, ipc) {
  let h = pageAtelier(chemin === 'depart' ? '3d:banc_a' : '');
  const pont = '<script>window.__szB3m={chemin:' + JSON.stringify(chemin) + ',vueb:' + JSON.stringify(vueb) + ',vite:' + (process.env.SZ_VITE ? 'true' : 'false') + ',perte:' + (process.env.SZ_PERTE ? 'true' : 'false') + ',ipc:' + (ipc ? 'true' : 'false') + '};window.__szBanc3d={cas:{id:"b3m"}};' + 'window.__REP=' + JSON.stringify(scen.reponses) + ';'
    + 'window.__R2={};window.DB={getProductById:function(){return null;},updateProduct:function(){return null;}};'
    + 'window.TursoDB={uploadObject:function(){return Promise.resolve("");},uploadObjectBrut:function(){return Promise.resolve("");},fetchObjectDataUrl:function(u){return Promise.resolve(u);}};'
    + 'window.szPont={appeler:function(op,a){'
    // (banc ANCRÉ : comme au poste, le site calcule dans un AUTRE processus — la réponse arrive après quelques images, pas dans le
    // clic. Dans Chrome sans tête, le temps est VIRTUEL : une attente y a fait sauter des images d animation, la réponse y reste immédiate.)
    + 'if(op==="atelier:apercu3d"){if(window.__szB3m.ipc)return new Promise(function(r){setTimeout(function(){r(window.Atelier.apercu3dCoeur(a));},250);});return Promise.resolve(window.Atelier.apercu3dCoeur(a));}'
    + 'if(op==="atelier:croquis")return Promise.resolve(window.Atelier.croquisCoeur(a));'
    // la vignette s ENREGISTRE (comme au poste) et la fenêtre reçoit l actualisation que le processus principal envoie aux autres
    + 'if(op==="atelier:vignette"){setTimeout(function(){if(window.szActualiser)window.szActualiser();},30);return Promise.resolve({ok:true});}'
    + 'if(op==="atelier:donnees"){var d0=JSON.parse(JSON.stringify(window.__REP["atelier:donnees"]));d0.modeles=window.Atelier.getModeles().map(function(m){var x=JSON.parse(JSON.stringify(m));x.verrouille=false;x.vignette="";return x;});return Promise.resolve(d0);}'
    + 'var r=window.__REP[op];return Promise.resolve(r?JSON.parse(JSON.stringify(r)):{ok:false,motif:"operation_inconnue"});},fermer:function(){},detacher:function(){},ancrer:function(){},imageLocale:function(){return Promise.resolve(null);}};'
    + '</script><script src="file:///' + path.join(SITE, 'assets/js/atelier.js').replace(/\\/g, '/') + '"></script>'
    + '<script>(' + SCRIPT_MODELES.toString() + ')();</script>';
  const i = h.indexOf('<script');
  h = h.slice(0, i) + pont + h.slice(i);
  return h.replace('</body>', '<script>(' + SCRIPT_PAGE.toString() + ')();</script></body>');
}

// (le banc ANCRÉ, tools/banc-atelier-3d-ancre.js, sert la même page dans une vue Electron)
module.exports = { page, CHEMINS };
if (require.main === module) {
const exe = chrome();
if (!exe) { console.error('✗ Chrome introuvable — banc impossible.'); process.exit(1); }
if (SORTIE) fs.mkdirSync(SORTIE, { recursive: true });
let echec = 0;
for (const vb of ['cartes', 'liste']) for (const ch of CHEMINS) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-b3m-'));
  const fic = path.join(tmp, 'banc.html'), journal = path.join(tmp, 'chrome.log');
  fs.writeFileSync(fic, page(ch, vb), 'utf8');
  spawnSync(exe, ['--headless=new', '--disable-gpu-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--allow-file-access-from-files', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--window-size=1400,900', '--enable-logging', '--v=0', '--log-file=' + journal,
    '--user-data-dir=' + path.join(tmp, 'profil'), '--virtual-time-budget=120000', 'file:///' + fic.replace(/\\/g, '/')],
  { stdio: 'ignore', timeout: 180000 });
  const jusqua = Date.now() + 20000;
  let txt = '';
  while (Date.now() < jusqua) {
    try { txt = fs.readFileSync(journal, 'utf8'); if (/B3M-FIN/.test(txt)) break; } catch (e) {}
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
  }
  fermerNosChrome(tmp);
  const parts = {};
  txt.split(/\r?\n/).forEach((l) => { const m = /"B3M\|([^|]+)\|([^|]+)\|(.*)", source/.exec(l); if (!m) return; (parts[m[1]] = parts[m[1]] || {})[m[2]] = m[3]; });
  const lire = (k) => { const p = parts[k]; if (!p || p.fin === undefined) return null; return Object.keys(p).filter((x) => x !== 'fin').sort((a, b) => a - b).map((x) => p[x]).join(''); };
  const err = lire('erreur'), et = lire('etapes');
  if (SORTIE) Object.keys(parts).filter((k) => /^img:/.test(k)).forEach((k) => { const d = lire(k); if (d) fs.writeFileSync(path.join(SORTIE, vb + '-' + ch + '-' + k.slice(4) + '.png'), Buffer.from(d.replace(/^data:image\/png;base64,/, ''), 'base64')); });
  if (!et) { console.log('✗ ' + vb.padEnd(7) + ch.padEnd(8) + " la page n'a rien rendu (journal : " + journal + ')'); echec++; continue; }
  const E = JSON.parse(et), b = E.filter((e) => /^B/.test(e.etape)).pop();
  if (err) { echec++; console.log('✗ ' + vb.padEnd(7) + ch.padEnd(8) + err + '  ' + JSON.stringify(E)); }
  else console.log('✓ ' + vb.padEnd(7) + ch.padEnd(8) + 'B montré (vue ' + b.v3 + ', corps ' + b.r + ', WebGL ' + b.glBase + ', toiles ' + b.cle + ', sélection ' + b.sel + ')');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}
console.log(echec ? '>>> ' + echec + ' chemin(s) qui rouvrent le mauvais modèle' : '>>> tous les chemins ouvrent le bon modèle');
process.exit(echec ? 1 : 0);
}
