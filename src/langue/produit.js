'use strict';

/*
 * FICHE PRODUIT — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN ECRIT LA FICHE QUE LA BOUTIQUE MONTRE. Ce qu on y tape — nom,
 * description, tailles, couleurs, emplacements — est de la DONNEE et ne se
 * traduit jamais. Les listes de classement (genre, groupe d age, style, guides
 * des tailles) viennent du SERVEUR : leurs libelles sont ses propres mots, pas
 * les notres. Seuls les textes de l ECRAN sont ici.
 *
 * ⚠⚠ DEUX GARDES-FOUS D ARGENT, et ils gardent leur fermete :
 *   · « prix inferieur au cout d acquisition » — une vente A PERTE, qui demande
 *     une raison ET un code d autorisation. La phrase ne se resume pas ;
 *   · « chaque generation consomme des credits Fal.ai ».
 *
 * ⚠ ET DEUX PHRASES QUI EVITENT DE PERDRE UNE SAISIE : le brouillon garde
 * 15 minutes puis disparait de lui-meme, et « l enregistrement prend du temps et
 * se poursuit peut-etre — verifiez la liste avant de recommencer ». Sans la
 * seconde, on enregistre deux fois le meme produit.
 */

module.exports = {
  /* ── L EN-TETE ──────────────────────────────────────────────────────────── */
  'Produit — Administration Sandriza': 'Product — Sandriza Administration',
  'Produit': 'Product',
  'Modifier le produit': 'Edit the product',
  'Nouveau produit': 'New product',
  'Formulaire indisponible': 'Form unavailable',
  'Fiche indisponible': 'Record unavailable',
  'Aperçu': 'Preview',
  '👁 Aperçu boutique': '👁 Shop preview',
  'Aperçu boutique — dessiné par le site, avec ses vraies fonctions':
    'Shop preview — drawn by the site, with its real behaviour',
  'Grille boutique': 'Shop grid',
  'Page produit': 'Product page',

  /* ── CE QUI EMPECHE D ENREGISTRER ───────────────────────────────────────── */
  'Le prix doit être supérieur à zéro.': 'The price must be greater than zero.',
  'Le coût d’acquisition est obligatoire.': 'The purchase cost is required.',
  'Le poids unitaire est obligatoire.': 'The unit weight is required.',
  'La photo principale est obligatoire.': 'The main photo is required.',
  'Choisissez au moins une taille ET une couleur.': 'Choose at least one size AND one colour.',
  'Choisissez au moins une taille ET une couleur avant d’enregistrer.':
    'Choose at least one size AND one colour before saving.',
  'Un emplacement d’entrepôt manque pour des variantes en stock.':
    'A warehouse location is missing for variants in stock.',
  'Saisissez une quantité pour au moins une variante.':
    'Enter a quantity for at least one variant.',
  'Saisissez une quantité pour au moins une variante avant d’enregistrer.':
    'Enter a quantity for at least one variant before saving.',
  'Sélectionnez un emplacement d’entrepôt pour :': 'Select a warehouse location for:',
  'Cette couleur n’a pas de teinte unie attribuée.': 'This colour has no solid shade assigned.',
  /* ⚠⚠ ELLE DIT QUE RIEN N A ETE ECRIT, ET POURQUOI. La reduire a « echec »
     ferait rouvrir la fiche en croyant avoir enregistre. */
  'La fiche n’a PAS été enregistrée. Voyez l’avis dans la fenêtre principale — le plus souvent, un collègue vient de modifier la même fiche.':
    'The record was NOT saved. See the notice in the main window — most often, a colleague has just changed the same record.',
  'Enregistrement bloqué : cette fiche est ouverte ailleurs.':
    'Saving blocked: this record is open elsewhere.',

  /* ── IDENTITE, PRIX ET POIDS ────────────────────────────────────────────── */
  'Identité, prix et poids': 'Identity, price and weight',
  'Nom du produit': 'Product name',
  'Ex : Robe fleurie été': 'E.g. Floral summer dress',
  'Code (SKU)': 'Code (SKU)',
  'Code (SKU) :': 'Code (SKU):',
  'calcul du code…': 'working out the code…',
  'aucun code configuré pour cette catégorie': 'no code configured for this category',
  'Aucun préfixe de code n’est configuré pour cette catégorie — voyez Inventaire → Catégories.':
    'No code prefix is configured for this category — see Inventory → Categories.',
  'Poids unitaire *': 'Unit weight *',
  'Sert au calcul des frais d’expédition.': 'Used to work out the shipping cost.',
  'Unité du poids': 'Weight unit',
  'Classement': 'Classification',
  'Genre': 'Gender',
  'Groupe d’âge': 'Age group',
  'Style': 'Style',
  'Guide des tailles': 'Size guide',
  'Non précisé': 'Not specified',
  'Prix de vente ($)': 'Selling price ($)',
  'Prix soldé ($)': 'Sale price ($)',
  'Coût d’acquisition ($)': 'Purchase cost ($)',
  'Prix régulier': 'Regular price',
  'Prix soldé': 'Sale price',
  'Coût d’acquisition': 'Purchase cost',

  /* ── LA DESCRIPTION REDIGEE PAR L IA ────────────────────────────────────── */
  '✨ Rédiger avec l’IA': '✨ Write with AI',
  'Analyse la photo du produit et propose une description.':
    'Looks at the product photo and suggests a description.',
  'Ajoutez d’abord une photo à l’étape « Photo » : le service regarde le vêtement.':
    'Add a photo at the « Photo » step first: the service looks at the garment.',
  'Rédaction en cours…': 'Writing…',
  'Description rédigée — relisez-la avant d’enregistrer.':
    'Description written — read it over before saving.',
  'Description courte': 'Short description',

  /* ── TAILLES ET COULEURS ────────────────────────────────────────────────── */
  'Tailles et couleurs': 'Sizes and colours',
  'Tailles offertes': 'Sizes offered',
  'Aucune taille au référentiel.': 'No size in the reference list.',
  'Couleurs offertes': 'Colours offered',
  'Aucune couleur choisie.': 'No colour chosen.',
  '» est déjà dans la liste.': '» is already in the list.',
  'déjà choisie': 'already chosen',

  /* ── LA MARGE, ET LA VENTE A PERTE ──────────────────────────────────────── */
  /* ⚠⚠ GARDE-FOU D ARGENT : vendre sous le cout d acquisition demande une RAISON
     et un CODE D AUTORISATION. Les phrases disent le chiffre ET le mot. */
  'sous le coût d’acquisition': 'below the purchase cost',
  'Le prix de vente effectif (': 'The effective selling price (',
  '$) est inférieur au coût d’acquisition (': '$) is below the purchase cost (',
  'Marge :': 'Margin:',
  '— calculée sur le prix soldé': '— worked out on the sale price',
  '— vente à perte': '— sold at a loss',
  '⚠ Prix inférieur au coût d’acquisition': '⚠ Price below the purchase cost',
  '$ ) est inférieur': '$ ) is below',
  'au coût d’acquisition (': 'the purchase cost (',
  'Raison *': 'Reason *',
  'Code d’autorisation *': 'Authorisation code *',
  'Autoriser et enregistrer': 'Authorise and save',
  'La raison est obligatoire.': 'The reason is required.',
  'Code incorrect — réessayez.': 'Wrong code — try again.',
  'Enregistrement annulé.': 'Saving cancelled.',

  /* ── LES PHOTOS ─────────────────────────────────────────────────────────── */
  'Photo principale': 'Main photo',
  'Devant': 'Front',
  'Derrière': 'Back',
  'Côté gauche': 'Left side',
  'Côté droit': 'Right side',
  'Autre': 'Other',
  'Photos — 1 principale +': 'Photos — 1 main +',
  'supplémentaires maximum': 'extra at most',
  'Photos — principale + vues': 'Photos — main + views',
  'photos supplémentaires —': 'extra photos —',
  'photos supplémentaires.': 'extra photos.',
  'Il en manque': 'Still missing',
  'Photo principale remplacée — l’ancienne est restée dans la ligne.':
    'Main photo replaced — the old one stayed in the row.',
  '✂ Décor': '✂ Scene',
  '✂ Détourer et changer le décor': '✂ Cut out and change the scene',
  '✓ Utiliser cette photo': '✓ Use this photo',
  'Photo principale remplacée par la version détourée.':
    'Main photo replaced by the cut-out version.',

  /* ── LA PHOTO PAR COULEUR ───────────────────────────────────────────────── */
  'Photo par couleur': 'Photo per colour',
  'Photo par couleur (Manuel)': 'Photo per colour (Manual)',
  'Variantes de couleur (Auto)': 'Colour variants (Auto)',
  'Variantes de couleur :': 'Colour variants:',
  'Variantes de couleur générées': 'Colour variants generated',
  '— sans teinte attribuée pour :': '— with no shade assigned for:',
  '(Inventaire → Références)': '(Inventory → Reference lists)',
  'Tout générer': 'Generate all',
  'à générer': 'to generate',
  'Générées en teintant les photos du produit — et régénérées automatiquement':
    'Generated by tinting the product photos — and regenerated automatically',
  'à l’enregistrement. Le client voit la photo de la couleur qu’il choisit.':
    'on saving. The customer sees the photo of the colour they choose.',
  'Ajoutez une photo par couleur. Le client voit la photo de la couleur qu’il':
    'Add one photo per colour. The customer sees the photo of the colour they',
  'choisit ; sans photo, c’est la photo principale qui s’affiche.':
    'choose; with no photo, the main photo is shown.',
  'Choisissez d’abord des couleurs à l’étape « Tailles et couleurs ».':
    'Choose colours at the « Sizes and colours » step first.',
  'Ajoutez au moins une couleur de plus — «': 'Add at least one more colour — «',
  '» est la couleur principale, ses photos sont celles du produit.':
    '» is the main colour, its photos are the product’s own.',

  /* ── LE MANNEQUIN ENGENDRE (credits Fal.ai) ─────────────────────────────── */
  /* ⚠⚠ PHRASE A CREDITS : chaque generation coute. */
  '✨ Mannequin IA': '✨ AI model',
  'Le vêtement de la photo principale sera porté par le modèle choisi.':
    'The garment in the main photo will be worn by the chosen model.',
  'Chaque génération consomme des crédits Fal.ai.': 'Each generation uses Fal.ai credits.',
  'Type de vêtement': 'Garment type',
  'Robes / Combinaisons': 'Dresses / Jumpsuits',
  'Hauts / Vestes / Manteaux': 'Tops / Jackets / Coats',
  'Bas — Pantalons / Jupes': 'Bottoms — Trousers / Skirts',
  '✨ Générer': '✨ Generate',
  'Choisissez un modèle, puis Générer.': 'Choose a model, then Generate.',
  'Choisissez d’abord un modèle.': 'Choose a model first.',
  '⚠ Clé Fal.ai non configurée —': '⚠ Fal.ai key not configured —',
  'Configuration de la fenêtre principale.': 'Configuration in the main window.',
  'Clé Fal.ai non configurée.': 'Fal.ai key not configured.',
  '⚠ Aucun mannequin enregistré —': '⚠ No model saved —',
  'ajoutez-en dans Configuration → Apparence → Modèles par vue ,':
    'add some under Configuration → Appearance → Models per view ,',
  'section « Mannequins ».': 'section « Models ».',
  'Génération en cours — jusqu’à 2 minutes…': 'Generating — up to 2 minutes…',
  '⏳ Génération…': '⏳ Generating…',
  '↻ Régénérer': '↻ Regenerate',
  'Ce modèle n’existe plus — rechargez.': 'This model no longer exists — reload.',
  'Photo principale remplacée par la photo portée.':
    'Main photo replaced by the worn photo.',

  /* ── MISE EN MARCHE ─────────────────────────────────────────────────────── */
  'Mise en marché': 'Going to market',
  'Produit actif (visible en boutique)': 'Product active (visible in the shop)',
  'Visible en boutique': 'Visible in the shop',
  'Régime de vente': 'Sale regime',
  '🛍 Normal': '🛍 Normal',
  'Normal': 'Normal',
  '🟡 Liquidation': '🟡 Clearance',
  'Liquidation': 'Clearance',
  '🔴 Vente finale': '🔴 Final sale',
  'Vente finale': 'Final sale',
  '✅ Acceptés': '✅ Accepted',
  'Acceptés': 'Accepted',
  '🚫 Aucun retour': '🚫 No returns',
  'Aucun retour': 'No returns',
  'Alerte et limites': 'Alert and limits',
  'Seuil d’alerte': 'Alert threshold',
  'Limite par client': 'Limit per customer',

  /* ── LE STOCK PAR VARIANTE ──────────────────────────────────────────────── */
  'Stock par variante': 'Stock per variant',
  'Au moins une variante doit porter': 'At least one variant must carry',
  'une quantité, et un emplacement d’entrepôt est obligatoire dès qu’une quantité':
    'a quantity, and a warehouse location is required as soon as a quantity',
  'dépasse zéro.': 'goes above zero.',
  '⚠ Aucun emplacement': '⚠ No location',
  'configuré — créez-en un dans Inventaire → Entrepôt pour pouvoir en assigner un aux':
    'configured — create one under Inventory → Warehouse to be able to assign one to the',
  'variantes en stock.': 'variants in stock.',
  'Taille Couleur': 'Size Colour',
  'Quantité Entrepôt': 'Quantity Warehouse',
  'Taille': 'Size',
  'Couleur': 'Colour',
  'Quantité': 'Quantity',
  'Entrepôt': 'Warehouse',
  'Quantité —': 'Quantity —',
  'Emplacement —': 'Location —',
  'Choisir l’emplacement': 'Choose the location',
  'unités au total': 'units in total',
  'unité au total': 'unit in total',
  'Choisissez au moins une taille et une couleur à l’étape « Tailles et couleurs ».':
    'Choose at least one size and one colour at the « Sizes and colours » step.',

  /* ── LES MODIFICATIONS DE CETTE FICHE ───────────────────────────────────── */
  'Modifications de cette fiche': 'Changes to this record',
  '🕘 Modifications de cette fiche': '🕘 Changes to this record',
  '🕘 Historique complet': '🕘 Full history',
  'à l’instant': 'just now',
  'Non enregistrées': 'Not saved',
  'Lecture des modifications enregistrées…': 'Reading saved changes…',
  'Modifications enregistrées indisponibles (': 'Saved changes unavailable (',
  ') — réessayer .': ') — try again .',
  'Enregistrées — dernières 24 h': 'Saved — last 24 h',
  'Auteur non enregistré': 'Author not recorded',
  'Après 24 h, ces modifications ne s’affichent plus ici — elles restent':
    'After 24 h these changes no longer show here — they stay',
  'consultables dans 🕘 tout l’historique .': 'available under 🕘 the full history .',
  'Aucune modification depuis l’ouverture, et aucune enregistrée':
    'No change since opening, and none saved',
  'dans les dernières 24 h. 🕘 Tout l’historique': 'in the last 24 h. 🕘 Full history',
  'Aucune modification.': 'No change.',
  'Historique indisponible :': 'History unavailable:',
  '. Rien n’est perdu — réessayez une fois reconnecté.':
    '. Nothing is lost — try again once signed in.',
  'Aucune modification enregistrée pour cet article.': 'No saved change for this item.',
  'Modifications conservées': 'Changes kept',
  'jusqu’au retrait de l’article, archivées par année, purgées au-delà de 5 ans.':
    'until the item is withdrawn, archived by year, purged beyond 5 years.',

  /* ── LE BROUILLON ───────────────────────────────────────────────────────── */
  /* ⚠ SANS CES PHRASES ON CROIT AVOIR PERDU UNE SAISIE — ou l on compte sur un
     brouillon qui a deja disparu. Les 15 minutes se disent. */
  'Brouillon non conservé —': 'Draft not kept —',
  'Brouillon repris.': 'Draft resumed.',
  'Brouillon conservé…': 'Draft kept…',
  '📝 Un brouillon non terminé': '📝 An unfinished draft',
  'Une saisie a été laissée en cours': 'An entry was left in progress',
  '. La reprendre, ou repartir d’une fiche vierge ?':
    '. Resume it, or start from a blank record?',
  'Un brouillon est gardé 15 minutes,': 'A draft is kept for 15 minutes,',
  'puis il disparaît de lui-même.': 'then it disappears on its own.',

  /* ── L ENREGISTREMENT ───────────────────────────────────────────────────── */
  /* ⚠⚠ « VERIFIEZ LA LISTE AVANT DE RECOMMENCER » evite d enregistrer deux fois
     le meme produit quand le depot de la photo est long. */
  'Dépôt de la photo et enregistrement…': 'Uploading the photo and saving…',
  'L’enregistrement prend du temps (dépôt de la photo) et se poursuit':
    'Saving is taking a while (uploading the photo) and may still be',
  'peut-être — vérifiez la liste des produits avant de recommencer.':
    'going — check the product list before starting over.',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════
   * Le pictogramme vit dans son `<span class="ic">`, l asterisque d un champ
   * obligatoire dans son `<span class="req">`, et plusieurs phrases sont coupees
   * par un `<strong>` ou par un `<span class="lien">` cliquable. Le COMPTEUR lit
   * le texte rendu, le POSEUR la source : il faut les deux formes.
   * ══════════════════════════════════════════════════════════════════════════ */
  'Rédiger avec l’IA': 'Write with AI',
  'Mannequin IA': 'AI model',
  'Décor': 'Scene',
  'Détourer et changer le décor': 'Cut out and change the scene',
  'Détourage…': 'Cutting out…',
  'Générer': 'Generate',
  'Aperçu boutique': 'Shop preview',
  'Vente finale': 'Final sale',
  'Liquidation': 'Clearance',
  'Aucun retour': 'No returns',
  'Acceptés': 'Accepted',
  'Aucun emplacement ': 'No location ',
  'Clé Fal.ai non configurée — ': 'Fal.ai key not configured — ',
  'Aucun mannequin enregistré — ': 'No model saved — ',
  'ajoutez-en dans <strong>Configuration → Apparence → Modèles par vue</strong>, ':
    'add some under <strong>Configuration → Appearance → Models per view</strong>, ',
  'Prix inférieur au coût d’acquisition': 'Price below the purchase cost',
  'Un brouillon non terminé': 'An unfinished draft',
  'Modifications de cette fiche': 'Changes to this record',
  'Historique complet': 'Full history',
  'tout l’historique': 'the full history',
  'Tout l’historique': 'Full history',

  /* ⚠ L ASTERISQUE DU CHAMP OBLIGATOIRE EST DANS SON PROPRE <span> : la cle
     s arrete donc avant lui. « Poids unitaire * » n existe qu au RENDU. */
  'Poids unitaire ': 'Unit weight ',
  'Code d’autorisation ': 'Authorisation code ',
  'Raison ': 'Reason ',

  /* ⚠ COUPEES PAR UN LIEN CLIQUABLE OU UN <strong> ──────────────────────── */
  'réessayer': 'try again',
  /* ⚠⚠⚠ ICI LA CLE S ARRETE AVANT LE PICTOGRAMME, ET CE N EST PAS UN DETAIL DE
     STYLE. Une cle qui CONTIENT `class="ic"` ressort ECHAPPEE une fois posee —
     `${T("… class=\"ic\">🕘 …")}` — et `banc-pictogrammes`, qui cherche
     l attribut LITTERAL dans les 90 caracteres amont, ne reconnait plus le signe
     comme grise. Deux pictogrammes sont sortis de la norme du noir et blanc en
     silence, et c est le banc qui l a dit, pas la relecture.
     ➡ UNE CLE NE TRAVERSE JAMAIS UN `class="…"` : on coupe avant, on reprend
     apres. Le balisage SANS attribut (<strong>, <b>) n a pas ce defaut. */
  'consultables dans ': 'available under ',
  'dans les dernières 24 h. ': 'in the last 24 h. ',
  '.<br>Rien n’est perdu — réessayez une fois reconnecté.':
    '.<br>Nothing is lost — try again once signed in.',
  ') est inférieur ': ') is below ',

  /* ── LA LONGUE TRAINE ───────────────────────────────────────────────────── */
  'Catégorie': 'Category',
  'Étiquette': 'Label',
  'Aucune': 'None',
  'Populaire': 'Popular',
  'ignorée(s).': 'ignored.',
  'Enregistré.': 'Saved.',
  'Glisser pour réordonner, ou déposer sur la principale':
    'Drag to reorder, or drop onto the main one',
  'Générée par « Tout générer » et à l’enregistrement':
    'Generated by « Generate all » and on saving',
  'Détourer la photo et poser un décor (studio, jardin, Paris…)':
    'Cut out the photo and set a scene (studio, garden, Paris…)',
  'Faire porter le vêtement par un modèle (IA Fal.ai — chaque génération consomme des crédits)':
    'Have the garment worn by a model (Fal.ai AI — each generation uses credits)'
};
