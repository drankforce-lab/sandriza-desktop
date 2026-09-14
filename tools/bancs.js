#!/usr/bin/env node
'use strict';

/*
 * TOUS LES BANCS, D UN COUP — ET LA LISTE VIENT DE build.yml
 * =============================================================================
 * POURQUOI CE LANCEUR EXISTE. Le 2026-09-08, une construction a echoue sur
 * `banc-pictogrammes.js` : deux caracteres << attention >> ajoutes dans
 * `sauvegarde.js`, plafond declare a zero. Le banc etait vert quand je l avais
 * lance PLUS TOT dans la seance, et je ne l ai pas relance apres avoir touche au
 * fichier — j avais choisi A LA MAIN un sous-ensemble de bancs a rejouer
 * (accent-grave, mise-en-page, verifier-fenetres) et pas celui-la.
 *
 * ⚠⚠ CHOISIR SOI-MEME QUELS CONTROLES REJOUER, C EST DECIDER SANS SAVOIR quels
 * defauts on vient d introduire. Le CI ne choisit pas : il les lance tous. Ce
 * lanceur fait pareil, en 20 secondes, AVANT le push — pour que l echec se voie
 * ici et non trois minutes plus tard sur GitHub.
 *
 * ⚠⚠ ET LA LISTE N EST PAS RECOPIEE : elle est LUE dans
 * `.github/workflows/build.yml`. Une liste tenue a deux endroits finit par
 * mentir — un banc ajoute au CI et oublie ici donnerait un vert local suivi
 * d un rouge distant, c est-a-dire exactement le probleme qu on corrige.
 * Si la lecture echoue, on le DIT et on sort en erreur : un lanceur qui ne
 * trouve aucun banc ne doit pas repondre << tout va bien >>.
 *
 *   node tools/bancs.js
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RACINE = path.join(__dirname, '..');
const YML = path.join(RACINE, '.github', 'workflows', 'build.yml');

let bancs = [];
try {
  const y = fs.readFileSync(YML, 'utf8');
  const vus = new Set();
  for (const m of y.matchAll(/^\s*node\s+(tools\/[\w.-]+\.js)/gm)) {
    if (!vus.has(m[1])) { vus.add(m[1]); bancs.push(m[1]); }
  }
} catch (e) {
  console.log('ECHEC  build.yml illisible (' + e.message + ') — la liste des bancs ne peut pas etre lue.');
  process.exit(1);
}

/* ⚠⚠ LES BANCS QUI OUVRENT CHROME EN RAFALE NE TOURNENT JAMAIS ICI — 2026-09-14.
   Ce lanceur est fait pour etre lance A LA MAIN, sur SON poste. `banc-contraste-
   rendu.js` ouvre Chrome des dizaines de fois : le 2026-09-05 il a epuise la
   memoire de sa machine et FAIT TOMBER L AFFICHAGE, deux fois, deux redemarrages
   en catastrophe. Il a sa place dans le travail `contrastes` de build.yml, sur
   un runner — pas ici.

   ⚠ CE QUI RENDAIT LA PROTECTION FRAGILE, ET POURQUOI ELLE EST ECRITE MAINTENANT.
   Rien ne l excluait : il restait dehors seulement parce que sa commande etait
   ecrite `run: node tools/...` sur UNE ligne, et que le motif de lecture ci-dessus
   exige `node` EN DEBUT de ligne. Le 2026-09-14, en passant cette etape en bloc
   `run: |` pour une option, la commande a commence la ligne — et le banc est
   entre dans la rafale locale. Le compte est passe de 39 a 40 : c est ce chiffre,
   et rien d autre, qui l a trahi.
   ➡ Une protection qui tient a la MISE EN FORME d une ligne de YAML n est pas une
   protection. Elle est ecrite ici, en toutes lettres, avec sa raison. */
const JAMAIS_LOCAL = new Set(['tools/banc-contraste-rendu.js']);
{
  const ecartes = bancs.filter((b) => JAMAIS_LOCAL.has(b));
  if (ecartes.length) {
    bancs = bancs.filter((b) => !JAMAIS_LOCAL.has(b));
    for (const e of ecartes) {
      console.log('  --   ' + e + ' : ECARTE de la rafale locale (il ouvre Chrome des');
      console.log('       dizaines de fois). Il tourne dans le travail `contrastes` de build.yml.');
    }
    console.log('');
  }
}

if (bancs.length < 5) {
  console.log('ECHEC  ' + bancs.length + ' banc(s) trouve(s) dans build.yml — le motif de lecture ne marche plus,');
  console.log('       et un lanceur qui ne trouve rien repondrait << tout va bien >> sur un depot casse.');
  process.exit(1);
}

console.log('== ' + bancs.length + ' banc(s), liste lue dans build.yml ==\n');
const rates = [];
for (const b of bancs) {
  const nom = path.basename(b, '.js');
  process.stdout.write('  ' + nom.padEnd(34));
  try {
    execFileSync(process.execPath, [path.join(RACINE, b)], { cwd: RACINE, stdio: 'pipe' });
    console.log('OK');
  } catch (e) {
    console.log('ECHEC');
    rates.push({ nom, sortie: String((e.stdout || '') + (e.stderr || '')) });
  }
}

console.log('');
if (!rates.length) { console.log('>>> les ' + bancs.length + ' bancs passent'); process.exit(0); }

/* La SORTIE du banc qui a echoue, pas seulement son nom : sans elle il faut le
   relancer a la main pour savoir quoi corriger. */
for (const r of rates) {
  console.log('──── ' + r.nom + ' ────');
  console.log(r.sortie.split('\n').slice(-18).join('\n').trimEnd());
  console.log('');
}
console.log('>>> ' + rates.length + ' banc(s) en ECHEC sur ' + bancs.length);
process.exit(1);
