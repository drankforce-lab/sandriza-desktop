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

/* ── La table, LUE EN LA CHARGEANT (2026-09-11) ───────────────────────────────
   ⚠ Elle était relevée à coups d'expression régulière dans `main.js`. Ça marchait,
   et ça ne prouvait rien de plus que sa PRÉSENCE : on ne pouvait pas éprouver la
   fonction qui s'en sert. Sortie dans `src/menu-langue.js`, on la charge — et on
   peut enfin vérifier qu'elle est APPLIQUÉE, pas seulement remplie. C'est ce qui
   manquait quand le menu est sorti à moitié traduit. */
const { MENU_EN, trItems } = require('../src/menu-langue');
const traduits = new Set(Object.keys(MENU_EN));
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

/* ══ ET SURTOUT : LA TRADUCTION EST-ELLE APPLIQUÉE ? ════════════════════════
   ⚠⚠ C'EST LE CONTRÔLE QUI MANQUAIT, ET SON ABSENCE A COÛTÉ UNE VERSION. La
   table était complète, le banc était vert, et le menu sortait à moitié
   traduit : « View », « Help », puis dessous « Recharger », « Plein écran »,
   « Réduire ». `trItems` descendait dans les sous-groupes (`sub`) et sautait les
   ENTRÉES (`items`), qui sont pourtant le cas courant.
   ➡ **VÉRIFIER QU'UNE TABLE EST COMPLÈTE NE DIT RIEN SUR LE CODE QUI S'EN SERT.**
   Deux questions différentes, deux contrôles.
   ⚠ Le modèle ci-dessous a TROIS niveaux À DESSEIN — menu, entrée, sous-groupe —
   parce qu'un parcours d'arbre qui ne suit qu'une branche sur deux passe le
   premier niveau sans broncher. */
{
  const modele = [{
    label: 'Affichage',
    items: [
      { label: 'Recharger', app: 'reload' },
      { sep: true },
      { label: 'Plein écran', app: 'fullscreen' },
      { label: 'Aide', sub: [{ label: 'À propos', app: 'about' }] },
    ],
  }];
  const sortie = trItems(modele, 'en');
  const restes = [];
  const arpenter = (l, chemin) => (l || []).forEach((it) => {
    if (!it || it.sep) return;
    if (Object.prototype.hasOwnProperty.call(MENU_EN, it.label)) {
      restes.push(chemin + ' > ' + it.label);
    }
    arpenter(it.items, chemin + ' > ' + it.label);
    arpenter(it.sub, chemin + ' > ' + it.label);
  });
  arpenter(sortie, '(racine)');
  restes.forEach((x) => fautes.push('trItems() laisse « ' + x + " » en français alors que "
    + 'la table le connaît — un niveau de l’arbre n’est pas parcouru'));

  /* ⚠ ET LE SENS INVERSE, sinon un `trItems` qui rendrait n'importe quoi (une
     liste vide, par exemple) passerait ce contrôle sans rien traduire du tout. */
  const compte = (l) => (l || []).reduce((n, it) =>
    n + (it && !it.sep ? 1 + compte(it.items) + compte(it.sub) : 0), 0);
  if (compte(sortie) !== compte(modele)) {
    fautes.push('trItems() rend ' + compte(sortie) + ' entrée(s) pour ' + compte(modele)
      + ' — il en perd en route, et un menu amputé vaut un menu faux');
  }
  /* Et en français, rien ne doit bouger. */
  if (JSON.stringify(trItems(modele, 'fr')) !== JSON.stringify(modele)) {
    fautes.push('trItems(…, "fr") MODIFIE le modèle — le français doit être le passe-droit');
  }
}

if (fautes.length) {
  console.error('✗ la traduction du menu de connexion a ' + fautes.length + ' trou(s) :');
  fautes.forEach((x) => console.error('   — ' + x));
  process.exit(1);
}
console.log('✓ les ' + libres.size + ' entrées libres du site et les ' + MENUS.length
  + ' menus qui les portent ont tous leur traduction.');
