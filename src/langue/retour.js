'use strict';

/*
 * DEMANDE DE RETOUR — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN REND DE L ARGENT ET ACHETE DES ETIQUETTES. Quatre phrases n y
 * sont que pour empecher une depense ou un geste irreversible, et elles gardent
 * leur fermete en anglais :
 *   · « regenerer sera FACTURE une seconde fois » — l etiquette Postes Canada
 *     est reelle ; la REPRENDRE ne coute rien, la REGENERER coute ;
 *   · « aucun nouvel envoi n a ete cree, rien n a ete facture » (la reprise) ;
 *   · « un remboursement ne s annule pas d un clic » ;
 *   · « cette action est irreversible » + « la photo envoyee par le client est
 *     effacee du stockage » (suppression de la demande).
 *
 * ⚠⚠ « POSTES CANADA » SE TRADUIT — c est une societe d Etat BILINGUE dont le
 * nom anglais officiel est CANADA POST. Le garder en francais dans un ecran
 * anglais ferait chercher un transporteur qui n existe pas sous ce nom-la.
 * ⚠ A l inverse « Square » est un nom de service : il ne se traduit pas.
 *
 * ⚠⚠ ON NE TRADUIT QUE LES LIBELLES. Les ETATS de la demande sont des cles
 * anglaises (`awaiting_photo`, `in_transit`, `refunded`…) : seul le libelle
 * affiche est ici. La description du client, ses notes et le numero de suivi
 * sont de la DONNEE.
 *
 * ⚠ LA FENETRE DE RETOUR EN JOURS OUVRABLES DECIDE DU MOYEN DE REMBOURSEMENT
 * (moyen original, ou credit boutique seulement). Les deux phrases qui l ecrivent
 * doivent rester precises : c est la politique, pas une nuance de style.
 */

