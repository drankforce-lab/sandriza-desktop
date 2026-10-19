'use strict';

/*
 * LES VRAIES PHOTOS SUR LE MODÈLE 3D (2026-10-18)
 * =============================================================================
 * Sa crainte, légitime : « Image to 3D » de The New Black ne voit QUE le devant ;
 * le dos qu'il invente pourrait ne pas être celui du vêtement qu'on vend. Son
 * exigence : le devant ET le dos du modèle portent les VRAIS pixels des photos.
 *
 * LA MÉTHODE, au poste, sans appel, en JavaScript pur (ce fichier tourne dans un
 * fil à part — projection3d-tache.js — pour ne pas figer l'application) :
 *   1. LE SENS du modèle : l'axe le plus court de la boîte est la profondeur ; des
 *      deux faces, le DEVANT est celle dont le rendu ressemble le plus à la photo
 *      du devant (silhouette + motif) ;
 *   2. UNE VUE ORTHOGRAPHIQUE de face et une de dos, rastérisées ici (profondeur,
 *      triangle, coordonnées barycentriques par pixel) ;
 *   3. LE RECALAGE de chaque photo détourée sur la silhouette rendue : échelle
 *      horizontale et verticale + translation, cherchées pour MAXIMISER l'IoU ;
 *   4. LA PROJECTION : chaque texel de la texture (triangles rastérisés en espace
 *      UV, position 3D et normale interpolées) qui fait face à la caméra
 *      (n·v > 0,25) et qu'aucune autre surface ne cache (test de profondeur)
 *      prend la couleur de la photo à cet endroit — poids = n·v en fondu doux
 *      vers les côtés, où la texture de The New Black reste ; les bords du
 *      détourage sont évités (masque érodé) ;
 *   5. LA COULEUR : la texture de The New Black (les côtés) et la photo du dos
 *      sont ramenées sur la teinte de la photo du DEVANT (médiane du vêtement,
 *      gains bornés 0,7–1,4) — la même teinte tout le tour ;
 *   6. LA CONFORMITÉ : le modèle final, rendu de face et de dos, comparé à la
 *      photo correspondante — IoU des silhouettes et écart de couleur médian
 *      (ΔE). Sous le seuil, la fenêtre AVERTIT et ne publie pas sans accord.
 */

// ── Les outils ──────────────────────────────────────────────────────────────
const sous = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const croix = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scal = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lisse = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const HAUT = [0, 1, 0];

// ── 1. Une vue orthographique : profondeur, triangle et barycentriques par pixel ──
function vue(maillage, dir, hauteur){
  const d = unit(dir), r = unit(croix(d, HAUT));
  const { pos, idx } = maillage, nV = pos.length / 3;
  const X = new Float32Array(nV), Y = new Float32Array(nV), Z = new Float32Array(nV);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < nV; i++) {
    const p = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
    X[i] = scal(p, r); Y[i] = p[1]; Z[i] = scal(p, d);
    if (X[i] < x0) x0 = X[i]; if (X[i] > x1) x1 = X[i]; if (Y[i] < y0) y0 = Y[i]; if (Y[i] > y1) y1 = Y[i];
  }
  const H = hauteur, marge = Math.round(H * 0.04), s = (H - 2 * marge) / Math.max(1e-6, y1 - y0);
  const W = Math.ceil((x1 - x0) * s) + 2 * marge;
  const px = (x) => (x - x0) * s + marge, py = (y) => (y1 - y) * s + marge;
  const prof = new Float32Array(W * H).fill(Infinity), tri = new Int32Array(W * H).fill(-1);
  const b1 = new Float32Array(W * H), b2 = new Float32Array(W * H);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    const ax = px(X[a]), ay = py(Y[a]), bx = px(X[b]), by = py(Y[b]), cx = px(X[c]), cy = py(Y[c]);
    const aire = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(aire) < 1e-9) continue;
    const mx = Math.max(0, Math.floor(Math.min(ax, bx, cx))), Mx = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)));
    const my = Math.max(0, Math.floor(Math.min(ay, by, cy))), My = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)));
    for (let y = my; y <= My; y++) for (let x = mx; x <= Mx; x++) {
      const qx = x + 0.5, qy = y + 0.5;
      const w1 = ((qx - ax) * (cy - ay) - (cx - ax) * (qy - ay)) / aire;
      const w2 = ((bx - ax) * (qy - ay) - (qx - ax) * (by - ay)) / aire;
      const w0 = 1 - w1 - w2;
      if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
      const z = w0 * Z[a] + w1 * Z[b] + w2 * Z[c], k = y * W + x;
      if (z < prof[k]) { prof[k] = z; tri[k] = t; b1[k] = w1; b2[k] = w2; }
    }
  }
  const masque = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) masque[k] = tri[k] >= 0 ? 1 : 0;
  let zMin = Infinity, zMax = -Infinity; for (let i = 0; i < nV; i++) { if (Z[i] < zMin) zMin = Z[i]; if (Z[i] > zMax) zMax = Z[i]; }
  return { W, H, d, r, prof, tri, b1, b2, masque, projeter: (p) => [px(scal(p, r)), py(p[1]), scal(p, d)], tolerance: (zMax - zMin) * 0.02 };
}

// La couleur rendue d'une vue (texture échantillonnée aux UV interpolées) — pour la comparer à la photo.
function couleurVue(v, maillage, tex){
  const { uv, idx } = maillage, out = new Uint8ClampedArray(v.W * v.H * 4);
  for (let k = 0; k < v.W * v.H; k++) {
    const t = v.tri[k]; if (t < 0) continue;
    const a = idx[t], b = idx[t + 1], c = idx[t + 2], w1 = v.b1[k], w2 = v.b2[k], w0 = 1 - w1 - w2;
    const u = w0 * uv[a * 2] + w1 * uv[b * 2] + w2 * uv[c * 2], vv = w0 * uv[a * 2 + 1] + w1 * uv[b * 2 + 1] + w2 * uv[c * 2 + 1];
    const c4 = echantillon(tex, u * tex.w, vv * tex.h);
    out[k * 4] = c4[0]; out[k * 4 + 1] = c4[1]; out[k * 4 + 2] = c4[2]; out[k * 4 + 3] = 255;
  }
  return out;
}
function echantillon(im, x, y){
  const W = im.w, H = im.h, d = im.data;
  x = Math.max(0, Math.min(W - 1.001, x - 0.5)); y = Math.max(0, Math.min(H - 1.001, y - 0.5));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, o = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const a = d[(y0 * W + x0) * 4 + c], b = d[(y0 * W + x0 + 1) * 4 + c], e = d[((y0 + 1) * W + x0) * 4 + c], f = d[((y0 + 1) * W + x0 + 1) * 4 + c];
    o[c] = (a * (1 - fx) + b * fx) * (1 - fy) + (e * (1 - fx) + f * fx) * fy;
  }
  return o;
}

