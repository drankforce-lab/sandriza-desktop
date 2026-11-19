'use strict';
/*
 * LES THÈMES DU LOOK « ÉPURÉ » (2026-11-18, sa demande : « remplace jeux de couleurs par thèmes ; les thèmes doivent
 * toujours utiliser le look épuré ; crée-moi de vrais beaux thèmes ; il peut y avoir des images en fond »).
 * Maquette validée (« fait tous les thèmes ») : https://claude.ai/artifact/Pi76phzzboxaFF9Uzy8J2b
 *
 * Un thème ne touche QUE l'accent (bouton principal, onglet actif, menu), la teinte de la page et son fond en image.
 * La mise en page, les cartes (unies, pour rester lisibles) et les TROIS TONS d'état (neutre, ambre, rouge) ne bougent
 * pas : ils appartiennent au look, pas au thème.
 *
 * Le fond « en image » est fait de lumières floues superposées (dégradés) — de jour, à demi-intensité (2026-11-19 : le banc
 * des contrastes au rendu a montré que les petits textes posés sur la page tombaient sous 4,5 au cœur du halo) : aucun fichier, net à toute taille, et le
 * même dans toutes les fenêtres. Il se pose sur la page, derrière les cartes.
 *
 * Contrastes (tools/banc-teintes.js les mesure) : texte blanc sur `prim` le jour, texte foncé sur `primN` la nuit,
 * `txOr` sur blanc le jour et `txOrN` sur la carte de nuit, texte foncé (#17202c) sur `or` : tous ≥ 4,5.
 */
