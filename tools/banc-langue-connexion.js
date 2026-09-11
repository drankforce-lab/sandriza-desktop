'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   CHAQUE TEXTE DEMANDÉ A-T-IL SA TRADUCTION ?
   ═══════════════════════════════════════════════════════════════════════════
   ⚠⚠ POURQUOI CE BANC EXISTE : `T('…')` rend la CLÉ elle-même quand elle est
   absente du dictionnaire. La clé étant la phrase française, une clé manquante
   ou mal tapée donne un écran PARFAITEMENT NORMAL en français — et la phrase
   reste française en anglais. Le défaut est donc invisible dans la langue où on
   travaille, et visible seulement par quelqu'un qui lit l'autre.

   ➡ **UN REPLI QUI REND EXACTEMENT CE QU'ON ATTENDAIT DANS LE CAS COURANT NE SE
     VOIT JAMAIS DANS LE CAS COURANT.** C'est la leçon du repli muet de la
     5.13.0, reprise ici sous une autre forme.

   Il vérifie les deux sens :
     ① toute clé demandée par `T('…')` existe dans le dictionnaire anglais ;
     ② toute entrée du dictionnaire est effectivement demandée — une traduction
        que plus personne n'affiche est une phrase qu'on entretient pour rien,
        et surtout une fausse impression de couverture.

   ⚠ LES MOTIFS SONT À PART : les clés `motif.xxx` ne sont pas appelées par
   `T('motif.xxx')` mais résolues dans `TM(r)` à partir du code que le serveur
   renvoie. On ne peut donc pas exiger qu'elles apparaissent dans le fichier ;
   on vérifie en revanche qu'un motif RENVOYÉ PAR LE SITE a bien sa traduction —
   la liste est relevée dans `staff.js`, pas recopiée ici.

   Lancement :  node tools/banc-langue-connexion.js
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const F = path.join(RACINE, 'src', 'fenetres', 'connexion.js');
const src = fs.readFileSync(F, 'utf8');

const fautes = [];

/* ── Le dictionnaire anglais, relevé dans le fichier engendré. ────────────── */
const iD = src.indexOf('  var DICT = {');
if (iD < 0) { console.error('✗ `DICT` introuvable dans connexion.js'); process.exit(1); }
const iFin = src.indexOf('  };', iD);
const bloc = src.slice(iD, iFin);
const cles = new Set();
const rxE = /^\s{6}"((?:[^"\\]|\\.)*)":/gm;
let m;
while ((m = rxE.exec(bloc))) cles.add(JSON.parse('"' + m[1] + '"'));
if (cles.size < 20) {
  console.error('✗ seulement ' + cles.size + ' entrée(s) relevée(s) dans le dictionnaire — '
    + 'le motif de lecture ne marche plus, ce banc ne prouverait rien.');
  process.exit(1);
}

/* ── ① Toute clé demandée existe. ────────────────────────────────────────── */
const demandees = new Set();
const rxT = /\bT\(\s*'((?:[^'\\]|\\.)*)'/g;
while ((m = rxT.exec(src))) demandees.add(m[1].replace(/\\'/g, "'"));
if (demandees.size < 20) {
  fautes.push('seulement ' + demandees.size + ' appel(s) de T(…) relevé(s) — le motif de '
    + 'lecture ne marche plus, ce banc ne prouverait rien');
}
for (const k of demandees) {
  if (!cles.has(k)) fautes.push('T(' + JSON.stringify(k) + ') n’a PAS de traduction anglaise — '
    + 'l’écran restera français à cet endroit, sans que rien ne le signale');
}

/* ── ② Toute entrée est demandée (hors motifs). ──────────────────────────── */
for (const k of cles) {
  if (k.indexOf('motif.') === 0) continue;
  if (!demandees.has(k)) fautes.push('l’entrée ' + JSON.stringify(k) + ' du dictionnaire '
    + 'n’est demandée par personne — texte mort, ou clé qui a changé d’un côté seulement');
}

/* ── ③ Les motifs renvoyés par le site ont leur traduction. ──────────────── */
{
  const S = path.join(RACINE, '..', 'sandriza', 'assets', 'js', 'staff.js');
  if (!fs.existsSync(S)) {
    console.log('  — `staff.js` introuvable (dépôt du site absent) : le contrôle des motifs '
      + 'est sauté, et ce passage ne dit rien sur eux.');
  } else {
    const st = fs.readFileSync(S, 'utf8');
    /* On ne relève QUE les cœurs de connexion : les autres refus du site ne
       traversent jamais cet écran, et les exiger ferait crier sur du terrain
       qui n'est pas le sien. */
    const i0 = st.indexOf('connexionEntrer');
    const i1 = st.indexOf('connexionQuestionsEcrire');
    const zone = (i0 >= 0 && i1 > i0) ? st.slice(i0, st.indexOf('\n  }', i1)) : '';
    const motifs = new Set();
    const rxM = /motif:\s*'([a-z0-9_]+)'/g;
    while ((m = rxM.exec(zone))) motifs.add(m[1]);
    /* ⚠ DEUX EXCEPTIONS DÉCLARÉES, AVEC LEUR RAISON — et déclarées ICI plutôt
       que tolérées par un contrôle plus lâche. Un banc qu'on affaiblit pour
       faire passer un cas particulier cesse de garder tous les autres.
         · `session`  — ce refus ne porte aucun message : il n'y a rien à
           traduire, l'écran n'affiche rien.
         · `politique` — son message est la LISTE des exigences de mot de passe,
           construite par le serveur (« au moins 12 caractères », « un chiffre »…).
           La traduire par motif remplacerait ces exigences par une phrase
           générique : on perdrait l'information pour gagner la langue. Elle
           restera donc en français tant que le site ne sera pas traduit — c'est
           le chantier qu'il a dit de garder pour la fin. */
    const EXCEPTIONS = ['session', 'politique'];
    const sansTraduction = [...motifs].filter((x) => !cles.has('motif.' + x)
      && EXCEPTIONS.indexOf(x) < 0);
    if (motifs.size < 5) {
      fautes.push('seulement ' + motifs.size + ' motif(s) relevé(s) dans staff.js — '
        + 'le motif de lecture ne marche plus');
    }
    sansTraduction.forEach((x) => fautes.push('le refus « ' + x + " » n’a pas de traduction "
      + '(`motif.' + x + '`) — il s’affichera en français au milieu d’un écran anglais'));
  }
}

if (fautes.length) {
  console.error('✗ la traduction de l’écran de connexion a ' + fautes.length + ' trou(s) :');
  fautes.forEach((x) => console.error('   — ' + x));
  process.exit(1);
}
console.log('✓ les ' + demandees.size + ' textes demandés ont leur traduction, et les '
  + cles.size + ' entrées du dictionnaire servent toutes.');
