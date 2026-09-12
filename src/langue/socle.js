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
  /* ⚠⚠ ET LES MEMES MOTS SANS LEUR PICTOGRAMME, parce que la SOURCE les ecrit
     autrement : `b.textContent = '\\u29c9 Detacher'`. Le signe y est un
     ECHAPPEMENT, et le poseur ne decode que les lettres latines accentuees —
     un `\\u29c9` decode au hasard casserait des echappements techniques. La cle
     « ⧉ Detacher » (avec le vrai signe) ne correspondait donc a rien dans la
     source, pendant que le COMPTEUR, qui lit la page rendue, la voyait decidee.
     Mesure du 2026-09-12 : ce bouton restait en francais dans TOUTES les
     fenetres declarees traduites. */
  'Détacher': 'Detach',
  'Ancrer': 'Dock',
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

  /* ── LES BOUTONS D UN FORMULAIRE, ET LE FIL D ETAPES ─────────────────── */
  'Précédent': 'Back',
  'Suivant': 'Next',
  'Annuler': 'Cancel',
  'Enregistrer': 'Save',
  'Aucun résultat.': 'No result.',
  'Remplissez ce champ pour continuer.': 'Fill in this field to continue.',
  /* ⚠ Ces trois-la encadrent un NOM D ETAPE : « Terminez l etape « X » pour
     continuer. » On garde les guillemets francais du gabarit, le nom vient du
     code de la fenetre. */
  'Terminez l’étape «': 'Finish the «',
  '» pour continuer.': '» step to continue.',
  'Il manque un renseignement à l’étape «': 'Something is missing in the «',

  /* ── LES REFUS QUI VIENNENT DU PONT (suite) ──────────────────────── */
  'Votre rôle ne donne pas accès à cette opération.': 'Your role does not give access to this operation.',
  'La fenêtre principale n’a pas répondu à temps. Réessayez ; si cela persiste, rechargez-la (Ctrl+R).':
    'The main window did not answer in time. Try again; if it persists, reload it (Ctrl+R).',
  'Cette fiche n’existe plus.': 'This record no longer exists.',
  'Le nom est obligatoire.': 'A name is required.',
  'Le dépôt de l’image a échoué. Rien n’a été enregistré.':
    'The image upload failed. Nothing was saved.',
  'Fiche ouverte par quelqu’un d’autre.': 'Record open by someone else.',
  'La photothèque n’a pas pu être chargée dans la fenêtre principale. Rechargez-la (Ctrl+R) ; si le message revient, la session du personnel a peut-être expiré — reconnectez-vous.':
    'The photo library could not be loaded in the main window. Reload it (Ctrl+R); if the message comes back, the staff session may have expired — sign in again.',

  /* ── LES VERROUS, VUS DEPUIS LA FENETRE ────────────────────────── */
  'Section verrouillée en modification par :': 'Section locked for editing by:',
  'quelqu’un d’autre': 'someone else',
  'Consultation seulement — votre rôle ne permet pas d’enregistrer.':
    'View only — your role does not allow saving.',

  /* ── LA SAISIE EN COURS, EN ENTIER ──────────────────────────── */
  'Vous avez une saisie en cours': 'You have an entry in progress',
  'Conservée, elle vous sera proposée à la réouverture de cette fenêtre.':
    'If you keep it, it will be offered again when you reopen this window.',
  'Jetée, elle est perdue.': 'If you discard it, it is lost.',
  'Jeter la saisie': 'Discard the entry',
  'Revenir au formulaire': 'Back to the form',
  'Conserver le brouillon': 'Keep the draft',
  'a été laissée en cours': 'was left in progress',
  '. La reprendre, ou repartir à neuf ?': '. Resume it, or start over?',
  'Un brouillon disparaît de lui-même après': 'A draft disappears on its own after',
  'heures, et il est jeté dès que la fiche est enregistrée.':
    'hours, and it is discarded as soon as the record is saved.',
  'Cette saisie est trop volumineuse pour etre gardee en brouillon (images). Enregistrez pour ne rien perdre.':
    'This entry is too large to keep as a draft (images). Save it so nothing is lost.',
  'Le brouillon n’a pas pu être conservé (stockage du poste plein).':
    'The draft could not be kept (this computer’s storage is full).',
  'Une saisie': 'An entry',
};
