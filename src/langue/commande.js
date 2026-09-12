'use strict';

/*
 * PREPARATION DE COMMANDE — les deux langues
 * =============================================================================
 * ⚠⚠ CET ECRAN ACHETE DES ETIQUETTES, DONC IL COUTE DE L ARGENT. Trois phrases
 * existent uniquement pour eviter un SECOND achat, et elles doivent rester
 * aussi nettes en anglais qu en francais :
 *   · « Une etiquette a deja ete facturee pour cette commande » ;
 *   · « En commander une seconde sera facture une seconde fois » ;
 *   · « Pour reimprimer celle qui existe, Imprimer l etiquette suffit. »
 * Les affaiblir en traduisant ferait payer deux fois.
 *
 * ⚠ « Expedier » ECRIT LE STATUT ET ENVOIE UN COURRIEL AU CLIENT. La phrase qui
 * le dit est un avertissement, pas une decoration.
 *
 * ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT : le numero de commande, le nom du client,
 * son adresse, les articles, le numero de suivi et le nom du transporteur sont
 * de la DONNEE. Les VALEURS des services (DOM.EP, FEDEX_GROUND) partent chez le
 * transporteur — `banc-langue-donnees` refuserait de les voir ici.
 */

module.exports = {
  'Préparation — Administration Sandriza': 'Preparation — Sandriza Administration',
  'Préparation': 'Preparation',
  'Préparation —': 'Preparation —',
  'Préparation indisponible': 'Preparation unavailable',
  'Commande indisponible': 'Order unavailable',
  'Votre rôle ne permet pas d’expédier.': 'Your role does not allow shipping.',
  'Commande en traitement ailleurs — lecture seule.': 'Order being handled elsewhere — read only.',
  'Cette commande est déjà en traitement ailleurs — lecture seule.':
    'This order is already being handled elsewhere — read only.',
  '⚡ Prioritaire': '⚡ Priority',

  /* ── ETAPE 1 : LE COLIS ─────────────────────────────────────────────────── */
  'Vérification du colis': 'Checking the parcel',
  'unités confirmées': 'units confirmed',
  'unités confirmées.': 'units confirmed.',
  'Vérifiez le colis d’abord —': 'Check the parcel first —',
  'Quantité préparée —': 'Quantity prepared —',
  'Code inconnu :': 'Unknown code:',
  'Déjà complet :': 'Already complete:',
  '(ligne complète)': '(line complete)',
  '🖨 Bon de commande': '🖨 Picking slip',
  '🧾 Bordereau': '🧾 Packing slip',
  'Envoi à l’impression…': 'Sending to the printer…',
  'Envoyé à l’impression.': 'Sent to the printer.',

  /* ── L OUVERTURE ────────────────────────────────────────────────────────── */
  '🚀 Préparation de la commande': '🚀 Order preparation',
  'Cette commande est déjà en préparation.': 'This order is already being prepared.',
  'Vous vous apprêtez à commencer la préparation de cette commande.':
    'You are about to start preparing this order.',
  'Désirez-vous (ré)imprimer un bon de commande avant de poursuivre ?':
    'Do you want to (re)print a picking slip before continuing?',
  'Pour débuter, désirez-vous imprimer un bon de commande ?':
    'To begin, do you want to print a picking slip?',
  'Non, continuer sans imprimer': 'No, continue without printing',
  '🖨 Oui, imprimer le bon': '🖨 Yes, print the slip',

  /* ── ETAPE 2 : L ETIQUETTE ──────────────────────────────────────────────── */
  'Étiquette d’expédition': 'Shipping label',
  'Poids du colis (kg)': 'Parcel weight (kg)',
  'Générer l’étiquette': 'Generate the label',
  '🖨 Imprimer l’étiquette': '🖨 Print the label',
  '— non configuré': '— not configured',
  '— transporteur non configuré —': '— carrier not configured —',
  'Ce transporteur n’a pas d’identifiants : Configuration → Transporteurs.':
    'This carrier has no credentials: Configuration → Carriers.',
  'Ce transporteur n’a pas d’identifiants — aucune étiquette ne peut être achetée. Configuration → Transporteurs.':
    'This carrier has no credentials — no label can be bought. Configuration → Carriers.',
  'Certains articles n’ont pas de poids configuré — estimation à 300 g par article. Vérifiez : le poids fixe le prix.':
    'Some items have no configured weight — estimated at 300 g each. Check it: the weight sets the price.',
  'Poids calculé depuis les articles de la commande.': 'Weight calculated from the order’s items.',
  'Le poids du colis doit être supérieur à zéro.': 'The parcel weight must be greater than zero.',
  'Demande au transporteur…': 'Requesting from the carrier…',
  'Étiquette créée': 'Label created',
  'Suivi :': 'Tracking:',
  'Imprimer l’étiquette et le bordereau maintenant ?': 'Print the label and packing slip now?',
  'Imprimer maintenant': 'Print now',
  'Impression de l’étiquette et du bordereau…': 'Printing the label and packing slip…',
  'Étiquette et bordereau envoyés à l’impression.': 'Label and packing slip sent to the printer.',
  'Aucun numéro reçu : l’étiquette n’a PAS été générée.':
    'No number received: the label was NOT generated.',
  'Aucune étiquette enregistrée pour cette commande.': 'No label recorded for this order.',
  'L’impression a échoué.': 'Printing failed.',
  'Le réseau a échoué — rien n’a été commandé.': 'The network failed — nothing was ordered.',
  'Le transporteur a refusé la demande.': 'The carrier refused the request.',
  'Identifiants du transporteur indisponibles. Reconnectez-vous, puis réessayez.':
    'Carrier credentials unavailable. Sign in again, then try again.',
  'Configuration du transporteur incomplète.': 'Carrier configuration is incomplete.',
  'Adresse d’expédition incomplète — Configuration puis Transporteurs.':
    'Shipping address incomplete — Configuration then Carriers.',
  'Adresse du destinataire incomplète dans la commande.':
    'Recipient address is incomplete in the order.',

  /* ── LE GARDE DU SECOND ACHAT — A NE PAS AFFAIBLIR ──────────────────────── */
  'Une étiquette existe déjà': 'A label already exists',
  'Une étiquette existe déjà pour cette commande — rien n’a été commandé.':
    'A label already exists for this order — nothing was ordered.',
  'Une étiquette a déjà été facturée pour cette commande':
    'A label has already been billed for this order',
  'En commander une seconde sera facturé une': 'Ordering a second one will be billed a',
  'seconde fois . Pour réimprimer celle qui existe, « 🖨 Imprimer l’étiquette » suffit.':
    'second time . To reprint the existing one, « 🖨 Print the label » is enough.',
  'Commander quand même': 'Order anyway',

  /* ── ETAPE 3 : EXPEDIER ─────────────────────────────────────────────────── */
  'Expédier': 'Ship',
  'Numéro de suivi': 'Tracking number',
  'Expédier sans numéro de suivi': 'Ship without a tracking number',
  'Marquer « prête à l’expédition »': 'Mark « ready to ship »',
  'Marquée prête à l’expédition.': 'Marked ready to ship.',
  'Marque « prête » retirée.': '« Ready » mark removed.',
  'Marquer la commande expédiée et prévenir le client':
    'Mark the order shipped and notify the customer',
  '« Expédier » écrit le statut, envoie le courriel de suivi':
    '« Ship » writes the status, sends the tracking email',
  'au client et referme cette fenêtre.': 'to the customer and closes this window.',
  'Entrez un numéro de suivi, ou cochez « expédier sans numéro ».':
    'Enter a tracking number, or tick « ship without a number ».',
  'Générez l’étiquette, ou cochez « Expédier sans numéro de suivi ».':
    'Generate the label, or tick « Ship without a tracking number ».',
  'Générez l’étiquette (étape 2), ou cochez « Expédier sans numéro de suivi ».':
    'Generate the label (step 2), or tick « Ship without a tracking number ».',
  'Expédiée sans numéro de suivi.': 'Shipped without a tracking number.',
  'Expédiée — courriel envoyé.': 'Shipped — email sent.',
  'aucun — assumé': 'none — assumed',

  /* ── LES FRAGMENTS TELS QU ILS EXISTENT DANS LE GABARIT ────────────────
     ⚠ « bon de commande » et « seconde fois » sont dans des <strong>, l émoji de
     l étiquette dans son propre <span> : la forme RENDUE n existe nulle part
     dans le fichier. On traduit donc les morceaux tels qu ils sont écrits. */
  'bon de commande': 'picking slip',
  'Désirez-vous (ré)imprimer un ': 'Do you want to (re)print a ',
  ' avant de poursuivre ?': ' before continuing?',
  'Pour débuter, désirez-vous imprimer un ': 'To begin, do you want to print a ',
  'En commander une seconde sera facturé une ': 'Ordering a second one will be billed a ',
  'seconde fois': 'second time',
  '. Pour réimprimer celle qui existe, « ': '. To reprint the existing one, « ',
  ' Imprimer l’étiquette » suffit.': ' Print the label » is enough.',
  'Imprimer l’étiquette': 'Print the label',
  /* ⚠ Le <strong> tombe AU MILIEU de « facturé une seconde fois » : le gabarit
     écrit « … sera <strong>facturé une » puis « seconde fois</strong> ». */
  'En commander une seconde sera ': 'Ordering a second one will be ',
  'facturé une ': 'billed a ',
};