// ── 2. La photo détourée : le fond = la médiane des bords ; la plus grande pièce ──
function masquePhoto(ph){
  const { w, h, data: d } = ph, m = new Uint8Array(w * h);
  const R = [], G = [], B = [];
  for (let x = 0; x < w; x += 2) for (const y of [0, h - 1]) { const i = (y * w + x) * 4; R.push(d[i]); G.push(d[i + 1]); B.push(d[i + 2]); }
  for (let y = 0; y < h; y += 2) for (const x of [0, w - 1]) { const i = (y * w + x) * 4; R.push(d[i]); G.push(d[i + 1]); B.push(d[i + 2]); }
  const med = (a) => { a.sort((p, q) => p - q); return a[a.length >> 1]; };
  const bg = [med(R), med(G), med(B)];
  for (let k = 0; k < w * h; k++) {
    const i = k * 4;
    if (d[i + 3] < 128) continue;
    if (Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) > 45) m[k] = 1;
  }
  // la plus grande pièce (le vêtement) ; les miettes du fond tombent
  const etq = new Int32Array(w * h), pile = new Int32Array(w * h); let meilleur = 0, taille = 0, n = 0;
  for (let k = 0; k < w * h; k++) {
    if (!m[k] || etq[k]) continue;
    n++; let sp = 0, t = 0; pile[sp++] = k; etq[k] = n;
    while (sp) {
      const i = pile[--sp]; t++; const x = i % w, y = (i - x) / w;
      if (x > 0 && m[i - 1] && !etq[i - 1]) { etq[i - 1] = n; pile[sp++] = i - 1; }
      if (x < w - 1 && m[i + 1] && !etq[i + 1]) { etq[i + 1] = n; pile[sp++] = i + 1; }
      if (y > 0 && m[i - w] && !etq[i - w]) { etq[i - w] = n; pile[sp++] = i - w; }
      if (y < h - 1 && m[i + w] && !etq[i + w]) { etq[i + w] = n; pile[sp++] = i + w; }
    }
    if (t > taille) { taille = t; meilleur = n; }
  }
  for (let k = 0; k < w * h; k++) m[k] = etq[k] === meilleur ? 1 : 0;
  // les trous INTÉRIEURS (un reflet blanc, une étiquette) sont du vêtement : on remplit depuis les bords
  const dehors = new Uint8Array(w * h); let sp = 0;
  const pousser = (i) => { if (!m[i] && !dehors[i]) { dehors[i] = 1; pile[sp++] = i; } };
  for (let x = 0; x < w; x++) { pousser(x); pousser((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { pousser(y * w); pousser(y * w + w - 1); }
  while (sp) {
    const i = pile[--sp], x = i % w, y = (i - x) / w;
    if (x > 0) pousser(i - 1); if (x < w - 1) pousser(i + 1); if (y > 0) pousser(i - w); if (y < h - 1) pousser(i + w);
  }
  for (let k = 0; k < w * h; k++) if (!dehors[k]) m[k] = 1;
  return { m, bg };
}
function eroder(m, w, h, r){
  let a = m;
  for (let p = 0; p < r; p++) {
    const b = new Uint8Array(w * h);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const k = y * w + x; b[k] = (a[k] && a[k - 1] && a[k + 1] && a[k - w] && a[k + w]) ? 1 : 0;
    }
    a = b;
  }
  return a;
}
function boite(m, w, h){
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m[y * w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

// ── 3. Le recalage : photo → vue, par échelle (x, y) et translation, IoU maximal ──
function recaler(vueM, W, H, ph, phM){
  const bv = boite(vueM, W, H), bp = boite(phM, ph.w, ph.h);
  if (!bv || !bp) return null;
  // la recherche se fait sur des masques réduits (~160 px de haut) : rapide, et assez fin
  const k = 160 / H, w2 = Math.max(8, Math.round(W * k)), h2 = 160;
  const petitV = new Uint8Array(w2 * h2);
  for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) petitV[y * w2 + x] = vueM[Math.min(H - 1, Math.floor(y / k)) * W + Math.min(W - 1, Math.floor(x / k))];
  const sx0 = (bv.x1 - bv.x0) / (bp.x1 - bp.x0), sy0 = (bv.y1 - bv.y0) / (bp.y1 - bp.y0);
  const iou = (sx, sy, tx, ty) => {
    let inter = 0, uni = 0;
    for (let y = 0; y < h2; y++) {
      const Y = y / k, py = Math.floor((Y - ty) / sy);
      for (let x = 0; x < w2; x++) {
        const X = x / k, pxx = Math.floor((X - tx) / sx);
        const a = petitV[y * w2 + x], b = (pxx >= 0 && pxx < ph.w && py >= 0 && py < ph.h) ? phM[py * ph.w + pxx] : 0;
        if (a && b) inter++; if (a || b) uni++;
      }
    }
    return uni ? inter / uni : 0;
  };
  let best = { sx: sx0, sy: sy0, tx: bv.x0 - bp.x0 * sx0, ty: bv.y0 - bp.y0 * sy0 };
  best.iou = iou(best.sx, best.sy, best.tx, best.ty);
  // descente par coordonnées, pas décroissants
  for (const pas of [0.04, 0.02, 0.01, 0.005]) {
    let mieux = true;
    while (mieux) {
      mieux = false;
      for (const [cle, delta] of [['sx', pas], ['sx', -pas], ['sy', pas], ['sy', -pas], ['tx', pas * W], ['tx', -pas * W], ['ty', pas * H], ['ty', -pas * H]]) {
        const c = Object.assign({}, best); c[cle] = cle[0] === 's' ? c[cle] * (1 + delta) : c[cle] + delta;
        const v = iou(c.sx, c.sy, c.tx, c.ty);
        if (v > best.iou + 1e-4) { c.iou = v; best = c; mieux = true; }
      }
    }
  }
  return best;
}

// ── La couleur (le même principe que pont.js : médiane du vêtement, gains bornés) ──
function medianeGroupe(px, guide){
  const med = (a) => { if (!a.length) return 0; a.sort((p, q) => p - q); return a[a.length >> 1]; };
  let c = guide;
  if (!c) { const R = [], G = [], B = []; for (let k = 0; k < px.length; k += 3) { R.push(px[k]); G.push(px[k + 1]); B.push(px[k + 2]); } c = [med(R), med(G), med(B)]; }
  for (const rayon of [90, 70, 55, 55]) {
    const R = [], G = [], B = [];
    for (let k = 0; k < px.length; k += 3) if (Math.hypot(px[k] - c[0], px[k + 1] - c[1], px[k + 2] - c[2]) <= rayon) { R.push(px[k]); G.push(px[k + 1]); B.push(px[k + 2]); }
    if (R.length < 60) break;
    c = [med(R), med(G), med(B)];
  }
  return c;
}
function pixelsMasque(im, m, pas){
  const o = [];
  for (let k = 0; k < im.w * im.h; k += (pas || 1)) if (m[k]) o.push(im.data[k * 4], im.data[k * 4 + 1], im.data[k * 4 + 2]);
  return o;
}
const gainsVers = (ref, c) => [0, 1, 2].map((k) => Math.max(0.7, Math.min(1.4, ref[k] / Math.max(1, c[k]))));
function appliquerGains(d, n, gains, centre){
  for (let k = 0; k < n; k++) {
    const i = k * 4;
    const t = centre ? Math.max(0, Math.min(1, 1 - (Math.hypot(d[i] - centre[0], d[i + 1] - centre[1], d[i + 2] - centre[2]) - 70) / 60)) : 1;
    if (!t) continue;
    for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, Math.round(d[i + c] * (1 + (gains[c] - 1) * t))));
  }
}
function lab(c){
  const f = (u) => { u /= 255; return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); };
  const r = f(c[0]), g = f(c[1]), b = f(c[2]);
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047, Y = r * 0.2126 + g * 0.7152 + b * 0.0722, Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const t = (u) => u > 0.008856 ? Math.cbrt(u) : 7.787 * u + 16 / 116;
  return [116 * t(Y) - 16, 500 * (t(X) - t(Y)), 200 * (t(Y) - t(Z))];
}
const deltaE = (a, b) => { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
// Lab RAPIDE (4 millions de texels) : la table sRGB → linéaire, et le retour Lab → sRGB.
const _LIN = new Float32Array(256);
for (let i = 0; i < 256; i++) { const u = i / 255; _LIN[i] = u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); }
function labRapide(r, g, b, o){
  const R = _LIN[r], G = _LIN[g], B = _LIN[b];
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const fx = X > 0.008856 ? Math.cbrt(X) : 7.787 * X + 16 / 116, fy = Y > 0.008856 ? Math.cbrt(Y) : 7.787 * Y + 16 / 116, fz = Z > 0.008856 ? Math.cbrt(Z) : 7.787 * Z + 16 / 116;
  o[0] = 116 * fy - 16; o[1] = 500 * (fx - fy); o[2] = 200 * (fy - fz);
}
function rgbDeLab(L, a, b, o){
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const inv = (t) => (t > 0.206893 ? t * t * t : (t - 16 / 116) / 7.787);
  const X = inv(fx) * 0.95047, Y = inv(fy), Z = inv(fz) * 1.08883;
  const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.2040 * Y + 1.0570 * Z];
  for (let c = 0; c < 3; c++) { const u = Math.max(0, lin[c]); o[c] = Math.max(0, Math.min(255, Math.round(255 * (u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055)))); }
}
/* La TEINTE d'un ensemble de pixels : le centre (médiane du groupe principal — les boutons, l'étiquette et le fond
   n'y pèsent pas), en Lab, et l'étendue de la luminance (écart interquartile) dans ce groupe. */
function statsTeinte(px){
  const c = medianeGroupe(px), C = lab(c), L = [], A = [], B = [], o = [0, 0, 0];
  for (let k = 0; k < px.length; k += 3) {
    labRapide(px[k] | 0, px[k + 1] | 0, px[k + 2] | 0, o);
    if (Math.hypot(o[0] - C[0], o[1] - C[1], o[2] - C[2]) > 30) continue;
    L.push(o[0]); A.push(o[1]); B.push(o[2]);
  }
  const q = (a, f) => { if (!a.length) return 0; a.sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(a.length * f))]; };
  const Lm = q(L, 0.5), iqr = Math.max(1, q(L, 0.75) - q(L, 0.25));
  return { rgb: c, lab: [Lm, q(A, 0.5), q(B, 0.5)], iqr, n: L.length };
}

/* LA CONFORMITÉ d'une vue : la silhouette rendue contre la photo recalée (IoU), et la couleur médiane du
   vêtement de part et d'autre (ΔE). */
function conformite(v, couleurs, ph, phM, cal){
  let inter = 0, uni = 0; const A = [], B = [];
  for (let y = 0; y < v.H; y++) for (let x = 0; x < v.W; x++) {
    const k = y * v.W + x, pxx = Math.floor((x - cal.tx) / cal.sx), py = Math.floor((y - cal.ty) / cal.sy);
    const dans = pxx >= 0 && pxx < ph.w && py >= 0 && py < ph.h && phM[py * ph.w + pxx];
    const a = v.masque[k];
    if (a && dans) { inter++; if ((x + y) % 3 === 0) { A.push(couleurs[k * 4], couleurs[k * 4 + 1], couleurs[k * 4 + 2]); const j = (py * ph.w + pxx) * 4; B.push(ph.data[j], ph.data[j + 1], ph.data[j + 2]); } }
    if (a || dans) uni++;
  }
  const ma = medianeGroupe(A), mb = medianeGroupe(B);
  return { iou: uni ? inter / uni : 0, ecartCouleur: Math.round(deltaE(ma, mb) * 10) / 10, rendu: ma.map(Math.round), photo: mb.map(Math.round) };
}

// Le motif : corrélation des niveaux de gris de la vue rendue et de la photo, dans l'intersection.
function correlation(v, couleurs, ph, cal){
  const A = [], B = [];
  for (let y = 0; y < v.H; y += 2) for (let x = 0; x < v.W; x += 2) {
    const k = y * v.W + x; if (!v.masque[k]) continue;
    const pxx = Math.floor((x - cal.tx) / cal.sx), py = Math.floor((y - cal.ty) / cal.sy);
    if (pxx < 0 || pxx >= ph.w || py < 0 || py >= ph.h) continue;
    const j = (py * ph.w + pxx) * 4;
    A.push(couleurs[k * 4] + couleurs[k * 4 + 1] + couleurs[k * 4 + 2]); B.push(ph.data[j] + ph.data[j + 1] + ph.data[j + 2]);
  }
  const n = A.length; if (n < 50) return 0;
  const ma = A.reduce((s, x) => s + x, 0) / n, mb = B.reduce((s, x) => s + x, 0) / n;
  let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < n; i++) { const a = A[i] - ma, b = B[i] - mb; sab += a * b; saa += a * a; sbb += b * b; }
  return sab / Math.sqrt(saa * sbb || 1);
}

/* ══ LES QUATRE TEMPS, chacun une étape de la barre de progression ══════════════════════════════════════════
   preparer → (4) détourage et recalage des photos ; projeterPhotos → (5) projection et raccord ;
   couleurFidele → (6) la teinte du devant sur tout le modèle ; controler → (8) la conformité.
   Un ÉTAT passe de l'un à l'autre (maillage, texture, vues, recalages) ; la texture est modifiée EN PLACE.
   maillage : { pos, nor, uv, idx } ; tex, devant, dos, normale : { w, h, data } (RVBA). */
