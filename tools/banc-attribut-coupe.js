#!/usr/bin/env node
'use strict';

/*
 * L ATTRIBUT COUPE PAR UNE CONCATENATION
 * =============================================================================
 * ⚠⚠⚠ SA CAPTURE DU 2026-09-13, FENETRE « ORDERS ». Tout est anglais — le titre,
 * les colonnes, les jetons de statut, le bouton — et le champ de recherche dit
 * « Numéro de commande, nom, courriel… ». Un seul texte francais, en plein
 * milieu, dans le premier endroit ou l oeil se pose.
 *
 * ⚠⚠ LE RELEVE DES ATTRIBUTS EXIGE LES DEUX GUILLEMETS SUR LA MEME LIGNE.
 * `textes-visibles.js` cherche  placeholder\s*=\s*"([^"<>]+)"  — une expression
 * qui ne peut pas franchir une concatenation. Or la source ecrit :
 *
 *     + '<input … placeholder="Numéro de commande, nom, courriel'
 *     + (expedition ? T(", numéro de suivi") : '') + '…" value="' + …
 *
 * L attribut OUVRE sur une ligne et FERME deux lignes plus bas. Entre les deux,
 * la valeur est fabriquee. Le releve ne voit donc aucun attribut du tout : ni
 * complet, ni incomplet. Il ne voit RIEN, et un rien ne se signale pas.
 *
 * ➡ SEPTIEME FOIS QUE LE DEFAUT EST HORS DU TERRAIN BALAYE. Et cette fois la
 *   forme est perverse : la moitie de la valeur (`, numéro de suivi`) EST
 *   traduite, juste a cote. Quelqu un a bien vu cette ligne, a traduit ce qui
 *   se lisait comme du texte, et a laisse ce qui se lisait comme un attribut.
 *
 * ══ CE QU IL FAIT ══════════════════════════════════════════════════════════
 * Pour chaque ouverture d attribut lisible (placeholder, title, aria-label,
 * alt), il suit la valeur JUSQU A SON GUILLEMET FERMANT, en traversant les
 * concatenations, et relit chaque MORCEAU DE CHAINE rencontre en chemin.
 * Un morceau qui porte du francais et qui n est pas enveloppe est une faute.
 *
 * ⚠ IL NE REGARDE QUE LES VALEURS COUPEES. Celles qui tiennent sur une ligne
 *   sont deja vues par les bancs existants ; les redire ferait deux voix pour
 *   une meme faute, et l on finirait par n en ecouter aucune.
 *
 * ⚠ LE FRANCAIS SE RECONNAIT A L ACCENT OU AU LEXIQUE deduit des dictionnaires
 *   (les mots des CLES moins ceux des VALEURS). Le code est ecarte a sa forme :
 *   un appel de fonction ou un acces de propriete n est pas du texte.
 *
 *   node tools/banc-attribut-coupe.js            toutes les fenetres
 *   node tools/banc-attribut-coupe.js <fenetre>  une seule
 */

const fs = require('fs');
const path = require('path');

const DOS = path.join(__dirname, '..', 'src', 'fenetres');
const DICOS = path.join(__dirname, '..', 'src', 'langue');

/* ⚠ `connexion` porte son dictionnaire DANS la page et bascule sans se
   recharger : ses textes ne passent pas par T() a la generation. */
const EXEMPTE = new Set(['connexion']);

const ATTRS = 'placeholder|title|aria-label|alt';

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

/* ⚠ CE QUI RESSEMBLE A DU CODE N EST PAS DU TEXTE. Un appel de fonction
   (`esc(`), un acces de propriete (`x.jour`), un signe de concatenation : la
   forme suffit a trancher, sans rien savoir du JavaScript. */
