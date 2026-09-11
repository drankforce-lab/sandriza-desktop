'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   LES ANTISLASHS QUI FONDENT EN ROUTE
   ═══════════════════════════════════════════════════════════════════════════
   ⚠⚠ CE PIÈGE A MORDU QUATRE FOIS SUR CE PROJET. Les fenêtres natives sont
   ENGENDRÉES : un script écrit un script. Un `\d` tapé dans une chaîne du
   générateur arrive `d` dans le fichier produit — il faut l'écrire `\\d`. Et
   quand la retouche passe par un document intermédiaire (un « heredoc », un
   fichier de rustine), l'antislash peut fondre une fois de plus.

   ⚠ LE DÉFAUT NE LÈVE RIEN. `/D/g` est une expression PARFAITEMENT VALIDE : elle
   cherche la lettre D majuscule. Le code s'exécute, la fenêtre s'ouvre, tous les
   autres bancs restent verts. Seul le RÉSULTAT est faux, et silencieusement :
     · `wz-code` ne filtrait plus les lettres d'un code à six chiffres ;
     · `wz-copier` annonçait « Clé copiée (sans les espaces) » et copiait la clé
       AVEC ses espaces — que les applications d'authentification refusent. Le
       message disait le contraire de ce qui se passait.

   ⚠ CE QU ON CHERCHE, ET POURQUOI C EST ÉTROIT. Une expression dont le corps
   entier est UNE SEULE LETTRE qui se trouve être une classe de caractères
   (`d s w b n r t` et leurs majuscules), avec un quantificateur facultatif.
   Chercher large ferait crier sur les polices en base64 embarquées dans les
   fenêtres — premier jet, et il a rendu deux fausses fautes dans une chaîne
   `d09GMgAB…`. On n'examine donc que ce qui suit un `.replace(`, `.test(`,
   `.match(`, `.exec(`, `.split(` ou `.search(` : du code, jamais des données.

   ⚠ UNE VRAIE RECHERCHE DE LA LETTRE « D » EST POSSIBLE — et elle sera refusée
   ici. C'est voulu : elle est assez rare pour mériter d'être écrite autrement
   (`[D]`, qui dit explicitement « la lettre »), et assez proche du défaut pour
   qu'on ne puisse pas les distinguer autrement.

   Lancement :  node tools/banc-antislash-fondu.js
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..', 'src');
const CLASSES = 'dDsSwWbBnrtvf0';

const fichiers = [];
const arpenter = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) arpenter(p);
    else if (e.name.endsWith('.js')) fichiers.push(p);
  }
};
arpenter(RACINE);

/* Un appel de méthode d'expression régulière, puis une expression dont le corps
   n'est qu'une lettre (plus un quantificateur facultatif). */
const RX = /\.(replace|test|match|exec|split|search|matchAll)\(\s*\/([A-Za-z])([+*?]?)\/([gimsuy]*)/g;

const fautes = [];
for (const f of fichiers) {
  const src = fs.readFileSync(f, 'utf8');
  const lignes = src.split('\n');
  let m;
  RX.lastIndex = 0;
  while ((m = RX.exec(src))) {
    if (CLASSES.indexOf(m[2]) < 0) continue;
    const no = src.slice(0, m.index).split('\n').length;
    fautes.push({
      f: path.relative(path.join(__dirname, '..'), f),
      no,
      vu: '/' + m[2] + m[3] + '/' + m[4],
      voulu: '/\\' + m[2] + m[3] + '/' + m[4],
      ligne: String(lignes[no - 1] || '').trim().slice(0, 110),
    });
  }
}

if (fautes.length) {
  console.error('✗ ' + fautes.length + ' antislash fondu(s) — l’expression est valide, '
    + 'mais elle ne cherche plus ce qu’elle croit chercher :');
  for (const x of fautes) {
    console.error('   — ' + x.f + ':' + x.no + '  ' + x.vu + '  au lieu de  ' + x.voulu);
    console.error('       ' + x.ligne);
  }
  console.error('   ⚠ Si le générateur est en cause, c’est `\\\\' + 'd` qu’il faut y écrire, '
    + 'ou `String.fromCharCode(92)`.');
  process.exit(1);
}
console.log('✓ aucun antislash fondu dans ' + fichiers.length + ' fichier(s) de src/.');
