'use strict';

/*
 * BANC DU VEILLEUR — le curseur, l'annonce, et les deux sons
 * =============================================================================
 *   node tools/banc-veilleur.js
 *
 * Ce qui est éprouvé ici est exactement ce qui, en se trompant, NE FAIT AUCUN
 * BRUIT : un curseur trop avancé ne lève rien, n'écrit rien, ne casse rien — il
 * fait juste qu'une commande ne sonne jamais. Le tray et les toasts, eux, se
 * voient à l'œil en dix secondes ; ils n'ont pas besoin d'un banc.
 *
 * ⚠ CHAQUE CAS DOIT POUVOIR ÉCHOUER, sinon il ne mesure rien. C'est la leçon du
 * 2026-08-20 sur `code-mort.js` : quatre cas satisfaits par la bonne ET par la
 * mauvaise version, donc zéro pouvoir de distinction. La section « PANNES
 * PROVOQUÉES » plus bas rejoue donc les DEUX implémentations naïves que j'ai
 * failli écrire, et exige qu'un cas au moins les REFUSE. Si elles passaient, le
 * banc serait décoratif.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { curseurSuivant, aAnnoncer } = require('../src/veilleur-curseur');

let vert = 0;
const cas = (nom, fn) => {
  try { fn(); vert++; console.log('  ok   ' + nom); }
  catch (e) { console.error('  FAUX ' + nom + '\n       ' + e.message); process.exitCode = 1; }
};

const T = (s) => '2026-09-06T1' + s + ':00:00.000Z';   // T(0) < T(1) < … < T(9)

console.log('\n── LE CURSEUR ───────────────────────────────────────────────');

cas('amorce : sans curseur et sans nouveauté, on pose `maintenant`', () => {
  const r = { ok: true, commandes: { nouvelles: 0, dernier: null }, retours: { nouvelles: 0, dernier: null }, maintenant: T(5), amorce: true };
  assert.strictEqual(curseurSuivant(null, r), T(5));
});

cas('rien de neuf : le curseur ne bouge pas', () => {
  const r = { ok: true, commandes: { nouvelles: 0, dernier: null }, retours: { nouvelles: 0, dernier: null }, maintenant: T(9) };
  assert.strictEqual(curseurSuivant(T(3), r), T(3));
});

cas('une commande : on avance jusqu’à ELLE, pas jusqu’à `maintenant`', () => {
  // ⚠ LE CAS QUI COMPTE LE PLUS. `maintenant` est POSTÉRIEUR à la commande vue :
  // s'y placer sauterait toute commande créée pendant l'aller-retour.
  const r = { ok: true, commandes: { nouvelles: 1, dernier: T(4) }, retours: { nouvelles: 0, dernier: null }, maintenant: T(9) };
  assert.strictEqual(curseurSuivant(T(3), r), T(4));
});

cas('deux flux : on retient le plus récent des deux', () => {
  const r = { ok: true, commandes: { nouvelles: 1, dernier: T(4) }, retours: { nouvelles: 2, dernier: T(6) }, maintenant: T(9) };
  assert.strictEqual(curseurSuivant(T(3), r), T(6));
});

cas('un seul flux bouge : l’autre ne fait pas reculer', () => {
  const r = { ok: true, commandes: { nouvelles: 0, dernier: null }, retours: { nouvelles: 1, dernier: T(7) }, maintenant: T(9) };
  assert.strictEqual(curseurSuivant(T(3), r), T(7));
});

cas('monotone : un horodatage plus ANCIEN ne fait jamais reculer', () => {
  // Horloge serveur remise à l'heure, ou réplique en retard : sans cette règle,
  // tout l'historique resonnerait d'un coup.
  const r = { ok: true, commandes: { nouvelles: 1, dernier: T(1) }, retours: { nouvelles: 0, dernier: null }, maintenant: T(9) };
  assert.strictEqual(curseurSuivant(T(5), r), T(5));
});

cas('réponse absente ou difforme : on garde ce qu’on a', () => {
  assert.strictEqual(curseurSuivant(T(3), null), T(3));
  assert.strictEqual(curseurSuivant(T(3), 'bidon'), T(3));
  assert.strictEqual(curseurSuivant(T(3), {}), T(3));
});

console.log('\n── CE QU’ON ANNONCE ─────────────────────────────────────────');

cas('amorce : on ne sonne PAS', () => {
  // Sinon, au premier démarrage, le veilleur annonce toutes les commandes jamais
  // passées — et le son est coupé le jour même.
  const r = { ok: true, commandes: { nouvelles: 12, dernier: T(4) }, retours: { nouvelles: 3, dernier: T(4) }, maintenant: T(5), amorce: true };
  assert.deepStrictEqual(aAnnoncer(r), []);
});

cas('zéro nouveauté : silence', () => {
  assert.deepStrictEqual(aAnnoncer({ ok: true, commandes: { nouvelles: 0 }, retours: { nouvelles: 0 } }), []);
});

cas('les deux flux : deux annonces distinctes, dans cet ordre', () => {
  const a = aAnnoncer({ ok: true, commandes: { nouvelles: 2 }, retours: { nouvelles: 1 } });
  assert.deepStrictEqual(a, [{ type: 'commande', n: 2 }, { type: 'retour', n: 1 }]);
});

cas('un nombre difforme ne fabrique pas une annonce', () => {
  assert.deepStrictEqual(aAnnoncer({ ok: true, commandes: { nouvelles: 'beaucoup' }, retours: {} }), []);
});

console.log('\n── LES DEUX SONS ────────────────────────────────────────────');

/* On ne peut pas ENTENDRE ici — c'est à lui de juger s'ils se distinguent. Mais
   on peut vérifier tout ce qui, en silence, rendrait le son inaudible, saturé,
   ou remplacé par un claquement. */
