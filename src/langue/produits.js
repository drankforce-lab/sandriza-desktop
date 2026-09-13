'use strict';

/*
 * PRODUITS EN VENTE — les deux langues
 * =============================================================================
 * ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT. Les NOMS de produits, de categories et
 * d etiquettes viennent de la base : ils restent tels qu ils ont ete saisis. Les
 * VALEURS des filtres (`all`, `finale`, `liquidation`) ne sont pas ici non plus —
 * elles partent dans la requete, et `banc-langue-donnees` refuserait de les voir.
 *
 * ⚠ LES PICTOGRAMMES RESTENT COLLES A LEUR PHRASE. « 🔴 Vente finale » se traduit
 * en entier : les separer ferait deriver l un sans l autre au premier changement.
 */

module.exports = {
  'Produits en vente — Administration Sandriza': 'Products for sale — Sandriza Administration',
  'Produits en vente': 'Products for sale',
  'Produits indisponibles': 'Products unavailable',
  'Votre rôle ne donne pas accès aux produits.': 'Your role does not give access to products.',
  'Cette fiche n’existe plus.': 'This record no longer exists.',
  'Aucun produit ne correspond.': 'No product matches.',
  '+ Nouveau produit': '+ New product',

  /* ── LES FILTRES ────────────────────────────────────────────────────────── */
  'Toutes les catégories': 'All categories',
  'Toutes les étiquettes': 'All tags',
  'Tout l’inventaire': 'All inventory',
  '🔴 Vente finale': '🔴 Final sale',
  '🟡 Liquidation': '🟡 Clearance',
  'Vente finale': 'Final sale',
  /* ⚠ « À commander » = le stock est sous le seuil de reapprovisionnement.
     « To reorder » dit l action ; « Low stock » dirait l etat sans dire quoi
     faire, et c est une liste sur laquelle on AGIT. */
  '⚠ À commander': '⚠ To reorder',
  'cat. à commander': 'cat. to reorder',
  /* ⚠ « Seuil non atteint » = le seuil n a PAS ete franchi, donc rien a faire.
     Traduit par la situation, pas mot a mot : « Above threshold » se lit d un
     coup d oeil, « Threshold not reached » se relit deux fois. */
  'Seuil non atteint': 'Above threshold',
  '✓ Seuil non atteint': '✓ Above threshold',
  /* ⚠ Le tri par nombre de paniers ou le produit apparait. Le crochet marque que
     le tri est ACTIF — c est le meme bouton dans ses deux etats. */
  '🛒 Trier par panier': '🛒 Sort by cart',
  '🛒 Tri panier ✓': '🛒 Cart sort ✓',

  /* ── LES EN-TETES DE COLONNES ───────────────────────────────────────────── */
  /* ⚠ Deux en-tetes groupes, ecrits d un bloc dans le gabarit. */
  'Produit Catégorie Étiquette': 'Product Category Tag',
  'Prix Inventaire Paniers': 'Price Inventory Carts',

  /* ── CE QUE LA FENETRE DIT QUAND ELLE PASSE LA MAIN ─────────────────────── */
  'Assistant Produit ouvert dans sa fenêtre.': 'Product assistant opened in its own window.',
  'Fiche ouverte dans l’assistant Produit.': 'Record opened in the Product assistant.',

  /* ── LES FRAGMENTS TELS QU ILS EXISTENT DANS LE GABARIT ────────────────
     ⚠ Les en-têtes sont des cellules séparées : la forme jointe n existe qu à
     l écran, jamais dans le fichier. */
  'Produit': 'Product',
  'Catégorie': 'Category',
  'Étiquette': 'Tag',
  'Prix': 'Price',
  'Inventaire': 'Inventory',
  'Paniers': 'Carts',

  /* ── CE QUE LE BANC RESIDUEL A TROUVE ──────────────────────────────────── */
  'Aucune unité en stock': 'No unit in stock',
  'Rechercher un produit': 'Search for a product',
  'Rechercher un produit…': 'Search for a product…',
  'Mettre en premier les produits présents dans des paniers actifs': 'Put the products sitting in active baskets first',
  'Ouvrir la fiche': 'Open the record',
  '🟡 Liquidation': '🟡 Clearance',
  'Liquidation': 'Clearance',
  '⚠ À commander': '⚠ To order',
  'À commander': 'To order',
  '🛒 Tri panier ✓': '🛒 Basket sort ✓',
  'Tri panier ✓': 'Basket sort ✓',
  '🛒 Trier par panier': '🛒 Sort by basket',
  'Trier par panier': 'Sort by basket',
};
