'use strict';

/*
 * TRANSPORTEURS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LA PHRASE LA PLUS IMPORTANTE DE CET ECRAN EST CELLE QUI EMPECHE D EFFACER
 * SES IDENTIFIANTS : quand ils n ont pas pu etre recharges depuis le nuage,
 * enregistrer les remplacerait par du vide. « N’enregistrez pas sans avoir
 * cliqué « Réessayer », sinon vous risqueriez d’effacer vos identifiants. »
 * Elle se traduit entiere, la marche a suivre comprise.
 * ⚠⚠ Et son corollaire, sur chaque champ secret : « Vide = conservé ». Un champ
 * vide veut dire « garde ce qui est enregistre », jamais « efface ».
 *
 * ⚠⚠ LES IDENTIFIANTS SONT DES DONNEES, et des donnees secretes. Les FORMATS
 * (`utilisateur:motdepasse`, `pk.xxxxxxxx`, `l7xxXXXXXXXX`, `Ex : 12345678`)
 * decrivent a quoi ressemble la valeur du fournisseur : on traduit le mot
 * francais qui les accompagne, jamais le format lui-meme. Les valeurs de test de
 * Postes Canada sont des VALEURS : elles restent telles quelles.
 *
 * ⚠⚠ LES NOMS DES TRANSPORTEURS ET DES SERVICES ne se traduisent pas — Purolator,
 * FedEx, UPS, Canpar, Postes Canada, Mapbox, AddressComplete —, ni les codes de
 * province (QC, ON…), ni les noms de champs de leurs interfaces (« Client ID »,
 * « Client Secret ») : ce sont les mots qu on lit CHEZ EUX.
 *
 * ⚠ L ADRESSE DE L EXPEDITEUR est de la donnee : seuls ses libelles se lisent, et
 * l exemple de ville reste « Montréal ».
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Transporteurs — Administration Sandriza': 'Carriers — Sandriza Administration',
  'Transporteurs': 'Carriers',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can view, not change.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  'Les identifiants n’ont pas pu être rechargés. Cliquez « Réessayer » avant d’enregistrer.':
    'The credentials could not be reloaded. Click « Try again » before saving.',
  'L’enregistrement dans le nuage a échoué. Réessayez.':
    'Saving to the cloud failed. Try again.',

  /* ══ LE FILET QUI EMPECHE D EFFACER SES IDENTIFIANTS ═══════════════════════ */
  'Identifiants non chargés': 'Credentials not loaded',
  '⚠ Identifiants non chargés — les identifiants API n’ont pas pu être':
    '⚠ Credentials not loaded — the API credentials could not be',
  ' — les identifiants API n’ont pas pu être ': ' — the API credentials could not be ',
  'rechargés depuis le nuage cette session': 'reloaded from the cloud this session',
  '. <strong>N’enregistrez pas</strong> sans avoir cliqué « Réessayer », sinon vous risqueriez ':
    '. <strong>Do not save</strong> without clicking « Try again » first, or you could ',
  '. N’enregistrez pas sans avoir cliqué « Réessayer », sinon vous risqueriez':
    '. Do not save without clicking « Try again » first, or you could',
  'd’effacer vos identifiants.': 'erase your credentials.',
  'd’effacer vos identifiants. ↻ Réessayer le chargement':
    'erase your credentials. ↻ Try loading again',
  '↻ Réessayer le chargement': '↻ Try loading again',
  'Rechargement des identifiants…': 'Reloading the credentials…',
  'Identifiants rechargés.': 'Credentials reloaded.',
  'Toujours pas chargés.': 'Still not loaded.',
  'Identifiants non chargés — rechargez puis réessayez.':
    'Credentials not loaded — reload then try again.',

  /* ══ UN CHAMP SECRET — VIDE VEUT DIRE « GARDE » ════════════════════════════ */
  /* ⚠ Le <b> coupe les deux phrases : les cles portent la balise. */
  'Enregistré (se termine par <b>': 'Saved (ends with <b>',
  'Enregistré (se termine par': 'Saved (ends with',
  '</b>). Vide = conservé.': '</b>). Empty = kept.',
  '). Vide = conservé.': '). Empty = kept.',
  'Aucun secret <b>enregistré</b>.': 'No secret <b>saved</b>.',
  'Aucun secret enregistré .': 'No secret saved .',
  'inchangé': 'unchanged',
  'Activer': 'Turn on',
  'Environnement': 'Environment',
  'Test (sandbox)': 'Test (sandbox)',
  'Bac à sable (test)': 'Sandbox (test)',
  'Production': 'Production',

  /* ── LES QUATRE TRANSPORTEURS SIMPLES ───────────────────────────────────── */
  'Nom d’utilisateur': 'Username',
  'Mot de passe': 'Password',
  'Numéro de compte': 'Account number',
  'Numéro de compte (optionnel)': 'Account number (optional)',
  'votre_identifiant': 'your_username',
  'votre@courriel.com': 'your@email.com',
  'Ex : 12345678': 'E.g.: 12345678',
  'Ex : 123456789': 'E.g.: 123456789',
  'Ex : A1B2C3': 'E.g.: A1B2C3',
  'Ex : 99999': 'E.g.: 99999',
  /* ⚠ « Client ID » et « Client Secret » sont les noms des champs CHEZ FedEx et
     UPS : ils s ecrivent ainsi dans les deux langues. L entree existe pour que
     le compteur voie une DECISION, pas un oubli. */
  'Client ID': 'Client ID',
  'Client Secret': 'Client Secret',

  /* ══ POSTES CANADA ═════════════════════════════════════════════════════════
   * ⚠ Les valeurs de test sont des VALEURS : elles restent telles quelles. */
  'Postes Canada': 'Canada Post',
  'Identifiants sur <b>developer.canadapost-postescanada.ca</b>. La clé API est au ':
    'Credentials at <b>developer.canadapost-postescanada.ca</b>. The API key is in the ',
  'Identifiants sur developer.canadapost-postescanada.ca . La clé API est au':
    'Credentials at developer.canadapost-postescanada.ca . The API key is in the',
  'format <b>utilisateur:motdepasse</b>. Valeurs de test : ':
    'form <b>username:password</b>. Test values: ',
  'format utilisateur:motdepasse . Valeurs de test :':
    'form username:password . Test values:',
  /* ⚠ LES CHIFFRES SONT DES VALEURS DE TEST : ils ne changent pas. Seuls les
     deux mots qui les nomment se lisent. */
  '6e93d53968881714:0bfa9fcb9853d1f51ee57a · client 2004381 · contrat 42708517.':
    '6e93d53968881714:0bfa9fcb9853d1f51ee57a · customer 2004381 · contract 42708517.',
  'Clé API complète (utilisateur:motdepasse)': 'Full API key (username:password)',
  'Numéro client': 'Customer number',
  'Ex : 2004381': 'E.g.: 2004381',
  'ID contrat': 'Contract ID',
  'Ex : 42708517': 'E.g.: 42708517',

  /* ── L AUTOCOMPLETION D ADRESSE ─────────────────────────────────────────── */
  'Autocomplétion d’adresse à la caisse': 'Address autocomplete at checkout',
  'Jeton Mapbox (public, pk.*)': 'Mapbox token (public, pk.*)',
  'Gratuit sur account.mapbox.com. S’il est renseigné, il remplace AddressComplete (plus précis au Canada).':
    'Free at account.mapbox.com. When filled in, it replaces AddressComplete (more accurate in Canada).',

  /* ── L ADRESSE DE L EXPEDITEUR ──────────────────────────────────────────── */
  'Adresse expéditeur (entrepôt / boutique)': 'Sender address (warehouse / shop)',
  'Nom / Boutique': 'Name / Shop',
  'Téléphone (sans tirets)': 'Phone (no dashes)',
  'Adresse (rue)': 'Address (street)',
  'Ville': 'City',
  /* ⚠ L exemple de ville reste « Montréal » : c est un nom de lieu. */
  'Montréal': 'Montréal',
  'Province': 'Province',
  'Code postal (sans espace)': 'Postal code (no space)',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Transporteurs enregistrés.': 'Carriers saved.',

  /* ── LES MOTS SEULS (2026-09-13) ───────────────────────────────────────────
     ⚠ CE SONT DES NOMS D'ENTREPRISES : ils s'écrivent pareil dans les deux
     langues et ne se traduisent JAMAIS. L'entrée existe pour que ce soit une
     décision écrite, pas un oubli — c'est la seule façon de distinguer les
     deux. */
  'Purolator': 'Purolator',
  'FedEx': 'FedEx',
  'UPS': 'UPS',
  'Canpar': 'Canpar'
};
