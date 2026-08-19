#!/usr/bin/env node
'use strict';

/*
 * EMBARQUER LA POLICE DES TITRES DANS LE SOCLE
 * =============================================================================
 * Reecrit le bloc `@font-face` de `src/fenetres/socle.js` a partir du fichier
 * `.woff2` present dans `src/polices/`. A relancer chaque fois qu on change de
 * police : on ne recopie pas 23 000 caracteres de base64 a la main.
 *
 * ── POURQUOI DU BASE64 ET PAS UN CHEMIN ──────────────────────────────────────
 * ⚠⚠ Les 91 fenetres natives sont chargees par
 * `win.loadURL('data:text/html;charset=utf-8,' + ...)` (voir `ouvrirNative`). Un
 * document `data:` a une ORIGINE OPAQUE : il n y a pas d URL de base, donc
 * `url('polices/x.woff2')` ne resout RIEN, et un `file://` depuis un document
 * `data:` est bloque par Chromium. Les fenetres sont en plus en `sandbox: true`.
 * La police inlinee en base64 est la SEULE voie qui marche.
 *
 * ⚠ ET L APPLICATION TOURNE HORS LIGNE : pas de Google Fonts, pas de CDN. Une
 * police servie par un tiers ne serait pas la au lancement suivant sans reseau,
 * et le titre retomberait sur un repli que personne n aurait regarde.
 *
 * ── LE COUT, QU IL FAUT CONNAITRE ────────────────────────────────────────────
 * La chaine est recopiee dans le CSS de CHAQUE fenetre ouverte. Un woff2 de
 * 40 Ko fait 53 Ko encode : c est de mémoire, pas du reseau, mais on prend le
 * sous-ensemble `latin` et rien de plus. Au-dela de 80 Ko encode, l outil
 * previent.
 *
 * ── USAGE ───────────────────────────────────────────────────────────────────
 *   node tools/police-en-base64.js                  la seule police du dossier
 *   node tools/police-en-base64.js pinyon-script    une en particulier
 *
 * Codes de sortie : 0 pose, 1 refus (le detail est imprime).
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DOSSIER = path.join(RACINE, 'src', 'polices');
const SOCLE = path.join(RACINE, 'src', 'fenetres', 'socle.js');
const DEBUT = '── DEBUT POLICE TITRES ── */';
const FIN = '/* ── FIN POLICE TITRES ── */';

const mal = (m) => { console.error('  NON  ' + m); process.exit(1); };

// ── Quelle police ? ─────────────────────────────────────────────────────────
let choix = process.argv[2] || '';
let fichiers;
try {
  fichiers = fs.readdirSync(DOSSIER).filter((f) => /\.woff2$/i.test(f));
} catch (e) {
  mal('dossier introuvable : src/polices/');
}
if (!fichiers.length) mal('aucun .woff2 dans src/polices/');
if (choix) {
  const c = choix.replace(/\.woff2$/i, '') + '.woff2';
  if (fichiers.indexOf(c) < 0) mal('introuvable : src/polices/' + c + '  (present : ' + fichiers.join(', ') + ')');
  fichiers = [c];
} else if (fichiers.length > 1) {
  mal('plusieurs polices dans src/polices/ (' + fichiers.join(', ') + ') — nommer celle a poser');
}

const nom = fichiers[0];
const buf = fs.readFileSync(path.join(DOSSIER, nom));

// ── Est-ce vraiment un woff2 ? ──────────────────────────────────────────────
// ⚠ Un .otf renomme en .woff2 passerait inapercu et la police ne chargerait
// jamais : le titre retomberait sur le repli, sans un mot. La signature d un
// woff2 est « wOF2 ».
const signature = buf.toString('latin1', 0, 4);
if (signature !== 'wOF2') {
  mal(nom + ' n est pas un woff2 (signature lue : ' + signature + ').'
      + ' Convertir d abord — un .otf renomme ne chargerait jamais, en silence.');
}

const b64 = buf.toString('base64');
const ko = Math.round(b64.length / 1024);
if (b64.length > 80 * 1024) {
  console.log('  ATTENTION  ' + ko + ' Ko encodes, recopies dans CHAQUE fenetre.');
  console.log('             Sous-ensembler la police aux caracteres des titres.');
}

// ── Poser le bloc ───────────────────────────────────────────────────────────
let s = fs.readFileSync(SOCLE, 'utf8');
const NL = s.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
const i = s.indexOf(DEBUT);
const j = s.indexOf(FIN);
if (i < 0 || j < 0 || j < i) mal('marqueurs POLICE TITRES introuvables dans socle.js');

const bloc = [
  DEBUT,
  '@font-face{font-family:"SzTitre";font-style:normal;font-weight:400;',
  '  font-display:block;',
  '  src:url(data:font/woff2;base64,' + b64 + ') format("woff2")}',
  FIN,
].join(NL);

s = s.slice(0, i) + bloc + s.slice(j + FIN.length);
fs.writeFileSync(SOCLE, s, 'utf8');

console.log('  OK   ' + nom + ' -> socle.js  (' + buf.length + ' o, ' + ko + ' Ko en base64)');
console.log('  --   relancer « node tools/verifier-fenetres.js » : il refuse un @font-face vide ou tronque.');
