'use strict';

/*
 * CENTRE D IMPRESSION — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN CONSOMME DU CARTON ET DE L ENCRE, et plusieurs phrases n y sont
 * que pour eviter d en gacher. Elles gardent leur fermete :
 *   · « une image de ce modele n est pas lisible par le navigateur : RIEN n a
 *     ete imprime » — elle dit ce qui N A PAS eu lieu, et c est ce qui empeche
 *     de relancer un lot en croyant l avoir deja sorti ;
 *   · « l arret demande : le lot DEJA ENVOYE sortira quand meme » — une pile
 *     d etiquettes continue de sortir apres le clic, et il faut le savoir ;
 *   · « des etiquettes ont PEUT-ETRE ete imprimees — verifiez l imprimante » :
 *     sans reponse, on ne sait pas, et on le dit plutot que de deviner.
 *
 * ⚠⚠ LES POUCES RESTENT DES POUCES, comme dans l editeur visuel : c est l unite
 * de l imprimerie nord-americaine et celle des gabarits Avery. « Lettre » reste
 * « Letter » — c est le nom du format de papier, pas un mot a traduire.
 * ⚠ « Avery » est un nom de marque : il ne bouge pas.
 *
 * ⚠ ON NE TRADUIT QUE LES LIBELLES : `label`, `stick`, `rect`, `carre` partent
 * dans le format enregistre et sont relus par le moteur de rendu.
 */

