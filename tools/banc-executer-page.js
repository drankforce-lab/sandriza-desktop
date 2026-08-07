#!/usr/bin/env node
'use strict';

/*
 * BANC DE L'OUTIL QUI ÉPROUVE LES FENÊTRES
 * =============================================================================
 * ⚠ CE BANC EXISTE PARCE QUE L'OUTIL A ÉTÉ CONSTRUIT DEUX FOIS DE TRAVERS LE MÊME
 * JOUR, et qu'il annonçait « aucune faute » sur du code qui levait réellement une
 * erreur. Les deux fois, je ne l'ai su qu'en INJECTANT un défaut exprès.
 *
 *   1. `process.on('unhandledRejection')` ne voit pas les rejets nés dans un
 *      contexte `vm` ;
 *   2. un `Proxy` comme objet global SUPPRIME l'erreur : lire un nom inexistant y
 *      rend `undefined` en silence au lieu de lever.
 *
 * Un garde-fou qu'on n'a jamais essayé de tromper n'est pas un garde-fou : c'est
 * une décoration rassurante. Ce banc essaie de le tromper, de six façons.
 *
 *     node tools/banc-executer-page.js
 */

const { executerPage } = require('./executer-page.js');

let echecs = 0;
const dire = (bon, quoi, detail) => {
  console.log('  ' + (bon ? 'OK  ' : 'NON ') + quoi.padEnd(46) + (detail || ''));
  if (!bon) echecs++;
};

// Enveloppe minimale : ce que le socle des fenêtres fait réellement.
const page = (corps) => 'var P = window.szPont;\n' + corps;

const cas = [
  {
    quoi: 'variable libre lue tout de suite',
    script: page('var x = zzzAbsente;'),
    attendu: /n.est pas d.finie|is not defined/i,
  },
  {
    quoi: 'variable libre dans une suite de promesse',
    // ⚠ LE CAS EXACT DU 2026-08-07 : la faute vit dans le `then`, pas au premier
    // niveau. C'est celui que les deux premières versions de l'outil ont manqué.
    script: page('P.appeler("x:y").then(function(r){ var v = zzzAbsente; });'),
    attendu: /is not defined/i,
  },
  {
    quoi: 'variable libre au DEUXIÈME niveau de promesse',
    script: page('P.appeler("x:y").then(function(){ return P.appeler("x:z").then(function(){ var v = zzzAbsente; }); });'),
    attendu: /is not defined/i,
  },
  {
    quoi: 'propriété lue sur une valeur absente',
    script: page('P.appeler("x:y").then(function(r){ document.getElementById("a").innerHTML = r.rien.du.tout; });'),
    attendu: /Cannot read propert/i,
  },
  {
    quoi: 'faute dans une minuterie',
    script: page('setTimeout(function(){ var v = zzzAbsente; }, 3000);'),
    attendu: /is not defined/i,
  },
  {
    quoi: 'localStorage lève, comme en origine nulle',
    // Une fenêtre native est chargée en `data:` : y toucher DOIT échouer, sinon
    // l'outil laisserait passer du code qui s'effondre chez le client.
    script: page('var v = localStorage.getItem("x");'),
    attendu: /SecurityError/i,
  },
];

const sain = {
  quoi: 'une page correcte ne déclenche AUCUNE fausse alerte',
  script: page('P.appeler("x:y").then(function(r){'
    + ' document.getElementById("corps").innerHTML = "<div>" + (r && r.ok) + " du contenu assez long pour compter comme une ecriture</div>"; });'),
};

(async () => {
  console.log('\n=== L’outil voit-il ce qu’il doit voir ? ===');
  for (const c of cas) {
    const r = await executerPage(c.script, { 'x:y': { ok: true }, 'x:z': { ok: true } });
    const vu = r.fautes.join(' | ');
    dire(c.attendu.test(vu), c.quoi, vu ? ('vu : ' + vu.slice(0, 72)) : '⚠ RIEN VU — la faute est passée');
  }

  console.log('\n=== …et rien de plus ? ===');
  const r = await executerPage(sain.script, { 'x:y': { ok: true } });
  dire(!r.fautes.length, sain.quoi, r.fautes.join(' | '));
  // ⚠ L'ÉCRITURE D'ÉCRAN EST LA PREUVE QUE LE DESSIN A ÉTÉ ATTEINT. Sans elle, un
  // essai peut « ne rien casser » simplement parce qu'il n'a rien fait — c'est
  // l'erreur de méthode qui a coûté quatre versions.
  dire(r.ecritures > 0, 'le dessin est bien atteint (écriture comptée)', 'écritures = ' + r.ecritures);

  console.log(echecs ? '\n>>> ' + echecs + ' point(s) à corriger\n' : '\n>>> L’outil est digne de confiance\n');
  process.exit(echecs ? 1 : 0);
})();
