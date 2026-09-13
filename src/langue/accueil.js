'use strict';

/*
 * PAGE D ACCUEIL — les deux langues
 * =============================================================================
 * ⚠⚠⚠ TOUT CE QUI SE TAPE ICI EST LU PAR LA CLIENTE, SUR LA PAGE D ACCUEIL DE LA
 * BOUTIQUE : le texte chapeau, le titre, le sous-titre, le texte des boutons et
 * leur lien. Ce sont des DONNEES. Ce dictionnaire ne traduit QUE les etiquettes
 * des champs, jamais leur contenu — et il n y met aucun exemple de contenu.
 *
 * ⚠⚠ LA LIGNE QUI EXPLIQUE LES TROIS GESTES est la seule aide de l ecran :
 * « ↑ ↓ pour réorganiser · l’œil masque un bloc SANS LE SUPPRIMER · le crayon
 * modifie le contenu. » Le milieu compte : masquer n est pas supprimer.
 *
 * ⚠⚠ LES NOMS DES BLOCS (`label`, `desc`, `icon`) ET LES NOMS DE DEGRADES
 * viennent du coeur : ils ne passent pas par ici. Les identifiants de bloc
 * (`hero`, `banner`) et les valeurs d effet (`fade`, `slide`, `zoom`) sont des
 * valeurs.
 *
 * ⚠ LES NOMS ANGLAIS DES TROIS EFFETS RESTENT ENTRE PARENTHESES : « Fondu
 * (Fade) » devient « Fade » tout court en anglais — le mot entre parentheses
 * etait la pour qui connait le terme anglais, il n a plus de raison d etre.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Page d’accueil — Administration Sandriza': 'Home page — Sandriza Administration',
  'Page d’accueil': 'Home page',
  'Réinitialiser': 'Reset',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can view, not change.',
  'Chargement du tableau de bord': 'Loading the dashboard',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  /* ⚠ L apostrophe DROITE : la source ecrit ces trois-la entre guillemets
     doubles. */
  "L'administration n'est pas encore chargée dans la fenêtre principale.":
    'The administration is not loaded yet in the main window.',
  "La fenêtre principale n'a pas répondu à temps.": 'The main window did not answer in time.',
  "L'opération a échoué.": 'The operation failed.',

  /* ── L ORDRE ET LA VISIBILITE ───────────────────────────────────────────── */
  'Ordre et visibilité': 'Order and visibility',
  /* ⚠⚠ MASQUER N EST PAS SUPPRIMER. */
  '↑ ↓ pour réorganiser · l’œil masque un bloc sans le supprimer · le crayon modifie le contenu.':
    '↑ ↓ to reorder · the eye hides a block without deleting it · the pencil changes the content.',
  '(masqué)': '(hidden)',
  'Modifier': 'Edit',
  'Masquer': 'Hide',
  'Afficher': 'Show',

  /* ══ L EDITEUR — DES ETIQUETTES, JAMAIS LEUR CONTENU ═══════════════════════ */
  'Modifier : ': 'Edit: ',
  'Modifier :': 'Edit:',
  '← Retour': '← Back',
  'Enregistrer': 'Save',
  'Annuler': 'Cancel',
  'Enregistrer Annuler': 'Save Cancel',

  /* ── LE CARROUSEL ───────────────────────────────────────────────────────── */
  'Effet de transition': 'Transition effect',
  /* ⚠ Le nom anglais entre parentheses disparait en anglais : il servait a qui
     connait le terme, et le terme EST le libelle. */
  'Fondu (Fade)': 'Fade',
  'Glissement (Slide)': 'Slide',
  'Zoom (Ken Burns)': 'Zoom (Ken Burns)',
  'Intervalle (secondes)': 'Interval (seconds)',
  'Lecture automatique': 'Autoplay',
  'Diapos ': 'Slides ',
  'Diapos (': 'Slides (',
  'Diapo ': 'Slide ',
  '+ Ajouter une diapo': '+ Add a slide',
  'Aucune diapo.': 'No slide.',
  /* ⚠⚠⚠ « Nouvelle diapo » ET « Découvrir » N ONT PAS DE CLE ICI, ET C EST LE
     POINT : ce sont les valeurs PAR DEFAUT d une diapo neuve, ecrites dans la
     configuration et LUES PAR LA CLIENTE sur la page d accueil. Elles sont
     declarees dans `var SZ_DONNEES` de la fenetre, et banc-langue-donnees refuse
     qu elles reviennent ici. */

  /* ── LES CHAMPS D UNE DIAPO ─────────────────────────────────────────────── */
  'Image URL (vide = dégradé)': 'Image URL (empty = gradient)',
  'Dégradé de fond': 'Background gradient',
  'Opacité du voile noir (0 = aucun, 0.7 = sombre)':
    'Black veil opacity (0 = none, 0.7 = dark)',
  'Texte chapeau': 'Kicker text',
  'Titre principal': 'Main title',
  'Titre': 'Title',
  'Titre de section': 'Section title',
  'Sous-titre': 'Subtitle',
  'Bouton 1 — Texte': 'Button 1 — Text',
  'Bouton 1 — Lien': 'Button 1 — Link',
  'Bouton 2 — Texte (opt.)': 'Button 2 — Text (opt.)',
  'Bouton 2 — Lien': 'Button 2 — Link',
  'Bouton — Texte': 'Button — Text',
  'Bouton — Lien': 'Button — Link',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Réinitialisation…': 'Resetting…',
  'Page d’accueil enregistrée.': 'Home page saved.',
  'Blocs réinitialisés.': 'Blocks reset.',
  'Une modification de ce bloc': 'A change to this block',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Diapo': 'Slide'
};
