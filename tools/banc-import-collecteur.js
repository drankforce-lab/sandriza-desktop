'use strict';
/*
 * LE COLLECTEUR DE L'IMPORT FOURNISSEUR — SES ANALYSEURS PURS (8.33.2, 2026-11-17)
 * =============================================================================
 * Le premier vrai fournisseur essayé (Everful, un site fait sur mesure) a montré trois fautes que rien ne gardait :
 *   1. le prix pris dans le JSON-LD était le lowPrice d'une AggregateOffer — LE PRIX À 30 PIÈCES (6,51 $ US), pas
 *      le prix à l'unité (6,92 $ US) ; la grille des paliers, elle, n'était pas lue du tout ;
 *   2. une page de recherche dessinée en JavaScript ne portait que le décor : un lien « /support/articles/10 »
 *      passait pour un produit et sortait comme seul résultat, à 0 % ;
 *   3. le prix écrit dans une vignette était RETIRÉ du titre, puis perdu.
 * Ce banc rejoue ces trois cas sur des extraits de la page réelle, et provoque deux pannes pour vérifier qu'il
 * les voit. Aucun réseau, aucune fenêtre : seulement `_purs`.
 */
const path = require('path');
const C = require(path.join(__dirname, '..', 'src', 'import-fournisseur.js'))._purs;

// Extrait de la page produit Everful (2026-11-17), réduit à ce qui compte.
const PAGE_EVERFUL = '<html><head><meta property="og:title" content="Wholesale British Style Wool Scarf - Everful"/>'
  + '<meta property="product:price:currency" content="USD"/><meta property="product:price:amount" content="6.51"/>'
  + '<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"ProductGroup","name":"British Style 100% Wool Checkered Scarf",'
  + '"image":["https://cdn.everfulwholesale.com/image/1.jpg","https://cdn.everfulwholesale.com/image/2.jpg"],"description":"Wool scarf.",'
  + '"offers":{"@type":"AggregateOffer","priceCurrency":"USD","lowPrice":"6.51","highPrice":"6.92","offerCount":"23"}}]}</script></head><body>'
  + '<div><div><div>1 - 9 Pieces</div><div>$6.92</div></div><div><div>10 - 19 Pieces</div><div>$6.79</div><div>$6.92</div></div>'
  + '<div><div>20 - 29 Pieces</div><div>$6.65</div><div>$6.92</div></div><div><div>≥ 30 Pieces</div><div>$6.51</div><div>$6.92</div></div></div>'
  + '</body></html>';

const actes = [];
const acte = (nom, f) => { let v; try { v = f(); } catch (e) { v = 'exception : ' + e.message; } actes.push({ nom, ok: v === true, detail: v }); };

function jouer(P) {
  actes.length = 0;
  acte('le prix à l’unité et les paliers (Everful)', () => {
    const f = P.analyserProduitHtml(PAGE_EVERFUL, 'https://www.everfulwholesale.com/products/x');
    if (f.prix !== 6.92) return 'prix ' + f.prix + ' (attendu 6,92 : le lowPrice 6,51 est le prix à 30 pièces)';
    if (f.devise !== 'USD') return 'devise ' + f.devise;
    const p = (f.paliers || []).map((x) => x.min + ':' + x.prix).join(' ');
    return p === '1:6.92 10:6.79 20:6.65 30:6.51' || 'paliers : ' + p;
  });
  acte('une grille qui MONTE n’est pas une grille de quantités', () => {
    const g = P.paliersDe('<p>1-9 pcs $5.00</p><p>10-19 pcs $6.00</p>', null);
    return g.length === 0 || 'retenue : ' + JSON.stringify(g);
  });
  acte('les paliers du JSON-LD (eligibleQuantity)', () => {
    const prod = { offers: [{ priceSpecification: [{ price: '12.00', eligibleQuantity: { minValue: 1 } }, { price: '10.50', eligibleQuantity: { minValue: 12 } }] }] };
    const g = P.paliersDe('', prod);
    return (g.length === 2 && g[0].max === 11 && g[1].prix === 10.5) || JSON.stringify(g);
  });
  acte('le prix d’une vignette est GARDÉ (et retiré du titre)', () => {
    const l = P.liensProduits('<a href="/products/robe-mila"><img src="/a.jpg">Robe Mila $42.50 $55.00</a>', 'https://x.com/');
    return (l.length === 1 && l[0].titre === 'Robe Mila' && l[0].prix === 42.5) || JSON.stringify(l);
  });
  acte('une page d’aide n’est pas un produit', () => {
    const l = P.liensProduits('<a href="/support/articles/10">Shipping Information</a><a href="/products/foulard">Foulard</a>', 'https://x.com/');
    return (l.length === 1 && /foulard/.test(l[0].url)) || l.map((x) => x.url).join(', ');
  });
  return actes.filter((a) => !a.ok);
}

const rouges = jouer(C);
actes.forEach((a) => console.log((a.ok ? '  ✓ ' : '  ✗ ') + a.nom + (a.ok ? '' : ' — ' + a.detail)));

// § PANNES : le banc doit les voir.
let vues = 0;
// ① le lowPrice repris comme prix (aucun palier lu)
const sansPaliers = Object.assign({}, C, { analyserProduitHtml: (h, u) => C.analyserProduitHtml(String(h).replace(/≥ 30 Pieces|\d+ - \d+ Pieces/g, ''), u) });
if (jouer(sansPaliers).some((a) => /Everful/.test(a.nom))) vues++; else console.log('  ✗ PANNE NON VUE : le prix à 30 pièces pris pour le prix à l’unité');
// ② le prix de vignette perdu
const sansPrix = Object.assign({}, C, { liensProduits: (h, b) => C.liensProduits(h, b).map((x) => Object.assign({}, x, { prix: null })) });
if (jouer(sansPrix).some((a) => /vignette/.test(a.nom))) vues++; else console.log('  ✗ PANNE NON VUE : le prix de la vignette perdu');

const ok = rouges.length === 0 && vues === 2;
console.log((ok ? '✓ ' : '✗ ') + (5 - rouges.length) + ' actes verts sur 5, ' + vues + ' pannes vues sur 2');
process.exit(ok ? 0 : 1);
