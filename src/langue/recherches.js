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
  '» retirée de la liste.': '» removed from the list.'
};
