#!/usr/bin/env node
'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   UN MESSAGE NE S'ÉCRIT PAS À DEUX ENDROITS
   ──────────────────────────────────────────────────────────────────────────
   Signalé le 2026-09-05, sur « Mon profil » : « les messages d'erreur
   apparaissent en double et surtout déforment la fenêtre ».

   La cause tenait en une ligne, et elle était dans DEUX fenêtres :

       ferr('p-err', expliquer(r)); dire('Échec : ' + expliquer(r), 'err');

   La MÊME phrase dans l'encadré rouge du panneau ET dans la ligne du pied.
   Dans « Sécurité », c'était même TROIS fois : l'éditeur est une surcouche, et
   `szDire` y recopie aussi son message (voir szDireSurcouche dans socle.js).

   ⚠⚠ CE QUE CE BANC NE FAIT PAS, ET C'EST VOULU : il ne refuse pas qu'un
   encadré et un `dire` cohabitent dans le même bloc. C'est le cas NORMAL et
   utile — on vide l'encadré puis on annonce l'attente :
       ferr('p-err', '');  dire('Vérification…');
   Une règle de simple cohabitation aurait été rouge sur ce cas légitime, donc
   contournée, donc inutile.

   ⚠ CE QU'IL REFUSE : que la MÊME EXPRESSION soit passée aux deux. C'est ça
   qu'on lit deux fois, et rien d'autre. `expliquer(r)` dans l'encadré et
   `expliquer(r)` dans le pied : refusé. Deux textes différents : accepté.

   ⚠ ET IL TROUVE LES ENCADRÉS TOUT SEUL. Aucune liste de noms de fonctions à
   tenir à jour : est « encadré » toute fonction locale dont le corps pose un
   `.textContent` sur un élément dont l'identifiant parle d'erreur. Une fenêtre
   écrite demain sera gardée sans que personne y pense — c'est la leçon des
   listes `SOMBRE` du banc de contraste, qui écartaient en silence la moitié de
   ce qu'elles prétendaient mesurer.
   ══════════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');

/* Les commentaires cachent des exemples de code (celui-ci en contient un !).
   On les blanchit avant d'analyser, sinon le banc s'accuse lui-même. */
function sansCommentaires(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));
}

/* Les arguments d'un appel, découpés au premier niveau de parenthèses. */
function args(src, i) {
  let d = 0, deb = -1, out = [], cur = '';
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '(') { d++; if (d === 1) { deb = i + 1; continue; } }
    else if (c === ')') { d--; if (d === 0) { out.push(cur); return { args: out, fin: i }; } }
    else if (c === ',' && d === 1) { out.push(cur); cur = ''; continue; }
    if (deb >= 0) cur += c;
  }
  return { args: null, fin: src.length };
}

function appels(src, nom) {
  /* ⚠ PAS DE REGEXP CONSTRUITE À LA MAIN ICI. Une classe de caractères montée
     par concaténation de chaînes se fait manger ses barres obliques inverses au
     premier passage par un outil qui interprète les échappements — c'est arrivé
     trois fois en écrivant ce fichier. Un balayage explicite ne peut pas mentir. */
  const motDeb = (c) => /[A-Za-z0-9_$.]/.test(c);
  const out = [];
  let i = 0;
  while ((i = src.indexOf(nom, i)) >= 0) {
    const avant = i > 0 ? src[i - 1] : ' ';
    let j = i + nom.length;
    while (j < src.length && (src[j] === ' ' || src[j] === '\n' || src[j] === '\r' || src[j] === '\t')) j++;
    if (!motDeb(avant) && src[j] === '(') {
      const a = args(src, j);
      if (a.args) out.push({ pos: j, args: a.args.map((s) => s.trim()) });
    }
    i += nom.length;
  }
  return out;
}

/* L'identifiant du bloc `{...}` qui contient une position — deux appels du même
   bloc parlent du même moment ; deux appels de branches différentes, non. */
