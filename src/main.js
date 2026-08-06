'use strict';

/*
 * Administration Sandriza — coquille de bureau
 * ================================================
 * Fenêtre mince qui ouvre le site d'administration EN LIGNE. Aucune copie du
 * site n'est embarquée : l'application est un miroir vivant de ce qui est
 * déployé sur Render. Toute personnalisation de l'admin apparaît donc au
 * prochain lancement, SANS rebâtir ni réinstaller l'application (canal A).
 * Seule la coquille elle-même (ce fichier) demande une reconstruction, et
 * seulement quand on change son comportement (canal B) — c'est rare.
 *
 * LE VRAI GAIN VISÉ (demande de l'utilisateur) :
 *   Faire DISPARAÎTRE l'agent d'impression PowerShell et tout son attirail
 *   (serveur 127.0.0.1, jeton d'appariement, sondage de verdicts, bouton
 *   « mettre à jour l'agent », mode kiosque). Dans l'application, l'impression
 *   est LIÉE DIRECTEMENT aux imprimantes DU POSTE via Electron :
 *     - découverte : webContents.getPrintersAsync()
 *     - impression silencieuse : webContents.print({ silent:true, deviceName })
 *   Bonus : le rappel de print() rend le VRAI verdict (succès / raison d'échec),
 *   ce qui règle aussi le problème « envoyé ≠ imprimé » de l'ancien agent.
 *
 * Le branchement au site est CENTRAL et INERTE hors application : printagent.js
 * détecte `window.sandrizaDesktop` (exposé par preload.js) et, seulement dans ce
 * cas, route l'impression vers les fonctions natives ci-dessous. Aucun navigateur
 * normal ne voit ce drapeau — la boutique et l'admin au navigateur sont intactes.
 */

const { app, BrowserWindow, ipcMain, shell, Menu, Notification, nativeImage, powerSaveBlocker, session, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFile } = require('child_process');

// ── CONFIG ───────────────────────────────────────────────────────────────────
// L'application est un OUTIL D'ADMINISTRATION : elle ouvre UNIQUEMENT le portail
// admin (adm.sandriza.com), jamais la boutique. Modifiable via la variable
// d'environnement ELG_ADMIN_URL, sans rebâtir.
const APP_URL = process.env.ELG_ADMIN_URL || 'https://adm.sandriza.com/';

// Seul le portail admin reste DANS la fenêtre. Tout lien vers la boutique
// (www.sandriza.com/.ca) ou ailleurs s'ouvre dans le navigateur par défaut :
// l'application ne montre QUE l'administration.
const ALLOWED_HOSTS = [
  'adm.sandriza.com',
];

// ── CLÉ D'APPLICATION (verrou navigateur) ────────────────────────────────────
// Le serveur refuse adm.sandriza.com à tout client qui ne présente pas cet
// en-tête (voir adm-gate.php). C'est ce qui rend le portail invisible depuis un
// navigateur ordinaire.
//
// ⚠ CE N'EST PAS UN SECRET FORT, ET IL NE FAUT PAS LE CROIRE TEL.
// L'app.asar d'une application Electron n'est pas chiffré : quiconque possède
// l'installateur peut en extraire cette valeur en une commande. Le verrou arrête
// les robots, les scanners et l'accès opportuniste — PAS quelqu'un de déterminé.
// Le vrai rempart reste la session personnel + MFA, qui n'a pas changé.
//
// Rotation sans rebâtir l'app : variable d'environnement ELG_APP_KEY (elle doit
// alors changer AUSSI côté serveur, sur Render).
// ⚠ LA CLÉ N'EST PAS DANS CE FICHIER — CE DÉPÔT EST PUBLIC.
// Elle est écrite dans `src/cle.js` AU MOMENT DE LA CONSTRUCTION, depuis le
// secret `ELG_APP_KEY` du dépôt. `cle.js` est ignoré par git : il n'existe que
// sur la machine de construction et dans le paquet produit.
//
// Ce que ça protège, et ce que ça ne protège pas : la clé reste extractible de
// n'importe quel installateur (l'`app.asar` d'Electron n'est pas chiffré). Ce
// qu'on évite ici, c'est qu'elle soit GREPPABLE sur le web par le premier
// scanner venu — ce qui est très différent d'avoir à obtenir un installateur
// distribué sous mot de passe temporaire.
const APP_KEY = (() => {
  if (process.env.ELG_APP_KEY) return process.env.ELG_APP_KEY;
  try { return require('./cle').APP_KEY || ''; } catch { return ''; }
})();

// Marque l'application auprès du serveur. Posé sur la session par défaut AVANT
// toute navigation : l'en-tête accompagne le document, les assets et les appels
// aux proxys PHP. Filtré sur les hôtes autorisés — la clé ne fuit jamais vers un
// domaine tiers (un lien externe part de toute façon au navigateur système).
const armAppHeader = () => {
  const urls = ALLOWED_HOSTS.map((h) => 'https://' + h + '/*');
  session.defaultSession.webRequest.onBeforeSendHeaders({ urls }, (details, callback) => {
    callback({ requestHeaders: { ...details.requestHeaders, 'X-Sandriza-App': APP_KEY } });
  });
};

const IN = 25400; // 1 pouce = 25 400 microns (unité attendue par print({pageSize}))

let mainWindow = null;

const isAllowed = (urlStr) => {
  try { return ALLOWED_HOSTS.includes(new URL(urlStr).hostname); }
  catch { return false; }
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ══ IMPRESSION SILENCIEUSE D'UN DOCUMENT ARBITRAIRE ═══════════════════════════
// Le cœur du remplacement de l'agent. webContents.print() n'imprime que la page
// COURANTE ; pour imprimer un document quelconque (bon de commande HTML, étiquette
// PNG, étiquette d'expédition PDF), on le charge dans une fenêtre CACHÉE puis on
// l'imprime en silence. Le rappel donne le verdict réel.
//   payload : { html?, dataUrl?, mime?, deviceName?, widthIn?, heightIn?,
//               copies?, landscape?, jobName? }
//   retour  : { ok:boolean, error:string|null }
const printDocument = async (payload = {}) => {
  const {
    html, dataUrl, mime, deviceName, widthIn, heightIn,
    copies = 1, landscape = false,
  } = payload;

  let contentUrl;
  const isPdf = (mime && mime.indexOf('pdf') >= 0) || (dataUrl && dataUrl.indexOf('application/pdf') >= 0);

  if (html != null) {
    contentUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  } else if (dataUrl && mime && mime.indexOf('image/') === 0) {
    // Image (code-barres) : on l'encadre dans un HTML au format exact de l'étiquette.
    const w = widthIn || 2, h = heightIn || 1;
    const imgHtml =
      '<!doctype html><meta charset="utf-8">' +
      '<style>@page{size:' + w + 'in ' + h + 'in;margin:0}' +
      'html,body{margin:0;padding:0}' +
      'img{width:' + w + 'in;height:' + h + 'in;object-fit:contain;display:block}</style>' +
      '<img src="' + dataUrl + '">';
    contentUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(imgHtml);
  } else if (dataUrl) {
    contentUrl = dataUrl; // PDF ou autre : chargé tel quel (visionneuse intégrée)
  } else {
    return { ok: false, error: 'aucun contenu à imprimer' };
  }

  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      plugins: true, // requis pour afficher (donc imprimer) un PDF chargé
    },
  });

  // Phase 2 — anti-veille : empêche l'écran/le système de s'endormir PENDANT
  // l'impression (une thermique Bluetooth peut prendre plusieurs dizaines de sec).
  let psb = null;
  try { psb = powerSaveBlocker.start('prevent-display-sleep'); } catch {}

  try {
    await win.loadURL(contentUrl);
    // La visionneuse PDF de Chromium se rend de façon asynchrone après loadURL :
    // on lui laisse un court instant avant d'imprimer, sinon la page est blanche.
    if (isPdf) await delay(700);

    const pageSize = (widthIn && heightIn)
      ? { width: Math.round(widthIn * IN), height: Math.round(heightIn * IN) }
      : undefined;

    return await new Promise((resolve) => {
      win.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: deviceName || '',          // '' = imprimante par défaut du poste
        copies: Math.max(1, parseInt(copies, 10) || 1),
        landscape: !!landscape,
        margins: { marginType: 'none' },
        pageSize,
      }, (success, failureReason) => {
        resolve({ ok: !!success, error: success ? null : (failureReason || 'échec inconnu') });
      });
    });
  } catch (err) {
    return { ok: false, error: String((err && err.message) || err) };
  } finally {
    if (!win.isDestroyed()) win.destroy();
    try { if (psb !== null && powerSaveBlocker.isStarted(psb)) powerSaveBlocker.stop(psb); } catch {}
  }
};

