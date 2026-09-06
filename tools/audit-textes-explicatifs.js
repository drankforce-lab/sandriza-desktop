'use strict';

/*
 * AUDIT — LES TEXTES QUI EXPLIQUENT AU LIEU DE MONTRER
 * =============================================================================
 *   node tools/audit-textes-explicatifs.js            (les fenêtres natives)
 *   node tools/audit-textes-explicatifs.js --site     (+ le dépôt du site)
 *
 * Sa demande du 2026-09-06, après avoir vu deux paragraphes en tête de la
 * fenêtre du veilleur : « retire les textes d'explication ici et fais un audit
 * où ce genre de comportement apparaît dans toute l'application, pour me lister
 * partout où cela apparaît de manière à identifier ceux à supprimer ».
 *
 * ══ CE QU'ON CHERCHE, ET CE QU'ON NE CHERCHE PAS ════════════════════════════
 * ⚠⚠ TOUT TEXTE N'EST PAS DU BAVARDAGE, et c'est le piège de cet audit. Un écran
 * a besoin de mots : une étiquette de champ, un avertissement avant une action
 * irréversible, la raison d'un refus. Ce qu'on traque est PLUS ÉTROIT — le
 * paragraphe qui EXPLIQUE CE QUE FAIT L'ÉCRAN à quelqu'un qui l'a sous les yeux.
 * Il coûte trois fois :
 *   • il repousse vers le bas ce qu'on est venu faire ;
 *   • il se périme sans que personne ne le relise (le texte du veilleur parlait
 *     encore d'un jeton une heure après que le jeton eut disparu) ;
 *   • il se lit UNE fois, et pèse à chaque ouverture ensuite.
 *
 * ⚠ CET OUTIL NE SUPPRIME RIEN ET NE JUGE RIEN. Il RECENSE, avec l'endroit et le
 * texte, pour qu'il tranche. Un audit qui décide à la place de celui qui connaît
 * ses écrans se trompe — et la moitié de ce qu'il trouverait est légitime.
 *
 * ══ COMMENT ON RECONNAÎT UN CANDIDAT ════════════════════════════════════════
 * Un bloc de PROSE — donc pas une étiquette — d'au moins `SEUIL` caractères,
 * dans un élément de texte (`<p>`, `<div class="quoi|aide|hint|note|explication">`).
 * On compte les MOTS RÉELS après avoir retiré le balisage et les interpolations :
 * une chaîne de 300 caractères dont 250 sont du `style=` n'est pas un discours.
 */

const fs = require('fs');
const path = require('path');

const SEUIL_MOTS = 22;          // en deçà, c'est une phrase d'aide, pas un exposé
const RACINE = path.join(__dirname, '..');
const SITE = path.join(RACINE, '..', 'Sandriza');
const avecSite = process.argv.includes('--site');

/* Les conteneurs qui portent de la prose. `quoi` est la convention des fenêtres
   natives ; les autres viennent du site. On prend aussi les `<p>` nus. */
const CLASSES = /(?:quoi|aide|hint|note|explication|intro|sub|desc|help|legend)/;

const fichiers = [];
const balayer = (d, ext) => {
  let entrees = [];
  try { entrees = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entrees) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) balayer(p, ext);
    else if (e.name.endsWith(ext)) fichiers.push(p);
  }
};
balayer(path.join(RACINE, 'src'), '.js');
if (avecSite) balayer(path.join(SITE, 'assets', 'js'), '.js');

/* Le texte visible : on retire le balisage, les interpolations `${…}`, les
   concaténations et les entités. Ce qui reste est ce que l'usager LIT. */
