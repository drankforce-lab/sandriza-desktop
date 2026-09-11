'use strict';

/*
 * LE MENU DE L'ÉCRAN DE CONNEXION, DANS LA LANGUE CHOISIE
 * =============================================================================
 * Sa demande du 2026-09-11 : « dans le changement de langue de la page de
 * connexion tu dois aussi traduire les menus, c'est important ».
 *
 * ⚠⚠ POURQUOI CE CODE A QUITTÉ `main.js` : il y vivait, et sa première version
 * ne traduisait QUE le premier niveau. Sa capture le montrait sans équivoque —
 * « View », « Help », et dessous « Recharger », « Plein écran », « Réduire ».
 * J'avais fait descendre la traduction dans les sous-groupes (`sub`) en oubliant
 * les ENTRÉES (`items`), qui sont pourtant le cas courant.
 * ⚠ TANT QUE C'ÉTAIT ENFOUI DANS `main.js`, AUCUN BANC NE POUVAIT L'ÉPROUVER :
 * il aurait fallu lancer Electron, ouvrir un panneau, et lire une autre fenêtre.
 * Sorti ici, il s'éprouve en trois lignes — et `tools/banc-menu-langue.js` lui
 * donne maintenant un modèle à trois niveaux et vérifie qu'AUCUN intitulé ne
 * reste en français.
 *
 * ➡ **UN MORCEAU DE LOGIQUE QU'ON NE PEUT PAS ÉPROUVER SANS LANCER TOUTE
 *   L'APPLICATION FINIT PAR N'ÊTRE ÉPROUVÉ PAR PERSONNE.** Le sortir n'est pas
 *   du rangement : c'est ce qui rend le contrôle possible.
 *
 * ⚠ LA TRADUCTION SE FAIT ICI ET PAS DANS LE SITE. Le menu appartient au site,
 * il est français partout ailleurs, et la traduction intégrale est le chantier
 * qu'il a demandé de garder pour la fin. Traduire à la source changerait le menu
 * de TOUTE l'application pour une demande qui ne porte que sur un écran.
 */

/* Les entrées LIBRES (celles qui paraissent avant toute session) et les trois
   menus qui les portent. `tools/banc-menu-langue.js` confronte cette table aux
   entrées que `appbar.js` marque `libre` — dans les deux sens. */
const MENU_EN = {
  'Fichier': 'File',
  'Affichage': 'View',
  'Aide': 'Help',
  'Quitter': 'Quit',
  'Recharger': 'Reload',
  'Recharger (vider le cache)': 'Reload (clear cache)',
  'Plein écran': 'Full screen',
  'Zoom avant': 'Zoom in',
  'Zoom arrière': 'Zoom out',
  'Zoom normal': 'Reset zoom',
  'Réduire': 'Minimize',
  'Vérifier les mises à jour…': 'Check for updates…',
  'À propos': 'About',
};

/** Un intitulé, traduit si la table le connaît. Sinon il reste tel quel : une
 *  entrée ajoutée demain s'affichera dans sa langue d'origine plutôt que de
 *  disparaître. C'est le banc qui refuse ce silence-là, pas le code. */
const trMenu = (x, langue) => {
  if (langue !== 'en') return x;
  return Object.prototype.hasOwnProperty.call(MENU_EN, x) ? MENU_EN[x] : x;
};

/** Un modèle de menu, traduit à TOUS ses niveaux.
 *  ⚠⚠ `items` ET `sub` : c'est l'oubli de `items` qui a produit un menu à
 *  moitié traduit en 5.28.0. Un parcours d'arbre qui ne suit qu'une branche sur
 *  deux n'est pas un parcours d'arbre. */
const trItems = (items, langue) => (items || []).map((it) => {
  if (!it || it.sep) return it;
  const n = { ...it, label: trMenu(it.label, langue) };
  if (it.items) n.items = trItems(it.items, langue);
  if (it.sub) n.sub = trItems(it.sub, langue);
  return n;
});

module.exports = { MENU_EN, trMenu, trItems };
