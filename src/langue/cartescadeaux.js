'use strict';

/*
 * CARTES-CADEAUX — les deux langues
 * =============================================================================
 * ⚠⚠⚠ UNE CARTE-CADEAU EST DE L ARGENT QUI CIRCULE. Son CODE, son solde, le nom
 * et le courriel de sa destinataire, le message qui l accompagne sont des
 * DONNEES : le code sert a payer, le message est lu par la personne qui recoit.
 * Ce dictionnaire ne traduit QUE les etiquettes et les verdicts.
 *
 * ⚠⚠ « EN ATTENTE D ACTIVATION » N EST PAS UN ETAT DECORATIF : un courriel est
 * parti, et si l acheteur ne l a jamais recu, la carte s active A LA MAIN depuis
 * cet ecran. La phrase qui le dit porte la marche a suivre ; sans elle, une
 * carte payee reste inutilisable sans qu on sache quoi faire.
 *
 * ⚠⚠ LES STATUTS (`active`, `pending`, `used`, `expired`) sont des VALEURS : ils
 * partent dans le filtre et dans la base. Leurs libelles se lisent, et la
 * source les ecrit dans une autre colonne. ⚠ `g.statutLibelle` vient du coeur :
 * il ne passe pas par ici.
 *
 * ⚠ Les exemples des champs suivent la langue du poste : le nom du destinataire
 * et la note interne ne sortent pas de l administration. Le MESSAGE de la carte,
 * lui, est lu par la personne qui la recoit — il n a pas d exemple ici.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Cartes-cadeaux — Administration Sandriza': 'Gift cards — Sandriza Administration',
  'Cartes-cadeaux': 'Gift cards',
  'Cartes-cadeaux indisponibles': 'Gift cards unavailable',
  'Chargement… (les cartes se resynchronisent)':
    'Loading… (the cards are resynchronising)',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux cartes-cadeaux.':
    'Your role does not give access to the gift cards.',
  'Cette carte n’existe plus.': 'This card no longer exists.',
  'Le montant doit être d’au moins 1 $.': 'The amount must be at least $1.',
  'Le nom et un courriel valide du destinataire sont requis.':
    'The recipient’s name and a valid email are required.',

  /* ── LES TUILES ET LA BARRE ─────────────────────────────────────────────── */
  'Cartes actives': 'Active cards',
  ' au total': ' in total',
  'Solde en circulation': 'Balance in circulation',
  'sur ': 'out of ',
  ' émis': ' issued',
  'Entièrement utilisées': 'Fully used',
  'Code, destinataire, courriel': 'Code, recipient, email',
  'Code, destinataire, courriel…': 'Code, recipient, email…',
  'Tous les statuts': 'All statuses',
  'Actives': 'Active',
  'Activation requise': 'Activation required',
  'Utilisées': 'Used',
  'Expirées': 'Expired',
  'Récompense à l’achat': 'Reward on purchase',
  '+ Créer une carte': '+ Create a card',
  ' cartes': ' cards',
  ' carte': ' card',
  'Rien ne correspond.': 'Nothing matches.',
  'Aucune carte-cadeau.': 'No gift card.',

  /* ── LE TABLEAU ─────────────────────────────────────────────────────────── */
  'Code': 'Code',
  'Destinataire': 'Recipient',
  'Valeur': 'Value',
  'Solde': 'Balance',
  'Acheteur': 'Buyer',
  'Date': 'Date',
  'Statut': 'Status',
  'Code Destinataire Valeur': 'Code Recipient Value',
  'Solde Acheteur Date Statut': 'Balance Buyer Date Status',
  'Voir le détail': 'See the detail',
  'courriel ✓': 'email ✓',

  /* ── CREER UNE CARTE ────────────────────────────────────────────────────── */
  'Créer une carte-cadeau': 'Create a gift card',
  'Montant': 'Amount',
  'Montant *': 'Amount *',
  /* ⚠ Les VALEURS du statut (`active`, `pending`) partent dans la base ; seuls
     ces libelles se lisent. */
  'Active (prête à utiliser)': 'Active (ready to use)',
  'En attente d’activation': 'Waiting for activation',
  'Nom du destinataire': 'Recipient’s name',
  'Nom du destinataire *': 'Recipient’s name *',
  'Marie': 'Marie',
  'Courriel du destinataire': 'Recipient’s email',
  'Courriel du destinataire *': 'Recipient’s email *',
  'marie@exemple.com': 'marie@example.com',
  'Expéditeur': 'Sender',
  'la boutique': 'the shop',
  'Note interne': 'Internal note',
  'Cadeau, correction…': 'Gift, correction…',
  'Créer la carte': 'Create the card',
  'Carte créée — code ': 'Card created — code ',
  'Carte créée — code': 'Card created — code',

  /* ── LA RECOMPENSE A L ACHAT ────────────────────────────────────────────── */
  'Récompense à l’achat d’une carte': 'Reward for buying a card',
  'Un code promotionnel est remis à qui achète une carte-cadeau.':
    'A promo code is given to whoever buys a gift card.',
  'Activer': 'Turn on',
  'Oui': 'Yes',
  'Non': 'No',
  'Type': 'Type',
  'Pourcentage (%)': 'Percentage (%)',
  'Montant fixe ($)': 'Fixed amount ($)',
  'Validité du code (jours)': 'Code validity (days)',
  'Récompense enregistrée.': 'Reward saved.',

  /* ── LE DETAIL D UNE CARTE ──────────────────────────────────────────────── */
  'Active': 'Active',
  'Utilisée': 'Used',
  'Expirée': 'Expired',
  'Valeur initiale': 'Initial value',
  'Solde restant': 'Remaining balance',
  'Émise le': 'Issued on',
  'Message': 'Message',
  /* ⚠⚠ CE QUI SE FAIT QUAND LE COURRIEL N EST JAMAIS ARRIVE. */
  'En attente d’activation — un courriel est parti':
    'Waiting for activation — an email went out',
  ' à ': ' to ',
  '. Si l’acheteur ne l’a jamais reçu, activez la carte à la main ci-dessous.':
    '. If the buyer never received it, activate the card by hand below.',
  'Historique d’utilisation': 'Usage history',
  'Carte jamais utilisée.': 'Card never used.',
  'Commande': 'Order',
  'Solde après': 'Balance after',
  'Date Commande': 'Date Order',
  'Montant Solde après': 'Amount Balance after',
  'Activer à la main': 'Activate by hand',
  'Carte ': 'Card ',
  ' activée.': ' activated.',
  'activée.': 'activated.',
  'Une carte-cadeau': 'A gift card'
};
