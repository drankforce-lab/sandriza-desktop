'use strict';

/*
 * ATTRIBUTS PRODUITS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN EDITE DES VALEURS QUI SONT DEJA BILINGUES, et c est tout le
 * piege. « Etiquette FR / Etiquette EN », « Nom affiche / Nom EN » : ce que ces
 * champs CONTIENNENT est la DONNEE de la boutique — ses propres libelles, dans
 * ses deux langues a elle. Seuls les EN-TETES de colonnes et le decor de
 * l ecran sont ici. Traduire un contenu reviendrait a reecrire le catalogue.
 *
 * ⚠⚠ LES SLUGS ET LES CODES SKU NE SE TRADUISENT JAMAIS : `slug` est
 * l identifiant qui voyage dans les adresses et les filtres, et le code SKU de
 * couleur est IMPRIME sur les etiquettes collees sur la marchandise. Meme regle
 * que « SKU » dans `inventaire`.
 *
 * ⚠⚠ UNE SUPPRESSION BLOQUEE DOIT DIRE POURQUOI : « utilisent encore cette
 * valeur — retirez-la d abord des produits concernes ». Sans la seconde moitie,
 * on a un refus sans issue, et l on cherche un droit qu on a deja.
 *
 * ⚠ LE SEUIL A TROIS NIVEAUX, et la phrase qui les ordonne est la seule chose
 * qui explique pourquoi un produit ne suit pas le reglage general : « le plus
 * precis l emporte ». Elle ne se resume pas.
 *
 * ⚠ Les onglets sont des couples `{ cle anglaise, libelle }` (`sizes`,
 * `ageGroups`, `reachat`…) : la cle circule, seul le libelle s affiche.
 */

