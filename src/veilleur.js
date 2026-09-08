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
 * ══ CE FICHIER N'EST PLUS UN PROCESSUS À PART — 2026-09-08 ══════════════════
 * Sa demande : « si on ferme l'application elle devrait se réduire dans la zone
 * de notification et se mettre en mode veille pour les commandes AU LIEU DU
 * VEILLEUR ». La veille vit donc DANS le processus de l'administration, dont la
 * fenêtre se cache au lieu de se fermer. Un seul processus, une seule icône.
 *
 * ⚠⚠ CE QUE CE CHANGEMENT FAIT DISPARAÎTRE, ET C'EST SON VRAI GAIN. Le processus
 * séparé avait engendré, en une seule journée : un verrou d'instance à part, un
 * sous-dossier `userData`, une racine partagée entre deux processus, un fichier
 * chiffré, une surveillance de dossier, un diagnostic à deux chemins et une
 * entrée de registre propre. Chaque pièce était défendable, aucune n'était
 * nécessaire — c'est lui qui avait posé la bonne question (« pourquoi un secret
 * de plus ? »). Tout ça part avec le second processus.
 *
 * ⚠⚠ ET ÇA CORRIGE LE DÉFAUT QU'IL A SIGNALÉ LE 2026-09-08 : depuis l'icône,
 * « Ouvrir l'administration » et le double-clic ne faisaient RIEN. Les deux
 * RELANÇAIENT LE BINAIRE par `spawn`, en espérant que le verrou d'instance
 * unique ramène la fenêtre. Attachée, l'icône appartient à l'administration :
 * « ouvrir » MONTRE la fenêtre qui est déjà là. Il n'y a plus de lancement à
 * réussir, donc plus de lancement à rater.
 *
 * ⚠ « même si l'application est fermée » RESTE SERVI, et par le même geste : le
 * bouton X ne quitte plus, il CACHE. La veille continue exactement comme avant,
 * c'est la fenêtre qui disparaît. Quitter pour de vrai se fait par le menu
 * (Fichier → Quitter, ou l'entrée de l'icône).
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
/* ⚠⚠ PLUS AUCUN LANCEMENT DE PROCESSUS ICI (2026-09-08). Il y avait un `spawn`
   — et tout un commentaire pour expliquer pourquoi ce n'était pas `execFile` (les
   tuyaux d'`execFile` gardent l'enfant attaché au parent sous Windows, donc le
   veilleur mourait avec l'application, signalé le 2026-09-06). Cette explication
   était juste et elle n'a plus d'objet : il n'y a plus d'enfant à détacher.
   ⚠ NE PAS RÉINTRODUIRE UN `spawn` ICI. C'est précisément ce chemin — relancer
   le binaire depuis l'icône — qui ne faisait RIEN chez lui le 2026-09-08. */

/* ⚠⚠ PLUS DE JETON À CONFIGURER — RETIRÉ LE 2026-09-06, SUR SA DEMANDE.
   Ses mots : « je ne veux pas de jeton configuré côté poste pour le veilleur, il
   faut considérer que ce dernier pourra être installé aussi par nos employés et
   ça doit être simple ». Il a raison, et c'était le défaut de conception qui a
   produit les trois signalements précédents : un secret à poser sur chaque poste
   est une consigne à transmettre, un secret qui circule, et un employé bloqué le
   jour où il ne l'a pas.
   Le veilleur est LE MÊME EXÉCUTABLE que l'administration : il porte déjà la clé
   d'application, celle du canal de mise à jour. Il s'en sert. Aucun geste à
   l'installation, aucun fichier chiffré à partager entre deux processus — et
   toute la mécanique de racine partagée (`--racine`, `veilleur-secret.js`)
   disparaît avec le besoin qui l'avait fait naître. */
