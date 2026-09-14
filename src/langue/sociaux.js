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
  'La rédaction a échoué.': 'The writing failed.'
};
