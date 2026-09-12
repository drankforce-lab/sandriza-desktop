#!/usr/bin/env node
'use strict';

/*
 * UNE ENVELOPPE POSEE SUR DU CODE — le defaut que les deux langues cachent
 * =============================================================================
 * ⚠⚠⚠ CE QUE CE BANC ATTRAPE, ET POURQUOI RIEN D AUTRE NE LE PEUT. En
 * enveloppant les textes d une fenetre, `${T("…")}` peut se poser non pas sur
 * une PHRASE mais sur un morceau de CODE :
 *
 *     var auj = new ${T("Date")}().toISOString()     <- trouve le 2026-09-12
 *
 * Tant que la traduction rend le meme mot (« Date » -> « Date »), la page
 * francaise et la page anglaise sont TOUTES LES DEUX justes. Donc :
 *   · la comparaison octet pour octet du poseur passe (le francais n a pas bouge) ;
 *   · `node --check` passe (c est du JavaScript correct) ;
 *   · le compteur passe (le texte a une decision) ;
 *   · un coup d oeil a la page anglaise passe (elle s affiche).
 * QUATRE gardes verts sur une faute reelle. Elle n attend qu une chose : que
 * quelqu un traduise ce mot autrement. Ce jour-la la fonction s appelle
 * `new Date()` en francais et `new Datum()` en anglais, et la fenetre meurt
 * DANS UNE SEULE LANGUE — celle que personne ne relit.
 *
 * ⚠ CE N EST PAS UNE CRAINTE, C EST UN RELEVE : au moment d ecrire ce banc,
 * DEUX fenetres declarees TERMINEES le portaient deja (`depenses`, ligne 820 ;
 * `ramassages`, ligne 140). Neuf fenetres avaient ete relues a la main.
 *
 * ══ LES QUATRE SIGNATURES, ET CE QU ELLES VALENT ════════════════════════════
 *   1. SUIVI D UNE PARENTHESE  `${T("Date")}(…)`   — on l appelle ou on le
 *      construit : un nom, jamais une phrase.
 *   2. PRECEDE D UN MOT-CLE    `new ${T("Date")}`  — `new`, `typeof`,
 *      `instanceof`, `void`, `delete` attendent une EXPRESSION.
 *   3. SUIVI D UN POINT        `${T("Date")}.now()` — un acces de membre.
 *   4. COLLE A UN IDENTIFIANT  `szBrouillon${T("Jeter")}` — un morceau de nom.
 * Les 3 et 4 sont deja refusees par le poseur ; on les mesure quand meme, parce
 * qu un garde qui vit dans l outil ne couvre que ce que l outil a ecrit — une
 * enveloppe posee A LA MAIN ne passe par aucun outil.
 *
 * ⚠ CE QU IL NE VOIT PAS, ecrit ici plutot que decouvert : une enveloppe posee
 * sur du code a travers une VARIABLE (`var n = `${T("Date")}`; new n()`). La
 * forme directe est la seule qu on ecrit sans y penser.
 *
 *   node tools/banc-langue-sur-code.js
 */

const fs = require('fs');
const path = require('path');

const DOS = path.join(__dirname, '..', 'src', 'fenetres');

/* ⚠ LES COMMENTAIRES D ABORD RETIRES — et cette fiche-ci le prouve : elle CITE
   `new ${T("Date")}()` pour l expliquer. Un banc qui s accuse lui-meme sur sa
   propre explication apprend a mentir a celui qui le lit. On remplace par des
   espaces pour que les numeros de ligne ne bougent pas d un caractere. */
const sansCommentaires = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/[^\n]/g, ' '));

/* La forme enveloppee, decrite EN ENTIER — guillemets simples ou doubles,
   echappements compris. La decrire « jusqu au premier ) » ferait manquer
   `${T("Poids (kg)")}`, et donc le caractere qui suit VRAIMENT l enveloppe. */
