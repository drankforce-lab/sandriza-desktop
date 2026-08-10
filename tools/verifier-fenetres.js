#!/usr/bin/env node
'use strict';

/*
 * GARDE-FOU DES FENÊTRES NATIVES
 * =============================================================================
 * Trois fois de suite, un accent grave égaré dans un COMMENTAIRE à l'intérieur
 * d'un littéral de gabarit a fermé la chaîne et cassé le fichier. À chaque fois
 * la règle était écrite dans le socle, et à chaque fois elle a été oubliée en
 * écrivant du commentaire, là où l'on ne pense pas à la syntaxe.
 *
 * Une règle qu'on répète et qu'on oublie n'est pas une règle : c'est un vœu.
 * Celle-ci est vérifiée par une machine.
 *
 * Ce script contrôle, pour chaque fenêtre :
 *   1. que le fichier se charge (syntaxe) ;
 *   2. qu'aucun accent grave ne traîne dans la portion <script>…</script> ;
 *   3. que la page produite contient bien les ancres du socle, faute de quoi le
 *      moteur d'étapes ne trouverait rien à piloter — un assistant qui s'ouvre
 *      sur une page morte, sans erreur.
 *
 *     node tools/verifier-fenetres.js
 */

const fs = require('fs');
const path = require('path');
const { executerPage } = require('./executer-page.js');
const REPONSES = require('./reponses-fenetres.js');

const DOSSIER = path.join(__dirname, '..', 'src', 'fenetres');
// ⚠ `id="pas"` (le fil d'étapes) n'est PAS exigé : toutes les fenêtres ne sont
// pas des assistants. « Imprimantes » est un écran d'état, et lui imposer un fil
// aurait produit un faux assistant à une seule étape pour satisfaire un contrôle.
// Ce qui est exigé, c'est ce dont TOUTE fenêtre a besoin : une zone de contenu et
// une zone de message — sans la seconde, un refus du pont resterait invisible.
const ANCRES = ['id="corps"', 'id="msg"'];
// Le socle n'est pas une fenêtre : il n'a ni page ni ancres.
const SOCLE = 'socle.js';

let fautes = 0;
const dire = (etat, nom, texte) => {
  console.log('  ' + (etat ? 'OK  ' : 'NON ') + nom.padEnd(18) + (texte || ''));
  if (!etat) fautes++;
};

