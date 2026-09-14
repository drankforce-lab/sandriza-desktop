#!/usr/bin/env node
'use strict';

/*
 * LES MESURES PARLENT-ELLES LA LANGUE DE LA PAGE ?
 * =============================================================================
 * ⚠⚠ SA REMARQUE DU 2026-09-13, sur une capture : « 417 Mo ». La page etait
 * anglaise. `Mo`, `Ko`, `Go` sont des abreviations FRANCAISES — l anglais ecrit
 * `MB`, `KB`, `GB`. Et le symbole de la monnaie ne se contente pas de changer :
 * il CHANGE DE COTE. « 12,50 $ » en francais-canadien, « $12.50 » en anglais.
 *
 * ⚠⚠⚠ POURQUOI AUCUN DES TRENTE ET UN AUTRES BANCS NE L A VU. Ils relevent le
 * TEXTE de la page. Or « 417 Mo » n est pas dans la page : il est FABRIQUE a
 * l execution, dans le script, a partir d un nombre. Le chantier bilingue
 * pouvait donc etre a zero faute — il l etait — et la page anglaise annoncer
 * quand meme « 417 Mo ».
 *
 * ➡ **CE QUI EST FABRIQUE A L EXECUTION ECHAPPE AU RELEVE DES TEXTES.** C est
 * la meme lecon que `TETE`/`LIEU`/`SEP_DEC` (en tete de `src/fenetres/socle.js`),
 * repayee sur un quatrieme terrain.
 *
 * ══ CE QUE CELUI-CI REFUSE ══════════════════════════════════════════════════
 *   · une abreviation d octets ecrite a la main dans une fenetre ;
 *   · un symbole « $ » accole a un nombre dans une fenetre ;
 *   · une fenetre qui refabrique `toLocaleString({ style: 'currency' })` au
 *     lieu de passer par `szArgent`.
 * Les trois recettes vivent dans `socle.js` (`JS_MESURES`) et sont posees dans
 * les 99 fenetres par `JS_DIRE`.
 *
 * ⚠ IL VERIFIE AUSSI QUE LES RECETTES SONT EFFECTIVEMENT LA, et qu elles
 * rendent la bonne chose DANS LES DEUX LANGUES — sans quoi il ne prouverait que
 * l absence d une faute, pas la presence d une solution. C est la lecon de
 * `banc-langue-effet` : un compteur mesure une intention.
 *
 *   node tools/banc-langue-mesures.js
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DOS = path.join(RACINE, 'src', 'fenetres');
const L = require('../src/langue');

/* ⚠ LES COMMENTAIRES SONT RETIRES AVANT TOUTE LECTURE. Les fiches de ce depot
   CITENT les formes fautives pour les expliquer — « 12,50 $ », « 417 Mo »,
   « Ko/Mo/Go ». Un releve qui lirait les commentaires refuserait un fichier
   parfaitement correct a cause de sa propre explication. Meme lecon que
   `banc-menu-langue` (la forme `A('…')` citee dans un commentaire). */
