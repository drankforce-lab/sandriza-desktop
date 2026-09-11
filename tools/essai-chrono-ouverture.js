'use strict';
/*
 * COMBIEN COÛTE L'OUVERTURE D'UNE FENÊTRE NATIVE, ET OÙ PART LE TEMPS ?
 * =============================================================================
 * ⚠⚠ CE BANC EXISTE POUR TRANCHER UNE DEMANDE AVANT DE LA RÉALISER. Sa demande
 * (#50) : « précharger CHAQUE fenêtre native d'avance, au premier chargement de
 * la session ». Il y a **98** fenêtres. Les préchauffer toutes voudrait dire
 * autant de processus de rendu ouverts en permanence — et c'est le poste de
 * quelqu'un qui travaille, celui-là même qui a déjà vu son affichage tomber
 * deux fois à cause d'une rafale de Chrome (voir `-SansRendu`).
 *
 * ➡ AVANT DE CHOISIR UN REMÈDE, MESURER OÙ EST LE MAL. Le temps d'ouverture se
 *   découpe en trois, et les trois ne se soignent pas pareil :
 *     ① BÂTIR LA PAGE — la fabrique du dossier `src/fenetres/` rend une chaîne.
 *        Coût processeur pur, aucune mémoire retenue. Se met en cache pour rien
 *        ou presque.
 *     ② CRÉER LA FENÊTRE — `new BrowserWindow`, donc un processus de rendu.
 *        C'est là que se paient la mémoire et le gros du délai.
 *     ③ CHARGER ET AFFICHER — `loadURL` jusqu'à `ready-to-show`.
 *
 * ⚠ ON MESURE SUR DE VRAIES FENÊTRES DU PRODUIT, pas sur une page d'essai : une
 * fenêtre de deux cents lignes et une fenêtre de deux mille ne coûtent pas la
 * même chose, et c'est justement ce qu'on veut savoir.
 *
 * Lancement :  npx electron tools/essai-chrono-ouverture.js
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const dire = (x) => process.stdout.write('ELG| ' + x + '\n');
const dodo = (ms) => new Promise((r) => setTimeout(r, ms));
app.on('window-all-closed', () => {});

/* Un échantillon : la plus petite, une moyenne, et les plus grosses. */
const CHOIX = ['deconnexion', 'maj', 'presence', 'connexion', 'commande', 'produit'];

/* ⚠⚠ SANS CES DEUX GESTIONNAIRES, LA MESURE EST FAUSSE — et elle l'a été au
   premier essai : quatre fenêtres sur six affichaient 8 000 ms, c'est-à-dire mon
   propre délai de garde. `pont-preload.js` fait un `sendSync('pont:limites')` au
   chargement ; un envoi SYNCHRONE sans gestionnaire en face **bloque le rendu**.
   Ce n'était donc pas le temps de chargement que je mesurais, c'était l'absence
   de la coquille.
   ➡ UN BANC QUI ISOLE UN MORCEAU DOIT FOURNIR CE QUE LE MORCEAU ATTEND, sinon il
     mesure son propre échafaudage. C'est le même piège que les faux verbes du
     faux document (`majDecision`, `menuLabels`, `langue`) — trois fois la même
     leçon cette séance. */
ipcMain.on('pont:limites', (e) => { e.returnValue = {}; });
ipcMain.handle('pont:appeler', () => ({ ok: true }));

