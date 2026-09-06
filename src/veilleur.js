'use strict';

/*
 * LE VEILLEUR — zone de notification, commandes et retours
 * =============================================================================
 * Sa demande, mot pour mot (2026-08-07) :
 *
 *   « Un agent à installer pour suivre les nouvelles commandes et retours,
 *     toujours actif en zone de notification, qui écoute s'il y a de nouvelles
 *     commandes et retours, émet un toast et un son unique pour les commandes et
 *     un autre pour les retours, et ce même si l'application est fermée. Il
 *     devrait s'installer en même temps que l'application, et on pourrait le
 *     désactiver au besoin et le réinstaller manuellement via l'application. »
 *
 * ══ CE FICHIER EST UN PROCESSUS À PART, ET C'EST TOUTE LA DEMANDE ═══════════
 * « même si l'application est fermée » écarte la solution facile (garder la
 * fenêtre d'administration vivante et cachée). Le même binaire est donc lancé
 * une seconde fois avec `--veilleur` : `main.js` détecte le drapeau à sa
 * première ligne et confie tout à ce module, sans jamais construire
 * l'administration. Un binaire, deux processus, aucune seconde installation à
 * faire (son point 5).
 *
 * ⚠⚠ LE PIÈGE QUI AURAIT TUÉ LE VEILLEUR AU DÉMARRAGE : `requestSingleInstanceLock`
 * est indexé sur le dossier `userData`. Le veilleur, partageant celui de
 * l'administration, se serait vu refuser le verrou par l'application déjà
 * ouverte et se serait ÉTEINT AUSSITÔT — sans rien dire, puisque `app.quit()`
 * est silencieux. Il déplace donc son `userData` dans un sous-dossier AVANT de
 * demander le verrou. Il garde ainsi son propre verrou (deux veilleurs restent
 * impossibles) sans marcher sur celui de l'administration.
 * ⚠ Et comme le jeton, lui, doit rester COMMUN aux deux, on dit explicitement au
 * module du secret d'aller le chercher dans le dossier de l'application.
 *
 * ══ CE QU'IL NE FAIT PAS, ET POURQUOI ═══════════════════════════════════════
 * Il ne lit AUCUNE commande. Il interroge `notif-feed.php`, qui ne rend que des
 * NOMBRES et des HORODATAGES. Le veilleur ne peut donc pas afficher « commande de
 * Marie, 240 $ » — et c'est voulu : un processus qui démarre avec Windows et
 * tourne sans surveillance est le dernier endroit où mettre des données de
 * clientes. Il dit « 2 nouvelles commandes », on ouvre l'administration pour
 * savoir lesquelles.
 */

const path = require('path');
const fs = require('fs');
const { app, Tray, Menu, Notification, nativeImage, BrowserWindow, shell } = require('electron');
const { execFile } = require('child_process');

const secret = require('./veilleur-secret');
// La DÉCISION du curseur vit à part, sans Electron, pour être éprouvable —
// même patron que `brouillon-garde.js`. Voir son en-tête : c'est la pièce dont
// l'erreur est muette.
const { curseurSuivant, aAnnoncer } = require('./veilleur-curseur');
// Une seule implémentation de « démarrer avec Windows », partagée avec
// l'administration — deux entrées de registre, deux noms. Voir son en-tête :
// `setLoginItemSettings` seul n'écrit rien sur ce poste-là.
const dem = require('./demarrage-auto');

// ── L'ADRESSE INTERROGÉE ─────────────────────────────────────────────────────
// ⚠ `www.sandriza.com` et NON `adm.sandriza.com`, et ce n'est pas indifférent :
// le portail d'administration est derrière le verrou d'application
// (`adm-appgate.php`), qui attend l'en-tête `X-Sandriza-App` posé par la fenêtre
// principale. Le veilleur n'a pas de fenêtre, donc pas de session web — il
// s'authentifie par SON jeton, sur la racine du site, qui n'a pas ce verrou.
const URL_FLUX = process.env.ELG_VEILLEUR_URL || 'https://www.sandriza.com/notif-feed.php';