// ── IPC exposé à la page (via preload.js) ─────────────────────────────────────
ipcMain.handle('printers:list', async (e) => {
  const wc = BrowserWindow.fromWebContents(e.sender)?.webContents;
  if (!wc) return [];
  try { return await wc.getPrintersAsync(); } catch { return []; }
});

ipcMain.handle('print:document', (e, payload) => printDocument(payload || {}));

// Impression de la PAGE COURANTE (sert au test menu ; peu utilisé par le site).
ipcMain.handle('print:current', async (e, opts = {}) => {
  const wc = BrowserWindow.fromWebContents(e.sender)?.webContents;
  if (!wc) return { ok: false, error: 'fenêtre introuvable' };
  return await new Promise((resolve) => {
    wc.print({ silent: true, printBackground: true, deviceName: opts.deviceName || '' },
      (ok, why) => resolve({ ok: !!ok, error: ok ? null : (why || 'échec') }));
  });
});

ipcMain.on('win:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize());
ipcMain.on('win:close',    (e) => BrowserWindow.fromWebContents(e.sender)?.close());

// ══ PHASE 3 — NOTIFICATIONS NATIVES + PASTILLE SUR L'ICÔNE ════════════════════
const ICON_PATH = path.join(__dirname, '..', 'build', 'icon.png');
ipcMain.handle('notify', (e, opts = {}) => {
  try {
    const n = new Notification({
      title: opts.title || 'Administration Sandriza',
      body: opts.body || '',
      icon: fs.existsSync(ICON_PATH) ? ICON_PATH : undefined,
      silent: !!opts.silent,
    });
    // Un clic ramène et focalise la fenêtre (ex. « nouvelle commande » → l'ouvrir).
    n.on('click', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); } });
    n.show();
    return true;
  } catch { return false; }
});

// Pastille (overlay) sur l'icône de la barre des tâches. Windows n'a pas de
// compteur natif → on affiche une IMAGE dessinée par la page (canvas → dataURL),
// ou on efface si dataUrl vide. `desc` = texte lu par les lecteurs d'écran.
ipcMain.handle('badge:set', (e, dataUrl, desc) => {
  const w = BrowserWindow.fromWebContents(e.sender) || mainWindow;
  if (!w) return false;
  try {
    if (!dataUrl) { w.setOverlayIcon(null, ''); return true; }
    w.setOverlayIcon(nativeImage.createFromDataURL(dataUrl), desc || 'notifications');
    return true;
  } catch { return false; }
});

// ══ PHASE 4 — DÉMARRAGE AUTOMATIQUE ═══════════════════════════════════════════
ipcMain.handle('autolaunch:get', () => {
  try { return !!app.getLoginItemSettings().openAtLogin; } catch { return false; }
});
ipcMain.handle('autolaunch:set', (e, on) => {
  try { app.setLoginItemSettings({ openAtLogin: !!on }); return true; } catch { return false; }
});

// ══ PHASE 4 — FICHIERS D'EXPORT (dossier fixe, ce que le navigateur ne peut pas) ═
const EXPORT_DIR = () => {
  const d = path.join(app.getPath('documents'), 'SANDRIZA', 'Exports');
  try { fs.mkdirSync(d, { recursive: true }); } catch {}
  return d;
};
const _safeName = (n) => String(n || 'export').replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 120) || 'export';
ipcMain.handle('export:save', (e, name, dataUrlOrText) => {
  try {
    const p = path.join(EXPORT_DIR(), _safeName(name));
    const s = String(dataUrlOrText || '');
    const m = s.match(/^data:[^;]*;base64,(.*)$/);
    if (m) fs.writeFileSync(p, Buffer.from(m[1], 'base64'));
    else fs.writeFileSync(p, s, 'utf8');
    return { ok: true, path: p };
  } catch (err) { return { ok: false, error: String(err && err.message || err) }; }
});
ipcMain.handle('export:list', () => {
  try {
    return fs.readdirSync(EXPORT_DIR()).map((f) => {
      const st = fs.statSync(path.join(EXPORT_DIR(), f));
      return { name: f, size: st.size, at: st.mtimeMs };
    }).sort((a, b) => b.at - a.at);
  } catch { return []; }
});
ipcMain.handle('export:delete', (e, name) => {
  try { fs.unlinkSync(path.join(EXPORT_DIR(), _safeName(name))); return true; } catch { return false; }
});
ipcMain.handle('export:openFolder', () => { try { shell.openPath(EXPORT_DIR()); return true; } catch { return false; } });

// ══ PHASE 5 (NATIF) — DÉTECTION DE CLÉ USB DE PHOTOS ══════════════════════════
const IMG_RE = /\.(jpe?g|png|webp|heic|heif|bmp|tiff?)$/i;
// Liste les lecteurs AMOVIBLES (DriveType=2) via CIM, en JSON.
const listRemovableDrives = () => new Promise((resolve) => {
  const ps = 'Get-CimInstance Win32_LogicalDisk -Filter "DriveType=2" | ' +
             'Select-Object -ExpandProperty DeviceID';
  execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
    { timeout: 8000, windowsHide: true }, (err, stdout) => {
      if (err || !stdout) return resolve([]);
      resolve(stdout.split(/\r?\n/).map(s => s.trim()).filter(s => /^[A-Za-z]:$/.test(s)));
    });
});
// Cherche des images à la racine, dans DCIM et un niveau en dessous (appareils
// photo / téléphones). Plafonné pour rester rapide.
const scanDrivePhotos = (drive) => {
  const out = [];
  const root = drive.endsWith('\\') ? drive : drive + '\\';
  const roots = [root, path.join(root, 'DCIM')];
  const pushImgs = (dir) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const en of entries) {
      if (out.length >= 500) return;
      const full = path.join(dir, en.name);
      if (en.isFile() && IMG_RE.test(en.name)) {
        try { const st = fs.statSync(full); out.push({ path: full, name: en.name, size: st.size }); } catch {}
      }
    }
  };
  for (const r of roots) {
    pushImgs(r);
    // un niveau en dessous de DCIM (ex. DCIM\100CANON)
    try {
      for (const en of fs.readdirSync(r, { withFileTypes: true })) {
        if (en.isDirectory()) pushImgs(path.join(r, en.name));
      }
    } catch {}
  }
  return out;
};
// Renvoie les données d'une image du poste en data URL (pour l'aperçu / le traitement).
ipcMain.handle('usb:read', (e, filePath) => {
  try {
    const buf = fs.readFileSync(filePath);
    const ext = (path.extname(filePath).slice(1) || 'jpeg').toLowerCase();
    const mime = ext === 'jpg' ? 'image/jpeg' : ('image/' + ext);
    return 'data:' + mime + ';base64,' + buf.toString('base64');
  } catch { return null; }
});
// Scan à la demande (bouton « Détecter une clé USB » dans la section Photos).
ipcMain.handle('usb:scan', async () => {
  const drives = await listRemovableDrives();
  return drives.map(d => ({ drive: d, photos: scanDrivePhotos(d) }));
});

// Surveillance : quand une NOUVELLE clé amovible apparaît avec des photos, on
// prévient la page (elle propose l'import) + une notification native.
let _knownDrives = new Set();
let _usbTimer = null;
const startUsbWatch = () => {
  const tick = async () => {
    const drives = await listRemovableDrives();
    const now = new Set(drives);
    for (const d of drives) {
      if (!_knownDrives.has(d)) {
        const photos = scanDrivePhotos(d);
        if (photos.length && mainWindow) {
          mainWindow.webContents.send('usb:photos', { drive: d, photos });
          try {
            new Notification({
              title: 'Administration Sandriza',
              body: 'Clé ' + d + ' détectée — ' + photos.length + ' photo(s). Ouvrez la section Photos pour importer.',
              icon: fs.existsSync(ICON_PATH) ? ICON_PATH : undefined,
            }).on('click', () => { if (mainWindow) { mainWindow.restore(); mainWindow.focus(); } }).show();
          } catch {}
        }
      }
    }
    _knownDrives = now;
  };
  tick();
  _usbTimer = setInterval(tick, 5000);
};