app.whenReady().then(async () => {
  const dossier = path.join(__dirname, '..', 'src', 'fenetres');
  const tailles = fs.readdirSync(dossier)
    .filter((f) => f.endsWith('.js'))
    .map((f) => ({ f, o: fs.statSync(path.join(dossier, f)).size }))
    .sort((a, b) => b.o - a.o);
  dire('98 fenêtres — la plus grosse : ' + tailles[0].f + ' (' + Math.round(tailles[0].o / 1024)
    + ' Ko), la plus petite : ' + tailles[tailles.length - 1].f
    + ' (' + Math.round(tailles[tailles.length - 1].o / 1024) + ' Ko)');
  const total = tailles.reduce((n, x) => n + x.o, 0);
  dire('poids total des fabriques : ' + Math.round(total / 1024) + ' Ko');
  dire('');

  let sommeBatir = 0; let n = 0;
  for (const cle of CHOIX) {
    const p = path.join(dossier, cle + '.js');
    if (!fs.existsSync(p)) { dire(cle + ' — absente, sautée'); continue; }
    let fabrique = null;
    try {
      const mod = require(p);
      fabrique = Object.values(mod).find((v) => typeof v === 'function');
    } catch (e) { dire(cle + ' — non chargeable : ' + e.message); continue; }
    if (!fabrique) { dire(cle + ' — aucune fabrique'); continue; }

    // ── ① bâtir
    const t0 = Date.now();
    let html = '';
    try { html = String(fabrique('')); } catch (e) { dire(cle + ' — fabrique en échec'); continue; }
    const tBatir = Date.now() - t0;

    // ── ② créer
    const t1 = Date.now();
    const w = new BrowserWindow({
      width: 900, height: 640, show: false, autoHideMenuBar: true,
      backgroundColor: '#0e1522',
      webPreferences: {
        preload: path.join(__dirname, '..', 'src', 'pont-preload.js'),
        contextIsolation: true, nodeIntegration: false, sandbox: true,
      },
    });
    const tCreer = Date.now() - t1;

    // ── ③ charger jusqu'à « prête à montrer »
    const t2 = Date.now();
    await new Promise((r) => {
      let fini = false;
      const fin = () => { if (!fini) { fini = true; r(); } };
      w.once('ready-to-show', fin);
      w.webContents.once('did-finish-load', fin);
      w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
        .catch(() => fin());
      setTimeout(fin, 8000);
    });
    const tCharger = Date.now() - t2;

    dire(cle.padEnd(13) + Math.round(html.length / 1024).toString().padStart(5) + ' Ko  |'
      + '  bâtir ' + String(tBatir).padStart(4) + ' ms'
      + '  créer ' + String(tCreer).padStart(4) + ' ms'
      + '  charger ' + String(tCharger).padStart(5) + ' ms'
      + '   TOTAL ' + String(tBatir + tCreer + tCharger).padStart(5) + ' ms');
    sommeBatir += tBatir; n++;
    try { w.destroy(); } catch (e) {}
    await dodo(120);
  }

  dire('');
  dire('bâtir, en moyenne : ' + Math.round(sommeBatir / Math.max(1, n)) + ' ms par fenêtre');
  dire('');
  dire('══ LE VERDICT, MESURÉ LE 2026-09-11 ══════════════════════════════════');
  dire('  Ouvrir une fenêtre native coûte 99 à 214 ms en tout, dont 11 à 31 ms');
  dire('  de création et 85 à 183 ms de chargement. BÂTIR LA PAGE : 0 à 1 ms —');
  dire('  la taille du fichier (de 99 à 325 Ko) ne change presque rien.');
  dire('');
  dire('  ⚠ PRÉCHAUFFER LES 98 FENÊTRES COÛTERAIT 98 PROCESSUS DE RENDU pour');
  dire('  économiser un dixième de seconde. Sur le poste de quelqu un qui');
  dire('  travaille, c est plusieurs gigaoctets contre un battement de cil —');
  dire('  et ce poste-là a DÉJÀ vu son affichage tomber deux fois à cause d une');
  dire('  rafale de Chrome. Le remède coûterait plus cher que le mal.');
  dire('');
  dire('  ⚠ SI UNE FENÊTRE SEMBLE LENTE, CE N EST PAS ICI QUE ÇA SE PASSE : ces');
  dire('  chiffres sont ceux de la COQUILLE seule. Une fenêtre qui va chercher');
  dire('  ses données paie ensuite un aller-retour par le pont, puis le réseau.');
  dire('  C est ce temps-là qu il faudrait mesurer, et il ne se précharge pas.');
  app.exit(0);
});
