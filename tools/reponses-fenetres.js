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
          // ⚠ Statut REEL du site (ORDER_STATUS) — le jeu portait « processing »,
          // qui n existe pas : un jeu qui ne ressemble pas a la vraie reponse
          // eprouve une fenetre qui n existe pas.
          statut: 'confirmed',
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
          // ⚠ « verification » : la fenetre doit arriver DIRECTEMENT a l etape 2,
          // SANS reposer la question du bon — la branche corrigee le 2026-08-07.
          statut: 'verification',
          dejaPret: true,
          suivi: '1Z999AA10123456784',
          transporteur: 'postes-canada',
          // La vraie forme depuis le 2026-08-08 : etiquette deja facturee,
          // priorite et notes — l'entete doit les dessiner au chargement.
          aUneEtiquette: true,
          prioritaire: true,
          notes: 'Fragile : verre souffle.',
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

  // ── TABLEAU DE BORD ────────────────────────────────────────────────────────
  'tableau.js': [
    {
      // Donnees pleines : chaque tuile a de quoi dessiner, l'avis de taux est
      // present, et les deux listes recentes ont plus d'une page.
      nom: 'journée chargée, taux de secours',
      id: '',
      reponses: {
        'tableau:lire': {
          ok: true,
          annee: 'all',
          annees: [2026, 2025],
          cfgTuiles: { revenue: false },
          tuiles: {
            produits: { actifs: 42, variantesReappro: 12, produitsBas: 4 },
            commandes: { total: 128, enAttente: 3 },
            clients: { actifs: 87, inactifs: 5 },
            revenus: { brut: 15230.5, rembourse: 320, net: 14910.5, factures: 96 },
            messagerie: 2, retoursNouveaux: 1, retoursExpirent: 1,
          },
          recentesCommandes: [
            { numero: 'SZ-100251', date: '2026-08-08T14:00:00Z', client: 'Josée Lafleur', total: 302.96, statut: 'pending', statutLibelle: 'En attente' },
            { numero: 'SZ-100249', date: '2026-08-08T11:00:00Z', client: 'Marc Dubé', total: 89.95, statut: 'shipped', statutLibelle: 'Expédiée' },
            { numero: 'SZ-100242', date: '2026-08-07T16:00:00Z', client: 'Anne Roy', total: 145.0, statut: 'delivered', statutLibelle: 'Livrée' },
            { numero: 'SZ-100238', date: '2026-08-07T09:00:00Z', client: 'Luc Simard', total: 45.0, statut: 'cancelled', statutLibelle: 'Annulée' },
          ],
          recentesFactures: [
            { numero: 'FAC-0002-47028', date: '2026-08-08T14:00:00Z', client: 'Josée Lafleur', total: 302.96, statut: 'paid', statutLibelle: 'Payée' },
            { numero: 'FAC-0002-46981', date: '2026-08-07T10:00:00Z', client: 'Marc Dubé', total: 89.95, statut: 'overdue', statutLibelle: 'En retard' },
          ],
          taux: { genre: 'secours', rate: 1.3567 },
        },
        'tableau:tuiles': { ok: true },
        'tableau:ouvrir': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      // Le refus de droit : la fenetre doit le dire, pas rester sur Chargement.
      nom: 'rôle sans tableau de bord',
      id: '',
      reponses: {
        'tableau:lire': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── PRODUITS EN VENTE (la liste) ───────────────────────────────────────────
  'produits.js': [
    {
      // ⚠ FORME REELLE de produits:liste (pont.js -> Admin._produitLigne) :
      // les trois etats de la pastille d inventaire (rupture, a commander,
      // seuil non atteint), un solde, une vente finale et une liquidation.
      nom: 'liste garnie',
      id: '',
      reponses: {
        'produits:liste': {
          ok: true,
          lignes: [
            { id: 'prod_1', nom: 'Robe Élégance mi-longue', categorie: 'Robes', tag: 'Nouveauté',
              finalSale: false, liquidation: false, prix: 129.99, solde: 89.99,
              stockTotal: 24, variantesBas: 0, bassesDetail: '', panier: 3, cree: '2026-08-05T10:00:00Z' },
            { id: 'prod_2', nom: 'Manteau d’hiver Aurore', categorie: 'Manteaux', tag: '',
              finalSale: true, liquidation: false, prix: 249.0, solde: 0,
              stockTotal: 0, variantesBas: 2, bassesDetail: 'S-Noir : 0/2, M-Noir : 0/2', panier: 0, cree: '2026-07-28T09:00:00Z' },
            { id: 'prod_3', nom: 'Jupe plissée Camélia', categorie: 'Jupes', tag: 'Solde',
              finalSale: false, liquidation: true, prix: 59.5, solde: 0,
              stockTotal: 7, variantesBas: 1, bassesDetail: 'M-Rouge : 1/3', panier: 1, cree: '2026-07-15T14:00:00Z' },
          ],
          total: 3, pages: 1, page: 0,
          cats: [{ cle: 'robes', nom: 'Robes' }, { cle: 'manteaux', nom: 'Manteaux' }, { cle: 'jupes', nom: 'Jupes' }],
          etiquettes: ['Nouveauté', 'Solde'],
          aFinal: true, aLiq: true,
          stats: { actifs: 3, ruptures: 1, venteFinale: 1, categories: 3 },
        },
        'produits:ouvrir': { ok: true },
        'produits:nouveau': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      // Le refus de droit : la fenetre doit le dire, pas rester sur Chargement.
      nom: 'rôle sans produits',
      id: '',
      reponses: {
        'produits:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── CARTES-CADEAUX ─────────────────────────────────────────────────────────
  'cartescadeaux.js': [
    {
      // ⚠ FORME REELLE de cartescadeaux:liste (coeur Promo._gcDonnees).
      nom: 'cartes garnies',
      id: '',
      reponses: {
        'cartescadeaux:liste': {
          ok: true, peutModifier: true,
          recompense: { enabled: true, type: 'percent', value: 10, expiryDays: 30 },
          tuiles: { actives: 2, total: 3, enCirculation: 125.50, emis: 250.00, utilisees: 1 },
          cartes: [
            { id: 'g1', code: 'SZ-A1B2-C3D4', destinataire: 'Marie Tremblay',
              courriel: 'marie@example.com', initial: 100, solde: 75.50,
              expediteur: 'SANDRIZA', date: '2026-07-12', statut: 'active',
              statutLibelle: 'Active', courrielEnvoye: true },
            { id: 'g2', code: 'SZ-E5F6-G7H8', destinataire: 'Julie Gagnon',
              courriel: 'julie@example.com', initial: 50, solde: 50,
              expediteur: 'Anne Roy', date: '2026-08-01', statut: 'pending',
              statutLibelle: 'Activation requise', courrielEnvoye: false },
            { id: 'g3', code: 'SZ-I9J0-K1L2', destinataire: 'Anne Roy',
              courriel: 'anne@example.com', initial: 100, solde: 0,
              expediteur: 'SANDRIZA', date: '2026-05-20', statut: 'used',
              statutLibelle: 'Utilisée', courrielEnvoye: true },
          ],
        },
        'cartescadeaux:lire': {
          ok: true,
          carte: { id: 'g1', code: 'SZ-A1B2-C3D4', destinataire: 'Marie Tremblay',
            courriel: 'marie@example.com', expediteur: 'SANDRIZA',
            courrielExpediteur: '', message: 'Bonne fête !', note: '',
            initial: 100, solde: 75.50, statut: 'active', date: '2026-07-12',
            transactions: [
              { date: '2026-08-01', commande: 'CMD-2026-0498', montant: 24.50, soldeApres: 75.50 },
            ] },
        },
        'cartescadeaux:creer': { ok: true, code: 'SZ-M3N4-O5P6', id: 'g4' },
        'cartescadeaux:activer': { ok: true, code: 'SZ-E5F6-G7H8' },
        'cartescadeaux:recompense': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'aucune carte',
      id: '',
      reponses: {
        'cartescadeaux:liste': {
          ok: true, peutModifier: false,
          recompense: { enabled: false, type: 'percent', value: 10, expiryDays: 30 },
          tuiles: { actives: 0, total: 0, enCirculation: 0, emis: 0, utilisees: 0 },
          cartes: [],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'cartescadeaux:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── ÉTAT DE COMPTE ─────────────────────────────────────────────────────────
  'etatcompte.js': [
    {
      // ⚠ FORME REELLE de etat:lire (coeur Billing._statementCorps) : `html`
      // est le DOCUMENT deja construit par le site, pose tel quel.
      nom: 'client avec solde',
      id: 'u1',
      reponses: {
        'etat:lire': {
          ok: true,
          nom: 'Marie Tremblay', courriel: 'marie@example.com',
          solde: 154.26, facture: 243.38, paye: 89.12,
          html: '<div class="statement-doc"><h1>ÉTAT DE COMPTE</h1>'
            + '<table><thead><tr><th>Facture</th><th>Statut</th></tr></thead>'
            + '<tbody><tr><td>FAC-2026-0512</td><td>✓ Payée</td></tr></tbody></table></div>',
        },
        'etat:imprimer': { ok: true },
        'etat:courriel': { ok: true, adresse: 'marie@example.com' },
        identite: IDENTITE,
      },
    },
    {
      // Sans adresse au dossier : le bouton d envoi reste eteint et le dit.
      nom: 'sans adresse courriel',
      id: 'u2',
      reponses: {
        'etat:lire': {
          ok: true, nom: 'Client Comptoir', courriel: '',
          solde: 0, facture: 45.00, paye: 45.00,
          html: '<div class="statement-doc"><h1>ÉTAT DE COMPTE</h1></div>',
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'client introuvable',
      id: 'zz',
      reponses: {
        'etat:lire': { ok: false, motif: 'introuvable' },
        identite: IDENTITE,
      },
    },
  ],

  // ── PAIEMENTS SQUARE ───────────────────────────────────────────────────────
  'paiements.js': [
    {
      // ⚠ FORME REELLE de paiements:lire (coeur Payments._paiementsDonnees).
      nom: 'annee chargee (bac a sable)',
      id: '',
      reponses: {
        'paiements:lire': {
          ok: true, annee: 2026, annees: [2026, 2025],
          connecte: true, mode: 'sandbox', bacASable: true, peutModifier: true,
          masquees: 3, charge: true,
          tuiles: { nb: 2, brut: 244.38, frais: 7.42, fraisRecuperes: 1.10,
            fraisNets: 6.32, rembourse: 25.00, nbRemboursements: 1, net: 213.06 },
          paiements: [
            { ref: 'A1B2C3D4E5F6', date: '7 août 2026', moyen: 'VISA ···4242',
              brut: 154.26, frais: 4.77, net: 149.49 },
            { ref: 'F6E5D4C3B2A1', date: '2 août 2026', moyen: 'MASTERCARD ···5100',
              brut: 90.12, frais: 2.65, net: 87.47 },
          ],
          remboursements: [
            { ref: 'R9R8R7R6R5R4', paiement: 'F6E5D4C3B2A1', date: '5 août 2026',
              motif: 'Article retourné', enAttente: false, montant: 25.00 },
          ],
          reconciliation: {
            marque: 'SANDRIZA', nbCommandes: 2, nbSquare: 2, nbRemboursementsSquare: 1,
            site: { brut: 244.38, rembourse: 25.00, fraisRetenus: 1.10, fraisRembourses: 0, net: 218.28 },
            square: { brut: 244.38, rembourse: 25.00, frais: 7.42, net: 211.96 },
            ecart: -6.32, equilibre: false,
          },
        },
        'paiements:charger': { ok: true, nb: 2, nbRemboursements: 1 },
        'paiements:masquer': { ok: true, nb: 3 },
        'paiements:reafficher': { ok: true, nb: 3 },
        identite: IDENTITE,
      },
    },
    {
      // Connecte, mais RIEN en cache : la fenetre invite a charger.
      nom: 'rien en memoire',
      id: '',
      reponses: {
        'paiements:lire': {
          ok: true, annee: 2026, annees: [2026], connecte: true, mode: 'production',
          bacASable: false, peutModifier: true, masquees: 0, charge: false,
          tuiles: null, paiements: [], remboursements: [], reconciliation: null,
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'square non configure',
      id: '',
      reponses: {
        'paiements:lire': {
          ok: true, annee: 2026, annees: [2026], connecte: false, mode: 'sandbox',
          bacASable: true, peutModifier: false, masquees: 0, charge: false,
          tuiles: null, paiements: [], remboursements: [], reconciliation: null,
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'paiements:lire': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── ARCHIVES ───────────────────────────────────────────────────────────────
  'archives.js': [
    {
      // ⚠ FORME REELLE de archives:liste (lignes du coeur Admin._archivesDonnees).
      nom: 'archives garnies',
      id: '',
      reponses: {
        'archives:liste': {
          ok: true, peutRembourser: true, peutReactiver: true,
          commandes: [
            { id: 'o1', num: 'CMD-2026-0412', date: '12 mai 2026', client: 'Marie Tremblay',
              courriel: 'marie@example.com', total: '154,26 $', statut: 'Livrée',
              rembourse: false, archivee: '27 juin 2026' },
            { id: 'o2', num: 'CMD-2026-0398', date: '2 mai 2026', client: 'Julie Gagnon',
              courriel: 'julie@example.com', total: '89,12 $', statut: 'Livrée',
              rembourse: true, archivee: '17 juin 2026' },
          ],
          retours: [
            { id: 'r1', num: 'CMD-2026-0355', date: '20 avr. 2026', client: 'Anne Roy',
              courriel: 'anne@example.com', statut: 'Complétée', motif: 'Taille trop petite',
              archivee: '10 juin 2026' },
          ],
          factures: [
            { id: 'f1', num: 'FAC-2026-0412', commande: 'CMD-2026-0412', date: '12 mai 2026',
              client: 'Marie Tremblay', courriel: 'marie@example.com', manuel: false,
              total: '154,26 $', statut: 'paid', archivee: '27 juin 2026' },
          ],
          remboursements: [
            { id: 'rb1', num: 'RMB-000031', date: '2026-06-01', commande: 'CMD-2026-0398',
              commandeId: 'o2', client: 'Julie Gagnon', type: 'Original',
              total: '89,12 $', archivee: '17 juin 2026' },
          ],
        },
        'archives:ouvrir': { ok: true },
        'archives:reactiver': { ok: true, num: 'CMD-2026-0412' },
        identite: IDENTITE,
      },
    },
    {
      nom: 'archives vides',
      id: '',
      reponses: {
        'archives:liste': { ok: true, peutRembourser: false, peutReactiver: false,
          commandes: [], retours: [], factures: [], remboursements: [] },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'archives:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── NOTES DES MISES À JOUR ─────────────────────────────────────────────────
  'notes.js': [
    {
      // ⚠ FORME REELLE de notes:lire (les entrees NOTES de pont.js, brutes).
      nom: 'notes garnies',
      id: '',
      reponses: {
        'notes:lire': {
          ok: true, installee: '1.59.2', recentes: 12,
          entrees: [
            { v: '1.59.2', d: '2026-08-09', t: 'Les notes en fenêtre native',
              r: 'La boîte du site était la dernière surface web de l’application.',
              s: [{ h: 'Comment ça marche', p: ['Deux onglets, une entrée par version, dépliable.'] }] },
            { v: '1.59.1', d: '2026-08-09', t: 'Planifier un ramassage dans la fenêtre',
              r: 'Le formulaire s’ouvre dans la fenêtre native.', s: [] },
          ],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'sans session',
      id: '',
      reponses: {
        'notes:lire': { ok: false, motif: 'session' },
        identite: IDENTITE,
      },
    },
  ],

  // ── MESSAGERIE CLIENTS ─────────────────────────────────────────────────────
  'messagerie.js': [
    {
      // ⚠ FORME REELLE de messagerie:liste (Admin._messagerieLigne) et :lire.
      nom: 'demandes en attente',
      id: '',
      reponses: {
        'messagerie:liste': {
          ok: true, onglet: 'pending',
          comptes: { attente: 2, repondues: 5, toutes: 7 },
          lignes: [
            { id: 'sup_1', commande: 'CMD-0002-22010', client: 'Josée Lafleur',
              courriel: 'josee@exemple.ca', raison: 'Question sur ma commande',
              statut: 'pending', date: '2026-08-08' },
            { id: 'sup_2', commande: 'CMD-0002-21970', client: 'Marc Dubé',
              courriel: 'marc@exemple.ca', raison: 'Article manquant',
              statut: 'pending', date: '2026-08-07' },
          ],
        },
        'messagerie:lire': {
          ok: true, id: 'sup_1', commande: 'CMD-0002-22010', client: 'Josée Lafleur',
          courriel: 'josee@exemple.ca', raison: 'Question sur ma commande',
          statut: 'pending', date: '2026-08-08',
          message: 'Bonjour, ma commande est-elle partie ? Merci.',
          reponse: '', reponduLe: '',
        },
        'messagerie:repondre': { ok: true, courriel: true },
        'messagerie:supprimer': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'rôle sans messagerie',
      id: '',
      reponses: {
        'messagerie:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── AVIS PRODUITS ──────────────────────────────────────────────────────────
  'avis.js': [
    {
      // ⚠ FORME REELLE d avis:liste (Admin._avisLigne) et avis:lire.
      nom: 'file de moderation',
      id: '',
      reponses: {
        'avis:liste': {
          ok: true, onglet: 'pending',
          comptes: { attente: 2, traites: 5, masques: 1, publies: 4, moyenne: 4.25 },
          lignes: [
            { id: 'rev_1', statut: 'pending', note: 5, produit: 'Robe Élégance mi-longue',
              client: 'Josée Lafleur', verifie: true, date: '2026-08-08' },
            { id: 'rev_2', statut: 'pending', note: 2, produit: 'Manteau d’hiver Aurore',
              client: 'Marc Dubé', verifie: false, date: '2026-08-07' },
          ],
          total: 2, pages: 1, page: 0,
        },
        'avis:lire': {
          ok: true, id: 'rev_1', statut: 'pending', note: 5, produit: 'Robe Élégance mi-longue',
          client: 'Josée Lafleur', verifie: true, date: '2026-08-08',
          titre: 'Superbe qualité', texte: 'La robe tombe parfaitement, la couleur est fidèle aux photos.',
          reponse: '', reponduLe: '', approuveLe: '', commande: 'CMD-0002-22010',
          taille: 'M', langue: 'Français', photos: 1,
        },
        'avis:approuver': { ok: true, statut: 'published' },
        'avis:masquer': { ok: true, statut: 'hidden' },
        'avis:repondre': { ok: true },
        'avis:supprimer': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'rôle sans avis',
      id: '',
      reponses: {
        'avis:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── RAMASSAGES ET RAPPORT ──────────────────────────────────────────────────
  'ramassages.js': [
    {
      // ⚠ FORME REELLE de ramassages:liste (Admin._ramassagesDonnees) : un
      // planifie et un annule (les deux etats de la pastille).
      nom: 'ramassages garnis',
      id: '',
      reponses: {
        'ramassages:liste': {
          ok: true,
          lignes: [
            { id: 'pk_1', transporteur: 'Postes Canada', logo: '📮', date: '2026-08-11',
              colis: 3, annule: false, confirmation: '0087512345', par: 'Bobby Brousseau',
              annulePar: '', commandes: ['CMD-0002-22010', 'CMD-0002-21988'] },
            { id: 'pk_2', transporteur: 'FedEx', logo: '📦', date: '2026-08-08',
              colis: 1, annule: true, confirmation: 'PU77821', par: 'Bobby Brousseau',
              annulePar: 'Bobby Brousseau', commandes: ['CMD-0002-21970'] },
          ],
        },
        'ramassages:annuler': { ok: true },
        'ramassages:planifier': { ok: true, date: '2026-08-11', total: 4,
          parties: ['Postes Canada ✓ (réf 0087512399)', 'FedEx ✓ (conf. PU77900)'], echec: false },
        'ramassages:preparer': {
          ok: true, date: '2026-08-11', adresse: '6845 rue Eugène-Achard, Québec QC', total: 4,
          groupes: [
            { cle: 'postes-canada', nom: 'Postes Canada', logo: '📮', colis: 3,
              commandes: ['CMD-0002-22010', 'CMD-0002-21988', 'CMD-0002-21970'], api: true },
            { cle: 'purolator', nom: 'Purolator', logo: '📦', colis: 1,
              commandes: ['CMD-0002-21944'], api: false },
          ],
        },
        // FORME REELLE d expeditions:rapport (Admin._rapportTransporteursDonnees).
        'expeditions:rapport': {
          ok: true, total: 4, totalFrais: 61.8,
          transporteurs: [
            { cle: 'postes-canada', nom: 'Postes Canada', logo: '📮', colis: 3, frais: 45.3, moyen: 15.1 },
            { cle: 'fedex', nom: 'FedEx', logo: '📦', colis: 1, frais: 16.5, moyen: 16.5 },
          ],
          expeditions: [
            { numero: 'CMD-0002-22010', date: '2026-08-07T14:00:00Z', transporteur: 'Postes Canada',
              logo: '📮', suivi: '7023210987654321', frais: 15.1, livree: false, ramasse: true },
            { numero: 'CMD-0002-21988', date: '2026-08-06T10:00:00Z', transporteur: 'FedEx',
              logo: '📦', suivi: '1Z999AA10123456784', frais: 16.5, livree: true, ramasse: false },
          ],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'rôle sans expéditions',
      id: '',
      reponses: {
        'ramassages:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── IMPRESSION DE CODES-BARRES ─────────────────────────────────────────────
  'codesbarres.js': [
    {
      // ⚠ FORME REELLE de codesbarres:liste / codesbarres:produit (pont.js) :
      // un produit avec SKU (stock bas), un en rupture, un SANS SKU.
      nom: 'liste garnie',
      id: '',
      reponses: {
        'codesbarres:liste': {
          ok: true,
          lignes: [
            { id: 'prod_1', sku: 'ROB-0001', nom: 'Robe Élégance mi-longue', categorie: 'Robes', stock: 24, bas: false },
            { id: 'prod_2', sku: 'MAN-0002', nom: 'Manteau d’hiver Aurore', categorie: 'Manteaux', stock: 0, bas: true },
            { id: 'prod_3', sku: '', nom: 'Jupe plissée Camélia', categorie: 'Jupes', stock: 7, bas: false },
          ],
          total: 3, pages: 1, page: 0,
          cats: [{ cle: 'robes', nom: 'Robes' }, { cle: 'manteaux', nom: 'Manteaux' }, { cle: 'jupes', nom: 'Jupes' }],
        },
        'codesbarres:produit': {
          ok: true, id: 'prod_1', nom: 'Robe Élégance mi-longue',
          variantes: [
            { taille: 'S', couleur: 'Noir', sku: 'ROB-0001-S-NOI', stock: 8 },
            { taille: 'M', couleur: 'Noir', sku: 'ROB-0001-M-NOI', stock: 0 },
            { taille: 'M', couleur: 'Rouge', sku: 'ROB-0001-M-ROU', stock: 16 },
          ],
        },
        'stock:etiquettes': { ok: true, envoyees: 24, imprimante: 'Zebra ZD410' },
        identite: IDENTITE,
      },
    },
    {
      nom: 'rôle sans inventaire',
      id: '',
      reponses: {
        'codesbarres:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── CLIENTS (la liste) ─────────────────────────────────────────────────────
  'clients.js': [
    {
      // ⚠ FORME REELLE de clients:liste (pont.js -> Admin._clientLigne).
      nom: 'liste garnie',
      id: '',
      reponses: {
        'clients:liste': {
          ok: true,
          lignes: [
            { id: 'usr_1', nom: 'Josée Lafleur', courriel: 'josee@exemple.ca', commandes: 12,
              achats: 1450.25, actif: true, supprime: false, cree: '2025-11-02T10:00:00Z' },
            { id: 'usr_2', nom: 'Marc Dubé', courriel: 'marc@exemple.ca', commandes: 1,
              achats: 89.95, actif: false, supprime: false, cree: '2026-03-14T09:00:00Z' },
            { id: 'usr_3', nom: 'Anne Roy', courriel: 'anne@exemple.ca', commandes: 0,
              achats: 0, actif: false, supprime: true, cree: '2026-01-20T15:00:00Z' },
          ],
          total: 3, pages: 1, page: 0, onglet: 'active',
          comptes: { actifs: 42, inactifs: 5, supprimes: 2 },
        },
        'clients:ouvrir': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'rôle sans clients',
      id: '',
      reponses: {
        'clients:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── NOS COLLECTIONS (la liste) ─────────────────────────────────────────────
  'collections.js': [
    {
      // ⚠ FORME REELLE de collections:liste (pont.js).
      nom: 'liste garnie',
      id: '',
      reponses: {
        'collections:liste': {
          ok: true,
          lignes: [
            { id: 'col_1', nom: 'Élégance d’automne', saison: 'Automne 2026', articles: 14,
              active: true, description: 'Les pièces chaudes de la saison.', cree: '2026-08-01T10:00:00Z' },
            { id: 'col_2', nom: 'Soirées d’été', saison: 'Été 2026', articles: 8,
              active: false, description: '', cree: '2026-05-10T10:00:00Z' },
          ],
        },
        'collections:ouvrir': { ok: true },
        'collections:nouvelle': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'rôle sans collections',
      id: '',
      reponses: {
        'collections:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── FOURNISSEURS (la liste) ────────────────────────────────────────────────
  'fournisseurs.js': [
    {
      // ⚠ FORME REELLE de fournisseurs:liste (pont.js -> Admin._fournisseurLigne).
      nom: 'liste garnie',
      id: '',
      reponses: {
        'fournisseurs:liste': {
          ok: true,
          total: 2,
          lignes: [
            { id: 'sup_1', nom: 'Frank Lyman Design', contact: 'Julie Caron',
              courriel: 'wholesale@franklyman.com', telephone: '514-384-3000',
              site: 'franklyman.com', categories: ['Robes', 'Hauts'], actif: true },
            { id: 'sup_2', nom: 'Emballages Préstige', contact: '',
              courriel: 'ventes@emballages-prestige.ca', telephone: '',
              site: '', categories: [], actif: false },
          ],
        },
        'fournisseurs:ouvrir': { ok: true },
        'fournisseurs:nouveau': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'rôle sans fournisseurs',
      id: '',
      reponses: {
        'fournisseurs:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── NOS RETOURS (la liste) ─────────────────────────────────────────────────
  'retours.js': [
    {
      // ⚠ FORME REELLE de retours:liste (pont.js -> Admin._retourLigne) :
      // une expiration imminente, une etiquette reelle, un suivi.
      nom: 'liste garnie',
      id: '',
      reponses: {
        'retours:liste': {
          ok: true,
          onglet: 'pending',
          comptes: { pending: 2, approved: 1, in_transit: 1, expiring_soon: 1,
            received: 0, disputed: 0, rejected: 1, completed: 3, all: 8 },
          lignes: [
            { id: 'ret_1', commande: 'CMD-0002-22010', client: 'Josée Lafleur',
              courriel: 'josee@exemple.ca', motif: 'Taille trop petite', statut: 'pending',
              statutLibelle: 'En attente', date: '2026-08-07T14:00:00Z',
              expireBientot: true, expireLe: '2026-08-12', expireAuto: false,
              suivi: '', etiquette: '', fraisBoutique: false },
            { id: 'ret_2', commande: 'CMD-0002-21988', client: 'Marc Dubé',
              courriel: 'marc@exemple.ca', motif: 'Couleur différente des photos', statut: 'pending',
              statutLibelle: 'En attente', date: '2026-08-06T09:00:00Z',
              expireBientot: false, expireLe: '', expireAuto: false,
              suivi: '1Z999AA10123456784', etiquette: 'reelle', fraisBoutique: true },
          ],
        },
        'retours:ouvrir': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'rôle sans retours',
      id: '',
      reponses: {
        'retours:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── FACTURES (la liste) ────────────────────────────────────────────────────
  'factures.js': [
    {
      // FORME REELLE de factures:liste depuis 1.61.0 : lignes + tuiles +
      // droits + clients (etat de compte). Les gestes paraissent.
      nom: 'facturation complete',
      id: '',
      reponses: {
        'factures:liste': {
          ok: true,
          lignes: [
            { id: 'i1', numero: 'FAC-2026-0512', commande: 'CMD-2026-0512',
              client: 'Marie Tremblay', courriel: 'marie@example.com',
              date: '2026-08-01T10:00:00Z', echeance: '2026-08-31T10:00:00Z',
              total: 154.26, statut: 'unpaid', statutLibelle: 'Non payée' },
            { id: 'i2', numero: 'FAC-2026-0498', commande: 'CMD-2026-0498',
              client: 'Julie Gagnon', courriel: 'julie@example.com',
              date: '2026-07-15T10:00:00Z', echeance: '2026-08-14T10:00:00Z',
              total: 89.12, statut: 'paid', statutLibelle: 'Payée' },
          ],
          tuiles: { total: 243.38, encaisse: 89.12, aRecevoir: 154.26,
            rembourse: 25.00, nbRemboursements: 1, depenses: 1200.50,
            annee: 2026, nb: 2 },
          peutEncaisser: true, peutSupprimer: true,
          clients: [
            { id: 'u1', nom: 'Marie Tremblay', courriel: 'marie@example.com' },
            { id: 'u2', nom: 'Julie Gagnon', courriel: 'julie@example.com' },
          ],
        },
        'factures:ouvrir': { ok: true },
        'factures:payer': { ok: true, num: 'FAC-2026-0512' },
        'factures:supprimer': { ok: true, num: 'FAC-2026-0512' },
        'factures:etat': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      // VIEUX SITE : factures:liste sans tuiles ni droits ni clients — la
      // fenetre cache tuiles et gestes et reste une liste de consultation.
      nom: 'vieux site (liste seule)',
      id: '',
      reponses: {
        'factures:liste': {
          ok: true,
          lignes: [
            { id: 'i1', numero: 'FAC-2026-0512', commande: 'CMD-2026-0512',
              client: 'Marie Tremblay',
              date: '2026-08-01T10:00:00Z', echeance: '2026-08-31T10:00:00Z',
              total: 154.26, statut: 'unpaid', statutLibelle: 'Non payée' },
          ],
        },
        'factures:ouvrir': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'liste vide',
      id: '',
      reponses: {
        'factures:liste': { ok: true, lignes: [] },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'factures:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

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
            // ⚠ CES CHAMPS-LÀ SONT CEUX QUE LA FENÊTRE LIT (remplir) : sans
            // eux, ni la photo, ni les jetons, ni la carte des variantes de
            // couleur ne se dessinaient au chargement — le jeu n'atteignait
            // pas le dessin qu'il prétendait éprouver.
            image: IMAGE,
            sizes: ['M', 'G'],
            colors: ['Noir', 'Bleu marine'],
            stock: { 'M-Noir': 4 },
            // ⚠ Le VRAI nom du champ — « stockLoc » n'existe pas dans le
            // modèle produit, et un jeu d'essai qui l'emploierait cacherait
            // le défaut au lieu de l'exposer (vécu : les emplacements ne
            // s'affichaient jamais dans la fenêtre).
            warehouseLocations: { 'M-Noir': 'wh_0001' },
            additionalImages: { devant: IMAGE },
            // Une variante déjà générée : la case « Bleu marine » doit la
            // montrer (mode AUTO pour « robes »).
            colorVariants: { 'Bleu marine': { main: IMAGE } },
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
        'produit:teinter': { ok: true, image: IMAGE, hex: '#1b2a4a' },
        'produit:enregistrer': { ok: true, modifie: true },
        'verrou:prendre': VERROU,
        identite: IDENTITE,
      },
    },
    {
      // ⚠ LA BRANCHE MANUELLE ET LES FORMES HÉRITÉES : « chaussures » est en
      // couleursAuto:false (cases cliquables, pas de « Tout générer »), la
      // fiche porte une photo par couleur sous l'ANCIENNE clé « principale »
      // (1.40.1→1.43.0) et une vue sous une clé « libre » en mode angles —
      // les deux traductions de la reprise doivent tourner au chargement.
      nom: 'couleurs manuelles, formes héritées',
      id: 'p_0003',
      reponses: {
        'produit:contexte': _produitContexte(),
        'produit:lire': {
          ok: true,
          fiche: {
            id: 'p_0003', sku: 'CHA-0002', name: 'Escarpins de cuir',
            category: 'chaussures', price: 149.95, acquisitionCost: 61,
            weight: 0.6, active: true,
            image: IMAGE,
            sizes: ['36', '37'],
            colors: ['Noir', 'Ivoire'],
            additionalImages: { libre1: IMAGE },
            colorVariants: { 'Ivoire': { principale: IMAGE } },
          },
        },
        'produit:sku': { ok: true, sku: 'CHA-0002', configure: true },
        'produit:nipExige': { ok: true, exige: false },
        'produit:nip': { ok: true, valide: true, exige: false },
        'photos:liste': { ok: true, session: true, photos: [] },
        'produit:brouillonLire': { ok: true, brouillon: null },
        'produit:brouillonEcrire': { ok: true },
        'produit:brouillonJeter': { ok: true },
        'produit:changements': { ok: true, entrees: [] },
        'produit:historique': { ok: true, entrees: [] },
        'produit:decrire': { ok: true, texte: '' },
        'produit:teinter': { ok: false, motif: 'couleur_non_mappee',
          detail: '« Ivoire » n’a pas de teinte unie attribuée.' },
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
        'verrou:prendre': { ok: true, obtenu: false, horsLigne: false, parQui: 'mdube' },
        identite: IDENTITE,
      },
    },
  ],

  /* ── INVENTAIRE (les quatre onglets) ───────────────────────────────────────
     Formes relevées dans `assets/js/pont.js` (`stockContexte`, `stockProduits`,
     `stockReappro`, `stockLire`, `stockEndommages`, `stockEntrepots`), pas
     inventées ici.

     ⚠ CE QUE CES CAS COUVRENT, ET POURQUOI CEUX-LÀ. La fenêtre s'ouvre sur
     l'onglet PRODUITS ; « onglet:… » l'ouvre sur un autre onglet, et un
     identifiant de produit ouvre la grille directement. Chaque onglet a donc
     son cas — sans quoi son dessin ne serait JAMAIS traversé au banc — et la
     grille garde ses deux cas d'origine (écriture, et lecture seule sans
     entrepôt). Les gestes (clics d'onglet, mode lot, édition d'entrepôt)
     restent hors de portée du banc : à éprouver à la main. */
  'inventaire.js': [
    {
      nom: 'liste des produits',
      id: '',
      reponses: {
        'stock:contexte': {
          ok: true, peutEcrire: true, seuilGeneral: 3, par: 'Brigitte Brousseau',
          entrepots: [
            { id: 'wh_0001', code: 'MTL-A', nom: 'Entrepôt principal' },
            { id: 'wh_0002', code: 'QC-B', nom: 'Boutique' },
          ],
        },
        // ⚠ Les deux BANDEAUX (sans SKU, quatre chiffres) et chaque PASTILLE
        // d'état ont leur ligne : rupture, à commander, sans SKU, vente finale,
        // pas en vente. En retirer une laisserait ce dessin-là dans l'ombre.
        'stock:produits': {
          ok: true,
          stats: { total: 4, inventories: 3, sansSku: 1, rupture: 1, aCommander: 2, unites: 27 },
          pad6: { n: 2, avant: 'ROB-0001', apres: 'ROB-000001' },
          cats: [
            { cle: 'robes', nom: 'Robes', couleur: '#c084fc' },
            { cle: 'hauts', nom: 'Hauts', couleur: '#60a5fa' },
          ],
          peutEcrire: true, peutAjouter: true, peutSupprimer: true,
          total: 4, page: 0, pages: 1, parPage: 25,
          lignes: [
            { id: 'p_0001', sku: 'ROB-0001', nom: 'Robe cintrée', categorie: 'robes',
              categorieNom: 'Robes', couleurCat: '#c084fc', tailles: 4, couleurs: 2,
              unites: 14, basses: 2, enVente: true, venteFinale: false },
            { id: 'p_0002', sku: 'HAU-000012', nom: 'Chemisier de soie', categorie: 'hauts',
              categorieNom: 'Hauts', couleurCat: '#60a5fa', tailles: 3, couleurs: 1,
              unites: 0, basses: 0, enVente: false, venteFinale: false },
            { id: 'p_0003', sku: 'HAU-000013', nom: 'Cardigan côtelé', categorie: 'hauts',
              categorieNom: 'Hauts', couleurCat: '#60a5fa', tailles: 3, couleurs: 2,
              unites: 9, basses: 0, enVente: true, venteFinale: true },
            { id: 'p_0004', sku: '', nom: 'Foulard de laine', categorie: 'accessoires',
              categorieNom: 'Accessoires', couleurCat: '', tailles: 1, couleurs: 1,
              unites: 4, basses: 0, enVente: false, venteFinale: false },
          ],
        },
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'liste de réachat',
      id: 'onglet:reappro',
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
      nom: 'produits endommagés',
      id: 'onglet:endommages',
      reponses: {
        'stock:contexte': {
          ok: true, peutEcrire: true, seuilGeneral: 3, par: 'Brigitte Brousseau',
          entrepots: [
            { id: 'wh_0001', code: 'MTL-A', nom: 'Entrepôt principal' },
            { id: 'wh_0002', code: 'QC-B', nom: 'Boutique' },
          ],
        },
        'stock:endommages': {
          ok: true, annees: [2026, 2025], totalQte: 3, totalValeur: 187.5,
          lignes: [
            { date: '2026-07-12T14:05:00Z', commande: 'SZ-100184', nom: 'Robe cintrée',
              qte: 2, prix: 62.5, raison: 'Couture déchirée au retour' },
            { date: '2026-03-02T10:00:00Z', commande: 'SZ-100122', nom: 'Cardigan côtelé',
              qte: 1, prix: 62.5, raison: 'Taché — non revendable' },
          ],
        },
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'entrepôts',
      id: 'onglet:entrepots',
      reponses: {
        'stock:contexte': {
          ok: true, peutEcrire: true, seuilGeneral: 3, par: 'Brigitte Brousseau',
          entrepots: [
            { id: 'wh_0001', code: 'MTL-A', nom: 'Entrepôt principal' },
            { id: 'wh_0002', code: 'QC-B', nom: 'Boutique' },
          ],
        },
        // ⚠ Un emplacement UTILISÉ et un LIBRE : la corbeille du premier doit
        // porter l'avertissement, celle du second l'infobulle « Supprimer ».
        'stock:entrepots': {
          ok: true, peutAjouter: true, peutEcrire: true, peutSupprimer: true,
          lignes: [
            { id: 'wh_0001', code: 'MTL-A', reference: 'Rangée du fond', usage: 12 },
            { id: 'wh_0002', code: 'QC-B', reference: '', usage: 0 },
          ],
        },
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
        // La grille s'ouvre par-dessus : l'onglet Produits charge derrière, et
        // cette réponse minimale suffit — c'est la GRILLE qu'on éprouve ici.
        'stock:produits': {
          ok: true,
          stats: { total: 1, inventories: 1, sansSku: 0, rupture: 0, aCommander: 0, unites: 6 },
          pad6: { n: 0 }, cats: [], peutEcrire: true, peutAjouter: true, peutSupprimer: false,
          total: 0, page: 0, pages: 1, parPage: 25, lignes: [],
        },
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
        'stock:produits': {
          ok: true,
          stats: { total: 1, inventories: 0, sansSku: 1, rupture: 0, aCommander: 0, unites: 1 },
          pad6: { n: 0 }, cats: [], peutEcrire: false, peutAjouter: false, peutSupprimer: false,
          total: 0, page: 0, pages: 1, parPage: 25, lignes: [],
        },
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

  /* ── LES DEUX LISTES ───────────────────────────────────────────────────────
     ⚠ LE MÊME FICHIER SERT LES DEUX VUES, et le contrôle doit donc les éprouver
     TOUTES LES DEUX : la fabrique reçoit 'commandes' ou 'expeditions', et les
     deux ne dessinent pas les mêmes colonnes (articles d'un côté, numéro de
     suivi de l'autre), ni les mêmes jetons de statut, ni les mêmes boutons.
     N'en éprouver qu'une laisserait la moitié du fichier dans l'ombre.
     ⚠ `id` porte ici le MODE, pas un identifiant de fiche : c'est ce que la
     fabrique `pageCommandes(mode)` attend. */
  /* ── FACTURE ────────────────────────────────────────────────────────────────
     Le document arrive PRÊT du site (facture:lire) : la fenêtre n'a qu'à le
     poser sur son papier. Le jeu porte un document minimal mais REEL dans sa
     forme (classes .invoice-*), et un style non vide. */
  'facture.js': [
    {
      nom: 'facture payée',
      id: 'inv_0001',
      reponses: {
        'facture:lire': {
          ok: true, numero: 'FAC-2026-0117',
          css: '.invoice-doc{background:#fff;padding:2rem}.invoice-status-banner.paid{background:#dcfce7;color:#166534}',
          html: '<div class="invoice-doc"><div class="invoice-status-banner paid">✓ PAYÉE</div>'
            + '<div class="invoice-header"><div class="invoice-logo">SANDRIZA</div>'
            + '<div class="invoice-meta"><div class="invoice-num">FAC-2026-0117</div></div></div>'
            + '<table class="invoice-table"><tbody><tr><td>Robe cintrée</td><td>M</td>'
            + '<td>Noir</td><td>2</td><td>89,99 $</td><td>179,98 $</td></tr></tbody></table>'
            + '<div class="invoice-totals"><div class="invoice-total-row grand">'
            + '<span>TOTAL</span><span>206,93 $</span></div></div></div>',
        },
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
  ],

  'commandes.js': [
    /* ⚠ LE DÉTAIL S'ÉPROUVE PAR « mode@identifiant » : le banc ne clique pas,
       et sans ce cas la vue détail (statut, remboursements, frais retenus,
       actions) ne serait JAMAIS traversée. Le jeu porte : des quantités
       remboursées (la mention « remb. »), deux taxes aux taux figés, des frais
       retenus PARTIELLEMENT remboursés (le badge « Partiel — … reste … »),
       et tous les droits pour que chaque bouton du pied se dessine. */
    {
      nom: 'détail d’une commande',
      id: 'commandes@ord_0007',
      reponses: {
        'commandes:contexte': {
          ok: true, peutEditer: true, peutExpedier: true,
          statuts: [
            { cle: 'pending', libelle: 'En attente' },
            { cle: 'confirmed', libelle: 'Confirmée' },
            { cle: 'preparing', libelle: 'En préparation' },
            { cle: 'verification', libelle: 'Vérification' },
            { cle: 'shipped', libelle: 'En livraison' },
            { cle: 'delivered', libelle: 'Livrée' },
            { cle: 'cancelled', libelle: 'Annulée' },
          ],
          annees: [2026],
        },
        'commandes:detail': {
          ok: true,
          commande: {
            id: 'ord_0007', numero: 'SZ-100207', statut: 'preparing',
            creeLe: '2026-08-05T14:00:00Z', livreLe: '', prioritaire: true,
            notes: 'Emballage cadeau demandé.',
            paiementSquare: 'PAY_abc123', afterpay: false, membre: true, aFacture: true,
            suivi: '', suiviStatut: '', suiviVerifieLe: '',
            client: { nom: 'Marie Tremblay', entreprise: '', courriel: 'marie@example.com', tel: '418 555-0142' },
            adresse: { rue: '12 rue des Érables', ville: 'Québec', province: 'QC', cp: 'G1R 2B5' },
          },
          articles: [
            { nom: 'Robe cintrée', taille: 'M', couleur: 'Noir', qte: 2, montant: 179.98, rembourseQte: 1 },
            { nom: 'Foulard de laine', taille: 'U', couleur: 'Gris', qte: 1, montant: 39.99, rembourseQte: 0 },
          ],
          totaux: {
            sousTotal: 219.97,
            taxes: [
              { nom: 'TPS', taux: 0.05, montant: 11.0 },
              { nom: 'TVQ', taux: 0.09975, montant: 21.94 },
            ],
            livraison: 12.99, prioritaire: 5.0, coupon: 10.0, total: 260.9,
          },
          remboursements: {
            lignes: [
              { numero: 'RMB-0001', date: '2026-08-06T10:00:00Z', type: 'Moyen original',
                montant: 89.99, fraisRetenus: 2.75 },
              { numero: 'RMB-0002', date: '2026-08-06T15:00:00Z', type: 'Frais de service',
                montant: 1.0, fraisRetenus: 0 },
            ],
            total: 90.99, complet: false,
            fraisRetenus: 2.75, fraisRembourses: 1.0, fraisRestants: 1.75,
          },
          statuts: [
            { cle: 'pending', libelle: 'En attente' },
            { cle: 'confirmed', libelle: 'Confirmée' },
            { cle: 'preparing', libelle: 'En préparation' },
            { cle: 'verification', libelle: 'Vérification' },
            { cle: 'shipped', libelle: 'En livraison' },
            { cle: 'delivered', libelle: 'Livrée' },
            { cle: 'cancelled', libelle: 'Annulée' },
          ],
          droits: { statut: true, supprimer: true, rembourser: true, frais: true, bon: true },
        },
        'verrou:prendre': VERROU,
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'commandes en cours',
      id: 'commandes',
      reponses: {
        'commandes:contexte': {
          ok: true, peutEditer: true, peutExpedier: true,
          statuts: [
            { cle: 'pending', libelle: 'En attente' },
            { cle: 'confirmed', libelle: 'Confirmée' },
            { cle: 'preparing', libelle: 'En préparation' },
            { cle: 'verification', libelle: 'Vérification' },
            { cle: 'shipped', libelle: 'En livraison' },
            { cle: 'delivered', libelle: 'Livrée' },
            { cle: 'cancelled', libelle: 'Annulée' },
          ],
          annees: [2026, 2025],
        },
        'commandes:liste': {
          ok: true, mode: 'commandes', total: 2, page: 0, pages: 1, parPage: 20,
          // ⚠ Une ligne PRIORITAIRE et un compte non nul : sans eux, l'éclair et
          // le compte du bouton « Prioritaires » ne seraient jamais dessinés.
          prioritairesNonTraitees: 1,
          lignes: [
            { id: 'ord_0011', numero: 'SZ-100211', prioritaire: true, date: '2026-08-06T15:20:00.000Z',
              client: 'Marie Tremblay', ville: 'Québec', total: 149.41, statut: 'preparing',
              transporteur: '', suivi: '', articles: 3,
              // ⚠ ÉTIQUETÉE MAIS PAS PARTIE : la ligne doit se teinter. C'est
              // l'état qui se perd le plus facilement, entre l'impression et le
              // dépôt au comptoir.
              aUneEtiquette: true },
            { id: 'ord_0012', numero: 'SZ-100212', date: '2026-08-07T09:02:00.000Z',
              client: 'Luc Gagnon', ville: '', total: 67.5, statut: 'pending',
              transporteur: '', suivi: '', articles: 1, aUneEtiquette: false },
          ],
        },
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'expéditions',
      id: 'expeditions',
      reponses: {
        'commandes:contexte': {
          ok: true, peutEditer: true, peutExpedier: true,
          statuts: [
            { cle: 'shipped', libelle: 'En livraison' },
            { cle: 'delivered', libelle: 'Livrée' },
          ],
          annees: [2026],
        },
        'commandes:liste': {
          ok: true, mode: 'expeditions', total: 2, page: 0, pages: 1, parPage: 20,
          lignes: [
            { id: 'ord_0013', numero: 'SZ-100213', date: '2026-08-01T12:00:00.000Z',
              client: 'Anne Roy', ville: 'Lévis', total: 220, statut: 'shipped',
              transporteur: 'postes-canada', suivi: '1234567890123456', articles: 2,
              aUneEtiquette: true },
            // ⚠ EXPÉDIÉE SANS NUMÉRO : c'est un cas légitime (remise en main
            // propre, cueillette) et la colonne doit le DIRE, pas rester vide.
            { id: 'ord_0014', numero: 'SZ-100214', date: '2026-07-28T12:00:00.000Z',
              client: 'Paul Côté', ville: 'Montréal', total: 89.95, statut: 'delivered',
              transporteur: '', suivi: '', articles: 1, aUneEtiquette: false },
          ],
        },
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'liste vide, lecture seule',
      id: 'commandes',
      reponses: {
        'commandes:contexte': {
          ok: true, peutEditer: false, peutExpedier: false,
          statuts: [{ cle: 'pending', libelle: 'En attente' }], annees: [],
        },
        'commandes:liste': { ok: true, mode: 'commandes', total: 0, page: 0, pages: 1,
          parPage: 20, lignes: [] },
        'session:activite': { ok: true },
        identite: IDENTITE,
      },
    },
  ],
  /* ── RETOUR ────────────────────────────────────────────────────────────────
     Formes relevées dans assets/js/pont.js (retourLire), pas inventées.
     ⚠ QUATRE CAS, chacun pour un chemin distinct : la photo absente (dossier non
     actionnable), l'approbation avec étiquette réelle déjà émise (avertissement
     « facturé une seconde fois » + boutons d'aperçu), le dossier REÇU (les trois
     étapes ouvertes, remboursement suggéré avec un 2 pour 1 réduit de moitié et
     un envoi HORS fenêtre — crédit seulement), et le litige en lecture seule. */
  'retour.js': (function(){
    const etiquette = {
      transporteurs: [
        { cle: 'postes-canada', nom: 'Postes Canada' },
        { cle: 'fedex', nom: 'FedEx' },
      ],
      cpPret: true,
      services: [
        { cle: 'DOM.EP', libelle: '⚡ Colis accéléré (DOM.EP)' },
        { cle: 'DOM.RP', libelle: '📦 Colis régulier (DOM.RP)' },
      ],
      poidsCalcule: 0.62,
    };
    const modeles = [
      'Remboursement émis avec succès. Merci de votre compréhension.',
      'Crédit boutique émis conformément à notre politique de retour.',
    ];
    const articles = [
      { productId: 'p_0001', nom: 'Robe cintrée', quantite: 1, prix: 129.95, taille: 'M', couleur: 'Noir' },
      { productId: 'p_0002', nom: 'Chemisier de soie', quantite: 1, prix: 89.95, taille: 'P', couleur: 'Ivoire' },
    ];
    const demandeBase = {
      id: 'ret_0001', commande: 'CMD-0002-22010', commandeId: 'ord_0002',
      client: 'Marie Tremblay', courriel: 'marie@example.com',
      creeLe: '2026-08-01T14:00:00.000Z', motif: 'Taille trop petite',
      description: 'La robe taille petit, je préfère un remboursement.',
      modeRemboursement: 'any', preference: 'credit', fraisPayesPar: 'customer',
      fauteMarchande: false, notes: '', noteRefus: '', photo: IMAGE,
      suivi: '', suiviTransporteur: '', aUneEtiquette: false, etiquetteReelle: false,
      etiquetteTransporteur: '', etiquetteLe: '', litige: null, echange: null,
    };
    return [
      {
        nom: 'photo manquante',
        id: 'ret_0001',
        reponses: {
          'retour:lire': { ok: true, archive: false, peutEcrire: true,
            demande: Object.assign({}, demandeBase, { statut: 'awaiting_photo', photo: '' }),
            articles, remboursement: null, etiquette, modeles },
          'verrou:prendre': VERROU,
          'session:activite': { ok: true },
        },
      },
      {
        nom: 'approuvée, étiquette réelle émise',
        id: 'ret_0001',
        reponses: {
          'retour:lire': { ok: true, archive: false, peutEcrire: true,
            demande: Object.assign({}, demandeBase, { statut: 'approved',
              aUneEtiquette: true, etiquetteReelle: true, etiquetteTransporteur: 'postes-canada',
              etiquetteLe: '2026-08-02T10:00:00.000Z', suivi: '1234567890123456',
              suiviTransporteur: 'Postes Canada' }),
            articles,
            remboursement: { lignes: [
                { nom: 'Robe cintrée', base: 129.95, montant: 129.95, moitie: false },
                { nom: 'Chemisier de soie', base: 89.95, montant: 44.98, moitie: true } ],
              livraisonBase: 12.5, prioritaireExclu: 0,
              joursOuvrables: 6, joursFenetre: 15, dansFenetre: true, squareDisponible: true },
            etiquette, modeles },
          'verrou:prendre': VERROU,
          'session:activite': { ok: true },
        },
      },
      {
        nom: 'reçue — hors fenêtre, crédit seulement',
        id: 'ret_0002',
        reponses: {
          'retour:lire': { ok: true, archive: false, peutEcrire: true,
            demande: Object.assign({}, demandeBase, { id: 'ret_0002', statut: 'received',
              fauteMarchande: true }),
            articles,
            // ⚠ HORS fenêtre : le moyen original doit être DÉSARMÉ, crédit coché.
            remboursement: { lignes: [
                { nom: 'Robe cintrée', base: 129.95, montant: 129.95, moitie: false } ],
              livraisonBase: 12.5, prioritaireExclu: 8,
              joursOuvrables: 22, joursFenetre: 15, dansFenetre: false, squareDisponible: true },
            etiquette, modeles },
          'verrou:prendre': VERROU,
          'session:activite': { ok: true },
        },
      },
      {
        nom: 'litige, lecture seule',
        id: 'ret_0003',
        reponses: {
          'retour:lire': { ok: true, archive: false, peutEcrire: false,
            demande: Object.assign({}, demandeBase, { id: 'ret_0003', statut: 'disputed',
              litige: { message: 'Le colis a été déposé au comptoir le 12.',
                preuve: IMAGE, recuLe: '2026-08-05T09:00:00.000Z' } }),
            articles, remboursement: null, etiquette, modeles },
          'verrou:prendre': { ok: true, obtenu: false, horsLigne: false, parQui: 'mdube' },
          'session:activite': { ok: true },
        },
      },
    ];
  })(),

  /* ── REMBOURSEMENT ─────────────────────────────────────────────────────────
     Formes relevées dans assets/js/pont.js (remboursementLire / Totaux).
     ⚠ TROIS CAS : remboursable avec Square (frais + NIP configuré — le chemin
     de l'argent complet), SANS Square (le moyen original doit être DÉSARMÉ,
     crédit seul), et déjà remboursée (aucun bouton, le constat seulement). */
  'remboursement.js': [
    {
      nom: 'remboursable, Square et NIP',
      id: 'ord_0002',
      reponses: {
        'remboursement:lire': { ok: true, numero: 'CMD-0002-22010', statut: 'shipped',
          complet: false, dejaRembourse: 44.98,
          articles: [
            { productId: 'p_0001', nom: 'Robe cintrée', taille: 'M', couleur: 'Noir', prix: 129.95, maxQty: 1 },
            { productId: 'p_0002', nom: 'Chemisier de soie', taille: 'P', couleur: 'Ivoire', prix: 89.95, maxQty: 2 },
          ],
          livraison: { cout: 12.5, prioritaire: false, nonExpediee: false },
          squareDisponible: true,
          frais: { commande: 6.42, baseHT: 232.4 },
          nipConfigure: true,
          taxes: [{ nom: 'TPS', taux: 0.05 }, { nom: 'TVQ', taux: 0.09975 }] },
        'remboursement:totaux': { ok: true, sousTotal: 129.95, livraison: 0,
          taxes: [{ nom: 'TPS', taux: 0.05, montant: 6.5 }, { nom: 'TVQ', taux: 0.09975, montant: 12.96 }],
          total: 149.41, frais: 3.59, net: 145.82, retenu: true, nbArticles: 1 },
        'remboursement:nip': { ok: true, valide: true, libre: false },
        'verrou:prendre': VERROU,
        'session:activite': { ok: true },
      },
    },
    {
      nom: 'sans Square — crédit seulement',
      id: 'ord_0005',
      reponses: {
        'remboursement:lire': { ok: true, numero: 'CMD-0005-31220', statut: 'confirmed',
          complet: false, dejaRembourse: 0,
          articles: [
            { productId: 'p_0003', nom: 'Foulard de laine', taille: '', couleur: '', prix: 34.95, maxQty: 1 },
          ],
          livraison: { cout: 0, prioritaire: false, nonExpediee: true },
          squareDisponible: false,
          frais: { commande: 1.28, baseHT: 34.95 },
          nipConfigure: false,
          taxes: [{ nom: 'TPS', taux: 0.05 }, { nom: 'TVQ', taux: 0.09975 }] },
        'remboursement:totaux': { ok: true, sousTotal: 34.95, livraison: 0,
          taxes: [{ nom: 'TPS', taux: 0.05, montant: 1.75 }, { nom: 'TVQ', taux: 0.09975, montant: 3.49 }],
          total: 40.19, frais: 0, net: 40.19, retenu: false, nbArticles: 1 },
        'verrou:prendre': VERROU,
        'session:activite': { ok: true },
      },
    },
    {
      nom: 'déjà entièrement remboursée',
      id: 'ord_0006',
      reponses: {
        'remboursement:lire': { ok: true, numero: 'CMD-0006-31555', statut: 'delivered',
          complet: true, dejaRembourse: 149.41, articles: [],
          livraison: { cout: 12.5, prioritaire: false, nonExpediee: false },
          squareDisponible: true,
          frais: { commande: 4.48, baseHT: 142.45 }, nipConfigure: false, taxes: [] },
        'verrou:prendre': VERROU,
        'session:activite': { ok: true },
      },
    },
  ],

  /* ── CLIENT ────────────────────────────────────────────────────────────────
     Formes relevées dans assets/js/pont.js (clientLire). Trois cas : actif
     complet (commandes + retours + purge impossible... non — actif), SUPPRIMÉ
     AVEC commandes (le bouton de purge ne doit PAS apparaître, la fiche doit
     dire pourquoi), et lecture seule. */
  'client.js': (function(){
    const base = {
      ok: true, peutEcrire: true, peutSupprimer: true,
      client: { id: 'u_0001', prenom: 'Marie', nom: 'Tremblay',
        courriel: 'marie@example.com', tel: '418 555-0142', langue: 'fr',
        actif: true, supprime: false, inscritLe: '2026-05-02T10:00:00.000Z', supprimeLe: '',
        adresse: { rue: '12 rue des Érables', ville: 'Québec', province: 'QC',
          codePostal: 'G1R 2B5', pays: 'Canada' } },
      stats: { commandes: 8, retours: 1, totalDepense: 1240.55 },
      dernieres: [
        { id: 'ord_0011', numero: 'SZ-100211', date: '2026-08-06T15:20:00.000Z', total: 149.41, statut: 'preparing' },
        { id: 'ord_0009', numero: 'SZ-100209', date: '2026-07-28T09:00:00.000Z', total: 89.95, statut: 'delivered' },
      ],
      provinces: ['QC','ON','BC','AB','MB','SK','NS','NB','NL','PE','NT','NU','YT'],
      purgeable: false,
    };
    return [
      {
        nom: 'client actif',
        id: 'u_0001',
        reponses: {
          'client:lire': base,
          'verrou:prendre': VERROU,
          'session:activite': { ok: true },
        },
      },
      {
        nom: 'supprimé avec commandes — purge refusée',
        id: 'u_0002',
        reponses: {
          'client:lire': Object.assign({}, base, {
            client: Object.assign({}, base.client, { id: 'u_0002', prenom: 'Luc', nom: 'Gagnon',
              courriel: 'luc@example.com', actif: false, supprime: true,
              supprimeLe: '2026-08-01T12:00:00.000Z' }),
            // ⚠ purgeable: false AVEC des commandes : le bouton de purge ne doit
            // pas apparaître, et la fiche doit dire les 6 ans de conservation.
            stats: { commandes: 3, retours: 0, totalDepense: 402.1 },
            purgeable: false,
          }),
          'verrou:prendre': VERROU,
          'session:activite': { ok: true },
        },
      },
      {
        nom: 'lecture seule',
        id: 'u_0003',
        reponses: {
          'client:lire': Object.assign({}, base, {
            peutEcrire: false, peutSupprimer: false,
            client: Object.assign({}, base.client, { id: 'u_0003', prenom: 'Anne', nom: 'Roy',
              courriel: 'anne@example.com' }),
            stats: { commandes: 0, retours: 0, totalDepense: 0 },
            dernieres: [],
          }),
          'verrou:prendre': { ok: true, obtenu: false, horsLigne: false, parQui: 'mdube' },
          'session:activite': { ok: true },
        },
      },
    ];
  })(),

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
    // ⚠ « hauts » ABSENT à dessein : une catégorie hors de cette carte est en
    // mode AUTO (absente = activée, la règle de l'éditeur du site).
    couleursAuto: { robes: true, chaussures: false },
    vuesAngles: ['devant', 'derriere', 'coteG', 'coteD', 'autres'],
    genres: [{ cle: 'femme', libelle: 'Femme' }, { cle: 'unisexe', libelle: 'Unisexe' }],
    groupesAge: [{ cle: 'adulte', libelle: 'Adulte' }],
    styles: [{ cle: 'chic', libelle: 'Chic' }, { cle: 'decontracte', libelle: 'Décontracté' }],
    seuilDefaut: 3,
    peutAjouter: true, peutModifier: true,
  };
}