// ── Masquage de la barre latérale de l'admin (mode application) ───────────────
// L'app a déjà toute la navigation dans ses menus natifs : on peut donc masquer
// complètement la barre latérale du site. Préférence retenue dans localStorage,
// réappliquée à chaque chargement.
const SIDEBAR_CSS = '.admin-sidebar{display:none!important}.admin-main{margin-left:0!important;width:100%!important;max-width:100%!important}';
const applySidebarPref = (wc) => {
  if (!wc) return;
  wc.executeJavaScript(
    "(function(){try{var on=localStorage.getItem('elg_hide_admin_sidebar')==='1';var s=document.getElementById('elg-hide-rail');"
    + "if(on){if(!s){s=document.createElement('style');s.id='elg-hide-rail';s.textContent=" + JSON.stringify(SIDEBAR_CSS) + ";(document.head||document.documentElement).appendChild(s);}}"
    + "else if(s){s.remove();}}catch(e){}})()", true).catch(() => {});
};
const toggleSidebar = (hide) => {
  const wc = mainWindow && mainWindow.webContents; if (!wc) return;
  wc.executeJavaScript("localStorage.setItem('elg_hide_admin_sidebar','" + (hide ? '1' : '0') + "')", true).then(() => applySidebarPref(wc)).catch(() => {});
};

// ── Fenêtre principale ────────────────────────────────────────────────────────
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#111827',
    title: 'Administration Sandriza',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // durcissement : la page n'a jamais accès direct à Node
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  });

  // ⚠ ON NE CHARGE PAS L'ADMINISTRATION ICI. La fenêtre s'ouvre sur l'écran
  // d'attente ; c'est `verifierAuLancement()` qui décide d'ouvrir APP_URL, une
  // fois la question de la mise à jour tranchée. Charger l'admin ici laisserait
  // une version périmée entrer pendant que la vérification tourne encore.
  mainWindow.loadURL(portePage('Démarrage', 'Un instant…')).catch(() => {});

  // Réapplique la préférence de masquage de la barre latérale à chaque chargement,
  // et remet le menu en accord avec l'état de session de la page qui vient de
  // charger (connexion, déconnexion, changement de compte).
  // ⚠ ICI, PAS SEULEMENT DANS buildMenu(). Au démarrage, `buildMenu()` tourne
  // AVANT `createWindow()` (il faut un menu prêt quand la fenêtre s'ouvre) :
  // `mainWindow` y est donc encore `null` et l'appel à masquer la barre native
  // ne portait sur rien. Résultat : la bande grise de Windows restait affichée
  // par-dessus tout, et c'est elle qu'on voyait à l'écran de connexion.
  mainWindow.setMenuBarVisibility(false);
  mainWindow.autoHideMenuBar = true;

  // Le titre de la fenêtre suivait celui de la PAGE (« SANDRIZA - Boutique de
  // vêtements… »), ce qui n'a aucun sens pour un outil d'administration.
  mainWindow.on('page-title-updated', (e) => { e.preventDefault(); });
  mainWindow.setTitle('Administration Sandriza');

  mainWindow.webContents.on('did-finish-load', () => {
    applySidebarPref(mainWindow.webContents);
    capturerMarque();
    // La barre elle-même est dessinée par le SITE (appbar.js). Ici on remet
    // seulement le menu natif — qui porte les raccourcis — et la palette.
    dessinerMenus();
  });

  // Liens externes → navigateur par défaut ; jamais dans l'application.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!isAllowed(url)) { shell.openExternal(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });

  // Navigation hors des hôtes autorisés bloquée (défense en profondeur).
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!isAllowed(url)) { e.preventDefault(); shell.openExternal(url); }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
};

// ── VRAIS BOUTONS D'APPLICATION (barre de menus native) ───────────────────────
// Chaque item déclenche une action de l'admin web via l'objet `Admin` (top-level,
// atteignable depuis un script injecté). Le même code que les boutons de la page,
// donc les gardes de permission s'appliquent telles quelles. Si personne n'est
// connecté (`Admin` indéfini sur l'écran de connexion), on le dit par une bulle du
// site plutôt que d'agir dans le vide.
const runAdmin = (expr) => {
  if (!mainWindow) return;
  const js =
    '(function(){try{' +
      "if(typeof Admin==='undefined'){if(typeof Toast!=='undefined')Toast.show('Connectez-vous pour continuer.','warning');return;}" +
      expr + ';' +
    "}catch(e){if(typeof Toast!=='undefined')Toast.show('Action indisponible : '+(e&&e.message||''),'error');}})()";
  mainWindow.webContents.executeJavaScript(js, true).catch(() => {});
};
const goSection = (key) => runAdmin("Admin.renderSection('" + key + "')");
const goConfig = (tab) => runAdmin("Admin.renderSection('config');if(Admin.switchConfigTab)Admin.switchConfigTab('" + tab + "')");

// ── MISES À JOUR (paquets publiés sur GitHub) ────────────────────────────────
// Les installateurs sont publiés en « Release » sur le dépôt PUBLIC
// drankforce-lab/sandriza-desktop-releases (voir `publish:` dans
// electron-builder.yml). Ce dépôt ne contient QUE des binaires : aucun code
// source, donc aucun jeton à embarquer dans l'application — c'est précisément
// pourquoi il est séparé du dépôt Sandriza, qui reste privé.
//
// Deux chemins :
//   - AUTOMATIQUE : une vérification silencieuse au démarrage (téléchargement en
//     tâche de fond, proposition de redémarrer une fois le paquet prêt).
//   - MANUEL : menu « Application → Vérifier les mises à jour… », qui parle même
//     quand il n'y a rien de neuf (sinon on ne sait pas si ça a fonctionné).
let _updBusy = false;
// Positionné par les événements d'electron-updater PENDANT la vérification, et
// lu juste après. On ne compare pas les numéros de version à la main : c'est
// electron-updater qui connaît les règles (semver, canaux, rétrogradations), et
// un `!==` naïf traiterait une VERSION PLUS ANCIENNE comme une mise à jour.
let _majDispo = false;
// Vrai tant que l'écran d'attente au lancement est affiché : les événements de
// progression n'écrivent dedans que dans ce cas.
let _porteActive = false;

// ══ ÉCRAN DE LANCEMENT — MÊME HABILLAGE QUE LA CONNEXION ══════════════════════
// L'application n'ouvre PAS l'administration avant d'avoir regardé s'il existe
// une version plus récente. Tant que la question n'est pas tranchée, la fenêtre
// montre cet écran — donc personne ne se connecte depuis une version périmée.
//
// ── POURQUOI IL RESSEMBLE À L'ÉCRAN DE CONNEXION (demandé le 2026-08-06) ──────
// C'est le MÊME écran divisé : panneau de marque animé à gauche, panneau crème à
// droite. L'assistant de mise à jour prend exactement la place qu'occupent
// l'identifiant et le mot de passe. Au lancement, on voit donc une seule
// interface qui se remplit, au lieu de deux écrans sans rapport qui se
// succèdent.
//
// ⚠ CE N'EST PAS `Staff._loginShell` RÉUTILISÉ, ET ÇA NE PEUT PAS L'ÊTRE.
// Cet écran est une page LOCALE (data:), affichée AVANT que le site ne charge :
// elle n'a accès ni au code du site, ni à son `localStorage` (autre origine).
// Le style est donc reproduit ici, à partir du même thème. Corollaire à ne pas
// oublier : **si l'habillage de la connexion change dans `staff.js`, il faut le
// reporter ici** — rien ne les tient ensemble automatiquement.
//
// Pour que la marque soit la vraie (logo, couleurs, nom), on la CAPTURE depuis
// la page d'administration à chaque chargement réussi et on la garde dans les
// réglages du poste. Au tout premier lancement, avant toute connexion, on
// retombe sur les mêmes valeurs par défaut que le site.
const porteMarque = () => {
  const m = reglages.get('marque') || {};
  const th = m.theme || {};
  return {
    bgFrom:  th.bgFrom || '#191238',
    bgMid:   th.bgMid  || '#2b2262',
    logoG:   'linear-gradient(135deg,' + (th.logoGradFrom || '#4f46e5') + ',' + (th.logoGradTo || '#7c3aed') + ')',
    titre:   th.titleColor || '#f5e6d0',
    sous:    th.subtitleColor || 'rgba(236,229,217,0.92)',
    nom:     m.nom || 'SANDRIZA',
    sousTitre: th.subtitleText || 'Panneau d’administration',
    lettre:  m.lettre || 'S',
    logo:    m.logo || '',
  };
};