const TEINTES = [
  { id: 'epure', nom: 'Épuré', en: 'Pure' },   // l'actuel : aucune surcharge
  { id: 'sauge', nom: 'Sauge', en: 'Sage',
    prim: '#4a6645', primFort: '#3a5236', or: '#a9c29a', orRgb: '169,194,154', txOr: '#3a5236', doux: 'rgba(74,102,69,.12)',
    primN: '#a9c29a', primFortN: '#bcd4ae', txOrN: '#bcd4ae', douxN: 'rgba(169,194,154,.16)',
    page: '#f2f4ef', pageN: '#10150f',
    fond: 'radial-gradient(40% 55% at 12% 20%,rgba(138,170,120,0.112),transparent 70%),radial-gradient(45% 60% at 88% 85%,rgba(196,214,170,0.175),transparent 70%),radial-gradient(35% 45% at 70% 10%,rgba(232,226,200,0.21),transparent 70%)',
    fondN: 'radial-gradient(40% 55% at 12% 20%,rgba(80,120,70,0.15),transparent 70%),radial-gradient(45% 60% at 88% 85%,rgba(60,90,60,0.15),transparent 70%)' },
  { id: 'lagune', nom: 'Lagune', en: 'Lagoon',
    prim: '#1c666e', primFort: '#16545b', or: '#8fcfd3', orRgb: '143,207,211', txOr: '#16545b', doux: 'rgba(28,102,110,.12)',
    primN: '#7cc7cc', primFortN: '#9fd9dc', txOrN: '#9fd9dc', douxN: 'rgba(124,199,204,.16)',
    page: '#f0f5f6', pageN: '#0c1416',
    fond: 'radial-gradient(50% 60% at 85% 15%,rgba(120,200,205,0.14),transparent 70%),radial-gradient(45% 55% at 10% 90%,rgba(70,140,170,0.091),transparent 70%),radial-gradient(30% 40% at 40% 40%,rgba(220,240,240,0.245),transparent 70%)',
    fondN: 'radial-gradient(50% 60% at 85% 15%,rgba(40,120,130,0.18),transparent 70%),radial-gradient(45% 55% at 10% 90%,rgba(20,70,100,0.2),transparent 70%)' },
  { id: 'poudre', nom: 'Rose poudré', en: 'Powder pink',
    prim: '#8f4659', primFort: '#7a3a4b', or: '#e6b3bf', orRgb: '230,179,191', txOr: '#7a3a4b', doux: 'rgba(143,70,89,.12)',
    primN: '#e3a6b5', primFortN: '#efbcc8', txOrN: '#efbcc8', douxN: 'rgba(227,166,181,.16)',
    page: '#f8f3f4', pageN: '#161012',
    fond: 'radial-gradient(40% 50% at 15% 15%,rgba(240,190,200,0.196),transparent 70%),radial-gradient(45% 55% at 90% 80%,rgba(250,215,200,0.196),transparent 70%),radial-gradient(30% 40% at 60% 30%,rgba(255,240,240,0.28),transparent 70%)',
    fondN: 'radial-gradient(40% 50% at 15% 15%,rgba(150,70,90,0.16),transparent 70%),radial-gradient(45% 55% at 90% 80%,rgba(120,60,70,0.14),transparent 70%)' },
  { id: 'laiton', nom: 'Ardoise et laiton', en: 'Slate and brass',
    prim: '#6b5a2e', primFort: '#5a4a22', or: '#d6c088', orRgb: '214,192,136', txOr: '#5a4a22', doux: 'rgba(107,90,46,.12)',
    primN: '#d1b76e', primFortN: '#e2cd8f', txOrN: '#e2cd8f', douxN: 'rgba(209,183,110,.16)',
    page: '#eef0f2', pageN: '#121519',
    fond: 'linear-gradient(160deg,rgba(255,255,255,0.196),transparent 40%),radial-gradient(60% 70% at 100% 100%,rgba(120,135,150,0.091),transparent 70%)',
    fondN: 'radial-gradient(60% 70% at 100% 100%,rgba(90,105,120,0.14),transparent 70%),radial-gradient(40% 50% at 0% 0%,rgba(209,183,110,0.05),transparent 70%)' },
  { id: 'abricot', nom: 'Abricot', en: 'Apricot',
    prim: '#9c4b17', primFort: '#843f12', or: '#f2b48a', orRgb: '242,180,138', txOr: '#843f12', doux: 'rgba(156,75,23,.12)',
    primN: '#f0a46a', primFortN: '#f6bd8f', txOrN: '#f6bd8f', douxN: 'rgba(240,164,106,.16)',
    page: '#f8f4f0', pageN: '#15110e',
    fond: 'radial-gradient(55% 60% at 90% 10%,rgba(255,200,150,0.196),transparent 70%),radial-gradient(45% 55% at 5% 95%,rgba(250,180,160,0.14),transparent 70%)',
    fondN: 'radial-gradient(55% 60% at 90% 10%,rgba(170,80,30,0.16),transparent 70%),radial-gradient(45% 55% at 5% 95%,rgba(120,50,40,0.14),transparent 70%)' },
  { id: 'lavande', nom: 'Lavande', en: 'Lavender',
    prim: '#574a85', primFort: '#483c70', or: '#c3b8ec', orRgb: '195,184,236', txOr: '#483c70', doux: 'rgba(87,74,133,.12)',
    primN: '#b6a8e6', primFortN: '#c9bff0', txOrN: '#c9bff0', douxN: 'rgba(182,168,230,.16)',
    page: '#f3f2f8', pageN: '#121119',
    fond: 'radial-gradient(45% 55% at 85% 20%,rgba(190,175,235,0.161),transparent 70%),radial-gradient(40% 50% at 10% 85%,rgba(215,200,240,0.196),transparent 70%)',
    fondN: 'radial-gradient(45% 55% at 85% 20%,rgba(100,80,170,0.16),transparent 70%),radial-gradient(40% 50% at 10% 85%,rgba(70,50,120,0.16),transparent 70%)' },
  { id: 'minuit', nom: 'Minuit doré', en: 'Golden midnight',
    prim: '#7a5b1e', primFort: '#5e4614', or: '#e2c58a', orRgb: '226,197,138', txOr: '#5e4614', doux: 'rgba(122,91,30,.12)',
    primN: '#e2bf72', primFortN: '#ecd08f', txOrN: '#ecd08f', douxN: 'rgba(226,191,114,.16)',
    page: '#eef0f5', pageN: '#0b0f1c',
    fond: 'radial-gradient(50% 60% at 50% 0%,rgba(190,200,230,0.14),transparent 70%)',
    fondN: 'radial-gradient(60% 70% at 80% 0%,rgba(40,60,130,0.25),transparent 70%),radial-gradient(40% 50% at 10% 100%,rgba(226,191,114,0.06),transparent 70%)' },
];
const IDS = TEINTES.map((t) => t.id);
const teinteValide = (v) => (IDS.indexOf(String(v || '')) >= 0 ? String(v) : 'epure');
const teinte = (id) => TEINTES.find((t) => t.id === teinteValide(id));

