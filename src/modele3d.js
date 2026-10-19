'use strict';

/*
 * L'APERÇU 3D D'UN VÊTEMENT — LA COMPRESSION (7.16.0, 2026-10-09)
 * =============================================================================
 * Hunyuan3D (Fal.ai) rend un modèle de 17 à 20 Mo : trois textures 4096 × 4096
 * en PNG et une matière réglée « métal 1 » qui fait briller le tissu comme du
 * plastique (son essai du 2026-10-09, la robe ZENXAS). Trop lourd pour un
 * téléphone, et faux à l'œil. On le ramène ici, dans le processus principal :
 *   · matière MATE : plus de carte métal/rugosité, métal 0, rugosité 0,85 ;
 *   · textures 1024 px en JPEG (nativeImage d'Electron — sharp n'existe pas
 *     pour Windows ARM, et une dépendance native de plus ne vaut pas ça) ;
 *   · géométrie soudée, simplifiée (~60 000 sommets) puis compressée (Draco).
 * Résultat attendu : 1 à 3 Mo. La boutique l'affiche avec <model-viewer>, qui
 * sait décoder Draco.
 */

const { nativeImage } = require('electron');
// Les outils SANS Electron (lecture/écriture GLB, simplification) vivent à part : le fil de la projection les emploie aussi.
const { outils, simplifierPrimitive } = require('./modele3d-outils');

// Une texture ramenée à `cote` px au plus, en JPEG. Une image illisible est laissée telle quelle.
function reduireTexture(octets, cote){
  const im = nativeImage.createFromBuffer(Buffer.from(octets));
  if (im.isEmpty()) return null;
  const t = im.getSize();
  const r = Math.min(1, cote / Math.max(t.width, t.height));
  const petit = r < 1 ? im.resize({ width: Math.round(t.width * r), height: Math.round(t.height * r), quality: 'best' }) : im;
  return petit.toJPEG(82);
}

/** Compresse un GLB (Buffer) ; rend { glb: Buffer, avant, apres, sommets }. */
async function compresserGlb(octets, options){
  const o = Object.assign({ cible: 60000, cote: 1024 }, options || {});
  const { io, ext, MeshoptSimplifier } = await outils();
  const doc = await io.readBinary(new Uint8Array(octets));
  const r = doc.getRoot();
  for (const m of r.listMaterials()) {
    const mr = m.getMetallicRoughnessTexture();
    m.setMetallicRoughnessTexture(null);
    if (mr && !mr.listParents().some((p) => p !== r)) mr.dispose();
    m.setMetallicFactor(0).setRoughnessFactor(0.85);
    /* (2026-10-19) NON ÉCLAIRÉ, sur demande : le modèle 3D de l'Atelier par The New Black porte sa propre lumière dans
       sa texture — la boutique et l'Atelier l'affichent tel quel (exposition 1 : voir la matière « sz-photo-unlit »). */
    if (o.unlit) {
      const nt = m.getNormalTexture();
      if (nt) { m.setNormalTexture(null); if (!nt.listParents().some((p) => p !== r)) nt.dispose(); }
      m.setExtension('KHR_materials_unlit', doc.createExtension(ext.KHRMaterialsUnlit).createUnlit());
      m.setName('sz-photo-unlit');
    }
  }
  for (const t of r.listTextures()) {
    const j = reduireTexture(t.getImage(), o.cote);
    if (j) t.setImage(new Uint8Array(j)).setMimeType('image/jpeg');
  }
  const sommets = r.listAccessors().filter((a) => a.getType() === 'VEC3' && a.getCount() > 0)
    .reduce((s, a) => Math.max(s, a.getCount()), 0);
  const ratio = sommets ? Math.min(1, o.cible / sommets) : 1;
  for (const m of r.listMeshes()) for (const p of m.listPrimitives()) simplifierPrimitive(doc, p, ratio, MeshoptSimplifier);
  doc.createExtension(ext.KHRDracoMeshCompression).setRequired(true)
    .setEncoderOptions({ method: ext.KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER });
  const glb = Buffer.from(await io.writeBinary(doc));
  return { glb, avant: octets.length, apres: glb.length, sommets };
}

