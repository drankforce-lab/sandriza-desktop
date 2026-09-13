'use strict';

/*
 * CLIENTS — les deux langues
 * =============================================================================
 * ⚠⚠ LE NOM, LE COURRIEL, LE NOMBRE DE COMMANDES ET L ACHAT TOTAL SONT DES
 * DONNEES : ils viennent du coeur et designent de vraies personnes. Rien de cela
 * ne passe par ce dictionnaire — seules les etiquettes de colonnes se lisent.
 *
 * ⚠ « Achat total » est le CUMUL de ce que la cliente a depense, pas le montant
 * d une commande. C est ce chiffre qui dit qui compte pour la boutique.
 *
 * ⚠ La fenetre n ECRIT rien : cliquer une ligne ouvre la fiche dans sa propre
 * fenetre, et le verdict le dit.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Clients — Administration Sandriza': 'Customers — Sandriza Administration',
  'Clients': 'Customers',
  'Clients indisponibles': 'Customers unavailable',
  'Votre rôle ne donne pas accès aux clients.':
    'Your role does not give access to the customers.',

  /* ══ LA LISTE ══════════════════════════════════════════════════════════════
   * ⚠ Le nom et le courriel designent de vraies personnes. */
  'Aucun client ne correspond.': 'No customer matches.',
  'Actifs': 'Active',
  'Inactifs': 'Inactive',
  /* ⚠ Un client SUPPRIME reste dans la liste, sous son propre onglet : la
     pastille dit son etat, elle n efface rien. */
  'Supprimés': 'Deleted',
  'Supprimé': 'Deleted',
  'Nom ou courriel': 'Name or email',
  'Nom ou courriel…': 'Name or email…',
  'Ouvrir la fiche client': 'Open the customer record',
  'Nom': 'Name',
  'Courriel': 'Email',
  'Commandes': 'Orders',
  /* ⚠ Le CUMUL de ce qui a ete depense, pas une commande. */
  'Achat total': 'Total spend',
  'Nom Courriel': 'Name Email',
  'Commandes Achat total': 'Orders Total spend',

  /* ── LE VERDICT ─────────────────────────────────────────────────────────── */
  'Fiche client ouverte dans sa fenêtre.':
    'Customer record opened in its own window.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Statut': 'Status',
  'Actif': 'Active',
  'Inactif': 'Inactive',
  'Page': 'Page'
};
