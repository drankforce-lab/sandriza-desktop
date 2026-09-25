'use strict';

/*
 * PERSONNEL CONNECTE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ DECONNECTER QUELQU UN COUPE SA SESSION SANS LUI DEMANDER : son travail non
 * enregistre est perdu, et ses fiches ouvertes se liberent. La note qui le dit
 * PREVIENT AVANT le geste — elle se traduit en entier, les deux clics compris.
 *
 * ⚠⚠ ET CETTE FENETRE NE PRETEND PAS SAVOIR QUI EST DEVANT L ECRAN. « À
 * l’écran » veut dire que le poste s est manifeste il y a moins de deux minutes ;
 * une fenetre reduite dans la zone de notification se manifeste MOINS SOUVENT,
 * donc la personne reste connectee et joignable meme si son dernier passage
 * recule. Perdre cette moitie ferait deconnecter quelqu un qui travaille.
 *
 * ⚠⚠ LE DIAGNOSTIC A DEUX VOIX : « La page a refusé » et « Le serveur refuse »
 * ne disent pas la meme chose, et c est volontaire — les confondre a deja coute
 * un cycle construction + publication + installation. Le motif, le jeton et le
 * role vus par la page sont ecrits en petit POUR LA CAPTURE D ECRAN : ils ne se
 * traduisent que dans leur etiquette.
 *
 * ⚠ Les NOMS, COURRIELS et ROLES des sessions viennent du serveur : ce sont des
 * donnees. Le MESSAGE qu on ecrit part sur l ecran d un collegue — il n a pas
 * d exemple ici, seulement une invite.
 *
 * ⚠ CETTE FENETRE ETAIT ECRITE EN FRANCAIS SANS ACCENTS (quatrieme du depot).
 * Corrige le 2026-09-13 avant de la traduire : « Deconnecter quelqu un »,
 * « A l ecran », « Personne n est connecte », « Role », « depasse »…
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Personnel connecté — Administration Sandriza':
    'Signed-in staff — Sandriza Administration',
  'Personnel connecté': 'Signed-in staff',
  'Lecture des sessions…': 'Reading the sessions…',
  'Actualiser': 'Refresh',

  /* ── LES MOTIFS DE REFUS — DEUX VOIX QU ON NE CONFOND PAS ───────────────── */
  'Aucune session ouverte dans l’application.': 'No session open in the application.',
  'La page a refusé : elle ne vous voit pas comme super-administrateur.':
    'The page refused: it does not see you as a super administrator.',
  '(Si vous l’êtes, l’administration de cette fenêtre est plus ancienne que le site.)':
    '(If you are one, this window’s administration is older than the site.)',
  'Le serveur refuse : cette action est réservée au super-administrateur.':
    'The server refuses: this action is for the super administrator only.',
  /* ⚠ L AUTRE CAUSE DU MEME 403 : le role a change DEPUIS la connexion. La
     phrase dit CE QUI A CHANGE et CE QU IL FAUT FAIRE — les deux, parce que
     « vous n avez pas le droit » enverrait chercher une erreur de clic. */
  'Votre rôle a changé depuis votre connexion : vous n’êtes plus super-administrateur.':
    'Your role has changed since you signed in: you are no longer a super administrator.',
  'Reconnectez-vous pour voir vos droits actuels.':
    'Sign in again to see your current permissions.',
  'Le serveur ne reconnaît plus cette session — reconnectez-vous.':
    'The server no longer recognises this session — sign in again.',
  'La base de données n’a pas répondu.': 'The database did not answer.',
  'Demande incomplète.': 'Incomplete request.',
  /* ⚠ Ces trois-la sont ecrits en petit POUR LA CAPTURE D ECRAN : seule leur
     etiquette se lit, leur valeur est un jeton. */
  'motif : ': 'reason: ',
  'motif :': 'reason:',
  'jeton de session dans la page : ': 'session token in the page: ',
  'jeton de session dans la page :': 'session token in the page:',
  'rôle vu par la page : ': 'role seen by the page: ',
  'rôle vu par la page :': 'role seen by the page:',
  /* ⚠ Se deconnecter SOI-MEME passe par le menu, qui previent de ce qu il
     emporte : c est pourquoi cet ecran ne le propose pas. */
  'Pour vous déconnecter vous-même, utilisez Fichier → Déconnexion : elle prévient de ce qu’elle emporte.':
    'To sign yourself out, use File → Sign out: it warns you about what it takes with it.',

  /* ══ LA NOTE QUI PREVIENT AVANT LE GESTE ═══════════════════════════════════ */
  '<strong>Déconnecter quelqu’un coupe sa session sans lui demander</strong> : ':
    '<strong>Signing someone out cuts their session without asking</strong>: ',
  'Déconnecter quelqu’un coupe sa session sans lui demander :':
    'Signing someone out cuts their session without asking:',
  'son travail non enregistré est perdu, et ses fiches ouvertes se libèrent. ':
    'their unsaved work is lost, and the records they had open are released. ',
  'son travail non enregistré est perdu, et ses fiches ouvertes se libèrent.':
    'their unsaved work is lost, and the records they had open are released.',
  'Deux clics sont demandés.': 'Two clicks are asked for.',
  /* ⚠⚠ CE QUE L ECRAN NE SAIT PAS : une fenetre reduite se manifeste moins
     souvent, et la personne est pourtant la. */
  '<strong>« À l’écran »</strong> veut dire que le poste s’est manifesté il y a ':
    '<strong>« On screen »</strong> means the workstation checked in ',
  '« À l’écran » veut dire que le poste s’est manifesté il y a':
    '« On screen » means the workstation checked in',
  'moins de ': 'less than ',
  's. Une fenêtre réduite dans la zone de notification ':
    's ago. A window minimised to the notification area ',
  's. Une fenêtre réduite dans la zone de notification':
    's ago. A window minimised to the notification area',
  /* ⚠⚠ LES UNITES N ONT PAS DE CLE, ET C EST DELIBERE : « s », « min », « h »
     s ecrivent pareil dans les deux langues, et une cle de deux caracteres se
     poserait PARTOUT dans le fichier. Seul le « il y a » de tete se traduit —
     l anglais met son « ago » a la fin, mais sous une colonne nommee
     « Last check-in », « about 6 min » se lit sans lui. */
  'il y a ': 'about ',
  'se manifeste moins souvent : la personne reste connectée et joignable, ':
    'checks in less often: the person is still signed in and reachable, ',
  'se manifeste moins souvent : la personne reste connectée et joignable,':
    'checks in less often: the person is still signed in and reachable,',
  'seul son dernier passage recule.': 'only their last check-in slips back.',

  /* ── LA LISTE DES SESSIONS ──────────────────────────────────────────────── */
  'Sessions ouvertes (': 'Open sessions (',
  ' sessions ouvertes': ' open sessions',
  ' session ouverte': ' open session',
  'personne n’est connecté': 'nobody is signed in',
  'Personne n’est connecté en ce moment.': 'Nobody is signed in right now.',
  'Personne': 'Person',
  'Rôle': 'Role',
  'Dernier passage': 'Last check-in',
  'Connecté depuis': 'Signed in since',
  'Personne Rôle Dernier passage': 'Person Role Last check-in',
  'à l’écran': 'on screen',
  'à l’instant': 'just now',
  'pas encore vu': 'not seen yet',
  'vous': 'you',
  'Message…': 'Message…',
  'Déconnecter': 'Sign out',
  'Confirmer la déconnexion': 'Confirm the sign-out',
  'Cliquez encore pour déconnecter cette personne.':
    'Click again to sign this person out.',

  /* ── ECRIRE A QUELQU UN ─────────────────────────────────────────────────── */
  'Message à ': 'Message to ',
  'Message à': 'Message to',
  'cette personne': 'this person',
  ' — il s’affichera sur son écran dans quelques secondes.':
    ' — it will show on their screen within seconds.',
  '— il s’affichera sur son écran dans quelques secondes.':
    '— it will show on their screen within seconds.',
  'Ce que vous voulez lui dire.': 'What you want to tell them.',
  'Envoyer': 'Send',
  'Annuler': 'Cancel',
  'Le message est vide.': 'The message is empty.',
  'Le message dépasse ': 'The message is longer than ',
  'Le message dépasse': 'The message is longer than',
  ' caractères.': ' characters.',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Message déposé pour ': 'Message left for ',
  'Message déposé pour': 'Message left for',
  'La personne': 'The person',
  ' est déconnectée.': ' is signed out.',
  'est déconnectée.': 'is signed out.',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'moins de': 'less than',
  // La refonte, comme l'Inventaire (2026-09-25).
  'Sessions ouvertes': 'Open sessions',
  'personnes connectées': 'people signed in',
  'À l’écran': 'On screen',
  'se sont manifestées à l’instant': 'seen just now',
  'En retrait': 'In the background',
  'connectées, fenêtre réduite': 'signed in, window minimized',
};
