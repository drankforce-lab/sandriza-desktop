'use strict';

/*
 * FENÊTRE « VENTE AU COMPTOIR » — NATIVE
 * =============================================================================
 * L'écran le plus utilisé de la boutique, écrit dans l'application. Il ne charge
 * aucune page du site et ne fait aucun appel web : tout passe par le pont, qui
 * interroge la fenêtre principale — seule porteuse de la session.
 *
 * ⚠⚠ AUCUNE RÈGLE DE VENTE N'EST ÉCRITE ICI. Ni taxes, ni prix, ni rabais, ni
 * statut de commande, ni décompte de stock. Tout cela vit dans le site
 * (`Admin._posVente`, `Admin._posTotauxDe`, `Cart.calcTotals`) et n'existe qu'en
 * UN exemplaire. Cette fenêtre SAISIT et AFFICHE ; elle ne calcule rien. En
 * recopier ne serait-ce que le calcul de taxes — ou d'un pourcentage de rabais —
 * garantirait qu'un jour les deux écrans ne donnent plus le même total pour le
 * même panier, et la différence se verrait en comptabilité, des semaines plus
 * tard, sans qu'on sache lequel a raison.
 *
 * LES RABAIS DU COMPTOIR (2026-10-04, sa demande) : un pourcentage PAR ARTICLE
 * (« 25 % sur ce chandail — petit défaut »), et un rabais SUR LA VENTE en dollars
 * ou en pourcentage. Chacun peut porter une REMARQUE. La fenêtre envoie le
 * pourcentage et la remarque tels quels ; le site calcule le prix net, l'écrit
 * sur la facture et en garde la trace — le registre de l'Inventaire les relit.
 *
 * ⚠ ELLE N'ENCAISSE JAMAIS UNE CARTE. Saisir un numéro ici ferait basculer la
 * boutique en PCI SAQ-D. On enregistre un paiement DÉJÀ REÇU (comptant, Interac,
 * terminal), ou l'on envoie un lien de paiement pour une vente au téléphone.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne et casse toute la fenêtre.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, SEP_DEC } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('caisse');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}

/* ── RELOOKING 2026 (2026-10-04) : cartes arrondies, champs plus hauts, une seule
   couleur d action (l or), les montants en chiffres tabulaires. */
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.7rem 1.2rem;border-bottom:1px solid var(--v08);background:var(--f-carte2)}
.tete h1{margin:0;font-size:1.08rem;font-weight:700;letter-spacing:.01em}
.tete .sous{font-size:.76rem;color:var(--tx2);margin-left:.2rem}
.tete .pastille-par{display:inline-flex;align-items:center;gap:.4rem;padding:.2rem .65rem;border-radius:99px;
  background:var(--v05);font-size:.74rem;color:var(--tx2)}
.tete .pastille-par:empty{display:none}

/* ⚠ DEUX COLONNES, ET LE CORPS NE DEFILE PAS. Seule la LISTE DES ARTICLES a le
   droit de defiler — elle peut grandir, le reste non. A droite, tout est empile
   SANS TROU et c est la colonne entiere qui defile si elle deborde : le bouton
   reste atteignable, et il PORTE LE TOTAL (<< Enregistrer la vente — 77,61 $ >>). */
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.2rem;overflow:hidden;
  display:grid;grid-template-columns:minmax(0,1.3fr) minmax(360px,.8fr);gap:1rem}
.col{min-width:0;min-height:0;display:flex;flex-direction:column;gap:.75rem}
.defile{flex:1 1 auto;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:.75rem;
  justify-content:flex-start;scrollbar-width:thin}
@media (max-width:1000px){
  .corps{grid-template-columns:1fr;overflow-y:auto}
  .col{min-height:auto}
  .defile{overflow:visible;min-height:auto}
}

.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:16px;
  padding:.85rem 1rem;flex:0 0 auto;min-height:0}
.carte.plein{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;padding:.85rem 0 .4rem}
.carte.plein > .entete{padding:0 1rem .55rem}
.carte h2{margin:0 0 .55rem;font-size:.78rem;font-weight:700;color:var(--tx2);letter-spacing:.02em;
  display:flex;align-items:center;gap:.45rem}
.carte h2 .lie{color:var(--tx-ok);font-size:.72rem;margin-left:auto}
.carte h2 .compte{margin-left:auto;font-weight:600;font-size:.72rem;padding:.12rem .55rem;border-radius:99px;background:var(--v06);color:var(--tx2)}
.carte h2 .compte:empty{display:none}
.entete h2{margin:0}

input,select{font:inherit;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:10px;padding:.45rem .65rem;
  width:100%;min-width:0;min-height:38px}
