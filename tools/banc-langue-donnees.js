#!/usr/bin/env node
'use strict';

/*
 * LA TRADUCTION NE TOUCHE QUE CE QU ON LIT — JAMAIS CE QUI EST ECRIT
 * =============================================================================
 * ⚠⚠⚠ SA CONSIGNE DU 2026-09-12, mot pour mot : « la traduction doit affecter
 * que la lecture et non pas les données enregistrées — autrement dit une donnée
 * écrite en français ne doit pas être altérée. »
 *
 * ⚠ POURQUOI CE BANC EXISTE PLUTOT QU UNE LIGNE DE PLUS DANS UNE FICHE. Cette
 * faute-là est SILENCIEUSE et DIFFEREE : rien ne casse quand on la commet. Elle
 * se découvre des semaines après, quand une fiche ne répond plus à son nom ou
 * qu un filtre ne trouve plus rien — et la donnée fausse est DEJA enregistrée.
 * On ne la retrouve pas en relisant le code : il faudrait relire la base. Une
 * consigne se re-trompe (« accent grave » l a prouvé trois fois) ; une mesure non.
 *
 * ══ CE QU IL PROTEGE, ET COMMENT IL LE RECONNAIT ════════════════════════════
 * Une chaine est PROTEGEE — donc interdite de traduction — des qu elle atteint
 * un chemin d ecriture :
 *   1. `value="…"` dans le gabarit : la valeur d une option ou d un champ
 *      pre-rempli. C est ELLE qui part dans la base, pas le libelle.
 *   2. `.value = '…'` dans le script : meme chose, pose a l execution.
 *   3. un argument d une operation d ECRITURE (`:ecrire`, `:enregistrer`,
 *      `:creer`, `:poser`, `:modifier`, `:ajouter`, `:envoyer`) : ce texte part
 *      au serveur et sera relu par quelqu un d autre, peut-etre en francais.
 *
 * Si une chaine protegee a une entree de dictionnaire, le banc REFUSE.
 *
 * ⚠ CE QU IL NE VOIT PAS, ecrit ici plutot que decouvert :
 *   · une valeur assemblee a l execution a partir de morceaux ;
 *   · une chaine qui passe par une variable avant d etre ecrite.
 * Il attrape la forme DIRECTE, qui est de loin la plus frequente — et la seule
 * qu on ecrit sans y penser en traduisant vite.
 *
 *   node tools/banc-langue-donnees.js
 */

const fs = require('fs');
const path = require('path');
const LANGUE = require('../src/langue');
const { donneesDeclarees, RE_SZ_DONNEES } = require('./textes-visibles.js');

const DOS = path.join(__dirname, '..', 'src', 'fenetres');

/* ⚠ Les commentaires d abord retires : cette fiche-ci, comme celles des autres
   bancs, NOMME les motifs interdits pour expliquer pourquoi ils le sont. */
const nu = (s) => s
  /* ⚠ LA BORNE DU `/*` : voir `tools/textes-visibles.js`. Un `/*` colle a une
     lettre (`accept="image/*"`) n ouvre pas un commentaire. */
  .replace(/(^|[\s;{}(),=])\/\*[\s\S]*?\*\//g, (m, p) => p + m.slice(p.length).replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));

const ECRITURE = /:(ecrire|enregistrer|creer|poser|modifier|ajouter|envoyer|sauver|appliquer)\b/i;

/* Les chaines qui atteignent un chemin d ecriture, dans UN fichier de fenetre. */
const protegees = (src) => {
  const s = nu(src);
  const out = new Map();          // texte -> pourquoi
  const noter = (t, pourquoi) => {
    const v = String(t || '').trim();
    if (v.length < 2) return;
    if (!out.has(v)) out.set(v, pourquoi);
  };

  /* 1. `value="…"` du gabarit. ⚠ On ecarte `value="${…}"` : c est une donnee
        qui vient deja des reponses, pas un texte ecrit ici. */
  let m;
  /* ⚠⚠ UNE VALEUR LITTÉRALE, PAS UN MORCEAU DE CONCATÉNATION. Dans ces gabarits,
     `'<input value="' + esc(v) + '">'` fait que `value="` est suivi de
     `' + esc(v) + '` — et ma première version ramassait ça comme une valeur. 504
     « chaînes protégées » dont pas une n’en était : le banc était vert parce qu’il
     regardait à côté. Une valeur écrite en dur ne contient ni quote, ni +, ni (.
     ⚠ C’est la même famille que l’appariement de guillemets faussé par une
     longueur minimale : ce qui RESSEMBLE à une chaîne n’en est pas une. */
  const rv = /value\s*=\s*"([^"'+(){}$<>\\n]{2,120})"/g;
  while ((m = rv.exec(s))) noter(m[1], 'value="…" du gabarit — cette valeur part dans la base');

  /* 2. `.value = '…'` du script. */
  const rv2 = /\.value\s*=\s*'([^'\\n]{2,120})'/g;
  while ((m = rv2.exec(s))) noter(m[1], '.value = \'…\' — pose dans un champ, donc enregistrable');

  /* 3. Les arguments litteraux d une operation d ECRITURE. On prend la fin de
        l appel jusqu a la parenthese fermante de la ligne : assez pour les
        formes directes, et sans pretendre analyser le JavaScript. */
  const ra = /appeler\(\s*'([a-zA-Z]+:[a-zA-Z0-9_]+)'([^\n]*)/g;
  while ((m = ra.exec(s))) {
    if (!ECRITURE.test(m[1])) continue;
    const args = m[2];
    let a; const rl = /'([^'\\n]{2,120})'/g;
    while ((a = rl.exec(args))) noter(a[1], 'argument de ' + m[1] + ' — ce texte part au serveur');
  }

  /* 4. LES DONNEES PAR DEFAUT DECLAREES (2026-09-13). C est l angle mort que
        l en-tete de ce banc nommait lui-meme — « une chaine qui passe par une
        variable avant d etre ecrite ». Une valeur par defaut (le titre d une
        page FAQ, le nom et les en-tetes d un guide des tailles) n est ni un
        `value="…"` ni un argument direct : elle est posee dans un objet, puis
        envoyee bien plus loin. Elle ne se devine pas — elle se DECLARE, dans un
        bloc `var SZ_DONNEES = { … };` de la fenetre.
        ⚠⚠ MAIS ON NE REFUSE QUE CE QUI EST *SEULEMENT* UNE DONNEE, et il a fallu
        le decouvrir tout de suite : dans `pages`, « Taille » est l en-tete par
        defaut d un guide (donnee) ET le libelle du selecteur de taille du texte
        dans la barre de l editeur (interface). La meme chaine, deux roles. Une
        accusation ferme aurait demande de laisser un libelle en francais sur la
        page anglaise — et un banc qui accuse a tort finit par ne plus etre lu.
        ⚠ L occurrence DONNEE est deja hors d atteinte : le poseur fait du bloc
        `SZ_DONNEES` une zone interdite, donc elle ne peut pas etre enveloppee,
        entree ou pas. Ce qui reste a faire ici, c est DIRE l ambiguite. */
  return out;
};

