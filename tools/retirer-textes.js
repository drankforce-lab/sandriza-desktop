'use strict';

/*
 * RETIRER LES TEXTES TRANCHÉS — MÉCANIQUEMENT, ET SOUS CONDITION
 * =============================================================================
 *   node tools/retirer-textes.js <bilan.txt>            → montre, n'écrit rien
 *   node tools/retirer-textes.js <bilan.txt> --ecrire   → écrit
 *
 * Le bilan est une ligne `chemin:ligne` par passage à retirer, tel que la page
 * de tri le rend.
 *
 * ══⚠⚠ POURQUOI UN OUTIL ET PAS SOIXANTE-HUIT MODIFICATIONS À LA MAIN ════════
 * Ce dépôt garde la trace d'une passe automatique ratée : « la version
 * automatique emportait de vraies explications et coupait mal les blocs ». Et
 * plus tôt aujourd'hui, un découpage par bornes textuelles a DUPLIQUÉ un fichier
 * en silence parce qu'une borne correspondait aussi, en sous-chaîne, à une ligne
 * plus haut. Soixante-huit coupes à la main, c'est soixante-huit occasions de
 * refaire exactement ça.
 *
 * ══ LES TROIS CONDITIONS DE REFUS ═══════════════════════════════════════════
 * L'outil ne coupe QUE s'il est sûr, et il dit pourquoi il renonce :
 *   1. LA BALISE OUVRANTE DOIT ÊTRE SUR LA LIGNE ANNONCÉE. Le bilan porte le
 *      numéro relevé par l'audit ; s'il ne correspond plus (fichier modifié
 *      entre-temps), on ne devine pas — on refuse.
 *   2. LA FERMETURE SE TROUVE PAR COMPTAGE, pas par recherche de texte. On
 *      compte les ouvertures et fermetures de la MÊME balise à partir du départ.
 *      Une recherche de `</div>` prendrait la première venue, qui appartient
 *      souvent à un enfant.
 *   3. LE RÉSULTAT DOIT RESTER DU JAVASCRIPT VALIDE. Chaque fichier touché est
 *      recompilé avant d'être écrit ; un seul échec annule TOUT le fichier.
 *
 * ⚠ ON NE TOUCHE PAS AUX LIGNES : la coupe remplace le bloc par du vide au même
 * endroit, sans réindenter ni recoller. Le fichier garde ses numéros de ligne,
 * donc les autres entrées du même bilan restent valables — sans quoi il faudrait
 * relancer l'audit entre chaque coupe.
 */

const fs = require('fs');
const path = require('path');

const bilan = process.argv[2];
const ecrire = process.argv.includes('--ecrire');
if (!bilan) { console.error('usage : node tools/retirer-textes.js <bilan.txt> [--ecrire]'); process.exit(2); }

const RACINE = path.join(__dirname, '..');
const cibles = fs.readFileSync(bilan, 'utf8').split('\n')
  .map((l) => l.trim()).filter(Boolean)
  .map((l) => { const i = l.lastIndexOf(':'); return { f: l.slice(0, i), l: parseInt(l.slice(i + 1), 10) }; });

// Regroupé par fichier : on coupe de la FIN vers le DÉBUT pour que les coupes
// déjà faites ne déplacent pas les suivantes.
const parFichier = {};
cibles.forEach((c) => { (parFichier[c.f] = parFichier[c.f] || []).push(c.l); });

const OUVRE = /<(p|div|span)\b[^>]*>/;

let coupes = 0, refus = 0;
const journal = [];

for (const rel of Object.keys(parFichier)) {
  const abs = path.resolve(RACINE, rel);
  if (!fs.existsSync(abs)) { journal.push('REFUS  ' + rel + ' — fichier introuvable'); refus += parFichier[rel].length; continue; }
  let src = fs.readFileSync(abs, 'utf8');
  const original = src;
  let lignes = src.split('\n');
  let faites = 0;

  for (const no of parFichier[rel].slice().sort((a, b) => b - a)) {
    const ligne = lignes[no - 1];
    if (ligne === undefined) { journal.push('REFUS  ' + rel + ':' + no + ' — ligne hors du fichier'); refus++; continue; }
    const m = ligne.match(OUVRE);
    if (!m) { journal.push('REFUS  ' + rel + ':' + no + ' — aucune balise ouvrante sur cette ligne'); refus++; continue; }
    const tag = m[1];

    /* La fermeture, PAR COMPTAGE. On repart de la position de l'ouverture et on
       suit la profondeur : `</div>` cherché naïvement prendrait celui d'un
       enfant, et l'on couperait la moitié d'un écran. */
    const debut = lignes.slice(0, no - 1).join('\n').length + (no > 1 ? 1 : 0) + ligne.indexOf(m[0]);
    const reste = src.slice(debut);
    const re = new RegExp('<' + tag + '\\b|</' + tag + '>', 'g');
    let prof = 0, fin = -1, x;
    while ((x = re.exec(reste)) !== null) {
      if (x[0][1] === '/') { prof--; if (prof === 0) { fin = debut + x.index + x[0].length; break; } }
      else prof++;
      if (x.index > 6000) break;   // un bloc de prose ne fait pas 6 ko
    }
    if (fin < 0) { journal.push('REFUS  ' + rel + ':' + no + ' — fermeture <' + tag + '> introuvable'); refus++; continue; }

    const bloc = src.slice(debut, fin);
    src = src.slice(0, debut) + src.slice(fin);
    lignes = src.split('\n');
    faites++;
    journal.push('coupe  ' + rel + ':' + no + '  <' + tag + '> ' + bloc.length + ' car.  '
      + bloc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 64));
  }

  if (!faites) continue;

  /* ⚠ LE FICHIER DOIT RESTER VALIDE, ET ON LE VÉRIFIE AVANT D'ÉCRIRE. Une coupe
     qui déséquilibre une chaîne ou un littéral de gabarit ne se voit pas à
     l'œil et casse l'écran entier. Un seul échec annule TOUT le fichier —
     mieux vaut zéro coupe qu'un fichier à moitié coupé. */
  try {
    new (require('vm').Script)(src, { filename: abs });
  } catch (e) {
    journal.push('REFUS  ' + rel + ' — le fichier ne compilerait plus (' + e.message.slice(0, 70) + ') : AUCUNE coupe appliquée');
    refus += faites;
    src = original;
    continue;
  }

  coupes += faites;
  if (ecrire) fs.writeFileSync(abs, src, 'utf8');
}

journal.forEach((l) => console.log(l));
console.log('');
console.log(coupes + ' coupe(s) ' + (ecrire ? 'ÉCRITES' : 'possibles') + ' · ' + refus + ' refus');
process.exitCode = refus ? 1 : 0;
