#!/usr/bin/env node
'use strict';

/*
 * BANC DE L ACCENT GRAVE DANS LES GABARITS DES FENETRES
 * =============================================================================
 * POURQUOI CE BANC EXISTE. Le 2026-09-04, TROIS fois dans la meme journee, j ai
 * casse `socle.js` en ecrivant un nom de code entre accents graves a l interieur
 * d un commentaire CSS. Le gabarit se referme au premier accent grave : ce qui
 * suit cesse d etre du texte et redevient du code, et le module ne se charge
 * plus. Les 92 fenetres tombent d un coup.
 *
 * ⚠⚠ ET LE 2026-09-08, LA MEME FAUTE, DANS `journaux.js` — que ce banc NE
 * REGARDAIT PAS. Il ne lisait qu un fichier, `socle.js`, et ne connaissait qu une
 * seule forme d ouverture de gabarit (`const NOM = ` + accent grave). Or chaque
 * fenetre construit sa page dans un gabarit ouvert par un `return`, sur des
 * centaines de lignes, et un commentaire y vit exactement comme dans le socle.
 * LA LECON ETAIT PAYEE, LA GARDE NE COUVRAIT QUE L ENDROIT OU ELLE AVAIT ETE
 * PAYEE. Ce banc lit maintenant les 94 fenetres et les DEUX formes.
 *
 * ⚠ `node --check` NE VOIT PAS TOUJOURS, et c est tout le piege : un gabarit
 * referme trop tot laisse souvent un fichier syntaxiquement VALIDE — il suffit
 * que le nombre d accents graves reste PAIR. Le module se charge, mais une
 * portion de feuille de style ou de page a quitte la chaine en silence. Aucun
 * controle qui se contente de charger le module ne le voit. Et quand la syntaxe
 * casse pour de bon, `node --check` dit « Unexpected identifier » sans jamais
 * nommer la cause ; ce banc, lui, nomme la LIGNE et le GABARIT.
 *
 * CE QU IL FAIT. Il repere les gabarits de contenu a leur forme exacte :
 *   - une ligne qui est exactement `const|let|var NOM = ` suivi d un accent grave
 *     (les feuilles de style : CSS, SOCLE_CSS...) ;
 *   - une ligne qui commence par `return ` suivi d un accent grave (la page que
 *     chaque fenetre construit).
 * Il les suit jusqu a la ligne qui les referme et refuse tout accent grave entre
 * les deux. L ancrage reste ETROIT a dessein : une regle large produirait des
 * dizaines de faux positifs, et un controle qui crie au loup finit desactive.
 * MESURE AVANT LIVRAISON (2026-09-08) : 0 faute sur les 94 fenetres saines, et
 * la faute de `journaux.js` reinjectee est attrapee, avec sa ligne.
 *
 * ⚠ UN GABARIT OUVERT ET REFERME SUR LA MEME LIGNE N EN EST PAS UN : le nombre
 * d accents graves y est PAIR, et on passe. Sans ce compte, chaque
 * `return ` + accent grave + `...` + accent grave + `;` d une ligne ouvrait un
 * gabarit imaginaire qui ne se refermait jamais.
 *
 *   node tools/banc-accent-grave.js
 */

const fs = require('fs');
const path = require('path');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');
const AG = String.fromCharCode(96);          // l accent grave, jamais ecrit tel quel ici

/* Ecrits en LITTERAL d expression reguliere, pas en chaine : passer par une
   chaine oblige a doubler chaque antislash, et un niveau se perd toujours en
   route. Ce fichier n est pas un gabarit, les accents graves y sont sans danger. */
const ouvreConst = /^\s*(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*`\s*$/;
const ouvreReturn = /^\s*return\s+`/;
const ferme = /`\s*;?\s*$/;
/* LA SEULE EXCEPTION LEGITIME : une COUPURE DE CONCATENATION, quand un gabarit
   en incorpore un autre par un simple `+`. Sa forme est exacte et reconnaissable
   — accent grave, puis une suite de `+ NOM`, puis accent grave. */
const coupure = /^`(\s*\+\s*[A-Za-z_$][\w$]*)+\s*\+\s*`$/;
const tousLesAG = new RegExp(AG, 'g');

const fichiers = fs.readdirSync(DOSSIER).filter((f) => f.endsWith('.js')).sort();
let nGabarits = 0;
const fautes = [];
const jamaisRefermes = [];

for (const f of fichiers) {
  const lignes = fs.readFileSync(path.join(DOSSIER, f), 'utf8').split('\n');
  let dans = null;
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i].replace(/\r$/, '');
    const n = (l.match(tousLesAG) || []).length;
    if (dans === null) {
      // PAIR = ouvert et referme sur place, ce n est pas un gabarit de contenu.
      if (n % 2 === 1 && (ouvreConst.test(l) || ouvreReturn.test(l))) dans = { debut: i + 1 };
      continue;
    }
    if (coupure.test(l.trim())) continue;
    if (n === 1 && ferme.test(l)) { nGabarits++; dans = null; continue; }
    if (n > 0) {
      fautes.push('  ' + f + ' ligne ' + (i + 1) + '  (gabarit ouvert ligne ' + dans.debut + ')\n'
        + '      ' + l.trim().slice(0, 110));
    }
  }
  if (dans !== null) jamaisRefermes.push('  ' + f + ' : le gabarit ouvert ligne ' + dans.debut + ' ne se referme jamais.');
}

if (jamaisRefermes.length) {
  console.log('ECHEC  ' + jamaisRefermes.length + ' gabarit(s) jamais referme(s) :');
  console.log(jamaisRefermes.join('\n'));
  console.log('  Une ligne se terminant par un accent grave, suivi au plus d un point-virgule, le fermerait.');
  process.exit(1);
}
if (fautes.length) {
  console.log('ECHEC  ' + fautes.length + ' accent(s) grave(s) a l interieur d un gabarit de fenetre :');
  console.log(fautes.join('\n'));
  console.log('');
  console.log('  Le gabarit se referme la, et la suite redevient du code. Ecrire les noms');
  console.log('  de code NUS dans les commentaires qui vivent dans un gabarit — y compris');
  console.log('  les commentaires CSS, qui ne sont PAS des commentaires pour JavaScript.');
  process.exit(1);
}
console.log('OK  ' + nGabarits + ' gabarits dans ' + fichiers.length + ' fenetres, aucun accent grave a l interieur.');
