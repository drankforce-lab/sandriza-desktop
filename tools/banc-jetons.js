#!/usr/bin/env node
'use strict';

/*
 * BANC DES JETONS — CHAQUE var() EST-IL DEFINI DANS SA PROPRE PAGE ?
 * =============================================================================
 * POURQUOI CE BANC EXISTE. Le 2026-09-04, il a signale TROIS fois de suite que
 * le bandeau d'en-tete des tableaux restait invisible en mode sombre, et trois
 * corrections ont echoue parce qu'aucune ne visait la vraie cause. Un navigateur
 * a fini par la donner : getPropertyValue('--f-entete') rendait VIDE. Le jeton
 * n'etait defini NULLE PART en mode sombre.
 *
 * La raison tient a l'assemblage des feuilles. Le bloc :root des jetons de NUIT
 * vivait dans CSS_SOCLE — que seules 4 fenetres incluent. Les 89 autres
 * n'incluent que CSS_JOUR, ou seul le bloc html.jour existe. Resultat : en mode
 * sombre ces fenetres n'avaient AUCUN jeton, et chaque var() y etait une valeur
 * INVALIDE. Le fond de page ne s'en voyait pas — color-scheme:dark donne deja un
 * fond sombre par defaut — ce qui a masque le defaut. Le bandeau d'en-tete, lui,
 * n'a pas de tel filet : il tombait transparent.
 *
 * LA LECON : un jeton n'est pas defini parce qu'on l'a ECRIT quelque part, mais
 * parce que la PAGE GENEREE le porte. Ce banc ne lit donc pas les sources : il
 * FABRIQUE chaque fenetre et verifie, dans le texte produit, que tout var()
 * employe trouve sa definition. Un var() avec valeur de repli est accepte : il a
 * son propre filet.
 *
 *   node tools/banc-jetons.js
 *   node tools/banc-jetons.js --liste
 */

const fs = require('fs');
const path = require('path');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');
const LISTE = process.argv.indexOf('--liste') >= 0;

/* Decoupage franc sur les accolades fermantes. Une expression reguliere qui
   exige un `}` DEVANT chaque regle n'en voit qu'une sur deux : elle a deja
   consomme ce `}` en fermant la regle precedente. Ce piege a fait passer ce banc
   pour vert alors qu'il ne lisait que 109 regles sur 215. */
function blocs(css) {
  const out = [];
  for (const bout of css.split('}')) {
    const i = bout.indexOf('{');
    if (i < 0) continue;
    out.push([bout.slice(0, i).replace(/\s+/g, ' ').trim(), bout.slice(i + 1)]);
  }
  return out;
}

function definis(paires, estLeBon) {
  const noms = new Set();
  for (const paire of paires) {
    if (!estLeBon(paire[0])) continue;
    let d;
    const rxd = /(--[\w-]+)\s*:/g;
    while ((d = rxd.exec(paire[1]))) noms.add(d[1]);
  }
  return noms;
}

let echecs = 0;
let pages = 0;
const detail = [];

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
  pages++;
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');

  const paires = blocs(css);
  const nuit = definis(paires, (sel) => sel === ':root' || sel === 'html');
  const jour = definis(paires, (sel) => sel === 'html.jour');

  const manqueNuit = new Set();
  const manqueSym = new Set();

  // Emplois SANS valeur de repli : `var(--x)` et non `var(--x, #fff)`.
  let u;
  const rxu = /var\(\s*(--[\w-]+)\s*([,)])/g;
  while ((u = rxu.exec(css))) {
    if (u[2] === ',') continue;
    if (!nuit.has(u[1])) manqueNuit.add(u[1]);
  }

  /* SYMETRIE. Tout jeton que le mode jour redefinit DOIT exister en nuit, sinon
     la fenetre est peinte en jour et nue en sombre — exactement le defaut du
     2026-09-04. L'inverse n'est pas exige : les jetons --sz-* de la charte ne
     changent pas de valeur au mode jour. */
  for (const nom of jour) if (!nuit.has(nom)) manqueSym.add(nom);

  if (manqueNuit.size || manqueSym.size) {
    echecs++;
    let ligne = '  ' + f;
    if (manqueNuit.size) ligne += '\n      employe mais JAMAIS defini : ' + [...manqueNuit].sort().join(' ');
    if (manqueSym.size) ligne += '\n      redefini en JOUR, absent en NUIT : ' + [...manqueSym].sort().join(' ');
    detail.push(ligne);
  }
}

if (echecs) {
  console.log('ECHEC  ' + echecs + ' fenetre(s) sur ' + pages + ' emploient un jeton que leur page ne definit pas.');
  console.log(detail.slice(0, LISTE ? 999 : 10).join('\n'));
  if (!LISTE && detail.length > 10) console.log('  ... ' + (detail.length - 10) + ' autres (--liste)');
  console.log('');
  console.log('  Un var() non defini est une valeur INVALIDE : la propriete retombe a unset.');
  console.log('  Le fond devient transparent, la bordure disparait. Definir le jeton dans');
  console.log('  JETONS_NUIT (socle.js), qui est injecte dans CSS_SOCLE ET dans CSS_JOUR.');
  process.exit(1);
}
console.log('OK  ' + pages + ' fenetres : tout var() employe est defini par sa propre page.');
