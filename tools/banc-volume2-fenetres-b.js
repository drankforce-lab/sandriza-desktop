#!/usr/bin/env node
'use strict';
/*
 * BANC — CINQ FENÊTRES DEMANDENT LEUR PAGE AU CŒUR (2026-10-19, audit — lot VOLUME 2, groupe B)
 * =============================================================================
 * Réachat (inventaire.js), catalogue des promotions (promotions.js), explorateur de photos
 * (explorateur.js), corbeille du gardien (gardien.js), journal des SMS (telephonie.js).
 * Chaque fenêtre est EXÉCUTÉE (tools/executer-page.js) devant 10 000 éléments simulés : on relève
 * ce qu'elle demande au pont et ce qu'elle écrit dans la page.
 *   • elle demande UNE page ({ parPage } / { corbParPage } / taille de page) — jamais tout ;
 *   • elle n'écrit que cette page, et pose le marqueur du socle (data-pages-coeur / szPagesCoeur) ;
 *   • le pied du socle peut demander la page voisine (window.szPagesCoeur[cle](n)) ;
 *   • REPLI : devant un ancien site (pas de `pagine`), la fenêtre vit comme avant, sans faute ;
 *   • le script se compile et le tout tient en temps borné.
 *
 *   node tools/banc-volume2-fenetres-b.js           # le contrôle
 *   node tools/banc-volume2-fenetres-b.js --essai   # panne provoquée : un parPage retiré → ÉCHEC attendu
 */
const vm = require('vm');
const { executerPage } = require('./executer-page.js');

const ESSAI = process.argv.includes('--essai');
let fautes = 0, n = 0;
const ok = (c, q) => { n++; if (!c) { fautes++; console.log('  NON ' + q); } else console.log('  ok  ' + q); };

const scriptDe = (mod, nom) => {
  const page = require('../src/fenetres/' + mod + '.js')[nom]();
  return page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));
};
const remplacer = (s, a, b) => { if (s.indexOf(a) < 0) throw new Error('ancre absente du script : ' + a); return s.split(a).join(b); };
const compile = (s) => { try { new vm.Script('(function(){' + s + '})()'); return true; } catch (e) { console.log('  ' + e.message); return false; } };
const N = 10000;
const coupe = (tout, page, pp) => tout.slice(page * pp, page * pp + pp);

