'use strict';

/*
 * TELEPHONIE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN CONTIENT DEJA DEUX LANGUES, ET CE NE SONT PAS LES NOTRES. La
 * ligne telephonique repond aux clientes en FRANCAIS et en ANGLAIS : chaque
 * message a un champ « (FR) » et un champ « (EN) ». Ce que ces champs
 * contiennent est de la DONNEE — c est ce que l appelante ENTEND.
 *
 * ⚠⚠ LES SUGGESTIONS DE CES CHAMPS NE SE TRADUISENT PAS NON PLUS. « Bonjour et
 * merci d avoir appele… » est le `placeholder` du champ FRANCAIS : il montre la
 * FORME du texte a ecrire. Le rendre en anglais suggererait de taper de
 * l anglais dans le message francais — et une cliente francophone entendrait
 * alors l accueil en anglais. Ils ont donc une entree qui rend LE MEME TEXTE :
 * c est une DECISION, pas un oubli, et `banc-langue-residuel` la reconnait
 * comme telle.
 * ➡ On traduit l ETIQUETTE du champ, jamais son contenu ni son exemple.
 *
 * ⚠ LES VOIX ET LES MUSIQUES : la cle est l identifiant du service
 * (`Polly.Gabrielle-Neural`, une URL MP3) ; seul le libelle qui DECRIT la voix
 * a l administratrice se traduit. Les libelles des voix ANGLAISES sont deja en
 * anglais — ils ne bougent pas.
 *
 * ⚠ « Account SID », « Auth Token », « A CALL COMES IN (Voice) » sont les
 * intitules EXACTS de la console Twilio : on les recopie pour qu on les
 * retrouve la-bas. Les traduire ferait chercher un champ qui n existe pas.
 */

