#!/usr/bin/env node
'use strict';

/*
 * BANC D'ESSAI DU FIL D'ÉTAPES
 * =============================================================================
 * Ce fil s'est trompé DEUX FOIS, dans deux sens opposés :
 *
 *   1. D'abord il exigeait `k < i` pour verdir : revenir à l'étape 1 éteignait
 *      des étapes réellement validées. Une validité ne se perd pas parce qu'on a
 *      reculé.
 *   2. En corrigeant, j'ai retiré la condition de trop : une étape SANS champ
 *      obligatoire est « complète » d'office (`every` sur une liste vide rend
 *      TRUE), si bien que quatre étapes sur cinq étaient vertes AVANT d'être
 *      ouvertes — un formulaire vierge s'annonçait prêt.
 *
 * La règle juste tient en deux conditions, et il faut les deux :
 *      VERT  =  étape VISITÉE   ET   ses champs obligatoires remplis
 *
 * Un comportement qu'on a corrigé deux fois mérite une machine qui le vérifie,
 * pas un commentaire qui le rappelle. Le moteur est rejoué hors navigateur avec
 * un DOM minimal : ce sont les règles qu'on teste, pas le dessin.
 *
 *     node tools/banc-fil.js
 */

const { JS_SOCLE } = require('../src/fenetres/socle');

// ── Un DOM juste assez réel pour que le moteur tourne ───────────────────────
const champs = { 'p-nom': '', 'p-cat': '', 'p-poids': '', 'p-prix': '', 'p-cout': '' };
const inerte = {
  addEventListener() {}, classList: { add() {}, remove() {}, toggle() {} },
  focus() {}, innerHTML: '', disabled: false, onclick: null,
};
global.document = {
  getElementById: (id) => Object.assign({}, inerte, { value: champs[id] !== undefined ? champs[id] : '' }),
  querySelectorAll: () => [],
  querySelector: () => null,
  // ⚠ AJOUTÉ LE 2026-08-07, ET LE MANQUE ÉTAIT INSTRUCTIF. Le socle porte désormais
  // le signal « il y a quelqu'un », qui écoute les gestes sur le document ; sans ces
  // deux fonctions, ce banc s'effondrait au chargement. Et je l'ai presque manqué :
  // je ne cherchais que sa ligne de verdict dans la sortie — or un banc qui plante
  // n'imprime pas de verdict. Chercher la RÉUSSITE au lieu de vérifier l'ABSENCE
  // D'ÉCHEC est exactement l'erreur de méthode de la journée.
  addEventListener() {}, removeEventListener() {},
};
global.window = { addEventListener() {}, szPont: { appeler: () => Promise.resolve({ ok: true }) } };
global.dire = () => {};
global.esc = (s) => String(s == null ? '' : s);

// `eval` en module strict garde sa propre portée : on passe par une fonction qui
// RETOURNE le moteur.
const Assist = new Function(JS_SOCLE + '\nreturn Assist;')();

const ETAPES = [
  { t: 'Identité, prix et poids', obl: ['p-nom', 'p-cat', 'p-poids', 'p-prix', 'p-cout'] },
  { t: 'Tailles et couleurs',     obl: [] },
  { t: 'Photo',                   obl: [] },
  { t: 'Mise en marché',          obl: [] },
  { t: 'Stock',                   obl: [] },
];

let fautes = 0;
const vert = (k) => !!Assist.vus[k] && Assist.faite(k);
const exige = (quoi, attendu, obtenu) => {
  const ok = JSON.stringify(attendu) === JSON.stringify(obtenu);
  console.log('  ' + (ok ? 'OK  ' : 'NON ') + quoi
    + (ok ? '' : '\n       attendu ' + JSON.stringify(attendu) + ', obtenu ' + JSON.stringify(obtenu)));
  if (!ok) fautes++;
};
const verts = () => ETAPES.map((_, k) => vert(k));
const remplirEtape1 = () => {
  champs['p-nom'] = 'Robe'; champs['p-cat'] = 'robes';
  champs['p-poids'] = '350'; champs['p-prix'] = '125'; champs['p-cout'] = '40';
};

console.log('\n=== Fil des étapes : vert = visitée ET complète ===');
Assist.poser(ETAPES);

// 1. Rien n'est vert à l'ouverture — surtout pas les étapes sans obligation.
exige('à l’ouverture, aucune étape n’est verte',
  [false, false, false, false, false], verts());

// 2. Une étape sans champ obligatoire verdit dès qu'on l'a vue.
Assist.aller(1); Assist.aller(2);
exige('vues 2 et 3 (sans obligation) : vertes ; 4 et 5 jamais vues : grises',
  [false, true, true, false, false], verts());

// 3. L'étape 1 verdit quand ses cinq champs sont remplis.
remplirEtape1(); Assist.aller(0);
exige('étape 1 remplie : verte',
  [true, true, true, false, false], verts());

// 4. ⚠ ON NE VERDIT QUE CE QU'ON A VRAIMENT OUVERT. En sautant de 3 à 5 par le
//    fil, l'étape 4 doit rester grise — sinon on annoncerait un chemin parcouru
//    qui ne l'a pas été.
Assist.aller(4);
exige('saut de 3 à 5 : l’étape 4 reste grise',
  [true, true, true, false, true], verts());

// 5. LA DEMANDE D'ORIGINE : la validation PERSISTE quand on revient en arrière.
Assist.aller(0);
exige('retour à l’étape 1 : les verts acquis persistent',
  [true, true, true, false, true], verts());

// 6. Et elle se retire si la condition redevient fausse : un vert acquis n'est
//    pas un acquis définitif, sinon il mentirait.
champs['p-prix'] = '';
exige('prix vidé : l’étape 1 redevient grise',
  [false, true, true, false, true], verts());

// 7. Le fil se dessine sans erreur, et n'annonce ✓ que sur du vert.
Assist.aller(2);
remplirEtape1();
// ⚠ PAS d'`Object.assign` POUR PORTER UN ACCESSEUR : il copie la VALEUR lue du
// getter, pas le couple get/set. Mon premier banc capturait donc un HTML
// toujours vide et accusait le code — un test qui se trompe est pire qu'aucun
// test, parce qu'on corrige ce qui allait bien.
let html = '';
const pasFactice = {
  addEventListener() {}, classList: { add() {}, remove() {}, toggle() {} },
  focus() {}, disabled: false, onclick: null, value: '',
  set innerHTML(v) { html = v; },
  get innerHTML() { return html; },
};
global.document.getElementById = (id) => (id === 'pas'
  ? pasFactice
  : Object.assign({}, inerte, { value: champs[id] !== undefined ? champs[id] : '' }));
Assist.fil();
const crochets = (html.match(/✓/g) || []).length;
// L'étape courante affiche son NUMÉRO même si elle est valide : c'est là qu'on
// est, pas une case cochée. Donc 4 verts - 1 (courante) = 3 crochets.
exige('le fil affiche 3 crochets (4 étapes vertes, moins celle où l’on est)', 3, crochets);

console.log(fautes ? '\n>>> ' + fautes + ' règle(s) du fil violée(s)\n' : '\n>>> Le fil dit la vérité\n');
process.exit(fautes ? 1 : 0);