/* ══ L'APERÇU 3D DE THE NEW BLACK, PAR ÉTAPES (2026-10-18) ══════════════════════════════════════════════════════
   « Image to 3D » rend un modèle de ~45 Mo (1,5 million de triangles, textures 4096). La page principale (la file
   des générations) l'amène ici étape par étape — chacune a sa ligne dans la barre de progression :
     3 telecharger(url)              — le GLB, depuis le stockage public de The New Black seulement ;
     4 recaler(devant, dos)          — les photos décodées ICI (PNG/JPEG en data:), le modèle simplifié et la photo
                                        de chaque face recalée sur sa silhouette (dans le fil) ;
     5 projeter · 6 aplanir · 7 couleur — dans le fil (projection3d.js) ;
     7 compresser                    — textures encodées ici (2048 px, JPEG 85 ; relief 1024 px), Draco dans le fil ;
     8 controler                     — la conformité, et la vignette (le devant rendu) ;
   puis fermer. Une session par jeton, un FIL par session : l'application ne se fige jamais. */
const { Worker } = require('worker_threads');
const path = require('path');
const SESSIONS = new Map();

// RVBA (le fil) ↔ nativeImage (BGRA sous Windows)
function decoderImage(buf, cote){
  let im = nativeImage.createFromBuffer(Buffer.from(buf));
  if (im.isEmpty()) return null;
  let t = im.getSize();
  if (cote && Math.max(t.width, t.height) > cote) {
    const r = cote / Math.max(t.width, t.height);
    im = im.resize({ width: Math.round(t.width * r), height: Math.round(t.height * r), quality: 'best' }); t = im.getSize();
  }
  const b = im.toBitmap(), d = new Uint8ClampedArray(t.width * t.height * 4);
  for (let i = 0; i < t.width * t.height; i++) { d[i * 4] = b[i * 4 + 2]; d[i * 4 + 1] = b[i * 4 + 1]; d[i * 4 + 2] = b[i * 4]; d[i * 4 + 3] = b[i * 4 + 3]; }
  return { w: t.width, h: t.height, data: d };
}
function versNative(im, fondTransparent){
  const b = Buffer.alloc(im.w * im.h * 4);
  for (let i = 0; i < im.w * im.h; i++) {
    b[i * 4] = im.data[i * 4 + 2]; b[i * 4 + 1] = im.data[i * 4 + 1]; b[i * 4 + 2] = im.data[i * 4];
    b[i * 4 + 3] = fondTransparent ? im.data[i * 4 + 3] : 255;
  }
  return nativeImage.createFromBitmap(b, { width: im.w, height: im.h });
}
const depuisDataUrl = (u) => { const m = /^data:image\/(png|jpeg|jpg);base64,/.exec(String(u || '')); return m ? Buffer.from(String(u).slice(m[0].length), 'base64') : null; };

function session(jeton){
  const s = SESSIONS.get(jeton);
  if (!s) throw new Error('session 3D absente (redémarrage ?) — recommencez à l’étape du téléchargement');
  s.vu = Date.now();
  return s;
}
/* ⚠ LE REPLI : si le fil ne démarre pas (un module introuvable dans le paquet, par exemple), le même traitement
   tourne dans le processus principal — plus lent pour l'application, jamais en panne. */
function demander(s, type, donnees, transfert){
  if (s.local) return s.local.traiter(Object.assign({ type }, donnees || {})).then((o) => o.r);
  return new Promise((ok, ko) => {
    const id = ++s.n;
    s.attente.set(id, { ok, ko });
    s.fil.postMessage(Object.assign({ id, type }, donnees || {}), transfert || []);
  });
}
function ouvrir(jeton){
  fermer(jeton);
  const s = { fil: null, local: null, n: 0, attente: new Map(), vu: Date.now() };
  try {
    s.fil = new Worker(path.join(__dirname, 'modele3d-tache.js'));
    s.fil.on('message', (m) => { const a = s.attente.get(m.id); if (!a) return; s.attente.delete(m.id); m.ok ? a.ok(m.r) : a.ko(new Error(m.erreur || 'échec')); });
    s.fil.on('error', (e) => {
      try { console.warn('[modele3d] le fil s’est arrêté — repli dans le processus principal :', e && e.message); } catch (x) {}
      s.attente.forEach((a) => a.ko(e)); s.attente.clear();
    });
  } catch (e) {
    try { console.warn('[modele3d] fil impossible — repli dans le processus principal :', e && e.message); } catch (x) {}
    s.fil = null; s.local = require('./modele3d-tache').local();
  }
  SESSIONS.set(jeton, s);
  return s;
}
function fermer(jeton){
  const s = SESSIONS.get(jeton);
  if (s) { try { if (s.fil) s.fil.terminate(); } catch (e) {} SESSIONS.delete(jeton); }
}
// une session oubliée (génération interrompue sans adieu) s'éteint après 20 minutes
setInterval(() => { const t = Date.now(); SESSIONS.forEach((s, j) => { if (t - s.vu > 20 * 60000) fermer(j); }); }, 60000).unref();

