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
  'Effectuer la vente': 'Complete the sale',
  'Commande en traitement…': 'Processing the order…',
  'Imprimer + courriel': 'Print + email',
  'Imprimer seulement': 'Print only',
  'Réinitialiser la vente': 'Reset the sale',
  'Imprimer la facture': 'Print the invoice',
  'Impression': 'Printing',
  'envoi à l’imprimante…': 'sending to the printer…',
  'échec': 'failed',
  'lancée': 'started',
  'Tout effacer : articles, rabais, client et note': 'Clear everything: items, discounts, customer and note',
  'Confirmer ?': 'Confirm?',
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

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Sous-total': 'Subtotal',
  'Continuer': 'Continue',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'aucune variante': 'no variant',
  '(sans nom)': '(no name)',
  'sans courriel': 'no email',
  'commande': 'order',
  'commandes': 'orders',
  '· lecture seule': '· read-only',
  'Les totaux s’afficheront ici.': 'Totals will appear here.',

  /* ── LES RABAIS DU COMPTOIR (2026-10-04) ──────────────────────────────────
     ⚠ Les suggestions de remarque (« Petit défaut »…) ne sont que des MODÈLES
     proposés à la saisie : la remarque est un texte libre, écrit dans la langue
     de la personne au comptoir, puis conservé tel quel sur la facture. */
  'Rabais sur la vente': 'Discount on the sale',
  'Rabais en dollars ou en pourcentage': 'Discount in dollars or as a percentage',
  'Valeur': 'Value',
  'Remarque': 'Remark',
  'ex. : client fidèle': 'e.g. loyal customer',
  'Petit défaut': 'Minor defect',
  'Fin de série': 'End of line',
  'Article de démonstration': 'Display item',
  'Dernier en stock': 'Last one in stock',
  'Geste commercial': 'Goodwill gesture',
  'Client fidèle': 'Loyal customer',
  'Rabais employé': 'Staff discount',
  'Rabais sur les articles': 'Item discounts',
  'Retirer un': 'Remove one',
  'Ajouter un': 'Add one',
  'Rabais sur cet article': 'Discount on this item',
  'Rabais sur cet article, pour cette vente seulement': 'Discount on this item, for this sale only',
  'Pourcentage': 'Percentage',
  'ex. : petit défaut à la manche': 'e.g. minor defect on the sleeve',
  'Prix courant': 'Regular price',
  'Retirer le rabais': 'Remove discount',
  'Fermer': 'Close',
  'Appliquer': 'Apply',
  'Le pourcentage doit être entre 0 et 100.': 'The percentage must be between 0 and 100.',
  'reprise.': 'loaded.',
  'Commande': 'Order',
  'Rabais accordés': 'Discounts given',
  'oui': 'yes',
  'raison inconnue': 'unknown reason',
  'Clients trouvés': 'Customers found',
  'client trouvé': 'customer found',
  'clients trouvés': 'customers found',

  /* ── LE PRIX MODIFIÉ ET SON NIP (2026-10-14) ───────────────────────────────
     ⚠ Aucune apostrophe droite : ces phrases vivent dans des chaînes entre
     apostrophes de la portion de script. */
  'Voir ou changer le NIP exigé pour modifier un prix à la caisse': 'View or change the PIN required to change a price at the till',
  'NIP des prix': 'Price PIN',
  'Aucun NIP défini — un super administrateur doit en créer un.': 'No PIN set — a super administrator must create one.',
  'NIP incorrect.': 'Incorrect PIN.',
  'Trop d’essais : les prix modifiés et les rabais sont bloqués pour quelques minutes.': 'Too many attempts: price changes and discounts are locked for a few minutes.',
  'Le nouveau prix doit être un montant supérieur à zéro.': 'The new price must be an amount above zero.',
  'Une autorisation par NIP n’est plus valable (30 minutes, une seule vente) — retapez le NIP.':
    'A PIN authorization is no longer valid (30 minutes, one sale) — enter the PIN again.',
  'Un rabais exige le NIP de la boutique.': 'A discount requires the store PIN.',
  'Le rabais doit être supérieur à zéro.': 'The discount must be above zero.',
  'Accorder un rabais exige le NIP de la boutique.': 'Granting a discount requires the store PIN.',
  'Valider le rabais': 'Confirm discount',
  'Rabais accordé — NIP vérifié.': 'Discount granted — PIN checked.',
  'Prix modifié — super administrateur, sans NIP.': 'Price changed — super administrator, no PIN.',
  'Prix modifié — super administrateur': 'Price changed — super administrator',
  'Le NIP compte de 4 à 8 chiffres.': 'The PIN has 4 to 8 digits.',
  'Réservé aux super administrateurs.': 'Reserved for super administrators.',
  'Votre rôle a changé depuis la connexion — reconnectez-vous.': 'Your role has changed since you signed in — sign in again.',
  'Le serveur n’a pas répondu — rien n’a été modifié.': 'The server did not respond — nothing was changed.',
  'Prix modifiés à la hausse': 'Prices raised',
  'Prix modifié — NIP vérifié par le serveur': 'Price changed — PIN checked by the server',
  'Prix modifié': 'Price changed',
  'Nouveau prix': 'New price',
  'Nouveau prix unitaire — exige le NIP de sécurité': 'New unit price — requires the security PIN',
  'Un nouveau prix remplace le pourcentage (ils ne se cumulent pas). Prix et rabais exigent le NIP de sécurité, sauf pour un super administrateur. La remarque en est le motif.':
    'A new price replaces the percentage (they do not add up). Prices and discounts require the security PIN, except for a super administrator. The remark is its reason.',
  'NIP de sécurité': 'Security PIN',
  'Modifier un prix exige le NIP de la boutique.': 'Changing a price requires the store PIN.',
  'Valider le prix': 'Confirm price',
  'Vérification…': 'Checking…',
  'La vente a changé pendant la vérification — refaites la modification.': 'The sale changed during the check — make the change again.',
  'Prix modifié — NIP vérifié.': 'Price changed — PIN checked.',
  'NIP incorrect — essais restants :': 'Incorrect PIN — attempts left:',
  'NIP incorrect — prix modifiés et rabais bloqués 15 minutes.': 'Incorrect PIN — price changes and discounts locked for 15 minutes.',
  'Trop d’essais — prix modifiés et rabais bloqués. Minutes restantes :': 'Too many attempts — price changes and discounts locked. Minutes left:',
  'NIP des prix modifiés': 'Price change PIN',
  'Exigé à la caisse pour modifier un prix ou accorder un rabais — les super administrateurs en sont dispensés. Visible et modifiable par eux seulement.':
    'Required at the till to change a price or grant a discount — super administrators are exempt. Visible and editable by them only.',
  'Lecture…': 'Loading…',
  'Nouveau NIP': 'New PIN',
  'Retirer le NIP': 'Remove PIN',
  'Aucun NIP défini — prix modifiés et rabais sont refusés à la caisse (sauf aux super administrateurs).': 'No PIN set — price changes and discounts are refused at the till (except for super administrators).',
  'Un NIP est enregistré, mais il ne se relit plus sur ce serveur — enregistrez-en un nouveau.':
    'A PIN is saved, but it can no longer be read on this server — save a new one.',
  'NIP actuel': 'Current PIN',
  'Afficher': 'Show',
  'Masquer': 'Hide',
  'Défini': 'Set',
  'Trop d’essais faux à la caisse — prix modifiés bloqués. Minutes restantes :': 'Too many wrong attempts at the till — price changes locked. Minutes left:',
  'Les deux NIP ne concordent pas.': 'The two PINs do not match.',
  'Enregistrement…': 'Saving…',
  'NIP enregistré.': 'PIN saved.',
  'Confirmer le retrait ?': 'Confirm removal?',
  'NIP retiré — plus aucun prix ne peut être modifié à la caisse.': 'PIN removed — no price can be changed at the till anymore.',
};
