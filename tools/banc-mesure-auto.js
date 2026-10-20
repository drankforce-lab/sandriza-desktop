'use strict';
/*
 * BANC — LA MESURE AUTOMATIQUE DU VÊTEMENT (fenêtre Produit, 2026-10-20)
 * Trois silhouettes synthétiques aux dimensions CONNUES (un t-shirt, un pantalon, une robe
 * sans manches), dessinées à 8 px/cm sur un fond qui tranche : mvMesurerAuto doit retrouver
 * chaque mesure à ±1,5 cm, et refuser une photo sans vêtement plutôt que d'inventer.
 *   node tools/banc-mesure-auto.js
 */
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '..', 'src', 'fenetres', 'produit.js'), 'utf8');
const a = src.indexOf('  function mvMesurerAuto('), b = src.indexOf('  function mvOutilPhoto(');
const f = new Function(src.slice(a, b) + '; return mvMesurerAuto;')();
const K = 8; // px par cm
function canvas(W, H, dessin) {
  const d = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, on = dessin(x / K, y / K);
    const n = ((x * 7 + y * 13) % 9) - 4;
    if (on) { d[i] = 30 + n; d[i + 1] = 40 + n; d[i + 2] = 90 + n; } else { d[i] = 170 + n; d[i + 1] = 160 + n; d[i + 2] = 140 + n; }
    d[i + 3] = 255;
  }
  return { width: W, height: H, getContext: () => ({ getImageData: () => ({ data: d }) }) };
}
// T-shirt : corps 50 cm de large (x 25..75), du y 10 au y 80 (70 cm) ; épaules 25..75 à y 10..14 ;
// col creusé x 43..57, y 10..12 ; manches de y 10 à 30, de x 75 à 92 (courtes, en pente).
const tee = (x, y) => {
  if (y >= 10 && y <= 80 && x >= 25 && x <= 75) return !(x > 43 && x < 57 && y < 12);
  // manches : trapèze attaché de y 10..30 au corps
  if (y >= 10 && y <= 30) { const off = (y - 10) * 0.6; if (x > 75 && x < 92 - off * 0.2 && y > 10 + (x - 75) * 0.5) return true; if (x < 25 && x > 8 + off * 0.2 && y > 10 + (25 - x) * 0.5) return true; }
  return false;
};
let fautes = 0;
const attendu = (nom, r, exp) => {
  const m = r.mesures || {};
  for (const k of Object.keys(exp)) {
    const v = m[k] ? m[k].cm : null, ok = v != null && Math.abs(v - exp[k]) <= 1.5;
    if (!ok) fautes++;
    console.log((ok ? '  ✓ ' : '  ✗ ') + nom + ' ' + k + ' : ' + v + ' (attendu ' + exp[k] + ')');
  }
};
let r = f(canvas(100 * K, 95 * K, tee), 'haut', K, null);
attendu('haut', r, { longueur: 70, poitrine: 50, manche: 19 });
if (r.mesures && r.mesures.epaules) { fautes++; console.log('  ✗ haut : épaules devinées alors que la rangée court dans les manches'); }
// Pantalon : taille 40 (x 30..70) à y 5, hanches s'élargissent à 48 à y 25, entrejambe à y 30, jambes jusqu'à y 105.
const pant = (x, y) => {
  if (y < 5 || y > 105) return false;
  const demi = y < 25 ? 20 + (y - 5) * 0.2 : 24;
  if (x < 50 - demi || x > 50 + demi) return false;
  if (y > 30 && Math.abs(x - 50) < 2 + (y - 30) * 0.05) return false;
  return true;
};
r = f(canvas(100 * K, 112 * K, pant), 'bas', K, null);
attendu('bas', r, { taille: 40.5, hanches: 48, longueur: 100, entrejambe: 75 });
// Robe sans manches : buste 44 (y 8..25), taille 36 à y 40, hanches 48 à y 58, bas y 110.
const robe = (x, y) => {
  if (y < 8 || y > 110) return false;
  let demi;
  if (y < 22) demi = 16; else if (y < 40) demi = 22 - (y - 22) * (4 / 18); else if (y < 58) demi = 18 + (y - 40) * (6 / 18); else demi = 24 + (y - 58) * 0.08;
  if (y < 22 && Math.abs(x - 50) < 8 && y < 14) return false;
  return Math.abs(x - 50) <= demi;
};
r = f(canvas(100 * K, 118 * K, robe), 'robe', K, null);
attendu('robe', r, { longueur: 102, poitrine: 43, taille: 36, hanches: 48 });
// Fond qui ne tranche pas : erreur attendue
r = f(canvas(400, 400, () => false), 'haut', K, null);
if (r.erreur !== 'fond') { fautes++; console.log('  ✗ photo sans vêtement : ' + JSON.stringify(r)); } else console.log('  ✓ photo sans vêtement refusée');

