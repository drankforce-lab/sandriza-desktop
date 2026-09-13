'use strict';

/*
 * GABARITS COURRIEL — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE QUI SE REGLE ICI PART DANS LES COURRIELS QUE LA CLIENTE RECOIT : les
 * couleurs de l en-tete et du pied, le sous-titre, la banniere. Le NOM d un
 * gabarit et son SOUS-TITRE sont des DONNEES — le sous-titre est IMPRIME dans
 * l image de la banniere. Ce dictionnaire ne traduit que les etiquettes.
 * ⚠ Le nom du gabarit « Défaut » reste tel quel meme dans la phrase anglaise :
 * c est le nom de la fiche, pas un mot.
 *
 * ⚠⚠ LES DEUX BASCULES NE SE VALENT PAS, ET LEURS EXPLICATIONS DISENT POURQUOI :
 *   · L EFFET CSS ne s anime QUE dans Apple Mail / Mail iOS ; ailleurs le
 *     degrade reste fixe.
 *   · LA BANNIERE GIF s anime dans Gmail et Outlook, mais elle REMPLACE
 *     l en-tete et INTEGRE le nom de marque et le sous-titre A L IMAGE.
 * Qui perd ces deux phrases choisit au hasard, et s en apercoit a l envoi.
 *
 * ⚠ L exemple du sous-titre reste FRANCAIS : c est un exemple de ce que la
 * CLIENTE lira en tete de courriel.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Gabarits courriel — Administration Sandriza': 'Email templates — Sandriza Administration',
  'Gabarits courriel': 'Email templates',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can view, not change.',
  '+ Nouveau gabarit': '+ New template',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  /* ⚠ L apostrophe DROITE : la source ecrit ces trois-la entre guillemets
     doubles. */
  "L'administration n'est pas encore chargée dans la fenêtre principale.":
    'The administration is not loaded yet in the main window.',
  "La fenêtre principale n'a pas répondu à temps.": 'The main window did not answer in time.',
  "L'opération a échoué.": 'The operation failed.',
  'Le nom du gabarit est requis.': 'The template name is required.',
  'Ce gabarit n’existe plus.': 'This template no longer exists.',
  /* ⚠ « Défaut » est le NOM de la fiche, et la garder telle quelle laissait un
     mot francais dans la phrase anglaise — le banc du residuel l a dit. La liste
     marque deja cette fiche « (default) » : la phrase anglaise la designe donc
     par son role, pas par son nom. */
  'Le gabarit « Défaut » ne peut pas être supprimé.':
    'The default template cannot be deleted.',

  /* ══ L EDITEUR ═════════════════════════════════════════════════════════════ */
  'Modifier — ': 'Edit — ',
  'Modifier —': 'Edit —',
  'Nouveau gabarit': 'New template',
  'Nom du gabarit': 'Template name',
  'En-tête : couleur de départ': 'Header: start colour',
  'En-tête : couleur de fin': 'Header: end colour',
  ' — code hexadécimal': ' — hex code',
  'Sous-titre (vide = tagline du pied de page)':
    'Subtitle (empty = footer tagline)',
  /* ⚠ L exemple reste francais : c est ce que la CLIENTE lira. */
  'ÉLÉGANCE · RAFFINEMENT · STYLE': 'ÉLÉGANCE · RAFFINEMENT · STYLE',
  /* ⚠⚠ LES DEUX BASCULES ET LEUR PORTEE REELLE. Le <span class="t"> coupe la
     phrase : les cles la reprennent telle que la source l ecrit. */
  ' Effet animé CSS (en-tête &amp; pied)': ' Animated CSS effect (header &amp; footer)',
  'Léger dégradé chatoyant, sans image. Visible dans Apple Mail / Mail iOS ; ailleurs (Gmail, Outlook) le dégradé reste fixe.':
    'A light shimmering gradient, no image. Seen in Apple Mail / Mail iOS; elsewhere (Gmail, Outlook) the gradient stays still.',
  '✨ Effet animé CSS (en-tête pied) Léger dégradé chatoyant, sans image. Visible dans Apple Mail / Mail iOS ; ailleurs (Gmail, Outlook) le dégradé reste fixe.':
    '✨ Animated CSS effect (header footer) A light shimmering gradient, no image. Seen in Apple Mail / Mail iOS; elsewhere (Gmail, Outlook) the gradient stays still.',
  ' Bannière animée GIF (compatible Gmail)': ' Animated GIF banner (Gmail friendly)',
  'Remplace l’en-tête par une bannière GIF générée à partir des couleurs. S’anime dans Gmail et Outlook. Nom de marque et sous-titre intégrés à l’image.':
    'Replaces the header with a GIF banner built from the colours. It animates in Gmail and Outlook. Brand name and subtitle are baked into the image.',
  '🖼️ Bannière animée GIF (compatible Gmail) Remplace l’en-tête par une bannière GIF générée à partir des couleurs. S’anime dans Gmail et Outlook. Nom de marque et sous-titre intégrés à l’image.':
    '🖼️ Animated GIF banner (Gmail friendly) Replaces the header with a GIF banner built from the colours. It animates in Gmail and Outlook. Brand name and subtitle are baked into the image.',
  'Pied : couleur de fond': 'Footer: background colour',
  'Pied : couleur du texte': 'Footer: text colour',
  '…contenu du courriel…': '…email content…',
  ' Aperçu de la bannière GIF ': ' Preview of the GIF banner ',
  '🖼️ Aperçu de la bannière GIF ↻': '🖼️ Preview of the GIF banner ↻',
  'Aperçu bannière': 'Banner preview',
  'Aperçu GIF indisponible : ': 'GIF preview unavailable: ',
  'Aperçu GIF indisponible :': 'GIF preview unavailable:',
  ' Enregistrer': ' Save',
  '💾 Enregistrer': '💾 Save',
  'Annuler': 'Cancel',
  '← Retour': '← Back',

  /* ══ LA LISTE ET LES ATTRIBUTIONS ══════════════════════════════════════════ */
  ' Gabarits disponibles': ' Templates available',
  '🎨 Gabarits disponibles Le style (couleurs, sous-titre, bannière) partagé par les courriels.':
    '🎨 Templates available The style (colours, subtitle, banner) shared by the emails.',
  'Le style (couleurs, sous-titre, bannière) partagé par les courriels.':
    'The style (colours, subtitle, banner) shared by the emails.',
  '(défaut)': '(default)',
  'en-tête': 'header',
  'pied': 'footer',
  ' Modifier': ' Edit',
  '✏ Modifier': '✏ Edit',
  ' Copier': ' Copy',
  '📋 Copier': '📋 Copy',
  'Confirmer ?': 'Confirm?',
  ' Attribution par module / fonction': ' Assignment by module / feature',
  '📋 Attribution par module / fonction Choisissez quel gabarit s’applique à chaque type de courriel.':
    '📋 Assignment by module / feature Choose which template applies to each kind of email.',
  'Choisissez quel gabarit s’applique à chaque type de courriel.':
    'Choose which template applies to each kind of email.',
  'Module': 'Module',
  'Fonction': 'Feature',
  'Gabarit': 'Template',
  'Module Fonction Gabarit': 'Module Feature Template',
  'Gabarit de ': 'Template of ',
  'Gabarit de': 'Template of',
  ' Enregistrer les attributions': ' Save the assignments',
  '💾 Enregistrer les attributions': '💾 Save the assignments',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Gabarit enregistré.': 'Template saved.',
  'Gabarit dupliqué.': 'Template duplicated.',
  /* ⚠ Ce qui arrive AUX ATTRIBUTIONS quand on supprime un gabarit. */
  'Gabarit supprimé — attributions au défaut.':
    'Template deleted — assignments back to the default.',
  'Enregistrement des attributions…': 'Saving the assignments…',
  'Attributions enregistrées.': 'Assignments saved.'
};
