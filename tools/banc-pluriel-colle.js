#!/usr/bin/env node
'use strict';

/*
 * LE PLURIEL NE SE FABRIQUE PAS EN AJOUTANT UNE LETTRE
 * =============================================================================
 * ⚠⚠⚠ LA DOCTRINE DU DEPOT L INTERDIT DEPUIS LE DEBUT DU CHANTIER BILINGUE, ET
 * RIEN NE LA MESURAIT : cent trente-neuf occurrences dans vingt-neuf fenetres,
 * sous trente-quatre bancs verts.
 *
 *     '${T(" photo")}' + (n > 1 ? 's' : '')
 *
 * Le radical passe par le dictionnaire, le << s >> non. En francais ca marche.
 * En anglais, ca marche PAR CHANCE quand le mot prend un s — et ca casse des
 * qu il n en prend pas :
 *
 *     Prix     -> Prices      (pas << Prixs >>)
 *     Taille   -> Sizes       (pas << Sizes >> par hasard : << Taille >> + s)
 *     Personne -> People      (pas << Persons >>)
 *     Cheval   -> Horses      un mot francais irregulier casse AUSSI en francais
 *
 * ⚠⚠ ET LE DEFAUT EST INVISIBLE DANS LA LANGUE OU L ON TRAVAILLE. En francais
 * tout est juste ; c est l anglais qui sort faux, et personne ne relit
 * l anglais. Meme forme que `banc-langue-connexion` : une cle oubliee donne un
 * ecran parfaitement normal en francais.
 *
 * ➡ **ON ECRIT LES DEUX ALTERNATIVES EN ENTIER.**
 *
 *     (n > 1 ? '${T(" photos")}' : '${T(" photo")}')
 *
 * ══ CE QUE CE BANC REFUSE ═══════════════════════════════════════════════════
 * Toute forme qui AJOUTE une lettre a cote d un texte, au lieu de choisir entre
 * deux textes ecrits :  ? 's' : ''   ? 'es' : ''   ? 'x' : ''
 *
 * ⚠ IL NE REGARDE PAS QUE LES TEXTES ENVELOPPES. Un litteral NU suivi d un
 * << s >> colle est doublement fautif — pas traduit ET mal pluralise — et c est
 * la forme la plus repandue des cent trente-neuf.
 *
 * ⚠ LES COMMENTAIRES SONT RETIRES AVANT LECTURE : ce fichier-ci en cite la
 * forme pour l expliquer, et plusieurs fenetres en font autant.
 *
 *   node tools/banc-pluriel-colle.js
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DOS = path.join(RACINE, 'src', 'fenetres');

/* ⚠ LA BORNE DU `/*` : voir `tools/textes-visibles.js`. */
const _nu = (s) => s
  .replace(/(^|[\s;{}(),=])\/\*[\s\S]*?\*\//g, (m, p) => p + m.slice(p.length).replace(/[^\n]/g, ' '))
  .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');

/* ⚠ `es` ET `x` AUTANT QUE `s` : le pluriel francais en -x (« bijoux »,
   « travaux ») est colle de la meme facon, et l anglais ne le suit jamais. */
const RX = /\?\s*(['"])(?:s|es|x)\1\s*:\s*\1\1/g;

let regardees = 0;
const fautes = [];

for (const f of fs.readdirSync(DOS).filter((x) => x.endsWith('.js')).sort()) {
  const src = _nu(fs.readFileSync(path.join(DOS, f), 'utf8'));
  regardees++;
  src.split('\n').forEach((ligne, i) => {
    RX.lastIndex = 0;
    let m, n = 0;
    while ((m = RX.exec(ligne))) n++;
    if (n) fautes.push({ f, n: i + 1, combien: n, texte: ligne.trim().slice(0, 120) });
  });
}

/* ⚠ UN BANC QUI NE REGARDE RIEN NE DOIT PAS DIRE << TOUT VA BIEN >>. */
if (regardees < 90) {
  console.error('✗ seulement ' + regardees + ' fenetre(s) lue(s) — le parcours ne marche plus.');
  process.exit(1);
}

const total = fautes.reduce((s, x) => s + x.combien, 0);
const fichiers = new Set(fautes.map((x) => x.f)).size;

console.log('');
console.log('== LE PLURIEL SE FABRIQUE-T-IL EN AJOUTANT UNE LETTRE ? ==');
console.log('  ' + regardees + ' fenetre(s) relue(s)');
console.log('');

if (!total) {
  console.log('>>> aucun pluriel colle : les deux alternatives sont ecrites en entier');
  process.exit(0);
}

console.error('ECHEC  ' + total + ' pluriel(s) colle(s) dans ' + fichiers + ' fenetre(s) :');
console.error('');
let dernier = '';
for (const x of fautes) {
  if (x.f !== dernier) { console.error('  ' + x.f); dernier = x.f; }
  console.error('      ' + x.n + '  ' + x.texte);
}
console.error('');
console.error('⚠ EN ANGLAIS LE PLURIEL NE S OBTIENT PAS TOUJOURS EN AJOUTANT UNE LETTRE.');
console.error('  Ecrivez les DEUX alternatives :  (n > 1 ? T("photos") : T("photo"))');
process.exit(1);
