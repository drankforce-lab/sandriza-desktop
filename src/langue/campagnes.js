'use strict';

/*
 * CAMPAGNES ET CHAINES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN ENVOIE DES COURRIELS ET DES SMS A DE VRAIES CLIENTES, ET UN
 * ENVOI NE SE RATTRAPE PAS. Les phrases qui l empechent gardent leur fermete :
 *   · « une campagne ne s envoie pas deux fois » ;
 *   · « ces etapes partiront pour de bon » / « sans retour possible » ;
 *   · « ne fermez pas cette fenetre » pendant un envoi ;
 *   · « l envoi peut avoir continue : verifiez le journal avant de recommencer »
 *     — celle-la evite d envoyer DEUX FOIS apres un delai depasse ;
 *   · « les traiter dans cet etat abandonnerait les inscriptions sans rien
 *     envoyer » — une perte silencieuse d inscriptions.
 *
 * ⚠⚠ LE CONSENTEMENT EST UNE REGLE DE DROIT, PAS UNE NUANCE : « un segment ne
 * fait que RESTREINDRE la liste des abonnees actives : il ne peut jamais
 * joindre quelqu un qui n a pas consenti ». La phrase ne se resume pas.
 *
 * ⚠⚠ LES VARIABLES NE SE TRADUISENT JAMAIS. `{{firstName}}`, `{{panier}}`,
 * `{{shopUrl}}` sont remplacees par le SERVEUR : traduire le nom d une variable
 * la rendrait introuvable, et le courriel partirait avec le texte brut a la
 * place du prenom de la cliente.
 *
 * ⚠ ET LES LISTES QUI VIENNENT DU SITE NE SONT PAS ICI : types de blocs,
 * declencheurs, segments et modeles arrivent du serveur avec LEURS libelles.
 *
 * ⚠ « Resend » et « Twilio » sont des noms de services. « STOP » et « AIDE »
 * sont les mots-cles que Twilio reconnait dans un SMS entrant : les traduire
 * ferait croire qu on peut repondre autre chose.
 */