const portePage = (titre, message, progression) => {
  const b = porteMarque();
  const bg = 'linear-gradient(135deg,' + b.bgFrom + ' 0%,' + b.bgMid + ' 50%,' + b.bgFrom + ' 100%)';

  const barre = (progression === undefined) ? '' :
    '<div class="pg"><div class="pg-in" style="width:' + Math.max(0, Math.min(100, progression)) + '%"></div></div>';

  const logo = b.logo
    ? '<div class="plate"><img src="' + b.logo + '" alt="" class="plate-img"></div>'
    : '<div class="badge" style="background:' + b.logoG + '">' + b.lettre + '</div>';
  const nom = b.logo ? '' : '<h1 class="bname">' + b.nom + '</h1>';

  const css = ''
    + ':root{color-scheme:dark}'
    + '*{box-sizing:border-box}'
    + 'body{margin:0;min-height:100vh;background:' + bg + ';-webkit-font-smoothing:antialiased;'
    +   'font:15px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}'
    + '.split{display:flex;min-height:100vh;align-items:stretch}'
    + '.brand{position:relative;flex:1 1 46%;display:flex;flex-direction:column;justify-content:center;'
    +   'padding:3.5rem 3.2rem;overflow:hidden;color:' + b.titre + '}'
    + '.orb{position:absolute;border-radius:50%;filter:blur(60px);opacity:.5;z-index:0;pointer-events:none;will-change:transform}'
    + '.o1{width:360px;height:360px;background:' + b.logoG + ';top:-80px;left:-60px;animation:f1 17s ease-in-out infinite}'
    + '.o2{width:300px;height:300px;opacity:.42;background:linear-gradient(135deg,#7c5cff,#4338ca);bottom:-70px;right:6%;animation:f2 21s ease-in-out infinite}'
    + '.o3{width:220px;height:220px;opacity:.4;background:linear-gradient(135deg,#a855f7,#6d28d9);top:40%;right:-50px;animation:f3 25s ease-in-out infinite}'
    + '.brand::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(115deg,rgba(6,4,16,.55) 0%,rgba(6,4,16,.34) 46%,rgba(6,4,16,.14) 100%)}'
    + '.brand::after{content:"";position:absolute;inset:0;z-index:1;background:radial-gradient(85% 62% at 16% 12%,rgba(255,255,255,.10),transparent 55%)}'
    + '.binner{position:relative;z-index:2;max-width:460px}'
    + '.badge{width:74px;height:74px;border-radius:19px;display:inline-flex;align-items:center;justify-content:center;'
    +   'font:800 2rem/1 Georgia,serif;color:#fff;margin:0 0 1.5rem;box-shadow:0 14px 34px rgba(0,0,0,.34)}'
    + '.plate{position:relative;display:inline-block;padding:1.8rem 2.4rem;margin:0 0 1.9rem;animation:float 7s ease-in-out infinite}'
    + '.plate::before{content:"";position:absolute;inset:0;z-index:0;filter:blur(13px);'
    +   'background:radial-gradient(118% 135% at 50% 48%,rgba(248,242,233,.55) 0%,rgba(233,219,200,.32) 42%,rgba(233,219,200,0) 76%)}'
    + '.plate-img{position:relative;z-index:1;display:block;margin:0 auto;width:min(340px,70vw);height:auto}'
    + '.bname{font-family:Georgia,serif;font-size:2.15rem;font-weight:800;margin:0 0 .9rem;line-height:1.12}'
    + '.eyebrow{display:flex;align-items:center;gap:.9rem;margin:0 0 2.4rem;text-transform:uppercase;'
    +   'letter-spacing:.26em;font-size:.8rem;font-weight:600;color:' + b.sous + '}'
    + '.eyebrow .line{flex:0 0 auto;height:2px;width:42px;border-radius:2px;background:linear-gradient(90deg,#C49A6C,rgba(196,154,108,.08))}'
    + '.feats{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1.05rem}'
    + '.feat{display:flex;align-items:center;gap:.9rem;font-size:.9rem;line-height:1.4;font-weight:500;color:rgba(243,237,227,.95)}'
    + '.feat .ic{flex:0 0 auto;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;'
    +   'color:#fff;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.28)}'
    // ── Panneau de droite : la place de l'identifiant et du mot de passe ──────
    // ⚠ PANNEAU CRÈME UNI, ET C'EST UN CHOIX ASSUMÉ.
    // Un fond travaillé (halos, trame diagonale) a été essayé le 2026-08-06 puis
    // RETIRÉ à la demande de l'utilisateur : à côté du panneau de marque, qui est
    // déjà riche, la moindre texture ici devient du bruit. Ne pas y revenir.
    + '.panel{flex:1 1 54%;display:flex;flex-direction:column;justify-content:center;align-items:center;'
    +   'background:#faf8f5;padding:2.75rem 2rem;overflow-y:auto}'
    + '.wrap{width:100%;max-width:400px;animation:rise .6s cubic-bezier(.16,.84,.44,1) both}'
    + '.kicker{display:block;font-size:.69rem;font-weight:600;color:#9a7d62;margin-bottom:.4rem;'
    +   'text-transform:uppercase;letter-spacing:.08em}'
    + '.h1{font-size:1.5rem;font-weight:800;color:#1a1207;font-family:Georgia,serif;letter-spacing:.01em;line-height:1.2;margin:0}'
    + '.sub{font-size:.8rem;color:#7a6652;line-height:1.5;margin-top:.35rem}'
    + '.pg{width:100%;height:7px;border-radius:99px;background:rgba(196,154,108,.16);overflow:hidden;margin-top:1.6rem}'
    + '.pg-in{height:100%;background:linear-gradient(90deg,#C49A6C,#e0bd93);border-radius:99px;transition:width .25s ease}'
    + '.pulse{margin-top:1.6rem;height:7px;border-radius:99px;background:rgba(196,154,108,.16);overflow:hidden;position:relative}'
    + '.pulse::after{content:"";position:absolute;top:0;bottom:0;width:38%;border-radius:99px;'
    +   'background:linear-gradient(90deg,transparent,#C49A6C,transparent);animation:slide 1.5s ease-in-out infinite}'
    + '.ver{margin-top:1.8rem;padding-top:1.1rem;border-top:1px solid rgba(196,154,108,.22);'
    +   'font-size:.72rem;color:#9a7d62;letter-spacing:.02em}'
    + '@keyframes f1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(36px,46px) scale(1.08)}}'
    + '@keyframes f2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-34px) scale(1.06)}}'
    + '@keyframes f3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(28px,-30px) scale(1.1)}}'
    + '@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}'
    + '@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}'
    + '@keyframes slide{0%{left:-40%}100%{left:102%}}'
    + '@media (max-width:860px){'
    +   '.split{flex-direction:column}'
    +   '.brand{flex:0 0 auto;padding:2.5rem 1.5rem 2.1rem;text-align:center;align-items:center}'
    +   '.binner{max-width:none;display:flex;flex-direction:column;align-items:center}'
    +   '.bname{font-size:1.7rem}.eyebrow{justify-content:center;margin-bottom:.4rem}'
    +   '.plate{padding:1.2rem 1.5rem}.feats{gap:.65rem;align-items:flex-start;text-align:left}'
    +   '.panel{flex:1 1 auto;padding:2.1rem 1.3rem 2.8rem}'
    + '}'
    + '@media (prefers-reduced-motion:reduce){.orb,.wrap,.plate,.pulse::after{animation:none}}';

  // Sans pourcentage connu, une barre figée à 0 % ressemble à un blocage : on
  // montre une animation de balayage, qui dit « ça travaille » sans mentir sur
  // l'avancement.
  const jauge = (progression === undefined) ? '<div class="pulse"></div>' : barre;

  const html = ''
    + '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>' + b.nom + '</title>'
    + '<style>' + css + '</style></head><body><div class="split">'
    + '<aside class="brand">'
    +   '<span class="orb o1"></span><span class="orb o2"></span><span class="orb o3"></span>'
    // ⚠ PAS DE LISTE DE PROTECTIONS ICI (retirée à la demande de l'utilisateur,
    // 2026-08-06). L'écran de connexion l'affiche, c'est son rôle : rassurer
    // quelqu'un qui s'apprête à taper un mot de passe. Un écran de mise à jour
    // n'a personne à rassurer — le logo et le message suffisent.
    +   '<div class="binner">' + logo + nom
    +     '<div class="eyebrow"><span class="line"></span><span>' + b.sousTitre + '</span></div>'
    +   '</div></aside>'
    + '<main class="panel"><div class="wrap">'
    +   '<span class="kicker">Mise à jour</span>'
    +   '<div class="h1">' + titre + '</div>'
    +   '<div class="sub">' + message + '</div>'
    +   jauge
    +   '<div class="ver">Administration ' + b.nom + ' · version ' + app.getVersion() + '</div>'
    + '</div></main></div></body></html>';

  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
};

