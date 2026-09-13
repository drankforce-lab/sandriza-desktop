'use strict';

/*
 * CONFIGURATION DES RESEAUX SOCIAUX — les deux langues
 * =============================================================================
 * ⚠⚠⚠ UN CHAMP DE JETON VIDE VEUT DIRE « ON CONSERVE », PAS « ON EFFACE ».
 * Enregistrer un champ vide retirerait le jeton en place sans que personne l ait
 * demande — et la publication s arreterait EN SILENCE. Deux phrases portent
 * cela : le texte d attente du champ (« laisser vide = jeton conservé ») et le
 * refus (« Champ vide : le jeton en place est conservé. »). Les affaiblir remet
 * la panne silencieuse en place. Pour retirer un jeton, on DESACTIVE le reseau.
 *
 * ⚠⚠ LE JETON EST UN SECRET : il ne revient jamais a l ecran. « Jeton en place »
 * et « Aucun jeton » sont la SEULE facon de savoir lequel des deux etats on a
 * sous les yeux.
 *
 * ⚠⚠ TROIS PANNES DIFFERENTES, TROIS GESTES : le renseignement est invalide (on
 * corrige), le reseau a REFUSE (le jeton est mauvais ou expire), le reseau est
 * INJOIGNABLE (on reessaie plus tard). Les confondre fait recoller un jeton
 * parfaitement bon.
 *
 * ⚠ LA PUBLICATION AUTOMATIQUE EST UNE FOIS PAR JOUR ; decochee, la file ATTEND
 * — elle ne se vide pas, elle attend une publication manuelle. La phrase le dit.
 *
 * ⚠ Le nom d un reseau, son texte d aide et l etiquette de son identifiant
 * VIENNENT DU COEUR : ils ne sont pas ecrits dans cette fenetre.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Configuration des réseaux sociaux — Administration Sandriza':
    'Social networks configuration — Sandriza Administration',
  'Configuration des réseaux sociaux': 'Social networks configuration',
  'Lecture seule : vous pouvez consulter ces réglages, pas les modifier.':
    'Read only: you can look at these settings, not change them.',

  /* ══ LES MOTIFS DE REFUS ═══════════════════════════════════════════════════
   * ⚠⚠ Voir l en-tete : refus du reseau et reseau injoignable ne sont pas la
   * meme panne. */
  'Votre rôle ne donne pas accès aux réseaux sociaux.':
    'Your role does not give access to the social networks.',
  'Renseignement manquant ou invalide.': 'Missing or invalid entry.',
  'Le réseau a refusé la connexion.': 'The network refused the connection.',
  'Le réseau social est injoignable.': 'The social network cannot be reached.',
  /* ⚠ L apostrophe DROITE : la source ecrit celle-la entre guillemets. */
  "La fenêtre principale n'a pas répondu à temps.":
    'The main window did not answer in time.',

  /* ══ LA PUBLICATION AUTOMATIQUE ════════════════════════════════════════════
   * ⚠ Decochee, la file ATTEND — elle ne se vide pas. */
  '<b>Publier automatiquement la file, une fois par jour</b> — décoché, la file attend une publication manuelle.':
    '<b>Publish the queue automatically, once a day</b> — unticked, the queue waits for a manual publication.',
  'Publier automatiquement la file, une fois par jour — décoché, la file attend une publication manuelle.':
    'Publish the queue automatically, once a day — unticked, the queue waits for a manual publication.',
  'Publication automatique enregistrée.': 'Automatic publishing saved.',

  /* ══ UN RESEAU ═════════════════════════════════════════════════════════════
   * ⚠⚠ Le jeton ne revient jamais : ces deux pastilles sont tout ce qu on a. */
  'Jeton en place': 'Token in place',
  'Aucun jeton': 'No token',
  'Activer': 'Turn on',
  'Jeton d’accès': 'Access token',
  /* ⚠⚠⚠ VIDE = ON CONSERVE. Voir l en-tete. */
  'laisser vide = jeton conservé': 'leave empty = token kept',
  'coller le jeton ici': 'paste the token here',
  'identifiant numérique': 'numeric identifier',
  ' Tester la connexion': ' Test the connection',
  '🔗 Tester la connexion': '🔗 Test the connection',
  'Tester la connexion': 'Test the connection',
  '⏳ Test…': '⏳ Testing…',
  'Interrogation du réseau…': 'Asking the network…',

  /* ══ LES VERDICTS ══════════════════════════════════════════════════════════ */
  'Réseau mis à jour.': 'Network updated.',
  'Jeton enregistré.': 'Token saved.',
  'Identifiant enregistré.': 'Identifier saved.',
  /* ⚠⚠⚠ CE QUI EMPECHE D EFFACER UN JETON SANS LE VOULOIR. */
  'Champ vide : le jeton en place est conservé.':
    'Empty field: the token in place is kept.',
  'Connecté — ': 'Connected — ',
  'Connecté —': 'Connected —',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:'
};
