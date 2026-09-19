'use strict';

/*
 * OFFRES ET ANNONCES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN EST DEJA BILINGUE PAR SES CHAMPS, ET C EST LA CHOSE A
 * COMPRENDRE AVANT DE TOUCHER A QUOI QUE CE SOIT. Le bandeau de la boutique et
 * le badge d une fiche produit portent CHACUN deux champs : « Message » et
 * « Message (anglais) », « Texte du bouton » et « Texte du bouton (anglais) »,
 * « Texte » et « Texte (anglais) ». Ce que la cliente lit est donc DEJA traduit
 * a la main, par qui redige l offre.
 * ➡ Ici on ne traduit QUE LES LIBELLES de ces champs. Leur CONTENU est de la
 * donnee, et il ne passe jamais par ce dictionnaire.
 *
 * ⚠⚠ LES SEPT REFUS DE SAISIE SONT DES REGLES CHIFFREES, pas des reproches :
 * « la quantite gratuite doit etre inferieure a la quantite achetee, qui vaut au
 * moins 2 », « quantite d au moins 2, rabais entre 1 et 100 % ». Traduire en
 * perdant le chiffre laisserait quelqu un corriger au hasard.
 *
 * ⚠⚠ SUPPRIMER UNE OFFRE RETIRE LA BANNIERE DE LA BOUTIQUE. La phrase le dit,
 * et c est la seule chose qui empeche de croire qu on range une fiche alors
 * qu on change ce que les clientes voient.
 *
 * ⚠ Les COULEURS de badge sont des libelles (« Or (accent) », « Vert ») ; c est
 * la VALEUR (`accent`, `success`) qui part dans la base, et
 * `banc-langue-donnees` la protege deja.
 */