// ── Capture de la marque, pour l'écran de lancement ──────────────────────────
// L'écran de lancement s'affiche AVANT que le site n'existe : il ne peut pas
// lire `elg_logo_login` ni `elg_login_theme`, qui appartiennent au document de
// adm.sandriza.com. On les relève donc à chaque chargement réussi et on les
// garde dans les réglages du poste — l'écran suivant portera la vraie marque.
// ⚠ Le logo est refusé au-delà de 400 Ko : un fichier de réglages est relu à
// chaque ouverture de fenêtre, il n'a pas à transporter une image lourde.
const capturerMarque = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const url = mainWindow.webContents.getURL() || '';
  if (url.indexOf('data:') === 0) return;   // c'est notre propre écran
  const js = '(function(){try{var t={};try{t=JSON.parse(localStorage.getItem("elg_login_theme"))||{}}catch(e){}'
    + 'return{logo:localStorage.getItem("elg_logo_login")||localStorage.getItem("elg_logo_admin")||"",'
    + 'nom:localStorage.getItem("elg_brand_name")||"",lettre:localStorage.getItem("elg_logo_letter")||"",'
    + 'sombre:(localStorage.getItem("elg_admin_ui_theme")||"light")==="dark",theme:t};'
    + '}catch(e){return null}})()';
  mainWindow.webContents.executeJavaScript(js, true).then((m) => {
    if (!m || typeof m !== 'object') return;
    if (m.logo && m.logo.length > 400000) m.logo = '';
    const avant = JSON.stringify(reglages.get('marque') || {});
    if (JSON.stringify(m) !== avant) reglages.set('marque', m);
  }).catch(() => {});
};

// ══ FENÊTRE « À PROPOS » ══════════════════════════════════════════════════════
// ⚠ POURQUOI CE N'EST PLUS UNE BOÎTE `dialog.showMessageBox`.
// Le texte y était mis en colonnes avec des ESPACES — or ces boîtes utilisent la
// police proportionnelle du système : « Version » et « Chromium » n'ont pas la
// même largeur, donc rien ne s'alignait, quel que soit le nombre d'espaces. Le
// remède n'est pas d'en ajouter, c'est d'arrêter de faire de la mise en page
// avec du texte : une grille CSS aligne, elle, par construction.
// Et tant qu'à ouvrir une fenêtre, elle porte le même habillage que le reste.
let aproposWin = null;

const infosApropos = () => {
  const cfg = reglages.lire();
  const sys = process.platform === 'win32' ? 'Windows'
    : process.platform === 'darwin' ? 'macOS' : process.platform;
  const arch = { x64: '64 bits (x64)', ia32: '32 bits (ia32)', arm64: 'ARM 64 bits' }[process.arch] || process.arch;
  const ancrage = { haut: 'en haut', gauche: 'à gauche', droite: 'à droite', fenetre: 'fenêtre séparée' }[cfg.menuMode] || cfg.menuMode;
  return [
    ['Application', [
      ['Version', app.getVersion() + (app.isPackaged ? '' : '  (développement)')],
      ['Portail', APP_URL],
      ['Mises à jour', 'vérifiées à chaque lancement'],
      ['Impression', 'native, sans agent local'],
    ]],
    ['Poste', [
      ['Système', sys + ' · ' + arch],
      ['Electron', process.versions.electron],
      ['Chromium', process.versions.chrome],
      ['Node', process.versions.node],
    ]],
    ['Réglages', [
      ['Menu', ancrage + ' · taille ' + Math.round(cfg.menuTaille * 100) + ' %'],
      ['Fichier', path.join(app.getPath('userData'), 'reglages.json')],
      ['Exports', EXPORT_DIR()],
    ]],
  ];
};

// Version TEXTE, pour le presse-papiers. Là, l'alignement par espaces est
// légitime : ce qui est collé atterrit dans un courriel ou un billet, en
// police à chasse fixe la plupart du temps, et de toute façon sans mise en page.
const texteApropos = () => infosApropos()
  .map(([sect, lignes]) => sect + '\n' + lignes.map(([k, v]) => '  ' + (k + ' ').padEnd(16, '.') + ' ' + v).join('\n'))
  .join('\n\n');

const pageApropos = () => {
  const b = porteMarque();
  const bg = 'linear-gradient(135deg,' + b.bgFrom + ' 0%,' + b.bgMid + ' 50%,' + b.bgFrom + ' 100%)';
  const logo = b.logo
    ? '<img src="' + b.logo + '" alt="" class="lg">'
    : '<div class="bd" style="background:' + b.logoG + '">' + b.lettre + '</div>';
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const sections = infosApropos().map(([titre, lignes]) =>
    '<div class="sect"><div class="st">' + esc(titre) + '</div><dl class="grid">'
    + lignes.map(([k, v]) => '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>').join('')
    + '</dl></div>').join('');

  const css = ''
    + ':root{color-scheme:light}*{box-sizing:border-box}'
    + 'html,body{margin:0;height:100%;overflow:hidden}'
    + 'body{display:flex;font:14px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1a1207}'
    + '.brand{flex:0 0 216px;background:' + bg + ';position:relative;overflow:hidden;'
    +   'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.6rem 1.2rem;text-align:center}'
    + '.orb{position:absolute;border-radius:50%;filter:blur(52px);opacity:.5;pointer-events:none}'
    + '.o1{width:230px;height:230px;background:' + b.logoG + ';top:-70px;left:-60px;animation:f1 17s ease-in-out infinite}'
    + '.o2{width:190px;height:190px;opacity:.4;background:linear-gradient(135deg,#a855f7,#6d28d9);bottom:-60px;right:-40px;animation:f2 21s ease-in-out infinite}'
    + '.bi{position:relative;z-index:2}'
    + '.bd{width:62px;height:62px;border-radius:17px;display:flex;align-items:center;justify-content:center;'
    +   'font:800 1.7rem/1 Georgia,serif;color:#fff;margin:0 auto .9rem;box-shadow:0 12px 30px rgba(0,0,0,.34)}'
    + '.lg{display:block;max-width:150px;height:auto;margin:0 auto .9rem}'
    + '.bn{font-family:Georgia,serif;font-size:1.15rem;font-weight:800;color:' + b.titre + ';margin:0}'
    + '.bs{font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:' + b.sous + ';margin-top:.45rem}'
    + '.bv{margin-top:1.1rem;font-size:.7rem;color:' + b.sous + ';opacity:.75}'
    + '.panel{flex:1 1 auto;background:#faf8f5;display:flex;flex-direction:column;min-width:0}'
    + '.body{flex:1 1 auto;overflow:hidden;padding:1.4rem 1.7rem}'
    + '.sect{margin-bottom:1.25rem}.sect:last-child{margin-bottom:0}'
    + '.st{font-size:.66rem;font-weight:700;color:#9a7d62;text-transform:uppercase;letter-spacing:.1em;'
    +   'padding-bottom:.4rem;margin-bottom:.55rem;border-bottom:1px solid rgba(196,154,108,.22)}'
    // ⚠ LA GRILLE, C'EST TOUT LE CORRECTIF : deux colonnes, l'etiquette a largeur
    //   fixe et la valeur qui prend le reste. Aucun espace de calage.
    + '.grid{display:grid;grid-template-columns:118px 1fr;gap:.34rem .9rem;margin:0}'
    + 'dt{color:#7a6652;font-size:.79rem}'
    + 'dd{margin:0;font-size:.82rem;color:#1a1207;word-break:break-all;-webkit-user-select:text;user-select:text}'
    + '.pied{flex:0 0 auto;display:flex;gap:.55rem;justify-content:flex-end;'
    +   'padding:.9rem 1.7rem;border-top:1px solid rgba(196,154,108,.22);background:#f4f0ea}'
    + 'button{font:inherit;font-size:.82rem;padding:.5rem 1.05rem;border-radius:9px;cursor:pointer;'
    +   'border:1px solid rgba(196,154,108,.42);background:#fff;color:#8a6a44;font-weight:600;'
    +   'transition:background .15s,transform .12s,box-shadow .18s}'
    + 'button:hover{background:rgba(196,154,108,.12);transform:translateY(-1px);box-shadow:0 5px 14px rgba(196,154,108,.2)}'
    + 'button:active{transform:none}'
    + 'button.p{background:linear-gradient(135deg,#C49A6C,#a97f52);border-color:transparent;color:#fff}'
    + '@keyframes f1{0%,100%{transform:translate(0,0)}50%{transform:translate(26px,32px)}}'
    + '@keyframes f2{0%,100%{transform:translate(0,0)}50%{transform:translate(-22px,-26px)}}'
    + '@media (prefers-reduced-motion:reduce){.orb{animation:none}}';

  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>À propos</title>'
    + '<style>' + css + '</style></head><body>'
    + '<aside class="brand"><span class="orb o1"></span><span class="orb o2"></span>'
    // ⚠ Le nom n'est ecrit QUE si le logo ne le porte pas deja. Le logo de
    // marque contient le mot SANDRIZA : l'afficher en dessous le repetait deux
    // fois, l'un sous l'autre.
    +   '<div class="bi">' + logo + (b.logo ? '' : '<div class="bn">' + esc(b.nom) + '</div>')
    +   '<div class="bs">Administration</div>'
    +   '<div class="bv">version ' + app.getVersion() + '</div></div></aside>'
    + '<main class="panel"><div class="body">' + sections + '</div>'
    +   '<div class="pied">'
    +     '<button onclick="szPalette.action({app:\'about-copy\'})">Copier les détails</button>'
    +     '<button onclick="szPalette.action({app:\'update-check\'})">Vérifier les mises à jour</button>'
    +     '<button class="p" onclick="window.close()">Fermer</button>'
    +   '</div></main>'
    // ⚠ AUCUNE BARRE DE DÉFILEMENT, ET PAS PAR UNE HAUTEUR DEVINÉE.
    // Une fenêtre à hauteur fixe se fait démentir par la première ligne
    // ajoutée, par un chemin de fichier plus long, ou par un poste dont la
    // mise à l'échelle de Windows n'est pas à 100 %. On mesure le contenu
    // réel et on demande à la fenêtre de s'y ajuster.
    + '<script>(function(){function m(){try{'
    +   'var h=Math.max(document.body.scrollHeight,'
    +   'document.querySelector(".panel").scrollHeight,'
    +   'document.querySelector(".brand").scrollHeight);'
    +   'if(window.szPalette&&window.szPalette.ajusterHauteur)window.szPalette.ajusterHauteur(h);'
    + '}catch(e){}}'
    + 'if(document.readyState==="complete")m();else window.addEventListener("load",m);'
    + 'setTimeout(m,120);})();<\/script>'
    + '</body></html>';
};

