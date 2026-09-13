'use strict';

/*
 * MESSAGERIE CLIENTS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LE MESSAGE DE LA CLIENTE ET VOTRE REPONSE SONT DES DONNEES. Le message
 * arrive du site tel qu il a ete ecrit ; la reponse est TAPEE ICI puis ENVOYEE
 * PAR COURRIEL a la cliente. Ni l un ni l autre ne passe par ce dictionnaire :
 * on traduit l etiquette « Votre réponse », jamais la reponse.
 *
 * ⚠⚠ LE VERDICT DISTINGUE DEUX ISSUES, ET C EST TOUT CE QUI LES DISTINGUE : la
 * reponse est TOUJOURS enregistree, mais le courriel peut ne pas etre parti
 * (repli Infolettre). « Réponse envoyée au client. » et « Réponse enregistrée —
 * courriel NON envoyé (vérifiez Infolettre). » doivent rester deux phrases
 * differentes, la seconde aussi inquietante en anglais qu en francais. Les
 * confondre ferait croire qu une cliente a eu sa reponse alors que non.
 *
 * ⚠⚠ CE QUE LA CONSERVATION EFFACE, ET CE QU ELLE N EFFACE JAMAIS : « Les
 * demandes répondues sont supprimées passé ce délai. Les demandes en attente ne
 * le sont jamais. » C est la phrase qui permet de regler le delai sans craindre
 * de perdre la file de travail. Elle est dans une infobulle, elle se lit.
 *
 * ⚠ « Archive » s ecrit pareil dans les deux langues : la cle existe quand meme,
 * parce qu une DECISION doit exister pour chaque texte lu — sans quoi on ne sait
 * pas si le mot a ete regarde ou oublie.
 *
 * ⚠ Le numero de commande, le nom, le courriel et la raison viennent du serveur.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Messagerie clients — Administration Sandriza':
    'Customer messages — Sandriza Administration',
  'Messagerie clients': 'Customer messages',
  'Messagerie indisponible': 'Messages unavailable',
  /* ⚠ Le premier chargement attend la RESYNCHRONISATION du nuage : la phrase
     dit pourquoi c est long, sans quoi on croit a une panne. */
  'Chargement… (les demandes se resynchronisent)':
    'Loading… (the requests are resynchronising)',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès à la messagerie.':
    'Your role does not give access to the messages.',
  'Cette demande n’existe plus.': 'This request no longer exists.',
  'La réponse a échoué.': 'The reply failed.',

  /* ══ LES TROIS PILES ═══════════════════════════════════════════════════════ */
  'En attente': 'Pending',
  /* Le pictogramme est dans son propre <span> : la cle commence apres lui. */
  ' Archive': ' Archive',
  '📁 Archive': '📁 Archive',
  'Aucune demande.': 'No request.',
  'Aucune demande dans cette catégorie.': 'No request in this category.',
  'Raison : ': 'Reason: ',
  'Raison :': 'Reason:',
  'Répondu': 'Answered',
  'Ouvrir la demande': 'Open the request',

  /* ══ LE PANNEAU D UNE DEMANDE ══════════════════════════════════════════════ */
  'Déposée le': 'Submitted on',
  'Répondu le': 'Answered on',
  'Message du client': 'Message from the customer',
  /* ⚠ L etiquette, jamais la reponse : ce qui est tape ici part par courriel. */
  'Votre réponse': 'Your reply',
  'Votre réponse (envoyée par courriel au client)':
    'Your reply (emailed to the customer)',
  'Modifier la réponse (renvoyée par courriel)':
    'Edit the reply (emailed again)',
  'Rédigez votre réponse': 'Write your reply',
  'Rédigez votre réponse…': 'Write your reply…',
  ' Envoyer la réponse': ' Send the reply',
  '📨 Envoyer la réponse': '📨 Send the reply',
  'Confirmer la suppression ?': 'Confirm the deletion?',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Rédigez une réponse d’abord.': 'Write a reply first.',
  'Envoi de la réponse…': 'Sending the reply…',
  /* ⚠⚠ LES DEUX ISSUES. Voir l en-tete : elles ne se confondent pas. */
  'Réponse envoyée au client.': 'Reply sent to the customer.',
  'Réponse enregistrée — courriel NON envoyé (vérifiez Infolettre).':
    'Reply saved — email NOT sent (check Newsletter).',
  'Demande supprimée.': 'Request deleted.',

  /* ══ LA CONSERVATION ═══════════════════════════════════════════════════════ */
  'Réponses conservées': 'Replies kept',
  'mois': 'months',
  'Durée de conservation en mois': 'Retention in months',
  /* ⚠⚠ CE QU ELLE N EFFACE JAMAIS. */
  'Les demandes répondues sont supprimées passé ce délai. Les demandes en attente ne le sont jamais.':
    'Answered requests are deleted past this delay. Pending requests never are.',
  'Conservation enregistrée.': 'Retention saved.',
  'Valeur entre 1 et 120 mois.': 'Value between 1 and 120 months.'
};
