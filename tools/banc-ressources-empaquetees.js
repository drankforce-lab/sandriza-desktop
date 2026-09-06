'use strict';

/*
 * BANC DES RESSOURCES EMPAQUETÉES
 * =============================================================================
 *   node tools/banc-ressources-empaquetees.js
 *
 * ⚠⚠ CE BANC EXISTE À CAUSE D'UN CARRÉ NOIR DANS LA ZONE DE NOTIFICATION.
 * Signalé le 2026-09-06, capture à l'appui : « il n'y a pas d'icône pour le
 * veilleur ». La cause n'était pas l'icône — elle était parfaite — mais son
 * CHEMIN : `build/icon.png`, alors qu'`electron-builder.yml` n'empaquette que le
 * contenu de `src` et `package.json`. `build` est un dossier de RESSOURCES DE
 * CONSTRUCTION : il sert à fabriquer l'icône de l'application, il n'entre jamais
 * dans l'archive.
 *
 * ══ POURQUOI ÇA NE POUVAIT PAS SE VOIR AVANT L'INSTALLATION ═════════════════
 * En développement, on lance depuis le dépôt : `build/icon.png` est là, tout
 * marche. Le défaut n'apparaît QUE dans l'application installée — c'est-à-dire
 * chez lui, après une publication complète. Le cycle pour le découvrir coûte un
 * build, une publication, une installation et un signalement.
 *
 * ══⚠ ET IL EST MUET, CE QUI EST LE PIRE ════════════════════════════════════
 * `nativeImage.createFromPath('chemin/absent')` NE LÈVE PAS : il rend une image
 * VIDE. Et `new Tray(imageVide)` l'accepte sans broncher. Aucune erreur, aucun
 * journal — juste un carré noir qu'on prend pour un problème de thème.
 * C'est la même famille que `catch {}` vide : l'échec a l'air d'une réussite.
 *
 * ══ CE QUE LE BANC VÉRIFIE ══════════════════════════════════════════════════
 * Tout chemin de fichier construit dans `src/` avec `path.join(__dirname, …)`
 * doit désigner un fichier qui EXISTE **et** qui vit sous `src/`. Un chemin qui
 * remonte hors de `src` (`'..'`) est refusé, même s'il existe sur ce poste —
 * c'est exactement le cas qui marche en développement et casse à l'installation.
 *
 * ⚠ EXCEPTION DÉCLARÉE, ET UNE SEULE FORME : un repli de développement est
 * légitime s'il est SECOND dans une liste dont le premier élément, lui, est sous
 * `src/`. C'est le montage de l'icône du veilleur. On exige donc qu'au moins un
 * candidat soit empaqueté — pas qu'il n'y ait aucun repli.
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SRC = path.join(RACINE, 'src');

let fautes = 0;
const dire = (ok, quoi, detail) => {
  console.log('  ' + (ok ? 'OK  ' : 'NON ') + quoi.padEnd(30) + (detail || ''));
  if (!ok) fautes++;
};

/** Tous les fichiers .js sous src/, en profondeur. */
const fichiers = [];
(function balayer(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) balayer(p);
    else if (e.name.endsWith('.js')) fichiers.push(p);
  }
})(SRC);

/* On cherche les `path.join(__dirname, 'a', 'b')` dont tous les morceaux sont
   des chaînes littérales : ceux-là désignent un fichier précis, connu à
   l'avance, donc vérifiable. Un chemin calculé à l'exécution n'est pas de notre
   ressort — et il n'y en a pas dans ce dépôt. */
const RE = /path\.join\(\s*__dirname\s*((?:,\s*'[^']*'\s*)+)\)/g;

let controles = 0;
const manquants = [];
const horsPaquet = [];

for (const f of fichiers) {
  const src = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = RE.exec(src)) !== null) {
    const bouts = (m[1].match(/'([^']*)'/g) || []).map((s) => s.slice(1, -1));
    if (!bouts.length) continue;
    const abs = path.resolve(path.dirname(f), ...bouts);
    const rel = path.relative(RACINE, abs).replace(/\\/g, '/');

    // Un DOSSIER de données (userData…) n'est pas une ressource : on ne juge que
    // ce qui porte une extension de fichier.
    if (!/\.[a-z0-9]{2,5}$/i.test(rel)) continue;
    controles++;

    const sousSrc = !path.relative(SRC, abs).startsWith('..');
    if (!sousSrc) horsPaquet.push({ ou: path.relative(RACINE, f).replace(/\\/g, '/'), quoi: rel });
    else if (!fs.existsSync(abs)) manquants.push({ ou: path.relative(RACINE, f).replace(/\\/g, '/'), quoi: rel });
  }
}

console.log('\n── Ressources citées par src/ ───────────────────────────────');
console.log('  ' + controles + ' chemin(s) littéral(aux) examiné(s) dans ' + fichiers.length + ' fichier(s)\n');

dire(manquants.length === 0, 'toutes existent',
  manquants.length ? manquants.map((x) => x.quoi + ' (cité par ' + x.ou + ')').join(' · ') : '');

/* ⚠ Les chemins hors `src` ne sont fautifs QUE si le fichier qui les cite n'a
   aucun candidat empaqueté. `veilleur.js` cite les deux : le premier sous `src`,
   le second en repli de développement. C'est légitime, et le banc doit savoir le
   distinguer — sans quoi il interdirait le repli, et quelqu'un le retirerait. */
const parFichier = {};
for (const x of horsPaquet) (parFichier[x.ou] = parFichier[x.ou] || []).push(x.quoi);
const sansRepli = Object.keys(parFichier).filter((f) => {
  const src = fs.readFileSync(path.join(RACINE, f), 'utf8');
  // Une ressource du même type est-elle AUSSI cherchée sous src/ dans ce fichier ?
  return !parFichier[f].some((q) => {
    const ext = path.extname(q);
    return new RegExp("path\\.join\\(\\s*__dirname\\s*,\\s*'[^']*\\" + ext + "'").test(src)
        || new RegExp("path\\.join\\(\\s*__dirname\\s*,\\s*'[^']*'\\s*,\\s*'[^']*\\" + ext + "'").test(src);
  });
});

dire(sansRepli.length === 0, 'aucune ne vit hors de src/',
  sansRepli.length
    ? sansRepli.map((f) => f + ' → ' + parFichier[f].join(', ') + ' (absent de l’application installée)').join(' · ')
    : (horsPaquet.length ? horsPaquet.length + ' repli(s) de développement, chacun doublé d’un chemin empaqueté' : ''));

console.log('\n' + (fautes ? '✗ ' + fautes + ' point(s) à corriger' : '✓ tout ce que src/ cite sera dans l’application') + '\n');
process.exitCode = fautes ? 1 : 0;
