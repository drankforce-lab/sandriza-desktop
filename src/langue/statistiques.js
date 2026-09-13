'use strict';

/*
 * STATISTIQUES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CETTE FENETRE DISTINGUE DEUX SORTES DE REFUS, et c est sa regle la plus
 * importante : un refus BLOQUANT (pas configure, pas le droit) efface les
 * chiffres et se montre en pleine page ; un refus PASSAGER laisse les chiffres
 * deja lus a l ecran, avec la raison au-dessus et « Les chiffres affichés sont
 * ceux de <heure> ». Cette derniere phrase est ce qui empeche de prendre de
 * vieux chiffres pour des chiffres frais.
 *
 * ⚠⚠ « Coûts en dollars US, la devise de facturation » : Twilio facture en USD,
 * meme pour une boutique canadienne. Perdre cette precision fausserait une
 * lecture de cout. Et « Solde indisponible » n est PAS « solde nul » — quand le
 * solde prepaye tombe a zero, la ligne cesse de repondre.
 *
 * ⚠⚠ LES CHIFFRES VIENNENT DE GOOGLE ET DE TWILIO : les noms de pays, de villes,
 * de canaux de trafic, les titres de page, les numeros et les statuts d appel
 * sont des DONNEES rendues telles quelles. Google Analytics et Twilio ne se
 * traduisent pas non plus — ce sont des noms de service.
 *
 * ⚠ « Maximum : N pages vues en une journée » : une barre sans echelle ne dit
 * rien, et le mot compte (« pages vues », « appels ») change avec le graphique.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Statistiques — Administration Sandriza': 'Statistics — Sandriza Administration',
  'Statistiques': 'Statistics',
  'Google Analytics': 'Google Analytics',
  'Téléphonie': 'Telephony',
  '7 jours': '7 days',
  '30 jours': '30 days',
  '90 jours': '90 days',
  'lu à ': 'read at ',
  'lu à': 'read at',
  'Lecture…': 'Reading…',
  '↻ Relire': '↻ Read again',
  'Chiffres à jour.': 'Figures up to date.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux statistiques.':
    'Your role does not give access to the statistics.',
  /* ⚠⚠ UN REFUS PASSAGER NE VIDE PAS L ECRAN : les chiffres restent, vieux. */
  'Le service n’a pas répondu à temps. Réessayez : les chiffres affichés sont ceux de la dernière lecture réussie.':
    'The service did not answer in time. Try again: the figures shown are those of the last successful read.',
  'Le suivi Google Analytics est désactivé. Configuration → Statistiques, dans la fenêtre principale.':
    'Google Analytics tracking is turned off. Configuration → Statistics, in the main window.',
  'Aucun identifiant de propriété GA4 n’est renseigné. Configuration → Statistiques.':
    'No GA4 property ID is filled in. Configuration → Statistics.',
  'Aucune clé de compte de service Google n’est enregistrée. Configuration → Statistiques.':
    'No Google service account key is saved. Configuration → Statistics.',
  'La téléphonie est désactivée. Configuration → Téléphonie, dans la fenêtre principale.':
    'Telephony is turned off. Configuration → Telephony, in the main window.',
  'Aucun compte Twilio n’est enregistré. Configuration → Téléphonie.':
    'No Twilio account is saved. Configuration → Telephony.',
  'Le service n’a pas pu être joint.': 'The service could not be reached.',
  'Le service a refusé la demande.': 'The service refused the request.',
  'La lecture a échoué.': 'The read failed.',
  ' Les chiffres affichés sont ceux de ': ' The figures shown are those of ',
  'Les chiffres affichés sont ceux de': 'The figures shown are those of',

  /* ── LE GRAPHIQUE ───────────────────────────────────────────────────────── */
  'Aucune donnée sur la période.': 'No data over the period.',
  'Maximum : ': 'Maximum: ',
  'Maximum :': 'Maximum:',
  ' en une journée': ' in one day',
  'en une journée': 'in one day',
  'pages vues': 'page views',
  'appels': 'calls',

  /* ══ GOOGLE ANALYTICS ══════════════════════════════════════════════════════ */
  'Lecture des statistiques…': 'Reading the statistics…',
  'Visiteurs': 'Visitors',
  'Sessions': 'Sessions',
  'Pages vues': 'Page views',
  'Durée moy. session': 'Avg. session length',
  'Taux de rebond': 'Bounce rate',
  'Pages / session': 'Pages / session',
  'Taux d’engagement': 'Engagement rate',
  ' Pages vues par jour — ': ' Page views per day — ',
  '📈 Pages vues par jour —': '📈 Page views per day —',
  ' Pages populaires': ' Popular pages',
  '🔝 Pages populaires Page': '🔝 Popular pages Page',
  'Page': 'Page',
  'Vues': 'Views',
  /* ⚠ Les NOMS de pays, de villes et de canaux viennent de Google : donnees. */
  'Pays': 'Countries',
  'Villes': 'Cities',
  'Ville': 'City',
  'Appareils': 'Devices',
  'Type': 'Type',
  'Sources de trafic': 'Traffic sources',
  'Canal': 'Channel',
  'Nouveaux / connus': 'New / returning',

  /* ══ TELEPHONIE ════════════════════════════════════════════════════════════ */
  'Lecture des appels…': 'Reading the calls…',
  ' Appels des <strong>': ' Calls of the last <strong>',
  '📞 Appels des': '📞 Calls of the last',
  ' derniers jours</strong>. ': ' days</strong>. ',
  'derniers jours .': 'days .',
  /* ⚠⚠ TWILIO FACTURE EN DOLLARS US, meme au Canada. */
  'Coûts en dollars US, la devise de facturation.':
    'Costs in US dollars, the billing currency.',
  ' Solde restant : <strong>': ' Balance left: <strong>',
  '💰 Solde restant :': '💰 Balance left:',
  /* ⚠ Un solde ABSENT n est pas un solde NUL. */
  'Solde indisponible': 'Balance unavailable',
  'Appels': 'Calls',
  'Entrants': 'Incoming',
  'Répondus': 'Answered',
  'Manqués': 'Missed',
  'Minutes': 'Minutes',
  'Durée moy.': 'Avg. length',
  'Coût total': 'Total cost',
  ' Appels par jour': ' Calls per day',
  '📈 Appels par jour': '📈 Calls per day',
  'Aucun appel.': 'No call.',
  ' Appels récents': ' Recent calls',
  '📋 Appels récents Appelant': '📋 Recent calls Caller',
  'Appelant': 'Caller',
  'Sens': 'Direction',
  'Statut': 'Status',
  'Durée': 'Length',
  'Coût': 'Cost',
  'Sens Statut Durée Coût': 'Direction Status Length Cost',
  'Date': 'Date',

  /* ── LE PIED ────────────────────────────────────────────────────────────── */
  'chiffres demandés à Google et à Twilio': 'figures asked of Google and Twilio'
};
