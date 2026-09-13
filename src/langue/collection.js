'use strict';

/*
 * COLLECTION — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LE NOM, LA DESCRIPTION, LA SAISON ET L ANNEE SONT DES DONNEES : ils sont
 * enregistres, lus par la boutique, et s affichent aux clientes. Rien de tout
 * cela ne passe par ce dictionnaire — on traduit l etiquette « Nom », jamais le
 * nom tape. La liste des saisons vient du coeur (CTX.saisons).
 *
 * ⚠⚠ CE QUE L IA FAIT, ET CE QU ELLE NE FAIT PAS : elle ANALYSE L IMAGE DE
 * COUVERTURE pour proposer une description — donc sans image, le bouton ne peut
 * rien, et la phrase le dit en nommant l etape ou aller la mettre. Et ce qu elle
 * ecrit est un BROUILLON : « relisez-la avant d’enregistrer ». Perdre cette
 * phrase fait publier du texte que personne n a lu.
 *
 * ⚠⚠ L IMAGE N EST DEPOSEE QU A L ENREGISTREMENT, pas au moment ou on la
 * choisit — comme partout ailleurs dans l administration. La phrase le dit ; sans
 * elle, on ferme la fenetre en croyant l image deja en place.
 *
 * ⚠ « Enregistrement bloqué : cette fiche est ouverte ailleurs. » protege contre
 * deux postes qui ecrivent la meme collection. Ce n est pas un refus de droit.
 *
 * ⚠ Les unites (Mo) ne se traduisent pas : elles s ecrivent pareil.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Collection — Administration Sandriza': 'Collection — Sandriza Administration',
  'Collection': 'Collection',
  'Modifier la collection': 'Edit the collection',
  'Nouvelle collection': 'New collection',
  'Formulaire indisponible': 'Form unavailable',
  'Fiche indisponible': 'Record unavailable',

  /* ══ LA COLLECTION ═════════════════════════════════════════════════════════
   * ⚠ Les etiquettes seulement : ce qui est tape est une DONNEE. */
  'La collection': 'The collection',
  'Saison': 'Season',
  'Année': 'Year',
  'Statut': 'Status',
  'Active': 'Active',
  'Inactive': 'Inactive',
  'Active Inactive': 'Active Inactive',

  /* ══ LA REDACTION PAR L IA ═════════════════════════════════════════════════
   * ⚠⚠ Elle regarde L IMAGE ; sans image, elle ne peut rien. Et ce qu elle ecrit
   * est un brouillon a relire. */
  ' Rédiger avec l’IA': ' Write with the AI',
  '✨ Rédiger avec l’IA': '✨ Write with the AI',
  'Analyse l’image de couverture et propose une description.':
    'Looks at the cover image and suggests a description.',
  'Ajoutez d’abord une image à l’étape « Image » : le service la regarde.':
    'Add an image at the « Image » step first: the service looks at it.',
  'Rédaction en cours…': 'Writing…',
  'Description rédigée — relisez-la avant d’enregistrer.':
    'Description written — read it over before saving.',

  /* ══ L IMAGE DE COUVERTURE ═════════════════════════════════════════════════
   * ⚠⚠ DEPOSEE A L ENREGISTREMENT, pas au choix du fichier. */
  'Image de couverture': 'Cover image',
  'aucune image': 'no image',
  'Retirer l’image': 'Remove the image',
  'L’image est déposée dans le stockage au moment de l’enregistrement, comme partout ailleurs dans l’administration. Maximum 8 Mo.':
    'The image is uploaded to storage when you save, as everywhere else in the administration. Maximum 8 Mo.',
  'L’image est déposée dans le stockage au moment de l’enregistrement,':
    'The image is uploaded to storage when you save,',
  'comme partout ailleurs dans l’administration. Maximum 8 Mo.':
    'as everywhere else in the administration. Maximum 8 Mo.',
  /* ⚠ Le poids mesure s intercale : trois morceaux, une seule phrase. */
  'Image trop lourde (': 'Image too heavy (',
  ' Mo). Maximum ': ' Mo). Maximum ',
  'Mo). Maximum': 'Mo). Maximum',
  'Lecture du fichier impossible.': 'The file could not be read.',

  /* ══ LES PRODUITS ══════════════════════════════════════════════════════════ */
  'Produits de la collection': 'Products of the collection',
  'Filtrer par nom': 'Filter by name',
  'Filtrer par nom…': 'Filter by name…',

  /* ── LE BROUILLON ───────────────────────────────────────────────────────── */
  'Une modification de cette collection': 'A change to this collection',
  'Une collection': 'A collection',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Dépôt de l’image et enregistrement…': 'Uploading the image and saving…',
  'Enregistré.': 'Saved.',
  /* ⚠ Ce n est pas un refus de droit : la fiche est ouverte sur un autre poste. */
  'Enregistrement bloqué : cette fiche est ouverte ailleurs.':
    'Saving blocked: this record is open somewhere else.'
};
