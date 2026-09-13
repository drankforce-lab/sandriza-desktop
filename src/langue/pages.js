'use strict';

/*
 * PAGES DU SITE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN EDITE CE QUE LA CLIENTE LIT. C est ce qui le rend different de
 * tous les autres : la frontiere entre l INTERFACE et la DONNEE y passe au
 * milieu de la meme phrase.
 *   · « Nos politiques », « Guide des tailles », « En vedette » sont des
 *     ONGLETS de l administration — ils nomment l ecran qu on edite. Traduits.
 *   · Le TITRE de la page FAQ, le NOM et les EN-TETES d un guide des tailles
 *     sont des DONNEES — s ils ne sont pas changes, c est eux qui paraissent
 *     sur la boutique. Ils vivent dans `SZ_DONNEES` et ne se traduisent JAMAIS.
 *
 * ⚠⚠ LE CAS QUI A OBLIGE A INVENTER LA DECLARATION. « Foire aux questions »
 * etait A LA FOIS l en-tete de la carte (interface) ET le titre par defaut de la
 * page (donnee), mot pour mot. Le poseur ne peut pas distinguer deux roles d une
 * meme chaine : il aurait enveloppe les deux, et une boutique francaise se
 * serait retrouvee avec « Frequently asked questions » ecrit dans sa base le
 * jour ou quelqu un ouvre l ecran en anglais. L en-tete nomme maintenant l ecran
 * (« Page FAQ », comme « Page Contact » a cote) et le defaut est declare.
 * ⚠ « Taille » est le meme cas, en plus discret : libelle de la barre de
 * l editeur riche d un cote, en-tete par defaut d un guide de l autre.
 *
 * ⚠ LES NOMS DE POLICE ne se traduisent pas — Inter, Georgia, Arial, Courier
 * sont des noms propres. Leur entree rend le meme texte : c est la facon de dire
 * « j ai regarde ». ⚠ Sans danger ici, parce que c est le `value=` (la pile CSS)
 * qui part dans la page, et `banc-langue-donnees` le protege deja.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Pages du site — Administration Sandriza': 'Site pages — Sandriza Administration',
  'Pages du site': 'Site pages',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can view, not change.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux pages du site.':
    'Your role does not give access to the site pages.',
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  'Titre et slug sont requis.': 'Title and slug are required.',
  'Ce slug est déjà utilisé par une autre page.': 'This slug is already used by another page.',
  'Élément introuvable.': 'Item not found.',
  'Cette page est protégée et ne peut pas être supprimée.':
    'This page is protected and cannot be deleted.',

  /* ── LES ONGLETS ────────────────────────────────────────────────────────── */
  'Liste': 'List',
  'Contact': 'Contact',
  'Nos politiques': 'Our policies',
  'Guide des tailles': 'Size guide',
  'En vedette': 'Featured',

  /* ── LA LISTE DES PAGES ─────────────────────────────────────────────────── */
  'Contactez-nous': 'Contact us',
  /* ⚠ La majuscule de « Tailles » est celle de la ligne du tableau ; l onglet
     s ecrit autrement. Les deux existent dans la source, les deux sont ici. */
  'Guide des Tailles': 'Size Guide',
  'Menu Vêtements — En vedette': 'Clothing menu — Featured',
  '＋ Nouvelle page': '＋ New page',
  'Toutes les pages': 'All the pages',
  ' page(s)': ' page(s)',
  'Page': 'Page',
  'Route': 'Route',
  'Type': 'Type',
  'Pied de page': 'Footer',
  'Page Route Type Pied de page': 'Page Route Type Footer',
  'Intégrée': 'Built in',
  'Modifier': 'Edit',
  'Supprimer': 'Delete',
  '✓ Confirmer': '✓ Confirm',
  'Pied de page mis à jour.': 'Footer updated.',
  'Cliquez encore pour supprimer cette page.': 'Click again to delete this page.',
  'Page supprimée.': 'Page deleted.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',
  'Ouverture de la page…': 'Opening the page…',
  /* ⚠ Le libellé du brouillon : c est lui qui s affiche dans « une saisie non
     terminée sur Une page ». */
  'Une page': 'A page',

  /* ── L EDITEUR D UNE PAGE ───────────────────────────────────────────────── */
  'Nouvelle page': 'New page',
  'Modifier — ': 'Edit — ',
  'Modifier —': 'Edit —',
  'Fermer': 'Close',
  'Titre ': 'Title ',
  'Titre *': 'Title *',
  'Slug (URL) ': 'Slug (URL) ',
  'Slug (URL) *': 'Slug (URL) *',
  'Slug protégé (Loi 25)': 'Protected slug (Law 25)',
  'Sous-titre': 'Subtitle',
  'Libellé pied de page': 'Footer label',
  ' Afficher dans le pied de page': ' Show in the footer',
  'Afficher dans le pied de page': 'Show in the footer',
  'Contenu de la page': 'Page content',
  'Annuler': 'Cancel',
  'Créer la page': 'Create the page',
  'Enregistrer': 'Save',
  'Enregistrement… (dépôt des images dans le nuage si besoin)':
    'Saving… (uploading the images to the cloud if needed)',
  'Page créée.': 'Page created.',
  'Page modifiée.': 'Page changed.',

  /* ── LA FAQ ─────────────────────────────────────────────────────────────── */
  /* ⚠ « Page FAQ » nomme l ECRAN. Le TITRE de la page, lui, est une donnee —
     voir SZ_DONNEES dans la fenetre. */
  'Page FAQ': 'FAQ page',
  'Titre de la page': 'Page title',
  'Questions & réponses': 'Questions & answers',
  ' entrée(s)': ' entry(ies)',
  '＋ Ajouter': '＋ Add',
  'Aucune question.': 'No question.',
  'Question': 'Question',
  'Réponse': 'Answer',
  'FAQ enregistrée.': 'FAQ saved.',

  /* ── LA PAGE CONTACT ET LA BOITE DE RECEPTION ───────────────────────────── */
  'Page Contact': 'Contact page',
  '📬 Messages': '📬 Messages',
  'Courriel de contact': 'Contact email',
  'Téléphone': 'Phone',
  'Heures d’ouverture': 'Opening hours',
  'Texte d’introduction': 'Introduction text',
  'Page Contact enregistrée.': 'Contact page saved.',
  'Messages reçus': 'Messages received',
  'Chargement…': 'Loading…',
  'Messages reçus Fermer Chargement…': 'Messages received Close Loading…',
  'Tout supprimer': 'Delete all',
  /* ⚠ CETTE PHRASE RASSURE SUR CE QUI N EST PAS PERDU : sans elle, un echec
     reseau se lit comme une boite videe. */
  '⚠ Relecture depuis le nuage impossible (réseau) — rien n’est perdu. Rouvrez pour réessayer.':
    '⚠ Cannot re-read from the cloud (network) — nothing is lost. Reopen to try again.',
  'Relecture depuis le nuage impossible (réseau) — rien n’est perdu. Rouvrez pour réessayer.':
    'Cannot re-read from the cloud (network) — nothing is lost. Reopen to try again.',
  'Aucun message reçu.': 'No message received.',
  'Boîte vidée.': 'Inbox emptied.',

  /* ── NOS POLITIQUES ─────────────────────────────────────────────────────── */
  'Retours & échanges': 'Returns & exchanges',
  'Expédition & livraison': 'Shipping & delivery',
  'Codes promotionnels': 'Promo codes',
  'Modifications non enregistrées': 'Unsaved changes',
  'Titre de la section': 'Section title',
  'Contenu de la section': 'Section content',
  'Section enregistrée.': 'Section saved.',
  'Section vide.': 'Empty section.',

  /* ── LA BARRE DE L EDITEUR RICHE ────────────────────────────────────────── */
  'Format du paragraphe': 'Paragraph format',
  'Format': 'Format',
  'Paragraphe': 'Paragraph',
  'Titre H2': 'Heading H2',
  'Titre H3': 'Heading H3',
  'Citation': 'Quote',
  'Paragraphe Titre H2': 'Paragraph Heading H2',
  'Titre H3 Citation': 'Heading H3 Quote',
  /* ⚠ DES NOMS PROPRES : une police ne se traduit pas. L entree rend le meme
     texte — c est la facon d ecrire « j ai regarde ». */
  'Police': 'Font',
  'Inter': 'Inter',
  'Georgia': 'Georgia',
  'Arial': 'Arial',
  'Courier': 'Courier',
  'Inter Georgia': 'Inter Georgia',
  'Arial Courier': 'Arial Courier',
  'Taille du texte': 'Text size',
  'Taille': 'Size',
  'Très petit': 'Very small',
  'Petit': 'Small',
  'Normal': 'Normal',
  'Grand': 'Large',
  'Très grand': 'Very large',
  'Énorme': 'Huge',
  'Très petit Petit': 'Very small Small',
  'Normal Grand': 'Normal Large',
  'Très grand Énorme': 'Very large Huge',
  'Gras (Ctrl+B)': 'Bold (Ctrl+B)',
  'Italique (Ctrl+I)': 'Italic (Ctrl+I)',
  'Souligné (Ctrl+U)': 'Underline (Ctrl+U)',
  'Liste à puces': 'Bulleted list',
  'Liste numérotée': 'Numbered list',
  'Insérer un lien': 'Insert a link',
  /* ⚠ LES PHRASES ENTIERES : « Insérer » seul mordait dans les trois suivantes
     et donnait « Insert une variable » sur la page anglaise. */
  'Insérer une variable': 'Insert a variable',
  'Insérer une image': 'Insert an image',
  'Insérer un tableau': 'Insert a table',
  'Variables': 'Variables',
  'Image': 'Image',
  'Tableau': 'Table',
  'Aperçu avec les variables résolues': 'Preview with the variables resolved',
  'Aperçu': 'Preview',
  'Plein écran': 'Full screen',
  'Personnalisée': 'Custom',
  'En-tête de la colonne ': 'Column header ',
  'En-tête de la colonne': 'Column header',
  'Ajout…': 'Adding…',
  'Retrait…': 'Removing…',
  /* ⚠⚠ CES DEUX EXEMPLES RESTENT FRANCAIS, ET C EST UNE DECISION. Le libelle
     qu on tape ici DEVIENT une entree du menu que la cliente lit ; l adresse est
     une route du site. Un exemple anglais apprendrait a nommer les entrees du
     menu en anglais dans une boutique francaise — meme raison que le « Titre
     affiché » de recommandations. */
  'ex. Meilleures ventes': 'ex. Meilleures ventes',
  'ex. #shop?cat=robes': 'ex. #shop?cat=robes',
  'Retirer le lien': 'Remove the link',
  'Effacer la mise en forme': 'Clear the formatting',
  'Adresse du lien': 'Link address',
  'Insérer': 'Insert',
  'Annuler Insérer': 'Cancel Insert',
  'Image trop grande (600 Ko maximum).': 'Image too large (600 KB maximum).',
  'Image insérée — elle sera déposée dans le nuage à l’enregistrement.':
    'Image inserted — it will be uploaded to the cloud when you save.',
  'Choisissez les dimensions': 'Choose the dimensions',
  '＋ Ligne': '＋ Row',
  '－ Ligne': '－ Row',
  '＋ Colonne': '＋ Column',
  '－ Colonne': '－ Column',
  '＋ Ligne － Ligne': '＋ Row － Row',
  '＋ Colonne － Colonne': '＋ Column － Column',
  'Supprimer le tableau': 'Delete the table',
  'Un tableau garde au moins une ligne.': 'A table keeps at least one row.',
  'Un tableau garde au moins une colonne.': 'A table keeps at least one column.',

  /* ── LES VARIABLES DE CONTENU ───────────────────────────────────────────── */
  'Variables disponibles': 'Available variables',
  'Variables disponibles Fermer': 'Available variables Close',
  'Elles sont remplacées par la vraie valeur au moment de l’affichage sur la boutique. Cliquez pour insérer à la position du curseur.':
    'They are replaced by the real value when the storefront displays them. Click to insert at the cursor.',
  'Aucune variable.': 'No variable.',
  'Aperçu du contenu': 'Content preview',
  'Résolution des variables…': 'Resolving the variables…',

  /* ── LE GUIDE DES TAILLES ───────────────────────────────────────────────── */
  'Aucun guide.': 'No guide.',
  '＋ Ajouter un guide': '＋ Add a guide',
  /* ⚠ L etiquette d une case du tableau porte sa position, pas son contenu. */
  'Ligne ': 'Row ',
  ', colonne ': ', column ',
  ', colonne': ', column',
  'Guide des tailles enregistré.': 'Size guide saved.',

  /* ── LE MENU EN VEDETTE ─────────────────────────────────────────────────── */
  'Les 4 sections du méga-menu « Vêtements » sont fixes. Vous pouvez ajouter ou retirer des liens dans la section « En vedette ».':
    'The 4 sections of the « Clothing » mega menu are fixed. You can add or remove links in the « Featured » section.',
  'Libellé': 'Label',
  'Lien': 'Link',
  'Ajouter': 'Add',
  'Lien Ajouter': 'Link Add',
  'Aucun lien — la section sera vide dans le menu.':
    'No link — the section will be empty in the menu.',
  'Libellé et lien requis.': 'Label and link required.',
  'Lien ajouté.': 'Link added.',
  'Lien retiré.': 'Link removed.',

  /* ── LES MOTS SEULS (2026-09-13) ───────────────────────────────────────────
     ⚠ « FAQ » est le sigle de l'ONGLET, pas le titre par défaut de la page —
     celui-là est une DONNÉE, déclarée dans SZ_DONNEES et laissée intacte. */
  'FAQ': 'FAQ',
  'Nouveau': 'New'
};
