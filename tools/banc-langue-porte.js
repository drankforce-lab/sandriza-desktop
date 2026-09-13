#!/usr/bin/env node
'use strict';

/*
 * LES ECRANS DE CHARGEMENT ONT-ILS TOUS LEUR TRADUCTION ?
 * =============================================================================
 * Sa demande du 2026-09-12 : « les ecrans de chargement aussi devront etre
 * traduits ».
 *
 * ⚠⚠ POURQUOI CEUX-LA ECHAPPENT A TOUS LES AUTRES BANCS. `banc-langue-fenetres`
 * et `banc-langue-residuel` lisent `src/fenetres/` : ils DESSINENT une page et
 * la relisent. Les ecrans de chargement, eux, sont batis dans `main.js` — le
 * processus principal d Electron, qu aucun banc ne peut faire tourner sans
 * lancer toute l application. Ils etaient donc le seul endroit de la coquille ou
 * une phrase pouvait rester francaise sans que rien ne le dise.
 *
 * ⚠⚠⚠ ET CE SONT LES PIRES A LAISSER EN FRANCAIS : ils paraissent au demarrage,
 * pendant la verification, le telechargement et l INSTALLATION — c est-a-dire
 * aux moments ou l on ne peut rien faire d autre que les lire. Un ecran anglais
 * qui commence par « Preparation de l application… » dit tout de suite que la
 * traduction est a moitie faite.
 *
 * ══ CE QU IL VERIFIE, DANS LES DEUX SENS ════════════════════════════════════
 *   1. chaque `TP('…')` ecrit dans le code a une entree au dictionnaire ;
 *   2. aucune entree du dictionnaire ne DORT (plus personne ne la demande).
 * Le second sens compte autant : une entree orpheline est une phrase qu on croit
 * traduite et que l ecran n affiche plus.
 *
 * ⚠ Le SEPARATEUR DECIMAL ne passe PAS par le dictionnaire — c est une regle de
 * LOCALE, lue dans la langue courante. Un essai contraire a donne
 * « 2__decimale__5 Mo » a l ecran : `T(fr)` rend la CLE telle quelle en
 * francais, c est tout son principe.
 *
 *   node tools/banc-langue-porte.js
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DICO = require('../src/langue/porte.js');
/* Les fichiers qui batissent un ecran de chargement. Une liste NOMMEE plutot
   qu un parcours : ces deux-la sont les seuls, et le jour ou un troisieme
   arrive, il doit etre ajoute SCIEMMENT. */
const SOURCES = ['src/main.js', 'src/porte-progression.js'];

const sansCommentaires = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/[^\n]/g, ' '));

/* Un appel `TP('…')` ou `T('…')`, guillemets simples ou doubles, echappements
   compris. ⚠ On decrit la chaine EN ENTIER : « jusqu au premier ) » couperait
   `T('La version {0} est prête.')` sur la parenthese d une abreviation. */
const APPEL = /\bTP?\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;

const demandes = new Map();   // texte -> [fichiers]
let lus = 0;

for (const rel of SOURCES) {
  const f = path.join(RACINE, rel);
  if (!fs.existsSync(f)) {
    console.log('  NON  ' + rel + ' est introuvable — le banc ne mesure plus ce qu il croit.');
    process.exit(1);
  }
  lus++;
  const s = sansCommentaires(fs.readFileSync(f, 'utf8'));
  let m;
  APPEL.lastIndex = 0;
  while ((m = APPEL.exec(s))) {
    const t = (m[1] !== undefined ? m[1] : m[2])
      .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    if (!demandes.has(t)) demandes.set(t, []);
    demandes.get(t).push(rel);
  }
}

console.log('');
console.log('== LES ECRANS DE CHARGEMENT, DANS LES DEUX LANGUES ==');
console.log('  ' + lus + ' fichier(s) lu(s) · ' + demandes.size + ' texte(s) demande(s) · '
  + Object.keys(DICO).length + ' entree(s) au dictionnaire');
console.log('');

/* ⚠ UN BANC QUI NE TROUVE RIEN NE DOIT PAS SE TAIRE : zero demande se lirait
   comme « tout est traduit » alors que plus rien ne serait mesure. */
if (demandes.size < 5) {
  console.log('  NON  ' + demandes.size + ' texte(s) seulement — le motif de lecture ne marche plus.');
  process.exit(1);
}

let mal = 0;

const sansTraduction = [...demandes.keys()].filter((t) => DICO[t] === undefined);
if (sansTraduction.length) {
  mal += sansTraduction.length;
  console.log('  NON  ' + sansTraduction.length + ' texte(s) demande(s) SANS traduction :');
  sansTraduction.forEach((t) => console.log('         ' + JSON.stringify(t)
    + '   [' + demandes.get(t).join(', ') + ']'));
  console.log('');
}

/* ⚠ L AUTRE SENS. Une entree que plus personne ne demande est une phrase qu on
   croit traduite et que l ecran n affiche plus — ou une cle mal recopiee. */
const dorment = Object.keys(DICO).filter((k) => !demandes.has(k));
if (dorment.length) {
  mal += dorment.length;
  console.log('  NON  ' + dorment.length + ' entree(s) du dictionnaire que PERSONNE ne demande :');
  dorment.forEach((k) => console.log('         ' + JSON.stringify(k)));
  console.log('');
}

/* ⚠ ET LES PLACEHOLDERS : `{0}` present d un cote et pas de l autre donne une
   phrase anglaise ou le chiffre MANQUE. Le francais l affichait pourtant. */
const trous = [];
for (const [fr, en] of Object.entries(DICO)) {
  const a = (fr.match(/\{\d\}/g) || []).sort().join(',');
  const b = (String(en).match(/\{\d\}/g) || []).sort().join(',');
  if (a !== b) trous.push([fr, a || '(aucun)', b || '(aucun)']);
}
if (trous.length) {
  mal += trous.length;
  console.log('  NON  ' + trous.length + ' entree(s) dont les valeurs variables ne correspondent pas :');
  trous.forEach(([fr, a, b]) => console.log('         ' + JSON.stringify(fr) + '  fr:' + a + '  en:' + b));
  console.log('');
}

if (mal) {
  console.log('>>> ' + mal + ' probleme(s) — un ecran de chargement resterait en francais.');
  process.exit(1);
}
console.log('>>> les ' + demandes.size + ' textes demandes ont leur traduction, et aucune entree ne dort');
