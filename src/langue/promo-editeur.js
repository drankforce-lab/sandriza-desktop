'use strict';

/*
 * EDITEUR VISUEL (objets promotionnels) — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN DESSINE CE QUI SERA IMPRIME, ET DEUX AVERTISSEMENTS COUTENT DU
 * CARTON S ILS PERDENT DE LEUR FORCE :
 *   · « ce contenu ne s encode pas en Code 128 : le code se dessinera, mais
 *     AUCUN LECTEUR NE LE LIRA » — un code-barres faux ressemble a un vrai ;
 *   · « la marge sure ne sort pas sur le papier : elle rappelle que les decoupes
 *     ne sont jamais parfaitement centrees ».
 *
 * ⚠⚠ ET UNE PHRASE DIT UNE EXCEPTION QU ON NE DEVINE PAS : le changement de
 * FORMAT « s enregistre tout de suite, et il ne s annule pas par Ctrl+Z — il ne
 * passe pas par le meme chemin que le reste ». Tout le reste de l ecran
 * s annule ; celui-la non. La reduire ferait perdre un modele.
 *
 * ⚠⚠ ON NE TRADUIT QUE LES LIBELLES. Chaque reglage est un couple
 * `[valeur, libelle]` : `cover`, `contain`, `upper`, `ellipse`, `circle` partent
 * dans le MODELE et sont relus par le peintre. Les noms de POLICES viennent du
 * peintre lui-meme (`r.polices`) : ce sont des noms propres.
 * ⚠ La notation CSS d une couleur (`#ffffff`, `rgb(…)`) est de la SYNTAXE : on
 * la cite, on ne la traduit pas.
 *
 * ⚠ LES POUCES RESTENT DES POUCES. C est l unite de l imprimerie nord-americaine
 * et celle du Centre d impression : convertir en millimetres ici donnerait deux
 * ecrans qui ne parlent pas de la meme chose.
 */

