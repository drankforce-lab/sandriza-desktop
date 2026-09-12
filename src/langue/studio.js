'use strict';

/*
 * STUDIO VIRTUEL — les deux langues
 * =============================================================================
 * ⚠⚠ LE VOCABULAIRE DU METIER N EST PAS LIBRE. « Fantome habille » se dit
 * GHOST MANNEQUIN dans toute la photo de mode : c est le terme qu emploient les
 * studios, les agences et Photoroom lui-meme. Inventer « dressed ghost » rendrait
 * l ecran illisible pour quiconque a deja fait ce travail. Meme regle pour
 * « produit a plat » = FLAT LAY, et « relumiere » = RELIGHTING.
 *
 * ⚠⚠⚠ ON NE TRADUIT QUE LES LIBELLES, JAMAIS LES CLES. Chaque table de cet ecran
 * est faite de couples `{ cle, t }` : `cle` part chez Photoroom (`34turn`,
 * `goldenlight`, `ai.preserve-hue-and-saturation`, `frontleft`…) et une liste
 * FERMEE cote service refuse tout ce qu elle ne connait pas. Seul `t` s affiche.
 * Les 16 noms de mannequins (`sophia`, `emma`…) sont des NOMS PROPRES de presets :
 * ils ne se traduisent pas davantage.
 *
 * ⚠⚠ LES PHRASES QUI GARDENT UN CREDIT DANS LA POCHE GARDENT LEUR NETTETE.
 * Cet ecran DEPENSE DE L ARGENT a chaque clic : « l apercu est gratuit et
 * filigrane », « un clic de plus lance un vrai rendu payant », « chaque photo
 * est un appel facture », « les repasser coute un appel chacune pour un resultat
 * identique ». Les affaiblir en traduisant ferait payer deux fois.
 *
 * ⚠ ET L AVERTISSEMENT DE LA TEINTE EST UN AVERTISSEMENT COMMERCIAL, pas une
 * note technique : « un bleu nuit qui ressort bleu roi fait un retour ». Il dit
 * pourquoi « preserver la teinte » est le seul choix sur quand on vend l article
 * sur sa couleur. Il reste aussi net en anglais.
 */

