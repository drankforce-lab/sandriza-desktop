'use strict';

/*
 * ACCES UTILISATEURS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LES QUESTIONS DE SECURITE NE SE TRADUISENT PAS, ET CE N EST PAS UN OUBLI.
 * La liste vient du coeur (`F.questions`) ; ce qui est CHOISI est ECRIT dans le
 * compte (`securityQ1`) et RELU tel quel le jour ou la personne a perdu son mot
 * de passe. Une question traduite ici ne correspondrait plus a celle qui est
 * enregistree : le compte deviendrait irrecuperable, et rien ne le dirait avant
 * ce jour-la. Seul « — Choisir — », qui ne vaut rien (`value=""`), est traduit.
 *
 * ⚠⚠ LES ROLES ET LA MATRICE DES DROITS VIENNENT AUSSI DU COEUR : `roles[].key`
 * part dans la base, `roles[].label`, `actionLabels` et `permModel[].label` sont
 * des libelles que le coeur fournit. Ils ne passent donc pas par ce fichier —
 * le jour ou on voudra les traduire, ce sera AU COEUR, pas ici, et surtout pas
 * en touchant aux cles.
 *
 * ⚠⚠ LES TROIS PHRASES QUI DISENT CE QU ON RISQUE se traduisent en entier, avec
 * leur consequence :
 *   · « Décoché, la personne ne peut plus se connecter — sans que le compte ni
 *     son historique soient supprimés. » (desactiver n est pas supprimer)
 *   · « À réserver aux cas où le second facteur est impossible : c’est un
 *     rempart en moins. » (l exemption se paie)
 *   · « Connexion autorisée sans code — un rempart en moins. »
 *
 * ⚠ LE MOT DE PASSE TEMPORAIRE PARAIT A L ECRAN quand le courriel n est pas
 * parti. La phrase doit rester aussi claire en anglais : c est la seule copie.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Accès Utilisateurs — Administration Sandriza': 'User access — Sandriza Administration',
  'Accès Utilisateurs': 'User access',
  'Lecture seule : vous pouvez consulter les comptes, pas les modifier.':
    'Read only: you can view the accounts, not change them.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux comptes du personnel.':
    'Your role does not give access to the staff accounts.',
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  'Formulaire invalide.': 'Invalid form.',
  'Compte introuvable.': 'Account not found.',
  'Action refusée par le serveur.': 'Action refused by the server.',
  /* ⚠ L APOSTROPHE DROITE : la source ecrit cette phrase-la entre guillemets
     doubles, avec un « n'a » droit. Une cle avec l apostrophe courbe ne la
     trouverait pas. */
  "La fenêtre principale n'a pas répondu à temps.": 'The main window did not answer in time.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',

  /* ── LA LISTE DES COMPTES ───────────────────────────────────────────────── */
  'Rechercher un nom, un courriel, un rôle': 'Search a name, an email, a role',
  'Rechercher un nom, un courriel, un rôle…': 'Search a name, an email, a role…',
  '＋ Créer un accès': '＋ Create an access',
  'Comptes': 'Accounts',
  'Actifs': 'Active',
  'MFA activé': 'MFA on',
  'Aucun compte du personnel.': 'No staff account.',
  'Aucun compte ne correspond à « ': 'No account matches « ',
  'Aucun compte ne correspond à «': 'No account matches «',
  'Jamais connecté': 'Never signed in',
  /* Le singulier et le pluriel, chacun entier. */
  ' connexion': ' sign-in',
  ' connexions': ' sign-ins',
  'Actif': 'Active',
  'Désactivé': 'Disabled',
  'MFA à configurer': 'MFA to set up',
  'MFA exempté': 'MFA exempt',
  '✏ Modifier': '✏ Edit',
  'Gérer l’authentification à deux facteurs': 'Manage two-factor authentication',
  /* ⚠ Le pictogramme vit dans son propre <span> : la SOURCE n ecrit que le mot.
     Sans cette cle-la, le bouton restait « 📧 Renvoyer » sur la page anglaise. */
  'Renvoyer': 'Resend',
  '📧 Renvoyer': '📧 Resend',
  'Renvoyer un mot de passe temporaire par courriel':
    'Resend a temporary password by email',
  '✓ Confirmer': '✓ Confirm',
  'Cliquez encore pour supprimer ce compte.': 'Click again to delete this account.',

  /* ── L EDITEUR — SES QUATRE ONGLETS ─────────────────────────────────────── */
  'Identité': 'Identity',
  'Accès': 'Access',
  'Questions': 'Questions',
  '⚙ Permissions': '⚙ Permissions',
  'Compte': 'Account',
  'Fermer': 'Close',
  'Créer le compte': 'Create the account',
  'Module': 'Module',

  /* ── ONGLET « IDENTITE » ────────────────────────────────────────────────── */
  /* ⚠ Le <b> coupe la phrase : la cle porte la balise, comme dans campagnes.js. */
  'Qui est cette personne. Le <b>nom d’utilisateur</b> lui sert à se connecter ; le courriel reçoit l’invitation et les avis de sécurité.':
    'Who this person is. The <b>username</b> is what they sign in with; the email receives the invitation and the security notices.',
  'Prénom': 'First name',
  'Nom': 'Last name',
  'Nom d’utilisateur': 'Username',
  /* Un nom d utilisateur ne sort pas de l administration : l exemple suit la
     langue du poste. */
  'ex : marie_b': 'e.g. marie_b',
  'Minuscules, chiffres, tiret et soulignement.':
    'Lower case, digits, hyphen and underscore.',
  'Courriel': 'Email',
  ' (non modifiable)': ' (cannot be changed)',

  /* ── ONGLET « ACCES » ───────────────────────────────────────────────────── */
  'Ce que cette personne peut faire, et comment elle prouve son identité.':
    'What this person can do, and how they prove their identity.',
  'Rôle': 'Role',
  'Le rôle coche les permissions par défaut. L’onglet <b>Permissions</b> permet de s’en écarter.':
    'The role ticks the default permissions. The <b>Permissions</b> tab lets you depart from them.',
  'Mot de passe': 'Password',
  'Nouveau mot de passe': 'New password',
  'laisser vide = généré et envoyé par courriel': 'leave empty = generated and emailed',
  'laisser vide = inchangé': 'leave empty = unchanged',
  'Vide : un mot de passe temporaire est créé et envoyé.':
    'Empty: a temporary password is created and sent.',
  'Vide : le mot de passe actuel est conservé.':
    'Empty: the current password is kept.',
  /* ⚠⚠ DESACTIVER N EST PAS SUPPRIMER — la phrase entiere, sinon on croit
     effacer quelqu un en decochant une case. */
  'Compte actif': 'Account active',
  'Décoché, la personne ne peut plus se connecter — sans que le compte ni son historique soient supprimés.':
    'Unticked, the person can no longer sign in — without the account or its history being deleted.',
  /* ⚠ Le <sup> coupe « 1re » en deux : la cle porte la balise. */
  'Exiger la configuration MFA à la 1<sup>re</sup> connexion':
    'Require MFA setup at the 1<sup>st</sup> sign-in',
  'Elle devra lier une application d’authentification avant d’accéder à l’administration.':
    'They will have to link an authenticator app before reaching the administration.',
  'Exempté de MFA': 'Exempt from MFA',
  'À réserver aux cas où le second facteur est impossible : c’est un rempart en moins.':
    'Only for the cases where the second factor is impossible: it is one safeguard less.',

  /* ── ONGLET « QUESTIONS » ───────────────────────────────────────────────── */
  /* ⚠⚠ Voir l en-tete : les questions elles-memes ne passent pas par ici. */
  '— Choisir —': '— Choose —',
  'Question 1': 'Question 1',
  'Question 2': 'Question 2',
  'Réponse 1': 'Answer 1',
  'Réponse 2': 'Answer 2',
  'Réponse': 'Answer',
  'Inchangée': 'Unchanged',

  /* ── LES VERDICTS DE L EDITEUR ──────────────────────────────────────────── */
  'Permissions replacées sur celles du rôle.': 'Permissions set back to the role’s.',
  'Le courriel est obligatoire.': 'The email is required.',
  'Compte créé.': 'Account created.',
  ' Courriel d’accueil envoyé à ': ' Welcome email sent to ',
  'Courriel d’accueil envoyé à': 'Welcome email sent to',
  /* ⚠⚠ C EST LA SEULE COPIE DU MOT DE PASSE TEMPORAIRE quand le courriel n est
     pas parti : la phrase doit rester aussi nette en anglais. */
  ' Mot de passe temporaire : ': ' Temporary password: ',
  'Mot de passe temporaire :': 'Temporary password:',
  ' (courriel non envoyé).': ' (email not sent).',
  '(courriel non envoyé).': '(email not sent).',
  'Compte modifié.': 'Account changed.',
  'Compte supprimé.': 'Account deleted.',
  'Envoi de l’invitation…': 'Sending the invitation…',
  'Invitation renvoyée à ': 'Invitation resent to ',
  'Invitation renvoyée à': 'Invitation resent to',

  /* ══ LE SECOND FACTEUR ═════════════════════════════════════════════════════ */
  'Lecture MFA…': 'Reading MFA…',
  'Préparation de la liaison…': 'Preparing the link…',
  'Désactivation…': 'Turning off…',
  'Authentification à deux facteurs activée pour ce compte.':
    'Two-factor authentication is on for this account.',
  '✅ Authentification à deux facteurs activée pour ce compte.':
    '✅ Two-factor authentication is on for this account.',
  'Exempter ce compte': 'Exempt this account',
  'Connexion autorisée sans code — un rempart en moins.':
    'Sign-in allowed without a code — one safeguard less.',
  'Désactiver MFA': 'Turn MFA off',
  'Activer MFA — ': 'Turn on MFA — ',
  'Activer MFA —': 'Turn on MFA —',
  '🔐 Activer MFA —': '🔐 Turn on MFA —',
  '<b>Étape 1</b> — Scannez le QR avec Google Authenticator, Authy ou une application TOTP compatible, ou entrez la clé manuellement.':
    '<b>Step 1</b> — Scan the QR with Google Authenticator, Authy or any compatible TOTP app, or enter the key by hand.',
  'Clé secrète (saisie manuelle)': 'Secret key (entered by hand)',
  'Base32 · SHA-1 · 6 chiffres · 30 s': 'Base32 · SHA-1 · 6 digits · 30 s',
  'Étape 2 — Code à 6 chiffres': 'Step 2 — 6-digit code',
  'Activer sans l’exiger à la connexion.': 'Turn it on without requiring it at sign-in.',
  '✓ Activer MFA': '✓ Turn MFA on',
  'Compte exempté de MFA.': 'Account exempt from MFA.',
  'Exemption retirée.': 'Exemption removed.',
  'MFA désactivé.': 'MFA turned off.',
  'Vérification du code…': 'Checking the code…',
  'MFA activé.': 'MFA turned on.',

  /* ══ LES FORMES RENDUES ════════════════════════════════════════════════════
   * ⚠ Ce que le compteur lit n est pas ce que la source ecrit : les balises
   * (<b>, <sup>, <span class="quoi">) tombent, et les textes voisins se
   * recollent avec une espace — une etiquette de case et son explication n en
   * font plus qu une, trois boutons cote a cote n en font plus qu un. La
   * traduction est deja faite morceau par morceau ci-dessus ; ces cles-la ne
   * servent qu a ce que le compteur trouve la DECISION. */
  'Qui est cette personne. Le nom d’utilisateur lui sert à se connecter ; le courriel reçoit l’invitation et les avis de sécurité.':
    'Who this person is. The username is what they sign in with; the email receives the invitation and the security notices.',
  'Le rôle coche les permissions par défaut. L’onglet Permissions permet de s’en écarter.':
    'The role ticks the default permissions. The Permissions tab lets you depart from them.',
  'Compte actif Décoché, la personne ne peut plus se connecter — sans que le compte ni son historique soient supprimés.':
    'Account active Unticked, the person can no longer sign in — without the account or its history being deleted.',
  'Exiger la configuration MFA à la 1 re connexion Elle devra lier une application d’authentification avant d’accéder à l’administration.':
    'Require MFA setup at the 1 st sign-in They will have to link an authenticator app before reaching the administration.',
  'Exempté de MFA À réserver aux cas où le second facteur est impossible : c’est un rempart en moins.':
    'Exempt from MFA Only for the cases where the second factor is impossible: it is one safeguard less.',
  'Exempter ce compte Connexion autorisée sans code — un rempart en moins.':
    'Exempt this account Sign-in allowed without a code — one safeguard less.',
  'Annuler Désactiver MFA Enregistrer': 'Cancel Turn MFA off Save',
  'Étape 1 — Scannez le QR avec Google Authenticator, Authy ou une application TOTP compatible, ou entrez la clé manuellement.':
    'Step 1 — Scan the QR with Google Authenticator, Authy or any compatible TOTP app, or enter the key by hand.',
  'Exempter ce compte Activer sans l’exiger à la connexion.':
    'Exempt this account Turn it on without requiring it at sign-in.',
  'Annuler ✓ Activer MFA': 'Cancel ✓ Turn MFA on'
};
