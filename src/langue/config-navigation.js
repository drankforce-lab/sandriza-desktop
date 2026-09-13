'use strict';

/*
 * CONFIGURATION DE LA NAVIGATION — les deux langues
 * =============================================================================
 * ⚠⚠⚠ L ETIQUETTE ET LE LIEN D UN ELEMENT DE MENU SONT ECRITS DANS LA BOUTIQUE :
 * c est la CLIENTE qui les lit, pas l administration. Ni ce qui est tape ici, ni
 * l etiquette par defaut d un nouvel element (« Nouveau lien », « #shop ») ne
 * passent par ce dictionnaire — ils sont declares en SZ_DONNEES. Les traduire
 * poserait un mot anglais dans un menu francais, et personne ne saurait d ou il
 * vient.
 *
 * ⚠⚠ UN ELEMENT FIXE NE SE SUPPRIME PAS, IL SE MASQUE. La phrase d ouverture le
 * dit et donne la solution dans la meme ligne (masquer, ou ajouter des
 * sous-menus). Sans elle, on cherche un bouton « Supprimer » qui n existe pas.
 *
 * ⚠⚠ « RÉINITIALISER » FAIT PERDRE LES AJOUTS, et la phrase d armement le dit en
 * toutes lettres — « le menu reprend sa composition d’origine, vos ajouts sont
 * perdus ». C est la seule chose qui separe un clic d une demi-journee refaite.
 *
 * ⚠ Les etiquettes lues par un lecteur d ecran portent le NOM de l element
 * (« Étiquette du menu — Boutique ») : seul le debut se traduit, le nom vient de
 * la configuration.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Configuration de la navigation — Administration Sandriza':
    'Navigation configuration — Sandriza Administration',
  'Configuration de la navigation': 'Navigation configuration',
  'Lecture seule : vous pouvez consulter le menu, pas le modifier.':
    'Read only: you can look at the menu, not change it.',
  'Votre rôle est en lecture seule : le menu ne peut pas être modifié.':
    'Your role is read only: the menu cannot be changed.',
  'L’enregistrement dans le nuage a échoué. Réessayez.':
    'Saving to the cloud failed. Try again.',

  /* ══ CE QU ON PEUT FAIRE, ET CE QU ON NE PEUT PAS ══════════════════════════
   * ⚠⚠ Un element fixe se MASQUE, il ne se supprime pas. */
  'Les éléments fixes ne se suppriment pas — masquez-les ou ajoutez-leur des sous-menus. « + Ajouter » crée un élément personnalisé.':
    'Fixed items cannot be deleted — hide them, or give them sub-menus. « + Add » creates a custom item.',
  '+ Ajouter un élément': '+ Add an item',
  'Aucun élément de menu.': 'No menu item.',

  /* ══ UN ELEMENT ════════════════════════════════════════════════════════════
   * ⚠ Le NOM de l element suit le tiret : il vient de la configuration. */
  'Étiquette du menu — ': 'Menu label — ',
  'Étiquette du menu —': 'Menu label —',
  'Lien du menu — ': 'Menu link — ',
  'Lien du menu —': 'Menu link —',
  'Étiquette': 'Label',
  'Nom affiché': 'Displayed name',
  'Lien': 'Link',
  'Catégorie': 'Category',
  '+ Sous-menu': '+ Sub-menu',
  'Lien personnalisé': 'Custom link',
  'L’étiquette du sous-menu est requise.': 'The sub-menu label is required.',
  'Le lien du sous-menu est requis.': 'The sub-menu link is required.',
  'Cliquez « Confirmer ? » pour supprimer cet élément.':
    'Click « Confirm? » to delete this item.',

  /* ══ REINITIALISER ═════════════════════════════════════════════════════════
   * ⚠⚠⚠ LES AJOUTS SONT PERDUS, et la phrase le dit avant le geste. */
  'Réinitialiser': 'Reset',
  'Cliquez « Confirmer ? » : le menu reprend sa composition d’origine, vos ajouts sont perdus.':
    'Click « Confirm? »: the menu goes back to its original make-up, your additions are lost.',
  'Réinitialisation…': 'Resetting…',
  'Navigation réinitialisée.': 'Navigation reset.',
  'Enregistré.': 'Saved.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Sous-menu': 'Submenu',
  'Type': 'Type',
  'Collection': 'Collection',
  'Ajouter': 'Add'
};
