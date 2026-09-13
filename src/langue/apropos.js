'use strict';

/*
 * LA FENETRE « A PROPOS » — les deux langues
 * =============================================================================
 * ⚠⚠ POURQUOI CET ECRAN-LA EST ARRIVE EN DERNIER, DEUX JOURS APRES « 98 SUR 98 ».
 * Le chantier bilingue a compte les fichiers de `src/fenetres/` : 98, tous
 * traduits, les deux mesures a zero. Cette fenetre-ci est batie dans `main.js`
 * — le processus principal — et n a donc JAMAIS ete comptee. Elle est restee
 * entierement francaise sous un compte exact et des bancs verts, pendant que
 * l ecran de mise a jour du MEME fichier, lui, passait deja par `TP()`.
 * ➡ Un compte exhaustif ne l est que sur le terrain qu il enumere.
 *
 * ⚠ CE QU ON Y LIT, ET POURQUOI CA COMPTE PLUS QUE SA TAILLE. C est l ecran
 * qu on ouvre pour REPONDRE A UNE QUESTION : quelle version tourne, sur quel
 * poste, ou sont les reglages, ou vont les exports. On l ouvre en general parce
 * que quelqu un demande ces valeurs — et son bouton « Copier les details » les
 * envoie telles quelles dans un courriel. Un ecran de diagnostic a moitie
 * traduit se recopie a moitie traduit.
 *
 * ══ CE QUI N EST PAS TRADUIT ICI, ET C EST VOULU ════════════════════════════
 *   · `Windows`, `macOS`, `Electron`, `Chromium`, `Node` — des NOMS PROPRES ;
 *   · le numero de version, l adresse du portail, les chemins de fichiers —
 *     des VALEURS, et deux d entre elles sont des chemins du disque : les
 *     traduire les rendrait faux, pas seulement etranges.
 * Le texte du presse-papiers (`texteApropos`) suit la langue de l interface :
 * c est ce qu on LIT et ce qu on colle, jamais une donnee enregistree — la
 * regle est respectee.
 *
 * ⚠ `Administration` s ecrit pareil dans les deux langues. L entree existe
 * quand meme : sans elle, le banc ne saurait pas distinguer « traduit et
 * identique » de « oublie ».
 */

module.exports = {
  /* ── LES TROIS SECTIONS ─────────────────────────────────────────────────── */
  'Application': 'Application',
  'Poste': 'Computer',
  'Réglages': 'Settings',

  /* ── SECTION « APPLICATION » ────────────────────────────────────────────── */
  'Version': 'Version',
  /* ⚠ LA PHRASE ENTIERE, pas un suffixe colle. Ecrire `T('  (développement)')`
     a part aurait marche en francais et donne un espacement faux en anglais :
     l ordre des morceaux n est pas une propriete du francais. */
  '{0}  (développement)': '{0}  (development)',
  'Portail': 'Portal',
  'Mises à jour': 'Updates',
  'vérifiées à chaque lancement': 'checked at every launch',
  'Impression': 'Printing',
  'native, sans agent local': 'native, no local agent',

  /* ── SECTION « POSTE » ──────────────────────────────────────────────────── */
  'Système': 'System',
  /* Les trois architectures. ⚠ Le code entre parentheses (`x64`, `ia32`) ne se
     traduit pas : c est celui qu on retrouve dans le nom de l installateur. */
  '64 bits (x64)': '64-bit (x64)',
  '32 bits (ia32)': '32-bit (ia32)',
  'ARM 64 bits': 'ARM 64-bit',
  '{0} · {1}': '{0} · {1}',

  /* ── SECTION « REGLAGES » ───────────────────────────────────────────────── */
  'Menu': 'Menu',
  /* Les quatre ancrages du menu. ⚠ Ce sont les LIBELLES lus ici ; la valeur
     enregistree dans `reglages.json` reste `haut`/`gauche`/`droite`/`fenetre`
     et n est pas touchee. */
  'en haut': 'top',
  'à gauche': 'on the left',
  'à droite': 'on the right',
  'fenêtre séparée': 'separate window',
  '{0} · taille {1} %': '{0} · size {1}%',
  'Fichier': 'File',
  'Exports': 'Exports',

  /* ── LE GABARIT DE LA PAGE ──────────────────────────────────────────────── */
  'À propos': 'About',
  'Administration': 'Administration',
  'version {0}': 'version {0}',
  'Copier les détails': 'Copy the details',
  'Vérifier les mises à jour': 'Check for updates',
  'Fermer': 'Close',
};