/* Les textes declares DONNEE qui n apparaissent QUE la — pour eux, une entree
   de dictionnaire est du risque pur, et le banc refuse. Ceux qui paraissent
   aussi ailleurs portent deux roles : on les signale. */
const donneesSeules = (src) => {
  const s = nu(src);
  const dedans = donneesDeclarees(src);
  const hors = s.replace(new RegExp(RE_SZ_DONNEES.source, 'g'), ' ');
  const seules = [], doubles = [];
  for (const t of dedans) (hors.includes(t) ? doubles : seules).push(t);
  return { seules, doubles };
};

let mal = 0, fen = 0, prot = 0;
const accusations = [];
const ambigus = [];

for (const f of fs.readdirSync(DOS).filter((x) => x.endsWith('.js')).sort()) {
  const nom = f.replace(/\.js$/, '');
  const src = fs.readFileSync(path.join(DOS, f), 'utf8');
  fen++;
  const p = protegees(src);
  const { seules, doubles } = donneesSeules(src);
  for (const t of seules) p.set(t, 'declaree DONNEE dans SZ_DONNEES et nulle part ailleurs');
  prot += p.size;
  for (const [texte, pourquoi] of p) {
    if (!LANGUE.aUneDecision(nom, texte)) continue;
    mal++;
    accusations.push({ nom, texte, pourquoi });
  }
  /* ⚠ DEUX ROLES POUR LA MEME CHAINE : on le DIT, on ne le refuse pas. Le bloc
     `SZ_DONNEES` est deja une zone interdite pour le poseur, donc l occurrence
     DONNEE ne peut pas etre enveloppee ; l autre est un libelle, et un libelle
     se traduit. Le signalement est la pour qu un humain confirme. */
  for (const t of doubles) if (LANGUE.aUneDecision(nom, t)) ambigus.push({ nom, texte: t });
}

console.log('');
console.log('== LA TRADUCTION NE TOUCHE QUE CE QU ON LIT ==');
console.log('  ' + fen + ' fenetre(s) · ' + prot + ' chaine(s) qui atteignent un chemin d ecriture');

/* ⚠ LES DEUX ROLES SE DISENT, MEME QUAND TOUT PASSE. Une chaine qui est donnee
   ici et libelle la est un endroit ou la prochaine relecture peut se tromper :
   la taire reviendrait a compter sur la memoire de quelqu un. */
if (ambigus.length) {
  console.log('');
  console.log('  ~~   ' + ambigus.length + ' chaine(s) portent DEUX ROLES — donnee declaree ET libelle :');
  ambigus.forEach((a) => console.log('         ' + a.nom + ' : ' + JSON.stringify(a.texte)));
  console.log('       L occurrence DONNEE est hors d atteinte (SZ_DONNEES est une zone');
  console.log('       interdite au poseur) ; l autre est un libelle, et un libelle se traduit.');
}

/* ⚠ UN BANC QUI NE TROUVE PLUS RIEN A PROTEGER NE DOIT PAS SE TAIRE. Si
   l extraction cassait, le compte tomberait a zero et le vert serait faux. */
if (prot < 20) {
  console.log('');
  console.log('  NON  seulement ' + prot + ' chaine(s) protegee(s) reperee(s) — le banc ne voit plus rien,');
  console.log('       et un banc qui ne voit rien ne doit pas rendre vert.');
  process.exit(1);
}

console.log('');
if (mal) {
  console.log('>>> ' + mal + ' DONNEE(S) TRADUITE(S) — une donnee ecrite en francais serait alteree :');
  console.log('');
  for (const a of accusations.slice(0, 20)) {
    console.log('  NON  ' + a.nom + ' : ' + JSON.stringify(a.texte));
    console.log('       ' + a.pourquoi);
    console.log('       -> retirer cette entree du dictionnaire. On traduit le LIBELLE, jamais la VALEUR.');
  }
  if (accusations.length > 20) console.log('  ... et ' + (accusations.length - 20) + ' autre(s).');
  process.exit(1);
}
console.log('>>> aucune donnee n est traduite : la langue ne change que ce qui se lit');
