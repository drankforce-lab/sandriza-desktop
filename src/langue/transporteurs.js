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
  /* La nouvelle plateforme (2026-10-05). */
  'Sur <b>developer-developpeur.canadapost-postescanada.ca</b>, ouvrez votre projet de ':
    'On <b>developer-developpeur.canadapost-postescanada.ca</b>, open your ',
  '<b>production</b> : collez sa <b>Clé API</b> et son <b>Secret</b> ensemble, séparés par un deux-points ':
    '<b>production</b> project: paste its <b>API Key</b> and <b>Secret</b> together, separated by a colon ',
  '(clé:secret). Une clé de test ne donne que des prix d’exemple. L’ID contrat est à laisser vide sans entente commerciale.':
    '(key:secret). A test key only returns sample prices. Leave the contract ID empty without a commercial agreement.',
  'Sur developer-developpeur.canadapost-postescanada.ca , ouvrez votre projet de':
    'On developer-developpeur.canadapost-postescanada.ca , open your',
  'production : collez sa Clé API et son Secret ensemble, séparés par un deux-points':
    'production project: paste its API Key and Secret together, separated by a colon',
  'Clé API:Secret': 'API Key:Secret',
  'clé:secret': 'key:secret',
  'Ex : 0001234567': 'E.g.: 0001234567',
  'Vide sans entente commerciale': 'Empty without a commercial agreement',
  'Afficher': 'Show',
  'Masquer': 'Hide',
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
  'Canpar': 'Canpar',
  'Intelcom': 'Intelcom',

  /* ── REFONTE FINE (2026-09-26) : l etat des secrets en pastille ── */
  'Enregistré': 'Saved',
  'Aucun secret enregistré': 'No secret saved',
  'Enregistré …': 'Saved …',
  /* ── ETAT DE LA COTATION (2026-10-04) ── */
  'Une vraie cotation vers Québec, 1 kg, pour chaque transporteur actif': 'A real quote to Quebec City, 1 kg, for each active carrier',
  'Tester la cotation': 'Test the quote',
  'identifiants d’essai': 'test credentials',
  'Aucune cotation à la caisse depuis la mise en service de ce suivi.': 'No checkout quote since this tracking was turned on.',
  'Cote à la caisse': 'Quotes at checkout',
  'Absent de la caisse': 'Missing from checkout',
  'Cotation d’essai en cours… (jusqu’à 30 s)': 'Test quote in progress… (up to 30 s)',
  'Un transporteur actif n’a pas coté — voir sa carte.': 'An active carrier did not quote — see its card.',
  'Tous les transporteurs actifs ont coté.': 'All active carriers quoted.',
  'mode test (sandbox)': 'test mode (sandbox)',
  'Transporteurs enregistrés — vérification de la cotation…': 'Carriers saved — checking the quote…',
  'Enregistré — mais un transporteur actif ne cote pas : voir sa carte.': 'Saved — but an active carrier does not quote: see its card.',
  'Enregistré — tous les transporteurs actifs cotent.': 'Saved — all active carriers quote.',
  'Le Client Secret est identique au Client ID — il a sans doute été collé dans la mauvaise case.': 'The Client Secret is identical to the Client ID — it was probably pasted in the wrong box.',
  'Pas encore coté — cliquez « Tester la cotation » en bas de la fenêtre.': 'Not quoted yet — click “Test the quote” at the bottom of the window.',
  /* ── PUROLATOR (2026-10-11) : la clé et son mot de passe, l'environnement, les comptes d'essai. */
  "Client ID (clé)": "Client ID (key)",
  "Client ID / Key fourni par Purolator": "Client ID / Key provided by Purolator",
  "Secret (mot de passe de la clé)": "Secret (key password)",
  "Numéro de compte (en test : compte expéditeur de test)": "Account number (in test: test shipper account)",
  "Compte destinataire de test": "Test receiver account",
  "Numéro de compte de fret de test": "Test freight account number",
  "Clé": "Key",
  "Clé du portail Purolator": "Key from the Purolator portal",
  /* ── LES ONGLETS (2026-10-11) */
  "Général": "General",
  "Désactivé": "Disabled",
  "Actif — cote à la caisse": "Active — quotes at checkout",
  "Actif — ne cote pas": "Active — not quoting",
  "Actif": "Active",
  /* ── INTELCOM (2026-10-11) */
  "Code client": "Client code",
  "Nom d’utilisateur API": "API username",
  "Dans « My Account » d’eShipper": "In eShipper’s “My Account”",
  "Mot de passe API": "API password",
  "Numéro de client (facultatif)": "Customer number (optional)",
  "Ex : 123456": "E.g. 123456",
  "Ex : SANDRIZA": "E.g. SANDRIZA",
  "Clé API (x-api-key)": "API key (x-api-key)",
  "Préfixe des numéros de suivi": "Tracking number prefix",
  "Ex : SZ": "E.g. SZ",
  /* ── LES SECTIONS (7.18.4) */
  "Identifiants API": "API credentials",
  "Fournis par le portail des développeurs du transporteur.": "Provided by the carrier’s developer portal.",
  "Compte et environnement": "Account and environment",
  "Le numéro de compte facturé, et l’environnement d’essai ou réel.": "The billed account number, and the test or live environment.",
  "Comptes d’essai": "Test accounts",
  "Donnés par le portail pour l’environnement de test : facturation au destinataire et fret.": "Given by the portal for the test environment: receiver billing and freight.",
  "Le numéro de client Postes Canada et, s’il y a lieu, le contrat commercial.": "Your Canada Post customer number and, if any, the commercial contract.",
  "Le point de départ des colis : il sert à la cotation de tous les transporteurs.": "Where parcels leave from: used to quote every carrier.",
  "Propose l’adresse complète pendant que le client tape la sienne.": "Suggests the full address while the customer types theirs.",
  // Refonte de la préparation, deux jeux de clés des transporteurs (2026-10-19).
  "Posée": "Set",
  "actif": "active",
  "Jeu complet": "Complete set",
  "Incomplet": "Incomplete",
  "Jeu actif": "Active set",
  "Le jeu qui sert à CRÉER les étiquettes. Les tarifs se lisent toujours en production quand elle est posée (gratuit).": "The set used to CREATE labels. Rates are always read in production when it is set (free).",
  "Créer les étiquettes avec": "Create labels with",
  "Bac à sable — rien n’est facturé": "Sandbox — nothing is billed",
  "Production — étiquettes facturées": "Production — labels are billed",
  "Numéros de suivi": "Tracking numbers",
  "Nouvelle plateforme (OAuth) — un seul hôte : c’est la clé qui est de test ou de production.": "New platform (OAuth) — a single host: the key itself is test or production.",
  "Ancienne passerelle (soa-gw) — hôte de test ct.soa-gw.canadapost.ca.": "Legacy gateway (soa-gw) — test host ct.soa-gw.canadapost.ca.",
  "Clé d’API": "API key",
  "Clé d’API du portail": "API key from the portal",
  "Code API secret": "API secret",
  "Portail développeur de Postes Canada › Identifiants : Credential for [Test] = bac à sable, [Production] = production. Copiez la « Clé d’API » et le « Code API secret » dans le bloc correspondant.": "Canada Post developer portal › Credentials: Credential for [Test] = sandbox, [Production] = production. Copy the « API key » and the « API secret » into the matching block.",
  // (2026-10-25, audit)
  'votre_client_id': 'your_client_id',
  'Enregistrez d’abord : le test porte sur la configuration enregistrée, pas sur ce qui vient d’être saisi.': 'Save first: the test uses the saved configuration, not what was just entered.',
};
