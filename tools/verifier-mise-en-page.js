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

// ══ 4. LES <select> QUE RIEN N ANNONCE ══════════════════════════════════════
/* ⚠⚠ LA QUESTION INVERSE DE LA SECTION 1, ET PERSONNE NE LA POSAIT. La section 1
   demande « cette etiquette pointe-t-elle vers un champ ? ». Elle ne demande
   jamais « ce champ a-t-il une etiquette ? » — et c est par la que 40 <select>
   sont restes MUETS pour un lecteur d ecran jusqu au 2026-09-08.
   ⚠⚠ ELARGI A TOUS LES CHAMPS LE 2026-09-09, ET LA RAISON DE NE PAS LE FAIRE A
   DISPARU. Ce commentaire disait : « UN SELECT, PAS TOUS LES CHAMPS, ET C EST
   DELIBERE — elargir maintenant rendrait 178 etiquettes voisines non reliees et
   91 placeholders, c est-a-dire un controle que personne ne lira ».
   C etait vrai le 2026-09-08. Ce ne l est plus : le chantier des 4.61.0 et
   4.62.0 (287 champs nommes) a absorbe LES DEUX CLASSES. Mesure du 2026-09-09
   sur 649 champs atteignables : 621 nommes, 20 nommes par leur premiere option,
   ZERO etiquette voisine non reliee, et huit cas qui se sont tous reveles des
   FAUX POSITIFS de la lecture statique (voir la liste nommee).
   ⚠ Le carnet, lui, portait encore << 178 + 91 >> comme un chantier ouvert —
   cinquieme fois qu un chiffre du carnet est perime dans ce depot. Un chiffre
   herite se REMESURE avant qu on parte dessus.
   ⚠ ET C EST POUR CA QUE L ELARGISSEMENT EST FAIT MAINTENANT : le controle ne
   trouve rien, donc il est lisible, donc il sert de CLIQUET. Elargir un controle
   le jour ou il rend 269 lignes aurait produit un rapport que personne n ouvre —
   c est-a-dire aucun controle du tout.
   ⚠⚠ TROIS EXCLUSIONS MECANIQUES SONT INDISPENSABLES, chacune payee par un faux
   positif de ma propre mesure du 2026-09-09 :
     • `aria-hidden="true"` ou `tabindex="-1"` : les deux champs hors ecran qui
       recopient un mot de passe (comptable.js, liens.js) sont DEJA traites, et
       de la bonne facon ;
     • jamais focalisable : `type` hidden / file / submit / button / image ;
     • et les cas ou l etiquette existe mais par un chemin que la lecture
       statique ne peut pas voir — ils sont NOMMES dans le fichier de
       declarations, jamais devines.
   ⚠ `disabled` N EST PAS UNE EXCLUSION : un champ desactive se reactive, et il
   lui faut son nom le jour ou il s allume. Ma premiere mesure l ecartait et
   perdait 111 champs de vue.
   ⚠ UN SELECT DE FILTRE SE NOMME PAR SA PREMIERE OPTION : « Toutes les
   categories » annonce le champ aussi bien qu une etiquette, et il faut RETIRER
   LES BALISES EN LIGNE avant d en juger — un pictogramme la precede souvent.
   Sans ca, 21 champs corrects sont accuses.
   ⚠ ET LES COMMENTAIRES SONT MASQUES : deux `<select>` CITES dans un commentaire
   (socle.js, depenses.js) sont entres dans le premier relevé. Meme regle que les
   pictogrammes, ou 450 des 1073 vivaient dans les commentaires. */
