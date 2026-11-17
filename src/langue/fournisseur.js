'use strict';

/*
 * FICHE FOURNISSEUR — les deux langues
 * =============================================================================
 * ⚠⚠ ON NE TRADUIT QUE CE QUI SE LIT. Le NOM du fournisseur, son adresse, ses
 * notes et ses categories choisies sont de la DONNEE : ils restent tels qu ils
 * ont ete saisis. Les valeurs des categories (`robes`, `hauts`) et les delais
 * (`1-2 semaines`) partent dans la base — `banc-langue-donnees` refuserait de
 * les voir ici.
 *
 * ⚠ « Actif Inactif » est le couple d etiquettes de l interrupteur, ecrit d un
 * bloc dans le gabarit : on le traduit d un bloc aussi.
 */

module.exports = {
  'Fournisseur — Administration Sandriza': 'Supplier — Sandriza Administration',
  'Fournisseur': 'Supplier',
  'Nouveau fournisseur': 'New supplier',
  'Modifier le fournisseur': 'Edit supplier',
  'Formulaire indisponible': 'Form unavailable',
  'Fiche indisponible': 'Record unavailable',
  'Enregistrement bloqué : cette fiche est ouverte ailleurs.':
    'Saving blocked: this record is open elsewhere.',

  /* ── LES CHAMPS ─────────────────────────────────────────────────────────── */
  'Nom du fournisseur': 'Supplier name',
  'Site web': 'Website',
  'Code postal': 'Postal code',
  'Catégories fournies': 'Categories supplied',
  'Délai de livraison moyen': 'Average lead time',
  'Actif Inactif': 'Active Inactive',
  /* ⚠ « internes » = qui ne sortent pas de la boutique. « Internal notes » le
     dit ; « Private notes » laisserait croire a une note personnelle. */
  'Notes internes': 'Internal notes',

  /* ── CE QUE LA BOITE DE REPRISE ANNONCE ─────────────────────────────────── */
  /* ⚠ Ces deux-la se glissent DANS « {…} a ete laissee en cours » : d ou la
     minuscule initiale du second et l article du premier. */
  'Une modification de cette fiche': 'An edit to this record',
  'Une fiche de fournisseur': 'A supplier record',

  /* ── LA LONGUE TRAINE (voir banc-langue-residuel) ───────────────────────── */
  'Téléphone': 'Phone',
  'Enregistré.': 'Saved.',

  /* ── CE QUE LE BANC RESIDUEL A TROUVE ──────────────────────────────────── */
  'Actif': 'Active',
  'Inactif': 'Inactive',

  /* ── LES MOTS SEULS (2026-09-13) — les sections de la fiche. */
  'Identification': 'Identification',
  'Adresse': 'Address',
  'Approvisionnement': 'Supply',
  'Statut': 'Status',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'ouverte par': 'open by',
  'Fiche du fournisseur': 'Supplier sheet',
  'Sans nom': 'Untitled',
  'Courriel': 'Email',
  'Ville': 'City',
  'Délai': 'Lead time',
  'Pour enregistrer': 'To save',
  'Prêt à enregistrer': 'Ready to save',
  /* (8.33.0) L’import de produits depuis le site d’un fournisseur. */
  "Adresse du site invalide (exemple : https://grossiste.ca).": "Invalid site address (example: https://wholesaler.ca).",
  "Choisissez ce que vend ce fournisseur.": "Choose what this supplier sells.",
  "L’adresse de recherche doit être une adresse complète contenant {q}.": "The search address must be a full address containing {q}.",
  "La majoration doit être entre 1 et 10 (exemple : 2,2).": "The markup must be between 1 and 10 (example: 2.2).",
  "Import de produits": "Product import",
  "Site du catalogue": "Catalogue site",
  "Ce que vend ce fournisseur": "What this supplier sells",
  "Choisir…": "Choose…",
  "Majoration proposée (×)": "Suggested markup (×)",
  "Adresse de recherche (facultative)": "Search address (optional)",
  "Vérifier le site": "Check the site",
  "Le site sert à chercher les produits par leur nom dans la fenêtre Import de produits fournisseurs. La famille limite les catégories proposées. Laissez l’adresse de recherche vide : elle n’est utile que pour un site que l’application ne sait pas fouiller seule ({q} est remplacé par le nom cherché).": "The site is used to search products by name in the Supplier product import window. The family limits the categories offered. Leave the search address empty: it is only useful for a site the application cannot search on its own ({q} is replaced by the searched name).",
  "Import": "Import",
  "famille à choisir": "family to choose",
  "Boutique Shopify reconnue : la recherche et les fiches seront complètes (photos, tailles, couleurs, prix).": "Shopify store recognized: search and product records will be complete (photos, sizes, colours, prices).",
  "Boutique WooCommerce reconnue : la recherche et les fiches seront complètes.": "WooCommerce store recognized: search and product records will be complete.",
  "Site joignable : la recherche passera par ses pages (selon le site, certaines informations seront à compléter).": "Site reachable: search will go through its pages (depending on the site, some information will need to be completed).",
  "Saisissez d’abord l’adresse du site.": "Enter the site address first.",
  "Cette version de l’application ne sait pas lire un site : mettez-la à jour.": "This version of the application cannot read a site: update it.",
  "Lecture du site…": "Reading the site…",
  "Site injoignable ou adresse invalide.": "Site unreachable or invalid address.",
  "Le site refuse les lectures directes : la recherche passera par une fenêtre cachée, plus lente.": "The site refuses direct reads: search will go through a hidden window, which is slower.",
  "Choisissez ce que vend ce fournisseur (vêtements, accessoires…) : les catégories proposées à l’import en dépendent.": "Choose what this supplier sells (clothing, accessories…): the categories offered at import depend on it.",
};
