'use strict';
/*
 * EMPLOYÉS ET PAIE — fenêtre native (2026-11-22 ; refaite le 2026-11-23, piste A)
 * =============================================================================
 * Sa demande : « le module employé et paie devra être revu côté fonctionnalité et design »,
 * puis « Piste A » (https://claude.ai/artifact/2WmgSpkWuoNtT8QLF1YSp5).
 *
 * Quatre onglets, un seul cœur (assets/js/employes.js, par le pont) :
 *   Aujourd'hui  la journée : qui travaille, qui arrive, les trous de couverture, ce qui est à régler.
 *   Horaire      une ligne de temps PAR JOUR : le quart prévu, le pointage réel dessous, les congés
 *                hachurés, les modèles de quart à poser d'un clic ; la semaine en résumé dessous.
 *   Équipe       des fiches, et le détail dans un panneau : taux daté, vacances, maladie, contact.
 *   Paie         la période : fériés, maladie, vacances, commissions, brut ; le bulletin de chacun ;
 *                « Approuver » fige la période ; l'export CSV ; l'historique ; les réglages.
 *
 * ⚠ LE RAPPORT EST UN BRUT AVANT RETENUES. RRQ, AE, RQAP et impôts se calculent dans
 *   le logiciel de paie : l'écran le dit, l'export aussi.
 *
 * États d'ouverture (pour les bancs de rendu, qui ne cliquent pas) :
 *   'aujourdhui' | 'horaire' | 'equipe' | 'paie' | 'reglages' → l'onglet (ou la boîte) ouvert d'emblée.
 */
const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('employes');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .cx-resume{color:var(--tx2);font-size:.8rem}
select,input,button,textarea{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;
  padding:.3rem .5rem;cursor:pointer}
input,textarea{cursor:text}
input[type=checkbox],input[type=radio]{width:auto;padding:0;cursor:pointer}
select:focus,input:focus,button:focus-visible{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--sz-btn-prim,var(--or));border-color:transparent;color:var(--sz-btn-prim-txt,#1a1208);font-weight:700}
button.prim:hover:not(:disabled){background:var(--sz-btn-prim-fort,var(--or))}
button.dang{color:var(--tx-err2)}
button.mini{padding:.15rem .55rem;font-size:.78rem}
#corps{flex:1 1 auto;min-height:0;overflow:auto;padding:.85rem 1.1rem .8rem;display:flex;flex-direction:column;gap:.9rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)}
.vide{color:var(--tx2);text-align:center;padding:1.4rem 1rem}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:16px;padding:.85rem .95rem;min-width:0;
  box-shadow:0 14px 30px -20px rgba(0,0,0,.55),inset 0 1px 0 var(--v03)}
html.jour .carte{box-shadow:0 10px 24px -18px rgba(20,30,50,.22)}
.carte h3{margin:0;font-size:.92rem;font-weight:800;display:flex;align-items:center;gap:.5rem}
.carte h3 .dr{margin-left:auto;font-weight:600}
.note{font-size:.76rem;color:var(--tx2);line-height:1.45}

