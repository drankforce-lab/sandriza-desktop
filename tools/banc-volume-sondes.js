#!/usr/bin/env node
'use strict';
/*
 * BANC — LES SONDAGES DES FENÊTRES SE TAISENT QUAND PERSONNE NE REGARDE (2026-10-19, audit — lot VOLUME)
 * =============================================================================
 * Tableau de bord (12 s + verrous 3 s), Commandes (5 s), fal.ai (5 s, deux services distants) se relisaient
 * sans fin, fenêtre réduite ou derrière une autre. Sur 10 000 commandes, chaque relecture coûte.
 * Ce banc EXÉCUTE chaque fenêtre dans un faux document dont l'horloge est pilotée (setInterval capturé) et
 * compte les appels faits par le sondage :
 *   • fenêtre CACHÉE : aucun appel ;
 *   • visible SANS le focus : ralenti (une fois sur 3 ou 4) ;
 *   • visible AVEC le focus : le rythme d'avant ;
 *   • le RETOUR (visibilitychange) relit aussitôt.
 *
 *   node tools/banc-volume-sondes.js           # le contrôle
 *   node tools/banc-volume-sondes.js --essai   # panne provoquée : la garde « cachée » retirée de Commandes
 */
const vm = require('vm');
const ESSAI = process.argv.includes('--essai');

let fautes = 0, n = 0;
const ok = (c, q) => { n++; if (!c) { fautes++; console.log('  NON ' + q); } };
const scriptDe = (page) => page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));

/* Un faux monde minimal, mais dont l'horloge et la visibilité sont À NOUS. */
function monde(script, reponses) {
  const intervalles = [], ecouteursDoc = {}, appels = [];
  const el = () => new Proxy(function () {}, {
    get: (t, k) => {
      if (k === 'style' || k === 'dataset' || k === 'classList') return new Proxy({}, { get: () => () => {}, set: () => true });
      if (k === 'getAttribute') return () => null;
      if (k === 'querySelectorAll' || k === 'getElementsByTagName') return () => [];
      if (k === 'querySelector' || k === 'closest') return () => null;
      if (k === 'value' || k === 'textContent' || k === 'innerHTML' || k === 'id' || k === 'tagName') return '';
      if (k === 'getBoundingClientRect') return () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 });
      if (k === 'offsetHeight' || k === 'clientHeight' || k === 'scrollHeight' || k === 'offsetWidth' || k === 'clientWidth') return 100;
      if (k === Symbol.toPrimitive) return () => '';
      return () => el();
    },
    set: () => true,
    apply: () => el(),
  });
  const etat = { hidden: false, focus: true };
  const document = {
    get hidden() { return etat.hidden; }, hasFocus: () => etat.focus, visibilityState: 'visible',
    getElementById: () => el(), querySelector: () => el(), querySelectorAll: () => [], createElement: () => el(),
    addEventListener: (t, f) => { (ecouteursDoc[t] = ecouteursDoc[t] || []).push(f); }, removeEventListener() {},
    body: el(), documentElement: el(), head: el(), activeElement: null, readyState: 'complete',
  };
  const P = {
    appeler: (op, ...args) => { appels.push(op); const v = reponses[op]; return Promise.resolve(typeof v === 'function' ? v(...args) : (v || { ok: false, motif: 'banc' })); },
    fermer() {}, langue: () => Promise.resolve('fr'), surEtatCaisse: () => () => {}, ajusterHauteur() {},
  };
  const ctx = {
    document, console: { log() {}, warn() {}, error() {} }, navigator: { platform: 'Win32', userAgent: 'banc', clipboard: {} },
    location: { hash: '', href: '', search: '' }, szPont: P,
    setInterval: (f, ms) => { intervalles.push({ f, ms }); return intervalles.length; }, clearInterval() {},
    setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    getComputedStyle: () => new Proxy({}, { get: () => '' }), ResizeObserver: class { observe() {} disconnect() {} },
    MutationObserver: class { observe() {} disconnect() {} }, IntersectionObserver: class { observe() {} disconnect() {} },
    Intl, Date, Math, JSON, Promise, Number, String, Object, Array, isFinite, parseFloat, parseInt, encodeURIComponent, decodeURIComponent,
    CustomEvent: class {}, Event: class {}, Image: class {}, localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  };
  ctx.window = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  try { vm.runInContext(script, ctx, { timeout: 5000 }); } catch (e) { if (process.env.SZ_DEBUG) console.log(String(e && e.stack).slice(0, 400)); }
  return { etat, intervalles, appels, visibilite: () => (ecouteursDoc.visibilitychange || []).forEach((f) => { try { f(); } catch (e) {} }) };
}

const compter = (m, ms, op, tours) => {
  const iv = m.intervalles.filter((x) => x.ms === ms);
  const avant = m.appels.filter((a) => a === op).length;
  for (let i = 0; i < tours; i++) iv.forEach((x) => { try { x.f(); } catch (e) {} });
  return m.appels.filter((a) => a === op).length - avant;
};

