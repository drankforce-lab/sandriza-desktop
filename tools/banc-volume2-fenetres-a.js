#!/usr/bin/env node
'use strict';
/*
 * BANC — COUPONS, CARTES-CADEAUX, RETOURS, TRANSFERTS : LA PAGE DEMANDÉE AU CŒUR (2026-10-19, audit — lot VOLUME 2)
 * =============================================================================
 * Ces quatre fenêtres recevaient TOUTE la liste (10 000 coupons, cartes, demandes, variantes) puis
 * `data-pages` en masquait l'essentiel. Elles demandent maintenant { page, parPage } au cœur, marquent
 * leur conteneur `data-pages-coeur` (le pied du socle va chercher la page voisine par
 * window.szPagesCoeur[cle]) et gardent leur ancienne logique quand la réponse n'a pas `pagine`
 * (un site plus ancien). Les cœurs sont éprouvés côté site ; ici, chaque fenêtre est EXÉCUTÉE dans le
 * faux document (executer-page.js), deux fois : devant un cœur qui pagine (10 000 éléments) et devant
 * un ancien cœur (liste entière, sans `pagine`).
 *
 *   node tools/banc-volume2-fenetres-a.js           # le contrôle
 *   node tools/banc-volume2-fenetres-a.js --essai   # panne provoquée : les coupons ne demandent plus de page
 */
const { executerPage } = require('./executer-page.js');
const { pageCoupons } = require('../src/fenetres/coupons.js');
const { pageCartesCadeaux } = require('../src/fenetres/cartescadeaux.js');
const { pageRetours } = require('../src/fenetres/retours.js');
const { pageTransferts } = require('../src/fenetres/transferts.js');

const ESSAI = process.argv.includes('--essai');
const N = 10000;
let fautes = 0, n = 0;
const ok = (c, q) => { n++; if (!c) { fautes++; console.log('  NON ' + q); } else console.log('  oui ' + q); };
const scriptDe = (page) => page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));

// Un faux cœur : avec parPage → la page seule et le vrai total ; sans → toute la liste (ancien site).
const coeur = (tout, cle, extra) => (f) => {
  const base = Object.assign({ ok: true }, extra || {});
  if (!f || typeof f !== 'object' || !f.parPage) { base[cle] = tout; return base; }
  const pp = f.parPage, pages = Math.ceil(tout.length / pp), pg = Math.min(pages - 1, f.page || 0);
  base[cle] = tout.slice(pg * pp, pg * pp + pp);
  return Object.assign(base, { pagine: true, total: tout.length, page: pg, pages, parPage: pp });
};
const sansPage = (tout, cle, extra) => () => Object.assign({ ok: true, [cle]: tout }, extra || {});

const COUPONS = [], CARTES = [], RETOURS = [], CAND = [];
for (let i = 0; i < N; i++) {
  COUPONS.push({ id: 'cp' + i, code: 'CODE' + i, nom: 'Coupon ' + i, reduction: '10 %', minimum: 0, utilise: 1, maximum: 0, enCours: i % 2 === 0, actif: true });
  CARTES.push({ id: 'gc' + i, code: 'GC-' + i, destinataire: 'Dest ' + i, courriel: 'd' + i + '@ex.com', initial: 50, solde: 25,
    expediteur: 'Exp', date: '2026-01-01', statut: 'active', statutLibelle: 'Active' });
  RETOURS.push({ id: 'r' + i, client: 'Client ' + i, courriel: 'c' + i + '@ex.com', commande: 'CMD-' + i, motif: 'Taille',
    statut: 'pending', statutLibelle: 'En attente', date: '2026-01-01' });
  CAND.push({ productId: 'p' + i, cle: 'M|Noir', nom: 'Robe ' + i, sku: 'SKU' + i, qte: 3, de: 'w1', deNom: 'Entrepôt 1' });
}
const GC_EXTRA = { peutModifier: true, peutSupprimer: true, tuiles: { actives: N, total: N, enCirculation: 1, emis: 2, utilisees: 0 }, recompense: {} };
const RET_EXTRA = { onglet: 'pending', comptes: { pending: N, all: N } };
const TRF_DONNEES = { ok: true, peutEcrire: true, motifs: [], entrepots: [{ id: 'w1', code: 'E1', nom: 'Entrepôt 1' }, { id: 'w2', code: 'E2', nom: 'Entrepôt 2' }], lieux: [], transferts: [] };

