'use strict';

/*
 * JOURNAUX — les deux langues
 * =============================================================================
 * ⚠⚠ HUIT JOURNAUX SOUS UN SEUL ECRAN : recherche inter-journaux, acces,
 * automatisations, impressions, SMS, acces aux liens, recherches sans resultat,
 * erreurs des clients. C est l ecran ou l on vient quand quelque chose a mal
 * tourne — donc celui ou une traduction approximative coute le plus de temps a
 * quelqu un qui cherche deja.
 *
 * ⚠⚠⚠ DEUX PHRASES DISENT QU UN GESTE EST SANS RETOUR, et elles doivent le dire
 * aussi nettement en anglais :
 *   · « Cliquez de nouveau pour vider — les compteurs ne se reconstituent pas » ;
 *   · « Confirmer — vider definitivement ».
 * Un journal vide ne se reconstruit pas : c est la seule trace qui existait.
 *
 * ⚠ ET UNE PHRASE EST UNE MISE EN GARDE CONTRE UNE FAUSSE JOIE : « Aucune
 * erreur rapportee. C est la bonne nouvelle — mais elle ne vaut que depuis la
 * mise en place de ce journal. » La raccourcir ferait croire a un passe propre.
 *
 * ⚠ ON NE TRADUIT QUE CE QUI SE LIT : les adresses IP, les noms d imprimante,
 * les codes de pays, les termes cherches et le detail d une entree viennent du
 * journal lui-meme. Les libelles de TYPE, SECT, VIA, CANAUX et EVEN sont des
 * traductions de codes techniques — ce sont bien des libelles, et ils se
 * traduisent.
 */

