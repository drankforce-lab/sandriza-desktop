#!/usr/bin/env node
'use strict';

/*
 * LA COUTURE DU CADRE NE DOIT PAS SE DEFAIRE
 * =============================================================================
 * ⚠⚠ CE QUE CE BANC GARDE, ET POURQUOI IL EXISTE.
 * La fenetre principale joue AUJOURD HUI deux roles a la fois :
 *   · LE SITE  — la page qui heberge le pont (429 coeurs), interrogee par
 *     executeJavaScript et destinataire des messages des modules ;
 *   · LE CADRE — la page qui dessine la zone ou les ecrans natifs s ANCRENT,
 *     destinataire des messages dock:*.
 * La tranche suivante fait passer le site dans une vue CACHEE. Ce jour-la,
 * `siteWC()` rendra cette vue et `cadreWC()` la fenetre principale — et tout
 * appel reste JUSTE, parce qu il a deja choisi son role.
 *
 * ⚠⚠ TOUT APPEL ECRIT EN DEHORS DE LA COUTURE SERA FAUX APRES LA BASCULE, ET
 * PERSONNE NE LE VERRA. `send('dock:ancree')` et `send('usb:photos')` s ecrivent
 * exactement pareil ; apres la bascule ils ne parlent plus a la meme page. Un
 * tri fait APRES coup se fait a l oeil, sur des lignes qui se ressemblent
 * toutes — c est precisement ce qu on vient d eviter en le faisant a froid.
 *
 * ⚠ CE N EST PAS UN COMPTEUR DE DETTE, C EST UNE REGLE. Les autres usages de
 * `mainWindow.webContents` (zoom, theme, gardes de navigation, chargement) sont
 * LEGITIMES et le restent : ce sont des affaires de FENETRE VISIBLE, et apres
 * la bascule la fenetre visible EST le cadre. On ne les compte donc pas — un
 * plafond qui ne peut pas atteindre zero finit par se lire comme
 * << c est normal qu il en reste >>.
 *
 *   node tools/banc-couture-cadre.js
 */

const fs = require('fs');
const path = require('path');

const FICHIER = path.join(__dirname, '..', 'src', 'main.js');
let src;
try { src = fs.readFileSync(FICHIER, 'utf8'); }
catch (e) {
  console.log('ECHEC  src/main.js illisible (' + e.message + ') — un banc qui ne lit rien');
  console.log('       ne doit pas repondre << tout va bien >>.');
  process.exit(1);
}

/* On retire les COMMENTAIRES avant de chercher : cette fiche-ci, comme celle de
   main.js, NOMME les motifs interdits pour expliquer pourquoi ils le sont. Les
   compter ferait accuser la documentation qui garde la regle.
   ⚠ C est exactement la faute que j ai faite DEUX FOIS le 2026-09-12 en ecrivant
   des assertions de suppression : elles cherchaient le nom nu, et le trouvaient
   dans le commentaire qui explique le retrait. */
const nu = src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));

const REGLES = [
  {
    motif: /mainWindow\.webContents\.executeJavaScript/g,
    quoi: "executeJavaScript sur mainWindow.webContents",
    pourquoi: 'executer du code dans la page, c est parler au SITE',
    faire: 'passer par siteWC()',
  },
  {
    motif: /mainWindow\.webContents\.send\(\s*['"]dock:/g,
    quoi: "send('dock:...') sur mainWindow.webContents",
    pourquoi: 'les messages d ancrage vont a la page qui dessine le CADRE',
    faire: 'passer par cadreWC()',
  },
];

let mal = 0;
console.log('');
for (const r of REGLES) {
  const n = (nu.match(r.motif) || []).length;
  if (!n) { console.log('  OK   aucun ' + r.quoi); continue; }
  mal += n;
  console.log('  NON  ' + n + ' fois : ' + r.quoi);
  console.log('       ' + r.pourquoi + ' — ' + r.faire);
  /* On NOMME la ligne : un banc qui dit << il en reste 3 >> sans dire lesquelles
     oblige a refaire sa recherche a la main. */
  nu.split('\n').forEach((l, i) => {
    r.motif.lastIndex = 0;
    if (r.motif.test(l)) console.log('       ligne ' + (i + 1) + ' : ' + src.split('\n')[i].trim().slice(0, 90));
  });
}

/* ⚠ ET LES DEUX ACCESSEURS DOIVENT EXISTER. Sans ce controle, les supprimer
   rendrait ce banc VERT — plus aucun motif interdit, et plus aucune couture
   non plus. Un banc qui devient vert quand on retire ce qu il garde est pire
   qu absent : il rassure. */
for (const nom of ['siteWC', 'cadreWC']) {
  if (nu.indexOf('const ' + nom + ' = ') < 0) {
    mal++;
    console.log('  NON  l accesseur ' + nom + ' a disparu de src/main.js — la couture est defaite');
  }
}

console.log('');
if (mal) {
  console.log('>>> ' + mal + ' probleme(s) — la couture du cadre se defait');
  process.exit(1);
}
console.log('>>> la couture tient : chaque appel a choisi son role (SITE ou CADRE)');
