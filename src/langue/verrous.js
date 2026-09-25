'use strict';

/*
 * VERROUS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ DEVERROUILLER, C EST PRENDRE UNE FICHE A QUELQU UN QUI EST EN TRAIN DE LA
 * MODIFIER. Le geste est arme en deux clics et chaque phrase d armement dit ce
 * qu on va forcer — « Cliquez encore pour forcer ce déverrouillage. », « Cliquez
 * encore pour tout déverrouiller. ». Sans elles, on libere par curiosite le
 * travail d une collegue qui n a rien enregistre.
 *
 * ⚠⚠ « ACTIFS » ET « ÉTEINTS » NE SE VALENT PAS. Un verrou ACTIF bloque
 * quelqu un maintenant ; un verrou ETEINT (perime, ou dont la session est
 * fermee) NE BLOQUE PERSONNE et n est la que pour information. La phrase sous le
 * second tableau le dit en toutes lettres : la perdre fait deverrouiller en
 * urgence des lignes qui ne genaient personne.
 *
 * ⚠⚠ « PÉRIMÉ » ET « SESSION FERMÉE » SONT DEUX RAISONS DIFFERENTES qu un verrou
 * soit eteint : le premier a simplement vieilli, le second veut dire que le
 * poste qui le tenait n est plus la. Les confondre cache un poste qui a plante.
 *
 * ⚠ SEUL UN SUPER-ADMINISTRATEUR VOIT ET FORCE LES VERROUS : le refus le dit, et
 * ce n est pas la meme chose qu un ecran vide.
 *
 * ⚠ Le nom de la section, le libelle d une fiche, son identifiant et le nom de
 * la personne qui la tient viennent du coeur : ce sont des DONNEES.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Verrous — Administration Sandriza': 'Locks — Sandriza Administration',
  'Verrous': 'Locks',
  'Lecture des verrous…': 'Reading the locks…',
  'Aucune session ouverte dans l’application.':
    'No session open in the application.',
  /* ⚠ Ce n est pas un ecran vide : c est un refus, et il se dit. */
  'Seul un super-administrateur peut voir et forcer les verrous.':
    'Only a super-administrator can see and force the locks.',

  /* ── LE SOUS-TITRE ──────────────────────────────────────────────────────── */
  ' fiche en cours de modification': ' record being edited',
  ' fiches en cours de modification': ' records being edited',
  'personne ne tient de fiche': 'nobody is holding a record',

  /* ── LA BARRE ───────────────────────────────────────────────────────────── */
  ' Actualiser': ' Refresh',
  '🔄 Actualiser': '🔄 Refresh',
  ' Tout déverrouiller (': ' Unlock everything (',
  '🔓 Tout déverrouiller (': '🔓 Unlock everything (',
  '✓ Confirmer — tout déverrouiller': '✓ Confirm — unlock everything',

  /* ══ LES DEUX TABLEAUX ═════════════════════════════════════════════════════
   * ⚠⚠ Actifs = bloquent quelqu un. Eteints = ne bloquent personne. */
  'Verrous actifs (': 'Active locks (',
  'Aucun verrou actif — personne ne tient de fiche en ce moment.':
    'No active lock — nobody is holding a record right now.',
  'Verrous éteints (': 'Dead locks (',
  'Ne bloquent personne — affichés pour information.':
    'They block nobody — shown for information.',
  'Aucun.': 'None.',

  /* ── LES COLONNES ───────────────────────────────────────────────────────── */
  'Section': 'Section',
  'Enregistrement': 'Record',
  'Détenu par': 'Held by',
  'Depuis': 'Since',
  'État': 'State',
  'Section Enregistrement Détenu par': 'Section Record Held by',
  'Depuis État': 'Since State',
  'sans libellé': 'no label',
  'vous': 'you',
  /* ⚠⚠ Deux raisons DIFFERENTES qu un verrou soit eteint. */
  'Périmé': 'Expired',
  'Session fermée': 'Session closed',
  'actif · ': 'active · ',

  /* ══ FORCER UN DEVERROUILLAGE ══════════════════════════════════════════════
   * ⚠⚠⚠ C est prendre une fiche a quelqu un. Voir l en-tete. */
  ' Déverrouiller': ' Unlock',
  '🔓 Déverrouiller': '🔓 Unlock',
  '✓ Confirmer': '✓ Confirm',
  'Cliquez encore pour forcer ce déverrouillage.':
    'Click again to force this unlock.',
  'Cliquez encore pour tout déverrouiller.':
    'Click again to unlock everything.',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Déverrouillage…': 'Unlocking…',
  'Verrou libéré.': 'Lock released.',
  'Libération de tous les verrous…': 'Releasing every lock…',
  'Verrous libérés.': 'Locks released.',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'fiches en cours de modification': 'records being edited',
  'fiche en cours de modification': 'record being edited',
  // La refonte, comme l'Inventaire (2026-09-25).
  'Actifs': 'Active',
  'Tenus par vous': 'Held by you',
  'dans cette session': 'in this session',
  'Éteints': 'Expired',
  'ne bloquent personne': 'block no one',
  'Enregistrement Détenu par': 'Record Held by',
};
