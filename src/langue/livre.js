'use strict';

/*
 * LIVRE DE COMPTES — les deux langues (#128, phase 2)
 * =============================================================================
 * ⚠⚠ LE VOCABULAIRE COMPTABLE EST FIXE, PAS LIBRE. Cet ecran sera lu par un
 * comptable ; un terme invente lui fait chercher ce qu on a voulu dire. Les
 * equivalences retenues sont celles des normes canadiennes (NCECF / ASPE) et de
 * l ARC — les memes que `impot.js` et `langue/comptabilite.js` :
 *
 *   ecriture (de journal)     = journal entry
 *   partie double             = double entry
 *   journal                   = journal          (le livre chronologique)
 *   grand livre               = general ledger
 *   balance de verification   = trial balance    (PAS << verification balance >>)
 *   bilan                     = balance sheet    (PAS << balance >> tout court :
 *                               en anglais << balance >> designe un SOLDE)
 *   debit / credit            = debit / credit
 *   solde                     = balance
 *   actif / passif            = assets / liabilities
 *   capitaux propres          = owner's equity   (entreprise individuelle ; pour
 *                               une societe ce serait << shareholders' equity >>)
 *   apport / retrait          = contribution / drawings
 *   contre-passation          = reversing entry
 *   solde d ouverture         = opening balance
 *   resultat de l exercice    = net income for the year
 *   cout des marchandises     = cost of goods sold
 *
 * ⚠ << Balance >> EST UN FAUX AMI, ET C EST LE PIEGE PRINCIPAL DE CE FICHIER.
 * En francais c est un ETAT (la balance de verification) ; en anglais c est un
 * SOLDE. << Balance >> seul, en anglais, ferait lire << solde >> la ou l ecran
 * montre un etat, et l onglet ne voudrait plus rien dire.
 *
 * ⚠⚠ LES NOMS DE COMPTES NE SONT PAS ICI, ET C EST VOULU. Le plan comptable est
 * DEDUIT des categories de depenses, cote site (`GrandLivre.plan()`), et voyage
 * avec les chiffres. Les recopier ici ferait DEUX listes : le jour ou une
 * categorie change de nom, le livre afficherait encore l ancienne, et le solde
 * serait rattache a un compte qui ne correspond plus a rien qu on voit.
 *
 * ⚠ ON NE TRADUIT QUE CE QUI SE LIT. Aucune valeur enregistrable n entre ici —
 * ni un code de compte, ni un libelle d ecriture saisi par la personne.
 */

