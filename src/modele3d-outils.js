'use strict';

/*
 * LES OUTILS GLB SANS ELECTRON (2026-10-18) — lecture/écriture (gltf-transform, Draco) et simplification
 * (meshoptimizer). Séparés de modele3d.js parce que le FIL de la projection (modele3d-tache.js) ne peut pas
 * charger `electron` : un fil de travail n'y a pas accès.
 */

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


/* ⚠ PAS DE @gltf-transform/functions : il tire ndarray-pixels → sharp, qui n'a pas de binaire pour
   Windows ARM et fait planter le chargement. La simplification se fait donc ici, avec meshoptimizer :
   nouveaux indices, puis on ne garde que les sommets encore utilisés (tous les attributs suivent). */
function simplifierPrimitive(doc, prim, ratio, Simp){
  const pos = prim.getAttribute('POSITION'), idx = prim.getIndices();
  if (!pos || !idx || ratio >= 1) return;
  const P = pos.getArray(), I = idx.getArray();
  const cible = Math.max(3, Math.floor(I.length * ratio / 3) * 3);
  /* ⚠ LES BORDURES VERROUILLÉES (2026-10-20, sa capture : « il a inventé des trous dans le vêtement »). Un modèle texturé
     porte ses coutures de texture en sommets DÉDOUBLÉS : vus par la simplification, ce sont des bords ouverts, qu elle
     déplaçait chacun de son côté — la couture s ouvrait en fente. « LockBorder » les garde en place. */
  const [neufs] = Simp.simplify(new Uint32Array(I), new Float32Array(P), 3, cible, 0.002, ['LockBorder']);
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


module.exports = { outils, simplifierPrimitive };
