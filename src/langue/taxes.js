'use strict';

/*
 * GESTION DES TAXES — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LES NOMS DES COMPOSANTES DE TAXE SONT DES DONNEES, ET DES DONNEES
 * LEGALES : « TPS », « TVQ », « HST », l organisme a qui la taxe est remise
 * (« remis à Revenu Québec ») sont TAPES ici, ECRITS dans la configuration, et
 * PARAISSENT SUR LA FACTURE de la cliente. Ce dictionnaire ne traduit que les
 * etiquettes autour ; rien de ce qui compose un taux n y entre.
 *
 * ⚠⚠ LE REFUS DE CONCURRENCE DIT CE QUI S EST PASSE ET CE QU IL FAUT REFAIRE :
 * « la grille a changé par X (révision du …) pendant votre saisie. La grille
 * affichée vient d’être rechargée — refaites vos changements. » Sans la derniere
 * moitie, on croit avoir enregistre.
 *
 * ⚠⚠ APPLIQUER LA REFERENCE REMPLACE LES TAUX SAISIS, et l avertissement le dit :
 * « N’appliquez pas si vous avez ajusté un taux selon vos inscriptions. » Un
 * taux ajuste pour une inscription fiscale particuliere serait perdu.
 *
 * ⚠ LES CODES DE PROVINCE (QC, ON…) et les codes de pays a deux lettres sont des
 * valeurs. Les NOMS de provinces viennent du coeur.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Gestion des taxes — Administration Sandriza': 'Tax management — Sandriza Administration',
  'Gestion des taxes': 'Tax management',
  'Lecture seule : vous pouvez consulter les taux, pas les modifier.':
    'Read only: you can view the rates, not change them.',
  'Comparer à la référence': 'Compare to the reference',
  'Enregistrer les taux': 'Save the rates',
  'Dernière révision : ': 'Last reviewed: ',
  'Dernière révision :': 'Last reviewed:',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule : les taux ne peuvent pas être modifiés.':
    'Your role is read only: the rates cannot be changed.',
  'Code de pays requis (deux lettres, par exemple US).':
    'Country code required (two letters, for example US).',
  'Ce taux n’est pas un nombre valide.': 'This rate is not a valid number.',
  'Ce pays n’est plus dans la grille.': 'This country is no longer in the table.',
  'La configuration n’est pas prête dans la fenêtre principale.':
    'The configuration is not ready in the main window.',
  'Taux NON enregistrés. Rien n’a été modifié — réessayez.':
    'Rates NOT saved. Nothing was changed — try again.',
  /* ⚠⚠ CE QUI S EST PASSE, ET CE QU IL FAUT REFAIRE. */
  'Taux NON enregistrés : la grille a changé': 'Rates NOT saved: the table changed',
  ' par ': ' by ',
  ' (révision du ': ' (reviewed on ',
  '(révision du': '(reviewed on',
  ' pendant votre saisie. La grille affichée vient d’être rechargée — refaites vos changements.':
    ' while you were typing. The table shown has just been reloaded — make your changes again.',
  'pendant votre saisie. La grille affichée vient d’être rechargée — refaites vos changements.':
    'while you were typing. The table shown has just been reloaded — make your changes again.',

  /* ── LA GRILLE CANADIENNE ───────────────────────────────────────────────── */
  'Canada — par province de livraison': 'Canada — by delivery province',
  'Province ou territoire': 'Province or territory',
  'Composantes — nom, taux, organisme': 'Components — name, rate, authority',
  'Province ou territoire Composantes — nom, taux, organisme':
    'Province or territory Components — name, rate, authority',
  /* ⚠ Les noms accessibles sont COMPOSES par les appelants : la province vit
     dans la premiere cellule, la composante dans l en-tete de colonne, et en
     tabulant le lecteur d ecran n annoncait ni l une ni l autre. */
  'Nom de la composante ': 'Name of component ',
  'Nom de la composante': 'Name of component',
  'Taux en pourcentage de ': 'Percentage rate of ',
  'Taux en pourcentage de': 'Percentage rate of',
  'la composante ': 'component ',
  '% · remis à ': '% · remitted to ',
  '% · remis à': '% · remitted to',
  'Réinitialiser aux défauts': 'Reset to the defaults',

  /* ══ LA COMPARAISON A LA REFERENCE ═════════════════════════════════════════ */
  'Comparaison aux taux de référence': 'Comparison to the reference rates',
  'Vos taux correspondent à la référence.': 'Your rates match the reference.',
  /* ⚠⚠ APPLIQUER REMPLACE : un taux ajuste pour une inscription serait perdu. */
  'Appliquer remplace les composantes canadiennes par les taux de référence. ':
    'Applying replaces the Canadian components with the reference rates. ',
  'Appliquer remplace les composantes canadiennes par les taux de référence.':
    'Applying replaces the Canadian components with the reference rates.',
  'N’appliquez pas si vous avez ajusté un taux selon vos inscriptions.':
    'Do not apply if you have adjusted a rate to match your registrations.',
  'Prov.': 'Prov.',
  'Taxe': 'Tax',
  'Vos taux': 'Your rates',
  'Référence': 'Reference',
  'Prov. Taxe Vos taux': 'Prov. Tax Your rates',
  'absent': 'absent',
  'à retirer': 'to be removed',
  'Appliquer la référence': 'Apply the reference',
  'Fermer': 'Close',
  'Appliquer la référence Fermer': 'Apply the reference Close',

  /* ══ L INTERNATIONAL — PLUS RIEN A SAISIR ══════════════════════════════════
   * ⚠ Le <strong> coupe ces phrases : les cles portent la balise, et les formes
   * rendues suivent. */
  'International': 'International',
  'Les taxes internationales sont <strong>gérées automatiquement par Stripe Tax</strong> : ':
    'International taxes are <strong>handled automatically by Stripe Tax</strong>: ',
  'Les taxes internationales sont gérées automatiquement par Stripe Tax :':
    'International taxes are handled automatically by Stripe Tax:',
  'le taux exact est calculé <strong>à la caisse</strong> selon la destination, à partir de vos inscriptions ':
    'the exact rate is worked out <strong>at checkout</strong> from the destination and your real tax ',
  'le taux exact est calculé à la caisse selon la destination, à partir de vos inscriptions':
    'the exact rate is worked out at checkout from the destination and your real tax',
  'fiscales réelles — plus rien à saisir ici.': 'registrations — nothing left to enter here.',
  '• Les <strong>pays et États desservis</strong> se règlent dans <strong>Livraison ▸ Pays desservis</strong> ':
    '• The <strong>countries and states served</strong> are set in <strong>Shipping ▸ Countries served</strong> ',
  '• Les pays et États desservis se règlent dans Livraison ▸ Pays desservis':
    '• The countries and states served are set in Shipping ▸ Countries served',
  '(lus en direct chez Stripe).': '(read live from Stripe).',
  '• La <strong>clé Stripe Tax</strong> se règle dans <strong>Clés API</strong>.':
    '• The <strong>Stripe Tax key</strong> is set in <strong>API keys</strong>.',
  '• La clé Stripe Tax se règle dans Clés API .':
    '• The Stripe Tax key is set in API keys .',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Taux enregistrés.': 'Rates saved.',
  'Taux réinitialisés aux valeurs par défaut.': 'Rates reset to the default values.',
  'Application de la référence…': 'Applying the reference…',
  'Taux mis à jour selon la référence.': 'Rates updated from the reference.',
  ' avec la référence.': ' with the reference.',
  'avec la référence.': 'with the reference.',
  'Marquage de la révision…': 'Marking the review…',
  'Vos taux correspondent à la référence. Date de révision actualisée.':
    'Your rates match the reference. Review date updated.',
  'Ajout du pays…': 'Adding the country…',
  'Pays ajouté.': 'Country added.',
  'Réinitialisation…': 'Resetting…',
  'Retrait…': 'Removing…',
  'Pays ': 'Country ',
  ' retiré.': ' removed.',
  'retiré.': 'removed.',
  ' écarts': ' gaps',
  ' écart': ' gap',
  'écarts': 'gaps',
  'écart': 'gap'
};
