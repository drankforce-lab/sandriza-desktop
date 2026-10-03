'use strict';

/*
 * RAPPELS — les deux langues (2026-10-02)
 * =============================================================================
 * ⚠ Les FRÉQUENCES, les MODULES et les RAPPELS PROPOSÉS ne sont pas ici : ils
 * arrivent du site avec les données et se traduisent à l'affichage par `szTd`
 * (src/vocabulaire-site.js). Ce qui repart au site est toujours la CLÉ.
 * ⚠ Les notifications de bureau ont leur propre dictionnaire
 * (`rappelsnotif.js`) : elles sont bâties dans le processus principal.
 * ⚠ AUCUNE APOSTROPHE DROITE dans une valeur : chaque phrase est posée dans une
 * chaîne entre apostrophes du script de la page.
 */

module.exports = {
  'Rappels — Administration Sandriza': 'Reminders — Sandriza Administration',
  'Rappels': 'Reminders',
  'Rappels indisponibles': 'Reminders unavailable',
  'Votre rôle ne permet pas de modifier les rappels.': 'Your role does not allow changing reminders.',
  'Le module des rappels n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).':
    'The reminders module is not loaded in the main window. Reload it (Ctrl+R).',
  'Donnez un titre au rappel.': 'Give the reminder a title.',
  'Choisissez la date de la prochaine échéance.': 'Choose the next due date.',
  'Ce rappel n’existe plus — il a peut-être été retiré depuis un autre poste. La liste a été relue.':
    'This reminder no longer exists — it may have been removed from another workstation. The list was reloaded.',
  'Ce rappel proposé est déjà dans votre liste.': 'This suggested reminder is already in your list.',
  'Le nuage a refusé l’écriture : elle n’existe que sur ce poste et sera perdue ailleurs. Vérifiez la connexion, puis refaites le geste.':
    'The cloud refused the write: it exists only on this workstation and will be lost elsewhere. Check the connection, then try again.',
  'La nouvelle date doit tomber après aujourd’hui.': 'The new date must be after today.',
  'fait le': 'done on',
  'terminé': 'finished',
  'en retard de': 'overdue by',
  'jour': 'day',
  'jours': 'days',
  'aujourd’hui': 'today',
  'demain': 'tomorrow',
  'dans': 'in',
  'Aujourd’hui :': 'Today:',
  'Une notification de bureau par rappel dû, une fois par jour ; un clic ouvre le module du rappel.':
    'One desktop notification per due reminder, once a day; a click opens the reminder’s module.',
  'Notifications de bureau': 'Desktop notifications',
  '+ Nouveau rappel': '+ New reminder',
  'En retard': 'Overdue',
  'échéance passée': 'past due',
  'Aujourd’hui': 'Today',
  'à faire dans la journée': 'to do today',
  'Cette semaine': 'This week',
  'dans les 7 prochains jours': 'in the next 7 days',
  'Actifs': 'Active',
  'rappels en service': 'reminders in use',
  'À venir': 'Upcoming',
  'Terminés': 'Finished',
  'Page': 'Page',
  'Afficher': 'Show',
  'Replier': 'Collapse',
  'Double-cliquez pour modifier': 'Double-click to edit',
  'courriel': 'email',
  'Fait : le rappel passe à sa prochaine échéance.': 'Done: the reminder moves to its next due date.',
  'Fait': 'Done',
  'Reporter': 'Postpone',
  'Ouvrir': 'Open',
  'Supprimer ce rappel': 'Delete this reminder',
  'Reporter de': 'Postpone by',
  '+1 jour': '+1 day',
  '+3 jours': '+3 days',
  '+7 jours': '+7 days',
  'ou au': 'or to',
  'Aucun rappel pour l’instant': 'No reminders yet',
  'Un rappel revient à la date voulue, dit ce qu’il faut faire et ouvre le bon module : saisir les dépenses de la semaine, remettre la TPS/TVQ, payer un acompte… Commencez par les rappels proposés, ajustables ensuite.':
    'A reminder comes back on the chosen date, says what to do and opens the right module: enter the week’s expenses, remit GST/QST, pay an instalment… Start with the suggested reminders; you can adjust them afterwards.',
  'Ajouter les': 'Add the',
  'rappels proposés': 'suggested reminders',
  '+ Créer mon propre rappel': '+ Create my own reminder',
  'Mes rappels': 'My reminders',
  'rappel': 'reminder',
  'rappels': 'reminders',
  'Rappels proposés': 'Suggested reminders',
  'prochaine :': 'next:',
  'déjà ajouté': 'already added',
  'Ajouter': 'Add',
  'Dates de l’ARC et de Revenu Québec pour un travailleur autonome qui remet ses taxes au trimestre. Chaque rappel ajouté se modifie ensuite.':
    'CRA and Revenu Québec dates for a self-employed person who remits taxes quarterly. Each added reminder can be edited afterwards.',
  'Modifier le rappel': 'Edit the reminder',
  'Nouveau rappel': 'New reminder',
  'Titre (obligatoire)': 'Title (required)',
  'Ex. : Saisir les reçus d’essence': 'E.g.: Enter the fuel receipts',
  'Note (facultative)': 'Note (optional)',
  'Ce qu’il faut faire, où trouver les pièces…': 'What to do, where to find the documents…',
  'Fréquence': 'Frequency',
  'Prochaine échéance': 'Next due date',
  'Jour du mois': 'Day of the month',
  'Gardé d’une échéance à l’autre : un rappel du 31 tombe le 30 en avril, puis revient au 31.':
    'Kept from one due date to the next: a reminder on the 31st falls on the 30th in April, then returns to the 31st.',
  'Module à ouvrir': 'Module to open',
  'M’envoyer aussi un courriel': 'Also send me an email',
  'Le courriel part avec la tâche quotidienne du serveur (cron-rappels.php) : elle doit être activée chez l’hébergeur. La notification de bureau, elle, ne demande rien.':
    'The email is sent by the server’s daily task (cron-rappels.php): it must be enabled at the host. The desktop notification needs nothing.',
  'Actif (décoché : le rappel est terminé)': 'Active (unchecked: the reminder is finished)',
  'Reporté au': 'Postponed to',
  'Fait pour l’échéance du': 'Done for the due date of',
  '+ Créer le rappel': '+ Create the reminder',
  'Lecture seule.': 'Read-only.',
  'Votre rôle permet de consulter les rappels, pas de les modifier.': 'Your role lets you view reminders, not change them.',
  'rappel à faire': 'reminder due',
  'rappels à faire': 'reminders due',
  'Rien à faire aujourd’hui': 'Nothing due today',
  'Rappel enregistré.': 'Reminder saved.',
  'Rappel créé.': 'Reminder created.',
  'C’est fait : le rappel est terminé.': 'Done: the reminder is finished.',
  'C’est fait : le rappel revient à sa prochaine échéance.': 'Done: the reminder comes back on its next due date.',
  'Rappel reporté.': 'Reminder postponed.',
  'Ajout des rappels proposés…': 'Adding the suggested reminders…',
  'rappel ajouté.': 'reminder added.',
  'rappels ajoutés.': 'reminders added.',
  'Choisissez une date, ou un des délais proposés.': 'Choose a date, or one of the suggested delays.',
  'Ouverture du module…': 'Opening the module…',
  'Rappel supprimé.': 'Reminder deleted.',
  'Rappel ajouté à votre liste.': 'Reminder added to your list.',
  'Notifications de rappels activées.': 'Reminder notifications turned on.',
  'Notifications de rappels coupées.': 'Reminder notifications turned off.',
};
