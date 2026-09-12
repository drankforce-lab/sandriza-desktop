#!/usr/bin/env node
'use strict';

/*
 * DU FRANÇAIS SANS ACCENTS À L'ÉCRAN — le défaut que rien ne mesurait
 * =============================================================================
 * ⚠⚠ POURQUOI CE BANC EXISTE. Le 2026-09-11, `promo-editeur.js` est parti en
 * production avec TOUT son texte visible sans accents : « Modele ouvert »,
 * « Element verrouille », « Opacite », « Apercu ». Il y est resté une journée.
 * Ce n'est pas un choix de style : l'interface est en français du Québec, et
 * c'est une faute d'orthographe à l'écran.
 *
 * ⚠ ET AUCUN CONTRÔLE NE POUVAIT LE VOIR. Le banc de contraste lit des
 * COULEURS ; `banc-francais` cherche le mot « cliente » ; `verifier-fenetres`
 * vérifie qu'une fenêtre DESSINE, pas ce qu'elle écrit. Le défaut a été trouvé
 * en rouvrant le fichier pour autre chose — c'est-à-dire par chance.
 *
 * ⚠⚠ LA CAUSE, ET ELLE EST TOUJOURS LÀ : l'en-tête de chaque fenêtre dit
 * « aucun accent grave dans la portion de script, commentaires compris ».
 * « Accent grave » désigne le CARACTÈRE ` — celui qui referme le gabarit — pas
 * les lettres accentuées. La confusion est facile, elle a déjà été faite deux
 * fois (`profil.js` en 2026-08-19, `promo-editeur.js` en 2026-09-11), et elle
 * se refera. D'où ce banc plutôt qu'une consigne de plus.
 *
 * ══ CE QU'IL REGARDE, ET CE QU'IL NE REGARDE PAS ═════════════════════════════
 * Il lit les CHAÎNES du script engendré, commentaires retirés — c'est là que
 * vivent les textes qu'une fenêtre affiche, et c'est exactement là qu'était le
 * défaut. Il écarte :
 *   · les COMMENTAIRES, qui sont en ASCII PAR RÈGLE dans ces fichiers (les
 *     compter accuserait la convention elle-même) ;
 *   · ce qui n'est pas de la PROSE — un nom de classe, une clé, un identifiant
 *     n'ont pas à porter d'accent. D'où l'exigence d'une espace et de deux mots.
 *
 * ⚠ LA LISTE DE MOTS NE CONTIENT QUE DES FORMES QUI N'EXISTENT PAS EN ANGLAIS.
 * « operation », « element », « information » sont des mots anglais : les
 * inclure ferait accuser des chaînes justes, et un banc qui crie au loup finit
 * désactivé. Mieux vaut rater un mot que rendre le banc inutilisable.
 *
 *   node tools/banc-accents-visibles.js
 *   node tools/banc-accents-visibles.js <fichier.js>   (pour éprouver un cas)
 */

const fs = require('fs');
const path = require('path');

const DOS = path.join(__dirname, '..', 'src', 'fenetres');

/* Des mots français dont l'accent n'est pas optionnel, et qui ne sont PAS des
   mots anglais. Chaque entrée est la forme FAUTIVE (sans accent). */
const FAUTIFS = [
  'apercu', 'apercus', 'deja', 'derniere', 'dernieres', 'etat', 'etats',
  'fenetre', 'fenetres', 'modele', 'modeles', 'numero', 'numeros',
  'opacite', 'parametre', 'parametres', 'reglage', 'reglages',
  'securite', 'tres', 'verrouille', 'verrouillee', 'verrouillees',
  'deconnexion', 'evenement', 'evenements', 'requete', 'requetes',
  'etiquetee', 'entree', 'entrees', 'donnee', 'donnees', 'annee', 'annees',
  'periode', 'periodes', 'procedure', 'reference', 'references',
  'telephone', 'etape', 'etapes', 'achete', 'achetee', 'creee', 'creees',
];
/* ⚠ LES DEUX BORNES SONT ÉCRITES EN CLAIR. Ma première version les fabriquait
   en découpant une chaîne (BORD.slice(29)) : illisible, et fausse — la
   parenthèse ne tombait pas où je croyais. Une expression régulière qu'on ne
   peut pas lire d'un coup d'œil est une expression qu'on ne peut pas corriger.
   ⚠ Les bornes incluent les lettres ACCENTUÉES : sans ça, « apercu » serait
   trouvé DANS « aperçu » — et le mot juste accuserait le banc.
   ⚠ Et les PLURIELS se déclarent un par un : la borne de droite refuse le « s »,
   donc « modeles » n est pas trouvé par « modele ». C est voulu — sinon
   « etatique » serait accusé par « etat ». */
const LETTRE = 'A-Za-z\u00C0-\u024F';
const RE_MOT = new RegExp(
  '(?<![' + LETTRE + '])(' + FAUTIFS.join('|') + ')(?![' + LETTRE + '])', 'gi');