const FENETRES = [
  { nom: 'Coupons', page: pageCoupons(), op: 'coupons:liste', cle: 'coupons', champ: 'coupons', rang: /class="ls-rang cp-rang/g,
    extra: { peutModifier: true, comptes: { tous: N, enCours: N / 2, utilisations: N } },
    essai: (s) => s.replace("appeler('coupons:liste', [{ page: PG, parPage: PAR_PAGE, q: Q, etat: ETAT }])", "appeler('coupons:liste', [])") },
  { nom: 'Cartes-cadeaux', page: pageCartesCadeaux(), op: 'cartescadeaux:liste', cle: 'cartescadeaux', champ: 'cartes', rang: /class="ls-rang cc-rang/g, extra: GC_EXTRA },
  { nom: 'Retours', page: pageRetours(), op: 'retours:liste', cle: 'retours', champ: 'lignes', rang: /<tr data-id=/g, extra: RET_EXTRA },
  { nom: 'Transferts (candidats)', page: pageTransferts('neuf'), op: 'transfert:candidats', cle: 'transferts-candidats', champ: 'lignes', rang: /data-part=/g,
    extra: {}, autres: { 'transfert:donnees': TRF_DONNEES },
    // L'onglet « Nouveau » ne cherche qu'au clic : on tourne la page 0 par le rappel du socle.
    suite: "\n;window.szPagesCoeur['transferts-candidats'](0);" },
];

(async () => {
  const t0 = Date.now();
  for (const F of FENETRES) {
    console.log('\n' + F.nom);
    let script = scriptDe(F.page);
    if (ESSAI && F.essai) script = F.essai(script);
    // 1. Le script compile.
    let compile = true;
    try { new Function(script); } catch (e) { compile = false; }
    ok(compile, 'le script de la fenêtre compile');
    // 2. Lecture du script : la page est demandée, marquée, le rappel déclaré, le repli gardé.
    ok(/parPage:\s*(PAR_PAGE|CAND_PAR_PAGE)/.test(script), 'la fenêtre envoie parPage au cœur');
    ok(/szPagesCoeurAttr\(/.test(script), 'le conteneur porte data-pages-coeur (szPagesCoeurAttr)');
    ok(new RegExp("szPagesCoeur = window\\.szPagesCoeur \\|\\| \\{\\}\\)(\\." + F.cle.replace(/-/g, '\\-') + "|\\['" + F.cle + "'\\])").test(script), 'window.szPagesCoeur.' + F.cle + ' est déclaré');
    ok(/\.pagine/.test(script), 'le repli sans « pagine » (ancien site) est gardé');
    // 3. Exécution devant un cœur qui pagine : UNE lecture, une page, le vrai total.
    const t1 = Date.now();
    const rep = Object.assign({}, F.autres || {}, { [F.op]: coeur(F.op === 'retours:liste' ? RETOURS : F.op === 'transfert:candidats' ? CAND : F.op === 'coupons:liste' ? COUPONS : CARTES, F.champ, F.extra) });
    const ex = await executerPage(script + (F.suite || ''), rep, { tours: 8 });
    const ms = Date.now() - t1;
    ok(!ex.fautes.length, 'la fenêtre tourne sans faute' + (ex.fautes.length ? ' : ' + ex.fautes.join(' | ') : ''));
    const appels = ex.appels.filter((a) => a.op === F.op);
    ok(appels.length === 1, 'une seule lecture de la liste (vu ' + appels.length + ')');
    const a0 = appels[0] && appels[0].args && appels[0].args[0];
    ok(!!(a0 && a0.parPage === 50 && a0.page === 0), 'la lecture demande la page 0, 50 par page');
    const rangs = (ex.html.match(F.rang) || []).length;
    ok(rangs > 0 && rangs <= 50, 'au plus 50 éléments écrits (vu ' + rangs + ', sur ' + N + ')');
    ok(/data-pages-coeur="0,200,10000,50"/.test(ex.html), 'data-pages-coeur="0,200,10000,50" posé');
    ok(ms < 3000, 'temps borné : ' + ms + ' ms');
    // 4. Devant un ANCIEN cœur (liste entière, sans pagine) : la fenêtre vit, sans marque de page du cœur.
    const rep2 = Object.assign({}, F.autres || {}, { [F.op]: sansPage(F.op === 'retours:liste' ? RETOURS.slice(0, 30) : F.op === 'transfert:candidats' ? CAND.slice(0, 30) : F.op === 'coupons:liste' ? COUPONS.slice(0, 30) : CARTES.slice(0, 30), F.champ, F.extra) });
    const ex2 = await executerPage(script + (F.suite || ''), rep2, { tours: 8 });
    ok(!ex2.fautes.length && !/data-pages-coeur=/.test(ex2.html) && (ex2.html.match(F.rang) || []).length === 30,
      'ancien site : la liste entière, filtrée sur place, sans data-pages-coeur' + (ex2.fautes.length ? ' : ' + ex2.fautes.join(' | ') : ''));
  }
  const total = Date.now() - t0;
  ok(total < 20000, 'banc entier borné : ' + total + ' ms');
  console.log(fautes ? '\nÉCHEC  fenêtres A (lot VOLUME 2) : ' + fautes + ' faute(s) sur ' + n
    : '\nOK  fenêtres A (lot VOLUME 2) : coupons, cartes-cadeaux, retours, transferts — une page demandée au cœur, repli gardé — ' + n + ' vérifications');
  process.exit(fautes ? 1 : 0);
})();
