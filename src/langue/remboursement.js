'use strict';

/*
 * REMBOURSEMENT — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CET ECRAN REND DE L ARGENT A UNE CLIENTE, et un remboursement ne
 * s annule pas d un clic. Quatre phrases ne sont pas des libelles mais des
 * GARDE-FOUS, et elles doivent rester aussi nettes en anglais :
 *   · « Un remboursement ne s annule pas d un clic. » ;
 *   · « Deja expediee : le transporteur a ete paye. A votre discretion » —
 *     c est la seule chose qui distingue un geste commercial d une erreur ;
 *   · « Square ne rembourse pas ses frais » — la boutique les perd ;
 *   · « Renoncer aux frais de service Square exige le code confidentiel ».
 * Les adoucir en traduisant ferait rendre plus que prevu, ou moins.
 *
 * ⚠⚠ LES DEUX MODES NE SE VALENT PAS, ET LA TRADUCTION DOIT LE GARDER :
 * le CREDIT BOUTIQUE reste dans la boutique et n expire jamais ; le MOYEN DE
 * PAIEMENT ORIGINAL sort l argent par Square, en 5 a 7 jours ouvrables, et
 * Square garde ses frais. « Store credit » et « original payment method » se
 * lisent d un coup d oeil, comme en francais.
 *
 * ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT. Le MOTIF que l on tape est de la DONNEE :
 * il se relit quand la cliente conteste, parfois par quelqu un d autre. Seul son
 * EXEMPLE (le placeholder) suit la langue du poste — il ne sort pas de
 * l administration. Le numero de remboursement, le numero de credit, les noms
 * de taxes et les montants viennent du site.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Remboursement — Administration Sandriza': 'Refund — Sandriza Administration',
  'Remboursement': 'Refund',
  /* ⚠ Le titre se reecrit avec le numero, qui est de la DONNEE. */
  'Remboursement — ': 'Refund — ',
  'Remboursement —': 'Refund —',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne permet pas de rembourser.': 'Your role does not allow refunding.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not answer in time.',
  'Cette commande n’existe plus.': 'This order no longer exists.',
  'Commande ouverte par quelqu’un d’autre.': 'Order open by someone else.',
  'Indiquez le motif du remboursement.': 'State the reason for the refund.',
  'Sélectionnez au moins un article.': 'Select at least one item.',
  'Commande déjà entièrement remboursée.': 'Order already fully refunded.',
  'Montant du remboursement invalide.': 'Invalid refund amount.',
  'Aucun paiement Square lié à cette commande.': 'No Square payment linked to this order.',
  'Le code d’exemption est requis pour renoncer aux frais.':
    'The exemption code is required to waive the fees.',
  'Code d’exemption incorrect.': 'Incorrect exemption code.',

  /* ── LA COMMANDE DEJA REMBOURSEE ────────────────────────────────────────── */
  'Commande entièrement remboursée — total : ': 'Order fully refunded — total: ',
  '✅ Commande entièrement remboursée — total :': '✅ Order fully refunded — total:',
  'Tous les articles de cette commande ont déjà été remboursés.':
    'Every item in this order has already been refunded.',
  ' déjà remboursés': ' already refunded',
  'déjà remboursés': 'already refunded',

  /* ── LES ARTICLES ───────────────────────────────────────────────────────── */
  'Articles à rembourser ': 'Items to refund ',
  '— quantités plafonnées au pas-encore-remboursé': '— quantities capped at what is not yet refunded',
  'Articles à rembourser — quantités plafonnées au pas-encore-remboursé':
    'Items to refund — quantities capped at what is not yet refunded',
  ' / unité': ' / unit',
  '/ unité': '/ unit',
  'max ': 'max ',
  /* ⚠ L etiquette du champ de quantite porte le NOM DE L ARTICLE, qui est de la
     donnee : la source ecrit `'Quantité à rembourser — ' + a.nom`. */
  'Quantité à rembourser — ': 'Quantity to refund — ',
  'Quantité à rembourser —': 'Quantity to refund —',

  /* ── LA LIVRAISON ───────────────────────────────────────────────────────── */
  'Livraison': 'Shipping',
  'Livraison —': 'Shipping —',
  ' · prioritaire': ' · priority',
  'Inclure les frais de livraison': 'Include the shipping fees',
  'La commande n’a pas encore été expédiée — frais remboursables.':
    'The order has not shipped yet — the fees can be refunded.',
  /* ⚠⚠ CELLE-CI TRANCHE UNE DECISION D ARGENT : le transporteur est deja paye,
     donc rembourser la livraison sort de la poche de la boutique. « A votre
     discretion » n est pas une politesse, c est le rappel que personne d autre
     ne le decidera. */
  'Déjà expédiée : le transporteur a été payé. À votre discrétion (erreur, défaut, geste commercial).':
    'Already shipped: the carrier has been paid. At your discretion (error, defect, goodwill).',

  /* ── LES DEUX MODES ─────────────────────────────────────────────────────── */
  'Mode de remboursement': 'Refund method',
  'Crédit boutique': 'Store credit',
  '💳 Crédit boutique': '💳 Store credit',
  'Lié au compte du client, n’expire jamais, courriel envoyé automatiquement.':
    'Linked to the customer’s account, never expires, email sent automatically.',
  'Moyen de paiement original': 'Original payment method',
  '↩ Moyen de paiement original': '↩ Original payment method',
  'Sur la carte d’origine via Square — 5 à 7 jours ouvrables.':
    'To the original card through Square — 5 to 7 business days.',
  'Aucun paiement Square enregistré sur cette commande.':
    'No Square payment recorded on this order.',

  /* ── LES FRAIS SQUARE, ET L EXEMPTION ───────────────────────────────────── */
  'Frais de service Square retenus': 'Square service fees kept',
  ' — proportionnels (': ' — proportional (',
  'Frais de service Square retenus — proportionnels (': 'Square service fees kept — proportional (',
  ' sur ': ' of ',
  ' HT). Square ne rembourse pas ses frais.': ' before tax). Square does not refund its fees.',
  'HT). Square ne rembourse pas ses frais.': 'before tax). Square does not refund its fees.',
  'Renoncer aux frais (rembourser au complet)': 'Waive the fees (refund in full)',
  '🔐 Renoncer aux frais (rembourser au complet)': '🔐 Waive the fees (refund in full)',
  '✓ Exemption accordée — les frais ne seront pas retenus.':
    '✓ Exemption granted — the fees will not be kept.',
  'Code d’exemption': 'Exemption code',
  '🔐 Code d’exemption': '🔐 Exemption code',
  'Renoncer aux frais de service Square exige le code confidentiel.':
    'Waiving the Square service fees requires the confidential code.',
  'NIP de validation': 'Validation PIN',
  'Code incorrect — réessayez.': 'Incorrect code — try again.',
  'Confirmer': 'Confirm',

  /* ── LE MOTIF ───────────────────────────────────────────────────────────── */
  'Motif': 'Reason',
  'Motif —': 'Reason —',
  '— obligatoire': '— required',
  'Motif — obligatoire': 'Reason — required',
  'Motif du remboursement': 'Reason for the refund',
  /* ⚠ L EXEMPLE suit la langue du poste : il ne sort pas de l administration.
     Ce qu on TAPE, en revanche, est de la donnee et n est jamais traduit. */
  'Ex : article défectueux, mauvaise taille reçue, retour volontaire…':
    'Ex: defective item, wrong size received, voluntary return…',

  /* ── LES TOTAUX ─────────────────────────────────────────────────────────── */
  'Totaux': 'Totals',
  'Totaux —': 'Totals —',
  '— calculés par le site': '— calculated by the site',
  'Totaux — calculés par le site': 'Totals — calculated by the site',
  'Choisissez des articles…': 'Choose some items…',
  'Sous-total (': 'Subtotal (',
  ' unité': ' unit',
  'Total brut': 'Gross total',
  'Frais Square retenus': 'Square fees kept',
  'Frais Square retenus −': 'Square fees kept −',
  'Net au client': 'Net to the customer',

  /* ── LE BOUTON QUI DEPENSE ──────────────────────────────────────────────── */
  'Confirmer le remboursement': 'Confirm the refund',
  'Rembourser — ': 'Refund — ',
  'Rembourser —': 'Refund —',
  'Rembourser ': 'Refund ',
  'Remboursement…': 'Refunding…',

  /* ── LA CONFIRMATION ────────────────────────────────────────────────────── */
  'Confirmer le remboursement ?': 'Confirm the refund?',
  '💳 Confirmer le remboursement ?': '💳 Confirm the refund?',
  ' + livraison': ' + shipping',
  ' — total ': ' — total ',
  '— total': '— total',
  ', net au client ': ', net to the customer ',
  ', net au client': ', net to the customer',
  ' (frais ': ' (fees ',
  ' retenus)': ' kept)',
  'Méthode : ': 'Method: ',
  'Méthode :': 'Method:',
  'crédit boutique (n’expire jamais)': 'store credit (never expires)',
  'moyen de paiement original — Square': 'original payment method — Square',
  /* ⚠⚠ LA DERNIERE PHRASE AVANT LE CLIC. Elle est la pour qu on relise. */
  'Un remboursement ne s’annule pas d’un clic.': 'A refund cannot be undone with one click.',
  'Remboursement en cours…': 'Refund in progress…',

  /* ── LE VERDICT ─────────────────────────────────────────────────────────── */
  ' émis.': ' issued.',
  ' Crédit ': ' Credit ',
  '), courriel envoyé.': '), email sent.',
  ' Remboursement local créé mais Square a échoué : ':
    ' Local refund created but Square failed: ',
  'Remboursement local créé mais Square a échoué :': 'Local refund created but Square failed:',
  ' Square : ': ' Square: ',
  'Square :': 'Square:',
  ' initié.': ' initiated.',

  /* ── LES ECRANS VIDES ET LE VERROU ──────────────────────────────────────── */
  'Remboursement indisponible': 'Refund unavailable',
  'Cette commande est ouverte ailleurs — remboursement bloqué.':
    'This order is open elsewhere — refund blocked.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Rembourser': 'Refund',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'ouverte par': 'open by'
};
