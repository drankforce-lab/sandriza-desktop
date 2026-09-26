'use strict';

/*
 * EXPLORATEUR DE PHOTOS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ DEUX GESTES DE CET ECRAN CHANGENT CE QUE LA BOUTIQUE MONTRE, et leurs
 * explications sont longues parce qu elles doivent l etre. Les raccourcir en
 * traduisant reviendrait a retirer le seul endroit ou elles sont dites :
 *
 *   · REVENIR EN ARRIERE — « aucun credit n est depense : l image d avant est
 *     deja rangee, on ne fait que la remettre en place », et surtout « UN SEUL
 *     PAS en arriere est conserve par photo : une photo passee par deux
 *     traitements ne remonte qu au precedent, pas a l originale ».
 *   · METTRE A JOUR LA FICHE PRODUIT — « c est ce que la boutique affichera —
 *     la photo du produit change POUR DE BON, EN LIGNE ».
 *
 * ⚠⚠ ET UNE MISE EN GARDE QUI EVITE DE METTRE UN VETEMENT A LA PLACE D UN
 * AUTRE : une photo rattachee avant la 3.49 dont la fiche porte plusieurs
 * images est laissee de cote, parce qu on ne peut pas savoir laquelle lui
 * appartient. Cette phrase-la ne se resume pas.
 *
 * ⚠ ON NE TRADUIT QUE CE QUI SE LIT : le nom d une photo, son code, le nom du
 * produit lie et le nom d un lot d import viennent de la photothèque.
 */

