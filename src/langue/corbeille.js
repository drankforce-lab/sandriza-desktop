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

  /* ── LE REMBOURSEMENT SQUARE, LES EN-TETES ET LES COMPTES (2026-09-18) ───
     ⚠ LES DEUX PHRASES SUR SQUARE SONT COUPEES AUTOUR D UN MONTANT, et c est
     ce qui compte le plus a l ecran : l argent est deja parti chez la cliente,
     et remettre la commande ne le rappelle pas. Le montant s intercale ; les
     recoller obligerait a traduire un chiffre.
     ⚠⚠ SINGULIER ET PLURIEL ONT CHACUN LEUR ENTREE, et l anglais ne suit PAS le
     francais : << crédit recréé >> / << crédits recréés >> ne different que par
     l accord, qui n existe pas en anglais — les deux valeurs anglaises se
     ressemblent donc, et ce n est pas un copier-coller manque.
     ⚠ Ces fragments se collent a un NOMBRE ecrit avant eux : minuscule, pas de
     sujet, pas de point. */
  'Commande Client': 'Order Customer',
  'Total Supprimée Par': 'Total Deleted By',
  'Variante Unités': 'Variant Units',
  'Un remboursement Square de': 'A Square refund of',
  'est parti au moment de la suppression. L’argent est chez le client : remettre la commande en place ne le rappellera pas.':
    'went out at the moment of deletion. The money is with the customer: restoring the order will not bring it back.',
  'Le remboursement Square de': 'The Square refund of',
  'ne revient pas : l’argent est chez le client.':
    'does not come back: the money is with the customer.',
  'crédit recréé': 'credit recreated',
  'crédits recréés': 'credits recreated',
  'crédit repris': 'credit taken back',
  'crédits repris': 'credits taken back',
  'unité reprise': 'unit taken back',
  'unités reprises': 'units taken back',
  'photo effacée': 'photo deleted',
  'photos effacées': 'photos deleted',
  'remise en place': 'restored',
  // La refonte, comme l'Inventaire (2026-09-25).
  'Client et commande': 'Customer and order',
  'par ': 'by ',
  'Client et commande Total Supprimée': 'Customer and order Total Deleted',
  'Total Supprimée': 'Total Deleted',
  // 2026-10-15 : confirmations en boîte à part.
  'Purger le dossier': 'Purge the record',
  'Le dossier de la commande': 'The record for order',
  'et les photos des demandes de retour seront effacés définitivement. Cette commande ne pourra plus être remise en place. Cette action est irréversible.': 'and the return request photos will be permanently deleted. This order can no longer be restored. This action cannot be undone.',
  'Montant': 'Amount',
  // 2026-10-25, audit : la remise en place se confirme.
  'Remettre la commande en place': 'Restore the order',
  'La commande revient dans la liste des commandes, avec ses factures, ses crédits et son stock.': 'The order returns to the order list, with its invoices, credits and stock.',
  'Remettre en place': 'Restore',
  // Gestes groupés (2026-10-29)
  "{0} dossier sélectionné": "{0} record selected",
  "{0} dossiers sélectionnés": "{0} records selected",
  "{0} autre dossier sélectionné ne s’y prête pas (commande recréée depuis) : il ne change pas.": "{0} other selected record does not apply (order recreated since): it stays unchanged.",
  "{0} autres dossiers sélectionnés ne s’y prêtent pas (commandes recréées depuis) : ils ne changent pas.": "{0} other selected records do not apply (orders recreated since): they stay unchanged.",
  "Remettre les commandes en place": "Restore the orders",
  "{0} commande revient dans la liste des commandes, avec ses factures, ses crédits et son stock.": "{0} order returns to the order list, with its invoices, credits and stock.",
  "{0} commandes reviennent dans la liste des commandes, avec leurs factures, leurs crédits et leur stock.": "{0} orders return to the order list, with their invoices, credits and stock.",
  "{0} de ces commandes a un remboursement Square déjà parti : cet argent est chez le client et ne revient pas.": "{0} of these orders has a Square refund already sent: that money is with the customer and does not come back.",
  "{0} de ces commandes ont un remboursement Square déjà parti : cet argent est chez le client et ne revient pas.": "{0} of these orders have a Square refund already sent: that money is with the customer and does not come back.",
  "Remettre {0} commande": "Restore {0} order",
  "Remettre {0} commandes": "Restore {0} orders",
  "Remise en place": "Restoring",
  "{0} commande remise en place.": "{0} order restored.",
  "{0} commandes remises en place.": "{0} orders restored.",
  "{0} commande remise en place avait un remboursement Square déjà parti : cet argent ne revient pas.": "{0} restored order had a Square refund already sent: that money does not come back.",
  "{0} commandes remises en place avaient un remboursement Square déjà parti : cet argent ne revient pas.": "{0} restored orders had a Square refund already sent: that money does not come back.",
  "Purger les dossiers": "Purge the records",
  "{0} dossier de commande et les photos de ses demandes de retour seront effacés définitivement. Cette commande ne pourra plus être remise en place. Cette action est irréversible.": "{0} order record and the photos of its return requests will be permanently erased. This order can no longer be restored. This cannot be undone.",
  "{0} dossiers de commande et les photos de leurs demandes de retour seront effacés définitivement. Ces commandes ne pourront plus être remises en place. Cette action est irréversible.": "{0} order records and the photos of their return requests will be permanently erased. These orders can no longer be restored. This cannot be undone.",
  "Purger {0} dossier": "Purge {0} record",
  "Purger {0} dossiers": "Purge {0} records",
  "Purge des dossiers": "Purging records",
  "{0} dossier purgé.": "{0} record purged.",
  "{0} dossiers purgés.": "{0} records purged.",
  "{0} photo effacée.": "{0} photo erased.",
  "{0} photos effacées.": "{0} photos erased.",
};
