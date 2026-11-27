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
  'Glisser pour déplacer': 'Drag to move',
  'Glissez un bloc (ou ↑ ↓) pour réorganiser · l’œil masque un bloc sans le supprimer · le crayon modifie le contenu.': 'Drag a block (or ↑ ↓) to reorder · the eye hides a block without deleting it · the pencil edits its content.',
  'Aperçu': 'Preview',
  'Aperçu de la page d’accueil': 'Home page preview',
  'Vêtements': 'Clothing',
  'Nouveautés': 'New arrivals',
  'Soldes': 'Sale',
  'Pied de page de la boutique': 'Shop footer',
  'Un schéma de la page, dans l’ordre des blocs : les blocs masqués n’y paraissent pas.': 'A sketch of the page in block order: hidden blocks do not appear.',
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Page d’accueil — Administration Sandriza': 'Home page — Sandriza Administration',
  'Page d’accueil': 'Home page',
  'Réinitialiser': 'Reset',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can view, not change.',
  'Chargement du tableau de bord': 'Loading the dashboard',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  /* (2026-10-25, audit) Apostrophe typographique, comme dans toutes les autres fenetres. */
  'L’administration n’est pas encore chargée dans la fenêtre principale.':
    'The administration is not loaded yet in the main window.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not answer in time.',
  'L’opération a échoué.': 'The operation failed.',

  /* ── L ORDRE ET LA VISIBILITE ───────────────────────────────────────────── */
  'Ordre et visibilité': 'Order and visibility',
  /* ⚠⚠ MASQUER N EST PAS SUPPRIMER. */
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
  'Diapo': 'Slide',
  "Supprimer": "Delete",
  // 2026-10-15 : confirmations en boîte à part.
  "Réinitialiser la page d’accueil": "Reset the home page",
  "Tous les blocs de la page d’accueil seront remplacés par la configuration par défaut. Les blocs et diapositives actuels seront perdus. Cette action est irréversible.": "All home page blocks will be replaced with the default configuration. The current blocks and slides will be lost. This action cannot be undone.",
  "Réinitialiser les blocs": "Reset the blocks",

  // ── Bannières des saisons (2026-11-27) ──
  '(au moins 1600 × 900)': '(at least 1600 × 900)',
  's (de 4 à 8 secondes)': 's (4 to 8 seconds)',
  '+ Ajouter un plan': '+ Add a shot',
  'Accessoires': 'Accessories',
  'Affichée aujourd’hui': 'Showing today',
  'Anglais': 'English',
  'Automne': 'Autumn',
  'Bannières des saisons': 'Seasonal banners',
  'Bannières des saisons enregistrées.': 'Seasonal banners saved.',
  'Bouton 1 — mène à': 'Button 1 — goes to',
  'Bouton 1 — texte': 'Button 1 — text',
  'Bouton 2 — mène à': 'Button 2 — goes to',
  'Bouton 2 — texte': 'Button 2 — text',
  'Chaque bannière paraît toute seule une semaine avant sa saison, chaque année. Les textes sont posés par la page, jamais dans la vidéo : ils suivent la langue du visiteur.': 'Each banner appears on its own one week before its season, every year. The text is set by the page, never inside the video: it follows the visitor’s language.',
  'Chaussures': 'Shoes',
  'Côté du texte': 'Text side',
  'Envoi de la vidéo…': 'Uploading the video…',
  'Envoi de l’image fixe…': 'Uploading the still image…',
  'Format demandé : MP4 (H.264), format large 16:9, au moins 1600 × 900, de 4 à 8 secondes, 5 Mo au plus ; le son est ignoré. Le fichier est vérifié avant l’envoi.': 'Required format: MP4 (H.264), 16:9 widescreen, at least 1600 × 900, 4 to 8 seconds, 5 MB at most; sound is ignored. The file is checked before it is sent.',
  'Français': 'French',
  'Hauts': 'Tops',
  'Hiver': 'Winter',
  'Jupes': 'Skirts',
  'Les changements faits aux bannières des saisons ne sont pas enregistrés. Ils seront perdus.': 'The changes made to the seasonal banners are not saved. They will be lost.',
  'Les textes et les plans changés pour cette saison seront remplacés par ceux d’origine, une fois enregistré.': 'The text and shots changed for this season will be replaced by the originals once saved.',
  'Manteaux': 'Coats',
  '(5 Mo au plus)': '(5 MB at most)',
  'Modifications non enregistrées': 'Unsaved changes',
  'Mot en italique doré (pris dans le titre)': 'Word in gold italics (taken from the title)',
  'Où est la personne ?': 'Where is the person?',
  'Où est la personne ? (cadrage tablette et téléphone)': 'Where is the person? (tablet and phone framing)',
  'Pantalons': 'Trousers',
  'Paraît le ': 'Appears on ',
  'Plan ': 'Shot ',
  'Plan ajouté à la bannière. Enregistrez pour le publier.': 'Shot added to the banner. Save to publish it.',
  'Printemps': 'Spring',
  'Quitter sans enregistrer': 'Leave without saving',
  'Remplacer': 'Replace',
  'Revenir à la bannière d’origine': 'Restore the original banner',
  'Revenir à l’origine': 'Restore the original',
  'Robes': 'Dresses',
  'Surtitre': 'Overline',
  'Textes :': 'Text:',
  'Toute la boutique': 'The whole shop',
  'Vidéo refusée : ': 'Video refused: ',
  'Vérification de la vidéo…': 'Checking the video…',
  'août': 'August',
  'avril': 'April',
  'ce n’est pas un MP4': 'it is not an MP4',
  'ce que voit un téléphone': 'what a phone shows',
  'ce que voit une tablette en portrait': 'what a portrait tablet shows',
  'décembre': 'December',
  'février': 'February',
  'janvier': 'January',
  'juillet': 'July',
  'juin': 'June',
  'la vidéo ne se lit pas (codec H.264 attendu)': 'the video cannot be read (H.264 codec expected)',
  'le format n’est pas 16:9': 'the format is not 16:9',
  'mai': 'May',
  'mars': 'March',
  'novembre': 'November',
  'octobre': 'October',
  'septembre': 'September',
  'À droite (personne à gauche)': 'On the right (person on the left)',
  'À gauche (personne à droite)': 'On the left (person on the right)',
  'Été': 'Summer',
};
