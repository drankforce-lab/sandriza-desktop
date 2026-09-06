'use strict';

/*
 * BANC DE L'ÉCRAN DE TÉLÉCHARGEMENT
 * =============================================================================
 *   node tools/banc-porte-progression.js
 *
 * Ce texte s'affiche pendant qu'une mise à jour se télécharge — c'est-à-dire au
 * seul moment où PERSONNE NE PEUT LE CORRIGER : l'application est en train de se
 * remplacer, et un « environ Infinity s » resterait à l'écran jusqu'au
 * redémarrage. Aucune de ces fautes ne lève d'exception ; elles s'écrivent
 * simplement à l'écran, et on les découvre en regardant.
 *
 * ⚠ LES VALEURS QUI ARRIVENT VRAIMENT. `electron-updater` émet son premier
 * `download-progress` très tôt : `bytesPerSecond` peut valoir 0 (rien ne s'est
 * encore écoulé), `total` peut manquer si le serveur n'annonce pas de longueur,
 * et `percent` peut être absent. Les trois se produisent, et les trois donnaient
 * autrefois un affichage absurde ou une division par zéro.
 */

const assert = require('assert');
const { texteProgression, _moFr, _dureeFr } = require('../src/porte-progression');

let vert = 0;
const cas = (nom, fn) => {
  try { fn(); vert++; console.log('  ok   ' + nom); }
  catch (e) { console.error('  FAUX ' + nom + '\n       ' + e.message); process.exitCode = 1; }
};

const Mo = 1048576;

console.log('\n── LE CAS NORMAL ────────────────────────────────────────────');

cas('pourcentage, Mo restants, vitesse et temps', () => {
  const h = texteProgression({ percent: 47.3, transferred: 38 * Mo, total: 81 * Mo, bytesPerSecond: 2.4 * Mo });
  assert.ok(h.includes('>47 %<'), 'le pourcentage est arrondi et mis en avant');
  assert.ok(h.includes('43,0 Mo restants'), 'les Mo RESTANTS, pas les Mo faits');
  assert.ok(h.includes('sur 81,0 Mo'));
  assert.ok(h.includes('2,4 Mo/s'));
  assert.ok(h.includes('environ 18 s'));
});

cas('la virgule décimale, pas le point (français)', () => {
  assert.strictEqual(_moFr(2.5 * Mo), '2,5');
  /* ⚠ ON NE REGARDE QUE LES NOMBRES, PAS LE HTML ENTIER — première version de
     ce cas, et elle était fausse : « aucun point dans la page » butait sur
     `opacity:.6` et sur le point final de la dernière phrase. Un cas d'épreuve
     qui accuse du CSS n'éprouve pas le formatage des nombres. */
  const h = texteProgression({ percent: 10, transferred: Mo, total: 3 * Mo, bytesPerSecond: Mo });
  for (const n of h.match(/[0-9]+[.,][0-9]+/g) || []) {
    assert.ok(n.includes(','), 'nombre écrit à l’anglaise : ' + n);
  }
});

console.log('\n── LES CAS QUI CASSENT EN SILENCE ───────────────────────────');

cas('vitesse à ZÉRO : pas de division par zéro, pas de ligne', () => {
  // ⚠ LE CAS QUI A MOTIVÉ CE BANC. `reste / 0` vaut Infinity, et l'écran
  // affichait « environ Infinity s » — pendant une mise à jour, donc pour
  // toujours.
  const h = texteProgression({ percent: 3, transferred: 2 * Mo, total: 81 * Mo, bytesPerSecond: 0 });
  assert.ok(!h.includes('Infinity'), 'jamais Infinity');
  assert.ok(!h.includes('NaN'), 'jamais NaN');
  assert.ok(!h.includes('Mo/s'), 'sans vitesse fiable, on se TAIT plutôt que de mentir');
  assert.ok(h.includes('79,0 Mo restants'), 'les Mo restent affichés : eux sont connus');
});

