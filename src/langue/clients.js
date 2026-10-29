'use strict';

/*
 * CLIENTS — les deux langues
 * =============================================================================
 * ⚠⚠ LE NOM, LE COURRIEL, LE NOMBRE DE COMMANDES ET L ACHAT TOTAL SONT DES
 * DONNEES : ils viennent du coeur et designent de vraies personnes. Rien de cela
 * ne passe par ce dictionnaire — seules les etiquettes de colonnes se lisent.
 *
 * ⚠ « Achat total » est le CUMUL de ce que la cliente a depense, pas le montant
 * d une commande. C est ce chiffre qui dit qui compte pour la boutique.
 *
 * ⚠ La fenetre n ECRIT rien : cliquer une ligne ouvre la fiche dans sa propre
 * fenetre, et le verdict le dit.
 */

module.exports = {
  /* ── L EXPORT DE LA LISTE (2026-09-19) ─────────────────────────────────
     ⚠ DEUX LIBELLES, PARCE QUE L ECRAN EST PAGINE. La fenetre ne detient que
     SA page : exporter en silence << tous les clients >> serait un mensonge,
     et exporter la page sans le dire en serait un autre. Le message nomme donc
     ce qui est parti, et le nom du fichier porte le numero de page. */
  'La liste des clients': 'The client list',
  /* ⚠ LES DEUX ALTERNATIVES EN ENTIER — voir `tools/banc-pluriel-colle.js`.
     ⚠ ET AU MASCULIN : le client est toujours au masculin dans ce dépôt. */
  'client': 'customer',
  'clients': 'customers',
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Clients — Administration Sandriza': 'Customers — Sandriza Administration',
  'Clients': 'Customers',
  'Clients indisponibles': 'Customers unavailable',
  'Votre rôle ne donne pas accès aux clients.':
    'Your role does not give access to the customers.',

  /* ══ LA LISTE ══════════════════════════════════════════════════════════════
   * ⚠ Le nom et le courriel designent de vraies personnes. */
  'Aucun client ne correspond.': 'No customer matches.',
  'Actifs': 'Active',
  'Inactifs': 'Inactive',
  /* ⚠ Un client SUPPRIME reste dans la liste, sous son propre onglet : la
     pastille dit son etat, elle n efface rien. */
  'Supprimés': 'Deleted',
  'Supprimé': 'Deleted',
  'Nom ou courriel': 'Name or email',
  'Nom ou courriel…': 'Name or email…',
  'Ouvrir la fiche client': 'Open the customer record',
  'Nom': 'Name',
  'Courriel': 'Email',
  'Commandes': 'Orders',
  /* ⚠ Le CUMUL de ce qui a ete depense, pas une commande. */
  'Achat total': 'Total spend',
  'Nom Courriel': 'Name Email',
  'Commandes Achat total': 'Orders Total spend',

  /* ── LE VERDICT ─────────────────────────────────────────────────────────── */
  'Fiche client ouverte dans sa fenêtre.':
    'Customer record opened in its own window.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Statut': 'Status',
  'Actif': 'Active',
  'Inactif': 'Inactive',
  'Dormant': 'Dormant',
  'Page': 'Page',

  /* ══ LE SEGMENT (#150, 2026-09-24) ═════════════════════════════════════════
     ⚠⚠ LES MOTS SONT ICI, PAS AU SITE, ET CE N EST PAS UN DOUBLON DE LA REGLE.
     Le site envoie la CLE (`vip`, `regulier`…) et un libelle FRANCAIS tire de
     SEG_META — cette table sert l ecran web, qui n a qu une langue. L afficher
     tel quel mettrait << Régulier >> sur la page anglaise. La fenetre traduit
     donc depuis la cle ; la REGLE, elle, reste ecrite une seule fois cote site
     (Analytics._segmentCoeur).
     ⚠ << Inactif >> est deja declare juste au-dessus pour l ONGLET, et la meme
     cle sert au segment : c est le meme mot, et deux entrees finiraient par
     diverger.
     ⚠ << VIP >> s ecrit pareil dans les deux langues — l entree existe quand
     meme, parce qu une DECISION doit exister pour chaque texte lu, sans quoi on
     ne sait pas si le mot a ete regarde ou oublie. */
  'Segment': 'Segment',
  'Prospect': 'Prospect',
  'Nouveau': 'New',
  'Régulier': 'Regular',
  'VIP': 'VIP',
  /* ⚠ Le banc de langue lit les en-tetes de colonnes ASSEMBLES : deux <th>
     voisins lui arrivent d un seul tenant. Meme forme que << Pays État >> dans
     conformite. */
  'Segment Statut': 'Segment Status',
  /* La refonte de la liste, comme l'Inventaire (2026-09-25). */
  'Client': 'Customer',
  'Cliquer pour afficher': 'Click to show',
  'comptes en service': 'accounts in use',
  'sans activité récente': 'no recent activity',
  'dans la corbeille': 'in the recycle bin',

  /* ══ L AFFICHAGE COMPACT (2026-10-14, sa demande : « met un mode compact ici ») ══
     Les memes mots que Commandes et Produits en vente : une bascule, deux icones. */
  'Affichage de la liste': 'List display',
  'Affichage détaillé': 'Detailed view',
  'Affichage compact : une ligne par client, plus de clients par page': 'Compact view: one line per customer, more customers per page',
  /* ══ LE CLIC DROIT SUR UN CLIENT (2026-10-14) ══
     Les gestes de la FICHE, rien de plus ; « Modifier » et les deux suppressions
     ouvrent la fiche, confirmation armee. « Ouverture… », « En traitement par »
     et « un collègue » viennent du socle. */
  'Ouvrir la fiche': 'Open the record',
  'Modifier la fiche…': 'Edit the record…',
  'État de compte': 'Account statement',
  'Impression de l’état de compte…': 'Printing the account statement…',
  'État de compte envoyé à l’impression.': 'Account statement sent to the printer.',
  'Copier le courriel': 'Copy the email',
  'Courriel copié : ': 'Email copied: ',
  'Restaurer le client': 'Restore the customer',
  'Client restauré.': 'Customer restored.',
  'Désactiver le compte': 'Deactivate the account',
  'Activer le compte': 'Activate the account',
  'Compte activé.': 'Account activated.',
  'Compte désactivé.': 'Account deactivated.',
  'Supprimer le client…': 'Delete the customer…',
  'Supprimer définitivement…': 'Delete permanently…',
  // Gestes groupés (2026-10-29)
  "{0} client sélectionné": "{0} customer selected",
  "{0} clients sélectionnés": "{0} customers selected",
  "Imprimer les états de compte": "Print account statements",
  "Copier les courriels": "Copy emails",
  "Exporter (CSV)": "Export (CSV)",
  "{0} client exporté": "{0} customer exported",
  "{0} clients exportés": "{0} customers exported",
  "{0} courriel copié.": "{0} email copied.",
  "{0} courriels copiés.": "{0} emails copied.",
  "La copie a échoué.": "Copy failed.",
  "États de compte": "Account statements",
  "{0} état de compte ouvert pour l’impression.": "{0} account statement opened for printing.",
  "{0} états de compte ouverts pour l’impression.": "{0} account statements opened for printing.",
  "{0} états de compte s’ouvriront, chacun dans sa fenêtre, prêts à imprimer.": "{0} account statements will open, each in its own window, ready to print.",
  "et {0} autres": "and {0} more",
  "Ouvrir {0} états de compte": "Open {0} account statements",
  "{0} compte client sera activé : le client pourra se connecter et commander.": "{0} customer account will be activated: the customer will be able to sign in and order.",
  "{0} comptes clients seront activés : ces clients pourront se connecter et commander.": "{0} customer accounts will be activated: these customers will be able to sign in and order.",
  "{0} compte client sera désactivé : le client ne pourra plus se connecter. Ses commandes et factures sont conservées.": "{0} customer account will be deactivated: the customer will no longer be able to sign in. Their orders and invoices are kept.",
  "{0} comptes clients seront désactivés : ces clients ne pourront plus se connecter. Leurs commandes et factures sont conservées.": "{0} customer accounts will be deactivated: these customers will no longer be able to sign in. Their orders and invoices are kept.",
  "{0} autre client sélectionné ne s’y prête pas (déjà dans cet état, supprimé ou fiche tenue par un collègue) : il ne change pas.": "{0} other selected customer does not apply (already in that state, deleted or record held by a colleague): it stays unchanged.",
  "{0} autres clients sélectionnés ne s’y prêtent pas (déjà dans cet état, supprimés ou fiches tenues par un collègue) : ils ne changent pas.": "{0} other selected customers do not apply (already in that state, deleted or records held by a colleague): they stay unchanged.",
  "Activer {0} compte": "Activate {0} account",
  "Activer {0} comptes": "Activate {0} accounts",
  "Désactiver {0} compte": "Deactivate {0} account",
  "Désactiver {0} comptes": "Deactivate {0} accounts",
  "Activation des comptes": "Activating accounts",
  "Désactivation des comptes": "Deactivating accounts",
  "fiche tenue par un collègue": "record held by a colleague",
  "{0} compte activé.": "{0} account activated.",
  "{0} comptes activés.": "{0} accounts activated.",
  "{0} compte désactivé.": "{0} account deactivated.",
  "{0} comptes désactivés.": "{0} accounts deactivated.",
  // Gestes groupés (2026-10-29)
  "Dix clients au plus à la fois : chaque état de compte s’ouvre dans sa fenêtre.": "Ten customers at most at a time: each statement opens in its own window.",
};
