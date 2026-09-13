'use strict';

/*
 * DÉCONNEXION IMMINENTE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CETTE FENETRE INTERROMPT QUELQU UN QUI N A RIEN DEMANDE, et le decompte
 * court pendant qu il la lit. Chacune de ses quatre lignes doit se comprendre
 * du premier coup d oeil : POURQUOI elle s ouvre (« Vous n’avez rien fait depuis
 * un moment. »), CE QUI VA ARRIVER (« Votre session d’administration se fermera
 * à la fin du décompte. ») et LES DEUX ISSUES.
 *
 * ⚠⚠ « RESTER CONNECTÉ » EST LE GESTE QU ON CHERCHE. Il porte la coche, il est
 * le bouton principal, et son libelle doit rester le plus court des deux : on le
 * vise sans lire.
 *
 * ⚠ « Refusé ( … ) » garde le motif technique entre parentheses : c est ce
 * qu on cite quand rien ne marche.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Déconnexion imminente': 'Signing out soon',

  /* ══ POURQUOI, ET CE QUI VA ARRIVER ════════════════════════════════════════ */
  'Vous n’avez rien fait depuis un moment.': 'You have not done anything for a while.',
  'Votre session d’administration se fermera à la fin du décompte.':
    'Your administration session will close when the countdown ends.',

  /* ══ LES DEUX ISSUES ═══════════════════════════════════════════════════════
   * ⚠⚠ Celui-la est le geste qu on cherche : il reste le plus court. */
  ' Rester connecté': ' Stay signed in',
  '✓ Rester connecté': '✓ Stay signed in',
  'Se déconnecter': 'Sign out',
  'Prolongation…': 'Extending…',
  'Fermeture…': 'Closing…',

  /* ── L ECHEC ────────────────────────────────────────────────────────────── */
  /* ⚠ Le motif technique reste : c est ce qu on cite. */
  'Refusé (': 'Refused ('
};
