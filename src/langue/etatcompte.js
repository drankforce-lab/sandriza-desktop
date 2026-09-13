'use strict';

/*
 * ÉTAT DE COMPTE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LE DOCUMENT LUI-MEME NE VIENT PAS D ICI. L etat de compte est construit
 * par le SITE (Billing) et arrive en HTML tout fait : la fenetre le pose tel
 * quel. Aucune de ses lignes ne passe par ce dictionnaire, et elle ne peut pas
 * les atteindre. Ce qui se traduit ici, c est le CADRE : le titre, les deux
 * boutons, la pastille de solde et les verdicts.
 *
 * ⚠⚠ « ENVOYER AU CLIENT » PART VRAIMENT, ET A UNE VRAIE ADRESSE. Le geste est
 * arme en deux clics et la phrase d armement NOMME L ADRESSE — c est la seule
 * facon de s apercevoir qu on s apprete a envoyer l etat de compte de quelqu un
 * a la mauvaise personne.
 *
 * ⚠⚠ SANS ADRESSE AU DOSSIER, LE BOUTON RESTE ETEINT ET LE DIT. « Aucune adresse
 * au dossier » n est pas une panne : c est une fiche incomplete, et le mot
 * « dossier » dit ou aller la completer.
 *
 * ⚠ « compte à jour » et « solde … » sont deux verdicts opposes : le premier dit
 * qu il n y a rien a reclamer, le second combien. Le nom de la cliente, son
 * adresse et les montants sont des DONNEES.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'État de compte — Administration Sandriza':
    'Account statement — Sandriza Administration',
  'État de compte': 'Account statement',
  'État de compte indisponible': 'Account statement unavailable',
  'Votre rôle ne donne pas accès aux états de compte.':
    'Your role does not give access to the account statements.',
  'Ce client n’existe plus.': 'This customer no longer exists.',

  /* ── LA PASTILLE ────────────────────────────────────────────────────────── */
  'solde ': 'balance ',
  'compte à jour': 'account up to date',

  /* ══ LES DEUX GESTES ═══════════════════════════════════════════════════════
   * ⚠⚠ L adresse suit : c est elle qu on doit relire avant d envoyer. */
  'Imprimer': 'Print',
  'Envoyer au client': 'Send to the customer',
  'Envoyer cet état de compte à ': 'Send this account statement to ',
  'Envoyer cet état de compte à': 'Send this account statement to',
  'Envoyer à ': 'Send to ',
  'Envoyer à': 'Send to',
  /* ⚠⚠ Une fiche incomplete, pas une panne — et le mot dit ou la completer. */
  'Aucune adresse courriel au dossier de ce client':
    'No email address on file for this customer',
  'Aucune adresse au dossier': 'No address on file',

  /* ══ LES VERDICTS ══════════════════════════════════════════════════════════ */
  'L’impression a échoué.': 'The printing failed.',
  'Le courriel n’est pas parti.': 'The email did not go out.',
  'État de compte envoyé à l’impression.': 'Account statement sent to printing.',
  'Confirmer l’envoi ?': 'Confirm the sending?',
  /* ⚠⚠⚠ L ADRESSE EST NOMMEE AVANT L ENVOI. Voir l en-tete. */
  'Cliquez de nouveau pour envoyer l’état de compte à ':
    'Click again to send the account statement to ',
  'Cliquez de nouveau pour envoyer l’état de compte à':
    'Click again to send the account statement to',
  'Envoi du courriel…': 'Sending the email…',
  'État de compte envoyé à ': 'Account statement sent to ',
  'État de compte envoyé à': 'Account statement sent to'
};