module.exports = {
  /* ── LE PIED DE LISTE ET L EXPORT (2026-09-19) ─────────────────────────
     ⚠ DEUX ONGLETS, DEUX FICHIERS. Une offre et une annonce n ont ni les memes
     colonnes ni le meme sens ; les reunir demanderait des cellules vides
     partout, et une cellule vide dans un export ne dit pas si la donnee manque
     ou ne s applique pas. Le pied compte donc dans le vocabulaire de l onglet
     courant, et les deux pluriels existent pour chacun. */
  'offre': 'offer',
  'offres': 'offers',
  'annonce': 'announcement',
  'annonces': 'announcements',
  'La liste des offres': 'The offer list',
  'La liste des annonces': 'The announcement list',
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Offres et annonces — Administration Sandriza': 'Offers and announcements — Sandriza Administration',
  'Offres et annonces': 'Offers and announcements',
  'Promotions indisponibles': 'Promotions unavailable',
  'Votre rôle ne donne pas accès aux promotions.':
    'Your role does not give access to the promotions.',
  'Cet élément n’existe plus.': 'This item no longer exists.',

  /* ══ LES REFUS DE SAISIE — DES REGLES CHIFFREES ════════════════════════════
   * ⚠⚠ Le chiffre EST le message : le perdre laisserait corriger au hasard. */
  'Un nom interne est requis.': 'An internal name is required.',
  'La valeur du rabais doit être supérieure à zéro.':
    'The discount value must be greater than zero.',
  'Quantités « 2 pour 1 » invalides — la quantité gratuite doit être inférieure à la quantité achetée, qui vaut au moins 2.':
    'Invalid « 2 for 1 » quantities — the free quantity must be lower than the bought quantity, which is at least 2.',
  'Ajoutez au moins un palier valable : quantité d’au moins 2, rabais entre 1 et 100 %.':
    'Add at least one valid tier: a quantity of at least 2, a discount between 1 and 100 %.',
  'Choisissez au moins une catégorie.': 'Choose at least one category.',
  'Choisissez au moins un produit.': 'Choose at least one product.',
  'Le message du bandeau est requis.': 'The banner message is required.',
  'Le texte du badge est requis.': 'The badge text is required.',

  /* ── LA PORTEE ──────────────────────────────────────────────────────────── */
  'Portée': 'Scope',
  'Catégories': 'Categories',
  'Chercher un produit par nom ou SKU': 'Search a product by name or SKU',
  'Chercher un nom ou un SKU…': 'Search a name or a SKU…',
  'Rechercher': 'Search',
  'Rechercher…': 'Search…',
  'Intervalle en secondes': 'Interval in seconds',
  'Créer': 'Create',
  'activée.': 'turned on.',
  'désactivée.': 'turned off.',
  'S’applique à': 'Applies to',
  'Tous les produits': 'All the products',
  'Certaines catégories': 'Some categories',
  'Des produits nommés': 'Named products',
  'Produits ': 'Products ',
  'Produits *': 'Products *',
  'Aucun produit ne correspond.': 'No product matches.',

  /* ── LE FORMULAIRE D UNE OFFRE ──────────────────────────────────────────── */
  'Modifier l’offre': 'Edit the offer',
  'Nouvelle offre': 'New offer',
  'Nom interne ': 'Internal name ',
  'Nom interne *': 'Internal name *',
  /* ⚠ LES PHRASES ENTIERES : « Nom » seul mordait dans les deux etiquettes et
     rendait « Name interne de l’offre » sur la page anglaise. */
  'Nom interne de l’offre': 'Internal name of the offer',
  'Nom interne de l’annonce': 'Internal name of the announcement',
  'Valeur de l’offre': 'Value of the offer',
  /* ⚠ Le NOM INTERNE ne sort pas de l administration : son exemple suit la
     langue du poste. */
  'Solde du printemps': 'Spring sale',
  'Statut': 'Status',
  'Actif': 'Active',
  'Inactif': 'Inactive',
  'Type de rabais': 'Discount type',
  'Pourcentage (%)': 'Percentage (%)',
  'Montant fixe ($)': 'Fixed amount ($)',
  '« 2 pour 1 » (quantité)': '« 2 for 1 » (quantity)',
  '« 2 pour 1 »': '« 2 for 1 »',
  'Paliers de quantité': 'Quantity tiers',
  'Valeur ': 'Value ',
  'Valeur *': 'Value *',
  'Quantité achetée': 'Quantity bought',
  'Quantité gratuite': 'Free quantity',
  'Doit rester inférieure à la quantité achetée.': 'Must stay lower than the quantity bought.',
  'Une fois par client': 'Once per customer',
  '+ Ajouter un palier': '+ Add a tier',
  'Aucun palier — ajoutez-en au moins un.': 'No tier — add at least one.',
  /* ⚠ DEUX CHAMPS DANS UNE PHRASE : « à partir de N articles : P % ». Les trois
     morceaux se traduisent separement parce que la source les ecrit ainsi, et
     l ordre des mots tient en anglais. */
  'à partir de': 'from',
  'articles :': 'items:',
  'Palier ': 'Tier ',
  ' — nombre d’articles': ' — number of items',
  ' — pourcentage de rabais': ' — discount percentage',
  '— nombre d’articles': '— number of items',
  '— pourcentage de rabais': '— discount percentage',
  'Retirer': 'Remove',
  'Début': 'Start',
  'Fin': 'End',
  'Créer l’offre': 'Create the offer',
  'Enregistrer': 'Save',
  'Annuler': 'Cancel',

  /* ══ LE BANDEAU ET LE BADGE — DES LIBELLES, PAS LEUR CONTENU ═══════════════
   * ⚠⚠ « Message (anglais) » existe DEJA : ce que la cliente lit est traduit a
   * la main par qui redige l offre. Ici on ne nomme que les champs. */
  'Bandeau de la boutique': 'Storefront banner',
  'Bandeau': 'Banner',
  'Message': 'Message',
  'Message ': 'Message ',
  'Message *': 'Message *',
  'Message (anglais)': 'Message (English)',
  'Couleur du fond': 'Background colour',
  'Couleur du texte': 'Text colour',
  'Texte du bouton': 'Button text',
  'Texte du bouton (anglais)': 'Button text (English)',
  'Lien du bouton': 'Button link',
  'Priorité d’affichage': 'Display priority',
  'Priorité': 'Priority',

  'Nouvelle annonce': 'New announcement',
  'Modifier': 'Edit',
  'Genre': 'Kind',
  'Badge de fiche produit': 'Product page badge',
  'Badge': 'Badge',
  'Texte ': 'Text ',
  'Texte *': 'Text *',
  'Texte (anglais)': 'Text (English)',
  'Texte de l’emblème': 'Badge text',
  /* ⚠ L EXEMPLE RESTE FRANCAIS : ce badge est LU PAR LA CLIENTE sur la fiche
     produit, et son champ anglais est a cote. Un exemple anglais apprendrait a
     remplir la mauvaise case. */
  'Nouveauté': 'Nouveauté',
  /* ⚠⚠ LES DEUX EXEMPLES DU BANDEAU RESTENT FRANCAIS, pour la meme raison que
     le badge : ce sont des exemples de ce que la CLIENTE lira, et le champ
     anglais est juste a cote. Un exemple anglais apprendrait a remplir la
     mauvaise case. */
  'Jusqu’à 30 % sur les robes': 'Jusqu’à 30 % sur les robes',
  'Voir les articles': 'Voir les articles',
  'Couleur': 'Colour',
  'Or (accent)': 'Gold (accent)',
  'Vert': 'Green',
  'Rouge': 'Red',
  'Bleu': 'Blue',
  'Orange': 'Orange',
  'Expire par produit': 'Expires per product',
  'Après (jours)': 'After (days)',

  /* ── LES DEUX LISTES ────────────────────────────────────────────────────── */
  'Offres et rabais': 'Offers and discounts',
  'Annonces et badges': 'Announcements and badges',
  'Défilement du bandeau': 'Banner rotation',
  'Quand plusieurs bandeaux sont actifs, ils se succèdent toutes les':
    'When several banners are active, they follow one another every',
  'Rien ne correspond.': 'Nothing matches.',
  'Aucune offre. Créez la première.': 'No offer. Create the first one.',
  'Aucune annonce. Créez la première.': 'No announcement. Create the first one.',
  'Nom': 'Name',
  'Rabais': 'Discount',
  'Période': 'Period',
  'État': 'Status',
  'Contenu': 'Content',
  'Nom Rabais Portée Période': 'Name Discount Scope Period',
  'Nom Genre Contenu Priorité': 'Name Kind Content Priority',
  'Période État': 'Period Status',
  'En cours': 'Running',
  'Hors service': 'Off',
  'Désactiver': 'Turn off',
  'Activer': 'Turn on',
  'Confirmer ?': 'Confirm?',
  'Supprimer': 'Delete',
  'expire après': 'expires after',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Défilement réglé à ': 'Rotation set to ',
  'Défilement réglé à': 'Rotation set to',
  ' secondes.': ' seconds.',
  'Offre « ': 'Offer « ',
  'Offre «': 'Offer «',
  ' » ': ' » ',
  'créée.': 'created.',
  'mise à jour.': 'updated.',
  '» supprimée.': '» deleted.',
  /* ⚠⚠ SUPPRIMER UNE OFFRE CHANGE CE QUE LES CLIENTES VOIENT : la banniere de
     la boutique part avec. Sans cette phrase, on croit ranger une fiche. */
  'Cliquez « Confirmer ? » pour supprimer — la bannière de la boutique sera retirée avec.':
    'Click « Confirm? » to delete — the storefront banner goes with it.',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'j par produit': 'd per product'
};