const lireWav = (nom) => {
  const b = fs.readFileSync(path.join(__dirname, '..', 'src', 'sons', nom + '.wav'));
  const n = (b.length - 44) / 2;
  const ech = (i) => b.readInt16LE(44 + i * 2);
  return { b, n, ech, taux: b.readUInt32LE(24) };
};
// Fréquence mesurée par passages par zéro, au CŒUR de la note (loin des
// enveloppes, qui n'ont pas de fréquence propre).
const freq = (w, d, f) => {
  let z = 0;
  for (let i = d + 1; i < f; i++) if ((w.ech(i - 1) < 0) !== (w.ech(i) < 0)) z++;
  return z * w.taux / (2 * (f - d));
};

for (const [nom, n1, n2] of [['commande', 880, 1318.5], ['retour', 587.3, 392.0]]) {
  cas(nom + '.wav : en-tête WAV PCM 16 bits mono 44,1 kHz', () => {
    const w = lireWav(nom);
    assert.strictEqual(w.b.toString('ascii', 8, 12), 'WAVE');
    assert.strictEqual(w.b.readUInt16LE(20), 1, 'doit être du PCM entier');
    assert.strictEqual(w.b.readUInt16LE(22), 1, 'doit être mono');
    assert.strictEqual(w.taux, 44100);
    assert.strictEqual(w.b.readUInt16LE(34), 16);
    assert.strictEqual(w.b.readUInt32LE(40), w.b.length - 44, 'la taille déclarée doit être la vraie');
  });

  cas(nom + '.wav : commence et finit à ZÉRO (pas de claquement)', () => {
    // Une sinusoïde coupée net produit un clic large bande, que les petits
    // haut-parleurs amplifient — et les deux sons se ressembleraient par leur clic.
    const w = lireWav(nom);
    assert.strictEqual(w.ech(0), 0);
    assert.strictEqual(w.ech(w.n - 1), 0);
  });

  cas(nom + '.wav : ne sature pas', () => {
    const w = lireWav(nom);
    let pic = 0;
    for (let i = 0; i < w.n; i++) pic = Math.max(pic, Math.abs(w.ech(i)));
    assert.ok(pic < 32000, 'pic à ' + pic + ' : trop près de la butée, ça craquerait');
    assert.ok(pic > 5000, 'pic à ' + pic + ' : inaudible sur un poste au volume normal');
  });

  cas(nom + '.wav : les deux notes sont aux hauteurs voulues', () => {
    const w = lireWav(nom);
    const m1 = freq(w, Math.floor(w.n * 0.05), Math.floor(w.n * 0.18));
    const m2 = freq(w, Math.floor(w.n * 0.55), Math.floor(w.n * 0.75));
    assert.ok(Math.abs(m1 - n1) < 20, 'note 1 mesurée à ' + m1.toFixed(0) + ' Hz, visée ' + n1);
    assert.ok(Math.abs(m2 - n2) < 20, 'note 2 mesurée à ' + m2.toFixed(0) + ' Hz, visée ' + n2);
  });
}

