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
const SEUIL = 4.5;
const PAGE = '#f4f2ec';
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

const defauts = [];
let regardees = 0;

for (const f of fs.readdirSync(DOSSIER).filter((n) => n.endsWith('.js') && n !== 'socle.js')) {
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

  /* Les jetons, en valeur de JOUR : ce que html.jour redefinit l'emporte sur
     :root, qui sert de valeur par defaut pour ce que le jour ne reprend pas. */
  const jour = {};
  const regles = [];
  for (const bout of css.split('}')) {
    const i = bout.indexOf('{');
    if (i < 0) continue;
    const sel = bout.slice(0, i).replace(/\s+/g, ' ').trim();
    const corps = bout.slice(i + 1);
    if (/^html\.jour(\[|$|\s)/.test(sel) || sel === ':root' || sel === 'html') {
      let d;
      const rxd = /(--[\w-]+)\s*:\s*([^;]+)/g;
      while ((d = rxd.exec(corps))) {
        if (/^html\.jour/.test(sel) || !(d[1] in jour)) jour[d[1]] = d[2].trim();
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
      if (!(nom in jour)) return null;
      x = jour[nom].trim();
    }
    if (/^#[0-9a-fA-F]{3,6}$/.test(x)) return x;
    if (/^rgba?\(/.test(x)) return poser(x, fond);
    return null;
  };

  /* Les reprises de jour, indexees BRANCHE PAR BRANCHE : un selecteur multiple
     cherche sur sa chaine entiere ne se retrouve jamais. */
  const fondJour = {};
  const txtJour = {};
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
    const fond = val(bRaw, PAGE);
    if (!fond) continue;
    const txt = val(brut, fond);
    if (!txt) continue;
    regardees++;
    if (lum(hx(fond)) <= 0.4) continue;            // fond sombre : banc-fonds-jour
    const r = ratio(txt, fond);
    if (r >= SEUIL) continue;
    defauts.push('  ' + f.padEnd(22) + nu.slice(0, 40).padEnd(40)
      + ' texte ' + txt + ' sur ' + fond + '  ratio ' + r.toFixed(2));
  }
}

const u = [...new Set(defauts)];
if (u.length) {
  console.log('ECHEC  ' + u.length + ' couple(s) texte/fond sous ' + SEUIL + ' en mode jour :');
  console.log(u.slice(0, LISTE ? 999 : 20).join('\n'));
  if (!LISTE && u.length > 20) console.log('  ... ' + (u.length - 20) + ' autres (--liste)');
  console.log('');
  console.log('  Le texte est illisible sur le fond de son PROPRE element. Ajouter une');
  console.log('  reprise `html.jour <selecteur>{color:...}` — en assombrissant la couleur');
  console.log('  d origine du minimum necessaire, sa teinte conservee. Le bloc');
  console.log('  CSS_JOUR_TEXTES de socle.js est fait pour ca, et vient en dernier.');
  process.exit(1);
}
console.log('OK  ' + regardees + ' couples texte/fond mesures : tous lisibles en mode jour.');
