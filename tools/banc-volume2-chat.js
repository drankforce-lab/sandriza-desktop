#!/usr/bin/env node
'use strict';
/*
 * BANC — LA SAISIE DU CLAVARDAGE NE POUSSE JAMAIS LES BOUTONS HORS DE LA FENETRE (2026-10-19, lot VOLUME 2)
 * =============================================================================
 * Sans Chrome ni Electron : on genere la page (pageChat) et on lit ses REGLES. La boite de conversation
 * est une colonne bornee (max-height:88vh) ; pour que les boutons d envoi restent visibles il faut :
 *   • la saisie (#ch-reponse) agrandie (min-height >= 6em) MAIS bornee (max-height) et qui defile en
 *     elle-meme (overflow-y:auto) ;
 *   • le fil qui cede la place (min-height:0 dans la boite), la saisie et le pied qui ne cedent jamais
 *     (flex:0 0 auto) ;
 *   • la zone de saisie posee dans .ch-saisie (plus de style en ligne sans borne).
 * Et le script de la page se compile (vm.Script). En prime : la fenetre Import / Export tire l export
 * par tranches et lance l import sans l attendre (suivi par catalogio:etat), et se compile aussi.
 *
 *   node tools/banc-volume2-chat.js           # le controle
 *   node tools/banc-volume2-chat.js --essai   # panne provoquee : la borne de la saisie est retiree
 */
const path = require('path');
const vm = require('vm');

const ESSAI = process.argv.includes('--essai');
let fautes = 0, n = 0;
const dit = (ok, s) => { n++; if (!ok) fautes++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + s); };

const F = path.join(__dirname, '..', 'src', 'fenetres');
let html = require(path.join(F, 'chat.js')).pageChat({});
if (ESSAI) html = html.replace(/#ch-reponse\{[^}]*\}/, '#ch-reponse{min-height:6.5em;resize:vertical}');

const regle = (sel) => {
  const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\#]/g, '\\$&') + '\\{([^}]*)\\}', 'g');
  let m, tout = '';
  while ((m = re.exec(html))) tout += m[1] + ';';
  return tout;
};
const saisie = regle('#ch-reponse');
const mh = /min-height:\s*([\d.]+)em/.exec(saisie);
dit(!!mh && parseFloat(mh[1]) >= 6, 'la saisie est agrandie (min-height ' + (mh ? mh[1] + 'em' : 'absente') + ' >= 6em)');
dit(/max-height:\s*(min\(|[\d.]+(rem|vh))/.test(saisie), 'la saisie est BORNEE (max-height en rem/vh)');
dit(/overflow-y:\s*auto/.test(saisie), 'passe la borne, la saisie defile en elle-meme (overflow-y:auto)');
dit(/min-height:\s*0/.test(regle('.boite .fil')), 'le fil cede la place (min-height:0 dans la boite)');
dit(/flex:\s*0 0 auto/.test(regle('.boite .pied-boite')), 'le pied des boutons ne cede jamais (flex:0 0 auto)');
dit(/flex:\s*0 0 auto/.test(regle('.boite .ch-saisie')), 'la zone de saisie ne grandit pas au-dela de sa borne (flex:0 0 auto)');
dit(/max-height:\s*88vh/.test(regle('.boite')), 'la boite reste bornee a la fenetre (max-height:88vh)');
dit(/class="ch-saisie"><textarea[^>]*id="ch-reponse"/.test(html) || /ch-saisie/.test(html) && /id="ch-reponse"/.test(html),
  'la saisie est posee dans .ch-saisie');

const compile = (h, nom) => {
  const re = /<script>([\s\S]*?)<\/script>/g; let x, k = 0, ok = true;
  while ((x = re.exec(h))) { try { new vm.Script(x[1]); k++; } catch (e) { ok = false; console.log('  ' + nom + ' : ' + e.message); } }
  dit(ok && k > 0, nom + ' : le script de la page se compile (' + k + ')');
};
compile(html, 'clavardage');

const cio = require(path.join(F, 'catalogio.js')).pageCatalogio({});
compile(cio, 'import / export');
dit(/o\.lot = EXP_LOT; o\.depuis = depuis;/.test(cio) && /r\.parLots/.test(cio), 'import / export : l export est tire par tranches (lot, depuis), repli sur un ancien site');
dit(/appeler\('catalogio:appliquer', \{ attendre: false \}\)/.test(cio) && /appeler\('catalogio:etat'/.test(cio) && /r\.interrompu|RAP\.interrompu/.test(cio),
  'import / export : l import part sans attendre, suivi par catalogio:etat, l arret au milieu est dit');

console.log('\n' + (fautes ? fautes + ' ÉCHEC(S) sur ' + n : 'TOUT EST BON (' + n + ' controles)') + (ESSAI ? '  [--essai : des echecs sont ATTENDUS]' : ''));
process.exit(fautes ? 1 : 0);
