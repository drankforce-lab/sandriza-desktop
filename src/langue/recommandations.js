'use strict';

/*
 * RECOMMANDATIONS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ DEUX CHAMPS, DEUX REGLES OPPOSEES, ET C EST LE SEUL PIEGE DE CET ECRAN.
 *   · « Nom interne » ne sort jamais de l administration : son exemple se
 *     traduit, il aide celle qui tape ;
 *   · « Titre affiche » est ce que LA CLIENTE LIT sur la fiche produit de la
 *     boutique — laquelle est en francais. Son exemple reste donc EN FRANCAIS,
 *     avec une entree qui rend le meme texte : proposer « You may also like »
 *     ferait taper de l anglais dans une boutique francophone.
 * C est la meme regle que les suggestions des messages telephoniques, et elle
 * se decide champ par champ, jamais ecran par ecran.
 *
 * ⚠⚠ L ORDRE DES REGLES EST LEUR SENS : « une regle plus haute passe avant —
 * c est elle que le client voit EN PREMIER sur une fiche ». Sans cette phrase,
 * on deplace des lignes sans savoir ce qu on change pour la boutique.
 *
 * ⚠ UNE SUPPRESSION QUI SE RATTRAPE DOIT LE DIRE : « elles ne sont pas
 * detruites : vous pouvez les remettre en service » (regles par defaut) et
 * « — restaurable plus bas ». A l inverse, l effacement des liaisons manuelles
 * est DEFINITIF, et la phrase le dit sans detour.
 *
 * ⚠ LES TYPES DE REGLES viennent du SERVEUR (`D.types`) : leurs libelles sont
 * ses mots. Les noms de produits et de styles sont de la DONNEE.
 */

