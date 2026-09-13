'use strict';

/*
 * CONFIGURATION DES RETOURS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LA MOITIE DE LA FENETRE DECIDE COMMENT LA CLIENTE EST REMBOURSEE. Avant
 * la moitie du delai : remboursement AU MOYEN D ORIGINE (la carte) ou credit
 * boutique, au choix de la cliente. Apres : credit boutique UNIQUEMENT. Ce n est
 * pas une nuance d affichage — c est de l argent qui revient sur la carte, ou
 * qui reste chez nous. Et la phrase le dit deux fois, parce que les deux
 * endroits se lisent a des moments differents.
 *
 * ⚠⚠ CE QUI EST ECRIT ICI SORT DE L ADMINISTRATION : la regle « s’affiche dans
 * la politique, les factures, le courriel et le portail client ». La phrase
 * nomme les quatre endroits ; sans elle, on croit regler un detail interne.
 *
 * ⚠⚠ L ADRESSE DE RENVOI EST UNE DONNEE : elle est IMPRIMEE SUR L ETIQUETTE DE
 * RETOUR et citee aux clientes. Le nom de l entreprise, la rue, la ville, la
 * province, le code postal et le pays ne passent pas par ce dictionnaire — seules
 * leurs etiquettes se lisent.
 *
 * ⚠ LE NOMBRE DE JOURS DOIT ETRE PAIR, parce que la moitie doit tomber juste. Le
 * verdict dit quand il a ete ajuste au pair superieur : sans cela, on croit que
 * sa saisie n a pas ete prise.
 *
 * ⚠ « Adresse de retour non configurée » n est pas une erreur : c est un travail
 * qui reste a faire, et la phrase dit ce qu il empeche.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Configuration des retours — Administration Sandriza':
    'Returns configuration — Sandriza Administration',
  'Configuration des retours': 'Returns configuration',
  'Lecture seule : vous pouvez consulter les réglages, pas les modifier.':
    'Read only: you can look at the settings, not change them.',
  'Votre rôle est en lecture seule : les retours ne peuvent pas être modifiés.':
    'Your role is read only: the returns cannot be changed.',
  'L’enregistrement dans le nuage a échoué. Réessayez.':
    'Saving to the cloud failed. Try again.',
  /* ⚠ Un travail qui reste a faire, et ce qu il empeche. */
  ' Adresse de retour non configurée — renseignez-la pour pouvoir guider les clients qui renvoient un colis.':
    ' Return address not set — fill it in so you can guide customers who send a parcel back.',
  '⚠ Adresse de retour non configurée — renseignez-la pour pouvoir guider les clients qui renvoient un colis.':
    '⚠ Return address not set — fill it in so you can guide customers who send a parcel back.',

  /* ══ LA FENETRE DE RETOUR ══════════════════════════════════════════════════
   * ⚠⚠⚠ La moitie du delai decide COMMENT la cliente est remboursee. */
  'Fenêtre de retour': 'Return window',
  'Compté à partir de la réception de la commande. Doit être un nombre pair.':
    'Counted from the day the order is received. Must be an even number.',
  'Nombre de jours autorisés pour un retour': 'Number of days allowed for a return',
  'La <strong>moitié</strong> (': 'The <strong>half</strong> (',
  'La moitié (': 'The half (',
  ' jours) permet le remboursement au moyen d’origine ; au-delà, crédit boutique.':
    ' days) allows a refund to the original method; beyond that, store credit.',
  'jours) permet le remboursement au moyen d’origine ; au-delà, crédit boutique.':
    'days) allows a refund to the original method; beyond that, store credit.',
  /* ⚠⚠ Les quatre endroits ou la regle se lit. */
  'Remboursement partiel en crédit boutique': 'Partial refund in store credit',
  'Durant la première moitié : remboursement au moyen d’origine OU crédit boutique, au choix du client. Ensuite : crédit boutique uniquement. S’affiche dans la politique, les factures, le courriel et le portail client.':
    'During the first half: refund to the original method OR store credit, the customer chooses. After that: store credit only. Shown in the policy, the invoices, the email and the customer portal.',

  /* ══ L ADRESSE DE RENVOI ═══════════════════════════════════════════════════
   * ⚠⚠ L adresse est une DONNEE : elle est IMPRIMEE. Seules les etiquettes se
   * lisent. */
  'Adresse de renvoi': 'Return address',
  'L’adresse imprimée sur l’étiquette de retour et citée aux clients.':
    'The address printed on the return label and quoted to customers.',
  'Nom de l’entreprise': 'Business name',
  'Rue': 'Street',
  'Ville': 'City',
  'Province': 'Province',
  'Code postal': 'Postal code',
  'Pays': 'Country',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  /* ⚠ Quand la saisie a ete ajustee, on le DIT : sinon on croit qu elle n a pas
     ete prise. */
  'Enregistré — jours ajustés au pair supérieur (':
    'Saved — days rounded up to the next even number (',
  'Retours enregistrés.': 'Returns saved.'
};
