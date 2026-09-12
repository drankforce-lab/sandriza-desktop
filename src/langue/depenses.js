'use strict';

/*
 * DEPENSES D ENTREPRISE — les deux langues
 * =============================================================================
 * ⚠⚠ LES NOMS DE TAXES SONT OFFICIELS, PAS DES MOTS A TRADUIRE LIBREMENT.
 * TPS = GST (Goods and Services Tax) ; TVQ = QST (Quebec Sales Tax) ; « credit
 * sur intrants » = « input tax credit », le terme employe par Revenu Quebec et
 * l ARC. Inventer une formulation ici rendrait l ecran inutilisable pour parler
 * a un comptable.
 * ⚠ « ligne 8710 » est un numero de ligne d un formulaire fiscal : il ne se
 * traduit pas, il se cite.
 *
 * ⚠⚠ UNE PHRASE PROTEGE UNE PIECE JUSTIFICATIVE, et elle doit rester aussi
 * ferme : « Une depense sans sa piece justificative n est pas defendable. »
 * C est elle qui explique pourquoi RIEN n a ete enregistre.
 *
 * ⚠ ON NE TRADUIT QUE CE QUI SE LIT : les noms de fournisseurs, les descriptions
 * saisies, les montants et les fichiers de recu sont de la DONNEE. Les VALEURS
 * des categories (lignes fiscales) partent dans la comptabilite.
 */

