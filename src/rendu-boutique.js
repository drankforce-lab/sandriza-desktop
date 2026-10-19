'use strict';

/*
 * LA COULEUR MESURÉE AU RENDU DE LA BOUTIQUE (2026-10-19)
 * =============================================================================
 * Sa plainte : « la couleur du devant et du derrière n'est pas pareille dans
 * l'aperçu 3D, tu devais rester fidèle à UNE teinte, celle de la photo
 * principale ». Une couleur ne se déduit pas de la texture : elle se mesure là
 * où la cliente la voit. On rend donc le modèle avec EXACTEMENT les réglages de
 * la boutique (shop.js : <model-viewer> 3.5.0, tonalité « neutral », exposition
 * 0,78, ombre 1, élévation 80°, environnement par défaut) dans une fenêtre
 * CACHÉE, hors écran, sous N angles, et on lit la teinte médiane du torse.
 *
 * ⚠ LE FOND EST MAGENTA PUR : aucun vêtement ne l'est, et l'ombre portée reste
 *   magenta (assombri) — le détourage du rendu est sûr.
 * ⚠ LE TORSE, PAS LA SILHOUETTE : 28 % à 55 % de la hauteur, le tiers central de
 *   la largeur — ni le col, ni l'ourlet, ni le bord (où l'éclairage rasant
 *   assombrit tout vêtement, quelle que soit sa teinte).
 * ⚠ SANS RÉSEAU, PAS DE MESURE (le script vient d'unpkg, comme à la boutique) :
 *   on rend `null`, et l'étape le DIT au lieu de prétendre avoir vérifié.
 */

const http = require('http');
const { BrowserWindow } = require('electron');
const { medianeGroupe } = require('./projection3d');

const L = 480, H = 640;
const PAGE = (fond, L, H) => '<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:' + (fond || '#ff00ff') + ';overflow:hidden">'
  + '<script type="module" src="https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js"></script>'
  + '<model-viewer id="mv" style="width:' + L + 'px;height:' + H + 'px;background:transparent;--poster-color:transparent"'
  + ' camera-orbit="0deg 80deg auto" disable-zoom disable-pan shadow-intensity="1" tone-mapping="neutral" exposure="0.78"'
  + ' interaction-prompt="none"></model-viewer></body></html>';

const estFond = (r, g, b) => r > g + 40 && b > g + 40 && Math.abs(r - b) < 60;

// La teinte du torse dans une capture (BGRA de nativeImage).
function teinteTorse(bmp, w, h){
  let x0 = w, x1 = -1, y0 = h, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (estFond(bmp[i + 2], bmp[i + 1], bmp[i])) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (x1 < 0) return null;
  const bh = y1 - y0, bw = x1 - x0, cx = (x0 + x1) / 2, px = [];
  for (let y = Math.round(y0 + bh * 0.28); y <= Math.round(y0 + bh * 0.55); y++) for (let x = Math.round(cx - bw * 0.16); x <= Math.round(cx + bw * 0.16); x++) {
    const i = (y * w + x) * 4;
    if (estFond(bmp[i + 2], bmp[i + 1], bmp[i])) continue;
    px.push(bmp[i + 2], bmp[i + 1], bmp[i]);
  }
  if (px.length < 300) return null;
  return medianeGroupe(px).map(Math.round);
}

