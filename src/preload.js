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

// ⚠ LA VERSION NE SE RECOPIE PLUS À LA MAIN. Elle était écrite en dur ici, et
// elle y annonçait encore 1.18.0 alors que la coquille était en 1.19.1 : le
// journal du personnel enregistrait la mauvaise version, et la fenêtre des notes
// marquait « installée ici » sur la mauvaise ligne. Un numéro recopié dans un
// second fichier finit toujours par mentir — celui-ci l'a fait pendant deux
// versions sans que rien ne le signale.
// Elle arrive maintenant de `package.json`, par `additionalArguments` du processus
// principal : le bac à sable interdit `require` et l'accès à `app`, mais laisse
// passer `process.argv`.
const _arg = (process.argv || []).find((a) => String(a).indexOf('--sz-version=') === 0);
const VERSION = _arg ? _arg.slice('--sz-version='.length) : '';
// Le NOM DU POSTE, par le même chemin et pour la même raison : le bac à sable
// interdit `require('os')`. Il remplit la colonne « poste » du journal des
// impressions, qui restait vide dès que l'agent local n'était pas dans le coup —
// or l'agent est installé sur plusieurs ordinateurs, et « qui a imprimé » ne
// suffit pas pour retrouver une étiquette. Vide sur un navigateur ordinaire.
const _argP = (process.argv || []).find((a) => String(a).indexOf('--sz-poste=') === 0);
const POSTE = _argP ? _argP.slice('--sz-poste='.length) : '';

