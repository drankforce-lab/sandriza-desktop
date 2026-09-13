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
  'saisi le': 'entered on'
};
