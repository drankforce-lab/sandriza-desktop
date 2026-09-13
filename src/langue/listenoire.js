'use strict';

/*
 * LISTE NOIRE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ UNE ENTREE ICI REFUSE UNE COMMANDE A LA CAISSE, ET EN RETIRER UNE REDONNE
 * LE DROIT DE COMMANDER. Les deux gestes touchent de vraies clientes, et la
 * phrase d ouverture est la seule qui dise lequel fait quoi. Elle nomme aussi
 * les trois choses comparees — le courriel, le code postal, l adresse de
 * livraison. L affaiblir fait ajouter une entree sans savoir ce qu on bloque.
 *
 * ⚠⚠ LA VALEUR EST UNE DONNEE : elle est comparee A LA CAISSE, caractere par
 * caractere, a ce que la cliente tape. Rien de ce qui est saisi ici ne passe par
 * ce dictionnaire. Seules les etiquettes et les exemples se lisent — et les
 * exemples d ADRESSE restent quebecois, parce que les commandes le sont : une
 * rue et une ville d ailleurs ne montreraient pas ce qu on attend.
 *
 * ⚠⚠ UNE LISTE VIDE EST UNE BONNE NOUVELLE, ET LA PHRASE LE DIT. Sans elle, un
 * ecran vide ressemble a un ecran casse, et l on cherche ce qui ne s affiche pas.
 *
 * ⚠ Mapbox et OpenStreetMap sont des noms propres : ils nomment QUI a repondu a
 * la recherche d adresse, et ne se traduisent pas.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Liste noire — Administration Sandriza': 'Blocklist — Sandriza Administration',
  'Liste noire': 'Blocklist',
  'Lecture seule : vous pouvez consulter la liste, pas la modifier.':
    'Read only: you can look at the list, not change it.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès à la liste noire.':
    'Your role does not give access to the blocklist.',
  'Saisie invalide.': 'Invalid entry.',
  'Cette valeur est déjà dans la liste.': 'This value is already in the list.',
  'Entrée introuvable.': 'Entry not found.',
  /* ⚠ L apostrophe DROITE : la source ecrit celle-la entre guillemets. */
  "La fenêtre principale n'a pas répondu à temps.":
    'The main window did not answer in time.',

  /* ══ CE QUE LA LISTE FAIT ══════════════════════════════════════════════════
   * ⚠⚠⚠ Voir l en-tete : ajouter refuse, retirer redonne le droit. */
  'Une commande dont le <b>courriel</b>, le <b>code postal</b> ou l’<b>adresse de livraison</b> figure ici est refusée à la caisse. Retirer une entrée redonne le droit de commander.':
    'An order whose <b>email</b>, <b>postal code</b> or <b>shipping address</b> appears here is refused at checkout. Removing an entry gives back the right to order.',
  'Une commande dont le courriel , le code postal ou l’ adresse de livraison figure ici est refusée à la caisse. Retirer une entrée redonne le droit de commander.':
    'An order whose email , postal code or shipping address appears here is refused at checkout. Removing an entry gives back the right to order.',

  /* ══ AJOUTER UNE ENTREE ════════════════════════════════════════════════════
   * ⚠⚠ Les etiquettes seulement : la valeur saisie est comparee a la caisse. */
  '＋ Ajouter une entrée': '＋ Add an entry',
  'Type': 'Type',
  'Courriel': 'Email',
  'Code postal': 'Postal code',
  'Adresse de livraison': 'Shipping address',
  'Valeur': 'Value',
  'Rue': 'Street',
  'Ville': 'City',
  'Note (facultatif)': 'Note (optional)',
  'Raison, numéro de commande…': 'Reason, order number…',
  /* ⚠ Les exemples d ADRESSE restent quebecois : les commandes le sont. */
  '1234 rue Principale': '1234 rue Principale',
  'Québec': 'Québec',
  'G1H 1T4': 'G1H 1T4',
  'client@exemple.com': 'customer@example.com',

  /* ══ LA RECHERCHE D ADRESSE ════════════════════════════════════════════════
   * ⚠ Mapbox et OpenStreetMap nomment QUI a repondu : noms propres. */
  'Aucun résultat — vérifiez l’adresse': 'No result — check the address',
  ' Mapbox': ' Mapbox',
  ' OpenStreetMap': ' OpenStreetMap',
  '🗺️ Mapbox': '🗺️ Mapbox',
  '🌍 OpenStreetMap': '🌍 OpenStreetMap',

  /* ══ LA LISTE ══════════════════════════════════════════════════════════════
   * ⚠⚠ Une liste vide est une BONNE nouvelle, et la phrase le dit. */
  'Aucune entrée.<br>C’est la bonne nouvelle — la liste ne sert qu’à écarter ce qui pose problème.':
    'No entry.<br>That is the good news — the list only exists to keep out what causes trouble.',
  'Aucune entrée. C’est la bonne nouvelle — la liste ne sert qu’à écarter ce qui pose problème.':
    'No entry. That is the good news — the list only exists to keep out what causes trouble.',
  'Note': 'Note',
  'Ajouté le': 'Added on',
  'Type Valeur Note Ajouté le': 'Type Value Note Added on',

  /* ══ RETIRER ═══════════════════════════════════════════════════════════════
   * ⚠⚠⚠ Retirer REDONNE le droit de commander : la phrase le dit avant. */
  '✓ Confirmer': '✓ Confirm',
  'Cliquez encore pour retirer — cette adresse pourra de nouveau commander.':
    'Click again to remove — this address will be able to order again.',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Ajout…': 'Adding…',
  'Retrait…': 'Removing…',
  'Entrée ajoutée.': 'Entry added.',
  'Entrée retirée.': 'Entry removed.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:'
};
