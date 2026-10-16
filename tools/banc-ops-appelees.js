#!/usr/bin/env node
'use strict';
/* ============================================================================
   banc-ops-appelees.js — TOUTE OPÉRATION APPELÉE PAR UNE FENÊTRE EST DÉCLARÉE (2026-10-15)
   ----------------------------------------------------------------------------
   Trouvé par l'audit des fonctions (sa demande : « un contrôle fin et précis sur
   l'ensemble des fonctions de l'administration ») : la fenêtre Maintenance appelait
   « tableau:rafraichirMaintenance », qui n'existait NULLE PART. executerOpSite le
   refusait (operation_inconnue), l'appel était dans un try/catch : aucun bruit,
   et le bouton Maintenance du tableau de bord gardait l'ancien état.
   La parité coquille ↔ site est gardée ailleurs (verifier-fenetres) ; le maillon
   FENÊTRE → COQUILLE ne l'était pas.

   CE QUI FAIT ÉCHOUER : un appeler('xxx:yyy') (ou P.appeler / szPont.appeler) dans
   src/fenetres/*.js dont l'opération n'est pas une chaîne déclarée dans src/main.js.

   PANNE PROVOQUÉE : ajouter dans une fenêtre `appeler('essai:inexistant', [])` —
   le banc doit nommer la fenêtre et l'opération.
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const RAC = path.join(__dirname, '..');
const main = fs.readFileSync(path.join(RAC, 'src', 'main.js'), 'utf8');
const DOS = path.join(RAC, 'src', 'fenetres');

const fautes = [];
let n = 0;
for (const f of fs.readdirSync(DOS).filter((x) => x.endsWith('.js')).sort()) {
  const s = fs.readFileSync(path.join(DOS, f), 'utf8');
  for (const m of s.matchAll(/appeler\(\s*'([a-z][\w-]*:[\w:-]+)'/g)) {
    n++;
    if (!main.includes("'" + m[1] + "'")) fautes.push(f + '  ' + m[1]);
  }
}
console.log('== OPÉRATIONS APPELÉES PAR LES FENÊTRES : toutes déclarées dans main.js ==');
if (fautes.length) {
  for (const x of [...new Set(fautes)]) console.log('  ✗ ' + x);
  console.log('\n>>> ' + new Set(fautes).size + ' opération(s) appelée(s) mais inconnue(s) de la coquille — refusées en silence à l’exécution.');
  process.exit(1);
}
console.log('>>> ' + n + ' appels, tous vers une opération déclarée');
