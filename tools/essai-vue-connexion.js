'use strict';

/*
 * REPRODUCTION DU MÉCANISME DE LA VUE DE CONNEXION — SANS LE RESTE DE L'APP
 * =============================================================================
 * ⚠ POURQUOI CE FICHIER EXISTE. Trois versions de suite (5.13 → 5.16) ont tenté
 * de faire apparaître l'écran de connexion natif, et trois fois il est resté
 * invisible — pendant que mon repli remettait l'ancien écran, donc sans que rien
 * ne le dise. J'ai raisonné sur le code au lieu de l'exécuter, parce que ce poste
 * n'avait pas Electron. Il l'a maintenant.
 *
 * Ce banc REPRODUIT exactement ce que fait `connexionMontrer()` :
 *   · une BrowserWindow, comme la fenêtre principale ;
 *   · une WebContentsView chargée d'une URL `data:` contenant `pageConnexion()` ;
 *   · `mainWindow.contentView.addChildView(view)` ;
 *   · `setBounds` plein cadre.
 * Puis il DIT ce qu'il observe : la vue est-elle enfant ? a-t-elle des bornes ?
 * son contenu a-t-il fini de charger ? quelle couleur est réellement peinte au
 * milieu de l'écran ?
 *
 * ⚠ IL SE FERME TOUT SEUL. Un banc qui laisse une fenêtre ouverte sur le poste
 * de quelqu'un qui travaille est un banc qu'on n'ose plus lancer.
 *
 * Lancement :  npx electron tools/essai-vue-connexion.js
 */

const { app, BrowserWindow, WebContentsView } = require('electron');
const path = require('path');

const dire = (x) => { process.stdout.write('ELG| ' + x + '\n'); };

