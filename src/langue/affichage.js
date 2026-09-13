'use strict';

/*
 * AFFICHAGE CLIENT — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN EST TOURNE VERS LA CLIENTE, PAS VERS LA CAISSIERE. C est le
 * seul de l application qu une personne de l exterieur lit. Il suit quand meme
 * la langue du POSTE — une caisse ne sait pas qui se presentera devant elle, et
 * c est la boutique qui choisit sa langue d accueil.
 *
 * ⚠⚠ « SANDRIZA » EST LE NOM DE LA MARQUE. Il ne se traduit pas, et il est
 * remplace par le nom reel des que la marque en envoie un.
 *
 * ⚠⚠ LES DEUX PHRASES DE PANNE DISENT DEUX CHOSES DIFFERENTES : « Pas encore
 * relié à la caisse » veut dire que la caisse n a rien envoye ENCORE ;
 * « Cette version de l’application ne relaie pas la caisse » veut dire qu elle
 * ne le fera JAMAIS — il faut mettre a jour. Les confondre fait attendre devant
 * un ecran qui n affichera rien.
 *
 * ⚠ Les montants et le signe − sont des DONNEES et des symboles : seul le mot
 * « Rabais » se lit.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Affichage client': 'Customer display',
  /* ⚠ Le nom de la marque : il ne se traduit pas. */
  'SANDRIZA': 'SANDRIZA',
  'Votre commande': 'Your order',
  'Bienvenue. Votre commande s’affichera ici.':
    'Welcome. Your order will appear here.',

  /* ── LE TOTAL ───────────────────────────────────────────────────────────── */
  'Rabais': 'Discount',
  'Rabais −': 'Discount −',

  /* ══ LES DEUX PANNES ═══════════════════════════════════════════════════════
   * ⚠⚠ Pas encore, ou jamais. Voir l en-tete. */
  'Pas encore relié à la caisse': 'Not linked to the till yet',
  'Cette version de l’application ne relaie pas la caisse':
    'This version of the application does not relay the till'
};
