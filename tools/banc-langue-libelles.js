#!/usr/bin/env node
'use strict';

/*
 * LES LIBELLÉS QUI ARRIVENT AVEC LES DONNÉES SONT-ILS TRADUITS ?
 * =============================================================================
 * ⚠⚠⚠ SA CAPTURE DU 2026-09-13 : une pastille « Confirmée » et une pastille
 * « Payée » sous des en-têtes NUMBER / CUSTOMER / TOTAL / STATUS. Ses mots :
 * « les status sont toujours pas traduit et c'est partout sur l'application ».
 *
 * ⚠⚠ CE TEXTE N EST DANS AUCUN FICHIER DE LA COQUILLE. Le site le compose
 * (`ORDER_STATUS[o.status]` dans `admin.js`) et l envoie DEJA EN FRANCAIS ; la
 * fenetre ne fait que l afficher. Les cinq bancs de langue relevent tous la
 * SOURCE ou la page DESSINEE SANS DONNEES — aucun ne pouvait voir une phrase
 * qui arrive par le reseau.
 * ➡ **UN TEXTE QUI ARRIVE AVEC LES DONNÉES N EST DANS AUCUN FICHIER DE LA
 *   FENÊTRE.** Quatrieme forme de la meme lecon.
 *
 * ══ CE QUE CELUI-CI FAIT ═══════════════════════════════════════════════════
 * Il RELEVE les tables de libelles DANS LE SITE (`admin.js`, `pont.js`) et
 * exige que chacune de leurs valeurs ait une entree dans
 * `src/langue/libelles.js`. Rien n est recopie ici : la source reste la source.
 *
 * ⚠ ET LE SENS INVERSE : une entree du lexique que le site ne produit plus est
 * une ligne morte, et surtout une fausse impression de couverture — on croit le
 * lexique tenu a jour parce qu il est gros. Meme garde que `banc-menu-langue`,
 * ou une table non confrontee a sa source s etait perimee en silence.
 *
 * ⚠ IL VERIFIE AUSSI QUE `szLibelle` EST POSEE DANS LES FENETRES ET QU ELLE
 * TRADUIT — un lexique complet ne dit rien du code qui s en sert. C est la
 * lecon de `banc-langue-effet`, payee le meme jour.
 *
 * ⚠⚠ ET QUE CE QU ELLE NE CONNAIT PAS RESSORT MOT POUR MOT. Ces memes champs
 * portent des DONNEES — nom d un segment, d une campagne, d un fournisseur.
 * « La traduction ne touche que ce qu on lit, jamais ce qui est ecrit. »
 *
 *   node tools/banc-langue-libelles.js
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SITE = path.join(RACINE, '..', 'sandriza', 'assets', 'js');

if (!fs.existsSync(path.join(SITE, 'admin.js'))) {
  console.log('— `admin.js` introuvable (dépôt du site absent) : contrôle sauté. '
    + 'Ce passage ne dit RIEN sur les libellés venus des données.');
  process.exit(0);
}

const { LIBELLES_EN } = require('../src/langue/libelles');
const L = require('../src/langue');

const fautes = [];

/* ⚠ LES COMMENTAIRES SONT RETIRES AVANT TOUTE LECTURE : les fiches du site
   CITENT des libellés pour les expliquer. Même leçon que `banc-menu-langue`,
   où un commentaire citant `A('…')` avait fait refuser une table à jour. */
