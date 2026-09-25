'use strict';
/* ══ À LA DÉCONNEXION, AUCUN ÉCRAN DE DONNÉES NE SURVIT (2026-09-25) ══════════
   Sa capture : une « Fiche client » native restée ouverte PAR-DESSUS l'écran de
   connexion, nom, courriel, téléphone et adresse lisibles. Ses mots : « tu dois
   fermer les fenêtres en cours au moment de la déconnexion, cela ne devrait
   jamais arriver ».
   La chaîne a TROIS maillons, dans deux dépôts ; qu'un seul manque, et le défaut
   revient sans que rien ne le dise — aucune erreur, juste une fenêtre de trop :
     1. `Staff.clearSession()` (site, staff.js) appelle `sandrizaDesktop.sessionFermee()` ;
     2. le préchargement de la page (src/preload.js) l'expose et envoie `session:fermee` ;
     3. la coquille (src/main.js) écoute ce canal, de la seule fenêtre principale,
        et `_fermerFenetresDeSession` DÉTRUIT fenêtres natives et vues ancrées.
   Le 3 est éprouvé POUR DE VRAI : la fonction est extraite de main.js et
   exécutée sur de fausses fenêtres — une fenêtre retenue par le garde de
   brouillon (close refusé), une vue détachée, une vue ancrée, les notes. */
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');
/* ⚠ LES FINS DE LIGNE SONT NORMALISEES A LA LECTURE (2026-09-25). La machine de
   construction Windows extrait le depot en CRLF : les motifs ecrits avec un
   saut de ligne n y trouvaient plus rien, et ce banc a bloque la construction
   de la 6.21 alors qu il passait sur le poste. */
const lire = (f) => fs.readFileSync(f, 'utf8').split(String.fromCharCode(13)).join('');
const MAIN = lire(path.join(RACINE, 'src', 'main.js'));
const PRE = lire(path.join(RACINE, 'src', 'preload.js'));
const STAFF = path.join(RACINE, '..', 'sandriza', 'assets', 'js', 'staff.js');

let fautes = 0;
const ok = (c, t) => { console.log((c ? '  OK   ' : '  NON  ') + t); if (!c) fautes++; };

// ── 2. le préchargement ──────────────────────────────────────────────────────
ok(/sessionFermee\s*:\s*\(\)\s*=>\s*\{[^}]*ipcRenderer\.send\(\s*'session:fermee'\s*\)/.test(PRE),
  'preload.js expose sessionFermee() et envoie session:fermee');

// ── 3. la coquille : le canal ────────────────────────────────────────────────
const canal = MAIN.match(/ipcMain\.on\('session:fermee',\s*\(e\)\s*=>\s*\{([\s\S]*?)\n\}\);/);
ok(!!canal, 'main.js écoute session:fermee');
ok(!!canal && /_deLaPrincipale\(e\)/.test(canal[1]) && /_fermerFenetresDeSession\(\)/.test(canal[1]),
  'le canal n accepte que la fenêtre principale, et ferme tout');

// ── 3. la coquille : la fermeture, exécutée ──────────────────────────────────
const m = MAIN.match(/const FENETRES_HORS_SESSION = new Set\(\[[^\]]*\]\);\nfunction _fermerFenetresDeSession\(\)\{[\s\S]*?\n\}\n/);
ok(!!m, '_fermerFenetresDeSession et sa liste d exceptions sont trouvées');
if (m) {
  const fenetre = (retenue) => ({
    detruite: false, fermee: false,
    isDestroyed() { return this.detruite; },
    destroy() { this.detruite = true; },
    close() { if (!retenue) this.detruite = true; this.fermee = true; },   // le garde de brouillon RETIENT
  });
  const fenetresNatives = new Map([
    ['client:42', fenetre(true)], ['commandes', fenetre(false)], ['pos-client', fenetre(false)], ['notes', fenetre(false)],
  ]);
  const vueDetachee = { webContents: { ferme: false, close() { this.ferme = true; } } };
  const vueAncree = { webContents: { ferme: false, close() { this.ferme = true; } } };
  const fenDet = fenetre(false);
  const ancrees = new Map([['clients', { view: vueDetachee, fenetre: fenDet }], ['inventaire', { view: vueAncree, fenetre: null }]]);
  const retirees = [];
  const mainWindow = { isDestroyed: () => false, contentView: { removeChildView: (v) => retirees.push(v) } };
  const client = fenetresNatives.get('client:42'), notes = fenetresNatives.get('notes');
  let ancreeVisible = 'inventaire', vueVoilee = 'x';
  const journal = [];
  const cnxDire = (t) => journal.push(t);
  // eslint-disable-next-line no-new-func
  const f = new Function('fenetresNatives', 'ancrees', 'mainWindow', 'cnxDire', 'etat',
    m[0].replace(/ancreeVisible = null; vueVoilee = null;/, 'etat.av = null; etat.vv = null;')
    + '\nreturn _fermerFenetresDeSession();');
  const etat = { av: ancreeVisible, vv: vueVoilee };
  let n = -1, erreur = null;
  try { n = f(fenetresNatives, ancrees, mainWindow, cnxDire, etat); } catch (e) { erreur = e; }
  ok(!erreur, 'la fonction s exécute sans lever' + (erreur ? ' (' + erreur.message + ')' : ''));
  ok(client.detruite, 'une fiche RETENUE par le garde de brouillon est détruite quand même');
  ok(!client.fermee, 'on DÉTRUIT, on ne passe pas par close (qui poserait la question du brouillon)');
  ok(!fenetresNatives.has('commandes') && !fenetresNatives.has('pos-client') && !fenetresNatives.has('client:42'),
    'le registre des fenêtres natives est vidé (écran client du comptoir compris)');
  ok(fenetresNatives.has('notes') && !notes.detruite, 'les notes de version (aucune donnée) restent');
  ok(fenDet.detruite, 'une vue DÉTACHÉE : sa fenêtre est détruite');
  ok(retirees.indexOf(vueAncree) >= 0 && vueAncree.webContents.ferme, 'une vue ANCRÉE : retirée de la fenêtre principale et fermée');
  ok(ancrees.size === 0 && etat.av === null, 'plus aucune vue ancrée ni visible');
  ok(n === 5 && journal.length === 1, 'la fermeture se compte et se journalise (' + n + ')');
}

// ── 1. le site ───────────────────────────────────────────────────────────────
if (!fs.existsSync(STAFF)) {
  console.log('  --   staff.js introuvable (dépôt du site absent) : le maillon 1 n est PAS vérifié ici.');
} else {
  const st = lire(STAFF);
  const cs = st.match(/const clearSession = \(\) => \{([\s\S]*?)\n  \};/);
  ok(!!cs, 'staff.js : clearSession est trouvée');
  ok(!!cs && /sandrizaDesktop\.sessionFermee\(\)/.test(cs[1]) && /typeof window\.sandrizaDesktop\.sessionFermee === 'function'/.test(cs[1]),
    'clearSession prévient la coquille (garde typeof pour une coquille plus ancienne)');
}

if (fautes) {
  console.log('\n>>> ' + fautes + ' faute(s) — une fenêtre de données pourrait survivre à la déconnexion');
  process.exit(1);
}
console.log('\n>>> à la déconnexion, aucun écran de données ne survit');