function preparer(maillage, tex, devant, dos, options){
  const o = Object.assign({ hauteurVue: 900, seuilNV: 0.4, finNV: 0.75, erosion: 5, normale: null }, options || {});
  const { pos, idx } = maillage;
  if (!maillage.nor) maillage.nor = normales(pos, idx);
  // 1. LE SENS : l'axe le plus court de la boîte (x ou z) est la profondeur ; le devant, celui qui ressemble.
  let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (let i = 0; i < pos.length; i += 3) for (let c = 0; c < 3; c++) { if (pos[i + c] < mn[c]) mn[c] = pos[i + c]; if (pos[i + c] > mx[c]) mx[c] = pos[i + c]; }
  const axe = (mx[0] - mn[0]) < (mx[2] - mn[2]) ? 0 : 2;
  const mDev = masquePhoto(devant), mDos = masquePhoto(dos);
  // un détourage qui n'a rien isolé (photo vide, fond de la couleur du vêtement) ne recale rien : on le DIT
  for (const [nom, ph, mm] of [['devant', devant, mDev], ['dos', dos, mDos]]) {
    let n = 0; for (let k = 0; k < mm.m.length; k++) n += mm.m[k];
    const part = n / Math.max(1, ph.w * ph.h);
    if (ph.w < 64 || ph.h < 64 || part < 0.05 || part > 0.95) throw new Error('le vêtement n’a pas pu être isolé sur la photo du ' + nom + ' (' + Math.round(part * 100) + ' % de l’image)');
  }
  const essais = [1, -1].map((sg) => {
    const dir = [0, 0, 0]; dir[axe] = -sg;               // la caméra regarde VERS -sg : elle voit la face +sg
    const v = vue(maillage, dir, 400);
    const cal = recaler(v.masque, v.W, v.H, devant, mDev.m);
    const col = couleurVue(v, maillage, tex);
    return { sg, dir, iou: cal ? cal.iou : 0, motif: cal ? correlation(v, col, devant, cal) : -1 };
  });
  essais.sort((a, b) => (b.motif + b.iou) - (a.motif + a.iou));
  const dirDevant = essais[0].dir, dirDos = dirDevant.map((x) => -x);
  // 2. LES DEUX VUES, et le recalage de chaque photo
  const vues = [
    { nom: 'devant', v: vue(maillage, dirDevant, o.hauteurVue), ph: devant, pm: mDev },
    { nom: 'dos', v: vue(maillage, dirDos, o.hauteurVue), ph: dos, pm: mDos },
  ];
  const avant = {};
  for (const x of vues) {
    x.cal = recaler(x.v.masque, x.v.W, x.v.H, x.ph, x.pm.m);
    if (!x.cal) throw new Error('recalage impossible (' + x.nom + ')');
    const colAvant = couleurVue(x.v, maillage, tex);
    avant[x.nom] = conformite(x.v, colAvant, x.ph, x.pm.m, x.cal);
    x.motifAvant = correlation(x.v, colAvant, x.ph, x.cal);
    x.mErode = eroder(x.pm.m, x.ph.w, x.ph.h, o.erosion);
  }
  return { o, maillage, tex, devant, dos, mDev, mDos, vues, avant,
    sens: { axe: axe === 0 ? 'x' : 'z', devant: dirDevant.map((v) => -v), essais: essais.map((e) => ({ sg: e.sg, iou: +e.iou.toFixed(3), motif: +e.motif.toFixed(3) })) },
    recalage: { devant: vues[0].cal, dos: vues[1].cal } };
}

/* (5) LA PROJECTION. La photo du dos est d'abord ramenée sur la teinte de celle du devant (sinon le raccord dos/devant
   sur les côtés serait une marche) ; puis chaque texel qui fait face à une photo en prend les vrais pixels ; puis
   l'écart de ton est étalé sur le maillage (le raccord) ; les marges d'îlots et le relief suivent. */
