#!/usr/bin/env node
'use strict';
/*
 * BANC — CONCILIATION BANCAIRE : 800 LIGNES DE RELEVÉ × 800 VERSEMENTS (2026-10-19, audit — lot VOLUME)
 * =============================================================================
 * Avant : chaque ligne non appariée du relevé portait son propre <select> avec TOUS les versements non
 * appariés — 800 × 800 = 640 000 <option> construites à chaque dessin de l'onglet Appariement.
 * Maintenant : un bouton par ligne, UN sélecteur ouvert à la demande, filtré et paginé (40 par page).
 * Ce banc exécute la fenêtre entière (tools/executer-page.js) et compte ce qu'elle a écrit.
 *
 *   node tools/banc-volume-banque.js           # le contrôle
 *   node tools/banc-volume-banque.js --essai   # panne provoquée : un sélecteur complet sur chaque ligne
 */
const { executerPage } = require('./executer-page.js');
const { pageBanque } = require('../src/fenetres/banque.js');

let fautes = 0, n = 0;
const ok = (c, q) => { n++; if (!c) { fautes++; console.log('  NON ' + q); } };

const page = pageBanque('appariement');
let script = page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));
if (process.argv.includes('--essai')) script = script.replace('(APP_OUVERT === e.id ? (function(){', '(true ? (function(){').replace('var APP_OUVERT = \'\', APP_Q = \'\', APP_LIM = 40;', 'var APP_OUVERT = \'\', APP_Q = \'\', APP_LIM = 1e9;');

const N = 800;
const bank = [], pay = [];
for (let i = 0; i < N; i++) {
  bank.push({ id: 'b' + i, date: '2025-03-' + String(1 + (i % 28)).padStart(2, '0'), description: 'Dépôt ' + i, type: 'depot', amount: 100 + i, status: 'unmatched' });
  pay.push({ id: 'p' + i, arrivalDate: '2025-03-' + String(1 + (i % 28)).padStart(2, '0'), description: 'Versement Square ' + i, amount: 100 + i, status: 'unmatched' });
}
const rep = {
  'banque:donnees': { ok: true, annee: 2025, liste: [{ id: 'rec1', label: 'Mars 2025', status: 'ouvert' }], peutEcrire: true, verrouille: false,
    rec: { id: 'rec1', label: 'Mars 2025', status: 'ouvert', bankEntries: bank, squarePayouts: pay }, resume: {} },
};

(async () => {
  const t0 = Date.now();
  const ex = await executerPage(script, rep, { tours: 12 });
  const ms = Date.now() - t0;
  const nOpt = (ex.html.match(/<option/g) || []).length;
  const nBtn = (ex.html.match(/data-app-ouvrir=/g) || []).length;
  ok(!ex.fautes.length, 'la fenêtre meurt : ' + ex.fautes.join(' | '));
  ok(nBtn === N, 'un bouton « Apparier… » par ligne non appariée (vu ' + nBtn + ' sur ' + N + ')');
  ok(nOpt < 100, 'aucun sélecteur complet par ligne : ' + nOpt + ' <option> écrites (était : ' + (N * (N + 1)) + ')');
  ok(ms < 3000, 'temps borné : ' + ms + ' ms');
  // La règle du sélecteur, lue dans la page : classée par proximité du montant, filtrée, bornée.
  const i0 = script.indexOf('function candidatsApp(');
  const i1 = script.indexOf('function optionsApp(', i0);
  ok(i0 > 0 && i1 > i0, 'candidatsApp introuvable dans la page');
  if (i0 > 0 && i1 > i0) {
    // eslint-disable-next-line no-new-func
    const candidatsApp = new Function(script.slice(i0, i1) + '; return candidatsApp;')();
    const c = candidatsApp(pay, { amount: 523 }, '', 40);
    ok(c.total === N && c.vus.length === 40 && c.vus[0].id === 'p423', 'le premier proposé est le versement du MÊME montant (p423), 40 par page');
    const f = candidatsApp(pay, { amount: 523 }, 'square 77', 40);
    ok(f.total === 11 && f.vus.every((p) => /Square 77/.test(p.description)), 'le filtre « square 77 » ne garde que ses 11 versements');
  }
  console.log(fautes ? '\nÉCHEC  conciliation 800 × 800 : ' + fautes + ' faute(s) sur ' + n
    : '\nOK  conciliation 800 × 800 : un bouton par ligne, un sélecteur filtré et paginé à la demande — ' + n + ' vérifications');
  process.exit(fautes ? 1 : 0);
})();
