#!/usr/bin/env node
'use strict';

/*
 * LES PERMISSIONS SE CORRESPONDENT-ELLES, DES DEUX CÔTÉS ?
 * =============================================================================
 * ⚠⚠⚠ UNE PERMISSION VIT À TROIS ENDROITS, ET ILS PEUVENT DIVERGER EN SILENCE :
 *   1. le MODÈLE   — `PERMISSION_DEFS` dans `assets/js/staff.js` : la liste des
 *      droits qui existent, ce que l'écran des accès propose de cocher ;
 *   2. le MASQUAGE — `perm:` dans `assets/js/appbar.js` : ce qui décide si une
 *      entrée de menu paraît ;
 *   3. la GARDE    — `_hp('…')` dans `assets/js/admin.js` : ce qui REFUSE, et
 *      la seule des trois qui protège vraiment.
 *
 * ⚠⚠ CE QUI ARRIVE QUAND ILS DIVERGENT, ET LES DEUX SENS SONT MAUVAIS :
 *   · un jeton MASQUÉ qui n'existe pas au modèle — `permOk()` répond « inconnu,
 *     donc autorisé » : l'entrée paraît POUR TOUT LE MONDE. Un droit qu'on
 *     croit poser n'existe pas, et rien ne le dit ;
 *   · un jeton GARDÉ qui n'existe pas au modèle — personne ne peut l'accorder,
 *     donc l'écran refuse TOUJOURS, même au bon rôle. Une fenêtre morte.
 *
 * ⚠ CE BANC EST NÉ DU DÉCOUPAGE DE `config` (2026-09-13, tâche #103). Un seul
 * droit ouvrait VINGT-HUIT entrées de menu — les clés de paiement et la base de
 * données au même rang que le pied de page. Le découper voulait dire toucher
 * 71 gardes et 28 entrées ; sans mesure, une seule oubliée aurait laissé une
 * porte ouverte SANS QUE RIEN NE LE DISE. C'est exactement la faute que ce
 * chantier a payée neuf fois aujourd'hui : le défaut hors du terrain balayé.
 *
 * ⚠ IL NE JUGE PAS SI LE DROIT EST BIEN CHOISI — cela demande de savoir ce que
 * l'écran fait, et aucun banc ne le sait. Il vérifie que les trois listes
 * PARLENT DE LA MÊME CHOSE. C'est peu, et c'est ce qui manquait.
 *
 *   node tools/banc-permissions.js
 */

const fs = require('fs');
const path = require('path');

const SITE = path.join(__dirname, '..', '..', 'Sandriza', 'assets', 'js');

if (!fs.existsSync(path.join(SITE, 'staff.js'))) {
  console.log('— `staff.js` introuvable (dépôt du site absent) : contrôle sauté. '
    + 'Il tourne dans build.yml, où les deux dépôts sont là.');
  process.exit(0);
}

const lire = (f) => fs.readFileSync(path.join(SITE, f), 'utf8');

/* ⚠ LES COMMENTAIRES D'ABORD RETIRÉS : ces fiches CITENT des jetons pour les
   expliquer, et une citation n'est pas une déclaration. Même leçon que
   `banc-menu-langue` et `banc-langue-libelles`. */
const _nu = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');

const staff = _nu(lire('staff.js'));
const appbar = _nu(lire('appbar.js'));
const admin = _nu(lire('admin.js'));

