'use strict';

/*
 * MODE LANCEMENT — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE BOUTON REND LA BOUTIQUE VISIBLE PAR GOOGLE. C est le geste le plus
 * irreversible de l administration : une page indexee ne se desindexe pas d un
 * clic. Trois phrases portent tout, et aucune ne se resume :
 *   · « Le site est protégé contre l’indexation. Seules les personnes ayant le
 *     lien direct peuvent le visiter. » (ce que protege le pre-lancement)
 *   · « Cliquez encore pour rendre le site PUBLIC et indexable. » (l armement)
 *   · « robots.txt — servi par Cloudflare, PAS par ce site : ce bouton ne le
 *     change pas. » (ce que le bouton NE fait pas)
 *
 * ⚠⚠ ET LA PLUS SUBTILE : l etat DURABLE n est pas le bouton, c est la variable
 * `ELG_LAUNCHED` de Render. Le bouton pose un fichier — effet immediat — mais
 * chaque deploiement reconstruit le serveur et repose le drapeau selon la
 * variable. Sans elle, le defaut est « pré-lancement ». Perdre cette phrase,
 * c est lancer le site et le voir se refermer au prochain deploiement.
 *
 * ⚠ LES NOMS TECHNIQUES NE SE TRADUISENT PAS : `robots.txt`, `X-Robots-Tag`,
 * `meta robots`, `launch.flag`, `ELG_LAUNCHED`, `X-Frame-Options`, `CSP`,
 * `.env`, `Dockerfile`, `CLAUDE.md`, et les valeurs `noindex, nofollow`. Ce sont
 * les mots qu on tape dans Render ou qu on lit dans un en-tete HTTP.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Mode lancement — Administration Sandriza': 'Launch mode — Sandriza Administration',
  'Mode lancement': 'Launch mode',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can view, not change.',
  'Lecture de l’état du serveur…': 'Reading the server state…',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  'État du serveur indisponible (endpoint injoignable).':
    'Server state unavailable (endpoint unreachable).',
  /* ⚠ L apostrophe DROITE : la source ecrit ces deux-la entre guillemets
     doubles. */
  "La fenêtre principale n'a pas répondu à temps.": 'The main window did not answer in time.',
  "L'opération a échoué.": 'The operation failed.',
  'Le serveur a refusé le changement.': 'The server refused the change.',
  'Erreur réseau en joignant le serveur.': 'Network error reaching the server.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',

  /* ══ L ETAT ET LE BOUTON ═══════════════════════════════════════════════════ */
  'En ligne': 'Online',
  'Pré-lancement': 'Pre-launch',
  'Le site est visible par les moteurs de recherche et les visiteurs.':
    'The site is visible to search engines and visitors.',
  /* ⚠⚠ CE QUE PROTEGE LE PRE-LANCEMENT, et ce qu il ne protege pas : le lien
     direct marche toujours. */
  'Le site est protégé contre l’indexation. Seules les personnes ayant le lien direct peuvent le visiter.':
    'The site is protected from indexing. Only people with the direct link can visit it.',
  'Repasser en pré-lancement': 'Back to pre-launch',
  'Lancer le site au public': 'Launch the site publicly',
  'Confirmer le lancement PUBLIC ?': 'Confirm the PUBLIC launch?',
  'Cliquez encore pour rendre le site PUBLIC et indexable.':
    'Click again to make the site PUBLIC and indexable.',
  'Lancement…': 'Launching…',
  'Retour en pré-lancement…': 'Going back to pre-launch…',
  'Site EN LIGNE au public.': 'Site ONLINE to the public.',
  'Mode pré-lancement activé.': 'Pre-launch mode turned on.',

  /* ══ LA VARIABLE QUI SURVIT AUX DEPLOIEMENTS ═══════════════════════════════ */
  '✗ Incohérence : la variable Render <code>ELG_LAUNCHED=':
    '✗ Mismatch: the Render variable <code>ELG_LAUNCHED=',
  '✗ Incohérence : la variable Render ELG_LAUNCHED=':
    '✗ Mismatch: the Render variable ELG_LAUNCHED=',
  '</code> dit le contraire de l’état actuel. Le prochain déploiement suivra la variable.':
    '</code> says the opposite of the current state. The next deployment will follow the variable.',
  'dit le contraire de l’état actuel. Le prochain déploiement suivra la variable.':
    'says the opposite of the current state. The next deployment will follow the variable.',
  ' État piloté par la variable Render <code>ELG_LAUNCHED=':
    ' State driven by the Render variable <code>ELG_LAUNCHED=',
  '🔗 État piloté par la variable Render ELG_LAUNCHED=':
    '🔗 State driven by the Render variable ELG_LAUNCHED=',
  '</code> — il survit aux déploiements.': '</code> — it survives deployments.',
  '— il survit aux déploiements.': '— it survives deployments.',
  ' Aucune variable <code>ELG_LAUNCHED</code> dans Render : l’état actuel est un simple fichier, effacé au prochain déploiement. Ajoutez-la dans Render pour le rendre durable.':
    ' No <code>ELG_LAUNCHED</code> variable in Render: the current state is a plain file, erased at the next deployment. Add it in Render to make it last.',
  '⚠ Aucune variable ELG_LAUNCHED dans Render : l’état actuel est un simple fichier, effacé au prochain déploiement. Ajoutez-la dans Render pour le rendre durable.':
    '⚠ No ELG_LAUNCHED variable in Render: the current state is a plain file, erased at the next deployment. Add it in Render to make it last.',

  /* ══ LES MESURES DE PROTECTION ═════════════════════════════════════════════
   * ⚠⚠ « robots.txt est servi par Cloudflare, PAS par ce site » : sans cette
   * ligne, on croit que le bouton s en occupe. */
  'Mesures de protection': 'Protection measures',
  'servi par Cloudflare, pas par ce site : ce bouton ne le change pas':
    'served by Cloudflare, not by this site: this button does not change it',
  'X-Robots-Tag HTTP': 'X-Robots-Tag HTTP',
  'en-tête retiré': 'header removed',
  'noindex, nofollow sur toutes les pages': 'noindex, nofollow on every page',
  'Meta robots HTML': 'Meta robots HTML',
  'balise retirée': 'tag removed',
  'noindex dans chaque page': 'noindex in every page',
  'En-têtes de sécurité': 'Security headers',
  'X-Frame-Options, CSP, XSS-Protection (toujours actifs)':
    'X-Frame-Options, CSP, XSS-Protection (always on)',
  'Fichiers sensibles': 'Sensitive files',
  '.env, Dockerfile, CLAUDE.md inaccessibles (toujours actif)':
    '.env, Dockerfile, CLAUDE.md unreachable (always on)',

  /* ══ COMMENT LE BOUTON FONCTIONNE — ET CE QUI DURE ═════════════════════════ */
  'ℹ Comment fonctionne le bouton.': 'ℹ How the button works.',
  'ℹ Comment fonctionne le bouton. Il crée ou supprime un fichier':
    'ℹ How the button works. It creates or removes a',
  ' Il crée ou supprime un fichier ': ' It creates or removes a ',
  ' Il crée ou supprime un fichier': ' It creates or removes a',
  '<code>launch.flag</code> sur le serveur, qui pilote l’en-tête <code>X-Robots-Tag</code> et la balise ':
    '<code>launch.flag</code> file on the server, which drives the <code>X-Robots-Tag</code> header and the ',
  'launch.flag sur le serveur, qui pilote l’en-tête X-Robots-Tag et la balise':
    'launch.flag file on the server, which drives the X-Robots-Tag header and the',
  '<code>meta robots</code> — effet immédiat, sans redéploiement. <b>Mais l’état durable, c’est la variable ':
    '<code>meta robots</code> tag — immediate, with no redeployment. <b>But the lasting state is the ',
  'meta robots — effet immédiat, sans redéploiement. Mais l’état durable, c’est la variable':
    'meta robots tag — immediate, with no redeployment. But the lasting state is the',
  'Render <code>ELG_LAUNCHED</code></b> : chaque déploiement reconstruit le serveur et repose le drapeau selon ':
    'Render <code>ELG_LAUNCHED</code> variable</b>: every deployment rebuilds the server and sets the flag from ',
  'Render ELG_LAUNCHED : chaque déploiement reconstruit le serveur et repose le drapeau selon':
    'Render ELG_LAUNCHED variable: every deployment rebuilds the server and sets the flag from',
  'elle. Pour lancer <b>pour de bon</b> : <code>ELG_LAUNCHED=1</code> dans Render. Sans elle, le défaut est ':
    'it. To launch <b>for good</b>: <code>ELG_LAUNCHED=1</code> in Render. Without it, the default is ',
  'elle. Pour lancer pour de bon : ELG_LAUNCHED=1 dans Render. Sans elle, le défaut est':
    'it. To launch for good: ELG_LAUNCHED=1 in Render. Without it, the default is',
  '« pré-lancement ».': '« pre-launch ».',

  /* ── LA LISTE VIP DU PRELANCEMENT (2026-10-07) ─────────────────────────────
     ⚠ Aucune apostrophe DROITE dans ces valeurs : elles sont posees entre
     guillemets simples dans le script de la fenetre. « Inscrites » : la
     clientele est feminine, l anglais dit simplement « sign-ups ». */
  'Liste VIP': 'VIP list',
  'Lecture de la liste VIP…': 'Reading the VIP list…',
  'Page « Liste VIP » active — le lien paraît dans le pied de page de la boutique.':
    '« VIP list » page active — the link appears in the shop footer.',
  'Titre (français)': 'Title (French)',
  'Titre (anglais)': 'Title (English)',
  'Texte (français)': 'Text (French)',
  'Texte (anglais)': 'Text (English)',
  'Rabais (%)': 'Discount (%)',
  'Validité du code (jours)': 'Code validity (days)',
  'Inscrites VIP :': 'VIP sign-ups:',
  'Codes envoyés :': 'Codes sent:',
  'À envoyer :': 'To send:',
  'Comptes indisponibles :': 'Counts unavailable:',
  'Le site n’est pas encore lancé : les codes partent le jour de l’ouverture, une fois le site en ligne.':
    'The site is not launched yet: the codes go out on opening day, once the site is live.',
  'Aucun code à envoyer : chaque inscrite a déjà reçu le sien.':
    'No codes to send: every sign-up has already received hers.',
  'Envoyer les codes VIP': 'Send the VIP codes',
  'Confirmer l’envoi des codes ?': 'Confirm sending the codes?',
  'Chaque code est unique, à usage unique et valable sur une commande. Il ne part qu’une fois par adresse, même si vous recliquez.':
    'Each code is unique, single-use and valid on one order. It is sent only once per address, even if you click again.',
  'Enregistrement de la liste VIP…': 'Saving the VIP list…',
  'Enregistrée sur ce poste, mais pas dans le nuage : réessayez.':
    'Saved on this computer, but not in the cloud: try again.',
  'Liste VIP enregistrée.': 'VIP list saved.',
  'Cliquez encore pour envoyer un courriel à chaque inscrite VIP.':
    'Click again to send an email to every VIP sign-up.',
  'Envoi des codes VIP… cela peut prendre quelques minutes.':
    'Sending the VIP codes… this may take a few minutes.',
  '· déjà reçus :': '· already received:',
  '· échecs :': '· failures:',
  '· restants :': '· remaining:',
  'Envoi partiel : cliquez de nouveau pour reprendre ce qui reste.':
    'Partial send: click again to resume what remains.',
  'Codes VIP envoyés.': 'VIP codes sent.',
  'Le site n’est pas lancé : le serveur refuse l’envoi des codes.':
    'The site is not launched: the server refuses to send the codes.',
  'L’envoi des codes est réservé aux administrateurs.':
    'Sending the codes is reserved for administrators.',
  'Aucune clé Resend configurée (Infolettre) : aucun courriel ne peut partir.':
    'No Resend key configured (Newsletter): no email can be sent.',
  'Déploiement d’essai : aucun courriel ne part d’ici.':
    'Test deployment: no email is sent from here.'
};
