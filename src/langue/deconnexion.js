'use strict';

/*
 * DÉCONNEXION — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LES DEUX PHRASES DE LA NOTE SONT CE QUI PERMET DE REPONDRE. La premiere
 * previent d une perte — « Le travail non enregistré sera perdu » ; la seconde
 * rassure sur ce qui NE se ferme pas — « Ce poste restera ouvert : seule la
 * session se ferme. » Garder l une sans l autre change la reponse : sans la
 * premiere on perd du travail, sans la seconde on n ose pas se deconnecter.
 *
 * ⚠⚠ LE NOM ET LE ROLE DE LA PERSONNE CONNECTEE SONT DES DONNEES. Ils disent
 * QUI l on s apprete a deconnecter — sur un poste partage, c est toute la
 * question. Seule la phrase autour se lit.
 *
 * ⚠ L echec a sa propre phrase, et elle dit QUOI FAIRE : fermer la fenetre et
 * reessayer. Un message qui ne dit que « ça a raté » laisse la personne devant
 * une fenetre qui ne repond plus.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Déconnexion': 'Sign out',

  /* ══ LA QUESTION ═══════════════════════════════════════════════════════════
   * ⚠⚠ Le nom et le role suivent : ils disent QUI l on deconnecte. */
  'Voulez-vous vraiment vous déconnecter ?': 'Do you really want to sign out?',
  'Session ouverte au nom de ': 'Session open in the name of ',
  'Session ouverte au nom de': 'Session open in the name of',
  /* ⚠⚠⚠ LES DEUX MOITIES DE LA NOTE. Voir l en-tete : l une sans l autre
     change la reponse. */
  'Le travail non enregistré sera perdu. Ce poste restera ouvert : seule la session se ferme.':
    'Unsaved work will be lost. This workstation stays open: only the session closes.',
  'Le travail non enregistré sera perdu. Ce poste restera':
    'Unsaved work will be lost. This workstation stays',
  'ouvert : seule la session se ferme.': 'open: only the session closes.',

  /* ── LES DEUX BOUTONS ───────────────────────────────────────────────────── */
  'Se déconnecter': 'Sign out',

  /* ── L ECHEC ────────────────────────────────────────────────────────────── */
  /* ⚠ Il dit QUOI FAIRE, pas seulement que ça a rate. */
  'La réponse n’a pas pu partir (': 'The answer could not be sent (',
  ') — fermez cette fenêtre et réessayez.':
    ') — close this window and try again.'
};
