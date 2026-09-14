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
const { curseurSuivant, aAnnoncer, majEchec, depuisQuand,
        purgerNotifs, partagerNotifs } = require('../src/veilleur-curseur');

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

console.log('\n── LA VEILLE NE DÉPEND D’AUCUNE SESSION ──────────────');

/* ⚠⚠ POURQUOI CE GARDE EXISTE — IL L A DEMANDÉ DEUX FOIS.
   « Quand on est déconnecté l’application doit quand même surveiller les
   nouvelles commandes et retours » (2026-09-09), puis « si on a été connecté et
   que l’application se déconnecte il faut que le veilleur de commande persiste
   et soit fonctionnel même sans session ».

   La règle tient aujourd’hui à une ABSENCE : il n’y a simplement aucune
   vérification de session dans le chemin du sondage. Une absence ne se voit pas
   en relisant, et rien n’empêche quelqu’un d’ajouter demain un innocent
   `if (!_connecteHote()) return;` en croyant bien faire — la veille s’éteindrait
   alors la nuit, sans un message, et personne ne le saurait avant d’avoir raté
   des commandes. C’est exactement le genre de panne muette que ce dépôt paie le
   plus cher.

   ⚠ CE GARDE LIT LA SOURCE, et il faut savoir ce que ça vaut : il ne prouve pas
   que la veille TOURNE, il prouve que son chemin ne consulte pas la session.
   C’est la question posée, et c’est tout ce qu’il répond. `veilleur.js` charge
   Electron : on ne peut pas l’exécuter ici, et un banc qui prétendrait le
   contraire mentirait sur sa portée. */
const _srcV = fs.readFileSync(path.join(__dirname, '..', 'src', 'veilleur.js'), 'utf8');

// Le corps d’une fonction nommée, du `{` à l’accolade de même niveau.
const _corps = (nom) => {
  const i = _srcV.indexOf('function ' + nom + '(');
  if (i < 0) return null;
  const d = _srcV.indexOf('{', i);
  if (d < 0) return null;
  let n = 0;
  for (let k = d; k < _srcV.length; k++) {
    if (_srcV[k] === '{') n++;
    else if (_srcV[k] === '}') { n--; if (!n) return _srcV.slice(d, k + 1); }
  }
  return null;
};

/* Les trois fonctions du chemin, et ce qui ne doit PAS y apparaître.
   ⚠ `toast()` n’est PAS dans la liste, à dessein : il consulte légitimement
   l’état de connexion pour écrire le texte du clic (« connectez-vous pour… »).
   L’y mettre aurait fait crier le garde sur du code correct — et un contrôle qui
   crie finit désactivé. */
const _INTERDITS = ['_connecteHote', 'session', 'sessionToken', 'jetonSession'];

for (const nom of ['interroger', 'unTour', 'ordonnancer']) {
  cas(nom + '() ne consulte aucune session', () => {
    const c = _corps(nom);
    assert.ok(c, 'fonction ' + nom + ' introuvable dans veilleur.js — ce garde ne garde plus rien');
    for (const mot of _INTERDITS) {
      assert.ok(c.indexOf(mot) < 0,
        nom + ' mentionne « ' + mot + ' » : la veille dependrait d une session, ce qu il a interdit deux fois');
    }
  });
}

cas('interroger() s authentifie bien avec la CLE D APPLICATION', () => {
  const c = _corps('interroger');
  assert.ok(c && c.indexOf('X-Sandriza-App') >= 0,
    'l en-tete de cle d application a disparu : le sondage ne s authentifie plus, ou plus de la meme facon');
});

/* ⚠ ET LE TÉMOIN : un garde qui n’a jamais refusé ne prouve rien. On lui donne
   ici le défaut exact qu’il cherche — la ligne qu’on ajouterait par mégarde. */
