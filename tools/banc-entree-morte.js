#!/usr/bin/env node
'use strict';

/*
 * UNE ENTRÉE DE MENU À PLUSIEURS DROITS OUVRE-T-ELLE UNE FENÊTRE VIVANTE ?
 * =============================================================================
 * ⚠⚠⚠ LE DÉFAUT QUE CE BANC EXISTE POUR ATTRAPER, ET IL A ÉTÉ COMMIS :
 * le 2026-09-14 (#106b), l'entrée « Journaux » est passée de `perm: 'staff'` à
 * `perm: ['staff','newsletter']`, pour que le marketing retrouve SON journal
 * d'envoi, devenu un onglet de cette fenêtre la veille.
 *
 * Une ligne — et la fenêtre était MORTE pour la moitié des gens qu'on venait
 * d'y inviter. Son `charger()` appelle `journal:donnees`, qui exige la lecture
 * de sécurité ; à quelqu'un qui n'a que `newsletter`, ce cœur répond
 * « droit », et le code SORTAIT SANS APPELER `rendre()` — donc sans `tabs()`.
 * Résultat : une fenêtre vide, pas même un onglet, et le journal d'envoi
 * inatteignable par le seul chemin qui y menait.
 *
 * ⚠ C'EST LA FORME LA PLUS TRAÎTRE DU MASQUAGE : l'entrée paraît, elle s'ouvre,
 * rien n'échoue bruyamment. Une entrée ABSENTE se remarque ; une entrée qui
 * ouvre le vide se prend pour une panne, et on la cherche ailleurs.
 *
 * ⚠⚠ POURQUOI AUCUN AUTRE BANC NE LE VOYAIT :
 *   · `banc-permissions` compare modèle / masquage / garde — les trois listes
 *     parlaient bien des mêmes jetons. `staff` et `newsletter` existent tous
 *     les deux. De son point de vue, rien à signaler, et son vert était juste ;
 *   · les bancs de rendu ouvrent les fenêtres en SUPER-ADMINISTRATEUR, pour qui
 *     aucun cœur ne refuse : le repli n'est jamais emprunté ;
 *   · la faute n'est ni dans le menu ni dans la fenêtre, mais dans L'ÉCART
 *     ENTRE LES DEUX — et personne ne mesurait un écart.
 *
 * ── LA RÈGLE ────────────────────────────────────────────────────────────────
 * Toute entrée d'`appbar.js` qui admet PLUSIEURS jetons (`perm: [...]`) et qui
 * nomme une fenêtre (`app:`) doit, dans cette fenêtre, TRAITER le refus de
 * droit : y chercher `motif === 'droit'`. Sans ce traitement, le jeton le plus
 * étroit ouvre une fenêtre vide.
 *
 * ⚠⚠ CE QUE CE BANC NE REGARDE PAS — et un vert ne le dira pas :
 *   · il ne lit QUE les entrées à plusieurs jetons. Une entrée à jeton unique
 *     dont le cœur est gardé plus étroitement que le menu tombe dans le même
 *     trou, et il n'en dit rien. Il y en a 89 avec `app:` ; les mesurer toutes
 *     demande de relier chaque fenêtre au cœur qu'elle appelle EN PREMIER, ce
 *     qui n'est pas écrit et se devine mal. C'est le terrain suivant ;
 *   · il vérifie qu'un repli EXISTE, pas qu'il soit BON. Que le repli mène au
 *     bon onglet, aucun relevé ne le sait — cela s'éprouve à l'écran.
 *
 *   node tools/banc-entree-morte.js
 */

const fs = require('fs');
const path = require('path');

const SITE = path.join(__dirname, '..', '..', 'Sandriza', 'assets', 'js');
const FEN = path.join(__dirname, '..', 'src', 'fenetres');

if (!fs.existsSync(path.join(SITE, 'appbar.js'))) {
  console.log('— `appbar.js` introuvable (dépôt du site absent) : contrôle sauté. '
    + 'Il tourne dans build.yml, où les deux dépôts sont là.');
  process.exit(0);
}

const appbar = fs.readFileSync(path.join(SITE, 'appbar.js'), 'utf8');

console.log('== UNE ENTRÉE À PLUSIEURS DROITS OUVRE-T-ELLE UNE FENÊTRE VIVANTE ? ==');

/* On relève les entrées qui portent À LA FOIS `perm: [...]` et `app: '…'`.
   ⚠ Le relevé se fait sur un objet SANS accolade interne : les entrées de menu
   sont plates, et une expression régulière qui accepterait des accolades
   imbriquées avalerait le menu entier d'un coup. */
const entrees = [];
const rx = /\{[^{}]*\}/g;
let m;
while ((m = rx.exec(appbar))) {
  const bloc = m[0];
  const mPerm = bloc.match(/\bperm:\s*\[([^\]]*)\]/);
  const mApp = bloc.match(/\bapp:\s*'([^']+)'/);
  if (!mPerm || !mApp) continue;
  const jetons = [];
  const rxJ = /'([^']+)'/g;
  let mJ;
  while ((mJ = rxJ.exec(mPerm[1]))) jetons.push(mJ[1]);
  const mLabel = bloc.match(/\blabel:\s*'([^']*)'/);
  entrees.push({ app: mApp[1], jetons, label: mLabel ? mLabel[1] : mApp[1] });
}

console.log('  ' + entrees.length + ' entrée(s) de menu à plusieurs jetons');

const fautes = [];

for (const e of entrees) {
  const fichier = path.join(FEN, e.app + '.js');
  if (!fs.existsSync(fichier)) {
    fautes.push('« ' + e.label + ' » nomme la fenêtre « ' + e.app
      + " », qui n'existe pas dans src/fenetres — l'entrée serait MUETTE");
    continue;
  }
  const src = fs.readFileSync(fichier, 'utf8');
  // Les deux écritures qu'on croise dans ces fenêtres, espacée ou non.
  if (!/motif\s*===\s*'droit'/.test(src)) {
    fautes.push('« ' + e.label + ' » (fenêtre ' + e.app + ') admet ' + e.jetons.length
      + ' jetons — ' + e.jetons.join(', ') + " — mais la fenêtre ne traite jamais un refus "
      + "de droit (`motif === 'droit'` absent) : le jeton le plus étroit ouvrirait "
      + 'une fenêtre VIDE, sans même un onglet');
  }
}

if (fautes.length) {
  console.log('\nECHEC  ' + fautes.length + ' entrée(s) qui ouvrent le vide :');
  for (const f of fautes) console.log('   — ' + f);
  console.log('\n⚠ Une entrée ABSENTE se remarque ; une entrée qui OUVRE LE VIDE');
  console.log('  se prend pour une panne. Le menu invite, la fenêtre doit tenir.');
  process.exit(1);
}

console.log('\n>>> chaque entrée à plusieurs droits mène à une fenêtre qui tient\n');
