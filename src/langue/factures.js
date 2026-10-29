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
  'Âge des comptes à recevoir': 'Accounts receivable aging',
  'Pas encore dû': 'Not yet due',
  '1 à 30 jours': '1 to 30 days',
  'Retard sur l’échéance': 'Days past the due date',
  '31 à 60 jours': '31 to 60 days',
  'Plus de 60 jours': 'Over 60 days',
  '✓ Marquer payée': '✓ Mark paid',
  'Annuler le paiement': 'Undo payment',
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
  // 2026-10-15 : confirmations en boîte à part.
  'Supprimer la facture': 'Delete invoice',
  'La facture': 'Invoice',
  'sera supprimée définitivement. Elle sera retirée de partout, y compris du compte client. Cette action est irréversible.': 'will be permanently deleted. It will be removed everywhere, including from the customer account. This action cannot be undone.',
  // 2026-10-16 : la grammaire de la Comptabilité (tête, quatre chiffres, onglets, panneau d'appui).
  '{0} à recevoir': '{0} outstanding',
  '{0} % du facturé': '{0}% of invoiced',
  'Aucune facture impayée': 'No unpaid invoice',
  '{0} factures impayées': '{0} unpaid invoices',
  '1 facture impayée': '1 unpaid invoice',
  'échéance {0}': 'due {0}',
  'Toutes': 'All',
  'Non payées': 'Unpaid',
  'Payées': 'Paid',
  'Annulées': 'Cancelled',
  'Facture': 'Invoice',
  'Encaissement': 'Collection',
  'Prochaines échéances': 'Upcoming due dates',
  'Aucune facture à recevoir.': 'No outstanding invoice.',
  '{0} factures en retard.': '{0} overdue invoices.',
  '1 facture en retard.': '1 overdue invoice.',
  'Aucune facture en retard.': 'No overdue invoice.',
  'Total saisi': 'Total entered',
  'Page précédente': 'Previous page',
  'Page suivante': 'Next page',
  'Chercher un client : nom ou courriel…': 'Search a customer: name or email…',
  'Chercher un client': 'Search a customer',
  '— Tapez quelques lettres —': '— Type a few letters —',
  '— {0} clients, les 20 premiers —': '— {0} customers, first 20 —',
  'Aucun client ne correspond.': 'No customer matches.',
  // Gestes groupés (2026-10-29)
  "{0} facture sélectionnée": "{0} invoice selected",
  "{0} factures sélectionnées": "{0} invoices selected",
  "Marquer payée": "Mark as paid",
  "Imprimer": "Print",
  "Exporter (CSV)": "Export (CSV)",
  "{0} autre sélectionnée ne s’y prête pas : elle ne change pas.": "{0} other selected invoice does not qualify: it stays unchanged.",
  "{0} autres sélectionnées ne s’y prêtent pas : elles ne changent pas.": "{0} other selected invoices do not qualify: they stay unchanged.",
  "Courriel": "Email",
  "{0} facture exportée": "{0} invoice exported",
  "{0} factures exportées": "{0} invoices exported",
  "Impression des factures": "Printing the invoices",
  "{0} facture envoyée à l’impression.": "{0} invoice sent to the printer.",
  "{0} factures envoyées à l’impression.": "{0} invoices sent to the printer.",
  "{0} facture sera marquée payée.": "{0} invoice will be marked as paid.",
  "{0} factures seront marquées payées.": "{0} invoices will be marked as paid.",
  "{0} facture redeviendra « non payée ».": "{0} invoice will go back to “unpaid”.",
  "{0} factures redeviendront « non payées ».": "{0} invoices will go back to “unpaid”.",
  "Montant total": "Total amount",
  "Marquer {0} facture payée": "Mark {0} invoice as paid",
  "Marquer {0} factures payées": "Mark {0} invoices as paid",
  "Annulation des paiements": "Cancelling payments",
  "{0} facture marquée payée.": "{0} invoice marked as paid.",
  "{0} factures marquées payées.": "{0} invoices marked as paid.",
  "{0} paiement annulé.": "{0} payment cancelled.",
  "{0} paiements annulés.": "{0} payments cancelled.",
};