// Cadence. 60 s : assez court pour qu'une commande ne dorme pas, assez long pour
// que ça reste 1 440 requêtes par jour — rien du tout pour le serveur.
const CADENCE_MS = 60 * 1000;
// Après un échec, on espace au lieu de marteler (le serveur redémarre, le
// portable change de réseau). Plafonné, sinon un veilleur oublié en erreur ne
// reviendrait jamais tout seul.
const CADENCE_ERREUR_MAX_MS = 10 * 60 * 1000;

/* ⚠⚠ L'ICÔNE DOIT VIVRE SOUS `src/`, ET ELLE N'Y ÉTAIT PAS. Elle pointait sur
   `build/icon.png` — or `electron-builder.yml` n'empaquette QUE le contenu de
   `src` et `package.json`.
   ⚠ Le motif d'empaquetage ne s'écrit PAS ici : il contient une étoile suivie
   d'une barre oblique, qui referme ce commentaire. Même famille que l'accent
   grave qui referme un gabarit — huit fois dans ce dépôt. `build/` est un dossier de RESSOURCES DE CONSTRUCTION : il
   sert à fabriquer l'icône de l'application, il n'entre jamais dans l'archive.
   En développement le fichier existe, donc tout allait bien ; dans
   l'application installée, `createFromPath` rendait une image VIDE et la zone
   de notification affichait un carré noir. Signalé le 2026-09-06, capture à
   l'appui.
   ⚠ La panne est MUETTE par nature : `createFromPath` ne lève pas sur un
   fichier absent, il rend une image vide — et un `Tray` accepte une image vide
   sans broncher. `tools/banc-ressources-empaquetees.js` refuse désormais toute
   ressource citée par `src/` qui vivrait hors de `src/`.
   Le second chemin reste pour le développement, où l'on lance depuis le dépôt. */
const ICON_PATH = [
  path.join(__dirname, 'icone-veilleur.png'),
  path.join(__dirname, '..', 'build', 'icon.png'),
].find((p) => { try { return fs.existsSync(p); } catch { return false; } }) || '';
const SONS = {
  commande: path.join(__dirname, 'sons', 'commande.wav'),
  retour: path.join(__dirname, 'sons', 'retour.wav'),
};

let tray = null;
let hautParleur = null;      // fenêtre invisible : le seul moyen de jouer DEUX sons distincts
let minuterie = null;
let etat = null;
let dernierEchec = '';        // '' = tout va bien ; sinon le motif, écrit dans le menu
let pasErreur = 0;            // nombre d'échecs d'affilée (pour espacer)

// ══ ÉTAT PERSISTANT ═════════════════════════════════════════════════════════
// Dans le dossier du VEILLEUR (pas celui de l'administration) : c'est son état à
// lui, et le curseur ne veut rien dire pour l'application principale.
// ⚠ AUCUN SECRET ICI — le jeton passe par `veilleur-secret`, chiffré.
/*
 * ⚠ `pid` ET `vu` NE SONT PAS DU CONFORT : ils sont le SEUL moyen pour
 * l'administration de savoir si le veilleur tourne. Ce sont deux processus
 * séparés, sans canal entre eux — c'était le but. La fenêtre de réglages lit
 * donc ce fichier :
 *   • `pid` vivant (`process.kill(pid, 0)`) → il existe ;
 *   • `vu` récent → il travaille VRAIMENT (un processus figé, ou un `pid`
 *     recyclé par le système pour un tout autre programme, resterait « vivant »).
 * Les deux ensemble, jamais l'un seul. Sans `vu`, un numéro de processus réutilisé
 * ferait dire « le veilleur tourne » à propos du bloc-notes de quelqu'un.
 */
