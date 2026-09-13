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
  /* ── L EN-TETE ──────────────────────────────────────────────────────────── */
  'Commandes — Administration Sandriza': 'Orders — Sandriza Administration',
  'Commandes': 'Orders',
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
  ', numéro de suivi': ', tracking number',
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
  'Statut de': 'Status of',
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
  '</strong>.<br>Changement de statut impossible pour l’instant.':
    '</strong>.<br>Status cannot be changed for now.',
  ' initié.': ' started.',

  /* ── LES TITRES DES FENETRES OUVERTES D ICI ─────────────────────────────── */
  /* ⚠ Ce sont les intitules que porte la fenetre qui s ouvre : ils sont LUS. */
  'Expédition': 'Shipping',
  'Préparation': 'Preparation',
  'Détail': 'Detail',
  'invité': 'guest'
};
