'use strict';

/*
 * LES FONDS SOMBRES QUI RESTENT SOMBRES EN MODE JOUR, ET POURQUOI C'EST JUSTE.
 * =============================================================================
 * Un fond sombre sans reprise `html.jour` est presque toujours un defaut : la
 * fenetre passe en clair et cette piece-la reste noire. Presque — pas toujours.
 * Une PASTILLE PLEINE (bouton d'action, badge d'etat) porte une couleur qui
 * SIGNIFIE quelque chose : l'or de la charte, le rouge d'un danger, le vert d'un
 * succes, le violet d'un paiement. Ces couleurs-la ne s'eclaircissent pas d'un
 * mode a l'autre, exactement comme le rouge d'un feu de circulation.
 *
 * La regle pour entrer ici : la piece est PEINTE d'une couleur qui porte un sens,
 * et son texte reste lisible dessus dans les DEUX modes (le banc du contraste
 * verifie ce ratio, il n'accorde aucune dispense la-dessus). Une SURFACE —
 * panneau, bandeau, corps de document, piste de bascule — n'a jamais sa place
 * dans cette liste : elle doit recevoir sa reprise `html.jour`.
 */

module.exports = {
  // fichier : { selecteur : couleur exacte }
  'chat-config.js': { '.b.prim': '#8f6f42' },
  'commandes.js': { '.badge2.vertf': '#166534', '.banniere': '#7f1d1d', '.ctx .warn': '#7f1d1d' },
  'config-navigation.js': { 'button.danger.arme': '#7f1d1d' },
  'expedition.js': { 'button.paie': '#7859f7' },
  'explorateur.js': { '.prim': '#8f6f42' },
  'inventaire.js': { '.badge.finale': '#dc2626', 'button.rouge': '#dc2626' },
  'invmeta.js': { 'button.ic.plus': '#8f6f42' },
  'newsletter.js': { '.pop .cta': '#8f6f42' },
  'produit.js': { '.vue .x:hover,.vign .x:hover': '#e04141' },
  'publicite.js': { '.graph .b2': '#dc2626' },
  'remboursement.js': { 'button.paie': '#7859f7' },
  'retour.js': { 'button.paie': '#7859f7' },
  'statistiques.js': { '.col': '#8f6f42' },
  'studio.js': { '.jeton.prim': '#8f6f42' },
};
