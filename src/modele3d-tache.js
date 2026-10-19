'use strict';

/*
 * LE FIL DE L'APERÇU 3D (2026-10-18) — le travail lourd, HORS du processus principal.
 * =============================================================================
 * Simplifier un modèle de 1,5 million de triangles, rastériser 4 millions de
 * texels, étaler un écart de ton sur 60 000 sommets : une dizaine de secondes de
 * calcul. Dans le processus principal, toute l'application serait figée pendant
 * ce temps (fenêtres, menus). Ici, dans un fil à part, elle reste vivante.
 * Les images, elles, se décodent et s'encodent dans le processus principal
 * (nativeImage d'Electron, inaccessible d'un fil) : il nous les passe en RVBA.
 *
 * Messages (une session = un fil) :
 *   preparer { glb, tex, normale, devant, dos } → { sens, recalage, avant }        (étape 4)
 *   projeter                                    → { couverture, gainsDos }         (étape 5)
 *   couleur                                     → { reference, avant, apres, … }   (étape 6)
 *   textures                                    → { tex, normale } (RVBA, à encoder)
 *   ecrire { texImage, normaleImage }           → { glb, sommets, triangles }      (étape 7)
 *   controler                                   → { avant, apres, vignette (RVBA) } (étape 8)
 */

const { parentPort, isMainThread } = require('worker_threads');
const { outils, simplifierPrimitive } = require('./modele3d-outils');
const P = require('./projection3d');

let S = null;   // { doc, prim, mat, etat, ext, io }

const CIBLE_SOMMETS = 120000;

async function preparer(m){
  const { io, ext, MeshoptSimplifier } = await outils();
  const doc = await io.readBinary(new Uint8Array(m.glb));
  const r = doc.getRoot();
  const prims = []; r.listMeshes().forEach((me) => me.listPrimitives().forEach((p) => prims.push(p)));
  if (prims.length !== 1) throw new Error('modèle à ' + prims.length + ' parties (une seule attendue)');
  const prim = prims[0];
  const nv = prim.getAttribute('POSITION').getCount();
  simplifierPrimitive(doc, prim, Math.min(1, CIBLE_SOMMETS / nv), MeshoptSimplifier);
  const uvA = prim.getAttribute('TEXCOORD_0');
  if (!uvA) throw new Error('modèle sans coordonnées de texture');
  const maillage = { pos: prim.getAttribute('POSITION').getArray(), nor: prim.getAttribute('NORMAL') ? prim.getAttribute('NORMAL').getArray() : null,
    uv: uvA.getArray(), idx: prim.getIndices().getArray() };
  const etat = P.preparer(maillage, m.tex, m.devant, m.dos, { normale: m.normale || null });
  S = { doc, prim, mat: prim.getMaterial(), etat, io, ext, sommetsAvant: nv };
  return { sens: etat.sens, recalage: { devant: arrondir(etat.recalage.devant), dos: arrondir(etat.recalage.dos) }, avant: etat.avant };
}
const arrondir = (c) => c ? { iou: +c.iou.toFixed(3), sx: +c.sx.toFixed(4), sy: +c.sy.toFixed(4) } : null;

/* (7) L'ÉCRITURE : les textures encodées par le processus principal, la matière MATE (le suède n'est pas du
   plastique : plus de carte métal/rugosité, métal 0, rugosité 0,85), le modèle TOURNÉ pour que le devant regarde
   la caméra de la boutique (+Z : <model-viewer> s'ouvre de face), puis Draco. */
async function ecrire(m){
  const { doc, prim, mat, etat, io, ext } = S;
  const r = doc.getRoot();
  const tc = mat.getBaseColorTexture();
  if (tc && m.texImage) tc.setImage(new Uint8Array(m.texImage)).setMimeType('image/jpeg');
  const nt = mat.getNormalTexture();
  if (nt && m.normaleImage) nt.setImage(new Uint8Array(m.normaleImage)).setMimeType('image/jpeg');
  const mr = mat.getMetallicRoughnessTexture();
  mat.setMetallicRoughnessTexture(null);
  if (mr && !mr.listParents().some((p) => p !== r)) mr.dispose();
  const oc = mat.getOcclusionTexture && mat.getOcclusionTexture();
  if (oc && oc === mr) mat.setOcclusionTexture(null);
  mat.setMetallicFactor(0).setRoughnessFactor(0.85);
  // la rotation autour de Y : le devant (sens.devant) vers +Z
  const f = etat.sens.devant, a = -Math.atan2(f[0], f[2]), ca = Math.cos(a), sa = Math.sin(a);
  for (const sem of ['POSITION', 'NORMAL']) {
    const acc = prim.getAttribute(sem); if (!acc) continue;
    const arr = acc.getArray().slice();
    for (let i = 0; i < arr.length; i += 3) { const x = arr[i], z = arr[i + 2]; arr[i] = x * ca + z * sa; arr[i + 2] = -x * sa + z * ca; }
    acc.setArray(arr);
  }
  doc.createExtension(ext.KHRDracoMeshCompression).setRequired(true)
    .setEncoderOptions({ method: ext.KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER });
  const glb = await io.writeBinary(doc);
  return { glb: glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), sommets: prim.getAttribute('POSITION').getCount(),
    triangles: prim.getIndices().getCount() / 3, sommetsAvant: S.sommetsAvant };
}

function vignette(){
  const { etat } = S, v = P.vue(etat.maillage, etat.vues[0].v.d, 512);
  const col = P.couleurVue(v, etat.maillage, etat.tex);
  return { w: v.W, h: v.H, data: col };
}

/* Le traitement d'un message — le même, qu'il tourne dans le fil (cas normal) ou, en REPLI, dans le processus
   principal (si le fil n'a pas pu démarrer : on le dit dans le journal, et l'application ne fait que ralentir). */
async function traiter(m){
  if (m.type === 'preparer') return { r: await preparer(m) };
  if (!S) throw new Error('session absente');
  if (m.type === 'projeter') return { r: P.projeterPhotos(S.etat) };
  if (m.type === 'couleur') return { r: P.couleurFidele(S.etat) };
  if (m.type === 'textures') {
    const t = S.etat.tex, n = S.etat.o.normale;
    return { r: { tex: { w: t.w, h: t.h, data: t.data }, normale: n ? { w: n.w, h: n.h, data: n.data } : null } };
  }
  if (m.type === 'ecrire') { const r = await ecrire(m); return { r, transfert: [r.glb] }; }
  if (m.type === 'controler') return { r: Object.assign({ vignette: vignette() }, P.controler(S.etat)) };
  throw new Error('message inconnu ' + m.type);
}

if (!isMainThread && parentPort) {
  parentPort.on('message', async (m) => {
    try { const o = await traiter(m); parentPort.postMessage({ id: m.id, ok: true, r: o.r }, o.transfert || []); }
    catch (e) { parentPort.postMessage({ id: m.id, ok: false, erreur: String((e && e.message) || e).slice(0, 300) }); }
  });
}

// En repli (processus principal), une session à la fois par module : on en fabrique une par appel de `local()`.
function local(){
  // une copie fraîche du module : son état S est propre à cette session
  const chemin = require.resolve(__filename);
  delete require.cache[chemin];
  const mod = require(chemin);
  delete require.cache[chemin];
  return mod;
}
module.exports = { traiter, local };
