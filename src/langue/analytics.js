'use strict';

/*
 * STATISTIQUES (GOOGLE ANALYTICS) — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE N EST PAS LE TABLEAU DE BORD. Cet ecran ne montre AUCUN chiffre : il
 * ne fait que brancher le compte Google. Les visiteurs, les pages vues et les
 * sources s ouvrent dans la fenetre Statistiques (menu Marketing) — et la
 * derniere phrase de l ecran ne dit que cela. La perdre laisse quelqu un
 * chercher des courbes ici pendant que la fenetre existe a cote.
 *
 * ⚠⚠ LA CLE DU COMPTE DE SERVICE NE REVIENT JAMAIS A L ECRAN. Le champ vide ne
 * veut pas dire « pas de clé » : il veut dire « on garde celle qui est
 * enregistrée ». Les deux pastilles (« Clé enregistrée. Vide = conservée. » et
 * « Aucune clé enregistrée. ») sont la SEULE facon de savoir laquelle des deux
 * situations on a sous les yeux. Les confondre fait effacer une cle en croyant
 * n avoir rien change.
 *
 * ⚠⚠ LES TROIS PREREQUIS SONT UNE MARCHE A SUIVRE DANS L INTERFACE DE GOOGLE,
 * pas dans la notre. Les chemins (« Admin → Accès à la propriété », le nom de
 * l API, le role « Lecteur ») sont donc ecrits COMME GOOGLE LES ECRIT dans la
 * langue du poste : un anglophone verra sa console en anglais, et un chemin
 * traduit a notre facon ne correspondrait a rien de ce qu il a sous les yeux.
 *
 * ⚠ « Google Analytics 4 », « GA4 », « Google Cloud », « Google Analytics Data »,
 * « G-XXXX », « client_email », « private_key » sont des noms propres et des
 * cles techniques : ils ne se traduisent pas.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Statistiques — Administration Sandriza': 'Statistics — Sandriza Administration',
  'Statistiques (Google Analytics)': 'Statistics (Google Analytics)',
  'Actif': 'On',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can look, not change.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  /* ⚠ L apostrophe DROITE : la source ecrit ces quatre-la entre guillemets. */
  "L'administration n'est pas encore chargée dans la fenêtre principale.":
    'The administration is not loaded in the main window yet.',
  "La fenêtre principale n'a pas répondu à temps.":
    'The main window did not answer in time.',
  "L'enregistrement dans le nuage a échoué. Réessayez.":
    'Saving to the cloud failed. Try again.',
  "L'opération a échoué.": 'The operation failed.',
  'La clé du compte de service n’est pas un JSON valide.':
    'The service account key is not valid JSON.',
  /* ⚠ Les deux noms de champs JSON restent tels quels : ils sont LUS. */
  'La clé JSON doit contenir « client_email » et « private_key ».':
    'The JSON key must contain « client_email » and « private_key ».',

  /* ══ LES PREREQUIS CHEZ GOOGLE ═════════════════════════════════════════════
   * ⚠⚠ Voir l en-tete : ces chemins sont ceux de la console de Google. */
  ' Suit les <b>consultations</b> de la boutique via <b>Google Analytics 4</b>. Prérequis :':
    ' Follows the <b>visits</b> to the shop through <b>Google Analytics 4</b>. Prerequisites:',
  '1. Créer une propriété <b>GA4</b> → noter l’<b>ID de mesure</b> (G-XXXX) et l’<b>ID de propriété</b> (numérique).':
    '1. Create a <b>GA4</b> property → note the <b>measurement ID</b> (G-XXXX) and the <b>property ID</b> (numeric).',
  '2. Dans <b>Google Cloud</b> : créer un <b>compte de service</b>, activer l’API « Google Analytics Data », télécharger sa <b>clé JSON</b>.':
    '2. In <b>Google Cloud</b>: create a <b>service account</b>, enable the « Google Analytics Data » API, download its <b>JSON key</b>.',
  '3. Dans GA4 → Admin → Accès à la propriété : ajouter l’e-mail du compte de service comme <b>Lecteur</b>.':
    '3. In GA4 → Admin → Property access management: add the service account email as a <b>Viewer</b>.',
  /* Les formes RENDUES, pour le compteur : les <b> sont tombes et ont laisse
     une espace avant la ponctuation. */
  '📊 Suit les consultations de la boutique via Google Analytics 4 . Prérequis :':
    '📊 Follows the visits to the shop through Google Analytics 4 . Prerequisites:',
  '1. Créer une propriété GA4 → noter l’ ID de mesure (G-XXXX) et l’ ID de propriété (numérique).':
    '1. Create a GA4 property → note the measurement ID (G-XXXX) and the property ID (numeric).',
  '2. Dans Google Cloud : créer un compte de service , activer l’API « Google Analytics Data », télécharger sa clé JSON .':
    '2. In Google Cloud : create a service account , enable the « Google Analytics Data » API, download its JSON key .',
  '3. Dans GA4 → Admin → Accès à la propriété : ajouter l’e-mail du compte de service comme Lecteur .':
    '3. In GA4 → Admin → Property access management: add the service account email as a Viewer .',

  /* ══ LES CHAMPS ════════════════════════════════════════════════════════════ */
  'ID de mesure (balise gtag)': 'Measurement ID (gtag tag)',
  'ID de propriété GA4 (numérique)': 'GA4 property ID (numeric)',
  'Clé du compte de service (JSON)': 'Service account key (JSON)',
  /* ⚠⚠ VIDE NE VEUT PAS DIRE « PAS DE CLE ». Voir l en-tete. */
  'inchangée (laisser vide pour conserver la clé existante)':
    'unchanged (leave empty to keep the existing key)',
  'Collez ici tout le contenu du fichier JSON téléchargé de Google Cloud':
    'Paste here the whole content of the JSON file downloaded from Google Cloud',
  'La clé est stockée côté serveur et n’est jamais renvoyée à l’écran.':
    'The key is stored on the server and is never sent back to the screen.',
  ' Clé <b>enregistrée</b>. Vide = conservée.': ' Key <b>saved</b>. Empty = kept.',
  'Aucune clé <b>enregistrée</b>.': 'No key <b>saved</b>.',
  '🔒 Clé enregistrée . Vide = conservée.': '🔒 Key saved . Empty = kept.',
  'Aucune clé enregistrée .': 'No key saved .',

  /* ══ OU SONT LES CHIFFRES ══════════════════════════════════════════════════
   * ⚠⚠⚠ La seule phrase qui dit que le tableau de bord est AILLEURS. */
  ' Le <b>tableau de bord</b> (visiteurs, pages vues, sources…) s’ouvre dans la fenêtre <b>Statistiques</b> (menu Marketing).':
    ' The <b>dashboard</b> (visitors, page views, sources…) opens in the <b>Statistics</b> window (Marketing menu).',
  '📈 Le tableau de bord (visiteurs, pages vues, sources…) s’ouvre dans la fenêtre Statistiques (menu Marketing).':
    '📈 The dashboard (visitors, page views, sources…) opens in the Statistics window (Marketing menu).',

  /* ── LE VERDICT ─────────────────────────────────────────────────────────── */
  'Statistiques enregistrées.': 'Statistics saved.'
};