module.exports = {
  /* ── L EN-TETE ──────────────────────────────────────────────────────────── */
  'Centre d’impression — Administration Sandriza': 'Print Centre — Sandriza Administration',
  'Centre d’impression': 'Print Centre',
  'Centre d’impression indisponible': 'Print Centre unavailable',
  'Votre rôle ne donne pas accès au Centre d’impression.':
    'Your role does not give access to the Print Centre.',
  '👁 Lecture seule — votre rôle permet de consulter, pas de modifier ni d’imprimer.':
    '👁 Read only — your role allows viewing, not changing or printing.',
  'Impression par lot': 'Batch printing',

  /* ── LES REFUS ──────────────────────────────────────────────────────────── */
  'Le Centre d’impression n’a pas pu être chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).':
    'The Print Centre could not be loaded in the main window. Reload it (Ctrl+R).',
  'Ce modèle n’existe plus.': 'This template no longer exists.',
  'Ce format n’existe plus.': 'This format no longer exists.',
  'Donnez un nom au format.': 'Give the format a name.',
  'Dimensions invalides — en pouces, au moins 0,2.': 'Invalid dimensions — in inches, at least 0.2.',
  'Le programme d’impression n’est pas disponible sur ce poste.':
    'The printing program is not available on this machine.',
  'L’imprimante d’étiquettes n’est pas prête.': 'The label printer is not ready.',
  /* ⚠⚠ ELLE DIT QUE RIEN N A ETE IMPRIME. Sans ce « rien », on relance un lot en
     croyant l avoir deja sorti — et l on imprime deux fois. */
  'Une image de ce modèle n’est pas lisible par le navigateur : rien n’a été imprimé. Réenregistrez-la depuis la logothèque (écran web), puis réessayez.':
    'One image in this template cannot be read by the browser: nothing was printed. Save it again from the logo library (web screen), then try again.',
  'L’envoi à l’imprimante a échoué.': 'Sending to the printer failed.',
  'Aucun gabarit de planche ne correspond à ce format.':
    'No sheet template matches this format.',
  'La planche n’a pas pu être générée.': 'The sheet could not be generated.',
  'Ce modèle n’a pas pu être rendu.': 'This template could not be rendered.',

  /* ── LES MODELES ────────────────────────────────────────────────────────── */
  /* ⚠ LA MISE EN PAGE RESTE DANS L EDITEUR VISUEL : la phrase dit ou aller. */
  'La mise en page d’un modèle et la logothèque': 'Laying out a template and the logo library',
  'restent à l’écran Catalogue → Centre d’impression de la fenêtre principale :':
    'stay on the Catalogue → Print Centre screen of the main window:',
  'ce sont des éditeurs visuels. Le bouton « Ouvrir l’éditeur » vous y mène.':
    'they are visual editors. The « Open the editor » button takes you there.',
  'Modifié récemment': 'Recently changed',
  '＋ Nouveau modèle': '＋ New template',
  'Format du nouveau modèle': 'Format of the new template',
  'Créer et ouvrir l’éditeur': 'Create and open the editor',
  'Besoin d’un autre gabarit ? Ajoutez un format dans l’onglet Formats .':
    'Need another template? Add a format in the Formats tab .',
  'Lecture des modèles…': 'Reading templates…',
  'Aucun modèle ne correspond.': 'No template matches.',
  'Aucun modèle. Créez-en un depuis l’onglet Formats.':
    'No template. Create one from the Formats tab.',
  'Aperçu Nom Format': 'Preview Name Format',
  'Éléments Modifié': 'Elements Changed',
  'Aperçu': 'Preview',
  'Nom': 'Name',
  'Format': 'Format',
  'Éléments': 'Elements',
  'Modifié': 'Changed',
  'Créer un modèle': 'Create a template',
  'Ouverture de l’éditeur…': 'Opening the editor…',
  'Éditeur ouvert dans sa fenêtre.': 'Editor opened in its own window.',
  '» ouvert dans la fenêtre principale.': '» opened in the main window.',
  '» créé.': '» created.',
  '» créé — ouvrez l’éditeur pour le mettre en page.':
    '» created — open the editor to lay it out.',
  ') supprimé. Les impressions déjà faites ne sont pas touchées.':
    ') deleted. Prints already made are not affected.',

  /* ── LES FORMATS ────────────────────────────────────────────────────────── */
  'Formats disponibles': 'Formats available',
  '＋ Ajouter un format': '＋ Add a format',
  'Étiquette Autocollant': 'Label Sticker',
  'Étiquette': 'Label',
  'Autocollant': 'Sticker',
  'Carte d’affaires': 'Business card',
  'Rectangle Carré': 'Rectangle Square',
  'Rectangle': 'Rectangle',
  'Carré': 'Square',
  'Largeur (po)': 'Width (in)',
  'Hauteur (po)': 'Height (in)',
  'Diamètre (po)': 'Diameter (in)',
  'Côté (po)': 'Side (in)',
  'C’est ce format qui calibrera': 'It is this format that will calibrate',
  'l’imprimante d’étiquettes au moment d’imprimer.': 'the label printer at print time.',
  'Enregistrer le format': 'Save the format',
  'Nom Dimensions Origine Planche': 'Name Dimensions Origin Sheet',
  'Dimensions': 'Dimensions',
  'Origine': 'Origin',
  'Planche': 'Sheet',
  'Format «': 'Format «',
  '» enregistré (': '» saved (',
  '» retiré. Les modèles déjà créés ne changent pas.':
    '» removed. Templates already created do not change.',
  'Choisissez un format.': 'Choose a format.',

  /* ── L IMPRESSION DIRECTE ───────────────────────────────────────────────── */
  'Impression directe — imprimante d’étiquettes': 'Direct printing — label printer',
  'Aucun modèle à imprimer.': 'No template to print.',
  'Créez-en un depuis l’onglet Formats.': 'Create one from the Formats tab.',
  'Seuls les modèles de la page affichée sont listés —':
    'Only the templates on the page shown are listed —',
  'changez de page dans l’onglet Modèles pour en atteindre d’autres.':
    'change page in the Templates tab to reach others.',
  'Format du modèle': 'Template format',
  'non détectée': 'not detected',
  'Résolution détectée': 'Resolution detected',
  'Rendu envoyé': 'Render sent',
  'Une image de ce modèle n’est pas lisible': 'One image in this template cannot be read',
  'par le navigateur : l’impression échouera. Réenregistrez-la depuis la logothèque':
    'by the browser: printing will fail. Save it again from the logo library',
  '(écran web), puis revenez.': '(web screen), then come back.',
  'Choisissez un modèle.': 'Choose a template.',
  'Lecture de l’imprimante…': 'Reading the printer…',
  'Relire l’imprimante': 'Re-read the printer',
  'Prête —': 'Ready —',
  'Sans réponse': 'No answer',

  /* ── LA CALIBRATION ─────────────────────────────────────────────────────── */
  'Ajustement fin (si l’étiquette sort décalée)': 'Fine adjustment (if the label comes out off-centre)',
  'Échelle (%)': 'Scale (%)',
  'Décalage X (mm)': 'Offset X (mm)',
  'Décalage Y (mm)': 'Offset Y (mm)',
  'Retenu par imprimante et par format , dans votre profil.':
    'Kept per printer and per format , in your profile.',
  'Calibration enregistrée.': 'Calibration saved.',

  /* ── L IMPRESSION EN COURS ──────────────────────────────────────────────── */
  /* ⚠⚠ « LE LOT DEJA ENVOYE SORTIRA QUAND MEME » : une pile d etiquettes
     continue de sortir apres le clic d arret. La phrase evite de croire que tout
     s est arrete net — et de relancer par-dessus. */
  'Impression en cours': 'Printing',
  'Lancer l’impression': 'Start printing',
  'Imprimer 1 test': 'Print 1 test',
  'Une impression est déjà en cours — attendez-la ou arrêtez-la.':
    'A print run is already going — wait for it or stop it.',
  'Arrêt demandé…': 'Stop requested…',
  'Arrêt demandé.': 'Stop requested.',
  'Arrêt demandé — le lot déjà envoyé sortira quand même.':
    'Stop requested — the batch already sent will come out anyway.',
  'Arrêt demandé. Le lot déjà parti à l’imprimante sortira ; les suivants sont abandonnés.':
    'Stop requested. The batch already sent to the printer will come out; the following ones are dropped.',
  'Lot de': 'Batch of',
  'en cours d’envoi…': 'being sent…',
  'Impression arrêtée': 'Printing stopped',
  'Impression arrêtée après': 'Printing stopped after',
  'Impression terminée': 'Printing finished',
  'Impression interrompue': 'Printing interrupted',
  'déjà envoyée(s).': 'already sent.',
  'étiquette(s) déjà envoyée(s).': 'label(s) already sent.',
  /* ⚠⚠ SANS REPONSE, ON NE SAIT PAS — et on le DIT plutot que de deviner. */
  'La fenêtre principale n’a pas répondu. Des étiquettes ont peut-être été imprimées — vérifiez l’imprimante.':
    'The main window did not answer. Labels may have been printed — check the printer.',
  'Aucune réponse pour cette impression. Vérifiez l’imprimante avant de relancer.':
    'No answer for this print run. Check the printer before starting again.',

  /* ── L APERCU ET LA PLANCHE ─────────────────────────────────────────────── */
  /* ⚠ « Avery » est une marque, « Lettre » un format de papier : ni l un ni
     l autre ne se traduit — on dit « Letter », son nom en anglais. */
  'Aperçu — ce qui sera imprimé': 'Preview — what will be printed',
  'Rendu identique à l’impression (même moteur).':
    'Render identical to the printout (same engine).',
  'Planche sur feuille Lettre (imprimante ordinaire)':
    'Sheet on Letter paper (ordinary printer)',
  'Aucun gabarit Avery ne correspond exactement à ce format.':
    'No Avery template matches this format exactly.',
  'L’impression directe sur l’imprimante d’étiquettes reste la voie recommandée.':
    'Direct printing on the label printer remains the recommended route.',
  'Générer la planche': 'Generate the sheet',
  'Génération de la planche…': 'Generating the sheet…',
  'Elle s’ouvre dans la fenêtre principale :': 'It opens in the main window:',
  'c’est une page à imprimer par le navigateur.': 'it is a page for the browser to print.',
  'Planche «': 'Sheet «',
  '» ouverte dans la fenêtre principale (': '» opened in the main window (',
  'par feuille).': 'per sheet).',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════ */
  'Lecture seule — votre rôle permet de consulter, pas de modifier ni d’imprimer.':
    'Read only — your role allows viewing, not changing or printing.',
  'La <strong>mise en page d’un modèle</strong> et la <strong>logothèque</strong> ':
    'Laying out a <strong>template</strong> and the <strong>logo library</strong> ',
  'Besoin d’un autre gabarit ? Ajoutez un format dans l’onglet <strong>Formats</strong>.':
    'Need another template? Add a format in the <strong>Formats</strong> tab.',
  'Retenu <strong>par imprimante et par format</strong>, dans votre profil.':
    'Kept <strong>per printer and per format</strong>, in your profile.',

  /* ── LES ONGLETS ET LES EN-TETES, UNE CELLULE A LA FOIS ─────────────────── */
  'Modèles': 'Templates',
  'Modèle': 'Template',
  'modèle': 'template',
  'modèles': 'templates',
  'Formats': 'Formats',
  'Éditeur': 'Editor',
  'Quantité': 'Quantity',
  'Arrêter': 'Stop',
  'Création…': 'Creating…',
  'personnalisé': 'custom',
  'standard': 'standard',
  'affichés': 'shown',
  'étiquette': 'label',
  'imprimée': 'printed',
  'envoyée': 'sent',

  /* ── CE QUE LE BANC RESIDUEL A TROUVE ──────────────────────────────────── */
  'Largeur en pouces': 'Width in inches',
  ' de planche': ' for the sheet',
  'Rendu…': 'Rendering…',
};
