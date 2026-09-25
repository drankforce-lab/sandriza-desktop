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
};
