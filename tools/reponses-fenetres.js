'use strict';

/*
 * CE QUE LE FAUX PONT RÉPOND, FENÊTRE PAR FENÊTRE
 * =============================================================================
 * `executer-page.js` fait tourner le script d'une fenêtre pour voir s'il meurt en
 * silence. Encore faut-il qu'il reçoive des données RESSEMBLANTES : c'est toute la
 * leçon du 2026-08-07. Mon essai de ce jour-là n'avait pas de pont du tout, la
 * réponse était donc un refus, et la fenêtre affichait poliment « État
 * indisponible » — je n'ai jamais atteint le code du dessin, qui était le seul
 * cassé. J'ai éprouvé le chemin d'à côté et j'en ai conclu que tout allait bien.
 *
 * ⚠ UNE FENÊTRE SANS JEU DE RÉPONSES N'EST PAS DÉCLARÉE SAINE : elle est déclarée
 * NON ÉPROUVÉE, et le garde-fou le dit. La différence compte — « je n'ai pas
 * regardé » n'est pas « j'ai regardé et c'est bon », et c'est exactement la
 * confusion qui a laissé passer quatre versions.
 *
 * ⚠⚠ ET UN JEU DE RÉPONSES DOIT ÊTRE ÉPROUVÉ, LUI AUSSI. Écrire un jeu qui ne
 * conduit pas la fenêtre jusqu'à son DESSIN donne le même faux calme : « rien n'a
 * cassé » parce que rien n'a été fait. Deux garde-fous s'en chargent : le compteur
 * d'écritures d'écran (aucune écriture = faute), et la vérification à la main en
 * injectant une variable libre dans la fonction de dessin de la fenêtre — si le
 * contrôle ne l'accuse pas, le jeu ne mène pas là où l'on croit. Les quatre jeux
 * ci-dessous ont passé cette épreuve le 2026-08-07.
 *
 * ⚠⚠⚠ CE QUE CE CONTRÔLE NE COUVRE PAS, ET IL FAUT LE SAVOIR POUR NE PAS S'Y FIER
 * PLUS QU'IL NE LE MÉRITE : il exécute le rendu au CHARGEMENT, pas les gestes de
 * l'usager. Aucun clic, aucune frappe n'est simulée — le faux document rend un
 * élément NEUF à chaque `getElementById`, il n'y a donc pas d'arbre où un événement
 * pourrait remonter. Tout ce qui ne se déclenche que sur un clic ou une saisie
 * (reprise d'une fiche client, boutons de quantité, masque de téléphone, envoi de
 * la vente) reste hors de sa portée.
 * Mesuré le 2026-08-07 : une variable libre injectée dans `remplirClient` de la
 * caisse n'est PAS vue par le contrôle, alors que la même sonde dans la fonction de
 * dessin l'est immédiatement. Ces chemins-là se vérifient à la main, dans
 * l'application — et c'est précisément l'un d'eux qui portait le défaut de la
 * reprise de fiche client.
 *
 * Pour couvrir une fenêtre de plus : ajouter son fichier ici, avec les réponses
 * de ses opérations. Le contrôle s'y applique aussitôt.
 *
 * DEUX FORMES ACCEPTÉES :
 *   — un objet { 'op:nom': réponse }        → un seul cas, ouvert sans identifiant ;
 *   — un TABLEAU de { nom, id, reponses }   → plusieurs cas d'ouverture.
 * La seconde existe parce qu'ouvrir en CRÉATION et ouvrir en MODIFICATION ne
 * traversent pas le même code : la création ne lit aucune fiche, ne prend aucun
 * verrou et n'affiche aucun journal ; la modification fait les trois.
 *
 * ⚠ LES FORMES DE RÉPONSE SONT CELLES DU SITE, relevées dans `assets/js/pont.js`
 * — pas inventées ici. Un jeu d'essai qui ne ressemble pas à la vraie réponse
 * éprouve une fenêtre qui n'existe pas. Si une opération change de forme là-bas,
 * elle doit changer ici : c'est le prix de l'outil, et il est plus bas que celui
 * d'une fenêtre morte en production.
 */

// ── PIÈCES COMMUNES ─────────────────────────────────────────────────────────
// Une image minuscule mais VALIDE : plusieurs fenêtres posent la source d'une
// photo dans un attribut, et une chaîne quelconque y passerait pour une adresse.
const IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
// Verrou obtenu. ⚠ La forme est { obtenu, horsLigne, parQui } — PAS un booléen :
// `_lockTake` du site rend un objet, et le pont le traduit ainsi.
const VERROU = { ok: true, obtenu: true, horsLigne: false, parQui: '' };
const IDENTITE = { ok: true, nom: 'Brigitte Brousseau', role: 'Administratrice' };

