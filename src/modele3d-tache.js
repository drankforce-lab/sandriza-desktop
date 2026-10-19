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
 *   aplanir                                     → { avant, apres, sommetsAplanis } (étape 6 : le relief inventé)
 *   couleur { correction? }                     → { reference, avant, apres, … }   (étape 6)
 *   apercu { texImage, normaleImage }           → { glb, theta0 } (pour la mesure au rendu de la boutique)
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
/* ⚠⚠ LA MATIÈRE MATE (2026-10-19, sa plainte sur la Walla : « trop lumineux et RÉFLÉCHISSANT sur le devant ») — un
   suède ne brille pas. Rugosité 0,85 laissait un reflet spéculaire (le Fresnel d'un diélectrique, 4 %) que la lumière
   de la boutique allumait sur les plis du devant. Ici : métal 0, rugosité 1, et la RÉFLEXION SPÉCULAIRE COUPÉE
   (KHR_materials_specular, facteur 0 — lu par <model-viewer>) ; toute extension qui ferait briller (vernis, lustre,
   transmission, iridescence) est retirée. Le vêtement ne renvoie plus que sa couleur diffuse. */
function matiereMate(doc, mat, ext){
  const r = doc.getRoot();
  const mr = mat.getMetallicRoughnessTexture();
  if (mr) { mat.setMetallicRoughnessTexture(null); if (!mr.listParents().some((p) => p !== r)) mr.dispose(); }
  const oc = mat.getOcclusionTexture && mat.getOcclusionTexture();
  if (oc && oc === mr) mat.setOcclusionTexture(null);
  mat.setMetallicFactor(0).setRoughnessFactor(1);
  for (const n of ['KHR_materials_clearcoat', 'KHR_materials_sheen', 'KHR_materials_ior', 'KHR_materials_transmission',
    'KHR_materials_iridescence', 'KHR_materials_volume', 'KHR_materials_anisotropy', 'KHR_materials_emissive_strength']) {
    try { mat.setExtension(n, null); } catch (e) {}
  }
  try { mat.setEmissiveFactor([0, 0, 0]); mat.setEmissiveTexture(null); } catch (e) {}
  try { mat.setExtension('KHR_materials_specular', null); } catch (e) {}
  /* ⚠⚠ NON ÉCLAIRÉ (2026-10-19, ses captures images\97.png et 98.png : une ligne pointillée au dos, des lueurs sur les
     plis du devant). Même mate, la matière recevait la lumière de la boutique PAR-DESSUS celle des photos : chaque pli
     sculpté par The New Black s'éclairait ou s'ombrait une seconde fois. En KHR_materials_unlit, <model-viewer> affiche
     la texture TELLE QUELLE : les photos, avec leur vraie lumière ; ailleurs, l'ombrage doux cuit au poste
     (projection3d.ombrageDoux). La carte de normales ne sert plus à rien : elle part (le modèle s'allège d'autant).
     Le NOM de la matière dit à la boutique de ne plus assombrir (exposition 1 — shop.js et rendu-boutique.js). */
  const nt = mat.getNormalTexture();
  if (nt) { mat.setNormalTexture(null); if (!nt.listParents().some((p) => p !== r)) nt.dispose(); }
  mat.setExtension('KHR_materials_unlit', doc.createExtension(ext.KHRMaterialsUnlit).createUnlit());
  mat.setName('sz-photo-unlit');
}
async function ecrire(m){
  const { doc, prim, mat, etat, io, ext } = S;
  const r = doc.getRoot();
  const tc = mat.getBaseColorTexture();
  if (tc && m.texImage) tc.setImage(new Uint8Array(m.texImage)).setMimeType('image/jpeg');
  const nt = mat.getNormalTexture();
  if (nt && m.normaleImage) nt.setImage(new Uint8Array(m.normaleImage)).setMimeType('image/jpeg');
  matiereMate(doc, mat, ext);
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

/* L'APERÇU POUR LA MESURE AU RENDU (2026-10-19) : le modèle tel qu'il est À CET INSTANT (textures du moment, matière
   mate), SANS rotation ni Draco — la rotation, `ecrire` la fera une fois, à la fin ; le rendu, lui, tourne la caméra
   de `theta0` (l'azimut du devant). */
async function apercu(m){
  const { doc, mat, io, etat, ext } = S;
  const tc = mat.getBaseColorTexture();
  if (tc && m.texImage) tc.setImage(new Uint8Array(m.texImage)).setMimeType('image/jpeg');
  const nt = mat.getNormalTexture();
  if (nt && m.normaleImage) nt.setImage(new Uint8Array(m.normaleImage)).setMimeType('image/jpeg');
  matiereMate(doc, mat, ext);
  /* ⚠⚠ TOURNÉ COMME LE MODÈLE FINAL (2026-10-19, mesuré sur la Walla). La lumière de <model-viewer> est FIXE dans la
     scène : un modèle dont le devant regarde +X n'est pas éclairé comme le même modèle tourné vers +Z. Mesuré non
     tourné, l'aperçu disait « uniforme à ΔE 3,8 » et le modèle livré (tourné) sortait à ΔE 12 sur les flancs — les
     corrections de lumière tombaient du mauvais côté. L'aperçu est donc tourné ICI comme `ecrire` le fera (devant vers
     +Z), puis remis tel quel : la caméra part de 0°. */
  const { prim } = S, f = etat.sens.devant, an = -Math.atan2(f[0], f[2]), ca = Math.cos(an), sa = Math.sin(an), garde = [];
  for (const sem of ['POSITION', 'NORMAL']) {
    const acc = prim.getAttribute(sem); if (!acc) continue;
    const orig = acc.getArray(), arr = orig.slice();
    for (let i = 0; i < arr.length; i += 3) { const x = arr[i], z = arr[i + 2]; arr[i] = x * ca + z * sa; arr[i + 2] = -x * sa + z * ca; }
    acc.setArray(arr); garde.push([acc, orig]);
  }
  let glb;
  try { glb = await io.writeBinary(doc); } finally { garde.forEach(([acc, orig]) => acc.setArray(orig)); }
  return { glb: glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength), theta0: 0 };
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
  if (m.type === 'aplanir') return { r: P.aplanirRelief(S.etat) };
  if (m.type === 'couleur') return { r: P.couleurFidele(S.etat, m.correction || null) };
  if (m.type === 'apercu') { const r = await apercu(m); return { r, transfert: [r.glb] }; }
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
