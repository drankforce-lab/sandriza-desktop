'use strict';
/*
 * LE MENU EST-IL UTILISABLE PENDANT LA CONNEXION ?
 * =============================================================================
 * ⚠⚠ CE BANC A DÉJÀ MENTI UNE FOIS, ET C EST SA RAISON D ÊTRE.
 * Sa première version ouvrait une `BrowserWindow` ORDINAIRE, montrait la barre
 * de menus native, mesurait que la zone de contenu rétrécissait de 26 px, et
 * concluait « la barre native tient la connexion ». C était vrai — pour cette
 * fenêtre-là. La fenêtre de l APPLICATION est créée avec
 * `titleBarStyle: 'hidden'` (barre de titre maison, boutons du système teintés) :
 * il n y existe AUCUN cadre où peindre une barre de menus. En production, il
 * n avait plus de menu du tout. Ses mots : « mauvaise nouvelle le menu
 * n apparaît plus ».
 *
 * ➡ UN BANC QUI N EMPLOIE PAS LES MÊMES RÉGLAGES QUE LE PRODUIT MESURE AUTRE
 *   CHOSE QUE LE PRODUIT — et il le fait sans jamais avoir l air de se tromper.
 *   C est le même travers que d éprouver une mise en page à une taille d écran
 *   qui n est pas celle de la personne qui la signale.
 *
 * Il éprouve donc maintenant QUATRE choses, toutes sur une fenêtre configurée
 * comme la vraie :
 *   ① la barre native ne se dessine PAS ici — la raison du défaut, épinglée ;
 *   ② la vue de connexion couvre tout le contenu ;
 *   ③ l écran dessine SA barre dès que la coquille lui donne des intitulés ;
 *   ④ cliquer un intitulé demande le panneau du bon menu, au bon endroit ;
 *   ⑤ et GLISSER sur l intitulé voisin déroule le sien — le geste qu il a signalé
 *     comme manquant, qu un menu du SYSTÈME ne peut pas rendre (il prend la souris).
 *
 * ⚠ IL SE FERME TOUT SEUL.
 *
 * Lancement :  npx electron tools/essai-menu-connexion.js
 */

const { app, BrowserWindow, WebContentsView, Menu, ipcMain } = require('electron');
const path = require('path');

const dire = (x) => { process.stdout.write('ELG| ' + x + '\n'); };
const fautes = [];
const exige = (vrai, quoi) => {
  dire((vrai ? '  OK   ' : '  NON  ') + quoi);
  if (!vrai) fautes.push(quoi);
};
const dodo = (ms) => new Promise((r) => setTimeout(r, ms));

/* ⚠ SANS ÇA, LE BANC MEURT EN SILENCE au premier `destroy()` : Electron quitte
   quand il n y a plus de fenêtre, et la moitié des cas ne s exécutait pas. */
app.on('window-all-closed', () => {});

const LABELS = ['Fichier', 'Affichage', 'Aide'];