module.exports = {
  /* ── L EN-TETE ──────────────────────────────────────────────────────────── */
  'Téléphonie — Administration Sandriza': 'Telephony — Sandriza Administration',
  'Téléphonie': 'Telephony',
  'Solde :': 'Balance:',
  'Crédits': 'Credits',
  'Active': 'Active',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can view, not change.',
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  'Actualiser le solde, la file et les messages': 'Refresh the balance, the queue and the messages',
  'Accueil & routage': 'Greeting & routing',
  'Menu IVR': 'IVR menu',
  "File d'attente": 'Call queue',
  'File d’attente': 'Call queue',
  '⏳ File d’attente d’appels': '⏳ Call queue',

  /* ── LES REFUS ──────────────────────────────────────────────────────────── */
  "L'administration n'est pas encore chargée dans la fenêtre principale.":
    'The administration is not loaded in the main window yet.',
  "La fenêtre principale n'a pas répondu à temps.": 'The main window did not answer in time.',
  "L'enregistrement dans le nuage a échoué. Réessayez.":
    'Saving to the cloud failed. Try again.',
  'La téléphonie est désactivée.': 'Telephony is switched off.',
  'Aucun identifiant Twilio enregistré (onglet Général).':
    'No Twilio credentials saved (General tab).',
  'Twilio a refusé la requête. Vérifiez les identifiants.':
    'Twilio refused the request. Check the credentials.',
  'Erreur réseau en joignant Twilio.': 'Network error reaching Twilio.',
  "L'opération a échoué.": 'The operation failed.',

  /* ── LES VOIX ET LES MUSIQUES ───────────────────────────────────────────── */
  /* ⚠ On DECRIT la voix a l administratrice ; la cle Polly ne bouge pas. Les
     libelles des voix anglaises sont deja en anglais. */
  'Gabrielle — femme, naturelle (neuronale)': 'Gabrielle — female, natural (neural)',
  'Liam — homme, naturel (neuronale)': 'Liam — male, natural (neural)',
  'Chantal — femme (standard)': 'Chantal — female (standard)',
  'Voix de base Twilio (robotique)': 'Basic Twilio voice (robotic)',
  'Guitare douce élégante (~1½ min) — défaut': 'Soft elegant guitar (~1½ min) — default',
  'Électro downtempo (~1½ min)': 'Downtempo electro (~1½ min)',
  'Lounge électro (~1½ min)': 'Electro lounge (~1½ min)',
  'Guitare feutrée (~2½ min)': 'Muted guitar (~2½ min)',
  'Chopin — élégance (~6 min · sonneries espacées)':
    'Chopin — elegance (~6 min · widely spaced loops)',
  'Ambiance zen / spa (~6 min · espacées)': 'Zen / spa mood (~6 min · spaced)',
  'URL personnalisée…': 'Custom URL…',
  'URL personnalisée (MP3)': 'Custom URL (MP3)',
  'Musique d’attente': 'Hold music',

  /* ── L ONGLET GENERAL ───────────────────────────────────────────────────── */
  'Numéro Twilio': 'Twilio number',
  'Mode de langue': 'Language mode',
  'Bilingue (FR + EN)': 'Bilingual (FR + EN)',
  "Français d'abord, anglais sur le #": 'French first, English on #',
  'Voix française (fr-CA)': 'French voice (fr-CA)',
  'Voix anglaise (en-US)': 'English voice (en-US)',
  'Identifiants Twilio': 'Twilio credentials',
  'votre Auth Token': 'your Auth Token',
  'inchangé (laisser vide pour conserver)': 'unchanged (leave empty to keep)',
  'Enregistré. Vide = conservé.': 'Saved. Empty = kept.',
  'Aucun secret enregistré .': 'No secret saved .',
  'Adresses de rappel (webhooks)': 'Callback addresses (webhooks)',
  'Adresse indisponible — la fenêtre principale ne l’a pas fournie.':
    'Address unavailable — the main window did not provide it.',
  'Adresse copiée.': 'Address copied.',
  'Copie refusée — l’adresse est sélectionnée, faites Ctrl+C.':
    'Copy refused — the address is selected, press Ctrl+C.',
  'L’adresse est sélectionnée, faites Ctrl+C.': 'The address is selected, press Ctrl+C.',

  /* ── L ACCUEIL ET LE ROUTAGE ────────────────────────────────────────────── */
  'Message d’accueil': 'Greeting message',
  'Accueil (FR)': 'Greeting (FR)',
  'Accueil (EN)': 'Greeting (EN)',
  "Délai après l'accueil (secondes)": 'Delay after the greeting (seconds)',
  'Attente au menu avant de raccrocher (secondes)':
    'Wait at the menu before hanging up (seconds)',
  'Aucun choix au menu': 'No choice at the menu',
  'Si l’appelant ne fait aucun choix après le délai, on joue ce message (FR + EN) puis on raccroche.':
    'If the caller makes no choice after the delay, this message is played (FR + EN) and the call ends.',
  'Message « aucun choix » (FR)': '« No choice » message (FR)',
  'Message « aucun choix » (EN)': '« No choice » message (EN)',
  "Action par défaut (à l'ouverture)": 'Default action (on answer)',
  'Robot / menu (IVR)': 'Robot / menu (IVR)',
  'Rediriger directement': 'Forward directly',
  'Messagerie vocale': 'Voicemail',
  'Heures d’ouverture': 'Opening hours',
  "Utiliser les heures d'ouverture — hors heures, message + messagerie":
    'Use the opening hours — outside them, message + voicemail',
  'Message « fermé » (FR)': '« Closed » message (FR)',
  'Message « fermé » (EN)': '« Closed » message (EN)',

  /* ── LE MENU IVR ────────────────────────────────────────────────────────── */
  '🤖 Robot de réception (menu IVR)': '🤖 Reception robot (IVR menu)',
  'Robot de réception (menu IVR)': 'Reception robot (IVR menu)',
  'Libellé FR': 'Label FR',
  'Libellé EN': 'Label EN',
  'Message vocal': 'Voice message',
  'Répéter l’accueil': 'Repeat the greeting',
  'Numéro (Rediriger / File)': 'Number (Forward / Queue)',
  'Aucune option — ajoutez-en pour activer le robot de réception.':
    'No option — add some to switch the reception robot on.',
  '+ Ajouter une option de menu': '+ Add a menu option',

  /* ── LA REDIRECTION ─────────────────────────────────────────────────────── */
  'Redirection (transfert d’appel direct)': 'Forwarding (direct call transfer)',
  'Numéro(s) (séparés par des virgules)': 'Number(s) (comma separated)',
  'Délai de sonnerie (secondes)': 'Ring time (seconds)',
  'Stratégie (si plusieurs numéros)': 'Strategy (if several numbers)',
  "Simultané — tous sonnent en même temps": 'Simultaneous — all ring at once',
  "Cascade — l'un après l'autre": 'Cascade — one after the other',
  'Afficheur lors des transferts': 'Caller ID on transfers',
  'Numéro SANDRIZA (recommandé)': 'SANDRIZA number (recommended)',
  "Numéro réel de l'appelant": 'The caller’s real number',
  'Numéro SANDRIZA : enregistrez votre numéro Twilio comme contact « SANDRIZA » pour voir le nom.':
    'SANDRIZA number: save your Twilio number as a « SANDRIZA » contact to see the name.',
  "Pas de numéro de renvoi pour l'instant — messagerie directe (ne plus avertir)":
    'No forwarding number for now — straight to voicemail (stop warning)',
  'Aucun numéro à composer (onglet Redirection) — les appels iront en messagerie.':
    'No number to dial (Forwarding tab) — calls will go to voicemail.',

  /* ── LA MESSAGERIE VOCALE ───────────────────────────────────────────────── */
  /* ⚠ « puis supprime de Twilio » : le MP3 ne reste nulle part ailleurs que dans
     le courriel. Sans cette phrase on croit pouvoir le retrouver. */
  '🎧 Chaque message vocal est joint en MP3 au courriel ci-dessous, puis supprimé de Twilio. Un courriel valide est requis.':
    '🎧 Each voice message is attached as an MP3 to the email below, then deleted from Twilio. A valid email is required.',
  'Courriel de notification (reçoit le MP3)': 'Notification email (receives the MP3)',
  'Invite — heures ouverture (FR)': 'Prompt — opening hours (FR)',
  'Invite — heures ouverture (EN)': 'Prompt — opening hours (EN)',
  '🌙 Invite hors heures (laisser vide pour reprendre celle du dessus).':
    '🌙 Out-of-hours prompt (leave empty to reuse the one above).',
  'Invite — hors heures (FR)': 'Prompt — out of hours (FR)',
  'Invite — hors heures (EN)': 'Prompt — out of hours (EN)',
  '🎙️ Boîte de réception vocale': '🎙️ Voicemail inbox',
  'Boîte de réception vocale': 'Voicemail inbox',
  'Aucun message vocal.': 'No voice message.',
  '✓ Marquer lu': '✓ Mark as read',
  'Échec de l’envoi courriel': 'Email delivery failed',
  '🎧 Audio envoyé par courriel (MP3), non conservé':
    '🎧 Audio sent by email (MP3), not kept',
  'Message supprimé.': 'Message deleted.',
  'Marqué lu.': 'Marked as read.',

  /* ── LES SMS ────────────────────────────────────────────────────────────── */
  'Réglages SMS': 'SMS settings',
  'Activer les SMS (réponse automatique aux entrants)':
    'Switch SMS on (automatic reply to incoming)',
  'Réponse automatique (FR)': 'Automatic reply (FR)',
  'Réponse automatique (EN)': 'Automatic reply (EN)',
  'Courriel de notification des SMS reçus': 'Notification email for incoming SMS',
  '💬 Messages SMS 🔎 Dans Journaux': '💬 SMS messages 🔎 In Logs',
  'Messages SMS': 'SMS messages',
  'Dans Journaux': 'In Logs',
  'Aucun SMS.': 'No SMS.',
  'Reçu de': 'Received from',
  'Envoyé à': 'Sent to',
  '↩ Répondre': '↩ Reply',
  'SMS supprimé.': 'SMS deleted.',
  'Numéro et message requis.': 'Number and message required.',
  'Envoi du SMS…': 'Sending the SMS…',
  'SMS envoyé.': 'SMS sent.',
  'Échec SMS :': 'SMS failed:',
  'Échec :': 'Failed:',

  /* ── LA FILE D ATTENTE ──────────────────────────────────────────────────── */
  'Activer la file (faire patienter avec musique quand la ligne est occupée)':
    'Switch the queue on (hold with music when the line is busy)',
  'Attente max avant messagerie (minutes)': 'Max wait before voicemail (minutes)',
  'Délai avant la 1re sonnerie (secondes)': 'Delay before the 1st ring (seconds)',
  "Durée de sonnerie de l'agent (secondes)": 'Agent ring time (seconds)',
  'Touche pour laisser un message pendant l’attente':
    'Key to leave a message while holding',
  'Annoncer la position dans la file (« vous êtes en position 2… »)':
    'Announce the position in the queue (« you are number 2… »)',
  'Message d’attente (FR)': 'Hold message (FR)',
  'Message d’attente (EN)': 'Hold message (EN)',

  'Téléphonie enregistrée.': 'Telephony saved.',

  /* ══ CE QUI NE SE TRADUIT PAS, ET POURQUOI C EST ECRIT ICI ══════════════════
   * ⚠⚠⚠ CE SONT LES SUGGESTIONS DES CHAMPS QUE L APPELANTE ENTENDRA. Le champ
   * « Accueil (FR) » montre « Bonjour et merci d avoir appele… » pour dire la
   * FORME du texte a ecrire. Le rendre en anglais suggererait de taper de
   * l anglais dans le message FRANCAIS — et une cliente francophone entendrait
   * l accueil en anglais. Les exemples anglais, eux, sont deja anglais.
   * ➡ Une entree qui rend LE MEME TEXTE est une DECISION, pas un oubli.
   * ══════════════════════════════════════════════════════════════════════════ */
  "Bonjour et merci d'avoir appelé…": "Bonjour et merci d'avoir appelé…",
  'Hello and thank you for calling…': 'Hello and thank you for calling…',
  "Merci d'avoir contacté SANDRIZA. Au revoir !": "Merci d'avoir contacté SANDRIZA. Au revoir !",
  'Thank you for contacting SANDRIZA. Goodbye!': 'Thank you for contacting SANDRIZA. Goodbye!',
  'Nos bureaux sont fermés…': 'Nos bureaux sont fermés…',
  'Our offices are closed…': 'Our offices are closed…',
  'Laissez votre message après le bip…': 'Laissez votre message après le bip…',
  'Leave your message after the tone…': 'Leave your message after the tone…',
  'Nos bureaux sont fermés. Laissez un message…': 'Nos bureaux sont fermés. Laissez un message…',
  'Our offices are closed. Leave a message…': 'Our offices are closed. Leave a message…',
  'Merci pour votre message, nous vous répondrons bientôt.':
    'Merci pour votre message, nous vous répondrons bientôt.',
  "Thanks for your message, we'll reply soon.": "Thanks for your message, we'll reply soon.",
  'Merci de patienter, toutes nos lignes sont occupées…':
    'Merci de patienter, toutes nos lignes sont occupées…',
  'Please hold, all our lines are busy…': 'Please hold, all our lines are busy…',

  /* ⚠ LES INTITULES EXACTS DE LA CONSOLE TWILIO : on les recopie pour qu on les
     retrouve la-bas. Les traduire ferait chercher un champ qui n existe pas. */
  'Account SID': 'Account SID',
  'Auth Token': 'Auth Token',
  'A CALL COMES IN (Voice)': 'A CALL COMES IN (Voice)',
  'A MESSAGE COMES IN (Messaging)': 'A MESSAGE COMES IN (Messaging)',

  /* ⚠ ET LES LIBELLES DES VOIX ANGLAISES, deja en anglais. */
  'Joanna — female, natural (neural)': 'Joanna — female, natural (neural)',
  'Matthew — male, natural (neural)': 'Matthew — male, natural (neural)',
  'Joanna — female (standard)': 'Joanna — female (standard)',
  'Basic Twilio voice': 'Basic Twilio voice',
  /* ── LES CLES TELLES QUE LA SOURCE LES ECRIT ────────────────────────────── */
  'Général': 'General',
  'Chaque message vocal est joint en MP3 au courriel ci-dessous, puis supprimé de Twilio. Un courriel valide est requis.':
    'Each voice message is attached as an MP3 to the email below, then deleted from Twilio. A valid email is required.',
  'Invite hors heures (laisser vide pour reprendre celle du dessus).':
    'Out-of-hours prompt (leave empty to reuse the one above).',
  'Audio envoyé par courriel (MP3), non conservé': 'Audio sent by email (MP3), not kept',
  /* ⚠ Le <b> tombe sur deux mots seulement : on garde la phrase entiere, gras
     compris — c est elle qui dit qu un champ laisse vide CONSERVE le secret. */
  'Enregistré. <b>Vide = conservé.</b>': 'Saved. <b>Empty = kept.</b>',
  'Aucun secret <b>enregistré</b>.': 'No secret <b>saved</b>.',
  /* ⚠ Celui-la est un EXEMPLE d adresse, pas une donnee : il montre la forme
     d un courriel. On le rend dans la forme anglaise usuelle. */
  'vous@exemple.com': 'you@example.com'
};
