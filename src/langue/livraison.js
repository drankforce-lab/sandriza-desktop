'use strict';

/*
 * CONFIGURATION DE LA LIVRAISON — les deux langues
 * =============================================================================
 * ⚠⚠⚠ DEPUIS LE 2026-10-02, TOUS LES PAYS SONT DESSERVIS, SAUF CEUX QU ON
 * DECOCHE. Aucune taxe n est percue hors du Canada : les inscriptions Stripe ne
 * decident plus de rien (colonne « Inscription Stripe », « verrouillé » et
 * « Relire Stripe » retires). On n enregistre que les exclusions.
 *
 * ⚠⚠ LES TROIS MONTANTS SONT DES REGLAGES QUI COUTENT DE L ARGENT A CHAQUE
 * COMMANDE : frais standard, seuil de gratuite, supplement prioritaire. Chacun
 * porte sa phrase d aide, et deux d entre elles disent ce que fait la valeur 0
 * — « 0 désactive », « 0 masque l’option ». Perdre ce detail laisse un seuil a
 * zero qui rend toute la livraison gratuite sans que personne comprenne.
 *
 * ⚠⚠ LE TABLEAU DES PAYS N EXISTE QUE SI L INTERNATIONAL EST ALLUME, et les deux
 * verdicts de la bascule disent qu il faut ENREGISTRER avant que quoi que ce
 * soit change : « Enregistrez pour activer la livraison internationale. »
 *
 * ⚠ CA$ EST UNE DEVISE, pas un mot : elle reste telle quelle dans les deux
 * langues. Le nom des pays et des Etats vient de la liste du site, le code aussi.
 */

module.exports = {
  /* ⚠ LES DEUX ALTERNATIVES EN ENTIER — voir tools/banc-pluriel-colle.js. */
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
  'Enregistrez pour activer la livraison internationale.':
    'Save to turn on international shipping.',
  'Enregistrez pour désactiver.': 'Save to turn it off.',

  /* ══ LA TARIFICATION ═══════════════════════════════════════════════════════
   * ⚠ CA$ reste CA$ : c est la devise, pas un mot. */
  'Tarification': 'Pricing',
  'Frais de livraison standard (CA$)': 'Standard shipping fee (CA$)',
  'Facturé quand la commande n’atteint pas le seuil de livraison gratuite.':
    'Charged when the order does not reach the free shipping threshold.',
  'Seuil pour la livraison gratuite (CA$)': 'Free shipping threshold (CA$)',
  /* ── DEUX SEUILS (2026-10-07) : Canada et international ── */
  'Seuil de livraison gratuite au Canada (CA$)': 'Free shipping threshold in Canada (CA$)',
  'Seuil de livraison gratuite à l’international (CA$)': 'International free shipping threshold (CA$)',
  'Hors du Canada, au-dessus de ce montant, la livraison est gratuite. <strong>0</strong> désactive.':
    'Outside Canada, above this amount, shipping is free. <strong>0</strong> turns it off.',
  'Hors du Canada, au-dessus de ce montant, la livraison est gratuite. 0 désactive.':
    'Outside Canada, above this amount, shipping is free. 0 turns it off.',
  'À l’international, la livraison est gratuite dès': 'Internationally, shipping is free from',
  'À l’international, la livraison n’est jamais gratuite.': 'Internationally, shipping is never free.',
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
  'Aucun pays ne correspond.': 'No country matches.',
  ' pays desservi': ' country served',
  ' pays desservis': ' countries served',
  'pays desservi': 'country served',
  'pays desservis': 'countries served',
  ' · aucune taxe hors du Canada': ' · no tax outside Canada',
  '· aucune taxe hors du Canada': '· no tax outside Canada',

  /* ── LE TABLEAU ─────────────────────────────────────────────────────────── */
  'Pays': 'Country',
  'On livre': 'We ship',
  'Pays On livre': 'Country We ship',
  /* L etiquette lue par un lecteur d ecran : le nom du pays vient du site. */
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
  'Livraison enregistrée.': 'Shipping saved.',
  /* ── RELOOKING 2026 (2026-10-04) ── */
  'Sous': 'Under',
  ', la livraison coûte': ', shipping costs',
  ' ; dès': '; from',
  ', elle est gratuite.': ', it is free.',
  'La livraison coûte toujours': 'Shipping always costs',
  ' — aucun seuil de gratuité.': ' — no free-shipping threshold.',
  'Traitement prioritaire :': 'Priority handling:',
  // Les onglets (7.10.0)
  'Sections de la livraison': 'Shipping sections',
  'Tarifs': 'Rates',
};
