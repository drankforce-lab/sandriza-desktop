'use strict';

/*
 * VÉRIFIER LA MISE EN PAGE DES FENÊTRES — trois défauts MUETS
 * =============================================================================
 * Lancer :  node tools/verifier-mise-en-page.js       (instantané)
 *
 * ⚠⚠ POURQUOI CET OUTIL EXISTE. `executer-page.js` le dit de lui-même en tête de
 * fichier : « CE N'EST PAS UN NAVIGATEUR [...] ce contrôle ne dit donc pas la
 * fenêtre est belle ». Il prouve qu'une fenêtre ne meurt pas en silence. Rien ne
 * regardait ce qu'elle DONNE À VOIR, et les trois défauts ci-dessous ont en commun
 * de ne lever AUCUNE erreur : la fenêtre s'ouvre, tout a l'air normal, et le geste
 * ne marche pas.
 *
 * ── 1. UNE ÉTIQUETTE QUI POINTE VERS RIEN ────────────────────────────────────
 * Un label for= dont l'identifiant n'existe nulle part. Cliquer dessus ne met pas
 * le focus dans le champ, la case à cocher ne bascule pas — et il n'y a pas
 * d'erreur, juste un clic qui ne fait rien. Même motif que le sous-menu déclaré
 * items: au lieu de sub: (étape 0d du site) : une rangée silencieuse. Compte aussi
 * pour l'accessibilité : sans lien, le lecteur d'écran annonce un champ SANS NOM.
 *
 * ── 2. UNE ZONE DE TEXTE HAUTE DE DEUX LIGNES ────────────────────────────────
 * On y tape une note, une réponse à une cliente, une description — dans une fente.
 * Rien ne casse : c'est juste inutilisable, et on ne s'en aperçoit qu'en s'en
 * servant pour de vrai. Deux façons d'y arriver : ne rien déclarer (le défaut du
 * navigateur est DEUX lignes), ou déclarer une hauteur trop petite.
 *
 * ── 3. UNE FENÊTRE QU'ON PEUT RÉDUIRE SOUS SON CONTENU ───────────────────────
 * Une fenêtre REDIMENSIONNABLE ouverte sans minHeight peut être tirée jusqu'à
 * quelques pixels : les boutons du bas sortent de l'écran et deviennent
 * inatteignables, sans le moindre message. Et une hauteur d'ouverture INFÉRIEURE
 * au minimum déclaré est une contradiction : Electron applique le minimum, donc la
 * fenêtre ne s'ouvre pas à la taille qu'on croit lui avoir donnée.
 *
 * ⚠ CE QU'IL NE FAIT PAS : il ne MESURE rien, il lit le texte. Une hauteur
 * suffisante sur le papier peut tout de même rogner un contenu plus long que
 * prévu ; pour ça il faudrait un vrai navigateur. Il attrape ce qui est décidable
 * sans dessiner.
 *
 * ══ DEUX DÉFAUTS DE CET OUTIL LUI-MÊME, CORRIGÉS LE 2026-08-21 ═══════════════
 * Sa première version a rendu ONZE candidats et AUCUN vrai. Les deux fautes valent
 * d'être écrites, parce qu'elles se refont :
 *   1. elle ne cherchait les hauteurs que dans les règles de CLASSE
 *      (`.machin{...}`) — or ces fenêtres déclarent presque toutes une règle sur
 *      l'ÉLÉMENT (`textarea{min-height:5em}`). Dix zones de texte parfaitement
 *      correctes étaient accusées. **Un contrôle qui ne connaît qu'une des formes
 *      du code juge l'autre à tort** ;
 *   2. sa lecture des tailles de fenêtre s'arrêtait au premier `}` (`[^}]*`), donc
 *      elle ne franchissait pas l'objet imbriqué `{ x, y }` qui suit
 *      immédiatement `height:` — et ne voyait jamais le `resizable: false` posé
 *      plus bas. Une fenêtre qu'on ne PEUT PAS tirer était accusée de pouvoir être
 *      réduite. → appariement d'accolades, jamais une classe négative.
 * ⚠ Et c'est en LISANT les dix faux positifs qu'on a trouvé le vrai cas : la
 * question n'était pas « une hauteur est-elle déclarée ? » mais « la hauteur
 * déclarée laisse-t-elle écrire ? ». La bonne question était de l'autre côté du
 * bruit.
 *
 * ⚠ LES IDENTIFIANTS CALCULÉS SONT ÉCARTÉS, DÉLIBÉRÉMENT : un
 * for="ligne-' + i + '" ne se vérifie pas en lisant le texte. Du bruit dans une
 * liste à relire coûte plus cher qu'un candidat manqué.
 */