function blocs(src) {
  const pile = [], fin = [];
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') pile.push(i);
    else if (src[i] === '}') { const d = pile.pop(); if (d != null) fin.push([d, i]); }
  }
  return (pos) => {
    let meilleur = -1, taille = Infinity;
    for (const [d, f] of fin) if (pos > d && pos < f && f - d < taille) { taille = f - d; meilleur = d; }
    return meilleur;
  };
}

const fichiers = fs.readdirSync(DOSSIER).filter((f) => f.endsWith('.js')).sort();
const fautes = [];
let lus = 0, encadresVus = 0;

for (const f of fichiers) {
  const brut = fs.readFileSync(path.join(DOSSIER, f), 'utf8');
  const src = sansCommentaires(brut);
  lus++;

  /* Les fonctions « encadré » de CE fichier. */
  const encadres = [];
  const reFn = /function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = reFn.exec(src))) {
    const a = args(src, src.indexOf('(', m.index));
    let i = a.fin, d = 0, deb = -1;
    for (; i < src.length; i++) {
      if (src[i] === '{') { d++; if (d === 1) deb = i; }
      else if (src[i] === '}') { d--; if (d === 0) break; }
    }
    if (deb < 0) continue;
    const corps = src.slice(deb, i);
    /* ⚠⚠ CETTE RÈGLE A DÛ ÊTRE ÉLARGIE, ET C'EST LA PANNE PROVOQUÉE QUI L'A DIT.
       La première version exigeait un identifiant écrit en toutes lettres
       (`getElementById('u-err')`). Or l'encadré de « Mon profil » — CELUI par
       lequel le défaut a été signalé — reçoit son identifiant en paramètre :
       `getElementById(id)`. Le banc était vert sur la faute qu'il existait pour
       attraper. On accepte donc aussi le NOM de la fonction comme indice.
       ⚠ Un banc qu'on n'a jamais vu rouge ne prouve rien. */
    const posePhrase = /\.textContent\s*=/.test(corps)
      && /getElementById|querySelector/.test(corps);
    const parleDErreur = /getElementById\s*\(\s*['"`][^'"`]*err/i.test(corps)
      || /err|msg|message|avert/i.test(m[1]);
    if (posePhrase && parleDErreur) encadres.push(m[1]);
  }
  if (!encadres.length) continue;
  encadresVus += encadres.length;

  const bloc = blocs(src);
  const lignes = (p) => src.slice(0, p).split('\n').length;
  const dires = appels(src, 'dire').concat(appels(src, 'szDire'));

  for (const nom of encadres) {
    for (const ap of appels(src, nom)) {
      for (const texte of ap.args) {
        /* Une chaîne vide ou un simple identifiant d'élément ne se « lit » pas
           deux fois : on ne compare que ce qui porte une vraie phrase. */
        if (!texte || /^['"`]\s*['"`]$/.test(texte) || texte.length < 6) continue;
        if (/^['"`][^'"`]*['"`]$/.test(texte) && texte.length < 12) continue;
        for (const dr of dires) {
          if (bloc(dr.pos) !== bloc(ap.pos)) continue;
          const dit = (dr.args[0] || '');
          if (dit.indexOf(texte) < 0) continue;
          fautes.push({ f, ligne: lignes(ap.pos), nom, texte, dit: dit.trim() });
        }
      }
    }
  }
}

console.log('Un message ne s\'écrit pas à deux endroits — ' + lus + ' fenêtre(s) lue(s), '
  + encadresVus + ' encadré(s) d\'erreur trouvé(s)');

if (!fautes.length) {
  console.log('  OK  aucun message écrit à la fois dans un encadré et dans la ligne du pied');
  process.exit(0);
}
for (const x of fautes) {
  console.log('   ✗ ' + x.f + ':' + x.ligne + ' — ' + x.nom + '(… ' + x.texte + ' …) et dire(' + x.dit + ')');
  console.log('     la même phrase est écrite deux fois. L\'encadré la garde et s\'annonce (role="alert") ;');
  console.log('     la ligne du pied s\'efface au bout de cinq secondes. Laisser l\'encadré, retirer le dire.');
}
process.exit(1);
