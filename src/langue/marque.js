'use strict';

/*
 * LOGOS ET MARQUE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LE NOM DE MARQUE, LES SLOGANS ET LA LETTRE DE L ICONE SONT DES DONNEES.
 * Ils sont TAPES ici, ECRITS dans la configuration, et relus par la cliente sur
 * la boutique, dans les courriels et sur les factures. Ce dictionnaire ne
 * traduit QUE LES ETIQUETTES de ces champs : « Nom de marque », « Slogan — FR ».
 * Leur CONTENU ne passe jamais par ici. La valeur de repli « SANDRIZA » et la
 * lettre « É » ne s y trouvent pas non plus : c est la marque.
 *
 * ⚠⚠ « BOUTIQUE — FR » ET « BOUTIQUE — EN » NE PARLENT PAS DE L INTERFACE. Ce
 * sont DEUX LOGOS : celui de la boutique française et celui de la boutique
 * anglaise. Traduire « FR » ou « EN » ferait croire qu on choisit la langue du
 * poste, et on deposerait le logo anglais a la place du français. Les deux
 * mentions restent telles quelles dans les deux langues.
 *
 * ⚠⚠ LA DIRECTION DU DEGRADE : sa VALEUR (`135deg`, `90deg`, `180deg`) part
 * dans la configuration, son ETIQUETTE (« ↗ Diagonale ») se lit. La source les
 * ecrivait dans UNE SEULE chaine coupee au virgule ; elles sont maintenant
 * separees, parce qu une traduction du mauvais cote aurait casse le degrade
 * sans qu aucun message ne le dise.
 *
 * ⚠ LES DEUX APERCUS sont des maquettes : « utilisateur », « •••• » et
 * « Se connecter » y montrent a quoi ressemblera la page de connexion une fois
 * les couleurs choisies. Rien n en part vers la base — ils suivent donc la
 * langue du poste, comme le reste de cette fenetre.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Logos et marque — Administration Sandriza': 'Logos and brand — Sandriza Administration',
  'Logos et marque': 'Logos and brand',
  'Lecture seule : vous pouvez consulter les logos, pas les modifier.':
    'Read only: you can view the logos, not change them.',
  'Réinitialiser': 'Reset',
  'Réinitialiser les couleurs': 'Reset the colours',

  /* ── LES ONGLETS ────────────────────────────────────────────────────────── */
  'Marque': 'Brand',
  'Logos': 'Logos',
  'Pages de connexion': 'Login pages',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule : les logos ne peuvent pas être modifiés.':
    'Your role is read only: the logos cannot be changed.',
  /* ⚠ « Rien n a ete modifie » EST le message : un depot refuse laisse la
     configuration intacte, et sans cette phrase on croit avoir tout perdu. */
  'Le dépôt du logo dans le stockage a échoué. Rien n’a été modifié.':
    'Uploading the logo to storage failed. Nothing was changed.',
  'Ce fichier n’est pas une image.': 'This file is not an image.',
  'Ce type de logo n’existe pas dans cette version.':
    'This logo type does not exist in this version.',
  'Cette remise à zéro n’existe pas dans cette version.':
    'This reset does not exist in this version.',
  'Aucun changement à enregistrer.': 'No change to save.',
  'La configuration n’est pas prête dans la fenêtre principale.':
    'The configuration is not ready in the main window.',
  'L’enregistrement dans le nuage a échoué. Réessayez.':
    'Saving to the cloud failed. Try again.',

  /* ══ L IDENTITE — DES ETIQUETTES, JAMAIS LEUR CONTENU ══════════════════════ */
  'Identité': 'Identity',
  'Le nom et les slogans repris partout : boutique, courriels, documents.':
    'The name and the taglines used everywhere: storefront, emails, documents.',
  'Nom de marque': 'Brand name',
  'Slogan — FR': 'Tagline — FR',
  'Slogan — EN': 'Tagline — EN',
  'sous le nom, dans la barre': 'under the name, in the bar',
  'Sous-titre de la connexion client': 'Customer login subtitle',
  'Lettre de l’icône': 'Icon letter',
  '1 ou 2 caractères, si aucun logo': '1 or 2 characters, when there is no logo',

  /* ── LE DEGRADE SUR LE NOM ──────────────────────────────────────────────── */
  'Dégradé sur le nom': 'Gradient on the name',
  'Appliqué au nom de marque quand aucun logo d’image ne le remplace.':
    'Applied to the brand name when no image logo replaces it.',
  'Colorer le nom en dégradé': 'Colour the name with a gradient',
  'Couleur A': 'Colour A',
  'Couleur B': 'Colour B',
  /* ⚠⚠ L ETIQUETTE SEULE — la valeur (135deg, 90deg, 180deg) est a cote dans la
     source et ne se traduit pas. Voir l en-tete. */
  'Direction': 'Direction',
  '↗ Diagonale': '↗ Diagonal',
  '→ Horizontale': '→ Horizontal',
  '↓ Verticale': '↓ Vertical',
  'Aperçu': 'Preview',

  /* ══ LES SIX LOGOS ═════════════════════════════════════════════════════════
   * ⚠⚠ « — FR » et « — EN » designent LE LOGO, pas la langue du poste. */
  'Les six logos': 'The six logos',
  /* ⚠⚠ « n est déposé qu à l enregistrement » EST la phrase qui evite de fermer
     la fenetre en croyant avoir pose son logo. */
  'Un logo choisi n’est déposé qu’à l’enregistrement. PNG ou SVG, fond transparent recommandé.':
    'A chosen logo is only uploaded when you save. PNG or SVG, transparent background recommended.',
  'Boutique — FR': 'Storefront — FR',
  'Boutique — EN': 'Storefront — EN',
  'Barre de navigation et connexion client.': 'Navigation bar and customer login.',
  'Utilise le logo français si vide.': 'Uses the French logo when empty.',
  'Barre latérale': 'Sidebar',
  'Remplace l’icône lettre si défini.': 'Replaces the letter icon when set.',
  'Connexion du personnel': 'Staff login',
  'Indépendant de la barre latérale.': 'Independent from the sidebar.',
  'Sans fond — FR': 'No background — FR',
  'Sans fond — EN': 'No background — EN',
  'Factures et courriels.': 'Invoices and emails.',
  'Aucun logo': 'No logo',
  '· en attente': '· pending',
  'Choisir un fichier…': 'Choose a file…',
  'Annuler ce choix': 'Cancel this choice',
  '✕ Supprimer': '✕ Delete',
  'Choix annulé.': 'Choice cancelled.',
  'Logo prêt. Il partira à l’enregistrement.': 'Logo ready. It will go out when you save.',
  'Ce fichier n’a pas pu être lu.': 'This file could not be read.',
  'Logo supprimé.': 'Logo deleted.',

  /* ── LES DEUX PAGES DE CONNEXION ────────────────────────────────────────── */
  'Connexion de la clientèle': 'Customer login',
  'Couleurs de l’en-tête de la page de connexion de la boutique.':
    'Colours of the header of the storefront login page.',
  'Fond — couleur A': 'Background — colour A',
  'Fond — couleur B': 'Background — colour B',
  'Texte': 'Text',
  'La page par laquelle on entre dans l’administration.':
    'The page you enter the administration through.',
  'Sous-titre': 'Subtitle',
  'Fond de la carte': 'Card background',
  'Icône — couleur A': 'Icon — colour A',
  'Icône — couleur B': 'Icon — colour B',
  'Couleur du titre': 'Title colour',
  'Bouton — couleur A': 'Button — colour A',
  'Bouton — couleur B': 'Button — colour B',
  'Couleur du sous-titre': 'Subtitle colour',
  /* Les deux mots de la maquette — voir l en-tete : rien n en part vers la base. */
  'utilisateur': 'user',
  'Se connecter': 'Sign in',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Dépôt de ': 'Uploading ',
  /* La forme RENDUE : le message est coupe du nombre qui le suit. */
  'Dépôt de': 'Uploading',
  ' logos…': ' logos…',
  ' logo…': ' logo…',
  'Logos et marque enregistrés.': 'Logos and brand saved.',
  'Remise à zéro…': 'Resetting…',
  'Couleurs de connexion réinitialisées.': 'Login colours reset.',
  'Marque et logos réinitialisés.': 'Brand and logos reset.'
};
