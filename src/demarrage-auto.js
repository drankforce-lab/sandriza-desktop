'use strict';

/*
 * « DÉMARRER AVEC WINDOWS » — UNE SEULE IMPLÉMENTATION, DEUX ENTRÉES
 * =============================================================================
 * Sorti de `main.js` le jour où le VEILLEUR a eu besoin de la même chose. Il y
 * avait deux façons de s'y prendre, et une seule est défendable :
 *
 *   ✗ Recopier les quinze lignes dans `veilleur.js`. Ce dépôt s'est déjà brûlé
 *     deux fois sur des TABLES JUMELLES tenues à la main (les plafonds du pont,
 *     le jeton Turso recopié dans 27 fichiers dont 2 oubliés à la rotation). La
 *     copie ne diverge pas le jour où on l'écrit ; elle diverge six mois plus
 *     tard, et en silence.
 *   ✓ Un module, deux appels, deux NOMS d'entrée.
 *
 * ══⚠⚠ CE QUE CE FICHIER SAIT ET QU'IL NE FAUT PAS PERDRE ════════════════════
 * `app.setLoginItemSettings` NE POSE RIEN sur le poste de l'utilisateur.
 * Constaté le 2026-08-20 (« a corriger, cela ne marche pas ») : aucune entrée
 * Sandriza sous HKCU\…\CurrentVersion\Run alors que d'autres applications y
 * étaient. Piste retenue : Sandboxie-Plus, installé là, virtualise les écritures
 * registre.
 *
 * ⚠⚠ ET LE PIRE N'ÉTAIT PAS L'ÉCHEC, C'ÉTAIT LE `catch {}` VIDE qui l'entourait.
 * La bascule rendait la main sans un mot, réussie ou non, et le menu relisait un
 * état qui n'avait pas bougé. Une commande morte, parfaitement silencieuse.
 * D'où la règle de ce module, et elle vaut pour les deux entrées :
 *   1. on demande à Electron ;
 *   2. ON RELIT pour savoir si ça a pris ;
 *   3. si non, on écrit l'entrée nous-mêmes avec `reg.exe` ;
 *   4. on relit ENCORE ;
 *   5. on rend un verdict qui DIT ce qui s'est passé — jamais un booléen nu.
 *
 * ⚠ LA LECTURE CONSULTE LES DEUX SOURCES. Quand le repli a écrit l'entrée,
 * `getLoginItemSettings` peut très bien continuer à répondre « non » : ne lire
 * qu'Electron ferait une coche qui se relève toute seule au redémarrage.
 *
 * ⚠⚠ POURQUOI LE `nom` EST UN PARAMÈTRE ET NON UNE CONSTANTE. L'administration
 * et le veilleur sont LE MÊME EXÉCUTABLE, lancé avec des arguments différents.
 * Sans deux noms d'entrée distincts, chacun écraserait celui de l'autre : cocher
 * « démarrer le veilleur » décocherait silencieusement l'administration. Deux
 * entrées, deux noms — c'est la seule raison d'être de ce paramètre.
 */

const { app } = require('electron');
const { execFileSync } = require('child_process');

const CLE = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';

const _reg = (args) => {
  try {
    return { ok: true, sortie: execFileSync('reg', args, { encoding: 'utf8', windowsHide: true }) };
  } catch (e) {
    return { ok: false, sortie: String((e && e.stdout) || (e && e.message) || '') };
  }
};

const _dansRegistre = (nom) => {
  if (process.platform !== 'win32') return false;
  const r = _reg(['query', CLE, '/v', nom]);
  return r.ok && r.sortie.indexOf(nom) >= 0;
};

/**
 * @param {string} nom  le nom de l'entrée (distinct par programme)
 * @param {string[]} [args] les arguments — sert à distinguer les deux entrées
 *                    du MÊME exécutable auprès d'Electron.
 */
function etat(nom, args) {
  let parElectron = false;
  try {
    // ⚠ `name` est ce qui permet à Electron de ne pas confondre les deux
    // entrées du même binaire. Sans lui, il répond pour « l'application ».
    const o = args ? { name: nom, path: process.execPath, args } : { name: nom };
    parElectron = !!app.getLoginItemSettings(o).openAtLogin;
  } catch (e) { /* macOS/Linux, ou une version qui ignore `name` */ }
  return parElectron || _dansRegistre(nom);
}

/**
 * @returns {{ok:boolean, actif:boolean, par?:string, detail?:string}}
 *   `ok` dit si l'état VOULU a été atteint — vérifié par relecture, jamais
 *   supposé. `detail` porte la première ligne de l'erreur de `reg.exe` quand il
 *   y en a une : c'est elle qui nomme la cause à l'écran.
 */
function poser(nom, args, vouloir) {
  const on = !!vouloir;
  const arguments_ = Array.isArray(args) ? args : [];
  try {
    app.setLoginItemSettings({ name: nom, openAtLogin: on, path: process.execPath, args: arguments_ });
  } catch (e) { /* on ne s'arrête pas là : le repli suit */ }
  if (etat(nom, arguments_) === on) return { ok: true, actif: on, par: 'electron' };
  if (process.platform !== 'win32') return { ok: false, actif: etat(nom, arguments_), detail: '' };

  /* Le repli. On écrit le chemin de l'exécutable EN COURS, ENTRE GUILLEMETS :
     sans eux, un chemin à espaces (« Program Files », « Administration
     Sandriza.exe ») ferait chercher à Windows un programme nommé « C:\Program ».
     ⚠ Les arguments vont DANS la même chaîne, APRÈS le guillemet fermant — un
     `--veilleur` glissé à l'intérieur ferait partie du nom du fichier. */
  const commande = '"' + process.execPath + '"' + (arguments_.length ? ' ' + arguments_.join(' ') : '');
  const r = on
    ? _reg(['add', CLE, '/v', nom, '/t', 'REG_SZ', '/d', commande, '/f'])
    : _reg(['delete', CLE, '/v', nom, '/f']);
  if (etat(nom, arguments_) === on) return { ok: true, actif: on, par: 'registre' };
  return {
    ok: false,
    actif: etat(nom, arguments_),
    detail: String(r.sortie || '').trim().split('\n')[0] || '',
  };
}

// Les deux entrées du dépôt, nommées ICI pour qu'on ne les invente pas deux fois.
const ADMIN = { nom: 'Administration Sandriza', args: [] };
const VEILLEUR = { nom: 'Veilleur Sandriza', args: ['--veilleur'] };

module.exports = { etat, poser, ADMIN, VEILLEUR, CLE };
