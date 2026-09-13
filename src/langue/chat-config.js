'use strict';

/*
 * CONFIGURATION DU CHAT EN LIGNE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN EST DEJA BILINGUE PAR SES CHAMPS, comme promotions : « Accueil —
 * français » et « Accueil — anglais », « Hors ligne — français » et « — anglais ».
 * Ce que la CLIENTE lit dans la bulle de chat est donc DEJA ecrit a la main,
 * dans les deux langues, par qui configure. ➡ Ici on ne traduit QUE LES
 * ETIQUETTES. Les exemples, eux, restent dans la langue DE LEUR CHAMP : celui du
 * champ francais reste francais, celui du champ anglais est deja anglais et n a
 * pas de cle. Les traduire ferait remplir la mauvaise case.
 *
 * ⚠⚠ `{{AGENT}}` EST UN JETON, PAS UN MOT. Il est remplace par le nom de l agent
 * au moment ou la bulle s affiche. Le traduire laisserait « {{AGENT}} » en
 * toutes lettres dans le message d accueil, chez la cliente.
 *
 * ⚠⚠ LES SIX SOURCES DE L ASSISTANT (`produits`, `collections`, `faq`,
 * `retours`, `expedition`, `promotions`) sont des VALEURS : elles nomment aussi
 * l identifiant de leur case (`id="i-produits"`) et partent dans la
 * configuration. Seuls leurs libelles se lisent — la source les ecrit dans une
 * autre colonne, et c est ce qui permet de traduire l un sans toucher a l autre.
 *
 * ⚠ LE MESSAGE DE PASSAGE A L EQUIPE est lu par la CLIENTE et n a qu UN champ,
 * pas deux : son exemple reste francais.
 *
 * ⚠ Les noms et les photos des agents sont des donnees.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Configuration du chat en ligne — Administration Sandriza':
    'Live chat configuration — Sandriza Administration',
  'Configuration du chat en ligne': 'Live chat configuration',
  '⚙ Widget': '⚙ Widget',
  'Assistant IA': 'AI assistant',
  'Lecture seule : vous pouvez consulter ces réglages, pas les modifier.':
    'Read only: you can view these settings, not change them.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès au chat en ligne.':
    'Your role does not give access to the live chat.',
  'Ce fichier n’est pas une image.': 'This file is not an image.',
  'Image trop lourde : 800 Ko au maximum.': 'Image too heavy: 800 KB at most.',
  'Le courriel de notification est mal écrit.': 'The notification email is malformed.',
  'Il faut au moins un agent portant un nom.': 'At least one agent must have a name.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',

  /* ── LA PRESENCE ────────────────────────────────────────────────────────── */
  'Présence': 'Presence',
  'Actif': 'Active',
  'En ligne': 'Online',
  'Rotation des noms': 'Name rotation',
  'Nom de l’agent': 'Agent name',
  'Courriel d’avis (hors ligne)': 'Notice email (offline)',
  /* ⚠ « Vide : personne n’est prévenu » : sans cette moitie, on croit qu un
     message laisse hors ligne finit toujours par arriver a quelqu un. */
  'Prévenu quand quelqu’un laisse un message pendant que le chat est hors ligne. Vide : personne n’est prévenu.':
    'Told when someone leaves a message while the chat is offline. Empty: nobody is told.',

  /* ── QUI REPOND ─────────────────────────────────────────────────────────── */
  'Qui répond': 'Who answers',
  'Photo de l’agent fixe': 'Photo of the fixed agent',
  '📁 Importer': '📁 Import',
  'Importer': 'Import',
  'Importer une photo': 'Import a photo',
  'Photo introuvable à cette adresse': 'No photo found at this address',
  /* ⚠ Le <b> coupe la phrase : la cle porte la balise. */
  'Servie quand la rotation des noms est <b>désactivée</b>.':
    'Served when the name rotation is <b>turned off</b>.',
  'Servie quand la rotation des noms est désactivée .':
    'Served when the name rotation is turned off .',
  'Agents de la rotation': 'Agents in the rotation',
  'Chacun a son nom et sa photo. Décoché, un agent est sauté par la rotation sans être perdu.':
    'Each has a name and a photo. Unticked, an agent is skipped by the rotation without being lost.',
  '＋ Ajouter un agent': '＋ Add an agent',
  'Aucun agent. La rotation servira le nom de repli.':
    'No agent. The rotation will serve the fallback name.',
  'Agent actif': 'Agent active',
  'URL de la photo de l’agent': 'URL of the agent’s photo',
  'URL de la photo (vide = sans photo)': 'Photo URL (empty = no photo)',
  'Retirer cet agent': 'Remove this agent',
  'Agent retiré — pensez à enregistrer.': 'Agent removed — remember to save.',
  'Rotation modifiée — pensez à enregistrer.': 'Rotation changed — remember to save.',
  'Lecture du fichier impossible.': 'The file could not be read.',
  'Envoi de la photo…': 'Sending the photo…',
  'Photo rangée dans le nuage — pensez à enregistrer.':
    'Photo stored in the cloud — remember to save.',

  /* ══ LES MESSAGES — DEJA BILINGUES PAR LEURS CHAMPS ════════════════════════
   * ⚠⚠ On ne nomme que les champs. Le contenu est ecrit a la main dans chaque
   * langue, et `{{AGENT}}` ne se traduit jamais. */
  'Messages': 'Messages',
  'Accueil — français': 'Greeting — French',
  'Accueil — anglais': 'Greeting — English',
  'Hors ligne — français': 'Offline — French',
  'Hors ligne — anglais': 'Offline — English',
  'Écrivez <b>{{AGENT}}</b> là où le nom de l’agent doit paraître.':
    'Write <b>{{AGENT}}</b> where the agent’s name should appear.',
  'Écrivez {{AGENT}} là où le nom de l’agent doit paraître.':
    'Write {{AGENT}} where the agent’s name should appear.',
  /* ⚠⚠ L EXEMPLE DU CHAMP FRANCAIS RESTE FRANCAIS : c est un exemple de ce que
     la CLIENTE lira dans la bulle, et le champ anglais est juste en dessous. */
  'Bonjour ! Mon nom est {{AGENT}}, comment puis-je vous aider ?':
    'Bonjour ! Mon nom est {{AGENT}}, comment puis-je vous aider ?',
  /* ⚠ ET CELUI DU CHAMP ANGLAIS RESTE ANGLAIS, des deux cotes : c est l exemple
     de la bulle anglaise. L entree existe pour que le compteur voie une
     DECISION, pas un oubli. */
  'Hello! My name is {{AGENT}}, how can I help you today?':
    'Hello! My name is {{AGENT}}, how can I help you today?',
  'Enregistrer les réglages du widget': 'Save the widget settings',
  'Réglages du widget enregistrés.': 'Widget settings saved.',

  /* ══ L ASSISTANT IA ════════════════════════════════════════════════════════ */
  'Clé Groq en place — modèle ': 'Groq key in place — model ',
  'Clé Groq en place — modèle': 'Groq key in place — model',
  /* ⚠ Le <b> coupe la phrase ; et l endroit ou la cle se pose est la seule
     chose qui permette d agir. */
  'Aucune clé Groq enregistrée : l’assistant ne peut pas répondre. Elle se pose dans <b>Configuration → Clés API</b>.':
    'No Groq key saved: the assistant cannot answer. It is set in <b>Configuration → API keys</b>.',
  'Aucune clé Groq enregistrée : l’assistant ne peut pas répondre. Elle se pose dans Configuration → Clés API .':
    'No Groq key saved: the assistant cannot answer. It is set in Configuration → API keys .',
  'Activer l’assistant': 'Turn on the assistant',
  'Ce qu’il a le droit de lire': 'What it is allowed to read',
  /* ⚠⚠ LES LIBELLES SEULS — leurs valeurs (produits, faq, retours…) nomment
     aussi l identifiant de la case et partent dans la configuration. */
  'Produits et inventaire': 'Products and inventory',
  'Collections': 'Collections',
  'Politique de retours': 'Return policy',
  'Politique d’expédition': 'Shipping policy',
  'Promotions en cours': 'Running promotions',
  'Règles maison': 'House rules',
  'Exemple : ne jamais nommer un concurrent. Toujours proposer le programme de fidélité.':
    'For example: never name a competitor. Always mention the loyalty program.',
  'Instructions supplémentaires, suivies à chaque réponse.':
    'Extra instructions, followed on every answer.',
  'Message de passage à l’équipe': 'Hand-over message to the team',
  /* ⚠ Ce message est LU PAR LA CLIENTE et n a qu un seul champ : son exemple
     reste francais. */
  'Je transmets votre question à notre équipe. Merci de patienter.':
    'Je transmets votre question à notre équipe. Merci de patienter.',
  'Affiché quand l’assistant préfère ne pas répondre.':
    'Shown when the assistant would rather not answer.',
  'Enregistrer l’assistant': 'Save the assistant',
  'Assistant enregistré.': 'Assistant saved.',

  /* ── LE RECHARGEMENT ────────────────────────────────────────────────────── */
  'Saisie en cours : les réglages ne sont pas rechargés.':
    'Entry under way: the settings are not reloaded.'
};
