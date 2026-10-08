'use strict';

/*
 * FIDELISATION ET SONDAGES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE QU ON ECRIT DANS UN SONDAGE EST LU PAR LA CLIENTELE, EN COURRIEL. Le
 * texte d introduction, le libelle de chaque question, ses choix et le message
 * qui accompagne le code de récompense partent tels quels chez la cliente. Ce
 * sont des DONNEES : ce dictionnaire ne traduit QUE les etiquettes des champs.
 * ⚠ Et leurs EXEMPLES restent FRANCAIS — « Que pensez-vous de votre achat ? »,
 * « Merci ! Voici un code pour votre prochaine commande. » : ce sont des
 * exemples de ce que la CLIENTE lira. Un exemple anglais ferait rediger un
 * sondage anglais pour une clientele francophone. Le NOM du sondage, lui, ne
 * sort pas de l administration : son exemple suit la langue du poste.
 *
 * ⚠⚠ DEUX PHRASES DISENT CE QU ON DETRUIT, avec le chiffre :
 *   · « le sondage et ses N réponses seront détruits, sans retour possible »
 *   · « les invitations partent, les réponses déjà reçues restent »
 * La seconde est la plus facile a perdre en traduisant : elle dit ce qui NE
 * disparait PAS.
 *
 * ⚠ « un sondage vide partirait quand même par courriel » : ce n est pas un
 * avertissement de forme, c est ce qui empeche d envoyer une coquille vide.
 *
 * ⚠ Les declencheurs, les types de question et de recompense viennent du coeur
 * (`FORM.declencheurs`, `typesQuestion`, `typesRecompense`) : leurs valeurs
 * partent dans la base, leurs libelles sont fournis. Ils ne passent pas par ici.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Fidélisation et sondages — Administration Sandriza':
    'Loyalty and surveys — Sandriza Administration',
  'Fidélisation et sondages': 'Loyalty and surveys',
  'Fidélisation indisponible': 'Loyalty unavailable',

  /* ── L ONGLET « AMBASSADRICES » (2026-10-07) ───────────────────────────────
     ⚠ Les TEXTES DU PROGRAMME (titres, descriptions) sont des DONNÉES lues par la
     clientèle : ils ne passent pas par ici. Seules les étiquettes se traduisent. */
  'Ambassadrices': 'Ambassadors',
  'Ambassadrice': 'Ambassador',
  'Ambassadrices et bilan': 'Ambassadors and statement',
  'Programme': 'Programme',
  'Candidatures': 'Applications',
  'Programme inactif': 'Programme inactive',
  'Réservé à l’administration (rôle admin ou super-admin).': 'Reserved for administration (admin or super admin role).',
  'Les versements commencent au lancement de la boutique.': 'Payouts start when the store is launched.',
  'Le serveur ne répond pas — rien n’a été écrit. Réessayez.': 'The server is not responding — nothing was written. Try again.',
  'Le site ne connaît pas encore ce programme : rechargez la fenêtre principale.': 'The site does not know this programme yet: reload the main window.',
  'Code promo invalide : 3 à 24 lettres, chiffres, tirets.': 'Invalid promo code: 3 to 24 letters, digits, dashes.',
  'Ce code appartient déjà à une autre ambassadrice ou à un autre coupon.': 'This code already belongs to another ambassador or another coupon.',
  'Le titre (français) est obligatoire.': 'The title (French) is required.',
  'Rabais : entre 1 et 90 %.': 'Discount: between 1 and 90%.',
  'Valeur de la récompense hors limites.': 'Reward value out of range.',
  'Délai : entre 0 et 365 jours.': 'Delay: between 0 and 365 days.',
  'Crédit boutique (% des articles)': 'Store credit (% of items)',
  '% des articles': '% of items',
  'Points de fidélité (par dollar)': 'Loyalty points (per dollar)',
  'points par dollar': 'points per dollar',
  'Commission en % (payée à la main)': 'Commission in % (paid manually)',
  'Montant fixe par commande (payé à la main)': 'Fixed amount per order (paid manually)',
  '$ par commande': '$ per order',
  'Aucune récompense due pour l’instant.': 'No reward due for now.',
  'Due': 'Due',
  'Versée': 'Paid',
  'Annulée': 'Cancelled',
  'Remboursée': 'Refunded',
  'Sa propre commande': 'Her own order',
  'Pas encore livrée': 'Not delivered yet',
  'Date de livraison inconnue': 'Delivery date unknown',
  'Aucune récompense': 'No reward',
  'Délai de retour jusqu’au': 'Return period until',
  'Modifier l’ambassadrice': 'Edit the ambassador',
  'Nouvelle ambassadrice': 'New ambassador',
  'Code promo': 'Promo code',
  'Liens des réseaux sociaux': 'Social media links',
  'Notes internes': 'Internal notes',
  'Active': 'Active',
  'Inactive': 'Inactive',
  '— désactivée, son code ne fonctionne plus à la caisse': '— when deactivated, her code no longer works at checkout',
  'Le coupon est créé ou mis à jour : le rabais du programme, une fois par client. Le crédit et les points se versent au compte client qui porte ce courriel.':
    'The coupon is created or updated: the programme discount, once per customer. Credit and points are paid to the customer account that has this email.',
  '+ Ajouter une ambassadrice': '+ Add an ambassador',
  'En attente :': 'Pending:',
  'Dû :': 'Due:',
  'Confirmer le versement ?': 'Confirm the payout?',
  'Verser les récompenses dues': 'Pay the rewards due',
  'Aucune ambassadrice pour l’instant.': 'No ambassador yet.',
  'Ajoutez-en une, ou créez-la depuis une candidature.': 'Add one, or create her from an application.',
  'Commandes': 'Orders',
  'Ventes': 'Sales',
  'Dû': 'Due',
  'Versé': 'Paid',
  'Aucun compte client ne porte ce courriel : rien ne peut lui être versé.': 'No customer account has this email: nothing can be paid to her.',
  'sans compte': 'no account',
  'Détail': 'Details',
  'Réactiver': 'Reactivate',
  'Base': 'Base',
  'Aucune commande avec son code pour l’instant.': 'No order with her code yet.',
  'Dernier versement :': 'Last payout:',
  'Exemple : un client achète 100 $ d’articles avec un code ; après son rabais, la base est de':
    'Example: a customer buys $100 of items with a code; after the discount, the base is',
  'L’ambassadrice reçoit': 'The ambassador receives',
  '(à payer à la main)': '(to be paid manually)',
  'Le programme': 'The programme',
  'La page de la boutique, le lien du pied de page et les codes des ambassadrices.': 'The store page, the footer link and the ambassadors’ codes.',
  'Rabais offert à la clientèle (%)': 'Discount offered to customers (%)',
  'Délai avant de compter (jours)': 'Delay before counting (days)',
  'après la livraison — la fenêtre de retour': 'after delivery — the return window',
  'Titre (français)': 'Title (French)',
  'Titre (anglais)': 'Title (English)',
  'Description du programme (français)': 'Programme description (French)',
  'Description du programme (anglais)': 'Programme description (English)',
  'Annuler les changements': 'Discard the changes',
  'La page Ambassadrices de la boutique et la politique du programme suivent ces réglages. Éteindre le programme éteint aussi les codes des ambassadrices.':
    'The store’s Ambassadors page and the programme policy follow these settings. Turning the programme off also turns off the ambassadors’ codes.',
  'Candidatures reçues': 'Applications received',
  'Aucune candidature pour l’instant.': 'No application yet.',
  'Elles arrivent par le formulaire de la page Ambassadrices de la boutique.': 'They arrive through the form on the store’s Ambassadors page.',
  'Nouvelle': 'New',
  'Acceptée': 'Accepted',
  'Refusée': 'Declined',
  'Candidate': 'Applicant',
  'Réseaux': 'Social media',
  'Message': 'Message',
  'Créer l’ambassadrice': 'Create the ambassador',
  'Refuser': 'Decline',
  'Enregistrée. Aucun compte client ne porte ce courriel : le crédit ou les points ne pourront pas lui être versés.':
    'Saved. No customer account has this email: credit or points cannot be paid to her.',
  'Ambassadrice enregistrée — son code est prêt.': 'Ambassador saved — her code is ready.',
  'Cliquez « Confirmer le versement ? » —': 'Click “Confirm the payout?” —',
  'pour': 'for',
  'commande(s). Ce geste ne se défait pas.': 'order(s). This cannot be undone.',
  'Versement en cours…': 'Payout in progress…',
  'sans compte client': 'no customer account',
  'compte introuvable': 'account not found',
  'erreur réseau': 'network error',
  'Récompenses versées :': 'Rewards paid:',
  'ambassadrice(s).': 'ambassador(s).',
  'Non versées :': 'Not paid:',
  'Réglages du programme enregistrés.': 'Programme settings saved.',
  'Choisissez son code promo, puis enregistrez.': 'Choose her promo code, then save.',
  'Candidature refusée.': 'Application declined.',
  'Cliquez « Confirmer ? » — la candidature sera effacée.': 'Click “Confirm?” — the application will be erased.',
  'Candidature supprimée.': 'Application deleted.',
  'Chargement… (les réponses se resynchronisent)':
    'Loading… (the answers are resynchronising)',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès à la fidélisation.':
    'Your role does not give access to the loyalty screen.',
  'Cet élément n’existe plus.': 'This item no longer exists.',
  'Adresse courriel invalide.': 'Invalid email address.',
  'Il n’y a aucune invitation à supprimer.': 'There is no invitation to delete.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',
  'Éditeur indisponible : ': 'Editor unavailable: ',
  'Éditeur indisponible :': 'Editor unavailable:',

  /* ── LES TUILES ─────────────────────────────────────────────────────────── */
  'Invitations': 'Invitations',
  'Réponses': 'Answers',
  'taux de ': 'rate of ',
  'Note moyenne': 'Average rating',
  ' évaluations': ' ratings',
  ' évaluation': ' rating',
  'Codes récompense': 'Reward codes',
  ' utilisés': ' used',
  ' utilisé': ' used',

  /* ── LA NOTIFICATION DES COMMENTAIRES ───────────────────────────────────── */
  'Notification des commentaires': 'Comment notification',
  'Quand un client laisse un commentaire, ': 'When a customer leaves a comment, ',
  'Quand un client laisse un commentaire,': 'When a customer leaves a comment,',
  'il vous est transféré à cette adresse. Laissez vide pour ne rien recevoir.':
    'it is forwarded to you at this address. Leave empty to receive nothing.',
  'Courriel de notification des sondages': 'Survey notification email',
  'sondages@exemple.com': 'surveys@example.com',
  'Les commentaires partiront à ': 'The comments will go to ',
  'Les commentaires partiront à': 'The comments will go to',
  'Plus aucune notification de commentaire.': 'No more comment notification.',

  /* ── LA LISTE DES SONDAGES ──────────────────────────────────────────────── */
  'Sondages': 'Surveys',
  'Récompenses': 'Rewards',
  'Aucun sondage configuré.': 'No survey configured.',
  'Créer le premier': 'Create the first one',
  '+ Nouveau sondage': '+ New survey',
  'Nom': 'Name',
  'Déclencheur': 'Trigger',
  'Questions': 'Questions',
  'Taux': 'Rate',
  'Récompense': 'Reward',
  'État': 'Status',
  'Nom Déclencheur Questions': 'Name Trigger Questions',
  'Invitations Réponses Taux': 'Invitations Answers Rate',
  'Récompense État': 'Reward Status',
  'Voir le dépouillement': 'See the results',
  'aucune': 'none',
  'Actif': 'Active',
  'Inactif': 'Inactive',

  /* ── LES CODES DE RECOMPENSE ────────────────────────────────────────────── */
  'Codes de récompense': 'Reward codes',
  'Aucune récompense générée pour l’instant.': 'No reward generated yet.',
  'Code': 'Code',
  'Sondage': 'Survey',
  'Commande': 'Order',
  'Répondu le': 'Answered on',
  'Utilisé': 'Used',
  'Code Sondage Commande': 'Code Survey Order',
  'Répondu le Utilisé': 'Answered on Used',
  'utilisé': 'used',
  'non': 'no',
  'récompense': 'reward',
  'récompenses': 'rewards',

  /* ── LES INVITATIONS ────────────────────────────────────────────────────── */
  'Tout supprimer': 'Delete everything',
  'Aucune invitation.': 'No invitation.',
  /* ⚠ Elles partent SEULES : sans cette phrase, on cherche le bouton d envoi. */
  'Elles partent d’elles-mêmes à la confirmation d’une commande ':
    'They go out on their own when an order is confirmed ',
  'Elles partent d’elles-mêmes à la confirmation d’une commande':
    'They go out on their own when an order is confirmed',
  'ou à son passage en « Livrée ».': 'or when it turns « Delivered ».',
  'Date': 'Date',
  'Destinataire': 'Recipient',
  'Date Sondage Destinataire': 'Date Survey Recipient',
  'Déclencheur État': 'Trigger Status',
  'Répondu': 'Answered',
  'En attente': 'Pending',
  'invitation': 'invitation',
  'invitations': 'invitations',
  /* ⚠⚠ CE QUI PART ET CE QUI RESTE : la seconde moitie de la phrase est celle
     qu on perd en traduisant vite. */
  'Cliquez « Confirmer ? » — les invitations partent, les réponses déjà reçues restent.':
    'Click « Confirm? » — the invitations go, the answers already received stay.',
  ' invitations supprimées.': ' invitations deleted.',
  ' invitation supprimée.': ' invitation deleted.',
  'invitations supprimées.': 'invitations deleted.',
  'invitation supprimée.': 'invitation deleted.',
  'Invitation à ': 'Invitation to ',
  'Invitation à': 'Invitation to',
  'ce client': 'this customer',
  ' supprimée.': ' deleted.',

  /* ══ L EDITEUR D UN SONDAGE ════════════════════════════════════════════════ */
  'Modifier le sondage': 'Edit the survey',
  'Nouveau sondage': 'New survey',
  /* Le nom du sondage ne sort pas de l administration : son exemple suit la
     langue du poste. */
  'Satisfaction après livraison': 'Satisfaction after delivery',
  'Envoyé quand': 'Sent when',
  'Texte d’introduction du courriel': 'Introduction text of the email',
  'Sondage actif': 'Survey active',
  '+ Ajouter une question': '+ Add a question',
  'Aucune question — un sondage vide partirait quand même par courriel.':
    'No question — an empty survey would go out by email all the same.',
  'Question ': 'Question ',
  /* ⚠⚠ CES DEUX EXEMPLES RESTENT FRANCAIS : ce sont des exemples de ce que la
     CLIENTE lira dans le courriel, pas du texte d interface. */
  'Que pensez-vous de votre achat ?': 'Que pensez-vous de votre achat ?',
  'Merci ! Voici un code pour votre prochaine commande.':
    'Merci ! Voici un code pour votre prochaine commande.',
  'Type de la question ': 'Type of question ',
  'Type de la question': 'Type of question',
  'Obligatoire': 'Required',
  'Un choix par ligne': 'One choice per line',
  'Offrir une récompense pour la réponse': 'Offer a reward for the answer',
  'Type': 'Type',
  'Valeur': 'Value',
  'Valide (jours)': 'Valid (days)',
  'Message accompagnant le code': 'Message with the code',
  'Créer le sondage': 'Create the survey',
  'Un sondage': 'A survey',
  'créé': 'created',
  'enregistré': 'saved',
  ' questions.': ' questions.',
  ' question.': ' question.',
  /* ⚠ La saisie perdue : la phrase dit ce qu on risque en fermant. */
  'Cliquez « Annuler » pour fermer — la saisie serait perdue.':
    'Click « Cancel » to close — the entry would be lost.',

  /* ── LE DEPOUILLEMENT ───────────────────────────────────────────────────── */
  'Ce sondage n’a aucune question.': 'This survey has no question.',
  ' réponses': ' answers',
  ' réponse': ' answer',
  ' · moyenne ': ' · average ',

  /* ── LA SUPPRESSION D UN SONDAGE ────────────────────────────────────────── */
  'Cliquez « Confirmer ? » — le sondage et ses ':
    'Click « Confirm? » — the survey and its ',
  'Cliquez « Confirmer ? » — le sondage et ses':
    'Click « Confirm? » — the survey and its',
  ' réponses seront détruits, sans retour possible.':
    ' answers will be destroyed, with no way back.',
  ' réponse seront détruits, sans retour possible.':
    ' answer will be destroyed, with no way back.',
  'réponses seront détruits, sans retour possible.':
    'answers will be destroyed, with no way back.',
  'réponse seront détruits, sans retour possible.':
    'answer will be destroyed, with no way back.',
  'seront détruits, sans retour possible.': 'will be destroyed, with no way back.',
  ' » supprimé avec ses ': ' » deleted with its ',
  '» supprimé avec ses': '» deleted with its',
  ' réponses.': ' answers.',
  ' réponse.': ' answer.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Question': 'Question',
  'Fermer': 'Close',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'taux de': 'rate of',
  // La refonte, comme l'Inventaire (2026-09-25).
  ' questions': ' questions',
  ' question': ' question',

  /* ── LA PAGINATION DES SONDAGES (2026-09-26) ── */
  '‹ Précédent': '‹ Previous',
  'Page': 'Page',
  'Suivant ›': 'Next ›',
  /* ── RELOOKING 2026 (2026-10-04) ── */
  'Un courriel de questions envoyé au client au moment choisi.': 'A questions email sent to the customer at the chosen moment.',
  'Le sondage': 'The survey',
  'Il part tout seul à chaque déclenchement.': 'It goes out on its own at every trigger.',
  'Un code de réduction est envoyé à qui répond.': 'A discount code is sent to whoever answers.',
  // Onglet Points (2026-10-06)
  "Points à ajouter ou retirer": "Points to add or remove",
  "Motif de l’ajustement": "Reason for the adjustment",
  "points au total": "points in total",
  "Points": "Points",
  "Exemple : 100 $ d’articles donnent": "Example: $100 of items earns",
  "points": "points",
  "Un client qui a 100 $ en points ne peut en utiliser que": "A customer with $100 in points can only use",
  "sur une commande de 100 $": "on a $100 order",
  "Réglages du programme": "Programme settings",
  "Programme actif": "Programme active",
  "— les clients gagnent et utilisent des points": "— customers earn and use points",
  "Points gagnés par dollar": "Points earned per dollar",
  "sur les articles, après rabais, sans taxes ni livraison": "on items, after discounts, excluding taxes and shipping",
  "Valeur d’un point ($)": "Value of one point ($)",
  "0,01 = 100 points pour 1 $": "0.01 = 100 points for $1",
  "Plafond par commande (%)": "Cap per order (%)",
  "part maximale du total payable en points": "largest share of the total payable in points",
  "Solde minimal pour utiliser": "Minimum balance to redeem",
  "en points (0 = dès le premier)": "in points (0 = from the first one)",
  "Enregistrer les réglages": "Save the settings",
  "Les points sont attribués quand la commande passe « livrée », une seule fois. Le solde de chaque client est tenu par le serveur.": "Points are awarded once, when the order becomes “delivered”. Each customer’s balance is kept by the server.",
  "Soldes des clients": "Customer balances",
  "points en circulation": "points outstanding",
  "Choisir un client…": "Choose a customer…",
  "+100 ou −50": "+100 or −50",
  "Motif (obligatoire)": "Reason (required)",
  "Ajuster le solde": "Adjust the balance",
  "Client": "Customer",
  "Courriel": "Email",
  "Aucun client n’a encore de points.": "No customer has points yet.",
  "Points par dollar : entre 0 et 100.": "Points per dollar: between 0 and 100.",
  "Valeur d’un point : plus de 0 et au plus 10 $.": "Value of a point: more than 0 and at most $10.",
  "Plafond : entre 0 et 100 %.": "Cap: between 0 and 100%.",
  "Réglages enregistrés.": "Settings saved.",
  // Les avis récompensés (2026-10-07).
  "Avis récompensés": "Rewarded reviews",
  "Récompenser les avis publiés": "Reward published reviews",
  "Points par avis": "Points per review",
  "avis publié sans photo": "published review without a photo",
  "Points par avis avec photo": "Points per review with a photo",
  "au moins une photo — remplace le nombre sans photo": "at least one photo — replaces the number without a photo",
  "Ne s’applique qu’une fois la boutique lancée.": "Only applies once the store is launched.",
  "Points d’un avis : un nombre entier de 0 à 100 000.": "Review points: a whole number from 0 to 100,000.",
  "Choisissez un client, un nombre de points et un motif.": "Choose a customer, a number of points and a reason.",
  "Solde ajusté : ": "Balance adjusted: ",
  'Journal des commentaires': 'Comments log',
  'Les commentaires des 365 derniers jours. Plus anciens : effacés automatiquement.': 'Comments from the last 365 days. Older ones are deleted automatically.',
  'Aucun commentaire pour l’instant.': 'No comment yet.',
  'Commentaire': 'Comment',
  'Client': 'Customer',
  'Note': 'Rating',
  "Clients": "Customers",
  "Avec des points": "With points",
  "Points en circulation": "Points in circulation",
  "Rechercher un client : nom ou courriel": "Search a customer: name or email",
  "Rechercher un client": "Search a customer",
  "Filtrer": "Filter",
  "Tous les clients": "All customers",
  "Sans points": "Without points",
  "Trier": "Sort",
  "Plus de points d’abord": "Most points first",
  "Nom (A à Z)": "Name (A to Z)",
  "Sens de l’ajustement": "Adjustment direction",
  "Ajouter": "Add",
  "Nombre de points": "Number of points",
  "Geste commercial": "Goodwill gesture",
  "Correction d’erreur": "Error correction",
  "Retour de commande": "Order return",
  "Concours": "Contest",
  "Anniversaire": "Birthday",
  "Solde actuel :": "Current balance:",
  "Aucun client ne correspond à cette recherche.": "No customer matches this search.",
  "Aucun client dans cette liste.": "No customer in this list.",
  "Ajuster": "Adjust",
  "Clients par page": "Customers per page",
  "par page": "per page",
  "Nouveau solde :": "New balance:",
  "on ne retire pas plus que le solde": "no more than the balance is removed",
  "Indiquez un nombre de points.": "Enter a number of points.",
  "Le motif est obligatoire.": "The reason is required.",
  "Ce client n’a aucun point à retirer.": "This customer has no points to remove.",
  "Masquer les tuiles": "Hide the tiles",
  "Afficher les tuiles": "Show the tiles",

  /* ── LES ONGLETS « PARRAINAGE » ET « PALIERS » (2026-10-07) ───────────────────
     ⚠ Les NOMS DES PALIERS (« Initiée », « Privilège ») sont des DONNÉES lues par la
     clientèle : ils ne passent pas par ici. Seules les étiquettes se traduisent.
     ⚠ « marraine » : la personne qui partage son lien — « referrer » en anglais. */
  'Parrainage': 'Referrals',
  'Paliers': 'Tiers',
  'Le programme est inactif : rien ne se verse.': 'The programme is inactive: nothing is paid.',
  'Rabais de l’amie : entre 1 et 500 $.': 'Friend’s discount: between $1 and $500.',
  'Récompense de la marraine : entre 0 et 500 $.': 'Referrer’s reward: between $0 and $500.',
  'Commande minimale : entre 0 et 5 000 $.': 'Minimum order: between $0 and $5,000.',
  'Code émis, pas encore de commande': 'Code issued, no order yet',
  'Sous le minimum après retour': 'Below the minimum after a return',
  'Commande de la marraine': 'Order by the referrer',
  'Adresse de la marraine': 'Referrer’s address',
  'Pas sa première commande': 'Not her first order',
  'Marraine introuvable': 'Referrer not found',
  'Compte de la marraine supprimé': 'Referrer’s account deleted',
  'code(s) émis': 'code(s) issued',
  'commande(s)': 'order(s)',
  'Versé :': 'Paid:',
  'Amies invitées': 'Invited friends',
  'Aucune amie invitée pour l’instant.': 'No invited friend yet.',
  'Un code s’émet quand une amie arrivée par un lien de parrainage demande son rabais à la caisse.':
    'A code is issued when a friend who came through a referral link asks for her discount at checkout.',
  'Émis le': 'Issued on',
  'Marraine': 'Referrer',
  'Amie': 'Friend',
  'Exemple : une amie arrive par le lien, commande pour': 'Example: a friend arrives through the link, orders',
  'd’articles et paie': 'of items and pays',
  'Sa commande livrée, après': 'Once her order is delivered, after',
  'jours sans retour, la marraine reçoit': 'days without a return, the referrer receives',
  'en crédit boutique.': 'in store credit.',
  'Le lien de chaque compte client, le rabais de l’amie à la caisse et la récompense de la marraine.':
    'Each customer account’s link, the friend’s discount at checkout and the referrer’s reward.',
  'Rabais offert à l’amie ($)': 'Discount offered to the friend ($)',
  'Commande minimale de l’amie ($)': 'Friend’s minimum order ($)',
  'articles, avant taxes et livraison': 'items, before taxes and shipping',
  'Récompense de la marraine ($)': 'Referrer’s reward ($)',
  'en crédit boutique': 'in store credit',
  'Délai avant de verser (jours)': 'Delay before paying (days)',
  'Le rabais de l’amie est un coupon à usage unique, réservé à son courriel et non cumulable. Refusés par le serveur : la marraine elle-même, son adresse de livraison, et toute personne qui a déjà commandé.':
    'The friend’s discount is a single-use coupon, reserved for her email address and not combinable. Refused by the server: the referrer herself, her shipping address, and anyone who has already ordered.',
  'Amies invitées et bilan': 'Invited friends and statement',
  'en crédit boutique. Ce geste ne se défait pas.': 'in store credit. This cannot be undone.',
  'non versées :': 'not paid:',
  'Réglages du parrainage enregistrés.': 'Referral settings saved.',
  'Il faut au moins un palier.': 'At least one tier is required.',
  'Six paliers au plus.': 'Six tiers at most.',
  'Chaque palier a besoin d’un nom (français).': 'Each tier needs a (French) name.',
  'Seuil : entre 0 et 100 000 $.': 'Threshold: between $0 and $100,000.',
  'Deux paliers ne peuvent pas avoir le même seuil.': 'Two tiers cannot have the same threshold.',
  'Points en prime : entre 0 et 100 %.': 'Bonus points: between 0 and 100%.',
  'Les paliers': 'The tiers',
  'Paliers actifs': 'Tiers active',
  'Le statut dans le compte client, la livraison gratuite à la caisse, l’accès anticipé et les points en prime.':
    'The status in the customer account, free shipping at checkout, early access and bonus points.',
  'Nom (français)': 'Name (French)',
  'Nom (anglais)': 'Name (English)',
  'Dès ($ sur 12 mois)': 'From ($ over 12 months)',
  'Livraison gratuite': 'Free shipping',
  'Accès anticipé': 'Early access',
  'Points en prime (%)': 'Bonus points (%)',
  '+ Ajouter un palier': '+ Add a tier',
  'Enregistrer les paliers': 'Save the tiers',
  'Le palier d’un client se calcule au serveur sur ses achats des 12 derniers mois : articles après rabais, sans taxes ni livraison, commandes payées et non annulées, moins les remboursements. Les points en prime s’ajoutent au gel des points d’une commande.':
    'A customer’s tier is calculated by the server from their purchases over the last 12 months: items after discounts, excluding taxes and shipping, paid and non-cancelled orders, minus refunds. Bonus points are added when an order’s points are frozen.',
  'La livraison gratuite et l’accès anticipé s’appliquent dans la boutique, à partir du palier calculé par le serveur ; les frais de livraison d’une commande ne sont pas revérifiés au serveur.':
    'Free shipping and early access apply in the store, based on the tier calculated by the server; an order’s shipping fees are not rechecked by the server.',
  'Produits en accès anticipé': 'Early-access products',
  'Aucun produit marqué.': 'No product marked.',
  'Cochez « Accès anticipé » dans la fenêtre Produit et donnez la date d’ouverture à tous.':
    'Check “Early access” in the Product window and give the date it opens to everyone.',
  'Produit': 'Product',
  'Ouvert à tous le': 'Open to everyone on',
  '(inactif)': '(inactive)',
  'Réservé aux paliers': 'Reserved for tiers',
  'Ouvert à tous': 'Open to everyone',
  'Paliers enregistrés.': 'Tiers saved.',
  /* ── ACCÈS ANTICIPÉ AUTOMATIQUE (2026-10-07) ── */
  'Les nouveaux produits passent d’office en accès anticipé': 'New products automatically go into early access',
  'Dès sa mise en vente, un produit est réservé aux paliers qui ont droit à l’accès anticipé, puis il s’ouvre à tous après le délai ci-dessous. La page « Accès anticipé » de la boutique les présente.':
    'As soon as it goes on sale, a product is reserved for the tiers entitled to early access, then opens to everyone after the delay below. The shop’s “Early access” page showcases them.',
  'Durée de l’accès anticipé (heures)': 'Early-access duration (hours)',
  'Un produit coché « Accès anticipé » dans la fenêtre Produit garde la date que vous lui donnez. Le changement s’applique quand vous enregistrez les paliers.':
    'A product checked “Early access” in the Product window keeps the date you give it. The change applies when you save the tiers.',
  'Aucun produit en accès anticipé pour le moment.': 'No product in early access right now.',
  'Origine': 'Origin',
  'Automatique': 'Automatic',
  'Date choisie': 'Chosen date',
};
