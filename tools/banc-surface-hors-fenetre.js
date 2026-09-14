#!/usr/bin/env node
'use strict';

/*
 * CE QUI PARLE SANS ETRE UNE FENETRE — ET QUI LE MESURE ?  (tache #99)
 * =============================================================================
 * ⚠⚠⚠ LE DEFAUT QUE CE BANC EXISTE POUR RENDRE VISIBLE, ET IL S EST PAYE CINQ
 * FOIS EN DEUX JOURS : *un verdict vert ne dit jamais ou s arrete le terrain
 * qu il a balaye.*
 *
 * Presque tous les bancs de langue, de contraste et de rendu lisent
 * `src/fenetres/`. C est la que vivent 98 ecrans sur 99, donc le choix se
 * defend. Mais tout ce qui parle a quelqu un SANS etre une page tombe dehors :
 * une boite de dialogue, une notification, un menu, une infobulle. Ces
 * textes-la ne sont dessines nulle part — aucun rendu ne peut les relire.
 *
 * ⚠ ET CE N EST PAS THEORIQUE. Le 2026-09-13, « PANNEAU D ADMINISTRATION » et
 * les titres de 23 fenetres sont restes francais sur une session anglaise
 * precisement parce qu ils etaient poses AVANT que la page existe. Meme famille.
 *
 * ── CE QU IL FAIT ────────────────────────────────────────────────────────────
 * 1. Il ENUMERE, depuis le code, tous les appels aux API qui montrent du texte
 *    hors d une page — dans `src/*.js` (le processus principal), jamais dans
 *    `src/fenetres/`, qui est le terrain des autres bancs.
 * 2. Il exige que chaque famille (fichier + API) soit declaree dans
 *    `surface-hors-fenetre-declaree.js`, AVEC SON COMPTE. Un appel ajoute fait
 *    changer le compte, donc echouer : on est oblige de revenir declarer qui
 *    mesure ce texte. C est le seul moment ou la question se pose vraiment.
 * 3. Il refuse les declarations PERIMEES — une famille declaree qui n existe
 *    plus. Une carte qui garde des morts finit par ne plus etre relue.
 * 4. ⚠⚠ IL VERIFIE LA COUVERTURE AU LIEU DE LA CROIRE : quand une declaration
 *    nomme un banc, il contrôle que ce banc LIT vraiment le fichier. Une
 *    couverture affirmee et fausse est pire que pas de couverture — on cesse de
 *    regarder.
 *
 * ── CE QU IL NE REGARDE PAS, ET UN VERT NE LE DIRA PAS ───────────────────────
 *   . il ne lit PAS le contenu des textes : il ne dit pas si une phrase est
 *     traduite, seulement QUI est charge de le verifier ;
 *   . il ne couvre QUE le processus principal. Le site (`assets/js/`) a ses
 *     propres surfaces hors page — documents imprimes, courriels — et elles
 *     restent hors de ce releve. C est le terrain suivant ;
 *   . une famille declaree `AUCUN` reste declaree `AUCUN` : ce banc rend le trou
 *     VISIBLE, il ne le bouche pas.
 *
 *   node tools/banc-surface-hors-fenetre.js
 */

const fs = require('fs');
const path = require('path');
const { SURFACES } = require('./surface-hors-fenetre-declaree.js');

const RACINE = path.join(__dirname, '..');

/* Les API qui montrent du texte hors d une page. Chaque motif est ancre sur la
   forme d APPEL, pas sur le mot : `Notification` seul apparait aussi dans des
   commentaires et des noms de variables. */
