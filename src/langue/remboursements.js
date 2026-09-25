'use strict';

/*
 * REMBOURSEMENTS ET CREDITS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ UN REMBOURSEMENT ET UN CREDIT BOUTIQUE NE SONT PAS LA MEME CHOSE, et les
 * melanger dans un total unique donnerait un chiffre qui ne veut rien dire — ni
 * pour la caisse, ni pour le comptable. Le premier est de l argent SORTI ; le
 * second est une promesse qu il faudra honorer un jour. Les quatre tuiles
 * doivent rester quatre sens distincts :
 *   · « Total remboursé »  — de l argent deja rendu ;
 *   · « Crédits émis »     — ce qu on a promis ;
 *   · « Crédits utilisés » — ce qui a DEJA ete depense en boutique ;
 *   · « Solde à honorer »  — un PASSIF, ce qu on devra encore.
 * Traduire « solde » comme un simple reste, ou « émis » comme « donné », efface
 * la difference qui fait tenir la comptabilite.
 *
 * ⚠⚠ « MOYEN ORIGINAL » VEUT DIRE QUE L ARGENT EST REPARTI PAR OU IL EST VENU
 * (la carte, l argent comptant), par opposition a un credit boutique. C est ce
 * que la cliente a recu, et c est ce qu il faudra lui dire si elle appelle.
 *
 * ⚠ Le numero, le nom de la cliente, les montants, le motif et le mode viennent
 * du coeur : ce sont des DONNEES.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Remboursements et crédits — Administration Sandriza':
    'Refunds and credits — Sandriza Administration',
  'Remboursements et crédits': 'Refunds and credits',
  'Remboursements indisponibles': 'Refunds unavailable',
  'Votre rôle ne donne pas accès aux remboursements.':
    'Your role does not give access to the refunds.',
  'Cette commande n’existe plus.': 'This order no longer exists.',

  /* ── LES DEUX ONGLETS ───────────────────────────────────────────────────── */
  'Remboursements': 'Refunds',
  'Crédits boutique': 'Store credits',

  /* ══ LES QUATRE TUILES ═════════════════════════════════════════════════════
   * ⚠⚠⚠ Quatre sens distincts — voir l en-tete. */
  'Total remboursé': 'Total refunded',
  ' remboursement': ' refund',
  ' remboursements': ' refunds',
  'Crédits émis': 'Credits issued',
  ' crédit': ' credit',
  ' crédits': ' credits',
  'Crédits utilisés': 'Credits used',
  'déjà dépensés': 'already spent',
  'Crédits utilisés déjà dépensés': 'Credits used already spent',
  /* ⚠⚠ Un PASSIF : ce qu on devra encore honorer. */
  'Solde à honorer': 'Balance to honour',
  'passif · ': 'liability · ',
  'Solde à honorer passif ·': 'Balance to honour liability ·',
  ' actif': ' active',
  ' actifs': ' active',

  /* ── LE SOUS-TITRE DE L EN-TETE ─────────────────────────────────────────── */
  ' remboursés · ': ' refunded · ',
  'remboursés ·': 'refunded ·',
  ' à honorer': ' to honour',
  'à honorer': 'to honour',

  /* ══ LES DEUX TABLEAUX ═════════════════════════════════════════════════════ */
  'Aucun remboursement.': 'No refund.',
  'Aucun crédit boutique.': 'No store credit.',
  'N°': 'No.',
  'Date': 'Date',
  'Commande': 'Order',
  'Client': 'Customer',
  'Mode': 'Method',
  'Motif': 'Reason',
  'Sous-total': 'Subtotal',
  'N° Date Commande Client': 'No. Date Order Customer',
  'Mode Motif Sous-total': 'Reason Method Subtotal',
  'Émis le': 'Issued on',
  'Expiration': 'Expiry',
  'Montant': 'Amount',
  'Utilisé': 'Used',
  'Solde': 'Balance',
  'Statut': 'Status',
  'N° Client Émis le Expiration': 'No. Customer Issued on Expiry',
  'Montant Utilisé': 'Amount Used',
  'Solde Statut': 'Balance Status',
  /* ⚠⚠ L argent est reparti PAR OU IL EST VENU. Voir l en-tete. */
  'Moyen original': 'Original method',
  'Page ': 'Page ',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Numéro, commande, client': 'Number, order, customer',
  'Numéro, commande, client…': 'Number, order, customer…',
  'Ouvrir la commande': 'Open the order',
  'Crédit': 'Credit',
  'Épuisé': 'Used up',
  'Expiré': 'Expired',
  'Ce remboursement n’est rattaché à aucune commande.':
    'This refund is not attached to any order.',
  'Ouverture de la commande…': 'Opening the order…',
  'Commande ouverte.': 'Order opened.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Page': 'Page',
  'Frais': 'Fees',
  'Total': 'Total',
  // La refonte de la liste, comme l'Inventaire (2026-09-25). L'en-tête des
  // crédits se lit aussi d'un bloc.
  'Client et remboursement': 'Customer and refund',
  'Actif': 'Active',
  'Client et crédit': 'Customer and credit',
  'Client et crédit Émis le Expiration': 'Customer and credit Issued on Expiry',
};
