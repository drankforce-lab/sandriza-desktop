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
/* ── LES DÉFINITIONS DE JETONS NE SONT PAS DES EMPLOIS ───────────────────────
   ⚠⚠ CE FILTRE EXISTE PARCE QUE LA SUBSTITUTION EN MASSE A DÉTRUIT LES JETONS
   EUX-MÊMES, le 2026-09-04. Le script qui remplaçait `rgba(255,255,255,x)` par
   `var(--vNN)` a tourné sur TOUS les fichiers — `socle.js` compris — et il a
   réécrit les DÉFINITIONS que je venais d'y poser :

       --v05:rgba(255,255,255,.05)   devenu   --v05:var(--v05)

   Un jeton défini par lui-même est cyclique, donc INVALIDE : la propriété
   retombe à `unset`. Les 1 410 bordures et fonds de cartes des fenêtres sont
   devenus INVISIBLES, en mode sombre comme en mode jour, pendant quatre
   versions — et c'est lui qui l'a vu, capture à l'appui.

   ⚠ LA LEÇON : une substitution mécanique doit EXCLURE le fichier où les jetons
   sont définis. Ici, on exclut les deux blocs de définition avant toute mesure —
   sans quoi le banc accuserait les littéraux qui DOIVENT y rester.
   Et le contrôle d'auto-référence ci-dessous refuse le défaut lui-même. */
const sansDefinitions = (src) => src
  .replace(/:root\{color-scheme:dark;[^}]*\}/g, '')
  .replace(/html\.jour\{[^}]*\}/g, '');

const RX = /(^|[;{\s"'])color\s*:\s*(#[0-9a-fA-F]{3,6})/gm;

const trouve = new Map();          // couleur -> { n, fichiers:Set }
let lus = 0;
for (const f of fs.readdirSync(DOSSIER).filter((x) => x.endsWith('.js'))) {
  const src = sansDefinitions(fs.readFileSync(path.join(DOSSIER, f), 'utf8'));
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
  const src = sansDefinitions(fs.readFileSync(path.join(DOSSIER, f), 'utf8'));
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

/* ── UN JETON EMPLOYÉ DOIT ÊTRE DÉFINI ───────────────────────────────────────
   ⚠⚠ LE CONTRÔLE QUI MANQUAIT, ET IL AURAIT ÉVITÉ DEUX VERSIONS DE RÉPARATION.
   Le 2026-09-04, après avoir renommé les jetons de voile, `--v11` restait employé
   dans **66 fenêtres** alors qu'il n'était plus défini nulle part. Un `var()` qui
   ne résout rien rend la propriété INVALIDE : la bordure ou le fond n'est pas
   dessiné. Les écrans s'affichent, simplement à plat — exactement ce qu'il a
   photographié, deux fois.

   ⚠ POURQUOI LE PREMIER RELEVÉ NE L'A PAS VU : il ne regardait que
   `color:` / `background:` / `border-color:`, et ratait les RACCOURCIS —
   `border:1px solid var(--v11)`. C'est par là que les 66 fenêtres sont passées.
   Ici on relève TOUTE occurrence de `var(--…)`, quelle que soit la propriété.

   ⚠ Les jetons du SITE (`--c-…`) et ceux des jeux de couleurs (`--sz-…`) sont
   définis ailleurs que dans les deux blocs de mode : on lit donc toutes les
   déclarations `--x:` du socle, pas seulement celles des blocs. */
{
  const socleBrut = fs.readFileSync(path.join(DOSSIER, 'socle.js'), 'utf8');
  const definis = new Set();
  for (const m of socleBrut.matchAll(/(--[a-z0-9-]+)\s*:\s*[^;}]+[;}]/g)) definis.add(m[1]);
  const orphelins = new Map();
  for (const f of fs.readdirSync(DOSSIER).filter((x) => x.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(DOSSIER, f), 'utf8');
    for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/g)) {
      if (definis.has(m[1])) continue;
      if (!orphelins.has(m[1])) orphelins.set(m[1], new Set());
      orphelins.get(m[1]).add(f);
    }
  }
  if (orphelins.size) {
    console.log('');
    for (const [j, fics] of [...orphelins.entries()].sort((a, b) => b[1].size - a[1].size))
      console.log('  NON ORPHELIN ' + j.padEnd(16) + 'employe dans ' + fics.size
        + ' fenetre(s) mais DEFINI NULLE PART — la propriete est invalide, donc rien ne se dessine ('
        + [...fics].slice(0, 3).join(', ') + ')');
    mal += orphelins.size;
  }
}

