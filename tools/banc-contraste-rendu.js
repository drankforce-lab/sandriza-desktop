#!/usr/bin/env node
/* ============================================================================
   banc-contraste-rendu.js — LES CONTRASTES DES 92 FENÊTRES, MESURÉS À L'ÉCRAN
   ----------------------------------------------------------------------------
   Le jumeau de `tools/check/banc-contraste-rendu.js` du dépôt du site, porté ici
   le 2026-09-05 — parce que c'est ICI que vivent désormais les écrans. La mesure
   côté site l'a dit sans détour : sur 140 rendus du panneau web, 132 ne sont plus
   qu'un avis « cet écran vit maintenant dans l'application ». Garder les couleurs
   du site et pas celles des fenêtres, c'est garder le vestibule et laisser la
   maison ouverte.

   ── POURQUOI IL NE REMPLACE PAS `banc-texte-sur-fond.js` ────────────────────
   Celui-là lit le CSS et apparie des couleurs ÉCRITES. Il ne peut pas savoir ce
   que vaut `var(--tx2)` dans une fenêtre donnée, ni ce que donne un voile
   `rgba(255,255,255,.06)` posé sur un dégradé, ni quelle couleur gagne quand
   deux règles de même spécificité se suivent. Ce banc-ci ne lit rien : il OUVRE
   chaque fenêtre dans Chrome, la laisse se dessiner avec ses vraies données, et
   demande au navigateur la couleur qu'il a **peinte**.

   ── COMMENT UNE FENÊTRE SE DESSINE SANS L'APPLICATION ───────────────────────
   Chaque module de `src/fenetres` expose une fabrique qui rend une PAGE
   complète. Son script parle au processus principal par `window.szPont`. On lui
   en donne un FAUX, alimenté par `tools/reponses-fenetres.js` — le même jeu de
   réponses qui sert déjà à `executer-page.js`, et pour la même raison, apprise
   le 2026-08-07 : **sans pont, la fenêtre affiche poliment « indisponible » et
   l'on mesure un écran de refus en croyant mesurer l'écran.**
   Les 92 fenêtres ont un jeu de réponses. Celles qui n'en auraient pas sont
   comptées et NOMMÉES : « je n'ai pas regardé » n'est pas « c'est bon ».

   ── AUCUNE DÉPENDANCE, ET SURTOUT PAS PUPPETEER ─────────────────────────────
   ⚠ Contrairement à `voir-fenetre.js`, ce banc n'a besoin d'AUCUNE installation.
   Le Chrome du poste rend très bien en `--headless=new` **à condition de lui
   donner un `--user-data-dir` neuf** : c'est le profil PARTAGÉ qui le faisait
   « déléguer à la session ouverte et ne rien rendre ». Un banc qui exige un
   moteur de 180 Mo ne tourne pas dans la construction, donc ne garde rien.

   ── UNE SEULE OUVERTURE DE CHROME, DES CENTAINES DE PAGES ───────────────────
   92 fenêtres × 2 modes × 6 thèmes = 1 104 rendus. Lancer Chrome 1 104 fois
   prendrait un quart d'heure. On ouvre donc UNE page pilote qui les enfile dans
   une `iframe`, et **chaque page se mesure elle-même** et écrit son résultat
   dans la console — aucune lecture d'un document à l'autre, donc rien à
   négocier avec l'isolation des origines `file://`.

   ── CE QU'IL NE VOIT PAS, ET C'EST ÉCRIT ICI EXPRÈS ─────────────────────────
   Un garde ne voit que ce qu'il mesure (leçon du 2026-09-04) :
     1. **Ce qui demande un geste.** Le jeu de réponses conduit la fenêtre
        jusqu'à son DESSIN, pas au-delà : aucun clic, aucune frappe. Les écrans
        qui n'apparaissent qu'après un clic (fiche reprise, second onglet…) ne
        sont pas mesurés. Même angle mort que `executer-page.js`, et il est
        déclaré là-bas aussi.
     2. **Ce qui n'est pas affiché** : surface nulle, `visibility` autre que
        `visible`. Compté et annoncé.
     3. **Les fonds en image** (`url(...)`). ⚠ Les DÉGRADÉS, eux, sont mesurés :
        on garde le pire arrêt.
     4. **Ce qui bouge encore** : une animation en cours rend la couleur
        indécidable. ⚠ En revanche, une **opacité fixe n'est PAS un angle mort** :
        elle est composée, texte et fond ensemble. Renoncer devant elle écartait
        30 éléments sur 32 dans les fenêtres — c'est-à-dire exactement là où la
        lisibilité est en jeu (bouton désactivé, bloc éteint, pictogramme pâli).
     5. **Les six THÈMES, sauf si on les demande** (`--themes`). Le défaut ne
        mesure que jour/nuit : voir la note sur le coût, plus bas.

   Usage :
     node tools/banc-contraste-rendu.js                    les 2 modes (defaut)
     node tools/banc-contraste-rendu.js --themes           + les 6 themes (long)
     node tools/banc-contraste-rendu.js accueil commandes  quelques fenetres
     node tools/banc-contraste-rendu.js --tout-voir        y compris ce qui passe
     node tools/banc-contraste-rendu.js --garder           garder les pages d essai
   ========================================================================== */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const RACINE = path.resolve(__dirname, '..');
const DOS_FEN = path.join(RACINE, 'src', 'fenetres');
const REPONSES = require('./reponses-fenetres.js');
const DECLARE = require('./contraste-rendu-declare.js');
const INMESURABLES = DECLARE.INMESURABLES || {};
const COEUR = fs.readFileSync(path.join(__dirname, 'contraste-rendu-coeur.js'), 'utf8');

const ARGS = process.argv.slice(2);
const OPT = (n) => ARGS.includes(n);
const TOUT_VOIR = OPT('--tout-voir');
const GARDER = OPT('--garder');
const CHOISIES = ARGS.filter((a) => !a.startsWith('--'));

const MODES = ['nuit', 'jour'];
/* ⚠⚠ LE BALAYAGE COMPLET N'EST PLUS LE DÉFAUT, ET C'EST DÉLIBÉRÉ.
   92 fenêtres × 2 modes × 6 thèmes = 1 104 rendus, soit près d'une demi-heure
   et des centaines de lancements de navigateur. Un contrôle qu'on n'ose pas
   lancer ne garde rien, et celui-là a fini par nuire au poste sur lequel il
   tournait. Par défaut : les DEUX MODES, sans les thèmes — 184 rendus, la
   couverture qui trouve l'essentiel (jour/nuit est là où la dette vit).
   Les six thèmes restent atteignables par `--themes`, en connaissance de cause. */
