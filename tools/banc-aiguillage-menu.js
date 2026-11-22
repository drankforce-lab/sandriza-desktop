'use strict';
/*
 * L'AIGUILLAGE DU MENU — CHAQUE ENTRÉE ARRIVE-T-ELLE CHEZ ELLE ? (2026-11-22)
 * =============================================================================
 * Sa remarque : « gros bug : quand on clique sur Tableau de bord, ça ouvre les attributs de vêtement ».
 * Les cas « attr-… » (Configuration › Produit) avaient été posés AU MILIEU de la longue liste de `case` qui
 * tombent les uns dans les autres jusqu'au flux d'ancrage (tableau, inventaire, commandes, produits, factures…).
 * Un `case` suivi d'un corps capture TOUS les `case` qui le précèdent sans `break` : douze écrans ouvraient les
 * attributs, de la 9.1.4 à la 9.1.6, et aucun banc ne regardait OÙ une entrée aboutit.
 *
 * Ce banc lit le `switch` de main.js comme le ferait JavaScript : pour chaque clé, il saute les autres `case` et
 * les commentaires jusqu'à la première instruction, et exige que les écrans ancrables aboutissent tous au MÊME
 * corps (celui du flux d'ancrage), et que les clés à fenêtre propre aboutissent au leur. Puis il provoque la
 * panne d'origine sur une copie et vérifie qu'il la voit.
 */
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');

// Les écrans qui passent par le flux d'ancrage (le groupe commun) et ceux qui ont leur propre corps.
const ANCRABLES = ['expeditions', 'caisse', 'ramassages', 'tableau', 'inventaire', 'commandes', 'produits', 'factures',
  'clients', 'collections', 'fournisseurs', 'retours', 'codesbarres', 'avis', 'messagerie', 'archives', 'paiements',
  'cartescadeaux', 'coupons', 'promotions', 'chat', 'sociaux', 'fidelisation', 'liquidation', 'catalogio', 'invmeta',
  'newsletter', 'campagnes'];
const PROPRES = { 'attr-sizes': 'pageInvMeta', 'attr-reachat': 'pageInvMeta', 'messagerie-config': "pageMessagerie('config')" };

/* Rend, pour une clé, la première ligne d'instruction atteinte depuis son `case` (null si la clé est absente). */
function aboutit(src, cle) {
  const lignes = src.split(/\r?\n/);
  const marque = "case '" + cle + "':";
  let i = lignes.findIndex((l) => l.includes(marque));
  if (i < 0) return null;
  // Le reste de la ligne après ce case : d'autres case, ou déjà une instruction.
  let reste = lignes[i].slice(lignes[i].indexOf(marque) + marque.length);
  let enComm = false;
  for (;;) {
    let t = reste.replace(/\/\/.*$/, '').trim();
    if (enComm) { const f = t.indexOf('*/'); if (f < 0) t = ''; else { t = t.slice(f + 2).trim(); enComm = false; } }
    while (t.startsWith('/*')) { const f = t.indexOf('*/'); if (f < 0) { enComm = true; t = ''; break; } t = t.slice(f + 2).trim(); }
    t = t.replace(/^(case\s+'[^']*':\s*)+/, '').trim();
    if (t && t !== '{') return { ligne: i + 1, texte: t };
    if (t === '{') { i++; reste = lignes[i]; continue; }
    i++; if (i >= lignes.length) return null; reste = lignes[i];
  }
}

function verifier(src) {
  const fautes = [];
  const ref = aboutit(src, 'campagnes');
  if (!ref) return ['la clé « campagnes » est introuvable dans main.js'];
  ANCRABLES.forEach((k) => {
    const a = aboutit(src, k);
    if (!a) fautes.push('« ' + k + ' » : aucun case trouvé');
    else if (a.ligne !== ref.ligne) fautes.push('« ' + k + ' » aboutit l. ' + a.ligne + ' (' + a.texte.slice(0, 70) + ') au lieu du flux d’ancrage l. ' + ref.ligne);
  });
  Object.keys(PROPRES).forEach((k) => {
    const a = aboutit(src, k);
    if (!a) fautes.push('« ' + k + ' » : aucun case trouvé');
    else {
      // Le corps propre peut tenir sur quelques lignes : on regarde les trois suivantes.
      const l = src.split(/\r?\n/).slice(a.ligne - 1, a.ligne + 2).join(' ');
      if (!l.includes(PROPRES[k])) fautes.push('« ' + k + ' » n’ouvre pas ' + PROPRES[k] + ' (l. ' + a.ligne + ')');
    }
  });
  return fautes;
}

let echec = false;
const vraies = verifier(SRC);
if (vraies.length) { echec = true; console.log('✗ L’AIGUILLAGE DU MENU EST FAUX :'); vraies.forEach((f) => console.log('   ' + f)); }
else console.log('✓ ' + ANCRABLES.length + ' écrans ancrables aboutissent au flux d’ancrage ; ' + Object.keys(PROPRES).length + ' clés à fenêtre propre ouvrent la leur.');

// La panne d'origine, provoquée : un corps « attr-… » glissé au milieu du groupe doit être vu.
const panne = SRC.replace("    case 'catalogio':\n", "    case 'catalogio':\n    case 'attr-zzz': { ouvrirNative('x'); break; }\n")
  .replace("    case 'catalogio':\r\n", "    case 'catalogio':\r\n    case 'attr-zzz': { ouvrirNative('x'); break; }\r\n");
if (panne === SRC) { echec = true; console.log('✗ la panne provoquée n’a pas pu être posée (« case \'catalogio\': » introuvable)'); }
else if (!verifier(panne).length) { echec = true; console.log('✗ la panne provoquée (un corps au milieu du groupe) N’EST PAS VUE'); }
else console.log('✓ la panne provoquée (un corps au milieu du groupe) est vue.');

process.exit(echec ? 1 : 0);
