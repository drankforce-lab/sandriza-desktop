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
 *   · l'IMAGE peinte par la fenêtre principale, à la demande.
 * Elle pose ses poignées PAR-DESSUS l'image, en calculant sur des nombres, et
 * renvoie le modèle modifié. L'impression et l'aperçu ne bougent pas d'un pouce.
 *
 * ⚠ POURQUOI LES POIGNÉES SONT DES BOÎTES HTML ET NON UN CANEVAS. Un canevas
 * pour dessiner huit rectangles ramènerait exactement le problème qu'on vient
 * d'éviter, et coûterait sa propre gestion du clic. Des div positionnées en
 * pourcentage se placent toutes seules quand la fenêtre change de taille — ce
 * que le plan de travail web devait recalculer à la main.
 *
 * ⚠⚠ CE QUE LA DEUXIÈME TRANCHE A APPRIS, ET QU'IL NE FAUT PAS REPERDRE.
 * Ajouter un élément, changer le fond, poser une image : ces gestes ne DÉPLACENT
 * aucune poignée. Dans une fenêtre qui ne peint pas, ils ne produisaient donc
 * strictement AUCUN retour à l'écran. Un éditeur dont le geste le plus courant
 * ne montre rien n'est pas un éditeur, c'est un formulaire. ➡ promo:modeleApercu
 * fait peindre le modèle EN COURS par le site, sans rien enregistrer.
 *
 * ⚠ TROISIÈME TRANCHE — L'INSPECTEUR COMPLET, ET LES DEUX PORTES À PART.
 * Tout ce que l'écran web savait régler se règle ici : la police et la COURBURE
 * d'un texte (sans elle un autocollant rond ne se compose pas), le recadrage et
 * la retouche d'une image, le code-barres, les formes, les aides du plan de
 * travail. Deux choses ne passent PAS par l'écriture ordinaire :
 *   · les REPÈRES (grille, zone sûre) — ce n'est pas un réglage du modèle mais
 *     une consigne de REGARD ; ils ne s'enregistrent pas et ne s'impriment pas ;
 *   · le FORMAT (w, h) — `promo:modeleEcrire` le refuse à dessein, pour qu'une
 *     fenêtre un peu ancienne ne réécrive pas des dimensions lues avant un
 *     changement. Il a sa porte : promo:redimensionner.
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
 * interface en français du Québec.
 * ⚠⚠ ET LES APOSTROPHES S'ÉCRIVENT ’, PAS '. Ce n'est pas une coquetterie de
 * typographe, c'est ce qui rend le fichier sûr : une apostrophe droite dans une
 * chaîne à guillemets simples devrait être échappée, mais le GABARIT mange la
 * contre-oblique au passage — l'apostrophe sortirait NUE dans le script engendré
 * et y fermerait la chaîne. L'apostrophe typographique ne demande aucun
 * échappement, et c'est déjà la convention du reste des fenêtres.
 * ⚠ Le piège d'en face, celui où je suis tombé en écrivant la 2ᵉ tranche : les
 * RETIRER pour contourner le problème. « n a pas », « s annule », « l image » —
 * ce n'est plus un problème d'échappement, c'est du français fautif à l'écran.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('promo-editeur');

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
  outline:1px solid var(--v12);background:#fff;flex:0 0 auto}
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
.poi.nw{left:-6px;top:-6px;cursor:nwse-resize}
.poi.ne{right:-6px;top:-6px;cursor:nesw-resize}
.poi.sw{left:-6px;bottom:-6px;cursor:nesw-resize}
.poi.se{right:-6px;bottom:-6px;cursor:nwse-resize}
/* La poignee de rotation se tient EN DEHORS de la boite, au-dessus : dans un
   coin elle se confondrait avec celle qui redimensionne. */