const { APP_KEY } = require('./cle-app');
// La DÉCISION du curseur vit à part, sans Electron, pour être éprouvable —
// même patron que `brouillon-garde.js`. Voir son en-tête : c'est la pièce dont
// l'erreur est muette.
const { curseurSuivant, aAnnoncer } = require('./veilleur-curseur');
/* ⚠ `demarrage-auto` N'EST PLUS REQUIS ICI (2026-09-08) : la bascule « Démarrer
   le veilleur avec Windows » et son entrée de registre propre existaient parce
   que DEUX processus voulaient deux entrées sous deux noms. Il n'y en a plus
   qu'un — c'est le « Démarrer avec Windows » de l'APPLICATION qui décide, et il
   vit dans main.js. Le module, lui, garde `VEILLEUR` : voir plus bas. */

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
// ⚠ DEPUIS LE 2026-09-08, C'EST LE DOSSIER DE L'ADMINISTRATION — il n'y a plus
// qu'un processus, donc plus de sous-dossier. `attacher()` reprend l'ancien
// fichier (`userData/veilleur/veilleur-etat.json`) s'il existe : sans ça, une
// pause en cours serait silencieusement oubliée et la veille repartirait toute
// seule, ce qui est le pire résultat possible pour un réglage de pause.
// ⚠ AUCUN SECRET ICI, ET IL N'Y EN A PLUS NULLE PART : depuis le 2026-09-06 le
// veilleur s'authentifie par la clé de l'application, embarquée. Ce fichier ne
// porte qu'un curseur, un numéro de processus et un horodatage.
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
/* ⚠⚠ RÉÉCRITE LE 2026-09-08, ET C'EST LE DÉFAUT QU'IL A SIGNALÉ. Elle faisait
   `spawn(process.execPath)` : relancer le binaire dans un SECOND processus en
   espérant que le verrou d'instance unique de l'administration ramène sa fenêtre
   au premier plan. Chez lui, ni le double-clic ni l'entrée du menu ne faisaient
   RIEN — et c'est le genre de panne qu'on ne peut pas diagnostiquer d'ici : un
   lancement qui échoue silencieusement ne laisse aucune trace.
   ⚠ LA CORRECTION N'EST PAS DE MIEUX LANCER, C'EST DE NE PLUS LANCER. Attachée
   au processus de l'administration, cette fonction MONTRE la fenêtre qui existe
   déjà. Il n'y a plus de processus à créer, donc plus de lancement à réussir.
   ⚠ Le `spawn` de secours est parti AVEC elle : garder un chemin de repli vers
   un mécanisme dont on vient de prouver qu'il ne marche pas ne protège de rien.
   ⚠ Et si `_ouvrirHote` manquait (attacher jamais appelé), on ouvre le portail
   dans le navigateur plutôt que de ne rien faire : une entrée de menu muette est
   exactement le défaut dont on sort. */
