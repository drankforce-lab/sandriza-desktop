'use strict';

/*
 * ARCHIVES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ « REMBOURSER » ET « RÉACTIVER » NE FONT PAS LA MEME CHOSE, et les deux
 * SORTENT une commande de l archive pour 45 jours. Le premier la reactive ET
 * l ouvre dans sa fenetre pour traiter le remboursement ; le second la remet
 * simplement dans les commandes actives. Les confondre remet en circulation une
 * commande que personne ne voulait rouvrir — et les deux verdicts sont la seule
 * chose qui dise laquelle des deux vient de se produire.
 *
 * ⚠⚠ LES TROIS DUREES SONT DES FAITS, PAS DES APPROXIMATIONS : 45 jours apres la
 * LIVRAISON pour l archivage, 6 ans de conservation, 45 jours de sursis quand on
 * reactive. Elles disent a quelqu un s il doit agir aujourd hui ou s il a le
 * temps. Ne jamais les arrondir ni les laisser tomber d une phrase.
 *
 * ⚠ ARCHIVER N EST PAS SUPPRIMER : rien n est perdu, tout est conservé six ans.
 * Le sous-titre le dit des l ouverture de la fenetre.
 *
 * ⚠ Le numero de commande, le nom de la cliente, les montants, le statut et le
 * motif viennent du coeur : ce sont des DONNEES.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Archives — Administration Sandriza': 'Archives — Sandriza Administration',
  'Archives': 'Archives',
  'Archives indisponibles': 'Archives unavailable',
  /* ⚠⚠ Les deux durees, des l ouverture. */
  'livrées il y a plus de 45 jours · conservées 6 ans':
    'delivered more than 45 days ago · kept 6 years',
  'Votre rôle ne donne pas accès aux archives.':
    'Your role does not give access to the archives.',
  'Cet élément n’existe plus dans l’archive.':
    'This item no longer exists in the archive.',

  /* ══ CE QUE L ARCHIVE FAIT ═════════════════════════════════════════════════
   * ⚠⚠ Les durees sont des faits : ne pas les arrondir. */
  'Les commandes livrées sont archivées automatiquement 45 jours après leur livraison, avec leurs factures et remboursements associés, puis conservées 6 ans.':
    'Delivered orders are archived automatically 45 days after their delivery, along with their invoices and refunds, then kept for 6 years.',
  'Pour rembourser une commande archivée, « Rembourser » la réactive pour un nouveau délai de 45 jours et l’ouvre dans sa fenêtre.':
    'To refund an archived order, « Refund » brings it back for a new 45-day window and opens it in its own window.',
  'Les commandes livrées sont archivées automatiquement':
    'Delivered orders are archived automatically',
  '45 jours après leur livraison, avec leurs factures et remboursements associés, puis conservées 6 ans.':
    '45 days after their delivery, along with their invoices and refunds, then kept for 6 years.',
  'Pour rembourser une commande archivée, « Rembourser » la réactive pour un nouveau délai de 45 jours':
    'To refund an archived order, « Refund » brings it back for a new 45-day window',
  'et l’ouvre dans sa fenêtre.': 'and opens it in its own window.',

  /* ══ LES QUATRE TABLEAUX ═══════════════════════════════════════════════════ */
  'Commande': 'Order',
  'Client': 'Customer',
  'Total': 'Total',
  'Statut': 'Status',
  'Motif': 'Reason',
  'Facture': 'Invoice',
  'Montant': 'Amount',
  'Date': 'Date',
  'Mode': 'Method',
  'Archivée le': 'Archived on',
  'Archivé le': 'Archived on',
  'Commande Client Total Statut Archivée le':
    'Order Customer Total Status Archived on',
  'Commande Client Statut Motif Archivé le':
    'Order Customer Status Reason Archived on',
  'Facture Client Montant Statut Archivée le':
    'Invoice Customer Amount Status Archived on',
  'N Date Commande Client Mode Total Archivé le':
    'No Date Order Customer Method Total Archived on',
  'Aucune commande archivée.': 'No archived order.',
  'Aucun retour archivé.': 'No archived return.',
  'Aucune facture archivée.': 'No archived invoice.',
  'Aucun remboursement archivé.': 'No archived refund.',
  'Rien ne correspond à la recherche.': 'Nothing matches the search.',
  'Rechercher': 'Search',
  'Rechercher…': 'Search…',
  'Détails': 'Details',
  ' élément': ' item',
  ' éléments': ' items',
  'élément': 'item',
  'Remboursé': 'Refunded',
  /* ⚠ Les trois TYPES de remboursement : le coeur les ecrit en francais et cette
     fenetre les rend lisibles. La valeur comparee, elle, ne bouge pas. */
  'Crédit': 'Credit',
  'Frais': 'Fees',
  'Original': 'Original',
  'comptoir': 'counter',
  /* ⚠ Une vente SAISIE A LA MAIN, pas une commande du site : l infobulle dit
     d ou elle vient, et c est la seule facon de le savoir. */
  'Vente saisie à la main dans Vente au comptoir':
    'Sale entered by hand in Counter sale',

  /* ══ LES DEUX GESTES ═══════════════════════════════════════════════════════
   * ⚠⚠⚠ Ils ne font pas la meme chose. Voir l en-tete. */
  'Rembourser': 'Refund',
  'Réactiver 45 jours et traiter le remboursement dans la fenêtre Commande':
    'Bring back for 45 days and handle the refund in the Order window',
  'Réactiver': 'Bring back',
  'Sortir de l’archive et remettre en commandes actives pour 45 jours':
    'Take out of the archive and put back in active orders for 45 days',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Détail ouvert dans sa fenêtre.': 'Details opened in its own window.',
  'Réactivation…': 'Bringing back…',
  /* ⚠ Le numero de commande precede : seule la suite se lit. */
  ' réactivée pour 45 jours — traitez le remboursement dans sa fenêtre.':
    ' brought back for 45 days — handle the refund in its own window.',
  'réactivée pour 45 jours — traitez le remboursement dans sa fenêtre.':
    'brought back for 45 days — handle the refund in its own window.',
  ' réactivée — de retour dans les commandes actives pour 45 jours.':
    ' brought back — in the active orders again for 45 days.',
  'réactivée — de retour dans les commandes actives pour 45 jours.':
    'brought back — in the active orders again for 45 days.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Page': 'Page'
};
