'use strict';
/*
 * LA BARRE DE MENUS EST-ELLE UTILISABLE SOUS LA VUE DE CONNEXION ?
 * =============================================================================
 * ⚠⚠ SES MOTS : « le menu ne fonctionne pas dans l'écran de connexion, tu
 * cliques, rien ne se passe ». La 5.20.0 avait rendu la barre de la PAGE
 * visible ; ses panneaux, eux, s'ouvraient sous la vue native. Ce banc mesure
 * les DEUX moitiés de la correction, dans un vrai Electron :
 *
 *   ① la barre NATIVE d'Electron est-elle visible pendant la connexion ?
 *   ② la vue couvre-t-elle bien tout le contenu (plus de bande à laisser) ?
 *   ③ et redevient-elle invisible quand la vue s'en va ?
 *
 * ⚠ POURQUOI UN BANC ET PAS UN RAISONNEMENT. Quatre versions ont été perdues
 * sur cet écran à raisonner sans mesurer, et trois instruments de mesure
 * successifs ont donné trois réponses différentes. `isMenuBarVisible()` et
 * `getBounds()` sont les deux seules réponses que la machine donne elle-même.
 *
 * ⚠ IL SE FERME TOUT SEUL — un banc qui laisse une fenêtre ouverte sur le poste
 * de quelqu'un qui travaille est un banc qu'on n'ose plus lancer.
 *
 * Lancement :  npx electron tools/essai-menu-connexion.js
 */

const { app, BrowserWindow, WebContentsView, Menu } = require('electron');
const path = require('path');

const dire = (x) => { process.stdout.write('ELG| ' + x + '\n'); };
const fautes = [];
const exige = (vrai, quoi) => {
  dire((vrai ? '  OK   ' : '  NON  ') + quoi);
  if (!vrai) fautes.push(quoi);
};

app.whenReady().then(async () => {
  /* Le menu que la coquille garde masqué pour ses raccourcis : on en pose un
     équivalent, c'est lui qu'on doit voir apparaître. */
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Fichier', submenu: [{ label: 'Quitter', click: () => {} }] },
    { label: 'Affichage', submenu: [{ label: 'Thème', click: () => {} }] },
  ]));

  const fenetre = new BrowserWindow({
    width: 1200, height: 820, show: true, backgroundColor: '#101828',
    title: 'ELG-ESSAI-MENU-CONNEXION',
  });
  fenetre.setMenuBarVisibility(false);
  fenetre.autoHideMenuBar = true;

  await fenetre.loadURL('data:text/html;charset=utf-8,'
    + encodeURIComponent('<body style="margin:0;background:#c0392b"></body>'));

  const avant = fenetre.getContentSize();
  dire('avant — barre visible=' + fenetre.isMenuBarVisible()
    + '  contentSize=' + JSON.stringify(avant));

  // ── On pose la vue, exactement comme `connexionMontrer`. ──────────────────
  let page = '';
  try { page = require('../src/fenetres/connexion.js').pageConnexion(''); }
  catch (e) { dire('ECHEC pageConnexion : ' + e.message); app.exit(1); return; }

  const vue = new WebContentsView({ webPreferences: {
    preload: path.join(__dirname, '..', 'src', 'pont-preload.js'),
    contextIsolation: true, nodeIntegration: false, sandbox: true,
  } });
  fenetre.contentView.addChildView(vue);
  vue.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page));

  // La correction : on montre la barre native, et la vue prend tout le contenu.
  fenetre.autoHideMenuBar = false;
  fenetre.setMenuBarVisibility(true);
  const poser = () => {
    const [w, h] = fenetre.getContentSize();
    vue.setBounds({ x: 0, y: 0, width: w, height: h });
  };
  poser();

  await new Promise((r) => setTimeout(r, 1200));
  poser();

  const pendant = fenetre.getContentSize();
  const b = vue.getBounds();
  dire('pendant — barre visible=' + fenetre.isMenuBarVisible()
    + '  contentSize=' + JSON.stringify(pendant) + '  vue=' + JSON.stringify(b));

  exige(fenetre.isMenuBarVisible() === true,
    '① la barre de menus NATIVE est visible pendant la connexion');
  exige(b.x === 0 && b.y === 0,
    '② la vue part du coin (0,0) — plus de bande réservée à la barre de la page');
  exige(b.width === pendant[0] && b.height === pendant[1],
    '② la vue couvre TOUT le contenu (' + b.width + '×' + b.height
    + ' contre ' + pendant[0] + '×' + pendant[1] + ')');
  /* ⚠ LA MOITIÉ QU ON OUBLIE DE VÉRIFIER : montrer la barre RÉTRÉCIT la zone de
     contenu. Si `getContentSize` n en tenait pas compte, la vue déborderait par
     le bas — c est la bande noire de la 5.19.0, par l autre bout. */
  exige(pendant[1] < avant[1],
    '② montrer la barre a bien RÉTRÉCI la zone de contenu ('
    + avant[1] + ' → ' + pendant[1] + ' px) — la vue suit');

  // ── Et au retrait, la barre native doit repartir. ────────────────────────
  fenetre.contentView.removeChildView(vue);
  try { vue.webContents.close(); } catch (e) {}
  fenetre.autoHideMenuBar = true;
  fenetre.setMenuBarVisibility(false);
  await new Promise((r) => setTimeout(r, 200));
  dire('apres — barre visible=' + fenetre.isMenuBarVisible());
  exige(fenetre.isMenuBarVisible() === false,
    '③ la barre native repart quand la vue s’en va — la page reprend la sienne');

  try { fenetre.destroy(); } catch (e) {}
  if (fautes.length) {
    dire('');
    dire('✗ ' + fautes.length + ' point(s) en échec.');
    app.exit(1); return;
  }
  dire('');
  dire('✓ la barre de menus native tient la connexion, et la vue couvre tout.');
  app.exit(0);
});