module.exports = {
  /* ── L EN-TETE ET LES ONGLETS ───────────────────────────────────────────── */
  'Attributs produits — Administration Sandriza': 'Product attributes — Sandriza Administration',
  'Attributs produits': 'Product attributes',
  'Attributs indisponibles': 'Attributes unavailable',
  'Lecture seule': 'Read only',
  'Tailles': 'Sizes',
  'Genres': 'Genders',
  'Groupes d’âge': 'Age groups',
  'Styles': 'Styles',
  'Couleurs': 'Colours',
  'Étiquettes': 'Labels',
  'Catégories': 'Categories',
  'Réachat': 'Reordering',
  'genre': 'gender',
  'groupe d’âge': 'age group',
  'style': 'style',

  /* ── LES REFUS ──────────────────────────────────────────────────────────── */
  'Votre rôle ne permet pas cette modification.': 'Your role does not allow this change.',
  'Remplissez les champs requis.': 'Fill in the required fields.',
  'Cet élément existe déjà.': 'This item already exists.',
  'C’est déjà une couleur intégrée.': 'That is already a built-in colour.',
  'Format hex invalide (ex : #FF6B6B).': 'Invalid hex format (e.g. #FF6B6B).',
  'Nom requis.': 'Name required.',
  'Champ vide.': 'Empty field.',
  'Identifiant (slug) requis.': 'Identifier (slug) required.',
  'Le code SKU doit faire au moins 2 lettres.': 'The SKU code must be at least 2 letters.',
  'Seuil invalide.': 'Invalid threshold.',
  'Limite invalide (minimum 1).': 'Invalid limit (minimum 1).',
  'Élément introuvable.': 'Item not found.',
  'Type inconnu.': 'Unknown type.',
  'Déjà à l’extrémité.': 'Already at the end.',
  'Aucune réponse de la fenêtre principale.': 'No answer from the main window.',
  /* ⚠⚠ UN REFUS AVEC SON ISSUE : sans la seconde moitie, on cherche un droit
     qu on a deja alors qu il suffit de retirer la valeur des produits. */
  'utilisent encore cette valeur — retirez-la d’abord des produits concernés.':
    'still use this value — remove it from the products concerned first.',
  'Le code «': 'The code «',
  '» est déjà pris par «': '» is already taken by «',
  '». Choisissez-en un autre.': '». Choose another one.',
  'Utilisée — suppression bloquée': 'In use — deletion blocked',
  'utilisée — bloqué': 'in use — blocked',
  'produit(s) — bloqué': 'product(s) — blocked',
  'non utilisée': 'not used',
  '— non utilisée': '— not used',
  'Aucun élément — cliquez sur + pour en ajouter.': 'No item — click + to add one.',

  /* ── LES TAILLES ────────────────────────────────────────────────────────── */
  'Ajouter une taille…': 'Add a size…',
  'Ex : 46, OS, 2XL…': 'E.g. 46, OS, 2XL…',
  'Ces tailles s’affichent dans le formulaire d’édition des produits.':
    'These sizes appear in the product editing form.',
  'Tapez une taille puis Entrée ou , — ou collez-en plusieurs séparées par des virgules. Retour arrière (champ vide) retire la dernière.':
    'Type a size then Enter or , — or paste several separated by commas. Backspace (empty field) removes the last one.',
  'tailles ajoutées.': 'sizes added.',
  'Taille ajoutée.': 'Size added.',
  'Cette taille existe déjà.': 'This size already exists.',
  'Taille retirée.': 'Size removed.',

  /* ── LES ETIQUETTES ─────────────────────────────────────────────────────── */
  /* ⚠ « Etiquette FR » et « Etiquette EN » sont les EN-TETES : ce qu on tape
     dessous est la donnee bilingue de la boutique, et elle ne bouge pas. */
  'Utilisés comme filtres dans la boutique et dans le formulaire produit.':
    'Used as filters in the shop and in the product form.',
  'Clé interne Étiquette FR Étiquette EN': 'Internal key Label FR Label EN',
  'Clé interne': 'Internal key',
  'Étiquette FR': 'Label FR',
  'Étiquette EN': 'Label EN',
  'aperçu à l’ajout': 'preview on adding',
  'Aucune étiquette — cliquez sur + pour en ajouter.': 'No label — click + to add one.',
  'Étiquette ajoutée.': 'Label added.',
  'Étiquette supprimée.': 'Label deleted.',
  'Attribut ajouté.': 'Attribute added.',
  'Attribut supprimé.': 'Attribute deleted.',

  /* ── LES COULEURS ───────────────────────────────────────────────────────── */
  'Aperçu Nom FR Nom EN Couleur': 'Preview Name FR Name EN Colour',
  'Aperçu': 'Preview',
  'Nom FR': 'Name FR',
  'Nom EN': 'Name EN',
  'Couleur': 'Colour',
  'Valeur hex': 'Hex value',
  'Ou chercher par nom 🔍 Chercher': 'Or search by name 🔍 Search',
  'Ou chercher par nom': 'Or search by name',
  '🔍 Chercher': '🔍 Search',
  '— cliquez pour choisir': '— click to choose',
  '— cliquez pour choisir.': '— click to choose.',
  '+ Ajouter la couleur': '+ Add the colour',
  'Ajouter une nouvelle couleur': 'Add a new colour',
  'Aucune couleur utilisée par un produit pour l’instant.':
    'No colour used by a product yet.',
  'Aucune couleur personnalisée. Ajoutez-en via « Ajouter une nouvelle couleur ».':
    'No custom colour. Add some with « Add a new colour ».',
  'Utilisées (': 'In use (',
  'Couleurs personnalisées (': 'Custom colours (',
  'Couleurs intégrées (': 'Built-in colours (',
  'Cliquez une couleur pour la sélectionner dans le formulaire d’ajout.':
    'Click a colour to select it in the add form.',
  '✏ Modifier': '✏ Edit',
  'Modifier la couleur': 'Edit the colour',
  'Annuler Enregistrer': 'Cancel Save',
  'Couleur «': 'Colour «',
  '» ajoutée.': '» added.',
  '» sélectionnée.': '» selected.',
  '» supprimée.': '» deleted.',
  'Couleur mise à jour.': 'Colour updated.',
  'Couleur supprimée.': 'Colour deleted.',
  'Entrez un nom de couleur d’abord.': 'Enter a colour name first.',
  'Couleur non trouvée. Entrez la valeur hex à la main.':
    'Colour not found. Enter the hex value by hand.',
  'Couleur trouvée :': 'Colour found:',

  /* ── LES CODES SKU DE COULEUR ───────────────────────────────────────────── */
  /* ⚠⚠ CE CODE EST IMPRIME SUR LES ETIQUETTES DE LA MARCHANDISE. « Les codes
     deja fixes ne bougent pas » evite de rendre des etiquettes collees fausses. */
  'Codes couleur — SKU de variante': 'Colour codes — variant SKU',
  'par plusieurs couleurs —': 'by several colours —',
  '. Ces variantes partagent le même code-barres.':
    '. Those variants share the same barcode.',
  'Attribuer des codes courts (': 'Assign short codes (',
  'Deux caractères distincts. Les codes déjà fixés ne bougent pas.':
    'Two distinct characters. Codes already set do not change.',
  'Code SKU de': 'SKU code for',
  'Code «': 'Code «',
  '» enregistré pour «': '» saved for «',

  /* ── LES CATEGORIES ─────────────────────────────────────────────────────── */
  'Aucune catégorie — cliquez sur + pour en créer une.':
    'No category — click + to create one.',
  'Couleur Nom affiché Nom EN Slug Code SKU': 'Colour Displayed name Name EN Slug SKU code',
  'Nom affiché': 'Displayed name',
  'Slug': 'Slug',
  'Code SKU': 'SKU code',
  'IA Photos Produits': 'AI Photos Products',
  'Catégorie «': 'Category «',
  '» créée (': '» created (',
  'Catégorie mise à jour.': 'Category updated.',

  /* ── LE REACHAT ─────────────────────────────────────────────────────────── */
  /* ⚠⚠ TROIS NIVEAUX, ET LE PLUS PRECIS L EMPORTE : c est la seule phrase qui
     explique pourquoi un produit ne suit pas le reglage general. */
  'Seuil général': 'General threshold',
  'Le seuil se règle à trois niveaux, le plus précis l’emporte : exception sur la variante, sinon seuil du produit, sinon celui-ci.':
    'The threshold is set at three levels, the most specific wins: an exception on the variant, otherwise the product’s threshold, otherwise this one.',
  'Actuellement :': 'Currently:',
  'son propre seuil,': 'its own threshold,',
  'Enregistrer le seuil': 'Save the threshold',
  'Seuil enregistré.': 'Threshold saved.',
  'Limite d’achat par commande': 'Purchase limit per order',
  'Enregistrer la limite': 'Save the limit',
  'Limite enregistrée.': 'Limit saved.',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════ */
  'Tapez une taille puis <strong>Entrée</strong> ou <strong>,</strong> — ou collez-en plusieurs séparées par des virgules. <strong>Retour arrière</strong> (champ vide) retire la dernière.':
    'Type a size then <strong>Enter</strong> or <strong>,</strong> — or paste several separated by commas. <strong>Backspace</strong> (empty field) removes the last one.',
  'Le seuil se règle à trois niveaux, <strong>le plus précis l’emporte</strong> : exception sur la variante, sinon seuil du produit, sinon celui-ci.':
    'The threshold is set at three levels, <strong>the most specific wins</strong>: an exception on the variant, otherwise the product’s threshold, otherwise this one.',
  ' par plusieurs couleurs</strong> — ': ' by several colours</strong> — ',

  /* ── LA LONGUE TRAINE ───────────────────────────────────────────────────── */
  'porté': 'carried',
  'dégradé': 'gradient',
  'utilisée': 'in use',
  'disponible': 'available',
  'enregistré': 'saved',
  'produit': 'product',

  /* ── LES MOITIES DE PHRASE, REPRISES EN ENTIER ─────────────────────────────
     ⚠⚠ TROIS LIBELLES ETAIENT COUPES EN DEUX par une cle trop COURTE deja
     posee : « Couleur » avait mordu dans « Couleur de l etiquette » et dans
     « Couleur de la categorie », « Nom FR » dans « Nom FR (ex: Coup de coeur) ».
     On lisait « Colour de l’étiquette » sur la page anglaise. La correction
     n est pas d ajouter une cle de plus, c est d ecrire LA PHRASE ENTIERE : une
     cle plus longue est essayee AVANT une cle plus courte. */
  'Couleur de l’étiquette': 'Label colour',
  'Couleur de la catégorie': 'Category colour',
  /* ⚠ L EXEMPLE RESTE FRANCAIS, ET C EST LE SENS DU CHAMP : ce champ contient le
     nom FRANCAIS de l etiquette — son voisin porte le nom anglais. Traduire
     l exemple apprendrait a ecrire de l anglais dans la case du francais. */
  'Nom FR (ex: Coup de cœur)': 'Name FR (e.g. Coup de cœur)',
  /* ⚠ ET LA FORME ANGLAISE SE DECLARE AUSSI. Elle garde l exemple francais —
     c est tout l objet de la ligne au-dessus — donc le banc du residuel y voit
     un « cœur » accentue sur une page anglaise, et il a raison de le voir. Une
     entree qui rend le MEME texte est la facon d ecrire « c est voulu ». */
  'Name FR (e.g. Coup de cœur)': 'Name FR (e.g. Coup de cœur)',

  /* ── LES MOTS NUS ET LES ATTRIBUTS DU SCRIPT ───────────────────────────────
     ⚠ « IA » se dit « AI » en anglais : deux lettres, et c est l en-tete d une
     colonne de cases a cocher qui decide du traitement des photos. */
  'IA': 'AI',
  'Produits': 'Products',
  'Nom': 'Name',
  'Ajouter': 'Add',
  'Chercher': 'Search',
  'Ajouter une taille': 'Add a size',
  'clé (ex: sport-luxe)': 'key (e.g. sport-luxe)',
  'Choisir la couleur au nuancier': 'Pick the colour from the palette',
  'Traitement par IA': 'AI processing',
  'Photos simples': 'Plain photos',

  /* ⚠⚠ L EXEMPLE D UN NOM DE COULEUR RESTE FRANCAIS — une DECISION, pas un
     oubli, et le banc ne l honore que si elle est ecrite. La question qui
     tranche est « qui LIT ce que l on tape ici ? » : une couleur personnalisee
     n a qu UN nom (au contraire d une categorie, qui en a deux), et ce nom-la
     paraît sur la fiche produit que la cliente lit. Un exemple anglais
     apprendrait a nommer les couleurs en anglais dans une boutique francaise. */
  'Ex: corail rosé': 'Ex: corail rosé',
  /* ⚠⚠⚠ « code » -> « code » A ETE RETIREE LE 2026-09-13, ET C EST LA CLE QU IL
     NE FAUT PAS REMETTRE. Elle rendait le MEME mot : elle ne changeait donc rien
     a l ecran, ni en francais ni en anglais, et aucun des 28 bancs ne pouvait la
     voir. Pendant ce temps le poseur l avait posee NEUF fois, et pas une seule
     sur du texte : un SELECTEUR CSS (`code{font:…}`), six NOMS DE BALISE
     (`<code>…</code>`), l IDENTIFIANT d un champ (`id="ic-code"`), et trois NOMS
     DE PROPRIETE dont un qui part par le pont (`{ name, code }` de
     `invmeta:codeSave`). Le jour ou quelqu un aurait ecrit une autre valeur : la
     mise en forme tombe, les balises deviennent inconnues, le champ ne se relit
     plus et le code SKU ne s enregistre plus — EN ANGLAIS SEULEMENT.
     ⚠ Le mot « code » s ecrit pareil dans les deux langues : il n a jamais eu
     besoin d entree. Une entree dont la valeur egale la cle ne se justifie que
     si le banc du residuel l exige — et il ne l exige que pour un mot qu il
     accuserait, ce qui n est pas le cas ici (« code » parait dans les valeurs
     anglaises du dictionnaire, donc le lexique l ecarte tout seul). */

  /* ── LE MOT SEUL (2026-09-13) ──────────────────────────────────────────────
     La pastille posée sur une variante sans code-barres propre. Le mot est le
     même dans les deux langues ; l'entrée existe pour que ce soit une DÉCISION,
     puisque le compteur voit maintenant les mots seuls. */
  'AUTO': 'AUTO',

  /* ══ LE PIED DE LISTE ET L EXPORT, ONGLET PAR ONGLET (2026-09-24) ══════════
     ⚠⚠ LES DEUX ALTERNATIVES EN ENTIER POUR CHACUN DES CINQ ONGLETS A LISTE.
     Ce fichier porte une fonction plur() qui fabrique le pluriel en ajoutant
     une lettre — elle est anterieure, et le depot a un banc contre ce patron
     (banc-pluriel-colle). Rien de neuf ne passe par elle.
     ⚠ Le singulier porte son ARTICLE : << une taille >> / << one size >>. Sans
     lui, le pied dirait << 1 sizes >>.
     ⚠ << reachat >> n a pas de ligne ici : ce sont deux champs de reglage, donc
     ni pied ni export — et rien a compter. */
  'une taille': 'one size',
  'tailles': 'sizes',
  'une étiquette': 'one label',
  'étiquettes': 'labels',
  'une couleur': 'one colour',
  'couleurs': 'colours',
  'une catégorie': 'one category',
  'catégories': 'categories',
  /* ⚠ LE MOT GENERIQUE SERT TROIS ONGLETS (genres, groupes d age, styles) : ils
     partagent une seule forme de table, donc un seul vocabulaire. C est deja le
     mot qu emploie leur etat vide (<< Aucun element >>). */
  'un élément': 'one item',
  'éléments': 'items',

  /* ── LES COLONNES QUI N EXISTENT QUE DANS LE FICHIER ────────────────────── */
  /* ⚠ A l ecran, une couleur integree et une personnalisee vivent dans DEUX
     sections ; le fichier les reunit, donc il lui faut une colonne qui dise
     laquelle est laquelle. */
  'Origine': 'Origin',
  'personnalisée': 'custom',
  'intégrée': 'built-in',
  /* ⚠ A l ecran c est une pastille << AUTO >> a cote du nom ; dans un tableur
     c est un critere sur lequel on filtre, donc une colonne Oui/Non. */
  'Code attribué automatiquement': 'Code assigned automatically',
  /* ⚠ Ce qu on annonce comme ecrit dans le message de szExporter. Volontairement
     neutre : cinq onglets partagent ce verbe, et nommer l onglet ici voudrait
     dire cinq phrases a tenir d accord avec cinq noms de fichier. */
  'La liste': 'The list',
};
