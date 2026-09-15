'use strict';

/*
 * RAPPORTS ET BUDGET — les deux langues (#116, phase 1)
 * =============================================================================
 * ⚠⚠ LE VOCABULAIRE COMPTABLE EST FIXE, PAS LIBRE. Cet ecran sera lu par un
 * comptable ; un terme invente lui fait chercher ce qu on a voulu dire. Les
 * equivalences retenues sont celles des normes canadiennes (NCECF / ASPE) et de
 * l ARC, les memes que `impot.js` :
 *
 *   ventes nettes            = net sales
 *   cout des marchandises    = cost of goods sold (COGS)
 *   marge brute              = gross profit        (PAS << gross margin >>, qui
 *                              designe le POURCENTAGE dans l usage courant)
 *   charges / depenses d exploitation = operating expenses
 *   resultat net             = net income          (PAS << net result >>)
 *   exercice                 = fiscal year
 *   prevu / reel / ecart     = budget / actual / variance
 *   ecart favorable          = favourable variance (orthographe canadienne :
 *                              favourable, comme dans les documents de l ARC)
 *
 * ⚠ << Reel >> ne se traduit PAS par << real >> : en comptabilite c est
 * << actual >>. << Real >> se lirait comme une opposition a << faux >>.
 *
 * ⚠⚠ LES LIBELLES DES POSTES NE SONT PAS ICI, ET C EST VOULU. Les dix-huit
 * categories de depenses viennent du SITE avec les chiffres (voir
 * `Compta.postesDisponibles`). Les recopier ici ferait DEUX listes : le jour ou
 * une categorie change de nom ou de ligne fiscale, le budget afficherait encore
 * l ancienne, et l ecart serait calcule sur une cle qui ne correspond plus a
 * rien qu on voit a l ecran.
 */

