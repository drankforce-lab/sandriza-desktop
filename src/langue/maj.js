'use strict';

/*
 * MISE A JOUR — les deux langues
 * =============================================================================
 * ⚠⚠⚠ C EST L ECRAN QUI INTERROMPT LE TRAVAIL DE QUELQU UN. Chaque phrase y est
 * une promesse : « Votre travail en cours n’est pas touché tant que vous n’avez
 * pas décidé », « un compte à rebours de 30 secondes s’affichera avant le
 * redémarrage — le temps d’enregistrer ce qui est ouvert ». Une traduction qui
 * les affaiblit fait perdre du travail a quelqu un, et c est le seul ecran de
 * l application ou cela peut arriver.
 *
 * ⚠⚠ « PLUS TARD… » NE FERME PAS LA FENETRE : il ouvre le choix des heures, dans
 * le meme ecran. C etait le defaut du premier mecanisme — un « Plus tard » qui
 * ne menait a rien, aucune suite, aucune echeance. Les trois points de suspension
 * disent qu il y a une suite : ils restent.
 *
 * ⚠⚠ PENDANT LE DECOMPTE, IL N Y A PAS DE BOUTON POUR ANNULER, ET C EST VOULU :
 * le redemarrage est FORCE, le processus principal lance l installation a
 * l echeance. « Redémarrer maintenant » existe parce qu il fait vraiment quelque
 * chose — il n attend pas les trente secondes. N inventer aucun mot qui
 * laisserait croire qu on peut encore reculer.
 *
 * ⚠ Le NUMERO DE VERSION vient de la coquille : il ne se traduit pas.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Mise à jour': 'Update',
  'Mise à jour disponible': 'Update available',
  /* ⚠ Le canal manque (coquille plus ancienne que cette fenetre) : on le DIT
     au lieu de laisser un bouton inerte. */
  'Ce poste ne sait pas planifier une mise à jour.':
    'This workstation cannot schedule an update.',

  /* ══ LA PROPOSITION ════════════════════════════════════════════════════════ */
  'Cette version est téléchargée et prête.': 'This version is downloaded and ready.',
  'L’installation redémarre l’application.': 'Installing restarts the application.',
  /* ⚠⚠⚠ LA PROMESSE : rien ne bouge tant qu on n a pas decide. */
  'Vous pouvez l’installer tout de suite, ou choisir un moment plus tard dans la journée. Votre travail en cours n’est pas touché tant que vous n’avez pas décidé.':
    'You can install it right away, or pick a later moment in the day. Your work in progress is not touched until you have decided.',

  /* ══ LE CHOIX DE L HEURE ═══════════════════════════════════════════════════
   * ⚠⚠ « Plus tard… » ouvre ce bloc ; il ne ferme pas la fenetre. */
  'Plus tard…': 'Later…',
  'Installer maintenant': 'Install now',
  'Choisissez dans combien de temps.': 'Choose how long from now.',
  'Installer dans': 'Install in',
  '2 heures': '2 hours',
  '4 heures': '4 hours',
  '8 heures': '8 hours',
  ' heures': ' hours',
  /* ⚠⚠⚠ LA SECONDE PROMESSE : trente secondes avant le redemarrage. */
  'À l’heure choisie, un compte à rebours de 30 secondes s’affichera avant le redémarrage — le temps d’enregistrer ce qui est ouvert.':
    'At the chosen time, a 30-second countdown will appear before the restart — time enough to save what is open.',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Planification…': 'Scheduling…',
  'Installation…': 'Installing…',
  'Préparation de l’installation…': 'Preparing the installation…',
  'L’application redémarre…': 'The application is restarting…',
  'Planifié. La fenêtre se ferme.': 'Scheduled. The window is closing.',
  'Refusé (': 'Refused (',

  /* ══ LE DECOMPTE ═══════════════════════════════════════════════════════════
   * ⚠⚠ Aucun mot ne doit laisser croire qu on peut encore reculer. */
  'Redémarrage dans ': 'Restarting in ',
  'Redémarrage dans': 'Restarting in',
  ' seconde': ' second',
  ' secondes': ' seconds',
  'La version ': 'Version ',
  'La version': 'Version',
  ' s’installe.': ' is installing.',
  'Enregistrez ce qui est ouvert. L’application va redémarrer d’elle-même.':
    'Save what is open. The application will restart by itself.',
  /* ⚠ Celui-la fait vraiment quelque chose : il n attend pas les 30 secondes. */
  'Redémarrer maintenant': 'Restart now',
  'Redémarrage…': 'Restarting…'
};
