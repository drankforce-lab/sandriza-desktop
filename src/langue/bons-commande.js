'use strict';

/*
 * BONS DE COMMANDE FOURNISSEURS — les deux langues
 * =============================================================================
 * ⚠⚠ « BON DE COMMANDE FOURNISSEUR » = PURCHASE ORDER. Jamais « order » seul :
 * en anglais comme en français, « order » est la commande d'un CLIENT, et le
 * « bon de commande » du site (préparation d'une commande client) se traduit
 * déjà « packing slip ». Deux choses sous un même mot, c'est imprimer la
 * mauvaise feuille.
 *
 * ⚠⚠ LA RÉCEPTION FAIT MONTER LE STOCK RÉEL, TOUT DE SUITE : la phrase qui le
 * dit garde sa conséquence en anglais (« go into stock right away »).
 *
 * ⚠ CE QUI VIENT DU CŒUR NE PASSE PAS PAR ICI : numéros de bon, noms de
 * fournisseurs, d'articles, SKU, notes et motifs saisis. Ce sont des données.
 * Les ÉTATS (`brouillon`, `envoye`…) sont des VALEURS ; seuls leurs libellés
 * affichés se traduisent.
 */

module.exports = {
  /* ── LA FENÊTRE ─────────────────────────────────────────────────────────── */
  'Bons de commande fournisseurs — Administration Sandriza': 'Purchase orders — Sandriza Administration',
  'Bons de commande fournisseurs': 'Purchase orders',
  'En cours': 'Open',
  'À commander': 'To order',
  'Historique': 'History',
  '＋ Bon vide': '＋ Blank PO',
  ' bons en cours': ' open purchase orders',
  ' bon en cours': ' open purchase order',
  'bons en cours': 'open purchase orders',
  'bon en cours': 'open purchase order',
  ' attendus': ' expected',
  'attendus': 'expected',

  /* ── LES ÉTATS (libellés seulement) ─────────────────────────────────────── */
  'brouillon': 'draft',
  'envoyé': 'sent',
  'reçu en partie': 'partly received',
  'reçu': 'received',
  'annulé': 'cancelled',
  'clos': 'closed',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne permet pas de gérer les bons de commande fournisseurs.': 'Your role does not allow managing purchase orders.',
  'Ce bon n’existe plus.': 'This purchase order no longer exists.',
  'Choisissez un fournisseur de la liste.': 'Choose a supplier from the list.',
  'Le bon n’a aucune ligne.': 'The purchase order has no lines.',
  'Un bon ne peut pas dépasser 200 lignes.': 'A purchase order cannot exceed 200 lines.',
  'Une fiche produit du bon n’existe plus.': 'A product on the purchase order no longer exists.',
  'Une fiche produit du bon a été supprimée : rien n’a été reçu. Mettez sa ligne à 0 pour recevoir le reste, puis utilisez « Clore ».':
    'A product on the purchase order was deleted: nothing was received. Set its line to 0 to receive the rest, then use “Close out”.',
  'Le bon a été modifié sur un autre poste : rien n’a été reçu. Rouvrez-le et recommencez.':
    'The purchase order was changed on another workstation: nothing was received. Reopen it and start again.',
  'Ce brouillon a été modifié sur un autre poste entre-temps. Abandonnez et rouvrez-le pour voir sa version.':
    'This draft was changed on another workstation in the meantime. Discard and reopen it to see that version.',
  'Le serveur ne répond pas. Réessayez dans un moment : un geste déjà appliqué ne le sera pas deux fois.':
    'The server is not answering. Try again in a moment: an action already applied will not be applied twice.',
  ' : saisissez une quantité entière positive.': ': enter a positive whole quantity.',
  ': saisissez une quantité entière positive.': ': enter a positive whole quantity.',
  'Les quantités saisies entrent en stock tout de suite, y compris celles des autres pages du tableau.':
    'The quantities entered go into stock right away, including those on the other pages of the table.',
  'Lignes reçues': 'Lines received',
  'Unités': 'Units',
  'Revoir les quantités': 'Review the quantities',
  'Une variante du bon n’existe plus dans sa fiche (taille ou couleur retirée).':
    'A variant on the purchase order no longer exists on its product (size or colour removed).',
  'Une variante du bon a un nom illisible.': 'A variant on the purchase order has an unreadable name.',
  'La même variante figure deux fois sur le bon.': 'The same variant appears twice on the purchase order.',
  'Saisissez des quantités entières, de 1 à 100 000.': 'Enter whole quantities, from 1 to 100,000.',
  'Un coût est invalide (nombre positif attendu).': 'A cost is invalid (a positive number is expected).',
  'Ce bon a déjà été envoyé : il ne se modifie plus.': 'This purchase order was already sent: it can no longer be edited.',
  'Ce bon est déjà clos.': 'This purchase order is already closed.',
  'Une partie a déjà été reçue : utilisez « Clore » pour renoncer au reste.':
    'Part of it was already received: use “Close” to give up on the balance.',
  'Seul un bon reçu en partie se clôt.': 'Only a partly received purchase order can be closed.',
  'Dites pourquoi le reste ne viendra pas.': 'Say why the balance will not come.',
  'Saisissez au moins une quantité reçue.': 'Enter at least one received quantity.',
  'Une ligne du bon a changé. Rouvrez l’écran.': 'A line of the purchase order changed. Reopen the screen.',
  'Un collègue modifie les bons en même temps. Réessayez.': 'A colleague is editing purchase orders at the same time. Try again.',
  'Votre accès est en consultation seule.': 'Your access is read-only.',
  'L’impression a échoué.': 'Printing failed.',
  'La liste des bons est pleine (5 000).': 'The purchase order list is full (5,000).',
  'Aucune réponse de la fenêtre principale.': 'No answer from the main window.',
  'Ligne ': 'Line ',
  'Ligne': 'Line',
  ' : vous ne pouvez pas recevoir plus que le reste (': ': you cannot receive more than the balance (',
  ': vous ne pouvez pas recevoir plus que le reste (': ': you cannot receive more than the balance (',

  /* ── EN COURS ───────────────────────────────────────────────────────────── */
  'Aucun bon en cours.': 'No open purchase order.',
  'L’onglet <strong>À commander</strong> propose un bon par fournisseur à partir des articles sous leur seuil.':
    'The <strong>To order</strong> tab suggests one purchase order per supplier from items below their threshold.',
  'Imprimer': 'Print',
  'Marquer envoyé': 'Mark as sent',
  'Fermer': 'Close',
  '✓ Recevoir': '✓ Receive',
  'Clore': 'Close out',
  '← Tous les bons': '← All purchase orders',
  ' reçues': ' received',
  'reçues': 'received',
  'Envoyé le ': 'Sent on ',
  'Envoyé le': 'Sent on',
  ' par ': ' by ',
  'par': 'by',
  'Créé le ': 'Created on ',
  'Créé le': 'Created on',
  ' lignes': ' lines',
  ' ligne': ' line',
  'lignes': 'lines',
  'ligne': 'line',

  /* ── LA RÉCEPTION ───────────────────────────────────────────────────────── */
  'Quantité reçue — ': 'Quantity received — ',
  'complet': 'complete',
  'Article': 'Item',
  'Commandé': 'Ordered',
  'Déjà reçu': 'Already received',
  'Reste': 'Balance',
  'Reçu maintenant': 'Received now',
  'Note de réception (facultative)': 'Receiving note (optional)',
  'Note de réception (facultative) — n° de bordereau…': 'Receiving note (optional) — packing slip no.…',
  'Tout à zéro': 'All to zero',
  'Entrer en stock': 'Put into stock',
  'Les quantités saisies entrent en stock tout de suite. Ce qui manque reste attendu : le bon passe « reçu en partie ».':
    'The quantities entered go into stock right away. What is missing stays expected: the purchase order becomes “partly received”.',
  'Saisissez des quantités entières positives.': 'Enter positive whole quantities.',
  'Entrée en stock…': 'Putting into stock…',
  ' unités entrées en stock': ' units put into stock',
  ' unité entrée en stock': ' unit put into stock',
  'unités entrées en stock': 'units put into stock',
  'unité entrée en stock': 'unit put into stock',
  ' — reste attendu : ': ' — balance expected: ',
  '— reste attendu :': '— balance expected:',
  ' — bon reçu au complet.': ' — purchase order fully received.',
  '— bon reçu au complet.': '— purchase order fully received.',
  ' Avis « de retour en stock » envoyés : ': ' “Back in stock” notices sent: ',
  'Avis « de retour en stock » envoyés :': '“Back in stock” notices sent:',
  ' Clients à prévenir (infolettre non configurée) : ': ' Customers to notify (newsletter not set up): ',
  'Clients à prévenir (infolettre non configurée) :': 'Customers to notify (newsletter not set up):',

  /* ── CLORE ──────────────────────────────────────────────────────────────── */
  'Clore le bon renonce au reste : ': 'Closing the purchase order gives up on the balance: ',
  'Clore le bon renonce au reste :': 'Closing the purchase order gives up on the balance:',
  'unités ne viendront pas.': 'units will not come.',
  'unité ne viendra pas.': 'unit will not come.',
  ' Le motif est inscrit sur le bon et au journal.': ' The reason is written on the purchase order and in the log.',
  'Le motif est inscrit sur le bon et au journal.': 'The reason is written on the purchase order and in the log.',
  'Motif': 'Reason',
  'Motif — ex. rupture chez le fournisseur': 'Reason — e.g. out of stock at the supplier',
  'Clore le bon': 'Close out the purchase order',

  /* ── HISTORIQUE ─────────────────────────────────────────────────────────── */
  'Aucun bon terminé.': 'No completed purchase order.',
  'Bon': 'PO',
  'Fournisseur': 'Supplier',
  'État': 'Status',
  'Reçu': 'Received',
  'Montant': 'Amount',
  'Clos le': 'Closed on',
  'bons terminés': 'completed purchase orders',
  'bon terminé': 'completed purchase order',
  'Variante': 'Variant',
  'SKU': 'SKU',
  'Coût unitaire': 'Unit cost',
  'Émis le': 'Issued on',
  'L’historique des bons de commande fournisseurs': 'The purchase order history',

  /* ── À COMMANDER ────────────────────────────────────────────────────────── */
  '— choisir un fournisseur —': '— choose a supplier —',
  'Rien à commander : toutes les variantes sont au-dessus de leur seuil, ou déjà en commande.':
    'Nothing to order: every variant is above its threshold, or already on order.',
  'Quantité proposée : de quoi revenir au double du seuil, moins ce qui est déjà en commande. Coût : celui de la fiche produit.':
    'Suggested quantity: enough to get back to twice the threshold, minus what is already on order. Cost: the one on the product.',
  'Créer tous les bons (brouillons)': 'Create all purchase orders (drafts)',
  'Fournisseur de ce groupe': 'Supplier for this group',
  'Le fournisseur des fiches a été supprimé : choisissez-en un.': 'The supplier on these products was deleted: choose one.',
  'Ces fiches n’ont pas de fournisseur : choisissez-en un.': 'These products have no supplier: choose one.',
  'Créer ce bon': 'Create this purchase order',
  'Stock': 'Stock',
  'Seuil': 'Threshold',
  'En commande': 'On order',
  'Quantité': 'Quantity',
  'Commander ': 'Order ',
  'Choisissez d’abord le fournisseur de ce groupe.': 'Choose the supplier of this group first.',
  'Choisissez le fournisseur des groupes qui n’en ont pas.': 'Choose a supplier for the groups that have none.',
  ' groupe(s) sans fournisseur laissé(s) dans « À commander ».': ' group(s) without a supplier left in “To order”.',
  'groupe(s) sans fournisseur laissé(s) dans « À commander ».': 'group(s) without a supplier left in “To order”.',
  'Aucune ligne cochée.': 'No line checked.',
  'Création des bons…': 'Creating purchase orders…',
  ' bons créés en brouillon': ' purchase orders created as drafts',
  ' bon créé en brouillon': ' purchase order created as a draft',
  'bons créés en brouillon': 'purchase orders created as drafts',
  'bon créé en brouillon': 'purchase order created as a draft',
  ' refusé(s) : ': ' refused: ',
  'refusé(s) :': 'refused:',

  /* ── L'ÉDITEUR ──────────────────────────────────────────────────────────── */
  'Modifier le bon ': 'Edit purchase order ',
  'Modifier': 'Edit',
  'Nouveau bon de commande fournisseur': 'New purchase order',
  'Abandonner': 'Discard',
  'Enregistrer le brouillon': 'Save draft',
  'Note pour le fournisseur': 'Note for the supplier',
  'Note pour le fournisseur (imprimée)': 'Note for the supplier (printed)',
  'Retirer la ligne': 'Remove the line',
  'Aucune ligne. Cherchez un article ci-dessous pour l’ajouter.': 'No lines. Search for an item below to add it.',
  'Chercher un article': 'Search for an item',
  'Nom, SKU ou taille-couleur (3 caractères)…': 'Name, SKU or size-colour (3 characters)…',
  'Chercher': 'Search',
  'stock ': 'stock ',
  '＋ Ajouter': '＋ Add',
  'Aucun article trouvé.': 'No item found.',
  'Cette variante est déjà sur le bon.': 'This variant is already on the purchase order.',
  'Trois caractères au moins.': 'At least three characters.',

  /* ── LES COMPTES RENDUS ─────────────────────────────────────────────────── */
  'Bon ': 'Purchase order ',
  ' enregistré en brouillon.': ' saved as a draft.',
  'enregistré en brouillon.': 'saved as a draft.',
  ' envoyé à l’impression.': ' sent to the printer.',
  'envoyé à l’impression.': 'sent to the printer.',
  ' marqué envoyé — il ne se modifie plus.': ' marked as sent — it can no longer be edited.',
  'marqué envoyé — il ne se modifie plus.': 'marked as sent — it can no longer be edited.',
  'Impression…': 'Printing…',
  'Enregistrement…': 'Saving…',
  'Annuler le bon': 'Cancel the purchase order',
  'Le bon est classé annulé. Rien n’a été reçu : le stock ne bouge pas.': 'The purchase order is marked cancelled. Nothing was received: stock does not change.',
  'Garder le bon': 'Keep the purchase order',
  ' annulé.': ' cancelled.',
  'annulé.': 'cancelled.',
  ' clos — le reste n’est plus attendu.': ' closed — the balance is no longer expected.',
  'clos — le reste n’est plus attendu.': 'closed — the balance is no longer expected.',
  'Rien à exporter.': 'Nothing to export.',
};
