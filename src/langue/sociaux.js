'use strict';

/*
 * RESEAUX SOCIAUX — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE QUI PART D ICI NE REVIENT PAS. Une publication quitte l application
 * pour Facebook, Instagram ou X : elle ne se rattrape pas, et les deux phrases
 * d armement le disent mot pour mot. Elles se traduisent en entier :
 *   · « la publication part chez les réseaux et ne se rattrape pas »
 *   · « les messages partent chez les réseaux et ne se rattrapent pas »
 * Et celle du journal dit l inverse, qui compte autant : « le journal est
 * effacé, MAIS les publications restent en ligne sur les réseaux ».
 *
 * ⚠⚠ LE TEXTE PUBLIE EST DE LA DONNEE, ET IL EST LU PAR LE PUBLIC. Le gabarit
 * d un patron, ses mots-clics et le nom du patron sont TAPES ici et partent tels
 * quels chez les reseaux. Ce dictionnaire ne traduit QUE les etiquettes des
 * champs. ⚠ L exemple de mots-clics reste FRANCAIS (« mode, quebec,
 * nouveaute ») : c est un exemple de ce que la CLIENTELE lira sous la
 * publication, pas un texte d interface. Le nom du patron, lui, ne sort pas de
 * l administration — son exemple suit la langue du poste.
 *
 * ⚠⚠ LES VARIABLES D UN GABARIT (`{produit}`, `{prix}`…) viennent du coeur et ne
 * passent pas par ici : les traduire casserait les gabarits deja ecrits.
 * Les noms de reseaux non plus.
 *
 * ⚠ LES CLES D ETAT (`published`, `partial`, `failed`, `skipped`, `pending`)
 * sont des valeurs ; seuls leurs libelles se lisent.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Réseaux sociaux — Administration Sandriza': 'Social networks — Sandriza Administration',
  'Réseaux sociaux': 'Social networks',
  'Réseaux sociaux indisponibles': 'Social networks unavailable',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux réseaux sociaux.':
    'Your role does not give access to the social networks.',
  'Cette publication n’existe plus.': 'This post no longer exists.',
  'Il n’y a rien à publier.': 'There is nothing to post.',
  'La publication a échoué.': 'The post failed.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',

  /* ── LES ETATS ET LES TUILES ────────────────────────────────────────────── */
  'Publiée': 'Posted',
  'Partielle': 'Partial',
  'Échouée': 'Failed',
  'Ignorée': 'Skipped',
  'En attente': 'Pending',
  'Publiées': 'Posted',
  'Échouées': 'Failed',
  'Ignorées': 'Skipped',
  'aucun réseau': 'no network',
  'aucun réseau branché': 'no network connected',

  /* ── LA FILE ET LE JOURNAL ──────────────────────────────────────────────── */
  'File d’attente': 'Queue',
  'Historique': 'History',
  'Patrons': 'Templates',
  'Comptes et jetons des réseaux : ': 'Network accounts and tokens: ',
  'Comptes et jetons des réseaux :': 'Network accounts and tokens:',
  'Configuration → Communications → Réseaux sociaux':
    'Configuration → Communications → Social networks',
  'Publication': 'Post',
  'image': 'image',
  'Publier': 'Post',
  'Ignorer': 'Skip',
  'Aucune publication en attente.': 'No post pending.',
  'Rien au journal pour l’instant.': 'Nothing in the log yet.',

  /* ══ LES TROIS ARMEMENTS — CE QUI PART NE REVIENT PAS ══════════════════════ */
  'Confirmer l’envoi ?': 'Confirm the send?',
  'Cliquez « Confirmer l’envoi ? » — la publication part chez les réseaux et ne se rattrape pas.':
    'Click « Confirm the send? » — the post goes out to the networks and cannot be taken back.',
  'Confirmer — tout publier ?': 'Confirm — post everything?',
  'Tout publier': 'Post everything',
  'Cliquez de nouveau pour publier toute la file — les messages partent chez les réseaux et ne se rattrapent pas.':
    'Click again to post the whole queue — the messages go out to the networks and cannot be taken back.',
  'Publication…': 'Posting…',
  'Publication de la file…': 'Posting the queue…',
  'Confirmer ?': 'Confirm?',
  'Vider le journal': 'Clear the log',
  /* ⚠⚠ VIDER LE JOURNAL N EFFACE RIEN CHEZ LES RESEAUX : c est tout le sens de
     la phrase, et sans elle on croit retirer des publications. */
  'Cliquez « Confirmer ? » — le journal est effacé, mais les publications restent en ligne sur les réseaux.':
    'Click « Confirm? » — the log is cleared, but the posts stay online on the networks.',
  ' entrées effacées du journal.': ' entries cleared from the log.',
  ' entrée effacée du journal.': ' entry cleared from the log.',
  'entrées effacées du journal.': 'entries cleared from the log.',
  'entrée effacée du journal.': 'entry cleared from the log.',

  /* ── LE BILAN D UNE PUBLICATION EN LOT ──────────────────────────────────── */
  ' publiées': ' posted',
  ' publiée': ' posted',
  ' partielles': ' partial',
  ' partielle': ' partial',
  ' en échec': ' failed',
  'en échec': 'failed',
  ' sur ': ' of ',
  ' » publiée sur tous les réseaux.': ' » posted on all the networks.',
  '» publiée sur tous les réseaux.': '» posted on all the networks.',
  'Envoi partiel — ': 'Partial send — ',
  'Envoi partiel —': 'Partial send —',
  'un réseau': 'one network',
  ' n’a pas reçu la publication. Voir le journal.':
    ' did not receive the post. See the log.',
  'n’a pas reçu la publication. Voir le journal.':
    'did not receive the post. See the log.',
  ' » retirée de la file.': ' » taken out of the queue.',
  '» retirée de la file.': '» taken out of the queue.',

  /* ══ LES PATRONS DE PUBLICATION ════════════════════════════════════════════ */
  'Lecture des patrons…': 'Reading the templates…',
  'Patrons illisibles : ': 'Templates unreadable: ',
  'Patrons illisibles :': 'Templates unreadable:',
  '+ Nouveau patron': '+ New template',
  'Aucun patron.': 'No template.',
  'actif': 'active',
  'inactif': 'inactive',
  'fourni': 'built-in',
  'Aperçu': 'Preview',
  'Désactiver': 'Turn off',
  'Activer': 'Turn on',

  'Nouveau patron': 'New template',
  'Modifier « ': 'Edit « ',
  'Modifier «': 'Edit «',
  'Nom du patron': 'Template name',
  /* Le nom d un patron ne sort pas de l administration : son exemple suit la
     langue du poste. */
  'Annonce d’un nouveau produit': 'A new product announcement',
  'Déclencheur': 'Trigger',
  'Réseaux': 'Networks',
  'Texte publié': 'Posted text',
  'Variables : ': 'Variables: ',
  'Variables :': 'Variables:',
  'Mots-clics': 'Hashtags',
  /* ⚠⚠ L EXEMPLE DE MOTS-CLICS RESTE FRANCAIS : ce sont des mots que la
     CLIENTELE lira sous la publication, pas du texte d interface. Un exemple
     anglais ferait publier des mots-clics anglais sous une boutique
     francophone. Meme raison que les exemples de badge dans promotions.js. */
  'mode, quebec, nouveaute': 'mode, quebec, nouveaute',
  'Séparés par des virgules, sans le croisillon.':
    'Comma separated, without the hash sign.',
  'Joindre l’image du produit': 'Attach the product image',
  'Un patron de publication': 'A publication template',
  'Patron enregistré.': 'Template saved.',
  'Patron désactivé.': 'Template turned off.',
  'Patron activé.': 'Template turned on.',
  /* ⚠ Ce qui disparait, et ce qui ne disparait pas. */
  'Recliquez pour confirmer — le gabarit disparaît. Les publications déjà faites ne bougent pas.':
    'Click again to confirm — the template disappears. The posts already made do not move.',
  'Patron supprimé.': 'Template deleted.',

  /* ── L APERCU ───────────────────────────────────────────────────────────── */
  'Composition de l’aperçu…': 'Composing the preview…',
  'Aperçu — ': 'Preview — ',
  'Aperçu —': 'Preview —',
  'exemple : ': 'example: ',
  'exemple :': 'example:',
  'aucun produit actif pour l’exemple': 'no active product for the example',
  'aucun réseau — ce patron ne publiera nulle part':
    'no network — this template will post nowhere',

  /* ══ L EPINGLE PINTEREST (#115, 2026-09-14) ═══════════════════════════════
     ⚠ << Épingle >> se dit << Pin >> : c est le mot de Pinterest lui-meme, pas
     une traduction libre. Un anglophone qui lirait << Pinterest clip >> ne
     reconnaitrait pas l objet qu il manipule tous les jours.
     ⚠ << Description (elle sert à être trouvée) >> garde sa parenthese dans les
     deux langues, et ce n est pas du bavardage : c est la seule phrase de
     l ecran qui dit POURQUOI cette description n est pas un texte de magazine.
     Pinterest est un moteur de recherche ; qui l ignore ecrit joli et n est
     jamais trouve.
     ⚠ Les DIMENSIONS ne se traduisent pas (1000 x 1500), et << px >> non plus. */
  'Épingle Pinterest': 'Pinterest pin',
  'Écrire l’épingle avec l’IA': 'Write the pin with AI',

  /* ── LE CHOIX DU RESEAU (#115 — Facebook et Instagram) ──────────────────── */
  /* ⚠ LES NOMS DES RESEAUX NE SE TRADUISENT PAS : Pinterest, Instagram et
     Facebook s appellent pareil dans les deux langues, et ils viennent du coeur
     comme des DONNEES, pas comme des textes.
     ⚠ << Mots-clics >> est le terme quebecois pour hashtags — il reste, et son
     equivalent anglais est bien << hashtags >>, pas << key words >> : ce sont
     deux objets differents, et Pinterest emploie les seconds la ou Instagram
     emploie les premiers. C est justement pour ca que l ecran change de mot
     selon le reseau. */
  'Publication IA': 'AI post',
  'Écrire avec l’IA pour ': 'Write with AI for ',
  'Rédiger': 'Write',
  'Publication rédigée : ': 'Post written: ',
  'Texte de la publication': 'Post text',
  'Mots-clics : ': 'Hashtags: ',
  'Aperçu de la publication': 'Post preview',
  'Enregistrer la publication': 'Save the post',
  'Texte de la publication copié.': 'Post text copied.',
  'px · le format que ': 'px · the format ',
  ' montre en entier': ' shows in full',
  'Le modèle n’a rien produit d’utilisable. Reformulez la demande.':
    'The model produced nothing usable. Reword the request.',
  /* ⚠ LA PHRASE QUI EVITE UNE VRAIE FAUTE : Instagram ne rend AUCUNE adresse
     cliquable dans une legende. Ecrire << cliquez ici >> y envoie les gens
     taper une adresse a la main, ou renoncer. L anglais doit le dire aussi net. */
  'Ce réseau ne rend pas les liens cliquables : mettez l’adresse dans la bio du compte.':
    'This network does not make links clickable: put the address in the account bio.',
  'Lien : à mettre dans la bio du compte': 'Link: to be put in the account bio',

  /* ── LA SUITE DE DIAPOS (#115 — TikTok) ─────────────────────────────────── */
  /* ⚠ << Diapo >> se dit << Slide >>, et c est le mot que TikTok emploie
     lui-meme dans les deux langues. << Sheet >> ou << Frame >> ferait chercher
     un objet qui n existe pas dans l application ou l on va deposer le travail. */
  'Diapo ': 'Slide ',
  'Ajouter une diapo': 'Add a slide',
  'Retirer cette diapo': 'Remove this slide',
  'image(s) et le texte': 'image(s) and the text',
  /* ⚠ << Enregistré partiellement >> N EST PAS UN SUCCES QU ON NUANCE : une
     suite exportee a trois images sur cinq est un travail a refaire, et la
     phrase doit le dire assez fort pour qu on rouvre le dossier. */
  'Enregistré partiellement : ': 'Partly saved: ',
  'image(s) sur ': 'image(s) out of ',

  /* ── L ENVOI PAR COURRIEL (#115) ────────────────────────────────────────── */
  /* ⚠ << à enregistrer sur le téléphone >> est la phrase la plus utile de
     l ecran, et elle doit rester aussi concrete en anglais : elle dit POURQUOI
     les images sont en pieces jointes plutot que dans le corps du message.
     Instagram et TikTok ne se publient pas depuis un ordinateur ; ce courriel
     est le pont. */
  'Envoyer par courriel': 'Send by email',
  'Envoyer': 'Send',
  'votre@courriel.com': 'your@email.com',
  'Les images partent en pièces jointes, à enregistrer sur le téléphone.':
    'The images go as attachments, to be saved on the phone.',
  'Aucune clé Resend : l’envoi de courriel n’est pas configuré.':
    'No Resend key: email sending is not configured.',
  'Préparation des images…': 'Preparing the images…',
  'Envoi…': 'Sending…',
  'Envoyé à ': 'Sent to ',
  'image(s)': 'image(s)',
  'non rendue(s)': 'not rendered',
  '· ': '· ',
  'Indiquez une adresse courriel.': 'Enter an email address.',
  'Cette adresse ne ressemble pas à une adresse courriel : ':
    'This does not look like an email address: ',
  'Aucune clé Resend n’est enregistrée. Elle se pose dans Configuration ▸ Clés API.':
    'No Resend key is saved. It is set in Configuration ▸ API keys.',
  'Aucune image à envoyer.': 'No image to send.',
  'Le message est trop lourd (': 'The message is too heavy (',
  '). Retirez des diapos, ou envoyez-les en deux fois.':
    '). Remove some slides, or send them in two goes.',
  'L’envoi a échoué : ': 'Sending failed: ',
  // ⚠ Le séparateur : sans entrée, le relevé le compte comme du français resté
  // sur la page anglaise. Il ne change pas de forme, il doit quand même être là.
  ' — ': ' — ',
  'Simple': 'Simple',
  'Avancé': 'Advanced',
  'Lecture du catalogue…': 'Reading the catalogue…',
  'Produit mis en avant': 'Featured product',
  '— aucun produit —': '— no product —',
  'Que faut-il annoncer ?': 'What should it announce?',
  'ex. la coupe et la matière de ce manteau, pour l’automne':
    'e.g. the cut and the fabric of this coat, for the fall',
  'Ton': 'Tone',
  'Chaleureux': 'Warm',
  'Élégant': 'Elegant',
  'Enjoué': 'Playful',
  'Pressant': 'Urgent',
  'Langue': 'Language',
  'Français': 'French',
  'Anglais': 'English',
  'Consignes supplémentaires': 'Extra instructions',
  'ex. viser la recherche « manteau de laine Québec »':
    'e.g. aim for the search “wool coat Quebec”',
  'Rédiger l’épingle': 'Write the pin',
  'Rédaction…': 'Writing…',
  'Rédaction en cours — cela prend une dizaine de secondes.':
    'Writing under way — this takes about ten seconds.',
  'Épingle rédigée : ': 'Pin written: ',
  'prête': 'ready',
  ' ce mois-ci': ' this month',
  ' ce mois-ci (aucun plafond)': ' this month (no ceiling)',

  'Sur-titre (dans l’image)': 'Kicker (in the image)',
  'Accroche (dans l’image)': 'Headline (in the image)',
  'Précision (dans l’image)': 'Detail (in the image)',
  'Titre de l’épingle': 'Pin title',
  'Description (elle sert à être trouvée)': 'Description (it is what gets you found)',
  'Texte de remplacement de l’image': 'Image alternative text',
  'Lien de destination': 'Destination link',
  'Mots de recherche : ': 'Search words: ',

  'Aperçu de l’épingle': 'Pin preview',
  'Rendu…': 'Rendering…',
  'Choisissez un produit, ou écrivez une accroche.': 'Choose a product, or write a headline.',
  'px · format 2:3, le seul que Pinterest montre en entier':
    'px · 2:3, the only format Pinterest shows in full',
  'Enregistrer l’épingle': 'Save the pin',
  'Copier le texte': 'Copy the text',
  'Ouvrir le dossier des exports': 'Open the exports folder',
  'Enregistré : ': 'Saved: ',
  '.png et .txt': '.png and .txt',
  'Lien : ': 'Link: ',
  'Texte de remplacement : ': 'Alternative text: ',
  'Titre, description et lien copiés.': 'Title, description and link copied.',
  'Copie refusée — utilisez Ctrl+C.': 'Copy refused — use Ctrl+C.',
  'Aucune image à enregistrer.': 'No image to save.',
  'L’image n’a pas pu être enregistrée.': 'The image could not be saved.',
  'Image enregistrée, mais pas son texte.': 'Image saved, but not its text.',

  'Dites d’abord ce qu’il faut annoncer.': 'First say what it should announce.',
  'Aucune clé d’écriture IA n’est enregistrée. Elle se pose dans Configuration ▸ Clés API.':
    'No AI writing key is saved. It is set in Configuration ▸ API keys.',
  'Le plafond mensuel d’écriture IA est atteint. Il se règle dans Configuration ▸ Clés API.':
    'The monthly AI writing ceiling has been reached. It is set in Configuration ▸ API keys.',
  'Le modèle n’a produit ni titre ni accroche. Reformulez la demande.':
    'The model produced neither a title nor a headline. Reword the request.',
  'Cette photo ne peut pas être relue pour l’export.':
    'This photo cannot be read back for the export.',
  'La réponse du modèle n’a pas pu être lue. Réessayez.':
    'The model’s answer could not be read. Try again.',
  'Vous n’avez pas le droit de composer des publications.':
    'You are not allowed to compose posts.',
  'La passerelle d’écriture IA est injoignable.': 'The AI writing gateway cannot be reached.',
  'La rédaction a échoué.': 'The writing failed.',

  /* ── LES ETIQUETTES DU COMPOSITEUR ET LES COMPTES RENDUS (2026-09-18) ────
     ⚠ La plupart de ces textes se terminent par deux-points ou une preposition :
     ce qui suit est une DONNEE ecrite apres (un nom de reseau, une adresse, un
     nombre, le texte redige). Ils sont donc coupes exprès, et ne doivent pas
     etre recolles — sinon la donnee passerait par le dictionnaire.
     ⚠ << px · le format que >> … << montre en entier >> encadrent un nom de
     reseau : deux entrees pour une phrase, parce que le nom s intercale.
     ⚠ << ce mois-ci >> existe en deux versions, comme dans campagnes : seule, et
     suivie de sa parenthese. Ce n est pas un doublon. */
  'Écrire avec l’IA pour': 'Write with AI for',
  'Diapo': 'Slide',
  'Mots de recherche :': 'Search words:',
  'Mots-clics :': 'Hashtags:',
  'px · le format que': 'px · the size that',
  'montre en entier': 'shows in full',
  'ce mois-ci': 'this month',
  'ce mois-ci (aucun plafond)': 'this month (no cap)',
  'Cette adresse ne ressemble pas à une adresse courriel :':
    'This does not look like an email address:',
  'L’envoi a échoué :': 'Sending failed:',
  'Publication rédigée :': 'Post written:',
  'Lien :': 'Link:',
  'Texte de remplacement :': 'Alt text:',
  'Enregistré :': 'Saved:',
  'Enregistré partiellement :': 'Partly saved:',
  'image(s) sur': 'image(s) of',
  'Envoyé à': 'Sent to',
  /* Accords selon le nombre (2026-09-29) — remplacent les « (s) ». */
  'image et le texte': 'image and the text',
  'images et le texte': 'images and the text',
  'image sur': 'image out of',
  'images sur': 'images out of',
  'images': 'images',
  'non rendue': 'not rendered',
  'non rendues': 'not rendered',
  // 2026-10-15 : confirmations en boîte à part.
  'Publier toute la file': 'Post the entire queue',
  'Toutes les publications en attente seront envoyées aux réseaux sociaux configurés. Une publication envoyée ne peut pas être retirée depuis l’application.': 'All pending posts will be sent to the configured social networks. A post that has been sent cannot be withdrawn from the application.',
  'Publications': 'Posts',
  'Vider le journal des publications': 'Clear the posting log',
  'Toutes les entrées du journal seront effacées définitivement. Les publications déjà parues restent en ligne sur les réseaux. Cette action est irréversible.': 'All log entries will be permanently deleted. Posts already published remain online on the networks. This action cannot be undone.',
  'Entrées': 'Entries',
  'Supprimer le patron': 'Delete template',
  'Le patron': 'The template',
  'sera supprimé définitivement. Les publications déjà faites ne sont pas touchées. Cette action est irréversible.': 'will be permanently deleted. Posts already published are not affected. This action cannot be undone.',
  'Publier sur les réseaux sociaux': 'Post to social networks',
  'La publication': 'The post',
  'sera envoyée aux réseaux sociaux. Une publication envoyée ne peut pas être retirée depuis l’application.': 'will be sent to the social networks. A post that has been sent cannot be withdrawn from the application.',
  // La Publication IA en trois étapes (2026-10-16).
  'titre, ': 'title, ',
  'description': 'description',
  ' et lien': ' and link',
  'Pour quel réseau ?': 'Which network?',
  ' à ': ' to ',
  'diapos': 'slides',
  'Que voulez-vous annoncer ?': 'What do you want to announce?',
  'Produit': 'Product',
  'L’idée, en une phrase': 'The idea, in one sentence',
  'Masquer les options ▴': 'Hide options ▴',
  'Ton, langue et consignes ▾': 'Tone, language and instructions ▾',
  'Le texte': 'The text',
  'tout se corrige à la main': 'everything can be edited by hand',
  'Sur l’image': 'On the image',
  'Sur-titre': 'Overline',
  'Accroche': 'Headline',
  'Précision': 'Detail',
  'Dossier des exports': 'Exports folder',
  'Vers le téléphone': 'To your phone',
  'Images en pièces jointes, texte prêt à coller.': 'Images as attachments, text ready to paste.',
  // (2026-11-22) Lot 1 : quatre réseaux d'un geste, carrousel, mots-clics, A/B.
  'Produit ou carrousel': 'Product or carousel',
  'Carrousel d’une collection (5 produits)': 'Collection carousel (5 products)',
  'Carrousel · ': 'Carousel · ',
  'Un produit': 'One product',
  'Publication rédigée pour ce réseau': 'Post written for this network',
  'Rédiger pour les 4 réseaux d’un geste': 'Write for all 4 networks at once',
  'Accroche à tester': 'Headline to test',
  'Enregistrer les ': 'Save the ',
  ' publications': ' posts',
  ' (A et B)': ' (A and B)',
  'Mots de recherche': 'Search keywords',
  'Proposés :': 'Suggested:',
  'Retirer': 'Remove',
  '+ ajouter (Entrée)': '+ add (Enter)',
  'Ajouter un mot-clic': 'Add a hashtag',
  'Rédaction pour les 4 réseaux — une vingtaine de secondes…': 'Writing for the 4 networks — about twenty seconds…',
  ' publications rédigées sur ': ' posts written out of ',
  'Publication rédigée': 'Post written',
  ' — en échec : ': ' — failed: ',
  'publication': 'post',
  'publications': 'posts',
  ' (images et texte)': ' (images and text)',
  // (2026-11-22) Lot 2 : planifier, alerte stock, recyclage, liens suivis, performances.
  "Le produit est en rupture : elle ne partira pas avant son retour en stock.": "The product is out of stock: it will not go out until it is back in stock.",
  "Produit en rupture": "Out of stock",
  "Prévue le ": "Scheduled for ",
  "Lien suivi : clics et ventes mesurés": "Tracked link: clicks and sales measured",
  "lien suivi": "tracked link",
  "Relâcher": "Release",
  "Retenue": "On hold",
  "Publication relâchée : elle partira à son heure.": "Post released: it will go out at its scheduled time.",
  "Performances": "Performance",
  "Lecture des liens suivis…": "Reading tracked links…",
  "Clics": "Clicks",
  "Ventes": "Sales",
  "Revenu": "Revenue",
  "Mots-clics qui rapportent :": "Hashtags that pay off:",
  "clics": "clicks",
  "ventes": "sales",
  "Aucun lien suivi pour l’instant : planifiez une publication depuis la Publication IA, le lien se pose tout seul.": "No tracked links yet: schedule a post from AI post and the link is added automatically.",
  "gagnante": "winner",
  "moins bonne": "weaker",
  "Moins de 10 clics en tout : trop tôt pour départager.": "Fewer than 10 clicks in total: too early to tell.",
  "trop tôt": "too early",
  "Réseau": "Network",
  "Créé": "Created",
  "À recycler :": "To recycle:",
  "De retour · ": "Back · ",
  "Succès · ": "Hit · ",
  "Réécrire": "Rewrite",
  "Republier": "Repost",
  "Clics et ventes de cette publication mesurés dans Performances": "Clicks and sales of this post measured in Performance",
  "Lien suivi (clics et ventes)": "Tracked link (clicks and sales)",
  "Planifier": "Schedule",
  "Par courriel": "By email",
  "Date": "Date",
  "Heure": "Time",
  "Meilleurs moments (vos ventes) :": "Best times (your sales):",
  "Moments conseillés :": "Suggested times:",
  "dim.": "Sun",
  "lun.": "Mon",
  "mar.": "Tue",
  "mer.": "Wed",
  "jeu.": "Thu",
  "ven.": "Fri",
  "sam.": "Sat",
  "Choisissez une date et une heure.": "Choose a date and a time.",
  "Cette heure est déjà passée.": "That time has already passed.",
  "Planification…": "Scheduling…",
  "publication planifiée": "post scheduled",
  "publications planifiées": "posts scheduled",
  "retenue (produit en rupture)": "on hold (out of stock)",
  "retenues (produit en rupture)": "on hold (out of stock)",
  "Rien n’a été planifié : ": "Nothing was scheduled: ",
  "De retour en stock : ": "Back in stock: ",
  "On le remet de l’avant : ": "Featuring again: ",
  "Prêt à réécrire : vérifiez l’idée, puis « Rédiger ».": "Ready to rewrite: check the idea, then “Write”.",
  "Republiée : elle reprend sa place dans la file.": "Reposted: it is back in the queue.",
  'A/B': 'A/B',
  // (2026-11-22) Lot 3 : mise en scène IA et vidéo courte.
  " · photo mise en scène par l’IA": " · photo staged by AI",
  "Vidéo": "Video",
  "Courriel": "Email",
  "Studio ivoire": "Ivory studio",
  "Automne": "Autumn",
  "Hiver": "Winter",
  "Printemps": "Spring",
  "Été": "Summer",
  "Fêtes": "Holidays",
  "Vieux-Montréal": "Old Montreal",
  "Ambiance de la mise en scène": "Staging mood",
  "Le vêtement reste identique ; seul le décor change. Environ 0,04 $ l’image.": "The garment stays identical; only the setting changes. About $0.04 per image.",
  "Choisissez d’abord un produit avec une photo.": "First choose a product with a photo.",
  "Mise en scène…": "Staging…",
  "Mise en scène IA · 0,04 $": "AI staging · $0.04",
  "Revenir à la photo d’origine": "Back to the original photo",
  "Choisissez un produit : la vidéo part de sa photo (ou de la mise en scène).": "Choose a product: the video starts from its photo (or the staging).",
  "Fabrication en cours": "Being made",
  " · place en file : ": " · queue position: ",
  " — 1 à 3 minutes. Vous pouvez continuer ailleurs.": " — 1 to 3 minutes. You can keep working elsewhere.",
  "La vidéo de 5 s est prête (sans son). Elle est aussi proposée dans la fiche du produit.": "The 5-second video is ready (no sound). It is also offered on the product page.",
  "Enregistrer la vidéo (.mp4)": "Save the video (.mp4)",
  "La dernière vidéo a échoué : ": "The last video failed: ",
  "Créer la vidéo 5 s · 0,42 $": "Create 5-s video · $0.42",
  "à partir de la mise en scène": "from the staging",
  "à partir de la photo du produit": "from the product photo",
  "Lancement de la vidéo…": "Starting the video…",
  "Vidéo lancée : 1 à 3 minutes.": "Video started: 1 to 3 minutes.",
  "Une autre vidéo pour ce produit ?": "Another video for this product?",
  "Ce produit a déjà des vidéos générées. Chacune est facturée.": "This product already has generated videos. Each one is billed.",
  "Déjà faites": "Already made",
  "Coût": "Cost",
  "Créer quand même": "Create anyway",
  "Limite atteinte : 3 vidéos en 24 heures pour ce produit.": "Limit reached: 3 videos in 24 hours for this product.",
  "Une vidéo de ce produit est déjà en cours.": "A video for this product is already in progress.",
  "Mise en scène en cours — une quinzaine de secondes…": "Staging in progress — about fifteen seconds…",
  "Mise en scène prête : ": "Staging ready: ",
  "Ce produit n’a pas de photo à mettre en scène.": "This product has no photo to stage.",
  "Votre rôle ne permet pas de traiter les photos.": "Your role does not allow processing photos.",
  "Téléchargement de la vidéo…": "Downloading the video…",
  "Vidéo enregistrée : ": "Video saved: ",
  "La vidéo n’a pas pu être enregistrée.": "The video could not be saved.",
  'photo mise en scène par l’IA': 'photo staged by AI',
  'place en file : ': 'queue position: ',
};
