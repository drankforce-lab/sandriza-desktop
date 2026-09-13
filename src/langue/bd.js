'use strict';

/*
 * BASE DE DONNEES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ TROIS BOUTONS, ET CE QUE CHACUN FAIT VRAIMENT. C est la seule chose qui
 * empeche de cliquer « Restaurer » en croyant sauvegarder :
 *   · POUSSER envoie toutes les configs LOCALES vers Turso.
 *   · RESTAURER recharge DEPUIS Turso, puis recharge la fenetre principale.
 *   · MIGRER deplace vers R2 les images encore stockees en base64 — A LANCER UNE
 *     FOIS.
 * Les deux derniers s arment en deux temps ; leurs libelles de confirmation
 * doivent rester aussi nets que les premiers.
 *
 * ⚠⚠ « synchronisée vers Turso à CHAQUE SAUVEGARDE » : cette phrase dit que ces
 * boutons ne servent qu a FORCER une synchronisation qui se fait deja toute
 * seule. Sans elle, on croit que la configuration ne part que si l on clique.
 *
 * ⚠ LES NOMS DE SERVICES ET LES CLES NE SE TRADUISENT PAS : Turso, Cloudflare
 * R2, base64, et les cles de configuration listees en bas sont des IDENTIFIANTS
 * — elles nomment ce qui est range dans la base.
 *
 * ⚠ « clé(s) », « image(s) », « erreur(s) » gardent leur parenthese : c est la
 * forme que la source ecrit, et elle vaut pour un comme pour plusieurs.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Base de données — Administration Sandriza': 'Database — Sandriza Administration',
  'Base de données': 'Database',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can view, not change.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  /* ⚠ L apostrophe DROITE : la source ecrit ces trois-la entre guillemets
     doubles. */
  "L'administration n'est pas encore chargée dans la fenêtre principale.":
    'The administration is not loaded yet in the main window.',
  "La fenêtre principale n'a pas répondu à temps.": 'The main window did not answer in time.',
  "L'opération a échoué.": 'The operation failed.',
  'Le stockage R2 n’est pas disponible.': 'R2 storage is not available.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',

  /* ══ LES TROIS GESTES ══════════════════════════════════════════════════════ */
  ' Turso Cloud DB': ' Turso Cloud DB',
  '☁ Turso Cloud DB': '☁ Turso Cloud DB',
  /* ⚠⚠ LA SYNCHRONISATION SE FAIT DEJA SEULE : ces boutons ne font que la
     forcer. Le <b> coupe la phrase : la cle porte la balise. */
  'Toute la configuration (thèmes, logos, clés API, navigation, profil…) est ':
    'The whole configuration (themes, logos, API keys, navigation, profile…) is ',
  'Toute la configuration (thèmes, logos, clés API, navigation, profil…) est':
    'The whole configuration (themes, logos, API keys, navigation, profile…) is',
  'synchronisée vers Turso à <b>chaque sauvegarde</b>. Ces boutons servent à forcer une synchronisation, ':
    'synced to Turso on <b>every save</b>. These buttons only force a sync, ',
  'synchronisée vers Turso à chaque sauvegarde . Ces boutons servent à forcer une synchronisation,':
    'synced to Turso on every save . These buttons only force a sync,',
  'par exemple après avoir vidé le cache du navigateur.':
    'for example after clearing the browser cache.',
  '↑ Pousser tout vers Turso': '↑ Push everything to Turso',
  '↓ Restaurer depuis Turso': '↓ Restore from Turso',
  'Confirmer la restauration ?': 'Confirm the restore?',
  'Tester la connexion': 'Test the connection',
  '↦ Migrer les images vers R2': '↦ Move the images to R2',
  'Confirmer la migration ?': 'Confirm the move?',
  /* ⚠⚠ CE QUE CHAQUE BOUTON FAIT VRAIMENT — le sens de la fleche compte. */
  '<b>Pousser</b> : envoie toutes les configs locales vers Turso. ':
    '<b>Push</b>: sends every local config to Turso. ',
  'Pousser : envoie toutes les configs locales vers Turso.':
    'Push: sends every local config to Turso.',
  '<b>Restaurer</b> : recharge depuis Turso puis recharge la fenêtre principale (utile après un vidage de cache). ':
    '<b>Restore</b>: reloads from Turso then reloads the main window (useful after a cache clear). ',
  'Restaurer : recharge depuis Turso puis recharge la fenêtre principale (utile après un vidage de cache).':
    'Restore: reloads from Turso then reloads the main window (useful after a cache clear).',
  '<b>Migrer</b> : déplace vers R2 les images encore stockées en base64 (à lancer une fois).':
    '<b>Move</b>: moves to R2 the images still stored as base64 (to be run once).',
  'Migrer : déplace vers R2 les images encore stockées en base64 (à lancer une fois).':
    'Move: moves to R2 the images still stored as base64 (to be run once).',

  /* ── L OCCUPATION DU STOCKAGE ───────────────────────────────────────────── */
  'Lecture de l’occupation…': 'Reading the usage…',
  'Occupation du stockage': 'Storage usage',
  'Turso (base de données)': 'Turso (database)',
  'Produits, commandes, clients, dépenses…': 'Products, orders, customers, expenses…',
  'Cloudflare R2 (fichiers)': 'Cloudflare R2 (files)',
  'Reçus, photos, logos, documents, sauvegardes…':
    'Receipts, photos, logos, documents, backups…',
  ' Cloudflare R2 : en attente de connexion.': ' Cloudflare R2: waiting for a connection.',
  '📦 Cloudflare R2 : en attente de connexion.': '📦 Cloudflare R2: waiting for a connection.',
  'Occupation indisponible pour le moment.': 'Usage unavailable for now.',
  /* ⚠ Les cles listees sont des IDENTIFIANTS de configuration : elles nomment
     ce qui est range dans la base et ne se traduisent pas. */
  'Clés synchronisées (': 'Synced keys (',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Test de la connexion…': 'Testing the connection…',
  'Connexion Turso OK.': 'Turso connection OK.',
  'Synchronisation vers Turso…': 'Syncing to Turso…',
  ' clé(s) poussée(s)': ' key(s) pushed',
  'clé(s) poussée(s)': 'key(s) pushed',
  ' gérée(s) entrée par entrée par le serveur.':
    ' handled entry by entry by the server.',
  'gérée(s) entrée par entrée par le serveur.':
    'handled entry by entry by the server.',
  'Restauration depuis Turso…': 'Restoring from Turso…',
  'Restauré — la fenêtre principale se recharge…':
    'Restored — the main window is reloading…',
  'Migration des images vers R2… (peut durer)':
    'Moving the images to R2… (this can take a while)',
  'Migration terminée : ': 'Move finished: ',
  'Migration terminée :': 'Move finished:',
  ' image(s) déplacée(s)': ' image(s) moved',
  'image(s) déplacée(s)': 'image(s) moved',
  ' erreur(s).': ' error(s).'
};
