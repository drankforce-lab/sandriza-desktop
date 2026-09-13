#!/usr/bin/env node
'use strict';

/*
 * LES ECRANS BATIS DANS LE PROCESSUS PRINCIPAL ONT-ILS TOUS LEUR TRADUCTION ?
 * =============================================================================
 * Sa demande du 2026-09-12 : « les ecrans de chargement aussi devront etre
 * traduits ».
 *
 * ⚠⚠ POURQUOI CEUX-LA ECHAPPENT A TOUS LES AUTRES BANCS. `banc-langue-fenetres`
 * et `banc-langue-residuel` lisent `src/fenetres/` : ils DESSINENT une page et
 * la relisent. Ces ecrans-ci sont batis dans `main.js` — le processus principal
 * d Electron, qu aucun banc ne peut faire tourner sans lancer toute
 * l application. Ils sont donc le seul endroit de la coquille ou une phrase peut
 * rester francaise sans que rien ne le dise.
 *
 * ⚠⚠⚠ ET LA PREUVE EST VENUE DEUX FOIS.
 *   1. LES ECRANS DE CHARGEMENT (2026-09-12). Ce sont les pires a laisser en
 *      francais : ils paraissent au demarrage, pendant la verification, le
 *      telechargement et l INSTALLATION — aux moments ou l on ne peut rien faire
 *      d autre que les lire. Le banc a trouve un oubli des sa premiere execution.
 *   2. LA FENETRE « A PROPOS » (2026-09-13). Le chantier bilingue s est ferme
 *      sur « 98 fenetres sur 98 », un compte EXACT — et cette fenetre-la est
 *      restee ENTIEREMENT francaise, parce qu elle n a jamais ete comptee : elle
 *      est batie dans `main.js`, hors de `src/fenetres/`. Elle a ete trouvee en
 *      posant la garde d un AUTRE defaut, pas par un banc.
 *      ➡ **Un compte exhaustif ne l est que sur le terrain qu il enumere.**
 *
 * ⚠ C EST POUR CA QUE CE BANC N EST PLUS CELUI D UNE SEULE TABLE. Il s appelait
 * `banc-langue-porte.js` et ne gardait que les ecrans de chargement ; le nom
 * disait alors la verite, et c est precisement ce qui a permis a « A propos » de
 * passer a cote. La liste `TABLES` ci-dessous est ce qu il faut etendre quand un
 * nouvel ecran nait dans le processus principal.
 *
 * ══ CE QU IL VERIFIE, DANS LES DEUX SENS, POUR CHAQUE TABLE ═════════════════
 *   1. chaque appel ecrit dans le code a une entree au dictionnaire ;
 *   2. aucune entree du dictionnaire ne DORT (plus personne ne la demande).
 * Le second sens compte autant : une entree orpheline est une phrase qu on croit
 * traduite et que l ecran n affiche plus.
 *   3. les `{0}` se correspondent des deux cotes — un chiffre present en
 *      francais et absent en anglais donne une phrase a trou.
 *
 * ⚠ Le SEPARATEUR DECIMAL ne passe PAS par le dictionnaire — c est une regle de
 * LOCALE, lue dans la langue courante. Un essai contraire a donne
 * « 2__decimale__5 Mo » a l ecran : `T(fr)` rend la CLE telle quelle en
 * francais, c est tout son principe.
 *
 *   node tools/banc-langue-processus-principal.js
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');

/* ── LES TABLES GARDEES ─────────────────────────────────────────────────────
   Chacune : son dictionnaire, le PREFIXE d appel qui la designe dans le code,
   les fichiers qui s en servent, et un plancher de textes attendus.
   ⚠ Des listes NOMMEES plutot qu un parcours : le jour ou un troisieme ecran
   arrive, il doit etre ajoute SCIEMMENT — c est exactement l oubli qui a coute
   « A propos ». */
const TABLES = [
  {
    nom: 'porte',
    titre: 'LES ECRANS DE CHARGEMENT',
    /* `TP(...)` et, dans porte-progression.js, `T(...)`. */
    appel: /\bTP?\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g,
    sources: ['src/main.js', 'src/porte-progression.js'],
    plancher: 5,
  },
  {
    nom: 'apropos',
    titre: 'LA FENETRE « A PROPOS »',
    /* `TA(...)` — un prefixe a elle, pour que les deux tables du MEME fichier
       ne se melangent pas. Sans ca, chaque texte de l une paraitrait << sans
       traduction >> pour l autre. */
    appel: /\bTA\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g,
    sources: ['src/main.js'],
    plancher: 15,
  },
];

