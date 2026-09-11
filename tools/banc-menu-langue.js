'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   LE MENU DE L'ÉCRAN DE CONNEXION EST-IL TRADUIT EN ENTIER ?
   ═══════════════════════════════════════════════════════════════════════════
   ⚠⚠ SA DEMANDE DU 2026-09-11 : « dans le changement de langue de la page de
   connexion tu dois aussi traduire les menus, c'est important ». Un écran
   anglais surmonté d'un menu français n'est pas un écran traduit.

   ⚠ CE QUI PEUT SE DÉFAIRE TOUT SEUL : la liste des entrées visibles hors
   session vit dans le SITE (`appbar.js`, attribut `libre`), la table de
   traduction vit dans la COQUILLE (`MENU_EN` de `src/main.js`). Deux dépôts.
   Ajouter une entrée libre demain — une ligne dans `appbar.js` — laisse la
   table en arrière SANS AUCUN SIGNAL : l'entrée s'affichera simplement en
   français au milieu de l'anglais.

   ➡ **UNE TABLE DE TRADUCTION QUI N'EST PAS CONFRONTÉE À SA SOURCE SE PÉRIME EN
     SILENCE.** Ce banc relève les entrées libres DANS `appbar.js` et exige que
     chacune ait sa traduction. Rien n'est recopié ici : la source reste la
     source.

   ⚠ IL NE JUGE PAS LA QUALITÉ DE LA TRADUCTION, seulement sa PRÉSENCE. C'est
   une limite, et elle est assumée : un outil ne relit pas un traducteur.

   Lancement :  node tools/banc-menu-langue.js
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const APPBAR = path.join(RACINE, '..', 'sandriza', 'assets', 'js', 'appbar.js');
const MAIN = path.join(RACINE, 'src', 'main.js');

if (!fs.existsSync(APPBAR)) {
  console.log('— `appbar.js` introuvable (dépôt du site absent) : contrôle sauté. '
    + 'Ce passage ne dit RIEN sur la traduction des menus.');
  process.exit(0);
}

/* ── La table de la coquille. ─────────────────────────────────────────────── */
const main = fs.readFileSync(MAIN, 'utf8');
const iT = main.indexOf('const MENU_EN = {');
if (iT < 0) { console.error('✗ `MENU_EN` introuvable dans src/main.js'); process.exit(1); }
const table = main.slice(iT, main.indexOf('\n};', iT));
const traduits = new Set();
{
  const rx = /^\s{2}'((?:[^'\\]|\\.)*)':/gm;
  let m; while ((m = rx.exec(table))) traduits.add(m[1].replace(/\\'/g, "'"));
}
if (traduits.size < 5) {
  console.error('✗ seulement ' + traduits.size + ' entrée(s) lue(s) dans MENU_EN — '
    + 'le motif de lecture ne marche plus, ce banc ne prouverait rien.');
  process.exit(1);
}

/* ── Les entrées LIBRES du site. ─────────────────────────────────────────── */
/* ⚠⚠ LES COMMENTAIRES SONT RETIRÉS AVANT TOUTE LECTURE. Premier jet : le banc a
   refusé une table PARFAITEMENT À JOUR parce qu'un commentaire d'`appbar.js`
   cite la forme `A('…', '…')` pour l'expliquer. Il a relevé « … » comme une
   entrée de menu.
   ➡ **UN RELEVÉ QUI LIT DU CODE DOIT D'ABORD RETIRER CE QUI N'EN EST PAS.** Même
   leçon que la police en base64 qui faisait crier `banc-antislash-fondu` : un
   motif court trouve toujours quelque chose quelque part, et une fausse faute
   coûte la confiance qu'on a dans les vraies. */
const src = fs.readFileSync(APPBAR, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split(String.fromCharCode(10))
  .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
  .join(String.fromCharCode(10));
const libres = new Set();
{
  /* `A('Label', 'app')` pose `libre: true` (voir le helper dans appbar.js). */
  const rx = /\bA\(\s*'((?:[^'\\]|\\.)*)'/g;
  let m; while ((m = rx.exec(src))) libres.add(m[1].replace(/\\'/g, "'"));
  /* Et la forme explicite, sur une même ligne. */
  const rx2 = /label:\s*'((?:[^'\\]|\\.)*)'[^\n]*libre:\s*true/g;
  while ((m = rx2.exec(src))) libres.add(m[1].replace(/\\'/g, "'"));
}
if (libres.size < 5) {
  console.error('✗ seulement ' + libres.size + ' entrée(s) libre(s) relevée(s) dans '
    + 'appbar.js — le motif de lecture ne marche plus.');
  process.exit(1);
}

/* ── Les intitulés des menus qui en contiennent. ─────────────────────────── */
const MENUS = ['Fichier', 'Affichage', 'Aide'];

const fautes = [];
for (const k of [...libres, ...MENUS]) {
  if (!traduits.has(k)) {
    fautes.push('« ' + k + " » paraît à l’écran de connexion (entrée libre) et n’a pas "
      + 'de traduction dans MENU_EN — elle s’affichera en français dans un menu anglais');
  }
}
/* ⚠ ET LE SENS INVERSE : une traduction dont l’entrée a disparu du site est une
   ligne qu’on entretient pour rien, et surtout une fausse impression de
   couverture — on croit le menu tenu à jour parce que la table est grosse. */
for (const k of traduits) {
  if (MENUS.indexOf(k) >= 0) continue;
  if (!libres.has(k)) {
    fautes.push('MENU_EN traduit « ' + k + " » qui n’est plus une entrée libre du site — "
      + 'ligne morte, ou entrée renommée d’un seul côté');
  }
}

if (fautes.length) {
  console.error('✗ la traduction du menu de connexion a ' + fautes.length + ' trou(s) :');
  fautes.forEach((x) => console.error('   — ' + x));
  process.exit(1);
}
console.log('✓ les ' + libres.size + ' entrées libres du site et les ' + MENUS.length
  + ' menus qui les portent ont tous leur traduction.');
