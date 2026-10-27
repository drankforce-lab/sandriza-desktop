'use strict';

/*
 * LES BULLES DU SITE, DESSINÉES EN NATIF (2026-10-27)
 * =============================================================================
 * Sa remarque : « depuis la version 8.7.0 j'ai un message d'erreur à l'ouverture
 * sous forme d'ancien toast web qui se cache derrière le tableau de bord » — puis
 * « il n'est plus censé avoir ce genre d'erreur sous cette forme ».
 *
 * ⚠ LA CAUSE N'ÉTAIT PAS L'ORDRE DES VUES, C'ÉTAIT LA COUCHE. Le SITE est sous le
 * cadre PAR CONSTRUCTION (main.js, « LA BASCULE ») : tout ce qu'il dessine est
 * caché, et c'est voulu. `Toast.show` dessinait donc ses erreurs dans une vue que
 * personne ne voit — sauf le temps d'un éclair à l'ouverture, avant que le
 * tableau de bord ne se pose dessus. Remonter le tableau de bord « sous tout »
 * n'aurait rien changé : c'est la page entière qui est dessous.
 * ➡ Dans l'application, `Toast.show` (app.js) remet ses erreurs et ses
 *   avertissements ICI, et ne dessine plus rien dans la page. Les confirmations
 *   (succès, info) n'étaient déjà jamais vues : elles restent muettes, comme avant.
 *
 * ⚠ UNE FENÊTRE FILLE DE LA PRINCIPALE, PAS « TOUJOURS DEVANT ». Elle passe au-
 * dessus du tableau de bord et des vues ancrées, suit la fenêtre principale, mais
 * ne se pose pas sur les autres logiciels. Elle ne prend JAMAIS le focus.
 *
 * ⚠ CHAQUE BULLE EST INSCRITE DANS `bulles.log` (dossier de l'application) : une
 * erreur d'ouverture qu'on n'a pas eu le temps de lire se relit là — et c'est la
 * trace qui manquait pour savoir laquelle s'affichait derrière le tableau de bord.
 */

const { BrowserWindow, app } = require('electron');
const fs = require('fs');
const path = require('path');

const LARG = 380, HAUT = 64, ECART = 8, MARGE = 16, MAX = 3;
const pile = [];   // la plus récente en tête (= en bas)

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Le site écrit parfois du HTML dans ses bulles (<b>, <br>) : on n'en garde que le texte.
const texte = (s) => String(s == null ? '' : s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim().slice(0, 300);

const journal = (type, msg) => {
  try {
    const f = path.join(app.getPath('userData'), 'bulles.log');
    try { if (fs.statSync(f).size > 256 * 1024) fs.renameSync(f, f + '.1'); } catch {}
    fs.appendFileSync(f, new Date().toISOString() + '  ' + (type || 'info') + '  ' + msg + '\n');
  } catch {}
};

let parentCourant = null;
function placer() {
  const p = parentCourant;
  if (!p || p.isDestroyed()) return;
  let b;
  try { b = p.getContentBounds(); } catch { return; }
  pile.forEach((w, i) => {
    try {
      if (!w.isDestroyed()) w.setBounds({ x: b.x + b.width - LARG - MARGE,
        y: b.y + b.height - MARGE - (HAUT + ECART) * (i + 1) + ECART, width: LARG, height: HAUT });
    } catch {}
  });
}

function page(type, msg, sombre) {
  const err = type === 'error';
  const fond = sombre ? '#151c28' : '#ffffff', encre = sombre ? '#e8edf5' : '#1d2330', bord = sombre ? '#2a3446' : '#d7dce4';
  const accent = err ? (sombre ? '#f87171' : '#c62828') : (sombre ? '#fbbf24' : '#a15c00');
  return '<!doctype html><html><head><meta charset="utf-8"><title>bulle</title><style>'
    + '*{box-sizing:border-box}html,body{margin:0;height:100%;background:transparent;overflow:hidden;'
    + 'font:13px/1.35 "Segoe UI",system-ui,sans-serif;color:' + encre + ';user-select:none}'
    + '.c{position:absolute;inset:0;display:flex;align-items:center;gap:10px;padding:8px 34px 8px 12px;border-radius:8px;'
    + 'background:' + fond + ';border:1px solid ' + bord + ';box-shadow:inset 3px 0 0 ' + accent + '}'
    + '.i{flex:0 0 auto;width:18px;height:18px;border-radius:99px;background:' + accent + ';color:' + fond + ';'
    + 'display:grid;place-items:center;font-weight:800;font-size:12px}'
    + '.t{flex:1 1 auto;min-width:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
    + '.x{position:absolute;top:6px;right:8px;width:22px;height:22px;border-radius:5px;display:grid;place-items:center;cursor:pointer;opacity:.7}'
    + '.x:hover{opacity:1;background:rgba(127,127,127,.18)}'
    + '</style></head><body><div class="c" role="alert"><span class="i">' + (err ? '!' : '!') + '</span>'
    + '<span class="t">' + esc(msg) + '</span><span class="x" id="x">×</span></div>'
    + '<script>document.getElementById("x").onclick=function(){document.title="fermer"};'
    + 'document.body.onmouseenter=function(){document.title="garde"};document.body.onmouseleave=function(){document.title="libre"};'
    + '</script></body></html>';
}

/**
 * @param {BrowserWindow} parent  la fenêtre principale
 * @param {string} type  'error' | 'warning'
 * @param {string} message
 * @param {boolean} sombre
 */
function montrer(parent, type, message, sombre) {
  const msg = texte(message);
  if (!msg) return false;
  journal(type, msg);
  if (!parent || parent.isDestroyed() || !parent.isVisible()) return true;   // inscrite, rien à poser
  try {
    // La même bulle déjà à l'écran : on la prolonge au lieu d'en empiler une seconde.
    const meme = pile.find((w) => !w.isDestroyed() && w._szMsg === msg);
    if (meme) { meme._szArmer(); return true; }
    parentCourant = parent;
    while (pile.length >= MAX) { const v = pile.pop(); try { v.close(); } catch {} }
    const w = new BrowserWindow({
      parent, width: LARG, height: HAUT, frame: false, transparent: true, resizable: false, movable: false,
      minimizable: false, maximizable: false, fullscreenable: false, skipTaskbar: true,
      focusable: false, show: false, hasShadow: false,
      webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
    });
    w._szMsg = msg;
    pile.unshift(w);
    placer();
    let minuterie = null;
    const duree = type === 'error' ? 7000 : 5000;
    w._szArmer = () => { clearTimeout(minuterie); minuterie = setTimeout(() => { try { if (!w.isDestroyed()) w.close(); } catch {} }, duree); };
    w.webContents.on('page-title-updated', (e, t) => {
      if (t === 'fermer') { try { w.close(); } catch {} }
      else if (t === 'garde') clearTimeout(minuterie);
      else if (t === 'libre') w._szArmer();
    });
    w.webContents.on('will-navigate', (e) => e.preventDefault());
    w.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    w.once('ready-to-show', () => { try { w.showInactive(); } catch {} w._szArmer(); });
    w.on('closed', () => {
      clearTimeout(minuterie);
      const i = pile.indexOf(w); if (i >= 0) pile.splice(i, 1);
      placer();
    });
    w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page(type, msg, sombre))).catch(() => {});
    if (!parent._szBullesSuivies) {
      parent._szBullesSuivies = true;
      ['move', 'resize', 'maximize', 'unmaximize', 'restore'].forEach((ev) => parent.on(ev, placer));
    }
    return true;
  } catch { return false; }
}

module.exports = { montrer, texte };
