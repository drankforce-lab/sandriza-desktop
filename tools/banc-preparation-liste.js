#!/usr/bin/env node
'use strict';
/*
 * BANC — LA VÉRIFICATION D'UNE COMMANDE DE 20 ARTICLES (2026-10-19, sa demande)
 * =============================================================================
 * « Imagine une commande de 20 articles distincts » : la GRANDE liste ne montre que ce qui RESTE à
 * scanner (un article à 1/2 y reste), un article COMPLET passe dans la liste « Validés » compacte, et
 * la grande liste est PAGINÉE quand elle dépasse la hauteur disponible.
 * Deux preuves, sans navigateur :
 *   1. la règle PURE `vueVerif` (lue dans la page générée) sur 20 articles, dont des quantités
 *      multiples ;
 *   2. la fenêtre ENTIÈRE exécutée dans le faux document (tools/executer-page.js) avec un avancement
 *      gardé au serveur : on relit ce qu'elle a dessiné (data-reste / data-valide / « 1 / 3 »).
 *   node tools/banc-preparation-liste.js            # le contrôle
 *   node tools/banc-preparation-liste.js --essai    # la panne provoquée doit mordre
 */
const { executerPage } = require('./executer-page.js');
const { pageCommande } = require('../src/fenetres/commande.js');

let fautes = 0, n = 0;
const ok = (c, q) => { n++; if (!c) { fautes++; console.log('  NON ' + q); } };

// 20 articles distincts ; 3 à quantité multiple.
const ART = [];
for (let i = 1; i <= 20; i++) {
  const q = (i === 3 || i === 7) ? 2 : (i === 12 ? 3 : 1);
  ART.push({ rang: i - 1, cle: 'p_' + String(i).padStart(4, '0') + '|M|Noir', nom: 'Article ' + i, sku: 'ART-' + String(i).padStart(6, '0') + '-M-NO',
    taille: 'M', couleur: 'Noir', image: '', quantite: q });
}
// Avancement gardé : 5 complets (dont le 3 à 2/2), 2 PARTIELS (7 à 1/2, 12 à 2/3).
const COMPTES = {};
[1, 2, 4, 5].forEach((i) => { COMPTES[ART[i - 1].cle] = 1; });
COMPTES[ART[2].cle] = 2;
COMPTES[ART[6].cle] = 1;
COMPTES[ART[11].cle] = 2;
if (process.argv.includes('--essai')) COMPTES[ART[6].cle] = 2;   // panne provoquée : un partiel déclaré complet par le banc
const COMPLETS = new Set([ART[0], ART[1], ART[2], ART[3], ART[4]].map((a) => a.cle));
const PARTIELS = new Set([ART[6].cle, ART[11].cle]);

const page = pageCommande('ord_0020');
const script = page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));

// ── 1. La règle pure
const i0 = script.indexOf('function vueVerif(');
const i1 = script.indexOf('var FLASH', i0);
ok(i0 > 0 && i1 > i0, 'vueVerif introuvable dans la page');
if (i0 > 0 && i1 > i0) {
  // eslint-disable-next-line no-new-func
  const vueVerif = new Function(script.slice(i0, i1) + '; return vueVerif;')();
  const v = vueVerif(ART, COMPTES, 6, 0);
  ok(v.valides.length === 5 && v.valides.every((a) => COMPLETS.has(a.cle)), 'validés = exactement les 5 articles complets');
  ok(v.restants.length === 15 && v.restants.every((a) => !COMPLETS.has(a.cle)), 'restants = les 15 autres, aucun complet');
  ok([...PARTIELS].every((c) => v.restants.some((a) => a.cle === c)), 'un article partiellement scanné (1/2, 2/3) RESTE dans la grande liste');
  ok(v.pages === 3 && v.vues.length === 6, '15 restants, 6 par page ⇒ 3 pages, 6 lignes vues');
  ok(vueVerif(ART, COMPTES, 6, 9).page === 2, 'une page hors bornes revient à la dernière');
  const tout = {}; ART.forEach((a) => { tout[a.cle] = a.quantite; });
  const fin = vueVerif(ART, tout, 6, 2);
  ok(fin.restants.length === 0 && fin.valides.length === 20 && fin.pages === 1, 'tout scanné : grande liste vide, 20 validés');
}

// ── 2. La fenêtre entière, dans le faux document
(async () => {
  const reponses = {
    'commande:contexte': { ok: true, peutPreparer: true, peutExpedier: true, cotables: ['postes-canada'],
      transporteurs: [{ cle: 'postes-canada', nom: 'Postes Canada', pret: true, mode: 'sandbox', etiquette: true }] },
    'commande:lire': { ok: true, numero: 'SZ-100320', statut: 'verification', dejaPret: false, suivi: '', transporteur: 'postes-canada',
      client: 'Marie Tremblay', ville: 'Québec', province: 'QC', codePostal: 'G1H 1T4', articles: ART, nbColis: 24,
      verif: { comptes: COMPTES, par: 'broubob', au: '2026-10-19T15:00:00Z' } },
    'verrou:prendre': { ok: true, obtenu: true, par: 'broubob' },
    'expedition:lire': { ok: true, commande: { payeClient: 25 }, poids: { calcule: 3.2, estime: false } },
  };
  let ex;
  try { ex = await executerPage(script, reponses, {}); } catch (e) { ok(false, 'exécution impossible : ' + e.message); }
  if (ex) {
    ok(!ex.fautes.length, 'la fenêtre meurt : ' + ex.fautes.join(' | '));
    const html = String(ex.html || '');
    const restes = new Set([...html.matchAll(/data-reste="([^"]+)"/g)].map((m) => m[1]));
    const valides = new Set([...html.matchAll(/data-valide="([^"]+)"/g)].map((m) => m[1]));
    ok(valides.size === 5 && [...valides].every((c) => COMPLETS.has(c)), 'liste « Validés » dessinée avec les 5 complets (vu : ' + valides.size + ')');
    ok(restes.size > 0 && [...restes].every((c) => !COMPLETS.has(c)), 'la grande liste ne dessine AUCUN article complet');
    ok([...PARTIELS].some((c) => restes.has(c)), 'un partiel est dessiné dans la grande liste avec son compteur');
    ok(restes.size <= 6, 'la grande liste ne dessine qu’UNE page (vu : ' + restes.size + ' lignes)');
    ok(/1 \/ 3/.test(html), 'la pagination « 1 / 3 » est présente');
    ok(/15 restants/.test(html), '« 15 restants » est affiché');
    ok(/Validés \(5\)/.test(html), 'le titre « Validés (5) » est affiché');
  }
  console.log(fautes ? '>>> ' + fautes + ' faute(s) sur ' + n + ' — la vérification à 20 articles ne tient plus'
    : 'OK  préparation à 20 articles : ' + n + ' vérifications — restants seuls et paginés, validés à part');
  process.exit(fautes ? 1 : 0);
})();