(async () => {
  const t0 = Date.now();

  /* ── 1. RÉACHAT (inventaire.js) ── */
  {
    // L'onglet Réachat ouvert d'office (comme le vœu « reappro » du tableau de bord).
    let s = remplacer(scriptDe('inventaire', 'pageInventaire'), "var ONGLET = 'produits';", "var ONGLET = 'reappro';");
    if (ESSAI) s = remplacer(s, "appeler('stock:reappro', [{ page: REAPPRO_PAGE, parPage: 50 }])", "appeler('stock:reappro', [{ page: REAPPRO_PAGE }])");
    ok(compile(s), 'réachat : le script se compile');
    ok(/szPagesCoeur\['inventaire-reappro'\]/.test(s) && /szPagesCoeurAttr\(REAPPRO_PG\)/.test(s), 'réachat : marqueur du socle posé (szPagesCoeurAttr + szPagesCoeur)');
    const TOUT = [];
    for (let i = 0; i < N; i++) TOUT.push({ produitId: 'p' + i, nom: 'Produit ' + i, cle: 'M|Noir', taille: 'M', couleur: 'Noir', couleurLibelle: 'Noir', qte: i % 3, seuil: 3, rupture: false, sku: 'SKU' + i });
    const rep = {
      'stock:voeu': { ok: true, voeu: '' },
      'stock:produits': { ok: true, page: 0, parPage: 25, lignes: [], total: 0, pages: 1, stats: { aCommander: N } },
      'stock:reappro': (f) => {
        if (!f || !f.parPage) return { ok: true, lignes: TOUT };
        const pages = Math.ceil(N / f.parPage);
        return { ok: true, pagine: true, lignes: coupe(TOUT, f.page || 0, f.parPage), total: N, page: f.page || 0, pages, parPage: f.parPage, nbAlertes: N };
      },
    };
    const ex = await executerPage(s + "\n;window.szPagesCoeur['inventaire-reappro'](7);", rep, { tours: 10 });
    ok(!ex.fautes.length, 'réachat : la fenêtre vit (' + ex.fautes.join(' | ') + ')');
    const a = ex.appels.filter((x) => x.op === 'stock:reappro');
    ok(a.length && a.every((x) => x.args[0] && x.args[0].parPage === 50), 'réachat : chaque lecture demande une page (parPage 50)');
    ok(a.some((x) => x.args[0] && x.args[0].page === 7), 'réachat : le pied demande la page voisine (page 7)');
    const rangs = (ex.html.match(/<tr data-ligne=/g) || []).length;
    const maxEcrit = Math.max(0, ...ex.html.split('\n').map((h) => (h.match(/<tr data-ligne=/g) || []).length));
    ok(rangs > 0 && maxEcrit <= 50, 'réachat : au plus 50 lignes par dessin (vu ' + maxEcrit + ', était 10 000)');
    ok(/data-pages-coeur="\d+,200,10000,50"/.test(ex.html), 'réachat : data-pages-coeur porte le vrai total (10 000)');
    // Repli : un ancien site rend toute la liste — sans faute.
    const vieux = await executerPage(remplacer(scriptDe('inventaire', 'pageInventaire'), "var ONGLET = 'produits';", "var ONGLET = 'reappro';"), { 'stock:voeu': rep['stock:voeu'], 'stock:produits': rep['stock:produits'], 'stock:reappro': { ok: true, lignes: TOUT.slice(0, 40) } }, { tours: 8 });
    ok(!vieux.fautes.length && !/data-pages-coeur/.test(vieux.html), 'réachat : repli (ancien site) sans faute ni marqueur');
  }

  /* ── 2. CATALOGUE DES PROMOTIONS (promotions.js) ── */
  {
    let s = scriptDe('promotions', 'pagePromotions');
    if (ESSAI) s = remplacer(s, "[{ sansCatalogue: true }]", '[]');
    ok(compile(s), 'promotions : le script se compile');
    ok(/appeler\('promos:catalogue', \[\{ q: QPROD\.trim\(\), ids: CHOISIS\.slice\(\), max: CHOIX_MAX \}\]\)/.test(s), 'promotions : la boîte CHERCHE le catalogue (promos:catalogue { q, ids, max })');
    ok(/D\.catalogueCherche/.test(s) && /var tout = \(D\.catalogue \|\| \[\]\);/.test(s), 'promotions : repli sur D.catalogue (ancien site)');
    const CAT = []; for (let i = 0; i < N; i++) CAT.push({ id: 'p' + i, nom: 'Produit ' + i, sku: 'S' + i, categorie: 'robes' });
    const liste = (f) => (f && f.sansCatalogue)
      ? { ok: true, offres: [], annonces: [], categories: [], peutModifier: true, nbCatalogue: N, catalogueCherche: true }
      : { ok: true, offres: [], annonces: [], categories: [], peutModifier: true, catalogue: CAT };
    const ex = await executerPage(s, { 'offres:liste': liste, 'annonces:liste': liste }, { tours: 8 });
    ok(!ex.fautes.length, 'promotions : la fenêtre vit (' + ex.fautes.join(' | ') + ')');
    const a = ex.appels.find((x) => x.op === 'offres:liste');
    ok(a && a.args[0] && a.args[0].sansCatalogue === true, 'promotions : la liste est demandée SANS le catalogue');
  }

  /* ── 3. EXPLORATEUR DE PHOTOS (explorateur.js) ── */
  {
    let s = scriptDe('explorateur', 'pageExplorateur');
    if (ESSAI) s = remplacer(s, 'tri: TRI, page: PAGE, taille: PARPAGE }', 'tri: TRI, page: 0, taille: 500 }');
    ok(compile(s), 'explorateur : le script se compile');
    const IDS = []; for (let i = 0; i < N; i++) IDS.push('ph' + i);
    const rep = {
      'studio:explorer': (f) => {
        const taille = Math.min(500, Math.max(10, f.taille || 60)), page = f.page || 0;
        return { ok: true, charge: true, peutModifier: true, total: N, trouvees: N, page, taille, pages: Math.ceil(N / taille),
          photos: coupe(IDS, page, taille).map((id) => ({ id, nom: id, code: id, apercu: 'https://x/' + id + '.jpg', faits: [] })),
          tousLesIds: IDS, filtres: [], traitements: [], fonds: [], lots: [] };
      },
      'studio:vignettes': { ok: true, vignettes: {} }, 'panier:lire': { ok: true, ids: [] },
    };
    const ex = await executerPage(s, rep, { tours: 10 });
    ok(!ex.fautes.length, 'explorateur : la fenêtre vit (' + ex.fautes.join(' | ') + ')');
    const a = ex.appels.filter((x) => x.op === 'studio:explorer');
    ok(a.length && a.every((x) => x.args[0] && x.args[0].taille <= 100), 'explorateur : la page affichée est demandée (taille ≤ 100, plus 0 × 500)');
    const maxEcrit = Math.max(0, ...ex.html.split('\n').map((h) => (h.match(/data-i="/g) || []).length));
    ok(maxEcrit > 0 && maxEcrit <= 100, 'explorateur : au plus une page écrite (vu ' + maxEcrit + ')');
    ok(/D\.srvPage && D\.tousLesIds/.test(s), 'explorateur : le Maj-clic prend sa plage dans tousLesIds (traverse les pages)');
  }

  /* ── 4. CORBEILLE DU GARDIEN (gardien.js) ── */
  {
    let s = remplacer(scriptDe('gardien', 'pageGardien'), "var ONG = 'bord';", "var ONG = 'corbeille';");
    if (ESSAI) s = remplacer(s, '{ corbPage: CORB_PAGE, corbParPage: CORB_PAR_PAGE }', '{ corbPage: CORB_PAGE }');
    ok(compile(s), 'gardien : le script se compile');
    const C = []; for (let i = 0; i < N; i++) C.push({ id: i, quand: '2026-10-01', source: 'produits', rec_id: 'p' + i, libelle: 'Fiche ' + i, user_id: '' });
    const etat = (f) => {
      const pp = (f && f.corbParPage) || 200, pg = (f && f.corbPage) || 0;
      return { ok: true, cfg: {}, verrous: [], evenements: [], journal: [], corbeille: coupe(C, pg, pp), corbeilleJours: 30,
        corbeillePage: { page: pg, parPage: pp, total: N, pages: Math.ceil(N / pp) } };
    };
    const ex = await executerPage(s + "\n;window.szPagesCoeur['gardien-corbeille'](4);", { 'gardien:etat': etat }, { tours: 10 });
    ok(!ex.fautes.length, 'gardien : la fenêtre vit (' + ex.fautes.join(' | ') + ')');
    const a = ex.appels.filter((x) => x.op === 'gardien:etat');
    ok(a.length && a.every((x) => x.args[0] && x.args[0].corbParPage === 50), 'gardien : la corbeille est demandée par pages (corbParPage 50)');
    ok(a.some((x) => x.args[0] && x.args[0].corbPage === 4), 'gardien : le pied demande la page voisine (corbPage 4)');
    const maxEcrit = Math.max(0, ...ex.html.split('\n').map((h) => (h.match(/data-rest="/g) || []).length));
    ok(maxEcrit > 0 && maxEcrit <= 50, 'gardien : au plus 50 entrées écrites (vu ' + maxEcrit + ')');
    ok(/Corbeille du serveur \(10000\)/.test(ex.html) && /data-pages-coeur="\d+,200,10000,50"/.test(ex.html), 'gardien : le VRAI total (COUNT) et le marqueur du socle');
    const vieux = await executerPage(remplacer(scriptDe('gardien', 'pageGardien'), "var ONG = 'bord';", "var ONG = 'corbeille';"),
      { 'gardien:etat': { ok: true, cfg: {}, verrous: [], evenements: [], journal: [], corbeille: C.slice(0, 200), corbeilleJours: 30 } }, { tours: 8 });
    ok(!vieux.fautes.length && /Corbeille du serveur \(200\)/.test(vieux.html), 'gardien : repli (ancien serveur) — les 200, sans faute');
  }

  /* ── 5. JOURNAL DES SMS (telephonie.js) ── */
  {
    let s = remplacer(scriptDe('telephonie', 'pageTelephonie'), "var ONGLET = 'general';", "var ONGLET = 'sms';");
    if (ESSAI) s = remplacer(s, "appeler('tel:sms:page', [{ page: pg, parPage: SMS_PAR_PAGE }])", "appeler('tel:sms:page', [{ page: pg }])");
    ok(compile(s), 'téléphonie : le script se compile');
    const M = []; for (let i = 0; i < N; i++) M.push({ id: 'sms' + i, from: '+15145550000', to: '+15145551111', body: 'm' + i, direction: 'inbound', read: true, date: '2026-10-01' });
    const page = (f) => {
      if (!f || !f.parPage) return { ok: false, motif: 'refus' };
      const pg = f.page || 0, pp = f.parPage;
      return { ok: true, pagine: true, sms: coupe(M, pg, pp), total: N, page: pg, parPage: pp, pages: Math.ceil(N / pp), nonLus: 0 };
    };
    const rep = { 'tel:resume': { ok: true, sms: M.slice(0, 30), nonLus: 0, voicemails: [] }, 'tel:sms:page': page };
    const ex = await executerPage(s + "\n;window.szPagesCoeur['tel-sms'](9);", rep, { tours: 10 });
    ok(!ex.fautes.length, 'téléphonie : la fenêtre vit (' + ex.fautes.join(' | ') + ')');
    const a = ex.appels.filter((x) => x.op === 'tel:sms:page');
    ok(a.length && a.every((x) => x.args[0] && x.args[0].parPage === 30), 'téléphonie : le journal se lit par pages (parPage 30)');
    ok(a.some((x) => x.args[0] && x.args[0].page === 9), 'téléphonie : le pied demande la page voisine (page 9)');
    const maxEcrit = Math.max(0, ...ex.html.split('\n').map((h) => (h.match(/class="corpsmsg"/g) || []).length));
    ok(maxEcrit > 0 && maxEcrit <= 30, 'téléphonie : au plus 30 messages écrits (vu ' + maxEcrit + ')');
    const vieux = await executerPage(remplacer(scriptDe('telephonie', 'pageTelephonie'), "var ONGLET = 'general';", "var ONGLET = 'sms';"),
      { 'tel:resume': rep['tel:resume'], 'tel:sms:page': { ok: false, motif: 'inconnue' } }, { tours: 8 });
    ok(!vieux.fautes.length, 'téléphonie : repli (op inconnue d’un ancien site) sans faute');
  }

  const ms = Date.now() - t0;
  ok(ms < 15000, 'temps borné : ' + ms + ' ms');
  console.log(fautes ? '\nÉCHEC  lot VOLUME 2 (groupe B) : ' + fautes + ' faute(s) sur ' + n
    : '\nOK  lot VOLUME 2 (groupe B) : réachat, catalogue des promotions, explorateur, corbeille du gardien, SMS — ' + n + ' vérifications');
  process.exit(fautes ? 1 : 0);
})().catch((e) => { console.log('ÉCHEC  banc interrompu : ' + ((e && e.stack) || e)); process.exit(1); });
