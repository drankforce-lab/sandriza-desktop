'use strict';

/*
 * CONFORMITÉ INTERNATIONALE — les deux langues (#117)
 * =============================================================================
 * ⚠⚠ LES NUMÉROS D IMMATRICULATION, LES NOMS D ORGANISMES ET LES NOMS DE
 * MANDATAIRES SONT DES DONNEES, ET DES DONNEES LEGALES : « LUCID », « CITEO »,
 * « Refashion », un identifiant unique, un numero IOSS — ils sont TAPES ici,
 * ECRITS dans le registre, et certains doivent etre COMMUNIQUES au client. Ce
 * dictionnaire ne traduit que les etiquettes autour ; rien de ce qui compose un
 * mandat n y entre.
 *
 * ⚠⚠ « Filière » NE SE TRADUIT PAS PAR « sector ». En droit des dechets
 * europeen, le mot anglais est « stream » (waste stream) : c est le terme des
 * textes et celui que lira un conseiller. « Sector » designerait un secteur
 * economique — un autre sujet.
 *
 * ⚠ « État » dans l en-tete du tableau veut dire STATUT, pas « State » : la
 * colonne dit si le pays est ouvert ou ferme. Le meme mot dans « les 27 États
 * membres » designe un pays, et c est une AUTRE entree — les deux ne peuvent pas
 * partager une traduction, et c est pour cela qu elles sont ecrites en entier.
 *
 * ⚠ Les bases légales et le texte des exigences NE SONT PAS ICI : ils viennent
 * du coeur (`conformite.js`), en francais, comme les noms de provinces de la
 * fenetre des taxes. Les traduire supposerait de traduire du droit.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Conformité internationale — Administration Sandriza':
    'International compliance — Sandriza Administration',
  'Conformité internationale': 'International compliance',
  'Lecture seule : vous pouvez consulter le registre, pas le modifier.':
    'Read only: you can view the register, not change it.',
  'Chargement en cours': 'Loading',
  'Enregistrer le registre': 'Save the register',
  '⧉ Détacher': '⧉ Detach',
  'Ouvrir cet écran dans sa propre fenêtre': 'Open this screen in its own window',
  '⚓ Ancrer': '⚓ Dock',
  'Ramener cet écran dans la fenêtre principale': 'Bring this screen back into the main window',
  'Livraison internationale : active': 'International shipping: on',
  'Livraison internationale : éteinte': 'International shipping: off',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.':
    'No session open in the application. Sign in from the main window.',
  'Votre rôle ne donne pas accès à la configuration.':
    'Your role does not give access to configuration.',
  'Votre rôle est en lecture seule : le registre ne peut pas être modifié.':
    'Your role is read only: the register cannot be changed.',
  'La configuration n’est pas prête dans la fenêtre principale.':
    'Configuration is not ready in the main window.',
  'La fenêtre principale ne répond pas.': 'The main window is not responding.',
  'La fenêtre principale n’a pas répondu à temps.': 'The main window did not answer in time.',
  'Cette version de l’application ne connaît pas cette opération.':
    'This version of the application does not know this operation.',
  'Registre NON enregistré. Rien n’a été modifié — réessayez.':
    'Register NOT saved. Nothing was changed — try again.',
  'L’opération a échoué.': 'The operation failed.',
  'Erreur inattendue (': 'Unexpected error (',

  /* ⚠ LE REFUS DE CONCURRENCE DIT CE QUI S EST PASSE **ET CE QU IL FAUT
     REFAIRE**. Sans la derniere moitie, on croit avoir enregistre — meme
     reserve qu a la fenetre des taxes. */
  'Registre NON enregistré : il a changé': 'Register NOT saved: it changed',
  ' par ': ' by ',
  ' pendant votre saisie. Le registre affiché vient d’être rechargé — refaites vos changements.':
    ' while you were editing. The register shown has just been reloaded — redo your changes.',
  'Enregistrement…': 'Saving…',
  'Registre enregistré.': 'Register saved.',

  /* ── LES QUATRE ETATS D UN PAYS ─────────────────────────────────────────── */
  'Prêt': 'Ready',
  'À confirmer': 'To confirm',
  'Fermé': 'Closed',
  'Dérogation': 'Waiver',

  /* ── LES FILIERES ───────────────────────────────────────────────────────── */
  'Emballages': 'Packaging',
  'Textiles, linge et chaussures': 'Textiles, household linen and footwear',
  'Équipements électriques (DEEE)': 'Electrical equipment (WEEE)',
  'Piles et accumulateurs': 'Batteries and accumulators',

  /* ── L IDENTITE EUROPEENNE ──────────────────────────────────────────────── */
  'Identité européenne': 'European identity',
  'Ces deux blocs valent pour les 27 États membres : sans eux, aucun pays de l’Union ne s’ouvre.':
    'These two blocks apply to all 27 member states: without them, no country of the Union opens.',
  'Personne responsable dans l’Union — nom': 'Responsible person in the Union — name',
  'Personne responsable — adresse complète': 'Responsible person — full address',
  'Personne responsable — courriel': 'Responsible person — email',
  'Personne responsable — téléphone': 'Responsible person — telephone',
  'Numéro IOSS (guichet TVA à l’importation)': 'IOSS number (import VAT one-stop shop)',
  'Intermédiaire établi dans l’Union': 'Intermediary established in the Union',

  /* ── LES ECHEANCES ──────────────────────────────────────────────────────── */
  '(échue)': '(expired)',
  'Des adhésions sont ÉCHUES. Une adhésion expirée vaut une adhésion absente : le pays se referme.':
    'Some memberships have EXPIRED. An expired membership counts as none: the country closes again.',
  'Des adhésions arrivent à échéance dans les quatre prochains mois.':
    'Some memberships fall due within the next four months.',

  /* ── LE TABLEAU DES PAYS ────────────────────────────────────────────────── */
  'Les 27 États membres': 'The 27 member states',
  'Un pays fermé disparaît du choix à la caisse et la commande y est refusée.':
    'A closed country disappears from the checkout choices and orders to it are refused.',
  'Pays': 'Country',
  'État': 'Status',
  'Bloquants': 'Blocking',
  'Mandats': 'Registrations',
  'Dossier': 'File',
  'Ouvrir le dossier de ': 'Open the file for ',
  'Ouvrir': 'Open',
  'Fermer': 'Close',

  /* ── LE DOSSIER D UN PAYS ───────────────────────────────────────────────── */
  'Ce qui manque, la base légale qui l’exige, et les mandats détenus.':
    'What is missing, the legal basis that requires it, and the registrations held.',
  'D’après ce que le registre détient, rien ne s’oppose à l’expédition dans ce pays.':
    'Based on what the register holds, nothing stands in the way of shipping to this country.',
  '— adhésion échue le ': '— membership expired on ',
  'Mandats détenus': 'Registrations held',
  'Aucun mandat enregistré pour ce pays.': 'No registration recorded for this country.',
  'Ajouter un mandat': 'Add a registration',
  'Filière': 'Stream',
  'Filière du mandat ': 'Stream of registration ',
  'Organisme': 'Scheme',
  'Organisme du mandat ': 'Scheme of registration ',
  'Numéro d’immatriculation': 'Registration number',
  'Numéro du mandat ': 'Number of registration ',
  'Valide jusqu’au': 'Valid until',
  'Échéance du mandat ': 'Expiry of registration ',
  'Retirer': 'Remove',
  'Retirer le mandat ': 'Remove registration ',
  'Mandataire dans le pays': 'Authorised representative in the country',
  'Vérifié le': 'Checked on',

  /* ── LA DEROGATION ──────────────────────────────────────────────────────── */
  'Laisse passer un pays fermé — pour un dossier déposé et en attente. Le motif est obligatoire : sans lui, la dérogation ne vaut rien, et une case verte deviendrait indiscernable d’une adhésion réelle.':
    'Lets a closed country through — for a filing that is submitted and pending. The reason is mandatory: without it the waiver counts for nothing, and a green row would become indistinguishable from a real membership.',
  'Activer la dérogation pour ce pays': 'Activate the waiver for this country',
  'Activer la dérogation': 'Activate the waiver',
  'Motif (obligatoire)': 'Reason (mandatory)',
  'Posée par': 'Set by',
  'Posée le': 'Set on',

  /* ── LE MANDAT, LES EN-TETES ET LES DEUX FINS DE PHRASE (2026-09-18) ─────
     ⚠ << Ouvrir le dossier de >> et << — adhésion échue le >> se terminent SANS
     leur complement : un nom de pays, une date. Ce qui suit est une DONNEE, il
     ne traverse pas le dictionnaire — d ou la coupure, qui n est pas un oubli.
     ⚠ La phrase de rechargement commence en minuscule : elle suit un sujet
     ecrit ailleurs (<< Quelqu un a enregistre… >>). La garder telle quelle. */
  'pendant votre saisie. Le registre affiché vient d’être rechargé — refaites vos changements.':
    'while you were typing. The register shown has just been reloaded — make your changes again.',
  'Ouvrir le dossier de': 'Open the file for',
  'Pays État': 'Country Status',
  'Bloquants À confirmer Mandats': 'Blocking To confirm Mandates',
  '— adhésion échue le': '— membership expired on',
  'Filière du mandat': 'Mandate stream',
  'Organisme du mandat': 'Mandate body',
  'Numéro du mandat': 'Mandate number',
  'Échéance du mandat': 'Mandate expiry',
  'Retirer le mandat': 'Remove the mandate',

  /* ══ LE PIED DU TABLEAU ET L EXPORT (2026-09-24) ═══════════════════════════
     ⚠⚠ << PAYS >> EST INVARIABLE EN FRANCAIS, PAS EN ANGLAIS, et un
     dictionnaire se classe par la phrase FRANCAISE : deux entrees << pays >>
     ne peuvent pas coexister. Le singulier porte donc son article, ce qui
     donne deux cles distinctes et deux traductions justes — sans quoi le pied
     dirait << 1 countries >>. */
  'un pays': 'one country',
  'pays': 'countries',
  /* ⚠ COLONNE DU FICHIER SEULEMENT. A l ecran le code est colle au nom du pays
     dans la meme cellule ; dans le fichier il en prend une a lui, parce que
     c est LA cle sur laquelle on rapproche deux tableaux. */
  'Code': 'Code',
  'Le tableau de conformité': 'The compliance table',
};
