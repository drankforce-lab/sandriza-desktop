'use strict';

/*
 * RECHERCHES SANS RESULTAT — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LES REQUETES SONT DES DONNEES : ce sont les mots que les CLIENTES ont
 * tapes dans la boutique, en francais comme en anglais, avec leurs fautes. Rien
 * de tout cela ne passe par ce dictionnaire — c est justement ce qu on vient
 * lire. Traduire une requete effacerait ce qu on cherche a savoir.
 *
 * ⚠⚠ « VIDER LE DÉTAIL » N EFFACE QUE LES 30 DERNIERS JOURS : l archive, elle,
 * reste — et ce qui reviendra sera reenregistre. La phrase d armement dit les
 * trois choses. L affaiblir fait renoncer a vider par crainte de perdre cinq ans
 * d historique, ou vider en croyant tout effacer.
 *
 * ⚠ « Requêtes distinctes » et « Recherches en tout » ne comptent pas la meme
 * chose : la premiere compte des MOTS differents, la seconde compte des FOIS.
 * Cent recherches du meme mot font 1 et 100.
 *
 * ⚠ Une archive vide n est pas une panne : « L’archive se remplira au fil des
 * mois. » le dit.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Recherches sans résultat — Administration Sandriza':
    'Searches with no result — Sandriza Administration',
  'Recherches sans résultat': 'Searches with no result',
  'Recherches indisponibles': 'Searches unavailable',
  'Votre rôle ne donne pas accès à ces statistiques.':
    'Your role does not give access to these statistics.',

  /* ══ LES COMPTEURS ═════════════════════════════════════════════════════════
   * ⚠ Des MOTS differents d un cote, des FOIS de l autre. */
  'Requêtes distinctes': 'Distinct queries',
  'Recherches en tout': 'Searches in all',
  'aucun mois archivé': 'no month archived',
  ' Dans Journaux': ' In Logs',
  '🔎 Dans Journaux': '🔎 In Logs',

  /* ══ LE DETAIL DES 30 JOURS ════════════════════════════════════════════════
   * ⚠ La requete elle-meme est une DONNEE : elle reste telle qu elle a ete
   * tapee par la cliente. */
  'Ce qu’on a cherché sans trouver': 'What was searched for and not found',
  'Rien ne correspond.': 'Nothing matches.',
  'Aucune recherche infructueuse dans les 30 derniers jours.':
    'No fruitless search in the last 30 days.',
  'Recherche': 'Search',
  'Fois': 'Times',
  'Dernière': 'Last',
  'Recherche Fois': 'Search Times',
  'Chercher dans la liste': 'Search in the list',
  'Chercher dans la liste…': 'Search in the list…',
  ' requête': ' query',
  ' requêtes': ' queries',
  'requête': 'query',
  'Voir ce journal dans le module Journaux': 'See this log in the Logs module',
  /* ⚠ Retirer une ligne ne veut pas dire que la recherche a disparu : elle a
     ete TRAITEE, et si elle revient elle sera reenregistree. */
  'Traitée — retirer de la liste': 'Handled — remove from the list',

  /* ══ L ARCHIVE ═════════════════════════════════════════════════════════════ */
  'Ce qui revient le plus': 'What comes back most',
  ' · archive conservée 5 ans · ': ' · archive kept 5 years · ',
  '· archive conservée 5 ans ·': '· archive kept 5 years ·',
  /* ⚠ Une archive vide n est pas une panne. */
  'L’archive se remplira au fil des mois.':
    'The archive will fill up month by month.',

  /* ══ VIDER LE DETAIL ═══════════════════════════════════════════════════════
   * ⚠⚠⚠ L ARCHIVE RESTE. Voir l en-tete. */
  'Vider le détail': 'Clear the detail',
  'Cliquez « Confirmer ? » — seul le détail des 30 jours est effacé ; l’archive reste, et ce qui reviendra sera réenregistré.':
    'Click « Confirm? » — only the 30-day detail is cleared; the archive stays, and whatever comes back will be recorded again.',
  'Cliquez « Confirmer ? » — seul le détail des 30 jours est effacé ; l’archive reste,':
    'Click « Confirm? » — only the 30-day detail is cleared; the archive stays,',
  'et ce qui reviendra sera réenregistré.':
    'and whatever comes back will be recorded again.',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  ' requête effacée du détail.': ' query cleared from the detail.',
  ' requêtes effacées du détail.': ' queries cleared from the detail.',
  'requête effacée du détail.': 'query cleared from the detail.',
  'requêtes effacées du détail.': 'queries cleared from the detail.',
  /* ⚠ La requete precede, entre guillemets : seule la suite se lit. */
  ' » retirée de la liste.': ' » removed from the list.',
  '» retirée de la liste.': '» removed from the list.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Archive': 'Archive',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  '30 derniers jours': 'last 30 days',
  'toutes occurrences': 'all occurrences',
  // La refonte, comme l'Inventaire (2026-09-25).
  'Dans Journaux': 'In Logs',
  // 2026-10-15 : confirmations en boîte à part.
  'Vider le détail des recherches': 'Clear the search detail',
  'Le détail des recherches des 30 derniers jours sera effacé définitivement. L’archive est conservée et les nouvelles recherches continueront d’être enregistrées. Cette action est irréversible.': 'The search detail for the last 30 days will be permanently deleted. The archive is kept and new searches will continue to be recorded. This action cannot be undone.',
  'Requêtes': 'Queries',
  // Gestes groupés (2026-10-29)
  "{0} requête sélectionnée": "{0} query selected",
  "{0} requêtes sélectionnées": "{0} queries selected",
  "Retirer": "Remove",
  "Exporter (CSV)": "Export (CSV)",
  "Requête": "Query",
  "Dernière fois": "Last time",
  "{0} requête exportée": "{0} query exported",
  "{0} requêtes exportées": "{0} queries exported",
  "Retirer les requêtes traitées": "Remove handled queries",
  "{0} requête sera retirée de la liste, comme traitée. L’archive est conservée.": "{0} query will be removed from the list as handled. The archive is kept.",
  "{0} requêtes seront retirées de la liste, comme traitées. L’archive est conservée.": "{0} queries will be removed from the list as handled. The archive is kept.",
  "{0} fois": "{0} times",
  "et {0} autres": "and {0} more",
  "Retirer {0} requête": "Remove {0} query",
  "Retirer {0} requêtes": "Remove {0} queries",
  "Retrait des requêtes": "Removing queries",
  "{0} requête retirée de la liste.": "{0} query removed from the list.",
  "{0} requêtes retirées de la liste.": "{0} queries removed from the list.",
};
