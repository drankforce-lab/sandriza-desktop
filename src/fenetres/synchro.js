'use strict';

/*
 * FENÊTRE « PUBLICATION » — LE MODULE DE SYNCHRONISATION (2026-11-25)
 * =============================================================================
 * SA DEMANDE, mot pour mot : « un vrai module pour la synchronisation, bien complet, pas juste cela, et surtout pas
 * fusionné avec Base de données » ; « le bouton doit être en évidence, et non caché dans un menu » ; « il doit être
 * très épuré, et vraiment à la fine pointe ».
 *
 * CE QU'IL FAIT. Depuis le lot 6, l'application de production prépare la boutique (catalogue, réglages) dans la base
 * de TEST. Ce module est le seul passage vers la boutique EN LIGNE :
 *   · À PUBLIER : tout ce qui diffère, champ par champ (analyse à trois voies du serveur, lib-boutique-test.php),
 *     filtres, recherche, détail avant / après, photos côte à côte, conflits à trancher, sélection, publication suivie
 *     élément par élément ; « Abandonner » remet un changement préparé à la version en ligne.
 *   · HISTORIQUE : les publications (un geste = un lot), qui, quand, quoi ; chaque envoi s'annule, ou toute la
 *     publication d'un coup (la production retrouve sa version d'avant ; le stock du moment est gardé).
 * Ouvert par le bouton « Publier » de la barre (appbar.js), toujours visible pour un super-administrateur.
 *
 * ⚠ Tout passe par le pont : config:bt:sync (analyser, appliquer, debut, fin, historique, annuler).
 * ⚠ AUCUN CARACTÈRE ACCENT GRAVE dans la portion de script, COMMENTAIRES COMPRIS : elle vit dans un littéral de gabarit.
 * ⚠ Les textes du script passent par le traducteur, entre guillemets DOUBLES (c'est ce que lit verifier-appels-fenetres) ;
 *   ni le français ni l'anglais n'y portent d'apostrophe droite ni de guillemet droit (src/langue/synchro.js).
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, TETE } = require('./socle.js');
const T = require('../langue').tr('synchro');
/* (2026-11-25) Sa remarque : « c'est pas beau ça, je ne veux pas voir de code » (le détail montrait le JSON de
   l'entretien). Les valeurs se LISENT désormais : consignes en mots, listes en pastilles, objets en lignes
   « libellé — valeur », et seulement ce qui diffère. Les consignes : la même liste que le site (shop.js, SZ_ENTRETIEN). */
