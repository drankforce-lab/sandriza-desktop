'use strict';

/*
 * FICHE FOURNISSEUR — les deux langues
 * =============================================================================
 * ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT. Le NOM du fournisseur, son adresse, ses
 * notes et ses categories choisies sont de la DONNEE : ils restent tels qu ils
 * ont ete saisis. Les valeurs des categories (`robes`, `hauts`) et les delais
 * (`1-2 semaines`) partent dans la base — `banc-langue-donnees` refuserait de
 * les voir ici.
 *
 * ⚠ « Actif Inactif » est le couple d etiquettes de l interrupteur, ecrit d un
 * bloc dans le gabarit : on le traduit d un bloc aussi.
 */

module.exports = {
  'Fournisseur — Administration Sandriza': 'Supplier — Sandriza Administration',
  'Fournisseur': 'Supplier',
  'Nouveau fournisseur': 'New supplier',
  'Modifier le fournisseur': 'Edit supplier',
  'Formulaire indisponible': 'Form unavailable',
  'Fiche indisponible': 'Record unavailable',
  'Enregistrement bloqué : cette fiche est ouverte ailleurs.':
    'Saving blocked: this record is open elsewhere.',

  /* ── LES CHAMPS ─────────────────────────────────────────────────────────── */
  'Nom du fournisseur': 'Supplier name',
  'Site web': 'Website',
  'Code postal': 'Postal code',
  'Catégories fournies': 'Categories supplied',
  'Délai de livraison moyen': 'Average lead time',
  'Actif Inactif': 'Active Inactive',
  /* ⚠ « internes » = qui ne sortent pas de la boutique. « Internal notes » le
     dit ; « Private notes » laisserait croire a une note personnelle. */
  'Notes internes': 'Internal notes',

  /* ── CE QUE LA BOITE DE REPRISE ANNONCE ─────────────────────────────────── */
  /* ⚠ Ces deux-la se glissent DANS « {…} a ete laissee en cours » : d ou la
     minuscule initiale du second et l article du premier. */
  'Une modification de cette fiche': 'An edit to this record',
  'Une fiche de fournisseur': 'A supplier record',
};
