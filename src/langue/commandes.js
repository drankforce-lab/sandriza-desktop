'use strict';

/*
 * LISTE DES COMMANDES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN REND DE L ARGENT PAR SQUARE ET SUPPRIME DES COMMANDES. Quatre
 * phrases n y sont que pour empecher un geste sans retour, et elles gardent leur
 * fermete :
 *   · « cette operation est irreversible » (remboursement des frais de service) ;
 *   · « cette action est irreversible » + la liste de CE QUI SERA SUPPRIME ;
 *   · « enregistrement local cree mais Square a ECHOUE » — le plus important de
 *     tous : la moitie du geste a eu lieu, et croire le contraire fait
 *     rembourser deux fois ;
 *   · « suppression non confirmee par le serveur — reessayez » : on ne SAIT pas,
 *     et on le dit.
 *
 * ⚠⚠ LES LIBELLES DE STATUT NE SONT PAS ICI, ET IL FAUT LE SAVOIR. Ils viennent
 * du SERVEUR (`s.libelle`, `ap.deLibelle`, `ap.aLibelle`, `ap.implications`) :
 * les filtres et la boite « changer le statut » resteront donc en francais tant
 * que le site ne sera pas traduit — c est le chantier qu il a demande de garder
 * pour la fin. On ne le cache pas : un ecran a moitie traduit qui l assume vaut
 * mieux qu un ecran qui pretend l etre.
 *
 * ⚠ « Square » est un nom de service : il ne se traduit pas. Le numero de
 * commande, le nom du client, l adresse et le numero de suivi sont de la DONNEE.
 */