module.exports = {
  /* ── Titre et cadre ─────────────────────────────────────────────────────── */
  'Rapports et budget — Administration Sandriza': 'Reports and budget — Sandriza Administration',
  'Rapports et budget': 'Reports and budget',
  'Chargement en cours': 'Loading',
  'Rapports indisponibles': 'Reports unavailable',

  /* ── Les refus, mot pour mot ────────────────────────────────────────────── */
  'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.':
    'No session is open in the application. Sign in from the main window.',
  'Votre rôle ne donne pas accès aux rapports comptables.':
    'Your role does not give access to the accounting reports.',
  'L’administration n’est pas encore chargée dans la fenêtre principale.':
    'The administration is not loaded yet in the main window.',
  'La fenêtre principale ne répond pas.': 'The main window is not responding.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not respond in time.',
  'Cette version de l’application ne connaît pas cette opération.':
    'This version of the application does not know this operation.',
  'Cette année n’est pas valable.': 'That year is not valid.',
  'Le budget envoyé n’a pas la forme attendue.': 'The budget sent is not in the expected form.',
  'L’opération a échoué.': 'The operation failed.',
  'Erreur inattendue (': 'Unexpected error (',

  /* ── Les mois, abreges a trois lettres comme dans la version francaise ──── */
  'Jan': 'Jan', 'Fév': 'Feb', 'Mar': 'Mar', 'Avr': 'Apr', 'Mai': 'May', 'Jun': 'Jun',
  'Jul': 'Jul', 'Aoû': 'Aug', 'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Déc': 'Dec',

  /* ── La barre d outils ──────────────────────────────────────────────────── */
  'Exercices comparés :': 'Fiscal years compared:',
  'Exercice': 'Fiscal year',
  'Exercice financier à afficher': 'Fiscal year to display',
  /* ⚠ L exercice est l annee civile, tranche avec lui le 2026-09-14. La date se
     dit en clair pour qu on n ait pas a deviner de quoi l annee est faite. */
  '1er janv. au 31 déc.': 'Jan. 1 to Dec. 31,',
  'Répartir également': 'Spread evenly',
  'Enregistrer le budget': 'Save budget',
  'Gardez au moins un exercice.': 'Keep at least one fiscal year.',

  /* ── Les onglets ────────────────────────────────────────────────────────── */
  'Résultats': 'Results',
  'Comparer': 'Compare',
  'Budget': 'Budget',

  /* ── Les grands chiffres ────────────────────────────────────────────────── */
  'Revenu total': 'Total revenue',
  'Ventes nettes + livraison, retours déduits': 'Net sales + shipping, returns deducted',
  'Marge brute': 'Gross profit',
  'Aucune vente': 'No sales',
  'du revenu': 'of revenue',
  'Charges': 'Expenses',
  'Dépenses d’exploitation + frais d’encaissement': 'Operating expenses + payment processing fees',
  'Résultat net': 'Net income',
  'Avant impôt': 'Before income tax',

  /* ── L etat des resultats ───────────────────────────────────────────────── */
  'Aucun exercice à afficher.': 'No fiscal year to display.',
  'État des résultats': 'Income statement',
  'Ventes brutes de marchandise': 'Gross merchandise sales',
  'Moins : rabais et coupons': 'Less: discounts and coupons',
  'Moins : retours de marchandise': 'Less: merchandise returns',
  'Ventes nettes': 'Net sales',
  'Livraison facturée': 'Shipping billed',
  'Moins : livraison remboursée': 'Less: shipping refunded',
  'REVENU TOTAL': 'TOTAL REVENUE',
  'Coût des marchandises vendues': 'Cost of goods sold',
  'MARGE BRUTE': 'GROSS PROFIT',
  'Frais d’encaissement': 'Payment processing fees',
  'Dépenses d’exploitation': 'Operating expenses',
  'RÉSULTAT NET': 'NET INCOME',
  'Achats de marchandise saisis dans les Dépenses :': 'Merchandise purchases entered under Expenses:',
  'écartés des charges à dessein : ils appartiennent au coût des marchandises, déjà calculé ci-dessus sur les unités vendues. Les additionner facturerait la même marchandise deux fois.':
    'deliberately kept out of expenses: they belong to the cost of goods sold, already computed above from the units sold. Adding both would charge the same merchandise twice.',

  /* ── Le tableau des douze mois ──────────────────────────────────────────── */
  'Mois par mois': 'Month by month',
  'Mois': 'Month',
  'Cmd': 'Ord.',
  'Revenu': 'Revenue',
  'Coût': 'Cost',
  'Marge': 'Profit',
  'Dépenses': 'Expenses',
  'Résultat': 'Income',

  /* ── La comparaison pluriannuelle ───────────────────────────────────────── */
  'Choisissez au moins un exercice.': 'Choose at least one fiscal year.',
  'Coût des marchandises': 'Cost of goods',
  'Charges totales': 'Total expenses',
  'Commandes': 'Orders',
  'Un seul exercice est choisi : il n’y a rien à comparer. Cochez une autre année dans la barre du haut.':
    'Only one fiscal year is selected, so there is nothing to compare. Tick another year in the bar above.',
  'Exercices côte à côte': 'Fiscal years side by side',
  'Poste': 'Line',
  'Écart': 'Variance',
  'Variation': 'Change',
  'Écart et variation portent sur les deux derniers exercices affichés.':
    'Variance and change are measured between the two most recent fiscal years shown.',
  'Cumul des': 'Total across',
  'exercices': 'fiscal years',

  /* ── Le budget ──────────────────────────────────────────────────────────── */
  'Le prévu est comparé au réel jusqu’au mois': 'Budget is compared with actual up to and including',
  'inclusivement — comparer douze mois de budget à quelques mois de ventes annoncerait une catastrophe tous les printemps.':
    '— comparing twelve months of budget with a few months of sales would announce a disaster every spring.',
  'Prévu (année)': 'Budget (year)',
  'Prévu à ce jour': 'Budget to date',
  'Réel': 'Actual',
  'Lecture seule — votre rôle ne permet pas de poser un budget.':
    'Read only — your role does not allow setting a budget.',
  'revenu': 'revenue',
  'budget annuel': 'annual budget',
  'Le réel de ce poste est annuel ; le prévu est coupé au mois. L’écart est indicatif.':
    'The actual for this line covers the full year while the budget is cut off at the month. The variance is indicative.',
  'partiel': 'partial',
  'non budgété': 'not budgeted',
  'Replier': 'Collapse',
  'Détailler': 'Break down',
  'Chaque poste a été réparti également sur les douze mois.':
    'Every line was spread evenly across the twelve months.',
  'Enregistrement…': 'Saving…',
  'Budget enregistré.': 'Budget saved.',

  /* ── CE QUE LES CHIFFRES NE DISENT PAS ──────────────────────────────────
     ⚠ C est la partie la plus importante de l ecran : un rapport muet sur ses
     trous se lit comme un rapport complet. La traduction doit garder la meme
     FORCE — pas l adoucir en une note de bas de page. */
  'unité(s) vendue(s) sans coût d’acquisition connu': 'unit(s) sold with no known acquisition cost',
  'La marge et le résultat net sont donc SURESTIMÉS : un produit sans coût est compté comme gratuit. Inscrivez le coût d’acquisition sur':
    'Gross profit and net income are therefore OVERSTATED: a product with no cost is counted as free. Enter the acquisition cost on',
  'les frais d’encaissement n’ont pas été rapatriés pour cet exercice : ils comptent pour zéro, ce qui n’est pas la même chose que « aucun frais ». Ouvrez Paiements et actualisez l’année.':
    'payment processing fees were never retrieved for this fiscal year, so they count as zero — which is not the same as “no fees”. Open Payments and refresh the year.',
  'aucun budget n’a été posé : la colonne « écart » ne compare rien.':
    'no budget was set, so the “variance” column compares nothing.',
  /* ══ LES FRAGMENTS COLLÉS — ET POURQUOI ILS ONT LEUR ENTRÉE ═══════════════
     ⚠⚠ CE NE SONT PAS DES DOUBLONS. Le relevé bilingue lit la page ASSEMBLÉE et
     retire les balises : une même chaîne source qui porte trois en-têtes de
     colonne (« <th>Mois</th><th>Cmd</th><th>Revenu</th> ») lui arrive comme UN
     seul texte, « Mois Cmd Revenu ». Sans décision pour ce texte-là, le banc le
     déclare non traduit — à juste titre, puisqu il ne peut pas savoir que les
     morceaux, eux, le sont.
     ⚠ C est la convention déjà en place (voir « Trimestre Ventes nettes » dans
     impot.js) : on donne sa décision au fragment collé ET à chaque morceau. Les
     casser en trois chaînes source serait plus joli et strictement équivalent à
     l écran — mais ça rendrait le tableau illisible dans le fichier. */
  'Mois Cmd Revenu': 'Month Ord. Revenue',
  'Coût Marge Dépenses': 'Cost Profit Expenses',
  'Écart Variation': 'Variance Change',
  'Poste Prévu (année)': 'Line Budget (year)',
  'Prévu à ce jour Réel': 'Budget to date Actual',
  '— budget annuel"': '— annual budget"',
  'unité(s) vendue(s) sans coût d’acquisition connu .': 'unit(s) sold with no known acquisition cost .',
  '— écartés des charges à dessein : ils appartiennent au coût des marchandises, déjà calculé ci-dessus sur les unités vendues. Les additionner facturerait la même marchandise deux fois.':
    '— deliberately kept out of expenses: they belong to the cost of goods sold, already computed above from the units sold. Adding both would charge the same merchandise twice.',
  '— les frais d’encaissement n’ont pas été rapatriés pour cet exercice : ils comptent pour zéro, ce qui n’est pas la même chose que « aucun frais ». Ouvrez Paiements et actualisez l’année.':
    '— payment processing fees were never retrieved for this fiscal year, so they count as zero, which is not the same as “no fees”. Open Payments and refresh the year.',
  '— aucun budget n’a été posé : la colonne « écart » ne compare rien.':
    '— no budget was set, so the “variance” column compares nothing.',

  'Ce que ces chiffres ne disent pas': 'What these figures do not tell you',
  'Ces chiffres se calculent sur ce que la boutique enregistre : ventes, remboursements, dépenses, encaissements et stock. Un apport du propriétaire, un prêt, un amortissement, une paie hors dépenses ou un ajustement demandé par votre comptable n’y figurent pas — ce sera l’objet du livre de comptes complet.':
    'These figures are computed from what the shop records: sales, refunds, expenses, payments and inventory. An owner contribution, a loan, depreciation, payroll outside of expenses, or an adjustment requested by your accountant do not appear here — that will be the job of the full general ledger.',
};
