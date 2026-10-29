'use strict';

/*
 * NOS RETOURS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ « ÉTIQUETTE RÉELLE » ET « ÉTIQUETTE GÉNÉRÉE » NE SONT PAS LA MEME CHOSE.
 * La premiere est une vraie etiquette de transporteur, payee, avec un suivi ; la
 * seconde est un document fabrique par nous, sans suivi. Les confondre fait
 * attendre un colis dont personne ne sait ou il est, ou repayer une etiquette
 * qui existait deja.
 *
 * ⚠⚠ « EXPIRE BIENTÔT » ET « EXPIRÉE AUTOMATIQUEMENT » SONT L AVANT ET L APRES
 * DU MEME DELAI. La premiere appelle un geste AUJOURD HUI ; la seconde dit que
 * le delai est passe et que la demande s est fermee toute seule. C est la
 * difference entre un client qu on peut encore servir et un client qu on a
 * perdu sans s en rendre compte.
 *
 * ⚠⚠ « FRAIS PRIS EN CHARGE » VEUT DIRE QUE LA BOUTIQUE PAIE LE RENVOI. C est
 * une depense, pas une mention d affichage.
 *
 * ⚠ Le numero de commande, le nom de la cliente, le motif et la date viennent du
 * coeur : ce sont des DONNEES. Le motif est ce que la cliente a ECRIT.
 */

