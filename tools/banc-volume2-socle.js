#!/usr/bin/env node
'use strict';
/*
 * BANC — LE PIED DE PAGE DU SOCLE PARCOURT LES PAGES DU CŒUR (2026-10-19, audit — lot VOLUME 2)
 * =============================================================================
 * Décision : `data-pages` RESTE pour faire tenir des lignes dans la hauteur (aucune glissière),
 * mais ne sert plus à CACHER une grande liste. La fenêtre demande { page, parPage } au cœur et
 * marque son conteneur `data-pages-coeur="PAGE,PAGES,TOTAL,PARPAGE"` ; le pied unique parcourt
 * les pages mesurées, et au bord demande la page voisine au cœur (window.szPagesCoeur[cle]).
 * Ce banc exécute le VRAI JS_PAGES (tiré d'une page générée) dans un faux document :
 * 50 lignes de 20 px dans 200 px (5 pages mesurées) × 200 pages du cœur (10 000 éléments).
 *
 *   node tools/banc-volume2-socle.js           # le contrôle
 *   node tools/banc-volume2-socle.js --essai   # panne provoquée : le bord ne demande plus la page voisine
 */
const vm = require('vm');
const { pageCoupons } = require('../src/fenetres/coupons.js');

let fautes = 0, n = 0;
const ok = (c, q) => { n++; if (!c) { fautes++; console.log('  NON ' + q); } };

const page = pageCoupons();
const i0 = page.indexOf('var _szPg = ');
const i1 = page.indexOf('/* Les listes pleine hauteur du socle', i0);
let js = page.slice(i0, i1 > 0 ? i1 : page.indexOf('function szPagesTout', i0));
if (process.argv.includes('--essai')) js = js.replace('if (co && ((d < 0', 'if (false && co && ((d < 0');
ok(i0 > 0 && /function _szPgCoeur/.test(js) && /function szPagesCoeurAttr/.test(js), 'JS_PAGES porte _szPgCoeur et szPagesCoeurAttr');

const demandes = [];
function ligne(i){
  return { style: {}, tagName: 'DIV', classList: { contains: () => false },
    getBoundingClientRect: () => ({ top: i * 20, bottom: i * 20 + 20, height: 20 }) };
}
function conteneur(attrs, nb){
  const A = Object.assign({}, attrs);
  const c = { children: [], isConnected: true, clientHeight: 200, next: null,
    getAttribute: (k) => (k in A ? A[k] : null), setAttribute: (k, v) => { A[k] = String(v); },
    hasAttribute: (k) => k in A, querySelector: () => null,
    getBoundingClientRect: () => ({ top: 0, bottom: 200 }) };
  for (let i = 0; i < nb; i++) c.children.push(ligne(i));
  c.parentNode = { insertBefore: (p) => { c.next = p; p.previousElementSibling = c; } };
  Object.defineProperty(c, 'nextElementSibling', { get: () => c.next });
  return c;
}
const ctx = {
  window: null, console, setTimeout, Math, parseInt, parseFloat, String,
  getComputedStyle: () => ({ paddingBottom: '0' }),
  document: { readyState: 'complete', createElement: () => {
    const p = { style: {}, innerHTML: '', className: '', attrs: {} };
    p.setAttribute = (k, v) => { p.attrs[k] = v; }; p.getAttribute = (k) => p.attrs[k];
    p.classList = { contains: (k) => String(p.className).split(' ').indexOf(k) >= 0 };
    p.addEventListener = (t, fn) => { p.clic = fn; };
    return p; }, querySelectorAll: () => [] },
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(js + '\n;globalThis.__aj = szPagesAjuster; globalThis.__attr = szPagesCoeurAttr;', ctx);
const aj = ctx.__aj;

const pos = (c) => ((c.next.innerHTML.match(/class="pos">([^<]*)</) || [])[1] || '').replace(/\s+/g, ' ');
const fermee = (c, d) => new RegExp('data-szpg="' + d + '"[^>]*disabled').test(c.next.innerHTML);
const clic = (c, d) => c.next.clic({ target: { closest: () => ({ disabled: fermee(c, d), getAttribute: () => String(d) }) } });

const t0 = Date.now();
ctx.szPagesCoeur.coupons = (p) => demandes.push(p);
const c = conteneur({ 'data-pages': 'coupons', 'data-pages-coeur': '0,200,10000,50' }, 50);
aj(c);
ok(pos(c) === '1–10 sur 10000', 'première page mesurée : « 1–10 sur 10000 » (vu « ' + pos(c) + ' »)');
ok(fermee(c, -1) && !fermee(c, 1), 'précédente fermée au tout début, suivante ouverte');
for (let k = 0; k < 4; k++) clic(c, 1);
ok(pos(c) === '41–50 sur 10000' && !demandes.length, 'les pages mesurées défilent sans rien demander au cœur (« ' + pos(c) + ' »)');
clic(c, 1);
ok(demandes.length === 1 && demandes[0] === 1, 'au bord, la page SUIVANTE du cœur est demandée (vu ' + JSON.stringify(demandes) + ')');
// La fenêtre recharge : nouvelle page du cœur, mêmes 50 lignes.
c.setAttribute('data-pages-coeur', '1,200,10000,50'); aj(c);
ok(pos(c) === '51–60 sur 10000', 'la page 2 du cœur s’ouvre sur sa première page mesurée (« ' + pos(c) + ' »)');
clic(c, -1);
ok(demandes.length === 2 && demandes[1] === 0, 'au bord gauche, la page PRÉCÉDENTE du cœur est demandée');
c.setAttribute('data-pages-coeur', '0,200,10000,50'); aj(c);
ok(pos(c) === '41–50 sur 10000', 'en reculant, elle s’ouvre sur sa DERNIÈRE page mesurée (« ' + pos(c) + ' »)');
c.setAttribute('data-pages-coeur', '199,200,10000,50'); aj(c);
for (let k = 0; k < 4; k++) clic(c, 1);
ok(fermee(c, 1) && pos(c) === '9991–10000 sur 10000', 'à la toute fin, suivante fermée (« ' + pos(c) + ' »)');
// Une petite liste, sans cœur : le comportement d avant.
const s = conteneur({ 'data-pages': 'petite' }, 30); aj(s);
ok(/page 1 \/ 3/.test(pos(s)) && pos(s).indexOf('1–10 sur 30') === 0, 'petite liste sans cœur : « 1–10 sur 30 · page 1 / 3 », comme avant');
// Une page de cœur qui tient en une page mesurée : le pied reste (il y a d autres pages au cœur).
const u = conteneur({ 'data-pages': 'u', 'data-pages-coeur': '0,3,120,5' }, 5); aj(u);
ok(u.next.style.display !== 'none' && pos(u) === '1–5 sur 120', 'une page du cœur qui tient entière garde son pied (« ' + pos(u) + ' »)');
ok(ctx.__attr({ pagine: true, page: 2, pages: 9, total: 400, parPage: 50 }) === ' data-pages-coeur="2,9,400,50"' && ctx.__attr({ ok: true }) === '',
  'szPagesCoeurAttr : l attribut pour une réponse paginée, rien pour une ancienne');
const ms = Date.now() - t0;
ok(ms < 1000, 'temps borné : ' + ms + ' ms');

console.log(fautes ? 'ÉCHEC  pied du socle et pages du cœur : ' + fautes + ' faute(s) sur ' + n
  : 'OK  pied du socle : pages mesurées DANS la page du cœur, bord → page voisine demandée — ' + n + ' vérifications');
process.exit(fautes ? 1 : 0);
