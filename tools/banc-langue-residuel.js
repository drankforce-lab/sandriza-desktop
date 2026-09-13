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

/* ══ LE LEXIQUE, ET POURQUOI IL NE S ECRIT PAS A LA MAIN ════════════════════
 * ⚠⚠⚠ CE QUE `MOTS_FR` NE POUVAIT PAS VOIR, ET CE QUE CA A COUTE. La liste
 * ci-dessus est faite de mots-outils : elle attrape « dans », « pour », « sous ».
 * Elle ne connait aucun mot de CONTENU sans accent — et c est la que tout passe.
 * Mesure du 2026-09-12, sur des fenetres declarees COMPLETES : « Adresse »,
 * « Actif », « Inactif », « Transporteur », « Bordereau », « Ordre de tri »,
 * « Solde », « Retirer », « hors ligne », « colis complet », « Enregistrement… »
 * etaient encore sur la page ANGLAISE. Le compteur annoncait zero, ce banc-ci
 * annoncait zero, et les deux disaient vrai dans leur propre langue.
 *
 * ⚠⚠ LE LEXIQUE SE DEDUIT DES DICTIONNAIRES, IL NE S INVENTE PAS. Un mot ecrit
 * dans une CLE est un mot que ce chantier a deja juge francais et traduit ;
 * un mot ecrit dans une VALEUR est un mot anglais de cette meme application.
 * Le lexique est la difference des deux — environ 1 070 mots aujourd hui, et il
 * GROSSIT TOUT SEUL a chaque fenetre traduite. Une liste tenue a la main se
 * serait perimee au premier dictionnaire ajoute ; celle-ci ne peut pas.
 *
 * ⚠ CE QUE LA SOUSTRACTION NE RETIRE PAS, il faut le nommer : un mot que les
 * deux langues ecrivent pareil mais qu aucune valeur anglaise n emploie encore
 * (« client », « article », « train », « plan »). Chacun porte sa raison. */
const PAREILS = new Map([
  ['article', 'le meme mot en anglais'], ['articles', 'idem'],
  ['client', 'le meme mot en anglais'], ['clients', 'idem'],
  ['train', 'le meme mot en anglais'], ['lots', 'le meme mot en anglais'],
  ['pile', 'le meme mot en anglais'], ['plan', 'le meme mot en anglais'],
  ['cents', 'le meme mot en anglais'], ['genre', 'le meme mot en anglais'],
  ['regard', 'le meme mot en anglais'], ['tour', 'le meme mot en anglais'],
  ['rupture', 'le meme mot en anglais'], ['ruptures', 'idem'],
  ['brut', 'employe tel quel en anglais (fichier brut)'],
  ['corps', 'parait dans des noms de police'],
  ['plat', 'le « flat lay » du studio s ecrit ainsi'],
  ['note', 'le meme mot en anglais'], ['sort', 'le meme mot en anglais'],
  ['long', 'le meme mot en anglais'], ['marche', 'le meme mot en anglais'],
  ['fond', 'parait dans des noms techniques'], ['bras', 'le meme mot en anglais'],
  ['agence', 'parait dans des raisons sociales'],
  ['relais', 'un point de relais garde son nom'],
  ['tissu', 'le meme mot en anglais'], ['ombre', 'parait comme nom de reglage'],
  ['objet', 'le meme mot en anglais'], ['objets', 'idem'],
  ['figure', 'le meme mot en anglais'], ['image', 'le meme mot en anglais'],
  ['images', 'idem'], ['service', 'le meme mot en anglais'], ['services', 'idem'],
  ['chance', 'le meme mot en anglais'], ['sourire', 'parait comme nom de pose'],
  ['grand', 'le meme mot en anglais'], ['patient', 'le meme mot en anglais'],
]);

