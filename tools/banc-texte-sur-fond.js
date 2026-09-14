#!/usr/bin/env node
'use strict';

/*
 * BANC DU TEXTE SUR SON PROPRE FOND, EN MODE JOUR
 * =============================================================================
 * POURQUOI CE BANC EXISTE. Le 2026-09-04, capture a l appui : << il y a encore
 * des zones de texte invisible en mode jour, corrige cela partout >>. L onglet
 * actif d une fenetre s affichait en or clair sur un fond or clair.
 *
 * CE QUE LES CONTROLES EXISTANTS NE POUVAIENT PAS VOIR. `banc-contraste-jour.js`
 * mesure chaque couleur de texte contre le fond de la PAGE (#f4f2ec). Or ces
 * textes-la ne sont pas sur la page : ils sont dans une pastille, un badge, un
 * encart, qui ont leur PROPRE fond teinte. Un vert clair sur un vert pale donne
 * 1.02 de ratio et passait inapercu, parce que le meme vert sur le creme de la
 * page franchissait le seuil. Il fallait mesurer le couple texte/fond de CHAQUE
 * regle, jetons resolus, apres application des reprises `html.jour`.
 *
 * Au premier passage : 40 regles distinctes en defaut, dont 25 sous 1.5 de ratio
 * — invisibles. La cause de fond etait un cran plus haut : les jetons de la
 * CHARTE (--sz-accent, --sz-texte, les fonds des six themes) n avaient aucune
 * valeur de jour, comme les jetons --f/--tx avant eux (voir banc-jetons.js).
 *
 * CE QU IL FAIT, EXACTEMENT. Pour chaque regle qui pose a la fois une couleur de
 * texte et un fond — le fond pouvant venir d une reprise `html.jour` du meme
 * selecteur — il resout les jetons dans leur valeur de JOUR, compose les couches
 * translucides, et exige 4.5 de ratio. Il ne mesure que ce qu il peut resoudre
 * entierement : un fond herite ou pose en JavaScript ne lui est pas visible, et
 * il se tait plutot que de deviner.
 *
 * ⚠ IL NE JUGE PAS LES FONDS RESTES SOMBRES : c est le terrain de
 * `banc-fonds-jour.js`. Ici, un texte clair sur un fond sombre est correct.
 *
 *   node tools/banc-texte-sur-fond.js
 *   node tools/banc-texte-sur-fond.js --liste
 */

const fs = require('fs');
const path = require('path');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');
/* ⚠⚠ LES FENÊTRES SANS MODE JOUR SONT ÉCARTÉES — ET LA DÉCLARATION SE VÉRIFIE.
   Ce banc demande « quand cette fenêtre bascule en jour, reste-t-elle lisible ? ».
   Une fenêtre qui n'inclut pas CSS_JOUR ne bascule JAMAIS : on mesurerait ses
   couleurs contre un fond qui n'existera pas, et l'on rapporterait des ratios de
   1,10 pour du texte blanc qui vit sur un fond sombre — les mêmes faux positifs
   que les « 55 fautes » de la première version du banc au rendu, que la capture
   d'écran a fait disparaître. Voir `tools/fenetres-mono-mode.js`, qui porte la
   raison de chaque nom ET refuse une fenêtre déclarée qui inclurait CSS_JOUR.
   ⚠ Ce qui continue de couvrir ces fenêtres : banc-jetons (aucune dispense),
   verifier-fenetres, verifier-appels-fenetres, verifier-mise-en-page,
   banc-accent-grave. Seule la question du BASCULEMENT est écartée, et seulement
   là où il n'existe pas. */
const MONO = require('./fenetres-mono-mode.js');
{
  const fMono = MONO.verifie(DOSSIER);
  if (fMono.length) {
    console.log('ECHEC  la déclaration mono-mode ne dit plus la vérité :');
    for (const x of fMono) console.log('  ' + x);
    process.exit(1);
  }
}

const SEUIL = 4.5;
/* Le fond de la page dans chaque mode — il sert de dernier recours pour composer
   une couche translucide dont on ne connait pas le fond exact. */
const PAGE = { jour: '#f4f2ec', nuit: '#0e1522' };
const LISTE = process.argv.indexOf('--liste') >= 0;

