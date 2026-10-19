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
  /* ⚠⚠ LES DEUX FORMES EN ENTIER — voir tools/banc-pluriel-colle.js. La fenetre
     ne colle plus de « s » : elle CHOISIT entre deux phrases ecrites ici, parce
     qu en anglais le pluriel n est pas toujours une lettre de plus. */
  'étape': 'step',
  'étapes': 'steps',
  'étape échue': 'step due',
  'étapes échues': 'steps due',
  'étape traitée': 'step processed',
  'étapes traitées': 'steps processed',
  'campagne': 'campaign',
  'campagnes': 'campaigns',
  'abonnée': 'subscriber',
  'abonnées': 'subscribers',
  'échec': 'failure',
  'échecs': 'failures',
  'terminée': 'finished',
  'terminées': 'finished',
  'courriel': 'email',
  'courriels': 'emails',
  'courriel parti': 'email sent',
  'courriels partis': 'emails sent',
  'envoi réussi': 'successful send',
  'envois réussis': 'successful sends',
  'inscription': 'enrolment',
  'inscriptions': 'enrolments',
  'inscription abandonnée': 'enrolment dropped',
  'inscriptions abandonnées': 'enrolments dropped',
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
  /* La forme RENDUE : l attribut est coupe du numero qui le suit, et l espace
     de fin part avec. Invisible aux deux mesures jusqu au 2026-09-13 — voir la
     fiche de tools/textes-visibles.js. */
  'Corps du courriel de l’étape': 'Email body of step',
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
  'inscription': 'enrolment',

  /* ── LES MOTS NUS DE LA PAGE ANGLAISE (banc-langue-residuel) ───────────────
     ⚠ « Retirer » vient du socle, mais la source ecrit « ${T("Retirer")} ce
     bloc » : la moitie longue restait en francais. La phrase entiere se traduit
     ici, et le dictionnaire de la fenetre passe avant le socle. */
  'Retirer ce bloc': 'Remove this block',
  'Ajouter : ': 'Add: ',
  'Ajouter :': 'Add:',
  'Statut': 'Status',
  'Sujet': 'Subject',
  'Nom de la chaîne': 'Chain name',
  'Nom ou sujet': 'Name or subject',
  'Nom ou sujet…': 'Name or subject…',
  'Suspendue': 'Paused',
  'Charger': 'Load',
  'jours': 'days',
  'heures': 'hours',

  /* ══ LES EXEMPLES DE CHAMP — ET LA QUESTION QUI LES TRANCHE ════════════════
   * ⚠⚠ « QUI LIT CE QUE L ON TAPE ICI ? », et la reponse n est pas la meme d un
   * champ a l autre du MEME ecran. Un exemple sert a montrer la forme du texte
   * attendu : s il est dans une autre langue que celle du texte attendu, il
   * enseigne la mauvaise chose.
   *   · « Nom interne », « Nom du segment », « Nom de la chaine » ne sortent
   *     jamais de l administration — leur exemple suit la langue du poste ;
   *   · le SUJET DU COURRIEL et le MESSAGE TEXTE partent chez la cliente. Leur
   *     exemple reste EN FRANCAIS, sinon on apprend a l administratrice
   *     anglophone a ecrire en anglais a une clientele qui lit le francais.
   * ⚠ Une entree qui rend le MEME texte est une DECISION, pas un oubli — et le
   * banc l honore seulement si elle est ECRITE. Sans ces deux lignes, les deux
   * exemples ci-dessous seraient comptes comme des fautes. */
  'Infolettre de septembre': 'September newsletter',
  'Bienvenue en trois temps': 'Welcome in three steps',
  'Clients robes, 300 $ et plus': 'Dress customers, $300 and up',
  'Nos nouveautés sont arrivées !': 'Nos nouveautés sont arrivées !',
  'SANDRIZA : nos nouveautés sont arrivées !': 'SANDRIZA : nos nouveautés sont arrivées !',

  /* ── LES MOTS SEULS (2026-09-13) — onglets et boutons, invisibles aux deux
     mesures : un seul mot, et pas d'accent. */
  'Campagnes': 'Campaigns',
  'Segments': 'Segments',
  'Visuel': 'Visual',
  'HTML': 'HTML',
  'Nom': 'Name',
  'Compter': 'Count',
  'Oui': 'Yes',
  'Non': 'No',
  'Brouillons': 'Drafts',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'en cours ·': 'under way ·',
  'les destinataires': 'the recipients',
  'ces personnes ne recevront jamais': 'these people will never receive',
  'cette personne ne recevra jamais': 'this person will never receive',

  /* ══ L ECRITURE PUBLICITAIRE IA (#115, 2026-09-14) ════════════════════════
     ⚠ << Rédiger >> et non << Générer >>. En anglais, << Write >> et non
     << Generate >>. Ce qui sort d ici est un BROUILLON qu on relit, qu on
     deplace et qu on corrige dans l editeur juste en dessous ; << générer >>
     ferait croire a un resultat fini qu on envoie tel quel — et c est
     exactement ce qu il ne faut pas faire d un texte ecrit par une machine et
     signe de la boutique.
     ⚠ << Plafond >> reste << ceiling >>, comme dans l ecran des cles : un
     budget se depasse, un plafond arrete. */
  'Écrire avec l’IA': 'Write with AI',
  'Simple': 'Simple',
  'Avancé': 'Advanced',
  'Que faut-il annoncer ?': 'What should it announce?',
  'ex. l’arrivée de la collection d’automne, avec 15 % sur les manteaux':
    'e.g. the arrival of the fall collection, with 15% off coats',
  'Ton': 'Tone',
  'Chaleureux': 'Warm',
  'Élégant': 'Elegant',
  'Enjoué': 'Playful',
  'Pressant': 'Urgent',
  'Langue': 'Language',
  'Français': 'French',
  'Anglais': 'English',
  'Longueur': 'Length',
  'Courte': 'Short',
  'Moyenne': 'Medium',
  'Longue': 'Long',
  'Contenu du site': 'Site content',
  'Produits et promotions': 'Products and promotions',
  'Produits seulement': 'Products only',
  'Ne rien joindre': 'Attach nothing',
  'Consignes supplémentaires': 'Extra instructions',
  'ex. ne pas parler de livraison gratuite ; mentionner la boutique de Québec':
    'e.g. do not mention free shipping; mention the Quebec City shop',
  'Où placer le texte rédigé': 'Where to put the written text',
  'Remplacer le corps': 'Replace the body',
  'Ajouter à la suite': 'Add after',
  'Rédiger': 'Write',
  'Rédaction…': 'Writing…',
  'Rédaction en cours — cela prend une dizaine de secondes.':
    'Writing under way — this takes about ten seconds.',
  'Rédigé : ': 'Written: ',
  'bloc(s)': 'block(s)',
  'écarté(s), hors catalogue': 'set aside, outside the catalogue',
  ' ce mois-ci': ' this month',
  ' ce mois-ci (aucun plafond)': ' this month (no ceiling)',
  'Aucune clé d’écriture IA n’est enregistrée. Elle se pose dans Configuration ▸ Clés API.':
    'No AI writing key is saved. It is set in Configuration ▸ API keys.',
  'Dites d’abord ce qu’il faut annoncer.': 'First say what it should announce.',
  'Le plafond mensuel d’écriture IA est atteint. Il se règle dans Configuration ▸ Clés API.':
    'The monthly AI writing ceiling has been reached. It is set in Configuration ▸ API keys.',
  'Le modèle n’a rien produit d’utilisable. Reformulez la demande.':
    'The model produced nothing usable. Reword the request.',
  'La réponse du modèle n’a pas pu être lue. Réessayez.':
    'The model’s answer could not be read. Try again.',
  'Vous n’avez pas le droit de modifier les campagnes.':
    'You are not allowed to change campaigns.',
  'La passerelle d’écriture IA est injoignable.': 'The AI writing gateway cannot be reached.',
  'La rédaction a échoué.': 'The writing failed.',
  /* ⚠ LES DEUX SEPARATEURS. Ils ne sont pas du decor : sans entree, le releve
     les compte comme du francais laisse sur la page anglaise. */
  ' — ': ' — ',
  ' · ': ' · ',

  /* ── LE COMPTEUR DU MOIS ET L ECRITURE PAR L IA (2026-09-18) ─────────────
     ⚠ << ce mois-ci >> existe EN DEUX VERSIONS parce que la page en ecrit deux :
     seule, et suivie de sa parenthese. Ne pas en supprimer une en croyant a un
     doublon — la version nue sert quand un plafond est pose. */
  'ce mois-ci': 'this month',
  'ce mois-ci (aucun plafond)': 'this month (no cap)',
  '✶ Écrire avec l’IA': '✶ Write with AI',
  'Rédigé :': 'Written:',
  // La refonte, comme l'Inventaire (2026-09-25).
  'Envoyer': 'Send',
  'Suspendre': 'Suspend',
  /* Accords selon le nombre (2026-09-29) — remplacent les « (s) ». */
  'bloc': 'block',
  'blocs': 'blocks',
  'écarté, hors catalogue': 'set aside, outside the catalogue',
  'écartés, hors catalogue': 'set aside, outside the catalogue',
  'client ayant consenti, avec un téléphone.': 'customer who consented, with a phone.',
  'clients ayant consenti, avec un téléphone.': 'customers who consented, with a phone.',
  'Adresse de l’image (https)': 'Image address (https)',
  'Description de l’image': 'Image description',
  'Titre (facultatif)': 'Title (optional)',
  'Pièces': 'Items',
  'Colonnes': 'Columns',
  'choix:2=Deux,3=Trois': 'choix:2=Two,3=Three',
  '(Ctrl + clic pour en choisir plusieurs)': '(Ctrl + click to pick several)',
  'Image': 'Image',
  'Produits du catalogue': 'Catalogue products',
  'Panier abandonné : 1 h, 24 h, 72 h (avec 10 %) — créée en pause, à relire': 'Abandoned cart: 1 h, 24 h, 72 h (with 10%) — created paused, to review',
  'Créer la séquence panier en 3 temps': 'Create the 3-step cart sequence',
  'Création de la séquence…': 'Creating the sequence…',
  'modèle introuvable — le site doit être à jour': 'template not found — the site must be up to date',
  'Panier abandonné — séquence en 3 temps': 'Abandoned cart — 3-step sequence',
  '1 h : rappel · 24 h : avis et rareté · 72 h : 10 % pendant 48 h': '1 h: reminder · 24 h: reviews and scarcity · 72 h: 10% for 48 h',
  'Séquence créée, en pause : relisez-la puis activez-la.': 'Sequence created, paused: review it then activate it.',
  // 2026-10-12 : l apercu se pose par-dessus la colonne de droite, et se ferme par son bouton.
  'Fermer l’aperçu': 'Close the preview',
  // 2026-10-15 : l editeur de campagne refait (blocs | apercu | reglages, panneau IA).
  '+ Ajouter un bloc': '+ Add a block',
  'Aperçu du courriel': 'Email preview',
  'Aucun bloc pour l’instant. Ajoutez-en un, partez d’un modèle ou demandez à l’IA.': 'No blocks yet. Add one, start from a template or ask the AI.',
  'Autre couleur': 'Other colour',
  'Autres': 'Others',
  'Blocs du courriel': 'Email blocks',
  'Brouillon': 'Draft',
  'Ce bloc n’a rien à régler.': 'This block has nothing to adjust.',
  'Choisissez un bloc à gauche, ou cliquez-le dans l’aperçu, pour le modifier.': 'Pick a block on the left, or click it in the preview, to edit it.',
  'Cliquez un bloc dans l’aperçu pour le modifier.': 'Click a block in the preview to edit it.',
  'Code promo': 'Promo code',
  'Collection': 'Collection',
  'Contenu': 'Content',
  'Date de fin': 'End date',
  'De l’air entre deux blocs': 'Breathing room between two blocks',
  'Dupliquer': 'Duplicate',
  'Enregistrée en brouillon : rien ne part tant que vous n’appuyez pas sur « Envoyer ».': 'Saved as a draft: nothing goes out until you press “Send”.',
  'Fermer': 'Close',
  'Insérer une information': 'Insert a detail',
  'Le courriel est vide. Ajoutez un bloc, partez d’un modèle ou demandez à l’IA de le rédiger.': 'The email is empty. Add a block, start from a template or ask the AI to write it.',
  'Le rabais, en gros': 'The discount, big and bold',
  'Lien boutique': 'Shop link',
  'Mise en page': 'Layout',
  'Mode HTML : le corps se modifie directement au centre.': 'HTML mode: the body is edited directly in the centre.',
  'Nom de la campagne': 'Campaign name',
  'Objet': 'Subject',
  'Partir d’un modèle': 'Start from a template',
  'Photos, noms et prix du catalogue': 'Catalogue photos, names and prices',
  'Prénom': 'First name',
  'Rabais %': 'Discount %',
  'Rien ne part tant que vous n’appuyez pas sur « Envoyer ».': 'Nothing goes out until you press “Send”.',
  'Rédiger avec l’IA': 'Write with AI',
  'Un code promo à copier': 'A promo code to copy',
  'Un encadré qui attire l’œil': 'An eye-catching box',
  'Un lien vers la boutique': 'A link to the shop',
  'Un paragraphe': 'A paragraph',
  'Une grande phrase d’accroche': 'A big catchy line',
  'Une ligne de séparation': 'A dividing line',
  'Une photo pleine largeur': 'A full-width photo',
  'Ventes': 'Sales',
  'Votre propre HTML': 'Your own HTML',
  'pièce': 'piece',
  'pièces': 'pieces',
  'À': 'To',
  '← Campagnes': '← Campaigns',
  // 2026-10-15 : l editeur de chaine refait (ligne du temps | apercu | reglages de l etape).
  '(sans sujet)': '(no subject)',
  'Articles du panier': 'Cart items',
  'Immédiatement': 'Immediately',
  'Les étapes partent d’elles-mêmes selon leur délai — rien ne part à l’enregistrement.': 'Steps go out on their own after their delay — nothing is sent when you save.',
  'Lien du panier': 'Cart link',
  'Nombre d’articles': 'Number of items',
  'Premier produit': 'First product',
  'Retirer cette étape': 'Remove this step',
  'Total du panier': 'Cart total',
  'Trois courriels après l’inscription': 'Three emails after sign-up',
  'h': 'h',
  'j': 'd',
  '← Chaînes': '← Sequences',
  // 2026-10-15 : le constructeur de segment refait (criteres en phrases, portee en grand).
  'Portée de ce segment': 'Reach of this segment',
  'Recompter': 'Recount',
  'Si': 'If',
  'Un segment ne fait que restreindre la liste des abonnées actives : il n’ajoute jamais personne.': 'A segment only narrows the list of active subscribers: it never adds anyone.',
  'et': 'and',
  '← Segments': '← Segments',
  // 2026-10-15 : les listes refaites (lot A).
  '% des abonnés actifs': '% of active subscribers',
  'Inutilisé': 'Unused',
  'destinataire': 'recipient',
  'destinataires': 'recipients',
  // 2026-10-15 : le panneau des reglages s elargit.
  'Élargir les réglages': 'Widen the settings',
  // 2026-10-15 : les confirmations en boite a part (szConfirmer).
  'Supprimer le segment': 'Delete segment',
  'Le segment': 'The segment',
  'sera supprimé définitivement. Les campagnes qui l’utilisent devront d’abord en choisir un autre.': 'will be permanently deleted. Campaigns that use it must first choose another one.',
  'Envoyer le courriel de test': 'Send test email',
  'Envoyer la campagne': 'Send campaign',
  'Le mode test est activé : un seul courriel sera envoyé, à': 'Test mode is on: a single email will be sent to',
  'La campagne restera en brouillon.': 'The campaign will stay as a draft.',
  'La campagne sera envoyée immédiatement. Un envoi ne peut pas être annulé.': 'The campaign will be sent immediately. A send cannot be undone.',
  'Envois': 'Messages',
  'Envoyer le test': 'Send test',
  'Supprimer la campagne': 'Delete campaign',
  'La campagne': 'The campaign',
  'et ses images seront supprimées définitivement. Cette action est irréversible.': 'and its images will be permanently deleted. This cannot be undone.',
  'Suspendre la chaîne': 'Suspend sequence',
  'La chaîne': 'The sequence',
  'compte': 'has',
  'inscription en cours': 'enrollment in progress',
  'inscriptions en cours': 'enrollments in progress',
  'Une fois la chaîne suspendue, ces inscriptions seront abandonnées au prochain traitement : la suite de la séquence ne leur sera jamais envoyée.': 'Once the sequence is suspended, these enrollments will be dropped at the next run: the rest of the sequence will never be sent to them.',
  'Supprimer la chaîne': 'Delete sequence',
  'ses étapes et': 'its steps and',
  'seront supprimées définitivement. Cette action est irréversible.': 'will be permanently deleted. This cannot be undone.',
  'Envoyer les étapes échues': 'Send due steps',
  'va partir par courriel immédiatement. Un envoi ne peut pas être annulé.': 'will be emailed immediately. A send cannot be undone.',
  // 2026-10-15 : le code promo de la campagne, et la duplication.
  'créée en brouillon.': 'created as a draft.',
  'Aucun': 'None',
  'Créer automatiquement': 'Create automatically',
  'Coupon existant': 'Existing coupon',
  'Type de rabais': 'Discount type',
  'Montant fixe': 'Fixed amount',
  'Livraison gratuite': 'Free shipping',
  'Valeur du rabais': 'Discount value',
  'valide': 'valid for',
  'Jours de validité': 'Days of validity',
  'jours · une utilisation par client': 'days · one use per customer',
  'Créé au premier envoi ; réutilisé tant que le réglage ne change pas.': 'Created on the first send; reused as long as the setting does not change.',
  'Coupon': 'Coupon',
  'Choisir un coupon…': 'Choose a coupon…',
  'Choisissez le coupon de la campagne, ou un autre réglage de code promo.': 'Choose the campaign coupon, or another promo code setting.',
  'Indiquez la valeur du rabais du code automatique.': 'Enter the discount value of the automatic code.',
  'Ce courriel contient un code promo : choisissez « Créer automatiquement » ou un coupon existant, sinon l’envoi sera refusé.': 'This email contains a promo code: choose “Create automatically” or an existing coupon, otherwise sending will be refused.',
  // 2026-10-15 : les statistiques d une campagne.
  'Statistiques': 'Statistics',
  'Lecture des statistiques…': 'Loading statistics…',
  'envoyée le': 'sent on',
  'code': 'code',
  'Partis': 'Sent',
  'Livrés': 'Delivered',
  'Ouverts': 'Opened',
  '% d’ouverture': '% open rate',
  'Cliqués': 'Clicked',
  '% de clic': '% click rate',
  'Rebonds': 'Bounces',
  'Plaintes': 'Complaints',
  'Les événements de suivi n’ont pas pu être lus': 'Tracking events could not be read',
  'Le suivi des ouvertures et des clics n’est pas encore branché. Chez Resend : 1) Domaines → votre domaine → activez « Open tracking » et « Click tracking » ; 2) Webhooks → ajoutez l’adresse https://www.sandriza.com/resend-webhook.php avec les événements email.* ; 3) copiez son « Signing secret » dans la variable RESEND_WEBHOOK_SECRET du serveur. Les campagnes envoyées ensuite seront suivies.': 'Open and click tracking is not set up yet. In Resend: 1) Domains → your domain → turn on “Open tracking” and “Click tracking”; 2) Webhooks → add the address https://www.sandriza.com/resend-webhook.php with the email.* events; 3) copy its “Signing secret” into the server variable RESEND_WEBHOOK_SECRET. Campaigns sent afterwards will be tracked.',
  'Liens cliqués': 'Clicked links',
  'personne': 'person',
  'personnes': 'people',
  'Aucun clic enregistré pour cette campagne.': 'No clicks recorded for this campaign.',
  'Ouvertures par jour': 'Opens per day',
  'Aucune ouverture enregistrée pour cette campagne.': 'No opens recorded for this campaign.',
  'Audience': 'Audience',
  'Abonnés actifs aujourd’hui': 'Active subscribers today',
  'Nouveaux dans les 7 jours': 'New within 7 days',
  'Désabonnés dans les 7 jours': 'Unsubscribed within 7 days',
  // Les statistiques refaites (2026-10-16) : onglets, tableaux, resultats.
  'moins d’une minute': 'under a minute',
  'Revenir à la liste des campagnes': 'Back to the campaign list',
  'Liens': 'Links',
  'Chronologie': 'Timeline',
  'Le suivi des ouvertures et des clics n’est pas branché sur le serveur : la variable RESEND_WEBHOOK_SECRET est absente.': 'Open and click tracking is not connected on the server: the RESEND_WEBHOOK_SECRET variable is missing.',
  'Cette campagne est partie avant le branchement du suivi (premier événement reçu le': 'This campaign went out before tracking was connected (first event received on',
  ') : ses livraisons, ouvertures et clics n’ont pas été enregistrés. Les campagnes suivantes le seront.': '): its deliveries, opens and clicks were not recorded. Later campaigns will be.',
  'aucun échec': 'no failures',
  'des partis': 'of sent',
  'Ouvreurs': 'Openers',
  'd’ouverture': 'open rate',
  'Cliqueurs': 'Clickers',
  'de clic': 'click rate',
  'Clic / ouverture': 'Click / open',
  'des ouvreurs ont cliqué': 'of openers clicked',
  'Désabonnés': 'Unsubscribed',
  'dans les 7 jours': 'within 7 days',
  'Entonnoir': 'Funnel',
  'Personnes': 'People',
  '% des partis': '% of sent',
  '% de l’étape précédente': '% of previous step',
  'Proportion': 'Share',
  'Indicateurs': 'Indicators',
  'Ouvertures au total': 'Total opens',
  'Ouvertures par ouvreur': 'Opens per opener',
  'Clics au total': 'Total clicks',
  'Clics par cliqueur': 'Clicks per clicker',
  'Délai médian avant la première ouverture': 'Median time to first open',
  'Délai médian avant le premier clic': 'Median time to first click',
  'Livraisons retardées': 'Delayed deliveries',
  'Résultats': 'Results',
  'Commandes avec le code': 'Orders with the code',
  'Revenu avec le code': 'Revenue with the code',
  'Rabais accordé par le code': 'Discount given by the code',
  'Panier moyen avec le code': 'Average order with the code',
  'aucun rattaché': 'none attached',
  'Commandes des destinataires (7 jours)': 'Orders from recipients (7 days)',
  'Revenu des destinataires (7 jours)': 'Revenue from recipients (7 days)',
  'Revenu par courriel livré': 'Revenue per delivered email',
  'Nouveaux abonnés dans les 7 jours': 'New subscribers within 7 days',
  '… dont destinataires de cette campagne': '… of which recipients of this campaign',
  'Clics': 'Clicks',
  'Part des clics': 'Share of clicks',
  '% des ouvreurs': '% of openers',
  'Échec d’envoi': 'Send failed',
  'Plainte': 'Complaint',
  'Rebond': 'Bounce',
  'A cliqué': 'Clicked',
  'A ouvert': 'Opened',
  'Livré': 'Delivered',
  'Parti': 'Sent',
  'Désabonné': 'Unsubscribed',
  'Tous': 'All',
  'Ont ouvert': 'Opened',
  'Ont cliqué': 'Clicked',
  'Sans ouverture': 'Not opened',
  'Problèmes': 'Problems',
  'Personne dans ce filtre.': 'No one in this filter.',
  'Aucun destinataire enregistré pour cette campagne.': 'No recipients recorded for this campaign.',
  'Première ouverture': 'First open',
  'Ouvertures': 'Opens',
  'Premier clic': 'First click',
  'Par jour': 'By day',
  'Jour': 'Day',
  'Ouvreurs cumulés': 'Cumulative openers',
  '% cumulé': 'Cumulative %',
  'Les 48 premières heures': 'The first 48 hours',
  'ouvreurs': 'openers',
  'cliqueurs': 'clickers',
  'Heures comptées depuis l’envoi. Délai médian avant la première ouverture :': 'Hours counted from sending. Median time to first open:',
  /* (2026-10-19) Décisions pour banc-langue-fenetres : les fragments de code, sélecteurs, polices et noms
     de services se rendent à l’identique ; les textes d’interface sont traduits. */
  "\"] .btx span": "\"] .btx span",
};
