'use strict';

/*
 * PHOTOTHEQUE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ TROIS PHRASES DE CET ECRAN PROTEGENT DES FICHES PRODUITS, et elles gardent
 * leur fermete en anglais :
 *   · « les photos attachees a un article sont GARDEES : retirer la photothèque
 *     ne doit jamais depouiller une fiche produit » ;
 *   · « les fiches produits gardent leurs images » (vidage complet) ;
 *   · « l article lie, lui, garde son image » (suppression d une photo).
 * Sans elles, on croit effacer une bibliotheque et l on vide une boutique.
 *
 * ⚠⚠ ET TROIS AUTRES PROTEGENT DES CREDITS PHOTOROOM : « chaque photo coute 1
 * credit », « l apercu est gratuit et filigrane », « des photos ont deja ete
 * facturees — les relancer entrainera de nouveaux frais ». Les affaiblir ferait
 * payer deux fois.
 *
 * ⚠⚠ ON NE TRADUIT QUE LES LIBELLES, JAMAIS LES CLES. `POSES_SC`, `DECORS_SC` et
 * `MODELES_SC` sont des couples `[cle, libelle]` : `34turn`, `powerstance`,
 * `factory`, `sophia` partent chez Photoroom, ou une liste FERMEE refuse ce
 * qu elle ne connait pas. Le commentaire de la source le dit deja : « c est
 * l ecran qui traduit, jamais la valeur envoyee ».
 *
 * ⚠ L ORDRE DES TROIS TRAITEMENTS EST IMPOSE, ET LA PHRASE QUI L EXPLIQUE EST LA
 * RAISON QU ON CHERCHERAIT AUTREMENT DANS LE RESULTAT : demander un mannequin
 * humain sur une photo brute donne un modele qui porte le DECOR autant que le
 * vetement.
 */

