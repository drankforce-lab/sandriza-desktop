'use strict';

/*
 * INVENTAIRE — les deux langues
 * =============================================================================
 * ⚠⚠ « SKU » NE SE TRADUIT PAS : c est un sigle employe tel quel en francais
 * comme en anglais, et il est IMPRIME sur les etiquettes. Le traduire couperait
 * l ecran du carton colle sur la marchandise.
 *
 * ⚠⚠ DEUX AVERTISSEMENTS COUTENT DE L ARGENT S ILS PERDENT DE LEUR FORCE :
 *   · renumeroter les SKU oblige a REIMPRIMER les etiquettes deja collees ;
 *   · « Inventaire NON enregistre » dit que RIEN n a ete ecrit — pas que
 *     l ecriture a peut-etre marche.
 * On garde les majuscules de « NON » : elles font la difference entre lire et
 * survoler.
 *
 * ⚠ ON NE TRADUIT QUE CE QUI SE LIT : les noms de produits, de variantes, de
 * lieux et de casiers sont de la DONNEE. Les CODES de variante et les SKU aussi.
 */

module.exports = {
  'Inventaire — Administration Sandriza': 'Inventory — Sandriza Administration',
  'Inventaire': 'Inventory',
  'Inventaire indisponible': 'Inventory unavailable',
  'Votre rôle ne permet pas de modifier l’inventaire.': 'Your role does not allow changing inventory.',
  'Ce produit n’existe plus.': 'This product no longer exists.',
  'Produit ouvert par quelqu’un d’autre.': 'Product open by someone else.',
  'Ouverte ailleurs': 'Open elsewhere',
  'Enregistrement bloqué : ce produit est ouvert ailleurs.':
    'Saving blocked: this product is open elsewhere.',
  'Lecture seule': 'Read only',

  /* ── CE QUI PEUT EMPECHER D ENREGISTRER ─────────────────────────────────── */
  'Inventaire NON enregistré — session expirée (inactivité, ou même compte utilisé ailleurs). Reconnectez-vous, puis refaites la saisie.':
    'Inventory NOT saved — session expired (inactivity, or the same account used elsewhere). Sign in again, then re-enter it.',
  'Inventaire NON enregistré (réseau). Réessayez.': 'Inventory NOT saved (network). Try again.',
  'Inventaire NON enregistré — la grille est incomplète (': 'Inventory NOT saved — the grid is incomplete (',
  '). Rouvrez le produit.': '). Reopen the product.',
  '⚠ Inventaire non enregistré': '⚠ Inventory not saved',
  'Un collègue vient de modifier': 'A colleague has just changed',
  '. Rien n’a été écrit.': '. Nothing was written.',
  'La grille est rechargée avec les quantités à jour :': 'The grid is reloaded with up-to-date quantities:',
  'refaites votre saisie par-dessus.': 're-enter your figures on top.',
  'Recharger la grille': 'Reload the grid',
  '✅ Inventaire enregistré': '✅ Inventory saved',
  'Seuil invalide pour :': 'Invalid threshold for:',
  'Sélectionnez un emplacement pour :': 'Select a location for:',

  /* ── LA RECHERCHE ET LES FILTRES ────────────────────────────────────────── */
  'Un code de variante scanné ouvre directement sa fiche.':
    'A scanned variant code opens its record directly.',
  'Trois caractères minimum pour une recherche par nom.':
    'Three characters minimum for a search by name.',
  'Trois caractères minimum.': 'Three characters minimum.',
  'Résultats —': 'Results —',
  'Aucun produit trouvé.': 'No product found.',
  'Tout afficher': 'Show all',
  'Filtrer :': 'Filter:',
  'Catégorie à afficher': 'Category to show',
  'Tous les lieux': 'All places',
  '— sans lieu —': '— no place —',
  '📦 Tout l’inventaire': '📦 All inventory',
  '🔴 En rupture': '🔴 Out of stock',
  '⚠ À commander': '⚠ To reorder',
  '✓ Seuil non atteint': '✓ Above threshold',
  'Seuil non atteint': 'Above threshold',
  'Non inventorié (sans SKU)': 'Not inventoried (no SKU)',

  /* ── LE RESUME DU HAUT ──────────────────────────────────────────────────── */
  'Produits inventoriés': 'Products inventoried',
  'Sans code SKU': 'Without a SKU',
  'non disponibles à l’achat': 'not available for purchase',
  'tous assignés ✓': 'all assigned ✓',
  'En rupture': 'Out of stock',
  'À réapprovisionner': 'To restock',
  'À réapprovisionner —': 'To restock —',
  '← Réapprovisionnement': '← Restocking',
  'voir l’onglet Réapprovisionnement': 'see the Restocking tab',
  'Unités en inventaire': 'Units in inventory',
  'produit(s) sans code SKU': 'product(s) without a SKU',
  '— ils sont bloqués à l’achat en boutique.': '— they are blocked from purchase in the shop.',
  'Assigner automatiquement': 'Assign automatically',
  'à commander': 'to reorder',
  '✓ Aucune variante à réapprovisionner — toutes sont au-dessus de leur seuil.':
    '✓ No variant to restock — all are above their threshold.',

  /* ── LES SKU, ET L AVERTISSEMENT QUI COUTE DES ETIQUETTES ───────────────── */
  'SKU assigné :': 'SKU assigned:',
  'SKU assigné(s) automatiquement.': 'SKU(s) assigned automatically.',
  'SKU normalisé(s).': 'SKU(s) normalized.',
  'Passer à six chiffres': 'Switch to six digits',
  'Passer les SKU à six chiffres': 'Switch SKUs to six digits',
  'numéro à quatre chiffres (': 'four-digit number (',
  '). Les nouveaux en comptent six': '). New ones have six',
  '. Renuméroter oblige à réimprimer les étiquettes': '. Renumbering forces reprinting the labels',
  'déjà collées.': 'already stuck on.',
  'produit(s) seront renumérotés (ex.': 'product(s) will be renumbered (e.g.',
  '). Les étiquettes déjà imprimées ne correspondront': '). Labels already printed will no longer match',
  'plus au nouveau code — il faudra les réimprimer pour la marchandise concernée.':
    'the new code — they will have to be reprinted for the goods concerned.',

  /* ── LA LISTE DES PRODUITS ──────────────────────────────────────────────── */
  'SKU Produit Cat.': 'SKU Product Cat.',
  'Tailles Couleurs': 'Sizes Colours',
  'Inventaire Actions': 'Inventory Actions',
  'Cliquer pour sélectionner': 'Click to select',
  'Cliquer pour modifier la fiche produit': 'Click to edit the product record',
  'sans SKU': 'no SKU',
  'En vente': 'For sale',
  'Vente finale': 'Final sale',
  'Vente finale en lot': 'Bulk final sale',
  '🔴 Appliquer vente finale': '🔴 Apply final sale',
  '✅ Retirer vente finale': '✅ Remove final sale',
  'Toute la page': 'The whole page',
  '+ Ajouter un produit': '+ Add a product',
  '📦 Inventaire': '📦 Inventory',
  '✎ Modifier': '✎ Edit',
  '🛒 Vendre': '🛒 Sell',
  'Nouveau produit ouvert dans sa fenêtre.': 'New product opened in its own window.',
  'Fiche produit ouverte dans sa fenêtre.': 'Product record opened in its own window.',
  'Aucun produit sélectionné.': 'No product selected.',
  'Le produit': 'The product',
  'est maintenant en vente.': 'is now for sale.',

  /* ── CE QUI PEUT EMPECHER D IMPRIMER ────────────────────────────────────── */
  /* ⚠ « Configuration » est le nom de l ecran, il ne se traduit pas — c est la
     regle deja suivie dans commande.js et depenses.js. Ce qui le suit, si. */
  'Impression indisponible dans cette fenêtre.': 'Printing is not available in this window.',
  'Aucune étiquette à imprimer (quantité 0).': 'No label to print (quantity 0).',
  'Aucune imprimante de codes-barres prête — voir Configuration puis Imprimantes.':
    'No barcode printer ready — see Configuration then Printers.',
  'L’impression a échoué.': 'Printing failed.',
  'Aucun code de catégorie configuré.': 'No category code configured.',

  /* ── LES REFUS DES LIEUX ET DES EMPLACEMENTS ────────────────────────────── */
  /* ⚠ CHAQUE REFUS GARDE SA CAUSE ET SON GESTE. « Reassignez-les d abord » dit
     QUOI faire ; un « impossible » seul laisse devant un mur. */
  'Donnez au moins un lieu, un casier ou une section.': 'Give at least a place, a bin or a section.',
  'Donnez un nom au lieu.': 'Give the place a name.',
  'Ce lieu n’existe plus — rechargez l’écran.': 'This place no longer exists — reload the screen.',
  'Cette version de l’application ne sait pas ouvrir cette fenêtre — quittez et relancez pour la mettre à jour.':
    'This version of the application cannot open this window — quit and restart it to update.',
  'Impossible :': 'Not possible:',
  ', déjà utilisé.': ', already in use.',
  'Suppression impossible —': 'Cannot delete —',
  'variante(s) utilisent l’emplacement': 'variant(s) use location',
  '. Réassignez-les d’abord.': '. Reassign them first.',
  '. Déplacez-les d’abord.': '. Move them first.',
  /* ⚠ LES GUILLEMETS FRANCAIS RESTENT : la fermeture « ». » est un fragment que
     le code ajoute a part, et le traduire seul donnerait une paire depareillee. */
  'Un lieu s’appelle déjà «': 'A place is already called «',

  /* ── L AVERTISSEMENT QUI MANQUE UN EMPLACEMENT OU UN SKU ────────────────── */
  /* ⚠ « Entrepot » est le nom d un onglet de CET ecran : il se traduit comme le
     libelle de l onglet, sinon la phrase envoie vers un onglet introuvable. */
  '⚠ Aucun emplacement configuré — créez-en un dans': '⚠ No location configured — create one in',
  'Inventaire puis Entrepôt pour pouvoir en assigner un aux variantes en stock.':
    'Inventory then Warehouse to be able to assign one to the variants in stock.',
  '⚠ Ce produit n’a pas de SKU de base — assignez-lui un SKU':
    '⚠ This product has no base SKU — assign it a SKU',
  'dans la liste d’inventaire pour générer les codes de variante et les étiquettes.':
    'in the inventory list to generate the variant codes and the labels.',

  /* ── LA GRILLE DES VARIANTES ────────────────────────────────────────────── */
  /* ⚠⚠ DEUX FORMES POUR UN SEUL EN-TETE, ET IL EN FAUT DEUX. Le POSEUR cherche
     des morceaux de la SOURCE (`<th>Variante</th>`), le COMPTEUR interroge le
     texte RENDU, ou les cellules voisines se lisent d un trait (« Variante Code
     Qte »). N en mettre qu une laisse l autre outil aveugle. */
  'Variante': 'Variant',
  'Code': 'Code',
  'Qté': 'Qty',
  'Seuil': 'Threshold',
  'Emplacement': 'Location',
  'Variante Code Qté': 'Variant Code Qty',
  'Seuil Emplacement': 'Threshold Location',
  'Aucune variante ne correspond aux filtres.': 'No variant matches the filters.',
  'Quantité —': 'Quantity —',
  'Emplacement —': 'Location —',
  'Seuil de cette variante — vide = celui du produit':
    'Threshold for this variant — empty = the product’s own',
  '← Préc.': '← Prev.',
  'Suiv. →': 'Next →',
  '← Liste': '← List',
  '🖨 Tous les codes-barres': '🖨 All barcodes',
  'Enregistrer l’inventaire': 'Save inventory',

  /* ── SUPPRIMER UN PRODUIT, ET LA PHOTOTHEQUE ────────────────────────────── */
  /* ⚠⚠ LA CASE DE LA PHOTOTHEQUE DECIDE DU SORT D UNE IMAGE QUI SERT AILLEURS.
     « Sans cette case, elle y reste pour servir a d autres fiches » est la
     phrase qui evite de vider une bibliotheque partagee en supprimant UNE fiche.
     Elle garde sa precision en anglais. */
  'Retirer aussi': 'Also remove',
  'de la photothèque (': 'from the photo library (',
  'Sans cette case,': 'Without this box,',
  'pour servir à d’autres fiches.': 'to serve other records.',
  'Supprimer de l’inventaire': 'Delete from inventory',
  'Supprimer définitivement': 'Permanently delete',
  'de l’inventaire ?': 'from inventory?',
  /* ⚠ LE BALISAGE VIT DANS LA CHAINE plutot que de la couper en deux : la phrase
     reste entiere, et l anglais peut mettre le gras ou sa grammaire le veut.
     La seconde forme est celle que le COMPTEUR lit, une fois les balises tombees. */
  'Cette action est <strong>irréversible</strong>.': 'This action is <strong>irreversible</strong>.',
  'Cette action est irréversible .': 'This action is irreversible .',
  'Produit supprimé': 'Product deleted',
  'photo(s) retirée(s) de la photothèque': 'photo(s) removed from the photo library',

  /* ── L ONGLET DES PRODUITS ENDOMMAGES ───────────────────────────────────── */
  /* ⚠ « Produits endommages » est aussi le LIBELLE d un onglet ; la VALEUR qui
     part au pont est `endommages`, et elle n a pas d entree ici — c est voulu. */
  'Produits endommagés <span class="note">— articles de retours non remis en inventaire</span>':
    'Damaged products <span class="note">— returned items not put back into inventory</span>',
  'Produits endommagés — articles de retours non remis en inventaire':
    'Damaged products — returned items not put back into inventory',
  'Produits endommagés': 'Damaged products',
  'Tout cumulé': 'All years combined',
  '🖨 Imprimer le rapport': '🖨 Print the report',
  'Aucun article endommagé': 'No damaged item',
  'Date': 'Date',
  'Commande': 'Order',
  'Article': 'Item',
  'Prix': 'Price',
  'Valeur': 'Value',
  'Raison': 'Reason',
  'Date Commande Article Qté': 'Date Order Item Qty',
  'Prix Valeur Raison': 'Price Value Reason',
  'Rapport envoyé à l’impression.': 'Report sent to the printer.',

  /* ── L ONGLET ENTREPOT : LES LIEUX ──────────────────────────────────────── */
  /* ⚠⚠ LE COMPTE RENDU DE LA MIGRATION NE SE TAIT PAS : ses emplacements ont ete
     decoupes en lieu/casier/section, et la phrase le lui dit. La traduire a moitie
     reviendrait a le laisser decouvrir seul que ses lignes ont change de forme. */
  '— aucun —': '— none —',
  'emplacement(s) répartis': 'location(s) split',
  'en lieu, casier et section': 'into place, bin and section',
  'emplacement(s) répartis en lieu, casier et section': 'location(s) split into place, bin and section',
  '— lieu(x) créé(s) :': '— place(s) created:',
  'Le libellé affiché n’a pas changé. Il ne manque que l’adresse de chaque lieu.':
    'The label shown has not changed. Only the address of each place is missing.',
  '. Le libellé affiché n’a pas changé. Il ne manque que l’adresse de chaque lieu.':
    '. The label shown has not changed. Only the address of each place is missing.',
  'Lieux': 'Places',
  '— les bâtiments, avec leur adresse': '— the buildings, with their address',
  'Lieux — les bâtiments, avec leur adresse': 'Places — the buildings, with their address',
  '+ Ajouter un lieu': '+ Add a place',
  'Lieu': 'Place',
  'Adresse': 'Address',
  'Actions': 'Actions',
  'Lieu Adresse Actions': 'Place Address Actions',
  'Aucun lieu — cliquez sur': 'No place — click',
  'pour déclarer un bâtiment.': 'to declare a building.',
  '+ Ajouter un lieu pour déclarer un bâtiment.': '+ Add a place to declare a building.',
  '— adresse à remplir —': '— address to fill in —',
  'Lieu de cet emplacement': 'Place of this location',
  'Adresse (optionnel)': 'Address (optional)',

  /* ── L ONGLET ENTREPOT : LES EMPLACEMENTS ───────────────────────────────── */
  /* ⚠ LES TROIS PARTIES D UN LIBELLE D EMPLACEMENT SE TRADUISENT, MAIS CE QU IL
     TAPE DEDANS EST DE LA DONNEE : « Casier 1 », « Section A » sont SES noms.
     Ce qui suit n habille que le CHAMP — exemple, etiquette, aide de recherche. */
  'Emplacements': 'Locations',
  '— où ranger les variantes': '— where to store the variants',
  'Emplacements — où ranger les variantes': 'Locations — where to store the variants',
  '+ Ajouter un emplacement': '+ Add a location',
  'Casier': 'Bin',
  'Section': 'Section',
  'Référence': 'Reference',
  'Lieu Casier Section Référence': 'Place Bin Section Reference',
  'Variantes assignées': 'Assigned variants',
  'Variantes assignées Actions': 'Assigned variants Actions',
  'Ex : Casier 1': 'E.g. Bin 1',
  'Ex : Section A': 'E.g. Section A',
  'Référence (optionnel)': 'Reference (optional)',
  'Casier, section, adresse, référence': 'Bin, section, address, reference',
  'Casier, section, adresse, référence…': 'Bin, section, address, reference…',
  'Aucun emplacement ne correspond au filtre.': 'No location matches the filter.',
  'Aucun emplacement — cliquez sur <b>+ Ajouter un emplacement</b> pour en créer un.':
    'No location — click <b>+ Add a location</b> to create one.',
  'Aucun emplacement — cliquez sur + Ajouter un emplacement pour en créer un.':
    'No location — click + Add a location to create one.',
  'Déclarez d’abord un lieu': 'Declare a place first',

  /* ── CE QUE REPOND L ENTREPOT ───────────────────────────────────────────── */
  'Le nom du lieu est requis.': 'The place name is required.',
  'Lieu modifié.': 'Place changed.',
  'Lieu créé.': 'Place created.',
  'Emplacement modifié.': 'Location changed.',
  'Emplacement créé.': 'Location created.',
  'Suppression impossible': 'Cannot delete',
  'Le lieu': 'The place',
  'emplacement(s) .': 'location(s) .',
  'Déplacez ou supprimez ces emplacements': 'Move or delete these locations',
  'avant de supprimer le lieu.': 'before deleting the place.',
  'Supprimer le lieu': 'Delete the place',
  '? Aucun emplacement ne s’y trouve.': '? No location is in it.',
  'Lieu «': 'Place «',
  '» supprimé.': '» deleted.',
  'est utilisé par': 'is used by',
  'variante(s) de produit.': 'product variant(s).',
  'Réassignez ces variantes à un autre': 'Reassign these variants to another',
  'emplacement avant de supprimer celui-ci.': 'location before deleting this one.',
  'Supprimer l’emplacement': 'Delete the location',
  '? Aucune variante ne l’utilise.': '? No variant uses it.',
  'Emplacement «': 'Location «',

  /* ── LE TITRE DE LA FENETRE QUAND ELLE OUVRE UN PRODUIT ─────────────────── */
  'Ajustement de stock': 'Stock adjustment',

  /* ── APRES L ENREGISTREMENT : LES CLIENTS EN ATTENTE ────────────────────── */
  /* ⚠⚠ ON NE PRETEND PAS QUE LE COURRIEL EST PARTI. Cette phrase existe pour
     qu il ne croie pas ses clients prevenus : la cle d envoi n est pas posee,
     les demandes restent en attente. L affaiblir ferait perdre des ventes en
     silence — elle reste aussi nette en anglais. */
  'cette variante, et': 'this variant, and',
  'aucun courriel n’est parti — la clé d’envoi n’est pas configurée':
    'no email was sent — the sending key is not configured',
  '(Configuration puis Infolettre). Les demandes restent en attente.':
    '(Configuration then Newsletter). The requests stay pending.',
  'de retour en inventaire envoyé': 'back-in-stock email sent',

  /* ── LES ETIQUETTES ─────────────────────────────────────────────────────── */
  /* ⚠⚠ « TELLES QU ELLES SONT SAISIES A L ECRAN, MEME SI L INVENTAIRE N EST PAS
     ENCORE ENREGISTRE » — cette phrase evite d imprimer une planche pour des
     quantites qu on croit enregistrees et qui ne le sont pas. Du carton et de
     l encre en dependent : elle garde sa precision. */
  'Imprimer les étiquettes code-barres selon les quantités saisies ?':
    'Print the barcode labels for the quantities entered?',
  'Plus tard': 'Later',
  '🖨 Imprimer maintenant': '🖨 Print now',
  'étiquette(s) envoyée(s) à «': 'label(s) sent to «',
  '🏷 Imprimer des étiquettes': '🏷 Print labels',
  'Nombre d’étiquettes': 'Number of labels',
  'Quantité invalide.': 'Invalid quantity.',
  'Aucune variante en stock à imprimer.': 'No variant in stock to print.',
  '🏷 Imprimer les étiquettes': '🏷 Print the labels',
  'en stock ?': 'in stock?',
  'Quantités telles qu’elles sont saisies à l’écran,': 'Quantities as entered on screen,',
  'même si l’inventaire n’est pas encore enregistré.': 'even if the inventory is not saved yet.',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════
   * ⚠⚠⚠ CE BLOC EXISTE A CAUSE D UNE FAUTE MESUREE, ET IL FAUT LA CONNAITRE.
   * Le COMPTEUR lit le texte RENDU : `<span class="ic">🖨</span> Tous les
   * codes-barres` s y lit « 🖨 Tous les codes-barres », d un seul tenant. Une
   * cle ecrite sous CETTE forme a donc une decision, et le compteur annonce
   * « 0 a traduire ». Mais le POSEUR, lui, cherche dans la SOURCE, ou le
   * pictogramme vit dans sa balise : il ne trouve rien, et se taisait.
   * Resultat mesure le 2026-09-12 : compteur a zero, 27 textes encore EN
   * FRANCAIS a l ecran. ➡ Il faut les DEUX formes, et c est `langue-poser` qui
   * dit maintenant lesquelles n ont rien trouve.
   * ⚠ Le verdict n appartient ni au compteur ni au poseur, mais a
   * `banc-langue-residuel`, qui lit la page ANGLAISE.
   * ══════════════════════════════════════════════════════════════════════════ */

  /* ── LES ONGLETS ────────────────────────────────────────────────────────── */
  /* ⚠ LE LIBELLE SE TRADUIT, LA VALEUR NON : `['reappro', 'Reapprovisionnement']`
     — c est `reappro` qui circule, et elle n a pas d entree ici. */
  'Produits': 'Products',
  'Réapprovisionnement': 'Restocking',
  'Entrepôt': 'Warehouse',

  /* ── LES EN-TETES DE LA LISTE ───────────────────────────────────────────── */
  'Produit': 'Product',
  'Cat.': 'Cat.',
  'Tailles': 'Sizes',
  'Couleurs': 'Colours',
  'Résultats': 'Results',

  /* ── CE QUE LE PICTOGRAMME SEPARE DE SON TEXTE ──────────────────────────── */
  'Tout l’inventaire': 'All inventory',
  'À commander': 'To reorder',
  'Appliquer vente finale': 'Apply final sale',
  'Retirer vente finale': 'Remove final sale',
  'Vendre': 'Sell',
  'Modifier': 'Edit',
  'Tous les codes-barres': 'All barcodes',
  'Imprimer le rapport': 'Print the report',
  'Imprimer maintenant': 'Print now',
  'Imprimer des étiquettes': 'Print labels',
  'Imprimer les étiquettes': 'Print the labels',
  'Inventaire enregistré': 'Inventory saved',
  'Inventaire non enregistré': 'Inventory not saved',
  'Aucun emplacement configuré — créez-en un dans': 'No location configured — create one in',
  'Ce produit n’a pas de SKU de base — assignez-lui un SKU':
    'This product has no base SKU — assign it a SKU',

  /* ── CE QU UN <strong> COUPE EN DEUX ────────────────────────────────────── */
  /* ⚠ LE BALISAGE DANS LA CHAINE plutot que la chaine en morceaux : la phrase
     reste entiere et l anglais place son gras ou sa grammaire le demande. */
  'Rien n’a été écrit.': 'Nothing was written.',
  'Renuméroter oblige à réimprimer les étiquettes': 'Renumbering forces reprinting the labels',
  '). Les étiquettes <strong>déjà imprimées</strong> ne correspondront ':
    '). Labels <strong>already printed</strong> will no longer match ',
  'sans code SKU': 'without a SKU',
  'variante(s)</strong> de produit.': 'product variant(s)</strong>.',
  'emplacement(s) sont dans le lieu': 'location(s) are in place',
  'emplacement(s)': 'location(s)',
  'produit(s)': 'product(s)',

  /* ── LA LONGUE TRAINE : LES MOTS COLLES A UN NOMBRE ─────────────────────── */
  /* ⚠⚠ AUCUN DE CEUX-LA N EST RECLAME PAR LE COMPTEUR, et c est le sujet :
     `chainesProse` ecarte volontairement les chaines d UN SEUL MOT pour ne pas
     prendre un identifiant pour une phrase. Un mot francais colle a un nombre
     — « 3 unite », « 12 etiquette » — traverse donc le compteur sans un bruit
     et s affiche tel quel sur la page anglaise. Seul le banc du residuel les voit.
     ⚠ Ils sont surs ici parce que les phrases PLUS LONGUES qui les contiennent
     sont, elles aussi, au dictionnaire : le poseur pose du plus long au plus
     court, et une phrase deja posee est un jeton ou plus aucune cle ne rentre. */
  'unité': 'unit',
  'produit': 'product',
  'sélectionné': 'selected',
  'Sélectionner': 'Select',
  'Réinitialiser': 'Reset',
  'Irréversible.': 'Irreversible.',
  'Renuméroter': 'Renumber',
  'activée': 'activated',
  'retirée': 'removed',
  'endommagé': 'damaged',
  'échec': 'failure',
  'étiquette': 'label',
  'variante': 'variant',
  'courriel': 'email',
  'Cliquer pour voir la liste': 'Click to see the list',
  ' pour ': ' for ',
  'Total': 'Total',
  'valeur perdue (avant taxes)': 'value lost (before taxes)',
  'Compris': 'Understood',
  'Annuler': 'Cancel',
  'Supprimer': 'Delete',
  'Imprimer': 'Print',
  'Fermer': 'Close',
  'Effacer': 'Clear',
  /* ⚠ COUPEE PAR UN <strong> : la source ecrit la phrase en DEUX litteraux.
     Sans ces deux cles, « courriel » se traduisait seul et rendait une phrase
     moitie anglaise — sur l avertissement qui dit justement que RIEN n est parti. */
  'aucun courriel n’est parti': 'no email was sent',
  '— la clé d’envoi n’est pas configurée': '— the sending key is not configured'
};