const visible = (h) => h
  .replace(/<[^>]*>/g, ' ')
  .replace(/\$\{[^}]*\}/g, ' ')
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/['"]\s*\+\s*[\w.$()[\]]+\s*\+\s*['"]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const motsDe = (t) => (t.match(/[A-Za-zÀ-ÿ']{2,}/g) || []).length;

/* Un `<p>` ou un conteneur de prose, avec son contenu. On ne suit pas les
   imbrications : un paragraphe qui contient une balise simple suffit. */
const RE = /<(p|div|span)\b([^>]*class="[^"]*"[^>]*)?>((?:(?!<\1\b)[\s\S]){20,1800}?)<\/\1>/g;

const trouves = [];
for (const f of fichiers) {
  const src = fs.readFileSync(f, 'utf8');
  const lignesDe = (i) => src.slice(0, i).split('\n').length;
  let m;
  RE.lastIndex = 0;
  while ((m = RE.exec(src)) !== null) {
    const attrs = m[2] || '';
    const dedans = m[3];
    // Un `<div>` sans classe de prose n'est pas un paragraphe : c'est une boîte.
    if (m[1] !== 'p' && !CLASSES.test(attrs)) continue;
    const t = visible(dedans);
    const n = motsDe(t);
    if (n < SEUIL_MOTS) continue;
    trouves.push({
      fichier: path.relative(RACINE, f).replace(/\\/g, '/'),
      ligne: lignesDe(m.index),
      mots: n,
      texte: t.slice(0, 1200),
    });
  }
}

/* ══⚠⚠ ON CLASSE, SINON LA LISTE NE SERT À RIEN ═════════════════════════════
   Le premier jet rendait 158 passages en vrac. C'est un mur, pas une liste de
   décisions : la moitié sont des textes de POLITIQUE montrés aux clientes
   (retours, témoins, conditions d'un code promo) — obligatoires, et qui n'ont
   rien à voir avec ce qu'il a vu dans la fenêtre du veilleur.
   ⚠ Un audit qui ne trie pas transfère tout le travail à celui qui le lit.

   Trois catégories, et une seule est vraiment en cause :
     • EXPOSÉ — « à quoi sert cet écran », en tête d'un écran d'ADMINISTRATION.
       C'est le motif exact qu'il a fait retirer : la personne a l'écran sous les
       yeux, elle sait où elle est, et le texte repousse vers le bas ce qu'elle
       est venue faire. Il se périme en plus sans que personne ne le relise.
     • POLITIQUE — destiné aux CLIENTES (retours, témoins, promotions,
       facture). Long par nécessité, et engageant : on n'y touche pas.
     • AIDE — une phrase collée à un réglage précis, qui dit ce que CE
       réglage fait. Utile là où elle est ; à juger une par une. */

const OUVERTURES = /(?:a quoi sert|à quoi sert|ce que vous regardez|ce que vous voyez|ce que fait cet|cet ecran|cet écran|cette page (?:sert|permet|affiche)|comment ca marche|comment ça marche|a savoir|à savoir|ce que ca fait|ce que ça fait|en deux mots)/;
const SUJETS_POLITIQUE = /(?:politique|temoins|témoins|cookie|retours? (?:accept|recu|reçu)|remboursement|conditions|renseignements personnels|loi 25|vie privee|vie privée|garantie)/;
const SURFACE_CLIENTE = /(?:app\.js|billing\.js|promo\.js|cart\.js|shop\.js)$/;

/* ⚠⚠ ON ABAISSE LA CASSE NOUS-MÊMES, on ne compte pas sur le drapeau `i`.
   En JavaScript, `/à/i` NE REPLIE PAS `À` sans le drapeau `u` : la
   classification rendait ZÉRO exposé alors que les deux premiers passages de la
   liste commencent par « À quoi sert cette page » et « Ce que vous regardez ».
   Le contrôle avait l'air de fonctionner — il affichait une catégorie vide, ce
   qui se lit comme une bonne nouvelle. Trouvé en relisant la regex DEPUIS LE
   FICHIER plutôt qu'en la retapant : ma version retapée, elle, passait.
   `toLowerCase()` gère les accents correctement ; les motifs sont donc écrits
   en minuscules et sans `i`. */
for (const t of trouves) {
  const bas = t.texte.toLowerCase();
  const clienteA = SURFACE_CLIENTE.test(t.fichier);
  if (clienteA && SUJETS_POLITIQUE.test(bas)) t.cat = 'POLITIQUE';
  else if (OUVERTURES.test(bas)) t.cat = 'EXPOSÉ';
  else if (clienteA) t.cat = 'POLITIQUE';
  else t.cat = 'AIDE';
}

trouves.sort((a, b) => b.mots - a.mots);

/* `--json` : la même mesure, pour la page de tri. Le texte y va ENTIER (pas la
   coupe à 150 caractères de l'affichage) — on ne trie pas sur un extrait. */
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(trouves, null, 1));
  process.exit(0);
}


console.log('');
console.log('AUDIT — textes qui EXPLIQUENT l’écran (≥ ' + SEUIL_MOTS + ' mots)');
console.log('=========================================================================');
console.log(fichiers.length + ' fichier(s) lus · ' + trouves.length + ' passage(s) trouvé(s)');
console.log('');
console.log('⚠ Cet outil NE JUGE PAS : un avertissement avant une action irréversible');
console.log('  et un exposé de bienvenue se ressemblent ici. À trancher un par un.');
console.log('');

const parCat = (c) => trouves.filter((t) => t.cat === c);
const montrer = (c, titre, note) => {
  const l = parCat(c);
  console.log('');
  console.log('■ ' + titre + '  (' + l.length + ')');
  console.log('  ' + note);
  console.log('');
  let fic = '';
  for (const t of l) {
    if (t.fichier !== fic) { fic = t.fichier; console.log('  ── ' + fic); }
    console.log('     L' + String(t.ligne).padEnd(6) + String(t.mots).padStart(3) + ' mots  ' + t.texte.slice(0, 150));
  }
};

montrer('EXPOSÉ', 'EXPOSÉS D’ÉCRAN — le motif qu’il a fait retirer',
  'La personne a l’écran sous les yeux. Ces textes repoussent vers le bas ce');
console.log('     qu’elle est venue faire, et se périment sans que personne ne les relise.');

montrer('AIDE', 'AIDE CONTEXTUELLE — à juger une par une',
  'Collée à un réglage précis. Utile là où elle est si elle dit ce que CE');
console.log('     réglage fait ; à retirer si elle raconte l’écran.');

const pol = parCat('POLITIQUE');
console.log('');
console.log('■ TEXTES DE POLITIQUE — destinés aux CLIENTES  (' + pol.length + ')');
console.log('  Retours, témoins, conditions promotionnelles, facture. Longs par');
console.log('  nécessité et ENGAGEANTS : on n’y touche pas. Non détaillés ici.');
console.log('');
