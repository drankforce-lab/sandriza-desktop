#!/usr/bin/env node
'use strict';

/*
 * BANC DU MODE JOUR — LES COULEURS DE TEXTE SONT-ELLES LISIBLES ?
 * =============================================================================
 * ⚠⚠ POURQUOI CE BANC EXISTE, ET POURQUOI SI TARD. Le 2026-09-04, deux captures :
 * « en plus en mode jour regarde ce n'est pas beau ». La mesure a donné 2 300
 * déclarations de couleur de texte littérales dans les 91 fenêtres, presque
 * toutes des couleurs de MODE SOMBRE posées sur le fond CLAIR du mode jour —
 * #8fa1b8 sur 828 endroits à 2.36 de ratio, #e8edf5 sur 320 à 1.05, invisible.
 *
 * Rien ne pouvait le dire. Le dépôt du SITE a son banc de contraste
 * (`tools/check/banc-contraste.js`), mais il vit là-bas et ne voit pas les
 * fenêtres natives ; il exclut d'ailleurs déjà l'administration sombre. Côté
 * coquille, AUCUN contrôle ne regardait une couleur. C'est ainsi qu'une dette de
 * 2 300 déclarations s'accumule sans qu'un seul rouge s'allume.
 *
 * Ce banc mesure, pour chaque déclaration de couleur de TEXTE écrite en dur dans
 * une fenêtre, le ratio WCAG contre le fond du mode jour (#f4f2ec). Il ne juge
 * pas le mode sombre : là, ces couleurs sont justes — c'est leur emploi en jour
 * qui est faux.
 *
 * ⚠ CE N'EST PAS UNE PORTE FERMÉE, C'EST UN CLIQUET. Il reste une queue de
 * déclarations d'un ou deux endroits, chacune une nuance unique : les convertir
 * toutes demanderait cinquante jetons pour cinquante emplois. Elles sont donc
 * DÉCLARÉES avec leur nombre, et le banc refuse qu'une seule de plus paraisse.
 * Même parti pris que `contraste-declare.js` dans le dépôt du site : une dette
 * chiffrée et plafonnée ne peut que descendre.
 *
 * ⚠ CE QU'IL NE REGARDE PAS, ET C'EST VOULU : les fonds et les bordures. La même
 * couleur n'a pas le même rôle, et un fond clair en jour n'est pas la version
 * assombrie d'un fond sombre — ça se traite au cas par cas, pas au ratio.
 * ⚠ IL IGNORE CE QUI EST DÉJÀ DANS UNE REPRISE `html.jour` : ces valeurs SONT les
 * valeurs de jour, les mesurer contre le fond de jour est justement le but.
 *
 *   node tools/banc-contraste-jour.js
 *   node tools/banc-contraste-jour.js --liste     (le détail, fichier par fichier)
 */

const fs = require('fs');
const path = require('path');
const DECLARE = require('./contraste-jour-declare.js');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');
const FOND_JOUR = '#f4f2ec';
const SEUIL = 4.5;

