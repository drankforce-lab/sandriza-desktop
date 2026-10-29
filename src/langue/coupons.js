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
  /* ── RELOOKING 2026 DU FORMULAIRE (2026-10-04) ── */
  'de rabais': 'off',
  'un montant de rabais': 'an amount off',
  'un pourcentage de rabais': 'a percentage off',
  'CODE': 'CODE',
  'Un code que le client tape au paiement pour obtenir une réduction.': 'A code the customer types at checkout to get a discount.',
  'Le coupon': 'The coupon',
  'Conditions': 'Conditions',
  'Validité': 'Validity',
  'Règles': 'Rules',
  'Le code est accepté au paiement pendant sa période.': 'The code is accepted at checkout during its period.',
  'Un même client ne peut l’utiliser qu’une fois.': 'A customer can use it only once.',
  'Sinon, le code est refusé si le panier contient un article en solde ou en promotion.': 'Otherwise the code is refused when the cart holds a sale or promotion item.',
  // 2026-10-15 : confirmations en boîte à part.
  'Supprimer le coupon': 'Delete coupon',
  'sera supprimé définitivement et ne pourra plus être utilisé. Les commandes déjà réglées conservent leur réduction. Cette action est irréversible.': 'will be permanently deleted and can no longer be used. Orders already paid keep their discount. This action cannot be undone.',
  'Un pourcentage ne peut pas dépasser 100 %.': 'A percentage cannot exceed 100%.',
  // 2026-10-25, audit
  'Consultation seulement': 'View only',
  // Gestes groupés (2026-10-29)
  "{0} coupon sélectionné": "{0} coupon selected",
  "{0} coupons sélectionnés": "{0} coupons selected",
  "Suspendre": "Suspend",
  "Exporter (CSV)": "Export (CSV)",
  "{0} autre coupon sélectionné ne s’y prête pas : il ne change pas.": "{0} other selected coupon does not apply: it stays unchanged.",
  "{0} autres coupons sélectionnés ne s’y prêtent pas : ils ne changent pas.": "{0} other selected coupons do not apply: they stay unchanged.",
  "{0} coupon exporté": "{0} coupon exported",
  "{0} coupons exportés": "{0} coupons exported",
  "et {0} autres": "and {0} more",
  "Supprimer les coupons": "Delete coupons",
  "{0} coupon sera supprimé définitivement et ne pourra plus être utilisé. Les commandes déjà réglées conservent leur réduction. Cette action est irréversible.": "{0} coupon will be permanently deleted and can no longer be used. Orders already paid keep their discount. This action cannot be undone.",
  "{0} coupons seront supprimés définitivement et ne pourront plus être utilisés. Les commandes déjà réglées conservent leur réduction. Cette action est irréversible.": "{0} coupons will be permanently deleted and can no longer be used. Orders already paid keep their discount. This action cannot be undone.",
  "Supprimer {0} coupon": "Delete {0} coupon",
  "Supprimer {0} coupons": "Delete {0} coupons",
  "Suppression des coupons": "Deleting coupons",
  "{0} coupon supprimé.": "{0} coupon deleted.",
  "{0} coupons supprimés.": "{0} coupons deleted.",
  "Activer les coupons": "Activate coupons",
  "Suspendre les coupons": "Suspend coupons",
  "{0} coupon sera activé : il sera accepté au paiement pendant sa période.": "{0} coupon will be activated: it will be accepted at checkout during its period.",
  "{0} coupons seront activés : ils seront acceptés au paiement pendant leur période.": "{0} coupons will be activated: they will be accepted at checkout during their period.",
  "{0} coupon sera suspendu : il sera refusé au paiement.": "{0} coupon will be suspended: it will be refused at checkout.",
  "{0} coupons seront suspendus : ils seront refusés au paiement.": "{0} coupons will be suspended: they will be refused at checkout.",
  "Activer {0} coupon": "Activate {0} coupon",
  "Activer {0} coupons": "Activate {0} coupons",
  "Suspendre {0} coupon": "Suspend {0} coupon",
  "Suspendre {0} coupons": "Suspend {0} coupons",
  "Activation des coupons": "Activating coupons",
  "Suspension des coupons": "Suspending coupons",
  "le coupon a changé d’état entre-temps": "the coupon changed state in the meantime",
  "{0} coupon activé.": "{0} coupon activated.",
  "{0} coupons activés.": "{0} coupons activated.",
  "{0} coupon suspendu.": "{0} coupon suspended.",
  "{0} coupons suspendus.": "{0} coupons suspended.",
};
