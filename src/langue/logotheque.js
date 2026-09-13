'use strict';

/*
 * LOGOTHEQUE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CETTE FENETRE DIT SI UNE IMAGE POURRA S IMPRIMER, et c est tout son objet.
 * Les trois verdicts de resolution — « Excellent », « Correct », « Insuffisant
 * pour l’impression » — se lisent AVANT l envoi : une image insuffisante ne se
 * repare pas apres coup, elle se remplace. Ils gardent le mot « impression » :
 * a l ecran, la meme image est parfaite.
 *
 * ⚠⚠ ROGNER ET AJUSTER NE FONT PAS LA MEME CHOSE, et la phrase qui les separe
 * est la seule : « Rogner coupe au centre pour atteindre le rapport (rien n’est
 * déformé) ; Ajuster n’enlève rien et complète avec des marges transparentes. »
 * Perdre « rien n’est déformé » ferait croire a un etirement ; perdre « n’enlève
 * rien » ferait rogner un logo par prudence.
 *
 * ⚠ LES RAPPORTS (1:1, 4:3, 16:9) SONT DES CHIFFRES ; seul « libre » est un mot.
 * Les unites « px », « po », « dpi », « Ko » et les types de fichier (PNG, SVG)
 * ne changent pas — sauf « po », qui devient « in » en anglais.
 *
 * ⚠ Le NOM d une image est une donnee : il est enregistre et sert a la
 * retrouver. Seul l exemple du champ suit la langue du poste.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Logothèque — Administration Sandriza': 'Logo library — Sandriza Administration',
  'Logothèque': 'Logo library',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can view, not change.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  /* ⚠ L apostrophe DROITE : la source ecrit ces trois-la entre guillemets
     doubles. */
  "L'administration n'est pas encore chargée dans la fenêtre principale.":
    'The administration is not loaded yet in the main window.',
  "La fenêtre principale n'a pas répondu à temps.": 'The main window did not answer in time.',
  "L'opération a échoué.": 'The operation failed.',
  'Le fichier choisi n’est pas une image.': 'The chosen file is not an image.',
  'Le nom est requis.': 'The name is required.',
  'Cette image n’existe plus.': 'This image no longer exists.',
  'Le téléversement a échoué. Réessayez.': 'The upload failed. Try again.',
  'Lecture de l’image…': 'Reading the image…',
  'Lecture du fichier impossible.': 'The file could not be read.',
  'Ce fichier n’est pas une image lisible.': 'This file is not a readable image.',

  /* ══ LES TROIS VERDICTS DE RESOLUTION ══════════════════════════════════════
   * ⚠ Ils gardent le mot « impression » : a l ecran, la meme image est
   * parfaite. */
  'Excellent pour l’impression': 'Excellent for printing',
  'Correct pour l’impression': 'Fine for printing',
  'Insuffisant pour l’impression': 'Not enough for printing',

  /* ── LA LISTE ───────────────────────────────────────────────────────────── */
  ' Téléverser une image': ' Upload an image',
  '⭱ Téléverser une image': '⭱ Upload an image',
  'Les dimensions vous seront présentées avant l’envoi. Stockage Cloudflare R2, réutilisable partout.':
    'The dimensions are shown to you before sending. Cloudflare R2 storage, reusable anywhere.',
  'Aucune image dans la logothèque.': 'No image in the logo library.',
  ' Téléversez-en une ci-dessus.': ' Upload one above.',
  'Téléversez-en une ci-dessus.': 'Upload one above.',
  'dimensions ?': 'dimensions?',
  'transparent': 'transparent',
  'Sans nom': 'No name',
  'Renommer': 'Rename',
  'Copier l’adresse': 'Copy the address',
  'Retirer': 'Remove',

  /* ══ L IMPORT ET LE RECADRAGE ══════════════════════════════════════════════ */
  'Détecté dans le fichier': 'Found in the file',
  'Dimensions': 'Dimensions',
  'Rapport': 'Ratio',
  'carré': 'square',
  'paysage': 'landscape',
  'portrait': 'portrait',
  'Transparence': 'Transparency',
  'oui': 'yes',
  'non': 'no',
  'Fichier': 'File',
  'Aperçu du résultat': 'Preview of the result',
  'Image produite': 'Image produced',
  'Recadrage': 'Crop',
  'centré, ': 'centred, ',
  'Recadrage centré,': 'Crop centred,',
  ' % retiré': ' % removed',
  '% retiré': '% removed',
  'Ajustement': 'Fit',
  'marges transparentes': 'transparent margins',
  'Ajustement marges transparentes': 'Fit transparent margins',
  'Taille prévue': 'Expected size',
  'Résolution': 'Resolution',
  'Taille d’impression': 'Print size',
  'non précisée': 'not given',
  'Taille d’impression non précisée': 'Print size not given',

  'Nom': 'Name',
  /* Le nom d une image est une donnee ; son exemple suit la langue du poste. */
  'Nom du logo ou de l’image': 'Name of the logo or image',
  'Format': 'Format',
  'Conserver': 'Keep',
  'Rogner': 'Crop',
  'Ajuster (marges)': 'Fit (margins)',
  'Rapport visé': 'Target ratio',
  'libre': 'free',
  /* ⚠⚠ LA PHRASE QUI SEPARE LES DEUX MODES — les deux moities comptent. */
  '« Rogner » coupe au centre pour atteindre le rapport (rien n’est déformé). « Ajuster » n’enlève rien et complète avec des marges transparentes.':
    '« Crop » cuts at the centre to reach the ratio (nothing is stretched). « Fit » removes nothing and fills with transparent margins.',
  'Taille d’impression prévue': 'Expected print size',
  'Largeur (po)': 'Width (in)',
  'ex. 2': 'e.g. 2',
  'Largeur max (px)': 'Max width (px)',
  'Confirmer et téléverser': 'Confirm and upload',
  'Annuler': 'Cancel',
  'Confirmer et téléverser Annuler': 'Confirm and upload Cancel',
  ' po': ' in',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Téléversement…': 'Uploading…',
  'Nouveau nom du logo': 'New name of the logo',
  'Renommé.': 'Renamed.',
  'Retrait…': 'Removing…',
  'Image ajoutée (': 'Image added (',
  'Image retirée.': 'Image removed.',
  'Adresse copiée.': 'Address copied.'
};