.poi.rot{left:50%;top:-25px;margin-left:-6px;border-radius:50%;cursor:grab}
.etiq{position:absolute;left:0;top:-19px;font-size:.62rem;white-space:nowrap;
  background:#7AA7FF;color:#0b1220;padding:0 .3rem;border-radius:3px;font-weight:700}

/* ── L INSPECTEUR ─────────────────────────────────────────────────────────── */
.insp{flex:0 0 340px;border-left:1px solid var(--v08);display:flex;flex-direction:column;
  background:var(--f-carte);min-height:0}
/* ⚠ LA BARRE D AJOUT EST EN HAUT DE L INSPECTEUR, PAS DANS LE PLAN. Le plan est
   une surface de manipulation directe : y poser des boutons ferait cliquer
   dessus en visant un element. */
.outils,.aides{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:.3rem;padding:.5rem .6rem;
  border-bottom:1px solid var(--v08)}
.aides{padding-top:.35rem;padding-bottom:.35rem;align-items:center}
.outils .btn,.aides .btn{font-size:.75rem;padding:.26rem .48rem}
/* Un reglage ACTIF doit se voir sans lire : une case a cocher en mots se relit
   a chaque fois, une pastille allumee se reconnait. */
.btn.on{background:#7AA7FF;border-color:#7AA7FF;color:#0b1220;font-weight:650}
.insp .lst{flex:0 0 auto;max-height:26%;overflow-y:auto;border-bottom:1px solid var(--v08)}
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
.el .mal{color:var(--tx-err2)}
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
.acts .btn{font-size:.76rem;padding:.26rem .5rem}
.seg{display:inline-flex;border:1px solid var(--v12);border-radius:7px;overflow:hidden}
.seg button{padding:.26rem .55rem;background:transparent;color:var(--tx2);border:0;
  font:inherit;font-size:.76rem;cursor:pointer}
.seg button.on{background:#7AA7FF;color:#0b1220;font-weight:650}
.seg button:hover:not(.on){background:var(--v08);color:var(--tx)}
/* Les teintes n ont AUCUN texte : rien a mesurer au contraste, et un liset
   suffit a distinguer un blanc d un fond clair. */
.teintes{display:flex;flex-wrap:wrap;gap:.25rem;margin-top:.3rem}
.teintes button{width:19px;height:19px;border-radius:5px;border:1px solid var(--v50);
  padding:0;cursor:pointer}
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
/* Un avertissement se lit EN PLEIN, jamais en estompe : c est la phrase qui
   explique pourquoi le lecteur de la caisse ne bipera pas. */
.avert{font-size:.73rem;color:var(--tx-err2);line-height:1.35;margin-top:.25rem}
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
html.jour .btn.on{background:#2f5fb5;border-color:#2f5fb5;color:#ffffff}
html.jour .lg:hover{border-color:#2f5fb5}
/* Le voile reste sombre de jour — c est SA fonction : eteindre la page derriere.
   Mais il est DECLARE, et non herite d un oubli. */
html.jour .voile{background:rgba(18,24,33,.5)}
`;

function pagePromoEditeur(id) {
  const cible = String(id || '');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>${T("Éditeur visuel — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.promoprint}</span><h1 id="titre">${T("Éditeur visuel")}</h1>
  <span class="sous" id="sous"></span>
  <span class="fin">
  <button class="btn" id="b-annuler" type="button" title="${T("Annuler (Ctrl+Z)")}" disabled>${T("↶ Annuler")}</button>
  <button class="btn" id="b-refaire" type="button" title="${T("Refaire (Ctrl+Y)")}" disabled>${T("↷ Refaire")}</button>
  <button class="btn" id="b-recharger" type="button">${T("↻ Recharger")}</button>
  <button class="btn plein" id="b-enr" type="button" disabled>${T("Enregistrer")}</button></span></div>
<div class="zone" id="corps">
  <div class="plan" id="plan"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
  <div class="insp">
    <div class="outils" id="outils"></div>
    <div class="aides" id="aides"></div>
    <div class="lst" id="lst"></div>
    <div class="prop" id="prop"></div>
  </div>
</div>
<div class="pied"><span class="msg" id="msg"></span></div>
<div class="voile" id="voile" hidden>
  <div class="cadre">
    <div class="ct"><span id="choix-titre">${T("Choisir une image")}</span></div>
    <div class="cc" id="choix-corps"></div>
    <div class="cp"><span id="choix-etat"></span><span class="fin">
      <button class="btn" id="b-importer" type="button">${T("Importer une image…")}</button>
      <button class="btn" id="b-relire" type="button">${T("↻ Actualiser")}</button>
      <button class="btn" id="b-fermer-choix" type="button">${T("Fermer")}</button>
    </span></div>
  </div>
</div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var ID = '${cible}';
  var M = null;          // le modele, tel qu il voyage
  var SEL = '';          // id de l element choisi ; vide = le MODELE lui-meme
  var SALE = false;      // des modifications non enregistrees
  var IMG = '';          // l apercu peint par la fenetre principale
  var LOGOS = null;      // la logotheque, telle que le site nous l a rendue
  var CHOIX = null;      // ce qu on fait du logo choisi (une fonction)
  var POLICES = [];      // les polices que le PEINTRE sait rendre
  var TEINTES = [];      // la palette proposee, la meme que l ecran web
  var CODES = {};        // id d un code-barres -> se lit-il au lecteur ?
  var PRESSE = null;     // le presse-papiers d elements (Ctrl+C / Ctrl+V)

  /* ⚠ LES REPERES NE SONT PAS UN REGLAGE DU MODELE. Grille et zone sure sont
     une consigne de REGARD : elles ne s enregistrent jamais et ne sortent pas
     sur le papier. Elles vivent donc ICI, et voyagent a chaque repeinture. */
  var REPERES = { grille: false, zoneSure: true };
  var AIMANT = true;     // l aimantation aux bords et au centre
  var ZOOM = 1;          // 1 = ajuste a la fenetre

  var plan = document.getElementById('plan');
  var lst = document.getElementById('lst');
  var prop = document.getElementById('prop');
  var outils = document.getElementById('outils');
  var aides = document.getElementById('aides');
  var bEnr = document.getElementById('b-enr');
  var bAnn = document.getElementById('b-annuler');
  var bRef = document.getElementById('b-refaire');
  var voile = document.getElementById('voile');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:      '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:        '${T("Votre compte n’a pas le droit de modifier les objets promotionnels.")}',
    module_promo: '${T("Le module d’impression n’est pas chargé dans la fenêtre principale.")}',
    introuvable:  '${T("Ce modèle n’existe plus — il a peut-être été supprimé ailleurs.")}',
    parametre:    '${T("Demande incomplète.")}',
    genre_inconnu:'${T("Ce type d’élément n’existe pas.")}',
    dimensions:   '${T("Dimensions refusées : il faut entre 0,2 et 40 pouces.")}',
    trop_long:    '${T("Le modèle dépasse la taille permise (8 Mo d’éléments).")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    echec:        '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
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
  function annuler(){ if (reprendre(HIST, REFAIRE)) dire('${T("Annulé.")}', 'bon'); }
  function refaire(){ if (reprendre(REFAIRE, HIST)) dire('${T("Rétabli.")}', 'bon'); }

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
    appeler('promo:modeleApercu', [ID, M, Math.round(560 * Math.min(2, ZOOM)), REPERES]).then(function(r){
      if (mien !== JETON) return;          // une demande plus recente a pris la main
      if (!r.ok) { dire('${T("Aperçu non repeint :")} ' + expliquer(r), 'att'); return; }
      IMG = r.image || '';
      /* ⚠ LA LISIBILITE DES CODES-BARRES ARRIVE AVEC L IMAGE. Un code non
         encodable se DESSINE quand meme — il ne se lit simplement jamais au
         lecteur, et le defaut se decouvre a la caisse, sur une etiquette deja
         collee. Il faut donc le dire ici, pendant qu on peut encore corriger. */
      var avant = CODES;
      CODES = {};
      (r.codes || []).forEach(function(c){ CODES[c.id] = !!c.lisible; });
      dessinerPlan();
      dessinerListe();
      var el = selEl();
      if (el && el.kind === 'barcode' && avant[el.id] !== CODES[el.id]) dessinerProp();
      if (!r.rendable) dire('${T("L’aperçu n’a pas pu être peint")}' + (r.detail ? ' : ' + r.detail : '')
        + '${T(". Les poignées restent utilisables.")}', 'att');
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
    L = Math.max(80, Math.round(L * ZOOM)); H = Math.max(60, Math.round(H * ZOOM));
    var h = '<div class="scene" id="scene" style="width:' + L + 'px;height:' + H + 'px">';
    if (IMG) h += '<img src="' + esc(IMG) + '" alt="Aperçu du modèle">';
    els().forEach(function(el){
      var cl = 'boite' + (el.id === SEL ? ' sel' : '') + (el.hidden ? ' cache' : '') + (el.locked ? ' verr' : '');
      var rot = nb(el.rot, 0);
      h += '<div class="' + cl + '" data-el="' + esc(el.id) + '" style="left:' + nb(el.xPct, 0) + '%;top:'
        + nb(el.yPct, 0) + '%;width:' + nb(el.wPct, 10) + '%;height:' + nb(el.hPct, 10) + '%'
        + (rot ? ';transform:rotate(' + rot + 'deg)' : '') + '">';
      if (el.id === SEL) {
        h += '<span class="etiq">' + esc(el.name || el.kind || '${T("Élément")}') + '</span>';
        if (!el.locked) {
          h += '<span class="poi nw" data-poi="nw"></span><span class="poi ne" data-poi="ne"></span>'
            + '<span class="poi sw" data-poi="sw"></span><span class="poi se" data-poi="se"></span>'
            + '<span class="poi rot" data-poi="rot" title="Faire pivoter"></span>';
        }
      }
      h += '</div>';
    });
    h += '</div>';
    plan.innerHTML = h;
  }

  var GENRES = [['text', '${T("Texte")}'], ['image', '${T("Image")}'], ['shape', '${T("Forme")}'],
                ['line', '${T("Ligne")}'], ['barcode', '${T("Code-barres")}']];
  function dessinerOutils(){
    var h = '';
    GENRES.forEach(function(g){
      h += '<button class="btn" type="button" data-ajout="' + g[0] + '"' + (M ? '' : ' disabled')
        + '>＋ ' + esc(g[1]) + '</button>';
    });
    outils.innerHTML = h;
  }

  /* ⚠ LES AIDES SE DISTINGUENT DES REGLAGES, ET LA BARRE LE DIT : rien de ce
     qui est ici ne part a l impression. La zone sure est allumee par defaut
     parce qu une decoupe n est jamais parfaitement centree — c est le repere
     qu on oublie de demander et qu on regrette apres la commande. */
  function dessinerAides(){
    if (!M) { aides.innerHTML = ''; return; }
    aides.innerHTML = ''
      + '<button class="btn' + (REPERES.zoneSure ? ' on' : '') + '" type="button" data-repere="zoneSure"'
      + ' title="La marge à ne pas dépasser — jamais imprimée">${T("Zone sûre")}</button>'
      + '<button class="btn' + (REPERES.grille ? ' on' : '') + '" type="button" data-repere="grille"'
      + ' title="Une grille de repère — jamais imprimée">Grille</button>'
      + '<button class="btn' + (AIMANT ? ' on' : '') + '" type="button" data-aimant="1"'
      + ' title="Coller aux bords et au centre pendant le déplacement">Aimant</button>'
      + '<span style="flex:1 1 auto"></span>'
      + '<button class="btn" type="button" data-zoom="-1" title="Réduire">−</button>'
      + '<button class="btn" type="button" data-zoom="0" title="Ajuster à la fenêtre">' + Math.round(ZOOM * 100) + ' %</button>'
      + '<button class="btn" type="button" data-zoom="1" title="Agrandir">+</button>';
  }

  function dessinerListe(){
    var l = els();
    /* La premiere ligne n est pas un element : c est le MODELE. Sans elle, il n y
       a aucun moyen de revenir au fond une fois qu on a choisi un element. */
    var h = '<div class="el' + (SEL ? '' : ' sel') + '" data-sel="">'
      + '<span class="k">${T("Mod")}</span><span class="n">${T("Le modèle (fond, format)")}</span></div>';
    if (!l.length) h += '<div class="vide">${T("Ce modèle ne porte aucun élément. Ajoutez-en un ci-dessus.")}</div>';
    /* Le haut de la pile en premier : c est l ordre ou on le voit a l ecran. */
    l.slice().reverse().forEach(function(el){
      h += '<div class="el' + (el.id === SEL ? ' sel' : '') + '" data-sel="' + esc(el.id) + '">'
        + '<span class="k">' + esc(el.kind === 'text' ? '${T("Txt")}' : (el.kind === 'image' ? '${T("Img")}'
            : (el.kind === 'barcode' ? '${T("Cod")}' : (el.kind === 'line' ? '${T("Lig")}' : '${T("Frm")}')))) + '</span>'
        + '<span class="n">' + esc(el.name || el.text || '${T("Sans nom")}') + '</span>'
        + (el.kind === 'barcode' && CODES[el.id] === false
            ? '<span class="mal" title="Ce code ne se lira pas au lecteur">✗</span>' : '')
        + (el.hidden ? '<span class="oeil" title="${T("Masqué")}">◌</span>' : '')
        + (el.locked ? '<span class="oeil" title="Verrouillé">⌧</span>' : '')
        + '</div>';
    });
    lst.innerHTML = h;
  }

  /* ══ LES BRIQUES DE L INSPECTEUR ═════════════════════════════════════════
     ⚠ LE PREFIXE DIT A QUOI LE CHAMP SE RATTACHE — num/txt a l ELEMENT, mnum au
     MODELE, bnum/btxt au FOND, onum/otxt au LISERE. Une seule branche par
     prefixe dans les ecouteurs, et rien a enumerer quand un champ s ajoute. */
  function champNum(cle, lbl, el, pas, prefixe){
    return '<div><label class="p">' + esc(lbl) + '</label>'
      + '<input type="number" data-' + (prefixe || 'num') + '="' + cle + '" step="' + (pas || 1) + '" value="'
      + (Math.round(nb(el[cle], 0) * 1000) / 1000) + '"></div>';
  }
  /* ⚠⚠ LE MODELE GARDE DES POURCENTAGES, MAIS ON COMPOSE EN POUCES. Un
     pourcentage ne dit rien a qui place un logo sur une etiquette 2 x 1 : la
     question est << a un quart de pouce du bord >>, pas << a 12,5 % >>. L ecran
     web affichait donc des pouces, et la fenetre fait pareil — la conversion se
     fait ICI, a l affichage et a la saisie, et ce qui voyage reste en
     pourcentages. Changer le format ne deplace donc toujours rien. */
  function champPouce(cle, lbl, el, axe, min, max){
    var base = nb(M && M[axe], 1) || 1;
    var v = nb(el[cle], 0) / 100 * base;
    return '<div><label class="p">' + esc(lbl) + '</label>'
      + '<input type="number" data-pouce="' + cle + ':' + axe + ':' + min + ':' + max + '"'
      + ' step="0.01" value="' + (Math.round(v * 1000) / 1000) + '"></div>';
  }
  function segment(nom, options, courant){
    return '<div class="seg">' + options.map(function(o){
      return '<button type="button" data-seg="' + nom + '" data-val="' + o[0] + '"'
        + (courant === o[0] ? ' class="on"' : '') + '>' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }
  function bascule(cible, libelle, actif, titre){
    return '<button class="btn' + (actif ? ' on' : '') + '" type="button" data-bascule="' + cible + '"'
      + (titre ? ' title="' + esc(titre) + '"' : '') + '>' + esc(libelle) + '</button>';
  }
  /* ⚠ UNE COULEUR SE TAPE *ET* SE CHOISIT. Le champ texte accepte toute notation
     CSS — c est lui qui permet de recopier une couleur de marque exacte. Les
     pastilles ne sont qu un raccourci vers la palette du site ; sans le champ,
     on ne pourrait jamais sortir de ces douze teintes. */
  function couleur(cle, lbl, val, prefixe, aide){
    var p = prefixe || 'txt';
    return '<div class="bloc"><label>' + esc(lbl) + '</label>'
      + '<input type="text" data-' + p + '="' + cle + '" value="' + esc(val || '') + '">'
      + '<div class="teintes">' + TEINTES.map(function(t){
          return '<button type="button" data-teinte="' + p + ':' + cle + '" data-val="' + esc(t) + '"'
            + ' style="background:' + esc(t) + '" title="' + esc(t) + '"></button>'; }).join('') + '</div>'
      + (aide ? '<div class="note">' + esc(aide) + '</div>' : '') + '</div>';
  }

  /* ══ L INSPECTEUR DU MODELE (aucun element choisi) ═══════════════════════ */
  function dessinerPropModele(){
    var b = M.bg || {}, bo = M.border || {};
    var type = b.type || 'solid';
    var h = '';
    h += '<div class="bloc"><label>${T("Nom du modèle")}</label>'
      + '<input type="text" data-mtxt="name" value="' + esc(M.name || '') + '"></div>';
    h += '<div class="bloc"><label>Fond</label>'
      + segment('bg:type', [['solid', '${T("Uni")}'], ['gradient', '${T("Dégradé")}'], ['image', '${T("Image")}']], type) + '</div>';
    if (type === 'gradient') {
      h += couleur('from', '${T("Départ du dégradé")}', b.from || '#ffffff', 'btxt');
      h += couleur('to', '${T("Arrivée du dégradé")}', b.to || '#efe6d8', 'btxt');
      h += '<div class="bloc"><div class="rang">' + champNum('angle', '${T("Angle (degrés)")}', b, 5, 'bnum') + '</div></div>';
    } else if (type === 'image') {
      h += '<div class="bloc"><label>${T("Image de fond")}</label>'
        + (b.src ? '<div class="vign"><img src="' + esc(b.src) + '" alt="${T("Image de fond")}"></div>'
                 : '<div class="vign"><span class="p">${T("Aucune image")}</span></div>')
        + '<div class="acts"><button class="btn" type="button" data-choisir="fond">${T("Choisir une image…")}</button>'
        + (b.src ? '<button class="btn danger" type="button" data-fond-retirer="1">${T("Retirer")}</button>' : '')
        + '</div>'
        + '<div class="note">${T("Les images viennent de la logothèque. Pour en déposer une nouvelle,")}'
        + ' ${T("le sélecteur ouvre la fenêtre Logothèque.")}</div></div>';
      h += '<div class="bloc"><label>Ajustement</label>'
        + segment('bg:fit', [['cover', '${T("Remplir")}'], ['contain', '${T("Contenir")}']], b.fit || 'cover') + '</div>';
    } else {
      h += couleur('color', '${T("Couleur du fond")}', b.color || '#ffffff', 'btxt', '${T("Notation CSS : #ffffff, rgb(…), ou un nom.")}');
    }
    h += '<div class="bloc"><label>${T("Liseré imprimé")}</label><div class="rang">'
      + champNum('w', '${T("Épaisseur (po)")}', bo, .002, 'onum')
      + champNum('inset', '${T("Retrait (po)")}', bo, .005, 'onum') + '</div>'
      + '<div class="note">${T("Une épaisseur de 0 ne dessine aucun liseré.")}</div></div>';
    if (nb(bo.w, 0) > 0) h += couleur('color', '${T("Couleur du liseré")}', bo.color || '#C49A6C', 'otxt');
    h += '<div class="bloc"><label>${T("Repères (aperçu seulement)")}</label><div class="rang">'
      + champNum('safe', '${T("Marge sûre (po)")}', M, .01, 'mnum')
      + (M.shape === 'circle' ? '' : champNum('corner', '${T("Coins (po)")}', M, .01, 'mnum'))
      + '</div><div class="note">${T("La marge sûre ne sort pas sur le papier : elle rappelle que les découpes")}'
      + ' ${T("ne sont jamais parfaitement centrées. Affichez-la avec « Zone sûre », en haut.")}</div></div>';
    /* ⚠ LE FORMAT A SA PROPRE PORTE, et la note dit pourquoi on peut oser :
       toute la geometrie est en POURCENTAGES, donc rien ne se deforme. Sans
       cette phrase, personne ne touche a ce champ. */
    h += '<div class="bloc"><label>${T("Format du support")}</label><div class="rang">'
      + (M.shape === 'circle'
          ? '<div><label class="p">${T("Diamètre (po)")}</label><input type="number" id="rd-w" step="0.05" min="0.4" value="' + nb(M.w, 0) + '"></div>'
          : '<div><label class="p">${T("Largeur (po)")}</label><input type="number" id="rd-w" step="0.05" min="0.4" value="' + nb(M.w, 0) + '"></div>'
            + '<div><label class="p">${T("Hauteur (po)")}</label><input type="number" id="rd-h" step="0.05" min="0.4" value="' + nb(M.h, 0) + '"></div>')
      + '</div><div class="acts" style="margin-top:.35rem">'
      + '<button class="btn" type="button" data-redim="1">${T("Appliquer le format")}</button></div>'
      + '<div class="note">${T("Les éléments sont placés en pourcentage : ils suivent le nouveau format sans se")}'
      + ' ${T("déformer. Attention : ce changement s’enregistre tout de suite, et il ne s’annule pas")}'
      + ' ${T("par Ctrl+Z — il ne passe pas par le même chemin que le reste.")}</div></div>';
    h += '<div class="note">${T("Forme :")} ' + (M.shape === 'circle' ? 'ronde' : 'rectangulaire')
      + '${T(". Elle se choisit à la création du modèle, dans le Centre d’impression.")}</div>';
    prop.innerHTML = h;
  }

  /* ══ L INSPECTEUR D UN ELEMENT ══════════════════════════════════════════ */
  function propTexte(el){
    var h = '';
    h += '<div class="bloc"><label>${T("Texte")}</label><textarea data-txt="text">' + esc(el.text || '') + '</textarea></div>';
    h += '<div class="bloc"><label>Police</label><select data-sel-champ="font">'
      + POLICES.map(function(f){
          return '<option value="' + esc(f) + '"' + (el.font === f ? ' selected' : '') + '>' + esc(f) + '</option>'; }).join('')
      + '</select></div>';
    h += '<div class="bloc"><label>Style</label><div class="acts">'
      + '<button class="btn' + (nb(el.weight, 600) >= 700 ? ' on' : '') + '" type="button" data-graisse="1"'
      + ' title="${T("Gras")}"><strong>G</strong></button>'
      + bascule('el:italic', 'I', !!el.italic, '${T("Italique")}')
      + bascule('el:underline', 'S', !!el.underline, '${T("Souligné")}')
      + '</div></div>';
    h += '<div class="bloc"><label>${T("Taille (% de la hauteur)")}</label><div class="rang">'
      + champNum('fontPct', '${T("Corps")}', el, .5)
      + champNum('ls', '${T("Interlettre")}', el, .01)
      + champNum('lh', '${T("Interligne")}', el, .05) + '</div></div>';
    h += couleur('color', '${T("Couleur")}', el.color, 'txt', '${T("Notation CSS : #111827, rgb(…), ou un nom.")}');
    h += '<div class="bloc"><label>Alignement</label>'
      + segment('el:align', [['left', '${T("Gauche")}'], ['center', '${T("Centre")}'], ['right', '${T("Droite")}']], el.align || 'left')
      + '<div style="margin-top:.3rem">'
      + segment('el:valign', [['top', '${T("Haut")}'], ['middle', '${T("Milieu")}'], ['bottom', '${T("Bas")}']], el.valign || 'middle')
      + '</div></div>';
    h += '<div class="bloc"><label>Casse</label>'
      + segment('el:caps', [['none', 'Aa'], ['upper', 'AA'], ['lower', 'aa'], ['title', 'Aa Aa']], el.caps || 'none')
      + '</div>';
    /* ⚠ LA COURBURE N EST PAS UN ORNEMENT : sans elle, un autocollant ROND ne se
       compose pas — le texte doit suivre l arc. C est la seule commande de cet
       inspecteur dont l absence rendait un format entier inutilisable. */
    h += '<div class="bloc"><label>${T("Courbure du texte")}</label><div class="rang">'
      + champNum('curve', '${T("Arc (degrés)")}', el, 5) + '</div>'
      + '<div class="note">${T("0 = droit. Indispensable sur un autocollant rond : le texte suit l’arc.")}</div></div>';
    h += '<div class="bloc"><label>${T("Contour et ombre")}</label><div class="rang">'
      + champNum('strokeW', '${T("Contour")}', el, .5) + champNum('shadow', '${T("Ombre")}', el, 1) + '</div></div>';
    if (nb(el.strokeW, 0) > 0) h += couleur('strokeColor', '${T("Couleur du contour")}', el.strokeColor, 'txt');
    return h;
  }
  function propImage(el){
    var h = '';
    h += '<div class="bloc"><label>${T("Image")}</label>'
      + (el.src ? '<div class="vign"><img src="' + esc(el.src) + '" alt="${T("Image")} de cet élément"></div>'
                : '<div class="vign"><span class="p">${T("Aucune image")}</span></div>')
      + '<div class="acts"><button class="btn" type="button" data-choisir="element">${T("Choisir une image…")}</button>'
      + (el.src ? '<button class="btn danger" type="button" data-img-retirer="1">${T("Retirer")}</button>' : '')
      + '</div></div>';
    h += '<div class="bloc"><label>Ajustement</label>'
      + segment('el:fit', [['contain', '${T("Contenir")}'], ['cover', '${T("Remplir")}']], el.fit || 'contain') + '</div>';
    h += '<div class="bloc"><label>Recadrage</label><div class="rang">'
      + champNum('zoom', '${T("Zoom")}', el, .05) + champNum('ox', '${T("Décalage X")}', el, .05)
      + champNum('oy', '${T("Décalage Y")}', el, .05) + '</div>'
      + '<div class="note">${T("Zoom 1 = image entière. Le décalage va de −1 à 1.")}</div></div>';
    h += '<div class="bloc"><label>Orientation</label><div class="acts">'
      + bascule('el:flipH', '${T("⇄ Miroir")}', !!el.flipH)
      + bascule('el:flipV', '${T("⇅ Retourner")}', !!el.flipV)
      + '<button class="btn" type="button" data-rot90="1" title="Pivoter d’un quart de tour">↻ 90°</button>'
      + '</div></div>';
    h += '<div class="bloc"><label>Masque</label>'
      + segment('el:mask', [['none', '${T("Aucun")}'], ['circle', '${T("Cercle")}']], el.mask || 'none')
      + (el.mask === 'circle' ? '' : '<div class="rang" style="margin-top:.3rem">'
          + champNum('corner', '${T("Coins arrondis (%)")}', el, 1) + '</div>')
      + '</div>';
    h += '<div class="bloc"><label>Retouche</label><div class="rang">'
      + champNum('bright', '${T("Luminosité")}', el, 1) + champNum('contrast', '${T("Contraste")}', el, 1) + '</div>'
      + '<div class="rang" style="margin-top:.3rem">'
      + champNum('sat', '${T("Saturation")}', el, 1) + champNum('gray', '${T("Noir et blanc")}', el, 1)
      + champNum('blur', '${T("Flou")}', el, 1) + '</div>'
      + '<div class="acts" style="margin-top:.35rem">'
      + '<button class="btn" type="button" data-retouche="1">${T("Réinitialiser la retouche")}</button></div>'
      + '<div class="note">${T("En pourcentage : 100 = inchangé. Le flou et le noir et blanc partent de 0.")}</div></div>';
    return h;
  }
  function propCodeBarres(el){
    var h = '';
    h += '<div class="bloc"><label>Contenu</label><input type="text" data-txt="text" value="' + esc(el.text || '') + '">'
      + (CODES[el.id] === false
          ? '<div class="avert">${T("Attention : ce contenu ne s’encode pas en Code 128. Le code se dessinera,")}'
            + ' ${T("mais aucun lecteur ne le lira. Lettres, chiffres et ponctuation ASCII seulement.")}</div>'
          : '<div class="note">${T("Code 128 — lettres, chiffres et ponctuation ASCII.")}</div>')
      + '</div>';
    h += couleur('color', '${T("Couleur")}', el.color || '#000000', 'txt');
    h += '<div class="bloc"><label>${T("Texte sous le code")}</label><div class="acts">'
      + bascule('el:showText', el.showText ? '${T("Affiché")}' : '${T("Masqué")}', !!el.showText)
      + '</div><div class="note">${T("Plus le code est large, plus il est lisible : prévoyez au moins 1,5 po.")}</div></div>';
    return h;
  }
  function propForme(el){
    var h = '';
    if (el.kind === 'line') {
      h += '<div class="bloc"><label>${T("Épaisseur du trait")}</label><div class="rang">'
        + champNum('thick', '${T("Épaisseur")}', el, 1) + '</div></div>';
    } else {
      h += '<div class="bloc"><label>${T("Forme")}</label>'
        + segment('el:shape', [['rect', '${T("Rectangle")}'], ['ellipse', '${T("Ellipse")}'], ['triangle', '${T("Triangle")}'], ['star', '${T("Étoile")}']],
            el.shape || 'rect') + '</div>';
    }
    h += couleur('fill', '${T("Remplissage")}', el.fill || '#C49A6C', 'txt');
    if (el.kind !== 'line') {
      if ((el.shape || 'rect') === 'rect') {
        h += '<div class="bloc"><label>${T("Coins arrondis (%)")}</label><div class="rang">'
          + champNum('corner', '${T("Coins")}', el, 1) + '</div></div>';
      }
      h += '<div class="bloc"><label>${T("Contour")}</label><div class="rang">'
        + champNum('strokeW', '${T("Épaisseur")}', el, .5) + '</div></div>';
      if (nb(el.strokeW, 0) > 0) h += couleur('strokeColor', '${T("Couleur du contour")}', el.strokeColor, 'txt');
    }
    return h;
  }

  function dessinerPropElement(el){
    var h = '';
    h += '<div class="bloc"><label>Nom</label><input type="text" data-txt="name" value="' + esc(el.name || '') + '"></div>';
    if (el.kind === 'text') h += propTexte(el);
    else if (el.kind === 'image') h += propImage(el);
    else if (el.kind === 'barcode') h += propCodeBarres(el);
    else h += propForme(el);

    h += '<div class="bloc"><label>${T("Position et taille (pouces)")}</label><div class="rang">'
      + champPouce('xPct', 'X', el, 'w', -50, 150) + champPouce('yPct', 'Y', el, 'h', -50, 150) + '</div>'
      + '<div class="rang" style="margin-top:.3rem">'
      + champPouce('wPct', '${T("Largeur")}', el, 'w', 1, 200) + champPouce('hPct', '${T("Hauteur")}', el, 'h', 1, 200) + '</div>'
      + '<div class="note">${T("Mesuré sur le support (")}' + esc(nb(M.w, 0) + ' × ' + nb(M.h, 0)) + ' po).'
      + ' ${T("Les flèches du clavier déplacent de 0,5 % — 5 % avec Majuscule.")}</div></div>';
    h += '<div class="bloc"><div class="rang">'
      + champNum('rot', '${T("Rotation")}', el, 1) + champNum('opacity', '${T("Opacité")}', el, 5) + '</div></div>';
    /* ⚠ ALIGNER SUR LE SUPPORT, PAS SUR UN AUTRE ELEMENT : c est le geste qui
       sert vraiment sur une etiquette, ou tout se centre par rapport au papier. */
    h += '<div class="bloc"><label>${T("Aligner sur le support")}</label><div class="acts">'
      + '<button class="btn" type="button" data-aligner="l" title="${T("Gauche")}">⇤</button>'
      + '<button class="btn" type="button" data-aligner="cx" title="Centrer horizontalement">↔</button>'
      + '<button class="btn" type="button" data-aligner="r" title="${T("Droite")}">⇥</button>'
      + '<button class="btn" type="button" data-aligner="t" title="${T("Haut")}">⇧</button>'
      + '<button class="btn" type="button" data-aligner="cy" title="Centrer verticalement">↕</button>'
      + '<button class="btn" type="button" data-aligner="b" title="${T("Bas")}">⇩</button>'
      + '</div></div>';
    h += '<div class="bloc"><label>${T("État")}</label><div class="acts">'
      + bascule('el:hidden', el.hidden ? '${T("Afficher")}' : '${T("Masquer")}', !!el.hidden)
      + bascule('el:locked', el.locked ? '${T("Déverrouiller")}' : '${T("Verrouiller")}', !!el.locked)
      + '</div><div class="note">${T("Un élément verrouillé ne se déplace plus à la souris — il reste modifiable ici.")}</div></div>';
    h += '<div class="bloc"><label>${T("Ordre dans la pile")}</label><div class="acts">'
      + '<button class="btn" type="button" data-ordre="1">${T("↑ Avancer")}</button>'
      + '<button class="btn" type="button" data-ordre="-1">${T("↓ Reculer")}</button>'
      + '</div><div class="note">${T("Le dernier de la pile est celui qui se dessine par-dessus les autres.")}</div></div>';
    h += '<div class="bloc"><label>${T("Cet élément")}</label><div class="acts">'
      + '<button class="btn" type="button" data-dupliquer="1">Dupliquer</button>'
      + '<button class="btn danger" type="button" data-supprimer="1">${T("Supprimer")}</button>'
      + '</div><div class="note">'
      + '${T("Une suppression s’annule (Ctrl+Z) tant que la fenêtre reste ouverte.")}'
      + '</div></div>';
    prop.innerHTML = h;
  }

  function dessinerProp(){
    if (!M) { prop.innerHTML = ''; return; }
    var el = selEl();
    if (el) dessinerPropElement(el); else dessinerPropModele();
  }

  function dessiner(){ dessinerOutils(); dessinerAides(); dessinerPlan(); dessinerListe(); dessinerProp(); }

  function majSous(){
    document.getElementById('sous').textContent = M
      ? (nb(M.w, 0) + ' × ' + nb(M.h, 0) + ' po — ' + els().length + ' ${T("élément(s)")}') : '';
  }

  /* ══ CHARGEMENT ══════════════════════════════════════════════════════════ */
  function charger(){
    dire('${T("Lecture du modèle…")}');
    /* ⚠ LES LISTES DE L INSPECTEUR VIENNENT DU SITE, ET ON NE BLOQUE PAS DESSUS.
       Si elles manquent, l inspecteur perd son menu de polices et ses pastilles,
       mais le modele s ouvre quand meme — une liste de commodite ne doit pas
       empecher de travailler. */
    appeler('promo:reglages', []).then(function(r){
      if (r.ok) { POLICES = r.polices || []; TEINTES = r.teintes || []; }
      if (M) dessinerProp();
    });
    appeler('promo:modeleLire', [ID, 560]).then(function(r){
      if (!r.ok) {
        plan.innerHTML = '<div class="vide"><strong>${T("Modèle non ouvert")}</strong><div style="margin-top:.4rem">'
          + esc(expliquer(r)) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      M = r.modele || null;
      IMG = r.image || '';
      SEL = '';
      SALE = false; bEnr.disabled = true;
      HIST = []; REFAIRE = []; boutonsHist();
      document.getElementById('titre').textContent = (M && M.name) || '${T("Éditeur visuel")}';
      majSous();
      /* ⚠ UN APERCU QUI N A PAS PU SE PEINDRE SE DIT. Sans ca, on editerait des
         poignees sur un fond vide en croyant que le modele est vide. */
      if (!r.rendable) dire('${T("L’aperçu n’a pas pu être peint")}' + (r.detail ? ' : ' + r.detail : '')
        + '${T(". Les poignées restent utilisables.")}', 'att');
      else dire('${T("Modèle ouvert.")}', 'bon');
      dessiner();
      /* Une premiere repeinture pose les reperes : l image rendue par modeleLire
         n en porte aucun, et la zone sure est allumee par defaut. */
      repeindreBientot();
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
    dire('${T("Enregistrement…")}');
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
      dire('${T("Enregistré —")} ' + r.elements + ' ${T("élément(s).")}', 'bon');
      var garde = SEL;
      charger();
      setTimeout(function(){ SEL = garde; dessiner(); }, 0);
    });
  }

  /* ⚠⚠ LE FORMAT NE PASSE PAS PAR L ENREGISTREMENT ORDINAIRE, et la fenetre le
     DIT dans sa note : le coeur d ecriture refuse w et h a dessein, pour qu une
     fenetre un peu ancienne ne reecrive pas des dimensions lues avant un
     changement. Corollaire honnete : ce geste-la ne s annule pas par Ctrl+Z,
     puisqu il ne touche pas au modele que l historique garde. */
  function redimensionner(){
    if (!M) return;
    var cw = document.getElementById('rd-w'), ch = document.getElementById('rd-h');
    var w = nb(cw && cw.value, 0), hh = M.shape === 'circle' ? w : nb(ch && ch.value, 0);
    dire('${T("Changement de format…")}');
    appeler('promo:redimensionner', [ID, w, hh]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      M.w = r.w; M.h = r.h;
      majSous();
      dessiner();
      repeindreBientot();
      dire('${T("Format :")} ' + r.dim + '${T(". Les éléments ont suivi.")}', 'bon');
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
      majSous();
      dessiner();
      repeindreBientot();
      dire('${T("Élément ajouté — pensez à enregistrer.")}', 'att');
    });
  }
  function dupliquer(source){
    var el = source || selEl();
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
      majSous();
      dessiner();
      repeindreBientot();
      dire('${T("Élément dupliqué.")}', 'bon');
    });
  }
  function supprimer(){
    var el = selEl();
    if (!el) return;
    instantane();
    M.elements = els().filter(function(x){ return x.id !== el.id; });
    SEL = '';
    salir();
    majSous();
    dessiner();
    repeindreBientot();
    dire('${T("Élément retiré — Ctrl+Z le ramène.")}', 'att');
  }
  function ordonner(dir){
    var el = selEl();
    if (!el) return;
    var l = els(), i = l.indexOf(el), j = i + dir;
    if (i < 0 || j < 0 || j >= l.length) { dire('${T("Déjà à cette extrémité de la pile.")}', 'att'); return; }
    instantane();
    l[i] = l[j]; l[j] = el;
    salir();
    dessiner();
    repeindreBientot();
  }
  function aligner(a){
    var el = selEl();
    if (!el) return;
    instantane();
    if (a === 'l') el.xPct = 0;
    else if (a === 'r') el.xPct = 100 - nb(el.wPct, 0);
    else if (a === 'cx') el.xPct = (100 - nb(el.wPct, 0)) / 2;
    else if (a === 't') el.yPct = 0;
    else if (a === 'b') el.yPct = 100 - nb(el.hPct, 0);
    else if (a === 'cy') el.yPct = (100 - nb(el.hPct, 0)) / 2;
    salir();
    dessinerPlan();
    dessinerProp();
    repeindreBientot();
  }

  /* ══ LE SELECTEUR DE LA LOGOTHEQUE ═══════════════════════════════════════
     ⚠ DEUX ADRESSES PAR LOGO. Ce qui s ECRIT dans le modele est l adresse du
     stockage — c est elle que le peintre du site sait relire sans teindre son
     canevas. Ce qui s AFFICHE ici est une vignette data:, parce qu une fenetre
     native n a pas l origine du site et n afficherait qu un cadre vide. */
  function ouvrirChoix(apres, titre){
    CHOIX = apres;
    document.getElementById('choix-titre').textContent = titre || '${T("Choisir une image")}';
    voile.hidden = false;
    if (LOGOS) dessinerChoix(); else lireLogos();
  }
  function fermerChoix(){ voile.hidden = true; CHOIX = null; }
  function lireLogos(){
    document.getElementById('choix-corps').innerHTML =
      '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>';
    document.getElementById('choix-etat').textContent = '${T("Lecture de la logothèque…")}';
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
      corps.innerHTML = '<div class="vide">${T("La logothèque est vide. Utilisez « Importer une image… »")}'
        + ' ${T("pour y déposer un premier fichier.")}</div>';
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
      + ' ${T("écartée(s) : illisibles ici, elles ne sortiraient pas non plus sur le papier")}';
    if (r.total > r.plafond) etat += ' · ' + r.total + ' ${T("au total, les")} ' + r.plafond + ' ${T("plus récentes sont montrées")}';
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
    dire('${T("Image posée — pensez à enregistrer.")}', 'att');
  }
  function poserImageFond(l){
    instantane();
    M.bg = Object.assign({}, M.bg || {}, { type: 'image', src: l.adresse });
    salir();
    dessiner();
    repeindreBientot();
    dire('${T("Fond changé — pensez à enregistrer.")}', 'att');
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
    if (el.locked) { dire('${T("Élément verrouillé — déverrouillez-le pour le déplacer.")}', 'att'); return; }
    var scene = document.getElementById('scene');
    if (!scene) return;
    /* L instantane se pose au DEBUT du glissement : une annulation ramene alors
       la position d avant le geste, pas celle d avant le dernier pixel. */
    instantane();
    GLISSE = { id: id, mode: poi ? poi.getAttribute('data-poi') : 'place',
      x0: ev.clientX, y0: ev.clientY,
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
    var el = parId(GLISSE.id);
    if (!el) return;
    var g = GLISSE;
    if (g.mode === 'rot') {
      /* La rotation se mesure depuis le CENTRE de la boite, pas depuis le point
         de depart : c est ce qui fait que la poignee suit le curseur au lieu de
         deriver. Le +90 place le zero en haut, la ou la poignee se tient. */
      var cx = r.left + (nb(el.xPct, 0) + nb(el.wPct, 10) / 2) / 100 * r.width;
      var cy = r.top + (nb(el.yPct, 0) + nb(el.hPct, 10) / 2) / 100 * r.height;
      var a = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI + 90;
      if (AIMANT && Math.abs(a % 15) < 4) a = Math.round(a / 15) * 15;
      el.rot = Math.round(a);
    } else {
      var dx = (ev.clientX - g.x0) / r.width * 100;
      var dy = (ev.clientY - g.y0) / r.height * 100;
      if (g.mode === 'place') {
        var nx = g.xPct + dx, ny = g.yPct + dy;
        /* ⚠ L AIMANTATION COLLE AU CENTRE ET AUX BORDS DU SUPPORT — les seules
           references qui comptent sur une etiquette. Les seuils (1,6 au centre,
           1,2 aux bords) viennent de l ecran web : les changer ferait coller
           differemment dans les deux surfaces pour le meme geste. */
        if (AIMANT) {
          var ccx = (100 - nb(el.wPct, 0)) / 2, ccy = (100 - nb(el.hPct, 0)) / 2;
          if (Math.abs(nx - ccx) < 1.6) nx = ccx;
          if (Math.abs(ny - ccy) < 1.6) ny = ccy;
          if (Math.abs(nx) < 1.2) nx = 0;
          if (Math.abs(ny) < 1.2) ny = 0;
          if (Math.abs(nx + nb(el.wPct, 0) - 100) < 1.2) nx = 100 - nb(el.wPct, 0);
          if (Math.abs(ny + nb(el.hPct, 0) - 100) < 1.2) ny = 100 - nb(el.hPct, 0);
        }
        el.xPct = Math.round(nx * 10) / 10;
        el.yPct = Math.round(ny * 10) / 10;
      } else {
        /* Quatre coins, et chacun garde le coin OPPOSE en place : tirer le coin
           haut-gauche doit agrandir vers le haut et la gauche, pas deplacer la
           boite entiere. */
        var w = g.wPct, hh = g.hPct, x = g.xPct, y = g.yPct;
        if (g.mode === 'se') { w = Math.max(2, g.wPct + dx); hh = Math.max(2, g.hPct + dy); }
        else if (g.mode === 'ne') { w = Math.max(2, g.wPct + dx); hh = Math.max(2, g.hPct - dy); y = g.yPct + (g.hPct - hh); }
        else if (g.mode === 'sw') { w = Math.max(2, g.wPct - dx); x = g.xPct + (g.wPct - w); hh = Math.max(2, g.hPct + dy); }
        else { w = Math.max(2, g.wPct - dx); x = g.xPct + (g.wPct - w); hh = Math.max(2, g.hPct - dy); y = g.yPct + (g.hPct - hh); }
        el.wPct = Math.round(w * 10) / 10; el.hPct = Math.round(hh * 10) / 10;
        el.xPct = Math.round(x * 10) / 10; el.yPct = Math.round(y * 10) / 10;
      }
    }
    salir();
    dessinerPlan();
    dessinerProp();
  });
  function finGlisse(){
    if (!GLISSE) return;
    GLISSE = null;
    dire('${T("Modifié — pensez à enregistrer.")}', 'att');
    repeindreBientot();
  }
  plan.addEventListener('pointerup', finGlisse);
  plan.addEventListener('pointercancel', finGlisse);

  /* ══ LA BARRE D OUTILS, LES AIDES, LA LISTE ET L INSPECTEUR ══════════════ */
  outils.addEventListener('click', function(ev){
    var b = ev.target.closest('[data-ajout]');
    if (b) ajouter(b.getAttribute('data-ajout'));
  });
  aides.addEventListener('click', function(ev){
    var b;
    if ((b = ev.target.closest('[data-repere]'))) {
      var k = b.getAttribute('data-repere');
      REPERES[k] = !REPERES[k];
      dessinerAides();
      /* Tout de suite, pas dans 450 ms : c est une case a cocher, elle doit
         repondre au clic. */
      repeindre();
      return;
    }
    if (ev.target.closest('[data-aimant]')) { AIMANT = !AIMANT; dessinerAides(); return; }
    if ((b = ev.target.closest('[data-zoom]'))) {
      var d = parseInt(b.getAttribute('data-zoom'), 10);
      ZOOM = d === 0 ? 1 : borner(Math.round((ZOOM + d * 0.25) * 100) / 100, 0.5, 3);
      dessinerAides();
      dessinerPlan();
      repeindreBientot();
      return;
    }
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
    if (t.hasAttribute('data-pouce') && el) {
      var p = t.getAttribute('data-pouce').split(':');
      var base = nb(M[p[1]], 1) || 1;
      instantaneDoux();
      el[p[0]] = borner(nb(t.value, 0) / base * 100, parseFloat(p[2]), parseFloat(p[3]));
      salir(); dessinerPlan(); repeindreBientot(); return;
    }
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
  /* ⚠ UN SEUL ECOUTEUR, ET LA CIBLE SE LIT DANS L ATTRIBUT (el:xxx, bg:xxx).
     Enumerer chaque nom aurait demande d y revenir a chaque champ ajoute — et
     c est exactement le genre d oubli qui donne un bouton muet. */
  function appliquerCible(cible, valeur, estBascule){
    var p = String(cible).split(':'), ou = p[0], cle = p[1];
    var el = selEl();
    if (ou === 'bg' || ou === 'btxt') { M.bg = Object.assign({}, M.bg || {}); M.bg[cle] = estBascule ? !M.bg[cle] : valeur; return true; }
    if (ou === 'otxt') { M.border = Object.assign({}, M.border || {}); M.border[cle] = valeur; return true; }
    if ((ou === 'el' || ou === 'txt') && el) { el[cle] = estBascule ? !el[cle] : valeur; return true; }
    return false;
  }
  prop.addEventListener('click', function(ev){
    if (!M) return;
    var el = selEl();
    var b;
    if ((b = ev.target.closest('[data-seg]'))) {
      instantane();
      if (appliquerCible(b.getAttribute('data-seg'), b.getAttribute('data-val'), false)) {
        salir(); dessiner(); repeindreBientot();
      }
      return;
    }
    if ((b = ev.target.closest('[data-teinte]'))) {
      instantane();
      if (appliquerCible(b.getAttribute('data-teinte'), b.getAttribute('data-val'), false)) {
        salir(); dessinerProp(); repeindreBientot();
      }
      return;
    }
    if ((b = ev.target.closest('[data-bascule]'))) {
      instantane();
      if (appliquerCible(b.getAttribute('data-bascule'), null, true)) {
        salir(); dessiner(); repeindreBientot();
      }
      return;
    }
    if ((b = ev.target.closest('[data-choisir]'))) {
      if (b.getAttribute('data-choisir') === 'fond') ouvrirChoix(poserImageFond, '${T("Choisir une image de fond")}');
      else ouvrirChoix(poserImageElement, '${T("Choisir une image")}');
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
    if (ev.target.closest('[data-graisse]') && el) {
      instantane(); el.weight = nb(el.weight, 600) >= 700 ? 400 : 700;
      salir(); dessinerProp(); repeindreBientot(); return;
    }
    if (ev.target.closest('[data-rot90]') && el) {
      instantane(); el.rot = (nb(el.rot, 0) + 90) % 360;
      salir(); dessinerPlan(); dessinerProp(); repeindreBientot(); return;
    }
    /* ⚠ REINITIALISER LA RETOUCHE REMET AUSSI LE RECADRAGE ET LES MIROIRS, comme
       l ecran web : c est ce qu on veut quand on dit << recommence cette image >>,
       et separer les deux obligerait a chercher deux boutons. */
    if (ev.target.closest('[data-retouche]') && el) {
      instantane();
      Object.assign(el, { bright: 100, contrast: 100, sat: 100, gray: 0, blur: 0,
        zoom: 1, ox: 0, oy: 0, flipH: false, flipV: false });
      salir(); dessinerProp(); repeindreBientot();
      dire('${T("Retouche et recadrage remis à zéro.")}', 'bon');
      return;
    }
    if ((b = ev.target.closest('[data-aligner]'))) { aligner(b.getAttribute('data-aligner')); return; }
    if ((b = ev.target.closest('[data-ordre]'))) { ordonner(parseInt(b.getAttribute('data-ordre'), 10)); return; }
    if (ev.target.closest('[data-dupliquer]')) { dupliquer(); return; }
    if (ev.target.closest('[data-supprimer]')) { supprimer(); return; }
    if (ev.target.closest('[data-redim]')) { redimensionner(); return; }
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
      if (ok === false) { dire('${T("La fenêtre Logothèque n’a pas pu s’ouvrir.")}', 'err'); return; }
      document.getElementById('choix-etat').textContent =
        '${T("Déposez l’image dans la fenêtre Logothèque, puis revenez ici et touchez « ↻ Actualiser ».")}';
    });
  });

  document.getElementById('b-enr').addEventListener('click', enregistrer);
  document.getElementById('b-annuler').addEventListener('click', annuler);
  document.getElementById('b-refaire').addEventListener('click', refaire);
  document.getElementById('b-recharger').addEventListener('click', function(){
    /* ⚠ RECHARGER JETTE CE QUI N EST PAS ENREGISTRE : on le demande avant, une
       seule fois. Un bouton qui efface sans prevenir est une porte piegee. */
    if (SALE && !window.confirm('${T("Des modifications ne sont pas enregistrées. Les abandonner ?")}')) return;
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
      if (SALE) { dire('${T("Modifications non enregistrées — Enregistrer, ou Recharger pour abandonner.")}', 'att'); return; }
      P.fermer();
      return;
    }
    var cmd = ev.ctrlKey || ev.metaKey;
    if (cmd && (ev.key === 's' || ev.key === 'S')) { ev.preventDefault(); enregistrer(); return; }
    if (cmd && (ev.key === 'z' || ev.key === 'Z')) { ev.preventDefault(); if (ev.shiftKey) refaire(); else annuler(); return; }
    if (cmd && (ev.key === 'y' || ev.key === 'Y')) { ev.preventDefault(); refaire(); return; }
    /* ⚠ LES RACCOURCIS QUI TOUCHENT UN ELEMENT NE S APPLIQUENT PAS DANS UN
       CHAMP : sans ce garde, Ctrl+C copierait l element au lieu du texte
       selectionne, et Suppr effacerait l element pendant qu on corrige son nom. */
    var a = document.activeElement, n = a ? (a.tagName || '').toLowerCase() : '';
    if (n === 'input' || n === 'textarea' || n === 'select') return;
    if (!voile.hidden) return;
    var el = selEl();
    if (cmd && (ev.key === 'd' || ev.key === 'D')) { ev.preventDefault(); dupliquer(); return; }
    if (cmd && (ev.key === 'c' || ev.key === 'C')) {
      if (el) { PRESSE = JSON.stringify(el); dire('${T("Élément copié.")}', 'bon'); }
      return;
    }
    if (cmd && (ev.key === 'v' || ev.key === 'V')) {
      if (!PRESSE) { dire('${T("Rien à coller.")}', 'att'); return; }
      ev.preventDefault();
      dupliquer(JSON.parse(PRESSE));
      return;
    }
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      if (!el) return;
      ev.preventDefault();
      if (el.locked) { dire('${T("Élément verrouillé — déverrouillez-le pour le retirer.")}', 'att'); return; }
      supprimer();
      return;
    }
    /* ⚠ LES FLECHES DEPLACENT DE 0,5 %, ET DE 5 % AVEC MAJUSCULE. C est le seul
       moyen de placer au dixieme pres sans viser a la souris — et ce sont les
       memes pas que l ecran web, pour que le geste se transporte. */
    if (!el || el.locked) return;
    var pas = ev.shiftKey ? 5 : 0.5, bouge = false;
    if (ev.key === 'ArrowLeft')  { el.xPct = nb(el.xPct, 0) - pas; bouge = true; }
    if (ev.key === 'ArrowRight') { el.xPct = nb(el.xPct, 0) + pas; bouge = true; }
    if (ev.key === 'ArrowUp')    { el.yPct = nb(el.yPct, 0) - pas; bouge = true; }
    if (ev.key === 'ArrowDown')  { el.yPct = nb(el.yPct, 0) + pas; bouge = true; }
    if (bouge) {
      ev.preventDefault();
      instantaneDoux();
      salir();
      dessinerPlan();
      dessinerProp();
      repeindreBientot();
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