const LEXIQUE = (() => {
  const fr = new Set(), en = new Set();
  const desMots = (s) => (String(s).match(/[A-Za-zÀ-ÿŒœ]{4,}/g) || []).map((m) => m.toLowerCase());
  let noms = [];
  try {
    noms = fs.readdirSync(DICOS).filter((f) => f.endsWith('.js') && f !== 'index.js')
      .map((f) => f.replace(/\.js$/, ''));
  } catch (e) { return new Set(); }
  for (const n of noms) {
    const d = LANGUE.dico(n) || {};
    for (const cle of Object.keys(d)) {
      for (const m of desMots(cle)) if (!/[À-ÿŒœ]/.test(m)) fr.add(m);
      for (const m of desMots(d[cle])) en.add(m);
    }
  }
  return new Set([...fr].filter((m) => !en.has(m) && !PAREILS.has(m)));
})();

/* ══ LA DETTE DECLAREE DU 2026-09-12 ════════════════════════════════════════
 * ⚠⚠ POURQUOI UN PLAFOND PLUTOT QUE ZERO TOUT DE SUITE. Le jour ou le lexique
 * et les attributs sont entres dans ce banc, il a trouve 243 textes francais
 * sur des pages ANGLAISES, dans 22 des 23 fenetres declarees completes. Les
 * corriger toutes avant de poser la mesure aurait voulu dire garder la mesure
 * DANS UNE SEANCE au lieu de dans le depot — et c est exactement ce que
 * l en-tete de ce fichier reproche a un controle refait a la main.
 *
 * ⚠⚠ CE PLAFOND NE SERT QU A DESCENDRE. Chaque fenetre porte le nombre qu elle
 * avait ce jour-la ; le banc REFUSE des qu une fenetre depasse le sien, donc
 * rien ne peut empirer. Quand une fenetre est reparee, on ECRIT SON NOUVEAU
 * NOMBRE ICI — et quand il tombe a zero, on retire la ligne. Une dette qu on ne
 * chiffre pas est une dette qu on oublie.
 *
 * ⚠ LES CHIFFRES NE SE REMONTENT JAMAIS. Si une ligne doit grandir, c est qu on
 * a ajoute du francais : c est la faute qu il faut corriger, pas le plafond. */
const DETTE = new Map([
  ['caisse', 3], ['campagnes', 15], ['catalogio', 2], ['client', 1],
  ['commande', 11], ['commandes', 20], ['depenses', 8], ['fournisseur', 1],
  ['impot', 3], ['inventaire', 18], ['invmeta', 12], ['photos', 19],
  ['produit', 18], ['produits', 9], ['promo', 3], ['promo-editeur', 13],
  ['ramassages', 5], ['retour', 8], ['studio', 17], ['tableau', 4],
  ['telephonie', 6],
]);

/* ⚠ CE QUI N EST PAS DU TEXTE, meme quand ca porte des mots francais : un
   selecteur (`[data-onglet]`, `.ligne[data-v]`), un attribut technique
   (`class="fait"`), une adresse. Les accuser noierait le signal. */
const PAS_DU_TEXTE = [
  /^[.#\[]/,                                   // un selecteur
  /^[a-z-]+="[^"]*"$/i,                        // un attribut nu
  /^https?:\/\//i,                             // une adresse
  /^[\w-]+\[[^\]]*\]$/,                        // balise[attribut]
];

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
    if (MOTS_FR.has(mot.toLowerCase())) { trouves.push(mot); continue; }
    if (LEXIQUE.has(mot.toLowerCase())) trouves.push(mot);
  }
  return trouves;
};

/* ⚠⚠ LES ATTRIBUTS ECRITS DANS LE SCRIPT — l autre moitie de l angle mort.
   `texteAffiche` lit bien `title=`, `placeholder=`, `aria-label=` et `alt=`,
   mais il BLANCHIT d abord les blocs <script> ; or dans ces fenetres la page se
   fabrique DANS le script (`h += '<input aria-label="Rechercher un produit">'`).
   Resultat : ces attributs-la n etaient lus par personne — « Aucune unité en
   stock » portait meme un accent et passait quand meme. On les relit donc sur
   la page ENTIERE, script compris. */
