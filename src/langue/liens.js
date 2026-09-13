'use strict';

/*
 * LIENS D’INSTALLATION — les deux langues
 * =============================================================================
 * ⚠⚠⚠ UN MOT DE PASSE QUI NE S AFFICHE QU UNE FOIS. La base n en garde que
 * l empreinte : la phrase « Il ne sera plus jamais affiché » n est pas une
 * politesse, c est la derniere occasion de le noter. L adoucir en traduisant
 * ferait fermer l ecran sans l avoir copie, et le lien serait a refaire.
 *
 * ⚠⚠ DEUX PHRASES DISENT CE QU UN GESTE FAIT VRAIMENT, et elles se distinguent
 * a un mot pres :
 *   · REVOQUER — « le lien cessera aussitot de fonctionner, MEME pour quelqu un
 *     qui l a deja ouvert » ;
 *   · RETIRER DE LA LISTE — « son journal d acces reste consultable ».
 * L un coupe, l autre range. Les confondre en traduisant laisserait croire
 * qu on a coupe un acces alors qu on a seulement fait le menage.
 *
 * ⚠⚠ L AVIS DE LA LOI 25 EST UNE OBLIGATION, PAS UNE NOTE. Il dit combien de
 * temps les adresses IP sont conservees et pourquoi, et que les personnes en
 * sont averties AVANT tout telechargement. Le raccourcir en anglais reviendrait
 * a donner un avis different selon la langue de qui l affiche.
 *
 * ⚠ ON NE TRADUIT QUE CE QUI SE LIT : l etiquette d un lien (« pour qui /
 * pourquoi »), l adresse du destinataire, le lien lui-meme et le mot de passe
 * sont des donnees. L EXEMPLE de l etiquette suit la langue du poste — il ne
 * sort pas de l administration.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Liens d’installation — Administration Sandriza':
    'Install links — Sandriza Administration',
  'Liens d’installation': 'Install links',
  'Liens': 'Links',
  'Journal des accès': 'Access log',
  'Votre rôle ne permet pas de distribuer l’application.':
    'Your role does not allow distributing the application.',

  /* ── LES EVENEMENTS DU JOURNAL ──────────────────────────────────────────── */
  'Page ouverte': 'Page opened',
  'Mot de passe accepté': 'Password accepted',
  'Mot de passe refusé': 'Password refused',
  'Trop de tentatives': 'Too many attempts',
  'Expiré automatiquement': 'Expired automatically',
  'Portail comptable ouvert': 'Accountant portal opened',
  'Portail comptable — mot de passe refusé': 'Accountant portal — password refused',
  'Classeur comptable téléchargé': 'Accounting workbook downloaded',
  'Envoi de courriel refusé': 'Email send refused',

  /* ── LA LISTE DES LIENS ─────────────────────────────────────────────────── */
  '✓ Copié': '✓ Copied',
  'Ctrl+C pour copier': 'Ctrl+C to copy',
  '+ Nouveau lien': '+ New link',
  'Liens émis': 'Links issued',
  'Aucun lien n’a encore été émis.': 'No link has been issued yet.',
  'État': 'Status',
  'Pour': 'For',
  'Compte': 'Account',
  'Usages': 'Uses',
  'Échéance': 'Expiry',
  'Créé': 'Created',
  'État Pour Compte': 'Status For Account',
  'Usages Échéance Créé': 'Uses Expiry Created',
  'Renvoyer': 'Resend',
  '✉ Renvoyer': '✉ Resend',
  'Révoquer': 'Revoke',
  'Retirer': 'Remove',
  /* ⚠ LA PHRASE ENTIERE : « Retirer » seul mordait dans l infobulle et rendait
     « Remove de la liste — le journal de ses accès est conservé ». */
  'Retirer de la liste — le journal de ses accès est conservé':
    'Remove from the list — the log of its accesses is kept',
  'Révoqué le': 'Revoked on',
  /* Les quatre etats d un lien (ETATS) et les evenements du journal. */
  'Actif': 'Active',
  'Révoqué': 'Revoked',
  'Expiré': 'Expired',
  'Épuisé': 'Used up',
  'Téléchargement': 'Download',
  'Refusé': 'Refused',
  'Confirmer ?': 'Confirm?',

  /* ── RENVOYER UN LIEN ───────────────────────────────────────────────────── */
  'Renvoyer ce lien': 'Resend this link',
  'Adresse': 'Address',
  'Ce que contient le courriel': 'What the email contains',
  'Le lien seul': 'The link alone',
  /* ⚠ Le <strong> coupe la phrase : on traduit les morceaux tels que la source
     les ecrit, PLUS la forme rendue pour le compteur. */
  'Le lien ': 'The link ',
  'et un nouveau mot de passe': 'and a new password',
  'Le lien et un nouveau mot de passe': 'The link and a new password',
  'Envoyer': 'Send',
  'Annuler': 'Cancel',
  'Indiquez une adresse de courriel.': 'Enter an email address.',
  'Nouveau mot de passe…': 'New password…',
  'Envoi du courriel…': 'Sending the email…',
  'Courriel envoyé à ': 'Email sent to ',
  'Courriel envoyé à': 'Email sent to',
  ' avec un nouveau mot de passe — l’ancien ne fonctionne plus.':
    ' with a new password — the old one no longer works.',
  'avec un nouveau mot de passe — l’ancien ne fonctionne plus.':
    'with a new password — the old one no longer works.',

  /* ══ LE LIEN FABRIQUE — ET LE MOT DE PASSE QU ON NE REVERRA PAS ════════════
   * ⚠⚠⚠ La base n en garde que l empreinte. C est la derniere occasion de le
   * noter, et la phrase doit le dire aussi nettement en anglais. */
  'Lien fabriqué': 'Link created',
  'Adresse à remettre': 'Address to hand over',
  'Copier': 'Copy',
  '📋 Copier': '📋 Copy',
  'Utilisable une seule fois': 'Usable once only',
  'Utilisable ': 'Usable ',
  ' fois': ' times',
  'Utilisations illimitées': 'Unlimited uses',
  ' · échéance le ': ' · expires on ',
  '· échéance le': '· expires on',
  'Mot de passe d’ouverture': 'Opening password',
  'Copier le mot de passe': 'Copy the password',
  '📋 Copier le mot de passe': '📋 Copy the password',
  'Il ne sera plus jamais affiché': 'It will never be shown again',
  ' — la base n’en garde ': ' — the database only keeps ',
  'que l’empreinte. Notez-le ou envoyez-le maintenant, et de préférence par un autre ':
    'its fingerprint. Note it or send it now, and preferably through a channel ',
  'canal que le lien.': 'other than the link.',
  'Il ne sera plus jamais affiché — la base n’en garde':
    'It will never be shown again — the database only keeps',
  'que l’empreinte. Notez-le ou envoyez-le maintenant, et de préférence par un autre':
    'its fingerprint. Note it or send it now, and preferably through a channel',
  'Envoyer le lien par courriel à': 'Email the link to',
  'Inclure le mot de passe dans ce courriel': 'Include the password in this email',

  /* ── LE FORMULAIRE D UN NOUVEAU LIEN ────────────────────────────────────── */
  'Nouveau lien': 'New link',
  'Pour qui / pourquoi': 'For whom / why',
  /* ⚠ L etiquette ne sort pas de l administration : son exemple suit la langue
     du poste. Ce qu on TAPE, lui, est de la donnee. */
  'ex. Poste de la boutique': 'ex. Shop workstation',
  'Courriel du destinataire': 'Recipient email',
  'facultatif': 'optional',
  'Rattacher à un compte': 'Link to an account',
  'Aucun': 'None',
  'Validité': 'Validity',
  '1 heure': '1 hour',
  '4 heures': '4 hours',
  '24 heures': '24 hours',
  '3 jours': '3 days',
  '7 jours': '7 days',
  '30 jours': '30 days',
  'Utilisations': 'Uses',
  'Une seule fois': 'Once only',
  '2 fois': '2 times',
  '3 fois': '3 times',
  '5 fois': '5 times',
  'Illimitées': 'Unlimited',
  'Une seule fois 2 fois': 'Once only 2 times',
  'Un mot de passe d’ouverture est engendré au hasard&nbsp;: il ne sera ':
    'An opening password is generated at random&nbsp;: it will only be ',
  'affiché qu’une seule fois, juste après la création.':
    'shown once, right after it is created.',
  'Un mot de passe d’ouverture est engendré au hasard : il ne sera':
    'An opening password is generated at random: it will only be',
  'Fabriquer': 'Create',
  /* ⚠ Le libellé du brouillon : c est lui qui s affiche dans « une saisie non
     terminée sur Un lien ». */
  'Un lien': 'A link',

  /* ── LES VERDICTS DE COPIE ET DE FABRICATION ────────────────────────────── */
  'Adresse copiée.': 'Address copied.',
  'Copie refusée par le système.': 'Copy refused by the system.',
  'Fabrication du lien…': 'Creating the link…',
  'Lien fabriqué.': 'Link created.',
  'Révocation…': 'Revoking…',
  ' événement': ' event',
  'événement': 'event',
  /* ⚠ L EXEMPLE D UNE ADRESSE : il ne designe personne, il montre la forme. */
  'personne@exemple.com': 'someone@example.com',

  /* ══ COUPER, OU RANGER — DEUX GESTES QUI NE SE RESSEMBLENT PAS ═════════════
   * ⚠⚠ « Revoquer » coupe l acces MEME pour quelqu un qui a deja ouvert le
   * lien ; « Retirer de la liste » ne fait que ranger, et le journal reste.
   * Les confondre en traduisant laisserait croire qu on a coupe un acces alors
   * qu on a seulement fait le menage. */
  'Cliquez « Confirmer ? » pour révoquer — le lien cessera aussitôt de fonctionner, même pour quelqu’un qui l’a déjà ouvert.':
    'Click « Confirm? » to revoke — the link stops working immediately, even for someone who has already opened it.',
  'Lien révoqué. La révocation est inscrite au journal.':
    'Link revoked. The revocation is written to the log.',
  'Cliquez « Confirmer ? » pour retirer ce lien de la liste.':
    'Click « Confirm? » to remove this link from the list.',
  'Son journal d’accès est conservé.': 'Its access log is kept.',
  'Lien retiré de la liste — son journal d’accès reste consultable.':
    'Link removed from the list — its access log stays readable.',

  /* ── LE JOURNAL ─────────────────────────────────────────────────────────── */
  'Canal': 'Channel',
  'Tous': 'All',
  'Installation': 'Installation',
  'Comptable': 'Accountant',
  'Courriel': 'Email',
  'Lien ': 'Link ',
  'Tout le journal': 'The whole log',
  'Voir ce journal dans le module Journaux': 'See this log in the Logs module',
  'Dans Journaux': 'In Logs',
  '🔎 Dans Journaux': '🔎 In Logs',
  'Recharger': 'Reload',
  'Accès aux liens': 'Link access',
  'Aucun événement pour ce filtre.': 'No event for this filter.',
  'Quand': 'When',
  'Événement': 'Event',
  'Adresse IP': 'IP address',
  'Lien': 'Link',
  'Détail': 'Detail',
  'Quand Canal Événement': 'When Channel Event',
  'Adresse IP Lien Détail': 'IP address Link Detail',
  '‹ Précédent': '‹ Previous',
  'Page': 'Page',
  '‹ Précédent Page': '‹ Previous Page',
  'Suivant ›': 'Next ›',
  'Lecture du journal…': 'Reading the log…',
  'Le journal des accès est dans la fenêtre Journaux.':
    'The access log is in the Logs window.',

  /* ══ L AVIS DE LA LOI 25 — UNE OBLIGATION, PAS UNE NOTE ════════════════════
   * ⚠⚠ Il dit COMBIEN DE TEMPS les adresses IP sont conservees, POURQUOI, et
   * que les personnes en sont averties AVANT tout telechargement. Le raccourcir
   * reviendrait a donner un avis different selon la langue de qui l affiche. */
  'Renseignements personnels.': 'Personal information.',
  ' Les adresses IP consignées ici': ' The IP addresses recorded here',
  'Renseignements personnels. Les adresses IP consignées ici':
    'Personal information. The IP addresses recorded here',
  'sont conservées': 'are kept',
  'jours à des fins de sécurité et de traçabilité': 'days for security and traceability',
  'des accès. Les personnes en sont averties sur la page du lien, avant tout':
    'of access. People are told so on the link page, before any',
  'téléchargement, comme l’exige la Loi 25.': 'download, as Law 25 requires.',

  'Version publiée :': 'Published version:',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Journal': 'Log',
  'Fermer': 'Close',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) — les durées d'un lien. */
  '1 heure 4 heures': '1 hour 4 hours',
  '24 heures 3 jours': '24 hours 3 days',
  '7 jours 30 jours': '7 days 30 days'
};
