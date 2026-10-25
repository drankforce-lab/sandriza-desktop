'use strict';

/*
 * FENÊTRE « ANALYSES DE FIBRES ET ÉTIQUETTES » — NATIVE (2026-10-25)
 * =============================================================================
 * Sa demande : une photo de surface au microscope (1200×) → la composition des
 * fibres, rattachée à un produit (ou à un NOM PROVISOIRE quand le produit n'est
 * pas encore créé), puis des étiquettes bilingues conformes, imprimées sur
 * papier de transfert thermique, découpées au Cricut (21 par feuille) ou aux
 * ciseaux (32). Esquisses approuvées : https://claude.ai/artifact/L8LS7JfrhWwrRcunzqgmBb
 *
 * TROIS VUES : la BANQUE des analyses (cocher pour une planche), l'ANALYSE
 * (photos → lecture de l'IA → composition confirmée → produit et étiquette),
 * la PLANCHE (combien de chaque, par taille → feuilles → export).
 *
 * ⚠ LA FENÊTRE NE COMPOSE AUCUN TEXTE D'ÉTIQUETTE. Composition, consignes,
 * pays, « CA xxxxxxx » : tout vient du site (assets/js/fibres.js, ops fibres:*).
 * Ici, on DESSINE ces lignes, centrées (sa consigne : l'étiquette va au bas du
 * col), et on fabrique les fichiers.
 *
 * ⚠ LES PHOTOS NE SONT PAS GARDÉES (sa consigne : « je veux garder que les
 * résultats ») : réduites ici, envoyées par fibres:analyser, puis oubliées.
 *
 * ⚠ UNE FEUILLE = UN PAPIER (sa règle : 15 noires et 15 blanches font deux
 * planches). Le site sépare les feuilles ; la fenêtre ne les mélange jamais.
 *
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script : elle
 * vit dans un littéral de gabarit. Les sauts de ligne se font par
 * String.fromCharCode(10).
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const LANGUE = require('../langue');
const T = LANGUE.tr('fibres');

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
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
#corps{overflow:hidden}
/* ⚠ PAR L IDENTIFIANT, comme Rappels : le socle fixe les enfants de .cx (flex:0 0 auto), une classe seule perd. */
#corps>.duo,#corps>.pl,#corps>.assist{flex:1 1 0;min-height:0}
select,input,button,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.28rem .5rem;cursor:pointer}
input,textarea{cursor:text}
input[type=checkbox]{width:auto;padding:0;cursor:pointer}
textarea{resize:none}
select:focus,input:focus,button:focus,textarea:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.mini{padding:.1rem .42rem;font-size:.74rem}
button.danger{border-color:rgba(248,113,113,.45);color:var(--tx-err2)}
.gris{color:var(--tx2)}.bon{color:var(--tx-ok)}.mauvais{color:var(--tx-err2)}.attn{color:var(--tx-att)}
.aide{font-size:.76rem;color:var(--tx2);line-height:1.45}
.appel{display:flex;flex-direction:column;align-items:center;gap:.6rem;padding:1.6rem 1rem;text-align:center}
.appel strong{font-size:.98rem}
.appel .aide{max-width:36rem}
.boutons{display:flex;gap:.5rem;justify-content:flex-end;align-items:center;margin-top:.55rem;flex-wrap:wrap}
.boutons .gauche{margin-right:auto}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.pages{display:flex;align-items:center;gap:.4rem;margin-left:auto;font-size:.74rem;font-weight:400;color:var(--tx2)}
.pages button.pgf{min-width:1.9rem;padding:.08rem .45rem;font-size:.95rem;line-height:1.1}
.puces{display:flex;gap:.35rem;flex-wrap:wrap;align-items:center}
.puce{padding:.18rem .62rem;border-radius:999px;font-size:.76rem;background:var(--v05);border:1px solid var(--v12)}
.puce[aria-pressed=true]{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:650}
.champ{display:flex;flex-direction:column;gap:.16rem;min-width:0}
.champ label,.lbl{font-size:.71rem;color:var(--tx2)}
.champ input,.champ select,.champ textarea{width:100%;min-width:0}
.case{display:flex;align-items:center;gap:.4rem;font-size:.78rem;cursor:pointer}
.cx-carte h2{display:flex;align-items:center;gap:.5rem}

/* ── LA BANQUE ───────────────────────────────────────────────────────────── */
.filtres{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.7rem}
.filtres .q{margin-left:auto;display:flex;align-items:center;gap:.4rem}
.filtres .q input{width:14rem}
.duo{display:grid;grid-template-columns:minmax(0,1fr) 22rem;gap:.9rem;flex:1 1 0;min-height:0;
  grid-template-rows:minmax(0,1fr);align-items:stretch}
.duo>div{display:flex;flex-direction:column;gap:.9rem;min-width:0;min-height:0}
.duo>div>.cx-carte.liste{flex:1 0 auto;overflow:visible}
/* Le détail défile dans SA colonne : sinon sa hauteur fait déborder la page et la liste perd des lignes. */
.duo>div:last-child{overflow:auto;padding-right:.15rem}
.ent,.ana{display:grid;grid-template-columns:1.6rem 5.2rem minmax(0,1fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,.9rem) 5.4rem 6.4rem;
  gap:.6rem;align-items:center;padding:.45rem .55rem}