const fs = require('fs');
const path = require('path');

const racine = process.argv[2] || path.join(__dirname, '..');
const dossier = path.join(racine, 'src', 'fenetres');
const fichiers = fs.readdirSync(dossier).filter((f) => f.endsWith('.js')).sort();

let ko = 0;
const dire = (s) => console.log(s);

/* Un identifiant est LITTÉRAL s'il ne trahit aucun calcul. */
const litteral = (v) => /^[A-Za-z][\w:-]*$/.test(v);

/* ── LE SEUIL, ET IL EST VOLONTAIREMENT BAS ─────────────────────────────────
   3 em, soit environ DEUX lignes de texte. En dessous, il n'y a pas de débat :
   on écrit dans une fente. Au-dessus, c'est un choix de mise en page qu'un outil
   n'a pas à trancher — plusieurs fenêtres tiennent à 4/4,5 em pour une réponse
   courte, et `resize:vertical` laisse tirer. Un contrôle qui discute du goût
   finit désactivé. */
const MINI_EM = 3;
const enEm = (val) => {
  const m = String(val).trim().match(/^([\d.]+)\s*(em|rem|px|%|vh)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  switch (m[2]) {
    case 'px': return n / 16;
    case 'em': case 'rem': case undefined: return n;
    default: return Infinity;   // % ou vh : dépend du parent, on ne juge pas
  }
};

// ══ 1. LES ÉTIQUETTES QUI NE POINTENT NULLE PART ════════════════════════════
dire('=== Etiquettes (label for=) qui pointent vers un identifiant inexistant ===');
let nLabels = 0, nOrphelines = 0, nCalcules = 0;
for (const f of fichiers) {
  const txt = fs.readFileSync(path.join(dossier, f), 'utf8');
  const ids = new Set();
  for (const m of txt.matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)'|\\"([^\\"]*)\\")/g)) {
    const v = m[1] || m[2] || m[3] || '';
    if (litteral(v)) ids.add(v);
  }
  const orph = [];
  for (const m of txt.matchAll(/<label[^>]*\bfor\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const v = (m[1] || m[2] || '').trim();
    nLabels++;
    if (!litteral(v)) { nCalcules++; continue; }
    if (!ids.has(v)) orph.push(v);
  }
  if (orph.length) {
    nOrphelines += orph.length;
    ko++;
    dire('  NON  ' + f.padEnd(22) + [...new Set(orph)].join(', '));
  }
}
if (!nOrphelines) {
  dire('  OK   les ' + (nLabels - nCalcules) + ' etiquettes litterales pointent vers un champ existant'
     + (nCalcules ? '  (' + nCalcules + ' calculee(s), non verifiable(s))' : ''));
}

// ══ 2. LES ZONES DE TEXTE OÙ L'ON NE PEUT PAS ÉCRIRE ════════════════════════
dire('');
dire('=== Zones de texte hautes de deux lignes (moins de ' + MINI_EM + ' em) ===');
let nTa = 0, nTaKo = 0;
for (const f of fichiers) {
  const txt = fs.readFileSync(path.join(dossier, f), 'utf8');

  /* Les règles CSS qui donnent une hauteur à un textarea. On accepte la règle sur
     l'ÉLÉMENT (`textarea{...}`, `.form textarea{...}`) ET sur une classe de
     l'élément (`textarea.sms{...}`, `.form textarea.sms{...}`) — c'est le
     manquement de la première version. */
  const surElement = [];              // hauteurs applicables à tout textarea
  const parClasse = new Map();        // classe -> hauteur
  for (const m of txt.matchAll(/([^{};]*?)\{([^{}]*)\}/g)) {
    const sel = m[1], decls = m[2];
    const hm = decls.match(/(?:^|;)\s*(?:min-)?height\s*:\s*([^;}]+)/);
    if (!hm) continue;
    const em = enEm(hm[1]);
    if (em === null) continue;
    for (const s of sel.split(',')) {
      const t = s.trim();
      const mm = t.match(/textarea(?:\.([\w-]+))?\s*$/);
      if (!mm) continue;
      if (mm[1]) parClasse.set(mm[1], Math.max(parClasse.get(mm[1]) || 0, em));
      else surElement.push(em);
    }
  }
  const socle = surElement.length ? Math.max(...surElement) : 0;

  const trop = [];
  for (const m of txt.matchAll(/<textarea\b[^>]*>/g)) {
    const bal = m[0];
    nTa++;
    let h = socle;
    /* ⚠⚠ UN `rows=` ÉCRIT À LA MAIN EST UNE DÉCISION, PAS UN OUBLI — et c'est le
       troisième faux départ de cet outil, le plus instructif. En comptant
       `rows="2"` comme 2,4 em, il accusait DOUZE zones dont l'auteur avait
       explicitement voulu deux lignes : un sous-titre de diaporama dans une
       grille, un message vocal d'une ligne dans une rangée compacte, une liste
       d'adresses en `readonly`. Les remonter aurait déplacé des mises en page
       correctes — le contrôle aurait CAUSÉ le défaut qu'il cherche.
       Ce qu'on traque n'est donc pas « c'est petit », c'est « PERSONNE N'A
       CHOISI » : aucune hauteur nulle part (le navigateur en met deux), ou un
       plancher CSS partagé, sous lequel un champ de note tombe sans qu'on l'ait
       voulu pour LUI. Dès qu'un `rows` est là, on se tait. Et un `rows` CALCULÉ
       (`rows="' + (o.rows || 4) + '"`) nous fait taire aussi — c'était le
       deuxième faux départ. */
    if (/\brows\s*=/.test(bal)) continue;
    const st = (bal.match(/style\s*=\s*(?:"|')([^"']*)/) || [])[1] || '';
    const hs = st.match(/(?:min-)?height\s*:\s*([^;"']+)/);
    if (hs) { const e = enEm(hs[1]); if (e !== null) h = Math.max(h, e); }
    const cls = (bal.match(/class\s*=\s*"([^"]*)"/) || bal.match(/class\s*=\s*'([^']*)'/) || [])[1] || '';
    for (const c of cls.split(/\s+/)) if (parClasse.has(c)) h = Math.max(h, parClasse.get(c));
    if (h >= MINI_EM) continue;
    const id = (bal.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)')/) || []).slice(1).find(Boolean) || '(sans id)';
    const ligne = txt.slice(0, m.index).split('\n').length;
    trop.push({ id, ligne, h });
  }
  if (trop.length) {
    nTaKo += trop.length;
    ko++;
    for (const t of trop) {
      dire('  NON  ' + (f + ':' + t.ligne).padEnd(26) + t.id
         + ' — ' + (t.h ? t.h.toFixed(1) + ' em declares' : 'aucune hauteur, donc 2 lignes par defaut'));
    }
  }
}
if (!nTaKo) dire('  OK   les ' + nTa + ' zones de texte laissent au moins ' + MINI_EM + ' em pour ecrire');

// ══ 3. LES FENÊTRES QU'ON PEUT RÉDUIRE SOUS LEUR CONTENU ════════════════════
dire('');
dire('=== Fenetres redimensionnables sans minHeight, ou plus petites que leur minimum ===');
const mainTxt = fs.readFileSync(path.join(racine, 'src', 'main.js'), 'utf8');
let nGeo = 0, nGeoKo = 0;
/* ⚠ APPARIEMENT D'ACCOLADES, PAS UNE CLASSE NÉGATIVE. `[^}]*` s'arrêtait au `}`
   de l'objet imbriqué `{ x, y }` qui suit `height:`, et ne voyait donc jamais le
   `resizable: false` d'en dessous. */
const objetA = (s, deb) => {
  let prof = 0;
  for (let i = deb; i < s.length; i++) {
    if (s[i] === '{') prof++;
    else if (s[i] === '}') { prof--; if (prof === 0) return s.slice(deb, i + 1); }
  }
  return null;
};
for (const m of mainTxt.matchAll(/\{\s*width:\s*(\d+),\s*height:\s*(\d+)\b/g)) {
  const w = +m[1], h = +m[2];
  const obj = objetA(mainTxt, m.index);
  if (obj === null) continue;                 // accolades non appariées : on se tait
  const ligne = mainTxt.slice(0, m.index).split('\n').length;
  nGeo++;
  if (/resizable\s*:\s*false/.test(obj)) continue;   // on ne peut pas la tirer
  const mh = (obj.match(/minHeight:\s*(\d+)/) || [])[1];
  if (mh === undefined) {
    nGeoKo++; ko++;
    dire('  NON  main.js:' + ligne + '  ' + w + 'x' + h + ' sans minHeight — elle peut etre reduite sous ses boutons');
  } else if (+mh > h) {
    nGeoKo++; ko++;
    dire('  NON  main.js:' + ligne + '  height ' + h + ' < minHeight ' + mh + ' — elle ne s ouvrira PAS a la taille demandee');
  }
}
if (!nGeoKo) dire('  OK   les ' + nGeo + ' ouvertures de fenetre declarent un minimum coherent');

dire('');
dire(ko ? '>>> ' + ko + ' CAS EN ECHEC' : '>>> la mise en page ne porte aucun des trois defauts muets');
process.exit(ko ? 1 : 0);