/** Rend le GLB (Buffer) sous `angles` (degrés, autour du devant `theta0`) ; rend [{ a, rgb, png? }] ou null. */
async function mesurerAngles(glb, theta0, angles, options){
  // images : le PNG de chaque angle ; brut : la capture en BGRA (contrôle de structure) ; fond : une autre couleur que
  // le magenta (une planche) — la teinte du torse n'est alors plus mesurée
  // phi : l'élévation de la caméra (80° = celle de la boutique ; 90° = à l'horizontale, comme l'appareil des photos)
  const o = Object.assign({ images: false, brut: false, fond: '', L: L, H: H, phi: 80 }, options || {});
  const srv = http.createServer((q, r) => {
    if (q.url.indexOf('/m.glb') === 0) { r.writeHead(200, { 'Content-Type': 'model/gltf-binary', 'Cache-Control': 'no-store' }); r.end(glb); return; }
    r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); r.end(PAGE(o.fond, o.L, o.H));
  });
  await new Promise((ok, ko) => { srv.once('error', ko); srv.listen(0, '127.0.0.1', ok); });
  const port = srv.address().port;
  const w = new BrowserWindow({ show: false, width: o.L, height: o.H, useContentSize: true, skipTaskbar: true,
    webPreferences: { offscreen: true, contextIsolation: true, sandbox: true, nodeIntegration: false } });
  try {
    w.webContents.setFrameRate(30);
    await w.loadURL('http://127.0.0.1:' + port + '/');
    const ex = (js) => w.webContents.executeJavaScript(js, true);
    const pret = await ex('Promise.race([customElements.whenDefined("model-viewer").then(function(){ return new Promise(function(ok){ var mv = document.getElementById("mv");'
      + ' mv.addEventListener("load", function(){ var m = (mv.model && mv.model.materials) || []; if (m.some(function(x){ return /^sz-photo/.test(x.name || ""); })) mv.exposure = 1; ok(true); }, { once: true }); mv.addEventListener("error", function(){ ok(false); }, { once: true }); mv.src = "/m.glb?t=' + Date.now() + '"; }); }),'
      + ' new Promise(function(ok){ setTimeout(function(){ ok(false); }, 60000); })])');
    if (!pret) return null;
    const out = [];
    for (const a of angles) {
      await ex('(async function(){ var mv = document.getElementById("mv"); mv.cameraOrbit = "' + (theta0 + a).toFixed(2) + 'deg ' + o.phi + 'deg auto"; mv.jumpCameraToGoal();'
        + ' await new Promise(function(ok){ requestAnimationFrame(function(){ requestAnimationFrame(ok); }); }); })()');
      await new Promise((ok) => setTimeout(ok, 450));
      const im = await w.webContents.capturePage();
      const t = im.getSize(), bmp = im.toBitmap();
      const rgb = o.fond ? [0, 0, 0] : teinteTorse(bmp, t.width, t.height);
      out.push(Object.assign({ a, rgb }, o.images ? { png: im.toPNG() } : {}, o.brut ? { brut: { w: t.width, h: t.height, data: bmp } } : {}));
    }
    return out.every((x) => x.rgb) ? out : null;
  } finally {
    try { w.destroy(); } catch (e) {}
    try { srv.close(); } catch (e) {}
  }
}

/* ⚠⚠ LA LUMIÈRE DE LA BOUTIQUE N'EST PAS LA MÊME TOUT AUTOUR (mesuré le 2026-10-19 sur la Walla) : le MÊME modèle,
   texture UNIE, rendu sous 8 angles, varie jusqu'à ΔE 11,7 (le dos et le trois-quarts arrière sont dans l'ombre de
   l'environnement de <model-viewer>, qui ne tourne pas avec la caméra). Comparer les angles entre eux mesurerait
   donc la LUMIÈRE, pas la texture — et aucune texture honnête ne passerait sous ΔE 3.
   ➡ La TEINTE d'un angle se lit contre le même modèle peint d'une seule couleur, rendu sous le même angle : leur
   écart Lab est la part de la TEXTURE. L'uniformité = le plus grand écart entre cette part et celle de la face ;
   la fidélité = la face rendue contre la photo du devant. */
function comparerTeinte(mTex, mUni, reference, lab){
  const rel = mTex.map((x, i) => { const A = lab(x.rgb), B = lab(mUni[i].rgb); return [A[0] - B[0], A[1] - B[1], A[2] - B[2]]; });
  const angles = mTex.map((x, i) => ({ a: x.a, rgb: x.rgb, unie: mUni[i].rgb,
    dE: +Math.hypot(rel[i][0] - rel[0][0], rel[i][1] - rel[0][1], rel[i][2] - rel[0][2]).toFixed(1) }));
  const F = lab(mTex[0].rgb), R = reference ? lab(reference) : null;
  return { angles, rel, uniformite: Math.max(...angles.map((x) => x.dE)),
    ecartPhoto: R ? +Math.hypot(F[0] - R[0], F[1] - R[1], F[2] - R[2]).toFixed(1) : null };
}

module.exports = { mesurerAngles, teinteTorse, comparerTeinte };
