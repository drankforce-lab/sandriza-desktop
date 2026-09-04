'use strict';

/*
 * LES COULEURS SOMBRES QUI RESTENT SOMBRES EN MODE JOUR, ET POURQUOI C'EST JUSTE.
 * =============================================================================
 * Un fond ou une bordure sombre sans reprise `html.jour` est presque toujours un
 * defaut : la fenetre passe en clair et cette piece-la reste noire. Presque —
 * pas toujours. Une PASTILLE PLEINE (bouton d'action, badge d'etat) porte une
 * couleur qui SIGNIFIE quelque chose : l'or de la charte, le rouge d'un danger,
 * le vert d'un succes, le violet d'un paiement. Ces couleurs-la ne
 * s'eclaircissent pas d'un mode a l'autre, comme le rouge d'un feu.
 *
 * La regle pour entrer ici : la piece est PEINTE d'une couleur qui porte un sens,
 * et son texte reste lisible dessus dans les DEUX modes (le banc du contraste
 * verifie ce ratio, il n'accorde aucune dispense la-dessus). Une SURFACE —
 * panneau, bandeau, corps de document, piste de bascule, contour de carte — n'a
 * jamais sa place ici : elle doit recevoir sa reprise `html.jour`, ou employer un
 * jeton translucide (`var(--vNN)`) qui s'inverse tout seul.
 */

module.exports = {

  /* Fonds pleins dont la couleur porte un sens.
     ⚠ Les boutons colores (button.paie, button.rouge) n'y sont PAS : ce sont des
     <button>, et la reprise generique du mode jour les repeint en blanc
     (html.jour button, 0,1,2 contre 0,1,1). Ils ont donc leur propre reprise
     html.jour dans leur fenetre — sans quoi le bouton de paiement perdait sa
     couleur en plein jour. Trouve par ce banc meme, le 2026-09-04. */
  fonds: {
    'chat-config.js': { '.b.prim': '#8f6f42' },
    'commandes.js': { '.badge2.vertf': '#166534', '.banniere': '#7f1d1d', '.ctx .warn': '#7f1d1d' },
    'config-navigation.js': { 'button.danger.arme': '#7f1d1d' },
    'explorateur.js': { '.prim': '#8f6f42' },
    'inventaire.js': { '.badge.finale': '#dc2626' },
    'invmeta.js': { 'button.ic.plus': '#8f6f42' },
    'newsletter.js': { '.pop .cta': '#8f6f42' },
    'produit.js': { '.vue .x:hover,.vign .x:hover': '#e04141' },
    'publicite.js': { '.graph .b2': '#dc2626' },
    'statistiques.js': { '.col': '#8f6f42' },
    'studio.js': { '.jeton.prim': '#8f6f42' },
  },

  /* Bordures dont la couleur porte un sens : le rouge encadre ce qui est
     dangereux ou definitif, dans les deux modes. Les contours de SURFACE, eux,
     sont passes aux jetons translucides le 2026-09-04 (79 declarations). */
  bordures: {
    'config-navigation.js': { 'button.danger.arme': '#b91c1c' },
    'liquidation.js': { '.tuile.vfin': '#dc2626', '.resume.vfin': '#dc2626' },
  },
};
