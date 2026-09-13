'use strict';

/*
 * REGLAGES DE SECURITE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ TROIS REGLAGES DE CET ECRAN PEUVENT FERMER LA PORTE A TOUT LE MONDE, et
 * leurs phrases doivent rester aussi nettes en anglais qu en francais :
 *   · LA RESTRICTION GEOGRAPHIQUE n autorise la connexion QUE depuis les pays
 *     listes. La phrase dit deux choses qu il ne faut pas perdre : la
 *     geolocalisation se fait sur l IP publique, et LA BOUTIQUE CLIENTE N EST
 *     JAMAIS TOUCHEE. Sans la seconde, on croit couper la boutique.
 *   · LES COMPTES DORMANTS se DESACTIVENT tout seuls au bout du seuil, avec un
 *     avertissement 14 jours (personnel) ou 30 jours (clientes) avant.
 *   · LA LIMITE DE FREQUENCE VERROUILLE le changement de mot de passe.
 *
 * ⚠⚠ LES CODES DE PAYS SONT DES DONNEES. « CA », « US » partent dans la
 * configuration et sont compares a la geolocalisation ; seuls leur etiquette et
 * leur exemple se traduisent. Meme chose pour les adresses IP.
 *
 * ⚠ « Ne s applique pas au super-administrateur » : ce n est pas un detail, c est
 * ce qui explique qu un compte echappe a la politique.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Réglages de sécurité — Administration Sandriza':
    'Security settings — Sandriza Administration',
  'Réglages de sécurité': 'Security settings',
  'Lecture seule : vous pouvez consulter ces réglages, pas les modifier.':
    'Read only: you can view these settings, not change them.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux réglages de sécurité.':
    'Your role does not give access to the security settings.',
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  /* ⚠ L apostrophe DROITE : la source ecrit cette phrase entre guillemets
     doubles. Une cle avec l apostrophe courbe ne la trouverait pas. */
  "La fenêtre principale n'a pas répondu à temps.": 'The main window did not answer in time.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',

  /* ══ LA POLITIQUE DES MOTS DE PASSE ════════════════════════════════════════ */
  'Politique des mots de passe': 'Password policy',
  '🔑 Politique des mots de passe': '🔑 Password policy',
  'Enregistrer la politique': 'Save the policy',
  'Ne s’applique pas au super-administrateur.':
    'Does not apply to the super administrator.',
  'Expiration': 'Expiry',
  'Activer l’expiration': 'Turn on expiry',
  'Expiration après (jours)': 'Expires after (days)',
  'Ex. : 60 = tous les 2 mois.': 'E.g.: 60 = every 2 months.',
  'Complexité': 'Complexity',
  'Longueur minimale': 'Minimum length',
  'Exiger une majuscule': 'Require an upper-case letter',
  'Exiger un chiffre': 'Require a digit',
  'Exiger un caractère spécial': 'Require a special character',
  'Historique (mdp interdits)': 'History (passwords not allowed)',
  '0 = aucun historique.': '0 = no history.',
  /* ⚠ La source ecrit l esperluette en entite (&amp;) ; la page rendue, elle,
     n en garde rien pour le compteur. Les deux formes sont la. */
  'Fréquence &amp; verrouillage': 'Rate &amp; lockout',
  'Fréquence verrouillage': 'Rate lockout',
  'Activer la limite de fréquence': 'Turn on the rate limit',
  'Max. de changements…': 'Max. changes…',
  '… dans cette fenêtre (heures)': '… within this window (hours)',
  'Durée du verrouillage (heures)': 'Lockout duration (hours)',
  'Notifier (courriel, optionnel)': 'Notify (email, optional)',
  /* Une adresse d exemple, pas une donnee : elle suit la langue du poste. */
  'responsable@exemple.com': 'manager@example.com',

  /* ══ INACTIVITE ET VERROUILLAGE DE SESSION ═════════════════════════════════ */
  '⏳ Inactivité &amp; verrouillage de session': '⏳ Inactivity &amp; session lock',
  '⏳ Inactivité verrouillage de session': '⏳ Inactivity session lock',
  /* ⚠⚠ UN COMPTE DORMANT SE DESACTIVE TOUT SEUL : l avertissement et son delai
     sont la seule chose qui empeche de le decouvrir apres coup. */
  'Portail administration — comptes dormants':
    'Administration portal — dormant accounts',
  'Désactiver les comptes inactifs (sauf superadmin)':
    'Disable inactive accounts (except superadmin)',
  'Seuil (jours)': 'Threshold (days)',
  'Avertissement 14 jours avant.': 'Warning 14 days before.',
  '▶ Vérifier maintenant': '▶ Check now',
  'Portail client — comptes dormants': 'Customer portal — dormant accounts',
  'Désactiver les comptes clients inactifs': 'Disable inactive customer accounts',
  'Avertissement 30 jours avant.': 'Warning 30 days before.',
  'Verrouillage de session à l’écran': 'On-screen session lock',
  'Avertir après (minutes)': 'Warn after (minutes)',
  'Défaut : 15.': 'Default: 15.',
  'Décompte avant fermeture (secondes)': 'Countdown before closing (seconds)',
  'Défaut : 60.': 'Default: 60.',
  'Plafond absolu (minutes)': 'Absolute cap (minutes)',
  'Même si un éditeur est ouvert. Défaut : 60.':
    'Even if an editor is open. Default: 60.',

  /* ══ LA RESTRICTION GEOGRAPHIQUE ═══════════════════════════════════════════ */
  'Restriction géographique — administration': 'Geographic restriction — administration',
  '🌍 Restriction géographique — administration': '🌍 Geographic restriction — administration',
  'Enregistrer la restriction': 'Save the restriction',
  /* ⚠⚠⚠ LES DEUX CHOSES A NE PAS PERDRE : la geolocalisation porte sur l IP
     PUBLIQUE, et LA BOUTIQUE CLIENTE N EST JAMAIS TOUCHEE. */
  'N’autorise la connexion au portail d’administration que depuis les pays listés (géolocalisation de l’IP publique). La boutique cliente n’est jamais touchée.':
    'Only allows signing in to the administration portal from the listed countries (geolocation of the public IP). The customer storefront is never affected.',
  'Activer la restriction géographique': 'Turn on the geographic restriction',
  /* ⚠⚠ LES CODES DE PAYS NE SE TRADUISENT PAS : « CA » part dans la
     configuration. Seuls l etiquette et l exemple se lisent. */
  'Pays autorisés (codes ISO, séparés par des virgules)':
    'Allowed countries (ISO codes, comma separated)',
  'Ex. : CA ou CA, US.': 'E.g.: CA or CA, US.',
  'Adresses IP exclues (une par ligne)': 'Excluded IP addresses (one per line)',
  'Ces IP restent autorisées peu importe le pays.':
    'These IPs stay allowed whatever the country.',
  'Détecter ma localisation actuelle': 'Detect my current location',
  '🔍 Détecter ma localisation actuelle': '🔍 Detect my current location',
  'Comptes exclus de cette restriction': 'Accounts excluded from this restriction',
  'Ces comptes peuvent se connecter depuis n’importe quel pays.':
    'These accounts can sign in from any country.',
  'Aucun compte.': 'No account.',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Vérification du personnel…': 'Checking the staff…',
  'Vérification des clients…': 'Checking the customers…',
  'Politique enregistrée.': 'Policy saved.',
  'Paramètres enregistrés.': 'Settings saved.',
  'Restriction enregistrée.': 'Restriction saved.',
  'Vérification effectuée.': 'Check done.',
  'Localisation…': 'Locating…',
  'Votre IP : ': 'Your IP: ',
  'Votre IP :': 'Your IP:',
  'emplacement inconnu': 'location unknown'
};