const sansCommentaires = (s) => s
  /* ⚠ LA BORNE DU `/*` : voir `tools/textes-visibles.js`. Un `/*` colle a une
     lettre (`accept="image/*"`) n ouvre pas un commentaire. */
  .replace(/(^|[\s;{}(),=])\/\*[\s\S]*?\*\//g, (m, p) => p + m.slice(p.length).replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/[^\n]/g, ' '));

/* ⚠ Les fichiers lus UNE fois : `main.js` sert deux tables, et le relire pour
   chacune ne dirait rien de plus. */
const _src = new Map();
const source = (rel) => {
  if (_src.has(rel)) return _src.get(rel);
  const f = path.join(RACINE, rel.split('/').join(path.sep));
  if (!fs.existsSync(f)) return null;
  const s = sansCommentaires(fs.readFileSync(f, 'utf8'));
  _src.set(rel, s);
  return s;
};

let mal = 0;
let tablesVues = 0;

for (const t of TABLES) {
  let DICO;
  try { DICO = require(path.join(RACINE, 'src', 'langue', t.nom + '.js')); }
  catch (e) {
    console.log('  NON  src/langue/' + t.nom + '.js est illisible (' + e.message + ').');
    mal++; continue;
  }

  const demandes = new Map();   // texte -> [fichiers]
  let lus = 0;
  let manquant = false;

  for (const rel of t.sources) {
    const s = source(rel);
    if (s === null) {
      console.log('  NON  ' + rel + ' est introuvable — le banc ne mesure plus ce qu il croit.');
      mal++; manquant = true; continue;
    }
    lus++;
    t.appel.lastIndex = 0;
    let m;
    while ((m = t.appel.exec(s))) {
      const x = (m[1] !== undefined ? m[1] : m[2])
        .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      if (!demandes.has(x)) demandes.set(x, []);
      demandes.get(x).push(rel);
    }
  }
  if (manquant) continue;
  tablesVues++;

  console.log('');
  console.log('== ' + t.titre + ', DANS LES DEUX LANGUES ==');
  console.log('  ' + lus + ' fichier(s) lu(s) · ' + demandes.size + ' texte(s) demande(s) · '
    + Object.keys(DICO).length + ' entree(s) au dictionnaire');
  console.log('');

  /* ⚠ UN BANC QUI NE TROUVE RIEN NE DOIT PAS SE TAIRE : zero demande se lirait
     comme « tout est traduit » alors que plus rien ne serait mesure. */
  if (demandes.size < t.plancher) {
    console.log('  NON  ' + demandes.size + ' texte(s) seulement (plancher ' + t.plancher
      + ') — le motif de lecture ne marche plus.');
    mal++; continue;
  }

  const sansTraduction = [...demandes.keys()].filter((x) => DICO[x] === undefined);
  if (sansTraduction.length) {
    mal += sansTraduction.length;
    console.log('  NON  ' + sansTraduction.length + ' texte(s) demande(s) SANS traduction :');
    sansTraduction.forEach((x) => console.log('         ' + JSON.stringify(x)
      + '   [' + demandes.get(x).join(', ') + ']'));
    console.log('');
  }

  /* ⚠ L AUTRE SENS. Une entree que plus personne ne demande est une phrase qu on
     croit traduite et que l ecran n affiche plus — ou une cle mal recopiee. */
  const dorment = Object.keys(DICO).filter((k) => !demandes.has(k));
  if (dorment.length) {
    mal += dorment.length;
    console.log('  NON  ' + dorment.length + ' entree(s) du dictionnaire que PERSONNE ne demande :');
    dorment.forEach((k) => console.log('         ' + JSON.stringify(k)));
    console.log('');
  }

  /* ⚠ ET LES PLACEHOLDERS : `{0}` present d un cote et pas de l autre donne une
     phrase anglaise ou le chiffre MANQUE. Le francais l affichait pourtant. */
  const trous = [];
  for (const [fr, en] of Object.entries(DICO)) {
    const a = (fr.match(/\{\d\}/g) || []).sort().join(',');
    const b = (String(en).match(/\{\d\}/g) || []).sort().join(',');
    if (a !== b) trous.push([fr, a || '(aucun)', b || '(aucun)']);
  }
  if (trous.length) {
    mal += trous.length;
    console.log('  NON  ' + trous.length + ' entree(s) dont les valeurs variables ne correspondent pas :');
    trous.forEach(([fr, a, b]) => console.log('         ' + JSON.stringify(fr) + '  fr:' + a + '  en:' + b));
    console.log('');
  }

  if (!sansTraduction.length && !dorment.length && !trous.length)
    console.log('  OK   les ' + demandes.size + ' textes demandes ont leur traduction, et aucune entree ne dort');
}

console.log('');
if (mal) {
  console.log('>>> ' + mal + ' probleme(s) — un ecran du processus principal resterait en francais.');
  process.exit(1);
}
if (tablesVues !== TABLES.length) {
  console.log('>>> ' + tablesVues + ' table(s) mesuree(s) sur ' + TABLES.length + ' — le banc ne dit rien du reste.');
  process.exit(1);
}
console.log('>>> les ' + tablesVues + ' tables du processus principal sont completes dans les deux sens');