module.exports = {
  /* ── L EN-TETE ──────────────────────────────────────────────────────────── */
  'Recommandations — Administration Sandriza': 'Recommendations — Sandriza Administration',
  'Recommandations': 'Recommendations',
  'Recommandations indisponibles': 'Recommendations unavailable',
  'Votre rôle ne donne pas accès aux recommandations.':
    'Your role does not give access to recommendations.',
  'Consultation seulement.': 'Viewing only.',

  /* ── LES REFUS ──────────────────────────────────────────────────────────── */
  'Cet élément n’existe plus.': 'This item no longer exists.',
  'Le nom interne est requis.': 'The internal name is required.',
  'Le titre affiché est requis.': 'The displayed title is required.',
  'Cette règle est déjà au bout de la liste.': 'This rule is already at the end of the list.',
  'Échec :': 'Failed:',
  'Catalogue illisible :': 'Catalogue unreadable:',
  'Lecture du catalogue…': 'Reading the catalogue…',

  /* ── LE FORMULAIRE D UNE REGLE ──────────────────────────────────────────── */
  'Nouvelle règle': 'New rule',
  '+ Nouvelle règle': '+ New rule',
  'Modifier la règle': 'Edit the rule',
  'Type de règle': 'Rule type',
  'Nom interne *': 'Internal name *',
  'Titre affiché *': 'Displayed title *',
  'Sous-titre (optionnel)': 'Subtitle (optional)',
  'Description courte': 'Short description',
  'Articles max (1 à 16)': 'Max items (1 to 16)',
  'Afficher sur': 'Show on',
  'Fiche produit': 'Product page',
  'Créer la règle': 'Create the rule',
  'Règle «': 'Rule «',
  '» créée.': '» created.',
  'Règle mise à jour.': 'Rule updated.',
  'Panier': 'Basket',
  'Accueil': 'Home',

  /* ── L ORDRE, QUI EST LE SENS MEME DES REGLES ───────────────────────────── */
  /* ⚠⚠ SANS CETTE PHRASE, ON DEPLACE DES LIGNES SANS SAVOIR CE QU ON CHANGE. */
  'Ordre d’affichage': 'Display order',
  'Une règle plus haute passe avant :': 'A rule higher up comes first:',
  'c’est elle que le client voit en premier sur une fiche.':
    'it is the one the customer sees first on a product page.',
  'Ordre modifié — «': 'Order changed — «',
  '» a changé de place.': '» has moved.',

  /* ── LA LISTE DES REGLES ────────────────────────────────────────────────── */
  'Aucune règle pour l’instant': 'No rule yet',
  '— utilisez « + Nouvelle règle » ci-dessus pour en créer une.':
    '— use « + New rule » above to create one.',
  'Règle Type Affichée sur': 'Rule Type Shown on',
  'Max État': 'Max Status',
  'Règle': 'Rule',
  'Type': 'Type',
  'Affichée sur': 'Shown on',
  'État': 'Status',
  'par défaut': 'default',
  'activée.': 'enabled.',
  'désactivée.': 'disabled.',
  /* ⚠ UNE SUPPRESSION QUI SE RATTRAPE LE DIT — sinon on n ose plus rien retirer. */
  'Règles par défaut retirées': 'Default rules removed',
  'Elles ne sont pas détruites :': 'They are not destroyed:',
  'vous pouvez les remettre en service.': 'you can put them back into service.',
  'Cliquez « Confirmer ? » — cette règle par défaut sera retirée, mais vous pourrez la restaurer.':
    'Click « Confirm? » — this default rule will be removed, but you will be able to restore it.',
  'Cliquez « Confirmer ? » pour supprimer cette règle.':
    'Click « Confirm? » to delete this rule.',
  '» supprimée': '» deleted',
  '— restaurable plus bas.': '— restorable below.',
  '» remise en service.': '» put back into service.',

  /* ── LES LIAISONS MANUELLES ─────────────────────────────────────────────── */
  /* ⚠⚠ CELLE-LA EST DEFINITIVE, et la phrase le dit sans detour. */
  'Liaisons manuelles': 'Manual links',
  'Associer des produits': 'Link products together',
  'Produit source': 'Source product',
  '— Choisir le produit source —': '— Choose the source product —',
  'Choisissez d’abord le produit source.': 'Choose the source product first.',
  'Aucun produit ne correspond.': 'No product matches.',
  'Articles liés à «': 'Items linked to «',
  'Aucune liaison manuelle.': 'No manual link.',
  'Les recommandations automatiques s’appliquent seules.':
    'The automatic recommendations apply on their own.',
  'Tout effacer': 'Clear all',
  /* ⚠⚠ LES DEUX MOITIES D UN COMPTE SE TRADUISENT ENSEMBLE, JAMAIS SEULES.
     La source ecrit `n + ' produit' + (n > 1 ? 's liés' : ' lié')` : si l on ne
     traduit que la seconde moitie, l anglais rend « 3 produit linked ». Chaque
     paire est donc posee ici en entier, et la marque du pluriel reste DU COTE
     de la variante longue — c est la seule facon d obtenir « 3 products linked »
     et « 1 product linked » avec le meme code. */
  ' produit': ' product',
  ' lié': ' linked',
  's liés': 's linked',
  ' article': ' item',
  ' lié.': ' linked.',
  's liés.': 's linked.',
  ' choisi': ' selected',
  's choisis': 's selected',
  ' liaison': ' link',
  'Liaisons de «': 'Links from «',
  '» retirées.': '» removed.',
  'Cliquez « Confirmer ? » — tous les rapprochements faits à la main seront perdus,':
    'Click « Confirm? » — every link made by hand will be lost,',
  'les recommandations automatiques reprennent seules.':
    'the automatic recommendations take over on their own.',
  ' effacée': ' cleared',
  's effacées': 's cleared',
  'Chercher un nom ou un SKU': 'Search a name or SKU',
  'Chercher un nom ou un SKU…': 'Search a name or SKU…',

  /* ── LES ONGLETS ────────────────────────────────────────────────────────── */
  'Règles': 'Rules',
  'Statistiques': 'Statistics',

  /* ── LES STATISTIQUES ───────────────────────────────────────────────────── */
  'Chargement des statistiques…': 'Loading the statistics…',
  'Couverture des règles': 'Rule coverage',
  'Aucune règle.': 'No rule.',
  'Règle État Articles couverts': 'Rule Status Items covered',
  'Articles couverts': 'Items covered',
  'Articles les plus demandés': 'Most requested items',
  'Pas encore assez de commandes pour en tirer un classement.':
    'Not enough orders yet to draw a ranking from.',
  'Article Score': 'Item Score',
  'Article': 'Item',
  'Score': 'Score',

  /* ── LE GENERATEUR D AGENCEMENT ─────────────────────────────────────────── */
  'Générateur d’agencement': 'Outfit builder',
  '1 · Style': '1 · Style',
  '2 · Articles': '2 · Items',
  '3 · Publier': '3 · Publish',
  '✕ Réinitialiser': '✕ Reset',
  'Recette :': 'Recipe:',
  '· Catégories :': '· Categories:',
  'Choisissez un style pour filtrer le catalogue.': 'Choose a style to filter the catalogue.',
  'Sans style, tous les articles actifs sont proposés.':
    'With no style, every active item is offered.',
  'Aucun article actif dans cette catégorie.': 'No active item in this category.',
  'Toutes': 'All',
  ' $ au total': ' $ total',
  'Nom de la suggestion': 'Name of the suggestion',
  'Sur les fiches produit': 'On product pages',
  'Dans le panier': 'In the basket',
  /* ⚠ « CHAQUE PIECE SERA LIEE A TOUTES LES AUTRES » : c est ce qui distingue un
     agencement d une simple liste — et ce qui explique le minimum de deux. */
  'Deux articles au minimum — chaque pièce du look sera':
    'Two items minimum — each piece of the outfit will be',
  'liée à toutes les autres.': 'linked to all the others.',
  'Publier la suggestion': 'Publish the suggestion',
  '» publiée —': '» published —',
  'pièces, visible sur': 'pieces, visible on',
  'Une règle de recommandation': 'A recommendation rule',

  /* ══ CE QUI NE SE TRADUIT PAS, ET POURQUOI C EST ECRIT ICI ══════════════════
   * ⚠⚠⚠ « Vous aimerez aussi » est l EXEMPLE du TITRE AFFICHE — celui que la
   * CLIENTE lit sur la fiche produit, dans une boutique FRANCOPHONE. Proposer
   * « You may also like » ferait taper de l anglais dans le texte que voient les
   * clientes. L exemple du NOM INTERNE, lui, ne sort jamais de l administration :
   * il se traduit.
   * ⚠ La difference ne se decide pas ecran par ecran, mais CHAMP par CHAMP :
   * la question est toujours « qui LIT ce que l on tape ici ? ».
   * ══════════════════════════════════════════════════════════════════════════ */
  'Ex : Accessoires tendance': 'E.g. Trending accessories',
  'Ex : Vous aimerez aussi': 'Ex : Vous aimerez aussi',
  /* ⚠⚠ TROISIEME CHAMP, MEME QUESTION — et celui-la, le code du site tranche
     sans ambiguite. `_agencementPublierCoeur` ecrit `name: nom, title: nom` :
     le nom tape ici DEVIENT le titre affiche sur la fiche produit. Un exemple
     anglais ferait donc apparaitre de l anglais dans une boutique francophone,
     exactement comme « Vous aimerez aussi ». Il reste en francais. */
  'Look d’automne': 'Look d’automne'
};
