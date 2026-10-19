'use strict';

/*
 * GÉNÉRATIONS — les deux langues (2026-10-18)
 * =============================================================================
 * ⚠⚠ « ARRÊTER » DIT CE QUI EST DÉJÀ FACTURÉ : la phrase de confirmation porte le
 * montant engagé chez The New Black, qui ne revient pas. La perdre à la
 * traduction, c'est laisser croire qu'arrêter rembourse.
 * ⚠ Les noms des étapes, la conformité et les gestes « Publier quand même » /
 * « Rejeter » viennent du dictionnaire du SOCLE (partagés avec la fiche produit).
 * ⚠ Le nom du produit, le SKU et le nom de qui a lancé sont des DONNÉES.
 */

module.exports = {
  'Générations — Administration Sandriza': 'Generations — Sandriza Administration',
  'Lecture des générations…': 'Reading the generations…',
  'Filtrer les générations': 'Filter the generations',
  'Générations lancées': 'Generations launched',
  'Aucune session ouverte dans l’application.': 'No session open in the application.',
  'Votre rôle ne permet pas de gérer les aperçus 3D.': 'Your role does not allow managing 3D previews.',
  'Cette génération n’est plus dans la liste.': 'This generation is no longer in the list.',
  /* ── Les onze étapes : ce que chacune fait ── */
  'La photo du devant part chez The New Black avec la demande de modèle 3D.': 'The front photo is sent to The New Black with the 3D model request.',
  'The New Black sculpte le vêtement en 3D d’après la photo du devant. Le coût est engagé dès cette étape.': 'The New Black sculpts the garment in 3D from the front photo. The cost is committed from this step.',
  'Le modèle brut (GLB) est rapatrié sur ce poste.': 'The raw model (GLB) is downloaded to this computer.',
  'Les photos devant et dos sont détourées, puis alignées sur la silhouette du modèle.': 'The front and back photos are cut out, then aligned on the model’s silhouette.',
  'Vos vraies photos sont peintes sur le modèle : tissu, coutures et boutons viennent d’elles.': 'Your real photos are painted onto the model: fabric, seams and buttons come from them.',
  'Les reliefs ajoutés par The New Black sous les photos sont aplanis ; la silhouette ne bouge pas.': 'Relief added by The New Black under the photos is flattened; the silhouette does not move.',
  'Une seule teinte tout autour, celle de la photo principale — vérifiée au rendu de la boutique sous huit angles.': 'One colour all around, that of the main photo — checked in the store’s rendering from eight angles.',
  'Textures et géométrie allégées pour la boutique : 2 Mo au plus.': 'Textures and geometry lightened for the store: 2 MB at most.',
  'Le modèle est comparé aux photos devant et dos ; sous le seuil, il attend votre confirmation.': 'The model is compared with the front and back photos; below the threshold, it awaits your confirmation.',
  'Le modèle est déposé dans le stockage, et son rendu rangé dans la photothèque.': 'The model is uploaded to storage, and its render filed in the photo library.',
  'L’aperçu 3D est posé sur la fiche du produit et visible en boutique.': 'The 3D preview is placed on the product and visible in the store.',
  /* ── États, groupes, filtres ── */
  'En cours': 'In progress',
  'À confirmer': 'To confirm',
  'Échouée': 'Failed',
  'Terminées': 'Finished',
  'Échouées': 'Failed',
  'Échouées, interrompues ou rejetées': 'Failed, interrupted or rejected',
  'Toutes': 'All',
  'À traiter': 'To handle',
  'génération': 'generation',
  'générations': 'generations',
  'Aucune génération dans ce filtre.': 'No generation in this filter.',
  'Aucune génération lancée pour l’instant. Un aperçu 3D se lance depuis la fiche d’un produit.': 'No generation launched yet. A 3D preview is launched from a product’s page.',
  /* ── Le détail ── */
  'Choisissez une génération dans la liste pour en voir le détail.': 'Choose a generation in the list to see its details.',
  'Les aperçus 3D lancés depuis les fiches des produits paraissent ici, avec leur suivi étape par étape.': '3D previews launched from product pages appear here, tracked step by step.',
  'Aperçu 3D · The New Black, Image to 3D': '3D preview · The New Black, Image to 3D',
  'Lancée le {d} par {p}': 'Launched on {d} by {p}',
  'durée {t}': 'duration {t}',
  'coût {c}': 'cost {c}',
  '≈ {t} restantes': '≈ {t} remaining',
  'presque fini': 'almost done',
  '{s} s': '{s} s',
  '{m} min {s} s': '{m} min {s} s',
  'votre décision': 'your decision',
  'Étape {n} sur {t} : {e}': 'Step {n} of {t}: {e}',
  'Vous pouvez fermer cette fenêtre, la génération continue.': 'You can close this window, the generation continues.',
  'Arrêter la génération': 'Stop the generation',
  'Ouvrir la fiche': 'Open the product',
  'Retirer de la liste': 'Remove from the list',
  '{n} sont déjà engagés chez The New Black : ce montant ne sera pas remboursé. Les photos de la fiche seront déverrouillées et rien ne sera posé.':
    '{n} is already committed at The New Black: this amount will not be refunded. The product photos will be unlocked and nothing will be placed.',
  'Produit': 'Product',
  '{m} $ US': 'US${m}',
  'Montant engagé': 'Amount committed',
  /* ── Le sous-titre et les messages ── */
  '{n} en cours': '{n} in progress',
  '{m} engagés': '{m} committed',
  '{n} à confirmer': '{n} to confirm',
  'rien en cours': 'nothing in progress',
  'Génération arrêtée.': 'Generation stopped.',
  'Modèle publié sur la fiche.': 'Model published on the product.',
  'Modèle rejeté.': 'Model rejected.',
  'Retirée de la liste.': 'Removed from the list.',
  "teinte uniforme à ΔE {u} (face/photo ΔE {p})": "colour uniform within ΔE {u} (front/photo ΔE {p})",
  "Retraite l’aperçu au poste — sans nouvel appel payant": "Reprocesses the preview on this computer — no new paid call",
  "Refaire la couleur": "Redo the colour",
  "Refaire la couleur de l’aperçu 3D": "Redo the colour of the 3D preview",
  "Le modèle est retraité au poste : la teinte de toute la surface est ramenée sur celle de la photo principale, vérifiée au rendu de la boutique sous huit angles, puis l’aperçu est reposé sur la fiche. Aucun nouvel appel payant.": "The model is reprocessed on this computer: the colour of the whole surface is brought to that of the main photo, checked in the store’s rendering from eight angles, then the preview is placed back on the product. No new paid call.",
  "Coût": "Cost",
  "0 $ — sans nouvel appel": "$0 — no new call",
  "Couleur refaite · sans nouvel appel payant": "Colour redone · no new paid call",
  "Une génération est déjà en cours pour cet article.": "A generation is already in progress for this item.",
  "Couleur en cours de retraitement.": "Colour being reprocessed.",
  /* ── Le Studio rattaché au produit (2026-10-19) ── */
  "Contrôle du prix": "Price check",
  "Le prix est redemandé et comparé au montant affiché ; s’il a changé, rien ne part.": "The price is asked again and compared with the amount shown; if it changed, nothing is sent.",
  "Retrait du mannequin chez The New Black": "Mannequin removal at The New Black",
  "The New Black refait le vêtement sans mannequin, au palier choisi (Standard, Pro ou Ultra).": "The New Black remakes the garment without the mannequin, at the chosen tier (Standard, Pro or Ultra).",
  "La couleur du rendu est ramenée sur celle de la photo source.": "The render’s colour is brought to that of the source photo.",
  "Détourage et finition": "Cut-out and finishing",
  "Le fond est retiré ou mis à la couleur de l’ambiance, le contour lissé, le cadrage resserré.": "The background is removed or set to the scene colour, the outline smoothed, the framing tightened.",
  "Sans mannequin": "No mannequin",
  "Vêtement sans mannequin · The New Black": "Garment without mannequin · The New Black",
  "le résultat s’affiche dans le Studio, où il s’enregistre ou se place.": "the result appears in the Studio, where it is saved or placed.",
  "Photo": "Photo",
};
