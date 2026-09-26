'use strict';

/*
 * IMAGES DES PRODUITS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LES TROIS MOTIFS D ECHEC PAR IMAGE NE SONT PAS DECORATIFS : chacun mene a
 * un geste different, et confondre les deux premiers ferait chercher au mauvais
 * endroit pendant des heures. « le dépôt a échoué » = le relais ou le fichier ;
 * « déposée mais impossible de la relire » = l image EST partie, rien n a ete
 * remplace ; « la fiche n a pas pu être enregistrée » = les images sont la, c est
 * le catalogue qui n a pas suivi. Les trois restent trois phrases distinctes.
 *
 * ⚠⚠ « LE DEPLACEMENT NE PERD RIEN » EST CE QUI PERMET D OSER. Une image n est
 * retiree de la fiche QUE si son depot a reussi ET qu elle a pu etre relue
 * ensuite ; l operation peut etre interrompue et reprise. Sans cette phrase,
 * personne ne lance une migration sur son propre catalogue.
 *
 * ⚠⚠ LES ECHECS SONT MONTRES, PAS RESUMES. « N image(s) n ont pas pu être
 * déplacées — elles sont restées INTACTES dans leur fiche, rien n a été perdu. »
 * Et la boucle s arrete quand un tour ne fait plus rien avancer : le verdict dit
 * POURQUOI elle s arrete, sinon une migration bloquee sur deux fiches passerait
 * pour terminee.
 *
 * ⚠ Le nom de la fiche, le SKU et le chemin viennent du catalogue.
 * ⚠ Les unites (Mo, ko, o) ne se traduisent pas : elles s ecrivent pareil.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Images des produits — Administration Sandriza':
    'Product images — Sandriza Administration',
  'Images des produits': 'Product images',
  'Lecture du catalogue…': 'Reading the catalogue…',
  'Déplacer les images': 'Move the images',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne permet pas de modifier les fiches produits.':
    'Your role does not allow changing the product records.',
  /* ⚠ L apostrophe DROITE : la source ecrit ces trois-la entre guillemets. */
  "Le catalogue n'est pas encore chargé dans la fenêtre principale.":
    'The catalogue is not loaded in the main window yet.',
  "La fenêtre principale n'a pas répondu à temps.":
    'The main window did not answer in time.',
  "L'opération a échoué.": 'The operation failed.',

  /* ══ LES TROIS ECHECS PAR IMAGE ════════════════════════════════════════════
   * ⚠⚠⚠ Voir l en-tete : trois pannes, trois gestes. Ne pas les rapprocher. */
  'le dépôt de l’image a échoué (relais indisponible, ou fichier refusé)':
    'the image upload failed (relay unavailable, or file refused)',
  'l’image a bien été déposée, mais impossible de la relire ensuite — rien n’a donc été remplacé':
    'the image was uploaded, but it could not be read back afterwards — so nothing was replaced',
  'les images sont déposées, mais la fiche n’a pas pu être enregistrée':
    'the images are uploaded, but the product record could not be saved',

  /* ══ QUAND IL N Y A RIEN A FAIRE ═══════════════════════════════════════════ */
  '<b>Rien à déplacer.</b> Les ': '<b>Nothing to move.</b> The ',
  /* La forme RENDUE, pour le compteur : les balises sont tombees. */
  'Rien à déplacer. Les': 'Nothing to move. The',
  ' image(s) du catalogue sont déjà dans le seau d’images : le navigateur des clients peut les garder en cache, et le catalogue ne les transporte plus à chaque visite.':
    ' catalogue image(s) are already in the image bucket: the customers’ browser can keep them in cache, and the catalogue no longer carries them at every visit.',
  'image(s) du catalogue sont déjà dans le seau d’images : le navigateur des clients peut les garder en cache, et le catalogue ne les transporte plus à chaque visite.':
    'catalogue image(s) are already in the image bucket: the customers’ browser can keep them in cache, and the catalogue no longer carries them at every visit.',

  /* ══ CE QUE LE DEPLACEMENT FAIT, ET CE QU IL NE PERD PAS ═══════════════════
   * ⚠⚠ Deux paragraphes entiers, balises comprises : les <b> coupent la phrase,
   * pas la pensee. */
  'Ces fiches portent encore leur image <b>collée dans la fiche</b> plutôt qu’une adresse. Elles s’affichent très bien — c’est pour ça que personne ne les voit passer : leur image voyage <b>entière, à chaque chargement du catalogue</b>, et le navigateur ne peut pas la garder en cache.':
    'These records still carry their image <b>pasted into the record</b> rather than an address. They display perfectly well — which is exactly why nobody notices them: their image travels <b>whole, at every load of the catalogue</b>, and the browser cannot keep it in cache.',
  'Le déplacement <b>ne perd rien</b> : une image n’est retirée de la fiche que si son dépôt a réussi <b>et</b> qu’elle a pu être relue ensuite. Il peut être interrompu et repris — ce qui est déjà fait ne sera pas refait.':
    'Moving them <b>loses nothing</b>: an image is removed from the record only if its upload succeeded <b>and</b> it could be read back afterwards. It can be interrupted and resumed — what is already done will not be done again.',
  /* Les formes RENDUES, pour le compteur. ⚠ L espace avant la virgule apres
     « catalogue » vient du <b> qui se ferme la : c est ce que la page DIT. */
  'Ces fiches portent encore leur image collée dans la fiche plutôt qu’une adresse. Elles s’affichent très bien — c’est pour ça que personne ne les voit passer : leur image voyage entière, à chaque chargement du catalogue , et le navigateur ne peut pas la garder en cache.':
    'These records still carry their image pasted into the record rather than an address. They display perfectly well — which is exactly why nobody notices them: their image travels whole, at every load of the catalogue , and the browser cannot keep it in cache.',
  'Le déplacement ne perd rien : une image n’est retirée de la fiche que si son dépôt a réussi et qu’elle a pu être relue ensuite. Il peut être interrompu et repris — ce qui est déjà fait ne sera pas refait.':
    'Moving them loses nothing: an image is removed from the record only if its upload succeeded and it could be read back afterwards. It can be interrupted and resumed — what is already done will not be done again.',

  /* ── LES CHIFFRES ───────────────────────────────────────────────────────── */
  'fiche(s) concernée(s)': 'record(s) concerned',
  'image(s) à déplacer': 'image(s) to move',
  'transportés à chaque visite': 'carried at every visit',
  ' fiche(s) traitée(s)': ' record(s) done',
  'fiche(s) traitée(s)': 'record(s) done',

  /* ── LE TABLEAU ─────────────────────────────────────────────────────────── */
  'Fiche': 'Record',
  'Images': 'Images',
  'Poids': 'Size',
  /* La ligne d en-tete telle qu elle se lit d un trait. */
  'Fiche Images Poids': 'Record Images Size',
  ' autre(s).': ' more.',
  'autre(s).': 'more.',

  /* ══ LES ECHECS ════════════════════════════════════════════════════════════
   * ⚠⚠ INTACTES, RIEN N A ETE PERDU, VOUS POUVEZ RELANCER — les trois choses
   * qu il faut savoir avant de refermer la fenetre. */
  ' image(s) n’ont pas pu être déplacées</b> — elles sont <b>restées intactes</b> dans leur fiche, rien n’a été perdu. Vous pouvez relancer.':
    ' image(s) could not be moved</b> — they stayed <b>intact</b> in their record, nothing was lost. You can start again.',
  /* La forme RENDUE, pour le compteur. */
  'image(s) n’ont pas pu être déplacées — elles sont restées intactes dans leur fiche, rien n’a été perdu. Vous pouvez relancer.':
    'image(s) could not be moved — they stayed intact in their record, nothing was lost. You can start again.',

  /* ── LES VERDICTS DE LA BOUCLE ──────────────────────────────────────────── */
  'Déplacement en cours… (': 'Moving… (',
  'Terminé : toutes les images sont dans le seau.':
    'Done: every image is in the bucket.',
  /* ⚠⚠ POURQUOI elle s arrete : un tour qui ne fait plus rien avancer. */
  'Arrêté : le dernier tour n’a rien fait avancer. Voyez les échecs ci-dessus.':
    'Stopped: the last round moved nothing forward. See the failures above.',
  'Arrêté par sécurité après 400 tours. Relancez pour continuer.':
    'Stopped as a safety after 400 rounds. Start again to continue.',
  // La refonte (2026-09-25).
  '… et ': '… and ',
};
