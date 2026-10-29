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
  'Une carte-cadeau': 'A gift card',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Fermer': 'Close',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'au total': 'in total',
  // L'en-tête de la liste refaite, lu d'un bloc (2026-09-25).
  'Destinataire Valeur': 'Recipient Value',
  /* ── RELOOKING 2026 (2026-10-04) ── */
  'Pour': 'For',
  'le destinataire': 'the recipient',
  'De la part de': 'From',
  'Le code est engendré à la création et envoyé au destinataire.': 'The code is generated on creation and sent to the recipient.',
  'La carte': 'The card',
  'Le destinataire': 'The recipient',
  'Aperçu': 'Preview',
  'Annuler': 'Cancel',
  'Chaque achat de carte-cadeau en boutique reçoit un code de réduction.': 'Every gift card bought in the store earns a discount code.',
  'Le code remis': 'The code given',
  'Enregistrer': 'Save',
  /* Suppression d une carte et clic droit (2026-10-13). */
  'Confirmer : supprimer (solde perdu : ': 'Confirm: delete (balance lost: ',
  'Confirmer la suppression': 'Confirm deletion',
  'Supprimer la carte': 'Delete card',
  'Cliquez encore pour supprimer définitivement cette carte.': 'Click again to permanently delete this card.',
  ' supprimée.': ' deleted.',
  'Vérifiez la carte, puis confirmez la suppression.': 'Check the card, then confirm the deletion.',
  'Ouvrir la carte': 'Open card',
  'Copier le code': 'Copy code',
  'Code copié : ': 'Code copied: ',
  'Supprimer la carte…': 'Delete card…',
  // 2026-10-15 : confirmations en boîte à part.
  'Solde perdu': 'Balance lost',
  'Supprimer la carte-cadeau': 'Delete gift card',
  'La carte-cadeau': 'The gift card',
  'sera supprimée et ne pourra plus être utilisée en boutique.': 'will be deleted and can no longer be used in the store.',
  'Son solde restant sera perdu.': 'Its remaining balance will be lost.',
  'Elle reste restaurable pendant 30 jours depuis Gardien → Corbeille.': 'It can be restored for 30 days from Guard → Recycle bin.',
  // (2026-10-25, audit)
  'consultation seulement': 'view only',
  // (2026-10-25, audit)
  'Un pourcentage de récompense ne peut pas dépasser 90 %.': 'A reward percentage cannot exceed 90%.',
  'Une récompense en montant fixe ne peut pas dépasser 1 000 $.': 'A fixed-amount reward cannot exceed $1,000.',
  // Gestes groupés (2026-10-29)
  "Activation des cartes": "Activating cards",
  "Activer les cartes-cadeaux": "Activate gift cards",
  "Activer {0} carte": "Activate {0} card",
  "Activer {0} cartes": "Activate {0} cards",
  "Courriel": "Email",
  "Elles restent restaurables pendant 30 jours depuis Gardien → Corbeille.": "They can be restored for 30 days from Guard → Recycle bin.",
  "Exporter (CSV)": "Export (CSV)",
  "Suppression des cartes": "Deleting cards",
  "Supprimer les cartes-cadeaux": "Delete gift cards",
  "Supprimer {0} carte": "Delete {0} card",
  "Supprimer {0} cartes": "Delete {0} cards",
  "Supprimer": "Delete",
  "et {0} autres": "and {0} more",
  "{0} autre carte sélectionnée n’attend pas d’activation : elle ne change pas.": "{0} other selected card is not awaiting activation: it does not change.",
  "{0} autres cartes sélectionnées n’attendent pas d’activation : elles ne changent pas.": "{0} other selected cards are not awaiting activation: they do not change.",
  "{0} carte activée.": "{0} card activated.",
  "{0} cartes activées.": "{0} cards activated.",
  "{0} carte en attente d’activation deviendra utilisable en boutique.": "{0} card awaiting activation will become usable in the store.",
  "{0} cartes en attente d’activation deviendront utilisables en boutique.": "{0} cards awaiting activation will become usable in the store.",
  "{0} carte exportée": "{0} card exported",
  "{0} cartes exportées": "{0} cards exported",
  "{0} carte supprimée.": "{0} card deleted.",
  "{0} cartes supprimées.": "{0} cards deleted.",
  "{0} carte sélectionnée": "{0} card selected",
  "{0} cartes sélectionnées": "{0} cards selected",
  "{0} carte-cadeau sera supprimée et ne pourra plus être utilisée en boutique.": "{0} gift card will be deleted and can no longer be used in the store.",
  "{0} cartes-cadeaux seront supprimées et ne pourront plus être utilisées en boutique.": "{0} gift cards will be deleted and can no longer be used in the store.",
  "{0} d’entre elles a encore un solde : il sera perdu.": "{0} of them still has a balance: it will be lost.",
  "{0} d’entre elles ont encore un solde : il sera perdu.": "{0} of them still have a balance: it will be lost.",
  // Gestes groupés (2026-10-29)
  "Seulement les cartes sans solde : une carte qui a encore un solde se supprime depuis sa fiche.": "Only cards without a balance: a card that still has a balance is deleted from its own page.",
};
