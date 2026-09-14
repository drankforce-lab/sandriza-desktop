'use strict';

/*
 * CORBEILLE DES COMMANDES — les deux langues (#113, 2026-09-14)
 * =============================================================================
 * ⚠⚠ LA TRADUCTION NE TOUCHE QUE CE QU ON LIT. Jamais un numero de commande, un
 * nom de client, un identifiant de produit ni un montant : ce sont des DONNEES.
 * Le montant passe par `szArgent` et la date par `LIEU()` — ces deux-la suivent
 * la langue sans passer par ce dictionnaire.
 *
 * ⚠ DES PHRASES ENTIERES, pas des morceaux. Les formes singulier/pluriel sont
 * ecrites au complet (<< facture >> / << factures >>) : un << s >> colle a part
 * ne se traduit pas, et en anglais l ordre des mots change.
 *
 * ⚠ TROIS PHRASES DISENT LA MEME CHOSE SUR L ARGENT DE SQUARE, a trois endroits
 * (la pastille de la liste, l avis de la fiche, le compte rendu de la remise en
 * place). Ce n est pas une redite a nettoyer : une mise en garde qui n apparait
 * qu une fois se rate, et ce qui est en jeu est de l argent deja parti chez le
 * client.
 */

module.exports = {
  'Corbeille des commandes — Administration Sandriza': 'Order recycle bin — Sandriza Administration',
  'Corbeille des commandes': 'Order recycle bin',
  'Chargement en cours': 'Loading',

  /* Les motifs de refus, communs a toutes les fenetres — meme formulation. */
  'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.':
    'No session open in the application. Sign in from the main window.',
  'Votre rôle ne permet pas ce geste sur la corbeille.':
    'Your role does not allow this action on the recycle bin.',
  'Ce dossier n’est plus dans la corbeille.': 'This record is no longer in the recycle bin.',
  'Cette commande existe déjà : elle a été recréée depuis la suppression.':
    'This order already exists: it was recreated after the deletion.',
  'L’administration n’est pas encore chargée dans la fenêtre principale.':
    'The administration is not loaded in the main window yet.',
  'La fenêtre principale ne répond pas.': 'The main window is not responding.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not answer in time.',
  'Cette version de l’application ne connaît pas cette opération.':
    'This version of the application does not know this operation.',
  'L’opération a échoué.': 'The operation failed.',
  'Erreur inattendue (': 'Unexpected error (',

  /* ── Les pieces gardees au dossier : singulier et pluriel, entiers ──────── */
  ' factures': ' invoices',
  ' facture': ' invoice',
  ' remboursements': ' refunds',
  ' remboursement': ' refund',
  ' crédits': ' credits',
  ' crédit': ' credit',
  ' retours': ' returns',
  ' retour': ' return',
  ' billets': ' tickets',
  ' billet': ' ticket',
  ' variantes': ' variants',
  ' variante': ' variant',
  'la commande seule': 'the order alone',

  /* ── Le bandeau de totaux ───────────────────────────────────────────────── */
  'consultation seulement': 'view only',
  'Dossiers conservés': 'Records kept',
  'aucune purge automatique': 'no automatic purge',
  'Valeur des commandes': 'Value of the orders',
  'telles qu’elles étaient': 'as they stood',
  'Remboursement déjà parti': 'Refund already sent',
  'ne revient pas à la restauration': 'does not come back on restore',

  /* ── La liste ───────────────────────────────────────────────────────────── */
  'Numéro, client, qui a supprimé': 'Number, customer, who deleted',
  'Numéro, client, qui a supprimé…': 'Number, customer, who deleted…',
  ' dossiers': ' records',
  ' dossier': ' record',
  'Commandes supprimées': 'Deleted orders',
  'Rien ne correspond.': 'Nothing matches.',
  'Aucune commande supprimée. C’est la bonne nouvelle — la corbeille existe pour le jour où ça arrive.':
    'No deleted orders. That is the good news — the recycle bin exists for the day it happens.',
  'Commande': 'Order',
  'Client': 'Customer',
  'Total': 'Total',
  'Supprimée': 'Deleted',
  'Par': 'By',
  'Ce qui est gardé': 'What is kept',
  'recréée': 'recreated',
  'remboursée': 'refunded',
  'Ouvrir': 'Open',
  'Remettre': 'Restore',
  'Confirmer ?': 'Confirm?',
  'Purger': 'Purge',
  'Votre rôle vous laisse consulter la corbeille, mais pas remettre une commande en place ni purger un dossier.':
    'Your role lets you view the recycle bin, but not restore an order or purge a record.',

  /* ── La fiche d un dossier ──────────────────────────────────────────────── */
  '← Retour à la liste': '← Back to the list',
  'Remettre cette commande en place': 'Restore this order',
  'Une commande portant ce numéro existe déjà : elle a été recréée depuis. Ce dossier ne peut plus être remis en place — il ne reste qu’à le consulter ou à le purger.':
    'An order with this number already exists: it was recreated since. This record can no longer be restored — it can only be viewed or purged.',
  'Un remboursement Square de ': 'A Square refund of ',
  ' est parti au moment de la suppression. L’argent est chez le client : remettre la commande en place ne le rappellera pas.':
    ' was sent when the order was deleted. The money is with the customer: restoring the order will not bring it back.',
  'Passée le': 'Placed on',
  'Supprimée le': 'Deleted on',
  'Supprimée par': 'Deleted by',
  'Motif': 'Reason',
  'Ce que le dossier conserve': 'What the record keeps',
  'Articles de la commande': 'Items in the order',
  'Factures': 'Invoices',
  'Remboursements': 'Refunds',
  'Crédits nés d’un remboursement': 'Credits issued from a refund',
  'Crédits dépensés sur cette commande': 'Credits spent on this order',
  'Billets de messagerie': 'Support tickets',
  'Demandes de retour': 'Return requests',
  'Retours archivés': 'Archived returns',
  'Variantes dont le stock a été rendu': 'Variants whose stock was put back',
  'Stock rendu à la suppression': 'Stock put back on deletion',
  'Remettre la commande en place retirera de nouveau ces unités, à partir du stock d’aujourd’hui — une réception faite entre-temps est conservée.':
    'Restoring the order will take these units out again, from today’s stock — a receipt made in between is preserved.',
  'Variante': 'Variant',
  'Unités': 'Units',

  /* ── Le compte rendu de la remise en place ──────────────────────────────── */
  ' crédits recréés': ' credits recreated',
  ' crédit recréé': ' credit recreated',
  ' crédits repris': ' credits taken back',
  ' crédit repris': ' credit taken back',
  ' unités reprises': ' units taken back',
  ' unité reprise': ' unit taken back',
  'Commande ': 'Order ',
  ' remise en place': ' restored',
  ' Le remboursement Square de ': ' The Square refund of ',
  ' ne revient pas : l’argent est chez le client.':
    ' does not come back: the money is with the customer.',
  'Remise en place en cours…': 'Restoring…',

  /* ── La purge, en deux temps ────────────────────────────────────────────── */
  'Cliquez « Confirmer ? » — le dossier et les photos des retours partent pour de bon, et cette commande ne pourra plus être remise en place.':
    'Click “Confirm?” — the record and the return photos go for good, and this order can no longer be restored.',
  'Dossier purgé': 'Record purged',
  ' photos effacées': ' photos deleted',
  ' photo effacée': ' photo deleted',
  'Corbeille indisponible': 'Recycle bin unavailable',

  /* ── Le bouton d ancrage, commun a tous les ecrans ancrables ────────────── */
  '⧉ Détacher': '⧉ Detach',
  'Ouvrir cet écran dans sa propre fenêtre': 'Open this screen in its own window',
  '⚓ Ancrer': '⚓ Dock',
  'Ramener cet écran dans la fenêtre principale': 'Bring this screen back into the main window',
};
