'use strict';

/*
 * LE VEILLEUR (zone de notification) — les deux langues
 * =============================================================================
 * ⚠⚠⚠ SA DEMANDE DU 2026-09-13 : « n'oublie pas de traduire le menu contextuel
 * de l'application aussi ». C'est CE menu-là : celui qui s'ouvre quand on
 * clique l'icône de la zone de notification. Il était FRANÇAIS EN ENTIER —
 * pas une seule traduction, pas même un appel à `T()`.
 *
 * ⚠⚠ POURQUOI LE CHANTIER BILINGUE L'A MANQUÉ, ET CE N'EST PAS UN OUBLI
 * ORDINAIRE. Tous les bancs de langue parcourent `src/fenetres/` : ce sont des
 * FENÊTRES qu'ils dessinent et relisent. `veilleur.js` n'en est pas une — c'est
 * un module du processus principal, et son menu est bâti par `Menu.buildFromTemplate`,
 * jamais par du HTML. Il n'y avait donc rien à dessiner, rien à relire, et
 * personne pour s'en plaindre.
 * ➡ **UNE SURFACE QUI N'EST PAS UNE FENÊTRE N'EST DANS LE CHAMP D'AUCUN BANC
 *   QUI PARCOURT LES FENÊTRES.** C'est la cinquième forme de la même leçon, et
 *   la seule que l'utilisateur ait dû nommer lui-même.
 *
 * ⚠ SON DICTIONNAIRE VIT ICI, avec les autres, et il est gardé par
 * `banc-langue-processus-principal` — dont la liste `TABLES` a justement été
 * écrite pour ça : « un banc qui ne garde qu'une table se périme dès la
 * deuxième ».
 *
 * ⚠ CE QUI RESTE EN ANGLAIS DANS LES DEUX LANGUES : « SANDRIZA », un nom propre.
 */

module.exports = {
  /* ── La ligne d'état, en haut du menu ──────────────────────────────────── */
  'En pause': 'Paused',
  'À l’écoute des commandes et des retours': 'Listening for orders and returns',
  'Veilleur SANDRIZA — ': 'SANDRIZA watcher — ',

  /* ── DEPUIS QUAND ÇA NE MARCHE PAS (#100, 2026-09-14) ───────────────────
     ⚠ DES PHRASES ENTIÈRES, avec le nombre en `{0}`. Traduire « depuis »,
     « 3 » et « jours » séparément marche en français et en anglais par
     coïncidence, et casse à la première langue qui range les mots autrement.
     C'est la leçon des 139 pluriels collés du 2026-09-13. */
  '(à l’instant)': '(just now)',
  'depuis {0} minute': 'for {0} minute',
  'depuis {0} minutes': 'for {0} minutes',
  'depuis {0} heure': 'for {0} hour',
  'depuis {0} heures': 'for {0} hours',
  'depuis {0} jour': 'for {0} day',
  'depuis {0} jours': 'for {0} days',

  /* ── Les motifs d'un veilleur qui ne peut pas travailler ────────────────
     ⚠ ILS DISENT QUOI FAIRE, PAS SEULEMENT CE QUI NE VA PAS — la traduction
     doit garder cette qualité, sinon elle rend le message inutile. */
  'Cette version de l’application n’a pas de clé (défaut de construction)':
    'This build of the application has no key (build fault)',
  'Le serveur a refusé cette version de l’application':
    'The server refused this build of the application',
  'Le système refuse les notifications (les sons et la liste ci-dessous fonctionnent)':
    'The system is blocking notifications (the sounds and the list below still work)',
  'Base de données injoignable': 'Database unreachable',
  'Le serveur n’a pas répondu à temps': 'The server did not answer in time',
  'Réseau indisponible': 'Network unavailable',

  /* ── L'historique des notifications ─────────────────────────────────────── */
  'Veille active — connectez-vous pour voir les notifications':
    'Watch is on — sign in to see the notifications',
  'Dernières notifications': 'Latest notifications',
  /* ⚠ « {0} dernières notifications » EST PARTI LE 2026-09-14 (#124), et c'est
     le banc qui l'a signalé : plus personne ne le demandait. C'était le titre du
     sous-menu qui portait TOUTE la liste — il a disparu avec lui, les trois
     dernières étant maintenant à plat dans le menu. Une entrée de dictionnaire
     que personne ne demande est du poids mort qui donne l'illusion d'un écran
     traduit. */
  /* ⚠ LE TITRE DIT LA DURÉE, PAS SEULEMENT « HISTORIQUE » (#124). « History »
     tout court laisserait croire qu'on garde tout depuis toujours — et l'on
     chercherait un mois plus tard une notification effacée depuis trois
     semaines, en croyant à une panne. Les deux langues doivent porter le
     nombre de jours. */
  'Historique des {0} derniers jours': 'History of the last {0} days',
  /* La pastille de l'icône, dans l'infobulle. ⚠ « non vue(s) » et non « nouvelles » :
     une commande peut être arrivée hier et n'avoir toujours pas été regardée. */
  '{0} non vue(s)': '{0} unseen',
  'Effacer la liste': 'Clear the list',

  /* ── Les commandes du menu ──────────────────────────────────────────────── */
  'Mettre en pause': 'Pause',
  'Reprendre la veille': 'Resume the watch',
  'Vérifier maintenant': 'Check now',
  'Essayer les deux sons': 'Try both sounds',
  'Son d’une commande (monte)': 'Order sound (rising)',
  'Son d’un retour (descend)': 'Return sound (falling)',
  'Ouvrir l’administration': 'Open the administration',
  'Personnel connecté…': 'Staff signed in…',
  'Déconnexion…': 'Sign out…',
  'Quitter l’application': 'Quit the application',

  /* ── Les notifications elles-mêmes ──────────────────────────────────────
     ⚠ LES DEUX ALTERNATIVES EN ENTIER : le pluriel anglais ne se fabrique pas
     toujours en ajoutant une lettre, et un « s » collé à part ne passerait par
     aucun dictionnaire. */
  'nouvelle commande': 'new order',
  'nouvelles commandes': 'new orders',
  'nouvelle demande de retour': 'new return request',
  'nouvelles demandes de retour': 'new return requests',
  'Ouvrez l’administration pour la traiter.': 'Open the administration to handle it.',
};