module.exports = {
  'imprimantes.js': {
    'imprimantes:etat': {
      // ⚠ `natif: true` EST LE CAS RÉEL, et le jeu d'essai doit être le cas réel.
      // Une fenêtre native ne s'ouvre que dans l'application : il n'y a donc jamais
      // d'agent d'impression séparé, et la carte qui l'annonçait a été retirée le
      // 2026-08-07. Éprouver avec `natif: false` reviendrait à éprouver un chemin
      // que personne ne prend — l'erreur exacte qui a coûté quatre versions.
      natif: true, poste6: 'a1b2c3',
      ok: true, disponible: true, poste: 'CAISSE-1',
      version: '1.4.0', versionDisponible: '1.4.0',
      aidePdf: true, aidePdfNom: 'SumatraPDF',
      // Les TROIS usages, dont un sans imprimante associée et un au format Lettre :
      // c'est le cas qui a cassé, et un jeu d'essai qui n'a qu'un service ne
      // l'aurait pas reproduit.
      services: [
        { cle: 'barcode', titre: 'Codes-barres', imprimante: 'Zebra ZD220', largeurPo: 2, hauteurPo: 1 },
        { cle: 'shipping', titre: 'Expédition', imprimante: '', largeurPo: 4, hauteurPo: 6 },
        { cle: 'invoice', titre: 'Factures', imprimante: 'HP LaserJet', largeurPo: 8.5, hauteurPo: 11 },
      ],
    },
    'imprimantes:liste': {
      ok: true,
      imprimantes: [
        { nom: 'Zebra ZD220', defaut: false, virtuelle: false },
        { nom: 'HP LaserJet', defaut: true, virtuelle: false },
        // Une virtuelle, pour que le rangement à part soit réellement parcouru.
        { nom: 'Microsoft Print to PDF', defaut: false, virtuelle: true },
      ],
    },
    'imprimantes:definir': { ok: true, imprimante: 'Zebra ZD220' },
    'imprimantes:tester': { ok: true },
    'identite': { ok: true, nom: 'Essai', role: 'admin' },
  },

  'affichage.js': {
    'caisse:etat': {
      ok: true,
      marque: { nom: 'SANDRIZA', logo: '' },
      lignes: [
        { nom: 'Robe cintrée', taille: 'M', couleur: 'Noir', qte: 2, prix: 89.95, total: 179.9 },
      ],
      sousTotal: 179.9, tps: 9, tvq: 17.95, total: 206.85, remise: 0,
    },
  },

  // ── VENTE AU COMPTOIR ─────────────────────────────────────────────────────
  // ⚠ LE SEUL ÉCRAN QUI ENCAISSE DE L'ARGENT : son jeu d'essai est donc le plus
  // important du lot. Deux cas, parce qu'ils ne traversent pas le même code — un
  // rôle qui peut vendre, et un rôle en lecture seule qui doit voir l'écran
  // désarmé plutôt qu'un bouton qui ne répond pas.
  'caisse.js': [
    {
      nom: 'caissier',
      id: '',
      reponses: {
        'caisse:contexte': {
          ok: true,
          provinces: ['QC', 'ON', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'NU', 'YT'],
          paiements: [
            { cle: 'terminal', libelle: 'Terminal Square (reçu)' },
            { cle: 'comptant', libelle: 'Comptant (reçu)' },
            { cle: 'lien', libelle: 'Lien de paiement (téléphone)' },
          ],
          remises: [
            { cle: 'courriel', libelle: '✉ Envoyer par courriel' },
            { cle: 'impression', libelle: '🖨 Imprimer seulement' },
            { cle: 'aucun', libelle: 'Ne rien faire' },
          ],
          peutVendre: true,
          par: 'Brigitte Brousseau',
        },
        'caisse:chercher': {
          ok: true, sku: null,
          articles: [
            { id: 'p_0001', nom: 'Robe cintrée', code: 'ROB-0001', variantes: [
              { cle: 'M-Noir', taille: 'M', couleur: 'Noir', quantite: 4 },
              // Une variante ÉPUISÉE : le bouton doit être grisé, pas absent.
              { cle: 'G-Noir', taille: 'G', couleur: 'Noir', quantite: 0 },
            ] },
            // Un article SANS variante : la fenêtre doit le dire au lieu de laisser un vide.
            { id: 'p_0003', nom: 'Foulard de laine', code: 'ACC-0012', variantes: [] },
          ],
        },
        'caisse:article': { ok: true, ligne: { productId: 'p_0001', name: 'Robe cintrée',
          sku: 'ROB-0001-M-NOI', size: 'M', color: 'Noir', price: 129.95, quantity: 1 } },
        'caisse:totaux': { ok: true, sousTotal: 129.95, rabais: 0, livraison: 0,
          taxes: [{ nom: 'TPS', taux: 0.05, montant: 6.5 }, { nom: 'TVQ', taux: 0.09975, montant: 12.96 }],
          total: 149.41 },
        'caisse:client': { ok: true, exact: null, trouves: [
          { id: 'u_0001', nom: 'Marie Tremblay', courriel: 'marie@example.com', tel: '418 555-0142',
            province: 'QC', commandes: 3 },
        ] },
        'caisse:vendre': { ok: true, numero: 'SZ-100250', commandeId: 'ord_0003',
          factureId: 'inv_0003', total: 149.41, stockOk: true, nuageOk: true,
          compteNeuf: false, envoiCourriel: true, enAttente: false, lien: null, avis: [] },
        // L afficheur : la fenetre diffuse son panier a chaque changement.
        'caisse:diffuser': { ok: true },
        'caisse:affichage': { ok: true },
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'lecture seule',
      id: '',
      reponses: {
        'caisse:contexte': {
          ok: true,
          provinces: ['QC', 'ON'],
          paiements: [{ cle: 'comptant', libelle: 'Comptant (reçu)' }],
          remises: [{ cle: 'aucun', libelle: 'Ne rien faire' }],
          // ⚠ Le droit de VOIR sans le droit de VENDRE existe réellement : la
          // fenêtre doit désarmer son bouton et le dire, pas laisser croire.
          peutVendre: false,
          par: 'Stagiaire',
        },
        'caisse:chercher': { ok: true, sku: null, articles: [] },
        'caisse:totaux': { ok: true, sousTotal: 0, rabais: 0, livraison: 0, taxes: [], total: 0 },
        'caisse:client': { ok: true, exact: null, trouves: [] },
        // L afficheur : la fenetre diffuse son panier a chaque changement.
        'caisse:diffuser': { ok: true },
        'caisse:affichage': { ok: true },
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
  ],

  // ── FOURNISSEUR ───────────────────────────────────────────────────────────
  // Forme de la fiche = celle qu'écrit `fournisseurEnregistrer`, donc celle que
  // `DB.getSupplierById` rend. L'adresse est un SOUS-OBJET : la mettre à plat
  // ferait lire `undefined.street` et la fenêtre mourrait — exactement le défaut
  // que cet outil existe pour attraper.
  'fournisseur.js': [
    {
      nom: 'création',
      id: '',
      reponses: {
        'fournisseur:contexte': {
          ok: true,
          categories: [
            { cle: 'robes', libelle: 'Robes' },
            { cle: 'hauts', libelle: 'Hauts' },
            { cle: 'chaussures', libelle: 'Chaussures' },
          ],
          delais: ['1-3 jours', '4-7 jours', '1-2 semaines', '2-4 semaines', '1-2 mois', '2 mois et plus'],
          provinces: ['QC', 'ON', 'NB', 'NS', 'PE', 'NL', 'MB', 'SK', 'AB', 'BC', 'YT', 'NT', 'NU'],
          peutAjouter: true, peutModifier: true,
        },
        // Aucun identifiant : le site rend une fiche NULLE, pas une erreur.
        'fournisseur:lire': { ok: true, fiche: null },
        'fournisseur:enregistrer': { ok: true, modifie: false },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      },
    },
    {
      nom: 'modification',
      id: 'sup_0001',
      reponses: {
        'fournisseur:contexte': {
          ok: true,
          categories: [
            { cle: 'robes', libelle: 'Robes' },
            { cle: 'hauts', libelle: 'Hauts' },
            { cle: 'chaussures', libelle: 'Chaussures' },
          ],
          delais: ['1-3 jours', '4-7 jours', '1-2 semaines', '2-4 semaines', '1-2 mois', '2 mois et plus'],
          provinces: ['QC', 'ON', 'NB', 'NS', 'PE', 'NL', 'MB', 'SK', 'AB', 'BC', 'YT', 'NT', 'NU'],
          peutAjouter: true, peutModifier: true,
        },
        'fournisseur:lire': {
          ok: true,
          fiche: {
            id: 'sup_0001',
            name: 'Atelier Rivière',
            contactName: 'Louise Gagné',
            email: 'louise@atelier-riviere.ca',
            phone: '418 555-0142',
            website: 'https://atelier-riviere.ca',
            address: { street: '221 rue Saint-Joseph Est', city: 'Québec', province: 'QC', postalCode: 'G1K 3B1' },
            categories: ['robes', 'hauts'],
            leadTime: '1-2 semaines',
            notes: 'Livre le mardi. Minimum de 6 pièces par modèle.',
            active: true,
          },
        },
        'fournisseur:enregistrer': { ok: true, modifie: true },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      },
    },
  ],

  // ── COLLECTION ────────────────────────────────────────────────────────────
  'collection.js': [
    {
      nom: 'création',
      id: '',
      reponses: {
        'collection:contexte': {
          ok: true,
          produits: [
            { id: 'p_0001', nom: 'Robe cintrée', categorie: 'robes' },
            { id: 'p_0002', nom: 'Chemisier de soie', categorie: 'hauts' },
          ],
          // ⚠ LA PREMIÈRE SAISON EST UNE CHAÎNE VIDE, et c'est voulu côté site
          // (« aucune saison »). Un jeu d'essai qui l'omettrait ne dirait pas si
          // la fenêtre sait dessiner ce choix-là.
          saisons: ['', 'Printemps', 'Été', 'Automne', 'Hiver'],
          annees: [2025, 2026, 2027, 2028],
          anneeParDefaut: 2026,
          peutAjouter: true, peutModifier: true,
        },
        'collection:lire': { ok: true, fiche: null },
        'collection:decrire': { ok: true, texte: 'Une collection lumineuse, pensée pour les journées qui s’allongent.' },
        'collection:enregistrer': { ok: true, modifie: false },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      },
    },
    {
      nom: 'modification',
      id: 'col_0001',
      reponses: {
        'collection:contexte': {
          ok: true,
          produits: [
            { id: 'p_0001', nom: 'Robe cintrée', categorie: 'robes' },
            { id: 'p_0002', nom: 'Chemisier de soie', categorie: 'hauts' },
          ],
          saisons: ['', 'Printemps', 'Été', 'Automne', 'Hiver'],
          annees: [2025, 2026, 2027, 2028],
          anneeParDefaut: 2026,
          peutAjouter: true, peutModifier: true,
        },
        'collection:lire': {
          ok: true,
          fiche: {
            id: 'col_0001',
            name: 'Printemps 2026',
            description: 'Des coupes fluides et des teintes claires.',
            season: 'Printemps',
            year: 2026,
            active: true,
            coverImage: IMAGE,
            productIds: ['p_0001'],
          },
        },
        'collection:decrire': { ok: true, texte: 'Des coupes fluides et des teintes claires.' },
        'collection:enregistrer': { ok: true, modifie: true },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      },
    },
  ],

  // ── COMMANDE (préparation d'un colis) ─────────────────────────────────────
  // ⚠ CETTE FENÊTRE N'A PAS DE CAS << CRÉATION >> : on ne crée pas une commande
  // depuis un écran d'entrepôt, on en prépare une qui existe. Le site répond
  // « introuvable » sans identifiant — donc le cas sans identifiant est un cas de
  // REFUS, qu'on éprouve aussi : c'est le chemin qu'on prend quand une commande a
  // été supprimée entre la liste et l'ouverture de la fenêtre.
  'commande.js': [
    {
      nom: 'à préparer',
      id: 'ord_0001',
      reponses: {
        'commande:contexte': {
          ok: true,
          transporteurs: [
            { cle: 'postes-canada', nom: 'Postes Canada' },
            { cle: 'fedex', nom: 'FedEx' },
          ],
          peutPreparer: true, peutExpedier: true,
        },
        'commande:lire': {
          ok: true,
          numero: 'SZ-100248',
          statut: 'processing',
          dejaPret: false,
          suivi: '',
          transporteur: '',
          client: 'Marie Tremblay',
          adresse: '221 rue Saint-Joseph Est, Québec, QC, G1K 3B1',
          articles: [
            { rang: 0, cle: 'p_0001|M|Noir', nom: 'Robe cintrée', sku: 'ROB-0001', taille: 'M', couleur: 'Noir', quantite: 2 },
            { rang: 1, cle: 'p_0002|P|Ivoire', nom: 'Chemisier de soie', sku: 'HAU-0007', taille: 'P', couleur: 'Ivoire', quantite: 1 },
          ],
          nbColis: 3,
        },
        'commande:bon': { ok: true },
        'commande:etiquette': { ok: true, suivi: '1Z999AA10123456784', transporteur: 'postes-canada' },
        'commande:prete': { ok: true },
        'commande:expedier': { ok: true },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      },
    },
    {
      nom: 'déjà prête, avec suivi',
      id: 'ord_0002',
      reponses: {
        'commande:contexte': {
          ok: true,
          transporteurs: [{ cle: 'postes-canada', nom: 'Postes Canada' }],
          // Droit de préparer SANS droit d'expédier : la fenêtre doit dessiner
          // l'un et refuser l'autre. Deux booléens toujours vrais n'éprouvent rien.
          peutPreparer: true, peutExpedier: false,
        },
        'commande:lire': {
          ok: true,
          numero: 'SZ-100249',
          statut: 'ready',
          dejaPret: true,
          suivi: '1Z999AA10123456784',
          transporteur: 'postes-canada',
          client: 'Josée Lafleur',
          adresse: '9 avenue des Érables, Lévis, QC, G6V 2R1',
          articles: [
            { rang: 0, cle: 'p_0003||', nom: 'Foulard de laine', sku: 'ACC-0012', taille: '', couleur: '', quantite: 1 },
          ],
          nbColis: 1,
        },
        'commande:bon': { ok: true },
        'commande:etiquette': { ok: true, suivi: '1Z999AA10123456784', transporteur: 'postes-canada' },
        'commande:prete': { ok: true },
        'commande:expedier': { ok: true },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      },
    },
    {
      nom: 'commande introuvable',
      id: 'ord_disparue',
      reponses: {
        'commande:contexte': {
          ok: true,
          transporteurs: [{ cle: 'postes-canada', nom: 'Postes Canada' }],
          peutPreparer: true, peutExpedier: true,
        },
        'commande:lire': { ok: false, motif: 'introuvable' },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      },
    },
  ],

  // ── PRODUIT (l'assistant, la plus grande des fenêtres) ────────────────────
  'produit.js': [
    {
      nom: 'création',
      id: '',
      reponses: {
        'produit:contexte': _produitContexte(),
        'produit:lire': { ok: true, fiche: null },
        'produit:sku': { ok: true, sku: 'ROB-0007', configure: true },
        'produit:nipExige': { ok: true, exige: false },
        'produit:nip': { ok: true, valide: true, exige: false },
        'photos:liste': {
          ok: true, session: true,
          photos: [
            { id: 'ph_0001', code: 'PH-0001', nom: 'Robe noire, devant', src: IMAGE,
              rattacheA: 'Robe cintrée', codeProduit: 'ROB-0001', poids: 184320 },
            // Une photo NON rattachée : la fiche de détail doit savoir le dire
            // plutôt que d'afficher un vide.
            { id: 'ph_0002', code: 'PH-0002', nom: 'Chemisier ivoire', src: IMAGE,
              rattacheA: '', codeProduit: '', poids: 96000 },
          ],
        },
        // Aucun brouillon à reprendre : c'est le cas ordinaire.
        'produit:brouillonLire': { ok: true, brouillon: null },
        'produit:brouillonEcrire': { ok: true },
        'produit:brouillonJeter': { ok: true },
        'produit:changements': { ok: true, entrees: [] },
        'produit:historique': { ok: true, entrees: [] },
        'produit:decrire': { ok: true, texte: 'Une robe cintrée à la coupe nette, taillée dans un lainage souple.' },
        'produit:enregistrer': { ok: true, id: 'p_0009' },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      },
    },
    {
      nom: 'brouillon à reprendre',
      id: '',
      reponses: Object.assign({}, {
        'produit:contexte': _produitContexte(),
        'produit:lire': { ok: true, fiche: null },
        'produit:sku': { ok: true, sku: 'ROB-0007', configure: true },
        'produit:nipExige': { ok: true, exige: true },
        'produit:nip': { ok: true, valide: true, exige: true },
        'photos:liste': { ok: true, session: true, photos: [] },
        // ⚠ LE VOILE DE REPRISE NE S'ÉPROUVE QUE S'IL Y A UN BROUILLON. Sans ce
        // cas, tout le code de restauration ne serait jamais exécuté — et c'est
        // du code qui touche à la saisie de quelqu'un.
        'produit:brouillonLire': {
          ok: true, ilYaMin: 4,
          brouillon: {
            ts: 1770000000000,
            name: 'Robe cintrée (en cours)',
            category: 'robes',
            price: '129.95',
            acquisitionCost: '48.00',
            weight: '0.42',
            regime: 'normal',
            retours: 'accepte',
            stock: [{ color: 'Noir', size: 'M', qty: 4, warehouseId: 'wh_0001', threshold: 3 }],
          },
        },
        'produit:brouillonEcrire': { ok: true },
        'produit:brouillonJeter': { ok: true },
        'produit:changements': { ok: true, entrees: [] },
        'produit:historique': { ok: true, entrees: [] },
        'produit:decrire': { ok: true, texte: '' },
        'produit:enregistrer': { ok: true, id: 'p_0009' },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      }),
    },
    {
      nom: 'modification, avec journal',
      id: 'p_0001',
      reponses: {
        'produit:contexte': _produitContexte(),
        'produit:lire': {
          ok: true,
          fiche: {
            id: 'p_0001',
            sku: 'ROB-0001',
            name: 'Robe cintrée',
            description: 'Une coupe nette, un lainage souple.',
            category: 'robes',
            price: 129.95,
            compareAtPrice: 159.95,
            acquisitionCost: 48,
            weight: 0.42,
            active: true,
            supplierId: 'sup_0001',
            sizeGuideId: 'sg_0003',
            genre: 'femme',
            ageGroup: 'adulte',
            style: 'chic',
            finalSale: false,
            liquidation: false,
            noReturn: false,
            images: [IMAGE],
            variants: [
              { color: 'Noir', size: 'M', stock: 4, warehouseId: 'wh_0001', lowStockThreshold: 3 },
              // Une variante SOUS le seuil : c'est elle qui déclenche l'avertissement.
              { color: 'Noir', size: 'G', stock: 1, warehouseId: 'wh_0001', lowStockThreshold: 3 },
              // Une variante SANS entrepôt : la fenêtre doit la marquer en manque.
              { color: 'Bleu marine', size: 'P', stock: 2, warehouseId: '', lowStockThreshold: 3 },
            ],
            labels: ['lbl:bio'],
          },
        },
        'produit:sku': { ok: true, sku: 'ROB-0001', configure: true },
        'produit:nipExige': { ok: true, exige: false },
        'produit:nip': { ok: true, valide: true, exige: false },
        'photos:liste': {
          ok: true, session: true,
          photos: [{ id: 'ph_0001', code: 'PH-0001', nom: 'Robe noire, devant', src: IMAGE,
            rattacheA: 'Robe cintrée', codeProduit: 'ROB-0001', poids: 184320 }],
        },
        'produit:brouillonLire': { ok: true, brouillon: null },
        'produit:brouillonEcrire': { ok: true },
        'produit:brouillonJeter': { ok: true },
        // ⚠ La forme du journal : { entrees:[{ ts, par, changements:[{libelle,avant,apres}] }] }.
        // Les libellés BRUTS (`sg_0003`) sont volontaires : c'est ce que le site
        // envoie réellement aujourd'hui, et un jeu d'essai qui les embellirait
        // cacherait le défaut connu au lieu de l'exposer (tâche ouverte).
        'produit:changements': {
          ok: true,
          entrees: [
            { ts: 1770000000000, par: 'Brigitte Brousseau', changements: [
              { libelle: 'price', avant: '119.95', apres: '129.95' },
              { libelle: 'sizeGuideId', avant: '', apres: 'sg_0003' },
            ] },
          ],
        },
        'produit:historique': {
          ok: true,
          entrees: [
            { ts: 1770000000000, par: 'Brigitte Brousseau', changements: [
              { libelle: 'price', avant: '119.95', apres: '129.95' },
            ] },
            { ts: 1700000000000, par: 'Système', changements: [
              { libelle: 'active', avant: 'false', apres: 'true' },
            ] },
          ],
        },
        'produit:decrire': { ok: true, texte: 'Une coupe nette, un lainage souple.' },
        'produit:enregistrer': { ok: true, modifie: true },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      },
    },
    {
      nom: 'fiche tenue par un collègue',
      id: 'p_0002',
      reponses: {
        'produit:contexte': _produitContexte(),
        'produit:lire': { ok: true, fiche: { id: 'p_0002', sku: 'HAU-0007', name: 'Chemisier de soie',
          category: 'hauts', price: 89.95, acquisitionCost: 31, weight: 0.2, active: true, variants: [], images: [] } },
        'produit:sku': { ok: true, sku: 'HAU-0007', configure: true },
        'produit:nipExige': { ok: true, exige: false },
        'photos:liste': { ok: true, session: true, photos: [] },
        'produit:brouillonLire': { ok: true, brouillon: null },
        'produit:changements': { ok: true, entrees: [] },
        'produit:historique': { ok: true, entrees: [] },
        // ⚠ LE VERROU REFUSÉ EST UN CAS NORMAL, pas une panne : deux personnes
        // ouvrent la même fiche tous les jours. La fenêtre doit le dire, nommer
        // qui tient la fiche, et ne pas laisser enregistrer.
        'verrou:prendre': { ok: true, obtenu: false, horsLigne: false, parQui: 'Marc Dubé' },
        identite: IDENTITE,
      },
    },
  ],

  /* ── AJUSTEMENT DE STOCK ───────────────────────────────────────────────────
     Formes relevées dans `assets/js/pont.js` (`stockContexte`, `stockReappro`,
     `stockLire`), pas inventées ici.

     ⚠ CE QUE CES CAS COUVRENT, ET POURQUOI CEUX-LÀ. La fenêtre s'ouvre SANS
     identifiant : elle dessine donc d'abord la liste de réachat, puis — et
     seulement si un produit est ouvert — la grille. Ouverte avec un identifiant,
     elle traverse en plus `stock:lire`, la construction des variantes et le
     verrou. Les deux chemins ne se ressemblent pas : n'éprouver que le premier
     laisserait la grille, c'est-à-dire tout ce qui compte, dans l'ombre. */
  'inventaire.js': [
    {
      nom: 'liste de réachat',
      id: '',
      reponses: {
        'stock:contexte': {
          ok: true, peutEcrire: true, seuilGeneral: 3, par: 'Brigitte Brousseau',
          entrepots: [
            { id: 'wh_0001', code: 'MTL-A', nom: 'Entrepôt principal' },
            { id: 'wh_0002', code: 'QC-B', nom: 'Boutique' },
          ],
        },
        // ⚠ Déjà TRIÉ par urgence quand il vient du pont : une rupture d'abord,
        // puis le plus proche de la rupture en proportion de son seuil.
        'stock:reappro': { ok: true, lignes: [
          { produitId: 'p_0001', nom: 'Robe cintrée', cle: 'M-Noir', taille: 'M',
            couleur: 'Noir', qte: 0, seuil: 4, rupture: true, sku: 'ROB-000001-M-01' },
          { produitId: 'p_0002', nom: 'Chemisier de soie', cle: 'P-Ivoire', taille: 'P',
            couleur: 'Ivoire', qte: 2, seuil: 6, rupture: false, sku: '' },
        ] },
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'grille ouverte',
      id: 'p_0001',
      reponses: {
        'stock:contexte': {
          ok: true, peutEcrire: true, seuilGeneral: 3, par: 'Brigitte Brousseau',
          entrepots: [{ id: 'wh_0001', code: 'MTL-A', nom: 'Entrepôt principal' }],
        },
        'stock:reappro': { ok: true, lignes: [] },
        'stock:lire': {
          ok: true,
          produit: { id: 'p_0001', nom: 'Robe cintrée', sku: 'ROB-000001', seuilHerite: 4 },
          entrepots: [{ id: 'wh_0001', code: 'MTL-A', nom: 'Entrepôt principal' }],
          variantes: [
            // En stock, avec emplacement : la ligne doit se peindre en actif.
            { cle: 'M-Noir', taille: 'M', couleur: 'Noir', sku: 'ROB-000001-M-01',
              teinte: '#000000', qte: 6, seuil: '', entrepot: 'wh_0001' },
            // ⚠ EN STOCK SANS EMPLACEMENT : c'est le cas qui doit se peindre en
            // rouge et refuser l'enregistrement. Sans lui, le garde ne serait
            // jamais traversé par le contrôle.
            { cle: 'G-Noir', taille: 'G', couleur: 'Noir', sku: 'ROB-000001-G-01',
              teinte: '#000000', qte: 3, seuil: '2', entrepot: '' },
            // ⚠ UNE TEINTE EN DÉGRADÉ : `colorNameToHex` en rend pour les couleurs
            // composées, et la pastille doit alors s'arrondir en carré au lieu de
            // traiter la chaîne comme une couleur unie.
            { cle: 'M-Bicolore', taille: 'M', couleur: 'Bicolore', sku: 'ROB-000001-M-00',
              teinte: 'linear-gradient(90deg,#000 50%,#fff 50%)', qte: 0, seuil: '', entrepot: '' },
            // Sans code de variante : la colonne doit afficher un tiret et NE PAS
            // proposer le bouton d'étiquettes.
            { cle: 'TP-Ivoire', taille: 'TP', couleur: 'Ivoire', sku: '',
              teinte: '#f3ece1', qte: 0, seuil: '', entrepot: '' },
          ],
          base: { stock: { 'M-Noir': 6, 'G-Noir': 3 }, locs: { 'M-Noir': 'wh_0001' } },
        },
        'verrou:prendre': VERROU,
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'lecture seule, sans entrepôt',
      id: 'p_0003',
      reponses: {
        // ⚠ Le droit de VOIR sans celui d'ÉCRIRE existe réellement : le bouton
        // doit se désarmer et le dire. Et sans aucun entrepôt configuré,
        // l'emplacement cesse d'être obligatoire — sinon plus rien ne
        // s'enregistrerait sur une boutique qui n'en a pas créé.
        'stock:contexte': { ok: true, peutEcrire: false, seuilGeneral: 3, par: 'Stagiaire', entrepots: [] },
        'stock:reappro': { ok: true, lignes: [] },
        'stock:lire': {
          ok: true,
          produit: { id: 'p_0003', nom: 'Foulard de laine', sku: '', seuilHerite: 3 },
          entrepots: [],
          variantes: [
            { cle: 'U-Gris', taille: 'U', couleur: 'Gris', sku: '',
              teinte: '#9aa3ad', qte: 1, seuil: '', entrepot: '' },
          ],
          base: { stock: { 'U-Gris': 1 }, locs: {} },
        },
        'verrou:prendre': VERROU,
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
  ],

  /* ── EXPÉDITION ────────────────────────────────────────────────────────────
     Formes relevées dans `assets/js/pont.js` (`expeditionContexte`,
     `expeditionLire`), pas inventées ici.

     ⚠ TROIS CAS, ET CHACUN COUVRE UN CHEMIN QUE LES AUTRES NE PRENNENT PAS :
     une commande prête à étiqueter (le chemin normal) ; une commande qui a DÉJÀ
     son étiquette (l'avertissement « facturé une seconde fois » et les boutons
     d'aperçu/impression actifs) ; et une commande dont le transporteur n'est pas
     configuré, où le bouton qui dépense doit être DÉSARMÉ. C'est ce dernier cas
     qui compte le plus : un bouton actif qui échoue toujours fait chercher la
     panne chez le transporteur au lieu de la configuration. */
  'expedition.js': [
    {
      nom: 'prête à étiqueter',
      id: 'ord_0007',
      reponses: {
        'expedition:contexte': {
          ok: true, peutExpedier: true, dernier: 'postes-canada',
          transporteurs: [
            { cle: 'postes-canada', nom: 'Postes Canada', pret: true, services: [
              { cle: 'DOM.EP', libelle: '⚡ Colis accéléré (DOM.EP)' },
              { cle: 'DOM.RP', libelle: '📦 Colis régulier (DOM.RP)' },
            ] },
            { cle: 'fedex', nom: 'FedEx', pret: true, services: [
              { cle: 'FEDEX_GROUND', libelle: '📦 FedEx Ground' },
            ] },
            // Un transporteur NON configuré, sans service : la fenêtre doit le
            // dire et désarmer, pas offrir une liste vide.
            { cle: 'ups', nom: 'UPS', pret: false, services: [] },
          ],
        },
        'expedition:lire': {
          ok: true,
          commande: { id: 'ord_0007', numero: 'SZ-100207', statut: 'preparing',
            transporteur: '', suivi: '', etiquetteLe: '', aUneEtiquette: false, articles: 3 },
          destinataire: { nom: 'Marie Tremblay', rue: '12 rue des Érables',
            ville: 'Québec', province: 'QC', codePostal: 'G1R 2B5', pays: 'CA', tel: '418 555-0142' },
          // ⚠ `estime: true` est le cas à éprouver : c'est le poids qui fixe le
          // prix de l'étiquette, et une estimation doit se voir.
          poids: { calcule: 1.24, estime: true, remboursements: 0 },
        },
        'verrou:prendre': VERROU,
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'étiquette déjà créée',
      id: 'ord_0008',
      reponses: {
        'expedition:contexte': {
          ok: true, peutExpedier: true, dernier: 'fedex',
          transporteurs: [
            { cle: 'postes-canada', nom: 'Postes Canada', pret: true, services: [
              { cle: 'DOM.EP', libelle: '⚡ Colis accéléré (DOM.EP)' } ] },
            { cle: 'fedex', nom: 'FedEx', pret: true, services: [
              { cle: 'FEDEX_GROUND', libelle: '📦 FedEx Ground' } ] },
          ],
        },
        'expedition:lire': {
          ok: true,
          commande: { id: 'ord_0008', numero: 'SZ-100208', statut: 'preparing',
            transporteur: 'fedex', suivi: '794612345678',
            etiquetteLe: '2026-08-07T14:02:00.000Z', aUneEtiquette: true, articles: 1 },
          destinataire: { nom: 'Luc Gagnon', rue: '400 boul. René-Lévesque',
            ville: 'Montréal', province: 'QC', codePostal: 'H2Z 1V1', pays: 'CA', tel: '' },
          poids: { calcule: 0.42, estime: false, remboursements: 1 },
        },
        'verrou:prendre': VERROU,
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'lecture seule, adresse incomplète',
      id: 'ord_0009',
      reponses: {
        // ⚠ Le droit de VOIR sans celui d'EXPÉDIER existe réellement.
        'expedition:contexte': {
          ok: true, peutExpedier: false, dernier: 'ups',
          transporteurs: [{ cle: 'ups', nom: 'UPS', pret: false, services: [] }],
        },
        'expedition:lire': {
          ok: true,
          commande: { id: 'ord_0009', numero: 'SZ-100209', statut: 'paid',
            transporteur: '', suivi: '', etiquetteLe: '', aUneEtiquette: false, articles: 2 },
          // ⚠ SANS CODE POSTAL : aucun transporteur n'accepterait l'envoi, et la
          // fenêtre doit le dire AVANT qu'on presse un bouton facturé.
          destinataire: { nom: 'Client sans adresse', rue: '', ville: '',
            province: '', codePostal: '', pays: 'CA', tel: '' },
          poids: { calcule: 0, estime: true, remboursements: 0 },
        },
        'verrou:prendre': VERROU,
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
  ],
};

// ⚠ LE CONTEXTE DU PRODUIT EST UNE FONCTION, PAS UNE CONSTANTE PARTAGÉE : chaque
// cas doit recevoir un objet NEUF. Une fenêtre qui trierait ou modifierait une de
// ces listes sur place contaminerait les cas suivants, et l'on chercherait
// longtemps pourquoi le troisième échoue alors que le premier passe.
function _produitContexte() {
  return {
    ok: true,
    categories: [
      { cle: 'robes', libelle: 'Robes' },
      { cle: 'hauts', libelle: 'Hauts' },
      { cle: 'chaussures', libelle: 'Chaussures' },
    ],
    tailles: ['TP', 'P', 'M', 'G', 'TG'],
    // ⚠ UNE COULEUR EN DÉGRADÉ : `colorNameToHex` rend parfois un
    // `linear-gradient(...)` pour les teintes composées, et la fenêtre doit le
    // poser tel quel en fond au lieu de le traiter comme une couleur unie.
    couleurs: [
      { nom: 'Noir', hex: '#000000', code: '01' },
      { nom: 'Bleu marine', hex: '#1b2a4a', code: '02' },
      { nom: 'Ivoire', hex: '#f3ece1', code: '' },
      { nom: 'Bicolore', hex: 'linear-gradient(90deg,#000 50%,#fff 50%)', code: '' },
    ],
    guides: [{ id: 'sg_0003', nom: 'Robes — femmes' }],
    // ⚠ UN ENTREPÔT PORTE SON CODE, jamais son identifiant interne : la liste
    // proposait « wh_0001 », qui n'est affiché nulle part ailleurs.
    entrepots: [
      { id: 'wh_0001', nom: 'MTL — Entrepôt principal' },
      { id: 'wh_0002', nom: 'QC — Boutique' },
    ],
    fournisseurs: [{ id: 'sup_0001', nom: 'Atelier Rivière' }],
    etiquettes: [{ cle: 'lbl:bio', libelle: 'Coton biologique' }],
    // Les deux modes de photo, parce que la catégorie en décide : « standard »
    // = une série de vues sans couleur ; sinon des vues par angle.
    modesPhoto: { robes: 'angles', hauts: 'standard', chaussures: 'angles' },
    vuesAngles: ['devant', 'derriere', 'coteG', 'coteD', 'autres'],
    genres: [{ cle: 'femme', libelle: 'Femme' }, { cle: 'unisexe', libelle: 'Unisexe' }],
    groupesAge: [{ cle: 'adulte', libelle: 'Adulte' }],
    styles: [{ cle: 'chic', libelle: 'Chic' }, { cle: 'decontracte', libelle: 'Décontracté' }],
    seuilDefaut: 3,
    peutAjouter: true, peutModifier: true,
  };
}
