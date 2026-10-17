'use strict';

/*
 * ATELIER DE CRÉATION — les deux langues (2026-10-16)
 * =============================================================================
 * ⚠ Les bases, catégories, états, options et mesures voyagent par leur CLÉ :
 * la fenêtre les met en mots avec les libellés ci-dessous. Ce qui repart au
 * site est toujours la clé, jamais ce texte.
 * ⚠ LES MOTS DU MÉTIER, en anglais : « ease » (aisance), « armhole »
 * (emmanchure), « sleeve cap » (tête de manche), « cap ease » (embu), « crotch »
 * (fourche), « inseam » (entrejambe), « on the fold » (au pli), « dart » (pince),
 * « graded sizes » (tailles gradées), « block » (patron de base).
 * ⚠ AUCUNE APOSTROPHE DROITE dans une valeur : chaque phrase est posée dans une
 * chaîne entre apostrophes du script de la page.
 */

module.exports = {
  /* ── LA FENÊTRE ─────────────────────────────────────────────────────────── */
  'Atelier de création — Administration Sandriza': 'Design studio — Sandriza Administration',
  'Atelier de création': 'Design studio',
  'Chargement en cours': 'Loading',
  'Atelier indisponible': 'Design studio unavailable',
  '⧉ Détacher': '⧉ Detach',
  'Ouvrir cet écran dans sa propre fenêtre': 'Open this screen in its own window',
  '⚓ Ancrer': '⚓ Dock',
  'Ramener cet écran dans la fenêtre principale': 'Bring this screen back into the main window',

  /* ── LES BASES (patrons de base) ────────────────────────────────────────── */
  'Robe droite': 'Straight dress',
  'Chemisier': 'Blouse',
  'Jupe': 'Skirt',
  'Pantalon': 'Trousers',
  'devant, dos, pinces de taille': 'front, back, waist darts',
  'devant, dos, manche': 'front, back, sleeve',
  'devant, dos, pinces': 'front, back, darts',
  'devant, dos': 'front, back',

  /* ── CATÉGORIES ET ÉTATS ───────────────────────────────────────────────── */
  'Robes': 'Dresses',
  'Hauts': 'Tops',
  'Pantalons': 'Trousers',
  'Jupes': 'Skirts',
  'Manteaux': 'Coats',
  'Motifs': 'Prints',
  'Brouillon': 'Draft',
  'Prêt à couper': 'Ready to cut',
  'Archivé': 'Archived',
  'Brouillons': 'Drafts',
  'Prêts à couper': 'Ready to cut',
  'Archivés': 'Archived',

  /* ── LES MESURES (du corps) ────────────────────────────────────────────── */
  'Tour de poitrine': 'Bust',
  'Tour de taille': 'Waist',
  'Tour de hanches': 'Hips',
  'Longueur taille-dos': 'Back waist length',
  'Carrure dos': 'Back width',
  'Hauteur de poitrine': 'Bust height',
  'Tour de cou': 'Neck',
  'Tour de bras': 'Upper arm',
  'Longueur de bras': 'Arm length',
  'Hauteur de montant': 'Body rise',
  'Longueur d’entrejambe': 'Inseam length',

  /* ── LES OPTIONS ───────────────────────────────────────────────────────── */
  'Ronde': 'Round',
  'En V': 'V-neck',
  'Bateau': 'Boat',
  'Sans manche': 'Sleeveless',
  'Courte': 'Short',
  'Longue': 'Long',
  'Droite': 'Straight',
  'Crayon': 'Pencil',
  'Évasée': 'Flared',
  'Droit': 'Straight',
  'Large': 'Wide',
  'Fuselé': 'Tapered',
  'Encolure': 'Neckline',
  'Forme': 'Shape',
  'Longueur de jambe (0 = entrejambe)': 'Leg length (0 = inseam)',
  'Longueur sous la taille': 'Length below the waist',

  /* ── LES PIÈCES ET LEURS MESURES DE CONTRÔLE ───────────────────────────── */
  'Devant': 'Front',
  'Dos': 'Back',
  'Manche': 'Sleeve',
  'Emmanchure': 'Armhole',
  'Couture de côté': 'Side seam',
  'Tête de manche': 'Sleeve cap',
  'Embu de la manche': 'Sleeve cap ease',
  'Fourche': 'Crotch',
  'Entrejambe': 'Inseam',
  'Pièces du patron': 'Pattern pieces',
  'au pli': 'on the fold',
  'pince': 'dart',

  /* ── LES REFUS ─────────────────────────────────────────────────────────── */
  'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.':
    'No session is open in the application. Sign in from the main window.',
  'Votre rôle ne permet pas ce geste dans l’atelier.': 'Your role does not allow this action in the design studio.',
  'L’administration n’est pas encore chargée dans la fenêtre principale.': 'The administration is not loaded in the main window yet.',
  'La fenêtre principale ne répond pas.': 'The main window is not responding.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not respond in time.',
  'Cette version de l’application ne connaît pas cette opération.': 'This version of the application does not know this operation.',
  'Donnez un nom au modèle.': 'Give the design a name.',
  'Choisissez un patron de base.': 'Choose a base block.',
  'Cette référence est déjà prise par un autre modèle.': 'This reference is already used by another design.',
  'Gardez au moins une taille, dont la taille de base.': 'Keep at least one size, including the base size.',
  'Ce modèle n’existe plus.': 'This design no longer exists.',
  'Enregistré sur ce poste seulement : le serveur n’a pas confirmé. Réessayez.':
    'Saved on this workstation only: the server did not confirm. Try again.',
  'L’opération a échoué.': 'The operation failed.',
  'Erreur inattendue (': 'Unexpected error (',

  /* ── LA BIBLIOTHÈQUE ───────────────────────────────────────────────────── */
  '{0} modèles': '{0} designs',
  '{0} modèle': '{0} design',
  '{0} brouillons': '{0} drafts',
  '1 brouillon': '1 draft',
  'Nouveau modèle': 'New design',
  'Catégorie': 'Category',
  'Tous': 'All',
  'État': 'Status',
  'Rechercher un modèle': 'Search a design',
  'Nom, référence, base…': 'Name, reference, block…',
  'Aucun modèle pour l’instant. Partez d’un patron de base : il se trace à vos mesures.':
    'No design yet. Start from a base block: it is drafted to your measurements.',
  'Clic : détails · double-clic : ouvrir': 'Click: details · double-click: open',
  'Partir d’un patron de base': 'Start from a base block',
  'Robe, chemisier, jupe, pantalon — tracé à vos mesures': 'Dress, blouse, skirt, trousers — drafted to your measurements',
  'Aucun modèle ne correspond.': 'No design matches.',
  'modèles': 'designs',
  'modèle': 'design',
  'Modèle choisi': 'Selected design',
  'Cliquez une carte pour voir ses pièces, ses tailles et ses versions.': 'Click a card to see its pieces, sizes and versions.',
  'modifié le {0}': 'modified on {0}',
  'Tailles gradées': 'Graded sizes',
  'base': 'base',
  'Tissu estimé (laize 140 cm)': 'Estimated fabric (140 cm width)',
  'Versions': 'Versions',
  'Supprimer': 'Delete',
  'Dupliquer': 'Duplicate',
  'Ouvrir le modèle': 'Open the design',

  /* ── LE MODÈLE (le moteur) ─────────────────────────────────────────────── */
  'Modèle': 'Design',
  'Tracé à partir d’un patron de base et de vos mesures': 'Drafted from a base block and your measurements',
  '← Bibliothèque': '← Library',
  'Créer le modèle': 'Create the design',
  'Enregistrer la version': 'Save the version',
  'Patron de base': 'Base block',
  'Le modèle': 'The design',
  'Nom': 'Name',
  'Référence': 'Reference',
  'Produit lié': 'Linked product',
  '— Aucun —': '— None —',
  'Notes': 'Notes',
  'Tableau de tailles': 'Size chart',
  'mesures du corps, en cm': 'body measurements, in cm',
  'Tableau standard': 'Standard chart',
  'Mesure': 'Measurement',
  'Taille gardée :': 'Size kept:',
  'Taille de base (tracé de référence)': 'Base size (reference draft)',
  'Aisances': 'Ease',
  'ajoutées au tour, en cm': 'added to the girth, in cm',
  'Aperçu': 'Preview',
  'Taille de l’aperçu': 'Preview size',
  'Toutes': 'All',
  'Base, options ou mesures changées : les pièces seront retracées à l’enregistrement.':
    'Block, options or measurements changed: the pieces will be redrafted when saved.',
  'Toutes les tailles emboîtées': 'All sizes nested',
  'Pièces de la taille': 'Pieces for size',
  'Enregistrement…': 'Saving…',
  'Modèle enregistré.': 'Design saved.',
  'Tableau standard remis.': 'Standard chart restored.',
  'Quitter sans enregistrer ?': 'Leave without saving?',
  'Les changements de base, d’options ou de mesures seront perdus.': 'Changes to the block, options or measurements will be lost.',
  'Quitter': 'Leave',
  'Copie…': 'Copying…',
  'Copie créée, en brouillon.': 'Copy created, as a draft.',
  'Supprimer ce modèle ?': 'Delete this design?',
  'Le modèle, ses pièces et ses versions disparaissent. Les produits liés ne sont pas touchés.':
    'The design, its pieces and its versions are removed. Linked products are not affected.',
  'Supprimer le modèle': 'Delete the design',
  'Suppression…': 'Deleting…',
  'Modèle supprimé.': 'Design deleted.',
};
