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
  'Filtrer par photo': 'Filter by photo',
  'Filtrer par photo (nom ou PH-000000)': 'Filter by photo (name or PH-000000)',
  'Cinq cents derniers appels': 'Last five hundred calls',
  'Quand': 'When',
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
  'Aucune clé The New Black : Configuration › Sécurité › Clé et plafond de dépense IA.': 'No The New Black key: Configuration › Security › AI key and spending ceiling.',
  'Solde non lu :': 'Balance not read:',
  'crédits': 'credits',
  'The New Black ne communique pas la date du prochain renouvellement.': 'The New Black does not give the date of the next renewal.',
  'cr.': 'cr.',
  'Dépenses': 'Spending',
  'Le détourage qui suit chaque génération (fal.ai) est compté à part, avec les autres traitements.': 'The cut-out that follows each generation (fal.ai) is counted separately, with the other treatments.',
  'Mouvement': 'Movement',
  'Crédits': 'Credits',
  'Aucune génération The New Black n’a encore été lancée.': 'No The New Black generation has been started yet.',
  'Palier': 'Tier',
  /* ── UN ONGLET PAR FOURNISSEUR, DES SOUS-ONGLETS (2026-10-18) ── */
  'Vue d’ensemble': 'Overview',
  'Résumé': 'Summary',
  'Journal complet': 'Full log',
  'Aperçu': 'Overview',
  'Générations': 'Generations',
  'Mouvements': 'Movements',
  'Vues': 'Views',
  'Mise à plat': 'Flat lay',
  'Aperçu 3D': '3D preview',
  'Vue 360° (The New Black)': '360° view (The New Black)',
  'Gros plan de la fibre': 'Fabric close-up',
  'Gros plan de la fibre (rendu IA)': 'Fabric close-up (AI render)',
  'Tous les fournisseurs': 'All providers',
  'Aucun appel n’a encore été fait.': 'No call has been made yet.',
  'Aucun traitement ces trente derniers jours.': 'No treatment in the last thirty days.',
  'Par fournisseur': 'By provider',
  'depuis le début': 'since the start',
  'Part du coût': 'Share of cost',
  'Solde': 'Balance',
  'Ouvrir l’onglet de ce fournisseur': 'Open this provider’s tab',
  'Coût par traitement': 'Cost per treatment',
  'Appels à Fal.ai': 'Calls to Fal.ai',
  'Solde Fal.ai': 'Fal.ai balance',
  'restants (estimé)': 'left (estimated)',
  'Solde saisi': 'Balance entered',
  'Saisi le': 'Entered on',
  'Consommé depuis': 'Used since',
  'Aucun solde saisi : Configuration › Sécurité › Clé et plafond de dépense IA.': 'No balance entered: Configuration › Security › AI key and spending ceiling.',
  'Fal.ai ne donne pas son solde : c’est le montant saisi moins notre consommation mesurée depuis. Un achat de crédit fait ailleurs ne s’y voit pas.':
    'Fal.ai does not give its balance: this is the amount entered minus our usage measured since. A credit purchase made elsewhere does not show here.',
  'Appels à Photoroom': 'Calls to Photoroom',
  'Crédits Photoroom': 'Photoroom credits',
  'crédits disponibles': 'credits available',
  'Crédits du forfait': 'Plan credits',
  'Prix d’une retouche': 'Price of an edit',
  'Le solde Photoroom n’a pas pu être lu.': 'The Photoroom balance could not be read.',
  'Aperçus gratuits ce mois-ci': 'Free previews this month',
  'Plafond par jour': 'Daily limit',
  'Le compte d’aperçus est tenu par nos journaux : une estimation.': 'The preview count comes from our logs: an estimate.',
  'Versement mensuel du forfait': 'Monthly plan top-up',
  'Crédits offerts par The New Black': 'Credits granted by The New Black',
  'Crédits réservés au lancement': 'Credits reserved at launch',
  'Retenue confirmée à la livraison': 'Hold confirmed on delivery',
  'Crédits rendus': 'Credits returned',
  'Achat de crédits': 'Credit purchase',
  'génération livrée': 'generation delivered',
  'génération échouée': 'generation failed',
  'remboursée': 'refunded',
  'annulée': 'cancelled',
  'expirée': 'expired',
  'vêtement sans mannequin': 'garment without mannequin',
  'forfait mensuel': 'monthly plan',
  'abonnement': 'subscription',
  'renouvellement': 'renewal',
  'Équivalent': 'Equivalent',
  'Prix du crédit': 'Price per credit',
  'Prix par mois': 'Price per month',
  'Crédits par mois': 'Credits per month',
  'Cumul permis': 'Accumulation allowed',
  'Dernier versement': 'Last top-up',
  'Ce mois-ci ({0})': 'This month ({0})',
  'Générations réussies ce mois-ci': 'Successful generations this month',
  'Trente derniers jours (The New Black)': 'Last thirty days (The New Black)',
  'Tarif par palier': 'Price per tier',
  'Aucune génération pour ce filtre.': 'No generation for this filter.',
  'Générations The New Black': 'The New Black generations',
  '{0} plus récentes': '{0} most recent',
  'Registre The New Black': 'The New Black ledger',
  'trente derniers jours': 'last thirty days',
  'Aucun mouvement ces trente derniers jours.': 'No movement in the last thirty days.',
  'Détail': 'Detail',
  /* ── L’aperçu 3D par The New Black (2026-10-18) ── */
  "Aperçu 3D (The New Black)": "3D preview (The New Black)",
};
