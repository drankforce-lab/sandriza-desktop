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
  'Fiche client :': 'Customer file:',
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

  /* ── LA LONGUE TRAINE (voir banc-langue-residuel) ───────────────────────── */
  /* ⚠ LES TITRES DES ETAPES DE L ASSISTANT : ils s AFFICHENT dans le fil. Ce qui
     decide du passage a l etape suivante est `fait()`, une fonction — aucun de
     ces mots n est compare a quoi que ce soit. */
  'Vérification': 'Verification',
  'Étiquette': 'Label',
  'Expédition': 'Shipping',
  'Récapitulatif': 'Summary',
  'Numéro': 'Number',

  /* ── LA FORME DE LA SOURCE, A COTE DE LA FORME RENDUE ──────────────────────
     ⚠⚠ LES DEUX SE VALENT ET NE SERVENT PAS AU MEME. Les cles a pictogramme
     ci-dessus (« 🖨 Bon de commande », « 🧾 Bordereau », « ⚡ Prioritaire »,
     « 🚀 Preparation de la commande », « 🖨 Oui, imprimer le bon ») sont la forme
     RENDUE : c est ce que le compteur interroge, et il annoncait donc zero. Mais
     dans la source le signe vit dans son propre `<span class="ic">`, et une cle
     ne traverse jamais un attribut : le poseur ne les a JAMAIS trouvees, et ces
     cinq textes sont restes en francais sur la page anglaise. On ecrit donc
     AUSSI la forme que la source contient — celle qui commence apres le </span>. */
  'Prioritaire': 'Priority',
  'Bon de commande': 'Picking slip',
  'Bordereau': 'Packing slip',
  'Oui, imprimer le bon': 'Yes, print the slip',
  'Préparation de la commande': 'Order preparation',

  /* ── LES ATTRIBUTS ECRITS DANS LE SCRIPT ────────────────────────────────────
     ⚠ Cette fenetre fabrique son HTML DANS le script : ses `aria-label` et ses
     `placeholder` n etaient lus par aucun banc avant le 2026-09-12. Le champ de
     scan est le premier que la preparatrice voit, et il etait en francais. */
  'Scannez le code-barres de l’article': 'Scan the item’s barcode',
  'Scannez le code-barres de l’article…': 'Scan the item’s barcode…',
  'Filtrer': 'Filter',
  'Filtrer…': 'Filter…',
  'rempli par l’étiquette': 'filled in by the label',

  /* ── LE RECAPITULATIF, ET LES MOTS QU AUCUN BANC NE POUVAIT VOIR ────────────
     ⚠⚠ CE BLOC-CI N ETAIT SIGNALE PAR RIEN. Le banc du residuel ecarte les
     chaines d UN SEUL MOT (`'Commande'`, `'Client'`, `'Transporteur'`, `'aucun'`)
     parce qu elles ressemblent a des cles techniques, et son lexique ignore les
     mots de MOINS DE QUATRE LETTRES (`sur`). Le recapitulatif de l etape 3 se
     lisait donc, EN ANGLAIS : « Commande / Client / Verification : 3 sur 5 —
     INCOMPLET / Transporteur / Tracking number : aucun ».
     ⚠ « sur » se traduit seul parce que l ordre des mots ne change pas :
     « 3 sur 5 unites confirmees » → « 3 of 5 units confirmed ». */
  'Commande': 'Order',
  'Client': 'Customer',
  'Transporteur': 'Carrier',
  'colis complet': 'parcel complete',
  'incomplet': 'incomplete',
  '— INCOMPLET': '— INCOMPLETE',
  'aucun': 'none',
  'sur': 'of',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Service': 'Service',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'en traitement par': 'being edited by',
  "Le colis": "The parcel",
  "unité confirmée": "unit confirmed",
  "unité confirmée.": "unit confirmed.",
  "Articles": "Items",
  "ligne": "line",
  "lignes": "lines",
  "Suivi": "Tracking",
  "Prête": "Ready",
  "En préparation": "Being prepared",
  "Vérifier le colis": "Check the parcel",
  "L’étiquette, ou « sans numéro de suivi »": "The label, or « no tracking number »",
  "Pour expédier": "To ship",
  "Prête à expédier": "Ready to ship",
  "Statut": "Status",
  // Refonte de la préparation, deux jeux de clés des transporteurs (2026-10-19).
  "Les étiquettes de ce transporteur se créent avec les clés de test : rien n’est facturé.": "This carrier’s labels are created with the test keys: nothing is billed.",
  "BAC À SABLE": "SANDBOX",
  "Étapes de la préparation": "Preparation steps",
  "Cette commande est déjà expédiée.": "This order has already shipped.",
  "Imprimer (ou réimprimer) le bon de commande": "Print (or reprint) the picking slip",
  "Créez l’étiquette, ou cochez « Expédier sans numéro de suivi ».": "Create the label, or tick « Ship without a tracking number ».",
  "Recommencer": "Start over",
  "Scannez l’étiquette de chaque article": "Scan each item’s label",
  "En attente du lecteur…": "Waiting for the scanner…",
  "Articles de la commande": "Order items",
  "Progression": "Progress",
  "Quand tout est scanné, l’étiquette s’ouvre d’elle-même. La progression est gardée si vous fermez.": "Once everything is scanned, the label step opens by itself. Progress is kept if you close.",
  "Lecteur absent ?": "No scanner?",
  "Cocher à la main": "Check by hand",
  "Documents": "Documents",
  "Continuer → Étiquette": "Continue → Label",
  "Colis vérifié": "Parcel checked",
  "Aller à l’expédition": "Go to shipping",
  "Tarifs réels": "Actual rates",
  "Lus en production · aucune facturation": "Read in production · nothing billed",
  "Poids (kg)": "Weight (kg)",
  "Long. (cm)": "Length (cm)",
  "Larg. (cm)": "Width (cm)",
  "Haut. (cm)": "Height (cm)",
  "Recoter": "Re-quote",
  "Tarifs des transporteurs": "Carrier rates",
  "Écart affiché par rapport au tarif le moins cher. Coût réel hors taxes.": "Difference shown against the cheapest rate. Actual cost before taxes.",
  "Livraison de cette commande": "Shipping for this order",
  "Le client a payé": "Customer paid",
  "Étiquette choisie": "Selected label",
  "Gain sur la livraison": "Shipping margin",
  "Expédier sans numéro de suivi (remise en main propre)": "Ship without a tracking number (hand delivery)",
  "Créer l’étiquette": "Create the label",
  "Prendre le moins cher": "Take the cheapest",
  "Imprimer le bordereau": "Print the packing slip",
  "Avant de fermer la boîte": "Before closing the box",
  "Bordereau glissé dans le colis": "Packing slip placed in the parcel",
  "Étiquette collée sur le dessus": "Label stuck on top",
  "Carte de remerciement ajoutée (facultatif)": "Thank-you card added (optional)",
  "Marquer « prête à l’expédition » (on y revient plus tard)": "Mark « ready to ship » (come back to it later)",
  "À l’envoi": "On shipping",
  "La commande passe à « Expédiée »": "The order becomes « Shipped »",
  "Le client reçoit son courriel avec le suivi": "The customer gets the tracking email",
  "Le stock est déjà ajusté": "Stock is already adjusted",
  "Marquer comme expédiée": "Mark as shipped",
  "Scanné": "Scanned",
  "À scanner": "To scan",
  "Retirer une unité": "Remove one unit",
  "Ajouter une unité": "Add one unit",
  "Aucun article à préparer dans cette commande.": "No item to prepare in this order.",
  "n’est pas dans cette commande. Rien n’a été compté — scannez l’article suivant.": "is not in this order. Nothing was counted — scan the next item.",
  ". Rien n’a été compté — scannez l’article suivant.": ". Nothing was counted — scan the next item.",
  "n’est plus à expédier (remboursé). Rien n’a été compté.": "no longer needs shipping (refunded). Nothing was counted.",
  "Le scan n’a pas pu être vérifié — réessayez.": "The scan could not be checked — try again.",
  "L’avancement du scan n’a pas pu être gardé :": "Scan progress could not be saved:",
  "Vérification reprise là où elle avait été laissée —": "Check resumed where it was left —",
  "article déjà scanné": "item already scanned",
  "articles déjà scannés": "items already scanned",
  "par": "by",
  "Recommencer la vérification": "Restart the check",
  "Tous les articles déjà scannés de cette commande repassent à zéro, ici et sur les autres postes.": "All items already scanned for this order go back to zero, here and on other workstations.",
  "Remettre à zéro": "Reset to zero",
  "Vérification remise à zéro.": "Check reset.",
  "Impression du bon de commande…": "Printing the picking slip…",
  "Impression du bordereau…": "Printing the packing slip…",
  "Bon de commande envoyé à l’impression.": "Picking slip sent to the printer.",
  "Bordereau envoyé à l’impression.": "Packing slip sent to the printer.",
  "suivi": "tracking",
  " — en créer une autre la facturerait une seconde fois.": " — creating another one would bill it a second time.",
  "pas de réponse": "no answer",
  "Tarifs réels — colis": "Actual rates — parcel",
  "Choisi à la vente": "Chosen at checkout",
  "Le moins cher": "Cheapest",
  "bac à sable": "sandbox",
  "jour ouvrable": "business day",
  "jours ouvrables": "business days",
  "cotation seulement — étiquette non branchée dans l’application": "quote only — labels not connected in the app",
  "Interrogation…": "Asking…",
  "pas de tarif": "no rate",
  "Interrogation des transporteurs…": "Asking the carriers…",
  "Aucun transporteur actif n’a donné de tarif. Vérifiez Configuration → Transporteurs.": "No active carrier returned a rate. Check Settings → Carriers.",
  "Choisissez un tarif.": "Choose a rate.",
  "Cette étiquette sera": "This label will be",
  "FACTURÉE": "BILLED",
  "par le transporteur (jeu de production).": "by the carrier (production keys).",
  "L’étiquette est créée dans le": "The label is created in the",
  " : rien n’est facturé pendant les essais.": ": nothing is billed while testing.",
  "Livraison offerte au client : l’étiquette est une dépense.": "Free shipping for the customer: the label is an expense.",
  "Créer l’étiquette ·": "Create the label ·",
  "Étiquette plus chère que le choix de la vente": "Label more expensive than the checkout choice",
  "Le client a choisi un autre service à la caisse. Celui-ci coûte plus cher.": "The customer chose another service at checkout. This one costs more.",
  "Choix de la vente": "Checkout choice",
  "Votre choix": "Your choice",
  "Écart": "Difference",
  "Créer quand même": "Create anyway",
  "Une étiquette a déjà été créée pour cette commande. En créer une seconde la facturerait une seconde fois (sauf en bac à sable).": "A label was already created for this order. Creating a second one would bill it a second time (except in the sandbox).",
  "Suivi actuel": "Current tracking",
  "Créer une seconde étiquette": "Create a second label",
  "Étiquette facturée": "Billed label",
  "Ce transporteur est en PRODUCTION : l’étiquette sera facturée.": "This carrier is in PRODUCTION: the label will be billed.",
  "Coût estimé": "Estimated cost",
  "Créer et payer l’étiquette": "Create and pay for the label",
  "Sans étiquette — remise en main propre": "No label — hand delivery",
  "Aucune étiquette": "No label",
  "Créez l’étiquette (étape Étiquette), ou cochez « Expédier sans numéro de suivi ».": "Create the label (Label step), or tick « Ship without a tracking number ».",
  "Cochez « Bordereau glissé » et « Étiquette collée » avant de fermer la boîte.": "Tick « Packing slip placed » and « Label stuck » before closing the box.",
  "Expédition…": "Shipping…",
  "Expédiée": "Shipped",
  "Commande suivante": "Next order",
  "en attente": "waiting",
  "Revenir au lecteur": "Back to the scanner",
  "Cette commande est déjà en préparation. Réimprimer le bon de commande avant de poursuivre ?": "This order is already being prepared. Reprint the picking slip before continuing?",
  "Pour débuter, imprimer le bon de commande ?": "To start, print the picking slip?",
  "Non, continuer": "No, continue",
  "Imprimer le bon": "Print the slip",
  "article": "item",
  "articles": "items",
  "Note :": "Note:",
  "Interrogation :": "Asking:",
  "Sans tarif pour ce colis :": "No rate for this parcel:",
  "Le transporteur choisi à la vente": "The carrier chosen at checkout",
  "n’est plus activé.": "is no longer enabled.",
  "Aucun transporteur activé. Configuration → Transporteurs.": "No carrier enabled. Settings → Carriers.",
  "L’étiquette sera créée en PRODUCTION : elle sera facturée.": "The label will be created in PRODUCTION: it will be billed.",
  /* (2026-10-19) Décisions pour banc-langue-fenetres : les fragments de code, sélecteurs, polices et noms
     de services se rendent à l’identique ; les textes d’interface sont traduits. */
  "🖨 Bon de commande Ctrl+B": "🖨 Purchase order Ctrl+B",
  "Continuer → Étiquette F9": "Continue → Label F9",
  "Créer l’étiquette F9": "Create the label F9",
  "Marquer comme expédiée F9": "Mark as shipped F9",
  // Vérification : restants paginés, validés compacts (2026-10-19).
  "Articles à scanner": "Items to scan",
  "Validés": "Checked",
  "Articles validés": "Checked items",
  "Annuler un scan — remettre à scanner": "Undo a scan — put back to scan",
  "Annuler un scan": "Undo a scan",
  "Tout est scanné.": "Everything is scanned.",
  "restant": "left",
  "restants": "left",
  "Aucun article validé pour l’instant.": "No item checked yet.",
  "repasse dans les articles à scanner.": "goes back to the items to scan.",
  "Remettre à scanner": "Put back to scan",
  "remis à scanner.": "put back to scan.",
  "Étiquette imprimée — le bordereau ne l’a PAS été :": "Label printed — the packing slip was NOT:",
  "Étiquette partie vers l’imprimante — plus longue que d’habitude.": "Label sent to the printer — taking longer than usual.",
  "Étiquette et bordereau imprimés": "Label and packing slip printed",
  "Aucune étiquette — remise en main propre ou à créer.": "No label — hand delivery or still to create.",
  "Chargement de l’aperçu": "Loading the preview",
  "Aperçu indisponible — l’étiquette reste imprimable.": "Preview unavailable — the label can still be printed.",
  "Agrandir": "Enlarge",
  "Agrandir l’étiquette, page": "Enlarge the label, page",
  "Étiquette agrandie": "Enlarged label",
  "Création refusée : le prix a changé.": "Creation refused: the price changed.",
  "Prix facturé différent du prix affiché.": "Billed price differs from the displayed price.",
  "Création refusée : prix affiché absent.": "Creation refused: displayed price missing.",
  "Création refusée : option non cotée.": "Creation refused: option not quoted.",
  "Création refusée : colis ou adresse à corriger.": "Creation refused: parcel or address to fix.",
  "Une étiquette existe déjà pour cette commande.": "A label already exists for this order.",
  "Une étiquette est déjà en cours de création.": "A label is already being created.",
  "Étiquette BLOQUÉE.": "Label BLOCKED.",
  "Ce document n’est pas une étiquette 4 × 6.": "This document is not a 4 × 6 label.",
  "Cette commande est déjà terminée.": "This order is already completed.",
  "En bac à sable, Postes Canada et FedEx facturent le tarif du COMPTE DE TEST :": "In the sandbox, Canada Post and FedEx bill the TEST ACCOUNT rate:",
  "(prix de test vérifié à la création ; prix contrat": "(test price checked at creation; contract price",
  "indisponible": "unavailable",
  "cotation des clés de test…": "quoting with the test keys…",
  "service non offert avec les clés de test": "service not offered with the test keys",
  "Prix de création non vérifié — rien n’a été envoyé.": "Creation price not verified — nothing was sent.",
  "Étiquette BLOQUÉE :": "Label BLOCKED:",
  "La commande a été remise à Confirmée par": "The order was set back to Confirmed by",
  " — la préparation recommence.": " — preparation starts over.",
  "quelqu’un": "someone",
  /* (2026-10-20) Annuler l’étiquette, depuis la préparation. */
  'Annuler l’étiquette': 'Cancel the label',
  'Annuler l’envoi': 'Cancel the shipment',
  'L’envoi est annulé chez le transporteur : il n’est pas facturé et l’étiquette imprimée n’est plus valable. Le numéro de suivi est retiré de la commande ; vous pourrez ensuite créer une nouvelle étiquette. Cette action est irréversible.': 'The shipment is cancelled with the carrier: it is not billed and the printed label is no longer valid. The tracking number is removed from the order; you can then create a new label. This cannot be undone.',
  'Demande d’annulation au transporteur…': 'Asking the carrier to cancel…',
  'Étiquette annulée chez le transporteur — rien n’est facturé. Vous pouvez en créer une nouvelle.': 'Label cancelled with the carrier — nothing is billed. You can create a new one.',
  'L’envoi est annulé chez le transporteur et l’étiquette imprimée n’est plus valable. Si elle est déjà payée (compte payé par carte), son remboursement est demandé à la place : il prend quelques jours. Le numéro de suivi est retiré de la commande ; vous pourrez ensuite créer une nouvelle étiquette. Cette action est irréversible.': 'The shipment is cancelled with the carrier and the printed label is no longer valid. If it is already paid (credit-card account), a refund is requested instead: it takes a few days. The tracking number is removed from the order; you can then create a new label. This cannot be undone.',
  // (2026-10-25, audit) Une commande ne s’expédie qu’une fois.
  'Cette commande est déjà expédiée.': 'This order has already been shipped.',
  'Cette commande est déjà expédiée — aucun second courriel n’est parti.': 'This order has already been shipped — no second email was sent.',
};