cas('temoin : le garde REFUSE un unTour() qui consulterait la session', () => {
  const faux = '{ if (!_connecteHote()) return; battre(); }';
  let vu = false;
  for (const mot of _INTERDITS) if (faux.indexOf(mot) >= 0) vu = true;
  assert.ok(vu, 'le garde laisse passer une consultation de session : il ne prouve rien');
});
/* ══ DEPUIS QUAND ÇA NE MARCHE PAS — #100, 2026-09-14 ═══════════════════════
 * ⚠ CE QUI RENDAIT LA FAUTE MUETTE : la ligne d'état disait bien « ⚠ Réseau
 * indisponible », donc tout semblait signalé. Ce qu'elle ne disait pas, c'est
 * DEPUIS QUAND — et `dernierEchec` ne vivait qu'en mémoire, donc chaque
 * redémarrage remettait une veille morte depuis mardi à l'air d'une panne
 * fraîche. Deux situations très différentes, la même phrase.
 * ⚠ CES CAS SONT ICI PARCE QU'ILS PEUVENT TOUS ÉCHOUER : chacun distingue la
 * bonne règle de l'écriture naïve qu'on ferait d'instinct. */
console.log('\n── DEPUIS QUAND ÇA NE MARCHE PAS ────────────────────────────');

const M = (s) => '2026-09-11T0' + s + ':00:00.000Z';

cas('un succès efface la série et note la date', () => {
  const p = majEchec({ echecDepuis: M(1), echecMotif: 'reseau', succes: null }, { ok: true }, M(5));
  assert.strictEqual(p.echecDepuis, null);
  assert.strictEqual(p.echecMotif, '');
  assert.strictEqual(p.succes, M(5));
});

cas('le PREMIER échec pose le début de la série', () => {
  const p = majEchec({ echecDepuis: null, echecMotif: '', succes: M(1) }, { ok: false, motif: 'reseau' }, M(2));
  assert.strictEqual(p.echecDepuis, M(2));
  assert.strictEqual(p.echecMotif, 'reseau');
});

/* ⚠⚠ LE CAS QUI COMPTE, et l'écriture naïve que j'ai failli faire :
   `echecDepuis: maintenant` à chaque tour raté. Elle passe tous les autres cas
   et ment sur le seul qui intéresse — une panne qui dure paraîtrait neuve à
   chaque minute. */
cas('un échec qui DURE ne repousse pas le début', () => {
  const p = majEchec({ echecDepuis: M(2), echecMotif: 'reseau', succes: M(1) }, { ok: false, motif: 'reseau' }, M(9));
  assert.strictEqual(p.echecDepuis, M(2), 'le début a été repoussé : une panne qui dure paraîtrait neuve');
});

cas('le motif CHANGE mais la panne est la même : le début ne bouge pas', () => {
  const p = majEchec({ echecDepuis: M(2), echecMotif: 'reseau', succes: M(1) }, { ok: false, motif: 'delai' }, M(9));
  assert.strictEqual(p.echecDepuis, M(2));
  assert.strictEqual(p.echecMotif, 'delai', 'le motif courant doit suivre, lui');
});

cas('le dernier succès SURVIT à la série d’échecs', () => {
  const p = majEchec({ echecDepuis: M(2), echecMotif: 'reseau', succes: M(1) }, { ok: false, motif: 'reseau' }, M(9));
  assert.strictEqual(p.succes, M(1), 'sans lui, « jusqu’à quand ça marchait » est perdu');
});

cas('durée : moins d’une minute ne prétend pas à une minute', () => {
  assert.deepStrictEqual(depuisQuand('2026-09-11T01:00:00Z', '2026-09-11T01:00:30Z'), { unite: 'minute', n: 0 });
});
cas('durée : minutes, heures, jours', () => {
  assert.deepStrictEqual(depuisQuand('2026-09-11T01:00:00Z', '2026-09-11T01:45:00Z'), { unite: 'minute', n: 45 });
  assert.deepStrictEqual(depuisQuand('2026-09-11T01:00:00Z', '2026-09-11T06:00:00Z'), { unite: 'heure',  n: 5 });
  assert.deepStrictEqual(depuisQuand('2026-09-11T01:00:00Z', '2026-09-14T01:00:00Z'), { unite: 'jour',   n: 3 });
});

