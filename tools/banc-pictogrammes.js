#!/usr/bin/env node
'use strict';

/*
 * BANC DES PICTOGRAMMES — MONOCHROMES, ET VISIBLES DANS LES DEUX MODES
 * =============================================================================
 * La règle date du 2026-08-19, de lui, capture à l'appui : « les emojis sont pas
 * encore en noir et blanc, sa devrais toujours etre comme sa ». Elle vit à UN
 * seul endroit — la règle `.ic` de `socle.js` — pour les 91 fenêtres.
 *
 * ⚠⚠ ET RIEN NE LA VÉRIFIAIT. Deux défauts en sont sortis, tous deux signalés par
 * lui plutôt que par une machine :
 *
 *   1. Le 2026-09-04 : `.ic` filtrait avec `brightness(1.6)`, ce qui ÉCLAIRCIT.
 *      Juste sur fond sombre ; en mode jour, le pictogramme devenait BLANC SUR
 *      BLANC. 286 pictogrammes étaient purement invisibles, dont le cadenas de
 *      « Section verrouillée » et la carte bancaire d'un détail de commande.
 *   2. Le même jour : 415 pictogrammes n'étaient pas dans `.ic` du tout — donc
 *      en couleur, contre la norme. La règle existait, rien ne disait qui s'y
 *      soustrayait.
 *
 * CE QU'IL VÉRIFIE
 *   • que `.ic` a bien une reprise `html.jour` qui ASSOMBRIT (sans quoi le
 *     pictogramme est invisible en mode jour — le défaut 1, qui ne lève rien) ;
 *   • que le nombre de pictogrammes HORS `.ic` ne remonte pas.
 *
 * ⚠ POURQUOI UN PLAFOND ET PAS ZÉRO. Il reste des pictogrammes dans des textes
 * rendus par `textContent` — les messages de `szDire`, les titres de fenêtre.
 * Les envelopper y afficherait le balisage EN CLAIR : `<span class="ic">`
 * s'écrirait à l'écran. Pour ceux-là, la seule voie propre est de les RETIRER du
 * texte (c'est déjà la règle pour les courriels, où aucun filtre CSS ne tient) —
 * une décision de rédaction, pas une conversion mécanique. En attendant, le
 * nombre est plafonné : il ne peut que descendre.
 *
 *   node tools/banc-pictogrammes.js
 *   node tools/banc-pictogrammes.js --liste
 */

const fs = require('fs');
const path = require('path');
const DECLARE = require('./pictogrammes-declare.js');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');

/* Pictogrammes en COULEUR. On écarte les signes qui n'en sont pas : flèches,
   coches, croix, symboles typographiques. Ceux-là s'affichent dans la couleur du
   texte et ne violent aucune norme. */
const RX = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]/gu;
const SIGNES = new Set(['←','↑','→','↓','↵','✓','✔','✕','✗','×','⧉','⚓','⚙','⛶','⟳','•','·','➕','⬇','⬆','↩','↻','↧','⇄','☰']);

let mal = 0;

// ── 1. La règle `.ic` et sa reprise de jour ─────────────────────────────────
const socle = fs.readFileSync(path.join(DOSSIER, 'socle.js'), 'utf8');
const regleIc = socle.match(/(^|\n)\.ic\{([^}]*)\}/);
const jourIc = socle.match(/html\.jour\s+\.ic\{([^}]*)\}/);
if (!regleIc) {
  mal++; console.log('  NON  la règle .ic a disparu de socle.js — plus aucun pictogramme n est grisé');
} else if (!jourIc) {
  mal++; console.log('  NON  .ic n a PAS de reprise html.jour — en mode jour, brightness(1.6) rend le pictogramme BLANC SUR BLANC');
} else {
  const b = (jourIc[1].match(/brightness\(([0-9.]+)\)/) || [])[1];
  if (b === undefined || parseFloat(b) >= 1) {
    mal++;
    console.log('  NON  la reprise html.jour de .ic n assombrit pas (brightness ' + (b || 'absent')
      + ') — sur un fond clair il faut un multiplicateur INFERIEUR a 1');
  } else {
    console.log('  OK   .ic eclaircit sur fond sombre et assombrit en jour (brightness ' + b + ')');
  }
}

// ── 2. Les pictogrammes restés hors de la règle ─────────────────────────────
const parFic = new Map();
let total = 0;
for (const f of fs.readdirSync(DOSSIER).filter((x) => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(DOSSIER, f), 'utf8');
  // Les commentaires ne s affichent pas : un pictogramme dans une fiche ne
  // viole rien, et l y compter rendrait le banc rouge sur de la prose.
  const nu = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
                .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));
  let m; RX.lastIndex = 0; let n = 0;
  while ((m = RX.exec(nu))) {
    if (SIGNES.has(m[0])) continue;
    const amont = nu.slice(Math.max(0, m.index - 90), m.index);
    if (/class="ic"[^<]*$/.test(amont)) continue;
    n++;
  }
  if (n) { parFic.set(f, n); total += n; }
}

const plafond = DECLARE.HORS_IC;
console.log('');
console.log('  --   ' + total + ' pictogramme(s) hors de la regle .ic, dans ' + parFic.size + ' fenetre(s)');
if (total > plafond) {
  mal++;
  console.log('  NON  le plafond declare est ' + plafond + ' — la dette GAGNE du terrain');
} else if (total < plafond) {
  console.log('  --   plafond ' + plafond + ' : resserrer a ' + total + ' dans pictogrammes-declare.js');
}
if (process.argv.includes('--liste')) {
  for (const [f, n] of [...parFic.entries()].sort((a, b) => b[1] - a[1]))
    console.log('       ' + f.padEnd(26) + n);
}

if (mal) {
  console.log('\n>>> ' + mal + ' probleme(s) — la norme du noir et blanc recule');
  process.exit(1);
}
console.log('\n>>> les pictogrammes restent monochromes, et visibles dans les deux modes');
