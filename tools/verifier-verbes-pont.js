'use strict';

/*
 * LES VERBES DU PRÉCHARGEMENT — CHAQUE `P.xxx()` APPELÉ EXISTE-T-IL ?
 * =============================================================================
 * `verifier-appels-fenetres.js` garde les appels NUS d'une fenêtre (`dire(...)`
 * défini nulle part → le bouton ne fait rien). Il ne regarde pas les appels de
 * MEMBRE, donc pas `P.majDecision(...)`, `P.fermer()`, `P.enregistrerExport(...)`.
 * Ces verbes-là ne vivent pas dans la fenêtre : ils sont exposés par
 * `src/pont-preload.js` via `contextBridge`.
 *
 * ⚠⚠ PROVOQUÉ LE 2026-09-10, ET AUCUN DES QUINZE BANCS N'A BOUGÉ. En renommant
 * `majDecision` en `majDecisionn` dans le préchargement — donc en retirant le
 * verbe qu'une fenêtre venait d'apprendre à appeler — `node tools/bancs.js` a
 * répondu « les 15 bancs passent ». Le symptôme réel aurait été un bouton
 * « Installer maintenant » qui ne fait rien, sur l'écran d'une mise à jour.
 *
 * ⚠ ET LE TROU COUVRE LES 96 FENÊTRES, pas seulement la dernière : `P.fermer`,
 * `P.pleinEcran`, `P.ajusterHauteur`, `P.ouvrirModule`, `P.dossierExports`…
 * n'importe lequel pouvait disparaître du préchargement sans qu'un contrôle le
 * dise. C'est la même famille que le trou de `getContext` dans le faux DOM : ce
 * qu'aucun outil ne regarde finit par ne plus être vrai.
 *
 * ⚠ POURQUOI CE N'EST PAS `verifier-appels-fenetres` QUI S'EN CHARGE : il
 * résout des noms DANS le script de la fenêtre. Ici la définition est dans un
 * AUTRE fichier, et la faute se lit en croisant les deux. Une question
 * différente mérite un contrôle différent — mêler les deux aurait rendu le
 * message d'échec incompréhensible.
 *
 * ⚠ LE PRÉCHARGEMENT EST LU, PAS EXÉCUTÉ. Il fait `require('electron')`, qui
 * n'existe pas hors d'Electron. On lit donc son texte et on relève les clés du
 * `exposeInMainWorld` — comme le fait déjà `banc-jetons` pour le CSS.
 */

const fs = require('fs');
const path = require('path');

const DOS_FEN = path.join(__dirname, '..', 'src', 'fenetres');
const PRELOAD = path.join(__dirname, '..', 'src', 'pont-preload.js');

/* ⚠⚠ LE MÊME BLANCHIMENT QUE `verifier-appels-fenetres.js`, ET SÛREMENT PAS UN
   AUTRE. Mon premier jet était un automate à états (code / chaîne / commentaire
   / gabarit). Il paraissait plus rigoureux, et il a tout blanchi : dans `esc()`
   il y a `.replace(/"/g, '&quot;')` — le guillemet DANS l expression régulière
   l a fait entrer en état << chaîne >>, et il n en est jamais ressorti. Résultat :
   ce banc rendait VERT sur les deux pannes que je venais de lui poser.

   ⚠ CE QUI SAUVE LA MÉTHODE PAR MOTIFS, et c est contre-intuitif : `[^'\n]`
   INTERDIT À UNE CHAÎNE DE FRANCHIR UNE FIN DE LIGNE. Un guillemet orphelin
   reste donc un caractère isolé et inoffensif, au lieu d avaler le reste du
   fichier. Un automate << correct >> n a pas ce filet : il a raison partout sauf
   sur les littéraux d expression régulière, et il se trompe alors TOTALEMENT.

   ⚠ ET L ORDRE EST LE SUJET — 71 faux positifs payés pour l apprendre : LES
   CHAÎNES D ABORD, LES COMMENTAIRES ENSUITE. Retirer les commentaires en premier
   fait manger le `//` d une URL écrite DANS une chaîne, guillemet fermant
   compris, et tout se décale à partir de là. Les DEUX sortes de guillemets en
   une seule alternance, aussi : deux passes successives font qu une apostrophe
   française dans une chaîne à guillemets doubles ouvre une fausse chaîne simple.

   ⚠ Je n ai pas importé la fonction de l autre banc parce qu elle n est pas
   exportée, et l exporter l aurait fait dépendre de moi. Le commentaire
   ci-dessus est le lien : si l un des deux change, l autre doit être relu. */