module.exports = {
  /* ── Titre et cadre ─────────────────────────────────────────────────────── */
  'Livre de comptes — Administration Sandriza': 'General ledger — Sandriza Administration',
  'Livre de comptes': 'General ledger',
  'Chargement en cours': 'Loading',
  'Livre indisponible': 'Ledger unavailable',

  /* ── Les refus, mot pour mot ────────────────────────────────────────────── */
  'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.':
    'No session is open in the application. Sign in from the main window.',
  'Votre rôle ne donne pas accès au livre de comptes.':
    'Your role does not give access to the general ledger.',
  'L’administration n’est pas encore chargée dans la fenêtre principale.':
    'The administration panel is not loaded yet in the main window.',
  'La fenêtre principale ne répond pas.': 'The main window is not responding.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not respond in time.',
  'Cette version de l’application ne connaît pas cette opération.':
    'This version of the application does not know this operation.',
  'L’écriture envoyée n’a pas la forme attendue.': 'The entry sent does not have the expected shape.',
  'L’opération a échoué.': 'The operation failed.',
  'Erreur inattendue (': 'Unexpected error (',

  /* ── Onglets et barre d’outils ──────────────────────────────────────────── */
  'Journal': 'Journal',
  'Grand livre': 'General ledger',
  /* ⚠ PAS << Balance >> : en anglais ce mot designe un SOLDE, pas un etat. */
  'Balance': 'Trial balance',
  'Bilan': 'Balance sheet',
  'Écritures manuelles': 'Manual entries',
  'Exercice': 'Fiscal year',
  'Exercice financier à afficher': 'Fiscal year to display',
  '1er janv. au 31 déc.': 'Jan 1 to Dec 31,',
  'Nouvelle écriture': 'New entry',

  /* ── Le rapprochement — le contrôle en haut de l’écran ──────────────────── */
  'Contrôle impossible': 'Check impossible',
  'Le moteur des rapports n’a pas répondu : le résultat du livre n’a été comparé à rien.':
    'The reporting engine did not respond: the ledger result was not compared to anything.',
  'Les deux moteurs concordent': 'Both engines agree',
  'Résultat du livre': 'Ledger result',
  '= résultat des rapports': '= reports result',
  '+ écritures manuelles': '+ manual entries',
  'LES DEUX MOTEURS DIVERGENT': 'THE TWO ENGINES DISAGREE',
  'Livre': 'Ledger',
  'Rapports': 'Reports',
  'écart': 'variance',
  'L’un des deux est faux. Ne vous fiez à aucun chiffre de cet écran tant que l’écart n’est pas expliqué.':
    'One of the two is wrong. Do not rely on any figure on this screen until the variance is explained.',

  /* ── Les avertissements ─────────────────────────────────────────────────── */
  'Ce que ce livre ne dit pas tout seul': 'What this ledger does not tell you on its own',
  'Aucun solde d’ouverture.': 'No opening balance.',
  'La boutique n’a jamais enregistré l’encaisse ni le stock de départ : le livre part de zéro. L’encaisse affiche':
    'The shop never recorded the opening cash or inventory: the ledger starts from zero. Cash shows',
  'un négatif qui n’existe pas dans la réalité.': 'a negative amount that does not exist in reality.',
  'Une seule écriture manuelle d’ouverture, une fois, et tout le reste devient juste.':
    'A single manual opening entry, once, and everything else becomes correct.',
  'unité(s) vendue(s) sans coût d’acquisition connu : leur sortie de stock n’est PAS écrite, et la marge est incomplète.':
    'unit(s) sold with no known acquisition cost: their removal from inventory is NOT recorded, and the margin is incomplete.',
  'Les frais d’encaissement n’ont pas été rapatriés pour cet exercice : aucune écriture ne les porte. Ce n’est pas la même chose que « aucun frais ».':
    'Processing fees were not retrieved for this fiscal year: no entry carries them. That is not the same as “no fees”.',
  'Les frais d’encaissement sont portés en UNE écriture au 31 décembre : l’encaisseur ne rend qu’un total annuel, pas la date de chaque frais.':
    'Processing fees are posted as ONE entry on December 31: the processor returns only an annual total, not the date of each fee.',
  'commande(s) dont le total enregistré diffère de quelques cents de la somme de ses composantes (arrondi de la caisse). L’écriture est équilibrée par construction ; aucun total du livre n’en dépend.':
    'order(s) whose recorded total differs by a few cents from the sum of its components (checkout rounding). The entry balances by construction; no ledger total depends on it.',
  'ligne(s) posée(s) sur un compte absent du plan.': 'line(s) posted to an account missing from the chart of accounts.',
  'Elles ne sont dans aucun compte : le livre est amputé. C’est un défaut, pas un réglage.':
    'They are in no account: the ledger is incomplete. This is a defect, not a setting.',
  'La balance ne balance pas': 'The trial balance does not balance',
  'Une écriture bancale a franchi le contrôle : signalez-le.': 'An unbalanced entry got past the check: please report it.',
  'écriture(s) refusée(s) parce qu’elles ne s’équilibraient pas. Elles ne sont dans aucun total.':
    'entry(ies) refused because they did not balance. They are in no total.',

  /* ── Le journal ─────────────────────────────────────────────────────────── */
  'Vente': 'Sale',
  'Coût des marchandises': 'Cost of goods sold',
  'Remboursement': 'Refund',
  'Retour au stock': 'Return to inventory',
  'Dépense': 'Expense',
  'Frais d’encaissement': 'Processing fees',
  'Écriture manuelle': 'Manual entry',
  'Aucune écriture pour cet exercice.': 'No entries for this fiscal year.',
  'Journal de l’exercice': 'Journal for the year',
  'dérivée(s)': 'derived',
  'manuelle(s)': 'manual',
  'Date': 'Date',
  'Libellé / compte': 'Description / account',
  'Débit': 'Debit',
  'Crédit': 'Credit',
  'écriture(s)': 'entry(ies)',

  /* ── Le grand livre ─────────────────────────────────────────────────────── */
  'Actif': 'Assets',
  'Passif': 'Liabilities',
  'Capitaux propres': 'Owner’s equity',
  'Produits': 'Revenue',
  'Charges': 'Expenses',
  'Aucun compte mouvementé pour cet exercice.': 'No account had activity this fiscal year.',
  'Compte': 'Account',
  'Solde': 'Balance',
  'ligne': 'line',
  'Replier': 'Collapse',
  'Détail': 'Detail',

  /* ── La balance de vérification ─────────────────────────────────────────── */
  'Verdict': 'Verdict',
  'Équilibrée': 'Balanced',
  'DÉSÉQUILIBRÉE': 'OUT OF BALANCE',
  'Total des débits': 'Total debits',
  'Total des crédits': 'Total credits',
  'Balance de vérification': 'Trial balance',
  'Totaux': 'Totals',

  /* ── Le bilan ───────────────────────────────────────────────────────────── */
  'Total': 'Total',
  'Résultat de l’exercice': 'Net income for the year',
  'L’équation': 'The equation',
  'Elle est toujours vraie dès que chaque écriture s’équilibre : elle ne prouve donc pas que les chiffres sont justes, seulement que le journal est sain.':
    'It always holds as soon as every entry balances: it therefore proves nothing about the figures being right, only that the journal is sound.',

  /* ── Les écritures manuelles ────────────────────────────────────────────── */
  '— choisir un compte —': '— choose an account —',
  'Libellé': 'Description',
  'Apport du propriétaire, amortissement, retrait…': 'Owner contribution, amortization, drawings…',
  'Ajouter une ligne': 'Add a line',
  'Enregistrer l’écriture': 'Save entry',
  'Annuler': 'Cancel',
  'Débits et crédits doivent s’équilibrer au cent. Une même ligne ne porte jamais les deux.':
    'Debits and credits must balance to the cent. A single line never carries both.',
  'Aucune écriture manuelle pour cet exercice.': 'No manual entries for this fiscal year.',
  'C’est ici que vivent les apports, les retraits, les prêts, l’amortissement et les ajustements de votre comptable — tout ce que la boutique ne peut pas savoir.':
    'This is where contributions, drawings, loans, amortization and your accountant’s adjustments live — everything the shop cannot know.',
  'Supprimer': 'Delete',
  'Confirmer': 'Confirm',
  'Une écriture en partie double garde au moins deux lignes.': 'A double-entry record keeps at least two lines.',
  'Écriture enregistrée.': 'Entry saved.',
  'Écriture supprimée.': 'Entry deleted.',

  /* ── L'impression (#128, volet 3/n) ─────────────────────────────────────
     ⚠ L'intitulé du bouton se COMPOSE : « Imprimer » + le nom du document de
     l'onglet. Les quatre noms sont donc en MINUSCULE et avec leur article —
     « Imprimer le grand livre », « Imprimer la balance ». En anglais l'article
     disparaît, et c'est normal : « Print the general ledger » se dit « Print
     general ledger ». Traduire mot à mot aurait donné « Print the balance »,
     qui se lit « imprimer LE SOLDE ». */
  'Imprimer': 'Print',
  'le journal': 'journal',
  'le grand livre': 'general ledger',
  'la balance': 'trial balance',
  'le bilan': 'balance sheet',
  'Le document s’ouvre dans la fenêtre principale…': 'The document is opening in the main window…',
  'Document ouvert dans la fenêtre principale.': 'Document opened in the main window.',
};