const _nu = (s) => s
  .replace(/(^|[\s;{}(),=])\/\*[\s\S]*?\*\//g, (m, p) => p + ' ')
  .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');

/* ══ LE CHAMP BALAYE — ELARGI LE 2026-09-13 ════════════════════════════════
 * ⚠⚠⚠ DEUX FICHIERS, ET LE SITE EN A QUARANTE. Ce banc ne lisait que
 * `admin.js` et `pont.js`. Sa capture du jour, Studio virtuel : sept jetons de
 * filtre en francais sur un ecran anglais, envoyes par `photos.js` ; journal
 * d envoi : la colonne « Genre » remplie de « Chaîne », envoye par
 * `newsletter.js`. Le banc n a rien dit — il ne regardait pas la.
 * ⚠ PIRE QUE LE SILENCE : il a ACCUSE le lexique. Les sept entrees ajoutees
 * pour corriger la capture ont ete signalees comme « le site n envoie plus ca
 * — ligne morte ». Un banc dont le champ est trop etroit ne se contente pas de
 * rater la faute : il declare morte la correction.
 * ➡ NEUVIEME FOIS QUE LE DEFAUT EST HORS DU TERRAIN BALAYE. On lit desormais
 *   TOUT ce que le site peut renvoyer par le pont. */
const SRC_SITE = fs.readdirSync(SITE)
  .filter((f) => f.endsWith('.js'))
  /* ⚠ Les fichiers minifies ou empaquetes n ont pas de libelles a nous : les
     lire ferait du bruit sans rien garder. */
  .filter((f) => !/\.min\.js$/.test(f))
  .sort();
const src = SRC_SITE
  .map((f) => _nu(fs.readFileSync(path.join(SITE, f), 'utf8'))).join('\n');

/* ── 1. Les TABLES citées par un champ `xxxLibelle: TABLE[…]`. ───────────── */
const attendus = new Set();
const tables = new Set();
{
  const rx = /[A-Za-z_]*[Ll]ibelle\s*:\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\[/g;
  let m; while ((m = rx.exec(src))) tables.add(m[1]);
}
for (const t of tables) {
  let nomTable = t;
  /* ⚠ L ALIAS LOCAL, ET POURQUOI IL FAUT LE SUIVRE. `livechat.js` ecrit
     `const st = _STATUS[s.status] || _STATUS.closed;` puis `statutLibelle:
     st[0]`. La table citee s appelle donc `st` — un nom qui n existe nulle
     part comme table. Sans cette resolution, le banc annoncait « table
     introuvable, le releve ne prouve plus rien » : un ECHEC franc, mais sur la
     mauvaise cause, et qui masquait les vrais trous derriere lui. */
  {
    const al = new RegExp('const\\s+' + t + '\\s*=\\s*([A-Za-z_$][A-Za-z0-9_$]*)\\s*\\[', 'm').exec(src);
    if (al) nomTable = al[1];
  }
  const b = new RegExp('const\\s+' + nomTable + '\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*;', 'm').exec(src);
  if (!b) {
    fautes.push('la table `' + t + '` est citée comme source de libellés mais '
      + 'introuvable — le relevé ne prouve plus rien pour elle');
    continue;
  }
  const rx = /:\s*'((?:[^'\\]|\\.)*)'/g;
  let m; while ((m = rx.exec(b[1]))) attendus.add(m[1].replace(/\\'/g, "'"));
}

/* ── 2. Les libellés posés EN DUR dans un objet servi. ───────────────────── */
{
  const rx = /[A-Za-z_]*[Ll]ibelle\s*:\s*\{([^}]*)\}/g;
  let m; while ((m = rx.exec(src))) {
    const rx2 = /:\s*'((?:[^'\\]|\\.)*)'/g;
    let n; while ((n = rx2.exec(m[1]))) attendus.add(n[1].replace(/\\'/g, "'"));
  }
}
/* ── 3. Les libellés posés en toutes lettres sur un champ `libelle:`. ──────
   ⚠⚠ PAS CEUX QUI SONT CONCATÉNÉS, et la borne est délibérée. `libelle:
   'Dans ' + h + ' h'` n'est pas un libellé : c'est un MORCEAU. Exiger une
   entrée pour « Dans  » demanderait d'inscrire au lexique une chaîne qui ne
   s'affiche jamais telle quelle — et une entrée impossible à satisfaire finit
   par faire désactiver le contrôle.
   ⚠ CE QUI SE COMPOSE SE TRADUIT AUTREMENT : par une phrase à trous côté
   fenêtre (`${T("… {0} …")}`), jamais par un lexique de fragments. Le seul cas
   relevé aujourd'hui est un toast du SITE, qui ne paraît dans aucune fenêtre
   native — d'où l'absence de suite. */
{
  const rx = /\blibelle\s*:\s*'((?:[^'\\]|\\.)*)'(\s*\+)?/g;
  let m; while ((m = rx.exec(src))) {
    if (m[2]) continue;                       // concaténé : ce n'est pas un libellé
    attendus.add(m[1].replace(/\\'/g, "'"));
  }
}
/* Les tableaux de libellés (`libelle: ['T1 — …', 'T2 — …'][k]`). */
{
  const rx = /\blibelle\s*:\s*\[([\s\S]{0,400}?)\]/g;
  let m; while ((m = rx.exec(src))) {
    const rx2 = /'((?:[^'\\]|\\.)*)'/g;
    let n; while ((n = rx2.exec(m[1]))) attendus.add(n[1].replace(/\\'/g, "'"));
  }
}
/* ── 5. LE COUPLE « CODE + TEXTE » : `{ cle, nom }`. ───────────────────────
   ⚠⚠ LA FORME QUI A ECHAPPE A TOUT LE MONDE. Le site envoie ses jetons de
   filtre en `Object.entries(TABLE).map(([cle, nom]) => ({ cle, nom }))` — pas
   un `libelle:` en vue, donc invisible aux quatre relevés ci-dessus. Sa
   capture du 2026-09-13 montrait les sept jetons du Studio en français.
   ⚠ ON RELEVE LA TABLE SOURCE, pas la destructuration : c est là que les
   phrases sont écrites en toutes lettres. La condition est la présence du
   couple `([cle, nom])` ou `({ cle, nom })` quelque part dans le fichier —
   sinon on prendrait toute table de chaînes du site pour des libellés. */
{
  const rx = /\(\s*\[\s*cle\s*,\s*(?:nom|label|titre)\s*\]\s*\)\s*=>\s*\(\s*\{\s*cle\s*,/g;
  if (rx.test(src)) {
    const rxT = /Object\.entries\(\s*([A-Z_][A-Z0-9_]*)\s*\)\s*\.map\(\s*\(\s*\[\s*cle\s*,\s*(?:nom|label|titre)\s*\]/g;
    let m; while ((m = rxT.exec(src))) {
      const b = new RegExp('const\\s+' + m[1] + '\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*;', 'm').exec(src);
      if (!b) continue;
      const rx2 = /:\s*'((?:[^'\\]|\\.)*)'/g;
      let n; while ((n = rx2.exec(b[1]))) attendus.add(n[1].replace(/\\'/g, "'"));
    }
  }
}
/* ── 7. LE MODÈLE DES PERMISSIONS (refonte #103, 2026-09-13). ──────────────
   ⚠⚠ QUATRE TABLES, ET AUCUNE N A LA FORME DES SIX RÈGLES CI-DESSUS.
   `PERMISSION_DEFS` et `ROLES` portent des `label:` et des `desc:` ;
   `_SEC_PERM_GROUPS` porte les titres de groupe ; `ACTION_LABELS` porte
   « Voir / Ajouter / Modifier / Supprimer ». Tout cela traverse le pont
   (`_secPermModel`, `_secRolesListe`) et s'affiche dans la fenêtre des accès —
   donc tout cela doit être traduit, et rien ne le réclamait.
   ⚠ LA DESCRIPTION COMPTE AUTANT QUE LE LIBELLÉ, et c'est contre-intuitif : un
   nom de module ne prévient de rien, la description dit ce que le droit OUVRE.
   Laissée en français sur une page anglaise, l'infobulle devient inutile à la
   personne à qui elle est destinée. */
{
  const bornes = [
    /const\s+PERMISSION_DEFS\s*=\s*\{([\s\S]*?)\n\s*\};/,
    /const\s+ROLES\s*=\s*\{([\s\S]*?)\n\s*\};/,
    /const\s+_SEC_PERM_GROUPS\s*=\s*\[([\s\S]*?)\n\s*\];/,
    /const\s+ACTION_LABELS\s*=\s*\{([^}]*)\}/,
  ];
  for (const b of bornes) {
    const m = b.exec(src);
    if (!m) continue;
    const rx = /\b(?:label|desc)\s*:\s*\n?\s*'((?:[^'\\]|\\.)*)'/g;
    let n; while ((n = rx.exec(m[1]))) attendus.add(n[1].replace(/\\'/g, "'"));
    /* ACTION_LABELS pose ses valeurs sans clé nommée `label` : `view: 'Voir'`. */
    if (b === bornes[3]) {
      const rx2 = /:\s*'((?:[^'\\]|\\.)*)'/g;
      let p; while ((p = rx2.exec(m[1]))) attendus.add(p[1].replace(/\\'/g, "'"));
    }
  }
}

