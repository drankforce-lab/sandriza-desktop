#!/usr/bin/env node
'use strict';

/*
 * UN COMMENTAIRE DESINDENTE FERME UN BLOC `run: |` — ET LE WORKFLOW NE PART PLUS
 * =============================================================================
 * ⚠⚠⚠ CE BANC EXISTE PARCE QUE LA PANNE ETAIT TOTALEMENT SILENCIEUSE ICI ET
 * BRUYANTE CHEZ LUI. Dans un litteral de bloc YAML (`run: |`), une ligne MOINS
 * indentee que le contenu TERMINE le bloc. Un commentaire d explication pose a
 * 6 espaces au milieu d une liste de commandes indentee a 10 ferme donc le
 * script, et la commande suivante devient une cle YAML invalide.
 *
 * ⚠ CE QUE GITHUB EN FAIT : il cree une execution EN ECHEC a chaque push, en
 * « 0s », avec pour seule explication « This run likely failed because of a
 * workflow file issue ». Aucun banc local ne le voyait — ils lisent tous du
 * JavaScript — et `tools/bancs.js` LIT pourtant ce fichier pour sa liste : il
 * en tirait les bons noms de bancs, donc tout paraissait normal.
 * ➡ Resultat : douze pushes verts en local, douze courriels d echec, et c est
 * LUI qui a demande si c etait normal.
 *
 * ⚠⚠ LA LECON GENERALE : un fichier qu on ECRIT ici mais qu on n EXECUTE que
 * la-bas n a aucun garde par defaut. `build.yml` decrit tous les controles du
 * depot — il n en avait aucun sur lui-meme.
 *
 * ══ CE QU IL VERIFIE ════════════════════════════════════════════════════════
 * Pour chaque bloc `run: |` (ou `run: >`), toute ligne non vide DOIT etre au
 * moins aussi indentee que la premiere ligne du bloc, jusqu a la fin du bloc.
 * Une ligne moins indentee ferme le bloc : si du contenu du bloc la SUIT, le
 * fichier est invalide.
 *
 * ⚠ UN COMMENTAIRE D EXPLICATION RESTE LE BIENVENU — il doit simplement etre
 * DANS le bloc, a l indentation du contenu. `#` y est un commentaire de SHELL :
 * il se lit aussi bien et ne casse rien.
 *
 *   node tools/banc-workflow-yaml.js
 */

const fs = require('fs');
const path = require('path');

const DOS = path.join(__dirname, '..', '.github', 'workflows');

const indentDe = (l) => (l.match(/^ */) || [''])[0].length;

let fautes = 0, blocs = 0, fichiers = 0;

for (const f of fs.readdirSync(DOS).filter((x) => /\.ya?ml$/.test(x)).sort()) {
  const lignes = fs.readFileSync(path.join(DOS, f), 'utf8').split(/\r?\n/);
  fichiers++;

  for (let i = 0; i < lignes.length; i++) {
    /* Un bloc litteral : `run: |`, `run: >`, avec ou sans indicateur (`|-`). */
    if (!/^\s*(?:run|if|script)\s*:\s*[|>][-+]?\s*$/.test(lignes[i])) continue;
    const indentCle = indentDe(lignes[i]);

    /* La premiere ligne NON VIDE donne l indentation du bloc. */
    let j = i + 1;
    while (j < lignes.length && !lignes[j].trim()) j++;
    if (j >= lignes.length) continue;
    const indentBloc = indentDe(lignes[j]);
    if (indentBloc <= indentCle) continue;   // bloc vide : rien a garder
    blocs++;

    /* ⚠⚠ LA REGLE EXACTE, ET MA PREMIERE VERSION L AVAIT RATEE : le bloc se
       termine a la PREMIERE ligne non vide moins indentee que son contenu.
       Tout ce qui suit appartient au document, pas au bloc — accuser ces
       lignes-la revenait a accuser le reste du fichier (ma premiere version en
       a signale une centaine, toutes justes).
       ➡ LA FAUTE EST AILLEURS : c est quand du CONTENU DU BLOC REPARAIT apres
       cette fermeture, sans qu une vraie cle YAML soit passee entre-temps. Le
       bloc etait ferme ; cette ligne-la n est plus du shell, c est une cle
       invalide, et GitHub refuse tout le fichier. */
    /* ⚠ ON REPETE LE CYCLE : un meme bloc peut etre coupe PLUSIEURS FOIS. Ma
       premiere version s arretait a la premiere coupure et declarait le reste
       « hors bloc » — elle n en voyait donc qu une sur quatre. Un banc qui
       annonce UN probleme la ou il y en a quatre fait corriger un quart. */
    let depart = j;
    for (;;) {
      let fin = depart;
      for (; fin < lignes.length; fin++) {
        if (lignes[fin].trim() && indentDe(lignes[fin]) < indentBloc) break;
      }
      /* Apres la fermeture : on saute les lignes vides et les COMMENTAIRES. Si
         le contenu du bloc repart, ces commentaires l ont coupe en deux. */
      let k = fin;
      const coupables = [];
      while (k < lignes.length) {
        const l = lignes[k];
        if (!l.trim()) { k++; continue; }
        if (/^\s*#/.test(l)) { coupables.push({ n: k, i: indentDe(l), t: l }); k++; continue; }
        break;
      }
      if (!(k < lignes.length && coupables.length && indentDe(lignes[k]) >= indentBloc)) break;
      for (const s of coupables) {
        fautes++;
        console.log('  NON  .github/workflows/' + f + ':' + (s.n + 1)
          + ' — commentaire a ' + s.i + ' espaces AU MILIEU d un bloc indente a ' + indentBloc);
        console.log('       ' + s.t.trim().slice(0, 92));
      }
      console.log('       ↳ le bloc reprend ligne ' + (k + 1) + ' : ' + lignes[k].trim().slice(0, 72));
      console.log('');
      depart = k;
    }
    i = j;   // on repart apres l en-tete du bloc, sans le re-examiner
  }
}

console.log('');
console.log('== LES WORKFLOWS SE LISENT-ILS ? ==');
console.log('  ' + fichiers + ' fichier(s) · ' + blocs + ' bloc(s) `run: |` examine(s)');
console.log('');

/* ⚠ UN BANC QUI NE TROUVE AUCUN BLOC NE DOIT PAS SE TAIRE. */
if (blocs < 1) {
  console.log('  NON  aucun bloc `run: |` trouve — le motif de lecture ne marche plus.');
  process.exit(1);
}

if (fautes) {
  console.log('>>> ' + fautes + ' ligne(s) FERMENT un bloc `run: |` avant sa fin.');
  console.log('    GitHub refusera le fichier et creera une execution EN ECHEC a');
  console.log('    chaque push, en « 0s », sans autre explication que');
  console.log('    « This run likely failed because of a workflow file issue ».');
  console.log('    ➡ Remettre ces lignes A L INDENTATION DU BLOC : dans un `run:`,');
  console.log('      `#` est un commentaire de SHELL, il se lit aussi bien.');
  process.exit(1);
}
console.log('>>> aucun bloc `run: |` n est ferme avant sa fin');
