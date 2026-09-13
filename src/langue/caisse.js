'use strict';

/*
 * VENTE AU COMPTOIR — les deux langues
 * =============================================================================
 * ⚠⚠ C EST LE CHEMIN DE L ARGENT. On ne traduit QUE ce qui se lit : les noms
 * d articles, les prix, les montants, la province choisie, le mode de paiement
 * enregistre et la note interne sont de la DONNEE. Les VALEURS des listes
 * (codes de province, cle du mode de paiement) partent dans la facture et dans
 * le calcul des taxes — `banc-langue-donnees` refuserait de les voir ici.
 *
 * ⚠⚠ DEUX PHRASES NE DOIVENT RIEN PERDRE EN TRADUISANT, parce qu elles evitent
 * une faute d argent :
 *   · « Cet ecran n encaisse jamais la carte. » — il le dit pour qu on ne croie
 *     pas avoir encaisse. La version anglaise doit etre aussi nette.
 *   · « Province — elle determine les taxes » — l etiquette explique POURQUOI le
 *     champ existe. La reduire a « Province » ferait perdre l avertissement.
 *
 * ⚠ « Square » est un nom de service : il ne se traduit pas.
 */

module.exports = {
  'Vente au comptoir — Administration Sandriza': 'Counter sale — Sandriza Administration',
  'Vente au comptoir': 'Counter sale',
  'Caisse indisponible': 'Till unavailable',
  'Votre rôle ne permet pas d’encaisser une vente.': 'Your role does not allow taking a sale.',
  'Votre rôle ne permet pas d’enregistrer une vente.': 'Your role does not allow recording a sale.',

  /* ── LES SECTIONS ───────────────────────────────────────────────────────── */
  'Articles': 'Items',
  'Client': 'Customer',
  'Vente': 'Sale',
  'Facture': 'Invoice',
  'Encaissement': 'Payment',
  'Affichage client': 'Customer display',
  'Province · Livraison · Rabais': 'Province · Shipping · Discount',

  /* ── LA RECHERCHE D ARTICLES ────────────────────────────────────────────── */
  'Scannez le code-barres, ou tapez un nom d’article': 'Scan the barcode, or type an item name',
  'Scannez le code-barres, ou tapez un nom d’article…': 'Scan the barcode, or type an item name…',
  'Trois caractères minimum pour chercher.': 'Three characters minimum to search.',
  'Aucun article ne correspond à «': 'No item matches «',
  'Aucun article — scannez un code-barres pour commencer.':
    'No item — scan a barcode to begin.',
  'Aucun article dans la vente.': 'No item in the sale.',
  'Cet article n’existe plus.': 'This item no longer exists.',
  'Article Qté': 'Item Qty',
  'Prix Total': 'Price Total',
  'Rabais -': 'Discount -',

  /* ── LE CLIENT ──────────────────────────────────────────────────────────── */
  'Nom': 'Name',
  'Courriel': 'Email',
  '— requis': '— required',
  'Nom du client requis': 'Customer name required',
  'Le nom du client est obligatoire — aucune vente anonyme.':
    'A customer name is required — no anonymous sale.',
  'Un courriel valide est requis pour ouvrir un compte.':
    'A valid email is required to open an account.',
  'Téléphone — 000 000-0000': 'Phone — 000 000-0000',
  'Ouvrir un compte et lui envoyer le lien pour le finaliser':
    'Open an account and send them the link to complete it',
  'Courriel requis. Historique et retours pour lui ; aucune inscription à l’infolettre.':
    'Email required. History and returns for them; no newsletter sign-up.',
  'Fiche de': 'Record of',
  'Fiche introuvable — relancez la recherche.': 'Record not found — search again.',
  '✓ compte lié': '✓ account linked',
  'en attente — lien à envoyer': 'pending — link to send',
  'Compte client': 'Customer account',
  'ouvert · lien de finalisation envoyé': 'opened · completion link sent',

  /* ── LA VENTE ───────────────────────────────────────────────────────────── */
  /* ⚠ L etiquette dit POURQUOI le champ existe : la reduire a « Province »
     ferait perdre l avertissement. */
  'Province — elle détermine les taxes': 'Province — it determines the taxes',
  'Livraison': 'Shipping',
  'Rabais': 'Discount',
  'Calcul des totaux…': 'Calculating totals…',
  'Total invalide — la vente n’a pas été enregistrée.':
    'Invalid total — the sale was not recorded.',
  'Moteur de taxes indisponible — n’encaissez pas.':
    'Tax engine unavailable — do not take payment.',
  'Ce qu’on fait de la facture après la vente': 'What happens to the invoice after the sale',
  'L’envoi exige une adresse. Toujours consultable dans Facturation.':
    'Sending requires an address. Always available under Billing.',
  'Mode de paiement': 'Payment method',
  'Note interne (facultatif)': 'Internal note (optional)',

  /* ── LES BOUTONS ────────────────────────────────────────────────────────── */
  'Enregistrer la vente': 'Record the sale',
  'Enregistrer la vente —': 'Record the sale —',
  'Vider la vente': 'Clear the sale',
  /* ⚠⚠ CETTE PHRASE EVITE UNE FAUTE D ARGENT : elle dit qu on n a PAS encaisse. */
  'Cet écran n’encaisse jamais la carte.': 'This screen never charges the card.',
  'Ouvrir l’écran tourné vers le client, à poser sur un second moniteur':
    'Open the customer-facing screen, to place on a second monitor',
  'Affichage client ouvert.': 'Customer display opened.',
  '📋 Copier': '📋 Copy',
  '✓ Copié': '✓ Copied',
  'Ctrl+C pour copier': 'Ctrl+C to copy',
  '↻ Vérifier le paiement': '↻ Check the payment',

  /* ── APRES LA VENTE ─────────────────────────────────────────────────────── */
  'Vente enregistrée': 'Sale recorded',
  'Stock décompté': 'Stock deducted',
  'NON — à vérifier': 'NO — to be checked',
  'Enregistrement en base': 'Saved to the database',
  'non confirmé': 'not confirmed',
  'envoyée par courriel': 'sent by email',
  'NON envoyée': 'NOT sent',
  '🔗 Vente en attente de paiement': '🔗 Sale awaiting payment',
  'Le stock sera décompté et la facture marquée payée quand Square':
    'Stock will be deducted and the invoice marked paid when Square',
  'confirmera — automatiquement au retour du client. Rien n’est encaissé par cet écran.':
    'confirms — automatically when the customer returns. Nothing is charged by this screen.',
  'S’il a payé mais que rien ne bouge, pressez Vérifier le paiement .':
    'If they paid but nothing moves, press Check the payment .',
  'La commande est enregistrée, mais Square a refusé':
    'The order is recorded, but Square refused',
  'de créer le lien :': 'to create the link:',
  '. Réessayez depuis la': '. Try again from the',
  'commande, ou encaissez autrement.': 'order, or take payment another way.',
  'Aucun lien de paiement a verifier.': 'No payment link to check.',
  'Vérification auprès de Square…': 'Checking with Square…',
  'Paiement confirmé': 'Payment confirmed',
  '· stock décompté.': '· stock deducted.',
  '· stock à vérifier.': '· stock to be checked.',
  'Paiement annulé par le client.': 'Payment cancelled by the customer.',
  'Montant reçu INFÉRIEUR au total — à vérifier dans Square.':
    'Amount received LOWER than the total — check in Square.',
  'Pas encore payé. Le lien reste valide — réessayez plus tard.':
    'Not paid yet. The link stays valid — try again later.',
  'Temoin : aucune vente n a eu lieu.': 'Witness: no sale took place.',

  /* ── LES FRAGMENTS TELS QU ILS EXISTENT DANS LE GABARIT ────────────────
     ⚠ Les en-têtes sont des cellules séparées, et « Vérifier le paiement » est
     dans un <strong> au milieu de sa phrase : la forme RENDUE n existe nulle
     part dans le fichier. */
  'Article': 'Item',
  'Qté': 'Qty',
  'Prix': 'Price',
  'Total': 'Total',
  'S’il a payé mais que rien ne bouge, pressez ':
    'If they paid but nothing moves, press ',
  'Vérifier le paiement': 'Check the payment',

  /* ── LA LONGUE TRAINE : CE QUE LE COMPTEUR NE PEUT PAS VOIR ─────────────── */
  /* ⚠⚠ `chainesProse` ecarte les chaines d UN SEUL MOT pour ne pas prendre un
     identifiant pour une phrase : ces textes-la traversent le compteur sans un
     bruit et s affichent en francais sur la page anglaise. Seul
     `banc-langue-residuel` les voit. Tous verifies un par un : ce sont des
     textes AFFICHES, pas des etats enregistres. */
  'Aucun en stock': 'None in stock',
  'confirmé': 'confirmed',

  /* ── CE QUE LE BANC RESIDUEL A TROUVE (attributs, moities de phrase) ──── */
  'Lien de paiement à copier': 'Payment link to copy',
  '📋 Copier': '📋 Copy',
  'Copier': 'Copy',
  ' en attente de paiement': ' awaiting payment',
};
