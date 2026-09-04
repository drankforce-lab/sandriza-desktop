#!/usr/bin/env node
'use strict';

/*
 * BANC DES FONDS ET DES BORDURES SOMBRES EN MODE JOUR
 * =============================================================================
 * POURQUOI CE BANC EXISTE. Le 2026-09-04, apres avoir repare les jetons de
 * couleur (voir `banc-jetons.js`), un balayage a trouve 28 fonds sombres ecrits
 * en dur SANS reprise `html.jour`. Onze etaient de vraies surfaces : le fil des
 * etapes en haut des fiches produit et commande, le corps d'une facture, la
 * bande d'un lot d'inventaire, le panneau de l'assistant photos, la piste d'une
 * bascule. En mode jour, la fenetre passait en clair et ces pieces-la restaient
 * noires. Rien ne pouvait le dire : `banc-contraste-jour.js` ne regarde QUE le
 * texte, et c'est ecrit dans son entete — << ce qu'il ne regarde pas, et c'est
 * voulu : les fonds et les bordures >>. Ce banc est cette moitie manquante.
 *
 * Le meme balayage etendu aux BORDURES en a trouve 78 de plus, dont 75 de la
 * meme couleur (#2b3444, le contour des cartes et des champs) : un trait presque
 * noir autour d'un panneau blanc. Elles sont passees aux jetons translucides,
 * qui s'inversent tout seuls d'un mode a l'autre.
 *
 * IL NE JUGE PAS AU RATIO, et c'est voulu. Un fond n'a pas de bonne version
 * claire calculable : un panneau devient blanc, une bande devient creme, une
 * pastille de danger reste rouge. La seule question decidable par une machine
 * est : cette couleur sombre a-t-elle une reprise de jour, OUI ou NON ? Sinon,
 * elle doit etre DECLAREE dans `fonds-jour-declare.js` avec sa couleur exacte.
 * Changer la couleur invalide la declaration.
 *
 * ⚠ IL CALCULE LA SPECIFICITE, il ne compare pas des chaines. Une premiere
 * version comparait les selecteurs a l'identique et accusait 78 bordures dont
 * 34 etaient DEJA reprises : la feuille de jour corrige `html.jour input`
 * (0,1,2), ce qui l'emporte sur `.ch input` (0,1,1) sans porter le meme nom.
 * Comparer des textes aurait fait retoucher 34 declarations correctes.
 *
 * ⚠ IL LIT LA PAGE FABRIQUEE, pas le fichier source — meme lecon que
 * `banc-jetons.js` : une regle n'existe que si la page assemblee la porte.
 *
 *   node tools/banc-fonds-jour.js
 */

const fs = require('fs');
const path = require('path');
const DECLARE = require('./fonds-jour-declare.js');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');
const SEUIL_SOMBRE = 0.22;   // au-dessus, la couleur n'est plus sombre

const hx = (h) => {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16));
};
const lum = (rgb) => {
  const v = rgb.map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};

/* (identifiants, classes + attributs + pseudo-classes, elements + pseudo-elements)
   Les attributs et les pseudo-elements sont COMPTES AVANT d'etre retires : ils
   pesent dans la specificite, chacun dans sa colonne. Les effacer sans les
   compter ferait passer `.ch input[type=text]` (0,2,2) pour (0,1,1), donc pour
   une regle que la reprise de jour bat — alors qu'elle la bat, elle.
   ⚠ Et le temoin doit etre une ESPACE, pas un motif comme `~A~` : le `~` est un
   combinateur, donc `A` s'y relit comme un nom de balise et gonfle la troisieme
   colonne. Premiere version de ce banc, corrigee le jour meme. */