.ent{font-size:.68rem;font-weight:650;color:var(--tx2);text-transform:uppercase;letter-spacing:.04em}
.ana{border-top:1px solid var(--v08);font-size:.82rem;border-radius:8px}
.ana:hover{background:var(--v03)}
.ana.sel{background:rgba(var(--or-rgb),.10)}
.ana .no{font-family:Consolas,monospace;font-size:.76rem}
.ana .cel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.ana .prov{font-style:italic}
.ana .compo{font-weight:600}
.ent .rq,.ana .rq{grid-column:6/7;display:none}
.ana .rem{font-size:.74rem;color:var(--tx2)}
/* La pastille du papier en texte plein : en gris (--tx2) sur la ligne choisie, elle tombait à 4.46 la nuit. */
.ana .rf-pill.papier{color:var(--tx)}
.ent,.ana{grid-template-columns:1.6rem 5.2rem minmax(0,1fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1fr) 4.4rem 5.4rem 6.4rem}
.ana .nb{font-variant-numeric:tabular-nums;text-align:right}
.ent .nb{text-align:right}
/* ── L HISTORIQUE ──────────────────────────────────────────────────────── */
.imp{border-top:1px solid var(--v08);padding:.5rem .3rem}
.imp .t{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;font-size:.82rem}
.imp .t strong{font-variant-numeric:tabular-nums}
.imp ul{margin:.3rem 0 0;padding-left:1.1rem;font-size:.78rem;line-height:1.5}
.imp .sup{text-decoration:line-through;color:var(--tx3)}
.ent .rq,.ana .rq{display:block}
.detail{display:flex;flex-direction:column;gap:.55rem}
.detail .ligne{font-size:.8rem;line-height:1.45}
.detail .ligne b{display:block;font-size:.7rem;color:var(--tx2);font-weight:600;text-transform:uppercase;letter-spacing:.04em}
.apercu{display:flex;justify-content:center;padding:.6rem;border-radius:10px;background:var(--v04);border:1px solid var(--v08)}
.apercu canvas{display:block}
.lecture-txt{font-size:.78rem;line-height:1.5}
.filtres .q #f-scan{width:11rem}
/* Le bandeau de l analyse retrouvée par le scan : le produit, en grand. */
.trouve{display:flex;flex-direction:column;gap:.1rem;padding:.6rem .75rem;border-radius:10px;background:rgba(34,197,94,.10);border:1px solid rgba(34,197,94,.32)}
.trouve span{font-size:.7rem;color:var(--tx-ok);font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.trouve strong{font-size:1.1rem}
html.jour .trouve span{color:#1b5631}
/* Deux lignes au plus dans le détail (le texte entier au survol) : la colonne ne défile pas. */
.coupe2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.coupe1{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.coupe3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.detail{gap:.4rem}

/* ── L'ANALYSE ───────────────────────────────────────────────────────────── */
/* L ASSISTANT EN TROIS ÉTAPES (2026-10-25, « trop condensé ») : l étape à gauche, l aperçu à droite. */
.assist{display:grid;grid-template-columns:minmax(0,1fr) 25rem;gap:1.1rem;flex:1 1 0;min-height:0}
.et-gauche{display:flex;flex-direction:column;gap:1rem;min-width:0;min-height:0}
.et-droite{min-width:0}
.etapes{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.et-b{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem .85rem;border-radius:999px;font-size:.84rem;background:var(--v04);border:1px solid var(--v12)}
.et-b .num{display:inline-flex;align-items:center;justify-content:center;width:1.45rem;height:1.45rem;border-radius:50%;font-size:.76rem;font-weight:700;background:var(--v10)}
.et-b[aria-current=step]{background:rgba(var(--or-rgb),.14);border-color:var(--or);font-weight:650}
.et-b[aria-current=step] .num{background:var(--or);color:#1a1208}
.et-sep{color:var(--tx3)}
.et-deux{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1.1rem;align-items:start}
.et-compo{display:grid;grid-template-columns:minmax(17rem,1fr) minmax(0,1.45fr);gap:1.1rem;align-items:start}
.et-gauche .cx-carte{padding:1.15rem 1.25rem}
.et-gauche .cx-carte h2{margin-bottom:.85rem}
.ent-grille{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.4rem 1.2rem}
.ent-grille .grpent{margin-bottom:.85rem}
.ent-grille .puces{gap:.4rem}
.cote{display:flex;flex-direction:column;gap:.9rem}
.cote .apercu{padding:1rem}
.manques{display:flex;flex-direction:column;gap:.35rem;font-size:.82rem}
.manque.attn{color:var(--tx-att)}
.boutons.nav{margin-top:.2rem}
.boutons.nav #f-ok{margin-left:auto}
/* Les cartes gardent leur hauteur : c est la COLONNE qui défile, jamais une carte rognée. */
.pl>div:first-child>*,.duo>div:last-child>*{flex:0 0 auto}
.depot{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.45rem;min-height:11rem;
  border:1.5px dashed var(--v20);border-radius:12px;text-align:center;padding:.8rem;cursor:pointer;background:var(--v03)}
.depot.compact{min-height:5.5rem}
.depot.survol{border-color:var(--or);background:rgba(var(--or-rgb),.08)}
.vignettes{display:flex;gap:.45rem;flex-wrap:wrap}
.vig{position:relative;width:5.2rem;height:3.9rem;border-radius:8px;overflow:hidden;border:1px solid var(--v12)}
.vig img{width:100%;height:100%;object-fit:cover;display:block}
.vig button{position:absolute;top:.15rem;right:.15rem;padding:0 .3rem;font-size:.7rem;line-height:1.3;background:var(--f-page);color:var(--tx);border-color:var(--v16)}
.etape{border:1px solid var(--v08);border-radius:10px;padding:.55rem .75rem;background:var(--v03);margin-bottom:.55rem}
.etape h3{margin:0 0 .15rem;font-size:.74rem;color:var(--tx-or);font-weight:700}
.etape p{margin:0;font-size:.79rem;line-height:1.45}
.estim{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;border-radius:10px;padding:.55rem .7rem;
  background:rgba(var(--or-rgb),.12);border:1px solid rgba(var(--or-rgb),.35)}
.estim strong{font-size:1rem}
.avert{font-size:.76rem;line-height:1.45;border-radius:10px;padding:.5rem .65rem;
  background:rgba(251,191,36,.10);border:1px solid rgba(251,191,36,.35)}
/* SA RÈGLE DES 95 % (2026-10-25) : sous le seuil, l encadré dit pourquoi et propose une seconde analyse. */
.nonconcl{border-radius:10px;padding:.6rem .75rem;margin-top:.55rem;font-size:.79rem;line-height:1.45;
  background:rgba(251,191,36,.10);border:1px solid rgba(251,191,36,.40)}
.nonconcl h3{margin:0 0 .25rem;font-size:.86rem;color:var(--tx-att)}
.nonconcl p{margin:.15rem 0}
.nonconcl .boutons{margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap;justify-content:flex-start;align-items:center}
.fib{display:grid;grid-template-columns:minmax(0,1fr) 4.6rem 1.9rem;gap:.5rem;align-items:center;margin-bottom:.55rem}
.fib input{text-align:right}
.total{display:flex;justify-content:space-between;align-items:center;font-size:.78rem}
.grpent{display:flex;flex-direction:column;gap:.25rem}
.grpent .t{font-size:.7rem;color:var(--tx2);font-weight:600}
.soin{display:inline-flex;align-items:center;gap:.35rem;padding:.22rem .65rem .22rem .4rem;border-radius:999px;font-size:.76rem;
  background:var(--v05);border:1px solid var(--v12)}
.soin svg{width:17px;height:17px;flex:0 0 auto}
.soin span{text-align:left}
.soin[aria-pressed=true]{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:600}
.deux{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.res{display:flex;flex-direction:column;gap:.2rem;max-height:11rem;overflow:auto;border:1px solid var(--v10);border-radius:8px;padding:.25rem}
.res button{text-align:left;border-color:transparent;background:transparent;font-size:.78rem}
.res button:hover{background:var(--v08)}
.choisi{display:flex;align-items:center;gap:.5rem;justify-content:space-between;border:1px solid var(--v12);border-radius:8px;padding:.35rem .5rem;font-size:.8rem}

/* ── LA PLANCHE ──────────────────────────────────────────────────────────── */
.pl{display:grid;grid-template-columns:minmax(0,27rem) minmax(0,1fr);gap:.9rem;flex:1 1 0;min-height:0}
.pl>div{display:flex;flex-direction:column;gap:.8rem;min-width:0;min-height:0}
.pl>div:first-child{overflow:auto;padding-right:.15rem}
.lot{display:grid;grid-template-columns:.8rem minmax(0,1fr) 6.6rem 7.2rem 1.6rem;gap:.45rem;align-items:center;
  border:1px solid var(--v08);border-radius:10px;padding:.4rem .5rem}
.lot .pap{width:.8rem;height:.8rem;border-radius:50%;border:1px solid var(--v30,var(--v20))}
.lot .nom{font-size:.8rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lot .sous{font-size:.72rem;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pas{display:flex;align-items:center;border:1px solid var(--v16);border-radius:8px;overflow:hidden}
/* ⚠ LE SOCLE A SA PROPRE .pas (la barre d étapes : marges, retour à la ligne) : ici, par .lot, le compteur reste
   sur UNE ligne — empilé (− / 1 / +) sous 1100 px, il triplait la hauteur de chaque ligne et la liste défilait. */
.mini.dup{padding:.05rem .55rem;font-size:.72rem}
.lot .pas{flex-wrap:nowrap;flex-direction:row;gap:0;padding:0;background:transparent;min-width:0}
.lot .pas button{padding:.1rem .45rem;font-size:.86rem;border:0;border-radius:0;background:transparent}
.pas button{border:0;border-radius:0;padding:.1rem .5rem;background:transparent;line-height:1.2}
.pas input{border:0;border-radius:0;width:3.2rem;min-width:48px;text-align:center;padding:.15rem 0;background:transparent}
.feuilles{display:flex;gap:.4rem;flex-wrap:wrap}
.scene{flex:1 1 0;min-height:0;display:flex;gap:1rem;align-items:flex-start}
.scene .plan{flex:0 0 auto;border-radius:6px;box-shadow:0 2px 14px rgba(0,0,0,.35)}
.scene .note{font-size:.78rem;line-height:1.5;color:var(--tx2);display:flex;flex-direction:column;gap:.5rem;max-width:20rem}
.badge{align-self:flex-start;padding:.18rem .6rem;border-radius:999px;font-size:.72rem;font-weight:650;
  background:rgba(251,191,36,.16);color:var(--tx-att)}
/* ⚠ .et-deux GARDE SES DEUX COLONNES sous 1100 px : empilées, la photo et la lecture sortaient par le bas (banc à 1080 × 700). */
@media (max-width:1100px){.assist{grid-template-columns:minmax(0,1fr) 21rem}.et-compo{grid-template-columns:1fr}.duo{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Analyses de fibres et étiquettes ».
 * `ouverture` : '' (la banque), ou un état qui ne s'atteint autrement qu'au clic
 * — 'nouvelle' (une analyse vierge), 'modifier' (la première analyse ouverte),
 * 'composition' et 'produit' (la première analyse, à son étape 2 ou 3),
 * 'planche' (les analyses confirmées, en planche), 'historique' (l historique d impression).
 * ⚠ Ils existent pour le garde-fou de rendu, qui ne simule aucun clic.
 */
function pageFibres(ouverture) {
  const ok = ['nouvelle', 'modifier', 'composition', 'produit', 'planche', 'historique'];
  const etat = ok.indexOf(String(ouverture || '')) >= 0 ? String(ouverture) : '';
  const en = LANGUE.langueCourante() === 'en';
  return `${TETE()}
<title>${T("Analyses de fibres — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.fibres || ICO.atelier || ''}</span><h1>${T("Analyses de fibres et étiquettes")}</h1>
  <span class="cx-resume" id="sous"></span><div class="cx-actions" id="outils"></div></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<input type="file" id="f-fichier" accept=".jpg,.jpeg,.png,.webp" multiple aria-label="${T("Choisir des photos")}" style="display:none">
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var elOutils = document.getElementById('outils');
  var elSous = document.getElementById('sous');
  var EN = ${en ? 'true' : 'false'};
  var NL = String.fromCharCode(10);

  var D = null;                /* fibres:donnees */
  var ETAT = '${etat}';
  var VUE = 'banque';          /* banque | analyse | planche */
  var OCCUPE = false;
  var PA = false, PM = false, PS = false;
  var FILTRE = 'toutes', Q = '', PG = 0, BU = 0;
  var COCHES = {};             /* id -> true : les analyses choisies pour une planche */
  var CHOIX = '';              /* la ligne montrée à droite */
  var APERCU_CHOIX = null;     /* son étiquette (fibres:apercu) */
  var FORM = null;             /* l analyse en cours de saisie */
  var ETAPE = 1;               /* son étape : 1 photo et lecture, 2 composition et entretien, 3 produit et étiquette */
  var PHOTOS = [];             /* data URL réduites — JAMAIS enregistrées */
  var LECTURE_EN_COURS = false;
  var RES = null;              /* résultats de la recherche de produit */
  var SCANNE = '';             /* l analyse retrouvée par le dernier scan (bandeau dans le détail) */
  var PL = null;               /* la planche */

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas de modifier les analyses de fibres.")}',
    indisponible:       '${T("Le module des analyses de fibres n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette analyse n’existe plus — elle a peut-être été retirée depuis un autre poste. La liste a été relue.")}',
    produit:            '${T("Ce produit n’existe plus dans l’inventaire. Choisissez-en un autre ou écrivez un nom provisoire.")}',
    produit_ou_nom:     '${T("Choisissez un produit de l’inventaire, ou écrivez un nom provisoire.")}',
    composition_total:  '${T("La composition doit faire exactement 100 %.")}',
    composition_double: '${T("Une fibre est inscrite deux fois.")}',
    composition_pct:    '${T("Un pourcentage dépasse 100 %.")}',
    photo:              '${T("Ajoutez au moins une photo (JPEG, PNG ou WEBP).")}',
    photo_lourde:       '${T("Une photo est trop lourde, même réduite. Essayez une autre image.")}',
    cle_absente:        '${T("La clé d’API d’Anthropic n’est pas posée (Configuration › Clés API).")}',
    budget:             '${T("Le plafond mensuel de l’IA est atteint (Configuration › Clés API).")}',
    json_illisible:     '${T("L’IA a répondu dans un format illisible. Relancez la lecture.")}',
    injoignable:        '${T("Le relais IA est injoignable. Vérifiez la connexion.")}',
    ia:                 '${T("La lecture par l’IA a échoué.")}',
    nuage:              '${T("Le nuage a refusé l’écriture : rien n’a été enregistré. Vérifiez la connexion, puis refaites le geste.")}',
    vide:               '${T("Rien à noter.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').');
    if (m === 'composition_total' && r.total != null) t += ' ${T("Total actuel :")} ' + r.total + ' %.';
    if (r && r.detail && (m === 'echec' || m === 'ia' || m === 'injoignable')) t += ' (' + String(r.detail).slice(0, 150) + ')';
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

  /* ── Les libellés venus du site (on AFFICHE la langue du poste, on ENVOIE la clé) ── */
  function nomFibre(k){ var L = (D && D.fibres) || []; for (var i = 0; i < L.length; i++) if (L[i].cle === k) return EN ? L[i].en : L[i].fr; return k || ''; }
  function nomPays(k){ var L = (D && D.pays) || []; for (var i = 0; i < L.length; i++) if (L[i].cle === k) return EN ? (L[i].nomEn || L[i].nom) : L[i].nom; return k || ''; }
  function soin(k){ var L = (D && D.entretien) || []; for (var i = 0; i < L.length; i++) if (L[i].cle === k) return L[i]; return null; }
  function analyse(id){ var L = (D && D.analyses) || []; for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i]; return null; }
  function fond(k){ var L = (D && D.fonds) || []; for (var i = 0; i < L.length; i++) if (L[i].cle === k) return L[i]; return L[0] || { cle: 'fonce', fond: '#1C1C1E', encre: '#FFFFFF', miroir: false }; }
  function nomProduit(a){ return a.produit ? a.produit.nom : (a.nomProvisoire || ''); }
  var CONF = { faible: '${T("faible")}', moyenne: '${T("moyenne")}', elevee: '${T("élevée")}' };

  /* ══ LE DESSIN DE L ÉTIQUETTE (canevas) ═════════════════════════════════════
     Proportions de l esquisse approuvée (380 × 228 pour 50 × 30 mm) : u = h / 228.
     Quatre blocs centrés : composition (avec la taille à gauche), consignes,
     symboles, pied (pays, puis le petit logo et SANDRIZA · CA). */
  var ICOS = {};
  function cleIco(code, encre){ return code + '|' + encre; }
  function prepIcones(codes, encre){
    var att = [];
    if (typeof Image === 'undefined') return Promise.resolve();
    codes.forEach(function(code){
      var k = cleIco(code, encre);
      if (ICOS[k]) { if (!ICOS[k].pret) att.push(ICOS[k].p); return; }
      var s = soin(code); if (!s || !s.ico) return;
      /* ⚠ Un SVG chargé comme IMAGE exige son espace de noms (en ligne dans la page, il s en passe). */
      var svg = String(s.ico).split('currentColor').join(encre).split('width="24" height="24"').join('width="240" height="240"');
      if (svg.indexOf('xmlns=') < 0) svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
      var im = new Image();
      var o = { im: im, pret: false };
      o.p = new Promise(function(res){ im.onload = function(){ o.pret = true; res(); }; im.onerror = function(){ res(); }; });
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      ICOS[k] = o; att.push(o.p);
    });
    return Promise.all(att);
  }
  /* La police de l étiquette : celle de la fenêtre (Segoe UI sur Windows), lue au rendu. */
  /* La police du petit logo : un NOM DE POLICE, pas un texte (rien à traduire). */
  var SZ_DONNEES = { serif: 'Georgia,"Times New Roman",serif' };
  var POLICE = (window.getComputedStyle && document.body && getComputedStyle(document.body).fontFamily) || 'sans-serif';
  function ajuster(ctx, txt, poids, taille, max){
    ctx.font = poids + ' ' + taille + 'px ' + POLICE;
    var w = ctx.measureText(txt).width;
    if (w > max && w > 0) { taille = taille * max / w; ctx.font = poids + ' ' + taille + 'px ' + POLICE; }
    return taille;
  }
  function rectArrondi(ctx, x, y, w, h, r){
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  /* opts.miroir : retourner (export papier transparent) ; opts.bord : liseré d aperçu (rien à l export). */
  function peindreEtiquette(ctx, e, x, y, w, h, opts){
    var o = opts || {};
    var u = h / 228;
    ctx.save();
    if (o.miroir) { ctx.translate(x + w, y); ctx.scale(-1, 1); } else ctx.translate(x, y);
    /* (2026-10-25, sa demande : une coupe Cricut PROPRE, sans résidu de papier) des coins arrondis d environ 1,6 mm :
       la lame tourne au lieu de pivoter sur un angle vif (pas de petite languette de papier), et le coin se décolle
       moins au lavage. C est aussi le contour que Design Space coupe : la forme peinte EST la ligne de coupe. */
    rectArrondi(ctx, 0, 0, w, h, 12 * u);
    ctx.fillStyle = e.couleurFond; ctx.fill();
    if (o.bord) { ctx.lineWidth = Math.max(1, u); ctx.strokeStyle = 'rgba(128,128,128,.55)'; ctx.stroke(); }
    var encre = e.couleurEncre;
    ctx.fillStyle = encre; ctx.textBaseline = 'alphabetic';
    var dispo = w - 32 * u;
    var compo = e.compo || [], soins = e.soins || [], sym = e.symboles || [];
    /* À l APERÇU seulement : une composition pas encore confirmée se dit, en pâle (jamais à l export). */
    var videC = !compo.length && o.bord;
    if (videC) compo = ['${T("COMPOSITION À CONFIRMER")}'];
    /* Hauteurs des blocs, puis l espace libre réparti également entre eux. */
    var fsC = 17 * u, lhC = 1.12;
    /* (2026-10-25, sa demande) LA CASE TAILLE SUIT LA COMPOSITION : plus grande quand il y a plusieurs lignes,
       jamais sous 36. LA TAILLE A TOUJOURS PRIORITÉ (sa règle) : la case se calcule sur la police de départ, et quand
       la place manque — en hauteur comme en largeur — c est la COMPOSITION qui se resserre, jamais la case. */
    function tailleBoite(){ return e.taille ? Math.max(36 * u, Math.min(46 * u, compo.length * 17 * u * lhC * 0.82)) : 0; }
    var hC = Math.max(tailleBoite(fsC), compo.length * fsC * lhC);
    var fsS = 10.5 * u, lhS = 1.38, hS = soins.length * fsS * lhS;
    var tI = 26 * u, hI = sym.length ? tI : 0;
    /* (2026-10-25, sa demande : « espace la distance et grossis un peu ») le pied plus grand et plus aéré. */
    var fsP = 11.5 * u, lhP = 1.7, hP = 2 * fsP * lhP;
    /* 5. LE CODE-BARRES DU NUMÉRO D ANALYSE (2026-10-25, sa demande : « sur la longueur, sous SANDRIZA », discret).
       Le site l encode (Code 128, celui des étiquettes de produits) ; ici on le dessine. Module de 0,254 mm
       (3 points à 300 ppp : des bords francs, lisibles à travers le tissu), barres de 2,5 mm. */
    var aCode = !!(e.barres && e.barres.length && e.modules);
    var hB = aCode ? 2.5 * 7.6 * u + 6 * u : 0;
    var blocs = [hC, hS, hI, hP, hB].filter(function(v){ return v > 0; });
    var somme = blocs.reduce(function(s, v){ return s + v; }, 0);
    /* (2026-10-25, sa demande : « 3 compositions doivent aussi entrer ») TROP HAUT : la composition et les consignes
       rapetissent ensemble, juste assez pour garder un écart de 5 entre les blocs (jamais sous 70 % de leur taille). */
    var manque = somme + 28 * u + 5 * u * (blocs.length - 1) - h;
    if (manque > 0 && (hC + hS) > 0) {
      var kf = Math.max(0.7, (hC + hS - manque) / (hC + hS));
      fsC *= kf; fsS *= kf;
      hC = Math.max(tailleBoite(fsC), compo.length * fsC * lhC);
      hS = soins.length * fsS * lhS;
      blocs = [hC, hS, hI, hP, hB].filter(function(v){ return v > 0; });
      somme = blocs.reduce(function(s, v){ return s + v; }, 0);
    }
    var ecart = blocs.length > 1 ? Math.max(0, (h - 28 * u - somme) / (blocs.length - 1)) : 0;
    // Peu de blocs (étiquette en cours) : l ensemble est centré, au lieu de coller au haut.
    var yy = 14 * u;
    if (blocs.length <= 2) { ecart = Math.min(ecart, 22 * u); yy = Math.max(14 * u, (h - somme - ecart * (blocs.length - 1)) / 2); }
    /* 1. LA COMPOSITION, la taille dans son carré à gauche ; le groupe est centré. */
    if (hC) {
      ctx.font = '700 ' + fsC + 'px ' + POLICE;
      var lmax = 0; compo.forEach(function(l){ lmax = Math.max(lmax, ctx.measureText(l).width); });
      var boite = tailleBoite(fsC), esp = e.taille ? 6 * u : 0;
      /* Une taille longue (6XL, 10/12…) : la case S ÉLARGIT en rectangle au lieu de rapetisser la lettre. */
      var lb = boite, fT0 = 0;
      if (e.taille) {
        fT0 = boite * (String(e.taille).length > 2 ? 0.56 : 0.62);
        ctx.font = '800 ' + fT0 + 'px ' + POLICE; lb = Math.max(boite, ctx.measureText(e.taille).width + 9 * u);
        ctx.font = '700 ' + fsC + 'px ' + POLICE;
      }
      var tot = lb + esp + lmax;
      if (tot > dispo && lmax > 0) { var k = Math.max(0.55, (dispo - lb - esp) / lmax); fsC = fsC * k; ctx.font = '700 ' + fsC + 'px ' + POLICE; lmax = lmax * k; tot = lb + esp + lmax; }
      // De la place en largeur : la case s écarte du texte (jusqu à 16) ; serré, elle reste à 6.
      else if (e.taille) { esp = Math.max(6 * u, Math.min(16 * u, (dispo - lb - lmax) * 0.25)); tot = lb + esp + lmax; }
      var x0 = (w - tot) / 2;
      var hTxt = compo.length * fsC * lhC;
      if (e.taille) {
        var by = yy + (hC - boite) / 2;
        ctx.fillStyle = encre; ctx.fillRect(x0, by, lb, boite);
        ctx.fillStyle = e.couleurFond;
        var fT = ajuster(ctx, e.taille, '800', fT0, lb - 6 * u);
        ctx.textAlign = 'center'; ctx.fillText(e.taille, x0 + lb / 2, by + boite / 2 + fT * 0.36);
        ctx.fillStyle = encre;
      }
      ctx.font = '700 ' + fsC + 'px ' + POLICE; ctx.textAlign = e.taille ? 'left' : 'center';
      var ty = yy + (hC - hTxt) / 2;
      if (videC) ctx.globalAlpha = 0.45;
      compo.forEach(function(l, i){
        var bl = ty + (i + 0.82) * fsC * lhC;
        ctx.fillText(l, e.taille ? x0 + lb + esp : w / 2, bl);
      });
      ctx.globalAlpha = 1;
      yy += hC + ecart;
    }
    /* 2. LES CONSIGNES, en mots, centrées. */
    if (hS) {
      ctx.textAlign = 'center';
      soins.forEach(function(l, i){
        ajuster(ctx, l, '600', fsS, dispo);
        ctx.fillText(l, w / 2, yy + (i + 0.8) * fsS * lhS);
      });
      yy += hS + ecart;
    }
    /* 3. LES SYMBOLES, dans l ordre de la norme. */
    if (hI) {
      var gap = 14 * u, n = sym.length, tt = tI;
      var larg = n * tt + (n - 1) * gap;
      if (larg > dispo) { var kk = dispo / larg; tt = tt * kk; gap = gap * kk; larg = dispo; }
      var sx = (w - larg) / 2, sy = yy + (tI - tt) / 2;
      sym.forEach(function(code, i){
        var ic = ICOS[cleIco(code, encre)];
        if (ic && ic.pret) ctx.drawImage(ic.im, sx + i * (tt + gap), sy, tt, tt);
      });
      yy += hI + ecart;
    }
    /* 4. LE PIED : le pays, puis le petit logo sur la MÊME ligne de base que SANDRIZA · CA. */
    ctx.textAlign = 'left';
    ajuster(ctx, e.pays, '600', fsP, dispo);
    var wp = ctx.measureText(e.pays).width;
    ctx.fillText(e.pays, (w - wp) / 2, yy + 0.8 * fsP * lhP);
    var bl2 = yy + 1.8 * fsP * lhP;
    var fL = fsP * 1.2, fI = fsP;
    ctx.font = '700 ' + fL + 'px ' + SZ_DONNEES.serif; var wS = ctx.measureText('S').width;
    ctx.font = 'italic 700 ' + fL + 'px ' + SZ_DONNEES.serif; var wZ = ctx.measureText('z').width;
    ctx.font = '600 ' + fI + 'px ' + POLICE; var wId = ctx.measureText(e.identite).width;
    var espL = 6 * u, totL = wS + wZ + espL + wId;
    if (totL > dispo) { var k3 = dispo / totL; fL *= k3; fI *= k3; wS *= k3; wZ *= k3; espL *= k3; wId *= k3; totL = dispo; }
    var lx = (w - totL) / 2;
    ctx.font = '700 ' + fL + 'px ' + SZ_DONNEES.serif; ctx.fillStyle = encre; ctx.fillText('S', lx, bl2);
    ctx.font = 'italic 700 ' + fL + 'px ' + SZ_DONNEES.serif; ctx.fillStyle = '#C49A6C'; ctx.fillText('z', lx + wS, bl2);
    ctx.font = '600 ' + fI + 'px ' + POLICE; ctx.fillStyle = encre; ctx.fillText(e.identite, lx + wS + wZ + espL, bl2);
    if (aCode) {
      yy += hP + ecart;
      /* La largeur d un module : un nombre ENTIER de points à l export (o.modPx), sinon 0,254 mm à l échelle. */
      var mw = o.modPx || (0.254 * 7.6 * u);
      var qz = 10 * mw, lc = e.modules * mw, bh = 2.5 * 7.6 * u;
      var x0b = Math.round((w - lc) / 2), y0b = Math.round(yy + 4 * u);
      /* Un scanneur lit des barres FONCÉES sur fond CLAIR : sur le vêtement foncé, une fine bande claire. */
      if (e.fond !== 'pale') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(Math.round(x0b - qz), Math.round(y0b - 1.5 * u), Math.round(lc + 2 * qz), Math.round(bh + 3 * u)); }
      ctx.fillStyle = '#111111';
      e.barres.forEach(function(b){ ctx.fillRect(Math.round(x0b + b[0] * mw), y0b, Math.max(1, Math.round(b[1] * mw)), Math.round(bh)); });
    }
    ctx.restore();
  }
  /* Une étiquette dans un canevas d aperçu (à l endroit, toujours lisible). */
  function apercuDans(cv, e, largeurCss){
    if (!cv || !e) return;
    var r = window.devicePixelRatio || 1;
    var W = largeurCss, H = Math.round(W * 30 / 50);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cv.width = Math.round(W * r); cv.height = Math.round(H * r);
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    prepIcones(e.symboles || [], e.couleurEncre).then(function(){
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      peindreEtiquette(ctx, e, 0, 0, cv.width, cv.height, { bord: true });
    });
  }

  /* ══ LE CHARGEMENT ═════════════════════════════════════════════════════════ */
  function charger(){
    if (OCCUPE) return Promise.resolve();
    OCCUPE = true;
    return appeler('fibres:donnees', []).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) {
        D = null; outils();
        corps.innerHTML = '<div class="appel cx-carte"><strong>${T("Analyses de fibres indisponibles")}</strong><div class="aide">' + esc(expliquer(r)) + '</div></div>';
        return;
      }
      D = r;
      PA = !!r.peutAjouter; PM = !!r.peutModifier; PS = !!r.peutSupprimer;
      Object.keys(COCHES).forEach(function(id){ var a = analyse(id); if (!a || a.etat !== 'confirmee') delete COCHES[id]; });
      if (CHOIX && !analyse(CHOIX)) { CHOIX = ''; APERCU_CHOIX = null; }
      if (ETAT === 'nouvelle' && PA) ouvrirForm(null);
      else if (ETAT === 'modifier' && PM && (r.analyses || []).length) ouvrirForm(r.analyses[0], 1);
      else if (ETAT === 'composition' && PM && (r.analyses || []).length) ouvrirForm(r.analyses[0], 2);
      else if (ETAT === 'produit' && PM && (r.analyses || []).length) ouvrirForm(r.analyses[0], 3);
      else if (ETAT === 'planche') {
        (r.analyses || []).filter(function(a){ return a.etat === 'confirmee'; }).forEach(function(a){ COCHES[a.id] = true; });
        ouvrirPlanche();
      }
      else if (ETAT === 'historique') VUE = 'historique';
      ETAT = '';
      if (!CHOIX && VUE === 'banque' && (r.analyses || []).length) choisir(r.analyses[0].id);
      dessiner();
    });
  }

  /* ── LA BARRE D OUTILS ──────────────────────────────────────────────────── */
  function nbCoches(){ return Object.keys(COCHES).length; }
  function outils(){
    if (!D) { elOutils.innerHTML = ''; return; }
    var h = '';
    if (VUE === 'banque') {
      var n = nbCoches();
      h += '<button type="button" data-act="planche"' + (n ? '' : ' disabled') + ' title="${T("Cochez des analyses confirmées pour les mettre sur une planche")}">'
        + '${T("Générer une planche")}' + (n ? ' (' + n + ')' : '') + '</button>';
      h += '<button type="button" data-act="historique">${T("Historique d’impression")}</button>';
      if (PA) h += '<button type="button" class="prim" data-act="nouvelle">${T("+ Nouvelle analyse")}</button>';
    } else {
      h += '<button type="button" data-act="banque">${T("‹ Retour à la banque")}</button>';
    }
    elOutils.innerHTML = h;
  }

  /* ══ LA BANQUE ═════════════════════════════════════════════════════════════ */
  var FILTRES = [['toutes', '${T("Toutes")}'], ['a_confirmer', '${T("À confirmer")}'], ['confirmee', '${T("Confirmées")}'], ['a_creer', '${T("Produit à créer")}']];
  function visibles(){
    var q = Q.trim().toLowerCase();
    return ((D && D.analyses) || []).filter(function(a){
      if (FILTRE === 'a_confirmer' && a.etat !== 'a_confirmer') return false;
      if (FILTRE === 'confirmee' && a.etat !== 'confirmee') return false;
      if (FILTRE === 'a_creer' && a.produit) return false;
      if (!q) return true;
      return [a.no, a.resume, nomProduit(a), a.remarque, a.produit ? a.produit.ref : ''].join(' ').toLowerCase().indexOf(q) >= 0;
    });
  }
  function nav(nbp){
    if (nbp <= 1) return '';
    return '<span class="pages">'
      + '<button type="button" class="mini pgf" data-pg="-1" title="${T("Page précédente")}" aria-label="${T("Page précédente")}"' + (PG <= 0 ? ' disabled' : '') + '>‹</button>'
      + '<span>${T("Page")} ' + (PG + 1) + ' / ' + nbp + '</span>'
      + '<button type="button" class="mini pgf" data-pg="1" title="${T("Page suivante")}" aria-label="${T("Page suivante")}"' + (PG >= nbp - 1 ? ' disabled' : '') + '>›</button></span>';
  }
  function ligneAnalyse(a){
    var f = fond(a.fond);
    var lect = a.lecture && a.lecture.principale ? nomFibre(a.lecture.principale) + ' · ' + (CONF[a.lecture.confiance] || '') : (a.lecture ? '${T("lecture sans fibre nette")}' : '—');
    var conf = a.etat === 'confirmee';
    return '<div class="ana' + (CHOIX === a.id ? ' sel' : '') + '" data-ana="' + esc(a.id) + '"' + (PM ? ' title="${T("Double-cliquez pour ouvrir")}"' : '') + '>'
      + '<input type="checkbox" data-coche="' + esc(a.id) + '" aria-label="${T("Mettre sur la planche")} ' + esc(a.no) + '"' + (COCHES[a.id] ? ' checked' : '') + (conf ? '' : ' disabled title="${T("Confirmez la composition pour pouvoir l’imprimer")}"') + '>'
      + '<span class="no">' + esc(a.no) + '</span>'
      + '<span class="cel gris" title="' + esc(lect) + '">' + esc(lect) + '</span>'
      + '<span class="cel compo" title="' + esc(a.resume) + '">' + esc(a.resume || '—') + '</span>'
      + '<span class="cel' + (a.produit ? '' : ' prov') + '" title="' + esc(nomProduit(a)) + '">' + esc(nomProduit(a)) + (a.produit ? '' : ' <span class="gris">${T("(à créer)")}</span>') + '</span>'
      + '<span class="cel rem rq" title="' + esc(a.remarque) + '">' + esc(a.remarque || '') + '</span>'
      + '<span class="nb" title="${T("Étiquettes déjà imprimées")}">' + (a.imprime || '—') + '</span>'
      + '<span class="rf-pill papier" title="' + esc(f.papier || '') + '">' + (a.fond === 'pale' ? '${T("Pâle")}' : '${T("Foncé")}') + '</span>'
      + '<span class="rf-pill ' + (conf ? 'vert' : 'ambre') + '">' + (conf ? '${T("Confirmée")}' : '${T("À confirmer")}') + '</span>'
      + '</div>';
  }
  function banque(){
    var L = (D.analyses || []);
    var h = '<div class="filtres"><div class="puces" role="group" aria-label="${T("Filtrer les analyses")}">'
      + FILTRES.map(function(f){ return '<button type="button" class="puce" data-filtre="' + f[0] + '" aria-pressed="' + (FILTRE === f[0]) + '">' + f[1] + '</button>'; }).join('')
      + '</div><div class="q"><label class="lbl" for="f-scan">${T("Scanner")}</label><input type="text" id="f-scan" maxlength="40" autocomplete="off" placeholder="${T("Étiquette d’analyse…")}" title="${T("Scannez le code de l’étiquette thermocollante, ou tapez le numéro d’analyse : l’analyse s’ouvre.")}">'
      + '<label class="lbl" for="f-q">${T("Rechercher")}</label><input type="search" id="f-q" maxlength="80" value="' + esc(Q) + '" placeholder="${T("N°, fibre, produit, remarque…")}"></div></div>';
    if (!L.length) {
      return h + '<div class="cx-carte appel"><strong>${T("Aucune analyse pour l’instant")}</strong>'
        + '<div class="aide">${T("Prenez une photo de la surface du vêtement au microscope (1200×), déposez-la ici : l’IA décrit la fibre étape par étape, vous confirmez la composition avec la fiche du fournisseur, puis l’étiquette se prépare toute seule.")}</div>'
        + (PA ? '<div class="boutons" style="justify-content:center"><button type="button" class="prim" data-act="nouvelle">${T("+ Nouvelle analyse")}</button></div>' : '') + '</div>';
    }
    var V = visibles();
    if (!(BU > 0)) BU = Math.max(4, Math.floor(((corps.clientHeight || 640) - 190) / 46));
    var nbp = Math.max(1, Math.ceil(V.length / BU));
    if (PG >= nbp) PG = nbp - 1; if (PG < 0) PG = 0;
    var vue = V.slice(PG * BU, (PG + 1) * BU);
    h += '<div class="duo"><div><div class="cx-carte liste"><h2>${T("Banque des analyses")} <span class="cx-sub">' + V.length + ' ' + (V.length > 1 ? '${T("analyses")}' : '${T("analyse")}') + '</span>' + nav(nbp) + '</h2>'
      + '<div class="ent"><span></span><span>${T("N°")}</span><span>${T("Lecture de l’IA")}</span><span>${T("Composition confirmée")}</span><span>${T("Produit / nom provisoire")}</span><span class="rq">${T("Remarque")}</span><span class="nb">${T("Imprimées")}</span><span>${T("Papier")}</span><span>${T("État")}</span></div>'
      + (vue.length ? vue.map(ligneAnalyse).join('') : '<div class="aide" style="padding:.8rem">${T("Aucune analyse ne correspond à ce filtre.")}</div>')
      + '</div></div><div>' + detail() + '</div></div>';
    return h;
  }
  function detail(){
    var a = CHOIX ? analyse(CHOIX) : null;
    if (!a) return '<div class="cx-carte"><h2>${T("Détail")}</h2><div class="aide">${T("Choisissez une analyse dans la liste.")}</div></div>';
    var soins = (a.entretien || []).map(function(k){ var s = soin(k); return s ? (EN ? s.en : s.fr) : ''; }).filter(Boolean);
    var l = a.lecture;
    return '<div class="cx-carte detail"><h2>' + esc(a.no) + ' <span class="cx-sub">' + esc(szJour(a.majLe || a.creeLe)) + '</span></h2>'
      + (SCANNE === a.id ? '<div class="trouve"><span>${T("Étiquette scannée")}</span><strong>' + esc(nomProduit(a) || a.no) + '</strong></div>' : '')
      + '<div class="apercu"><canvas id="cv-choix" width="300" height="180" style="width:300px;height:180px" aria-label="${T("Aperçu de l’étiquette")}" role="img"></canvas></div>'
      + '<div class="ligne" data-opt="6"><b>${T("Composition confirmée")}</b>' + esc(a.resume || '${T("pas encore confirmée")}') + '</div>'
      + '<div class="ligne"><b>${T("Produit")}</b>' + esc(nomProduit(a)) + (a.produit ? ' <span class="gris">' + esc(a.produit.ref) + '</span>' : ' <span class="gris">${T("(nom provisoire — produit à créer)")}</span>')
        + (a.produitAbsent ? ' <span class="mauvais">${T("— ce produit n’existe plus")}</span>' : '') + '</div>'
      + (a.remarque ? '<div class="ligne" data-opt="4"><b>${T("Remarque")}</b>' + esc(a.remarque) + '</div>' : '')
      + '<div class="ligne" data-opt="3"><b>${T("Entretien")}</b><span class="coupe2" title="' + esc(soins.join(' · ')) + '">' + esc(soins.join(' · ') || '—') + '</span></div>'
      + '<div class="ligne" data-opt="5"><b>${T("Provenance et papier")}</b>' + esc(nomPays(a.pays)) + ' · ' + esc(a.fond === 'pale' ? '${T("vêtement pâle, papier transparent (miroir)")}' : '${T("vêtement foncé, papier opaque")}') + '</div>'
      + (l ? '<div class="ligne" data-opt="2"><b>${T("Lecture de l’IA (texte gardé, photo effacée)")}</b><span class="lecture-txt coupe2" title="' + esc(l.estimation || l.morphologie) + '">' + esc(l.estimation || l.morphologie) + '</span></div>' : '')
      + '<div class="ligne"><b>${T("Imprimées")}</b>' + (a.imprime ? a.imprime + ' ${T("étiquette(s) au total")}' : '${T("aucune")}')
        + (a.impressions || []).slice(-3).reverse().map(function(i){
            var t = Object.keys(i.tailles || {}).map(function(k){ return (k || '${T("sans taille")}') + ' ×' + i.tailles[k]; }).join(', ');
            return '<br><span class="gris" data-opt="1">' + esc(szJour(i.le)) + ' · ' + i.n + (t ? ' (' + esc(t) + ')' : '') + (i.par ? ' · ' + esc(i.par) : '') + '</span>'; }).join('') + '</div>'
      + (!a.produit && PM ? '<div class="avert">${T("Pas encore rattachée à un produit. Une fois le produit créé dans l’inventaire, rattachez-la : l’analyse, l’étiquette et son historique d’impression le suivront.")}'
          + '<div class="boutons" style="margin-top:.35rem"><button type="button" class="prim" data-rattacher="' + esc(a.id) + '">${T("Rattacher à un produit")}</button></div></div>' : '')
      + '<div class="boutons">'
      + (PS ? '<button type="button" class="danger gauche" data-sup="' + esc(a.id) + '">${T("Supprimer")}</button>' : '')
      + '<button type="button" data-temp="' + esc(a.id) + '" title="${T("Une petite étiquette, au format de vos codes-barres, à coller sur le vêtement le temps de poser l’étiquette thermocollante.")}">${T("Étiquette temporaire")}</button>'
      + (PM ? '<button type="button" class="prim" data-ouvrir="' + esc(a.id) + '">${T("Ouvrir")}</button>' : '')
      + '</div></div>';
  }
  function choisir(id){
    CHOIX = id; APERCU_CHOIX = null;
    var a = analyse(id); if (!a) return;
    appeler('fibres:apercu', [{ composition: a.composition, entretien: a.entretien, fond: a.fond, pays: a.pays }, '']).then(function(r){
      if (CHOIX !== id || !r || !r.ok) return;
      APERCU_CHOIX = r.etiquette;
      peindreChoix();
    });
  }
  /* LE DÉTAIL S AJUSTE À LA PLACE : tant que sa colonne déborde, les lignes facultatives partent, la moins
     utile d abord (data-opt 1 = l historique, puis la lecture, l entretien, la remarque). Jamais de glissière. */
  function ajusterDetail(){
    var col = corps.querySelector('.duo>div:last-child'); if (!col) return;
    for (var p = 1; p <= 6 && col.scrollHeight > col.clientHeight + 1; p++) {
      Array.prototype.forEach.call(col.querySelectorAll('[data-opt="' + p + '"]') || [], function(e){ e.style.display = 'none'; var br = e.previousSibling; if (br && br.nodeName === 'BR') br.style.display = 'none'; });
    }
  }
  /* L ÉTAPE 1 sur une petite fenêtre : la lecture (et l encadré non concluant) sortait par le bas (banc à 700 px).
     Les textes se resserrent — trois lignes, puis deux, puis une, le texte entier au survol — jusqu à tenir.
     Jamais de glissière (sa règle). */
  function ajusterEtape1(){
    var bas = Math.min(corps.getBoundingClientRect().bottom, window.innerHeight);
    function depasse(){ return Array.prototype.some.call(corps.querySelectorAll('.et-deux>.cx-carte'), function(c){ return c.getBoundingClientRect().bottom > bas + 1; }); }
    var niv = ['coupe3', 'coupe2', 'coupe1'];
    for (var i = 1; i < niv.length && depasse(); i++) {
      Array.prototype.forEach.call(corps.querySelectorAll(['.etape', '.nonconcl'].map(function(s){ return s + ' p.' + niv[i - 1]; }).join()), function(p){ p.classList.remove(niv[i - 1]); p.classList.add(niv[i]); });
    }
  }
  function peindreChoix(){
    var cv = document.getElementById('cv-choix');
    if (cv && APERCU_CHOIX) apercuDans(cv, APERCU_CHOIX, 300);
  }

  /* ══ L ANALYSE ═════════════════════════════════════════════════════════════ */
  function ouvrirForm(a, etape){
    VUE = 'analyse'; PHOTOS = []; RES = null;
    ETAPE = etape || (a && (a.lecture || (a.composition || []).length) ? 2 : 1);
    FORM = a ? {
      id: a.id, no: a.no, lecture: a.lecture || null, tentatives: (a.tentatives || []).slice(),
      composition: (a.composition || []).map(function(x){ return { fibre: x.fibre, pct: String(x.pct) }; }),
      entretien: (a.entretien || []).slice(), fond: a.fond || 'fonce', pays: a.pays || D.paysDefaut,
      produit: a.produit || null, nomProvisoire: a.nomProvisoire || '', mode: a.produit ? 'inventaire' : 'provisoire',
      remarque: a.remarque || '', copierFiche: !!a.produit, apercu: null, verdict: null
    } : {
      id: '', no: '', lecture: null, tentatives: [], composition: [], entretien: [], fond: dernierFond(), pays: D.paysDefaut,
      produit: null, nomProvisoire: '', mode: 'inventaire', remarque: '', copierFiche: true, apercu: null, verdict: null
    };
    redemanderApercu();
  }
  function dernierFond(){ try { return localStorage.getItem('sz-fibres-fond') === 'pale' ? 'pale' : 'fonce'; } catch (e) { return 'fonce'; } }
  function saisie(){
    var f = FORM;
    return { id: f.id || undefined, lecture: f.lecture, tentatives: f.tentatives || [],
      composition: f.composition.filter(function(x){ return x.fibre && parseFloat(x.pct) > 0; }).map(function(x){ return { fibre: x.fibre, pct: Math.round(parseFloat(String(x.pct).replace(',', '.'))) }; }),
      entretien: f.entretien.slice(), fond: f.fond, pays: f.pays,
      produitId: f.mode === 'inventaire' && f.produit ? f.produit.id : '', nomProvisoire: f.mode === 'provisoire' ? f.nomProvisoire : '',
      remarque: f.remarque, copierFiche: !!(f.copierFiche && f.mode === 'inventaire' && f.produit) };
  }
  var _tA = null;
  function redemanderApercu(){
    clearTimeout(_tA);
    _tA = setTimeout(function(){
      if (!FORM) return;
      var s = saisie();
      appeler('fibres:apercu', [s, '']).then(function(r){
        if (!FORM || !r || !r.ok) return;
        FORM.apercu = r.etiquette; FORM.verdict = r.composition; FORM.propose = r.propose || [];
        majTotal(); peindreForm();
      });
    }, 140);
  }
  /* L aperçu suit sa carte (360 au plus) : à 21rem de colonne, 360 px débordaient du cadre. */
  function peindreForm(){
    var cv = document.getElementById('cv-form'); if (!cv || !FORM || !FORM.apercu) return;
    var boite = cv.parentNode && cv.parentNode.clientWidth ? cv.parentNode.clientWidth - 20 : 360;
    apercuDans(cv, FORM.apercu, Math.max(220, Math.min(360, boite)));
  }
  /* Le côté se refait sans toucher à l étape (la saisie en cours garde son focus). */
  function majCote(){ var c = document.querySelector('.et-droite'); if (!c || !FORM) return; c.innerHTML = cote(); peindreForm(); }
  function totalPct(){ return FORM.composition.reduce(function(s, x){ var v = parseFloat(String(x.pct).replace(',', '.')); return s + (isFinite(v) ? Math.round(v) : 0); }, 0); }
  function majTotal(){
    var el = document.getElementById('f-total'); if (FORM) { var mq = document.querySelector('.manques'); if (mq) majCote(); }
    if (!el || !FORM) return;
    var t = totalPct();
    el.className = t === 100 ? 'bon' : (t ? 'attn' : 'gris');
    el.textContent = '${T("Total")} ' + t + ' %' + (t === 100 ? ' ✓' : '');
  }
  /* ══ L ANALYSE EN TROIS ÉTAPES (2026-10-25, sa remarque « trop condensé ») ═════
     Une étape à la fois, à gauche, avec toute la place ; à droite, l aperçu de
     l étiquette (plus grand), ce qui manque, et les boutons. Plus de colonne qui
     défile : chaque étape tient dans la fenêtre. */
  var ETAPES = [[1, '${T("Photo et lecture de l’IA")}'], [2, '${T("Composition et entretien")}'], [3, '${T("Produit et étiquette")}']];
  function etapePhotos(){
    var f = FORM, l = f.lecture;
    /* Non concluante : l encadré va SOUS LE DÉPÔT DE PHOTO (la seconde analyse se fait là, et la colonne a la place). */
    var nc = nonConcluante(l);
    var h = '<div class="et-deux"><div class="cx-carte"><h2>${T("Photo de surface · microscope 1200×")}</h2>'
      + '<div class="depot' + (nc ? ' compact' : '') + '" id="f-depot" role="button" tabindex="0" aria-label="${T("Déposer ou choisir des photos")}">'
      + '<strong>${T("Glissez une photo ici")}</strong><span class="aide">${T("ou cliquez pour choisir (JPEG, PNG, WEBP — 4 au plus). Plusieurs vues du même tissu donnent une lecture plus sûre.")}</span></div>';
    if (PHOTOS.length) h += '<div class="vignettes" style="margin-top:.7rem">' + PHOTOS.map(function(p, i){
      return '<div class="vig"><img src="' + p + '" alt="${T("Photo")} ' + (i + 1) + '"><button type="button" data-otph="' + i + '" aria-label="${T("Retirer la photo")} ' + (i + 1) + '">✕</button></div>'; }).join('') + '</div>';
    // Non concluante : l encadré donne déjà le conseil propre à CETTE photo.
    h += (nc ? '' : '<div class="aide" style="margin-top:.8rem">${T("Conseil : une photo de la surface, une du ruban adhésif collé sur une lame, et une fibre dans une goutte de glycérine.")}</div>')
      + '<div class="boutons" style="margin-top:.9rem"><span class="aide gauche">${T("≈ 0,01 à 0,02 $ par lecture (clé API). Les photos ne sont pas conservées.")}</span>'
      + '<button type="button" class="prim" id="f-lire"' + (PHOTOS.length && !LECTURE_EN_COURS ? '' : ' disabled') + '>' + (LECTURE_EN_COURS ? '${T("Lecture en cours…")}' : (l ? '${T("Relire les photos")}' : '${T("Lire les photos")}')) + '</button></div>'
      + (nc ? '<div class="nonconcl" role="status"><h3>${T("Analyse non concluante")} · ' + esc(String(l.certitude || 0)) + ' % (${T("seuil")} ' + SEUIL + ' %)</h3>'
          + '<p>${T("L’étiquette passe à « 100 % fibres mixtes », avec l’entretien des fibres reconnues.")}</p>'
          + (l.raison ? '<p class="coupe3" title="' + esc(l.raison) + '"><strong>${T("Pourquoi :")}</strong> ' + esc(l.raison) + '</p>' : '')
          + (l.conseil ? '<p class="coupe3" title="' + esc(l.conseil) + '"><strong>${T("Pour trancher :")}</strong> ' + esc(l.conseil) + '</p>' : '')
          + '<div class="boutons"><button type="button" class="prim" id="f-seconde">${T("Faire une seconde analyse")}</button>'
          + ((f.tentatives || []).length ? '<span class="aide">' + f.tentatives.length + ' ${T("lecture(s) précédente(s) gardée(s)")}</span>' : '') + '</div></div>' : '')
      + '</div>';
    h += '<div class="cx-carte"><h2>${T("Lecture de l’IA")} <span class="cx-sub">${T("expert en microscopie textile")}</span></h2>';
    if (!l) h += '<div class="aide">${T("La lecture paraît ici, en quatre étapes : morphologie, parois et diamètre, comparaison aux fibres connues, estimation finale.")}</div>';
    else {
      [['${T("1) Morphologie")}', l.morphologie], ['${T("2) Parois et diamètre")}', l.parois], ['${T("3) Comparaison aux standards")}', l.comparaison], ['${T("4) Estimation finale")}', l.estimation]].forEach(function(x){
        if (x[1]) h += '<div class="etape"><h3>' + x[0] + '</h3><p class="coupe3" title="' + esc(x[1]) + '">' + esc(x[1]) + '</p></div>';
      });
      h += '<div class="estim"><span class="lbl">${T("ESTIMATION")}</span><strong>' + esc(l.principale ? nomFibre(l.principale) : '${T("indéterminée")}') + '</strong>'
        + '<span class="aide">' + (l.certitude != null ? '${T("certitude :")} ' + esc(String(l.certitude)) + ' %' : '${T("confiance :")} ' + esc(CONF[l.confiance] || '')) + (l.possibles && l.possibles.length ? ' · ${T("aussi vu :")} ' + esc(l.possibles.map(nomFibre).join(', ')) : '') + '</span>'
        + (l.principale ? '<button type="button" class="mini" id="f-utiliser" style="margin-left:auto">${T("Utiliser l’estimation")}</button>' : '') + '</div>'
        + (l.le ? '<div class="aide" style="margin-top:.5rem">${T("Lue le")} ' + esc(szQuand(l.le)) + (l.cout ? ' · ' + szArgent(l.cout) : '') + ' · ${T("photos effacées après la lecture")}</div>' : '');
    }
    return h + '</div></div>';
  }
  function etapeComposition(){
    var f = FORM;
    var h = '<div class="et-compo"><div class="cx-carte"><h2>${T("Composition confirmée")} <span class="cx-sub">${T("ce qui s’imprime")}</span></h2>'
      + '<div class="avert" style="margin-bottom:.8rem">${T("Une photo de surface dit QUELLE fibre on voit (fiable à 60-70 %) ; elle ne pèse pas un mélange. Les pourcentages viennent de la fiche du fournisseur — la loi tolère 5 % d’écart.")}</div>';
    if (!f.composition.length) h += '<div class="aide" style="margin-bottom:.6rem">${T("Aucune fibre pour l’instant : ajoutez-en une, ou reprenez l’estimation de l’IA (étape 1).")}</div>';
    f.composition.forEach(function(x, i){
      h += '<div class="fib"><select id="f-fib-' + i + '" aria-label="${T("Fibre")} ' + (i + 1) + '">'
        + '<option value="">${T("— fibre —")}</option>'
        + (D.fibres || []).map(function(k){ return '<option value="' + esc(k.cle) + '"' + (x.fibre === k.cle ? ' selected' : '') + '>' + esc(EN ? k.en : k.fr + ' / ' + k.en) + '</option>'; }).join('')
        + '</select><input type="text" inputmode="numeric" maxlength="3" id="f-pct-' + i + '" aria-label="${T("Pourcentage de la fibre")} ' + (i + 1) + '" value="' + esc(x.pct) + '" placeholder="%">'
        + '<button type="button" class="mini" data-otfib="' + i + '" aria-label="${T("Retirer la fibre")} ' + (i + 1) + '">✕</button></div>';
    });
    h += '<div class="total"><button type="button" class="mini" id="f-ajfib">${T("+ Ajouter une fibre")}</button><span id="f-total"></span></div>'
      + '<div class="aide" style="margin-top:.6rem">${T("Moins de 5 % : imprimé « autre fibre / other fibre », à la fin (art. 31).")}</div></div>';
    /* L entretien : les groupes en deux colonnes, des pastilles aérées. */
    var G = (D.entretienGroupes || []).map(function(g){ return { g: g, L: (D.entretien || []).filter(function(s){ return s.groupe === g.cle; }) }; })
      .filter(function(x){ return x.L.length; });
    var bloc = function(x){
      return '<div class="grpent"><span class="t">' + esc(EN ? x.g.en : x.g.fr) + '</span><div class="puces">'
        + x.L.map(function(s){ return '<button type="button" class="soin" data-soin="' + esc(s.cle) + '" aria-pressed="' + (f.entretien.indexOf(s.cle) >= 0) + '" title="' + esc(EN ? s.en : s.fr) + '">' + (s.ico || '') + '<span>' + esc(EN ? s.en : s.fr) + '</span></button>'; }).join('')
        + '</div></div>';
    };
    var gauche = G.filter(function(x){ return x.g.cle === 'lavage' || x.g.cle === 'javel' || x.g.cle === 'sec'; });
    var droite = G.filter(function(x){ return gauche.indexOf(x) < 0; });
    h += '<div class="cx-carte"><h2>${T("Entretien")} <button type="button" class="mini" id="f-proposer" style="margin-left:auto" title="${T("Cocher l’entretien proposé d’après les fibres")}">${T("Proposer d’après les fibres")}</button></h2>'
      + '<div class="ent-grille"><div>' + gauche.map(bloc).join('') + '</div><div>' + droite.map(bloc).join('') + '</div></div>'
      + '<div class="aide" style="margin-top:.6rem">${T("Symboles facultatifs au Canada ; présents, ils suivent la norme CAN/CGSB-86.1. L’étiquette en écrit trois en mots, en français et en anglais.")}</div></div></div>';
    return h;
  }
  function etapeProduit(){
    var f = FORM;
    var h = '<div class="et-deux"><div class="cx-carte"><h2>${T("Produit")}</h2>'
      + '<div class="puces" role="group" aria-label="${T("Produit")}" style="margin-bottom:.8rem">'
      + '<button type="button" class="puce" data-mode="inventaire" aria-pressed="' + (f.mode === 'inventaire') + '">${T("Dans l’inventaire")}</button>'
      + '<button type="button" class="puce" data-mode="provisoire" aria-pressed="' + (f.mode === 'provisoire') + '">${T("Pas encore créé")}</button></div>';
    if (f.mode === 'inventaire') {
      if (f.produit) h += '<div class="choisi"><span><strong>' + esc(f.produit.nom) + '</strong> <span class="gris">' + esc(f.produit.ref) + '</span></span><button type="button" class="mini" id="f-changer">${T("Changer")}</button></div>';
      else {
        h += '<div class="champ"><label for="f-chercher">${T("Chercher un produit (nom, numéro, SKU)")}</label><input type="search" id="f-chercher" maxlength="80" autocomplete="off"></div>';
        if (RES) h += '<div class="res" style="margin-top:.4rem">' + (RES.produits.length ? RES.produits.map(function(p){
            return '<button type="button" data-prod="' + esc(p.id) + '">' + esc(p.nom) + ' <span class="gris">' + esc(p.ref) + '</span></button>'; }).join('') : '<span class="aide" style="padding:.3rem">${T("Aucun produit trouvé.")}</span>')
          + (RES.total > RES.produits.length ? '<span class="aide" style="padding:.3rem">' + RES.total + ' ${T("résultats — précisez la recherche.")}</span>' : '') + '</div>';
      }
      h += '<label class="case" for="f-copier" style="margin-top:.8rem"><input type="checkbox" id="f-copier"' + (f.copierFiche ? ' checked' : '') + '> ${T("Copier aussi la composition et l’entretien sur la fiche produit")}</label>';
    } else {
      h += '<div class="champ"><label for="f-provisoire">${T("Nom provisoire (le produit sera créé plus tard)")}</label><input type="text" id="f-provisoire" maxlength="80" value="' + esc(f.nomProvisoire) + '" placeholder="${T("Ex. : Cardigan torsadé crème")}"></div>'
        + '<div class="aide" style="margin-top:.6rem">${T("Une fois le produit créé, « Rattacher à un produit » relie l’analyse, son étiquette et son historique d’impression.")}</div>';
    }
    h += '<div class="champ" style="margin-top:.9rem"><label for="f-remarque">${T("Remarque")}</label><textarea id="f-remarque" rows="3" maxlength="400" placeholder="${T("Lot, fournisseur, fiche reçue, essai de lavage…")}">' + esc(f.remarque) + '</textarea></div></div>';
    h += '<div class="cx-carte"><h2>${T("Étiquette")}</h2>'
      + '<div class="champ"><label for="f-pays">${T("Pays de fabrication")}</label><select id="f-pays">'
      + (D.pays || []).map(function(p){ return '<option value="' + esc(p.cle) + '"' + (f.pays === p.cle ? ' selected' : '') + '>' + esc(EN ? (p.nomEn || p.nom) : p.nom) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="champ" style="margin-top:.9rem"><span class="lbl" id="f-fond-l">${T("Couleur du vêtement")}</span><div class="puces" role="group" aria-labelledby="f-fond-l">'
      + '<button type="button" class="puce" data-fond="fonce" aria-pressed="' + (f.fond === 'fonce') + '">${T("Foncé")}</button>'
      + '<button type="button" class="puce" data-fond="pale" aria-pressed="' + (f.fond === 'pale') + '">${T("Pâle")}</button></div></div>'
      + '<div class="aide" style="margin-top:.5rem">' + (f.fond === 'pale' ? '${T("Papier transparent : texte noir, imprimé en miroir.")}' : '${T("Papier opaque : fond foncé imprimé, texte blanc (le papier).")}') + '</div>'
      + (D.ca && D.ca.manquant ? '<div class="aide attn" style="margin-top:.8rem">${T("« CA xxxxxxx » : le numéro CA n’est pas encore saisi (Fiscalité › Mon entreprise). Il remplacera le gabarit tout seul.")}</div>' : '')
      + '</div></div>';
    return h;
  }
  /* À droite : l aperçu, ce qui manque, et les boutons (toujours à l écran). */
  function cote(){
    var f = FORM, t = totalPct(), n = f.entretien.length;
    var pr = f.mode === 'inventaire' ? (f.produit ? f.produit.nom : '') : String(f.nomProvisoire || '').trim();
    var ligne = function(okk, txt){ return '<div class="manque ' + (okk ? 'bon' : 'attn') + '">' + (okk ? '✓ ' : '• ') + txt + '</div>'; };
    return '<div class="cx-carte cote"><h2>${T("Aperçu de l’étiquette")} <span class="cx-sub">50 × 30 mm</span></h2>'
      + '<div class="apercu"><canvas id="cv-form" width="360" height="216" style="width:360px;height:216px" role="img" aria-label="${T("Aperçu de l’étiquette")}"></canvas></div>'
      + '<div class="manques">'
      + ligne(t === 100, t === 100 ? '${T("Composition : 100 %")}' : '${T("Composition à confirmer")}' + (t ? ' (' + t + ' %)' : ''))
      + ligne(n > 0, n ? n + ' ' + (n > 1 ? '${T("consignes d’entretien")}' : '${T("consigne d’entretien")}') : '${T("Aucune consigne d’entretien")}')
      + ligne(!!pr, pr ? esc(pr) : '${T("Produit ou nom provisoire à choisir")}')
      + '</div>'
      + '<div class="boutons nav">'
      + (ETAPE > 1 ? '<button type="button" id="f-prec">${T("‹ Précédent")}</button>' : '<button type="button" data-act="banque">${T("Annuler")}</button>')
      + (ETAPE < 3 ? '<button type="button" id="f-suiv">${T("Suivant ›")}</button>' : '')
      + '<button type="button" class="prim" id="f-ok">' + (f.id ? '${T("Enregistrer")}' : '${T("Enregistrer l’analyse")}') + '</button></div></div>';
  }
  function formulaire(){
    var corpsE = ETAPE === 1 ? etapePhotos() : ETAPE === 2 ? etapeComposition() : etapeProduit();
    return '<div class="assist"><div class="et-gauche"><nav class="etapes" aria-label="${T("Étapes de l’analyse")}">'
      + ETAPES.map(function(e){ return '<button type="button" class="et-b" data-etape="' + e[0] + '"' + (ETAPE === e[0] ? ' aria-current="step"' : '') + '><span class="num">' + e[0] + '</span>' + e[1] + '</button>'; }).join('<span class="et-sep">›</span>')
      + '</nav>' + corpsE + '</div><div class="et-droite">' + cote() + '</div></div>';
  }
  /* ── Les photos : réduites ICI (1568 px au plus, JPEG), jamais enregistrées ── */
  function reduire(dataUrl){
    return new Promise(function(res){
      var im = new Image();
      im.onload = function(){
        var k = Math.min(1, 1568 / Math.max(im.width, im.height));
        var cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(im.width * k)); cv.height = Math.max(1, Math.round(im.height * k));
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        res(cv.toDataURL('image/jpeg', 0.9));
      };
      im.onerror = function(){ res(''); };
      im.src = dataUrl;
    });
  }
  function ajouterFichiers(liste){
    var L = Array.prototype.slice.call(liste || []).filter(function(f){ return /^image[/](jpeg|png|webp)$/.test(f.type); });
    if (!L.length) { szDire(MOTIFS.photo, 'err'); return; }
    L.slice(0, Math.max(0, 4 - PHOTOS.length)).forEach(function(fi){
      var lect = new FileReader();
      lect.onload = function(){ reduire(String(lect.result || '')).then(function(d){ if (d && PHOTOS.length < 4) { PHOTOS.push(d); dessiner(); } }); };
      lect.readAsDataURL(fi);
    });
    if (PHOTOS.length + L.length > 4) szDire('${T("4 photos au plus : les suivantes sont ignorées.")}', 'att');
  }
  /* Une lecture qui NE CONCLUT PAS (sa règle des 95 %). Une ancienne lecture, d avant la certitude, n en a pas : rien. */
  var SEUIL = 95;
  function nonConcluante(l){ return !!l && l.concluante === false && l.certitude != null && !!(l.raison || l.conseil || l.certitude > 0 || !l.principale); }
  /* « 100 % fibres mixtes », et l entretien des fibres que l analyse a quand même reconnues (le site en décide). */
  function passerEnMixte(){
    FORM.composition = [{ fibre: 'mixte', pct: '100' }];
    appeler('fibres:apercu', [saisie(), '']).then(function(r){
      if (!FORM || !r || !r.ok) return;
      if (r.propose && r.propose.length) FORM.entretien = r.propose.slice();
      dessiner(); redemanderApercu();
    });
  }
  function lire(){
    if (!PHOTOS.length || LECTURE_EN_COURS) return;
    LECTURE_EN_COURS = true; dessiner();
    szDire('${T("Lecture des photos par l’IA… (10 à 30 secondes)")}');
    appeler('fibres:analyser', [PHOTOS.slice()]).then(function(r){
      LECTURE_EN_COURS = false;
      if (!r || !r.ok) { szDire(expliquer(r), 'err'); dessiner(); return; }
      // Une seconde analyse : la lecture précédente est GARDÉE (5 au plus), pas écrasée.
      if (FORM.lecture) FORM.tentatives = (FORM.tentatives || []).concat([FORM.lecture]).slice(-5);
      FORM.lecture = r.lecture;
      PHOTOS = [];           /* sa consigne : on ne garde que les résultats */
      if (nonConcluante(r.lecture)) {
        szDire('${T("Analyse non concluante : l’étiquette passe à « 100 % fibres mixtes ». Une seconde analyse peut trancher.")}', 'att');
        passerEnMixte();
        return;
      }
      szDire('${T("Lecture terminée. Confirmez la composition avec la fiche du fournisseur.")}', 'bon');
      dessiner();
    });
  }

  /* ══ L ÉTIQUETTE TEMPORAIRE ET LE SCAN (2026-10-25, sa demande) ══════════════
     Une petite étiquette au format des codes-barres de produits (même imprimante) :
     « ANALYSE DE FIBRES », le numéro EN GROS, le produit — sans code-barres (sa
     décision). Le scan de l étiquette thermocollante (ou le numéro tapé) rouvre
     son analyse. Le site imprime et retrouve (fibres:etiquetteTemp, fibres:scanner). */
  function etiquetteTemp(id){
    szDire('${T("Impression de l’étiquette temporaire…")}');
    appeler('fibres:etiquetteTemp', [id, 1]).then(function(r){
      if (!r || !r.ok) { szDire(r && r.motif === 'imprimante' ? '${T("Aucune imprimante de codes-barres n’est choisie pour ce poste (Configuration › Imprimantes).")}' : expliquer(r), 'err'); return; }
      szDire('${T("Étiquette temporaire envoyée à")} ' + (r.imprimante || '${T("l’imprimante")}') + '.', 'bon');
    });
  }
  function scanner(code){
    code = String(code || '').trim(); if (!code) return;
    appeler('fibres:scanner', [code]).then(function(r){
      var el = document.getElementById('f-scan'); if (el) { el.value = ''; el.focus(); }
      if (!r || !r.ok) { szDire(r && r.motif === 'introuvable' ? '${T("Aucune analyse ne porte ce code :")} ' + code : expliquer(r), 'err'); return; }
      SCANNE = r.id; CHOIX = r.id; FILTRE = 'toutes'; Q = '';
      var L = visibles(), i = -1; L.forEach(function(a, k){ if (a.id === r.id) i = k; });
      if (i >= 0 && BU > 0) PG = Math.floor(i / BU);
      choisir(r.id); dessiner();
      var e2 = document.getElementById('f-scan'); if (e2) e2.focus();
      var a = analyse(r.id);
      szDire('${T("Étiquette scannée :")} ' + (a ? a.no + ' — ' + nomProduit(a) : r.id), 'bon');
    });
  }

  /* ══ LA PLANCHE ════════════════════════════════════════════════════════════ */
  function ouvrirPlanche(){
    VUE = 'planche';
    var mode = 'cricut'; try { if (localStorage.getItem('sz-fibres-mode') === 'ciseaux') mode = 'ciseaux'; } catch (e) {}
    PL = { mode: mode, lignes: [], sauter: { fonce: [], pale: [] }, R: null, vue: 0 };
    ((D && D.analyses) || []).forEach(function(a){ if (COCHES[a.id]) PL.lignes.push({ id: a.id, taille: '', n: 1 }); });
    redemanderPlanche();
  }
  var _tP = null;
  function redemanderPlanche(){
    clearTimeout(_tP);
    _tP = setTimeout(function(){
      if (!PL) return;
      var sel = PL.lignes.filter(function(l){ return l.n > 0; }).map(function(l){ return { id: l.id, taille: l.taille, n: l.n }; });
      appeler('fibres:planche', [{ selection: sel, mode: PL.mode, sauter: PL.sauter }]).then(function(r){
        if (!PL) return;
        if (!r || !r.ok) { szDire(expliquer(r), 'err'); return; }
        PL.R = r; if (PL.vue >= r.feuilles.length) PL.vue = 0;
        var codes = [];
        r.feuilles.forEach(function(f){ f.cases.forEach(function(c){ if (c) c.etiquette.symboles.forEach(function(k){ codes.push([k, c.etiquette.couleurEncre]); }); }); });
        var parEncre = {};
        codes.forEach(function(x){ (parEncre[x[1]] = parEncre[x[1]] || []).push(x[0]); });
        Promise.all(Object.keys(parEncre).map(function(c){ return prepIcones(parEncre[c], c); })).then(function(){ dessiner(); });
      });
    }, 120);
  }
  function lots(){
    var h = '<div class="cx-carte"><h2>${T("Quoi imprimer")} <span class="cx-sub">${T("combien de chaque, par taille")}</span></h2>';
    if (!PL.lignes.length) h += '<div class="aide">${T("Aucune analyse choisie : revenez à la banque et cochez les analyses confirmées.")}</div>';
    PL.lignes.forEach(function(l, i){
      var a = analyse(l.id); if (!a) return;
      var f = fond(a.fond);
      var tailles = a.produit && a.produit.tailles && a.produit.tailles.length ? a.produit.tailles : null;
      h += '<div class="lot" style="margin-bottom:.25rem"><span class="pap" style="background:' + esc(f.fond) + '" title="' + esc(f.papier) + '"></span>'
        + '<div style="min-width:0"><div class="nom" title="' + esc(nomProduit(a)) + '">' + esc(nomProduit(a)) + '</div><div class="sous">' + esc(a.no + ' · ' + a.resume) + '</div></div>'
        + (tailles ? '<select id="pl-t-' + i + '" aria-label="${T("Taille de la ligne")} ' + (i + 1) + '"><option value="">${T("Sans taille")}</option>'
            + tailles.map(function(t){ return '<option value="' + esc(t) + '"' + (l.taille === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>'
          : '<input type="text" id="pl-t-' + i + '" maxlength="6" value="' + esc(l.taille) + '" placeholder="${T("Taille")}" aria-label="${T("Taille de la ligne")} ' + (i + 1) + '">')
        + '<div class="pas"><button type="button" data-moins="' + i + '" aria-label="${T("Une de moins")}">−</button>'
        + '<input type="text" inputmode="numeric" maxlength="3" id="pl-n-' + i + '" value="' + l.n + '" aria-label="${T("Nombre d’étiquettes de la ligne")} ' + (i + 1) + '">'
        + '<button type="button" data-plus="' + i + '" aria-label="${T("Une de plus")}">+</button></div>'
        + '<button type="button" class="mini" data-otlot="' + i + '" aria-label="${T("Retirer la ligne")} ' + (i + 1) + '">✕</button></div>'
        + '<div style="margin:0 0 .35rem 1.2rem"><button type="button" class="mini dup" data-dup="' + i + '">${T("+ une autre taille")}</button></div>';
    });
    var tot = PL.lignes.reduce(function(s, l){ return s + (l.n > 0 ? l.n : 0); }, 0);
    var R = PL.R, nf = R ? R.feuilles.length : 0;
    var nO = R ? R.feuilles.filter(function(f){ return f.fond === 'fonce'; }).length : 0, nT = nf - nO;
    h += '<div class="aide">' + tot + ' ${T("étiquette(s)")} · ' + nf + ' ${T("feuille(s)")}'
      + (nf ? ' (' + [nO ? nO + ' ${T("papier opaque")}' : '', nT ? nT + ' ${T("papier transparent")}' : ''].filter(Boolean).join(', ') + ')' : '')
      + '. ${T("Les vêtements pâles et foncés ne sont jamais sur la même feuille.")}</div></div>';
    h += '<div class="cx-carte"><h2>${T("Découpe")}</h2><div class="puces" role="group" aria-label="${T("Découpe")}">'
      + (D.modes || []).map(function(m){ return '<button type="button" class="puce" data-modepl="' + esc(m.cle) + '" aria-pressed="' + (PL.mode === m.cle) + '">'
          + esc(m.cle === 'cricut' ? '${T("Cricut — 21 par feuille")}' : '${T("Ciseaux ou massicot — 32 par feuille")}') + '</button>'; }).join('')
      + '</div><div class="aide" data-optpl="2" style="margin-top:.4rem">' + (PL.mode === 'cricut'
        ? '${T("Un PNG par feuille (300 ppp, fond transparent). Dans Design Space : Téléverser › image › « Imprimer puis couper », mettre la largeur indiquée dans le nom du fichier, puis imprimer depuis Design Space (il ajoute son cadre de repérage).")}'
        : '${T("Un PDF Lettre, 32 étiquettes par feuille, traits de coupe dans la marge. Imprimer à 100 % (« Taille réelle »), sans ajuster à la page.")}')
      + '</div><div class="aide" data-optpl="1" style="margin-top:.4rem">${T("Feuille déjà entamée ? Cliquez dans l’aperçu les cases déjà utilisées : elles restent vides. Chaque papier a les siennes.")}</div></div>';
    return h;
  }
  /* L export, AU-DESSUS de l aperçu : toujours à l écran, jamais au bas d une colonne qui défile. */
  function barreExport(){
    var R = PL.R, nf = R ? R.feuilles.length : 0, bloque = D.ca && D.ca.manquant;
    return (bloque ? '<div class="avert">${T("Le numéro CA n’est pas encore saisi : l’aperçu montre « CA xxxxxxx », et l’export attend le vrai numéro (Fiscalité › Mon entreprise).")} <button type="button" class="mini" id="pl-fisc">${T("Ouvrir Fiscalité")}</button></div>' : '')
      + (R && R.invalides && R.invalides.length ? '<div class="avert">${T("Une analyse choisie n’a plus de composition confirmée : elle est retirée de l’export.")}</div>' : '')
      + '<div class="boutons" style="margin-top:0"><button type="button" class="gauche" id="pl-dossier">${T("Ouvrir le dossier des exports")}</button>'
      + '<button type="button" class="prim" id="pl-export"' + (!bloque && nf ? '' : ' disabled') + '>' + (PL.mode === 'cricut' ? '${T("Exporter pour Cricut (PNG)")}' : '${T("Exporter le PDF")}') + '</button></div>';
  }
  /* L aperçu d une feuille : ciseaux = la feuille Lettre ; Cricut = sa zone utile (189 × 252 mm). */
  function geoFeuille(){
    var d = PL.R.disposition;
    var cadre = d.zone ? { l: d.zone.l, h: d.zone.h } : { l: d.page.l, h: d.page.h };
    var dx = d.zone ? (d.zone.l - d.page.l) / 2 : 0, dy = d.zone ? (d.zone.h - d.page.h) / 2 : 0;
    return { cadre: cadre, dx: dx, dy: dy, d: d };
  }
  function scene(){
    var R = PL.R;
    if (!R) return '<div class="cx-carte"><div class="aide">${T("Préparation de la planche…")}</div></div>';
    if (!R.feuilles.length) return '<div class="cx-carte appel"><strong>${T("Rien à imprimer")}</strong><div class="aide">${T("Mettez au moins une étiquette dans une ligne.")}</div></div>';
    var f = R.feuilles[PL.vue];
    return '<div class="cx-carte" style="flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:.6rem">' + barreExport()
      + '<div class="feuilles" role="group" aria-label="${T("Feuilles")}">' + R.feuilles.map(function(x, i){
          return '<button type="button" class="puce" data-vue="' + i + '" aria-pressed="' + (PL.vue === i) + '">${T("Feuille")} ' + (i + 1) + ' · ' + (x.fond === 'pale' ? '${T("transparent")}' : '${T("opaque")}') + ' · ' + x.cases.filter(Boolean).length + '</button>'; }).join('') + '</div>'
      + '<div class="scene"><canvas class="plan" id="cv-plan" role="img" aria-label="${T("Aperçu de la feuille")}"></canvas>'
      + '<div class="note"><strong>' + esc(f.papier) + '</strong>'
      + (f.miroir ? '<span class="badge">${T("Aperçu à l’endroit — le miroir est appliqué à l’export")}</span>' : '')
      + '<span>' + (PL.mode === 'cricut' ? '${T("Le pointillé est la zone utile de Cricut : Design Space imprime son propre cadre autour. Le fichier ne contient que les étiquettes, détachées, pour que la lame coupe autour de chacune.")}'
          : '${T("La feuille Lettre entière : un seul trait de coupe entre deux étiquettes, repères dans la marge.")}') + '</span>'
      + (f.utilisees && f.utilisees.length ? '<span>' + f.utilisees.length + ' ${T("case(s) marquée(s) comme déjà utilisée(s).")}</span>' : '')
      + '</div></div></div>';
  }
  function peindrePlan(){
    var cv = document.getElementById('cv-plan'); if (!cv || !PL || !PL.R || !PL.R.feuilles.length) return;
    var g = geoFeuille(), f = PL.R.feuilles[PL.vue];
    /* La place qui RESTE : du haut de l aperçu au bas de la fenêtre (moins le pied), et la largeur de la scène moins la note. */
    var haut = cv.getBoundingClientRect ? cv.getBoundingClientRect().top : 160;
    var sc = cv.parentNode && cv.parentNode.getBoundingClientRect ? cv.parentNode.getBoundingClientRect() : { width: 900 };
    var hDispo = Math.max(260, (window.innerHeight || 900) - haut - 70), lDispo = Math.max(220, sc.width - 300);
    var s = Math.min(hDispo / g.cadre.h, lDispo / g.cadre.l);
    var W = Math.round(g.cadre.l * s), H = Math.round(g.cadre.h * s), r = window.devicePixelRatio || 1;
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = Math.round(W * r); cv.height = Math.round(H * r);
    var ctx = cv.getContext && cv.getContext('2d'); if (!ctx) return; var k = s * r;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, cv.width, cv.height);
    if (g.d.zone) { ctx.save(); ctx.setLineDash([6 * r, 5 * r]); ctx.strokeStyle = '#B9AE9F'; ctx.lineWidth = r; ctx.strokeRect(r, r, cv.width - 2 * r, cv.height - 2 * r); ctx.restore(); }
    var util = {}; (f.utilisees || []).forEach(function(i){ util[i] = true; });
    g.d.cases.forEach(function(p, i){
      var x = (p.x + g.dx) * k, y = (p.y + g.dy) * k, w = 50 * k, h = 30 * k;
      var c = f.cases[i];
      if (c) peindreEtiquette(ctx, c.etiquette, x, y, w, h, { bord: c.etiquette.fond === 'pale' });
      else {
        ctx.save(); ctx.setLineDash([4 * r, 4 * r]); ctx.strokeStyle = util[i] ? '#C0392B' : '#D5CCBF'; ctx.lineWidth = r; ctx.strokeRect(x, y, w, h);
        if (util[i]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + h); ctx.moveTo(x + w, y); ctx.lineTo(x, y + h); ctx.stroke(); }
        ctx.restore();
      }
    });
    cv.setAttribute('data-k', String(s));
  }
  /* Un clic dans l aperçu : la case devient « déjà utilisée » (ou se libère). Seulement sur la 1re feuille de chaque papier. */
  function clicPlan(ev){
    var cv = ev.target; if (!PL || !PL.R) return;
    var f = PL.R.feuilles[PL.vue];
    var premiere = PL.R.feuilles.filter(function(x){ return x.fond === f.fond; })[0] === f;
    if (!premiere) { szDire('${T("Les cases utilisées se marquent sur la première feuille de chaque papier.")}', 'att'); return; }
    var g = geoFeuille(), s = parseFloat(cv.getAttribute('data-k')) || 1;
    var b = cv.getBoundingClientRect(), mx = (ev.clientX - b.left) / s - g.dx, my = (ev.clientY - b.top) / s - g.dy;
    for (var i = 0; i < g.d.cases.length; i++) {
      var p = g.d.cases[i];
      if (mx >= p.x && mx <= p.x + 50 && my >= p.y && my <= p.y + 30) {
        var L = PL.sauter[f.fond] || (PL.sauter[f.fond] = []);
        var j = L.indexOf(i); if (j >= 0) L.splice(j, 1); else L.push(i);
        redemanderPlanche(); return;
      }
    }
  }

  /* ── L EXPORT : PNG (Cricut, 300 ppp, pHYs écrit) ou PDF (ciseaux) ───────── */
  var PPP = 300, MM = PPP / 25.4;
  var CRC = null;
  function crc32(b){
    if (!CRC) { CRC = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); CRC[n] = c >>> 0; } }
    var x = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) x = CRC[(x ^ b[i]) & 255] ^ (x >>> 8);
    return (x ^ 0xFFFFFFFF) >>> 0;
  }
  /* Le bloc pHYs (300 ppp = 11811 points par mètre), posé après IHDR : la taille réelle voyage avec l image. */
  function avecPhys(dataUrl){
    try {
      var bin = atob(dataUrl.split(',')[1]), o = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) o[i] = bin.charCodeAt(i);
      var ppm = Math.round(PPP / 0.0254);
      var ch = new Uint8Array(21);
      var dv = new DataView(ch.buffer);
      dv.setUint32(0, 9); ch[4] = 112; ch[5] = 72; ch[6] = 89; ch[7] = 115;
      dv.setUint32(8, ppm); dv.setUint32(12, ppm); ch[16] = 1;
      dv.setUint32(17, crc32(ch.subarray(4, 17)));
      var res = new Uint8Array(o.length + 21);
      res.set(o.subarray(0, 33), 0); res.set(ch, 33); res.set(o.subarray(33), 54);
      var s = ''; for (var j = 0; j < res.length; j += 8192) s += String.fromCharCode.apply(null, Array.prototype.slice.call(res.subarray(j, j + 8192)));
      return 'data:image/png;base64,' + btoa(s);
    } catch (e) { return dataUrl; }
  }
  function canevasFeuille(f, avecMarques){
    var d = PL.R.disposition;
    var cv = document.createElement('canvas');
    cv.width = Math.round(d.page.l * MM); cv.height = Math.round(d.page.h * MM);
    var ctx = cv.getContext('2d');
    if (avecMarques) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, cv.width, cv.height); }
    d.cases.forEach(function(p, i){
      var c = f.cases[i]; if (!c) return;
      // Module ENTIER à l export : 0,254 mm = 3 points à 300 ppp.
      peindreEtiquette(ctx, c.etiquette, Math.round(p.x * MM), Math.round(p.y * MM), Math.round(50 * MM), Math.round(30 * MM), { miroir: !!f.miroir, modPx: Math.max(2, Math.round(0.254 * MM)) });
    });
    if (avecMarques) {
      /* Les traits de coupe, DANS LA MARGE seulement (rien ne se dessine sur une étiquette). */
      var xs = {}, ys = {};
      d.cases.forEach(function(p){ xs[p.x] = 1; xs[p.x + 50] = 1; ys[p.y] = 1; ys[p.y + 30] = 1; });
      var x0 = Math.min.apply(null, Object.keys(xs).map(Number)), x1 = Math.max.apply(null, Object.keys(xs).map(Number));
      var y0 = Math.min.apply(null, Object.keys(ys).map(Number)), y1 = Math.max.apply(null, Object.keys(ys).map(Number));
      ctx.strokeStyle = '#000000'; ctx.lineWidth = Math.max(1, 0.2 * MM);
      ctx.beginPath();
      Object.keys(xs).map(Number).forEach(function(x){ ctx.moveTo(x * MM, (y0 - 7) * MM); ctx.lineTo(x * MM, (y0 - 2) * MM); ctx.moveTo(x * MM, (y1 + 2) * MM); ctx.lineTo(x * MM, (y1 + 7) * MM); });
      Object.keys(ys).map(Number).forEach(function(y){ ctx.moveTo(Math.max(0.5, x0 - 7) * MM, y * MM); ctx.lineTo((x0 - 2) * MM, y * MM); ctx.moveTo((x1 + 2) * MM, y * MM); ctx.lineTo(Math.min(d.page.l - 0.5, x1 + 7) * MM, y * MM); });
      ctx.stroke();
    }
    return cv;
  }
  function horodate(){ var t = new Date(); var z = function(n){ return ('0' + n).slice(-2); }; return t.getFullYear() + '-' + z(t.getMonth() + 1) + '-' + z(t.getDate()) + '-' + z(t.getHours()) + z(t.getMinutes()); }
  function noterImpression(){
    var cle = {}, lignes = [], nf = { fonce: 0, pale: 0 };
    PL.R.feuilles.forEach(function(f){
      nf[f.fond === 'pale' ? 'pale' : 'fonce']++;
      f.cases.forEach(function(c){
        if (!c) return;
        var k = c.id + '|' + c.taille;
        if (cle[k] == null) { cle[k] = lignes.length; lignes.push({ id: c.id, taille: c.taille, n: 0 }); }
        lignes[cle[k]].n++;
      });
    });
    return appeler('fibres:imprimee', [{ mode: PL.mode, lignes: lignes, feuilles: nf }]);
  }
  function exporter(b){
    if (!PL || !PL.R || !PL.R.feuilles.length) return;
    if (D.ca && D.ca.manquant) { szDire('${T("Saisissez d’abord le numéro CA (Fiscalité › Mon entreprise).")}', 'err'); return; }
    if (!P || typeof P.enregistrerExport !== 'function') { szDire('${T("Cette version de l’application ne sait pas enregistrer de fichier.")}', 'err'); return; }
    b.disabled = true; szDire('${T("Fabrication des fichiers…")}');
    var R = PL.R, quand = horodate();
    var fin = function(n, faute){
      b.disabled = false;
      if (faute) { szDire(faute, 'err'); return; }
      noterImpression().then(function(r){
        szDire(n + ' ${T("fichier(s) dans le dossier des exports.")}' + (r && r.ok ? '' : ' ${T("(Impression non notée sur les analyses : le nuage a refusé.)")}'), r && r.ok ? 'bon' : 'att');
        charger();
      });
    };
    if (PL.mode === 'cricut') {
      var d = R.disposition, po = function(mm){ return (Math.round(mm / 25.4 * 100) / 100).toFixed(2); };
      /* LES RÉGLAGES DE DESIGN SPACE qui font une coupe PROPRE (sa demande : aucun résidu de papier au transfert),
         rappelés avant CHAQUE export, dans sa boîte à part : c est là que se perd un liseré blanc. */
      var aPale = R.feuilles.some(function(f){ return f.fond === 'pale'; });
      b.disabled = false; szDire('');
      szConfirmer({ titre: '${T("Pour une coupe propre dans Design Space")}',
        texte: '${T("Chaque étiquette est une forme pleine aux coins arrondis : Design Space coupe exactement son contour. Ces réglages évitent tout liseré ou résidu de papier au transfert.")}',
        details: [
          ['${T("Fond perdu")}', '${T("ACTIVÉ (« Ajouter un fond perdu ») : l’encre dépasse un peu sous la ligne de coupe, donc aucun liseré de papier blanc autour d’une étiquette foncée.")}'],
          /* La Cricut Joy Xtra (sa machine) : Design Space, chez elle, plafonne cette forme à 6,72 × 9,26 po sur Lettre ;
             la planche fait 6,54 × 9,09 po (écarts 8 et 3,5 mm). Le redimensionnement automatique la rapetisserait. */
          ['${T("Taille")}', '${T("Régler la largeur à")} ' + po(d.page.l).replace('.', ',') + ' ${T("po exactement (comme dans le nom du fichier), et REFUSER le redimensionnement automatique : la planche entre déjà dans la zone de la Cricut Joy Xtra.")}'],
          ['${T("Miroir")}', aPale ? '${T("DÉSACTIVÉ dans Design Space : le fichier transparent est déjà en miroir (sinon il serait retourné deux fois).")}' : '${T("DÉSACTIVÉ.")}'],
          ['${T("Étalonnage")}', '${T("Une fois par machine : Menu › Étalonnage › Imprimer puis couper. Sans lui, la coupe peut glisser d’un millimètre.")}'],
          ['${T("Matériau")}', '${T("Celui de votre papier (ex. « Printable Iron-On »). Si un bord ne se détache pas tout seul : pression « Plus », lame propre.")}'],
          ['${T("Avant de presser")}', '${T("Retirer tout le papier autour de l’étiquette. Sur papier transparent, une fine pellicule claire reste au format exact de l’étiquette : c’est normal, elle ne déborde pas.")}']
        ],
        oui: '${T("Exporter les feuilles")}' }).then(function(ok){
      if (!ok) return;
      b.disabled = true; szDire('${T("Fabrication des fichiers…")}');
      var faits = 0;
      R.feuilles.reduce(function(pr, f, i){
        return pr.then(function(){
          var nom = 'etiquettes-cricut-' + quand + '-f' + (i + 1) + '-' + (f.fond === 'pale' ? 'transparent-miroir' : 'opaque') + '-largeur-' + po(d.page.l) + 'po.png';
          return Promise.resolve(P.enregistrerExport(nom, avecPhys(canevasFeuille(f, false).toDataURL('image/png')))).then(function(w){
            if (!w || !w.ok) throw new Error((w && w.annule) ? '${T("Export annulé.")}' : ((w && w.error) || '${T("écriture refusée")}'));
            faits++;
          });
        });
      }, Promise.resolve()).then(function(){ fin(faits); }, function(e){ fin(faits, '${T("Export interrompu :")} ' + ((e && e.message) || e)); });
      });
      return;
    }
    if (typeof P.documentPdf !== 'function') { b.disabled = false; szDire('${T("Cette version de l’application ne sait pas fabriquer de PDF.")}', 'err'); return; }
    var pages = R.feuilles.map(function(f){ return '<img src="' + canevasFeuille(f, true).toDataURL('image/png') + '">'; }).join('');
    var html = '<!doctype html><html><head><meta charset="utf-8"><style>@page{size:8.5in 11in;margin:0}html,body{margin:0;padding:0}'
      + 'img{display:block;width:8.5in;height:11in;page-break-after:always}img:last-child{page-break-after:auto}</style></head><body>' + pages + '</body></html>';
    Promise.resolve(P.documentPdf(html, { pageCss: true })).then(function(pdf){
      if (!pdf || !pdf.ok || !pdf.base64) { fin(0, '${T("Le PDF n’a pas pu être fabriqué.")}'); return; }
      var nom = 'etiquettes-ciseaux-' + quand + '-' + R.feuilles.length + 'f.pdf';
      Promise.resolve(P.enregistrerExport(nom, 'data:application/pdf;base64,' + pdf.base64)).then(function(w){
        if (!w || !w.ok) { fin(0, (w && w.annule) ? '${T("Export annulé.")}' : '${T("Export interrompu :")} ' + ((w && w.error) || '')); return; }
        fin(1);
      });
    });
  }

  /* ══ L HISTORIQUE D IMPRESSION ═════════════════════════════════════════════
     Une entrée par planche exportée, la plus récente d abord : date, qui, Cricut ou
     ciseaux, papiers, et chaque ligne (analyse, produit, taille, nombre). Une analyse
     supprimée depuis reste dans l historique, barrée ; un nom provisoire rattaché
     depuis prend le nom du produit. */
  var HPG = 0;
  function historiqueVue(){
    var H = D.historique || { total: 0, ceMois: 0, planches: 0, liste: [] };
    /* ⚠ PAS DE CASES DE CHIFFRES (sa règle du 2026-10-16 : « retirer ces cellules partout, sauf dans le tableau de
       bord », rapports compris) : les totaux sont une ligne de texte, dans le titre de la carte. */
    var h = '';
    var totaux = H.total + ' ${T("étiquettes imprimées en tout")} · ' + H.ceMois + ' ${T("ce mois-ci")} · ' + H.planches + ' ${T("planches exportées")}';
    if (!H.liste.length) return h + '<div class="cx-carte appel"><strong>${T("Rien d’imprimé pour l’instant")}</strong><div class="aide">${T("Chaque planche exportée s’inscrit ici, avec le détail par produit et par taille.")}</div></div>';
    var parPage = Math.max(3, Math.floor(((corps.clientHeight || 640) - 170) / 120));
    var nbp = Math.max(1, Math.ceil(H.liste.length / parPage));
    if (HPG >= nbp) HPG = nbp - 1; if (HPG < 0) HPG = 0;
    h += '<div class="cx-carte"><h2>${T("Historique d’impression")} <span class="cx-sub">' + esc(totaux) + '</span>'
      + (nbp > 1 ? '<span class="pages"><button type="button" class="mini pgf" data-hpg="-1" aria-label="${T("Page précédente")}"' + (HPG <= 0 ? ' disabled' : '') + '>‹</button><span>${T("Page")} ' + (HPG + 1) + ' / ' + nbp + '</span><button type="button" class="mini pgf" data-hpg="1" aria-label="${T("Page suivante")}"' + (HPG >= nbp - 1 ? ' disabled' : '') + '>›</button></span>' : '') + '</h2>';
    H.liste.slice(HPG * parPage, (HPG + 1) * parPage).forEach(function(x){
      var pap = [];
      if (x.feuilles && x.feuilles.fonce) pap.push(x.feuilles.fonce + ' ${T("opaque")}');
      if (x.feuilles && x.feuilles.pale) pap.push(x.feuilles.pale + ' ${T("transparent")}');
      h += '<div class="imp"><div class="t"><strong>' + x.total + ' ${T("étiquette(s)")}</strong><span>' + esc(szQuand(x.le)) + '</span>'
        + '<span class="rf-pill">' + (x.mode === 'ciseaux' ? '${T("Ciseaux")}' : 'Cricut') + '</span>'
        + (pap.length ? '<span class="gris">' + esc(pap.join(' · ')) + '</span>' : '') + (x.par ? '<span class="gris">' + esc(x.par) + '</span>' : '') + '</div><ul>'
        + (x.lignes || []).map(function(l){
            return '<li class="' + (l.supprimee ? 'sup' : '') + '">' + esc(l.no) + ' · ' + esc(l.nom) + (l.rattache ? '' : ' <span class="gris">${T("(à créer)")}</span>')
              + ' · ' + esc(l.taille || '${T("sans taille")}') + ' × ' + l.n + ' <span class="gris">' + esc(l.resume) + '</span></li>'; }).join('')
        + '</ul></div>';
    });
    return h + '</div>';
  }

  /* ══ LE DESSIN ═════════════════════════════════════════════════════════════ */
  function lecture(){
    if (PA || PM || PS) return '';
    return '<div class="avis"><span class="cx-averti" title="${T("Votre rôle permet de consulter les analyses, pas de les modifier.")}"><b>${T("Lecture seule.")}</b>'
      + '<span>${T("Votre rôle permet de consulter les analyses, pas de les modifier.")}</span></span></div>';
  }
  function dessiner(){
    outils();
    if (!D) return;
    var L = D.analyses || [];
    var nc = L.filter(function(a){ return a.etat === 'a_confirmer'; }).length;
    var H = D.historique || { total: 0, ceMois: 0 };
    elSous.textContent = L.length + ' ' + (L.length > 1 ? '${T("analyses")}' : '${T("analyse")}') + (nc ? ' · ' + nc + ' ${T("à confirmer")}' : '')
      + ' · ' + H.total + ' ${T("étiquette(s) imprimée(s)")}' + (H.ceMois ? ' (' + H.ceMois + ' ${T("ce mois-ci")})' : '')
      + (D.ca && D.ca.manquant ? ' · ${T("numéro CA à saisir")}' : '');
    if (VUE === 'analyse' && FORM) { corps.innerHTML = lecture() + formulaire(); majTotal(); peindreForm(); brancherDepot(); if (ETAPE === 1) ajusterEtape1(); return; }
    if (VUE === 'planche' && PL) { corps.innerHTML = '<div class="pl"><div>' + lots() + '</div><div>' + scene() + '</div></div>'; peindrePlan(); ajusterPlanche(); return; }
    if (VUE === 'historique') { corps.innerHTML = historiqueVue(); return; }
    corps.innerHTML = lecture() + banque();
    var tours = 0;
    while (corps.scrollHeight > corps.clientHeight + 1 && BU > 2 && tours < 60) { BU--; tours++; corps.innerHTML = lecture() + banque(); }
    ajusterDetail();
    peindreChoix();
  }
  /* LA COLONNE DE GAUCHE DE LA PLANCHE sur une petite fenêtre : les aides de la découpe cèdent la place
     (la feuille entamée d abord, puis le mode d emploi en deux lignes, texte entier au survol). Jamais de glissière. */
  function ajusterPlanche(){
    var col = corps.querySelector('.pl>div:first-child'); if (!col) return;
    var trop = function(){ return col.scrollHeight > col.clientHeight + 1; };
    if (trop()) Array.prototype.forEach.call(col.querySelectorAll('[data-optpl="1"]'), function(e){ e.style.display = 'none'; });
    if (trop()) Array.prototype.forEach.call(col.querySelectorAll('[data-optpl="2"]'), function(e){ e.title = e.textContent; e.classList.add('coupe2'); });
    if (trop()) Array.prototype.forEach.call(col.querySelectorAll('[data-optpl="2"]'), function(e){ e.style.display = 'none'; });
  }
  function brancherDepot(){
    var z = document.getElementById('f-depot'); if (!z) return;
    z.addEventListener('dragover', function(ev){ ev.preventDefault(); z.classList.add('survol'); });
    z.addEventListener('dragleave', function(){ z.classList.remove('survol'); });
    z.addEventListener('drop', function(ev){ ev.preventDefault(); z.classList.remove('survol'); ajouterFichiers(ev.dataTransfer && ev.dataTransfer.files); });
  }

  /* ── LA SAISIE suit la frappe ─────────────────────────────────────────── */
  function val(id){ var e = document.getElementById(id); return (e && typeof e.value === 'string') ? e.value : null; }
  function ramasser(){
    if (FORM) {
      FORM.composition.forEach(function(x, i){ var f = val('f-fib-' + i), p = val('f-pct-' + i); if (f != null) x.fibre = f; if (p != null) x.pct = p; });
      var v = val('f-provisoire'); if (v != null) FORM.nomProvisoire = v;
      v = val('f-remarque'); if (v != null) FORM.remarque = v;
      v = val('f-pays'); if (v != null) FORM.pays = v;
      var c = document.getElementById('f-copier'); if (c) FORM.copierFiche = !!c.checked;
    }
    if (PL) PL.lignes.forEach(function(l, i){
      var t = val('pl-t-' + i); if (t != null) l.taille = String(t).trim().toUpperCase().slice(0, 4);
      var n = val('pl-n-' + i); if (n != null) { var k = parseInt(n, 10); l.n = isFinite(k) ? Math.max(0, Math.min(500, k)) : 0; }
    });
  }

  /* ── LES GESTES ─────────────────────────────────────────────────────────── */
  function enregistrer(b){
    ramasser();
    var s = saisie();
    if (FORM.mode === 'inventaire' && !FORM.produit) { szDire(MOTIFS.produit_ou_nom, 'err'); return; }
    if (FORM.mode === 'provisoire' && !String(FORM.nomProvisoire).trim()) { szDire(MOTIFS.produit_ou_nom, 'err'); var e = document.getElementById('f-provisoire'); if (e) e.focus(); return; }
    var t = totalPct();
    if (s.composition.length && t !== 100) { szDire(MOTIFS.composition_total + ' ${T("Total actuel :")} ' + t + ' %.', 'err'); return; }
    if (b) b.disabled = true;
    szDire('${T("Enregistrement…")}');
    try { localStorage.setItem('sz-fibres-fond', FORM.fond); } catch (x) {}
    appeler('fibres:ecrire', [s]).then(function(r){
      if (b) b.disabled = false;
      if (!r || !r.ok) { szDire(expliquer(r), 'err'); if (r && r.motif === 'introuvable') { FORM = null; VUE = 'banque'; charger(); } return; }
      var msg = (FORM.id ? '${T("Analyse enregistrée.")}' : '${T("Analyse enregistrée :")} ' + (r.no || ''));
      if (r.fiche) msg += r.fiche.ok ? ' ${T("Fiche produit mise à jour.")}' : ' ${T("La fiche produit n’a PAS été mise à jour.")}';
      if (!s.composition.length) msg += ' ${T("Elle reste « à confirmer » tant que la composition n’est pas saisie.")}';
      szDire(msg, r.fiche && !r.fiche.ok ? 'att' : 'bon');
      var neuve = !FORM.id;
      CHOIX = r.id || CHOIX; FORM = null; VUE = 'banque'; charger().then(function(){
        if (CHOIX) choisir(CHOIX);
        /* Sa demande : une petite étiquette au numéro de l analyse, collée sur le vêtement tout de suite. */
        if (neuve && r.id) szConfirmer({ titre: '${T("Étiquette temporaire")}',
          texte: '${T("Imprimer l’étiquette de l’analyse")} ' + (r.no || '') + ' ${T("sur l’imprimante de codes-barres, pour la coller sur le vêtement en attendant l’étiquette thermocollante ?")}',
          oui: '${T("Imprimer l’étiquette")}' }).then(function(ok){ if (ok) etiquetteTemp(r.id); });
      });
    });
  }
  var _tQ = null;
  function chercher(q){
    clearTimeout(_tQ);
    _tQ = setTimeout(function(){
      appeler('fibres:produits', [q]).then(function(r){
        if (!FORM || !r || !r.ok) return;
        RES = r; var pos = document.getElementById('f-chercher'); var v = pos ? pos.value : q;
        dessiner(); var e = document.getElementById('f-chercher'); if (e) { e.value = v; e.focus(); e.setSelectionRange(v.length, v.length); }
      });
    }, 220);
  }

  document.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var a = t.closest('[data-act]');
    if (a && !a.disabled) {
      var act = a.getAttribute('data-act');
      if (act === 'nouvelle' && PA) { ouvrirForm(null); dessiner(); return; }
      if (act === 'banque') { ramasser(); FORM = null; PL = null; PHOTOS = []; VUE = 'banque'; dessiner(); if (CHOIX) choisir(CHOIX); return; }
      if (act === 'planche') { ouvrirPlanche(); dessiner(); return; }
      if (act === 'historique') { VUE = 'historique'; HPG = 0; dessiner(); return; }
    }
    var x;
    if ((x = t.closest('[data-filtre]'))) { FILTRE = x.getAttribute('data-filtre'); PG = 0; dessiner(); return; }
    if ((x = t.closest('[data-pg]'))) { PG += parseInt(x.getAttribute('data-pg'), 10) || 0; dessiner(); return; }
    if ((x = t.closest('[data-hpg]'))) { HPG += parseInt(x.getAttribute('data-hpg'), 10) || 0; dessiner(); return; }
    if ((x = t.closest('[data-rattacher]'))) {
      var ar = analyse(x.getAttribute('data-rattacher'));
      if (ar) { ouvrirForm(ar, 3); FORM.mode = 'inventaire'; FORM.produit = null; FORM.copierFiche = true; dessiner(); var ch0 = document.getElementById('f-chercher'); if (ch0) ch0.focus();
        szDire('${T("Cherchez le produit créé, choisissez-le, puis enregistrez : l’analyse et son historique lui seront rattachés.")}', 'att'); }
      return;
    }
    if ((x = t.closest('[data-coche]'))) {
      var idc = x.getAttribute('data-coche');
      if (x.checked) COCHES[idc] = true; else delete COCHES[idc];
      outils(); return;
    }
    if ((x = t.closest('[data-ouvrir]'))) { var ao = analyse(x.getAttribute('data-ouvrir')); if (ao) { ouvrirForm(ao); dessiner(); } return; }
    if ((x = t.closest('[data-temp]'))) { etiquetteTemp(x.getAttribute('data-temp')); return; }
    if ((x = t.closest('[data-sup]'))) {
      var ids = x.getAttribute('data-sup'), as = analyse(ids);
      szConfirmer({ danger: true, titre: '${T("Supprimer l’analyse")}',
        texte: '${T("L’analyse")} ' + (as ? as.no : '') + ' ${T("sera supprimée définitivement de la banque (la lecture de l’IA et la composition confirmée). Cette action est irréversible.")}',
        oui: '${T("Supprimer l’analyse")}' }).then(function(ok){
        if (!ok) return;
        appeler('fibres:supprimer', [ids]).then(function(r){
          if (!r || !r.ok) { szDire(expliquer(r), 'err'); return; }
          delete COCHES[ids]; if (CHOIX === ids) { CHOIX = ''; APERCU_CHOIX = null; }
          szDire('${T("Analyse supprimée.")}', 'bon'); charger();
        });
      });
      return;
    }
    /* L analyse */
    if (FORM) {
      if (t.closest('#f-depot')) { var fi = document.getElementById('f-fichier'); if (fi) { fi.value = ''; fi.click(); } return; }
      if ((x = t.closest('[data-otph]'))) { PHOTOS.splice(parseInt(x.getAttribute('data-otph'), 10), 1); dessiner(); return; }
      if (t.id === 'f-lire') { lire(); return; }
      /* La seconde analyse : une nouvelle photo ; la lecture actuelle sera gardée au moment de relire. */
      if (t.id === 'f-seconde') {
        PHOTOS = []; ETAPE = 1; dessiner();
        szDire('${T("Seconde analyse : déposez une nouvelle photo (une fibre isolée donne le meilleur résultat), puis « Relire les photos ».")}');
        var fs = document.getElementById('f-fichier'); if (fs) { fs.value = ''; fs.click(); }
        return;
      }
      if (t.id === 'f-utiliser' && FORM.lecture) {
        ramasser();
        var l = FORM.lecture;
        FORM.composition = [{ fibre: l.principale, pct: String(100) }].concat((l.possibles || []).map(function(k){ return { fibre: k, pct: '' }; }));
        if (!FORM.entretien.length) FORM.entretien = [];
        ETAPE = 2; dessiner(); redemanderApercu();
        szDire('${T("Estimation reprise : ajustez les pourcentages avec la fiche du fournisseur.")}', 'att');
        return;
      }
      if (t.id === 'f-ajfib') { ramasser(); FORM.composition.push({ fibre: '', pct: '' }); dessiner(); var nf = document.getElementById('f-fib-' + (FORM.composition.length - 1)); if (nf) nf.focus(); return; }
      if ((x = t.closest('[data-otfib]'))) { ramasser(); FORM.composition.splice(parseInt(x.getAttribute('data-otfib'), 10), 1); dessiner(); redemanderApercu(); return; }
      if (t.id === 'f-proposer') {
        ramasser();
        appeler('fibres:apercu', [saisie(), '']).then(function(r){
          if (!r || !r.ok || !FORM) return;
          if (!r.propose.length) { szDire('${T("Choisissez d’abord au moins une fibre.")}', 'att'); return; }
          FORM.entretien = r.propose.slice(); dessiner(); redemanderApercu();
          szDire('${T("Entretien proposé d’après les fibres — ajustez au besoin.")}', 'bon');
        });
        return;
      }
      if ((x = t.closest('[data-soin]'))) {
        ramasser();
        var k = x.getAttribute('data-soin'), i = FORM.entretien.indexOf(k);
        if (i >= 0) FORM.entretien.splice(i, 1); else FORM.entretien.push(k);
        x.setAttribute('aria-pressed', String(i < 0)); majCote(); redemanderApercu(); return;
      }
      if ((x = t.closest('[data-mode]'))) { ramasser(); FORM.mode = x.getAttribute('data-mode'); RES = null; dessiner(); redemanderApercu(); return; }
      if ((x = t.closest('[data-fond]'))) { ramasser(); FORM.fond = x.getAttribute('data-fond'); dessiner(); redemanderApercu(); return; }
      if ((x = t.closest('[data-prod]'))) {
        ramasser();
        var pid = x.getAttribute('data-prod');
        FORM.produit = (RES && RES.produits || []).filter(function(p){ return p.id === pid; })[0] || null; RES = null;
        dessiner(); return;
      }
      if (t.id === 'f-changer') { ramasser(); FORM.produit = null; RES = null; dessiner(); var ch = document.getElementById('f-chercher'); if (ch) ch.focus(); return; }
      if (t.id === 'f-ok') { enregistrer(t); return; }
      if ((x = t.closest('[data-etape]'))) { ramasser(); ETAPE = parseInt(x.getAttribute('data-etape'), 10) || 1; RES = null; dessiner(); return; }
      if (t.id === 'f-suiv') { ramasser(); ETAPE = Math.min(3, ETAPE + 1); RES = null; dessiner(); return; }
      if (t.id === 'f-prec') { ramasser(); ETAPE = Math.max(1, ETAPE - 1); RES = null; dessiner(); return; }
    }
    /* La planche */
    if (PL) {
      if ((x = t.closest('[data-plus]'))) { ramasser(); var lp = PL.lignes[+x.getAttribute('data-plus')]; if (lp) lp.n = Math.min(500, lp.n + 1); dessiner(); redemanderPlanche(); return; }
      if ((x = t.closest('[data-moins]'))) { ramasser(); var lm = PL.lignes[+x.getAttribute('data-moins')]; if (lm) lm.n = Math.max(0, lm.n - 1); dessiner(); redemanderPlanche(); return; }
      if ((x = t.closest('[data-otlot]'))) { ramasser(); PL.lignes.splice(+x.getAttribute('data-otlot'), 1); dessiner(); redemanderPlanche(); return; }
      if ((x = t.closest('[data-dup]'))) { ramasser(); var ld = PL.lignes[+x.getAttribute('data-dup')]; if (ld) PL.lignes.splice(+x.getAttribute('data-dup') + 1, 0, { id: ld.id, taille: '', n: 1 }); dessiner(); redemanderPlanche(); return; }
      if ((x = t.closest('[data-modepl]'))) { ramasser(); PL.mode = x.getAttribute('data-modepl'); PL.sauter = { fonce: [], pale: [] }; try { localStorage.setItem('sz-fibres-mode', PL.mode); } catch (e2) {} redemanderPlanche(); return; }
      if ((x = t.closest('[data-vue]'))) { PL.vue = +x.getAttribute('data-vue'); dessiner(); return; }
      if (t.id === 'cv-plan') { clicPlan(ev); return; }
      if (t.id === 'pl-export') { ramasser(); exporter(t); return; }
      if (t.id === 'pl-dossier') { if (P && P.ouvrirDossierExports) P.ouvrirDossierExports(); return; }
      if (t.id === 'pl-fisc') { if (P && P.ouvrirModule) { P.ouvrirModule('impot'); szDire('${T("Ouverture de Fiscalité et impôt…")}'); } return; }
    }
    /* Un clic sur une ligne la MONTRE à droite (sans tout redessiner : le double-clic doit trouver la même ligne). */
    var ln = t.closest('[data-ana]');
    if (ln && !t.closest('button') && !t.closest('input')) {
      Array.prototype.forEach.call(corps.querySelectorAll('.ana.sel') || [], function(e){ if (e !== ln) e.classList.remove('sel'); });
      ln.classList.add('sel');
      var idl = ln.getAttribute('data-ana');
      if (idl !== CHOIX) { choisir(idl); var dt = corps.querySelector('.duo>div:last-child'); if (dt) { dt.innerHTML = detail(); ajusterDetail(); } }
    }
  });
  document.addEventListener('dblclick', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('button') || t.closest('input')) return;
    var ln = t.closest('[data-ana]');
    if (ln && PM) { var a = analyse(ln.getAttribute('data-ana')); if (a) { ouvrirForm(a); dessiner(); } }
  });
  document.addEventListener('input', function(ev){
    var t = ev.target;
    if (t && t.id === 'f-q') { Q = t.value; PG = 0; var p = t.selectionStart; dessiner(); var e = document.getElementById('f-q'); if (e) { e.focus(); e.setSelectionRange(p, p); } return; }
    if (t && t.id === 'f-chercher') { chercher(t.value); return; }
    ramasser();
    if (FORM && t && /^f-pct-/.test(t.id)) { majTotal(); redemanderApercu(); }
    if (PL && t && /^pl-/.test(t.id)) redemanderPlanche();
  });
  document.addEventListener('change', function(ev){
    var t = ev.target;
    if (t && t.id === 'f-fichier') { ajouterFichiers(t.files); return; }
    ramasser();
    if (FORM && t && (/^f-fib-/.test(t.id) || t.id === 'f-pays')) redemanderApercu();
    if (PL && t && /^pl-/.test(t.id)) redemanderPlanche();
  });
  document.addEventListener('keydown', function(ev){
    var t = ev.target;
    if ((ev.key === 'Enter' || ev.key === ' ') && t && t.id === 'f-depot') { ev.preventDefault(); var fi = document.getElementById('f-fichier'); if (fi) { fi.value = ''; fi.click(); } return; }
    if (ev.key === 'Enter' && t && t.id === 'f-scan') { ev.preventDefault(); scanner(t.value); return; }
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    if (VUE !== 'banque') { FORM = null; PL = null; PHOTOS = []; VUE = 'banque'; dessiner(); if (CHOIX) choisir(CHOIX); return; }
    if (P && P.fermer) P.fermer();
  });
  window.addEventListener('resize', function(){
    clearTimeout(window._fbT);
    window._fbT = setTimeout(function(){ BU = 0; if (D) dessiner(); }, 180);
  });
  /* ⚠ JAMAIS PENDANT UNE SAISIE : recharger remettrait le formulaire à zéro. */
  function rechargerSiLibre(){ if (!OCCUPE && VUE === 'banque') charger(); }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) rechargerSiLibre(); });
  window.szActualiser = rechargerSiLibre;
  window.szRevenir = rechargerSiLibre;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  charger();
})();
</script></body></html>`;
}

module.exports = { pageFibres };
