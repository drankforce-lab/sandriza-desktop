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
  const gDos = gainsVers(ref, cDos);
  const dosC = { w: dos.w, h: dos.h, data: new Uint8ClampedArray(dos.data) };
  appliquerGains(dosC.data, dos.w * dos.h, gDos, cDos);
  vues[1].phC = dosC; vues[0].phC = devant;
  // 4. LA PROJECTION, texel par texel (triangles rastérisés en espace UV)
  const acc = new Float32Array(nTex * 4);   // r, v, b pondérés + poids
  const dansTri = new Uint8Array(nTex);      // les texels qu'un triangle utilise (le reste : les marges entre îlots)
  const texTri = new Int32Array(nTex).fill(-1), texB1 = new Float32Array(nTex), texB2 = new Float32Array(nTex);
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
        if (Z > vu.v.prof[yi * vu.v.W + xi] + vu.v.tolerance) continue;          // caché par une autre surface
        const pxx = (X - vu.cal.tx) / vu.cal.sx, py = (Y - vu.cal.ty) / vu.cal.sy;
        const pi = Math.floor(py) * vu.ph.w + Math.floor(pxx);
        if (pxx < 0 || py < 0 || pxx >= vu.ph.w || py >= vu.ph.h || !vu.mErode[pi]) continue;
        const col = echantillon(vu.phC, pxx, py), wgt = lisse((nv - o.seuilNV) / (o.finNV - o.seuilNV));
        acc[k4] += col[0] * wgt; acc[k4 + 1] += col[1] * wgt; acc[k4 + 2] += col[2] * wgt; acc[k4 + 3] += wgt;
      }
    }
  }
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
  for (let it = 0; it < 80; it++) {
    for (const v of libres) {
      const nb = voisins.get(v); let r = 0, g = 0, b = 0, n = 0;
      nb.forEach((u) => { r += D[u * 3]; g += D[u * 3 + 1]; b += D[u * 3 + 2]; n++; });
      if (n) { D[v * 3] = r / n * 0.985; D[v * 3 + 1] = g / n * 0.985; D[v * 3 + 2] = b / n * 0.985; }   // s'éteint au loin
    }
  }
  const DD = (v, c) => D[rep[v] * 3 + c];
  for (let k = 0; k < nTex; k++) {
    if (texTri[k] < 0) continue;
    const t = texTri[k], b1 = texB1[k], b2 = texB2[k], b0 = 1 - b1 - b2, i = k * 4;
    const base = [0, 1, 2].map((c) => tex.data[i + c] + b0 * DD(idx[t], c) + b1 * DD(idx[t + 1], c) + b2 * DD(idx[t + 2], c));
    const w = acc[i + 3], f = Math.min(1, w);
    if (w) couverts++;
    for (let c = 0; c < 3; c++) tex.data[i + c] = Math.max(0, Math.min(255, Math.round(base[c] * (1 - f) + (w ? acc[i + c] / w : 0) * f)));
  }
  /* LES MARGES ENTRE ÎLOTS (gutters) prennent la couleur du bord le plus proche : sans cela, le filtrage de la
     texture mêlait au raccord des îlots la couleur d'AVANT, et des lignes claires quadrillaient le devant. */
  const fait = new Uint8Array(dansTri);
  for (let passe = 0; passe < 6; passe++) {
    const neufs = [];
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const k = y * TW + x; if (fait[k]) continue;
      let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= TW || yy >= TH) continue;
        const j = yy * TW + xx; if (!fait[j]) continue;
        r += tex.data[j * 4]; g += tex.data[j * 4 + 1]; b += tex.data[j * 4 + 2]; n++;
      }
      if (n) neufs.push(k, r / n, g / n, b / n);
    }
    for (let i = 0; i < neufs.length; i += 4) { const k = neufs[i]; tex.data[k * 4] = neufs[i + 1]; tex.data[k * 4 + 1] = neufs[i + 2]; tex.data[k * 4 + 2] = neufs[i + 3]; fait[k] = 1; }
  }
  /* LE RELIEF INVENTÉ S'EFFACE LÀ OÙ LA PHOTO PARLE : la carte de normales de The New Black porte SES coutures (un
     empiècement au dos que le vrai vêtement n'a pas) ; sous la photo projetée, elle est aplanie au prorata du poids
     — sinon on voyait deux coutures, la vraie (photo) et l'inventée (relief). Les côtés gardent leur relief. */
  if (o.normale) {
    const nm = o.normale;
    for (let y = 0; y < nm.h; y++) for (let x = 0; x < nm.w; x++) {
      const k = ((Math.floor(y * TH / nm.h)) * TW + Math.floor(x * TW / nm.w)) * 4, w = Math.min(1, acc[k + 3]) * 0.9;
      if (!w) continue;
      const i = (y * nm.w + x) * 4;
      nm.data[i] = nm.data[i] * (1 - w) + 128 * w; nm.data[i + 1] = nm.data[i + 1] * (1 - w) + 128 * w; nm.data[i + 2] = nm.data[i + 2] * (1 - w) + 255 * w;
    }
  }
  etat.couverture = Math.round(couverts / nTex * 1000) / 10;
  etat.couleurDos = { dos: cDos, gains: gDos.map((g) => +g.toFixed(3)) };
  return { couverture: etat.couverture, gainsDos: etat.couleurDos.gains };
}

/* (6) LA COULEUR FIDÈLE : la teinte du vêtement sur TOUT le modèle (côtés de The New Black compris) ramenée sur celle
   de la photo du DEVANT — médiane du groupe dominant, gains bornés 0,7–1,4, sur la seule couleur dominante. */
function couleurFidele(etat){
  const { tex, ref } = etat, nTex = tex.w * tex.h;
  const px = []; for (let k = 0; k < nTex; k += 5) { const i = k * 4; if (tex.data[i] + tex.data[i + 1] + tex.data[i + 2] > 30) px.push(tex.data[i], tex.data[i + 1], tex.data[i + 2]); }
  const avant = medianeGroupe(px, ref), g = gainsVers(ref, avant);
  if (!g.every((x) => Math.abs(x - 1) < 0.02)) appliquerGains(tex.data, nTex, g, avant);
  const px2 = []; for (let k = 0; k < nTex; k += 5) { const i = k * 4; if (tex.data[i] + tex.data[i + 1] + tex.data[i + 2] > 30) px2.push(tex.data[i], tex.data[i + 1], tex.data[i + 2]); }
  const apres = medianeGroupe(px2, ref);
  etat.couleur = { reference: ref, avant, apres, gains: g.map((x) => +x.toFixed(3)), ecartAvant: +deltaE(avant, ref).toFixed(1), ecartApres: +deltaE(apres, ref).toFixed(1) };
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
  etat.conformite = { avant, apres };
  return etat.conformite;
}

// Les quatre temps d'un coup (les essais).
function projeter(maillage, tex, devant, dos, options){
  const e = preparer(maillage, tex, devant, dos, options);
  projeterPhotos(e); couleurFidele(e);
  const c = controler(e);
  return { sens: e.sens, recalage: e.recalage, avant: c.avant, apres: c.apres, couverture: e.couverture, couleur: e.couleur, couleurDos: e.couleurDos };
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

module.exports = { projeter, preparer, projeterPhotos, couleurFidele, controler, vue, couleurVue, masquePhoto, recaler };
