'use strict';

/*
 * PUBLICITÉ CIBLÉE — les deux langues
 * =============================================================================
 * ⚠⚠ SIX ONGLETS D ANALYSE, et un seul qui ECRIT : les campagnes ciblees. Le
 * reste ne fait que lire — revenus, segments, promotions, attribution sociale,
 * satisfaction du clavardage.
 *
 * ⚠⚠⚠ LE MESSAGE D UNE CAMPAGNE PART CHEZ LA CLIENTE. Il est publie sur les
 * reseaux et envoye par infolettre : c est de la DONNEE, et son EXEMPLE reste
 * donc EN FRANCAIS — sinon on apprend a l administratrice anglophone a ecrire
 * en anglais a une clientele qui lit le francais. Le NOM de la campagne, lui,
 * ne sort pas de l administration : son exemple suit la langue du poste.
 * C est la meme coupure que dans `campagnes` et dans `recommandations`.
 *
 * ⚠ LES SEGMENTS PORTENT LEUR REGLE DANS LEUR NOM : « Reguliers (2-4 cmd) »,
 * « VIP (5+ cmd ou 500 $+) », « Inactifs (90j+) ». Traduire le mot en perdant le
 * critere ferait cibler le mauvais monde — et une campagne ne se rappelle pas.
 *
 * ⚠ LES DESTINATIONS DU LIEN UTM sont des libelles : c est la VALEUR (la route
 * `#shop?cat=robes`) qui part dans le lien publie, et `banc-langue-donnees` la
 * protege deja. ⚠ Les noms de reseaux (Facebook, Instagram, Pinterest, TikTok)
 * sont des noms propres.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Publicité ciblée — Administration Sandriza': 'Targeted advertising — Sandriza Administration',
  /* ⚠ La source ecrit l esperluette ECHAPPEE ; la forme rendue la perd. */
  'Publicité ciblée &amp; analytique': 'Targeted advertising &amp; analytics',
  'Publicité ciblée analytique': 'Targeted advertising analytics',
  'Analytique indisponible': 'Analytics unavailable',
  'Lecture seule': 'Read only',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne permet pas cette action.': 'Your role does not allow this action.',
  'L’administration n’est pas chargée.': 'The administration is not loaded.',
  'Nom requis.': 'Name required.',
  'Message requis.': 'Message required.',
  'Campagne introuvable.': 'Campaign not found.',
  'Aucune réponse de la fenêtre principale.': 'No answer from the main window.',
  'dans la fenêtre principale.': 'in the main window.',

  /* ── LES SIX ONGLETS ────────────────────────────────────────────────────── */
  'Vue d’ensemble': 'Overview',
  'Segments': 'Segments',
  'Promotions': 'Promotions',
  'Attribution sociale': 'Social attribution',
  'Campagnes': 'Campaigns',
  'Satisfaction': 'Satisfaction',

  /* ── LA VUE D ENSEMBLE ──────────────────────────────────────────────────── */
  'Revenu total': 'Total revenue',
  '💰 Revenu total': '💰 Total revenue',
  'Revenu promo': 'Promo revenue',
  '🎯 Revenu promo': '🎯 Promo revenue',
  'Clients actifs': 'Active customers',
  '👥 Clients actifs': '👥 Active customers',
  'Panier moyen': 'Average basket',
  '🛒 Panier moyen': '🛒 Average basket',
  'Réponse sondage': 'Survey response',
  '💌 Réponse sondage': '💌 Survey response',
  'Revenu mensuel — 6 mois': 'Monthly revenue — 6 months',
  'Total': 'Total',
  'Promo': 'Promo',
  'Revenu mensuel — 6 mois Total Promo': 'Monthly revenue — 6 months Total Promo',
  'Top 5 produits': 'Top 5 products',
  '🏆 Top 5 produits': '🏆 Top 5 products',
  'Aucune vente.': 'No sale.',
  'Commandes récentes': 'Recent orders',
  'Commande': 'Order',
  'Client': 'Customer',
  'Date': 'Date',
  'Statut': 'Status',
  'Commandes récentes Commande Client Date Promo Total Statut':
    'Recent orders Order Customer Date Promo Total Status',
  'Aucune commande.': 'No order.',
  'Confirmée': 'Confirmed',
  'En attente': 'Pending',
  'Expédiée': 'Shipped',
  'Livrée': 'Delivered',
  'Annulée': 'Cancelled',
  'Préparation': 'Preparation',
  'Vérif.': 'Check',

  /* ══ LES SEGMENTS — LEUR NOM PORTE LEUR REGLE ══════════════════════════════
   * ⚠⚠ « (2-4 cmd) », « (5+ cmd ou 500 $+) », « (90j+) » ne sont pas une
   * decoration : c est le CRITERE. Traduire le mot en perdant le critere ferait
   * cibler le mauvais monde, et une campagne envoyee ne se rappelle pas. */
  'Tous les clients': 'All the customers',
  'Nouveaux (1 cmd)': 'New (1 order)',
  'Réguliers (2-4 cmd)': 'Regulars (2-4 orders)',
  'VIP (5+ cmd ou 500 $+)': 'VIP (5+ orders or $500+)',
  'Inactifs (90j+)': 'Inactive (90d+)',
  'Acheteurs promo': 'Promo buyers',
  'Ont utilisé une offre': 'Have used an offer',
  'Acheteurs promo Ont utilisé une offre': 'Promo buyers Have used an offer',
  'Aucun client dans ce segment.': 'No customer in this segment.',
  'autres — exportez en CSV pour la liste complète':
    'others — export to CSV for the full list',
  '⬇ Exporter CSV': '⬇ Export CSV',
  'Cibler ce segment': 'Target this segment',
  '📢 Cibler ce segment': '📢 Target this segment',
  'Courriel': 'Email',
  'Segment': 'Segment',
  'Cmd': 'Ord.',
  'Dépense': 'Spend',
  'Dernière cmd': 'Last order',
  'Client Courriel Segment Cmd Dépense Dernière cmd Promo':
    'Customer Email Segment Ord. Spend Last order Promo',
  ' exporté': ' exported',
  'contact': 'contact',

  /* ── LES PROMOTIONS ─────────────────────────────────────────────────────── */
  'Rabais auto': 'Auto discount',
  'Aucune promotion.': 'No promotion.',
  'Promotions': 'Promotions',
  '📣 Promotions': '📣 Promotions',
  'Cmd sous promo': 'Orders on promo',
  '📦 Cmd sous promo': '📦 Orders on promo',
  'Revenu (promo)': 'Revenue (promo)',
  '💰 Revenu (promo)': '💰 Revenue (promo)',
  'Économies accordées': 'Savings given',
  '🎁 Économies accordées': '🎁 Savings given',
  'Toutes les offres': 'All the offers',
  'coupons': 'coupons',
  'Nom': 'Name',
  'Type': 'Type',
  'Rabais': 'Discount',
  'Portée': 'Scope',
  'Revenu': 'Revenue',
  'Économies': 'Savings',
  'Toutes les offres coupons Nom Type Rabais Portée Cmd Revenu Économies Statut':
    'All the offers coupons Name Type Discount Scope Ord. Revenue Savings Status',

  /* ── L ATTRIBUTION SOCIALE ──────────────────────────────────────────────── */
  'Publications sociales': 'Social posts',
  'impact ventes': 'sales impact',
  'Publications sociales impact ventes': 'Social posts sales impact',
  'Commandes passées dans les 48 h suivant chaque publication':
    'Orders placed within 48 h after each post',
  'Réseaux': 'Networks',
  'Contenu': 'Content',
  'Cmd 48h': 'Ord. 48h',
  'Revenu 48h': 'Revenue 48h',
  'Date Réseaux Contenu Cmd 48h Revenu 48h': 'Date Networks Content Ord. 48h Revenue 48h',
  'Aucune publication dans l’historique.': 'No post in the history.',
  'Liens UTM trackés': 'Tracked UTM links',
  '🔗 Liens UTM trackés': '🔗 Tracked UTM links',
  'Source': 'Source',
  'Campagne': 'Campaign',
  'Destination': 'Destination',
  'Lien généré': 'Generated link',
  'Copier': 'Copy',
  /* ⚠ DES LIBELLES, PAS DES VALEURS : la route (`#shop?cat=robes`) est ce qui
     part dans le lien publie, et le banc des donnees la protege deja. */
  'Boutique': 'Shop',
  'Robes': 'Dresses',
  'Hauts': 'Tops',
  'Accessoires': 'Accessories',
  'Cartes-cadeaux': 'Gift cards',
  'Recommandations': 'Recommendations',
  '💡 Recommandations': '💡 Recommendations',
  'Cibler →': 'Target →',
  'Continuez à accumuler des données pour obtenir des recommandations.':
    'Keep gathering data to get recommendations.',

  /* ── LES CAMPAGNES ──────────────────────────────────────────────────────── */
  'Aucune campagne. Créez la première !': 'No campaign. Create the first one!',
  'Créez des campagnes ciblées combinant publication sociale et infolettre selon les segments.':
    'Create targeted campaigns combining a social post and the newsletter by segment.',
  '+ Nouvelle campagne': '+ New campaign',
  'Audience': 'Audience',
  'Canaux': 'Channels',
  'Actions': 'Actions',
  'Nom Segment Audience Canaux Date Statut Actions':
    'Name Segment Audience Channels Date Status Actions',
  'Aucune promotion liée': 'No linked promotion',
  'Envoyée': 'Sent',
  'Brouillon': 'Draft',
  'Nouvelle campagne ciblée': 'New targeted campaign',
  'Nom de la campagne *': 'Campaign name *',
  /* ⚠ LE NOM NE SORT PAS DE L ADMINISTRATION : son exemple suit la langue du
     poste. Le MESSAGE, lui, part chez la cliente — voir plus bas. */
  'Promo Été 2026': 'Summer promo 2026',
  'Segment ciblé': 'Targeted segment',
  'Audience estimée': 'Estimated audience',
  'Promotion associée (optionnel)': 'Linked promotion (optional)',
  'Message *': 'Message *',
  /* ⚠⚠ CET EXEMPLE RESTE FRANCAIS, ET C EST UNE DECISION. Ce message est PUBLIE
     sur les reseaux et envoye par infolettre : la cliente le lit. Un exemple
     anglais apprendrait a ecrire en anglais a une clientele qui lit le
     francais — meme coupure que dans `campagnes` et `recommandations`. */
  'Découvrez nos offres exclusives !': 'Découvrez nos offres exclusives !',
  'Canaux de diffusion': 'Publishing channels',
  'Facebook': 'Facebook',
  'Instagram': 'Instagram',
  'Infolettre': 'Newsletter',
  'Pinterest': 'Pinterest',
  '📘 Facebook': '📘 Facebook',
  '📷 Instagram': '📷 Instagram',
  '📧 Infolettre': '📧 Newsletter',
  '📌 Pinterest': '📌 Pinterest',
  'Annuler': 'Cancel',
  'Sauvegarder brouillon': 'Save draft',
  'Sauvegarder': 'Save',
  'Lancer': 'Launch',
  'Sauvegarder Lancer': 'Save Launch',

  /* ── LA SATISFACTION DU CLAVARDAGE ──────────────────────────────────────── */
  'Module chat non chargé.': 'Chat module not loaded.',
  'Aucune évaluation chat pour le moment.': 'No chat rating for now.',
  'Les données apparaissent après que des clients aient noté leur conversation.':
    'The data appears once customers have rated their conversation.',
  '💬 Aucune évaluation chat pour le moment. Les données apparaissent après que des clients aient noté leur conversation.':
    '💬 No chat rating for now. The data appears once customers have rated their conversation.',
  'Commentaires récents': 'Recent comments',
  'Taux de satisfaction': 'Satisfaction rate',
  '% Taux de satisfaction': '% Satisfaction rate',
  'Répartition des évaluations': 'Breakdown of the ratings',
  'Satisfaits': 'Satisfied',
  '👍 Satisfaits': '👍 Satisfied',
  'Insatisfaits': 'Dissatisfied',
  '👎 Insatisfaits': '👎 Dissatisfied',
  ' éval. sur ': ' ratings out of ',
  'éval. sur': 'ratings out of',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Enregistrement…': 'Saving…',
  'Campagne lancée ! ': 'Campaign launched! ',
  'Campagne lancée !': 'Campaign launched!',
  'Campagne lancée.': 'Campaign launched.',
  ' ciblé': ' targeted',
  'Brouillon enregistré.': 'Draft saved.',
  'Lien copié.': 'Link copied.',
  'Copie impossible.': 'Cannot copy.',
  'Campagne supprimée.': 'Campaign deleted.'
};
