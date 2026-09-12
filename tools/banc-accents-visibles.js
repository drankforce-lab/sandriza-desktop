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

/* ⚠ ON RETIRE LES COMMENTAIRES EN GARDANT LES LIGNES : sans ça, le numéro de
   ligne rapporté ne désigne plus rien, et un banc dont on ne sait pas relire la
   sortie ne sert qu'à faire rouge. */
const sansCommentaires = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));

/* ⚠⚠ ON NE GARDE QUE CE QUI SERA VU. Une chaîne de ces fenêtres est presque
   toujours du HTML : « <div class="etat"> », « <label for="modele-sel">Modèle
   </label> ». Les noms de classes et d'identifiants y sont en ASCII PAR
   CONVENTION — les compter, c'est accuser la convention. La première version du
   banc le faisait : 152 accusations dans 52 fenêtres, dont la quasi-totalité
   sur `etat`, `modele`, `annee` employés comme NOMS. ⚠ Un banc à ce taux-là ne
   se corrige pas, il se désactive.
   ⚠ Un fragment commence ou finit souvent AU MILIEU d'une balise, parce que la
   suite est une concaténation : on retire donc aussi la balise ouverte à la fin
   et la fin de balise au début. */
const texteVisible = (s) => {
  let t = s.replace(/<[^>]*>/g, ' ').replace(/<[^>]*$/, ' ');
  const g = t.indexOf('>');                      // le fragment commençait DANS une balise
  if (g >= 0) t = t.slice(g + 1);
  return t.replace(/&[a-z#0-9]{2,8};/gi, ' ').replace(/\s+/g, ' ').trim();
};

/* ⚠⚠ AUCUNE LONGUEUR MINIMALE DANS LA RECHERCHE DES CHAÎNES — elle FAUSSE
   L'APPARIEMENT DES GUILLEMETS, et c'est invisible à la lecture. Avec
   `{6,300}`, dans `x.etat === "clos" || x.etat === "actif"`, le moteur renonçait
   à « clos » (5 caractères) puis appariait ce guillemet FERMANT avec l'OUVRANT
   suivant : le banc rapportait « || x.etat === » comme un texte affiché. On
   prend TOUTES les chaînes, et on filtre après.
   On ne garde ensuite que ce qui ressemble à de la PROSE : deux mots au moins,
   une minuscule au moins, et rien qui ressemble à du code. */
const chainesProse = (js) => {
  const out = [];
  const re = /'([^'\\\n]*)'|"([^"\\\n]*)"/g;
  let m;
  while ((m = re.exec(js))) {
    const t = texteVisible(m[1] !== undefined ? m[1] : m[2]);
    if (t.length < 6) continue;
    if (!/\s/.test(t)) continue;                 // un seul mot : pas de la prose
    if (!/[a-z]/.test(t)) continue;              // que des majuscules : un libellé technique
    if (/^[\w.:\-\/#]+$/.test(t)) continue;      // chemin, sélecteur, clé
    if (/===|!==|\|\||&&|\breturn\b|\bfunction\b/.test(t)) continue;   // du code
    if (!PHRASE.test(t)) continue;               // ni majuscule ni ponctuation : un nom
    out.push({ texte: t, index: m.index });
  }
  return out;
};

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

/* ⚠ DE LA PROSE PORTE UNE MAJUSCULE, UN ACCENT OU UNE PONCTUATION. « etat non »
   est un nom de classe (cles.js : res.className = 'etat non'), et aucune phrase
   affichée de cette interface ne ressemble à ça.
   ⚠⚠ On ne peut PAS exiger un accent : c’est justement ce qui manque dans le
   défaut cherché. La majuscule et la ponctuation, elles, ne disparaissent pas
   quand on oublie les accents. */
const PHRASE = /[A-ZÀ-ɏ]|[.,;:!?…’—]/;

/* ⚠⚠ DEUX SOURCES, DEUX RÈGLES, PARCE QUE LA PREUVE N’EST PAS LA MÊME.
   · Un NŒUD DE TEXTE du HTML est affiché — point. Un mot seul y compte, et c’est
     indispensable : « Opacité » et « Aperçu », deux des quatre fautes de
     2026-09-11, sont des étiquettes d’UN mot. Exiger deux mots ici, c’est rater
     la moitié du défaut que ce banc existe pour voir.
   · Une CHAÎNE DU SCRIPT peut être un identifiant : elle doit ressembler à de la
     prose avant d’être accusée. */
const blanchir = (s, re) => s.replace(re, (m) => m.replace(/[^\n]/g, ' '));

const texteAffiche = (page) => {
  const sans = blanchir(blanchir(page, /<script[\s\S]*?<\/script>/gi),
    /<style[\s\S]*?<\/style>/gi);
  const out = [];
  let m;
  const re = />([^<>]+)</g;
  while ((m = re.exec(sans))) {
    const t = m[1].replace(/&[a-z#0-9]{2,8};/gi, ' ').replace(/\s+/g, ' ').trim();
    if (t) out.push({ texte: t, index: m.index });
  }
  /* Les attributs qui S’AFFICHENT : une infobulle, un texte de remplacement, le
     libellé porté par un bouton. Ce ne sont pas des nœuds de texte, mais ils se
     lisent à l’écran comme le reste. */
  const ra = /(?:title|placeholder|aria-label|alt)\s*=\s*"([^"<>]+)"/gi;
  while ((m = ra.exec(sans))) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t && PHRASE.test(t)) out.push({ texte: t, index: m.index });
  }
  return out;
};

const analyser = (fichier) => {
  let mod;
  try { mod = require(path.join(DOS, fichier)); } catch (e) { return null; }
  const fabrique = Object.values(mod).find((v) => typeof v === 'function');
  if (!fabrique) return null;                    // socle.js : pas une fenetre
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
