'use strict';

/*
 * QUI DOIT MONTRER UN CADENAS, ET SUR QUELLE PORTÉE (#22)
 * =============================================================================
 * Le défaut à l'origine de ce fichier : la fiche client OUVERTE disait bien
 * « Section verrouillée en modification par : broubob », mais LA LIGNE de ce
 * client dans la liste ne montrait rien. Un collègue devait cliquer pour
 * découvrir que la fiche était prise. L'information existait — elle n'était
 * pas là où l'on regarde.
 *
 * Corriger une liste ne suffit pas : la prochaine liste ajoutée l'oubliera.
 * Cette table est donc VÉRIFIÉE PAR UNE MACHINE (tools/verifier-cadenas.js,
 * appelé par verifier-fenetres.js). Deux contrôles :
 *
 *   1. chaque fenêtre déclarée ici appelle bien `szVerrouCase('<portée>', …)`
 *      pour CHAQUE portée annoncée, ET `szVerrousSuivre` pour lancer le
 *      sondage — l'un sans l'autre ne montre jamais rien ;
 *   2. toute portée réellement PRISE quelque part (`verrou:prendre`) est
 *      couverte par au moins une fenêtre de liste. C'est ce contrôle-là qui
 *      attrape le vrai piège : « on a rendu une fiche verrouillable, mais
 *      aucune liste ne le dit ».
 *
 * ⚠ NE PAS déclarer une portée qu'aucun écran ne prend jamais : un cadenas qui
 * ne peut pas s'allumer n'informe personne, il laisse croire à une protection
 * qui n'existe pas. C'est la raison pour laquelle « refunds » n'existe pas —
 * la fenêtre de remboursement verrouille la COMMANDE.
 */

// Fenêtre de LISTE → portées dont elle doit montrer le cadenas.
const LISTES = {
  'clients.js':        ['users'],
  'produits.js':       ['products'],
  'collections.js':    ['collections'],
  'fournisseurs.js':   ['suppliers'],
  'retours.js':        ['return_reqs'],
  // Une facture et un remboursement n'ont pas de verrou à eux : c'est la
  // COMMANDE qui se verrouille, et c'est donc elle qu'ils surveillent.
  'factures.js':       ['orders'],
  'remboursements.js': ['orders'],
};

/*
 * Fenêtres qui affichent des enregistrements verrouillables SANS passer par
 * `szVerrouCase`, et pourquoi. Une exemption doit se justifier, sinon c'est un
 * oubli déguisé.
 */
const EXEMPTIONS = {
  'commandes.js': 'la ligne porte déjà un bouton « 🔒 En traitement par X » '
    + '(plus explicite qu’un cadenas) et la vue détail son bandeau.',
  'tableau.js': 'le tableau de bord a son propre sondage depuis #38 '
    + '(tableau:verrous), antérieur au service partagé du socle.',
  'expedition.js': 'fenêtre de DÉTAIL, pas une liste : elle prend le verrou et '
    + 'affiche son bandeau.',
  'inventaire.js': 'écran d’ajustement d’UNE fiche produit : il prend le verrou '
    + 'et affiche son bandeau ; la liste des produits porte le cadenas.',
  'depenses.js': 'le verrou porte sur l’ANNUAIRE des fournisseurs de dépenses '
    + '(une seule fiche partagée), pas sur des lignes de liste.',
  'archives.js': 'commandes archivées : plus personne ne les modifie, aucun '
    + 'écran n’en prend le verrou.',
};

module.exports = { LISTES, EXEMPTIONS };