dire('');
dire('=== champs sans nom accessible (aucune etiquette, aucun aria-label) ===');
const declares = require('./champs-sans-nom-declares.js');
const memeTaille = (s) => s.replace(/[^\n]/g, ' ');
const sansCommentaires = (t) => t
  .replace(/\/\*[\s\S]*?\*\//g, memeTaille)
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + memeTaille(m.slice(p1.length)));
const sansBalises = (s) => s.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
const PARLE = /^(tous|toutes|tout)\b.{2,}/i;
let nSel = 0, nSelKo = 0, nTolere = 0;
for (const f of fichiers) {
  /* ⚠⚠ ON LIT À TRAVERS `${T('…')}`, PARTOUT ET UNE SEULE FOIS. J’avais d’abord
     corrigé le seul cas des `<option>` — et le banc a accusé trois `<label>` la
     fois suivante. Un garde qui lit la SOURCE doit connaître les enveloppes
     qu’on pose, et les connaître GLOBALEMENT : les traiter un endroit à la fois,
     c’est se faire rattraper à chaque nouvelle balise touchée. */
  const sansT = (x) => String(x).replace(/\$\{T\(\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*\)\}/g,
    (m, q) => q.slice(1, -1));
  const txt = sansT(sansCommentaires(fs.readFileSync(path.join(dossier, f), 'utf8')));
  const cibles = new Set();
  for (const m of txt.matchAll(/<label[^>]*\bfor\s*=\s*(?:"([^"]*)"|'([^']*)')/g))
    cibles.add((m[1] || m[2] || '').trim());
  const tol = declares[f] || [];
  for (const m of txt.matchAll(/<(input|textarea|select)\b([^>]*)>/g)) {
    const balise = m[1];
    const attrs = m[2];
    /* Jamais focalisable : le compter FABRIQUE une faute. C est la meme famille
       que `type="hidden"`, ecrite autrement, et un `<input type="file">` en
       display:none declenche par un bouton en est le cas le plus courant. */
    const type = ((attrs.match(/\btype\s*=\s*["']?([a-z]+)/i) || [])[1] || '').toLowerCase();
    if (['hidden', 'file', 'submit', 'button', 'image'].indexOf(type) >= 0) continue;
    nSel++;
    if (/\baria-label(?:ledby)?\s*=|\btitle\s*=/.test(attrs)) continue;
    if (/\bhidden\b(?!\s*=)/.test(attrs)) continue;
    if (/style\s*=\s*"[^"]*display\s*:\s*none/.test(attrs)) continue;
    /* ⚠ HORS DU PARCOURS ET HORS DU LECTEUR D ECRAN : deja traite, et bien.
       Les deux champs qui recopient un mot de passe dans le presse-papiers
       (comptable.js, liens.js) vivent en `left:-9999px` — donc ATTEIGNABLES au
       clavier, contrairement a display:none — et portent pour cette raison
       `aria-hidden="true" tabindex="-1"`. Sans cette exclusion, le controle
       accuserait la correction elle-meme. */
    if (/\baria-hidden\s*=\s*"true"/.test(attrs)) continue;
    if (/\btabindex\s*=\s*"-1"/.test(attrs)) continue;
    const id = (attrs.match(/\bid\s*=\s*"([^"]*)"/) || [])[1];
    if (id && cibles.has(id.trim())) continue;
    const avant = txt.slice(Math.max(0, m.index - 400), m.index);
    const dl = avant.lastIndexOf('<label'), fl = avant.lastIndexOf('</label>');
    if (dl >= 0 && dl > fl) continue;               // etiquette enveloppante
    // La premiere option ne nomme qu un `select` — un input n en a pas.
    if (balise === 'select') {
      const bloc = txt.slice(m.index, m.index + 900);
      const opts = [...bloc.matchAll(/<option[^>]*>((?:(?!<\/option>)[\s\S]){0,70})/g)]
        .map((o) => sansBalises(o[1])).filter(Boolean);
      /* ⚠⚠ ON LIT À TRAVERS `${T('…')}`. Depuis le chantier bilingue, un libellé
         s’écrit `${T('Toutes les catégories')}` : le texte est toujours là, et il
         paraît toujours à l’écran — c’est résolu À LA GÉNÉRATION. Sans cette ligne,
         le banc accusait trois sélecteurs parfaitement nommés. ⚠ Un garde qui lit
         la SOURCE doit connaître les enveloppes qu’on pose autour des textes,
         sinon chaque enveloppe nouvelle lui fabrique des fautes. */
      const nu0 = String(opts[0] || '').replace(/\$\{T\(\s*["']([^"']*)["'][^)]*\)\}/g, '$1');
      if (opts.length && PARLE.test(nu0)) continue;   // nomme par sa 1re option
    }
    const proche = txt.slice(Math.max(0, m.index - 220), m.index);
    if (/<\/label>|class="(?:l|et|cle|lab|lbl)"/.test(proche)) continue;
    /* TOLERE ET NOMME : voir `champs-sans-nom-declares.js`. On apparie sur un
       FRAGMENT du contexte, jamais sur un numero de ligne — une ligne se decale
       au premier ajout, et le cliquet se rouvrirait tout seul. */
    const ctx = txt.slice(Math.max(0, m.index - 300), m.index + 200);
    if (tol.some((frag) => ctx.indexOf(frag) >= 0)) { nTolere++; continue; }
    nSelKo++; ko++;
    const ligne = txt.slice(0, m.index).split('\n').length;
    dire('  NON  ' + f + ':' + ligne + '  <' + balise + '>  ' + (id ? 'id=' + id : 'sans id')
      + '  — aucune etiquette, aucun aria-label'
      + (balise === 'select' ? ', et sa 1re option ne le nomme pas' : ''));
  }
}
if (!nSelKo) {
  dire('  OK   les ' + nSel + ' champs atteignables annoncent de quoi ils parlent'
    + (nTolere ? '  (' + nTolere + ' tolere(s) et nomme(s) dans champs-sans-nom-declares.js)' : ''));
}

dire('');
dire(ko ? '>>> ' + ko + ' CAS EN ECHEC' : '>>> la mise en page ne porte aucun des quatre defauts muets');
process.exit(ko ? 1 : 0);
