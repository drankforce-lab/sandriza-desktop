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
     5 projeter · 6 couleur          — dans le fil (projection3d.js) ;
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

async function tnb(etape, jeton, a, b){
  jeton = String(jeton || '');
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(jeton)) throw new Error('jeton refusé');
  if (etape === 'telecharger') {
    const u = new URL(String(a || ''));
    if (u.protocol !== 'https:' || u.hostname !== 'cloud.thenewblack.ai' || !/\.glb$/i.test(u.pathname)) throw new Error('adresse refusée');
    const r = await fetch(u.href, { signal: AbortSignal.timeout(180000) });
    if (!r.ok) throw new Error('téléchargement ' + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 120 * 1024 * 1024) throw new Error('modèle trop lourd');
    const s = ouvrir(jeton); s.glb = buf;
    return { octets: buf.length };
  }
  if (etape === 'fermer') { fermer(jeton); return {}; }
  const s = session(jeton);
  if (etape === 'recaler') {
    const pd = depuisDataUrl(a), pb = depuisDataUrl(b);
    if (!pd || !pb) throw new Error('photos illisibles (PNG ou JPEG attendus)');
    const devant = decoderImage(pd, 1600), dos = decoderImage(pb, 1600);
    if (!devant || !dos) throw new Error('photos illisibles');
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
  if (etape === 'couleur') return demander(s, 'couleur');
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
    const glb = s.glbFinal;
    fermer(jeton);
    if (!glb) throw new Error('modèle non compressé');
    if (glb.length > 5.5 * 1024 * 1024) throw new Error('modèle compressé encore trop lourd (' + Math.round(glb.length / 1048576) + ' Mo)');
    return { avant: r.avant, apres: r.apres, vignette: 'data:image/png;base64,' + vg.toString('base64'),
      glb: 'data:model/gltf-binary;base64,' + glb.toString('base64'), octets: glb.length };
  }
  throw new Error('étape inconnue');
}

module.exports = { compresserGlb, outils, simplifierPrimitive, tnb };