const TOUS_THEMES = OPT('--themes');
const THEMES = TOUS_THEMES ? ['', 'ocean', 'violet', 'ardoise', 'graphite', 'emeraude'] : [''];

/* ══ 0. LE BANC RANGE DERRIÈRE LUI — LA LEÇON DU 2026-09-05 ═════════════════
   ⚠⚠⚠ CE BANC A MIS LE POSTE À GENOUX. Il lançait un Chrome par lot et n'en
   fermait AUCUN : la seule sortie prévue était un `window.close()` de la page
   pilote, qui ne part jamais quand le moteur de rendu est tombé — c'est-à-dire
   précisément dans le cas où il faudrait ranger. Cinquante-six lots plus tard,
   des CENTAINES de processus survivaient, la mémoire était épuisée, et Windows
   empilait les fenêtres « chrome.exe — Application Error » sur le bureau de
   quelqu'un en train de travailler. Signalé par l'utilisateur, capture à l'appui.

   ⚠ LA RÈGLE QUI EN SORT, ET ELLE DÉPASSE CE FICHIER : **un outil qui démarre un
   processus doit le tuer lui-même, dans TOUS les cas — surtout ceux où il a
   échoué.** Compter sur la page pour se fermer, c'est confier le ménage à
   l'endroit qui vient de casser.

   ⚠ ON NE TUE QUE LES NÔTRES. `taskkill /IM chrome.exe` fermerait le navigateur
   de la personne, ses onglets compris. Chaque lot a un `--user-data-dir` unique
   sous notre dossier temporaire : c'est cette chaîne, cherchée dans la ligne de
   commande, qui distingue nos processus des siens. Sans ce filtre, le remède
   serait plus brutal que la panne.

   ⚠ ET LE MÉNAGE SE FAIT AUSSI QUAND ON NOUS INTERROMPT (Ctrl+C, exception) :
   c'est justement là qu'on abandonnait le plus de processus. */
/* ⚠⚠ ON RECONNAÎT LES NÔTRES PAR LE NOM DU DOSSIER TEMPORAIRE, PAS PAR LE CHEMIN
   COMPLET — et ce détail a fait échouer la première correction en silence.
   `-like` de PowerShell ne connaît pas l'antislash comme échappement ; j'avais
   pourtant DOUBLÉ les antislashs du chemin « pour être prudent », ce qui rendait
   le motif impossible à satisfaire. Le ménage tournait, ne trouvait rien, ne
   disait rien, et cent processus survivaient — un remède qui se croit appliqué.
   Le nom du dossier (`sz-cr-a1b2c3`) est unique à cette exécution ET sans
   antislash : rien à échapper, donc rien à se tromper. */
let JETON = null;                      // nom du dossier temporaire de CETTE exécution
const PIDS = new Set();                // les navigateurs que NOUS avons lancés

/* ⚠⚠ ON TUE L'ARBRE, PAS LE PROCESSUS. Chrome éclate en une dizaine de
   processus — moteur de rendu, GPU, utilitaires — et **eux ne portent pas le
   `--user-data-dir` dans leur ligne de commande**. Le filtre par dossier
   temporaire n'attrape donc que le processus PÈRE, et le reste survit.
   Ça ne s'était pas vu tant qu'on attendait la sortie de Chrome (`spawnSync`) :
   il était déjà parti de lui-même, et le ménage ne servait qu'au cas rare. En
   passant au lancement asynchrone, 135 processus sont restés après un banc de
   trois secondes. Le père connaît ses enfants : on le tue AVEC eux (`/T` sous
   Windows, le groupe de processus ailleurs), et le balayage par dossier reste
   en second rideau pour ce qui aurait échappé. */
function tuerArbre(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/F', '/T', '/PID', String(pid)], { stdio: 'ignore', timeout: 30000 });
    } else {
      try { process.kill(-pid, 'SIGKILL'); } catch (e) { try { process.kill(pid, 'SIGKILL'); } catch (e2) {} }
    }
  } catch (e) {}
  PIDS.delete(pid);
}

function tuerNosChrome() {
  for (const pid of Array.from(PIDS)) tuerArbre(pid);
  if (!JETON) return 0;
  try {
    if (process.platform === 'win32') {
      /* ⚠⚠ ON DEMANDE LES NUMÉROS, PUIS ON TUE CHAQUE **ARBRE** — et il a fallu
         trois versions pour y arriver.
         1. `Stop-Process` sur les processus qui portent le dossier temporaire :
            ça n'attrape que le PÈRE, ses moteurs de rendu survivent (ils ne
            portent pas `--user-data-dir` dans leur ligne de commande).
         2. Tuer l'arbre du numéro rendu par `spawn` : sur Windows, Chrome SE
            RELANCE dans un second processus et le premier meurt aussitôt. Le
            numéro qu'on surveillait n'était donc plus celui du navigateur —
            43 processus restaient après le balayage des six thèmes.
         3. Celle-ci : on RETROUVE le vrai navigateur par son dossier temporaire,
            et on tue SON arbre. Le père par la ligne de commande, les enfants
            par le père. */
      const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
        "@(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | " +
        "Where-Object { $_.CommandLine -like '*" + JETON + "*' }) | " +
        'ForEach-Object { $_.ProcessId }',
      ], { encoding: 'utf8', timeout: 60000 });
      const pids = String((r && r.stdout) || '').split(/\s+/).map(Number).filter(Boolean);
      for (const pid of pids) {
        spawnSync('taskkill', ['/F', '/T', '/PID', String(pid)], { stdio: 'ignore', timeout: 30000 });
      }
      return pids.length;
    }
    spawnSync('pkill', ['-f', JETON], { stdio: 'ignore', timeout: 30000 });
  } catch (e) {}
  return 0;
}

let menageFait = false;
const menageFinal = () => { if (menageFait) return; menageFait = true; tuerNosChrome(); };
process.on('exit', menageFinal);
process.on('SIGINT', () => { menageFinal(); process.exit(130); });
process.on('SIGTERM', () => { menageFinal(); process.exit(143); });
process.on('uncaughtException', (e) => { menageFinal(); console.error(e); process.exit(1); });

