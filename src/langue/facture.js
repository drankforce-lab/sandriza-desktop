'use strict';

/*
 * FACTURE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LE DOCUMENT NE VIENT PAS D ICI. La facture est construite par le SITE
 * (Billing) et arrive en HTML tout fait : cette fenetre la pose telle quelle,
 * l affiche et l imprime. Aucune de ses lignes ne passe par ce dictionnaire, et
 * la fenetre ne peut pas les atteindre. Ce qui se traduit ici, c est le CADRE :
 * le titre, le bouton, les refus et le verdict.
 *
 * ⚠⚠ « Facture envoyée à l’impression. » NE VEUT PAS DIRE « imprimee » : le
 * document est parti vers l imprimante, et c est tout ce que la fenetre sait.
 * L echec, lui, a sa propre phrase.
 *
 * ⚠ Le NUMERO de la facture est une DONNEE : il compose le titre de la fenetre
 * (« Facture 1042 — Administration Sandriza »), et seules les deux moities
 * autour de lui se lisent.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Facture — Administration Sandriza': 'Invoice — Sandriza Administration',
  'Facture': 'Invoice',
  /* ⚠ Le numero s intercale : deux moities, un seul titre. */
  'Facture ': 'Invoice ',
  ' — Administration Sandriza': ' — Sandriza Administration',
  '— Administration Sandriza': '— Sandriza Administration',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux factures.':
    'Your role does not give access to the invoices.',
  'Le module de facturation n’est pas encore chargé dans la fenêtre principale.':
    'The billing module is not loaded in the main window yet.',
  'Cette facture n’existe plus.': 'This invoice no longer exists.',
  'L’impression a échoué.': 'The printing failed.',

  /* ══ L IMPRESSION ══════════════════════════════════════════════════════════
   * ⚠⚠ << envoyee a l impression >> n est pas << imprimee >>. */
  ' Imprimer': ' Print',
  '🖨 Imprimer': '🖨 Print',
  'Facture envoyée à l’impression.': 'Invoice sent to printing.'
};
