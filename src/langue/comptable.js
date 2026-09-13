'use strict';

/*
 * LIENS COMPTABLES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LE MOT DE PASSE D OUVERTURE N EST AFFICHE QU UNE FOIS, ET LE SERVEUR N EN
 * GARDE AUCUNE COPIE EN CLAIR. La phrase qui le dit est la seule chose qui
 * empeche de fermer la carte en croyant pouvoir revenir le chercher :
 * « Il ne sera plus jamais affiché — le serveur n’en garde aucune copie en
 * clair, c’est lui qui déchiffre le rapport. Notez-le ou transmettez-le
 * maintenant, de préférence par un AUTRE CANAL que le lien. » Elle se traduit
 * ENTIERE, la recommandation de canal comprise : un mot de passe envoye dans le
 * meme courriel que le lien ne protege plus rien.
 *
 * ⚠⚠ REVOQUER COUPE POUR TOUT LE MONDE, TOUT DE SUITE — et la phrase le dit.
 *
 * ⚠⚠ LE COURRIEL EST LA CLE DU CONTACT : on ne peut pas le changer, on retire et
 * on recree. Sans cette phrase, on tape par-dessus et on croit avoir modifie.
 *
 * ⚠ CE QUI VIENT DES DONNEES NE PASSE PAS PAR ICI : le nom du comptable, son
 * cabinet, son courriel, son telephone, sa note, l adresse du lien, le mot de
 * passe engendre, les annees d exercice.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Liens comptables — Administration Sandriza': 'Accountant links — Sandriza Administration',
  'Liens comptables': 'Accountant links',
  'Exercices partagés': 'Shared fiscal years',
  'Carnet des comptables': 'Accountant address book',
  'Carnet': 'Address book',
  'Recharger': 'Reload',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Seul un super-administrateur peut remettre l’exercice à un comptable.':
    'Only a super administrator can hand the fiscal year to an accountant.',
  'Le carnet est affiché, mais le registre des liens distants n’a pas répondu : ':
    'The address book is shown, but the remote link registry did not answer: ',
  'Le carnet est affiché, mais le registre des liens distants n’a pas répondu :':
    'The address book is shown, but the remote link registry did not answer:',

  /* ── LE COMPTE EN TETE ──────────────────────────────────────────────────── */
  ' liens actifs': ' active links',
  ' lien actif': ' active link',
  ' comptables': ' accountants',
  ' comptable': ' accountant',

  /* ── LES LIENS DE L EXERCICE ────────────────────────────────────────────── */
  '+ Nouveau lien de l’exercice': '+ New link for the fiscal year',
  'Liens de l’exercice en cours': 'Links for the current fiscal year',
  'Aucun exercice n’a encore été partagé.': 'No fiscal year has been shared yet.',
  'État': 'Status',
  'Exercice': 'Fiscal year',
  'Destinataires': 'Recipients',
  'Créé': 'Created',
  'Échéance': 'Expiry',
  'État Exercice Destinataires': 'Status Fiscal year Recipients',
  'Créé Échéance': 'Created Expiry',
  'Expiré': 'Expired',
  'Actif': 'Active',
  'Révoquer': 'Revoke',
  'Confirmer ?': 'Confirm?',

  /* ══ LA CARTE DU LIEN NEUF — LE MOT DE PASSE NE REVIENDRA PAS ══════════════ */
  'Lien de l’exercice ': 'Link for fiscal year ',
  'Lien de l’exercice': 'Link for fiscal year',
  'Adresse à remettre au comptable': 'Address to hand to the accountant',
  '📋 Copier': '📋 Copy',
  'Copier': 'Copy',
  '✓ Copié': '✓ Copied',
  'Échéance le ': 'Expires on ',
  'Échéance le': 'Expires on',
  'Mot de passe d’ouverture': 'Opening password',
  '📋 Copier le mot de passe': '📋 Copy the password',
  'Copier le mot de passe': 'Copy the password',
  /* ⚠⚠⚠ LA PHRASE QUI DIT QU ON NE REVIENDRA PAS LE CHERCHER. Le <strong> coupe
     le debut : la cle porte la balise, et la forme rendue suit. */
  'Il ne sera plus jamais affiché': 'It will never be shown again',
  'Il ne sera plus jamais affiché — le serveur n’en garde':
    'It will never be shown again — the server keeps',
  ' — le serveur n’en garde ': ' — the server keeps ',
  'aucune copie en clair, c’est lui qui déchiffre le rapport. Notez-le ou transmettez-le ':
    'no plain copy of it, it is the one that decrypts the report. Write it down or pass it on ',
  'aucune copie en clair, c’est lui qui déchiffre le rapport. Notez-le ou transmettez-le':
    'no plain copy of it, it is the one that decrypts the report. Write it down or pass it on',
  'maintenant, de préférence par un autre canal que le lien.':
    'now, preferably through a channel other than the link.',
  'Courriel envoyé à : ': 'Email sent to: ',
  'Courriel envoyé à :': 'Email sent to:',
  'Envoi refusé pour : ': 'Sending refused for: ',
  'Envoi refusé pour :': 'Sending refused for:',
  'Fermer': 'Close',

  /* ── LE FORMULAIRE D UN NOUVEAU LIEN ────────────────────────────────────── */
  'Nouveau lien de l’exercice': 'New link for the fiscal year',
  'Validité': 'Validity',
  '24 heures': '24 hours',
  '3 jours': '3 days',
  '7 jours': '7 days',
  '14 jours': '14 days',
  '30 jours': '30 days',
  'Destinataires (dans le carnet)': 'Recipients (from the address book)',
  'Le carnet est vide — ajoutez un comptable dans l’onglet Carnet, ou saisissez ':
    'The address book is empty — add an accountant in the Address book tab, or enter ',
  'Le carnet est vide — ajoutez un comptable dans l’onglet Carnet, ou saisissez':
    'The address book is empty — add an accountant in the Address book tab, or enter',
  'une adresse ci-dessous.': 'an address below.',
  'Ajouter une adresse': 'Add an address',
  'facultatif — comptable@cabinet.com': 'optional — accountant@firm.com',
  'Un mot de passe d’ouverture est engendré au hasard : il ne sera affiché ':
    'An opening password is generated at random: it will be shown ',
  'Un mot de passe d’ouverture est engendré au hasard : il ne sera affiché':
    'An opening password is generated at random: it will be shown',
  'qu’une seule fois, juste après la création. Le lien peut être créé sans destinataire (à ':
    'only once, right after it is created. The link can be created with no recipient (to ',
  'qu’une seule fois, juste après la création. Le lien peut être créé sans destinataire (à':
    'only once, right after it is created. The link can be created with no recipient (to',
  'remettre à la main), ou envoyé par courriel à ceux qui sont choisis.':
    'hand over yourself), or emailed to those who are chosen.',
  'Fabriquer': 'Create',

  /* ── LES VERDICTS DES LIENS ─────────────────────────────────────────────── */
  'Adresse copiée.': 'Address copied.',
  'Copie refusée par le système.': 'Copy refused by the system.',
  'Fabrication du lien de l’exercice…': 'Building the link for the fiscal year…',
  'Lien fabriqué.': 'Link built.',
  'Certains courriels ont été refusés.': 'Some emails were refused.',
  /* ⚠⚠ REVOQUER COUPE POUR TOUT LE MONDE, TOUT DE SUITE. */
  'Cliquez « Confirmer ? » pour révoquer — le lien cessera aussitôt de fonctionner pour tous les destinataires.':
    'Click « Confirm? » to revoke — the link will stop working at once for every recipient.',
  'Révocation…': 'Revoking…',
  'Lien révoqué.': 'Link revoked.',

  /* ══ LE CARNET DES COMPTABLES ══════════════════════════════════════════════ */
  '+ Ajouter un comptable': '+ Add an accountant',
  'Le carnet est vide.': 'The address book is empty.',
  'Nom': 'Name',
  'Cabinet': 'Firm',
  'Courriel': 'Email',
  'Téléphone': 'Phone',
  'Note': 'Note',
  'Nom Cabinet Courriel': 'Name Firm Email',
  'Téléphone Note': 'Phone Note',
  'Retirer': 'Remove',
  'Modifier le comptable': 'Edit the accountant',
  'Nouveau comptable': 'New accountant',
  /* ⚠⚠ ON NE CHANGE PAS UN COURRIEL, ON RECREE LA FICHE. */
  'Le courriel est la clé du contact : pour le changer, retirez ':
    'The email is the key of the contact: to change it, remove ',
  'Le courriel est la clé du contact : pour le changer, retirez':
    'The email is the key of the contact: to change it, remove',
  'ce contact et créez-en un nouveau.': 'this contact and create a new one.',
  'Une fiche de comptable': 'An accountant record',
  'Indiquez un courriel — c’est la clé du contact.':
    'Give an email — it is the key of the contact.',
  'Comptable enregistré.': 'Accountant saved.',
  'Retrait…': 'Removing…',
  'Cliquez « Confirmer ? » pour retirer ce comptable du carnet.':
    'Click « Confirm? » to remove this accountant from the address book.',
  'Comptable retiré du carnet.': 'Accountant removed from the address book.',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) — les durées d'un accès. */
  '24 heures 3 jours': '24 hours 3 days',
  '7 jours 14 jours': '7 days 14 days'
};
