'use strict';

/*
 * FISCALITE ET IMPOT — les deux langues
 * =============================================================================
 * ⚠⚠⚠ ICI, PRESQUE RIEN NE SE TRADUIT LIBREMENT. Cet ecran parle a l ARC et a
 * Revenu Quebec, et un terme invente rend le document inutilisable pour le
 * comptable a qui il est destine. La regle a deja ete payee sur `depenses` :
 *
 *   TPS = GST  ·  TVQ = QST  ·  ARC = CRA (Canada Revenue Agency)
 *   credits sur intrants = INPUT TAX CREDITS
 *   CTI = ITC (input tax credit, federal)
 *   RTI = ITR (input tax refund, Quebec)
 *   NE = BN (business number)
 *
 * ⚠⚠ ET LES NUMEROS DE FORMULAIRES NE SE TRADUISENT PAS DU TOUT : GST34,
 * FPZ-500-V, T2125, TP-80-V, « ligne 8710 ». Ce sont des REFERENCES : on les
 * cite. Les traduire ferait chercher un formulaire qui n existe pas.
 * ⚠ « Revenu Quebec » garde son nom en anglais — c est son nom officiel dans
 * les deux langues, y compris dans la documentation de l ARC. Meme chose pour
 * le « Registraire des entreprises du Quebec ».
 * ⚠ « PST / RST » sont DEJA des sigles anglais (provincial / retail sales tax) :
 * ils ne bougent pas.
 *
 * ⚠⚠ LES DEUX AVERTISSEMENTS QUI PROTEGENT D UN DOCUMENT IRRECEVABLE gardent
 * leur fermete : le profil incomplet (« les documents s imprimeront sans eux, et
 * ils ne seront pas recevables ») et l avis general (« a titre indicatif
 * seulement… faites confirmer votre situation par un comptable agree »).
 * Les affaiblir ferait deposer une declaration sur des chiffres non verifies.
 *
 * ⚠ « Notre decompte : a confronter a la facture Stripe avant de le saisir en
 * depense. Rien n est enregistre automatiquement. » — sans cette phrase on
 * deduit deux fois, ou pas du tout.
 *
 * ⚠ LES TYPES D ENTREPRISE viennent du SERVEUR (`PROFIL.types`) : leurs
 * libelles sont ses mots, pas les notres.
 */

