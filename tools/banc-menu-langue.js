'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   LE MENU DE L'ÉCRAN DE CONNEXION EST-IL TRADUIT EN ENTIER ?
   ═══════════════════════════════════════════════════════════════════════════
   ⚠⚠ SA DEMANDE DU 2026-09-11 : « dans le changement de langue de la page de
   connexion tu dois aussi traduire les menus, c'est important ». Un écran
   anglais surmonté d'un menu français n'est pas un écran traduit.

   ⚠ CE QUI PEUT SE DÉFAIRE TOUT SEUL : la liste des entrées visibles hors
   session vit dans le SITE (`appbar.js`, attribut `libre`), la table de
   traduction vit dans la COQUILLE (`MENU_EN` de `src/main.js`). Deux dépôts.
   Ajouter une entrée libre demain — une ligne dans `appbar.js` — laisse la
   table en arrière SANS AUCUN SIGNAL : l'entrée s'affichera simplement en
   français au milieu de l'anglais.

   ➡ **UNE TABLE DE TRADUCTION QUI N'EST PAS CONFRONTÉE À SA SOURCE SE PÉRIME EN
     SILENCE.** Ce banc relève les entrées libres DANS `appbar.js` et exige que
     chacune ait sa traduction. Rien n'est recopié ici : la source reste la
     source.

   ⚠ IL NE JUGE PAS LA QUALITÉ DE LA TRADUCTION, seulement sa PRÉSENCE. C'est
   une limite, et elle est assumée : un outil ne relit pas un traducteur.

   Lancement :  node tools/banc-menu-langue.js
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const APPBAR = path.join(RACINE, '..', 'sandriza', 'assets', 'js', 'appbar.js');
const MAIN = path.join(RACINE, 'src', 'main.js');

if (!fs.existsSync(APPBAR)) {
  console.log('— `appbar.js` introuvable (dépôt du site absent) : contrôle sauté. '
    + 'Ce passage ne dit RIEN sur la traduction des menus.');
  process.exit(0);
}

/* ── La table, LUE EN LA CHARGEANT (2026-09-11) ───────────────────────────────
   ⚠ Elle était relevée à coups d'expression régulière dans `main.js`. Ça marchait,
   et ça ne prouvait rien de plus que sa PRÉSENCE : on ne pouvait pas éprouver la
   fonction qui s'en sert. Sortie dans `src/menu-langue.js`, on la charge — et on
   peut enfin vérifier qu'elle est APPLIQUÉE, pas seulement remplie. C'est ce qui
   manquait quand le menu est sorti à moitié traduit. */
const { MENU_EN, MENU_APP_EN, trItems, trMenu, origineMenu, pourLePanneau,
  menusAvecLangue: _mal } = require('../src/menu-langue');
const traduits = new Set(Object.keys(MENU_EN));
if (traduits.size < 5) {
  console.error('✗ seulement ' + traduits.size + ' entrée(s) lue(s) dans MENU_EN — '
    + 'le motif de lecture ne marche plus, ce banc ne prouverait rien.');
  process.exit(1);
}

/* ── Les entrées LIBRES du site. ─────────────────────────────────────────── */
/* ⚠⚠ LES COMMENTAIRES SONT RETIRÉS AVANT TOUTE LECTURE. Premier jet : le banc a
   refusé une table PARFAITEMENT À JOUR parce qu'un commentaire d'`appbar.js`
   cite la forme `A('…', '…')` pour l'expliquer. Il a relevé « … » comme une
   entrée de menu.
   ➡ **UN RELEVÉ QUI LIT DU CODE DOIT D'ABORD RETIRER CE QUI N'EN EST PAS.** Même
   leçon que la police en base64 qui faisait crier `banc-antislash-fondu` : un
   motif court trouve toujours quelque chose quelque part, et une fausse faute
   coûte la confiance qu'on a dans les vraies. */
