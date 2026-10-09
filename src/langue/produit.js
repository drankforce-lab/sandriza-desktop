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
  /* ⚠ L EXEMPLE du champ suit la langue du poste ; ce qu on TAPE reste de la
     donnee. « Solde » est le LIBELLE de l etiquette — sa VALEUR, elle, reste
     'Solde' et part telle quelle dans la fiche. */
  'Ex : 350': 'E.g. 350',
  'En solde': 'On sale',
  'Sous le seuil d’alerte': 'Below the alert threshold',
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
  'Coût d’achat ($)': 'Cost ($)',
  'Coût d’achat': 'Cost',
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
  ') est inférieur au coût d’acquisition (': ') is below the purchase cost (',
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
  /* ⚠ LES DEUX ALTERNATIVES EN ENTIER — voir tools/banc-pluriel-colle.js. */
  'modification': 'change',
  'modifications': 'changes',
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
  'ignorée.': 'ignored.',
  'ignorées.': 'ignored.',
  'Enregistré.': 'Saved.',
  'Glisser pour réordonner, ou déposer sur la principale':
    'Drag to reorder, or drop onto the main one',
  'Générée par « Tout générer » et à l’enregistrement':
    'Generated by « Generate all » and on saving',
  'Détourer la photo et poser un décor (studio, jardin, Paris…)':
    'Cut out the photo and set a scene (studio, garden, Paris…)',
  'Faire porter le vêtement par un modèle (IA Fal.ai — chaque génération consomme des crédits)':
    'Have the garment worn by a model (Fal.ai AI — each generation uses credits)',

  /* ── LES INFOBULLES, LES EXEMPLES ET LES ATTRIBUTS DU SCRIPT ───────────────
     ⚠ La fiche produit fabrique tout son HTML DANS le script : ses `title`, ses
     `placeholder` et ses `aria-label` n etaient lus par aucun banc avant le
     2026-09-12. Trois d entre eux sont le seul endroit ou une regle est
     EXPLIQUEE — la limite par cliente, le teintage local, l historique. */
  'Photo principale — cliquer pour choisir, ou déposer une secondaire ici':
    'Main photo — click to choose, or drop a secondary one here',
  'choisir une photo': 'choose a photo',
  'Retirer la photo': 'Remove the photo',
  'choisissez une catégorie': 'choose a category',
  'Chercher une couleur, ou en saisir une nouvelle': 'Search a colour, or type a new one',
  'Chercher une couleur, ou en saisir une nouvelle…': 'Search a colour, or type a new one…',
  'Filtrer par taille ou couleur': 'Filter by size or colour',
  'Filtrer par taille ou couleur…': 'Filter by size or colour…',
  'Teinter les photos du produit pour chaque couleur — local, sans crédit ni service':
    'Tint the product photos for each colour — local, no credits, no service',
  'Unités de ce produit qu’un même client peut acheter, toutes commandes confondues (par adresse courriel).':
    'Units of this product a single customer may buy, across all orders (per email address).',
  'Cliquer pour voir qui a fait cette modification': 'Click to see who made this change',
  /* ⚠ « aucun » et « aucune » sont des EXEMPLES de champ vide : le prix soldé et
     la limite par cliente. Un champ laisse vide ne vaut pas « aucun » ecrit —
     rien n est enregistre, seul l exemple change de langue. */
  'aucun': 'none',
  'aucune': 'none',
  /* ⚠ CES DEUX EXEMPLES-LA SUIVENT LA LANGUE DU POSTE. La description courte
     part vers le service d images et ne s enregistre pas ; le motif d ajustement
     de stock est relu dans l administration. Ni l un ni l autre n atteint la
     cliente — au contraire d un nom de produit ou d un sujet de courriel. */
  'Ex : robe fleurie été': 'Ex: floral summer dress',
  'Écoulement de fin de série, article abîmé…': 'End-of-line clearance, damaged item…',

  /* ══ LA PHOTOTHEQUE — CE QUE LE FAUX COMMENTAIRE CACHAIT ═══════════════════
   * ⚠⚠ `e.accept = 'image/*'` ouvrait ici un commentaire FANTOME de 6 600
   * caracteres : le poseur n a jamais enveloppe la boite de la photothèque, ni
   * le refus de fichier trop lourd, ni meme `title="Retirer la photo"` dont la
   * cle etait pourtant ecrite. Le banc du residuel ne les voyait pas non plus —
   * ils sont sortis le jour ou la borne du `/*` a ete posee.
   * ⚠ La phrase de la photothèque vide est coupee par deux <strong> : on
   * traduit les morceaux TELS QUE LA SOURCE LES ECRIT, et « Catalogue → Photos »
   * est le chemin de menu de la fenetre principale — il suit la meme traduction
   * que le menu, sinon on envoie la lectrice chercher un ecran qui n existe pas
   * sous ce nom-la. */
  ' photos ignorées : plus de ': ' photos ignored: over ',
  ' photo ignorée : plus de ': ' photo ignored: over ',
  'Photothèque': 'Media library',
  'indisponible : ': 'unavailable: ',
  'La photothèque est vide. ': 'The media library is empty. ',
  'Elle se remplit par ': 'It fills up through ',
  'Catalogue → Photos': 'Catalogue → Photos',
  ', dans la fenêtre principale, ': ', in the main window, ',
  'et repart à zéro à chaque démarrage de l’application.':
    'and starts over at each launch of the application.',
  'Importer de l’ordinateur…': 'Import from the computer…',
  'Photo reprise de la photothèque.': 'Photo taken from the media library.',
  /* ⚠⚠ LA FORME RENDUE, A COTE DE LA FORME DE LA SOURCE. Les six cles ci-dessus
     sont ce que la SOURCE ecrit — avec leurs espaces de bord, et le pictogramme
     dans son propre <span>. `banc-langue-fenetres` interroge la page une fois
     ECRITE : il y lit « 📂 Importer de l’ordinateur… » d un seul tenant, et les
     morceaux separes par un <strong> recolles. Les deux formes ne sont pas un
     doublon : elles repondent a deux questions differentes, et il faut les
     deux. */
  'photos ignorées : plus de': 'photos ignored: over',
  'photo ignorée : plus de': 'photo ignored: over',
  'indisponible :': 'unavailable:',
  'La photothèque est vide.': 'The media library is empty.',
  'Elle se remplit par Catalogue → Photos , dans la fenêtre principale,':
    'It fills up through Catalogue → Photos , in the main window,',
  '📂 Importer de l’ordinateur…': '📂 Import from the computer…',

  /* ── LES MOTS SEULS (2026-09-13) — sections et onglets de la fiche produit. */
  'Identification': 'Identification',
  'Description': 'Description',
  'Prix': 'Price',
  'Ajouter': 'Add',
  'Photos': 'Photos',
  'Retours': 'Returns',
  'Photo': 'Photo',
  'Stock': 'Stock',
  'Fermer': 'Close',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'recliquez pour retirer le rabais': 'click again to remove the discount',
  'ouverte par': 'open by',
  'Fiche du produit': 'Product sheet',
  'Aucune photo principale': 'No main photo',
  'Sans nom': 'Untitled',
  'Tailles': 'Sizes',
  'Couleurs': 'Colours',
  'unités': 'units',
  'unité': 'unit',
  'Boutique': 'Shop',
  'Visible': 'Visible',
  'Masqué': 'Hidden',
  'Poids unitaire': 'Unit weight',
  'Prix de vente': 'Selling price',
  'Au moins une taille et une couleur': 'At least one size and one colour',
  'Une quantité en stock': 'A quantity in stock',
  'Pour enregistrer': 'To save',
  'Prête à enregistrer': 'Ready to save',
  /* ── LES MÉDIAS (2026-10-07) : mannequin, vidéo du tombé, vue 360° ────────
     ⚠ AUCUNE APOSTROPHE DROITE dans les traductions : elles tombent dans des
     chaînes entre apostrophes du script de la fenêtre. Le modèle de phrase
     garde ses repères {p} {m} {pi} {cm} {t}, remplacés à l affichage. */
  'Médias': 'Media',
  'Prénom du mannequin': 'Model’s first name',
  'Ex : Sophie': 'E.g. Sophie',
  'Taille du mannequin (cm)': 'Model’s height (cm)',
  'Ex : 168': 'E.g. 168',
  'Taille portée': 'Size worn',
  'Choisir une vidéo (MP4, WebM)': 'Choose a video (MP4, WebM)',
  'Retirer la vidéo': 'Remove the video',
  'Choisir les vues 360° (8 à 36 images)': 'Choose the 360° views (8 to 36 images)',
  'Tout retirer': 'Remove all',
  'Facultatif — les trois champs ensemble, ou aucun.': 'Optional — all three fields together, or none.',
  'Incomplet : prénom, taille de 120 à 220 cm et taille portée.': 'Incomplete: first name, height from 120 to 220 cm and size worn.',
  'En boutique :': 'In the shop:',
  '{p} mesure {m} m et porte un {t}': '{p} is {pi} ({cm} cm) and wears a {t}',
  'Aucune vidéo.': 'No video.',
  'déposée à l’enregistrement.': 'uploaded when saved.',
  'Vidéo en ligne.': 'Video online.',
  'vues, dans l’ordre des noms de fichier.': 'views, in file name order.',
  'Aucune vue 360°.': 'No 360° view.',
  'Vidéo trop lourde :': 'Video too large:',
  'maximum 5,5 Mo — raccourcissez-la ou réduisez sa résolution': 'maximum 5.5 MB — shorten it or lower its resolution',
  'Lecture de la vidéo impossible.': 'The video could not be read.',
  'La vue 360° demande de 8 à 36 images —': 'The 360° view needs 8 to 36 images —',
  'La vue 360° demande de 8 à 36 images.': 'The 360° view needs 8 to 36 images.',
  'choisie(s).': 'chosen.',
  'image(s) de plus de': 'image(s) larger than',
  'rien n’a été ajouté.': 'nothing was added.',
  'Préparation des vues 360°…': 'Preparing the 360° views…',
  'image(s) illisible(s) — rien n’a été ajouté.': 'unreadable image(s) — nothing was added.',
  'Dépôt des médias et enregistrement…': 'Uploading media and saving…',
  'Mannequin : le prénom, la taille (120 à 220 cm) et la taille portée vont ensemble.': 'Model: the first name, height (120 to 220 cm) and size worn go together.',
  'Mannequin : la taille portée doit être une des tailles offertes.': 'Model: the size worn must be one of the sizes offered.',
  'Vidéo trop lourde (maximum 5,5 Mo).': 'Video too large (maximum 5.5 MB).',
  'Format refusé — MP4 ou WebM seulement.': 'Format refused — MP4 or WebM only.',
  'Vue 360° : une des images est illisible.': '360° view: one of the images is unreadable.',
  // Les mêmes, tels que l écran les assemble (icône devant, unité derrière).
  '🎬 Choisir une vidéo (MP4, WebM)': '🎬 Choose a video (MP4, WebM)',
  '🔄 Choisir les vues 360° (8 à 36 images)': '🔄 Choose the 360° views (8 to 36 images)',
  'En boutique : «': 'In the shop: «',
  'Mo — déposée à l’enregistrement.': 'MB — uploaded when saved.',
  'Mo (maximum 5,5 Mo — raccourcissez-la ou réduisez sa résolution).': 'MB (maximum 5.5 MB — shorten it or lower its resolution).',
  'Mo — rien n’a été ajouté.': 'MB — nothing was added.',
  /* ── L AJUSTEMENT DU MODELE (2026-10-07) ── les VALEURS (petit, grand) sont de
     la donnee et ne passent jamais ici ; seuls les libelles se traduisent. */
  'Ajustement': 'Fit',
  'Taille petit (conseiller la taille au-dessus)': 'Runs small (recommend one size up)',
  'Taille grand (conseiller la taille au-dessous)': 'Runs large (recommend one size down)',
  'Auto d’après les retours : aucune donnée pour une fiche neuve.': 'Auto from returns: no data for a new product.',
  'Auto d’après les retours : aucun retour « taille incorrecte » pour ce produit.': 'Auto from returns: no “wrong size” return for this product.',
  'Auto d’après les retours : aucune tendance nette': 'Auto from returns: no clear trend',
  'Auto d’après les retours :': 'Auto from returns:',
  'taille petit': 'runs small',
  'taille grand': 'runs large',
  'vers une taille au-dessus': 'towards a larger size',
  'vers une taille au-dessous': 'towards a smaller size',
  'retour « taille incorrecte »': '“wrong size” return',
  'retours « taille incorrecte »': '“wrong size” returns',
  'seuil': 'threshold',
  'Appliquer': 'Apply',
  /* L'accès anticipé des paliers de fidélité (2026-10-07). */
  'Accès anticipé (paliers de fidélité)': 'Early access (loyalty tiers)',
  'Ouvert à tous le': 'Open to everyone on',
  'Accès anticipé : indiquez la date d’ouverture à tous.': 'Early access: enter the date it opens to everyone.',
  // Photo par couleur obligatoire (7.11.0)
  'Photo par couleur (obligatoire)': 'Photo per colour (required)',
  'Générée en teintant la photo principale à l’enregistrement, si la case est vide — ou déposez-la vous-même.':
    'Generated by tinting the main photo when saving, if the slot is empty — or drop it in yourself.',
  'Une photo pour chaque couleur secondaire.': 'One photo for each secondary colour.',
  'Sur la boutique, elle remplace la photo principale quand le client choisit cette couleur ; les photos supplémentaires restent les mêmes.':
    'In the store, it replaces the main photo when the customer picks this colour; the additional photos stay the same.',
  'ajouter *': 'add *',
  'Photo obligatoire pour chaque couleur secondaire — manquante :': 'A photo is required for each secondary colour — missing:',
  'Une photo par couleur secondaire': 'One photo per secondary colour',
  // Mesures du vêtement (7.13.0)
  "Mesures du vêtement": "Garment measurements",
  "Facultatif, mais c’est ce qui permet de suggérer la bonne taille à chaque client d’après ses propres mesures — et d’éviter les retours. Photographiez le vêtement à plat sur un fond NON blanc, avec une feuille lettre posée à côté.": "Optional, but this is what lets the store suggest the right size to each customer from their own measurements — and avoid returns. Photograph the garment flat on a NON-white surface, with a letter sheet next to it.",
  "Type": "Type",
  "Haut (chandail, chemisier, veste)": "Top (sweater, blouse, jacket)",
  "Bas (pantalon, jupe, short)": "Bottom (pants, skirt, shorts)",
  "Robe ou combinaison": "Dress or jumpsuit",
  "Aucune mesure": "No measurements",
  "Mesurer sur une photo": "Measure on a photo",
  "Compléter les autres tailles": "Fill in the other sizes",
  "Mesures": "Measurements",
  "Poitrine (à plat)": "Chest (flat)",
  "d’une aisselle à l’autre": "from armpit to armpit",
  "Longueur": "Length",
  "du haut de l’épaule jusqu’au bas": "from the top of the shoulder to the hem",
  "Manche": "Sleeve",
  "de la couture d’épaule au poignet": "from the shoulder seam to the cuff",
  "Épaules": "Shoulders",
  "d’une couture d’épaule à l’autre": "from shoulder seam to shoulder seam",
  "Taille (à plat)": "Waist (flat)",
  "d’un côté à l’autre de la ceinture": "across the waistband",
  "Hanches (à plat)": "Hips (flat)",
  "au plus large, sous la braguette": "at the widest point, below the fly",
  "de la ceinture jusqu’au bas": "from the waistband to the hem",
  "Entrejambe": "Inseam",
  "de l’entrejambe jusqu’au bas": "from the crotch to the hem",
  "au plus étroit": "at the narrowest point",
  "au plus large": "at the widest point",
  "Aucune mesure pour ce type d’article. Choisissez un type ci-dessus si le vêtement en a besoin.": "No measurements for this kind of item. Pick a type above if the garment needs them.",
  "Choisissez d’abord les tailles à l’étape « Tailles et couleurs ».": "First choose the sizes in the “Sizes and colours” step.",
  "En centimètres, vêtement posé à plat. Les tours (poitrine, taille, hanches) se mesurent d’un côté à l’autre : la boutique les double.": "In centimetres, garment laid flat. Circumferences (chest, waist, hips) are measured side to side: the store doubles them.",
  "Mesurez d’abord au moins une taille.": "Measure at least one size first.",
  "Autres tailles complétées d’après la taille ": "Other sizes filled in from size ",
  " — vérifiez-les si vous avez le vêtement.": " — check them if you have the garment.",
  "Rien à compléter.": "Nothing to fill in.",
  "Choisissez d’abord le type de vêtement.": "First choose the garment type.",
  "Mesurer sur la photo": "Measure on the photo",
  "Taille photographiée": "Size photographed",
  "Feuille": "Sheet",
  "Lettre (8,5 × 11 po)": "Letter (8.5 × 11 in)",
  "Refaire l’échelle à la main": "Set the scale by hand",
  "Recommencer les mesures": "Start the measurements over",
  "✓ Garder ces mesures": "✓ Keep these measurements",
  "Cliquez les deux bouts du GRAND côté de la feuille.": "Click both ends of the sheet’s LONG side.",
  "Toutes les mesures sont prises. Gardez-les, ou cliquez une ligne pour la refaire.": "All measurements are taken. Keep them, or click one to redo it.",
  "Cliquez le début puis la fin : ": "Click the start, then the end: ",
  "Feuille trouvée : l’échelle est posée.": "Sheet found: the scale is set.",
  "Feuille introuvable (fond trop clair ?) : cliquez les deux bouts de son grand côté.": "Sheet not found (background too light?): click both ends of its long side.",
  "Échelle posée à la main.": "Scale set by hand.",
  "Mesures de la taille ": "Measurements for size ",
  " enregistrées dans le tableau. « Compléter les autres tailles » remplit le reste.": " saved in the table. “Fill in the other sizes” completes the rest.",
  "Autre photo…": "Other photo…",
  "Cette photo ne se lit pas automatiquement : cliquez les deux bouts du grand côté de la feuille.": "This photo can’t be read automatically: click both ends of the sheet’s long side.",
  "Impossible d’ouvrir cette photo.": "This photo can’t be opened.",
  "Échelle": "Scale",
  "Feuille dans la photo (automatique)": "Sheet in the photo (automatic)",
  "Une mesure que je connais": "A measurement I know",
  "Échelle retenue du poste photo": "Saved photo-station scale",
  "Feuille, à la main": "Sheet, by hand",
  "Ce segment mesure": "This segment measures",
  "Poser l’échelle": "Set the scale",
  "Retenir cette échelle pour mes photos de même format (poste photo fixe)": "Remember this scale for my photos of the same format (fixed photo station)",
  "Tapez la longueur réelle de ce segment, puis « Poser l’échelle ».": "Type the real length of this segment, then “Set the scale”.",
  "Cliquez les deux bouts d’une mesure que vous connaissez (par exemple la longueur, prise au ruban).": "Click both ends of a measurement you know (for example the length, taken with a tape).",
  "Pas de feuille : l’échelle retenue du poste photo est utilisée.": "No sheet: the saved photo-station scale is used.",
  "Pas de feuille dans la photo : posez l’échelle avec une mesure que vous connaissez.": "No sheet in the photo: set the scale with a measurement you know.",
  "Échelle retenue du poste photo utilisée.": "Saved photo-station scale used.",
  "Aucune échelle retenue pour ce format de photo : posez-la une fois, cochez « Retenir ».": "No saved scale for this photo format: set it once and tick “Remember”.",
  "Lecture de la photo…": "Reading the photo…",
  "Échelle retenue pour ce format de photo.": "Scale saved for this photo format.",
  "Tapez la longueur réelle du segment, en centimètres.": "Type the segment’s real length, in centimetres.",
  "Échelle posée d’après votre mesure.": "Scale set from your measurement.",
};
