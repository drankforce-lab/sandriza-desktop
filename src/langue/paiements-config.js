'use strict';

/*
 * CONFIGURATION DES PAIEMENTS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ C EST L ECRAN OU L ON CHOISIT SI LES CARTES SONT VRAIMENT DEBITEES. Le
 * mot « production » y sert DEUX FOIS : comme valeur comparee dans le code
 * (`MODE === 'production'`) et comme mot affiche. Une cle « production » se
 * serait posee sur les deux, et c est la COMPARAISON qui serait partie en
 * anglais. La source ecrit donc maintenant chaque phrase EN ENTIER
 * (« Identifiants du mode production rechargés… », « …environnement bac à
 * sable. ») et laisse la comparaison nue. ⚠ Aucune cle de ce fichier ne doit
 * jamais valoir un seul mot d environnement.
 *
 * ⚠⚠ LES IDENTIFIANTS SQUARE SONT DES DONNEES, et des donnees secretes :
 * identifiant d application, jeton d acces, identifiant d emplacement. Seules
 * leurs etiquettes et leurs aides se traduisent. Les exemples de format
 * (`sq0idp-…`, `EAAAl…`, `L…`) sont des formats, pas du texte : ils ne changent
 * pas de langue.
 *
 * ⚠⚠ LA MISE EN GARDE DE PRODUCTION — « les paiements sont réels et les cartes
 * sont débitées » — se traduit en entier. C est la seule phrase qui distingue un
 * essai d un vrai debit.
 *
 * ⚠ LES TARIFS sont informatifs : les pourcentages et les montants sont des
 * chiffres canadiens, ils ne changent pas ; leurs libelles se lisent.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Configuration des paiements — Administration Sandriza':
    'Payment configuration — Sandriza Administration',
  'Configuration des paiements': 'Payment configuration',
  'Lecture seule : vous pouvez consulter les réglages, pas les modifier.':
    'Read only: you can view the settings, not change them.',
  'Tester la connexion': 'Test the connection',
  'Enregistrer les identifiants': 'Save the credentials',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès aux paiements.':
    'Your role does not give access to the payments.',
  'Votre rôle est en lecture seule : les paiements ne peuvent pas être modifiés.':
    'Your role is read only: the payments cannot be changed.',
  'Entrez d’abord un jeton d’accès, puis enregistrez.':
    'Enter an access token first, then save.',
  'Square a refusé la connexion.': 'Square refused the connection.',
  'Aucun changement à enregistrer.': 'No change to save.',
  'Le module de paiement n’est pas prêt dans la fenêtre principale.':
    'The payment module is not ready in the main window.',
  'L’enregistrement dans le nuage a échoué. Réessayez.':
    'Saving to the cloud failed. Try again.',
  'Environnement incomplet.': 'Incomplete environment.',

  /* ══ L ENVIRONNEMENT — CE QUI SE LIT, JAMAIS CE QUI SE COMPARE ═════════════ */
  'Production — paiements réels': 'Production — real payments',
  'Bac à sable — paiements de test': 'Sandbox — test payments',
  'Bac à sable — test': 'Sandbox — test',
  'Production — réel': 'Production — real',
  /* ⚠⚠ LA PHRASE QUI DISTINGUE UN ESSAI D UN VRAI DEBIT. Coupee par la source en
     deux morceaux : on traduit chacun tel qu il est ecrit. */
  'Environnement de production : les paiements sont réels et les ':
    'Production environment: the payments are real and the ',
  'Environnement de production : les paiements sont réels et les':
    'Production environment: the payments are real and the',
  'cartes sont débitées.': 'cards are charged.',

  /* ── LES IDENTIFIANTS ───────────────────────────────────────────────────── */
  'Identifiants Square': 'Square credentials',
  'Chaque environnement garde ses propres identifiants. Le mode enregistré ':
    'Each environment keeps its own credentials. The saved mode ',
  /* La forme RENDUE : l espace de fin tombe. */
  'Chaque environnement garde ses propres identifiants. Le mode enregistré':
    'Each environment keeps its own credentials. The saved mode',
  'ne change qu’au moment où vous enregistrez.': 'only changes when you save.',
  'Identifiant d’application': 'Application ID',
  'Tableau de bord développeur, section Credentials.':
    'Developer dashboard, Credentials section.',
  'Jeton d’accès': 'Access token',
  /* Le champ vide garde le jeton en place : le mot du champ le dit. */
  'inchangé': 'unchanged',
  /* ⚠ Le <b> coupe les deux phrases du jeton : la cle porte la balise. */
  'Jeton <b>enregistré</b> (se termine par ': 'Token <b>saved</b> (ends with ',
  '). Laissez le champ vide pour le conserver.':
    '). Leave the field empty to keep it.',
  'Jeton enregistré (se termine par': 'Token saved (ends with',
  'Aucun jeton <b>enregistré</b> pour cet environnement.':
    'No token <b>saved</b> for this environment.',
  'Aucun jeton enregistré pour cet environnement.':
    'No token saved for this environment.',
  'Identifiant d’emplacement': 'Location ID',
  'Testez la connexion pour voir vos emplacements.':
    'Test the connection to see your locations.',

  /* ── OU LA CLIENTE SAISIT SA CARTE ──────────────────────────────────────── */
  'Où le client saisit sa carte': 'Where the customer enters their card',
  'Payer sur la page sécurisée de Square': 'Pay on Square’s secure page',
  /* ⚠⚠ « Aucun numéro de carte ne passe par notre site » EST la raison de cette
     case : la raccourcir retirerait le seul endroit ou elle est dite. */
  'Le client est dirigé vers Square, paie, puis revient sur un écran d’attente. ':
    'The customer is sent to Square, pays, then comes back to a waiting screen. ',
  'Le client est dirigé vers Square, paie, puis revient sur un écran d’attente.':
    'The customer is sent to Square, pays, then comes back to a waiting screen.',
  'Aucun numéro de carte ne passe par notre site.':
    'No card number goes through our site.',

  'Modes de paiement à la caisse': 'Payment methods at checkout',
  'À activer d’abord dans le tableau de bord Square.':
    'To be turned on first in the Square dashboard.',
  'Apple Pay': 'Apple Pay',
  'Visible seulement dans Safari, sur un appareil compatible.':
    'Visible only in Safari, on a compatible device.',
  'Paiement express sur la fiche et le panier':
    'Express payment on the product page and the basket',
  'Le client paie sans passer par le tunnel de commande. À éprouver en bac à sable ':
    'The customer pays without going through the order funnel. To be tried in the sandbox ',
  'Le client paie sans passer par le tunnel de commande. À éprouver en bac à sable':
    'The customer pays without going through the order funnel. To be tried in the sandbox',
  'avant de l’offrir.': 'before offering it.',
  'Enregistrer les modes de paiement': 'Save the payment methods',

  /* ── LES TARIFS (INFORMATIFS) ───────────────────────────────────────────── */
  'Tarifs Square — Canada': 'Square rates — Canada',
  'En ligne (carte)': 'Online (card)',
  'Par transaction web': 'Per web transaction',
  'En personne (lecteur)': 'In person (reader)',
  'Glissement, puce, sans contact': 'Swipe, chip, contactless',
  'Saisie manuelle': 'Keyed in',
  'Numéro entré à la main': 'Number typed by hand',
  'Virement ACH': 'ACH transfer',
  'Transfert bancaire': 'Bank transfer',
  'Tarifs en vigueur au Canada, à vérifier sur ':
    'Rates in force in Canada, to be checked on ',
  'Tarifs en vigueur au Canada, à vérifier sur':
    'Rates in force in Canada, to be checked on',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  /* ⚠⚠ CHAQUE PHRASE EST COMPLETE — voir l en-tete : le mot « production » ne
     doit JAMAIS etre une cle a lui seul. */
  'Identifiants du mode production rechargés. Enregistrez pour l’activer.':
    'Production credentials reloaded. Save to turn it on.',
  'Identifiants du mode bac à sable rechargés. Enregistrez pour l’activer.':
    'Sandbox credentials reloaded. Save to turn it on.',
  'Aucun identifiant mémorisé pour ce mode. Saisissez-les, puis enregistrez.':
    'No credentials stored for this mode. Enter them, then save.',
  'Identifiants enregistrés — environnement production.':
    'Credentials saved — production environment.',
  'Identifiants enregistrés — environnement bac à sable.':
    'Credentials saved — sandbox environment.',
  'Modes de paiement enregistrés.': 'Payment methods saved.',
  'Connexion à Square…': 'Connecting to Square…',
  'Connexion réussie.': 'Connection successful.',
  'Connexion réussie — ': 'Connection successful — ',
  'Connexion réussie —': 'Connection successful —',
  ' emplacements :': ' locations:',
  ' emplacement :': ' location:',
  'emplacements :': 'locations:',
  'emplacement :': 'location:',

  /* ── LES MOTS SEULS (2026-09-13) — nom de produit Square, identique. */
  'Afterpay': 'Afterpay'
};