module.exports = {
  /* ── L EN-TETE ET LES GESTES ────────────────────────────────────────────── */
  'Éditeur visuel — Administration Sandriza': 'Visual editor — Sandriza Administration',
  'Éditeur visuel': 'Visual editor',
  '↶ Annuler': '↶ Undo',
  '↷ Refaire': '↷ Redo',
  '↻ Recharger': '↻ Reload',
  '↻ Actualiser': '↻ Refresh',
  'Fermer': 'Close',
  'Annuler (Ctrl+Z)': 'Undo (Ctrl+Z)',
  'Refaire (Ctrl+Y)': 'Redo (Ctrl+Y)',
  'Choisir une image': 'Choose an image',
  'Choisir une image…': 'Choose an image…',
  'Choisir une image de fond': 'Choose a background image',
  'Importer une image…': 'Import an image…',
  'Zone sûre': 'Safe area',

  /* ── LES REFUS ──────────────────────────────────────────────────────────── */
  'Votre compte n’a pas le droit de modifier les objets promotionnels.':
    'Your account is not allowed to change promotional items.',
  'Le module d’impression n’est pas chargé dans la fenêtre principale.':
    'The printing module is not loaded in the main window.',
  'Ce modèle n’existe plus — il a peut-être été supprimé ailleurs.':
    'This template no longer exists — it may have been deleted elsewhere.',
  'Demande incomplète.': 'Incomplete request.',
  'Ce type d’élément n’existe pas.': 'This element type does not exist.',
  'Dimensions refusées : il faut entre 0,2 et 40 pouces.':
    'Dimensions refused: it must be between 0.2 and 40 inches.',
  'Le modèle dépasse la taille permise (8 Mo d’éléments).':
    'The template exceeds the allowed size (8 MB of elements).',
  'Aperçu non repeint :': 'Preview not repainted:',
  'L’aperçu n’a pas pu être peint': 'The preview could not be painted',
  '. Les poignées restent utilisables.': '. The handles are still usable.',
  'La fenêtre Logothèque n’a pas pu s’ouvrir.': 'The Logo library window could not open.',

  /* ── LES TYPES D ELEMENTS ───────────────────────────────────────────────── */
  'Texte': 'Text',
  'Image': 'Image',
  'Forme': 'Shape',
  'Ligne': 'Line',
  'Code-barres': 'Barcode',
  'Mod Le modèle (fond, format)': 'Tpl The template (background, format)',
  'Le modèle (fond, format)': 'The template (background, format)',
  'Ce modèle ne porte aucun élément. Ajoutez-en un ci-dessus.':
    'This template carries no element. Add one above.',
  'Sans nom': 'No name',
  'Nom du modèle': 'Template name',

  /* ── LE FOND ────────────────────────────────────────────────────────────── */
  'Uni': 'Solid',
  'Dégradé': 'Gradient',
  'Départ du dégradé': 'Gradient start',
  'Arrivée du dégradé': 'Gradient end',
  'Angle (degrés)': 'Angle (degrees)',
  'Image de fond': 'Background image',
  'Aucune image': 'No image',
  'Remplir': 'Fill',
  'Contenir': 'Fit',
  'Les images viennent de la logothèque. Pour en déposer une nouvelle,':
    'Images come from the logo library. To drop in a new one,',
  'le sélecteur ouvre la fenêtre Logothèque.': 'the picker opens the Logo library window.',
  'Couleur du fond': 'Background colour',
  /* ⚠ De la SYNTAXE, citee telle quelle. */
  'Notation CSS : #ffffff, rgb(…), ou un nom.': 'CSS notation: #ffffff, rgb(…), or a name.',
  'Notation CSS : #111827, rgb(…), ou un nom.': 'CSS notation: #111827, rgb(…), or a name.',

  /* ── LE LISERE ET LES REPERES ───────────────────────────────────────────── */
  'Liseré imprimé': 'Printed border',
  'Épaisseur (po)': 'Thickness (in)',
  'Retrait (po)': 'Inset (in)',
  'Une épaisseur de 0 ne dessine aucun liseré.': 'A thickness of 0 draws no border.',
  'Couleur du liseré': 'Border colour',
  'Repères (aperçu seulement)': 'Guides (preview only)',
  'Marge sûre (po)': 'Safe margin (in)',
  'Coins (po)': 'Corners (in)',
  /* ⚠⚠ ELLE DIT POURQUOI LA MARGE EXISTE : les decoupes ne sont jamais
     parfaitement centrees. Sans elle, on colle le texte au bord. */
  'La marge sûre ne sort pas sur le papier : elle rappelle que les découpes':
    'The safe margin does not print: it is a reminder that the cuts',
  'ne sont jamais parfaitement centrées. Affichez-la avec « Zone sûre », en haut.':
    'are never perfectly centred. Show it with « Safe area », at the top.',

  /* ── LE FORMAT DU SUPPORT ───────────────────────────────────────────────── */
  /* ⚠⚠⚠ LA SEULE CHOSE DE CET ECRAN QUI NE S ANNULE PAS. La phrase le dit, et
     elle ne se resume pas — tout le reste s annule par Ctrl+Z. */
  'Format du support': 'Media format',
  'Diamètre (po)': 'Diameter (in)',
  'Largeur (po)': 'Width (in)',
  'Hauteur (po)': 'Height (in)',
  'Appliquer le format': 'Apply the format',
  'Les éléments sont placés en pourcentage : ils suivent le nouveau format sans se':
    'Elements are placed in percentages: they follow the new format without',
  'déformer. Attention : ce changement s’enregistre tout de suite, et il ne s’annule pas':
    'distorting. Careful: this change is saved straight away, and it cannot be undone',
  'par Ctrl+Z — il ne passe pas par le même chemin que le reste.':
    'with Ctrl+Z — it does not go through the same path as the rest.',
  'Forme :': 'Shape:',
  '. Elle se choisit à la création du modèle, dans le Centre d’impression.':
    '. It is chosen when the template is created, in the Print Centre.',
  'Changement de format…': 'Changing the format…',
  'Format :': 'Format:',
  '. Les éléments ont suivi.': '. The elements followed.',

  /* ── LE TEXTE ───────────────────────────────────────────────────────────── */
  'Taille (% de la hauteur)': 'Size (% of the height)',
  'Gauche': 'Left',
  'Centre': 'Centre',
  'Droite': 'Right',
  'Haut': 'Top',
  'Milieu': 'Middle',
  'Bas': 'Bottom',
  'Courbure du texte': 'Text curve',
  'Arc (degrés)': 'Arc (degrees)',
  '0 = droit. Indispensable sur un autocollant rond : le texte suit l’arc.':
    '0 = straight. Essential on a round sticker: the text follows the arc.',
  'Contour et ombre': 'Outline and shadow',
  'Couleur du contour': 'Outline colour',
  'Décalage X': 'Offset X',
  'Décalage Y': 'Offset Y',

  /* ── L IMAGE ────────────────────────────────────────────────────────────── */
  'Zoom 1 = image entière. Le décalage va de −1 à 1.':
    'Zoom 1 = whole image. The offset runs from −1 to 1.',
  '⇄ Miroir': '⇄ Mirror',
  '⇅ Retourner': '⇅ Flip',
  'Coins arrondis (%)': 'Rounded corners (%)',
  'Noir et blanc': 'Black and white',
  'Aucun': 'None',
  'Cercle': 'Circle',
  'Rectangle': 'Rectangle',
  'Ellipse': 'Ellipse',
  'Triangle': 'Triangle',
  'Étoile': 'Star',
  'Réinitialiser la retouche': 'Reset the retouching',
  'En pourcentage : 100 = inchangé. Le flou et le noir et blanc partent de 0.':
    'In percentages: 100 = unchanged. Blur and black and white start at 0.',
  'Retouche et recadrage remis à zéro.': 'Retouching and cropping reset.',

  /* ── LE CODE-BARRES ─────────────────────────────────────────────────────── */
  /* ⚠⚠⚠ UN CODE-BARRES FAUX RESSEMBLE A UN VRAI. Cette phrase est la seule
     chose qui separe une planche imprimee d une planche a jeter. */
  'Attention : ce contenu ne s’encode pas en Code 128. Le code se dessinera,':
    'Careful: this content cannot be encoded in Code 128. The code will be drawn,',
  'mais aucun lecteur ne le lira. Lettres, chiffres et ponctuation ASCII seulement.':
    'but no scanner will read it. Letters, digits and ASCII punctuation only.',
  'Code 128 — lettres, chiffres et ponctuation ASCII.':
    'Code 128 — letters, digits and ASCII punctuation.',
  'Texte sous le code': 'Text under the code',
  'Plus le code est large, plus il est lisible : prévoyez au moins 1,5 po.':
    'The wider the code, the more readable it is: allow at least 1.5 in.',
  'Épaisseur du trait': 'Bar thickness',

  /* ── LA GEOMETRIE ───────────────────────────────────────────────────────── */
  'Position et taille (pouces)': 'Position and size (inches)',
  'Mesuré sur le support (': 'Measured on the media (',
  'Les flèches du clavier déplacent de 0,5 % — 5 % avec Majuscule.':
    'The arrow keys move by 0.5 % — 5 % with Shift.',
  'Aligner sur le support': 'Align to the media',
  'Un élément verrouillé ne se déplace plus à la souris — il reste modifiable ici.':
    'A locked element no longer moves with the mouse — it can still be changed here.',
  'Ordre dans la pile': 'Order in the stack',
  '↑ Avancer': '↑ Bring forward',
  '↓ Reculer': '↓ Send backward',
  'Le dernier de la pile est celui qui se dessine par-dessus les autres.':
    'The last in the stack is the one drawn on top of the others.',
  'Déjà à cette extrémité de la pile.': 'Already at that end of the stack.',
  'Cet élément': 'This element',
  'Une suppression s’annule (Ctrl+Z) tant que la fenêtre reste ouverte.':
    'A deletion can be undone (Ctrl+Z) as long as the window stays open.',

  /* ── LES COMPTES RENDUS ─────────────────────────────────────────────────── */
  'Lecture du modèle…': 'Reading the template…',
  'Modèle non ouvert': 'Template not open',
  'Modèle ouvert.': 'Template open.',
  'Enregistré —': 'Saved —',
  'Élément ajouté — pensez à enregistrer.': 'Element added — remember to save.',
  'Élément dupliqué.': 'Element duplicated.',
  'Élément retiré — Ctrl+Z le ramène.': 'Element removed — Ctrl+Z brings it back.',
  'Élément copié.': 'Element copied.',
  'Rien à coller.': 'Nothing to paste.',
  'Élément verrouillé — déverrouillez-le pour le déplacer.':
    'Element locked — unlock it to move it.',
  'Élément verrouillé — déverrouillez-le pour le retirer.':
    'Element locked — unlock it to remove it.',
  'Image posée — pensez à enregistrer.': 'Image placed — remember to save.',
  'Fond changé — pensez à enregistrer.': 'Background changed — remember to save.',
  'Modifié — pensez à enregistrer.': 'Changed — remember to save.',
  'Des modifications ne sont pas enregistrées. Les abandonner ?':
    'Some changes are not saved. Discard them?',
  'Modifications non enregistrées — Enregistrer, ou Recharger pour abandonner.':
    'Unsaved changes — Save, or Reload to discard.',

  /* ── LA LOGOTHEQUE ──────────────────────────────────────────────────────── */
  'Lecture de la logothèque…': 'Reading the logo library…',
  'La logothèque est vide. Utilisez « Importer une image… »':
    'The logo library is empty. Use « Import an image… »',
  'pour y déposer un premier fichier.': 'to drop in a first file.',
  'écartée(s) : illisibles ici, elles ne sortiraient pas non plus sur le papier':
    'set aside: unreadable here, they would not come out on paper either',
  'au total, les': 'in total, the',
  'plus récentes sont montrées': 'most recent are shown',
  'Déposez l’image dans la fenêtre Logothèque, puis revenez ici et touchez « ↻ Actualiser ».':
    'Drop the image into the Logo library window, then come back here and press « ↻ Refresh ».',
  /* ── LES ABREGES DE LA LISTE D ELEMENTS (trois lettres, largeur fixe) ─────
     ⚠ Ils tiennent dans une pastille etroite : la traduction doit rester a
     TROIS lettres, sinon la colonne se deforme. « Mod » est celui du modele. */
  'Txt': 'Txt',
  'Img': 'Img',
  'Cod': 'Bar',
  'Lig': 'Lin',
  'Frm': 'Shp',
  'Mod': 'Tpl',

  /* ── LA LONGUE TRAINE ───────────────────────────────────────────────────── */
  /* ⚠ Aucun de ceux-la n est reclame par le compteur : `chainesProse` ecarte les
     chaines d un seul mot. Ce sont pourtant des etiquettes de glissiere et des
     pastilles d etat, lues a chaque geste. */
  'Annulé.': 'Undone.',
  'Rétabli.': 'Redone.',
  'Élément': 'Element',
  'élément(s)': 'element(s)',
  'élément(s).': 'element(s).',
  'Gras': 'Bold',
  'Italique': 'Italic',
  'Souligné': 'Underlined',
  'Interlettre': 'Letter spacing',
  'Interligne': 'Line spacing',
  'Remplissage': 'Fill',
  'Contour': 'Outline',
  'Ombre': 'Shadow',
  'Corps': 'Body',
  'Couleur': 'Colour',
  'Coins': 'Corners',
  'Rotation': 'Rotation',
  'Zoom': 'Zoom',
  'Luminosité': 'Brightness',
  'Contraste': 'Contrast',
  'Saturation': 'Saturation',
  'Flou': 'Blur',
  'Opacité': 'Opacity',
  'Épaisseur': 'Thickness',
  'Largeur': 'Width',
  'Hauteur': 'Height',
  'État': 'Status',
  'Afficher': 'Show',
  'Masquer': 'Hide',
  'Affiché': 'Shown',
  'Masqué': 'Hidden',
  'Verrouiller': 'Lock',
  'Déverrouiller': 'Unlock'
};
