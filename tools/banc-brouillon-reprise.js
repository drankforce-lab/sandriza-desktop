#!/usr/bin/env node
'use strict';

/*
 * LA BOITE DE REPRISE EST-ELLE DESSINEE PARTOUT OU ELLE PEUT L ETRE ?
 * =============================================================================
 * ⚠⚠ LE DEFAUT QU IL GARDE EST UNE BOITE QUI NE SE DESSINE PAS, SANS RIEN
 * CASSER. `szBrouillonProposer` sort par `return false` quand la reponse n a pas
 * de `brouillon` — aucune erreur, aucune trace, un ecran parfaitement normal.
 * Dix-huit fenetres branchent ce mecanisme ; le 2026-09-13, sa boite n etait
 * dessinee que dans UNE, et les dix-sept autres passaient au vert.
 *
 * ⚠⚠⚠ ET LA VRAIE LECON EST AILLEURS : ce qui a gele la couverture, c est un
 * COMMENTAIRE. `reponses-fenetres.js` affirmait que `fournisseur.js` et
 * `collection.js` etaient « les SEULES » fenetres atteignables sans simuler de
 * clic. La mesure en compte HUIT. La phrase etait fausse, personne ne l a
 * verifiee, et elle donnait une raison de ne pas chercher.
 * ➡ UNE LIMITE ECRITE DANS UN COMMENTAIRE N EST PAS UNE LIMITE MESUREE.
 *   Ce banc existe pour que cette limite-la soit desormais MESUREE a chaque
 *   passage, et plus jamais affirmee.
 *
 * ══ CE QU IL FAIT, ET POURQUOI C EST LA SEULE FACON HONNETE ═════════════════
 * << Atteignable sans clic >> ne se lit pas dans le code : ca depend de la
 * fenetre, de son jeu de reponses, et du chemin que prend son chargement. Le
 * banc ne le DEDUIT donc pas — il l EPROUVE. Pour chaque fenetre sans cas de
 * reprise, il rejoue tous ses cas en INJECTANT un brouillon, et regarde si la
 * boite parait :
 *   · elle ne parait pas  → la declaration << derriere un geste >> est VRAIE ;
 *   · elle parait         → la fenetre est devenue atteignable, et il REFUSE en
 *                           disant quel cas y mene et quoi ajouter.
 * Une declaration qui se verifie toute seule ne peut pas pourrir.
 *
 * ⚠ Les huit fenetres QUI ONT un cas de reprise ne sont pas rejouees ici :
 * `verifier-fenetres.js` les eprouve deja, et mieux — par leur `exige`, qui
 * exige le texte de la boite ET le libelle propre a la fenetre.
 *
 *   node tools/banc-brouillon-reprise.js
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DOS = path.join(RACINE, 'src', 'fenetres');
const { executerPage } = require('./executer-page.js');
const JEU = require('./reponses-fenetres.js');

const NOM_CAS = 'reprise d’une saisie en cours';
const TITRE_BOITE = 'Une saisie non terminée';

/* ── LES FENETRES DONT LA BOITE VIT DERRIERE UN GESTE ────────────────────────
   ⚠ CE N EST PAS UNE DISPENSE, C EST UNE AFFIRMATION QUE LE BANC VERIFIE. Chaque
   ligne dit POURQUOI la boite est hors de portee : l outil n execute que le
   chargement, il ne clique pas. Le jour ou l une d elles appelle
   `szBrouillonProposer()` au chargement, le banc le voit et refuse. */
const DERRIERE_UN_GESTE = {
  'abonnes.js':          'bouton « Nouvel abonné » (BOITE = ajout)',
  'banque.js':           'boutons « Ajouter une écriture » et « Modifier »',
  'cartescadeaux.js':    'bouton « Nouvelle carte »',
  'client.js':           'bouton « Modifier » de la fiche',
  'comptable.js':        'bascule du formulaire du carnet, et bouton « Modifier »',
  'coupons.js':          'boutons « Nouveau coupon » et « Modifier »',
  'liens.js':            'bascule du formulaire des liens',
  'promotions.js':       'bouton « Nouvelle offre »',
  'recommandations.js':  'boutons « Nouvelle règle » et « Éditer »',
  'sociaux.js':          'boutons « Nouveau patron » et « Modifier »',
};

