'use strict';

/*
 * IMPORT / EXPORT DE LA BOUTIQUE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LES NOMS DE COLONNES DU CSV NE SONT PAS ICI, ET C EST VOULU. `c.lbl` et
 * `c.aide` viennent du SERVEUR : ce sont les EN-TETES que le fichier doit
 * porter, donc un CONTRAT avec le tableur de l utilisateur. Les traduire dans
 * cette fenetre ferait sortir un fichier dont les en-tetes ne correspondraient
 * plus a ce que la relecture attend — un import qui ne reconnait plus rien, ou
 * pire, qui reconnait de travers.
 * ⚠ Meme raison pour les noms anglais deja acceptes a la relecture (`price`,
 * `sale price`, `qty`) : ce sont des mots du FICHIER, cites tels quels.
 *
 * ⚠⚠ CINQ PHRASES PROTEGENT LES DONNEES DE LA BOUTIQUE, et gardent leur fermete :
 *   · « rien n est ecrit avant l apercu et votre confirmation » ;
 *   · « aucun produit absent du fichier n est touche, et rien n est supprime » ;
 *   · « seules les colonnes presentes dans votre fichier sont touchees » ;
 *   · « une fiche qu un collegue est en train de modifier sera refusee et listee
 *     a la fin » ;
 *   · « ne fermez pas cette fenetre » pendant l application.
 *
 * ⚠⚠ ET UNE PHRASE PROTEGE LE SECRET COMMERCIAL : « donnees de marge — le
 * fichier ne devrait pas sortir de l entreprise ». Le cout d acquisition et le
 * motif de vente a perte sortent du fichier des qu on coche la case.
 *
 * ⚠ « Les avis ne partent pas tout seuls » : sans cette phrase, on croit les
 * clientes prevenues du retour d un article alors que personne n a rien envoye.
 */

