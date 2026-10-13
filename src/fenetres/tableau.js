'use strict';

/*
 * FENÊTRE « TABLEAU DE BORD » — NATIVE, EN DIRECT
 * =============================================================================
 * Refaite le 2026-10-12 d'après sa démo approuvée (« 100 % dynamique », sur le
 * modèle d'un tableau de bord d'inventaire) : trois rangées qui TIENNENT dans la
 * fenêtre, sans aucune barre de défilement (sa règle du même jour) :
 *   1. l'activité des commandes (à confirmer, à préparer, à expédier, en
 *      livraison) avec le parcours du jour, et l'inventaire ;
 *   2. la courbe des arrivées (aujourd'hui contre hier, ou la semaine / le mois
 *      contre la période d'avant) et le fil « En direct » des dernières commandes ;
 *   3. les produits (jauge des variantes en stock), les meilleures ventes avec
 *      leurs photos, et les commandes par canal.
 *
 * ⚠⚠ PLUS DE TUILES (sa décision du même jour : « il n'y a plus lieu de garder
 * aucune tuile de ce genre »). Ce qui attend un geste devient une PUCE « à faire »
 * dans la barre, et seulement quand ce n'est pas zéro ; ce qui est à zéro se
 * range dans la pastille « N à zéro » (un clic les montre).
 *
 * ⚠⚠ IL SE RELIT TOUT SEUL (toutes les 12 s), même quand on travaille dans un
 * autre module — mais il N'ENVOIE AUCUNE NOTIFICATION : les annonces sont le
 * métier du veilleur (sa demande). Une commande neuve se signale ici en glissant
 * dans le fil, rien de plus.
 *
 * ⚠ LE CALCUL VIT DANS LE SITE (Admin._tableauVivant, sans DOM) : cette fenêtre
 * ne fait que dessiner. Dupliquer les sommes ici, c'était garantir deux chiffres
 * qui ne s'accordent plus au premier ajustement.
 *
 * ⚠ GARDÉS : le Mode exclusif (super-administrateur), la dernière sauvegarde
 * (lue à part, réseau), l'avis de taux de change, les cadenas en direct et
 * l'éclair « Lancer la préparation » (verrou relu au clic).
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('tableau');

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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.75rem 1rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.65rem}
.corps>*{flex:0 0 auto}
select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
select:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .45rem;font-size:.74rem}
.avis{font-size:.78rem;line-height:1.45;border-radius:9px;padding:.4rem .7rem;
  background:rgba(245,158,11,.11);border:1px solid rgba(245,158,11,.42);color:var(--tx-or2)}

/* ── LA BARRE : période, en direct, puces à faire, pastille des zéros ── */
.barre{display:flex;align-items:center;gap:.45rem .6rem;flex-wrap:wrap}
.direct{display:inline-flex;align-items:center;gap:.4rem;font-size:.72rem;font-weight:700;color:var(--tx-ok);
  background:rgba(34,197,94,.12);padding:.16rem .6rem;border-radius:99px;white-space:nowrap}