/* ── 6. LE GENRE D UN ENVOI, calculé à la volée. ───────────────────────────
   ⚠ `genre: x === 'campaign' ? 'Campagne' : 'Chaîne'` — deux phrases posées
   dans un ternaire, sur un champ qui n existe que pour être affiché. */
{
  const rx = /\bgenre\s*:\s*[^,;\n]*?'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g;
  let m; while ((m = rx.exec(src))) {
    attendus.add(m[1].replace(/\\'/g, "'"));
    attendus.add(m[2].replace(/\\'/g, "'"));
  }
}

/* ⚠ Ce qui n est PAS un libellé d interface : une valeur calculée, un fragment
   vide. On écarte ce qui ne porte aucune lettre. */
const _mot = (s) => /[A-Za-zÀ-ÿ]/.test(s);
const vocabulaire = [...attendus].filter(_mot);

if (vocabulaire.length < 20) {
  console.error('✗ seulement ' + vocabulaire.length + ' libellé(s) relevé(s) dans le site — '
    + 'le motif de lecture ne marche plus, ce banc ne prouverait rien.');
  process.exit(1);
}

/* ── LES DEUX SENS ───────────────────────────────────────────────────────── */
for (const v of vocabulaire) {
  if (!Object.prototype.hasOwnProperty.call(LIBELLES_EN, v)) {
    fautes.push('« ' + v + ' » est envoyé aux fenêtres par le site et n’a pas de '
      + 'traduction dans `src/langue/libelles.js` — il s’affichera en français');
  }
}
for (const k of Object.keys(LIBELLES_EN)) {
  if (!attendus.has(k)) {
    fautes.push('le lexique traduit « ' + k + " » que le site n’envoie plus — "
      + 'ligne morte, ou libellé renommé d’un seul côté');
  }
}

/* ══ ET LA TRADUCTION, A-T-ELLE LIEU ? ═════════════════════════════════════
   ⚠⚠ SANS CE BLOC, LE BANC NE MESURERAIT QU UNE TABLE. On pourrait retirer le
   `_traduireLibelles(r)` de `main.js` : lexique complet, banc vert, et pas une
   seule pastille traduite. C est la lecon de `banc-langue-effet`, payee le meme
   jour — un compteur mesure une intention.

   ⚠ LA TRADUCTION VIT DANS `main.js`, QU AUCUN BANC NE PEUT CHARGER (il tire
   `electron`). On releve donc la fonction dans le TEXTE du fichier et on
   l execute a part, avec le vrai lexique. C est le patron de
   `banc-langue-processus-principal`, qui garde deja les tables de ce fichier. */
{
  const mainTxt = fs.readFileSync(path.join(RACINE, 'src', 'main.js'), 'utf8');
  const deb = mainTxt.indexOf('const _unLibelle =');
  const fin = mainTxt.indexOf('ipcMain.handle(\'pont:appeler\'');
  if (deb < 0 || fin < 0 || fin < deb) {
    fautes.push('`_traduireLibelles` est introuvable dans `main.js` — la traduction '
      + 'des libellés n’a plus lieu, ou le repère a changé');
  } else if (mainTxt.indexOf('_traduireLibelles(r, 0)') < 0) {
    fautes.push('`_traduireLibelles` existe mais n’est plus APPELÉE sur la réponse de '
      + '`pont:appeler` — les fenêtres recevraient encore du français');
  } else {
    /* On rejoue la fonction avec un lexique posé à la main : le banc éprouve le
       CODE, pas le chargement d’Electron. */
    const corps = mainTxt.slice(deb, fin)
      .replace(/require\('\.\/langue'\)\.langueCourante\(\)/g, 'LANGUE_ESSAI');
    for (const l of ['fr', 'en']) {
      let f = null;
      try {
        // eslint-disable-next-line no-new-func
        f = new Function('LIBELLES_EN', 'LANGUE_ESSAI', corps + '\nreturn _traduireLibelles;')(
          LIBELLES_EN, l);
      } catch (e) {
        fautes.push('[' + l + '] `_traduireLibelles` ne s’exécute pas : ' + e.message);
        continue;
      }
      const veut = (l === 'en') ? 'Confirmed' : 'Confirmée';
      /* ⚠ UNE RÉPONSE IMBRIQUÉE, comme les vraies : la pastille est dans une
         ligne, dans un tableau, dans l’objet rendu. */
      const r = f({ ok: true, lignes: [{ statut: 'confirmed', statutLibelle: 'Confirmée' }] }, 0);
      if (r.lignes[0].statutLibelle !== veut) {
        fautes.push('[' + l + '] un `statutLibelle` imbriqué rend « ' + r.lignes[0].statutLibelle
          + ' » au lieu de « ' + veut + ' »');
      }
      /* ⚠ LE CODE N EST PAS APPROCHÉ : c est lui qui choisit la couleur de la
         pastille, et le traduire la casserait en silence. */
      if (r.lignes[0].statut !== 'confirmed') {
        fautes.push('[' + l + '] le CODE `statut` a été modifié — seuls les champs '
          + '`…Libelle` doivent être touchés');
      }
      /* ⚠⚠ CE QUE LE LEXIQUE NE CONNAÎT PAS RESSORT MOT POUR MOT — le nom d une
         campagne écrit par quelqu un ne doit JAMAIS être réécrit. */
      /* ⚠ AU MASCULIN — sa règle permanente, et `banc-francais.js` du site l a
         attrapée ici même : mon premier échantillon disait « clientes VIP ». Un
         texte d essai est un texte qui s affiche le jour où le banc échoue. */
      const donnee = 'Campagne Été — clients VIP';
      const d = f({ segmentLibelle: donnee }, 0);
      if (d.segmentLibelle !== donnee) {
        fautes.push('[' + l + '] une DONNÉE est réécrite : « ' + donnee + ' » devient « '
          + d.segmentLibelle + ' » — la traduction ne touche que ce qu’on lit');
      }
      /* ⚠ UN CYCLE NE DOIT PAS FAIRE BOUCLER LE PROCESSUS PRINCIPAL : ce n est
         pas une fenêtre qui se fige, c est toute l application. */
      const cy = { statutLibelle: 'Confirmée' }; cy.moi = cy;
      try { f(cy, 0); } catch (e) {
        fautes.push('[' + l + '] une structure cyclique fait échouer la traduction : ' + e.message);
      }
    }
  }
}
L.poserLangue('fr');

console.log('');
console.log('== LES LIBELLÉS VENUS DES DONNÉES SONT-ILS TRADUITS ? ==');
console.log('  ' + vocabulaire.length + ' libellé(s) relevé(s) dans le site, '
  + Object.keys(LIBELLES_EN).length + ' dans le lexique');
console.log('');

if (fautes.length) {
  console.error('ECHEC  ' + fautes.length + ' trou(s) :');
  fautes.forEach((x) => console.error('   — ' + x));
  console.error('');
  console.error('⚠ Le lexique est `src/langue/libelles.js`, et l’affichage passe par');
  console.error('  `szLibelle(…)` (posée dans les 99 fenêtres par le socle).');
  process.exit(1);
}
console.log('>>> chaque libellé envoyé par le site a sa traduction, et `pont:appeler` l’applique');