module.exports = {
  /* ── L EN-TETE ──────────────────────────────────────────────────────────── */
  'Import / Export — Administration Sandriza': 'Import / Export — Sandriza Administration',
  'Import / Export de la boutique': 'Shop import / export',
  'Import / Export indisponible': 'Import / Export unavailable',
  'Lecture seule': 'Read only',
  '⬇ Exporter': '⬇ Export',
  '⬆ Importer': '⬆ Import',
  'Exporter': 'Export',
  'Importer': 'Import',

  /* ── LES REFUS ──────────────────────────────────────────────────────────── */
  'Un import est déjà en cours.': 'An import is already running.',
  'Coûts non relus depuis le serveur — décochez la colonne Coût, ou actualisez la fenêtre principale.':
    'Costs not re-read from the server — untick the Cost column, or refresh the main window.',
  'Aucun fichier analysé.': 'No file analysed.',
  'Fichier refusé.': 'File refused.',
  'Fichier illisible.': 'File unreadable.',
  'Élément introuvable.': 'Item not found.',
  'Aucune réponse de la fenêtre principale.': 'No answer from the main window.',
  'Cette version de l’application ne sait pas encore écrire le fichier ici.':
    'This version of the application cannot write the file here yet.',
  'Fermez et relancez l’application : elle se met à jour au démarrage.':
    'Close and restart the application: it updates itself on startup.',
  'Le fichier n’a pas été reçu. Fermez et relancez l’application.':
    'The file was not received. Close and restart the application.',
  'Écriture impossible :': 'Cannot write:',
  'Fichier trop volumineux (8 Mo maximum).': 'File too large (8 MB maximum).',
  'Lecture du fichier impossible.': 'The file could not be read.',
  'Rien à appliquer.': 'Nothing to apply.',

  /* ── LE DOSSIER DE SORTIE ───────────────────────────────────────────────── */
  'Documents › SANDRIZA › Exports': 'Documents › SANDRIZA › Exports',
  'Dernier fichier écrit :': 'Last file written:',
  'Ouvre ce dossier': 'Opens this folder',
  'Les fichiers sortent dans': 'Files come out in',
  'Votre dossier': 'Your folder',
  'ne répond pas — clé retirée, lecteur réseau déconnecté':
    'is not answering — stick removed, network drive disconnected',
  'ou dossier renommé. Les fichiers sortent dans le dossier standard en attendant :':
    'or folder renamed. Files come out in the standard folder meanwhile:',
  'votre choix est gardé et redeviendra effectif dès qu’il réapparaîtra.':
    'your choice is kept and takes effect again as soon as it comes back.',
  'Revenir au dossier standard': 'Back to the standard folder',
  'Votre dossier ne répondait pas.': 'Your folder was not answering.',
  'Cette version de l’application ne sait pas encore changer le dossier des exports.':
    'This version of the application cannot change the exports folder yet.',
  'Les fichiers sortiront maintenant dans': 'Files will now come out in',
  'Impossible d’écrire dans': 'Cannot write in',
  '. Le dossier n’a pas été changé — choisissez-en un autre,':
    '. The folder was not changed — choose another one,',
  'ou demandez les droits d’écriture sur celui-là.': 'or ask for write access on that one.',
  'Le dossier n’a pas pu être changé :': 'The folder could not be changed:',
  'Retour au dossier standard :': 'Back to the standard folder:',
  'Le retour au dossier standard a échoué :': 'Going back to the standard folder failed:',
  'Le repli n a pas pu être mémorisé :': 'The fallback could not be remembered:',
  'enregistré :': 'saved:',
  '— dans': '— in',

  /* ── L EXPORT ───────────────────────────────────────────────────────────── */
  /* ⚠⚠ LA CASE DU COUT FAIT SORTIR DES DONNEES DE MARGE. La phrase le dit. */
  'Inclure le coût d’acquisition et le motif de vente à perte':
    'Include the purchase cost and the sale-at-a-loss reason',
  'Données de marge — le fichier ne devrait pas sortir de l’entreprise.':
    'Margin data — the file should not leave the company.',
  'Coûts non relus : actualisez la fenêtre principale pour activer cette option.':
    'Costs not re-read: refresh the main window to enable this option.',
  'Feuille': 'Sheet',
  'Catalogue': 'Catalogue',
  'Inventaire': 'Inventory',
  'Une ligne par produit : prix, soldes, noms, catégorie, étiquettes, tailles et couleurs.':
    'One row per product: prices, sale prices, names, category, labels, sizes and colours.',
  'Une ligne par variante taille × couleur : quantité et emplacement d’entrepôt.':
    'One row per size × colour variant: quantity and warehouse location.',
  'Séparateur de colonnes': 'Column separator',
  'Point-virgule': 'Semicolon',
  'Virgule': 'Comma',
  'Excel en français ouvre directement en colonnes ; les montants s’écrivent « 89,00 ».':
    'French Excel opens straight into columns; amounts are written « 89,00 ».',
  'Google Sheets et les outils anglophones ; les montants s’écrivent « 89.00 ».':
    'Google Sheets and English-language tools; amounts are written « 89.00 ».',
  'Inclure les produits hors vente': 'Include products not for sale',
  '⬇ Sortir le CSV': '⬇ Export the CSV',
  'Modèle vide (en-têtes seuls)': 'Empty template (headers only)',
  'Préparation du fichier…': 'Preparing the file…',
  'Préparation du modèle': 'Preparing the template',
  '(en-têtes seuls)': '(headers only)',

  /* ── LE DETAIL DES COLONNES ─────────────────────────────────────────────── */
  /* ⚠ Les NOMS des colonnes viennent du serveur — voir la fiche en tete. Seuls
     les pastilles et le texte d explication sont ici. */
  'Colonnes de la feuille': 'Columns of the sheet',
  '▸ Afficher le détail des colonnes': '▸ Show the column detail',
  '▾ Masquer le détail des colonnes': '▾ Hide the column detail',
  'Colonne Rôle': 'Column Role',
  'clé': 'key',
  'information': 'information',
  'requise à la création': 'required when creating',
  'donnée de marge': 'margin data',
  'À l’import, seules les colonnes présentes dans votre fichier sont touchées :':
    'On import, only the columns present in your file are touched:',
  'un fichier « SKU ; Prix » ne change que le prix. Les colonnes information sont exportées pour vous repérer et ignorées à la relecture.':
    'a « SKU ; Price » file only changes the price. The information columns are exported to help you find your way and ignored when read back.',

  /* ── L IMPORT ───────────────────────────────────────────────────────────── */
  'Fichier CSV': 'CSV file',
  'La feuille (catalogue ou inventaire) et le séparateur sont':
    'The sheet (catalogue or inventory) and the separator are',
  'reconnus automatiquement d’après les en-têtes, qui acceptent les accents, les majuscules':
    'recognised automatically from the headers, which accept accents, capitals',
  'et les noms anglais courants ( price , sale price , qty …).':
    'and the usual English names ( price , sale price , qty …).',
  'Maximum 8 Mo et 5000 lignes. Rien n’est écrit avant l’aperçu et votre confirmation.':
    'Maximum 8 MB and 5000 rows. Nothing is written before the preview and your confirmation.',
  'Partir d’un modèle': 'Start from a template',
  'Un fichier CSV avec les bons en-têtes, dans le bon ordre ,':
    'A CSV file with the right headers, in the right order ,',
  'et rien d’autre : remplissez une ligne par produit (ou par variante) et remontez-le ici.':
    'and nothing else: fill one row per product (or per variant) and send it back here.',
  'Le séparateur suit ce que vous avez choisi dans Exporter (actuellement':
    'The separator follows what you chose under Export (currently',
  '⬇ Modèle catalogue': '⬇ Catalogue template',
  '⬇ Modèle inventaire': '⬇ Inventory template',
  'Catalogue : une ligne par produit (prix, noms, catégorie, étiquettes).':
    'Catalogue: one row per product (prices, names, category, labels).',
  'Inventaire : une ligne par variante taille × couleur (quantité, entrepôt).':
    'Inventory: one row per size × colour variant (quantity, warehouse).',
  'Vous avez déjà des fiches ? Passez plutôt par l’onglet':
    'Do you already have records? Go through the',
  'Exporter : le fichier obtenu se remonte tel quel après modification,':
    'Export tab instead: the file you get goes back up as it is after editing,',
  'et il porte déjà vos données.': 'and it already carries your data.',
  'Choisir un autre fichier': 'Choose another file',
  'Importer un autre fichier': 'Import another file',
  'Analyse du fichier…': 'Analysing the file…',
  'Aperçu prêt. Rien n’est encore écrit.': 'Preview ready. Nothing is written yet.',

  /* ── L APERCU ───────────────────────────────────────────────────────────── */
  'À créer': 'To create',
  'À modifier': 'To change',
  '← Précédent': '← Previous',
  'Suivant →': 'Next →',
  'Aucune ligne dans ce filtre.': 'No row in this filter.',
  'Colonne(s) non reconnue(s), donc ignorée(s) :': 'Column(s) not recognised, so ignored:',
  'seront téléchargées depuis les adresses du fichier et copiées dans votre stockage — la boutique':
    'will be downloaded from the addresses in the file and copied into your storage — the shop',
  'ne pointera jamais sur le site du fournisseur. Une photo introuvable n’empêche pas le reste de sa ligne de passer.':
    'will never point at the supplier’s site. A photo that cannot be found does not stop the rest of its row going through.',
  'rien à écrire': 'nothing to write',
  '⬇ Aperçu en CSV': '⬇ Preview as CSV',
  'Ligne SKU': 'Row SKU',
  'État Ce qui change': 'Status What changes',
  'Ligne': 'Row',
  'État': 'Status',
  'Ce qui change': 'What changes',
  /* ⚠⚠ CES DEUX PHRASES DISENT CE QUI NE SERA PAS TOUCHE. Sans elles, on n ose
     pas importer — ou l on importe en croyant remplacer toute la boutique. */
  'Les lignes en erreur et inchangées sont ignorées. Aucun produit n’est supprimé,':
    'Rows in error and unchanged rows are ignored. No product is deleted,',
  'et aucun produit absent du fichier n’est touché.':
    'and no product missing from the file is touched.',
  'Aucun produit absent du fichier n’est touché, et rien n’est supprimé. Une fiche':
    'No product missing from the file is touched, and nothing is deleted. A record',
  'qu’un collègue est en train de modifier sera refusée et listée à la fin.':
    'a colleague is editing will be refused and listed at the end.',
  'Appliquer l’import': 'Apply the import',
  '— feuille': '— sheet',
  '— hors vente, à relire et publier ensuite': '— not for sale, to review and publish afterwards',
  'depuis des sites externes et copiée': 'from external sites and copied',
  ': rien ne sera écrit': ': nothing will be written',
  'en erreur : ignorée': 'in error: ignored',
  'Import en cours — ne fermez pas cette fenêtre.': 'Import running — do not close this window.',
  'Application en cours, ne fermez pas cette fenêtre…': 'Applying, do not close this window…',

  /* ── LE COMPTE RENDU ────────────────────────────────────────────────────── */
  'Photos reprises': 'Photos taken over',
  'Photos non reprises — le reste de la ligne est passé':
    'Photos not taken over — the rest of the row went through',
  'Ligne SKU Adresse Motif': 'Row SKU Address Reason',
  'Adresse': 'Address',
  'Motif': 'Reason',
  'créés sont hors vente : ils attendent dans Inventaire . Ajoutez leurs photos, puis mettez-les en vente.':
    'created are not for sale: they are waiting in Inventory . Add their photos, then put them on sale.',
  'de l’historique du produit.': 'of the product history.',
  'Lignes refusées — rien n’a été écrit pour celles-ci':
    'Rows refused — nothing was written for these',
  'Ligne SKU Produit Motif': 'Row SKU Product Reason',
  'Produit': 'Product',
  'Un collègue vient de modifier :': 'A colleague has just changed:',
  '. Valeur actuelle :': '. Current value:',
  '⬇ Télécharger le rapport': '⬇ Download the report',

  /* ── LES AVIS « AVISEZ-MOI » ────────────────────────────────────────────── */
  /* ⚠⚠ « LES AVIS NE PARTENT PAS TOUT SEULS » : sans cette phrase on croit les
     clientes prevenues alors que personne n a rien envoye. */
  '🔔 Demandes « avisez-moi » satisfaites': '🔔 « Notify me » requests fulfilled',
  'Demandes « avisez-moi » satisfaites': '« Notify me » requests fulfilled',
  'Des clients attendaient le retour de ces articles. Les avis ne partent pas tout seuls.':
    'Customers were waiting for these items to come back. The notices do not go out on their own.',
  'Envoyer les avis (': 'Send the notices (',
  'Envoi des avis…': 'Sending the notices…',
  'avis envoyé': 'notice sent',
  'Aucun avis envoyé — voir la configuration des courriels.':
    'No notice sent — see the email configuration.',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════
   * Ici le <strong> tombe au MILIEU de presque chaque avis — et jamais la ou le
   * texte rendu le laisse croire. On recopie la source telle qu elle est.
   * ⚠ `<em>price</em>` : les noms de colonnes ANGLAIS sont cites tels quels,
   * c est le contrat du fichier. Ils ne bougent pas, meme en anglais.
   * ══════════════════════════════════════════════════════════════════════════ */
  'ou dossier renommé. Les fichiers sortent dans le dossier standard <strong>en attendant</strong> : ':
    'or folder renamed. Files come out in the standard folder <strong>meanwhile</strong>: ',
  'À l’import, <strong>seules les colonnes présentes dans votre fichier sont touchées</strong> : ':
    'On import, <strong>only the columns present in your file are touched</strong>: ',
  'un fichier « SKU ; Prix » ne change que le prix. Les colonnes <em>information</em> sont exportées pour vous repérer et ignorées à la relecture.':
    'a « SKU ; Price » file only changes the price. The <em>information</em> columns are exported to help you find your way and ignored when read back.',
  '<strong>reconnus automatiquement</strong> d’après les en-têtes, qui acceptent les accents, les majuscules ':
    '<strong>recognised automatically</strong> from the headers, which accept accents, capitals ',
  'et les noms anglais courants (<em>price</em>, <em>sale price</em>, <em>qty</em>…).<br>':
    'and the usual English names (<em>price</em>, <em>sale price</em>, <em>qty</em>…).<br>',
  'Maximum 8 Mo et 5000 lignes. <strong>Rien n’est écrit avant l’aperçu et votre confirmation.</strong>':
    'Maximum 8 MB and 5000 rows. <strong>Nothing is written before the preview and your confirmation.</strong>',
  'Un fichier CSV avec les <strong>bons en-têtes, dans le bon ordre</strong>, ':
    'A CSV file with the <strong>right headers, in the right order</strong>, ',
  'Le séparateur suit ce que vous avez choisi dans <strong>Exporter</strong> (actuellement ':
    'The separator follows what you chose under <strong>Export</strong> (currently ',
  'la virgule': 'the comma',
  'le point-virgule': 'the semicolon',
  '<strong>Catalogue</strong> : une ligne par produit (prix, noms, catégorie, étiquettes). ':
    '<strong>Catalogue</strong>: one row per product (prices, names, category, labels). ',
  '<strong>Inventaire</strong> : une ligne par variante taille × couleur (quantité, entrepôt).':
    '<strong>Inventory</strong>: one row per size × colour variant (quantity, warehouse).',
  '<strong>Exporter</strong> : le fichier obtenu se remonte tel quel après modification,':
    '<strong>Export</strong>: the file you get goes back up as it is after editing,',
  'Colonne(s) non reconnue(s), donc <strong>ignorée(s)</strong> : ':
    'Column(s) not recognised, so <strong>ignored</strong>: ',
  'créés sont hors vente : ils attendent dans <strong>Inventaire</strong>. Ajoutez leurs photos, puis mettez-les en vente.':
    'created are not for sale: they are waiting in <strong>Inventory</strong>. Add their photos, then put them on sale.',
  'Demandes « avisez-moi » satisfaites': '« Notify me » requests fulfilled',

  /* ── LES EN-TETES, UNE CELLULE A LA FOIS ────────────────────────────────── */
  'Colonne': 'Column',
  'Rôle': 'Role',
  'SKU': 'SKU',

  /* ── LES FILTRES ET LES TUILES DU COMPTE RENDU ──────────────────────────── */
  'Tout': 'All',
  'Erreurs': 'Errors',
  'Inchangées': 'Unchanged',
  'Inchangée': 'Unchanged',
  'Créés': 'Created',
  'Modifiés': 'Changed',
  'Refusés': 'Refused',
  'Écrit': 'Written',
  'Échec': 'Failed',
  'échec': 'failed',
  'créé': 'created',
  'modifiée': 'changed',
  'téléchargée': 'downloaded',
  'enregistrée': 'saved',
  'ignorées': 'ignored',
  'ignorée': 'ignored',
  /* ⚠ DEUX <strong> DANS LA MEME PHRASE : « hors vente » ET « Inventaire ». Ma
     cle n en portait qu un, elle n a rien attrape, et « Inventaire » s est
     traduit seul au milieu du francais. La source decide, toujours. */
  ' créés sont <strong>hors vente</strong> : ils attendent dans <strong>Inventaire</strong>. Ajoutez leurs photos, puis mettez-les en vente.':
    ' created are <strong>not for sale</strong>: they are waiting in <strong>Inventory</strong>. Add their photos, then put them on sale.',
  'hors vente': 'not for sale',
  'Modèle ': 'Template ',
  'refusée': 'refused'
};