/* Le brouillon injecte : son CONTENU n a pas d importance, seule sa PRESENCE
   decide si la boite parait. `profil` et `ilYaMin` sont la forme reelle. */
const BROUILLON = {
  ok: true, profil: 'drankforce@gmail.com', ts: 1757000000000, ilYaMin: 47,
  brouillon: { __sonde: 'x' },
};

/* Meme releve d identifiants que `verifier-fenetres.js` : sans lui, le faux
   document rend un element pour n importe quel `getElementById`, et la fenetre
   prend des chemins qu elle ne prend pas en vrai.
   ⚠ AUCUN ANTISLASH EN CLAIR (il fond dans l outillage) : `fromCharCode(92)`. */
const idsDe = (pc) => {
  const plat = pc.split(String.fromCharCode(92)).join('');
  const sans = plat.replace(/getElementById\(\s*["'][^"']*["']\s*\)/g, 'getElementById(0)');
  const rx = /["']([A-Za-z][A-Za-z0-9_:.-]{1,60})["']/g;
  const out = []; let m;
  while ((m = rx.exec(sans))) out.push(m[1]);
  return out;
};

(async () => {
  /* 1. Les fenetres qui branchent le mecanisme, lues sur le DISQUE. Une liste
        tenue a la main se perimerait au premier branchement ajoute. */
  const branchees = fs.readdirSync(DOS)
    .filter((f) => f.endsWith('.js') && f !== 'socle.js')
    .filter((f) => /szBrouillonProposer\s*\(/.test(fs.readFileSync(path.join(DOS, f), 'utf8')))
    .sort();

  console.log('');
  console.log('== LA BOITE DE REPRISE D UNE SAISIE ==');
  console.log('  ' + branchees.length + ' fenetre(s) branchent le mecanisme');
  console.log('');

  /* ⚠ UN BANC QUI NE TROUVE RIEN NE DOIT PAS SE TAIRE. */
  if (branchees.length < 10) {
    console.log('  NON  ' + branchees.length + ' fenetre(s) seulement — le releve ne marche plus,');
    console.log('       et un banc qui ne mesure rien repondrait << tout va bien >>.');
    process.exit(1);
  }

  let mal = 0;
  let casJoues = 0;
  const avecCas = [];
  const aEprouver = [];

  for (const f of branchees) {
    const v = JEU[f];
    const liste = Array.isArray(v) ? v : (v ? [{ nom: '(cas unique)', reponses: v }] : null);
    if (!liste) {
      console.log('  NON  ' + f.padEnd(22) + 'branche le brouillon mais est ABSENTE du jeu d epreuve.');
      mal++; continue;
    }
    if (liste.some((c) => c.nom === NOM_CAS)) { avecCas.push(f); continue; }
    aEprouver.push({ fichier: f, liste });
  }

  /* 2. Les declarations perimees : une fenetre nommee ici qui ne branche plus
        rien, ou qui a gagne son cas de reprise entre-temps. */
  for (const f of Object.keys(DERRIERE_UN_GESTE)) {
    if (!branchees.includes(f)) {
      console.log('  NON  ' + f.padEnd(22) + 'est declaree << derriere un geste >> mais ne branche plus le brouillon.');
      mal++;
    } else if (avecCas.includes(f)) {
      console.log('  NON  ' + f.padEnd(22) + 'a maintenant un cas de reprise : retirez-la de DERRIERE_UN_GESTE.');
      mal++;
    }
  }

  console.log('  ' + avecCas.length + ' fenetre(s) ont leur cas de reprise (eprouvees par verifier-fenetres) :');
  console.log('    ' + avecCas.join(', '));
  console.log('');
  console.log('  ' + aEprouver.length + ' fenetre(s) sans cas — on EPROUVE qu elles sont bien hors de portee :');
  console.log('');

  /* 3. La mesure : un brouillon injecte, et la boite ne doit PAS paraitre. */
  for (const { fichier, liste } of aEprouver) {
    const pourquoi = DERRIERE_UN_GESTE[fichier];
    if (!pourquoi) {
      console.log('  NON  ' + fichier.padEnd(22) + 'n a ni cas de reprise ni declaration — sa boite n est mesuree par rien.');
      mal++; continue;
    }
    let mod;
    try { mod = require(path.join(DOS, fichier)); }
    catch (e) { console.log('  NON  ' + fichier.padEnd(22) + 'illisible (' + e.message + ')'); mal++; continue; }
    const fabrique = Object.values(mod).find((x) => typeof x === 'function');
    if (!fabrique) { console.log('  NON  ' + fichier.padEnd(22) + 'aucune fabrique de page'); mal++; continue; }

    let atteint = null;
    let joues = 0;
    for (const c of liste) {
      let pc;
      try { pc = String(fabrique(c.id || '')); } catch (e) { continue; }
      const a = pc.indexOf('<script>'), b = pc.indexOf('</script>');
      if (a < 0 || b < a) continue;
      const rep = Object.assign({}, c.reponses, { 'brouillon:lire': BROUILLON });
      let ex;
      try { ex = await executerPage(pc.slice(a + 8, b), rep, { ids: idsDe(pc) }); }
      catch (e) { continue; }
      joues++;
      casJoues++;
      if (String(ex.html || '').indexOf(TITRE_BOITE) >= 0) { atteint = c.nom; break; }
    }

    /* ⚠⚠ UN CAS QUI N A PAS TOURNE NE PROUVE RIEN — et il se lirait « hors de
       portee », c est-a-dire exactement comme une reussite. Si la fabrique
       leve, si la page n a pas de script, si l executeur echoue, on sort par
       `continue` et l on ne mesure rien. On le DIT plutot que de compter un
       silence pour une preuve. */
    if (!atteint && !joues) {
      console.log('  NON  ' + fichier.padEnd(22) + 'AUCUN de ses ' + liste.length
        + ' cas n a pu etre joue — rien n a ete mesure ici.');
      mal++; continue;
    }

    if (atteint) {
      console.log('  NON  ' + fichier.padEnd(22) + 'la boite EST dessinee par le cas << ' + atteint + ' >>.');
      console.log('       Elle n est donc plus hors de portee : ajoutez-la a CAS_REPRISE dans');
      console.log('       tools/reponses-fenetres.js, et retirez-la de DERRIERE_UN_GESTE ici.');
      mal++;
    } else {
      console.log('  OK   ' + fichier.padEnd(22) + joues + ' cas joue(s) — hors de portee : ' + pourquoi);
    }
  }

  console.log('');
  console.log('  ' + casJoues + ' cas rejoue(s) avec un brouillon injecte');

  /* ⚠ LE PLANCHER. Les dix fenetres declarees portent ensemble une quarantaine
     de cas : si ce compte s effondre, c est que les pages ne tournent plus et
     que le banc raconte un silence. */
  if (aEprouver.length && casJoues < 2 * aEprouver.length) {
    console.log('  NON  trop peu de cas joues (' + casJoues + ' pour ' + aEprouver.length
      + ' fenetres) — la mesure ne vaut rien.');
    mal++;
  }

  console.log('');
  if (mal) {
    console.log('>>> ' + mal + ' probleme(s) — une boite de reprise n est mesuree par rien.');
    process.exit(1);
  }
  console.log('>>> ' + avecCas.length + ' boite(s) dessinee(s) et exigee(s), '
    + aEprouver.length + ' hors de portee ET VERIFIEES comme telles');
})();