module.exports = {
  /* ── L EN-TETE ──────────────────────────────────────────────────────────── */
  'Fiscalité et impôt — Administration Sandriza': 'Tax and income tax — Sandriza Administration',
  'Fiscalité et impôt': 'Tax and income tax',
  'Fiscalité indisponible': 'Tax section unavailable',
  'Votre rôle ne donne pas accès à la fiscalité.':
    'Your role does not give access to the tax section.',
  'Ce document n’existe pas.': 'This document does not exist.',

  /* ── LES SIX DOCUMENTS ──────────────────────────────────────────────────── */
  /* ⚠ GST34, FPZ-500-V, T2125, TP-80-V sont des NUMEROS DE FORMULAIRES : on les
     cite tels quels, dans les deux langues. */
  'Remise TPS / TVQ — trimestrielle': 'GST / QST remittance — quarterly',
  'GST34 (ARC) et FPZ-500-V (Revenu Québec) pour un trimestre, avec les crédits sur intrants déjà déduits.':
    'GST34 (CRA) and FPZ-500-V (Revenu Québec) for one quarter, with input tax credits already deducted.',
  'Remise TPS / TVQ — annuelle': 'GST / QST remittance — annual',
  'Le même sommaire pour l’année entière, si votre fréquence de remise est annuelle.':
    'The same summary for the whole year, if your remittance frequency is annual.',
  'T2125 — État des résultats (fédéral)': 'T2125 — Statement of business activities (federal)',
  'Revenus et dépenses ventilés par ligne fiscale, prêts à reporter dans votre déclaration.':
    'Income and expenses broken down by tax line, ready to carry into your return.',
  'TP-80-V — État des résultats (Québec)': 'TP-80-V — Statement of business activities (Quebec)',
  'L’équivalent québécois, aux mêmes chiffres.': 'The Quebec equivalent, on the same figures.',
  'Grand livre des ventes': 'Sales ledger',
  'Chaque vente de l’année, avec la TPS et la TVQ perçues — le registre que demande un comptable.':
    'Every sale of the year, with the GST and QST collected — the register an accountant asks for.',
  'Inventaire de fin d’exercice': 'Year-end inventory',
  'La valeur du stock à la date de clôture, au coût — nécessaire au calcul du coût des marchandises vendues.':
    'The value of stock at the closing date, at cost — needed to work out the cost of goods sold.',
  'Composition du document…': 'Building the document…',
  'Document ouvert dans la fenêtre principale — prêt à imprimer.':
    'Document opened in the main window — ready to print.',

  /* ── LE PROFIL D ENTREPRISE ─────────────────────────────────────────────── */
  /* ⚠⚠ « ILS NE SERONT PAS RECEVABLES » : sans cette phrase, on imprime une
     remise sans numero de taxe et on la depose. */
  '⚠ Profil d’entreprise incomplet — il manque le nom,': '⚠ Business profile incomplete — the name,',
  'le NEQ ou vos numéros de TPS/TVQ. Les documents s’imprimeront sans eux, et ils ne':
    'the NEQ or your GST/QST numbers are missing. The documents will print without them, and they will',
  'seront pas recevables. Compléter maintenant': 'not be admissible. Complete it now',
  'Mon entreprise': 'My business',
  'Lecture du profil…': 'Reading the profile…',
  'Profil complet — vos documents fiscaux se remplissent tout seuls.':
    'Profile complete — your tax documents fill themselves in.',
  'Il manque le nom, le NEQ ou vos numéros de taxes. Les documents s’imprimeront sans eux, et ils ne seront pas recevables.':
    'The name, the NEQ or your tax numbers are missing. The documents will print without them, and they will not be admissible.',
  'Raison sociale': 'Legal name',
  /* ⚠ NEQ, NE/BN : des sigles officiels. Le NEQ garde le sien dans les deux
     langues ; le numero d entreprise de l ARC se dit BN en anglais. */
  'NEQ — Numéro d’entreprise du Québec': 'NEQ — Québec enterprise number',
  '10 chiffres · Registraire des entreprises du Québec':
    '10 digits · Registraire des entreprises du Québec',
  'Numéro d’entreprise ARC (NE)': 'CRA business number (BN)',
  '9 chiffres · Agence du revenu du Canada': '9 digits · Canada Revenue Agency',
  'Type d’entreprise': 'Business type',
  'Numéros d’inscription aux taxes': 'Tax registration numbers',
  'Format : 123456789 RT0001 · ARC': 'Format: 123456789 RT0001 · CRA',
  'Format : 1234567890 TQ0001 · Revenu Québec': 'Format: 1234567890 TQ0001 · Revenu Québec',
  'Code postal': 'Postal code',
  'Courriel professionnel': 'Business email',
  'Enregistrer le profil': 'Save the profile',
  'Profil enregistré — vos documents seront complets.':
    'Profile saved — your documents will be complete.',
  'Profil enregistré, mais il manque encore le nom, le NEQ ou un numéro de taxe.':
    'Profile saved, but the name, the NEQ or a tax number is still missing.',
  'Profil illisible :': 'Profile unreadable:',
  'Échec :': 'Failed:',
  'Le profil d’entreprise (nom, NEQ, numéros de TPS et':
    'The business profile (name, NEQ, GST and',
  'de TVQ, adresse) se remplit à l’écran de la fenêtre principale — c’est lui qui garnit':
    'QST numbers, address) is filled in on the main window screen — it is what fills',
  'l’en-tête de ces documents.': 'the header of these documents.',

  /* ── LES LIENS OFFICIELS ────────────────────────────────────────────────── */
  /* ⚠ « Revenu Québec » et le « Registraire des entreprises » gardent leur nom :
     c est celui sous lequel on les trouve, en anglais comme en français. */
  'Registraire des entreprises (REQ)': 'Registraire des entreprises (REQ)',
  'Mon dossier d’entreprise — ARC': 'My Business Account — CRA',
  'Mon dossier — Revenu Québec': 'My Account — Revenu Québec',
  'Site officiel': 'Official site',
  'Onglet Documents': 'Documents tab',

  /* ── L AIDE-MEMOIRE ─────────────────────────────────────────────────────── */
  'Lecture de l’aide-mémoire…': 'Reading the reminder…',
  'Aide-mémoire illisible :': 'Reminder unreadable:',
  'Dates limites —': 'Deadlines —',
  'Remises TPS / TVQ (trimestriel)': 'GST / QST remittances (quarterly)',
  'Déclarations de revenus': 'Income tax returns',
  'Déductions — boutique en ligne': 'Deductions — online shop',
  'Formulaires de référence': 'Reference forms',
  /* ⚠⚠ L AVIS GENERAL : il dit que ces chiffres ne remplacent pas un comptable.
     Il garde sa fermete — on depose une declaration avec. */
  '💬 À titre indicatif seulement. Les lois fiscales changent':
    '💬 For guidance only. Tax laws change',
  'chaque année : faites confirmer votre situation par un comptable agréé. Les chiffres viennent':
    'every year: have your situation confirmed by a chartered professional accountant. The figures come',

  /* ── LE SOMMAIRE DES TAXES ──────────────────────────────────────────────── */
  'Ventes nettes taxables': 'Net taxable sales',
  'TPS perçue (5 %)': 'GST collected (5 %)',
  'à remettre — ARC': 'to remit — CRA',
  'TVQ perçue (9,975 %)': 'QST collected (9.975 %)',
  'à remettre — Revenu Québec': 'to remit — Revenu Québec',
  'Net à remettre': 'Net to remit',
  'à remettre': 'to remit',
  'après crédits sur intrants': 'after input tax credits',
  /* ⚠ CTI / RTI sont les sigles FRANCAIS ; en anglais ce sont ITC / ITR. */
  'Taxe nette à remettre après crédits sur intrants (CTI / RTI)':
    'Net tax to remit after input tax credits (ITC / ITR)',
  'TVQ Total': 'QST Total',
  'Taxes perçues sur les ventes': 'Taxes collected on sales',
  'Moins : taxes payées sur les dépenses −': 'Less: taxes paid on expenses −',
  'Aucune taxe payée sur des dépenses n’est saisie — vos crédits sur intrants sont donc à zéro. Saisissez vos dépenses avec leur TPS et leur TVQ pour les récupérer.':
    'No tax paid on expenses has been entered — your input tax credits are therefore nil. Enter your expenses with their GST and QST to claim them back.',
  'Un montant négatif est un remboursement de taxe en votre faveur, pas une erreur.':
    'A negative amount is a tax refund in your favour, not an error.',

  /* ── LE SEUIL D INSCRIPTION ─────────────────────────────────────────────── */
  'Vos ventes (': 'Your sales (',
  ': l’inscription aux taxes n’est pas obligatoire. À confirmer avec votre comptable.':
    ': tax registration is not compulsory. To be confirmed with your accountant.',
  'Vos ventes dépassent le seuil de': 'Your sales exceed the threshold of',
  ': l’inscription aux taxes est obligatoire, et les remises doivent être faites régulièrement.':
    ': tax registration is compulsory, and remittances must be made regularly.',

  /* ── LES TAXES PROVINCIALES ─────────────────────────────────────────────── */
  /* ⚠⚠ « NI DANS LES CHIFFRES CI-DESSUS NI DANS GST34 / FPZ-500-V » : sans cette
     phrase on croit ces taxes deja remises, et une province reste impayee.
     ⚠ PST / RST sont deja des sigles anglais : ils ne bougent pas. */
  '🏛 Taxes provinciales perçues (PST / RST) —': '🏛 Provincial taxes collected (PST / RST) —',
  'à remettre à CHAQUE province séparément, elles ne sont ni dans les chiffres':
    'to remit to EACH province separately; they are in neither the figures',
  'ci-dessus ni dans GST34 / FPZ-500-V :': 'above nor in GST34 / FPZ-500-V:',

  /* ── LES FRAIS STRIPE ───────────────────────────────────────────────────── */
  /* ⚠ « RIEN N EST ENREGISTRE AUTOMATIQUEMENT » evite de deduire deux fois. */
  'Frais Stripe Tax': 'Stripe Tax fees',
  'Aucune transaction facturée cette année.': 'No transaction billed this year.',
  'par Stripe.': 'by Stripe.',
  'Notre décompte : à confronter à la facture Stripe avant de le':
    'Our count: to be checked against the Stripe invoice before',
  'saisir en dépense. Rien n’est enregistré automatiquement.':
    'entering it as an expense. Nothing is recorded automatically.',
  'de ces chiffres : −': 'of these figures: −',
  'taxable, −': 'taxable, −',

  /* ── LES TABLEAUX ───────────────────────────────────────────────────────── */
  'Résumé trimestriel fréquence de remise habituelle d’une PME':
    'Quarterly summary the usual remittance frequency for a small business',
  'Résumé trimestriel': 'Quarterly summary',
  'fréquence de remise habituelle d’une PME': 'the usual remittance frequency for a small business',
  'Trimestre Ventes nettes': 'Quarter Net sales',
  'À remettre Cmdes': 'To remit Orders',
  'Détail mensuel': 'Monthly detail',
  'Mois Ventes nettes': 'Month Net sales',
  'Trimestre': 'Quarter',
  'Ventes nettes': 'Net sales',
  'Cmdes': 'Orders',
  'Mois': 'Month',
  'Ventes nettes par mois': 'Net sales per month',
  'Trimestre pour les documents trimestriels': 'Quarter for the quarterly documents',
  'T1 — jan · mar': 'Q1 — Jan · Mar',
  'T2 — avr · juin': 'Q2 — Apr · Jun',
  'T3 — juil · sep': 'Q3 — Jul · Sep',
  'T4 — oct · déc': 'Q4 — Oct · Dec',

  /* ── L ETAT DES RESULTATS ───────────────────────────────────────────────── */
  'État des résultats T2125 fédéral · TP-80-V Québec':
    'Statement of business activities T2125 federal · TP-80-V Quebec',
  'État des résultats': 'Statement of business activities',
  'T2125 fédéral · TP-80-V Québec': 'T2125 federal · TP-80-V Quebec',
  'Ventes brutes de marchandises': 'Gross sales of goods',
  'Remises et coupons': 'Discounts and coupons',
  'Remboursements émis': 'Refunds issued',
  'Revenus d’expédition facturés': 'Shipping income billed',
  'Revenus nets d’entreprise': 'Net business income',
  'Total des dépenses': 'Total expenses',
  'section Dépenses': 'Expenses section',
  'Perte nette d’entreprise': 'Net business loss',
  'Bénéfice net d’entreprise': 'Net business profit',
  'Encaissements réels Square': 'Actual Square receipts',
  'Revenu brut encaissé': 'Gross income received',
  'Frais de traitement': 'Processing fees',
  /* ⚠ « ligne 8710 » est un NUMERO DE LIGNE de formulaire : on le cite. */
  'déductibles · ligne 8710': 'deductible · line 8710',
  'Revenu net après frais': 'Net income after fees',
  'Dépenses par ligne fiscale': 'Expenses by tax line',
  'Catégorie Ligne Montant': 'Category Line Amount',
  'Catégorie': 'Category',
  'Ligne': 'Line',
  'Montant': 'Amount',
  'Aucune dépense saisie pour': 'No expense entered for',
  '— le bénéfice net ci-dessus ne tient donc compte d’aucune déduction.':
    '— the net profit above therefore takes no deduction into account.',
  /* ══ LES CLES TELLES QUE LA *SOURCE* LES ECRIT ══════════════════════════════ */
  'seront pas recevables. ': 'not be admissible. ',
  'Compléter maintenant': 'Complete it now',
  'Aide-mémoire': 'Reminder',
  'Coordonnées': 'Contact details',
  'Téléphone': 'Phone',
  'Année d’imposition': 'Tax year',
  'Année': 'Year',
  '<strong>À titre indicatif seulement.</strong> Les lois fiscales changent ':
    '<strong>For guidance only.</strong> Tax laws change ',
  'Aucune transaction facturée cette année.': 'No transaction billed this year.',
  'facturée': 'billed',
  '<b>Notre décompte</b> : à confronter à la facture Stripe avant de le ':
    '<b>Our count</b>: to be checked against the Stripe invoice before ',
  'déduit': 'deducted',
  '<strong>Taxes provinciales perçues (PST / RST)</strong> — ':
    '<strong>Provincial taxes collected (PST / RST)</strong> — ',
  'Moins : taxes payées sur les dépenses': 'Less: taxes paid on expenses',
  'Encaissements réels ': 'Actual receipts ',
  'pour les documents trimestriels': 'for the quarterly documents',
  'Le profil d’entreprise (nom, NEQ, numéros de TPS et ':
    'The business profile (name, NEQ, GST and ',

  /* ── LES EN-TETES, UNE CELLULE A LA FOIS ────────────────────────────────── */
  'Ventes nettes': 'Net sales',
  'À remettre': 'To remit',
  /* ⚠ Le <strong> tombe sur « profil d’entreprise » seul : on garde la phrase
     entière, gras compris. La forme rendue ne dit pas où sont les balises. */
  'Le <strong>profil d’entreprise</strong> (nom, NEQ, numéros de TPS et ':
    'The <strong>business profile</strong> (name, NEQ, GST and '
};