module.exports = {
  'Dépenses d’entreprise — Administration Sandriza': 'Business expenses — Sandriza Administration',
  'Dépenses d’entreprise': 'Business expenses',
  'Dépenses indisponibles': 'Expenses unavailable',
  'Votre rôle ne donne pas accès aux dépenses.': 'Your role does not give access to expenses.',
  'Le module des dépenses n’a pas pu être chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).':
    'The expenses module could not be loaded in the main window. Reload it (Ctrl+R).',
  'Cette dépense n’existe plus.': 'This expense no longer exists.',
  '👁 Lecture seule — votre rôle permet de consulter les dépenses, pas de les saisir.':
    '👁 Read only — your role allows viewing expenses, not entering them.',

  /* ── LA LISTE ───────────────────────────────────────────────────────────── */
  'Tous les mois': 'All months',
  'Toutes catégories': 'All categories',
  '＋ Nouvelle dépense': '＋ New expense',
  '➕ Nouvelle dépense': '➕ New expense',
  'Modifier la dépense': 'Edit the expense',
  'Aucune dépense pour': 'No expense for',
  'Date Catégorie Description': 'Date Category Description',
  'Paiement Montant': 'Payment Amount',
  'Taxes Reçu': 'Taxes Receipt',
  'Total —': 'Total —',
  'hors taxes, déductible': 'before taxes, deductible',
  'TPS payée': 'GST paid',
  'TVQ payée': 'QST paid',
  'crédit sur intrants': 'input tax credit',
  'Les frais de traitement Square': 'Square processing fees',
  'sont déjà comptés dans l’Impôt (ligne 8710) — ne les ressaisissez pas ici.':
    'are already counted under Tax (line 8710) — do not re-enter them here.',
  'La fiscalité et la conciliation bancaire restent à': 'Tax reporting and bank reconciliation stay in',
  'l’écran Comptabilité de la fenêtre principale.': 'the Accounting screen of the main window.',

  /* ── LE DEPOT D UNE FACTURE, ET SA LECTURE AUTOMATIQUE ──────────────────── */
  'Glissez une facture ici': 'Drop an invoice here',
  '📄 Importer une facture': '📄 Import an invoice',
  'Déposez une facture : elle est lue automatiquement, et vous vérifiez les champs avant d’enregistrer.':
    'Drop an invoice: it is read automatically, and you check the fields before saving.',
  'Déposez une facture : elle sera jointe comme reçu. La lecture automatique demande une clé (Configuration → Clés API).':
    'Drop an invoice: it will be attached as a receipt. Automatic reading needs a key (Configuration → API keys).',
  'Photo, image ou PDF — les champs sont pré-remplis, vous vérifiez avant d’enregistrer.':
    'Photo, image or PDF — the fields are pre-filled, you check before saving.',
  'Elle sera jointe comme reçu (lecture automatique indisponible sans clé).':
    'It will be attached as a receipt (automatic reading unavailable without a key).',
  'Format non pris en charge — image ou PDF seulement.': 'Unsupported format — image or PDF only.',
  'Fichier trop volumineux (8 Mo maximum).': 'File too large (8 MB maximum).',
  'Ce fichier n’a pas pu être lu.': 'This file could not be read.',
  'Cette image n’a pas pu être lue.': 'This image could not be read.',
  'Cette dépense n’a pas de reçu.': 'This expense has no receipt.',
  'Une lecture est déjà en cours.': 'A reading is already under way.',
  'Lecture de la facture… (quelques secondes)': 'Reading the invoice… (a few seconds)',
  '✓ Lu directement dans le document :': '✓ Read directly from the document:',
  'Lu : «': 'Read: «',
  'Facture lue — vérifiez les informations, puis enregistrez.':
    'Invoice read — check the information, then save.',
  'Facture lue — complétez ce qui manque, puis enregistrez.':
    'Invoice read — fill in what is missing, then save.',
  'Aucun texte à lire dans ce document (photo ou numérisation) : tout vient de la lecture automatique. Vérifiez CHAQUE champ.':
    'No text to read in this document (photo or scan): everything comes from automatic reading. Check EVERY field.',
  'La lecture automatique a été écartée (elle ne correspondait pas au document) — complétez la description et la catégorie.':
    'Automatic reading was discarded (it did not match the document) — fill in the description and category.',
  'Lecture REFUSÉE : ce qui a été proposé ne correspond pas au document (':
    'Reading REFUSED: what was proposed does not match the document (',
  'écart détecté': 'discrepancy detected',
  '), et le document lui-même n’a pas pu être lu (photo ou numérisation).':
    '), and the document itself could not be read (photo or scan).',
  'Rien n’a été rempli — saisissez à la main. Le reçu, lui, est joint.':
    'Nothing was filled in — enter it by hand. The receipt itself is attached.',
  'Reçu joint — saisie manuelle.': 'Receipt attached — manual entry.',
  'Lecture refusée — elle ne correspondait pas au document.':
    'Reading refused — it did not match the document.',
  'Reçu joint. Lecture automatique indisponible : aucune clé du service d’IA n’est enregistrée (écran Configuration → Clés API).':
    'Receipt attached. Automatic reading unavailable: no AI service key is saved (Configuration → API keys screen).',
  'Reçu joint. Le PDF n’a pas pu être converti pour la lecture — saisie manuelle.':
    'Receipt attached. The PDF could not be converted for reading — manual entry.',
  'Reçu joint. La réponse du service n’était pas exploitable — saisie manuelle.':
    'Receipt attached. The service’s answer was unusable — manual entry.',
  'Reçu joint. Le service de lecture n’a pas répondu — saisie manuelle.':
    'Receipt attached. The reading service did not answer — manual entry.',
  'Reçu joint. La lecture a été refusée : elle ne correspondait pas au document.':
    'Receipt attached. The reading was refused: it did not match the document.',
  'Préparation du reçu…': 'Preparing the receipt…',
  'Reçu joint — il partira dans le stockage à l’enregistrement.':
    'Receipt attached — it will go to storage when you save.',

  /* ── LE FORMULAIRE ──────────────────────────────────────────────────────── */
  'Total payé': 'Total paid',
  'Mode de paiement': 'Payment method',
  'Montant (hors taxes)': 'Amount (before taxes)',
  'Le montant doit être supérieur à 0.': 'The amount must be greater than 0.',
  'Saisissez d’abord le total payé (taxes incluses) dans « Montant ».':
    'First enter the total paid (taxes included) under « Amount ».',
  '↧ Calc. taxes': '↧ Calc. taxes',
  'Saisissez le total payé dans': 'Enter the total paid under',
  '« Montant » puis « Calc. taxes » pour en déduire la TPS et la TVQ.':
    '« Amount » then « Calc. taxes » to work out the GST and QST.',
  'Taxes déduites du total payé.': 'Taxes worked out from the total paid.',
  'Une facture en dollars US se convertit avec « ⇄ Convertir ».':
    'A US-dollar invoice is converted with « ⇄ Convert ».',
  '⇄ Convertir depuis USD': '⇄ Convert from USD',
  'Facture en dollars US — origine': 'Invoice in US dollars — source',
  '💵 Facture en': '💵 Invoice in',
  '— original :': '— original:',
  '— taux': '— rate',
  '× taux': '× rate',
  '(taux du jour, faute de mieux)': '(today’s rate, for want of better)',
  'Saisissez d’abord les montants en dollars US.': 'First enter the amounts in US dollars.',
  'Lecture du taux de change…': 'Reading the exchange rate…',
  'Rien à convertir.': 'Nothing to convert.',
  'Converti au taux': 'Converted at rate',
  '— taux du jour, faute d’avoir trouvé celui de la date.':
    '— today’s rate, having not found the one for that date.',
  'Montants convertis depuis le dollar US au taux': 'Amounts converted from US dollars at rate',
  'Reçu (image ou PDF — facultatif)': 'Receipt (image or PDF — optional)',
  '✓ Reçu joint — remplacer': '✓ Receipt attached — replace',
  '📎 Joindre un reçu': '📎 Attach a receipt',
  '+ Ajouter la dépense': '+ Add the expense',
  'Dépense enregistrée —': 'Expense recorded —',
  'Le reçu n’a pas pu être déposé dans le stockage — RIEN n’a été enregistré. Une dépense sans sa pièce justificative n’est pas défendable.':
    'The receipt could not be placed in storage — NOTHING was recorded. An expense without its supporting document cannot be defended.',
  'Le nuage a refusé l’écriture — rien n’est conservé. Reconnectez-vous et refaites la saisie.':
    'The cloud refused the write — nothing is kept. Sign in again and re-enter it.',

  /* ── LE BROUILLON ───────────────────────────────────────────────────────── */
  '↩ Brouillon repris — saisie commencée il y a': '↩ Draft resumed — entry started',
  ', reçu compris': ', receipt included',
  'Fermer sans enregistrer la dépense ?': 'Close without saving the expense?',
  'Votre saisie': 'Your entry',
  'et le reçu importé': 'and the imported receipt',
  'peuvent être conservés': 'can be kept',
  'en brouillon : « Nouvelle dépense » les reprendra.':
    'as a draft: « New expense » will pick them up.',
  '← Revenir au formulaire': '← Back to the form',
  'Brouillon conservé — « Nouvelle dépense » le reprendra.':
    'Draft kept — « New expense » will pick it up.',
  'Brouillon conservé, mais SANS le reçu (stockage plein).':
    'Draft kept, but WITHOUT the receipt (storage full).',
  'Brouillon repris — rien n’avait été perdu.': 'Draft resumed — nothing had been lost.',
  'Brouillon jeté — formulaire vierge.': 'Draft discarded — blank form.',
  'Saisie jetée.': 'Entry discarded.',

  /* ── L ANNUAIRE DES FOURNISSEURS ────────────────────────────────────────── */
  'Lecture de l’annuaire…': 'Reading the directory…',
  '🔒 Annuaire ouvert en modification par': '🔒 Directory open for editing by',
  '— vous pouvez le consulter,': '— you can view it,',
  'pas le corriger. Deux corrections en même temps, c’est la dernière qui gagne':
    'not correct it. Two corrections at once means the last one wins',
  'sans que la première le sache.': 'without the first one knowing.',
  'Annuaire ouvert par': 'Directory open by',
  '— consultation seulement.': '— viewing only.',
  'reconnus d’emblée': 'recognized out of the box',
  'avec l’application': 'with the application',
  '＋ Ajouter un fournisseur': '＋ Add a supplier',
  'Ajouter un fournisseur': 'Add a supplier',
  'Corriger le classement': 'Correct the classification',
  'Domaine ou nom': 'Domain or name',
  'Nom affiché (facultatif)': 'Display name (optional)',
  'Catégorie (ligne fiscale)': 'Category (tax line)',
  'Un domaine complet est accepté et réduit': 'A full domain is accepted and reduced',
  'automatiquement : « render.com », « support@render.com » et « Render » désignent le même fournisseur.':
    'automatically: « render.com », « support@render.com » and « Render » mean the same supplier.',
  '✓ Enregistrer': '✓ Save',
  'Aucun fournisseur ne correspond.': 'No supplier matches.',
  'Fournisseur Catégorie': 'Supplier Category',
  'Origine Actions': 'Source Actions',
  'corrigé au lieu de': 'corrected instead of',
  'Donnez un domaine ou un nom de fournisseur.': 'Give a domain or a supplier name.',
  'Choisissez une catégorie.': 'Choose a category.',
  '» classé en': '» classified as',
  '» retrouve son classement livré :': '» returns to its delivered classification:',
  '» retiré de l’annuaire.': '» removed from the directory.',

  /* ── SUPPRIMER, OUVRIR ──────────────────────────────────────────────────── */
  'Confirmer la suppression ?': 'Confirm deletion?',
  '🗑 Supprimer': '🗑 Delete',
  '✎ Modifier': '✎ Edit',
  '📎 Ouvrir le reçu': '📎 Open the receipt',
  'Elle disparaît de la comptabilité et des': 'It disappears from the accounts and the',
  'rapports d’impôt. Irréversible.': 'tax reports. Irreversible.',
  'Ouverture du reçu…': 'Opening the receipt…',
  'Reçu ouvert dans la fenêtre principale.': 'Receipt opened in the main window.',
  'Dépense supprimée (': 'Expense deleted (',

  /* ── LES FRAGMENTS TELS QU ILS EXISTENT DANS LE GABARIT ────────────────
     ⚠ Les émojis vivent dans leur propre <span>, les en-têtes sont des cellules
     séparées, et deux phrases sont coupées par un <strong>. La forme RENDUE
     n existe nulle part dans le fichier. */
  'Lecture seule — votre rôle permet de consulter les dépenses, pas de les saisir.':
    'Read only — your role allows viewing expenses, not entering them.',
  'Ouvrir le reçu': 'Open the receipt',
  'Joindre un reçu': 'Attach a receipt',
  'Date': 'Date',
  'Catégorie': 'Category',
  'Description': 'Description',
  'Paiement': 'Payment',
  'Montant': 'Amount',
  'Taxes': 'Taxes',
  'Reçu': 'Receipt',
  'Fournisseur': 'Supplier',
  'Origine': 'Source',
  'Actions': 'Actions',
  'corrigé': 'corrected',
  ' au lieu de ': ' instead of ',
  'La fiscalité et la conciliation bancaire restent à l’écran ':
    'Tax reporting and bank reconciliation stay in the ',
  'Comptabilité': 'Accounting',
  ' de la fenêtre principale.': ' screen of the main window.',
  'Saisissez le total payé dans ': 'Enter the total paid under ',
  'Montant ': 'Amount ',
  /* ⚠ Deux phrases coupées par des <strong> : on traduit chaque morceau. */
  'La ': 'The ',
  'fiscalité': 'tax reporting',
  ' et la ': ' and ',
  'conciliation bancaire': 'bank reconciliation',
  ' restent à ': ' stay in the ',
  'Saisissez le total payé dans': 'Enter the total paid under',
  ' puis ': ' then ',
  ' pour en déduire la TPS et la TVQ.': ' to work out the GST and QST.',
  'Calc. taxes': 'Calc. taxes',
  /* ⚠ LE BALISAGE PEUT VIVRE DANS LA CHAÎNE TRADUITE. Plutôt que de découper la
     phrase autour du <strong>, on met le <strong> DEDANS : la phrase reste
     entière, l’anglais peut mettre le gras ailleurs, et rien ne se perd. */
  'Saisissez le <strong>total payé</strong> dans ': 'Enter the <strong>total paid</strong> under ',
  'Déduire TPS et TVQ d’un total payé saisi dans ': 'Work out GST and QST from a total paid entered under ',

  /* ── LA LONGUE TRAINE (voir banc-langue-residuel) ───────────────────────── */
  /* ⚠⚠ L AVERTISSEMENT DES FRAIS SQUARE EVITE UNE DOUBLE DEDUCTION : ils sont
     deja comptes a l Impot (ligne 8710). Le balisage vit DANS la chaine, pour
     que l anglais place « Square » ou sa grammaire le demande. */
  'Les <strong>frais de traitement Square</strong> ': 'Square <strong>processing fees</strong> ',
  'Dépenses': 'Expenses',
  'Dépense': 'Expense',
  'dépense': 'expense',
  'Importer une facture': 'Import an invoice',
  'livrés': 'delivered',
  'livré': 'delivered',
  'affiché': 'shown',
  'ajouté': 'added'
};