/* ── 1. CHROME ────────────────────────────────────────────────────────────── */
function trouverChrome() {
  const cands = [
    path.join(process.env['ProgramFiles'] || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['LOCALAPPDATA'] || '', 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const c of cands) { try { if (c && fs.existsSync(c)) return c; } catch (e) {} }
  return null;
}

/* ── 2. LES FENÊTRES, ET LEUR JEU DE RÉPONSES ─────────────────────────────── */
/* ⚠ ON ÉNUMÈRE LE DOSSIER, on ne recopie pas une liste. Une liste écrite à la
   main se périme à la première fenêtre ajoutée, et le banc reste vert en ayant
   cessé de regarder — c'est la panne qu'aucun contrôle ne signale. */
function fenetres() {
  const out = [];
  const sansJeu = [];
  for (const f of fs.readdirSync(DOS_FEN).filter((x) => x.endsWith('.js')).sort()) {
    const nom = f.replace(/\.js$/, '');
    if (CHOISIES.length && !CHOISIES.includes(nom)) continue;
    let mod;
    try { mod = require(path.join(DOS_FEN, f)); } catch (e) { continue; }
    const fabrique = Object.values(mod).find((v) => typeof v === 'function');
    if (!fabrique) continue;                       // socle.js : pas une fenêtre
    /* ⚠ LE JEU DE RÉPONSES A DEUX FORMES, et n'en connaître qu'une écarte des
       fenêtres en silence. La plupart sont un TABLEAU de scénarios
       ({nom, id, reponses}) ; cinq sont un OBJET d'opérations directement
       (affichage, automations, config-navigation, config-retours, imprimantes).
       Le banc les déclarait « sans jeu, donc non éprouvées » — exact, mais pour
       la mauvaise raison, et cinq écrans passaient à la trappe. */
    const brut = REPONSES[f];
    let jeu = null;
    if (Array.isArray(brut) && brut.length) jeu = brut[0];
    else if (brut && typeof brut === 'object') jeu = { id: '', reponses: brut };
    if (!jeu) { sansJeu.push(nom); continue; }
    out.push({ nom, fichier: f, fabrique, jeu });
  }
  return { liste: out, sansJeu };
}

/* ── 3. LA PAGE D'UNE FENÊTRE, PRÉPARÉE POUR SE MESURER ───────────────── */
/* ⚠⚠ LES DEUX MORCEAUX VIVENT DANS UN FICHIER, PAS DANS UNE CHAÎNE, et ce n'est
   pas du rangement. Ils étaient dans des gabarits `...` ici même : le premier
   accent grave d'un commentaire — on cite forcément `szPont` ou `opacity` —
   REFERME le gabarit, et la suite devient du code de ce fichier-ci.
   `node --check` répond OK. Cinquième fois que ce piège se referme dans le
   projet ; le remède qui tient est de ne pas mettre de code de page dans une
   chaîne. Voir [[feedback_accent_grave_referme_le_gabarit]]. */
const GABARIT = fs.readFileSync(path.join(__dirname, 'banc-contraste-rendu-page.html'), 'utf8');
const _morceau = (marque) => {
  const parts = GABARIT.split('<!-- ==== ' + marque + ' ==== -->');
  if (parts.length < 2) throw new Error('gabarit sans morceau ' + marque);
  return parts[1].split('<!-- ==== ')[0].trim();
};
const PROLOGUE_BRUT = _morceau('PROLOGUE');
const EPILOGUE_BRUT = _morceau('EPILOGUE');

/* ⚠ LES OPÉRATIONS DU SOCLE NE SONT PAS CELLES D'UNE FENÊTRE. Toute page en
   hérite : `session:activite` (la sonde de session) et `lots:etat` (le bandeau
   de lot, relu toutes les deux secondes). Aucun jeu ne les déclare, et sans
   elles le banc annonçait « 166 fenêtres ont demandé une opération absente » —
   un avertissement qui dit vrai sur chaque ligne et rien du tout au total. On y
   répond ici, une fois, et le rapport ne parle plus que des opérations
   VRAIMENT propres à un écran. */
const OPS_SOCLE = {
  'session:activite': { ok: true },
  'lots:etat': { ok: true, lots: [] },
};

function prologue(jeu) {
  const rep = Object.assign({}, OPS_SOCLE, jeu.reponses || {});
  return PROLOGUE_BRUT.replace('__REPONSES__', JSON.stringify(rep));
}

function epilogue(nom, mode, theme) {
  const contexte = nom + '/' + mode + (theme ? '/' + theme : '');
  return EPILOGUE_BRUT
    .replace('__COEUR__', COEUR)
    .split('__CONTEXTE__').join(JSON.stringify(contexte))
    .split('__NOM__').join(JSON.stringify(nom));
}

/* ── 4. LA PAGE PILOTE ────────────────────────────────────────────────────── */
/* ⚠ CHAQUE PAGE SE MESURE ELLE-MÊME et écrit dans la console ; la pilote ne fait
   qu'enfiler les adresses. On ne lit donc JAMAIS le document d'une iframe :
   sous `file://`, cette lecture dépend d'un drapeau de ligne de commande, et un
   banc qui se tait parce qu'une permission a changé est pire qu'un banc absent.
   ⚠ UN DÉLAI DE SECOURS PAR PAGE : une fenêtre qui ne rendrait jamais son verdict
   figerait le banc, qui n'annoncerait alors RIEN — et un banc muet se relit comme
   un banc content. */
function pagePilote(adresses) {
  return `<!doctype html><meta charset="utf-8"><title>banc-contraste-rendu</title>
<style>html,body{margin:0;height:100%}iframe{border:0;width:1100px;height:760px}</style>
<iframe id="f"></iframe>
<script>
var LISTE = ${JSON.stringify(adresses)};
var i = -1, minuterie = null;
function suivant() {
  if (minuterie) { clearTimeout(minuterie); minuterie = null; }
  i++;
  if (i >= LISTE.length) {
    console.log('ELG-CR-FIN|' + LISTE.length);
    // On tourne en temps réel : sans cette fermeture, Chrome resterait ouvert et
    // le banc n'irait pas plus loin que son délai de sécurité.
    // ⚠ ON NE FERME PAS TOUT DE SUITE. Chrome écrit sa console dans le journal
    // par à-coups : fermé dans la foulée, il emporte les dernières lignes — et un
    // lot entier se lit alors comme « rien mesuré ».
    setTimeout(function () { try { window.close(); } catch (e) {} }, 1500);
    return;
  }
  document.getElementById('f').src = LISTE[i];
  minuterie = setTimeout(function () {
    console.log('ELG-CR|MUETTE ' + LISTE[i].split('/').pop());
    suivant();
  }, 4000);
}
window.addEventListener('message', function (e) { if (e.data === 'sz-fini') suivant(); });
suivant();
</script>`;
}

/* ── 5. LANCEMENT ─────────────────────────────────────────────────────────── */
function main() {
  const chrome = trouverChrome();
  if (!chrome) {
    console.error('✗ Chrome introuvable — ce banc ne peut pas mesurer sans navigateur.');
    process.exit(1);
  }
  const { liste, sansJeu } = fenetres();
  if (!liste.length) {
    console.error('✗ aucune fenêtre à mesurer.');
    process.exit(1);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-cr-'));
  JETON = path.basename(tmp);          // ce qui distingue NOS navigateurs des siens
  const adresses = [];
  let echecs = 0;
  for (const f of liste) {
    let brut;
    try { brut = String(f.fabrique(f.jeu.id || '')); }
    catch (e) { echecs++; console.error(`   ✗ ${f.nom} : la fabrique a levé — ${e.message}`); continue; }
    for (const mode of MODES) {
      for (const theme of THEMES) {
        // Le prologue s'insère juste après <head>, donc avant tout script de la
        // fenêtre ; l'épilogue à la toute fin, quand tout existe.
        let page = brut.replace(/<head([^>]*)>/i, (m) => m + '\n' + prologue(f.jeu));
        if (!/<head/i.test(brut)) page = prologue(f.jeu) + brut;
        /* ⚠⚠ LE DERNIER `</body>`, JAMAIS LE PREMIER — et c'est ce qui rendait
           `campagnes` MUETTE dans les deux modes. Son jeu de réponses contient
           l'APERÇU D'UN COURRIEL, c'est-à-dire une page HTML complète rangée
           dans une chaîne JSON. Le premier `</body>` du fichier était donc celui
           de ce courriel, à l'intérieur du prologue : l'épilogue s'insérait au
           milieu d'une chaîne, la refermait, et toute la page mourait sur
           « Invalid or unexpected token ». Le banc n'annonçait qu'un « rendu sans
           verdict » — deux écrans jamais mesurés pour une raison invisible.
           ⚠ La leçon est celle du 2026-08-07, sous une autre forme : DES DONNÉES
           D'ESSAI PEUVENT CONTENIR DU BALISAGE. Un repère cherché « au premier
           venu » finit dans la donnée plutôt que dans la structure. */
        const fin = page.toLowerCase().lastIndexOf('</body>');
        if (fin >= 0) page = page.slice(0, fin) + epilogue(f.nom, mode, theme) + page.slice(fin);
        else page += epilogue(f.nom, mode, theme);
        const nomF = `${f.nom}-${mode}${theme ? '-' + theme : ''}.html`;
        fs.writeFileSync(path.join(tmp, nomF), page, 'utf8');
        adresses.push(nomF + '?m=' + mode + (theme ? '&t=' + theme : ''));
      }
    }
  }

  /* ⚠⚠ PAR LOTS, ET CE N'EST PAS DE LA PRUDENCE DE PRINCIPE. Avec une seule page
     pilote pour les 184 rendus, le parcours s'arrêtait net à la 82ᵉ : une page
     fait tomber le moteur de rendu, et comme toutes les iframes partagent ce
     même moteur, elle emporte la pilote avec elle. Plus rien n'arrive, pas même
     le délai de secours — le banc se serait tu sur la moitié des écrans.
     Un navigateur par lot borne la casse à son lot, et le nombre de rendus
     MANQUANTS est annoncé : « je n'ai pas regardé » n'est pas « c'est bon ». */
  const PAR_LOT = 20;
  const lignes = [];
  let lots = 0, lotsMorts = 0;

  /* Le parcours d'une liste d'adresses, par paquets de `parLot`. Extrait en
     fonction pour pouvoir être RAPPELÉ page par page sur ce qui a été perdu. */
  /* ══ UN PLAFOND DE TEMPS, PARCE QUE 48 MINUTES SONT DÉJÀ PASSÉES ═══════════
     À sa première exécution dans la construction, ce banc a tourné **48
     minutes** au lieu de deux : chaque lot attendait son délai de 300 s entier
     (voir la note sur `spawnSync`, plus bas). Personne ne l'a arrêté — RIEN
     n'était prévu pour l'arrêter, et c'est l'utilisateur qui a demandé pourquoi
     c'était si long.
     ⚠ La cause est corrigée, mais la cause suivante ne l'est pas : un banc qui
     ouvre des navigateurs peut TOUJOURS se retrouver à attendre quelque chose
     qui ne viendra pas. Il lui faut donc une fin garantie, indépendante de la
     panne du jour. Au-delà de ce plafond on s'arrête, on RAPPORTE ce qui a été
     mesuré, et l'on refuse — un banc qui s'arrête en le disant vaut mieux qu'un
     banc qui consomme une heure d'exécuteur en silence. */
  const BUDGET_MS = Number(process.env.SZ_CONTRASTE_BUDGET_MS || 8 * 60 * 1000);
  const DEBUT = Date.now();
  let budgetDepasse = false;

  const parcourir = (adrs, parLot) => {
  for (let d = 0; d < adrs.length; d += parLot) {
    if (Date.now() - DEBUT > BUDGET_MS) { budgetDepasse = true; break; }
    const lot = adrs.slice(d, d + parLot);
    lots++;
    /* ⚠⚠ UN LOT MUET EST REJOUÉ UNE FOIS, ET C'EST UNE CONSTATATION, PAS UNE
       PRÉCAUTION. Il arrive qu'un lancement de Chrome n'écrive AUCUNE ligne de
       console dans son journal — la page pilote a bien chargé, l'iframe aussi
       (le journal le montre), mais rien n'en sort. Le même lot rejoué passe. Sans
       reprise, ces vingt écrans-là seraient silencieusement absents du rapport ;
       avec, on ne déclare mort que ce qui échoue DEUX fois. */
    let essais = 0, journal = '', pilote = '', profil = '';
    let fini = false;
    while (essais < 2 && !fini) {
      essais++;
      pilote = path.join(tmp, `_pilote-${lots}-${essais}.html`);
      journal = path.join(tmp, `chrome-${lots}-${essais}.log`);
      profil = path.join(tmp, `profil-${lots}-${essais}`);
      fs.writeFileSync(pilote, pagePilote(lot), 'utf8');

    /* ⚠⚠⚠ `spawn`, PAS `spawnSync` — ET C'EST 48 MINUTES DE DIFFÉRENCE.
       Ce banc a longtemps lancé le navigateur avec `spawnSync`, en s'appuyant
       sur une PARTICULARITÉ DE WINDOWS : Chrome s'y relance dans un second
       processus et le premier rend la main tout de suite, si bien que
       `spawnSync` revenait aussitôt et que l'on attendait ensuite le témoin dans
       le journal. Ça marchait — par accident.
       Sur LINUX, Chrome ne se relance pas : `spawnSync` bloque jusqu'à ce qu'il
       sorte, et `window.close()` ne suffit pas toujours à le faire sortir en
       `--headless=new`. Chaque lot attendait donc son délai de 300 s ENTIER, une
       fois son travail fini. Dix lots : **48 minutes** dans la construction, pour
       deux minutes de mesure. Vu à la première exécution en ligne.
       ⚠ La leçon : **une attente qui repose sur la façon dont un programme rend
       la main n'est pas une attente, c'est une coïncidence de plateforme.** On
       lance sans attendre, on attend LE TÉMOIN (ce qu'on faisait déjà), et l'on
       ferme soi-même — ce que `tuerNosChrome()` fait déjà juste en dessous. */
      const nav = spawn(chrome, [
        '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
        '--no-first-run', '--no-default-browser-check', '--disable-extensions',
        '--window-size=1200,900',
        /* ⚠ PAS DE BOÎTE DE DIALOGUE, PAS DE RAPPORT DE PLANTAGE. Un moteur de
           rendu qui tombe ouvrait une fenêtre « chrome.exe — Application Error »
           SUR LE BUREAU, en plein travail, et il en tombe beaucoup quand on
           enfile mille pages. Un banc ne doit rien afficher à personne. */
        '--noerrdialogs', '--disable-crash-reporter', '--disable-breakpad',
        /* ⚠ `--no-sandbox` UNIQUEMENT DANS UNE CONSTRUCTION. Le bac à sable de
           Chrome refuse de démarrer sous l'utilisateur root des exécuteurs
           GitHub, et le navigateur ne rend alors RIEN, sans un mot. On ne
           l'ouvre jamais sur le poste de quelqu'un : `CI` est posée par GitHub
           Actions et par personne d'autre. */
        ...(process.env.CI ? ['--no-sandbox'] : []),
        '--enable-logging', '--v=1', `--log-file=${journal}`,
        `--user-data-dir=${profil}`,
        'file:///' + pilote.replace(/\\/g, '/'),
      ], { stdio: 'ignore', detached: process.platform !== 'win32' });
      /* On garde le numéro du PÈRE : c'est par lui qu'on atteindra ses enfants,
         qui ne portent pas le dossier temporaire dans leur ligne de commande.
         ⚠ Et on l'oublie dès qu'il meurt de lui-même : tuer plus tard un numéro
         recyclé par le système reviendrait à tuer le processus de quelqu'un. */
      if (nav && nav.pid) PIDS.add(nav.pid);
      try {
        nav.on('exit', () => PIDS.delete(nav.pid));
        nav.on('error', () => PIDS.delete(nav.pid));
        nav.unref();
      } catch (e) {}

    /* On attend le TÉMOIN DE FIN dans le journal, jamais une durée devinée — elle
       finit toujours par être trop courte le jour où l'on ajoute des écrans. Et un
       filet contre le silence : si plus rien n'arrive pendant 25 s, le moteur est
       tombé, on passe au lot suivant plutôt que d'attendre le budget entier. */
      const jusqua = Date.now() + 20000 + 2500 * lot.length;
      let vusAvant = -1, immobileDepuis = Date.now();
      while (Date.now() < jusqua) {
        try {
          if (fs.existsSync(journal)) {
            const txt = fs.readFileSync(journal, 'utf8');
            if (/ELG-CR-FIN\|/.test(txt)) { fini = true; break; }
            const vus = (txt.match(/ELG-CR\|COMPTES/g) || []).length;
            if (vus !== vusAvant) { vusAvant = vus; immobileDepuis = Date.now(); }
            else if (Date.now() - immobileDepuis > 25000) break;
          }
        } catch (e) {}
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
      }
      if (fini || essais === 2) {
        try {
          const log = fs.readFileSync(journal, 'utf8');
          for (const l of (log.match(/ELG-CR\|[^\r\n]+/g) || [])) {
            lignes.push(l.slice('ELG-CR|'.length).split('", source:')[0].replace(/["\s]+$/, ''));
          }
        } catch (e) {}
      }
      /* ⚠ ON FERME LE NAVIGATEUR DE CE LOT ICI, verdict rendu ou pas. C est la
         ligne qui manquait, et son absence a fait tomber le poste. */
      tuerNosChrome();
    }
    if (!fini) lotsMorts++;
  }
  };

  parcourir(adresses, PAR_LOT);

  /* ══ LE RATTRAPAGE PAGE PAR PAGE — CE QU'UN LOT MORT A EMPORTÉ ═════════════
     ⚠⚠ UNE PAGE QUI TUE LE MOTEUR EMPORTE LES DIX-NEUF AUTRES DE SON LOT, et
     elles sont innocentes. Le premier balayage complet perdait ainsi six rendus
     — `inventaire`, `invmeta` et `journal` — alors qu'`inventaire` SEUL est en
     cause : les deux autres se mesurent parfaitement quand on les lance à part.
     On rejoue donc les perdus UN PAR UN. Ce qui tombe encore est vraiment le
     coupable, et il est NOMMÉ ; le reste est récupéré.
     ⚠ Le coût n'est payé que quand quelque chose est tombé, et il est borné :
     au-delà de `RATTRAPAGE_MAX` pages perdues, ce n'est plus un accident isolé
     mais une panne générale, et les rejouer une à une ne ferait que la répéter
     lentement. On le dit, et on s'arrête. */
  const RATTRAPAGE_MAX = 24;
  const mesures = new Set(
    lignes.filter((l) => l.startsWith('COMPTES|')).map((l) => l.split('|').slice(8).join('|')));
  const perdus1 = adresses.filter((a) => !mesures.has(nomDeRendu(a)));
  if (perdus1.length && perdus1.length <= RATTRAPAGE_MAX) {
    console.log(`   … ${perdus1.length} rendu(s) perdus avec leur lot : on les rejoue un par un.`);
    lotsMorts = 0;
    parcourir(perdus1, 1);
  } else if (perdus1.length) {
    console.log(`   ⚠ ${perdus1.length} rendus perdus : trop pour un rattrapage page par page.`);
  }

  if (GARDER) console.log("pages d'essai gardées : " + tmp);
  else { try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) {} }

  if (budgetDepasse) {
    console.log(`   ⚠⚠ PLAFOND DE TEMPS ATTEINT (${Math.round(BUDGET_MS / 60000)} min) — le parcours s'est arrêté en chemin.`);
    console.log("      Ce qui suit ne porte que sur ce qui a été mesuré ; le reste n'a PAS été regardé.");
  }
  rapport(lignes, liste.length, adresses, sansJeu, echecs, lotsMorts, budgetDepasse);
}

/* Le nom qu un rendu porte dans les relevés : « fenetre/mode » (ou « /theme »).
   Il est fabriqué à partir de l adresse du fichier, avec les mêmes morceaux qui
   ont servi à la construire — une seule facon d écrire ce nom, sinon la
   soustraction « demandés moins mesurés » compare deux vocabulaires. */
function nomDeRendu(adresse) {
  const q = adresse.indexOf('?');
  const fichier = (q < 0 ? adresse : adresse.slice(0, q)).replace(/\.html$/, '');
  const m = /^(.*)-(nuit|jour)(?:-([a-z]+))?$/.exec(fichier);
  if (!m) return fichier;
  return m[1] + '/' + m[2] + (m[3] ? '/' + m[3] : '');
}

/* ── 6. RAPPORT ───────────────────────────────────────────────────────────── */
function rapport(lignes, nbFen, adresses, sansJeu, echecs, lotsMorts, budgetDepasse) {
  const nbRendus = adresses.length;
  const paires = new Map();
  const durs = [];
  const muettes = [];
  const manque = [];
  const comptes = { vus: 0, invisibles: 0, voile: 0, image: 0, illisible: 0,
                    inactifs: 0, souVoile: 0 };
  const parRendu = [];

  for (const l of lignes) {
    if (l.startsWith('PAIRE|')) {
      const p = l.split('|');
      const cle = p[1];
      /* ⚠⚠⚠ ON COMPTE DES ENDROITS, PAS DES RENDUS — ET LE CLIQUET NE VALAIT
         RIEN AVANT ÇA. Les plafonds avaient été relevés sur un balayage à UN
         thème ; au premier balayage à SIX, la même couleur ressortait à 90
         endroits contre un plafond de 15. Rien n'avait empiré : c'était 15 × 6.
         Un plafond qui dépend de l'ÉTENDUE du balayage n'est pas un plafond, et
         il aurait fait rougir le contrôle sur une dette parfaitement stable —
         donc fini par le faire désactiver.
         On additionne maintenant par ENDROIT : « quelle fenêtre, quel chemin
         d'éléments ». Un même bouton vu en clair, en sombre et dans les six
         thèmes compte pour UN. ⚠ Et ce n'est pas une perte de finesse : quand un
         thème change vraiment la couleur, la CLÉ change (ce sont deux couleurs
         différentes), donc le couple est déjà compté à part. */
      const d = paires.get(cle) || {
        cle, ratio: parseFloat(p[2]), ex: p[4], txt: p[5], ou: new Set(), lieux: new Map(),
      };
      const fenetre = String(p[6] || '').split('/')[0];
      const lieu = fenetre + ' ' + p[4];
      const combien = parseInt(p[3], 10) || 0;
      // Le même endroit vu dans plusieurs thèmes : on garde le plus fourni,
      // jamais la somme — c'est le même bouton, pas six boutons.
      d.lieux.set(lieu, Math.max(d.lieux.get(lieu) || 0, combien));
      if (parseFloat(p[2]) < d.ratio) { d.ratio = parseFloat(p[2]); d.ex = p[4]; d.txt = p[5]; }
      d.ou.add(p[6]);
      paires.set(cle, d);
    } else if (l.startsWith('COMPTES|')) {
      const p = l.split('|').slice(1).map(Number);
      comptes.vus += p[0]; comptes.invisibles += p[1]; comptes.voile += p[2];
      comptes.image += p[3]; comptes.illisible += p[4];
      comptes.inactifs += p[5] || 0; comptes.souVoile += p[6] || 0;
      /* ⚠⚠ UN RENDU QUI NE MESURE PRESQUE RIEN DOIT SE DÉNONCER LUI-MÊME.
         Exempter ce qui est derrière une modale a fait tomber `commande` de
         74 couples à une poignée : la fenêtre ouvre sa modale au démarrage,
         donc TOUT le reste est estompé, donc exempté. C'est correct, et c'est
         aussi une couverture proche de zéro qui, noyée dans un total, se lirait
         comme un écran propre. Le nom du rendu est donc gardé avec son compte. */
      const ctx = l.split('|').slice(8).join('|');
      if (ctx) parRendu.push({ ctx, vus: p[0] || 0, voile: p[6] || 0 });
    } else if (l.startsWith('MUETTE ')) {
      muettes.push(l.slice(7));
    } else if (l.startsWith('MANQUE|')) {
      manque.push(l.split('|').slice(1).join(' : '));
    } else if (/^(MESURE|ERREUR) /.test(l)) {
      durs.push(l);
    }
  }

  console.log('');
  console.log('══ CONTRASTES DES FENÊTRES, MESURÉS AU RENDU ══');
  console.log(`   ${nbFen} fenêtre(s) × ${MODES.length} mode(s) × ${THEMES.length} thème(s) = ${nbRendus} rendus`);
  /* ⚠ LE NOMBRE DE RENDUS RÉELLEMENT MESURÉS, ET C'EST LA LIGNE LA PLUS
     IMPORTANTE DU RAPPORT. Une page qui fait tomber le moteur ne dit rien ; sans
     ce compte, un banc qui n'aurait vu que la moitié des écrans se lirait comme
     un banc content. Un manquant est un PROBLÈME, pas une note. */
  const rendusFaits = lignes.filter((l) => l.startsWith('COMPTES|')).length;
  const manquants = nbRendus - rendusFaits;
  console.log(`   ${rendusFaits} rendus mesurés sur ${nbRendus}${manquants > 0 ? `  ⚠ ${manquants} MANQUANT(S)` : ''}`);
  console.log(`   ${comptes.vus} couples texte/fond mesurés dans le navigateur`);
  /* ⚠⚠ « SOUS UN VOILE » N'EST PAS « ÉCARTÉ », ET LES METTRE SUR LA MÊME LIGNE
     ÉTAIT UN CONTRESENS. Ces éléments-là sont MESURÉS : leur opacité est
     composée sur ce qu'il y a derrière, texte et fond ensemble (c'est tout le
     travail du portage — sur les fenêtres, renoncer devant une opacité écartait
     30 éléments sur 32, c'est-à-dire exactement là où la lisibilité est en jeu).
     Les annoncer comme écartés invitait à hausser les épaules devant les
     trois quarts du relevé, et à ranger une vraie faute parmi les « pas
     regardés ». Deux lignes distinctes, donc : ce qu'on n'a PAS jugé, et ce
     qu'on a jugé À TRAVERS une opacité. */
  console.log(`   non jugés : ${comptes.invisibles} non affichés · ` +
              `${comptes.image} sur fond en image · ${comptes.illisible} couleur illisible`);
  console.log(`   dont ${comptes.voile} MESURÉS à travers une opacité (composée, pas écartée)`);
  /* ⚠ CES DEUX-LÀ SONT EXEMPTÉS PAR LA NORME, PAS PAR COMMODITÉ — et ils sont
     annoncés pour qu'on puisse contester le chiffre. Un contrôle inactif n'a
     aucune exigence de contraste (WCAG 1.4.3) ; ce qui est derrière une modale
     ouverte est un état transitoire, volontairement estompé. Les mesurer avait
     produit 138 « fautes » dont les deux plus graves — « Confirmer le
     remboursement » et « Expédier » — étaient des boutons grisés sous un voile. */
  console.log(`   exemptés : ${comptes.inactifs} contrôles inactifs · ` +
              `${comptes.souVoile} derrière une modale ouverte`);
  /* ⚠ DEUX FAÇONS DE NE RIEN MESURER, ET LA SECONDE EST LA PLUS SOURNOISE :
     un rendu où l on a écarté DERRIÈRE UNE MODALE plus de textes qu on en a
     jugés a beau montrer un chiffre honnête, il a surtout mesuré le voile.
      en est là : 8 textes jugés, 98 derrière sa modale. Un seuil fixe
     ne l aurait pas vu — 8 n a rien d alarmant dans l absolu. */
  const maigres = parRendu.filter((r) => r.vus < 10 || r.voile > r.vus)
    .sort((a2, b2) => a2.vus - b2.vus);
  if (maigres.length) {
    console.log(`   ⚠ ${maigres.length} rendu(s) où presque rien n a été jugé — ` +
                `couverture proche de zéro, pas un écran propre :`);
    for (const r of maigres.slice(0, 12)) {
      console.log(`        ${r.ctx} : ${r.vus} jugé(s)` + (r.voile ? `, ${r.voile} derrière une modale` : ''));
    }
    if (maigres.length > 12) console.log(`        … et ${maigres.length - 12} autre(s).`);
  }
  console.log(`   ${paires.size} couples DISTINCTS de couleurs`);
  if (sansJeu.length) console.log(`   ⚠ ${sansJeu.length} fenêtre(s) SANS jeu de réponses, donc NON éprouvées : ${sansJeu.join(', ')}`);
  if (echecs) console.log(`   ⚠ ${echecs} fabrique(s) ont levé — ces fenêtres ne sont pas mesurées`);
  if (muettes.length) console.log(`   ⚠ ${muettes.length} rendu(s) n'ont jamais rendu de verdict : ${muettes.slice(0, 6).join(', ')}${muettes.length > 6 ? '…' : ''}`);
  if (manque.length) console.log(`   ⚠ ${manque.length} fenêtre(s) ont demandé une opération absente du jeu : ${manque.slice(0, 4).join(' ; ')}`);
  console.log('');

  const tous = [...paires.values()];
  tous.forEach((p) => {
    p.seuil = parseFloat(p.cle.split('@')[1]);
    // Le compte qui sert de plafond : des ENDROITS, pas des rendus (voir plus haut).
    p.n = 0;
    for (const c of p.lieux.values()) p.n += c;
  });
  const echoue = tous.filter((p) => p.ratio < p.seuil).sort((a, b) => a.ratio - b.ratio);

  const exceptions = DECLARE.EXCEPTIONS || {};
  const reste = DECLARE.RESTE || {};
  const vrais = [];
  const gardes = [];
  const monte = [];
  const baisse = [];

  for (const e of echoue) {
    if (Object.prototype.hasOwnProperty.call(exceptions, e.cle)) { gardes.push(e); continue; }
    if (Object.prototype.hasOwnProperty.call(reste, e.cle)) {
      const plafond = reste[e.cle];
      if (e.n > plafond) monte.push({ ...e, plafond });
      else if (e.n < plafond) baisse.push({ ...e, plafond });
      continue;
    }
    vrais.push(e);
  }

  /* ⚠ `--reste` ÉCRIT LE PREMIER RELEVÉ, IL NE L'INVENTE PAS. Cent une paires à
     recopier à la main dans `contraste-rendu-declare.js`, c'est cent une
     occasions de se tromper d'un chiffre — et un plafond faux, c'est soit une
     porte ouverte, soit un rouge permanent qu'on finit par désactiver.
     ⚠ Ce n'est PAS une absolution : ces couleurs restent sous le seuil et le
     banc les affiche à chaque passage. Le plafond n'autorise qu'une chose,
     ne pas EMPIRER. */
  if (OPT('--reste')) {
    console.log('  RESTE: {');
    echoue.filter((e) => !Object.prototype.hasOwnProperty.call(exceptions, e.cle))
      .sort((a, b) => a.ratio - b.ratio)
      .forEach((e) => {
        const ou = Array.from(e.ou).sort().join(' ');
        console.log(`    // ${e.ratio.toFixed(2)} · ${e.ex} « ${e.txt} » · ${ou}`);
        console.log(`    '${e.cle}': ${e.n},`);
      });
    console.log('  },');
    process.exit(0);
  }

  if (TOUT_VOIR) {
    console.log('── CE QUI PASSE ──');
    tous.filter((p) => p.ratio >= p.seuil).sort((a, b) => a.ratio - b.ratio)
      .forEach((p) => console.log(`   ${p.ratio.toFixed(2)}  ${p.cle}  ×${p.n}`));
    console.log('');
  }
  if (gardes.length) {
    console.log(`── ${gardes.length} couple(s) DÉCLARÉ(S) et gardé(s) sous le seuil ──`);
    gardes.forEach((p) => console.log(`   ${p.ratio.toFixed(2)}  ${p.cle}  ×${p.n}`));
    console.log('');
  }

  /* ⚠ LES RENDUS MANQUANTS NE COMPTENT PLUS EN BLOC ICI : le bloc ci-dessous
     les trie en DÉCLARÉS (une raison écrite, avec sa preuve) et NON DÉCLARÉS,
     et n'ajoute que les seconds. Compter « 1 dès qu'il en manque un » rendait le
     banc rouge pour toujours à cause d'un seul écran connu — et un rouge
     permanent finit désactivé, ce qui coûterait les 91 autres. */
  /* ⚠ UN PARCOURS ÉCOURTÉ NE PEUT PAS ÊTRE VERT. Il n'a pas trouvé de faute
     parce qu'il n'a pas fini de chercher — ce n'est pas la même chose. */
  let mal = durs.length + vrais.length + monte.length + muettes.length + (budgetDepasse ? 1 : 0);
  if (manquants > 0) {
    console.log(`── ${manquants} RENDU(S) N'ONT PAS ÉTÉ MESURÉS ──`);
    /* ⚠⚠ ON NOMME CE QU'ON N'A PAS MESURÉ. Le rapport disait « 6 manquants » et
       « 1 lot arrêté » sans jamais dire LESQUELS : impossible de savoir si l'on
       venait de perdre une fenêtre de réglages ou l'écran de caisse. Un compte
       sans nom se range mentalement dans « du bruit » — et c'est exactement là
       que se cachent les écrans qui font tomber le moteur. Le contexte voyage
       désormais avec chaque relevé : la soustraction est immédiate. */
    const vus = new Set(parRendu.map((r) => r.ctx));
    const perdus = adresses.map(nomDeRendu).filter((n) => !vus.has(n));
    if (perdus.length) {
      console.log('   ' + perdus.slice(0, 20).join(', ')
        + (perdus.length > 20 ? ` … (+${perdus.length - 20})` : ''));
    }
    /* ⚠ UNE FENÊTRE NON MESURÉE MAIS DÉCLARÉE NE FAIT PAS ÉCHOUER — ELLE PARLE
       QUAND MÊME. Sans déclaration, elle fait échouer : c'est la seule façon
       qu'un écran perdu ne se range pas dans le bruit. Et une déclaration ne
       l'efface pas du rapport : sa raison est réaffichée à chaque passage,
       pour qu'on se souvienne qu'il reste une zone d'ombre. */
    const nonDeclares = perdus.filter((n) => !INMESURABLES[String(n).split('/')[0]]);
    for (const [fen, raison] of Object.entries(INMESURABLES)) {
      if (perdus.some((n) => String(n).split('/')[0] === fen)) {
        console.log(`   • ${fen} — DÉCLARÉE non mesurable : ${raison}`);
      }
    }
    if (nonDeclares.length) {
      console.log(`   ⚠ ${nonDeclares.length} rendu(s) perdus SANS déclaration — le banc refuse.`);
      mal += nonDeclares.length;
    }
    console.log(`   ${lotsMorts} lot(s) se sont arrêtés avant la fin — une page a fait tomber le moteur,`);
    console.log('   ou une fenêtre n\'a jamais rendu son verdict. Relancer avec --garder et');
    console.log('   regarder le journal du lot : ce qui n\'est pas mesuré n\'est pas gardé.');
    console.log('');
  }

  if (durs.length) {
    console.log('── LA MESURE ELLE-MÊME EST EN DÉFAUT ──');
    durs.slice(0, 10).forEach((d) => console.log('   ✗ ' + d));
    console.log('');
  }
  if (vrais.length) {
    console.log(`── ${vrais.length} COUPLE(S) SOUS LE SEUIL, NON DÉCLARÉ(S) ──`);
    for (const p of vrais.slice(0, 40)) {
      const ou = [...p.ou].sort();
      console.log(`   ✗ ${p.ratio.toFixed(2)}  ${p.cle}   ×${p.n}`);
      console.log(`        ${p.ex}   « ${p.txt} »`);
      console.log(`        vu dans : ${ou.slice(0, 4).join(' ')}${ou.length > 4 ? ` … (+${ou.length - 4})` : ''}`);
    }
    if (vrais.length > 40) console.log(`   … et ${vrais.length - 40} autre(s).`);
    console.log('');
    console.log('   Corriger la couleur, ou la déclarer dans contraste-rendu-declare.js');
    console.log('   (EXCEPTIONS avec la raison écrite, RESTE avec son nombre d\'endroits).');
    console.log('');
  }
  if (monte.length) {
    console.log('── DETTE QUI GAGNE DU TERRAIN (le cliquet refuse) ──');
    monte.forEach((c) => console.log(`   ✗ ${c.cle} : ${c.n} endroits, plafond déclaré ${c.plafond}`));
    console.log('');
  }
  if (baisse.length) {
    console.log('── DETTE QUI RECULE — resserrer le plafond ──');
    baisse.forEach((c) => console.log(`   • ${c.cle} : ${c.n} endroits, plafond déclaré ${c.plafond}`));
    console.log('');
  }

  if (mal === 0) {
    /* ⚠⚠ LE VERDICT NE DIT QUE CE QUI A ÉTÉ REGARDÉ. Cette phrase annonçait
       « les six thèmes compris » — et depuis que les thèmes sont devenus une
       option, c'était FAUX à chaque passage par défaut. Une phrase de succès qui
       s'attribue une couverture qu'elle n'a pas est pire qu'un banc absent :
       elle clôt la question. Le verdict énumère donc ce qu'il a mesuré, et
       nomme ce qu'il a laissé de côté. */
    console.log(`✓ aucun texte sous le seuil dans ${nbFen} fenêtre(s), de jour comme de nuit`
      + (TOUS_THEMES ? ', les six thèmes compris.' : '.'));
    if (!TOUS_THEMES) console.log('  ⚠ les six THÈMES n\'ont pas été mesurés — `--themes` pour les inclure.');
    const zones = Object.keys(INMESURABLES);
    if (zones.length) console.log(`  ⚠ et ${zones.length} fenêtre(s) restent hors de portée : ${zones.join(', ')}.`);
    process.exit(0);
  }
  console.log(`✗ ${mal} problème(s).`);
  process.exit(1);
}

main();