const ETAT_DEFAUT = { actif: true, depuis: null, pid: null, vu: null };
const cheminEtat = () => path.join(app.getPath('userData'), 'veilleur-etat.json');

function lireEtat() {
  if (etat) return etat;
  let brut = {};
  try { brut = JSON.parse(fs.readFileSync(cheminEtat(), 'utf8')) || {}; } catch { brut = {}; }
  etat = { ...ETAT_DEFAUT, ...brut };
  return etat;
}

function ecrireEtat(patch) {
  etat = { ...lireEtat(), ...patch };
  try {
    fs.mkdirSync(path.dirname(cheminEtat()), { recursive: true });
    fs.writeFileSync(cheminEtat(), JSON.stringify(etat, null, 2), 'utf8');
  } catch { /* disque plein : on garde au moins le cache mémoire */ }
  return etat;
}

// ══ LES DEUX SONS ═══════════════════════════════════════════════════════════
/*
 * ⚠⚠ POURQUOI UNE FENÊTRE INVISIBLE, ET PAS `shell.beep()`.
 * `shell.beep()` ne produit QU'UN SEUL son système — or il en faut deux
 * DISTINCTS, c'est le cœur de sa demande. Le processus principal d'Electron n'a
 * pas d'`AudioContext` : le son se joue forcément dans un rendu. On garde donc
 * une fenêtre sans cadre, jamais montrée, qui ne sert qu'à ça.
 *
 * ⚠ `autoplayPolicy: 'no-user-gesture-required'` est OBLIGATOIRE : sans elle,
 * Chromium refuse de jouer un son dans une page où personne n'a cliqué — et ici
 * personne ne cliquera JAMAIS. Le son échouerait en silence, ce qui est le pire
 * des cas : le veilleur aurait l'air de fonctionner (le toast s'affiche) sans
 * jamais s'entendre.
 *
 * ⚠ Les WAV voyagent en `data:` plutôt qu'en `file:`. Une fois l'application
 * empaquetée, les fichiers vivent DANS `app.asar` : `<audio src="…wav">` y est un
 * chemin qui traverse une archive, et c'est exactement le genre de détail qui
 * marche au développement et casse à l'installation. Encodés dans la page, il n'y
 * a plus de protocole à négocier.
 */
