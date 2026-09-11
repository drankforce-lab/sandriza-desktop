'use strict';

/*
 * COMBIEN DE TEMPS MET UNE VUE À DIRE `did-finish-load` ? — ET POURQUOI.
 * =============================================================================
 * ⚠ Mesuré le 2026-09-11 : la page de connexion mettait 29 900 ms, DEUX FOIS à la
 * milliseconde près. Un chiffre aussi stable n'est pas de la lenteur, c'est un
 * DÉLAI D'ATTENTE qui expire. Et comme `connexionMontrer` retirait la vue au bout
 * de 8 s, elle était retirée à tous les coups — l'écran web reparaissait, et rien
 * ne le disait.
 *
 * Ce banc compare quatre configurations pour savoir CE QUI attend :
 *   A. page minuscule, sans préchargement
 *   B. page minuscule, AVEC le préchargement du pont
 *   C. page de connexion, sans préchargement
 *   D. page de connexion, AVEC le préchargement  (= la vraie configuration)
 * Si B et D sont lents et A et C rapides, c'est le préchargement. Si C et D sont
 * lents, c'est la page. Une seule mesure n'aurait pas su répondre.
 */

const { app, BrowserWindow, WebContentsView } = require('electron');
const path = require('path');

const dire = (x) => { process.stdout.write('ELG| ' + x + '\n'); };
const PRE = path.join(__dirname, '..', 'src', 'pont-preload.js');

const mesurer = (fenetre, nom, html, avecPreload) => new Promise((resoudre) => {
  const wp = { contextIsolation: true, nodeIntegration: false, sandbox: true };
  if (avecPreload) wp.preload = PRE;
  const vue = new WebContentsView({ webPreferences: wp });
  fenetre.contentView.addChildView(vue);
  vue.setBounds({ x: 0, y: 0, width: 10, height: 10 });
  const t0 = Date.now();
  let repondu = false;
  const fin = (quoi) => {
    if (repondu) return;
    repondu = true;
    dire(nom.padEnd(46) + (Date.now() - t0) + ' ms  (' + quoi + ')');
    try { fenetre.contentView.removeChildView(vue); vue.webContents.close(); } catch (e) {}
    resoudre();
  };
  vue.webContents.once('did-finish-load', () => fin('did-finish-load'));
  /* ⚠ UN PLAFOND : sans lui, un banc qui mesure une attente attend lui-même
     indéfiniment — et l on ne saurait jamais laquelle des quatre est en cause. */
  setTimeout(() => fin('ABANDON a 40 s'), 40000);
  vue.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
});

app.whenReady().then(async () => {
  const fenetre = new BrowserWindow({ width: 400, height: 300, show: false });
  await fenetre.loadURL('data:text/html,<body>hote</body>');

  const petite = '<!doctype html><html><head><meta charset="utf-8"><title>p</title></head>'
    + '<body><div id="corps">petite</div></body></html>';
  let grande = petite;
  try { grande = require('../src/fenetres/connexion.js').pageConnexion(''); }
  catch (e) { dire('pageConnexion indisponible : ' + e.message); }

  dire('page de connexion : ' + grande.length + ' caracteres');
  dire('');
  await mesurer(fenetre, 'A. page minuscule, SANS prechargement', petite, false);
  await mesurer(fenetre, 'B. page minuscule, AVEC prechargement', petite, true);
  await mesurer(fenetre, 'C. connexion, SANS prechargement', grande, false);
  await mesurer(fenetre, 'D. connexion, AVEC prechargement', grande, true);
  dire('');
  dire('--- FIN ---');
  setTimeout(() => app.quit(), 200);
});

app.on('window-all-closed', () => app.quit());