/* ⚠ UNE DATE ILLISIBLE NE DOIT PAS FABRIQUER DE PHRASE. « depuis Invalid Date »
   ferait douter du reste de la ligne d'état — mieux vaut ne rien dire. */
cas('durée : rien à dire sur une date absente, illisible, ou à l’envers', () => {
  assert.strictEqual(depuisQuand(null, M(5)), null);
  assert.strictEqual(depuisQuand('pas une date', M(5)), null);
  assert.strictEqual(depuisQuand(M(9), M(1)), null, 'une fin avant le début : on se tait');
});

/* ⚠ ET LE CÂBLAGE : la règle peut être juste et n'être appelée par personne.
   C'est exactement ce qui est arrivé à la boîte de reprise (#81). */
cas('veilleur.js ÉCRIT l’état à chaque tour, réussi ou non', () => {
  const c = _corps('unTour');
  assert.ok(c && /ecrireEtat\(\s*majEchec\(/.test(c),
    'unTour() n’appelle plus majEchec : rien ne survivrait au redémarrage');
});
cas('la ligne d’état lit le DISQUE avant la mémoire', () => {
  const c = _corps('ligneEtat');
  assert.ok(c && c.indexOf('echecMotif') >= 0,
    'ligneEtat() ne lit que `dernierEchec` : au redémarrage elle dirait « à l’écoute » sur une veille morte');
});

console.log('\n── L’HISTORIQUE : 7 JOURS, PUIS L’OUBLI (#124) ──────────────');

/* ⚠⚠ UNE PURGE EST LE MÉCANISME QUI CESSE DE MARCHER SANS RIEN DIRE. Elle ne
   lève pas, elle n'affiche rien : elle ne fait simplement plus son travail. On
   ne s'en aperçoit que six mois plus tard, sur un fichier devenu énorme — ou,
   pire, le jour où elle a effacé ce qu'il fallait garder. D'où ces cas. */
const J = (n) => new Date(Date.parse('2026-09-14T12:00:00.000Z') - n * 86400000).toISOString();
const MAINTENANT = '2026-09-14T12:00:00.000Z';

cas('purge : ce qui a plus de 7 jours part, le reste demeure', () => {
  const l = [
    { t: J(0), titre: 'aujourd’hui' },
    { t: J(3), titre: 'il y a trois jours' },
    { t: J(6.9), titre: 'juste sous la limite' },
    { t: J(7.1), titre: 'juste au-delà' },
    { t: J(40), titre: 'le mois dernier' },
  ];
  const r = purgerNotifs(l, MAINTENANT);
  assert.deepStrictEqual(r.map((x) => x.titre),
    ['aujourd’hui', 'il y a trois jours', 'juste sous la limite']);
});

/* ⚠ LE CAS QUI COMPTE AUTANT QUE L'AUTRE : une purge qui garde tout serait
   inutile, mais une purge qui jette tout serait pire — et les deux passent un
   banc qui ne mesure que « la liste a rétréci ». */
cas('purge : rien à jeter, rien n’est jeté', () => {
  const l = [{ t: J(1), titre: 'hier' }, { t: J(2), titre: 'avant-hier' }];
  assert.strictEqual(purgerNotifs(l, MAINTENANT).length, 2);
});

cas('purge : une date ILLISIBLE est gardée, pas effacée en douce', () => {
  const l = [{ t: 'pas une date', titre: 'venue d’une version antérieure' },
             { t: J(40), titre: 'vieille et lisible' }];
  const r = purgerNotifs(l, MAINTENANT);
  assert.deepStrictEqual(r.map((x) => x.titre), ['venue d’une version antérieure']);
});

cas('purge : un INSTANT illisible ne déclenche aucune purge', () => {
  const l = [{ t: J(40), titre: 'vieille' }, { t: J(0), titre: 'neuve' }];
  assert.strictEqual(purgerNotifs(l, 'pas une date').length, 2,
    'sans horloge fiable, on préfère garder trop que jeter à tort');
});

cas('purge : le plafond coupe les VIEILLES, jamais les neuves', () => {
  const l = [];
  for (let i = 0; i < 50; i++) l.push({ t: J(i / 24), titre: 'n' + i });  // i heures
  const r = purgerNotifs(l, MAINTENANT, 7, 10);
  assert.strictEqual(r.length, 10);
  assert.strictEqual(r[0].titre, 'n0', 'la plus récente doit survivre');
  assert.strictEqual(r[9].titre, 'n9');
});

cas('purge : même sur une liste DÉSORDONNÉE, le plafond garde les récentes', () => {
  const l = [{ t: J(30), titre: 'vieille' }, { t: J(0), titre: 'neuve' }, { t: J(5), titre: 'moyenne' }];
  const r = purgerNotifs(l, MAINTENANT, 7, 2);
  assert.deepStrictEqual(r.map((x) => x.titre), ['neuve', 'moyenne'],
    'trier avant de couper, sinon l’ordre d’arrivée décide de ce qu’on perd');
});

cas('purge : une liste absente ou abîmée ne fait pas tomber le veilleur', () => {
  assert.deepStrictEqual(purgerNotifs(null, MAINTENANT), []);
  assert.deepStrictEqual(purgerNotifs([null, 'x', 3], MAINTENANT), []);
});

console.log('\n── LES DERNIÈRES EN HAUT, LE RESTE DERRIÈRE (#124) ──────────');

cas('partage : trois en tête, le reste dans l’historique', () => {
  const l = [1, 2, 3, 4, 5].map((i) => ({ t: J(i / 24), titre: 'n' + i }));
  const r = partagerNotifs(l);
  assert.deepStrictEqual(r.tete.map((x) => x.titre), ['n1', 'n2', 'n3']);
  assert.deepStrictEqual(r.reste.map((x) => x.titre), ['n4', 'n5']);
});

cas('partage : moins de trois, il n’y a rien derrière', () => {
  const r = partagerNotifs([{ t: J(0), titre: 'seule' }]);
  assert.deepStrictEqual(r.tete.map((x) => x.titre), ['seule']);
  assert.strictEqual(r.reste.length, 0, 'un sous-menu vide dirait qu’il y a quelque chose à voir');
});

cas('partage : les lignes sans titre sont écartées des deux côtés', () => {
  const r = partagerNotifs([{ t: J(0) }, { t: J(1), titre: 'vraie' }]);
  assert.deepStrictEqual(r.tete.map((x) => x.titre), ['vraie']);
});

/* ⚠ LE CÂBLAGE, ENCORE : la règle peut être juste et n'être appelée par
   personne — c'est ce qui est arrivé à la boîte de reprise (#81), et c'est
   aussi ce qui guette une purge écrite mais jamais branchée. */
cas('veilleur.js PURGE vraiment en écrivant l’historique', () => {
  const c = _corps('_noter');
  assert.ok(c && c.indexOf('purgerNotifs') >= 0,
    '_noter() n’appelle pas purgerNotifs : la liste grossirait sans fin');
});
cas('le menu de l’icône PARTAGE vraiment la liste', () => {
  const c = _corps('_sousMenuNotifs');
  assert.ok(c && c.indexOf('partagerNotifs') >= 0,
    '_sousMenuNotifs() ne partage pas : tout resterait dans un sous-menu');
});
cas('la pastille de l’icône s’éteint quand on regarde', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'veilleur.js'), 'utf8');
  assert.ok(/tray\.on\(\s*['"]right-click['"]/.test(src),
    'rien n’écoute le clic droit : la pastille resterait allumée pour toujours');
  assert.ok(src.indexOf('nonVus') >= 0, 'aucun compteur de non-vus : la pastille ne saurait pas quoi dire');
});

console.log('\n' + (process.exitCode ? '✗ DES CAS ONT ÉCHOUÉ' : '✓ ' + vert + ' cas verts') + '\n');
