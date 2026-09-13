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
  'Retours sur le point d’expirer': 'Returns about to expire',
  'En livraison': 'In transit',
  'Ruptures de stock': 'Out of stock',
  'Avis à modérer': 'Reviews to moderate',
  'Factures en retard': 'Overdue invoices',
  'Incidents ouverts': 'Open incidents',
  'Dernière sauvegarde': 'Last backup',
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
};
