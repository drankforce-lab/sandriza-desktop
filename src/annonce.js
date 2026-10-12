'use strict';

/*
 * L'ANNONCE D'UNE NOUVELLE COMMANDE — la carte qui glisse en bas à droite
 * =============================================================================
 * Sa demande du 2026-10-12 : « j'ai bien aimé le style d'annonce que tu as fait,
 * mais j'aimerais les recevoir via mon veilleur ». C'est la carte de la démo du
 * tableau de bord — la photo de l'article, « Nouvelle commande · 196,00 $ », la
 * cliente et l'article — dessinée ici, dans une petite fenêtre SANS CADRE,
 * toujours au premier plan, qui ne prend JAMAIS le focus (on ne vole pas le
 * clavier de quelqu'un qui tape).
 *
 * ⚠ C'EST LE VEILLEUR QUI DÉCIDE QUAND L'APPELER, et seulement quand une session
 * est ouverte : le détail vient du site (op `veilleur:annonces`), par la même
 * porte que les fenêtres. Hors session, le veilleur garde l'avis Windows d'avant,
 * qui ne porte AUCUNE donnée de cliente (voir l'en-tête de veilleur.js).
 *
 * ⚠ TROIS CARTES AU PLUS, EMPILÉES ; la plus récente en bas. Huit secondes à
 * l'écran, le temps s'arrête tant que la souris est dessus. Un clic ouvre la
 * commande ; × la ferme. La trace reste dans l'historique de l'icône du veilleur.
 *
 * ⚠ La page est une `data:` sans script autorisé à parler au système : elle
 * ne fait que changer son TITRE (« clic », « fermer », « garde », « libre »),
 * que ce module écoute. Aucun pont, aucun préchargement.
 */

const { BrowserWindow, screen } = require('electron');

const LARG = 384, HAUT = 96, ECART = 10, MARGE = 14, DUREE = 8000, MAX = 3;
const pile = [];   // la plus récente en tête (= en bas de l'écran)

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function placer() {
  let wa;
  try { wa = screen.getPrimaryDisplay().workArea; } catch { return; }
  pile.forEach((w, i) => {
    try {
      if (!w.isDestroyed()) w.setBounds({ x: wa.x + wa.width - LARG - MARGE,
        y: wa.y + wa.height - MARGE - (HAUT + ECART) * (i + 1) + ECART, width: LARG, height: HAUT });
    } catch {}
  });
}