const _nu = (src) => src
  .replace(/(^|[\s;{}(),=])\/\*[\s\S]*?\*\//g, (m, p) => p + ' ')
  .split('\n')
  .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
  .join('\n');

/* Les motifs fautifs. ⚠ On vise la FABRICATION, pas la mention : une unite
   collee a un nombre par `+`, ou posee en fin de chaine apres une espace. */
const FAUTES = [
  /* ⚠ ON VISE LA FABRICATION, PAS LE MOT. Premier jet : le motif refusait
     `sauvegarde.js` pour `' ko'` — un NOM DE CLASSE CSS (l etat « faute »).
     Une unite est CONCATENEE a un nombre, ou rangee dans une table d unites ;
     c est cette forme-la qu on cherche, et pas deux lettres quelque part.
     ➡ Meme lecon que `banc-menu-langue` : un motif court trouve toujours
     quelque chose quelque part, et une fausse faute coute la confiance qu on a
     dans les vraies. */
  { quoi: 'une abreviation d octets concatenee a la main (Ko/Mo/Go/To — francaises)',
    rx: /\+\s*['"]\s?(?:Ko|ko|Mo|mo|Go|go|To)['"]/, sauf: /szOctets/ },
  { quoi: 'une table d unites d octets ecrite dans une fenetre',
    rx: /\[\s*['"](?:o|Ko|ko|Mo)['"]\s*,/, sauf: /szOctets/ },
  { quoi: 'le symbole « $ » accole a un nombre (il passe DEVANT en anglais)',
    rx: /\+\s*['"]\s?\$['"]|['"]\s\$['"]\s*[;,)+]/, sauf: /szArgent/ },
  { quoi: 'une mise en forme de monnaie refabriquee au lieu de `szArgent`',
    rx: /style\s*:\s*['"]currency['"]/, sauf: null },
  /* ⚠⚠ AJOUTE LE 2026-09-14 (#102), ET VOICI CE QUI LE RENDAIT INVISIBLE.
     Le Studio et la telephonie ecrivaient `toFixed(2).replace('.', ',')`. Le
     SEPARATEUR DECIMAL etait bon — c est tout ce qu on relit — mais le
     GROUPEMENT DES MILLIERS manquait : « 1234,50 $ » sur un ecran, « 1 234,50 $ »
     sur le voisin. Les deux regles du dessus ne voyaient rien : il n y avait ni
     symbole colle, ni `style:'currency'`. La faute etait dans le NOMBRE.
     ➡ `szArgentNombre(n, decimales)` groupe et choisit le separateur ; le
     nombre de decimales reste a l ecran qui appelle (le Studio en garde TROIS
     sous la demi-cenne).
     ⚠ LE MOTIF ACCEPTE LES DEUX ECRITURES, et la seconde m avait echappe :
       a.toFixed(2).replace('.', …)
       (x ? a.toFixed(3) : a.toFixed(2)).replace('.', …)   <- le `.replace` porte
                                                              sur la PARENTHESE.
     Chercher `toFixed(2).replace` collés n aurait attrape que la premiere —
     meme lecon que l attribut coupe du 2026-09-13. */
  { quoi: 'un montant recompose a la main au lieu de `szArgentNombre` (le groupement des milliers est perdu)',
    rx: /\.toFixed\(\s*\d+\s*\)[^;\n]*\.replace\(\s*['"]\./, sauf: null },
];

/* ⚠ `socle.js` EST LA SEULE PLACE OU CES FORMES ONT LE DROIT D EXISTER : c est
   lui qui les fabrique. L exclure n est pas une exception de complaisance, c est
   la definition meme de << une seule place >>. */
const fautes = [];
let regardees = 0;

for (const f of fs.readdirSync(DOS).filter((x) => x.endsWith('.js') && x !== 'socle.js').sort()) {
  const brut = fs.readFileSync(path.join(DOS, f), 'utf8');
  const src = _nu(brut);
  regardees++;
  src.split('\n').forEach((ligne, i) => {
    for (const { quoi, rx, sauf } of FAUTES) {
      if (!rx.test(ligne)) continue;
      if (sauf && sauf.test(ligne)) continue;
      fautes.push(f + ':' + (i + 1) + '  ' + quoi + '\n        ' + ligne.trim().slice(0, 110));
    }
  });
}

if (regardees < 90) {
  console.error('✗ seulement ' + regardees + ' fenetre(s) lue(s) — le parcours ne marche plus, '
    + 'ce banc ne prouverait rien.');
  process.exit(1);
}

/* ══ ET LES RECETTES, RENDENT-ELLES LA BONNE CHOSE ? ════════════════════════
   ⚠ SANS CE BLOC, LE BANC NE MESURERAIT QU UNE ABSENCE. On pourrait retirer
   `JS_MESURES` du socle : plus une seule faute relevee, et plus une seule
   fenetre capable d afficher un montant. */
const essais = [];
const attendu = (l, quoi, rendu, veut) => {
  if (rendu !== veut) {
    essais.push('[' + l + '] ' + quoi + ' rend ' + JSON.stringify(rendu)
      + ' au lieu de ' + JSON.stringify(veut));
  }
};

for (const l of ['fr', 'en']) {
  L.poserLangue(l);
  /* Le socle est relu a chaque langue : ses blocs sont des FONCTIONS pour ca. */
  delete require.cache[require.resolve('../src/fenetres/socle.js')];
  const S = require('../src/fenetres/socle.js');
  const js = S.JS_SOCLE ? S.JS_SOCLE() : '';
  for (const nom of ['szArgent', 'szArgentChamp', 'szArgentSymbole', 'szArgentNombre', 'szOctets']) {
    if (js.indexOf('function ' + nom + '(') < 0) {
      essais.push('[' + l + '] `' + nom + '` n est pas posee dans les fenetres — '
        + 'aucune ne saurait plus afficher un montant ni un poids');
    }
  }
  /* On EXECUTE les trois recettes, plutot que de croire qu elles sont la. */
  let F = null;
  try {
    // eslint-disable-next-line no-new-func
    F = new Function(js.slice(js.indexOf('function szArgent('))
      + '\nreturn { szArgent: szArgent, szArgentChamp: szArgentChamp,'
      + ' szArgentSymbole: szArgentSymbole, szArgentNombre: szArgentNombre,'
      + ' szOctets: szOctets };')();
  } catch (e) {
    essais.push('[' + l + '] les recettes ne s executent pas : ' + e.message);
  }
  if (!F) continue;

  const en = (l === 'en');
  /* ⚠ LE CHIFFRE DE SA CAPTURE, exactement : seule l unite devait changer. */
  attendu(l, 'szOctets(437 000 000)', F.szOctets(437000000), en ? '417 MB' : '417 Mo');
  /* ⚠ 5 400 000 / 1024² = 5,149… — et NON 5,4 : le Mo est binaire ici, comme
     dans les cinq fenetres d origine. Ma premiere attente disait 5,2 ; c est le
     banc qui avait raison. On garde le cas, justement pour ca. */
  attendu(l, 'szOctets(5 400 000)', F.szOctets(5400000), en ? '5.1 MB' : '5,1 Mo');
  attendu(l, 'szOctets(0)', F.szOctets(0), en ? '0 B' : '0 o');
  attendu(l, 'szArgentChamp(12.5)', F.szArgentChamp(12.5), en ? '$12.50' : '12,50 $');
  /* ⚠ L ECHANTILLON SUIT LA LANGUE. Premier jet : la virgule decimale francaise
     etait passee aussi a l anglais, qui rendait donc « $0,002 » — j ai cru une
     seconde a une faute du code. `szArgentSymbole` ne touche PAS au separateur,
     c est son appelant qui l a deja pose ; lui donner une entree impossible ne
     prouvait rien et accusait a tort. */
  attendu(l, 'szArgentSymbole(un montant deja mis en forme)',
    F.szArgentSymbole(en ? '0.002' : '0,002'), en ? '$0.002' : '0,002 $');
  /* ⚠ `szArgent` PASSE PAR `Intl` : on ne fige pas son espace insecable ni son
     separateur de milliers (ils dependent de la version d ICU). On verifie ce
     qui NE DOIT PAS bouger — de quel cote est le symbole. */
  const a = F.szArgent(1234.5);
  if (en ? a.indexOf('$') !== 0 : a.indexOf('$') !== a.length - 1) {
    essais.push('[' + l + '] szArgent(1234.5) rend ' + JSON.stringify(a)
      + ' : le symbole n est pas du bon cote');
  }

  /* ══ `szArgentNombre` — LE NOMBRE SEUL, GROUPE (#102) ═════════════════════
     ⚠ C EST LE GROUPEMENT QU ON EPROUVE, parce que c est LUI qui manquait : le
     separateur decimal, lui, etait deja bon dans les versions a la main — et
     c est pour ca que personne ne voyait la difference en relisant. */
  const g = F.szArgentNombre(1234.5, 2);
  if (!/\d/.test(g) || g.replace(/[^\d]/g, '') !== '123450') {
    essais.push('[' + l + '] szArgentNombre(1234.5, 2) rend ' + JSON.stringify(g)
      + ' : ce ne sont plus les memes chiffres');
  }
  /* ⚠ ON NE FIGE PAS LE CARACTERE DE GROUPEMENT (espace fine, insecable,
     virgule : cela depend d ICU) — on exige qu il y en ait UN, c est-a-dire
     qu au moins un caractere separe les milliers des centaines. */
  if (g.length <= '1234.50'.length) {
    essais.push('[' + l + '] szArgentNombre(1234.5, 2) rend ' + JSON.stringify(g)
      + ' : aucun groupement des milliers — c est exactement la faute de #102');
  }
  /* ⚠ ET IL NE POSE AUCUN SYMBOLE : le cote du « $ » est le travail de
     `szArgentSymbole`. Deux pieces, deux questions. */
  if (g.indexOf('$') >= 0) {
    essais.push('[' + l + '] szArgentNombre pose un symbole : ce n est pas son role');
  }
  /* Les trois decimales du Studio et de Fal.ai passent bien. */
  const t = F.szArgentNombre(0.002, 3);
  if (t.replace(/[^\d]/g, '') !== '0002') {
    essais.push('[' + l + '] szArgentNombre(0.002, 3) rend ' + JSON.stringify(t)
      + ' : les trois decimales sont perdues, « 0,00 $ » ferait croire a la gratuite');
  }
}
L.poserLangue('fr');

console.log('');
console.log('== LES MESURES PARLENT-ELLES LA LANGUE DE LA PAGE ? ==');
console.log('  ' + regardees + ' fenetre(s) relue(s), et les 4 recettes essayees dans les 2 langues');
console.log('');

if (!fautes.length && !essais.length) {
  console.log('>>> aucune unite ni aucun symbole de monnaie fabrique a la main');
  process.exit(0);
}

if (fautes.length) {
  console.error('ECHEC  ' + fautes.length + ' mesure(s) fabriquee(s) a la main dans une fenetre :');
  fautes.forEach((x) => console.error('   — ' + x));
  console.error('');
  console.error('⚠ Passez par `szOctets`, `szArgent`, `szArgentChamp` ou `szArgentSymbole`');
  console.error('  (src/fenetres/socle.js, JS_MESURES) : elles sont posees dans les 99 fenetres.');
}
if (essais.length) {
  console.error('ECHEC  ' + essais.length + ' recette(s) ne rendent pas ce qu il faut :');
  essais.forEach((x) => console.error('   — ' + x));
}
process.exit(1);