function projeterPhotos(etat){
  const { o, maillage, tex, devant, dos, mDev, mDos, vues } = etat;
  const { pos, idx, uv, nor } = maillage;
  const ref = medianeGroupe(pixelsMasque(devant, mDev.m, 3));
  etat.ref = ref;
  const nTex = tex.w * tex.h;
  const cDos = medianeGroupe(pixelsMasque(dos, mDos.m, 3), ref);
  /* ⚠ ESSAYÉ ET ÉCARTÉ (2026-10-19) : la photo du dos laissée TELLE QUELLE (plus claire que le devant) faisait ressortir
     en ligne nette (creux de 9 à 14 L) la bande de la crête que la photo du dos ne couvre pas, peinte à la teinte du
     devant. Le dos reste donc ramené sur la teinte du devant — une seule teinte, sa demande du 2026-10-19. */
  const gDos0 = gainsVers(ref, cDos), gDos = gDos0;
  const dosC = { w: dos.w, h: dos.h, data: new Uint8ClampedArray(dos.data) };
  appliquerGains(dosC.data, dos.w * dos.h, gDos, cDos);
  vues[1].phC = dosC; vues[0].phC = devant;
  // 4. LA PROJECTION, texel par texel (triangles rastérisés en espace UV)
  const acc = new Float32Array(nTex * 4);   // r, v, b pondérés + poids
  const dansTri = new Uint8Array(nTex);      // les texels qu'un triangle utilise (le reste : les marges entre îlots)
  const texTri = new Int32Array(nTex).fill(-1), texB1 = new Float32Array(nTex), texB2 = new Float32Array(nTex);
  const wVue = [new Float32Array(nTex), new Float32Array(nTex)];   // le poids de CHAQUE photo (devant, dos), par texel
  const nvMax = new Float32Array(nTex);                              // l'orientation vers la photo qui le couvre (1 = de face)
  // les texels cachés de PEU (le dessous d'une crête sculptée) : la couleur de la photo à cet endroit, gardée à part
  const accO = new Float32Array(nTex * 4), vueO = new Uint8Array(nTex);
  const TW = tex.w, TH = tex.h;
  let couverts = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    const ax = uv[a * 2] * TW, ay = uv[a * 2 + 1] * TH, bx = uv[b * 2] * TW, by = uv[b * 2 + 1] * TH, cx = uv[c * 2] * TW, cy = uv[c * 2 + 1] * TH;
    const aire = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(aire) < 1e-9) continue;
    const mx0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), mx1 = Math.min(TW - 1, Math.ceil(Math.max(ax, bx, cx)));
    const my0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), my1 = Math.min(TH - 1, Math.ceil(Math.max(ay, by, cy)));
    for (let y = my0; y <= my1; y++) for (let x = mx0; x <= mx1; x++) {
      const qx = x + 0.5, qy = y + 0.5;
      const w1 = ((qx - ax) * (cy - ay) - (cx - ax) * (qy - ay)) / aire, w2 = ((bx - ax) * (qy - ay) - (qx - ax) * (by - ay)) / aire, w0 = 1 - w1 - w2;
      if (w0 < -0.02 || w1 < -0.02 || w2 < -0.02) continue;
      dansTri[y * TW + x] = 1;
      texTri[y * TW + x] = t; texB1[y * TW + x] = w1; texB2[y * TW + x] = w2;
      const P = [0, 1, 2].map((k) => w0 * pos[a * 3 + k] + w1 * pos[b * 3 + k] + w2 * pos[c * 3 + k]);
      const N = unit([0, 1, 2].map((k) => w0 * nor[a * 3 + k] + w1 * nor[b * 3 + k] + w2 * nor[c * 3 + k]));
      const k4 = (y * TW + x) * 4;
      for (const vu of vues) {
        const nv = -scal(N, vu.v.d);
        if (nv <= o.seuilNV) continue;
        const [X, Y, Z] = vu.v.projeter(P);
        const xi = Math.floor(X), yi = Math.floor(Y);
        if (xi < 0 || yi < 0 || xi >= vu.v.W || yi >= vu.v.H) continue;
        const cache = Z > vu.v.prof[yi * vu.v.W + xi] + vu.v.tolerance;
        // caché par une autre surface — mais de PEU (une crête, un repli sculpté par The New Black) : voir accO
        if (cache && Z > vu.v.prof[yi * vu.v.W + xi] + vu.v.tolerance * 4) continue;
        const pxx = (X - vu.cal.tx) / vu.cal.sx, py = (Y - vu.cal.ty) / vu.cal.sy;
        const pi = Math.floor(py) * vu.ph.w + Math.floor(pxx);
        if (pxx < 0 || py < 0 || pxx >= vu.ph.w || py >= vu.ph.h || !vu.mErode[pi]) continue;
        const col = echantillon(vu.phC, pxx, py), wgt = lisse((nv - o.seuilNV) / (o.finNV - o.seuilNV));
        if (cache) { accO[k4] += col[0] * wgt; accO[k4 + 1] += col[1] * wgt; accO[k4 + 2] += col[2] * wgt; accO[k4 + 3] += wgt; vueO[y * TW + x] = vu === vues[0] ? 1 : 2; continue; }
        acc[k4] += col[0] * wgt; acc[k4 + 1] += col[1] * wgt; acc[k4 + 2] += col[2] * wgt; acc[k4 + 3] += wgt;
        wVue[vu === vues[0] ? 0 : 1][y * TW + x] += wgt;
        if (nv > nvMax[y * TW + x]) nvMax[y * TW + x] = nv;
      }
    }
  }
  /* ⚠⚠ LA LIGNE POINTILLÉE DU HAUT DU DOS (2026-10-19, sa capture images\97.png). The New Black avait sculpté un
     empiècement : une CRÊTE. Le dessous de la crête est caché de l'appareil de quelques millimètres — la photo ne le
     couvrait donc pas, et la texture de The New Black (sa couture peinte, sombre) y restait : vue de la boutique,
     d'un peu plus haut, une ligne pointillée en travers du dos, absente de la photo. Ces texels cachés de PEU (moins de
     quatre fois la tolérance de profondeur) prennent maintenant la couleur de la photo à l'endroit où ils se
     projettent — celle du tissu juste au-dessus, qui est la vraie. */
  for (let k = 0; k < nTex; k++) {
    const wo = accO[k * 4 + 3]; if (!wo) continue;
    const w = acc[k * 4 + 3]; if (w >= 1) continue;
    const f = Math.min(1, wo) * (1 - w) / wo;
    for (let c = 0; c < 3; c++) acc[k * 4 + c] += accO[k * 4 + c] * f;
    acc[k * 4 + 3] += wo * f;
    wVue[vueO[k] === 1 ? 0 : 1][k] += wo * f;
  }
  /* ⚠⚠ UNE SEULE TEINTE, CELLE DE LA PHOTO PRINCIPALE (2026-10-19, sa plainte : « la couleur du devant et du derrière
     n'est pas pareille dans l'aperçu 3D » ; mesuré sur la Walla en ligne, aux réglages de la boutique : face 118,86,61,
     dos 117,86,60, mais CÔTÉS 155,124,101 — en tournant, le vêtement changeait de teinte). Le raccord ci-dessous ne
     corrigeait que le VOISINAGE des photos, et s'éteignait au loin : les côtés et les manches gardaient la teinte
     inventée par The New Black.
     ➡ Ici, AVANT le raccord, TOUTE la texture de The New Black est ramenée sur la teinte de la photo du devant, telle
     que projetée dans cette même texture (même éclairage au rendu) : correspondance en Lab — la luminance centrée et
     mise à l'échelle (son étendue, donc les plis et le relief peint, garde ses proportions), la chrominance décalée
     sur celle de la photo. Ce qui est loin de la teinte du tissu (boutons, étiquette) est épargné en fondu. */
  etat.appariement = apparierTeinte(tex, acc, wVue[0], dansTri, maillage, texTri, texB1, texB2);
  etat.texTri = texTri; etat.texB1 = texB1; etat.texB2 = texB2;
  etat.wTex = new Float32Array(nTex);
  for (let k = 0; k < nTex; k++) etat.wTex[k] = Math.min(1, acc[k * 4 + 3]);
  /* LE RACCORD : L'ÉCART DE TON, ÉTALÉ SUR LE MAILLAGE (essai Walla : sans lui, le dos projeté et l'épaule de The New
     Black se rejoignaient sur une ligne nette — qui suivait justement l'empiècement inventé). Sous la photo, on mesure
     l'écart photo − texture d'origine, par SOMMET ; puis on l'étale aux sommets voisins (lissage de Laplace, sommets
     soudés par position pour franchir les coutures d'UV) ; enfin chaque texel de la texture d'origine reçoit cet
     écart interpolé. Les côtés gardent LEUR détail (plis, coutures) mais prennent le TON de la photo voisine ;
     la photo, elle, garde ses vrais pixels. */
  const nV = pos.length / 3;
  const ecart = new Float32Array(nV * 3), poidsV = new Float32Array(nV);
  for (let k = 0; k < nTex; k++) {
    const w = acc[k * 4 + 3]; if (w < 0.5 || texTri[k] < 0) continue;
    const t = texTri[k], b1 = texB1[k], b2 = texB2[k], bs = [1 - b1 - b2, b1, b2];
    for (let j = 0; j < 3; j++) {
      const v = idx[t + j], f = bs[j]; if (f <= 0) continue;
      for (let c = 0; c < 3; c++) ecart[v * 3 + c] += f * (acc[k * 4 + c] / w - tex.data[k * 4 + c]);
      poidsV[v] += f;
    }
  }
  // soudure par position, puis voisinage
  const cle = new Map(), rep = new Int32Array(nV);
  for (let v = 0; v < nV; v++) {
    const q = Math.round(pos[v * 3] * 2000) + ',' + Math.round(pos[v * 3 + 1] * 2000) + ',' + Math.round(pos[v * 3 + 2] * 2000);
    if (!cle.has(q)) cle.set(q, v); rep[v] = cle.get(q);
  }
  const D = new Float32Array(nV * 3), fixe = new Uint8Array(nV), P0 = new Float32Array(nV);
  for (let v = 0; v < nV; v++) { const r0 = rep[v]; for (let c = 0; c < 3; c++) D[r0 * 3 + c] += ecart[v * 3 + c]; P0[r0] += poidsV[v]; }
  for (let v = 0; v < nV; v++) if (rep[v] === v && P0[v] > 0.3) { for (let c = 0; c < 3; c++) D[v * 3 + c] /= P0[v]; fixe[v] = 1; } else if (rep[v] === v) { D[v * 3] = D[v * 3 + 1] = D[v * 3 + 2] = 0; }
  const voisins = new Map();
  const lier = (a, b) => { a = rep[a]; b = rep[b]; if (a === b) return; if (!voisins.has(a)) voisins.set(a, new Set()); if (!voisins.has(b)) voisins.set(b, new Set()); voisins.get(a).add(b); voisins.get(b).add(a); };
  for (let t = 0; t < idx.length; t += 3) { lier(idx[t], idx[t + 1]); lier(idx[t + 1], idx[t + 2]); lier(idx[t + 2], idx[t]); }
  const libres = []; voisins.forEach((_, v) => { if (!fixe[v]) libres.push(v); });
  // la COUVERTURE de chaque photo, par sommet soudé (0 à 1) : ce que l'aplanissement du relief lira ensuite
  const cVue = [new Float32Array(nV), new Float32Array(nV)], cN = new Float32Array(nV);
  for (let k = 0; k < nTex; k++) {
    if (texTri[k] < 0) continue;
    const t = texTri[k], b1 = texB1[k], b2 = texB2[k], bs = [1 - b1 - b2, b1, b2];
    for (let j = 0; j < 3; j++) { const r0 = rep[idx[t + j]], f = bs[j]; if (f <= 0) continue; cVue[0][r0] += f * Math.min(1, wVue[0][k]); cVue[1][r0] += f * Math.min(1, wVue[1][k]); cN[r0] += f; }
  }
  for (let v = 0; v < nV; v++) if (cN[v] > 0) { cVue[0][v] /= cN[v]; cVue[1][v] /= cN[v]; }
  etat.geo = { rep, voisins, cVue };
  for (let it = 0; it < 80; it++) {
    for (const v of libres) {
      const nb = voisins.get(v); let r = 0, g = 0, b = 0, n = 0;
      nb.forEach((u) => { r += D[u * 3]; g += D[u * 3 + 1]; b += D[u * 3 + 2]; n++; });
      if (n) { D[v * 3] = r / n * 0.985; D[v * 3 + 1] = g / n * 0.985; D[v * 3 + 2] = b / n * 0.985; }   // s'éteint au loin
    }
  }
  const DD = (v, c) => D[rep[v] * 3 + c];
  /* ⚠ LE DESSIN INVENTÉ DANS LE FONDU (essai Walla : l'empiècement du dos restait visible en clair) : là où la photo
     n'est qu'en partie (le haut du dos, qui penche), la texture de The New Black transparaissait — avec SES coutures
     peintes. On y prend donc sa version FLOUE (moyenne 13 × 13, îlot par îlot) : son ton reste, son dessin s'efface. */
  const flou = new Float32Array(nTex * 3);
  {
    const R = 6, tmp = new Float32Array(nTex * 4);
    for (let y = 0; y < TH; y++) {   // horizontal, sur les seuls texels d'un triangle
      let sr = 0, sg = 0, sb = 0, n = 0;
      const ajouter = (x, sg2) => { if (x < 0 || x >= TW) return; const k = y * TW + x; if (!dansTri[k]) return; sr += sg2 * tex.data[k * 4]; sg += sg2 * tex.data[k * 4 + 1]; sb += sg2 * tex.data[k * 4 + 2]; n += sg2; };
      for (let x = -R; x < R; x++) ajouter(x, 1);
      for (let x = 0; x < TW; x++) {
        ajouter(x + R, 1);
        const k = y * TW + x; tmp[k * 4] = sr; tmp[k * 4 + 1] = sg; tmp[k * 4 + 2] = sb; tmp[k * 4 + 3] = n;
        ajouter(x - R, -1);
      }
    }
    for (let x = 0; x < TW; x++) {   // vertical
      let sr = 0, sg = 0, sb = 0, n = 0;
      const ajouter = (y, sg2) => { if (y < 0 || y >= TH) return; const k = y * TW + x; sr += sg2 * tmp[k * 4]; sg += sg2 * tmp[k * 4 + 1]; sb += sg2 * tmp[k * 4 + 2]; n += sg2 * tmp[k * 4 + 3]; };
      for (let y = -R; y < R; y++) ajouter(y, 1);
      for (let y = 0; y < TH; y++) {
        ajouter(y + R, 1);
        const k = y * TW + x;
        if (n > 0) { flou[k * 3] = sr / n; flou[k * 3 + 1] = sg / n; flou[k * 3 + 2] = sb / n; }
        else { flou[k * 3] = tex.data[k * 4]; flou[k * 3 + 1] = tex.data[k * 4 + 1]; flou[k * 3 + 2] = tex.data[k * 4 + 2]; }
        ajouter(y - R, -1);
      }
    }
  }
  for (let k = 0; k < nTex; k++) {
    if (texTri[k] < 0) continue;
    const t = texTri[k], b1 = texB1[k], b2 = texB2[k], b0 = 1 - b1 - b2, i = k * 4;
    const af = Math.min(1, acc[i + 3] * 2.5);   // la part du flou : pleine dès 40 % de photo
    const base = [0, 1, 2].map((c) => tex.data[i + c] * (1 - af) + flou[k * 3 + c] * af + b0 * DD(idx[t], c) + b1 * DD(idx[t + 1], c) + b2 * DD(idx[t + 2], c));
    const w = acc[i + 3], f = Math.min(1, w);
    if (w) couverts++;
    for (let c = 0; c < 3; c++) tex.data[i + c] = Math.max(0, Math.min(255, Math.round(base[c] * (1 - f) + (w ? acc[i + c] / w : 0) * f)));
  }
  // seuls les texels du bord À DEMI couverts sont repeints : un bord pleinement photo, ou sans photo du tout, reste
  // (un petit îlot ne disparaît pas tout entier)
  const interieur = interieurIlots(dansTri, TW, TH, 2);
  for (let k = 0; k < nTex; k++) { if (!dansTri[k] || interieur[k]) continue; const w = acc[k * 4 + 3]; if (w >= 0.95 || w === 0) interieur[k] = 1; }
  remplirMarges(tex, interieur);
  /* ⚠ LA LUMIÈRE DES PHOTOS, SUR LES FLANCS (essai Walla, mesuré au rendu) : une photo de face, prise sous une lampe
     de côté, a un bord ÉCLAIRÉ et un bord dans l'OMBRE. Projetés en biais sur les flancs, ces bords donnaient, une fois
     le vêtement tourné, un flanc clair (+15 ΔE) et l'autre sombre (−11). Et le raccord, qui étale l'écart photo −
     texture, emportait cette ombre plus loin encore. ➡ Une dernière passe ramène la teinte LOCALE (basse fréquence,
     sur le maillage) à celle de la photo de face : pleinement là où aucune photo ne regarde de face, en fondu sous une
     photo vue de biais, PAS DU TOUT là où la photo regarde le tissu de face (ses vrais pixels, ses vraies ombres).
     Le détail (grain, plis, coutures) n'est jamais touché : on ne déplace que la basse fréquence. */
  if (etat.appariement && etat.appariement.applique) {
    const Rl = lab(etat.appariement.reference), { G, rep: rp } = champBasse(tex, maillage, texTri, texB1, texB2), o = [0, 0, 0], q = [0, 0, 0];
    for (let k = 0; k < nTex; k++) {
      const t = texTri[k]; if (t < 0) continue;
      const w = acc[k * 4 + 3], st = w > 0 ? 1 - lisse((nvMax[k] - 0.75) / 0.2) : 1;
      if (st <= 0.01) continue;
      const b1 = texB1[k], b2 = texB2[k], b0 = 1 - b1 - b2, va = rp[idx[t]], vb = rp[idx[t + 1]], vc = rp[idx[t + 2]];
      const B = [0, 1, 2].map((c) => b0 * G[va * 3 + c] + b1 * G[vb * 3 + c] + b2 * G[vc * 3 + c]);
      const e = Math.hypot((B[0] - Rl[0]) * 0.3, B[1] - Rl[1], B[2] - Rl[2]);
      const tt = e <= 16 ? 1 : (e >= 30 ? 0 : 1 - (e - 16) / 14);
      if (!tt) continue;
      const f = st * tt, i = k * 4;
      labRapide(tex.data[i], tex.data[i + 1], tex.data[i + 2], o);
      rgbDeLab(o[0] + (Rl[0] - B[0]) * f, o[1] + (Rl[1] - B[1]) * f, o[2] + (Rl[2] - B[2]) * f, q);
      tex.data[i] = q[0]; tex.data[i + 1] = q[1]; tex.data[i + 2] = q[2];
    }
    remplirMarges(tex, interieur);
  }
  etat.dansTri = interieur;
  /* LE RELIEF INVENTÉ S'EFFACE LÀ OÙ LA PHOTO PARLE : la carte de normales de The New Black porte SES coutures (un
     empiècement au dos que le vrai vêtement n'a pas) ; sous la photo projetée, elle est aplanie au prorata du poids
     — sinon on voyait deux coutures, la vraie (photo) et l'inventée (relief). Les côtés gardent leur relief. */
  if (o.normale) {
    const nm = o.normale;
    for (let y = 0; y < nm.h; y++) for (let x = 0; x < nm.w; x++) {
      /* (2026-10-19, sa plainte : « au dos, le relief inventé domine encore ») : EFFACÉE, plus atténuée — pleinement dès
         60 % de photo, en fondu vers les côtés. Seules les coutures PEINTES de la photo doivent se lire. */
      const k = ((Math.floor(y * TH / nm.h)) * TW + Math.floor(x * TW / nm.w)) * 4, w = lisse(Math.min(1, acc[k + 3]) / 0.6);
      if (!w) continue;
      const i = (y * nm.w + x) * 4;
      nm.data[i] = nm.data[i] * (1 - w) + 128 * w; nm.data[i + 1] = nm.data[i + 1] * (1 - w) + 128 * w; nm.data[i + 2] = nm.data[i + 2] * (1 - w) + 255 * w;
    }
  }
  etat.couverture = Math.round(couverts / nTex * 1000) / 10;
  etat.couleurDos = { dos: cDos, gains: gDos.map((g) => +g.toFixed(3)), gainsNonAppliques: gDos0.map((g) => +g.toFixed(3)) };
  return { couverture: etat.couverture, gainsDos: etat.couleurDos.gains };
}