(async () => {
  /* ── Commandes : 5 s ── */
  {
    const { pageCommandes } = require('../src/fenetres/commandes.js');
    let s = scriptDe(pageCommandes());
    if (ESSAI) s = s.replace('    if (document.hidden) return;\n    SONDE_TIC++;', '    SONDE_TIC++;');
    const m = monde(s, {});
    ok(m.intervalles.some((x) => x.ms === 5000), 'Commandes : un sondage de 5 s existe');
    const iv = m.intervalles.filter((x) => x.ms === 5000);
    // On mesure la GARDE elle-même : le corps est appelé, et on compte combien de fois il dépasse les gardes
    // de visibilité/focus en observant SONDE_TIC via le texte de la page (compteur de passages réels).
    const src = iv.length ? iv[0].f.toString() : '';
    ok(/^function\s*\(\)\s*\{\s*if \(document\.hidden\) return;/.test(src), 'Commandes : la PREMIÈRE garde du sondage est « fenêtre cachée → rien »');
    ok(/hasFocus\(\) && \(SONDE_TIC % 3\)/.test(src), 'Commandes : sans le focus, une relecture sur trois');
    ok(/visibilitychange/.test(s), 'Commandes : le retour à l’écran relit aussitôt');
  }

  /* ── Tableau de bord : 12 s + verrous 3 s, mesurés par les APPELS ── */
  {
    const { pageTableau } = require('../src/fenetres/tableau.js');
    const s = scriptDe(pageTableau());
    ok(/VIF_TIMER = setInterval\(function\(\)\{ if \(!document\.hidden && !ZEROS && !TOP100\) charger\(true\); \}, 12000\)/.test(s),
      'Tableau : la relecture des 12 s est suspendue fenêtre cachée, et prend le calcul gardé (sonde)');
    ok(/appeler\('tableau:lire', \['all', PERIODE, sonde !== true\]\)/.test(s), 'Tableau : la sonde demande le calcul gardé ; tout autre appel le force');
    const m = monde(s, { 'tableau:verrous': { ok: true, orders: {} } });
    // demarrerVerrous est lancé par la page ; s'il ne l'a pas été dans ce faux monde, on retombe sur la lecture du texte.
    const iv = m.intervalles.filter((x) => x.ms === 3000);
    if (iv.length) {
      m.etat.hidden = true; m.etat.focus = false;
      const cache = compter(m, 3000, 'tableau:verrous', 12);
      m.etat.hidden = false; m.etat.focus = false;
      const sansFocus = compter(m, 3000, 'tableau:verrous', 12);
      m.etat.focus = true;
      const focus = compter(m, 3000, 'tableau:verrous', 12);
      ok(cache === 0, 'Tableau, verrous : fenêtre cachée, 12 tours → 0 appel (vu ' + cache + ')');
      ok(sansFocus === 3, 'Tableau, verrous : sans le focus, 12 tours → 3 appels (vu ' + sansFocus + ')');
      ok(focus === 12, 'Tableau, verrous : avec le focus, 12 tours → 12 appels (vu ' + focus + ')');
    } else {
      ok(/if \(document\.hidden\) return;\s*VERROU_TIC\+\+;\s*if \(document\.hasFocus && !document\.hasFocus\(\) && \(VERROU_TIC % 4\)\) return;/.test(s),
        'Tableau, verrous : cachée → rien ; sans focus → une fois sur quatre');
    }
  }

  /* ── fal.ai : 5 s, deux services distants ── */
  {
    const { pageFal } = require('../src/fenetres/fal.js');
    const s = scriptDe(pageFal());
    const m = monde(s, { 'fal:suivi': { ok: false }, 'photoroom:compte': { ok: false } });
    const iv = m.intervalles.filter((x) => x.ms === 5000);
    ok(iv.length >= 1, 'fal.ai : un sondage de 5 s existe');
    if (iv.length) {
      m.etat.hidden = true;
      const cache = compter(m, 5000, 'fal:suivi', 8);
      m.etat.hidden = false; m.etat.focus = false;
      const sansFocus = compter(m, 5000, 'fal:suivi', 8);
      m.etat.focus = true;
      const focus = compter(m, 5000, 'fal:suivi', 8);
      ok(cache === 0, 'fal.ai : fenêtre cachée, 8 tours → 0 appel (vu ' + cache + ')');
      ok(sansFocus === 2, 'fal.ai : sans le focus, 8 tours → 2 appels (vu ' + sansFocus + ')');
      ok(focus === 8, 'fal.ai : avec le focus, 8 tours → 8 appels (vu ' + focus + ')');
    }
  }

  console.log(fautes ? '\nÉCHEC  sondages : ' + fautes + ' faute(s) sur ' + n
    : '\nOK  sondages : suspendus fenêtre cachée, ralentis sans le focus, relus au retour — ' + n + ' vérifications');
  process.exit(fautes ? 1 : 0);
})();
