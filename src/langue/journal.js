'use strict';

/*
 * JOURNAL D ENVOI — les deux langues
 * =============================================================================
 * ⚠⚠⚠ EFFACER LE JOURNAL N ANNULE RIEN : les courriels sont partis, et ils
 * restent partis. Ce qu on efface, c est LA PREUVE de ce qui est parti. La
 * phrase d armement dit les deux — ce qu on perd, et ce qu on ne defait pas.
 * L abreger laisserait croire qu on rappelle des envois.
 *
 * ⚠⚠ « ÉCHECS SEULEMENT » EST LE FILTRE QU ON VIENT CHERCHER : un journal
 * complet ne dit rien, la liste des echecs dit qui n a pas recu son courriel.
 *
 * ⚠ Le destinataire, la reference, le genre d envoi et le detail rendu par le
 * service viennent du coeur : ce sont des DONNEES.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Journal d’envoi — Administration Sandriza':
    'Sending log — Sandriza Administration',
  'Journal d’envoi': 'Sending log',
  'Journal indisponible': 'Log unavailable',
  'Votre rôle ne donne pas accès à l’infolettre.':
    'Your role does not give access to the newsletter.',

  /* ── LA BARRE ───────────────────────────────────────────────────────────── */
  'Envois enregistrés': 'Sendings recorded',
  /* ⚠⚠ Le filtre qu on vient chercher : qui n a PAS recu son courriel. */
  'Échecs seulement': 'Failures only',
  'Échecs': 'Failures',
  'Échec': 'Failure',
  'Envoyé': 'Sent',
  'Adresse ou campagne': 'Address or campaign',
  'Adresse ou campagne…': 'Address or campaign…',
  ' derniers envois': ' last sendings',
  'Effacer le journal': 'Clear the log',

  /* ══ LE TABLEAU ════════════════════════════════════════════════════════════
   * ⚠ Le destinataire et la reference sont des DONNEES. */
  'Rien ne correspond.': 'Nothing matches.',
  'Aucun envoi enregistré.': 'No sending recorded.',
  'Date': 'Date',
  'Genre': 'Kind',
  'Référence': 'Reference',
  'Destinataire': 'Recipient',
  'Résultat': 'Result',
  'Détail': 'Detail',
  'Date Genre Référence': 'Date Kind Reference',
  'Destinataire Résultat Détail': 'Recipient Result Detail',

  /* ══ EFFACER ═══════════════════════════════════════════════════════════════
   * ⚠⚠⚠ Ce qu on perd, et ce qu on ne defait pas. Voir l en-tete. */
  'Cliquez « Confirmer ? » — le journal est effacé, et avec lui la preuve de ce qui est parti. Les envois eux-mêmes ne sont pas annulés.':
    'Click « Confirm? » — the log is cleared, and with it the proof of what went out. The sendings themselves are not cancelled.',
  'Cliquez « Confirmer ? » — le journal est effacé, et avec lui la preuve':
    'Click « Confirm? » — the log is cleared, and with it the proof',
  'de ce qui est parti. Les envois eux-mêmes ne sont pas annulés.':
    'of what went out. The sendings themselves are not cancelled.',
  ' entrée effacée.': ' entry cleared.',
  ' entrées effacées.': ' entries cleared.',
  'entrée effacée.': 'entry cleared.',
  'entrées effacées.': 'entries cleared.'
};