/* LES MARGES ENTRE ÎLOTS (gutters) prennent la couleur du bord le plus proche : sans cela, le filtrage de la texture
   mêlait au bord des îlots la couleur d'AVANT, et des lignes claires quadrillaient le modèle. ⚠ À REFAIRE APRÈS
   CHAQUE RETOUCHE des texels (la passe des flancs, les corrections mesurées au rendu) — vu sur la Walla : sans cela,
   les frontières d'îlots ressortaient en lignes claires sur les flancs. */
/* ⚠ LE BORD DES ÎLOTS EST REPEINT AUSSI (2026-10-19, la ligne fine en travers du haut du dos, rendu non éclairé — la
   carte de couverture l'a montrée : le long de chaque coupure d'îlot de The New Black, une bande de deux texels à demi
   couverts par la photo, où la texture d'origine transparaissait). Les deux texels du bord de chaque îlot sont donc
   traités comme la marge : repeints depuis l'intérieur, qui est la vraie photo. Rendu : le masque « intérieur ». */
function interieurIlots(dansTri, TW, TH, r){
  let m = new Uint8Array(dansTri);
  for (let p = 0; p < (r || 2); p++) {
    const n = new Uint8Array(m);
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const k = y * TW + x; if (!m[k]) continue;
      if (x === 0 || y === 0 || x === TW - 1 || y === TH - 1 || !m[k - 1] || !m[k + 1] || !m[k - TW] || !m[k + TW]) n[k] = 0;
    }
    m = n;
  }
  return m;
}
function remplirMarges(tex, dansTri){
  /* ⚠ PAR FRONTS, ET LOIN (2026-10-19, la ligne fine en travers du haut du dos, vue au rendu non éclairé) : six pixels de
     marge ne suffisaient pas. Un modèle vu de loin est lu dans des niveaux réduits de la texture (mipmaps) où chaque
     texel en moyenne 4, 16, 64 : la couleur d'avant, restée à sept pixels d'un îlot, remontait le long de ses bords — une
     ligne là où The New Black avait coupé ses îlots (l'empiècement). On propage donc la couleur du bord le plus proche
     jusqu'à 48 pixels, front après front (chaque passe ne visite que la nouvelle bordure). */
  const TW = tex.w, TH = tex.h, d = tex.data;
  const fait = new Uint8Array(dansTri);
  let front = [];
  for (let k = 0; k < TW * TH; k++) {
    if (fait[k]) continue;
    const x = k % TW, y = (k - x) / TW;
    if ((x > 0 && fait[k - 1]) || (x < TW - 1 && fait[k + 1]) || (y > 0 && fait[k - TW]) || (y < TH - 1 && fait[k + TW])) front.push(k);
  }
  for (let passe = 0; passe < 48 && front.length; passe++) {
    const neufs = [];
    for (const k of front) {
      if (fait[k]) continue;
      const x = k % TW, y = (k - x) / TW;
      let r = 0, g = 0, b = 0, n = 0;
      if (x > 0 && fait[k - 1]) { r += d[(k - 1) * 4]; g += d[(k - 1) * 4 + 1]; b += d[(k - 1) * 4 + 2]; n++; }
      if (x < TW - 1 && fait[k + 1]) { r += d[(k + 1) * 4]; g += d[(k + 1) * 4 + 1]; b += d[(k + 1) * 4 + 2]; n++; }
      if (y > 0 && fait[k - TW]) { r += d[(k - TW) * 4]; g += d[(k - TW) * 4 + 1]; b += d[(k - TW) * 4 + 2]; n++; }
      if (y < TH - 1 && fait[k + TW]) { r += d[(k + TW) * 4]; g += d[(k + TW) * 4 + 1]; b += d[(k + TW) * 4 + 2]; n++; }
      if (n) neufs.push(k, r / n, g / n, b / n);
    }
    const suivant = [];
    for (let i = 0; i < neufs.length; i += 4) {
      const k = neufs[i]; if (fait[k]) continue;
      d[k * 4] = neufs[i + 1]; d[k * 4 + 1] = neufs[i + 2]; d[k * 4 + 2] = neufs[i + 3]; fait[k] = 1;
      const x = k % TW, y = (k - x) / TW;
      if (x > 0 && !fait[k - 1]) suivant.push(k - 1); if (x < TW - 1 && !fait[k + 1]) suivant.push(k + 1);
      if (y > 0 && !fait[k - TW]) suivant.push(k - TW); if (y < TH - 1 && !fait[k + TW]) suivant.push(k + TW);
    }
    front = suivant;
  }
}

/* LA TEINTE LOCALE (basse fréquence) de la texture, portée par les SOMMETS soudés et lissée de voisin en voisin :
   rend G (Lab par sommet soudé) et rep (le sommet soudé de chaque sommet). */
function champBasse(tex, maillage, texTri, texB1, texB2){
  /* ⚠ LE FLOU SUR LE MAILLAGE, PAS DANS LA TEXTURE (essai Walla, première version) : flouté dans l'image, un texel
     au bord d'un îlot d'UV se moyennait avec l'îlot VOISIN DANS L'IMAGE — sans rapport sur le vêtement — et chaque
     frontière d'îlot devenait une ligne sombre au rendu (un quadrillage sur le dos). Ici, la teinte locale est
     portée par les SOMMETS (soudés par position : une couture d'UV n'existe pas pour eux), lissée de voisin en
     voisin, puis interpolée dans chaque triangle : continue partout. */
  const { pos, idx } = maillage, nV = pos.length / 3, nTex = tex.w * tex.h, d = tex.data, o = [0, 0, 0];
  const cle = new Map(), rep = new Int32Array(nV);
  for (let v = 0; v < nV; v++) {
    const k = Math.round(pos[v * 3] * 2000) + ',' + Math.round(pos[v * 3 + 1] * 2000) + ',' + Math.round(pos[v * 3 + 2] * 2000);
    if (!cle.has(k)) cle.set(k, v); rep[v] = cle.get(k);
  }
  const F = new Float32Array(nV * 3), P = new Float32Array(nV);
  for (let k = 0; k < nTex; k++) {
    const t = texTri[k]; if (t < 0) continue;
    labRapide(d[k * 4], d[k * 4 + 1], d[k * 4 + 2], o);
    const b1 = texB1[k], b2 = texB2[k], bs = [1 - b1 - b2, b1, b2];
    for (let j = 0; j < 3; j++) { const v = rep[idx[t + j]], f = bs[j]; if (f <= 0) continue; F[v * 3] += f * o[0]; F[v * 3 + 1] += f * o[1]; F[v * 3 + 2] += f * o[2]; P[v] += f; }
  }
  const actifs = [];
  for (let v = 0; v < nV; v++) if (rep[v] === v) { if (P[v] > 0) { F[v * 3] /= P[v]; F[v * 3 + 1] /= P[v]; F[v * 3 + 2] /= P[v]; } actifs.push(v); }
  const vois = new Map();
  const lier = (a, b) => { a = rep[a]; b = rep[b]; if (a === b) return; if (!vois.has(a)) vois.set(a, new Set()); if (!vois.has(b)) vois.set(b, new Set()); vois.get(a).add(b); vois.get(b).add(a); };
  for (let t = 0; t < idx.length; t += 3) { lier(idx[t], idx[t + 1]); lier(idx[t + 1], idx[t + 2]); lier(idx[t + 2], idx[t]); }
  const nb = actifs.map((v) => Int32Array.from(vois.get(v) || []));
  // un sommet sans texel (P = 0) prend la moyenne de ses voisins dès la première passe
  let G = F, H2 = new Float32Array(nV * 3);
  const PASSES = 160;
  for (let it = 0; it < PASSES; it++) {
    for (let i = 0; i < actifs.length; i++) {
      const v = actifs[i], n = nb[i]; let r = G[v * 3], g = G[v * 3 + 1], b = G[v * 3 + 2], c = 1;
      if (!P[v] && it === 0) { r = g = b = 0; c = 0; }
      for (let j = 0; j < n.length; j++) { const u = n[j]; if (!P[u] && it === 0) continue; r += G[u * 3]; g += G[u * 3 + 1]; b += G[u * 3 + 2]; c++; }
      if (c) { H2[v * 3] = r / c; H2[v * 3 + 1] = g / c; H2[v * 3 + 2] = b / c; } else { H2[v * 3] = G[v * 3]; H2[v * 3 + 1] = G[v * 3 + 1]; H2[v * 3 + 2] = G[v * 3 + 2]; }
    }
    const tmp = G === F ? new Float32Array(nV * 3) : G; G = H2; H2 = tmp;
  }
  return { G, rep };
}

/* L'APPARIEMENT DE LA TEINTE : la référence = les texels que la photo du DEVANT couvre (sa vraie couleur, dans la
   texture) ; la source = les texels que AUCUNE photo ne couvre (ce qu'a peint The New Black).
   ⚠⚠ CE N'EST PAS UNE AFFAIRE DE TEINTE MOYENNE (mesuré sur la Walla) : la médiane de la texture de The New Black
   (123,92,66) est déjà proche de la photo (123,94,73) — et pourtant les côtés sortaient à 171,142,120 au rendu. The
   New Black PEINT LA LUMIÈRE dans sa texture : des flancs éclairés, un dos dans l'ombre. Un décalage global ne
   l'enlève pas. On sépare donc, en Lab, la BASSE fréquence (la lumière peinte, la teinte locale : un flou large,
   îlot par îlot) de la HAUTE (le grain, les plis, les coutures) ; la basse est remplacée par la teinte de la photo,
   la haute est gardée. Une grande zone d'une autre couleur (col contrasté, doublure) est épargnée en fondu. */
