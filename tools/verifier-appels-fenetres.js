#!/usr/bin/env node
/* ============================================================================
   verifier-appels-fenetres.js — UNE FONCTION APPELÉE DOIT EXISTER
   ----------------------------------------------------------------------------
   POURQUOI CE CONTRÔLE EXISTE, ET CE QU'IL A COÛTÉ D'ATTENDRE.

   2026-09-09, une heure après la livraison de la fenêtre « Mode usage
   exclusif ». Son signalement : « quand je clique sur activer rien ne se
   passe ». Cause : `poser()` appelait `dire('Activation…')`, et `dire` n'était
   défini NULLE PART dans ce fichier — seul `szDire` existe, fourni par le
   socle. Les deux fenêtres sœurs portent la ligne `function dire(t, cl){
   szDire(t, cl); }` ; je l'avais simplement oubliée.

   ⚠⚠ ET RIEN NE POUVAIT L'ATTRAPER. C'est ça qui justifie un outil :

     · `node --check` COMPILE — un identifiant libre est parfaitement licite à
       la compilation. Il n'échoue qu'à l'exécution.
     · `verifier-fenetres.js` EXÉCUTE, mais seulement le CHARGEMENT. Le harnais
       ne clique jamais (son propre en-tête le dit : « aucun clic, aucune frappe
       n'est simulée »). Un gestionnaire de bouton n'est donc jamais exécuté.
     · Trois jeux de réponses prouvaient que les trois ÉCRANS se dessinent. Ils
       ne pouvaient pas prouver qu'un BOUTON fonctionne.

   Le trou n'est pas une négligence : il est structurel. On ne peut pas simuler
   les clics de 94 fenêtres. Mais on peut, sans rien exécuter, exiger que TOUTE
   fonction appelée dans le script d'une fenêtre soit définie quelque part.

   ── CE QU'IL REGARDE ────────────────────────────────────────────────────────
   Dans la portion `<script>` de chaque fenêtre, tout `nom(` dont le `nom` n'est
   ni déclaré dans le fichier, ni fourni par le socle, ni un global standard.

   ── CE QU'IL NE REGARDE PAS, ÉCRIT ICI POUR QU'ON NE S'Y FIE PAS PLUS QU'IL
      NE LE MÉRITE ───────────────────────────────────────────────────────────
     · Les appels de MÉTHODE (`obj.truc()`) : `obj` peut venir de n'importe où,
       et exiger qu'il soit connu produirait un torrent de faux. On ne garde que
       les appels NUS.
     · Les fonctions qui existent mais font la mauvaise chose. Ce contrôle dit
       « ça existe », jamais « ça marche ».
     · Ce qui est appelé par une chaîne (`onclick="truc()"` dans du balisage) —
       c'est le terrain de l'étape 0c côté site.

     node tools/verifier-appels-fenetres.js
   ============================================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');
const SOCLE = path.join(DOSSIER, 'socle.js');

/* ── 1. CE QUE LE SOCLE FOURNIT ──────────────────────────────────────────────
   Relevé DANS le socle, pas recopié à la main : une liste écrite en dur
   vieillirait sans le dire, et c'est la faute des « chiffres du carnet » que ce
   dépôt paie régulièrement. */
const litSocle = () => {
  const src = fs.readFileSync(SOCLE, 'utf8');
  const noms = new Set();
  for (const m of src.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)) noms.add(m[1]);
  for (const m of src.matchAll(/\bvar\s+([A-Za-z_$][\w$]*)\s*=\s*function/g)) noms.add(m[1]);
  return noms;
};

/* ── 2. LES GLOBALES QU'UN NAVIGATEUR OFFRE ──────────────────────────────────
   Volontairement courte : on n'y met que ce que les fenêtres emploient
   réellement en appel NU. Un nom manquant se signale une fois, on l'ajoute, et
   le contrôle reste précis. Un « et tout le reste » aurait rendu l'outil muet. */
/* ⚠⚠ LES BLOCS DU SOCLE NE SONT PAS DES APPELS DU SCRIPT. Depuis le 2026-09-12
   ils s’interpolent avec des parenthèses — `${JS_DIRE()}` — parce qu’ils sont
   devenus des FONCTIONS pour que la langue s’y résolve à chaque page bâtie (une
   constante de module fige la langue du premier `require`). Node les résout AVANT
   que le script existe : ce que ce banc lit ensuite est leur CONTENU, pas leur
   nom. Les compter comme des appels non déclarés ferait rougir 99 fenêtres pour
   une transformation qui n’a rien changé au script.
   ⚠ On les nomme UN PAR UN plutôt que d’ignorer tout `JS_*` : un nom en JS_ qui
   n’existerait pas doit rester une faute. */
