'use strict';

/*
 * MODE USAGE EXCLUSIF — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE MODE FERME L APPLICATION A TOUT LE MONDE SAUF UNE PERSONNE. Trois
 * phrases sont la seule chose qui empeche de s enfermer dehors :
 *   · « Notez ce NIP ailleurs. Il se saisit depuis l’écran de connexion avec
 *     Ctrl + Maj + 0, et il lève la maintenance immédiatement. » — c est la
 *     porte de secours, et elle n existe nulle part ailleurs.
 *   · « Le mode se lève tout seul à l’heure de fin » — aucun geste a faire, les
 *     connexions rouvrent a la seconde dite, sur tous les postes.
 *   · « Vous resterez le seul à pouvoir entrer, même après vous être
 *     déconnecté. »
 * ⚠⚠ ET L AVERTISSEMENT QUAND C EST QUELQU UN D AUTRE QUI L A ACTIVE : « le
 * lever rouvre les connexions pendant qu’il travaille peut-être dessus ».
 *
 * ⚠⚠ LE RACCOURCI `Ctrl + Maj + 0` NE SE TRADUIT PAS AUTREMENT QUE PAR SES NOMS
 * DE TOUCHES : c est une combinaison qu on tape, pas une phrase. « Maj » devient
 * « Shift » parce que la touche porte ce nom sur un clavier anglais.
 *
 * ⚠ LE NIP, LES DATES ET LE MESSAGE DE BANNIERE sont des DONNEES : le message
 * est lu par tous les postes sur l ecran de connexion. Seul son exemple suit la
 * langue du poste.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Mode usage exclusif — Administration Sandriza':
    'Exclusive use mode — Sandriza Administration',
  'Mode usage exclusif': 'Exclusive use mode',
  'Lecture de l’état…': 'Reading the state…',
  'actif': 'on',
  'inactif': 'off',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Aucune session ouverte dans l’application.': 'No session open in the application.',
  'Le serveur refuse : cette action est réservée au super-administrateur.':
    'The server refuses: this action is for the super administrator only.',
  'Le serveur ne reconnaît plus cette session — reconnectez-vous.':
    'The server no longer recognises this session — sign in again.',
  'La base de données n’a pas répondu.': 'The database did not answer.',
  'Demande incomplète.': 'Incomplete request.',
  /* ⚠ Le code du motif est ecrit AUSSI, en petit : le libelle est pour lui, le
     code est pour qui recoit la capture. */
  'motif : ': 'reason: ',
  'motif :': 'reason:',

  /* ══ LE MODE EST ACTIF ═════════════════════════════════════════════════════ */
  'Le mode est ACTIF': 'The mode is ON',
  'Personne ne peut se connecter, sauf ': 'Nobody can sign in, except ',
  'Personne ne peut se connecter, sauf': 'Nobody can sign in, except',
  '<strong>vous</strong> (vous l’avez activé)': '<strong>you</strong> (you turned it on)',
  'vous (vous l’avez activé)': 'you (you turned it on)',
  'la personne qui l’a activé': 'the person who turned it on',
  '. Vous pouvez vous déconnecter et vous reconnecter sans problème.':
    '. You can sign out and sign back in without trouble.',
  /* ⚠⚠ QUAND C EST QUELQU UN D AUTRE : lever coupe son travail. */
  '<strong>Attention :</strong> ce mode a été activé par quelqu’un d’autre. ':
    '<strong>Careful:</strong> this mode was turned on by someone else. ',
  'Attention : ce mode a été activé par quelqu’un d’autre.':
    'Careful: this mode was turned on by someone else.',
  'Le lever rouvre les connexions pendant qu’il travaille peut-être dessus.':
    'Lifting it reopens the connections while they may still be working on it.',

  /* ── PROLONGER, SANS RELANCER ───────────────────────────────────────────── */
  'Prolonger jusqu’à': 'Extend until',
  '+ 1 h': '+ 1 h',
  '+ 2 h': '+ 2 h',
  '+ 4 h': '+ 4 h',
  'Prolonger': 'Extend',
  /* ⚠⚠ AUCUN GESTE A FAIRE — c est ce qui evite de veiller sur une horloge. */
  '<strong>Le mode se lève tout seul à l’heure de fin.</strong> ':
    '<strong>The mode lifts itself at the end time.</strong> ',
  'Le mode se lève tout seul à l’heure de fin.': 'The mode lifts itself at the end time.',
  'Aucun geste à faire — les connexions rouvrent à la seconde dite, sur tous les ':
    'Nothing to do — the connections reopen at the exact second, on every ',
  'Aucun geste à faire — les connexions rouvrent à la seconde dite, sur tous les':
    'Nothing to do — the connections reopen at the exact second, on every',
  'postes, sans que personne ait à fermer ou rouvrir l’application.':
    'workstation, with nobody having to close or reopen the application.',
  /* ⚠⚠⚠ LA PORTE DE SECOURS. Le <strong> coupe : la cle porte la balise. */
  'Depuis l’écran de connexion, <strong>Ctrl + Maj + 0</strong> demande le NIP ':
    'From the sign-in screen, <strong>Ctrl + Shift + 0</strong> asks for the PIN ',
  'Depuis l’écran de connexion, Ctrl + Maj + 0 demande le NIP':
    'From the sign-in screen, Ctrl + Shift + 0 asks for the PIN',
  'et lève la maintenance immédiatement.': 'and lifts the maintenance at once.',
  'Lever maintenant': 'Lift now',
  'Fermer': 'Close',

  /* ══ ACTIVER LE MODE ═══════════════════════════════════════════════════════ */
  'Activer le mode': 'Turn the mode on',
  'Personne d’autre ne pourra se connecter, et une bannière annoncera ':
    'Nobody else will be able to sign in, and a banner will announce ',
  'Personne d’autre ne pourra se connecter, et une bannière annoncera':
    'Nobody else will be able to sign in, and a banner will announce',
  'la période sur l’écran de connexion de tous les postes. ':
    'the period on the sign-in screen of every workstation. ',
  'la période sur l’écran de connexion de tous les postes.':
    'the period on the sign-in screen of every workstation.',
  '<strong>Vous resterez le seul à pouvoir entrer</strong>, même après vous être ':
    '<strong>You will stay the only one who can get in</strong>, even after you ',
  'Vous resterez le seul à pouvoir entrer , même après vous être':
    'You will stay the only one who can get in , even after you',
  'déconnecté.': 'sign out.',
  'Début de la période': 'Start of the period',
  'Fin de la période': 'End of the period',
  'Message ajouté à la bannière (facultatif)': 'Message added to the banner (optional)',
  /* L exemple suit la langue du poste ; le message, lui, est une donnee lue par
     tous les postes. */
  'Ex. : mise à jour du système de facturation.':
    'E.g.: billing system update.',
  'NIP de désactivation d’urgence ': 'Emergency shut-off PIN ',
  'NIP de désactivation d’urgence': 'Emergency shut-off PIN',
  ' chiffres)': ' digits)',
  /* ⚠⚠⚠ NOTER LE NIP AILLEURS : sans lui, personne ne rentre. */
  '<strong>Notez ce NIP ailleurs.</strong> Il se saisit depuis l’écran ':
    '<strong>Write this PIN down elsewhere.</strong> It is typed from the sign-in ',
  'Notez ce NIP ailleurs. Il se saisit depuis l’écran':
    'Write this PIN down elsewhere. It is typed from the sign-in',
  'de connexion avec <strong>Ctrl + Maj + 0</strong>, et il lève la maintenance ':
    'screen with <strong>Ctrl + Shift + 0</strong>, and it lifts the maintenance ',
  'de connexion avec Ctrl + Maj + 0 , et il lève la maintenance':
    'screen with Ctrl + Shift + 0 , and it lifts the maintenance',
  'immédiatement.': 'at once.',
  '<strong>Le mode se lève tout seul à l’heure de fin</strong> — vous pourrez le ':
    '<strong>The mode lifts itself at the end time</strong> — you can ',
  'Le mode se lève tout seul à l’heure de fin — vous pourrez le':
    'The mode lifts itself at the end time — you can',
  'prolonger en cours de route sans le relancer, et sans changer ce NIP.':
    'extend it along the way without restarting it, and without changing this PIN.',
  'Annuler': 'Cancel',

  /* ── LES REFUS DE SAISIE ET LES VERDICTS ────────────────────────────────── */
  'Indiquez le début de la période.': 'Give the start of the period.',
  'Indiquez la fin de la période.': 'Give the end of the period.',
  'Le NIP doit compter de ': 'The PIN must be ',
  'Le NIP doit compter de': 'The PIN must be',
  ' à ': ' to ',
  ' chiffres.': ' digits.',
  'Activation…': 'Turning on…',
  'Mode activé. Personne d’autre ne peut se connecter.':
    'Mode on. Nobody else can sign in.',
  'Indiquez la nouvelle heure de fin.': 'Give the new end time.',
  'Cette heure est déjà passée.': 'That time has already passed.',
  'Prolongation…': 'Extending…',
  /* ⚠ « Le NIP n’a pas changé » : c est ce qui rend la prolongation sans risque. */
  'Maintenance prolongée. Le NIP n’a pas changé.':
    'Maintenance extended. The PIN has not changed.',
  'Levée…': 'Lifting…',
  'Mode levé. Les connexions sont de nouveau possibles.':
    'Mode lifted. Signing in is possible again.'
};
