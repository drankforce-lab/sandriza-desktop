'use strict';

/*
 * TRANSFERTS DE STOCK — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE QUE CET ECRAN FAIT SE VOIT SUR LA BOUTIQUE, TOUT DE SUITE. Les unites
 * en transit sont RETIREES du stock vendable : l article s affiche EPUISE le
 * temps du trajet, et les clientes inscrites a l alerte « de retour en stock »
 * sont prevenues a la reception. L avis qui le dit se traduit en entier — sans
 * lui, on croit a un defaut d affichage.
 *
 * ⚠⚠ L ECART N EST PAS UN DETAIL COMPTABLE : ce qui manque a la reception est
 * INSCRIT AU JOURNAL avec son motif, et le motif devient OBLIGATOIRE des qu il
 * y a un manque. Les deux phrases qui le disent gardent leur consequence.
 *
 * ⚠⚠ CE QUI VIENT DU COEUR NE PASSE PAS PAR ICI : les motifs d ecart
 * (`D.motifs`, valeur + libelle), les noms d entrepots, de lieux et de sections,
 * les noms d articles et leurs SKU. Ce sont des donnees ; les traduire ici
 * ferait mentir l historique, qui garde le libelle du jour ou le transfert est
 * parti.
 *
 * ⚠ LES ETATS `recu` et `annule` sont des VALEURS (elles nomment aussi la classe
 * CSS de la pastille) ; seuls les mots affiches « reçu » et « annulé », ecrits
 * avec leurs accents, se traduisent.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Transferts de stock — Administration Sandriza':
    'Stock transfers — Sandriza Administration',
  'Transferts de stock': 'Stock transfers',
  'En transit': 'In transit',
  'Historique': 'History',
  'Nouveau transfert': 'New transfer',
  ' en transit': ' in transit',
  'en transit': 'in transit',
  ' unités d’écart cumulé': ' units of cumulated discrepancy',
  ' unité d’écart cumulé': ' unit of cumulated discrepancy',
  /* Les formes RENDUES : le message est coupe du nombre qui le precede, et
     l espace de tete part avec. */
  'unités d’écart cumulé': 'units of cumulated discrepancy',
  'unité d’écart cumulé': 'unit of cumulated discrepancy',
  'unités parties.': 'units that left.',
  'unité partie.': 'unit that left.',
  'unités : dites pourquoi avant d’enregistrer.': 'units: say why before saving.',
  'unité : dites pourquoi avant d’enregistrer.': 'unit: say why before saving.',
  'unités : choisissez le motif de l’écart.':
    'units: choose the reason for the discrepancy.',
  'unité : choisissez le motif de l’écart.':
    'unit: choose the reason for the discrepancy.',
  'unités, inscrit au journal.': 'units, written to the log.',
  'unité, inscrit au journal.': 'unit, written to the log.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès à l’inventaire.':
    'Your role does not give access to the inventory.',
  'Ce transfert n’existe plus.': 'This transfer no longer exists.',
  'La fiche produit n’existe plus — le stock ne peut pas être remis.':
    'The product page no longer exists — the stock cannot be put back.',
  'Ce transfert est déjà clos.': 'This transfer is already closed.',
  'Cette variante n’a plus de stock à envoyer.':
    'This variant has no stock left to send.',
  'Cette variante n’a pas d’emplacement : on ne saurait pas d’où elle part.':
    'This variant has no location: we would not know where it leaves from.',
  'Choisissez un entrepôt de destination.': 'Choose a destination warehouse.',
  'L’origine et la destination sont le même entrepôt.':
    'The origin and the destination are the same warehouse.',
  'Un transfert est déjà en cours pour cette variante.':
    'A transfer is already under way for this variant.',
  'Saisissez une quantité reçue valide.': 'Enter a valid received quantity.',
  'La fiche produit est ouverte par un collègue — réessayez dans un moment.':
    'The product page is open by a colleague — try again in a moment.',
  'La fiche produit a changé (tailles ou couleurs). Rouvrez cet écran.':
    'The product page has changed (sizes or colours). Reopen this screen.',
  'Aucune réponse de la fenêtre principale.': 'No answer from the main window.',
  /* ⚠ Le singulier et le pluriel, chacun entier. */
  'Vous ne pouvez pas recevoir plus que les ': 'You cannot receive more than the ',
  'Vous ne pouvez pas recevoir plus que les': 'You cannot receive more than the',
  ' unités parties.': ' units that left.',
  ' unité partie.': ' unit that left.',
  'Il manque ': 'Missing ',
  'Il manque': 'Missing',
  ' unités : dites pourquoi avant d’enregistrer.':
    ' units: say why before saving.',
  ' unité : dites pourquoi avant d’enregistrer.':
    ' unit: say why before saving.',

  /* ══ L ONGLET « EN TRANSIT » ═══════════════════════════════════════════════ */
  'Aucun transfert en cours.': 'No transfer under way.',
  /* ⚠ Le <strong> coupe la phrase : la cle porte la balise. */
  'Onglet <strong>Nouveau transfert</strong> pour en lancer un.':
    'The <strong>New transfer</strong> tab starts one.',
  'Onglet Nouveau transfert pour en lancer un.': 'The New transfer tab starts one.',
  /* ⚠⚠⚠ L AVIS QUI EXPLIQUE POURQUOI LA BOUTIQUE DIT « EPUISE ». */
  'Les unités en transit sont <strong>retirées du stock vendable</strong> : ':
    'Units in transit are <strong>taken out of the sellable stock</strong>: ',
  'Les unités en transit sont retirées du stock vendable :':
    'Units in transit are taken out of the sellable stock:',
  'l’article s’affiche épuisé sur la boutique le temps du trajet, et les clients inscrits à l’alerte ':
    'the item shows as sold out on the storefront for the length of the trip, and the customers signed up for the ',
  'l’article s’affiche épuisé sur la boutique le temps du trajet, et les clients inscrits à l’alerte':
    'the item shows as sold out on the storefront for the length of the trip, and the customers signed up for the',
  '« de retour en stock » sont prévenus à la réception.':
    '« back in stock » alert are told on reception.',
  '✓ Recevoir': '✓ Receive',
  'Parti le ': 'Left on ',
  'Parti le': 'Left on',
  ' par ': ' by ',

  /* ══ RECEVOIR — L ECART ET SON MOTIF ═══════════════════════════════════════ */
  'Quantité réellement reçue': 'Quantity actually received',
  'sur ': 'out of ',
  ' parties': ' that left',
  ' partie': ' that left',
  'Motif de l’écart': 'Reason for the discrepancy',
  '— choisir —': '— choose —',
  'Note (facultative)': 'Note (optional)',
  /* ⚠⚠ « il ne disparaît pas de l inventaire tout seul » EST la phrase : sans
     elle, on croit qu un manque avoue se range de lui-meme. */
  ' unité(s). ': ' unit(s). ',
  '0 unité(s).': '0 unit(s).',
  'Ce manque sera <strong>inscrit au journal</strong> avec son motif — il ne disparaît pas de l’inventaire tout seul.':
    'This shortfall will be <strong>written to the log</strong> with its reason — it does not leave the inventory on its own.',
  'Ce manque sera inscrit au journal avec son motif — il ne disparaît pas de l’inventaire tout seul.':
    'This shortfall will be written to the log with its reason — it does not leave the inventory on its own.',
  'Enregistrer la réception': 'Save the reception',

  /* ══ L ONGLET « HISTORIQUE » ═══════════════════════════════════════════════ */
  'Aucun transfert terminé.': 'No finished transfer.',
  'Article': 'Item',
  'Trajet': 'Route',
  'État': 'Status',
  'Parti': 'Left',
  'Reçu': 'Received',
  'Écart': 'Discrepancy',
  'Motif': 'Reason',
  'Le': 'On',
  'Article Trajet État': 'Item Route Status',
  'Parti Reçu Écart': 'Left Received Discrepancy',
  'Motif Le': 'Reason On',
  /* ⚠ Les mots AFFICHES des deux etats — leurs VALEURS (`recu`, `annule`), qui
     nomment aussi la classe de la pastille, restent intactes. */
  'reçu': 'received',
  'annulé': 'cancelled',

  /* ══ L ONGLET « NOUVEAU TRANSFERT » ════════════════════════════════════════ */
  'Aucun entrepôt n’est configuré.': 'No warehouse is configured.',
  'Créez-en au moins deux dans <strong>Inventaire → Emplacements</strong>.':
    'Create at least two in <strong>Inventory → Locations</strong>.',
  'Créez-en au moins deux dans Inventaire → Emplacements .':
    'Create at least two in Inventory → Locations .',
  'Un seul entrepôt est configuré.': 'Only one warehouse is configured.',
  'Un transfert va d’un lieu à un autre : il en faut au moins deux.':
    'A transfer goes from one place to another: at least two are needed.',
  'Choisir la variante à envoyer': 'Choose the variant to send',
  'Tous les lieux': 'All the places',
  '— sans lieu —': '— no place —',
  'Section': 'Section',
  'Section…': 'Section…',
  'Nom, SKU ou taille-couleur': 'Name, SKU or size-colour',
  'Nom, SKU ou taille-couleur…': 'Name, SKU or size-colour…',
  'Chercher': 'Search',
  'Le transfert emporte <strong>toute</strong> la quantité de la variante.':
    'The transfer takes the <strong>whole</strong> quantity of the variant.',
  'Le transfert emporte toute la quantité de la variante.':
    'The transfer takes the whole quantity of the variant.',
  'Lancez une recherche pour voir ce qui peut partir.':
    'Run a search to see what can leave.',
  'Aucune variante avec du stock <em>et</em> un emplacement connu.':
    'No variant with stock <em>and</em> a known location.',
  'Aucune variante avec du stock et un emplacement connu.':
    'No variant with stock and a known location.',
  'Qté': 'Qty',
  'Depuis': 'From',
  'Vers': 'To',
  'Article Qté Depuis Vers': 'Item Qty From To',
  'Destination du transfert depuis ': 'Destination of the transfer from ',
  'Destination du transfert depuis': 'Destination of the transfer from',
  '— destination —': '— destination —',
  'Envoyer': 'Send',
  'Recherche…': 'Searching…',
  ' variantes peuvent partir.': ' variants can leave.',
  ' variante peut partir.': ' variant can leave.',
  'variantes peuvent partir.': 'variants can leave.',
  'variante peut partir.': 'variant can leave.',
  'peut partir.': 'can leave.',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Choisissez d’abord un entrepôt de destination.':
    'Choose a destination warehouse first.',
  'Envoi en cours…': 'Sending…',
  'Transfert lancé — les unités sont en transit.':
    'Transfer started — the units are in transit.',
  ' unités : choisissez le motif de l’écart.':
    ' units: choose the reason for the discrepancy.',
  ' unité : choisissez le motif de l’écart.':
    ' unit: choose the reason for the discrepancy.',
  ': choisissez le motif de l’écart.': ': choose the reason for the discrepancy.',
  'Réception enregistrée — écart de ': 'Reception saved — discrepancy of ',
  'Réception enregistrée — écart de': 'Reception saved — discrepancy of',
  ' unités, inscrit au journal.': ' units, written to the log.',
  ' unité, inscrit au journal.': ' unit, written to the log.',
  ', inscrit au journal.': ', written to the log.',
  'Réception enregistrée — tout est arrivé.': 'Reception saved — everything arrived.',
  'Transfert annulé — le stock est rendu à l’entrepôt d’origine.':
    'Transfer cancelled — the stock goes back to the origin warehouse.',

  /* ══ LE PIED DE L HISTORIQUE ET L EXPORT (2026-09-24) ══════════════════════
     ⚠ LES DEUX ALTERNATIVES EN ENTIER, avec leur participe accorde : le pluriel
     ne se fabrique pas en ajoutant une lettre — ici il en faut DEUX, une a
     chaque mot, et l anglais n en change aucun. */
  'transfert terminé': 'completed transfer',
  'transferts terminés': 'completed transfers',
  /* ⚠ COLONNES DU FICHIER SEULEMENT. A l ecran, la variante et le SKU sont
     empiles dans la cellule de l article ; dans un tableur on trie par SKU. */
  'Variante': 'Variant',
  'SKU': 'SKU',
  'Note d’écart': 'Discrepancy note',
  'Reçu par': 'Received by',
  'L’historique des transferts': 'The transfer history'
};
