'use strict';

/*
 * FENÊTRE « ÉDITEUR VISUEL » — le dernier écran d'administration qui vivait en web
 * =============================================================================
 * Le plan de travail d'un modèle promotionnel : l'aperçu, les poignées, la liste
 * des éléments et l'inspecteur. C'est le SEUL écran d'administration qui n'avait
 * pas d'équivalent natif, et c'est lui qui empêchait de retirer le panneau web.
 *
 * ⚠⚠ LE MODÈLE VOYAGE, LE RENDU RESTE — ET CE N'EST PAS UN COMPROMIS.
 * On a cru pendant des semaines que cet éditeur ne POUVAIT PAS être natif. La
 * raison écrite était juste : le rendu d'un objet promotionnel est un CANEVAS,
 * et seule la fenêtre principale a l'origine du site — donc le droit de relire
 * une image du stockage sans TEINDRE le canevas, ce qui interdirait ensuite
 * toDataURL, donc l'aperçu et l'impression. La conclusion, elle, était fausse :
 * ce n'est pas l'ÉDITEUR qui a besoin de l'origine, c'est le RENDU.
 *
 * Cette fenêtre ne peint donc RIEN. Elle reçoit :
 *   · le MODÈLE, une structure plate dont la géométrie est en POURCENTAGES ;
 *   · l'IMAGE déjà peinte par la fenêtre principale (promo:modeleLire).
 * Elle pose ses poignées PAR-DESSUS l'image, en calculant sur des nombres, et
 * renvoie le modèle modifié. L'impression et l'aperçu ne bougent pas d'un pouce.
 *
 * ⚠ POURQUOI LES POIGNÉES SONT DES BOÎTES HTML ET NON UN CANEVAS. Un canevas
 * pour dessiner huit rectangles ramènerait exactement le problème qu'on vient
 * d'éviter, et coûterait sa propre gestion du clic. Des div positionnées en
 * pourcentage se placent toutes seules quand la fenêtre change de taille — ce
 * que le plan de travail web devait recalculer à la main.
 *
 * ⚠⚠ CE QUE LA DEUXIÈME TRANCHE A AJOUTÉ, ET LE TROU QU'ELLE A D'ABORD OUVERT.
 * Ajouter un élément, changer le fond, poser une image : ces trois gestes ne
 * DÉPLACENT aucune poignée. Dans une fenêtre qui ne peint pas, ils ne
 * produisaient donc strictement AUCUN retour à l'écran — on ajoutait un texte,
 * et il ne se passait rien jusqu'à l'enregistrement. Un éditeur dont le geste
 * le plus courant ne montre rien n'est pas un éditeur, c'est un formulaire.
 * ➡ D'où promo:modeleApercu : la fenêtre envoie le modèle EN COURS, le site le
 * peint là où le peintre a toujours vécu, et RIEN N'EST ENREGISTRÉ. C'est la
 * pièce qui rend l'ajout et le fond utilisables.
 *
 * ⚠ L'IMPORT D'UNE NOUVELLE IMAGE N'EST PAS ICI, ET C'EST VOULU. Il a sa propre
 * fenêtre native — la Logothèque — avec son assistant de recadrage, son plafond
 * de résolution et son calcul de DPI. Deux portes d'import auraient donné deux
 * recadrages, donc deux résultats pour le même fichier. Le bouton « Importer
 * une image… » OUVRE cette fenêtre-là ; le sélecteur, lui, lit la logothèque.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, il se refermerait.
 * ⚠⚠ EN REVANCHE LES TEXTES VISIBLES PORTENT LEURS ACCENTS. « Accent grave »
 * désigne le caractère, PAS les lettres accentuées — la première version de
 * cette fenêtre a confondu les deux et affichait « Modele ouvert », « Element
 * verrouille », « Opacite ». C'est une faute d'orthographe à l'écran, dans une
 * interface en français du Québec ; elle est corrigée ici.
 * ⚠⚠ ET LES APOSTROPHES S'ÉCRIVENT ’, PAS '. Ce n'est pas une coquetterie de
 * typographe, c'est ce qui rend le fichier sûr : une apostrophe droite dans une
 * chaîne à guillemets simples devrait être échappée, mais le GABARIT mange la
 * contre-oblique au passage — l'apostrophe sortirait NUE dans le script engendré
 * et y fermerait la chaîne. L'apostrophe typographique ne demande aucun
 * échappement, et c'est déjà la convention du reste des fenêtres.
 * ⚠ Le piège d'en face, celui où je suis tombé en écrivant cette version : les
 * RETIRER pour contourner le problème. « n a pas », « s annule », « l image » —
 * ce n'est plus un problème d'échappement, c'est du français fautif à l'écran.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{font-size:1rem;margin:0;font-weight:650}
.tete .sous{font-size:.73rem;color:var(--tx2)}
.tete .fin{margin-left:auto;display:flex;gap:.5rem;align-items:center}
.zone{flex:1 1 auto;min-height:0;display:flex;gap:0}

/* ── LE PLAN DE TRAVAIL ────────────────────────────────────────────────────
   Le damier dit ce qui est TRANSPARENT : sans lui, un fond blanc et un fond
   absent se ressemblent, et l on imprime du vide en croyant imprimer du blanc. */
.plan{flex:1 1 auto;min-width:0;display:flex;align-items:center;justify-content:center;
  padding:1.2rem;overflow:auto;
  background:
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%),
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%);
  background-size:18px 18px;background-position:0 0,9px 9px}
/* ⚠ LE BLANC DE LA SCENE EST VOLONTAIRE, ET IL NE SUIT PAS LE THEME : c est le
   PAPIER. Une etiquette imprimee est blanche de jour comme de nuit, et teinter
   le plan de travail montrerait des couleurs qui ne sortiront jamais de
   l imprimante — on choisirait un texte lisible sur un fond qui n existe pas.
   Declare dans tools/contraste-jour-declare.js pour la meme raison. */
