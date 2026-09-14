#!/usr/bin/env node
'use strict';

/*
 * TOUTE VUE ANCRÉE PORTE-T-ELLE SA RECETTE ?
 * =============================================================================
 * ⚠⚠⚠ LA FAUTE QUE CE BANC EXISTE POUR ATTRAPER, ET IL L'A SIGNALÉE LUI-MÊME :
 * « quand je change pour le français le tableau de bord ne change pas de
 * langue » (2026-09-14).
 *
 * `_refabriquerToutesLesFenetres()` — le mécanisme qui fait suivre la langue aux
 * écrans DÉJÀ OUVERTS (#96) — refait chaque vue ancrée en appelant `a.refaire()`.
 * Une vue enregistrée SANS cette propriété est comptée « sans recette » et
 * GARDE SA LANGUE. Le journal le dit ; personne ne lit le journal.
 *
 * ⚠ ET C'ÉTAIT LE TABLEAU DE BORD — le seul écran que tout le monde a sous les
 * yeux en permanence. Il était créé À LA MAIN au démarrage (pour être prêt avant
 * le premier clic) au lieu de passer par `dockOuvrir`, qui pose la recette en
 * même temps qu'il crée la vue. Une seconde façon de faire la même chose finit
 * toujours par en oublier un morceau.
 *
 * ⚠⚠ POURQUOI AUCUN AUTRE BANC NE LE VOYAIT :
 *   · les bancs de langue lisent les FICHIERS de fenêtres et les trouvent
 *     parfaitement bilingues — `tableau.js` rend très bien en anglais. Ce n'est
 *     pas la page qui est en cause, c'est le fait qu'on ne la REDEMANDE jamais ;
 *   · les bancs au rendu dessinent une page NEUVE, donc dans la langue courante.
 *     Le défaut n'apparaît qu'en CHANGEANT de langue sur une page déjà posée ;
 *   · rien ne reliait « enregistrer une vue » à « savoir la refaire ».
 *
 * ── LA RÈGLE ────────────────────────────────────────────────────────────────
 * Tout `ancrees.set(...)` doit fournir `refaire` — soit dans l'objet lui-même,
 * soit par une affectation `.refaire =` dans les lignes qui suivent
 * immédiatement (c'est ainsi que procède le chemin d'ancrage ordinaire).
 *
 * ⚠ CE QU'IL NE REGARDE PAS, ET UN VERT NE LE DIRA PAS :
 *   · il vérifie qu'une recette EST FOURNIE, pas qu'elle rende la BONNE page.
 *     Une recette qui pointerait vers le mauvais écran passerait ici ;
 *   · il ne lit que les vues ANCRÉES. Les fenêtres natives portent leur recette
 *     dans `_szRefaire`, posé par `ouvrirNative` — un seul chemin, donc pas la
 *     même exposition.
 *
 *   node tools/banc-recette-ancree.js
 */

const fs = require('fs');
const path = require('path');

const FICHIER = path.join(__dirname, '..', 'src', 'main.js');

let src;
try { src = fs.readFileSync(FICHIER, 'utf8'); }
catch (e) {
  console.log('ECHEC  src/main.js illisible (' + e.message + ')');
  console.log('       Un banc qui ne lit rien ne doit pas repondre << tout va bien >>.');
  process.exit(1);
}

/* ⚠ COMMENTAIRES RETIRES : cette fiche-ci et celle de main.js citent
   `ancrees.set` pour l'expliquer. Les compter ferait accuser la documentation
   qui garde la regle — meme lecon que banc-permissions. */
const nu = src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');

const lignes = nu.split('\n');

console.log('');
console.log('== TOUTE VUE ANCREE PORTE-T-ELLE SA RECETTE ? ==');

const fautes = [];
let vus = 0;

for (let i = 0; i < lignes.length; i++) {
  if (!/\bancrees\.set\s*\(/.test(lignes[i])) continue;
  vus++;
  /* La recette peut etre DANS l objet pose... */
  if (/\brefaire\s*:/.test(lignes[i])) continue;
  /* ...ou affectee juste apres, comme le fait le chemin d ancrage ordinaire.
     ⚠ DIX LIGNES DE CODE, PAS DAVANTAGE : au-dela, l affectation n est plus
     evidente a la relecture, et c est precisement l evidence qu on cherche a
     garder.
     ⚠⚠ ON COMPTE LES LIGNES NON VIDES, et ce n est pas un detail : le retrait
     des commentaires laisse des lignes BLANCHES a leur place. Le chemin d
     ancrage ordinaire porte un commentaire de quatre lignes entre son
     `ancrees.set` et son `.refaire =` — compte brut, la distance passait a
     douze, et le banc accusait du code parfaitement correct. Une fenetre qui
     depend de la LONGUEUR DES COMMENTAIRES mesure la documentation, pas le
     code. */
  const suite = lignes.slice(i + 1).filter((l) => l.trim()).slice(0, 10).join('\n');
  if (/\.refaire\s*=/.test(suite)) continue;
  fautes.push('src/main.js:' + (i + 1) + '  une vue ancree est enregistree SANS `refaire`\n'
    + '        ' + lignes[i].trim().slice(0, 100) + '\n'
    + '        Elle sera comptee << sans recette >> et GARDERA SA LANGUE quand on\n'
    + '        change de langue — silencieusement. C est ce qui est arrive au\n'
    + '        TABLEAU DE BORD, l ecran que tout le monde a sous les yeux.');
}

console.log('  ' + vus + ' enregistrement(s) de vue ancree');

/* ⚠ TEMOIN : zero enregistrement se lirait comme zero faute. */
if (vus === 0) {
  console.log('\nECHEC  aucun `ancrees.set` trouve — le motif de lecture ne marche plus,');
  console.log('       et un banc qui ne trouve rien repond << tout va bien >> sur un depot casse.');
  process.exit(1);
}

if (fautes.length) {
  console.log('\nECHEC  ' + fautes.length + ' vue(s) ancree(s) sans recette :');
  for (const f of fautes) console.log('   — ' + f);
  console.log('\n⚠ Une page qu on ne sait pas REFAIRE ne suivra jamais un changement');
  console.log('  de langue. Le journal le dit ; personne ne lit le journal.');
  process.exit(1);
}

console.log('\n>>> chaque vue ancree sait se refaire, donc suit la langue\n');
