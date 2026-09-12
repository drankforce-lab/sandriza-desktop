'use strict';

/*
 * RAMASSAGES ET RAPPORT TRANSPORTEURS — les deux langues
 * =============================================================================
 * ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT. Les NOMS de transporteurs (Postes Canada,
 * FedEx, Purolator), les numeros de suivi, les adresses et les montants viennent
 * de la base ou du transporteur : rien de tout cela n est ici.
 *
 * ⚠ « Expediee » avec une majuscule, dans « une commande doit etre marquee
 * Expediee », designe un STATUT de commande tel qu il s affiche. On traduit la
 * phrase ; la VALEUR du statut, elle, ne bouge pas — c est elle qui vit dans la
 * base, et `banc-langue-donnees` refuserait qu on y touche.
 *
 * ⚠ LES HEURES restent au format d ici (09 h / 17 h) : c est une fenetre de
 * ramassage reelle, pas une convention d ecriture.
 */

module.exports = {
  'Ramassages et rapport — Administration Sandriza': 'Pickups and report — Sandriza Administration',
  'Ramassages et rapport': 'Pickups and report',
  'Expéditions indisponibles': 'Shipments unavailable',
  'Votre rôle ne donne pas accès aux expéditions.': 'Your role does not give access to shipments.',

  /* ── LES DEUX ONGLETS ───────────────────────────────────────────────────── */
  '📅 Ramassages': '📅 Pickups',
  '📊 Rapport transporteurs': '📊 Carrier report',

  /* ── PLANIFIER ──────────────────────────────────────────────────────────── */
  '📦 Planifier un ramassage': '📦 Schedule a pickup',
  '📦 Planifier les ramassages —': '📦 Schedule pickups —',
  'Aucun ramassage planifié.': 'No pickup scheduled.',
  'Aucun colis à ramasser pour l’instant.': 'No parcel to pick up right now.',
  'Aucun colis à ramasser.': 'No parcel to pick up.',
  'Une commande doit être marquée Expédiée et avoir un numéro de suivi.':
    'An order must be marked Shipped and have a tracking number.',
  '📅 Prévu le': '📅 Scheduled for',
  ', entre 09 h et 17 h': ', between 09:00 and 17:00',
  /* ⚠ Deux facons dont un transporteur recoit la demande : par son API, ou par
     un appel de quelqu un. La seconde est une CONSIGNE, pas un etat. */
  'API — demande automatique': 'API — automatic request',
  'à contacter manuellement': 'to be contacted manually',
  'Poids estimé par colis (kg)': 'Estimated weight per parcel (kg)',
  'Endroit du ramassage': 'Pickup location',
  '📨 Envoyer les demandes': '📨 Send the requests',

  /* ── ANNULER ────────────────────────────────────────────────────────────── */
  'Confirmer l’annulation ?': 'Confirm cancellation?',
  'Confirmation :': 'Confirmation:',
  '· planifié par': '· scheduled by',
  '· annulé par': '· cancelled by',
  'L’annulation a échoué auprès du transporteur.': 'The carrier refused the cancellation.',
  'Annulation auprès du transporteur…': 'Cancelling with the carrier…',
  'Ramassage annulé.': 'Pickup cancelled.',

  /* ── LE RAPPORT ─────────────────────────────────────────────────────────── */
  'Aucune expédition enregistrée.': 'No shipment recorded.',
  'Par transporteur —': 'By carrier —',
  'Les 60 dernières expéditions': 'The last 60 shipments',
  /* ⚠ En-tetes groupes, ecrits d un bloc dans le gabarit. */
  'Transporteur Colis': 'Carrier Parcels',
  'Total frais Moy. par colis': 'Total cost Avg. per parcel',
  'Commande Date Transporteur': 'Order Date Carrier',
  'Suivi Frais Statut': 'Tracking Cost Status',

  /* ── CE QUI SE DIT PENDANT L ATTENTE ────────────────────────────────────── */
  'Lecture des colis prêts…': 'Reading parcels ready to ship…',
  'Demandes envoyées aux transporteurs…': 'Requests sent to the carriers…',

  /* ⚠ L émoji vit dans son propre <span> : la chaîne du gabarit est le texte
     SEUL, avec ses espaces. */
  ' Prévu le ': ' Scheduled for ',
  'Transporteur': 'Carrier',
  'Colis': 'Parcels',
  'Total frais': 'Total cost',
  'Moy. par colis': 'Avg. per parcel',
  'Commande': 'Order',
  'Date': 'Date',
  'Suivi': 'Tracking',
  'Frais': 'Cost',
  'Statut': 'Status',
};
