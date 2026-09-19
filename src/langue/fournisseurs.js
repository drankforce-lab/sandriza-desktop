'use strict';

/*
 * FOURNISSEURS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ SUPPRIMER UNE FICHE LAISSE LES PRODUITS EN PLACE, SANS FOURNISSEUR. C est
 * le seul effet de bord, et il est INVISIBLE depuis cet ecran : les produits
 * rattaches ne bougent pas, ils perdent simplement leur lien. Les deux phrases
 * le disent — celle qui arme (« la fiche disparaît, les produits rattachés
 * restent sans fournisseur ») et celle qui compte apres coup. Les raccourcir
 * ferait supprimer une fiche sans savoir ce qu on detache.
 *
 * ⚠⚠ LE REPERTOIRE N EST PAS LA LISTE. C est un carnet de grossistes CONNUS, a
 * ajouter en un clic ; « Mes fournisseurs » est ce qu on a vraiment. « Déjà dans
 * vos fournisseurs » dit pourquoi il n y a pas de bouton — on le DIT au lieu
 * d offrir un bouton qui refuse.
 *
 * ⚠ LE NOM, LE CONTACT, LE COURRIEL, LE TELEPHONE, LE SITE ET LES CATEGORIES
 * d un fournisseur sont des DONNEES. Le pays, le lieu et le « quoi » des fiches
 * du repertoire viennent du coeur : ils ne sont pas ecrits ici.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Fournisseurs — Administration Sandriza': 'Suppliers — Sandriza Administration',
  'Fournisseurs': 'Suppliers',
  /* ⚠ LE PIED DE LISTE (2026-09-19) compte en toutes lettres, et les DEUX
     formes existent. Un « fournisseur(s) » entre parentheses n existe dans
     aucune des deux langues, et le banc des pluriels le refuse — a raison :
     c est la forme qu on ecrit quand on ne veut pas choisir.
     ⚠ Minuscules : le mot suit un nombre dans une phrase, il ne commence rien. */
  'fournisseur': 'supplier',
  'fournisseurs': 'suppliers',
  'Fournisseurs indisponibles': 'Suppliers unavailable',
  'Votre rôle ne donne pas accès aux fournisseurs.':
    'Your role does not give access to the suppliers.',

  /* ══ LE REPERTOIRE ═════════════════════════════════════════════════════════
   * ⚠⚠ Un carnet de grossistes connus — pas la liste de vos fournisseurs. */
  ' Répertoire': ' Directory',
  '🔎 Répertoire': '🔎 Directory',
  'Un carnet de grossistes connus, à ajouter en un clic':
    'A book of known wholesalers, to add in one click',
  'Lecture du répertoire…': 'Reading the directory…',
  '← Mes fournisseurs': '← My suppliers',
  'Toutes catégories': 'All categories',
  'Tous les pays': 'All countries',
  'Nom, description, ville': 'Name, description, city',
  'Nom, description, ville…': 'Name, description, city…',
  'Aucun résultat pour cette recherche.': 'No result for this search.',
  /* ⚠ On le DIT au lieu d offrir un bouton qui refuse. */
  'Déjà dans vos fournisseurs': 'Already in your suppliers',
  '+ Ajouter': '+ Add',
  'consultation seulement': 'read only',

  /* ══ LA LISTE ══════════════════════════════════════════════════════════════ */
  'Nom, contact ou courriel': 'Name, contact or email',
  'Nom, contact ou courriel…': 'Name, contact or email…',
  ' au total': ' in total',
  '+ Nouveau fournisseur': '+ New supplier',
  'Aucun résultat.': 'No result.',
  'Aucun fournisseur — créez-en un pour commencer.':
    'No supplier — create one to get started.',
  'Ouvrir la fiche fournisseur': 'Open the supplier record',
  'Fournisseur': 'Supplier',
  'Contact': 'Contact',
  'Courriel / Tél.': 'Email / Phone',
  'Catégories': 'Categories',
  'Statut': 'Status',
  'Fournisseur Contact Courriel / Tél.': 'Supplier Contact Email / Phone',
  'Catégories Statut': 'Categories Status',

  /* ══ LES VERDICTS ══════════════════════════════════════════════════════════ */
  'Assistant fournisseur ouvert dans sa fenêtre.':
    'Supplier assistant opened in its own window.',
  'Fiche fournisseur ouverte dans sa fenêtre.':
    'Supplier record opened in its own window.',
  /* ⚠ Le nom du fournisseur precede : seule la suite se lit. */
  ' est déjà dans vos fournisseurs.': ' is already in your suppliers.',
  'est déjà dans vos fournisseurs.': 'is already in your suppliers.',
  ' ajouté à vos fournisseurs.': ' added to your suppliers.',
  'ajouté à vos fournisseurs.': 'added to your suppliers.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',

  /* ══ LA SUPPRESSION ════════════════════════════════════════════════════════
   * ⚠⚠⚠ CE QUI ARRIVE AUX PRODUITS RATTACHES. Voir l en-tete. */
  'Recliquez pour confirmer — la fiche disparaît, les produits rattachés restent sans fournisseur.':
    'Click again to confirm — the record disappears, the products attached to it stay without a supplier.',
  ' » supprimé.': ' » deleted.',
  '» supprimé.': '» deleted.',
  ' produit reste sans fournisseur.': ' product stays without a supplier.',
  ' produits restent sans fournisseur.': ' products stay without a supplier.',
  'produit reste sans fournisseur.': 'product stays without a supplier.',
  'produits restent sans fournisseur.': 'products stay without a supplier.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Actif': 'Active',
  'Inactif': 'Inactive',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'au total': 'in total'
};
