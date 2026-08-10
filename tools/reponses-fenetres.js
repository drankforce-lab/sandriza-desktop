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
// Les chiffres fiscaux d'une annee garnie, partages par les cas de impot.js.
const DONNEES_IMPOT = {
          ok: true, annee: 2026, annees: [2026, 2025], onglet: 'taxes', peutModifier: true,
          profil: { complet: true, nom: 'Sandriza', neq: '1234567890',
            tps: '123456789 RT0001', tvq: '1234567890 TQ0001' },
          taxes: {
            ventesNettes: '42 180,00 $', nbCommandes: 137,
            tps: '2 109,00 $', tvq: '4 207,46 $', total: '6 316,46 $',
            rembourse: '412,55 $', nbRemb: 3, rembSousTotal: '360,00 $',
            rembTps: '18,00 $', rembTvq: '35,91 $',
            cti: '210,93 $', rti: '420,80 $', ctiTotal: '631,73 $',
            tpsRemettre: '1 898,07 $', tvqRemettre: '3 786,66 $',
            totalRemettre: '5 684,73 $', enFaveur: false, aucunCredit: false,
            souSeuil: false, seuil: '30 000,00 $',
            // ⚠ La PST : elle ne se declare PAS sur les memes formulaires.
            pst: [{ province: 'BC', montant: '84,20 $' }, { province: 'SK', montant: '31,05 $' }],
            trimestres: [
              { libelle: 'T1 — jan · fév · mar', indice: 0, n: 30, net: '9 100,00 $', tps: '455,00 $', tvq: '907,73 $', total: '1 362,73 $' },
              { libelle: 'T2 — avr · mai · juin', indice: 1, n: 41, net: '12 400,00 $', tps: '620,00 $', tvq: '1 236,90 $', total: '1 856,90 $' },
              { libelle: 'T3 — juil · août · sep', indice: 2, n: 39, net: '11 980,00 $', tps: '599,00 $', tvq: '1 194,90 $', total: '1 793,90 $' },
              { libelle: 'T4 — oct · nov · déc', indice: 3, n: 27, net: '8 700,00 $', tps: '435,00 $', tvq: '867,83 $', total: '1 302,83 $' },
            ],
            mensuel: [
              { mois: 'Janvier', n: 9, net: '2 800,00 $', tps: '140,00 $', tvq: '279,30 $' },
              { mois: 'Février', n: 10, net: '3 100,00 $', tps: '155,00 $', tvq: '309,23 $' },
              { mois: 'Mars', n: 11, net: '3 200,00 $', tps: '160,00 $', tvq: '319,20 $' },
            ],
          },
          revenus: {
            brut: '43 900,00 $', remises: '1 360,00 $', rembourse: '360,00 $', nbRemb: 3,
            livraison: '1 240,00 $', totalRevenus: '43 420,00 $',
            depenses: '9 870,00 $', benefice: '33 550,00 $', perte: false,
            categories: [
              { libelle: 'Site web, logiciels (SaaS)', ligne: '9270', montant: '1 240,00 $' },
              { libelle: 'Publicité', ligne: '8521', montant: '5 400,00 $' },
              { libelle: 'Livraison, transport, messagerie', ligne: '9275', montant: '3 230,00 $' },
            ],
            mensuel: [
              { mois: 'Jan', net: '2 800,00 $', brutN: 2800 },
              { mois: 'Fév', net: '3 100,00 $', brutN: 3100 },
              { mois: 'Mar', net: '3 200,00 $', brutN: 3200 },
            ],
            maxMois: 3200,
          },
          square: { brut: '48 200,00 $', frais: '1 410,00 $', net: '46 790,00 $', n: 131 },
        };

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

  // ── JOURNAL D'ENVOI ────────────────────────────────────────────────────────
  'journal.js': [
    {
      // ⚠ FORME REELLE de journal:liste (coeur Newsletter._journalDonnees).
      nom: 'journal garni',
      id: '',
      reponses: {
        'journal:liste': {
          ok: true, peutModifier: true, total: 3, envoyes: 2, echecs: 1,
          lignes: [
            { date: '08-08-2026 10:12', genre: 'Campagne', reference: 'Soldes d’été',
              courriel: 'marie@example.com', envoye: true, test: false, detail: 're_abc123' },
            { date: '08-08-2026 10:12', genre: 'Campagne', reference: 'Soldes d’été',
              courriel: 'julie@example.com', envoye: false, test: false,
              detail: 'adresse rejetée par le serveur' },
            { date: '05-08-2026 09:00', genre: 'Chaîne', reference: 'Bienvenue (étape 1)',
              courriel: 'anne@example.com', envoye: true, test: true, detail: 're_def456' },
          ],
        },
        'journal:vider': { ok: true, efface: 3 },
        identite: IDENTITE,
      },
    },
    {
      nom: 'journal vide',
      id: '',
      reponses: {
        'journal:liste': { ok: true, peutModifier: true, total: 0, envoyes: 0, echecs: 0, lignes: [] },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'journal:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── ABONNÉS DE L'INFOLETTRE ────────────────────────────────────────────────
  'abonnes.js': [
    {
      // ⚠ FORME REELLE de abonnes:liste (coeur Newsletter._abonnesDonnees).
      nom: 'liste garnie',
      id: '',
      reponses: {
        'abonnes:liste': {
          ok: true, peutModifier: true, actifs: 2, desabonnes: 1,
          abonnes: [
            { id: 'a1', courriel: 'marie@example.com', prenom: 'Marie', source: 'footer',
              sourceLibelle: 'Pied de page', date: '2026-07-12', actif: true, retireLe: '' },
            { id: 'a2', courriel: 'julie@example.com', prenom: '', source: 'checkout',
              sourceLibelle: 'Commande', date: '2026-06-30', actif: true, retireLe: '' },
            { id: 'a3', courriel: 'anne@example.com', prenom: 'Anne', source: 'import',
              sourceLibelle: 'Import', date: '2026-05-02', actif: false, retireLe: '2026-07-01' },
          ],
        },
        'abonnes:ajouter': { ok: true, courriel: 'nouvelle@example.com', reactive: false },
        'abonnes:basculer': { ok: true, courriel: 'marie@example.com', actif: false },
        'abonnes:supprimer': { ok: true, courriel: 'anne@example.com' },
        'abonnes:importer': { ok: true, lues: 5, ajoutes: 3, deja: 1, refuses: 1 },
        identite: IDENTITE,
      },
    },
    {
      nom: 'aucun abonne',
      id: '',
      reponses: {
        'abonnes:liste': { ok: true, peutModifier: true, actifs: 0, desabonnes: 0, abonnes: [] },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'abonnes:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── CAMPAGNES ET CHAÎNES DE L'INFOLETTRE ───────────────────────────────────
  // ⚠ DEUX CAS D'OUVERTURE, et ce n'est pas du zèle : l'onglet Campagnes et
  // l'onglet Chaînes ne traversent pas le même dessin. Le second s'ouvre par
  // l'argument de page (id = 'chaines'), comme le fait PAGES_ANCRABLES pour la
  // vue par défaut.
  'campagnes.js': [
    {
      // ⚠ FORME REELLE de campagnes:liste (coeur Newsletter._campagnesDonnees).
      nom: 'campagnes garnies',
      id: '',
      reponses: {
        'campagnes:liste': {
          ok: true, peutModifier: true, resendPret: true, modeTest: false, courrielTest: '',
          expediteur: 'SANDRIZA <infolettre@sandriza.com>',
          abonnesActifs: 412, smsPret: true, smsDestinataires: 88,
          envoyees: 3, brouillons: 2, courrielsEnvoyes: 1180, courrielsEchoues: 4,
          campagnes: [
            { id: 'camp_0007', nom: 'Rentrée — nouveautés', sujet: 'Les nouveautés de la rentrée',
              segment: 'all', segmentLibelle: 'Tous les abonnés', canal: 'email',
              canalLibelle: 'Courriel', etat: 'draft', etatLibelle: 'Brouillon',
              envoyes: 0, echecs: 0, date: '', creeLe: '2026-08-07', destinataires: 412 },
            { id: 'camp_0006', nom: 'Soldes d’été', sujet: 'Jusqu’à 40 % de réduction',
              segment: 'clients', segmentLibelle: 'Clients avec commandes', canal: 'both',
              canalLibelle: 'Courriel + SMS', etat: 'sent', etatLibelle: 'Envoyée',
              envoyes: 388, echecs: 2, date: '2026-07-21', creeLe: '2026-07-20', destinataires: 296 },
          ],
        },
        'campagnes:envoyer': { ok: true, nom: 'Rentrée — nouveautés', envoyes: 412, echecs: 0,
          modeTest: false, courrielTest: '' },
        'campagnes:supprimer': { ok: true, nom: 'Rentrée — nouveautés', etaitEnvoyee: false },
        identite: IDENTITE,
      },
    },
    {
      // ⚠ FORME REELLE de chaines:liste (coeur Newsletter._chainesDonnees).
      nom: 'chaines garnies',
      id: 'chaines',
      reponses: {
        'chaines:liste': {
          ok: true, peutModifier: true, envoisPermis: true, actives: 1, enAttente: 14, dues: 5,
          chaines: [
            { id: 'chain_0002', nom: 'Bienvenue', description: 'Trois messages après l’inscription',
              declencheur: 'subscribe', declencheurLibelle: 'Nouvel abonné', active: true,
              inscriptionsActives: 14, inscriptionsFinies: 121,
              etapes: [
                { no: 1, delai: 'Immédiat', sujet: 'Bienvenue chez Sandriza' },
                { no: 2, delai: 'J+3', sujet: 'Nos coupes, expliquées' },
                { no: 3, delai: 'J+7', sujet: 'Votre code de bienvenue expire bientôt' },
              ] },
            { id: 'chain_0001', nom: 'Panier abandonné', description: '',
              declencheur: 'abandoned_cart', declencheurLibelle: 'Panier abandonné', active: false,
              inscriptionsActives: 0, inscriptionsFinies: 42, etapes: [] },
          ],
        },
        'chaines:basculer': { ok: true, nom: 'Bienvenue', active: false, nuage: true, enCours: 14 },
        'chaines:supprimer': { ok: true, nom: 'Panier abandonné', perdues: 0, nuage: true },
        'chaines:traiter': { ok: true, traitees: 5, envoyes: 5, echecs: 0 },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'campagnes:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── STATISTIQUES (GOOGLE ANALYTICS + TÉLÉPHONIE) ───────────────────────────
  // ⚠ DEUX CAS D'OUVERTURE : l'onglet Google Analytics et l'onglet Téléphonie
  // dessinent des choses complètement différentes. Le second s'ouvre par
  // l'argument de page (id = 'tel').
  'statistiques.js': [
    {
      // ⚠ FORME REELLE de stats:ga (coeur Admin._statsGaCoeur).
      nom: 'analytics garni',
      id: '',
      reponses: {
        'stats:ga': {
          ok: true, plage: '7d', plageLibelle: '7 jours',
          totaux: { visiteurs: 1284, sessions: 1791, pagesVues: 5320 },
          engagement: { dureeMoyenne: '2m14', rebond: '38,4 %', pagesParSession: '3,0',
            engagement: '61,6 %' },
          serie: [
            { date: '2026-08-03', vues: 640, visiteurs: 180 },
            { date: '2026-08-04', vues: 810, visiteurs: 202 },
            { date: '2026-08-05', vues: 0, visiteurs: 0 },
          ],
          pages: [
            { titre: 'Robes d’été', chemin: '/produit/robe-lin', vues: 940 },
            { titre: 'Accueil', chemin: '/', vues: 720 },
          ],
          pays: [{ nom: 'Canada', visiteurs: 1100 }, { nom: 'États-Unis', visiteurs: 140 }],
          villes: [{ nom: 'Québec', visiteurs: 410 }, { nom: 'Montréal', visiteurs: 380 }],
          appareils: [{ nom: 'Mobile', visiteurs: 790 }, { nom: 'Ordinateur', visiteurs: 470 }],
          sources: [{ nom: 'google', sessions: 900 }, { nom: 'instagram', sessions: 410 }],
          nouveauxConnus: [{ nom: 'Nouveaux visiteurs', visiteurs: 860 },
            { nom: 'Visiteurs connus', visiteurs: 424 }],
        },
        identite: IDENTITE,
      },
    },
    {
      // ⚠ FORME REELLE de stats:telephonie (coeur Admin._statsTelephonieCoeur).
      nom: 'telephonie garnie',
      id: 'tel',
      reponses: {
        'stats:telephonie': {
          ok: true, jours: 30,
          totaux: { appels: 62, entrants: 48, repondus: 51, manques: 11, minutes: 137,
            dureeMoyenne: '2m41', cout: '4,18 $US' },
          solde: '18,42 $US',
          serie: [{ date: '2026-08-06', appels: 4 }, { date: '2026-08-07', appels: 9 }],
          appels: [
            { de: '+14185550199', sens: 'entrant', statut: 'terminé', duree: 184,
              cout: '0,0170 $US', date: '2026-08-07 14:22:03' },
            { de: '+15145550142', sens: 'entrant', statut: 'sans réponse', duree: 0,
              cout: '', date: '2026-08-07 09:01:44' },
          ],
        },
        identite: IDENTITE,
      },
    },
    {
      // Le refus BLOQUANT : la fenetre doit le dire, pas rester vide en silence.
      nom: 'analytics non configure',
      id: '',
      reponses: {
        'stats:ga': { ok: false, motif: 'ga_sans_cle' },
        identite: IDENTITE,
      },
    },
  ],

  // ── FISCALITÉ ET IMPÔT ─────────────────────────────────────────────────────
  // ⚠ FORME RÉELLE de impot:donnees (cœur Admin._impotDonnees). TROIS cas
  // d'ouverture : les trois onglets ne partagent aucun dessin, et « Documents »
  // est celui qui déclenche des IMPRIMÉS fiscaux — il ne peut pas rester non
  // éprouvé. Plus un profil incomplet, qui doit se signaler en haut.
  'impot.js': [
    { nom: 'TPS / TVQ', id: '', reponses: { 'impot:donnees': DONNEES_IMPOT, identite: IDENTITE } },
    { nom: 'revenus', id: 'revenus',
      reponses: { 'impot:donnees': Object.assign({}, DONNEES_IMPOT, { onglet: 'revenus' }), identite: IDENTITE } },
    { nom: 'documents', id: 'documents',
      reponses: { 'impot:donnees': Object.assign({}, DONNEES_IMPOT, { onglet: 'documents' }),
        'impot:document': { ok: true, annee: 2026, trimestre: 0 }, identite: IDENTITE } },
    {
      // ⚠ PROFIL INCOMPLET : un document imprimé sans numéro de taxe n'est pas
      // recevable, et l'on ne s'en aperçoit qu'après l'avoir envoyé.
      nom: 'profil incomplet',
      id: 'documents',
      reponses: {
        'impot:donnees': Object.assign({}, DONNEES_IMPOT, { onglet: 'documents',
          profil: { complet: false, nom: '', neq: '', tps: '', tvq: '' } }),
        identite: IDENTITE,
      },
    },
  ],

  // ── CONCILIATION BANCAIRE ──────────────────────────────────────────────────
  // ⚠ FORME RÉELLE de banque:donnees (cœur BankRec._banqueDonnees).
  // SIX cas, et chacun dessine autre chose :
  //   « liste » est l'écran d'entrée ;
  //   les QUATRE onglets ne partagent aucun dessin, et trois d'entre eux ne
  //     s'atteignent qu'au clic — sans état d'ouverture, aucun jeu ne les
  //     dessinerait jamais, et ils seraient vus pour la première fois en
  //     production (c'est exactement le trou qu'on a payé sur l'annuaire) ;
  //   « verrouillée » est le cas où TOUS les boutons d'écriture disparaissent :
  //     s'il n'était pas éprouvé, on ne saurait pas si l'écran se dessine
  //     encore une fois la pièce close.
  'banque.js': (function(){
    var REC = {
      id: 'rec_0001', label: 'Conciliation juillet 2026', status: 'in_progress',
      notes: 'Le dépôt du 31 arrive le 2 août — reporté au mois suivant.',
      createdAt: '2026-08-01T12:00:00Z', updatedAt: '2026-08-09T12:00:00Z', lockedAt: null,
      bankEntries: [
        { id: 'be_1', date: '2026-07-03', description: 'Dépôt Square', type: 'dépôt',
          amount: 1840.25, status: 'matched', matchedPayoutId: 'sp_1', notes: '' },
        { id: 'be_2', date: '2026-07-17', description: 'Dépôt Square', type: 'dépôt',
          amount: 2210.00, status: 'unmatched', matchedPayoutId: null, notes: '' },
        { id: 'be_3', date: '2026-07-22', description: 'Retrait — hébergement', type: 'retrait',
          amount: -62.35, status: 'unmatched', matchedPayoutId: null, notes: 'Render' },
      ],
      squarePayouts: [
        { id: 'sp_1', arrivalDate: '2026-07-03', periodFrom: '2026-07-01', periodTo: '2026-07-02',
          amount: 1840.25, description: 'Dépôt Square — 2026-07 (58 tx)', status: 'matched',
          matchedEntryId: 'be_1', txIds: [], notes: 'Brut: 1 902,10 $ | Frais: 61,85 $', source: 'square_cache' },
        { id: 'sp_2', arrivalDate: '2026-07-22', periodFrom: '2026-07-22', periodTo: '2026-07-22',
          amount: -62.35, description: 'Dépense — Site web · Render', status: 'unmatched',
          matchedEntryId: null, txIds: [], notes: '', source: 'expense', expId: 'exp_9' },
      ],
      adjustments: [],
    };
    var RESUME = { bankTotal: 3987.90, squareTotal: 1777.90, adjTotal: 0,
                   difference: 2210.00, isBalanced: false,
                   matchedBank: 1, unmatchedBank: 2, unmatchedSquare: 1 };
    var SQUARE = { nbTx: 58, brut: 1902.10, frais: 61.85, net: 1840.25 };
    var LISTE = [
      { id: 'rec_0001', label: 'Conciliation juillet 2026', status: 'in_progress',
        createdAt: '2026-08-01T12:00:00Z', updatedAt: '2026-08-09T12:00:00Z', lockedAt: null,
        nbBanque: 3, nbVersements: 2, resume: RESUME },
      { id: 'rec_0002', label: 'Conciliation juin 2026', status: 'locked',
        createdAt: '2026-07-02T12:00:00Z', updatedAt: '2026-07-05T12:00:00Z',
        lockedAt: '2026-07-05T12:00:00Z', nbBanque: 5, nbVersements: 5,
        resume: { bankTotal: 5120.00, squareTotal: 5120.00, adjTotal: 0, difference: 0,
                  isBalanced: true, matchedBank: 5, unmatchedBank: 0, unmatchedSquare: 0 } },
    ];
    var BASE = { ok: true, annee: 2026, annees: [2026, 2025], liste: LISTE, peutEcrire: true };
    var DETAIL = Object.assign({}, BASE, { rec: REC, resume: RESUME, square: SQUARE, verrouille: false });
    var onglet = function(nom, id){ return { nom: nom, id: id,
      reponses: { 'banque:donnees': DETAIL, identite: IDENTITE } }; };
    return [
      { nom: 'liste', reponses: { 'banque:donnees': BASE, identite: IDENTITE } },
      onglet('relevé', 'releve'),
      onglet('dépôts et sorties', 'depots'),
      onglet('appariement', 'appariement'),
      onglet('résumé', 'resume'),
      {
        // ⚠ VERROUILLÉE : plus un seul bouton d'écriture. Le cœur refuse déjà
        // toute écriture ; ce cas-ci prouve que l'écran, lui, se dessine encore.
        nom: 'verrouillée',
        id: 'resume',
        reponses: {
          'banque:donnees': Object.assign({}, BASE, {
            rec: Object.assign({}, REC, { status: 'locked', lockedAt: '2026-08-09T18:00:00Z' }),
            resume: Object.assign({}, RESUME, { difference: 0, isBalanced: true }),
            square: SQUARE, verrouille: true,
          }),
          identite: IDENTITE,
        },
      },
    ];
  })(),

  // ── CONSOMMATION FAL.AI ────────────────────────────────────────────────────
  // ⚠ FORME RÉELLE de fal:suivi (fal-proxy.php, actions resume et journal).
  // TROIS cas : la consommation, l'historique — une VUE ENTIÈRE que rien d'autre
  // n'atteint — et le registre VIDE, qui est le premier écran tant qu'aucun
  // traitement n'a tourné. Sans ce dernier, l'écran d'accueil de la fonction
  // serait dessiné pour la première fois en production.
  'fal.js': (function(){
    var PAR_MODELE = [
      { modele: 'fal-ai/flux-pro/kontext', geste: 'humain', appels: 12, cout: 0.48,
        reussis: 11, coutsReels: 12 },
      { modele: 'fal-ai/flux-pro/kontext', geste: 'fantome', appels: 31, cout: 1.24,
        reussis: 31, coutsReels: 0 },
      { modele: 'fal-ai/birefnet', geste: 'detourage', appels: 84, cout: 0.168,
        reussis: 82, coutsReels: 40 },
    ];
    var PAR_JOUR = [
      { jour: '2026-08-09', appels: 44, cout: 0.92 },
      { jour: '2026-08-08', appels: 61, cout: 0.71 },
      { jour: '2026-08-07', appels: 22, cout: 0.30 },
    ];
    var BASE = { ok: true, parModele: PAR_MODELE, parJour: PAR_JOUR,
                 total: 1.888, appels: 127, coutsReels: 52,
                 tableauDeBord: 'https://fal.ai/dashboard/billing', evenements: [],
                 soldeSaisi: 25.00, soldeDate: '2026-08-01T00:00:00Z', consoDepuis: 1.20 };
    var PR_OK = { ok: true, compte: { available: 83, subscription: 100, plan: 'plus' },
                  sandbox: { utilise: 42, quotaMois: 1000, quotaJour: 100, estime: true },
                  prixEdit: 0.10 };
    return [
      { nom: 'consommation', reponses: { 'fal:suivi': BASE, 'photoroom:compte': PR_OK, identite: IDENTITE } },
      {
        nom: 'historique',
        id: 'historique',
        reponses: {
          'fal:suivi': Object.assign({}, BASE, { evenements: [
            { au: '2026-08-09T15:02:11Z', modele: 'fal-ai/birefnet', geste: 'detourage',
              qui: 'bbrousseau', ms: 4120, ok: true, erreur: '', cout: 0.002, coutReel: true },
            { au: '2026-08-09T15:00:02Z', modele: 'fal-ai/flux-pro/kontext', geste: 'fantome',
              qui: 'bbrousseau', ms: 18400, ok: true, erreur: '', cout: 0.04, coutReel: false },
            // ⚠ UN ECHEC AVEC SON MESSAGE : c'est la ligne qu'on vient chercher,
            // et elle a son propre dessin (une seconde rangee sous la premiere).
            { au: '2026-08-09T14:58:40Z', modele: 'fal-ai/flux-pro/kontext', geste: 'humain',
              qui: 'bbrousseau', ms: 900, ok: false,
              erreur: 'Exhausted balance. Please top up your account.', cout: 0, coutReel: false },
          ] }),
          'photoroom:compte': PR_OK,
          identite: IDENTITE,
        },
      },
      {
        nom: 'aucun appel',
        reponses: {
          'fal:suivi': { ok: true, parModele: [], parJour: [], total: 0, appels: 0,
                         coutsReels: 0, evenements: [],
                         tableauDeBord: 'https://fal.ai/dashboard/billing' },
          'photoroom:compte': { ok: true, compte: null,
                                sandbox: { utilise: 0, quotaMois: 1000, quotaJour: 100, estime: true } },
          identite: IDENTITE,
        },
      },
    ];
  })(),

  // ── LIENS D'INSTALLATION ───────────────────────────────────────────────────
  // ⚠ FORME RÉELLE de liens:liste / liens:journal (adm-invite.php).
  // QUATRE cas, et chacun dessine autre chose :
  //   « registre garni » couvre les quatre états d'un lien — un seul état dessiné
  //     laisserait les trois autres pastilles non éprouvées ;
  //   « lien fraîchement fabriqué » est la carte qui montre le mot de passe UNE
  //     fois : elle n'apparaît qu'après un geste, donc sans état d'ouverture
  //     aucun jeu ne la dessinerait jamais ;
  //   « journal » est une VUE ENTIÈRE que rien d'autre n'atteint ;
  //   « registre vide » est le premier écran d'une installation neuve.
  'liens.js': [
    {
      nom: 'registre garni',
      reponses: {
        'liens:liste': { ok: true, liens: [
          { id: 'a1b2c3d4e5f6a1b2c3', etat: 'actif', genre: 'manuel',
            etiquette: 'Poste de la boutique', destinataire: 'boutique@exemple.ca',
            staffId: '', maxUsages: 1, usages: 0,
            expireLe: '2026-08-10T14:00:00Z', creeLe: '2026-08-09T14:00:00Z', creePar: 'bbrousseau',
            revoqueLe: '', revoquePar: '', motif: '',
            url: 'https://adm.sandriza.com/adm-invite.php?l=a1b2c3d4e5f6a1b2c3&s=x' },
          { id: 'b2c3d4e5f6a1b2c3d4', etat: 'revoque', genre: 'inscription',
            etiquette: 'Invitation — Marie Tremblay', destinataire: 'marie@exemple.ca',
            staffId: 'stf_0002', maxUsages: 3, usages: 1,
            expireLe: '2026-08-10T09:00:00Z', creeLe: '2026-08-09T09:00:00Z', creePar: 'bbrousseau',
            revoqueLe: '2026-08-09T11:30:00Z', revoquePar: 'bbrousseau', motif: 'Courriel envoyé à la mauvaise adresse',
            url: 'https://adm.sandriza.com/adm-invite.php?l=b2c3d4e5f6a1b2c3d4&s=x' },
          { id: 'c3d4e5f6a1b2c3d4e5', etat: 'expire', genre: 'manuel',
            etiquette: 'Comptable externe', destinataire: '', staffId: '',
            maxUsages: 0, usages: 4,
            expireLe: '2026-08-08T12:00:00Z', creeLe: '2026-08-01T12:00:00Z', creePar: 'bbrousseau',
            revoqueLe: '', revoquePar: '', motif: '',
            url: 'https://adm.sandriza.com/adm-invite.php?l=c3d4e5f6a1b2c3d4e5&s=x' },
          { id: 'd4e5f6a1b2c3d4e5f6', etat: 'epuise', genre: 'manuel',
            etiquette: 'Portable de rechange', destinataire: '', staffId: 'stf_0001',
            maxUsages: 2, usages: 2,
            expireLe: '2026-08-12T12:00:00Z', creeLe: '2026-08-09T12:00:00Z', creePar: 'bbrousseau',
            revoqueLe: '', revoquePar: '', motif: '',
            url: 'https://adm.sandriza.com/adm-invite.php?l=d4e5f6a1b2c3d4e5f6&s=x' },
        ] },
        'liens:comptes': { ok: true, comptes: [
          { id: 'stf_0001', nom: 'Bruno Brousseau', courriel: 'bbrousseau@exemple.ca' },
          { id: 'stf_0002', nom: 'Marie Tremblay', courriel: 'marie@exemple.ca' },
        ] },
        'liens:paquets': { ok: true, version: '2.10.0', paquets: [
          { cle: 'win-x64', nom: 'Windows 64 bits', note: 'La plupart des PC Windows.', taille: 78900087 },
        ] },
        identite: IDENTITE,
      },
    },
    {
      // Le formulaire ouvert : la liste des comptes à rattacher s'y dessine.
      nom: 'nouveau lien',
      id: 'nouveau',
      reponses: {
        'liens:liste': { ok: true, liens: [] },
        'liens:comptes': { ok: true, comptes: [
          { id: 'stf_0002', nom: 'Marie Tremblay', courriel: 'marie@exemple.ca' },
        ] },
        'liens:paquets': { ok: true, version: '2.10.0', paquets: [] },
        identite: IDENTITE,
      },
    },
    {
      nom: 'journal',
      id: 'journal',
      reponses: {
        'liens:journal': { ok: true, conservation: 365, evenements: [
          { au: '2026-08-09T15:02:11Z', canal: 'telechargement', lienId: 'a1b2c3d4e5f6a1b2c3',
            genre: 'telecharge', ip: '24.201.44.7', agent: 'Mozilla/5.0', qui: 'boutique@exemple.ca',
            detail: 'declinaison=win-x64 restant=0' },
          { au: '2026-08-09T15:01:40Z', canal: 'telechargement', lienId: 'a1b2c3d4e5f6a1b2c3',
            genre: 'mdp_refuse', ip: '24.201.44.7', agent: 'Mozilla/5.0', qui: '', detail: 'essai 1' },
          { au: '2026-08-09T14:00:02Z', canal: 'comptable', lienId: 'part_2026_t2',
            genre: 'comptable_ouvert', ip: '198.51.100.20', agent: 'Mozilla/5.0', qui: '', detail: '' },
        ] },
        identite: IDENTITE,
      },
    },
    {
      nom: 'registre vide',
      reponses: {
        'liens:liste': { ok: true, liens: [] },
        'liens:comptes': { ok: true, comptes: [] },
        'liens:paquets': { ok: true, version: '', paquets: [] },
        identite: IDENTITE,
      },
    },
  ],

  // ── LIENS COMPTABLES ───────────────────────────────────────────────────────
  // ⚠ FORME RÉELLE de comptable:donnees (cœur Backups._comptableDonnees).
  // QUATRE cas : « exercices garnis » couvre les deux états d'un partage (actif
  // et expiré) et un carnet peuplé ; « nouveau lien » ouvre le formulaire, qui
  // dessine les destinataires du carnet en cases à cocher ; « carnet » est la
  // seconde VUE ENTIÈRE, que rien d'autre n'atteint ; « aucun partage » est le
  // premier écran d'un exercice neuf. La carte du lien fraîchement fabriqué (le
  // mot de passe montré une seule fois) n'apparaît qu'après un geste — aucun
  // état d'ouverture ne peut la dessiner, comme pour les liens d'installation.
  'comptable.js': [
    {
      nom: 'exercices garnis',
      id: '',
      reponses: {
        'comptable:donnees': {
          ok: true, annee: 2026, annees: [2026, 2025, 2024, 2023, 2022, 2021],
          peutEcrire: true,
          contacts: [
            { name: 'Julie Bergeron', firm: 'Bergeron CPA inc.',
              email: 'julie@bergeroncpa.ca', phone: '514-555-0142', note: 'Dossier TPS/TVQ' },
            { name: 'Marc Lavoie', firm: 'Groupe Fiscalité Québec',
              email: 'marc.lavoie@gfq.ca', phone: '', note: '' },
          ],
          partages: [
            { token: 'part_2026', url: 'https://adm.sandriza.com/accountant.php?t=part_2026',
              label: 'Exercice 2026', periode: '2026', destinataire: 'julie@bergeroncpa.ca',
              creeLe: '2026-08-09T14:00:00Z', expireLe: '2026-08-16T14:00:00Z', expire: false },
            { token: 'part_2025', url: 'https://adm.sandriza.com/accountant.php?t=part_2025',
              label: 'Exercice 2025', periode: '2025',
              destinataire: 'julie@bergeroncpa.ca, marc.lavoie@gfq.ca',
              creeLe: '2026-03-01T14:00:00Z', expireLe: '2026-03-08T14:00:00Z', expire: true },
          ],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'nouveau lien',
      id: 'nouveau',
      reponses: {
        'comptable:donnees': {
          ok: true, annee: 2026, annees: [2026, 2025, 2024], peutEcrire: true,
          contacts: [
            { name: 'Julie Bergeron', firm: 'Bergeron CPA inc.',
              email: 'julie@bergeroncpa.ca', phone: '514-555-0142', note: '' },
          ],
          partages: [],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'carnet',
      id: 'carnet',
      reponses: {
        'comptable:donnees': {
          ok: true, annee: 2026, annees: [2026, 2025, 2024], peutEcrire: true,
          contacts: [
            { name: 'Julie Bergeron', firm: 'Bergeron CPA inc.',
              email: 'julie@bergeroncpa.ca', phone: '514-555-0142', note: 'Dossier TPS/TVQ' },
            { name: 'Marc Lavoie', firm: '', email: 'marc.lavoie@gfq.ca', phone: '', note: '' },
          ],
          partages: [],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'aucun partage',
      id: '',
      reponses: {
        'comptable:donnees': { ok: true, annee: 2026, annees: [2026], peutEcrire: true,
          contacts: [], partages: [] },
        identite: IDENTITE,
      },
    },
  ],

  // ── DÉCOMPTE D'INACTIVITÉ ──────────────────────────────────────────────────
  // ⚠ Cette fenêtre n'INTERROGE rien : elle reçoit sa durée par son paramètre
  // d'ouverture et n'appelle le pont qu'au CLIC. Le jeu d'essai ne prouve donc
  // que le dessin — c'est-à-dire exactement ce que ce garde-fou sait prouver,
  // et il vaut mieux le dire que de laisser croire à davantage.
  'inactivite.js': [
    { nom: 'soixante secondes', id: '60', reponses: { identite: IDENTITE } },
  ],

  // ── REMBOURSEMENTS ET CRÉDITS ──────────────────────────────────────────────
  // ⚠ FORME RÉELLE de remboursements:liste (cœur Admin._remboursementsDonnees).
  // DEUX cas d'ouverture, et il en faut deux : la table des crédits n'est pas
  // celle des remboursements, et elle porte le PASSIF — la moitié qui compte
  // pour le comptable. Sans l'état d'ouverture, aucun jeu ne la dessinerait.
  'remboursements.js': [
    {
      nom: 'remboursements',
      id: '',
      reponses: {
        'remboursements:liste': {
          ok: true, onglet: 'remboursements', page: 0, pages: 1, taille: 25,
          comptes: { remboursements: 3, credits: 2 },
          tuiles: { rembourse: '412,55 $', nbRemb: 3, emis: '180,00 $', nbCredits: 2,
            utilise: '45,00 $', solde: '135,00 $', nbActifs: 1 },
          lignes: [
            { id: 'rf1', numero: 'RMB-0002-101', date: '7 août 2026', commandeId: 'o_1',
              commande: 'CMD-0002-22010', client: 'Bobby Brousseau', type: 'original',
              typeLbl: 'Moyen original', motif: 'Article non conforme',
              sousTotal: '250,00 $', tps: '12,50 $', tvq: '24,94 $', total: '287,44 $', totalN: 287.44 },
            { id: 'rf2', numero: 'RMB-0002-102', date: '5 août 2026', commandeId: 'o_2',
              commande: 'CMD-0002-22008', client: 'Marie Tremblay', type: 'credit',
              typeLbl: 'Crédit boutique', motif: 'Retour hors délai — crédit accordé',
              sousTotal: '100,00 $', tps: '5,00 $', tvq: '9,98 $', total: '114,98 $', totalN: 114.98 },
            // ⚠ Le remboursement de FRAIS : il n'a pas d'articles et se distingue.
            { id: 'rf3', numero: 'RMB-0002-103', date: '2 août 2026', commandeId: '',
              commande: 'CMD-0002-21990', client: 'Julie Gagnon', type: 'fees_refund',
              typeLbl: 'Frais de service', motif: 'Frais retenus remboursés',
              sousTotal: '10,13 $', tps: '0,00 $', tvq: '0,00 $', total: '10,13 $', totalN: 10.13 },
          ],
        },
        'remboursements:ouvrir': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      // ⚠ LES CRÉDITS : le passif, avec le détail des utilisations et les trois
      // statuts. Un crédit SANS date d'expiration n'est PAS expiré.
      nom: 'credits boutique',
      id: 'credits',
      reponses: {
        'remboursements:liste': {
          ok: true, onglet: 'credits', page: 0, pages: 1, taille: 25,
          comptes: { remboursements: 3, credits: 3 },
          tuiles: { rembourse: '412,55 $', nbRemb: 3, emis: '280,00 $', nbCredits: 3,
            utilise: '45,00 $', solde: '135,00 $', nbActifs: 1 },
          lignes: [
            { id: 'cr1', numero: 'CRD-0002-011', refund: 'RMB-0002-102',
              client: 'Marie Tremblay', emisLe: '5 août 2026', commande: 'CMD-0002-22008',
              expiration: 'N’expire jamais', montant: '180,00 $', utilise: '45,00 $',
              solde: '135,00 $', soldeN: 135, statut: 'actif',
              usages: [{ date: '7 août 2026', commande: 'CMD-0002-22011', montant: '45,00 $' }] },
            { id: 'cr2', numero: 'CRD-0002-010', refund: '', client: 'Julie Gagnon',
              emisLe: '12 mars 2026', commande: '', expiration: '12 mars 2026',
              montant: '50,00 $', utilise: '0,00 $', solde: '50,00 $', soldeN: 50,
              statut: 'expire', usages: [] },
            { id: 'cr3', numero: 'CRD-0002-009', refund: '', client: 'Sophie Roy',
              emisLe: '2 janvier 2026', commande: '', expiration: 'N’expire jamais',
              montant: '50,00 $', utilise: '50,00 $', solde: '0,00 $', soldeN: 0,
              statut: 'epuise',
              usages: [{ date: '4 janvier 2026', commande: 'CMD-0002-21500', montant: '50,00 $' }] },
          ],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'remboursements:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── DÉPENSES D'ENTREPRISE ──────────────────────────────────────────────────
  // ⚠ FORME RÉELLE de depenses:donnees (cœur Expenses._depensesDonnees). Quatre
  // cas : la liste garnie, la période vide, la lecture seule (ni saisie ni zone
  // de dépôt) et le module absent.
  'depenses.js': [
    {
      // ⚠ `id: 'nouvelle'` OUVRE DIRECTEMENT LE FORMULAIRE : sans lui, aucun jeu
      // ne l'atteindrait (le garde-fou ne simule aucun clic) et la moitié utile
      // de la fenêtre resterait dans l'ombre. Mesuré avec une sonde.
      nom: 'liste garnie + formulaire ouvert',
      id: 'nouvelle',
      reponses: {
        'depenses:donnees': {
          ok: true, annee: 2026, mois: 0, categorie: '', periode: '2026',
          annees: ['2026', '2025'],
          moisNoms: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
            'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
          categories: [
            { cle: 'pub', libelle: 'Publicité', ligne: '8521' },
            { cle: 'web', libelle: 'Site web, logiciels (SaaS)', ligne: '9270' },
            { cle: 'bureau', libelle: 'Fournitures et frais de bureau', ligne: '8811' },
          ],
          paiements: [
            { cle: 'card', libelle: 'Carte de crédit / débit' },
            { cle: 'transfer', libelle: 'Virement / prélèvement' },
          ],
          peutAjouter: true, peutModifier: true, peutSupprimer: true, lectureAuto: true,
          total: '4 218.55 $', totalTps: '210.93 $', totalTvq: '420.80 $',
          nombre: 3, page: 0, pages: 1, taille: 25,
          lignes: [
            { id: 'exp1', date: '2026-08-04', dateFr: '2026-08-04', categorie: 'pub',
              categorieLbl: 'Publicité', ligne: '8521', description: 'Publicité Meta juillet',
              fournisseur: 'Meta Platforms', paiement: 'Carte de crédit / débit',
              montant: '1 200.00 $', montantN: 1200, tps: '60.00 $', tvq: '119.70 $',
              aTaxes: true, recu: true, usd: false },
            // ⚠ LE CAS USD : montant converti, pastille distincte.
            { id: 'exp2', date: '2026-07-28', dateFr: '2026-07-28', categorie: 'web',
              categorieLbl: 'Site web, logiciels (SaaS)', ligne: '9270',
              description: 'Namecheap — renouvellement nom de domaine', fournisseur: 'Namecheap',
              paiement: 'Carte de crédit / débit', montant: '28.55 $', montantN: 28.55,
              tps: '0.00 $', tvq: '0.00 $', aTaxes: false, recu: true, usd: true },
            // Sans reçu ni taxes : la ligne la plus dépouillée.
            { id: 'exp3', date: '2026-07-11', dateFr: '2026-07-11', categorie: 'bureau',
              categorieLbl: 'Fournitures et frais de bureau', ligne: '8811',
              description: 'Papeterie', fournisseur: '', paiement: 'Virement / prélèvement',
              montant: '2 990.00 $', montantN: 2990, tps: '0.00 $', tvq: '0.00 $',
              aTaxes: false, recu: false, usd: false },
          ],
        },
        'depenses:lire': {
          ok: true, id: 'exp1', date: '2026-08-04', dateFr: '2026-08-04',
          categorie: 'pub', categorieLbl: 'Publicité', ligne: '8521',
          paiement: 'card', paiementLbl: 'Carte de crédit / débit',
          description: 'Publicité Meta juillet', fournisseur: 'Meta Platforms',
          montantN: 1200, tpsN: 60, tvqN: 119.7,
          montant: '1 200.00 $', tps: '60.00 $', tvq: '119.70 $', totalTTC: '1 379.70 $',
          aTaxes: true, recu: 'https://exemple.invalid/receipts/r1.webp', recuPdf: false,
          aRecu: true, usd: false, fxTaux: null, fxDate: '', fxApprox: false, origine: '',
        },
        'depenses:taxes': { ok: true, montant: 1000, tps: 50, tvq: 99.75 },
        'depenses:enregistrer': { ok: true, neuf: true, montant: '1 200.00 $', categorie: 'Publicité' },
        'depenses:supprimer': { ok: true, montant: '1 200.00 $', categorie: 'Publicité' },
        'depenses:recu': { ok: true, joint: true, pdf: false },
        'depenses:recuOuvrir': { ok: true },
        // ⚠ LE BROUILLON REPRIS : le cas qui dessine la bannière de reprise.
        'depenses:brouillonLire': { ok: true, ilYaMin: 7, recu: true,
          brouillon: { date: '2026-08-05', categorie: 'web', paiement: 'card',
            description: 'Render — facture', fournisseur: 'Render',
            montant: '3.51', tps: '0.00', tvq: '0.00', recu: true } },
        'depenses:brouillonEcrire': { ok: true, recu: true },
        'depenses:brouillonJeter': { ok: true },
        'depenses:convertir': { ok: true, taux: 1.4047, date: '2026-08-05', approx: false,
          source: 'Banque du Canada', montant: 12.35, tps: 0.62, tvq: null,
          origine: { montant: 8.79, tps: 0.44, tvq: null } },
        'depenses:facture': { ok: true, recu: true, lu: true, modele: 'llama-3.3-70b-versatile',
          source: 'texte du PDF', devise: 'USD', fxTaux: 1.3712, fxDate: '2026-07-28',
          fxApprox: false,
          champs: { date: '2026-07-28', fournisseur: 'Namecheap',
            description: 'Namecheap — renouvellement nom de domaine', categorie: 'web',
            montant: 28.55, tps: 0, tvq: 0 } },
        identite: IDENTITE,
      },
    },
    {
      // ⚠ LA QUESTION DE FERMETURE : elle ne s'atteint qu'après deux clics, donc
      // aucun jeu ne la dessinerait sans cet état d'ouverture. C'est le panneau
      // qui décide du sort d'une saisie — il ne peut pas rester non éprouvé.
      nom: 'question de fermeture',
      id: 'fermeture',
      reponses: {
        'depenses:donnees': {
          ok: true, annee: 2026, mois: 0, categorie: '', periode: '2026',
          annees: ['2026'], moisNoms: ['Janvier'],
          categories: [{ cle: 'web', libelle: 'Site web, logiciels (SaaS)', ligne: '9270' },
            { cle: 'autre', libelle: 'Autres dépenses', ligne: '9270' }],
          paiements: [{ cle: 'card', libelle: 'Carte de crédit / débit' }],
          peutAjouter: true, peutModifier: true, peutSupprimer: true, lectureAuto: true,
          total: '0.00 $', totalTps: '0.00 $', totalTvq: '0.00 $',
          nombre: 0, page: 0, pages: 1, taille: 25, lignes: [],
        },
        'depenses:brouillonLire': { ok: true, ilYaMin: 3, recu: true,
          brouillon: { date: '2026-08-05', categorie: 'web', paiement: 'card',
            description: 'Render — facture', fournisseur: 'Render',
            montant: '3.51', tps: '0.00', tvq: '0.00', recu: true } },
        'depenses:brouillonEcrire': { ok: true, recu: true },
        'depenses:brouillonJeter': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      // ⚠ VIDE MAIS CHARGÉE — la période n'a rien, ce n'est pas une panne.
      nom: 'periode vide',
      id: '',
      reponses: {
        'depenses:donnees': {
          ok: true, annee: 2026, mois: 2, categorie: '', periode: 'Février 2026',
          annees: ['2026'], moisNoms: ['Janvier', 'Février'],
          categories: [{ cle: 'pub', libelle: 'Publicité', ligne: '8521' }],
          paiements: [{ cle: 'card', libelle: 'Carte de crédit / débit' }],
          peutAjouter: true, peutModifier: true, peutSupprimer: true,
          // ⚠ SANS CLÉ : la zone de dépôt doit le dire d'avance.
          lectureAuto: false,
          total: '0.00 $', totalTps: '0.00 $', totalTvq: '0.00 $',
          nombre: 0, page: 0, pages: 1, taille: 25, lignes: [],
        },
        identite: IDENTITE,
      },
    },
    {
      // ⚠ L'ANNUAIRE : un écran entier qui ne s'atteint qu'au clic. Sans état
      // d'ouverture, aucun jeu ne le dessinerait — troisième fois de la journée.
      nom: 'annuaire des fournisseurs',
      id: 'annuaire',
      reponses: {
        'depenses:donnees': {
          ok: true, annee: 2026, mois: 0, categorie: '', periode: '2026',
          annees: ['2026'], moisNoms: ['Janvier'],
          categories: [{ cle: 'web', libelle: 'Site web, logiciels (SaaS)', ligne: '9270' },
            { cle: 'pub', libelle: 'Publicité', ligne: '8521' }],
          paiements: [{ cle: 'card', libelle: 'Carte de crédit / débit' }],
          peutAjouter: true, peutModifier: true, peutSupprimer: true, lectureAuto: true,
          total: '0.00 $', totalTps: '0.00 $', totalTvq: '0.00 $',
          nombre: 0, page: 0, pages: 1, taille: 25, lignes: [],
        },
        'depenses:annuaire': {
          ok: true, total: 3, integres: 2, appris: 2, trouves: 3,
          page: 0, pages: 1, taille: 30, peutModifier: true,
          categories: [{ cle: 'web', libelle: 'Site web, logiciels (SaaS)', ligne: '9270' },
            { cle: 'pub', libelle: 'Publicité', ligne: '8521' }],
          lignes: [
            // Livré tel quel.
            { id: 'render', nom: '', categorie: 'web', categorieLbl: 'Site web, logiciels (SaaS)',
              ligne: '9270', flou: false, origine: 'integre', categorieBaseLbl: '' },
            // ⚠ CORRIGÉ : la correction RECOUVRE le classement livré, elle ne
            // l'efface pas — l'écran doit montrer les deux.
            { id: 'amazon', nom: 'Amazon.ca', categorie: 'web',
              categorieLbl: 'Site web, logiciels (SaaS)', ligne: '9270', flou: false,
              origine: 'corrige', categorieBaseLbl: 'Fournitures et frais de bureau' },
            // Ajouté à la main : aucun classement livré derrière.
            { id: 'atelierriviere', nom: 'Atelier Rivière', categorie: 'pub',
              categorieLbl: 'Publicité', ligne: '8521', flou: false,
              origine: 'appris', categorieBaseLbl: '' },
          ],
        },
        'depenses:annuaireEcrire': { ok: true, id: 'render', categorie: 'Site web, logiciels (SaaS)' },
        'depenses:annuaireRetirer': { ok: true, id: 'amazon', integre: true,
          categorie: 'Fournitures et frais de bureau' },
        // ⚠ FORME RÉELLE de verrou:prendre — un OBJET, jamais un booléen.
        'verrou:prendre': { ok: true, obtenu: true, horsLigne: false, parQui: '', par: 'bbrousseau' },
        'verrou:rendre': { ok: true },
        identite: IDENTITE,
      },
    },
    {
      nom: 'lecture seule',
      id: '',
      reponses: {
        'depenses:donnees': {
          ok: true, annee: 2026, mois: 0, categorie: '', periode: '2026',
          annees: ['2026'], moisNoms: ['Janvier'],
          categories: [{ cle: 'pub', libelle: 'Publicité', ligne: '8521' }],
          paiements: [{ cle: 'card', libelle: 'Carte de crédit / débit' }],
          peutAjouter: false, peutModifier: false, peutSupprimer: false, lectureAuto: false,
          total: '120.00 $', totalTps: '6.00 $', totalTvq: '11.97 $',
          nombre: 1, page: 0, pages: 1, taille: 25,
          lignes: [{ id: 'exp9', date: '2026-01-05', dateFr: '2026-01-05', categorie: 'pub',
            categorieLbl: 'Publicité', ligne: '8521', description: 'Annonce locale',
            fournisseur: '', paiement: 'Carte de crédit / débit', montant: '120.00 $',
            montantN: 120, tps: '6.00 $', tvq: '11.97 $', aTaxes: true, recu: false, usd: false }],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'module absent',
      id: '',
      reponses: {
        'depenses:donnees': { ok: false, motif: 'module_depenses' },
        identite: IDENTITE,
      },
    },
  ],

  // ── CENTRE D'IMPRESSION (studio promo) ─────────────────────────────────────
  // ⚠ FORME RÉELLE de promo:donnees (cœur PromoPrint._promoDonnees). Quatre cas :
  // la liste garnie, le volet d'IMPRESSION (le seul qui atteigne l'aperçu, la
  // calibration et l'état de l'imprimante), la lecture seule, et l'imprimante
  // absente — qui doit se dire, pas se taire.
  'promo.js': [
    {
      nom: 'volet impression garni',
      id: 'impression',
      reponses: {
        'promo:donnees': {
          ok: true, peutModifier: true, charge: true,
          total: 2, trouves: 2, page: 0, pages: 1, taille: 12,
          kpis: { modeles: 2, formats: 11, imprimees: 1840, logos: 3 },
          lignes: [
            { id: 'pp1', nom: 'Étiquette prix — collection été', type: 'Étiquette',
              dim: '2 × 1 po', rond: false, w: 2, h: 1, elements: 4,
              modifie: 1786200000000, planches: 1, vignette: IMAGE, rendable: true },
            // ⚠ LE MODÈLE QU'ON NE PEUT PAS RENDRE : une de ses images a teinté le
            // canevas. La fenêtre doit le DIRE — c'est ce qui empêchera de l'imprimer.
            { id: 'pp2', nom: 'Autocollant rond 2 po', type: 'Autocollant',
              dim: 'Ø 2 po', rond: true, w: 2, h: 2, elements: 2,
              modifie: 1786100000000, planches: 1, vignette: '', rendable: false },
          ],
          formats: [
            { cle: 'lbl2x1', id: '', nom: 'Étiquette prix', type: 'Étiquette',
              dim: '2 × 1 po', rond: false, perso: false, planches: 0 },
            { cle: 'c:fmt1', id: 'fmt1', nom: 'Étiquette bijou', type: 'Étiquette',
              dim: '1,5 × 0,75 po', rond: false, perso: true, planches: 0 },
          ],
        },
        'promo:apercu': { ok: true, image: IMAGE, rendable: true, detail: '',
          planches: [{ id: 'av5160', nom: 'Avery 5160 — 2,625 × 1 po (30/feuille)', parFeuille: 30 }] },
        'promo:imprimante': { ok: true, prete: true, imprimante: 'Zebra ZD410', dpi: 300,
          motif: '', message: 'Prêt — impression sans fenêtre sur « Zebra ZD410 ».' },
        'promo:calibration': { ok: true, echelle: 100, decX: 0, decY: 0, rendu: '600 × 300 px' },
        'promo:calibrer': { ok: true, echelle: 101, decX: 0, decY: 0, rendu: '606 × 303 px' },
        'promo:lot': { ok: true, envoyees: 25, imprimante: 'Zebra ZD410', dpi: 300 },
        'promo:dupliquer': { ok: true, id: 'pp3', nom: 'Étiquette prix — collection été (copie)' },
        'promo:supprimer': { ok: true, nom: 'Autocollant rond 2 po', dim: 'Ø 2 po' },
        'promo:formatEcrire': { ok: true, nom: 'Étiquette bijou', dim: '1,5 × 0,75 po' },
        'promo:formatSupprimer': { ok: true, nom: 'Étiquette bijou', dim: '1,5 × 0,75 po' },
        'promo:nouveau': { ok: true, id: 'pp4', nom: 'Étiquette prix 2 × 1 po', dim: '2 × 1 po' },
        'promo:editeur': { ok: true, nom: 'Étiquette prix — collection été' },
        'promo:planche': { ok: true, planche: 'Avery 5160 — 2,625 × 1 po (30/feuille)', parFeuille: 30 },
        identite: IDENTITE,
      },
    },
    {
      // ⚠ L'IMPRIMANTE ABSENTE SE DIT. Un volet d'impression muet là-dessus
      // laisserait appuyer sur « Lancer » pour rien.
      // ⚠ `id: 'impression'` OUVRE DIRECTEMENT LE VOLET D'IMPRESSION. Sans lui,
      // aucun de ces cas ne l'atteindrait : le garde-fou ne simule aucun clic, et
      // la fenêtre s'ouvre sur l'onglet Modèles.
      nom: 'imprimante absente (volet impression)',
      id: 'impression',
      reponses: {
        'promo:donnees': {
          ok: true, peutModifier: true, charge: true,
          total: 1, trouves: 1, page: 0, pages: 1, taille: 12,
          kpis: { modeles: 1, formats: 10, imprimees: 0, logos: 0 },
          lignes: [{ id: 'pp1', nom: 'Carte d’affaires', type: "Carte d'affaires",
            dim: '3,5 × 2 po', rond: false, w: 3.5, h: 2, elements: 6,
            modifie: 1786200000000, planches: 1, vignette: IMAGE, rendable: true }],
          formats: [],
        },
        'promo:apercu': { ok: true, image: IMAGE, rendable: true, planches: [] },
        'promo:imprimante': { ok: true, prete: false, imprimante: '', dpi: 203,
          motif: 'no_printer',
          message: 'Aucune imprimante d’étiquettes choisie sur ce poste. Configuration → Imprimantes.' },
        'promo:calibration': { ok: true, echelle: 100, decX: 0, decY: 0, rendu: '711 × 406 px' },
        identite: IDENTITE,
      },
    },
    {
      nom: 'lecture seule',
      id: '',
      reponses: {
        'promo:donnees': {
          ok: true, peutModifier: false, charge: true,
          total: 0, trouves: 0, page: 0, pages: 1, taille: 12,
          kpis: { modeles: 0, formats: 10, imprimees: 0, logos: 0 },
          lignes: [], formats: [],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'module absent',
      id: '',
      reponses: {
        'promo:donnees': { ok: false, motif: 'module_promo' },
        identite: IDENTITE,
      },
    },
  ],

  // ── PHOTOS (médiathèque) ───────────────────────────────────────────────────
  // ⚠ FORME RÉELLE de photos:donnees (cœur Photos._photosDonnees). Trois cas,
  // parce qu'ils ne traversent pas le même dessin : garnie (tableau + tuiles +
  // zone de dépôt), lecture seule (bandeau, boutons désarmés, pas de dépôt) et
  // médiathèque vide (le message « aucune photo », qui n'est PAS le message de
  // chargement).
  'photos.js': [
    {
      nom: 'mediatheque garnie',
      id: '',
      reponses: {
        'photos:donnees': {
          ok: true, charge: true, peutModifier: true, bureau: true,
          total: 3, trouvees: 3, liees: 1, isolees: 2, poidsTotal: 271360,
          page: 0, pages: 1, taille: 24,
          lignes: [
            // Rangée, isolée, attachée à un article : la ligne la plus complète.
            { id: 'ph_a1', code: 'PH-000003', nom: 'robe-lin-devant.jpg',
              apercu: 'https://exemple.invalid/phototheque/a1.webp', enAttente: false,
              isole: true, fond: 'studio', lieId: 'p_0007', lieNom: 'Robe en lin',
              lieSku: 'ROB-000123', poids: 90112, poidsSrc: 6291456, statut: 'liée' },
            // Rangée, isolée, pas encore attachée.
            { id: 'ph_a2', code: 'PH-000002', nom: 'chemisier.png',
              apercu: 'https://exemple.invalid/phototheque/a2.webp', enAttente: false,
              isole: true, fond: '', lieId: null, lieNom: '', lieSku: '',
              poids: 88064, poidsSrc: 2400000, statut: 'isolé' },
            // ⚠ LE CAS QUI N'A PAS D'IMAGE : le dépôt a échoué, l'entrée n'a donc
            // aucune adresse. La fenêtre doit le DIRE, pas afficher un cadre vide.
            { id: 'ph_a3', code: 'PH-000001', nom: 'jupe-plissee.heic',
              apercu: '', enAttente: true, isole: false, fond: '', lieId: null,
              lieNom: '', lieSku: '', poids: 93184, poidsSrc: 93184, statut: 'non rangée' },
          ],
          fonds: [{ cle: 'studio', libelle: '🤍 Studio' }, { cle: 'jardin', libelle: '🌿 Jardin fleuri' }],
        },
        'photos:produits': { ok: true, total: 2, produits: [
          { id: 'p_0007', nom: 'Robe en lin', sku: 'ROB-000123',
            image: 'https://exemple.invalid/products/p7.webp', enVente: true },
          { id: 'p_0008', nom: 'Jupe plissée', sku: 'JUP-000045', image: '', enVente: false },
        ] },
        'photos:isoler': { ok: true, photo: { id: 'ph_a3', code: 'PH-000001', nom: 'jupe-plissee.heic',
          apercu: 'https://exemple.invalid/phototheque/a3.webp', enAttente: false, isole: true,
          fond: '', lieId: null, lieNom: '', lieSku: '', poids: 91000, poidsSrc: 93184, statut: 'isolé' } },
        'photos:fond': { ok: true, photo: { id: 'ph_a2', code: 'PH-000002', nom: 'chemisier.png',
          apercu: 'https://exemple.invalid/phototheque/a2b.webp', enAttente: false, isole: true,
          fond: 'jardin', lieId: null, lieNom: '', lieSku: '', poids: 90000, poidsSrc: 2400000,
          statut: 'isolé' } },
        'photos:attacher': { ok: true, code: 'PH-000002', produit: 'Robe en lin', sku: 'ROB-000123',
          photo: { id: 'ph_a2', code: 'PH-000002', nom: 'chemisier.png',
            apercu: 'https://exemple.invalid/phototheque/a2.webp', enAttente: false, isole: true,
            fond: '', lieId: 'p_0007', lieNom: 'Robe en lin', lieSku: 'ROB-000123',
            poids: 88064, poidsSrc: 2400000, statut: 'liée' } },
        'photos:importer': { ok: true, rangee: true, photo: { id: 'ph_a4', code: 'PH-000004',
          nom: 'nouvelle.jpg', apercu: 'https://exemple.invalid/phototheque/a4.webp',
          enAttente: false, isole: false, fond: '', lieId: null, lieNom: '', lieSku: '',
          poids: 87000, poidsSrc: 5100000, statut: 'importée' } },
        'photos:supprimer': { ok: true, code: 'PH-000001', lie: false },
        'photos:vider': { ok: true, retirees: 3, echecs: 0 },
        'photos:usb': { ok: true, trouvees: 12, importees: 12, lecteur: 'E:' },
        'photos:enregistrer': { ok: true, code: 'PH-000003', fichier: 'PH-000003.png' },
        identite: IDENTITE,
      },
    },
    {
      nom: 'lecture seule',
      id: '',
      reponses: {
        'photos:donnees': {
          ok: true, charge: true, peutModifier: false, bureau: false,
          total: 1, trouvees: 1, liees: 0, isolees: 0, poidsTotal: 88064,
          page: 0, pages: 1, taille: 24,
          lignes: [{ id: 'ph_b1', code: 'PH-000001', nom: 'essai.jpg',
            apercu: 'https://exemple.invalid/phototheque/b1.webp', enAttente: false,
            isole: false, fond: '', lieId: null, lieNom: '', lieSku: '',
            poids: 88064, poidsSrc: 0, statut: 'importée' }],
          fonds: [],
        },
        identite: IDENTITE,
      },
    },
    {
      // ⚠ VIDE MAIS CHARGÉE — à ne pas confondre avec « pas encore lue ».
      nom: 'mediatheque vide',
      id: '',
      reponses: {
        'photos:donnees': {
          ok: true, charge: true, peutModifier: true, bureau: true,
          total: 0, trouvees: 0, liees: 0, isolees: 0, poidsTotal: 0,
          page: 0, pages: 1, taille: 24, lignes: [], fonds: [],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'module absent',
      id: '',
      reponses: {
        'photos:donnees': { ok: false, motif: 'module_photos' },
        identite: IDENTITE,
      },
    },
    {
      // ⚠ L ASSISTANT DE TRAITEMENT EN LOT : ses trois etapes ne s atteignent
      // qu au clic. Sans ce jeu, elles seraient dessinees pour la premiere fois
      // en production — c est exactement le trou qu on a paye sur l annuaire.
      nom: 'assistant · sources',
      reponses: {
        'photos:donnees': { ok: true, charge: true, peutModifier: true, bureau: true,
          total: 0, trouvees: 0, liees: 0, isolees: 0, poidsTotal: 0,
          page: 0, pages: 1, taille: 24, lignes: [], fonds: [] },
        'lot:sources': { ok: true, lecteurs: [
          { lecteur: 'D:', photos: [
            { chemin: 'D:\DCIM\IMG_0064.JPG', nom: 'IMG_0064.JPG', octets: 5368709, modifie: 1786000000000 },
            { chemin: 'D:\DCIM\IMG_0065.JPG', nom: 'IMG_0065.JPG', octets: 4194304, modifie: 1785900000000 },
          ] },
        ] },
        'lot:vignette': { ok: true, image: 'data:image/png;base64,iVBORw0KGgo=' },
        identite: IDENTITE,
      },
    },
  ],

  // ── RECHERCHES SANS RÉSULTAT ───────────────────────────────────────────────
  'recherches.js': [
    {
      // ⚠ FORME REELLE de recherches:liste (coeur Admin._recherchesDonnees).
      nom: 'liste garnie',
      id: '',
      reponses: {
        'recherches:liste': {
          ok: true, peutModifier: true, total: 27,
          recentes: [
            { q: 'robe de bal', fois: 12, derniere: '2026-08-08' },
            { q: 'sandales dorees', fois: 9, derniere: '2026-08-06' },
            { q: 'manteau long', fois: 6, derniere: '2026-08-02' },
          ],
          etendue: '2026-01 → 2026-08',
          archive: [{ q: 'robe de bal', fois: 61 }, { q: 'manteau long', fois: 44 }],
        },
        'recherches:retirer': { ok: true, q: 'robe de bal', retiree: true },
        'recherches:vider': { ok: true, efface: 3 },
        identite: IDENTITE,
      },
    },
    {
      nom: 'aucune recherche',
      id: '',
      reponses: {
        'recherches:liste': { ok: true, peutModifier: true, total: 0, recentes: [],
          etendue: '', archive: [] },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'recherches:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── RECOMMANDATIONS ────────────────────────────────────────────────────────
  'recommandations.js': [
    {
      // ⚠ FORME REELLE de reco:liste (coeur Recommendations._recoDonnees).
      nom: 'regles garnies',
      id: '',
      reponses: {
        'reco:liste': {
          ok: true, peutModifier: true,
          regles: [
            { id: 'r1', nom: 'Achetés ensemble', type: 'bought_together',
              typeLibelle: 'Achetés ensemble', ou: ['Fiche produit', 'Panier'], max: 4,
              active: true, pardefaut: true, premiere: true, derniere: false },
            { id: 'r2', nom: 'Même catégorie', type: 'same_category',
              typeLibelle: 'Même catégorie', ou: ['Fiche produit'], max: 6,
              active: false, pardefaut: false, premiere: false, derniere: true },
          ],
          supprimees: [{ id: 'r9', nom: 'Les plus populaires', typeLibelle: 'Les plus populaires' }],
          liaisons: [
            { id: 'p1', nom: 'Robe fleurie',
              lies: [{ id: 'p2', nom: 'Blouse en soie' }, { id: 'p3', nom: 'Ceinture cuir' }] },
          ],
          catalogue: [
            { id: 'p1', nom: 'Robe fleurie', sku: 'RB-0001' },
            { id: 'p2', nom: 'Blouse en soie', sku: 'HT-0002' },
            { id: 'p3', nom: 'Ceinture cuir', sku: 'AC-0003' },
          ],
        },
        'reco:stats': {
          ok: true,
          regles: [{ nom: 'Achetés ensemble', active: true, couverture: 12 },
                   { nom: 'Même catégorie', active: false, couverture: 34 }],
          populaires: [{ nom: 'Robe fleurie', score: 18 }, { nom: 'Blouse en soie', score: 11 }],
        },
        'reco:basculer': { ok: true, nom: 'Même catégorie', active: true },
        'reco:deplacer': { ok: true, nom: 'Achetés ensemble' },
        'reco:supprimer': { ok: true, nom: 'Même catégorie', restaurable: false },
        'reco:restaurer': { ok: true, nom: 'Les plus populaires' },
        'reco:liaisons': { ok: true, nom: 'Robe fleurie', nb: 2 },
        'reco:viderLiaisons': { ok: true, efface: 1 },
        identite: IDENTITE,
      },
    },
    {
      nom: 'aucune regle',
      id: '',
      reponses: {
        'reco:liste': { ok: true, peutModifier: true, regles: [], supprimees: [],
          liaisons: [], catalogue: [] },
        'reco:stats': { ok: true, regles: [], populaires: [] },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'reco:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── FIDÉLISATION ET SONDAGES ───────────────────────────────────────────────
  'fidelisation.js': [
    {
      // ⚠ FORME REELLE de fidelisation:liste (coeur Loyalty._fidelisationDonnees).
      nom: 'sondages garnis',
      id: '',
      reponses: {
        'fidelisation:liste': {
          ok: true, peutModifier: true, courrielNotification: 'sondages@example.com',
          tuiles: { invitations: 40, reponses: 12, taux: 30, note: 4.3, nbNotes: 11,
            codes: 12, codesUtilises: 5 },
          sondages: [
            { id: 's1', nom: 'Satisfaction après livraison', declencheur: 'Livraison (statut livré)',
              nbQuestions: 3, invitations: 30, reponses: 10, taux: 33,
              recompense: '10 % · 30 j', actif: true },
            { id: 's2', nom: 'Accueil en boutique', declencheur: 'Confirmation commande',
              nbQuestions: 2, invitations: 10, reponses: 2, taux: 20, recompense: '', actif: false },
          ],
          recompenses: [
            { code: 'MERCI-A1B2', sondage: 'Satisfaction après livraison', commande: 'CMD-2026-0512',
              date: '2026-08-07', utilise: true },
          ],
          invitations: [
            { id: 'i1', sondage: 'Satisfaction après livraison', courriel: 'marie@example.com',
              declencheur: 'Livraison (statut livré)', lien: 'https://…', date: '2026-08-06', repondu: true },
            { id: 'i2', sondage: 'Accueil en boutique', courriel: 'julie@example.com',
              declencheur: 'Confirmation commande', lien: 'https://…', date: '2026-08-05', repondu: false },
          ],
        },
        'fidelisation:sondage': {
          ok: true,
          sondage: { id: 's1', nom: 'Satisfaction après livraison',
            declencheur: 'Livraison (statut livré)', actif: true, nbReponses: 10,
            questions: [
              { texte: 'Comment jugez-vous la rapidité de livraison ?', genre: 'rating',
                nbReponses: 10, moyenne: 4.4, textes: [] },
              { texte: 'Un commentaire ?', genre: 'text', nbReponses: 3, moyenne: null,
                textes: ['Très bel emballage.', 'Livraison rapide, merci !'] },
            ] },
        },
        'fidelisation:supprimerSondage': { ok: true, nom: 'Accueil en boutique', reponsesPerdues: 2 },
        'fidelisation:supprimerInvite': { ok: true, courriel: 'julie@example.com' },
        'fidelisation:viderInvites': { ok: true, efface: 40 },
        'fidelisation:notification': { ok: true, courriel: 'sondages@example.com' },
        identite: IDENTITE,
      },
    },
    {
      nom: 'aucun sondage',
      id: '',
      reponses: {
        'fidelisation:liste': {
          ok: true, peutModifier: true, courrielNotification: '',
          tuiles: { invitations: 0, reponses: 0, taux: 0, note: null, nbNotes: 0, codes: 0, codesUtilises: 0 },
          sondages: [], recompenses: [], invitations: [],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'fidelisation:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── RÉSEAUX SOCIAUX ────────────────────────────────────────────────────────
  'sociaux.js': [
    {
      // ⚠ FORME REELLE de sociaux:liste (coeur Social._sociauxDonnees).
      nom: 'file et historique',
      id: '',
      reponses: {
        'sociaux:liste': {
          ok: true, peutModifier: true,
          reseauxActifs: [{ cle: 'facebook', nom: 'Facebook', icone: '📘' },
                          { cle: 'instagram', nom: 'Instagram', icone: '📸' }],
          tuiles: { enAttente: 1, publiees: 2, echouees: 1, ignorees: 0 },
          file: [
            { id: 'q1', patron: 'Nouvelle promotion', contenu: 'Jusqu’à 20 % sur les robes !',
              image: true, reseaux: [{ cle: 'facebook', nom: 'Facebook', icone: '📘' }],
              statut: 'pending', creee: '2026-08-08 10:00', partie: '', resultats: [] },
          ],
          historique: [
            { id: 'q2', patron: 'Nouveau produit', contenu: 'Découvrez la blouse en soie.',
              image: false,
              reseaux: [{ cle: 'facebook', nom: 'Facebook', icone: '📘' },
                        { cle: 'instagram', nom: 'Instagram', icone: '📸' }],
              statut: 'partial', creee: '2026-08-05 09:00', partie: '2026-08-05 09:02',
              resultats: [{ reseau: 'Facebook', ok: true, detail: '' },
                          { reseau: 'Instagram', ok: false, detail: 'jeton expiré' }] },
            { id: 'q3', patron: 'Nouvelle promotion', contenu: 'Livraison gratuite ce week-end.',
              image: false, reseaux: [{ cle: 'facebook', nom: 'Facebook', icone: '📘' }],
              statut: 'published', creee: '2026-08-01 08:00', partie: '2026-08-01 08:01',
              resultats: [{ reseau: 'Facebook', ok: true, detail: '' }] },
          ],
        },
        'sociaux:publier': { ok: true, statut: 'partial', complet: false, patron: 'Nouvelle promotion',
          resultats: [{ reseau: 'Facebook', ok: true, detail: '' },
                      { reseau: 'Instagram', ok: false, detail: 'jeton expiré' }] },
        'sociaux:publierTout': { ok: true, tentees: 1, completes: 0, partielles: 1, echecs: 0 },
        'sociaux:ignorer': { ok: true, patron: 'Nouvelle promotion' },
        'sociaux:viderHistorique': { ok: true, efface: 2 },
        identite: IDENTITE,
      },
    },
    {
      nom: 'rien a publier',
      id: '',
      reponses: {
        'sociaux:liste': {
          ok: true, peutModifier: true, reseauxActifs: [],
          tuiles: { enAttente: 0, publiees: 0, echouees: 0, ignorees: 0 },
          file: [], historique: [],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'sociaux:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── CHAT EN LIGNE ──────────────────────────────────────────────────────────
  'chat.js': [
    {
      // ⚠ FORME REELLE de chat:liste (coeur LiveChat._chatDonnees).
      nom: 'file garnie',
      id: '',
      reponses: {
        'chat:liste': {
          ok: true, peutModifier: true, enAttente: 1, horsLigne: 1,
          satisfaction: { total: 3, rated: 2, satisfied: 1, unsatisfied: 1, rate: 50,
            comments: [{ name: 'Marie', score: false, comment: 'Réponse un peu lente.' }] },
          conversations: [
            { id: 's1', nom: 'Marie Tremblay', courriel: 'marie@example.com', telephone: '',
              statut: 'pending', statutLibelle: 'En attente', horsLigne: false,
              nbMessages: 3, date: '7 août 14:22' },
            { id: 's2', nom: 'Visiteur', courriel: '', telephone: '(418) 555-0199',
              statut: 'closed', statutLibelle: 'Fermée', horsLigne: true,
              nbMessages: 5, date: '5 août 09:10' },
          ],
        },
        'chat:lire': {
          ok: true,
          conversation: { id: 's1', nom: 'Marie Tremblay', courriel: 'marie@example.com',
            telephone: '', contactVoulu: 'email', statut: 'pending', horsLigne: false,
            ouverte: '2026-08-07 14:22',
            messages: [
              { texte: 'Bonjour, avez-vous la robe en taille M ?', qui: 'visitor', heure: '14:22' },
              { texte: 'Un instant, je vérifie.', qui: 'agent', heure: '14:25' },
              { texte: 'Merci !', qui: 'visitor', heure: '14:26' },
            ] },
        },
        'chat:repondre': { ok: true, nom: 'Marie Tremblay' },
        'chat:statut': { ok: true, statut: 'closed', nom: 'Marie Tremblay' },
        'chat:supprimer': { ok: true, nom: 'Marie Tremblay' },
        identite: IDENTITE,
      },
    },
    {
      nom: 'aucune conversation',
      id: '',
      reponses: {
        'chat:liste': {
          ok: true, peutModifier: true, enAttente: 0, horsLigne: 0,
          satisfaction: { total: 0, rated: 0, satisfied: 0, unsatisfied: 0, rate: null, comments: [] },
          conversations: [],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'chat:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── OFFRES ET ANNONCES ─────────────────────────────────────────────────────
  'promotions.js': [
    {
      // ⚠ FORME REELLE de offres:liste (coeur Promo._offresDonnees).
      nom: 'offres garnies',
      id: '',
      reponses: {
        'offres:liste': {
          ok: true, peutModifier: true,
          categories: [{ cle: 'robes', libelle: 'Robes' }, { cle: 'hauts', libelle: 'Hauts & Blouses' }],
          catalogue: [
            { id: 'p1', nom: 'Robe fleurie', sku: 'RB-0001', categorie: 'robes' },
            { id: 'p2', nom: 'Blouse en soie', sku: 'HT-0002', categorie: 'hauts' },
          ],
          offres: [
            { id: 'd1', nom: 'Solde du printemps', rabais: '20 %', portee: 'Robes',
              genre: 'percent', valeur: 20, bogoAchat: 0, bogoGratuit: 0, paliers: [],
              parClient: false, appliqueA: 'category', categoriesChoisies: ['robes'],
              produitsChoisis: [], bandeau: 'Jusqu’à 20 % sur les robes', bandeauEN: '',
              bandeauFond: '#1a1a2e', bandeauTexte: '#ffffff', bandeauCta: 'Voir',
              bandeauCtaEN: '', bandeauUrl: '#shop', priorite: 5,
              debut: '2026-03-01', fin: '2026-06-30', actif: true, enCours: true },
            { id: 'd2', nom: '2 pour 1 accessoires', rabais: '3 pour 2', portee: 'Tous les produits',
              genre: 'bogo', valeur: 0, bogoAchat: 3, bogoGratuit: 1, paliers: [],
              parClient: true, appliqueA: 'all', categoriesChoisies: [], produitsChoisis: [],
              bandeau: '', bandeauEN: '', bandeauFond: '#1a1a2e', bandeauTexte: '#ffffff',
              bandeauCta: '', bandeauCtaEN: '', bandeauUrl: '#shop', priorite: 5,
              debut: '', fin: '', actif: false, enCours: false },
          ],
        },
        'offres:enregistrer': { ok: true, id: 'd1', nom: 'Solde du printemps', creation: false },
        'promos:basculer': { ok: true, actif: false, nom: 'Solde du printemps' },
        'promos:supprimer': { ok: true, nom: 'Solde du printemps' },
        identite: IDENTITE,
      },
    },
    {
      // ⚠ FORME REELLE de annonces:liste (coeur Promo._annoncesDonnees).
      nom: 'annonces garnies',
      id: '',
      reponses: {
        'annonces:liste': {
          ok: true, peutModifier: true, intervalle: 6,
          categories: [{ cle: 'robes', libelle: 'Robes' }],
          catalogue: [{ id: 'p1', nom: 'Robe fleurie', sku: 'RB-0001', categorie: 'robes' }],
          annonces: [
            { id: 'a1', nom: 'Livraison gratuite', genre: 'announcement',
              message: 'Livraison gratuite dès 100 $', messageEN: '', fond: '#1a1a2e',
              texte: '#ffffff', cta: 'Magasiner', ctaEN: '', url: '#shop',
              badge: '', badgeEN: '', badgeCouleur: 'accent', appliqueA: 'all',
              categoriesChoisies: [], produitsChoisis: [], expireAuto: false, expireJours: 7,
              priorite: 5, debut: '', fin: '', actif: true, enCours: true },
            { id: 'a2', nom: 'Badge nouveauté', genre: 'badge',
              message: '', messageEN: '', fond: '#1a1a2e', texte: '#ffffff',
              cta: '', ctaEN: '', url: '#shop', badge: 'Nouveauté', badgeEN: 'New',
              badgeCouleur: 'success', appliqueA: 'category', categoriesChoisies: ['robes'],
              produitsChoisis: [], expireAuto: true, expireJours: 14,
              priorite: 3, debut: '', fin: '', actif: true, enCours: true },
          ],
        },
        'annonces:enregistrer': { ok: true, id: 'a1', nom: 'Livraison gratuite', creation: false },
        'promos:bandeau': { ok: true, intervalle: 8 },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'offres:liste': { ok: false, motif: 'droit' },
        identite: IDENTITE,
      },
    },
  ],

  // ── COUPONS ────────────────────────────────────────────────────────────────
  'coupons.js': [
    {
      // ⚠ FORME REELLE de coupons:liste (coeur Promo._couponsDonnees).
      nom: 'coupons garnis',
      id: '',
      reponses: {
        'coupons:liste': {
          ok: true, peutModifier: true,
          coupons: [
            { id: 'c1', code: 'PRINTEMPS20', nom: 'Promo printemps', type: 'percent',
              valeur: 20, reduction: '20 %', minimum: 75, cumulSolde: false,
              parClient: true, utilise: 12, maximum: 100,
              debut: '2026-03-01', fin: '2026-06-30', actif: true, enCours: true },
            { id: 'c2', code: 'LIVRAISON', nom: '', type: 'freeshipping',
              valeur: 0, reduction: 'Livraison gratuite', minimum: 0, cumulSolde: true,
              parClient: false, utilise: 3, maximum: 0,
              debut: '', fin: '', actif: false, enCours: false },
          ],
        },
        'coupons:enregistrer': { ok: true, id: 'c1', code: 'PRINTEMPS20', creation: false },
        'coupons:basculer': { ok: true, actif: false, code: 'PRINTEMPS20' },
        'coupons:supprimer': { ok: true, code: 'PRINTEMPS20' },
        identite: IDENTITE,
      },
    },
    {
      nom: 'aucun coupon',
      id: '',
      reponses: {
        'coupons:liste': { ok: true, peutModifier: true, coupons: [] },
        identite: IDENTITE,
      },
    },
    {
      // Lecture seule : aucun bouton de geste ne doit paraitre.
      nom: 'consultation seulement',
      id: '',
      reponses: {
        'coupons:liste': {
          ok: true, peutModifier: false,
          coupons: [
            { id: 'c1', code: 'PRINTEMPS20', nom: 'Promo printemps', type: 'percent',
              valeur: 20, reduction: '20 %', minimum: 75, cumulSolde: false,
              parClient: true, utilise: 12, maximum: 100,
              debut: '2026-03-01', fin: '2026-06-30', actif: true, enCours: true },
          ],
        },
        identite: IDENTITE,
      },
    },
    {
      nom: 'refus de droit',
      id: '',
      reponses: {
        'coupons:liste': { ok: false, motif: 'droit' },
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
