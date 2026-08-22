#!/usr/bin/env node
'use strict';

/*
 * BANC — LE GARDE DES SAISIES EN COURS
 * =============================================================================
 * Ce garde a deux façons de mal tourner, et la SECONDE est pire que le défaut
 * qu'il corrige :
 *
 *   1. Trop permissif : la fenêtre part avec la saisie. C'est la perte qu'on
 *      voulait éviter, et elle est silencieuse — personne ne sait qu'il y avait
 *      quelque chose à garder.
 *   2. Trop strict : l'application ne se ferme PLUS. On finit par la tuer depuis
 *      le gestionnaire des tâches, c'est-à-dire par le geste le plus destructeur
 *      de tous. Une fenêtre incondamnable est pire que la perte qu'on évite.
 *
 * ⚠ CE QUE CE BANC ÉPROUVE, ET CE QU'IL N'ÉPROUVE PAS. Il importe la VRAIE règle
 * (`src/brouillon-garde.js`), il n'en recopie pas une version — c'est pour cela
 * qu'elle a été sortie de `main.js`, qui exige le processus principal
 * d'Electron. En revanche il ne dessine aucune fenêtre : ce sont les DÉCISIONS
 * qu'on met à l'épreuve, et c'est là que sont les fautes, pas dans les minuteries.
 *
 *     node tools/banc-brouillon-garde.js
 */

const G = require('../src/brouillon-garde');

let fautes = 0;
const dit = (ok, s) => { if (!ok) fautes++; console.log((ok ? 'OK   ' : 'ÉCHEC ') + s); };
const eq = (a, b, s) => dit(a === b, s + '  (attendu ' + JSON.stringify(b) + ', obtenu ' + JSON.stringify(a) + ')');

// ── Un faux monde d'ancrage, juste assez réel ───────────────────────────────
const vue = (id, detruite) => ({ webContents: { id, isDestroyed: () => !!detruite } });
const fen = (detruite) => ({ isDestroyed: () => !!detruite });
const monde = (entrees) => new Map(entrees);

console.log('— Quelle vue a une saisie en cours ?');
{
  const m = monde([
    ['tableau', { view: vue(1), fenetre: null }],
    ['coupons', { view: vue(2), fenetre: null }],
    ['sociaux', { view: vue(3), fenetre: null }],
  ]);
  eq(G.premiereAncreeSale(m, () => false), null, 'aucune sale : rien a signaler');
  const r = G.premiereAncreeSale(m, (id) => id === 2);
  dit(r && r[0] === 'coupons', 'la vue sale est trouvee et NOMMEE');
}

console.log('— ⚠ UNE VUE DÉTACHÉE EST IGNORÉE : elle a sa propre fenêtre, donc son propre garde');
{
  const m = monde([['coupons', { view: vue(2), fenetre: fen(false) }]]);
  eq(G.premiereAncreeSale(m, () => true), null,
    'detachee et sale -> ignoree ici (sinon la question serait posee DEUX fois)');
  // Mais si sa fenêtre est déjà détruite, la vue est de nouveau la nôtre.
  const m2 = monde([['coupons', { view: vue(2), fenetre: fen(true) }]]);
  dit(G.premiereAncreeSale(m2, () => true) !== null,
    'fenetre detruite -> la vue redevient a nous');
}

console.log('— ⚠ UNE VUE DÉTRUITE N EMPÊCHE PAS DE FERMER');
{
  // Son identifiant a pu être réattribué : la croire sale refuserait la
  // fermeture pour une saisie qui n'existe plus, sans rien afficher.
  const m = monde([['coupons', { view: vue(2, true), fenetre: null }]]);
  eq(G.premiereAncreeSale(m, () => true), null, 'vue detruite -> ignoree');
  eq(G.premiereAncreeSale(monde([['x', { view: null, fenetre: null }]]), () => true), null, 'sans vue -> ignoree');
  eq(G.premiereAncreeSale(monde([['x', null]]), () => true), null, 'entree vide -> ignoree, pas de plantage');
}

console.log('— L ordre des questions à la fermeture');
{
  const d = (o) => G.decisionFermeture(Object.assign(
    { bloqueeParMaj: false, dejaAutorise: false, aUneSaisie: false, demandeEnCours: false }, o));
  eq(d({}), 'laisser', 'rien a perdre : on sort AVANT tout le reste');
  eq(d({ aUneSaisie: true }), 'demander', 'une saisie : on demande');
  eq(d({ aUneSaisie: true, demandeEnCours: true }), 'secours', 'deja demande : le second geste ferme');
  eq(d({ aUneSaisie: true, dejaAutorise: true }), 'laisser', 'deja repondu : on laisse partir');
  // ⚠ L'ORDRE EST LA RÈGLE. La mise à jour passe AVANT tout, y compris avant
  // « rien a perdre » : sinon une fenêtre sans saisie se fermerait pendant
  // l'installation, et l'application ne redémarrerait plus.
  eq(d({ bloqueeParMaj: true }), 'refuser_maj', 'mise a jour : refus, meme sans saisie');
  eq(d({ bloqueeParMaj: true, aUneSaisie: true }), 'refuser_maj', 'mise a jour : refus, avant la question');
  eq(d({ bloqueeParMaj: true, aUneSaisie: true, demandeEnCours: true }), 'refuser_maj',
    '⚠ mise a jour : refus MEME en sortie de secours');
}

console.log('— Le choix rapporté par la page');
{
  eq(G.gestePourChoix(0), 'garder', '0 = garder');
  eq(G.gestePourChoix(1), 'jeter', '1 = jeter');
  eq(G.gestePourChoix(2), 'revenir', '2 = revenir');
  /* ⚠ TOUT LE RESTE VAUT GARDER, et c'est la règle qui compte le plus ici : une
     page qui ne sait pas répondre rend `-1`, une promesse rejetée ne rend rien.
     Si l'un de ces cas tombait sur « jeter », le mécanisme anti-perte
     DÉTRUIRAIT la saisie qu'il est censé sauver. */
  eq(G.gestePourChoix(-1), 'garder', '⚠ -1 (page qui ne sait pas repondre) = GARDER');
  eq(G.gestePourChoix(undefined), 'garder', '⚠ undefined = GARDER');
  eq(G.gestePourChoix(null), 'garder', '⚠ null = GARDER');
  eq(G.gestePourChoix('1'), 'garder', '⚠ la CHAINE "1" ne jette pas (comparaison stricte)');
}

/* ══ TÉMOIN — LE BANC SAIT-IL REFUSER ? ══════════════════════════════════════
   Presque tout ci-dessus attend une valeur précise, donc le risque de banc muet
   est faible — sauf pour `premiereAncreeSale`, dont trois cas attendent `null`.
   Un `premiereAncreeSale` qui rendrait TOUJOURS `null` (une boucle vide, un
   `return` égaré) passerait ces trois-là, et seul le premier bloc le verrait.
   On l'affirme donc explicitement. */
console.log('— TÉMOIN : une règle qui ne trouve jamais rien doit se distinguer');
{
  const m = monde([['coupons', { view: vue(7), fenetre: null }]]);
  const vraie = G.premiereAncreeSale(m, () => true);
  const fausse = () => null;
  dit(vraie !== null && fausse() === null,
    '⚠ LA VRAIE RÈGLE TROUVE là où la fausse rend null — sinon ce banc ne prouve rien');
}

console.log(fautes ? '\n' + fautes + ' ÉCHEC(S)' : '\nLe garde decide juste.');
process.exit(fautes ? 1 : 0);
