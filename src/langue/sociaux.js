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
    'no network — this template will post nowhere'
};
