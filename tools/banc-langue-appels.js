#!/usr/bin/env node
'use strict';

/*
 * CHAQUE T() A-T-IL SON ENTRÉE ? — l audit qui ne demande pas de DONNÉES
 * =============================================================================
 * ⚠⚠⚠ SA CAPTURE DU 2026-09-13 : un tableau de bord ou << ORDERS TO PROCESS >>
 * et << ACTIVE PRODUCTS >> voisinent avec << COMMANDES >> et << MESSAGERIE >>,
 * et ou les sous-titres disent << 0 en attente >> et << aucun message en
 * attente >> au milieu de l anglais. Ses mots : << regarde encore plein de
 * texte en francais pas traduit >>.
 *
 * ⚠⚠ LES QUATRE BANCS DE LANGUE NE POUVAIENT PAS LE VOIR, et la raison est
 * toujours la meme, sur un quatrieme terrain :
 *   · `banc-langue-residuel` releve les textes NUS de la source. Ceux-ci sont
 *     DEJA enveloppes dans T() — il n a donc rien a dire.
 *   · `banc-langue-effet` DESSINE la page anglaise et refuse ce qui reste
 *     francais. Mais il la dessine SANS DONNEES : les tuiles du tableau de
 *     bord, les lignes de tableau, les sous-titres comptes n existent pas dans
 *     cette page-la. Il ne peut pas refuser un texte qui ne s affiche jamais
 *     devant lui.
 *   · `banc-langue-mesures` regarde les unites, pas les phrases.
 *   · `banc-menu-langue` regarde le menu.
 *
 * ➡ **UN BANC QUI DESSINE NE VOIT QUE CE QUE SES DONNÉES FONT APPARAÎTRE.**
 * Celui-ci ne dessine RIEN : il lit les APPELS `T("…")` dans la source et exige
 * que chaque cle ait une entree dans le dictionnaire de sa fenetre (ou dans le
 * socle). Une phrase qui n existe qu avec onze variantes en rupture est
 * exactement aussi gardee qu un titre.
 *
 * ⚠ IL NE JUGE PAS LA QUALITE DE LA TRADUCTION, seulement sa PRESENCE — meme
 * limite assumee que `banc-menu-langue`.
 *
 * ⚠ UNE ENTREE DONT LA VALEUR EGALE LA CLE EST ACCEPTEE : c est une decision
 * assumee (un nom propre, un sigle). Ce qui est refuse, c est l ABSENCE
 * d entree — le silence, pas le choix.
 *
 *   node tools/banc-langue-appels.js
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DOS = path.join(RACINE, 'src', 'fenetres');
const L = require('../src/langue');

/* ⚠ `connexion` EST HORS COMPTE : sa page porte les DEUX langues a la fois
   (elle bascule sans se recharger) et son dictionnaire est embarque. Sa garde
   est `banc-langue-connexion.js`. Meme exception que `banc-langue-effet`. */
const HORS_COMPTE = new Set(['connexion']);

/* Les appels T("…") et T('…'), sur une ou plusieurs lignes.
   ⚠ ON NE RETIRE PAS LES COMMENTAIRES ICI, ET C EST VOULU : un commentaire qui
   CITE un T("…") cite une cle qui doit exister de toute facon — la fiche du
   tableau de bord en cite justement. Une fausse faute est impossible dans ce
   sens-la : au pire on exige une entree pour une phrase reelle. */
const RX = /\bT\(\s*(["'])((?:\\.|(?!\1)[\s\S])*?)\1/g;

/* Ce que le litteral JS represente vraiment : \" et \' redeviennent " et '. */
const _denoue = (s) => s.replace(/\\(["'\\])/g, '$1');

let regardees = 0;
let appels = 0;
const fautes = [];

for (const f of fs.readdirSync(DOS).filter((x) => x.endsWith('.js') && x !== 'socle.js').sort()) {
  const nom = f.replace(/\.js$/, '');
  if (HORS_COMPTE.has(nom)) continue;
  const src = fs.readFileSync(path.join(DOS, f), 'utf8');
  regardees++;

  const manquantes = new Set();
  let m;
  RX.lastIndex = 0;
  while ((m = RX.exec(src))) {
    appels++;
    const cle = _denoue(m[2]);
    if (!cle.trim()) continue;
    /* `aUneDecision` regarde le dictionnaire de la fenetre PUIS celui du socle,
       exactement comme `T()` au moment de rendre la page. On pose donc la meme
       question que le code, pas une question voisine. */
    if (!L.aUneDecision(nom, cle)) manquantes.add(cle);
  }
  if (manquantes.size) fautes.push({ nom, cles: [...manquantes] });
}

/* ⚠ UN BANC QUI NE REGARDE RIEN NE DOIT PAS DIRE << TOUT VA BIEN >>. */
if (regardees < 90 || appels < 3000) {
  console.error('✗ ' + regardees + ' fenetre(s) et ' + appels + ' appel(s) seulement — '
    + 'le motif de lecture ne marche plus, ce banc ne prouverait rien.');
  process.exit(1);
}

const total = fautes.reduce((n, x) => n + x.cles.length, 0);

console.log('');
console.log('== CHAQUE T() A-T-IL SON ENTREE ? ==');
console.log('  ' + appels + ' appel(s) dans ' + regardees + ' fenetre(s)');
console.log('');

if (!total) {
  console.log('>>> chaque phrase enveloppee a sa traduction');
  process.exit(0);
}

console.error('ECHEC  ' + total + ' phrase(s) enveloppee(s) dans T() SANS entree de');
console.error('       dictionnaire — elles s afficheront en francais sur la page anglaise :');
console.error('');
for (const { nom, cles } of fautes) {
  console.error('  ' + nom + '  (' + cles.length + ')');
  cles.forEach((c) => console.error('      ' + JSON.stringify(c)));
}
console.error('');
console.error('⚠ ENVELOPPER NE TRADUIT PAS : il faut l entree dans src/langue/<fenetre>.js');
console.error('  (ou dans src/langue/socle.js si la phrase paraît dans plusieurs fenêtres).');
process.exit(1);
