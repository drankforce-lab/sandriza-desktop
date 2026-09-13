#!/usr/bin/env node
'use strict';

/*
 * LA TRADUCTION A-T-ELLE PRIS EFFET ? — la mesure qui ne peut pas mentir
 * =============================================================================
 * ⚠⚠⚠ CE BANC EXISTE PARCE QUE J AI FAIT TAIRE UNE MESURE SANS RIEN TRADUIRE,
 * le 2026-09-13, dans la journee meme ou je citais la fiche qui le decrit.
 * Apres son signalement (<< il manque plein de traduction encore >>), j ai
 * ajoute 113 entrees de dictionnaire. Le compteur est passe a ZERO. J ai
 * dessine la page anglaise : les textes etaient TOUJOURS EN FRANCAIS.
 *
 * UNE ENTREE DE DICTIONNAIRE NE TRADUIT RIEN SI LA SOURCE N APPELLE PAS T().
 * `banc-langue-fenetres` demande << une DECISION existe-t-elle ? >>. Il ne
 * demande pas << a-t-elle PRIS EFFET ? >>. C est la fiche
 * `feedback_un_compteur_mesure_une_intention` mot pour mot, repayee.
 *
 * ══ LA QUESTION QUE CELUI-CI POSE ═══════════════════════════════════════════
 * On dessine la page ANGLAISE, on releve ce qu elle AFFICHE, et on refuse tout
 * texte visible qui est EXACTEMENT une cle du dictionnaire dont la traduction
 * DIFFERE. Deux causes, une seule conclusion — ce texte s affiche en francais :
 *   · la source ecrit le litteral NU, et personne n appelle T dessus ;
 *   · ou la traduction a ete oubliee et rend la meme chaine.
 *
 * ⚠ ET IL NE PEUT PAS ETRE TROMPE PAR UNE ENTREE DE PLUS : ajouter une entree
 * ne fait pas disparaitre le texte de la page. Seul l enveloppement le fait.
 * C est toute la difference avec le compteur, et c est pour ca que ce banc-ci
 * est la barriere.
 *
 * ⚠ UNE ENTREE DONT LA VALEUR EGALE LA CLE est ECARTEE : c est une decision
 * assumee (un nom propre, un sigle — Purolator, TPS, TVQ, SMS, FAQ). Le banc ne
 * peut pas distinguer << identique a dessein >> de << non traduit >> sur ces
 * chaines-la, et il le dit plutot que d inventer une faute.
 *
 * ⚠ PREMIER RELEVE : 207 textes visibles en francais sur la page anglaise,
 * dans 48 fenetres, alors que leur traduction EXISTAIT deja.
 *
 *   node tools/banc-langue-effet.js
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DOS = path.join(RACINE, 'src', 'fenetres');
const DIC = path.join(RACINE, 'src', 'langue');
const L = require('../src/langue');
const TV = require('./textes-visibles.js');

/* ⚠ `connexion` est HORS COMPTE : son dictionnaire est EMBARQUE dans la page
   (elle bascule sans se recharger), donc sa page porte les DEUX langues a la
   fois et toute cle francaise y parait par construction. Sa garde est
   `banc-langue-connexion.js`. */
const HORS_COMPTE = new Set(['connexion']);

let total = 0;
let regardees = 0;
const fautes = [];

for (const f of fs.readdirSync(DOS).filter((x) => x.endsWith('.js') && x !== 'socle.js').sort()) {
  const nom = f.replace(/\.js$/, '');
  if (HORS_COMPTE.has(nom)) continue;

  let dico = null;
  try { dico = require(path.join(DIC, nom + '.js')); } catch (e) { dico = null; }
  if (!dico) continue;

  L.poserLangue('en');
  let html = '';
  try {
    const mod = require(path.join(DOS, f));
    const fab = Object.values(mod).find((v) => typeof v === 'function');
    if (!fab) continue;
    html = String(fab(''));
  } catch (e) {
    fautes.push({ nom, textes: ['(la fenetre ne se dessine pas : ' + e.message + ')'] });
    continue;
  }
  regardees++;

  const vus = new Set(TV.toutLeTexte(html).map((t) => t.texte));
  const restants = [...vus].filter((t) => {
    const en = dico[t];
    return typeof en === 'string' && en !== t;
  });
  if (restants.length) { fautes.push({ nom, textes: restants }); total += restants.length; }
}

console.log('');
console.log('== LA TRADUCTION A-T-ELLE PRIS EFFET ? ==');
console.log('  ' + regardees + ' fenetre(s) dessinee(s) EN ANGLAIS et relue(s)');
console.log('');

/* ⚠ UN BANC QUI NE REGARDE RIEN NE DOIT PAS DIRE << TOUT VA BIEN >>. */
if (regardees < 50) {
  console.log('  NON  ' + regardees + ' fenetre(s) seulement — le parcours ne marche plus.');
  process.exit(1);
}

if (!fautes.length) {
  console.log('>>> aucun texte francais sur la page anglaise dont la traduction existe');
  process.exit(0);
}

console.log('ECHEC  ' + total + ' texte(s) s affichent EN FRANCAIS sur la page anglaise,');
console.log('       alors que leur traduction existe deja :');
console.log('');
for (const { nom, textes } of fautes) {
  console.log('  ' + nom);
  textes.forEach((t) => console.log('      ' + JSON.stringify(t)));
}
console.log('');
console.log('⚠ UNE ENTREE DE DICTIONNAIRE NE TRADUIT RIEN SI LA SOURCE N APPELLE PAS T().');
console.log('  Enveloppez le litteral dans la fenetre : ${T("…")}.');
console.log('  ⚠ Si le texte est coupe par une balise (<strong>, <em>, <span>), il faut');
console.log('    les DEUX formes : celle de la source ET celle de la page rendue.');
process.exit(1);
