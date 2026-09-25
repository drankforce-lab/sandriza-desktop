'use strict';

/*
 * FACTURES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ SUPPRIMER UNE FACTURE LA RETIRE DE PARTOUT, Y COMPRIS DU COMPTE CLIENT.
 * Ce n est pas « la cacher » : l etat de compte du client change, et le geste ne
 * se defait pas. La phrase d armement le dit en toutes lettres, et c est la
 * seule chose qui separe un clic de trop d une piece comptable disparue.
 *
 * ⚠⚠ « EN RETARD » N EST PAS « NON PAYÉE ». Les deux sont impayees ; « En
 * retard » veut dire que L ECHEANCE EST PASSEE. C est ce qui decide qui l on
 * relance aujourd hui. Les confondre fait relancer des clients a jour, ou
 * oublier ceux qui ne le sont pas.
 *
 * ⚠⚠ « ENCAISSÉ » ET « À RECEVOIR » NE SE DEDUISENT PAS L UN DE L AUTRE : l un
 * est entre, l autre est du. Et « Remboursé » est de l argent RENDU, pas de
 * l argent qui manque. Trois tuiles, trois sens.
 *
 * ⚠⚠ L ETAT DE COMPTE PART A L IMPRESSION DANS LA FENETRE PRINCIPALE : il ne
 * s affiche pas ici. Le verdict le dit entre parentheses, sinon on attend
 * quelque chose qui ne viendra jamais dans cette fenetre-ci.
 *
 * ⚠ Le numero de facture, le numero de commande, le nom du client, les montants
 * et le libelle de statut rendu par le coeur sont des DONNEES.
 */

module.exports = {
  /* ⚠ LES DEUX ALTERNATIVES EN ENTIER — voir `tools/banc-pluriel-colle.js`. */
  'facture': 'invoice',
  'factures': 'invoices',
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Factures — Administration Sandriza': 'Invoices — Sandriza Administration',
  'Factures': 'Invoices',
  'Factures indisponibles': 'Invoices unavailable',
  'Votre rôle ne donne pas accès aux factures.':
    'Your role does not give access to the invoices.',
  'Cette facture n’existe plus.': 'This invoice no longer exists.',

  /* ══ LES TUILES ════════════════════════════════════════════════════════════
   * ⚠⚠ Encaisse, a recevoir et rembourse sont trois choses differentes. */
  'Total facturé': 'Total invoiced',
  'Encaissé': 'Collected',
  'À recevoir': 'Outstanding',
  'Remboursé': 'Refunded',
  ' remboursement': ' refund',
  ' remboursements': ' refunds',
  'Dépenses ': 'Expenses ',
  'Nb factures': 'Invoice count',

  /* ══ LA RECHERCHE ET LES STATUTS ═══════════════════════════════════════════
   * ⚠⚠ « En retard » = l echeance est passee. Voir l en-tete. */
  'Numéro, commande ou client': 'Number, order or customer',
  'Numéro, commande ou client…': 'Number, order or customer…',
  'Tous les statuts': 'All statuses',
  'Payée': 'Paid',
  'Non payée': 'Unpaid',
  'En retard': 'Overdue',
  'Annulée': 'Cancelled',
  /* ⚠ Les infobulles ENTIERES : une cle courte posee dans une phrase plus
     longue laisserait l autre moitie en francais. */
  'Marquer la facture comme payée': 'Mark the invoice as paid',
  'Annuler le statut de paiement': 'Cancel the payment status',
  'Ouvrir la facture': 'Open the invoice',
  'Client de la facture': 'Customer of the invoice',

  /* ══ LA LISTE ══════════════════════════════════════════════════════════════ */
  'Aucune facture ne correspond.': 'No invoice matches.',
  'Numéro': 'Number',
  'Commande': 'Order',
  'Client': 'Customer',
  'Échéance': 'Due',
  'Total': 'Total',
  'Statut': 'Status',
  'Numéro Commande Client': 'Number Order Customer',
  'Échéance Total Statut': 'Due Total Status',
  'Page ': 'Page ',

  /* ══ L ETAT DE COMPTE ══════════════════════════════════════════════════════
   * ⚠⚠ Il part a l IMPRESSION, dans la fenetre principale. */
  'État de compte client': 'Customer statement',
  '— Choisir un client —': '— Choose a customer —',
  'Générer l’état': 'Generate the statement',
  'Choisissez un client.': 'Choose a customer.',
  'État de compte envoyé à l’impression (fenêtre principale).':
    'Statement sent to printing (main window).',

  /* ══ LES VERDICTS ══════════════════════════════════════════════════════════
   * ⚠ Le numero de la facture s intercale : seule la phrase autour se lit. */
  'Facture ': 'Invoice ',
  ' marquée comme payée.': ' marked as paid.',
  'marquée comme payée.': 'marked as paid.',
  'Statut de paiement annulé pour ': 'Payment status cancelled for ',
  'Statut de paiement annulé pour': 'Payment status cancelled for',
  'la facture': 'the invoice',
  ' supprimée.': ' deleted.',
  'Facture ouverte dans sa fenêtre.': 'Invoice opened in its own window.',
  /* ⚠⚠⚠ RETIREE DE PARTOUT, Y COMPRIS DU COMPTE CLIENT. Voir l en-tete. */
  'Cliquez « Confirmer ? » pour supprimer définitivement — la facture sera retirée de partout, y compris du compte client.':
    'Click « Confirm? » to delete for good — the invoice will be removed from everywhere, including the customer statement.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Page': 'Page',
  // La refonte de la liste, comme l'Inventaire (2026-09-25).
  'Client et facture': 'Customer and invoice',
};
