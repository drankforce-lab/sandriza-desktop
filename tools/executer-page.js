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
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠⚠ DEUX FAUX DÉPARTS, LE MÊME JOUR, ET IL FAUT LES GARDER ÉCRITS : cet outil a
 * d'abord été construit DEUX FOIS de travers, chaque fois en reproduisant très
 * exactement l'aveuglement qu'il devait corriger. Il annonçait « aucune faute »
 * sur des fenêtres dont le code de dessin levait réellement une erreur.
 *
 *   1. `process.on('unhandledRejection')` NE VOIT PAS les rejets nés dans un
 *      contexte `vm` : cette détection est rattachée au contexte principal.
 *      Mesuré sur un cas minimal. → on intercepte donc à la source, dans le faux
 *      pont, avec `surveille()` : c'est le seul point par lequel on est certain
 *      de passer.
 *   2. UN `Proxy` COMME OBJET GLOBAL SUPPRIME L'ERREUR. Avec un objet simple,
 *      lire un nom inexistant lève « n'est pas défini » ; avec un mandataire, la
 *      même lecture rend `undefined` EN SILENCE, et le piège `has` n'est même pas
 *      consulté. Mon détecteur de variables libres ne pouvait rien détecter — et
 *      il rendait muette la faute même qu'il cherchait. → objet simple, et c'est
 *      le moteur qui lève, pas nous.
 *
 * Ces deux fautes n'ont été trouvées qu'en INJECTANT un défaut exprès pour voir si
 * l'outil le voyait. Un contrôle qu'on n'a pas essayé de tromper ne vaut rien :
 * `tools/banc-executer-page.js` fait cette injection, et il doit rester vert.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Le script tourne dans un contexte isolé, avec un faux document et un faux pont
 * qui RÉPOND — indispensable : le premier essai n'avait pas de pont, la réponse
 * était donc un refus, la fenêtre affichait poliment « indisponible », et le code
 * du dessin (le seul cassé) n'était jamais atteint.
 *
 * ⚠ CE N'EST PAS UN NAVIGATEUR. Le faux document est complaisant : il accepte tout
 * et ne dessine rien. Ce contrôle ne dit donc pas « la fenêtre est belle » ; il dit
 * « la fenêtre ne meurt pas en silence », ce qui est ce qui nous manquait.
 */

const vm = require('vm');

// Le message qu'une fenêtre native reçoit réellement en touchant au stockage : son
// document est chargé en `data:`, son origine est nulle. Mesuré le 2026-08-06.
const _SEC = 'SecurityError (origine null) — le stockage est inaccessible à une fenêtre native';

// ── UN FAUX DOCUMENT COMPLAISANT ────────────────────────────────────────────
// Chaque élément accepte n'importe quelle propriété et n'importe quel appel. Le
// but n'est pas de simuler un navigateur — c'est de laisser le script ALLER AU
// BOUT pour voir s'il trébuche.
// ⚠ ON COMPTE LES ÉCRITURES D'ÉCRAN, et ce n'est pas une statistique : c'est la
// preuve que l'essai a bien traversé le code de DESSIN. Sans elle, un jeu de
// réponses mal formé ferait prendre le chemin du refus à la fenêtre, l'outil
// dirait « aucune faute », et l'on croirait avoir vérifié quelque chose.
const faireElement = (compteur) => ({
  get innerHTML() { return this._html || ''; },
  set innerHTML(v) { this._html = v; if (compteur && String(v).length > 40) compteur.ecritures++; },
  style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  children: [], childNodes: [], attributes: {},
  // ⚠ PAS de `innerHTML` en propriété simple ici : dans un littéral d'objet la
  // dernière définition gagne, et elle écraserait l'accesseur ci-dessus — le
  // compteur resterait à zéro sans que rien ne le signale.
  outerHTML: '', textContent: '', value: '', checked: false,
  disabled: false, selected: false, id: '', className: '', tagName: 'DIV',
  files: [], options: [], selectedIndex: 0, scrollHeight: 100, offsetHeight: 100,
  appendChild(c) { this.children.push(c); return c; },
  removeChild() {}, replaceChild() {}, insertBefore() {}, remove() {},
  setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
  hasAttribute() { return false; },
  addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
  focus() {}, blur() {}, click() {}, scrollIntoView() {}, select() {},
  querySelector() { return faireElement(compteur); },
  querySelectorAll() { return []; },
  closest() { return null; },
  getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 }; },
});

/**
 * @param {string} script    le contenu de la portion <script> de la page
 * @param {object} reponses  { 'operation:nom': valeur } — ce que le faux pont rend
 * @returns {Promise<{fautes:string[], journal:string[], ecritures:number}>}
 */
