#!/usr/bin/env node
'use strict';

/*
 * POSER LES T() D UNE FENETRE — et prouver que le francais n a pas bouge
 * =============================================================================
 * ⚠⚠ CE QUI REND CET OUTIL SUR, ET SANS QUOI JE NE L AURAIS PAS ECRIT : apres
 * avoir enveloppe les textes, il REGENERE la page en francais et exige qu elle
 * soit IDENTIQUE OCTET POUR OCTET a celle d avant. Si un seul caractere bouge,
 * il remet le fichier comme il etait et le dit.
 *
 * C est la seule facon d envelopper des centaines de textes sans relire chaque
 * ligne : ce n est pas ma vigilance qui garantit le francais, c est une mesure.
 *
 * ══ CE QU IL N ENVELOPPE JAMAIS ═════════════════════════════════════════════
 *   · ce qui est dans un COMMENTAIRE — ce n est pas affiche, et le toucher
 *     salirait la fiche qui explique le code ;
 *   · une valeur `value="…"` ou `.value = '…'` — ⚠⚠ SA CONSIGNE : la traduction
 *     ne touche que ce qu on LIT. Une valeur part dans la base.
 *   · un texte deja enveloppe (`${T('…')}`), pour qu on puisse relancer l outil
 *     sans l abimer.
 *
 * ⚠ IL N INVENTE AUCUNE TRADUCTION : il n enveloppe que les textes qui ont DEJA
 * une entree dans `src/langue/<fenetre>.js`. Le dictionnaire s ecrit a la main,
 * et c est voulu — une traduction automatique d interface donne des phrases que
 * personne n aurait ecrites.
 *
 *   node tools/langue-poser.js <fenetre>
 */

const fs = require('fs');
const path = require('path');
const LANGUE = require('../src/langue');

const nom = String(process.argv[2] || '').replace(/\.js$/, '');
if (!nom) { console.log('usage : node tools/langue-poser.js <fenetre>'); process.exit(1); }

const FIC = path.join(__dirname, '..', 'src', 'fenetres', nom + '.js');
if (!fs.existsSync(FIC)) { console.log('fenetre introuvable : ' + FIC); process.exit(1); }

const page = () => {
  delete require.cache[require.resolve(FIC)];
  const mod = require(FIC);
  const fab = Object.values(mod).find((v) => typeof v === 'function');
  if (!fab) return null;
  try { return fab(''); } catch (e) { try { return fab(); } catch (e2) { return null; } }
};

LANGUE.poserLangue('fr');
const avantFR = page();
if (avantFR === null) { console.log('la fabrique ne rend pas de page — rien touche'); process.exit(1); }

const src0 = fs.readFileSync(FIC, 'utf8');
const NL2 = src0.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
const dico = LANGUE.dico(nom) || {};
const cles = Object.keys(dico).sort((a, b) => b.length - a.length);   // les plus longues d abord
if (!cles.length) { console.log('aucun dictionnaire pour ' + nom + ' — rien a poser'); process.exit(0); }

/* Les zones a NE PAS toucher : commentaires, valeurs, textes deja enveloppes. */
const zonesInterdites = (s) => {
  const z = [];
  const pousse = (re) => { let m; while ((m = re.exec(s))) z.push([m.index, m.index + m[0].length]); };
  pousse(/\/\*[\s\S]*?\*\//g);
  pousse(/(^|[^:])\/\/[^\n]*/g);
  pousse(/value\s*=\s*"[^"\n]*"/g);
  pousse(/\.value\s*=\s*'[^'\n]*'/g);
  pousse(/\$\{T\([^)]*\)\}/g);
  return z;
};

let s = src0;
let poses = 0, sautes = 0;
for (const cle of cles) {
  if (!s.includes(cle)) continue;
  const z = zonesInterdites(s);
  const dedans = (i) => z.some(([a, b]) => i >= a && i < b);
  let out = '', reste = s, decal = 0, fait = false;
  let i = s.indexOf(cle);
  out = '';
  let pos = 0;
  while (i >= 0) {
    if (dedans(i)) { sautes++; }
    else {
      out += s.slice(pos, i) + '${T(' + JSON.stringify(cle).replace(/'/g, "\u0027") + ')}';
      pos = i + cle.length; poses++; fait = true;
      i = s.indexOf(cle, pos); continue;
    }
    out += s.slice(pos, i + cle.length); pos = i + cle.length;
    i = s.indexOf(cle, pos);
  }
  if (fait) { s = out + s.slice(pos); }
}

if (!poses) { console.log(nom + ' : rien de nouveau a envelopper (' + sautes + ' occurrence(s) ecartee(s))'); process.exit(0); }

/* ⚠⚠ ET LE `require` DU DICTIONNAIRE, SANS QUOI RIEN NE SE GÉNÈRE. Première
   version : l’outil enveloppait parfaitement et la fenêtre mourait sur
   « T is not defined ». C’est la comparaison octet pour octet qui l’a dit — elle
   a remis le fichier comme il était, et je n’ai rien eu à réparer. Un outil qui
   se vérifie lui-même se corrige sans coûter une fenêtre. */
if (!/require\('\.\.\/langue'\)/.test(s)) {
  const m = /^const \{[^}]*\} = require\('\.\/socle(?:\.js)?'\);$/m.exec(s);
  const ligne = NL2 + '/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la' + NL2 + '   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur' + NL2 + '   enregistrable (voir src/langue/index.js). */' + NL2 + "const T = require('../langue').tr('" + nom + "');";
  if (m) s = s.slice(0, m.index + m[0].length) + ligne + s.slice(m.index + m[0].length);
  else { console.log('  NON  ' + nom + ' : aucun require(./socle) ou greffer le dictionnaire'); process.exit(1); }
}
fs.writeFileSync(FIC, s, 'utf8');

/* ⚠⚠ LA PREUVE. On regenere en francais et on compare OCTET POUR OCTET. */
LANGUE.poserLangue('fr');
let apresFR = null;
try { apresFR = page(); } catch (e) { apresFR = null; }
if (apresFR !== avantFR) {
  fs.writeFileSync(FIC, src0, 'utf8');
  console.log('  NON  ' + nom + ' : la page FRANCAISE a change — fichier REMIS COMME AVANT.');
  if (apresFR === null) console.log('       (elle ne se genere meme plus)');
  else {
    let k = 0; while (k < apresFR.length && apresFR[k] === avantFR[k]) k++;
    console.log('       premier ecart a l offset ' + k + ' :');
    console.log('       avant : ' + JSON.stringify(avantFR.slice(k - 40, k + 40)));
    console.log('       apres : ' + JSON.stringify(apresFR.slice(k - 40, k + 40)));
  }
  process.exit(1);
}
console.log('  OK   ' + nom + ' : ' + poses + ' texte(s) enveloppe(s), ' + sautes
  + ' ecarte(s) (commentaire, valeur, deja fait)');
console.log('       la page FRANCAISE est identique octet pour octet.');
