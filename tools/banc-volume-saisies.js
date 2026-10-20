#!/usr/bin/env node
'use strict';
/*
 * BANC — LES SAISIES DEVANT 10 000 ÉLÉMENTS (2026-10-19, audit — lot VOLUME)
 * =============================================================================
 *   • Recommandations : le produit source se CHERCHE (20 résultats au plus) au lieu d'un <select> de tout le
 *     catalogue ; la recherche d'articles est TEMPORISÉE (250 ms) ;
 *   • Recherches : la saisie du filtre est TEMPORISÉE (250 ms) au lieu de tout redessiner à chaque frappe.
 * La règle de la liste des sources est lue DANS la page générée et éprouvée sur 10 000 produits.
 *
 *   node tools/banc-volume-saisies.js           # le contrôle
 *   node tools/banc-volume-saisies.js --essai   # panne provoquée : la liste des sources n'est plus bornée
 */
const { pageRecommandations } = require('../src/fenetres/recommandations.js');
const { pageRecherches } = require('../src/fenetres/recherches.js');

let fautes = 0, n = 0;
const ok = (c, q) => { n++; if (!c) { fautes++; console.log('  NON ' + q); } };
const scriptDe = (page) => page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));

/* ── Recommandations ── */
{
  let s = scriptDe(pageRecommandations());
  if (process.argv.includes('--essai')) s = s.replace('l.length < 20', 'true');
  ok(!/<select id="rc-source"/.test(s), 'plus de <select id="rc-source"> portant tout le catalogue');
  const i0 = s.indexOf('function listeSources(');
  const i1 = s.indexOf('function boiteLiaison(', i0);
  ok(i0 > 0 && i1 > i0, 'listeSources introuvable dans la page');
  if (i0 > 0 && i1 > i0) {
    const cat = [];
    for (let i = 0; i < 10000; i++) cat.push({ id: 'p' + i, nom: 'Robe ' + i, sku: 'ROB-' + String(i).padStart(6, '0') });
    // eslint-disable-next-line no-new-func
    const fab = new Function('esc', 'QSRC_', s.slice(i0, i1).replace(/QSRC/g, 'QSRC_.v') + '; return listeSources;');
    const etat = { v: '' };
    const esc = (x) => String(x);
    const ls = fab(esc, etat);
    ok(!/data-src=/.test(ls(cat)), 'sans saisie : aucune liste (une invitation à taper)');
    etat.v = 'robe';
    const t0 = Date.now();
    const h = ls(cat);
    const ms = Date.now() - t0;
    const nb = (h.match(/data-src=/g) || []).length;
    ok(nb === 20, '« robe » sur 10 000 produits : 20 résultats au plus (vu ' + nb + ')');
    ok(ms < 200, 'temps borné : ' + ms + ' ms');
    etat.v = 'rob-009999';
    ok((ls(cat).match(/data-src=/g) || []).length === 1, 'un SKU exact retrouve son produit');
  }
  ok(/MINU_PROD = setTimeout\([\s\S]{0,900}?\}, 250\)/.test(s), 'la recherche d’articles est temporisée (250 ms)');
  ok(/MINU_SRC = setTimeout\([\s\S]{0,300}?, 250\)/.test(s), 'la recherche du produit source est temporisée (250 ms)');
}

/* ── Recherches ── */
{
  const s = scriptDe(pageRecherches());
  ok(/q\.oninput = function\(\)\{\s*Q = q\.value;\s*clearTimeout\([^)]*\);\s*window\.__rsMinu = setTimeout\(redessinerSansPerdreLaSaisie, 250\)/.test(s),
    'Recherches : le filtre est temporisé (250 ms) au lieu de redessiner à chaque frappe');
}

console.log(fautes ? '\nÉCHEC  saisies devant 10 000 éléments : ' + fautes + ' faute(s) sur ' + n
  : '\nOK  saisies : source cherchée (20 au plus), frappes temporisées — ' + n + ' vérifications');
process.exit(fautes ? 1 : 0);
