#!/usr/bin/env node
'use strict';

/*
 * BANC DES FONDS SOMBRES EN MODE JOUR
 * =============================================================================
 * POURQUOI CE BANC EXISTE. Le 2026-09-04, apres avoir repare les jetons de
 * couleur (voir `banc-jetons.js`), un balayage a trouve 28 fonds sombres ecrits
 * en dur SANS reprise `html.jour`. Onze etaient de vraies surfaces : le fil des
 * etapes en haut des fiches produit et commande, le corps d'une facture, la
 * bande d'un lot d'inventaire, le panneau de l'assistant photos, la piste d'une
 * bascule. En mode jour, la fenetre passait en clair et ces pieces-la restaient
 * noires. Rien ne pouvait le dire : `banc-contraste-jour.js` ne regarde QUE le
 * texte, et c'est ecrit dans son entete — << ce qu'il ne regarde pas, et c'est
 * voulu : les fonds >>. Ce banc est cette moitie manquante.
 *
 * IL NE JUGE PAS AU RATIO, et c'est voulu. Un fond n'a pas de bonne version
 * claire calculable : un panneau devient blanc, une bande devient creme, une
 * pastille de danger reste rouge. La seule question decidable par une machine
 * est : ce fond sombre a-t-il une reprise de jour, OUI ou NON ? S'il n'en a pas,
 * il doit etre DECLARE comme accent volontaire dans `fonds-jour-declare.js`,
 * avec sa couleur exacte. Changer la couleur invalide la declaration.
 *
 * IL LIT LA PAGE FABRIQUEE, pas le fichier source — meme lecon que
 * `banc-jetons.js` : une regle n'existe que si la page assemblee la porte.
 *
 *   node tools/banc-fonds-jour.js
 */

const fs = require('fs');
const path = require('path');
const DECLARE = require('./fonds-jour-declare.js');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');
const SEUIL_SOMBRE = 0.22;   // au-dessus, le fond n'est plus sombre

const hx = (h) => {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16));
};
const lum = (rgb) => {
  const v = rgb.map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};

const nouveaux = [];
const perimes = [];
const vus = new Set();

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

  /* Les selecteurs que le mode jour REPREND avec un fond, collectes en entier
     AVANT tout verdict : une reprise peut etre ecrite apres la regle qu'elle
     corrige, et l'ordre du fichier ne doit rien changer au resultat. */
  const repris = new Set();
  const regles = [];
  for (const bout of css.split('}')) {
    const i = bout.indexOf('{');
    if (i < 0) continue;
    const sel = bout.slice(0, i).replace(/\s+/g, ' ').trim();
    const corps = bout.slice(i + 1);
    if (/^html\.jour/.test(sel)) {
      if (/background(-color)?\s*:/.test(corps)) {
        for (const p of sel.split(',')) repris.add(p.trim().replace(/^html\.jour\s*/, ''));
      }
      continue;
    }
    if (sel === ':root' || sel === 'html') continue;
    regles.push([sel, corps]);
  }

  const dec = DECLARE[f] || {};
  for (const paire of regles) {
    const sel = paire[0];
    let d;
    const rx = /background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6})/g;
    while ((d = rx.exec(paire[1]))) {
      if (lum(hx(d[1])) > SEUIL_SOMBRE) continue;
      if (sel.split(',').some((p) => repris.has(p.trim()))) continue;   // reprise presente
      vus.add(f + '|' + sel);
      if (dec[sel] && dec[sel].toLowerCase() === d[1].toLowerCase()) continue;
      nouveaux.push('  ' + f.padEnd(24) + sel.slice(0, 40).padEnd(40) + ' ' + d[1]
        + (dec[sel] ? '   (declare ' + dec[sel] + ', la couleur a change)' : ''));
    }
  }
}

for (const f of Object.keys(DECLARE)) {
  for (const sel of Object.keys(DECLARE[f])) {
    if (!vus.has(f + '|' + sel)) perimes.push('  ' + f + '  ' + sel);
  }
}

if (nouveaux.length) {
  console.log('ECHEC  ' + nouveaux.length + ' fond(s) sombre(s) sans reprise de jour et non declare(s) :');
  console.log(nouveaux.join('\n'));
  console.log('');
  console.log('  En mode jour, la fenetre passe en clair et cette piece reste sombre.');
  console.log('  Si c est une SURFACE : ajouter `html.jour <selecteur>{background:...}`.');
  console.log('  Si c est une PASTILLE PLEINE dont la couleur porte un sens (or, rouge,');
  console.log('  vert, violet) : la declarer dans tools/fonds-jour-declare.js.');
  process.exit(1);
}
if (perimes.length) {
  console.log('ECHEC  ' + perimes.length + ' declaration(s) perimee(s) — la regle a disparu ou a recu sa reprise :');
  console.log(perimes.join('\n'));
  console.log('');
  console.log('  Retirer ces lignes de tools/fonds-jour-declare.js : une dispense qui ne');
  console.log('  correspond plus a rien couvrirait un defaut futur sous le meme nom.');
  process.exit(1);
}
console.log('OK  tout fond sombre a sa reprise de jour, ou une declaration a jour (' + vus.size + ' accent(s) plein(s)).');