module.exports = {
  /* ── L EN-TETE ET LES ETATS ─────────────────────────────────────────────── */
  'Demande de retour — Administration Sandriza': 'Return request — Sandriza Administration',
  'Demande de retour': 'Return request',
  'Retour indisponible': 'Return unavailable',
  'Retour —': 'Return —',
  'Demande —': 'Request —',
  'Photo requise': 'Photo required',
  'En attente': 'Pending',
  'Approuvée': 'Approved',
  'Rejetée': 'Rejected',
  'En transit': 'In transit',
  'Reçu — en traitement': 'Received — in progress',
  'Remboursée': 'Refunded',
  'Complétée': 'Completed',
  'En attente d’analyse': 'Awaiting review',
  'Lecture seule': 'Read only',
  'Ce dossier est déjà ouvert ailleurs — lecture seule conseillée.':
    'This file is already open elsewhere — read only is advised.',
  '🗄 Demande archivée — lecture seule.': '🗄 Request archived — read only.',
  '1 Demande': '1 Request',
  '2 Traitement': '2 Processing',
  '3 Règlement': '3 Settlement',

  /* ── LES REFUS ──────────────────────────────────────────────────────────── */
  'Votre rôle ne permet pas de traiter les retours.':
    'Your role does not allow processing returns.',
  'Cette demande n’existe plus.': 'This request no longer exists.',
  'Dossier ouvert par quelqu’un d’autre.': 'File open by someone else.',
  'Échange impossible : l’article n’est plus disponible.':
    'Exchange not possible: the item is no longer available.',
  'La taille réservée n’a pas pu être libérée — réessayez.':
    'The reserved size could not be released — try again.',
  'Une raison est requise pour chaque article non remis en inventaire.':
    'A reason is required for each item not put back into inventory.',
  'Montant du remboursement invalide.': 'Invalid refund amount.',
  'Aucune étiquette générée pour cette demande.': 'No label generated for this request.',
  'Aucun envoi Postes Canada n’est rattaché à cette demande — il n’y a rien à reprendre. Générez l’étiquette depuis l’étape Décision.':
    'No Canada Post shipment is attached to this request — there is nothing to fetch back. Generate the label from the Decision step.',
  'Identifiants Postes Canada indisponibles.': 'Canada Post credentials unavailable.',
  'Configuration Postes Canada incomplète — Configuration → Transporteurs.':
    'Canada Post configuration incomplete — Configuration → Carriers.',
  'Postes Canada a refusé la demande.': 'Canada Post refused the request.',
  'Postes Canada n’a pas renvoyé de PDF pour cet envoi.':
    'Canada Post returned no PDF for this shipment.',
  'Le réseau n’a pas répondu.': 'The network did not answer.',
  'Commande originale introuvable.': 'Original order not found.',
  'Suggestion de remboursement indisponible.': 'Refund suggestion unavailable.',
  'Raison requise pour «': 'Reason required for «',
  'Basculez sur': 'Switch to',
  'un crédit boutique.': 'a store credit.',
  'un remboursement complet.': 'a full refund.',

  /* ── ETAPE 1 : LA DEMANDE ───────────────────────────────────────────────── */
  'Description du client': 'Customer’s description',
  'Mode communiqué au client': 'Method told to the customer',
  'Crédit boutique uniquement': 'Store credit only',
  'Moyen original ou crédit, au choix': 'Original method or credit, their choice',
  '· préférence :': '· preference:',
  'crédit boutique': 'store credit',
  'Crédit boutique': 'Store credit',
  'Frais de retour': 'Return shipping cost',
  '🛠 Pris en charge par la boutique (défaut / erreur)':
    '🛠 Covered by the shop (defect / error)',
  '📦 À la charge du client': '📦 Paid by the customer',
  'Articles —': 'Items —',
  'Photo de l’article': 'Photo of the item',
  '⏳ Le client n’a pas encore téléversé de photo — la demande n’est pas actionnable.':
    '⏳ The customer has not uploaded a photo yet — the request cannot be acted on.',
  'Retour expédié par le client': 'Return shipped by the customer',
  'Numéro de suivi': 'Tracking number',
  'Réponse du client — suite au rejet automatique':
    'Customer’s reply — after the automatic rejection',
  '(aucun message écrit)': '(no written message)',
  '↩ Rouvrir la demande': '↩ Reopen the request',
  '✕ Confirmer le rejet': '✕ Confirm the rejection',
  'Pas de changement de statut tant que la photo n’est pas fournie — seules les notes s’enregistrent.':
    'No status change until the photo is provided — only the notes are saved.',
  '— seules les notes s’enregistrent.': '— only the notes are saved.',
  'Note de refus — visible au client': 'Rejection note — visible to the customer',

  /* ── L ETIQUETTE DE RETOUR : REPRENDRE NE COUTE RIEN, REGENERER COUTE ───── */
  /* ⚠⚠ C EST LA DISTINCTION LA PLUS CHERE DE L ECRAN. Elle reste explicite. */
  '📦 Étiquette de retour': '📦 Return label',
  '👁 Étiquette de retour': '👁 Return label',
  '👁 Étiquette': '👁 Label',
  'Étiquette :': 'Label:',
  '⚠ Une étiquette existe déjà (': '⚠ A label already exists (',
  'réelle Postes Canada — la régénérer sera FACTURÉ une seconde fois':
    'a real Canada Post one — regenerating it WILL BE BILLED a second time',
  'PDF interne': 'internal PDF',
  'Service Postes Canada': 'Canada Post service',
  'Poids (kg)': 'Weight (kg)',
  'Régénérer et joindre au courriel': 'Regenerate and attach to the email',
  'Générer et joindre l’étiquette au courriel': 'Generate and attach the label to the email',
  '💡 Postes Canada non configuré : un PDF interne sera généré (sans suivi réel).':
    '💡 Canada Post not configured: an internal PDF will be generated (with no real tracking).',
  'Reprendre chez Postes Canada': 'Fetch back from Canada Post',
  'Reprendre l’étiquette': 'Fetch the label back',
  'Reprise de l’étiquette chez Postes Canada…': 'Fetching the label back from Canada Post…',
  'Étiquette reprise — aucun nouvel envoi n’a été créé, rien n’a été facturé.':
    'Label fetched back — no new shipment was created, nothing was billed.',
  '🔁 Renvoyer au client': '🔁 Send to the customer again',
  'Étiquette renvoyée au client.': 'Label sent to the customer again.',
  'Étiquette prête, mais courriel non envoyé': 'Label ready, but email not sent',

  /* ── LES GESTES DE L ETAPE 2 ────────────────────────────────────────────── */
  'Notes internes (jamais vues du client)': 'Internal notes (never seen by the customer)',
  '📬 Marquer reçu': '📬 Mark as received',
  'Enregistrer + courriel': 'Save + email',
  'Enregistrer les notes': 'Save the notes',
  '🗑 Supprimer': '🗑 Delete',
  '📬 Réception du colis Confirmer la réception du colis de retour en entrepôt ?':
    '📬 Parcel received Confirm the return parcel has arrived at the warehouse?',
  'Réception du colis': 'Parcel received',
  'Confirmer la réception du colis de retour en entrepôt ?':
    'Confirm the return parcel has arrived at the warehouse?',
  'Annuler Confirmer': 'Cancel Confirm',
  'Retour marqué reçu.': 'Return marked as received.',
  'Demande rouverte — marquée comme reçue.': 'Request reopened — marked as received.',
  'Rejet confirmé.': 'Rejection confirmed.',
  'Une modification de cette demande': 'A change to this request',
  'Demande mise à jour.': 'Request updated.',
  'Courriel envoyé.': 'Email sent.',
  'Courriel NON envoyé :': 'Email NOT sent:',
  '» (étape Traitement).': '» (Processing step).',

  /* ── LA DECISION INVENTAIRE ─────────────────────────────────────────────── */
  'Décision inventaire — par article': 'Inventory decision — per item',
  'Décision inventaire —': 'Inventory decision —',
  'La remise en stock incrémente la VARIANTE (taille · couleur) reprise de la commande d’origine.':
    'Putting it back in stock increments the VARIANT (size · colour) taken from the original order.',
  '✅ Remettre en inventaire': '✅ Put back into inventory',
  '❌ Ne pas remettre': '❌ Do not put back',
  'Raison (obligatoire)': 'Reason (required)',
  'Non remis en stock :': 'Not put back in stock:',

  /* ── LA REEXPEDITION ────────────────────────────────────────────────────── */
  'Réexpédition au client — échange ou renvoi': 'Reshipment to the customer — exchange or resend',
  'La fenêtre Expédition fait ce travail — service, poids et confirmation avant de dépenser.':
    'The Shipping window does this work — service, weight and confirmation before spending.',
  '🚚 Ouvrir l’expédition de la commande': '🚚 Open the order’s shipping',
  'Ouverture de l’expédition…': 'Opening the shipping…',
  'Expédition ouverte dans sa fenêtre.': 'Shipping opened in its own window.',
  'Vers le règlement →': 'To the settlement →',

  /* ── ETAPE 3 : LE REGLEMENT ─────────────────────────────────────────────── */
  /* ⚠⚠ LA FENETRE EN JOURS OUVRABLES DECIDE DU MOYEN : c est la politique de
     retour, pas une nuance de style. Les deux phrases restent precises. */
  '💰 Règlement — si « Remboursée »': '💰 Settlement — if « Refunded »',
  'jours ouvrables — dans la fenêtre de': 'business days — within the return',
  ': moyen original ou crédit, au choix.': ' window: original method or credit, their choice.',
  'jours ouvrables — hors fenêtre de': 'business days — outside the return',
  ': crédit boutique uniquement.': ' window: store credit only.',
  '(2 pour 1 — 50 % suggéré, plein :': '(2 for 1 — 50 % suggested, full:',
  'Montant à rembourser —': 'Amount to refund —',
  'Frais de livraison (': 'Delivery cost (',
  '— non suggéré (motif client)': '— not suggested (customer’s own reason)',
  'Traitement prioritaire (': 'Priority handling (',
  ') jamais remboursable — exclu.': ') never refundable — excluded.',
  'Les taxes sont recalculées par le site aux taux réels de la commande.':
    'Taxes are recalculated by the site at the order’s real rates.',
  'Moyen de paiement original': 'Original payment method',
  '(aucun paiement Square lié)': '(no Square payment linked)',
  '👤 Préférence du client :': '👤 Customer’s preference:',
  'Résolution finale': 'Final resolution',
  'Complétée (échange / crédit — aucun remboursement émis ici)':
    'Completed (exchange / credit — no refund issued here)',
  'Note pour le client (facultative)': 'Note for the customer (optional)',
  '✅ Finaliser le traitement': '✅ Finalise the processing',

  /* ── LA CONFIRMATION DU REMBOURSEMENT ───────────────────────────────────── */
  /* ⚠⚠ « UN REMBOURSEMENT NE S ANNULE PAS D UN CLIC » est le dernier garde-fou
     avant que l argent parte. Il reste aussi net en anglais. */
  '💳 Rembourser et clore ?': '💳 Refund and close?',
  'Clore le dossier ?': 'Close the file?',
  'Articles :': 'Items:',
  '(+ taxes aux taux réels)': '(+ taxes at the real rates)',
  'Méthode :': 'Method:',
  'moyen de paiement original (Square)': 'original payment method (Square)',
  'Un remboursement ne s’annule pas d’un clic.': 'A refund cannot be undone with a click.',
  'Aucun remboursement ne sera émis ici — le règlement s’est fait autrement (échange, crédit déjà émis…).':
    'No refund will be issued here — the settlement was made another way (exchange, credit already issued…).',
  'Règlement en cours…': 'Settling…',
  'Retour traité.': 'Return processed.',
  ') émis.': ') issued.',
  'Square a échoué :': 'Square failed:',

  /* ── LA SUPPRESSION ─────────────────────────────────────────────────────── */
  /* ⚠⚠ LA PHOTO DU CLIENT EST EFFACEE DU STOCKAGE : sans cette phrase on croit
     ne retirer qu une ligne de liste. */
  'Seule une demande terminée peut être supprimée.': 'Only a finished request can be deleted.',
  '🗑 Supprimer la demande': '🗑 Delete the request',
  'La demande disparaît de la liste': 'The request disappears from the list',
  ', et la photo envoyée par le client est effacée du stockage':
    ', and the photo sent by the customer is erased from storage',
  '⚠ Cette action est irréversible.': '⚠ This action cannot be undone.',
  'Supprimer définitivement': 'Delete permanently',
  'Demande supprimée.': 'Request deleted.',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════
   * Le pictogramme vit dans son `<span class="ic">`, et le sous-titre d une
   * carte dans son `<span class="note">`. Le COMPTEUR lit le texte rendu, le
   * POSEUR la source : il faut les deux formes.
   * ⚠ On ne met JAMAIS `class="…"` dans une cle — le poseur le refuse depuis
   * produit : posee, elle ressortirait echappee et sortirait le pictogramme de
   * la regle du noir et blanc. On coupe avant, on reprend apres.
   * ══════════════════════════════════════════════════════════════════════════ */
  'Pris en charge par la boutique (défaut / erreur)': 'Covered by the shop (defect / error)',
  'À la charge du client': 'Paid by the customer',
  'Demande archivée — lecture seule.': 'Request archived — read only.',
  'Étiquette de retour': 'Return label',
  'Une étiquette existe déjà (': 'A label already exists (',
  'Postes Canada non configuré : un PDF interne sera généré (sans suivi réel).':
    'Canada Post not configured: an internal PDF will be generated (with no real tracking).',
  'Marquer reçu': 'Mark as received',
  'Remettre en inventaire': 'Put back into inventory',
  'Ne pas remettre': 'Do not put back',
  'Ouvrir l’expédition de la commande': 'Open the order’s shipping',
  'Préférence du client : ': 'Customer’s preference: ',
  'Finaliser le traitement': 'Finalise the processing',
  'Réception du colis': 'Parcel received',
  'Rembourser et clore ?': 'Refund and close?',
  'Supprimer la demande': 'Delete the request',
  'Cette action est irréversible.': 'This action cannot be undone.',
  'et la photo envoyée par le client est effacée du stockage':
    'and the photo sent by the customer is erased from storage',
  'Étiquette': 'Label',

  /* ── LE SOUS-TITRE D UNE CARTE, DANS SON PROPRE <span class="note"> ─────── */
  'Décision inventaire ': 'Inventory decision ',
  '— par article': '— per item',
  'Décision inventaire — ': 'Inventory decision — ',
  'Réexpédition au client ': 'Reshipment to the customer ',
  '— échange ou renvoi': '— exchange or resend',
  'Règlement ': 'Settlement ',
  '— si « Remboursée »': '— if « Refunded »',
  'Réponse du client ': 'Customer’s reply ',
  '— suite au rejet automatique': '— after the automatic rejection',

  /* ── LA LONGUE TRAINE ───────────────────────────────────────────────────── */
  'Décision': 'Decision',
  'Réception…': 'Receiving…',
  'Archivée': 'Archived',
  'Crédit': 'Credit',
  'Dossier ': 'File ',
  'remboursé': 'refunded',
  'complété': 'completed',
  'Le dossier doit être approuvé ou reçu': 'The file must be approved or received',

  /* ── CE QUE LE BANC RESIDUEL A TROUVE ──────────────────────────────────── */
  'Confirmer': 'Confirm',
  'Expliquez la raison du refus…': 'Explain the reason for the refusal…',
  'Redemande le PDF de l’envoi déjà créé chez Postes Canada. Aucun nouvel envoi n’est commandé, rien n’est facturé.': 'Asks Canada Post again for the PDF of the shipment already created. No new shipment is ordered, nothing is charged.',
  'Ex : article endommagé, article porté…': 'E.g. damaged item, worn item…',
  'Issue du retour': 'Outcome of the return',
  'Demande': 'Request',
  '🔁 Renvoyer au client': '🔁 Send back to the customer',
  'Renvoyer au client': 'Send back to the customer',
};
