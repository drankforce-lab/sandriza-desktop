#!/usr/bin/env node
'use strict';

/*
 * UN FILTRE N EST PAS UN RELEVE — les trois conclusions que le banc de
 * contraste au rendu n a pas le droit de tirer quand il n a peint qu une
 * fenetre
 * =============================================================================
 * ⚠⚠ CE QU IL GARDE. `banc-contraste-rendu.js` accepte `SZ_CONTRASTE_FENETRE`,
 * qui restreint le parcours a UNE fenetre. C est un bon reglage : << tout ou
 * rien >> pousse a ne rien lancer. Mais trois de ses conclusions supposent un
 * relevé COMPLET, et devenaient fausses sous filtre :
 *   1. LA DETTE ETEINTE. Le banc enumere les cles DECLAREES qui ne sont << plus
 *      rencontrees >> et propose de les retirer du fichier de declaration. Sous
 *      filtre, une cle << plus rencontree >> est une cle NON CHERCHEE : il
 *      proposait de retirer 63 lignes mesurees ailleurs, preuve a l appui.
 *      ⚠ Une ligne retiree ainsi ne revient pas toute seule — elle gardait une
 *      couleur, et plus rien ne la garde.
 *   2. LA DETTE QUI RECULE. Un compteur plus bas ne dit pas qu une couleur a
 *      ete corrigee : il dit qu on a peint moins d ecrans.
 *   3. LE VERDICT FINAL, qui s affichait sans nommer le filtre — or la ligne
 *      d ouverture a defile depuis longtemps quand le signe de succes parait.
 *
 * ⚠⚠ ET LE CLIQUET DOIT RESTER DEBOUT DANS L AUTRE SENS. Une dette qui MONTE
 * sous filtre a vraiment monte : un relevé partiel ne peut pas inventer des
 * endroits. Faire taire le cliquet des deux cotes est la correction la plus
 * simple, et la plus fausse — ce banc la refuse explicitement.
 *
 * ⚠ POURQUOI UN CONTROLE DE SOURCE ET PAS UN ESSAI. `banc-contraste-rendu.js`
 * ouvre Chrome des dizaines de fois : il ne tourne PAS sur le poste de
 * l utilisateur (il lui a fait tomber l affichage deux fois le 2026-09-05), il
 * tourne dans le travail `contrastes` de build.yml. Un garde qui exige un rendu
 * ne serait jamais joue au moment ou l on modifie le fichier. Celui-ci tourne en
 * quelques millisecondes, dans la meme rafale que les 22 autres.
 * ⚠ Le jumeau de ce banc, cote site, a pu etre eprouve sur des releves
 * FABRIQUES parce que sa regle de decision tient en deux fonctions pures
 * (tools/check/banc-contraste-filtre.js). Ici elle vit au milieu d un main() de
 * 900 lignes : on garde donc la FORME, en attendant de pouvoir garder le fond.
 *
 *   node tools/banc-filtre-pas-releve.js
 */

const fs = require('fs');
const path = require('path');

const FICHIER = path.join(__dirname, 'banc-contraste-rendu.js');
let src;
try { src = fs.readFileSync(FICHIER, 'utf8'); }
catch (e) {
  console.log('ECHEC  tools/banc-contraste-rendu.js illisible (' + e.message + ')');
  console.log('       Un banc qui ne lit rien ne doit pas repondre << tout va bien >>.');
  process.exit(1);
}

/* ⚠ COMMENTAIRES RETIRES AVANT DE CHERCHER. Cette fiche-ci, comme celle du banc
   garde, NOMME les conclusions interdites pour expliquer pourquoi elles le sont.
   Les compter ferait accuser la documentation qui garde la regle — la faute
   faite TROIS FOIS le 2026-09-12 en ecrivant des assertions de suppression. */
const nu = src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));

let mal = 0;
const dire = (ok, quoi, detail) => {
  if (ok) { console.log('  OK   ' + quoi); return; }
  mal++;
  console.log('  NON  ' + quoi);
  if (detail) console.log('       ' + detail);
};

console.log('');
console.log('== UN FILTRE N EST PAS UN RELEVE ==');

/* ── 1. LE FILTRE DOIT ETRE VISIBLE DE LA CONCLUSION ────────────────────────
   Il vivait dans la fonction qui coupe la liste des scenarios : le verdict ne
   savait donc pas qu un filtre etait actif. Un reglage que la conclusion ne voit
   pas est un reglage qui la fausse. */
const iDecl = nu.indexOf('const FILTRE_FENETRE =');
dire(iDecl > 0 && iDecl < nu.indexOf('function main'),
  'le filtre est lu AU NIVEAU DU FICHIER, donc visible du verdict',
  'declare dans une fonction, il redevient invisible de la conclusion');

/* ── 2. LES TROIS CONCLUSIONS SONT GARDEES ─────────────────────────────────── */
const gardee = (quoi) => new RegExp(quoi + '\.length && FILTRE_FENETRE').test(nu);
dire(gardee('eteintes'),
  'la DETTE ETEINTE ne se conclut pas sous filtre',
  'sans ce garde, il propose de retirer des lignes mesurees dans les fenetres non peintes');
dire(gardee('baisse'),
  'la DETTE QUI RECULE ne se conclut pas sous filtre',
  'un compteur plus bas sous filtre dit qu on a peint moins, pas qu on a corrige');

const iVerdict = nu.indexOf('if (mal === 0)');
dire(iVerdict > 0 && nu.indexOf('FILTRE_FENETRE', iVerdict) > 0,
  'le verdict final NOMME le filtre',
  'la ligne d ouverture a defile : c est le signe de succes qu on retient');

/* ── 3. ⚠⚠ ET LE CLIQUET RESTE DEBOUT DANS L AUTRE SENS ────────────────────
   `monte` ne doit PAS etre garde par le filtre. C est le point ou une correction
   paresseuse passerait inapercue : tout serait vert, et le banc ne refuserait
   plus rien. */
dire(!/monte\.length && FILTRE_FENETRE/.test(nu) && /if \(monte\.length\)/.test(nu),
  'le REFUS tient sous filtre : une dette qui MONTE est toujours refusee',
  'un releve partiel ne peut pas inventer des endroits — faire taire le cliquet '
  + 'des deux cotes serait plus simple, et faux');

/* ── 4. ET LE REFUS D UN FILTRE QUI NE DESIGNE RIEN NE DOIT PAS PARTIR ────── */
dire(nu.indexOf('ne designe aucune fenetre') > 0,
  'un filtre qui ne trouve aucune fenetre refuse encore',
  'un banc sur zero scenario dirait << tout est bon >> : faux et rassurant');

console.log('');
if (mal) {
  console.log('>>> ' + mal + ' probleme(s) — un filtre pourrait de nouveau se faire passer pour un releve');
  process.exit(1);
}
console.log('>>> un passage filtre ne conclut plus sur les fenetres qu il n a pas peintes');
