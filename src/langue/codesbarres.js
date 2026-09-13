'use strict';

/*
 * IMPRESSION DE CODES-BARRES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LE PIRE DEFAUT DE CET ECRAN, VECU A L ENTREPOT : l etiquette sort JOLIE et
 * ne se scanne pas. Tout le garde-fou de lisibilite tient dans des phrases qui
 * doivent rester exactes :
 *   · « la barre la plus fine tomberait à 1 point, sous le seuil de lecture »
 *   · « L’étiquette s’imprimera correctement — MAIS ELLE NE SE LIRA PAS. »
 *   · les DEUX leviers : raccourcir le code couleur, ou une étiquette plus
 *     large ; et « une imprimante 300 ppp règle aussi le cas ».
 * Perdre l un des trois, c est laisser imprimer une planche entiere pour rien.
 *
 * ⚠⚠ LES SKU, LES TAILLES ET LES COULEURS SONT DES DONNEES : ils sont IMPRIMES
 * sur l etiquette et scannes ensuite. Rien de ce qui compose un code ne passe
 * par ce dictionnaire — pas meme le nom de produit d essai.
 *
 * ⚠ LES UNITES sont des unites : « po » (pouces), « ppp » (points par pouce),
 * « modules ». Elles se traduisent quand l anglais en a une autre (in, dpi),
 * jamais quand elles nomment une mesure du code-barres.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Impression de codes-barres — Administration Sandriza':
    'Barcode printing — Sandriza Administration',
  'Impression de codes-barres': 'Barcode printing',
  'Codes-barres indisponibles': 'Barcodes unavailable',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès à l’inventaire.':
    'Your role does not give access to the inventory.',
  'Cette fiche n’existe plus.': 'This record no longer exists.',
  'Ce produit n’a pas de SKU — assignez-lui un SKU d’abord.':
    'This product has no SKU — give it one first.',
  'L’impression n’est pas disponible dans la fenêtre principale.':
    'Printing is not available in the main window.',
  'La file d’impression est vide.': 'The print queue is empty.',
  'Aucune imprimante d’étiquettes prête. Vérifiez Configuration → Imprimantes.':
    'No label printer ready. Check Configuration → Printers.',
  'L’impression a échoué. Vérifiez l’imprimante, puis réessayez.':
    'Printing failed. Check the printer, then try again.',

  /* ── LA LISTE DES PRODUITS ──────────────────────────────────────────────── */
  'Nom ou SKU': 'Name or SKU',
  'Nom ou SKU…': 'Name or SKU…',
  'Toutes les catégories': 'All the categories',
  ' produits': ' products',
  ' produit': ' product',
  'produits': 'products',
  'produit': 'product',
  'Aucun produit trouvé.': 'No product found.',
  'SKU': 'SKU',
  'Produit': 'Product',
  'Catégorie': 'Category',
  'Stock': 'Stock',
  'Ajouter': 'Add',
  'SKU Produit Catégorie': 'SKU Product Category',
  'Stock Ajouter': 'Stock Add',
  '🏷️ Étiquettes': '🏷️ Labels',
  'Étiquettes': 'Labels',
  'Ajouter toutes les variantes en stock (quantité = stock)':
    'Add every variant in stock (quantity = stock)',
  '+ Stock': '+ Stock',
  'SKU requis': 'SKU required',
  'sans SKU': 'no SKU',
  'Rupture': 'Out of stock',
  'bas': 'low',
  'Page ': 'Page ',

  /* ── LE CHOIX DES VARIANTES ─────────────────────────────────────────────── */
  ' — choisir les variantes': ' — choose the variants',
  '— choisir les variantes': '— choose the variants',
  'stock : ': 'stock: ',
  'stock :': 'stock:',
  'Quantité à imprimer — ': 'Quantity to print — ',
  'Quantité à imprimer —': 'Quantity to print —',
  '➕ Ajouter à la file': '➕ Add to the queue',

  /* ── LA FILE D IMPRESSION ───────────────────────────────────────────────── */
  'File d’impression': 'Print queue',
  ' lignes': ' lines',
  ' ligne': ' line',
  'lignes': 'lines',
  'ligne': 'line',
  ' étiquettes': ' labels',
  ' étiquette': ' label',
  'étiquettes': 'labels',
  'étiquette': 'label',
  'Rien à imprimer. Choisissez des variantes à gauche.':
    'Nothing to print. Choose variants on the left.',
  'Moins': 'Less',
  'Plus': 'More',
  'Retirer': 'Remove',
  'Confirmer ?': 'Confirm?',
  '🗑 Vider': '🗑 Empty',
  'Vider': 'Empty',
  '🖨 Imprimer ': '🖨 Print ',
  '🖨 Imprimer': '🖨 Print',
  'Imprimer ': 'Print ',
  'File vidée.': 'Queue emptied.',
  'Lecture des variantes…': 'Reading the variants…',
  'Aucune variante en stock pour ce produit.': 'No variant in stock for this product.',
  'Aucune variante cochée avec une quantité au-dessus de zéro.':
    'No variant ticked with a quantity above zero.',

  /* ══ LE GARDE-FOU DU CODE ILLISIBLE ════════════════════════════════════════
   * ⚠⚠⚠ Trois phrases, trois choses a ne pas perdre. Le <strong> coupe : les
   * cles portent la balise, et les formes rendues suivent. */
  'Vérification de la lisibilité…': 'Checking readability…',
  'Lisibilité non vérifiable — impression lancée.':
    'Readability cannot be checked — printing started.',
  'Ces codes ne se scanneront pas': 'These codes will not scan',
  '⚠ Ces codes ne se scanneront pas': '⚠ These codes will not scan',
  'Sur une étiquette de <strong>': 'On a <strong>',
  'Sur une étiquette de': 'On a',
  ' po</strong> à <strong>': ' in</strong> label at <strong>',
  ' ppp</strong>, ': ' dpi</strong>, ',
  'ces codes sont trop longs': 'these codes are too long',
  'ce code est trop long': 'this code is too long',
  ' : la barre la plus fine tomberait à ': ': the thinnest bar would fall to ',
  ': la barre la plus fine tomberait à': ': the thinnest bar would fall to',
  '<strong>1 point</strong>, sous le seuil de lecture des lecteurs. ':
    '<strong>1 dot</strong>, under the reading threshold of the scanners. ',
  '1 point , sous le seuil de lecture des lecteurs.':
    '1 dot , under the reading threshold of the scanners.',
  /* ⚠⚠ LA PHRASE QUI DIT QUE LE DEFAUT NE SE VOIT PAS. */
  'L’étiquette s’imprimera correctement — mais elle ne se lira pas.':
    'The label will print properly — but it will not be read.',
  ' modules · il faudrait une ': ' modules · you would need a ',
  'étiquette d’au moins ': 'label of at least ',
  'étiquette d’au moins': 'label of at least',
  ' po': ' in',
  /* ⚠⚠ LES DEUX LEVIERS, ET LE TROISIEME. */
  'Deux leviers : raccourcir le <strong>code couleur</strong> ':
    'Two levers: shorten the <strong>colour code</strong> ',
  'Deux leviers : raccourcir le code couleur':
    'Two levers: shorten the colour code',
  '(Inventaire → Attributs → Couleurs) ou passer à une étiquette plus large. ':
    '(Inventory → Attributes → Colours) or move to a wider label. ',
  '(Inventaire → Attributs → Couleurs) ou passer à une étiquette plus large.':
    '(Inventory → Attributes → Colours) or move to a wider label.',
  'Une imprimante 300 ppp règle aussi le cas.': 'A 300 dpi printer also settles it.',
  'Imprimer quand même': 'Print anyway',
  'Impression annulée.': 'Printing cancelled.',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Impression de ': 'Printing ',
  'Impression de': 'Printing',
  ' étiquettes…': ' labels…',
  ' étiquette…': ' label…',
  ' étiquettes envoyées': ' labels sent',
  ' étiquette envoyée': ' label sent',
  'étiquettes envoyées': 'labels sent',
  'étiquette envoyée': 'label sent',
  ' à « ': ' to « ',
  ' ne se scannera pas (': ' will not scan (',
  ' point par barre).': ' dot per bar).',
  'point par barre).': 'dot per bar).',

  /* ⚠ LE NOM DE PRODUIT D ESSAI EST UNE DONNEE : il ne se traduit pas. L entree
     existe pour que le compteur voie une DECISION, pas un oubli. */
  'Robe Élégance mi-longue': 'Robe Élégance mi-longue',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Page': 'Page',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'modules · il faudrait une': 'modules · you would need a'
};
