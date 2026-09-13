'use strict';

/*
 * LE LEXIQUE DES LIBELLÉS QUI ARRIVENT AVEC LES DONNÉES
 * =============================================================================
 * ⚠⚠⚠ SA CAPTURE DU 2026-09-13 : une pastille « Confirmée » et une pastille
 * « Payée », en français, dans un tableau dont les en-têtes disaient NUMBER,
 * CUSTOMER, TOTAL, STATUS. Ses mots : « les status sont toujours pas traduit
 * et c'est partout sur l'application ».
 *
 * ⚠⚠ CE TEXTE N'EST PAS DANS LA FENÊTRE, ET C'EST TOUTE L'HISTOIRE. Le site
 * compose le libellé (`ORDER_STATUS[o.status]` dans `admin.js`) et l'envoie
 * DÉJÀ EN FRANÇAIS ; la fenêtre ne fait que l'afficher :
 *
 *     pilule(r.statut, r.statutLibelle)   →   <span class="pill">Confirmée</span>
 *
 * Aucun des cinq bancs de langue ne pouvait le voir :
 *   · `banc-langue-residuel` cherche des littéraux dans la SOURCE — il n'y en
 *     a pas, la phrase arrive par le réseau ;
 *   · `banc-langue-appels` exige une entrée pour chaque `T("…")` — il n'y a
 *     pas de `T()`, il n'y a rien à envelopper ;
 *   · `banc-langue-effet` DESSINE la page anglaise — mais sans données, donc
 *     sans une seule pastille.
 *
 * ➡ **UN TEXTE QUI ARRIVE AVEC LES DONNÉES N'EST DANS AUCUN FICHIER DE LA
 *   FENÊTRE. AUCUN RELEVÉ DE SOURCE NE PEUT LE TROUVER.** C'est la quatrième
 *   forme de la même leçon — après la page qui déclarait sa langue, après les
 *   unités fabriquées à l'exécution, après les phrases enveloppées sans entrée.
 *
 * ══ POURQUOI ICI ET PAS DANS LE SITE ═══════════════════════════════════════
 * Le site est français-canadien de bout en bout (c'est écrit dans son
 * CLAUDE.md) ; c'est l'APPLICATION qui est bilingue. Traduire à la source
 * changerait la boutique en production pour un réglage qui n'appartient qu'au
 * poste de travail. Même décision que pour le menu (`menu-langue.js`).
 *
 * ══ CE QU'IL NE CONNAÎT PAS, IL LE LAISSE PASSER ═══════════════════════════
 * ⚠⚠ C'EST LA GARDE DE TOUT LE MÉCANISME. Ces mêmes champs portent aussi des
 * DONNÉES : le nom d'un segment, d'une campagne, d'un fournisseur — écrits par
 * quelqu'un, dans sa langue à lui. Une table qui traduirait « tout ce qui
 * ressemble à » réécrirait le travail des gens.
 * ➡ **LA TRADUCTION NE TOUCHE QUE CE QU'ON LIT. JAMAIS CE QUI EST ÉCRIT.** Une
 * chaîne absente de ce lexique ressort MOT POUR MOT.
 *
 * ⚠ ET LE LEXIQUE EST CONFRONTÉ À SA SOURCE : `tools/banc-langue-libelles.js`
 * relève les tables de libellés DANS `admin.js` et `pont.js` et exige que
 * chacune de leurs valeurs soit ici. Une entrée ajoutée au site demain sans sa
 * traduction refuse le dépôt — c'est la leçon de `banc-menu-langue`, où une
 * table non confrontée à sa source s'était périmée en silence.
 */

const LIBELLES_EN = {
  /* ── Statuts de commande (ORDER_STATUS) ─────────────────────────────── */
  'En attente': 'Pending',
  'Confirmée': 'Confirmed',
  'En préparation': 'Preparing',
  'Vérification': 'Verification',
  'En livraison': 'Shipping',
  'Livrée': 'Delivered',
  'Annulée': 'Cancelled',

  /* ── Statuts de facture (_FACT_LIBELLES) ────────────────────────────── */
  'Non payée': 'Unpaid',
  'Payée': 'Paid',
  'En retard': 'Overdue',

  /* ── Statuts de retour (_RET_LIBELLES) ──────────────────────────────── */
  'Photo requise': 'Photo required',
  'Approuvée': 'Approved',
  'Rejetée': 'Rejected',
  'En transit': 'In transit',
  'Reçu — en traitement': 'Received — processing',
  'Remboursée': 'Refunded',
  'Complétée': 'Completed',
  'En attente d’analyse': 'Awaiting review',

  /* ── Plages de statistiques (_GA_PLAGES) ────────────────────────────── */
  '7 jours': '7 days',
  '30 jours': '30 days',
  '90 jours': '90 days',

  /* ── Pays du répertoire (_DIR_COUNTRY_LABELS) ───────────────────────────
     ⚠ LE DRAPEAU RESTE : c'est un pictogramme, pas un mot. */
  '🇨🇦 Canada': '🇨🇦 Canada',
  '🇺🇸 États-Unis': '🇺🇸 United States',
  '🇨🇳 Chine': '🇨🇳 China',

  /* ── Moyens d'encaissement et suites d'un reçu (pont.js) ────────────── */
  'Terminal Square (reçu)': 'Square terminal (receipt)',
  'Comptant (reçu)': 'Cash (receipt)',
  'Interac (reçu)': 'Interac (receipt)',
  'Autre (reçu)': 'Other (receipt)',
  'Lien de paiement (téléphone)': 'Payment link (phone)',
  '✉ Envoyer par courriel': '✉ Send by email',
  '🖨 Imprimer seulement': '🖨 Print only',
  '✉ + 🖨 Courriel et impression': '✉ + 🖨 Email and print',
  'Ne rien faire': 'Do nothing',

  /* ── Trimestres fiscaux ──────────────────────────────────────────────────
     ⚠ LES MOIS SONT ABRÉGÉS À LA MAIN DANS LE SITE, donc la traduction l'est
     aussi : ce sont des libellés, pas des dates que `LIEU()` pourrait mettre
     en forme. */
  'T1 — jan · fév · mar': 'Q1 — Jan · Feb · Mar',
  'T2 — avr · mai · juin': 'Q2 — Apr · May · Jun',
  'T3 — juil · août · sep': 'Q3 — Jul · Aug · Sep',
  'T4 — oct · nov · déc': 'Q4 — Oct · Nov · Dec',

  /* ── Boutons de la boîte de mise à jour ─────────────────────────────── */
  'Installer maintenant': 'Install now',
  'Plus tard': 'Later',
};

module.exports = { LIBELLES_EN };
