'use strict';

/*
 * LE DICTIONNAIRE DU SOCLE — ce que TOUTES les fenetres disent
 * =============================================================================
 * ⚠⚠ CES PHRASES SONT ECRITES UNE FOIS DANS `socle.js` ET PARAISSENT DANS LES
 * 99 FENETRES. Mesure du 2026-09-12 : 28 textes, 1 978 occurrences — presque un
 * quart des 8 241 textes a traduire, dans un seul fichier. Les recopier dans
 * chaque dictionnaire aurait voulu dire 99 copies de la meme phrase, et le jour
 * ou l une change, 98 mensonges.
 *
 * ⚠ UNE FENETRE PEUT QUAND MEME REDEFINIR UN DE CES TEXTES : son dictionnaire
 * est regarde EN PREMIER (voir `index.js`). Un cas particulier doit pouvoir
 * gagner sans qu on touche au partage.
 *
 * ⚠ CE QUI EST TRADUIT ICI EST DE L INTERFACE, PAS DES DONNEES. Les noms de
 * produits, les notes et les adresses restent tels qu ils ont ete saisis.
 */

module.exports = {
  /* ── LA BARRE DE TITRE ET LES BOUTONS DE FENETRE ────────────────────────── */
  '⤡ Réduire': '⤡ Restore',
  '⛶ Plein écran': '⛶ Full screen',
  'Revenir à la taille normale': 'Back to normal size',
  'Occuper toute la fenêtre': 'Fill the whole window',
  'Quitter le plein écran': 'Exit full screen',
  'Plein écran — toute la fenêtre': 'Full screen — the whole window',
  '⧉ Détacher': '⧉ Detach',
  '⚓ Ancrer': '⚓ Dock',
  'Ouvrir cet écran dans sa propre fenêtre': 'Open this screen in its own window',
  'Ramener cet écran dans la fenêtre principale': 'Bring this screen back into the main window',

  /* ── LES VERROUS DE MODIFICATION ────────────────────────────────────────── */
  /* ⚠ « un collègue » est le repli quand le serveur ne nomme personne : il se
     glisse DANS « En traitement par … », d ou la minuscule. */
  'un collègue': 'a colleague',
  'Vous tenez cette fiche en modification': 'You have this record open for editing',
  'En traitement par': 'Being edited by',

  /* ── CE QUE LE PONT REPOND QUAND IL NE PEUT PAS ─────────────────────────── */
  /* ⚠⚠ CE SONT LES PHRASES QUE L ON VOIT LE JOUR OU RIEN NE MARCHE. Les laisser
     en francais dans une application anglaise, c est laisser le francais
     exactement la ou quelqu un cherche de l aide. */
  'La fenêtre principale ne répond pas.': 'The main window is not answering.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not answer in time.',
  'Erreur inattendue (': 'Unexpected error (',
  'Cette version de l’application ne connaît pas cette opération.':
    'This version of the application does not know this operation.',
  'L’opération a échoué.': 'The operation failed.',
  'L’administration n’est pas encore chargée dans la fenêtre principale.':
    'Administration is not loaded in the main window yet.',
  'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.':
    'No session is open in the application. Sign in from the main window.',
  'Aucune session ouverte. Connectez-vous dans la fenêtre principale.':
    'No session is open. Sign in from the main window.',
  'Votre rôle ne donne pas accès à la configuration.':
    'Your role does not give access to configuration.',

  /* ── L ATTENTE ET LA CONFIRMATION ───────────────────────────────────────── */
  'Chargement en cours': 'Loading',
  /* ⚠ « Confirmer ? » est le SECOND clic d une action destructrice : le bouton
     se change en cette question. « Confirm? » garde la meme longueur, donc le
     bouton ne saute pas sous le doigt au moment ou l on vise. */
  'Confirmer ?': 'Confirm?',

  /* ── LA SAISIE EN COURS (le brouillon) ──────────────────────────────────── */
  'Repartir à neuf': 'Start over',
  'Reprendre': 'Resume',
  'Une saisie non terminée': 'An unfinished entry',
  'Garder': 'Keep',
  'Jeter': 'Discard',
  'Revenir': 'Go back',
};
