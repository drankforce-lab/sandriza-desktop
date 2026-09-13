#!/usr/bin/env node
'use strict';

/*
 * LA PAGE ELLE-MEME A UNE LANGUE — ET CE N EST PAS UN TEXTE
 * =============================================================================
 * ⚠⚠ CE QUE LE CHANTIER BILINGUE NE POUVAIT PAS ATTRAPER. Les 98 fenetres ont
 * ete traduites texte par texte, 7 847 fois, et les deux mesures sont a zero :
 * le compteur ne trouve plus une phrase sans decision, le residuel ne trouve
 * plus un mot accentue sur la page anglaise. Et pourtant TOUTES les fenetres
 * ecrivaient encore `<html lang="fr">` EN DUR, `toLocaleDateString('fr-CA')`
 * EN DUR, et la virgule decimale posee a la main par `.replace('.', ',')`.
 *
 * ⚠ AUCUN DICTIONNAIRE NE POUVAIT LES VOIR, parce que CE NE SONT PAS DES TEXTES.
 * Ni le compteur ni le residuel ne regardent un attribut de balise ou un
 * argument de `toLocaleString` — ils cherchent des PHRASES. Un defaut qui vit
 * hors du champ des deux mesures est un defaut que rien ne signale : il est
 * reste 98 fois de suite sous des bancs verts.
 *
 * ══ CE QUE CA COUTE, PUISQUE << L ANGLAIS S AFFICHE QUAND MEME >> ═══════════
 *   · `lang="fr"` : le navigateur coupe les mots a la francaise, le correcteur
 *     souligne tout l anglais, et le lecteur d ecran EPELLE l anglais avec un
 *     accent francais. Ce n est pas de la decoration, c est ce qui est ANNONCE.
 *   · `'fr-CA'` fige : 2026-09-13 reste 2026-09-13 la ou l anglais attend un
 *     autre ordre, et 1 234,56 $ garde son espace et sa virgule.
 *   · `.replace('.', ',')` : une virgule decimale POSEE A LA MAIN ne redevient
 *     jamais un point. C est la seule des trois qui peut faire lire un nombre
 *     FAUX — 1,234 se lit mille-deux-cent-trente-quatre en anglais.
 *
 * ══ LA REPONSE : TROIS PIECES DANS LE SOCLE ════════════════════════════════
 * `TETE(attrs)` ecrit le doctype et l attribut `lang` de la langue courante ;
 * `LIEU()` rend `fr-CA` ou `en-CA` ; `SEP_DEC()` rend la virgule ou le point.
 * Elles sont resolues A LA GENERATION, comme `T(...)` : la page NAIT dans la
 * bonne langue et dans le bon format.
 *
 * ══ CE QUE CE BANC REFUSE ══════════════════════════════════════════════════
 *   1. `lang="fr"` ecrit en dur dans une page ;
 *   2. une chaine qui est EXACTEMENT `fr-CA` (ou `fr-FR`, `fr`) — un LIEU fige.
 *      ⚠ Une chaine qui CONTIENT `fr-CA` au milieu d une phrase est un TEXTE
 *      (« Voix francaise (fr-CA) ») et ne compte pas : la borne est l egalite ;
 *   3. `.replace('.', ',')` — la virgule decimale a la main.
 * Les commentaires sont retires d abord : cette fiche-ci, comme les autres,
 * NOMME les motifs interdits pour expliquer pourquoi ils le sont.
 *
 * ══ LES EXCEPTIONS SONT DECLAREES, PAS OUBLIEES ════════════════════════════
 * Une exception muette redevient un defaut. Chacune porte sa raison dans
 * `DECLAREES` ci-dessous, et `connexion.js` porte en plus une CONDITION que le
 * banc verifie vraiment.
 *
 *   node tools/banc-langue-page.js
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DOS_FEN = path.join(RACINE, 'src', 'fenetres');

/* ⚠ MEME RETRAIT DES COMMENTAIRES QUE LES AUTRES BANCS DE LANGUE (voir
   `tools/textes-visibles.js` pour la borne du `/*` colle a une lettre). */