/* La CARTE DE NUIT d'un thème (2026-11-19, sa demande : « corrige les cartes de nuit ») : le bleu nuit d'Épuré, mêlé d'une
   pointe de l'accent — elle restait #181e29 dans tous les thèmes, bleutée sur un fond vert, rose ou orangé. */
const _mix = (a, b, t) => {
  const h = (x) => [1, 3, 5].map((i) => parseInt(String(x).slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return '#' + A.map((v, i) => Math.round(v * t + B[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
};
const carteNuit = (t, n) => (t && t.primN ? _mix(t.primN, ['#181e29', '#1c2330', '#131822', '#222a38'][n || 0], 0.07) : null);

/* La feuille : une règle jour et une règle nuit par thème, posées sur <html data-sz-theme="epure" data-sz-teinte="…">.
   Spécificité au-dessus des jetons d'Épuré (deux attributs + .jour) : le thème gagne sans !important. */
const css = () => TEINTES.filter((t) => t.prim).map((t) => {
  const s = 'html[data-sz-theme="epure"][data-sz-teinte="' + t.id + '"]';
  return s + '.jour{--sz-accent:' + t.prim + ';--sz-accent-fort:' + t.primFort + ';--sz-accent-doux:' + t.doux
      + ';--sz-btn-prim:' + t.prim + ';--sz-btn-prim-fort:' + t.primFort + ';--sz-repere:' + t.prim
      + ';--or:' + t.or + ';--or-rgb:' + t.orRgb + ';--or-clair:' + t.or + ';--tx-or:' + t.txOr + ';--tx-or2:' + t.txOr
      + ';--f-page:' + t.page + ';--f-bande:' + t.page + ';--sz-fond:' + t.page + '}\n'
    + s + ':not(.jour){--sz-accent:' + t.primN + ';--sz-accent-fort:' + t.primFortN + ';--sz-accent-doux:' + t.douxN
      + ';--sz-btn-prim:' + t.primN + ';--sz-btn-prim-fort:' + t.primFortN + ';--sz-repere:' + t.primN
      + ';--or:' + t.primN + ';--or-clair:' + t.primFortN + ';--tx-or:' + t.txOrN
      + ';--f-page:' + t.pageN + ';--sz-fond:' + t.pageN
      + ';--f-carte:' + carteNuit(t, 0) + ';--sz-surface:' + carteNuit(t, 0) + ';--f-131c2b:' + carteNuit(t, 0) + ';--f-pied:' + carteNuit(t, 2)
      + ';--f-carte2:' + carteNuit(t, 1) + ';--sz-surface2:' + carteNuit(t, 1) + ';--f-bande:' + carteNuit(t, 1)
      + ';--f-champ:' + carteNuit(t, 2) + ';--f-0f1826:' + carteNuit(t, 2) + ';--f-0f172a:' + carteNuit(t, 2)
      + ';--f-pill:' + carteNuit(t, 3) + ';--f-entete:' + carteNuit(t, 3) + '}\n'
    + s + '.jour body{background-color:var(--f-page);background-image:' + t.fond + ';background-attachment:fixed}\n'
    + s + ':not(.jour) body{background-color:var(--f-page);background-image:' + t.fondN + ';background-attachment:fixed}\n';
}).join('');

/* La couleur de la page avant la première peinture (fond des fenêtres pendant qu'elles chargent). */
const fondPage = (id, sombre) => { const t = teinte(id); return t.prim ? (sombre ? t.pageN : t.page) : (sombre ? '#11151d' : '#f4f5f9'); };

module.exports = { TEINTES, IDS, teinteValide, teinte, css, fondPage, carteNuit };