const hx = (h) => {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16));
};
const lum = (rgb) => {
  const v = rgb.map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const ratio = (a, b) => {
  const l1 = lum(hx(a)), l2 = lum(hx(b));
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
};

// ⚠ LE PREFIXE EST CAPTURE ET REMIS : sans lui, on confondrait `color:` avec
// `background-color:` ou `border-color:`, qui ne sont PAS du texte.
const RX = /(^|[;{\s"'])color\s*:\s*(#[0-9a-fA-F]{3,6})/gm;

const trouve = new Map();          // couleur -> { n, fichiers:Set }
let lus = 0;
for (const f of fs.readdirSync(DOSSIER).filter((x) => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(DOSSIER, f), 'utf8');
  lus++;
  let m;
  RX.lastIndex = 0;
  while ((m = RX.exec(src))) {
    const amont = src.slice(Math.max(0, m.index - 500), m.index);
    if (/html\.jour[^{}]*\{[^{}]*$/.test(amont)) continue;   // deja une valeur de jour
    const c = m[2].toLowerCase();
    if (ratio(c, FOND_JOUR) >= SEUIL) continue;
    if (!trouve.has(c)) trouve.set(c, { n: 0, fichiers: new Set() });
    const e = trouve.get(c);
    e.n++; e.fichiers.add(f);
  }
}

/* ── LES VOILES DE SURFACE ───────────────────────────────────────────────────
   Autre moitie du meme defaut, meme jour : 1 401 emplois de blanc translucide
   (rgba(255,255,255,x)) dans 89 fenetres. Juste en mode sombre, invisible en
   mode jour : la bordure disparait, la carte perd son contour, le bouton flotte
   sans cadre. Convertis en jetons --v03..--v90 (voir la fiche du socle).
   ⚠ On refuse tout NOUVEAU blanc translucide hors des reprises html.jour : il
   n'y a aucune raison d'en ecrire un, le jeton existe. Zero tolere, donc pas de
   plafond a declarer — c'est plus simple ET plus strict que pour les couleurs de
   texte, ou une nuance unique peut se justifier. */
const RX_VOILE = /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*[0-9.]+\s*\)/g;
const voiles = new Map();
for (const f of fs.readdirSync(DOSSIER).filter((x) => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(DOSSIER, f), 'utf8');
  let m;
  RX_VOILE.lastIndex = 0;
  while ((m = RX_VOILE.exec(src))) {
    const amont = src.slice(Math.max(0, m.index - 500), m.index);
    if (/html\.jour[^{}]*\{[^{}]*$/.test(amont)) continue;
    voiles.set(f, (voiles.get(f) || 0) + 1);
  }
}

const detail = process.argv.includes('--liste');
let mal = 0, total = 0;
const lignes = [];
for (const [c, e] of [...trouve.entries()].sort((a, b) => b[1].n - a[1].n)) {
  total += e.n;
  const plafond = DECLARE.RESTE[c];
  if (plafond === undefined) {
    mal++;
    lignes.push(['NEUF', c, e.n, e.fichiers, 'jamais declaree — a convertir en jeton, ou a inscrire dans contraste-jour-declare.js']);
  } else if (e.n > plafond) {
    mal++;
    lignes.push(['MONTE', c, e.n, e.fichiers, 'plafond ' + plafond + ' depasse — la dette GAGNE du terrain']);
  } else if (e.n < plafond) {
    lignes.push(['BAISSE', c, e.n, e.fichiers, 'plafond ' + plafond + ' : resserrer a ' + e.n]);
  } else if (detail) {
    lignes.push(['DETTE', c, e.n, e.fichiers, '']);
  }
}
// Une couleur declaree qui a DISPARU : le plafond doit tomber, sinon le cliquet
// rouvre en silence ce qu on vient de fermer.
for (const c of Object.keys(DECLARE.RESTE)) {
  if (!trouve.has(c)) lignes.push(['PARTIE', c, 0, new Set(), 'plus aucun endroit — retirer la ligne de contraste-jour-declare.js']);
}

console.log('== Mode jour : couleurs de texte ecrites en dur ==');
console.log('   ' + lus + ' fenetres lues, fond de jour ' + FOND_JOUR + ', seuil ' + SEUIL);
console.log('   ' + total + ' declaration(s) sous le seuil, ' + trouve.size + ' couleur(s) distincte(s)\n');
for (const [genre, c, n, fics, note] of lignes) {
  const marque = (genre === 'NEUF' || genre === 'MONTE') ? '  NON' : '  --  ';
  console.log(marque + ' ' + genre.padEnd(7) + c.padEnd(10) + 'x' + String(n).padEnd(5)
    + ratio(c, FOND_JOUR).toFixed(2).padEnd(7) + note);
  if (detail && fics.size) console.log('         ' + [...fics].sort().join(', '));
}
if (voiles.size) {
  console.log('');
  for (const [f, n] of [...voiles.entries()].sort((a, b) => b[1] - a[1]))
    console.log('  NON VOILE   ' + f.padEnd(24) + 'x' + n + '   blanc translucide en dur — employer un jeton --v03..--v90');
  mal += voiles.size;
}
if (mal) {
  console.log('\n>>> ' + mal + ' couleur(s) NOUVELLE(S) ou EN HAUSSE — la lisibilite du mode jour recule');
  process.exit(1);
}
console.log('\n>>> aucune couleur neuve sous le seuil, et la dette ne gagne pas de terrain');