const ouvrirApropos = () => {
  if (aproposWin && !aproposWin.isDestroyed()) { aproposWin.focus(); return; }
  aproposWin = new BrowserWindow({
    width: 780, height: 560, show: false, resizable: false, minimizable: false, maximizable: false,
    title: 'À propos', parent: mainWindow || undefined, modal: false,
    autoHideMenuBar: true, backgroundColor: '#faf8f5',
    webPreferences: {
      preload: path.join(__dirname, 'palette-preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
    },
  });
  aproposWin.on('closed', () => { aproposWin = null; });
  // La fenêtre s'ouvre déjà à la bonne taille quand elle a mesuré son contenu.
  // On la montre seulement à ce moment-là, sinon on verrait un redimensionnement
  // à l'écran — ce qui a l'air d'un défaut, pas d'un ajustement.
  aproposWin.once('ready-to-show', () => { if (aproposWin) aproposWin.show(); });
  aproposWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(pageApropos()));
};

const montrerPorte = (titre, message, progression) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.loadURL(portePage(titre, message, progression)).catch(() => {});
};

// Ouvre (enfin) l'administration. Seul endroit qui charge APP_URL après le
// lancement : si la porte ne l'appelle pas, l'admin ne s'ouvre pas.
const ouvrirAdmin = () => {
  _porteActive = false;
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.loadURL(APP_URL).catch(() => {});
};

// ⚠ LES DEUX ARGUMENTS SONT LE SUJET, PAS UN DÉTAIL.
// `quitAndInstall()` nu, avec un installateur NSIS « assisté » (oneClick:false),
// REJOUE TOUT L'ASSISTANT D'INSTALLATION à chaque mise à jour : bandeau bleu,
// pages Suivant/Fermer, case « Lancer l'application ». Personne ne veut voir ça
// pour une mise à jour qu'il n'a pas demandée, et une fenêtre laissée ouverte à
// la page « Fermer » laisse le poste SANS application ouverte.
//   quitAndInstall(isSilent = true, isForceRunAfter = true)
//     → installation silencieuse, puis RELANCE automatique de l'application.
// ⚠ L'installateur est `perMachine` (C:\Program Files) : Windows demandera quand
// même l'élévation (UAC). Silencieux ne veut pas dire sans autorisation.
const installerEtRelancer = (autoUpdater) => {
  try { autoUpdater.quitAndInstall(true, true); }
  catch { autoUpdater.quitAndInstall(); }   // repli : mieux vaut l'assistant que rien
};

const getUpdater = () => {
  const { autoUpdater } = require('electron-updater');
  if (!getUpdater._wired) {
    getUpdater._wired = true;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('update-available', () => { _majDispo = true; });
    autoUpdater.on('update-not-available', () => { _majDispo = false; });

    // Une barre qui avance est la différence entre « ça travaille » et « c'est
    // planté ». Un téléchargement de 80 Mo sur une ligne lente prend des minutes.
    autoUpdater.on('download-progress', (p) => {
      if (!_porteActive) return;
      const pct = Math.round(p && p.percent ? p.percent : 0);
      const mo = (n) => (n / 1048576).toFixed(0);
      montrerPorte('Mise à jour en cours',
        'Téléchargement de la nouvelle version : ' + pct + ' %'
        + (p && p.total ? ' (' + mo(p.transferred) + ' / ' + mo(p.total) + ' Mo)' : '')
        + '<br><span style="opacity:.6;font-size:13px">L’administration s’ouvrira après le redémarrage.</span>',
        pct);
    });

    // ⚠ L'EN-TÊTE D'APPLICATION EST INDISPENSABLE ICI.
    // Le flux de mise à jour est servi par adm-update.php, qui refuse (403) tout
    // client sans lui. Et il ne suffit PAS de l'avoir posé sur la session de la
    // fenêtre : electron-updater fait ses requêtes avec son propre client HTTP,
    // hors session Electron. Sans cette ligne, plus aucune mise à jour.
    autoUpdater.requestHeaders = { 'X-Sandriza-App': APP_KEY };

    // Un flux PAR PLATEFORME ET PAR ARCHITECTURE : un latest.yml commun ferait
    // proposer un paquet x64 à un poste ARM (et inversement).
    const os = process.platform === 'darwin' ? 'mac' : 'win';
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: 'https://adm.sandriza.com/update/' + os + '/' + process.arch + '/',
    });

    autoUpdater.on('update-downloaded', async (info) => {
      _updBusy = false;
      const version = (info && info.version) ? info.version : '';

      // ⚠ PENDANT LA PORTE : AUCUN CLIC. On redémarre tout seul.
      // Il y avait ici une fenêtre à un seul bouton « Redémarrer maintenant ».
      // Un bouton unique n'est pas un choix — c'est une interruption qui attend
      // qu'on la voie. Et à cet instant précis, PERSONNE N'EST EN TRAIN DE
      // TRAVAILLER : l'administration n'est même pas chargée, rien ne peut être
      // perdu. On annonce, on laisse le temps de lire, et on repart.
      // (Le report reste impossible : offrir « Plus tard » ici viderait de son
      // sens tout le mécanisme, puisqu'il suffirait de cliquer à côté pour
      // travailler sur une version périmée.)
      if (_porteActive) {
        montrerPorte('Mise à jour prête',
          'Version ' + version + ' prête. L’application redémarre toute seule.<br>'
          + '<span style="opacity:.6;font-size:13px">L’administration s’ouvrira ensuite.</span>',
          100);
        _porteActive = false;
        setTimeout(() => installerEtRelancer(autoUpdater), 1600);
        return;
      }

      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['Redémarrer maintenant', 'Plus tard'],
        defaultId: 0,
        cancelId: 1,
        title: 'Mise à jour prête',
        message: 'La version ' + version + ' est téléchargée.',
        detail: 'Elle s’installera au redémarrage de l’application.',
      });
      if (response === 0) { installerEtRelancer(autoUpdater); }
    });

    autoUpdater.on('error', async (err) => {
      _updBusy = false;
      const detail = String((err && err.message) || err);

      // ⚠ UNE PANNE DE MISE À JOUR NE DOIT PAS CONDAMNER LE POSTE.
      // Si le flux est injoignable (R2 en panne, réseau coupé, en-tête refusé),
      // bloquer l'entrée transformerait un incident d'infrastructure en arrêt de
      // travail sur TOUS les postes à la fois. On propose donc de réessayer, et
      // on laisse passer en le DISANT — c'est un échec de vérification, pas un
      // refus de mettre à jour.
      if (_porteActive) {
        const { response } = await dialog.showMessageBox(mainWindow, {
          type: 'warning',
          buttons: ['Réessayer', 'Continuer sans vérifier'],
          defaultId: 0,
          cancelId: 1,
          title: 'Mise à jour',
          message: 'Impossible de récupérer la mise à jour.',
          detail: detail + '\n\nVous pouvez continuer, mais cette version n’a pas pu être vérifiée.',
        });
        if (response === 0) { verifierAuLancement(); }
        else { ouvrirAdmin(); }
        return;
      }

      if (!getUpdater._manual) return; // vérification silencieuse : on ne dérange pas
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Mise à jour',
        message: 'Impossible de vérifier les mises à jour.',
        detail,
      });
    });
  }
  return autoUpdater;
};