/* ── 1. LE MODÈLE : les modules déclarés et leurs actions ─────────────────── */
const bloc = /const\s+PERMISSION_DEFS\s*=\s*\{([\s\S]*?)\n\s*\};/.exec(staff);
if (!bloc) {
  console.error('✗ `PERMISSION_DEFS` introuvable dans staff.js — ce banc ne prouverait rien.');
  process.exit(1);
}
const MODULES = new Map();
{
  const rx = /(?:^|\n)\s*'?([A-Za-z][\w-]*)'?\s*:\s*\{[\s\S]*?actions\s*:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = rx.exec(bloc[1]))) {
    const actions = (m[2].match(/'([a-z]+)'/g) || []).map((s) => s.replace(/'/g, ''));
    MODULES.set(m[1], actions);
  }
}
if (MODULES.size < 20) {
  console.error('✗ seulement ' + MODULES.size + ' module(s) relevé(s) — le motif de lecture '
    + 'ne marche plus, ce banc ne prouverait rien.');
  process.exit(1);
}

const JETONS = new Set();
for (const [mod, actions] of MODULES) {
  JETONS.add(mod);
  for (const a of actions) JETONS.add(mod + ':' + a);
}

const fautes = [];

/* ── 2. LE MASQUAGE : chaque `perm:` du menu existe-t-il ? ────────────────── */
{
  const vus = new Set();
  /* ⚠ DEUX FORMES DEPUIS LE 2026-09-14 (#106b) : `perm: 'staff'` et
     `perm: ['staff','newsletter']`. Le relevé ne lisait QUE la première — la
     forme à plusieurs jetons ne correspondait à rien, donc le banc la SAUTAIT
     en silence et son verdict restait vert. Une faute de frappe dans le tableau
     serait passée, et `permOk()` aurait ouvert l'entrée à tout le monde : très
     exactement la faute que cette étape existe pour attraper.
     ⚠ On relève d'abord le tableau ENTIER, puis chaque jeton qu'il contient. */
  const rxListe = /\bperm:\s*\[([^\]]*)\]/g;
  let mL;
  while ((mL = rxListe.exec(appbar))) {
    const rxJeton = /'([^']+)'/g;
    let mJ;
    while ((mJ = rxJeton.exec(mL[1]))) vus.add(mJ[1]);
  }
  const rx = /\bperm:\s*'([^']+)'/g;
  let m;
  while ((m = rx.exec(appbar))) vus.add(m[1]);
  for (const j of vus) {
    if (JETONS.has(j)) continue;
    fautes.push('le menu masque sur « ' + j + " », qui n'existe pas au modèle — "
      + 'une permission inconnue est traitée comme ACCORDÉE : l’entrée paraît pour tout le monde');
  }
}

/* ── 3. LA GARDE : chaque `_hp('…')` d'admin.js existe-t-il ? ─────────────── */
{
  const vus = new Set();
  const rx = /\b_hp\(\s*'([^']+)'/g;
  let m;
  while ((m = rx.exec(admin))) vus.add(m[1]);
  for (const j of vus) {
    if (JETONS.has(j)) continue;
    fautes.push('une garde exige « ' + j + " », qui n'existe pas au modèle — "
      + 'personne ne peut l’obtenir, donc cet écran refuse TOUJOURS');
  }
}

/* ── 4. LES RÔLES ne citent que des jetons existants ──────────────────────── */
{
  const b = /const\s+ROLES\s*=\s*\{([\s\S]*?)\n\s*\};/.exec(staff);
  if (b) {
    const rx = /'([a-z][\w-]*:[a-z]+)'/g;
    let m;
    const vus = new Set();
    while ((m = rx.exec(b[1]))) vus.add(m[1]);
    for (const j of vus) {
      if (JETONS.has(j)) continue;
      fautes.push('un rôle accorde « ' + j + " », qui n'existe pas au modèle — "
        + 'le droit ne sera jamais reconnu, et personne ne verra que le rôle est troué');
    }
  }
}

/* ── 5. CHAQUE MODULE PORTE SA DESCRIPTION ────────────────────────────────
   ⚠ Sa demande du 2026-09-13 : « avec infobulle pour la description des
   différentes sécurités ». Un module sans description laisse une case à cocher
   sans rien qui dise ce qu'elle ouvre — et une case qu'on coche sans savoir est
   la façon la plus ordinaire d'accorder trop. */
{
  for (const mod of MODULES.keys()) {
    const rx = new RegExp("'?" + mod.replace(/[-]/g, '\\-') + "'?\\s*:\\s*\\{[\\s\\S]{0,400}?desc\\s*:");
    if (!rx.test(bloc[1])) {
      fautes.push('le module « ' + mod + ' » n’a pas de `desc` — la case se coche '
        + 'sans que rien ne dise ce qu’elle ouvre');
    }
  }
}

/* ══ LE VERDICT ═════════════════════════════════════════════════════════════ */
console.log('\n== LES PERMISSIONS SE CORRESPONDENT-ELLES, DES TROIS CÔTÉS ? ==');
console.log('  ' + MODULES.size + ' module(s) au modèle · ' + JETONS.size + ' jeton(s)');

if (!fautes.length) {
  console.log('\n>>> modèle, masquage et garde parlent des mêmes permissions\n');
  process.exit(0);
}
console.log('\nECHEC  ' + fautes.length + ' désaccord(s) :');
for (const f of fautes) console.log('   — ' + f);
console.log('\n⚠ LE MODÈLE EST `PERMISSION_DEFS` (assets/js/staff.js). Le masquage est');
console.log('  `perm:` (appbar.js), la garde est `_hp(…)` (admin.js). Les trois');
console.log('  doivent nommer les mêmes jetons — sinon un droit existe à moitié.');
process.exit(1);