module.exports = {
  /* ── L EN-TETE ET LES REFUS ─────────────────────────────────────────────── */
  'Photos — Administration Sandriza': 'Photos — Sandriza Administration',
  'Photos': 'Photos',
  'Photothèque indisponible': 'Photo library unavailable',
  'Aucune réponse de la fenêtre principale pour cette opération.':
    'No answer from the main window for this operation.',
  'Elle a peut-être abouti quand même — rechargez la liste pour voir.':
    'It may have gone through anyway — reload the list to see.',
  '— un travail est déjà en cours dans cette fenêtre. Patientez,':
    '— a job is already running in this window. Wait,',
  'ou rechargez la liste s’il ne se termine pas.': 'or reload the list if it does not finish.',
  'Votre rôle ne donne pas accès à la photothèque.':
    'Your role does not give access to the photo library.',
  'Attacher une photo modifie une fiche produit — votre rôle ne le permet pas.':
    'Attaching a photo changes a product record — your role does not allow it.',
  'La fenêtre principale n’a pas répondu à temps. Une photo très lourde peut en être la cause.':
    'The main window did not answer in time. A very large photo can be the cause.',
  'La photothèque n’a pas pu être chargée dans la fenêtre principale. Rechargez-la (Ctrl+R) ; si le message revient, la session du personnel a peut-être expiré.':
    'The photo library could not be loaded in the main window. Reload it (Ctrl+R); if the message comes back, the staff session may have expired.',
  'Cette photo n’existe plus.': 'This photo no longer exists.',
  'Cet article n’existe plus.': 'This item no longer exists.',
  'Aucune image lisible dans ce fichier.': 'No readable image in this file.',
  'Isolez d’abord le vêtement : un fond se pose derrière un détourage.':
    'Cut out the garment first: a background goes behind a cut-out.',
  'L’isolation a échoué.': 'The cut-out failed.',
  'Le fond n’a pas pu être appliqué.': 'The background could not be applied.',
  'L’attache a échoué — rien n’a été écrit sur la fiche.':
    'Attaching failed — nothing was written to the record.',
  'L’import a échoué.': 'The import failed.',
  'Écriture dans le nuage refusée — rien n’a été retiré.':
    'Write to the cloud refused — nothing was removed.',
  'La détection de clé USB n’existe que dans l’application de bureau.':
    'USB stick detection only exists in the desktop application.',
  'L’enregistrement de fichier n’existe que dans l’application de bureau.':
    'Saving a file only exists in the desktop application.',
  '◉ Lecture seule': '◉ Read only',
  'Votre rôle permet de consulter la photothèque, pas de la modifier.':
    'Your role allows viewing the photo library, not changing it.',
  'Le plein écran n’existe que dans l’application.':
    'Full screen only exists in the application.',
  'Plein écran': 'Full screen',

  /* ── LA BARRE D OUTILS ET LES TRIS ──────────────────────────────────────── */
  '＋ Importer': '＋ Import',
  'Importer': 'Import',
  '⚙ Traitement en lot': '⚙ Batch processing',
  'Traitement en lot': 'Batch processing',
  '🎨 Studio virtuel': '🎨 Virtual Studio',
  'Studio virtuel': 'Virtual Studio',
  'Plus récentes': 'Most recent',
  'Par code': 'By code',
  'Par nom': 'By name',
  'Liées d’abord': 'Linked first',
  'Plus lourdes': 'Largest',
  'Dernier suivi': 'Last tracked',
  'Plus récentes d’abord': 'Most recent first',
  'Plus anciennes d’abord': 'Oldest first',
  'Plus lourdes d’abord': 'Largest first',

  /* ── LA LISTE ───────────────────────────────────────────────────────────── */
  'Lecture de la photothèque…': 'Reading the photo library…',
  'Aucune photo ne correspond à cette recherche.': 'No photo matches this search.',
  'Aucune photo. Déposez-en ci-dessus.': 'No photo. Drop some above.',
  'Aucune photo dans la photothèque.': 'No photo in the photo library.',
  'Code Nom': 'Code Name',
  'Article lié Poids État': 'Linked item Size Status',
  'Code': 'Code',
  'Nom': 'Name',
  'Article lié': 'Linked item',
  'Poids': 'Size',
  'État': 'Status',
  'Glissez-déposez vos photos ici': 'Drag and drop your photos here',
  '· ou « Clé USB »': '· or « USB stick »',
  'Sans nom': 'No name',
  'non rangée': 'not tidied',
  'Poids rangé': 'Size tidied',
  'Avant compression': 'Before compression',
  'sans SKU': 'no SKU',

  /* ── LES TROIS TRAITEMENTS, ET L ORDRE QUI NE SE CONTOURNE PAS ──────────── */
  'Retirer le fond': 'Remove the background',
  'Isole le vêtement de son arrière-plan.': 'Cuts the garment out of its background.',
  'Isole le vêtement de son fond.': 'Cuts the garment out of its background.',
  'Retirer le mannequin': 'Remove the mannequin',
  'Retire le fond PUIS le mannequin. Le col et les manches sont reconstruits.':
    'Removes the background THEN the mannequin. The collar and sleeves are rebuilt.',
  'Ne garde que le vêtement, col et manches reconstruits.':
    'Keeps only the garment, collar and sleeves rebuilt.',
  'Mannequin humain': 'Human model',
  'Retire le fond, retire le mannequin, PUIS engendre une personne qui porte le vêtement.':
    'Removes the background, removes the mannequin, THEN generates a person wearing the garment.',
  'Mettre sur un mannequin': 'Put on a model',
  'Fait porter le vêtement par une personne engendrée.':
    'Has the garment worn by a generated person.',
  'Que faut-il en faire ?': 'What should be done with them?',
  /* ⚠⚠ CETTE PHRASE EST LA RAISON QU ON CHERCHERAIT SINON DANS LE RESULTAT. */
  'L’ordre est imposé, et c’est voulu.': 'The order is fixed, and that is on purpose.',
  'Demander un mannequin humain sur une photo brute donne un modèle qui porte le décor':
    'Asking for a human model on a raw photo gives a model wearing the scene',
  'autant que le vêtement. Le fond part d’abord, puis le mannequin, et seulement ensuite':
    'as much as the garment. The background goes first, then the mannequin, and only then',
  'la personne est engendrée.': 'is the person generated.',
  'Ce qui est déjà fait n’est pas refait : une étape déjà présente est sautée,':
    'What is already done is not redone: a step already present is skipped,',
  'et la raison est inscrite au suivi et au journal.':
    'and the reason is written to the tracker and the log.',
  'à traiter.': 'to process.',
  'Retrait du fond': 'Background removal',
  'Retrait du mannequin': 'Mannequin removal',
  'Mise sur un mannequin': 'Put on a model',
  'déjà à jour': 'already up to date',
  'déjà fait': 'already done',
  'déjà importée': 'already imported',
  'déjà présente': 'already there',
  'import refusé': 'import refused',
  'envoi au modèle': 'sent to the model',
  'détourage local': 'local cut-out',
  'Les deux derniers traitements engendrent une image :':
    'The last two jobs generate an image:',
  'l’original est conservé à côté.': 'the original is kept alongside.',

  /* ── LA MISE EN SCENE (les couples [cle, libelle]) ──────────────────────── */
  /* ⚠ `Zoé` est un PRENOM : il garde son accent dans les deux langues. Entree
     explicite pour que le banc du residuel sache que c est une DECISION. */
  'Zoé': 'Zoé',
  'Mise en scène': 'Staging',
  'Trois-quarts (met la coupe en valeur)': 'Three-quarter (shows off the cut)',
  'Debout, de face': 'Standing, front on',
  'Ajuste son vêtement': 'Adjusting clothing',
  'Main dans la poche': 'Hand in pocket',
  'Bras croisés': 'Crossed arms',
  'En marche': 'Walking',
  'Posture assurée': 'Confident stance',
  'Regard par-dessus l’épaule': 'Over the shoulder',
  'Tour sur soi': 'Spin',
  'Assise': 'Seated',
  'De dos': 'From behind',
  'Au hasard': 'Random',
  'Studio': 'Studio',
  'Rue': 'Street',
  'Bord de mer': 'Seaside',
  'Coucher de soleil': 'Sunset',
  'Forêt': 'Forest',
  'Chambre': 'Bedroom',
  'Bibliothèque': 'Library',
  'Montagne': 'Mountain',
  'Piscine': 'Pool',
  'Friche industrielle': 'Industrial wasteland',
  'Sourire naturel, regard vers l’objectif': 'Natural smile, looking at the lens',
  'Précisions (facultatif)': 'Notes (optional)',
  '+ Chaussures': '+ Shoes',
  '+ Bijoux': '+ Jewellery',
  '+ Sac à main': '+ Handbag',
  '+ Coiffure': '+ Hairstyle',
  '+ Lumière chaude': '+ Warm light',
  '+ Mon fond…': '+ My background…',

  /* ── CE QUI COUTE DES CREDITS ───────────────────────────────────────────── */
  /* ⚠⚠ PHRASES A CREDITS : elles existent pour qu on juge AVANT de payer, et
     pour qu on ne repaie pas ce qui est deja facture. */
  'Chaque photo coûte': 'Each photo costs',
  '1 crédit Photoroom. L’aperçu est gratuit et filigrané : de quoi juger avant':
    '1 Photoroom credit. The preview is free and watermarked: enough to judge before',
  'de payer.': 'paying.',
  '👁 Voir un aperçu': '👁 See a preview',
  '👁 Aperçu du retrait': '👁 Removal preview',
  'Lancer le retrait sur': 'Start the removal on',
  'Lancer sur': 'Start on',
  'Lancer le traitement': 'Start the job',
  'Des photos ont déjà été facturées': 'Some photos have already been billed',
  'déjà coûté un crédit Photoroom. Les relancer': 'already cost a Photoroom credit. Running them again',
  'entraînera de nouveaux frais.': 'will incur new charges.',
  'Continuer et payer': 'Continue and pay',
  'Traitement annulé : rien n’a été refait ni facturé.':
    'Job cancelled: nothing was redone or billed.',
  'Aperçu de la mise en scène': 'Staging preview',
  'Aperçu du retrait de mannequin': 'Mannequin removal preview',
  'gratuit · filigrané · aucun crédit réel': 'free · watermarked · no real credit',
  'Pour la version': 'For the',
  'définitive sans filigrane, lancez le traitement : il consomme alors un crédit':
    'final version without a watermark, start the job: it then uses one credit',
  'Clé Photoroom absente': 'Photoroom key missing',
  'Aperçu de': 'Preview of',
  'Aperçu prêt.': 'Preview ready.',
  'Vérification des crédits…': 'Checking credits…',

  /* ── LES LOTS D IMPORT ──────────────────────────────────────────────────── */
  /* ⚠⚠⚠ « LES PHOTOS ATTACHEES SONT GARDEES » EST LA PHRASE QUI EMPECHE DE
     DEPOUILLER UNE BOUTIQUE EN VIDANT UNE BIBLIOTHEQUE. */
  'Historique des lots importés': 'History of imported batches',
  'Lots importés': 'Imported batches',
  'Lecture des lots…': 'Reading batches…',
  'Aucune photo : il n’y a pas encore de lot': 'No photo: there is no batch yet',
  'Lot Entré Photos': 'Batch In Photos',
  'Traitées Attachées Poids': 'Processed Attached Size',
  'Tout cocher': 'Tick all',
  'Tout décocher': 'Untick all',
  'Tout choisir': 'Choose all',
  'Supprimer le lot': 'Delete the batch',
  'photo(s) non attachées seront retirées.': 'unattached photo(s) will be removed.',
  'attachées à un article sont GARDÉES :': 'attached to an item are KEPT:',
  'retirer la photothèque ne doit jamais dépouiller une fiche produit.':
    'clearing the photo library must never strip a product record.',
  'Un lot est un import.': 'A batch is one import.',
  'Le retirer défait cet import d’un geste.': 'Removing it undoes that import in one go.',
  'photo(s) cochée(s)': 'ticked photo(s)',
  '— le lot en compte': '— the batch holds',
  '; augmentez « photos par page » pour toutes les voir.':
    '; raise « photos per page » to see them all.',
  'Aucune photo de ce lot sur cette page — augmentez « photos par page ».':
    'No photo from this batch on this page — raise « photos per page ».',
  'Suppression du lot…': 'Deleting the batch…',
  'photo(s) retirée(s)': 'photo(s) removed',
  'gardée(s) car attachée(s) à un article': 'kept because attached to an item',
  'en échec': 'failed',
  'Nom du lot': 'Batch name',
  'Les photos importées seront nommées « Nom 01 », « Nom 02 »…':
    'Imported photos will be named « Name 01 », « Name 02 »…',
  'Laissé vide, on garde le nom d’origine.': 'Left empty, the original name is kept.',

  /* ── LE SUIVI ET L ESPACE R2 ────────────────────────────────────────────── */
  'Avant le suivi des lots': 'Before batch tracking',
  'Les lots arrivent sans leurs compteurs (champs reçus :':
    'Batches arrive without their counters (fields received:',
  'Les lots arrivent sans leurs compteurs.': 'Batches arrive without their counters.',
  'Champs reçus :': 'Fields received:',
  'Module du site :': 'Site module:',
  '(non annoncée)': '(not announced)',
  '). Rechargez avec': '). Reload with',
  '« Affichage ▸ Recharger (vider le cache) » ; si cela persiste,':
    '« View ▸ Reload (clear cache) »; if it persists,',
  'transmettez-moi cette ligne.': 'send me this line.',
  'Rechargez avec « Affichage ▸ Recharger (vider le cache) ». Si cela':
    'Reload with « View ▸ Reload (clear cache) ». If it',
  'persiste, transmettez ces deux lignes.': 'persists, send these two lines.',
  'mesurer l’espace R2': 'measure the R2 space',
  'espace R2 :': 'R2 space:',
  'mesure de l’espace R2…': 'measuring the R2 space…',
  'R2 : au moins': 'R2: at least',
  ', dont': ', of which',
  'objet(s) ne sont cités par aucune photo :': 'object(s) are referenced by no photo:',
  'payés pour rien. Le passage de nuit les retire.':
    'paid for nothing. The nightly pass removes them.',
  'Confirmer — vider les': 'Confirm — clear the',
  'Tout vider': 'Clear everything',

  /* ── L IMPORT ───────────────────────────────────────────────────────────── */
  'Lecture des sources…': 'Reading sources…',
  'D’où viennent les photos ?': 'Where do the photos come from?',
  'Photos déjà importées': 'Photos already imported',
  'dans la photothèque': 'in the photo library',
  'Lecture des clés branchées…': 'Reading connected drives…',
  'Aucune clé ou carte mémoire branchée avec des photos.':
    'No connected stick or memory card with photos.',
  'Chargement des aperçus…': 'Loading previews…',
  'Les photos sont seulement LUES : rien n’est importé': 'The photos are only READ: nothing is imported',
  'tant que vous n’avez pas choisi.': 'until you have chosen.',
  'Cette source ne contient aucune photo lisible.': 'This source holds no readable photo.',
  'Choisissez au moins une photo.': 'Choose at least one photo.',
  'Choisissez une source.': 'Choose a source.',
  'Import en cours': 'Import running',
  '0 % Préparation…': '0 % Preparing…',
  'Préparation de l’import…': 'Preparing the import…',
  'Import du': 'Importing',
  'Import ·': 'Import ·',
  'Import interrompu': 'Import interrupted',
  'Import terminé': 'Import finished',
  'déjà là ·': 'already there ·',
  'Aucune image dans ce dépôt (JPG, PNG ou WebP).':
    'No image in this drop (JPG, PNG or WebP).',
  'Annulation… la tâche en cours se termine, les suivantes sont abandonnées.':
    'Cancelling… the current task finishes, the following ones are dropped.',
  'Annulation demandée — la tâche en cours va au bout, les suivantes sont abandonnées.':
    'Cancellation requested — the current task runs to the end, the following ones are dropped.',
  '← Retour': '← Back',
  'Continuer →': 'Continue →',
  'depuis la clé': 'from the drive',
  'Détection de clé USB': 'USB stick detection',
  'Recherche de clés USB…': 'Looking for USB sticks…',
  'Aucune photo trouvée sur une clé USB.': 'No photo found on a USB stick.',

  /* ── UNE PHOTO : RENOMMER, ISOLER, ATTACHER, RETIRER ────────────────────── */
  'Cliquez encore pour supprimer': 'Click again to delete',
  'Cette photo n’a pas atteint le stockage.': 'This photo did not reach storage.',
  'Elle reste ouverte dans la fenêtre principale ; réessayez l’import.':
    'It stays open in the main window; try the import again.',
  'Confirmer le retrait ?': 'Confirm removal?',
  '✕ Retirer de la médiathèque': '✕ Remove from the media library',
  '⤓ Enregistrer le fichier': '⤓ Save the file',
  '✂ Isoler le vêtement': '✂ Cut out the garment',
  '⟳ Pivoter': '⟳ Rotate',
  'Annuler l’attache': 'Undo the attachment',
  'Attacher à un article': 'Attach to an item',
  'Lecture du catalogue…': 'Reading the catalogue…',
  'Aucun article ne correspond.': 'No item matches.',
  '— precisez la recherche pour voir les autres.': '— narrow the search to see the others.',
  'Isolation du vêtement… (quelques secondes)': 'Cutting out the garment… (a few seconds)',
  'Cette photo était déjà isolée.': 'This photo was already cut out.',
  'Vêtement isolé LOCALEMENT — le modèle n’a pas répondu':
    'Garment cut out LOCALLY — the model did not answer',
  '. Le résultat est moins net.': '. The result is less clean.',
  'Vêtement isolé par le modèle. Choisissez un fond.':
    'Garment cut out by the model. Choose a background.',
  'Application du fond…': 'Applying the background…',
  'Fond appliqué.': 'Background applied.',
  'Attache et téléversement…': 'Attaching and uploading…',
  'attachée à': 'attached to',
  'Le nom ne peut pas être vide.': 'The name cannot be empty.',
  'Photo renommée.': 'Photo renamed.',
  /* ⚠⚠ « L ARTICLE LIE GARDE SON IMAGE » : sans cette phrase, on n ose plus rien
     supprimer — ou l on supprime en croyant casser une fiche. */
  'Cliquez encore sur la corbeille pour supprimer — l’article lié, lui, garde son image.':
    'Click the bin again to delete — the linked item keeps its image.',
  'Photo retirée de la photothèque.': 'Photo removed from the photo library.',
  'Cliquez encore pour supprimer les': 'Click again to delete the',
  'photo(s) cochée(s).': 'ticked photo(s).',
  'Les articles liés gardent leur image.': 'Linked items keep their image.',
  'Suppression de': 'Deleting',
  'Suppression ·': 'Deletion ·',
  'Suppression interrompue': 'Deletion interrupted',
  'Suppression terminée': 'Deletion finished',

  /* ── LE VIDAGE COMPLET ──────────────────────────────────────────────────── */
  'Vidage de la photothèque': 'Clearing the photo library',
  'Lecture de ce qu il y a à retirer…': 'Reading what there is to remove…',
  'La photothèque est déjà vide.': 'The photo library is already empty.',
  'Vidage ·': 'Clearing ·',
  'Vidage interrompu': 'Clearing interrupted',
  'Vidage terminé': 'Clearing finished',
  '. Les fiches produits gardent leurs images.': '. Product records keep their images.',
  'refusée(s) par le nuage.': 'refused by the cloud.',
  'Photothèque vidée — les fiches produits gardent leurs images.':
    'Photo library cleared — product records keep their images.',
  'photo(s) rangée(s) : une seule image conservée par photo.':
    'photo(s) tidied: a single image kept per photo.',

  /* ── LA ROTATION ────────────────────────────────────────────────────────── */
  'Rotation de': 'Rotating',
  'Rotation ·': 'Rotation ·',
  'Rotation interrompue': 'Rotation interrupted',
  'Rotation terminée': 'Rotation finished',
  'traitement(s) à refaire': 'job(s) to redo',
  'traitements écartés': 'jobs set aside',
  'à refaire': 'to redo',

  /* ── LE STUDIO ──────────────────────────────────────────────────────────── */
  'Cette version ne sait pas encore ouvrir le Studio.':
    'This version cannot open the Studio yet.',
  'Ouverture du Studio impossible.': 'Could not open the Studio.',
  'Confirmer — supprimer': 'Confirm — delete',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════
   * ⚠⚠ ET ICI UNE TROISIEME FORME, apres le pictogramme dans son <span> et la
   * phrase coupee par un <strong> : L ESPACE INSECABLE. La source ecrit
   * `D’où viennent les photos&nbsp;?` — la typographie francaise colle une
   * espace insecable avant le point d interrogation. Le texte RENDU montre une
   * espace ordinaire ; la cle du POSEUR doit porter le `&nbsp;`.
   * ⚠ Sans elle, la cle longue ne correspond a rien et les cles COURTES qu elle
   * contient se posent : « Ce qui est already done n’est pas refait… ».
   * ══════════════════════════════════════════════════════════════════════════ */
  'D’où viennent les photos&nbsp;?': 'Where do the photos come from&nbsp;?',
  'Que faut-il en faire&nbsp;?': 'What should be done with them&nbsp;?',
  '<b>Ce qui est déjà fait n’est pas refait</b> : une étape déjà présente est sautée, ':
    '<b>What is already done is not redone</b>: a step already present is skipped, ',
  'Les deux derniers traitements <strong>engendrent</strong> une image&nbsp;: ':
    'The last two jobs <strong>generate</strong> an image&nbsp;: ',
  'R2 : <b>au moins ': 'R2: <b>at least ',

  /* ── CE QUE LE PICTOGRAMME SEPARE DE SON TEXTE ──────────────────────────── */
  'Voir un aperçu': 'See a preview',
  'Aperçu du retrait': 'Removal preview',
  'Isoler le vêtement': 'Cut out the garment',
  'Préparation…': 'Preparing…',

  /* ── LES EN-TETES DE TABLEAU, UN PAR CELLULE ────────────────────────────── */
  'Entré': 'In',
  'Traitées': 'Processed',
  'Attachées': 'Attached',

  /* ── LA LONGUE TRAINE : LES MOTS SEULS ─────────────────────────────────────
     ⚠⚠ Le compteur ne les voit PAS (`chainesProse` ecarte les chaines d un seul
     mot). Ce sont des pastilles d etat, des cellules et des bouts de compte
     rendu — « 3 photo(s) importée », « 2 traitée », « 1 en échec ». */
  'affichée': 'shown',
  'isolée': 'cut out',
  'détourée': 'cut out',
  'attachée': 'attached',
  'importée': 'imported',
  'retirée': 'removed',
  'refusée': 'refused',
  'pivotée': 'rotated',
  'abandonnée': 'abandoned',
  'traitée': 'processed',
  'sautée': 'skipped',
  'rangée': 'tidied',
  'rangés': 'tidied',
  'terminé': 'finished',
  'Terminé': 'Finished',
  'échec': 'failure',
  'Opération': 'Operation',
  'Sélectionner': 'Select',
  'Détourer': 'Cut out',
  'Détourage': 'Cut-out',
  'Décor': 'Scene',
  'Aperçu': 'Preview',
  'modèle': 'model',
  'dépôt': 'drop',
  'photothèque': 'photo library',
  'Clé': 'Drive',
  'clé': 'drive',
  /* ⚠ « retirée(s), » EN ENTIER, et la raison merite d etre ecrite : le poseur
     refuse depuis le 2026-09-12 d envelopper un mot SUIVI D UNE PARENTHESE —
     c est ce qui empeche `new ${T("Date")}()`. Ici la parenthese est celle du
     pluriel francais, pas un appel : la cle courte est donc ecartee a juste
     titre, et il faut la forme complete. Un garde utile a toujours un cas ou il
     gene ; on lui donne ce qu il demande plutot que de le desarmer. */
  'retirée(s), ': 'removed, '
};
