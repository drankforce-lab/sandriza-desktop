'use strict';

/*
 * EXÉCUTER LE SCRIPT D'UNE FENÊTRE, PAS SEULEMENT LE COMPILER
 * =============================================================================
 * ⚠ CE FICHIER EXISTE À CAUSE D'UNE PANNE QUI A COÛTÉ QUATRE VERSIONS PUBLIÉES.
 *
 * La fenêtre Imprimantes restait sur « Lecture de l'état… » indéfiniment. Le
 * garde-fou disait « tout est sain », parce qu'il COMPILE le script produit. Or la
 * faute était une variable libre — `s`, laissée orpheline en retirant par mégarde
 * un `forEach` — et une variable libre est parfaitement licite à la compilation :
 * elle n'échoue qu'à la lecture, à l'exécution. Le dessin s'arrêtait donc juste
 * avant la ligne qui remplit l'écran, et l'erreur était avalée.
 *
 * Compiler prouve que le texte est du JavaScript. Cela ne prouve pas qu'il marche.
 *
 * Ce module exécute le script dans un contexte isolé, avec un faux document et un
 * faux pont qui RÉPOND (c'est indispensable : mon essai précédent n'avait pas de
 * pont, la réponse était un refus, et le code du dessin — celui qui était cassé —
 * n'était jamais atteint. J'ai éprouvé le chemin d'à côté et j'en ai conclu que la
 * page allait bien).
 *
 * Il rapporte deux choses :
 *   1. toute exception levée pendant l'exécution ;
 *   2. tout nom lu sans avoir été défini — la faute exacte de 2026-08-07.
 *
 * ⚠ CE N'EST PAS UN NAVIGATEUR. Le faux document est complaisant : il accepte
 * tout et ne dessine rien. Ce contrôle ne dit donc pas « la fenêtre est belle » ;
 * il dit « la fenêtre ne meurt pas en silence », ce qui est ce qui nous manquait.
 */

const vm = require('vm');

// Les noms qu'une page a le DROIT de lire sans les avoir définis. Tout le reste
// est suspect — et la liste reste COURTE exprès : la rallonger pour faire taire
// un avertissement, c'est rendre le contrôle inutile.
const PERMIS = new Set([
  'window', 'document', 'navigator', 'location', 'history', 'screen',
  'szPont', 'console', 'alert', 'confirm', 'prompt', 'fetch',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle',
  'FileReader', 'FormData', 'Blob', 'URL', 'Image', 'Event', 'CustomEvent',
  'MutationObserver', 'ResizeObserver', 'IntersectionObserver',
  'localStorage', 'sessionStorage', 'BroadcastChannel', 'AbortController',
  'devicePixelRatio', 'innerWidth', 'innerHeight', 'scrollY', 'scrollX',
  'matchMedia', 'print', 'open', 'close', 'focus', 'blur', 'btoa', 'atob',
  'structuredClone', 'crypto', 'performance', 'queueMicrotask',
  'onerror', 'onunhandledrejection', 'onload', 'onbeforeunload',
]);

// ── UN FAUX DOCUMENT COMPLAISANT ────────────────────────────────────────────
// Chaque élément accepte n'importe quelle propriété et n'importe quel appel. Le
// but n'est pas de simuler un navigateur — c'est de laisser le script ALLER AU
// BOUT pour voir s'il trébuche.
const faireElement = () => {
  const el = {
    style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    children: [], childNodes: [], attributes: {},
    innerHTML: '', outerHTML: '', textContent: '', value: '', checked: false,
    disabled: false, selected: false, id: '', className: '', tagName: 'DIV',
    files: [], options: [], selectedIndex: 0, scrollHeight: 100, offsetHeight: 100,
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, replaceChild() {}, insertBefore() {}, remove() {},
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    hasAttribute() { return false; },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    focus() {}, blur() {}, click() {}, scrollIntoView() {}, select() {},
    querySelector() { return faireElement(); },
    querySelectorAll() { return []; },
    closest() { return null; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 }; },
  };
  return el;
};

/**
 * @param {string} script  le contenu de la portion <script> de la page
 * @param {object} reponses  { 'operation:nom': valeur } — ce que le faux pont rend
 * @returns {{fautes:string[], inconnus:string[], journal:string[]}}
 */
