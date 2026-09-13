'use strict';

/*
 * CHAT EN LIGNE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ L ECHANGE EST UNE DONNEE. Les messages de la visiteuse, son nom, son
 * courriel, son telephone, les commentaires laisses apres une evaluation : tout
 * cela vient du site tel qu il a ete ecrit, et la reponse tapee ici PART A LA
 * VISITEUSE. Rien de tout cela ne passe par ce dictionnaire.
 *
 * ⚠⚠ SUPPRIMER UNE CONVERSATION EMPORTE TOUT L ECHANGE, et c est irreversible.
 * La phrase d armement le dit en toutes lettres ; sans elle on clique deux fois
 * sans savoir ce qu on perd.
 *
 * ⚠⚠ « PREFERE LE TELEPHONE » N EST PAS UN DETAIL D AFFICHAGE : c est la
 * visiteuse qui a demande qu on la rappelle plutot que de lui ecrire. Repondre
 * par le mauvais canal, c est ne pas repondre.
 *
 * ⚠ LA FENETRE NE REGLE RIEN : l assistant, ses reponses automatiques et ses
 * horaires vivent dans Configuration → Communications → Chat en ligne. Le
 * chemin de menu est traduit parce que le MENU l est ; il doit nommer les memes
 * entrees, sinon il envoie dans le vide.
 *
 * ⚠ L etat brut d une conversation (pending / open / closed) s affiche tel quel
 * dans la pastille et dans le verdict « marquée « … » » — c est deja le cas en
 * francais, et la traduction ne change pas ce qui est ECRIT.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Chat en ligne — Administration Sandriza': 'Live chat — Sandriza Administration',
  'Chat en ligne': 'Live chat',
  'Chat indisponible': 'Chat unavailable',
  'Chargement… (les conversations se resynchronisent)':
    'Loading… (the conversations are resynchronising)',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès au chat.': 'Your role does not give access to the chat.',
  'Cette conversation n’existe plus.': 'This conversation no longer exists.',
  'Écrivez une réponse avant de l’envoyer.': 'Write a reply before sending it.',
  'État inconnu.': 'Unknown state.',

  /* ── LA BARRE ───────────────────────────────────────────────────────────── */
  'Conversations': 'Conversations',
  'Satisfaction': 'Satisfaction',
  /* ⚠ Le chemin doit nommer les MEMES entrees que le menu traduit. */
  'Réglages du chat et de l’assistant : ': 'Chat and assistant settings: ',
  'Réglages du chat et de l’assistant :': 'Chat and assistant settings:',
  'Configuration → Communications → Chat en ligne':
    'Configuration → Communications → Live chat',

  /* ── LA FILE ────────────────────────────────────────────────────────────── */
  'Toutes': 'All',
  'En attente': 'Pending',
  'Ouvertes': 'Open',
  'Fermées': 'Closed',
  'Rien ne correspond.': 'Nothing matches.',
  'Aucune conversation à traiter.': 'No conversation to handle.',
  ' en attente': ' pending',
  'rien en attente': 'nothing pending',

  /* ══ LA SATISFACTION ═══════════════════════════════════════════════════════ */
  'Évaluées': 'Rated',
  'Satisfaites': 'Satisfied',
  'Insatisfaites': 'Unsatisfied',
  'Taux': 'Rate',
  'aucune évaluation': 'no rating',
  'des évaluations': 'of the ratings',
  'Commentaires laissés': 'Comments left',
  /* ⚠ Le commentaire lui-meme vient de la visiteuse : il ne se traduit pas. */
  'Aucun commentaire pour l’instant.': 'No comment yet.',

  /* ══ UNE CONVERSATION ══════════════════════════════════════════════════════
   * ⚠⚠ Le canal demande par la visiteuse : deux phrases entieres. */
  ' · préfère le téléphone': ' · prefers the phone',
  ' · préfère le courriel': ' · prefers email',
  '· préfère le téléphone': '· prefers the phone',
  '· préfère le courriel': '· prefers email',
  '· préfère': '· prefers',
  'Nom, courriel, téléphone': 'Name, email, phone',
  'Nom, courriel, téléphone…': 'Name, email, phone…',
  'Ouvrir la conversation': 'Open the conversation',
  'le téléphone': 'the phone',
  'le courriel': 'email',
  ' · ouverte le ': ' · opened on ',
  'hors ligne': 'offline',
  'Aucun message.': 'No message.',
  'vous': 'you',
  'assistant': 'assistant',
  'Votre réponse': 'Your reply',
  'Votre réponse…': 'Your reply…',
  'Envoyer la réponse': 'Send the reply',
  'Changer l’état de la conversation': 'Change the state of the conversation',
  'Changer l’état…': 'Change the state…',
  'Ouverte': 'Open',
  'Fermée': 'Closed',

  /* ══ LES VERDICTS ══════════════════════════════════════════════════════════
   * ⚠ Le nom de la visiteuse precede ou suit : seule la phrase se lit. */
  'Réponse envoyée à ': 'Reply sent to ',
  'Réponse envoyée à': 'Reply sent to',
  'Conversation de ': 'Conversation with ',
  'Conversation de': 'Conversation with',
  ' marquée « ': ' marked « ',
  'marquée «': 'marked «',
  ' supprimée.': ' deleted.',
  /* ⚠⚠ TOUT L ECHANGE SERA PERDU. Voir l en-tete. */
  'Cliquez « Confirmer ? » pour supprimer — tout l’échange sera perdu.':
    'Click « Confirm? » to delete — the whole exchange will be lost.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Fermer': 'Close'
};
