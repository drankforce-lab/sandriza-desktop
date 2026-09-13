'use strict';

/*
 * CONFIGURATION DE LA LIVRAISON — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE TABLEAU N EST PAS UNE LISTE D AUTORISATIONS. La colonne « Inscription
 * Stripe » est LUE CHEZ STRIPE a chaque fois, pas conservee chez nous : un pays
 * retire la-bas cesse d etre propose ici. La seule chose enregistree est
 * l INVERSE — les pays ou l on ne veut PAS livrer malgre l inscription. Les mots
 * « inscrit », « verrouillé » et « On livre » disent donc trois choses
 * differentes ; les confondre ferait croire qu on ouvre un pays en cochant une
 * case, alors que cela se fait chez Stripe.
 *
 * ⚠⚠ LES TROIS MONTANTS SONT DES REGLAGES QUI COUTENT DE L ARGENT A CHAQUE
 * COMMANDE : frais standard, seuil de gratuite, supplement prioritaire. Chacun
 * porte sa phrase d aide, et deux d entre elles disent ce que fait la valeur 0
 * — « 0 désactive », « 0 masque l’option ». Perdre ce detail laisse un seuil a
 * zero qui rend toute la livraison gratuite sans que personne comprenne.
 *
 * ⚠⚠ LE TABLEAU DES PAYS N EXISTE QUE SI L INTERNATIONAL EST ALLUME, et les deux
 * verdicts de la bascule disent qu il faut ENREGISTRER avant que quoi que ce
 * soit change : « Enregistrez pour activer, puis relisez vos inscriptions
 * Stripe. »
 *
 * ⚠ CA$ EST UNE DEVISE, pas un mot : elle reste telle quelle dans les deux
 * langues. Le nom des pays et des Etats vient de Stripe, le code aussi.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Configuration de la livraison — Administration Sandriza':
    'Shipping configuration — Sandriza Administration',
  'Configuration de la livraison': 'Shipping configuration',

  /* ── LA LECTURE SEULE ET LES REFUS ──────────────────────────────────────── */
  'Lecture seule : vous pouvez consulter les réglages, pas les modifier.':
    'Read only: you can look at the settings, not change them.',
  'Votre rôle est en lecture seule : la livraison ne peut pas être modifiée.':
    'Your role is read only: the shipping cannot be changed.',
  'L’enregistrement dans le nuage a échoué. Réessayez.':
    'Saving to the cloud failed. Try again.',

  /* ══ LA LIVRAISON INTERNATIONALE ═══════════════════════════════════════════ */
  'Livraison internationale': 'International shipping',
  'Permet aux clients de saisir une adresse hors Canada.':
    'Lets customers enter an address outside Canada.',
  'Activer la livraison internationale': 'Turn on international shipping',
  'La recherche d’adresse s’adapte au monde entier et un champ Pays apparaît à la caisse.':
    'The address lookup opens to the whole world and a Country field appears at checkout.',
  /* ⚠⚠ Rien ne change avant l ENREGISTREMENT. */
  'Enregistrez pour activer, puis relisez vos inscriptions Stripe.':
    'Save to turn it on, then read your Stripe registrations again.',
  'Enregistrez pour désactiver.': 'Save to turn it off.',

  /* ══ LA TARIFICATION ═══════════════════════════════════════════════════════
   * ⚠ CA$ reste CA$ : c est la devise, pas un mot. */
  'Tarification': 'Pricing',
  'Frais de livraison standard (CA$)': 'Standard shipping fee (CA$)',
  'Facturé quand la commande n’atteint pas le seuil de livraison gratuite.':
    'Charged when the order does not reach the free shipping threshold.',
  'Seuil pour la livraison gratuite (CA$)': 'Free shipping threshold (CA$)',
  /* ⚠⚠ CE QUE FAIT LE ZERO. Le <strong> coupe la phrase : les deux formes. */
  'Au-dessus de ce montant, la livraison est gratuite. <strong>0</strong> désactive.':
    'Above this amount, shipping is free. <strong>0</strong> turns it off.',
  'Au-dessus de ce montant, la livraison est gratuite. 0 désactive.':
    'Above this amount, shipping is free. 0 turns it off.',
  'Frais traitement prioritaire (CA$)': 'Priority handling fee (CA$)',
  'Supplément si le client choisit le traitement prioritaire. <strong>0</strong> masque l’option.':
    'Extra charge if the customer picks priority handling. <strong>0</strong> hides the option.',
  'Supplément si le client choisit le traitement prioritaire. 0 masque l’option.':
    'Extra charge if the customer picks priority handling. 0 hides the option.',

  /* ══ LES PAYS DESSERVIS ════════════════════════════════════════════════════
   * ⚠⚠⚠ Voir l en-tete : ce n est pas une liste d autorisations. */
  'Pays desservis': 'Countries served',
  'Lecture des destinations…': 'Reading the destinations…',
  'Lecture des inscriptions chez Stripe…': 'Reading the registrations at Stripe…',
  'Aucune inscription active dans Stripe.': 'No active registration in Stripe.',
  'Aucun pays ne correspond.': 'No country matches.',
  '↻ Relire Stripe': '↻ Read Stripe again',
  ' pays inscrit': ' registered country',
  ' pays inscrits': ' registered countries',
  ' · dernière lecture : ': ' · last read: ',
  '· dernière lecture :': '· last read:',
  'jamais': 'never',

  /* ── LE TABLEAU ─────────────────────────────────────────────────────────── */
  'Pays': 'Country',
  'Inscription Stripe': 'Stripe registration',
  'On livre': 'We ship',
  'Pays Inscription Stripe On livre': 'Country Stripe registration We ship',
  '✓ inscrit': '✓ registered',
  '— livraison par État (': '— shipping by state (',
  '✓ inscrit — livraison par État (': '✓ registered — shipping by state (',
  /* ⚠⚠ « verrouillé » ne veut pas dire « refusé par nous » : le pays n est pas
     inscrit CHEZ STRIPE. L infobulle dit ou aller le debloquer. */
  'verrouillé': 'locked',
  'Ajoutez l inscription fiscale dans Stripe pour ouvrir ce pays':
    'Add the tax registration in Stripe to open this country',
  /* L etiquette lue par un lecteur d ecran : le nom du pays vient de Stripe. */
  'Livrer vers ': 'Ship to ',
  'Livrer vers': 'Ship to',
  'Filtrer': 'Filter',
  'Filtrer…': 'Filter…',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  /* Quatre phrases entieres : pays ou Etat, ouvert ou retire. */
  'Pays desservi.': 'Country served.',
  'Pays retiré.': 'Country removed.',
  'État desservi.': 'State served.',
  'État retiré.': 'State removed.',
  'Livraison enregistrée.': 'Shipping saved.'
};