function apparierTeinte(tex, acc, wDevant, dansTri, maillage, texTri, texB1, texB2){
  const nTex = tex.w * tex.h, refPx = [], tnbPx = [];
  for (let k = 0; k < nTex; k += 3) {
    if (!dansTri[k]) continue;
    const w = acc[k * 4 + 3];
    if (wDevant[k] >= 0.8 && w > 0) refPx.push(acc[k * 4] / w, acc[k * 4 + 1] / w, acc[k * 4 + 2] / w);
    else if (w === 0) tnbPx.push(tex.data[k * 4], tex.data[k * 4 + 1], tex.data[k * 4 + 2]);
  }
  if (refPx.length < 3000 || tnbPx.length < 3000) return { applique: false, raison: 'trop peu de texels (' + refPx.length / 3 + ' / ' + tnbPx.length / 3 + ')' };
  const R = statsTeinte(refPx), S = statsTeinte(tnbPx);
  const d = tex.data, o = [0, 0, 0], q = [0, 0, 0];
  const { G, rep } = champBasse(tex, maillage, texTri, texB1, texB2), idx = maillage.idx;
  for (let k = 0; k < nTex; k++) {
    const t = texTri[k]; if (t < 0) continue;
    const b1 = texB1[k], b2 = texB2[k], b0 = 1 - b1 - b2, va = rep[idx[t]], vb = rep[idx[t + 1]], vc = rep[idx[t + 2]];
    const B0 = b0 * G[va * 3] + b1 * G[vb * 3] + b2 * G[vc * 3], B1 = b0 * G[va * 3 + 1] + b1 * G[vb * 3 + 1] + b2 * G[vc * 3 + 1], B2 = b0 * G[va * 3 + 2] + b1 * G[vb * 3 + 2] + b2 * G[vc * 3 + 2];
    /* une grande zone d'une AUTRE COULEUR que le tissu (col contrasté, doublure) : épargnée, en fondu. ⚠ Jugée surtout
       sur la CHROMINANCE : la lumière peinte assombrit ou éclaircit un flanc (la luminance) sans changer sa teinte —
       à pleine distance Lab, les flancs les plus « éclairés » étaient justement ceux qu'on épargnait (essai Walla). */
    const e = Math.hypot((B0 - S.lab[0]) * 0.3, B1 - S.lab[1], B2 - S.lab[2]);
    const tt = e <= 16 ? 1 : (e >= 30 ? 0 : 1 - (e - 16) / 14);
    if (!tt) continue;
    labRapide(d[k * 4], d[k * 4 + 1], d[k * 4 + 2], o);
    /* le détail GARDÉ, mais ADOUCI : The New Black peint aussi des REFLETS (un satin brillant sur un suède mat — essai
       Walla, vu au rendu) ; à pleine amplitude ils faisaient luire les flancs. Le grain et les coutures restent lisibles. */
    const dl = Math.max(-14, Math.min(14, (o[0] - B0) * 0.5)), da = Math.max(-6, Math.min(6, (o[1] - B1) * 0.3)), db = Math.max(-6, Math.min(6, (o[2] - B2) * 0.3));
    rgbDeLab(o[0] + (R.lab[0] + dl - o[0]) * tt, o[1] + (R.lab[1] + da - o[1]) * tt, o[2] + (R.lab[2] + db - o[2]) * tt, q);
    d[k * 4] = q[0]; d[k * 4 + 1] = q[1]; d[k * 4 + 2] = q[2];
  }
  const apres = []; for (let k = 0; k < nTex; k += 3) { if (dansTri[k] && acc[k * 4 + 3] === 0) apres.push(d[k * 4], d[k * 4 + 1], d[k * 4 + 2]); }
  const A = statsTeinte(apres);
  const de = (x, y) => +Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]).toFixed(1);
  return { applique: true, reference: R.rgb.map(Math.round), tnbAvant: S.rgb.map(Math.round), tnbApres: A.rgb.map(Math.round),
    passes: 160, ecartAvant: de(S.lab, R.lab), ecartApres: de(A.lab, R.lab) };
}

/* (5 bis) LE RELIEF INVENTÉ, EFFACÉ SOUS LA PHOTO (2026-10-18, sa demande : « effacer le relief inventé par TNB — ex.
   l'empiècement horizontal du dos de la Walla — sous la zone couverte par la photo ; aplanir la géométrie localement
   vers une surface lisse, sans toucher la silhouette »).
   ⚠ LE MOUVEMENT SE FAIT DANS LA PROFONDEUR SEULEMENT (l'axe de la caméra de la photo) : un sommet ne bouge ni à
   gauche ni à droite ni en hauteur — la silhouette vue de face ou de dos ne change donc pas d'un pixel.
   ⚠ LISSAGE DE TAUBIN (λ puis μ) : un lissage de Laplace simple « dégonfle » la surface ; l'alternance λ/μ garde le
   volume et n'efface que les petits creux (coutures, plis fins inventés).
   ⚠ PONDÉRÉ : par la couverture de la photo (rien ne bouge là où la photo n'est pas projetée) et par l'orientation
   (un sommet presque de profil — le bord de la silhouette — ne bouge pas) ; les bords de zone sont fondus.
   Le RELIEF se mesure avant/après : l'écart de chaque sommet au plan de ses voisins, dans la profondeur, en
   millièmes de la hauteur du vêtement (moyenne et 95ᵉ centile). */