function ouvrirAdministration() {
  if (_ouvrirHote) { try { _ouvrirHote(); return; } catch {} }
  try { shell.openExternal('https://adm.sandriza.com/'); } catch {}
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
  if (!APP_KEY) return { ok: false, motif: 'sans_cle' };

  const e = lireEtat();
  const u = new URL(URL_FLUX);
  if (e.depuis) u.searchParams.set('depuis', e.depuis);

  const ctrl = new AbortController();
  const chrono = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(u.toString(), {
      // ⚠ Le MÊME en-tête que `armAppHeader()` et que le canal de mise à jour.
      headers: { 'X-Sandriza-App': APP_KEY, 'Accept': 'application/json' },
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
function battre() {
  /* ⚠ ON ÉCRIT OÙ L'ON A CHERCHÉ LE JETON. Sans cette ligne, « jeton absent »
     d'un côté et « jeton enregistré » de l'autre est indécidable : les deux
     écrans disent vrai et rien ne dit qu'ils parlent de deux fichiers. Le coût
     est nul, et c'est exactement ce qui a manqué le 2026-09-06. */
  ecrireEtat({ pid: process.pid, vu: new Date().toISOString() });
}

async function unTour() {
  battre();
  if (!lireEtat().actif) return;

  const res = await interroger();
  if (!res.ok) {
    dernierEchec = res.motif;
    /* ⚠ ON N'ESPACE QUE SUR CE QUI PEUT S'ARRANGER TOUT SEUL. Un réseau absent,
       un serveur qui redémarre : oui. Une clé manquante ou refusée ne changera
       pas d'elle-même — marteler n'y sert à rien, et reculer jusqu'à dix minutes
       ferait juste attendre plus longtemps une réponse identique. On garde donc
       la cadence normale, et le menu dit la cause. */
    if (res.motif !== 'sans_cle') pasErreur++;
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
  // ⚠ « sans_cle » ne devrait jamais paraître : la clé est embarquée dans
  // l'application. Si elle manque, c'est la construction qui est en faute, pas
  // le poste — et il faut le DIRE plutôt que de laisser un veilleur muet.
  sans_cle: 'Cette version de l’application n’a pas de clé (défaut de construction)',
  refus: 'Le serveur a refusé cette version de l’application',
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
    /* ⚠ EN PREMIER APRÈS LE SÉPARATEUR, ET EN GRAS PAR DÉFAUT (`default: true`) :
       c'est le geste qu'on vient chercher neuf fois sur dix, et c'est aussi
       celui qui ne marchait pas. Windows met l'entrée par défaut en gras et
       l'associe au double-clic. */
    { label: 'Ouvrir l’administration', default: true, click: ouvrirAdministration },
    /* ⚠⚠ LA DÉCONNEXION EST ICI PARCE QU'IL L'A DEMANDÉE (2026-09-08) : « dans le
       menu contextuel de l'icône on devrait pouvoir se déconnecter ». Elle passe
       par la PAGE (`Admin._confirmLogout()` dans la fenêtre) — la confirmation
       existe parce qu'une déconnexion perd les brouillons ouverts, et un menu de
       zone de notification se clique par erreur encore plus facilement qu'un
       menu de fenêtre.
       ⚠ ELLE MONTRE LA FENÊTRE D'ABORD : poser une question dans une fenêtre
       cachée, c'est une application qui ne répond plus sans dire pourquoi. */
    ...(_deconnecterHote ? [{ label: 'Déconnexion…', click: () => { try { _deconnecterHote(); } catch {} } }] : []),
    { type: 'separator' },
    /* ⚠⚠ « QUITTER » QUITTE TOUT MAINTENANT, ET LE LIBELLÉ LE DIT. Avant, cette
       entrée faisait `app.exit(0)` sur un processus SÉPARÉ : elle ne tuait que la
       veille, l'administration continuait. Attachée, elle fermerait l'application
       entière — « Quitter le veilleur » serait donc devenu un mensonge, et le
       pire genre : celui qui fait perdre le travail en cours.
       ⚠ Elle passe par l'hôte, jamais par `app.exit(0)` : main.js doit pouvoir
       refuser (mise à jour en cours) et poser la question des brouillons. */
    { label: 'Quitter l’application', click: () => { if (_quitterHote) { try { _quitterHote(); } catch {} } } },
  ]);
  tray.setContextMenu(menu);
}

/* ⚠⚠ TROIS CHOSES SONT PARTIES D ICI LE 2026-09-08, avec le processus separe :
   • `demarrer()` — l entree du veilleur AUTONOME (verrou d instance,
     sous-dossier userData, sortie du Dock, son propre window-all-closed). Le
     mode ATTACHE, en bas de fichier, ne doit RIEN faire de tout ca : c est
     l administration qui tient le verrou, le dossier et la fermeture.
   • `demarrageAuto` / `poserDemarrageAuto` — la bascule << Demarrer le veilleur
     avec Windows >> et son entree de registre PROPRE. Elle existait parce que
     deux processus voulaient deux entrees sous deux noms differents. Il n y a
     plus qu un processus : c est le << Demarrer avec Windows >> de
     l APPLICATION qui decide, et il vit dans main.js.
   ⚠ `dem.VEILLEUR` RESTE dans demarrage-auto.js, expres : une entree de
   registre posee par une version anterieure doit pouvoir etre RETIREE. La
   supprimer du code laisserait le veilleur d hier demarrer avec Windows pour
   toujours, sans aucun moyen de l en empecher. */

/* ══ MODE ATTACHÉ — LA VEILLE DANS LE PROCESSUS DE L'ADMINISTRATION ═══════════
 * Sa demande du 2026-09-08 : « si on ferme l'application elle devrait se réduire
 * dans la zone de notification et se mettre en mode veille pour les commandes AU
 * LIEU DU VEILLEUR ».
 *
 * ⚠⚠ ET ÇA CORRIGE LE DÉFAUT QU'IL VENAIT DE SIGNALER, PAR DISPARITION DE SA
 * CAUSE. Depuis l'icône du veilleur, « Ouvrir l'administration » et le
 * double-clic ne faisaient RIEN chez lui. Les deux passaient par
 * `ouvrirAdministration()`, qui RELANCE LE BINAIRE par `spawn` — un second
 * processus, une seconde chance de rater. Attachée, l'icône appartient à
 * l'administration : « ouvrir » ne lance plus rien, elle MONTRE la fenêtre qui
 * est déjà là. Il n'y a plus de lancement à réussir.
 *
 * ⚠⚠ CE QUE CE MODE NE FAIT SURTOUT PAS, et c'est la moitié de sa correction :
 *  • PAS de `requestSingleInstanceLock` — l'administration détient déjà le sien,
 *    et le redemander ferait quitter le processus qui nous héberge ;
 *  • PAS de `app.setPath('userData', …/veilleur)` — le sous-dossier séparé
 *    n'avait de sens qu'entre DEUX processus. C'est lui qui avait engendré la
 *    racine partagée, le fichier chiffré et la surveillance de dossier de la
 *    26ᵉ séance, et sa disparition est le vrai gain de ce changement ;
 *  • PAS de `window-all-closed` — main.js le tient, et deux gestionnaires qui
 *    décident de la même chose finissent par se contredire.
 *
 * ⚠ LE FICHIER D'ÉTAT CHANGE DE PLACE, DONC ON REPREND L'ANCIEN. `cheminEtat()`
 * lit `userData`, qui n'est plus le sous-dossier : sans reprise, une pause en
 * cours serait silencieusement oubliée et la veille repartirait toute seule.
 */
let _ouvrirHote = null;   // montrer la fenêtre de l'administration
let _quitterHote = null;  // quitter POUR DE VRAI (pas seulement fermer)
let _deconnecterHote = null;

/* Reprise de l'état laissé par l'ancien processus séparé. On ne l'écrase pas
   s'il existe déjà à la nouvelle place : une reprise ne doit jamais défaire un
   réglage plus récent. */
function _reprendreEtatSepare() {
  try {
    const neuf = cheminEtat();
    if (fs.existsSync(neuf)) return;
    const ancien = path.join(app.getPath('userData'), 'veilleur', 'veilleur-etat.json');
    if (!fs.existsSync(ancien)) return;
    fs.mkdirSync(path.dirname(neuf), { recursive: true });
    fs.copyFileSync(ancien, neuf);
  } catch {}
}

function attacher(hote) {
  _ouvrirHote = (hote && hote.ouvrir) || null;
  _quitterHote = (hote && hote.quitter) || null;
  _deconnecterHote = (hote && hote.deconnecter) || null;

  _reprendreEtatSepare();
  etat = null;   // force la relecture depuis la nouvelle place

  let img = nativeImage.createFromPath(ICON_PATH);
  try { if (!img.isEmpty()) img = img.resize({ width: 16, height: 16 }); } catch {}
  tray = new Tray(img);
  majTray();
  // Double-clic : le geste que tout le monde essaie en premier, et celui qui ne
  // marchait pas. Il montre la fenêtre, il ne lance plus rien.
  tray.on('double-click', ouvrirAdministration);

  ordonnancer();
  unTour().catch(() => {});
  return tray;
}

module.exports = { attacher };
