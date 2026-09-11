'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   LE RECOURS « MOT DE PASSE OUBLIÉ » N'APPARAÎT QU'APRÈS UNE ERREUR
   ═══════════════════════════════════════════════════════════════════════════
   ⚠⚠ POURQUOI UN BANC À LUI SEUL. Sa demande du 2026-09-11 : « ne l'affiche pas
   si la personne ne s'est pas trompée de mot de passe ; après la première erreur
   tu peux l'afficher ». C'est quatre morceaux qui ne tiennent QUE parce qu'ils se
   connaissent — une règle de style, un état, un gabarit qui le lit, un appel dans
   la branche d'échec. Retirer n'importe lequel des quatre ne casse RIEN : la
   fenêtre s'ouvre, elle dessine, tous les autres bancs restent verts. Le bouton
   est simplement toujours visible, ou plus jamais.

   ⚠ ET `verifier-fenetres` NE PEUT PAS L'ÉPROUVER : son exécuteur charge la page
   mais ses `addEventListener` sont des fonctions vides — rien ne se CLIQUE, donc
   la branche d'échec de `entrer()` ne s'exécute jamais. Un banc qui ne peut pas
   atteindre le chemin ne le garde pas ; autant le dire et garder le contrat
   autrement, par lecture, en NOMMANT chaque maillon.

   ⚠ LA LIMITE EST ASSUMÉE : ceci lit du texte, ça ne prouve pas l'exécution. Ça
   prouve que les quatre maillons sont là et qu'ils se citent. C'est exactement ce
   qui manquait — pas une preuve de comportement, une preuve de CHAÎNE.

   Panne provoquée à l'écriture (2026-09-11), les quatre maillons retirés un par
   un : les quatre ont été REFUSÉS, chacun par son propre message. */
const fs = require('fs');
const path = require('path');

const F = path.join(__dirname, '..', 'src', 'fenetres', 'connexion.js');
const src = fs.readFileSync(F, 'utf8');

const fautes = [];
const exige = (vrai, quoi) => { if (!vrai) fautes.push(quoi); };

/* Découpe une région nommée : du début donné jusqu'à la bannière suivante. Les
   fonctions de cette fenêtre sont séparées par des `/* ══`, on s'en sert. */
const region = (debut) => {
  const i = src.indexOf(debut);
  if (i < 0) return '';
  const j = src.indexOf('/* ══', i + debut.length);
  return src.slice(i, j < 0 ? src.length : j);
};

// ── ① La règle de style : le voile doit RETIRER le bouton, pas juste l'effacer.
{
  const i = src.indexOf('.cx-recours.cx-voile{');
  if (i < 0) {
    fautes.push('la règle `.cx-recours.cx-voile` n’existe pas — le bouton n’est jamais caché');
  } else {
    const bloc = src.slice(i, src.indexOf('}', i));
    exige(bloc.indexOf('visibility:hidden') >= 0,
      'le voile n’a pas `visibility:hidden` — le bouton resterait ATTEIGNABLE à la '
      + 'tabulation et LU par un lecteur d’écran, tout en étant invisible : le pire des deux');
    exige(bloc.indexOf('pointer-events:none') >= 0,
      'le voile n’a pas `pointer-events:none` — un bouton transparent reste CLIQUABLE');
  }
}

// ── ② Le gabarit lit l'état.
{
  const g = region('function ecranLogin(){');
  if (!g) fautes.push('`ecranLogin` introuvable — la fenêtre a changé de forme, ce banc est à relire');
  else {
    exige(g.indexOf('cx-recours') >= 0,
      '`ecranLogin` ne pose plus la classe `cx-recours` sur le pied du formulaire');
    exige(g.indexOf('DEJA_RATE') >= 0 && g.indexOf('cx-voile') >= 0,
      '`ecranLogin` ne voile plus le recours selon `DEJA_RATE` — le bouton serait visible '
      + 'd’emblée, ce qui est exactement ce qu’il a demandé de retirer');
  }
}

// ── ③ L'état et la fonction qui le lève.
{
  exige(/var\s+DEJA_RATE\s*=\s*false/.test(src),
    '`DEJA_RATE` n’est plus déclaré à faux au chargement — le recours s’afficherait '
    + 'dès la première ouverture');
  const d = region('function devoilerOubli(){');
  if (!d) fautes.push('`devoilerOubli` n’existe plus — plus rien ne peut lever le voile');
  else {
    exige(d.indexOf('DEJA_RATE = true') >= 0,
      '`devoilerOubli` ne mémorise pas le passage — le recours redisparaîtrait au '
      + 'prochain redessin de l’écran (le défaut du sélecteur de date, 5.3.0)');
    exige(d.indexOf('cx-voile') >= 0,
      '`devoilerOubli` ne retire pas le voile du DOM — l’état changerait sans que rien '
      + 'ne se voie avant un redessin');
  }
}

// ── ④ L'appel, dans la branche d'échec de la connexion ET NULLE PART AILLEURS.
{
  const e = region('function entrer(){');
  if (!e) fautes.push('`entrer` introuvable — la fenêtre a changé de forme, ce banc est à relire');
  else {
    exige(e.indexOf('devoilerOubli()') >= 0,
      '`entrer` n’appelle plus `devoilerOubli()` — un mot de passe refusé n’offrirait '
      + 'JAMAIS le recours, et le bouton serait mort pour tout le monde');
    /* ⚠ LA MOITIÉ QU’ON OUBLIE : que ça n’arrive pas ailleurs. Un code à six
       chiffres refusé, une étape qui ne se charge pas, ce ne sont pas des mots de
       passe oubliés — offrir le recours là enverrait quelqu’un réinitialiser un
       mot de passe qui était bon. */
    /* ⚠ LA DÉFINITION N'EST PAS UN APPEL : `function devoilerOubli(){` contient
       la même suite de caractères, et mon premier jet la comptait — le banc
       refusait une fenêtre saine. Un relevé qui compte sa propre déclaration
       invente une faute à tous les coups. */
    const appels = (t) => t.split('devoilerOubli()').length - 1
      - (t.split('function devoilerOubli()').length - 1);
    const ailleurs = appels(src) - appels(e);
    exige(ailleurs === 0,
      'le recours est dévoilé ' + ailleurs + ' fois HORS de `entrer` — les autres échecs '
      + 'de cet écran ne sont pas des mots de passe oubliés');
  }
}

if (fautes.length) {
  console.error('✗ le recours « mot de passe oublié » ne tient plus :');
  fautes.forEach((x) => console.error('   — ' + x));
  process.exit(1);
}
console.log('✓ le recours « mot de passe oublié » reste caché jusqu’au premier échec '
  + '(4 maillons vérifiés).');
