'use strict';

/*
 * COMPTE DE PAIEMENT — les deux langues (#118)
 * =============================================================================
 * ⚠⚠ « Solde » SE TRADUIT PAR « Balance », ET « Balance » NE SE TRADUIT PAS PAR
 * « Balance ». C est le faux ami releve au livre de comptes (#128) : en anglais
 * comptable, << balance >> veut dire un SOLDE, et la balance des comptes se dit
 * << trial balance >>. Ici il n y a que des soldes, donc << balance >> partout —
 * mais la regle doit rester ecrite, parce que c est en la croyant evidente qu on
 * se trompe.
 *
 * ⚠ « Frais retenus » = les frais de traitement qu on NE REND PAS lors d un
 * remboursement. « Retained », pas « withheld » : rien n est retenu a quelqu un,
 * c est une somme qui reste acquise.
 *
 * ⚠ « Dépôt à la banque » = le versement du processeur vers le compte bancaire.
 * << Deposit >> et non << payout >> : le mot doit dire ce que la personne voit
 * sur son releve bancaire, pas le mot du fournisseur.
 *
 * ⚠ Les REFERENCES, les codes et les mois (2026-03) sont des DONNEES : ils ne
 * passent pas par ici.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Compte de paiement — Administration Sandriza': 'Payment account — Sandriza Administration',
  'Compte de paiement': 'Payment account',
  'Année du compte': 'Account year',
  'Chargement en cours': 'Loading',
  'Chargement…': 'Loading…',
  'Imprimer le relevé': 'Print the statement',
  '⧉ Détacher': '⧉ Detach',
  'Ouvrir cet écran dans sa propre fenêtre': 'Open this screen in its own window',
  '⚓ Ancrer': '⚓ Dock',
  'Ramener cet écran dans la fenêtre principale': 'Bring this screen back into the main window',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.':
    'No session open in the application. Sign in from the main window.',
  'Votre rôle ne donne pas accès aux paiements.': 'Your role does not give access to payments.',
  'Le compte de paiement n’est pas prêt dans la fenêtre principale.':
    'The payment account is not ready in the main window.',
  'La fenêtre principale ne répond pas.': 'The main window is not responding.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not answer in time.',
  'Cette version de l’application ne connaît pas cette opération.':
    'This version of the application does not know this operation.',
  'L’opération a échoué.': 'The operation failed.',
  'Erreur inattendue (': 'Unexpected error (',

  /* ── LES CINQ NATURES DE MOUVEMENT ──────────────────────────────────────── */
  'Vente': 'Sale',
  'Frais de traitement': 'Processing fee',
  'Remboursement': 'Refund',
  'Frais retenus': 'Fees retained',
  'Dépôt à la banque': 'Deposit to bank',

  /* ── LES AVIS, ET C EST LA QUE L ECRAN DIT LA VERITE SUR LUI-MEME ───────── */
  'Aucun dépôt n’est enregistré pour cette année. Les dépôts se saisissent à la Conciliation bancaire — tant qu’ils manquent, le solde ci-dessous compte comme détenu par le processeur de l’argent qui est peut-être déjà à la banque.':
    'No deposit is recorded for this year. Deposits are entered in Bank reconciliation — until they are, the balance below counts as held by the processor money that may already be in the bank.',
  'Le solde du fil et le total par nature ne concordent pas — écart de ':
    'The running balance and the totals by type do not agree — difference of ',
  '. Un mouvement manque, ou un signe est faux.': '. A movement is missing, or a sign is wrong.',
  'Bac à sable : ces chiffres ne sont pas ceux de la production.':
    'Sandbox: these figures are not the production ones.',
  'Aucune transaction en cache pour cette année. Ouvrez « Paiements Square » et chargez-les — cet écran ne va pas chercher les données lui-même.':
    'No transactions cached for this year. Open “Square payments” and load them — this screen does not fetch the data itself.',

  /* ── LES TUILES ─────────────────────────────────────────────────────────── */
  'Solde chez le processeur': 'Balance held by the processor',
  'Ventes': 'Sales',
  'Remboursements': 'Refunds',
  'Déposé à la banque': 'Deposited to bank',

  /* ── LE FIL ─────────────────────────────────────────────────────────────── */
  'Mouvements': 'Movements',
  'Aucun mouvement pour cette année.': 'No movement for this year.',
  'Du plus ancien au plus récent. Une vente donne deux lignes : le brut entre, les frais sortent.':
    'Oldest first. A sale yields two lines: the gross comes in, the fee goes out.',
  '(date illisible)': '(unreadable date)',
  'Date': 'Date',
  'Nature': 'Type',
  'Référence': 'Reference',
  'Détail': 'Detail',
  'Effet': 'Change',
  'Solde': 'Balance',

  /* ── LES RELEVES PAR MOIS ───────────────────────────────────────────────── */
  'Par mois': 'By month',
  'Mois': 'Month',
  'Frais': 'Fees',
  'Dépôts': 'Deposits',
  'Variation': 'Net change',
};