/* Un jeton défini par lui-même : le défaut du 2026-09-04, refusé pour toujours.
   Il ne lève AUCUNE erreur — la page s'affiche, seulement sans ses bordures. */
{
  const socleBrut = fs.readFileSync(path.join(DOSSIER, 'socle.js'), 'utf8');
  const cycles = [];
  for (const b of socleBrut.match(/(?::root\{color-scheme:dark;|html\.jour\{)[^}]*\}/g) || []) {
    for (const m of b.matchAll(/(--[a-z0-9-]+)\s*:\s*var\(\s*(--[a-z0-9-]+)\s*\)/g))
      if (m[1] === m[2]) cycles.push(m[1]);
  }
  if (cycles.length) {
    mal += cycles.length;
    for (const c of cycles)
      console.log('  NON CYCLE   ' + c + ' est defini par lui-meme — le jeton est INVALIDE et tout ce qui l emploie devient invisible');
  }
}


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
/* ── LE TEXTE ET SON FOND SONT UNE PAIRE ─────────────────────────────────────
   ⚠⚠ CE CONTRÔLE EXISTE PARCE QUE LE BANC PRÉCÉDENT A LAISSÉ PASSER UNE
   RÉGRESSION QUE J'AI MOI-MÊME INTRODUITE, le 2026-09-04. En convertissant les
   couleurs de TEXTE en jetons, les champs de saisie sont devenus illisibles en
   mode jour :

       input{background:#0f1724;color:var(--tx)}

   En jour, `--tx` vaut #1d2433 : texte foncé sur champ FONCÉ, ratio 1.16. On ne
   pouvait plus lire ce qu'on tape. Le banc ne voyait rien — il ne mesurait que
   les couleurs LITTÉRALES, et celle-ci était devenue un `var()`.

   ⚠ LA LEÇON, ET ELLE VAUT POUR TOUTE CONVERSION EN JETONS : convertir un texte
   sans son FOND ne déplace pas le problème, il l'aggrave. Avant la conversion,
   c'était laid mais LISIBLE.

   Ce qu'on mesure : toute règle qui pose un fond EN DUR et une couleur de texte
   par JETON. On calcule le ratio avec la valeur de JOUR du jeton, et l'on refuse
   sous le seuil — SAUF si une reprise `html.jour` couvre le même sélecteur pour
   le fond ET la couleur (alors c'est elle qui commande en jour, et elle décide
   des deux).
   ⚠ `--tx-sur-accent` est EXCLU par construction : il ne s'inverse pas (il vaut
   #ffffff dans les deux modes), et c'est exactement ce qu'il faut sur un fond
   d'accent fixe — un rouge d'alerte n'a pas de version claire. */
const JOUR_JETON = {
  '--tx': '#1d2433', '--tx-blanc': '#1d2433', '--tx2': '#5a6574', '--tx-bleute': '#5f666c',
  '--tx-gris2': '#5f646a', '--tx3': '#576678', '--tx-gris': '#586578', '--tx-ok': '#297a46',
  '--tx-ok2': '#387652', '--tx-err': '#ab4e4e', '--tx-err2': '#905e5e', '--tx-att': '#856513',
  '--tx-jaune': '#80680b', '--tx-or': '#7d694e', '--tx-or2': '#76694e', '--tx-creme': '#6f6a5f',
  '--tx-creme2': '#6d6963', '--tx-bleu': '#516c8b',
};
// Les reprises html.jour du socle, par sélecteur : posent-elles fond ET couleur ?
const socleTxt = fs.readFileSync(path.join(DOSSIER, 'socle.js'), 'utf8');
const reprises = new Map();
for (const m of socleTxt.matchAll(/html\.jour\s+([^{,]+?)\s*\{([^}]*)\}/g)) {
  const sel = m[1].trim(), decl = m[2];
  const e = reprises.get(sel) || { bg: false, col: false };
  if (/background/.test(decl)) e.bg = true;
  if (/(^|[;\s])color\s*:/.test(decl)) e.col = true;
  reprises.set(sel, e);
}
const paires = new Map();
for (const f of fs.readdirSync(DOSSIER).filter((x) => x.endsWith('.js'))) {
  const src = sansDefinitions(fs.readFileSync(path.join(DOSSIER, f), 'utf8'));
  for (const m of src.matchAll(/([.#a-zA-Z][^{}\n;]{0,80}?)\s*\{([^{}]{0,400})\}/g)) {
    const sel = m[1].trim(), decl = m[2];
    const bg = decl.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6})/);
    const col = decl.match(/color\s*:\s*var\((--tx[a-z0-9-]*)\)/);
    if (!bg || !col) continue;
    const j = JOUR_JETON[col[1]];
    if (!j) continue;                       // --tx-sur-accent et inconnus : hors sujet
    const r = ratio(j, bg[1].toLowerCase());
    if (r >= SEUIL) continue;
    const rep = reprises.get(sel);
    if (rep && rep.bg && rep.col) continue; // la reprise de jour commande les deux
    const cle = sel + ' {' + bg[1].toLowerCase() + ' + ' + col[1] + '}';
    if (!paires.has(cle)) paires.set(cle, { n: 0, r, fics: new Set() });
    const e = paires.get(cle); e.n++; e.fics.add(f);
  }
}
if (paires.size) {
  console.log('');
  for (const [k, e] of [...paires.entries()].sort((a, b) => b[1].n - a[1].n))
    console.log('  NON PAIRE   ' + k.padEnd(46) + 'ratio ' + e.r.toFixed(2) + '  x' + e.n
      + '   texte par jeton sur un fond EN DUR — convertir le fond en --f-*, ou employer --tx-sur-accent');
  mal += paires.size;
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
