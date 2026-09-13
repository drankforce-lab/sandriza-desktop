#!/usr/bin/env node
'use strict';

/*
 * DU FRANCAIS QUI RESTE SUR LA PAGE ANGLAISE
 * =============================================================================
 * ⚠⚠ POURQUOI CE BANC EXISTE PLUTOT QU UN COUP D OEIL. Ce controle-la a ete
 * refait A LA MAIN trois seances de suite — « verifie sur la page ANGLAISE,
 * pas seulement au compteur » — et il a trouve quelque chose A CHAQUE FOIS.
 * Il ne vivait dans aucun fichier. Un controle qui paie a chaque passage et
 * qu on reecrit a chaque passage finit par etre saute le jour ou l on est
 * presse, et c est ce jour-la qu il aurait servi.
 *
 * ⚠⚠ ET IL MESURE AUTRE CHOSE QUE LE COMPTEUR — c est tout l interet.
 * `banc-langue-fenetres` demande : « ce texte a-t-il une DECISION ? ». Il ne
 * voit que ce que `chainesProse` lui donne, et celle-ci ECARTE volontairement
 * les chaines d un seul mot (`' depense'`, `' expedition'`) pour ne pas prendre
 * un identifiant pour une phrase. Resultat : une fenetre peut etre annoncee
 * COMPLETE en portant encore des mots francais colles a un nombre —
 * « 3 depense » sur une page anglaise. Ici la question est l autre :
 * « QU EST-CE QUI RESTE EN FRANCAIS UNE FOIS LA PAGE ECRITE EN ANGLAIS ? »
 *
 * ⚠ CE QUI LE REND SUR SUR UN MOT SEUL, la ou le compteur ne peut pas l etre :
 * sur la page ANGLAISE, un mot accentue n a aucune raison d etre la. Les noms
 * techniques sont en ASCII par convention (c est deja ce sur quoi s appuie
 * `textes-visibles`), donc l accent est une signature, pas une ressemblance.
 *
 * ══ CE QUI EST TOLERE, ET POURQUOI C EST ECRIT ICI ══════════════════════════
 *   · les fenetres SANS dictionnaire : elles ne sont pas encore traduites, les
 *     accuser noierait le signal sous le chantier qui reste ;
 *   · `connexion` : elle porte son dictionnaire DANS la page (elle bascule sans
 *     se recharger), la resolution ne passe pas par T() ;
 *   · ce que EXEMPTE declare nommement, chacun avec sa raison.
 *
 *   node tools/banc-langue-residuel.js            toutes les fenetres traduites
 *   node tools/banc-langue-residuel.js <fenetre>  une seule, avec ses lignes
 */

const fs = require('fs');
const path = require('path');
const LANGUE = require('../src/langue');
const { sansCommentaires, texteVisible, texteAffiche, PHRASE } = require('./textes-visibles.js');

const DOS = path.join(__dirname, '..', 'src', 'fenetres');
const DICOS = path.join(__dirname, '..', 'src', 'langue');

/* ⚠ CHAQUE EXEMPTION PORTE SA RAISON. Une liste d exemptions sans motif devient
   l endroit ou l on range ce qu on n a pas envie de corriger. */
const EXEMPTE = [
  [/^fr(-CA)?$/i, 'un code de langue, pas du texte'],
  [/^Francais$|^Français$/i, 'le nom de la langue dans le selecteur — il s ecrit dans sa langue'],
  [/^Sandriza$/, 'le nom du produit'],
  [/^Montreal$|^Montréal$|^Quebec$|^Québec$/i, 'un nom propre'],
];

/* Les mots francais SANS accent qui ne peuvent pas etre autre chose. Liste
   courte a dessein : un mot ambigu (« sale », « pain », « coin ») ferait crier
   le banc sur de l anglais juste, et un banc qui crie au loup cesse d etre lu. */