function executerPage(script, reponses) {
  const fautes = [];
  const inconnus = new Set();
  const journal = [];
  const rep = reponses || {};

  const document = {
    getElementById: () => faireElement(),
    querySelector: () => faireElement(),
    querySelectorAll: () => [],
    createElement: () => faireElement(),
    createTextNode: () => faireElement(),
    createDocumentFragment: () => faireElement(),
    addEventListener() {}, removeEventListener() {},
    body: faireElement(), head: faireElement(), documentElement: faireElement(),
    readyState: 'complete', title: '', activeElement: null,
    execCommand() { return true; },
  };

  // ⚠ LE FAUX PONT RÉPOND, et c'est tout l'intérêt. Une opération sans réponse
  // prévue rend `{ ok:true }` : la page prend donc le chemin du SUCCÈS — celui où
  // vivait la faute — au lieu de celui du refus.
  const szPont = {
    appeler: (op) => Promise.resolve(
      Object.prototype.hasOwnProperty.call(rep, op) ? rep[op] : { ok: true }
    ),
    fermer() {}, pleinEcran: () => Promise.resolve(false),
    surEtatCaisse: () => () => {}, ajusterHauteur() {},
  };

  const socle = {
    window: null, document, szPont, navigator: { platform: 'Win32', userAgent: 'essai', clipboard: {} },
    location: { hash: '', href: '', search: '' },
    console: {
      log: (...a) => journal.push(a.join(' ')), warn: (...a) => journal.push(a.join(' ')),
      error: (...a) => journal.push('erreur: ' + a.join(' ')), info() {}, debug() {},
    },
    // ⚠ LES MINUTERIES PARTENT TOUT DE SUITE, ET AVEC UN COMPTEUR. Tout de suite,
    // parce qu'on ne va pas attendre 3 secondes pour éprouver un garde de 3
    // secondes ; avec un compteur, parce qu'une minuterie qui se replante
    // elle-même — ce que fait tout rafraîchissement périodique — boucherait la
    // pile à l'infini et ferait passer un simple contrôle pour un blocage.
    setTimeout: (f) => {
      if (++socle._minuteries > 200) return 0;
      try { f(); } catch (e) { fautes.push('minuterie : ' + ((e && e.message) || e)); }
      return 0;
    },
    _minuteries: 0,
    clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    requestAnimationFrame: (f) => { try { f(0); } catch (e) { fautes.push('image : ' + e.message); } return 0; },
    cancelAnimationFrame() {},
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    alert() {}, confirm: () => true, prompt: () => null,
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}), text: () => Promise.resolve('') }),
    // ⚠ `localStorage` LÈVE, comme dans une vraie fenêtre native : le document est
    // chargé en `data:`, son origine est `null`, et y toucher jette une
    // SecurityError. Un faux stockage complaisant laisserait passer un code qui
    // s'effondre chez le client — mesuré le 2026-08-06.
    get localStorage() { throw new Error('SecurityError (origine null) — attendu dans une fenêtre native'); },
    devicePixelRatio: 1, innerWidth: 1200, innerHeight: 800,
    btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'),
    atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
  };
  // ⚠ `window` EST LE SOCLE LUI-MÊME, donc il doit porter ce qu'une page appelle
  // sur `window` : l'écoute d'événements en premier. Sans elle, l'outil accusait
  // la fenêtre CORRIGÉE — un faux positif est aussi nuisible qu'un faux négatif,
  // parce qu'il apprend à ne plus lire la sortie.
  socle.addEventListener = () => {};
  socle.removeEventListener = () => {};
  socle.dispatchEvent = () => true;
  socle.window = socle;

  // ⚠ LE PIÈGE À VARIABLES LIBRES. Un nom non défini se cherche jusqu'à l'objet
  // global ; ce mandataire voit donc passer la recherche et la note. C'est ce qui
  // aurait attrapé `s` en 1.19.3, quatre versions avant que le client ne le signale.
  const contexte = vm.createContext(new Proxy(socle, {
    has(cible, nom) {
      if (typeof nom !== 'string') return Reflect.has(cible, nom);
      if (Reflect.has(cible, nom) || PERMIS.has(nom)) return true;
      // Les objets natifs du langage (Object, Array, JSON, Math…) sont légitimes.
      if (nom in globalThis) return true;
      inconnus.add(nom);
      return false;                      // laisse lever, comme dans le navigateur
    },
    // ⚠ ET IL FAUT LES RENDRE, PAS SEULEMENT LES RECONNAÎTRE. Première version de
    // ce mandataire : `has` disait vrai pour `String`, mais `get` cherchait dans le
    // socle, ne trouvait rien, et rendait `undefined` — d'où « String is not a
    // function » dans TOUTES les fenêtres, saines comprises. Un contrôle qui
    // accuse tout le monde ne distingue plus rien.
    get(cible, nom, r) {
      if (typeof nom === 'string' && !Reflect.has(cible, nom) && nom in globalThis) {
        return globalThis[nom];
      }
      return Reflect.get(cible, nom, r);
    },
  }));

  // ⚠ LES FAUTES N'ARRIVENT PAS TOUTES PENDANT L'EXÉCUTION. Celle de 2026-08-07
  // était levée dans la suite d'une promesse — donc APRÈS le retour de
  // `runInContext`, dans une micro-tâche, hors de portée de tout `try`. Sans ce
  // guet, l'outil annonçait « aucune exception » puis le processus s'effondrait
  // deux lignes plus bas : exactement l'aveuglement qu'il est censé corriger.
  const guet = (raison) => fautes.push('rejet non traité : ' + String((raison && raison.message) || raison));
  process.on('unhandledRejection', guet);
  try {
    // 2 secondes : un script de fenêtre qui n'a pas fini de se poser au bout de
    // deux secondes, faux document compris, a un problème en soi.
    new vm.Script('(function(){' + script + '})()').runInContext(contexte, { timeout: 2000 });
  } catch (e) {
    fautes.push(String((e && e.message) || e));
  }
  // On laisse les promesses se dérouler avant de conclure. Deux tours de boucle
  // suffisent : le faux pont répond immédiatement, il n'y a rien à attendre du
  // réseau. Conclure trop tôt raterait précisément la faute que l'on cherche.
  return new Promise((fin) => {
    setImmediate(() => setImmediate(() => {
      process.removeListener('unhandledRejection', guet);
      fin({ fautes, inconnus: [...inconnus], journal });
    }));
  });
}

module.exports = { executerPage };
