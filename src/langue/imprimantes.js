'use strict';

/*
 * IMPRIMANTES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CETTE FENETRE DIT CE QU ELLE NE SAIT PAS, et c est sa raison d etre. Un
 * ecran d imprimantes qui affiche « prêt » faute de reponse est pire qu un ecran
 * vide : on lance une impression en croyant que c est verifie. Les phrases qui
 * avouent — « le pont ne répond pas », « la liste est en cours de lecture », « la
 * liste est trop longue à lire » — se traduisent en entier, la marche a suivre
 * comprise (« Actualiser » pour réessayer).
 *
 * ⚠⚠ LE JOURNAL DE BORD N EST PAS DE LA DECORATION. « page chargée », « pont :
 * présent, appeler présent », « réponse reçue : … » : c est ce qui a permis de
 * trouver la panne qui a coute quatre versions. Il se lit, donc il se traduit —
 * mais ce qu il RAPPORTE (le message d une erreur du systeme, le type d une
 * valeur) reste tel quel.
 *
 * ⚠⚠ LES NOMS D IMPRIMANTES VIENNENT DU SYSTEME et ne se traduisent jamais :
 * « Microsoft Print to PDF » s appelle ainsi meme sur un poste francais. On ne
 * traduit que ce qu on ajoute autour — « (par défaut) », « (hors ligne) », et le
 * groupe « Sorties virtuelles ».
 *
 * ⚠ LES CLES DE SERVICE (`s.cle`) et les titres de service viennent du coeur.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Imprimantes — Administration Sandriza': 'Printers — Sandriza Administration',
  'Imprimantes': 'Printers',
  'Lecture de l’état…': 'Reading the state…',
  'Actualiser': 'Refresh',

  /* ── LE JOURNAL DE BORD ─────────────────────────────────────────────────── */
  'Ce que la fenêtre a pu faire, étape par étape :':
    'What the window managed to do, step by step:',
  'Une erreur a interrompu la fenêtre': 'An error stopped the window',
  'Une opération a échoué': 'An operation failed',
  'page chargée': 'page loaded',
  'pont : ': 'bridge: ',
  'pont :': 'bridge:',
  'présent': 'present',
  'ABSENT': 'ABSENT',
  ', appeler présent': ', appeler present',
  ', appeler ABSENT': ', appeler ABSENT',
  'ERREUR : ': 'ERROR: ',
  ' (ligne ': ' (line ',
  'PROMESSE REJETEE : ': 'PROMISE REJECTED: ',
  'relire ignoré : une lecture est déjà en cours':
    'reread ignored: a read is already under way',
  'appel de imprimantes:etat…': 'calling imprimantes:etat…',
  'APPEL IMPOSSIBLE : ': 'CALL IMPOSSIBLE: ',
  'Le pont a refusé l’appel': 'The bridge refused the call',
  'le pont n’a pas rendu de promesse (type ': 'the bridge returned no promise (type ',
  'le pont n’a pas rendu de promesse (type': 'the bridge returned no promise (type',
  'Réponse inattendue du pont': 'Unexpected answer from the bridge',
  'réponse reçue : ': 'answer received: ',
  'réponse reçue :': 'answer received:',
  'vide': 'empty',
  'ECHEC : ': 'FAILED: ',
  'L’appel au pont, ou le dessin, a échoué': 'The bridge call, or the drawing, failed',
  'rien n’est arrivé après 3 s — le pont ne répond pas':
    'nothing arrived after 3 s — the bridge does not answer',
  'La fenêtre n’a pas reçu de réponse': 'The window received no answer',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès à la configuration des imprimantes.':
    'Your role does not give access to the printer configuration.',
  'L’agent d’impression n’est pas joignable sur ce poste.':
    'The print agent cannot be reached on this workstation.',
  /* ⚠ La marche a suivre fait partie du message. */
  'La fenêtre principale n’a pas répondu à temps. « Actualiser » pour réessayer ; si cela persiste, rechargez la fenêtre principale (Ctrl+R).':
    'The main window did not answer in time. « Refresh » to try again; if it keeps happening, reload the main window (Ctrl+R).',
  'État indisponible': 'State unavailable',

  /* ── L AGENT D IMPRESSION ───────────────────────────────────────────────── */
  'Agent d’impression de ce poste': 'Print agent of this workstation',
  'État': 'State',
  'détecté': 'detected',
  'absent': 'absent',
  'Ordinateur': 'Computer',
  'Version installée': 'Installed version',
  'à jour': 'up to date',
  ' disponible': ' available',
  'Aide PDF': 'PDF helper',
  'présente': 'present',
  'absente': 'missing',
  /* ⚠ POURQUOI ELLE EST REQUISE : les etiquettes du transporteur arrivent en PDF. */
  '— requise pour les étiquettes d’expédition, qui arrivent en PDF du transporteur.':
    '— required for the shipping labels, which come as PDF from the carrier.',
  'absente — requise pour les étiquettes d’expédition, qui arrivent en PDF du transporteur.':
    'missing — required for the shipping labels, which come as PDF from the carrier.',
  'impression par l’application': 'printing by the application',
  'agent détecté': 'agent detected',
  'agent absent': 'agent absent',

  /* ══ L ASSOCIATION PAR SERVICE ═════════════════════════════════════════════
   * ⚠ La configuration est PAR POSTE : sans cette mention, une imprimante
   * differente d un poste a l autre passe pour une configuration perdue. */
  'Association par service — ce poste': 'Printer per service — this workstation',
  'Aucun service à associer.': 'No service to attach.',
  'Liste non chargée…': 'List not loaded…',
  '— aucune —': '— none —',
  ' (par défaut)': ' (default)',
  '(par défaut)': '(default)',
  /* ⚠ Une imprimante associee mais eteinte reste visible, et le dit. */
  ' (hors ligne)': ' (offline)',
  /* ⚠⚠ LES SORTIES VIRTUELLES A PART : proposees au meme rang qu une vraie
     machine, on choisit « Print to PDF » pour des etiquettes. */
  'Sorties virtuelles (n’impriment sur rien)': 'Virtual outputs (they print on nothing)',
  'format non défini': 'format not set',
  'format ': 'format ',
  ' po': ' in',
  'aucune imprimante choisie': 'no printer chosen',
  'Imprimante pour ': 'Printer for ',
  'Imprimante pour': 'Printer for',
  'Test d’impression': 'Test print',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Liste des imprimantes : lecture en cours…': 'Printer list: reading…',
  'Liste des imprimantes trop longue à lire — « Actualiser » pour réessayer.':
    'Printer list too long to read — « Refresh » to try again.',
  'Liste des imprimantes indisponible : ': 'Printer list unavailable: ',
  'Liste des imprimantes indisponible :': 'Printer list unavailable:',
  'Envoi du test…': 'Sending the test…',
  'Test envoyé à l’imprimante.': 'Test sent to the printer.',
  'Association…': 'Attaching…',
  'Retrait de l’association…': 'Detaching…',
  'Imprimante associée.': 'Printer attached.',
  'Association retirée.': 'Printer detached.'
};