const checkForUpdates = async (manual) => {
  if (!app.isPackaged) {
    if (manual) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Mise à jour',
        message: 'Indisponible en développement.',
        detail: 'Les mises à jour ne fonctionnent que dans l’application installée.',
      });
    }
    return;
  }
  if (_updBusy) return;
  _updBusy = true;
  let updater;
  try { updater = getUpdater(); }
  catch { _updBusy = false; return; } // electron-updater absent : sans effet
  getUpdater._manual = !!manual;
  try {
    const res = await updater.checkForUpdates();
    const remote = res && res.updateInfo && res.updateInfo.version;
    const isNew = remote && remote !== app.getVersion();
    if (!isNew) {
      _updBusy = false;
      if (manual) {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Mise à jour',
          message: 'Vous êtes à jour.',
          detail: 'Version installée : ' + app.getVersion() + '.',
        });
      }
      return;
    }
    if (manual) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Mise à jour',
        message: 'Version ' + remote + ' disponible.',
        detail: 'Le téléchargement se fait en arrière-plan ; vous serez averti quand elle sera prête.',
      });
    }
    // Le téléchargement part tout seul (autoDownload) ; `update-downloaded` prend le relais.
  } catch (err) {
    _updBusy = false;
    if (manual) {
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Mise à jour',
        message: 'Impossible de vérifier les mises à jour.',
        detail: String((err && err.message) || err),
      });
    }
  }
};

// ══ PORTE DE LANCEMENT : PAS DE CONNEXION SUR UNE VERSION PÉRIMÉE ═════════════
// Demande explicite : l'application vérifie ses mises à jour AU LANCEMENT et ne
// laisse pas ouvrir l'administration tant qu'elle n'est pas à jour.
//
// Trois issues, et une seule ouvre l'admin tout de suite :
//   • à jour            → on ouvre ;
//   • mise à jour dispo → l'écran reste, on télécharge, on redémarre ;
//   • vérification IMPOSSIBLE (réseau, flux en panne) → on ouvre en le disant.
//     Fermer dans ce cas ferait d'une panne de R2 un arrêt de travail général.
//
// ⚠ macOS : `electron-updater` ne peut RIEN installer tant que l'application
// n'est pas signée (Squirrel.Mac refuse un paquet non signé — voir
// electron-builder.yml). Y bloquer l'entrée enfermerait le poste dans une
// impasse : la version est périmée ET ne peut pas être remplacée. Sur Mac, on
// avertit et on laisse passer, jusqu'à ce qu'il y ait un certificat Apple.
const PORTE_DELAI_MS = 20000; // au-delà, on considère la vérification impossible

const verifierAuLancement = async () => {
  _porteActive = true;
  _majDispo = false;
  montrerPorte('Vérification des mises à jour', 'Un instant…');

  // En développement (npm start), il n'y a ni paquet ni flux : on ouvre.
  if (!app.isPackaged) { ouvrirAdmin(); return; }

  let updater;
  try { updater = getUpdater(); }
  catch { ouvrirAdmin(); return; }   // electron-updater absent : sans effet

  getUpdater._manual = false;
  _updBusy = true;

  // Une vérification qui ne répond JAMAIS est le pire cas : sans ce garde-fou,
  // l'écran d'attente resterait indéfiniment et l'application paraîtrait figée.
  let tranche = false;
  const minuterie = setTimeout(() => {
    if (tranche || !_porteActive) return;
    tranche = true;
    _updBusy = false;
    montrerPorte('Vérification impossible',
      'Le serveur de mise à jour n’a pas répondu. Ouverture de l’administration…');
    setTimeout(ouvrirAdmin, 1800);
  }, PORTE_DELAI_MS);

  try {
    await updater.checkForUpdates();
    if (tranche) return;
    tranche = true;
    clearTimeout(minuterie);

    if (!_majDispo) { _updBusy = false; ouvrirAdmin(); return; }

    if (process.platform === 'darwin') {
      montrerPorte('Nouvelle version disponible',
        'Une version plus récente existe. Sur macOS, la mise à jour se fait à la main tant que l’application n’est pas signée.');
      await dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['Continuer'],
        title: 'Mise à jour disponible',
        message: 'Une version plus récente d’Administration Sandriza est disponible.',
        detail: 'Sur macOS, téléchargez-la et réinstallez-la manuellement. L’installation automatique exige une application signée.',
      });
      _updBusy = false;
      ouvrirAdmin();
      return;
    }

    // Windows : l'écran reste, le téléchargement est déjà parti (autoDownload).
    // `update-downloaded` prendra le relais et redémarrera l'application.
    montrerPorte('Mise à jour requise',
      'Une version plus récente est disponible. Elle s’installe automatiquement.<br>'
      + '<span style="opacity:.62">L’administration ne s’ouvre pas sur une version périmée.</span>');
  } catch (err) {
    if (tranche) return;
    tranche = true;
    clearTimeout(minuterie);
    _updBusy = false;
    // Le gestionnaire `error` d'electron-updater a déjà pu proposer Réessayer /
    // Continuer. S'il ne s'est pas déclenché, on ne laisse pas la porte close.
    if (_porteActive) {
      montrerPorte('Vérification impossible',
        'Impossible de joindre le serveur de mise à jour. Ouverture de l’administration…');
      setTimeout(ouvrirAdmin, 1800);
    }
  }
};

// ══ MENU — LE DESSIN EST PASSÉ DANS LE SITE ═══════════════════════════════════
// ⚠ CE FICHIER NE DESSINE PLUS LA BARRE. Elle vit désormais dans
// `assets/js/appbar.js`, côté site (canal A), pour une raison de délai : chaque
// retouche d'apparence imposait ici de reconstruire cinq cibles, publier dans R2
// et réinstaller sur chaque poste — un quart d'heure pour changer une couleur.
// Dans le site, la même retouche est visible au rechargement suivant.
//
// Ce qui reste ici est ce que le site ne PEUT pas faire :
//   • les RACCOURCIS CLAVIER (Ctrl+1…5, Ctrl+N) — ils exigent un menu natif ;
//   • la FENÊTRE DÉTACHÉE, qui est une vraie fenêtre du système ;
//   • les ACTIONS D'APPLICATION (quitter, zoom, exports, mises à jour) ;
//   • les RÉGLAGES PAR POSTE (ancrage, taille), qui doivent survivre à un
//     vidage du cache du navigateur et ne pas voyager d'un poste à l'autre.
//
// Le site envoie son modèle par `menu:modele` : UNE SEULE SOURCE. La coquille
// ne décide jamais de ce qui s'affiche, elle en dérive ses raccourcis.

const { pageDetachee } = require('./menubar');
const reglages = require('./reglages');

// Dernier modèle reçu du site. Vide tant que la page n'a rien envoyé (site pas
// encore chargé, ou version du site antérieure à appbar.js).
let _modele = { menus: [], taille: 1.15, mode: 'haut', sombre: false };

// ── ACTIONS DE L'APPLICATION ─────────────────────────────────────────────────
const actionApp = (nom) => {
  const wc = mainWindow && !mainWindow.isDestroyed() ? mainWindow.webContents : null;
  switch (nom) {
    case 'quit':        app.quit(); break;
    case 'minimize':    if (mainWindow) mainWindow.minimize(); break;
    case 'reload':      if (wc) wc.reload(); break;
    case 'reload-hard': if (wc) wc.reloadIgnoringCache(); break;
    case 'devtools':    if (wc) wc.toggleDevTools(); break;
    case 'fullscreen':  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen()); break;
    case 'zoom-in':     if (wc) wc.setZoomLevel(wc.getZoomLevel() + 0.5); break;
    case 'zoom-out':    if (wc) wc.setZoomLevel(wc.getZoomLevel() - 0.5); break;
    case 'zoom-reset':  if (wc) wc.setZoomLevel(0); break;
    case 'exports':     shell.openPath(EXPORT_DIR()); break;
    case 'update-check': checkForUpdates(true); break;
    case 'about':       ouvrirApropos(); break;
    case 'about-copy':
      try { require('electron').clipboard.writeText(texteApropos()); } catch {}
      break;
    case 'print-test':
      if (wc) wc.print({ silent: true, printBackground: true }, (ok, why) => {
        const msg = ok ? 'Impression silencieuse envoyée à l’imprimante par défaut.'
                       : ('Échec de l’impression : ' + why);
        wc.executeJavaScript('console.log(' + JSON.stringify('[bureau] ' + msg) + ')').catch(() => {});
      });
      break;
    case 'sidebar-toggle':
      if (wc) wc.executeJavaScript("localStorage.getItem('elg_hide_admin_sidebar')==='1'", true)
        .then((masquee) => toggleSidebar(!masquee)).catch(() => {});
      break;
    case 'autolaunch-toggle':
      try { app.setLoginItemSettings({ openAtLogin: !app.getLoginItemSettings().openAtLogin }); } catch {}
      break;
    default:
      if (nom.indexOf('dock:') === 0) {
        const mode = nom.slice(5);
        if (['haut', 'gauche', 'droite', 'fenetre'].includes(mode)) { poserReglage('menuMode', mode); }
        break;
      }
      if (nom.indexOf('taille:') === 0) {
        const op = nom.slice(7);
        const a = reglages.get('menuTaille');
        poserReglage('menuTaille', op === '0' ? reglages.DEFAUTS.menuTaille : op === '+' ? a + 0.1 : a - 0.1);
        break;
      }
      break;
  }
};