function ouvrirHautParleur() {
  if (hautParleur && !hautParleur.isDestroyed()) return hautParleur;
  hautParleur = new BrowserWindow({
    show: false,
    width: 1, height: 1,
    skipTaskbar: true,
    webPreferences: {
      autoplayPolicy: 'no-user-gesture-required',
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  let audios = '';
  for (const [nom, f] of Object.entries(SONS)) {
    try {
      const b64 = fs.readFileSync(f).toString('base64');
      audios += `<audio id="${nom}" preload="auto" src="data:audio/wav;base64,${b64}"></audio>`;
    } catch {
      // Un son manquant ne doit pas emporter le veilleur : il notifiera sans
      // bruit, et le menu le dira.
    }
  }
  const page = '<!doctype html><meta charset="utf-8"><title>son</title>' + audios;
  hautParleur.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page));
  return hautParleur;
}

function jouer(nom) {
  try {
    const w = ouvrirHautParleur();
    // `currentTime = 0` : deux commandes coup sur coup doivent sonner deux fois.
    // Sans lui, le second `play()` sur un élément déjà en fin de piste ne fait rien.
    w.webContents.executeJavaScript(
      `(() => { const a = document.getElementById(${JSON.stringify(nom)});
         if (!a) return false; try { a.currentTime = 0; } catch (e) {}
         a.play().catch(() => {}); return true; })();`, true
    ).catch(() => {});
  } catch { /* le toast reste : mieux vaut muet que rien */ }
}

// ══ LE TOAST ════════════════════════════════════════════════════════════════
/*
 * ⚠ `silent: true` SUR LA NOTIFICATION, ET C'EST DÉLIBÉRÉ. Windows joue son
 * propre son de notification ; laissé actif, on entendrait DEUX sons superposés
 * et les nôtres — les seuls qui distinguent commande et retour — deviendraient
 * indiscernables. Le son du veilleur est le nôtre, ou aucun.
 */
function toast(titre, corps, sonNom) {
  jouer(sonNom);
  try {
    const n = new Notification({
      title: titre,
      body: corps,
      icon: fs.existsSync(ICON_PATH) ? ICON_PATH : undefined,
      silent: true,
    });
    // Un clic ouvre l'administration : une notification qu'on ne peut pas suivre
    // oblige à retrouver l'application à la main, et on a déjà oublié pourquoi.
    n.on('click', ouvrirAdministration);
    n.show();
  } catch { /* rien de plus à faire : le son est déjà parti */ }
}

/*
 * Ouvrir l'administration DEPUIS le veilleur = relancer le même binaire SANS
 * `--veilleur`. Si elle tourne déjà, son propre verrou d'instance unique la
 * ramène au premier plan (`second-instance` dans main.js) et le nouveau
 * processus s'éteint : rien à détecter de notre côté.
 */
function ouvrirAdministration() {
  try {
    execFile(process.execPath, [], { detached: true, stdio: 'ignore' }).unref();
  } catch {
    try { shell.openExternal('https://adm.sandriza.com/'); } catch {}
  }
}

// ══ L'INTERROGATION ═════════════════════════════════════════════════════════
/*
 * ⚠ `fetch` natif (Node 18+, présent dans Electron 31) plutôt qu'un module :
 * une dépendance de plus dans un processus qui démarre avec Windows est une
 * surface de plus à tenir à jour.
 * ⚠ ET UN DÉLAI D'ATTENTE EXPLICITE : sans lui, un serveur qui accepte la
 * connexion puis ne répond jamais laisse la requête pendante POUR TOUJOURS, et
 * le veilleur — qui n'ordonnance le tour suivant qu'à la fin de celui-ci —
 * s'arrête sans que rien ne le signale. C'est la panne la plus vicieuse d'un
 * processus de fond : il est là, il ne fait plus rien.
 */
async function interroger() {
  const jeton = secret.lire();
  if (!jeton) return { ok: false, motif: 'sans_jeton' };

  const e = lireEtat();
  const u = new URL(URL_FLUX);
  if (e.depuis) u.searchParams.set('depuis', e.depuis);

  const ctrl = new AbortController();
  const chrono = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(u.toString(), {
      headers: { 'Authorization': 'Bearer ' + jeton, 'Accept': 'application/json' },
      signal: ctrl.signal,
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j || !j.ok) return { ok: false, motif: (j && j.motif) || ('http_' + r.status) };
    return { ok: true, data: j };
  } catch (err) {
    return { ok: false, motif: err && err.name === 'AbortError' ? 'delai' : 'reseau' };
  } finally {
    clearTimeout(chrono);
  }
}

const pluriel = (n, un, plusieurs) => n + ' ' + (n > 1 ? plusieurs : un);

/* Le battement de cœur. Écrit à CHAQUE tour, y compris en pause et y compris
   quand l'interrogation échoue : « je tourne » et « tout va bien » sont deux
   choses différentes, et l'administration doit pouvoir les distinguer. Un
   veilleur en panne de réseau tourne quand même. */
function battre() { ecrireEtat({ pid: process.pid, vu: new Date().toISOString() }); }

async function unTour() {
  battre();
  if (!lireEtat().actif) return;

  const res = await interroger();
  if (!res.ok) {
    dernierEchec = res.motif;
    /* ⚠⚠ « PAS DE JETON » N'EST PAS UNE PANNE, C'EST UN ÉTAT — et les confondre
       a produit le défaut qu'il a signalé le 2026-09-06 : « j'ai configuré le
       jeton et il me dit que ce n'est pas configuré ». Les deux écrans disaient
       vrai. Le veilleur avait démarré AVANT que le jeton n'existe, chaque tour
       comptait un échec de plus, et le recul exponentiel avait porté la
       prochaine lecture à DIX MINUTES. Il aurait fini par voir le jeton — dans
       dix minutes, ce qui, pour quelqu'un qui vient de le coller, veut dire
       jamais.
       Espacer a un sens quand on martèle un serveur qui ne répond pas. Ça n'en a
       aucun quand la réponse est ici, sur le disque, et qu'elle ne changera que
       le jour où quelqu'un agira — d'où la surveillance du fichier plus bas, et
       aucun recul pour ce motif-là. */
    if (res.motif !== 'sans_jeton') pasErreur++;
    else pasErreur = 0;
    majTray();
    return;
  }

  dernierEchec = '';
  pasErreur = 0;
  const d = res.data;

  // ⚠ CE QU'ON ANNONCE ET OÙ ON POSE LE CURSEUR SONT DEUX DÉCISIONS, ET ELLES
  // VIVENT DANS `veilleur-curseur.js` — pas ici. Recopier la règle dans ce
  // fichier la mettrait hors de portée du banc, et c'est précisément celle dont
  // l'erreur ne se voit pas.
  for (const a of aAnnoncer(d)) {
    if (a.type === 'commande') {
      toast(pluriel(a.n, 'nouvelle commande', 'nouvelles commandes'),
        'Ouvrez l’administration pour la traiter.', 'commande');
    } else {
      toast(pluriel(a.n, 'nouvelle demande de retour', 'nouvelles demandes de retour'),
        'Ouvrez l’administration pour la traiter.', 'retour');
    }
  }

  const e = lireEtat();
  const suivant = curseurSuivant(e.depuis, d);
  if (suivant !== e.depuis) ecrireEtat({ depuis: suivant });

  majTray();
}

function ordonnancer() {
  if (minuterie) clearTimeout(minuterie);
  const attente = pasErreur > 0
    ? Math.min(CADENCE_MS * Math.pow(2, pasErreur), CADENCE_ERREUR_MAX_MS)
    : CADENCE_MS;
  minuterie = setTimeout(async () => {
    try { await unTour(); } catch { /* un tour raté n'arrête pas le suivant */ }
    ordonnancer();
  }, attente);
}

// ══ LA ZONE DE NOTIFICATION ═════════════════════════════════════════════════
/*
 * ⚠ LE MENU DIT TOUJOURS DANS QUEL ÉTAT IL EST, y compris quand ça ne va pas.
 * Un veilleur qui ne sonne pas ressemble exactement à un veilleur pour qui rien
 * n'est arrivé : sans une ligne d'état, il est impossible de faire la différence,
 * et on découvre la panne le jour où une commande a dormi trois jours.
 */
const MOTIFS = {
  sans_jeton: 'Pas encore configuré (jeton absent)',
  non_configure: 'Le serveur n’a pas de jeton de veille',
  refus: 'Jeton refusé par le serveur',
  base_injoignable: 'Base de données injoignable',
  delai: 'Le serveur n’a pas répondu à temps',
  reseau: 'Réseau indisponible',
};

function ligneEtat() {
  const e = lireEtat();
  if (!e.actif) return 'En pause';
  if (dernierEchec) return '⚠ ' + (MOTIFS[dernierEchec] || dernierEchec);
  return 'À l’écoute des commandes et des retours';
}

function majTray() {
  if (!tray) return;
  const e = lireEtat();
  try { tray.setToolTip('Veilleur SANDRIZA — ' + ligneEtat()); } catch {}
  const menu = Menu.buildFromTemplate([
    { label: ligneEtat(), enabled: false },
    { type: 'separator' },
    {
      label: e.actif ? 'Mettre en pause' : 'Reprendre la veille',
      click: () => {
        ecrireEtat({ actif: !e.actif });
        pasErreur = 0; dernierEchec = '';
        majTray();
        if (!e.actif) { ordonnancer(); unTour().catch(() => {}); }
      },
    },
    { label: 'Vérifier maintenant', enabled: e.actif, click: () => {
      // ⚠ On efface le recul accumulé : demander explicitement une vérification,
      // c'est dire « la situation a changé ». Sans ça, le clic vérifiait bien,
      // mais le tour suivant restait à dix minutes.
      pasErreur = 0;
      unTour().catch(() => {});
      ordonnancer();
    } },
    {
      /* ⚠ CETTE ENTRÉE N'EST PAS UN GADGET DE MISE AU POINT, ET ELLE RESTE.
         Deux raisons. La première : c'est LUI qui doit juger si les deux sons se
         distinguent — je peux écrire qu'ils montent et qu'ils descendent, je ne
         peux pas entendre à sa place, ni savoir à quel volume tourne son poste.
         La seconde, plus terre à terre : c'est le SEUL moyen de vérifier que le
         son fonctionne sans attendre une vraie commande. Un veilleur muet et un
         veilleur devant qui rien ne s'est passé se ressemblent trop. */
      label: 'Essayer les deux sons',
      submenu: [
        { label: 'Son d’une commande (monte)', click: () => jouer('commande') },
        { label: 'Son d’un retour (descend)', click: () => jouer('retour') },
      ],
    },
    { type: 'separator' },
    { label: 'Ouvrir l’administration', click: ouvrirAdministration },
    { type: 'separator' },
    {
      /* ⚠ `name` EST OBLIGATOIRE ICI. Sans lui, Electron écrit l'entrée de
         démarrage sous le nom du binaire — LE MÊME que celui de l'application —
         et le veilleur ÉCRASERAIT le « Démarrer avec Windows » de
         l'administration (et réciproquement). Deux entrées, deux noms. */
      label: 'Démarrer le veilleur avec Windows',
      type: 'checkbox',
      checked: demarrageAuto(),
      click: (item) => poserDemarrageAuto(item.checked),
    },
    { type: 'separator' },
    { label: 'Quitter le veilleur', click: () => { app.exit(0); } },
  ]);
  tray.setContextMenu(menu);
}

/* ⚠⚠ PAS D'APPEL DIRECT À `setLoginItemSettings` ICI, ET SURTOUT PAS ENTOURÉ
   D'UN `catch {}` VIDE — c'est exactement le défaut que ce dépôt a déjà payé le
   2026-08-20 : la bascule ne posait RIEN sur son poste (Sandboxie virtualise les
   écritures registre) et ne le disait pas. `demarrage-auto.js` relit après avoir
   écrit, retombe sur `reg.exe`, et rend un verdict. */
const demarrageAuto = () => dem.etat(dem.VEILLEUR.nom, dem.VEILLEUR.args);

function poserDemarrageAuto(on) {
  const r = dem.poser(dem.VEILLEUR.nom, dem.VEILLEUR.args, on);
  // ⚠ On relit l'état RÉEL pour redessiner le menu : cocher une case qui n'a
  // rien écrit est le mensonge le plus facile à faire ici.
  majTray();
  if (!r.ok) {
    // Un échec silencieux redeviendrait le défaut de 2026-08-20. Le veilleur n'a
    // pas d'écran : la notification est le seul endroit où le dire.
    try {
      new Notification({
        title: 'Démarrage automatique non posé',
        body: r.detail || 'Windows a refusé l’écriture. Le veilleur ne se relancera pas tout seul.',
        icon: fs.existsSync(ICON_PATH) ? ICON_PATH : undefined,
        silent: true,
      }).show();
    } catch {}
  }
  return r;
}

/* ══ LE JETON PEUT ARRIVER APRÈS NOUS — ET C'EST MÊME LE CAS NORMAL ═════════
   Le veilleur démarre avec Windows ; le jeton se colle dans l'administration,
   plus tard. Sans cette surveillance, il n'existe AUCUN canal entre les deux
   processus (c'était voulu : pas de port ouvert, pas de canal à protéger), et
   le veilleur ne pouvait apprendre la nouvelle qu'au tour suivant.
   On surveille donc le DOSSIER, pas le fichier : `fs.watch` sur un fichier qui
   n'existe pas encore échoue, et c'est précisément la situation de départ.
   ⚠ Un `fs.watch` émet souvent DEUX événements pour une seule écriture (le
   contenu, puis l'horodatage). On regroupe sur 300 ms, sinon on relancerait deux
   interrogations coup sur coup pour rien.
   ⚠ Et l'on ne relit que si l'état a VRAIMENT changé : sans ça, chaque écriture
   du dossier (l'état du veilleur lui-même) déclencherait un tour. */
let _surveille = null;
let _avaitJeton = false;
function surveillerJeton() {
  const f = secret.chemin();
  _avaitJeton = secret.existe();
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.watch(path.dirname(f), (ev, nom) => {
      if (nom && String(nom) !== path.basename(f)) return;
      if (_surveille) clearTimeout(_surveille);
      _surveille = setTimeout(() => {
        const a = secret.existe();
        if (a === _avaitJeton) return;
        _avaitJeton = a;
        // Le jeton vient d'arriver (ou de partir) : on repart tout de suite, et
        // on remet le compteur d'échecs à zéro — la situation a changé.
        pasErreur = 0; dernierEchec = '';
        majTray();
        unTour().catch(() => {});
        ordonnancer();
      }, 300);
    });
  } catch { /* système sans surveillance de fichiers : le tour suivant fera foi */ }
}