const ATTRIBUTS = /\b(?:title|placeholder|aria-label|alt)\s*=\s*\\?"([^"<>\\]+)\\?"/gi;
const attributsPartout = (page) => {
  const out = [];
  const re = new RegExp(ATTRIBUTS.source, 'gi');
  let m;
  while ((m = re.exec(page))) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t) out.push({ texte: t, index: m.index, ou: 'attribut' });
  }
  return out;
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
  const candidats = texteAffiche(page).concat(attributsPartout(page));
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
    if (PAS_DU_TEXTE.some((re) => re.test(t))) continue;
    if (!PHRASE.test(t) && !ACCENT.test(t) && !LEXIQUE.has(t.toLowerCase())) continue;
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

/* ⚠ CE QUI FAIT ECHOUER : depasser son plafond, ou en porter un devenu trop
   large. Les deux comptent — un plafond qu on ne redescend pas redevient une
   liste ou l on range ce qu on ne corrige pas. */
const depassent = sales.filter((x) => x.restes.length > (DETTE.get(x.nom) || 0));
const perimes = [...DETTE.entries()].filter(([n, p]) => {
  const x = parFenetre.find((y) => y.nom === n);
  return x && x.restes.length < p;
});

if (cible) {
  const x = parFenetre[0];
  if (!x) { console.log('  ' + cible + ' : pas de dictionnaire — pas encore traduite.'); process.exit(0); }
  const plafond = DETTE.get(cible);
  console.log('  ' + cible + ' : ' + x.restes.length + ' texte(s) encore en francais'
    + (plafond === undefined ? '' : '   (dette declaree : ' + plafond + ')'));
  console.log('');
  x.restes.forEach((r) => console.log('    ' + JSON.stringify(r.texte) + '   [' + r.mots.join(' ') + ']'));
  if (plafond !== undefined && x.restes.length < plafond) {
    console.log('');
    console.log('  ~~ la dette a baisse : ecrivez ' + x.restes.length + ' (ou retirez la ligne)');
    console.log('     pour \'' + cible + '\' dans DETTE, tools/banc-langue-residuel.js');
  }
  process.exit(x.restes.length > (plafond || 0) ? 1 : 0);
}

for (const x of sales) {
  console.log('  ' + String(x.restes.length).padStart(4) + '  ' + x.nom);
  x.restes.slice(0, 4).forEach((r) => console.log('          ' + JSON.stringify(r.texte).slice(0, 96)));
  if (x.restes.length > 4) console.log('          … et ' + (x.restes.length - 4) + ' autre(s)');
}

console.log('');
if (!total) { console.log('>>> aucune fenetre traduite ne montre de francais en anglais'); process.exit(0); }

if (depassent.length) {
  console.log('  NON  ' + depassent.length + ' fenetre(s) DEPASSENT leur dette declaree :');
  depassent.forEach((x) => console.log('         ' + x.nom + ' : ' + x.restes.length
    + ' > ' + (DETTE.get(x.nom) || 0)));
  console.log('');
  console.log('>>> du francais a ete AJOUTE sur une page anglaise — c est la faute a corriger,');
  console.log('    pas le plafond a remonter.');
  process.exit(1);
}

/* ⚠ UNE DETTE QUI A BAISSE FAIT ECHOUER AUSSI, et ce n est pas de la severite
   pour la forme : un plafond qu on ne redescend pas laisse rentrer en silence
   tout ce qu on vient de corriger. Le banc dit le chiffre a ecrire ; c est une
   ligne, dans le meme commit que la reparation.
   ⚠ Sur UNE fenetre (l argument), il avertit seulement : on est en train de
   travailler, pas de verrouiller. */
if (perimes.length) {
  console.log('  NON  ' + perimes.length + ' dette(s) ont baisse — le chiffre doit suivre :');
  perimes.forEach(([n, p]) => {
    const x = parFenetre.find((y) => y.nom === n);
    console.log('         ' + n + ' : ecrivez ' + x.restes.length + ' au lieu de ' + p
      + (x.restes.length ? '' : ' (retirez la ligne)'));
  });
  console.log('');
  console.log('>>> DETTE, tools/banc-langue-residuel.js');
  process.exit(1);
}

console.log('>>> ' + total + ' texte(s) encore en francais dans ' + sales.length
  + ' fenetre(s) — DETTE DECLAREE du 2026-09-12, elle ne doit que descendre');
console.log('    node tools/banc-langue-residuel.js <fenetre>   pour les voir toutes');
process.exit(0);
