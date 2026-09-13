'use strict';

/*
 * CONCILIATION BANCAIRE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ UNE CONCILIATION VERROUILLEE NE SE ROUVRE JAMAIS. C est ce qui en fait
 * une piece comptable opposable, et c est aussi ce qui rend deux phrases plus
 * lourdes que tout le reste de l ecran :
 *   · « Le verrouillage est definitif » ;
 *   · « La conciliation ne pourra plus jamais etre modifiee ».
 * Les adoucir en traduisant ferait verrouiller un mois qu on croyait pouvoir
 * corriger le lendemain.
 *
 * ⚠⚠ « COMPLETEE » N EST PAS UNE DECLARATION, C EST UN VERDICT. Le bouton ne
 * l accorde QUE si l ecart est nul ; sinon le statut reste « en cours ». La
 * phrase qui le dit — « Le bouton ne peut donc pas mentir » — explique pourquoi
 * on peut se fier au statut sans recompter. Elle se traduit entiere.
 *
 * ⚠⚠ UNE SORTIE SE SAISIT EN NEGATIF, et c est dit DEUX fois parce que c est la
 * seule chose qui fait tomber l ecart a zero quand elle est appariee. Un signe
 * perdu dans la traduction, et l ecart ne se resout plus sans qu on sache
 * pourquoi.
 *
 * ⚠ ON NE TRADUIT QUE CE QUI SE LIT : le NOM d une conciliation, les
 * DESCRIPTIONS des lignes du releve, les NOTES et les montants sont saisis par
 * la comptabilite et relus par elle — ce sont des donnees. L exemple du champ
 * « Type » (« depot, retrait… ») suit la langue du poste : il ne sort pas de
 * l administration.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Conciliation bancaire — Administration Sandriza':
    'Bank reconciliation — Sandriza Administration',
  'Conciliation bancaire': 'Bank reconciliation',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'La conciliation bancaire est réservée au super-administrateur.':
    'Bank reconciliation is reserved for the super administrator.',
  'Le module de conciliation n’est pas chargé dans la fenêtre principale.':
    'The reconciliation module is not loaded in the main window.',
  'Cette conciliation n’existe plus.': 'This reconciliation no longer exists.',
  /* ⚠ LES DEUX ALTERNATIVES EN ENTIER — voir tools/banc-pluriel-colle.js. */
  'transaction': 'transaction',
  'transactions': 'transactions',
  'conciliation': 'reconciliation',
  'conciliations': 'reconciliations',
  'ligne importée': 'imported row',
  'lignes importées': 'imported rows',
  'Cette conciliation est verrouillée : elle ne peut plus être modifiée.':
    'This reconciliation is locked: it can no longer be changed.',
  'Aucune transaction Square en mémoire pour cette année. Chargez-les d’abord depuis l’écran Paiements.':
    'No Square transaction in memory for this year. Load them first from the Payments screen.',
  'Aucune dépense enregistrée pour cette année.': 'No expense recorded for this year.',

  /* ── LA LISTE DE L ANNEE ────────────────────────────────────────────────── */
  'Année': 'Year',
  '+ Nouvelle conciliation': '+ New reconciliation',
  'Archive de l’année': 'Archive of the year',
  'Recharger': 'Reload',
  'Aucune conciliation pour cette année.': 'No reconciliation for this year.',
  'État': 'Status',
  'Nom': 'Name',
  'Relevé': 'Statement',
  'Dépôts': 'Deposits',
  'Écart': 'Difference',
  /* ⚠ Le mot nu, minuscule, pour la ligne d une paire mal appariee. */
  'écart ': 'difference ',
  'dépense': 'expense',
  'Lignes': 'Lines',
  'Modifié': 'Changed',
  'Rapport': 'Report',
  'État Nom Relevé': 'Status Name Statement',
  'Dépôts Écart Lignes Modifié': 'Deposits Difference Lines Changed',
  'En cours': 'In progress',
  'Ouvert': 'Open',
  'Complétée': 'Completed',
  /* ⚠ La table STATUTS porte le MASCULIN (« Complété », « Verrouillé ») ; les
     phrases de l ecran portent le feminin, parce qu elles parlent de LA
     conciliation. Les deux existent dans la source, les deux sont ici. */
  'Complété': 'Completed',
  'Verrouillé': 'Locked',
  'Verrouillée': 'Locked',
  'Confirmer ?': 'Confirm?',
  'Supprimer': 'Delete',

  /* ── L EN-TETE D UNE CONCILIATION ───────────────────────────────────────── */
  '← Toutes les conciliations': '← All the reconciliations',
  'CSV': 'CSV',
  'verrouillée le': 'locked on',
  '✓ Équilibrée': '✓ Balanced',
  'Écart non résolu': 'Difference not resolved',
  'Relevé bancaire': 'Bank statement',
  'Dépôts et sorties': 'Deposits and withdrawals',

  /* ── LES LIGNES DU RELEVE ───────────────────────────────────────────────── */
  'Lignes du relevé': 'Statement lines',
  '+ Ligne': '+ Line',
  'Aucune ligne. Saisissez le relevé, ou collez-le ligne par ligne.':
    'No line. Enter the statement, or paste it line by line.',
  'Date': 'Date',
  'Description': 'Description',
  'Type': 'Type',
  'Montant': 'Amount',
  'Date Description Type': 'Date Description Type',
  'Montant État': 'Amount Status',
  'Modifier': 'Edit',
  'Retirer': 'Remove',
  'Modifier la ligne': 'Edit the line',
  'Nouvelle ligne du relevé': 'New statement line',
  'Note': 'Note',
  'Enregistrer': 'Save',
  'Annuler': 'Cancel',
  /* ⚠ L EXEMPLE DU CHAMP « Type » ne sort pas de l administration : il suit la
     langue du poste. Ce qu on TAPE, lui, est de la donnee comptable. */
  'dépôt, retrait…': 'deposit, withdrawal…',
  /* ⚠⚠ LE SIGNE NEGATIF EST LA REGLE, PAS UNE PRECISION. Sans lui l ecart ne
     tombe jamais a zero, et rien ne dit pourquoi. La phrase est ecrite deux
     fois dans l ecran, aux deux endroits ou l on saisit. */
  'Une SORTIE se saisit en négatif — c’est ce qui fait que l’écart tombe à zéro quand elle est appariée.':
    'A WITHDRAWAL is entered as a negative — that is what makes the difference fall to zero once it is matched.',
  'Une SORTIE (dépense payée) se saisit en négatif.':
    'A WITHDRAWAL (an expense paid) is entered as a negative.',

  /* ── LES DEPOTS ET SORTIES ──────────────────────────────────────────────── */
  'Dépôts Square et sorties': 'Square deposits and withdrawals',
  'Importer Square': 'Import Square',
  'Importer les dépenses': 'Import the expenses',
  'Square en mémoire pour': 'Square in memory for',
  'Aucun dépôt ni sortie.': 'No deposit or withdrawal.',
  'Arrivée': 'Arrival',
  'Période': 'Period',
  'Arrivée Description Période': 'Arrival Description Period',
  'Nouveau dépôt ou sortie': 'New deposit or withdrawal',
  'Période du': 'Period from',
  'Apparier cette écriture avec un versement': 'Match this entry with a payout',

  /* ── L APPARIEMENT ──────────────────────────────────────────────────────── */
  'Relevé — non appariés (': 'Statement — unmatched (',
  'Toutes les lignes du relevé sont appariées ✓': 'Every statement line is matched ✓',
  '— apparier avec…': '— match with…',
  'Dépôts et sorties — non appariés (': 'Deposits and withdrawals — unmatched (',
  'Tout est apparié ✓': 'Everything is matched ✓',
  'Appariements confirmés (': 'Confirmed matches (',
  '· relevé': '· statement',
  '· dépôt': '· deposit',
  'Une ligne': 'A line',
  'cette ligne du relevé': 'this statement line',
  'ce dépôt ou cette sortie': 'this deposit or withdrawal',
  'Appariement': 'Matching',
  'Résumé': 'Summary',
  'Défaire': 'Undo',
  'Apparié.': 'Matched.',
  'apparié': 'matched',
  'Appariement défait.': 'Match undone.',

  /* ── LE COMPTE DES LIGNES ───────────────────────────────────────────────── */
  'Compte des lignes': 'Line count',
  'Lignes du relevé appariées': 'Statement lines matched',
  'Lignes du relevé seules': 'Statement lines alone',
  'Dépôts et sorties seuls': 'Deposits and withdrawals alone',
  'Ajustements': 'Adjustments',

  /* ── LES NOTES ──────────────────────────────────────────────────────────── */
  'Notes de conciliation': 'Reconciliation notes',
  'Notes du rapprochement': 'Reconciliation notes',
  'Enregistrer les notes': 'Save the notes',
  'Notes enregistrées.': 'Notes saved.',

  /* ══ LE VERROUILLAGE — CE QUI NE SE ROUVRE JAMAIS ═══════════════════════════
   * ⚠⚠⚠ Ces phrases sont la raison pour laquelle on peut se fier a une
   * conciliation sans la recompter. Les adoucir ferait verrouiller un mois
   * qu on croyait pouvoir corriger le lendemain. */
  'Marquer complétée': 'Mark completed',
  'Confirmer le verrouillage ?': 'Confirm the lock?',
  'Verrouiller': 'Lock',
  /* ⚠ LA SOURCE ECRIT UNE ESPACE INSECABLE (`&nbsp;`) AVANT LES DEUX-POINTS ET
     LE POINT-VIRGULE — c est la typographie francaise, et c est la forme que le
     poseur cherche. Sans elle, ma premiere clé ne correspondait pas et la page
     anglaise rendait « Completed n’est accordé que si l’écart est nul » : le mot
     traduit, la phrase restée française. */
  '» n’est accordé que si l’écart est nul&nbsp;: sinon le statut ':
    '» is granted only if the difference is zero&nbsp;: otherwise the status ',
  'reste « en cours ». Le bouton ne peut donc pas mentir.':
    'stays « in progress ». The button therefore cannot lie.',
  'Le verrouillage est définitif.': 'The lock is permanent.',
  'La conciliation ne pourra plus jamais être modifiée — c’est ce qui en fait une pièce':
    'The reconciliation can never be changed again — that is what makes it an',
  'comptable opposable. Elle restera consultable et imprimable.':
    'enforceable accounting record. It stays readable and printable.',
  'L’écart n’est pas nul&nbsp;;': 'The difference is not zero&nbsp;;',
  ' verrouiller le fige tel quel.': ' locking freezes it as is.',
  /* La forme RENDUE, pour le compteur : l espace insecable y devient une espace
     ordinaire, et les morceaux se recollent. */
  '« Complétée » n’est accordé que si l’écart est nul : sinon le statut':
    '« Completed » is granted only if the difference is zero: otherwise the status',
  'L’écart n’est pas nul ; verrouiller le fige tel quel.':
    'The difference is not zero; locking freezes it as is.',
  'Vérification de l’écart…': 'Checking the difference…',
  'Conciliation marquée complétée — l’écart est nul.':
    'Reconciliation marked completed — the difference is zero.',
  'L’écart n’est pas nul : le statut reste « en cours ».':
    'The difference is not zero: the status stays « in progress ».',
  'Cliquez de nouveau pour verrouiller — la conciliation ne pourra plus jamais être modifiée.':
    'Click again to lock — the reconciliation can never be changed again.',
  'Conciliation verrouillée.': 'Reconciliation locked.',

  /* ── LES AUTRES VERDICTS ────────────────────────────────────────────────── */
  'Cliquez « Confirmer ? » pour retirer': 'Click « Confirm? » to remove',
  '. Un appariement lié sera défait.': '. A linked match will be undone.',
  'Ligne retirée.': 'Line removed.',
  'Cliquez « Confirmer ? » pour supprimer cette conciliation. Les transactions bancaires, elles, restent intactes.':
    'Click « Confirm? » to delete this reconciliation. The bank transactions themselves stay untouched.',
  'Conciliation supprimée.': 'Reconciliation deleted.',
  'Conciliation créée.': 'Reconciliation created.',
  /* Le NOM PAR DEFAUT d une conciliation, suivi de la date du jour. C est une
     donnee enregistree, mais qui ne sort pas de la comptabilite : elle suit
     donc la langue du poste, comme le nom interne d un coupon. */
  'Conciliation ': 'Reconciliation ',
  'Ligne enregistrée.': 'Line saved.',
  ' ligne': ' line',
  ' importée': ' imported',
  'Rien de neuf à importer — tout y était déjà.': 'Nothing new to import — it was all there already.',
  'Préparation du document…': 'Preparing the document…',
  'Document préparé dans la fenêtre principale.': 'Document prepared in the main window.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Conciliations': 'Reconciliations',
  'Clore': 'Close out',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  '· lecture seule': '· read-only'
};