const estDuCode = (s) =>
  /[A-Za-z_$][\w$]*\(/.test(s) || /[A-Za-z_$][\w$]*\s*\.\s*[A-Za-z_$]/.test(s)
  || s.indexOf('+') >= 0 || s.indexOf('${') >= 0;
/* ⚠ PAS D ESPACE AVANT LA PARENTHESE, ET C EST TOUTE LA DIFFERENCE.
   `esc(` est un appel ; « Sous le seuil d alerte ( » est une phrase qui ouvre
   une parenthese. Tolerer l espace faisait passer la seconde pour du code —
   et ce titre-la, qui explique POURQUOI un stock est signale, serait reste
   francais sans que rien ne le dise. */

/* La fin du litteral JavaScript ouvert au caractere `i` (guillemet simple),
   en respectant l echappement. */
const finLitteral = (src, i) => {
  for (let j = i; j < src.length; j++) {
    if (src[j] === '\\') { j++; continue; }
    if (src[j] === "'") return j;
    if (src[j] === '\n') return -1;
  }
  return -1;
};

const relire = (nom, LEX) => {
  const src = fs.readFileSync(path.join(DOS, nom + '.js'), 'utf8');
  const re = new RegExp('\\b(' + ATTRS + ')\\s*=\\s*"', 'g');
  const restes = [];
  let m;
  while ((m = re.exec(src))) {
    const debut = m.index + m[0].length;
    const ferme = src.indexOf('"', debut);
    if (ferme < 0) continue;
    const span = src.slice(debut, ferme);
    /* ⚠ SEULES LES VALEURS COUPEES. Une valeur d un seul tenant est deja vue
       par les bancs existants. */
    if (span.indexOf('\n') < 0) continue;

    /* Les morceaux de texte : d abord la tete (de l ouverture jusqu a la fin du
       litteral courant), puis chaque litteral simple rencontre ensuite. */
    const morceaux = [];
    const finTete = finLitteral(src, debut);
    if (finTete > debut && finTete < ferme) morceaux.push(src.slice(debut, finTete));
    let k = (finTete > 0 ? finTete + 1 : debut);
    while (k < ferme) {
      const ouvre = src.indexOf("'", k);
      if (ouvre < 0 || ouvre >= ferme) break;
      const fin = finLitteral(src, ouvre + 1);
      if (fin < 0 || fin > ferme) break;
      morceaux.push(src.slice(ouvre + 1, fin));
      k = fin + 1;
    }

    const ligne = src.slice(0, m.index).split('\n').length;
    for (const brut of morceaux) {
      const t = brut.trim();
      if (!t || estDuCode(t)) continue;
      if (!/[À-ÿ]/.test(t) && !motsDe(t).some((w) => LEX.has(w))) continue;
      restes.push({ ligne, attr: m[1], texte: t });
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

console.log('\n== UN ATTRIBUT COUPE EN DEUX EST-IL TRADUIT ? ==');
console.log('  ' + noms.length + ' fenetre(s) relue(s)');

const sales = [];
for (const n of noms) {
  const r = relire(n, LEX);
  if (r.length) sales.push({ nom: n, restes: r });
}

if (!sales.length) {
  console.log('\n>>> aucune valeur d attribut coupee ne reste en francais\n');
  process.exit(0);
}

const total = sales.reduce((s, x) => s + x.restes.length, 0);
console.log('\nECHEC  ' + total + ' morceau(x) francais dans une valeur d attribut');
console.log('       COUPEE par une concatenation, dans ' + sales.length + ' fenetre(s) :\n');
for (const x of sales) {
  console.log('  ' + x.nom + '.js');
  for (const r of x.restes) {
    console.log('      ' + String(r.ligne).padStart(5) + '  ' + r.attr + '="…' + r.texte + '…"');
  }
}
console.log('\n⚠ L ATTRIBUT OUVRE SUR UNE LIGNE ET FERME PLUS BAS : aucun releve qui');
console.log('  exige les deux guillemets ensemble ne peut le voir. Enveloppez chaque');
console.log('  morceau :  placeholder="${T("Numéro de commande, nom, courriel")}"');
process.exit(1);
