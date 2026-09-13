'use strict';

/*
 * MODELES PAR VUE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ DEUX BLOCS, DEUX CHOSES DIFFERENTES, ET LES CONFONDRE FAIT PERDRE DU
 * TEMPS. « Modèles par vue » = quatre angles fixes, une photo par angle, reprise
 * automatiquement a la generation IA de l editeur produit. « Mannequins
 * (habillage IA) » = une liste OUVERTE, la photo humaine que fal.ai habille.
 * Les titres doivent rester deux titres distincts dans les deux langues.
 *
 * ⚠⚠ LA PHRASE SUR LA CLE FAL.AI EST LA POUR EVITER UNE CHASSE : sans la cle,
 * l habillage refusera, et rien d autre ne le dit. Elle nomme aussi l endroit
 * exact — Configuration → Clés API — et ce chemin doit nommer les MEMES entrees
 * que le menu traduit, sinon il envoie dans le vide.
 *
 * ⚠⚠ CHAQUE DEPOT OU RETRAIT EST ENREGISTRE TOUT DE SUITE : il n y a pas de
 * bouton « Enregistrer ». Les verdicts (« Modèle enregistré. », « Mannequin
 * retiré. ») sont donc la SEULE confirmation qu il se passe quelque chose.
 *
 * ⚠ LE NOM D UN MANNEQUIN EST UNE DONNEE : il est enregistre et relu. Seul son
 * exemple (« Ana ») suit la langue du poste, parce qu il ne sort pas de
 * l administration.
 *
 * ⚠ LE LIBELLE D UN ANGLE (Face, Derrière, Gauche, Droit) VIENT DU COEUR : il
 * n est pas ecrit dans cette fenetre et ne peut pas etre atteint d ici.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Modèles par vue — Administration Sandriza':
    'Models by view — Sandriza Administration',
  'Modèles par vue': 'Models by view',
  /* ⚠⚠ L AUTRE BLOC : une liste ouverte, pas les quatre angles. */
  'Mannequins (habillage IA)': 'Models (AI try-on)',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can look, not change.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  /* ⚠ L apostrophe DROITE : la source ecrit ces trois-la entre guillemets. */
  "L'administration n'est pas encore chargée dans la fenêtre principale.":
    'The administration is not loaded in the main window yet.',
  "La fenêtre principale n'a pas répondu à temps.":
    'The main window did not answer in time.',
  "L'opération a échoué.": 'The operation failed.',
  'Le fichier choisi n’est pas une image.': 'The chosen file is not an image.',
  'Angle de vue inconnu.': 'Unknown view angle.',
  'Ce mannequin n’existe plus — rechargez la fenêtre.':
    'This model no longer exists — reload the window.',
  'Le téléversement a échoué. Réessayez.': 'The upload failed. Try again.',

  /* ══ LES QUATRE ANGLES ═════════════════════════════════════════════════════ */
  'Aucun angle de vue.': 'No view angle.',
  /* Le pictogramme est dans son propre <span> : la cle commence apres lui. */
  ' Changer': ' Change',
  '📸 Changer': '📸 Change',
  'Non configuré': 'Not set',
  'Cliquer ou glisser': 'Click or drag',
  '✕ Supprimer': '✕ Delete',

  /* ══ LES MANNEQUINS ════════════════════════════════════════════════════════
   * ⚠⚠ SANS LA CLE, L HABILLAGE REFUSERA. Voir l en-tete. */
  ' Aucune clé Fal.ai n’est enregistrée': ' No Fal.ai key is saved',
  ' — l’habillage refusera tant qu’elle n’est pas posée dans Configuration → Clés API.':
    ' — the try-on will refuse until it is set in Configuration → API keys.',
  '⚠ Aucune clé Fal.ai n’est enregistrée — l’habillage refusera tant qu’elle n’est pas posée dans Configuration → Clés API.':
    '⚠ No Fal.ai key is saved — the try-on will refuse until it is set in Configuration → API keys.',
  'Ajouter un mannequin': 'Add a model',
  '📸 Ajouter un mannequin': '📸 Add a model',
  'Aucun mannequin enregistré.': 'No model saved.',
  /* ⚠ Le nom tape est une DONNEE ; seul l exemple suit la langue du poste. */
  'Nom (ex : Ana)': 'Name (e.g. Ana)',

  /* ══ LES VERDICTS ══════════════════════════════════════════════════════════
   * ⚠⚠ Il n y a pas de bouton « Enregistrer » : ce sont eux, la confirmation. */
  'Lecture de l’image…': 'Reading the image…',
  'Téléversement…': 'Uploading…',
  'Lecture du fichier impossible.': 'The file could not be read.',
  'Modèle enregistré.': 'Model saved.',
  'Modèle retiré.': 'Model removed.',
  'Mannequin ajouté.': 'Model added.',
  'Mannequin retiré.': 'Model removed.'
};