// ⚠ TOUT LE CONTRÔLE EST DEVENU ASYNCHRONE le 2026-08-07, et pour une raison
// précise : la faute que l'on cherche désormais se produit dans la suite d'une
// promesse. La constater exige donc de laisser les promesses se dérouler.
const principal = async () => {
const nonEprouvees = [];

console.log('\n=== Fenêtres natives ===');
for (const f of fs.readdirSync(DOSSIER).filter((n) => n.endsWith('.js'))) {
  const p = path.join(DOSSIER, f);
  const src = fs.readFileSync(p, 'utf8');

  try { require(p); }
  catch (e) { dire(false, f, 'ne se charge pas — ' + e.message); continue; }

  const i = src.indexOf('<script>');
  const j = src.indexOf('</script>');
  if (i >= 0 && j > i) {
    const n = (src.slice(i, j).match(/`/g) || []).length;
    if (n) { dire(false, f, n + ' accent(s) grave(s) dans le script — ils ferment le gabarit'); continue; }
  } else if (f !== SOCLE) {
    dire(false, f, 'aucune portion <script> : la page ne fera rien'); continue;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     UN NOM, UNE DÉCLARATION
     --------------------------------------------------------------------------
     ⚠⚠ CE CONTRÔLE EXISTE À CAUSE D'UNE PANNE DE DEUX VERSIONS. Dans photos.js,
     « var LOTS » était déclaré DEUX FOIS : une fois pour l'historique des
     imports, une fois pour les trois traitements du menu. En JavaScript c'est
     légal — « var » est hissé, les deux noms désignent UNE SEULE variable, et la
     seconde déclaration écrase la première au chargement. L'écran des lots
     affichait donc les traitements : « 3 lots », trois lignes « Sans nom », des
     compteurs vides. Le diagnostic annonçait « champs reçus : 0, 1, 2 » — les
     index d'un tableau de trois chaînes. Le contrôle de syntaxe était vert, la
     fenêtre se dessinait, et le défaut a été cherché dans la sérialisation du
     pont pendant deux publications.

     ⚠ ON NE REGARDE QUE LE PREMIER NIVEAU (deux espaces d'indentation, celui de
     la fermeture qui enveloppe chaque fenêtre). Deux « var i » dans deux
     fonctions différentes sont légitimes et courants : les signaler noierait le
     vrai défaut sous des dizaines de faux. L'heuristique tient parce que toutes
     les fenêtres partagent cette mise en forme — si elle change, ce contrôle
     devient muet, et il vaut mieux le savoir que le croire vigilant.
     ══════════════════════════════════════════════════════════════════════════ */
  /* ⚠ LE SOCLE EST HORS DE PORTÉE DE CETTE HEURISTIQUE : ses fonctions sont au
     premier niveau du fichier, donc leurs variables locales s'indentent elles
     aussi de deux espaces. « var t » dans deux fonctions distinctes y est
     parfaitement sain, et le signaler noierait le vrai défaut sous les faux. */
  if (f !== SOCLE) {
    const vus = new Map();
    const re = /^ {2}(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*[=;]/gm;
    let m;
    while ((m = re.exec(src))) {
      const nom = m[1];
      const ligne = src.slice(0, m.index).split('\n').length;
      if (!vus.has(nom)) vus.set(nom, []);
      vus.get(nom).push(ligne);
    }
    const doubles = [...vus.entries()].filter(([, l]) => l.length > 1);
    if (doubles.length) {
      dire(false, f, 'déclaré deux fois au premier niveau : '
        + doubles.map(([n, l]) => n + ' (lignes ' + l.join(', ') + ')').join(' · ')
        + ' — une seule variable existe, la seconde écrase la première');
      continue;
    }
  }

  if (f !== SOCLE) {
    const mod = require(p);
    const fabrique = Object.values(mod).find((v) => typeof v === 'function');
    if (!fabrique) { dire(false, f, 'n’exporte aucune fabrique de page'); continue; }
    let page = '';
    try { page = String(fabrique('')); }
    catch (e) { dire(false, f, 'la fabrique échoue — ' + e.message); continue; }
    const absentes = ANCRES.filter((a) => page.indexOf(a) < 0);
    if (absentes.length) { dire(false, f, 'ancres manquantes : ' + absentes.join(', ')); continue; }

    // ⚠ LE TROU QUI A LAISSE PASSER UNE FENETRE MORTE (2026-08-06).
    // Ce controle verifiait que le MODULE se charge — mais le script de la page
    // vit dans un litteral de gabarit : pour Node c'est une CHAINE, et une ligne
    // orpheline dedans passe inapercue. La fenetre s'ouvrait, restait sur
    // « Chargement… », et rien n'expliquait pourquoi : le script n'avait jamais
    // demarre. On compile donc le script PRODUIT, pas seulement le module.
    const i2 = page.indexOf('<script>');
    const j2 = page.indexOf('</script>');
    if (i2 < 0 || j2 < i2) { dire(false, f, 'page sans script'); continue; }
    try { new Function(page.slice(i2 + 8, j2)); }
    catch (e) { dire(false, f, 'SCRIPT de la page invalide — ' + e.message); continue; }

    /* ⚠⚠ TROISIÈME TROU — LA FONCTION DÉCLARÉE DEUX FOIS (2026-08-07).
       En modifiant `commande.js` par bouts, cinq fonctions se sont retrouvées
       définies DEUX fois dans le même script : `bip`, `scanMsg`, `scanner`,
       `imprimer`, `etiquette`. C'est du JavaScript parfaitement légal — la
       DERNIÈRE déclaration gagne — donc rien n'a bronché : ni `new Function`, ni
       l'exécution, ni les jeux de réponses. Résultat : la correction écrite dans
       la première copie n'avait AUCUN effet, l'ancienne version tournait, et la
       fenêtre a été PUBLIÉE ainsi. C'est l'utilisateur qui l'a vu.
       On refuse donc un doublon de déclaration au premier niveau du script. */
    const decls = {};
    const rxDecl = /^  function ([A-Za-z_$][\w$]*)\s*\(/gm;
    let md;
    const corps = page.slice(i2 + 8, j2);
    while ((md = rxDecl.exec(corps)) !== null) {
      decls[md[1]] = (decls[md[1]] || 0) + 1;
    }
    const doubles = Object.keys(decls).filter((k) => decls[k] > 1);
    if (doubles.length) {
      dire(false, f, 'fonction(s) déclarée(s) DEUX fois — la dernière gagne, la correction est morte : '
        + doubles.join(', '));
      continue;
    }

    // ⚠⚠ LE SECOND TROU, ET IL A COÛTÉ QUATRE VERSIONS PUBLIÉES (2026-08-07).
    // Compiler prouve que le texte est du JavaScript. Cela ne prouve pas qu'il
    // fonctionne. La fenêtre Imprimantes est restée sur « Lecture de l'état… »
    // pendant quatre versions à cause d'une VARIABLE LIBRE — un `forEach` retiré
    // par mégarde en réécrivant un bloc — et une variable libre compile sans
    // broncher : elle n'échoue qu'à la lecture. Le dessin s'arrêtait donc juste
    // avant la ligne qui remplit l'écran, la faute partait dans un rejet non
    // traité, et la fenêtre se taisait. Pendant ce temps j'accusais le pont.
    // On EXÉCUTE donc le script, sur un faux document et un faux pont qui RÉPOND.
    const jeu = REPONSES[f];
    if (!jeu) { nonEprouvees.push(f); dire(true, f, 'compile — exécution NON éprouvée (aucun jeu de réponses)'); continue; }

    // ⚠ PLUSIEURS CAS D'OUVERTURE PAR FENÊTRE, et ce n'est pas du zèle : ouvrir en
    // CRÉATION et ouvrir en MODIFICATION ne traversent pas le même code. La
    // création ne lit aucune fiche, ne prend aucun verrou et n'affiche aucun
    // journal ; la modification fait les trois. N'éprouver que la première
    // laisserait la moitié de chaque fenêtre dans l'ombre — et c'est précisément
    // une moitié restée dans l'ombre qui a coûté quatre versions.
    const cas = Array.isArray(jeu) ? jeu : [{ nom: 'défaut', id: '', reponses: jeu }];
    let mort = false;
    let ecrituresTotal = 0;
    for (const c of cas) {
      const pc = String(fabrique(c.id || ''));
      const a = pc.indexOf('<script>'), b = pc.indexOf('</script>');
      if (a < 0 || b < a) { dire(false, f, '[' + c.nom + '] page sans script'); mort = true; break; }
      let ex;
      try { ex = await executerPage(pc.slice(a + 8, b), c.reponses || {}); }
      catch (e) { dire(false, f, '[' + c.nom + '] exécution impossible — ' + e.message); mort = true; break; }
      if (ex.fautes.length) { dire(false, f, '[' + c.nom + '] meurt à l’exécution — ' + ex.fautes.join(' | ')); mort = true; break; }
      ecrituresTotal += ex.ecritures || 0;
    }
    if (mort) continue;
    // ⚠ AUCUNE ÉCRITURE D'ÉCRAN = LA FENÊTRE N'A RIEN DESSINÉ, et c'est une FAUTE,
    // pas une information. « Elle n'est pas morte » sans « elle a dessiné » est
    // exactement le verdict rassurant qui a coûté quatre versions : la fenêtre
    // Imprimantes ne mourait pas non plus, elle se taisait.
    if (!ecrituresTotal) { dire(false, f, 'ne dessine RIEN (aucune écriture d’écran) — le jeu de réponses ne mène pas au dessin'); continue; }
    dire(true, f, cas.length + ' cas éprouvé' + (cas.length > 1 ? 's' : '') + ', ' + ecrituresTotal + ' écriture(s) d’écran');
    continue;
  }

  dire(true, f, '');
}

// ── LES DEUX LISTES D'OPÉRATIONS DOIVENT ÊTRE D'ACCORD ──────────────────────
// ⚠ C'EST LE PIÈGE N°1 DE CE PONT, et il était le seul à ne pas être vérifié.
// `OPS` vit dans le site (assets/js/pont.js), `OPS_PONT` dans la coquille
// (src/main.js). Elles sont deux EXPRÈS — la seconde empêche qu'un nom
// quelconque venu d'un document local soit transmis au site. Mais en ajouter une
// dans un seul fichier donne « Cette version de l'application ne connaît pas
// cette opération », SANS dire laquelle manque : on cherche alors du côté du
// site, où tout est correct. C'est arrivé le 2026-08-06 avec Fournisseur et
// Collection. Une machine sait comparer deux listes ; nous, non.
//
// Le dépôt du site n'est pas là sur une machine de construction : on le CHERCHE,
// et son absence n'est pas une faute — c'est un contrôle qu'on annonce comme non
// effectué, ce qui est différent de réussi.
const CANDIDATS = [
  path.join(__dirname, '..', '..', 'Sandriza', 'assets', 'js', 'pont.js'),
  path.join(__dirname, '..', '..', 'sandriza', 'assets', 'js', 'pont.js'),
];
// ⚠ LA BORNE DE FIN DIFFÈRE SELON LA LISTE, et je m'y suis fait prendre en
// écrivant ce contrôle : `OPS` est un objet qui se ferme par « }; », `OPS_PONT`
// un ensemble qui se ferme par « ]); ». Chercher la mauvaise borne fait lire tout
// le reste du fichier, où d'autres chaînes « xxx:yyy » traînent (les canaux
// `ipcMain.handle`) — et le contrôle accuse alors des opérations qui n'ont jamais
// existé. Un garde-fou qui crie à tort se fait désactiver ; il doit donc être
// juste avant d'être sévère.
const noms = (src, marqueur, borne) => {
  const i = src.indexOf(marqueur);
  if (i < 0) return null;
  const j = src.indexOf(borne, i);
  const bloc = src.slice(i, j < 0 ? src.length : j);
  /* ⚠ TROIS SEGMENTS AUSSI (corrigé le 2026-08-10). La forme d'origine
     (`'[a-z]+:[A-Za-z]+'`) ne reconnaissait que `famille:geste` : TOUTES les
     opérations `config:heures:*`, `config:footer:*`, `config:apparence:*` et
     `config:marque:*` échappaient au contrôle depuis qu'elles existent — huit
     opérations qu'on pouvait déclarer d'un seul côté sans que rien ne le dise,
     alors que c'est précisément ce que ce contrôle existe pour attraper. */
  const trouves = bloc.match(/'[a-z]+(?::[A-Za-z]+)+'|'identite'/g) || [];
  return new Set(trouves.map((s) => s.replace(/'/g, '')));
};

/* ══════════════════════════════════════════════════════════════════════════
   UN SEUL JEU DE PLAFONDS
   ⚠⚠ IL Y EN AVAIT DEUX, TENUS A LA MAIN : `LIMITES_PONT` dans main.js et une
   jumelle `LONGUES` dans le prechargement. Celle-ci ignorait
   << photos:traiter >> : le plafond REELLEMENT applique etait le defaut, 25
   secondes, pendant que l autre annoncait 300. Le retrait de mannequin, qui
   enchaine trois modeles, se faisait refuser a chaque essai — et le travail
   continuait derriere jusqu a aboutir et se facturer, sur un ecran qui affichait
   << modele delai >>.
   ⚠ LA PARITE DES OPERATIONS NE SUFFISAIT PAS : elle verifie que les deux
   listes citent les memes noms, jamais qu elles leur donnent le meme temps. Une
   operation absente d une table n est pas manquante — elle est MUETTE, ce qui ne
   se voit qu a l usage.
   ══════════════════════════════════════════════════════════════════════════ */
console.log('\n=== Plafonds du pont ===');
{
  const pre = fs.readFileSync(path.join(__dirname, '..', 'src', 'pont-preload.js'), 'utf8');
  if (/const\s+LONGUES\s*=\s*\{/.test(pre)) {
    dire(false, 'pont-preload', 'tient de nouveau sa PROPRE table de plafonds — '
      + 'elle divergera de celle de main.js sans que rien ne proteste');
  } else if (pre.indexOf("sendSync('pont:limites')") < 0) {
    dire(false, 'pont-preload', 'ne demande plus les plafonds au processus principal');
  } else {
    const mn = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
    if (mn.indexOf("ipcMain.on('pont:limites'") < 0) {
      dire(false, 'main.js', 'ne rend plus la table des plafonds : le prechargement '
        + 'appliquerait 20 s a TOUTES les operations');
    } else {
      dire(true, 'plafonds', 'une seule table, servie par le processus principal');
    }
  }
}

console.log('=== Parité des opérations du pont ===');
const chemin = CANDIDATS.find((c) => fs.existsSync(c));
if (!chemin) {
  console.log('  -   non vérifiée : le dépôt du site n’est pas à côté (assets/js/pont.js)');
} else {
  const siteSrc = fs.readFileSync(chemin, 'utf8');
  const coqSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
  const site = noms(siteSrc, 'const OPS = {', '};');
  const coq = noms(coqSrc, 'const OPS_PONT = new Set([', ']);');
  if (!site || !coq) {
    dire(false, 'listes', 'liste introuvable — la forme de OPS / OPS_PONT a changé');
  } else {
    const manqueCoquille = [...site].filter((n) => !coq.has(n));
    const manqueSite = [...coq].filter((n) => !site.has(n));
    if (manqueCoquille.length) dire(false, 'coquille', 'absentes de OPS_PONT (src/main.js) : ' + manqueCoquille.join(', '));
    if (manqueSite.length) dire(false, 'site', 'absentes de OPS (assets/js/pont.js) : ' + manqueSite.join(', '));
    if (!manqueCoquille.length && !manqueSite.length) {
      dire(true, 'listes', site.size + ' opérations, les deux listes concordent');
    }
  }
}

// ⚠ CE QUI N'A PAS ÉTÉ ÉPROUVÉ EST DIT À VOIX HAUTE, et ce n'est pas une faute :
// c'est une couverture manquante. La taire donnerait « Tout est sain » pour des
// fenêtres qu'on n'a jamais fait tourner — le mensonge exact qui a laissé passer
// quatre versions. Pour en couvrir une : lui ajouter un jeu de réponses dans
// tools/reponses-fenetres.js.
if (nonEprouvees.length) {
  console.log('\n  ⚠ exécution non éprouvée (jeu de réponses à écrire) : ' + nonEprouvees.join(', '));
}

console.log(fautes ? '\n>>> ' + fautes + ' point(s) à corriger\n' : '\n>>> Tout est sain\n');
return fautes ? 1 : 0;
};

principal().then((code) => process.exit(code), (e) => {
  console.log('\n>>> le contrôle lui-même a échoué : ' + ((e && e.stack) || e) + '\n');
  process.exit(1);
});
