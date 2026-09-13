'use strict';

/*
 * AVIS PRODUITS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ APPROUVER UN AVIS LE REND VISIBLE EN BOUTIQUE, et le verdict le dit :
 * « Avis approuvé — il est maintenant visible en boutique. » C est la seule
 * phrase qui rappelle qu on ne range pas une fiche, on publie le texte d une
 * cliente sur la fiche produit.
 *
 * ⚠⚠ RETIRER UNE PHOTO LA RETIRE DU STOCKAGE, PAS SEULEMENT DE L AVIS — et le
 * TEXTE, lui, reste : « la photo quitte l’avis ET le stockage. Le texte reste
 * intact. » Les deux moities comptent : la premiere dit ce qui est perdu, la
 * seconde ce qui ne l est pas.
 *
 * ⚠⚠ CE QUE LA CLIENTE A ECRIT — son avis, son nom, le nom du produit, la taille
 * achetee — est une DONNEE. La REPONSE de la boutique aussi : elle s affiche
 * sous l avis, en boutique, dans la langue ou on l ecrit. Ce dictionnaire ne
 * traduit que les etiquettes et les verdicts.
 *
 * ⚠ « achat vérifié » n est pas un ornement : il dit que l avis vient d une
 * commande reelle.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Avis produits — Administration Sandriza': 'Product reviews — Sandriza Administration',
  'Avis produits': 'Product reviews',
  'Avis indisponibles': 'Reviews unavailable',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux avis.': 'Your role does not give access to the reviews.',
  'Cet avis n’existe plus.': 'This review no longer exists.',
  'Le geste a échoué.': 'The action failed.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',

  /* ── LES DEUX ONGLETS ET LES FILTRES ────────────────────────────────────── */
  'En attente': 'Pending',
  'Traités': 'Handled',
  'Filtrer par état de traitement': 'Filter by handling state',
  'Approuvés et refusés': 'Approved and refused',
  'Approuvés': 'Approved',
  'Refusés / masqués': 'Refused / hidden',
  'Nom ou n° de commande': 'Name or order no.',
  'Nom ou n° de commande…': 'Name or order no.…',
  'Toutes les notes': 'All ratings',
  ' sur 5': ' out of 5',
  'Toutes les dates': 'All dates',
  '7 derniers jours': 'Last 7 days',
  '30 derniers jours': 'Last 30 days',
  '90 derniers jours': 'Last 90 days',
  'Cette année': 'This year',
  'moyenne ': 'average ',
  ' publiés': ' published',
  ' publié': ' published',

  /* ── LA LISTE ───────────────────────────────────────────────────────────── */
  'Rien à approuver. La file est vide.': 'Nothing to approve. The queue is empty.',
  'Aucun avis ne correspond à ces filtres.': 'No review matches these filters.',
  'État': 'Status',
  'Note': 'Rating',
  'Produit': 'Product',
  'Client': 'Customer',
  'Date': 'Date',
  'État Note Produit': 'Status Rating Product',
  'Client Date': 'Customer Date',
  'Ouvrir l’avis': 'Open the review',
  /* ⚠ Les VALEURS (`pending`, `published`, `hidden`) restent nues. */
  'Publié': 'Published',
  'Masqué': 'Hidden',

  /* ── LA FICHE D UN AVIS ─────────────────────────────────────────────────── */
  /* ⚠ Il dit que l avis vient d une commande reelle. */
  'achat vérifié': 'verified purchase',
  'Taille achetée': 'Size bought',
  'Déposé le': 'Left on',
  'Approuvé le': 'Approved on',
  'Votre réponse': 'Your answer',
  /* ⚠⚠ LES PHRASES ENTIERES : avec la seule cle « Votre réponse », ces deux
     textes sortaient a moitie anglais (« Your answer publique à cet avis »). La
     cle COURTE existait, la LONGUE n avait jamais ete ecrite. */
  'Votre réponse publique à cet avis': 'Your public answer to this review',
  'Votre réponse sera affichée publiquement sous l’avis.':
    'Your answer will be shown publicly under the review.',
  'Retirer cette photo de l’avis et du stockage':
    'Remove this photo from the review and from the storage',
  'vérifié': 'verified',
  'Enregistrer la réponse': 'Save the answer',
  'Image introuvable à cette adresse': 'No image found at this address',
  ' Répondre': ' Answer',
  '💬 Répondre': '💬 Answer',
  ' Republier': ' Publish again',
  '👁 Republier': '👁 Publish again',
  ' Masquer': ' Hide',
  '🙈 Masquer': '🙈 Hide',
  '✓ Approuver': '✓ Approve',
  'Confirmer la suppression ?': 'Confirm the deletion?',

  /* ══ LES VERDICTS ══════════════════════════════════════════════════════════ */
  /* ⚠⚠ CE QUI PART ET CE QUI RESTE. */
  'Recliquez pour confirmer — la photo quitte l’avis ET le stockage. Le texte reste intact.':
    'Click again to confirm — the photo leaves the review AND the storage. The text stays untouched.',
  'Photo retirée — ': 'Photo removed — ',
  'Photo retirée —': 'Photo removed —',
  ' restantes.': ' left.',
  ' restante.': ' left.',
  'restantes.': 'left.',
  'restante.': 'left.',
  'Photo retirée — il n’en reste aucune.': 'Photo removed — none left.',
  /* ⚠⚠ APPROUVER, C EST PUBLIER EN BOUTIQUE. */
  'Avis approuvé — il est maintenant visible en boutique.':
    'Review approved — it is now visible in the storefront.',
  'Avis republié.': 'Review published again.',
  'Avis masqué.': 'Review hidden.',
  'Avis supprimé définitivement.': 'Review deleted for good.',
  'Retrait…': 'Removing…',
  'Réponse enregistrée.': 'Answer saved.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Page': 'Page',
  'Commande': 'Order',
  'Langue': 'Language',
  'Photos': 'Photos',
  'Fermer': 'Close',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) — collés à une donnée. */
  'sur 5 ·': 'out of 5 ·',
  '(aucun texte)': '(no text)'
};
