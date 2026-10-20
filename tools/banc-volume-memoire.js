#!/usr/bin/env node
'use strict';
/*
 * BANC — MÉMOIRE ET MISE EN PAGE DEVANT LE NOMBRE (2026-10-19, audit — lot VOLUME)
 * =============================================================================
 *   • Visionneuse : feuilleter 500 photos ne garde que les 8 dernières images pleines (LRU) — avant, toutes
 *     restaient en mémoire (des adresses data: de plusieurs Mo chacune) jusqu'à la fermeture ;
 *   • Suivi des générations (taches.js) : 30 générations lancées d'un coup → 3 boîtes puis « +27 autres »,
 *     au lieu de 30 boîtes empilées dans une fenêtre plus haute que l'écran.
 *
 *   node tools/banc-volume-memoire.js           # le contrôle
 *   node tools/banc-volume-memoire.js --essai   # panne provoquée : le LRU ne retire plus rien
 */
const { executerPage } = require('./executer-page.js');
const { pageVisionneuse } = require('../src/fenetres/visionneuse.js');
const { pageTaches } = require('../src/fenetres/taches.js');
const ESSAI = process.argv.includes('--essai');

let fautes = 0, n = 0;
const ok = (c, q) => { n++; if (!c) { fautes++; console.log('  NON ' + q); } };
const scriptDe = (page) => page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));

(async () => {
  /* ── Visionneuse : la règle LRU, lue dans la page ── */
  {
    let s = scriptDe(pageVisionneuse({ ids: ['a'] }));
    if (ESSAI) s = s.replace('while (PLEIN_ORDRE.length > PLEIN_MAX) delete PLEIN[PLEIN_ORDRE.shift()];', '');
    const i0 = s.indexOf('var PLEIN = {};');
    const i1 = s.indexOf('function pleinToucher(', i0);
    const i2 = s.indexOf('\n  }', i1) + 4;
    ok(i0 > 0 && i1 > i0, 'visionneuse : le cache des images pleines est trouvé');
    if (i0 > 0 && i1 > i0) {
      // eslint-disable-next-line no-new-func
      const f = new Function(s.slice(i0, i2) + '; return { PLEIN: PLEIN, garder: pleinGarder, toucher: pleinToucher };')();
      const lourd = 'data:image/jpeg;base64,' + 'A'.repeat(1000);
      for (let i = 0; i < 500; i++) f.garder('p' + i, lourd);
      ok(Object.keys(f.PLEIN).length === 8, '500 photos feuilletées : 8 images pleines gardées (vu ' + Object.keys(f.PLEIN).length + ')');
      ok(f.PLEIN.p499 && f.PLEIN.p492 && !f.PLEIN.p491, 'ce sont les 8 DERNIÈRES vues');
      f.toucher('p492'); f.garder('p500', lourd);
      ok(f.PLEIN.p492 && !f.PLEIN.p493, 'revoir une photo la garde (la plus ancienne non revue part)');
    }
  }

  /* ── Suivi des générations : 30 d'un coup ── */
  {
    const page = pageTaches();
    const L = [];
    for (let i = 0; i < 30; i++) L.push({ id: 'g' + i, genre: '3d', titre: 'Article ' + i, etat: 'cours', n: 2, N: 11, pct: 20, reste: 100, cout: 0.5, message: '', etapes: [], resteAffiche: 0 });
    const script = scriptDe(page) + '\n;window.szMaj(' + JSON.stringify(L) + ');';
    const ex = await executerPage(script, { 'generations:etat': { ok: true, liste: [] } }, { tours: 6 });
    ok(!ex.fautes.length, 'suivi : la fenêtre meurt : ' + ex.fautes.join(' | '));
    const boites = (ex.html.match(/class="suivi( annule)?" data-id="g/g) || []).length;
    ok(boites === 3, '30 générations : 3 boîtes dessinées (vu ' + boites + ')');
    ok(/\+27 autres générations/.test(ex.html), 'puis une ligne « +27 autres générations — tout voir »');
  }

  console.log(fautes ? '\nÉCHEC  mémoire et mise en page : ' + fautes + ' faute(s) sur ' + n
    : '\nOK  visionneuse en LRU de 8, suivi des générations borné à 3 boîtes — ' + n + ' vérifications');
  process.exit(fautes ? 1 : 0);
})();
