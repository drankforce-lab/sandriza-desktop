'use strict';

/*
 * TABLEAU DE BORD — les deux langues
 * =============================================================================
 * ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT. Les NOMS de clients, les numeros de
 * commande, les montants et les dates viennent de la base : rien de tout cela
 * n est ici. Les devises (CAD, USD) sont des codes ISO — elles ne se traduisent
 * pas non plus.
 *
 * ⚠ LES SINGULIERS ET LES PLURIELS SONT DEUX ENTREES SEPAREES, et c est voulu :
 * « 1 commande a traiter » / « 3 commandes a traiter ». Les fusionner obligerait
 * a inventer une regle d accord, et l anglais n accorde pas comme le francais.
 *
 * ⚠ LES PHRASES DU TAUX DE CHANGE SONT COUPEES DANS LE GABARIT, autour d un
 * nombre. On traduit chaque MORCEAU tel qu il est ecrit — les recoller serait
 * plus propre, mais ce serait reecrire la fenetre, pas la traduire. C est une
 * dette, elle est nommee ici.
 */

module.exports = {
  'Retours': 'Returns',
  'Nouveaux': 'New',
  'Approuvés': 'Approved',
  'En transit': 'In transit',
  'Reçus': 'Received',
  'retour arrive à échéance': 'return reaching its deadline',
  'retours arrivent à échéance': 'returns reaching their deadline',
  'Ouvrir le retour': 'Open the return',
  'Arrive à échéance le': 'Deadline on',
  'Arrive à échéance': 'Reaching its deadline',
  'Aucun retour en cours.': 'No returns in progress.',
  '{0} sur {1} retours': '{0} of {1} returns',
  'article': 'item',
  'articles': 'items',
  'Top 100': 'Top 100',
  'Top 100 des meilleures ventes': 'Top 100 best sellers',
  'Produit': 'Product',
  'produit': 'product',
  'produits': 'products',
  'Vendus': 'Sold',
  'Fermer': 'Close',
  'Ouvrir l’inventaire': 'Open inventory',
  'Voir le réapprovisionnement': 'See restocking',
  'Voir les produits en rupture': 'See out-of-stock products',
  'Ouvrir les produits en vente': 'Open products for sale',
  /* ── LE TABLEAU DE BORD EN DIRECT (2026-10-12) ── */
  'à l’instant': 'just now',
  'il y a {0} min': '{0} min ago',
  'il y a {0} h': '{0} h ago',
  'Retours à traiter': 'Returns to process',
  'Avis à la CAI': 'CAI notices',
  'Dernière sauvegarde : illisible': 'Last backup: unreadable',
  'Aucune sauvegarde : la base n’est pas protégée': 'No backup: the database is not protected',
  'il y a {0} jours': '{0} days ago',
  'Dernière sauvegarde :': 'Last backup:',
  'Les chiffres se mettent à jour d’eux-mêmes': 'The figures update on their own',
  'En direct': 'Live',
  'Période': 'Period',
  'Aujourd’hui': 'Today',
  '7 jours': '7 days',
  'Ce mois': 'This month',
  '{0} à zéro': '{0} at zero',
  'vs période d’avant': 'vs previous period',
  'Le site n’a pas encore cette version du tableau de bord.': 'The website does not have this version of the dashboard yet.',
  'Ouvrir les commandes': 'Open orders',
  'Activité des commandes': 'Order activity',
  'ce qui attend un geste': 'what needs action',
  'À confirmer': 'To confirm',
  'À préparer': 'To prepare',
  'À expédier': 'To ship',
  'Parcours du jour': 'Today’s flow',
  'Reçues': 'Received',
  'En préparation': 'Being prepared',
  'Parties': 'Shipped out',
  'Délai moyen avant envoi': 'Average time to ship',
  'Aucun envoi ces 30 derniers jours': 'No shipment in the last 30 days',
  'Inventaire': 'Inventory',
  'En main': 'On hand',
  'À commander': 'To reorder',
  'En rupture': 'Out of stock',
  'Valeur du stock (au coût)': 'Stock value (at cost)',
  'Valeur du stock (au prix de vente)': 'Stock value (at selling price)',
  'produit sans coût': 'product without cost',
  'produits sans coût': 'products without cost',
  'Arrivée des commandes': 'Incoming orders',
  'par heure, aujourd’hui contre hier': 'by hour, today vs yesterday',
  'par jour, 7 derniers jours contre les 7 d’avant': 'by day, last 7 days vs the 7 before',
  'par jour, ce mois contre le mois dernier': 'by day, this month vs last month',
  'Ventes': 'Sales',
  'Panier moyen': 'Average basket',
  'Commandes par période': 'Orders per period',
  'Arrivée des retours': 'Incoming returns',
  'Retours par période': 'Returns per period',
  'Valeur retournée': 'Returned value',
  'Taux de retour': 'Return rate',
  'pts': 'pts',
  'Cette période': 'This period',
  'Hier': 'Yesterday',
  'Période d’avant': 'Previous period',
  'dernières commandes': 'latest orders',
  '+ {0} autres': '+ {0} more',
  'Aucune commande pour l’instant.': 'No orders yet.',
  'Produits': 'Products',
  'En vente': 'For sale',
  'Variantes': 'Variants',
  'variantes en stock': 'variants in stock',
  'Meilleures ventes': 'Best sellers',
  'ce mois-ci': 'this month',
  'vendu': 'sold',
  'vendus': 'sold',
  'Aucune vente ce mois-ci.': 'No sales this month.',
  'En attente': 'Pending',
  'Confirmées': 'Confirmed',
  'Préparation': 'Preparing',
  'Expédiées': 'Shipped',
  'Livrées': 'Delivered',
  'Boutique en ligne': 'Online store',
  'Vente au comptoir': 'In-store sale',
  'Téléphone': 'Phone',
  'Par canal': 'By channel',
  'Aucune commande ce mois-ci.': 'No orders this month.',
  '{0} sur {1} dernières': '{0} of the latest {1}',
  'Prioritaire': 'Priority',
  'Traitement prioritaire demandé par le client': 'Priority handling requested by the customer',
  'Lancer la préparation': 'Start preparing',
  'Lancer la préparation de': 'Start preparing',
  ' — la préparation reste fermée tant qu’elle n’est pas libérée.': ' — preparation stays closed until it is released.',
  'Préparation ouverte dans sa fenêtre.': 'Preparation opened in its window.',
  'Ouverture…': 'Opening…',
  'Tableau de bord — Administration Sandriza': 'Dashboard — Sandriza Administration',
  'Tableau de bord': 'Dashboard',
  'Tableau de bord indisponible': 'Dashboard unavailable',
  'Votre rôle ne donne pas accès au tableau de bord.': 'Your role does not give access to the dashboard.',
  'Aucune entrée.': 'No entry.',
  'Tout voir →': 'See all →',
  'Tout cumulé': 'All time',
  '⚙ Tuiles': '⚙ Tiles',

  /* ── LES TUILES ─────────────────────────────────────────────────────────── */
  'Commandes à traiter': 'Orders to process',
  'Produits actifs': 'Active products',
  'Clients actifs': 'Active customers',
  'Revenus (payés)': 'Revenue (paid)',
  'Revenus (net)': 'Revenue (net)',
  'Nouveaux retours': 'New returns',
  'Retours qui expirent': 'Returns expiring',
  'En livraison': 'In transit',
  'Ruptures de stock': 'Out of stock',
  'Avis à modérer': 'Reviews to moderate',
  'Factures en retard': 'Overdue invoices',
  'Incidents ouverts': 'Open incidents',
  'Dernière sauvegarde': 'Last backup',
  /* ⚠ L AGE DE LA SAUVEGARDE — sa capture du 2026-09-13 : « 4 jours » sous
     « LAST BACKUP ». Fragments courts et en minuscules : le relevé du résiduel
     les écarte, parce que c est la forme d un identifiant de code. */
  'aujourd’hui': 'today',
  'hier': 'yesterday',
  '{0} jours': '{0} days',
  'jamais': 'never',
  'lecture en cours…': 'reading…',
  /* ⚠ Ce texte parait quand AUCUNE sauvegarde n existe : c est un avertissement,
     pas un etat neutre. « unprotected » le dit sans dramatiser. */
  'la base n’est pas protégée': 'the database is unprotected',

  /* ── CE QU IL Y A A FAIRE MAINTENANT ────────────────────────────────────── */
  'À faire maintenant': 'To do now',
  'commande à traiter': 'order to process',
  'commandes à traiter': 'orders to process',
  'message sans réponse': 'unanswered message',
  'messages sans réponse': 'unanswered messages',
  'retour à traiter': 'return to process',
  'retours à traiter': 'returns to process',
  'retour sur le point d’expirer': 'return about to expire',
  'retours sur le point d’expirer': 'returns about to expire',
  'avis à modérer': 'reviews to moderate',
  /* ⚠ CAI = Commission d acces a l information du Quebec. Le sigle NE SE TRADUIT
     PAS : c est le nom d un organisme, et le traduire le rendrait introuvable. */
  'avis à la CAI à transmettre': 'notices to report to the CAI',
  'à réapprovisionner': 'to restock',
  'aucun réapprovisionnement': 'nothing to restock',
  'à traiter': 'to process',
  'colis pas encore reçu': 'parcel not yet received',
  'aucun retour à risque': 'no return at risk',
  'colis partis, pas encore livrés': 'parcels shipped, not yet delivered',
  'en attente d’approbation': 'awaiting approval',
  'aucune échéance dépassée': 'no overdue deadline',
  'dossiers non clôturés': 'unclosed files',
  'registre Loi 25 à jour': 'Law 25 register up to date',
  'Comptes inactifs :': 'Inactive accounts:',
  'factures encaissées': 'invoices collected',

  /* ── LES LISTES DU BAS ──────────────────────────────────────────────────── */
  'Commandes récentes': 'Recent orders',
  'Factures récentes': 'Recent invoices',
  'Ouvrir la commande': 'Open the order',
  'Ouvrir la facture': 'Open the invoice',
  'Numéro Client Total Statut': 'Number Customer Total Status',

  /* ── LE MODE EXCLUSIF ───────────────────────────────────────────────────── */
  '🔒 Mode exclusif : ACTIF': '🔒 Exclusive mode: ON',
  '🔒 Mode exclusif…': '🔒 Exclusive mode…',

  /* ── LE TAUX DE CHANGE (morceaux, voir l en-tete) ───────────────────────── */
  'Taux de change indisponible. Les prix affichés en USD utilisent un taux':
    'Exchange rate unavailable. Prices shown in USD use a fallback',
  'de secours (1 USD =': 'rate (1 USD =',
  'CAD), donc approximatif.': 'CAD), so it is approximate.',
  'Les commandes, elles, sont toujours facturées en dollars canadiens.':
    'Orders themselves are always billed in Canadian dollars.',
  'Taux de change vieux de': 'Exchange rate is',
  'h (relevé du': 'h old (taken on',
  'Les prix en USD peuvent s’écarter du marché.': 'USD prices may drift from the market.',

  /* ── LES FRAGMENTS TELS QU ILS EXISTENT DANS LE GABARIT ────────────────
     ⚠ Les quatre en-têtes sont quatre cellules séparées : la forme jointe
     « Numéro Client Total Statut » n existe qu à l écran. */
  'Numéro': 'Number',
  'Client': 'Customer',
  'Total': 'Total',
  'Statut': 'Status',
  '(relevé du ': '(taken on ',
  'Taux de change indisponible. Les prix affichés en USD utilisent un taux de secours (1 USD =':
    'Exchange rate unavailable. Prices shown in USD use a fallback rate (1 USD =',

  /* ⚠ « Taux de change indisponible. » est en <strong>, la suite ne l est pas :
     deux fragments, deux entrées. */
  'Taux de change indisponible.': 'Exchange rate unavailable.',
  'Les prix affichés en USD utilisent un taux ': 'Prices shown in USD use a fallback ',

  /* ── LA LONGUE TRAINE (voir banc-langue-residuel) ───────────────────────── */
  'remboursés': 'refunded',
  'impayés': 'unpaid',

  /* ── CE QUE LE BANC RESIDUEL A TROUVE ──────────────────────────────────── */
  'Afficher ou masquer des tuiles': 'Show or hide tiles',
  'Empecher toute autre connexion pendant une maintenance': 'Prevent anyone else from signing in during maintenance',
  'Mode exclusif : ACTIF': 'Exclusive mode: ON',
  'Mode exclusif': 'Exclusive mode',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ──────────────────────────────
     ⚠⚠ CE SONT CEUX DE SA CAPTURE DU TABLEAU DE BORD. Les sous-titres des
     tuiles étaient écrits collés à un nombre — « 11 variantes to restock », une
     phrase à MOITIÉ traduite, moitié française moitié anglaise sur le même
     écran. C'est la signature du morceau collé : le début vient d'un littéral
     nu, la fin d'une entrée de dictionnaire. */
  'facture en retard': 'invoice overdue',
  'factures en retard': 'invoices overdue',
  'en attente': 'waiting',
  'aucun message en attente': 'no message waiting',
  /* ⚠ LES DEUX ALTERNATIVES EN ENTIER, jamais un « s » collé : c'est ce qui
     donnait « 11 variantes to restock » sur sa capture. */
  'variante à réapprovisionner': 'variant to restock',
  'variantes à réapprovisionner': 'variants to restock',
  'nouveau message en attente': 'new message waiting',
  'nouveaux messages en attente': 'new messages waiting',
  'demande à traiter': 'request to handle',
  'demandes à traiter': 'requests to handle',
  'Commandes': 'Orders',
  'Messagerie': 'Messages',
  'aucune demande en attente': 'no request waiting',
  'aucun colis en route': 'no parcel on its way',
  'aucun avis en attente': 'no review waiting',
  'un collegue': 'a colleague',
  // La refonte (2026-09-25).
  'Client et commande': 'Customer and order',
  'Client et commande Total Statut': 'Customer and order Total Status',
  'Clavardage': 'Chat',
  'conversation en attente de réponse': 'conversation awaiting a reply',
  'conversations en attente de réponse': 'conversations awaiting a reply',
  'conversations attendent votre réponse': 'conversations await your reply',
  'conversation attend votre réponse': 'conversation awaits your reply',
  'aucune conversation en attente': 'no conversation waiting',
  /* Suppression d une carte et clic droit (2026-10-13). */
  'Ouvrir le retour': 'Open return',
  'Ouvrir la commande': 'Open order',
  'Traiter — lancer la préparation': 'Process — start picking',
  'Changer le statut…': 'Change status…',
  'Supprimer la commande…': 'Delete order…',
  '{0} crédits': '{0} credits',
  'Soldes des services': 'Service balances',
  'Solde Twilio indisponible :': 'Twilio balance unavailable:',
  'Solde du compte Twilio (appels et textos)': 'Twilio account balance (calls and texts)',
  'Solde Fal.ai indisponible :': 'Fal.ai balance unavailable:',
  'Estimation : solde saisi le {0} ({1}) moins la consommation mesurée depuis ({2}).': 'Estimate: balance entered on {0} ({1}) minus the usage measured since ({2}).',
  'Solde du compte Fal.ai, lu chez Fal.ai': 'Fal.ai account balance, read from Fal.ai',
  'Pour le vrai solde : une clé de lecture du solde dans Configuration › Clés (Fal.ai). En attendant : ': 'For the real balance: a balance read key in Configuration › Keys (Fal.ai). Meanwhile: ',
  'Solde Photoroom indisponible :': 'Photoroom balance unavailable:',
  'Crédits restants du compte Photoroom': 'Remaining Photoroom account credits',
  'Soldes…': 'Balances…',
  'Soldes indisponibles': 'Balances unavailable',
  'Nouveau logo posé sur la boutique, les factures et les courriels.': 'New logo applied to the shop, invoices and emails.',
  'lu à {0}': 'read at {0}',
  'voir le détail': 'see the details',
  // (2026-10-18) la pastille The New Black
  'Aucune clé The New Black : Configuration › Sécurité › Clé et plafond de dépense IA.': 'No The New Black key: Configuration › Security › AI key and spending ceiling.',
  'Solde The New Black indisponible :': 'The New Black balance unavailable:',
  'Crédits du compte The New Black, lus chez The New Black — forfait {0} : {1} crédits par mois, cumul de {2} au plus': 'The New Black account credits, read from The New Black — {0} plan: {1} credits a month, up to {2} accumulated',
  // Refonte de la préparation, deux jeux de clés des transporteurs (2026-10-19).
  "Préparation déjà ouverte": "Preparation already open",
  "Ouverture en cours…": "Opening…",
  "Une préparation est déjà en cours d’ouverture…": "A preparation is already opening…",
  "L’ouverture a échoué.": "Opening failed.",
};