module.exports = {
  /* ⚠⚠ LES DEUX FORMES EN ENTIER — voir tools/banc-pluriel-colle.js. La fenetre
     ne colle plus de « s » a un mot traduit : elle CHOISIT entre deux phrases
     ecrites ici, parce qu en anglais le pluriel n est pas une lettre de plus. */
  'photo': 'photo',
  'photos': 'photos',
  'choisie': 'chosen',
  'choisies': 'chosen',
  'photo revenue': 'photo returned',
  'photos revenues': 'photos returned',
  'n’avait rien à annuler.': 'had nothing to undo.',
  'n’avaient rien à annuler.': 'had nothing to undo.',
  'photo n’est rattachée à aucun article et ne bougera pas.':
    'photo is attached to no item and will not move.',
  'photos ne sont rattachées à aucun article et ne bougeront pas.':
    'photos are attached to no item and will not move.',
  'sélectionnée': 'selected',
  'sélectionnées': 'selected',
  'photo envoyée': 'photo sent',
  'photos envoyées': 'photos sent',
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Explorateur de photos — Administration Sandriza':
    'Photo browser — Sandriza Administration',
  'Explorateur de photos': 'Photo browser',
  'Lecture de la photothèque…': 'Reading the media library…',
  'Cliquez une photo pour la voir ici.': 'Click a photo to see it here.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Aucune session ouverte dans l’application.': 'No session open in the application.',
  'Votre rôle ne donne pas accès à la photothèque.':
    'Your role does not give access to the media library.',
  'La photothèque n’a pas pu être chargée.': 'The media library could not be loaded.',
  'Aucune photo choisie.': 'No photo selected.',
  'Toutes ces photos ont déjà ce traitement.': 'All these photos already have this treatment.',

  /* ── LES FILTRES ET LE TRI ──────────────────────────────────────────────── */
  'Traitement — tous': 'Treatment — all',
  'Sans « ': 'Without « ',
  'Sans «': 'Without «',
  'Tous les lots': 'All the batches',
  'Ordre de tri': 'Sort order',
  'Rechercher (nom, code, produit, ': 'Search (name, code, product, ',
  'Rechercher (nom, code, produit, SKU)…': 'Search (name, code, product, SKU)…',
  'Filtrer les photos sans un traitement donné': 'Filter photos without a given treatment',
  'Affichage en liste': 'List view',
  'Affichage en vignettes': 'Thumbnail view',
  'Déjà traitée': 'Already processed',
  'Cocher toute la page': 'Check the whole page',
  'Porter l’image courante dans la fiche de l’article — c’est ce que la boutique montrera':
    'Carry the current image into the item’s page — that is what the storefront will show',
  ' envoyée': ' sent',
  'envoyée': 'sent',
  'Plus récentes': 'Most recent',
  'Code': 'Code',
  'Nom': 'Name',
  'Liées d’abord': 'Linked first',
  'Plus lourdes': 'Heaviest',

  /* ── LES PASTILLES ET LES TRAITEMENTS ───────────────────────────────────── */
  /* ⚠ La forme SOURCE porte l espace avant le nom du traitement ; la forme
     RENDUE, elle, s arrete au chevron — c est celle que le compteur lit. */
  'Rétablir « ': 'Restore « ',
  'Annuler « ': 'Undo « ',
  'Rétablir «': 'Restore «',
  'Annuler «': 'Undo «',
  /* ⚠⚠ L INFOBULLE DE LA PASTILLE « fiche », D UN SEUL TENANT. Elle etait
     coupee en deux par la concatenation ; les morceaux generiques qu elle
     laissait (« fiche », « montre », « avant ») se sont poses DANS elle-meme et
     le banc sur-code a refuse. La source la dit maintenant d une seule voix. */
  'La fiche produit montre encore l’image d’avant le dernier traitement':
    'The product page still shows the image from before the last treatment',
  ' fiche': ' page',
  'Produit lié': 'Linked product',
  'Détourage': 'Cutout',
  'Mannequin retiré': 'Mannequin removed',
  'Porté par un mannequin': 'Worn by a model',
  'Filigrane / logo': 'Watermark / logo',
  'Détourée': 'Cut out',
  'Traitements': 'Treatments',
  'SKU': 'SKU',
  'Poids': 'Weight',
  'Lot d’import': 'Import batch',
  'aucun': 'none',

  /* ── LA LISTE ───────────────────────────────────────────────────────────── */
  'État': 'Status',
  'Nom Code Produit lié': 'Name Code Linked product',
  'État Poids': 'Status Weight',
  '‹ Précédent': '‹ Previous',
  'Page': 'Page',
  '‹ Précédent Page': '‹ Previous Page',
  'Suivant ›': 'Next ›',
  'Aucune photo ne correspond à ces critères.': 'No photo matches these criteria.',
  'Aucune photo dans la photothèque. Importez-en depuis l’écran Photothèque.':
    'No photo in the media library. Import some from the Media library screen.',
  'Téléversement en cours…': 'Uploading…',

  /* ══ REVENIR EN ARRIERE — UN SEUL PAS EST CONSERVE ═════════════════════════
   * ⚠⚠ C est la phrase qui evite de croire qu on peut remonter a l originale.
   * La raccourcir ferait annuler deux fois en esperant la premiere image. */
  '↩ Revenir à l’état précédent': '↩ Go back to the previous state',
  'Revenir à l’état d’avant le dernier traitement':
    'Go back to the state before the last treatment',
  'l’état d’avant': 'the state before',
  /* ⚠⚠ LES <strong> COUPENT CES PHRASES EN TROIS. On traduit les morceaux TELS
     QUE LA SOURCE LES ECRIT — c est la seule forme que le poseur trouve — et la
     forme RENDUE en plus, pour le compteur. Sans ces morceaux, seule la clé
     « vous » du socle correspondait, et la page anglaise rendait « le même
     bouton rétablira ce que YOU venez d’annuler ». */
  ' photo': ' photo',
  ' sur ': ' of ',
  ' choisie': ' chosen',
  'retrouveront': 'will get back',
  'retrouvera': 'will get back',
  'leur ': 'their ',
  'dernier traitement': 'last treatment',
  'Aucun crédit n’est dépensé': 'No credit is spent',
  ' : l’image d’avant est déjà rangée, ': ': the earlier image is already stored, ',
  'on ne fait que la remettre en place.': 'we only put it back in place.',
  'Le geste est ': 'The action is ',
  'réversible': 'reversible',
  ' — le même bouton rétablira ce que ': ' — the same button will restore what ',
  'venez d’annuler.': 'have just undone.',
  ' n’a': ' has',
  ' pas.': ' not.',
  /* Les formes RENDUES, pour le compteur. */
  'Aucun crédit n’est dépensé : l’image d’avant est déjà rangée,':
    'No credit is spent: the earlier image is already stored,',
  'Le geste est réversible — le même bouton rétablira ce que vous':
    'The action is reversible — the same button will restore what you',
  'Un seul pas en arrière est conservé par photo : une photo':
    'Only one step back is kept per photo: a photo',
  'passée par deux traitements ne remonte qu’au précédent, pas à l’originale.':
    'that went through two treatments only goes back to the previous one, not to the original.',
  's n’ont': 's have',
  'rien à annuler et ne bougera': 'nothing to undo and will not move',
  'Revenir en arrière': 'Go back',
  'Retour en arrière…': 'Going back…',
  'à l’état précédent.': 'to the previous state.',
  'rien à annuler.': 'nothing to undo.',
  'en échec.': 'failed.',

  /* ══ METTRE A JOUR LA FICHE — LA BOUTIQUE CHANGE, EN LIGNE ═════════════════
   * ⚠⚠⚠ Et la mise en garde des photos rattachees avant la 3.49 : remplacer la
   * mauvaise image mettrait un vetement a la place d un autre. */
  'Mettre à jour la fiche produit': 'Update the product page',
  '📦 Mettre à jour la fiche produit': '📦 Update the product page',
  'Mettre à jour la fiche (': 'Update the page (',
  'L’image courante de': 'The current image of',
  'sera portée dans la fiche de l’article auquel elle est rattachée.':
    'will be carried into the page of the item it is linked to.',
  /* ⚠ Meme decoupe par <strong> que le bloc du retour en arriere. */
  'C’est ce que la boutique affichera': 'That is what the storefront will show',
  ' — la photo du produit change ': ' — the product photo changes ',
  'pour de bon, en ligne.': 'for good, online.',
  /* ⚠⚠ LE SINGULIER ET LE PLURIEL, CHACUN ENTIER — et le <strong> DANS la clé.
     « fiche » + « s » + « montre » + « nt » ne donnait que des morceaux qu on
     retrouve partout ; ils se sont poses dans l infobulle voisine. La source dit
     maintenant la phrase en deux formes completes, et le morceau emphase garde
     sa balise, comme dans campagnes.js. */
  ' fiches montrent': ' pages still show',
  ' fiche montre': ' page still shows',
  ' encore l’image d’<strong>avant</strong> le dernier ':
    ' the image from <strong>before</strong> the last ',
  /* La forme RENDUE de la meme phrase : le <strong> parti, les morceaux recolles
     avec une espace. C est celle-la que le compteur interroge. */
  'encore l’image d’ avant le dernier': 'still the image from before the last',
  'C’est ce que la boutique affichera — la photo du produit change':
    'That is what the storefront will show — the product photo changes',
  'traitement — c’est justement ce qu’on répare.': 'treatment — which is exactly what we are fixing.',
  'Aucune de ces fiches n’est en retard : elles montrent déjà':
    'None of these pages is behind: they already show',
  'l’image courante. Rien ne changera visiblement.':
    'the current image. Nothing will visibly change.',
  'Une photo rattachée avant la version 3.49 dont la fiche porte':
    'A photo linked before version 3.49 whose page carries',
  'plusieurs images': 'several images',
  ' sera laissée de côté : on ne peut pas savoir laquelle ':
    ' will be left aside: we cannot tell which one ',
  's ne sont': 's are',
  ' n’est': ' is',
  ' rattachée': ' linked',
  'plusieurs images sera laissée de côté : on ne peut pas savoir laquelle':
    'several images will be left aside: we cannot tell which one',
  'lui appartient, et remplacer la mauvaise mettrait un vêtement à la place d’un autre.':
    'belongs to it, and replacing the wrong one would put one garment in place of another.',
  'Rattachez-la de nouveau pour lever le doute.': 'Link it again to remove the doubt.',
  'à aucun article et ne bougera': 'to no item and will not move',
  'Mettre à jour la vitrine': 'Update the storefront',
  'Mise à jour des fiches…': 'Updating the pages…',
  /* ⚠ LE COMPTE RENDU, LUI AUSSI EN DEUX FORMES COMPLETES : « fiche » + « s » +
     « mise » + « s » laissait « à jour. » seul, et « laissée » sans clé — la
     page anglaise gardait le mot francais. */
  ' fiches mises à jour.': ' pages updated.',
  ' fiche mise à jour.': ' page updated.',
  /* Les formes RENDUES : le compte rendu est coupe du nombre qui le precede, et
     l espace de tete part avec. */
  'fiches mises à jour.': 'pages updated.',
  'fiche mise à jour.': 'page updated.',
  's non rattachées': 's not linked',
  'non rattachée': 'not linked',
  ' laissées de côté (plusieurs images, lien incertain).':
    ' set aside (several images, uncertain link).',
  ' laissée de côté (plusieurs images, lien incertain).':
    ' set aside (several images, uncertain link).',
  'laissées de côté (plusieurs images, lien incertain).':
    'set aside (several images, uncertain link).',
  'laissée de côté (plusieurs images, lien incertain).':
    'set aside (several images, uncertain link).',

  /* ── LA BARRE DE SELECTION ──────────────────────────────────────────────── */
  'Aucune sélection': 'Nothing selected',
  ' sélectionnée': ' selected',
  'Tout (': 'All (',
  '↩ Annuler (': '↩ Undo (',
  '📦 Mettre à jour la fiche (': '📦 Update the page (',
  '→ Envoyer au Studio': '→ Send to the Studio',
  ' au Studio — le traitement se lance là-bas.':
    ' to the Studio — the treatment starts there.',
  'au Studio — le traitement se lance là-bas.':
    'to the Studio — the treatment starts there.',
  'Annuler': 'Cancel',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Inverser': 'Invert',
  'Vider': 'Clear',

  /* ── LA VISIONNEUSE : LA PHOTO EN GRAND, AVEC SON ZOOM (#143) ───────────── */
  'Cliquez pour voir en grand (zoom)': 'Click to view large (zoom)',
  'Aperçu indisponible pour cette photo.': 'Preview unavailable for this photo.',
  'Réduire': 'Zoom out',
  'Agrandir': 'Zoom in',
  'Ajuster': 'Fit',
  'Fermer': 'Close',
  'Chargement de l’image…': 'Loading image…',
  'Cette photo n’a pas pu être lue.': 'This photo could not be read.',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'leur dernier traitement': 'their last treatment',
  // La refonte (2026-09-25).
  'Nom Produit lié': 'Name Linked product',
};