module.exports = {
  'Cocher plusieurs commandes pour agir sur toutes à la fois': 'Tick several orders to act on all of them at once',
  'Sélectionner': 'Select',
  'Toute la page': 'Whole page',
  '{0} commande sélectionnée': '{0} order selected',
  '{0} commandes sélectionnées': '{0} orders selected',
  'Imprimer les bons': 'Print the slips',
  'Passer en préparation': 'Move to preparation',
  'Annuler': 'Cancel',
  'Cliquer pour sélectionner': 'Click to select',
  'Impression des bons…': 'Printing the slips…',
  '{0} bon envoyé à l’impression.': '{0} slip sent to the printer.',
  '{0} bons envoyés à l’impression.': '{0} slips sent to the printer.',
  '{0} sur {1} imprimés — ': '{0} of {1} printed — ',
  'Aucune des commandes sélectionnées n’est à confirmer ou confirmée et libre.': 'None of the selected orders is pending or confirmed and free.',
  '{0} commande passera « En préparation ».': '{0} order will move to “Preparing”.',
  '{0} commandes passeront « En préparation ».': '{0} orders will move to “Preparing”.',
  '{0} autre est déjà plus loin ou en traitement : elle ne change pas.': '{0} other is already further along or being handled: it does not change.',
  '{0} autres sont déjà plus loin ou en traitement : elles ne changent pas.': '{0} others are already further along or being handled: they do not change.',
  'Mise à jour des statuts…': 'Updating statuses…',
  '{0} commande passée en préparation.': '{0} order moved to preparation.',
  '{0} commandes passées en préparation.': '{0} orders moved to preparation.',
  '{0} refusée(s) : statut changé ailleurs entre-temps.': '{0} refused: status changed elsewhere in the meantime.',
  'Chronologie': 'Timeline',
  '{0} geste(s) plus ancien(s)': '{0} earlier step(s)',
  'Commande passée': 'Order placed',
  'Étiquette créée': 'Label created',
  'Ramassage demandé': 'Pickup requested',
  'Expédiée': 'Shipped',
  'Livrée': 'Delivered',
  'Terminée': 'Completed',
  'Remboursement': 'Refund',
  'Archivée': 'Archived',
  'Chronologie de la commande': 'Order timeline',
  'au comptoir': 'in store',
  'Affichage de la liste': 'List display',
  'Affichage détaillé': 'Detailed view',
  'Affichage compact : une ligne par commande, plus de commandes par page': 'Compact view: one line per order, more orders per page',
  'Ce remboursement dépasserait ce qui a été payé (ou les frais retenus). Rien n’a été remboursé.': 'This refund would exceed what was paid (or the retained fees). Nothing was refunded.',
  'La commande vient de recevoir un autre remboursement. Rouvrez-la pour voir le solde à jour ; rien n’a été remboursé.': 'The order just received another refund. Reopen it to see the current balance; nothing was refunded.',
  'Le serveur refuse : votre rôle ne permet pas ce geste.': 'The server refused: your role does not allow this action.',
  'La base de données ne répond pas. Rien n’a été remboursé — réessayez.': 'The database is not responding. Nothing was refunded — try again.',
  'Commande introuvable sur le serveur.': 'Order not found on the server.',
  'Aucun paiement Square lié à cette commande.': 'No Square payment linked to this order.',
  /* ⚠ L EXEMPLE du champ de recherche. Il ouvrait un attribut sur une ligne et
     le fermait deux lignes plus bas : aucun releve ne le voyait — voir
     tools/banc-attribut-coupe.js. */
  'Numéro de commande, nom, courriel': 'Order number, name, email',
  /* ⚠ LES DEUX ALTERNATIVES EN ENTIER — voir tools/banc-pluriel-colle.js.
     ⚠ ET LA MEME TRADUCTION QUE LE SINGULIER plus bas (« not processed ») :
     deux rendus differents du meme mot se liraient comme deux notions. */
  'non traitées': 'not processed',
  /* ── L EN-TETE ──────────────────────────────────────────────────────────── */
  'Commandes — Administration Sandriza': 'Orders — Sandriza Administration',
  'Commandes': 'Orders',
  'Changer': 'Change',
  'Commandes indisponibles': 'Orders unavailable',
  '— Administration Sandriza': '— Sandriza Administration',
  'Lecture seule': 'Read only',
  'Votre rôle ne donne pas accès aux commandes.': 'Your role does not give access to orders.',

  /* ── LES REFUS ──────────────────────────────────────────────────────────── */
  'Cette version de l’application ne sait pas ouvrir cette fenêtre — quittez et relancez pour la mettre à jour.':
    'This version of the application cannot open this window — quit and restart it to update.',
  'Cette commande n’existe plus.': 'This order no longer exists.',
  'Aucune facture liée à cette commande.': 'No invoice linked to this order.',
  'Aucun paiement Square associé à cette commande.': 'No Square payment attached to this order.',
  'Aucun frais retenu restant à rembourser.': 'No withheld fee left to refund.',
  /* ⚠⚠ ON NE SAIT PAS CE QUI S EST PASSE, ET ON LE DIT. */
  'Suppression non confirmée par le serveur — réessayez.':
    'Deletion not confirmed by the server — try again.',
  'Suppression non confirmée par le serveur (': 'Deletion not confirmed by the server (',
  ') — réessayez.': ') — try again.',

  /* ── LA GRAMMAIRE DES FACTURES (2026-10-16) : la tete, les chiffres, le panneau d appui.
     Des phrases ENTIERES au pluriel ; au singulier, le chiffre est colle devant (« 1 commande en cours »). */
  '{0} commandes en cours': '{0} orders in progress',
  ' commande en cours': ' order in progress',
  '{0} commandes expédiées': '{0} orders shipped',
  ' commande expédiée': ' order shipped',
  'Où en sont les commandes': 'Where orders stand',
  'Où en sont les envois': 'Where shipments stand',
  'À faire': 'To do',
  '{0} commandes prioritaires non traitées.': '{0} priority orders not handled.',
  '1 commande prioritaire non traitée.': '1 priority order not handled.',
  '{0} étiquettes prêtes, pas encore parties.': '{0} labels ready, not shipped yet.',
  '1 étiquette prête, pas encore partie.': '1 label ready, not shipped yet.',
  'Rien ne presse.': 'Nothing urgent.',
  /* ── LES FILTRES ET LA LISTE ────────────────────────────────────────────── */
  /* ⚠ Les LIBELLES de statut viennent du serveur — voir la fiche en tete. */
  'Statut :': 'Status:',
  'Tout afficher': 'Show all',
  'Prioritaires': 'Priority',
  'non traitée': 'not processed',
  'Année :': 'Year:',
  'Aucune commande ne correspond à ces filtres.': 'No order matches these filters.',
  'Aucune commande expédiée.': 'No order shipped.',
  'Aucune commande en cours.': 'No order in progress.',
  'Commande Client Date': 'Order Customer Date',
  'Total Statut': 'Total Status',
  'Commande': 'Order',
  'Client': 'Customer',
  'Date': 'Date',
  'Total': 'Total',
  'Statut': 'Status',
  ', suivi': ', tracking',
  'étiquette prête': 'label ready',
  'sans numéro': 'no number',
  '← Préc.': '← Prev.',
  'Suiv. →': 'Next →',
  '← Liste': '← List',

  /* ── LE VERROU DE TRAITEMENT ────────────────────────────────────────────── */
  /* ⚠ IL DIT QUI TRAVAILLE DESSUS ET CE QUI EST DESACTIVE — sans quoi on croit
     l ecran casse plutot qu occupe. */
  '🔒 En traitement': '🔒 Being processed',
  '🔒 En traitement par': '🔒 Being processed by',
  '— changement de statut, remboursement et suppression désactivés':
    '— status change, refund and deletion disabled',
  'le temps que cette personne termine.': 'until that person is done.',
  '📦 Préparer la commande': '📦 Prepare the order',

  /* ── LA FICHE ───────────────────────────────────────────────────────────── */
  '⚡ Prioritaire': '⚡ Priority',
  '✅ Remboursée': '✅ Refunded',
  'Compte :': 'Account:',
  'Commande démo — aucun paiement Square': 'Demo order — no Square payment',
  '✅ Livrée le': '✅ Delivered on',
  '(vérifié le': '(checked on',
  'Article Taille / Couleur': 'Item Size / Colour',
  'Qté Prix': 'Qty Price',
  'Article': 'Item',
  'Taille / Couleur': 'Size / Colour',
  'Qté': 'Qty',
  'Prix': 'Price',
  '⚡ Traitement prioritaire': '⚡ Priority handling',
  'Notes :': 'Notes:',

  /* ── LES REMBOURSEMENTS ET LES FRAIS RETENUS ────────────────────────────── */
  '↩ Remboursements émis': '↩ Refunds issued',
  '(frais retenus :': '(fees withheld:',
  'Frais de service retenus :': 'Service fees withheld:',
  '✅ Remboursés au client': '✅ Refunded to the customer',
  '⚠ Partiel — remb.': '⚠ Partial — ref.',
  '⏳ Non remboursés': '⏳ Not refunded',
  'Total remboursé : −': 'Total refunded: −',
  '✅ Entièrement remboursée': '✅ Fully refunded',
  '💰 Frais retenus (': '💰 Fees withheld (',
  '↩ Rembourser': '↩ Refund',
  'Rembourser les frais de service': 'Refund the service fees',
  'au client via Square ?': 'to the customer through Square?',
  'déjà remboursés sur': 'already refunded out of',
  /* ⚠⚠ UN REMBOURSEMENT NE SE REPREND PAS. */
  'Cette opération est irréversible.': 'This operation cannot be undone.',
  'de frais de service remboursés via Square.': 'of service fees refunded through Square.',
  'Remboursement Square de': 'Square refund of',
  'Déjà entièrement remboursée — rien de plus envoyé à Square.':
    'Already fully refunded — nothing more sent to Square.',
  'Remboursement Square échoué :': 'Square refund failed:',
  'Erreur réseau Square :': 'Square network error:',
  'Remboursement ouvert dans sa fenêtre.': 'Refund opened in its own window.',
  /* ⚠⚠⚠ LA MOITIE DU GESTE A EU LIEU. Croire le contraire fait rembourser DEUX
     FOIS — c est la phrase la plus chere de cet ecran. */
  'Enregistrement local créé mais Square a échoué :':
    'Local record created but Square failed:',
  'Enregistrement local créé mais erreur réseau Square :':
    'Local record created but Square network error:',
  '— frais remboursés (aucun jeton Square configuré).':
    '— fees refunded (no Square token configured).',

  /* ── LES DOCUMENTS ──────────────────────────────────────────────────────── */
  '🖨 Bon de commande': '🖨 Order slip',
  '🧾 Facture': '🧾 Invoice',
  'Bon de commande envoyé à l’impression.': 'Order slip sent to the printer.',
  'Facture ouverte dans la fenêtre principale.': 'Invoice opened in the main window.',
  'Facture ouverte dans sa fenêtre.': 'Invoice opened in its own window.',
  'ouverte dans sa fenêtre.': 'opened in its own window.',

  /* ── LE CHANGEMENT DE STATUT ────────────────────────────────────────────── */
  /* ⚠ Les deux libelles de la phrase (« de X a Y ») viennent du SERVEUR. */
  'Changer le statut': 'Change the status',
  'Statut déjà changé ailleurs (actuel :': 'Status already changed elsewhere (currently:',
  'Statut mis à jour.': 'Status updated.',
  '. Changement de statut impossible pour l’instant.':
    '. Status cannot be changed for now.',
  /* ⚠ LA CASE DES TESTS DIT CE QU ELLE FAIT AU CLIENT : elle réautorise de
     vrais courriels. La reduire ferait renvoyer un courriel a une cliente. */
  '🧪 Tests —': '🧪 Tests —',
  'réautoriser l’envoi des courriels de cette commande (le client pourra les recevoir':
    'allow the emails for this order to be sent again (the customer may receive them',
  'à nouveau). Sinon, la protection anti-doublon reste active.':
    'again). Otherwise the duplicate protection stays on.',

  /* ── LE RATTACHEMENT A UN COMPTE ────────────────────────────────────────── */
  'actuellement liée à': 'currently linked to',
  'en mode invité (aucun compte)': 'in guest mode (no account)',
  'invité (aucun compte)': 'guest (no account)',
  '🔗 Rattacher la commande à un client': '🔗 Link the order to a customer',
  'Rattacher la commande': 'Link the order',
  'Rechercher un client (nom ou courriel)': 'Search for a customer (name or email)',
  'Tapez au moins 3 caractères.': 'Type at least 3 characters.',
  'Aucun client trouvé.': 'No customer found.',
  'Lier →': 'Link →',
  '🔓 Détacher (remettre en mode invité)': '🔓 Unlink (back to guest mode)',
  'La facture associée sera mise à jour et les statistiques':
    'The linked invoice will be updated and the purchase',
  'd’achat des comptes concernés recalculées.': 'statistics of the accounts involved recalculated.',
  'Cette commande est déjà rattachée à ce compte.':
    'This order is already linked to this account.',
  'Commande détachée — remise en mode invité.': 'Order unlinked — back to guest mode.',
  'Commande rattachée à': 'Order linked to',

  /* ── LA SUPPRESSION ─────────────────────────────────────────────────────── */
  /* ⚠⚠ « ELEMENTS QUI SERONT SUPPRIMES » : la liste est la seule chose qui
     distingue « retirer une ligne » de « effacer une vente ». */
  '🗑 Supprimer': '🗑 Delete',
  '🗑 Supprimer la commande': '🗑 Delete the order',
  'Éléments qui seront supprimés :': 'Items that will be deleted:',
  '⚠ Cette action est irréversible.': '⚠ This action cannot be undone.',
  'Supprimer définitivement': 'Delete permanently',
  'Commande supprimée — inventaire rétabli.': 'Order deleted — inventory restored.',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════ */
  'Préparer la commande': 'Prepare the order',
  'Remboursée': 'Refunded',
  'Livrée le': 'Delivered on',
  'Remboursés au client': 'Refunded to the customer',
  'Entièrement remboursée': 'Fully refunded',
  'en mode <strong>invité</strong> (aucun compte)': 'in <strong>guest</strong> mode (no account)',
  'Détacher (remettre en mode invité)': 'Unlink (back to guest mode)',
  'Cette action est irréversible.': 'This action cannot be undone.',
  ' initié.': ' started.',

  /* ── LES TITRES DES FENETRES OUVERTES D ICI ─────────────────────────────── */
  /* ⚠ Ce sont les intitules que porte la fenetre qui s ouvre : ils sont LUS. */
  'Expédition': 'Shipping',
  'Préparation': 'Preparation',
  'Détail': 'Detail',
  'invité': 'guest',
  'membre': 'member',
  'Paiement Square': 'Square payment',
  'Montant': 'Amount',

  /* ══ LE TITRE DES DEUX ECRANS ══════════════════════════════════════════════
   * ⚠⚠ CE FICHIER DESSINE DEUX ECRANS, et son titre se CALCULE avant le
   * gabarit (`const titre = (m === 'expeditions') ? … : …`). Or `${…}` n
   * interpole QUE dans un litteral de gabarit : le poseur ne pouvait pas le
   * toucher, et il le disait — « 1 occurrence HORS du gabarit ». Le T() y est
   * donc ecrit A LA MAIN, ce qui est le geste prevu pour ce cas.
   * ⚠ Sans ca, l onglet et le grand titre restaient « Commandes » sur toute la
   * page anglaise : les deux textes les plus vus de l ecran. */
  'Commandes': 'Orders',
  'Expéditions': 'Shipments',

  /* ── LES MOITIES DE PHRASE, REPRISES EN ENTIER ───────────────────────────── */
  'Statut de la commande': 'Order status',
  'Supprimer la commande': 'Delete the order',

  /* ── LES INFOBULLES ET LES ATTRIBUTS DU SCRIPT ─────────────────────────────
     ⚠ « Clic : détails · clic droit : changer le statut » est le SEUL endroit
     ou le clic droit est enseigne. Sans lui, la moitie de l ecran est cachee. */
  'Rechercher une commande': 'Search an order',
  'N’afficher que les commandes prioritaires': 'Show only priority orders',
  'Clic : détails · clic droit : changer le statut':
    'Click: details · right-click: change the status',
  'Rattacher cette commande à un compte client': 'Link this order to a customer account',
  'Nombre de commandes par page': 'Orders per page',
  'Année': 'Year',

  /* ── LES MOTS DERRIERE UN PICTOGRAMME (la forme de la SOURCE) ──────────────
     ⚠ Le signe vit dans son propre <span class="ic"> et une cle ne traverse
     jamais un attribut : la cle commence apres le </span>. */
  'En traitement': 'Being handled',
  'Prioritaire': 'Priority',
  'Traitement prioritaire': 'Priority handling',
  'Manuelle': 'Manual',
  'Vente saisie à la caisse': 'Sale entered at the register',
  'Ventes manuelles': 'Manual sales',
  'N’afficher que les ventes saisies à la caisse, quel que soit leur statut': 'Show only sales entered at the register, whatever their status',
  'Bon de commande': 'Picking slip',
  'Facture': 'Invoice',
  'Frais retenus (': 'Fees kept (',
  'remb.)': 'refunded)',

  /* ── LES MOTS SEULS (2026-09-13) ──────────────────────────────────────────
     ⚠ Ils étaient invisibles aux DEUX mesures : le compteur écartait tout texte
     d'un seul mot (« pas de la prose »), et le résiduel cherche un accent — la
     plupart n'en portent aucun. Son signalement, capture à l'appui. */
  'Toutes': 'All',
  'Suivi': 'Tracking',
  'Articles': 'Items',
  'Afficher': 'Show',
  'Auto': 'Auto',
  /* ⚠ Nom de produit Square : il s'écrit pareil dans les deux langues. L'entrée
     existe quand même — sans elle, on ne distingue pas « traduit et identique »
     de « oublié ». */
  'AFTERPAY': 'AFTERPAY',
  'Livraison': 'Shipping',
  'Sous-total': 'Subtotal',
  'Coupon': 'Coupon',
  'Confirmer': 'Confirm',
  'Rembourser': 'Refund',
  'Fermer': 'Close',
  'Lier': 'Link',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'par page': 'per page',
  '· reste': '· left',
  'en traitement par': 'being edited by',
  'de frais de service retenus': 'of service fees kept',

  /* ── LE BOUTON DE LA CORBEILLE (#113, 2026-09-14) ───────────────────────────
     ⚠ Sa demande : pas d entree de menu, un petit bouton ici. C est donc la
     SEULE porte de cet ecran — un libelle vague lui aurait coute son unique
     chance d etre trouve.
     ⚠ << Recycle bin >> et non << Trash >> : c est un endroit d ou l on
     RESSORT. << Trash >> dit ce qui est jete ; toute la raison d etre de cet
     ecran est qu on peut reprendre ce qui y est. */
  'Corbeille': 'Recycle bin',
  'Voir les commandes supprimées et les remettre en place':
    'View deleted orders and restore them',

  /* ── La refonte de la liste, comme l'Inventaire (2026-09-25) ── */
  'Client et commande': 'Customer and order',
  'Cliquer pour filtrer': 'Click to filter',
  'En attente': 'Pending',
  'à confirmer': 'to confirm',
  'En préparation': 'Preparing',
  'à emballer': 'to pack',
  'Étiquettes prêtes': 'Labels ready',
  'pas encore parties': 'not shipped yet',
  'Expédiées': 'Shipped',
  'en route': 'on the way',
  'Livrées': 'Delivered',
  'reçues par le client': 'received by the customer',
  'En cours': 'In progress',
  'au total': 'in total',
  'Valeur': 'Value',
  'en cours': 'in progress',
  'expédiée': 'shipped',
  'article': 'item',
  'articles': 'items',
  ' par ': ' by ',
  ' sur ': ' of ',
  "remboursement": "refund",
  "remboursements": "refunds",
  "unité remboursée": "unit refunded",
  "unités remboursées": "units refunded",
  "/ unité": "/ unit",
  "Partiel — remboursé": "Partial — refunded",
  /* ── LA PREUVE DE PAIEMENT DU SERVEUR (2026-10-11) */
  "aucun paiement": "no payment",
  "montant payé inférieur au total": "amount paid lower than the total",
  "montant trop bas pour les articles commandés": "amount too low for the items ordered",
  "paiement déjà rattaché à une autre commande": "payment already attached to another order",
  "paiement introuvable chez Square": "payment not found at Square",
  "commande vide": "empty order",
  "vérification impossible pour le moment": "verification not possible right now",
  "Paiement vérifié par le serveur": "Payment verified by the server",
  "pas encore vérifié": "not verified yet",
  "paiement": "payment",
  "à vérifier avant tout remboursement": "to check before any refund",
  "Commande refusée : paiement non vérifié": "Order refused: payment not verified",
  "Paiement NON vérifié — ne pas expédier": "Payment NOT verified — do not ship",
  /* ── LES MOTIFS DE LA PHASE B (2026-10-12) */
  "intention de paiement absente ou déjà utilisée": "payment intent missing or already used",
  "commande modifiée après le calcul du total": "order changed after the total was calculated",
  "Square injoignable — vérification reportée": "Square unreachable — verification postponed",
  "base de données injoignable — vérification reportée": "database unreachable — verification postponed",
  "paiement non complété chez Square": "payment not completed at Square",
  "montant payé différent du total calculé": "amount paid differs from the calculated total",
  "paiement dans une autre devise que le dollar canadien": "payment in a currency other than the Canadian dollar",
  "paiement déjà remboursé": "payment already refunded",
  "paiement fait à un autre point de vente Square": "payment made at another Square location",
  "paiement inscrit sur une commande sans montant à payer": "payment recorded on an order with nothing to pay",
  "carte-cadeau introuvable": "gift card not found",
  "solde de la carte-cadeau insuffisant": "insufficient gift card balance",
  "code promo déjà utilisé (usage unique épuisé)": "promo code already used (single use exhausted)",
  "usage du code promo non enregistré": "promo code use not recorded",
  "carte-cadeau déjà débitée d’un autre montant": "gift card already charged a different amount",
  "débit de la carte-cadeau non enregistré": "gift card charge not recorded",
  "crédit demandé sans compte client": "credit requested without a customer account",
  "crédit du compte insuffisant": "insufficient account credit",
  "crédit déjà débité d’un autre montant": "credit already charged a different amount",
  "débit du crédit non enregistré": "credit charge not recorded",
  "points demandés sans compte client": "points requested without a customer account",
  "points du compte insuffisants": "insufficient account points",
  "points déjà débités d’un autre nombre": "points already charged a different number",
  "débit des points non enregistré": "points charge not recorded",
  "paiement remboursé automatiquement": "payment refunded automatically",
  /* Le clic droit de la liste (2026-10-13). */
  "Ouvrir le détail": "Open details",
  "Traiter — lancer la préparation": "Process — start picking",
  "Passer à : ": "Change to: ",
  "Supprimer la commande…": "Delete order…",
  /* (2026-10-19) Décisions pour banc-langue-fenetres : les fragments de code, sélecteurs, polices et noms
     de services se rendent à l’identique ; les textes d’interface sont traduits. */
  "cx-carte cx-liste seule": "cx-carte cx-liste seule",
  // (2026-10-23) Vente d'un encan en direct
  'Vente d’un encan en direct — vente finale, aucun retour': 'Live auction sale — final sale, no returns',
  'Vente d’un encan en direct': 'Live auction sale',
  'Vente finale': 'Final sale',
  // (2026-10-25, audit) Les totaux complets du détail, et des phrases entières.
  'Promotion automatique': 'Automatic promotion',
  'Rabais sur la vente': 'Discount on the sale',
  'Carte-cadeau': 'Gift card',
  'Crédit boutique': 'Store credit',
  'Points de fidélité': 'Loyalty points',
  'Passer {0} de « {1} » à « {2} » ?': 'Change {0} from “{1}” to “{2}”?',
  'Lier {0} à {1} ?': 'Link {0} to {1}?',
  'Rattacher la commande à un client': 'Link the order to a customer',
  'retenus': 'withheld',
  'erreur inconnue': 'unknown error',
  'TikTok': 'TikTok',
  // Gestes groupés (2026-10-29)
  "Imprimer les étiquettes": "Print the labels",
  "Imprimer les factures": "Print the invoices",
  "Exporter (CSV)": "Export (CSV)",
  "Marquer expédiée": "Mark as shipped",
  "Seulement les commandes dont l’étiquette est créée : son numéro de suivi part à la cliente.": "Only orders whose label is created: its tracking number is sent to the customer.",
  "{0} autre sélectionnée ne s’y prête pas : elle ne change pas.": "{0} other selected order does not qualify: it stays unchanged.",
  "{0} autres sélectionnées ne s’y prêtent pas : elles ne changent pas.": "{0} other selected orders do not qualify: they stay unchanged.",
  "Impression des bons": "Printing the slips",
  "Les commandes sans facture sont passées.": "Orders without an invoice were skipped.",
  "Impression des factures": "Printing the invoices",
  "{0} facture envoyée à l’impression.": "{0} invoice sent to the printer.",
  "{0} factures envoyées à l’impression.": "{0} invoices sent to the printer.",
  "Impression des étiquettes": "Printing the labels",
  "{0} étiquette envoyée à l’impression.": "{0} label sent to the printer.",
  "{0} étiquettes envoyées à l’impression.": "{0} labels sent to the printer.",
  "Mise à jour des statuts": "Updating statuses",
  "{0} commande passera « Expédiée » : la cliente reçoit son courriel avec le numéro de suivi de l’étiquette.": "{0} order will become “Shipped”: the customer receives her email with the label’s tracking number.",
  "{0} commandes passeront « Expédiée » : chaque cliente reçoit son courriel avec le numéro de suivi de son étiquette.": "{0} orders will become “Shipped”: each customer receives her email with her label’s tracking number.",
  "Expédier {0} commande": "Ship {0} order",
  "Expédier {0} commandes": "Ship {0} orders",
  "{0} commande expédiée.": "{0} order shipped.",
  "{0} commandes expédiées.": "{0} orders shipped.",
  "Ville": "City",
  "Transporteur": "Carrier",
  "{0} commande exportée": "{0} order exported",
  "{0} commandes exportées": "{0} orders exported",
  // Gestes groupés (2026-10-29)
  "Créer les étiquettes": "Create the labels",
  "Cotation de chaque commande, puis un récapitulatif du prix total à confirmer avant de rien acheter.": "Each order is quoted, then a summary of the total price is shown for confirmation before anything is bought.",
  "Cotation des étiquettes…": "Quoting the labels…",
  "a déjà une étiquette": "already has a label",
  "aucun transporteur qui crée des étiquettes n’a coté cet envoi": "no carrier that creates labels quoted this shipment",
  "Aucune étiquette ne peut être créée.": "No label can be created.",
  "Aucune des commandes n’a pu être cotée :": "None of the orders could be quoted:",
  "(estimé)": "(estimated)",
  "· choix de la cliente": "· customer’s choice",
  "laissée de côté : ": "left aside: ",
  "laissée de côté :": "left aside:",
  "{0} étiquette sera achetée maintenant — facturée dès sa création, annulable tant que le colis n’est pas parti.": "{0} label will be bought now — charged as soon as it is created, can be cancelled until the parcel has left.",
  "{0} étiquettes seront achetées maintenant — facturées dès leur création, annulables tant que le colis n’est pas parti.": "{0} labels will be bought now — charged as soon as they are created, can be cancelled until the parcels have left.",
  "Total coté (avant taxes)": "Quoted total (before taxes)",
  "Acheter {0} étiquette — {1}": "Buy {0} label — {1}",
  "Acheter {0} étiquettes — {1}": "Buy {0} labels — {1}",
  "Rien n’a été acheté.": "Nothing was bought.",
  "Création des étiquettes": "Creating the labels",
  "{0} étiquette créée.": "{0} label created.",
  "{0} étiquettes créées.": "{0} labels created.",
  "{0} étiquette vient d’être créée. L’imprimer maintenant ?": "{0} label was just created. Print it now?",
  "{0} étiquettes viennent d’être créées. Les imprimer maintenant ?": "{0} labels were just created. Print them now?",
  "Plus tard": "Later",
  "Imprimer maintenant": "Print now",
};
