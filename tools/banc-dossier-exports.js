#!/usr/bin/env node
'use strict';

/*
 * BANC D'ESSAI — LE DOSSIER DES EXPORTS ET SON REPLI
 * =============================================================================
 * Ce qu'on éprouve n'est PAS « le chemin est-il le bon ». C'est la seule chose
 * qui puisse mal tourner sans bruit :
 *
 *   UN DOSSIER CHOISI QUI NE RÉPOND PLUS DOIT LAISSER L'EXPORT RÉUSSIR.
 *
 * Clé USB retirée, lecteur réseau déconnecté, dossier renommé : si le repli
 * manque, l'export échoue et le message parle d'ÉCRITURE — on cherche alors la
 * panne dans l'export, pas dans le dossier. Et si le repli va trop loin (remise
 * à zéro du réglage), on OUBLIE sa décision parce qu'une clé était débranchée
 * une fois : au rebranchement, les fichiers repartent au mauvais endroit et
 * personne ne comprend pourquoi.
 *
 * ⚠ CE BANC N'A PAS DE TÉMOIN À AFFICHER, IL EN A UN À PROVOQUER. Un banc qui
 * n'affirme que des choses vraies est un banc muet : la dernière section CASSE
 * volontairement la règle et exige que le banc s'en aperçoive. Sans elle, un
 * `info()` qui rendrait toujours `{ repli:false }` passerait au vert.
 *
 *     node tools/banc-dossier-exports.js
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const D = require('../src/dossier-exports');

let fautes = 0;
const dit = (ok, s) => { if (!ok) fautes++; console.log((ok ? 'OK   ' : 'ÉCHEC ') + s); };
const eq = (a, b, s) => dit(a === b, s + '  (attendu ' + JSON.stringify(b) + ', obtenu ' + JSON.stringify(a) + ')');

// ── Un terrain réel : on écrit pour de vrai, on ne simule pas le disque ──────
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-dexp-'));
const DEFAUT = path.join(base, 'Documents', 'SANDRIZA', 'Exports');
const CHOISI = path.join(base, 'Comptabilite');
// ⚠ Un chemin qui NE PEUT PAS être créé, et c'est le scénario réel : la lettre
// de lecteur d'une clé retirée. Pas un dossier qu'on supprime après coup — on
// veut que `mkdirSync` échoue, comme il échoue quand la clé n'est plus là.
const DISPARU = process.platform === 'win32'
  ? 'Z:\\SANDRIZA\\Exports\\banc'
  : '/proc/banc-impossible/exports';

console.log('— Sans aucun choix : le dossier standard, et AUCUN repli à annoncer');
{
  const i = D.info(DEFAUT, '');
  eq(i.dir, DEFAUT, 'dir = le dossier standard');
  eq(i.choisi, '', 'choisi reste vide');
  eq(i.repli, false, 'repli FAUX — sinon un bandeau jaune permanent à qui n a rien reglé');
  dit(fs.existsSync(DEFAUT), 'le dossier standard a été créé au passage');
}

console.log('— `null` et `undefined` valent « pas de choix », pas un chemin vide');
{
  eq(D.info(DEFAUT, null).repli, false, 'null : aucun repli');
  eq(D.info(DEFAUT, undefined).dir, DEFAUT, 'undefined : dossier standard');
  eq(D.info(DEFAUT, null).choisi, '', 'null se lit comme une chaîne vide');
}

console.log('— Un choix qui répond : c est lui qui sert');
{
  const i = D.info(DEFAUT, CHOISI);
  eq(i.dir, CHOISI, 'dir = le dossier choisi');
  eq(i.repli, false, 'aucun repli');
  eq(i.defaut, DEFAUT, 'le standard reste nommé, pour pouvoir y revenir');
  dit(fs.existsSync(CHOISI), 'le dossier choisi a été créé s il manquait');
}

console.log('— ⚠ LE CAS QUI COMPTE : le choix ne répond plus');
{
  const i = D.info(DEFAUT, DISPARU);
  eq(i.dir, DEFAUT, 'on retombe sur le dossier standard');
  eq(i.repli, true, 'le repli est ANNONCÉ — sans ça, la fenêtre se tait');
  eq(i.choisi, DISPARU, '⚠ LE CHOIX EST GARDÉ : on n oublie pas sa décision');
  // Et l'écriture doit RÉUSSIR : c'est la promesse entière du repli.
  const f = path.join(i.dir, 'banc-repli.csv');
  let ecrit = false;
  try { fs.writeFileSync(f, 'sku;prix\n', 'utf8'); ecrit = fs.existsSync(f); } catch { /* reste faux */ }
  dit(ecrit, '⚠⚠ L EXPORT RÉUSSIT QUAND MÊME — la raison d être du repli');
  try { fs.unlinkSync(f); } catch { /* peu importe */ }
}

console.log('— Le dossier revient : le choix redevient effectif tout seul');
{
  // Le même appel qu au cas précédent, mais avec un chemin qui répond de nouveau.
  const i = D.info(DEFAUT, CHOISI);
  eq(i.dir, CHOISI, 'dir repasse sur le dossier choisi, sans rien reregler');
  eq(i.repli, false, 'le bandeau disparaît de lui-même');
}

console.log('— Lecture seule : un dossier qui EXISTE mais refuse l écriture');
{
  // ⚠ On INJECTE le verdict au lieu de fabriquer des ACL Windows : un banc qui
  // modifie les droits d un vrai dossier est un banc qu on finit par ne plus
  // lancer. Ce qu on éprouve ici est la DÉCISION, pas `fs.accessSync`.
  const jamais = () => false;
  const i = D.info(DEFAUT, CHOISI, jamais);
  eq(i.dir, DEFAUT, 'un dossier en lecture seule déclenche le repli, comme un dossier absent');
  eq(i.repli, true, 'et il est annoncé');
  eq(i.choisi, CHOISI, 'le choix est gardé là aussi');
}

console.log('— `utilisable` sépare bien « existe » de « on peut y écrire »');
{
  dit(D.utilisable(path.join(base, 'neuf')) === true, 'un dossier absent mais créable est utilisable');
  dit(D.utilisable(DISPARU) === false, 'un dossier impossible à créer ne l est pas');
}

/* ══ LE TÉMOIN — ON CASSE LA RÈGLE ET LE BANC DOIT LE VOIR ═══════════════════
   Sans cette section, un `info()` qui rendrait `repli:false` en toute
   circonstance passerait toutes les assertions ci-dessus SAUF une, et une seule
   ligne rouge dans un banc vert se lit comme un détail. Ici on affirme que le
   banc SAIT échouer : si ce contre-exemple passait, c est le banc qui est mort,
   pas le code. */
console.log('— TÉMOIN : une règle fausse doit être refusée');
{
  const fausse = (defaut, choisi) => ({ dir: defaut, choisi, defaut, repli: false });
  const i = fausse(DEFAUT, DISPARU);
  dit(i.repli === false, '(mise en place) la règle fausse dit bien repli:false');
  dit(D.info(DEFAUT, DISPARU).repli !== i.repli,
      '⚠ LA VRAIE RÈGLE SE DISTINGUE DE LA FAUSSE — sinon ce banc ne prouve rien');
}

try { fs.rmSync(base, { recursive: true, force: true }); } catch { /* le temp se videra */ }

console.log(fautes ? '\n' + fautes + ' ÉCHEC(S)' : '\nTout est vert.');
process.exit(fautes ? 1 : 0);
