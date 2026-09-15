#!/usr/bin/env node
'use strict';

/*
 * BANC — UN MODULE OUVRABLE OUVRE-T-IL VRAIMENT QUELQUE CHOSE ?
 * =============================================================================
 *   node tools/banc-modules-ouvrables.js
 *
 * ⚠⚠⚠ POURQUOI CE BANC EXISTE — LE MÊME DÉFAUT SIGNALÉ DEUX FOIS.
 * Le bouton « Corbeille » de la fenêtre Commandes ne faisait RIEN. Il me l'avait
 * dit une première fois (« le menu corbeille ne marche pas ») : j'avais alors
 * déplacé le déclencheur — du menu vers un bouton — SANS JAMAIS SUIVRE LE CHEMIN
 * JUSQU'AU BOUT. On ne répare pas un bouton muet en changeant l'endroit où l'on
 * appuie. Il a fallu qu'il le signale une seconde fois.
 *
 * ── LA CAUSE, ET POURQUOI ELLE EST INVISIBLE ────────────────────────────────
 * `actionApp` a deux familles de destinations :
 *   · les écrans ANCRABLES — ils envoient `dock:naviguer <nom>` au SITE, qui
 *     doit posséder une section de ce nom pour poser la vue ;
 *   · les fenêtres À PART (`verrous`, `presence`, `corbeille`…) — nées natives,
 *     SANS jumeau web : elles s'ouvrent par `ouvrirNative`.
 * Ranger une fenêtre à part dans la première famille ne lève RIEN. Le message
 * part, le site ne trouve pas la section, et il ne se passe rien — pas d'erreur,
 * pas de fenêtre, pas un mot. Le bouton a l'air cassé ; le code a l'air juste.
 *
 * ── CE QUE CE BANC MESURE ───────────────────────────────────────────────────
 * Pour CHAQUE nom de `_MODULES_OUVRABLES` (la liste blanche que traverse le
 * pont), il exige l'une ou l'autre de ces deux choses, jamais aucune :
 *   1. un `case` qui appelle `ouvrirNative` — la fenêtre à part ; OU
 *   2. une section hôte déclarée côté SITE (`_DOCKABLES` dans admin.js) — sans
 *      quoi `dock:naviguer` parle dans le vide.
 *
 * ⚠ IL A BESOIN DES DEUX DÉPÔTS, et c'est le fond du sujet : la moitié de la
 * réponse est ici, l'autre est dans le site. C'est exactement pour ça que
 * personne ne voyait le trou. Sans le site, il sort 2 et le DIT.
 *
 * ⚠ CE QU'IL NE VOIT PAS : que la fenêtre s'ouvre pour de vrai. Aucun banc de ce
 * poste n'ouvre Electron. Il garde le CHEMIN, pas le résultat.
 */

const fs = require('fs');
const path = require('path');

const racine = path.join(__dirname, '..');
let dur = 0;
const dit = (ok, quoi) => {
  console.log((ok ? '  OK   ' : '  NON  ') + quoi);
  if (!ok) dur = 1;
};

const main = fs.readFileSync(path.join(racine, 'src', 'main.js'), 'utf8');

// ── La liste blanche du pont ────────────────────────────────────────────────
const mListe = main.match(/const _MODULES_OUVRABLES\s*=\s*\[([^\]]*)\]/);
if (!mListe) {
  console.error('\n  NON  `_MODULES_OUVRABLES` introuvable dans main.js — ce banc n’a rien vérifié\n');
  process.exit(1);
}
const modules = (mListe[1].match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1));

console.log('\n=== Les modules ouvrables mènent-ils quelque part ? ===\n');
dit(modules.length > 0, modules.length + ' module(s) déclaré(s) ouvrable(s) par le pont');

/* Le corps de `actionApp`, découpé en `case` : on cherche, pour un nom donné,
   si SON case (ou le bloc qu'il partage) appelle `ouvrirNative`.
   ⚠ ON NE CHERCHE PAS « ouvrirNative existe quelque part dans le fichier » : ce
   serait vrai pour tout le monde et ne mesurerait rien. On coupe au `case`
   suivant, pour ne lire que le bloc réellement atteint. */