module.exports = {
  /* ── LE PIED DE LISTE ET L EXPORT (2026-09-19) ─────────────────────────
     ⚠ LES PASTILLES DEVIENNENT DES COLONNES. A l ecran, << expiree
     automatiquement >> et << frais pris en charge >> sont des marques posees a
     cote du nom ; dans un fichier ce sont les criteres sur lesquels on trie et
     on compte. Une pastille perdue dans un export, c est une question a
     laquelle le fichier ne repondra pas.
     ⚠ Les en-tetes sont ceux du FICHIER : l ecran n est pas un tableau, ses
     lignes sont riches — le fichier, lui, est tabulaire, et c est justement
     pour ca qu il sert a autre chose. */
  'demande': 'request',
  'demandes': 'requests',
  'Commande': 'Order',
  'Client': 'Customer',
  'Motif': 'Reason',
  'Statut': 'Status',
  'Date': 'Date',
  'Suivi': 'Tracking',
  'Étiquette': 'Label',
  'La liste des retours': 'The return list',
  /* ── LA GRAMMAIRE DES FACTURES (2026-10-16) : la tete, le panneau d appui ── */
  '{0} en attente': '{0} pending',
  'Parcours des retours': 'Where returns stand',
  'À surveiller': 'To watch',
  '1 demande expire bientôt.': '1 request expires soon.',
  '{0} demandes expirent bientôt.': '{0} requests expire soon.',
  '1 demande à trancher.': '1 request to decide.',
  '{0} demandes à trancher.': '{0} requests to decide.',
  'Aucune demande à surveiller.': 'No request to watch.',
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Nos retours — Administration Sandriza': 'Our returns — Sandriza Administration',
  'Nos retours': 'Our returns',
  'Retours indisponibles': 'Returns unavailable',
  'Chargement… (les demandes se resynchronisent)':
    'Loading… (the requests are resynchronising)',
  'Votre rôle ne donne pas accès aux retours.':
    'Your role does not give access to the returns.',
  'Cette demande n’existe plus.': 'This request no longer exists.',

  /* ══ LES PILES ═════════════════════════════════════════════════════════════ */
  'En attente': 'Pending',
  'En transit': 'In transit',
  /* ⚠⚠ L AVANT du delai : un geste est encore possible. */
  'Expire bientôt': 'Expires soon',
  'À analyser': 'To review',
  'Approuvées': 'Approved',
  'Reçues': 'Received',
  'Rejetées': 'Rejected',
  /* ⚠ Le coeur range ici les remboursees ET les completees : un seul mot. */
  'Complétées': 'Completed',
  'Toutes': 'All',
  'Nom, courriel, n° commande': 'Name, email, order no.',
  'Nom, courriel, n° commande…': 'Name, email, order no.…',
  'Ouvrir la demande de retour': 'Open the return request',
  'Aucune demande.': 'No request.',
  'Aucune demande dans cette catégorie.': 'No request in this category.',

  /* ══ LES PASTILLES D UNE DEMANDE ═══════════════════════════════════════════
   * ⚠⚠ L APRES du delai : la demande s est fermee toute seule. */
  'Expirée automatiquement': 'Expired automatically',
  ' Expire le ': ' Expires on ',
  '⏳ Expire le': '⏳ Expires on',
  /* ⚠⚠⚠ Une vraie etiquette de transporteur, ou un document fabrique par nous
     sans suivi. Voir l en-tete. */
  ' Étiquette réelle': ' Real label',
  '🏷️ Étiquette réelle': '🏷️ Real label',
  ' Étiquette générée': ' Generated label',
  '🏷️ Étiquette générée': '🏷️ Generated label',
  /* ⚠⚠ La boutique paie le renvoi : c est une depense. */
  'Frais pris en charge': 'Shipping covered',
  /* ⚠ Le motif est ce que la CLIENTE a ecrit : seule l etiquette se lit. */
  'Motif : ': 'Reason: ',
  'Motif :': 'Reason:',

  /* ── LE VERDICT ─────────────────────────────────────────────────────────── */
  'Demande ouverte dans sa fenêtre.': 'Request opened in its own window.',
  // La refonte de la liste, comme l'Inventaire (2026-09-25).
  'à traiter': 'to handle',
  'en route vers nous': 'on the way back',
  'à inspecter': 'to inspect',
  'à trancher': 'to decide',
  'délai qui s’achève': 'deadline ending',
  'Cliquer pour afficher': 'Click to show',
  'Expire le ': 'Expires on ',
  'Expire le': 'Expires on',
  'Étiquette réelle': 'Real label',
  'Étiquette générée': 'Generated label',
  // Gestes groupés (2026-10-29)
  "{0} demande sélectionnée": "{0} request selected",
  "{0} demandes sélectionnées": "{0} requests selected",
  "Marquer reçus": "Mark as received",
  "Renvoyer l’étiquette au client": "Resend the label to the customer",
  "Exporter (CSV)": "Export (CSV)",
  "{0} autre demande sélectionnée ne s’y prête pas : elle ne change pas.": "{0} other selected request does not qualify: it stays unchanged.",
  "{0} autres demandes sélectionnées ne s’y prêtent pas : elles ne changent pas.": "{0} other selected requests do not qualify: they stay unchanged.",
  "Courriel": "Email",
  "{0} demande exportée": "{0} request exported",
  "{0} demandes exportées": "{0} requests exported",
  "Marquer les colis comme reçus": "Mark the parcels as received",
  "{0} colis de retour sera marqué reçu en entrepôt ; le client en est avisé par courriel.": "{0} return parcel will be marked as received at the warehouse; the customer is notified by email.",
  "{0} colis de retour seront marqués reçus en entrepôt ; chaque client en est avisé par courriel.": "{0} return parcels will be marked as received at the warehouse; each customer is notified by email.",
  "{0} client recevra de nouveau son étiquette de retour par courriel.": "{0} customer will receive their return label again by email.",
  "{0} clients recevront de nouveau leur étiquette de retour par courriel.": "{0} customers will receive their return label again by email.",
  "Marquer {0} colis reçu": "Mark {0} parcel as received",
  "Marquer {0} colis reçus": "Mark {0} parcels as received",
  "Renvoyer {0} étiquette": "Resend {0} label",
  "Renvoyer {0} étiquettes": "Resend {0} labels",
  "Réception des colis": "Receiving parcels",
  "Renvoi des étiquettes": "Resending labels",
  "courriel non envoyé": "email not sent",
  "{0} colis marqué reçu.": "{0} parcel marked as received.",
  "{0} colis marqués reçus.": "{0} parcels marked as received.",
  "{0} étiquette renvoyée.": "{0} label resent.",
  "{0} étiquettes renvoyées.": "{0} labels resent.",
  // Gestes groupés (2026-10-29)
  "Son statut ne le permet plus (déjà reçue, ou changée ailleurs).": "Its status no longer allows it (already received, or changed elsewhere).",
  "Aucune étiquette de retour n’est enregistrée pour cette demande.": "No return label is recorded for this request.",
  "Le serveur n’a pas pris la modification.": "The server did not accept the change.",
  "Cette demande est ouverte par quelqu’un d’autre.": "This request is open by someone else.",
};