function blanchir(src) {
  return String(src)
    .replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/g, "''")
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:'"])\/\/[^\n]*/g, '$1 ');
}

/* Les verbes exposés. On relève les clés de premier niveau de l'objet passé à
   `exposeInMainWorld`, en comptant les accolades pour ne pas prendre les clés
   d'un objet imbriqué (le groupe `veilleur` en portait, avant son retrait). */
function verbesExposes() {
  const brut = fs.readFileSync(PRELOAD, 'utf8');
  const src = blanchir(brut);
  const i = src.indexOf('exposeInMainWorld');
  if (i < 0) return null;
  const j = src.indexOf('{', i);
  if (j < 0) return null;
  const noms = new Set();
  let prof = 0;
  for (let k = j; k < src.length; k++) {
    const c = src[k];
    if (c === '{' || c === '(' || c === '[') { prof++; continue; }
    if (c === '}' || c === ')' || c === ']') { prof--; if (prof <= 0) break; continue; }
    if (prof !== 1) continue;
    // Une clé de premier niveau : un identifiant suivi de `:` ou de `(`.
    const reste = src.slice(k);
    const m = /^([A-Za-z_$][\w$]*)\s*[:(]/.exec(reste);
    if (m) { noms.add(m[1]); k += m[1].length - 1; }
  }
  return noms;
}

const exposes = verbesExposes();
if (!exposes || !exposes.size) {
  console.log('ECHEC  impossible de relever les verbes de src/pont-preload.js.');
  console.log('       Un contrôle qui ne trouve rien dirait « tout est bon » : on refuse.');
  process.exit(1);
}

let fenetres = 0, appels = 0;
const fautes = [];

for (const f of fs.readdirSync(DOS_FEN).filter((n) => n.endsWith('.js') && n !== 'socle.js')) {
  const mod = require(path.join(DOS_FEN, f));
  const fabrique = Object.values(mod).find((v) => typeof v === 'function');
  if (!fabrique) continue;
  let page;
  try { page = String(fabrique('')); } catch (e) { continue; }
  /* On ne regarde QUE la portion de script : un `P.xxx` dans du texte affiché
     n'est pas un appel. */
  const m = /<script>([\s\S]*?)<\/script>/.exec(page);
  if (!m) continue;
  fenetres++;
  const src = blanchir(m[1]);
  /* Le pont s'appelle `P` par convention dans toutes les fenêtres, mais
     certaines écrivent `window.szPont.xxx()` ou `szPont.xxx()`. Les trois
     formes désignent le même objet. */
  const rx = /(?:^|[^\w$.])(?:P|szPont|window\.szPont)\.([A-Za-z_$][\w$]*)\s*\(/g;
  let u;
  const vus = new Set();
  while ((u = rx.exec(src))) {
    appels++;
    const verbe = u[1];
    if (exposes.has(verbe)) continue;
    const cle = f + ' :: ' + verbe;
    if (vus.has(cle)) continue;
    vus.add(cle);
    /* La ligne, pour que la faute se corrige sans la chercher. */
    const avant = src.slice(0, u.index).split('\n').length;
    fautes.push({ fichier: f, verbe, ligne: avant });
  }
}

if (fautes.length) {
  console.log('ECHEC  ' + fautes.length + ' verbe(s) du pont appelé(s) mais NON exposé(s) par');
  console.log('       src/pont-preload.js — le bouton qui les appelle ne fait RIEN.');
  for (const x of fautes) {
    console.log('  NON  ' + x.fichier.padEnd(24) + 'P.' + x.verbe
      + ' (ligne ~' + x.ligne + ' du script)');
  }
  console.log('');
  console.log('  Verbes exposés : ' + [...exposes].sort().join(', '));
  process.exit(1);
}

console.log('✓ les ' + appels + ' appels de verbe du pont, dans ' + fenetres
  + ' fenêtres, visent tous un verbe exposé (' + exposes.size + ' verbes).');