.direct i{width:7px;height:7px;border-radius:99px;background:currentColor;animation:tb-pouls 1.8s ease-out infinite}
html.jour .direct{color:#22663a}
@keyframes tb-pouls{0%{box-shadow:0 0 0 0 rgba(34,197,94,.55)}100%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}
.periode{display:inline-flex;gap:3px;padding:3px;border-radius:9px;background:var(--v04);border:1px solid var(--v10)}
.periode button{border:0;background:transparent;border-radius:6px;padding:.18rem .65rem;font-size:.76rem;font-weight:600;color:var(--tx2)}
.periode button.on{background:var(--or);color:#1a1208}
.faire{display:inline-flex;align-items:center;gap:.3rem;font-size:.76rem;padding:.18rem .6rem;border-radius:99px;
  background:var(--v06);border:1px solid var(--v14);white-space:nowrap}
.faire b{font-weight:800}
.faire.urgent{border-color:rgba(248,113,113,.5);color:var(--tx-err2)}
.zeros{position:relative}
.zero-puce{font-size:.72rem;color:var(--tx3);background:transparent;border:1px dashed var(--v16);border-radius:99px;padding:.16rem .6rem}
.zero-pop{position:absolute;top:130%;left:0;z-index:20;min-width:15rem;background:var(--f-carte);border:1px solid var(--v12);
  border-radius:10px;padding:.5rem .7rem;box-shadow:0 12px 28px rgba(0,0,0,.35);font-size:.78rem;color:var(--tx2)}
.zero-pop div{display:flex;justify-content:space-between;gap:1rem;padding:.16rem 0}
.barre .droite{margin-left:auto;display:flex;align-items:center;gap:.5rem;font-size:.76rem;color:var(--tx2);white-space:nowrap}

/* ── LA GRILLE : trois rangées, celle du milieu prend ce qui reste ── */
.grille{flex:1 1 auto;min-height:0;display:grid;gap:.65rem;grid-template-columns:repeat(12,minmax(0,1fr));
  grid-template-rows:auto minmax(0,1fr) auto}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;padding:.65rem .85rem;min-width:0;min-height:0;overflow:hidden}
.carte h2{margin:0 0 .5rem;font-size:.68rem;text-transform:uppercase;letter-spacing:.09em;color:var(--tx2);font-weight:700;
  display:flex;align-items:center;gap:.5rem}
.carte h2 .aside{margin-left:auto;text-transform:none;letter-spacing:0;font-weight:500;color:var(--tx3);font-size:.72rem}
.c8{grid-column:span 8}.c4{grid-column:span 4}.c3{grid-column:span 3}.c5{grid-column:span 5}
@media (max-width:1240px){.r1a,.r2a{grid-column:span 7}.r1b,.r2b{grid-column:span 5}}

/* rangée 1 : l activité et l inventaire */
.flux{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5rem}
.etape{position:relative;text-align:center;padding:.45rem .3rem .55rem;border-radius:10px;border:1px solid var(--v07);
  background:var(--v03);cursor:pointer;transition:border-color .2s}
.etape:hover{border-color:var(--or)}
.etape .n{font-size:1.75rem;font-weight:300;line-height:1.1;color:inherit;font-variant-numeric:tabular-nums}
.etape .lib{font-size:.66rem;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
.etape::after{content:"";position:absolute;left:26%;right:26%;bottom:0;height:3px;border-radius:3px 3px 0 0;background:currentColor;opacity:.8}
.parcours{margin-top:.55rem;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:.7rem;align-items:center;font-size:.73rem;color:var(--tx2)}
.parcours b{color:var(--tx)}
.p-barre{display:flex;gap:3px;height:9px;border-radius:5px;overflow:hidden;background:var(--v05)}
.p-barre i{transition:flex .6s ease}
.inv{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.45rem}
.inv>div{background:var(--v03);border:1px solid var(--v07);border-radius:10px;padding:.4rem .6rem;cursor:pointer}
.inv .k{font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.inv .v{font-size:1.3rem;font-weight:300;font-variant-numeric:tabular-nums;white-space:nowrap}
.inv .v.err{color:var(--tx-err)}.inv .v.att{color:var(--tx-att)}
.valeur{display:flex;justify-content:space-between;align-items:baseline;margin-top:.5rem;font-size:.74rem;color:var(--tx2)}
.valeur b{font-size:.98rem;color:var(--tx);font-variant-numeric:tabular-nums}

/* rangée 2 : la courbe et le fil */
.courbe{display:flex;flex-direction:column}
.kpis{display:flex;gap:1.5rem;margin-bottom:.1rem}
.kpi .k{font-size:.62rem;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.07em}
.kpi .v{font-size:1.2rem;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.2}
.kpi .d{font-size:.68rem;font-weight:700;color:var(--tx3)}
.kpi .d.haut{color:var(--tx-ok)}.kpi .d.bas{color:var(--tx-err)}
.zone{flex:1 1 auto;min-height:0;position:relative}
.zone svg{position:absolute;inset:0;width:100%;height:100%}
.legende{display:flex;gap:1rem;font-size:.68rem;color:var(--tx2)}
.legende span::before{content:"";display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:.35rem;vertical-align:middle;background:var(--tx-or)}
.legende span.avant::before{background:repeating-linear-gradient(90deg,var(--tx3) 0 4px,transparent 4px 7px)}
.direct-carte{display:flex;flex-direction:column}
.fil{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:6px;overflow:hidden}
/* Les onglets Commandes | Retours de la carte En direct, et le parcours des retours (2026-10-12). */
.dir-ong{margin-left:auto;display:inline-flex;gap:2px;padding:2px;border-radius:9px;background:var(--v04);border:1px solid var(--v10)}
.dir-ong button{border:0!important;background:transparent!important;color:var(--tx2);font-size:.72rem;font-weight:600;padding:.22rem .6rem;border-radius:7px;min-height:0;
  display:inline-flex;align-items:center;gap:.35rem;transition:background .2s,color .2s}
.dir-ong button:hover{color:var(--tx)}
.dir-ong button[aria-selected="true"]{background:rgba(var(--or-rgb),.18)!important;color:var(--tx);box-shadow:inset 0 -2px 0 var(--or)}
.dir-ong button b{font-size:.66rem;padding:0 .38rem;border-radius:99px;background:var(--tx-att);color:#1a1208}
html.jour .dir-ong button b{color:#ffffff}
.r-parcours{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-bottom:6px}
.r-et{display:flex;flex-direction:column;align-items:center;gap:1px;padding:.32rem .2rem;border-radius:9px;background:var(--v03);border:1px solid var(--v07);cursor:pointer;
  transition:border-color .2s,background .2s}
.r-et:hover{border-color:rgba(var(--or-rgb),.5);background:rgba(var(--or-rgb),.06)}
.r-et b{font-size:1.05rem;font-variant-numeric:tabular-nums}
.r-et span{font-size:.66rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}
.r-et.chaud b{color:var(--tx-att)}
.r-alerte{font-size:.72rem;color:var(--tx-att);margin:-2px 0 6px;cursor:pointer}
.r-alerte:hover{text-decoration:underline}
.cmd.ret .a .motif{color:var(--tx3);overflow:hidden;text-overflow:ellipsis}
.cmd{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.4rem .55rem;border-radius:10px;background:var(--v03);
  border:1px solid var(--v07);cursor:pointer}
.cmd:hover{border-color:rgba(var(--or-rgb),.45);background:linear-gradient(90deg,rgba(var(--or-rgb),.12),var(--v03) 65%)}
.cmd.neuve{animation:tb-arrive .7s cubic-bezier(.2,.8,.2,1);border-color:rgba(34,197,94,.55)}
@keyframes tb-arrive{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
.cmd.prio{box-shadow:inset 3px 0 0 var(--tx-att)}
.cmd.cache{display:none}
.ph{width:32px;height:40px;border-radius:7px;flex:0 0 auto;overflow:hidden;background:#fff;display:grid;place-items:center;
  font-size:.7rem;font-weight:800;color:#5a6574;border:1px solid var(--v08)}
.ph img{width:100%;height:100%;object-fit:cover}
.cmd .t{min-width:0;flex:1 1 auto}
.cmd .t b{display:flex;align-items:center;gap:.3rem;font-size:.8rem;white-space:nowrap;overflow:hidden}
.cmd .a .rf-pill{font-size:.66rem;padding:.08rem .45rem}
/* Un nom trop long se COUPE avec « … » (2026-10-12, sa demande) : le montant et l éclair gardent leur place. */
.cmd .t b span.nm{min-width:0;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis}
.cmd .t .a{font-size:.7rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cmd .m{text-align:right;flex:0 0 auto}
.cmd .m b{font-size:.84rem;font-variant-numeric:tabular-nums;white-space:nowrap}
.cmd .m div{font-size:.66rem;color:var(--tx3);white-space:nowrap}
/* Prioritaire : un « ! » dans un cercle jaune (2026-10-12, sa demande) — dessine en CSS, pas un emoji : il garde sa couleur. */
.prio-pill{flex:0 0 auto;display:inline-grid;place-items:center;width:1.05rem;height:1.05rem;border-radius:50%;
  background:#fbbf24;color:#1a1208;font-size:.72rem;font-weight:900;line-height:1;box-shadow:0 0 0 2px rgba(251,191,36,.22)}
.cadslot{display:inline}
button.eclair{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:1.9rem;height:1.9rem;padding:0;
  border-radius:8px;border:1px solid rgba(var(--or-rgb),.6);background:rgba(var(--or-rgb),.2);color:var(--tx-or)}
button.eclair svg{width:15px;height:15px;fill:currentColor}
button.eclair:hover:not(:disabled){background:var(--or);color:#1a1208;border-color:var(--or)}
html.jour button.eclair{color:#6b5940}
button.eclair:disabled{opacity:.35;cursor:not-allowed;filter:grayscale(1)}
.fil-pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;font-size:.7rem;color:var(--tx3);
  padding-top:.4rem;margin-top:.4rem;border-top:1px solid var(--v07)}
.vide{padding:1rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}

/* LE TOP 100 : une boite au-dessus du tableau de bord, le classement en pages (socle), aucune glissiere. */
.voile{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:1.2rem;background:rgba(4,8,14,.66)}
html.jour .voile{background:rgba(20,24,30,.35)}
.boite{width:100%;max-width:58rem;height:min(46rem,94vh);display:flex;flex-direction:column;gap:.6rem;
  background:var(--f-carte);border:1px solid var(--v12);border-radius:13px;padding:1rem 1.1rem}
.boite h3{margin:0;font-size:1.05rem;display:flex;align-items:center;gap:.6rem}
.boite h3 .aside{margin-left:auto;font-size:.76rem;font-weight:500;color:var(--tx3)}
.boite .classement{flex:1 1 auto;min-height:0;overflow:hidden}
.boite table{width:100%;border-collapse:collapse;font-size:.86rem}
.boite thead th{text-align:left;font-size:.66rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);padding:.3rem .5rem;border-bottom:1px solid var(--v10)}
.boite th.d,.boite td.d{text-align:right}
.boite tbody td{padding:.42rem .5rem;border-top:1px solid var(--v05);vertical-align:middle;font-variant-numeric:tabular-nums}
.boite .rg{width:2.6rem;font-weight:800;color:var(--tx2)}
.boite tr.podium .rg{color:var(--tx-or)}
.boite .prd{display:flex;align-items:center;gap:.6rem;min-width:0}
.boite .prd .rf-av{width:2rem;height:2rem}
.boite .pied-boite{display:flex;justify-content:flex-end}
/* rangée 3 : produits, meilleures ventes, canaux */
.details{display:grid;grid-template-columns:minmax(0,1fr) 110px;gap:.5rem;align-items:center}
/* Chaque ligne est un LIEN vers l endroit ou ces elements sont listes (2026-10-12, sa demande). */
.details .r{display:flex;justify-content:space-between;align-items:center;gap:.4rem;padding:.24rem .3rem;margin:0 -.3rem;border-bottom:1px solid var(--v07);
  font-size:.82rem;cursor:pointer;border-radius:6px}
.details .r b::after{content:"›";display:inline-block;margin-left:.4rem;color:var(--tx3);font-weight:400;transition:transform .25s ease,color .25s ease}
/* LES SURVOLS DU THEME (2026-10-12, sa demande : « sans soulignement, plus stylés, avec fondu ») : un voile
   dans l accent du jeu de couleurs qui s estompe vers la droite, un filet a gauche, la fleche qui glisse. */
.details .r,.inv>div,.cmd{transition:background .28s ease,box-shadow .28s ease,border-color .28s ease}
.details .r:hover{background:linear-gradient(90deg,rgba(var(--or-rgb),.18),rgba(var(--or-rgb),.03) 70%,transparent);
  box-shadow:inset 3px 0 0 var(--or)}
.details .r:hover b::after{transform:translateX(3px);color:var(--or)}
.inv>div:hover{border-color:rgba(var(--or-rgb),.55);background:linear-gradient(160deg,rgba(var(--or-rgb),.14),rgba(var(--or-rgb),.02) 75%)}
.details .r:last-child{border-bottom:0}
.details .r b{font-variant-numeric:tabular-nums}
.details .r.alerte,.details .r.alerte b{color:var(--tx-err)}
.jauge{text-align:center}
.jauge svg{width:110px;height:66px;display:block;margin:0 auto}
.jauge .lib{font-size:.64rem;color:var(--tx2)}
.top{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.45rem}
.top .p{text-align:center;padding:.35rem .3rem .4rem;border-radius:10px;background:var(--v03);border:1px solid var(--v07);position:relative;min-width:0}
.top .rang{position:absolute;top:5px;left:5px;width:18px;height:18px;border-radius:99px;display:grid;place-items:center;
  font-size:.62rem;font-weight:800;background:var(--or);color:#1a1208}
.top .im{height:64px;display:grid;place-items:center;margin-bottom:.15rem}
.top .im img{max-height:64px;max-width:100%;object-fit:contain;border-radius:5px;background:#fff}
.top .im span{width:46px;height:46px;border-radius:99px;display:grid;place-items:center;background:var(--v06);color:var(--tx2);font-weight:800}
.top .nom{font-size:.7rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.top .q{font-size:1rem;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.2}
.top .q small{font-size:.64rem;color:var(--tx2);font-weight:500}
.canaux{display:grid;gap:.45rem}
.canal .nm{display:flex;justify-content:space-between;font-size:.76rem;margin-bottom:.16rem}
.canal .nm b{font-variant-numeric:tabular-nums}
.pile{display:flex;height:8px;border-radius:5px;overflow:hidden;background:var(--v05);gap:2px}

.cles{display:flex;flex-wrap:wrap;gap:.2rem .65rem;font-size:.62rem;color:var(--tx2);margin-top:.15rem}
.cles i{display:inline-block;width:7px;height:7px;border-radius:2px;margin-right:.28rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.pied:has(.msg:empty){padding:0;border-top:0}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}.cmd.neuve{animation-duration:.01s}}
`;

/** Page complète de la fenêtre native « Tableau de bord ». */
function pageTableau() {
  return `${TETE()}
<title>${T("Tableau de bord — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.tableau}</span><h1>${T("Tableau de bord")}</h1>
  <span class="sous" id="sous"></span><span id="tb-mx-slot"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');

  var D = null;              // les donnees du site (tableau:lire)
  var PERIODE = 'jour';      // jour | 7j | mois — la courbe et ses chiffres
  var ZEROS = false;         // la pastille des zeros est ouverte
  var VUS = null;            // les commandes deja montrees dans le fil (pour signaler les neuves)
  var NEUVES = {};
  /* Le mode usage exclusif : « MX » reste nul tant que le serveur n a pas repondu, et il refuse
     (superadmin_required) a qui n a pas le droit — le bouton ne parait donc QUE pour un
     super-administrateur. Sa regle du 2026-09-09 : masquer, pas griser. */
  var MX = null;
  /* La derniere sauvegarde : lue A PART, apres le premier dessin — c est le seul chiffre qui passe
     par le RESEAU (backup.php interroge R2). Fraicheur de quinze secondes. */
  var SAUV = null, SAUV_QUAND = 0, SAUV_EN_COURS = false;
  var VERROUS = {};          // #38 : { <idCommande>: { par, mine } } — sonde toutes les ~3 s
  var VERROU_TIMER = null, VIF_TIMER = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function fmt(n){ return szArgent(n); }
  function pl(n, un, plus){ return n + ' ' + szPl(n, un, plus); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès au tableau de bord.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }
  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length) return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }
  function ilYa(d){
    var s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
    if (!(s >= 0) || !isFinite(s)) return '';
    if (s < 60) return '${T("à l’instant")}';
    if (s < 3600) return '${T("il y a {0} min")}'.split('{0}').join(Math.floor(s / 60));
    if (s < 86400) return '${T("il y a {0} h")}'.split('{0}').join(Math.floor(s / 3600));
    return szJour(d);
  }
  function image(url, alt){
    return /^https:[/][/]/i.test(String(url || ''))
      ? '<img src="' + esc(url) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-i="' + esc(initiales(alt)) + '" onerror="this.parentNode.textContent=this.dataset.i">'
      : '<span>' + esc(initiales(alt)) + '</span>';
  }

  /* ══ LES PUCES « A FAIRE » ET LA PASTILLE DES ZEROS ═══════════════════════
     Ce qui attend un geste et n est pas a zero devient une puce ; le reste est range dans la
     pastille. Les ruptures n en sont pas : elles se commandent, elles ne se « traitent » pas en un
     clic (elles sont dans la carte Inventaire). */
  function files(){
    var t = D.tuiles || {}, f = D.aFaire || {};
    var l = [
      ['support-mgmt', t.messagerie, '${T("message sans réponse")}', '${T("messages sans réponse")}', false, '${T("Messagerie")}'],
      ['chat', t.clavardage, '${T("conversation en attente de réponse")}', '${T("conversations en attente de réponse")}', false, '${T("Clavardage")}'],
      ['returns-pending', t.retoursNouveaux, '${T("retour à traiter")}', '${T("retours à traiter")}', false, '${T("Retours à traiter")}'],
      ['returns-expiring', t.retoursExpirent, '${T("retour sur le point d’expirer")}', '${T("retours sur le point d’expirer")}', true, '${T("Retours qui expirent")}'],
      ['reviews', f.avis, '${T("avis à modérer")}', '${T("avis à modérer")}', false, '${T("Avis à modérer")}'],
      ['billing', f.facturesRetard, '${T("facture en retard")}', '${T("factures en retard")}', true, '${T("Factures en retard")}'],
      ['security-incidents', f.incidentsCai, '${T("avis à la CAI à transmettre")}', '${T("avis à la CAI à transmettre")}', true, '${T("Avis à la CAI")}']
    ];
    return l.map(function(x){ return { cible: x[0], n: x[1] || 0, un: x[2], plus: x[3], urgent: x[4], nom: x[5] }; });
  }
  /* La sauvegarde : une puce SEULEMENT si elle est vieille (plus de 7 jours) ou absente — une base
     non protegee ne doit pas se lire comme une ligne d information parmi d autres. */
  function sauvegardeTexte(){
    if (!SAUV || SAUV.interdite) return null;
    if (SAUV.erreur) return { urgent: false, texte: '${T("Dernière sauvegarde : illisible")}' };
    if (SAUV.aucune) return { urgent: true, texte: '${T("Aucune sauvegarde : la base n’est pas protégée")}' };
    var j = SAUV.jours;
    var quand = (j === 0) ? '${T("aujourd’hui")}' : (j === 1 ? '${T("hier")}' : '${T("il y a {0} jours")}'.split('{0}').join(j));
    return { urgent: j > 7, texte: '${T("Dernière sauvegarde :")} ' + quand };
  }

  function barre(){
    var fs = files(), actifs = fs.filter(function(x){ return x.n > 0; }), zeros = fs.filter(function(x){ return !(x.n > 0); });
    var sv = sauvegardeTexte();
    var h = '<div class="barre"><span class="direct" title="${T("Les chiffres se mettent à jour d’eux-mêmes")}"><i></i>${T("En direct")}</span>'
      + '<span class="periode" role="group" aria-label="${T("Période")}">'
      + [['jour', '${T("Aujourd’hui")}'], ['7j', '${T("7 jours")}'], ['mois', '${T("Ce mois")}']].map(function(p){
          return '<button type="button" data-periode="' + p[0] + '" class="' + (PERIODE === p[0] ? 'on' : '') + '" aria-pressed="' + (PERIODE === p[0]) + '">' + p[1] + '</button>';
        }).join('') + '</span>'
      + actifs.map(function(x){
          return '<button type="button" class="faire' + (x.urgent ? ' urgent' : '') + '" data-ouvre="' + x.cible + '"><b>' + x.n + '</b>' + esc(x.n > 1 ? x.plus : x.un) + '</button>';
        }).join('')
      + (sv && sv.urgent ? '<button type="button" class="faire urgent" data-ouvre="sauvegarde">' + esc(sv.texte) + '</button>' : '');
    var nz = zeros.length + (sv && !sv.urgent ? 1 : 0);
    if (nz) {
      h += '<span class="zeros"><button type="button" class="zero-puce" id="tb-zeros" aria-expanded="' + ZEROS + '">'
        + '${T("{0} à zéro")}'.split('{0}').join(nz) + '</button>'
        + (ZEROS ? '<span class="zero-pop">' + zeros.map(function(x){ return '<div><span>' + esc(x.nom) + '</span><b>0</b></div>'; }).join('')
            + (sv && !sv.urgent ? '<div><span>' + esc(sv.texte) + '</span></div>' : '') + '</span>' : '')
        + '</span>';
    }
    h += '</div>';
    // Le Mode exclusif vit dans l en-tete, a cote de la date : la barre garde sa ligne pour les puces.
    var slot = document.getElementById('tb-mx-slot');
    if (slot) slot.innerHTML = (MX && MX.ok) ? '<button class="mini" id="tb-mx" title="${T("Empecher toute autre connexion pendant une maintenance")}">'
      + (MX.actif ? '\u{1F512} ${T("Mode exclusif : ACTIF")}' : '\u{1F512} ${T("Mode exclusif")}…') + '</button>' : '';
    return h;
  }

  function tauxAvis(){
    if (!D.taux) return '';
    return '<div class="avis"><span class="ic">💱</span> ' + (D.taux.genre === 'secours'
      ? '<strong>${T("Taux de change indisponible.")}</strong> ${T("Les prix affichés en USD utilisent un taux ")}'
        + '${T("de secours (1 USD =")} ' + szNombre(D.taux.rate, 4) + ' ${T("CAD), donc approximatif.")} '
        + '${T("Les commandes, elles, sont toujours facturées en dollars canadiens.")}'
      : '<strong>${T("Taux de change vieux de")} ' + D.taux.ageHeures + ' h</strong> ${T("(relevé du ")}'
        + esc(szQuand(D.taux.quand) || '') + ', 1 USD = ' + szNombre(D.taux.rate, 4) + ' CAD). '
        + '${T("Les prix en USD peuvent s’écarter du marché.")}') + '</div>';
  }

  function ecart(v){
    if (v == null) return '<div class="d">&nbsp;</div>';
    var c = v > 0 ? 'haut' : (v < 0 ? 'bas' : '');
    return '<div class="d ' + c + '">' + (v > 0 ? '+' : '') + v + ' % ${T("vs période d’avant")}</div>';
  }

  /* ══ LE DESSIN ═════════════════════════════════════════════════════════ */
  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var V = D.vivant;
    if (!V) { vide('${T("Tableau de bord indisponible")}', '${T("Le site n’a pas encore cette version du tableau de bord.")}'); return; }
    var e = V.etapes || {}, pc = V.parcours || {}, iv = V.inventaire || {}, pr = V.produits || {}, k = V.kpi || {};
    var h = barre() + tauxAvis() + '<div class="grille">';

    // ── rangée 1 ──
    var etape = function(n, lib, c){ return '<div class="etape" data-ouvre="orders" style="color:' + c + '" title="${T("Ouvrir les commandes")}"><div class="n">' + (n || 0) + '</div><div class="lib">' + lib + '</div></div>'; };
    h += '<section class="carte c8 r1a"><h2>${T("Activité des commandes")}<span class="aside">${T("ce qui attend un geste")}</span></h2>'
      + '<div class="flux">' + etape(e.confirmer, '${T("À confirmer")}', 'var(--tx-bleu)') + etape(e.preparer, '${T("À préparer")}', 'var(--tx-att)')
      + etape(e.expedier, '${T("À expédier")}', 'var(--tx-or)') + etape(e.livraison, '${T("En livraison")}', 'var(--tx-ok)') + '</div>'
      + '<div class="parcours"><span>${T("Parcours du jour")} · <b>' + (pc.total || 0) + '</b></span><div class="p-barre" title="'
      + esc('${T("Reçues")} ' + (pc.recues || 0) + ' · ${T("En préparation")} ' + (pc.preparation || 0) + ' · ${T("Parties")} ' + (pc.parties || 0)) + '">'
      + (pc.recues ? '<i style="background:var(--tx-bleu);flex:' + pc.recues + '"></i>' : '') + (pc.preparation ? '<i style="background:var(--tx-att);flex:' + pc.preparation + '"></i>' : '')
      + (pc.parties ? '<i style="background:var(--tx-ok);flex:' + pc.parties + '"></i>' : '') + '</div>'
      + '<span>' + (V.delaiMoyenH != null ? '${T("Délai moyen avant envoi")} <b>' + delai(V.delaiMoyenH) + '</b>' : '${T("Aucun envoi ces 30 derniers jours")}') + '</span></div></section>';
    h += '<section class="carte c4 r1b"><h2>${T("Inventaire")}</h2><div class="inv">'
      + '<div data-ouvre="inventory" title="${T("Ouvrir l’inventaire")}"><div class="k">${T("En main")}</div><div class="v">' + (iv.enMain || 0) + '</div></div>'
      + '<div data-ouvre="inventory-reappro" title="${T("Voir le réapprovisionnement")}"><div class="k">${T("À commander")}</div><div class="v' + (iv.aCommander ? ' att' : '') + '">' + (iv.aCommander || 0) + '</div></div>'
      + '<div data-ouvre="inventory-rupture" title="${T("Voir les produits en rupture")}"><div class="k">${T("En rupture")}</div><div class="v' + (iv.ruptures ? ' err' : '') + '">' + (iv.ruptures || 0) + '</div></div></div>'
      + '<div class="valeur"><span>${T("Valeur du stock (au coût)")}' + (iv.sansCout ? ' · ' + pl(iv.sansCout, '${T("produit sans coût")}', '${T("produits sans coût")}') : '') + '</span><b>' + fmt(iv.valeur || 0) + '</b></div></section>';

    // ── rangée 2 ──
    h += '<section class="carte c8 r2a courbe"><h2>${T("Arrivée des commandes")}<span class="aside">'
      + (PERIODE === 'jour' ? '${T("par heure, aujourd’hui contre hier")}' : (PERIODE === '7j' ? '${T("par jour, 7 derniers jours contre les 7 d’avant")}' : '${T("par jour, ce mois contre le mois dernier")}'))
      + '</span></h2><div class="kpis">'
      + '<div class="kpi"><div class="k">${T("Commandes")}</div><div class="v">' + (k.commandes || 0) + '</div>' + ecart(k.ecartCommandes) + '</div>'
      + '<div class="kpi"><div class="k">${T("Ventes")}</div><div class="v">' + fmt(k.ventes || 0) + '</div>' + ecart(k.ecartVentes) + '</div>'
      + '<div class="kpi"><div class="k">${T("Panier moyen")}</div><div class="v">' + fmt(k.panier || 0) + '</div>' + ecart(k.ecartPanier) + '</div></div>'
      + '<div class="zone" id="zone"><svg id="graphe" role="img" aria-label="${T("Commandes par période")}"></svg></div>'
      + '<div class="legende"><span>' + (PERIODE === 'jour' ? '${T("Aujourd’hui")}' : '${T("Cette période")}') + '</span><span class="avant">'
      + (PERIODE === 'jour' ? '${T("Hier")}' : '${T("Période d’avant")}') + '</span></div></section>';
    var fil = V.fil || [];
    var geste = !!D.peutPreparer;
    var RET = V.retours || { comptes: {}, liste: [] };
    var rc = RET.comptes || {};
    var aTraiterR = (rc.nouveaux || 0) + (rc.recus || 0) + (rc.analyse || 0);
    var avecRet = !!D.peutRetours;
    if (!avecRet) DIRECT = 'cmd';
    h += '<section class="carte c4 r2b direct-carte"><h2>${T("En direct")}'
      + (avecRet
          ? '<span class="dir-ong" role="tablist"><button type="button" role="tab" data-direct="cmd" aria-selected="' + (DIRECT === 'cmd') + '">${T("Commandes")}</button>'
            + '<button type="button" role="tab" data-direct="ret" aria-selected="' + (DIRECT === 'ret') + '">${T("Retours")}' + (aTraiterR ? '<b>' + aTraiterR + '</b>' : '') + '</button></span>'
          : '<span class="aside">${T("dernières commandes")}</span>')
      + '</h2>';
    if (DIRECT === 'ret') {
      /* LE PARCOURS D UN RETOUR, d un coup d oeil : chaque etape est un lien vers la liste des retours. */
      var etapeR = function(n, lib, cls, cible){ return '<div class="r-et' + (n ? ' ' + cls : '') + '" data-ouvre="' + (cible || 'returns') + '"><b>' + (n || 0) + '</b><span>' + lib + '</span></div>'; };
      h += '<div class="r-parcours">' + etapeR(rc.nouveaux, '${T("Nouveaux")}', 'chaud', 'returns-pending') + etapeR(rc.approuves, '${T("Approuvés")}', '')
        + etapeR(rc.transit, '${T("En transit")}', '') + etapeR(rc.recus, '${T("Reçus")}', 'chaud') + '</div>'
        + (rc.expirent ? '<div class="r-alerte" data-ouvre="returns-expiring">' + pl(rc.expirent, '${T("retour arrive à échéance")}', '${T("retours arrivent à échéance")}') + '</div>' : '')
        + '<div class="fil" id="fil">'
        + ((RET.liste || []).length ? RET.liste.map(function(r){
            var tonR = { pending: 'ambre', awaiting_photo: 'ambre', approved: 'bleu', in_transit: 'bleu', received: 'ambre', disputed: 'rouge',
              refunded: 'vert', completed: 'vert', rejected: 'rouge' }[r.statut] || '';
            return '<div class="cmd ret' + (r.expireBientot ? ' prio' : '') + '" data-retour="' + esc(r.id) + '" title="${T("Ouvrir le retour")}">'
              + '<div class="t"><b><span class="nm">' + esc(r.client || '—') + '</span>'
              + (r.expireBientot ? '<span class="prio-pill" role="img" title="${T("Arrive à échéance le")} ' + esc(r.expireLe) + '" aria-label="${T("Arrive à échéance")}">!</span>' : '') + '</b>'
              + '<div class="a"><span class="rf-code">' + esc(r.commande) + '</span> <span class="rf-pill ' + tonR + '">' + esc(szTd(r.statutLibelle || r.statut)) + '</span>'
              + (r.motif ? ' <span class="motif">' + esc(r.motif) + '</span>' : '') + '</div></div>'
              + '<div class="m"><b>' + (r.valeur ? fmt(r.valeur) : pl(r.articles || 0, '${T("article")}', '${T("articles")}')) + '</b><div>' + esc(ilYa(r.maj || r.date)) + '</div></div>'
              + '</div>';
          }).join('') : '<div class="vide">${T("Aucun retour en cours.")}</div>')
        + '</div><div class="fil-pied"><span id="fil-compte"></span><button class="mini" data-ouvre="returns">${T("Tout voir →")}</button></div></section>';
    } else {
      h += '<div class="fil" id="fil">'
      + (fil.length ? fil.map(function(c){
          var preparable = geste && c.oid && !c.comptoir && ['shipped', 'delivered', 'cancelled', 'refunded', 'returned'].indexOf(c.statut) < 0;
          /* PAS DE PHOTO ICI (2026-10-12, sa demande) : le CLIENT, le MONTANT et la priorite d abord ; dessous,
             le numero et le statut de la commande. */
          var ton = { delivered: 'vert', shipped: 'bleu', confirmed: 'bleu', verification: 'bleu', pending: 'ambre', preparing: 'ambre', cancelled: 'rouge' }[c.statut] || '';
          return '<div class="cmd' + (c.prioritaire ? ' prio' : '') + (NEUVES[c.oid] ? ' neuve' : '') + '" data-ligne="' + esc(c.oid) + '" title="${T("Ouvrir la commande")}">'
            + '<div class="t"><b><span class="nm">' + esc(c.client || c.numero || '—') + '</span>'
            + (c.prioritaire ? '<span class="prio-pill" role="img" title="${T("Prioritaire")} — ${T("Traitement prioritaire demandé par le client")}" aria-label="${T("Prioritaire")}">!</span>' : '')
            + '<span class="cadslot" data-cad="' + esc(c.oid) + '"></span></b>'
            + '<div class="a"><span class="rf-code">' + esc(c.numero) + '</span> <span class="rf-pill ' + ton + '">' + esc(szTd(c.statutLibelle || c.statut)) + '</span></div></div>'
            + '<div class="m"><b>' + fmt(c.total) + '</b><div>' + esc(ilYa(c.date)) + '</div></div>'
            + (preparable ? '<button type="button" class="eclair" data-prep="' + esc(c.oid) + '" data-eclair="' + esc(c.oid) + '" title="${T("Lancer la préparation")}" aria-label="'
                + esc('${T("Lancer la préparation de")} ' + c.numero) + '"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.2 1 3 9.1h4.1L6.6 15 13 6.6H8.8z"/></svg></button>' : '')
            + '</div>';
        }).join('') : '<div class="vide">${T("Aucune commande pour l’instant.")}</div>')
      + '</div><div class="fil-pied"><span id="fil-compte"></span><button class="mini" data-ouvre="orders">${T("Tout voir →")}</button></div></section>';
    }

    // ── rangée 3 ──
    var pct = pr.variantes ? Math.round(pr.enStock / pr.variantes * 100) : 0;
    h += '<section class="carte c3"><h2>${T("Produits")}</h2><div class="details"><div>'
      + '<div class="r' + (pr.aCommander ? ' alerte' : '') + '" data-ouvre="inventory-reappro" title="${T("Voir le réapprovisionnement")}"><span>${T("À commander")}</span><b>' + (pr.aCommander || 0) + '</b></div>'
      + '<div class="r" data-ouvre="products" title="${T("Ouvrir les produits en vente")}"><span>${T("En vente")}</span><b>' + (pr.enVente || 0) + '</b></div>'
      + '<div class="r" data-ouvre="inventory" title="${T("Ouvrir l’inventaire")}"><span>${T("Variantes")}</span><b>' + (pr.variantes || 0) + '</b></div>'
      + '<div class="r' + (pr.ruptures ? ' alerte' : '') + '" data-ouvre="inventory-rupture" title="${T("Voir les produits en rupture")}"><span>${T("En rupture")}</span><b>' + (pr.ruptures || 0) + '</b></div></div>'
      + '<div class="jauge"><svg viewBox="0 0 160 96" aria-hidden="true">'
      + '<path d="M14 86 A66 66 0 0 1 146 86" fill="none" stroke="var(--v10)" stroke-width="16" stroke-linecap="round"/>'
      + '<path d="M14 86 A66 66 0 0 1 146 86" fill="none" stroke="var(--tx-ok)" stroke-width="16" stroke-linecap="round" pathLength="100" stroke-dasharray="' + pct + ' 100"/>'
      + '<text x="80" y="80" text-anchor="middle" font-size="26" font-weight="700" fill="var(--tx)">' + pct + ' %</text></svg>'
      + '<div class="lib">${T("variantes en stock")}</div></div></div></section>';
    /* Le PODIUM (les 3 premiers) par defaut ; le bouton ouvre le TOP 100 (2026-10-12, sa demande). */
    var top = (V.top || []).slice(0, 3);
    h += '<section class="carte c5"><h2>${T("Meilleures ventes")}<span class="aside">${T("ce mois-ci")}</span>'
      + ((V.top || []).length ? '<button type="button" class="mini" id="tb-top100">${T("Top 100")} \u2192</button>' : '') + '</h2>'
      + (top.length ? '<div class="top">' + top.map(function(x, i){
          return '<div class="p"><span class="rang">' + (i + 1) + '</span><div class="im">' + image(x.image, x.nom) + '</div>'
            + '<div class="nom" title="' + esc(x.nom) + '">' + esc(x.nom) + '</div><div class="q">' + x.qte + ' <small>' + szPl(x.qte, '${T("vendu")}', '${T("vendus")}') + '</small></div></div>';
        }).join('') + '</div>' : '<div class="vide">${T("Aucune vente ce mois-ci.")}</div>') + '</section>';
    var COUL = [['pending', 'var(--tx-att)', '${T("En attente")}'], ['confirmed', 'var(--tx-bleu)', '${T("Confirmées")}'],
      ['preparing', 'var(--tx-or)', '${T("Préparation")}'], ['shipped', 'var(--tx-gris2)', '${T("Expédiées")}'], ['delivered', 'var(--tx-ok)', '${T("Livrées")}']];
    var NOMS = { enligne: '${T("Boutique en ligne")}', comptoir: '${T("Vente au comptoir")}', telephone: '${T("Téléphone")}' };
    var cx = V.canaux || [];
    h += '<section class="carte c4"><h2>${T("Par canal")}<span class="aside">${T("ce mois-ci")}</span></h2>'
      + (cx.length ? '<div class="canaux">' + cx.map(function(c){
          return '<div class="canal"><div class="nm"><span>' + esc(NOMS[c.cle] || c.nom) + '</span><b>' + c.total + '</b></div><div class="pile">'
            + COUL.map(function(s){ var v = (c.statuts || {})[s[0]] || 0; return v ? '<i style="background:' + s[1] + ';flex:' + v + '" title="' + esc(s[2] + ' : ' + v) + '"></i>' : ''; }).join('') + '</div></div>';
        }).join('') + '</div><div class="cles">' + COUL.map(function(s){ return '<span><i style="background:' + s[1] + '"></i>' + s[2] + '</span>'; }).join('') + '</div>'
        : '<div class="vide">${T("Aucune commande ce mois-ci.")}</div>') + '</section>';

    h += '</div>';
    corps.innerHTML = h;
    graphe();
    ajusterFil();
    appliquerVerrous();
  }
  function delai(hh){
    var h = Math.floor(hh), m = Math.round((hh - h) * 60);
    return h >= 48 ? '${T("{0} jours")}'.split('{0}').join(Math.round(hh / 24)) : (h + ' h' + (m ? ' ' + (m < 10 ? '0' : '') + m : ''));
  }

  /* La courbe, dessinee a la taille REELLE de sa zone (elle remplit la carte, jamais plus). */
  function graphe(){
    var z = document.getElementById('zone'), svg = document.getElementById('graphe');
    if (!z || !svg || !D || !D.vivant) return;
    var w = z.clientWidth, h = z.clientHeight;
    if (!(w > 40 && h > 40)) return;
    var C = D.vivant.courbe || {}, A = C.actuel || [], B = C.precedent || [], E = C.etiquettes || [], n = A.length;
    if (!n) { svg.innerHTML = ''; return; }
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var g0 = 26, d0 = w - 10, haut = 18, bas = h - 18;
    var max = Math.max(4, Math.max.apply(null, A.concat(B)) + 1);
    var pas = Math.max(1, Math.ceil(max / 4));
    var X = function(i){ return n > 1 ? g0 + i * ((d0 - g0) / (n - 1)) : (g0 + d0) / 2; };
    var Y = function(v){ return bas - (v / max) * (bas - haut); };
    var lisse = function(v, jusqu){
      var d = 'M' + X(0) + ' ' + Y(v[0] || 0);
      for (var i = 1; i <= jusqu; i++) { var cx = (X(i - 1) + X(i)) / 2; d += ' C' + cx + ' ' + Y(v[i - 1] || 0) + ' ' + cx + ' ' + Y(v[i] || 0) + ' ' + X(i) + ' ' + Y(v[i] || 0); }
      return d;
    };
    var s = '';
    for (var y = 0; y <= max; y += pas) s += '<line x1="' + g0 + '" x2="' + d0 + '" y1="' + Y(y) + '" y2="' + Y(y) + '" stroke="var(--v07)"/>'
      + '<text x="' + (g0 - 7) + '" y="' + (Y(y) + 3) + '" font-size="10" fill="var(--tx3)" text-anchor="end">' + y + '</text>';
    var tous = C.mode === 'heure' ? 3 : Math.max(1, Math.ceil(n / 10));
    for (var i = 0; i < n; i += tous) s += '<text x="' + X(i) + '" y="' + (h - 4) + '" font-size="10" fill="var(--tx3)" text-anchor="middle">' + E[i] + (C.mode === 'heure' ? ' h' : '') + '</text>';
    s += '<defs><linearGradient id="tb-aire" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--tx-or)" stop-opacity=".35"/><stop offset="1" stop-color="var(--tx-or)" stop-opacity="0"/></linearGradient></defs>';
    s += '<path d="' + lisse(B, n - 1) + '" fill="none" stroke="var(--tx3)" stroke-width="1.5" stroke-dasharray="4 4" opacity=".7"/>';
    var c = Math.min(n - 1, Math.max(0, C.courant || 0)), a = lisse(A, c), xd = X(c), yd = Y(A[c] || 0);
    s += '<path d="' + a + ' L' + xd + ' ' + bas + ' L' + X(0) + ' ' + bas + ' Z" fill="url(#tb-aire)"/>';
    s += '<path d="' + a + '" fill="none" stroke="var(--tx-or)" stroke-width="2.5" stroke-linecap="round"/>';
    s += '<circle cx="' + xd + '" cy="' + yd + '" r="10" fill="var(--tx-or)" opacity=".18"><animate attributeName="r" values="5;12;5" dur="1.8s" repeatCount="indefinite"/></circle>';
    s += '<circle cx="' + xd + '" cy="' + yd + '" r="4.2" fill="var(--tx-or)" stroke="var(--f-carte)" stroke-width="2"/>';
    s += '<text x="' + Math.min(d0 - 20, Math.max(g0 + 20, xd)) + '" y="' + Math.max(12, yd - 12) + '" font-size="11" font-weight="700" fill="var(--tx)" text-anchor="middle">' + (A[c] || 0) + '</text>';
    svg.innerHTML = s;
  }

  /* L ONGLET DE LA CARTE EN DIRECT (2026-10-12, sa demande : « un onglet pour suivre les retours, super important,
     en direct aussi ») : Commandes ou Retours, retenu sur le poste. */
  var DIRECT = 'cmd';
  try { if (localStorage.getItem('sz-tb-direct') === 'ret') DIRECT = 'ret'; } catch (e) {}

  /* Le fil : AUTANT DE COMMANDES QUE LA CARTE EN MONTRE, jamais de defilement (sa regle). */
  function ajusterFil(){
    var f = document.getElementById('fil'); if (!f) return;
    var els = f.querySelectorAll('.cmd'), vus = 0;
    Array.prototype.forEach.call(els, function(e){ e.classList.remove('cache'); });
    var bas = f.getBoundingClientRect().bottom + 0.5;
    Array.prototype.forEach.call(els, function(e){ if (e.getBoundingClientRect().bottom > bas) e.classList.add('cache'); else vus++; });
    var cpt = document.getElementById('fil-compte');
    // Le fil montre les DERNIERES commandes (aujourd hui ou avant) : le compte dit combien sont a l ecran.
    if (cpt) cpt.textContent = els.length ? (DIRECT === 'ret' ? '${T("{0} sur {1} retours")}' : '${T("{0} sur {1} dernières")}').split('{0}').join(vus).split('{1}').join(els.length) : '';
  }
  var _tbRedim = null;
  window.addEventListener('resize', function(){ clearTimeout(_tbRedim); _tbRedim = setTimeout(function(){ graphe(); ajusterFil(); }, 120); });

  /* ══ LES GESTES ══════════════════════════════════════════════════════════ */
  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('#tb-top100')) { top100(); return; }
    var dj = t.closest('[data-direct]');
    if (dj) { DIRECT = dj.getAttribute('data-direct'); try { localStorage.setItem('sz-tb-direct', DIRECT); } catch (e) {} dessiner(); return; }
    var rt = t.closest('[data-retour]');
    if (rt) { appeler('retours:ouvrir', [rt.getAttribute('data-retour')]).then(function(r){ if (!r || !r.ok) dire(expliquer(r), 'err'); else dire(''); }); return; }
    var pe = t.closest('[data-periode]');
    if (pe) { PERIODE = pe.getAttribute('data-periode'); charger(); return; }
    if (t.closest('#tb-zeros')) { ZEROS = !ZEROS; dessiner(); return; }
    var ec = t.closest('button[data-prep]');
    if (ec) { if (!ec.disabled) lancerPreparation(ec.getAttribute('data-prep'), ec); return; }
    var ou = t.closest('[data-ouvre]');
    if (ou) { ouvrir(ou.getAttribute('data-ouvre')); return; }
    var li = t.closest('[data-ligne]');
    if (li && li.getAttribute('data-ligne')) {
      appeler('commandes:ouvrirDetail', [li.getAttribute('data-ligne')]).then(function(r){
        if (!r || !r.ok) dire(expliquer(r), 'err'); else dire('');
      });
    }
  };
  var slotMx = document.getElementById('tb-mx-slot');
  if (slotMx) slotMx.onclick = function(ev){
    if (ev.target && ev.target.closest && ev.target.closest('#tb-mx'))
      appeler('maintenance:ouvrir', []).then(function(r){ if (!r || !r.ok) dire(expliquer(r), 'err'); });
  };
  /* ══ LE TOP 100 ══════════════════════════════════════════════════════════ */
  var TOP100 = false;
  function top100(){
    var l = (D && D.vivant && D.vivant.top) || [];
    var v = document.createElement('div');
    v.className = 'voile'; v.id = 'tb-voile';
    v.innerHTML = '<div class="boite" role="dialog" aria-modal="true" aria-label="${T("Top 100 des meilleures ventes")}">'
      + '<h3>${T("Top 100 des meilleures ventes")}<span class="aside">${T("ce mois-ci")} · ' + pl(l.length, '${T("produit")}', '${T("produits")}') + '</span></h3>'
      + '<div class="classement" data-pages="tb-top100"><table><thead><tr><th>#</th><th>${T("Produit")}</th><th class="d">${T("Vendus")}</th><th class="d">${T("Ventes")}</th></tr></thead><tbody>'
      + l.map(function(x, i){
          return '<tr class="' + (i < 3 ? 'podium' : '') + '"><td class="rg">' + (i + 1) + '</td>'
            + '<td><div class="prd">' + szVignette(x.image, x.nom, '', x.nom) + '<span>' + esc(x.nom) + '</span></div></td>'
            + '<td class="d"><b>' + x.qte + '</b></td><td class="d">' + fmt(x.ventes || 0) + '</td></tr>';
        }).join('')
      + '</tbody></table></div><div class="pied-boite"><button type="button" class="mini" id="tb-top100-fermer">${T("Fermer")}</button></div></div>';
    document.body.appendChild(v);
    TOP100 = true;
    v.addEventListener('click', function(ev){
      if (ev.target === v || (ev.target.closest && ev.target.closest('#tb-top100-fermer'))) fermerTop100();
    });
  }
  function fermerTop100(){
    var v = document.getElementById('tb-voile'); if (v) v.remove();
    TOP100 = false;
  }
  document.addEventListener('click', function(ev){
    if (ZEROS && ev.target && ev.target.closest && !ev.target.closest('.zeros')) { ZEROS = false; dessiner(); }
  });

  function ouvrir(cible){
    if (!cible) return;
    appeler('tableau:ouvrir', [cible]).then(function(r){
      if (!r || !r.ok) dire(expliquer(r), 'err'); else dire('');
    });
  }

  /* ══ LE CHARGEMENT, ET LE DIRECT ═════════════════════════════════════════
     ⚠ RENVOIE SA PROMESSE : la coquille l attend avant de montrer la vue (dock:ouvrir).
     ⚠ LES COMMANDES NEUVES glissent dans le fil (une fois) — aucune notification ici. */
  var CHARGE_EN_COURS = false;
  function charger(){
    if (CHARGE_EN_COURS) return Promise.resolve();
    CHARGE_EN_COURS = true;
    return appeler('tableau:lire', ['all', PERIODE]).then(function(r){
      CHARGE_EN_COURS = false;
      if (!r || !r.ok) { if (!D) vide('${T("Tableau de bord indisponible")}', expliquer(r)); return; }
      var fil = (r.vivant && r.vivant.fil) || [];
      NEUVES = {};
      if (VUS) fil.forEach(function(c){ if (c.oid && !VUS[c.oid]) NEUVES[c.oid] = true; });
      VUS = {}; fil.forEach(function(c){ if (c.oid) VUS[c.oid] = true; });
      D = r;
      dessiner();
      chargerSauvegarde();
    });
  }
  /* Il se relit seul toutes les 12 s, meme derriere un autre module (sa demande) — sauf pendant que
     la pastille des zeros est ouverte (on ne redessine pas sous les doigts). */
  function demarrerDirect(){
    if (VIF_TIMER) return;
    VIF_TIMER = setInterval(function(){ if (!ZEROS && !TOP100) charger(); }, 12000);
  }

  function chargerSauvegarde(forcer){
    if (SAUV_EN_COURS) return;
    if (!forcer && SAUV !== null && (Date.now() - SAUV_QUAND) < 15000) return;
    SAUV_EN_COURS = true;
    appeler('tableau:sauvegarde', []).then(function(r){
      SAUV_EN_COURS = false; SAUV_QUAND = Date.now();
      if (r && r.ok) SAUV = r;
      else if (r && r.motif === 'droit') SAUV = { interdite: true };
      else SAUV = { erreur: expliquer(r) };
      if (D) dessiner();
    });
  }

  function mxLire(){
    appeler('maintenance:etat', []).then(function(r){
      var avant = MX && MX.ok ? (MX.actif ? 2 : 1) : 0;
      MX = r || { ok: false };
      var apres = MX && MX.ok ? (MX.actif ? 2 : 1) : 0;
      if (avant !== apres) dessiner();
    });
  }
  window.szMaintenanceChangee = function(){ mxLire(); };

  /* ══ CADENAS ET ECLAIR EN DIRECT (#38) ════════════════════════════════════
     Sondage leger des verrous toutes les ~3 s : on pose/retire les cadenas et on eteint l eclair
     d une commande qu un COLLEGUE tient, SANS redessiner. */
  function cadInner(oid){
    if (!oid || !VERROUS[oid]) return '';
    var v = VERROUS[oid];
    var t = v.mine ? '${T("Vous tenez cette fiche en modification")}' : ('${T("En traitement par")} ' + (v.par || '${T("un collegue")}'));
    return '<span class="cad' + (v.mine ? ' mine' : '') + '" title="' + esc(t) + '"><span class="ic">🔒</span></span>';
  }
  function appliquerVerrous(){
    var slots = document.querySelectorAll('.cadslot');
    for (var i = 0; i < slots.length; i++) slots[i].innerHTML = cadInner(slots[i].getAttribute('data-cad'));
    var ecs = document.querySelectorAll('button[data-eclair]');
    for (var j = 0; j < ecs.length; j++){
      var v = VERROUS[ecs[j].getAttribute('data-eclair')];
      var pris = !!(v && !v.mine);
      ecs[j].disabled = pris;
      ecs[j].title = pris ? ('${T("En traitement par")} ' + (v.par || '${T("un collegue")}')) : '${T("Lancer la préparation")}';
    }
  }
  /* ⚠ LE VERROU EST RELU AU CLIC : le sondage a jusqu a trois secondes de retard. */
  function lancerPreparation(oid, bouton){
    if (bouton) bouton.disabled = true;
    appeler('tableau:verrous', []).then(function(r){
      if (r && r.ok && r.orders) { VERROUS = r.orders; appliquerVerrous(); }
      var v = VERROUS[oid];
      if (v && !v.mine) {
        dire('${T("En traitement par")} ' + (v.par || '${T("un collegue")}') + '${T(" — la préparation reste fermée tant qu’elle n’est pas libérée.")}', 'att');
        return;
      }
      dire('${T("Ouverture…")}');
      return appeler('commandes:preparer', [oid]).then(function(x){
        if (bouton) bouton.disabled = false;
        dire(x && x.ok ? '${T("Préparation ouverte dans sa fenêtre.")}' : expliquer(x), x && x.ok ? 'bon' : 'err');
      });
    });
  }
  function chargerVerrous(){
    appeler('tableau:verrous', []).then(function(r){
      if (!r || !r.ok || !r.orders) return;
      VERROUS = r.orders;
      appliquerVerrous();
    });
  }
  function demarrerVerrous(){
    if (VERROU_TIMER) return;
    chargerVerrous();
    VERROU_TIMER = setInterval(chargerVerrous, 3000);
  }
  window.addEventListener('pagehide', function(){
    if (VERROU_TIMER) { clearInterval(VERROU_TIMER); VERROU_TIMER = null; }
    if (VIF_TIMER) { clearInterval(VIF_TIMER); VIF_TIMER = null; }
  });

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : une vente, un produit modifie ou un remboursement fait
     relire les chiffres sans attendre le prochain battement. */
  window.szActualiser = function(){ if (!ZEROS) charger(); };
  window.szRevenir = function(){
    SAUV_QUAND = 0;
    var p = charger();
    mxLire();
    return p;
  };
  /* ⚠ LE TABLEAU DE BORD NE SE DETACHE PAS (demande du 2026-08-09) : c est l ecran d ouverture de
     session. Pas de bouton ; la coquille refuse aussi (dock:detacher, NON_DETACHABLES). */
  window.szModeAncre = function(){
    var b = document.getElementById('sz-detacher');
    if (b) b.remove();
  };
  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    if (TOP100) { fermerTop100(); return; }
    if (ZEROS) { ZEROS = false; dessiner(); return; }
    ev.preventDefault();
    P.fermer();
  });

  // La date vit dans l en-tete : la barre garde sa ligne pour les puces.
  var sous = document.getElementById('sous');
  if (sous) sous.textContent = new Date().toLocaleDateString('${LIEU()}', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  window.szPret = charger();
  demarrerVerrous();
  demarrerDirect();
  mxLire();
})();
</script>
</body></html>`;
}

module.exports = { pageTableau };