module.exports = {
  /* ── L EN-TETE ──────────────────────────────────────────────────────────── */
  'Campagnes et chaînes — Administration Sandriza':
    'Campaigns and sequences — Sandriza Administration',
  'Campagnes et chaînes': 'Campaigns and sequences',
  'Chaînes automatisées': 'Automated sequences',
  'Campagnes indisponibles': 'Campaigns unavailable',
  'Chaînes indisponibles': 'Sequences unavailable',
  'Segments indisponibles': 'Segments unavailable',
  'Vous êtes en consultation seulement.': 'You have view-only access.',

  /* ── LES REFUS ──────────────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès à l’infolettre.':
    'Your role does not give access to the newsletter.',
  /* ⚠⚠ CELLE-LA EVITE D ENVOYER DEUX FOIS. Elle ne se resume pas. */
  'La fenêtre principale n’a pas répondu à temps. L’envoi peut avoir continué : vérifiez le journal d’envoi avant de recommencer.':
    'The main window did not answer in time. The send may have carried on: check the send log before starting over.',
  'Cet élément n’existe plus.': 'This item no longer exists.',
  'Cette campagne est déjà partie. Une campagne ne s’envoie pas deux fois.':
    'This campaign has already gone out. A campaign is not sent twice.',
  'Aucune clé Resend n’est configurée : rien ne peut partir. Écran Infolettre, onglet Configuration.':
    'No Resend key is configured: nothing can go out. Newsletter screen, Configuration tab.',
  'Les « Séquences automatisées » sont en pause dans les contrôles d’envoi. Traiter maintenant abandonnerait les inscriptions sans rien envoyer.':
    '« Automated sequences » are paused in the sending controls. Processing now would drop the enrolments without sending anything.',
  'Aucune inscription en attente.': 'No enrolment waiting.',
  'Des inscriptions attendent, mais aucune étape n’est échue : leur délai n’est pas écoulé.':
    'Enrolments are waiting, but no step is due: their delay has not elapsed.',
  'L’envoi a été refusé.': 'The send was refused.',
  'Un envoi est en cours : attendez le compte rendu.':
    'A send is running: wait for the report.',

  /* ── L EDITEUR DE BLOCS ─────────────────────────────────────────────────── */
  'Aucun bloc. Ajoutez-en un ci-dessus, ou chargez un modèle.':
    'No block. Add one above, or load a template.',
  'Charger un modèle…': 'Load a template…',
  'Choisissez un modèle.': 'Choose a template.',
  'Modèle chargé en blocs — ajustez-les à votre guise.':
    'Template loaded as blocks — adjust them as you like.',
  'Modèle «': 'Template «',
  '» chargé.': '» loaded.',
  '» chargé dans l’étape': '» loaded into step',
  'Les types de blocs n’ont pas pu être lus — le mode HTML reste disponible.':
    'The block types could not be read — HTML mode is still available.',
  'Mode visuel. Le HTML est rangé dans un bloc « HTML libre ».':
    'Visual mode. The HTML is tucked into a « Free HTML » block.',
  'Mode HTML — c’est exactement ce qui partira.': 'HTML mode — this is exactly what will go out.',
  'Construction de l’aperçu…': 'Building the preview…',
  'Assemblage du courriel…': 'Assembling the email…',
  /* Les champs d un bloc. ⚠ `choix:left=Gauche` — la CLE reste, seul le libelle
     apres le « = » se traduit : c est elle qui part dans le gabarit. */
  'Titre': 'Title',
  'Taille': 'Size',
  'Alignement': 'Alignment',
  'Couleur': 'Colour',
  'Texte': 'Text',
  'Libellé': 'Label',
  'Lien': 'Link',
  'Fond': 'Background',
  'Hauteur (px)': 'Height (px)',
  'Intitulé': 'Heading',
  'Code': 'Code',
  'Note': 'Note',
  'Sur-titre': 'Overline',
  'Pourcentage': 'Percentage',
  'Sous-titre': 'Subtitle',
  'Description': 'Description',
  'Code (facultatif)': 'Code (optional)',
  'Pictogramme': 'Pictogram',
  'choix:h1=Grand,h2=Moyen': 'choix:h1=Large,h2=Medium',
  'choix:left=Gauche,center=Centre,right=Droite': 'choix:left=Left,center=Centre,right=Right',

  /* ── LA CAMPAGNE ────────────────────────────────────────────────────────── */
  'Modifier la campagne': 'Edit the campaign',
  'Nouvelle campagne': 'New campaign',
  '+ Nouvelle campagne': '+ New campaign',
  'Nom interne': 'Internal name',
  'Sujet du courriel': 'Email subject',
  'Canal d’envoi': 'Sending channel',
  'Corps du courriel': 'Email body',
  'Corps du courriel (HTML)': 'Email body (HTML)',
  '✉ Aperçu — marie@example.com': '✉ Preview — marie@example.com',
  'Enregistrée en brouillon :': 'Saved as a draft:',
  'rien ne part tant que vous n’appuyez pas sur « Envoyer ».':
    'nothing goes out until you press « Send ».',
  'Le nom interne est requis.': 'The internal name is required.',
  'Le sujet est requis.': 'The subject is required.',
  'Le message texte est requis pour ce canal.': 'The text message is required for this channel.',
  'mise à jour': 'updated',
  'mis à jour': 'updated',
  '— en brouillon.': '— as a draft.',
  'Rien ne correspond.': 'Nothing matches.',
  'Aucune campagne pour l’instant. Cliquez « + Nouvelle campagne ».':
    'No campaign yet. Click « + New campaign ».',
  'Campagne Envoyé à Canal': 'Campaign Sent to Channel',
  'Destinataires État Partis / échecs': 'Recipients Status Sent / failed',
  'Campagnes parties': 'Campaigns sent',
  'Courriels partis': 'Emails sent',
  'Expéditeur :': 'Sender:',

  /* ── LE SMS ─────────────────────────────────────────────────────────────── */
  /* ⚠ « STOP » et « AIDE » sont les mots-cles que Twilio reconnait dans un SMS
     entrant : les traduire ferait croire qu on peut repondre autre chose. */
  'Destinataires SMS': 'SMS recipients',
  'client(s) ayant consenti, avec un téléphone.': 'customer(s) who consented, with a phone.',
  '⚠ Téléphonie non configurée : l’envoi SMS échouera.':
    '⚠ Telephony not configured: the SMS send will fail.',
  'Message texte (SMS)': 'Text message (SMS)',
  '0 /480 · Variable : {{firstName}} .': '0 /480 · Variable: {{firstName}} .',
  'Twilio gère STOP et AIDE automatiquement.': 'Twilio handles STOP and AIDE automatically.',

  /* ── LES CHAINES ────────────────────────────────────────────────────────── */
  'Modifier la chaîne': 'Edit the sequence',
  'Nouvelle chaîne': 'New sequence',
  '+ Nouvelle chaîne': '+ New sequence',
  'Aucune chaîne pour l’instant.': 'No sequence yet.',
  'Cliquez « + Nouvelle chaîne ».': 'Click « + New sequence ».',
  '+ Ajouter une étape': '+ Add a step',
  'Aucune étape : cette chaîne n’enverrait rien.': 'No step: this sequence would send nothing.',
  'Aucune étape : cette chaîne n’enverra rien.': 'No step: this sequence will send nothing.',
  'Cliquez « + Ajouter une étape ».': 'Click « + Add a step ».',
  'Délai depuis le déclenchement': 'Delay since the trigger',
  'Le nom est requis.': 'The name is required.',
  'Ajoutez au moins une étape.': 'Add at least one step.',
  'Chaque étape doit avoir un sujet.': 'Every step must have a subject.',
  'Chaînes actives': 'Active sequences',
  'Inscriptions en cours': 'Enrolments running',
  'Étapes échues': 'Steps due',
  'prêtes à partir': 'ready to go',
  'Traiter les étapes échues': 'Process the due steps',
  'Rien d’échu pour l’instant': 'Nothing due yet',
  'Active': 'Active',
  'est active.': 'is active.',
  'est suspendue.': 'is paused.',

  /* ── LES VARIABLES ──────────────────────────────────────────────────────── */
  /* ⚠⚠ ON NE TRADUIT PAS UN NOM DE VARIABLE : le serveur le remplace. Traduit,
     il devient introuvable et le courriel part avec le texte brut. */
  'Variables :': 'Variables:',
  'Les variables de panier ne se remplissent que dans une chaîne':
    'The basket variables are only filled in a sequence',
  'dont le déclencheur est Panier abandonné . Ailleurs, elles ressortent vides.':
    'whose trigger is Abandoned basket . Anywhere else they come out empty.',

  /* ── LES SEGMENTS, ET LE CONSENTEMENT ───────────────────────────────────── */
  /* ⚠⚠⚠ REGLE DE DROIT : un segment RESTREINT, il ne joint jamais quelqu un qui
     n a pas consenti. La phrase ne se resume pas. */
  'Abonnés actifs': 'Active subscribers',
  'le point de départ': 'the starting point',
  'Segments composés': 'Built segments',
  'Un segment ne fait que restreindre la liste': 'A segment only narrows the list',
  'des abonnées actives : il ne peut jamais joindre quelqu’un qui n’a pas consenti':
    'of active subscribers: it can never reach someone who has not consented',
  'à recevoir l’infolettre.': 'to receive the newsletter.',
  '+ Nouveau segment': '+ New segment',
  'Aucun segment composé. Les campagnes': 'No built segment. Campaigns',
  'disposent tout de même de « Tous les abonnés » et « Clients avec commandes ».':
    'still have « All subscribers » and « Customers with orders ».',
  'Segment Critères': 'Segment Criteria',
  'Portée Utilisé par': 'Reach Used by',
  'Modifier le segment': 'Edit the segment',
  'Nouveau segment': 'New segment',
  'Nom du segment': 'Segment name',
  'toutes ces conditions doivent être remplies': 'all these conditions must be met',
  '+ Ajouter un critère': '+ Add a criterion',
  'Portée : —': 'Reach: —',
  'abonnées actives': 'active subscribers',
  'Aucun critère : ce segment vaudrait': 'No criterion: this segment would be worth',
  '« tous les abonnés ». Ajoutez-en au moins un.': '« all subscribers ». Add at least one.',
  'Aucune abonnée ne correspond : ce segment n’enverrait rien.':
    'No subscriber matches: this segment would send nothing.',
  'Ajoutez au moins un critère.': 'Add at least one criterion.',
  'Cliquez « Confirmer ? » — le segment disparaît. Les campagnes qui':
    'Click « Confirm? » — the segment disappears. Campaigns that',
  's’en servent doivent d’abord en choisir un autre.': 'use it must choose another one first.',
  'Impossible :': 'Not possible:',
  's’en sert encore (': 'still uses it (',
  '). Changez leur segment d’abord.': '). Change their segment first.',
  'Retiré sur ce poste seulement — le nuage n’a pas confirmé.':
    'Removed on this machine only — the cloud did not confirm.',
  'Enregistré sur ce poste seulement — le nuage n’a pas confirmé.':
    'Saved on this machine only — the cloud did not confirm.',

  /* ── L ENVOI : LE POINT DE NON-RETOUR ───────────────────────────────────── */
  /* ⚠⚠⚠ « SANS RETOUR POSSIBLE », « POUR DE BON », « NE FERMEZ PAS CETTE
     FENETRE » : ce sont les trois dernieres phrases avant que des courriels
     partent chez de vraies clientes. Elles restent aussi nettes en anglais. */
  'Aucune clé Resend n’est configurée : rien ne peut partir .':
    'No Resend key is configured: nothing can go out .',
  'Écran Infolettre → Configuration, dans la fenêtre principale.':
    'Newsletter screen → Configuration, in the main window.',
  'Mode test allumé : les courriels partiront uniquement à':
    'Test mode on: the emails will only go to',
  ', et la campagne restera en brouillon. Les SMS, eux, ne partent pas du tout.':
    ', and the campaign will stay a draft. SMS, for their part, do not go out at all.',
  'Mode test : un seul courriel partira, à': 'Test mode: a single email will go, to',
  'l’adresse de test': 'the test address',
  'Confirmer l’envoi ?': 'Confirm the send?',
  'Confirmer — envoyer': 'Confirm — send',
  'Cliquez pour confirmer :': 'Click to confirm:',
  'vont partir, sans retour possible.': 'will go out, with no way back.',
  'Envoi en cours…': 'Sending…',
  'Envoi en cours… ne fermez pas cette fenêtre.': 'Sending… do not close this window.',
  'Envoi des étapes échues… ne fermez pas cette fenêtre.':
    'Sending the due steps… do not close this window.',
  '(mode test : la campagne reste en brouillon).': '(test mode: the campaign stays a draft).',
  'Ces étapes partiront pour de bon, par courriel. Cliquez pour confirmer.':
    'These steps will go out for real, by email. Click to confirm.',
  'Les « Séquences automatisées » sont en pause dans les':
    '« Automated sequences » are paused in the',
  'contrôles d’envoi (écran Infolettre → Configuration). Aucune étape ne partira, et les traiter':
    'sending controls (Newsletter screen → Configuration). No step will go out, and processing them',
  'dans cet état abandonnerait les inscriptions sans rien envoyer.':
    'in this state would drop the enrolments without sending anything.',
  'Cliquez « Confirmer ? » — la campagne et ses images sont supprimées pour de bon.':
    'Click « Confirm? » — the campaign and its images are deleted for good.',
  'Suspendre abandonnera': 'Pausing will drop',
  'en cours :': 'running:',
  'la suite de la séquence. Cliquez pour confirmer.':
    'the rest of the sequence. Click to confirm.',
  'Cliquez « Confirmer ? » — la chaîne, ses étapes et':
    'Click « Confirm? » — the sequence, its steps and',
  'en cours disparaissent.': 'running disappear.',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════
   * Pictogramme dans son `<span class="ic">`, phrase coupee par un `<strong>`,
   * en-tetes de tableau une cellule a la fois.
   * ⚠⚠ ET UN PIEGE VU ICI : la cle COURTE « Corps du courriel » s est posee DANS
   * l attribut `aria-label="Corps du courriel de l’étape 1"`, qui n avait pas de
   * cle a lui — l etiquette d accessibilite ressortait a moitie anglaise. Un
   * attribut qui s AFFICHE (title, aria-label, placeholder, alt) est un texte
   * comme un autre : il lui faut SA cle, sinon une cle voisine le decoupe.
   * ══════════════════════════════════════════════════════════════════════════ */
  'Téléphonie non configurée : l’envoi SMS échouera.': 'Telephony not configured: the SMS send will fail.',
  'Aperçu — marie@example.com': 'Preview — marie@example.com',
  'Aperçu': 'Preview',
  'Enregistrée en brouillon : ': 'Saved as a draft: ',
  'dont le déclencheur est <strong>Panier abandonné</strong>. Ailleurs, elles ressortent vides.':
    'whose trigger is <strong>Abandoned basket</strong>. Anywhere else they come out empty.',
  'Un segment ne fait que <strong>restreindre</strong> la liste ':
    'A segment only <strong>narrows</strong> the list ',
  'Mode test allumé : les courriels partiront <strong>uniquement</strong> à ':
    'Test mode on: the emails will go <strong>only</strong> to ',
  'Aucune clé Resend n’est configurée : rien ne peut <strong>partir</strong>.':
    'No Resend key is configured: nothing can <strong>go out</strong>.',
  'Les « Séquences automatisées » sont en pause dans les ':
    '« Automated sequences » are paused in the ',
  'Portée : ': 'Reach: ',

  /* ── LES EN-TETES, UNE CELLULE A LA FOIS ────────────────────────────────── */
  'Segment': 'Segment',
  'Critères': 'Criteria',
  'Portée': 'Reach',
  'Utilisé par': 'Used by',
  'Campagne': 'Campaign',
  'Envoyé à': 'Sent to',
  'Canal': 'Channel',
  'Destinataires': 'Recipients',
  'État': 'Status',
  'Partis / échecs': 'Sent / failed',

  /* ── LES ATTRIBUTS QUI S AFFICHENT, CHACUN AVEC SA CLE ──────────────────── */
  'Corps du courriel de l’étape ': 'Email body of step ',
  'Délai — jours': 'Delay — days',
  'Délai — heures': 'Delay — hours',
  'Critère': 'Criterion',

  /* ── LA LONGUE TRAINE ───────────────────────────────────────────────────── */
  'Déclencheur': 'Trigger',
  'Étapes': 'Steps',
  'Étape': 'Step',
  'étape': 'step',
  'créée': 'created',
  'créé': 'created',
  'échue': 'due',
  'échec': 'failure',
  'terminée': 'finished',
  'abonnée': 'subscriber',
  /* ⚠ LE <strong> NE TOMBE PAS OU JE L AVAIS CRU : il enveloppe « rien ne peut
     partir » en entier, « en pause » seul, et « brouillon » seul. On recopie la
     source telle qu elle est — c est elle qui decide, pas la phrase rendue. */
  'Aucune clé Resend n’est configurée : <strong>rien ne peut partir</strong>. ':
    'No Resend key is configured: <strong>nothing can go out</strong>. ',
  'Les « Séquences automatisées » sont <strong>en pause</strong> dans les ':
    '« Automated sequences » are <strong>paused</strong> in the ',
  'Enregistrée en <strong>brouillon</strong> : ': 'Saved as a <strong>draft</strong>: ',

  /* ── LA LONGUE TRAINE (suite) ───────────────────────────────────────────── */
  'traitée': 'processed',
  'supprimé.': 'deleted.',
  'supprimée.': 'deleted.',
  'supprimée': 'deleted',
  'réussi': 'succeeded',
  'abandonnée': 'dropped',
  'envoi': 'send',
  'inscription': 'enrolment'
};
