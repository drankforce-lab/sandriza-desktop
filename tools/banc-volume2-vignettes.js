#!/usr/bin/env node
'use strict';
/*
 * BANC — PHOTOTHEQUE ET ATELIER : DES VIGNETTES, PAR PAGES (2026-10-19, audit — lot VOLUME 2)
 * ==========================================================================================
 * Le selecteur de photos de la fiche produit recevait toutes les photos en PLEINE taille ; la
 * bibliotheque de l Atelier recevait tous les modeles entiers et tous les produits. Ce banc lit le
 * SCRIPT GENERE des deux fenetres (sans Chrome ni Electron) et exige :
 *   • produit.js : photos:liste demande { page, parPage }, les images en loading="lazy", la vignette
 *     (x.vignette) dans la grille, la photo entiere demandee au choix (photos:source) ;
 *   • atelier.js : atelier:donnees { leger: true, parPage }, atelier:modele a l ouverture,
 *     atelier:produits pour les produits, la grille marquee data-pages-coeur ;
 *   • les deux scripts COMPILENT (vm.Script).
 *
 *   node tools/banc-volume2-vignettes.js          # le controle
 *   node tools/banc-volume2-vignettes.js --essai  # panne provoquee : le selecteur redemande tout
 */
const path = require('path');
const vm = require('vm');

const ESSAI = process.argv.includes('--essai');
let fautes = 0, n = 0;
const dit = (ok, s) => { n++; if (!ok) fautes++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + s); };

const scripts = (html) => {
  const out = [];
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out.join('\n;\n');
};
const compile = (nom, js) => {
  try { new vm.Script(js, { filename: nom }); return ''; } catch (e) { return String(e && e.message || e); }
};

const F = path.join(__dirname, '..', 'src', 'fenetres');
let jsP = scripts(require(path.join(F, 'produit.js')).pageProduit(''));
let jsA = scripts(require(path.join(F, 'atelier.js')).pageAtelier(''));
if (ESSAI) jsP = jsP.replace("P.appeler('photos:liste', { page: TH.page, parPage: 24, q: TH.q })", "P.appeler('photos:liste')");

// ── produit.js ──
const eP = compile('produit', jsP);
dit(!eP, 'produit.js : le script compile' + (eP ? ' — ' + eP : ''));
dit(/P\.appeler\('photos:liste', \{[^}]*parPage: 24/.test(jsP), 'produit.js : photos:liste demande une PAGE (parPage 24)');
const th = jsP.slice(jsP.indexOf('function ouvrirTheque'), jsP.indexOf('function ouvrirTheque') + 9000);
dit(/alt="" loading="lazy" decoding="async"/.test(th), 'produit.js : les images du selecteur en loading="lazy"');
dit(th.indexOf('x.vignette') >= 0, 'produit.js : la grille montre la VIGNETTE');
dit(th.indexOf("'photos:source'") >= 0, 'produit.js : la photo entiere se demande au choix (photos:source)');
dit(th.indexOf('r.total') >= 0 && th.indexOf('data-thpg') >= 0, 'produit.js : pagination avec le vrai total');

// ── atelier.js ──
const eA = compile('atelier', jsA);
dit(!eA, 'atelier.js : le script compile' + (eA ? ' — ' + eA : ''));
dit(/leger: true, page: PG_PAGE, parPage: 24/.test(jsA), 'atelier.js : atelier:donnees { leger, page, parPage 24 }');
dit(jsA.indexOf("'atelier:modele'") >= 0, 'atelier.js : le modele entier se lit a l ouverture (atelier:modele)');
dit(jsA.indexOf("'atelier:produits'") >= 0, 'atelier.js : les produits se cherchent (atelier:produits)');
dit(/data-pages="atelier"' \+ \(LEGER \? szPagesCoeurAttr\(PGA\)/.test(jsA), 'atelier.js : la grille marquee data-pages-coeur');
dit(jsA.indexOf("appeler('atelier:donnees', []).then(") < 0, 'atelier.js : plus aucune relecture ENTIERE apres une ecriture (relireDonnees)');

console.log('\n' + (fautes ? fautes + ' ÉCHEC(S) sur ' + n : 'TOUT EST BON — ' + n + ' contrôles'));
process.exit(fautes ? 1 : 0);
