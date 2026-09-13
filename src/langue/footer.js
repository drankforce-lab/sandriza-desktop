'use strict';

/*
 * PIED DE PAGE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ TOUT CE QUI EST TAPE ICI PART DANS LA BOUTIQUE : la signature, l adresse,
 * le courriel, le telephone et les deux numeros de taxes s affichent au bas de
 * CHAQUE page du site. Rien de cela ne passe par ce dictionnaire. Ce sont des
 * DONNEES — et deux d entre elles, les numeros TPS et TVQ, sont des obligations
 * legales : une erreur s y voit sur chaque facture.
 *
 * ⚠⚠ IL Y A DEUX CHAMPS D ADRESSE, ET CE N EST PAS UN DOUBLON : « (FR) » et
 * « (EN) » sont les deux versions que le SITE affichera selon la langue de la
 * visiteuse. Les marqueurs FR et EN ne se traduisent pas — ils nomment des
 * langues. Et « affichée en mode anglais » dit a quoi sert la seconde ; sans
 * cette phrase, on remplit deux fois la meme adresse.
 *
 * ⚠⚠ TPS ET TVQ SONT LES NOMS OFFICIELS des deux taxes du Quebec : ils
 * s ecrivent ainsi sur les factures, dans les deux langues. On ne les traduit
 * pas, pas plus que les exemples de format qui les accompagnent.
 *
 * ⚠ « Aperçu : » montre la LIGNE telle qu elle se lira. Elle est affichee dans
 * la langue de qui regarde cet ecran ; le SITE, lui, l ecrit dans la langue de
 * la visiteuse, depuis son propre dictionnaire. Ce qu on vient verifier ici,
 * ce sont les NUMEROS.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Pied de page — Administration Sandriza': 'Footer — Sandriza Administration',
  'Pied de page': 'Footer',
  'Lecture seule : vous pouvez consulter le pied de page, pas le modifier.':
    'Read only: you can look at the footer, not change it.',
  'Votre rôle est en lecture seule : le pied de page ne peut pas être modifié.':
    'Your role is read only: the footer cannot be changed.',
  'La configuration n’est pas prête dans la fenêtre principale.':
    'The configuration is not ready in the main window.',
  'L’enregistrement dans le nuage a échoué. Réessayez.':
    'Saving to the cloud failed. Try again.',

  /* ══ LA COLONNE MARQUE ═════════════════════════════════════════════════════
   * ⚠ Les etiquettes seulement : ce qui est tape s affiche dans la boutique. */
  'Colonne marque': 'Brand column',
  'Tagline': 'Tagline',
  /* ⚠⚠ Deux adresses, pas un doublon : FR et EN nomment des LANGUES. */
  'Adresse complète (FR)': 'Full address (FR)',
  'Adresse complète (EN)': 'Full address (EN)',
  'affichée en mode anglais': 'shown in English mode',
  'Courriel de contact': 'Contact email',
  'Téléphone': 'Phone',

  /* ══ COPYRIGHT ET TAXES ════════════════════════════════════════════════════
   * ⚠⚠ TPS et TVQ sont les noms OFFICIELS des deux taxes du Quebec : ils
   * s ecrivent ainsi dans les deux langues, et les exemples de format aussi. */
  'Copyright et numéros de taxes': 'Copyright and tax numbers',
  'Numéro TPS': 'TPS number',
  'ex. 123456789 RT0001': 'e.g. 123456789 RT0001',
  'Numéro TVQ': 'TVQ number',
  'ex. 9876543210 TQ0001': 'e.g. 9876543210 TQ0001',
  /* ⚠ L apercu montre la ligne a qui regarde CET ecran ; le site l ecrit dans
     la langue de la visiteuse, depuis son propre dictionnaire. */
  'Aperçu : © ': 'Preview: © ',
  'Aperçu : ©': 'Preview: ©',
  '. Tous droits réservés.': '. All rights reserved.',

  /* ── LE VERDICT ─────────────────────────────────────────────────────────── */
  'Pied de page enregistré.': 'Footer saved.'
};
