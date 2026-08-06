#!/usr/bin/env node
'use strict';

/*
 * GARDE-FOU DES FENÊTRES NATIVES
 * =============================================================================
 * Trois fois de suite, un accent grave égaré dans un COMMENTAIRE à l'intérieur
 * d'un littéral de gabarit a fermé la chaîne et cassé le fichier. À chaque fois
 * la règle était écrite dans le socle, et à chaque fois elle a été oubliée en
 * écrivant du commentaire, là où l'on ne pense pas à la syntaxe.
 *
 * Une règle qu'on répète et qu'on oublie n'est pas une règle : c'est un vœu.
 * Celle-ci est vérifiée par une machine.
 *
 * Ce script contrôle, pour chaque fenêtre :
 *   1. que le fichier se charge (syntaxe) ;
 *   2. qu'aucun accent grave ne traîne dans la portion <script>…</script> ;
 *   3. que la page produite contient bien les ancres du socle, faute de quoi le
 *      moteur d'étapes ne trouverait rien à piloter — un assistant qui s'ouvre
 *      sur une page morte, sans erreur.
 *
 *     node tools/verifier-fenetres.js
 */

const fs = require('fs');
const path = require('path');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');
// ⚠ `id="pas"` (le fil d'étapes) n'est PAS exigé : toutes les fenêtres ne sont
// pas des assistants. « Imprimantes » est un écran d'état, et lui imposer un fil
// aurait produit un faux assistant à une seule étape pour satisfaire un contrôle.
// Ce qui est exigé, c'est ce dont TOUTE fenêtre a besoin : une zone de contenu et
// une zone de message — sans la seconde, un refus du pont resterait invisible.
const ANCRES = ['id="corps"', 'id="msg"'];
// Le socle n'est pas une fenêtre : il n'a ni page ni ancres.
const SOCLE = 'socle.js';

let fautes = 0;
const dire = (etat, nom, texte) => {
  console.log('  ' + (etat ? 'OK  ' : 'NON ') + nom.padEnd(18) + (texte || ''));
  if (!etat) fautes++;
};

console.log('\n=== Fenêtres natives ===');
for (const f of fs.readdirSync(DOSSIER).filter((n) => n.endsWith('.js'))) {
  const p = path.join(DOSSIER, f);
  const src = fs.readFileSync(p, 'utf8');

  try { require(p); }
  catch (e) { dire(false, f, 'ne se charge pas — ' + e.message); continue; }

  const i = src.indexOf('<script>');
  const j = src.indexOf('</script>');
  if (i >= 0 && j > i) {
    const n = (src.slice(i, j).match(/`/g) || []).length;
    if (n) { dire(false, f, n + ' accent(s) grave(s) dans le script — ils ferment le gabarit'); continue; }
  } else if (f !== SOCLE) {
    dire(false, f, 'aucune portion <script> : la page ne fera rien'); continue;
  }

  if (f !== SOCLE) {
    const mod = require(p);
    const fabrique = Object.values(mod).find((v) => typeof v === 'function');
    if (!fabrique) { dire(false, f, 'n’exporte aucune fabrique de page'); continue; }
    let page = '';
    try { page = String(fabrique('')); }
    catch (e) { dire(false, f, 'la fabrique échoue — ' + e.message); continue; }
    const absentes = ANCRES.filter((a) => page.indexOf(a) < 0);
    if (absentes.length) { dire(false, f, 'ancres manquantes : ' + absentes.join(', ')); continue; }
  }

  dire(true, f, '');
}

console.log(fautes ? '\n>>> ' + fautes + ' fenêtre(s) à corriger\n' : '\n>>> Toutes les fenêtres sont saines\n');
process.exit(fautes ? 1 : 0);
