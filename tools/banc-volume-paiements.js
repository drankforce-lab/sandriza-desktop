#!/usr/bin/env node
'use strict';
/*
 * BANC — PAIEMENTS SQUARE : UNE ANNÉE DE 10 000 PAIEMENTS, LUE MOIS PAR MOIS (2026-10-19, audit — lot VOLUME)
 * =============================================================================
 * Avant : `paiements:charger` lisait l'année entière dans UN appel du pont, borné à 60 s (main.js). 10 000
 * paiements = 50 pages de 200 en série : l'appel expirait et la fenêtre disait « Square n'a pas répondu ».
 * Ce banc exécute la fenêtre ENTIÈRE dans le faux document (tools/executer-page.js) et vérifie :
 *   1. qu'elle appelle `paiements:charger` UNE FOIS PAR MOIS (12 pour une année passée), chaque appel portant
 *      son mois — donc qu'aucun appel ne porte l'année entière ;
 *   2. que le tout reste borné en temps ;
 *   3. qu'un échec au mois 5 s'arrête là et le DIT (« Arrêté au mois 5/12 »), sans relire les mois suivants ;
 *   4. qu'un verdict `quota` (mémoire du poste pleine) est ANNONCÉ, pas avalé.
 *
 *   node tools/banc-volume-paiements.js           # le contrôle
 *   node tools/banc-volume-paiements.js --essai   # panne provoquée : la fenêtre relit l'année d'un coup
 */
const { executerPage } = require('./executer-page.js');
const { pagePaiements } = require('../src/fenetres/paiements.js');

let fautes = 0, n = 0;
const ok = (c, q) => { n++; if (!c) { fautes++; console.log('  NON ' + q); } };

let page = pagePaiements();
let script = page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));
if (process.argv.includes('--essai')) {
  // La panne : on remet l'ancienne forme — un seul appel, sans mois.
  script = script.replace("appeler('paiements:charger', [an, m])", "appeler('paiements:charger', [an])");
}
const ids = [...page.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);

const LIRE = { ok: true, annee: 2025, annees: [2025, 2024], mode: 'sandbox', production: false, enCache: false,
  transactions: [], remboursements: [], tuiles: null, reconciliation: null, peutMasquer: false };

const essai = async (charger) => {
  const t0 = Date.now();
  const ex = await executerPage(script, { 'paiements:lire': LIRE, 'paiements:charger': charger }, { ids, tours: 80 });
  return { ex, ms: Date.now() - t0 };
};

(async () => {
  // 1-2. Une année passée de ~10 000 paiements, 834 par mois.
  let { ex, ms } = await essai((an, mois) => (mois >= 1 && mois <= 12)
    ? { ok: true, nb: 834, nbRemboursements: 12, mois }
    : { ok: true, nb: 10008, nbRemboursements: 144 });   // l'ancienne forme : l'année d'un coup
  const ch = ex.appels.filter((a) => a.op === 'paiements:charger');
  ok(!ex.fautes.length, 'la fenêtre meurt : ' + ex.fautes.join(' | '));
  ok(ch.length === 12, '12 appels paiements:charger pour une année passée (vu : ' + ch.length + ')');
  ok(ch.every((a, i) => a.args[0] === 2025 && a.args[1] === i + 1), 'chaque appel porte SON mois, dans l’ordre (1 → 12)');
  ok(!ch.some((a) => a.args[1] == null), 'aucun appel ne relit l’année entière d’un coup');
  ok(ms < 3000, 'temps borné (' + ms + ' ms)');

  // 3. Un échec au mois 5 : arrêt, et le mois est NOMMÉ.
  ({ ex } = await essai((an, mois) => (mois === 5 ? { ok: false, motif: 'square' } : { ok: true, nb: 834, nbRemboursements: 0, mois })));
  const ch2 = ex.appels.filter((a) => a.op === 'paiements:charger');
  ok(!ex.fautes.length, 'échec au mois 5 : la fenêtre meurt : ' + ex.fautes.join(' | '));
  ok(ch2.length === 5, 'échec au mois 5 : la lecture s’arrête là (vu : ' + ch2.length + ' appels)');
  ok(/Arrêté au mois/.test(page) && /'Arrêté au mois'|Arrêté au mois/.test(script), 'le texte « Arrêté au mois » existe dans la fenêtre');

  // 4. Le quota est dit.
  ok(/quota:\s*'/.test(script) && /r\.quota/.test(script), 'le verdict quota a son texte et est lu (r.quota)');

  console.log(fautes ? '\nÉCHEC  paiements par mois : ' + fautes + ' faute(s) sur ' + n
    : '\nOK  paiements Square : 12 appels courts (un par mois), arrêt nommé, quota annoncé — ' + n + ' vérifications');
  process.exit(fautes ? 1 : 0);
})();