/* (6) LA TEINTE VÉRIFIÉE AU RENDU DE LA BOUTIQUE (2026-10-19, sa plainte : « fidèle à UNE teinte, celle de la photo
   principale »). Huit angles, aux réglages exacts de la boutique (rendu-boutique.js), et le même modèle peint d'une
   seule couleur sous les mêmes angles — la lumière de la boutique varie à elle seule de ΔE ~12 autour du vêtement ;
   ce qu'on juge est la part de la TEXTURE (voir comparerTeinte). Deux exigences :
     · l'UNIFORMITÉ : la teinte de chaque angle à moins de ΔE 3 de celle de la face ;
     · la FIDÉLITÉ : la face rendue à moins de ΔE 3 de la photo du devant.
   Sinon, deux corrections au plus : un décalage Lab GLOBAL (la face ramenée sur la photo) et un décalage PAR
   DIRECTION (chaque angle ramené sur la face, interpolé selon l'azimut de la normale de chaque texel).
   ⚠⚠ MESURÉ AU RENDU, PAS SUR LA TEXTURE (2026-10-19, sa plainte : « le devant plus clair que le dos ») : la lumière de
   la boutique laisse le dos ~ΔE 15 plus sombre que la face, quelle que soit la texture. Elle veut le MÊME vêtement
   devant et derrière : la cible est donc le rendu lui-même — chaque angle ramené sur la face, la lumière comprise (le
   dos est peint un peu plus clair pour paraître pareil). La part de la seule texture reste mesurée, pour information. */
const ANGLES_TEINTE = [0, 45, 90, 135, 180, 225, 270, 315];
// (2026-10-19) trois corrections au plus : la lumière de la boutique demande un peu plus que la seule texture
const MAX_ESSAIS_TEINTE = 3;
// Le modèle est rendu NON ÉCLAIRÉ (modele3d-tache.matiereMate) : voir verifierAuRendu
const NON_ECLAIRE = true;
async function verifierAuRendu(s, reference){
  const { mesurerAngles, comparerTeinte } = require('./rendu-boutique');
  const { lab } = require('./projection3d');
  const essais = [];
  const t0 = await demander(s, 'textures');
  const normaleImage = t0.normale ? versNative(t0.normale).toJPEG(90) : null;
  // le témoin : le même modèle, d'une seule couleur (celle de la photo), rendu une fois
  const c = (reference || [128, 128, 128]).map(Math.round), uni = { w: 8, h: 8, data: new Uint8ClampedArray(256) };
  for (let k = 0; k < 64; k++) { uni.data[k * 4] = c[0]; uni.data[k * 4 + 1] = c[1]; uni.data[k * 4 + 2] = c[2]; uni.data[k * 4 + 3] = 255; }
  const apU = await demander(s, 'apercu', { texImage: versNative(uni).toJPEG(95), normaleImage });
  const mUni = await mesurerAngles(Buffer.from(apU.glb), apU.theta0, ANGLES_TEINTE);
  if (!mUni) return { indisponible: true };
  for (let it = 0; it <= MAX_ESSAIS_TEINTE; it++) {
    const t = it ? await demander(s, 'textures') : t0;
    const ap = await demander(s, 'apercu', { texImage: versNative(t.tex).toJPEG(85), normaleImage });
    const m = await mesurerAngles(Buffer.from(ap.glb), ap.theta0, ANGLES_TEINTE);
    if (!m) return { indisponible: true, essais };
    const cmp = comparerTeinte(m, mUni, reference, lab);
    // l'uniformité AU RENDU (lumière comprise) : chaque angle contre la face
    const F = lab(m[0].rgb), Rf = reference ? lab(reference) : F;
    const abs = m.map((x) => { const A = lab(x.rgb); return [F[0] - A[0], F[1] - A[1], F[2] - A[2]]; });
    cmp.texture = cmp.uniformite;
    cmp.uniformite = +Math.max(...abs.map((v) => Math.hypot(v[0], v[1], v[2]))).toFixed(1);
    cmp.angles.forEach((x, i) => { x.dERendu = +Math.hypot(abs[i][0], abs[i][1], abs[i][2]).toFixed(1); });
    essais.push(cmp);
    /* ⚠ NON ÉCLAIRÉ (2026-10-19) : la face EST la photo, le dos EST la photo du dos ; la lumière de la scène n'y ajoute
       plus rien. On MESURE, on ne corrige plus — toucher aux pixels des photos les rendrait moins fidèles. */
    if (NON_ECLAIRE || (cmp.uniformite < 3 && (cmp.ecartPhoto == null || cmp.ecartPhoto < 3)) || it === MAX_ESSAIS_TEINTE) break;
    const global = [0, 1, 2].map((k) => (Rf[k] - F[k]) * 0.9);
    // par direction : (rendu de la face − rendu de cet angle) ; la face elle-même ne bouge pas
    const secteurs = m.map((x, i) => ({ a: x.a, d: [0, 1, 2].map((k) => abs[i][k] * 0.95) }));
    await demander(s, 'couleur', { correction: { global, secteurs } });
  }
  const der = essais[essais.length - 1];
  return { uniformite: der.uniformite, texture: der.texture, ecartPhoto: der.ecartPhoto, angles: der.angles, iterations: essais.length - 1,
    premier: { uniformite: essais[0].uniformite, ecartPhoto: essais[0].ecartPhoto },
    lumiere: +Math.max(...mUni.map((x) => require('./projection3d').deltaE(x.rgb, mUni[0].rgb))).toFixed(1) };
}

