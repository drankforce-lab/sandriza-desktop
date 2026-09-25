'use strict';

/*
 * LIQUIDATION / VENTE FINALE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE QU ON APPLIQUE ICI CHANGE CE QUE LA CLIENTE PEUT FAIRE APRES AVOIR
 * ACHETE : un produit mis en liquidation ou en vente finale N ACCEPTE PLUS DE
 * RETOUR, et la boutique l annonce sur sa fiche. Les trois phrases qui le disent
 * se traduisent en entier, avec leur consequence :
 *   · « Prix réduits pour écouler le stock — aucun retour possible. »
 *   · « Aucun retour ni échange accepté sur ces produits. »
 *   · « Ces produits n’accepteront plus de retour, et la boutique l’annoncera
 *     sur leur fiche. Vous pourrez les retirer un par un depuis cet écran. »
 *
 * ⚠⚠⚠ LE MOT « liquidation » N EST PAS UNE CLE, ET IL NE DOIT JAMAIS LE
 * DEVENIR. Il sert dans ce fichier de VALEUR COMPAREE (`r.etait ===
 * 'liquidation'`) et de NOM D OPERATION (`liquidation:retirer`,
 * `liquidation:cats`, `liquidation:parCategorie`) autant que de mot affiche.
 * Une cle d un seul mot se serait posee sur les trois. La source ecrit donc
 * chaque phrase EN ENTIER (« Retiré de la liquidation. », « en liquidation. »)
 * et laisse les valeurs nues. Meme chose pour `liq_no`, `final`, `normal`,
 * `depletion`, `period` : ce sont des regimes, pas des textes.
 *
 * ⚠⚠ LA DATE DE FIN EST ANNONCEE A LA CLIENTE (« jusqu’au … » porte son propre
 * title). Le regime « jusqu’à épuisement » n en a pas : les deux libelles
 * doivent rester aussi nets l un que l autre.
 *
 * ⚠ Les noms de produits, de categories et les SKU viennent du catalogue : ce
 * sont des donnees.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Liquidation / Vente finale — Administration Sandriza':
    'Clearance / Final sale — Sandriza Administration',
  'Liquidation / Vente finale': 'Clearance / Final sale',
  'Liquidation indisponible': 'Clearance unavailable',
  'Liquidation': 'Clearance',
  'Vente finale': 'Final sale',
  '🟡 Liquidation': '🟡 Clearance',
  '🔴 Vente finale': '🔴 Final sale',
  '🟡 En liquidation': '🟡 In clearance',
  '🔴 En vente finale': '🔴 In final sale',
  'En liquidation': 'In clearance',
  'En vente finale': 'In final sale',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Ce produit n’existe plus.': 'This product no longer exists.',
  'Aucun produit choisi.': 'No product chosen.',
  'Aucune catégorie choisie.': 'No category chosen.',
  'Indiquez la date de début et celle de fin.': 'Give the start date and the end date.',
  'La date de fin doit venir après celle de début.':
    'The end date must come after the start date.',
  'Aucune réponse de la fenêtre principale.': 'No answer from the main window.',

  /* ── LE COMPTE EN TETE, ET LES TUILES ───────────────────────────────────── */
  ' produit hors régime normal': ' product outside the normal regime',
  ' produits hors régime normal': ' products outside the normal regime',
  /* Les formes RENDUES : le texte est coupe du nombre qui le precede. */
  'produit hors régime normal': 'product outside the normal regime',
  'produits hors régime normal': 'products outside the normal regime',
  'produit': 'product',
  'produits': 'products',
  ' produit': ' product',
  ' produits': ' products',
  ' produit.': ' product.',
  ' produits.': ' products.',

  /* ── LA BARRE D OUTILS ──────────────────────────────────────────────────── */
  'Rechercher un produit (nom, SKU, catégorie)': 'Search a product (name, SKU, category)',
  'Rechercher un produit (nom, SKU, catégorie) — les deux régimes…':
    'Search a product (name, SKU, category) — both regimes…',
  '＋ Ajouter en lot': '＋ Add in a batch',
  '＋ Par catégorie': '＋ By category',
  /* ⚠ Le refus se dit en entier : ce qu on ne peut NI faire NI defaire. */
  'Lecture seule : votre rôle ne permet ni de mettre des produits ':
    'Read only: your role allows neither putting products ',
  'Lecture seule : votre rôle ne permet ni de mettre des produits':
    'Read only: your role allows neither putting products',
  'en liquidation ou en vente finale, ni de les en retirer.':
    'in clearance or final sale, nor taking them out.',
  'Résultats pour « ': 'Results for « ',
  'Résultats pour «': 'Results for «',
  'Aucun résultat en liquidation.': 'No result in clearance.',
  'Aucun résultat en vente finale.': 'No result in final sale.',

  /* ══ LES DEUX CARTES — CE QUE LA CLIENTE PERD ══════════════════════════════ */
  'Prix réduits pour écouler le stock — aucun retour possible.':
    'Reduced prices to clear the stock — no return possible.',
  'Aucun produit en liquidation.': 'No product in clearance.',
  'Aucun retour ni échange accepté sur ces produits.':
    'No return and no exchange accepted on these products.',
  'Aucun produit en vente finale.': 'No product in final sale.',

  /* ── LE TABLEAU ─────────────────────────────────────────────────────────── */
  'Produit': 'Product',
  'Durée': 'Duration',
  'Stock': 'Stock',
  'Prix': 'Price',
  'Produit Durée Stock': 'Product Length Stock',
  'La boutique annonce cette date au client': 'The storefront announces this date to the customer',
  'jusqu’au ': 'until ',
  'jusqu’à épuisement': 'until stock runs out',
  'Ramener au régime normal': 'Bring back to the normal regime',
  '✕ Retirer': '✕ Remove',
  '✓ Confirmer le retrait': '✓ Confirm the removal',
  'Afficher ': 'Show ',
  'Nombre de produits par page': 'Number of products per page',
  ' par page · ': ' per page · ',
  'Page ': 'Page ',
  '← Précédent': '← Previous',
  'Suivant →': 'Next →',

  /* ══ AJOUT EN LOT — DEUX ETAPES ════════════════════════════════════════════ */
  '＋ Mettre des produits en régime': '＋ Put products in a regime',
  'étape 1 sur 2': 'step 1 of 2',
  'étape 2 sur 2': 'step 2 of 2',
  '＋ Mettre des produits en régime étape 1 sur 2': '＋ Put products in a regime step 1 of 2',
  'Les produits': 'The products',
  'Nom, SKU': 'Name, SKU',
  'Nom, SKU…': 'Name, SKU…',
  'Tout cocher ': 'Check all ',
  'Tout cocher': 'Check all',
  'Tout décocher': 'Uncheck all',
  'Toutes': 'All',
  'Aucun produit trouvé.': 'No product found.',
  '🟡 déjà': '🟡 already',
  '🔴 déjà': '🔴 already',
  'déjà': 'already',
  'Le régime': 'The regime',
  'Jusqu’à épuisement de l’inventaire': 'Until the inventory runs out',
  'Période fixe': 'Fixed period',
  'Du ': 'From ',
  'Du': 'From',
  ' au ': ' to ',
  'Au': 'To',
  'Choisis ': 'Chosen ',
  'Enlever de la sélection': 'Remove from the selection',
  'Cochez des produits à gauche.': 'Check products on the left.',
  'Continuer →': 'Continue →',

  /* ══ LE RESUME — LE DERNIER ECRAN AVANT D ECRIRE ═══════════════════════════ */
  'Résumé avant d’appliquer': 'Summary before applying',
  'Résumé avant d’appliquer étape 2 sur 2': 'Summary before applying step 2 of 2',
  '🟡 Liquidation — aucun retour': '🟡 Clearance — no return',
  '🔴 Vente finale — aucun retour': '🔴 Final sale — no return',
  'Liquidation — aucun retour': 'Clearance — no return',
  'Vente finale — aucun retour': 'Final sale — no return',
  ' produit qui change de régime': ' product changing regime',
  ' produits qui changent de régime': ' products changing regime',
  'produit qui change de régime': 'product changing regime',
  'produits qui changent de régime': 'products changing regime',
  'qui changent de régime': 'changing regime',
  /* ⚠⚠ LA PHRASE QUI DIT CE QU ON PERD, ET COMMENT REVENIR EN ARRIERE. */
  'Ces produits n’accepteront plus de retour, et la boutique l’annoncera sur ':
    'These products will no longer accept returns, and the storefront will announce it on ',
  '⚠ Ces produits n’accepteront plus de retour, et la boutique l’annoncera sur':
    '⚠ These products will no longer accept returns, and the storefront will announce it on',
  'leur fiche. Vous pourrez les retirer un par un depuis cet écran.':
    'their page. You can take them out one by one from this screen.',
  '← Modifier la sélection': '← Change the selection',
  '✅ Appliquer': '✅ Apply',
  'Appliquer': 'Apply',

  /* ══ PAR CATEGORIE ═════════════════════════════════════════════════════════ */
  '＋ Par catégorie ': '＋ By category ',
  'Choisissez le régime, puis les catégories à y placer. ':
    'Choose the regime, then the categories to put in it. ',
  'Choisissez le régime, puis les catégories à y placer.':
    'Choose the regime, then the categories to put in it.',
  /* ⚠ « maintenant » EST le mot : la categorie n est pas une regle qui dure, ce
     sont les produits qui s y trouvent AU MOMENT ou on applique. */
  'Les produits concernés sont ceux qui s’y trouvent <strong>maintenant</strong>.':
    'The products concerned are those in it <strong>right now</strong>.',
  'Les produits concernés sont ceux qui s’y trouvent maintenant .':
    'The products concerned are those in it right now .',
  'Rechercher une catégorie': 'Search a category',
  'Rechercher une catégorie…': 'Search a category…',
  'Aucune catégorie trouvée.': 'No category found.',
  ' en liquidation': ' in clearance',
  ' en vente finale': ' in final sale',
  'Retirer du régime': 'Take out of the regime',
  ' catégorie': ' category',
  ' catégories': ' categories',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Application…': 'Applying…',
  /* ⚠⚠ CHAQUE PHRASE EST COMPLETE — voir l en-tete : jamais le mot du regime
     tout seul. */
  'Retiré de la liquidation.': 'Taken out of clearance.',
  'Retiré de la vente finale.': 'Taken out of the final sale.',
  ' en liquidation.': ' in clearance.',
  ' en vente finale.': ' in final sale.',
  ' produit dans ': ' product in ',
  ' produits dans ': ' products in ',
  ' — régime retiré.': ' — regime removed.',
  ' — liquidation.': ' — clearance.',
  ' — vente finale.': ' — final sale.',
  'en liquidation.': 'in clearance.',
  'en vente finale.': 'in final sale.',
  '— régime retiré.': '— regime removed.',
  '— liquidation.': '— clearance.',
  '— vente finale.': '— final sale.',
  'régime retiré': 'regime removed',
  'Retrait…': 'Removing…',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Page': 'Page',
  'Afficher': 'Show',
  'Choisis': 'Selected',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'par page ·': 'per page ·',
  'en liquidation': 'on clearance',
  'en vente finale': 'final sale',
  'produit dans': 'product in',
  'produits dans': 'products in',
  // La refonte de la liste, comme l'Inventaire (2026-09-25).
  'prix réduits, aucun retour': 'reduced prices, no returns',
  'ni retour ni échange': 'no returns or exchanges',
  'Cliquer pour afficher': 'Click to show',
  'Nom, SKU ou catégorie — les deux régimes…': 'Name, SKU or category — both regimes…',
  'Rupture': 'Out of stock',
};
