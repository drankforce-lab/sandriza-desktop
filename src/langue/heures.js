'use strict';

/*
 * HEURES D OUVERTURE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE QUI EST REGLE ICI EST LU PAR LA CLIENTELE, et un statut « ouvert /
 * fermé » est calcule EN TEMPS REEL a partir de ces heures. Une erreur ne se
 * voit pas ici : elle se voit sur le site, ou quelqu un se deplace pour trouver
 * porte close.
 *
 * ⚠⚠ TOUT EST A L HEURE DE L EST (Montreal / Quebec), et la fenetre le dit deux
 * fois — une fois en sous-titre, une fois dans la phrase du pied de page. Ce
 * n est pas une redondance : sans cela, quelqu un qui travaille d ailleurs
 * saisirait ses propres heures.
 *
 * ⚠ « Fermé ce jour » n est pas « pas encore rempli » : c est une DECISION, et
 * elle ferme la journee quoi qu il y ait dans les deux champs d heure.
 *
 * ⚠⚠ LES SEPT NOMS DE JOURS SONT ECRITS DANS CETTE FENETRE, pas dans le coeur —
 * et AUCUN DES DEUX BANCS NE LES VOYAIT : un seul mot (le compteur ecarte les
 * chaines d un mot) et sans accent (le residuel s appuie sur l accent). Ils
 * s affichaient donc en francais sur la page anglaise, les deux mesures a zero.
 * ➡ Ils ont chacun leur entree ici, et les etiquettes lues par un lecteur
 * d ecran les reprennent (« Heure d’ouverture — Lundi »).
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Heures d’ouverture — Administration Sandriza':
    'Opening hours — Sandriza Administration',
  'Heures d’ouverture': 'Opening hours',
  /* ⚠⚠ Le fuseau, dit en toutes lettres. Montreal et Quebec sont des noms
     propres : ils ne se traduisent pas. */
  'Heure de l’Est — Montréal / Québec': 'Eastern time — Montréal / Québec',
  'Lecture seule : vous pouvez consulter les heures, pas les modifier.':
    'Read only: you can look at the hours, not change them.',
  'Votre rôle est en lecture seule : les heures ne peuvent pas être modifiées.':
    'Your role is read only: the hours cannot be changed.',
  'La configuration n’est pas prête dans la fenêtre principale.':
    'The configuration is not ready in the main window.',
  'L’enregistrement dans le nuage a échoué. Réessayez.':
    'Saving to the cloud failed. Try again.',

  /* ══ CE QUE LA CLIENTELE VOIT ══════════════════════════════════════════════
   * ⚠⚠ Le statut est calcule EN TEMPS REEL, a l heure de l Est. */
  'Afficher les heures dans le pied de page': 'Show the hours in the footer',
  'Statut « ouvert / fermé » calculé en temps réel à l’heure de l’Est.':
    'An « open / closed » status worked out in real time, in Eastern time.',

  /* ══ LE TABLEAU ════════════════════════════════════════════════════════════ */
  'Jour': 'Day',
  'Ouverture': 'Opens',
  'Fermeture': 'Closes',
  /* ⚠ Une DECISION, pas un champ laisse vide. */
  'Fermé ce jour': 'Closed that day',
  'Jour Ouverture Fermeture': 'Day Opens Closes',
  /* ⚠⚠ LES SEPT JOURS, ECRITS DANS LA FENETRE. Voir l en-tete : aucun des deux
     bancs ne pouvait les attraper. */
  'Lundi': 'Monday',
  'Mardi': 'Tuesday',
  'Mercredi': 'Wednesday',
  'Jeudi': 'Thursday',
  'Vendredi': 'Friday',
  'Samedi': 'Saturday',
  'Dimanche': 'Sunday',
  /* ⚠ Le nom du jour suit. */
  'Heure d’ouverture — ': 'Opening time — ',
  'Heure d’ouverture —': 'Opening time —',
  'Heure de fermeture — ': 'Closing time — ',
  'Heure de fermeture —': 'Closing time —',
  'Fermé le ': 'Closed on ',
  'Fermé le': 'Closed on',

  /* ── LE VERDICT ─────────────────────────────────────────────────────────── */
  'Heures enregistrées.': 'Hours saved.'
};
