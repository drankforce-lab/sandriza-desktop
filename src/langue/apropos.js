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
  "Boutique de test": "Test store",
  "Revenir à la production ?": "Go back to production?",
  "L’application redémarre sur la vraie boutique. Vous devrez vous reconnecter.": "The app restarts on the real store. You will need to sign in again.",
  "Redémarrer": "Restart",
  "Annuler": "Cancel",
  "Ce poste n’est pas autorisé : ajoutez son adresse IP dans Configuration › Base de données › Boutique de test — accès.": "This computer is not allowed: add its IP address in Configuration › Database › Test store — access.",
  "Le serveur de la boutique de test ne répond pas (code {0}). Vérifiez que admtest.sandriza.com est bien branché sur le service de test.": "The test store server is not responding (code {0}). Check that admtest.sandriza.com is connected to the test service.",
  "Impossible d’ouvrir la boutique de test": "Cannot open the test store",
  "Basculer vers la boutique de test ?": "Switch to the test store?",
  "L’application redémarre sur la base de TEST : ce que vous y faites ne touche pas la vraie boutique, jusqu’à la synchronisation. Les courriels partent à l’adresse de redirection ; aucun texto ne part. Vous devrez vous connecter.": "The app restarts on the TEST database: what you do there does not touch the real store until synchronisation. Emails go to the redirect address; no text message is sent. You will need to sign in.",
  "Redémarrer sur le test": "Restart on test",
};