const src = fs.readFileSync(APPBAR, 'utf8')
  /* ⚠ LA BORNE DU `/*` : voir `tools/textes-visibles.js`. */
  .replace(/(^|[\s;{}(),=])\/\*[\s\S]*?\*\//g, (m, p) => p + ' ')
  .split(String.fromCharCode(10))
  .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
  .join(String.fromCharCode(10));
const libres = new Set();
{
  /* `A('Label', 'app')` pose `libre: true` (voir le helper dans appbar.js). */
  const rx = /\bA\(\s*'((?:[^'\\]|\\.)*)'/g;
  let m; while ((m = rx.exec(src))) libres.add(m[1].replace(/\\'/g, "'"));
  /* Et la forme explicite, sur une même ligne. */
  const rx2 = /label:\s*'((?:[^'\\]|\\.)*)'[^\n]*libre:\s*true/g;
  while ((m = rx2.exec(src))) libres.add(m[1].replace(/\\'/g, "'"));
}
if (libres.size < 5) {
  console.error('✗ seulement ' + libres.size + ' entrée(s) libre(s) relevée(s) dans '
    + 'appbar.js — le motif de lecture ne marche plus.');
  process.exit(1);
}

/* ── Les intitulés des menus qui en contiennent. ─────────────────────────── */
const MENUS = ['Fichier', 'Affichage', 'Aide'];

const fautes = [];

/* ══ ET TOUT LE MENU DE SESSION — LA BARRE QU'IL VOIT EN TRAVAILLANT ════════
   ⚠⚠ SA DEMANDE DU 2026-09-13 : « si je change la langue dans l'affichage le
   menu doit aussi être en anglais ». Jusque-là, seules les DIX entrées libres
   étaient gardées ici. Le reste — plus de cent intitulés, tout ce qu'on voit
   une fois connecté — n'était confronté à RIEN : `appbar.js` pouvait en
   ajouter, en renommer, en retirer, la coquille n'en savait jamais rien.

   ⚠ MÊME MÉCANIQUE, MÊME EXIGENCE, DANS LES DEUX SENS : la source reste
   `appbar.js`, MENU_APP_EN doit la couvrir exactement. Une entrée nouvelle
   sans traduction FAIT ÉCHOUER ce banc ; une traduction dont l'entrée a disparu
   aussi.

   ⚠ LES SIX JEUX DE COULEURS SONT RELEVÉS À PART : ils viennent d'une table
   (`THEMES_COULEUR`) et pas d'un `label:` écrit à la main. Un relevé qui ne
   lirait que `label:` les aurait laissés français dans un sous-menu anglais —
   et personne ne les aurait vus, parce qu'ils sont à deux niveaux de
   profondeur. */
{
  const tous = new Set();
  {
    const rx = /label:\s*'((?:[^'\\]|\\.)*)'/g;
    let m; while ((m = rx.exec(src))) tous.add(m[1].replace(/\\'/g, "'"));
    /* ⚠⚠ ET LA FORME COURTE S('Libellé', 'section', …) — manquée jusqu'au
       2026-09-25. Le raccourci d'appbar.js pose `label` lui-même, donc aucun
       `label:` n'est écrit : « Conciliation bancaire », « Facturation »,
       « Liens d'installation » et « Traitements d'image (Fal.ai) » sont restés
       en français dans le menu anglais, sous un banc vert. Il l'a vu à l'écran. */
    const rxS = /\bS\(\s*'((?:[^'\\]|\\.)*)'/g;
    while ((m = rxS.exec(src))) tous.add(m[1].replace(/\\'/g, "'"));
  }
  /* La table des jeux de couleurs : `['cle', 'Nom affiché'], …`. */
  {
    const bloc = /THEMES_COULEUR\s*=\s*\[([\s\S]*?)\]\s*;/.exec(src);
    if (!bloc) {
      fautes.push('la table THEMES_COULEUR est introuvable dans appbar.js — '
        + 'le relevé des jeux de couleurs ne prouve plus rien');
    } else {
      const rx = /\[\s*'(?:[^'\\]|\\.)*'\s*,\s*'((?:[^'\\]|\\.)*)'\s*\]/g;
      let m, n = 0;
      while ((m = rx.exec(bloc[1]))) { tous.add(m[1].replace(/\\'/g, "'")); n++; }
      if (n < 2) {
        fautes.push('seulement ' + n + ' jeu(x) de couleurs relevé(s) — '
          + 'le motif de lecture de THEMES_COULEUR ne marche plus');
      }
    }
  }

  /* Ce qui n'apparaît qu'une fois connecté : tout le reste, moins les entrées
     libres (gardées par MENU_EN) et les pseudo-menus `__compte` / `__reg`, qui
     ne sont pas des intitulés mais des marqueurs. */
  const session = [...tous].filter((x) => !libres.has(x) && !x.startsWith('__'));
  if (session.length < 50) {
    console.error('✗ seulement ' + session.length + ' intitulé(s) de session relevé(s) dans '
      + 'appbar.js — le motif de lecture ne marche plus, ce banc ne prouverait rien.');
    process.exit(1);
  }

  const app = new Set(Object.keys(MENU_APP_EN));
  for (const k of session) {
    /* Les trois intitulés de menu vivent dans MENU_EN : ils paraissent AVANT la
       session comme après, et une clé en double finit toujours par diverger. */
    if (MENUS.indexOf(k) >= 0) continue;
    if (!app.has(k)) {
      fautes.push('« ' + k + ' » paraît dans la barre une fois connecté et n’a pas de '
        + 'traduction dans MENU_APP_EN — elle s’affichera en français dans un menu anglais');
    }
  }
  for (const k of app) {
    if (!tous.has(k)) {
      fautes.push('MENU_APP_EN traduit « ' + k + ' » qui n’est plus un intitulé '
        + 'd’appbar.js — ligne morte, ou entrée renommée d’un seul côté');
    }
  }
  /* ⚠ ET LA TRADUCTION EST-ELLE APPLIQUÉE ? Même leçon qu'en 5.28.0 : une table
     complète ne dit rien du code qui s'en sert. `trMenu` lit DEUX tables
     maintenant, et l'ordre entre elles est une décision — on l'éprouve. */
  if (trMenu('Boutique', 'en') !== 'Shop') {
    fautes.push('trMenu() ne consulte pas MENU_APP_EN : « Boutique » reste « '
      + trMenu('Boutique', 'en') + ' »');
  }
  if (trMenu('Boutique', 'fr') !== 'Boutique') {
    fautes.push('trMenu(…, "fr") traduit quand même — le français doit être le passe-droit');
  }
  /* ⚠ ET LE CHEMIN DE RETOUR, sans lequel LE MENU DEVIENT MUET : la barre du
     site envoie un intitulé, la coquille doit retrouver le menu d'origine. */
  if (origineMenu('Shop') !== 'Boutique') {
    fautes.push('origineMenu("Shop") rend « ' + origineMenu('Shop') + ' » : la coquille ne '
      + 'retrouvera pas le menu dans son modèle, et le panneau ne s’ouvrira pas');
  }
  if (origineMenu('Boutique') !== 'Boutique') {
    fautes.push('origineMenu() abîme un intitulé d’origine — il doit le rendre tel quel');
  }
  /* ⚠ UNE VALEUR IDENTIQUE À SA CLÉ NE DOIT PAS ENTRER DANS LA TABLE INVERSE :
     elle s’y retrouverait elle-même et masquerait une vraie entrée. */
  if (origineMenu('Photos') !== 'Photos') {
    fautes.push('origineMenu("Photos") rend « ' + origineMenu('Photos') + ' » — une valeur '
      + 'identique à sa clé a été inscrite dans la table inverse');
  }
}

for (const k of [...libres, ...MENUS]) {
  if (!traduits.has(k)) {
    fautes.push('« ' + k + " » paraît à l’écran de connexion (entrée libre) et n’a pas "
      + 'de traduction dans MENU_EN — elle s’affichera en français dans un menu anglais');
  }
}
/* ⚠ ET LE SENS INVERSE : une traduction dont l’entrée a disparu du site est une
   ligne qu’on entretient pour rien, et surtout une fausse impression de
   couverture — on croit le menu tenu à jour parce que la table est grosse. */
for (const k of traduits) {
  if (MENUS.indexOf(k) >= 0) continue;
  if (!libres.has(k)) {
    fautes.push('MENU_EN traduit « ' + k + " » qui n’est plus une entrée libre du site — "
      + 'ligne morte, ou entrée renommée d’un seul côté');
  }
}

/* ══ ET SURTOUT : LA TRADUCTION EST-ELLE APPLIQUÉE ? ════════════════════════
   ⚠⚠ C'EST LE CONTRÔLE QUI MANQUAIT, ET SON ABSENCE A COÛTÉ UNE VERSION. La
   table était complète, le banc était vert, et le menu sortait à moitié
   traduit : « View », « Help », puis dessous « Recharger », « Plein écran »,
   « Réduire ». `trItems` descendait dans les sous-groupes (`sub`) et sautait les
   ENTRÉES (`items`), qui sont pourtant le cas courant.
   ➡ **VÉRIFIER QU'UNE TABLE EST COMPLÈTE NE DIT RIEN SUR LE CODE QUI S'EN SERT.**
   Deux questions différentes, deux contrôles.
   ⚠ Le modèle ci-dessous a TROIS niveaux À DESSEIN — menu, entrée, sous-groupe —
   parce qu'un parcours d'arbre qui ne suit qu'une branche sur deux passe le
   premier niveau sans broncher. */
{
  const modele = [{
    label: 'Affichage',
    items: [
      { label: 'Recharger', app: 'reload' },
      { sep: true },
      { label: 'Plein écran', app: 'fullscreen' },
      { label: 'Aide', sub: [{ label: 'À propos', app: 'about' }] },
    ],
  }];
  const sortie = trItems(modele, 'en');
  const restes = [];
  const arpenter = (l, chemin) => (l || []).forEach((it) => {
    if (!it || it.sep) return;
    if (Object.prototype.hasOwnProperty.call(MENU_EN, it.label)) {
      restes.push(chemin + ' > ' + it.label);
    }
    arpenter(it.items, chemin + ' > ' + it.label);
    arpenter(it.sub, chemin + ' > ' + it.label);
  });
  arpenter(sortie, '(racine)');
  restes.forEach((x) => fautes.push('trItems() laisse « ' + x + " » en français alors que "
    + 'la table le connaît — un niveau de l’arbre n’est pas parcouru'));

  /* ⚠ ET LE SENS INVERSE, sinon un `trItems` qui rendrait n'importe quoi (une
     liste vide, par exemple) passerait ce contrôle sans rien traduire du tout. */
  const compte = (l) => (l || []).reduce((n, it) =>
    n + (it && !it.sep ? 1 + compte(it.items) + compte(it.sub) : 0), 0);
  if (compte(sortie) !== compte(modele)) {
    fautes.push('trItems() rend ' + compte(sortie) + ' entrée(s) pour ' + compte(modele)
      + ' — il en perd en route, et un menu amputé vaut un menu faux');
  }
  /* Et en français, rien ne doit bouger. */
  if (JSON.stringify(trItems(modele, 'fr')) !== JSON.stringify(modele)) {
    fautes.push('trItems(…, "fr") MODIFIE le modèle — le français doit être le passe-droit');
  }
}

/* ══ LE BASCULE FR / EN GREFFÉ DANS LE MENU AFFICHAGE ══════════════════════
   Sa demande du 2026-09-12 : « un toggle FR/EN dans un endroit discret ».
   ⚠ Il est éprouvé ICI parce qu'il vit dans `menu-langue.js` et non dans
   `main.js` : six cas en trente lignes, là où il aurait fallu lancer Electron
   et ouvrir un panneau. C'est exactement la raison pour laquelle ce
   fichier-là existe — la leçon est écrite en tête. */
{
  const { menusAvecLangue } = require('../src/menu-langue');
  /* ⚠ LA GREFFE VISE « AFFICHAGE », ET ELLE Y EST REVENUE LE 2026-09-14 AU SOIR,
     sur sa demande : « la langue doit rester dans le menu Affichage, et non
     Configuration ». Elle avait suivi les réglages du poste le matin (menu
     « Réglages » neuf, puis « Configuration » quand il a demandé de replier
     l'un dans l'autre). Ce banc suit le déménagement — et le retour ; sans ça
     il garderait l'ANCIENNE vérité, ce qui est pire qu'aucun banc : il
     refuserait la bonne version.
     ⚠⚠ ET LE REPLI SUR « Affichage » A DISPARU AVEC LE PROBLÈME QU'IL
     RATTRAPAIT. Il avait fallu l'ajouter parce que « Configuration » n'a aucune
     entrée `libre` : le site la retire du modèle hors session, et la langue s'y
     retrouvait enfermée — sur l'écran même dont il avait demandé la traduction.
     « Affichage » étant là AVANT comme APRÈS, la cible unique suffit. Le cas 7
     l'éprouve : à l'écran de connexion, la greffe doit être là. */
  const base = [
    { label: 'Fichier',       items: [{ label: 'Quitter', app: 'quit' }] },
    { label: 'Configuration', items: [{ label: 'Thème sombre' }] },
    { label: 'Affichage',     items: [{ label: 'Recharger', app: 'reload' }] },
    { label: 'Aide',          items: [{ label: 'À propos', app: 'about' }] },
  ];
  const trouverDans = (ms, nom) => ((ms.find((m) => m.label === nom) || { items: [] }).items || [])
    .find((it) => it && it.label === 'Langue / Language');
  const trouver = (ms) => trouverDans(ms, 'Affichage');

  // 1. L'entrée est là, dans le menu Affichage.
  const fr = menusAvecLangue(base, 'fr');
  const e = trouver(fr);
  if (!e) {
    fautes.push('menusAvecLangue() n’ajoute pas « Langue / Language » au menu Affichage');
  } else if (!Array.isArray(e.sub) || e.sub.length !== 2) {
    fautes.push('le bascule n’offre pas DEUX langues');
  } else {
    // 2. La coche suit la langue — dans les DEUX sens.
    const coche = (ms) => ((trouver(ms).sub || []).find((x) => x.coche) || {}).label;
    if (coche(fr) !== 'Français') {
      fautes.push('en français la coche est sur « ' + coche(fr) +' » au lieu de « Français »');
    }
    const en = menusAvecLangue(base, 'en');
    if (coche(en) !== 'English') {
      fautes.push('en anglais la coche est sur « ' + coche(en) + ' » au lieu de « English »');
    }
    // 3. Les verbes — sans eux le clic serait MUET.
    const apps = (e.sub || []).map((x) => x.app).sort().join(',');
    if (apps !== 'langue-en,langue-fr') {
      fautes.push('les verbes du bascule sont « ' + apps + ' » : `actionApp` ne les connaîtra pas');
    }
  }

  /* 4. ⚠ LE MODÈLE PAS ENCORE ARRIVÉ : on n’invente PAS de menu. Une entrée
     seule dans une barre vide serait pire que pas d’entrée du tout. */
  if (JSON.stringify(menusAvecLangue([], 'fr')) !== '[]') {
    fautes.push('menusAvecLangue([]) invente un menu — un modèle vide doit rester vide');
  }
  const sansAff = [{ label: 'Fichier', items: [{ label: 'Quitter' }] }];
  if (JSON.stringify(menusAvecLangue(sansAff, 'fr')) !== JSON.stringify(sansAff)) {
    fautes.push('sans menu Affichage le modèle est MODIFIÉ — il doit rester tel quel');
  }

  /* 5. ⚠ L’INTITULÉ TRADUIT : une barre déjà en anglais affiche « View ».
     Sans ce filet, le bascule y serait introuvable — et c'est précisément par
     là qu'on revient au français. */
  const vue = [{ label: 'View', items: [{ label: 'Reload' }] }];
  const g = ((menusAvecLangue(vue, 'en')[0] || {}).items || [])
    .find((it) => it && it.label === 'Langue / Language');
  if (!g) fautes.push('le menu « View » (intitulé traduit) ne reçoit pas le bascule');

  /* 6. ⚠ ON NE GREFFE QU’UNE FOIS, même si deux menus portaient le nom : un
     réglage en double finit par se contredire. */
  const deux = menusAvecLangue(base.concat([{ label: 'Affichage', items: [] }]), 'fr');
  const n = deux.reduce((k, m) => k
    + ((m.items || []).filter((it) => it && it.label === 'Langue / Language').length), 0);
  if (n !== 1) fautes.push('le bascule est greffé ' + n + ' fois au lieu d’une');

  /* 7. ⚠⚠ L'ÉCRAN DE CONNEXION — LE CAS QUI A COÛTÉ UN ALLER-RETOUR.
     Là, le modèle ne porte QUE les entrées `libre` : Fichier, Affichage, Aide.
     « Configuration » n'y est pas — aucune de ses entrées n'est `libre`. C'est
     ce qui a rendu la langue inatteignable le temps qu'elle y a séjourné, sur
     l'écran même dont il avait demandé la traduction le 2026-09-11.
     ⚠ CE CAS RESTE, ET IL EST PLUS IMPORTANT QUE JAMAIS : il éprouve que la
     langue se trouve AVANT d'ouvrir une session. Si quelqu'un la redéplaçait
     un jour vers un menu réservé aux sessions, c'est lui qui le dirait. */
  const connexion = [
    { label: 'Fichier',   items: [{ label: 'Quitter', app: 'quit' }] },
    { label: 'Affichage', items: [{ label: 'Recharger', app: 'reload' }] },
    { label: 'Aide',      items: [{ label: 'À propos', app: 'about' }] },
  ];
  const cx = menusAvecLangue(connexion, 'fr');
  if (!trouverDans(cx, 'Affichage')) {
    fautes.push('à l’écran de connexion le bascule ne se greffe PAS sur Affichage — la langue y serait inatteignable');
  }

  /* 8. ⚠ ET IL NE VA PAS DANS « CONFIGURATION ». Il y a séjourné une journée
     (2026-09-14) ; il a demandé qu'il revienne dans « Affichage ». Deux portes
     pour le même réglage, ce serait deux coches à tenir d'accord — et la
     seconde vivrait derrière la session. */
  if (trouverDans(fr, 'Configuration')) {
    fautes.push('le bascule est greffé sur Configuration : sa place est Affichage (sa demande du 2026-09-14)');
  }
}

/* ══ LE RACCORD BARRE → PANNEAU, CELUI QUI A RENDU LE MENU MUET ═════════════
   ⚠⚠⚠ SA PANNE DU 2026-09-13 : « le menu ne marche pas en anglais, quand on
   clique rien ne se passe », puis « certains menus genre File, Accounting,
   Shop, View et Help ». Exactement ceux dont l intitulé CHANGE en traduction —
   Marketing et Configuration, identiques dans les deux langues, marchaient. Une
   panne PARTIELLE, donc plus difficile à nommer qu une panne franche.

   La cause : la page du panneau a été traduite (elle ne connaît plus que
   « Shop »), et on continuait de lui demander « Boutique ».
   ➡ **TRADUIRE UN CÔTÉ D UNE CORRESPONDANCE, C EST LA ROMPRE.**

   ⚠ AUCUN BANC NE POUVAIT LE VOIR : le raccord vivait dans `main.js`, entre un
   `executeJavaScript` et une page `data:`. Sorti dans `pourLePanneau`, il
   s éprouve ici — c est la leçon en tête de `menu-langue.js`, et c est la
   deuxième fois qu elle se paie sur CE fichier.

   ⚠ ON EXIGE LES DEUX FORMES D ENTRÉE, parce qu il y a deux appelants : la
   barre du SITE envoie l intitulé d ORIGINE, le CADRE natif envoie ce qu il
   AFFICHE. Un pont qui ne tiendrait que d un côté serait muet pour l autre. */
{
  const modele = [
    { label: 'Fichier', items: [{ label: 'Quitter', app: 'quit' }] },
    { label: 'Boutique', items: [{ label: 'Commandes', section: 'orders' }] },
    { label: 'Affichage', items: [{ label: 'Recharger', app: 'reload' }] },
    { label: 'Marketing', items: [{ label: 'Coupons', section: 'coupons' }] },
  ];
  for (const l of ['fr', 'en']) {
    /* Les intitulés QUE LA PAGE DU PANNEAU CONNAÎT — bâtis exactement comme
       `menu:panneau` les bâtit (`_trItems(_menusLangue())`). */
    const connus = new Set(trItems(_mal(modele, l), l).map((m) => m.label));
    for (const m of modele) {
      /* Les deux appelants : le site (origine) et le cadre (ce qu il affiche). */
      for (const envoye of [m.label, trMenu(m.label, l)]) {
        const vu = pourLePanneau(envoye, l);
        if (!connus.has(vu)) {
          fautes.push('[' + l + '] la barre envoie « ' + envoye + ' » → le panneau reçoit « '
            + vu + ' », qui ne figure pas parmi ses menus (' + [...connus].join(', ')
            + ') — le clic serait MUET');
        }
      }
    }
  }
  /* ⚠ ET CE QU ON NE CONNAÎT PAS RESSORT TEL QUEL : un menu ajouté demain ne
     doit pas devenir une chaîne vide, sinon il serait muet lui aussi. */
  if (pourLePanneau('Menu inconnu', 'en') !== 'Menu inconnu') {
    fautes.push('pourLePanneau abîme un intitulé qu’il ne connaît pas : « '
      + pourLePanneau('Menu inconnu', 'en') + ' »');
  }
}

if (fautes.length) {
  console.error('✗ la traduction du menu a ' + fautes.length + ' trou(s) :');
  fautes.forEach((x) => console.error('   — ' + x));
  process.exit(1);
}
/* ⚠ LE VERDICT DIT CE QU'IL A REGARDÉ, ET COMBIEN. Il n'annonçait que les
   entrées libres alors qu'il garde maintenant tout le menu : un banc qui
   sous-déclare sa portée laisse croire à un trou là où il n'y en a pas — et,
   le jour où il en reste un, empêche de voir qu'il n'a rien regardé. */
console.log('✓ ' + libres.size + ' entrée(s) libre(s) + ' + Object.keys(MENU_APP_EN).length
  + ' intitulé(s) de session + les ' + MENUS.length + ' menus qui les portent : '
  + 'tous traduits, appliqués, et retrouvables en sens inverse.');
