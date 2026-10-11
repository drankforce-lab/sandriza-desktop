#!/usr/bin/env node
'use strict';

/*
 * BANC — LES CARTES DE TRANSPORTEURS GARDENT LEUR NOM (2026-10-11)
 * =============================================================================
 * En 7.18.0, la case « Clé » de Purolator a été ajoutée sous la propriété `cle`
 * de son entrée SIMPLES — or `sp.cle` EST le nom du transporteur. Purolator
 * devenait « [object Object] » : la fenêtre ne l'envoyait plus (rien ne
 * s'enregistrait), sa carte se redessinait vide (l'interrupteur se désactivait
 * seul) et une case « Clé » sans identifiant paraissait sur les quatre cartes.
 * Aucun banc ne l'a vu : la page se chargeait, les textes étaient traduits.
 *
 * Ce banc lit SIMPLES dans la page générée et vérifie :
 *   - chaque entrée a un `cle` TEXTE, unique, parmi les transporteurs connus ;
 *   - la saisie de la fenêtre produit bien un objet sous chacun de ces noms ;
 *   - aucun champ de la page n'a un id « undefined ».
 *
 *   node tools/banc-transporteurs-cles.js
 */

const { pageTransporteurs } = require('../src/fenetres/transporteurs.js');

const fautes = [];
const h = pageTransporteurs();
const js = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((x) => x[1]).join('\n');
const i = js.indexOf('var SIMPLES');
const j = js.indexOf('];', i) + 1;
let SIMPLES = [];
try { SIMPLES = eval(js.slice(i, j).replace('var SIMPLES =', '(') + ')'); }
catch (e) { fautes.push('SIMPLES illisible dans la page : ' + e.message); }

const CONNUS = ['purolator', 'intelcom', 'eshipper', 'fedex', 'ups', 'canpar'];
const vus = new Set();
SIMPLES.forEach((sp, n) => {
  if (typeof sp.cle !== 'string') { fautes.push(`entrée ${n} : « cle » n'est pas un nom de transporteur (${typeof sp.cle})`); return; }
  if (!CONNUS.includes(sp.cle)) fautes.push(`entrée ${n} : transporteur inconnu « ${sp.cle} »`);
  if (vus.has(sp.cle)) fautes.push(`« ${sp.cle} » en double`);
  vus.add(sp.cle);
  // Chaque sous-champ déclaré (user, sec, acct, mode, cleApi, tests) porte un id.
  ['user', 'sec', 'acct', 'mode', 'cleApi'].forEach((k) => {
    if (sp[k] && typeof sp[k] === 'object' && !sp[k].id) fautes.push(`${sp.cle}.${k} sans id`);
  });
  (sp.tests || []).forEach((t) => { if (!t.id || !t.champ) fautes.push(`${sp.cle}.tests : champ sans id ou sans nom`); });
});
CONNUS.forEach((c) => { if (!vus.has(c)) fautes.push(`la carte « ${c} » a disparu`); });
if (/id="undefined"/.test(h) || /data-voir="undefined"/.test(h)) fautes.push('un champ porte id="undefined"');
// Le gabarit de la carte, s'il s'exécutait avec une entrée sans nom, écrirait sous « [object Object] ».
if (/s\[sp\.cle\]\s*=\s*o/.test(js) && SIMPLES.some((sp) => typeof sp.cle !== 'string')) fautes.push('saisie() écrirait sous un nom non textuel');

if (fautes.length) { console.log('✗ cartes de transporteurs :\n  - ' + fautes.join('\n  - ')); process.exit(1); }
console.log('✓ cartes de transporteurs : ' + SIMPLES.map((s) => s.cle).join(', ') + ' — chacune garde son nom et ses champs ont un id');
