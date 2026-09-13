'use strict';

/*
 * LES TITRES DES FENETRES NATIVES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE QUI EST ECRIT ICI N EST PAS DANS LA PAGE. C est le titre porte par la
 * FENETRE elle-meme : la barre de titre de Windows, la vignette de la barre des
 * taches, le sélecteur Alt-Tab. Il est pose par `ouvrirNative(cle, titre, …)`
 * dans `main.js`, AVANT que la page existe, et aucune traduction de la page ne
 * peut l atteindre.
 *
 * ⚠⚠ SA CAPTURE DU 2026-09-13 : la fenetre disait « New product » a l interieur
 * et « Nouveau produit » dans sa barre de titre, sur la MEME image. Les deux
 * textes sont a deux metres l un de l autre a l ecran, et vivaient dans deux
 * mondes qui ne se parlaient pas.
 *
 * ⚠ POURQUOI AUCUN BANC NE LE VOYAIT. `banc-langue-residuel` et le compteur
 * lisent `src/fenetres/*.js` — le titre n y est pas. `banc-langue-processus-
 * principal` lit bien `main.js`, mais il cherche du texte DANS DU BALISAGE
 * (`>…<`, `title="…"`) : un titre passe en DEUXIEME ARGUMENT d une fonction
 * n a aucune de ces signatures. C est la sixieme fois qu un defaut se trouve
 * exactement la ou aucun banc ne regarde — et la reponse est la meme : un banc
 * de plus, pas un coup d oeil de plus.
 *
 * ⚠ LA RESOLUTION EST TARDIVE, PAS A LA GENERATION. Les fenetres resolvent leur
 * texte quand leur page est fabriquee ; ici `TF(...)` est appele au moment ou la
 * fenetre s ouvre, donc il suit la langue du poste a cet instant. Changer de
 * langue rouvre les fenetres (voir #96), le titre suit.
 */

module.exports = {
  /* ── LES FENETRES OUVERTES DEPUIS UNE LIGNE (une commande, un client…) ──── */
  'Préparation de commande': 'Order preparation',
  'Expédier une commande': 'Ship an order',
  'Demande de retour': 'Return request',
  'Remboursement': 'Refund',
  'Détail de commande': 'Order detail',
  'Fiche client': 'Customer record',
  'État de compte': 'Account statement',
  'Facture': 'Invoice',
  'Factures': 'Invoices',

  /* ── LES FICHES : le titre dit s il s agit d une CREATION ou d une reprise ─
     ⚠ « Nouveau produit » et « Produit » ne sont pas le meme titre, et c est
     voulu : l un annonce qu il n y a rien a perdre en fermant, l autre non. */
  'Produit': 'Product',
  'Nouveau produit': 'New product',
  'Collection': 'Collection',
  'Nouvelle collection': 'New collection',
  'Fournisseur': 'Supplier',
  'Nouveau fournisseur': 'New supplier',

  /* ── LES OUTILS ─────────────────────────────────────────────────────────── */
  'Editeur visuel': 'Visual editor',
  'Explorateur de photos': 'Photo explorer',
  'Affichage client': 'Customer display',
  'Notes des mises à jour': 'Release notes',

  /* ── L ADMINISTRATION DU POSTE ──────────────────────────────────────────── */
  'Cadre de l administration': 'Administration frame',
  'Verrous': 'Locks',
  'Mode usage exclusif': 'Exclusive use mode',
  'Personnel connecté': 'Staff signed in'
};