/* ⚠⚠ L’EXTRACTION DU TEXTE VISIBLE EST PARTAGÉE, PAS RECOPIÉE. `banc-langue-fenetres`
   pose la même question — « que montre cette fenêtre ? » — pour savoir si c’est
   TRADUIT là où celui-ci demande si c’est ACCENTUÉ. Deux copies auraient divergé,
   et la divergence ne fait rien tomber : elle fait juste rétrécir un banc en
   silence. La définition vit dans `tools/textes-visibles.js`, avec les quatre
   pièges qu’il a fallu payer pour la rendre juste. */
const { sansCommentaires, chainesProse, texteAffiche } = require('./textes-visibles.js');

const ligneDe = (s, i) => s.slice(0, i).split('\n').length;

/* ⚠⚠ LE MOT DOIT ÊTRE UN MOT, PAS UN MORCEAU DE NOM. « .etape.on »,
   « data-etat=" », « imprimantes:etat », « id="etat- » : dans les neuf faux
   positifs qui restaient, le mot était toujours COLLÉ à un point, un tiret, un
   deux-points ou un égal — c’est un nom de classe, d’attribut ou d’opération, et
   ces noms-là sont en ASCII par convention. */
const COLLE = '.#-_:=[/';
const fautes = (texte) => {
  const out = [];
  RE_MOT.lastIndex = 0;
  let m;
  while ((m = RE_MOT.exec(texte))) {
    const av = m.index > 0 ? texte[m.index - 1] : ' ';
    const ap = texte[m.index + m[1].length] || ' ';
    if (COLLE.indexOf(av) < 0 && COLLE.indexOf(ap) < 0) out.push(m[1]);
  }
  return out;
};

const analyser = (fichier) => {
  let mod;
  try { mod = require(path.join(DOS, fichier)); } catch (e) { return null; }
  const fabrique = Object.values(mod).find((v) => typeof v === 'function');
/* ⚠⚠ LE SOCLE SE RECONNAÎT PAR SON NOM, PLUS PAR SES EXPORTS. Il exportait des
   CHAÎNES, donc « aucune fonction exportée » suffisait à le distinguer d’une
   fenêtre. Depuis que ses blocs sont des FONCTIONS (pour que la langue s’y
   résolve à chaque page), cette heuristique le prend pour une fenêtre et tente
   d’en tirer une page. ⚠ Une reconnaissance par EFFET DE BORD tient jusqu’au jour
   où l’effet change ; le nom, lui, ne bouge pas. */
  if (fichier === 'socle.js') return null;
  if (!fabrique) return null;
  let page;
  try { page = fabrique(''); } catch (e) {
    try { page = fabrique(); } catch (e2) { return null; }
  }
  if (typeof page !== 'string') return null;

  const trouves = [];
  const poser = (ligne, texte, mots) => {
    if (mots.length) trouves.push({ ligne, mots: [...new Set(mots)], texte });
  };

  for (const c of texteAffiche(page)) poser(ligneDe(page, c.index), c.texte, fautes(c.texte));

  const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let bloc;
  while ((bloc = re.exec(page))) {
    const js = sansCommentaires(bloc[1]);
    const avant = ligneDe(page, bloc.index) - 1;
    for (const c of chainesProse(js)) poser(avant + ligneDe(js, c.index), c.texte, fautes(c.texte));
  }
  return trouves;
};

const cible = process.argv[2];
const fichiers = cible ? [path.basename(cible)]
  : fs.readdirSync(DOS).filter((x) => x.endsWith('.js')).sort();

let total = 0, fenetres = 0, lues = 0;
console.log('');
for (const f of fichiers) {
  const t = analyser(f);
  if (t === null) continue;
  lues++;
  if (!t.length) continue;
  fenetres++; total += t.length;
  console.log('  NON  ' + f + ' — ' + t.length + ' texte(s) affiché(s) sans accents');
  t.slice(0, 6).forEach((x) => {
    console.log('       ligne ' + x.ligne + ' · ' + x.mots.join(', ')
      + '  →  ' + JSON.stringify(x.texte.slice(0, 76)));
  });
  if (t.length > 6) console.log('       … et ' + (t.length - 6) + ' autre(s)');
}

/* ⚠ UN BANC QUI NE LIT RIEN NE DOIT PAS DIRE « TOUT VA BIEN ». Si les fenêtres
   cessent de se charger (un `require` qui casse, un dossier déplacé), le
   décompte tomberait à zéro et le verdict serait VERT.
   ⚠ Il ne s’applique PAS au mode fichier unique : on n’y lit qu’UNE fenêtre
   exprès. Sans cette exception, le garde condamnait l’usage que l’en-tête
   documente — et c’est par lui que la preuve a été faite. */
if (!cible && lues < 5) {
  console.log('  NON  ' + lues + ' fenetre(s) lue(s) seulement — le banc ne voit plus rien,');
  console.log('       et un banc qui ne voit rien ne doit pas rendre vert.');
  process.exit(1);
}

console.log('');
if (total) {
  console.log('>>> ' + total + ' texte(s) sans accents dans ' + fenetres + ' fenetre(s) — '
    + 'l interface est en francais du Quebec');
  console.log('    ⚠ « aucun accent grave » parle du CARACTERE, pas des lettres accentuees.');
  process.exit(1);
}
console.log('>>> ' + lues + ' fenetres lues : aucun texte affiche sans ses accents');