const MOTS_FR = new Set([
  'pour', 'dans', 'avec', 'sans', 'les', 'des', 'une', 'aux', 'qui', 'que',
  'sont', 'cette', 'votre', 'vous', 'nous', 'elle', 'leur', 'sous', 'puis',
  'ceci', 'cela', 'toute', 'tous', 'toutes', 'aucun', 'aucune', 'chaque',
]);

const ACCENT = /[àâäçéèêëîïôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ]/;

/* Les chaines du script, SANS le filtre « un seul mot » du compteur : c est
   precisement ce qu il laisse passer que ce banc-ci doit voir. */
const chainesToutes = (js) => {
  const out = [];
  const re = /'([^'\\\n]*)'|"([^"\\\n]*)"/g;
  let m;
  while ((m = re.exec(js))) {
    const t = texteVisible(m[1] !== undefined ? m[1] : m[2]);
    if (!t) continue;
    if (/^[\w.:\-\/#]+$/.test(t)) continue;              // chemin, selecteur, cle
    if (/===|!==|\|\||&&|\breturn\b|\bfunction\b/.test(t)) continue;
    out.push({ texte: t, index: m.index, ou: 'script' });
  }
  return out;
};

/* ⚠⚠ LES NOMS OFFICIELS QUI RESTENT FRANÇAIS EN ANGLAIS. « Registraire des
   entreprises du Québec » et « Revenu Québec » s'écrivent ainsi dans les deux
   langues — y compris dans la documentation de l'ARC. Les traduire ferait
   chercher un organisme qui n'existe pas sous ce nom-là.
   ⚠ ON LES RETIRE DU TEXTE AVANT DE L'EXAMINER, on ne met pas la phrase entière
   hors de portée : « 10 digits · Registraire des entreprises du Québec » doit
   continuer d'être jugée sur ses AUTRES mots. Exempter la phrase entière
   reviendrait à s'aveugler sur tout ce qui l'entoure.
   ⚠ Chaque nom porte sa raison — une liste sans motif devient l'endroit où l'on
   range ce qu'on n'a pas envie de corriger. */
const NOMS_OFFICIELS = [
  ['Registraire des entreprises du Québec', 'le nom officiel de l’organisme, dans les deux langues'],
  ['Registraire des entreprises', 'idem, forme courte'],
  ['Revenu Québec', 'son nom officiel en anglais aussi (l’ARC l’écrit ainsi)'],
];
const sansNomsOfficiels = (t) => NOMS_OFFICIELS
  .reduce((s, [nom]) => s.split(nom).join(' '), t);

const exempte = (mot) => EXEMPTE.some(([re]) => re.test(mot));

/* ⚠ UN MOT COLLE A UN CHIFFRE OU A UN POINT EST UN NOM, pas un mot — meme borne
   que `banc-accents-visibles`, et pour la meme raison. */
const motsFrancais = (t) => {
  const trouves = [];
  for (const mot of sansNomsOfficiels(t).split(/[^A-Za-zÀ-ÿŒœ’]+/)) {
    if (!mot || mot.length < 3) continue;
    if (exempte(mot)) continue;
    if (ACCENT.test(mot)) { trouves.push(mot); continue; }
    if (MOTS_FR.has(mot.toLowerCase())) trouves.push(mot);
  }
  return trouves;
};

const cible = process.argv[2] ? path.basename(process.argv[2]).replace(/\.js$/, '') : '';

/* Les fenetres DECLAREES traduites : celles qui ont un dictionnaire. */
const traduites = fs.readdirSync(DICOS)
  .filter((f) => f.endsWith('.js') && f !== 'index.js' && f !== 'socle.js')
  .map((f) => f.replace(/\.js$/, ''))
  .filter((n) => n !== 'connexion')
  .filter((n) => fs.existsSync(path.join(DOS, n + '.js')))
  .sort();

const parFenetre = [];
let lues = 0;

for (const nom of traduites) {
  if (cible && nom !== cible) continue;
  const F = path.join(DOS, nom + '.js');
  LANGUE.poserLangue('en');
  delete require.cache[require.resolve(F)];
  let mod;
  try { mod = require(F); } catch (e) { continue; }
  const fabrique = Object.values(mod).find((v) => typeof v === 'function');
  if (!fabrique) continue;
  let page;
  try { page = fabrique(''); } catch (e) { try { page = fabrique(); } catch (e2) { continue; } }
  if (typeof page !== 'string') continue;
  lues++;

  const restes = [];
  const vus = new Set();
  const candidats = texteAffiche(page);
  const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let bloc;
  while ((bloc = re.exec(page))) {
    for (const c of chainesToutes(sansCommentaires(bloc[1]))) candidats.push(c);
  }
  /* ⚠⚠ UNE ENTREE QUI REND LE MEME TEXTE EST UNE DECISION, PAS UN OUBLI — c est
     deja la regle du compteur, et elle vaut ici. « Café » se dit « Café » en
     anglais ; l accuser reviendrait a exiger qu on ecrive un mot faux pour faire
     taire un banc. ⚠ On l exige DECLAREE : un texte accentue sans entree reste
     une faute. La difference entre « decide » et « oublie » ne se devine pas. */
  const dicoF = LANGUE.dico(nom) || {};
  const dicoS = LANGUE.dico('socle') || {};
  const memeTexte = (t) => dicoF[t] === t || dicoS[t] === t;

  for (const c of candidats) {
    const t = c.texte;
    if (vus.has(t)) continue;
    if (!PHRASE.test(t) && !ACCENT.test(t)) continue;
    if (memeTexte(t)) continue;
    const mots = motsFrancais(t);
    if (!mots.length) continue;
    vus.add(t);
    restes.push({ texte: t, mots: [...new Set(mots)] });
  }
  parFenetre.push({ nom, restes });
}

LANGUE.poserLangue('fr');

console.log('');
console.log('== DU FRANCAIS QUI RESTE SUR LA PAGE ANGLAISE ==');
console.log('  ' + lues + ' fenetre(s) declaree(s) traduite(s) sur ' + traduites.length + ' dictionnaire(s)');
console.log('');

/* ⚠ UN BANC QUI NE LIT RIEN NE DOIT PAS SE TAIRE : zero fenetre lue donnerait
   zero reste, et se lirait comme une victoire. */
if (!cible && lues < 1) {
  console.log('  NON  aucune fenetre traduite n a pu etre dessinee — le banc ne voit rien.');
  process.exit(1);
}

const sales = parFenetre.filter((x) => x.restes.length);
const total = sales.reduce((n, x) => n + x.restes.length, 0);

if (cible) {
  const x = parFenetre[0];
  if (!x) { console.log('  ' + cible + ' : pas de dictionnaire — pas encore traduite.'); process.exit(0); }
  console.log('  ' + cible + ' : ' + x.restes.length + ' texte(s) encore en francais');
  console.log('');
  x.restes.forEach((r) => console.log('    ' + JSON.stringify(r.texte) + '   [' + r.mots.join(' ') + ']'));
  process.exit(x.restes.length ? 1 : 0);
}

for (const x of sales) {
  console.log('  ' + String(x.restes.length).padStart(4) + '  ' + x.nom);
  x.restes.slice(0, 4).forEach((r) => console.log('          ' + JSON.stringify(r.texte).slice(0, 96)));
  if (x.restes.length > 4) console.log('          … et ' + (x.restes.length - 4) + ' autre(s)');
}

console.log('');
if (!total) { console.log('>>> aucune fenetre traduite ne montre de francais en anglais'); process.exit(0); }
console.log('>>> ' + total + ' texte(s) encore en francais dans ' + sales.length + ' fenetre(s) declaree(s) traduite(s)');
console.log('    node tools/banc-langue-residuel.js <fenetre>   pour les voir toutes');
process.exit(1);