function mesurerRelief(etat){
  const { maillage, vues, geo } = etat, { pos } = maillage, H = etat.hauteurModele || 1, d = [vues[0].v.d, vues[1].v.d];
  const e = [];
  geo.voisins.forEach((nb, v) => {
    const k = geo.cVue[0][v] >= geo.cVue[1][v] ? 0 : 1; if (geo.cVue[k][v] < 0.6) return;
    let mx = 0, my = 0, mz = 0, n = 0; nb.forEach((u) => { mx += pos[u * 3]; my += pos[u * 3 + 1]; mz += pos[u * 3 + 2]; n++; });
    if (!n) return;
    const dx = pos[v * 3] - mx / n, dy = pos[v * 3 + 1] - my / n, dz = pos[v * 3 + 2] - mz / n;
    e.push(Math.abs(dx * d[k][0] + dy * d[k][1] + dz * d[k][2]) / H * 1000);
  });
  if (!e.length) return { moyenne: 0, p95: 0, sommets: 0 };
  e.sort((a, b) => a - b);
  return { moyenne: +(e.reduce((s2, x) => s2 + x, 0) / e.length).toFixed(3), p95: +e[Math.floor(e.length * 0.95)].toFixed(3), sommets: e.length };
}
function aplanirRelief(etat, options){
  const o = Object.assign({ iterations: 6, lambda: 0.55, mu: -0.58 }, options || {});
  const { maillage, vues, geo } = etat, { pos, idx } = maillage, nor = maillage.nor, d = [vues[0].v.d, vues[1].v.d];
  let y0 = 1e9, y1 = -1e9; for (let i = 1; i < pos.length; i += 3) { if (pos[i] < y0) y0 = pos[i]; if (pos[i] > y1) y1 = pos[i]; }
  etat.hauteurModele = y1 - y0;
  const avant = mesurerRelief(etat);
  // le poids de chaque sommet soudé : couverture × orientation, puis fondu sur deux voisinages
  const nV = pos.length / 3, poids = new Float32Array(nV), axe = new Uint8Array(nV);
  geo.voisins.forEach((_, v) => {
    const k = geo.cVue[0][v] >= geo.cVue[1][v] ? 0 : 1; axe[v] = k;
    // FACE à la caméra (signe compris) : une doublure, un revers vu de l'intérieur, regarde ailleurs — elle ne bouge pas
    const nv = -(nor[v * 3] * d[k][0] + nor[v * 3 + 1] * d[k][1] + nor[v * 3 + 2] * d[k][2]);
    poids[v] = lisse((geo.cVue[k][v] - 0.3) / 0.5) * lisse((nv - 0.35) / 0.35);
  });
  for (let p = 0; p < 2; p++) {
    const neuf = new Float32Array(poids);
    geo.voisins.forEach((nb, v) => { let s2 = poids[v], n = 1; nb.forEach((u) => { s2 += poids[u]; n++; }); neuf[v] = Math.min(poids[v], s2 / n); });
    poids.set(neuf);
  }
  /* ⚠ LA CONTREMARCHE D'UNE CRÊTE (2026-10-19, la ligne du haut du dos, rendu non éclairé) : les sommets de la face
     verticale d'une marche sculptée ne regardent pas l'appareil — leur poids était nul, ils restaient en place, et la
     marche survivait à l'aplanissement. Le poids est donc ÉTENDU de trois anneaux de voisinage (décroissant) : la
     contremarche suit les deux paliers qu'elle relie, et la marche s'efface. */
  const poidsFace = new Float32Array(poids);
  for (let p = 0; p < 3; p++) {
    const neuf = new Float32Array(poids);
    geo.voisins.forEach((nb, v) => { let m = poids[v]; nb.forEach((u) => { if (poids[u] * 0.85 > m) m = poids[u] * 0.85; }); neuf[v] = m; });
    poids.set(neuf);
  }
  const actifs = []; geo.voisins.forEach((_, v) => { if (poids[v] > 0.01) actifs.push(v); });
  /* ⚠ UN LISSAGE DE VOISINAGE NE SUFFIT PAS (mesuré sur la Walla : l'empiècement du dos est une MARCHE, pas un creux —
     vingt passes de Taubin la laissaient entière, rendu à texture unie à l'appui). On lisse donc la PROFONDEUR vue par
     la caméra de la photo : la carte de profondeur de la vue (900 px de haut), floutée (gaussienne normalisée, σ ≈ 1,3 %
     de la hauteur — les coutures et marches inventées, pas la forme du vêtement), puis chaque sommet VISIBLE de cette
     vue est ramené vers la profondeur floutée, au prorata de son poids. Seule la profondeur change. */
  const sigma = o.sigma || 12;
  const flouProf = (v) => {
    const W = v.W, H = v.H, z = new Float32Array(W * H), m = new Float32Array(W * H);
    for (let k = 0; k < W * H; k++) if (isFinite(v.prof[k])) { z[k] = v.prof[k]; m[k] = 1; }
    const R = Math.ceil(sigma * 2.5), noyau = []; for (let i2 = -R; i2 <= R; i2++) noyau.push(Math.exp(-i2 * i2 / (2 * sigma * sigma)));
    const passe = (src, dst, horizontal) => {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let sz = 0; for (let i2 = -R; i2 <= R; i2++) { const xx = horizontal ? x + i2 : x, yy = horizontal ? y : y + i2; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; sz += src[yy * W + xx] * noyau[i2 + R]; }
        dst[y * W + x] = sz;
      }
    };
    const t1 = new Float32Array(W * H), t2 = new Float32Array(W * H), zm = new Float32Array(W * H);
    for (let k = 0; k < W * H; k++) zm[k] = z[k] * m[k];
    passe(zm, t1, true); passe(t1, t2, false);
    const n1 = new Float32Array(W * H), n2 = new Float32Array(W * H);
    passe(m, n1, true); passe(n1, n2, false);
    const out = new Float32Array(W * H);
    for (let k = 0; k < W * H; k++) out[k] = (m[k] && n2[k] > 1e-6) ? t2[k] / n2[k] : NaN;
    return out;
  };
  const cartes = vues.map((x) => flouProf(x.v));
  /* LA DISTANCE AU BORD de la silhouette (chanfrein 3-4) : près du bord, la carte floutée mêle la surface et ce qui
     est derrière (l'ourlet, la doublure) — essai Walla : une frange sombre et dentelée au bas du dos. Le poids s'y
     éteint sur 2σ. */
  const distBord = (v) => {
    const W = v.W, H = v.H, D2 = new Float32Array(W * H);
    for (let k = 0; k < W * H; k++) D2[k] = v.masque[k] ? 1e9 : 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = y * W + x; if (!D2[k]) continue;
      let m = D2[k]; if (x > 0) m = Math.min(m, D2[k - 1] + 3); if (y > 0) m = Math.min(m, D2[k - W] + 3);
      if (x > 0 && y > 0) m = Math.min(m, D2[k - W - 1] + 4); if (x < W - 1 && y > 0) m = Math.min(m, D2[k - W + 1] + 4); D2[k] = m; }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const k = y * W + x; if (!D2[k]) continue;
      let m = D2[k]; if (x < W - 1) m = Math.min(m, D2[k + 1] + 3); if (y < H - 1) m = Math.min(m, D2[k + W] + 3);
      if (x < W - 1 && y < H - 1) m = Math.min(m, D2[k + W + 1] + 4); if (x > 0 && y < H - 1) m = Math.min(m, D2[k + W - 1] + 4); D2[k] = m; }
    for (let k = 0; k < W * H; k++) D2[k] /= 3;
    return D2;
  };
  const bords = vues.map((x) => distBord(x.v));
  const bilin = (c, W, H, X, Y) => {
    const x0 = Math.max(0, Math.min(W - 2, Math.floor(X - 0.5))), y0 = Math.max(0, Math.min(H - 2, Math.floor(Y - 0.5)));
    const fx = Math.max(0, Math.min(1, X - 0.5 - x0)), fy = Math.max(0, Math.min(1, Y - 0.5 - y0));
    const a = c[y0 * W + x0], b = c[y0 * W + x0 + 1], e = c[(y0 + 1) * W + x0], f = c[(y0 + 1) * W + x0 + 1];
    if (!isFinite(a) || !isFinite(b) || !isFinite(e) || !isFinite(f)) { const n = c[Math.floor(Y) * W + Math.floor(X)]; return n; }
    return (a * (1 - fx) + b * fx) * (1 - fy) + (e * (1 - fx) + f * fx) * fy;
  };
  for (const v of actifs) {
    const k = axe[v], vu = vues[k].v, P = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
    const [X, Y, Z] = vu.projeter(P), xi = Math.floor(X), yi = Math.floor(Y);
    if (xi < 0 || yi < 0 || xi >= vu.W || yi >= vu.H) continue;
    // caché (tolérance serrée : une doublure juste derrière ne compte pas) — sauf la contremarche d'une crête, cachée de peu
    if (Z > vu.prof[yi * vu.W + xi] + vu.tolerance * (poidsFace[v] > 0.01 ? 0.25 : 3)) continue;
    const cible = bilin(cartes[k], vu.W, vu.H, X, Y); if (!isFinite(cible)) continue;
    const pb = lisse(bords[k][yi * vu.W + xi] / (3 * sigma));
    // ⚠ BORNÉ : une couture, une marche inventée ne font que quelques millimètres ; un écart plus grand est une vraie
    // forme (un ourlet, un revers) — on n'y touche pas au-delà de 4 ‰ de la hauteur du vêtement
    // (2026-10-19) borne relevée de 4 à 10 ‰ : la marche de l'empiècement et le pli du milieu du dos se voyaient encore
    const lim = (o.borne || 0.025) * etat.hauteurModele;
    const dz = Math.max(-lim, Math.min(lim, cible - Z)) * poids[v] * pb;
    pos[v * 3] += dz * d[k][0]; pos[v * 3 + 1] += dz * d[k][1]; pos[v * 3 + 2] += dz * d[k][2];
  }
  // quelques passes de Taubin, dans la profondeur, pour effacer le grain laissé par l'échantillonnage de la carte
  const pas = (f) => {
    const dep = new Float32Array(actifs.length);
    actifs.forEach((v, i) => {
      const nb = geo.voisins.get(v), k = axe[v]; let mx = 0, my = 0, mz = 0, n = 0;
      nb.forEach((u) => { mx += pos[u * 3]; my += pos[u * 3 + 1]; mz += pos[u * 3 + 2]; n++; });
      const lx = mx / n - pos[v * 3], ly = my / n - pos[v * 3 + 1], lz = mz / n - pos[v * 3 + 2];
      dep[i] = (lx * d[k][0] + ly * d[k][1] + lz * d[k][2]) * f * poids[v];
    });
    actifs.forEach((v, i) => { const k = axe[v]; pos[v * 3] += dep[i] * d[k][0]; pos[v * 3 + 1] += dep[i] * d[k][1]; pos[v * 3 + 2] += dep[i] * d[k][2]; });
  };
  for (let it = 0; it < o.iterations; it++) { pas(o.lambda); pas(o.mu); }
  // les doublons d'UV suivent leur sommet soudé
  for (let v = 0; v < nV; v++) { const r0 = geo.rep[v]; if (r0 !== v && poids[r0] > 0.01) { pos[v * 3] = pos[r0 * 3]; pos[v * 3 + 1] = pos[r0 * 3 + 1]; pos[v * 3 + 2] = pos[r0 * 3 + 2]; } }
  // les normales des sommets déplacés, recalculées sur la nouvelle surface (fondues par le poids)
  const ng = new Float32Array(nV * 3);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    const A = [pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]];
    const f = croix(sous([pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]], A), sous([pos[c * 3], pos[c * 3 + 1], pos[c * 3 + 2]], A));
    for (const v of [a, b, c]) { const r0 = geo.rep[v]; ng[r0 * 3] += f[0]; ng[r0 * 3 + 1] += f[1]; ng[r0 * 3 + 2] += f[2]; }
  }
  /* ⚠ LES NORMALES DE FACETTES, LISSÉES (essai Walla : prises telles quelles, elles montraient les facettes du maillage
     simplifié — un suède « froissé », taché en diagonale) : moyenne de voisinage, quatre passes, sur la zone aplanie. */
  for (let v = 0; v < nV; v++) { if (geo.rep[v] !== v) continue; const g = unit([ng[v * 3], ng[v * 3 + 1], ng[v * 3 + 2]]); ng[v * 3] = g[0]; ng[v * 3 + 1] = g[1]; ng[v * 3 + 2] = g[2]; }
  for (let p = 0; p < 4; p++) {
    const neuf = new Float32Array(ng);
    actifs.forEach((v) => { let x = ng[v * 3], y = ng[v * 3 + 1], z = ng[v * 3 + 2]; geo.voisins.get(v).forEach((u) => { x += ng[u * 3]; y += ng[u * 3 + 1]; z += ng[u * 3 + 2]; }); const g = unit([x, y, z]); neuf[v * 3] = g[0]; neuf[v * 3 + 1] = g[1]; neuf[v * 3 + 2] = g[2]; });
    ng.set(neuf);
  }
  let bouges = 0;
  for (let v = 0; v < nV; v++) {
    const r0 = geo.rep[v], w = poids[r0]; if (w <= 0.01) continue;
    bouges++;
    const g = unit([ng[r0 * 3], ng[r0 * 3 + 1], ng[r0 * 3 + 2]]);
    if (scal(g, [nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]]) < 0) { g[0] = -g[0]; g[1] = -g[1]; g[2] = -g[2]; }
    const n2 = unit([nor[v * 3] * (1 - w) + g[0] * w, nor[v * 3 + 1] * (1 - w) + g[1] * w, nor[v * 3 + 2] * (1 - w) + g[2] * w]);
    nor[v * 3] = n2[0]; nor[v * 3 + 1] = n2[1]; nor[v * 3 + 2] = n2[2];
  }
  /* ⚠⚠ L'OMBRE EST DÉJÀ PEINTE (2026-10-19, sa plainte : « trop lumineux et réfléchissant sur le devant »). Sous une
     photo, les plis portent DÉJÀ leur ombre — celle de la prise de vue. La lumière de la boutique en ajoutait une seconde
     sur les mêmes plis (la géométrie de The New Black) : le contraste doublait, et le suède prenait l'air d'un satin.
     Sous la photo, la normale est donc tournée vers l'appareil qui l'a prise, au prorata de la couverture et de
     l'orientation (pleinement de face, rien sur les flancs) : la boutique éclaire alors cette zone presque à plat, et
     ce qu'on voit est l'ombre VRAIE, celle de la photo. La silhouette ne bouge pas (seules les normales changent). */
  for (let v = 0; v < nV; v++) {
    const r0 = geo.rep[v], k = geo.cVue[0][r0] >= geo.cVue[1][r0] ? 0 : 1, cov = geo.cVue[k][r0];
    const vers = [-d[k][0], -d[k][1], -d[k][2]];
    const nv = scal([nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]], vers);
    const t = lisse((cov - 0.3) / 0.5) * lisse((nv - 0.2) / 0.4) * (o.ombrePeinte != null ? o.ombrePeinte : 0.75);
    if (t <= 0.01) continue;
    const n2 = unit([nor[v * 3] * (1 - t) + vers[0] * t, nor[v * 3 + 1] * (1 - t) + vers[1] * t, nor[v * 3 + 2] * (1 - t) + vers[2] * t]);
    nor[v * 3] = n2[0]; nor[v * 3 + 1] = n2[1]; nor[v * 3 + 2] = n2[2];
  }
  const apres = mesurerRelief(etat);
  etat.relief = { avant, apres, sommetsAplanis: bouges };
  return etat.relief;
}

/* (6) LA COULEUR FIDÈLE : la teinte du vêtement sur TOUT le modèle (côtés de The New Black compris) ramenée sur celle
   de la photo du DEVANT — médiane du groupe dominant, gains bornés 0,7–1,4, sur la seule couleur dominante. */