contextBridge.exposeInMainWorld('sandrizaDesktop', {
  isDesktop: true,
  version: VERSION,
  poste: POSTE,

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
  // Le theme (jour/nuit) A L INSTANT de la bascule — sans attendre le
  // battement du modele du menu (plusieurs secondes de retard sinon).
  themeChange: (sombre) => ipcRenderer.send('theme:changer', !!sombre),
  // Couleur de la bande des boutons de fenetre (reduire/agrandir/fermer), pour
  // qu elle suive le fond REEL de la barre — theme clair comme ecran de connexion
  // (correctif #24). Chaines CSS hexadecimales ; le processus principal valide.
  bandeauTitre: (color, symbol) => ipcRenderer.send('chrome:titlebar', String(color || ''), String(symbol || '')),
  // Le panneau d un menu en VRAI menu du systeme (1.55.1) : quand un ecran est
  // ancre, un panneau dessine dans la page passerait dessous — celui-ci
  // s affiche au-dessus de tout, sans voiler l ecran. (x, y) en px CSS.
  // `ancrage` dit comment lire (x,y) : 'bas' = coin haut-gauche (barre du
  // haut), 'droite' = a droite du rail, 'gauche' = le BORD DROIT du panneau
  // est en x (rail a droite). Sans lui, un rail vertical se fait recouvrir.
  menuPanneau: (label, x, y, ancrage) => ipcRenderer.send('menu:panneau', String(label || ''),
    Number(x) || 0, Number(y) || 0, String(ancrage || 'bas')),
  // La souris a quitte la barre (ou clic ailleurs) : le panneau flottant se
  // referme — en differe court, la souris est peut-etre en route vers lui.
  menuPanneauFermer: () => ipcRenderer.send('menu:panneau:fermer'),

  // ⚠⚠ `ouvrirFenetre` A ÉTÉ RETIRÉ LE 2026-08-19, ET NE DOIT PAS REVENIR.
  // Il ouvrait une fenêtre qui chargeait `adm.sandriza.com?szwin=1` — une PAGE
  // WEB DÉGUISÉE EN FENÊTRE, où la barre de menu du site masquait son propre
  // décor pour faire illusion. Le détail du retrait et la raison sont sur la
  // pierre tombale de `main.js` (chercher « FENÊTRES DE TRAVAIL »).
  // Une vraie fenêtre passe par `ouvrirNative(...)` côté coquille, atteinte
  // depuis ici par `menuAction(...)` ou `dockOuvrir(...)`.

  // ── ÉCRANS NATIFS ANCRÉS ──────────────────────────────────────────────────
  // La barre laterale pose la version NATIVE par-dessus la zone de contenu
  // (dock:ouvrir), dit ou est la zone (dock:zone, px CSS — le principal
  // applique le zoom), et cache les vues en naviguant ailleurs (dock:cacher).
  // `etat` (1.56.0+) : l etat voulu par la PERSONNE ('ancre' | 'detache'),
  // lu par le site dans son profil — omis par les sites plus vieux.
  dockOuvrir: (cle, etat) => ipcRenderer.invoke('dock:ouvrir', String(cle || ''), etat ? String(etat) : undefined),
  dockCacher: () => ipcRenderer.send('dock:cacher'),
  dockZone: (rect) => ipcRenderer.send('dock:zone', rect || {}),
  // La vue ancree s est fermee (Echap) ou detachee : le site remet le mot
  // juste dans sa zone de contenu.
  onDockFermee: (cb) => { ipcRenderer.on('dock:fermee', (e, cle) => { try { cb(cle); } catch {} }); },
  onDockDetachee: (cb) => { ipcRenderer.on('dock:detachee', (e, cle) => { try { cb(cle); } catch {} }); },
  // La vue detachee a demande << Ancrer >> : le site navigue vers la section
  // hote pour que la zone d ancrage existe sous la vue revenue.
  onDockAncree: (cb) => { ipcRenderer.on('dock:ancree', (e, cle) => { try { cb(cle); } catch {} }); },
  // Le MENU demande un ecran ancrable (1.56.0) : le site navigue vers sa
  // section — SANS changer l etat retenu de la personne (contrairement a
  // << Ancrer >>) ; le flux d ancrage rouvre ancre ou detache selon l etat.
  onDockNaviguer: (cb) => { ipcRenderer.on('dock:naviguer', (e, cle) => { try { cb(cle); } catch {} }); },
  // Le voile du menu : masquer (false) puis remontrer (true) la vue ancree
  // sans la recharger — le site le prefere a dockCacher+dockOuvrir.
  dockVoiler: (visible) => ipcRenderer.send('dock:voiler', !!visible),
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

  // ── AFFICHAGE CLIENT DE LA CAISSE ─────────────────────────────────────────
  // La caisse pousse son état ; le processus principal le relaie à la fenêtre
  // d'affichage. ⚠ `BroadcastChannel` et `localStorage` ne peuvent PAS servir :
  // la fenêtre d'affichage est native, donc d'origine `null`, et les deux exigent
  // une origine commune. C'est pourquoi ce canal existe.
  posAffichage: (etat) => ipcRenderer.send('pos:diffuser', etat || {}),
  posOuvrir: () => ipcRenderer.invoke('menu:action', 'affichage-client'),

  // Contrôles de fenêtre RÉELS (window.minimize() n'existe pas côté navigateur).
  minimize: () => ipcRenderer.send('win:minimize'),
  close: () => ipcRenderer.send('win:close'),

  // Déplacement de la fenêtre par le pointeur (voir win:pos / win:move dans
  // main.js). `-webkit-app-region:drag` n'est pas honoré par cette coquille :
  // la barre du site lit la position au début du glissement, puis pousse la
  // nouvelle position à chaque mouvement. Sans cadre ni barre de titre native,
  // c'est la seule voie fiable pour déplacer la fenêtre.
  fenetrePos: () => ipcRenderer.invoke('win:pos'),
  fenetreDeplacer: (x, y) => ipcRenderer.send('win:move', x, y),
  // Double-clic sur la bande de titre → agrandir/restaurer (voir win:togglemax).
  fenetreBasculerMax: () => ipcRenderer.send('win:togglemax'),

  // ⚠ RAMENER CETTE FENETRE DEVANT — pour un avertissement, pas pour du confort.
  // Le decompte avant deconnexion pour inactivite s ouvre dans CETTE fenetre. Or
  // le travail se fait desormais dans des fenetres natives : la boite s ouvrait
  // donc DERRIERE elles, ou sur l autre ecran, et l usager etait deconnecte sans
  // avoir rien vu — il en concluait, a juste titre, que << la fenetre de
  // deconnexion ne fonctionne pas >> (2026-08-07).
  // ⚠ A N APPELER QUE POUR CE GENRE D AVERTISSEMENT. Une fenetre qui se met devant
  // pendant qu on travaille ailleurs est une nuisance : ce qui la justifie ici,
  // c est qu on est a 60 secondes de perdre sa session.
  attirerAttention: () => ipcRenderer.send('win:attention'),

  /* Le décompte d'inactivité, dans SA fenêtre — toujours au-dessus.
     ⚠ Un nombre de secondes l'ouvre, 0 (ou rien) le ferme. Le site reste seul
     maître de l'horloge : cette fenêtre ne fait que se montrer. */
  decompte: (secondes) => ipcRenderer.send('session:decompte', parseInt(secondes, 10) || 0),

  // ── Phase 3 : notifications + pastille ──────────────────────────────────────
  // Ouvre la preparation d une commande PRECISE dans une fenetre native.
  // Le site sait laquelle est selectionnee ; la coquille ne fait que porter
  // la fenetre.
  ouvrirCommande: (id) => ipcRenderer.invoke('fenetre:commande', String(id || '')),
  ouvrirExpedition: (id) => ipcRenderer.invoke('fenetre:expedition', String(id || '')),
  ouvrirRetour: (id) => ipcRenderer.invoke('fenetre:retour', String(id || '')),
  ouvrirRemboursement: (id) => ipcRenderer.invoke('fenetre:remboursement', String(id || '')),
  ouvrirClient: (id) => ipcRenderer.invoke('fenetre:client', String(id || '')),
  // L explorateur de photos, en fenetre a part — il ne remplace PAS le Studio.
  ouvrirExplorateur: () => ipcRenderer.invoke('fenetre:explorateur'),
  // L'assistant Produit sur une fiche PRECISE (le << Modifier >> de l'inventaire).
  ouvrirProduitFiche: (id) => ipcRenderer.invoke('fenetre:produit', String(id || '')),
  // Le DETAIL d'une commande dans sa propre fenetre (une par commande).
  ouvrirCommandeDetail: (id) => ipcRenderer.invoke('fenetre:commandeDetail', String(id || '')),
  // La facture dans sa propre fenetre (une par facture).
  ouvrirFacture: (id) => ipcRenderer.invoke('fenetre:facture', String(id || '')),
  ouvrirFactures: () => ipcRenderer.invoke('fenetre:factures'),
  // L etat de compte se VOIT avant de s imprimer, et peut partir au client.
  ouvrirEtatCompte: (id) => ipcRenderer.invoke('fenetre:etatcompte', String(id || '')),
  // Un document HTML rendu en PDF (base64), pour le JOINDRE a un courriel.
  docPdf: (html, opts) => ipcRenderer.invoke('doc:pdf', String(html || ''), opts || {}),
  // Assistants collection et fournisseur PAR FICHE (les listes natives 1.54.0
  // ouvrent une fiche existante ; id vide = assistant vierge, comme le menu).
  ouvrirCollection: (id) => ipcRenderer.invoke('fenetre:collection', String(id || '')),
  ouvrirFournisseur: (id) => ipcRenderer.invoke('fenetre:fournisseur', String(id || '')),
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
  // Dossier des exports : le lire, le changer, revenir au standard.
  // ⚠ MÊMES CANAUX que ceux du pont (pont-preload.js) : le réglage est UN, et
  // deux voies vers le même réglage finiraient par diverger.
  exportsDossier: () => ipcRenderer.invoke('export:dossier'),
  exportsDossierChoisir: () => ipcRenderer.invoke('export:dossierChoisir'),
  exportsDossierDefaut: () => ipcRenderer.invoke('export:dossierDefaut'),

  // ── Phase 5 : import de photos depuis une clé USB ───────────────────────────
  scanUsb: () => ipcRenderer.invoke('usb:scan'),
  // ⚠ Une VIGNETTE pour l ecran de choix : montrer 200 photos d une carte en
  // taille reelle ferait passer un gigaoctet par le pont pour rien.
  vignetteUsb: (chemin, cote) => ipcRenderer.invoke('usb:vignette', String(chemin || ''), cote || 220),
  readImage: (filePath) => ipcRenderer.invoke('usb:read', filePath),
  // Prévenu quand une clé de photos est branchée : callback({ drive, photos }).
  onUsbPhotos: (cb) => {
    const h = (e, payload) => { try { cb(payload); } catch {} };
    ipcRenderer.on('usb:photos', h);
    return () => ipcRenderer.removeListener('usb:photos', h);
  },
});
