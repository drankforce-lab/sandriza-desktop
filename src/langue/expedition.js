'use strict';

/*
 * EXPÉDIER UNE COMMANDE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN DEPENSE DE L ARGENT, et c est ce qui doit guider chaque
 * traduction. Une etiquette de transporteur est FACTUREE des sa creation et ne
 * s annule pas. Cinq phrases n existent que pour eviter un SECOND achat, et
 * elles doivent rester aussi NETTES en anglais qu en francais :
 *   · « Une etiquette a deja ete creee pour cette commande » ;
 *   · « En commander une seconde serait facture une seconde fois » ;
 *   · « Une etiquette est facturee des sa creation et ne s annule pas » ;
 *   · l avertissement du POIDS ESTIME — c est le poids qui fixe le prix ;
 *   · l avertissement du CODE POSTAL manquant — aucun transporteur n accepte.
 * Les adoucir en traduisant ferait payer deux fois, ou etiqueter quatre kilos
 * pour cinq cents grammes.
 *
 * ⚠⚠ « MARQUER EXPEDIEE » ECRIT LE STATUT ET ENVOIE UN COURRIEL AU CLIENT.
 * La phrase qui separe les deux gestes (« Creer l etiquette n expedie pas ») est
 * la seule qui l enseigne : sans elle, on croit qu un seul bouton suffit.
 *
 * ⚠⚠ LES MEMES MOTIFS QUE `commande.js`, AUX MEMES MOTS. Les deux fenetres
 * achetent la meme etiquette et relaient les memes refus du transporteur ; deux
 * traductions differentes de « Le transporteur a refuse la demande » se
 * liraient comme deux pannes differentes. On recopie a dessein.
 *
 * ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT : le numero de commande, le nom et
 * l adresse du destinataire, le numero de suivi, le nom du transporteur et le
 * LIBELLE DES SERVICES viennent du transporteur ou de la base. Les VALEURS des
 * services (DOM.EP, FEDEX_GROUND) partent chez le transporteur —
 * `banc-langue-donnees` refuserait de les voir ici.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Expédier une commande — Administration Sandriza': 'Ship an order — Sandriza Administration',
  'Expédier une commande': 'Ship an order',
  /* ⚠ Le titre se reecrit avec le numero de commande, qui est de la DONNEE :
     la source ecrit `'Expédier ' + r.commande.numero`. */
  'Expédier ': 'Ship ',

  /* ── LES MOTIFS DE REFUS (les memes que commande.js, aux memes mots) ─────── */
  'Votre rôle ne permet pas d’expédier une commande.': 'Your role does not allow shipping an order.',
  'Le transporteur n’a pas répondu à temps.': 'The carrier did not answer in time.',
  'Cette commande n’existe plus.': 'This order no longer exists.',
  'Commande ouverte par quelqu’un d’autre.': 'Order open by someone else.',
  'Un numéro de suivi est requis — ou confirmez l’envoi sans numéro.':
    'A tracking number is required — or confirm sending without one.',
  'Le poids du colis doit être supérieur à zéro.': 'The parcel weight must be greater than zero.',
  'Une étiquette existe déjà pour cette commande — rien n’a été commandé.':
    'A label already exists for this order — nothing was ordered.',
  'Identifiants du transporteur indisponibles. Reconnectez-vous, puis réessayez.':
    'Carrier credentials unavailable. Sign in again, then try again.',
  'Configuration du transporteur incomplète.': 'Carrier configuration is incomplete.',
  'Adresse d’expédition incomplète — Configuration puis Transporteurs.':
    'Shipping address incomplete — Configuration then Carriers.',
  'Adresse du destinataire incomplète dans la commande.':
    'Recipient address is incomplete in the order.',
  'Le transporteur a refusé la demande.': 'The carrier refused the request.',
  'Aucune étiquette enregistrée pour cette commande.': 'No label recorded for this order.',
  'L’impression a échoué.': 'Printing failed.',
  'Le réseau a échoué — rien n’a été commandé.': 'The network failed — nothing was ordered.',

  /* ── LE PAS-A-PAS ────────────────────────────────────────────────────────── */
  '1 · Étiquette': '1 · Label',
  '2 · Impression': '2 · Printing',
  '3 · Expédiée': '3 · Shipped',

  /* ── LA COMMANDE ET SON ADRESSE ─────────────────────────────────────────── */
  'Commande': 'Order',
  'Commande —': 'Order —',
  'Destinataire': 'Recipient',
  ' article': ' item',
  /* ⚠⚠ LE CODE POSTAL MANQUANT : la source coupe la phrase en deux, le premier
     morceau derriere le pictogramme d avertissement. C est le seul endroit qui
     dit POURQUOI l envoi sera refuse — on garde les deux moities aussi nettes. */
  'Aucun code postal sur cette commande — aucun transporteur ':
    'No postal code on this order — no carrier ',
  'n’acceptera l’envoi. Corrigez l’adresse avant de commander une étiquette.':
    'will accept the shipment. Fix the address before ordering a label.',
  '⚠ Aucun code postal sur cette commande — aucun transporteur':
    '⚠ No postal code on this order — no carrier',

  /* ── L ETIQUETTE, ET LE GARDE DU SECOND ACHAT ───────────────────────────── */
  'Étiquette': 'Label',
  'Une étiquette a déjà été créée pour cette commande': 'A label has already been created for this order',
  '⚠ Une étiquette a déjà été créée pour cette commande':
    '⚠ A label has already been created for this order',
  ' (suivi ': ' (tracking ',
  '. En commander une seconde serait ': '. Ordering a second one would be ',
  'facturé une seconde fois': 'billed a second time',
  '. En commander une seconde serait facturé une seconde fois .':
    '. Ordering a second one would be billed a second time .',
  'Transporteur': 'Carrier',
  'Service': 'Service',
  ' — non configuré': ' — not configured',
  '— non configuré': '— not configured',
  'Poids du colis (kg)': 'Parcel weight (kg)',

  /* ⚠⚠ LE POIDS FIXE LE PRIX — l avertissement est coupe par le pictogramme. */
  'Certains articles n’ont pas de poids configuré — estimation à ':
    'Some items have no configured weight — estimated at ',
  '300 g par article. Vérifiez avant de commander : c’est le poids qui fixe le prix.':
    '300 g each. Check before ordering: the weight sets the price.',
  '⚠ Certains articles n’ont pas de poids configuré — estimation à':
    '⚠ Some items have no configured weight — estimated at',
  'Poids calculé depuis les articles de la commande': 'Weight calculated from the order’s items',
  '✅ Poids calculé depuis les articles de la commande':
    '✅ Weight calculated from the order’s items',
  ' (remboursements déduits)': ' (refunds deducted)',
  '(remboursements déduits)': '(refunds deducted)',
  ' n’est pas configuré — aucune étiquette ': ' is not configured — no real label ',
  'réelle n’est possible. Configuration puis Transporteurs dans la fenêtre principale.':
    'is possible. Configuration then Carriers in the main window.',
  'n’est pas configuré — aucune étiquette': 'is not configured — no real label',

  /* ── MARQUER EXPEDIEE — LE SECOND GESTE ─────────────────────────────────── */
  'Marquer expédiée': 'Mark shipped',
  'Numéro de suivi': 'Tracking number',
  'Rempli tout seul par l’étiquette': 'Filled in by the label',
  '✓ Déjà expédiée': '✓ Already shipped',
  '✓ Marquer expédiée': '✓ Mark shipped',
  '✓ Expédier SANS numéro': '✓ Ship WITHOUT a number',
  /* ⚠⚠ LA PHRASE QUI SEPARE LES DEUX GESTES. Sans elle, on croit qu un seul
     bouton suffit — et le colis reste sur la table pendant que la cliente
     recoit son courriel de suivi. */
  'Créer l’étiquette n’expédie pas : ': 'Creating the label does not ship: ',
  'c’est ce bouton qui marque la commande et envoie le courriel de suivi au client.':
    'this button is what marks the order and sends the tracking email to the customer.',
  'Créer l’étiquette n’expédie pas :': 'Creating the label does not ship:',

  /* ── LES BOUTONS DU PIED ────────────────────────────────────────────────── */
  'Aperçu': 'Preview',
  'Étiquette + bordereau': 'Label + packing slip',
  'Bordereau seul': 'Packing slip only',
  'Créer une AUTRE étiquette': 'Create ANOTHER label',
  'Créer l’étiquette': 'Create the label',
  '👁 Aperçu': '👁 Preview',
  '🖨 Étiquette + bordereau': '🖨 Label + packing slip',
  '🧾 Bordereau seul': '🧾 Packing slip only',
  '💳 Créer une AUTRE étiquette': '💳 Create ANOTHER label',
  '💳 Créer l’étiquette': '💳 Create the label',
  'Impression du bordereau…': 'Printing the packing slip…',
  'Bordereau envoyé à l’impression.': 'Packing slip sent to the printer.',

  /* ── LA CONFIRMATION QUI PRECEDE LA DEPENSE ─────────────────────────────── */
  'Commander l’étiquette ?': 'Order the label?',
  '💳 Commander l’étiquette ?': '💳 Order the label?',
  'Une étiquette est ': 'A label is ',
  'facturée dès sa création': 'billed as soon as it is created',
  ' et ne s’annule pas.': ' and cannot be cancelled.',
  'Une étiquette est facturée dès sa création et ne s’annule pas.':
    'A label is billed as soon as it is created and cannot be cancelled.',
  'Transporteur : ': 'Carrier: ',
  'Service : ': 'Service: ',
  'Poids : ': 'Weight: ',
  'Transporteur :': 'Carrier:',
  'Service :': 'Service:',
  'Poids :': 'Weight:',
  'Une étiquette existe déjà pour cette commande. ': 'A label already exists for this order. ',
  'En commander une seconde sera facturé une seconde fois.':
    'Ordering a second one will be billed a second time.',
  '⚠ Une étiquette existe déjà pour cette commande.': '⚠ A label already exists for this order.',
  'Commander': 'Order',
  'Création… (jusqu’à 35 s)': 'Creating… (up to 35 s)',
  '⏳ Création… (jusqu’à 35 s)': '⏳ Creating… (up to 35 s)',
  'Demande au transporteur…': 'Requesting from the carrier…',

  /* ── L ETIQUETTE CREEE ──────────────────────────────────────────────────── */
  'Étiquette créée — suivi ': 'Label created — tracking ',
  'Étiquette créée — suivi': 'Label created — tracking',
  'Étiquette créée': 'Label created',
  '✅ Étiquette créée': '✅ Label created',
  'Suivi : ': 'Tracking: ',
  'Suivi :': 'Tracking:',
  'Plus tard': 'Later',
  'Imprimer maintenant': 'Print now',
  '🖨 Imprimer maintenant': '🖨 Print now',
  'Impression de l’étiquette et du bordereau…': 'Printing the label and packing slip…',
  'Étiquette et bordereau envoyés à l’impression.': 'Label and packing slip sent to the printer.',

  /* ── L APERCU ───────────────────────────────────────────────────────────── */
  'Lecture de l’étiquette…': 'Reading the label…',
  'Étiquette — ': 'Label — ',
  '👁 Étiquette —': '👁 Label —',
  'Fermer': 'Close',
  'Imprimer': 'Print',
  '🖨 Imprimer': '🖨 Print',

  /* ── EXPEDIER SANS NUMERO — LE DOUBLE GESTE ─────────────────────────────── */
  /* ⚠⚠ ON N INVENTE JAMAIS UN NUMERO DE SUIVI. Cette phrase est l aveu qu il
     faut assumer : un numero fabrique, la cliente le cherche chez le
     transporteur, ne trouve rien, et ecrit au service a la clientele. */
  'Aucun numéro de suivi : le client recevra un courriel SANS lien de suivi. ':
    'No tracking number: the customer will receive an email WITHOUT a tracking link. ',
  'Recliquez pour confirmer, ou collez le numéro du transporteur.':
    'Click again to confirm, or paste the carrier’s number.',
  'Aucun numéro de suivi : le client recevra un courriel SANS lien de suivi.':
    'No tracking number: the customer will receive an email WITHOUT a tracking link.',
  ' expédiée — courriel envoyé.': ' shipped — email sent.',
  'expédiée — courriel envoyé.': 'shipped — email sent.',

  /* ── LES ECRANS VIDES ───────────────────────────────────────────────────── */
  'Expédition indisponible': 'Shipping unavailable',
  'Lecture seule': 'Read only',
  'Aucune commande': 'No order',
  'Ouvrez une commande depuis l’écran Expéditions.': 'Open an order from the Shipments screen.',
  'Commande indisponible': 'Order unavailable',
  'Expédition bloquée : cette commande est ouverte ailleurs.':
    'Shipping blocked: this order is open elsewhere.',
  'hors ligne': 'offline',
  'ouverte par ': 'open by ',
  /* ⚠ LA MÊME, SANS SON ESPACE FINALE. La source écrit `'ouverte par '` avant
     de coller un nom ; le compteur, lui, lit le texte RENDU, donc rogné. Les
     deux formes ont leur entrée — c'est la distinction source/rendu déjà connue
     du dépôt, et elle se paie à chaque texte qui touche une donnée. */
  'ouverte par': 'open by'
};
