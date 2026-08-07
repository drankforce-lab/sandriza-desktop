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

    // ⚠ LE TROU QUI A LAISSE PASSER UNE FENETRE MORTE (2026-08-06).
    // Ce controle verifiait que le MODULE se charge — mais le script de la page
    // vit dans un litteral de gabarit : pour Node c'est une CHAINE, et une ligne
    // orpheline dedans passe inapercue. La fenetre s'ouvrait, restait sur
    // « Chargement… », et rien n'expliquait pourquoi : le script n'avait jamais
    // demarre. On compile donc le script PRODUIT, pas seulement le module.
    const i2 = page.indexOf('<script>');
    const j2 = page.indexOf('</script>');
    if (i2 < 0 || j2 < i2) { dire(false, f, 'page sans script'); continue; }
    try { new Function(page.slice(i2 + 8, j2)); }
    catch (e) { dire(false, f, 'SCRIPT de la page invalide — ' + e.message); continue; }
  }

  dire(true, f, '');
}

// ── LES DEUX LISTES D'OPÉRATIONS DOIVENT ÊTRE D'ACCORD ──────────────────────
// ⚠ C'EST LE PIÈGE N°1 DE CE PONT, et il était le seul à ne pas être vérifié.
// `OPS` vit dans le site (assets/js/pont.js), `OPS_PONT` dans la coquille
// (src/main.js). Elles sont deux EXPRÈS — la seconde empêche qu'un nom
// quelconque venu d'un document local soit transmis au site. Mais en ajouter une
// dans un seul fichier donne « Cette version de l'application ne connaît pas
// cette opération », SANS dire laquelle manque : on cherche alors du côté du
// site, où tout est correct. C'est arrivé le 2026-08-06 avec Fournisseur et
// Collection. Une machine sait comparer deux listes ; nous, non.
//
// Le dépôt du site n'est pas là sur une machine de construction : on le CHERCHE,
// et son absence n'est pas une faute — c'est un contrôle qu'on annonce comme non
// effectué, ce qui est différent de réussi.
const CANDIDATS = [
  path.join(__dirname, '..', '..', 'Sandriza', 'assets', 'js', 'pont.js'),
  path.join(__dirname, '..', '..', 'sandriza', 'assets', 'js', 'pont.js'),
];
// ⚠ LA BORNE DE FIN DIFFÈRE SELON LA LISTE, et je m'y suis fait prendre en
// écrivant ce contrôle : `OPS` est un objet qui se ferme par « }; », `OPS_PONT`
// un ensemble qui se ferme par « ]); ». Chercher la mauvaise borne fait lire tout
// le reste du fichier, où d'autres chaînes « xxx:yyy » traînent (les canaux
// `ipcMain.handle`) — et le contrôle accuse alors des opérations qui n'ont jamais
// existé. Un garde-fou qui crie à tort se fait désactiver ; il doit donc être
// juste avant d'être sévère.
const noms = (src, marqueur, borne) => {
  const i = src.indexOf(marqueur);
  if (i < 0) return null;
  const j = src.indexOf(borne, i);
  const bloc = src.slice(i, j < 0 ? src.length : j);
  const trouves = bloc.match(/'[a-z]+:[A-Za-z]+'|'identite'/g) || [];
  return new Set(trouves.map((s) => s.replace(/'/g, '')));
};

console.log('=== Parité des opérations du pont ===');
const chemin = CANDIDATS.find((c) => fs.existsSync(c));
if (!chemin) {
  console.log('  -   non vérifiée : le dépôt du site n’est pas à côté (assets/js/pont.js)');
} else {
  const siteSrc = fs.readFileSync(chemin, 'utf8');
  const coqSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
  const site = noms(siteSrc, 'const OPS = {', '};');
  const coq = noms(coqSrc, 'const OPS_PONT = new Set([', ']);');
  if (!site || !coq) {
    dire(false, 'listes', 'liste introuvable — la forme de OPS / OPS_PONT a changé');
  } else {
    const manqueCoquille = [...site].filter((n) => !coq.has(n));
    const manqueSite = [...coq].filter((n) => !site.has(n));
    if (manqueCoquille.length) dire(false, 'coquille', 'absentes de OPS_PONT (src/main.js) : ' + manqueCoquille.join(', '));
    if (manqueSite.length) dire(false, 'site', 'absentes de OPS (assets/js/pont.js) : ' + manqueSite.join(', '));
    if (!manqueCoquille.length && !manqueSite.length) {
      dire(true, 'listes', site.size + ' opérations, les deux listes concordent');
    }
  }
}

console.log(fautes ? '\n>>> ' + fautes + ' point(s) à corriger\n' : '\n>>> Tout est sain\n');
process.exit(fautes ? 1 : 0);