const ENVELOPPE = /\$\{T\((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\)\}/g;

const IDENT = /[A-Za-z0-9_$]/;
const MOT_CLE = /(?:^|[^A-Za-z0-9_$])(?:new|typeof|instanceof|void|delete)\s+$/;

const fautes = [];
let fenetres = 0, enveloppes = 0;

for (const f of fs.readdirSync(DOS).filter((x) => x.endsWith('.js')).sort()) {
  const brut = fs.readFileSync(path.join(DOS, f), 'utf8');
  const s = sansCommentaires(brut);
  fenetres++;

  /* ⚠⚠ LES BORNES DE TOUTES LES ENVELOPPES D ABORD, et ce n est pas du zele :
     ma premiere version accusait `${T("…dans ")}${T("Montant")}` — deux phrases
     VOISINES, la seconde ouvrant sur `$`, que la regle « colle a un identifiant »
     prend pour un nom de variable. Une faute inventee sur du travail juste, et
     c est le genre d accusation qui fait cesser de lire un banc.
     ⚠ Un voisin qui est lui-meme une enveloppe n est pas du code : c est la
     phrase d a cote. */
  const bornes = [];
  ENVELOPPE.lastIndex = 0;
  for (let b; (b = ENVELOPPE.exec(s)); ) bornes.push([b.index, b.index + b[0].length]);
  const debuteUneEnveloppe = (k) => bornes.some(([a]) => a === k);
  const termineUneEnveloppe = (k) => bornes.some(([, z]) => z === k);

  let m;
  ENVELOPPE.lastIndex = 0;
  while ((m = ENVELOPPE.exec(s))) {
    enveloppes++;
    const i = m.index;
    const fin = i + m[0].length;
    if (debuteUneEnveloppe(fin) || termineUneEnveloppe(i)) continue;
    const avant = i > 0 ? s[i - 1] : ' ';
    const apres = s[fin] || ' ';
    let raison = '';
    if (apres === '(') raison = 'suivie d une parenthese — on l appelle ou on la construit';
    else if (MOT_CLE.test(s.slice(Math.max(0, i - 12), i))) raison = 'precedee d un mot-cle qui attend une expression';
    else if (apres === '.') raison = 'suivie d un point — c est un acces de membre';
    else if (IDENT.test(avant) || IDENT.test(apres)) raison = 'collee a un identifiant — c est un morceau de nom';
    if (!raison) continue;
    const ligne = s.slice(0, i).split('\n').length;
    const texte = brut.split('\n')[ligne - 1] || '';
    fautes.push({ f, ligne, raison, texte: texte.trim().slice(0, 110) });
  }
}

console.log('');
console.log('== UNE ENVELOPPE POSEE SUR DU CODE ==');
console.log('  ' + fenetres + ' fenetre(s) lue(s) · ' + enveloppes + ' enveloppe(s) ${T(…)} examinee(s)');
console.log('');

/* ⚠ UN BANC QUI NE LIT RIEN NE DOIT PAS SE TAIRE. Si les fenetres cessaient
   d etre enveloppees, le compte tomberait a zero et se lirait comme une
   victoire — alors qu il ne resterait plus rien a garder. */
if (fenetres < 5) {
  console.log('  NON  ' + fenetres + ' fenetre(s) seulement — le banc ne voit plus rien.');
  process.exit(1);
}

if (!fautes.length) {
  console.log('>>> aucune enveloppe posee sur du code');
  process.exit(0);
}

for (const x of fautes) {
  console.log('  NON  src/fenetres/' + x.f + ':' + x.ligne + ' — ' + x.raison);
  console.log('       ' + x.texte);
}
console.log('');
console.log('>>> ' + fautes.length + ' enveloppe(s) posee(s) sur du CODE — refus.');
console.log('    Retirer le ${T(…)} : ce morceau est du code, il ne se lit pas a l ecran.');
process.exit(1);
