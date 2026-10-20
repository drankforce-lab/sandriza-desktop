#!/usr/bin/env node
'use strict';
/*
 * BANC — LA FENÊTRE FACTURES DEVANT 10 000 FACTURES ET 5 000 CLIENTS (2026-10-19, audit — lot VOLUME)
 * =============================================================================
 * La fenêtre demande UNE page au pont (factures:liste { page, parPage, q, statut }) et ne dessine qu'elle,
 * avec un pagineur ; l'état de compte CHERCHE le client (factures:clients) au lieu d'un menu de 5 000.
 * Le cœur paginé est éprouvé côté site (tools/check/banc-volume-pages.js) ; ici, la fenêtre entière est
 * exécutée dans le faux document et on compte ce qu'elle écrit.
 *
 *   node tools/banc-volume-factures.js           # le contrôle
 *   node tools/banc-volume-factures.js --essai   # panne provoquée : la fenêtre ne demande plus de page
 */
const { executerPage } = require('./executer-page.js');
const { pageFactures } = require('../src/fenetres/factures.js');

let fautes = 0, n = 0;
const ok = (c, q) => { n++; if (!c) { fautes++; console.log('  NON ' + q); } };

const page = pageFactures();
let script = page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));
if (process.argv.includes('--essai')) script = script.replace("appeler('factures:liste', [{ page: PAGE, parPage: PAR_PAGE, q: Q, statut: STATUT }])", "appeler('factures:liste', [])");

const TOUTES = [];
for (let i = 0; i < 10000; i++) TOUTES.push({ id: 'inv' + i, numero: 'FAC-' + i, commande: 'CMD-' + i, commandeId: 'o' + i, client: 'Client ' + i,
  courriel: 'c' + i + '@ex.com', date: '2025-01-01', echeance: '2099-01-01', total: 100, statut: 'paid', statutLibelle: 'Payée' });
const CLIENTS = [];
for (let i = 0; i < 5000; i++) CLIENTS.push({ id: 'u' + i, nom: 'Client ' + i, courriel: 'u' + i + '@ex.com' });

const liste = (f) => {
  if (!f || !f.parPage) return { ok: true, lignes: TOUTES, tuiles: { total: 1e6, nb: 10000 }, peutEncaisser: true, peutSupprimer: true, clients: CLIENTS };
  const pages = Math.ceil(TOUTES.length / f.parPage);
  return { ok: true, pagine: true, lignes: TOUTES.slice(f.page * f.parPage, f.page * f.parPage + f.parPage), total: TOUTES.length,
    page: f.page, pages, parPage: f.parPage, comptes: { '': 10000, paid: 10000, unpaid: 0, overdue: 0, cancelled: 0 },
    prochaines: [], nbARecevoir: 0, tuiles: { total: 1e6, nb: 10000 }, peutEncaisser: true, peutSupprimer: true, aClients: true };
};

(async () => {
  const t0 = Date.now();
  const ex = await executerPage(script, { 'factures:liste': liste }, { tours: 8 });
  const ms = Date.now() - t0;
  ok(!ex.fautes.length, 'la fenêtre meurt : ' + ex.fautes.join(' | '));
  const appel = ex.appels.find((a) => a.op === 'factures:liste');
  ok(appel && appel.args[0] && appel.args[0].parPage === 50 && appel.args[0].page === 0, 'la fenêtre demande UNE page (page 0, 50 par page)');
  const rangs = (ex.html.match(/<tr data-id=/g) || []).length;
  ok(rangs > 0 && rangs <= 50, 'au plus 50 lignes écrites (vu ' + rangs + ', était 10 000)');
  ok(/data-fpg="1"/.test(ex.html) && /1 \/ 200/.test(ex.html), 'un pagineur « 1 / 200 » est dessiné');
  ok(ms < 3000, 'temps borné : ' + ms + ' ms');
  // L'état de compte : un champ de recherche relié à factures:clients, jamais 5 000 <option>.
  ok(/id="f-client-q"/.test(script) && /appeler\('factures:clients', \[cq\.value\]\)/.test(script), 'état de compte : le client se cherche (factures:clients)');
  console.log(fautes ? '\nÉCHEC  fenêtre Factures : ' + fautes + ' faute(s) sur ' + n
    : '\nOK  fenêtre Factures : une page demandée et dessinée, pagineur, client cherché — ' + n + ' vérifications');
  process.exit(fautes ? 1 : 0);
})();
