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

const { app, BrowserWindow, BaseWindow, WebContentsView, ipcMain, shell, Menu, Notification, nativeImage, nativeTheme, powerSaveBlocker, session, dialog } = require('electron');
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

/* ⚠⚠ UNE PAGE VIERGE N'EST PAS UN LIEN EXTERNE (corrige le 2026-08-09).
   `window.open('', '_blank')` est LA maniere dont le site ouvre ses documents a
   imprimer — etat de compte, facture, bon de commande. L'URL vaut alors
   `about:blank`, que `isAllowed` refusait : le gestionnaire la passait donc a
   `shell.openExternal`, et Windows affichait << Obtenir une application pour
   ouvrir ce lien 'about' >>. Pire, `window.open` rendait `null` : la ligne
   suivante du site (`w.document.write`) levait << Cannot read properties of
   null >>, que la fenetre native affichait telle quelle.
   On laisse donc passer la page vierge — la fenetre d'impression s'ouvre — et
   on ne remet JAMAIS au systeme autre chose que du http(s) : lui tendre un
   `about:`, un `blob:` ou un `data:` ne peut produire qu'une bevue de ce genre. */
const estPageVierge = (urlStr) => {
  const u = String(urlStr || '').trim().toLowerCase();
  return u === '' || u === 'about:blank' || u === 'about:blank#blocked';
};
const versLExterieur = (urlStr) => {
  const u = String(urlStr || '').trim().toLowerCase();
  if (!/^https?:\/\//.test(u)) return;
  try { shell.openExternal(urlStr); } catch {}
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/* ══ UN DOCUMENT HTML CHANGE EN PDF ═══════════════════════════════════════════
   Meme patron que l impression silencieuse : le document est charge dans une
   fenetre CACHEE, puis rendu en PDF. Sert a JOINDRE un document a un courriel
   plutot que de le recopier dans le corps du message — un etat de compte colle
   dans un courriel se deforme d une messagerie a l autre, ne s imprime pas
   proprement et ne se garde pas ; une piece jointe, si (demande du 2026-08-09).
   Retour : { ok, base64, error } — le base64 est ce que Resend attend. */
const documentEnPdf = async (html, opts = {}) => {
  if (html == null || html === '') return { ok: false, error: 'aucun contenu' };
  const win = new BrowserWindow({
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  try {
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    // Les polices et les images (le logo) se posent APRES loadURL : sans ce
    // court repos, le PDF sort parfois sans son en-tete.
    await delay(350);
    const buf = await win.webContents.printToPDF({
      printBackground: true,
      landscape: !!opts.paysage,
      margins: { marginType: 'custom', top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
      pageSize: opts.format || 'Letter',
    });
    return { ok: true, base64: buf.toString('base64') };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  } finally {
    try { if (!win.isDestroyed()) win.destroy(); } catch {}
  }
};

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

    const envoyer = (nom) => new Promise((resolve) => {
      win.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: nom || '',                 // '' = imprimante par défaut du poste
        copies: Math.max(1, parseInt(copies, 10) || 1),
        landscape: !!landscape,
        margins: { marginType: 'none' },
        pageSize,
      }, (success, failureReason) => {
        resolve({ ok: !!success, error: success ? null : (failureReason || 'échec inconnu') });
      });
    });

    const r = await envoyer(deviceName);
    if (r.ok || !deviceName) return r;

    /* ⚠ REPLI SUR L'IMPRIMANTE PAR DÉFAUT, DEMANDÉ PAR L'UTILISATEUR (2026-08-07) :
       « si l'imprimante n'est pas disponible alors mettre une imprimante par défaut
       simplement ». Une imprimante éteinte, débranchée ou renommée ne doit pas
       arrêter une vente.
       ⚠ APRÈS L'ÉCHEC, JAMAIS AVANT. On aurait pu vérifier d'avance que
       l'imprimante existe — mais énumérer les imprimantes OUVRE LE PILOTE DE
       CHACUNE, ce qui bloque quand une thermique Bluetooth est en train de recevoir.
       Le contrôle préalable aurait donc causé la panne qu'il prétend éviter.
       ⚠ ET LE REPLI SE DIT. Le retour porte `repli: true` et le nom réel : une
       étiquette 4 × 6 sortie sur une imprimante à feuilles est acceptable dans
       l'urgence, mais il faut le SAVOIR — sinon on cherche longtemps pourquoi le
       rouleau n'a pas bougé. */
    const r2 = await envoyer('');
    return r2.ok
      ? { ok: true, error: null, repli: true, demandee: deviceName }
      : { ok: false, error: r.error + ' (repli sur l’imprimante par défaut : ' + r2.error + ')' };
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

// ⚠ LE DECOMPTE AVANT DECONNEXION DOIT ETRE VU, sinon il n avertit personne.
// Il s ouvre dans la fenetre principale, et le travail se fait maintenant dans des
// fenetres natives : la boite s ouvrait donc derriere elles. L usager etait
// deconnecte sans avoir rien vu (2026-08-07).
// ⚠ TROIS GESTES, PARCE QU AUCUN NE SUFFIT SEUL :
//   — `restore` : Windows refuse de mettre au premier plan une fenetre reduite ;
//   — `show`+`focus` : la remonter au-dessus des fenetres natives ;
//   — `flashFrame` : Windows peut REFUSER le premier plan a une application qui n a
//     pas le focus (regle du systeme, pas un defaut). Le clignotement dans la barre
//     des taches est alors le seul signal qui passe — et il reste visible si la
//     personne regarde ailleurs.
/* ═══════════════════════════════════════════════════════════════════════════
   LE DÉCOMPTE D'INACTIVITÉ, EN FENÊTRE À PART
   ---------------------------------------------------------------------------
   ⚠⚠ SIGNALÉ DEUX FOIS (2026-08-07, puis 2026-08-09 : « je ne vois plus encore
   le décompte, la session se ferme toute seule »). L'avertissement vivait dans
   la fenêtre PRINCIPALE — celle qu'on ne regarde justement pas, puisque le
   travail se fait dans les fenêtres natives. Deux rustines ont été essayées :
   ramener la principale devant, puis voiler la vue ancrée. Ni l'une ni l'autre
   ne couvre un second écran, une fenêtre détachée par-dessus, ou un système qui
   refuse le premier plan.
   Un avertissement dont la visibilité DÉPEND de l'endroit où se trouve une autre
   fenêtre n'est pas un avertissement. Celui-ci est TOUJOURS AU-DESSUS, petit,
   non redimensionnable, et il ne retient aucune position : il paraît au centre
   de l'écran de la fenêtre principale, là où l'œil est.
   ⚠ Il ne décide RIEN : le minuteur, le seuil et la déconnexion restent au site.
   ═══════════════════════════════════════════════════════════════════════════ */
let decompteWin = null;
const fermerDecompte = () => {
  if (decompteWin && !decompteWin.isDestroyed()) { try { decompteWin.destroy(); } catch {} }
  decompteWin = null;
};
const ouvrirDecompte = (secondes) => {
  if (decompteWin && !decompteWin.isDestroyed()) { try { decompteWin.show(); } catch {} return; }
  let x, y;
  try {
    const b = (mainWindow && !mainWindow.isDestroyed()) ? mainWindow.getBounds() : null;
    if (b) { x = Math.round(b.x + (b.width - 460) / 2); y = Math.round(b.y + (b.height - 250) / 3); }
  } catch {}
  decompteWin = new BrowserWindow({
    width: 460, height: 250,
    ...(Number.isFinite(x) && Number.isFinite(y) ? { x, y } : {}),
    resizable: false, minimizable: false, maximizable: false, fullscreenable: false,
    alwaysOnTop: true, skipTaskbar: false, show: false,
    title: 'Déconnexion imminente', autoHideMenuBar: true, backgroundColor: '#0e1522',
    webPreferences: {
      preload: path.join(__dirname, 'pont-preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
    },
  });
  // « screen-saver » passe AU-DESSUS du plein écran d'une autre fenêtre : c'est
  // exactement le cas qu'on rate autrement, quelqu'un qui travaille en plein
  // écran dans une fenêtre native.
  try { decompteWin.setAlwaysOnTop(true, 'screen-saver'); } catch {}
  try { decompteWin.setVisibleOnAllWorkspaces(true); } catch {}
  decompteWin.on('page-title-updated', (ev) => { ev.preventDefault(); });
  decompteWin.setTitle('Déconnexion imminente');
  /* ⚠ FERMER CETTE FENÊTRE NE PROLONGE RIEN ET NE DÉCONNECTE RIEN. Le site tient
     l'horloge ; si l'on pouvait s'en débarrasser d'un clic sur la croix, on aurait
     un décompte invisible qui court toujours — précisément le défaut qu'on corrige. */
  decompteWin.on('closed', () => { decompteWin = null; });
  decompteWin.once('ready-to-show', () => {
    try { decompteWin.show(); decompteWin.focus(); decompteWin.flashFrame(true); } catch {}
  });
  decompteWin.loadURL('data:text/html;charset=utf-8,'
    + encodeURIComponent(pageInactivite(secondes)));
};
ipcMain.on('session:decompte', (_e, secondes) => {
  const n = parseInt(secondes, 10);
  if (Number.isFinite(n) && n > 0) ouvrirDecompte(n); else fermerDecompte();
});

ipcMain.on('win:attention', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    mainWindow.flashFrame(true);
    // On arrete le clignotement des que la fenetre est reellement regardee : le
    // laisser courir apres coup ferait clignoter une fenetre deja lue.
    mainWindow.once('focus', () => { try { mainWindow.flashFrame(false); } catch {} });
  } catch {}
});
// ⚠ CINQUIÈME CHEMIN, TROUVÉ EN CHERCHANT. Le bouton de fermeture dessiné dans la
// page passe par ici, pas par `menu:action` : garder les quatre autres et oublier
// celui-là aurait laissé le bouton le plus évidemment cliquable casser
// l'installation. Le garde de `close` en dessous rattraperait le coup, mais sans
// rien expliquer — on préfère le message.
ipcMain.on('win:close', (e) => {
  if (fermetureBloquee()) { refuserFermeture(); return; }
  BrowserWindow.fromWebContents(e.sender)?.close();
});

// ══ PHASE 3 — NOTIFICATIONS NATIVES + PASTILLE SUR L'ICÔNE ════════════════════
const ICON_PATH = path.join(__dirname, '..', 'build', 'icon.png');
/**
 * UNE SEULE FABRIQUE DE NOTIFICATION.
 *
 * ⚠ LE TITRE EST LE SUJET, PAS LE NOM DE L'APPLICATION. Windows écrit déjà le
 * nom de l'application en en-tête ; le répéter en titre donnait trois lignes
 * dont deux disaient la même chose, et la seule qui portait l'information
 * arrivait en dernier. On lit une notification en diagonale : le premier mot
 * doit être ce qui vient d'arriver.
 *
 * ⚠ UN CLIC RAMÈNE LA FENÊTRE. Une notification qu'on ne peut pas suivre oblige
 * à retrouver l'application à la main, et l'on a déjà oublié pourquoi.
 */
const notifier = (titre, corps, options = {}) => {
  try {
    const n = new Notification({
      title: String(titre || 'Administration Sandriza'),
      body: String(corps || ''),
      icon: fs.existsSync(ICON_PATH) ? ICON_PATH : undefined,
      silent: !!options.silent,
    });
    n.on('click', () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
      if (options.aller) { try { mainWindow.webContents.send('dock:naviguer', options.aller); } catch {} }
    });
    n.show();
    return true;
  } catch { return false; }
};
ipcMain.handle('notify', (e, opts = {}) => notifier(opts.title, opts.body, { silent: opts.silent }));

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
ipcMain.handle('doc:pdf', async (e, html, opts) => documentEnPdf(html, opts || {}));

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
        /* ⚠ LA DATE DE MODIFICATION EST RENDUE, et c est ce qui permet de trier
           une carte d appareil photo par prise recente. Sans elle, l ordre est
           celui du systeme de fichiers — c est-a-dire aucun ordre utile. */
        try {
          const st = fs.statSync(full);
          out.push({ path: full, name: en.name, size: st.size, mtime: st.mtimeMs });
        } catch {}
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
/* ⚠⚠ UNE VIGNETTE, PAS L IMAGE ENTIERE. Montrer 200 photos d une carte pour en
   choisir vingt, c est 200 fichiers de 5 Mo — un gigaoctet a faire passer par le
   pont pour un ecran de choix. On renvoie donc une image REDUITE, et l original
   n est lu qu au moment ou l on importe vraiment.
   ⚠ Le redimensionnement se fait ici avec `nativeImage`, sans canevas : le
   processus principal n a pas de DOM, et il n en a pas besoin pour cela. */
/**
 * L'orientation EXIF d'un JPEG, lue à même le fichier.
 *
 * ⚠⚠ `nativeImage` NE L'APPLIQUE PAS. C'est pourquoi la planche de choix montrait
 * les photos couchées alors que l'import, lui, les redressait : deux chemins,
 * deux comportements, et l'écran où l'on CHOISIT était le seul à mentir. On lit
 * donc l'étiquette ici aussi, et on la rend avec la vignette.
 * ⚠ On ne lit que le début du fichier : l'EXIF vit dans les premiers kilo-octets,
 * et ouvrir 5 Mo pour deux octets, deux cents fois, se sentirait.
 */
const exifOrientation = (chemin) => {
  try {
    const fd = fs.openSync(chemin, 'r');
    const buf = Buffer.alloc(131072);
    const lus = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    if (lus < 4 || buf.readUInt16BE(0) !== 0xFFD8) return 1;
    let d = 2;
    while (d < lus - 4) {
      const marque = buf.readUInt16BE(d);
      const taille = buf.readUInt16BE(d + 2);
      if (marque === 0xFFE1) {
        if (buf.readUInt32BE(d + 4) !== 0x45786966) return 1;   // « Exif »
        const t = d + 10;
        const petitBout = buf.readUInt16BE(t) === 0x4949;
        const lireU16 = (o) => (petitBout ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
        const lireU32 = (o) => (petitBout ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
        const debut = t + lireU32(t + 4);
        const nb = lireU16(debut);
        for (let k = 0; k < nb; k++) {
          const en = debut + 2 + k * 12;
          if (lireU16(en) === 0x0112) {
            const o = lireU16(en + 8);
            return (o >= 1 && o <= 8) ? o : 1;
          }
        }
        return 1;
      }
      if ((marque & 0xFF00) !== 0xFF00) break;
      d += 2 + taille;
    }
    return 1;
  } catch { return 1; }
};

ipcMain.handle('usb:vignette', (e, filePath, cote) => {
  try {
    const c = Math.max(64, Math.min(512, parseInt(cote, 10) || 220));
    const chemin = String(filePath || '');
    const img = nativeImage.createFromPath(chemin);
    if (img.isEmpty()) return null;
    const t = img.getSize();
    const ech = Math.min(1, c / Math.max(t.width || 1, t.height || 1));
    const petite = (ech < 1)
      ? img.resize({ width: Math.max(1, Math.round((t.width || 1) * ech)), quality: 'good' })
      : img;
    /* ⚠ ON REND L ORIENTATION PLUTOT QUE DE PIVOTER ICI. Faire tourner les pixels
       coûterait un décodage et un réencodage par vignette, deux cents fois, pour
       une image qu'on ne fait que REGARDER. La fenêtre l'applique en CSS : c'est
       gratuit et exact. L'import, lui, pivote pour de vrai. */
    return { image: petite.toDataURL(), orientation: exifOrientation(chemin) };
  } catch { return null; }
});

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
  /* ⚠⚠ LE PREMIER TOUR NE NOTIFIE RIEN (demande du 2026-08-09 : << pas besoin de
     me faire le toast a chaque ouverture >>). `_knownDrives` partait vide, donc
     TOUT ce qui etait deja branche au lancement passait pour une nouveaute : on
     recevait la meme notification a chaque ouverture de l application, pour une
     cle qui n avait pas bouge depuis des semaines.
     << Une cle est APPARUE >> ne veut rien dire tant qu on ne sait pas ce qui
     etait la avant. Le premier tour ne fait donc que RECENSER. */
  let premierTour = true;
  const tick = async () => {
    const drives = await listRemovableDrives();
    const now = new Set(drives);
    if (premierTour) { premierTour = false; _knownDrives = now; return; }
    for (const d of drives) {
      if (!_knownDrives.has(d)) {
        const photos = scanDrivePhotos(d);
        if (photos.length && mainWindow) {
          mainWindow.webContents.send('usb:photos', { drive: d, photos });
          /* ⚠ LE SUJET EN TITRE, LE DETAIL EN CORPS, et le clic MENE a la
             photothèque. L ancienne version repetait le nom de l application en
             titre et laissait l information en troisieme ligne, avec un tiret
             de decoration au milieu. */
          notifier(
            photos.length + ' photo' + (photos.length > 1 ? 's' : '') + ' sur la clé ' + d,
            'Ouvrez la photothèque pour les importer. Rien n’est importé sans votre accord.',
            { aller: 'photos' });
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
  // #41 : la barre de titre OS des fenetres a cadre standard doit naitre du bon
  // cote du theme des le demarrage (avant meme d en ouvrir une).
  _majThemeOS();
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#111827',
    title: 'Administration Sandriza',
    // ⚠ BARRE DE TITRE PERSONNALISÉE (2026-08-12) : cadre gris de Windows retiré,
    // barre foncée assortie au thème ; les boutons OS (réduire/agrandir/fermer)
    // sont teintés par `titleBarOverlay`. La barre de menu native
    // (Fichier/Affichage/Aide) sert de bande de titre déplaçable — pas de bande
    // maison. ⚠ PAS de `height` forcé : Windows déformait les boutons (2.60.0) ;
    // on laisse la hauteur naturelle des boutons de légende. Réversible : retirer
    // ces deux clés pour revenir au cadre natif.
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0e1522', symbolColor: '#e8edf5' },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // durcissement : la page n'a jamais accès direct à Node
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
      // ⚠ LA VERSION VOYAGE PAR ICI, ET C'EST LA SEULE VOIE FIABLE. Elle était
      // RECOPIÉE À LA MAIN dans `preload.js` — et elle y annonçait encore 1.18.0
      // alors que la coquille était en 1.19.1. Conséquence : le journal du
      // personnel enregistrait la mauvaise version, et la fenêtre des notes
      // marquait « installée ici » sur la mauvaise ligne. Un numéro recopié
      // finit toujours par mentir.
      // Le préchargement tourne en bac à sable : ni `require('../package.json')`,
      // ni `app` n'y sont accessibles. `additionalArguments` traverse le bac à
      // sable et reste lisible dans `process.argv`.
      additionalArguments: ['--sz-version=' + app.getVersion()],
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

  // Le plein écran de la fenêtre principale agrandit son contenu ET celui des
  // vues ancrées qu'elle porte (voir _zoomPartout).
  _suivrePleinEcran(mainWindow);

  mainWindow.webContents.on('did-finish-load', () => {
    applySidebarPref(mainWindow.webContents);
    // Un rechargement de la page perd la classe : on la repose si l'on est
    // toujours en plein écran.
    _zoomRattraper(mainWindow.webContents);
    capturerMarque();
    // La barre elle-même est dessinée par le SITE (appbar.js). Ici on remet
    // seulement le menu natif — qui porte les raccourcis — et la palette.
    dessinerMenus();
  });

  // Liens externes → navigateur par défaut ; jamais dans l'application.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // La page vierge sert aux documents a imprimer : on la laisse s ouvrir.
    if (estPageVierge(url)) return { action: 'allow' };
    if (!isAllowed(url)) { versLExterieur(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });

  // Navigation hors des hôtes autorisés bloquée (défense en profondeur).
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (estPageVierge(url)) return;
    if (!isAllowed(url)) { e.preventDefault(); versLExterieur(url); }
  });

  // ⚠ QUATRE CHEMINS MÈNENT À LA FERMETURE, et il faut les quatre : le X du
  // cadre natif, Alt+F4, l'entrée « Quitter » du menu, et le bouton de la barre
  // dessinée dans la page (qui passe par `menu:action`). En couvrir trois laisse
  // le quatrième casser l'installation.
  mainWindow.on('close', (ev) => {
    if (fermetureBloquee()) { ev.preventDefault(); refuserFermeture(); }
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

// ══ PROTECTION DU PROCESSUS PENDANT UNE MISE À JOUR ═══════════════════════════
// ⚠ UNE MISE À JOUR INTERROMPUE PEUT LAISSER UNE INSTALLATION CASSÉE. Le paquet
// fait ~75 Mo : sur une ligne lente, le téléchargement dure des minutes, et rien
// n'empêchait de fermer la fenêtre au milieu. Pire, l'installateur NSIS est déjà
// lancé au moment de l'installation — le tuer là laisse des fichiers à moitié
// remplacés, et l'application ne redémarre plus.
//
// ⚠ CE N'EST PAS `_updBusy`. Celui-là est vrai dès la simple VÉRIFICATION, qui
// dure une seconde et qu'on peut interrompre sans conséquence : bloquer là-dessus
// empêcherait de fermer l'application pendant un contrôle anodin, ce qui
// ressemblerait à un blocage.
let _majCritique = false;
// ⚠ UN SEUL ENDROIT DÉCIDE. Les quatre chemins de fermeture posaient la même
// condition à la main : en oublier un morceau dans l'un d'eux (le plafond de
// sécurité, par exemple) aurait donné trois gardes qui cèdent et un qui bloque.
const fermetureBloquee = () => _majCritique && !_quitAutorise && !majFigee();

// ⚠⚠ INTERCEPTER LE CLIC NE SUFFIT PAS : IL FAUT DÉSACTIVER LE BOUTON.
// C'est ce qui manquait à la 1.19.2, et l'utilisateur l'a vu tout de suite : le X
// de la barre de titre restait NORMAL, donc il paraissait fonctionner. On cliquait,
// il ne se passait rien de visible, et l'on concluait que la protection était
// inopérante — puis on insistait, ou l'on tuait le processus.
// `setClosable(false)` fait GRISER le X par Windows lui-même : le bouton dit alors
// tout seul qu'il n'est pas disponible, avant même qu'on le presse. L'interception
// reste, comme filet — Alt+F4 et `app.quit()` ne passent pas par le bouton.
// ⚠ ON NE TOUCHE PAS À « RÉDUIRE ». Réduire pendant une mise à jour est inoffensif,
// et souvent ce qu'on veut faire pour continuer à travailler ailleurs.
let _closableActuel = true;
const majBoutonsFermeture = () => {
  const bloque = fermetureBloquee();
  const veut = !bloque;
  if (veut === _closableActuel) return;      // rien à changer
  _closableActuel = veut;
  for (const w of BrowserWindow.getAllWindows()) {
    // ⚠ TOUTES LES FENÊTRES, pas seulement la principale. Fermer la dernière
    // fenêtre déclenche `window-all-closed` → `app.quit()`, donc fermer une fenêtre
    // native pendant une mise à jour pouvait faire quitter l'application par la
    // porte de derrière.
    try { if (!w.isDestroyed()) w.setClosable(veut); } catch {}
  }
};
// Seule la mise à jour elle-même a le droit de quitter. Sans ce laissez-passer, le
// garde ci-dessous empêcherait le redémarrage qui INSTALLE la mise à jour — donc
// la protection tuerait précisément ce qu'elle protège.
let _quitAutorise = false;

const MSG_MAJ_T = 'Mise à jour en cours';
const MSG_MAJ_D = 'L’application ne peut pas être fermée pendant l’installation d’une '
  + 'mise à jour : le paquet est en cours d’écriture, et l’interrompre laisserait une '
  + 'installation incomplète.\n\nElle redémarrera toute seule dès que ce sera terminé.';

// ⚠ ON NE SE CONTENTE PAS D'IGNORER LE GESTE. Un bouton qui ne fait rien est un
// défaut qu'on ne peut pas diagnostiquer : on clique plus fort, puis on tue le
// processus par le gestionnaire des tâches — exactement ce qu'on voulait éviter.
// Horodatage du dernier octet reçu. Il sert de PLAFOND DE SÉCURITÉ, voir ci-dessous.
let _majDernierOctet = 0;
const MAJ_SANS_PROGRES_MS = 3 * 60 * 1000;

// ⚠ PLAFOND DE SÉCURITÉ, À NE PAS RETIRER. Le pire défaut possible de cette
// protection serait de rester coincée : un téléchargement figé (serveur qui ne
// répond plus sans jamais émettre d'erreur, veille de la machine, réseau qui
// disparaît) laisserait une application qu'on ne peut plus fermer autrement qu'en
// tuant le processus — ce qui est exactement ce qu'on cherchait à éviter, en pire.
// On vérifie donc AU MOMENT DU GESTE : plus de trois minutes sans un seul octet,
// et la fermeture est rendue. Pas de minuteur à entretenir, et le contrôle a lieu
// précisément quand il compte.
const majFigee = () => _majDernierOctet > 0 && (Date.now() - _majDernierOctet) > MAJ_SANS_PROGRES_MS;

let _avisMajLe = 0;
const refuserFermeture = () => {
  // Un seul avis à la fois : trois clics d'affilée ne doivent pas empiler trois
  // boîtes qu'il faudra fermer une par une.
  const t = Date.now();
  if (t - _avisMajLe < 2500) return;
  _avisMajLe = t;
  if (_porteActive) { montrerPorte(MSG_MAJ_T, MSG_MAJ_D.replace(/\n\n/g, '<br><br>')); return; }
  try {
    dialog.showMessageBox(mainWindow && !mainWindow.isDestroyed() ? mainWindow : null, {
      type: 'warning', title: MSG_MAJ_T, message: MSG_MAJ_T, detail: MSG_MAJ_D, buttons: ['Compris'],
    });
  } catch {}
};

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
    + '.wrap{width:100%;max-width:520px;animation:rise .6s cubic-bezier(.16,.84,.44,1) both}'
    + '.kicker{display:block;font-size:.69rem;font-weight:600;color:#9a7d62;margin-bottom:.7rem;'
    +   'text-transform:uppercase;letter-spacing:.08em}'
    + '.h1{font-size:1.55rem;font-weight:800;color:#1a1207;font-family:Georgia,serif;letter-spacing:.01em;line-height:1.25;margin:0}'
    + '.sub{font-size:.84rem;color:#7a6652;line-height:1.75;margin-top:.85rem}'
    + '.pg{width:100%;height:7px;border-radius:99px;background:rgba(196,154,108,.16);overflow:hidden;margin-top:2.1rem}'
    + '.pg-in{height:100%;background:linear-gradient(90deg,#C49A6C,#e0bd93);border-radius:99px;transition:width .25s ease}'
    + '.pulse{margin-top:2.1rem;height:7px;border-radius:99px;background:rgba(196,154,108,.16);overflow:hidden;position:relative}'
    + '.pulse::after{content:"";position:absolute;top:0;bottom:0;width:38%;border-radius:99px;'
    +   'background:linear-gradient(90deg,transparent,#C49A6C,transparent);animation:slide 1.5s ease-in-out infinite}'
    + '.ver{margin-top:2.2rem;padding-top:1.2rem;border-top:1px solid rgba(196,154,108,.22);'
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
    + '.brand{flex:0 0 268px;background:' + bg + ';position:relative;overflow:hidden;'
    +   'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.6rem 1.2rem;text-align:center}'
    + '.orb{position:absolute;border-radius:50%;filter:blur(52px);opacity:.5;pointer-events:none}'
    + '.o1{width:230px;height:230px;background:' + b.logoG + ';top:-70px;left:-60px;animation:f1 17s ease-in-out infinite}'
    + '.o2{width:190px;height:190px;opacity:.4;background:linear-gradient(135deg,#a855f7,#6d28d9);bottom:-60px;right:-40px;animation:f2 21s ease-in-out infinite}'
    + '.bi{position:relative;z-index:2}'
    + '.bd{width:62px;height:62px;border-radius:17px;display:flex;align-items:center;justify-content:center;'
    +   'font:800 1.7rem/1 Georgia,serif;color:#fff;margin:0 auto .9rem;box-shadow:0 12px 30px rgba(0,0,0,.34)}'
    + '.lg{display:block;width:100%;max-width:210px;height:auto;margin:0 auto 1.1rem}'
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
    width: 830, height: 560, show: false, resizable: false, minimizable: false, maximizable: false,
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

// ═══ PONT DES FENÊTRES NATIVES ═══════════════════════════════════════════════
// Une fenêtre native n'a ni session ni accès au site : elle envoie un NOM
// d'opération, et c'est la fenêtre PRINCIPALE — déjà connectée — qui l'exécute.
//
// ⚠ DEUX LISTES FERMÉES, PAS UNE. Le site en a une (`SzPont`), la coquille garde
// la sienne ici. Ce n'est pas une redondance : sans celle-ci, la coquille
// transmettrait n'importe quel nom reçu d'une fenêtre, et toute faiblesse future
// du site deviendrait atteignable depuis un document local.
// ⚠ CETTE LISTE DOIT SUIVRE `OPS` DE `assets/js/pont.js`. Elles sont deux
// EXPRÈS — voir plus haut — mais c'est aussi le piège : ajouter une opération au
// site sans l'ajouter ICI donne « Cette version de l'application ne connaît pas
// cette opération », et la fenêtre est vide sans que rien n'indique laquelle des
// deux listes manque. C'est arrivé le 2026-08-06 avec les assistants Fournisseur
// et Collection. En ajouter une : LES DEUX FICHIERS, dans le même geste.
const OPS_PONT = new Set([
  'identite',
  'imprimantes:etat', 'imprimantes:choisir', 'imprimantes:tester',
  'imprimantes:liste', 'imprimantes:definir',
  'fournisseur:contexte', 'fournisseur:lire', 'fournisseur:enregistrer',
  'collection:contexte', 'collection:decrire', 'collection:lire', 'collection:enregistrer',
  'produit:contexte', 'produit:sku', 'produit:nip', 'produit:nipExige',
  'photos:liste',
  'produit:decrire', 'produit:lire', 'produit:enregistrer',
  'produit:brouillonLire', 'produit:brouillonEcrire', 'produit:brouillonJeter',
  'produit:changements', 'produit:historique',
  'caisse:etat',
  'commande:contexte', 'commande:lire', 'commande:bon',
  'commande:etiquette', 'commande:prete', 'commande:expedier',
  // Le code scanne se resout DANS LE SITE (Barcode.payload) : la forme compacte
  // du SKU n est pas la forme affichee, et la reecrire ici cesserait de marcher
  // le jour ou l encodage change, sans que rien ne le signale.
  'commande:scan', 'commande:statut',
  'verrou:prendre', 'verrou:rendre',
  // « Il y a quelqu'un » — sans ceci, travailler dans une fenêtre native passe
  // pour une absence et le minuteur d'inactivité déconnecte une personne affairée.
  'session:activite',
  // Les deux gestes du decompte d inactivite, rendus depuis SA fenetre.
  'session:rester', 'session:fermer',
  // Vente au comptoir. ⚠ `caisse:vendre` est la SEULE opération de ce pont qui
  // encaisse de l'argent : toute la règle de vente reste dans le site
  // (`Admin._posVente`), le pont ne porte que des valeurs.
  'caisse:contexte', 'caisse:chercher', 'caisse:article',
  'caisse:totaux', 'caisse:client', 'caisse:vendre',
  // ⚠ `caisse:diffuser` passe par la fenetre PRINCIPALE a dessein : le canal
  // `pos:diffuser` n accepte qu elle. Sans cela, une fenetre quelconque pourrait
  // afficher n importe quel montant devant le client au moment de payer.
  'caisse:diffuser', 'caisse:affichage',
  // Ajustement de stock. ⚠ `stock:enregistrer` écrit un INVENTAIRE : toute la
  // règle reste dans le site (`Admin._stockEcrire`, sans le moindre DOM), le pont
  // ne porte que des valeurs. La version qui lisait le formulaire aurait enregistré
  // une grille de zéros depuis cette fenêtre, sans un message.
  'stock:contexte', 'stock:reappro', 'stock:chercher',
  'stock:lire', 'stock:enregistrer', 'stock:etiquettes',
  // Inventaire COMPLET (les 4 onglets). La pagination et les filtres vivent
  // dans le site ; les lots recoivent des IDENTIFIANTS, jamais des cases.
  'stock:produits', 'stock:skuUn', 'stock:skuTous', 'stock:skuPad6',
  'stock:venteFinale', 'stock:vendre', 'stock:endommages',
  'stock:endommagesRapport', 'stock:entrepots', 'stock:entrepotEcrire',
  'stock:entrepotSupprimer', 'stock:modifier', 'stock:supprimer',
  // L'apercu de la suppression : le nom et les photos de la mediatheque que la
  // fiche emploie — pour la question << les retirer aussi ? >> (volontaire).
  'stock:supprimerApercu',
  // Expédition. ⚠ `expedition:etiquette` DÉPENSE DE L'ARGENT — une étiquette est
  // facturée dès sa création. Toute la règle (garde anti-double-achat, secrets
  // transporteurs, XML) reste dans le site ; le pont ne porte que le service et
  // le poids, qui sont précisément ce que la fenêtre doit pouvoir choisir.
  'expedition:contexte', 'expedition:lire', 'expedition:etiquette',
  'expedition:pdf', 'expedition:imprimer', 'expedition:bordereau',
  'expedition:confirmer',
  // Les deux listes. ⚠ `commandes:liste` sert les DEUX vues (en cours / parties) :
  // ce sont les memes lignes filtrees autrement, et deux operations jumelles
  // finiraient par diverger. Le tri, le filtre et la pagination se font dans le
  // site : envoyer trois mille commandes pour en afficher vingt ferait passer
  // plusieurs megaoctets par ce pont a chaque frappe dans la recherche.
  'commandes:contexte', 'commandes:liste',
  // Le DETAIL d une commande dans la fenetre Commandes : lecture complete,
  // statut (apercu/ecriture, case courriels), suppression (cascade, Square),
  // frais retenus, renvoi vers Remboursement, facture dans la fenetre principale.
  'commandes:detail', 'commandes:statutApercu', 'commandes:statutEcrire',
  'commandes:supprimerApercu', 'commandes:supprimerEcrire',
  // Rattacher la commande a un compte client (ou la detacher) : la fenetre
  // cherche AVANT d ecrire, d ou trois ops. L ecran web n avait pas de jumeau.
  'commande:lierApercu', 'commande:lierChercher', 'commande:lierEcrire',
  'commandes:fraisApercu', 'commandes:fraisEcrire',
  'commandes:rembourser', 'commandes:facture', 'commandes:ouvrirDetail',
  'facture:lire', 'facture:imprimer',
  // La LISTE des factures (fenetre Factures) et l ouverture d une facture
  // depuis cette liste (fenetre Facture existante, une par facture).
  'factures:liste', 'factures:ouvrir',
  // La LISTE des produits en vente (fenetre Produits) : la page filtree par le
  // site, l ouverture de l assistant sur une fiche, et l assistant vierge.
  'produits:liste', 'produits:ouvrir', 'produits:nouveau',
  // Les quatre listes restantes du palier 2 (1.54.0) : meme patron — la page
  // filtree par le site, le clic ouvre la fenetre native de la chose.
  'clients:liste', 'clients:ouvrir',
  'collections:liste', 'collections:ouvrir', 'collections:nouvelle',
  'fournisseurs:liste', 'fournisseurs:ouvrir', 'fournisseurs:nouveau',
  'retours:liste', 'retours:ouvrir',
  // Liens d installation (2.9.0, refondus en 2.10.0) : le registre des liens
  // remis au dehors, leur fabrication, leur revocation et le journal des acces.
  // ⚠ TOUT L ETAT VIT AU SERVEUR : c est ce qui rend la revocation immediate et
  // le compte d usages honnete. La SIGNATURE aussi — le secret ne descend jamais
  // dans l app.asar, qui n est pas chiffre.
  'liens:paquets', 'liens:liste', 'liens:creer', 'liens:revoquer',
  'liens:journal', 'liens:comptes', 'liens:courriel', 'liens:motdepasse',
  // Conciliation bancaire (2.11.0) : le rapprochement du releve avec les depots
  // Square et les sorties.
  // ⚠ LE VERROU ET LE DROIT SUPER-ADMINISTRATEUR VIVENT DANS LE COEUR, pas dans
  // l ecran : ils n etaient que des boutons masques, donc contournables des qu on
  // ajoute une seconde surface — et un document declare definitif qu une autre
  // fenetre peut reecrire ne vaut rien comme piece comptable.
  // Lien comptable (2.12.0) : le carnet des comptables et le lien de l exercice.
  // ⚠ Le droit super-administrateur vit dans le COEUR, pas ici : ce lien ouvre
  // l exercice entier a un tiers.
  'comptable:donnees', 'comptable:creer', 'comptable:revoquer',
  'comptable:contact', 'comptable:contact-retirer',
  'banque:donnees', 'banque:creer', 'banque:supprimer',
  'banque:entree', 'banque:entree-jeter',
  'banque:versement', 'banque:versement-jeter',
  'banque:apparier', 'banque:desapparier', 'banque:notes',
  'banque:completer', 'banque:verrouiller', 'banque:importer', 'banque:document',
  // La fenetre Codes-barres : la page filtree par le site, et la grille des
  // variantes d un produit (le choix se fait dans la fenetre, l impression
  // passe par stock:etiquettes — la meme voie que l Inventaire).
  'codesbarres:liste', 'codesbarres:produit',
  // Ramassages et rapport transporteurs (fenetre Ramassages) : la liste,
  // l annulation aupres du transporteur (le coeur vit dans le site), le
  // renvoi vers l assistant de planification du site, et le rapport.
  'ramassages:liste', 'ramassages:annuler', 'ramassages:planifier',
  'ramassages:preparer', 'expeditions:rapport',
  // La moderation des avis (fenetre Avis produits) : liste, lecture entiere,
  // et les quatre gestes — les coeurs vivent dans le site.
  'avis:liste', 'avis:lire', 'avis:approuver', 'avis:masquer',
  'avis:repondre', 'avis:supprimer',
  // La messagerie clients (fenetre Messagerie) : liste (resynchronisee),
  // lecture, reponse (envoyee par courriel) et suppression.
  'messagerie:liste', 'messagerie:lire', 'messagerie:repondre', 'messagerie:supprimer', 'messagerie:retention',
  // Les notes de version (fenetre Notes) : les entrees brutes du site.
  'notes:lire',
  // Les archives (fenetre Archives, 1.60.0) : quatre piles + reactivation.
  'archives:liste', 'archives:reactiver', 'archives:ouvrir',
  // Le solde Facturation (fenetre Factures, 1.61.0) : encaisser, supprimer,
  // etat de compte.
  'factures:payer', 'factures:supprimer', 'factures:etat',
  // Paiements Square (fenetre Paiements, 1.62.0). LIRE sert le cache ;
  // CHARGER va chez Square — reseau, d ou sa limite large plus bas.
  'paiements:lire', 'paiements:charger', 'paiements:masquer', 'paiements:reafficher',
  // L etat de compte, dans sa fenetre : le voir, l imprimer, l envoyer.
  'etat:lire', 'etat:imprimer', 'etat:courriel',
  // Cartes-cadeaux (fenetre Cartes-cadeaux, 1.63.0). La LISTE attend la
  // resynchronisation : ce sont des soldes d argent.
  'cartescadeaux:liste', 'cartescadeaux:lire', 'cartescadeaux:creer',
  'cartescadeaux:activer', 'cartescadeaux:recompense',
  // Coupons (fenetre Coupons, 1.64.0) : ils touchent la CAISSE.
  'coupons:liste', 'coupons:enregistrer', 'coupons:basculer', 'coupons:supprimer',
  // Offres et annonces (fenetre Promotions, 1.68.0). Offres, annonces et
  // badges partagent une meme liste : bascule et suppression sont communes.
  'offres:liste', 'offres:enregistrer', 'annonces:liste', 'annonces:enregistrer',
  'promos:basculer', 'promos:supprimer', 'promos:bandeau',
  // Chat en ligne (fenetre Chat, 1.69.0) : les OPERATIONS seulement — la
  // liste ATTEND la resynchronisation, quelqu un attend une reponse.
  'chat:liste', 'chat:lire', 'chat:repondre', 'chat:statut', 'chat:supprimer',
  // Configuration du chat (fenetre chat-config, 3.9.0, #31) : la promesse
  // faite en 1.69.0 (<< la configuration suivra >>) n avait jamais ete tenue,
  // et l ecran est devenu INATTEIGNABLE des que le natif a gagne pour de bon.
  'chat:cfg:donnees', 'chat:cfg:ecrire', 'chat:cfg:ia', 'chat:cfg:photo',
  // Liquidation / vente finale (fenetre liquidation, 3.12.0, #30). Trois droits
  // distincts : voir, METTRE dans un regime (add), en RETIRER (edit) — ce qui
  // change ce que la boutique annonce au client et sa politique de retour.
  'liquidation:donnees', 'liquidation:choix', 'liquidation:cats',
  'liquidation:retirer', 'liquidation:lot', 'liquidation:parCategorie',
  // Import / Export de la boutique (fenetre catalogio, 3.13.0, #30). `products`
  // pour voir/exporter/analyser ; `products:edit` pour ECRIRE et pour sortir les
  // marges (cout). Le fichier se lit dans la fenetre ; les telechargements
  // partent de la page principale (comme la sauvegarde).
  'catalogio:etat', 'catalogio:exporter', 'catalogio:modele', 'catalogio:analyser',
  'catalogio:lignes', 'catalogio:appliquer', 'catalogio:rapport', 'catalogio:avis',
  'catalogio:reinit',
  // Attributs produits (fenetre invmeta, 3.14.0, #30) — le plus gros ecran, huit
  // onglets. Un seul droit au pont (inventory) ; chaque coeur d'ecriture reverifie
  // le droit precis (inventory:edit/:add/:delete).
  'invmeta:donnees', 'invmeta:sizeAdd', 'invmeta:sizeRemove', 'invmeta:attrAdd',
  'invmeta:attrRemove', 'invmeta:labelAdd', 'invmeta:labelRemove', 'invmeta:colorAdd',
  'invmeta:colorEdit', 'invmeta:colorRemove', 'invmeta:codeSave', 'invmeta:codesAssign',
  'invmeta:colorSearch', 'invmeta:colToggle', 'invmeta:colMove', 'invmeta:reachatSave',
  'invmeta:catSave', 'invmeta:catDelete',
  // Infolettre — 3 onglets manquants (fenetre newsletter, 3.15.0, #30). Les 4
  // autres onglets ont deja leur fenetre. Ecriture revue `newsletter:edit`.
  'newsletter:dash', 'newsletter:cfgDonnees', 'newsletter:cfgEcrire', 'newsletter:controls',
  'newsletter:testConn', 'newsletter:offerDonnees', 'newsletter:offerEcrire',
  'newsletter:offerImage', 'newsletter:offerReset', 'newsletter:processChains',
  // Publicite ciblee & analytique (fenetre publicite, 3.16.0, #30) — le DERNIER.
  // 5 onglets de lecture + Campagnes qui ecrit (analytics:edit revu au coeur).
  'analytics:overview', 'analytics:segments', 'analytics:promos', 'analytics:social',
  'analytics:satisfaction', 'analytics:campaigns', 'analytics:campForm', 'analytics:audience',
  'analytics:campSave', 'analytics:campLaunch', 'analytics:campDelete', 'analytics:segExport',
  // Reseaux sociaux (fenetre Sociaux, 1.70.0) : la FILE seulement. Publier
  // engage l exterieur et prend du temps — d ou les limites larges.
  // Configuration des reseaux sociaux (fenetre sociaux-config, 3.7.0, #10).
  'sociaux:config:donnees', 'sociaux:config:ecrire', 'sociaux:config:tester',
  // Liste noire et Mon profil (fenetres listenoire / profil, 3.8.0, #30).
  // #33 — deux gestes rouverts apres l audit de couverture (#32) : ils
  // n existaient que dans des ecrans web qui ne s ouvrent plus.
  'fournisseurs:supprimer', 'avis:photoRetirer',
  // Profil d entreprise et aide-memoire fiscal : sans le profil, la fenetre
  // refuse de composer les formulaires — et il n y avait plus ou le saisir.
  'impot:profil', 'impot:profil:ecrire', 'impot:memo',
  // Patrons de publication : promis << au palier 5 >>, jamais portes.
  'patrons:liste', 'patrons:ecrire', 'patrons:basculer', 'patrons:supprimer', 'patrons:apercu',
  // Generateur d agencement : la fenetre y renvoyait, l ecran n existait plus.
  'reco:agencement', 'reco:agencement:publier', 'reco:creer', 'reco:editer',
  // Creer / modifier une campagne et une chaine : la fenetre savait tout faire
  // SAUF en creer une. nl:modele charge un gabarit, nl:apercu batit le courriel
  // COMPLET (en-tete, pied, desabonnement) que la fenetre ne saurait pas refaire.
  'campagnes:form', 'campagnes:ecrire', 'chaines:form', 'chaines:ecrire',
  'nl:modele', 'nl:apercu',
  // Segments d envoi composables : le menu << Segment >> d une campagne lisait
  // deux entrees ECRITES EN DUR. segments:apercu compte SANS enregistrer, pour
  // voir la portee d une recette pendant qu on l ecrit.
  'segments:donnees', 'segments:apercu', 'segments:ecrire', 'segments:supprimer',
  // Le verdict de lisibilite d un code-barres, AVANT d imprimer. Le garde-fou
  // existait deja mais parlait par une bulle de la fenetre PRINCIPALE, donc
  // invisible d ici : des etiquettes qui ne se scannent pas partaient sans
  // que personne ne voie rien (vecu a l entrepot).
  'etiquettes:lisibilite',
  // Le cadenas SUR LA LIGNE d une liste (#22). Sonde toutes les ~3 s, pour
  // qu un collegue voie qu une fiche est prise SANS avoir a l ouvrir.
  'verrous:liste',
  // Les quatre derniers trous fonctionnels de l audit (#6) : le REPERTOIRE de
  // grossistes (ajout en un clic) et la SUPPRESSION d une demande de retour
  // terminee, qui n existaient nulle part dans l application.
  'repertoire:donnees', 'repertoire:ajouter',
  // L explorateur de photos du Studio (#28) : la meme phototheque, filtrable.
  'studio:explorer',
  'retour:supprimerApercu', 'retour:supprimerEcrire',
  // Creer et modifier un sondage : la fenetre y renvoyait, l ecran etait mort.
  'fidelisation:sondage:form', 'fidelisation:sondage:ecrire',
  'listenoire:donnees', 'listenoire:ajouter', 'listenoire:retirer', 'adresse:suggerer',
  'profil:donnees', 'profil:motdepasse', 'profil:questions',
  'sociaux:liste', 'sociaux:publier', 'sociaux:publierTout', 'sociaux:ignorer',
  'sociaux:viderHistorique',
  // Fidelisation (fenetre Fidelisation, 1.71.0). La LISTE attend la
  // resynchronisation : un taux de reponse perime est un chiffre FAUX.
  'fidelisation:liste', 'fidelisation:sondage', 'fidelisation:supprimerSondage',
  'fidelisation:supprimerInvite', 'fidelisation:viderInvites', 'fidelisation:notification',
  // Recommandations (fenetre Recommandations, 1.72.0) : l ORDRE des regles
  // decide de ce que la cliente voit en premier sur une fiche.
  'reco:liste', 'reco:stats', 'reco:basculer', 'reco:deplacer', 'reco:supprimer',
  'reco:restaurer', 'reco:liaisons', 'reco:viderLiaisons',
  // Recherches sans resultat (fenetre Recherches, 1.73.0) : chaque ligne est
  // une vente manquee.
  'recherches:liste', 'recherches:retirer', 'recherches:vider',
  // Abonnes de l infolettre (fenetre Abonnes, 1.74.0). La LISTE attend la
  // resynchronisation : une liste d envoi perimee, c est un client qui ne
  // recoit rien ou qui recoit malgre son refus.
  'abonnes:liste', 'abonnes:ajouter', 'abonnes:basculer', 'abonnes:supprimer',
  'abonnes:importer',
  // Journal d envoi (fenetre Journal, 1.75.0) : la seule piece qui reponde a
  // << je n ai jamais recu votre courriel >>.
  'journal:liste', 'journal:vider',
  // Campagnes et chaines (fenetre Campagnes, 2.1.0). ⚠ DE VRAIS COURRIELS :
  // << envoyer >> part vers toute la liste, << traiter >> envoie les etapes
  // echues de toutes les chaines. Les deux sont armes en deux clics.
  'campagnes:liste', 'campagnes:envoyer', 'campagnes:supprimer',
  'chaines:liste', 'chaines:basculer', 'chaines:supprimer', 'chaines:traiter',
  // Statistiques distantes (fenetre Statistiques, 2.2.0). ⚠ Elles ne lisent PAS
  // la base : la fenetre principale interroge Google et Twilio par le reseau.
  'stats:ga', 'stats:telephonie',
  // Photothèque (fenetre Photos, 2.3.0). ⚠ C EST UN ECRAN D IMPORT : ce qui
  // entre par 'photos:importer' est compresse, depose dans le stockage et
  // conserve par le SITE — la fenetre ne fait que lire un fichier. Et
  // 'photos:attacher' ECRIT SUR UNE FICHE PRODUIT : c est ce que la boutique
  // affichera, d ou un second droit exige cote site.
  'photos:donnees', 'photos:importer', 'photos:isoler', 'photos:fond',
  'photos:attacher', 'photos:produits', 'photos:supprimer', 'photos:vider',
  'photos:usb', 'photos:enregistrer',
  // Traitements nommes (detourage, mannequin retire, porte par un mannequin)
  // et le meme geste sur un LOT.
  'photos:traiter', 'photos:lot', 'photos:renommer', 'photos:fraisEtat',
  'photos:apercu',
  // L assistant de traitement en lot : lire une source SANS importer, montrer,
  // importer ce qui est choisi, puis traiter — chaine imposee par le coeur.
  'lot:sources', 'lot:vignette', 'lot:importer', 'lot:traiter',
  // L historique des lots : ce qui est entre, par quelle porte, et de quoi le
  // defaire d un geste.
  'lot:liste', 'lot:jeter', 'lot:ouvrir', 'lot:clore', 'photos:toutes', 'photos:pivoter', 'photos:ranger', 'photos:espace',
  // Le suivi de consommation Fal.ai (lecture seule).
  'fal:suivi', 'fal:ouvrir', 'photoroom:compte',
  // Configuration en fenêtres natives (palier 5) — 1er onglet : Heures d'ouverture.
  'config:heures:donnees', 'config:heures:ecrire',
  'config:footer:donnees', 'config:footer:ecrire',
  'config:apparence:donnees', 'config:apparence:ecrire',
  'config:marque:donnees', 'config:marque:ecrire', 'config:marque:reinit',
  'config:icones:donnees', 'config:icones:ajouter', 'config:icones:supprimer',
  'config:icones:ico', 'config:icones:convertir',
  'config:taxes:donnees', 'config:taxes:ecrire', 'config:taxes:reinit',
  'config:taxes:reference', 'config:taxes:revision', 'config:taxes:pays', 'config:taxes:paysoter',
  'config:paiements:donnees', 'config:paiements:ecrire', 'config:paiements:options',
  'config:paiements:mode', 'config:paiements:tester',
  // Cles API (fenetre Cles, 2.34.0) — dernier onglet de << Paiement & taxes >>.
  // ⚠ AUCUNE CLE NE TRAVERSE LE PONT : << donnees >> ne rend que l existence et
  // les 4 derniers caracteres. << retirer >> est le geste explicite de retrait.
  'config:cles:donnees', 'config:cles:ecrire', 'config:cles:retirer', 'config:cles:teststripe',
  // Configuration de la livraison (fenetre Livraison, 2.37.0) — pas de secret.
  'config:livraison:donnees', 'config:livraison:ecrire',
  // Les pays desservis, dans la meme fenetre que la livraison.
  'config:pays:donnees', 'config:pays:relire', 'config:pays:exclure',
  'config:retours:donnees', 'config:retours:ecrire',
  'config:nav:donnees', 'config:nav:ecrire', 'config:nav:reinit',
  // Transporteurs (fenetre Transporteurs, 2.39.0) — ⚠ secrets + filet
  // carriers_fetch_full : donnees/ecrire peuvent RECHARGER la config depuis le
  // nuage (reseau), d ou des plafonds larges.
  'config:transporteurs:donnees', 'config:transporteurs:ecrire', 'config:transporteurs:reessayer',
  // Automatisations (fenetre Automations, 2.40.0) — pas de secret.
  'config:automations:donnees', 'config:automations:email', 'config:automations:stats',
  'config:telephonie:donnees', 'config:telephonie:ecrire',
  'tel:resume', 'tel:sms:envoyer', 'tel:sms:lu', 'tel:sms:suppr', 'tel:vm:lu', 'tel:vm:suppr',
  'config:modeles:donnees', 'config:modeles:ecrire', 'config:modeles:retirer',
  'config:gabarits:donnees', 'config:gabarits:ecrire', 'config:gabarits:copier',
  'config:gabarits:supprimer', 'config:gabarits:attributions', 'config:gabarits:gifApercu',
  'config:logotheque:donnees', 'config:logotheque:ajouter', 'config:logotheque:renommer', 'config:logotheque:retirer',
  'config:analytics:donnees', 'config:analytics:ecrire',
  'config:bd:donnees', 'config:bd:tester', 'config:bd:pousser', 'config:bd:restaurer', 'config:bd:migrer', 'config:bd:stockage',
  'config:accueil:donnees', 'config:accueil:ecrire', 'config:accueil:reinit',
  'config:lancement:donnees', 'config:lancement:basculer',
  // Pages du site (fenetre Pages, 2.61.0, #5, etape 5a) — editeurs structures.
  'pages:donnees', 'pages:faq:ecrire', 'pages:contact:ecrire', 'pages:sizes:ecrire',
  'pages:vedette:ajouter', 'pages:vedette:retirer', 'pages:footer', 'pages:custom:footer',
  'pages:custom:supprimer', 'pages:inbox', 'pages:inbox:supprimer', 'pages:inbox:vider',
  'pages:politique:ecrire', 'pages:politique:apercu',
  // Pages personnalisees : contenu a l editeur riche (2.63.0, #5, etape 5c).
  'pages:custom:donnees', 'pages:custom:ecrire',
  // Securite (fenetre Accès Utilisateurs, 2.65.0, #6 Lot A) — lecture des comptes
  // + reglages (politique mdp, inactivite, verrouillage session, restriction geo).
  'securite:donnees', 'securite:pwpolicy:ecrire', 'securite:inactivite:ecrire',
  'securite:geo:ecrire', 'securite:geo:malocalisation',
  'securite:verif:staff', 'securite:verif:client',
  // Gestion des comptes (2.66.0, #6 Lot B1) — creation/edition + permissions +
  // suppression + invitation. Le MFA reste au repli web jusqu au Lot B2.
  'securite:form', 'securite:compte:ecrire', 'securite:compte:supprimer', 'securite:compte:invitation',
  // MFA (2.67.0, #6 Lot B2) — activation TOTP, exemption, desactivation.
  'securite:mfa:etat', 'securite:mfa:init', 'securite:mfa:confirmer', 'securite:mfa:exempter', 'securite:mfa:desactiver',
  // Journaux (2.68.0, #7 Lot 7a) — acces / automatisations / impressions / verrous.
  'journal:donnees', 'journal:verrous', 'journal:purger:acces', 'journal:purger:prints',
  'journal:stats', 'journal:deverrouiller', 'journal:deverrouiller:tout',
  'journal:export:acces', 'journal:export:prints',
  // Recherche inter-journaux (2.69.0, #7 Lot 7c).
  'journal:recherche',
  // SMS dans les journaux (2.72.0, #7 Lot 7b-2). Comptable reutilise liens:journal.
  'journal:sms',
  // Incidents de securite (fenetre Incidents, 2.75.0, #26) — registre Loi 25.
  'incidents:donnees', 'incidents:ecrire', 'incidents:supprimer',
  // Sauvegarde & restauration (fenetre Sauvegarde, 2.76.0, #27) — backup.php.
  'sauvegarde:donnees', 'sauvegarde:creer', 'sauvegarde:telecharger',
  'sauvegarde:restaurer', 'sauvegarde:supprimer', 'sauvegarde:purger',
  // Studio virtuel (fenetre Studio, 2.35.0) — mise en scene Photoroom guidee.
  // ⚠ 'studio:traiter' peut enchainer 2-3 appels Photoroom (fantome + decor +
  // agrandissement), chacun long : le plafond de temps est large.
  'studio:presets', 'studio:compte', 'studio:traiter',
  // Studio ↔ photothèque : lister pour choisir, ouvrir depuis la photothèque,
  // enregistrer le résultat (import → dépôt R2).
  'studio:phototheque', 'studio:ouvrir', 'studio:enregistrer',
  // Portraits persistants des mannequins (fabriques une fois, ranges dans R2).
  'studio:modeles', 'studio:modeleGenerer', 'studio:modelesVider',
  // Centre d impression (fenetre Promo, 2.4.0). ⚠ PATRON << FENETRE PILOTE >> :
  // le rendu est un CANEVAS, il ne peut vivre que dans la fenetre principale
  // (seule a pouvoir relire une image du stockage sans teindre le canevas, et
  // seule a parler au programme d impression). La fenetre recoit des images
  // deja rendues et commande. ⚠ 'promo:lot' imprime UN lot de 25 : c est la
  // fenetre qui boucle, ce qui donne la progression ET l arret.
  'promo:donnees', 'promo:apercu', 'promo:imprimante', 'promo:calibration',
  'promo:calibrer', 'promo:lot', 'promo:dupliquer', 'promo:supprimer',
  'promo:formatEcrire', 'promo:formatSupprimer', 'promo:nouveau',
  'promo:editeur', 'promo:planche',
  // Depenses d entreprise (fenetre Depenses, 2.5.0) — premier ecran du palier 5.
  // ⚠ 'depenses:facture' LIT une facture par le service d IA : la cle, pdf.js, le
  // canevas et le taux de change restent au site. La fenetre envoie un fichier et
  // recoit des champs — rien n est enregistre sans confirmation.
  'depenses:donnees', 'depenses:lire', 'depenses:taxes',
  // Frais Stripe Tax en comptabilite (#22) — lecture seule.
  'depenses:fraisStripe', 'depenses:enregistrer',
  'depenses:supprimer', 'depenses:recu', 'depenses:recuOuvrir', 'depenses:facture',
  // Le BROUILLON : rien de ce qui est saisi ne doit pouvoir disparaitre, quelle
  // que soit la maniere dont la fenetre se ferme (meme patron que l assistant
  // Produit). Le recu voyage avec.
  'depenses:brouillonLire', 'depenses:brouillonEcrire', 'depenses:brouillonJeter',
  // L ANNUAIRE des fournisseurs : visible, modifiable, et VERROUILLE pendant
  // qu on le corrige (portee expense_vendors, meme mecanisme que les fiches).
  'depenses:annuaire', 'depenses:annuaireEcrire', 'depenses:annuaireRetirer',
  // Convertir les montants SAISIS depuis le dollar US, au taux de la date de
  // la depense : la conversion n avait lieu qu a la lecture d une facture.
  'depenses:convertir',
  // Remboursements et credits (fenetre Remboursements, 2.7.0). ⚠ ECRAN DE
  // CONSULTATION : rembourser engage de l argent et se fait depuis la COMMANDE,
  // dans la fenetre Remboursement qui porte deja toutes les gardes.
  'remboursements:liste', 'remboursements:ouvrir',
  // Fiscalite et impot (fenetre Impot, 2.8.0). ⚠ PATRON << FENETRE PILOTE >> :
  // les documents fiscaux sont des IMPRIMES composes par le site — les
  // redessiner ici voudrait dire les ecrire deux fois, et deux formulaires
  // fiscaux qui divergent, c est une declaration fausse.
  'impot:donnees', 'impot:document',
  'produit:apercu', 'produit:fonds', 'produit:detourer', 'produit:modeles', 'produit:photoIa',
  // Tableau de bord : lecture des chiffres, preference des tuiles, et le
  // clic d une tuile qui ouvre sa cible.
  'tableau:lire', 'tableau:tuiles', 'tableau:ouvrir', 'tableau:verrous',
  // Derniere sauvegarde : lue A PART, car elle seule passe par le reseau (#25).
  'tableau:sauvegarde',
  // Variantes par couleur : teinte au CANEVAS par le site (une image, une
  // couleur par appel — la fenetre boucle), aucun service externe.
  'produit:teinter',
  'commandes:preparer', 'commandes:expedier',
  // Retours. ⚠ retour:finaliser peut REMBOURSER (Square ou credit boutique) et
  // retour:enregistrer peut generer une etiquette FACTUREE : toute la regle vit
  // dans le site, le pont ne porte que des valeurs.
  'retour:lire', 'retour:enregistrer', 'retour:recu', 'retour:litige',
  'retour:finaliser', 'retour:pdf', 'retour:renvoyer',
  // Remboursement. ⚠ remboursement:ecrire REMBOURSE (Square ou credit) : la
  // regle entiere vit dans le site, le pont ne porte que quantites et choix.
  'remboursement:lire', 'remboursement:totaux', 'remboursement:nip', 'remboursement:ecrire',
  // Fiche client. La regle (unicite du courriel, mot de passe par canal separe
  // et hache serveur, purge refusee des qu il existe une commande) vit dans le
  // site ; le pont ne porte que des valeurs.
  'client:lire', 'client:ecrire', 'client:etat', 'client:corbeille',
  'client:restaurer', 'client:purger', 'client:etatCompte',
]);

// ⚠ U+2028 et U+2029 sont des SAUTS DE LIGNE en JavaScript alors que
// `JSON.stringify` les laisse tels quels. Une valeur qui en contient couperait
// l'expression en deux et casserait l'appel — ou pire, ferait exécuter la suite
// hors du contexte prévu.
const litteralJs = (v) => JSON.stringify(v === undefined ? null : v)
  .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

// Ouverture d une preparation depuis le site : c est lui qui sait quelle
// commande est selectionnee, la coquille ne fait que porter la fenetre.
ipcMain.handle('fenetre:commande', (e, id) => {
  const cle = 'commande-' + String(id || '').replace(/[^\w-]/g, '');
  /* ⚠⚠ UNE FENÊTRE DÉJÀ OUVERTE NE CHANGE PAS TOUTE SEULE D'ÉTAPE.
     `ouvrirNative` réutilise la fenêtre existante : restore + focus, rien de
     plus. Les boutons du site (« Préparer », « Vérifier », « Étiquette »)
     passent tous par ici avec la même clé — ils ne faisaient donc que la ramener
     au premier plan, figée sur l'écran d'avant, question du bon comprise.
     Signalé le 2026-08-07 : « je clique sur Vérifier et je n'arrive pas à la
     vérification, l'assistant se recharge et me repose la même question ».
     On demande donc à la page de SE REPLACER (`szRevenir` relit le statut et va
     à l'étape qu'il commande). ⚠ Seulement sur une fenêtre RÉUTILISÉE : une
     fenêtre neuve se place elle-même au chargement (`accueillir`), et lui
     injecter du script avant `did-finish-load` ne trouverait rien. */
  const _avant = fenetresNatives.get(cle);
  const _reutilisee = !!(_avant && !_avant.isDestroyed());
  const win = ouvrirNative(cle, 'Préparation de commande', pageCommande(String(id || '')),
    { width: 880, height: 700, minHeight: 520 });
  if (_reutilisee && win && !win.isDestroyed()) {
    win.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
  }
  return true;
});

/* Ouverture d une expedition depuis le site : c est lui qui sait quelle commande
   est selectionnee. Meme mecanique que la preparation de commande.
   ⚠ UNE FENETRE PAR COMMANDE (la cle porte l identifiant) : deux expeditions
   ouvertes en meme temps sur la meme commande, ce sont deux etiquettes facturees
   et deux courriels au client. */
ipcMain.handle('fenetre:expedition', (e, id) => {
  const cle = 'expedition-' + String(id || '').replace(/[^\w-]/g, '');
  ouvrirNative(cle, 'Expédier une commande', pageExpedition(String(id || '')),
    { width: 780, height: 720, minWidth: 620, minHeight: 520 });
  return true;
});

/* Ouverture d un retour depuis le site. ⚠ UNE FENETRE PAR DOSSIER, et sur une
   fenetre REUTILISEE on demande a la page de SE RELIRE (szRevenir) — la lecon de
   la preparation : restore + focus laisse l ecran d avant, donnees comprises. */
ipcMain.handle('fenetre:retour', (e, id) => {
  const cle = 'retour-' + String(id || '').replace(/[^\w-]/g, '');
  const _avant = fenetresNatives.get(cle);
  const _reutilisee = !!(_avant && !_avant.isDestroyed());
  const win = ouvrirNative(cle, 'Demande de retour', pageRetour(String(id || '')),
    { width: 860, height: 760, minWidth: 680, minHeight: 540 });
  if (_reutilisee && win && !win.isDestroyed()) {
    win.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
  }
  return true;
});

/* Ouverture d un remboursement depuis le site. Une fenetre PAR commande ;
   reutilisee, elle SE RELIT (szRevenir) — l etat d avant pourrait porter des
   quantites perimees, et c est de l argent. */
ipcMain.handle('fenetre:remboursement', (e, id) => {
  const cle = 'remboursement-' + String(id || '').replace(/[^\w-]/g, '');
  const _avant = fenetresNatives.get(cle);
  const _reutilisee = !!(_avant && !_avant.isDestroyed());
  const win = ouvrirNative(cle, 'Remboursement', pageRemboursement(String(id || '')),
    { width: 760, height: 740, minWidth: 620, minHeight: 520 });
  if (_reutilisee && win && !win.isDestroyed()) {
    win.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
  }
  return true;
});

/* Ouverture d une fiche client depuis le site. Une fenetre PAR client ;
   reutilisee, elle SE RELIT (szRevenir). */
ipcMain.handle('fenetre:produit', (e, id) => {
  const brut = String(id || '');
  // Sans identifiant, c'est le << Nouveau produit >> du menu : meme cle que lui,
  // pour ne pas ouvrir deux assistants vierges concurrents.
  const cle = brut ? 'produit-' + brut.replace(/[^\w-]/g, '') : 'produit';
  ouvrirNative(cle, brut ? 'Produit' : 'Nouveau produit', pageProduit(brut),
    { width: 980, height: 860, minHeight: 520 });
  // Pas de szRevenir ici : l'assistant Produit ne sait pas encore se replacer.
  // Reutilisee, la fenetre revient simplement au premier plan.
  return true;
});

ipcMain.handle('fenetre:etatcompte', (e, id) => {
  const brut = String(id || '');
  if (!brut) return false;
  // Une fenetre PAR client ; rouvrir la meme la ramene (szRevenir relit).
  const cle = 'etatcompte-' + brut.replace(/[^0-9A-Za-z_-]/g, '');
  const _avant = fenetresNatives.get(cle);
  const _reutilisee = !!(_avant && !_avant.isDestroyed());
  const win = ouvrirNative(cle, 'État de compte', pageEtatCompte(brut),
    { width: 900, height: 840, minWidth: 640, minHeight: 520 });
  if (_reutilisee && win && !win.isDestroyed()) {
    win.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
  }
  return true;
});

ipcMain.handle('fenetre:facture', (e, id) => {
  const brut = String(id || '');
  if (!brut) return false;
  // Une fenetre PAR facture ; rouvrir la meme la ramene (szRevenir relit).
  const cle = 'facture-' + brut.replace(/[^0-9A-Za-z_-]/g, '');
  const _avant = fenetresNatives.get(cle);
  const _reutilisee = !!(_avant && !_avant.isDestroyed());
  const win = ouvrirNative(cle, 'Facture', pageFacture(brut),
    { width: 920, height: 820, minWidth: 680, minHeight: 520 });
  if (_reutilisee && win && !win.isDestroyed()) {
    win.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
  }
  return true;
});

/* Assistants collection et fournisseur PAR FICHE (listes natives 1.54.0).
   Id vide = assistant vierge, MEME CLE que l entree de menu (pas deux
   assistants vierges concurrents) ; une fiche = une fenetre a elle. Pas de
   szRevenir : comme l assistant Produit, ils ne savent pas se replacer —
   reutilisee, la fenetre revient simplement au premier plan. */
ipcMain.handle('fenetre:collection', (e, id) => {
  const brut = String(id || '');
  const cle = brut ? 'collection-' + brut.replace(/[^\w-]/g, '') : 'collection';
  ouvrirNative(cle, brut ? 'Collection' : 'Nouvelle collection', pageCollection(brut),
    { width: 860, height: 640, minHeight: 480 });
  return true;
});
ipcMain.handle('fenetre:fournisseur', (e, id) => {
  const brut = String(id || '');
  const cle = brut ? 'fournisseur-' + brut.replace(/[^\w-]/g, '') : 'fournisseur';
  ouvrirNative(cle, brut ? 'Fournisseur' : 'Nouveau fournisseur', pageFournisseur(brut),
    { width: 820, height: 620, minHeight: 460 });
  return true;
});

// La LISTE des factures — ouverte par << Tout voir >> du tableau de bord ou
// par le menu. Reutilisee, elle RELIT (szRevenir) : une facture a pu se payer.
ipcMain.handle('fenetre:factures', () => {
  const _avant = fenetresNatives.get('factures');
  const _reutilisee = !!(_avant && !_avant.isDestroyed());
  const win = ouvrirNative('factures', 'Factures', pageFactures(''),
    { width: 1000, height: 720, minWidth: 780, minHeight: 500 });
  if (_reutilisee && win && !win.isDestroyed()) {
    win.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
  }
  return true;
});

ipcMain.handle('fenetre:commandeDetail', (e, id) => {
  const brut = String(id || '');
  if (!brut) return false;
  // Une fenetre PAR commande : on compare deux details cote a cote, et rouvrir
  // la meme ramene celle qui existe (szRevenir la fait relire).
  const cle = 'cmd-detail-' + brut.replace(/[^\w-]/g, '');
  const _avant = fenetresNatives.get(cle);
  const _reutilisee = !!(_avant && !_avant.isDestroyed());
  const win = ouvrirNative(cle, 'Détail de commande', pageCommandes('commandes@' + brut),
    { width: 940, height: 780, minWidth: 720, minHeight: 540 });
  if (_reutilisee && win && !win.isDestroyed()) {
    win.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
  }
  return true;
});

ipcMain.handle('fenetre:client', (e, id) => {
  const cle = 'client-' + String(id || '').replace(/[^\w-]/g, '');
  const _avant = fenetresNatives.get(cle);
  const _reutilisee = !!(_avant && !_avant.isDestroyed());
  const win = ouvrirNative(cle, 'Fiche client', pageClient(String(id || '')),
    { width: 720, height: 720, minWidth: 600, minHeight: 500 });
  if (_reutilisee && win && !win.isDestroyed()) {
    win.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
  }
  return true;
});

/* ⚠ LA TABLE EST RENDUE AU PRECHARGEMENT, QUI NE LA RECOPIE PLUS. Il en tenait
   une jumelle, a la main ; elle ignorait << photos:traiter >> et appliquait donc
   vingt-cinq secondes la ou celle-ci en annonce trois cents. Une seule source. */
const LIMITES_PONT = {
  // Depot des photos dans le stockage : le plus long de tous.
  'produit:enregistrer': 90000,
  // Etiquettes demandees a un transporteur (Postes Canada, FedEx).
  'commande:etiquette': 60000, 'expedition:etiquette': 60000,
  // De l'argent chez Square : un remboursement lent n'est pas un remboursement
  // rate — le couper a 8 s en ferait un << echec >> qui a pourtant paye.
  'remboursement:ecrire': 45000, 'commandes:supprimerEcrire': 45000,
  'commandes:fraisEcrire': 45000, 'retour:finaliser': 45000,
  /* ⚠⚠ LES TRAITEMENTS D IMAGE PAR MODELE, ET C EST LA CAUSE DE << modele
     delai >> (signale le 2026-08-09 sur un retrait de mannequin). Ces
     operations n etaient PAS dans cette table : elles heritaient du plafond
     ordinaire de 8 SECONDES, alors qu un appel Kontext prend 20 a 60 s. La
     fenetre annoncait un echec pendant que le modele travaillait — et surtout
     pendant qu il FACTURAIT. Un plafond trop court ne rate pas seulement le
     resultat : il le fait payer deux fois.
     ⚠ 180 s ICI, 120 s AU RELAIS : le plafond le plus court doit etre le plus
     INTERIEUR, sinon c est la couche du dessus qui abandonne la premiere et
     l on perd le vrai message d erreur. */
  /* ⚠ LA CHAINE DU RETRAIT DE MANNEQUIN ENCHAINE TROIS MODELES : reperage,
     reconstruction sous le masque, detourage. Trois minutes suffisaient quand
     c etait un seul appel ; elles ne suffisent plus, et un plafond trop court ne
     rate pas seulement un resultat — il MENT sur son sort, en affichant un echec
     pendant que le travail continue et se facture derriere. */
  'photos:traiter': 300000, 'photos:lot': 600000, 'photos:isoler': 180000,
  // La garde des frais interroge le relais une fois par empreinte distincte (en
  // parallele) avant un lot : quelques secondes au plus, mais on laisse de la
  // marge pour un lot de soixante photos sur une liaison lente.
  'photos:fraisEtat': 60000,
  // Un apercu sandbox = un appel Photoroom complet (comme un traitement) : meme
  // ordre de grandeur, on lui laisse la meme marge qu'a photos:isoler.
  'photos:apercu': 180000,
  /* ⚠⚠ ET VOICI POURQUOI << TOUT VIDER >> LAISSAIT 32 PHOTOS (2026-08-09).
     `photos:vider` n etait pas dans cette table : elle heritait du plafond
     ordinaire de 8 SECONDES, alors qu elle supprime les photos UNE A UNE avec
     un aller-retour reseau chacune. Au bout de 8 s la fenetre recevait
     << delai >>, affichait un verdict, et le travail CONTINUAIT derriere — d ou
     une phototheque a moitie vide et un ecran qui pretendait avoir fini.
     Un plafond trop court ne rate pas une operation : il ment sur son sort. */
  'photos:vider': 600000, 'photos:supprimer': 45000, 'photos:toutes': 30000,
  'photos:pivoter': 90000, 'photos:ranger': 180000, 'photos:espace': 60000,
  'lot:jeter': 600000, 'lot:sources': 90000, 'lot:vignette': 30000,
  'lot:importer': 90000, 'lot:traiter': 180000, 'lot:liste': 30000,
  'photos:importer': 60000, 'photos:usb': 120000, 'fal:suivi': 20000,
  'config:heures:donnees': 15000, 'config:heures:ecrire': 20000,
  'config:footer:donnees': 15000, 'config:footer:ecrire': 20000,
  'config:apparence:donnees': 15000, 'config:apparence:ecrire': 20000,
  // ⚠ L ecriture de la marque porte des IMAGES : le depot dans R2 se fait au
  // coeur, six logos peuvent partir d un coup, et un plafond de 20 s ferait
  // passer un depot lent pour une panne.
  'config:marque:donnees': 15000, 'config:marque:ecrire': 120000, 'config:marque:reinit': 30000,
  // ⚠ L ajout d une icone depose dans R2 ; la conversion .ico redessine six
  // tailles depuis l original. Ni l une ni l autre n est instantanee.
  'config:icones:donnees': 15000, 'config:icones:ajouter': 90000,
  'config:icones:supprimer': 30000, 'config:icones:ico': 60000, 'config:icones:convertir': 90000,
  // Chaque ecriture de taux fait un compare-et-ecris cote serveur.
  'config:taxes:donnees': 15000, 'config:taxes:ecrire': 30000, 'config:taxes:reinit': 30000,
  'config:taxes:reference': 30000, 'config:taxes:revision': 30000,
  'config:taxes:pays': 30000, 'config:taxes:paysoter': 30000,
  // Le test de connexion part chez Square : il depend d un tiers.
  'config:paiements:donnees': 15000, 'config:paiements:ecrire': 45000,
  'config:paiements:options': 30000, 'config:paiements:mode': 15000, 'config:paiements:tester': 45000,
  // Cles API : chaque ecriture pousse plusieurs cles vers le nuage, awaitees.
  'config:cles:donnees': 15000, 'config:cles:ecrire': 30000, 'config:cles:retirer': 20000, 'config:cles:teststripe': 30000,
  'config:livraison:donnees': 15000, 'config:livraison:ecrire': 30000,
  // ⚠ 'relire' interroge Stripe en court-circuitant le cache : c est un appel
  // reseau vers l exterieur, pas une lecture locale.
  'config:pays:donnees': 15000, 'config:pays:relire': 45000, 'config:pays:exclure': 30000,
  'config:retours:donnees': 15000, 'config:retours:ecrire': 30000,
  'config:nav:donnees': 15000, 'config:nav:ecrire': 30000, 'config:nav:reinit': 30000,
  'config:transporteurs:donnees': 30000, 'config:transporteurs:ecrire': 45000, 'config:transporteurs:reessayer': 30000,
  'config:automations:donnees': 15000, 'config:automations:email': 20000, 'config:automations:stats': 20000,
  'config:telephonie:donnees': 15000, 'config:telephonie:ecrire': 30000,
  'tel:resume': 20000, 'tel:sms:envoyer': 20000, 'tel:sms:lu': 15000, 'tel:sms:suppr': 15000, 'tel:vm:lu': 15000, 'tel:vm:suppr': 15000,
  'config:modeles:donnees': 15000, 'config:modeles:ecrire': 60000, 'config:modeles:retirer': 20000,
  'config:gabarits:donnees': 15000, 'config:gabarits:ecrire': 25000, 'config:gabarits:copier': 20000,
  'config:gabarits:supprimer': 20000, 'config:gabarits:attributions': 20000, 'config:gabarits:gifApercu': 25000,
  'config:logotheque:donnees': 15000, 'config:logotheque:ajouter': 60000, 'config:logotheque:renommer': 20000, 'config:logotheque:retirer': 20000,
  'config:analytics:donnees': 15000, 'config:analytics:ecrire': 30000,
  'config:bd:donnees': 15000, 'config:bd:tester': 30000, 'config:bd:pousser': 120000, 'config:bd:restaurer': 60000, 'config:bd:migrer': 300000, 'config:bd:stockage': 30000,
  'config:accueil:donnees': 15000, 'config:accueil:ecrire': 30000, 'config:accueil:reinit': 20000,
  'config:lancement:donnees': 20000, 'config:lancement:basculer': 20000,
  'pages:donnees': 60000, 'pages:faq:ecrire': 200000, 'pages:contact:ecrire': 40000, 'pages:sizes:ecrire': 200000,
  'pages:vedette:ajouter': 20000, 'pages:vedette:retirer': 20000, 'pages:footer': 20000, 'pages:custom:footer': 20000,
  'pages:custom:supprimer': 20000, 'pages:inbox': 60000, 'pages:inbox:supprimer': 20000, 'pages:inbox:vider': 20000,
  /* ⚠ Une politique s enregistre en DEPOSANT d abord ses images dans R2
     (uploadInlineImages, cote page) : c est un temps de reseau, pas de calcul,
     et il se compte en dizaines de secondes quand la section porte plusieurs
     photos. On l aligne sur les autres depots (produit:enregistrer, 90 s) avec
     de la marge. L apercu, lui, ne fait que resoudre des variables en memoire. */
  'pages:politique:ecrire': 180000, 'pages:politique:apercu': 20000,
  /* Contenu des pages personnalisees (5c) : la lecture est legere ; l ecriture
     depose les images dans R2 comme une politique — meme plafond de 180 s. */
  'pages:custom:donnees': 40000, 'pages:custom:ecrire': 180000,
  /* Securite : lecture et reglages sont legers ; la localisation appelle un
     service d IP externe (reseau) et les verifications d inactivite peuvent
     ENVOYER des courriels a plusieurs comptes — plafonds plus larges. */
  'securite:donnees': 40000, 'securite:pwpolicy:ecrire': 30000, 'securite:inactivite:ecrire': 30000,
  'securite:geo:ecrire': 30000, 'securite:geo:malocalisation': 30000,
  'securite:verif:staff': 120000, 'securite:verif:client': 120000,
  /* Gestion des comptes : ecriture et invitation ENVOIENT un courriel (creation /
     reenvoi) et fabriquent un lien d installation cote serveur -> plafonds larges. */
  'securite:form': 40000, 'securite:compte:ecrire': 60000, 'securite:compte:supprimer': 30000, 'securite:compte:invitation': 60000,
  'securite:mfa:etat': 20000, 'securite:mfa:init': 30000, 'securite:mfa:confirmer': 30000, 'securite:mfa:exempter': 20000, 'securite:mfa:desactiver': 20000,
  /* Journaux : lecture locale rapide ; les verrous et le deverrouillage passent
     par le serveur (lock_admin). */
  'journal:donnees': 40000, 'journal:verrous': 30000, 'journal:purger:acces': 20000, 'journal:purger:prints': 20000,
  'journal:stats': 20000, 'journal:deverrouiller': 30000, 'journal:deverrouiller:tout': 30000,
  'journal:export:acces': 30000, 'journal:export:prints': 30000,
  'journal:recherche': 30000, 'journal:sms': 30000,
  /* Incidents : registre local pousse vers Turso a l ecriture (syncPrivateList),
     donc l ecriture attend le reseau — plus large que la lecture. */
  'incidents:donnees': 40000, 'incidents:ecrire': 60000, 'incidents:supprimer': 30000,
  /* Sauvegarde : CREER dompe toute la base Turso puis chiffre et televerse ;
     RESTAURER la reecrit ligne a ligne. Ce sont les deux operations les plus
     longues du pont — leur donner un delai court les ferait passer pour un echec
     alors qu'elles se poursuivent cote serveur, ce qui est le pire des deux. */
  /* La derniere sauvegarde au tableau de bord : c'est `sauvegarde:donnees`
     derriere, donc le meme aller-retour R2. On lui laisse la meme marge — et
     comme elle est lue APRES le premier dessin, elle ne retarde rien. */
  'tableau:sauvegarde': 60000,
  'tableau:verrous': 15000,
  /* Frais Stripe Tax (#22) : le relais interroge Turso puis agrege par mois.
     C est un aller-retour RESEAU, pas une lecture locale — le plafond ordinaire
     de 8 s le ferait passer pour un echec sur une liaison lente. */
  'depenses:fraisStripe': 45000,
  'sauvegarde:donnees': 60000, 'sauvegarde:creer': 600000, 'sauvegarde:telecharger': 180000,
  'sauvegarde:restaurer': 600000, 'sauvegarde:supprimer': 45000, 'sauvegarde:purger': 120000,
  // Studio virtuel : les presets et le compte sont legers ; un traitement peut
  // enchainer plusieurs appels Photoroom de ~120 s chacun.
  'studio:presets': 15000, 'studio:compte': 20000, 'studio:traiter': 300000,
  'studio:phototheque': 20000, 'studio:ouvrir': 8000, 'studio:enregistrer': 90000,
  // ⚠ 'studio:modeleGenerer' = un traitement Photoroom PUIS un depot dans R2 :
  // il tient du meme ordre de grandeur que 'studio:traiter', pas d une lecture.
  'studio:modeles': 15000, 'studio:modeleGenerer': 300000, 'studio:modelesVider': 120000,
  'photoroom:compte': 20000,
  // Detourage, impressions et rapports.
  'produit:photoIa': 120000,
  'produit:detourer': 30000, 'produit:teinter': 30000, 'stock:etiquettes': 30000,
  'stock:endommagesRapport': 30000, 'facture:imprimer': 30000, 'commande:bon': 30000,
  // La liste des retours RESYNCHRONISE les demandes avant de repondre (la
  // meme fraicheur que l ecran du site) : laisser le temps du nuage.
  'retours:liste': 20000,
  // Square est un service DISTANT : une annee entiere de paiements et de
  // remboursements, paginee, depasse largement le delai ordinaire.
  'paiements:charger': 60000,
  'etat:courriel': 45000,
  'cartescadeaux:liste': 20000,
  'chat:liste': 20000,
  'fidelisation:liste': 20000,
  'abonnes:liste': 20000,
  // L import cree un abonne par ligne : une longue liste prend du temps.
  'abonnes:importer': 60000,
  // Une campagne part par paquets de 100 vers TOUS les abonnes, et le canal
  // SMS envoie un appel par numero : c est legitimement long. Abandonner en
  // cours de route ne l arreterait pas — cela ne ferait que cacher le verdict.
  'campagnes:envoyer': 180000,
  // Le traitement des chaines envoie une etape par inscription echue.
  'chaines:traiter': 180000,
  // Google assemble plusieurs rapports pour une seule reponse, et Twilio
  // parcourt jusqu a 1000 appels : les deux sont lents avant d etre longs.
  'stats:ga': 60000,
  'stats:telephonie': 45000,
  // Un appel par reseau, et la file peut en compter plusieurs.
  'sociaux:publier': 60000,
  // Le test interroge Facebook/Instagram : un aller-retour hors de chez nous.
  'sociaux:config:donnees': 20000, 'sociaux:config:ecrire': 30000, 'sociaux:config:tester': 45000,
  /* La photo part en clair vers la PAGE, qui la range dans R2 : un televersement
     reel, pas une ecriture locale — d ou une limite large. */
  'chat:cfg:donnees': 20000, 'chat:cfg:ecrire': 30000, 'chat:cfg:ia': 30000, 'chat:cfg:photo': 90000,
  // ⚠ Les DEUX ecritures en lot sont larges : elles touchent potentiellement TOUT
  // le catalogue (un << tout cocher >>, ou plusieurs categories d un coup), et
  // chaque produit part vers Turso. Un delai court ferait dire << echec >> a une
  // ecriture qui aboutit — le pire des verdicts, puisqu on la refait.
  'liquidation:donnees': 20000, 'liquidation:choix': 20000, 'liquidation:cats': 20000,
  'liquidation:retirer': 30000, 'liquidation:lot': 120000, 'liquidation:parCategorie': 120000,
  /* Import / Export : appliquer ECRIT des CENTAINES de fiches et peut reprendre
     des dizaines de photos (chacune un transfert serveur) — c est de loin l op la
     plus longue, d ou 10 min, comme la creation de sauvegarde. L export attend au
     besoin la relecture des couts. */
  'catalogio:etat': 20000, 'catalogio:exporter': 120000, 'catalogio:modele': 20000,
  'catalogio:analyser': 60000, 'catalogio:lignes': 20000, 'catalogio:appliquer': 600000,
  'catalogio:rapport': 30000, 'catalogio:avis': 120000, 'catalogio:reinit': 10000,
  /* Attributs produits : chaque geste ecrit une config invMeta/invCats (rapide),
     mais `donnees` recalcule l'usage de chaque valeur sur TOUS les produits. */
  'invmeta:donnees': 30000, 'invmeta:sizeAdd': 20000, 'invmeta:sizeRemove': 20000,
  'invmeta:attrAdd': 20000, 'invmeta:attrRemove': 20000, 'invmeta:labelAdd': 20000,
  'invmeta:labelRemove': 20000, 'invmeta:colorAdd': 20000, 'invmeta:colorEdit': 20000,
  'invmeta:colorRemove': 20000, 'invmeta:codeSave': 20000, 'invmeta:codesAssign': 30000,
  'invmeta:colorSearch': 15000, 'invmeta:colToggle': 15000, 'invmeta:colMove': 15000,
  'invmeta:reachatSave': 20000, 'invmeta:catSave': 20000, 'invmeta:catDelete': 20000,
  /* Infolettre : testConn et processChains partent de VRAIS courriels (Resend) ;
     offerImage televerse une image dans R2. */
  'newsletter:dash': 20000, 'newsletter:cfgDonnees': 20000, 'newsletter:cfgEcrire': 30000,
  'newsletter:controls': 20000, 'newsletter:testConn': 60000, 'newsletter:offerDonnees': 20000,
  'newsletter:offerEcrire': 30000, 'newsletter:offerImage': 120000, 'newsletter:offerReset': 15000,
  'newsletter:processChains': 300000,
  /* Publicite ciblee : lecture (calcul sur toutes les ventes) ~30 s ; l'ecriture
     de campagne peut declencher une publication sociale. */
  'analytics:overview': 30000, 'analytics:segments': 30000, 'analytics:promos': 30000,
  'analytics:social': 30000, 'analytics:satisfaction': 20000, 'analytics:campaigns': 20000,
  'analytics:campForm': 20000, 'analytics:audience': 15000, 'analytics:campSave': 120000,
  'analytics:campLaunch': 60000, 'analytics:campDelete': 15000, 'analytics:segExport': 30000,
  /* Retirer une photo ecrit dans le nuage PUIS detruit l objet R2 : deux
     allers-retours reseau, pas une ecriture locale. */
  'fournisseurs:supprimer': 30000, 'avis:photoRetirer': 60000,
  'impot:profil': 20000, 'impot:profil:ecrire': 30000, 'impot:memo': 20000,
  'patrons:liste': 20000, 'patrons:ecrire': 30000, 'patrons:basculer': 30000,
  'patrons:supprimer': 30000, 'patrons:apercu': 20000,
  /* Publier un agencement ecrit les liaisons de CHAQUE piece puis la regle. */
  'reco:agencement': 20000, 'reco:agencement:publier': 45000, 'reco:creer': 30000, 'reco:editer': 30000,
  /* Rattacher une commande touche la commande, sa facture ET les statistiques
     d achat des DEUX comptes concernes : plus qu une ecriture simple. */
  'commande:lierApercu': 20000, 'commande:lierChercher': 20000, 'commande:lierEcrire': 30000,
  /* Ecrire une campagne ou une chaine televerse d abord les images collees en
     data URL vers R2 : c est le poste le plus long, et une chaine en a une par
     etape. D ou 60 s a l ecriture, contre 20 s pour lire un formulaire. */
  'campagnes:form': 20000, 'campagnes:ecrire': 60000,
  'chaines:form': 20000, 'chaines:ecrire': 60000,
  'nl:modele': 15000, 'nl:apercu': 20000,
  /* Compter un segment relit TOUTES les commandes pour batir le profil de
     chaque abonnee : plus long qu une simple lecture de config. */
  'segments:donnees': 30000, 'segments:apercu': 30000,
  'segments:ecrire': 30000, 'segments:supprimer': 30000,
  /* Interroge l imprimante pour connaitre sa VRAIE resolution (un 300 ppp rend
     lisible ce qui ne l etait pas a 203) : un appel a l agent, d ou 20 s. */
  'etiquettes:lisibilite': 20000,
  /* Sondage frequent et leger : une lecture de la table des verrous. Court
     expres — un sondage qui traine bloquerait le suivant. */
  'verrous:liste': 15000,
  'repertoire:donnees': 20000, 'repertoire:ajouter': 30000,
  /* Parcourt toute la phototheque et rend AUSSI les identifiants du resultat
     complet (pour << tout selectionner >>) : plus lourd qu une page seule. */
  'studio:explorer': 30000,
  /* Supprimer un retour efface aussi sa preuve photo du stockage : plus long
     qu une ecriture locale. */
  'retour:supprimerApercu': 20000, 'retour:supprimerEcrire': 30000,
  'fidelisation:sondage:form': 20000, 'fidelisation:sondage:ecrire': 30000,
  /* Le mot de passe passe par le SERVEUR (verification puis ecriture, avec
     hachage) : plus long qu'une ecriture locale. */
  'listenoire:donnees': 20000, 'listenoire:ajouter': 30000, 'listenoire:retirer': 30000,
  'adresse:suggerer': 15000,
  'profil:donnees': 20000, 'profil:motdepasse': 60000, 'profil:questions': 60000,
  'sociaux:publierTout': 180000,
  'ramassages:annuler': 30000,
  'ramassages:planifier': 45000,
  'messagerie:liste': 20000, 'messagerie:repondre': 30000, 'messagerie:retention': 20000,
  // Photothèque. Une photo importee est contenue, reencodee PUIS deposee dans le
  // stockage : c est le meme travail que l enregistrement d un produit, avec la
  // meme dependance a la vitesse de televersement d une boutique.
  'photos:importer': 90000,
  // Le detourage est un calcul local sur un million de pixels, suivi de deux
  // depots (la transparente et le rendu).
  'photos:isoler': 60000, 'photos:fond': 45000,
  // Attacher reencode, depose dans products/ ET ecrit la fiche.
  'photos:attacher': 60000,
  // Le catalogue complet peut etre relu avant la premiere recherche.
  'photos:produits': 20000,
  'photos:enregistrer': 30000,
  // Vider retire les entrees UNE PAR UNE (fusion serveur) : une mediatheque
  // fournie prend du temps, et abandonner en route ne l arreterait pas.
  'photos:vider': 120000,
  // ⚠ JUSQU A 200 PHOTOS D UNE CARTE D APPAREIL, chacune lue, compressee et
  // deposee. C est legitimement long ; sonner << delai >> pendant que l import
  // continue derriere ferait recommencer, et donc doubler la mediatheque.
  'photos:usb': 300000,
  // Le Centre d impression RASTERISE : la liste peint une vignette par modele
  // (donc charge leurs images), et l apercu en peint une grande.
  'promo:donnees': 60000, 'promo:apercu': 45000,
  // Un lot part vers l imprimante, apres une rasterisation a la resolution
  // native au premier appel. Les suivants reutilisent l image.
  'promo:lot': 90000,
  // La planche compose une feuille entiere a 300 dpi.
  'promo:planche': 60000,
  'promo:imprimante': 20000,
  // Une facture passe par la compression, l extraction du texte d un PDF (ou le
  // rendu de ses pages), le service d IA et le taux de change : c est la plus
  // longue chaine du module.
  'depenses:facture': 120000,
  // Le recu est compresse ici, et depose dans le stockage a l enregistrement.
  'depenses:recu': 45000, 'depenses:enregistrer': 90000,
  // Le lien de l exercice CONSTRUIT le rapport comptable complet, cree le
  // partage chiffre et envoie un courriel a chaque destinataire : bien au-dela
  // du plafond ordinaire. L operation donnees fait un aller-retour au registre
  // distant des partages.
  'comptable:creer': 90000, 'comptable:donnees': 20000,
};

/* Le prechargement demande la table ICI, une fois, plutot que d en tenir une
   copie. ⚠ SYNCHRONE ET C EST VOULU : c est un seul aller-retour, au tout
   premier appel, et il doit etre resolu AVANT que le premier plafond ne se pose.
   Une promesse ferait courir la premiere operation sans plafond du tout. */
ipcMain.on('pont:limites', (e) => { e.returnValue = LIMITES_PONT; });

/* ⚠ LA FENETRE INVENTAIRE SE TIENT A JOUR TOUTE SEULE (demande du 2026-08-08 :
   << si on met a jour un produit, l inventaire natif doit prendre ses
   modifications sans rafraichissement >>). Quand une operation qui CHANGE les
   produits ou le stock REUSSIT, on demande a la fenetre Inventaire de se
   relire — JAMAIS a celle qui vient d agir (ses propres ecrans rechargent
   deja), et c est la PAGE qui choisit le bon moment : elle refuse pendant une
   saisie ou sous un voile (la regle << ne jamais redessiner pendant une
   saisie >>). Meme mecanique que szRevenir : un crochet execute, inerte si la
   page ne le porte pas. */
const OPS_QUI_CHANGENT_L_INVENTAIRE = new Set([
  'produit:enregistrer',
  'stock:enregistrer', 'stock:supprimer', 'stock:skuUn', 'stock:skuTous',
  'stock:skuPad6', 'stock:venteFinale', 'stock:vendre',
  'stock:entrepotEcrire', 'stock:entrepotSupprimer',
  'caisse:vendre', 'retour:finaliser', 'remboursement:ecrire',
  // Attacher une photo ECRIT sur la fiche : l Inventaire ouvert a cote doit la
  // voir sans qu on le rafraichisse a la main.
  'photos:attacher',
]);
const actualiserFenetres = (cles, sender) => {
  (cles || []).forEach((cle) => {
    const win = fenetresNatives.get(cle);
    if (win && !win.isDestroyed() && (!sender || win.webContents !== sender)) {
      win.webContents.executeJavaScript('window.szActualiser && window.szActualiser()', true).catch(() => {});
    }
    // Le meme ecran peut vivre ANCRE dans la fenetre principale : il se tient
    // a jour de la meme facon.
    const a = ancrees.get(cle);
    if (a && a.view && !a.view.webContents.isDestroyed() && (!sender || a.view.webContents !== sender)) {
      a.view.webContents.executeJavaScript('window.szActualiser && window.szActualiser()', true).catch(() => {});
    }
  });
};
// Le tableau de bord suit davantage d ecritures que l inventaire : toute
// operation qui change une commande, un retour ou un remboursement le fait
// bouger aussi.
const OPS_QUI_CHANGENT_LE_TABLEAU = new Set([
  'commande:statut', 'commande:prete', 'commande:expedier',
  'commandes:statutEcrire', 'commandes:supprimerEcrire', 'commandes:fraisEcrire',
  'expedition:confirmer', 'retour:enregistrer', 'retour:recu', 'retour:litige',
  'client:ecrire', 'client:purger', 'client:restaurer',
  'archives:reactiver', 'factures:payer', 'factures:supprimer',
]);

ipcMain.handle('pont:appeler', async (e, op, args) => {
  const nom = String(op || '');
  if (!OPS_PONT.has(nom)) return { ok: false, motif: 'operation_inconnue' };
  const wc = mainWindow && !mainWindow.isDestroyed() ? mainWindow.webContents : null;
  if (!wc) return { ok: false, motif: 'pont_indisponible' };
  const code = '(function(){try{'
    + 'if(!window.SzPont)return{ok:false,motif:"indisponible"};'
    + 'return SzPont.executer.apply(null,[' + litteralJs(nom) + '].concat('
    + litteralJs(Array.isArray(args) ? args : []) + '));'
    + '}catch(e){return{ok:false,motif:"erreur"};}})()';
  // ⚠⚠ LE PLAFOND EST ICI AUSSI, ET C'EST CELUI QUI COMPTE VRAIMENT.
  // `executeJavaScript` attend la promesse rendue par la page. Si celle-ci ne se
  // règle JAMAIS — une opération du site qui interroge un périphérique muet, par
  // exemple une imprimante Bluetooth éteinte — cet `await` ne rend jamais rien.
  // Aucune exception, aucun journal : l'appel reste simplement en suspens, et la
  // fenêtre native attend pour toujours.
  // Vécu le 2026-08-07 : la fenêtre Imprimantes restait sur « Lecture de l'état… »
  // indéfiniment. J'avais posé un plafond dans le préchargement, mais le vrai
  // blocage est ici — et un garde placé du mauvais côté ne garde rien.
  // ⚠ LE PLAFOND EST PAR OPERATION (2026-08-08). Le << 8 s : au-dela, plus
  // aucune operation n'a de raison d'etre en cours >> etait devenu FAUX :
  // l'enregistrement d'un produit depose ses photos dans le stockage, une
  // etiquette attend le transporteur, un remboursement attend Square. Le
  // plafond sonnait << delai >> pendant que l'operation REUSSISSAIT derriere —
  // et la personne recommencait, fabriquant un doublon. 8 s reste le defaut ;
  // les operations legitimement longues ont leur limite (liste jumelle dans
  // pont-preload.js, qui laisse 5 s de plus a celui-ci pour repondre).
  try {
    let fini = false;
    const travail = wc.executeJavaScript(code, true).then((r) => { fini = true; return r; });
    const plafond = new Promise((resoudre) => {
      setTimeout(() => { if (!fini) resoudre({ ok: false, motif: 'delai' }); }, LIMITES_PONT[nom] || 8000);
    });
    const r = await Promise.race([travail, plafond]);
    if (r && r.ok) {
      const fenetres = [];
      // La fenetre Factures suit les memes ecritures que le tableau : une
      // vente, un remboursement ou un statut de commande la font bouger aussi.
      // La liste Produits en vente suit celles de l inventaire (fiches, stock) ;
      // Clients suit les deux (une vente change ses totaux, client:ecrire sa
      // fiche) ; Retours suit les operations de retour des deux ensembles.
      if (OPS_QUI_CHANGENT_L_INVENTAIRE.has(nom)) fenetres.push('inventaire', 'tableau', 'factures', 'produits', 'clients', 'retours', 'codesbarres', 'archives');
      else if (OPS_QUI_CHANGENT_LE_TABLEAU.has(nom)) fenetres.push('tableau', 'factures', 'clients', 'retours', 'archives');
      // Les assistants collection et fournisseur previennent leur liste.
      if (nom === 'collection:enregistrer') fenetres.push('collections');
      if (nom === 'fournisseur:enregistrer') fenetres.push('fournisseurs');
      if (fenetres.length) actualiserFenetres(fenetres, e.sender);
    }
    return (r && typeof r === 'object') ? r : { ok: false, motif: 'erreur' };
  } catch { return { ok: false, motif: 'pont_indisponible' }; }
});

// ── RELAIS DE L'AFFICHAGE CLIENT ────────────────────────────────────────────
// La caisse (fenêtre principale) pousse son état ; on le porte à la fenêtre
// d'affichage. Aucun aller-retour réseau : l'afficheur suit le scan à l'instant.
//
// ⚠ CE RELAIS NE VA QUE DANS UN SENS, et c'est délibéré. L'afficheur est posé
// devant une cliente : il ne doit pouvoir NI écrire, NI commander quoi que ce
// soit. Il reçoit, il affiche. Rien ne remonte.
//
// ⚠ ET SEULE LA FENÊTRE PRINCIPALE PEUT ÉMETTRE. Sans ce contrôle, n'importe quel
// document chargé dans n'importe quelle fenêtre pourrait afficher n'importe quel
// montant devant la cliente — un total falsifié sur l'écran qu'elle regarde au
// moment de payer.
ipcMain.on('pos:diffuser', (e, etat) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (e.sender !== mainWindow.webContents) return;
  const w = fenetresNatives.get('pos-client');
  if (!w || w.isDestroyed()) return;          // afficheur fermé : rien à faire
  try { w.webContents.send('pos:etat', etat || {}); } catch {}
});

/* ══ ÉCRANS NATIFS ANCRÉS DANS LA FENÊTRE PRINCIPALE (2026-08-08) ═══════════
   << c est toujours la portion web qui s ouvre >> : la barre laterale du site
   naviguait vers les ecrans web, seules les entrees de MENU ouvraient les
   fenetres. Une WebContentsView — la MEME page, le MEME pont-preload que la
   fenetre — se pose par-dessus la zone de contenu de la fenetre principale ;
   << Detacher >> DEPLACE la vue (donc son etat, saisies comprises) dans une
   BaseWindow. Le site dit OU se trouve la zone (dock:zone, en px CSS) ; on la
   convertit ici avec le facteur de zoom courant.
   ⚠ Echap ou << fermer >> dans une vue ancree ne doit JAMAIS fermer la fenetre
   principale : pont:fermer distingue les deux (voir plus bas). */
const ancrees = new Map();   // cle -> { view, fenetre: BaseWindow|null }
// Onglet demandé pour un OUVERTURE FRAÎCHE de Journaux via un lien de retour
// (#7 7b-2c). Lu par la carte PAGES_ANCRABLES quand la fenêtre naît ; remis à
// vide juste après, pour qu'une ouverture par le menu reparte sur l'onglet par défaut.
let _journauxOnglet = '';
let zoneAncrage = null;      // { x, y, largeur, hauteur } en px CSS de la page
const PAGES_ANCRABLES = () => ({
  tableau: ['Tableau de bord', () => pageTableau()],
  inventaire: ['Inventaire', () => pageInventaire('')],
  commandes: ['Commandes', () => pageCommandes('commandes')],
  produits: ['Produits en vente', () => pageProduits()],
  clients: ['Clients', () => pageClients()],
  collections: ['Nos Collections', () => pageCollections()],
  fournisseurs: ['Fournisseurs', () => pageFournisseurs()],
  retours: ['Nos Retours', () => pageRetours()],
  factures: ['Factures', () => pageFactures()],
  codesbarres: ['Impression de codes-barres', () => pageCodesbarres()],
  avis: ['Avis produits', () => pageAvis('')],
  messagerie: ['Messagerie clients', () => pageMessagerie()],
  archives: ['Archives', () => pageArchives()],
  paiements: ['Paiements Square', () => pagePaiements()],
  cartescadeaux: ['Cartes-cadeaux', () => pageCartesCadeaux()],
  coupons: ['Coupons', () => pageCoupons()],
  promotions: ['Offres et annonces', () => pagePromotions()],
  chat: ['Chat en ligne', () => pageChat()],
  sociaux: ['Réseaux sociaux', () => pageSociaux('')],
  fidelisation: ['Fidélisation et sondages', () => pageFidelisation('')],
  liquidation: ['Liquidation / Vente finale', () => pageLiquidation('')],
  catalogio: ['Import / Export Boutique', () => pageCatalogio('')],
  invmeta: ['Attributs produits', () => pageInvMeta('')],
  newsletter: ['Infolettre', () => pageNewsletter('')],
  publicite: ['Publicité ciblée', () => pagePublicite('')],
  recommandations: ['Recommandations', () => pageRecommandations('')],
  recherches: ['Recherches sans résultat', () => pageRecherches()],
  abonnes: ['Abonnés de l’infolettre', () => pageAbonnes()],
  journal: ['Journal d’envoi', () => pageJournal()],
  campagnes: ['Campagnes et chaînes', () => pageCampagnes()],
  statistiques: ['Statistiques', () => pageStatistiques()],
  photos: ['Photos', () => pagePhotos()],
  promo: ['Centre d’impression', () => pagePromo()],
  depenses: ['Dépenses d’entreprise', () => pageDepenses()],
  remboursements: ['Remboursements et crédits', () => pageRemboursements()],
  impot: ['Fiscalité et impôt', () => pageImpot()],
  liens: ['Liens d’installation', () => pageLiens('')],
  comptable: ['Liens comptables', () => pageComptable('')],
  bankrec: ['Conciliation bancaire', () => pageBanque('')],
  'fal-suivi': ['Traitements d’image', () => pageFal('')],
  // #37 : apps de terrain ANCRABLES par défaut + détachables, comme les autres
  // (avant : fenêtres autonomes via ouvrirNative — « toujours pas ancré »).
  expeditions: ['Expéditions', () => pageCommandes('expeditions')],
  caisse: ['Vente au comptoir', () => pageCaisse()],
  ramassages: ['Ramassages et rapport', () => pageRamassages()],
  // Onglets de Configuration portes en fenetre native (palier 5). ⚠ ILS SONT
  // ANCRABLES COMME LES AUTRES : sans cette declaration, dockOuvrir ne connait
  // pas la cle et la fenetre naissait toujours detachee.
  'config-heures': ['Heures d’ouverture', () => pageHeures()],
  'config-footer': ['Pied de page', () => pageFooter()],
  'config-apparence': ['Thème et apparence', () => pageApparence()],
  'config-marque': ['Logos et marque', () => pageMarque()],
  'config-icones': ['Icônes personnalisées', () => pageIcones()],
  'config-taxes': ['Gestion des taxes', () => pageTaxes()],
  'config-paiements': ['Configuration des paiements', () => pagePaiementsConfig()],
  'config-cles': ['Clés API', () => pageClesConfig()],
  'config-livraison': ['Configuration de la livraison', () => pageLivraison()],
  'config-retours': ['Configuration des retours', () => pageConfigRetours()],
  'config-navigation': ['Configuration de la navigation', () => pageConfigNavigation()],
  'config-carriers': ['Transporteurs', () => pageTransporteurs()],
  'config-automations': ['Automatisations', () => pageAutomations()],
  'config-telephonie': ['Téléphonie', () => pageTelephonie()],
  'config-models': ['Modèles par vue', () => pageModeles()],
  'config-gabarits': ['Gabarits courriel', () => pageGabarits()],
  'config-logotheque': ['Logothèque', () => pageLogotheque()],
  'config-analytics': ['Statistiques (Google Analytics)', () => pageAnalytics()],
  'config-turso': ['Base de données', () => pageBd()],
  'config-homepage': ['Page d’accueil', () => pageAccueil()],
  'config-launch': ['Mode lancement', () => pageLancement()],
  'pages': ['Pages du site', () => pagePages()],
  'securite': ['Accès Utilisateurs', () => pageSecurite()],
  'reglages-securite': ['Réglages de sécurité', () => pageReglagesSecurite()],
  'sociaux-config': ['Configuration des réseaux sociaux', () => pageSociauxConfig()],
  'chat-config': ['Configuration du chat en ligne', () => pageChatConfig('')],
  'listenoire': ['Liste noire', () => pageListeNoire('')],
  'profil': ['Mon profil', () => pageProfil()],
  'journaux': ['Journaux', () => pageJournaux(_journauxOnglet || '')],
  'incidents': ['Incidents de sécurité', () => pageIncidents('')],
  'sauvegarde': ['Sauvegarde & Restauration', () => pageSauvegarde('')],
  'studio': ['Studio virtuel', () => pageStudio()],
});
// L ETAT ANCRE OU DETACHE EST RETENU PAR ECRAN (demande du 2026-08-08 :
// << tu charges la fenetre native appropriee dans son etat enregistre, soit
// ancre ou detache >>). Par POSTE (reglages.json), comme la place du menu :
// l ecran du comptoir n est pas celui du bureau.
// LE TABLEAU DE BORD NE SE DETACHE PAS (demande du 2026-08-09) : c est l ecran
// d ouverture de session — detache, la fenetre principale n aurait qu un fond
// vide. Il est ancre en permanence ; un etat << detache >> retenu d avant
// cette regle est ignore.
const NON_DETACHABLES = new Set(['tableau']);
const etatAncrage = (cle) => {
  if (NON_DETACHABLES.has(cle)) return 'ancre';
  return (reglages.get('ancrage') || {})[cle] === 'detache' ? 'detache' : 'ancre';
};
const etatAncragePoser = (cle, etat) => {
  const tout = { ...(reglages.get('ancrage') || {}) };
  if (tout[cle] === etat) return;
  tout[cle] = etat;
  reglages.set('ancrage', tout);
};
// Emporte la vue dans sa propre BaseWindow (detachement, ou reouverture d un
// ecran laisse detache). La vue VOYAGE — jamais rechargee, l etat suit.
const poserEnFenetre = (c, a) => {
  const defs = PAGES_ANCRABLES();
  const win = new BaseWindow({
    width: 1080, height: 780, minWidth: 760, minHeight: 520,
    title: (defs[c] || [''])[0], autoHideMenuBar: true, backgroundColor: '#0e1522',
  });
  win.contentView.addChildView(a.view);
  const poser = () => {
    try { const [w, h] = win.getContentSize(); a.view.setBounds({ x: 0, y: 0, width: w, height: h }); } catch {}
  };
  win.on('resize', poser);
  poser();
  try { a.view.setVisible(true); } catch {}
  a.fenetre = win;
  win.on('closed', () => {
    // Vue REPRISE par << Ancrer >> juste avant la fermeture : elle vit toujours.
    if (a.reancre) { a.reancre = false; return; }
    // Fenetre detachee fermee : la vue meurt avec elle — la barre laterale
    // en recree une fraiche au prochain clic.
    try { a.view.webContents.close(); } catch {}
    ancrees.delete(c);
  });
  a.view.webContents.executeJavaScript('window.szModeAncre && window.szModeAncre(false);', true).catch(() => {});
  return win;
};
const boundsAncrage = () => {
  if (!zoneAncrage || !mainWindow || mainWindow.isDestroyed()) return null;
  const f = mainWindow.webContents.getZoomFactor() || 1;
  return { x: Math.round(zoneAncrage.x * f), y: Math.round(zoneAncrage.y * f),
           width: Math.max(0, Math.round(zoneAncrage.largeur * f)),
           height: Math.max(0, Math.round(zoneAncrage.hauteur * f)) };
};
const reposerAncrees = () => {
  const b = boundsAncrage();
  if (!b) return;
  ancrees.forEach((a) => { if (!a.fenetre && a.view) { try { a.view.setBounds(b); } catch {} } });
};
ipcMain.on('dock:zone', (e, rect) => {
  if (!mainWindow || e.sender !== mainWindow.webContents) return;
  if (!rect || typeof rect !== 'object') return;
  zoneAncrage = { x: Number(rect.x) || 0, y: Number(rect.y) || 0,
    largeur: Number(rect.largeur) || 0, hauteur: Number(rect.hauteur) || 0 };
  reposerAncrees();
});
ipcMain.handle('dock:ouvrir', (e, cle, etat) => {
  if (!mainWindow || e.sender !== mainWindow.webContents) return false;
  const defs = PAGES_ANCRABLES();
  const c = String(cle || '');
  if (!defs[c]) return false;
  /* L ETAT VOULU VIENT DU SITE depuis 1.56.0 (profil de la PERSONNE, Turso) :
     le reglages.json du poste n est plus que le repli des sites plus vieux
     qui n envoient pas le 2e argument. */
  const etatVoulu = NON_DETACHABLES.has(c) ? 'ancre'
    : (etat === 'detache' || etat === 'ancre') ? etat : etatAncrage(c);
  // Une fenetre SEPAREE du meme ecran existe (ouverte par le menu) : on la
  // ramene plutot que d empiler une deuxieme instance — deux inventaires,
  // c est deux etats de scan qui se contredisent.
  const exist = fenetresNatives.get(c);
  if (exist && !exist.isDestroyed()) {
    if (exist.isMinimized()) exist.restore();
    exist.show(); exist.focus();
    return { ok: true, deja: 'fenetre' };
  }
  // Une seule vue ancree visible a la fois : la zone est la meme pour toutes.
  ancrees.forEach((a, k) => { if (k !== c && !a.fenetre && a.view) { try { a.view.setVisible(false); } catch {} } });
  let a = ancrees.get(c);
  if (a && a.fenetre && !a.fenetre.isDestroyed()) {
    // Deja detachee : le reclic la ramene au premier plan.
    if (a.fenetre.isMinimized()) a.fenetre.restore();
    a.fenetre.show(); a.fenetre.focus();
    return { ok: true, deja: 'detachee' };
  }
  if (!a || !a.view || a.view.webContents.isDestroyed()) {
    const view = new WebContentsView({ webPreferences: {
      preload: path.join(__dirname, 'pont-preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true,
    } });
    a = { view, fenetre: null };
    ancrees.set(c, a);
    view.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(defs[c][1]()));
    view.webContents.on('did-finish-load', () => {
      // `a.fenetre` est lu AU MOMENT du chargement : la vue a pu etre ouverte
      // directement detachee (etat enregistre) — le bouton doit dire Ancrer.
      view.webContents.executeJavaScript('window.szModeAncre && window.szModeAncre(' + (a.fenetre ? 'false' : 'true') + ');', true).catch(() => {});
      appliquerTheme(view.webContents);
      _zoomRattraper(view.webContents);
    });
  } else {
    // Vue conservee cachee : elle RELIT ses donnees en revenant.
    a.view.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
  }
  if (etatVoulu === 'detache') {
    // L ecran a ete LAISSE detache : on le rouvre tel quel. Le site montre
    // l ecriteau << detache >> dans la zone (dock:detachee).
    poserEnFenetre(c, a);
    a.fenetre.show(); a.fenetre.focus();
    if (ancreeVisible !== c) { /* la vue posee, s il y en avait une, a ete cachee ci-dessus */ }
    ancreeVisible = null; vueVoilee = null;
    try { mainWindow.webContents.send('dock:detachee', c); } catch {}
    return { ok: true, detachee: true };
  }
  try { mainWindow.contentView.addChildView(a.view); } catch {}
  try { a.view.setVisible(true); } catch {}
  const b = boundsAncrage();
  if (b) { try { a.view.setBounds(b); } catch {} }
  ancreeVisible = c; vueVoilee = null;
  return { ok: true };
});
// Le site navigue vers une section ordinaire : les vues ancrees se cachent
// (JAMAIS detruites — revenir est instantane et l etat survit).
ipcMain.on('dock:cacher', (e) => {
  if (!mainWindow || e.sender !== mainWindow.webContents) return;
  ancrees.forEach((a) => { if (!a.fenetre && a.view) { try { a.view.setVisible(false); } catch {} } });
  ancreeVisible = null; vueVoilee = null;
});
// LE VOILE DU MENU DE L APPLICATION : masquer puis remontrer la vue ancree
// SANS la recharger. Les panneaux du menu vivent dans la PAGE, donc sous la
// vue native (releve du 2026-08-09 : << le menu est en dessous du tableau de
// bord >>) — le site voile pendant qu un panneau est deploye. Le repli 1.52
// (dockCacher + dockOuvrir) relisait les donnees a chaque fermeture de menu ;
// ici on ne touche qu a la visibilite, et on ne remontre que ce qu on a cache.
// ⚠⚠ ELECTRON 31 N A PAS view.getVisible() — la 1.54.0 s y fiait pour savoir
// quoi cacher et ne cachait donc JAMAIS rien (le menu repassait dessous,
// deux fois vecu le meme soir). La visibilite est desormais SUIVIE ICI :
// `ancreeVisible` porte la cle de LA vue posee sur la zone (il n y en a
// jamais qu une), et chaque geste qui la change la met a jour.
let ancreeVisible = null;
let vueVoilee = null;
ipcMain.on('dock:voiler', (e, visible) => {
  if (!mainWindow || e.sender !== mainWindow.webContents) return;
  if (visible) {
    const a = vueVoilee && ancrees.get(vueVoilee);
    vueVoilee = null;
    if (a && !a.fenetre && a.view) {
      try { a.view.setVisible(true); } catch {}
      const b = boundsAncrage();
      if (b) { try { a.view.setBounds(b); } catch {} }
    }
    return;
  }
  vueVoilee = null;
  const a = ancreeVisible && ancrees.get(ancreeVisible);
  if (a && !a.fenetre && a.view) {
    vueVoilee = ancreeVisible;
    try { a.view.setVisible(false); } catch {}
  }
});
// << Detacher >> — demande par la VUE elle-meme : on DEPLACE la vue dans une
// BaseWindow, sans recharger : l etat (filtres, saisies, page) voyage avec.
ipcMain.handle('dock:detacher', (e) => {
  for (const [c, a] of ancrees) {
    if (!a.view || a.view.webContents !== e.sender || a.fenetre) continue;
    if (NON_DETACHABLES.has(c)) return false;   // le tableau de bord reste ancre
    try { mainWindow.contentView.removeChildView(a.view); } catch {}
    poserEnFenetre(c, a);
    etatAncragePoser(c, 'detache');   // l ecran rouvrira DETACHE desormais
    if (ancreeVisible === c) ancreeVisible = null;
    vueVoilee = null;
    try { mainWindow.webContents.send('dock:detachee', c); } catch {}
    return true;
  }
  return false;
});
// << Ancrer >> — demande par la VUE detachee : elle REVIENT dans la fenetre
// principale (jamais rechargee, l etat voyage), et l etat retenu redevient
// << ancre >>. Le site est prevenu (dock:ancree) pour naviguer vers la section
// hote — la zone d ancrage n existe que la.
ipcMain.handle('dock:ancrer', (e) => {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  for (const [c, a] of ancrees) {
    if (!a.view || a.view.webContents !== e.sender || !a.fenetre) continue;
    const win = a.fenetre;
    a.reancre = true;   // la fermeture de la fenetre ne doit PAS detruire la vue
    try { win.contentView.removeChildView(a.view); } catch {}
    a.fenetre = null;
    try { win.close(); } catch {}
    etatAncragePoser(c, 'ancre');
    // Une seule vue ancree visible a la fois — comme dock:ouvrir.
    ancrees.forEach((x, k) => { if (k !== c && !x.fenetre && x.view) { try { x.view.setVisible(false); } catch {} } });
    try { mainWindow.contentView.addChildView(a.view); } catch {}
    try { a.view.setVisible(true); } catch {}
    const b = boundsAncrage();
    if (b) { try { a.view.setBounds(b); } catch {} }
    a.view.webContents.executeJavaScript('window.szModeAncre && window.szModeAncre(true);', true).catch(() => {});
    ancreeVisible = c; vueVoilee = null;
    mainWindow.show(); mainWindow.focus();
    try { mainWindow.webContents.send('dock:ancree', c); } catch {}
    return true;
  }
  return false;
});

ipcMain.on('pont:fermer', (e) => {
  // Une vue ANCREE qui << ferme >> (Echap) se cache — fermer la fenetre
  // principale a sa place serait la pire des surprises.
  for (const [c, a] of ancrees) {
    if (a.view && a.view.webContents === e.sender) {
      if (a.fenetre && !a.fenetre.isDestroyed()) { a.fenetre.close(); return; }
      try { a.view.setVisible(false); } catch {}
      if (ancreeVisible === c) ancreeVisible = null;
      vueVoilee = null;
      try { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('dock:fermee', c); } catch {}
      return;
    }
  }
  const w = BrowserWindow.fromWebContents(e.sender);
  if (w && !w.isDestroyed()) w.close();
});

// ⚠ UN VRAI PLEIN ÉCRAN, pas une classe CSS. L'éditeur du site n'a que la
// seconde solution — il vit dans un onglet et ne peut qu'étirer un bloc dans la
// page. Ici la fenêtre existe pour de bon, donc on demande au système.
// ⚠ CETTE OPÉRATION NE PASSE PAS PAR `OPS_PONT` : cette liste-là garde l'accès
// aux données et à la session du site. Piloter la fenêtre qui appelle n'y a rien
// à faire, et l'y mêler brouillerait ce qu'elle protège.
// Rend le nouvel état, pour que le bouton porte le bon libellé au lieu de
// supposer que sa demande a abouti.
/* ⚠⚠ UNE VUE ANCRÉE N'EST PAS UNE FENÊTRE. `BrowserWindow.fromWebContents` rend
   null pour une WebContentsView : elle appartient au cadre de la fenêtre
   principale, elle n'en est pas une. Le handler rendait donc `false` sans rien
   faire, et le bouton de plein écran d'une vue ancrée était MORT — silencieux,
   donc indiagnosticable. Tant qu'il n'existait que dans produit.js et photos.js
   le défaut passait inaperçu ; en le posant dans les 83 fenêtres, on l'aurait
   multiplié par soixante-quatre (le nombre de sections ancrables).
   C'est le même détour que `pont:fermer` fait déjà quelques lignes plus haut.
   ⚠ ANCRÉE → C'EST LA FENÊTRE PRINCIPALE QU'ON AGRANDIT : la vue occupe son
   cadre, donc c'est bien elle qui doit passer en plein écran. Détachée dans sa
   propre fenêtre (`a.fenetre`), c'est celle-là. Et `_suivrePleinEcran` /
   `_zoomPartout` s'occupent déjà de faire grossir les vues ancrées avec elle. */
const _fenetreDeLAppelant = (sender) => {
  for (const [, a] of ancrees) {
    if (a.view && a.view.webContents === sender) {
      return (a.fenetre && !a.fenetre.isDestroyed()) ? a.fenetre : mainWindow;
    }
  }
  return BrowserWindow.fromWebContents(sender);
};
ipcMain.handle('fenetre:pleinecran', (e) => {
  const w = _fenetreDeLAppelant(e.sender);
  if (!w || w.isDestroyed()) return false;
  const vers = !w.isFullScreen();
  w.setFullScreen(vers);
  return vers;
});

// ── Fabrique commune des fenêtres natives ───────────────────────────────────
// ⚠ UNE SEULE PAR CLÉ. Sans ce registre, cliquer deux fois sur « Nouveau
// fournisseur » ouvrirait deux formulaires sur la même fiche : deux verrous
// demandés, un seul obtenu, et la deuxième fenêtre travaillerait pour rien.
// ⚠ LES OUTILS DE DEVELOPPEMENT DANS LES FENETRES NATIVES, ET POURQUOI CELA
// COMPTE. Ctrl+Shift+I ne faisait RIEN : une fenêtre native n'a pas de menu, donc
// aucun raccourci n'y est enregistré. Conséquence vécue le 2026-08-07 : la fenêtre
// Imprimantes est restée bloquée à travers QUATRE versions, et l'erreur — s'il y en
// avait une — n'était visible de personne. Ni de l'usager, ni de moi.
// Une fenêtre qu'on ne peut pas inspecter est une fenêtre qu'on répare en
// devinant. Le raccourci est posé sur chaque fenêtre native, une fois pour toutes.
const brancherOutils = (win) => {
  try {
    win.webContents.on('before-input-event', (ev, entree) => {
      if (entree.type !== 'keyDown') return;
      const k = String(entree.key || '').toLowerCase();
      if ((entree.control || entree.meta) && entree.shift && k === 'i') {
        ev.preventDefault();
        win.webContents.toggleDevTools();
      }
      // F12 aussi : c'est le réflexe de la moitié des gens.
      if (k === 'f12') { ev.preventDefault(); win.webContents.toggleDevTools(); }
    });
  } catch {}
};

/* ── LE MODE JOUR/NUIT SUIT LE SITE (1.58.1) ────────────────────────────────
   Les fenetres natives sont dessinees nuit d abord ; quand l administration
   est en mode jour, la classe `jour` est posee sur leur <html> (la feuille
   CSS_JOUR du socle fait le reste). Le drapeau vient du site avec le modele
   du menu (_modele.sombre, lu du theme de l administration) — pousse au
   chargement de chaque fenetre, et a chaque bascule du theme.
   ⚠ REGLE POUR TOUTE NOUVELLE FENETRE : construire sur le vocabulaire commun
   (tete/carte/pill/pied...) et appendre CSS_JOUR — le theme suit alors tout
   seul, rien d autre a brancher. */
const jsTheme = () => {
  const jour = !_modele.sombre;
  return 'document.documentElement.classList.toggle("jour",' + jour + ');'
    + 'document.documentElement.style.colorScheme=' + JSON.stringify(jour ? 'light' : 'dark') + ';';
};
const appliquerTheme = (wc) => {
  try { if (wc && !wc.isDestroyed()) wc.executeJavaScript(jsTheme(), true).catch(() => {}); } catch {}
};
/* ── LA BARRE DE TITRE OS SUIT LE THEME (#41) ───────────────────────────────
   Les fenetres a CADRE STANDARD (ouvrirNative, fenetresTravail : « Detail de
   commande », etc.) ne posent PAS de titleBarOverlay : Windows peint alors leur
   barre de titre selon le theme du SYSTEME — donc BLANCHE quand l ordinateur est
   en clair, meme si l administration est sombre (signale 2026-08-14, capture a
   l appui). On force le theme OS a suivre celui de l administration : toutes ces
   barres de titre deviennent sombres/claires d un coup, sans toucher a chacune
   des ~84 fenetres. La fenetre PRINCIPALE garde son titleBarOverlay explicite
   (couleur reelle envoyee par la page) : il gagne sur themeSource, rien ne
   change pour elle. */
const _majThemeOS = () => {
  try { nativeTheme.themeSource = (_modele && _modele.sombre) ? 'dark' : 'light'; } catch (_) {}
};
const appliquerThemePartout = () => {
  _majThemeOS();
  fenetresNatives.forEach((w) => { if (w && !w.isDestroyed()) appliquerTheme(w.webContents); });
  ancrees.forEach((a) => { if (a.view && !a.view.webContents.isDestroyed()) appliquerTheme(a.view.webContents); });
};

/* ── LE PLEIN ÉCRAN DOIT AUSSI AGRANDIR LE CONTENU ──────────────────────────
   Signalé le 2026-08-14, sur la fenêtre « Nouveau produit » : passée en plein
   écran, elle s'étirait sans que rien ne grossisse. On y gagnait de la surface,
   pas de la LISIBILITÉ — or c'est la lisibilité qu'on vient chercher en passant
   en plein écran.
   La feuille commune des fenêtres (CSS_PLEIN, socle.js) porte déjà la règle
   `html.sz-zoom-fen` ; il ne manquait que de poser la classe. On la pose ici, et
   pas dans chaque fenêtre : l'état « plein écran » appartient à la COQUILLE, la
   page ne le connaît pas.
   ⚠ CLASSE DISTINCTE de `sz-zoom` (le plein écran d'une SURCOUCHE) : refermer un
   assistant appelle szPleinReinit, qui retire `sz-zoom`. Avec une classe unique,
   fermer l'assistant aurait rapetissé une fenêtre pourtant encore en plein
   écran, sans rien pour l'expliquer. */
const _zoomFenetre = (wc, on) => {
  if (!wc || wc.isDestroyed()) return;
  wc.executeJavaScript(
    'document.documentElement.classList.toggle("sz-zoom-fen",' + (on ? 'true' : 'false') + ')'
  ).catch(() => {});
};
/* La fenêtre PRINCIPALE emporte ses vues ANCRÉES : elles vivent dans son cadre
   et passent donc en plein écran avec elle, sans qu'aucun événement ne les en
   avertisse. Sans cette boucle, l'écran ancré serait le seul à ne pas suivre. */
const _zoomPartout = (win, on) => {
  if (!win || win.isDestroyed()) return;
  _zoomFenetre(win.webContents, on);
  if (win === mainWindow) {
    ancrees.forEach((a) => { if (a.view) _zoomFenetre(a.view.webContents, on); });
  }
};
const _suivrePleinEcran = (win) => {
  if (!win) return;
  win.on('enter-full-screen', () => _zoomPartout(win, true));
  win.on('leave-full-screen', () => _zoomPartout(win, false));
};
/* Une vue ancrée POSÉE ALORS QUE la fenêtre est DÉJÀ en plein écran n'a reçu
   aucun événement : elle naîtrait à la taille normale au milieu d'un écran
   agrandi. On lui donne l'état courant à son premier chargement. */
const _zoomRattraper = (wc) => {
  try { if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isFullScreen()) _zoomFenetre(wc, true); }
  catch (e) {}
};

const fenetresNatives = new Map();
const ouvrirNative = (cle, titre, html, opts = {}) => {
  const deja = fenetresNatives.get(cle);
  if (deja && !deja.isDestroyed()) { if (deja.isMinimized()) deja.restore(); deja.focus(); return deja; }
  const b = (reglages.get('fenetres') || {})[cle] || {};
  const win = new BrowserWindow({
    width: b.width || opts.width || 760, height: b.height || opts.height || 640,
    ...(Number.isFinite(b.x) && Number.isFinite(b.y) ? { x: b.x, y: b.y } : {}),
    minWidth: opts.minWidth || 520, minHeight: opts.minHeight || 420, show: false,
    title: titre, autoHideMenuBar: true, backgroundColor: _modele.sombre ? '#0e1522' : '#f4f2ec',
    webPreferences: {
      preload: path.join(__dirname, 'pont-preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true,
    },
  });
  fenetresNatives.set(cle, win);
  _suivrePleinEcran(win);
  // Le titre reste celui qu'on a demandé, pas celui que la page annonce.
  win.on('page-title-updated', (ev) => { ev.preventDefault(); });
  win.setTitle(titre);
  // Place retenue PAR CLÉ : un second écran reste un second écran.
  // ⚠ MAIS JAMAIS LES BORNES DU PLEIN ÉCRAN. Passer en plein écran émet
  // « resized », et `getBounds()` rend alors la taille de l'ÉCRAN : on aurait
  // retenu 2560×1440 comme taille normale de la fenêtre, et la fois suivante elle
  // se serait ouverte en couvrant tout, sans être en plein écran — impossible à
  // rattraper autrement qu'en la redimensionnant à la main. C'est le même genre de
  // piège qui a fait abandonner la position mémorisée dans l'éditeur du site.
  let minuterie = null;
  const retenir = () => {
    clearTimeout(minuterie);
    minuterie = setTimeout(() => {
      if (win.isDestroyed() || win.isFullScreen()) return;
      const tout = reglages.get('fenetres') || {};
      tout[cle] = win.getBounds();
      reglages.set('fenetres', tout);
    }, 400);
  };
  win.on('moved', retenir);
  win.on('resized', retenir);
  win.on('closed', () => { fenetresNatives.delete(cle); });
  brancherOutils(win);
  win.webContents.on('did-finish-load', () => appliquerTheme(win.webContents));
  win.once('ready-to-show', () => win.show());
  win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  return win;
};

// ── Fenêtre « Imprimantes », entièrement native ──────────────────────────────
let imprimantesWin = null;
const ouvrirImprimantes = () => {
  if (imprimantesWin && !imprimantesWin.isDestroyed()) { imprimantesWin.focus(); return; }
  const b = (reglages.get('fenetres') || {})['imprimantes'] || {};
  imprimantesWin = new BrowserWindow({
    width: b.width || 720, height: b.height || 600,
    ...(Number.isFinite(b.x) && Number.isFinite(b.y) ? { x: b.x, y: b.y } : {}),
    minWidth: 520, minHeight: 420, show: false,
    title: 'Imprimantes', autoHideMenuBar: true, backgroundColor: '#0e1522',
    webPreferences: {
      preload: path.join(__dirname, 'pont-preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
    },
  });
  // La place est retenue par type de fenêtre, comme les fenêtres de travail :
  // un second écran reste un second écran d'une fois à l'autre.
  let minuterie = null;
  const retenir = () => {
    clearTimeout(minuterie);
    minuterie = setTimeout(() => {
      // Même garde que les fenêtres natives : les bornes du plein écran ne sont
      // pas la taille de la fenêtre (voir ouvrirNative).
      if (!imprimantesWin || imprimantesWin.isDestroyed() || imprimantesWin.isFullScreen()) return;
      const tout = reglages.get('fenetres') || {};
      tout['imprimantes'] = imprimantesWin.getBounds();
      reglages.set('fenetres', tout);
    }, 400);
  };
  imprimantesWin.on('moved', retenir);
  imprimantesWin.on('resized', retenir);
  imprimantesWin.on('closed', () => { imprimantesWin = null; });
  brancherOutils(imprimantesWin);
  imprimantesWin.once('ready-to-show', () => { if (imprimantesWin) imprimantesWin.show(); });
  imprimantesWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(pageImprimantes()));
};

/* ⚠ LA BANDE DES BOUTONS SUIT AUSSI LA PORTE (signalé le 2026-08-14, capture à
   l'appui). `appbar.js` pilote la couleur des boutons réduire/agrandir/fermer —
   mais il vit dans le SITE, et la porte de mise à jour n'est pas le site : c'est
   une page servie par la coquille. Elle gardait donc la couleur de création de
   la fenêtre (bleu nuit) au-dessus de son panneau crème, et les trois boutons
   flottaient sur une bande sombre au coin d'un écran clair.
   Les boutons sont posés sur le panneau de DROITE (#faf8f5) : c'est cette
   couleur-là qu'il faut, avec des symboles foncés pour rester lisibles. */
const PORTE_BANDE = { color: '#faf8f5', symbolColor: '#1d2433' };
const _bandePorte = (dessus) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (typeof mainWindow.setTitleBarOverlay !== 'function') return;
  try {
    mainWindow.setTitleBarOverlay(dessus
      ? PORTE_BANDE
      // ⚠ On REMET le défaut sombre en quittant la porte : le site reprendra la
      // main dès son premier rendu (chrome:titlebar), mais entre les deux il ne
      // faut pas laisser une bande claire sur l'écran de connexion.
      : { color: '#0e1522', symbolColor: '#e8edf5' });
  } catch (_) {}
};

const montrerPorte = (titre, message, progression) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  _bandePorte(true);
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
  // ⚠ LE LAISSEZ-PASSER, SANS QUOI LA PROTECTION SE MORD LA QUEUE. Le garde de
  // fermeture bloque tout départ pendant une mise à jour ; or installer EXIGE de
  // quitter. Sans cette ligne, la mise à jour se téléchargerait indéfiniment sans
  // jamais pouvoir s'installer.
  _quitAutorise = true;
  majBoutonsFermeture();
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
    // Rien à télécharger : aucune raison de retenir quoi que ce soit.
    autoUpdater.on('update-not-available', () => { _majDispo = false; _majCritique = false; majBoutonsFermeture(); });

    // Une barre qui avance est la différence entre « ça travaille » et « c'est
    // planté ». Un téléchargement de 80 Mo sur une ligne lente prend des minutes.
    autoUpdater.on('download-progress', (p) => {
      // ⚠ C'EST ICI QUE LA ZONE CRITIQUE COMMENCE, pas à la vérification : des
      // octets sont en train d'arriver, et l'interruption a désormais un coût.
      // Posé AVANT le test de la porte : un téléchargement en tâche de fond (hors
      // écran d'attente) doit être protégé tout autant — c'est même le cas où l'on
      // risque le plus de fermer sans savoir ce qui se passe.
      _majCritique = true;
      majBoutonsFermeture();
      _majDernierOctet = Date.now();
      if (!_porteActive) return;
      const pct = Math.round(p && p.percent ? p.percent : 0);
      const mo = (n) => (n / 1048576).toFixed(0);
      montrerPorte('Téléchargement en cours',
        'Nouvelle version : ' + pct + ' %'
        + (p && p.total ? '<br><span style="opacity:.7">' + mo(p.transferred) + ' Mo sur ' + mo(p.total) + '</span>' : '')
        + '<br><span style="opacity:.7">L’application redémarrera à la fin.</span>',
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
        montrerPorte('Installation',
          'La version ' + version + ' est prête.<br>'
          + '<span style="opacity:.7">L’application redémarre, puis reprend où vous en étiez.</span>',
          100);
        _porteActive = false;
        // On reste en zone critique : le redémarrage part dans 1,6 s et il ne doit
        // pas être devancé par un Alt+F4 pendant qu'on lit le message.
        setTimeout(() => installerEtRelancer(autoUpdater), 1600);
        return;
      }

      // ⚠ ICI LA ZONE CRITIQUE S'ARRÊTE, ET C'EST ESSENTIEL. Le paquet est
      // COMPLET sur le disque ; si l'usager répond « Plus tard »,
      // `autoInstallOnAppQuit` fait que FERMER L'APPLICATION est précisément ce
      // qui installe la mise à jour. Laisser le garde en place empêcherait donc
      // pour toujours l'installation qu'il est censé protéger — la protection
      // deviendrait le blocage.
      _majCritique = false;
      majBoutonsFermeture();

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
      // ⚠ ON LIBÈRE LE VERROU SUR ÉCHEC. Un téléchargement qui casse à 60 % laisse
      // un poste qu'on ne peut plus fermer si l'on oublie cette ligne — la panne
      // de mise à jour deviendrait un poste condamné, exactement ce que le reste
      // de cette fonction s'emploie à éviter.
      _majCritique = false;
      majBoutonsFermeture();
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
  montrerPorte('Vérification des mises à jour', 'Quelques secondes, le temps d’interroger le serveur.');

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
      'Le serveur de mise à jour n’a pas répondu.<br>'
      + '<span style="opacity:.7">Ouverture de l’administration dans un instant.</span>');
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
    montrerPorte('Nouvelle version disponible',
      '<span style="opacity:.7;white-space:nowrap">L’application redémarrera dès qu’elle sera prête.</span>');
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

const { pageDetachee, pagePanneau } = require('./menubar');
const { pageImprimantes } = require('./fenetres/imprimantes');
const { pageFournisseur } = require('./fenetres/fournisseur');
const { pageCollection } = require('./fenetres/collection');
const { pageProduit } = require('./fenetres/produit');
const { pageFacture } = require('./fenetres/facture');
const { pageFactures } = require('./fenetres/factures');
const { pageProduits } = require('./fenetres/produits');
const { pageClients } = require('./fenetres/clients');
const { pageCodesbarres } = require('./fenetres/codesbarres');
const { pageRamassages } = require('./fenetres/ramassages');
const { pageAvis } = require('./fenetres/avis');
const { pageMessagerie } = require('./fenetres/messagerie');
const { pageNotes } = require('./fenetres/notes');
const { pageArchives } = require('./fenetres/archives');
const { pagePaiements } = require('./fenetres/paiements');
const { pageEtatCompte } = require('./fenetres/etatcompte');
const { pageCartesCadeaux } = require('./fenetres/cartescadeaux');
const { pageCoupons } = require('./fenetres/coupons');
const { pagePromotions } = require('./fenetres/promotions');
const { pageChat } = require('./fenetres/chat');
const { pageSociaux } = require('./fenetres/sociaux');
const { pageFidelisation } = require('./fenetres/fidelisation');
const { pageLiquidation } = require('./fenetres/liquidation');
const { pageCatalogio } = require('./fenetres/catalogio');
const { pageInvMeta } = require('./fenetres/invmeta');
const { pageNewsletter } = require('./fenetres/newsletter');
const { pagePublicite } = require('./fenetres/publicite');
const { pageRecommandations } = require('./fenetres/recommandations');
const { pageRecherches } = require('./fenetres/recherches');
const { pageAbonnes } = require('./fenetres/abonnes');
const { pageJournal } = require('./fenetres/journal');
const { pageCampagnes } = require('./fenetres/campagnes');
const { pageStatistiques } = require('./fenetres/statistiques');
const { pagePhotos } = require('./fenetres/photos');
const { pagePromo } = require('./fenetres/promo');
const { pageDepenses } = require('./fenetres/depenses');
const { pageRemboursements } = require('./fenetres/remboursements');
const { pageImpot } = require('./fenetres/impot');
const { pageLiens } = require('./fenetres/liens');
const { pageComptable } = require('./fenetres/comptable');
const { pageInactivite } = require('./fenetres/inactivite');
const { pageBanque } = require('./fenetres/banque');
const { pageFal } = require('./fenetres/fal');
const { pageHeures } = require('./fenetres/heures');
const { pageFooter } = require('./fenetres/footer');
const { pageApparence } = require('./fenetres/apparence');
const { pageMarque } = require('./fenetres/marque');
const { pageIcones } = require('./fenetres/icones');
const { pageTaxes } = require('./fenetres/taxes');
const { pagePaiementsConfig } = require('./fenetres/paiements-config');
const { pageClesConfig } = require('./fenetres/cles');
const { pageStudio } = require('./fenetres/studio');
const { pageLivraison } = require('./fenetres/livraison');
const { pageConfigRetours } = require('./fenetres/config-retours');
const { pageConfigNavigation } = require('./fenetres/config-navigation');
const { pageTransporteurs } = require('./fenetres/transporteurs');
const { pageAutomations } = require('./fenetres/automations');
const { pageTelephonie } = require('./fenetres/telephonie');
const { pageModeles } = require('./fenetres/modeles');
const { pageGabarits } = require('./fenetres/gabarits');
const { pageLogotheque } = require('./fenetres/logotheque');
const { pageAnalytics } = require('./fenetres/analytics');
const { pageBd } = require('./fenetres/bd');
const { pageAccueil } = require('./fenetres/accueil');
const { pageLancement } = require('./fenetres/lancement');
const { pagePages } = require('./fenetres/pages');
const { pageSecurite } = require('./fenetres/securite');
const { pageReglagesSecurite } = require('./fenetres/reglages-securite');
const { pageSociauxConfig } = require('./fenetres/sociaux-config');
const { pageChatConfig } = require('./fenetres/chat-config');
const { pageListeNoire } = require('./fenetres/listenoire');
const { pageProfil } = require('./fenetres/profil');
const { pageJournaux } = require('./fenetres/journaux');
const { pageIncidents } = require('./fenetres/incidents');
const { pageSauvegarde } = require('./fenetres/sauvegarde');
const { pageCollections } = require('./fenetres/collections');
const { pageFournisseurs } = require('./fenetres/fournisseurs');
const { pageRetours } = require('./fenetres/retours');
const { pageCommande } = require('./fenetres/commande');
const { pageAffichage } = require('./fenetres/affichage');
const { pageCaisse } = require('./fenetres/caisse');
const { pageInventaire } = require('./fenetres/inventaire');
const { pageExpedition } = require('./fenetres/expedition');
const { pageTableau } = require('./fenetres/tableau');
const { pageCommandes } = require('./fenetres/commandes');
const { pageRetour } = require('./fenetres/retour');
const { pageRemboursement } = require('./fenetres/remboursement');
const { pageClient } = require('./fenetres/client');
const reglages = require('./reglages');

// Dernier modèle reçu du site. Vide tant que la page n'a rien envoyé (site pas
// encore chargé, ou version du site antérieure à appbar.js).
let _modele = { menus: [], taille: 1.15, mode: 'haut', sombre: !!reglages.get('sombre') };

// ── ACTIONS DE L'APPLICATION ─────────────────────────────────────────────────
const actionApp = (nom) => {
  const wc = mainWindow && !mainWindow.isDestroyed() ? mainWindow.webContents : null;
  switch (nom) {
    // Le bouton de la barre dessinée et l'entrée « Quitter » du menu passent tous
    // deux par ici : un seul garde couvre les deux.
    case 'quit':        if (fermetureBloquee()) { refuserFermeture(); break; } app.quit(); break;
    case 'minimize':    if (mainWindow) mainWindow.minimize(); break;
    case 'reload':      if (wc) wc.reload(); break;
    case 'reload-hard': if (wc) wc.reloadIgnoringCache(); break;
    case 'devtools':    if (wc) wc.toggleDevTools(); break;
    case 'fullscreen':  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen()); break;
    case 'zoom-in':     if (wc) { wc.setZoomLevel(wc.getZoomLevel() + 0.5); setTimeout(reposerAncrees, 60); } break;
    case 'zoom-out':    if (wc) { wc.setZoomLevel(wc.getZoomLevel() - 0.5); setTimeout(reposerAncrees, 60); } break;
    case 'zoom-reset':  if (wc) { wc.setZoomLevel(0); setTimeout(reposerAncrees, 60); } break;
    case 'exports':     shell.openPath(EXPORT_DIR()); break;
    case 'update-check': checkForUpdates(true); break;
    case 'about':       ouvrirApropos(); break;
    case 'imprimantes': ouvrirImprimantes(); break;
    /* ⚠ Les quatre onglets de Configuration natifs ne s'ouvrent PLUS ici :
       ils sont passés au flux d'ancrage (voir la liste des ecrans ancrables
       plus bas), a la demande du 2026-08-10 — « fais attention de creer les
       fenetres en mode ancrable ». */
    case 'fournisseur-nouveau':
      ouvrirNative('fournisseur', 'Nouveau fournisseur', pageFournisseur(''), { width: 820, height: 620, minHeight: 460 });
      break;
    case 'collection-nouvelle':
      ouvrirNative('collection', 'Nouvelle collection', pageCollection(''), { width: 860, height: 640, minHeight: 480 });
      break;
    case 'produit-nouveau':
      ouvrirNative('produit', 'Nouveau produit', pageProduit(''), { width: 980, height: 860, minHeight: 520 });
      break;
    // ⚠ L AFFICHAGE CLIENT EST FAIT POUR ÊTRE POSÉ SUR UN SECOND ÉCRAN, face à la
    // cliente. D'où une fenêtre plus grande et une hauteur minimale généreuse : le
    // total doit rester lisible à un mètre, et c'est le bloc du bas qu'on lit.
    /* ⚠ LA CAISSE EST LA PLUS GRANDE DES FENETRES, et c est justifie : deux
       colonnes, une liste d articles qui grandit, et un ecran qui ne doit JAMAIS
       defiler pour atteindre son bouton d encaissement. 1180 px de large est le
       minimum ou les deux colonnes tiennent sans se serrer ; sous 1000 px la
       fenetre repasse d elle-meme en une colonne (voir sa feuille de style).
       ⚠ ELLE S OUVRE A COTE DE L ECRAN DU SITE, jamais a sa place : les deux
       coexistent le temps qu elle soit eprouvee en boutique. */
    // #37 : 'caisse' est désormais ANCRABLE — traité par le bloc d'ancrage
    // plus bas (dock:naviguer vers la section 'pos'), plus de fenêtre autonome.
    case 'affichage-client':
      ouvrirNative('pos-client', 'Affichage client', pageAffichage(),
        { width: 1000, height: 720, minWidth: 620, minHeight: 480 });
      break;
    /* ⚠ TOUS LES ECRANS ANCRABLES DU MENU PASSENT PAR LE FLUX D ANCRAGE
       (demande du 2026-08-09 : << si je passe par le menu, ca doit etre ancre,
       sauf si je l ai detache — l etat persiste par profil >>). On ne pose plus
       de fenetre separee ici : le site navigue vers la section hote
       (dock:naviguer) et rouvre ancre OU detache selon l etat de la PERSONNE,
       sans le changer. Deja detachee : on ramene sa fenetre. Une fenetre
       separee HERITEE d un ancien menu est ramenee plutot que doublee. */
    case 'expeditions': case 'caisse': case 'ramassages':   // #37 : désormais ancrables
    case 'tableau': case 'inventaire': case 'commandes': case 'produits':
    case 'factures': case 'clients': case 'collections': case 'fournisseurs':
    case 'retours': case 'codesbarres': case 'avis': case 'messagerie':
    case 'archives': case 'paiements': case 'cartescadeaux': case 'coupons':
    case 'promotions': case 'chat': case 'sociaux': case 'fidelisation':
    case 'liquidation':
    case 'catalogio':
    case 'invmeta':
    case 'newsletter':
    case 'publicite':
    case 'recommandations': case 'recherches': case 'abonnes': case 'journal':
    case 'campagnes': case 'statistiques': case 'photos': case 'promo':
    case 'depenses': case 'remboursements': case 'impot': case 'liens':
    case 'comptable': case 'bankrec': case 'fal-suivi':
    case 'config-heures': case 'config-footer': case 'config-apparence':
    case 'config-marque': case 'config-icones': case 'config-taxes':
    case 'config-paiements': case 'config-cles': case 'studio':
    case 'config-livraison': case 'config-retours': case 'config-navigation': case 'config-carriers': case 'config-automations': case 'config-telephonie': case 'config-models': case 'config-gabarits': case 'config-logotheque': case 'config-analytics': case 'config-turso': case 'config-homepage': case 'config-launch': case 'pages': case 'securite': case 'reglages-securite': case 'sociaux-config': case 'chat-config': case 'listenoire': case 'profil': case 'journaux': case 'incidents': case 'sauvegarde': {
      /* ⚠ Le parametre s appelle NOM — << action >> a plante en production
         (ReferenceError au premier clic de menu, 2026-08-09). */
      const _aA = ancrees.get(nom);
      if (_aA && _aA.fenetre && !_aA.fenetre.isDestroyed()) { _aA.fenetre.show(); _aA.fenetre.focus(); break; }
      const _avA = fenetresNatives.get(nom);
      if (_avA && !_avA.isDestroyed()) { _avA.show(); _avA.focus(); break; }
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show(); mainWindow.focus();
        try { mainWindow.webContents.send('dock:naviguer', nom); } catch {}
        break;
      }
      break;
    }
    case 'notes': {
      const _avN = fenetresNatives.get('notes');
      const _reuN = !!(_avN && !_avN.isDestroyed());
      const winN = ouvrirNative('notes', 'Notes des mises à jour', pageNotes(),
        { width: 760, height: 680, minWidth: 560, minHeight: 460 });
      if (_reuN && winN && !winN.isDestroyed()) {
        winN.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
      }
      break;
    }
    // #37 : 'ramassages' et 'expeditions' sont désormais ANCRABLES — traités par
    // le bloc d'ancrage plus haut (dock:naviguer vers 'ramassages' / 'shipping').
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

// ── LIEN DE RETOUR VERS LES JOURNAUX (#7 7b-2c) ──────────────────────────────
// Une fenêtre (Recherches, Téléphonie, Liens) demande d'ouvrir le module Journaux
// sur un onglet. Ouverture FRAÎCHE : la carte lit `_journauxOnglet`. DÉJÀ ouverte
// (dock ou détachée) : on lui envoie `szAllerOnglet`. Onglet réduit aux lettres —
// aucune donnée n'entre dans le code exécuté.
const _ONGLETS_JOURNAUX = ['recherche', 'acces', 'automatisations', 'impressions', 'sms', 'comptable', 'recherches', 'verrous'];
ipcMain.handle('journaux:ouvrir', (e, onglet) => {
  const t = _ONGLETS_JOURNAUX.indexOf(String(onglet || '').toLowerCase()) >= 0 ? String(onglet).toLowerCase() : '';
  _journauxOnglet = t;
  actionApp('journaux');
  setTimeout(() => {
    try {
      const a = ancrees.get('journaux');
      const wc = a ? (a.fenetre && !a.fenetre.isDestroyed() ? a.fenetre.webContents : (a.view && a.view.webContents)) : null;
      if (wc && t) wc.executeJavaScript("window.szAllerOnglet && window.szAllerOnglet('" + t + "')", true).catch(() => {});
    } catch (_) {}
    _journauxOnglet = '';   // ne pas laisser fuiter vers une prochaine ouverture par le menu
  }, 400);
  return true;
});

// ══ FENÊTRES DE TRAVAIL ═══════════════════════════════════════════════════════
// « Nouveau produit », « Nouvelle collection », « Nouveau fournisseur » ouvrent
// une VRAIE fenêtre du système, déplaçable sur un second écran, et non plus un
// écran de plus dans la fenêtre principale.
//
// ⚠ MÊME SESSION, PAS UNE SECONDE CONNEXION. La fenêtre utilise la session
// Electron par défaut, donc le même témoin `elg_adm` : le serveur y voit la
// session déjà ouverte. C'est indispensable — la politique « une seule session
// par compte » révoquerait la première si celle-ci ouvrait la sienne.
// Et `armAppHeader()` posant l'en-tête sur cette même session, la nouvelle
// fenêtre passe le verrou d'application sans rien de plus.
//
// ⚠ SANS `parent:` — c'est ce qui la rend libre d'aller sur un autre écran.
// Avec un parent, Windows la garde au-dessus de la fenêtre principale et la
// ramène avec elle.
//
// ⚠ LE MARQUEUR `?szwin=1` : la barre de menu (appbar.js) s'y reconnaît et NE
// SE DESSINE PAS. Une fenêtre d'édition n'a pas besoin d'une seconde barre de
// navigation ; et deux barres pilotant la même application se contrediraient.
//
// ⚠ LES VERROUS D'ENREGISTREMENT RESTENT CEUX DU SITE. Ouvrir la même fiche
// ici et dans la fenêtre principale déclenchera le conflit prévu (409) — ce
// n'est pas un défaut, c'est le garde-fou qui fait son travail.
const fenetresTravail = new Map();

ipcMain.handle('fenetre:ouvrir', (e, opts = {}) => {
  const cle = String(opts.cle || 'travail');
  const titre = String(opts.titre || 'Administration Sandriza');
  const run = String(opts.run || '');

  // Déjà ouverte : on la ramène plutôt que d'en empiler une deuxième.
  const dejaLa = fenetresTravail.get(cle);
  if (dejaLa && !dejaLa.isDestroyed()) {
    if (dejaLa.isMinimized()) dejaLa.restore();
    dejaLa.focus();
    return true;
  }

  const bornes = (reglages.get('fenetres') || {})[cle] || {};
  const win = new BrowserWindow({
    width: bornes.width || 1180,
    height: bornes.height || 860,
    ...(Number.isFinite(bornes.x) && Number.isFinite(bornes.y) ? { x: bornes.x, y: bornes.y } : {}),
    minWidth: 900,
    minHeight: 600,
    title: titre,
    backgroundColor: '#111827',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  });
  fenetresTravail.set(cle, win);

  // Le titre suit celui qu'on a demandé, pas celui de la page.
  win.on('page-title-updated', (ev) => { ev.preventDefault(); });
  win.setTitle(titre);
  win.once('ready-to-show', () => win.show());

  // Position et taille retenues PAR TYPE de fenêtre : l'éditeur de produit
  // reprend sa place, même sur un second écran.
  let minuterie = null;
  const retenir = () => {
    clearTimeout(minuterie);
    minuterie = setTimeout(() => {
      // Même garde que les fenêtres natives (voir ouvrirNative) : en plein écran,
      // `getBounds()` rend la taille de l'écran, pas celle de la fenêtre.
      if (win.isDestroyed() || win.isFullScreen()) return;
      const tout = reglages.get('fenetres') || {};
      tout[cle] = win.getBounds();
      reglages.set('fenetres', tout);
    }, 400);
  };
  win.on('moved', retenir);
  win.on('resized', retenir);
  win.on('closed', () => { fenetresTravail.delete(cle); });

  // Mêmes règles de navigation que la fenêtre principale : rien d'externe
  // n'entre dans l'application.
  win.webContents.setWindowOpenHandler(({ url }) => {
    // La page vierge sert aux documents a imprimer : on la laisse s ouvrir.
    if (estPageVierge(url)) return { action: 'allow' };
    if (!isAllowed(url)) { versLExterieur(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });
  win.webContents.on('will-navigate', (ev, url) => {
    if (estPageVierge(url)) return;
    if (!isAllowed(url)) { ev.preventDefault(); versLExterieur(url); }
  });

  // ⚠ `once` et non `on` : sans ça, chaque rechargement de la page rouvrirait
  // le formulaire par-dessus le travail en cours.
  if (run) {
    win.webContents.once('did-finish-load', () => {
      // Un court délai laisse l'administration finir son premier rendu ; sans
      // lui, `Admin` peut ne pas encore exister au moment de l'appel.
      setTimeout(() => {
        win.webContents.executeJavaScript(
          '(function(){try{' + run + '}catch(e){' +
          "if(typeof Toast!=='undefined')Toast.show('Ouverture impossible','error');}})()", true
        ).catch(() => {});
      }, 600);
    });
  }

  // ⚠ `url` est un SUFFIXE, jamais une adresse complète : une fenêtre de cette
  // application ne doit pouvoir pointer que vers le portail. Accepter une URL
  // entière ferait de cette porte un moyen d'ouvrir n'importe quoi dans une
  // fenêtre qui porte, elle, l'en-tête d'application.
  const suffixe = /^\?[\w=&%#.-]*$/.test(String(opts.url || '')) ? String(opts.url) : '?szwin=1#admin';
  win.loadURL(APP_URL + suffixe);
  return true;
});
ipcMain.handle('menu:reglages', () => reglages.lire());
ipcMain.handle('menu:set', (e, cle, valeur) => {
  if (cle === 'menuMode' || cle === 'menuTaille') { poserReglage(cle, valeur); }
  return reglages.lire();
});
// Le site pousse son modèle : on en tire les raccourcis et la fenêtre détachée.
/* LE PANNEAU FLOTTANT DU MENU (1.56.1). Quand un ecran est ANCRE, un panneau
   dessine dans la page passe DESSOUS la vue native. Le menu du SYSTEME
   (1.55.1) reglait la superposition mais imposait le theme de Windows et ne
   s ouvrait qu au clic (releve du 2026-08-09 : << je perds mon theme et je
   dois cliquer >>). Ici : une petite fenetre SANS CADRE de l application —
   le THEME DU SITE (cssRail), l ouverture au survol (montree SANS voler le
   focus, pour que le survol de la barre continue de fonctionner), au-dessus
   de tout puisque c est une fenetre. Clics par palette:action, comme la
   palette. Le survol tient le panneau ouvert ; le quitter (barre ET panneau)
   le referme en differe court. */
let panneauWin = null;
let panneauSurvole = false;
let panneauFermeT = null;
let panneauPret = false;    // la page (TOUS les menus) est chargee
let panneauSale = true;     // le modele a change depuis le dernier chargement
const fermerPanneauMenu = () => {
  clearTimeout(panneauFermeT); panneauFermeT = null; panneauSurvole = false;
  if (panneauWin && !panneauWin.isDestroyed()) { try { panneauWin.hide(); } catch {} }
};
const fermerPanneauBientot = () => {
  clearTimeout(panneauFermeT);
  panneauFermeT = setTimeout(() => { if (!panneauSurvole) fermerPanneauMenu(); }, 320);
};
/* ⚠ OU POSER LE PANNEAU. Il s ouvrait TOUJOURS sous le bouton — juste pour la
   barre du haut, faux partout ailleurs : en rail vertical il RECOUVRAIT le
   rail, et la poignee d ancrage, tout en bas, ouvrait son panneau HORS DE
   L ECRAN — on ne pouvait donc plus remettre le menu en haut (2026-08-09).
   La pose est retenue ici et appliquee quand la page a MESURE son contenu :
   avant, on ignore la largeur, donc on ne peut pas aligner un bord droit. */
let panneauPose = { mode: 'bas', x: 0, y: 0 };

ipcMain.on('menu:panneau', (e, label, x, y, ancrage) => {
  if (!mainWindow || e.sender !== mainWindow.webContents) return;
  const m = (_modele.menus || []).find((mm) => mm && mm.label === String(label || ''));
  if (!m || !(m.items || []).length) return;
  clearTimeout(panneauFermeT); panneauFermeT = null; panneauSurvole = false;
  if (!panneauWin || panneauWin.isDestroyed()) {
    /* ⚠ TRANSPARENTE : chaque panneau (colonne et sous-menu) peint SON fond
       dans la page — la fenetre elle-meme n en a pas, sinon le fond
       << se poursuit >> derriere le sous-menu plus court que la colonne
       (releve du 2026-08-09). L ombre aussi vient de la page (hasShadow
       suivrait le rectangle de la fenetre, pas les boites). */
    panneauWin = new BrowserWindow({
      parent: mainWindow, frame: false, show: false, resizable: false, movable: false,
      skipTaskbar: true, hasShadow: false, minimizable: false, maximizable: false,
      transparent: true,
      width: 300, height: 200,
      webPreferences: {
        preload: path.join(__dirname, 'palette-preload.js'),
        contextIsolation: true, nodeIntegration: false, sandbox: true,
      },
    });
    panneauWin.on('closed', () => { panneauWin = null; panneauPret = false; panneauSale = true; });
    panneauSale = true;
  }
  const f = mainWindow.webContents.getZoomFactor() || 1;
  const cb = mainWindow.getContentBounds();
  const _mode = ['bas', 'droite', 'gauche'].indexOf(String(ancrage || 'bas')) >= 0
    ? String(ancrage || 'bas') : 'bas';
  panneauPose = {
    mode: _mode,
    x: Math.round(cb.x + (Number(x) || 0) * f),
    y: Math.round(cb.y + (Number(y) || 0) * f),
  };
  try {
    const _b = panneauWin.getBounds();
    panneauWin.setBounds({
      x: _mode === 'gauche' ? panneauPose.x - _b.width : panneauPose.x,
      y: panneauPose.y, width: _b.width, height: _b.height,
    });
  } catch {}
  // MEME TAILLE APPARENTE QUE LA BARRE : le panneau suit le zoom de la
  // fenetre principale (la feuille du site porte deja l echelle du menu —
  // aucun zoom ajoute dans la page, voir pagePanneau).
  const montrer = () => {
    try { panneauWin.webContents.setZoomFactor(f); } catch {}
    panneauWin.webContents.executeJavaScript(
      'window.montrer && window.montrer(' + JSON.stringify(String(label || '')) + ');', true).catch(() => {});
    try { panneauWin.showInactive(); } catch {}
  };
  /* ⚠ LA PAGE (tous les menus) N EST CHARGEE QU UNE FOIS — la recharger a
     chaque survol etait le << lag >> releve le 2026-08-09. `montrer` ne fait
     ensuite que basculer l affichage. Rechargee seulement si le modele a
     change (menu:modele pose panneauSale). */
  if (panneauSale || !panneauPret) {
    panneauSale = false; panneauPret = false;
    panneauWin.webContents.once('did-finish-load', () => { panneauPret = true; montrer(); });
    panneauWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(pagePanneau({
      menus: _modele.menus || [], cssRail: _modele.cssRail || '', sombre: !!_modele.sombre,
    })));
  } else {
    montrer();
  }
});
// Le site annonce que la souris a quitte la barre (ou qu on a clique ailleurs).
ipcMain.on('menu:panneau:fermer', (e) => {
  if (!mainWindow || e.sender !== mainWindow.webContents) return;
  fermerPanneauBientot();
});
// Le panneau annonce sa taille reelle : la fenetre s ajuste, position gardee
// (bornee a l ecran — un panneau coupe par le bord ne se lit pas).
ipcMain.on('panneau:taille', (e, w, h) => {
  if (!panneauWin || panneauWin.isDestroyed() || e.sender !== panneauWin.webContents) return;
  try {
    // La page mesure en px CSS ; la fenetre, elle, vit en px physiques — le
    // facteur de zoom pose sur le panneau s applique donc ici aussi.
    const f = (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents.getZoomFactor()) || 1;
    const b = panneauWin.getBounds();
    const { screen } = require('electron');
    const wa = screen.getDisplayMatching(b).workArea;
    /* ⚠ BORNE = L ESPACE D ECRAN, jamais un chiffre en dur : le plafond de
       520 px tranchait le sous-menu ouvert (bord droit sans coins ronds,
       releve du 2026-08-09). Au pire, la fenetre glisse vers la gauche pour
       que tout tienne. */
    const W = Math.min(Math.max(170, Math.round((w || 260) * f)), wa.width - 16);
    /* ⚠ LE PANNEAU SE DEPLACE, IL NE SE COUPE PAS. La hauteur etait bornee a
       « ce qui tient SOUS le point d ouverture » : un menu ouvert en bas d un
       rail se reduisait donc a quelques pixels, ou sortait de l ecran. On lui
       laisse sa taille et on le remonte pour qu il tienne en entier. */
    const H = Math.min(Math.max(40, Math.round((h || 120) * f)), wa.height - 8);
    const xVoulu = panneauPose.mode === 'gauche' ? panneauPose.x - W : panneauPose.x;
    const X = Math.max(wa.x + 4, Math.min(xVoulu, wa.x + wa.width - W - 4));
    const Y = Math.max(wa.y + 4, Math.min(panneauPose.y, wa.y + wa.height - H - 4));
    panneauWin.setBounds({ x: X, y: Y, width: W, height: H });
  } catch {}
});
ipcMain.on('panneau:survol', (e, dedans) => {
  if (!panneauWin || panneauWin.isDestroyed() || e.sender !== panneauWin.webContents) return;
  panneauSurvole = !!dedans;
  if (dedans) { clearTimeout(panneauFermeT); panneauFermeT = null; }
  else fermerPanneauBientot();
});

/* LE THEME A L INSTANT (1.58.3) : la bascule jour/nuit du site arrivait par
   le battement du modele du menu — le menu se repeignait tout de suite, les
   fenetres natives 3 secondes plus tard (releve du 2026-08-09). Le site
   pousse maintenant le theme DES la bascule ; il est aussi RETENU (reglages)
   pour que les fenetres du prochain demarrage naissent du bon cote. */
ipcMain.on('theme:changer', (e, sombre) => {
  if (!mainWindow || e.sender !== mainWindow.webContents) return;
  const v = !!sombre;
  if (v === !!_modele.sombre) return;
  _modele.sombre = v;
  try { reglages.set('sombre', v); } catch {}
  panneauSale = true;
  appliquerThemePartout();
});

// ── BANDE DES BOUTONS DE FENÊTRE (réduire / agrandir / fermer) — correctif #24 ──
// Depuis la 2.59.0, Windows dessine ces trois boutons dans un `titleBarOverlay`
// dont on avait FIGÉ le fond en sombre (#0e1522). Juste en thème sombre, faux en
// clair et surtout sur l'écran de CONNEXION, dont la barre a un autre fond : la
// bande y jurait. C'est désormais la page (appbar.js) qui envoie la couleur RÉELLE
// du bord droit de sa barre — là où sont les boutons — et celle de son texte.
// ⚠ `setTitleBarOverlay` n'existe QUE sur une fenêtre créée avec `titleBarOverlay`
// (la principale, Windows) : ailleurs c'est absent, d'où le garde. On n'accepte
// qu'une couleur hexadécimale : une valeur inattendue jetterait sinon Electron.
const _hexOuRien = (v) => {
  const s = String(v || '').trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s) ? s : '';
};
ipcMain.on('chrome:titlebar', (e, color, symbol) => {
  try {
    if (!mainWindow || e.sender !== mainWindow.webContents) return;
    if (typeof mainWindow.setTitleBarOverlay !== 'function') return;
    mainWindow.setTitleBarOverlay({
      color: _hexOuRien(color) || '#0e1522',
      symbolColor: _hexOuRien(symbol) || '#e8edf5',
    });
  } catch (_) {}
});

ipcMain.handle('menu:modele', (e, m) => {
  if (m && typeof m === 'object' && Array.isArray(m.menus)) {
    const sombreAvant = !!_modele.sombre;
    _modele = m;
    panneauSale = true;   // le panneau flottant se reconstruira a sa prochaine ouverture
    buildMenu();
    if (reglages.get('menuMode') === 'fenetre') majPalette();
    // Le theme a bascule : toutes les fenetres et vues ancrees suivent.
    if (sombreAvant !== !!_modele.sombre) {
      try { reglages.set('sombre', !!_modele.sombre); } catch {}
      appliquerThemePartout();
    }
  }
  return true;
});

// Ajuste une fenêtre à la hauteur reelle de son contenu (voir pageApropos).
// ⚠ Bornée à l'écran : un contenu inattendu ne doit pas produire une fenêtre
// plus haute que le moniteur, qu'on ne pourrait plus ni lire ni fermer.
ipcMain.on('fenetre:hauteur', (e, h, garder) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (!win || win.isDestroyed() || !h) return;
  try {
    const { screen } = require('electron');
    const ecran = screen.getDisplayMatching(win.getBounds());
    const dispo = ecran.workAreaSize.height;
    const [larg] = win.getContentSize();
    win.setContentSize(larg, Math.min(Math.max(320, Math.round(h)), dispo - 60));
    // ⚠ `garder` : la fenetre reste OU ELLE EST (l assistant Produit se recale a
    // chaque etape — la recentrer arracherait la fenetre des mains de la
    // personne qui l a placee). On la ramene seulement si le bas sort de
    // l ecran. Sans `garder`, comportement historique : centree (palette,
    // reglages, qui s ouvrent pres du menu).
    if (!garder) { win.center(); return; }
    const b = win.getBounds();
    const wa = ecran.workArea;
    const x = Math.max(wa.x, Math.min(b.x, wa.x + wa.width - b.width));
    const y = Math.max(wa.y, Math.min(b.y, wa.y + wa.height - b.height));
    if (x !== b.x || y !== b.y) win.setPosition(x, y);
  } catch {}
});

ipcMain.on('palette:action', (e, it) => {
  if (!it || typeof it !== 'object') return;
  // Un clic dans le PANNEAU FLOTTANT du menu : il a fait son travail, il se
  // range — et la barre du site deballe son bouton (AppBar.fermer, expose
  // pour ca ; jamais un Echap simule, qui fermerait aussi une modale du site).
  if (panneauWin && !panneauWin.isDestroyed() && e.sender === panneauWin.webContents) {
    fermerPanneauMenu();
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.executeJavaScript(
          'window.AppBar && AppBar.fermer && AppBar.fermer();', true).catch(() => {});
      }
    } catch {}
  }
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

const _sansPseudo = (menus) => (menus || []).filter((m) => m && !String(m.label || '').startsWith('__'));

const buildMenu = () => {
  const template = _sansPseudo(_modele.menus)
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
    menus: _sansPseudo(_modele.menus),
    version: app.getVersion(),
    taille: cfg.menuTaille,
    sombre: !!_modele.sombre,
    // ⚠ La feuille de style vient DU SITE, avec le modèle. La coquille n'en
    // tient plus de copie : celle qu'elle avait a dérivé (emojis absents,
    // espacements différents), et deux menus censés être le même ne se
    // ressemblaient plus.
    cssRail: _modele.cssRail || '',
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

  /* ⚠ QUIRK WINDOWS (releve DEUX FOIS le 2026-08-09, fenetre A propos —
     qui n est PAS une fenetre ouvrirNative, d ou le premier correctif rate) :
     fermer une fenetre pendant qu un ENFANT INVISIBLE de la principale
     existe (le panneau du menu) peut REDUIRE la principale dans la barre des
     taches. Garde GLOBAL : a la fermeture de N IMPORTE QUELLE fenetre, si la
     principale vient d etre reduite, elle est relevee. Une seule place —
     patcher fenetre par fenetre, c est en oublier une. */
  app.on('browser-window-created', (ev, win) => {
    win.on('closed', () => {
      setTimeout(() => {
        try {
          if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isMinimized()) {
            mainWindow.restore(); mainWindow.focus();
          }
        } catch {}
      }, 80);
    });
  });

  app.whenReady().then(() => {
    /* ⚠⚠ L'IDENTITÉ DE L'APPLICATION, ET C'EST CE QUI ÉCRIVAIT
       « electron.app.Administration Sandriza » EN TÊTE DE CHAQUE NOTIFICATION.
       Sans AppUserModelID, Windows en fabrique un à partir du binaire — d'où ce
       préfixe « electron.app. » que tout le monde voit et que personne ne
       comprend. La valeur doit être EXACTEMENT l'appId de l'installateur
       (electron-builder.yml) : c'est par lui que Windows relie la notification
       au raccourci du menu Démarrer, donc au nom et à l'icône.
       ⚠ Et cela doit se faire AVANT la première notification, pas au moment de
       l'émettre : Windows retient l'identité de la première. */
    try { app.setAppUserModelId('com.sandriza.admin'); } catch {}

    // ⚠ AVANT createWindow() : le tout premier chargement de adm.sandriza.com doit
    // déjà porter l'en-tête, sinon le serveur nous prend pour un navigateur et
    // sert la page « Utilisez l'application » à notre propre fenêtre.
    armAppHeader();
    buildMenu();       // repli minimal ; le vrai menu arrive du site
    createWindow();
    startUsbWatch();

    /* PRECHAUFFAGE DU TABLEAU DE BORD (1.58.3) : la vue ancree n etait creee
       qu apres le chargement complet du site — on voyait le menu, puis
       l ecran arriver (releve du 2026-08-09 : << jamais instantane >>). La
       vue nait ICI, cachee, avec le DERNIER THEME RETENU : quand le site
       demande l ancrage, elle existe deja (szRevenir la fait relire) et se
       pose a l instant. */
    setTimeout(() => {
      try {
        if (ancrees.get('tableau')) return;
        const view = new WebContentsView({ webPreferences: {
          preload: path.join(__dirname, 'pont-preload.js'),
          contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true,
        } });
        ancrees.set('tableau', { view, fenetre: null });
        view.webContents.on('did-finish-load', () => {
          view.webContents.executeJavaScript('window.szModeAncre && window.szModeAncre(true);', true).catch(() => {});
          appliquerTheme(view.webContents);
          _zoomRattraper(view.webContents);
        });
        view.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(pageTableau()));
      } catch {}
    }, 250);

    // PORTE DE LANCEMENT : vérifie la version AVANT d'ouvrir l'administration.
    // C'est elle, et elle seule, qui charge APP_URL — voir verifierAuLancement().
    verifierAuLancement();

    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });

  app.on('before-quit', (ev) => {
    // Dernier rempart : `app.quit()` ne passe pas forcément par le `close` d'une
    // fenêtre (extinction de session, appel direct). Le laissez-passer
    // `_quitAutorise` est posé par la mise à jour juste avant de redémarrer.
    if (fermetureBloquee()) { ev.preventDefault(); refuserFermeture(); return; }
    if (_usbTimer) clearInterval(_usbTimer);
  });

  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