const hx = (h) => {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16));
};
const st = (r) => '#' + r.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
const lum = (rgb) => {
  const v = rgb.map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const ratio = (a, b) => {
  const l1 = lum(hx(a)), l2 = lum(hx(b));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// Une couche translucide posee sur un fond opaque donne une couleur unie.
function poser(couche, fond) {
  const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/.exec(couche);
  if (!m) return null;
  const a = m[4] === undefined ? 1 : parseFloat(m[4]);
  const f = hx(fond);
  return st([0, 1, 2].map((i) => parseFloat(m[i + 1]) * a + f[i] * (1 - a)));
}

const defauts = { jour: [], nuit: [] };
const regardees = { jour: 0, nuit: 0 };

/* ══ LES DEUX MODES, ET C EST LE SECOND QUI MANQUAIT (2026-09-14) ═══════════
 * ⚠⚠ CE BANC NE MESURAIT QUE LE JOUR — comme `banc-contraste-jour` et
 * `banc-fonds-jour`. Or LE MODE PAR DEFAUT EST LA NUIT : rien, sur ce poste, ne
 * regardait le mode dans lequel l application tourne reellement. Le seul qui le
 * faisait etait le travail `contrastes`, sur GitHub, APRES le push.
 * ⚠ RELEVE QUI L A MONTRE : sur les 40 dernieres executions, 5 echecs sur 6
 * venaient de `contrastes`, tous de vraies couleurs, toutes en NUIT. Et l une
 * d elles — #3F4855 sur #C9A97E, 4.17 — a echoue QUATRE FOIS : la meme couleur
 * repoussee sans lire le journal.
 * ⚠ LE PIEGE EXACT QU IL FERME : une reprise `html.jour` ajoutee pour corriger
 * le jour laisse la nuit en l etat. Le banc devenait vert, la faute restait.
 *
 * CE QUI CHANGE D UN MODE A L AUTRE :
 *   jetons   : le jour applique les reprises `html.jour`, la nuit ne lit que :root
 *   reprises : le jour les applique au texte et au fond, la nuit les ignore
 *   regles   : la nuit ecarte purement les regles `html.jour`
 *   fond sombre : le jour le laisse a `banc-fonds-jour` ; la nuit mesure TOUT,
 *                 parce qu aucun autre banc ne couvre ce terrain-la
 *   mono-mode : le jour les ecarte (elles ne basculent jamais) ; LA NUIT LES
 *               INCLUT — c est le seul mode ou elles existent, donc le seul ou
 *               elles peuvent etre mesurees. Les ecarter des deux passages
 *               reviendrait a ne jamais les regarder du tout.
 *
 * ⚠ CE BANC NE REMPLACE PAS LE PASSAGE AU RENDU. Il ne voit qu un couple ECRIT
 * DANS LA MEME REGLE : un fond herite, un fond `transparent` ou une couleur
 * posee par JavaScript lui echappent — et c est precisement ce qui a fait
 * tomber la 5.71.0 (un bouton en fond transparent). Le juge reste `contrastes`,
 * qui mesure la page assemblee. Celui-ci est un filet AMONT pour le cas courant.
 */
for (const mode of ['jour', 'nuit']) {
for (const f of fs.readdirSync(DOSSIER).filter((n) => n.endsWith('.js') && n !== 'socle.js')) {
  if (mode === 'jour' && MONO.estMonoMode(f)) continue;
  const mod = require(path.join(DOSSIER, f));
  const fabrique = Object.values(mod).find((v) => typeof v === 'function');
  if (!fabrique) continue;
  let page;
  try { page = String(fabrique('')); } catch (e) { continue; }

  let css = '';
  const rxS = /<style>([\s\S]*?)<\/style>/g;
  let s;
  while ((s = rxS.exec(page))) css += s[1] + '\n';
  if (!css.trim()) continue;
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');

  /* Les jetons du mode demande. EN JOUR : ce que html.jour redefinit l'emporte
     sur :root, qui sert de valeur par defaut pour ce que le jour ne reprend pas.
     EN NUIT : on ne lit QUE :root — appliquer les reprises de jour reviendrait a
     mesurer un mode qui n existe pas. */
  const jetons = {};
  const regles = [];
  for (const bout of css.split('}')) {
    const i = bout.indexOf('{');
    if (i < 0) continue;
    const sel = bout.slice(0, i).replace(/\s+/g, ' ').trim();
    const corps = bout.slice(i + 1);
    const estRepriseJour = /^html\.jour(\[|$|\s)/.test(sel);
    if (mode === 'nuit' && estRepriseJour) continue;   // la regle entiere est ecartee
    if (estRepriseJour || sel === ':root' || sel === 'html') {
      let d;
      const rxd = /(--[\w-]+)\s*:\s*([^;]+)/g;
      while ((d = rxd.exec(corps))) {
        if (estRepriseJour || !(d[1] in jetons)) jetons[d[1]] = d[2].trim();
      }
    }
    regles.push([sel, corps]);
  }

  const val = (x, fond) => {
    if (!x) return null;
    x = x.trim();
    let n = 0;
    while (/^var\(\s*(--[\w-]+)/.test(x) && n++ < 5) {
      const nom = /^var\(\s*(--[\w-]+)/.exec(x)[1];
      if (!(nom in jetons)) return null;
      x = jetons[nom].trim();
    }
    if (/^#[0-9a-fA-F]{3,6}$/.test(x)) return x;
    if (/^rgba?\(/.test(x)) return poser(x, fond);
    return null;
  };

  /* Les reprises de jour, indexees BRANCHE PAR BRANCHE : un selecteur multiple
     cherche sur sa chaine entiere ne se retrouve jamais.
     ⚠ EN NUIT ELLES RESTENT VIDES : les regles `html.jour` ont deja ete ecartees
     plus haut, et les appliquer decrirait un mode qui n existe pas. */
  const fondJour = {};
  const txtJour = {};
  if (mode === 'jour') {
    for (const [sel, corps] of regles) {
      if (!/^html\.jour/.test(sel)) continue;
      const b = /background(?:-color)?\s*:\s*([^;]+)/.exec(corps);
      const c = /(?:^|[;{\s])color\s*:\s*([^;]+)/.exec(corps);
      for (const p of sel.split(',')) {
        const n = p.trim().replace(/^html\.jour\s*/, '');
        if (b) fondJour[n] = b[1].trim();
        if (c) txtJour[n] = c[1].trim();
      }
    }
  }

  for (const [sel, corps] of regles) {
    const estJour = /^html\.jour/.test(sel);
    const nu = sel.replace(/^html\.jour\s*/, '');
    const b1 = nu.split(',')[0].trim();
    const cLoc = /(?:^|[;{\s])color\s*:\s*([^;]+)/.exec(corps);
    const brut = (estJour ? null : (txtJour[nu] || txtJour[sel] || txtJour[b1]))
              || (cLoc ? cLoc[1] : null);
    if (!brut) continue;
    // La reprise de jour passe AVANT le fond de nuit : mesurer un texte de jour
    // sur un fond de nuit decrit une situation qui n'existe pas.
    const bRaw = (estJour ? null : (fondJour[nu] || fondJour[sel] || fondJour[b1]))
              || (/background(?:-color)?\s*:\s*([^;]+)/.exec(corps) || [])[1];
    if (!bRaw) continue;
    const fond = val(bRaw, PAGE[mode]);
    if (!fond) continue;
    const txt = val(brut, fond);
    if (!txt) continue;
    regardees[mode]++;
    /* ⚠ EN JOUR SEULEMENT : un fond reste sombre appartient a `banc-fonds-jour`.
       EN NUIT on mesure TOUT — aucun autre banc ne couvre ce terrain, et c est
       justement sur fond sombre que vivent les fautes de nuit. */
    if (mode === 'jour' && lum(hx(fond)) <= 0.4) continue;
    const r = ratio(txt, fond);
    if (r >= SEUIL) continue;
    defauts[mode].push('  ' + f.padEnd(22) + nu.slice(0, 40).padEnd(40)
      + ' texte ' + txt + ' sur ' + fond + '  ratio ' + r.toFixed(2));
  }
}
}

const uJour = [...new Set(defauts.jour)];
const uNuit = [...new Set(defauts.nuit)];

const dire = (mode, u) => {
  if (!u.length) return;
  console.log('ECHEC  ' + u.length + ' couple(s) texte/fond sous ' + SEUIL + ' en mode ' + mode + ' :');
  console.log(u.slice(0, LISTE ? 999 : 20).join('\n'));
  if (!LISTE && u.length > 20) console.log('  ... ' + (u.length - 20) + ' autres (--liste)');
  console.log('');
};

dire('jour', uJour);

/* ══ LE MODE NUIT PASSE PAR UN PLAFOND, ET C EST DELIBERE ═══════════════════
 * ⚠⚠ AU MOMENT OU CE PASSAGE EST NE, `contrastes` — le banc qui mesure la page
 * ASSEMBLEE dans un navigateur — EST VERT, et ce releve-ci compte 10 couples.
 * Les deux ne peuvent pas avoir raison ensemble, et c est le RENDU qui tranche :
 * une couleur ne se deduit pas du CSS. Un element jamais visible, un texte
 * grand ou gras (seuil 3.0), un fond pose par JavaScript : ce releve ne voit
 * rien de tout ca.
 * ⚠ ET CE POSTE NE PEUT PAS TRANCHER : `banc-contraste-rendu` lance Chrome des
 * dizaines de fois et a fait tomber l affichage de la machine deux fois. Il ne
 * tourne QUE sur GitHub. Accuser dix regles sans les avoir mesurees serait
 * refaire les << 55 fautes >> de la premiere version du banc au rendu.
 * ➡ LE PLAFOND FAIT DONC UNE SEULE CHOSE, ET ELLE SUFFIT : il refuse la
 *   ONZIEME. Une couleur de nuit ajoutee demain est arretee ICI, en quelques
 *   millisecondes, au lieu d aller echouer sur GitHub quatre minutes plus tard.
 *   C est ce qui est arrive cinq fois sur six en septembre. */
const PLAFOND = require('./texte-sur-fond-declare.js').NUIT_PLAFOND;
if (uNuit.length > PLAFOND) {
  dire('nuit', uNuit);
  console.log('  NON  le plafond declare est ' + PLAFOND + ' — la dette de NUIT gagne du terrain.');
} else if (uNuit.length) {
  /* ⚠ LA LISTE S IMPRIME MEME SOUS LE PLAFOND. Un plafond muet devient une
     dette invisible, et l on finit par lire << c est normal qu il en reste >>. */
  console.log('  --   ' + uNuit.length + ' couple(s) de NUIT sous le seuil, dans le plafond declare ('
    + PLAFOND + ') — a regler au rendu, voir #121 :');
  console.log(uNuit.slice(0, LISTE ? 999 : 12).join('\n'));
  if (!LISTE && uNuit.length > 12) console.log('  ... ' + (uNuit.length - 12) + ' autres (--liste)');
  if (uNuit.length < PLAFOND) {
    console.log('  --   plafond ' + PLAFOND + ' : resserrer a ' + uNuit.length
      + ' dans tools/texte-sur-fond-declare.js');
  }
  console.log('');
}

if (uJour.length) {
  console.log('  JOUR — le texte est illisible sur le fond de son PROPRE element. Ajouter une');
  console.log('  reprise `html.jour <selecteur>{color:...}` — en assombrissant la couleur');
  console.log('  d origine du minimum necessaire, sa teinte conservee. Le bloc');
  console.log('  CSS_JOUR_TEXTES de socle.js est fait pour ca, et vient en dernier.');
  console.log('');
}
if (uNuit.length > PLAFOND) {
  /* ⚠ ON NE PROPOSE PAS DE REPRISE `html.jour` ICI, ET C EST TOUT L INTERET :
     la faute est dans la regle D ORIGINE, celle qui vaut pour le mode par
     defaut. Une reprise de jour l aurait masquee dans un seul mode — c est
     exactement ainsi que ces couples sont arrives jusqu a GitHub. */
  console.log('  NUIT — la faute est dans la regle elle-meme, pas dans une reprise :');
  console.log('  c est le mode PAR DEFAUT. Corriger la couleur a la source, ou le fond.');
  console.log('  ⚠ N ajoutez PAS de reprise `html.jour` : elle corrigerait le jour et');
  console.log('  laisserait la nuit en l etat — la faute a corriger.');
  console.log('');
}
if (uJour.length || uNuit.length > PLAFOND) process.exit(1);

console.log('OK  ' + regardees.jour + ' couples mesures en jour, ' + regardees.nuit
  + ' en nuit : aucun nouveau couple illisible.');
