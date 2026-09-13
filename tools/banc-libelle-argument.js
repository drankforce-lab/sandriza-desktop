#!/usr/bin/env node
'use strict';

/*
 * LE LIBELLE PASSE EN ARGUMENT — LA TROISIEME FORME
 * =============================================================================
 * ⚠⚠⚠ SA CAPTURE DU 2026-09-13, FENETRE « NEW PRODUCT ». La page etait en
 * anglais d un bout a l autre — et au milieu, trois champs disaient encore
 * « Marque », « Fournisseur », « Ex : 350 ». Les DEUX bancs de langue
 * annoncaient ZERO sur cette fenetre, et tous les deux disaient vrai.
 *
 * ⚠⚠ LA CAUSE TIENT A LA FORME DE LA LIGNE, PAS AU MOT. `textes-visibles.js`
 * ne reconnait un texte affiche qu a deux signatures, ecrites noir sur blanc
 * dans son propre commentaire :
 *   1. il est COLLE A DU BALISAGE  : '>Ambiance</div>' ;
 *   2. il est la VALEUR D UNE PROPRIETE DE LIBELLE : { t: 'Ambiance' }.
 * Or la fenetre du produit fabrique ses champs avec ses propres fonctions :
 *
 *     ch('p-marque', 'Marque')                       <-- ni l un, ni l autre
 *     sel('p-fourn', 'Fournisseur', […])             <-- ni l un, ni l autre
 *
 * Le mot est le DEUXIEME ARGUMENT d un appel. Il n a aucune des deux
 * signatures, donc il n existe pour aucun banc. Il s affiche quand meme : la
 * fonction, elle, le pose dans un <label>.
 *
 * ➡ LA LECON, LA SIXIEME DE LA MEME FAMILLE : un defaut hors du terrain qu un
 *   banc balaie n est signale par RIEN. La reponse n est pas de mieux relire,
 *   c est d elargir le terrain. Ici : suivre le texte jusqu a la FONCTION qui
 *   l ecrit, au lieu d exiger qu il soit deja a cote du balisage.
 *
 * ══ COMMENT IL DECIDE, ET POURQUOI IL NE CRIE PAS SUR DU CODE ═══════════════
 * Deux conditions, toutes les deux necessaires :
 *
 *   A. LA FONCTION APPELEE ECRIT DU BALISAGE. On ne la devine pas : elle est
 *      definie dans le MEME fichier et son corps contient une chaine qui ouvre
 *      une balise ('<div', '</span>'…). Une fonction qui ne pose pas de balise
 *      ne peut pas afficher son argument.
 *
 *   B. L ARGUMENT RESSEMBLE A UN LIBELLE, PAS A UN IDENTIFIANT. Il commence
 *      par une MAJUSCULE (`'p-marque'` est la cle, `'Marque'` est le libelle,
 *      et ils sont cote a cote sur la meme ligne — c est ce qui les separe
 *      sans rien savoir du JavaScript), et il porte du francais : soit un
 *      accent, soit un mot du LEXIQUE deduit des dictionnaires.
 *
 * ⚠ LE LEXIQUE NE S ECRIT PAS A LA MAIN — il est la difference entre les mots
 *   des CLES (deja juges francais par ce chantier) et les mots des VALEURS
 *   (l anglais de cette meme application). Il grossit tout seul.
 *
 * ⚠ `connexion` est EXEMPTEE : elle porte son dictionnaire DANS la page et
 *   bascule sans se recharger ; ses libelles ne passent pas par T().
 *
 *   node tools/banc-libelle-argument.js            toutes les fenetres
 *   node tools/banc-libelle-argument.js <fenetre>  une seule
 */

const fs = require('fs');
const path = require('path');

const DOS = path.join(__dirname, '..', 'src', 'fenetres');
const DICOS = path.join(__dirname, '..', 'src', 'langue');

/* ⚠ CHAQUE EXEMPTION PORTE SA RAISON. */
const EXEMPTE = new Set(['connexion']);

