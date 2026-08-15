'use strict';

/*
 * LE CADENAS EST-IL PARTOUT OÙ IL DOIT ÊTRE ? (#22)
 * =============================================================================
 * « Une règle qu'on répète et qu'on oublie n'est pas une règle : c'est un
 * vœu. » Celle-ci est donc vérifiée par une machine, comme l'accent grave.
 *
 * Ce qui a déclenché ce contrôle : la fiche client ouverte annonçait bien
 * « verrouillée par broubob », mais la LIGNE dans la liste ne montrait rien.
 * Corriger cette liste-là ne protège pas la prochaine.
 *
 *     node tools/verifier-cadenas.js
 *
 * Appelé aussi par verifier-fenetres.js, donc par le crochet de publication.
 */

const fs = require('fs');
const path = require('path');
const { LISTES, EXEMPTIONS } = require('./cadenas-declares.js');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');

function controlerCadenas(dire) {
  const lu = {};
  const lire = (f) => {
    if (!(f in lu)) {
      const p = path.join(DOSSIER, f);
      lu[f] = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
    }
    return lu[f];
  };

  // ── 1. Chaque liste déclarée pose-t-elle vraiment ses cadenas ? ───────────
  for (const [fichier, portees] of Object.entries(LISTES)) {
    const src = lire(fichier);
    if (src === null) { dire(false, fichier, 'déclaré dans cadenas-declares.js mais le fichier n’existe pas'); continue; }
    const manquantes = portees.filter((p) => {
      // On cherche l'appel avec la portée EXACTE : `szVerrouCase('users'`.
      const motif = new RegExp('szVerrouCase\\(\\s*[\'"]' + p + '[\'"]');
      return !motif.test(src);
    });
    // Poser la case sans lancer le sondage ne montre jamais rien : les deux
    // sont exigés ensemble, sinon on croit la chose faite.
    const sansSondage = !/szVerrousSuivre\s*\(/.test(src);
    const sansPeinture = !/szVerrousPeindre\s*\(/.test(src);
    if (manquantes.length) {
      dire(false, fichier, 'aucun szVerrouCase pour : ' + manquantes.join(', '));
    } else if (sansSondage) {
      dire(false, fichier, 'cadenas posés mais szVerrousSuivre absent — ils resteraient vides');
    } else if (sansPeinture) {
      dire(false, fichier, 'szVerrousPeindre absent — les cadenas disparaîtraient à chaque redessin');
    } else {
      dire(true, fichier, portees.join(', '));
    }
  }

  // ── 2. Toute portée VERROUILLÉE quelque part est-elle montrée quelque part ?
  // C'est le contrôle qui attrape le vrai piège : une fiche devient
  // verrouillable, et aucune liste ne le dit.
  const couvertes = new Set();
  Object.values(LISTES).forEach((ps) => ps.forEach((p) => couvertes.add(p)));

  const prises = new Map();   // portée → fichiers qui la prennent
  for (const f of fs.readdirSync(DOSSIER).filter((x) => x.endsWith('.js'))) {
    const src = lire(f);
    if (!src) continue;
    const re = /verrou:prendre['"]\s*,\s*\[?\s*['"]([a-z_]+)['"]/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      if (!prises.has(m[1])) prises.set(m[1], []);
      if (prises.get(m[1]).indexOf(f) < 0) prises.get(m[1]).push(f);
    }
  }

  const orphelines = [...prises.keys()].filter((p) => !couvertes.has(p));
  // Une portée peut être légitimement sans liste — mais il faut le DIRE, et
  // le dire à l'endroit où quelqu'un le relira : les exemptions.
  const nonJustifiees = orphelines.filter((p) => {
    const fichiers = prises.get(p) || [];
    return !fichiers.every((f) => EXEMPTIONS[f]);
  });

  if (nonJustifiees.length) {
    nonJustifiees.forEach((p) => {
      dire(false, 'portée ' + p, 'verrouillée par ' + (prises.get(p) || []).join(', ')
        + ' mais AUCUNE liste ne montre son cadenas — ajoutez-la à cadenas-declares.js '
        + '(ou justifiez l’exemption)');
    });
  } else {
    dire(true, 'couverture', prises.size + ' portée(s) verrouillée(s), toutes montrées ou justifiées');
  }
}

module.exports = { controlerCadenas };

// Exécution directe : petit rapport autonome.
if (require.main === module) {
  let fautes = 0;
  const dire = (ok, nom, texte) => {
    console.log('  ' + (ok ? 'OK  ' : 'NON ') + String(nom).padEnd(20) + (texte || ''));
    if (!ok) fautes++;
  };
  console.log('=== Cadenas sur les lignes des listes ===');
  controlerCadenas(dire);
  console.log(fautes ? '\n>>> ' + fautes + ' point(s) à corriger\n' : '\n>>> Tout est sain\n');
  process.exit(fautes ? 1 : 0);
}
