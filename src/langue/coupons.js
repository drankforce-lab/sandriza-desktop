'use strict';

/*
 * COUPONS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LE CODE D UN COUPON EST UNE DONNEE, ET C EST CE QUE LA CLIENTE TAPE AU
 * PAIEMENT. Il est enregistre, compare a la saisie, et imprime dans les
 * courriels. Le traduire rendrait tous les coupons en circulation invalides,
 * EN ANGLAIS SEULEMENT. Seule l etiquette du champ et son exemple se lisent — et
 * l exemple reste FRANCAIS parce qu il montre ce que la CLIENTE tapera.
 *
 * ⚠⚠ SUPPRIMER UN COUPON NE DEFAIT PAS LES COMMANDES DEJA REGLEES : elles
 * gardent leur reduction. La phrase le dit, et sans elle on n ose plus rien
 * supprimer — ou pire, on croit annuler un rabais deja accorde.
 *
 * ⚠ « Cumulable avec les soldes et promotions » decide si un coupon s ajoute a
 * un rabais deja en cours. C est la question qui coute de l argent, pas une
 * preference d affichage.
 *
 * ⚠ Le NOM INTERNE ne sort pas de l administration : son exemple suit la langue
 * du poste.
 */

module.exports = {
  /* ── LE PIED DE LISTE ET L EXPORT (2026-09-19) ─────────────────────────
     ⚠ Les deux formes du pluriel, jamais << coupon(s) >> : cette forme
     n existe dans aucune des deux langues.
     ⚠ Et les en-tetes du fichier sont plus DETAILLES que ceux du tableau : a
     l ecran << Utilise >> tient le compte ET le maximum dans une seule
     colonne ; un tableur les veut separes pour pouvoir calculer. */
  'coupon': 'coupon',
  'coupons': 'coupons',
  'Cumul avec solde': 'Stacks with sale',
  'Utilisé': 'Used',
  'Maximum': 'Maximum',
  'Statut': 'Status',
  'La liste des coupons': 'The coupon list',
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Coupons — Administration Sandriza': 'Coupons — Sandriza Administration',
  'Coupons': 'Coupons',
  'Coupons indisponibles': 'Coupons unavailable',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux promotions.':
    'Your role does not give access to the promotions.',
  'Ce coupon n’existe plus.': 'This coupon no longer exists.',
  'Ce code est déjà pris par un autre coupon.':
    'This code is already taken by another coupon.',
  'Un code et une valeur supérieure à zéro sont requis.':
    'A code and a value greater than zero are required.',

  /* ══ LE FORMULAIRE ═════════════════════════════════════════════════════════ */
  'Nouveau coupon': 'New coupon',
  'Modifier le coupon': 'Edit the coupon',
  'Code du coupon': 'Coupon code',
  'Code ': 'Code ',
  'Code *': 'Code *',
  /* ⚠⚠ LE CODE EST UNE DONNEE : son exemple reste francais, c est ce que la
     CLIENTE tapera au paiement. */
  'PROMO20': 'PROMO20',
  'Ce que le client tape au paiement.': 'What the customer types at checkout.',
  'Nom interne': 'Internal name',
  /* Le nom interne ne sort pas de l administration : son exemple suit la langue
     du poste. */
  'Promo printemps': 'Spring promo',
  'Type de réduction': 'Discount type',
  'Pourcentage (%)': 'Percentage (%)',
  'Montant fixe ($)': 'Fixed amount ($)',
  'Livraison gratuite': 'Free shipping',
  'Valeur ': 'Value ',
  'Valeur *': 'Value *',
  'Valeur du coupon': 'Value of the coupon',
  'Sous-total minimum': 'Minimum subtotal',
  '0 = aucun minimum.': '0 = no minimum.',
  'Nombre d’utilisations maximum': 'Maximum number of uses',
  'illimité': 'unlimited',
  'Une seule fois par client': 'Once per customer only',
  /* ⚠ La question qui coute de l argent. */
  'Cumulable avec les soldes et promotions': 'Can be combined with sales and promotions',
  'Début': 'Start',
  'Fin': 'End',
  'Créer le coupon': 'Create the coupon',
  'Enregistrer': 'Save',
  'Annuler': 'Cancel',
  'Un coupon': 'A coupon',

  /* ── LA LISTE ───────────────────────────────────────────────────────────── */
  '+ Nouveau coupon': '+ New coupon',
  'Code ou nom': 'Code or name',
  'Code ou nom…': 'Code or name…',
  ' coupons': ' coupons',
  ' coupon': ' coupon',
  'Rien ne correspond.': 'Nothing matches.',
  'Aucun coupon. Créez le premier.': 'No coupon. Create the first one.',
  'Code': 'Code',
  'Nom': 'Name',
  'Réduction': 'Discount',
  'Minimum': 'Minimum',
  'Cumul soldes': 'Combines with sales',
  'Utilisations': 'Uses',
  'Période': 'Period',
  'État': 'Status',
  'Code Nom Réduction': 'Code Name Discount',
  'Minimum Cumul soldes Utilisations': 'Minimum Combines with sales Uses',
  'Période État': 'Period Status',
  'autorisé': 'allowed',
  'refusé': 'refused',
  'En cours': 'Running',
  'Hors service': 'Off',
  'Modifier': 'Edit',
  'Désactiver': 'Turn off',
  'Activer': 'Turn on',
  'Supprimer': 'Delete',
  'Confirmer ?': 'Confirm?',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  /* ⚠⚠ CE QUI NE SE DEFAIT PAS : les commandes deja reglees gardent leur
     reduction. */
  'Cliquez « Confirmer ? » pour supprimer — les commandes déjà réglées gardent leur réduction.':
    'Click « Confirm? » to delete — the orders already paid keep their discount.',
  'Coupon ': 'Coupon ',
  ' activé.': ' turned on.',
  ' désactivé.': ' turned off.',
  ' supprimé.': ' deleted.',
  'activé.': 'turned on.',
  'désactivé.': 'turned off.',
  'supprimé.': 'deleted.',
  ' créé.': ' created.',
  'créé.': 'created.',
  ' mis à jour.': ' updated.',
  'mis à jour.': 'updated.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Actif': 'Active',
  'Tous': 'All',
  // La refonte de la liste, comme l'Inventaire (2026-09-25).
  'utilisables en boutique': 'usable in the shop',
  'désactivés ou hors période': 'turned off or out of period',
  'tous coupons confondus': 'across all coupons',
  'Coupon': 'Coupon',
  'Coupon Réduction': 'Coupon Discount',
  'Cliquer pour afficher': 'Click to show',
};
