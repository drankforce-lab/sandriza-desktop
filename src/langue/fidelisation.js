'use strict';

/*
 * FIDELISATION ET SONDAGES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE QU ON ECRIT DANS UN SONDAGE EST LU PAR LA CLIENTELE, EN COURRIEL. Le
 * texte d introduction, le libelle de chaque question, ses choix et le message
 * qui accompagne le code de récompense partent tels quels chez la cliente. Ce
 * sont des DONNEES : ce dictionnaire ne traduit QUE les etiquettes des champs.
 * ⚠ Et leurs EXEMPLES restent FRANCAIS — « Que pensez-vous de votre achat ? »,
 * « Merci ! Voici un code pour votre prochaine commande. » : ce sont des
 * exemples de ce que la CLIENTE lira. Un exemple anglais ferait rediger un
 * sondage anglais pour une clientele francophone. Le NOM du sondage, lui, ne
 * sort pas de l administration : son exemple suit la langue du poste.
 *
 * ⚠⚠ DEUX PHRASES DISENT CE QU ON DETRUIT, avec le chiffre :
 *   · « le sondage et ses N réponses seront détruits, sans retour possible »
 *   · « les invitations partent, les réponses déjà reçues restent »
 * La seconde est la plus facile a perdre en traduisant : elle dit ce qui NE
 * disparait PAS.
 *
 * ⚠ « un sondage vide partirait quand même par courriel » : ce n est pas un
 * avertissement de forme, c est ce qui empeche d envoyer une coquille vide.
 *
 * ⚠ Les declencheurs, les types de question et de recompense viennent du coeur
 * (`FORM.declencheurs`, `typesQuestion`, `typesRecompense`) : leurs valeurs
 * partent dans la base, leurs libelles sont fournis. Ils ne passent pas par ici.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Fidélisation et sondages — Administration Sandriza':
    'Loyalty and surveys — Sandriza Administration',
  'Fidélisation et sondages': 'Loyalty and surveys',
  'Fidélisation indisponible': 'Loyalty unavailable',
  'Chargement… (les réponses se resynchronisent)':
    'Loading… (the answers are resynchronising)',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès à la fidélisation.':
    'Your role does not give access to the loyalty screen.',
  'Cet élément n’existe plus.': 'This item no longer exists.',
  'Adresse courriel invalide.': 'Invalid email address.',
  'Il n’y a aucune invitation à supprimer.': 'There is no invitation to delete.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',
  'Éditeur indisponible : ': 'Editor unavailable: ',
  'Éditeur indisponible :': 'Editor unavailable:',

  /* ── LES TUILES ─────────────────────────────────────────────────────────── */
  'Invitations': 'Invitations',
  'Réponses': 'Answers',
  'taux de ': 'rate of ',
  'Note moyenne': 'Average rating',
  ' évaluations': ' ratings',
  ' évaluation': ' rating',
  'Codes récompense': 'Reward codes',
  ' utilisés': ' used',
  ' utilisé': ' used',

  /* ── LA NOTIFICATION DES COMMENTAIRES ───────────────────────────────────── */
  'Notification des commentaires': 'Comment notification',
  'Quand un client laisse un commentaire, ': 'When a customer leaves a comment, ',
  'Quand un client laisse un commentaire,': 'When a customer leaves a comment,',
  'il vous est transféré à cette adresse. Laissez vide pour ne rien recevoir.':
    'it is forwarded to you at this address. Leave empty to receive nothing.',
  'Courriel de notification des sondages': 'Survey notification email',
  'sondages@exemple.com': 'surveys@example.com',
  'Les commentaires partiront à ': 'The comments will go to ',
  'Les commentaires partiront à': 'The comments will go to',
  'Plus aucune notification de commentaire.': 'No more comment notification.',

  /* ── LA LISTE DES SONDAGES ──────────────────────────────────────────────── */
  'Sondages': 'Surveys',
  'Récompenses': 'Rewards',
  'Aucun sondage configuré.': 'No survey configured.',
  'Créer le premier': 'Create the first one',
  '+ Nouveau sondage': '+ New survey',
  'Nom': 'Name',
  'Déclencheur': 'Trigger',
  'Questions': 'Questions',
  'Taux': 'Rate',
  'Récompense': 'Reward',
  'État': 'Status',
  'Nom Déclencheur Questions': 'Name Trigger Questions',
  'Invitations Réponses Taux': 'Invitations Answers Rate',
  'Récompense État': 'Reward Status',
  'Voir le dépouillement': 'See the results',
  'aucune': 'none',
  'Actif': 'Active',
  'Inactif': 'Inactive',

  /* ── LES CODES DE RECOMPENSE ────────────────────────────────────────────── */
  'Codes de récompense': 'Reward codes',
  'Aucune récompense générée pour l’instant.': 'No reward generated yet.',
  'Code': 'Code',
  'Sondage': 'Survey',
  'Commande': 'Order',
  'Répondu le': 'Answered on',
  'Utilisé': 'Used',
  'Code Sondage Commande': 'Code Survey Order',
  'Répondu le Utilisé': 'Answered on Used',
  'utilisé': 'used',
  'non': 'no',
  'récompense': 'reward',
  'récompenses': 'rewards',

  /* ── LES INVITATIONS ────────────────────────────────────────────────────── */
  'Tout supprimer': 'Delete everything',
  'Aucune invitation.': 'No invitation.',
  /* ⚠ Elles partent SEULES : sans cette phrase, on cherche le bouton d envoi. */
  'Elles partent d’elles-mêmes à la confirmation d’une commande ':
    'They go out on their own when an order is confirmed ',
  'Elles partent d’elles-mêmes à la confirmation d’une commande':
    'They go out on their own when an order is confirmed',
  'ou à son passage en « Livrée ».': 'or when it turns « Delivered ».',
  'Date': 'Date',
  'Destinataire': 'Recipient',
  'Date Sondage Destinataire': 'Date Survey Recipient',
  'Déclencheur État': 'Trigger Status',
  'Répondu': 'Answered',
  'En attente': 'Pending',
  'invitation': 'invitation',
  'invitations': 'invitations',
  /* ⚠⚠ CE QUI PART ET CE QUI RESTE : la seconde moitie de la phrase est celle
     qu on perd en traduisant vite. */
  'Cliquez « Confirmer ? » — les invitations partent, les réponses déjà reçues restent.':
    'Click « Confirm? » — the invitations go, the answers already received stay.',
  ' invitations supprimées.': ' invitations deleted.',
  ' invitation supprimée.': ' invitation deleted.',
  'invitations supprimées.': 'invitations deleted.',
  'invitation supprimée.': 'invitation deleted.',
  'Invitation à ': 'Invitation to ',
  'Invitation à': 'Invitation to',
  'ce client': 'this customer',
  ' supprimée.': ' deleted.',

  /* ══ L EDITEUR D UN SONDAGE ════════════════════════════════════════════════ */
  'Modifier le sondage': 'Edit the survey',
  'Nouveau sondage': 'New survey',
  /* Le nom du sondage ne sort pas de l administration : son exemple suit la
     langue du poste. */
  'Satisfaction après livraison': 'Satisfaction after delivery',
  'Envoyé quand': 'Sent when',
  'Texte d’introduction du courriel': 'Introduction text of the email',
  'Sondage actif': 'Survey active',
  '+ Ajouter une question': '+ Add a question',
  'Aucune question — un sondage vide partirait quand même par courriel.':
    'No question — an empty survey would go out by email all the same.',
  'Question ': 'Question ',
  /* ⚠⚠ CES DEUX EXEMPLES RESTENT FRANCAIS : ce sont des exemples de ce que la
     CLIENTE lira dans le courriel, pas du texte d interface. */
  'Que pensez-vous de votre achat ?': 'Que pensez-vous de votre achat ?',
  'Merci ! Voici un code pour votre prochaine commande.':
    'Merci ! Voici un code pour votre prochaine commande.',
  'Type de la question ': 'Type of question ',
  'Type de la question': 'Type of question',
  'Obligatoire': 'Required',
  'Un choix par ligne': 'One choice per line',
  'Offrir une récompense pour la réponse': 'Offer a reward for the answer',
  'Type': 'Type',
  'Valeur': 'Value',
  'Valide (jours)': 'Valid (days)',
  'Message accompagnant le code': 'Message with the code',
  'Créer le sondage': 'Create the survey',
  'Un sondage': 'A survey',
  'créé': 'created',
  'enregistré': 'saved',
  ' questions.': ' questions.',
  ' question.': ' question.',
  /* ⚠ La saisie perdue : la phrase dit ce qu on risque en fermant. */
  'Cliquez « Annuler » pour fermer — la saisie serait perdue.':
    'Click « Cancel » to close — the entry would be lost.',

  /* ── LE DEPOUILLEMENT ───────────────────────────────────────────────────── */
  'Ce sondage n’a aucune question.': 'This survey has no question.',
  ' réponses': ' answers',
  ' réponse': ' answer',
  ' · moyenne ': ' · average ',

  /* ── LA SUPPRESSION D UN SONDAGE ────────────────────────────────────────── */
  'Cliquez « Confirmer ? » — le sondage et ses ':
    'Click « Confirm? » — the survey and its ',
  'Cliquez « Confirmer ? » — le sondage et ses':
    'Click « Confirm? » — the survey and its',
  ' réponses seront détruits, sans retour possible.':
    ' answers will be destroyed, with no way back.',
  ' réponse seront détruits, sans retour possible.':
    ' answer will be destroyed, with no way back.',
  'réponses seront détruits, sans retour possible.':
    'answers will be destroyed, with no way back.',
  'réponse seront détruits, sans retour possible.':
    'answer will be destroyed, with no way back.',
  'seront détruits, sans retour possible.': 'will be destroyed, with no way back.',
  ' » supprimé avec ses ': ' » deleted with its ',
  '» supprimé avec ses': '» deleted with its',
  ' réponses.': ' answers.',
  ' réponse.': ' answer.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Question': 'Question',
  'Fermer': 'Close',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'taux de': 'rate of'
};
