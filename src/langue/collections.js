'use strict';

/*
 * NOS COLLECTIONS — les deux langues
 * =============================================================================
 * ⚠⚠ LE NOM, LA SAISON ET LE NOMBRE D ARTICLES D UNE COLLECTION SONT DES
 * DONNEES : ils viennent du catalogue et s affichent dans la boutique. Rien de
 * cela ne passe par ce dictionnaire — seules les etiquettes de colonnes se
 * lisent.
 *
 * ⚠ « Pas de collection en ce moment. » n est pas une panne : c est un
 * catalogue qui n en a pas encore.
 *
 * ⚠ Les deux verdicts distinguent l ASSISTANT (une collection neuve) de la
 * collection EXISTANTE ouverte dans ce meme assistant.
 */

module.exports = {
  /* ── L EXPORT DE LA LISTE (2026-09-19) ─────────────────────────────────
     ⚠ La DESCRIPTION part entiere dans le fichier, alors qu elle est coupee a
     120 caracteres a l ecran. Une description tronquee dans un export est une
     donnee perdue sans qu on le sache. */
  'Description': 'Description',
  'La liste des collections': 'The collection list',
  /* ⚠ LES DEUX ALTERNATIVES EN ENTIER — voir `tools/banc-pluriel-colle.js`. */
  'collection': 'collection',
  'collections': 'collections',
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Nos Collections — Administration Sandriza':
    'Our Collections — Sandriza Administration',
  'Nos Collections': 'Our Collections',
  'Collections indisponibles': 'Collections unavailable',
  'Votre rôle ne donne pas accès aux collections.':
    'Your role does not give access to the collections.',
  'Cette collection n’existe plus.': 'This collection no longer exists.',

  /* ══ LA LISTE ══════════════════════════════════════════════════════════════
   * ⚠ Le nom et la saison viennent du catalogue. */
  '+ Nouvelle collection': '+ New collection',
  'Pas de collection en ce moment.': 'No collection at the moment.',
  'Ouvrir la collection': 'Open the collection',
  'Collection': 'Collection',
  'Saison': 'Season',
  'Articles': 'Items',
  'Statut': 'Status',
  'Collection Saison': 'Collection Season',
  'Articles Statut': 'Items Status',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Assistant de collection ouvert dans sa fenêtre.':
    'Collection assistant opened in its own window.',
  'Collection ouverte dans son assistant.':
    'Collection opened in its assistant.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Active': 'Active',
  'Inactive': 'Inactive',
  // La refonte de la liste, comme l'Inventaire (2026-09-25).
  'Collections': 'Collections',
  'au total': 'in total',
  'Actives': 'Active',
  'visibles en boutique': 'visible in the store',
  'dans l’ensemble des collections': 'across all collections',
  'Cliquer pour afficher': 'Click to show',
  'Rechercher une collection': 'Search for a collection',
  'Nom ou saison…': 'Name or season…',
  'Toutes': 'All',
  'Inactives': 'Inactive',
  'Aucune collection ne correspond.': 'No collection matches.',
};