/* La tête : les onglets à gauche, les gestes de l'onglet à droite. */
.em-tete{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap}
.ed-seg{display:inline-flex;gap:2px;padding:3px;border-radius:11px;background:var(--f-carte);border:1px solid var(--v08)}
.ed-seg button{height:2rem;padding:0 1rem;border:0;background:transparent;border-radius:8px;color:var(--tx2);font-weight:600}
.ed-seg button.on{background:var(--sz-btn-prim,var(--or));color:var(--sz-btn-prim-txt,#1a1208);font-weight:700}
.ed-seg button .nb{display:inline-grid;place-items:center;min-width:1.2rem;height:1.2rem;margin-left:.35rem;padding:0 .3rem;border-radius:99px;
  font-size:.7rem;font-weight:800;background:var(--ep-ambre-f);color:var(--ep-ambre-t)}
.em-tete .droite{margin-left:auto;display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}
.em-nav{display:flex;align-items:center;gap:2px;padding:3px;border-radius:10px;background:var(--f-carte);border:1px solid var(--v08)}
.em-nav button{border:0;background:transparent;height:1.75rem;padding:0 .6rem;font-size:.8rem}
.em-nav b{min-width:11rem;text-align:center;font-size:.85rem}

/* Les tuiles (szTuiles) */
.em-tuiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}
.em-tu{--emt:var(--vv-1,#5fd4a4);min-width:0;border-radius:14px;padding:.7rem .85rem;display:flex;flex-direction:column;gap:.15rem;
  background:color-mix(in srgb,var(--emt,var(--vv-1,#5fd4a4)) var(--vv-pct,20%),var(--f-carte));border:1px solid color-mix(in srgb,var(--emt,var(--vv-1,#5fd4a4)) 30%,var(--f-carte))}
.em-tu.t2{--emt:var(--vv-2,#7cb4f5)} .em-tu.t3{--emt:var(--vv-3,#b49cf7)} .em-tu.t4{--emt:var(--vv-4,#f08fb8)}
.em-tu .k{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:color-mix(in srgb,var(--emt,var(--vv-1,#5fd4a4)) 45%,var(--tx))}
.em-tu b{font-size:1.35rem;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.em-tu span:not(.k){font-size:.74rem;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:1rem}
.em-tu.att{background:var(--ep-ambre-f);border-color:color-mix(in srgb,var(--ep-ambre-t) 30%,var(--ep-ambre-f))}
.em-tu.att .k,.em-tu.att b{color:var(--ep-ambre-t)}

/* Les personnes : initiales d'une couleur par personne. */
.em-av{--emc:var(--vv-1,#5fd4a4);flex:none;width:2rem;height:2rem;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;
  font-size:.72rem;font-weight:800;background:color-mix(in srgb,var(--emc,var(--vv-1,#5fd4a4)) 22%,var(--f-carte));color:color-mix(in srgb,var(--emc,var(--vv-1,#5fd4a4)) 40%,var(--tx))}
.c2{--emc:var(--vv-2,#7cb4f5)} .c3{--emc:var(--vv-3,#b49cf7)} .c4{--emc:var(--vv-4,#f08fb8)}
.em-qui{display:flex;align-items:center;gap:.55rem;min-width:0}
.em-qui .n{display:flex;flex-direction:column;min-width:0;line-height:1.3}
.em-qui b{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.em-qui small{font-size:.72rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pill{display:inline-flex;align-items:center;gap:.3rem;font-size:.7rem;font-weight:700;padding:.12rem .55rem;border-radius:999px;white-space:nowrap;
  background:var(--ep-neutre-f,var(--v08));color:var(--ep-neutre-t,var(--tx2))}
.pill.v{background:var(--ep-vert-f,rgba(74,222,128,.14));color:var(--ep-vert-t,var(--tx-ok))}
.pill.a{background:var(--ep-ambre-f);color:var(--ep-ambre-t)}
.pill.r{background:var(--ep-rouge-f);color:var(--ep-rouge-t)}
.pill.v.pouls::before{content:"";width:.4rem;height:.4rem;border-radius:50%;background:currentColor;animation:em-pouls 1.6s ease-in-out infinite}
@keyframes em-pouls{50%{opacity:.25}}
@media (prefers-reduced-motion:reduce){.pill.v.pouls::before{animation:none}}

/* AUJOURD'HUI */
.g2{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:.8rem;align-items:start}
.ln{display:flex;align-items:center;gap:.7rem;padding:.55rem 0;border-top:1px solid var(--v06)}
.ln:first-of-type{border-top:0}
.ln .em-qui{margin-right:auto}
.al{display:flex;gap:.65rem;align-items:center;padding:.55rem .65rem;border-radius:11px;background:var(--v04,var(--v05))}
.al+.al{margin-top:.4rem}
.al i{flex:none;width:.5rem;height:.5rem;border-radius:50%;background:var(--ep-ambre-t)}
.al i.b{background:var(--vv-2,#7cb4f5)}
.al .tx{display:flex;flex-direction:column;line-height:1.35;margin-right:auto;min-width:0}
.al .tx b{font-size:.84rem}
.al .tx small{font-size:.74rem;color:var(--tx2)}
.liste{display:flex;flex-direction:column;margin-top:.55rem}

/* HORAIRE : la ligne de temps d'un jour */
.jours{display:flex;gap:4px;flex-wrap:wrap}
.jours button{display:flex;flex-direction:column;align-items:center;line-height:1.2;padding:.3rem .65rem;border-radius:10px;border:1px solid var(--v08);background:var(--f-carte);min-width:4.6rem}
.jours button b{font-size:.8rem}
.jours button small{font-size:.68rem;color:var(--tx2);font-variant-numeric:tabular-nums}
.jours button.on{border-color:var(--or);background:color-mix(in srgb,var(--or) 14%,var(--f-carte))}
.jours button.auj b{color:var(--tx-or,var(--tx))}
.modeles{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;font-size:.78rem;color:var(--tx2)}
.modeles button{border-radius:99px;font-size:.76rem;font-weight:700;padding:.18rem .7rem;border:1px solid color-mix(in srgb,var(--vv-2,#7cb4f5) 35%,var(--f-carte));
  background:color-mix(in srgb,var(--vv-2,#7cb4f5) 14%,var(--f-carte));color:var(--tx)}
.modeles button.arme{border-color:var(--or);background:color-mix(in srgb,var(--or) 22%,var(--f-carte))}
.tl{display:grid;grid-template-columns:13rem minmax(0,1fr) 4.5rem;align-items:stretch}
.tl .hh{display:flex;font-size:.68rem;color:var(--tx2);padding-bottom:.25rem;font-variant-numeric:tabular-nums}
.tl .hh span{flex:1 1 0;border-left:1px solid var(--v06);padding-left:3px}
.tl .qui{display:flex;align-items:center;padding:.35rem .4rem .35rem 0;border-top:1px solid var(--v06);min-height:3.4rem}
.tl .zone{position:relative;border-top:1px solid var(--v06);min-height:3.4rem;cursor:copy;
  background-image:linear-gradient(90deg,var(--v06) 1px,transparent 1px);background-size:var(--pas,8.33%) 100%}
.tl .zone.ferme{cursor:default}
.tl .tot{display:flex;align-items:center;justify-content:flex-end;border-top:1px solid var(--v06);font-weight:800;font-variant-numeric:tabular-nums;font-size:.85rem}
.tl .tot.sec{color:var(--tx2);font-weight:600}
.bq{position:absolute;top:.45rem;height:1.8rem;border-radius:8px;display:flex;align-items:center;gap:.35rem;padding:0 .55rem;font-size:.76rem;font-weight:700;
  white-space:nowrap;overflow:hidden;cursor:pointer;border:1px solid color-mix(in srgb,var(--emc,var(--vv-1,#5fd4a4)) 40%,var(--f-carte));
  background:color-mix(in srgb,var(--emc,var(--vv-1,#5fd4a4)) 22%,var(--f-carte));color:var(--tx)}
.bq:hover{border-color:var(--emc,var(--vv-1,#5fd4a4))}
.br{position:absolute;bottom:.3rem;height:.38rem;border-radius:99px;background:var(--ep-vert-t,var(--tx-ok));cursor:pointer}
.br.ouvert{background:repeating-linear-gradient(90deg,var(--ep-vert-t,var(--tx-ok)) 0 6px,transparent 6px 10px)}
.bc{position:absolute;inset:.45rem .2rem auto .2rem;height:1.8rem;border-radius:8px;display:flex;align-items:center;padding:0 .7rem;font-size:.76rem;font-weight:700;
  color:var(--tx);border:1px dashed var(--v16);cursor:pointer;
  background:repeating-linear-gradient(135deg,var(--v06) 0 6px,transparent 6px 12px)}
.bt{position:absolute;top:.45rem;height:1.8rem;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;
  background:var(--ep-ambre-f);color:var(--ep-ambre-t);border:1px solid color-mix(in srgb,var(--ep-ambre-t) 35%,var(--ep-ambre-f));overflow:hidden;white-space:nowrap}
.tl .couv{color:var(--tx2);font-size:.78rem;font-weight:700}
.legende{display:flex;gap:1rem;flex-wrap:wrap;font-size:.74rem;color:var(--tx2);align-items:center}
.legende i{display:inline-block;width:1.4rem;height:.5rem;border-radius:99px;margin-right:.35rem;vertical-align:middle}
.sem{display:grid;grid-template-columns:13rem repeat(7,minmax(0,1fr)) 4.5rem;gap:3px;font-size:.76rem}
.sem .h{font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);font-weight:700;text-align:center;padding:.15rem 0}
.sem .c{background:var(--v04,var(--v05));border-radius:7px;padding:.25rem .35rem;text-align:center;font-variant-numeric:tabular-nums;cursor:pointer;min-height:1.8rem;
  border:1px solid transparent;color:var(--tx)}
.sem .c.on{border-color:var(--or)}
.sem .c.cg{background:repeating-linear-gradient(135deg,var(--v06) 0 5px,transparent 5px 10px);color:var(--tx2)}
.sem .nm{display:flex;align-items:center;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sem .t{text-align:right;font-weight:800;font-variant-numeric:tabular-nums;align-self:center}
.sem .nm{align-self:center}
.sem .t.trop{color:var(--ep-ambre-t)}

/* ÉQUIPE : des fiches, et le détail à droite */
.g3{display:grid;grid-template-columns:minmax(0,1fr) 22rem;gap:.8rem;align-items:start}
.cartes{display:grid;grid-template-columns:repeat(auto-fill,minmax(17rem,1fr));gap:.6rem;align-content:start}
.pc{display:flex;align-items:center;gap:.65rem;padding:.7rem .8rem;border-radius:13px;border:1px solid var(--v08);background:var(--f-carte);cursor:pointer;text-align:left;width:100%;color:var(--tx)}
.pc.on{border-color:var(--or);box-shadow:0 0 0 1px var(--or) inset}
.pc .em-qui{margin-right:auto}
.pc .tx{font-weight:800;font-variant-numeric:tabular-nums}
.sec-t{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);margin:.2rem 0 -.2rem}
.fiche{display:flex;flex-direction:column;gap:.75rem;position:sticky;top:0}
.kv{display:grid;grid-template-columns:1fr auto;gap:.4rem .8rem;font-size:.82rem}
.kv span{color:var(--tx2)} .kv b{text-align:right;font-variant-numeric:tabular-nums}
.jauge{height:6px;border-radius:99px;background:var(--v08);overflow:hidden}
.jauge i{display:block;height:100%;background:var(--or)}
.hist{display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;color:var(--tx2);border-top:1px solid var(--v06);padding-top:.6rem}
.hist b{color:var(--tx);font-size:.8rem}
.hist .fut{color:var(--tx-or,var(--tx))}
.gestes{display:flex;gap:.45rem;flex-wrap:wrap}

/* PAIE */
.bandeau{display:flex;align-items:center;gap:.6rem;padding:.6rem .85rem;border-radius:12px;font-size:.84rem}
.bandeau.v{background:var(--ep-vert-f,rgba(74,222,128,.12));color:var(--ep-vert-t,var(--tx-ok))}
.bandeau.a{background:var(--ep-ambre-f);color:var(--ep-ambre-t)}
.bandeau b{font-weight:800}
.bandeau button{margin-left:auto}
.em-t{width:100%;border-collapse:collapse;font-size:.82rem}
.em-t th{text-align:left;font-size:.66rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx-or,var(--tx2));font-weight:700;padding:.35rem .55rem;border-bottom:1px solid var(--v08);white-space:nowrap}
.em-t td{padding:.5rem .55rem;border-bottom:1px solid var(--v06);vertical-align:middle;white-space:nowrap}
.em-t th.n,.em-t td.n{text-align:right;font-variant-numeric:tabular-nums}
.em-t tbody tr{cursor:pointer}
.em-t tbody tr:hover td{background:var(--v04,var(--v05))}
.em-t tbody tr.on td{background:color-mix(in srgb,var(--or) 12%,var(--f-carte))}
.em-t tfoot td{font-weight:800;border-bottom:0}
.em-t td.or{color:var(--tx-or,var(--tx));font-weight:800}
.bul{display:flex;flex-direction:column;gap:.45rem;font-size:.82rem}
.bul .l{display:flex;justify-content:space-between;gap:.8rem}
.bul .l span{color:var(--tx2)}
.bul .l b{font-variant-numeric:tabular-nums;white-space:nowrap}
.bul .l.t{border-top:1px solid var(--v08);padding-top:.5rem;font-weight:800}
.bul .l.t span{color:var(--tx)}
.hp{display:flex;flex-direction:column}
.hp button{display:flex;justify-content:space-between;gap:.6rem;border:0;border-top:1px solid var(--v06);border-radius:0;background:transparent;padding:.45rem .1rem;font-size:.8rem;text-align:left}
.hp button:first-child{border-top:0}
.hp button span{color:var(--tx2)}

/* Les boîtes (quart, pointage, congé, taux, fiche, réglages) */
.voile{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(5,8,14,.55)}
.boite{width:min(34rem,94vw);max-height:92vh;overflow:auto;border-radius:16px;padding:1.1rem 1.2rem;border:1px solid var(--v12,var(--v16));background:var(--f-carte);
  display:flex;flex-direction:column;gap:.85rem;box-shadow:0 30px 60px -20px rgba(0,0,0,.6)}
.boite.large{width:min(48rem,94vw)}
.boite h3{margin:0;font-size:1rem}
.boite .sous{font-size:.78rem;color:var(--tx2);margin-top:-.55rem}
.champs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem .8rem}
.champs.trois{grid-template-columns:repeat(3,minmax(0,1fr))}
.ch{display:flex;flex-direction:column;gap:.3rem;font-size:.74rem;font-weight:600;color:var(--tx2);min-width:0}
.ch.large{grid-column:1 / -1}
.ch input:not([type=checkbox]):not([type=radio]),.ch select{height:2.3rem;width:100%;border-radius:9px;color:var(--tx)}
.ch.case{flex-direction:row;align-items:center;gap:.5rem;font-size:.82rem;color:var(--tx)}
.unite{position:relative;display:flex;align-items:center}
.unite input{padding-right:3.4rem;text-align:right}
.unite i{position:absolute;right:.6rem;font-style:normal;font-size:.74rem;color:var(--tx2);pointer-events:none}
.pied-b{display:flex;gap:.5rem;align-items:center;padding-top:.7rem;border-top:1px solid var(--v06)}
.pied-b .gauche{margin-right:auto}
.pied-b button{height:2.3rem;padding:0 1rem;border-radius:9px}
.mods{display:flex;flex-direction:column;gap:.35rem}
.mods .m{display:grid;grid-template-columns:minmax(0,1fr) 7rem 7rem auto;gap:.4rem;align-items:center}
.mods .m input{height:2.1rem}
@media (max-width:980px){ .g2,.g3{grid-template-columns:1fr} .em-tuiles{grid-template-columns:repeat(2,minmax(0,1fr))} .tl,.sem{grid-template-columns:9rem minmax(0,1fr) 3.6rem} .sem{grid-template-columns:9rem repeat(7,minmax(0,1fr)) 3.6rem} }
@media print{ body{overflow:visible;background:#fff;color:#000} .tete,.pied,.em-tete,#corps>*:not(.imp){display:none!important}
  #corps{overflow:visible} .imp{display:block!important} .imp>*:not(#bulletin){display:none!important} #bulletin{box-shadow:none;border:0} }
`;

function pageEmployes(ouverture) {
  const ok = ['aujourdhui', 'horaire', 'equipe', 'paie', 'reglages'];
  // Les anciens noms d'onglets (bancs, liens) mènent au plus proche.
  const ancien = { horaires: 'horaire', pointages: 'horaire' };
  const o = ancien[String(ouverture || '')] || String(ouverture || '');
  const depart = ok.indexOf(o) >= 0 ? o : 'aujourdhui';
  return `${TETE()}
<title>${T("Employés et paie — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.customers}</span><h1>${T("Employés et paie")}</h1>
  <span class="cx-resume" id="sous"></span></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('employes')}
  var corps = document.getElementById('corps');
  var elSous = document.getElementById('sous');
  var D = null, PAIE = null;
  var ONGLET = '${depart}' === 'reglages' ? 'paie' : '${depart}';
  var OUVRIR_REGLAGES = '${depart}' === 'reglages';
  var SEMAINE = '', PERIODE = '', JOUR = '';
  var CHOISI = '';          // la fiche ouverte (Équipe) ou la ligne de paie choisie
  var ARME = null;          // le modèle de quart « armé » : le prochain clic sur une ligne le pose
  var BOITE = false;        // une boîte est ouverte : on ne recharge pas sous elle

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  var MOTIFS = {
    maj_en_cours:       '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas de gérer le personnel et la paie.")}',
    indisponible:       '${T("Le module des employés n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Ce membre du personnel n’existe plus. La liste a été relue.")}',
    taux:               '${T("Le taux horaire doit être entre 0 et 500 $.")}',
    sous_minimum:       '${T("Ce taux est sous le salaire minimum réglé dans la paie.")}',
    commission:         '${T("La commission doit être entre 0 et 50 %.")}',
    date:               '${T("La date est invalide.")}',
    heures:             '${T("La fin du quart doit suivre son début.")}',
    chevauchement:      '${T("Ce quart chevauche un autre quart de la même personne.")}',
    en_conge:           '${T("Cette personne est en congé ce jour-là.")}',
    duree:              '${T("Un congé se saisit sur 60 jours au plus, et sa fin suit son début.")}',
    motif:              '${T("Choisissez le type de congé.")}',
    maladie_max:        '${T("Les 2 jours de maladie payés de l’année sont déjà pris. Saisissez ce congé sans le payer.")}',
    maladie_service:    '${T("Les jours de maladie sont payés après 3 mois de service.")}',
    entree:             '${T("L’heure d’entrée est invalide.")}',
    sortie:             '${T("La sortie doit suivre l’entrée.")}',
    trop_long:          '${T("Un pointage ne peut pas dépasser 16 heures.")}',
    periode_approuvee:  '${T("Cette date est dans une période de paie approuvée. Rouvrez la période dans l’onglet Paie pour la modifier.")}',
    pas_finie:          '${T("La période n’est pas terminée : elle s’approuve à partir du lendemain de son dernier jour.")}',
    deja:               '${T("Cette période est déjà approuvée.")}',
    pointage_ouvert:    '${T("Un pointage de la période est encore ouvert. Fermez-le (oubli de sortie) avant d’approuver.")}',
    nuage:              '${T("Le nuage a refusé l’écriture : elle n’existe que sur ce poste. Vérifiez la connexion, puis refaites le geste.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; }).catch(function(){ return { ok: false, motif: 'echec' }; });
  }

  var JSEM = ['${T("dim.")}', '${T("lun.")}', '${T("mar.")}', '${T("mer.")}', '${T("jeu.")}', '${T("ven.")}', '${T("sam.")}'];
  var MOIS = ['${T("janv.")}', '${T("févr.")}', '${T("mars")}', '${T("avr.")}', '${T("mai")}', '${T("juin")}', '${T("juill.")}', '${T("août")}', '${T("sept.")}', '${T("oct.")}', '${T("nov.")}', '${T("déc.")}'];
  var MOTIF_NOM = { vacances: '${T("Vacances")}', maladie: '${T("Maladie")}', sans_solde: '${T("Sans solde")}', autre: '${T("Autre absence")}' };
  function deux(n){ return (n < 10 ? '0' : '') + n; }
  function jourDe(iso){ var p = String(iso).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function isoDe(d){ return d.getFullYear() + '-' + deux(d.getMonth() + 1) + '-' + deux(d.getDate()); }
  function plus(iso, n){ var d = jourDe(iso); d.setDate(d.getDate() + n); return isoDe(d); }
  function court(iso){ var d = jourDe(iso); return d.getDate() + ' ' + MOIS[d.getMonth()]; }
  function jourLong(iso){ var d = jourDe(iso); return JSEM[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]; }
  function hm(isoT){ var d = new Date(isoT); return isNaN(d) ? '' : deux(d.getHours()) + ':' + deux(d.getMinutes()); }
  function hmLisible(x){ var p = String(x || '').split(':'); return p.length < 2 ? '' : (+p[0]) + ' h' + (p[1] !== '00' ? ' ' + p[1] : ''); }
  function minDe(x){ var p = String(x).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  function hdec(a, b){ return Math.max(0, (minDe(b) - minDe(a)) / 60); }
  function h2(n){ return szNombre(n || 0, 2) + ' h'; }
  function pers(id){ var l = (D && D.personnel) || []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function nomDe(id){ var s = pers(id); return s ? s.nom : id; }
  function inclus(s){ return !s.fiche || s.fiche.inclus !== false; }
  function equipe(){ return ((D && D.personnel) || []).filter(inclus); }
  function coul(id){ var l = equipe(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return ' c' + ((i % 4) + 1); return ' c1'; }
  function init(nom){ var p = String(nom || '?').trim().split(' ').filter(Boolean); return ((p[0] || '?').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase(); }
  function qui(id, nom, sous){ return '<span class="em-qui"><span class="em-av' + coul(id) + '">' + esc(init(nom)) + '</span><span class="n"><b>' + esc(nom) + '</b>'
    + (sous ? '<small>' + sous + '</small>' : '') + '</span></span>'; }
  function tuile(cl, k, v, s){ return '<div class="em-tu ' + cl + '"><span class="k">' + k + '</span><b>' + v + '</b><span>' + (s || '') + '</span></div>'; }
  function anciennete(s){
    if (s.mois == null) return '';
    if (s.ans >= 1) return s.ans + ' ' + (s.ans > 1 ? '${T("ans")}' : '${T("an")}');
    return s.mois + ' ${T("mois")}';
  }
  function emploi(f){ return f.emploi === 'plein' ? '${T("temps plein")}' : (f.emploi === 'partiel' ? '${T("temps partiel")}' : ''); }

  function charger(){
    appeler('employes:donnees', [SEMAINE, PERIODE]).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; return; }
      D = r;
      if (!SEMAINE) SEMAINE = r.semaine[0];
      if (!PERIODE) PERIODE = r.periode.debut;
      if (!JOUR || r.semaine.indexOf(JOUR) < 0) JOUR = r.semaine.indexOf(r.aujourdhui) >= 0 ? r.aujourdhui : r.semaine[1];
      var n = equipe().length, ep = (r.enPoste || []).length;
      elSous.textContent = n + ' ' + (n > 1 ? '${T("personnes à la paie")}' : '${T("personne à la paie")}') + (ep ? ' · ' + ep + ' ${T("en poste")}' : '');
      if (ONGLET === 'paie') chargerPaie(); else dessiner();
      if (OUVRIR_REGLAGES) { OUVRIR_REGLAGES = false; setTimeout(boiteReglages, 0); }
    });
  }
  function chargerPaie(){
    appeler('employes:paie', [D.periode.debut, D.periode.fin]).then(function(r){
      PAIE = (r && r.ok) ? r : { erreur: r };
      if (PAIE.lignes && PAIE.lignes.length && !PAIE.lignes.some(function(l){ return l.staffId === CHOISI; })) CHOISI = PAIE.lignes[0].staffId;
      dessiner();
    });
  }

  /* ── La tête : onglets, puis les gestes de l'onglet ── */
  function tete(){
    var nA = (D.anomalies || []).length;
    var og = function(v, l, nb){ return '<button type="button" class="' + (ONGLET === v ? 'on' : '') + '" data-og="' + v + '">' + l + (nb ? '<span class="nb">' + nb + '</span>' : '') + '</button>'; };
    var h = '<div class="em-tete"><div class="ed-seg">' + og('aujourdhui', '${T("Aujourd’hui")}', nA) + og('horaire', '${T("Horaire")}')
      + og('equipe', '${T("Équipe")}') + og('paie', '${T("Paie")}') + '</div><div class="droite">';
    if (ONGLET === 'aujourdhui') {
      if (D.peutModifier) h += '<button class="mini" data-act="pointage">${T("Ajouter un pointage")}</button><button class="mini" data-act="conge">${T("Ajouter un congé")}</button>';
    } else if (ONGLET === 'horaire') {
      h += '<div class="em-nav"><button data-sem="-7" aria-label="${T("Semaine précédente")}">‹</button><b>'
        + esc(court(D.semaine[0]) + ' – ' + court(D.semaine[6])) + '</b><button data-sem="7" aria-label="${T("Semaine suivante")}">›</button>'
        + '<button data-sem="0">${T("Cette semaine")}</button></div>';
      if (D.peutModifier) h += '<button class="mini" id="em-copier" title="${T("Reprend les quarts de la semaine précédente (ceux déjà posés et les congés restent).")}">${T("Copier la semaine précédente")}</button>'
        + '<button class="mini" data-act="conge">${T("Ajouter un congé")}</button>';
    } else if (ONGLET === 'paie') {
      h += '<div class="em-nav"><button data-per="-1" aria-label="${T("Période précédente")}">‹</button><b>'
        + esc('${T("Du ")}' + court(D.periode.debut) + ' ${T("au")} ' + court(D.periode.fin)) + '</b><button data-per="1" aria-label="${T("Période suivante")}">›</button></div>'
        + '<button class="mini" id="em-reg">${T("Réglages de la paie")}</button><button class="mini" id="em-csv">${T("Exporter (CSV)")}</button>';
    } else if (ONGLET === 'equipe') {
      var hors = ((D && D.personnel) || []).length - equipe().length;
      if (hors) h += '<span class="pill">' + hors + ' ' + (hors > 1 ? '${T("personnes hors paie")}' : '${T("personne hors paie")}') + '</span>';
    }
    return h + '</div></div>';
  }

  /* ══ AUJOURD'HUI ══ */
  function etatDuJour(s){
    var auj = D.aujourdhui;
    var cg = (D.conges || []).filter(function(c){ return c.staffId === s.id && c.date === auj; })[0];
    if (cg) return { cl: '', t: MOTIF_NOM[cg.motif] || '${T("Congé")}', sous: '${T("en congé aujourd’hui")}' };
    var qs = (D.horaires || []).filter(function(q){ return q.staffId === s.id && q.date === auj; }).sort(function(a, b){ return a.debut < b.debut ? -1 : 1; });
    var ep = (D.enPoste || []).filter(function(e){ return e.staffId === s.id; })[0];
    var pts = (D.pointagesSemaine || []).filter(function(p){ return p.staffId === s.id && p.jour === auj; });
    var prevu = qs.map(function(q){ return hmLisible(q.debut) + ' – ' + hmLisible(q.fin); }).join(', ');
    if (ep) return { cl: 'v pouls', t: '${T("en poste")}', sous: (prevu ? '${T("prévu")} ' + prevu + ' · ' : '') + '${T("pointé à")} ' + hmLisible(hm(ep.depuis)), prevu: true };
    if (!qs.length) return pts.length ? { cl: '', t: '${T("terminé")}', sous: '${T("sans quart prévu")}' } : null;
    var now = new Date(), m = now.getHours() * 60 + now.getMinutes();
    if (pts.length && pts.every(function(p){ return p.sortie; })) return { cl: '', t: '${T("terminé")}', sous: '${T("prévu")} ' + prevu };
    if (m < minDe(qs[0].debut)) return { cl: '', t: '${T("arrive à")} ' + hmLisible(qs[0].debut), sous: '${T("prévu")} ' + prevu };
    if (m > minDe(qs[qs.length - 1].fin)) return { cl: 'a', t: '${T("absent")}', sous: '${T("prévu")} ' + prevu + ' · ${T("aucun pointage")}' };
    return { cl: 'a', t: '${T("en retard")}', sous: '${T("prévu à")} ' + hmLisible(qs[0].debut) + ' · ${T("pas encore pointé")}' };
  }
  function phraseAnomalie(a){
    if (a.type === 'sortie') return ['${T("Sortie non pointée")}', jourLong(a.date) + ', ${T("entrée à")} ' + hmLisible(a.entree)];
    if (a.type === 'long') return ['${T("Pointage de plus de 10 heures")}', jourLong(a.date) + ' · ' + h2(a.heures)];
    if (a.type === 'retard') return [a.minutes + ' ${T("min de retard")}', jourLong(a.date) + ', ${T("prévu")} ' + hmLisible(a.prevu) + ', ${T("pointé")} ' + hmLisible(a.entree)];
    if (a.type === 'absent') return ['${T("Quart sans pointage")}', jourLong(a.date) + ', ${T("prévu")} ' + esc(a.prevu)];
    return ['${T("Pointage sans quart prévu")}', jourLong(a.date)];
  }
  function vueAujourdhui(){
    var auj = D.aujourdhui;
    var surSemaine = D.semaine.indexOf(auj) >= 0;
    var qsAuj = surSemaine ? (D.horaires || []).filter(function(q){ return q.date === auj; }) : [];
    var hPrevu = qsAuj.reduce(function(a, q){ return a + hdec(q.debut, q.fin); }, 0);
    var ep = D.enPoste || [];
    var nA = (D.anomalies || []).length;
    var h = szTuiles('<div class="em-tuiles">'
      + tuile('t1', '${T("En poste")}', String(ep.length), ep.map(function(e){ return nomDe(e.staffId).split(' ')[0] + ' ${T("depuis")} ' + hmLisible(hm(e.depuis)); }).join(', ') || '${T("personne pour l’instant")}')
      + tuile('t2', '${T("Prévu aujourd’hui")}', h2(hPrevu), qsAuj.length + ' ' + (qsAuj.length > 1 ? '${T("quarts")}' : '${T("quart")}'))
      + tuile(nA ? 'att' : 't3', '${T("À régler")}', String(nA), nA ? '${T("avant la paie du")} ' + court(D.periode.fin) : '${T("rien à corriger")}')
      + tuile('t4', '${T("Paie en cours")}', szArgent(D.brutPeriode || 0), esc(court(D.periode.debut) + ' – ' + court(D.periode.fin)) + ' · ${T("brut")}') + '</div>');
    // La journée
    var c = (D.couvertures || {})[auj];
    var j = '<div class="carte"><h3>${T("La journée")}' + (c && c.connue ? '<span class="dr pill">' + (c.ferme ? '${T("boutique fermée")}' : hmLisible(c.debut) + ' – ' + hmLisible(c.fin) + ' · ${T("boutique ouverte")}') + '</span>' : '') + '</h3><div class="liste">';
    var lignes = 0;
    equipe().forEach(function(s){
      var e = etatDuJour(s); if (!e) return; lignes++;
      j += '<div class="ln">' + qui(s.id, s.nom, esc(e.sous)) + '<span class="pill ' + e.cl + '">' + esc(e.t) + '</span></div>';
    });
    if (c && c.connue && !c.ferme) (c.trous || []).forEach(function(t){
      lignes++;
      j += '<div class="ln"><span class="em-qui"><span class="em-av" style="--emc:var(--ep-ambre-t)">!</span><span class="n"><b>' + esc(hmLisible(t.debut) + ' – ' + hmLisible(t.fin)) + '</b><small>${T("personne au comptoir")}</small></span></span>'
        + '<span class="pill a">${T("trou de couverture")}</span></div>';
    });
    if (!lignes) j += '<div class="vide">' + (surSemaine ? '${T("Aucun quart prévu aujourd’hui.")}' : '') + '</div>';
    if (c && !c.connue) j += '<div class="note" style="margin-top:.5rem">${T("Les heures d’ouverture ne sont pas réglées (Configuration → Heures d’ouverture) : les trous de couverture ne se calculent pas.")}</div>';
    j += '</div></div>';
    // À régler
    var r = '<div class="carte"><h3>${T("À régler")}' + (nA ? '<span class="dr pill a">' + nA + '</span>' : '') + '</h3><div class="liste">';
    if (!nA) r += '<div class="vide">${T("Rien à corriger dans la période.")}</div>';
    (D.anomalies || []).slice(0, 8).forEach(function(a, i){
      var p = phraseAnomalie(a);
      r += '<div class="al"><i></i><span class="tx"><b>' + esc(nomDe(a.staffId).split(' ')[0]) + ' : ' + esc(p[0]) + '</b><small>' + p[1] + '</small></span>'
        + (D.peutModifier ? (a.pointageId ? '<button class="mini" data-pmod="' + esc(a.pointageId) + '">${T("Corriger")}</button>'
          : (a.type === 'absent' ? '<button class="mini" data-absent="' + i + '">${T("Régler")}</button>' : '')) : '') + '</div>';
    });
    if (nA > 8) r += '<div class="note" style="margin-top:.4rem">' + (nA - 8) + ' ${T("autres dans la période.")}</div>';
    (D.prochainsFeries || []).slice(0, 2).forEach(function(f){
      r += '<div class="al"><i class="b"></i><span class="tx"><b>' + esc(f.nom) + '</b><small>' + esc(jourLong(f.date)) + ' · ${T("jour férié : l’indemnité se calcule à la paie")}</small></span></div>';
    });
    r += '</div></div>';
    return h + '<div class="g2">' + j + r + '</div>';
  }

  /* ══ HORAIRE : la ligne de temps du jour choisi ══ */
  function bornes(jour){
    var c = (D.couvertures || {})[jour];
    var a = 24 * 60, b = 0;
    if (c && c.connue && !c.ferme) { a = Math.min(a, minDe(c.debut)); b = Math.max(b, minDe(c.fin)); }
    (D.horaires || []).forEach(function(q){ if (q.date === jour) { a = Math.min(a, minDe(q.debut)); b = Math.max(b, minDe(q.fin)); } });
    (D.pointagesSemaine || []).forEach(function(p){ if (p.jour === jour) { a = Math.min(a, minDe(p.de)); if (p.a) b = Math.max(b, minDe(p.a)); } });
    if (b <= a) { a = 9 * 60; b = 21 * 60; }
    a = Math.floor(a / 60) * 60; b = Math.ceil(b / 60) * 60;
    if (b - a < 8 * 60) { b = Math.min(24 * 60, a + 8 * 60); if (b - a < 8 * 60) a = b - 8 * 60; }
    return [a, b];
  }
  function pct(m, B){ return Math.max(0, Math.min(100, (m - B[0]) / (B[1] - B[0]) * 100)); }
  function vueHoraire(){
    var l = equipe();
    if (!l.length) return '<div class="carte vide">${T("Personne à la paie. Ajoutez les comptes du personnel (Configuration → Sécurité → Accès utilisateurs), puis ouvrez leur fiche dans l’onglet Équipe.")}</div>';
    var h = '';
    // Les jours de la semaine, avec leurs heures prévues.
    h += '<div class="jours" role="tablist" aria-label="${T("Jours de la semaine")}">' + D.semaine.map(function(j){
      var t = (D.horaires || []).filter(function(q){ return q.date === j; }).reduce(function(a, q){ return a + hdec(q.debut, q.fin); }, 0);
      var fer = (D.feriesSemaine || []).filter(function(f){ return f.date === j; })[0];
      return '<button type="button" role="tab" aria-selected="' + (j === JOUR) + '" class="' + (j === JOUR ? 'on ' : '') + (j === D.aujourdhui ? 'auj' : '') + '" data-jour="' + j + '"><b>' + esc(jourLong(j)) + '</b><small>'
        + (fer ? '${T("férié")}' : (t ? h2(t) : '—')) + '</small></button>';
    }).join('') + '</div>';
    if (D.peutModifier) h += '<div class="modeles"><span>' + (ARME ? '${T("Cliquez une ligne pour poser")} « ' + esc(ARME.nom) + ' »' : '${T("Poser un modèle :")}') + '</span>'
      + (D.reglages.modeles || []).map(function(m){ return '<button type="button" draggable="true" data-mod="' + esc(m.id) + '" class="' + (ARME && ARME.id === m.id ? 'arme' : '') + '">'
        + esc(m.nom + ' ' + hmLisible(m.debut) + ' – ' + hmLisible(m.fin)) + '</button>'; }).join('')
      + '<button type="button" class="mini" style="background:transparent;border-style:dashed" id="em-mods">${T("Modèles…")}</button></div>';
    var B = bornes(JOUR), nH = (B[1] - B[0]) / 60;
    var c = (D.couvertures || {})[JOUR] || {};
    var fer = (D.feriesSemaine || []).filter(function(f){ return f.date === JOUR; })[0];
    var t = '<div class="carte"><h3>' + esc(jourLong(JOUR)) + (fer ? ' <span class="pill" style="--x:0">' + esc(fer.nom) + '</span>' : '')
      + '<span class="dr legende"><span><i style="background:color-mix(in srgb,var(--vv-2,#7cb4f5) 40%,var(--f-carte))"></i>${T("prévu")}</span>'
      + '<span><i style="background:var(--ep-vert-t,var(--tx-ok))"></i>${T("pointé")}</span>'
      + '<span><i style="background:repeating-linear-gradient(135deg,var(--v16) 0 4px,transparent 4px 8px)"></i>${T("congé")}</span></span></h3>'
      + '<div class="tl" style="--pas:' + (100 / nH) + '%;margin-top:.6rem"><div></div><div class="hh">';
    for (var k = 0; k < nH; k++) t += '<span>' + ((B[0] / 60 + k) % 24) + ' h</span>';
    t += '</div><div></div>';
    l.forEach(function(s){
      var tot = 0, z = '';
      var cg = (D.conges || []).filter(function(x){ return x.staffId === s.id && x.date === JOUR; })[0];
      if (cg) z += '<div class="bc" data-cgx="' + esc(cg.id) + '" title="${T("Retirer ce congé")}">' + esc((MOTIF_NOM[cg.motif] || '') + (cg.paye ? ' · ${T("payé")}' : '')) + '</div>';
      (D.horaires || []).filter(function(q){ return q.staffId === s.id && q.date === JOUR; }).forEach(function(q){
        var a = pct(minDe(q.debut), B), b = pct(minDe(q.fin), B); tot += hdec(q.debut, q.fin);
        z += '<div class="bq' + coul(s.id) + '" data-qmod="' + esc(q.id) + '" style="left:' + a + '%;width:' + Math.max(2, b - a) + '%" title="' + esc((q.note ? q.note + ' · ' : '') + h2(hdec(q.debut, q.fin))) + '">'
          + esc(hmLisible(q.debut) + ' – ' + hmLisible(q.fin)) + (q.note ? ' · ' + esc(q.note) : '') + '</div>';
      });
      (D.pointagesSemaine || []).filter(function(p){ return p.staffId === s.id && p.jour === JOUR; }).forEach(function(p){
        var fin = p.a ? minDe(p.a) : (JOUR === D.aujourdhui ? new Date().getHours() * 60 + new Date().getMinutes() : minDe(p.de) + 30);
        var a = pct(minDe(p.de), B), b = pct(fin, B);
        z += '<div class="br' + (p.a ? '' : ' ouvert') + '" data-pmod="' + esc(p.id) + '" style="left:' + a + '%;width:' + Math.max(1, b - a) + '%" title="' + esc('${T("Pointé")} ' + hmLisible(p.de) + (p.a ? ' – ' + hmLisible(p.a) : ' · ${T("en poste")}')) + '"></div>';
      });
      t += '<div class="qui">' + qui(s.id, s.nom, esc([s.fiche.poste || '', emploi(s.fiche)].filter(Boolean).join(' · ') || szTd(s.role || ''))) + '</div>'
        + '<div class="zone' + (cg ? ' ferme' : '') + '" data-zone="' + esc(s.id) + '" data-b0="' + B[0] + '" data-b1="' + B[1] + '">' + z + '</div>'
        + '<div class="tot' + (cg ? ' sec' : '') + '">' + (cg ? '${T("congé")}' : (tot ? h2(tot) : '—')) + '</div>';
    });
    // La couverture
    if (c.connue && !c.ferme) {
      var zz = ''; (c.trous || []).forEach(function(tr){ var a = pct(minDe(tr.debut), B), b = pct(minDe(tr.fin), B);
        zz += '<div class="bt" style="left:' + a + '%;width:' + Math.max(3, b - a) + '%">${T("à couvrir")}</div>'; });
      t += '<div class="qui couv">${T("Couverture")}</div><div class="zone ferme">' + zz + '</div><div class="tot sec">' + ((c.trous || []).length ? '<span class="pill a">' + c.trous.length + '</span>' : '✓') + '</div>';
    }
    t += '</div>';
    if (D.peutModifier) t += '<div class="note" style="margin-top:.5rem">${T("Cliquez une ligne vide pour ajouter un quart à cette heure, un quart pour le modifier, la ligne verte pour corriger le pointage.")}</div>';
    t += '</div>';
    // La semaine en résumé
    var w = '<div class="carte"><h3>${T("La semaine")}<span class="dr note">${T("Cliquez un jour pour l’ouvrir.")}</span></h3><div class="sem" style="margin-top:.55rem"><div></div>'
      + D.semaine.map(function(j){ return '<div class="h">' + esc(JSEM[jourDe(j).getDay()] + ' ' + jourDe(j).getDate()) + '</div>'; }).join('') + '<div class="h" style="text-align:right">${T("Total")}</div>';
    l.forEach(function(s){
      var tot = 0;
      w += '<div class="nm">' + esc(s.nom) + '</div>';
      D.semaine.forEach(function(j){
        var cg = (D.conges || []).filter(function(x){ return x.staffId === s.id && x.date === j; })[0];
        var qs = (D.horaires || []).filter(function(q){ return q.staffId === s.id && q.date === j; }).sort(function(a, b){ return a.debut < b.debut ? -1 : 1; });
        qs.forEach(function(q){ tot += hdec(q.debut, q.fin); });
        var txt = cg ? (MOTIF_NOM[cg.motif] || '${T("congé")}') : qs.map(function(q){ return (+q.debut.slice(0, 2)) + '–' + (+q.fin.slice(0, 2)); }).join(', ');
        w += '<button type="button" class="c' + (cg ? ' cg' : '') + (j === JOUR ? ' on' : '') + '" data-jour="' + j + '">' + esc(txt || '·') + '</button>';
      });
      w += '<div class="t' + (tot > (D.reglages.seuilHS || 40) ? ' trop' : '') + '">' + h2(tot) + '</div>';
    });
    w += '</div></div>';
    return h + t + w;
  }

  /* ══ ÉQUIPE : des fiches et un panneau ══ */
  function vueEquipe(){
    var tous = (D && D.personnel) || [];
    if (!tous.length) return '<div class="carte vide">${T("Aucun compte du personnel. Ajoutez-les dans Configuration → Sécurité → Accès utilisateurs ; ils paraîtront ici.")}</div>';
    if (!CHOISI || !pers(CHOISI)) CHOISI = (equipe()[0] || tous[0]).id;
    var carte = function(s){
      var f = s.fiche || {}, ep = (D.enPoste || []).some(function(e){ return e.staffId === s.id; });
      var sous = [f.poste || szTd(s.role || ''), emploi(f), anciennete(s)].filter(Boolean).join(' · ');
      return '<button type="button" class="pc' + (s.id === CHOISI ? ' on' : '') + '" data-fiche="' + esc(s.id) + '">' + qui(s.id, s.nom, esc(sous))
        + (ep ? '<span class="pill v pouls">${T("en poste")}</span>' : '') + (s.sousMinimum ? '<span class="pill r">${T("sous le minimum")}</span>' : '')
        + (inclus(s) ? '<span class="tx">' + szArgent(s.taux || 0) + '</span>' : '') + '</button>';
    };
    var g = '<div class="cartes">' + equipe().map(carte).join('') + '</div>';
    var hors = tous.filter(function(s){ return !inclus(s); });
    if (hors.length) g += '<div class="sec-t">${T("Hors paie")}</div><div class="cartes">' + hors.map(carte).join('') + '</div>';
    return '<div class="g3"><div style="display:flex;flex-direction:column;gap:.7rem">' + g + '</div>' + panneau(pers(CHOISI)) + '</div>';
  }
  function panneau(s){
    if (!s) return '';
    var f = s.fiche || {}, R = D.reglages || {};
    var h = '<div class="carte fiche"><div style="display:flex;align-items:center;gap:.6rem">' + qui(s.id, s.nom, esc(f.embauche ? '${T("embauche le")} ' + court(f.embauche) + ' ' + f.embauche.slice(0, 4) : '${T("date d’embauche à saisir")}')) + '</div>';
    if (!inclus(s)) {
      h += '<div class="note">${T("Hors paie : cette personne n’entre ni à l’horaire ni dans le rapport de paie (propriétaire, compte technique…).")}</div>';
    } else {
      h += '<div class="kv"><span>${T("Taux horaire")}</span><b>' + szArgent(s.taux || 0) + '</b>'
        + '<span>${T("Commission")}</span><b>' + szNombre(f.commission || 0, 1) + ' %</b>'
        + '<span>${T("Emploi")}</span><b>' + esc(emploi(f) || '—') + '</b>'
        + '<span>${T("Vacances")}</span><b>' + s.vacancesPct + ' % · ' + (R.vacancesMode === 'accumule' ? '${T("accumulées")}' : '${T("versées à chaque paie")}') + '</b>'
        + (R.vacancesMode === 'accumule' ? '<span>${T("Solde accumulé")}</span><b>' + szArgent(s.vacancesSolde || 0) + '</b>' : '')
        + '<span>${T("Maladie payée cette année")}</span><b>' + (s.maladiePayees || 0) + ' ${T("sur")} 2</b>'
        + '<span>${T("Contact d’urgence")}</span><b>' + esc(f.urgence || '—') + '</b></div>';
      if (f.embauche && s.vacancesPct < 6) {
        var p = Math.min(100, Math.round((s.mois || 0) / 36 * 100));
        h += '<div><div class="jauge"><i style="width:' + p + '%"></i></div><div class="note" style="margin-top:.3rem">${T("Passe à 6 % de vacances le")} ' + esc(court(s.dateSixPct) + ' ' + String(s.dateSixPct).slice(0, 4)) + '</div></div>';
      }
      if (s.sousMinimum) h += '<div class="bandeau a">${T("Taux sous le salaire minimum réglé")} (' + szArgent(R.salaireMin) + ').</div>';
      if (!(R.salaireMin > 0)) h += '<div class="note">${T("Le salaire minimum n’est pas réglé : réglez-le dans Paie → Réglages pour être averti d’un taux trop bas (il change chaque 1er mai).")}</div>';
      h += '<div class="hist"><b>${T("Historique du taux")}</b>' + (f.tauxHist || []).slice().reverse().map(function(x){
        var futur = x.des > D.aujourdhui;
        return '<span class="' + (futur ? 'fut' : '') + '">' + szArgent(x.taux) + ' ' + (x.des <= '2000-01-01' ? '${T("depuis le début")}' : (futur ? '${T("à partir du")} ' : '${T("depuis le")} ') + esc(court(x.des) + ' ' + x.des.slice(0, 4))) + (futur ? ' · ${T("prévu")}' : '') + '</span>';
      }).join('') + '</div>';
    }
    if (f.note) h += '<div class="note">' + esc(f.note) + '</div>';
    if (D.peutModifier) h += '<div class="gestes"><button class="mini" data-act="fiche">${T("Modifier la fiche")}</button>' + (inclus(s) ? '<button class="mini" data-act="taux">${T("Nouveau taux")}</button><button class="mini" data-act="conge">${T("Ajouter un congé")}</button>' : '') + '</div>';
    return h + '</div>';
  }

  /* ══ PAIE ══ */
  function vuePaie(){
    if (!PAIE) return '<div class="carte vide">${T("Calcul de la paie…")}</div>';
    if (PAIE.erreur) return '<div class="carte vide">' + esc(expliquer(PAIE.erreur)) + '</div>';
    var t = PAIE.totaux || {}, R = PAIE.reglages || {};
    var l = PAIE.lignes || [];
    var h = '';
    var finie = D.periode.fin < D.aujourdhui;
    var nA = (D.anomalies || []).length;
    if (PAIE.approuvee) h += '<div class="bandeau v"><span>✓</span><span><b>${T("Période approuvée")}</b> ${T("le")} ' + esc(court(String(PAIE.approuvee.le).slice(0, 10))) + ' ${T("par")} ' + esc(PAIE.approuvee.par || '') + ' · ${T("les chiffres sont figés.")}</span>'
      + (D.peutModifier ? '<button class="mini" id="em-rouvrir">${T("Rouvrir")}</button>' : '') + '</div>';
    else if (!finie) h += '<div class="bandeau a"><span>${T("Période en cours : les chiffres bougent jusqu’au")} <b>' + esc(court(D.periode.fin)) + '</b>' + (nA ? ' ' + nA + ' ${T("à régler dans Aujourd’hui.")}' : '') + '</span></div>';
    else h += '<div class="bandeau a"><span>' + (nA ? '<b>' + nA + ' ${T("à régler")}</b> ${T("avant d’approuver.")}' : '<b>${T("Prête à approuver.")}</b> ${T("Vérifiez les bulletins, puis approuvez : la période sera figée.")}') + '</span>'
      + (D.peutModifier ? (nA ? '<button class="mini" data-og="aujourdhui">${T("Voir")}</button>' : '') + '<button class="prim mini" id="em-approuver">${T("Approuver la période")}</button>' : '') + '</div>';
    h += szTuiles('<div class="em-tuiles">'
      + tuile('t2', '${T("Heures")}', h2((t.heures || 0) + (t.heuresSup || 0)), (t.heuresSup || 0) > 0 ? h2(t.heuresSup) + ' ${T("supplémentaires")}' : '${T("aucune supplémentaire")}')
      + tuile('t3', '${T("Fériés et maladie")}', szArgent((t.ferie || 0) + (t.maladie || 0)), (PAIE.feries || []).length ? (PAIE.feries || []).map(function(f){ return esc(f.nom); }).join(', ') : '${T("aucun férié dans la période")}')
      + tuile('t4', '${T("Vacances")}', szArgent(t.vacances || 0), R.vacancesMode === 'accumule' ? '${T("versées au départ en vacances")}' : '${T("versées à chaque paie")}')
      + tuile('t1', '${T("Brut avant retenues")}', szArgent(t.brut || 0), l.length + ' ' + (l.length > 1 ? '${T("personnes")}' : '${T("personne")}')) + '</div>');
    if (!l.length) return h + '<div class="carte vide">${T("Rien à payer dans cette période : aucun pointage fermé et aucune vente au comptoir attribuée.")}</div>' + historique();
    var tab = '<div class="carte" style="padding:.5rem .6rem"><table class="em-t"><thead><tr><th>${T("Personne")}</th><th class="n">${T("Heures")}</th><th class="n">${T("Supp.")}</th>'
      + '<th class="n">${T("Férié")}</th><th class="n">${T("Vacances")}</th><th class="n">${T("Commissions")}</th><th class="n">${T("Brut")}</th></tr></thead><tbody>'
      + l.map(function(x){
          return '<tr class="' + (x.staffId === CHOISI ? 'on' : '') + '" data-ligne="' + esc(x.staffId) + '"><td>' + qui(x.staffId, x.nom, szArgent(x.taux) + ' ${T("/ h")}'
            + (x.ouverts ? ' · <span class="pill a" title="${T("Un pointage est encore ouvert : il n’entre pas dans la paie tant qu’il n’est pas fermé.")}">${T("pointage ouvert")}</span>' : '')) + '</td>'
            + '<td class="n">' + h2(x.heures) + '</td><td class="n">' + ((x.heuresSup || 0) > 0 ? '<span class="pill a">' + h2(x.heuresSup) + '</span>' : '—') + '</td>'
            + '<td class="n">' + ((x.ferie || 0) + (x.maladie || 0) ? szArgent((x.ferie || 0) + (x.maladie || 0)) : '—') + '</td>'
            + '<td class="n">' + szArgent(x.vacancesVersees || 0) + '</td>'
            + '<td class="n">' + (x.commissions ? szArgent(x.commissions) : '—') + '</td><td class="n or">' + szArgent(x.brut) + '</td></tr>';
        }).join('') + '</tbody><tfoot><tr><td>${T("Total")}</td><td class="n">' + h2(t.heures) + '</td><td class="n">' + h2(t.heuresSup) + '</td><td class="n">' + szArgent((t.ferie || 0) + (t.maladie || 0))
      + '</td><td class="n">' + szArgent(t.vacances || 0) + '</td><td class="n">' + szArgent(t.commissions || 0) + '</td><td class="n or">' + szArgent(t.brut || 0) + '</td></tr></tfoot></table>'
      + '<div class="note" style="padding:.5rem .55rem 0">${T("Montants BRUTS, avant retenues (RRQ, AE, RQAP, impôts) : l’export sert à les saisir dans votre logiciel de paie.")}</div></div>';
    return h + '<div class="g3 imp">' + tab + bulletin(l.filter(function(x){ return x.staffId === CHOISI; })[0] || l[0]) + '</div>' + historique();
  }
  function bulletin(x){
    if (!x) return '';
    var R = PAIE.reglages || {};
    var ln = function(k, v){ return '<div class="l"><span>' + k + '</span><b>' + v + '</b></div>'; };
    var h = '<div class="carte bul" id="bulletin"><h3>${T("Bulletin")} · ' + esc(x.nom) + '</h3><div class="note" style="margin-top:-.3rem">' + esc('${T("Du ")}' + court(PAIE.debut) + ' ${T("au")} ' + court(PAIE.fin) + ' ' + String(PAIE.fin).slice(0, 4)) + '</div>';
    h += ln('${T("Heures régulières")} ' + szNombre(x.heures, 2) + ' h', szArgent(x.salaireReg != null ? x.salaireReg : x.salaire));
    if (x.heuresSup) h += ln('${T("Supplémentaires")} ' + szNombre(x.heuresSup, 2) + ' h ${T("à")} ' + szNombre((R.tauxHS || 1.5) * 100, 0) + ' %', szArgent(x.salaireSup || 0));
    (x.feries || []).forEach(function(f){ h += ln(esc(f.nom), szArgent(f.montant)); });
    (x.maladies || []).forEach(function(m){ h += ln('${T("Maladie payée,")} ' + esc(court(m.date)), szArgent(m.montant)); });
    if (x.commissions) h += ln('${T("Commissions")} ' + szNombre(x.pct, 1) + ' % ${T("de")} ' + szArgent(x.ventes), szArgent(x.commissions));
    if (R.vacancesMode === 'accumule') {
      h += ln('${T("Vacances acquises")} (' + x.vacancesPct + ' %)', '<span class="note">' + szArgent(x.vacancesAcquises || 0) + '</span>');
      if (x.vacancesVersees) h += ln('${T("Vacances versées")}', szArgent(x.vacancesVersees));
    } else h += ln('${T("Vacances")} ' + x.vacancesPct + ' % ${T("versées")}', szArgent(x.vacancesVersees || 0));
    h += '<div class="l t"><span>${T("Brut")}</span><b>' + szArgent(x.brut) + '</b></div>';
    h += '<div class="note">${T("Avant retenues : RRQ, AE, RQAP et impôts se calculent dans le logiciel de paie.")}</div>';
    h += '<div class="gestes"><button class="mini" id="em-imprimer">${T("Imprimer le bulletin")}</button></div></div>';
    return h;
  }
  function historique(){
    var l = D.historique || [];
    if (!l.length) return '';
    return '<div class="carte"><h3>${T("Paies approuvées")}</h3><div class="hp" style="margin-top:.4rem">' + l.slice(0, 8).map(function(p){
      return '<button type="button" data-allerper="' + esc(p.debut) + '"><b>' + esc(court(p.debut) + ' – ' + court(p.fin) + ' ' + p.fin.slice(0, 4)) + '</b><span>'
        + p.personnes + ' ' + (p.personnes > 1 ? '${T("personnes")}' : '${T("personne")}') + ' · ' + szArgent(p.brut) + '</span></button>';
    }).join('') + '</div></div>';
  }

  function dessiner(){
    if (!D) return;
    var h = tete();
    if (ONGLET === 'horaire') h += vueHoraire();
    else if (ONGLET === 'equipe') h += vueEquipe();
    else if (ONGLET === 'paie') h += vuePaie();
    else h += vueAujourdhui();
    corps.innerHTML = h;
  }

  /* ══ LES BOÎTES ══ */
  function boite(titre, sous, interieur, bouton, large, gauche){
    BOITE = true;
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite' + (large ? ' large' : '') + '" role="dialog" aria-modal="true" aria-labelledby="bx-t"><h3 id="bx-t">' + titre + '</h3>'
      + (sous ? '<div class="sous">' + sous + '</div>' : '') + interieur
      + '<div class="pied-b"><span class="gauche">' + (gauche || '') + '</span><button type="button" id="bx-x">${T("Annuler")}</button><button type="button" class="prim" id="bx-ok">' + bouton + '</button></div></div>';
    document.body.appendChild(v);
    var fermer = function(){ document.removeEventListener('keydown', clav, true); v.remove(); BOITE = false; };
    var clav = function(ev){ if (ev.key === 'Escape') { ev.preventDefault(); fermer(); } };
    document.addEventListener('keydown', clav, true);
    v.addEventListener('mousedown', function(ev){ if (ev.target === v) fermer(); });
    v.querySelector('#bx-x').onclick = fermer;
    var premier = v.querySelector('input:not([type=checkbox]),select');
    try { if (premier) premier.focus(); } catch (e) {}
    return { el: v, fermer: fermer, ok: v.querySelector('#bx-ok'), val: function(id){ var e = v.querySelector('#' + id); return e ? (e.type === 'checkbox' ? e.checked : e.value) : ''; } };
  }
  function optionsPersonnes(sel){
    return equipe().map(function(s){ return '<option value="' + esc(s.id) + '"' + (s.id === sel ? ' selected' : '') + '>' + esc(s.nom) + '</option>'; }).join('');
  }
  function envoyer(b, op, args, ok){
    b.ok.disabled = true;
    appeler(op, args).then(function(r){
      b.ok.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      b.fermer(); if (ok) dire(ok, 'bon'); PAIE = null; charger();
    });
  }
  function boiteQuart(q){
    var neuf = !q.id;
    var b = boite(neuf ? '${T("Nouveau quart")}' : '${T("Modifier le quart")}', esc(nomDe(q.staffId) + ' · ' + jourLong(q.date)),
      '<div class="champs trois"><label class="ch">${T("Début")}<input type="time" id="q-d" value="' + esc(q.debut) + '"></label>'
      + '<label class="ch">${T("Fin")}<input type="time" id="q-f" value="' + esc(q.fin) + '"></label>'
      + '<label class="ch">${T("Date")}<input type="date" id="q-j" value="' + esc(q.date) + '"></label>'
      + '<label class="ch large">${T("Note")}<input id="q-n" maxlength="120" value="' + esc(q.note || '') + '" placeholder="${T("Ex. : ouverture, inventaire")}"></label></div>',
      neuf ? '${T("Ajouter le quart")}' : '${T("Enregistrer")}', false, neuf ? '' : '<button type="button" class="dang" id="q-sup">${T("Retirer ce quart")}</button>');
    b.ok.onclick = function(){ envoyer(b, 'employes:quart', [{ id: q.id || '', staffId: q.staffId, date: b.val('q-j'), debut: b.val('q-d'), fin: b.val('q-f'), note: b.val('q-n') }], neuf ? '${T("Quart ajouté.")}' : '${T("Quart modifié.")}'); };
    var sup = b.el.querySelector('#q-sup');
    if (sup) sup.onclick = function(){ envoyer(b, 'employes:quartSupprimer', [q.id], '${T("Quart retiré.")}'); };
  }
  function boitePointage(p){
    var neuf = !p.id;
    var b = boite(neuf ? '${T("Ajouter un pointage")}' : '${T("Corriger le pointage")}', '${T("Une sortie plus tôt que l’entrée compte pour le lendemain (quart de nuit). Sans sortie, la personne reste « en poste ».")}',
      '<div class="champs"><label class="ch large">${T("Personne")}<select id="p-s">' + optionsPersonnes(p.staffId) + '</select></label>'
      + '<label class="ch">${T("Date")}<input type="date" id="p-j" value="' + esc(p.date) + '"></label><span></span>'
      + '<label class="ch">${T("Entrée")}<input type="time" id="p-e" value="' + esc(p.entree) + '"></label>'
      + '<label class="ch">${T("Sortie")}<input type="time" id="p-o" value="' + esc(p.sortie) + '"></label>'
      + '<label class="ch large">${T("Note")}<input id="p-n" maxlength="200" value="' + esc(p.note || '') + '" placeholder="${T("Ex. : oubli de pointage")}"></label>'
      + '<label class="ch case large"><input type="checkbox" id="p-sp"' + (p.sansPause ? ' checked' : '') + '>${T("Sans pause repas (la personne ne pouvait pas quitter son poste)")}</label></div>',
      neuf ? '${T("Ajouter le pointage")}' : '${T("Enregistrer la correction")}', false, neuf ? '' : '<button type="button" class="dang" id="p-sup">${T("Supprimer")}</button>');
    b.ok.onclick = function(){
      var j = b.val('p-j'), e = b.val('p-e'), o = b.val('p-o');
      if (!j || !e) { dire('${T("Indiquez la date et l’heure d’entrée.")}', 'att'); return; }
      var sortie = o ? (o > e ? j : plus(j, 1)) + 'T' + o : '';
      envoyer(b, 'employes:pointage', [{ id: p.id || '', staffId: b.val('p-s'), entree: j + 'T' + e, sortie: sortie, note: b.val('p-n'), sansPause: b.val('p-sp') }], '${T("Pointage enregistré.")}');
    };
    var sup = b.el.querySelector('#p-sup');
    if (sup) sup.onclick = function(){ envoyer(b, 'employes:pointageSupprimer', [p.id], '${T("Pointage supprimé.")}'); };
  }
  function pointageDe(id){
    var l = (D.pointages || []).concat(D.pointagesSemaine || []);
    var p = l.filter(function(x){ return x.id === id; })[0]; if (!p) return null;
    return { id: p.id, staffId: p.staffId, date: p.jour || isoDe(new Date(p.entree)), entree: hm(p.entree), sortie: p.sortie ? hm(p.sortie) : '', note: p.note || '', sansPause: !!p.sansPause };
  }
  function boiteConge(staffId, date){
    var b = boite('${T("Ajouter un congé")}', '${T("Les quarts de ces jours-là sont retirés de l’horaire.")}',
      '<div class="champs"><label class="ch large">${T("Personne")}<select id="c-s">' + optionsPersonnes(staffId) + '</select></label>'
      + '<label class="ch">${T("Du")}<input type="date" id="c-d" value="' + esc(date) + '"></label>'
      + '<label class="ch">${T("Au")}<input type="date" id="c-f" value="' + esc(date) + '"></label>'
      + '<label class="ch large">${T("Type")}<select id="c-m"><option value="vacances">${T("Vacances")}</option><option value="maladie">${T("Maladie")}</option>'
      + '<option value="sans_solde">${T("Sans solde")}</option><option value="autre">${T("Autre absence")}</option></select></label>'
      + '<label class="ch case large"><input type="checkbox" id="c-p">${T("Jour de maladie PAYÉ (2 par année, après 3 mois de service)")}</label>'
      + '<label class="ch large">${T("Note")}<input id="c-n" maxlength="120" value=""></label></div>',
      '${T("Ajouter le congé")}');
    b.ok.onclick = function(){
      var m = b.val('c-m');
      envoyer(b, 'employes:conge', [{ staffId: b.val('c-s'), debut: b.val('c-d'), fin: b.val('c-f') || b.val('c-d'), motif: m, paye: m === 'maladie' && b.val('c-p'), note: b.val('c-n') }], '${T("Congé ajouté.")}');
    };
  }
  function boiteFiche(s){
    var f = s.fiche || {};
    var b = boite('${T("Modifier la fiche")}', esc(s.nom),
      '<div class="champs"><label class="ch">${T("Poste")}<input id="f-po" maxlength="60" value="' + esc(f.poste || '') + '" placeholder="${T("Ex. : conseillère, couturière")}"></label>'
      + '<label class="ch">${T("Emploi")}<select id="f-em"><option value="">—</option><option value="plein"' + (f.emploi === 'plein' ? ' selected' : '') + '>${T("Temps plein")}</option>'
      + '<option value="partiel"' + (f.emploi === 'partiel' ? ' selected' : '') + '>${T("Temps partiel")}</option></select></label>'
      + '<label class="ch">${T("Embauche")}<input type="date" id="f-eb" value="' + esc(f.embauche || '') + '"></label>'
      + '<label class="ch">${T("Commission")}<span class="unite"><input type="number" id="f-co" min="0" max="50" step="0.1" value="' + esc(f.commission || 0) + '" aria-label="${T("Commission")}"><i>%</i></span></label>'
      + '<label class="ch">${T("Taux horaire actuel")}<span class="unite"><input type="number" id="f-tx" min="0" max="500" step="0.01" value="' + esc(s.taux || 0) + '" aria-label="${T("Taux horaire actuel")}"><i>$ / h</i></span></label>'
      + '<label class="ch">${T("Contact d’urgence")}<input id="f-ur" maxlength="120" value="' + esc(f.urgence || '') + '" placeholder="${T("Nom et téléphone")}"></label>'
      + '<label class="ch large">${T("Note")}<input id="f-no" maxlength="300" value="' + esc(f.note || '') + '"></label>'
      + '<label class="ch case large"><input type="checkbox" id="f-in"' + (f.inclus === false ? '' : ' checked') + '>${T("À la paie (décochez pour la propriétaire ou un compte technique)")}</label></div>'
      + '<div class="note">${T("Le taux saisi ici CORRIGE le taux en vigueur. Pour une augmentation à une date, utilisez « Nouveau taux » : les périodes déjà payées ne bougent pas.")}</div>',
      '${T("Enregistrer")}');
    b.ok.onclick = function(){
      envoyer(b, 'employes:fiche', [{ id: s.id, poste: b.val('f-po'), emploi: b.val('f-em'), embauche: b.val('f-eb'), commission: b.val('f-co'), taux: b.val('f-tx'),
        urgence: b.val('f-ur'), note: b.val('f-no'), inclus: b.val('f-in') }], '${T("Fiche enregistrée : ")}' + s.nom);
    };
  }
  function boiteTaux(s){
    var b = boite('${T("Nouveau taux")}', esc(s.nom + ' · ${T("taux actuel")} ' + szArgent(s.taux || 0)),
      '<div class="champs"><label class="ch">${T("Nouveau taux")}<span class="unite"><input type="number" id="t-tx" min="0" max="500" step="0.01" value="" aria-label="${T("Nouveau taux")}"><i>$ / h</i></span></label>'
      + '<label class="ch">${T("À partir du")}<input type="date" id="t-de" value="' + esc(D.aujourdhui) + '"></label></div>'
      + '<div class="note">${T("Les heures faites avant cette date restent payées à l’ancien taux.")}</div>',
      '${T("Enregistrer le taux")}');
    b.ok.onclick = function(){ envoyer(b, 'employes:taux', [{ staffId: s.id, taux: b.val('t-tx'), des: b.val('t-de') }], '${T("Nouveau taux enregistré.")}'); };
  }
  function boiteReglages(){
    var R = (D && D.reglages) || {};
    var mods = (R.modeles || []).slice();
    var ligneMod = function(m, i){ return '<div class="m" data-mi="' + i + '"><input data-mk="nom" maxlength="30" value="' + esc(m.nom) + '" aria-label="${T("Nom du modèle")}">'
      + '<input type="time" data-mk="debut" value="' + esc(m.debut) + '" aria-label="${T("Début")}"><input type="time" data-mk="fin" value="' + esc(m.fin) + '" aria-label="${T("Fin")}">'
      + '<button type="button" class="mini" data-mx="' + i + '" aria-label="${T("Retirer ce modèle")}">✕</button></div>'; };
    var b = boite('${T("Réglages de la paie")}', '${T("Ils s’appliquent aux périodes qui ne sont pas encore approuvées.")}',
      '<div class="champs trois"><label class="ch">${T("Période")}<select id="r-p"><option value="14"' + (R.periodeJours === 14 ? ' selected' : '') + '>${T("Aux deux semaines")}</option>'
      + '<option value="7"' + (R.periodeJours === 7 ? ' selected' : '') + '>${T("Chaque semaine")}</option></select></label>'
      + '<label class="ch">${T("Première période commence le")}<input type="date" id="r-d" value="' + esc(R.debutRef || '') + '"></label>'
      + '<label class="ch">${T("Salaire minimum")}<span class="unite"><input type="number" id="r-mi" min="0" max="100" step="0.01" value="' + esc(R.salaireMin || '') + '" aria-label="${T("Salaire minimum")}"><i>$ / h</i></span></label>'
      + '<label class="ch">${T("Supplémentaires après")}<span class="unite"><input type="number" id="r-s" min="30" max="60" step="1" value="' + esc(R.seuilHS) + '" aria-label="${T("Supplémentaires après")}"><i>${T("h / sem.")}</i></span></label>'
      + '<label class="ch">${T("Payées à")}<span class="unite"><input type="number" id="r-t" min="100" max="300" step="5" value="' + esc(Math.round((+R.tauxHS || 1.5) * 100)) + '" aria-label="${T("Payées à")}"><i>%</i></span></label>'
      + '<label class="ch">${T("Vacances")}<select id="r-v"><option value="paie"' + (R.vacancesMode !== 'accumule' ? ' selected' : '') + '>${T("Versées à chaque paie")}</option>'
      + '<option value="accumule"' + (R.vacancesMode === 'accumule' ? ' selected' : '') + '>${T("Accumulées, versées au départ")}</option></select></label>'
      + '<label class="ch case"><input type="checkbox" id="r-pa"' + (R.pauseAuto !== false ? ' checked' : '') + '>${T("Pause repas déduite")}</label>'
      + '<label class="ch">${T("Après")}<span class="unite"><input type="number" id="r-ph" min="3" max="12" step="0.5" value="' + esc(R.pauseApresH) + '" aria-label="${T("Pause après")}"><i>h</i></span></label>'
      + '<label class="ch">${T("Durée")}<span class="unite"><input type="number" id="r-pm" min="0" max="90" step="5" value="' + esc(R.pauseMin) + '" aria-label="${T("Durée de la pause")}"><i>min</i></span></label>'
      + '<label class="ch">${T("Pâques : congé le")}<select id="r-pq"><option value="vendredi"' + (R.paques !== 'lundi' ? ' selected' : '') + '>${T("Vendredi saint")}</option>'
      + '<option value="lundi"' + (R.paques === 'lundi' ? ' selected' : '') + '>${T("Lundi de Pâques")}</option></select></label>'
      + '<label class="ch">${T("Retard signalé après")}<span class="unite"><input type="number" id="r-rt" min="1" max="120" step="1" value="' + esc(R.retardMin) + '" aria-label="${T("Retard signalé après")}"><i>min</i></span></label></div>'
      + '<div class="ch large" style="margin-top:.2rem">${T("Modèles de quart")}<div class="mods" id="r-mods">' + mods.map(ligneMod).join('') + '</div>'
      + '<button type="button" class="mini" id="r-madd" style="align-self:flex-start">${T("+ Ajouter un modèle")}</button></div>'
      + '<div class="note">${T("Normes du travail du Québec : supplémentaires au-delà de 40 h par semaine à 150 % ; pause de 30 min non payée après 5 h ; vacances 4 %, 6 % dès 3 ans ; fériés et maladie payés à 1/20 du salaire des 4 semaines précédentes. Le salaire minimum change chaque 1er mai.")}</div>',
      '${T("Enregistrer")}', true);
    var lire = function(){ var out = []; b.el.querySelectorAll('#r-mods .m').forEach(function(r){ var g = function(k){ return r.querySelector('[data-mk="' + k + '"]').value; };
      out.push({ id: 'm' + (out.length + 1), nom: g('nom'), debut: g('debut'), fin: g('fin') }); }); return out; };
    b.el.addEventListener('click', function(ev){
      var x = ev.target.closest && ev.target.closest('[data-mx]');
      if (x) { mods = lire(); mods.splice(+x.getAttribute('data-mx'), 1); b.el.querySelector('#r-mods').innerHTML = mods.map(ligneMod).join(''); }
      if (ev.target.id === 'r-madd') { mods = lire(); mods.push({ nom: '', debut: '09:00', fin: '17:00' }); b.el.querySelector('#r-mods').innerHTML = mods.map(ligneMod).join(''); }
    });
    b.ok.onclick = function(){
      envoyer(b, 'employes:reglages', [{ periodeJours: +b.val('r-p'), debutRef: b.val('r-d'), salaireMin: +b.val('r-mi') || 0, seuilHS: +b.val('r-s'), tauxHS: Math.round(+b.val('r-t')) / 100,
        vacancesMode: b.val('r-v'), pauseAuto: b.val('r-pa'), pauseApresH: +b.val('r-ph'), pauseMin: +b.val('r-pm'), paques: b.val('r-pq'), retardMin: +b.val('r-rt'), modeles: lire() }],
        '${T("Réglages de la paie enregistrés.")}');
      PERIODE = '';
    };
  }

  /* Un clic sur une ligne de la ligne de temps : l'heure sous le pointeur (arrondie à la demi-heure). */
  function heureSous(zone, ev){
    var r = zone.getBoundingClientRect(), b0 = +zone.getAttribute('data-b0'), b1 = +zone.getAttribute('data-b1');
    var m = b0 + (ev.clientX - r.left) / r.width * (b1 - b0);
    m = Math.max(b0, Math.min(b1 - 60, Math.round(m / 30) * 30));
    return deux(Math.floor(m / 60)) + ':' + deux(m % 60);
  }
  function poserModele(m, staffId){
    appeler('employes:quart', [{ staffId: staffId, date: JOUR, debut: m.debut, fin: m.fin, note: m.nom }]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('${T("Quart ajouté :")} ' + m.nom + ' · ' + nomDe(staffId), 'bon'); charger();
    });
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var b;
    if ((b = t.closest('[data-og]'))) { ONGLET = b.getAttribute('data-og'); ARME = null; if (ONGLET === 'aujourdhui') SEMAINE = ''; if (ONGLET === 'paie') { PAIE = null; dessiner(); chargerPaie(); } else if (ONGLET === 'aujourdhui') charger(); else dessiner(); return; }
    if ((b = t.closest('[data-sem]'))) { var n = +b.getAttribute('data-sem'); SEMAINE = n ? plus(D.semaine[0], n) : ''; JOUR = n ? plus(JOUR, n) : ''; charger(); return; }
    if ((b = t.closest('[data-jour]'))) { JOUR = b.getAttribute('data-jour'); dessiner(); return; }
    if ((b = t.closest('[data-per]'))) {
      appeler('employes:periode', [D.periode.debut, +b.getAttribute('data-per')]).then(function(r){ if (r && r.ok) { PERIODE = r.debut; PAIE = null; charger(); } });
      return;
    }
    if ((b = t.closest('[data-allerper]'))) { PERIODE = b.getAttribute('data-allerper'); PAIE = null; charger(); return; }
    if ((b = t.closest('[data-fiche]'))) { CHOISI = b.getAttribute('data-fiche'); dessiner(); return; }
    if ((b = t.closest('[data-ligne]'))) { CHOISI = b.getAttribute('data-ligne'); dessiner(); return; }
    if ((b = t.closest('[data-mod]'))) {
      var id = b.getAttribute('data-mod');
      var m = (D.reglages.modeles || []).filter(function(x){ return x.id === id; })[0];
      ARME = (ARME && ARME.id === id) ? null : m; dessiner(); return;
    }
    if (!D.peutModifier) return;
    if ((b = t.closest('[data-act]'))) {
      var a = b.getAttribute('data-act'), sel = pers(CHOISI) || equipe()[0];
      if (a === 'pointage') boitePointage({ staffId: (sel || {}).id || '', date: D.aujourdhui, entree: '09:00', sortie: '17:00' });
      else if (a === 'conge') boiteConge(ONGLET === 'equipe' && sel ? sel.id : ((equipe()[0] || {}).id || ''), ONGLET === 'horaire' ? JOUR : D.aujourdhui);
      else if (a === 'fiche' && sel) boiteFiche(sel);
      else if (a === 'taux' && sel) boiteTaux(sel);
      return;
    }
    if ((b = t.closest('[data-pmod]'))) { var p = pointageDe(b.getAttribute('data-pmod')); if (p) boitePointage(p); return; }
    if ((b = t.closest('[data-qmod]'))) {
      var q = (D.horaires || []).filter(function(x){ return x.id === b.getAttribute('data-qmod'); })[0];
      if (q) boiteQuart({ id: q.id, staffId: q.staffId, date: q.date, debut: q.debut, fin: q.fin, note: q.note || '' });
      return;
    }
    if ((b = t.closest('[data-cgx]'))) {
      var cid = b.getAttribute('data-cgx');
      szConfirmer({ titre: '${T("Retirer ce congé")}', texte: '${T("Le jour redevient libre à l’horaire. Les quarts retirés ne reviennent pas d’eux-mêmes.")}', oui: '${T("Retirer")}' }).then(function(okc){
        if (!okc) return;
        appeler('employes:congeSupprimer', [cid]).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } dire('${T("Congé retiré.")}', 'bon'); charger(); });
      });
      return;
    }
    if ((b = t.closest('[data-absent]'))) {
      var an = (D.anomalies || [])[+b.getAttribute('data-absent')]; if (!an) return;
      var qq = (an.prevu || '').split('–');
      szConfirmer({ titre: nomDe(an.staffId) + ' · ' + jourLong(an.date), texte: '${T("Ce quart n’a aucun pointage. Était-ce une absence (congé), ou un oubli de pointage ?")}', oui: '${T("Saisir le pointage")}', non: '${T("C’était un congé")}' }).then(function(okc){
        if (okc) boitePointage({ staffId: an.staffId, date: an.date, entree: qq[0] || '09:00', sortie: qq[1] || '17:00', note: '${T("Oubli de pointage")}' });
        else boiteConge(an.staffId, an.date);
      });
      return;
    }
    if ((b = t.closest('[data-zone]'))) {
      if (b.classList.contains('ferme')) return;
      var sid = b.getAttribute('data-zone');
      if (ARME) { poserModele(ARME, sid); return; }
      var d0 = heureSous(b, ev), m0 = minDe(d0) + 8 * 60;
      boiteQuart({ staffId: sid, date: JOUR, debut: d0, fin: deux(Math.min(23, Math.floor(m0 / 60))) + ':' + deux(m0 % 60) });
      return;
    }
    if (t.id === 'em-mods' || t.id === 'em-reg') { boiteReglages(); return; }
    if (t.id === 'em-copier') {
      appeler('employes:copierSemaine', [D.semaine[0]]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.copies ? (r.copies + ' ' + (r.copies > 1 ? '${T("quarts copiés.")}' : '${T("quart copié.")}')) : '${T("Rien à copier : la semaine précédente est vide, ou déjà reprise.")}', 'bon'); charger();
      });
      return;
    }
    if (t.id === 'em-approuver') {
      szConfirmer({ titre: '${T("Approuver la période")}', texte: '${T("La paie de cette période sera figée : aucun pointage, quart ou congé de ces dates ne pourra changer sans rouvrir la période.")}', oui: '${T("Approuver")}' }).then(function(okc){
        if (!okc) return;
        appeler('employes:approuver', [D.periode.debut]).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } dire('${T("Période approuvée.")}', 'bon'); PAIE = null; charger(); });
      });
      return;
    }
    if (t.id === 'em-rouvrir') {
      szConfirmer({ danger: true, titre: '${T("Rouvrir la période")}', texte: '${T("Les chiffres se recalculeront. Si la paie a déjà été versée, refaites l’export et corrigez-la dans le logiciel de paie. La réouverture est notée.")}', oui: '${T("Rouvrir")}' }).then(function(okc){
        if (!okc) return;
        appeler('employes:rouvrir', [D.periode.debut, '${T("rouverte depuis la fenêtre Employés")}']).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } dire('${T("Période rouverte.")}', 'bon'); PAIE = null; charger(); });
      });
      return;
    }
    if (t.id === 'em-imprimer') { try { window.print(); } catch (e) {} return; }
    if (t.id === 'em-csv') {
      appeler('employes:paieCsv', [D.periode.debut, D.periode.fin]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        var nom = 'paie-' + D.periode.debut + '-au-' + D.periode.fin + '.csv';
        P.enregistrerExport(nom, r.csv).then(function(x){
          dire(x && x.ok ? ('${T("Rapport de paie enregistré : ")}' + nom) : '${T("Le rapport n’a pas pu être enregistré.")}', x && x.ok ? 'bon' : 'err');
        });
      });
      return;
    }
  });
  // Glisser un modèle sur une ligne : le quart se pose.
  corps.addEventListener('dragstart', function(ev){ var b = ev.target.closest && ev.target.closest('[data-mod]'); if (b) { try { ev.dataTransfer.setData('text/plain', b.getAttribute('data-mod')); } catch (e) {} } });
  corps.addEventListener('dragover', function(ev){ var z = ev.target.closest && ev.target.closest('[data-zone]'); if (z && !z.classList.contains('ferme')) ev.preventDefault(); });
  corps.addEventListener('drop', function(ev){
    var z = ev.target.closest && ev.target.closest('[data-zone]'); if (!z || z.classList.contains('ferme')) return;
    ev.preventDefault();
    var id = ''; try { id = ev.dataTransfer.getData('text/plain'); } catch (e) {}
    var m = (D.reglages.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (m && D.peutModifier) poserModele(m, z.getAttribute('data-zone'));
  });

  window.szActualiser = function(){ if (!BOITE) charger(); };
  window.szRevenir = function(){ if (!BOITE) charger(); };
  window.szModeAncre = function(estAncree){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:auto;'
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    if (estAncree) {
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

module.exports = { pageEmployes };
