'use strict';

/*
 * FICHE CLIENT — les deux langues
 * =============================================================================
 * ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT. Le NOM du client, son adresse, son
 * courriel, ses commandes et ses montants sont de la DONNEE : ils restent tels
 * qu ils ont ete saisis.
 *
 * ⚠⚠ LA LANGUE DES COURRIELS DU CLIENT N EST PAS LA LANGUE DE L INTERFACE.
 * « 🇫🇷 Francais (par defaut) » et « 🇬🇧 English » sont les CHOIX offerts pour ce
 * client-la : c est une donnee de sa fiche, pas un reglage du poste. On traduit
 * l etiquette du champ, jamais les choix eux-memes — et leurs VALEURS (`fr`,
 * `en`) partent dans la base, ou `banc-langue-donnees` veille.
 *
 * ⚠ « conservation fiscale de 6 ans » : une obligation legale d ici. On dit la
 * regle, on ne la traduit pas en approximation.
 */

module.exports = {
  'Fiche client — Administration Sandriza': 'Customer record — Sandriza Administration',
  'Fiche client': 'Customer record',
  'Fiche indisponible': 'Record unavailable',
  'Votre rôle ne donne pas accès aux clients.': 'Your role does not give access to customers.',
  'Ce client n’existe plus.': 'This customer no longer exists.',
  'Lecture seule': 'Read only',
  'Cette fiche est ouverte ailleurs — modifications bloquées.':
    'This record is open elsewhere — editing is blocked.',

  /* ── LES REFUS DE SAISIE ────────────────────────────────────────────────── */
  'Prénom et nom requis.': 'First and last name are required.',
  'Adresse courriel invalide.': 'Invalid email address.',
  'Cette adresse courriel est déjà utilisée par un autre compte.':
    'This email address is already used by another account.',
  'Numéro de téléphone invalide.': 'Invalid phone number.',
  'Le nouveau mot de passe doit contenir au moins 6 caractères.':
    'The new password must be at least 6 characters long.',
  'Mot de passe NON changé — réessayez.': 'Password NOT changed — try again.',

  /* ── LA FICHE ───────────────────────────────────────────────────────────── */
  'Total dépensé': 'Total spent',
  'Inscrit le': 'Registered on',
  'Supprimé le': 'Deleted on',
  'Langue des courriels': 'Email language',
  '🇫🇷 Français (par défaut)': '🇫🇷 French (default)',
  '🇬🇧 English': '🇬🇧 English',
  'Adresse courriel': 'Email address',
  'Adresse de livraison': 'Shipping address',
  'Code postal': 'Postal code',
  'Mot de passe': 'Password',
  'Nouveau (laisser vide = inchangé)': 'New (leave blank = unchanged)',
  '🎲 Générer': '🎲 Generate',
  'Aviser le client par courriel de ce changement': 'Notify the customer of this change by email',
  'Commandes récentes —': 'Recent orders —',
  '— voir la fenêtre Commandes': '— see the Orders window',
  'Aucune commande.': 'No order.',
  '← Fiche': '← Record',

  /* ── LES BOUTONS ────────────────────────────────────────────────────────── */
  '✎ Modifier': '✎ Edit',
  '⏸ Désactiver': '⏸ Deactivate',
  '▶ Activer': '▶ Activate',
  '🗑 Supprimer': '🗑 Delete',
  '↩ Restaurer': '↩ Restore',
  '📄 État de compte': '📄 Account statement',
  '🗑 Supprimer définitivement': '🗑 Delete permanently',

  /* ── CE QUE LA FENETRE REPOND ───────────────────────────────────────────── */
  'Compte activé.': 'Account activated.',
  'Compte désactivé.': 'Account deactivated.',
  'Client mis à la corbeille.': 'Customer moved to the bin.',
  'Client restauré.': 'Customer restored.',
  'Fiche client mise à jour.': 'Customer record updated.',
  'Fiche et mot de passe mis à jour.': 'Record and password updated.',
  'Client avisé par courriel.': 'Customer notified by email.',
  'Impression de l’état de compte…': 'Printing the account statement…',
  'État de compte envoyé à l’impression.': 'Account statement sent to the printer.',

  /* ── LA SUPPRESSION, EN DEUX TEMPS ──────────────────────────────────────── */
  /* ⚠ Le premier geste met a la corbeille et se DIT reversible ; le second est
     irreversible et le dit en capitales. Les deux textes doivent garder cette
     difference de ton : c est elle qui protege le dossier. */
  '🗑 Supprimer le client ?': '🗑 Delete this customer?',
  '🛡 Le compte part dans la corbeille et reste restaurable à tout moment.':
    '🛡 The account goes to the bin and stays restorable at any time.',
  'L’historique de': 'The history of',
  'commande(s) est conservé intégralement.': 'order(s) is kept in full.',
  '⚠ Supprimer définitivement ?': '⚠ Delete permanently?',
  ') de la base ?': ') from the database?',
  'Cette action est IRRÉVERSIBLE : le dossier disparaît du nuage, il ne sera plus restaurable.':
    'This action is IRREVERSIBLE: the record disappears from the cloud and can no longer be restored.',
  '✅ Ce compte n’a aucune commande — rien de comptable n’est perdu.':
    '✅ This account has no order — nothing accounting-related is lost.',
  'Le compte doit d’abord être mis à la corbeille.': 'The account must be moved to the bin first.',
  'Suppression refusée par le serveur — le compte est intact.':
    'Deletion refused by the server — the account is intact.',
  'Suppression définitive impossible :': 'Permanent deletion is not possible:',
  'commande(s) — conservation fiscale de 6 ans. Le compte reste en corbeille.':
    'order(s) — 6-year tax retention. The account stays in the bin.',
  'commande(s) — conservation fiscale de 6 ans.': 'order(s) — 6-year tax retention.',
  'Compte supprimé définitivement.': 'Account permanently deleted.',
  'Compte supprimé': 'Account deleted',
  'Le dossier a été effacé de la base.': 'The record has been erased from the database.',

  /* ⚠ Se glisse dans « {…} a ete laissee en cours » (boite de reprise). */
  'Une modification de cette fiche': 'An edit to this record',

  /* ── LES FRAGMENTS TELS QU ILS EXISTENT DANS LE GABARIT ────────────────
     ⚠⚠ UN TEXTE PEUT ÊTRE COUPÉ PAR DU BALISAGE. « 🗑 Supprimer définitivement »
     se lit d un bloc à l écran, mais la source écrit l émoji dans son propre
     `<span>` : la chaîne à traduire est donc « Supprimer définitivement », sans
     l émoji. Traduire la forme RENDUE ne sert à rien — elle n existe nulle part
     dans le fichier. On garde les DEUX : la rendue pour que le compteur sache,
     le fragment pour que l enveloppe se pose. */
  'Supprimer définitivement': 'Delete permanently',
  'Supprimer définitivement ?': 'Delete permanently?',
  'Supprimer le client ?': 'Delete this customer?',
  'Commandes récentes': 'Recent orders',
  'Restaurer': 'Restore',
  'État de compte': 'Account statement',
  'Modifier': 'Edit',
  'Désactiver': 'Deactivate',
  'Activer': 'Activate',
  'Supprimer': 'Delete',
  'Générer': 'Generate',
  'Français (par défaut)': 'French (default)',
  'Le compte part dans la corbeille et reste restaurable à tout moment.':
    'The account goes to the bin and stays restorable at any time.',
  'Ce compte n’a aucune commande — rien de comptable n’est perdu.':
    'This account has no order — nothing accounting-related is lost.',
};
