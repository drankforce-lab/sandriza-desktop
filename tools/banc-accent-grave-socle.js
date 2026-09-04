#!/usr/bin/env node
'use strict';

/*
 * BANC DE L ACCENT GRAVE DANS LE SOCLE
 * =============================================================================
 * POURQUOI CE BANC EXISTE. Le 2026-09-04, TROIS fois dans la meme journee, j ai
 * casse `socle.js` en ecrivant un nom de code entre accents graves a l interieur
 * d un commentaire CSS. Le gabarit se referme au premier accent grave : ce qui
 * suit cesse d etre du texte et redevient du code, et le module ne se charge
 * plus. Les 92 fenetres tombent d un coup.
 *
 * ⚠ `node --check` NE VOIT RIEN, et c est tout le piege : un gabarit referme
 * trop tot laisse un fichier syntaxiquement VALIDE la plupart du temps. Il faut
 * CHARGER le module pour s en apercevoir — ce que fait `verifier-fenetres.js`,
 * mais apres trente secondes de suite complete. Ce banc repond en deux dixiemes,
 * et surtout il nomme la LIGNE.
 *
 * ⚠ ET IL ATTRAPE AUSSI LE CAS OU RIEN NE CASSE. Un accent grave peut se
 * refermer plus loin sans erreur de syntaxe : le module se charge, mais une
 * portion de feuille de style a disparu du gabarit. C est le pire des cas —
 * silencieux. Aucun controle qui se contente de charger le module ne le voit.
 *
 * CE QU IL FAIT. Il repere les gros gabarits de contenu a leur forme exacte —
 * une ligne qui est exactement `const NOM = ` suivi d un accent grave, fermee par
 * une ligne qui est exactement un accent grave puis un point-virgule — et refuse
 * tout accent grave entre les deux. C est l ancrage etroit de
 * `tools/check/gabarits.js` cote site : une regle large produirait des dizaines
 * de faux positifs, et un controle qui crie au loup finit desactive.
 *
 *   node tools/banc-accent-grave-socle.js
 */

const fs = require('fs');
const path = require('path');

const FICHIER = path.join(__dirname, '..', 'src', 'fenetres', 'socle.js');
const AG = String.fromCharCode(96);          // l accent grave, jamais ecrit tel quel ici

const lignes = fs.readFileSync(FICHIER, 'utf8').split('\n');
const ouvre = new RegExp('^const [A-Z_][A-Z0-9_]* = ' + AG + '$');
const ferme = new RegExp('^' + AG + ';$');
// Ecrit en LITTERAL d expression reguliere, pas en chaine : passer par une
// chaine oblige a doubler chaque antislash, et un niveau se perd toujours en
// route. Ce fichier n est pas un gabarit, les accents graves y sont sans danger.
const coupure = /^`(\s*\+\s*[A-Za-z_$][\w$]*)+\s*\+\s*`$/;

const fautes = [];
const gabarits = [];
let dans = null;

for (let i = 0; i < lignes.length; i++) {
  const l = lignes[i].replace(/\r$/, '');
  if (dans === null) {
    if (ouvre.test(l)) dans = { nom: l.slice(6, l.indexOf(' = ')), debut: i + 1 };
    continue;
  }
  if (ferme.test(l)) { gabarits.push(dans.nom); dans = null; continue; }
  /* LA SEULE EXCEPTION LEGITIME : une COUPURE DE CONCATENATION, quand un gabarit
     en incorpore un autre par un simple `+`. Sa forme est exacte et reconnaissable
     — accent grave, puis une suite de `+ NOM`, puis accent grave — et il n y en a
     qu une seule dans tout le fichier. Toute autre presence est la faute. */
  if (coupure.test(l.trim())) continue;
  if (l.indexOf(AG) >= 0) {
    fautes.push('  ligne ' + (i + 1) + '  (dans ' + dans.nom + ', ouvert ligne ' + dans.debut + ')\n'
      + '      ' + l.trim().slice(0, 110));
  }
}

if (dans !== null) {
  console.log('ECHEC  le gabarit ' + dans.nom + ' (ligne ' + dans.debut + ') ne se referme jamais.');
  console.log('  Une ligne exactement egale a un accent grave suivi d un point-virgule le fermerait.');
  process.exit(1);
}
if (fautes.length) {
  console.log('ECHEC  ' + fautes.length + ' accent(s) grave(s) a l interieur d un gabarit de socle.js :');
  console.log(fautes.join('\n'));
  console.log('');
  console.log('  Le gabarit se referme la, et la suite redevient du code. Ecrire les noms');
  console.log('  de code NUS dans les commentaires qui vivent dans un gabarit — y compris');
  console.log('  les commentaires CSS, qui ne sont PAS des commentaires pour JavaScript.');
  process.exit(1);
}
console.log('OK  ' + gabarits.length + ' gabarits de socle.js, aucun accent grave a l interieur.');
