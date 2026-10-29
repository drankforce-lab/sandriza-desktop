'use strict';

/*
 * ABONNES DE L INFOLETTRE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ « DESABONNER » ET « RETIRER » NE FONT PAS LA MEME CHOSE, et c est la
 * seule chose qui les distingue a l ecran. Desabonner ARRETE LES ENVOIS et GARDE
 * LA TRACE DU REFUS ; retirer efface aussi cette trace — et sans elle, plus rien
 * n empeche de reinscrire quelqu un qui s etait desabonne. La phrase d armement
 * dit les deux, et renvoie explicitement vers « Désabonner » pour qui voulait
 * seulement arreter les envois. Aplatir ces deux gestes en un seul mot ferait
 * reinscrire des gens qui avaient dit non.
 *
 * ⚠⚠ LE COURRIEL ET LE PRENOM SONT DES DONNEES : ils viennent de la liste, se
 * comparent, et partent dans les envois. Les exemples des champs (une adresse,
 * un prenom) restent tels quels — ce sont des exemples de DONNEES, pas du texte.
 *
 * ⚠⚠ LE COMPTE RENDU DE L IMPORT DISTINGUE TROIS CAS : ajoutées / déjà inscrites
 * / refusées, sur N lignes. « 12 traitées » ne dirait pas ce qui s est passe —
 * et c est justement quand une adresse est refusee qu il faut le savoir.
 *
 * ⚠ « courriel,prénom » decrit les DEUX COLONNES d une ligne collee, pas deux
 * mots a taper : il suit donc la langue du poste.
 */