const iAction = main.indexOf('const actionApp = (nom, arg)');
const corpsAction = iAction >= 0 ? main.slice(iAction) : '';
const ouvreEnNatif = (nom) => {
  const re = new RegExp("case\\s*'" + nom + "'\\s*:", 'g');
  let m;
  while ((m = re.exec(corpsAction))) {
    const apres = corpsAction.slice(m.index);
    // Jusqu'au prochain `case` qui n'est PAS collé au nôtre (les `case`
    // consécutifs partagent un bloc : on les traverse).
    const suite = apres.replace(/^case\s*'[^']+'\s*:\s*/, '');
    const fin = suite.search(/\n\s{4}case\s+'/);
    const bloc = fin > 0 ? suite.slice(0, fin) : suite.slice(0, 1500);
    if (/ouvrirNative\s*\(/.test(bloc)) return true;
  }
  return false;
};

// ── L'autre moitié : les sections hôtes du SITE ─────────────────────────────
const site = process.env.SZ_SITE || path.join(racine, '..', 'Sandriza');
const adminJs = path.join(site, 'assets', 'js', 'admin.js');
let hotes = null;
if (fs.existsSync(adminJs)) {
  const admin = fs.readFileSync(adminJs, 'utf8');
  const mD = admin.match(/const _DOCKABLES\s*=\s*\{([\s\S]*?)\n\s*\};/);
  /* ⚠⚠ ON RETIRE LES COMMENTAIRES AVANT DE LIRE LES CHAÎNES, et ce n'est pas du
     zèle : ce banc s'est trompé la première fois qu'il a tourné. Les
     commentaires de ce dépôt sont en FRANÇAIS, donc pleins d'apostrophes — et
     une apostrophe est un guillemet simple. « n'existe » ouvrait une chaîne qui
     se refermait au guillemet suivant, avalant tout un pan de la table : le banc
     annonçait `securite` introuvable alors qu'il est là, deux lignes plus bas.
     ⚠ C'est la même leçon que le filet à secrets, qui a dû passer au tokeniseur
     de PHP : une expression régulière sur des guillemets ne sait pas ce qu'est
     un commentaire, et se trompe précisément là où le texte est le plus bavard. */
  const sansCommentaires = (s) => String(s)
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  hotes = mD ? (sansCommentaires(mD[1]).match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1)) : [];
}

if (hotes === null) {
  console.log('\n  --   site introuvable — la moitié « section hôte » n’a PAS été vérifiée\n');
  process.exit(2);
}
dit(hotes.length > 0, hotes.length + ' section(s) hôte(s) déclarée(s) côté site');

console.log('');
for (const nom of modules) {
  const natif = ouvreEnNatif(nom);
  const hote = hotes.indexOf(nom) >= 0;
  /* ⚠ LES DEUX À LA FOIS N'EST PAS UNE FAUTE : un écran peut avoir sa fenêtre
     ET sa section hôte (on le veut pour ceux qu'on ancre). Ce qui est une faute,
     c'est AUCUN DES DEUX — le message part, personne ne l'attend, rien n'arrive. */
  dit(natif || hote,
    nom + ' : ' + (natif ? 'fenêtre native' : '') + (natif && hote ? ' + ' : '')
      + (hote ? 'section hôte du site' : '')
      + (!natif && !hote ? 'AUCUN DES DEUX — le bouton serait MUET' : ''));
}

/* ⚠ TÉMOIN. Un banc qui n'affirme que des choses vraies ne prouve pas qu'il sait
   distinguer : on lui donne un nom qui n'existe nulle part et l'on exige qu'il
   le refuse. Sans lui, un `ouvreEnNatif` cassé qui rendrait toujours `true`
   passerait au vert sur toute la liste. */
console.log('');
if (ouvreEnNatif('module-qui-nexiste-pas-du-tout') || hotes.indexOf('module-qui-nexiste-pas-du-tout') >= 0) {
  console.log('  NON  TÉMOIN : un nom inventé est reconnu — la mesure ne distingue rien');
  dur = 1;
} else {
  console.log('  OK   ⚠ TÉMOIN : un nom inventé n’est reconnu ni comme fenêtre ni comme section');
}

console.log('');
if (dur) {
  console.log('>>> un module ouvrable ne mène nulle part — son bouton serait MUET\n');
  process.exit(1);
}
console.log('>>> les ' + modules.length + ' modules ouvrables mènent tous à une fenêtre ou à une section hôte\n');
process.exit(0);
