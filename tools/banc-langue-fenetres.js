#!/usr/bin/env node
'use strict';

/*
 * BILINGUE INTEGRAL — ce qui est traduit, et ce qui ne l est pas encore
 * =============================================================================
 * ⚠⚠ SA DEMANDE : « traduire l application intégralement en anglais », « je veux
 * qu elle soit bilingue intégral ». Mesure du jour où le chantier commence :
 * 99 fenêtres, 7 288 textes visibles, 3 193 distincts.
 *
 * ⚠⚠ POURQUOI CE BANC EXISTE AVANT LA PREMIERE TRADUCTION. Un chantier de cette
 * taille se fait fenêtre par fenêtre, sur plusieurs séances. Sans compteur, deux
 * choses arrivent, et les deux sont pires que la lenteur :
 *   · on croit avoir fini alors qu il reste des écrans entiers — « intégral »
 *     est un mot qu on ne peut pas vérifier de mémoire ;
 *   · une fenêtre A MOITIE traduite passe pour traduite, et c est le pire des
 *     résultats : un écran anglais parsemé de français se lit comme un défaut,
 *     alors qu un écran tout français se lit comme un choix.
 *
 * ══ CE QU IL COMPTE, ET POURQUOI CETTE QUESTION-LA ══════════════════════════
 * Pour chaque fenêtre : les textes VISIBLES (mêmes yeux que `banc-accents-
 * visibles`, même module `textes-visibles.js`) qui n ont AUCUNE entrée dans
 * `src/langue/<fenetre>.js`.
 *
 * ⚠ UNE ENTREE QUI REND LE MEME TEXTE EST UNE DECISION, PAS UN OUBLI.
 * « Options » se dit « Options », « Notes » se dit « Notes ». L écrire dans le
 * dictionnaire, c est déclarer qu on a regardé — et ça coûte une ligne. Sans
 * cette règle, le banc ne saurait pas distinguer « identique » de « pas encore
 * fait », et il faudrait une seconde liste pour le lui dire.
 *
 * ⚠ CE QU IL NE SAIT PAS VOIR, écrit ici plutôt que découvert :
 *   · les phrases assemblées À L EXECUTION à partir de morceaux (le dictionnaire
 *     les attrape si chaque morceau y est, mais l ordre des mots anglais peut
 *     rendre la phrase fausse) — d où la règle des PHRASES ENTIERES avec {0} ;
 *   · les DONNEES (noms de produits, notes) : ce n est pas de l interface ;
 *   · ce que le SERVEUR renvoie.
 *
 * ⚠ IL N ECHOUE PAS TANT QUE LE CHANTIER N EST PAS DECLARE FINI. Un rouge
 * permanent pendant des semaines finit par être contourné, et emporte avec lui
 * les 22 autres bancs. Il INVENTORIE, et le nombre doit descendre.
 * `SZ_BILINGUE_FINI=1` le transforme en barrière le jour où c est vrai.
 *
 *   node tools/banc-langue-fenetres.js            l inventaire
 *   node tools/banc-langue-fenetres.js <fenetre>  ce qui manque a une fenetre
 */

const fs = require('fs');
const path = require('path');
const { toutLeTexte } = require('./textes-visibles.js');
const LANGUE = require('../src/langue');

const DOS = path.join(__dirname, '..', 'src', 'fenetres');

/* ⚠ CE QUI N EST PAS DE L INTERFACE. Un nombre, un code, un symbole n ont rien
   a traduire — les compter gonflerait le reste a traduire d un bruit qui ne
   descendra jamais, et un compteur qui ne peut pas atteindre zero se lit vite
   comme « c est normal qu il en reste ». */