/* (8 bis) LE CONTRÔLE DE STRUCTURE (2026-10-19, sa plainte : « la ligne de couture du milieu haut du dos n'apparaît
   pas en 3D ; il faut que ce soit fidèle à 100 % »). Le modèle FINAL est rendu aux réglages de la boutique, de face et
   de dos, et comparé à la photo correspondante : chacun détouré, recadré sur sa silhouette, ramené à 120 × 160 en
   niveaux de gris, puis
     · SSIM (similarité de structure, fenêtres 8 × 8) — l'image d'ensemble ;
     · CONTOURS : la corrélation des gradients (Sobel), à l'intérieur du vêtement — les coutures, les plis, la fermeture.
   Rend { devant: { ssim, contours }, dos: { ssim, contours } } ; c'est la page principale qui en tire un seuil. */
function grisRecadre(px, w, h, estFond, W2, H2){
  let x0 = w, x1 = -1, y0 = h, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (estFond(y * w + x)) continue; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const g = new Float32Array(W2 * H2), m = new Uint8Array(W2 * H2);
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const sx = Math.min(w - 1, Math.round(x0 + (x + 0.5) * (x1 - x0 + 1) / W2 - 0.5)), sy = Math.min(h - 1, Math.round(y0 + (y + 0.5) * (y1 - y0 + 1) / H2 - 0.5));
    const k = sy * w + sx;
    g[y * W2 + x] = px(k); m[y * W2 + x] = estFond(k) ? 0 : 1;
  }
  return { g, m };
}
function ssim(a, b, W, H){
  const C1 = 6.5025, C2 = 58.5225; let s = 0, n = 0;
  for (let y = 0; y + 8 <= H; y += 4) for (let x = 0; x + 8 <= W; x += 4) {
    let ma = 0, mb = 0, k = 0, dedans = 0;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const q = (y + j) * W + x + i; ma += a.g[q]; mb += b.g[q]; dedans += a.m[q] & b.m[q]; k++; }
    if (dedans < 40) continue;
    ma /= k; mb /= k; let va = 0, vb = 0, cv = 0;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const q = (y + j) * W + x + i; const da = a.g[q] - ma, db = b.g[q] - mb; va += da * da; vb += db * db; cv += da * db; }
    va /= k - 1; vb /= k - 1; cv /= k - 1;
    s += ((2 * ma * mb + C1) * (2 * cv + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2)); n++;
  }
  return n ? s / n : 0;
}
function contours(a, b, W, H){
  const gr = (g, x, y) => g[Math.max(0, Math.min(H - 1, y)) * W + Math.max(0, Math.min(W - 1, x))];
  const sob = (g, x, y) => { const gx = gr(g, x + 1, y - 1) + 2 * gr(g, x + 1, y) + gr(g, x + 1, y + 1) - gr(g, x - 1, y - 1) - 2 * gr(g, x - 1, y) - gr(g, x - 1, y + 1);
    const gy = gr(g, x - 1, y + 1) + 2 * gr(g, x, y + 1) + gr(g, x + 1, y + 1) - gr(g, x - 1, y - 1) - 2 * gr(g, x, y - 1) - gr(g, x + 1, y - 1); return Math.hypot(gx, gy); };
  const A = [], B = [];
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    // à l'intérieur des DEUX silhouettes, loin du bord (le bord du vêtement n'est pas une couture)
    let dedans = true; for (let j = -2; j <= 2 && dedans; j++) for (let i = -2; i <= 2; i++) { const q = (y + j) * W + x + i; if (!a.m[q] || !b.m[q]) { dedans = false; break; } }
    if (!dedans) continue;
    A.push(sob(a.g, x, y)); B.push(sob(b.g, x, y));
  }
  const n = A.length; if (n < 200) return 0;
  const ma = A.reduce((s2, v) => s2 + v, 0) / n, mb = B.reduce((s2, v) => s2 + v, 0) / n;
  let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < n; i++) { const da = A[i] - ma, db = B[i] - mb; sab += da * db; saa += da * da; sbb += db * db; }
  return sab / Math.sqrt(saa * sbb || 1);
}
async function controlerStructure(glb, photos, options){
  if (!photos || !photos.devant || !photos.dos) return { indisponible: true };
  const { mesurerAngles } = require('./rendu-boutique');
  const { masquePhoto } = require('./projection3d');
  const m = await mesurerAngles(glb, 0, [0, 180], { images: true, brut: true });
  if (!m) return { indisponible: true };
  const W2 = 120, H2 = 160, out = {};
  [['devant', 0], ['dos', 1]].forEach(([nom, i]) => {
    const r = m[i].brut, ph = photos[nom], pm = masquePhoto(ph).m;
    const lum = (d, k, bgr) => bgr ? 0.299 * d[k * 4 + 2] + 0.587 * d[k * 4 + 1] + 0.114 * d[k * 4] : 0.299 * d[k * 4] + 0.587 * d[k * 4 + 1] + 0.114 * d[k * 4 + 2];
    const fondR = (k) => { const d = r.data, B = d[k * 4], G = d[k * 4 + 1], R = d[k * 4 + 2]; return R > G + 40 && B > G + 40 && Math.abs(R - B) < 60; };
    const a = grisRecadre((k) => lum(r.data, k, true), r.w, r.h, fondR, W2, H2);
    const b = grisRecadre((k) => lum(ph.data, k, false), ph.w, ph.h, (k) => !pm[k], W2, H2);
    if (!a || !b) { out[nom] = null; return; }
    // la luminance de chaque image centrée-réduite dans le vêtement : la lumière seule ne doit pas compter
    [a, b].forEach((x) => { let s2 = 0, n = 0; for (let q = 0; q < x.g.length; q++) if (x.m[q]) { s2 += x.g[q]; n++; } const mu = n ? s2 / n : 0;
      let v = 0; for (let q = 0; q < x.g.length; q++) if (x.m[q]) v += (x.g[q] - mu) * (x.g[q] - mu); const sd = Math.sqrt(v / Math.max(1, n)) || 1;
      for (let q = 0; q < x.g.length; q++) x.g[q] = x.m[q] ? 128 + (x.g[q] - mu) / sd * 32 : 128; });
    out[nom] = { ssim: +ssim(a, b, W2, H2).toFixed(3), contours: +contours(a, b, W2, H2).toFixed(3) };
  });
  if (options && options.images) out.images = m;
  return out;
}

