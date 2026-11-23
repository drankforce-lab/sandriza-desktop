'use strict';
/*
 * EMPLOYÉS ET PAIE — fenêtre native (2026-11-22)
 * =============================================================================
 * Sa demande : « le module Employés : horaires, pointage à la caisse, commissions
 * sur les ventes et rapport prêt pour la paie — prêt le jour où j'embaucherai ».
 *
 * Quatre onglets, un seul cœur (assets/js/employes.js, par le pont) :
 *   Équipe     taux horaire, % de commission, inclus à la paie, embauche.
 *   Horaires   la semaine (dimanche → samedi) : les quarts prévus, copier la semaine d'avant.
 *   Pointages  les heures faites dans la période (la caisse les pointe) : saisir, corriger.
 *   Paie       la période : heures régulières, supplémentaires (> 40 h/semaine à 150 %),
 *              commissions sur les ventes au comptoir, brut — et l'export CSV.
 *
 *   employes:donnees(semaine, periode) → { personnel[], horaires[], pointages[], periode, reglages, … }
 *   employes:paie(debut, fin)          → { lignes[], totaux }
 *
 * ⚠ LE RAPPORT EST UN BRUT AVANT RETENUES. RRQ, AE, RQAP et impôts se calculent dans
 *   le logiciel de paie : l'écran le dit, l'export aussi.
 *
 * États d'ouverture (pour les bancs de rendu, qui ne cliquent pas) :
 *   'horaires' | 'pointages' | 'paie' → l'onglet ouvert d'emblée.
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
input[type=checkbox]{width:auto;padding:0;cursor:pointer}
select:focus,input:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.dang{color:var(--tx-err2)}
button.mini{padding:.12rem .45rem;font-size:.76rem}
#corps{flex:1 1 auto;min-height:0;overflow:hidden;padding:.85rem 1.1rem .7rem;display:flex;flex-direction:column;gap:.75rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)}
.em-tete{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap}
.em-tete .ed-seg button{height:2rem;padding:0 .9rem}
.em-tete .ed-seg button.on{background:var(--or);color:#1a1208;font-weight:700}
.em-tete .droite{margin-left:auto;display:flex;align-items:center;gap:.45rem}
.em-nav{display:flex;align-items:center;gap:.45rem}
.em-nav b{font-size:.9rem;min-width:13rem;text-align:center}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:14px;padding:.8rem .9rem;min-width:0}
.em-t{width:100%;border-collapse:separate;border-spacing:0 4px;font-size:.82rem}
.em-t th{text-align:left;font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);font-weight:700;padding:0 .55rem}
.em-t th.n,.em-t td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.em-t td{background:var(--f-carte);padding:.4rem .55rem;border-top:1px solid var(--v07);border-bottom:1px solid var(--v07);vertical-align:middle}
.em-t td:first-child{border-left:1px solid var(--v07);border-radius:9px 0 0 9px}
.em-t td:last-child{border-right:1px solid var(--v07);border-radius:0 9px 9px 0}
.em-t tfoot td{font-weight:800;background:transparent;border:0}
.em-t input[type=number]{width:6.2rem;text-align:right}
.em-t input[type=date]{width:9.5rem}
.nom b{display:block}.nom span{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-flex;align-items:center;font-size:.7rem;font-weight:700;padding:.1rem .5rem;border-radius:999px;white-space:nowrap;background:var(--v08);color:var(--tx2)}
.pill.ok{background:rgba(74,222,128,.14);color:var(--tx-ok)}
.pill.att{background:rgba(251,191,36,.14);color:var(--tx-att)}
html.jour .pill{color:#47505e} html.jour .pill.ok{color:#1d6a3b}
.em-sem{display:grid;grid-template-columns:11rem repeat(7,minmax(0,1fr)) 4.5rem;gap:4px;font-size:.78rem}
.em-sem .h{font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);font-weight:700;padding:.2rem .35rem}
.em-sem .h.auj{color:var(--tx-or)}
.em-sem .c{background:var(--f-carte);border:1px solid var(--v07);border-radius:8px;padding:.3rem;min-height:3rem;display:flex;flex-direction:column;gap:3px;min-width:0}
.em-sem .c.nm{justify-content:center;font-weight:700}
.em-sem .c.tot{justify-content:center;align-items:flex-end;font-variant-numeric:tabular-nums;font-weight:700}
.em-q{display:flex;align-items:center;gap:.2rem;padding:.1rem .3rem;border-radius:6px;background:rgba(var(--or-rgb),.14);font-variant-numeric:tabular-nums;white-space:nowrap}
.em-q button{border:0;background:transparent;padding:0 .15rem;font-size:.7rem;color:var(--tx2)}
.em-sem .plus{align-self:flex-start;border:1px dashed var(--v16);background:transparent;padding:0 .4rem;font-size:.72rem;color:var(--tx2)}
.em-f{display:flex;align-items:flex-end;gap:.5rem;flex-wrap:wrap;font-size:.8rem}
.em-f label{display:flex;flex-direction:column;gap:.15rem;font-size:.7rem;color:var(--tx2);font-weight:600}
.em-f input[type=time]{width:7rem}
.em-f input.note{width:14rem}
.em-note{font-size:.76rem;color:var(--tx2)}
.em-tot{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5rem}
.em-tot .k{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.5rem .7rem}
.em-tot .k span{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.em-tot .k b{font-size:1.05rem;font-variant-numeric:tabular-nums}
.vide{color:var(--tx2);text-align:center;padding:1.4rem 1rem}
/* ══ LE RENDU VIVANT (2026-11-23, 9.2.10 — sa capture : « améliore le rendu des horaires, du pointage et de la paie ») ══
   Même famille que la fiche de commande « Vivant » : tuiles colorées (cycle --vv), pastilles d'initiales d'une couleur par
   personne, cartes en relief, réglages en vraie carte (champs alignés, unités, note dedans, bouton à droite). */