.scene{position:relative;box-shadow:0 8px 30px rgba(0,0,0,.45);
  outline:1px solid var(--v12);background:#fff}
.scene img{display:block;width:100%;height:100%;object-fit:fill;
  -webkit-user-drag:none;user-select:none}
.boite{position:absolute;border:1px dashed var(--v50);
  mix-blend-mode:difference;cursor:move}
.boite.sel{border:1.5px solid #7AA7FF;mix-blend-mode:normal;
  box-shadow:0 0 0 1px rgba(0,0,0,.35)}
.boite.cache{opacity:.35;border-style:dotted}
.boite.verr{cursor:not-allowed}
.poi{position:absolute;width:11px;height:11px;background:#7AA7FF;
  border:1px solid #0b1220;border-radius:2px}
.poi.br{right:-6px;bottom:-6px;cursor:nwse-resize}
.etiq{position:absolute;left:0;top:-19px;font-size:.62rem;white-space:nowrap;
  background:#7AA7FF;color:#0b1220;padding:0 .3rem;border-radius:3px;font-weight:700}

/* ── L INSPECTEUR ─────────────────────────────────────────────────────────── */
.insp{flex:0 0 330px;border-left:1px solid var(--v08);display:flex;flex-direction:column;
  background:var(--f-carte);min-height:0}
/* ⚠ LA BARRE D AJOUT EST EN HAUT DE L INSPECTEUR, PAS DANS LE PLAN. Le plan est
   une surface de manipulation directe : y poser des boutons ferait cliquer
   dessus en visant un element. */
.outils{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:.3rem;padding:.5rem .6rem;
  border-bottom:1px solid var(--v08)}
.outils .btn{font-size:.75rem;padding:.26rem .48rem}
.insp .lst{flex:0 0 auto;max-height:30%;overflow-y:auto;border-bottom:1px solid var(--v08)}
.insp .prop{flex:1 1 auto;overflow-y:auto;padding:.7rem .8rem}
.el{display:flex;align-items:center;gap:.45rem;padding:.34rem .7rem;cursor:pointer;
  border-bottom:1px solid var(--v04);font-size:.79rem}
.el:hover{background:var(--v04)}
.el.sel{background:var(--v08);font-weight:650}
.el .k{font-size:.66rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.04em}
.el .n{flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* ⚠ PAS D OPACITE ICI. Ces deux marqueurs disent qu un element est MASQUE ou
   VERROUILLE — c est-a-dire pourquoi il ne bouge pas quand on le tire. Estompes
   a 0,6 ils tombaient a 4,21:1 sur le fond de jour, sous le seuil, et c est le
   banc AU RENDU qui l a mesure : le CSS seul ne pouvait pas le dire. Rendre
   discret ce qui explique une impossibilite, c est cacher la reponse a la
   question qu on se pose a cet instant. */
.el .oeil{color:var(--tx)}
.bloc{margin-bottom:.7rem}
.bloc>label{display:block;font-size:.68rem;color:var(--tx2);margin-bottom:.2rem;
  text-transform:uppercase;letter-spacing:.04em}
.bloc input[type=text],.bloc textarea,.bloc select{width:100%;padding:.34rem .45rem;
  background:var(--f-champ);color:var(--tx);border:1px solid var(--v12);border-radius:6px;
  font:inherit;font-size:.82rem}
.bloc textarea{min-height:56px;resize:vertical}
.rang{display:flex;gap:.4rem}
.rang>div{flex:1 1 0;min-width:0}
.rang input[type=number]{width:100%;padding:.3rem .4rem;background:var(--f-champ);
  color:var(--tx);border:1px solid var(--v12);border-radius:6px;font:inherit;font-size:.8rem}
.p{font-size:.64rem;color:var(--tx2)}
.btn{padding:.34rem .7rem;border-radius:7px;border:1px solid var(--v12);
  background:var(--v04);color:var(--tx);font:inherit;font-size:.8rem;cursor:pointer}
.btn:hover{background:var(--v08)}
.btn[disabled]{opacity:.45;cursor:default}
.btn.plein{background:#2f6f4f;border-color:#2f6f4f;color:#fff;font-weight:650}
.btn.plein[disabled]{opacity:.45;cursor:default}
/* Le retrait d un element se distingue, mais rien n est perdu : l annulation le
   ramene. C est pour cela qu il n y a pas de confirmation. */
.btn.danger{color:var(--tx-err2);border-color:rgba(200,90,90,.45)}
.btn.danger:hover{background:rgba(200,90,90,.14)}
.acts{display:flex;flex-wrap:wrap;gap:.35rem}
.seg{display:inline-flex;border:1px solid var(--v12);border-radius:7px;overflow:hidden}
.seg button{padding:.26rem .55rem;background:transparent;color:var(--tx2);border:0;
  font:inherit;font-size:.76rem;cursor:pointer}
.seg button.on{background:#7AA7FF;color:#0b1220;font-weight:650}
.seg button:hover:not(.on){background:var(--v08);color:var(--tx)}
/* Le damier ici aussi : une image a coins transparents doit se voir comme telle
   AVANT d etre posee, sinon on decouvre le trou une fois imprime. */
.vign{width:100%;height:96px;border:1px solid var(--v12);border-radius:8px;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
  margin-bottom:.35rem;
  background:
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%),
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%),
    var(--f-champ);
  background-size:14px 14px,14px 14px,auto;background-position:0 0,7px 7px,0 0}
.vign img{max-width:100%;max-height:100%;object-fit:contain;display:block}
.vide{padding:1.1rem;color:var(--tx2);font-size:.83rem;text-align:center}
.note{font-size:.71rem;color:var(--tx2);line-height:1.35;margin-top:.2rem}
.pied{flex:0 0 auto;padding:.42rem 1.05rem;border-top:1px solid var(--v08);
  font-size:.76rem;min-height:1.9rem;background:var(--f-carte)}

/* ── LE SELECTEUR DE LA LOGOTHEQUE ────────────────────────────────────────── */
.voile{position:fixed;inset:0;background:rgba(4,8,14,.72);display:flex;
  align-items:center;justify-content:center;padding:1.4rem;z-index:40}
.cadre{background:var(--f-carte);border:1px solid var(--v12);border-radius:13px;
  width:min(800px,100%);max-height:100%;display:flex;flex-direction:column;
  overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.5)}
.cadre .ct{display:flex;align-items:center;gap:.6rem;padding:.7rem .9rem;
  border-bottom:1px solid var(--v08);font-weight:650}
.cadre .cc{flex:1 1 auto;overflow-y:auto;padding:.8rem .9rem;min-height:8rem}
.cadre .cp{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;
  padding:.6rem .9rem;border-top:1px solid var(--v08);font-size:.76rem;color:var(--tx2)}
.cadre .cp .fin{margin-left:auto;display:flex;gap:.4rem}
.gril{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5rem,1fr));gap:.6rem}
.lg{background:var(--f-champ);border:1px solid var(--v12);border-radius:9px;
  padding:.4rem;cursor:pointer;display:flex;flex-direction:column;gap:.3rem;
  color:var(--tx);font:inherit;text-align:left}
.lg:hover{border-color:#7AA7FF;background:var(--v08)}
.lg .th{height:74px;display:flex;align-items:center;justify-content:center;overflow:hidden;
  border-radius:6px;
  background:
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%),
    linear-gradient(45deg,var(--v04) 25%,transparent 25%,transparent 75%,var(--v04) 75%);
  background-size:12px 12px;background-position:0 0,6px 6px}
.lg .th img{max-width:100%;max-height:100%;object-fit:contain;display:block}
.lg .nm{font-size:.72rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ── LA REPRISE DE JOUR ────────────────────────────────────────────────────
   ⚠ EN MODE JOUR LA FENETRE PASSE EN CLAIR, et une piece laissee sombre y
   reste sombre : le vert du bouton d enregistrement et le liset des poignees
   devenaient deux taches de nuit sur un ecran de jour. Le banc des fonds l a
   refuse, et il a eu raison — c est le genre de detail qu on ne voit jamais
   parce qu on developpe dans un seul des deux modes. */
html.jour .btn.plein{background:#1f5a3d;border-color:#1f5a3d;color:#fff}
html.jour .poi{background:#2f5fb5;border-color:#ffffff}
html.jour .etiq{background:#2f5fb5;color:#fff}
html.jour .boite.sel{border-color:#2f5fb5}
html.jour .seg button.on{background:#2f5fb5;color:#ffffff}
html.jour .lg:hover{border-color:#2f5fb5}
/* Le voile reste sombre de jour — c est SA fonction : eteindre la page derriere.
   Mais il est DECLARE, et non herite d un oubli. */
html.jour .voile{background:rgba(18,24,33,.5)}
`;

function pagePromoEditeur(id) {
  const cible = String(id || '');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Éditeur visuel — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.promoprint}</span><h1 id="titre">Éditeur visuel</h1>
  <span class="sous" id="sous"></span>
  <span class="fin">
  <button class="btn" id="b-annuler" type="button" title="Annuler (Ctrl+Z)" disabled>↶ Annuler</button>
  <button class="btn" id="b-refaire" type="button" title="Refaire (Ctrl+Y)" disabled>↷ Refaire</button>
  <button class="btn" id="b-recharger" type="button">↻ Recharger</button>
  <button class="btn plein" id="b-enr" type="button" disabled>Enregistrer</button></span></div>
<div class="zone" id="corps">
  <div class="plan" id="plan"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div>
  <div class="insp">
    <div class="outils" id="outils"></div>
    <div class="lst" id="lst"></div>
    <div class="prop" id="prop"></div>
  </div>
</div>
<div class="pied"><span class="msg" id="msg"></span></div>
<div class="voile" id="voile" hidden>
  <div class="cadre">
    <div class="ct"><span id="choix-titre">Choisir une image</span></div>
    <div class="cc" id="choix-corps"></div>
    <div class="cp"><span id="choix-etat"></span><span class="fin">
      <button class="btn" id="b-importer" type="button">Importer une image…</button>
      <button class="btn" id="b-relire" type="button">↻ Actualiser</button>
      <button class="btn" id="b-fermer-choix" type="button">Fermer</button>
    </span></div>
  </div>
</div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var ID = '${cible}';
  var M = null;          // le modele, tel qu il voyage
  var SEL = '';          // id de l element choisi ; vide = le MODELE lui-meme
  var SALE = false;      // des modifications non enregistrees
  var IMG = '';          // l apercu deja peint par la fenetre principale
  var LOGOS = null;      // la logotheque, telle que le site nous l a rendue
  var CHOIX = null;      // ce qu on fait du logo choisi (une fonction)

  var plan = document.getElementById('plan');
  var lst = document.getElementById('lst');
  var prop = document.getElementById('prop');
  var outils = document.getElementById('outils');
  var bEnr = document.getElementById('b-enr');
  var bAnn = document.getElementById('b-annuler');
  var bRef = document.getElementById('b-refaire');
  var voile = document.getElementById('voile');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:      'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:        'Votre compte n’a pas le droit de modifier les objets promotionnels.',
    module_promo: 'Le module d’impression n’est pas chargé dans la fenêtre principale.',
    introuvable:  'Ce modèle n’existe plus — il a peut-être été supprimé ailleurs.',
    parametre:    'Demande incomplète.',
    genre_inconnu:'Ce type d’élément n’existe pas.',
    trop_long:    'Le modèle dépasse la taille permise (8 Mo d’éléments).',
    pont_indisponible: 'La fenêtre principale ne répond pas.',
    echec:        'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 120)) + ')';
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  function els(){ return (M && Array.isArray(M.elements)) ? M.elements : []; }
  function parId(id){ var l = els(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function selEl(){ return SEL ? parId(SEL) : null; }
  function nb(v, d){ var n = parseFloat(v); return isFinite(n) ? n : d; }
  /* Une geometrie hors du plan de travail ne se recupere pas a la souris : on
     borne a l enregistrement, pas a l affichage, pour ne pas deplacer sous les
     doigts un element qu on est en train de tirer. */
  function borner(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function salir(){ SALE = true; bEnr.disabled = false; }

  /* ══ L HISTORIQUE ════════════════════════════════════════════════════════
     ⚠ ON GARDE DES CHAINES, PAS DES OBJETS. Un instantane qui partagerait ses
     tableaux avec le modele vivant ne serait pas un instantane : la premiere
     modification le suivrait, et annuler ramenerait exactement l etat qu on
     voulait quitter. La serialisation coupe le lien, et son cout est celui d un
     modele — quelques dizaines de kilo-octets.
     ⚠ ET IL Y A DEUX PORTES. Un geste FRANC (ajouter, supprimer, poser une
     image) pose son instantane a coup sur. Un geste CONTINU (tirer une poignee,
     taper un texte) en poserait un par pixel et par lettre : celui-la passe par
     la porte douce, qui n en garde qu un par tranche de 900 ms. Sans cette
     distinction, l annulation recule d une lettre a la fois — et on la juge
     cassee. */
  var HIST = [], REFAIRE = [], DERNIER = 0;
  function boutonsHist(){
    bAnn.disabled = !HIST.length;
    bRef.disabled = !REFAIRE.length;
  }
  function instantane(){
    if (!M) return;
    HIST.push(JSON.stringify(M));
    if (HIST.length > 40) HIST.shift();
    REFAIRE = [];
    DERNIER = Date.now();
    boutonsHist();
  }
  function instantaneDoux(){
    if (Date.now() - DERNIER > 900) instantane();
  }
  function reprendre(pile, autre){
    if (!pile.length || !M) return false;
    autre.push(JSON.stringify(M));
    M = JSON.parse(pile.pop());
    /* ⚠ LA SELECTION SURVIT SI SON ELEMENT SURVIT. La perdre a chaque annulation
       obligerait a re-designer apres chaque Ctrl+Z, ce qui rend l annulation
       penible au point qu on cesse de s en servir. */
    if (SEL && !parId(SEL)) SEL = '';
    salir();
    boutonsHist();
    dessiner();
    repeindreBientot();
    return true;
  }
  function annuler(){ if (reprendre(HIST, REFAIRE)) dire('Annulé.', 'bon'); }
  function refaire(){ if (reprendre(REFAIRE, HIST)) dire('Rétabli.', 'bon'); }

  /* ══ LA REPEINTURE — CE QUI REND L AJOUT VISIBLE ══════════════════════════
     ⚠⚠ CETTE FENETRE NE PEINT RIEN, et c est ce qui lui epargne l origine du
     site. Deplacer une boite s y voyait quand meme : la poignee bouge. Mais
     AJOUTER un element, ou changer le FOND, ne deplace aucune poignee — il ne se
     passait donc rien a l ecran avant l enregistrement. On redemande donc au
     site de peindre le modele EN COURS, sans rien enregistrer.
     ⚠ DIFFERE, ET UN SEUL A LA FOIS. Peindre charge les images : le faire a
     chaque frappe mettrait la fenetre principale a genoux, et les reponses
     arriveraient dans le desordre — la derniere peinte ne serait pas la
     derniere demandee. Un jeton par demande, et seule la plus recente compte. */
  var MINUTERIE = null, JETON = 0;
  function repeindreBientot(){
    if (MINUTERIE) clearTimeout(MINUTERIE);
    MINUTERIE = setTimeout(repeindre, 450);
  }
  function repeindre(){
    if (!M) return;
    MINUTERIE = null;
    var mien = ++JETON;
    appeler('promo:modeleApercu', [ID, M, 520]).then(function(r){
      if (mien !== JETON) return;          // une demande plus recente a pris la main
      if (!r.ok) { dire('Aperçu non repeint : ' + expliquer(r), 'att'); return; }
      IMG = r.image || '';
      dessinerPlan();
      if (!r.rendable) dire('L’aperçu n’a pas pu être peint' + (r.detail ? ' : ' + r.detail : '')
        + '. Les poignées restent utilisables.', 'att');
    });
  }

  /* ══ LE PLAN DE TRAVAIL ═══════════════════════════════════════════════════
     ⚠ LA SCENE GARDE LES PROPORTIONS DU MODELE, et c est la seule mesure qui
     compte : les pourcentages du modele n ont de sens que sur une boite dont le
     rapport largeur/hauteur est celui de l objet imprime. Une scene carree pour
     une etiquette 2 x 1 po placerait chaque poignee a cote. */
  function dessinerPlan(){
    if (!M) return;
    var rap = (nb(M.h, 1) || 1) / (nb(M.w, 1) || 1);
    var dispoL = Math.max(160, plan.clientWidth - 40);
    var dispoH = Math.max(120, plan.clientHeight - 40);
    var L = dispoL, H = Math.round(L * rap);
    if (H > dispoH) { H = dispoH; L = Math.round(H / rap); }
    var h = '<div class="scene" id="scene" style="width:' + L + 'px;height:' + H + 'px">';
    if (IMG) h += '<img src="' + esc(IMG) + '" alt="Aperçu du modèle">';
    els().forEach(function(el){
      var cl = 'boite' + (el.id === SEL ? ' sel' : '') + (el.hidden ? ' cache' : '') + (el.locked ? ' verr' : '');
      h += '<div class="' + cl + '" data-el="' + esc(el.id) + '" style="left:' + nb(el.xPct, 0) + '%;top:'
        + nb(el.yPct, 0) + '%;width:' + nb(el.wPct, 10) + '%;height:' + nb(el.hPct, 10) + '%">';
      if (el.id === SEL) {
        h += '<span class="etiq">' + esc(el.name || el.kind || 'Élément') + '</span>';
        if (!el.locked) h += '<span class="poi br" data-poi="br"></span>';
      }
      h += '</div>';
    });
    h += '</div>';
    plan.innerHTML = h;
  }

  var GENRES = [['text', 'Texte'], ['image', 'Image'], ['shape', 'Forme'],
                ['line', 'Ligne'], ['barcode', 'Code-barres']];
  function dessinerOutils(){
    var h = '';
    GENRES.forEach(function(g){
      h += '<button class="btn" type="button" data-ajout="' + g[0] + '"' + (M ? '' : ' disabled')
        + '>＋ ' + esc(g[1]) + '</button>';
    });
    outils.innerHTML = h;
  }

  function dessinerListe(){
    var l = els();
    /* La premiere ligne n est pas un element : c est le MODELE. Sans elle, il n y
       a aucun moyen de revenir au fond une fois qu on a choisi un element. */
    var h = '<div class="el' + (SEL ? '' : ' sel') + '" data-sel="">'
      + '<span class="k">Mod</span><span class="n">Le modèle (fond, bordure)</span></div>';
    if (!l.length) h += '<div class="vide">Ce modèle ne porte aucun élément. Ajoutez-en un ci-dessus.</div>';
    /* Le haut de la pile en premier : c est l ordre ou on le voit a l ecran. */
    l.slice().reverse().forEach(function(el){
      h += '<div class="el' + (el.id === SEL ? ' sel' : '') + '" data-sel="' + esc(el.id) + '">'
        + '<span class="k">' + esc(el.kind === 'text' ? 'Txt' : (el.kind === 'image' ? 'Img'
            : (el.kind === 'barcode' ? 'Cod' : (el.kind === 'line' ? 'Lig' : 'Frm')))) + '</span>'
        + '<span class="n">' + esc(el.name || el.text || 'Sans nom') + '</span>'
        + (el.hidden ? '<span class="oeil" title="Masqué">◌</span>' : '')
        + (el.locked ? '<span class="oeil" title="Verrouillé">⌧</span>' : '')
        + '</div>';
    });
    lst.innerHTML = h;
  }

  function champNum(cle, lbl, el, pas, prefixe){
    return '<div><label class="p">' + esc(lbl) + '</label>'
      + '<input type="number" data-' + (prefixe || 'num') + '="' + cle + '" step="' + (pas || 1) + '" value="'
      + (Math.round(nb(el[cle], 0) * 1000) / 1000) + '"></div>';
  }
  function segment(nom, options, courant){
    return '<div class="seg">' + options.map(function(o){
      return '<button type="button" data-seg="' + nom + '" data-val="' + o[0] + '"'
        + (courant === o[0] ? ' class="on"' : '') + '>' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }

  /* ══ L INSPECTEUR DU MODELE (aucun element choisi) ════════════════════════
     ⚠ LA FORME ET LES DIMENSIONS NE SE CHANGENT PAS ICI, et le dire evite de
     les chercher : le coeur d ecriture les REFUSE volontairement. Redimensionner
     un modele deplace tout ce qu il porte, et c est une operation a part, qui
     sait ce qu elle deplace. */
  function dessinerPropModele(){
    var b = M.bg || {}, bo = M.border || {};
    var type = b.type || 'solid';
    var h = '';
    h += '<div class="bloc"><label>Nom du modèle</label>'
      + '<input type="text" data-mtxt="name" value="' + esc(M.name || '') + '"></div>';
    h += '<div class="bloc"><label>Fond</label>'
      + segment('bgtype', [['solid', 'Uni'], ['gradient', 'Dégradé'], ['image', 'Image']], type) + '</div>';
    if (type === 'gradient') {
      h += '<div class="bloc"><label>Dégradé</label><div class="rang">'
        + '<div><label class="p">De</label><input type="text" data-btxt="from" value="' + esc(b.from || '#ffffff') + '"></div>'
        + '<div><label class="p">Vers</label><input type="text" data-btxt="to" value="' + esc(b.to || '#efe6d8') + '"></div>'
        + '</div><div class="rang" style="margin-top:.3rem">'
        + champNum('angle', 'Angle (degrés)', b, 5, 'bnum') + '</div></div>';
    } else if (type === 'image') {
      h += '<div class="bloc"><label>Image de fond</label>'
        + (b.src ? '<div class="vign"><img src="' + esc(b.src) + '" alt="Image de fond"></div>'
                 : '<div class="vign"><span class="p">Aucune image</span></div>')
        + '<div class="acts"><button class="btn" type="button" data-choisir="fond">Choisir une image…</button>'
        + (b.src ? '<button class="btn danger" type="button" data-fond-retirer="1">Retirer</button>' : '')
        + '</div>'
        + '<div class="note">Les images viennent de la logothèque. Pour en déposer une nouvelle,'
        + ' le sélecteur ouvre la fenêtre Logothèque.</div></div>';
      h += '<div class="bloc"><label>Ajustement</label>'
        + segment('bgfit', [['cover', 'Remplir'], ['contain', 'Contenir']], b.fit || 'cover') + '</div>';
    } else {
      h += '<div class="bloc"><label>Couleur du fond</label>'
        + '<input type="text" data-btxt="color" value="' + esc(b.color || '#ffffff') + '">'
        + '<div class="note">Notation CSS : #ffffff, rgb(…), ou un nom.</div></div>';
    }
    h += '<div class="bloc"><label>Liseré imprimé</label><div class="rang">'
      + champNum('w', 'Épaisseur (po)', bo, .002, 'onum')
      + champNum('inset', 'Retrait (po)', bo, .005, 'onum') + '</div>'
      + '<div style="margin-top:.3rem"><input type="text" data-otxt="color" value="' + esc(bo.color || '#C49A6C') + '"></div>'
      + '<div class="note">Une épaisseur de 0 ne dessine aucun liseré.</div></div>';
    h += '<div class="bloc"><label>Repères (aperçu seulement)</label><div class="rang">'
      + champNum('safe', 'Marge sûre (po)', M, .01, 'mnum')
      + (M.shape === 'circle' ? '' : champNum('corner', 'Coins (po)', M, .01, 'mnum'))
      + '</div><div class="note">La marge sûre ne sort pas sur le papier : elle rappelle que les découpes'
      + ' ne sont jamais parfaitement centrées.</div></div>';
    h += '<div class="note">Le format (' + esc(nb(M.w, 0) + ' × ' + nb(M.h, 0) + ' po')
      + ') et la forme ne se changent pas ici : les redimensionner déplace tout ce que le modèle porte,'
      + ' et cela se fait depuis le Centre d’impression.</div>';
    prop.innerHTML = h;
  }

  function dessinerPropElement(el){
    var h = '';
    h += '<div class="bloc"><label>Nom</label><input type="text" data-txt="name" value="' + esc(el.name || '') + '"></div>';
    if (el.kind === 'text' || el.kind === 'barcode') {
      h += '<div class="bloc"><label>Texte</label><textarea data-txt="text">' + esc(el.text || '') + '</textarea></div>';
    }
    if (el.kind === 'text') {
      h += '<div class="bloc"><label>Taille (% de la hauteur)</label><div class="rang">'
        + champNum('fontPct', 'Corps', el, .5) + champNum('weight', 'Graisse', el, 100) + '</div></div>';
      h += '<div class="bloc"><label>Couleur</label><input type="text" data-txt="color" value="' + esc(el.color || '') + '">'
        + '<div class="note">Notation CSS : #111827, rgb(…), ou un nom.</div></div>';
      h += '<div class="bloc"><label>Alignement</label><select data-sel-champ="align">'
        + ['left', 'center', 'right'].map(function(v){
            return '<option value="' + v + '"' + (el.align === v ? ' selected' : '') + '>'
              + (v === 'left' ? 'Gauche' : (v === 'center' ? 'Centre' : 'Droite')) + '</option>'; }).join('')
        + '</select></div>';
    }
    if (el.kind === 'image') {
      h += '<div class="bloc"><label>Image</label>'
        + (el.src ? '<div class="vign"><img src="' + esc(el.src) + '" alt="Image de cet élément"></div>'
                  : '<div class="vign"><span class="p">Aucune image</span></div>')
        + '<div class="acts"><button class="btn" type="button" data-choisir="element">Choisir une image…</button>'
        + (el.src ? '<button class="btn danger" type="button" data-img-retirer="1">Retirer</button>' : '')
        + '</div></div>';
      h += '<div class="bloc"><label>Ajustement</label>'
        + segment('elfit', [['contain', 'Contenir'], ['cover', 'Remplir']], el.fit || 'contain') + '</div>';
    }
    if (el.kind === 'shape' || el.kind === 'line') {
      h += '<div class="bloc"><label>Couleur de remplissage</label>'
        + '<input type="text" data-txt="fill" value="' + esc(el.fill || '#C49A6C') + '"></div>';
    }
    h += '<div class="bloc"><label>Position et taille (% du modèle)</label><div class="rang">'
      + champNum('xPct', 'X', el, .5) + champNum('yPct', 'Y', el, .5) + '</div>'
      + '<div class="rang" style="margin-top:.3rem">'
      + champNum('wPct', 'Largeur', el, .5) + champNum('hPct', 'Hauteur', el, .5) + '</div></div>';
    h += '<div class="bloc"><div class="rang">'
      + champNum('rot', 'Rotation', el, 1) + champNum('opacity', 'Opacité', el, 5) + '</div></div>';
    h += '<div class="bloc"><label>État</label><div class="acts">'
      + '<button class="btn" type="button" data-bascule="hidden">' + (el.hidden ? 'Afficher' : 'Masquer') + '</button>'
      + '<button class="btn" type="button" data-bascule="locked">' + (el.locked ? 'Déverrouiller' : 'Verrouiller') + '</button>'
      + '</div><div class="note">Un élément verrouillé ne se déplace plus à la souris — il reste modifiable ici.</div></div>';
    h += '<div class="bloc"><label>Ordre dans la pile</label><div class="acts">'
      + '<button class="btn" type="button" data-ordre="1">↑ Avancer</button>'
      + '<button class="btn" type="button" data-ordre="-1">↓ Reculer</button>'
      + '</div><div class="note">Le dernier de la pile est celui qui se dessine par-dessus les autres.</div></div>';
    h += '<div class="bloc"><label>Cet élément</label><div class="acts">'
      + '<button class="btn" type="button" data-dupliquer="1">Dupliquer</button>'
      + '<button class="btn danger" type="button" data-supprimer="1">Supprimer</button>'
      + '</div><div class="note">'
      + 'Une suppression s’annule (Ctrl+Z) tant que la fenêtre reste ouverte.'
      + '</div></div>';
    prop.innerHTML = h;
  }

  function dessinerProp(){
    if (!M) { prop.innerHTML = ''; return; }
    var el = selEl();
    if (el) dessinerPropElement(el); else dessinerPropModele();
  }

  function dessiner(){ dessinerOutils(); dessinerPlan(); dessinerListe(); dessinerProp(); }

  /* ══ CHARGEMENT ══════════════════════════════════════════════════════════ */
  function charger(){
    dire('Lecture du modèle…');
    appeler('promo:modeleLire', [ID, 520]).then(function(r){
      if (!r.ok) {
        plan.innerHTML = '<div class="vide"><strong>Modèle non ouvert</strong><div style="margin-top:.4rem">'
          + esc(expliquer(r)) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      M = r.modele || null;
      IMG = r.image || '';
      SEL = '';
      SALE = false; bEnr.disabled = true;
      HIST = []; REFAIRE = []; boutonsHist();
      document.getElementById('titre').textContent = (M && M.name) || 'Éditeur visuel';
      document.getElementById('sous').textContent = M ? (M.w + ' × ' + M.h + ' po — ' + els().length + ' élément(s)') : '';
      /* ⚠ UN APERCU QUI N A PAS PU SE PEINDRE SE DIT. Sans ca, on editerait des
         poignees sur un fond vide en croyant que le modele est vide. */
      if (!r.rendable) dire('L’aperçu n’a pas pu être peint' + (r.detail ? ' : ' + r.detail : '')
        + '. Les poignées restent utilisables.', 'att');
      else dire('Modèle ouvert.', 'bon');
      dessiner();
    });
  }

  /* ══ ENREGISTREMENT ══════════════════════════════════════════════════════
     ⚠ ON RELIT APRES AVOIR ECRIT, et ce n est pas de la prudence de principe :
     l ecriture FUSIONNE cote site (elle ne remplace pas), et l apercu est repeint
     la-bas. Garder l ancienne image apres un enregistrement montrerait un modele
     qui n existe plus — le pire des deux, puisqu il ressemble au bon. */
  function enregistrer(){
    if (!M || !SALE) return;
    bEnr.disabled = true;
    dire('Enregistrement…');
    els().forEach(function(el){
      el.xPct = borner(nb(el.xPct, 0), -50, 150);
      el.yPct = borner(nb(el.yPct, 0), -50, 150);
      el.wPct = borner(nb(el.wPct, 10), 1, 200);
      el.hPct = borner(nb(el.hPct, 10), 1, 200);
      el.opacity = borner(nb(el.opacity, 100), 0, 100);
    });
    appeler('promo:modeleEcrire', [ID, M]).then(function(r){
      if (!r.ok) { bEnr.disabled = false; dire(expliquer(r), 'err'); return; }
      SALE = false;
      dire('Enregistré — ' + r.elements + ' élément(s).', 'bon');
      var garde = SEL;
      charger();
      setTimeout(function(){ SEL = garde; dessiner(); }, 0);
    });
  }

  /* ══ LES ELEMENTS ════════════════════════════════════════════════════════
     ⚠⚠ LES DEFAUTS VIENNENT DU SITE, JAMAIS D ICI. Un element porte jusqu a une
     trentaine de proprietes que le peintre lit toutes ; les recopier dans cette
     fenetre aurait fabrique, au premier ajout fait la-bas, un element auquel il
     manque une propriete — et le manque ne se serait vu qu a l impression.
     L identifiant vient de la meme source, ce qui evite d en forger un qui
     existe deja. */
  function ajouter(genre){
    if (!M) return;
    dire('Ajout…');
    appeler('promo:elementModele', [genre]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      instantane();
      M.elements = els().concat([r.element]);
      SEL = r.element.id;
      salir();
      dessiner();
      repeindreBientot();
      dire('Élément ajouté — pensez à enregistrer.', 'att');
    });
  }
  function dupliquer(){
    var el = selEl();
    if (!el) return;
    /* On redemande un modele du meme genre UNIQUEMENT pour son identifiant neuf
       et pour les proprietes qu une version plus recente aurait ajoutees ;
       l element source est recopie par-dessus. */
    appeler('promo:elementModele', [el.kind]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      instantane();
      var c = Object.assign({}, r.element, JSON.parse(JSON.stringify(el)), { id: r.element.id });
      c.xPct = borner(nb(c.xPct, 0) + 4, -50, 150);
      c.yPct = borner(nb(c.yPct, 0) + 4, -50, 150);
      M.elements = els().concat([c]);
      SEL = c.id;
      salir();
      dessiner();
      repeindreBientot();
      dire('Élément dupliqué.', 'bon');
    });
  }
  function supprimer(){
    var el = selEl();
    if (!el) return;
    instantane();
    M.elements = els().filter(function(x){ return x.id !== el.id; });
    SEL = '';
    salir();
    dessiner();
    repeindreBientot();
    dire('Élément retiré — Ctrl+Z le ramène.', 'att');
  }
  function ordonner(dir){
    var el = selEl();
    if (!el) return;
    var l = els(), i = l.indexOf(el), j = i + dir;
    if (i < 0 || j < 0 || j >= l.length) { dire('Déjà à cette extrémité de la pile.', 'att'); return; }
    instantane();
    l[i] = l[j]; l[j] = el;
    salir();
    dessiner();
    repeindreBientot();
  }

  /* ══ LE SELECTEUR DE LA LOGOTHEQUE ═══════════════════════════════════════
     ⚠ DEUX ADRESSES PAR LOGO. Ce qui s ECRIT dans le modele est l adresse du
     stockage — c est elle que le peintre du site sait relire sans teindre son
     canevas. Ce qui s AFFICHE ici est une vignette data:, parce qu une fenetre
     native n a pas l origine du site et n afficherait qu un cadre vide. */
  function ouvrirChoix(apres, titre){
    CHOIX = apres;
    document.getElementById('choix-titre').textContent = titre || 'Choisir une image';
    voile.hidden = false;
    if (LOGOS) dessinerChoix(); else lireLogos();
  }
  function fermerChoix(){ voile.hidden = true; CHOIX = null; }
  function lireLogos(){
    document.getElementById('choix-corps').innerHTML =
      '<div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div>';
    document.getElementById('choix-etat').textContent = 'Lecture de la logothèque…';
    appeler('promo:logos', [60]).then(function(r){
      if (!r.ok) {
        document.getElementById('choix-corps').innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>';
        document.getElementById('choix-etat').textContent = '';
        return;
      }
      LOGOS = r;
      dessinerChoix();
    });
  }
  function dessinerChoix(){
    var r = LOGOS, corps = document.getElementById('choix-corps');
    if (!r.logos.length) {
      corps.innerHTML = '<div class="vide">La logothèque est vide. Utilisez « Importer une image… »'
        + ' pour y déposer un premier fichier.</div>';
    } else {
      corps.innerHTML = '<div class="gril">' + r.logos.map(function(l){
        return '<button class="lg" type="button" data-logo="' + esc(l.id) + '">'
          + '<span class="th"><img src="' + esc(l.vignette) + '" alt=""></span>'
          + '<span class="nm">' + esc(l.nom) + '</span></button>';
      }).join('') + '</div>';
    }
    /* ⚠ UNE LISTE QUI RETRECIT LE DIT. Un logo ecarte l a ete parce qu il teint
       le canevas — donc il ne s imprimerait pas non plus ; le taire ferait
       chercher une image qu on croit avoir deposee. Et un plafond atteint se
       dit aussi, sinon on conclut que le reste a disparu. */
    var etat = r.logos.length + ' image(s)';
    if (r.ecartes) etat += ' · ' + r.ecartes
      + ' écartée(s) : illisibles ici, elles ne sortiraient pas non plus sur le papier';
    if (r.total > r.plafond) etat += ' · ' + r.total + ' au total, les ' + r.plafond + ' plus récentes sont montrées';
    document.getElementById('choix-etat').textContent = etat;
  }
  function choisirLogo(id){
    var l = null;
    if (LOGOS) for (var i = 0; i < LOGOS.logos.length; i++) if (LOGOS.logos[i].id === id) l = LOGOS.logos[i];
    if (!l || !CHOIX) return;
    var f = CHOIX;
    fermerChoix();
    f(l);
  }
  function poserImageElement(l){
    var el = selEl();
    if (!el) return;
    instantane();
    el.src = l.adresse;
    /* ⚠ LE RAPPORT DE L IMAGE EST CONSERVE. Une deformation est le defaut le plus
       visible qui soit sur une etiquette, et elle ne se voit pas sur la poignee :
       la boite, elle, garde la forme qu on lui a donnee. */
    if (l.w > 0 && l.h > 0) {
      var ar = l.h / l.w;
      el.hPct = borner(nb(el.wPct, 40) * ar * (nb(M.w, 1) / nb(M.h, 1)), 3, 200);
    }
    salir();
    dessiner();
    repeindreBientot();
    dire('Image posée — pensez à enregistrer.', 'att');
  }
  function poserImageFond(l){
    instantane();
    M.bg = Object.assign({}, M.bg || {}, { type: 'image', src: l.adresse });
    salir();
    dessiner();
    repeindreBientot();
    dire('Fond changé — pensez à enregistrer.', 'att');
  }

  /* ══ LA SOURIS SUR LE PLAN ════════════════════════════════════════════════
     ⚠ LE DEPLACEMENT SE CALCULE EN POURCENTAGES DE LA SCENE, jamais en pixels
     gardes de cote : la fenetre peut changer de taille pendant un glissement
     (un ecran partage, un redimensionnement), et des pixels memorises feraient
     sauter l element. On relit donc la scene a chaque mouvement. */
  var GLISSE = null;
  plan.addEventListener('pointerdown', function(ev){
    var poi = ev.target.closest('.poi');
    var boite = ev.target.closest('.boite');
    if (!boite) return;
    var id = boite.getAttribute('data-el');
    var el = parId(id);
    if (!el) return;
    if (SEL !== id) { SEL = id; dessiner(); }
    if (el.locked) { dire('Élément verrouillé — déverrouillez-le pour le déplacer.', 'att'); return; }
    var scene = document.getElementById('scene');
    if (!scene) return;
    /* L instantane se pose au DEBUT du glissement : une annulation ramene alors
       la position d avant le geste, pas celle d avant le dernier pixel. */
    instantane();
    GLISSE = { id: id, mode: poi ? 'taille' : 'place', x0: ev.clientX, y0: ev.clientY,
      xPct: nb(el.xPct, 0), yPct: nb(el.yPct, 0), wPct: nb(el.wPct, 10), hPct: nb(el.hPct, 10) };
    try { plan.setPointerCapture(ev.pointerId); } catch (e) {}
    ev.preventDefault();
  });
  plan.addEventListener('pointermove', function(ev){
    if (!GLISSE) return;
    var scene = document.getElementById('scene');
    if (!scene) return;
    var r = scene.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var dx = (ev.clientX - GLISSE.x0) / r.width * 100;
    var dy = (ev.clientY - GLISSE.y0) / r.height * 100;
    var el = parId(GLISSE.id);
    if (!el) return;
    if (GLISSE.mode === 'place') {
      el.xPct = Math.round((GLISSE.xPct + dx) * 10) / 10;
      el.yPct = Math.round((GLISSE.yPct + dy) * 10) / 10;
    } else {
      el.wPct = Math.round(Math.max(1, GLISSE.wPct + dx) * 10) / 10;
      el.hPct = Math.round(Math.max(1, GLISSE.hPct + dy) * 10) / 10;
    }
    salir();
    dessinerPlan();
    dessinerProp();
  });
  function finGlisse(){
    if (!GLISSE) return;
    GLISSE = null;
    dire('Modifié — pensez à enregistrer.', 'att');
    repeindreBientot();
  }
  plan.addEventListener('pointerup', finGlisse);
  plan.addEventListener('pointercancel', finGlisse);

  /* ══ LA BARRE D OUTILS, LA LISTE ET L INSPECTEUR ══════════════════════════ */
  outils.addEventListener('click', function(ev){
    var b = ev.target.closest('[data-ajout]');
    if (b) ajouter(b.getAttribute('data-ajout'));
  });
  lst.addEventListener('click', function(ev){
    var t = ev.target.closest('[data-sel]');
    if (!t) return;
    SEL = t.getAttribute('data-sel') || '';
    dessiner();
  });
  prop.addEventListener('input', function(ev){
    if (!M) return;
    var t = ev.target;
    var el = selEl();
    if (t.hasAttribute('data-num') && el) { instantaneDoux(); el[t.getAttribute('data-num')] = nb(t.value, 0); salir(); dessinerPlan(); repeindreBientot(); return; }
    if (t.hasAttribute('data-txt') && el) { instantaneDoux(); el[t.getAttribute('data-txt')] = t.value; salir(); dessinerListe(); repeindreBientot(); return; }
    if (t.hasAttribute('data-mtxt')) { instantaneDoux(); M[t.getAttribute('data-mtxt')] = t.value; salir(); return; }
    if (t.hasAttribute('data-mnum')) { instantaneDoux(); M[t.getAttribute('data-mnum')] = nb(t.value, 0); salir(); repeindreBientot(); return; }
    if (t.hasAttribute('data-btxt')) { instantaneDoux(); M.bg = Object.assign({}, M.bg || {}); M.bg[t.getAttribute('data-btxt')] = t.value; salir(); repeindreBientot(); return; }
    if (t.hasAttribute('data-bnum')) { instantaneDoux(); M.bg = Object.assign({}, M.bg || {}); M.bg[t.getAttribute('data-bnum')] = nb(t.value, 0); salir(); repeindreBientot(); return; }
    if (t.hasAttribute('data-otxt')) { instantaneDoux(); M.border = Object.assign({}, M.border || {}); M.border[t.getAttribute('data-otxt')] = t.value; salir(); repeindreBientot(); return; }
    if (t.hasAttribute('data-onum')) { instantaneDoux(); M.border = Object.assign({}, M.border || {}); M.border[t.getAttribute('data-onum')] = nb(t.value, 0); salir(); repeindreBientot(); return; }
  });
  prop.addEventListener('change', function(ev){
    var el = selEl();
    var t = ev.target;
    if (el && t.hasAttribute('data-sel-champ')) { instantane(); el[t.getAttribute('data-sel-champ')] = t.value; salir(); repeindreBientot(); return; }
  });
  prop.addEventListener('click', function(ev){
    if (!M) return;
    var el = selEl();
    var b;
    if ((b = ev.target.closest('[data-seg]'))) {
      var nom = b.getAttribute('data-seg'), val = b.getAttribute('data-val');
      instantane();
      if (nom === 'bgtype') { M.bg = Object.assign({}, M.bg || {}, { type: val }); }
      else if (nom === 'bgfit') { M.bg = Object.assign({}, M.bg || {}, { fit: val }); }
      else if (nom === 'elfit' && el) { el.fit = val; }
      salir(); dessiner(); repeindreBientot(); return;
    }
    if ((b = ev.target.closest('[data-choisir]'))) {
      if (b.getAttribute('data-choisir') === 'fond') ouvrirChoix(poserImageFond, 'Choisir une image de fond');
      else ouvrirChoix(poserImageElement, 'Choisir une image');
      return;
    }
    if (ev.target.closest('[data-fond-retirer]')) {
      instantane(); M.bg = Object.assign({}, M.bg || {}, { src: '' });
      salir(); dessiner(); repeindreBientot(); return;
    }
    if (ev.target.closest('[data-img-retirer]') && el) {
      instantane(); el.src = '';
      salir(); dessiner(); repeindreBientot(); return;
    }
    if ((b = ev.target.closest('[data-bascule]')) && el) {
      instantane();
      var cle = b.getAttribute('data-bascule');
      el[cle] = !el[cle];
      salir(); dessiner(); repeindreBientot(); return;
    }
    if ((b = ev.target.closest('[data-ordre]'))) { ordonner(parseInt(b.getAttribute('data-ordre'), 10)); return; }
    if (ev.target.closest('[data-dupliquer]')) { dupliquer(); return; }
    if (ev.target.closest('[data-supprimer]')) { supprimer(); return; }
  });

  /* ══ LE SELECTEUR ════════════════════════════════════════════════════════ */
  document.getElementById('choix-corps').addEventListener('click', function(ev){
    var b = ev.target.closest('[data-logo]');
    if (b) choisirLogo(b.getAttribute('data-logo'));
  });
  document.getElementById('b-fermer-choix').addEventListener('click', fermerChoix);
  document.getElementById('b-relire').addEventListener('click', function(){ LOGOS = null; lireLogos(); });
  /* ⚠ L IMPORT N EST PAS ICI : il a sa fenetre, avec son assistant de recadrage.
     Deux portes d import auraient donne deux recadrages pour le meme fichier.
     ⚠ ET SI LA FENETRE NE S OUVRE PAS, ON LE DIT : un bouton muet se lit comme
     une fonction cassee, pas comme une fonction absente. */
  document.getElementById('b-importer').addEventListener('click', function(){
    var p;
    try { p = P.ouvrirModule('config-logotheque'); }
    catch (e) { p = null; }
    Promise.resolve(p).then(function(ok){
      if (ok === false) { dire('La fenêtre Logothèque n’a pas pu s’ouvrir.', 'err'); return; }
      document.getElementById('choix-etat').textContent =
        'Déposez l’image dans la fenêtre Logothèque, puis revenez ici et touchez « ↻ Actualiser ».';
    });
  });

  document.getElementById('b-enr').addEventListener('click', enregistrer);
  document.getElementById('b-annuler').addEventListener('click', annuler);
  document.getElementById('b-refaire').addEventListener('click', refaire);
  document.getElementById('b-recharger').addEventListener('click', function(){
    /* ⚠ RECHARGER JETTE CE QUI N EST PAS ENREGISTRE : on le demande avant, une
       seule fois. Un bouton qui efface sans prevenir est une porte piegee. */
    if (SALE && !window.confirm('Des modifications ne sont pas enregistrées. Les abandonner ?')) return;
    LOGOS = null;
    charger();
  });

  /* ⚠ LA SCENE SE REFAIT AU REDIMENSIONNEMENT : ses pixels dependent de la
     fenetre, et une scene figee laisserait les poignees a cote de l image. */
  window.addEventListener('resize', function(){ if (M) dessinerPlan(); });

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (!voile.hidden) { fermerChoix(); return; }
      if (SALE) { dire('Modifications non enregistrées — Enregistrer, ou Recharger pour abandonner.', 'att'); return; }
      P.fermer();
    }
    var cmd = ev.ctrlKey || ev.metaKey;
    if (cmd && (ev.key === 's' || ev.key === 'S')) { ev.preventDefault(); enregistrer(); return; }
    if (cmd && (ev.key === 'z' || ev.key === 'Z')) { ev.preventDefault(); if (ev.shiftKey) refaire(); else annuler(); return; }
    if (cmd && (ev.key === 'y' || ev.key === 'Y')) { ev.preventDefault(); refaire(); return; }
    /* ⚠ LA TOUCHE SUPPRIMER NE S APPLIQUE PAS DANS UN CHAMP : sans ce garde, on
       effacerait l element pendant qu on corrige son texte. Et elle refuse un
       element verrouille — c est exactement ce que le verrou promet. */
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      var a = document.activeElement, n = a ? (a.tagName || '').toLowerCase() : '';
      if (n === 'input' || n === 'textarea' || n === 'select') return;
      if (!voile.hidden) return;
      var el = selEl();
      if (!el) return;
      ev.preventDefault();
      if (el.locked) { dire('Élément verrouillé — déverrouillez-le pour le retirer.', 'att'); return; }
      supprimer();
    }
  });

  /* ⚠ LA FERMETURE PAR LA CROIX NE PASSE PAS PAR Escape. Sans ce garde, tout le
     travail non enregistre part sans un mot. */
  window.addEventListener('beforeunload', function(ev){
    if (!SALE) return;
    ev.preventDefault();
    ev.returnValue = '';
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pagePromoEditeur };