const aTraduire = (t) => {
  if (!/[A-Za-zÀ-ɏ]{2}/.test(t)) return false;     // pas deux lettres a la suite
  if (/^[\d\s.,:%$€+\-–—/()]+$/.test(t)) return false;        // un nombre, une mesure
  if (t === 'Sandriza' || t === 'FR' || t === 'EN') return false;
  /* ⚠ LA SOUPE D’ATTRIBUTS D’UN SVG. `stroke="currentColor" stroke-width="1.75"`
     arrive ici parce qu’un fragment de balise apparié de travers ressemble à une
     chaîne. Ce n’est pas du texte affiché : un `="` dedans le trahit. */
  if (/="/.test(t)) return false;
  /* ⚠ ET LA SOUPE CSS. `font:inherit;font-size:.74rem;padding:.14rem .5rem;`
     est une déclaration de style assemblée en chaîne : elle a des deux-points,
     des points-virgules et des minuscules, donc elle ressemble à de la prose aux
     yeux du filtre général. Trois d’entre elles pèsent 121 occurrences — assez
     pour qu’un compteur censé atteindre zéro ne l’atteigne jamais. */
  /* ⚠ ET UN SÉLECTEUR CSS. `.etape.on input, .etape.on select` est une règle de
     style assemblée en chaîne : elle a des minuscules, des espaces et des
     virgules, donc elle ressemble à de la prose. Personne ne la lit à l’écran. */
  if (/^[.#][\w.#\-]+(\s|,|:|\[)/.test(t)) return false;
  if (/var\(--|[a-z-]+\s*:\s*[^;]{1,30};/.test(t)) return false;
  return true;
};

/* ╔══ LE FRANÇAIS EST LE DÉFAUT, ET ÇA SE VÉRIFIE ══════════════════════╗
   ║ Sa consigne du 2026-09-12 : « il faut que tu garde le français aussi par  ║
   ║ défaut sauf si le toggle anglais est activé. »                            ║
   ╚═════════════════════════════════════════════════════════════════════╝
   ⚠⚠ CE N’EST PAS UNE PRÉCAUTION ABSTRAITE. Le 2026-09-12, un interrupteur passé
   par défaut « allumé » lui a fait démarrer l’application SANS MENU. Un défaut qui
   glisse ne prévient pas : il change ce que voit quelqu’un qui n’a rien demandé.
   Ici le risque est double — un `||` mal placé, un réglage lu de travers, et toute
   l’application passerait en anglais chez quelqu’un qui travaille en français.
   ⚠ SEULE la chaîne exacte 'en' bascule. 'EN', 'english', true, 1 : français. */
const DEFAUTS = [
  [undefined, 'fr'], [null, 'fr'], ['', 'fr'], ['EN', 'fr'], ['English', 'fr'],
  [true, 'fr'], [1, 'fr'], ['fr', 'fr'], ['en', 'en'],
];
let malDefaut = 0;
for (const [donne, attendu] of DEFAUTS) {
  const eu = LANGUE.poserLangue(donne);
  if (eu !== attendu) {
    malDefaut++;
    console.log('  NON  poserLangue(' + JSON.stringify(donne) + ') rend '
      + JSON.stringify(eu) + ' au lieu de ' + JSON.stringify(attendu));
  }
}
LANGUE.poserLangue('fr');
if (malDefaut) {
  console.log('');
  console.log('>>> LE FRANCAIS N EST PLUS LE DEFAUT — refus.');
  process.exit(1);
}

const cible = process.argv[2] ? path.basename(process.argv[2]).replace(/\.js$/, '') : '';

let fen = 0, aFaire = 0, fait = 0;
const parFenetre = [];
const manquantsCible = [];

for (const f of fs.readdirSync(DOS).filter((x) => x.endsWith('.js')).sort()) {
  const nom = f.replace(/\.js$/, '');
  if (cible && nom !== cible) continue;
  let mod;
  try { mod = require(path.join(DOS, f)); } catch (e) { continue; }
  const fabrique = Object.values(mod).find((v) => typeof v === 'function');
/* ⚠⚠ LE SOCLE SE RECONNAÎT PAR SON NOM, PLUS PAR SES EXPORTS. Il exportait des
   CHAÎNES, donc « aucune fonction exportée » suffisait à le distinguer d’une
   fenêtre. Depuis que ses blocs sont des FONCTIONS (pour que la langue s’y
   résolve à chaque page), cette heuristique le prend pour une fenêtre et tente
   d’en tirer une page. ⚠ Une reconnaissance par EFFET DE BORD tient jusqu’au jour
   où l’effet change ; le nom, lui, ne bouge pas. */
  if (f === 'socle.js') continue;
  if (!fabrique) continue;
  let page;
  try { page = fabrique(''); } catch (e) {
    try { page = fabrique(); } catch (e2) { continue; }
  }
  if (typeof page !== 'string') continue;

  fen++;
  const vus = new Set();
  let manque = 0, ok = 0;
  for (const c of toutLeTexte(page)) {
    const t = c.texte;
    if (!aTraduire(t) || vus.has(t)) continue;
    vus.add(t);
    if (LANGUE.aUneDecision(nom, t)) { ok++; continue; }
    manque++;
    if (cible) manquantsCible.push(t);
  }
  aFaire += manque; fait += ok;
  parFenetre.push({ nom, manque, ok });
}

console.log('');
console.log('== BILINGUE INTEGRAL — ce qui reste a traduire ==');

/* ⚠ UN BANC QUI NE LIT RIEN NE DOIT PAS SE TAIRE. Si les fenetres cessaient de
   se charger, le compte tomberait a zero et se lirait comme une victoire. */
if (!cible && fen < 5) {
  console.log('  NON  ' + fen + ' fenetre(s) lue(s) seulement — le banc ne voit plus rien.');
  process.exit(1);
}

if (cible) {
  console.log('  ' + cible + ' : ' + fait + ' traduit(s), ' + aFaire + ' a traduire');
  console.log('');
  manquantsCible.forEach((t) => console.log('    ' + JSON.stringify(t)));
  process.exit(0);
}

const restants = parFenetre.filter((x) => x.manque).sort((a, b) => b.manque - a.manque);
const finies = parFenetre.filter((x) => !x.manque);
console.log('  ' + fen + ' fenetres · ' + fait + ' texte(s) traduit(s) · ' + aFaire + ' a traduire');
console.log('  ' + finies.length + ' fenetre(s) COMPLETE(S) sur ' + fen);
console.log('');
if (finies.length) console.log('  finies : ' + finies.map((x) => x.nom).join(', '));
console.log('');
restants.slice(0, 15).forEach((x) => console.log('    ' + String(x.manque).padStart(4) + '  ' + x.nom));
if (restants.length > 15) console.log('    ... et ' + (restants.length - 15) + ' autre(s) fenetre(s)');
console.log('');
console.log('  node tools/banc-langue-fenetres.js <fenetre>   pour la liste d une fenetre');

if (process.env.SZ_BILINGUE_FINI === '1') {
  if (aFaire) {
    console.log('');
    console.log('>>> ' + aFaire + ' texte(s) NON traduit(s) alors que le chantier est DECLARE FINI');
    process.exit(1);
  }
  console.log('');
  console.log('>>> bilingue integral : chaque texte visible a sa decision');
  process.exit(0);
}
console.log('');
console.log('>>> inventaire seulement — le chantier n est pas declare fini (SZ_BILINGUE_FINI=1 pour verrouiller)');
