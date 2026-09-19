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
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Nos Retours — Administration Sandriza': 'Our Returns — Sandriza Administration',
  'Nos Retours': 'Our Returns',
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
  'Demande ouverte dans sa fenêtre.': 'Request opened in its own window.'
};
