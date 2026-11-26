#!/usr/bin/env node
'use strict';

/*
 * LES DEUX GARDES DES CHAMPS DISENT LA MÊME CHOSE
 * =============================================================================
 * Le contrôle des champs (9.2.43) existe en DEUX exemplaires : `_szChampsGarde`
 * dans le socle des fenêtres (src/fenetres/socle.js) et `assets/js/champs.js`
 * dans le dépôt du SITE (boutique + administration web). Deux copies d'une même
 * règle finissent par diverger — c'est le piège des homonymes, déjà payé deux
 * fois ici. Ce banc les FAIT TOURNER toutes les deux sur les mêmes saisies et
 * exige le même résultat, caractère pour caractère.
 *
 * Le dépôt du site est cherché à côté de celui-ci (../Sandriza). Absent (la
 * construction sur GitHub ne l'a pas) : le banc le DIT et passe — il ne prétend
 * pas avoir comparé.
 *
 *   node tools/banc-champs-jumeaux.js
 */

const fs = require('fs');
const path = require('path');

const SITE = path.join(__dirname, '..', '..', 'Sandriza', 'assets', 'js', 'champs.js');
if (!fs.existsSync(SITE)) { console.log('  --  dépôt du site absent (' + SITE + ') : comparaison NON faite'); process.exit(0); }

/* Un faux document : on capte les écouteurs, on n'a besoin que des fonctions de filtrage. */
function charger(code, nomSorte) {
  const ecouteurs = {};
  const doc = { addEventListener: (t, f) => { ecouteurs[t] = f; }, querySelectorAll: () => [], createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {} }),
    head: { appendChild() {} }, documentElement: { lang: 'fr' }, body: { appendChild() {} } };
  const win = { innerWidth: 1000, innerHeight: 800 };
  const fn = new Function('window', 'document', 'Event', code + ';return window;');
  fn(win, doc, function Event() {});
  return { ecouteurs, win };
}

/* Le socle : sa fonction est exposée telle quelle (JS_CHAMPS l'appelle avec les messages). */
const SOCLE = require('../src/fenetres/socle.js');
const bureau = charger(SOCLE.JS_CHAMPS());
const site = charger(fs.readFileSync(SITE, 'utf8'));

/* On rejoue l'écouteur beforeinput de chacun : ce qu'il laisse passer, ce qu'il insère, ce qu'il refuse. */
function jouer(G, attrs, valeur, txt) {
  const e = { tagName: 'INPUT', readOnly: false, disabled: false, id: attrs.id || '', name: '', value: valeur,
    selectionStart: valeur.length, selectionEnd: valeur.length, classList: { add() {}, remove() {} }, offsetWidth: 0,
    getAttribute: (k) => (k in attrs ? attrs[k] : null), hasAttribute: (k) => k in attrs,
    getBoundingClientRect: () => ({ left: 0, top: 0, bottom: 20, right: 100 }), dispatchEvent() {},
    setRangeText(t) { this.value = this.value.slice(0, this.selectionStart) + t + this.value.slice(this.selectionEnd); } };
  let empeche = false;
  const ev = { target: e, inputType: 'insertText', data: txt, preventDefault() { empeche = true; } };
  const avant = global.document;
  global.document = { execCommand: () => false };
  try { G.ecouteurs.beforeinput(ev); } finally { global.document = avant; }
  return empeche ? 'filtré→' + JSON.stringify(e.value) : 'passe';
}

const CHAMPS = [
  { type: 'number', min: '0' }, { type: 'number' }, { inputmode: 'decimal' }, { inputmode: 'decimal', 'data-negatif': '' },
  { inputmode: 'numeric' }, { type: 'tel' }, { id: 'co-postal' }, { id: 'biz-phone' }, { 'data-sz-filtre': 'code' },
  { 'data-sz-filtre': 'chiffres' }, { 'data-sz-filtre': 'alnum' }, { 'data-sz-filtre': 'aucun', inputmode: 'numeric' }, { id: 'nom' },
];
const SAISIES = [['', 'e'], ['', '-5'], ['12', ',5'], ['12,5', ','], ['', '12$'], ['', '1 234,56'], ['', 'abc'], ['', '-3,5'],
  ['', 'h1a 1a1'], ['', '(514) 555-0123'], ['', '123456789 rt0001'], ['', 'Élodie & co'], ['', '+'], ['', '%']];

let ecarts = 0, n = 0;
for (const a of CHAMPS) for (const [v, t] of SAISIES) {
  n++;
  const rb = jouer(bureau, a, v, t), rs = jouer(site, a, v, t);
  if (rb !== rs) { ecarts++; console.log('  ✗  ' + JSON.stringify(a) + ' [' + v + '] + « ' + t + ' » : bureau ' + rb + ' · site ' + rs); }
}
console.log(ecarts ? '\n>>> ' + ecarts + ' écart(s) sur ' + n + ' saisies : les deux gardes ne disent plus la même chose'
  : '  OK  ' + n + ' saisies, les deux gardes rendent le même résultat');
process.exit(ecarts ? 1 : 0);
