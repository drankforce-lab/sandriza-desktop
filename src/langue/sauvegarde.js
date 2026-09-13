'use strict';

/*
 * SAUVEGARDE ET RESTAURATION — les deux langues
 * =============================================================================
 * ⚠⚠⚠ L ECRAN LE PLUS DESTRUCTEUR DU PROJET. Restaurer REECRIT la base ;
 * supprimer et purger detruisent definitivement dans Cloudflare R2. Trois
 * phrases ne sont pas des libelles mais des GARDE-FOUS :
 *   · « Cette operation REECRIT les donnees actuelles de Turso » ;
 *   · « Elle sera IRRECUPERABLE » ;
 *   · « Irreversible » (la purge).
 * Et deux phrases sont des PROMESSES qu il ne faut pas affaiblir :
 *   · « Rien n a ete touche — aucune donnee modifiee, aucune session fermee »,
 *     apres un refus d integrite ;
 *   · « Retour en arriere possible » — le filet pris juste avant d ecraser.
 *
 * ╔══ LES DEUX MOTS DE CONFIRMATION SONT LUS **ET** COMPARES ═══════════════╗
 * ║ ⚠⚠⚠ RESTAURER et DETRUIRE sont les SEULS textes de l application qu on   ║
 * ║ demande de TAPER et qu on compare ensuite a une chaine. Traduire l invite ║
 * ║ sans la comparaison rendrait la restauration et la suppression IMPOSSIBLES ║
 * ║ en anglais, sans un mot pour l expliquer. La fenetre les nomme UNE fois    ║
 * ║ (MOT_RESTAURER, MOT_DETRUIRE) et l invite, l exemple et la comparaison     ║
 * ║ lisent la meme variable — voir le bloc en tete de son script.             ║
 * ║ ⚠ « DETRUIRE » sans accent existe a dessein : refuser la saisie parce qu   ║
 * ║ il manque un accent serait un piege. En anglais les deux rendent DESTROY. ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT. La NOTE que l on tape sur une sauvegarde
 * est de la DONNEE : elle se relit des mois plus tard, par quelqu un d autre,
 * pour choisir laquelle restaurer. Seul son EXEMPLE suit la langue du poste.
 * Les identifiants de sauvegarde, les versions, les tailles et les dates
 * viennent du serveur.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  /* ⚠ La source ecrit l esperluette ECHAPPEE (`&amp;`) : c est elle que le
     poseur cherche, et la forme rendue (« Sauvegarde & Restauration ») que le
     compteur interroge. Les deux sont ecrites. */
  'Sauvegarde &amp; Restauration — Administration Sandriza':
    'Backup &amp; Restore — Sandriza Administration',
  'Sauvegarde &amp; Restauration': 'Backup &amp; Restore',
  'Sauvegarde Restauration — Administration Sandriza':
    'Backup Restore — Sandriza Administration',
  'Sauvegarde Restauration': 'Backup Restore',
  'Sauvegarde': 'Backup',
  'Restauration': 'Restore',
  'Lecture seule : créer, restaurer, supprimer et purger sont réservés au super-administrateur.':
    'Read only: creating, restoring, deleting and purging are reserved for the super administrator.',
  'Votre rôle ne donne pas accès aux sauvegardes.':
    'Your role does not give access to the backups.',
  'La fenêtre principale n\'a pas répondu à temps.': 'The main window did not answer in time.',

  /* ── LA BARRE D OUTILS ──────────────────────────────────────────────────── */
  '＋ Créer une sauvegarde': '＋ Create a backup',
  '↻ Actualiser': '↻ Refresh',
  'Purger (&gt; ': 'Purge (&gt; ',
  ' mois)': ' months)',
  '🗑 Purger (': '🗑 Purge (',

  /* ── LES TROIS COMPTEURS ────────────────────────────────────────────────── */
  'Sauvegardes': 'Backups',
  'rétention ': 'retention ',
  ' mois': ' months',
  'La plus récente': 'The most recent',
  'aucune': 'none',
  'le registre est vide': 'the register is empty',
  'Espace occupé': 'Space used',
  'dans Cloudflare R2': 'in Cloudflare R2',

  /* ── LA LISTE ───────────────────────────────────────────────────────────── */
  'Aucune sauvegarde.': 'No backup.',
  'Cliquez « Créer une sauvegarde » pour en générer une.':
    'Click « Create a backup » to generate one.',
  'Seul le super-administrateur peut en créer une.':
    'Only the super administrator can create one.',
  'Date': 'Date',
  'Contenu': 'Contents',
  'Application': 'Application',
  'Objets R2': 'R2 objects',
  'Taille': 'Size',
  'Note': 'Note',
  'Date Contenu Application Objets R2 Taille Note':
    'Date Contents Application R2 objects Size Note',
  ' enreg.': ' rec.',
  ' produits · ': ' products · ',
  ' cmd · ': ' orders · ',
  ' fact.': ' inv.',
  /* ⚠⚠ LES TROIS ETATS DE L APPLICATION CONSERVEE doivent se distinguer d un
     coup d oeil : une version et N installateurs, un ECHEC ecrit en ambre, ou
     rien du tout. « non conservee » est dit PLUTOT qu un tiret muet — un tiret
     laisserait croire a une lecture ratee le jour d une restauration. */
  ' installateur': ' installer',
  ' conservé': ' kept',
  'non conservée': 'not kept',
  'au moins ': 'at least ',
  ' de base + ': ' of database + ',
  ' d’application': ' of application',
  /* ⚠ « base seule » dit ce que le chiffre NE COMPTE PAS. Les vieilles
     sauvegardes ne connaissent pas le poids des installateurs : on l ecrit
     plutot que d estimer — un chiffre invente serait pire qu une mention
     honnete. */
  'base seule — installateurs non comptés': 'database only — installers not counted',
  '⬇ Télécharger': '⬇ Download',
  '↩ Restaurer': '↩ Restore',
  'Télécharger le fichier chiffré': 'Download the encrypted file',
  'Réécrire la base à partir de cette sauvegarde': 'Rewrite the database from this backup',
  'Supprimer définitivement cette sauvegarde': 'Permanently delete this backup',
  'Supprimer': 'Delete',
  'Liste actualisée.': 'List refreshed.',
  'Lecture…': 'Reading…',
  'Indisponible pendant l’opération en cours': 'Unavailable while the operation is running',
  'Occuper toute la fenêtre': 'Use the whole window',

  /* ── CREER ──────────────────────────────────────────────────────────────── */
  'Nouvelle sauvegarde': 'New backup',
  'Ajoutez une ': 'Add a ',
  'note': 'note',
  ' pour reconnaître cette sauvegarde plus tard — c’est facultatif. L’opération dompe toute la base, elle peut prendre un moment.':
    ' to recognise this backup later — it is optional. The operation dumps the whole database, it may take a while.',
  'Ajoutez une note pour reconnaître cette sauvegarde plus tard — c’est facultatif. L’opération dompe toute la base, elle peut prendre un moment.':
    'Add a note to recognise this backup later — it is optional. The operation dumps the whole database, it may take a while.',
  'Note (facultatif)': 'Note (optional)',
  /* ⚠ L EXEMPLE suit la langue du poste ; la NOTE qu on tape est de la donnee,
     relue des mois plus tard pour choisir quelle sauvegarde restaurer. */
  'Ex. : avant mise à jour': 'Ex.: before update',
  '200 caractères au plus.': '200 characters at most.',
  'Créer la sauvegarde': 'Create the backup',
  '💾 Créer la sauvegarde': '💾 Create the backup',
  'Annuler 💾 Créer la sauvegarde': 'Cancel 💾 Create the backup',
  'Sauvegarde en cours…': 'Backup in progress…',

  /* ── L AVANCEMENT, MESURE ET NON ANIME ──────────────────────────────────── */
  'Préparation…': 'Preparing…',
  'étape ': 'step ',
  ' sur ': ' of ',
  ' — ': ' — ',

  /* ── LE VERDICT DE LA CREATION ──────────────────────────────────────────── */
  'Sauvegarde créée (': 'Backup created (',
  /* ⚠⚠ UNE SAUVEGARDE QUI SE CROIT COMPLETE ALORS QU ELLE NE L EST PAS SERAIT
     PIRE QUE RIEN : l echec d epinglage se DIT, ici, au seul moment ou
     quelqu un regarde. */
  ') — mais l’application n’a pas été conservée : ': ') — but the application was not kept: ',
  ') — mais l’application n’a pas été conservée :': ') — but the application was not kept:',
  ') — application ': ') — application ',
  ') — application': ') — application',
  ' conservée (': ' kept (',
  'conservée (': 'kept (',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',

  /* ── TELECHARGER ────────────────────────────────────────────────────────── */
  'Préparation du fichier…': 'Preparing the file…',
  'Fichier chiffré téléchargé — gardez-le en lieu sûr. Il est illisible sans la clé du serveur.':
    'Encrypted file downloaded — keep it somewhere safe. It is unreadable without the server key.',

  /* ── RESTAURER ──────────────────────────────────────────────────────────── */
  '↩ Restaurer la base de données': '↩ Restore the database',
  'Cette opération ': 'This operation ',
  'réécrit': 'rewrites',
  ' les données actuelles de Turso avec le contenu de la sauvegarde ':
    ' the current Turso data with the contents of backup ',
  '. Les enregistrements portant le même identifiant seront écrasés. Elle ne supprime pas ce qui a été créé après la sauvegarde.':
    '. Records with the same identifier will be overwritten. It does not delete what was created after the backup.',
  '⚠ Cette opération réécrit les données actuelles de Turso avec le contenu de la sauvegarde':
    '⚠ This operation rewrites the current Turso data with the contents of the backup',
  'Pour confirmer, tapez ': 'To confirm, type ',
  /* ══ LES DEUX MOTS COMPARES — voir l en-tete de ce fichier ═══════════════ */
  'RESTAURER': 'RESTORE',
  'DÉTRUIRE': 'DESTROY',
  'DETRUIRE': 'DESTROY',
  'Tapez ': 'Type ',
  ' pour confirmer.': ' to confirm.',
  'Restaurer maintenant': 'Restore now',
  'Restauration…': 'Restoring…',

  /* ── LE TEST D INTEGRITE ────────────────────────────────────────────────── */
  'Vérification de l’intégrité de la sauvegarde…': 'Checking the integrity of the backup…',
  'Vérification impossible': 'Check impossible',
  'Le contrôle n’a pas pu être fait': 'The check could not be done',
  'Rapport illisible': 'Unreadable report',
  'le serveur a répondu sans rapport d’intégrité': 'the server answered with no integrity report',
  'Sauvegarde vérifiée': 'Backup verified',
  ' enregistrement(s)': ' record(s)',
  'Restauration refusée — cette sauvegarde ne peut pas être restaurée':
    'Restore refused — this backup cannot be restored',
  /* ⚠⚠ CETTE PROMESSE DOIT RESTER ENTIERE : apres un refus, rien n a bouge. */
  'Rien n’a été touché': 'Nothing was touched',
  'aucune donnée modifiée, aucune session fermée': 'no data changed, no session closed',
  'Restauration refusée : ': 'Restore refused: ',
  'sauvegarde inutilisable': 'backup unusable',

  /* ── LA RESTAURATION TERMINEE ───────────────────────────────────────────── */
  'Restauration terminée — ': 'Restore finished — ',
  '✅ Restauration terminée —': '✅ Restore finished —',
  ' enregistrements rétablis.': ' records restored.',
  'enregistrements rétablis.': 'records restored.',
  ' session(s) fermée(s) pendant l’opération.': ' session(s) closed during the operation.',
  'session(s) fermée(s) pendant l’opération.': 'session(s) closed during the operation.',
  'Application ramenée à la version ': 'Application rolled back to version ',
  'Version de l’application NON rétablie : ': 'Application version NOT restored: ',
  /* ⚠⚠ LE CHEMIN DU RETOUR SE NOMME ICI, au seul moment ou quelqu un regarde :
     un filet dont personne ne connait l existence n en est pas un. */
  'Retour en arrière possible': 'Rollback possible',
  ' — l’état d’avant cette restauration a été sauvegardé sous ':
    ' — the state before this restore was saved as ',
  'La fenêtre principale se recharge pour relire la base. Patientez quelques secondes, puis cliquez « ↻ Actualiser ».':
    'The main window is reloading to re-read the database. Wait a few seconds, then click « ↻ Refresh ».',
  '↩ Revenir à l’état d’avant': '↩ Go back to the previous state',
  'Disponible dès que la fenêtre principale a fini de se recharger.':
    'Available as soon as the main window has finished reloading.',
  'Restauration terminée (': 'Restore finished (',
  ' enregistrements).': ' records).',

  /* ── SUPPRIMER ──────────────────────────────────────────────────────────── */
  'Supprimer la sauvegarde': 'Delete the backup',
  'Cette action supprime ': 'This action permanently deletes ',
  'définitivement': 'permanently',
  ' la sauvegarde ': ' backup ',
  ' de Cloudflare R2. Elle sera ': ' from Cloudflare R2. It will be ',
  'irrécupérable': 'unrecoverable',
  '⚠ Cette action supprime définitivement la sauvegarde':
    '⚠ This action permanently deletes the backup',
  'de Cloudflare R2. Elle sera irrécupérable .':
    'from Cloudflare R2. It will be unrecoverable .',
  'Supprimer définitivement': 'Delete permanently',
  '⏳ Suppression…': '⏳ Deleting…',
  'Sauvegarde supprimée.': 'Backup deleted.',

  /* ── PURGER ─────────────────────────────────────────────────────────────── */
  'Purger les vieilles sauvegardes': 'Purge the old backups',
  'Toutes les sauvegardes de plus de ': 'Every backup older than ',
  ' sont détruites de Cloudflare R2. ': ' is destroyed from Cloudflare R2. ',
  'Irréversible.': 'Irreversible.',
  '⚠ Toutes les sauvegardes de plus de': '⚠ Every backup older than',
  'mois sont détruites de Cloudflare R2. Irréversible.':
    'months is destroyed from Cloudflare R2. Irreversible.',
  'Les sauvegardes plus récentes ne sont pas touchées.':
    'More recent backups are not touched.',
  'Purger': 'Purge',
  '⏳ Purge…': '⏳ Purging…',
  ' sauvegarde(s) supprimée(s).': ' backup(s) deleted.',
  'sauvegarde(s) supprimée(s).': 'backup(s) deleted.',
  'Aucune sauvegarde à purger.': 'No backup to purge.',

  /* ══ LES FORMES RENDUES, POUR LE COMPTEUR ══════════════════════════════════
   * ⚠ Les cles ci-dessus sont celles que la SOURCE ecrit — avec leurs espaces de
   * bord, puisqu elles se concatenent a une valeur. `banc-langue-fenetres` lit
   * la page une fois ECRITE : les espaces y sont manges, et les deux boutons du
   * pied s y lisent d un seul trait (« Annuler Purger »). Les deux formes
   * repondent a deux questions differentes ; il faut les deux. */
  'Pour confirmer, tapez': 'To confirm, type',
  'pour confirmer.': 'to confirm.',
  'Restauration refusée :': 'Restore refused:',
  'Application ramenée à la version': 'Application rolled back to version',
  'Version de l’application NON rétablie :': 'Application version NOT restored:',
  'Retour en arrière possible — l’état d’avant cette restauration a été sauvegardé sous':
    'Rollback possible — the state before this restore was saved as',
  'Annuler Restaurer maintenant': 'Cancel Restore now',
  'Annuler Supprimer définitivement': 'Cancel Delete permanently',
  'Annuler Purger': 'Cancel Purge',

  /* ── LE BANDEAU D ANCRAGE ───────────────────────────────────────────────── */
  '⧉ Détacher': '⧉ Detach',
  'Ouvrir cet écran dans sa propre fenêtre': 'Open this screen in its own window',
  '⚓ Ancrer': '⚓ Dock',
  'Ramener cet écran dans la fenêtre principale': 'Bring this screen back into the main window'
};
