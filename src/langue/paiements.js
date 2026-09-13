'use strict';

/*
 * PAIEMENTS SQUARE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN SERT A RECONCILIER DEUX SOURCES QUI DOIVENT DIRE LA MEME CHOSE :
 * le SYSTEME (nos commandes) et SQUARE (les paiements reellement encaisses).
 * Quand elles different, la phrase qui enumere les causes possibles est tout ce
 * qui empeche de croire a une perte d argent : transactions faites hors du
 * systeme, remboursements partiels, cartes-cadeaux, commandes reglees
 * autrement. Elle se traduit ENTIERE — une cause manquante, et on cherche.
 *
 * ⚠⚠ MASQUER EST RESERVE AU BAC A SABLE, et le refus le dit : « on ne masque pas
 * des paiements réels ». C est la phrase qui explique pourquoi le bouton refuse
 * en production.
 *
 * ⚠ « Production » (le mot affiche, avec sa majuscule) et `'production'` (la
 * valeur comparee, en minuscules) ne sont PAS la meme chaine — c est ce qui
 * permet de traduire l un sans toucher a l autre. ⚠ Ne jamais ajouter de cle
 * « production » en minuscules ici.
 *
 * ⚠ Les references Square, les modes de paiement et les motifs de remboursement
 * viennent de chez Square : ce sont des donnees, rendues telles quelles.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Paiements Square — Administration Sandriza': 'Square payments — Sandriza Administration',
  'Paiements Square': 'Square payments',
  'Paiements indisponibles': 'Payments unavailable',
  'Transactions': 'Transactions',
  'Réconciliation': 'Reconciliation',
  'Année': 'Year',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux paiements.':
    'Your role does not give access to the payments.',
  'La connexion Square n’est pas configurée (Configuration → Paiement).':
    'The Square connection is not configured (Configuration → Payment).',
  /* ⚠⚠ POURQUOI LE BOUTON REFUSE EN PRODUCTION. */
  'Réservé au bac à sable — on ne masque pas des paiements réels.':
    'Sandbox only — real payments are not hidden.',
  'Aucune transaction en mémoire à masquer.': 'No transaction in memory to hide.',
  'Square n’a pas répondu.': 'Square did not answer.',

  /* ── LA BARRE ───────────────────────────────────────────────────────────── */
  'Réafficher les transactions masquées (bac à sable seulement)':
    'Show the hidden transactions again (sandbox only)',
  '↺ Réafficher (': '↺ Show again (',
  'Masquer ces transactions d’essai — bac à sable seulement':
    'Hide these test transactions — sandbox only',
  'Masquer tout': 'Hide everything',
  'Lecture chez Square…': 'Reading from Square…',
  '↻ Actualiser': '↻ Refresh',
  '⬇ Charger les transactions': '⬇ Load the transactions',
  'Production': 'Production',
  'Bac à sable': 'Sandbox',
  'non configuré': 'not configured',
  /* ⚠ Le <strong> coupe la phrase : la cle porte la balise. */
  'Configurez d’abord la connexion Square dans <strong>Configuration → Paiement</strong>, ':
    'First set up the Square connection in <strong>Configuration → Payment</strong>, ',
  'Configurez d’abord la connexion Square dans Configuration → Paiement ,':
    'First set up the Square connection in Configuration → Payment ,',
  'dans la fenêtre principale.': 'in the main window.',
  'Aucune donnée pour ': 'No data for ',
  'Aucune donnée pour': 'No data for',
  'Cliquez « Charger les transactions » pour les lire chez Square.':
    'Click « Load the transactions » to read them from Square.',
  'Lecture des paiements et des remboursements chez Square pour ':
    'Reading the payments and the refunds from Square for ',
  'Lecture des paiements et des remboursements chez Square pour':
    'Reading the payments and the refunds from Square for',

  /* ── LES TUILES ─────────────────────────────────────────────────────────── */
  'complétées · ': 'completed · ',
  'complétées ·': 'completed ·',
  'Revenu brut': 'Gross revenue',
  'avant frais': 'before fees',
  'Frais Square': 'Square fees',
  'dont ': 'of which ',
  ' récupérés · nets ': ' recovered · net ',
  'récupérés · nets': 'recovered · net',
  'déductibles d’impôt': 'tax deductible',
  'Revenu net': 'Net revenue',
  'après remb. et frais nets': 'after refunds and net fees',

  /* ── LE TABLEAU DES TRANSACTIONS ────────────────────────────────────────── */
  'Transactions — ': 'Transactions — ',
  'Transactions —': 'Transactions —',
  'Aucune transaction pour ': 'No transaction for ',
  'Aucune transaction pour': 'No transaction for',
  'Date': 'Date',
  'Réf. Square': 'Square ref.',
  'Mode de paiement': 'Payment method',
  'Brut': 'Gross',
  'Frais': 'Fees',
  'Net reçu': 'Net received',
  'Date Réf. Square Mode de paiement': 'Date Square ref. Payment method',
  'Brut Frais Net reçu': 'Gross Fees Net received',
  'Total ': 'Total ',

  /* ── LES REMBOURSEMENTS ─────────────────────────────────────────────────── */
  'Remboursements — ': 'Refunds — ',
  'Remboursements —': 'Refunds —',
  'Réf.': 'Ref.',
  'Paiement d’origine': 'Original payment',
  'Motif': 'Reason',
  'Montant': 'Amount',
  'Date Réf. Paiement d’origine Motif': 'Date Ref. Original payment Reason',
  'en attente': 'pending',
  'Total des remboursements': 'Total refunds',

  /* ══ LA RECONCILIATION ═════════════════════════════════════════════════════ */
  'Chargez d’abord les transactions, dans l’onglet Transactions.':
    'Load the transactions first, in the Transactions tab.',
  'Commandes ': 'Orders ',
  'non annulées · ': 'not cancelled · ',
  'non annulées ·': 'not cancelled ·',
  'Transactions Square': 'Square transactions',
  ' remb.': ' ref.',
  'Écart': 'Gap',
  'Équilibré': 'Balanced',
  'Vérification requise': 'Needs checking',
  'Comparaison système et Square — ': 'System and Square compared — ',
  'Comparaison système et Square —': 'System and Square compared —',
  'Source': 'Source',
  'Remboursements': 'Refunds',
  'Net': 'Net',
  'Nb': 'Count',
  'Source Brut Remboursements': 'Source Gross Refunds',
  'Frais Square Net Nb': 'Square fees Net Count',
  'Système ': 'System ',
  'Square (données réelles)': 'Square (real data)',
  /* ⚠⚠ LES CAUSES POSSIBLES D UN ECART : sans elles, on croit a une perte. */
  'Réconciliation équilibrée': 'Reconciliation balanced',
  ' — les montants de Square et ceux du système correspondent (écart de moins d’un dollar).':
    ' — the Square amounts and the system amounts match (gap under one dollar).',
  'Réconciliation équilibrée — les montants de Square et ceux du système correspondent (écart de moins d’un dollar).':
    'Reconciliation balanced — the Square amounts and the system amounts match (gap under one dollar).',
  'Écart de ': 'Gap of ',
  'Écart de': 'Gap of',
  ' — causes possibles : ': ' — possible causes: ',
  '— causes possibles :': '— possible causes:',
  'transactions faites hors du système, remboursements partiels, paiements par carte-cadeau, ':
    'transactions made outside the system, partial refunds, gift-card payments, ',
  'transactions faites hors du système, remboursements partiels, paiements par carte-cadeau,':
    'transactions made outside the system, partial refunds, gift-card payments,',
  'ou commandes réglées par un autre moyen.': 'or orders settled another way.',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  ' entrées masquées.': ' entries hidden.',
  ' entrée masquée.': ' entry hidden.',
  'entrées masquées.': 'entries hidden.',
  'entrée masquée.': 'entry hidden.',
  ' entrées de nouveau visibles.': ' entries visible again.',
  ' entrée de nouveau visible.': ' entry visible again.',
  'entrées de nouveau visibles.': 'entries visible again.',
  'entrée de nouveau visible.': 'entry visible again.',
  ' paiements': ' payments',
  ' paiement': ' payment',
  ' remboursements': ' refunds',
  ' remboursement': ' refund',
  ' et ': ' and ',
  ' relus chez Square.': ' read again from Square.',
  'relus chez Square.': 'read again from Square.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Total': 'Total',
  'Système': 'System'
};