cas('aucun total annoncé : le pourcentage seul, et rien d’inventé', () => {
  const h = texteProgression({ percent: 12 });
  assert.ok(h.includes('>12 %<'));
  assert.ok(!h.includes('restants'), 'sans total, « restants » n’a pas de sens');
  assert.ok(!h.includes('NaN'));
});

cas('événement vide : 0 %, et surtout pas NaN', () => {
  const h = texteProgression({});
  assert.ok(h.includes('>0 %<'));
  assert.ok(!h.includes('NaN') && !h.includes('undefined'));
});

cas('rien du tout : ne lève pas', () => {
  for (const v of [null, undefined, 'bidon', 0]) {
    const h = texteProgression(v);
    assert.ok(h.includes('>0 %<'), String(v));
    assert.ok(!h.includes('NaN') && !h.includes('undefined'));
  }
});

cas('déjà transféré plus que le total : jamais de négatif', () => {
  // Arrive avec certains serveurs qui recomptent l'en-tête.
  const h = texteProgression({ percent: 100, transferred: 82 * Mo, total: 81 * Mo, bytesPerSecond: Mo });
  assert.ok(h.includes('0,0 Mo restants'), 'plancher à zéro, jamais « -1,0 Mo restants »');
  /* ⚠ MÊME CORRECTION : « aucun tiret dans la page » accusait les noms de
     classes (`dl-pct`, `dl-mo`). On cherche un tiret DEVANT UN CHIFFRE. */
  assert.ok(!/-[0-9]/.test(h), 'aucun nombre négatif');
});

cas('vitesse ridicule (quelques octets/s) : on se tait', () => {
  // Sinon : « 0,0 Mo/s · plus d’une heure », qui affole pour rien au tout début.
  const h = texteProgression({ percent: 1, transferred: 100, total: 81 * Mo, bytesPerSecond: 300 });
  assert.ok(!h.includes('Mo/s'));
});

console.log('\n── LES DURÉES ───────────────────────────────────────────────');

cas('secondes, minutes, et le refus de promettre au-delà', () => {
  assert.strictEqual(_dureeFr(18), 'environ 18 s');
  assert.strictEqual(_dureeFr(0.2), 'environ 1 s', 'jamais « environ 0 s »');
  assert.strictEqual(_dureeFr(150), 'environ 3 min');
  assert.strictEqual(_dureeFr(7200), 'plus d’une heure');
  assert.strictEqual(_dureeFr(Infinity), '');
  assert.strictEqual(_dureeFr(NaN), '');
  assert.strictEqual(_dureeFr(-5), '');
});

console.log('\n── PANNE PROVOQUÉE (un cas doit la REFUSER) ─────────────────');

/* La version d'avant : « X Mo sur Y Mo », sans garde sur la vitesse. Si les cas
   ci-dessus la laissaient passer, ils ne mesureraient rien. */
const naif = (p) => '<div class="dl-pct">' + Math.round(p.percent) + ' %</div>'
  + '<div class="dl-mo">' + (p.transferred / Mo).toFixed(1) + ' Mo sur ' + (p.total / Mo).toFixed(1) + ' Mo</div>'
  + '<div class="dl-vit">environ ' + ((p.total - p.transferred) / p.bytesPerSecond) + ' s</div>';

const sortie = naif({ percent: 3, transferred: 2 * Mo, total: 81 * Mo, bytesPerSecond: 0 });
if (sortie.includes('Infinity')) {
  vert++;
  console.log('  ok   la version d’avant écrit bien « environ Infinity s » — le cas la refuse');
} else {
  console.error('  FAUX la version d’avant passe : le cas « vitesse à zéro » ne mesure rien');
  process.exitCode = 1;
}

console.log('\n' + (process.exitCode ? '✗ DES CAS ONT ÉCHOUÉ' : '✓ ' + vert + ' cas verts') + '\n');
