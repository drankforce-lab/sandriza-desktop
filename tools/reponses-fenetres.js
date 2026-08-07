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
 * Pour couvrir une fenêtre de plus : ajouter son fichier ici, avec les réponses
 * de ses opérations. Le contrôle s'y applique aussitôt.
 */

module.exports = {
  'imprimantes.js': {
    'imprimantes:etat': {
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
};