function executerPage(script, reponses) {
  const fautes = [];
  const compteur = { ecritures: 0 };
  const journal = [];
  const rep = reponses || {};

  const document = {
    getElementById: () => faireElement(compteur),
    querySelector: () => faireElement(compteur),
    querySelectorAll: () => [],
    createElement: () => faireElement(compteur),
    createTextNode: () => faireElement(compteur),
    createDocumentFragment: () => faireElement(compteur),
    addEventListener() {}, removeEventListener() {},
    body: faireElement(compteur), head: faireElement(compteur), documentElement: faireElement(compteur),
    readyState: 'complete', title: '', activeElement: null,
    execCommand() { return true; },
  };

  // ⚠ L'INTERCEPTION EST ICI, ET PAS SUR `process`. Un rejet né dans le contexte
  // isolé n'est jamais signalé à `process.on('unhandledRejection')` — voir l'en-tête.
  // Ces fonctions-ci sont le seul passage obligé entre la page et le monde
  // extérieur : ce qu'une suite de promesse lève y est donc toujours vu.
  const garde = (fn) => {
    try { return fn(); }
    catch (e) {
      fautes.push('levée dans une suite de promesse : ' + ((e && e.message) || e));
      throw e;                      // on ne masque rien : la page réagit comme en vrai
    }
  };
  const surveille = (p) => ({
    then(ok, ko) {
      return surveille(p.then(
        ok ? (v) => garde(() => ok(v)) : undefined,
        ko ? (e) => garde(() => ko(e)) : undefined
      ));
    },
    catch(ko) { return this.then(undefined, ko); },
    finally(f) { return surveille(p.finally(() => garde(() => (f ? f() : undefined)))); },
  });

  // ⚠ LE FAUX PONT RÉPOND, et c'est tout l'intérêt. Une opération sans réponse
  // prévue rend `{ ok:true }` : la page prend donc le chemin du SUCCÈS — celui où
  // vivait la faute — au lieu de celui du refus.
  const szPont = {
    appeler: (op) => surveille(Promise.resolve(
      Object.prototype.hasOwnProperty.call(rep, op) ? rep[op] : { ok: true }
    )),
    fermer() {}, pleinEcran: () => surveille(Promise.resolve(false)),
    surEtatCaisse: () => () => {}, ajusterHauteur() {},
  };

  const socle = {
    window: null, document, szPont,
    navigator: { platform: 'Win32', userAgent: 'essai', clipboard: {} },
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
    requestAnimationFrame: (f) => {
      try { f(0); } catch (e) { fautes.push('image : ' + ((e && e.message) || e)); }
      return 0;
    },
    cancelAnimationFrame() {},
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    alert() {}, confirm: () => true, prompt: () => null,
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}), text: () => Promise.resolve('') }),
    // ⚠ `localStorage` LÈVE, comme dans une vraie fenêtre native : le document est
    // chargé en `data:`, son origine est `null`, et y toucher jette une
    // SecurityError. Un faux stockage complaisant laisserait passer du code qui
    // s'effondre chez le client — mesuré le 2026-08-06.
    // ⚠ CE SONT LES MÉTHODES QUI LÈVENT, pas la lecture de la propriété. Un
    // accesseur qui lève ne survit pas à la mise en contexte : la propriété
    // paraissait ABSENTE, et le message devenait « localStorage n'est pas défini »
    // — vrai symptôme, mauvaise explication, et le banc le refusait à juste titre.
    // Dans une vraie fenêtre native c'est l'accès lui-même qui échoue ; ici c'est
    // le premier usage. Dans les deux cas le code fautif est arrêté et nommé.
    localStorage: {
      getItem() { throw new Error(_SEC); }, setItem() { throw new Error(_SEC); },
      removeItem() { throw new Error(_SEC); }, clear() { throw new Error(_SEC); },
      key() { throw new Error(_SEC); },
    },
    devicePixelRatio: 1, innerWidth: 1200, innerHeight: 800,
    btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'),
    atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
  };
  // `window` est le socle lui-même : une page appelle `window.addEventListener`,
  // `window.szPont`, `window.innerWidth`… tout doit s'y trouver.
  socle.addEventListener = () => {};
  socle.removeEventListener = () => {};
  socle.dispatchEvent = () => true;
  socle.window = socle;

  // ⚠ UN OBJET SIMPLE, JAMAIS UN `Proxy` — voir le point 2 de l'en-tête. Le
  // contexte apporte ses propres objets natifs (Object, Array, JSON, Math…) ; ce
  // socle n'ajoute que ce qu'un navigateur fournirait en plus. Et surtout, lire un
  // nom inexistant y lève « n'est pas défini », ce qui est précisément le signal
  // que cet outil existe pour capter.
  const contexte = vm.createContext(socle);

  try {
    // 2 secondes : un script de fenêtre qui n'a pas fini de se poser au bout de
    // deux secondes, faux document compris, a un problème en soi.
    new vm.Script('(function(){' + script + '})()').runInContext(contexte, { timeout: 2000 });
  } catch (e) {
    fautes.push(String((e && e.message) || e));
  }

  // On laisse les promesses se dérouler avant de conclure. Le faux pont répond
  // immédiatement : il n'y a rien à attendre du réseau, mais les suites de
  // promesses s'enchaînent sur plusieurs tours — conclure trop tôt raterait
  // précisément la faute que l'on cherche.
  // ⚠ CE GUET NE DÉTECTE RIEN — IL EMPÊCHE L'OUTIL DE MOURIR, et la nuance compte.
  // `garde` note la faute puis la RELAIE, pour que la page réagisse comme en vrai
  // (son propre rattrapage doit pouvoir s'exécuter). Mais ce relais part alors dans
  // une promesse que personne ne suit : sans écouteur, Node arrête le processus au
  // premier défaut trouvé, et le contrôle s'interrompt en pleine liste au lieu de
  // rendre son verdict. La détection, elle, est déjà faite — voir `garde`.
  const muet = () => {};
  process.on('unhandledRejection', muet);
  return new Promise((fin) => {
    let reste = 4;
    const tour = () => {
      if (--reste > 0) { setImmediate(tour); return; }
      process.removeListener('unhandledRejection', muet);
      fin({ fautes, journal, ecritures: compteur.ecritures });
    };
    setImmediate(tour);
  });
}

module.exports = { executerPage };