// ══ DÉMARRAGE ═══════════════════════════════════════════════════════════════
function demarrer() {
  // ⚠ AVANT `requestSingleInstanceLock` — voir l'en-tête. Le dossier du veilleur
  // est un SOUS-dossier de celui de l'administration : on peut ainsi désigner
  // celui du parent pour le jeton, sans le calculer deux fois.
  const racineApp = app.getPath('userData');
  secret.definirRacine(racineApp);
  try { app.setPath('userData', path.join(racineApp, 'veilleur')); } catch {}

  if (!app.requestSingleInstanceLock()) { app.exit(0); return; }
  app.on('second-instance', () => { majTray(); });

  // ⚠ Le veilleur n'a PAS d'icône dans la barre des tâches et ne doit pas en
  // avoir : sa place est la zone de notification. Sous macOS, cela veut dire
  // sortir du Dock.
  try { if (process.platform === 'darwin' && app.dock) app.dock.hide(); } catch {}

  app.whenReady().then(() => {
    // Même identité que l'administration : c'est elle qui relie la notification
    // au raccourci du menu Démarrer, donc au nom et à l'icône affichés.
    try { app.setAppUserModelId('com.sandriza.admin'); } catch {}

    let img = nativeImage.createFromPath(ICON_PATH);
    try { if (!img.isEmpty()) img = img.resize({ width: 16, height: 16 }); } catch {}
    tray = new Tray(img);
    majTray();
    // Double-clic sur l'icône : le geste que tout le monde essaie en premier.
    tray.on('double-click', ouvrirAdministration);

    ordonnancer();
    unTour().catch(() => {});
    surveillerJeton();
  });

  /* ⚠⚠ SANS CECI, LE VEILLEUR MOURRAIT DÈS SON PREMIER SON. Le comportement par
     défaut d'Electron est de quitter quand la dernière fenêtre se ferme — or la
     seule fenêtre du veilleur est le haut-parleur invisible. Un processus de
     zone de notification n'a pas de fenêtre : il ne quitte que sur « Quitter ». */
  app.on('window-all-closed', () => { /* on reste */ });
}

module.exports = { demarrer };
