'use strict';

/*
 * TRAITEMENTS D IMAGE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ DEUX LIMITES DIFFERENTES SE LISENT SUR CET ECRAN, ET LES CONFONDRE COUTE
 * DE L ARGENT :
 *   · LE SOLDE dit ce qu il reste CHEZ LE FOURNISSEUR (crédits Photoroom lus en
 *     direct ; solde fal.ai saisi à la main, car fal n expose aucun solde).
 *   · LE PLAFOND dit ce que l entreprise s autorise à dépenser CE MOIS-CI.
 * C est la plus basse qui mord la première. Les deux libelles doivent rester
 * aussi distincts en anglais qu en francais.
 *
 * ⚠⚠ UN PLAFOND ACTIF A 0 REFUSE TOUT TRAITEMENT PAYANT, et la phrase le dit
 * deux fois — dans la carte et dans le verdict. Sans elle, on croit a une panne.
 * ⚠⚠ ET SANS PLAFOND, « rien n’arrêtera un lot » : c est la phrase qui explique
 * pourquoi on en pose un.
 *
 * ⚠ LES NOMS DE MODELES (`fal-ai/…`, `photoroom/…`), les codes de photos
 * (PH-000000) et les messages d erreur des fournisseurs sont des DONNEES : ils
 * sont rendus tels quels, et c est voulu — « credit epuise » se regle vite,
 * « echec » tout court n aide personne.
 *
 * ⚠ LE FORMAT DES MONTANTS (« 12,50 $ US ») garde sa virgule decimale francaise
 * dans les deux langues : c est un FORMAT, pas un texte, et il se corrigera
 * partout d un coup avec les dates (tache 91).
 */