// Un réglage change ⇒ il faut le dire AU SITE, qui est celui qui dessine.
// Sans cet avis, changer l'ancrage depuis la fenêtre détachée ne se verrait
// qu'au prochain rechargement de la page.
const poserReglage = (cle, valeur) => {
  reglages.set(cle, valeur);
  const wc = mainWindow && !mainWindow.isDestroyed() ? mainWindow.webContents : null;
  if (wc) wc.send('menu:reglages', reglages.lire());
  appliquerModeMenu();
};

ipcMain.handle('menu:action', (e, nom) => { actionApp(String(nom || '')); return true; });
ipcMain.handle('menu:reglages', () => reglages.lire());
ipcMain.handle('menu:set', (e, cle, valeur) => {
  if (cle === 'menuMode' || cle === 'menuTaille') { poserReglage(cle, valeur); }
  return reglages.lire();
});
// Le site pousse son modèle : on en tire les raccourcis et la fenêtre détachée.
ipcMain.handle('menu:modele', (e, m) => {
  if (m && typeof m === 'object' && Array.isArray(m.menus)) {
    _modele = m;
    buildMenu();
    if (reglages.get('menuMode') === 'fenetre') majPalette();
  }
  return true;
});

// Ajuste une fenêtre à la hauteur reelle de son contenu (voir pageApropos).
// ⚠ Bornée à l'écran : un contenu inattendu ne doit pas produire une fenêtre
// plus haute que le moniteur, qu'on ne pourrait plus ni lire ni fermer.
ipcMain.on('fenetre:hauteur', (e, h) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (!win || win.isDestroyed() || !h) return;
  try {
    const { screen } = require('electron');
    const dispo = screen.getDisplayMatching(win.getBounds()).workAreaSize.height;
    const [larg] = win.getContentSize();
    win.setContentSize(larg, Math.min(Math.max(320, Math.round(h)), dispo - 60));
    win.center();
  } catch {}
});

ipcMain.on('palette:action', (e, it) => {
  if (!it || typeof it !== 'object') return;
  if (it.app) { actionApp(String(it.app)); return; }
  if (it.section) { runAdmin(`Admin.renderSection('${String(it.section).replace(/'/g, '')}')`); if (mainWindow) mainWindow.focus(); return; }
  if (it.tab) {
    runAdmin(`Admin.renderSection('config');if(Admin.switchConfigTab)Admin.switchConfigTab('${String(it.tab).replace(/'/g, '')}')`);
    if (mainWindow) mainWindow.focus();
    return;
  }
  if (it.run) { runAdmin(String(it.run)); if (mainWindow) mainWindow.focus(); }
});

// ── MENU NATIF : MASQUÉ, GARDÉ POUR SES RACCOURCIS ───────────────────────────
// ⚠ On ne le supprime pas : c'est lui qui porte Ctrl+1…5 et Ctrl+N. Les
// réenregistrer en raccourcis GLOBAUX les volerait aux autres applications.
const versTemplateNatif = (items) => items.map((it) => {
  if (it.sep) return { type: 'separator' };
  if (it.sub) return { label: it.label, submenu: versTemplateNatif(it.sub) };
  if (it.app) return { label: it.label, accelerator: it.accel, click: () => actionApp(it.app) };
  if (it.section) return { label: it.label, accelerator: it.accel, click: () => runAdmin(`Admin.renderSection('${String(it.section).replace(/'/g, '')}')`) };
  if (it.tab) return { label: it.label, click: () => runAdmin(`Admin.renderSection('config');if(Admin.switchConfigTab)Admin.switchConfigTab('${String(it.tab).replace(/'/g, '')}')`) };
  return { label: it.label, accelerator: it.accel, click: () => runAdmin(String(it.run || '')) };
});

const buildMenu = () => {
  const template = (_modele.menus || [])
    .map((m) => ({ label: m.label, submenu: versTemplateNatif(m.items || []) }))
    .filter((m) => m.submenu.length);
  // Tant que le site n'a rien envoyé, un minimum : sans menu du tout, plus aucun
  // raccourci ne fonctionne et la fenêtre n'a plus de « Quitter ».
  if (!template.length) {
    template.push({ label: 'Fichier', submenu: [
      { label: 'Recharger', role: 'reload' },
      { type: 'separator' },
      { label: 'Quitter', role: 'quit' },
    ] });
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setMenuBarVisibility(false);
    mainWindow.autoHideMenuBar = true;
  }
};

// ── FENÊTRE DE MENU DÉTACHÉE ─────────────────────────────────────────────────
// Une vraie fenêtre, sans `parent:` — c'est ce qui lui permet de vivre sur un
// SECOND ÉCRAN. Avec un parent, Windows la garderait collée à la principale.
let paletteWin = null;
let _paletteSauve = null;

const sauverBornes = () => {
  if (!paletteWin || paletteWin.isDestroyed()) return;
  clearTimeout(_paletteSauve);
  // Un déplacement à la souris émet des dizaines d'événements : on n'écrit pas
  // un fichier à chaque pixel.
  _paletteSauve = setTimeout(() => {
    try { reglages.set('menuFenetre', paletteWin.getBounds()); } catch {}
  }, 400);
};

const fermerPalette = () => {
  if (paletteWin && !paletteWin.isDestroyed()) {
    paletteWin.removeAllListeners('closed');
    paletteWin.close();
  }
  paletteWin = null;
};

const majPalette = () => {
  const cfg = reglages.lire();
  const desc = {
    menus: _modele.menus || [],
    version: app.getVersion(),
    taille: cfg.menuTaille,
    sombre: !!_modele.sombre,
  };
  if (!desc.menus.length) return;   // rien à montrer tant que le site n'a rien dit

  if (!paletteWin || paletteWin.isDestroyed()) {
    const b = cfg.menuFenetre || {};
    paletteWin = new BrowserWindow({
      width: b.width || 260,
      height: b.height || 620,
      ...(Number.isFinite(b.x) && Number.isFinite(b.y) ? { x: b.x, y: b.y } : {}),
      title: 'Menu — Administration Sandriza',
      alwaysOnTop: !!cfg.menuToujoursDevant,
      minWidth: 200, minHeight: 260, autoHideMenuBar: true,
      backgroundColor: desc.sombre ? '#0e1522' : '#f6f7f9',
      webPreferences: {
        preload: path.join(__dirname, 'palette-preload.js'),
        contextIsolation: true, nodeIntegration: false, sandbox: true,
      },
    });
    paletteWin.on('moved', sauverBornes);
    paletteWin.on('resized', sauverBornes);
    // Refermer la palette à la main ne doit pas laisser l'application SANS
    // menu : on revient à l'ancrage en haut, comme si on l'avait rangée.
    paletteWin.on('closed', () => {
      paletteWin = null;
      if (reglages.get('menuMode') === 'fenetre') { poserReglage('menuMode', 'haut'); }
    });
  }
  paletteWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(pageDetachee(desc)));
};

// Applique le mode courant : la palette s'ouvre ou se referme. Le reste du
// dessin appartient au site.
const appliquerModeMenu = () => {
  if (reglages.get('menuMode') === 'fenetre') majPalette();
  else fermerPalette();
};

const dessinerMenus = () => { buildMenu(); appliquerModeMenu(); };

// ── Une seule instance ────────────────────────────────────────────────────────
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
  });

  app.whenReady().then(() => {
    // ⚠ AVANT createWindow() : le tout premier chargement de adm.sandriza.com doit
    // déjà porter l'en-tête, sinon le serveur nous prend pour un navigateur et
    // sert la page « Utilisez l'application » à notre propre fenêtre.
    armAppHeader();
    buildMenu();       // repli minimal ; le vrai menu arrive du site
    createWindow();
    startUsbWatch();

    // PORTE DE LANCEMENT : vérifie la version AVANT d'ouvrir l'administration.
    // C'est elle, et elle seule, qui charge APP_URL — voir verifierAuLancement().
    verifierAuLancement();

    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });

  app.on('before-quit', () => {
    if (_usbTimer) clearInterval(_usbTimer);
  });

  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