module.exports = {
  /* ── L EN-TETE ──────────────────────────────────────────────────────────── */
  'Studio virtuel — Administration Sandriza': 'Virtual Studio — Sandriza Administration',
  'Studio virtuel': 'Virtual Studio',
  'Lecture seule : votre rôle ne permet pas de lancer de traitement.':
    'Read only: your role does not allow starting a job.',
  'Crédits :': 'Credits:',
  'Aperçus ce mois :': 'Previews this month:',
  'Traitements par lot — voir la file, mettre en pause, arrêter':
    'Batch jobs — see the queue, pause, stop',
  'Traitements par lot': 'Batch jobs',

  /* ── LES TROIS VOIES ────────────────────────────────────────────────────── */
  /* ⚠ « Ghost mannequin » et « flat lay » sont les termes du metier — voir la
     fiche en tete de ce fichier. */
  'Mannequin virtuel': 'Virtual model',
  'Porté par un modèle, décor intégré': 'Worn by a model, scene included',
  'Fantôme habillé': 'Ghost mannequin',
  'Sans mannequin, décor pro ajouté': 'No model, pro scene added',
  'Produit à plat': 'Flat lay',
  'Détourage + décor + ombre': 'Cut-out + scene + shadow',

  /* ── LES POSES (les 12 valeurs officielles du service) ──────────────────── */
  'Trois-quarts (défaut)': 'Three-quarter (default)',
  'Debout, de face': 'Standing, front on',
  'Posture affirmée': 'Power stance',
  'En marche': 'Walking',
  'Main dans la poche': 'Hand in pocket',
  'Bras croisés': 'Crossed arms',
  'Regard par-dessus l’épaule': 'Over the shoulder',
  'De dos': 'From behind',
  'Assise': 'Seated',
  'Ajuste son vêtement': 'Adjusting clothing',
  'Tourne sur elle-même': 'Playful spin',
  'Au hasard': 'Random',

  /* ── LES 23 DECORS (liste fermee cote Photoroom) ────────────────────────── */
  'Studio': 'Studio',
  'Studio coloré': 'Coloured studio',
  'Studio béton': 'Concrete studio',
  'Rue': 'Street',
  'Quartier des affaires': 'Business district',
  'Ville latine': 'Latin city',
  'Ville asiatique': 'Asian city',
  'Lumières de nuit': 'Night lights',
  'Café': 'Café',
  'Bibliothèque': 'Library',
  'Chambre': 'Bedroom',
  'Usine': 'Factory',
  'Plage': 'Beach',
  'Piscine': 'Pool',
  'Tropical': 'Tropical',
  'Forêt': 'Forest',
  'Fleurs': 'Flowers',
  'Campagne': 'Countryside',
  'Montagne': 'Mountain',
  'Désert': 'Desert',
  'Coucher de soleil': 'Sunset',
  'Lumière dorée': 'Golden light',

  /* ── LA LUMIERE ET L OMBRE ──────────────────────────────────────────────── */
  'De face': 'Front',
  'Devant, à gauche': 'Front left',
  'Devant, à droite': 'Front right',
  'À gauche': 'Left',
  'À droite': 'Right',
  'Derrière le sujet': 'Behind the subject',
  'Derrière, à gauche': 'Behind left',
  'Derrière, à droite': 'Behind right',
  'Courte — collée au vêtement': 'Short — hugging the garment',
  'Moyenne': 'Medium',
  'Longue — lumière basse': 'Long — low light',
  'Celle de l’ambiance': 'The preset’s own',
  /* ⚠⚠ CET AVERTISSEMENT EST COMMERCIAL : c est la couleur qu on vend. */
  'Préserver la teinte (recommandé)': 'Preserve hue (recommended)',
  'Automatique — peut déplacer les couleurs': 'Automatic — may shift the colours',
  'Optimiser un portrait — s’il y a un visage': 'Optimise a portrait — if there is a face',

  /* ── LES POSITIONS DU FILIGRANE ─────────────────────────────────────────── */
  'En haut à gauche': 'Top left',
  'En haut, au centre': 'Top centre',
  'En haut à droite': 'Top right',
  'Au milieu, à gauche': 'Middle left',
  'Au centre': 'Centre',
  'Au milieu, à droite': 'Middle right',
  'En bas à gauche': 'Bottom left',
  'En bas, au centre': 'Bottom centre',
  'En bas à droite': 'Bottom right',

  /* ── CHAQUE REFUS A SA PHRASE ───────────────────────────────────────────── */
  'Aucune session ouverte. Connectez-vous dans la fenêtre principale.':
    'No session open. Sign in from the main window.',
  'Votre rôle ne donne pas accès au traitement d’image.':
    'Your role does not give access to image processing.',
  'Importez d’abord une photo.': 'Import a photo first.',
  'Aucune clé Photoroom configurée (Configuration ▸ Clés API).':
    'No Photoroom key configured (Configuration ▸ API keys).',
  'Le service n’est pas prêt dans la fenêtre principale.':
    'The service is not ready in the main window.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not answer in time.',
  'La photothèque n’a pas pu être chargée. Rechargez (Ctrl+R) ; si cela revient, reconnectez-vous.':
    'The photo library could not be loaded. Reload (Ctrl+R); if it happens again, sign in again.',
  'Cette version de l’application ne sait pas encore ouvrir cet écran.':
    'This version of the application cannot open this screen yet.',

  /* ── LE SUIVI DES LOTS ──────────────────────────────────────────────────── */
  'En file': 'Queued',
  'En cours': 'Running',
  'En pause': 'Paused',
  'Terminé': 'Done',
  'Arrêté': 'Stopped',
  'Lecture des traitements…': 'Reading jobs…',
  'Aucun traitement. Choisissez des photos depuis la': 'No job yet. Choose photos from the',
  'photothèque, puis « Traiter en lot ».': 'photo library, then « Batch process ».',
  '⏸ Pause': '⏸ Pause',
  'Pause': 'Pause',
  '⏹ Arrêter': '⏹ Stop',
  'Arrêter': 'Stop',
  '▶ Reprendre': '▶ Resume',
  'Reprendre': 'Resume',
  '✕ Retirer': '✕ Remove',
  'Retirer': 'Remove',
  '★ Priorité': '★ Priority',
  'Priorité': 'Priority',
  '⏸ Mis en pause :': '⏸ Paused:',
  'Mis en pause :': 'Paused:',
  'de l’explorateur': 'from the browser',
  'Oublier cette sélection': 'Forget this selection',

  /* ── L ETAPE 1 : LA PHOTO ───────────────────────────────────────────────── */
  '⚙ Traiter en lot…': '⚙ Batch process…',
  'Traiter en lot…': 'Batch process…',
  '⚙ Traiter': '⚙ Process',
  'Traiter': 'Process',
  'en lot…': 'as a batch…',
  '🖼 Photo de la photothèque sélectionnée': '🖼 Photo selected from the library',
  'Photo de la photothèque sélectionnée': 'Photo selected from the library',
  'Choisir une autre photo': 'Choose another photo',
  '← Retour': '← Back',
  'Choisissez une photo': 'Choose a photo',
  'Photo choisie :': 'Photo chosen:',
  'Lecture de la photo…': 'Reading the photo…',
  'Photo prête.': 'Photo ready.',
  'photo prête': 'photo ready',
  'À choisir': 'To choose',
  'Celle de départ, prise en studio sur fond blanc.':
    'The original, shot in studio on a white background.',
  'cette photo': 'this photo',

  /* ── L APERCU EST GRATUIT : LE LEVIER DES CREDITS ───────────────────────── */
  /* ⚠⚠ PHRASE A CREDITS — elle existe pour qu on juge AVANT de payer. */
  'L’aperçu est gratuit : essayez plusieurs mannequins et plusieurs':
    'The preview is free: try several models and several',
  'poses avant de dépenser un crédit.': 'poses before spending a credit.',
  'Aperçu gratuit': 'Free preview',
  'Générer en pleine qualité': 'Generate at full quality',

  /* ── L ETAPE 2 : L AMBIANCE ─────────────────────────────────────────────── */
  /* ⚠ « Ambiance » = PRESET : c est le mot du service, et celui du bouton qui la
     pose. « Mood » aurait ete joli et faux — rien d autre a l ecran ne s appelle
     ainsi, et le relais parle de `preset`. */
  'Aucune ambiance.': 'No preset.',
  'Chargement des ambiances…': 'Loading presets…',
  'Choisissez une ambiance': 'Choose a preset',
  'Choisissez une ambiance.': 'Choose a preset.',
  'ambiance à choisir': 'preset to choose',
  'Un clic règle décor, ombre ancrée et lumière.':
    'One click sets scene, anchored shadow and light.',
  'Comment le vêtement est présenté.': 'How the garment is presented.',

  /* ── LES REGLAGES AVANCES ───────────────────────────────────────────────── */
  'Mise en scène du mannequin': 'Model staging',
  'Celui de l’ambiance choisie': 'The chosen preset’s own',
  'Choisi ici, il remplace celui de l’ambiance. Ce sont les 23 décors que le service':
    'Chosen here, it replaces the preset’s own. These are the 23 scenes the service',
  'connaît : un nom hors liste serait refusé.': 'knows: a name outside the list would be refused.',
  'Sourire naturel (défaut)': 'Natural smile (default)',
  'Sans consigne, le service rend un visage presque fermé — mesuré sur':
    'With no instruction, the service returns an almost closed face — measured on',
  'pièce. Le sourire se demande, il ne vient pas tout seul.':
    'real work. A smile has to be asked for; it does not come on its own.',
  'Précisions libres': 'Free notes',
  'précisions libres': 'free notes',
  'Décor décrit au texte': 'Scene described in words',
  'décor décrit': 'scene described',
  'décrit au texte': 'described in words',
  'Décor voulu': 'Scene wanted',
  'À éviter': 'To avoid',
  'Ce que le décor ne doit pas contenir.': 'What the scene must not contain.',
  'Ombre portée': 'Drop shadow',
  'ombre réglée': 'shadow set',
  'réglée à la main': 'set by hand',
  /* ⚠⚠ « CE N EST PAS UN MELANGE DES DEUX » : sans cette phrase, on croit ajouter
     un reglage a celui de l ambiance alors qu on le remplace entierement. */
  'Régler l’ombre moi-même': 'Set the shadow myself',
  'Décochée, c’est l’ombre de': 'Unticked, it is the shadow of the',
  'l’ambiance qui s’applique. Cochée, vos réglages remplacent entièrement les':
    'preset that applies. Ticked, your settings replace its own',
  'siens — ce n’est pas un mélange des deux.': 'entirely — it is not a blend of the two.',
  'Direction de la lumière': 'Light direction',
  'Pose du sujet': 'Subject pose',
  'Debout, posé au sol (défaut)': 'Standing, set on the ground (default)',
  'À plat, vu de dessus': 'Flat, seen from above',
  '« Debout » ancre le vêtement au sol pour qu’il ne flotte pas. Ne choisissez':
    '« Standing » anchors the garment to the ground so it does not float. Only choose',
  '« à plat » que si la photo est prise à la verticale, au-dessus du vêtement.':
    '« flat » if the photo is taken straight down, above the garment.',
  'Accorder la lumière du sujet au décor': 'Match the subject’s light to the scene',
  /* ⚠⚠ AVERTISSEMENT COMMERCIAL : « un retour », ce sont des frais. */
  '« Préserver la teinte » garde la vraie couleur du tissu : c’est le seul choix sûr':
    '« Preserve hue » keeps the true colour of the fabric: it is the only safe choice',
  'quand on vend l’article sur sa couleur. « Automatique » éclaire mieux mais peut la déplacer —':
    'when the item is sold on its colour. « Automatic » lights better but can shift it —',
  'un bleu nuit qui ressort bleu roi fait un retour.':
    'a midnight blue that comes back royal blue means a return.',
  'Photo de l’intérieur du vêtement': 'Photo of the inside of the garment',
  'photo d’intérieur': 'inside photo',
  'La seconde prise de vue, vêtement retourné — le seul col qui ne soit pas inventé.':
    'The second shot, garment turned inside out — the only collar that is not invented.',
  'Agrandir ×4': 'Upscale ×4',
  'agrandissement ×4': '×4 upscale',
  'Un appel de plus, facturé, après le': 'One more call, billed, after the',
  'Rapide — entrée jusqu’à 1000 px': 'Fast — input up to 1000 px',
  'Lent, plus fin — entrée jusqu’à 512 px': 'Slow, finer — input up to 512 px',
  'Facultatif : l’ambiance en pose déjà un.': 'Optional: the preset already sets one.',
  'Ce qu’il y a derrière le vêtement. Facultatif : l’ambiance en pose déjà un.':
    'What sits behind the garment. Optional: the preset already sets one.',
  'Facultatif : sans réglage, c’est l’ombre de l’ambiance qui s’applique.':
    'Optional: with no setting, the preset’s shadow applies.',
  'Facultatif : accorder la lumière du sujet à celle du décor.':
    'Optional: match the subject’s light to the scene’s.',
  'Facultatif, et facturé un appel de plus .': 'Optional, and billed one more call .',
  'Facultatif, et facturé': 'Optional, and billed',
  'un appel de plus': 'one more call',
  /* ── LE FILIGRANE ───────────────────────────────────────────────────────── */
  /* ⚠ IL NE COUTE RIEN, ET L ECRAN LE DIT DEUX FOIS : c est ce qui distingue ce
     geste de tous les autres de cette fenetre. La phrase se traduit sans perdre
     le « aucun appel, aucun credit ». */
  'Mise en valeur': 'Branding',
  'Aucun logo dans la logothèque.': 'No logo in the logo library.',
  'Ajoutez-en un dans Configuration ▸ Logothèque , puis rouvrez cet écran.':
    'Add one under Configuration ▸ Logo library , then reopen this screen.',
  'Le logo': 'The logo',
  'Où le poser': 'Where to place it',
  'Taille et discrétion': 'Size and subtlety',
  'Largeur du logo': 'Logo width',
  '% de l’image': '% of the image',
  'Appliquer au résultat': 'Apply to the result',
  'Pose du filigrane…': 'Placing the watermark…',
  'Filigrane posé — aucun crédit dépensé.': 'Watermark placed — no credit spent.',
  'Filigrane retiré.': 'Watermark removed.',
  'Filigrane': 'Watermark',
  'Le logo de la marque, posé sur l’image. Aucun appel, aucun crédit.':
    'The brand logo, placed on the image. No call, no credit.',

  /* ── LES PROFILS (les recettes) ─────────────────────────────────────────── */
  '— Aucun —': '— None —',
  '💾 Enregistrer…': '💾 Save…',
  'Aucun profil appliqué — les réglages sont ceux de l’écran.':
    'No profile applied — the settings are those on screen.',
  'Profil «': 'Profile «',
  '» appliqué.': '» applied.',
  'n’existent plus': 'no longer exist',
  'n’existe plus': 'no longer exists',
  '— ce réglage est resté au défaut.': '— that setting stayed at its default.',
  'Tout est en place : il ne reste que la photo à choisir.':
    'Everything is set: only the photo is left to choose.',
  '💾 Enregistrer le profil': '💾 Save the profile',
  'Ce nom est celui du profil choisi : il sera remplacé .':
    'This name is the chosen profile’s: it will be replaced .',
  'Un profil porte déjà ce nom : il sera remplacé .':
    'A profile already has this name: it will be replaced .',
  'il sera remplacé': 'it will be replaced',
  'Donnez-lui un nom.': 'Give it a name.',
  'Enregistrement du profil…': 'Saving the profile…',
  '» enregistré.': '» saved.',
  'Retirer le profil ?': 'Remove the profile?',
  '» sera effacé. Les réglages restent à l’écran :':
    '» will be erased. The settings stay on screen:',
  'c’est le raccourci qui disparaît, pas la mise en scène.':
    'it is the shortcut that goes, not the staging.',
  'Profil retiré.': 'Profile removed.',
  'Profil (facultatif)': 'Profile (optional)',
  '— Garder les réglages de l’écran —': '— Keep the settings from the screen —',
  'Il pose d’un coup la voie, l’ambiance, le mannequin, la':
    'It sets in one go the method, the preset, the model, the',
  'pose, les réglages avancés et le filigrane de ce lot.':
    'pose, the advanced settings and the watermark for this batch.',

  /* ── LA PHOTO D INTERIEUR ───────────────────────────────────────────────── */
  'Photo d’intérieur retirée.': 'Inside photo removed.',
  'Ce n’est pas une image.': 'That is not an image.',
  'Lecture de la photo d’intérieur…': 'Reading the inside photo…',
  'Photo d’intérieur prête.': 'Inside photo ready.',
  'Lecture impossible.': 'Could not read it.',

  /* ── CE QUE LA VOIE CHOISIE FAIT IGNORER ────────────────────────────────── */
  /* ⚠ CETTE LISTE EXISTE POUR QU UN REGLAGE IGNORE NE SE CHERCHE PAS DANS LE
     RESULTAT. Chaque entree est un bout de phrase : « Le service a ignore : … ». */
  'la photo de l’intérieur du vêtement': 'the photo of the inside of the garment',
  'le décor décrit au texte': 'the scene described in words',
  'l’anti-consigne du décor': 'the scene’s negative prompt',
  'la graine du décor': 'the scene seed',
  'la relumière': 'the relighting',
  'l’ombre portée': 'the drop shadow',
  'l’intensité de l’ombre': 'the shadow intensity',
  'la douceur de l’ombre': 'the shadow softness',
  'l’étendue de l’ombre': 'the shadow spread',
  'la direction de l’ombre': 'the shadow direction',
  'la pose du sujet pour l’ombre': 'the subject pose for the shadow',
  'l’expression et les précisions libres': 'the expression and the free notes',
  'le décor du mannequin': 'the model’s scene',

  /* ── LE VOLET DE DROITE : LE RESULTAT ───────────────────────────────────── */
  'Avant': 'Before',
  'Après': 'After',
  'Avant Après': 'Before After',
  'L’« avant » est la vignette de la photothèque : un repère de':
    'The « before » is the library thumbnail: a guide to',
  'cadrage et de couleur, pas un juge de netteté.':
    'framing and colour, not a judge of sharpness.',
  'L’image apparaîtra ici.': 'The image will appear here.',
  '⇔ Avant / après': '⇔ Before / after',
  'Résultat seul': 'Result only',
  'Ce qui sera généré': 'What will be generated',
  'Cliquez « Aperçu gratuit », en bas de la fenêtre':
    'Click « Free preview », at the bottom of the window',
  'Voie :': 'Method:',
  'Pose :': 'Pose:',
  'Modèle :': 'Model:',
  'Modèle': 'Model',
  /* ⚠⚠ PHRASE A CREDITS : elle dit pourquoi l image porte un filigrane et
     comment l enlever — sans elle, on relance un rendu PAYANT pour comprendre. */
  '⚠ Aperçu filigrané (sandbox) — gratuit. « Générer en pleine qualité » retire le filigrane.':
    '⚠ Watermarked preview (sandbox) — free. « Generate at full quality » removes the watermark.',
  '⚠ Le décor n’a pas pu être appliqué :': '⚠ The scene could not be applied:',
  '⚠ Le service a ignoré :': '⚠ The service ignored:',
  '. Le reste du traitement a bien eu lieu.': '. The rest of the job did take place.',
  'Télécharger l’image': 'Download the image',
  '✓ Dans la photothèque': '✓ In the photo library',
  '💾 Enregistrer dans la photothèque': '💾 Save to the photo library',
  'Téléchargement lancé.': 'Download started.',
  'Téléchargement impossible.': 'Download failed.',
  'Déjà enregistrée dans la photothèque.': 'Already saved in the photo library.',
  'Enregistrement dans la photothèque…': 'Saving to the photo library…',
  'Enregistrée dans la photothèque — vous pouvez l’attacher à un article de là.':
    'Saved to the photo library — you can attach it to an item from there.',

  /* ── LES QUATRE FORMATS DE SORTIE ───────────────────────────────────────── */
  'Formats de sortie': 'Output formats',
  'La même image en 3:4, 1:1, 4:5 et 9:16, préparés ici même —':
    'The same image in 3:4, 1:1, 4:5 and 9:16, prepared right here —',
  'aucun appel, aucun crédit .': 'no call, no credit .',
  'aucun appel, aucun crédit': 'no call, no credit',
  '↻ Refaire les 4 formats': '↻ Redo the 4 formats',
  '⚙ Préparer les 4 formats': '⚙ Prepare the 4 formats',
  'Préparation des formats…': 'Preparing the formats…',
  'formats prêts — aucun appel, aucun crédit.': 'formats ready — no call, no credit.',
  'Aucun format n’a pu être préparé.': 'No format could be prepared.',
  'Les formats n’ont pas pu être préparés (': 'The formats could not be prepared (',
  'L’image n’a pas pu être relue pour en tirer des formats.':
    'The image could not be re-read to derive formats from it.',
  'Les formats ne sont pas disponibles dans cette fenêtre.':
    'Formats are not available in this window.',
  '💾 Enregistrer les': '💾 Save the',
  'dans la photothèque': 'in the photo library',
  'en échec.': 'failed.',
  'formats enregistrés dans la photothèque.': 'formats saved in the photo library.',
  'Enregistrement du format': 'Saving format',
  'enregistré dans la photothèque.': 'saved in the photo library.',

  /* ── L EXPLORATEUR DE LA PHOTOTHEQUE ────────────────────────────────────── */
  'Explorateur ouvert dans sa fenêtre.': 'Browser opened in its own window.',
  'Lecture de la photothèque…': 'Reading the photo library…',
  'Chargement de la photothèque…': 'Loading the photo library…',
  'Aucune photo ne correspond à «': 'No photo matches «',
  'Aucune photo dans la photothèque. Importez-en depuis l’écran Photothèque.':
    'No photo in the library. Import some from the Photo library screen.',
  'en cours…': 'in progress…',
  'Produit lié': 'Linked product',
  'Traitement — tous': 'Job — all',
  'Sans «': 'Without «',
  'Tous les lots': 'All batches',
  'Plus récentes': 'Most recent',
  'Liées d’abord': 'Linked first',
  'Plus lourdes': 'Largest',
  '✕ Tout effacer': '✕ Clear all',
  'Aucune sélection': 'No selection',
  'Tout sélectionner (': 'Select all (',
  'Ouvrir cette photo →': 'Open this photo →',
  '⚙ Traiter ces': '⚙ Process these',
  'photos en lot…': 'photos as a batch…',
  '0 résultat': '0 result',
  '— défilez pour en voir plus': '— scroll to see more',

  /* ── LA BOITE DU LOT ────────────────────────────────────────────────────── */
  /* ⚠⚠ TROIS PHRASES DE CETTE BOITE EVITENT DE DEPENSER POUR RIEN, et gardent
     leur fermete : sans logo le lot echouerait photo apres photo ; repasser une
     photo deja traitee coute un appel pour un resultat identique ; chaque photo
     est un appel facture. */
  '⚠ Aucun logo choisi.': '⚠ No logo chosen.',
  'Ouvrez « Filigrane » dans la colonne de gauche et choisissez-en un : sans logo,':
    'Open « Watermark » in the left column and choose one: without a logo,',
  'le lot échouerait photo après photo.': 'the batch would fail photo after photo.',
  'Poser le filigrane réglé à l’écran —': 'Place the watermark as set on screen —',
  '% d’opacité.': '% opacity.',
  'Ce traitement ne passe par aucun service :': 'This job goes through no service:',
  'aucun appel, aucun crédit , qu’il y ait cinq photos ou cinq cents.':
    'no call, no credit , whether there are five photos or five hundred.',
  '⚠ Ce traitement ne passe pas par Photoroom :': '⚠ This job does not go through Photoroom:',
  'ni l’ambiance, ni la mise en scène, ni les réglages avancés n’y changent quoi que ce soit.':
    'neither the preset, nor the staging, nor the advanced settings change anything in it.',
  'Le détourage se fait au détoureur, et il n’a pas de décor à composer.':
    'The cut-out is done by the cut-out tool, and it has no scene to compose.',
  'Aucune ambiance ni mise en scène': 'No preset or staging',
  'choisie à l’écran : le lot partira avec les réglages par défaut.':
    'chosen on screen: the batch will go with the default settings.',
  '⚠ La photo d’intérieur ne suit pas un lot :': '⚠ The inside photo does not follow a batch:',
  'chaque photo utilise celle qui lui est attachée dans la photothèque.':
    'each photo uses the one attached to it in the library.',
  'Appliquer la mise en scène de l’écran —': 'Apply the staging from the screen —',
  'Décochez pour un traitement brut,': 'Untick for a raw job,',
  'sans ambiance ni pose imposée.': 'with no preset or imposed pose.',
  'Mannequin retiré': 'Model removed',
  'Porté par un mannequin': 'Worn by a model',
  'Traitement à appliquer': 'Job to apply',
  'Nom du lot (pour le retrouver dans le suivi)': 'Batch name (to find it again in the tracker)',
  'Priorité haute — ce lot passe devant ceux qui attendent.':
    'High priority — this batch goes ahead of those waiting.',
  'Refaire celles déjà traitées. Par défaut elles sont écartées :':
    'Redo those already processed. By default they are set aside:',
  'les repasser coûte un appel chacune pour un résultat identique.':
    'running them again costs one call each for an identical result.',
  'Refaire': 'Redo',
  'Chaque photo est un appel facturé. Le lot part en arrière-plan :':
    'Each photo is a billed call. The batch runs in the background:',
  'vous pouvez fermer cette fenêtre, le traitement continue et se suit depuis n’importe quel écran.':
    'you can close this window, the job carries on and can be followed from any screen.',
  'Lancer le lot': 'Start the batch',
  'Choisissez les photos du lot.': 'Choose the photos for the batch.',
  'photos ont déjà ce traitement. Cochez « Refaire » pour les repasser.':
    'photos already have this job. Tick « Redo » to run them again.',
  'déjà faite': 'already done',
  ', écartée': ', set aside',
  '. Suivez-le en bas de n’importe quel écran.': '. Follow it at the bottom of any screen.',

  /* ── L ESTIMATION DU COUT ET LE PLAFOND MENSUEL ─────────────────────────── */
  /* ⚠⚠ « LE LOT PEUT PARTIR » EST UNE INFORMATION, PAS UNE EXCUSE : le plafond
     est applique AU SERVEUR. Traduire cette phrase a moitie laisserait croire
     qu un cout non estime est un cout non plafonne. */
  'Estimation du coût…': 'Estimating the cost…',
  'Calcul du coût…': 'Working out the cost…',
  'Coût non estimé — le rendu part quand même.': 'Cost not estimated — the render goes ahead anyway.',
  '· aucun appel facturé': '· no billed call',
  'Le filigrane est posé dans l’application,': 'The watermark is placed inside the application,',
  'au canevas : il ne coûte rien et n’entame pas le plafond mensuel.':
    'on the canvas: it costs nothing and does not eat into the monthly cap.',
  '⚠ Coût non estimé — le relais n’a pas': '⚠ Cost not estimated — the relay did not',
  'répondu (': 'answer (',
  '). Le lot peut partir : le plafond mensuel, lui,': '). The batch can still go: the monthly cap, for its part,',
  'est appliqué au serveur et arrêtera la file s’il est atteint.':
    'is enforced on the server and will stop the queue if it is reached.',
  'Plafond du mois :': 'Cap for the month:',
  '$ dépensés sur': '$ spent of',
  '$ — il reste': '$ — remaining',
  'Aucun plafond mensuel n’est posé': 'No monthly cap is set',
  '(fenêtre « Traitements d’image »).': '(« Image processing » window).',
  'Ce lot ne rentre pas dans le plafond.': 'This batch does not fit within the cap.',
  'Il reste de quoi en traiter': 'There is enough left to process',
  '— désélectionnez-en': '— deselect',
  ', ou relevez le plafond.': ', or raise the cap.',
  'Relevez le plafond mensuel, ou attendez le mois prochain.':
    'Raise the monthly cap, or wait for next month.',

  /* ── LE RENDU, ET LE BOUTON PAYANT QUI S ARME EN DEUX TEMPS ─────────────── */
  /* ⚠⚠ « UN CLIC DE PLUS LANCE UN VRAI RENDU PAYANT » est le dernier garde-fou
     avant la depense. Il reste aussi net en anglais. */
  'Aperçu gratuit en cours…': 'Free preview in progress…',
  'Génération en pleine qualité…': 'Generating at full quality…',
  'Aperçu prêt (gratuit).': 'Preview ready (free).',
  'Image générée.': 'Image generated.',
  'le fantôme habillé demande deux gestes : retirer le mannequin, puis poser le décor':
    'the ghost mannequin takes two steps: remove the model, then set the scene',
  'l’ agrandissement ×4 est un appel de plus, après le traitement':
    'the ×4 upscale is one more call, after the job',
  '👁 Aperçu —': '👁 Preview —',
  'Ce qu’il consomme, ce sont vos aperçus du mois —': 'What it uses up are your previews for the month —',
  'd’un coup — et le résultat sera filigrané .': 'at once — and the result will be watermarked .',
  'appels facturés ≈': 'billed calls ≈',
  'photo. Un mannequin virtuel n’en coûterait qu’un seul.':
    'photo. A virtual model would cost only one.',
  'Pourquoi :': 'Why:',
  'décochez l’agrandissement': 'untick the upscale',
  'passez au « Mannequin virtuel »': 'switch to « Virtual model »',
  'Pour n’en payer qu’un :': 'To pay for only one:',
  'Lancer l’aperçu': 'Start the preview',
  'Lancer —': 'Start —',
  'Confirmer (consomme des crédits)': 'Confirm (uses credits)',
  'Un clic de plus lance un vrai rendu payant.': 'One more click starts a real paid render.',

  /* ── LE MODE DE CONTROLE (les bancs) ────────────────────────────────────── */
  /* ⚠ Ce ne sont pas des textes de l interface : ils ne paraissent que sous le
     drapeau de controle. Ils ont une entree pour que la page anglaise n ait
     nulle part du francais — un banc qui tolere une exception en tolere deux. */
  'photo témoin': 'test photo',
  'le décor n’a pas pu être appliqué (témoin)': 'the scene could not be applied (test)',
  'Agrandissement ignoré : l’entrée dépasse 1000 px (témoin).':
    'Upscale skipped: the input is over 1000 px (test).',
  'Logo témoin': 'Test logo',
  'Logo témoin 2': 'Test logo 2',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════
   * ⚠⚠ POURQUOI CE BLOC. Le COMPTEUR lit le texte RENDU, ou le pictogramme d un
   * <span class="ic"> et le gras d un <strong> ont disparu. Le POSEUR, lui,
   * cherche dans la SOURCE. Une cle ecrite sous la forme rendue ne correspond a
   * rien — et pire : la cle COURTE qu elle contient, elle, se pose, et rend une
   * phrase moitie anglaise (« Priority haute — ce lot passe devant… »).
   * ➡ `langue-poser` liste ce qu il n a pas trouve ; `banc-langue-residuel`
   * tranche sur la page anglaise.
   * ⚠ LE BALISAGE VIT DANS LA CHAINE : la phrase reste entiere, et l anglais
   * place son gras ou sa grammaire le demande.
   * ══════════════════════════════════════════════════════════════════════════ */

  /* ── LES PHRASES COUPEES PAR UN <strong> ────────────────────────────────── */
  'l’ambiance qui s’applique. Cochée, <strong>vos réglages remplacent entièrement les ':
    'preset that applies. Ticked, <strong>your settings replace its own ',
  'siens</strong> — ce n’est pas un mélange des deux.':
    'entirely</strong> — it is not a blend of the two.',
  '« Préserver la teinte » garde la <strong>vraie couleur du tissu</strong> : c’est le seul choix sûr ':
    '« Preserve hue » keeps the <strong>true colour of the fabric</strong>: it is the only safe choice ',
  'Ajoutez-en un dans <strong>Configuration ▸ Logothèque</strong>, puis rouvrez cet écran.':
    'Add one under <strong>Configuration ▸ Logo library</strong>, then reopen this screen.',
  'Ce nom est celui du profil choisi : il sera <strong>remplacé</strong>.':
    'This name is the chosen profile’s: it will be <strong>replaced</strong>.',
  'Un profil porte déjà ce nom : il sera <strong>remplacé</strong>.':
    'A profile already has this name: it will be <strong>replaced</strong>.',
  'Facultatif, et <strong>facturé un appel de plus</strong>.':
    'Optional, and <strong>billed one more call</strong>.',
  /* ⚠⚠ CES DEUX-LA DISENT POURQUOI UN RENDU COUTE DEUX APPELS AU LIEU D UN.
     Les couper en morceaux ferait perdre la raison en gardant le chiffre. */
  'le <strong>fantôme habillé</strong> demande deux gestes : retirer le mannequin, puis poser le décor':
    'the <strong>ghost mannequin</strong> takes two steps: remove the model, then set the scene',
  'l’<strong>agrandissement ×4</strong> est un appel de plus, après le traitement':
    'the <strong>×4 upscale</strong> is one more call, after the job',
  'Ce qu’il consomme, ce sont vos <strong>aperçus du mois</strong> — ':
    'What it uses up are your <strong>previews for the month</strong> — ',
  ' d’un coup — et le résultat sera <strong>filigrané</strong>.':
    ' at once — and the result will be <strong>watermarked</strong>.',
  'Priorité haute': 'High priority',
  '— ce lot passe devant ceux qui attendent.': '— this batch goes ahead of those waiting.',
  'Refaire celles déjà traitées.': 'Redo those already processed.',
  'Par défaut elles sont écartées :': 'By default they are set aside:',
  'Coût non estimé': 'Cost not estimated',
  '— le relais n’a pas': '— the relay did not',
  ', qu’il y ait cinq photos ou cinq cents.': ', whether there are five photos or five hundred.',
  'Aucun logo choisi.': 'No logo chosen.',
  'Poser le filigrane réglé à l’écran': 'Place the watermark as set on screen',
  'Appliquer la mise en scène de l’écran': 'Apply the staging from the screen',
  'Le service a ignoré': 'The service ignored',
  'Le décor n’a pas pu être appliqué :': 'The scene could not be applied:',
  'Ce traitement ne passe pas par Photoroom :': 'This job does not go through Photoroom:',
  'La photo d’intérieur ne suit pas un lot :': 'The inside photo does not follow a batch:',
  'Aperçu filigrané (sandbox) — gratuit. « Générer en pleine qualité » retire le filigrane.':
    'Watermarked preview (sandbox) — free. « Generate at full quality » removes the watermark.',

  /* ── CE QUE LE PICTOGRAMME SEPARE DE SON TEXTE ──────────────────────────── */
  'Enregistrer…': 'Save…',
  'Enregistrer le profil': 'Save the profile',
  'Enregistrer dans la photothèque': 'Save to the photo library',
  'Enregistrer les': 'Save the',
  'Aperçu —': 'Preview —',

  /* ── LA LONGUE TRAINE : LES MOTS SEULS ─────────────────────────────────────
     ⚠⚠ Le compteur ne les voit PAS : `chainesProse` ecarte les chaines d un seul
     mot pour ne pas prendre un identifiant pour une phrase. Ce sont pourtant des
     etiquettes de glissiere, des pastilles et des onglets — lus a chaque usage. */
  'Intensité': 'Intensity',
  'Étendue': 'Spread',
  'Opacité': 'Opacity',
  'Lumière': 'Light',
  'Relumière': 'Relighting',
  'relumière': 'relighting',
  'Intérieur': 'Inside',
  'Détourage': 'Cut-out',
  'Décor': 'Scene',
  'décor': 'scene',
  'Préparation…': 'Preparing…',
  'Aperçu': 'Preview',
  'échec': 'failure',
  'facturé': 'billed',
  'enregistré': 'saved',
  'filigrané': 'watermarked',
  '(défaut)': '(default)',

  /* ── LES ATTRIBUTS QUI S AFFICHENT ──────────────────────────────────────── */
  'Choisissez d’abord une photo': 'Choose a photo first',
  'Position du rideau entre l’avant et l’après': 'Curtain position between before and after',
  /* ⚠ Le <strong> tombe sur le PARTICIPE seul : « Le service a <strong>ignoré</strong> : ».
     On garde la phrase entiere, gras compris — c est elle qui evite de chercher
     dans le resultat un reglage qui n est jamais parti. */
  'Le service a <strong>ignoré</strong> : ': 'The service <strong>ignored</strong>: ',
  /* ── TROIS CLES POUR LE COMPTEUR SEUL (orphelines EXPRES) ───────────────────
     Une case a cocher et son aide sont deux elements voisins : le texte RENDU
     les lit d un trait, la SOURCE les ecrit separement. Les morceaux sont deja
     traduits au-dessus ; ces trois entrees disent au compteur que la phrase
     entiere est DECIDEE. `langue-poser` les signalera comme introuvables : c est
     attendu, et `banc-langue-residuel` est a zero sur cette fenetre. */
  'Régler l’ombre moi-même Décochée, c’est l’ombre de':
    'Set the shadow myself Unticked, it is the shadow of the',
  'Agrandir ×4 Un appel de plus, facturé, après le':
    'Upscale ×4 One more call, billed, after the',
  '· aucun appel facturé Le filigrane est posé dans l’application,':
    '· no billed call The watermark is placed inside the application,'
};