const API = [
  { nom: 'dialog.showMessageBoxSync', rx: /\bdialog\.showMessageBoxSync\s*\(/g },
  { nom: 'dialog.showMessageBox',     rx: /\bdialog\.showMessageBox\s*\(/g },
  { nom: 'dialog.showErrorBox',       rx: /\bdialog\.showErrorBox\s*\(/g },
  { nom: 'dialog.showOpenDialog',     rx: /\bdialog\.showOpenDialog\s*\(/g },
  { nom: 'dialog.showSaveDialog',     rx: /\bdialog\.showSaveDialog\s*\(/g },
  { nom: 'new Notification',          rx: /\bnew\s+Notification\s*\(/g },
  { nom: 'Menu.buildFromTemplate',    rx: /\bMenu\.buildFromTemplate\s*\(/g },
  { nom: 'setToolTip',                rx: /\.setToolTip\s*\(/g },
];

/* ⚠ COMMENTAIRES RETIRES AVANT DE COMPTER. Cette fiche-ci et celle de la
   declaration CITENT ces API pour les expliquer : les compter ferait accuser la
   documentation qui garde la regle. Meme lecon que `banc-permissions` et
   `banc-langue-mesures`. */
const _nu = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');

console.log('');
console.log('== CE QUI PARLE SANS ETRE UNE FENETRE — QUI LE MESURE ? ==');

/* ── 1. LE RELEVE, DEPUIS LE CODE ─────────────────────────────────────────── */
const vus = new Map();          // 'fichier|api' -> compte
let fichiers = 0;
for (const f of fs.readdirSync(path.join(RACINE, 'src')).sort()) {
  if (!f.endsWith('.js')) continue;
  const rel = 'src/' + f;
  const src = _nu(fs.readFileSync(path.join(RACINE, rel), 'utf8'));
  fichiers++;
  for (const { nom, rx } of API) {
    rx.lastIndex = 0;
    const n = (src.match(rx) || []).length;
    if (n > 0) vus.set(rel + '|' + nom, n);
  }
}
/* ⚠ `showMessageBoxSync` CONTIENT `showMessageBox` : sans cette correction, un
   appel synchrone serait compte DEUX fois, et le cliquet mentirait de facon
   stable — donc de facon invisible. Trouve en ecrivant le banc, pas apres. */
for (const [cle, n] of [...vus]) {
  if (!cle.endsWith('|dialog.showMessageBox')) continue;
  const sync = vus.get(cle + 'Sync') || 0;
  if (sync > 0) vus.set(cle, n - sync);
}

console.log('  ' + fichiers + ' fichier(s) du processus principal · '
  + vus.size + ' famille(s) de surface relevee(s)');

const fautes = [];

/* ── 2. CHAQUE FAMILLE RELEVEE EST-ELLE DECLAREE, AU BON COMPTE ? ─────────── */
for (const [cle, n] of [...vus].sort()) {
  const d = SURFACES[cle];
  if (!d) {
    fautes.push('« ' + cle + ' » (' + n + ' endroit(s)) n est PAS declaree.\n'
      + '        Ce texte parle a quelqu un hors de toute page : dire QUI le mesure, '
      + 'ou ecrire AUCUN et pourquoi.');
    continue;
  }
  if (Number(d.n) !== n) {
    fautes.push('« ' + cle + ' » : ' + n + ' endroit(s) dans le code, ' + d.n
      + ' declare(s).\n        Le compte est un cliquet : si un appel a ete AJOUTE, '
      + 'declarer qui mesure son texte. S il a ete RETIRE, corriger le compte.');
  }
}

/* ── 3. LES DECLARATIONS PERIMEES ─────────────────────────────────────────── */
for (const cle of Object.keys(SURFACES).sort()) {
  if (!vus.has(cle)) {
    fautes.push('« ' + cle +' » est declaree mais n existe plus dans le code — '
      + 'une carte qui garde des morts finit par ne plus etre relue.');
  }
}

/* ── 4. ⚠⚠ LA COUVERTURE EST VERIFIEE, PAS CRUE ───────────────────────────── */
for (const [cle, d] of Object.entries(SURFACES)) {
  if (!d.banc || d.banc === 'AUCUN') continue;
  const chemin = path.join(RACINE, d.banc);
  if (!fs.existsSync(chemin)) {
    fautes.push('« ' + cle + ' » se dit couverte par ' + d.banc
      + ', qui N EXISTE PAS. Une couverture affirmee et fausse est pire que rien.');
    continue;
  }
  const fichier = cle.split('|')[0];
  if (fs.readFileSync(chemin, 'utf8').indexOf(fichier) < 0) {
    fautes.push('« ' + cle + ' » se dit couverte par ' + d.banc
      + ', mais ce banc ne LIT PAS ' + fichier + '.\n'
      + '        La declaration serait une promesse, pas une mesure.');
  }
  if (!d.quoi || String(d.quoi).length < 40) {
    fautes.push('« ' + cle + ' » n explique pas CE QU ELLE MONTRE — une ligne de '
      + 'carte sans legende ne se relit pas.');
  }
}

if (fautes.length) {
  console.log('\nECHEC  ' + fautes.length + ' probleme(s) :');
  for (const f of fautes) console.log('   — ' + f);
  console.log('\n⚠ Declarer dans tools/surface-hors-fenetre-declaree.js.');
  console.log('  Un verdict vert ne dit jamais ou s arrete le terrain balaye :');
  console.log('  ce fichier-la est le seul endroit qui le dise.');
  process.exit(1);
}

const sans = Object.entries(SURFACES).filter(([, d]) => d.banc === 'AUCUN');
console.log('');
if (sans.length) {
  console.log('  ⚠ ' + sans.length + ' famille(s) que RIEN ne mesure, declaree(s) comme telle(s) :');
  for (const [cle] of sans) console.log('      ' + cle);
  console.log('');
}
console.log('>>> chaque surface hors fenetre est declaree, et sa couverture verifiee\n');