async function tnb(etape, jeton, a, b){
  jeton = String(jeton || '');
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(jeton)) throw new Error('jeton refusé');
  if (etape === 'telecharger') {
    /* Deux sources permises : le modèle BRUT de The New Black (lecture gratuite), et — pour « Refaire la couleur »
       (2026-10-19), quand le lien brut a expiré — le modèle déjà POSÉ, dans notre stockage public R2. `b` est la
       source de repli, essayée si la première ne répond pas. */
    const permise = (x) => { try { const u = new URL(String(x || '')); return u.protocol === 'https:' && /\.glb$/i.test(u.pathname)
      && (u.hostname === 'cloud.thenewblack.ai' || /^pub-[0-9a-f]{32}\.r2\.dev$/.test(u.hostname)) ? u.href : null; } catch (e) { return null; } };
    const sources = [permise(a), permise(b)].filter(Boolean);
    if (!sources.length) throw new Error('adresse refusée');
    let buf = null, dernier = '', utilisee = '';
    for (const src of sources) {
      try {
        const r = await fetch(src, { signal: AbortSignal.timeout(180000) });
        if (!r.ok) { dernier = 'téléchargement ' + r.status; continue; }
        buf = Buffer.from(await r.arrayBuffer()); utilisee = src; break;
      } catch (e) { dernier = String((e && e.message) || e); }
    }
    if (!buf) throw new Error(dernier || 'téléchargement impossible');
    if (buf.length > 120 * 1024 * 1024) throw new Error('modèle trop lourd');
    const s = ouvrir(jeton); s.glb = buf;
    return { octets: buf.length, source: utilisee.indexOf('thenewblack') > 0 ? 'tnb' : 'pose' };
  }
  if (etape === 'fermer') { fermer(jeton); return {}; }
  const s = session(jeton);
  if (etape === 'recaler') {
    const pd = depuisDataUrl(a), pb = depuisDataUrl(b);
    if (!pd || !pb) throw new Error('photos illisibles (PNG ou JPEG attendus)');
    const devant = decoderImage(pd, 1600), dos = decoderImage(pb, 1600);
    if (!devant || !dos) throw new Error('photos illisibles');
    // gardées pour le CONTRÔLE DE STRUCTURE, à la fin (le rendu de face et de dos contre ces photos)
    s.photos = { devant: decoderImage(pd, 640), dos: decoderImage(pb, 640) };
    // les textures du modèle, décodées ici (le fil n'a pas nativeImage)
    const { io } = await outils();
    const doc = await io.readBinary(new Uint8Array(s.glb));
    const mat = doc.getRoot().listMaterials()[0];
    const tc = mat && mat.getBaseColorTexture();
    if (!tc) throw new Error('modèle sans texture de couleur');
    const tex = decoderImage(tc.getImage(), 2048);
    const nt = mat.getNormalTexture();
    const normale = nt ? decoderImage(nt.getImage(), 1024) : null;
    const glb = s.glb.buffer.slice(s.glb.byteOffset, s.glb.byteOffset + s.glb.byteLength);
    s.glb = null;
    return demander(s, 'preparer', { glb, tex, normale, devant, dos }, [glb]);
  }
  if (etape === 'projeter') return demander(s, 'projeter');
  if (etape === 'aplanir') return demander(s, 'aplanir');
  if (etape === 'couleur') {
    const r = await demander(s, 'couleur');
    let rendu = null;
    try { rendu = await verifierAuRendu(s, r.reference); } catch (e) { rendu = { indisponible: true, detail: String((e && e.message) || e).slice(0, 200) }; }
    return Object.assign(r, { rendu });
  }
  if (etape === 'compresser') {
    const t = await demander(s, 'textures');
    const texImage = versNative(t.tex).toJPEG(85), normaleImage = t.normale ? versNative(t.normale).toJPEG(90) : null;
    const r = await demander(s, 'ecrire', { texImage, normaleImage });
    s.glbFinal = Buffer.from(r.glb);
    return { octets: s.glbFinal.length, sommets: r.sommets, triangles: r.triangles, sommetsAvant: r.sommetsAvant };
  }
  if (etape === 'controler') {
    const r = await demander(s, 'controler');
    const vg = versNative(r.vignette, true).toPNG();
    const glb = s.glbFinal, photos = s.photos;
    fermer(jeton);
    if (!glb) throw new Error('modèle non compressé');
    if (glb.length > 5.5 * 1024 * 1024) throw new Error('modèle compressé encore trop lourd (' + Math.round(glb.length / 1048576) + ' Mo)');
    let structure = null;
    try { structure = await controlerStructure(glb, photos); } catch (e) { structure = { indisponible: true, detail: String((e && e.message) || e).slice(0, 200) }; }
    return { avant: r.avant, apres: r.apres, structure, vignette: 'data:image/png;base64,' + vg.toString('base64'),
      glb: 'data:model/gltf-binary;base64,' + glb.toString('base64'), octets: glb.length };
  }
  throw new Error('étape inconnue');
}

module.exports = { compresserGlb, outils, simplifierPrimitive, tnb, controlerStructure };