/* ── LE LEXIQUE, DEDUIT DES DICTIONNAIRES ─────────────────────────────────── */
const motsDe = (s) => String(s).toLowerCase().match(/[a-zà-ÿ’']{3,}/g) || [];
const lexique = () => {
  const clefs = new Set();
  const vals = new Set();
  for (const f of fs.readdirSync(DICOS)) {
    if (!f.endsWith('.js') || f === 'index.js') continue;
    let d;
    try { d = require(path.join(DICOS, f)); } catch (e) { continue; }
    if (!d || typeof d !== 'object') continue;
    for (const k of Object.keys(d)) {
      motsDe(k).forEach((w) => clefs.add(w));
      motsDe(d[k]).forEach((w) => vals.add(w));
    }
  }
  return new Set([...clefs].filter((w) => !vals.has(w)));
};

/* ── LES FONCTIONS DU FICHIER QUI ECRIVENT DU BALISAGE ────────────────────── */
const fonctionsQuiEcrivent = (src) => {
  const out = new Set();
  const re = /function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = re.exec(src))) {
    /* Le corps, borne genereusement : on cherche seulement s il ouvre une
       balise, pas a l analyser. */
    const corps = src.slice(m.index, m.index + 3000);
    if (/['"]<\/?[a-zA-Z]/.test(corps)) out.add(m[1]);
  }
  return out;
};

/* ── LES ARGUMENTS D UN APPEL, PARENTHESES IMBRIQUEES COMPRISES ───────────── */
const argumentsDe = (src, i) => {
  /* i pointe sur la parenthese ouvrante. On avance en comptant la profondeur,
     et on s arrete a la parenthese fermante ou au bout d une ligne vide. */
  let prof = 0;
  let j = i;
  const max = Math.min(src.length, i + 4000);
  for (; j < max; j++) {
    const c = src[j];
    if (c === '(') prof++;
    else if (c === ')') { prof--; if (prof === 0) return src.slice(i + 1, j); }
  }
  return '';
};

const LITTERAL = /(['"])((?:(?!\1)[^\\]|\\.)*)\1/g;

/* ⚠⚠ CE QUI PART DANS LA FICHE N EST PAS UN LIBELLE. Dans
   `{ v: 'Populaire', l: '${T("Populaire")}' }`, le PREMIER est ECRIT dans le
   produit et relu par le site, le SECOND est LU a l ecran. Traduire le premier
   ferait enregistrer « Popular » depuis un poste anglais et « Populaire »
   depuis un poste francais, pour la meme etiquette — deux valeurs pour une
   seule chose, et la recherche ne trouverait plus rien.
   ➡ ON NE TRADUIT QUE CE QUI SE LIT. JAMAIS CE QUI EST ECRIT. */
const CLE_DONNEE = /\b(?:v|val|valeur|value|cle|key|id|code|nom_technique)\s*:\s*$/;

const relire = (nom, LEX) => {
  const src = fs.readFileSync(path.join(DOS, nom + '.js'), 'utf8');
  const fns = fonctionsQuiEcrivent(src);
  if (!fns.size) return [];
  const restes = [];
  const vus = new Set();
  const appel = new RegExp('\\b(' + [...fns].join('|') + ')\\s*\\(', 'g');
  let m;
  while ((m = appel.exec(src))) {
    let args = argumentsDe(src, m.index + m[0].length - 1);
    if (!args) continue;
    /* ⚠ ON EFFACE D ABORD CE QUI EST DEJA TRADUIT. `${T("Rembourser et clore ?")}`
       porte des guillemets DOUBLES a l interieur d une chaine a guillemets
       SIMPLES : un releve naif les prend pour un litteral a lui et accuse une
       phrase qui est deja enveloppee. On blanchit les `${…}` avant de lire —
       la longueur est preservee pour que les positions restent justes. */
    args = args.replace(/\$\{[\s\S]*?\}/g, (s) => s.replace(/[^\n]/g, ' '));
    LITTERAL.lastIndex = 0;
    let a;
    while ((a = LITTERAL.exec(args))) {
      const t = a[2];
      if (!/^[A-ZÀ-ÖØ-Þ]/.test(t)) continue;      /* une cle, pas un libelle */
      if (t.indexOf('${') >= 0) continue;          /* deja enveloppe, ou compose */
      if (t.indexOf('<') >= 0) continue;           /* du balisage, vu ailleurs */
      if (CLE_DONNEE.test(args.slice(0, a.index))) continue;  /* de la donnee */
      const fr = motsDe(t).some((w) => LEX.has(w));
      if (!/[À-ÿ]/.test(t) && !fr) continue;       /* rien de francais dedans */
      const ligne = src.slice(0, m.index).split('\n').length;
      const cle = t + '@' + ligne;
      if (vus.has(cle)) continue;
      vus.add(cle);
      restes.push({ ligne, texte: t, via: m[1] });
    }
  }
  return restes;
};

/* ══ LE PASSAGE ═════════════════════════════════════════════════════════════ */
const cible = process.argv[2];
const LEX = lexique();
const noms = fs.readdirSync(DOS)
  .filter((x) => x.endsWith('.js'))
  .map((x) => x.replace(/\.js$/, ''))
  .filter((x) => !EXEMPTE.has(x))
  .filter((x) => !cible || x === cible)
  .sort();

console.log('\n== UN LIBELLE PASSE EN ARGUMENT EST-IL TRADUIT ? ==');
console.log('  ' + noms.length + ' fenetre(s) relue(s)');

const sales = [];
for (const n of noms) {
  const r = relire(n, LEX);
  if (r.length) sales.push({ nom: n, restes: r });
}

if (!sales.length) {
  console.log('\n>>> aucun libelle francais ne passe en argument sans traduction\n');
  process.exit(0);
}

const total = sales.reduce((s, x) => s + x.restes.length, 0);
console.log('\nECHEC  ' + total + ' libelle(s) francais passe(s) en ARGUMENT a une');
console.log('       fonction qui ecrit du balisage, dans ' + sales.length + ' fenetre(s) :\n');
for (const x of sales) {
  console.log('  ' + x.nom + '.js');
  for (const r of x.restes) {
    console.log('      ' + String(r.ligne).padStart(5) + '  ' + r.via + '(… \'' + r.texte + '\' …)');
  }
}
console.log('\n⚠ LE MOT EST AFFICHE MEME S IL N EST PAS COLLE A UNE BALISE : c est la');
console.log('  FONCTION qui le pose dans le <label>. Enveloppez-le comme le reste :');
console.log('    ch(\'p-marque\', \'${T("Marque")}\')');
process.exit(1);