module.exports = {
  'le ': 'on ',
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Abonnés de l’infolettre — Administration Sandriza':
    'Newsletter subscribers — Sandriza Administration',
  'Abonnés de l’infolettre': 'Newsletter subscribers',
  'Abonnés indisponibles': 'Subscribers unavailable',
  'Chargement… (la liste se resynchronise)': 'Loading… (the list is resynchronising)',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès à l’infolettre.':
    'Your role does not give access to the newsletter.',
  'Cet abonné n’existe plus.': 'This subscriber no longer exists.',
  'Inscription refusée.': 'Subscription refused.',
  'Collez au moins une adresse.': 'Paste at least one address.',

  /* ══ AJOUTER UN ABONNE ═════════════════════════════════════════════════════
   * ⚠ Le courriel et le prenom sont des DONNEES ; seules les etiquettes se
   * lisent. */
  'Ajouter un abonné': 'Add a subscriber',
  'Sert à personnaliser les envois.': 'Used to personalise the mailings.',
  /* Les EXEMPLES des champs ne sortent pas de l administration : ils suivent la
     langue du poste. ⚠ Ce qui est TAPE par-dessus, lui, reste tel quel. */
  'marie@exemple.com': 'mary@example.com',
  'Marie': 'Mary',
  'marie@exemple.com,Marie': 'mary@example.com,Mary',
  'sophie@exemple.com': 'sophie@example.com',

  /* ══ IMPORTER UNE LISTE ════════════════════════════════════════════════════ */
  'Importer des abonnés': 'Import subscribers',
  /* ⚠ « courriel,prénom » nomme les deux COLONNES d une ligne collee. */
  'Une adresse par ligne, ou « courriel,prénom ». Les adresses déjà inscrites sont ignorées, pas dupliquées.':
    'One address per line, or « email,first name ». Addresses already on the list are skipped, not duplicated.',
  'Liste d’adresses à ajouter, une par ligne': 'List of addresses to add, one per line',
  /* Le libelle du brouillon : ce qui serait perdu, dit dans ses mots. */
  'Une liste a importer': 'A list to import',

  /* ── LES TUILES ─────────────────────────────────────────────────────────── */
  'Abonnés actifs': 'Active subscribers',
  'Désabonnés': 'Unsubscribed',
  'Au total': 'In total',
  'consultation seulement': 'read only',

  /* ── LA LISTE ───────────────────────────────────────────────────────────── */
  '+ Ajouter': '+ Add',
  'Courriel ou prénom': 'Email or first name',
  'Courriel ou prénom…': 'Email or first name…',
  ' abonné': ' subscriber',
  ' abonnés': ' subscribers',
  'abonné': 'subscriber',
  'Rien ne correspond.': 'Nothing matches.',
  'Aucun abonné.': 'No subscriber.',
  /* ⚠⚠ Le geste et l etat ne se disent pas pareil : « Désabonner » est ce qu on
     FAIT, « Désabonné » est ce qu on LIT. Voir l en-tete pour ce que ce geste
     garde, et ce que « Retirer » efface. */
  'Désabonner': 'Unsubscribe',
  'Réactiver': 'Reactivate',
  'Abonné': 'Subscribed',
  'Désabonné': 'Unsubscribed',
  'Courriel': 'Email',
  'Prénom': 'First name',
  'Venu par': 'Came from',
  'Inscription': 'Signed up',
  'État': 'Status',
  'Courriel Prénom Venu par': 'Email First name Came from',
  'Inscription État': 'Signed up Status',

  /* ══ LES VERDICTS ══════════════════════════════════════════════════════════
   * ⚠ Le courriel precede : seule la suite de la phrase se lit. */
  ' réactivé.': ' reactivated.',
  ' ajouté à la liste.': ' added to the list.',
  ' réabonné.': ' subscribed again.',
  /* ⚠⚠⚠ DESABONNER GARDE LA TRACE DU REFUS. Voir l en-tete. */
  ' désabonné — la trace du refus est gardée.':
    ' unsubscribed — the record of the refusal is kept.',
  'désabonné — la trace du refus est gardée.':
    'unsubscribed — the record of the refusal is kept.',
  ' retiré de la liste.': ' removed from the list.',
  'retiré de la liste.': 'removed from the list.',
  /* ⚠⚠⚠ RETIRER EFFACE AUSSI LA TRACE. Les deux phrases de l armement. */
  'Cliquez « Confirmer ? » — le retrait efface aussi la trace du refus. ':
    'Click « Confirm? » — removing also erases the record of the refusal. ',
  'Cliquez « Confirmer ? » — le retrait efface aussi la trace du refus.':
    'Click « Confirm? » — removing also erases the record of the refusal.',
  'Pour seulement arrêter les envois, utilisez « Désabonner ».':
    'To only stop the mailings, use « Unsubscribe ».',

  /* ══ LE COMPTE RENDU DE L IMPORT ═══════════════════════════════════════════
   * ⚠⚠ Trois cas distincts, chaque forme ecrite EN ENTIER. */
  ' ajoutée': ' added',
  ' ajoutées': ' added',
  ' déjà inscrite': ' already on the list',
  ' déjà inscrites': ' already on the list',
  'déjà inscrite': 'already on the list',
  'déjà inscrites': 'already on the list',
  'ajouté à la liste.': 'added to the list.',
  ' refusée': ' refused',
  ' refusées': ' refused',
  ' ligne.': ' line.',
  ' lignes.': ' lines.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Ajouter': 'Add',
  'Importer': 'Import',
  // La refonte de la liste, comme l'Inventaire (2026-09-25).
  'Cliquer pour afficher': 'Click to show',
  'reçoivent l’infolettre': 'receive the newsletter',
  'ne reçoivent plus rien': 'receive nothing any more',
  'toutes les inscriptions': 'all sign-ups',
  'Tous': 'All',
  'Actifs': 'Active',
  // 2026-10-15 : la liste refaite (lot C).
  'sans prénom': 'no first name',
  // 2026-10-15 : confirmations en boîte à part.
  'Retirer l’abonné de la liste': 'Remove subscriber from the list',
  'L’adresse': 'The address',
  'sera retirée définitivement de la liste, y compris la trace d’un éventuel désabonnement. Pour seulement cesser les envois, utilisez plutôt « Désabonner ». Cette action est irréversible.': 'will be permanently removed from the list, including any record of an unsubscribe. To simply stop sending, use “Unsubscribe” instead. This action cannot be undone.',
  'Retirer de la liste': 'Remove from the list',
  // Gestes groupés (2026-10-29)
  "{0} abonné sélectionné": "{0} subscriber selected",
  "{0} abonnés sélectionnés": "{0} subscribers selected",
  "Exporter (CSV)": "Export (CSV)",
  "{0} autre abonné sélectionné ne s’y prête pas : il ne change pas.": "{0} other selected subscriber does not apply: they stay unchanged.",
  "{0} autres abonnés sélectionnés ne s’y prêtent pas : ils ne changent pas.": "{0} other selected subscribers do not apply: they stay unchanged.",
  "Provenance": "Source",
  "Inscrit le": "Subscribed on",
  "Désabonné le": "Unsubscribed on",
  "{0} abonné exporté": "{0} subscriber exported",
  "{0} abonnés exportés": "{0} subscribers exported",
  "Retirer les abonnés de la liste": "Remove subscribers from the list",
  "{0} adresse sera retirée définitivement de la liste, y compris la trace d’un éventuel désabonnement. Pour seulement cesser les envois, utilisez plutôt « Désabonner ». Cette action est irréversible.": "{0} address will be permanently removed from the list, including any record of an unsubscribe. To simply stop sending, use “Unsubscribe” instead. This cannot be undone.",
  "{0} adresses seront retirées définitivement de la liste, y compris la trace d’un éventuel désabonnement. Pour seulement cesser les envois, utilisez plutôt « Désabonner ». Cette action est irréversible.": "{0} addresses will be permanently removed from the list, including any record of an unsubscribe. To simply stop sending, use “Unsubscribe” instead. This cannot be undone.",
  "Retirer {0} adresse": "Remove {0} address",
  "Retirer {0} adresses": "Remove {0} addresses",
  "Retrait de la liste": "Removing from the list",
  "{0} adresse retirée.": "{0} address removed.",
  "{0} adresses retirées.": "{0} addresses removed.",
  "Réactiver les abonnés": "Reactivate subscribers",
  "{0} abonné recevra de nouveau l’infolettre. Ne réactivez que des personnes qui l’ont demandé.": "{0} subscriber will receive the newsletter again. Only reactivate people who asked for it.",
  "{0} abonnés recevront de nouveau l’infolettre. Ne réactivez que des personnes qui l’ont demandé.": "{0} subscribers will receive the newsletter again. Only reactivate people who asked for it.",
  "Réactiver {0} abonné": "Reactivate {0} subscriber",
  "Réactiver {0} abonnés": "Reactivate {0} subscribers",
  "Désabonner les abonnés": "Unsubscribe subscribers",
  "{0} abonné cessera de recevoir l’infolettre ; la trace du refus est gardée.": "{0} subscriber will stop receiving the newsletter; the record of the opt-out is kept.",
  "{0} abonnés cesseront de recevoir l’infolettre ; la trace du refus est gardée.": "{0} subscribers will stop receiving the newsletter; the record of the opt-out is kept.",
  "Désabonner {0} abonné": "Unsubscribe {0} subscriber",
  "Désabonner {0} abonnés": "Unsubscribe {0} subscribers",
  "Réactivation": "Reactivating",
  "Désabonnement": "Unsubscribing",
  "{0} abonné réactivé.": "{0} subscriber reactivated.",
  "{0} abonnés réactivés.": "{0} subscribers reactivated.",
  "{0} abonné désabonné.": "{0} subscriber unsubscribed.",
  "{0} abonnés désabonnés.": "{0} subscribers unsubscribed.",
  // Gestes groupés (2026-10-29)
  "Statut": "Status",
};
