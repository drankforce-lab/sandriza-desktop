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

let _outils = null;
async function outils(){
  if (_outils) return _outils;
  const core = require('@gltf-transform/core');
  const ext = require('@gltf-transform/extensions');
  const { MeshoptSimplifier } = require('meshoptimizer');
  const draco3d = require('draco3dgltf');
  await MeshoptSimplifier.ready;
  const io = new core.NodeIO().registerExtensions(ext.ALL_EXTENSIONS).registerDependencies({
    'draco3d.encoder': await draco3d.createEncoderModule(),
    'draco3d.decoder': await draco3d.createDecoderModule(),
  });
  _outils = { io, ext, MeshoptSimplifier };
  return _outils;
}

// Une texture ramenée à `cote` px au plus, en JPEG. Une image illisible est laissée telle quelle.
function reduireTexture(octets, cote){
  const im = nativeImage.createFromBuffer(Buffer.from(octets));
  if (im.isEmpty()) return null;
  const t = im.getSize();
  const r = Math.min(1, cote / Math.max(t.width, t.height));
  const petit = r < 1 ? im.resize({ width: Math.round(t.width * r), height: Math.round(t.height * r), quality: 'best' }) : im;
  return petit.toJPEG(82);
}

/* ⚠ PAS DE @gltf-transform/functions : il tire ndarray-pixels → sharp, qui n'a pas de binaire pour
   Windows ARM et fait planter le chargement. La simplification se fait donc ici, avec meshoptimizer :
   nouveaux indices, puis on ne garde que les sommets encore utilisés (tous les attributs suivent). */
function simplifierPrimitive(doc, prim, ratio, Simp){
  const pos = prim.getAttribute('POSITION'), idx = prim.getIndices();
  if (!pos || !idx || ratio >= 1) return;
  const P = pos.getArray(), I = idx.getArray();
  const cible = Math.max(3, Math.floor(I.length * ratio / 3) * 3);
  const [neufs] = Simp.simplify(new Uint32Array(I), new Float32Array(P), 3, cible, 0.002);
  if (!neufs || !neufs.length) return;
  // Compactage : les sommets encore cités, renumérotés.
  const remap = new Int32Array(pos.getCount()).fill(-1); let n = 0;
  for (let k = 0; k < neufs.length; k++) { const v = neufs[k]; if (remap[v] < 0) remap[v] = n++; }
  for (const sem of prim.listSemantics()) {
    const a = prim.getAttribute(sem), src = a.getArray(), sz = a.getElementSize();
    const dst = new src.constructor(n * sz);
    for (let v = 0; v < remap.length; v++) { const w = remap[v]; if (w < 0) continue; for (let c = 0; c < sz; c++) dst[w * sz + c] = src[v * sz + c]; }
    const neuf = doc.createAccessor().setType(a.getType()).setArray(dst).setNormalized(a.getNormalized()).setBuffer(a.getBuffer());
    prim.setAttribute(sem, neuf);
    if (!a.listParents().some((p) => p !== doc.getRoot())) a.dispose();
  }
  const out = new Uint32Array(neufs.length); for (let k = 0; k < neufs.length; k++) out[k] = remap[neufs[k]];
  const ni = doc.createAccessor().setType('SCALAR').setArray(out).setBuffer(idx.getBuffer());
  prim.setIndices(ni);
  if (!idx.listParents().some((p) => p !== doc.getRoot())) idx.dispose();
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

module.exports = { compresserGlb };