cas('les deux sons vont dans des SENS OPPOSÉS — c’est ce qui les distingue', () => {
  /* ⚠ LE SEUL CAS QUI ÉPROUVE LA DEMANDE ELLE-MÊME (« un son unique pour les
     commandes et un autre pour les retours »). Deux sons peuvent avoir des
     hauteurs différentes et se confondre dès que le volume baisse ; la
     DIRECTION, elle, s'entend toujours. Si un jour quelqu'un « harmonise » les
     deux sons, c'est ce cas qui doit tomber. */
  const c = lireWav('commande'), r = lireWav('retour');
  const cm = [freq(c, Math.floor(c.n * 0.05), Math.floor(c.n * 0.18)), freq(c, Math.floor(c.n * 0.55), Math.floor(c.n * 0.75))];
  const rm = [freq(r, Math.floor(r.n * 0.05), Math.floor(r.n * 0.18)), freq(r, Math.floor(r.n * 0.55), Math.floor(r.n * 0.75))];
  assert.ok(cm[1] > cm[0] * 1.2, 'la commande doit MONTER nettement');
  assert.ok(rm[1] < rm[0] * 0.85, 'le retour doit DESCENDRE nettement');
});

console.log('\n── PANNES PROVOQUÉES (un cas doit les REFUSER) ──────────────');

/* Sans cette section, rien ne prouve que les cas ci-dessus distinguent quoi que
   ce soit. On rejoue les deux implémentations naïves — celles que j'ai
   réellement failli écrire — et on exige qu'au moins un cas les rejette. */
const provoquer = (nom, faux, entree, attendu) => {
  let a;
  try { a = faux(entree.actuel, entree.rep); } catch { a = '(a levé)'; }
  if (a === attendu) {
    console.error('  FAUX ' + nom + '\n       la version cassée passe : ce cas ne mesure rien');
    process.exitCode = 1;
  } else {
    vert++;
    console.log('  ok   ' + nom + ' (refusée : rend ' + JSON.stringify(a) + ' au lieu de ' + JSON.stringify(attendu) + ')');
  }
};

provoquer(
  '« depuis = maintenant » perd la commande créée pendant l’aller-retour',
  (actuel, rep) => rep.maintenant,
  { actuel: T(3), rep: { commandes: { nouvelles: 1, dernier: T(4) }, retours: { nouvelles: 0, dernier: null }, maintenant: T(9) } },
  T(4)
);

provoquer(
  '« on prend toujours le dernier vu » fait reculer le curseur',
  (actuel, rep) => (rep.commandes && rep.commandes.dernier) || actuel,
  { actuel: T(5), rep: { commandes: { nouvelles: 1, dernier: T(1) }, retours: { nouvelles: 0, dernier: null }, maintenant: T(9) } },
  T(5)
);

console.log('\n' + (process.exitCode ? '✗ DES CAS ONT ÉCHOUÉ' : '✓ ' + vert + ' cas verts') + '\n');