const nu = (s) => s
  .replace(/(^|[\s;{}(),=])\/\*[\s\S]*?\*\//g, (m, p) => p + m.slice(p.length).replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));

/* ── LES EXCEPTIONS, CHACUNE AVEC SA RAISON ────────────────────────────────── */
const DECLAREES = {
  'src/fenetres/socle.js':
    'C EST LE SOCLE : TETE, LIEU et SEP_DEC vivent ici, et LIEU doit bien nommer fr-CA quelque part.',

  /* ⚠ CELLE-CI N EST PAS UNE DISPENSE, C EST UNE CONDITION. La fenetre de
     connexion est ENGENDREE (node tools/connexion/batir.js) et dessinee AVANT
     qu on sache dans quelle langue on travaille — la langue est un reglage de
     la session, et la session n est pas encore ouverte. Elle pose donc son
     `lang` A L EXECUTION, des le premier dessin. Le banc verifie qu elle le
     fait vraiment ; si cette ligne disparait, l exception tombe. */
  'src/fenetres/connexion.js':
    'ENGENDREE et dessinee avant la session : elle pose document.documentElement.lang a l execution.',

  /* ⚠ IL Y EN AVAIT UNE TROISIEME, ET ELLE A TENU UNE JOURNEE. `src/main.js`
     etait declare ici avec cet aveu : la fenetre << A propos >>, batie hors de
     `src/fenetres/`, n avait JAMAIS ete traduite — lui poser un `lang`
     dynamique aurait MENTI, la page serait restee francaise en annoncant
     l anglais. Elle a ete traduite le 2026-09-13 (`src/langue/apropos.js`),
     et l exception est tombee avec sa raison.
     ➡ C EST LA FORME QU ON VEUT POUR UNE EXCEPTION : elle porte ce qu il faut
     faire pour qu elle disparaisse, et elle disparait. */
};

/* La condition attachee a une exception : elle doit etre VRAIE, sinon refus. */
const CONDITIONS = {
  'src/fenetres/connexion.js': (src) =>
    /document\.documentElement\.lang\s*=/.test(src)
      ? null
      : 'elle ne pose plus document.documentElement.lang a l execution — son exception ne tient plus.',
};

/* ── LES TROIS MOTIFS ──────────────────────────────────────────────────────── */
const MOTIFS = [
  {
    quoi: 'lang="fr" ecrit en dur',
    re: /\blang\s*=\s*(["'])fr(?:-[A-Z]{2})?\1/g,
    faire: 'ecrire ${TETE()} — le socle pose le doctype ET la langue courante.',
  },
  {
    /* ⚠ L EGALITE, PAS L INCLUSION : une chaine dont le contenu EST fr-CA est
       un lieu ; une phrase qui le cite (« Voix francaise (fr-CA) ») est un
       texte, et un texte a deja son dictionnaire. */
    quoi: 'un lieu fige',
    re: /(["'])fr-[A-Z]{2}\1/g,
    faire: "ecrire '${LIEU()}' — fr-CA en francais, en-CA en anglais.",
  },
  {
    /* ⚠⚠ ET LE `fr` TOUT SEUL : CELUI-LA, IL A FALLU LE DISTINGUER. Le premier
       passage de ce banc a leve SEPT endroits ecrivant `'fr'`, et pas un seul
       n etait un defaut : la langue d un CLIENT dans sa fiche, le mode de voix
       Twilio, la valeur d une option `<option value="fr">`, le repli du module
       de langue. Ce sont des DONNEES — exactement ce que protege SZ_DONNEES —
       et les traduire abimerait la base (sa consigne : la traduction ne touche
       que ce qu on LIT).
       La borne qui les separe : un lieu est un ARGUMENT passe a une fonction
       qui formate ou qui compare. Ailleurs, `fr` est une valeur. */
    quoi: 'un lieu fige (fr passe a une fonction de format)',
    re: /(?:toLocale[A-Za-z]*|localeCompare|Intl\.[A-Za-z]+)\([^;\n]{0,120}?(["'])fr\1/g,
    faire: "ecrire '${LIEU()}' — le format suit l interface, pas la donnee.",
  },
  {
    quoi: 'la virgule decimale posee a la main',
    re: /\.replace\(\s*(["'])\.\1\s*,\s*(["']),\2\s*\)/g,
    faire: "ecrire .replace('.', '${SEP_DEC()}') — ou mieux, laisser toLocaleString faire les DEUX separateurs.",
  },
];

/* ── LE PARCOURS ───────────────────────────────────────────────────────────── */
const fichiers = [];
for (const f of fs.readdirSync(DOS_FEN).sort())
  if (f.endsWith('.js')) fichiers.push(path.posix.join('src', 'fenetres', f));
for (const f of ['src/main.js', 'src/menubar.js']) fichiers.push(f);

const fautes = [];
let regardes = 0;

for (const rel of fichiers) {
  const src = fs.readFileSync(path.join(RACINE, rel.split('/').join(path.sep)), 'utf8');

  const cond = CONDITIONS[rel];
  if (cond) {
    const pourquoi = cond(src);
    if (pourquoi) fautes.push({ rel, ligne: 0, quoi: 'exception non tenue', vu: pourquoi, faire: 'retablir la condition, ou retirer la declaration.' });
  }
  if (DECLAREES[rel]) continue;

  regardes++;
  const s = nu(src);
  const lignes = s.split('\n');
  for (const m of MOTIFS) {
    m.re.lastIndex = 0;
    let x;
    while ((x = m.re.exec(s))) {
      const ligne = s.slice(0, x.index).split('\n').length;
      fautes.push({ rel, ligne, quoi: m.quoi, vu: lignes[ligne - 1].trim().slice(0, 110), faire: m.faire });
    }
  }
}

/* ── LE VERDICT ────────────────────────────────────────────────────────────── */
if (!fautes.length) {
  console.log('>>> ' + regardes + ' page(s) regardee(s) : aucune langue figee, aucun lieu fige, aucune virgule a la main');
  console.log('    (' + Object.keys(DECLAREES).length + ' exception(s) declaree(s), chacune avec sa raison)');
  process.exit(0);
}

console.log('ECHEC  ' + fautes.length + ' endroit(s) ou la PAGE reste francaise quoi qu il arrive :\n');
let dernier = '';
for (const f of fautes) {
  if (f.rel !== dernier) { console.log('  ' + f.rel); dernier = f.rel; }
  console.log('    ligne ' + f.ligne + '  ' + f.quoi);
  console.log('      vu    : ' + f.vu);
  console.log('      faire : ' + f.faire);
}
console.log('');
console.log('⚠ Ce ne sont pas des textes : aucun dictionnaire ne peut les atteindre.');
console.log('  Le socle porte les trois pieces — TETE(), LIEU(), SEP_DEC().');
process.exit(1);
