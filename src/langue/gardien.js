'use strict';

/*
 * GARDIEN — les deux langues
 * =============================================================================
 * ⚠⚠ ENREGISTRER LES RÉGLAGES DÉCLENCHE UNE ALERTE. Les phrases d armement le
 * disent (« ✓ Confirmer — une alerte partira », « Cliquez encore : une alerte
 * partira… ») : sans elles, la première alerte reçue après un réglage ferait
 * croire à une attaque.
 *
 * ⚠ DÉVERROUILLER rouvre la connexion d un compte qu on a peut-être volé. La
 * phrase sous le tableau dit de regarder d abord les gestes comptés.
 *
 * ⚠ Les noms, courriels, numéros, identifiants et détails viennent du serveur :
 * ce sont des DONNÉES, jamais traduites.
 * ⚠ Aucune apostrophe droite dans les valeurs : elles vivent entre apostrophes
 * dans le script de la page. Utiliser ’.
 */

module.exports = {
  /* ── LA FENÊTRE ─────────────────────────────────────────────────────────── */
  'Gardien — Administration Sandriza': 'Guard — Sandriza Administration',
  'Gardien': 'Guard',
  'Lecture du gardien…': 'Reading the guard…',
  ' Actualiser': ' Refresh',

  /* ── LES REFUS ──────────────────────────────────────────────────────────── */
  'Aucune session ouverte dans l’application.': 'No session open in the application.',
  'Seul un super-administrateur peut voir et régler le gardien.':
    'Only a super-administrator can see and configure the guard.',
  'Votre propre compte se déverrouille par le lien reçu dans l’alerte.':
    'Your own account is unlocked with the link received in the alert.',
  'L’administration n’est pas encore chargée dans la fenêtre principale.':
    'The administration is not loaded in the main window yet.',
  'La fenêtre principale ne répond pas.': 'The main window is not responding.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not respond in time.',
  'Cette version de l’application ne connaît pas cette opération.':
    'This version of the application does not know this operation.',
  'L’opération a échoué.': 'The operation failed.',
  'Erreur inattendue (': 'Unexpected error (',

  /* ── LE SOUS-TITRE ET LES TUILES ────────────────────────────────────────── */
  'gardien ÉTEINT': 'guard OFF',
  ' compte verrouillé': ' account locked',
  ' comptes verrouillés': ' accounts locked',
  'actif · aucun compte verrouillé': 'on · no account locked',
  'État': 'Status',
  'Actif': 'On',
  'Éteint': 'Off',
  'le serveur compte les gestes lourds': 'the server counts heavy actions',
  'Comptes verrouillés': 'Locked accounts',
  'connexion refusée': 'sign-in refused',
  'Fenêtre': 'Window',
  'durée de comptage': 'counting period',
  'Le gardien est éteint : aucun geste n’est compté, aucun compte ne sera verrouillé, aucune alerte ne partira.':
    'The guard is off: no action is counted, no account will be locked, no alert will be sent.',

  /* ── LES COMPTES VERROUILLÉS ────────────────────────────────────────────── */
  'Comptes verrouillés (': 'Locked accounts (',
  'Aucun compte verrouillé.': 'No locked account.',
  'Compte': 'Account',
  'Depuis': 'Since',
  'Motif': 'Reason',
  ' gestes': ' actions',
  'compte inconnu': 'unknown account',
  'vous': 'you',
  'par le lien de l’alerte': 'through the alert link',
  '✓ Confirmer': '✓ Confirm',
  ' Déverrouiller': ' Unlock',
  'Cliquez encore pour rouvrir ce compte.': 'Click again to reopen this account.',
  'Déverrouillage…': 'Unlocking…',
  'Compte rouvert : il peut se connecter de nouveau.': 'Account reopened: it can sign in again.',
  'Déverrouiller rouvre la connexion de ce compte et remet son compteur à zéro. Vérifiez d’abord, dans l’onglet Activité, que les gestes étaient bien les siens.':
    'Unlocking reopens sign-in for this account and resets its counter. First check, in the Activity tab, that the actions were really its own.',

  /* ── LES ÉVÉNEMENTS ─────────────────────────────────────────────────────── */
  'Derniers gestes comptés (': 'Latest counted actions (',
  'Les 50 plus récents. Les lectures complètes n’y figurent pas : trop nombreuses, elles noieraient le reste.':
    'The 50 most recent. Full reads are not listed: there are too many, they would drown the rest.',
  'Aucun geste compté.': 'No action counted.',
  'Quand': 'When',
  'Catégorie': 'Category',
  'Nombre': 'Count',
  'Détail': 'Detail',
  'Adresse IP': 'IP address',

  /* ── LE JOURNAL INVIOLABLE ──────────────────────────────────────────────── */
  'Journal inviolable (': 'Tamper-proof log (',
  'Les 100 dernières entrées. Écrit par le serveur seul : aucune session, même super-administrateur, ne peut le modifier ni le vider. Une entrée du journal d’accès réécrite ou retirée y laisse une trace.':
    'The 100 latest entries. Written by the server alone: no session, not even a super-administrator, can change or empty it. An access-log entry that is rewritten or removed leaves a trace here.',
  ' modification du journal d’accès dans ces entrées — vérifiez qui l’a faite.':
    ' change to the access log in these entries — check who made it.',
  ' modifications du journal d’accès dans ces entrées — vérifiez qui les a faites.':
    ' changes to the access log in these entries — check who made them.',
  'Aucune entrée pour l’instant.': 'No entry yet.',
  'Action': 'Action',
  'Origine': 'Origin',
  'Serveur': 'Server',
  'Poste': 'Workstation',
  'Entrée réécrite': 'Entry rewritten',
  'Entrée retirée': 'Entry removed',
  'Journal remplacé': 'Log replaced',

  /* ── LA CORBEILLE DU SERVEUR ────────────────────────────────────────────── */
  'Commande': 'Order', 'Facture': 'Invoice', 'Remboursement': 'Refund', 'Crédit en magasin': 'Store credit',
  'Produit': 'Product', 'Client': 'Customer', 'Liste : ': 'List: ',
  'Corbeille du serveur (': 'Server trash (',
  'Ce qui a été supprimé dort ici pendant ': 'What was deleted stays here for ',
  ' jours avant d’être effacé pour de bon. Restaurer remet la fiche telle qu’elle était au moment de la suppression, ou le fichier à son adresse d’origine.':
    ' days before being erased for good. Restoring puts the record back as it was when it was deleted, or the file back at its original address.',
  'Fichier (photo, reçu…)': 'File (photo, receipt…)',
  'La copie de ce fichier n’existe plus dans le stockage : il ne peut pas être remis.':
    'The copy of this file no longer exists in storage: it cannot be put back.',
  'Le stockage a refusé de remettre le fichier. Réessayez dans un moment.':
    'Storage refused to put the file back. Try again in a moment.',
  'Le stockage des fichiers n’est pas configuré sur ce serveur.':
    'File storage is not configured on this server.',
  'La corbeille est vide.': 'The trash is empty.',
  'Supprimé le': 'Deleted on', 'Quoi': 'What', 'Par': 'By',
  'sans libellé': 'no label',
  ' Restaurer': ' Restore',
  'Cliquez encore pour restaurer cette fiche.': 'Click again to restore this record.',
  'Une fiche porte de nouveau cet identifiant : la restaurer l’écraserait. Rien n’a été changé.':
    'A record carries this identifier again: restoring would overwrite it. Nothing was changed.',
  'Cette entrée n’est plus dans la corbeille.': 'This entry is no longer in the trash.',
  'Restauration…': 'Restoring…',
  'Restauré. Rechargez l’écran concerné pour le revoir.': 'Restored. Reload the related screen to see it again.',

  /* ── LE BOUTON PANIQUE ──────────────────────────────────────────────────── */
  /* ⚠ « PANIQUE » reste en français dans la phrase anglaise : c est le mot que
     le serveur exige, et l écran doit dire exactement ce qu il faut taper. */
  'Bouton panique': 'Panic button',
  'En cas d’intrusion : toutes les sessions du personnel sont fermées, sauf celle-ci, et tous les autres comptes sont verrouillés. Personne ne peut se reconnecter tant que vous ne rouvrez pas les comptes ici. Une alerte part par texto et par courriel.':
    'In case of intrusion: closes every staff session except this one and locks every other account. Nobody can sign in again until you reopen the accounts here. An alert is sent by text and email.',
  'Tapez PANIQUE pour armer le bouton': 'Type PANIQUE to arm the button',
  'Activer le bouton panique': 'Press the panic button',
  'Bouton panique : fermeture des sessions…': 'Panic button: closing sessions…',
  'Fait : les autres sessions sont fermées et les comptes verrouillés. Changez les mots de passe avant de rouvrir.':
    'Done: the other sessions are closed and the accounts locked. Change the passwords before reopening.',
  '✓ Confirmer — tout rouvrir': '✓ Confirm — reopen all',
  ' Tout déverrouiller (': ' Unlock all (',
  'Cliquez encore pour rouvrir tous les comptes.': 'Click again to reopen every account.',
  'Tous les comptes sont rouverts.': 'Every account is reopened.',

  /* ── LES CATÉGORIES ─────────────────────────────────────────────────────── */
  'Finances (factures, remboursements, crédits)': 'Finances (invoices, refunds, credits)',
  'Inventaire (produits, stock mis à zéro)': 'Inventory (products, stock set to zero)',
  'Clients': 'Customers',
  'Photos': 'Photos',
  'Listes de configuration': 'Configuration lists',
  'Lectures complètes (alerte seulement)': 'Full reads (alert only)',
  'Finances': 'Finances',
  'Inventaire': 'Inventory',
  'Configuration': 'Configuration',
  'Lectures complètes': 'Full reads',

  /* ── LES RÉGLAGES ───────────────────────────────────────────────────────── */
  'Réglages': 'Settings',
  'Gardien actif': 'Guard on',
  'Fenêtre de comptage (minutes)': 'Counting window (minutes)',
  'Seuils : au-delà, dans la fenêtre, le geste est refusé et le compte verrouillé.':
    'Thresholds: beyond them, within the window, the action is refused and the account locked.',
  'Textos d’alerte (un numéro par ligne, ex. +14185551234)': 'Alert texts (one number per line, e.g. +14185551234)',
  'Courriels d’alerte (un par ligne)': 'Alert emails (one per line)',
  'Le courriel de l’entreprise reçoit aussi chaque alerte.': 'The business email also receives every alert.',
  'Enregistrer les réglages': 'Save settings',
  'Annuler les modifications': 'Discard changes',
  '✓ Confirmer — une alerte partira': '✓ Confirm — an alert will be sent',
  'Chaque enregistrement envoie une alerte aux anciens ET aux nouveaux destinataires : personne ne peut changer les seuils ou les numéros en silence.':
    'Every save sends an alert to the previous AND the new recipients: nobody can change the thresholds or the numbers silently.',
  'Cliquez encore : une alerte partira aux anciens et aux nouveaux destinataires.':
    'Click again: an alert will be sent to the previous and the new recipients.',
  'La fenêtre doit être entre 1 et 1440 minutes.': 'The window must be between 1 and 1440 minutes.',
  'Chaque seuil doit être un nombre entre 1 et 100000 : ': 'Each threshold must be a number between 1 and 100000: ',
  'Numéro invalide (forme +14185551234) : ': 'Invalid number (format +14185551234): ',
  'Courriel invalide : ': 'Invalid email: ',
  'Gardez au moins un destinataire : sans lui, une alerte ne partirait que vers le courriel de l’entreprise.':
    'Keep at least one recipient: without one, an alert would only go to the business email.',
  'Enregistrement…': 'Saving…',
  'Réglages enregistrés — l’alerte de changement est partie.': 'Settings saved — the change alert was sent.',

  /* ── LES ONGLETS (7.9.0) ────────────────────────────────────────────────── */
  'Sections du gardien': 'Guard sections',
  'Tableau de bord': 'Dashboard',
  'Activité': 'Activity',
  'Journal inviolable': 'Tamper-proof log',
  'Corbeille': 'Recycle bin',
  'Modifications des réglages abandonnées.': 'Settings changes discarded.',
  'Gestes comptés': 'Counted actions',
  'fenêtre de ': 'window of ',
  ' jours avant effacement': ' days before deletion',
  'Général': 'General',
  'Seuils': 'Thresholds',
  'Destinataires des alertes': 'Alert recipients'
};
