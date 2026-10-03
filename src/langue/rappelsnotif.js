'use strict';

/*
 * LES NOTIFICATIONS DE RAPPELS — les deux langues (2026-10-02)
 * =============================================================================
 * Surface du PROCESSUS PRINCIPAL (src/rappels-notif.js) : aucune fenêtre ne la
 * dessine, c'est donc `banc-langue-processus-principal` qui la garde (préfixe
 * `TR(...)`). Les `{0}` / `{1}` se correspondent des deux côtés.
 */

module.exports = {
  'Dépenses': 'Expenses',
  'Véhicules et déplacements': 'Vehicles and mileage',
  'Fiscalité et impôt': 'Tax',
  'Conciliation bancaire': 'Bank reconciliation',
  'Livre de comptes': 'General ledger',
  'Rapports et budget': 'Reports and budget',
  'Factures': 'Invoices',
  'Inventaire': 'Inventory',
  'Commandes': 'Orders',
  'Rappels': 'Reminders',
  'À faire aujourd’hui': 'Due today',
  'En retard d’un jour': 'One day overdue',
  'En retard de {0} jours': '{0} days overdue',
  'Rappel : {0}': 'Reminder: {0}',
  '{0} — cliquez pour ouvrir {1}': '{0} — click to open {1}',
  '{0} autres rappels à faire': '{0} more reminders due',
  'Cliquez pour ouvrir les Rappels': 'Click to open Reminders',
};