app.whenReady().then(async () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(
    LABELS.map((l) => ({ label: l, submenu: [{ label: 'Une entrée' }] }))));

  /* La coquille répond ces deux-là ; on les tient ici pour éprouver la fenêtre
     sans lancer toute l application. */
  ipcMain.handle('cnxmenu:labels', () => LABELS);

  const fenetre = new BrowserWindow({
    width: 1200, height: 820, show: true, backgroundColor: '#101828',
    title: 'ELG-ESSAI-MENU-CONNEXION',
    /* ⚠⚠ LES RÉGLAGES DE LA VRAIE FENÊTRE, copiés de `src/main.js`. C est LA
       ligne qui manquait. */
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0e1522', symbolColor: '#e8edf5' },
  });
  fenetre.setMenuBarVisibility(false);
  fenetre.autoHideMenuBar = true;
  await dodo(400);

  // ── ① La barre native ne se dessine pas ici. ─────────────────────────────
  const avant = fenetre.getContentSize();
  fenetre.autoHideMenuBar = false;
  fenetre.setMenuBarVisibility(true);
  await dodo(600);
  const apres = fenetre.getContentSize();
  dire('barre native — contenu ' + avant[1] + ' → ' + apres[1]
    + ' px, isMenuBarVisible=' + fenetre.isMenuBarVisible());
  exige(apres[1] === avant[1] && fenetre.isMenuBarVisible() === false,
    '① la barre NATIVE ne se dessine pas dans cette fenêtre — c’est pourquoi on '
    + 'ne compte plus dessus (si ce point passe au rouge, Electron a changé : on '
    + 'peut alors la reprendre)');
  fenetre.setMenuBarVisibility(false);
  fenetre.autoHideMenuBar = true;

  // ── ② La vue couvre tout le contenu. ─────────────────────────────────────
  let page = '';
  try { page = require('../src/fenetres/connexion.js').pageConnexion(''); }
  catch (e) { dire('ECHEC pageConnexion : ' + e.message); app.exit(1); return; }

  const vue = new WebContentsView({ webPreferences: {
    preload: path.join(__dirname, '..', 'src', 'pont-preload.js'),
    contextIsolation: true, nodeIntegration: false, sandbox: true,
  } });
  fenetre.contentView.addChildView(vue);
  await vue.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page));
  const [cw, ch] = fenetre.getContentSize();
  vue.setBounds({ x: 0, y: 0, width: cw, height: ch });
  const b = vue.getBounds();
  dire('cadre — contenu ' + cw + '×' + ch + '  vue ' + JSON.stringify(b));
  /* ⚠⚠ LA MESURE DOIT D ABORD ÊTRE CRÉDIBLE. Premier jet : `getContentSize()` a
     rendu [0,0] et la comparaison « la vue fait la taille du contenu » est passée
     au VERT sur 0 === 0. Une égalité entre deux riens est une égalité — et c est
     le troisième banc de cette séance à être vert sur son propre défaut. On exige
     donc une taille PLAUSIBLE avant de comparer quoi que ce soit. */
  exige(cw > 400 && ch > 300,
    '② la fenêtre a une taille plausible (' + cw + '×' + ch + ') — sans ça, la '
    + 'comparaison qui suit ne compare rien');
  exige(b.x === 0 && b.y === 0 && b.width === cw && b.height === ch && b.width > 400,
    '② la vue couvre TOUT le contenu (' + b.width + '×' + b.height + ')');

  // ── ③ L'écran dessine sa propre barre. ───────────────────────────────────
  await dodo(1500);
  const lu = await vue.webContents.executeJavaScript(
    "(function(){var z=document.querySelector('.cx-barre');"
    + "if(!z)return {n:-1,txt:''};"
    + "var bs=z.querySelectorAll('button');"
    + "return {n:bs.length,txt:z.textContent,"
    + " reserve:document.body.className.indexOf('cx-abarre')>=0};})()", true);
  dire('barre de l’écran — ' + JSON.stringify(lu));
  exige(lu && lu.n === LABELS.length,
    '③ l’écran dessine ' + LABELS.length + ' intitulé(s) (relevé : ' + (lu ? lu.n : 'rien')
    + ') — un « -1 » veut dire qu’aucune barre n’a été posée');
  exige(!!(lu && lu.reserve),
    '③ le corps réserve la place de la barre — sans quoi elle mange le panneau de marque');

  /* ══ ④ ET ⑤ : LA CHAÎNE COMPLÈTE, CLIC PUIS SURVOL ═══════════════════════
     ⚠⚠ SES MOTS DU 2026-09-11 : « si je clique sur un menu il s ouvre, mais si je
     glisse la souris sur un autre menu le menu ne se déroule pas ». La 5.23.0
     passait par un menu du SYSTÈME : il s ouvrait bien au-dessus de la vue, mais
     il PREND LA SOURIS, donc le survol n arrivait jamais jusqu à la barre.
     ⚠ ON ÉPROUVE DONC LES DEUX GESTES, et la chaîne entière : la vue clique, le
     préchargement envoie, la coquille reçoit — avec le bon intitulé et les bonnes
     coordonnées. Un banc qui ne vérifiait que le premier geste aurait laissé
     passer exactement ce qu il a signalé. */
  const recus = [];
  ipcMain.on('menu:panneau', (e, label, x, y) => { recus.push({ label, x, y }); });

  await vue.webContents.executeJavaScript(
    "document.querySelectorAll('.cx-barre button')[0].click()", true);
  await dodo(400);
  dire('apres le clic — ' + JSON.stringify(recus));
  exige(recus.length === 1 && recus[0].label === LABELS[0],
    '④ cliquer un intitulé demande le panneau du bon menu (reçu : '
    + JSON.stringify(recus.map((r) => r.label)) + ')');
  exige(recus.length > 0 && recus[0].y > 0,
    '④ la position envoyée est celle du BAS du bouton (y=' 
    + (recus[0] ? recus[0].y : '—') + ') — un panneau qui sort ailleurs a l’air de flotter');

  /* Le survol du voisin, PENDANT qu un menu est ouvert. */
  await vue.webContents.executeJavaScript(
    "(function(){var b=document.querySelectorAll('.cx-barre button')[1];"
    + "b.dispatchEvent(new MouseEvent('mouseenter'));return true;})()", true);
  await dodo(400);
  dire('apres le survol du voisin — ' + JSON.stringify(recus.map((r) => r.label)));
  exige(recus.length === 2 && recus[1].label === LABELS[1],
    '⑤ glisser sur l’intitulé voisin déroule SON menu — c’est le geste qu’il a '
    + 'signalé comme manquant');

  /* Et hors ouverture, un simple passage de souris ne doit RIEN déclencher. */
  await vue.webContents.executeJavaScript(
    "(function(){window.szBarreFermee();"
    + "document.querySelectorAll('.cx-barre button')[2]"
    + ".dispatchEvent(new MouseEvent('mouseenter'));return true;})()", true);
  await dodo(400);
  exige(recus.length === 2,
    '⑤ mais AUCUN menu ouvert, le survol ne déclenche rien (' + recus.length
    + ' demande(s)) — sinon traverser la barre déplierait des menus non demandés');

  try { fenetre.destroy(); } catch (e) {}
  dire('');
  if (fautes.length) { dire('✗ ' + fautes.length + ' point(s) en échec.'); app.exit(1); return; }
  dire('✓ le menu de l’écran de connexion tient — intitulés dessinés, clic ET survol.');
  app.exit(0);
});