const BLOCS_SOCLE = ['JS_SOCLE', 'JS_ACTIVITE', 'JS_DIRE', 'JS_BROUILLON'];

const GLOBALES = new Set([
  ...BLOCS_SOCLE,  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'requestAnimationFrame', 'cancelAnimationFrame', 'queueMicrotask',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Number', 'String', 'Boolean',
  'Array', 'Object', 'Date', 'RegExp', 'Error', 'Promise', 'Map', 'Set',
  'JSON', 'Math', 'encodeURIComponent', 'decodeURIComponent',
  'encodeURI', 'decodeURI', 'escape', 'unescape', 'btoa', 'atob',
  'alert', 'confirm', 'prompt', 'fetch', 'structuredClone',
  'FormData', 'Blob', 'File', 'FileReader', 'URL', 'URLSearchParams',
  'Image', 'Audio', 'Intl', 'Symbol', 'WeakMap', 'WeakSet', 'Proxy', 'Reflect',
  'AbortController', 'MutationObserver', 'ResizeObserver', 'IntersectionObserver',
  'Notification', 'CustomEvent', 'Event', 'DOMParser', 'TextEncoder', 'TextDecoder',
  'getComputedStyle', 'matchMedia', 'print', 'open', 'close', 'focus', 'blur',
  'scrollTo', 'scrollBy', 'require', 'importScripts',
  /* ⚠ AJOUTÉES PARCE QUE L OUTIL LES A RÉCLAMÉES, pas par anticipation. Une
     liste devinée est soit trop courte (des faux), soit trop longue (elle
     couvre des noms qui n existent pas et laisse passer de vraies fautes). */
  'Uint8Array', 'Uint8ClampedArray', 'Int8Array', 'Float32Array', 'Float64Array',
  'ArrayBuffer', 'DataView', 'BigInt', 'Proxy', 'crypto', 'performance',
  // Mots-clés et formes qui ressemblent à un appel dans une lecture naïve.
  'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof',
  'new', 'delete', 'void', 'in', 'of', 'do', 'else', 'try', 'throw', 'case',
  'super', 'this', 'await', 'yield', 'constructor', 'get', 'set',
]);

/* ── 3. LA PORTION DE SCRIPT D'UNE FENÊTRE ───────────────────────────────────
   On ne regarde QUE ce qui vit dans le gabarit : le JavaScript de module (au-
   dessus) tourne dans Node, il a ses propres règles et son propre contrôle. */
const scriptDe = (src) => {
  const out = [];
  for (const m of src.matchAll(/<script>([\s\S]*?)<\/script>/g)) out.push(m[1]);
  return out.join('\n');
};

/* ── 4. CE QUE LE FICHIER DÉCLARE ─────────────────────────────────────────── */
const declaresDe = (js) => {
  const noms = new Set();
  for (const m of js.matchAll(/\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/g)) noms.add(m[1]);
  for (const m of js.matchAll(/\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)/g)) noms.add(m[1]);
  // `var a = 1, b = function(){}` — les suivants de la liste.
  for (const m of js.matchAll(/,\s*([A-Za-z_$][\w$]*)\s*=/g)) noms.add(m[1]);
  // Paramètres : `function f(a, b)` et `function(a, b)`.
  for (const m of js.matchAll(/\bfunction\s*\*?\s*[A-Za-z_$\w$]*\s*\(([^)]*)\)/g)) {
    for (const p of m[1].split(',')) {
      const n = p.trim().replace(/=.*$/, '').trim();
      if (/^[A-Za-z_$][\w$]*$/.test(n)) noms.add(n);
    }
  }
  // Paramètres de flèche : `(a, b) =>` et `a =>`.
  for (const m of js.matchAll(/\(([^()]*)\)\s*=>/g)) {
    for (const p of m[1].split(',')) {
      const n = p.trim().replace(/=.*$/, '').trim();
      if (/^[A-Za-z_$][\w$]*$/.test(n)) noms.add(n);
    }
  }
  for (const m of js.matchAll(/\b([A-Za-z_$][\w$]*)\s*=>/g)) noms.add(m[1]);
  // `catch (e)`
  for (const m of js.matchAll(/\bcatch\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/g)) noms.add(m[1]);
  return noms;
};