/* La carte : thème sombre de l'application, accent or ; la prioritaire porte un filet ambre. */
function page(d) {
  const photo = /^https:\/\//i.test(String(d.image || ''))
    ? '<img src="' + esc(d.image) + '" alt="" referrerpolicy="no-referrer" onerror="this.parentNode.textContent=this.dataset.i" data-i="' + esc(d.initiales || '') + '">'
    : esc(d.initiales || '');
  return '<!doctype html><html><head><meta charset="utf-8"><title>annonce</title><style>'
    + '*{box-sizing:border-box}html,body{margin:0;height:100%;background:transparent;overflow:hidden;'
    + 'font:13px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#e8edf5;user-select:none}'
    + '.c{position:absolute;inset:2px;display:flex;align-items:center;gap:12px;padding:10px 34px 10px 10px;border-radius:14px;cursor:pointer;'
    + 'background:linear-gradient(160deg,#18202e,#111824);border:1px solid rgba(74,222,128,.45);box-shadow:0 10px 26px rgba(0,0,0,.45);'
    + 'animation:entre .45s cubic-bezier(.2,.8,.2,1)}'
    + '.c.prio{border-color:rgba(251,191,36,.6);box-shadow:inset 4px 0 0 #fbbf24,0 10px 26px rgba(0,0,0,.45)}'
    + '.c:hover{border-color:#c9a97e}'
    + '.ph{width:56px;height:70px;flex:0 0 auto;border-radius:9px;overflow:hidden;background:#fff;display:grid;place-items:center;'
    + 'font-weight:800;color:#5a6574;font-size:15px}'
    + '.ph img{width:100%;height:100%;object-fit:cover}'
    + '.t{min-width:0;flex:1 1 auto}.t b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.t .s{color:#a9b6c8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}'
    + '.t .q{color:#8e9cad;font-size:11px;margin-top:4px;display:flex;align-items:center;gap:6px}'
    + '.t .q i{width:7px;height:7px;border-radius:99px;background:#4ade80}'
    + '.x{position:absolute;top:6px;right:8px;width:22px;height:22px;border-radius:6px;display:grid;place-items:center;color:#8e9cad;font-size:15px}'
    + '.x:hover{background:rgba(255,255,255,.08);color:#e8edf5}'
    + 'body.part .c{animation:part .3s ease-in forwards}'
    + '@keyframes entre{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}'
    + '@keyframes part{to{opacity:0;transform:translateX(40px)}}'
    + '@media (prefers-reduced-motion:reduce){.c,body.part .c{animation-duration:.01s}}'
    + '</style></head><body><div class="c' + (d.prioritaire ? ' prio' : '') + '" id="c">'
    + '<span class="ph">' + photo + '</span><div class="t"><b>' + esc(d.titre) + '</b>'
    + '<div class="s">' + esc(d.ligne) + '</div><div class="q"><i></i>' + esc(d.pied) + '</div></div>'
    + '<span class="x" id="x" title="' + esc(d.fermer || '') + '">×</span></div>'
    + '<script>var c=document.getElementById("c");'
    + 'document.getElementById("x").onclick=function(e){e.stopPropagation();document.title="fermer"};'
    + 'c.onclick=function(){document.title="clic"};'
    + 'c.onmouseenter=function(){document.title="garde"};c.onmouseleave=function(){document.title="libre"};'
    + '</script></body></html>';
}

function fermer(w) {
  try {
    if (w.isDestroyed()) return;
    w.webContents.executeJavaScript('document.body.classList.add("part")', true).catch(() => {});
    setTimeout(() => { try { if (!w.isDestroyed()) w.close(); } catch {} }, 320);
  } catch {}
}

/**
 * Montre une annonce.
 * @param {{titre:string, ligne:string, pied:string, image?:string, initiales?:string, prioritaire?:boolean, fermer?:string}} d
 * @param {Function} [auClic] ce qu'un clic sur la carte ouvre
 */
function montrer(d, auClic) {
  try {
    while (pile.length >= MAX) { const v = pile.pop(); try { v.close(); } catch {} }
    const w = new BrowserWindow({
      width: LARG, height: HAUT, frame: false, transparent: true, resizable: false, movable: false,
      minimizable: false, maximizable: false, fullscreenable: false, alwaysOnTop: true, skipTaskbar: true,
      focusable: false, show: false, hasShadow: false,
      webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false },
    });
    try { w.setAlwaysOnTop(true, 'screen-saver'); } catch {}
    pile.unshift(w);
    placer();
    let minuterie = null;
    const armer = () => { clearTimeout(minuterie); minuterie = setTimeout(() => fermer(w), DUREE); };
    w.webContents.on('page-title-updated', (e, t) => {
      if (t === 'clic') { try { if (auClic) auClic(); } catch {} fermer(w); }
      else if (t === 'fermer') fermer(w);
      else if (t === 'garde') clearTimeout(minuterie);
      else if (t === 'libre') armer();
    });
    // Rien d'autre que la carte : aucun lien, aucune navigation, aucune fenêtre fille.
    w.webContents.on('will-navigate', (e) => e.preventDefault());
    w.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    w.once('ready-to-show', () => { try { w.showInactive(); } catch {} armer(); });
    w.on('closed', () => {
      clearTimeout(minuterie);
      const i = pile.indexOf(w); if (i >= 0) pile.splice(i, 1);
      placer();
    });
    w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page(d))).catch(() => {});
    return true;
  } catch { return false; }
}

module.exports = { montrer };