module.exports = {
  /* ══ L ONGLET « JOURNAL D ENVOI » (venu de sa fenetre propre, 2026-09-13) ══
   * ⚠⚠ CE JOURNAL REPOND A UNE SEULE QUESTION, et elle vaut de l argent :
   * « je n ai jamais recu votre courriel ». Les echecs sont comptes a part et
   * gardent leur message d erreur — un journal qui ne montrerait que les succes
   * ne servirait a rien le jour ou ca rate. La traduction doit garder cette
   * nettete : « Parti » et « Echec » se lisent d un coup d oeil.
   * ⚠ LE DESTINATAIRE, LA REFERENCE ET LE DETAIL rendu par le service ne sont
   * PAS traduits : ce sont des donnees, relues quand quelqu un conteste. */
  'Journal d’envoi': 'Send log',
  'Lecture du journal d’envoi…': 'Reading the send log…',
  'Journal d’envoi indisponible.': 'Send log unavailable.',
  'Envois enregistrés': 'Sends recorded',
  'Partis': 'Sent',
  'Parti': 'Sent',
  'Échecs': 'Failures',
  'Adresse ou campagne': 'Address or campaign',
  'Adresse ou campagne…': 'Address or campaign…',
  'Échecs seulement': 'Failures only',
  'Effacer le journal': 'Clear the log',
  'Rien ne correspond.': 'Nothing matches.',
  'Aucun envoi enregistré.': 'No send recorded.',
  'Genre': 'Kind',
  'Référence': 'Reference',
  'Destinataire': 'Recipient',
  'Résultat': 'Result',
  /* ⚠ LES DEUX FORMES EN ENTIER — voir tools/banc-pluriel-colle.js. */
  'ligne': 'row',
  'lignes': 'rows',
  ' entrée effacée.': ' entry cleared.',
  ' entrées effacées.': ' entries cleared.',
  /* ⚠⚠ LA PHRASE QUI DIT CE QU ON PERD, en entier. Effacer le journal n annule
     aucun envoi — il efface la PREUVE de ce qui est parti. Les deux moities
     comptent, et la seconde rassure autant que la premiere avertit. */
  'Cliquez « Confirmer ? » — le journal est effacé, et avec lui la preuve de ce qui est parti. Les envois eux-mêmes ne sont pas annulés.':
    'Click “Confirm?” — the log is cleared, and with it the proof of what went out. The sends themselves are not cancelled.',

  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Journaux — Administration Sandriza': 'Logs — Sandriza Administration',
  'Journaux': 'Logs',
  'Votre rôle ne donne pas accès aux journaux.': 'Your role does not give access to the logs.',
  'La fenêtre principale n\'a pas répondu à temps.': 'The main window did not answer in time.',
  'Qui tient une fiche en ce moment (ecran a part, en direct)':
    'Who is holding a record right now (separate screen, live)',

  /* ── LES HUIT ONGLETS ───────────────────────────────────────────────────── */
  'Recherche': 'Search',
  'Accès': 'Access',
  'Automatisations': 'Automations',
  'Impressions': 'Printing',
  'Accès aux liens': 'Link access',
  'Sans résultat': 'No result',
  'Erreurs des clients': 'Client errors',

  /* ── LA RECHERCHE INTER-JOURNAUX ────────────────────────────────────────── */
  'Rechercher dans TOUS les journaux (IP, nom, courriel, no de commande, imprimante…)':
    'Search ALL the logs (IP, name, email, order number, printer…)',
  'Rechercher': 'Search',
  '🔎 Rechercher': '🔎 Search',
  'Le terme est cherché dans tous les champs de chaque journal (accès, automatisations, impressions). Minimum 2 caractères.':
    'The term is searched in every field of each log (access, automations, printing). Minimum 2 characters.',
  'Tapez un terme puis « Rechercher ».': 'Type a term then « Search ».',
  'Recherche dans tous les journaux…': 'Searching all the logs…',
  'Accès comptables': 'Accountant access',
  'résultat(s) dans tous les journaux.': 'result(s) across all the logs.',
  'Échec de la recherche.': 'The search failed.',
  'Entrez au moins 2 caractères.': 'Enter at least 2 characters.',
  'Aucun résultat pour «': 'No result for «',
  'Ouvrir cet onglet': 'Open this tab',
  '⬇ Reçu': '⬇ Received',
  '⬆ Envoyé': '⬆ Sent',

  /* ── LE JOURNAL DES ACCES ───────────────────────────────────────────────── */
  '✓ Connexion': '✓ Sign-in',
  '✗ Échec': '✗ Failure',
  '⏻ Déconnexion': '⏻ Sign-out',
  'MFA échoué': 'MFA failed',
  '⏱ MFA expiré': '⏱ MFA expired',
  '⚙ Action': '⚙ Action',
  'Bloqué (géo)': 'Blocked (geo)',
  'Connexions auj.': 'Sign-ins today',
  'Échecs auj.': 'Failures today',
  'Échecs MFA': 'MFA failures',
  'Bloqués géo': 'Geo blocked',
  'IPs uniques': 'Unique IPs',
  ' · conservation 30 jours': ' · kept 30 days',
  'Afficher les stats': 'Show the stats',
  'Masquer les stats': 'Hide the stats',
  'Purger anciens': 'Purge old ones',
  'Exporter CSV': 'Export CSV',
  'Date': 'Date',
  'Type': 'Type',
  'Utilisateur': 'User',
  'Pays': 'Country',
  'Action': 'Action',
  'Date Type Utilisateur IP Pays Action': 'Date Type User IP Country Action',
  'Aucun journal.': 'No log.',
  '‹ Précédent': '‹ Previous',
  'Suivant ›': 'Next ›',

  /* ── LES AUTOMATISATIONS ────────────────────────────────────────────────── */
  'Livraison': 'Delivery',
  'Statistiques': 'Statistics',
  'Marketing': 'Marketing',
  'Mot de passe': 'Password',
  '↩ Retours': '↩ Returns',
  'Réseaux sociaux': 'Social networks',
  'Entretien': 'Maintenance',
  'Application': 'Application',
  'Automatisation': 'Automation',
  'Action / Détail': 'Action / Detail',
  'Date Automatisation Action / Détail': 'Date Automation Action / Detail',
  'Aucune action automatisée.': 'No automated action.',

  /* ── LES IMPRESSIONS ────────────────────────────────────────────────────── */
  'Agent (sans dialogue)': 'Agent (no dialog)',
  'Navigateur': 'Browser',
  'Bluetooth': 'Bluetooth',
  'documents imprimés': 'documents printed',
  'Tous les types': 'All the types',
  'Toutes les voies': 'All the routes',
  'Filtrer par type de document': 'Filter by document type',
  'Filtrer par voie d’impression': 'Filter by printing route',
  'Rétention 30 jours': 'Kept 30 days',
  'Appliquer la purge': 'Apply the purge',
  'Document': 'Document',
  'Qté': 'Qty',
  'Imprimante': 'Printer',
  'Par': 'By',
  'État': 'Status',
  'Date Type Document Qté Imprimante Par État': 'Date Type Document Qty Printer By Status',
  'Imprimé': 'Printed',
  'Échec': 'Failed',
  'Aucune impression ne correspond à ces filtres.': 'No print matches these filters.',
  'Aucune impression depuis 30 jours.': 'No print in the last 30 days.',

  /* ── LES SMS ────────────────────────────────────────────────────────────── */
  'Lecture des SMS…': 'Reading the texts…',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',
  /* ⚠ CETTE PHRASE DIT OU EST LE RESTE : ici on ne fait que LIRE. */
  'ℹ Les SMS reçus et envoyés (Twilio). Leur gestion complète (répondre, marquer lu, supprimer) reste dans Communications → Téléphonie .':
    'ℹ The texts received and sent (Twilio). Managing them fully (reply, mark read, delete) stays in Communications → Telephony .',
  'Les SMS reçus et envoyés (Twilio). Leur gestion complète (répondre, marquer lu, supprimer) reste dans ':
    'The texts received and sent (Twilio). Managing them fully (reply, mark read, delete) stays in ',
  'Communications → Téléphonie': 'Communications → Telephony',
  /* ⚠ Le signe vit dans son <span> : la source n ecrit que le mot. */
  'Actualiser': 'Refresh',
  '🔄 Actualiser': '🔄 Refresh',
  'message(s) 🔄 Actualiser': 'message(s) 🔄 Refresh',
  ' message(s)': ' message(s)',
  ' événement(s)': ' event(s)',
  'événement(s)': 'event(s)',
  'Sens': 'Direction',
  'De': 'From',
  'À': 'To',
  'Message': 'Message',
  'Date Sens De À Message': 'Date Direction From To Message',
  'Aucun SMS.': 'No text message.',

  /* ── LES ACCES AUX LIENS ────────────────────────────────────────────────── */
  'Installation': 'Installation',
  'Comptable': 'Accountant',
  'Courriel': 'Email',
  'Visite': 'Visit',
  'Refusé': 'Refused',
  'Ouvert': 'Opened',
  'Classeur ouvert': 'Workbook opened',
  'Créé': 'Created',
  'Révoqué': 'Revoked',
  'Téléchargé': 'Downloaded',
  'Courriel envoyé': 'Email sent',
  'Lecture du journal des accès…': 'Reading the access log…',
  'Tous les canaux': 'All the channels',
  'Quand': 'When',
  'Canal': 'Channel',
  'Événement': 'Event',
  'Lien': 'Link',
  'Détail': 'Detail',
  'Quand Canal Événement IP Lien Détail': 'When Channel Event IP Link Detail',
  'Aucun événement.': 'No event.',

  /* ── LES RECHERCHES SANS RESULTAT ───────────────────────────────────────── */
  'Terme cherché': 'Term searched',
  'Fois': 'Times',
  'Dernière fois': 'Last time',
  'Terme cherché Fois Dernière fois': 'Term searched Times Last time',
  'Aucune recherche sans résultat.': 'No search without a result.',
  'terme distinct': 'distinct term',
  'termes distincts': 'distinct terms',

  /* ══ LES ERREURS DES CLIENTS — DEUX PHRASES SANS RETOUR ════════════════════
   * ⚠⚠⚠ UN JOURNAL VIDE NE SE RECONSTRUIT PAS. C etait la seule trace, et les
   * compteurs ne se reconstituent pas. Les deux phrases qui le disent portent
   * tout le poids du geste. */
  'défaut distinct': 'distinct fault',
  'défauts distincts': 'distinct faults',
  'Tout marquer comme vu': 'Mark everything as seen',
  'Vider': 'Empty',
  'Confirmer — vider définitivement': 'Confirm — empty permanently',
  'Cliquez de nouveau pour vider — les compteurs ne se reconstituent pas.':
    'Click again to empty — the counters cannot be rebuilt.',
  'Erreur': 'Error',
  'Fichier': 'File',
  'Erreur Fichier Fois': 'Error File Times',
  'Où': 'Where',
  'Où Dernière fois': 'Where Last time',
  'chargement': 'loading',
  '⏳ promesse': '⏳ promise',
  'erreur': 'error',
  /* ⚠ LA MISE EN GARDE CONTRE UNE FAUSSE JOIE : la raccourcir ferait croire a
     un passe propre alors que le journal est simplement recent. */
  'Aucune erreur rapportée.': 'No error reported.',
  'C’est la bonne nouvelle — mais elle ne vaut que depuis la mise en place de ce journal.':
    'That is the good news — but it only holds since this log was put in place.',
  'Marquage…': 'Marking…',
  'erreur(s) marquée(s) comme vue(s).': 'error(s) marked as seen.',
  'Vidage…': 'Emptying…',
  'Journal vidé — ': 'Log emptied — ',
  'Journal vidé —': 'Log emptied —',
  'effacée(s).': 'cleared.',

  /* ── LES VERDICTS PARTAGES ──────────────────────────────────────────────── */
  'Purge…': 'Purging…',
  'Purge faite — ': 'Purge done — ',
  'Purge faite —': 'Purge done —',
  'conservée(s).': 'kept.',
  'Préparation du document…': 'Preparing the document…',
  'Document téléchargé depuis la fenêtre principale.':
    'Document downloaded from the main window.',
  'entrée': 'entry',
  'entrées': 'entries',

  /* ── LES MOTS SEULS (2026-09-13) ───────────────────────────────────────────
     ⚠ « SMS » est le même sigle dans les deux langues. */
  'SMS': 'SMS',
  'Page': 'Page',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  '· conservation 30 jours': '· kept for 30 days'
};