// LA FEUILLE SUR UN MUR BLANC (sa photo du 2026-10-20) : le mur, clair et peu coloré, touche les
// bords et couvre la moitié de l'image — c'est lui que la détection prenait pour la feuille.
const a2 = src.indexOf('  function mvTrouverFeuille('), b2 = src.indexOf('  /* LES MESURES, PRISES TOUTES SEULES');
const trouver = new Function(src.slice(a2, b2) + '; return mvTrouverFeuille;')();
const mur = (x, y) => x < 48 && y < 62;              // un pan de mur blanc AU FORMAT D UNE FEUILLE, collé au bord
const feuilleIci = (x, y) => x > 70 && x < 91.59 && y > 70 && y < 97.94;   // lettre 21,59 × 27,94 cm
const cvF = (() => { const W = 110 * K, H = 105 * K, d = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, X = x / K, Y = y / K;
    const v = feuilleIci(X, Y) ? 250 : mur(X, Y) ? 236 : 95; d[i] = v; d[i + 1] = v; d[i + 2] = mur(X, Y) || feuilleIci(X, Y) ? v - 4 : 80; d[i + 3] = 255; }
  return { width: W, height: H, getContext: () => ({ getImageData: () => ({ data: d }) }) }; })();
const fe = trouver(cvF, 'lettre');
if (!fe || Math.abs(fe.pxParCm - K) > 0.4) { fautes++; console.log('  ✗ feuille sur mur blanc : ' + (fe ? fe.pxParCm.toFixed(2) + ' px/cm (attendu 8)' : 'introuvable')); }
else console.log('  ✓ feuille trouvée, pas le mur : ' + fe.pxParCm.toFixed(2) + ' px/cm');
// LA FEUILLE PAR SON X (sa photo du 2026-10-20) : une feuille presque de la couleur du mur (205 contre 206),
// marquée d'un X rose d'un coin à l'autre. La blancheur ne la trouve pas ; le X, si.
const a3 = src.indexOf('  function mvTrouverX('), b3 = src.indexOf('  /* L\'ANALYSE SUR PLACE');
const trouverX = new Function(src.slice(a3, b3) + '; return mvTrouverX;')();
const cvX = (() => { const W = 110 * K, H = 105 * K, d = new Uint8ClampedArray(W * H * 4);
  const x0 = 60, y0 = 40, L = 27.94, l = 21.59;           // feuille portrait, coin haut-gauche (60, 40) cm
  const surTrait = (X, Y) => { const u = (X - x0) / l, v = (Y - y0) / L; if (u < 0 || u > 1 || v < 0 || v > 1) return false;
    return Math.abs(u - v) * Math.min(l, L) < 0.18 || Math.abs(u - (1 - v)) * Math.min(l, L) < 0.18; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, X = x / K, Y = y / K;
    const dans = X > x0 && X < x0 + l && Y > y0 && Y < y0 + L, n = ((x * 7 + y * 13) % 5) - 2;
    let c = dans ? [205, 204, 222] : [206, 208, 228];
    if (surTrait(X, Y)) c = [190, 150, 175];
    if (X < 30 && Y > 20 && Y < 95) c = [120, 120, 130];  // un vêtement gris à gauche
    d[i] = c[0] + n; d[i + 1] = c[1] + n; d[i + 2] = c[2] + n; d[i + 3] = 255; }
  return { width: W, height: H, getContext: () => ({ getImageData: () => ({ data: d }) }) }; })();
const fx = trouverX(cvX, 'lettre');
if (!fx || Math.abs(fx.pxParCm - K) > 0.5) { fautes++; console.log('  ✗ feuille par son X : ' + (fx ? fx.pxParCm.toFixed(2) + ' px/cm (attendu 8)' : 'introuvable')); }
else console.log('  ✓ feuille trouvée par son X sur un mur de sa couleur : ' + fx.pxParCm.toFixed(2) + ' px/cm');
// …et un X ne s'invente pas : le t-shirt synthétique n'en porte aucun.
if (trouverX(canvas(100 * K, 95 * K, tee), 'lettre')) { fautes++; console.log('  ✗ un X inventé sur une photo qui n en a pas'); }
else console.log('  ✓ aucun X inventé sur une photo sans feuille');
console.log(fautes ? '>>> ' + fautes + ' faute(s)' : '>>> mesure automatique : tout est juste');
process.exit(fautes ? 1 : 0);