const ENTRETIEN = {
  lav_froid: ['Laver à la machine à l’eau froide', 'Machine wash cold'], lav_30: ['Laver à la machine à 30 °C au plus', 'Machine wash at 30 °C max'],
  lav_delicat: ['Cycle délicat', 'Gentle cycle'], lav_main: ['Laver à la main à l’eau froide', 'Hand wash cold'],
  lav_couleurs: ['Laver avec des couleurs semblables', 'Wash with similar colours'], lav_envers: ['Laver à l’envers', 'Wash inside out'],
  lav_sac: ['Laver dans un sac à lessive en filet', 'Wash in a mesh laundry bag'], lav_separe: ['Laver séparément les premières fois', 'Wash separately the first few times'],
  pas_lavage: ['Ne pas laver', 'Do not wash'], pas_javel: ['Ne pas utiliser de javellisant', 'Do not bleach'],
  javel_sans_cl: ['Javellisant sans chlore seulement', 'Non-chlorine bleach only'], sech_bas: ['Sécher par culbutage à basse température', 'Tumble dry low'],
  pas_sech: ['Ne pas sécher par culbutage', 'Do not tumble dry'], sech_plat: ['Sécher à plat', 'Dry flat'], sech_suspendu: ['Suspendre pour sécher', 'Line dry'],
  sech_ombre: ['Sécher à l’ombre', 'Dry in the shade'], pas_tordre: ['Ne pas tordre', 'Do not wring'],
  rep_bas: ['Repasser à basse température au besoin', 'Low iron if needed'], rep_moyen: ['Repasser à température moyenne', 'Iron on medium heat'],
  rep_envers: ['Repasser à l’envers', 'Iron inside out'], pas_rep_deco: ['Ne pas repasser les imprimés ni les ornements', 'Do not iron prints or embellishments'],
  vapeur: ['Défroisser à la vapeur', 'Steam to remove wrinkles'], pas_rep: ['Ne pas repasser', 'Do not iron'],
  sec_ok: ['Nettoyage à sec permis', 'Dry clean'], sec_seul: ['Nettoyage à sec seulement', 'Dry clean only'], pas_sec: ['Ne pas nettoyer à sec', 'Do not dry clean'],
  pas_assoupl: ['Ne pas utiliser d’assouplissant', 'Do not use fabric softener'], detacher: ['Détacher localement au besoin', 'Spot clean as needed'],
  ranger_plie: ['Ranger plié pour garder la forme', 'Store folded to keep its shape'],
};
const entretienLib = () => { const en = require('../langue').langueCourante() === 'en'; const o = {}; Object.keys(ENTRETIEN).forEach((k) => { o[k] = ENTRETIEN[k][en ? 1 : 0]; }); return o; };
const H = (s) => String(T(s)).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden;-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit}
.h{flex:0 0 auto;display:flex;align-items:center;gap:1.2rem;padding:1.05rem 1.5rem .95rem}
.h .ti{min-width:0}
.h h1{margin:0;font-size:1.18rem;font-weight:650;letter-spacing:-.01em}
.h .sous{margin:.1rem 0 0;font-size:.78rem;color:var(--tx3)}
.seg{margin-left:auto;display:inline-flex;padding:3px;border-radius:10px;background:var(--v04);border:1px solid var(--v07)}
.seg button{border:0;background:transparent;padding:.38rem .9rem;border-radius:7px;cursor:pointer;font-size:.8rem;color:var(--tx2);display:inline-flex;align-items:center;gap:.45rem}
.seg button.on{background:var(--f-carte);color:var(--tx);box-shadow:0 1px 2px rgba(0,0,0,.25)}
.seg .nb{min-width:1.25rem;padding:0 .35rem;border-radius:99px;background:var(--or);color:#1a1208;font-size:.68rem;font-weight:700;line-height:1.25rem;text-align:center}
.seg .nb:empty{display:none}
.ico{width:34px;height:34px;display:inline-grid;place-items:center;border-radius:9px;border:1px solid var(--v08);background:transparent;cursor:pointer;color:var(--tx2)}
.ico:hover{background:var(--v05);color:var(--tx)}
.ico.tourne svg{animation:tour 1s linear infinite}
@keyframes tour{to{transform:rotate(360deg)}}
.vue{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.vue[hidden]{display:none}
/* Barre d'outils : recherche + filtres */
.outils{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:0 1.5rem .85rem;flex-wrap:wrap}
.rech{position:relative;flex:0 1 17rem}
.rech input{width:100%;font:inherit;font-size:.8rem;color:var(--tx);background:var(--v04);border:1px solid var(--v07);border-radius:9px;padding:.45rem .7rem .45rem 2rem;outline:none}
.rech input:focus{border-color:var(--or);background:var(--v05)}
.rech svg{position:absolute;left:.65rem;top:50%;transform:translateY(-50%);color:var(--tx3)}
.puce{border:1px solid var(--v08);background:transparent;border-radius:99px;padding:.3rem .75rem;font-size:.76rem;color:var(--tx2);cursor:pointer;display:inline-flex;gap:.4rem;align-items:center}
.puce:hover{background:var(--v04)}
.puce.on{background:var(--tx);color:var(--f-page);border-color:var(--tx)}
.puce b{font-weight:600;opacity:.7}
.puce .pt{width:6px;height:6px;border-radius:50%;background:var(--tx-err)}
.tout{margin-left:auto;font-size:.76rem;color:var(--tx2);display:inline-flex;align-items:center;gap:.45rem;cursor:pointer;user-select:none}
/* Liste + détail */
.split{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(19rem,25rem) minmax(0,1fr);border-top:1px solid var(--v06)}
.liste{overflow-y:auto;border-right:1px solid var(--v06);padding:.35rem 0}
.liste::-webkit-scrollbar,.detail::-webkit-scrollbar,.hist::-webkit-scrollbar{width:8px}
.liste::-webkit-scrollbar-thumb,.detail::-webkit-scrollbar-thumb,.hist::-webkit-scrollbar-thumb{background:var(--v10);border-radius:8px}
.ligne{display:grid;grid-template-columns:auto 42px minmax(0,1fr) auto;gap:.75rem;align-items:center;padding:.55rem 1rem .55rem 1.5rem;cursor:pointer;position:relative}
.ligne:hover{background:var(--v03)}
.ligne.sel{background:var(--v05)}
.ligne.sel::before{content:'';position:absolute;left:0;top:.45rem;bottom:.45rem;width:3px;border-radius:0 3px 3px 0;background:var(--or)}
.vig{width:42px;height:42px;border-radius:9px;background:var(--v05) center/cover no-repeat;display:grid;place-items:center;color:var(--tx3);border:1px solid var(--v06)}
.ligne .tx{min-width:0}
.ligne .t{font-size:.84rem;font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ligne .s{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.et{font-size:.66rem;font-weight:650;letter-spacing:.02em;padding:.14rem .5rem;border-radius:99px;white-space:nowrap}
.et.nouveau{background:rgba(74,222,128,.12);color:var(--tx-ok)}
.et.modifie{background:rgba(147,197,253,.12);color:var(--tx-bleu)}
.et.supprime{background:rgba(248,113,113,.12);color:var(--tx-err)}
.et.conflit{background:rgba(251,191,36,.14);color:var(--tx-att)}
.et.enligne{background:var(--v06);color:var(--tx2)}
.case{width:17px;height:17px;border-radius:5px;border:1.5px solid var(--v22);display:grid;place-items:center;background:transparent;cursor:pointer;padding:0}
.case.on{background:var(--or);border-color:var(--or);color:#1a1208}
.case svg{display:none}.case.on svg{display:block}
.case.mi{background:var(--or);border-color:var(--or)}
.case.mi{color:#1a1208}
.case.mi::after{content:'';width:8px;height:2px;background:currentColor;border-radius:2px}
/* Détail */
.detail{overflow-y:auto;padding:1.4rem 1.8rem 2rem}
.dt{display:flex;gap:1rem;align-items:center;margin-bottom:1.3rem}
.dt .vig{width:64px;height:64px;border-radius:12px}
.dt h2{margin:0;font-size:1.05rem;font-weight:650;letter-spacing:-.01em;color:var(--tx)}
.dt .k{font-size:.74rem;color:var(--tx3);margin-top:.15rem;display:flex;gap:.5rem;align-items:center}
.champ{padding:.9rem 0;border-top:1px solid var(--v06)}
.champ .n{font-size:.72rem;font-weight:650;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem;display:flex;gap:.5rem;align-items:center}
.duo{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1rem}
.duo .c{font-size:.83rem;line-height:1.55;word-break:break-word;white-space:pre-wrap;min-width:0}
.duo .c small{display:block;font-size:.66rem;color:var(--tx3);margin-bottom:.25rem;text-transform:uppercase;letter-spacing:.06em;white-space:normal}
.duo .av{color:var(--tx2)}
.duo .ap{color:var(--tx)}
.duo .vide{color:var(--tx3);font-style:italic}
.nul{color:var(--tx3);font-style:italic}
.pas{display:flex;flex-wrap:wrap;gap:.3rem;white-space:normal}
.pa{display:inline-flex;align-items:center;gap:.35rem;font-size:.76rem;line-height:1.3;padding:.22rem .6rem;border-radius:999px;background:var(--v05);border:1px solid var(--v08)}
.pa.plus,.ob.plus{border-color:var(--tx-ok);color:var(--tx)}
.pa.moins,.ob.moins{opacity:.45;text-decoration:line-through}
.kvs{display:grid;gap:.45rem;white-space:normal}
.kv{display:grid;gap:.1rem}
.kk{font-size:.68rem;color:var(--tx3);letter-spacing:.02em}
.obs{display:grid;gap:.3rem;white-space:normal}
.ob{font-size:.8rem;padding:.3rem .55rem;border-radius:8px;background:var(--v05);border:1px solid var(--v06)}
.ph.mini{width:40px;height:40px;display:inline-block;vertical-align:middle}
.pastille{display:inline-block;width:.8rem;height:.8rem;border-radius:50%;margin-right:.35rem;vertical-align:-1px;border:1px solid var(--v08)}
.photos{display:flex;flex-wrap:wrap;gap:.45rem}
.ph{width:68px;height:68px;border-radius:9px;background:var(--v05) center/cover no-repeat;border:1px solid var(--v08);position:relative}
.ph.plus{box-shadow:0 0 0 2px var(--tx-ok)}
.ph.moins{opacity:.35;filter:grayscale(1)}
.avert{margin:0 0 1rem;padding:.65rem .85rem;border-radius:10px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.22);color:var(--tx-att);font-size:.78rem}
.choix{margin:1.2rem 0 0;padding:1rem;border-radius:12px;background:var(--v03);border:1px solid var(--v07)}
.choix .q{font-size:.8rem;font-weight:600;margin-bottom:.6rem}
.opts{display:grid;gap:.4rem}
.opt{display:flex;gap:.65rem;align-items:flex-start;text-align:left;border:1px solid var(--v08);background:transparent;border-radius:10px;padding:.6rem .75rem;cursor:pointer;font-size:.8rem;color:var(--tx2)}
.opt:hover{background:var(--v03)}
.opt.on{border-color:var(--or);color:var(--tx);background:rgba(var(--or-rgb),.08)}
.opt .r{flex:0 0 auto;width:15px;height:15px;border-radius:50%;border:1.5px solid var(--v30);margin-top:.15rem}
.opt.on .r{border:4.5px solid var(--or)}
.opt b{display:block;color:var(--tx);font-weight:600;font-size:.8rem}
.lien{border:0;background:transparent;color:var(--tx3);font-size:.76rem;cursor:pointer;padding:.3rem 0;text-decoration:underline;text-underline-offset:3px}
.lien:hover{color:var(--tx-err2)}
.actions-d{margin-top:1.4rem;display:flex;gap:1rem;align-items:center}
/* Pied : la publication */
.pied{flex:0 0 auto;display:flex;align-items:center;gap:1rem;padding:.8rem 1.5rem;border-top:1px solid var(--v06);background:var(--f-pied)}
.pied .r{font-size:.8rem;color:var(--tx2);flex:1 1 auto;min-width:0}
.pied .r b{color:var(--tx)}
.msg{font-size:.76rem;color:var(--tx3)}
#msg{position:fixed;left:50%;bottom:4.7rem;transform:translateX(-50%);z-index:30;max-width:min(36rem,90vw);padding:.55rem .95rem;border-radius:10px;
  background:var(--f-carte);border:1px solid var(--v10);box-shadow:0 10px 30px rgba(0,0,0,.35);font-size:.8rem;color:var(--tx)}
#msg:empty{display:none}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
.btn{border:1px solid var(--v12);background:var(--v04);border-radius:10px;padding:.55rem 1rem;font-size:.82rem;cursor:pointer}
.btn:hover:not(:disabled){background:var(--v08)}
.btn.pri{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:650;padding:.62rem 1.3rem;display:inline-flex;gap:.5rem;align-items:center}
.btn.pri:hover:not(:disabled){background:var(--or-clair)}
.btn:disabled{opacity:.4;cursor:default}
.btn.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.35);background:transparent}
/* États */
.etat{flex:1 1 auto;display:grid;place-items:center;text-align:center;padding:2rem}
.etat .in{max-width:26rem}
.etat .rond{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;margin:0 auto 1.1rem;background:var(--v05);color:var(--tx2)}
.etat .rond.ok{background:rgba(74,222,128,.1);color:var(--tx-ok)}
.etat .rond.err{background:var(--v05);color:var(--tx-err)}
html.jour .etat .rond.err{color:#8f2f2f}
html.jour .etat .rond.ok{color:#226b3c}
/* Les étiquettes en mode jour : la teinte gardée, assombrie juste assez sur leur fond pâle. */
html.jour .et.nouveau{color:#226b3c}html.jour .et.modifie{color:#2a5794}html.jour .et.supprime{color:#8f2f2f}html.jour .et.conflit{color:#6e4f0c}html.jour .avert{color:#6e4f0c}
.etat h3{margin:0 0 .35rem;font-size:1rem;font-weight:650}
.etat p{margin:0 0 1rem;font-size:.82rem;color:var(--tx2);line-height:1.6}
.squel{padding:.6rem 1.5rem}
.squel i{display:block;height:44px;border-radius:10px;margin:.5rem 0;background:linear-gradient(90deg,var(--v04),var(--v07),var(--v04));background-size:200% 100%;animation:luit 1.4s ease-in-out infinite}
@keyframes luit{to{background-position:-200% 0}}
/* Publication en cours */
.voile{position:fixed;inset:0;background:rgba(5,9,16,.62);backdrop-filter:blur(3px);display:grid;place-items:center;z-index:20}
.voile[hidden]{display:none}
.feuille{width:min(34rem,92vw);max-height:84vh;display:flex;flex-direction:column;background:var(--f-carte);border:1px solid var(--v10);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.45);overflow:hidden}
.feuille .fh{padding:1.3rem 1.4rem .9rem}
.feuille h3{margin:0 0 .25rem;font-size:1.02rem;font-weight:650}
.feuille p{margin:0;font-size:.8rem;color:var(--tx2);line-height:1.6}
.prog{height:6px;border-radius:99px;background:var(--v06);overflow:hidden;margin:1rem 0 0}
.prog i{display:block;height:100%;width:0;background:var(--or);border-radius:99px;transition:width .35s ease}
.suivi{overflow-y:auto;padding:.2rem 1.4rem 1rem;border-top:1px solid var(--v06)}
.suivi div{display:flex;gap:.6rem;align-items:center;font-size:.78rem;padding:.35rem 0;color:var(--tx2)}
.suivi .st{width:16px;flex:0 0 auto;display:grid;place-items:center}
.suivi .ok .st{color:var(--tx-ok)}.suivi .ko .st{color:var(--tx-err)}.suivi .ko{color:var(--tx-err2)}
.suivi .en .st i{width:10px;height:10px;border-radius:50%;border:2px solid var(--v22);border-top-color:var(--or);animation:tour .8s linear infinite}
.feuille .ff{padding:.9rem 1.4rem;border-top:1px solid var(--v06);display:flex;gap:.6rem;justify-content:flex-end}
/* Historique */
.hist{flex:1 1 auto;overflow-y:auto;padding:.2rem 1.5rem 1.5rem;border-top:1px solid var(--v06)}
.lot{border:1px solid var(--v07);border-radius:14px;margin:.9rem 0 0;overflow:hidden;background:var(--v02)}
.lot .lt{display:flex;gap:1rem;align-items:center;padding:.85rem 1rem;cursor:pointer}
.lot .lt:hover{background:var(--v03)}
.lot .lt .q{font-size:.86rem;font-weight:600}
.lot .lt .w{font-size:.74rem;color:var(--tx3)}
.lot .lt .chev{margin-left:auto;color:var(--tx3);transition:transform .2s}
.lot.ouvert .chev{transform:rotate(90deg)}
.lot .li{display:none;border-top:1px solid var(--v06)}
.lot.ouvert .li{display:block}
.lot .el{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:.8rem;align-items:center;padding:.5rem 1rem;font-size:.8rem}
.lot .el + .el{border-top:1px solid var(--v04)}
.lot .el .x{color:var(--tx3);font-size:.72rem}
.lot .el.annule .t{text-decoration:line-through;color:var(--tx3)}
.lot .bas{display:flex;justify-content:flex-end;padding:.6rem 1rem;border-top:1px solid var(--v06)}
.mini{border:1px solid var(--v10);background:transparent;border-radius:8px;padding:.25rem .6rem;font-size:.72rem;cursor:pointer;color:var(--tx2)}
.mini:hover:not(:disabled){background:var(--v06);color:var(--tx)}
`;

function pageSynchro() {
  const ENT_LIB = entretienLib();
  return `${TETE()}
<title>${H('Publication — Administration Sandriza')}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<header class="h">
  <div class="ti"><h1>${H('Publication')}</h1><p class="sous" id="sous">${H('Boutique préparée → boutique en ligne')}</p></div>
  <div class="seg" role="tablist" aria-label="${H('Vues')}">
    <button type="button" class="on" data-vue="pub" role="tab" aria-selected="true">${H('À publier')}<span class="nb" id="nb"></span></button>
    <button type="button" data-vue="hist" role="tab" aria-selected="false">${H('Historique')}</button>
  </div>
  <button type="button" class="ico" id="rafr" title="${H('Relancer l’analyse')}" aria-label="${H('Relancer l’analyse')}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg></button>
</header>
<section class="vue" id="v-pub"></section>
<section class="vue" id="v-hist" hidden></section>
<div class="msg" id="msg" role="status" aria-live="polite"></div>
<div class="voile" id="voile" hidden><div class="feuille" role="dialog" aria-modal="true" id="feuille"></div></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var vPub = document.getElementById('v-pub'), vHist = document.getElementById('v-hist');
  var R = null, ERR = null, LECTURE = false, T0 = 0, MINUT = null;
  var SEL = {}, CHOIX = {}, ACTIF = null, FILTRE = 'tout', RECH = '', HI = null, OUVERTS = {};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args || [])); } catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; }).catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  var MOTIFS = {
    session: '${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit: '${T("La publication est réservée aux super-administrateurs.")}',
    jamais_copie: '${T("La boutique de test n’a jamais été copiée depuis la production : faites d’abord la copie (Configuration › Base de données).")}',
    jeton_test_absent: '${T("La boutique de test n’est pas branchée sur le serveur.")}',
    change_depuis_analyse: '${T("Changé depuis l’analyse : relancez-la.")}',
    modifie_depuis: '${T("Modifié en production depuis cette publication : l’annuler écraserait ce changement.")}',
    production_occupee: '${T("La production change en ce moment (ventes ?) : réessayez dans un instant.")}',
    deja_annule: '${T("Déjà annulé.")}',
    limite: '${T("Trop d’opérations d’affilée : patientez une minute.")}',
    delai: '${T("La fenêtre principale n’a pas répondu à temps.")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    indisponible: '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    echec: '${T("L’opération a échoué.")}'
  };
  function motif(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue")}' + (m ? ' (' + esc(m) + ')' : '') + '.'); }

  /* ── Les mots ── */
  var CHAMPS = { name: '${T("Nom")}', price: '${T("Prix")}', salePrice: '${T("Prix soldé")}', compareAtPrice: '${T("Prix barré")}', cost: '${T("Coût")}',
    description: '${T("Description")}', images: '${T("Photos")}', image: '${T("Photo principale")}', additionalImages: '${T("Autres photos")}', photoDos: '${T("Photo du dos")}',
    category: '${T("Catégorie")}', sizes: '${T("Tailles")}', colors: '${T("Couleurs")}', tags: '${T("Étiquettes")}', sku: '${T("UGS")}', active: '${T("Active")}',
    visible: '${T("Visible")}', featured: '${T("En vedette")}', brand: '${T("Marque")}', material: '${T("Matière")}', '(fiche)': '${T("Fiche entière")}', '(valeur)': '${T("Valeur")}',
    entretien: '${T("Entretien")}', genre: '${T("Genre")}', ageGroup: '${T("Groupe d’âge")}', style: '${T("Style")}', sizeGuideId: '${T("Guide des tailles")}',
    tag: '${T("Étiquette")}', supplierId: '${T("Fournisseur")}', ajustement: '${T("Ajustement")}', acquisitionCost: '${T("Coût d’acquisition")}', weight: '${T("Poids")}',
    lowStock: '${T("Seuil de stock bas")}', buyMaxClient: '${T("Achat maximal par client")}', regime: '${T("Régime fiscal")}', retours: '${T("Retours")}',
    accesAnticipe: '${T("Accès anticipé")}', publieLe: '${T("Publié le")}', anticipeExclu: '${T("Publication directe")}', precommande: '${T("Précommande")}',
    secondeMain: '${T("Seconde main")}', belowCost: '${T("Sous le coût")}', belowCostReason: '${T("Raison du prix sous le coût")}', photoFibre: '${T("Photo de la fibre")}',
    cabineVues: '${T("Vues de la cabine")}', cabineType: '${T("Type de haut (cabine)")}', mesuresVetement: '${T("Mesures du vêtement")}', colorVariants: '${T("Photos par couleur")}',
    stock: '${T("Stock")}', stockLoc: '${T("Emplacements")}', mannequin: '${T("Mannequin")}', video: '${T("Vidéo")}', vue360: '${T("Vue 360°")}', composition: '${T("Composition")}' };
  /* Les sous-clés des valeurs structurées ; une clé absente d'ici s'écrit en mots (« buyMax » donne « Buy max »). */
  var SOUS = { autre: '${T("Autre consigne")}', codes: '${T("Consignes")}', composition: '${T("Composition")}', actif: '${T("Active")}', date: '${T("Date")}',
    max: '${T("Plafond")}', etat: '${T("État")}', texte: '${T("Texte")}', titre: '${T("Titre")}', lien: '${T("Lien")}', couleur: '${T("Couleur")}',
    accent: '${T("Accent")}', fibre: '${T("Fibre")}', pct: '%', nom: '${T("Nom")}', name: '${T("Nom")}', prix: '${T("Prix")}', debut: '${T("Début")}', fin: '${T("Fin")}' };
  var ENT = ${JSON.stringify(ENT_LIB)};
  var CLES = { promo_bar_cfg: '${T("Barre promotionnelle")}', promos: '${T("Promotions")}', theme: '${T("Thème")}', apparence: '${T("Apparence")}', store_theme: '${T("Thème de la boutique")}',
    footer_cfg: '${T("Pied de page")}', nav_cfg: '${T("Navigation")}', hp_blocks_v2: '${T("Page d’accueil")}', homepage: '${T("Page d’accueil")}', custom_pages: '${T("Pages")}',
    collections: '${T("Collections")}', ship_cfg: '${T("Livraison")}', intl_ship: '${T("Livraison internationale")}', tax_rules: '${T("Taxes")}', seo: '${T("Référencement")}',
    email_tpl: '${T("Modèles de courriel")}', brand_name: '${T("Nom de la marque")}', banner: '${T("Bannière")}', annonce: '${T("Annonce")}', launch: '${T("Lancement")}' };
  var PHOTO = /^(image|images|additionalImages|photoDos|photos)$/;
  function nomCle(e){ return e.tbl === 'products' ? (e.titre || e.cle) : (CLES[e.cle] || e.cle); }
  function etiquette(e){
    if (e.sens === 'conflit') return ['conflit', '${T("Conflit")}'];
    if (e.sens === 'prod') return ['enligne', '${T("Changé en ligne")}'];
    if (e.type === 'ajout') return ['nouveau', '${T("Nouveau")}'];
    if (e.type === 'suppression') return ['supprime', '${T("Supprimé")}'];
    return ['modifie', '${T("Modifié")}'];
  }
  function cle(e){ return e.tbl + ':' + e.cle; }
  function aPublier(e){ return e.sens !== 'prod'; }
  function choixDe(e){ return CHOIX[cle(e)] != null ? CHOIX[cle(e)] : (e.sens === 'conflit' ? '' : 'test'); }

  /* ── L'analyse ── */
  function analyser(){
    LECTURE = true; ERR = null; T0 = Date.now(); dessiner();
    var b = document.getElementById('rafr'); b.classList.add('tourne');
    clearInterval(MINUT); MINUT = setInterval(function(){ var s = document.getElementById('chrono'); if (s) s.textContent = Math.round((Date.now() - T0) / 1000) + ' s'; }, 1000);
    appeler('config:bt:sync', ['analyser']).then(function(r){
      LECTURE = false; clearInterval(MINUT); b.classList.remove('tourne');
      if (!r || !r.ok) { ERR = motif(r); R = null; dessiner(); return; }
      if (!Array.isArray(r.elements)) r.elements = [];
      R = r;
      var garde = {}; SEL = {}; r.elements.forEach(function(e){ if (aPublier(e)) SEL[cle(e)] = e.sens !== 'conflit'; garde[cle(e)] = true; });
      Object.keys(CHOIX).forEach(function(k){ if (!garde[k]) delete CHOIX[k]; });
      if (!ACTIF || !garde[ACTIF]) ACTIF = visibles()[0] ? cle(visibles()[0]) : null;
      dessiner();
    });
  }
  function visibles(){
    if (!R) return [];
    var q = RECH.trim().toLowerCase();
    return R.elements.filter(function(e){
      if (FILTRE === 'produits' && (e.tbl !== 'products' || !aPublier(e))) return false;
      if (FILTRE === 'reglages' && (e.tbl !== 'config' || !aPublier(e))) return false;
      if (FILTRE === 'conflits' && e.sens !== 'conflit') return false;
      if (FILTRE === 'enligne' && e.sens !== 'prod') return false;
      if (FILTRE === 'tout' && !aPublier(e)) return false;
      if (q && (nomCle(e) + ' ' + e.cle).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function selection(){ return R ? R.elements.filter(function(e){ return aPublier(e) && SEL[cle(e)] && (e.sens !== 'conflit' || choixDe(e)); }) : []; }

  /* ── Le dessin ── */
  var SVG_OK = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var SVG_REG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>';
  function vig(e, cl){
    if (e.tbl === 'products' && e.vignette) return '<span class="' + (cl || 'vig') + '" style="background-image:url(&quot;' + esc(e.vignette) + '&quot;)"></span>';
    return '<span class="' + (cl || 'vig') + '">' + SVG_REG + '</span>';
  }
  function sousTitre(e){
    var n = (e.champs || []).map(function(c){ return CHAMPS[c.champ] || c.champ; });
    if (e.type === 'ajout') return '${T("Nouveau dans la boutique préparée")}';
    if (e.type === 'suppression') return '${T("Retiré de la boutique préparée")}';
    return n.slice(0, 4).join(' · ') + (n.length > 4 ? ' · +' + (n.length - 4) : '');
  }
  function dessiner(){ document.getElementById('nb').textContent = R ? String(R.elements.filter(aPublier).length || '') : ''; dessinerPub(); }
  function dessinerPub(){
    if (LECTURE && !R) {
      vPub.innerHTML = '<div class="outils"><span class="msg att">' + '${T("Analyse de la boutique préparée et de la boutique en ligne…")}' + ' <span id="chrono">0 s</span></span></div>'
        + '<div class="squel"><i></i><i></i><i></i><i></i><i></i></div>';
      return;
    }
    if (ERR) {
      vPub.innerHTML = '<div class="etat"><div class="in"><div class="rond err"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg></div>'
        + '<h3>' + '${T("L’analyse n’a pas abouti")}' + '</h3><p>' + ERR + '</p><button type="button" class="btn" id="reess">' + '${T("Réessayer")}' + '</button></div></div>';
      document.getElementById('reess').onclick = analyser;
      return;
    }
    if (!R) { vPub.innerHTML = ''; return; }
    var nPub = R.elements.filter(aPublier).length, nEnLigne = R.elements.length - nPub;
    if (!nPub && FILTRE !== 'enligne') {
      vPub.innerHTML = '<div class="etat"><div class="in"><div class="rond ok"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></div>'
        + '<h3>' + '${T("Tout est publié")}' + '</h3><p>' + '${T("La boutique en ligne est identique à la boutique préparée. Ce que vous modifierez dans la boutique apparaîtra ici.")}' + '</p>'
        + (nEnLigne ? '<button type="button" class="btn" id="voirEnLigne">' + nEnLigne + ' ' + '${T("changement(s) faits directement en ligne")}' + '</button>' : '') + '</div></div>';
      var v = document.getElementById('voirEnLigne'); if (v) v.onclick = function(){ FILTRE = 'enligne'; ACTIF = null; dessiner(); };
      return;
    }
    var n = { tout: nPub, produits: 0, reglages: 0, conflits: 0, enligne: nEnLigne };
    R.elements.forEach(function(e){ if (!aPublier(e)) return; if (e.tbl === 'products') n.produits++; else n.reglages++; if (e.sens === 'conflit') n.conflits++; });
    var puce = function(id, lib, pt){ return (id !== 'tout' && !n[id]) ? '' : '<button type="button" class="puce' + (FILTRE === id ? ' on' : '') + '" data-f="' + id + '">' + (pt ? '<span class="pt"></span>' : '') + lib + ' <b>' + n[id] + '</b></button>'; };
    var vis = visibles();
    if (!ACTIF || !vis.some(function(e){ return cle(e) === ACTIF; })) ACTIF = vis[0] ? cle(vis[0]) : null;
    var pubVis = vis.filter(aPublier), tousSel = pubVis.length && pubVis.every(function(e){ return SEL[cle(e)]; }), certains = pubVis.some(function(e){ return SEL[cle(e)]; });
    var h = '<div class="outils"><label class="rech"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
      + '<input id="rech" type="search" placeholder="' + esc('${T("Rechercher")}') + '" aria-label="' + esc('${T("Rechercher")}') + '" value="' + esc(RECH) + '"></label>'
      + puce('tout', '${T("Tout")}') + puce('produits', '${T("Produits")}') + puce('reglages', '${T("Réglages")}') + puce('conflits', '${T("Conflits")}', true) + puce('enligne', '${T("Changés en ligne")}')
      + (pubVis.length ? '<span class="tout" id="toutSel"><button type="button" class="case' + (tousSel ? ' on' : (certains ? ' mi' : '')) + '" aria-label="' + esc('${T("Tout sélectionner")}') + '">' + SVG_OK + '</button>' + '${T("Tout sélectionner")}' + '</span>' : '')
      + '</div>';
    h += '<div class="split"><div class="liste" role="listbox" aria-label="' + esc('${T("Changements")}') + '">';
    h += vis.map(function(e){
      var k = cle(e), et = etiquette(e);
      return '<div class="ligne' + (k === ACTIF ? ' sel' : '') + '" data-k="' + esc(k) + '" role="option" aria-selected="' + (k === ACTIF) + '">'
        + (aPublier(e) ? '<button type="button" class="case' + (SEL[k] ? ' on' : '') + '" data-c="' + esc(k) + '" aria-label="' + esc('${T("Inclure dans la publication")}') + '">' + SVG_OK + '</button>' : '<span style="width:17px"></span>')
        + vig(e) + '<div class="tx"><div class="t">' + esc(nomCle(e)) + '</div><div class="s">' + esc(sousTitre(e)) + '</div></div>'
        + '<span class="et ' + et[0] + '">' + esc(et[1]) + '</span></div>';
    }).join('') || '<div class="etat"><div class="in"><p>' + '${T("Aucun résultat.")}' + '</p></div></div>';
    h += '</div><div class="detail" id="detail">' + detailHtml() + '</div></div>';
    var sel = selection(), sansChoix = R.elements.filter(function(e){ return e.sens === 'conflit' && SEL[cle(e)] && !choixDe(e); }).length;
    h += '<div class="pied"><div class="r">' + (sel.length ? '<b>' + sel.length + '</b> ' + '${T("changement(s) sélectionné(s)")}' : '${T("Rien de sélectionné")}')
      + (sansChoix ? ' · <span style="color:var(--tx-att)">' + sansChoix + ' ' + '${T("conflit(s) à trancher")}' + '</span>' : '')
      + (R.ms ? ' <span class="msg">· ' + '${T("analysé en")}' + ' ' + (R.ms / 1000).toFixed(1) + ' s</span>' : '') + '</div>'
      + '<button type="button" class="btn pri" id="publier"' + (sel.length ? '' : ' disabled') + '><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
      + (sel.length ? '${T("Publier")}' + ' ' + sel.length + ' ' + (sel.length > 1 ? '${T("changements")}' : '${T("changement")}') : '${T("Publier")}') + '</button></div>';
    var focus = document.activeElement && document.activeElement.id === 'rech', pos = focus ? document.activeElement.selectionStart : 0;
    vPub.innerHTML = h;
    brancherPub();
    if (focus) { var ri = document.getElementById('rech'); ri.focus(); try { ri.setSelectionRange(pos, pos); } catch (e) {} }
  }
  var VIDE = '<span class="nul">' + '${T("(vide)")}' + '</span>';
  function lire(v){
    if (typeof v !== 'string') return v;
    var t = v.trim();
    if (t.charAt(0) === '{' || t.charAt(0) === '[') { try { return JSON.parse(t); } catch (e) {} }
    if (t === 'true') return true; if (t === 'false') return false; if (t === 'null') return null;
    return v;
  }
  function estVide(x){ return x == null || x === '' || (Array.isArray(x) && !x.length) || (typeof x === 'object' && !Array.isArray(x) && !Object.keys(x).length); }
  function estPrim(x){ return x == null || typeof x !== 'object'; }
  function motCle(k){ return SOUS[k] || String(k).replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, function(c){ return c.toUpperCase(); }).replace(/ [A-Z](?=[a-z])/g, function(c){ return c.toLowerCase(); }); }
  function prim(x){
    if (x === true) return '${T("Oui")}'; if (x === false) return '${T("Non")}';
    if (x == null || x === '') return VIDE;
    var s = String(x);
    if (ENT[s]) return esc(ENT[s]);
    if (s.indexOf('data:image') === 0 || /^https?:[^ ]+[.](jpe?g|png|webp|avif|gif)([?]|$)/i.test(s)) return '<span class="ph mini" style="background-image:url(&quot;' + esc(s) + '&quot;)"></span>';
    if (/^#[0-9a-f]{3,8}$/i.test(s)) return '<span class="pastille" style="background:' + esc(s) + '"></span>' + esc(s);
    return esc(s);
  }
  function resume(o){
    if (estPrim(o)) return prim(o);
    if (Array.isArray(o)) return o.map(resume).join(', ');
    var n = o.name || o.nom || o.label || o.titre || o.title;
    if (n != null && typeof n !== 'object') return esc(n);
    if (o.fibre != null && o.pct != null) return esc(o.pct + ' % ' + o.fibre);
    return Object.keys(o).filter(function(k){ return !estVide(o[k]); }).map(function(k){ return '<span class="kk">' + esc(motCle(k)) + '</span> ' + resume(o[k]); }).join(' · ') || VIDE;
  }
  function egal(a, b){ return JSON.stringify(a) === JSON.stringify(b); }
  /* cote : 'av' (en ligne) ou 'ap' (préparée) ; autre : la valeur d'en face, pour marquer ce qui part et ce qui arrive. */
  function rendre(x, autre, cote){
    if (estVide(x)) return VIDE;
    if (Array.isArray(x)) {
      var ao = Array.isArray(autre) ? autre.map(function(i){ return JSON.stringify(i); }) : null;
      var marque = function(i){ return ao && ao.indexOf(JSON.stringify(i)) < 0 ? (cote === 'ap' ? ' plus' : ' moins') : ''; };
      if (x.every(estPrim)) return '<div class="pas">' + x.map(function(i){ return '<span class="pa' + marque(i) + '">' + prim(i) + '</span>'; }).join('') + '</div>';
      return '<div class="obs">' + x.map(function(i){ return '<div class="ob' + marque(i) + '">' + resume(i) + '</div>'; }).join('') + '</div>';
    }
    if (typeof x === 'object') {
      var face = (autre && typeof autre === 'object' && !Array.isArray(autre)) ? autre : null;
      var cles = Object.keys(x); if (face) Object.keys(face).forEach(function(k){ if (cles.indexOf(k) < 0) cles.push(k); });
      var dif = face ? cles.filter(function(k){ return !egal(x[k], face[k]) && !(estVide(x[k]) && estVide(face[k])); }) : cles.filter(function(k){ return !estVide(x[k]); });
      if (!dif.length) dif = cles;
      return '<div class="kvs">' + dif.map(function(k){ return '<div class="kv"><span class="kk">' + esc(motCle(k)) + '</span><span class="vv">' + rendre(x[k], face ? face[k] : undefined, cote) + '</span></div>'; }).join('') + '</div>';
    }
    return prim(x);
  }
  function valeur(v, autre, cote){ return rendre(lire(v), lire(autre), cote); }
  function detailHtml(){
    var e = R && R.elements.filter(function(x){ return cle(x) === ACTIF; })[0];
    if (!e) return '<div class="etat"><div class="in"><p>' + '${T("Choisissez un changement pour voir le détail.")}' + '</p></div></div>';
    var et = etiquette(e), h = '<div class="dt">' + vig(e) + '<div><h2>' + esc(nomCle(e)) + '</h2><div class="k"><span class="et ' + et[0] + '">' + esc(et[1]) + '</span>'
      + esc(e.tbl === 'products' ? '${T("Produit")}' : '${T("Réglage de la boutique")}') + '</div></div></div>';
    if (e.avert === 'ugs_double') h += '<div class="avert">' + '${T("Cette UGS existe déjà en ligne sur un autre produit : la publication sera refusée tant qu’elle n’est pas changée.")}' + '</div>';
    if (e.sens === 'prod') h += '<div class="avert">' + '${T("Ce changement a été fait directement en ligne : la boutique préparée ne l’a pas. « Reprendre » l’aligne sur la version en ligne.")}' + '</div>';
    (e.champs || []).forEach(function(c){
      var nom = CHAMPS[c.champ] || c.champ;
      h += '<div class="champ"><div class="n">' + esc(nom) + (c.sens === 'conflit' ? '<span class="et conflit">' + '${T("Conflit")}' + '</span>' : '') + '</div>';
      if (e.tbl === 'products' && (PHOTO.test(c.champ) || c.champ === '(fiche)') && e.photos && (e.photos.test.length || e.photos.prod.length) && c.champ !== '(fiche)') {
        var av = e.photos.prod || [], ap = e.photos.test || [];
        h += '<div class="duo"><div class="c"><small>' + '${T("En ligne")}' + '</small><div class="photos">' + (av.map(function(u){ return '<span class="ph' + (ap.indexOf(u) < 0 ? ' moins' : '') + '" style="background-image:url(&quot;' + esc(u) + '&quot;)"></span>'; }).join('') || '<span class="vide">' + '${T("(aucune)")}' + '</span>') + '</div></div>'
          + '<div class="c"><small>' + '${T("Préparée")}' + '</small><div class="photos">' + (ap.map(function(u){ return '<span class="ph' + (av.indexOf(u) < 0 ? ' plus' : '') + '" style="background-image:url(&quot;' + esc(u) + '&quot;)"></span>'; }).join('') || '<span class="vide">' + '${T("(aucune)")}' + '</span>') + '</div></div></div>';
      } else if (c.champ === '(fiche)') {
        h += '<div class="duo"><div class="c av"><small>' + '${T("En ligne")}' + '</small>' + (c.prod == null ? '<span class="vide">' + '${T("(absente)")}' + '</span>' : '${T("présente")}') + '</div>'
          + '<div class="c ap"><small>' + '${T("Préparée")}' + '</small>' + (c.test == null ? '<span class="vide">' + '${T("(retirée)")}' + '</span>' : '${T("présente")}') + '</div></div>';
        if (e.photos && e.photos.test && e.photos.test.length && c.test != null) h += '<div class="photos" style="margin-top:.6rem">' + e.photos.test.map(function(u){ return '<span class="ph" style="background-image:url(&quot;' + esc(u) + '&quot;)"></span>'; }).join('') + '</div>';
      } else {
        h += '<div class="duo"><div class="c av"><small>' + '${T("En ligne")}' + '</small>' + valeur(c.prod, c.test, 'av') + '</div><div class="c ap"><small>' + '${T("Préparée")}' + '</small>' + valeur(c.test, c.prod, 'ap') + '</div></div>';
      }
      h += '</div>';
    });
    var entier = /^(ajout|suppression|ajout_prod|suppression_prod)$/.test(e.type), ch = choixDe(e);
    var opt = function(v, titre, txt){ return '<button type="button" class="opt' + (ch === v ? ' on' : '') + '" data-o="' + v + '"><span class="r"></span><span><b>' + titre + '</b>' + txt + '</span></button>'; };
    if (e.sens === 'conflit') {
      h += '<div class="choix"><div class="q">' + '${T("Les deux versions ont changé. Laquelle garder ?")}' + '</div><div class="opts">'
        + opt('test', '${T("La version préparée")}', '${T("Elle remplace la version en ligne.")}')
        + (entier ? '' : opt('fusion', '${T("Fusionner")}', '${T("Le reste de la version préparée part ; la version en ligne garde ses valeurs en conflit.")}'))
        + opt('prod', '${T("La version en ligne")}', '${T("La boutique préparée reprend la version en ligne.")}') + '</div></div>';
    } else if (e.sens === 'prod') {
      h += '<div class="actions-d"><button type="button" class="btn" id="reprendre">' + '${T("Reprendre dans la boutique préparée")}' + '</button></div>';
    } else {
      h += '<div class="actions-d"><button type="button" class="lien" id="abandon">' + '${T("Abandonner ce changement")}' + '</button></div>';
    }
    return h;
  }
  function brancherPub(){
    var ri = document.getElementById('rech');
    if (ri) ri.oninput = function(){ RECH = ri.value; dessinerPub(); };
    vPub.querySelectorAll('.puce').forEach(function(b){ b.onclick = function(){ FILTRE = b.getAttribute('data-f'); ACTIF = null; dessinerPub(); }; });
    var ts = document.getElementById('toutSel');
    if (ts) ts.onclick = function(){ var vis = visibles().filter(aPublier), tous = vis.every(function(e){ return SEL[cle(e)]; }); vis.forEach(function(e){ SEL[cle(e)] = !tous; }); dessinerPub(); };
    vPub.querySelectorAll('.ligne').forEach(function(l){ l.onclick = function(ev){
      var c = ev.target.closest('[data-c]');
      if (c) { var k = c.getAttribute('data-c'); SEL[k] = !SEL[k]; dessinerPub(); return; }
      ACTIF = l.getAttribute('data-k'); dessinerPub();
    }; });
    vPub.querySelectorAll('.opt').forEach(function(o){ o.onclick = function(){ CHOIX[ACTIF] = o.getAttribute('data-o'); SEL[ACTIF] = true; dessinerPub(); }; });
    var ab = document.getElementById('abandon'); if (ab) ab.onclick = function(){
      var k = ACTIF, e = R.elements.filter(function(x){ return cle(x) === k; })[0]; if (!e) return;
      szConfirmer({ danger: true, titre: '${T("Abandonner ce changement")}', texte: '« ' + nomCle(e) + ' » — ' + '${T("La boutique préparée reprendra la version en ligne. Confirmer ?")}', oui: '${T("Abandonner")}' })
        .then(function(ok){ if (ok) unSeul(k, 'prod', '${T("Changement abandonné : la boutique préparée a repris la version en ligne.")}'); });
    };
    var rp = document.getElementById('reprendre'); if (rp) rp.onclick = function(){ unSeul(ACTIF, 'prod', '${T("Repris dans la boutique préparée.")}'); };
    var pb = document.getElementById('publier'); if (pb) pb.onclick = confirmer;
  }
  function unSeul(k, choix, ok){
    var e = R.elements.filter(function(x){ return cle(x) === k; })[0]; if (!e) return;
    szDire('${T("Un instant…")}', 'att');
    appeler('config:bt:sync', ['appliquer', { tbl: e.tbl, cle: e.cle, choix: choix, jeton: e.jeton }]).then(function(r){
      if (r && r.ok) { szDire(ok, 'bon'); analyser(); } else { szDire(motif(r), 'err'); dessinerPub(); }
    });
  }

  /* ── La publication ── */
  var voile = document.getElementById('voile'), feuille = document.getElementById('feuille');
  function confirmer(){
    var l = selection(); if (!l.length) return;
    var nP = l.filter(function(e){ return e.tbl === 'products'; }).length, nR = l.length - nP;
    feuille.innerHTML = '<div class="fh"><h3>' + '${T("Publier dans la boutique en ligne ?")}' + '</h3><p>'
      + (nP ? nP + ' ' + '${T("produit(s)")}' : '') + (nP && nR ? ' · ' : '') + (nR ? nR + ' ' + '${T("réglage(s)")}' : '')
      + '. ' + '${T("Vos clients les verront aussitôt. Chaque envoi est sauvegardé et peut être annulé depuis l’historique.")}' + '</p></div>'
      + '<div class="ff"><button type="button" class="btn" id="non">' + '${T("Annuler")}' + '</button><button type="button" class="btn pri" id="oui">' + '${T("Publier")}' + '</button></div>';
    voile.hidden = false; document.getElementById('oui').focus();
    document.getElementById('non').onclick = function(){ voile.hidden = true; };
    document.getElementById('oui').onclick = function(){ publier(l); };
  }
  function publier(l){
    var lot = 'p' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), i = 0, err = 0, faits = [];
    feuille.innerHTML = '<div class="fh"><h3 id="ph">' + '${T("Publication en cours…")}' + '</h3><p id="pc">0 / ' + l.length + '</p><div class="prog"><i id="pg"></i></div></div>'
      + '<div class="suivi" id="suivi">' + l.map(function(e, j){ return '<div id="s' + j + '"><span class="st"></span><span>' + esc(nomCle(e)) + '</span></div>'; }).join('') + '</div>'
      + '<div class="ff" id="pf" hidden></div>';
    appeler('config:bt:sync', ['debut', { n: l.length }]).then(suivant);
    function suivant(){
      if (i >= l.length) return fin();
      var e = l[i], ligne = document.getElementById('s' + i);
      ligne.className = 'en'; ligne.firstChild.innerHTML = '<i></i>';
      try { ligne.scrollIntoView({ block: 'nearest' }); } catch (x) {}
      appeler('config:bt:sync', ['appliquer', { tbl: e.tbl, cle: e.cle, choix: choixDe(e), jeton: e.jeton, lot: lot }]).then(function(r){
        if (r && r.ok) { ligne.className = 'ok'; ligne.firstChild.innerHTML = SVG_OK; faits.push(e); }
        else { err++; ligne.className = 'ko'; ligne.firstChild.innerHTML = '✕'; ligne.lastChild.textContent = nomCle(e) + ' — ' + motif(r).replace(/<[^>]+>/g, ''); }
        i++;
        document.getElementById('pg').style.width = Math.round(i * 100 / l.length) + '%';
        document.getElementById('pc').textContent = i + ' / ' + l.length;
        suivant();
      });
    }
    function fin(){
      appeler('config:bt:sync', ['fin', { n: l.length, erreurs: err }]);
      document.getElementById('ph').textContent = err ? ('${T("Publication terminée avec")}' + ' ' + err + ' ' + '${T("échec(s)")}') : '${T("Publié")}';
      document.getElementById('pc').textContent = (l.length - err) + ' ' + '${T("changement(s) en ligne.")}' + (err ? ' ' + '${T("Ceux en échec restent à publier.")}' : '');
      var pf = document.getElementById('pf'); pf.hidden = false;
      pf.innerHTML = '<button type="button" class="btn" id="vh">' + '${T("Voir l’historique")}' + '</button><button type="button" class="btn pri" id="ok">' + '${T("Terminé")}' + '</button>';
      document.getElementById('ok').onclick = function(){ voile.hidden = true; };
      document.getElementById('vh').onclick = function(){ voile.hidden = true; vue('hist'); };
      analyser(); historique();
    }
  }

  /* ── L'historique ── */
  function historique(){
    appeler('config:bt:sync', ['historique']).then(function(r){ HI = r && r.ok ? (r.envois || []) : { err: motif(r) }; dessinerHist(); });
  }
  function lots(){
    var out = [], par = {};
    (HI || []).forEach(function(x){
      var k = x.lot || ('m' + Math.floor(x.le / 120));   // avant les publications : les envois d'une même minute
      if (!par[k]) { par[k] = { k: k, le: x.le, par: x.par, el: [] }; out.push(par[k]); }
      par[k].el.push(x);
    });
    return out;
  }
  function quand(s){
    var d = new Date(s * 1000);
    try { return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); } catch (e) { return d.toLocaleString(); }
  }
  function dessinerHist(){
    if (HI === null) { vHist.innerHTML = '<div class="squel"><i></i><i></i><i></i></div>'; return; }
    if (HI.err) { vHist.innerHTML = '<div class="etat"><div class="in"><p>' + HI.err + '</p></div></div>'; return; }
    var L = lots();
    if (!L.length) { vHist.innerHTML = '<div class="etat"><div class="in"><div class="rond"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><h3>' + '${T("Aucune publication")}' + '</h3><p>' + '${T("Chaque publication apparaîtra ici, avec ce qu’elle a changé, qui l’a faite et quand.")}' + '</p></div></div>'; return; }
    vHist.innerHTML = '<div class="hist">' + L.map(function(g){
      var actifs = g.el.filter(function(x){ return !x.annule; }).length;
      return '<div class="lot' + (OUVERTS[g.k] ? ' ouvert' : '') + '" data-l="' + esc(g.k) + '"><div class="lt"><div><div class="q">' + esc(quand(g.le)) + '</div>'
        + '<div class="w">' + g.el.length + ' ' + (g.el.length > 1 ? '${T("changements")}' : '${T("changement")}') + (g.par ? ' · ' + '${T("par")}' + ' ' + esc(g.par) : '')
        + (actifs < g.el.length ? ' · ' + (g.el.length - actifs) + ' ' + '${T("annulé(s)")}' : '') + '</div></div>'
        + '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></div>'
        + '<div class="li">' + g.el.map(function(x){
          return '<div class="el' + (x.annule ? ' annule' : '') + '"><span class="t">' + esc(x.tbl === 'products' ? (x.titre || x.cle) : (CLES[x.cle] || x.titre || x.cle)) + '</span>'
            + '<span class="x">' + (x.creation ? '${T("créé")}' : x.suppression ? '${T("retiré")}' : '${T("modifié")}') + '</span>'
            + (x.annule ? '<span class="x">' + '${T("annulé")}' + '</span>' : '<button type="button" class="mini" data-a="' + x.id + '">' + '${T("Annuler l’envoi")}' + '</button>') + '</div>';
        }).join('') + (actifs > 1 ? '<div class="bas"><button type="button" class="mini" data-al="' + esc(g.k) + '">' + '${T("Annuler toute la publication")}' + '</button></div>' : '') + '</div></div>';
    }).join('') + '</div>';
    vHist.querySelectorAll('.lot .lt').forEach(function(t){ t.onclick = function(){ var k = t.parentNode.getAttribute('data-l'); OUVERTS[k] = !OUVERTS[k]; t.parentNode.classList.toggle('ouvert'); }; });
    vHist.querySelectorAll('[data-a]').forEach(function(b){ b.onclick = function(){
      var id = +b.getAttribute('data-a'), x = (HI || []).filter(function(y){ return y.id === id; })[0]; if (!x) return;
      szConfirmer({ danger: true, titre: '${T("Annuler l’envoi")}', texte: '« ' + (x.tbl === 'products' ? (x.titre || x.cle) : (CLES[x.cle] || x.titre || x.cle)) + ' » — ' + '${T("La boutique en ligne retrouvera sa version d’avant. Le stock du moment est gardé.")}', oui: '${T("Annuler l’envoi")}' })
        .then(function(ok){ if (ok) annuler([id], b); });
    }; });
    vHist.querySelectorAll('[data-al]').forEach(function(b){ b.onclick = function(){
      var g = lots().filter(function(x){ return x.k === b.getAttribute('data-al'); })[0]; if (!g) return;
      var ids = g.el.filter(function(x){ return !x.annule; }).map(function(x){ return x.id; });
      szConfirmer({ danger: true, titre: '${T("Annuler toute la publication")}', texte: ids.length + ' ' + '${T("changement(s) : la boutique en ligne retrouvera leur version d’avant. Le stock du moment est gardé.")}', oui: '${T("Annuler toute la publication")}' })
        .then(function(ok){ if (ok) annuler(ids, b); });
    }; });
  }
  function annuler(ids, bouton){
    bouton.disabled = true; var i = 0, err = 0, dernier = null;
    (function suivant(){
      if (i >= ids.length) {
        szDire(err ? (err + ' ' + '${T("annulation(s) impossible(s) :")}' + ' ' + dernier) : '${T("Annulé : la boutique en ligne a retrouvé sa version d’avant.")}', err ? 'err' : 'bon');
          historique(); analyser(); return;
      }
      appeler('config:bt:sync', ['annuler', { id: ids[i] }]).then(function(r){ if (!r || !r.ok) { err++; dernier = motif(r); } i++; suivant(); });
    })();
  }

  /* ── Les vues ── */
  function vue(v){
    document.querySelectorAll('.seg button').forEach(function(b){ var on = b.getAttribute('data-vue') === v; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    vPub.hidden = v !== 'pub'; vHist.hidden = v !== 'hist';
    if (v === 'hist' && HI === null) historique();
  }
  document.querySelectorAll('.seg button').forEach(function(b){ b.onclick = function(){ vue(b.getAttribute('data-vue')); }; });
  document.getElementById('rafr').onclick = function(){ if (!LECTURE) { analyser(); if (!vHist.hidden) historique(); } };
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape' && !voile.hidden && !document.getElementById('pf')) voile.hidden = true; });
  analyser();
})();
</script></body></html>`;
}

module.exports = { pageSynchro };