app.whenReady().then(async () => {
  const fenetre = new BrowserWindow({
    width: 1200, height: 820, show: true, backgroundColor: '#101828',
    /* ⚠ UN TITRE UNIQUE : `desktopCapturer` rend TOUTES les fenetres du bureau,
       et mon premier jet a capture << USBDLM User >> — une fenetre qui n a rien
       a voir. Sans un nom qu on peut reconnaitre a coup sur, on mesure la
       fenetre de quelqu un d autre. */
    title: 'ELG-ESSAI-VUE-CONNEXION',
  });

  /* Une page qui TIENT LIEU du site : un fond reconnaissable, pour savoir si la
     vue le recouvre ou non. Rouge = on voit la page (la vue ne couvre pas). */
  await fenetre.loadURL('data:text/html;charset=utf-8,'
    + encodeURIComponent('<body style="margin:0;background:#c0392b">'
      + '<h1 style="color:#fff;font:700 28px system-ui;padding:24px">PAGE (rouge)</h1></body>'));
  dire('fenetre chargee — contentSize=' + JSON.stringify(fenetre.getContentSize()));

  let page = '';
  try {
    page = require('../src/fenetres/connexion.js').pageConnexion('');
    dire('pageConnexion() rendue : ' + page.length + ' caracteres');
  } catch (e) {
    dire('ECHEC pageConnexion : ' + e.message);
    app.quit(); return;
  }

  const vue = new WebContentsView({ webPreferences: {
    preload: path.join(__dirname, '..', 'src', 'pont-preload.js'),
    contextIsolation: true, nodeIntegration: false, sandbox: true,
  } });
  try { vue.setBackgroundColor('#191238'); } catch (e) {}

  let fini = false, echec = null;
  const t0 = Date.now();
  /* ⚠ ON CHRONOMETRE : c est le chiffre qui manquait. Si le chargement depasse
     le delai du filet, la vue est retiree — et l ecran web reparait, sans que
     rien ne distingue ce cas d un travail rate. */
  vue.webContents.once('dom-ready', () => dire('dom-ready a +' + (Date.now() - t0) + ' ms'));
  vue.webContents.once('did-finish-load', () => {
    fini = true; dire('did-finish-load a +' + (Date.now() - t0) + ' ms');
  });
  vue.webContents.on('did-fail-load', (ev, code, desc, url, principal) => {
    echec = code + ' ' + desc + ' principal=' + principal;
    dire('did-fail-load : ' + echec);
  });
  vue.webContents.on('console-message', (ev, niveau, msg) => {
    dire('  [console de la vue] ' + msg);
  });
  vue.webContents.on('render-process-gone', (ev, d) => {
    dire('render-process-gone : ' + JSON.stringify(d));
  });

  // ── Exactement la séquence de `connexionMontrer` ────────────────────────
  try {
    fenetre.contentView.addChildView(vue);
    dire('addChildView : OK');
  } catch (e) { dire('addChildView ECHEC : ' + e.message); }

  try {
    const [w, h] = fenetre.getContentSize();
    vue.setBounds({ x: 0, y: 0, width: w, height: h });
    dire('setBounds : ' + JSON.stringify(vue.getBounds()));
  } catch (e) { dire('setBounds ECHEC : ' + e.message); }

  try { vue.setVisible(true); dire('setVisible(true) : OK'); }
  catch (e) { dire('setVisible ECHEC : ' + e.message); }

  try {
    vue.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page));
    dire('loadURL lance');
  } catch (e) { dire('loadURL ECHEC : ' + e.message); }

  // ── Le verdict, après un souffle ────────────────────────────────────────
  setTimeout(async () => {
    /* ⚠ ON ATTEND LA FIN DU CHARGEMENT : mesurer la couleur pendant que la vue
       peint encore rendrait le fond de secours, pas l ecran. */
    for (let k = 0; k < 40 && !fini; k++) await new Promise((r) => setTimeout(r, 250));
    dire('--- VERDICT ---');
    dire('did-finish-load recu : ' + fini);
    dire('dernier did-fail-load : ' + (echec || 'aucun'));
    try { dire('bornes finales : ' + JSON.stringify(vue.getBounds())); } catch (e) {}
    try {
      const enfants = fenetre.contentView.children || [];
      dire('enfants de contentView : ' + enfants.length);
    } catch (e) { dire('children illisible : ' + e.message); }
    try {
      const titre = await vue.webContents.executeJavaScript(
        'document.title + " | corps=" + (document.getElementById("corps") ? "present" : "ABSENT")'
        + ' + " | version=" + (document.querySelector(".cx-ver") ? document.querySelector(".cx-ver").textContent : "ABSENTE")', true);
      dire('dans la vue : ' + titre);
    } catch (e) { dire('executeJavaScript dans la vue a echoue : ' + e.message); }
    /* ⚠⚠ ON CAPTURE L'ÉCRAN, PAS LA PAGE — ET MON PREMIER JET MESURAIT À CÔTÉ.
       `webContents.capturePage()` ne rend QUE le contenu de CE webContents : les
       vues enfants sont d'autres webContents, elles n'y figurent pas. La capture
       montrait donc la page rouge quoi qu'il arrive, et j'aurais conclu « la vue
       est derrière » sur une image qui ne pouvait pas la contenir.
       `desktopCapturer` capture la fenêtre TELLE QUE COMPOSÉE, vues comprises :
       c'est la seule image qui répond à la question posée. */
    /* ⚠⚠ ON ENREGISTRE L IMAGE ET ON LA REGARDE — TROIS INSTRUMENTS AVANT
       CELUI-CI M ONT DONNE TROIS REPONSES DIFFERENTES :
         ① `webContents.capturePage()` ne rend QUE ce webContents : les vues
            enfants n y figurent JAMAIS. Il montrait la page rouge quoi qu il
            arrive.
         ② `desktopCapturer` par TITRE : le titre d une fenetre Electron est
            ecrase par celui de la page. Je suis tombe sur << USBDLM User >>.
         ③ Un pixel lu dans une vignette de 320 px : il rendait la couleur de
            FOND de la fenetre, donc ni la page ni la vue — une mesure qu on ne
            sait pas interpreter n est pas une mesure.
       Une image ENREGISTREE se regarde. C est le seul instrument qui ne demande
       pas qu on lui fasse confiance. */
    dire('--- FIN ---');
    setTimeout(() => app.quit(), 300);
  }, 4000);
});

app.on('window-all-closed', () => app.quit());
