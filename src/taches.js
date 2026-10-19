'use strict';

/*
 * LE SUIVI DES GÉNÉRATIONS, DANS UNE PETITE FENÊTRE À PART (2026-10-19)
 * =============================================================================
 * Sa demande : « la notification de génération ne doit PAS être dessinée DANS
 * les fenêtres de l'application (rien qui déforme ou recouvre l'administration).
 * Fais-en une VRAIE PETITE FENÊTRE WINDOWS séparée » — puis sa décision : « le
 * suivi des photos devient LE MODÈLE. Reproduis EXACTEMENT ce graphisme et ce
 * comportement pour les générations ».
 *
 * UN SERVICE DU PROCESSUS PRINCIPAL. Il lit la file des générations (aperçus 3D
 * de la fiche produit, vêtement sans mannequin du Studio, rendus photo de
 * l'Atelier — generations:etat, page principale) et les montre, empilées, dans
 * UNE fenêtre sans cadre, toujours au-dessus, sans barre des tâches, qui ne prend
 * pas le focus, en bas à droite de l'écran. Chaque génération a SA boîte de suivi,
 * celle de la fenêtre Photos (CSS_SUIVI du socle) : src/fenetres/taches.js.
 * Une génération finie reste 8 s (« ✓ Terminé »), puis s'en va ; plus rien : la
 * fenêtre se cache.
 *
 * ⚠ LES AUTRES SUIVIS (lots, suppression de photos…) N'Y SONT PAS — sa décision du
 *   2026-10-19 : « Ne migre PAS les autres suivis pour l'instant ».
 * ⚠ JAMAIS PENDANT UN ESSAI : la fenêtre naît cachée (show:false) et ne paraît que
 *   par `showInactive`, quand une génération est à montrer — et seule l'application
 *   démarre ce service (main.js) ; aucun banc ne le démarre.
 * ⚠ Les fonctions de calcul sont PURES (exportées) : tools/banc-pastille-generations.js
 *   les éprouve sans Electron.
 */

const LARGEUR = 444;        // la boîte des Photos (26rem) + la marge de son ombre
const MARGE = 8;

/* LA RÈGLE (ce qui se montre, l'avancement, les lignes) est écrite UNE fois, dans la page (REGLE_JS, src/fenetres/taches.js) :
   la page s'en sert à sa première peinture, et le processus principal évalue LE MÊME texte ici. Deux écritures de la
   même règle finissent toujours par diverger. */
const { REGLE_JS } = require('./fenetres/taches');
// eslint-disable-next-line no-new-func
const R = new Function(REGLE_JS + '\nreturn { avancement: avancement, lignes: lignes, aMontrer: aMontrer, TERMINE_MS: TERMINE_MS };')();
const { avancement, lignes, aMontrer, TERMINE_MS } = R;

let fenetre = null, minuterie = null, opts = null, enCours = false, pret = false;

function poser(h){
  const { screen } = require('electron');
  const z = screen.getPrimaryDisplay().workArea;
  const haut = Math.max(40, Math.min(z.height - 2 * MARGE, Math.ceil(h)));
  fenetre.setBounds({ x: z.x + z.width - LARGEUR - MARGE, y: z.y + z.height - haut - MARGE, width: LARGEUR, height: haut });
}
function fenetreTaches(){
  if (fenetre && !fenetre.isDestroyed()) return fenetre;
  const { BrowserWindow } = require('electron');
  const path = require('path');
  fenetre = new BrowserWindow({ show: false, frame: false, transparent: true, backgroundColor: '#00000000', resizable: false,
    movable: false, minimizable: false, maximizable: false, fullscreenable: false, alwaysOnTop: true, skipTaskbar: true,
    focusable: false, hasShadow: false, width: LARGEUR, height: 120,
    webPreferences: { preload: path.join(__dirname, 'pont-preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  try { fenetre.setAlwaysOnTop(true, 'screen-saver'); } catch (e) {}
  const { pageTaches } = require('./fenetres/taches');
  pret = false;
  fenetre.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(pageTaches()));
  fenetre.webContents.on('did-finish-load', () => {
    pret = true;
    try { if (opts && opts.appliquerTheme) opts.appliquerTheme(fenetre.webContents); } catch (e) {}
    tic().catch(() => {});
  });
  fenetre.on('closed', () => { fenetre = null; pret = false; });
  return fenetre;
}

async function tic(){
  if (!opts || enCours) return;
  enCours = true;
  try {
    const maintenant = Date.now();
    let r = null;
    try { r = await opts.appeler('generations:etat', []); } catch (e) { r = null; }
    if (!r || !r.ok) return;              // pas de session, page principale absente : on ne dit rien
    const liste = aMontrer(r.liste, maintenant);
    const visible = fenetre && !fenetre.isDestroyed() && fenetre.isVisible();
    if (!liste.length && !visible) return;
    const w = fenetreTaches();
    // notre propre témoin (did-finish-load), posé à chaque chargement : la page n'est appelée qu'une fois prête
    if (!pret) return;   // did-finish-load relance
    let h = 0;
    try { h = Number(await w.webContents.executeJavaScript('window.szMaj ? window.szMaj(' + JSON.stringify(liste) + ') : 0', true)) || 0; } catch (e) { h = 0; }
    if (h <= 0) { if (w.isVisible()) w.hide(); return; }
    poser(h);
    if (!w.isVisible()) w.showInactive();
  } finally { enCours = false; }
}

/** Démarre le service. o : { appeler(op, args) → promesse (le pont du site), appliquerTheme(wc) }. */
function demarrer(o){
  opts = o || {};
  if (minuterie) clearInterval(minuterie);
  minuterie = setInterval(() => { tic().catch(() => {}); }, 1500);
}
function arreter(){ if (minuterie) clearInterval(minuterie); minuterie = null; if (fenetre && !fenetre.isDestroyed()) fenetre.destroy(); fenetre = null; }
/** Le thème a changé : la fenêtre le suit (appliquerThemePartout). */
function fenetreCourante(){ return (fenetre && !fenetre.isDestroyed()) ? fenetre : null; }
/** La langue a changé : la page est refaite (ses mots sont posés à la fabrication) ; did-finish-load la repeint. */
function refaire(){
  const w = fenetreCourante(); if (!w) return;
  const { pageTaches } = require('./fenetres/taches');
  pret = false;
  w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(pageTaches()));
}

module.exports = { demarrer, arreter, fenetreCourante, refaire, avancement, lignes, aMontrer, TERMINE_MS, LARGEUR };