#corps{gap:.9rem}
.em-tete .ed-seg{display:inline-flex;gap:2px;padding:3px;border-radius:11px;background:var(--f-carte);border:1px solid var(--v08)}
.em-tete .ed-seg button{height:2rem;padding:0 1rem;border:0;background:transparent;border-radius:8px;color:var(--tx2);font-weight:600}
.em-tete .ed-seg button.on{background:var(--sz-btn-prim,var(--or));color:var(--sz-btn-prim-txt,#1a1208);font-weight:700}
.em-nav{gap:2px;padding:3px;border-radius:10px;background:var(--f-carte);border:1px solid var(--v08)}
.em-nav button.mini{border:0;background:transparent;height:1.75rem;padding:0 .6rem;font-size:.8rem}
.em-nav b{min-width:12rem;font-size:.85rem}
.carte{border-radius:16px;box-shadow:0 14px 30px -20px rgba(0,0,0,.55),inset 0 1px 0 var(--v03)}
html.jour .carte{box-shadow:0 10px 24px -18px rgba(20,30,50,.22)}
.em-tuiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}
.em-tu{--emt:var(--vv-1,#5fd4a4);min-width:0;border-radius:14px;padding:.7rem .85rem;display:flex;flex-direction:column;gap:.15rem;
  background:color-mix(in srgb,var(--emt,var(--vv-1,#5fd4a4)) var(--vv-pct,20%),var(--f-carte));border:1px solid color-mix(in srgb,var(--emt,var(--vv-1,#5fd4a4)) 30%,var(--f-carte))}
.em-tu.t2{--emt:var(--vv-2,#7cb4f5)} .em-tu.t3{--emt:var(--vv-3,#b49cf7)} .em-tu.t4{--emt:var(--vv-4,#f08fb8)}
.em-tu .k{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:color-mix(in srgb,var(--emt,var(--vv-1,#5fd4a4)) 45%,var(--tx))}
.em-tu b{font-size:1.35rem;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.em-tu span:not(.k){font-size:.74rem;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:1rem}
.em-tu.att{background:var(--ep-ambre-f);border-color:color-mix(in srgb,var(--ep-ambre-t) 30%,var(--ep-ambre-f))}
.em-tu.att .k,.em-tu.att b{color:var(--ep-ambre-t)}
.em-av{--emc:var(--vv-1,#5fd4a4);flex:none;width:2rem;height:2rem;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;
  font-size:.72rem;font-weight:800;background:color-mix(in srgb,var(--emc,var(--vv-1,#5fd4a4)) 22%,var(--f-carte));color:color-mix(in srgb,var(--emc,var(--vv-1,#5fd4a4)) 40%,var(--tx))}
.em-av.c2{--emc:var(--vv-2,#7cb4f5)} .em-av.c3{--emc:var(--vv-3,#b49cf7)} .em-av.c4{--emc:var(--vv-4,#f08fb8)}
.em-qui{display:flex;align-items:center;gap:.55rem;min-width:0}
.em-qui b{display:block;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.em-qui span.s{display:block;font-size:.72rem;color:var(--tx2);white-space:nowrap}
.em-t td{padding:.5rem .6rem}
.em-t td.or{color:var(--tx-or,var(--tx));font-weight:800}
.em-t th{color:var(--tx-or,var(--tx2))}
.pill.src{background:color-mix(in srgb,var(--vv-2,#7cb4f5) 18%,var(--f-carte));color:color-mix(in srgb,var(--vv-2,#7cb4f5) 40%,var(--tx))}
.pill.ok{position:relative;padding-left:1.1rem}
.pill.ok::before{content:"";position:absolute;left:.45rem;top:50%;width:.4rem;height:.4rem;margin-top:-.2rem;border-radius:50%;background:currentColor;animation:em-pouls 1.6s ease-in-out infinite}
@keyframes em-pouls{50%{opacity:.25}}
@media (prefers-reduced-motion:reduce){.pill.ok::before{animation:none}}
/* La semaine : une rangée par personne, aujourd'hui en relief, les quarts aux couleurs de la personne. */
.em-sem{grid-template-columns:12.5rem repeat(7,minmax(0,1fr)) 7rem;gap:5px}
.em-sem .h{text-align:center;padding:.3rem .2rem;border-radius:8px}
.em-sem .h.auj{background:color-mix(in srgb,var(--or) 18%,transparent);color:var(--tx)}
.em-sem .c{border-radius:10px;min-height:3.4rem;padding:.35rem}
.em-sem .c.auj{border-color:color-mix(in srgb,var(--or) 45%,var(--v07));background:color-mix(in srgb,var(--or) 6%,var(--f-carte))}
.em-sem .c.nm{flex-direction:row;align-items:center;justify-content:flex-start;gap:.55rem}
.em-sem .c.tot{align-items:stretch;justify-content:center;gap:.3rem}
.em-sem .c.tot b{text-align:right;font-variant-numeric:tabular-nums}
.em-barre{height:5px;border-radius:99px;background:var(--v08);overflow:hidden}
.em-barre i{display:block;height:100%;border-radius:99px;background:var(--emc,var(--vv-1,#5fd4a4))}
.em-barre.trop i{background:var(--ep-ambre-t)}
.em-q{--emc:var(--vv-1,#5fd4a4);background:color-mix(in srgb,var(--emc,var(--vv-1,#5fd4a4)) 20%,var(--f-carte));color:var(--tx);border-left:3px solid var(--emc,var(--vv-1,#5fd4a4));
  border-radius:6px;padding:.15rem .35rem;font-size:.74rem;font-weight:600;justify-content:space-between}
.em-q button{color:var(--tx)}   /* le ✕ sur la pastille teintée : --tx2 y tombait à 4,1:1 (contrastes, 2026-11-23) */
.em-q.c2,.em-barre.c2 i{--emc:var(--vv-2,#7cb4f5)} .em-q.c3,.em-barre.c3 i{--emc:var(--vv-3,#b49cf7)} .em-q.c4,.em-barre.c4 i{--emc:var(--vv-4,#f08fb8)}
.em-sem .plus{align-self:stretch;margin-top:auto;border-radius:6px;color:var(--tx2)}
.em-sem .c:hover .plus{color:var(--tx);border-color:var(--v20,var(--v16))}
.em-sem .pied-j{text-align:center;font-size:.72rem;color:var(--tx2);font-variant-numeric:tabular-nums;padding:.25rem 0}
.em-sem .pied-j.t{text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:.05em;font-size:.66rem}
/* Les formulaires (quart, pointage) et les réglages : une carte, des champs de même hauteur, une rangée de gestes. */
.em-form{display:flex;flex-direction:column;gap:.75rem}
.em-form .tt{display:flex;flex-direction:column;gap:.1rem}
.em-form .tt b{font-size:.95rem;font-weight:800}
.em-form .tt span{font-size:.76rem;color:var(--tx2);line-height:1.45}
.em-champs{display:grid;grid-template-columns:repeat(auto-fit,minmax(10.5rem,1fr));gap:.65rem .8rem;align-items:end}
.em-ch{display:flex;flex-direction:column;gap:.3rem;font-size:.72rem;font-weight:600;color:var(--tx2);min-width:0}
.em-ch.large{grid-column:span 2}
.em-champs.cinq{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) minmax(0,.8fr) minmax(0,.8fr) minmax(0,1.6fr)}
.em-ch select,.em-ch input{height:2.3rem;width:100%;border-radius:9px}
.em-in{position:relative;display:flex;align-items:center}
.em-in input{padding-right:3.6rem;text-align:right}
.em-in i{position:absolute;right:.65rem;font-style:normal;font-size:.74rem;color:var(--tx2);pointer-events:none}
.em-gestes{display:flex;align-items:center;gap:.5rem;padding-top:.65rem;border-top:1px solid var(--v06)}
.em-gestes .em-note{margin-right:auto;line-height:1.45}
.em-gestes button{height:2.3rem;padding:0 1rem;border-radius:9px}
`;

function pageEmployes(ouverture) {
  const ok = ['equipe', 'horaires', 'pointages', 'paie'];
  const depart = ok.indexOf(String(ouverture || '')) >= 0 ? String(ouverture) : 'equipe';
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
  var ONGLET = '${depart}';
  var SEMAINE = '', PERIODE = '';
  var FQ = null, FP = null;   // le quart / le pointage en cours de saisie

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
    commission:         '${T("La commission doit être entre 0 et 50 %.")}',
    date:               '${T("La date est invalide.")}',
    heures:             '${T("La fin du quart doit suivre son début.")}',
    entree:             '${T("L’heure d’entrée est invalide.")}',
    sortie:             '${T("La sortie doit suivre l’entrée.")}',
    trop_long:          '${T("Un pointage ne peut pas dépasser 16 heures.")}',
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
  function deux(n){ return (n < 10 ? '0' : '') + n; }
  function jourDe(iso){ var p = String(iso).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function isoDe(d){ return d.getFullYear() + '-' + deux(d.getMonth() + 1) + '-' + deux(d.getDate()); }
  function plus(iso, n){ var d = jourDe(iso); d.setDate(d.getDate() + n); return isoDe(d); }
  function court(iso){ var d = jourDe(iso); return d.getDate() + ' ' + MOIS[d.getMonth()]; }
  function hm(isoT){ var d = new Date(isoT); return isNaN(d) ? '' : deux(d.getHours()) + ':' + deux(d.getMinutes()); }
  function jourLocal(isoT){ var d = new Date(isoT); return isNaN(d) ? '' : isoDe(d); }
  function hdec(a, b){ var x = String(a).split(':'), y = String(b).split(':'); return Math.max(0, ((+y[0]) * 60 + (+y[1]) - (+x[0]) * 60 - (+x[1])) / 60); }
  function h2(n){ return szNombre(n || 0, 2) + ' h'; }
  function nomDe(id){ var l = (D && D.personnel) || []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i].nom; return id; }

  function charger(){
    appeler('employes:donnees', [SEMAINE, PERIODE]).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; return; }
      D = r;
      if (!SEMAINE) SEMAINE = r.semaine[0];
      if (!PERIODE) PERIODE = r.periode.debut;
      var n = (r.personnel || []).length, ep = (r.enPoste || []).length;
      elSous.textContent = n + ' ' + (n > 1 ? '${T("membres du personnel")}' : '${T("membre du personnel")}') + (ep ? ' · ' + ep + ' ${T("en poste")}' : '');
      if (ONGLET === 'paie') chargerPaie(); else dessiner();
    });
  }
  function chargerPaie(){
    appeler('employes:paie', [D.periode.debut, D.periode.fin]).then(function(r){
      PAIE = (r && r.ok) ? r : { erreur: r };
      dessiner();
    });
  }

  function tete(){
    var og = function(v, l){ return '<button type="button" class="' + (ONGLET === v ? 'on' : '') + '" data-og="' + v + '">' + l + '</button>'; };
    var h = '<div class="em-tete"><div class="ed-seg">' + og('equipe', '${T("Équipe")}') + og('horaires', '${T("Horaires")}')
      + og('pointages', '${T("Pointages")}') + og('paie', '${T("Paie")}') + '</div><div class="droite">';
    if (ONGLET === 'horaires') {
      h += '<div class="em-nav"><button class="mini" data-sem="-7" aria-label="${T("Semaine précédente")}">‹</button><b>'
        + esc(court(D.semaine[0]) + ' – ' + court(D.semaine[6])) + '</b><button class="mini" data-sem="7" aria-label="${T("Semaine suivante")}">›</button>'
        + '<button class="mini" data-sem="0">${T("Cette semaine")}</button></div>'
        + '<button class="mini" id="em-copier" title="${T("Reprend les quarts de la semaine précédente (ceux déjà posés restent).")}">${T("Copier la semaine précédente")}</button>';
    } else if (ONGLET === 'pointages' || ONGLET === 'paie') {
      h += '<div class="em-nav"><button class="mini" data-per="-1" aria-label="${T("Période précédente")}">‹</button><b>'
        + esc('${T("Période du ")}' + court(D.periode.debut) + ' ${T("au")} ' + court(D.periode.fin)) + '</b><button class="mini" data-per="1" aria-label="${T("Période suivante")}">›</button></div>';
      if (ONGLET === 'paie') h += '<button class="prim" id="em-csv">${T("Exporter pour la paie (CSV)")}</button>';
    }
    return h + '</div></div>';
  }

  function vueEquipe(){
    var l = D.personnel || [];
    if (!l.length) return '<div class="carte vide">${T("Aucun compte du personnel. Ajoutez-les dans Configuration → Sécurité → Accès utilisateurs ; ils paraîtront ici.")}</div>';
    return '<div class="carte"><table class="em-t"><thead><tr><th>${T("Membre du personnel")}</th><th>${T("État")}</th><th class="n">${T("Taux horaire ($)")}</th>'
      + '<th class="n">${T("Commission (%)")}</th><th>${T("À la paie")}</th><th>${T("Embauche")}</th><th></th></tr></thead><tbody>'
      + l.map(function(s){
          var f = s.fiche || {}, ep = (D.enPoste || []).indexOf(s.id) >= 0;
          return '<tr data-fid="' + esc(s.id) + '"><td class="nom"><b>' + esc(s.nom) + '</b><span>' + esc(szTd(s.role || '')) + '</span></td>'
            + '<td>' + (ep ? '<span class="pill ok">${T("en poste")}</span>' : (s.actif ? '<span class="pill">${T("actif")}</span>' : '<span class="pill">${T("inactif")}</span>')) + '</td>'
            + '<td class="n"><input type="number" min="0" max="500" step="0.01" data-c="taux" value="' + esc(f.taux || 0) + '" aria-label="${T("Taux horaire ($)")}"></td>'
            + '<td class="n"><input type="number" min="0" max="50" step="0.1" data-c="commission" value="' + esc(f.commission || 0) + '" aria-label="${T("Commission (%)")}"></td>'
            + '<td><input type="checkbox" data-c="inclus"' + (f.inclus === false ? '' : ' checked') + ' aria-label="${T("À la paie")}"></td>'
            + '<td><input type="date" data-c="embauche" value="' + esc(f.embauche || '') + '" aria-label="${T("Embauche")}"></td>'
            + '<td><button class="mini" data-enrfiche="' + esc(s.id) + '">${T("Enregistrer")}</button></td></tr>';
        }).join('') + '</tbody></table>'
      + '<div class="em-note">${T("La commission se calcule sur les ventes au comptoir de la personne, avant taxes, rabais déduits.")}</div></div>';
  }

  /* Une couleur par personne (cycle des quatre teintes vivantes), et ses initiales. */
  function coul(id){ var l = (D && D.personnel) || []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return ' c' + ((i % 4) + 1); return ' c1'; }
  function init(nom){ var p = String(nom || '?').trim().split(' ').filter(Boolean);   /* pas de barre oblique : le gabarit la mange */ return ((p[0] || '?').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase(); }
  function qui(id, nom, sous){ return '<span class="em-qui"><span class="em-av' + coul(id) + '">' + esc(init(nom)) + '</span><span><b>' + esc(nom) + '</b>'
    + (sous ? '<span class="s">' + sous + '</span>' : '') + '</span></span>'; }
  function tuile(cl, k, v, s){ return '<div class="em-tu ' + cl + '"><span class="k">' + k + '</span><b>' + v + '</b><span>' + (s || '') + '</span></div>'; }
  function jourLong(iso){ var d = jourDe(iso); return JSEM[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]; }

  function vueHoraires(){
    var l = D.personnel || [];
    if (!l.length) return '<div class="carte vide">${T("Aucun compte du personnel.")}</div>';
    var parJour = D.semaine.map(function(){ return 0; }), totSem = 0, nbQ = 0;
    var h = '<div class="em-sem"><div class="h"></div>' + D.semaine.map(function(j, i){
      return '<div class="h' + (j === D.aujourdhui ? ' auj' : '') + '">' + JSEM[jourDe(j).getDay()] + ' ' + jourDe(j).getDate() + '</div>';
    }).join('') + '<div class="h" style="text-align:right">${T("Semaine")}</div>';
    l.forEach(function(s){
      var tot = 0, cells = '';
      D.semaine.forEach(function(j, k){
        var qs = (D.horaires || []).filter(function(q){ return q.staffId === s.id && q.date === j; })
          .sort(function(a, b){ return a.debut < b.debut ? -1 : 1; });
        cells += '<div class="c' + (j === D.aujourdhui ? ' auj' : '') + '">' + qs.map(function(q){ var hq = hdec(q.debut, q.fin); tot += hq; parJour[k] += hq; nbQ++;
          return '<span class="em-q' + coul(s.id) + '" title="' + esc((q.note ? q.note + ' · ' : '') + h2(hq)) + '">' + esc(q.debut + '–' + q.fin)
            + (D.peutModifier ? '<button data-qx="' + esc(q.id) + '" aria-label="${T("Retirer ce quart")}" title="${T("Retirer ce quart")}">✕</button>' : '') + '</span>'; }).join('')
          + (D.peutModifier ? '<button class="plus" data-qplus="' + esc(s.id) + '|' + j + '" aria-label="${T("Ajouter un quart")}" title="${T("Ajouter un quart")}">+</button>' : '') + '</div>';
      });
      totSem += tot;
      h += '<div class="c nm">' + qui(s.id, s.nom, esc(szTd(s.role || ''))) + '</div>' + cells
        + '<div class="c tot"><b>' + h2(tot) + '</b><span class="em-barre' + coul(s.id) + (tot > 40 ? ' trop' : '') + '" title="' + esc(h2(tot) + ' / 40 h') + '"><i style="width:' + Math.min(100, Math.round(tot / 40 * 100)) + '%"></i></span></div>';
    });
    h += '<div class="pied-j t">${T("Heures planifiées")}</div>' + parJour.map(function(x){ return '<div class="pied-j">' + (x ? h2(x) : '—') + '</div>'; }).join('')
      + '<div class="pied-j" style="text-align:right;font-weight:800">' + h2(totSem) + '</div></div>';
    var tete = szTuiles('<div class="em-tuiles">' + tuile('t1', '${T("Heures planifiées")}', h2(totSem), nbQ + ' ' + (nbQ > 1 ? '${T("quarts")}' : '${T("quart")}'))
      + tuile('t2', '${T("Personnel à l’horaire")}', String(l.filter(function(s){ return (D.horaires || []).some(function(q){ return q.staffId === s.id && D.semaine.indexOf(q.date) >= 0; }); }).length), '${T("sur")} ' + l.length)
      + tuile('t3', '${T("Aujourd’hui")}', h2(parJour[D.semaine.indexOf(D.aujourdhui)] || 0), D.semaine.indexOf(D.aujourdhui) >= 0 ? jourLong(D.aujourdhui) : '${T("hors de cette semaine")}')
      + tuile('t4', '${T("En poste maintenant")}', String((D.enPoste || []).length), (D.enPoste || []).map(nomDe).join(', ')) + '</div>');
    h = tete + h;
    if (FQ) {
      h += '<div class="carte em-form"><div class="tt"><b>' + esc('${T("Nouveau quart")}' + ' · ' + nomDe(FQ.staffId)) + '</b><span>' + esc(jourLong(FQ.date)) + '</span></div>'
        + '<div class="em-champs"><label class="em-ch">${T("Début")}<input type="time" id="fq-d" value="' + esc(FQ.debut) + '"></label>'
        + '<label class="em-ch">${T("Fin")}<input type="time" id="fq-f" value="' + esc(FQ.fin) + '"></label>'
        + '<label class="em-ch large">${T("Note")}<input id="fq-n" maxlength="120" value="" placeholder="${T("Ex. : ouverture, inventaire")}"></label></div>'
        + '<div class="em-gestes"><span class="em-note">${T("Le quart s’ajoute à ceux déjà posés ce jour-là.")}</span><button id="fq-x">${T("Annuler")}</button><button class="prim" id="fq-ok">${T("Ajouter le quart")}</button></div></div>';
    }
    return h;
  }

  function vuePointages(){
    var l = D.pointages || [];
    var hTot = 0, corr = 0; l.forEach(function(p){ if (p.sortie) hTot += +p.heures || 0; if (p.corrigePar) corr++; });
    var h = szTuiles('<div class="em-tuiles">' + tuile('t1', '${T("Heures pointées")}', h2(hTot), '${T("pointages fermés de la période")}')
      + tuile('t2', '${T("Pointages")}', String(l.length), '${T("dans la période")}')
      + tuile((D.enPoste || []).length ? 't3' : 't3', '${T("En poste maintenant")}', String((D.enPoste || []).length), (D.enPoste || []).map(nomDe).join(', '))
      + tuile(corr ? 'att' : 't4', '${T("Corrigés")}', String(corr), corr ? '${T("à garder en tête à la paie")}' : '${T("aucune correction")}') + '</div>');
    if (D.peutModifier) {
      var F = FP || { staffId: ((D.personnel || [])[0] || {}).id || '', date: D.aujourdhui, entree: '09:00', sortie: '17:00', note: '' };
      h += '<div class="carte em-form"><div class="tt"><b>' + (FP && FP.id ? '${T("Corriger le pointage")}' : '${T("Saisir un pointage")}') + '</b>'
        + '<span>${T("Une sortie plus tôt que l’entrée compte pour le lendemain (quart de nuit). Sans sortie, la personne reste « en poste ».")}</span></div>'
        + '<div class="em-champs cinq"><label class="em-ch">${T("Membre du personnel")}<select id="fp-s">' + (D.personnel || []).map(function(s){
            return '<option value="' + esc(s.id) + '"' + (s.id === F.staffId ? ' selected' : '') + '>' + esc(s.nom) + '</option>'; }).join('') + '</select></label>'
        + '<label class="em-ch">${T("Date")}<input type="date" id="fp-j" value="' + esc(F.date) + '"></label>'
        + '<label class="em-ch">${T("Entrée")}<input type="time" id="fp-e" value="' + esc(F.entree) + '"></label>'
        + '<label class="em-ch">${T("Sortie")}<input type="time" id="fp-o" value="' + esc(F.sortie) + '"></label>'
        + '<label class="em-ch">${T("Note")}<input id="fp-n" maxlength="200" value="' + esc(F.note || '') + '"></label></div>'
        + '<div class="em-gestes"><span class="em-note"></span>' + (FP && FP.id ? '<button id="fp-x">${T("Annuler")}</button>' : '')
        + '<button class="prim" id="fp-ok">' + (FP && FP.id ? '${T("Enregistrer la correction")}' : '${T("Ajouter le pointage")}') + '</button></div></div>';
    }
    if (!l.length) return h + '<div class="carte vide">${T("Aucun pointage dans cette période. Le bouton « Pointer » de la caisse les enregistre ; on peut aussi les saisir ici.")}</div>';
    h += '<div class="carte" data-pages="employes-pointages"><table class="em-t"><thead><tr><th>${T("Membre du personnel")}</th><th>${T("Date")}</th><th>${T("Entrée")}</th><th>${T("Sortie")}</th>'
      + '<th class="n">${T("Heures")}</th><th>${T("Source")}</th><th>${T("Note")}</th><th></th></tr></thead><tbody>'
      + l.map(function(p){
          return '<tr><td>' + qui(p.staffId, nomDe(p.staffId), '') + '</td><td>' + esc(jourLong(jourLocal(p.entree))) + '</td><td>' + esc(hm(p.entree)) + '</td>'
            + '<td>' + (p.sortie ? esc(hm(p.sortie)) : '<span class="pill ok">${T("en poste")}</span>') + '</td>'
            + '<td class="n"><b>' + (p.sortie ? h2(p.heures) : '—') + '</b></td>'
            + '<td>' + (p.source === 'caisse' ? '<span class="pill src">${T("caisse")}</span>' : '<span class="pill">${T("saisie")}</span>') + (p.corrigePar ? ' <span class="pill att" title="' + esc(p.corrigePar) + '">${T("corrigé")}</span>' : '') + '</td>'
            + '<td>' + esc(p.note || '') + '</td>'
            + '<td class="n">' + (D.peutModifier ? '<button class="mini" data-pmod="' + esc(p.id) + '">${T("Corriger")}</button> <button class="mini dang" data-psup="' + esc(p.id) + '">${T("Supprimer")}</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    return h;
  }

  function vuePaie(){
    if (!PAIE) return '<div class="carte vide">${T("Calcul de la paie…")}</div>';
    if (PAIE.erreur) return '<div class="carte vide">' + esc(expliquer(PAIE.erreur)) + '</div>';
    var t = PAIE.totaux || {}, R = PAIE.reglages || {};
    var l = PAIE.lignes || [];
    var h = szTuiles('<div class="em-tuiles">' + tuile('t2', '${T("Heures régulières")}', h2(t.heures), l.length + ' ' + (l.length > 1 ? '${T("personnes à la paie")}' : '${T("personne à la paie")}'))
      + tuile((t.heuresSup || 0) > 0 ? 'att' : 't3', '${T("Heures supplémentaires")}', h2(t.heuresSup), (t.heuresSup || 0) > 0 ? '${T("payées à")} ' + szNombre((R.tauxHS || 1.5) * 100, 0) + ' %' : '${T("aucune cette période")}')
      + tuile('t4', '${T("Commissions")}', szArgent(t.commissions || 0), '${T("ventes au comptoir")}')
      + tuile('t1', '${T("Brut avant retenues")}', szArgent(t.brut || 0), esc(court(D.periode.debut) + ' – ' + court(D.periode.fin))) + '</div>');
    if (!l.length) h += '<div class="carte vide">${T("Rien à payer dans cette période : aucun pointage fermé et aucune vente au comptoir attribuée.")}</div>';
    else h += '<div class="carte"><table class="em-t"><thead><tr><th>${T("Membre du personnel")}</th><th class="n">${T("Heures")}</th>'
      + '<th class="n">${T("Supp.")}</th><th class="n">${T("Salaire")}</th><th class="n">${T("Ventes comptoir")}</th><th class="n">${T("Commissions")}</th><th class="n">${T("Brut")}</th></tr></thead><tbody>'
      + l.map(function(x){
          return '<tr><td>' + qui(x.staffId || x.nom, x.nom, szArgent(x.taux) + ' ${T("/ h")}' + (x.ouverts ? ' · <span class="pill att" title="${T("Un pointage est encore ouvert : il n’entre pas dans la paie tant qu’il n’est pas fermé.")}">${T("pointage ouvert")}</span>' : '')) + '</td>'
            + '<td class="n">' + h2(x.heures) + '</td><td class="n">' + ((x.heuresSup || 0) > 0 ? '<span class="pill att">' + h2(x.heuresSup) + '</span>' : '—') + '</td>'
            + '<td class="n">' + szArgent(x.salaire) + '</td><td class="n">' + szArgent(x.ventes) + ' <span class="em-note">(' + x.nbVentes + ')</span></td>'
            + '<td class="n">' + szArgent(x.commissions) + ' <span class="em-note">' + szNombre(x.pct, 1) + ' %</span></td><td class="n or">' + szArgent(x.brut) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    h += '<div class="carte em-form"><div class="tt"><b>${T("Réglages de la paie")}</b>'
      + '<span>${T("Ils s’appliquent au calcul de toutes les périodes affichées.")}</span></div>'
      + '<div class="em-champs"><label class="em-ch">${T("Période")}<select id="rg-p"><option value="14"' + (R.periodeJours === 14 ? ' selected' : '') + '>${T("Aux deux semaines")}</option>'
      + '<option value="7"' + (R.periodeJours === 7 ? ' selected' : '') + '>${T("Chaque semaine")}</option></select></label>'
      + '<label class="em-ch">${T("Première période commence le")}<input type="date" id="rg-d" value="' + esc(R.debutRef || '') + '"></label>'
      + '<label class="em-ch">${T("Heures supplémentaires après")}<span class="em-in"><input type="number" id="rg-s" min="30" max="60" step="1" value="' + esc(R.seuilHS) + '"><i>${T("h / sem.")}</i></span></label>'
      + '<label class="em-ch">${T("Payées à")}<span class="em-in"><input type="number" id="rg-t" min="100" max="300" step="5" value="' + esc(Math.round((+R.tauxHS || 1.5) * 100)) + '"><i>${T("% du taux")}</i></span></label></div>'
      + '<div class="em-gestes"><span class="em-note">${T("Montants BRUTS, avant retenues (RRQ, AE, RQAP, impôts) : l’export sert à les saisir dans votre logiciel de paie. Normes du travail du Québec : heures supplémentaires au-delà de 40 heures par semaine, payées à 150 %.")}</span>'
      + '<button class="prim" id="rg-ok"' + (D.peutModifier ? '' : ' disabled') + '>${T("Enregistrer")}</button></div></div>';
    return h;
  }

  function dessiner(){
    if (!D) return;
    var h = tete();
    if (ONGLET === 'horaires') h += vueHoraires();
    else if (ONGLET === 'pointages') h += vuePointages();
    else if (ONGLET === 'paie') h += vuePaie();
    else h += vueEquipe();
    corps.innerHTML = h;
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var b;
    if ((b = t.closest('[data-og]'))) { ONGLET = b.getAttribute('data-og'); FQ = null; FP = null; if (ONGLET === 'paie') { PAIE = null; dessiner(); chargerPaie(); } else dessiner(); return; }
    if ((b = t.closest('[data-sem]'))) { var n = +b.getAttribute('data-sem'); SEMAINE = n ? plus(D.semaine[0], n) : D.aujourdhui; FQ = null; charger(); return; }
    if ((b = t.closest('[data-per]'))) {
      appeler('employes:periode', [D.periode.debut, +b.getAttribute('data-per')]).then(function(r){ if (r && r.ok) { PERIODE = r.debut; PAIE = null; charger(); } });
      return;
    }
    if ((b = t.closest('[data-enrfiche]'))) {
      var id = b.getAttribute('data-enrfiche'), tr = b.closest('tr');
      var v = function(c){ var e = tr.querySelector('[data-c="' + c + '"]'); return e ? (e.type === 'checkbox' ? e.checked : e.value) : ''; };
      b.disabled = true;
      appeler('employes:fiche', [{ id: id, taux: v('taux'), commission: v('commission'), inclus: v('inclus'), embauche: v('embauche') }]).then(function(r){
        b.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('${T("Fiche enregistrée : ")}' + nomDe(id), 'bon'); charger();
      });
      return;
    }
    if ((b = t.closest('[data-qplus]'))) { var q = b.getAttribute('data-qplus').split('|'); FQ = { staffId: q[0], date: q[1], debut: '09:00', fin: '17:00' }; dessiner(); return; }
    if (t.id === 'fq-x') { FQ = null; dessiner(); return; }
    if (t.id === 'fq-ok') {
      var s = { staffId: FQ.staffId, date: FQ.date, debut: document.getElementById('fq-d').value, fin: document.getElementById('fq-f').value, note: document.getElementById('fq-n').value };
      t.disabled = true;
      appeler('employes:quart', [s]).then(function(r){
        t.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        FQ = null; dire('${T("Quart ajouté.")}', 'bon'); charger();
      });
      return;
    }
    if ((b = t.closest('[data-qx]'))) {
      appeler('employes:quartSupprimer', [b.getAttribute('data-qx')]).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } dire('${T("Quart retiré.")}', 'bon'); charger(); });
      return;
    }
    if (t.id === 'em-copier') {
      appeler('employes:copierSemaine', [D.semaine[0]]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.copies ? (r.copies + ' ' + (r.copies > 1 ? '${T("quarts copiés.")}' : '${T("quart copié.")}')) : '${T("Rien à copier : la semaine précédente est vide, ou déjà reprise.")}', 'bon'); charger();
      });
      return;
    }
    if ((b = t.closest('[data-pmod]'))) {
      var pid = b.getAttribute('data-pmod'), p = (D.pointages || []).filter(function(x){ return x.id === pid; })[0];
      if (p) { FP = { id: p.id, staffId: p.staffId, date: jourLocal(p.entree), entree: hm(p.entree), sortie: p.sortie ? hm(p.sortie) : '', note: p.note || '' }; dessiner(); }
      return;
    }
    if (t.id === 'fp-x') { FP = null; dessiner(); return; }
    if (t.id === 'fp-ok') {
      var j = document.getElementById('fp-j').value, e = document.getElementById('fp-e').value, o = document.getElementById('fp-o').value;
      if (!j || !e) { dire('${T("Indiquez la date et l’heure d’entrée.")}', 'att'); return; }
      var sortie = o ? (o > e ? j : plus(j, 1)) + 'T' + o : '';   // une sortie avant l'entrée = le lendemain (quart de nuit)
      var sp = { id: FP && FP.id ? FP.id : '', staffId: document.getElementById('fp-s').value, entree: j + 'T' + e, sortie: sortie, note: document.getElementById('fp-n').value };
      t.disabled = true;
      appeler('employes:pointage', [sp]).then(function(r){
        t.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        FP = null; dire('${T("Pointage enregistré.")}', 'bon'); charger();
      });
      return;
    }
    if ((b = t.closest('[data-psup]'))) {
      var idp = b.getAttribute('data-psup');
      szConfirmer({ danger: true, titre: '${T("Supprimer ce pointage")}', texte: '${T("Ses heures sortiront du calcul de la paie.")}', oui: '${T("Supprimer")}' }).then(function(okc){
        if (!okc) return;
        appeler('employes:pointageSupprimer', [idp]).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } dire('${T("Pointage supprimé.")}', 'bon'); charger(); });
      });
      return;
    }
    if (t.id === 'rg-ok') {
      var rg = { periodeJours: +document.getElementById('rg-p').value, debutRef: document.getElementById('rg-d').value,
        seuilHS: +document.getElementById('rg-s').value, tauxHS: Math.round(+document.getElementById('rg-t').value) / 100 };   // saisi en % (150), gardé en facteur (1,5)
      appeler('employes:reglages', [rg]).then(function(r){ if (!r.ok) { dire(expliquer(r), 'err'); return; } dire('${T("Réglages de la paie enregistrés.")}', 'bon'); PERIODE = ''; PAIE = null; charger(); });
      return;
    }
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

  window.szActualiser = function(){ if (!FQ && !FP) charger(); };
  window.szRevenir = function(){ if (!FQ && !FP) charger(); };
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