input:focus,select:focus{outline:none;border-color:#c9a97e;box-shadow:0 0 0 3px rgba(201,169,126,.18)}
input.manque{border-color:#f87171}
input[type=checkbox]{width:auto;min-height:0}
.ch{display:flex;flex-direction:column;gap:.25rem;min-width:0}
.ch > span{font-size:.74rem;color:var(--tx2);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.55rem}
.champs{display:flex;flex-direction:column;gap:.4rem}
.sep{height:1px;background:var(--v07);margin:.65rem 0}
.num{font-variant-numeric:tabular-nums}

/* Le champ de scan : la porte d entree, avec sa loupe. */
.scan{position:relative}
.scan svg{position:absolute;left:.9rem;top:50%;transform:translateY(-50%);width:18px;height:18px;
  fill:none;stroke:var(--tx2);stroke-width:1.8;stroke-linecap:round;pointer-events:none}
#scan{font-size:1rem;padding:.65rem .9rem .65rem 2.6rem;border-radius:12px;min-height:46px}

/* Resultats de recherche : hauteur bornee, sinon les articles fileraient hors ecran. */
.res{margin-top:.6rem;border:1px solid var(--v10);border-radius:12px;max-height:32vh;overflow-y:auto}
.res .art{padding:.55rem .75rem;border-top:1px solid var(--v06)}
.res .art:first-child{border-top:0}
.res .nom{font-weight:600;font-size:.88rem}
.res .code{font-family:ui-monospace,monospace;font-size:.73rem;color:var(--tx2);margin-left:.4rem}
.res .vars{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.35rem}
.res .vars button{font-size:.76rem;padding:.2rem .6rem;border-radius:99px}
.res .vars button .q{color:var(--tx2)}

/* ── LES ARTICLES : une ligne par article, le rabais visible sur la ligne. */
.lignes{flex:1 1 auto;min-height:0;overflow-y:auto;padding:0 .5rem}
.lg{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;align-items:center;gap:.8rem;
  padding:.6rem .5rem;border-top:1px solid var(--v06);border-radius:10px}
.lg:first-child{border-top:0}
.lg.ouverte{background:var(--v03)}
.lg .px{text-align:right;min-width:5.6rem}
.lg .px .net{font-weight:600}
.lg .px .barre{display:block;font-size:.74rem;color:var(--tx2);text-decoration:line-through}
.lg .tot{text-align:right;min-width:5.6rem;font-weight:700}
.lg .act{display:flex;gap:.3rem;align-items:center}
.lg .act .tot{margin-right:.45rem}
.qte{display:inline-flex;align-items:center;border:1px solid var(--v12);border-radius:99px;overflow:hidden}
.qte{padding:2px}
.qte button{border:0;border-radius:99px;background:none;width:28px;height:28px;min-height:0;padding:0;font-size:1rem;line-height:1}
.qte button:hover:not(:disabled){background:var(--v08)}
.qte strong{min-width:1.8rem;text-align:center;font-size:.9rem}
.rab-pill{display:inline-flex;align-items:center;gap:.3rem;padding:.08rem .5rem;border-radius:99px;
  background:rgba(201,169,126,.16);color:var(--tx-or);font-size:.72rem;font-weight:700}
.rab-note{font-size:.74rem;color:var(--tx2);font-style:italic}
.ico-btn{width:32px;height:32px;padding:0;display:inline-flex;align-items:center;justify-content:center;border-radius:99px}
.ico-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.ico-btn.on{border-color:#c9a97e;color:var(--tx-or)}

/* L editeur de rabais d un article : sous sa ligne, jamais une autre fenetre. */
.edit{grid-column:1 / -1;margin-top:.5rem;padding:.75rem .8rem;border:1px solid var(--v10);border-radius:12px;background:var(--f-carte2)}
.edit .titre{font-size:.76rem;font-weight:700;color:var(--tx2);margin-bottom:.45rem}
.puces{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.55rem}
.puces button{border-radius:99px;padding:.22rem .7rem;font-size:.8rem}
.puces button.on{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:700}
.edit .g-ed{display:grid;grid-template-columns:7rem minmax(0,1fr);gap:.5rem;align-items:end}
.edit .fin{display:flex;justify-content:flex-end;gap:.4rem;margin-top:.6rem;align-items:center}
.edit .apercu{margin-right:auto;font-size:.8rem;color:var(--tx2)}
.pct-champ{position:relative}
.pct-champ input{padding-right:1.8rem}
.pct-champ i{position:absolute;right:.7rem;top:50%;transform:translateY(-50%);font-style:normal;color:var(--tx2);font-size:.85rem;pointer-events:none}

/* Bascule $ / % du rabais sur la vente. */
/* La bascule REMPLIT sa colonne (sa capture du 2026-10-04 : un vide a droite du
   <<  % >>). Deux moitiés égales, la choisie en pastille arrondie a l interieur. */
.seg{display:flex;width:100%;gap:3px;padding:3px;border:1px solid var(--v12);border-radius:10px;min-height:38px;background:var(--f-champ)}
.seg button{flex:1 1 0;border:0;border-radius:7px;background:none;padding:0;font-weight:700;color:var(--tx2);min-height:0}
.seg button:hover:not(.on){background:var(--v06);color:var(--tx)}
.seg button.on{background:#c9a97e;color:#17202c}
.rab-vente{display:grid;grid-template-columns:8.5rem 6.5rem minmax(0,1fr);gap:.5rem;align-items:end}

/* Totaux : la ligne du total ne peut pas se confondre avec une taxe. */
.tot .l{display:flex;justify-content:space-between;gap:1rem;padding:.08rem 0;font-size:.86rem}
.tot .l > span:last-child{font-variant-numeric:tabular-nums}
.tot .l.rab{color:var(--tx-or)}
.tot .l.grand{margin-top:.35rem;padding-top:.4rem;border-top:1px solid var(--v12);font-size:1.22rem;font-weight:800}

button{font:inherit;cursor:pointer;border-radius:10px;padding:.4rem .85rem;
  border:1px solid var(--v14);background:var(--v04);
  color:var(--tx);transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:var(--v08);border-color:var(--v28)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97;border-color:#d8bd97}
button.large{width:100%;padding:.75rem .9rem;font-size:1.05rem;margin-top:.6rem;border-radius:12px}
button.mini{padding:.22rem .6rem;font-size:.78rem}

/* ⚠ LA LISTE DES CLIENTS FLOTTE (sa demande du 2026-10-04 : << une liste
   flottante des noms sans nous deformer la zone >>). Glissee dans la carte, elle
   repoussait tout ce qui suit. Elle est en position FIXE, calee sous le champ
   tape : la colonne de droite defile, une liste absolue y serait coupee. */
#c-res{position:fixed;z-index:40;display:none}
#c-res.ouverte{display:block}
.liste-cli{background:var(--f-carte);border:1px solid var(--v14);border-radius:12px;overflow:hidden;
  box-shadow:0 14px 36px rgba(0,0,0,.45);max-height:18rem;overflow-y:auto}
.liste-cli .tete-l{padding:.4rem .75rem;font-size:.72rem;color:var(--tx2);border-bottom:1px solid var(--v07)}
.cli{display:flex;align-items:center;gap:.6rem;padding:.5rem .75rem;cursor:pointer;border-top:1px solid var(--v06)}
.cli:first-of-type{border-top:0}
.cli:hover,.cli.on{background:var(--v06)}
.cli .av{width:2rem;height:2rem;flex:0 0 auto;border-radius:99px;display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:.8rem;background:var(--v06);color:var(--tx-gris2)}
.cli .t{min-width:0}
.cli .n{font-weight:700;font-size:.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cli .m{color:var(--tx2);font-size:.75rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html.jour .liste-cli{box-shadow:0 14px 36px rgba(15,23,42,.18)}

.case{display:flex;align-items:flex-start;gap:.5rem;margin-top:.5rem;font-size:.8rem;cursor:pointer}
.case .exp{display:block;color:var(--tx2);font-size:.73rem;line-height:1.45}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.6rem 1.2rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.8rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.actions{flex:0 0 auto;display:flex;gap:.4rem}

.aide{font-size:.73rem;color:var(--tx2);line-height:1.4;margin-top:.4rem}
.vide{padding:2.2rem 1rem;text-align:center;color:var(--tx2);font-size:.88rem}
.vide svg{display:block;margin:0 auto .6rem;width:34px;height:34px;fill:none;stroke:var(--tx3);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}

/* Le compte rendu de vente : un voile, pas une autre fenetre. */
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.5rem;z-index:50}
.voile .boite{background:var(--f-carte);border:1px solid var(--v12);
  border-radius:16px;padding:1.2rem 1.35rem;max-width:34rem;width:100%}
.voile h3{margin:0 0 .6rem;font-size:1.08rem;font-weight:700}
.voile .rangee{display:flex;justify-content:space-between;gap:1rem;
  padding:.3rem 0;font-size:.87rem;border-top:1px solid var(--v06)}
.voile .rangee:first-of-type{border-top:0}
.voile .fin{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem}
.voile .lien{display:flex;gap:.4rem;margin-top:.55rem}
.voile .lien input{font-family:ui-monospace,monospace;font-size:.78rem}

html.jour .tete{background:#faf8f3}
html.jour .rab-pill{background:rgba(138,106,62,.12);color:#6f5530}
html.jour .tot .l.rab{color:#6f5530}
html.jour .ico-btn.on{border-color:#8a6a3e;color:#6f5530}
html.jour .puces button.on,html.jour .seg button.on{background:#8a6a3e;border-color:#8a6a3e;color:#ffffff}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* Les icones au trait de la fenetre. */
const SVG_LOUPE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
const SVG_PCT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/></svg>';
const SVG_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const SVG_SAC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';

/** Page complète de la fenêtre native « Vente au comptoir ».
 *  `mode` : '' (normal) ; 'attente' = compte rendu temoin d un paiement en
 *  attente ; 'rabais' = une vente temoin avec un article rabaisse et l editeur
 *  ouvert. Les deux temoins sont INERTES (aucune vente) et servent aux bancs :
 *  ces etats n existent qu apres des clics, que le banc ne fait pas. */
function pageCaisse(mode) {
  const attenteTemoin = String(mode || '') === 'attente';
  const rabaisTemoin = String(mode || '') === 'rabais';
  return `${TETE()}
<title>${T("Vente au comptoir — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.payments}</span><h1>${T("Vente au comptoir")}</h1>
  <span class="pastille-par" id="sous"></span>
  <button id="btn-afficheur" class="mini" style="margin-left:auto"
    title="${T("Ouvrir l’écran tourné vers le client, à poser sur un second moniteur")}">${T("Affichage client")}</button></div>
<div class="corps" id="corps">
  <div class="col">
    <div class="carte">
      <div class="scan">${SVG_LOUPE}<input aria-label="${T("Scannez le code-barres, ou tapez un nom d’article")}" id="scan" autocomplete="off" placeholder="${T("Scannez le code-barres, ou tapez un nom d’article…")}"></div>
      <div id="res"></div>
    </div>
    <div class="carte plein">
      <div class="entete"><h2>${T("Articles")} <span class="compte num" id="nb-art"></span></h2></div>
      <div class="lignes" id="lignes"></div>
    </div>
    <div class="carte tot" id="totaux"></div>
  </div>
  <div class="col droite">
   <div class="defile">
    <div class="carte">
      <h2>${T("Client")}<span class="lie" id="lie"></span></h2>
      <div class="champs">
        <input aria-label="${T("Nom")}" id="c-nom" autocomplete="off" placeholder="${T("Nom")}">
        <div class="g2">
          <input aria-label="${T("Courriel")}" id="c-mail" autocomplete="off" inputmode="email" placeholder="${T("Courriel")}">
          <input aria-label="${T("Téléphone — 000 000-0000")}" id="c-tel" autocomplete="off" inputmode="tel" placeholder="${T("Téléphone — 000 000-0000")}">
        </div>
      </div>
      <div id="c-res"></div>
      <label class="case" id="c-creer-zone"><input type="checkbox" id="c-creer">
        <span>${T("Ouvrir un compte et lui envoyer le lien pour le finaliser")}
        <span class="exp">${T("Courriel requis. Historique et retours pour lui ; aucune inscription à l’infolettre.")}</span></span></label>
      <div class="sep"></div>
      <div class="g2">
        <label class="ch"><span>${T("Livraison")}</span><input id="v-liv" class="num" inputmode="decimal" value="0${SEP_DEC()}00" title="${T("Livraison")}"></label>
      </div>
      <div class="sep"></div>
      <div class="rab-vente">
        <div class="ch"><span>${T("Rabais sur la vente")}</span>
          <div class="seg" role="group" aria-label="${T("Rabais en dollars ou en pourcentage")}">
            <button type="button" id="rt-montant" class="on" aria-pressed="true">$</button>
            <button type="button" id="rt-pct" aria-pressed="false">%</button>
          </div></div>
        <label class="ch"><span>${T("Valeur")}</span><input id="v-rab" class="num" inputmode="decimal" value="0${SEP_DEC()}00" title="${T("Rabais")}"></label>
        <label class="ch"><span>${T("Remarque")}</span><input id="v-rabnote" list="sugg-rab" maxlength="200" autocomplete="off" placeholder="${T("ex. : client fidèle")}"></label>
      </div>
      <datalist id="sugg-rab">
        <option value="${T("Petit défaut")}"><option value="${T("Fin de série")}"><option value="${T("Article de démonstration")}">
        <option value="${T("Dernier en stock")}"><option value="${T("Geste commercial")}"><option value="${T("Client fidèle")}"><option value="${T("Rabais employé")}">
      </datalist>
    </div>
    <div class="carte">
      <h2>${T("Encaissement")}</h2>
      <div class="g2">
        <label class="ch"><span>${T("Mode de paiement")}</span><select id="v-paie"></select></label>
        <label class="ch"><span>${T("Facture")}</span><select id="v-remise" title="${T("Ce qu’on fait de la facture après la vente")}"></select></label>
      </div>
      <input aria-label="${T("Note interne (facultatif)")}" id="v-note" placeholder="${T("Note interne (facultatif)")}" style="margin-top:.55rem">
      <button class="prim large" id="btn-vendre" disabled>${T("Enregistrer la vente")}</button>
      <div class="aide">${T("Cet écran n’encaisse jamais la carte.")}</div>
    </div>
   </div>
  </div>
</div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions">
    <button id="btn-vider">${T("Vider la vente")}</button>
  </span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; t.appendChild(b); }
    if (actif) { b.textContent='${T("⧉ Détacher")}'; b.title='${T("Ouvrir cet écran dans sa propre fenêtre")}'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='${T("⚓ Ancrer")}'; b.title='${T("Ramener cet écran dans la fenêtre principale")}'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE()}${JS_DIRE()}
  var CTX = null;            // contexte recu du site (provinces, moyens, droits)
  // { productId, name, sku, size, color, price, quantity, rabaisPct?, rabaisNote? }
  // ⚠ price reste le PRIX COURANT recu du site ; le pourcentage voyage a cote et
  // c est le site qui en tire le prix net (TOT.lignes).
  var LIGNES = [];
  var CLI = null;            // identifiant du compte lie, s il y en a un
  var TOT = null;            // dernier compte rendu de totaux, venu du SITE
  var TROUVES = [];          // fiches clientes trouvees, retenues entieres
  var EDIT = -1;             // ligne dont l editeur de rabais est ouvert
  var RABTYPE = 'montant';   // rabais sur la vente : 'montant' | 'pct'
  var enVente = false;
  var PUCES = [10, 15, 20, 25, 30, 40, 50];

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  /* ⚠ Le symbole change de COTE en anglais : << $12.50 >>. Voir szArgent (socle). */
  function argent(n){ return szArgent(n); }
  function pctTxt(n){ return szNombre(n, 2).replace(/[.,]00$/, '') + ' %'; }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas d’encaisser une vente.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps. Réessayez ; si cela persiste, rechargez-la (Ctrl+R).")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cet article n’existe plus.")}',
    aucun_article:      '${T("Aucun article dans la vente.")}',
    total_invalide:     '${T("Total invalide — la vente n’a pas été enregistrée.")}',
    client_requis:      '${T("Le nom du client est obligatoire — aucune vente anonyme.")}',
    courriel_invalide:  '${T("Un courriel valide est requis pour ouvrir un compte.")}',
    taxes_indisponibles:'${T("Moteur de taxes indisponible — n’encaissez pas.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(m){ return MOTIFS[m] || '${T("Erreur inattendue (")}' + esc(m || '?') + ').'; }

  // ⚠ UN SEUL POINT D APPEL, avec le rattrapage CHAINE : ce que le premier << then >>
  // LEVE deviendrait sinon un rejet non traite, invisible dans une fenetre native.
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  /* ⚠ UNE VENTE AU COMPTOIR SE FAIT TOUJOURS AU QUÉBEC (sa décision, 2026-10-05) :
     la liste « Province » est partie, et les taxes sont celles du Québec quelle
     que soit l adresse du client — elle ne sert plus à rien ici. */
  var PROV = 'QC';
  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }

  // ══ TOTAUX ════════════════════════════════════════════════════════════════
  // ⚠ ILS VIENNENT DU SITE, TOUJOURS — rabais compris.
  var totT = null;
  function majTotaux(){
    clearTimeout(totT);
    // Anti-rebond : plusieurs changements a la suite, un seul aller-retour.
    totT = setTimeout(function(){
      if (!LIGNES.length) { TOT = null; dessinerTotaux(); dessinerLignes(); majBouton(); return; }
      appeler('caisse:totaux', [LIGNES, PROV, val('v-liv'), val('v-rab'), RABTYPE]).then(function(r){
        if (!r.ok) { TOT = null; dire(expliquer(r.motif), 'err'); }
        else { TOT = r; dire(''); }
        dessinerTotaux(); dessinerLignes(); majBouton(); diffuser();
      });
    }, 150);
  }

  /* ⚠ L AFFICHEUR SUIT LE PANIER, ET LE MESSAGE PART DE LA FENETRE PRINCIPALE
     (caisse:diffuser) : son canal n accepte qu elle. Vide quand la vente est vide :
     le client suivant ne doit pas voir le panier du precedent. */
  function diffuser(){
    appeler('caisse:diffuser', [LIGNES, PROV, val('v-liv'), val('v-rab'), RABTYPE])
      .then(function(){ /* l afficheur ne doit jamais faire tomber la caisse */ });
  }

  function dessinerTotaux(){
    var z = document.getElementById('totaux');
    if (!TOT) {
      z.innerHTML = '<div class="vide" style="padding:1rem">' + (LIGNES.length
        ? '${T("Calcul des totaux…")}' : '${T("Les totaux s’afficheront ici.")}') + '</div>';
      return;
    }
    var brut = (TOT.sousTotalBrut != null) ? TOT.sousTotalBrut : TOT.sousTotal;
    var h = '<div class="l"><span>${T("Sous-total")}</span><span>' + argent(brut) + '</span></div>';
    if (TOT.rabaisArticles > 0) h += '<div class="l rab"><span>${T("Rabais sur les articles")}</span><span>−' + argent(TOT.rabaisArticles) + '</span></div>';
    if (TOT.rabais > 0) h += '<div class="l rab"><span>${T("Rabais sur la vente")}'
      + (TOT.rabaisType === 'pct' ? ' (' + pctTxt(TOT.rabaisValeur) + ')' : '') + '</span><span>−' + argent(TOT.rabais) + '</span></div>';
    if (TOT.livraison > 0) h += '<div class="l"><span>${T("Livraison")}</span><span>' + argent(TOT.livraison) + '</span></div>';
    (TOT.taxes || []).forEach(function(x){
      // Le taux est affiche : il permet de verifier une taxe d un coup d oeil.
      var taux = szNombre(Math.round((x.taux || 0) * 1000000) / 10000, 4);
      h += '<div class="l"><span>' + esc(x.nom) + ' (' + taux + ' %)</span><span>' + argent(x.montant) + '</span></div>';
    });
    h += '<div class="l grand"><span>${T("Total")}</span><span>' + argent(TOT.total) + '</span></div>';
    z.innerHTML = h;
  }

  function majBouton(){
    var b = document.getElementById('btn-vendre');
    // ⚠ LE NOM DU CLIENT FAIT PARTIE DES CONDITIONS : le site refuse une vente
    // anonyme, autant le dire avant d avoir tout saisi.
    var nomOk = !!val('c-nom').trim();
    var champ = document.getElementById('c-nom');
    if (champ) champ.className = (!nomOk && LIGNES.length) ? 'manque' : '';
    var pret = !!(TOT && TOT.total > 0 && LIGNES.length && nomOk && CTX && CTX.peutVendre && !enVente);
    b.disabled = !pret;
    b.textContent = enVente ? '${T("Enregistrement…")}'
      : (pret ? '${T("Enregistrer la vente —")} ' + argent(TOT.total)
              : (LIGNES.length && !nomOk ? '${T("Nom du client requis")}' : '${T("Enregistrer la vente")}'));
    document.getElementById('btn-vider').disabled = !LIGNES.length || enVente;
  }

  // ══ ARTICLES ══════════════════════════════════════════════════════════════
  // Le prix NET d une ligne : celui que le site a rendu. Tant qu il n est pas
  // arrive, on montre le prix courant — jamais un pourcentage calcule ici.
  function netDe(i){
    var t = TOT && TOT.lignes && TOT.lignes[i];
    return t ? t.prix : LIGNES[i].price;
  }

  function dessinerLignes(){
    var z = document.getElementById('lignes');
    var nb = 0; LIGNES.forEach(function(l){ nb += l.quantity; });
    document.getElementById('nb-art').textContent = nb ? String(nb) : '';
    if (!LIGNES.length) {
      z.innerHTML = '<div class="vide">${SVG_SAC}${T("Aucun article — scannez un code-barres pour commencer.")}</div>';
      return;
    }
    var garder = document.activeElement && document.activeElement.id;
    z.innerHTML = LIGNES.map(function(l, i){
      var det = [l.size, l.color].filter(Boolean).join(' / ') || '—';
      var pct = parseFloat(String(l.rabaisPct || '').replace(',', '.')) || 0;
      var net = netDe(i);
      var h = '<div class="lg' + (EDIT === i ? ' ouverte' : '') + '">'
        + '<div class="rf-prod"><span class="rf-av" aria-hidden="true">'
        + esc(String(l.name || '?').trim().charAt(0).toUpperCase() || '?') + '</span><div style="min-width:0">'
        + '<div class="rf-nom">' + esc(l.name) + '</div>'
        + '<div class="rf-sous"><span>' + esc(det) + '</span>'
        + (l.sku ? '<span>·</span><span class="rf-code">' + esc(l.sku) + '</span>' : '')
        + (pct > 0 ? '<span class="rab-pill">−' + esc(pctTxt(pct)) + '</span>' : '')
        + (pct > 0 && l.rabaisNote ? '<span class="rab-note">' + esc(l.rabaisNote) + '</span>' : '')
        + '</div></div></div>'
        + '<span class="qte"><button data-q="' + i + '" data-d="-1" aria-label="${T("Retirer un")}">−</button>'
        + '<strong class="num">' + l.quantity + '</strong>'
        + '<button data-q="' + i + '" data-d="1" aria-label="${T("Ajouter un")}">+</button></span>'
        + '<span class="px num"><span class="net">' + argent(net) + '</span>'
        + (pct > 0 ? '<span class="barre">' + argent(l.price) + '</span>' : '') + '</span>'
        + '<span class="act"><span class="tot num">' + argent(net * l.quantity) + '</span>'
        + '<button class="ico-btn' + (pct > 0 ? ' on' : '') + '" data-rab="' + i + '" title="${T("Rabais sur cet article")}" aria-label="${T("Rabais sur cet article")}">${SVG_PCT}</button>'
        + '<button class="ico-btn" data-retirer="' + i + '" title="${T("Retirer")}" aria-label="${T("Retirer")}">${SVG_X}</button></span>';
      if (EDIT === i) h += editeur(l, i, pct);
      return h + '</div>';
    }).join('');
    if (garder && EDIT >= 0) { var g = document.getElementById(garder); if (g) g.focus(); }
  }

  /* L editeur de rabais d un article : pourcentage (puces ou saisie libre) et
     REMARQUE. ⚠ Il ne calcule rien : l apercu du prix vient du site au prochain
     aller-retour, apres << Appliquer >>. */
  function editeur(l, i, pct){
    return '<div class="edit">'
      + '<div class="titre">${T("Rabais sur cet article, pour cette vente seulement")}</div>'
      + '<div class="puces">' + PUCES.map(function(p){
          return '<button type="button" data-puce="' + p + '"' + (pct === p ? ' class="on"' : '') + '>' + p + ' %</button>'; }).join('') + '</div>'
      + '<div class="g-ed">'
      + '<label class="ch"><span>${T("Pourcentage")}</span><span class="pct-champ"><input id="ed-pct" class="num" inputmode="decimal" value="' + (pct > 0 ? esc(String(l.rabaisPct)) : '') + '" placeholder="0"><i>%</i></span></label>'
      + '<label class="ch"><span>${T("Remarque")}</span><input id="ed-note" list="sugg-rab" maxlength="200" autocomplete="off" value="' + esc(l.rabaisNote || '') + '" placeholder="${T("ex. : petit défaut à la manche")}"></label>'
      + '</div>'
      + '<div class="fin"><span class="apercu">' + (pct > 0 ? '${T("Prix courant")} ' + argent(l.price) + ' → ' + argent(netDe(i)) : '${T("Prix courant")} ' + argent(l.price)) + '</span>'
      + (pct > 0 ? '<button type="button" class="mini" data-rab-retirer="' + i + '">${T("Retirer le rabais")}</button>' : '')
      + '<button type="button" class="mini" data-rab-fermer="1">${T("Fermer")}</button>'
      + '<button type="button" class="mini prim" data-rab-appliquer="' + i + '">${T("Appliquer")}</button></div>'
      + '</div>';
  }

  function appliquerRabais(i){
    var l = LIGNES[i]; if (!l) return;
    var brut = String(val('ed-pct') || '').trim();
    var n = parseFloat(brut.replace(',', '.'));
    if (brut && !(n >= 0 && n <= 100)) { dire('${T("Le pourcentage doit être entre 0 et 100.")}', 'err'); return; }
    if (!(n > 0)) { delete l.rabaisPct; delete l.rabaisNote; }
    else { l.rabaisPct = brut; l.rabaisNote = String(val('ed-note') || '').trim(); }
    EDIT = -1;
    dessinerLignes(); majTotaux();
    var s = document.getElementById('scan'); if (s) s.focus();
  }

  function ajouter(pid, taille, couleur){
    var cle = pid + '|' + (taille || '') + '|' + (couleur || '');
    var ex = null;
    for (var i = 0; i < LIGNES.length; i++) {
      if ((LIGNES[i].productId + '|' + LIGNES[i].size + '|' + LIGNES[i].color) === cle) { ex = LIGNES[i]; break; }
    }
    if (ex) { ex.quantity++; apresAjout(); return; }
    // ⚠ LE PRIX EST DEMANDE AU SITE, jamais devine ici : c est lui qui connait les
    // promotions en cours.
    appeler('caisse:article', [pid, taille, couleur]).then(function(r){
      if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
      LIGNES.push(r.ligne);
      apresAjout();
    });
  }

  function apresAjout(){
    videRecherche();
    dessinerLignes();
    majTotaux();
    var s = document.getElementById('scan');
    if (s) { s.value = ''; s.focus(); }
  }

  function videRecherche(){ document.getElementById('res').innerHTML = ''; }

  // ══ RECHERCHE ET SCAN ═════════════════════════════════════════════════════
  // ⚠ ON NE REDESSINE QUE #res : reconstruire la carte detruirait le champ ou
  // l on tape, et le lecteur enchaine parfois deux articles.
  var rechT = null;
  function chercher(texte, entree){
    clearTimeout(rechT);
    var q = String(texte || '').trim();
    if (!q) { videRecherche(); return; }
    if (!entree && q.length < 3) { videRecherche(); return; }
    rechT = setTimeout(function(){
      appeler('caisse:chercher', [q]).then(function(r){
        if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
        dire('');
        // ⚠ LE CODE EXACT GAGNE TOUJOURS : c est ce que le lecteur envoie.
        if (r.sku) { ajouter(r.sku.produitId, r.sku.taille, r.sku.couleur); return; }
        if (r.court) { videRecherche(); dire('${T("Trois caractères minimum pour chercher.")}', 'att'); return; }
        dessinerResultats(r.articles || [], q);
      });
    }, entree ? 0 : 160);
  }

  function dessinerResultats(articles, q){
    var z = document.getElementById('res');
    if (!articles.length) {
      z.innerHTML = '<div class="res"><div class="art">${T("Aucun article ne correspond à «")} ' + esc(q) + ' ».</div></div>';
      return;
    }
    z.innerHTML = '<div class="res">' + articles.map(function(a){
      // ⚠ ON NE PROPOSE PAS UNE TAILLE ABSENTE : bouton grise.
      var vars = (a.variantes || []).map(function(v){
        return '<button data-pid="' + esc(a.id) + '" data-sz="' + esc(v.taille) + '"'
          + ' data-col="' + esc(v.couleur) + '"'
          + (v.quantite <= 0 ? ' disabled title="${T("Aucun en stock")}"' : '') + '>'
          + esc(v.cle) + ' <span class="q">(' + v.quantite + ')</span></button>';
      }).join('');
      return '<div class="art"><div class="nom">' + esc(a.nom)
        + (a.code ? '<span class="code">' + esc(a.code) + '</span>' : '') + '</div>'
        + '<div class="vars">' + (vars || '<span class="q">${T("aucune variante")}</span>') + '</div></div>';
    }).join('') + '</div>';
  }

  // ══ CLIENT ════════════════════════════════════════════════════════════════
  var cliT = null;
  function chercherClient(texte){
    clearTimeout(cliT);
    // ⚠ MODIFIER L IDENTITE ROMPT LE LIEN AU COMPTE.
    CLI = null;
    majLie();
    var q = String(texte || '').trim();
    if (q.length < 3) { fermerListeCli(); return; }
    var champ = document.activeElement;
    cliT = setTimeout(function(){
      appeler('caisse:client', [q]).then(function(r){
        if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
        if (r.exact) { remplirClient(r.exact); return; }
        TROUVES = r.trouves || [];
        CLI_SEL = -1;
        dessinerListeCli(champ);
      });
    }, 160);
  }

  /* La liste flottante : sous le champ ou l on tape, de la largeur du bloc client. */
  var CLI_SEL = -1, CLI_ANCRE = null;
  function dessinerListeCli(ancre){
    var z = document.getElementById('c-res');
    if (!TROUVES.length) { fermerListeCli(); return; }
    CLI_ANCRE = (ancre && ancre.id && /^c-/.test(ancre.id)) ? ancre : document.getElementById('c-nom');
    z.innerHTML = '<div class="liste-cli" role="listbox" aria-label="${T("Clients trouvés")}">'
      + '<div class="tete-l">' + TROUVES.length + ' ' + szPl(TROUVES.length, '${T("client trouvé")}', '${T("clients trouvés")}') + '</div>'
      + TROUVES.map(function(u, i){
          var nom = u.nom || '${T("(sans nom)")}';
          var det = [u.courriel || '${T("sans courriel")}', u.tel || '']
            .concat(u.commandes > 0 ? [u.commandes + ' ' + szPl(u.commandes, '${T("commande")}', '${T("commandes")}')] : [])
            .filter(Boolean).join(' · ');
          return '<div class="cli' + (i === CLI_SEL ? ' on' : '') + '" role="option" aria-selected="' + (i === CLI_SEL) + '" data-uid="' + esc(u.id) + '">'
            + '<span class="av" aria-hidden="true">' + esc(String(nom).trim().charAt(0).toUpperCase() || '?') + '</span>'
            + '<span class="t"><div class="n">' + esc(nom) + '</div><div class="m">' + esc(det) + '</div></span></div>';
        }).join('') + '</div>';
    z.className = 'ouverte';
    placerListeCli();
  }
  function placerListeCli(){
    var z = document.getElementById('c-res');
    if (!z.className || !CLI_ANCRE) return;
    var bloc = CLI_ANCRE.closest('.champs') || CLI_ANCRE;
    var rb = bloc.getBoundingClientRect(), ra = CLI_ANCRE.getBoundingClientRect();
    z.style.left = rb.left + 'px';
    z.style.width = rb.width + 'px';
    z.style.top = (ra.bottom + 4) + 'px';
  }
  function fermerListeCli(){
    var z = document.getElementById('c-res');
    z.className = ''; z.innerHTML = ''; CLI_SEL = -1;
  }
  // Fleches, Entree, Echap dans les trois champs du client.
  function clavierCli(ev){
    var z = document.getElementById('c-res');
    if (!z.className || !TROUVES.length) return;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      CLI_SEL = (CLI_SEL + (ev.key === 'ArrowDown' ? 1 : -1) + TROUVES.length) % TROUVES.length;
      dessinerListeCli(CLI_ANCRE);
    } else if (ev.key === 'Enter' && CLI_SEL >= 0) {
      ev.preventDefault();
      remplirClient(TROUVES[CLI_SEL]);
    } else if (ev.key === 'Escape') {
      ev.preventDefault(); ev.stopPropagation();
      fermerListeCli();
    }
  }

  function remplirClient(u){
    CLI = u.id;
    document.getElementById('c-nom').value = u.nom || '';
    document.getElementById('c-mail').value = u.courriel || '';
    var tel = document.getElementById('c-tel');
    tel.value = u.tel || '';
    masquerTel(tel);
    fermerListeCli();
    majLie();
    majTotaux();
    dire('${T("Fiche de")} ' + (u.nom || u.courriel) + ' ${T("reprise.")}', 'bon');
  }

  /* ⚠ UN CLIENT DÉJÀ INSCRIT NE SE VOIT PAS PROPOSER UN COMPTE (sa demande du
     2026-10-04). La case disparaît dès que la fiche est reprise, et se décoche :
     cochée puis cachée, elle partirait quand même avec la vente. Elle revient
     si l on change d identité (le lien au compte est alors rompu). */
  function majLie(){
    document.getElementById('lie').textContent = CLI ? '${T("✓ compte lié")}' : '';
    var zc = document.getElementById('c-creer-zone');
    if (zc) zc.style.display = CLI ? 'none' : '';
    if (CLI) document.getElementById('c-creer').checked = false;
  }

  /* ⚠ MASQUE DU TELEPHONE — 000 000-0000. Il ne reformate que si le curseur est
     AU BOUT du champ : corriger un chiffre au milieu ne doit pas le renvoyer a la fin. */
  function masquerTel(el){
    var auBout = (el.selectionStart == null) || (el.selectionStart === el.value.length);
    var d = String(el.value || '').replace(/[^0-9]/g, '');
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    d = d.slice(0, 10);
    var s = d;
    if (d.length > 6) s = d.slice(0, 3) + ' ' + d.slice(3, 6) + '-' + d.slice(6);
    else if (d.length > 3) s = d.slice(0, 3) + ' ' + d.slice(3);
    if (s === el.value) return;
    el.value = s;
    if (auBout) { try { el.selectionStart = el.selectionEnd = s.length; } catch (e) {} }
  }

  function poserRabType(t){
    RABTYPE = (t === 'pct') ? 'pct' : 'montant';
    var a = document.getElementById('rt-montant'), b = document.getElementById('rt-pct');
    a.className = RABTYPE === 'montant' ? 'on' : ''; a.setAttribute('aria-pressed', String(RABTYPE === 'montant'));
    b.className = RABTYPE === 'pct' ? 'on' : ''; b.setAttribute('aria-pressed', String(RABTYPE === 'pct'));
  }

  // ══ ENREGISTRER LA VENTE ══════════════════════════════════════════════════
  function vendre(){
    if (enVente || !LIGNES.length || !TOT || !(TOT.total > 0)) return;
    enVente = true; majBouton(); dire('${T("Enregistrement…")}', 'att');
    appeler('caisse:vendre', [{
      lignes: LIGNES,
      prov: PROV, liv: val('v-liv'), rab: val('v-rab'),
      rabType: RABTYPE, rabNote: val('v-rabnote').trim(),
      nom: val('c-nom').trim(), courriel: val('c-mail').trim(), tel: val('c-tel').trim(),
      moyen: val('v-paie'), note: val('v-note').trim(), remise: val('v-remise'),
      veutCompte: !!document.getElementById('c-creer').checked,
      cliId: CLI
    }]).then(function(r){
      enVente = false;
      if (!r.ok) { majBouton(); dire(expliquer(r.motif), 'err'); return; }
      // La vente est en base : on peut vider CETTE fenetre.
      LIGNES = []; CLI = null; TOT = null; EDIT = -1;
      ['c-nom', 'c-mail', 'c-tel', 'v-note', 'v-rabnote'].forEach(function(id){ document.getElementById(id).value = ''; });
      document.getElementById('c-creer').checked = false;
      document.getElementById('v-liv').value = szArgentChamp(0);
      document.getElementById('v-rab').value = szArgentChamp(0);
      poserRabType('montant');
      majLie(); dessinerLignes(); dessinerTotaux(); majBouton(); dire('');
      diffuser();
      compteRendu(r);
    });
  }

  /* ⚠ LE COMPTE RENDU EST UN VOILE DANS CETTE FENETRE, pas une boite du systeme,
     et il DIT ce qui n a pas marche : stock non decompte, base non confirmee,
     facture non partie. */
  function compteRendu(r){
    var lignes = '';
    lignes += rangee('${T("Commande")}', esc(r.numero || '—'));
    lignes += rangee('${T("Total")}', argent(r.total));
    if (r.rabaisTotal > 0) lignes += rangee('${T("Rabais accordés")}', '−' + argent(r.rabaisTotal));
    if (r.enAttente) {
      lignes += rangee('${T("Paiement")}', '<span style="color:var(--tx-att)">${T("en attente — lien à envoyer")}</span>');
    } else {
      lignes += rangee('${T("Stock décompté")}', r.stockOk ? '${T("oui")}'
        : '<strong style="color:var(--tx-err)">${T("NON — à vérifier")}</strong>');
    }
    lignes += rangee('${T("Enregistrement en base")}', r.nuageOk ? '${T("confirmé")}'
      : '<strong style="color:var(--tx-err)">${T("non confirmé")}</strong>');
    if (r.envoiCourriel === true)  lignes += rangee('${T("Facture")}', '${T("envoyée par courriel")}');
    if (r.envoiCourriel === false) lignes += rangee('${T("Facture")}', '<strong style="color:var(--tx-err)">${T("NON envoyée")}</strong>');
    if (r.compteNeuf) lignes += rangee('${T("Compte client")}', '${T("ouvert · lien de finalisation envoyé")}');

    var lien = '';
    if (r.enAttente) {
      lien = r.lien && r.lien.url
        ? '<div class="lien"><input id="lien-url" aria-label="${T("Lien de paiement à copier")}" readonly value="' + esc(r.lien.url) + '">'
          + '<button class="mini" id="btn-copier">${T("Copier")}</button>'
          /* ⚠ LE RECOURS QUAND LA CONFIRMATION AUTOMATIQUE N ARRIVE PAS : une vente
             PAYEE chez Square et une facture restee impayee chez nous. */
          + '<button class="mini" id="btn-verif" data-hc="' + esc((r.lien && r.lien.hcId) || '')
          + '" data-cmd="' + esc(r.commandeId || '') + '">${T("↻ Vérifier le paiement")}</button></div>'
          + '<div class="aide">${T("Le stock sera décompté et la facture marquée payée quand Square")} '
          + '${T("confirmera — automatiquement au retour du client. Rien n’est encaissé par cet écran.")} '
          + '${T("S’il a payé mais que rien ne bouge, pressez ")}<strong>${T("Vérifier le paiement")}</strong>.</div>'
        : '<div class="aide" style="color:var(--tx-err)">${T("La commande est enregistrée, mais Square a refusé")} '
          + '${T("de créer le lien :")} ' + esc(r.lienMotif || '${T("raison inconnue")}') + '${T(". Réessayez depuis la")} '
          + '${T("commande, ou encaissez autrement.")}</div>';
    }

    var avis = (r.avis || []).map(function(a){
      var c = a.ton === 'error' ? 'var(--tx-err)' : (a.ton === 'warning' ? 'var(--tx-att)' : 'var(--tx-ok)');
      return '<div class="aide" style="color:' + c + '">' + esc(a.texte) + '</div>';
    }).join('');

    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite"><h3>' + (r.enAttente ? '${T("Vente")}${T(" en attente de paiement")}'
      : '${T("Vente enregistrée")}') + '</h3>' + lignes + lien + avis
      + '<div class="fin"><button class="prim" id="btn-ok">${T("Continuer")}</button></div></div>';
    document.body.appendChild(v);
    var bvf = document.getElementById('btn-verif');
    if (bvf) bvf.onclick = function(){
      var hc = bvf.getAttribute('data-hc');
      if (!hc) { dire('${T("Aucun lien de paiement a verifier.")}', 'err'); return; }
      bvf.disabled = true;
      dire('${T("Vérification auprès de Square…")}');
      appeler('caisse:verifierPaiement', [hc, bvf.getAttribute('data-cmd')]).then(function(res){
        bvf.disabled = false;
        if (!res || !res.ok) { dire(expliquer(res && res.motif), 'err'); return; }
        if (res.etat === 'paye') {
          dire('${T("Paiement confirmé")}' + (res.numero ? ' — ' + res.numero : '')
            + (res.stockOk ? ' ${T("· stock décompté.")}' : ' ${T("· stock à vérifier.")}'),
            res.stockOk ? 'bon' : 'att');
          v.remove();
          var sc = document.getElementById('scan');
          if (sc) sc.focus();
          return;
        }
        if (res.etat === 'annule') { dire('${T("Paiement annulé par le client.")}', 'att'); return; }
        if (res.etat === 'insuffisant') { dire('${T("Montant reçu INFÉRIEUR au total — à vérifier dans Square.")}', 'err'); return; }
        dire('${T("Pas encore payé. Le lien reste valide — réessayez plus tard.")}', 'att');
      });
    };

    var ok = document.getElementById('btn-ok');
    ok.onclick = function(){
      v.remove();
      var s = document.getElementById('scan');
      if (s) s.focus();
    };
    ok.focus();
    var cp = document.getElementById('btn-copier');
    if (cp) cp.onclick = function(){
      var i = document.getElementById('lien-url');
      i.select();
      // ⚠ execCommand ET NON navigator.clipboard : une fenetre chargee en data:
      // n est pas un contexte securise, l API moderne y est refusee.
      var fait = false;
      try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
      cp.textContent = fait ? '${T("✓ Copié")}' : '${T("Ctrl+C pour copier")}';
    };
  }

  function rangee(k, v){
    return '<div class="rangee"><span style="color:var(--tx2)">' + k + '</span><span>' + v + '</span></div>';
  }

  // ══ DEMARRAGE ═════════════════════════════════════════════════════════════
  function remplirListe(id, options, defaut){
    var s = document.getElementById(id);
    s.innerHTML = options.map(function(o){
      var v = (o.cle != null) ? o.cle : o;
      var t = (o.libelle != null) ? o.libelle : o;
      // Le LIBELLE se traduit (szTd), jamais la valeur envoyee au site.
      return '<option value="' + esc(v) + '"' + (v === defaut ? ' selected' : '') + '>' + esc(szTd(t)) + '</option>';
    }).join('');
  }

  function demarrer(){
    appeler('caisse:contexte').then(function(r){
      if (!r.ok) {
        // ⚠ ON DESARME L ECRAN AU LIEU DE LE LAISSER CROIRE QU IL PEUT VENDRE.
        document.getElementById('corps').innerHTML =
          '<div class="vide" style="grid-column:1/-1"><div style="font-size:1rem;color:var(--tx);margin-bottom:.4rem">'
          + '${T("Caisse indisponible")}</div>' + esc(expliquer(r.motif)) + '</div>';
        dire(expliquer(r.motif), 'err');
        return;
      }
      CTX = r;
      remplirListe('v-paie', r.paiements, 'terminal');
      remplirListe('v-remise', r.remises, 'courriel');
      document.getElementById('sous').textContent = r.par
        ? (r.par + (r.peutVendre ? '' : ' ${T("· lecture seule")}')) : '';
      if (!r.peutVendre) dire('${T("Votre rôle ne permet pas d’enregistrer une vente.")}', 'att');
      if (${rabaisTemoin ? 'true' : 'false'}) {
        /* Une vente TEMOIN, inerte : deux articles, le premier rabaisse de 25 %
           avec sa remarque, et son editeur ouvert. Rien n est enregistre. */
        LIGNES = [
          { productId: 'p_0001', name: 'Aurora', sku: 'ROB-0001-M-NOI', size: 'M', color: 'Noir', price: 129.95, quantity: 1, rabaisPct: '25', rabaisNote: '${T("Petit défaut")}' },
          { productId: 'p_0002', name: 'Lina', sku: 'HAU-0007-S-IVO', size: 'S', color: 'Ivoire', price: 89, quantity: 2 }
        ];
        EDIT = 0;
        document.getElementById('c-nom').value = 'Marie Tremblay';
        majTotaux();
      }
      dessinerLignes(); dessinerTotaux(); majBouton();
      var s = document.getElementById('scan');
      if (s) s.focus();
    });
  }

  // ── Ecouteurs ──────────────────────────────────────────────────────────────
  document.getElementById('scan').oninput = function(){ chercher(this.value, false); };
  document.getElementById('scan').onkeydown = function(ev){
    if (ev.key === 'Enter') { ev.preventDefault(); chercher(this.value, true); }
  };
  ['c-nom','c-mail'].forEach(function(id){
    document.getElementById(id).oninput = function(){ chercherClient(this.value); majBouton(); };
  });
  ['c-nom', 'c-mail', 'c-tel'].forEach(function(id){ document.getElementById(id).addEventListener('keydown', clavierCli); });
  document.addEventListener('mousedown', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('#c-res') || (t.id && /^c-(nom|mail|tel)$/.test(t.id))) return;
    fermerListeCli();
  });
  // ⚠ La liste est en position fixe : elle suit son champ quand la colonne defile.
  document.addEventListener('scroll', placerListeCli, true);
  window.addEventListener('resize', placerListeCli);
  document.getElementById('c-tel').oninput = function(){
    masquerTel(this);
    chercherClient(this.value);
  };
  ['v-liv','v-rab'].forEach(function(id){
    document.getElementById(id).onchange = function(){ majTotaux(); };
  });
  document.getElementById('rt-montant').onclick = function(){ if (RABTYPE !== 'montant') { poserRabType('montant'); majTotaux(); } };
  document.getElementById('rt-pct').onclick = function(){ if (RABTYPE !== 'pct') { poserRabType('pct'); majTotaux(); } };
  document.getElementById('btn-vendre').onclick = vendre;
  document.getElementById('btn-vider').onclick = function(){
    LIGNES = []; TOT = null; EDIT = -1; videRecherche();
    document.getElementById('v-rab').value = szArgentChamp(0);
    document.getElementById('v-rabnote').value = '';
    poserRabType('montant');
    dessinerLignes(); dessinerTotaux(); majBouton(); dire(''); diffuser();
    var s = document.getElementById('scan'); if (s) s.focus();
  };
  document.getElementById('btn-afficheur').onclick = function(){
    var b = this;
    b.disabled = true;
    appeler('caisse:affichage').then(function(r){
      b.disabled = false;
      if (!r.ok) { dire(expliquer(r.motif), 'err'); return; }
      // ⚠ ON DIFFUSE TOUT DE SUITE APRES L OUVERTURE, sinon l afficheur montrerait
      // le panier vide de la caisse du site pendant la vente en cours.
      diffuser();
      dire('${T("Affichage client ouvert.")}', 'bon');
    });
  };

  // ⚠ ECOUTEURS DELEGUES : les boutons sont redessines a chaque changement.
  document.getElementById('corps').addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var v = t.closest('.vars button');
    if (v && !v.disabled) { ajouter(v.getAttribute('data-pid'), v.getAttribute('data-sz'), v.getAttribute('data-col')); return; }
    var q = t.closest('[data-q]');
    if (q) {
      var i = parseInt(q.getAttribute('data-q'), 10);
      var d = parseInt(q.getAttribute('data-d'), 10);
      if (LIGNES[i]) { LIGNES[i].quantity = Math.max(1, LIGNES[i].quantity + d); dessinerLignes(); majTotaux(); }
      return;
    }
    var rb = t.closest('[data-rab]');
    if (rb) {
      var k = parseInt(rb.getAttribute('data-rab'), 10);
      EDIT = (EDIT === k) ? -1 : k;
      dessinerLignes();
      var ep = document.getElementById('ed-pct'); if (ep) ep.focus();
      return;
    }
    var pu = t.closest('[data-puce]');
    if (pu) {
      var champ = document.getElementById('ed-pct');
      if (champ) champ.value = pu.getAttribute('data-puce');
      var tous = document.querySelectorAll('[data-puce]');
      for (var m = 0; m < tous.length; m++) tous[m].className = (tous[m] === pu) ? 'on' : '';
      var en = document.getElementById('ed-note'); if (en) en.focus();
      return;
    }
    var ap = t.closest('[data-rab-appliquer]');
    if (ap) { appliquerRabais(parseInt(ap.getAttribute('data-rab-appliquer'), 10)); return; }
    var rr2 = t.closest('[data-rab-retirer]');
    if (rr2) {
      var j = parseInt(rr2.getAttribute('data-rab-retirer'), 10);
      if (LIGNES[j]) { delete LIGNES[j].rabaisPct; delete LIGNES[j].rabaisNote; }
      EDIT = -1; dessinerLignes(); majTotaux();
      return;
    }
    if (t.closest('[data-rab-fermer]')) { EDIT = -1; dessinerLignes(); return; }
    var rr = t.closest('[data-retirer]');
    if (rr) {
      LIGNES.splice(parseInt(rr.getAttribute('data-retirer'), 10), 1);
      EDIT = -1;
      dessinerLignes(); majTotaux();
      return;
    }
    var c = t.closest('.cli');
    if (c) {
      var uid = c.getAttribute('data-uid');
      // La fiche COMPLETE est deja la, retenue au moment du dessin.
      for (var n = 0; n < TROUVES.length; n++) {
        if (TROUVES[n].id === uid) { remplirClient(TROUVES[n]); return; }
      }
      dire('${T("Fiche introuvable — relancez la recherche.")}', 'err');
    }
  });
  // Entree dans l editeur de rabais = Appliquer.
  document.getElementById('corps').addEventListener('keydown', function(ev){
    if (ev.key !== 'Enter' || EDIT < 0) return;
    var id = ev.target && ev.target.id;
    if (id === 'ed-pct' || id === 'ed-note') { ev.preventDefault(); appliquerRabais(EDIT); }
  });

  // Echap ferme d abord l editeur de rabais, puis la fenetre — jamais un voile ouvert.
  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape' || document.querySelector('.voile')) return;
    ev.preventDefault();
    if (EDIT >= 0) { EDIT = -1; dessinerLignes(); return; }
    P.fermer();
  });

  (function(){ var z = document.getElementById('c-res'); if (z && z.parentNode !== document.body) document.body.appendChild(z); })();
  // Le clic sur un client : la liste n est plus dans #corps, elle a son propre ecouteur.
  document.getElementById('c-res').addEventListener('click', function(ev){
    var c = ev.target && ev.target.closest ? ev.target.closest('.cli') : null;
    if (!c) return;
    var uid = c.getAttribute('data-uid');
    for (var n = 0; n < TROUVES.length; n++) { if (TROUVES[n].id === uid) { remplirClient(TROUVES[n]); return; } }
    dire('${T("Fiche introuvable — relancez la recherche.")}', 'err');
  });
  demarrer();
  if (${attenteTemoin ? 'true' : 'false'}) {
    /* Un compte rendu TEMOIN, avec un paiement en attente : le seul etat qui
       dessine le lien, << Copier >> et << Verifier le paiement >>. */
    compteRendu({ numero: 'SZ-100252', total: 149.95, enAttente: true,
      commandeId: 'ord_temoin', paiement: 'lien',
      lien: { url: 'https://square.link/u/TEMOIN', hcId: 'hc_temoin' },
      envoiCourriel: true, compteNeuf: false,
      avis: [{ ton: 'warning', texte: '${T("Temoin : aucune vente n a eu lieu.")}' }] });
  }
})();
</script>
</body></html>`;
}

module.exports = { pageCaisse };
