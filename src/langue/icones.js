'use strict';

/*
 * ICONES PERSONNALISEES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ [icon:xxx] EST UN CODE, PAS UN TEXTE. Il se copie d ici et se TAPE dans
 * les textes du site — pages, fiches, courriels — ou il est relu tel quel et
 * remplace par l image. Ni le mot « icon », ni les crochets, ni le tag (fait a
 * partir du NOM donne a l icone) ne passent par ce dictionnaire : les traduire
 * casserait toutes les icones deja posees dans les textes, EN ANGLAIS SEULEMENT.
 * Seul le prefixe qui l annonce se lit : « Code copié : », « Icône ajoutée : ».
 *
 * ⚠⚠ LE NOM DE L ICONE EST UNE DONNEE : c est lui qui fait le tag. Son exemple
 * (« coeur, etoile, feu… ») est un exemple de NOMS — il suit la langue du poste
 * parce qu il ne sort pas de l administration, mais le nom tape, lui, reste tel
 * quel.
 *
 * ⚠⚠ LE CONVERTISSEUR .ico EST INDEPENDANT DES ICONES CI-CONTRE. La phrase le
 * dit en toutes lettres ; sans elle on croit convertir une icone de la liste, et
 * l on cherche longtemps pourquoi rien ne change.
 *
 * ⚠ AUCUN TRAITEMENT D IMAGE ICI : le depot, le retrait de fond et la conversion
 * se font au coeur. Les motifs distinguent le DEPOT (rien n a ete ajoute), la
 * CONVERSION et le NUAGE — trois pannes, trois gestes.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Icônes personnalisées — Administration Sandriza':
    'Custom icons — Sandriza Administration',
  'Icônes personnalisées': 'Custom icons',

  /* ── LA LECTURE SEULE ───────────────────────────────────────────────────── */
  'Lecture seule : vous pouvez consulter les icônes, pas les modifier.':
    'Read only: you can look at the icons, not change them.',
  'Votre rôle est en lecture seule : les icônes ne peuvent pas être modifiées.':
    'Your role is read only: the icons cannot be changed.',

  /* ══ LES MOTIFS DE REFUS ═══════════════════════════════════════════════════
   * ⚠⚠ Trois pannes differentes, trois gestes : le DEPOT (rien n a ete ajoute),
   * la CONVERSION, et le NUAGE (reessayez). Ne pas les rapprocher. */
  'Donnez un nom à l’icône.': 'Give the icon a name.',
  'Ce fichier n’est pas une image.': 'This file is not an image.',
  'Cette image n’a pas pu être lue.': 'This image could not be read.',
  'Ce fichier n’a pas pu être lu.': 'This file could not be read.',
  'Le dépôt de l’icône dans le stockage a échoué. Rien n’a été ajouté.':
    'Uploading the icon to storage failed. Nothing was added.',
  'La conversion en .ico a échoué.': 'The conversion to .ico failed.',
  'Cette icône n’existe plus.': 'This icon no longer exists.',
  'La configuration n’est pas prête dans la fenêtre principale.':
    'The configuration is not ready in the main window.',
  'L’enregistrement dans le nuage a échoué. Réessayez.':
    'Saving to the cloud failed. Try again.',

  /* ══ AJOUTER UNE ICONE ═════════════════════════════════════════════════════ */
  'Ajouter une icône': 'Add an icon',
  /* ⚠⚠ Ce qui donne son sens a tout l ecran : le code se TAPE dans les textes. */
  'Insérez ensuite son code dans n’importe quel texte du site : il devient l’image.':
    'Then insert its code in any text of the site: it turns into the image.',
  /* La vignette vide : le <br> coupe la phrase, la cle porte la balise. */
  'Choisir<br>une image': 'Choose<br>an image',
  'Choisir une image': 'Choose an image',
  'Image prête.': 'Image ready.',
  'Retirer le fond de l’image': 'Remove the background of the image',
  'Ajouter l’icône': 'Add the icon',
  'Choisissez d’abord une image.': 'Choose an image first.',
  'Ajout de l’icône…': 'Adding the icon…',

  /* ══ LE CONVERTISSEUR .ico ═════════════════════════════════════════════════
   * ⚠⚠ INDEPENDANT des icones ci-contre — voir l en-tete. */
  'Convertir une image en .ico': 'Convert an image to .ico',
  'Toutes les tailles de 16 à 256 px, reprises de l’image d’origine — indépendant des icônes ci-contre.':
    'Every size from 16 to 256 px, taken from the original image — independent of the icons beside.',
  'Télécharger le .ico': 'Download the .ico',

  /* ══ LA LISTE ══════════════════════════════════════════════════════════════ */
  'Les icônes du site': 'The icons of the site',
  'Aucune icône pour l’instant.': 'No icon yet.',
  /* Le compte, en tete de fenetre : les deux formes en entier. */
  ' icônes': ' icons',
  ' icône': ' icon',
  'icônes': 'icons',
  'icône': 'icon',
  'Copier le code': 'Copy the code',

  /* ══ LE .ico TELECHARGE ════════════════════════════════════════════════════
   * ⚠ Le NOM DU FICHIER vient du coeur : seule la phrase autour se lit. */
  'Fichier ': 'File ',
  ' téléchargé.': ' downloaded.',
  'téléchargé.': 'downloaded.',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  /* ⚠⚠⚠ Le prefixe seulement : ce qui suit est le CODE. */
  'Code copié : ': 'Code copied: ',
  'Code copié :': 'Code copied:',
  'Icône ajoutée : ': 'Icon added: ',
  'Icône ajoutée :': 'Icon added:',
  'Icône supprimée.': 'Icon deleted.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Nom': 'Name'
};