module.exports = {
  /* ── LE SOLDE DANS LE RESUME (2026-10-16) ── */
  'Photoroom : {0} crédits': 'Photoroom: {0} credits',
  'Photoroom : solde non lu': 'Photoroom: balance not read',
  'fal.ai : {0} restants': 'fal.ai: {0} left',
  'fal.ai : solde à saisir en Configuration': 'fal.ai: balance to enter in Settings',
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Traitements d’image — Administration Sandriza':
    'Image treatments — Sandriza Administration',
  'Traitements d’image': 'Image treatments',
  'Consommation': 'Usage',
  'Historique': 'History',
  'La lecture a échoué.': 'The read failed.',
  'Dernière actualisation le ': 'Last refreshed on ',
  'Dernière actualisation le': 'Last refreshed on',
  'Actualisation…': 'Refreshing…',

  /* ── LES CINQ TRAITEMENTS ───────────────────────────────────────────────── */
  'Détourage': 'Cutout',
  'Repérage du vêtement': 'Garment detection',
  'Mannequin retiré': 'Mannequin removed',
  'Porté par un mannequin': 'Worn by a model',
  'Essayage virtuel': 'Virtual try-on',

  /* ══ LES CREDITS ET LE SOLDE ═══════════════════════════════════════════════ */
  'Crédits &amp; solde': 'Credits &amp; balance',
  'Crédits solde': 'Credits balance',
  'Crédits Photoroom (réels)': 'Photoroom credits (real)',
  'Crédits Photoroom (réels) —': 'Photoroom credits (real) —',
  'offre ': 'plan ',
  'lus en direct de Photoroom': 'read live from Photoroom',
  'indisponible (clé de production requise)': 'unavailable (production key required)',
  'non lu': 'not read',
  'Aperçus sandbox': 'Sandbox previews',
  'ce mois · estimé · filigrané': 'this month · estimated · watermarked',
  /* ⚠ fal.ai n expose aucun solde : celui-ci est SAISI et DIMINUE tout seul. */
  'Solde fal.ai (restant)': 'fal.ai balance (remaining)',
  'Solde fal.ai (restant) —': 'fal.ai balance (remaining) —',
  'saisi le ': 'entered on ',
  'diminue à chaque traitement': 'goes down with every treatment',
  'à saisir en Configuration': 'to be entered in Configuration',

  /* ══ LE PLAFOND MENSUEL ════════════════════════════════════════════════════ */
  'Plafond mensuel de dépense': 'Monthly spending cap',
  'Appliquer un plafond mensuel': 'Apply a monthly cap',
  'Montant autorisé par mois ($US)': 'Amount allowed per month (US$)',
  ' dépensés sur ': ' spent out of ',
  'dépensés sur': 'spent out of',
  ' pour ': ' for ',
  ' — il reste ': ' — remaining: ',
  '— il reste': '— remaining:',
  /* ⚠⚠ UN PLAFOND A 0 REFUSE TOUT : le <strong> coupe la phrase, la cle le
     porte, et la forme rendue suit. */
  'Plafond actif mais fixé à 0 : <strong>tout traitement ':
    'Cap on but set to 0: <strong>every paid ',
  'Plafond actif mais fixé à 0 : tout traitement':
    'Cap on but set to 0: every paid',
  'payant est refusé</strong>. Posez un montant, ou décochez.':
    'treatment is refused</strong>. Set an amount, or untick.',
  'payant est refusé . Posez un montant, ou décochez.':
    'treatment is refused . Set an amount, or untick.',
  /* ⚠⚠ ET SANS PLAFOND, RIEN N ARRETE UN LOT. */
  ' dépensés ce mois-ci (': ' spent this month (',
  ' dépensés ce mois-ci': ' spent this month',
  '. Aucun plafond n’est appliqué : rien n’arrêtera un lot.': '. No cap is applied: nothing will stop a batch.',
  'dépensés ce mois-ci (': 'spent this month (',
  '). Aucun plafond n’est appliqué : rien n’arrêtera un lot.':
    '). No cap is applied: nothing will stop a batch.',
  'Enregistrer le plafond': 'Save the cap',
  'Un plafond actif à 0 $ refuse tout traitement. Posez un montant, ou décochez.':
    'A cap set to $0 refuses every treatment. Set an amount, or untick.',
  'Plafond enregistré.': 'Cap saved.',

  /* ── LES TUILES DE CONSOMMATION ─────────────────────────────────────────── */
  'Consommation totale': 'Total usage',
  'depuis le début du suivi': 'since tracking began',
  'Appels': 'Calls',
  ' appels': ' calls',
  ' appel': ' call',
  ' réussis · ': ' succeeded · ',
  'réussis ·': 'succeeded ·',
  ' en échec': ' failed',
  'en échec': 'failed',
  'Coût moyen': 'Average cost',
  'par appel': 'per call',

  /* ── LES TRENTE DERNIERS JOURS ──────────────────────────────────────────── */
  'Trente derniers jours': 'Last thirty days',
  'Du ': 'From ',
  ' au ': ' to ',
  ' appel(s) · ': ' call(s) · ',
  '. Survolez une barre pour le détail du jour.':
    '. Hover a bar for the detail of that day.',

  /* ── PAR TRAITEMENT ─────────────────────────────────────────────────────── */
  'Par traitement': 'By treatment',
  'Aucun traitement n’a encore été lancé.': 'No treatment has been started yet.',
  'Traitement': 'Treatment',
  'Modèle': 'Model',
  'Réussis': 'Succeeded',
  'Coût': 'Cost',
  'Unitaire': 'Per unit',
  'Prix': 'Price',
  'Traitement Modèle Appels': 'Treatment Model Calls',
  'Réussis Coût Unitaire': 'Succeeded Cost Per unit',
  /* ⚠ Ce qui distingue un cout MESURE d un cout ESTIME : le premier vient de la
     facture du fournisseur, le second de notre grille. */
  'mesuré': 'measured',
  'partiel': 'partial',
  'estimé': 'estimated',

  /* ── L HISTORIQUE ───────────────────────────────────────────────────────── */
  'Filtrer par service': 'Filter by service',
  'Toutes les opérations': 'All the operations',
  'Filtrer par photo': 'Filter by photo',
  'Filtrer par photo (nom ou PH-000000)': 'Filter by photo (name or PH-000000)',
  'Cinq cents derniers appels': 'Last five hundred calls',
  'Quand': 'When',
  'Opération': 'Operation',
  'Photo': 'Photo',
  'Par': 'By',
  'Durée': 'Duration',
  'État': 'Status',
  'Quand Opération Traitement': 'When Operation Treatment',
  'Photo Par Durée Coût': 'Photo By Duration Cost',
  'Aucun appel pour ce filtre.': 'No call for this filter.',
  'Aperçu gratuit': 'Free preview',
  'réussi': 'succeeded',
  'échec': 'failed',
  'est.': 'est.',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'saisi le': 'entered on',
  /* Accords selon le nombre (2026-09-29) — remplacent les « (s) ». */
  'appel': 'call',
  'appels': 'calls',
  // (2026-10-18) l onglet The New Black
  'Standard (1K)': 'Standard (1K)',
  'Pro (2K)': 'Pro (2K)',
  'Ultra (4K)': 'Ultra (4K)',
  'Forfait': 'Plan',
  'Offerts': 'Granted',
  'Retenue': 'Hold',
  'Règlement': 'Settlement',
  'Remboursement': 'Refund',
  'Achat': 'Purchase',
  'Solde et forfait': 'Balance and plan',
  'Aucune clé The New Black : Configuration › Sécurité › Clé et plafond de dépense IA.': 'No The New Black key: Configuration › Security › AI key and spending ceiling.',
  'Solde non lu :': 'Balance not read:',
  'crédits': 'credits',
  'Forfait {0} : {1} par mois, {2} crédits par mois, cumul de {3} crédits au plus — {4} le crédit.': '{0} plan: {1} a month, {2} credits a month, up to {3} credits accumulated — {4} per credit.',
  'Dernier versement du forfait le {0} ; The New Black ne communique pas la date du prochain.': 'Last plan top-up on {0}; The New Black does not give the date of the next one.',
  'The New Black ne communique pas la date du prochain renouvellement.': 'The New Black does not give the date of the next renewal.',
  'cr.': 'cr.',
  'Dépenses': 'Spending',
  'Ce mois-ci ({0}) : {1} génération(s), {2}.': 'This month ({0}): {1} generation(s), {2}.',
  'Trente derniers jours, selon The New Black : {0} crédit(s), {1}.': 'Last thirty days, according to The New Black: {0} credit(s), {1}.',
  'Le détourage qui suit chaque génération (fal.ai) est compté à part, avec les autres traitements.': 'The cut-out that follows each generation (fal.ai) is counted separately, with the other treatments.',
  'Mouvement': 'Movement',
  'Crédits': 'Credits',
  'Générations récentes': 'Recent generations',
  'Aucune génération The New Black n’a encore été lancée.': 'No The New Black generation has been started yet.',
  'Palier': 'Tier',
};
