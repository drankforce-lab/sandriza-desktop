'use strict';

/*
 * Pont sécurisé entre la page (le site en ligne) et la coquille de bureau.
 * Avec contextIsolation, la page n'a JAMAIS accès à Node ni à ipcRenderer nu :
 * elle ne voit que l'objet `sandrizaDesktop` ci-dessous.
 *
 * L'adaptateur (desktop-adapter.js) et, en Phase 2, printagent.js détectent la
 * présence de `window.sandrizaDesktop` pour router l'impression vers le poste
 * plutôt que vers l'agent 127.0.0.1.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sandrizaDesktop', {
  isDesktop: true,
  version: '1.0.0',

  // Menu intégré : le bouton cliqué dans la barre dessinée demande au processus
  // principal d'exécuter une action de l'APPLICATION (quitter, zoom, ancrage du
  // menu…). Les entrées de NAVIGATION, elles, ne passent pas par ici : elles
  // appellent `Admin` directement dans la page, donc les gardes de permission
  // et de lecture seule du site s'appliquent sans qu'on ait rien à recopier.
  menuAction: (nom) => ipcRenderer.invoke('menu:action', String(nom || '')),

  // ── LA BARRE EST DESSINÉE PAR LE SITE (assets/js/appbar.js) ────────────────
  // Ce drapeau est le POINT DE BASCULE : `appbar.js` reste inerte tant qu'il ne
  // le voit pas. C'est ce qui évite la période à DEUX barres — les postes encore
  // sur une version antérieure continuent d'afficher celle que leur coquille
  // dessine, et basculent sur celle du site en se mettant à jour.
  menuBarreSite: true,
  // Réglages PAR POSTE (ancrage, taille) : ils doivent survivre à un vidage du
  // cache et ne pas voyager d'un poste à l'autre — donc pas dans localStorage,
  // dont l'écriture est de toute façon détournée vers Turso.
  menuReglages: () => ipcRenderer.invoke('menu:reglages'),
  menuSetReglage: (cle, valeur) => ipcRenderer.invoke('menu:set', String(cle || ''), valeur),
  // Le site pousse son modèle de menu : la coquille en tire ses RACCOURCIS
  // CLAVIER et la fenêtre détachée. Une seule source, jamais deux listes.
  menuModele: (m) => ipcRenderer.invoke('menu:modele', m || {}),
  // Prévenu quand un réglage change côté application (ex. « ancrer en haut »
  // cliqué depuis la fenêtre détachée) : sans ça, le site ne le verrait qu'au
  // prochain rechargement.
  onMenuReglages: (cb) => {
    const h = (e, r) => { try { cb(r); } catch {} };
    ipcRenderer.on('menu:reglages', h);
    return () => ipcRenderer.removeListener('menu:reglages', h);
  },

  // Découverte des imprimantes DU POSTE (remplace /printers de l'agent).
  //   -> [{ name, displayName, description, status, isDefault, options }]
  listPrinters: () => ipcRenderer.invoke('printers:list'),

  // Impression silencieuse d'un document arbitraire (remplace /print de l'agent).
  //   payload : { html?, dataUrl?, mime?, deviceName?, widthIn?, heightIn?, copies?, landscape? }
  //   -> { ok, error }   (verdict RÉEL)
  printDocument: (payload) => ipcRenderer.invoke('print:document', payload || {}),

  // Impression de la page courante (test).
  printCurrent: (opts) => ipcRenderer.invoke('print:current', opts || {}),

  // Contrôles de fenêtre RÉELS (window.minimize() n'existe pas côté navigateur).
  minimize: () => ipcRenderer.send('win:minimize'),
  close: () => ipcRenderer.send('win:close'),

  // ── Phase 3 : notifications + pastille ──────────────────────────────────────
  notify: (opts) => ipcRenderer.invoke('notify', opts || {}),
  // Pastille sur l'icône : on DESSINE le compteur ici (le monde isolé partage le
  // DOM, donc canvas dispo) et on envoie l'image au processus principal.
  setBadge: (count) => {
    const n = parseInt(count, 10) || 0;
    if (n <= 0) return ipcRenderer.invoke('badge:set', null, '');
    try {
      const s = 32, c = document.createElement('canvas'); c.width = s; c.height = s;
      const x = c.getContext('2d');
      x.fillStyle = '#c0392b'; x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      const txt = n > 99 ? '99+' : String(n);
      x.font = 'bold ' + (txt.length >= 3 ? 13 : 18) + 'px Segoe UI, sans-serif';
      x.fillText(txt, s / 2, s / 2 + 1);
      return ipcRenderer.invoke('badge:set', c.toDataURL('image/png'), n + ' à traiter');
    } catch { return ipcRenderer.invoke('badge:set', null, ''); }
  },

  // ── Phase 4 : démarrage auto + fichiers d'export ────────────────────────────
  getAutoLaunch: () => ipcRenderer.invoke('autolaunch:get'),
  setAutoLaunch: (on) => ipcRenderer.invoke('autolaunch:set', !!on),
  saveExport: (name, dataUrlOrText) => ipcRenderer.invoke('export:save', name, dataUrlOrText),
  listExports: () => ipcRenderer.invoke('export:list'),
  deleteExport: (name) => ipcRenderer.invoke('export:delete', name),
  openExportsFolder: () => ipcRenderer.invoke('export:openFolder'),

  // ── Phase 5 : import de photos depuis une clé USB ───────────────────────────
  scanUsb: () => ipcRenderer.invoke('usb:scan'),
  readImage: (filePath) => ipcRenderer.invoke('usb:read', filePath),
  // Prévenu quand une clé de photos est branchée : callback({ drive, photos }).
  onUsbPhotos: (cb) => {
    const h = (e, payload) => { try { cb(payload); } catch {} };
    ipcRenderer.on('usb:photos', h);
    return () => ipcRenderer.removeListener('usb:photos', h);
  },
});