/* L'OMBRAGE DOUX, PRÉ-CUIT (2026-10-19, sa direction : « sous les photos, l'éclairage de la scène ne doit plus rien
   ajouter »). Le modèle est rendu NON ÉCLAIRÉ : la texture dit TOUT. Sous les photos, leurs vrais pixels — leur vraie
   lumière. Ailleurs (les flancs, les dessous des manches), la texture de The New Black, aplanie à la teinte de la photo,
   n'aurait plus aucun modelé : on y CUIT un ombrage doux, calculé ici sans lumière de scène ni reflet :
     · une lumière de ciel (le dessus un peu plus clair que le dessous) ;
     · une occlusion de cavité (un creux s'assombrit : la profondeur du sommet sous la moyenne de ses voisins, le long de
       sa normale, sur trois anneaux de voisinage).
   Normalisé à 1 en moyenne sur les zones qu'il touche (la teinte, réglée sur la photo, ne bouge pas), et fondu à zéro
   sous les photos. */
function ombrageDoux(etat){
  if (etat.ombrageCuit) return etat.ombrageCuit;
  const { tex, maillage, geo, wTex } = etat, { pos, idx, nor } = maillage, nV = pos.length / 3, nTex = tex.w * tex.h;
  const H = etat.hauteurModele || 1;
  const vois = geo.voisins, rep = geo.rep;
  // la moyenne des positions sur trois anneaux (lissage de Laplace répété)
  let M = new Float32Array(pos.length); M.set(pos);
  for (let it = 0; it < 3; it++) {
    const N2 = new Float32Array(M);
    vois.forEach((nb, v) => { let x = M[v * 3], y = M[v * 3 + 1], z = M[v * 3 + 2], n = 1; nb.forEach((u) => { x += M[u * 3]; y += M[u * 3 + 1]; z += M[u * 3 + 2]; n++; });
      N2[v * 3] = x / n; N2[v * 3 + 1] = y / n; N2[v * 3 + 2] = z / n; });
    M = N2;
  }
  const S = new Float32Array(nV);
  vois.forEach((nb, v) => {
    const n = unit([nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]]);
    const creux = ((M[v * 3] - pos[v * 3]) * n[0] + (M[v * 3 + 1] - pos[v * 3 + 1]) * n[1] + (M[v * 3 + 2] - pos[v * 3 + 2]) * n[2]) / H;
    const ao = Math.max(0.72, Math.min(1, 1 - Math.max(0, creux) * 60));
    const ciel = 0.9 + 0.1 * (0.5 + 0.5 * n[1]);
    S[v] = ao * ciel;
  });
  // la moyenne, sur ce qu'aucune photo ne couvre
  let sm = 0, sn = 0;
  for (let k = 0; k < nTex; k += 7) { const t = etat.texTri[k]; if (t < 0 || wTex[k] > 0.2) continue;
    const b1 = etat.texB1[k], b2 = etat.texB2[k], s0 = (1 - b1 - b2) * S[rep[idx[t]]] + b1 * S[rep[idx[t + 1]]] + b2 * S[rep[idx[t + 2]]]; sm += s0; sn++; }
  const moy = sn ? sm / sn : 1;
  let n = 0;
  for (let k = 0; k < nTex; k++) {
    const t = etat.texTri[k]; if (t < 0) continue;
    const f = 1 - Math.min(1, wTex[k] * 1.5); if (f <= 0.01) continue;
    const b1 = etat.texB1[k], b2 = etat.texB2[k];
    const s0 = ((1 - b1 - b2) * S[rep[idx[t]]] + b1 * S[rep[idx[t + 1]]] + b2 * S[rep[idx[t + 2]]]) / moy;
    const m = 1 + (s0 - 1) * f, i = k * 4;
    tex.data[i] = Math.min(255, Math.round(tex.data[i] * m)); tex.data[i + 1] = Math.min(255, Math.round(tex.data[i + 1] * m)); tex.data[i + 2] = Math.min(255, Math.round(tex.data[i + 2] * m));
    n++;
  }
  if (etat.dansTri) remplirMarges(tex, etat.dansTri);
  etat.ombrageCuit = { texels: n, moyenne: +moy.toFixed(3) };
  return etat.ombrageCuit;
}

/* (6) LA COULEUR FIDÈLE. Sans argument : le rapport (l'appariement fait à la projection, et la teinte d'ensemble).
   Avec une CORRECTION mesurée au rendu de la boutique ({ global: [dL, da, db], secteurs: [{ a, d: [dL, da, db] }] }) :
   un décalage Lab sur toute la texture (la face rendue ramenée sur la photo), et un décalage PAR DIRECTION — chaque
   texel prend, selon l'azimut de sa normale (0° = le devant), l'interpolation des corrections des deux angles de
   mesure qui l'encadrent ; le devant (0°) n'en reçoit aucune. */
function couleurFidele(etat, correction){
  const { tex, ref } = etat, nTex = tex.w * tex.h;
  if (correction && (correction.global || correction.secteurs)) {
    const g = correction.global || [0, 0, 0], sec = (correction.secteurs || []).slice().sort((x, y) => x.a - y.a);
    const d = tex.data, o = [0, 0, 0], q = [0, 0, 0], C = lab(ref);
    const { idx, nor } = etat.maillage, f = etat.sens.devant, th0 = Math.atan2(f[0], f[2]);
    const parAngle = (a) => {
      if (!sec.length) return [0, 0, 0];
      a = ((a % 360) + 360) % 360;
      let i = sec.findIndex((x) => x.a > a); if (i < 0) i = sec.length;
      const A = sec[(i - 1 + sec.length) % sec.length], B = sec[i % sec.length];
      const span = ((B.a - A.a) + 360) % 360 || 360, u = (((a - A.a) + 360) % 360) / span;
      return [0, 1, 2].map((c) => A.d[c] * (1 - u) + B.d[c] * u);
    };
    for (let k = 0; k < nTex; k++) {
      const t = etat.texTri[k];
      const i = k * 4;
      labRapide(d[i], d[i + 1], d[i + 2], o);
      const e = Math.hypot((o[0] - C[0]) * 0.3, o[1] - C[1], o[2] - C[2]);
      const tt = e <= 20 ? 1 : (e >= 36 ? 0 : 1 - (e - 20) / 16);
      if (!tt) continue;
      let s2 = [0, 0, 0];
      if (t >= 0 && sec.length) {
        const b1 = etat.texB1[k], b2 = etat.texB2[k], b0 = 1 - b1 - b2;
        const nx = b0 * nor[idx[t] * 3] + b1 * nor[idx[t + 1] * 3] + b2 * nor[idx[t + 2] * 3];
        const ny = b0 * nor[idx[t] * 3 + 1] + b1 * nor[idx[t + 1] * 3 + 1] + b2 * nor[idx[t + 2] * 3 + 1];
        const nz = b0 * nor[idx[t] * 3 + 2] + b1 * nor[idx[t + 1] * 3 + 2] + b2 * nor[idx[t + 2] * 3 + 2];
        const h = Math.hypot(nx, nz), l = Math.hypot(nx, ny, nz) || 1;
        const a = (Math.atan2(nx, nz) - th0) * 180 / Math.PI, poids = h / l;   // une surface horizontale n'a pas de direction
        s2 = parAngle(a).map((x) => x * poids);
      }
      rgbDeLab(o[0] + (g[0] + s2[0]) * tt, o[1] + (g[1] + s2[1]) * tt, o[2] + (g[2] + s2[2]) * tt, q);
      d[i] = q[0]; d[i + 1] = q[1]; d[i + 2] = q[2];
    }
    if (etat.dansTri) remplirMarges(tex, etat.dansTri);
    etat.corrections = (etat.corrections || []).concat([{ global: g.map((x) => +x.toFixed(2)), secteurs: sec.map((x) => ({ a: x.a, d: x.d.map((y) => +y.toFixed(1)) })) }]);
    return { corrige: true, corrections: etat.corrections };
  }
  const px = []; for (let k = 0; k < nTex; k += 5) { const i = k * 4; if (tex.data[i] + tex.data[i + 1] + tex.data[i + 2] > 30) px.push(tex.data[i], tex.data[i + 1], tex.data[i + 2]); }
  const avant = medianeGroupe(px, ref), g = gainsVers(ref, avant);
  if (!g.every((x) => Math.abs(x - 1) < 0.02)) appliquerGains(tex.data, nTex, g, avant);
  const px2 = []; for (let k = 0; k < nTex; k += 5) { const i = k * 4; if (tex.data[i] + tex.data[i + 1] + tex.data[i + 2] > 30) px2.push(tex.data[i], tex.data[i + 1], tex.data[i + 2]); }
  const apres = medianeGroupe(px2, ref);
  // le rendu est NON ÉCLAIRÉ : l'ombrage doux est cuit ici, une fois, sur ce qu'aucune photo ne couvre
  const ombrage = ombrageDoux(etat);
  etat.couleur = { reference: ref, avant, apres, gains: g.map((x) => +x.toFixed(3)), ecartAvant: +deltaE(avant, ref).toFixed(1), ecartApres: +deltaE(apres, ref).toFixed(1),
    appariement: etat.appariement || null, ombrage };
  return etat.couleur;
}

/* (8) LA CONFORMITÉ du modèle final, de face et de dos : IoU des silhouettes (la forme), écart de couleur (ΔE, contre la
   photo telle que projetée) et motif (corrélation des niveaux de gris, avant → après). */
function controler(etat){
  const { maillage, tex, vues, avant } = etat;
  const apres = {};
  for (const x of vues) {
    const col = couleurVue(x.v, maillage, tex);
    apres[x.nom] = conformite(x.v, col, x.phC, x.pm.m, x.cal);
    apres[x.nom].motif = +correlation(x.v, col, x.phC, x.cal).toFixed(3);
    avant[x.nom].motif = +x.motifAvant.toFixed(3);
  }
  etat.conformite = { avant, apres, relief: etat.relief || null };
  return etat.conformite;
}

// Les quatre temps d'un coup (les essais).
function projeter(maillage, tex, devant, dos, options){
  const e = preparer(maillage, tex, devant, dos, options);
  projeterPhotos(e); aplanirRelief(e); couleurFidele(e);
  const c = controler(e);
  return { sens: e.sens, recalage: e.recalage, avant: c.avant, apres: c.apres, relief: e.relief, couverture: e.couverture, couleur: e.couleur, couleurDos: e.couleurDos };
}

function normales(pos, idx){
  const n = new Float32Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    const A = [pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]], B = [pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]], C = [pos[c * 3], pos[c * 3 + 1], pos[c * 3 + 2]];
    const f = croix(sous(B, A), sous(C, A));
    for (const v of [a, b, c]) { n[v * 3] += f[0]; n[v * 3 + 1] += f[1]; n[v * 3 + 2] += f[2]; }
  }
  return n;
}

module.exports = { projeter, preparer, projeterPhotos, aplanirRelief, mesurerRelief, couleurFidele, controler, vue, couleurVue, masquePhoto, recaler,
  lab, deltaE, medianeGroupe };