/* ── 5. LES APPELS NUS ────────────────────────────────────────────────────────
   ⚠ ON ÉCARTE CE QUI EST PRÉCÉDÉ D'UN POINT : `a.b()` est un appel de méthode,
   et `a` peut venir de partout. Exiger qu'on le connaisse produirait des
   dizaines de faux — et un contrôle qui crie finit désactivé. */
const appelsDe = (js) => {
  /* ⚠⚠ LES CHAÎNES D'ABORD, LES COMMENTAIRES ENSUITE — ET L'ORDRE INVERSE M'A
     COÛTÉ 71 FAUX POSITIFS. Retirer les commentaires en premier fait manger le
     `//` d'une URL écrite DANS une chaîne : tout le reste de la ligne part avec,
     guillemet fermant compris. Le comptage des apostrophes se décale alors, et à
     partir de là le CONTENU des chaînes est lu comme du code — d'où « inattendue
     ( », « journal( », « erreur( » pris pour des appels de fonction.
     ⚠ Un contrôle qui crie 71 fois n'est pas un contrôle : il finit désactivé,
     et c'est écrit noir sur blanc ailleurs dans ce dépôt. Le premier jet de cet
     outil-ci en était un — trouvé en le LANÇANT, pas en le relisant.
     ⚠ `[^'\\\n]` : une chaîne ne franchit pas une fin de ligne. Sans ce refus,
     une apostrophe orpheline (dans un commentaire français, « l’ancre ») avalait
     tout le fichier jusqu’à la suivante. */
  /* ⚠ LES DEUX SORTES DE GUILLEMETS EN UNE SEULE PASSE, avec une alternance :
     celui qui OUVRE le premier gagne. Deux passes successives font qu une
     apostrophe francaise dans une chaine a guillemets doubles — « Action par
     defaut (a l'ouverture) » — ouvre une fausse chaine simple, et la suite du
     fichier se decale. C est ce qui restait de « faut( » dans telephonie.js. */
  const sansChaines = js
    .replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/g, "''")
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:'"])\/\/[^\n]*/g, '$1 ');
  const out = new Map();
  /* ⚠ UNE BARRE OBLIQUE INVERSE DEVANT N EST PAS UN APPEL : c est une classe
     d expression reguliere. `/\\B(?=(\\d{3})+/` lisait « B( » comme un appel a une
     fonction `B` — le cas de banque.js. Les litteraux d expression reguliere ne
     sont pas retires plus haut (les distinguer d une division demande un vrai
     analyseur) ; ce refus-ci suffit, et il ne masque rien : aucun appel legitime
     n est precede d une barre oblique inverse. */
  for (const m of sansChaines.matchAll(/(^|[^\w$.\\])([A-Za-z_$][\w$]*)\s*\(/g)) {
    const n = m[2];
    if (!out.has(n)) out.set(n, (sansChaines.slice(0, m.index).match(/\n/g) || []).length + 1);
  }
  return out;
};

// ── 6. LE VERDICT ───────────────────────────────────────────────────────────
const main = () => {
  const socle = litSocle();
  const fichiers = fs.readdirSync(DOSSIER)
    .filter((f) => f.endsWith('.js') && f !== 'socle.js')
    .sort();

  let fautes = 0, vus = 0, appelsTotal = 0;
  for (const f of fichiers) {
    const src = fs.readFileSync(path.join(DOSSIER, f), 'utf8');
    const js = scriptDe(src);
    if (!js.trim()) continue;
    vus++;
    const declares = declaresDe(js);
    const appels = appelsDe(js);
    appelsTotal += appels.size;
    const manquants = [];
    for (const [nom, ligne] of appels) {
      if (declares.has(nom) || socle.has(nom) || GLOBALES.has(nom)) continue;
      manquants.push(nom + ' (ligne ~' + ligne + ' du script)');
    }
    if (manquants.length) {
      console.error('  NON ' + f.padEnd(24) + manquants.join(', '));
      fautes += manquants.length;
    }
  }

  console.log('');
  if (fautes) {
    console.error('✗ ' + fautes + ' appel(s) vers une fonction qui n’existe nulle part, dans '
      + vus + ' fenêtre(s) lue(s).');
    console.error('   C’est le défaut « le bouton ne fait rien » : le gestionnaire lève une');
    console.error('   ReferenceError et meurt AVANT d’agir. Aucun message, aucune trace.');
    process.exit(1);
  }
  console.log('✓ les ' + appelsTotal + ' appels nus des ' + vus
    + ' fenêtres visent tous une fonction qui existe.');
};

main();
