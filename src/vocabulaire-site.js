'use strict';
/*
 * LE VOCABULAIRE DU SITE, EN ANGLAIS — POUR L'AFFICHAGE SEULEMENT
 * =============================================================================
 * Relevé le 2026-09-25 : en anglais, les fenêtres montraient en français tout
 * ce que le SITE leur envoie déjà mis en mots — statuts des commandes, des
 * factures, des retours, des cartes-cadeaux, des conversations, filtres et
 * traitements de la photothèque. Les dictionnaires de src/langue/ ne pouvaient
 * rien y faire : ils traduisent le texte ÉCRIT dans une fenêtre, à la
 * génération, pas une donnée reçue ensuite.
 *
 * ➡ CETTE TABLE, AVEC szTd() DU SOCLE, TRADUIT À L'AFFICHAGE, ET À L'AFFICHAGE
 *   SEULEMENT. La fenêtre reçoit « Payée », l'affiche « Paid » ; ce qui repart au
 *   site reste le CODE (paid), jamais ce texte. C'est sa consigne du 2026-09-12 :
 *   « la traduction doit affecter que la lecture et non pas les données
 *   enregistrées ».
 * ⚠ UN LIBELLÉ ABSENT RESTE EN FRANÇAIS : jamais un trou, jamais une clé brute.
 *   Un statut ajouté demain au site s'affichera en français tant qu'il n'est pas
 *   ici — ce qui se voit, et se corrige d'une ligne.
 * ⚠ LES CLÉS SONT LES LIBELLÉS DU SITE, MOT POUR MOT. Leurs sources, pour les
 *   relire quand elles changent :
 *     admin.js      ORDER_STATUS, _RET_LIBELLES, statuts de facture
 *     pont.js       _FACT_LIBELLES
 *     livechat.js   _STATUS
 *     promo.js      LIB (cartes-cadeaux)
 *     photos.js     EXPL_FILTRES, _TRAITEMENTS
 *     photoroom-proxy.php  les ambiances du Studio (label, desc)
 *     staff.js      ROLES[…].label (les roles du personnel)
 */
module.exports = {
  /* Caisse (pont.js, caisse:contexte — paiements et remises), 2026-09-29 */
  'Terminal Square (reçu)': 'Square terminal (receipt)',
  'Comptant (reçu)': 'Cash (receipt)',
  'Interac (reçu)': 'Interac (receipt)',
  'Autre (reçu)': 'Other (receipt)',
  'Lien de paiement (téléphone)': 'Payment link (phone)',
  '✉ Envoyer par courriel': '✉ Send by email',
  '🖨 Imprimer seulement': '🖨 Print only',
  '✉ + 🖨 Courriel et impression': '✉ + 🖨 Email and print',
  'Ne rien faire': 'Do nothing',
  // Commandes (ORDER_STATUS)
  'En attente': 'Pending',
  'Confirmée': 'Confirmed',
  'En préparation': 'Preparing',
  'Vérification': 'Verification',
  'En livraison': 'Out for delivery',
  'Livrée': 'Delivered',
  'Annulée': 'Cancelled',
  // Factures (_FACT_LIBELLES)
  'Non payée': 'Unpaid',
  'Payée': 'Paid',
  'En retard': 'Overdue',
  // Retours (_RET_LIBELLES)
  'Photo requise': 'Photo required',
  'Approuvée': 'Approved',
  'Rejetée': 'Rejected',
  'En transit': 'In transit',
  'Reçu — en traitement': 'Received — processing',
  'Remboursée': 'Refunded',
  'Complétée': 'Completed',
  'En attente d’analyse': 'Under review',
  // Conversations (livechat _STATUS)
  'Ouvert': 'Open',
  'Fermé': 'Closed',
  // Cartes-cadeaux (promo LIB)
  'Utilisée': 'Used',
  'Expirée': 'Expired',
  'Activation requise': 'Activation required',
  // Photothèque : filtres (EXPL_FILTRES) et traitements (_TRAITEMENTS)
  'A déjà reçu un traitement': 'Already processed',
  'Jamais traitée': 'Never processed',
  'Détourée (fond transparent)': 'Cut out (transparent background)',
  'Fond d’origine': 'Original background',
  'Rattachée à un produit': 'Linked to a product',
  'Aucun produit': 'No product',
  'Téléversement en cours': 'Uploading',
  'Détourage': 'Background removal',
  'Mannequin retiré': 'Mannequin removed',
  'Porté par un mannequin': 'Worn by a model',
  'Filigrane / logo': 'Watermark / logo',
  // Studio : les ambiances du relais (photoroom-proxy.php, label et desc)
  'Studio épuré': 'Clean studio',
  'Fond neutre, lumière douce — l’article seul, net.': 'Neutral backdrop, soft light — the item alone, crisp.',
  'Plage dorée': 'Golden beach',
  'Sable, mer, lumière dorée de fin de journée.': 'Sand, sea, golden late-day light.',
  'Béton chic': 'Chic concrete',
  'Béton clair, urbain minimal, ombre franche.': 'Light concrete, minimal urban, crisp shadow.',
  'Verdure': 'Greenery',
  'Végétation, lumière naturelle, frais et aéré.': 'Plants, natural light, fresh and airy.',
  'Nuit lumières': 'City lights',
  'Lumières de ville floutées, ambiance éditoriale.': 'Blurred city lights, editorial mood.',
  // Roles du personnel (staff.js, ROLES[…].label) — affiches par Personnel connecte
  'Super-administrateur': 'Super administrator',
  'Administrateur': 'Administrator',
  'Gérant de boutique': 'Store manager',
  'Comptable': 'Accountant',
  'Commis à la livraison': 'Shipping clerk',
  'Commis à la préparation de commandes': 'Order picking clerk',
  'Commis à l’inventaire': 'Inventory clerk',
  'Service à la clientèle': 'Customer service',
  'Marketing': 'Marketing',
  'Consultation seulement': 'Read-only',
};