function spec(sel) {
  const attrs = (sel.match(/\[[^\]]*\]/g) || []).length;
  const pseudoEl = (sel.match(/::[a-z-]+/g) || []).length;
  const s = sel.replace(/\[[^\]]*\]/g, ' ').replace(/::[a-z-]+/g, ' ');
  return [
    (s.match(/#[\w-]+/g) || []).length,
    (s.match(/\.[\w-]+/g) || []).length + attrs
      + (s.match(/:(?!:)[a-z-]+(\([^)]*\))?/g) || []).length,
    (s.match(/(^|[\s>+~(])[a-z][\w-]*/gi) || []).length + pseudoEl,
  ];
}
const gagne = (a, b) => (a[0] !== b[0] ? a[0] > b[0] : a[1] !== b[1] ? a[1] > b[1] : a[2] >= b[2]);

// La reprise generique des champs, dans la feuille de jour du socle.
const SPEC_CHAMP = spec('html.jour input');
const EST_CHAMP = /(^|[\s>+~])(input|select|textarea|button)([.\[:#]|$)/;

const PROPS = [
  ['fonds', /background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6})/g, /background(-color)?\s*:/],
  ['bordures', /border[a-z-]*\s*:[^;}]*?(#[0-9a-fA-F]{3,6})/g, /border/],
];

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

  /* Les selecteurs que le mode jour REPREND, collectes en entier AVANT tout
     verdict : une reprise peut etre ecrite apres la regle qu'elle corrige, et
     l'ordre du fichier ne doit rien changer au resultat. */
  const repris = { fonds: new Set(), bordures: new Set() };
  const regles = [];
  for (const bout of css.split('}')) {
    const i = bout.indexOf('{');
    if (i < 0) continue;
    const sel = bout.slice(0, i).replace(/\s+/g, ' ').trim();
    const corps = bout.slice(i + 1);
    if (/^html\.jour/.test(sel)) {
      for (const [genre, , detecte] of PROPS) {
        if (!detecte.test(corps)) continue;
        for (const p of sel.split(',')) repris[genre].add(p.trim().replace(/^html\.jour\s*/, ''));
      }
      continue;
    }
    if (sel === ':root' || sel === 'html') continue;
    regles.push([sel, corps]);
  }

  for (const [genre, rx, ] of PROPS) {
    const dec = (DECLARE[genre] || {})[f] || {};
    for (const paire of regles) {
      const sel = paire[0];
      const parts = sel.split(',').map((p) => p.trim());
      let d;
      rx.lastIndex = 0;
      while ((d = rx.exec(paire[1]))) {
        if (lum(hx(d[1])) > SEUIL_SOMBRE) continue;
        const couvert = parts.every((p) => repris[genre].has(p)
          || (EST_CHAMP.test(p) && gagne(SPEC_CHAMP, spec(p))));
        if (couvert) continue;
        vus.add(genre + '|' + f + '|' + sel);
        if (dec[sel] && dec[sel].toLowerCase() === d[1].toLowerCase()) continue;
        nouveaux.push('  ' + genre.slice(0, 4).padEnd(5) + f.padEnd(24) + sel.slice(0, 38).padEnd(38) + ' ' + d[1]
          + (dec[sel] ? '   (declare ' + dec[sel] + ', la couleur a change)' : ''));
      }
    }
  }
}

for (const genre of ['fonds', 'bordures']) {
  for (const f of Object.keys(DECLARE[genre] || {})) {
    for (const sel of Object.keys(DECLARE[genre][f])) {
      if (!vus.has(genre + '|' + f + '|' + sel)) perimes.push('  ' + genre + '  ' + f + '  ' + sel);
    }
  }
}

if (nouveaux.length) {
  console.log('ECHEC  ' + nouveaux.length + ' couleur(s) sombre(s) sans reprise de jour et non declaree(s) :');
  console.log(nouveaux.join('\n'));
  console.log('');
  console.log('  En mode jour, la fenetre passe en clair et cette piece reste sombre.');
  console.log('  SURFACE : ajouter `html.jour <selecteur>{...}`, ou employer un jeton');
  console.log('  translucide `var(--vNN)` pour une bordure — il s inverse tout seul.');
  console.log('  PASTILLE PLEINE dont la couleur porte un sens (or, rouge, vert, violet) :');
  console.log('  la declarer dans tools/fonds-jour-declare.js.');
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
console.log('OK  fonds et bordures : tout ce qui est sombre a sa reprise de jour, ou une '
  + 'declaration a jour (' + vus.size + ' accent(s) a sens).');
