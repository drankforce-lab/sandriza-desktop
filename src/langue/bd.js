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
 * ⚠ « clé », « image », « erreur » s accordent (szPl, 2026-09-29) ; les
 * anciennes cles « (s) » restent en bas pour memoire.
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
  '— au moins : l’inventaire s’est arrêté avant la fin.': '— at least: the inventory stopped before the end.',
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
  ' erreur(s).': ' error(s).',
  'clé poussée': 'key pushed',
  'clés poussées': 'keys pushed',
  'gérée entrée par entrée par le serveur.': 'handled entry by entry by the server.',
  'gérées entrée par entrée par le serveur.': 'handled entry by entry by the server.',
  'image déplacée': 'image moved',
  'images déplacées': 'images moved',
  'erreur.': 'error.',
  'erreurs.': 'errors.',
  // 2026-10-15 : confirmations en boîte à part.
  'Restaurer depuis Turso': 'Restore from Turso',
  'La configuration enregistrée dans Turso remplacera la configuration locale, puis la fenêtre principale sera rechargée. Les réglages locaux qui n’ont pas été poussés vers Turso seront perdus.': 'The configuration stored in Turso will replace the local configuration, then the main window will reload. Local settings that have not been pushed to Turso will be lost.',
  'Restaurer la configuration': 'Restore the configuration',
  'Migrer les images vers R2': 'Migrate images to R2',
  'Les images encore stockées en base64 dans la base de données seront déplacées vers Cloudflare R2. L’opération peut durer plusieurs minutes et n’est à lancer qu’une seule fois.': 'Images still stored as base64 in the database will be moved to Cloudflare R2. The operation may take several minutes and only needs to be run once.',
  'Lancer la migration': 'Start the migration',
  /* (2026-10-25, audit) Textes visibles qui restaient hors T(). */
  'Pousser la configuration locale': 'Push the local configuration',
  'La configuration de ce poste remplacera celle enregistrée dans Turso, pour tous les postes. Si ce poste a un cache périmé, il écrasera les réglages faits ailleurs.': 'This workstation’s configuration will replace the one saved in Turso, for every workstation. If this workstation has a stale cache, it will overwrite settings made elsewhere.',
  'Pousser vers Turso': 'Push to Turso',
  // 2026-11-24 : la porte de la boutique de test.
  'Boutique de test — accès': 'Test store — access',
  'Seules les adresses IP de cette liste ouvrent <b>test.sandriza.com</b>. Une liste vide ferme le test à tout le monde. Les pays, s’il y en a, s’ajoutent comme seconde condition.': 'Only the IP addresses in this list open <b>test.sandriza.com</b>. An empty list closes the test store to everyone. Countries, if any, are added as a second condition.',
  'Réservé aux super-administrateurs.': 'Super administrators only.',
  'Votre adresse :': 'Your address:',
  'pays :': 'country:',
  'Ajouter mon adresse': 'Add my address',
  'Adresses IP autorisées (une par ligne ; un bloc comme 203.0.113.0/24 est accepté)': 'Allowed IP addresses (one per line; a block such as 203.0.113.0/24 is accepted)',
  'Adresses IP autorisées': 'Allowed IP addresses',
  'Pays autorisés (codes à deux lettres, séparés par des virgules ; vide = tous)': 'Allowed countries (two-letter codes, comma-separated; empty = all)',
  'Pays autorisés': 'Allowed countries',
  '✓ Base de test branchée': '✓ Test database connected',
  '✗ Jeton de la base de test absent du serveur (TESTBD_SANDRIZA)': '✗ Test database token missing on the server (TESTBD_SANDRIZA)',
  'Conseil : poser SZ_CF_SECRET durcit cette porte.': 'Tip: setting SZ_CF_SECRET hardens this gate.',
  'Enregistrer l’accès': 'Save access',
  'Adresse ajoutée à la liste : enregistrez pour l’appliquer.': 'Address added to the list: save to apply it.',
  'Enregistrement de l’accès…': 'Saving access…',
  'Accès enregistré : la boutique de test s’ouvre à ces adresses.': 'Access saved: the test store opens to these addresses.',
  'Liste vide : la boutique de test est fermée à tout le monde.': 'Empty list: the test store is closed to everyone.',
  'Adresse IP invalide : ': 'Invalid IP address: ',
  'Le serveur n’a pas le jeton de la base de test (TESTBD_SANDRIZA).': 'The server does not have the test database token (TESTBD_SANDRIZA).',
  'Boutique de test — copie depuis la production': 'Test store — copy from production',
  'Remplace le contenu du test par celui de la production : catalogue et réglages tels quels, <b>clients brouillés</b> (noms, courriels, téléphones, adresses). Les <b>finances et le RH ne sont jamais copiés</b> ; Square passe en bac à sable.': 'Replaces the test store content with production’s: catalogue and settings as they are, <b>customers scrambled</b> (names, emails, phones, addresses). <b>Finance and HR are never copied</b>; Square switches to sandbox.',
  'Dernière copie :': 'Last copy:',
  'Progression de la copie': 'Copy progress',
  'Copier la production vers le test': 'Copy production to test',
  'Journal de la boutique de test': 'Test store log',
  'Le journal est vide.': 'The log is empty.',
  'Lecture de la production…': 'Reading production…',
  'Tout le contenu actuel du test sera remplacé, y compris ce qui y a été modifié et pas encore synchronisé vers la production. Tables copiées : ': 'All current test store content will be replaced, including changes not yet synchronised to production. Tables copied: ',
  'Remplacer le test': 'Replace the test store',
  'Copie en cours…': 'Copy in progress…',
  'Copie terminée : le test est à jour.': 'Copy complete: the test store is up to date.',
  'Ce qui occupe Cloudflare R2': 'What takes up Cloudflare R2',
  'fichier': 'file',
  'fichiers': 'files',
  'Sauvegardes de nuit (chiffrées)': 'Nightly backups (encrypted)',
  'Photos des produits': 'Product photos',
  'Vignettes (miniatures)': 'Thumbnails',
  'Cabine d’essayage': 'Fitting room',
  'Vidéos': 'Videos',
  'Reçus': 'Receipts',
  'Talons de paie (RH, chiffrés)': 'Pay stubs (HR, encrypted)',
  'Corbeille': 'Trash',
  'Photos détourées': 'Cut-out photos',
  'Hors dossier': 'Outside any folder',
  "Nom": "Name",
  "Prix": "Price",
  "Prix soldé": "Sale price",
  "Prix barré": "Compare-at price",
  "Description": "Description",
  "Photos": "Photos",
  "Photo principale": "Main photo",
  "Catégorie": "Category",
  "Tailles": "Sizes",
  "Couleurs": "Colours",
  "Étiquettes": "Tags",
  "UGS": "SKU",
  "Active": "Active",
  "Visible": "Visible",
  "En vedette": "Featured",
  "Fiche entière": "Whole record",
  "Valeur": "Value",
  "Nouveau dans le test": "New in test",
  "Supprimé dans le test": "Deleted in test",
  "Créé en production seulement": "Created in production only",
  "Supprimé en production seulement": "Deleted in production only",
  "Modifié": "Modified",
  "Créé des deux côtés sous le même numéro": "Created on both sides with the same ID",
  "À envoyer": "To send",
  "Conflit": "Conflict",
  "Changé en production": "Changed in production",
  "— Choisir —": "— Choose —",
  "Le test l’emporte": "Test wins",
  "Fusionner : le reste part, la production garde ses valeurs en conflit": "Merge: the rest is sent, production keeps its conflicting values",
  "La production l’emporte (le test est réaligné)": "Production wins (test is realigned)",
  "Reprendre dans le test": "Bring into test",
  "Imposer la version du test en production": "Force the test version into production",
  "Supprimer aussi en production": "Delete in production too",
  "Envoyer en production": "Send to production",
  "Abandonner ce changement (le test reprend la production)": "Drop this change (test takes production’s version)",
  "Plus tard": "Later",
  "(absent)": "(absent)",
  "Production :": "Production:",
  "Test :": "Test:",
  "autres champs": "more fields",
  "Produit": "Product",
  "Réglage": "Setting",
  "⚠ Cette UGS existe déjà en production sur un autre produit : l’envoi sera refusé tant qu’elle n’est pas changée dans le test.": "⚠ This SKU already exists in production on another product: sending will be refused until it is changed in test.",
  "Que faire :": "Action:",
  "Que faire de cet élément": "What to do with this item",
  "Boutique de test — synchronisation vers la production": "Test store — synchronise to production",
  "Compare le test à la production, champ par champ, depuis la dernière copie. Seuls le <b>catalogue</b> et les <b>réglages de la boutique</b> partent — jamais les clients, les commandes, les finances ni le RH. Le <b>stock</b> reste celui de la production. Chaque envoi est sauvegardé et peut être annulé.": "Compares test with production, field by field, since the last copy. Only the <b>catalogue</b> and <b>store settings</b> are sent — never customers, orders, finance or HR. <b>Stock</b> stays production’s. Every send is backed up and can be undone.",
  "à envoyer": "to send",
  "conflit(s)": "conflict(s)",
  "changé(s) en production seulement": "changed in production only",
  "✓ Rien à synchroniser : le test et la production sont pareils.": "✓ Nothing to synchronise: test and production match.",
  "La dernière copie date d’avant ce module : la comparaison est moins fine (tout écart touchant un produit vendu depuis passe pour un conflit). Une nouvelle copie la rendra exacte.": "The last copy predates this module: comparison is coarser (any difference on a product sold since shows as a conflict). A new copy will make it exact.",
  "Plus de 400 éléments : seuls les 400 premiers sont montrés. Synchronisez-les, puis relancez l’analyse.": "More than 400 items: only the first 400 are shown. Synchronise them, then analyse again.",
  "Progression de la synchronisation": "Synchronisation progress",
  "Relancer l’analyse": "Analyse again",
  "Analyser les changements": "Analyse changes",
  "Appliquer les choix": "Apply choices",
  "Derniers envois en production": "Recent sends to production",
  "créé": "created",
  "supprimé": "deleted",
  "modifié": "modified",
  "annulé": "undone",
  "Annuler": "Undo",
  "Aucune copie de référence : lancez d’abord « Copier la production vers le test ».": "No reference copy: first run “Copy production to test”.",
  "Cet élément a changé depuis l’analyse : relancez-la.": "This item changed since the analysis: run it again.",
  "UGS déjà prise en production.": "SKU already used in production.",
  "L’élément a été modifié en production depuis cet envoi : l’annulation l’écraserait. Rien n’est fait.": "The item was modified in production since this send: undoing would overwrite it. Nothing was done.",
  "La production change sans arrêt (ventes en cours ?) : réessayez dans un instant.": "Production keeps changing (sales in progress?): try again in a moment.",
  "Analyse du test et de la production…": "Analysing test and production…",
  "Analyse terminée : vérifiez chaque élément, puis appliquez.": "Analysis complete: check each item, then apply.",
  "Rien à synchroniser.": "Nothing to synchronise.",
  "élément(s) partiront en PRODUCTION (la boutique en ligne change aussitôt) ;": "item(s) will go to PRODUCTION (the online store changes immediately);",
  "seront repris dans le test.": "will be brought into test.",
  "conflit(s) sans choix resteront en attente.": "conflict(s) without a choice will stay pending.",
  "Chaque envoi est sauvegardé : il pourra être annulé.": "Every send is backed up: it can be undone.",
  "Appliquer": "Apply",
  "Synchronisation en cours…": "Synchronising…",
  "élément(s) en échec : voir le journal.": "item(s) failed: see the log.",
  "Synchronisation terminée.": "Synchronisation complete.",
  "Annuler cet envoi": "Undo this send",
  "La production retrouve la version d’avant l’envoi pour :": "Production gets back the pre-send version of:",
  "Le stock actuel est gardé. Le test, lui, ne change pas.": "Current stock is kept. Test does not change.",
  "Annuler l’envoi": "Undo the send",
  "Annulation…": "Undoing…",
  "Envoi annulé : la production a retrouvé sa version d’avant.": "Send undone: production is back to its previous version.",
  "Production verrouillée": "Production locked",
  "Verrouillée, la production refuse toute création ou modification de produit (le stock reste permis) et de réglage de la boutique : tout passe par le test, puis par la synchronisation. Les finances et le RH ne sont pas touchés. Une <b>urgence</b> rouvre la production pour un temps, avec un motif ; chaque modification faite pendant ce temps va au journal.": "When locked, production refuses any product creation or change (stock stays allowed) and any store setting change: everything goes through test, then synchronisation. Finance and HR are not affected. An <b>emergency</b> reopens production for a while, with a reason; every change made meanwhile is logged.",
  "🔒 Verrouillée": "🔒 Locked",
  "🔓 Déverrouillée : le catalogue se modifie encore directement en production.": "🔓 Unlocked: the catalogue is still edited directly in production.",
  "Urgence ouverte jusqu’à": "Emergency open until",
  "À activer une fois que l’application sait basculer vers la boutique de test (prochaine étape) : d’ici là, le catalogue ne se modifierait plus nulle part.": "Turn on once the app can switch to the test store (next step): until then, the catalogue could not be edited anywhere.",
  "Déverrouiller la production": "Unlock production",
  "Verrouiller la production": "Lock production",
  "Motif de l’urgence (obligatoire)": "Emergency reason (required)",
  "Motif de l’urgence": "Emergency reason",
  "Durée de l’urgence": "Emergency duration",
  "Ouvrir une urgence": "Open an emergency",
  "Fermer l’urgence": "Close the emergency",
  "Le catalogue et les réglages de la boutique se modifieront de nouveau directement en production, sans passer par le test.": "The catalogue and store settings will again be edited directly in production, without going through test.",
  "Dès maintenant, la production refuse les créations et modifications de produits et de réglages de la boutique. Tout se fera dans le test, puis par la synchronisation.": "From now on, production refuses product and store setting creations and changes. Everything will be done in test, then synchronised.",
  "Déverrouiller": "Unlock",
  "Verrouiller": "Lock",
  "Donnez le motif de l’urgence (5 caractères au moins).": "Give the emergency reason (at least 5 characters).",
  "Enregistrement…": "Saving…",
  "Production verrouillée.": "Production locked.",
  "Production déverrouillée.": "Production unlocked.",
  "Urgence ouverte : chaque modification est notée au journal.": "Emergency open: every change is logged.",
  "Urgence fermée.": "Emergency closed.",
};
