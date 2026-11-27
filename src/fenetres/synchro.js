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

const { JS_ACTIVITE, JS_DIRE, JS_MESURES, CSS_JOUR, TETE } = require('./socle.js');
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
.puce b{font-weight:700}   /* (2026-11-26) plus d opacite .7 : 4,01 de contraste la nuit (banc contrastes) */
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
/* (2026-11-25) Le flux : cartes (option A) ou liste compacte. */
.sy-aff{margin-left:auto;display:inline-flex;padding:2px;border-radius:9px;border:1px solid var(--v07);background:var(--v04)}
.sy-aff button{border:0;background:transparent;width:30px;height:26px;border-radius:7px;display:grid;place-items:center;color:var(--tx3);cursor:pointer}
.sy-aff button:hover{color:var(--tx)}
.sy-aff button.on{background:var(--f-carte);color:var(--tx);box-shadow:0 1px 2px rgba(0,0,0,.25)}
.sy-aff + .tout{margin-left:0}
.sy-flux{flex:1 1 auto;min-height:0;overflow-y:auto;padding:1rem 1.5rem 1.5rem;display:flex;flex-direction:column;gap:.8rem;border-top:1px solid var(--v06)}
.sy-flux::-webkit-scrollbar{width:8px}.sy-flux::-webkit-scrollbar-thumb{background:var(--v10);border-radius:8px}
.sy-carte{border:1px solid var(--v08);border-radius:16px;background:var(--v02);padding:1rem 1.1rem;display:flex;flex-direction:column;gap:.85rem;transition:opacity .15s}
.sy-carte.conflit{border-color:rgba(251,191,36,.45)}
.sy-carte.sy-exclue,.sy-rang.sy-exclue .sy-tete{opacity:.5}
.sy-tete{display:grid;grid-template-columns:auto auto minmax(0,1fr) auto auto auto;gap:.8rem;align-items:center}
.sy-carte .vig{width:48px;height:48px;border-radius:11px}
.sy-tete .tx{min-width:0}
.sy-tete .t{font-size:.9rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sy-tete .s{font-size:.74rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sy-case-vide{width:17px}
.sy-corps{display:flex;flex-direction:column;gap:.75rem}
.sy-tuiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:.55rem}
.sy-tuile{border-radius:11px;background:var(--f-page);border:1px solid var(--v05);padding:.65rem .8rem;display:flex;flex-direction:column;gap:.35rem;min-width:0}
.sy-tuile.sy-large{grid-column:1/-1}
.sy-tuile.sy-tconf{border-color:rgba(251,191,36,.4)}
.sy-tuile.sy-trouve{border-color:var(--or);box-shadow:0 0 0 1px var(--or)}
.sy-tuile .n{font-size:.66rem;font-weight:650;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;display:flex;gap:.5rem;align-items:center}
.sy-tuile .v{font-size:.84rem;line-height:1.5;word-break:break-word;min-width:0}
.sy-avt{color:var(--tx3);text-decoration:line-through;text-decoration-color:var(--v30)}
.sy-avt .nul,.sy-avt .sy-pas,.sy-avt .kvs{display:inline-block;text-decoration:none}
.sy-apt{color:var(--tx);font-weight:550}
.sy-fl{color:var(--tx3);margin:0 .45rem}
.sy-long{white-space:pre-wrap}
.sy-long > div + div{margin-top:.35rem}
.sy-long del{color:var(--tx3);text-decoration:line-through;background:rgba(248,113,113,.10);border-radius:3px}
.sy-long ins{text-decoration:none;color:var(--tx);background:rgba(74,222,128,.16);border-radius:3px;padding:0 1px}
.sy-corps .choix{margin:0;display:flex;align-items:center;gap:.6rem 1rem;flex-wrap:wrap;padding:.7rem .85rem}
.sy-corps .choix .q{margin:0;font-size:.78rem}
.sy-corps .opts{display:flex;gap:.4rem;flex-wrap:wrap}
.sy-corps .opt{padding:.4rem .8rem;border-radius:99px;font-size:.78rem}
.sy-corps .opt.on{font-weight:600}
.sy-corps .actions-d{margin:0;justify-content:flex-end}
.sy-flux.sy-compact{gap:0;padding-top:.3rem}
.sy-rang{border-bottom:1px solid var(--v05)}
.sy-rang .sy-tete{padding:.45rem .5rem;cursor:pointer;border-radius:10px;gap:.7rem}
.sy-rang .sy-tete:hover{background:var(--v03)}
.sy-rang .vig{width:30px;height:30px;border-radius:8px}
.sy-rang .vig svg{width:14px;height:14px}
.sy-rang .sy-tete .t{font-size:.84rem}
.sy-rang .sy-tete .s{color:var(--tx2)}
.sy-rang .sy-tete .s b{font-weight:600;color:var(--tx2)}
.sy-mut{color:var(--tx3)}
.sy-rang .sy-corps{padding:.25rem .5rem 1rem 3.4rem}
.sy-chev{color:var(--tx3);transition:transform .2s;display:grid}
.sy-rang.sy-ouvert .sy-chev{transform:rotate(90deg)}
html.jour .sy-tuile{background:#ffffff}
.sy-foc{outline:2px solid var(--or);outline-offset:2px}
.sy-rang.sy-foc{outline-offset:-2px;border-radius:10px}
.sy-al{min-width:1.3rem;height:1.3rem;padding:0 .35rem;border-radius:99px;display:inline-grid;place-items:center;font-size:.66rem;font-weight:700;background:rgba(251,191,36,.16);color:var(--tx-att)}
html.jour .sy-al{color:#6e4f0c}
.sy-ctrl{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;font-size:.76rem;color:var(--tx2)}
.sy-ctrl b{font-weight:600;padding:.15rem .55rem;border-radius:99px;background:rgba(251,191,36,.12);color:var(--tx-att)}
html.jour .sy-ctrl b{color:#6e4f0c}
.sy-kbd{font-size:.68rem;color:var(--tx3);display:inline-flex;gap:.2rem;align-items:center;white-space:nowrap}
.sy-kbd kbd{font:inherit;font-size:.64rem;padding:.05rem .32rem;border-radius:5px;border:1px solid var(--v12);background:var(--v04);color:var(--tx2)}
.sy-f{display:flex;flex-direction:column;gap:.3rem;margin-top:.9rem;font-size:.78rem;color:var(--tx2)}
.sy-f i{font-style:normal;color:var(--tx3)}
.sy-f input{font:inherit;font-size:.84rem;color:var(--tx);background:var(--v04);border:1px solid var(--v10);border-radius:9px;padding:.5rem .7rem;outline:none}
.sy-f input:focus{border-color:var(--or)}
.sy-f small{font-size:.72rem;color:var(--tx3)}
.sy-f small[hidden],.sy-f input[hidden]{display:none}
.sy-quand{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap}
.sy-quand button{border:1px solid var(--v10);background:transparent;border-radius:99px;padding:.35rem .85rem;font-size:.78rem;cursor:pointer;color:var(--tx2)}
.sy-quand button.on{background:var(--tx);color:var(--f-page);border-color:var(--tx);font-weight:600}
.sy-quand input{flex:1 1 12rem;color-scheme:dark}
html.jour .sy-quand input{color-scheme:light}
.sy-ctl{margin-top:.9rem;padding:.7rem .8rem;border-radius:11px;background:rgba(251,191,36,.07);border:1px solid rgba(251,191,36,.25);font-size:.78rem;display:grid;gap:.3rem}
.sy-ctl b{color:var(--tx-att);font-weight:650}
html.jour .sy-ctl b{color:#6e4f0c}
.sy-ctl div{display:flex;gap:.6rem;justify-content:space-between}
.sy-ctl span{color:var(--tx);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sy-ctl em{font-style:normal;color:var(--tx2);text-align:right}
.sy-ok{margin-top:.9rem;font-size:.78rem;color:var(--tx-ok);display:flex;gap:.4rem;align-items:center}
.sy-fin{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;margin-bottom:.8rem;background:rgba(74,222,128,.12);color:var(--tx-ok)}
.sy-fin svg{width:20px;height:20px}
html.jour .sy-fin{color:#1f6b3d}
.sy-pl-t{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--tx3);margin:1.1rem 0 .1rem}
.sy-pl{display:flex;gap:.9rem;align-items:center;border:1px solid rgba(147,197,253,.28);border-radius:14px;margin:.6rem 0 0;padding:.8rem 1rem;background:rgba(147,197,253,.05)}
.sy-pl-i{flex:0 0 auto;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:rgba(147,197,253,.12);color:var(--tx-bleu)}
html.jour .sy-pl-i{color:#2a5794}
.sy-pl-x{flex:1 1 auto;min-width:0}
.sy-pl-x .q{font-size:.86rem;font-weight:600}
.sy-pl-x .w{font-size:.74rem;color:var(--tx3)}
.sy-hd{padding:.1rem 1rem .9rem}
.sy-ctx{display:flex;flex-wrap:wrap;gap:.25rem .9rem;margin-top:.45rem;padding-top:.45rem;border-top:1px dashed var(--v08);font-size:.74rem;color:var(--tx2)}
.sy-ctx em{font-style:normal;color:var(--tx3)}
.sy-ctx b{color:var(--tx);font-weight:600}
.sy-tuile.sy-ctxw{grid-column:span 2}
@media (max-width:760px){.sy-tuile.sy-ctxw{grid-column:1 / -1}}
.sy-plus{display:flex;justify-content:flex-start;margin-top:.2rem}
.sy-plus .btn{display:inline-flex;align-items:center;gap:.45rem;font-size:.76rem;padding:.4rem .8rem}
.sy-corps .sy-plus{margin-top:-.2rem}
.feuille.sy-large{width:min(60rem,94vw)}
.sy-fc-t .sy-quand{margin-top:.7rem}
.sy-fc{flex:1 1 auto;min-height:0;overflow-y:auto;padding:0 1.4rem 1rem;border-top:1px solid var(--v06)}
.sy-fc-l{display:grid;grid-template-columns:minmax(8rem,.7fr) minmax(0,1fr) minmax(0,1fr);gap:1rem;padding:.6rem 0;border-bottom:1px solid var(--v04);font-size:.8rem;align-items:start}
.sy-fc-l .n{font-size:.72rem;font-weight:650;color:var(--tx3);text-transform:uppercase;letter-spacing:.05em}
.sy-fc-l .n i{font-style:normal;text-transform:none;letter-spacing:0;font-weight:500;color:var(--tx3);border:1px solid var(--v10);border-radius:99px;padding:0 .4rem;margin-left:.3rem}
.sy-fc-l .a{color:var(--tx2);min-width:0;word-break:break-word;white-space:pre-wrap}
.sy-fc-l .b{color:var(--tx);min-width:0;word-break:break-word;white-space:pre-wrap}
.sy-fc-l.ch{background:rgba(var(--or-rgb),.06);margin:0 -.6rem;padding-left:.6rem;padding-right:.6rem;border-radius:8px}
.sy-fc-l.ch .n{color:var(--tx-or,var(--or))}
.sy-fc-l.ch .b{font-weight:600}
.sy-fc-h{position:sticky;top:0;background:var(--f-carte);z-index:1;font-size:.66rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx3);font-weight:650}
.sy-fc-l .pas,.sy-fc-l .kvs,.sy-fc-l .obs,.sy-fc-l .sy-pas{white-space:normal}
.sy-hd .sy-tuiles{grid-template-columns:repeat(auto-fill,minmax(13rem,1fr))}
.sy-hd-att{font-size:.76rem;color:var(--tx3)}
.lot .el.annule + .sy-hd{opacity:.55}
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
.sy-pas{display:flex;flex-wrap:wrap;gap:.3rem;white-space:normal}
.sy-pa{display:inline-flex;align-items:center;gap:.35rem;font-size:.76rem;line-height:1.3;padding:.22rem .6rem;border-radius:999px;background:var(--v05);border:1px solid var(--v08)}
.sy-pa.plus,.ob.plus{border-color:var(--tx-ok);color:var(--tx)}
.sy-pa.moins,.ob.moins{opacity:.45;text-decoration:line-through}
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
${JS_ACTIVITE()}${JS_DIRE()}${JS_MESURES()}
  var vPub = document.getElementById('v-pub'), vHist = document.getElementById('v-hist');
  var R = null, ERR = null, LECTURE = false, T0 = 0, MINUT = null;
  var SEL = {}, CHOIX = {}, ACTIF = null, FILTRE = 'tout', RECH = '', HI = null, OUVERTS = {}, DEPLIE = {};
  /* (2026-11-25) Sa demande : l'option A de la maquette (« A est parfait ») + « un affichage liste plus compacte »
     + « une recherche intégrée dans les changements ». AFF : 'cartes' (une carte par élément, l'avant → après de chaque
     champ) ou 'liste' (une ligne par élément, qui se déplie). Le choix est retenu sur ce poste. */
  var AFF = 'cartes', FOC = null, PL = null, NOMS = {}, DET = {}, FINI = false;
  try { if (localStorage.getItem('sz-synchro-aff') === 'liste') AFF = 'liste'; } catch (e) {}

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
    quand_passe: '${T("Choisissez une date et une heure à venir (dans plus d’une minute).")}',
    quand_loin: '${T("Une publication se planifie au plus 90 jours à l’avance.")}',
    deja_partie: '${T("Cette publication planifiée est déjà partie (ou annulée).")}',
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
  /* (2026-11-25) LE CONTRÔLE AVANT DÉPART (calculé au serveur, bt_controles) : rien n'est bloqué, tout est montré. */
  var CTRL = { sans_nom: '${T("Sans nom")}', sans_photo: '${T("Sans photo")}', prix_nul: '${T("Prix à zéro")}', solde_invalide: '${T("Prix soldé au-dessus du prix")}',
    sous_cout: '${T("Vendu sous le coût")}', stock_vide: '${T("Aucun stock")}', ugs_double: '${T("UGS déjà prise en ligne")}' };
  function alertes(e){ var a = (e.controles || []).slice(); if (e.avert === 'ugs_double') a.push('ugs_double'); return a; }
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
      var garde = {}, avant = SEL; SEL = {};
      r.elements.forEach(function(e){ var k = cle(e); if (aPublier(e)) SEL[k] = Object.prototype.hasOwnProperty.call(avant, k) ? avant[k] : e.sens !== 'conflit'; garde[k] = true; });
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
      if (q && (nomCle(e) + ' ' + e.cle).toLowerCase().indexOf(q) < 0 && !trouveDans(e, q).length) return false;
      return true;
    });
  }
  /* Le texte cherchable d'un champ : son nom, et ses deux valeurs telles qu'on les LIT (consignes en mots, Oui/Non). */
  function texteDe(x){
    x = lire(x);
    if (x == null) return '';
    if (typeof x !== 'object') { var s0 = String(x); return s0 + (ENT[s0] ? ' ' + ENT[s0] : '') + (x === true ? ' ' + '${T("Oui")}' : (x === false ? ' ' + '${T("Non")}' : '')); }
    if (Array.isArray(x)) return x.map(texteDe).join(' ');
    return Object.keys(x).map(function(k){ return motCle(k) + ' ' + texteDe(x[k]); }).join(' ');
  }
  /* Les champs d'un élément où la recherche apparaît (leurs noms techniques). */
  function trouveDans(e, q){
    if (!q) return [];
    return (e.champs || []).filter(function(c){
      return ((CHAMPS[c.champ] || c.champ) + ' ' + texteDe(c.prod) + ' ' + texteDe(c.test)).toLowerCase().indexOf(q) >= 0;
    }).map(function(c){ return c.champ; });
  }
  function selection(){ return R ? R.elements.filter(function(e){ return aPublier(e) && SEL[cle(e)] && (e.sens !== 'conflit' || choixDe(e)); }) : []; }

  /* ── Le dessin ── */
  var SVG_OK = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var SVG_REG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>';
  var SVG_FICHE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>';
  var SVG_CARTES = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/></svg>';
  var SVG_LISTE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>';
  var SVG_CHEV = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
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
      var v = document.getElementById('voirEnLigne'); if (v) v.onclick = function(){ FILTRE = 'enligne'; dessiner(); };
      return;
    }
    var n = { tout: nPub, produits: 0, reglages: 0, conflits: 0, enligne: nEnLigne };
    R.elements.forEach(function(e){ if (!aPublier(e)) return; if (e.tbl === 'products') n.produits++; else n.reglages++; if (e.sens === 'conflit') n.conflits++; });
    var puce = function(id, lib, pt){ return (id !== 'tout' && !n[id]) ? '' : '<button type="button" class="puce' + (FILTRE === id ? ' on' : '') + '" data-f="' + id + '">' + (pt ? '<span class="pt"></span>' : '') + lib + ' <b>' + n[id] + '</b></button>'; };
    var vis = visibles();
    var pubVis = vis.filter(aPublier), tousSel = pubVis.length && pubVis.every(function(e){ return SEL[cle(e)]; }), certains = pubVis.some(function(e){ return SEL[cle(e)]; });
    var h = '<div class="outils"><label class="rech"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
      + '<input id="rech" type="search" placeholder="' + esc('${T("Rechercher")}') + '" aria-label="' + esc('${T("Rechercher dans les changements")}') + '" value="' + esc(RECH) + '"></label>'
      + puce('tout', '${T("Tout")}') + puce('produits', '${T("Produits")}') + puce('reglages', '${T("Réglages")}') + puce('conflits', '${T("Conflits")}', true) + puce('enligne', '${T("Changés en ligne")}')
      + '<div class="sy-aff" role="group" aria-label="' + esc('${T("Affichage")}') + '">'
      + '<button type="button" data-aff="cartes" class="' + (AFF === 'cartes' ? 'on' : '') + '" title="' + esc('${T("Cartes")}') + '" aria-label="' + esc('${T("Cartes")}') + '" aria-pressed="' + (AFF === 'cartes') + '">' + SVG_CARTES + '</button>'
      + '<button type="button" data-aff="liste" class="' + (AFF === 'liste' ? 'on' : '') + '" title="' + esc('${T("Liste compacte")}') + '" aria-label="' + esc('${T("Liste compacte")}') + '" aria-pressed="' + (AFF === 'liste') + '">' + SVG_LISTE + '</button></div>'
      + (pubVis.length ? '<span class="tout" id="toutSel"><button type="button" class="case' + (tousSel ? ' on' : (certains ? ' mi' : '')) + '" aria-label="' + esc('${T("Tout sélectionner")}') + '">' + SVG_OK + '</button>' + '${T("Tout sélectionner")}' + '</span>' : '')
      + '</div>';
    h += '<div class="sy-flux' + (AFF === 'liste' ? ' sy-compact' : '') + '" id="flux">';
    h += vis.map(AFF === 'liste' ? ligneHtml : carteHtml).join('') || '<div class="etat"><div class="in"><p>' + '${T("Aucun résultat.")}' + '</p></div></div>';
    h += '</div>';
    var sel = selection(), sansChoix = R.elements.filter(function(e){ return e.sens === 'conflit' && SEL[cle(e)] && !choixDe(e); }).length;
    h += '<div class="pied"><div class="r">' + (sel.length ? '<b>' + sel.length + '</b> ' + '${T("changement(s) sélectionné(s)")}' : '${T("Rien de sélectionné")}')
      + (sansChoix ? ' · <span style="color:var(--tx-att)">' + sansChoix + ' ' + '${T("conflit(s) à trancher")}' + '</span>' : '')
      + (R.ms ? ' <span class="msg">· ' + '${T("analysé en")}' + ' ' + (R.ms / 1000).toFixed(1) + ' s</span>' : '') + '</div>'
      + '<span class="sy-kbd" title="' + esc('${T("↑ ↓ naviguer · Espace inclure · Entrée déplier · / chercher · V affichage · Ctrl + Entrée publier")}') + '"><kbd>↑</kbd><kbd>↓</kbd> <kbd>' + '${T("Espace")}' + '</kbd> <kbd>Ctrl</kbd>+<kbd>↵</kbd></span>'
      + '<button type="button" class="btn pri" id="publier"' + (sel.length ? '' : ' disabled') + '><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
      + (sel.length ? '${T("Publier")}' + ' ' + sel.length + ' ' + (sel.length > 1 ? '${T("changements")}' : '${T("changement")}') : '${T("Publier")}') + '</button></div>';
    var fx = document.getElementById('flux'), haut = fx ? fx.scrollTop : 0;
    var focus = document.activeElement && document.activeElement.id === 'rech', pos = focus ? document.activeElement.selectionStart : 0;
    vPub.innerHTML = h;
    var fx2 = document.getElementById('flux'); if (fx2) fx2.scrollTop = haut;
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
      if (x.every(estPrim)) return '<div class="sy-pas">' + x.map(function(i){ return '<span class="sy-pa' + marque(i) + '">' + prim(i) + '</span>'; }).join('') + '</div>';
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
  /* ── L'avant → après d'un champ, lisible (option A) ── */
  /* (2026-11-25) L'ARGENT se lit en dollars (« 67,50 $ », pas « 67.5 ») ; le rabais et la marge se calculent du contexte. */
  var ARGENT = /^(price|salePrice|compareAtPrice|cost|acquisitionCost|prix|solde|cout)$/;
  // la mise en forme du socle (szArgent, JS_MESURES) : le symbole suit la langue de la page
  function argent(v){ if (v === null || v === '' || v === undefined || !isFinite(Number(v))) return v; return szArgent(v); }
  function pct(n){ return Math.round(n) + ' %'; }
  function prixCtx(x){
    if (!x || !(x.prix > 0)) return null;
    var so = x.solde > 0 && x.solde < x.prix ? x.solde : 0, eff = so || x.prix, m = x.cout > 0 ? eff - x.cout : null;
    return { rabais: so ? (1 - so / x.prix) * 100 : 0, marge: m, margePct: m != null && eff > 0 ? m / eff * 100 : null, prix: x.prix };
  }
  function ligneCtx(e, champ){
    if (!e.ctx || !/^(price|salePrice|cost|acquisitionCost)$/.test(champ)) return '';
    var a = prixCtx(e.ctx.prod), b = prixCtx(e.ctx.test); if (!a && !b) return '';
    var dl = function(lib, x, y){ return x === y ? '' : '<span><em>' + lib + '</em> ' + (x == null ? '—' : x) + ' <span class="sy-fl">→</span> <b>' + (y == null ? '—' : y) + '</b></span>'; };
    var h = dl('${T("Rabais")}', a ? (a.rabais ? '−' + pct(a.rabais) : '${T("aucun")}') : null, b ? (b.rabais ? '−' + pct(b.rabais) : '${T("aucun")}') : null)
      + dl('${T("Marge")}', a && a.marge != null ? esc(argent(a.marge)) + ' (' + pct(a.margePct) + ')' : null, b && b.marge != null ? esc(argent(b.marge)) + ' (' + pct(b.margePct) + ')' : null);
    if (champ === 'salePrice' && b && b.prix) h += '<span><em>' + '${T("sur un prix de vente de")}' + '</em> ' + esc(argent(b.prix)) + '</span>';
    return h ? '<div class="sy-ctx">' + h + '</div>' : '';
  }
  function court(x){ x = lire(x); if (x == null || x === '') return '—'; if (x === true) return '${T("Oui")}'; if (x === false) return '${T("Non")}'; var s0 = String(x); return ENT[s0] || s0; }
  function motsDiff(x, y){
    var A = x.split(' '), B = y.split(' '), n = A.length, m = B.length, i, j;
    if (n * m > 250000) return null;
    var Lc = []; for (i = 0; i <= n; i++) Lc.push(new Array(m + 1).fill(0));
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) Lc[i][j] = A[i] === B[j] ? Lc[i + 1][j + 1] + 1 : Math.max(Lc[i + 1][j], Lc[i][j + 1]);
    var o = []; i = 0; j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { o.push(esc(A[i])); i++; j++; }
      else if (Lc[i + 1][j] >= Lc[i][j + 1]) { o.push('<del>' + esc(A[i]) + '</del>'); i++; }
      else { o.push('<ins>' + esc(B[j]) + '</ins>'); j++; }
    }
    while (i < n) o.push('<del>' + esc(A[i++]) + '</del>');
    while (j < m) o.push('<ins>' + esc(B[j++]) + '</ins>');
    return o.join(' ');
  }
  function listeDelta(A, B){
    var jA = A.map(function(x){ return JSON.stringify(x); }), jB = B.map(function(x){ return JSON.stringify(x); });
    var prims = A.concat(B).every(estPrim);
    var bloc = function(x, cl){ return prims ? '<span class="sy-pa' + cl + '">' + prim(x) + '</span>' : '<div class="ob' + cl + '">' + resume(x) + '</div>'; };
    var h = B.map(function(x, i){ return bloc(x, jA.indexOf(jB[i]) < 0 ? ' plus' : ''); })
      .concat(A.filter(function(x, i){ return jB.indexOf(jA[i]) < 0; }).map(function(x){ return bloc(x, ' moins'); }));
    return h.length ? (prims ? '<div class="sy-pas">' : '<div class="obs">') + h.join('') + '</div>' : VIDE;
  }
  function deltaVal(a, b){
    if (estVide(a) && estVide(b)) return VIDE;
    if (estPrim(a) && estPrim(b)) {
      var sa = a == null ? '' : String(a), sb = b == null ? '' : String(b);
      if (sa.length > 60 || sb.length > 60) {
        var d = (sa && sb) ? motsDiff(sa, sb) : null;
        if (d) return '<div class="sy-long">' + d + '</div>';
        return '<div class="sy-long"><div class="sy-avt">' + prim(a) + '</div><div class="sy-apt">' + prim(b) + '</div></div>';
      }
      return '<span class="sy-avt">' + prim(a) + '</span><span class="sy-fl">→</span><span class="sy-apt">' + prim(b) + '</span>';
    }
    var la = Array.isArray(a) || estVide(a), lb = Array.isArray(b) || estVide(b);
    if (la && lb) return listeDelta(Array.isArray(a) ? a : [], Array.isArray(b) ? b : []);
    var oa = (a && typeof a === 'object' && !Array.isArray(a)) ? a : (estVide(a) ? {} : null);
    var ob = (b && typeof b === 'object' && !Array.isArray(b)) ? b : (estVide(b) ? {} : null);
    if (oa && ob) {
      var cles = Object.keys(ob); Object.keys(oa).forEach(function(k){ if (cles.indexOf(k) < 0) cles.push(k); });
      var dif = cles.filter(function(k){ return !egal(oa[k], ob[k]) && !(estVide(oa[k]) && estVide(ob[k])); });
      if (!dif.length) return VIDE;
      return '<div class="kvs">' + dif.map(function(k){ return '<div class="kv"><span class="kk">' + esc(motCle(k)) + '</span><span class="vv">' + deltaVal(oa[k], ob[k]) + '</span></div>'; }).join('') + '</div>';
    }
    return '<div class="sy-long"><div class="sy-avt">' + rendre(a, b, 'av') + '</div><div class="sy-apt">' + rendre(b, a, 'ap') + '</div></div>';
  }
  function photosDelta(av, ap){
    var h = ap.map(function(u){ return '<span class="ph' + (av.indexOf(u) < 0 ? ' plus' : '') + '" style="background-image:url(&quot;' + esc(u) + '&quot;)"></span>'; })
      .concat(av.filter(function(u){ return ap.indexOf(u) < 0; }).map(function(u){ return '<span class="ph moins" style="background-image:url(&quot;' + esc(u) + '&quot;)"></span>'; }));
    return h.length ? '<div class="photos">' + h.join('') + '</div>' : VIDE;
  }
  function tuile(e, c, trouves){
    var nom = CHAMPS[c.champ] || c.champ, v;
    if (e.tbl === 'products' && PHOTO.test(c.champ) && e.photos && ((e.photos.test || []).length || (e.photos.prod || []).length)) v = photosDelta(e.photos.prod || [], e.photos.test || []);
    else if (ARGENT.test(c.champ)) v = deltaVal(argent(lire(c.prod)), argent(lire(c.test)));
    else v = deltaVal(lire(c.prod), lire(c.test));
    var lc = ligneCtx(e, c.champ); v += lc;
    var large = v.length > 420 || /class="(sy-long|kvs|obs|photos)"/.test(v);
    return '<div class="sy-tuile' + (large ? ' sy-large' : (lc ? ' sy-ctxw' : '')) + (c.sens === 'conflit' ? ' sy-tconf' : '') + (trouves.indexOf(c.champ) >= 0 ? ' sy-trouve' : '') + '">'
      + '<span class="n">' + esc(nom) + (c.sens === 'conflit' ? '<span class="et conflit">' + '${T("Conflit")}' + '</span>' : '') + '</span><div class="v">' + v + '</div></div>';
  }
  function sousCarte(e){
    if (e.type === 'ajout') return '${T("Nouveau dans la boutique préparée")}';
    if (e.type === 'suppression') return '${T("Retiré de la boutique préparée")}';
    if (e.sens === 'prod') return '${T("Changé directement en ligne")}';
    if (e.sens === 'conflit') return '${T("Changé aussi en ligne depuis la préparation")}';
    var n = (e.champs || []).length;
    return n + ' ' + (n > 1 ? '${T("champs modifiés")}' : '${T("champ modifié")}');
  }
  /* Le résumé d'une ligne compacte : « Prix soldé 89 → 69 · Tailles +XS · Entretien ». */
  function resumeLigne(e){
    if (e.type === 'ajout' || e.type === 'suppression') return esc(sousTitre(e));
    return (e.champs || []).map(function(c){
      var nom = '<b>' + esc(CHAMPS[c.champ] || c.champ) + '</b>', a = lire(c.prod), b = lire(c.test);
      if (estPrim(a) && estPrim(b)) {
        var ca = ARGENT.test(c.champ) ? String(argent(a) == null ? '—' : argent(a)) : court(a), cb = ARGENT.test(c.champ) ? String(argent(b) == null ? '—' : argent(b)) : court(b);
        if (ca.length <= 24 && cb.length <= 24) return nom + ' <span class="sy-mut">' + esc(ca) + ' →</span> ' + esc(cb);
        return nom;
      }
      if ((Array.isArray(a) || estVide(a)) && (Array.isArray(b) || estVide(b))) {
        var A = Array.isArray(a) ? a : [], B = Array.isArray(b) ? b : [];
        if (A.concat(B).every(estPrim)) {
          var sA = A.map(String), sB = B.map(String);
          var pl = sB.filter(function(x){ return sA.indexOf(x) < 0; }).map(function(x){ return '+' + court(x); });
          var mo = sA.filter(function(x){ return sB.indexOf(x) < 0; }).map(function(x){ return '−' + court(x); });
          var t = pl.concat(mo); if (t.length) return nom + ' ' + esc(t.slice(0, 3).join(' ') + (t.length > 3 ? ' …' : ''));
        }
      }
      return nom;
    }).join('<span class="sy-mut"> · </span>');
  }
  function teteHtml(e, compact){
    var k = cle(e), et = etiquette(e);
    return (aPublier(e) ? '<button type="button" class="case' + (SEL[k] ? ' on' : '') + '" data-c="' + esc(k) + '" aria-label="' + esc('${T("Inclure dans la publication")}') + '">' + SVG_OK + '</button>' : '<span class="sy-case-vide"></span>')
      + vig(e) + '<div class="tx"><div class="t">' + esc(nomCle(e)) + '</div><div class="s">' + (compact ? resumeLigne(e) : esc(sousCarte(e))) + '</div></div>'
      + (alertes(e).length ? '<span class="sy-al" title="' + esc(alertes(e).map(function(a){ return CTRL[a] || a; }).join(' · ')) + '">' + alertes(e).length + '</span>' : '')
      + '<span class="et ' + et[0] + '">' + esc(et[1]) + '</span>';
  }
  function corpsHtml(e){
    var k = cle(e), h = '<div class="sy-corps">', q = RECH.trim().toLowerCase(), tr = trouveDans(e, q);
    if (e.avert === 'ugs_double') h += '<div class="avert">' + '${T("Cette UGS existe déjà en ligne sur un autre produit : la publication sera refusée tant qu’elle n’est pas changée.")}' + '</div>';
    if (e.sens === 'prod') h += '<div class="avert">' + '${T("Ce changement a été fait directement en ligne : la boutique préparée ne l’a pas. « Reprendre » l’aligne sur la version en ligne.")}' + '</div>';
    var ctl = (e.controles || []);
    if (ctl.length) h += '<div class="sy-ctrl"><span>' + '${T("Contrôle avant départ :")}' + '</span>' + ctl.map(function(a){ return '<b>' + esc(CTRL[a] || a) + '</b>'; }).join('') + '</div>';
    if (e.type === 'ajout' || e.type === 'suppression') {
      var ph = e.photos ? (e.type === 'ajout' ? (e.photos.test || []) : (e.photos.prod || [])) : [];
      h += '<div class="sy-tuiles"><div class="sy-tuile large"><span class="n">' + (e.type === 'ajout' ? '${T("Nouvelle fiche")}' : '${T("Fiche retirée")}') + '</span><div class="v">'
        + (e.type === 'ajout' ? '${T("Elle sera ajoutée à la boutique en ligne.")}' : '${T("Elle sera retirée de la boutique en ligne.")}')
        + (ph.length ? '<div class="photos" style="margin-top:.5rem">' + ph.map(function(u){ return '<span class="ph" style="background-image:url(&quot;' + esc(u) + '&quot;)"></span>'; }).join('') + '</div>' : '') + '</div></div></div>';
    } else {
      h += '<div class="sy-tuiles">' + (e.champs || []).map(function(c){ return tuile(e, c, tr); }).join('') + '</div>';
    }
    if (e.sens === 'conflit') {
      var ch = choixDe(e), entier = /^(ajout|suppression|ajout_prod|suppression_prod)$/.test(e.type);
      var opt = function(v, t, ti){ return '<button type="button" class="opt' + (ch === v ? ' on' : '') + '" data-o="' + v + '" data-k="' + esc(k) + '"' + (ti ? ' title="' + esc(ti) + '"' : '') + '>' + t + '</button>'; };
      h += '<div class="choix"><span class="q">' + '${T("Les deux versions ont changé. Laquelle garder ?")}' + '</span><div class="opts">'
        + opt('prod', '${T("La version en ligne")}', '${T("La boutique préparée reprend la version en ligne.")}')
        + (entier ? '' : opt('fusion', '${T("Fusionner")}', '${T("Le reste de la version préparée part ; la version en ligne garde ses valeurs en conflit.")}'))
        + opt('test', '${T("La version préparée")}', '${T("Elle remplace la version en ligne.")}') + '</div></div>';
    } else if (e.sens === 'prod') {
      h += '<div class="actions-d"><button type="button" class="btn" data-rp="' + esc(k) + '">' + '${T("Reprendre dans la boutique préparée")}' + '</button></div>';
    } else {
      h += '<div class="actions-d"><button type="button" class="lien" data-ab="' + esc(k) + '">' + '${T("Abandonner ce changement")}' + '</button></div>';
    }
    if (e.type !== 'ajout_prod' && e.type !== 'suppression_prod') h += '<div class="sy-plus"><button type="button" class="btn" data-fc="' + esc(k) + '">' + SVG_FICHE + ' ' + '${T("Afficher la fiche complète")}' + '</button></div>';
    return h + '</div>';
  }
  function carteHtml(e){
    var k = cle(e);
    return '<article class="sy-carte' + (cle(e) === FOC ? ' sy-foc' : '') + (e.sens === 'conflit' ? ' conflit' : '') + (aPublier(e) && !SEL[k] && e.sens !== 'conflit' ? ' sy-exclue' : '') + '" data-k="' + esc(k) + '"><div class="sy-tete">' + teteHtml(e, false) + '</div>' + corpsHtml(e) + '</article>';
  }
  function ligneHtml(e){
    var k = cle(e), q = RECH.trim().toLowerCase();
    var o = DEPLIE[k] != null ? DEPLIE[k] : !!(q && trouveDans(e, q).length);
    return '<article class="sy-rang' + (k === FOC ? ' sy-foc' : '') + (o ? ' sy-ouvert' : '') + (aPublier(e) && !SEL[k] && e.sens !== 'conflit' ? ' sy-exclue' : '') + '" data-k="' + esc(k) + '"><div class="sy-tete" data-plier="' + esc(k) + '" aria-expanded="' + o + '">'
      + teteHtml(e, true) + '<span class="sy-chev" aria-hidden="true">' + SVG_CHEV + '</span></div>' + (o ? corpsHtml(e) : '') + '</article>';
  }
  function brancherPub(){
    var ri = document.getElementById('rech');
    if (ri) ri.oninput = function(){ RECH = ri.value; DEPLIE = {}; dessinerPub(); };
    vPub.querySelectorAll('.puce').forEach(function(b){ b.onclick = function(){ FILTRE = b.getAttribute('data-f'); dessinerPub(); }; });
    vPub.querySelectorAll('[data-aff]').forEach(function(b){ b.onclick = function(){
      AFF = b.getAttribute('data-aff'); try { localStorage.setItem('sz-synchro-aff', AFF); } catch (e) {} dessinerPub();
    }; });
    var ts = document.getElementById('toutSel');
    if (ts) ts.onclick = function(){ var vis = visibles().filter(aPublier), tous = vis.every(function(e){ return SEL[cle(e)]; }); vis.forEach(function(e){ SEL[cle(e)] = !tous; }); dessinerPub(); };
    vPub.querySelectorAll('[data-c]').forEach(function(c){ c.onclick = function(ev){ ev.stopPropagation(); var k = c.getAttribute('data-c'); SEL[k] = !SEL[k]; dessinerPub(); }; });
    vPub.querySelectorAll('[data-plier]').forEach(function(t){ t.onclick = function(){ var k = t.getAttribute('data-plier'); DEPLIE[k] = t.getAttribute('aria-expanded') !== 'true'; dessinerPub(); }; });
    vPub.querySelectorAll('.opt[data-k]').forEach(function(o){ o.onclick = function(){ var k = o.getAttribute('data-k'); CHOIX[k] = o.getAttribute('data-o'); SEL[k] = true; dessinerPub(); }; });
    vPub.querySelectorAll('[data-ab]').forEach(function(b){ b.onclick = function(){
      var k = b.getAttribute('data-ab'), e = R.elements.filter(function(x){ return cle(x) === k; })[0]; if (!e) return;
      szConfirmer({ danger: true, titre: '${T("Abandonner ce changement")}', texte: '« ' + nomCle(e) + ' » — ' + '${T("La boutique préparée reprendra la version en ligne. Confirmer ?")}', oui: '${T("Abandonner")}' })
        .then(function(ok){ if (ok) unSeul(k, 'prod', '${T("Changement abandonné : la boutique préparée a repris la version en ligne.")}'); });
    }; });
    vPub.querySelectorAll('[data-rp]').forEach(function(b){ b.onclick = function(){ unSeul(b.getAttribute('data-rp'), 'prod', '${T("Repris dans la boutique préparée.")}'); }; });
    var pb = document.getElementById('publier'); if (pb) pb.onclick = confirmer;
    vPub.querySelectorAll('[data-fc]').forEach(function(b){ b.onclick = function(){
      var k = b.getAttribute('data-fc'), e = R.elements.filter(function(x){ return cle(x) === k; })[0]; if (!e) return;
      var a = { tbl: e.tbl, cle: e.cle, titre: nomCle(e) };
      szBoite('fiche', a, function(){ ficheEnLigne(a); });
    }; });
  }
  /* (2026-11-27, phase 2) LA FICHE COMPLETE S OUVRE DANS UNE VRAIE FENETRE (szBoite) : une visionneuse, rien a
     relire a sa fermeture. La fenetre fille lit la fiche elle-meme ; sans pont, la feuille d avant, ici. */
  function ficheEnLigne(a){
    ficheComplete(a.titre, '${T("En ligne")}', '${T("Préparée")}', null);
    appeler('config:bt:sync', ['fiche', { tbl: a.tbl, cle: a.cle }]).then(function(r){
      if (!r || !r.ok) { ficheComplete(a.titre, '', '', { err: motif(r) }); return; }
      ficheComplete(a.titre, '${T("En ligne")}', '${T("Préparée")}', { a: r.prod, b: r.test, vivants: r.vivants || [] });
    });
  }
  /* (2026-11-25, sa demande : « un bouton du style afficher les détails complets des changements ») LA FICHE COMPLÈTE :
     chaque champ de la fiche, les deux versions côte à côte ; ce qui change est mis en avant, le reste se replie
     (« Seulement les changements » / « Tout »). Le stock est marqué « vivant » : il ne part jamais. */
  var FC_TOUT = false, FC_DERN = null;
  function ficheComplete(titre, libA, libB, d){
    FC_DERN = [titre, libA, libB, d];
    var h = '<div class="fh sy-fc-t"><h3>' + esc(titre) + '</h3>';
    if (!d) { feuille.innerHTML = h + '<p>' + '${T("Lecture de la fiche…")}' + '</p></div><div class="squel"><i></i><i></i><i></i></div>'; feuille.classList.add('sy-large'); voile.hidden = false; return; }
    if (d.err) { feuille.innerHTML = h + '<p>' + esc(d.err) + '</p></div><div class="ff"><button type="button" class="btn pri" id="fcok">' + '${T("Fermer")}' + '</button></div>'; document.getElementById('fcok').onclick = fermerFiche; return; }
    var A = lire(d.a), Bv = lire(d.b), oa = (A && typeof A === 'object' && !Array.isArray(A)) ? A : { '(valeur)': A }, ob = (Bv && typeof Bv === 'object' && !Array.isArray(Bv)) ? Bv : { '(valeur)': Bv };
    if (A == null) oa = {}; if (Bv == null) ob = {};
    var cles = Object.keys(ob); Object.keys(oa).forEach(function(k){ if (cles.indexOf(k) < 0) cles.push(k); });
    var conn = Object.keys(CHAMPS);
    cles.sort(function(x, y){ var i = conn.indexOf(x), j = conn.indexOf(y); return (i < 0 ? 999 : i) - (j < 0 ? 999 : j) || (x < y ? -1 : 1); });
    var lignes = cles.map(function(k){
      var va = oa[k], vb = ob[k], ch = !egal(va, vb), viv = (d.vivants || []).indexOf(k) >= 0;
      return { k: k, ch: ch && !viv, viv: viv, va: va, vb: vb };
    }).filter(function(l){ return !(estVide(l.va) && estVide(l.vb)); });
    var n = lignes.filter(function(l){ return l.ch; }).length;
    var aff = function(v, k){ if (ARGENT.test(k) && estPrim(v)) return esc(argent(v) == null ? '' : argent(v)) || VIDE; if (PHOTO.test(k)) return photosDelta([], [].concat(v || []).filter(function(u){ return typeof u === 'string'; })); return rendre(lire(v), undefined, 'ap'); };
    h += '<p>' + n + ' ' + (n > 1 ? '${T("champs modifiés")}' : '${T("champ modifié")}') + ' ' + '${T("sur")}' + ' ' + lignes.length + '</p>'
      + '<div class="sy-quand" role="group"><button type="button" data-fct="0" class="' + (FC_TOUT ? '' : 'on') + '">' + '${T("Seulement les changements")}' + '</button><button type="button" data-fct="1" class="' + (FC_TOUT ? 'on' : '') + '">' + '${T("Toute la fiche")}' + '</button></div></div>'
      + '<div class="sy-fc"><div class="sy-fc-l sy-fc-h"><span></span><span>' + esc(libA) + '</span><span>' + esc(libB) + '</span></div>'
      + lignes.filter(function(l){ return FC_TOUT || l.ch; }).map(function(l){
        return '<div class="sy-fc-l' + (l.ch ? ' ch' : '') + '"><span class="n">' + esc(CHAMPS[l.k] || motCle(l.k)) + (l.viv ? ' <i>' + '${T("vivant")}' + '</i>' : '') + '</span>'
          + '<span class="a">' + (estVide(l.va) ? VIDE : aff(l.va, l.k)) + '</span><span class="b">' + (estVide(l.vb) ? VIDE : aff(l.vb, l.k)) + '</span></div>';
      }).join('') + '</div>'
      + '<div class="ff"><button type="button" class="btn pri" id="fcok">' + '${T("Fermer")}' + '</button></div>';
    feuille.innerHTML = h; feuille.classList.add('sy-large'); voile.hidden = false;
    document.getElementById('fcok').onclick = fermerFiche;
    feuille.querySelectorAll('[data-fct]').forEach(function(b){ b.onclick = function(){ FC_TOUT = b.getAttribute('data-fct') === '1'; ficheComplete.apply(null, FC_DERN); }; });
  }
  function fermerFiche(){ voile.hidden = true; feuille.classList.remove('sy-large'); }
  function unSeul(k, choix, ok){
    var e = R.elements.filter(function(x){ return cle(x) === k; })[0]; if (!e) return;
    szDire('${T("Un instant…")}', 'att');
    appeler('config:bt:sync', ['appliquer', { tbl: e.tbl, cle: e.cle, choix: choix, jeton: e.jeton }]).then(function(r){
      if (r && r.ok) { szDire(ok, 'bon'); analyser(); } else { szDire(motif(r), 'err'); dessinerPub(); }
    });
  }

  /* ── La publication ── */
  var voile = document.getElementById('voile'), feuille = document.getElementById('feuille');
  var QUAND = 'maintenant';
  function dateLocale(d){ var z = function(n){ return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + 'T' + z(d.getHours()) + ':' + z(d.getMinutes()); }
  /* (2026-11-27, phase 2) LA PUBLICATION S OUVRE DANS UNE VRAIE FENETRE (szBoite 'publier') : formulaire, progression
     et ecran de fin tournent dans la fenetre fille, qui fait elle-meme les appels au pont. Elle recoit des elements
     PLATS (JSON) : tbl, cle, jeton, choix, nom et les libelles d alerte deja traduits (al). Les gestes de l ecran de
     fin qui touchent la page mere (Voir l historique, Annuler cette publication) lui sont RENDUS (szBoiteRendre) :
     c est la mere qui change de vue ou annule, sinon la fenetre fille se fermerait au milieu de l annulation.
     Sans pont, la feuille d avant, ici, sur les memes elements plats. */
  function nomDe(e){ return e.nom != null ? e.nom : nomCle(e); }
  function choixEl(e){ return e.choix != null ? e.choix : choixDe(e); }
  function alDe(e){ return Array.isArray(e.al) ? e.al : alertes(e).map(function(a){ return CTRL[a] || a; }); }
  function confirmer(){
    var l = selection(); if (!l.length) return;
    var plats = l.map(function(e){ return { tbl: e.tbl, cle: e.cle, jeton: e.jeton, choix: choixDe(e), nom: nomCle(e), al: alertes(e).map(function(a){ return CTRL[a] || a; }) }; });
    szBoite('publier', { l: plats }, function(){ ouvrirPublier(plats); }).then(function(r){
      if (!r) return;
      var v = (r && r.valeur) || {};
      if (v.vue === 'hist') vue('hist');
      analyser(); historique();
      if (Array.isArray(v.annuler) && v.annuler.length) annuler(v.annuler, null);
    });
  }
  /* Rend a la page mere le geste de l ecran de fin (en fenetre fille), ou le fait ici (sans pont). */
  function geste(v){
    if (window.__szBoite) { szBoiteRendre(v); FINI = false; voile.hidden = true; return; }
    FINI = false; voile.hidden = true;
    if (v.vue) vue(v.vue);
  }
  function ouvrirPublier(l){
    if (!l || !l.length) return;
    feuille.classList.remove('sy-large');
    var nP = l.filter(function(e){ return e.tbl === 'products'; }).length, nR = l.length - nP;
    var al = l.filter(function(e){ return alDe(e).length; });
    var demain = new Date(Date.now() + 86400000); demain.setMinutes(0, 0, 0);
    feuille.innerHTML = '<div class="fh"><h3>' + '${T("Publier dans la boutique en ligne ?")}' + '</h3><p>'
      + (nP ? nP + ' ' + '${T("produit(s)")}' : '') + (nP && nR ? ' · ' : '') + (nR ? nR + ' ' + '${T("réglage(s)")}' : '')
      + '. ' + '${T("Chaque envoi est sauvegardé et peut être annulé.")}' + '</p>'
      + '<label class="sy-f"><span>' + '${T("Nom de la publication")}' + ' <i>' + '${T("(facultatif)")}' + '</i></span><input id="pnom" maxlength="80" placeholder="' + esc('${T("Ex : Collection hiver")}') + '"></label>'
      + '<div class="sy-f"><span>' + '${T("Quand")}' + '</span><div class="sy-quand" role="group">'
      + '<button type="button" data-q="maintenant" class="' + (QUAND === 'maintenant' ? 'on' : '') + '">' + '${T("Maintenant")}' + '</button>'
      + '<button type="button" data-q="plus" class="' + (QUAND === 'plus' ? 'on' : '') + '">' + '${T("Planifier")}' + '</button>'
      + '<input type="datetime-local" id="pquand" value="' + dateLocale(demain) + '"' + (QUAND === 'plus' ? '' : ' hidden') + '></div>'
      + '<small id="pq-aide"' + (QUAND === 'plus' ? '' : ' hidden') + '>' + '${T("À l’heure dite, la version préparée DU MOMENT part (à 10 minutes près).")}' + '</small></div>'
      + (al.length ? '<div class="sy-ctl"><b>' + al.length + ' ' + '${T("élément(s) à vérifier avant le départ")}' + '</b>'
        + al.slice(0, 6).map(function(e){ return '<div><span>' + esc(nomDe(e)) + '</span><em>' + esc(alDe(e).join(' · ')) + '</em></div>'; }).join('')
        + (al.length > 6 ? '<div><em>+ ' + (al.length - 6) + '</em></div>' : '') + '</div>' : '<div class="sy-ok">' + SVG_OK + ' ' + '${T("Contrôle avant départ : rien à signaler.")}' + '</div>')
      + '</div><div class="ff"><button type="button" class="btn" id="non">' + '${T("Annuler")}' + '</button><button type="button" class="btn pri" id="oui"></button></div>';
    voile.hidden = false;
    var oui = document.getElementById('oui'), pq = document.getElementById('pquand');
    var peindre = function(){
      oui.textContent = QUAND === 'plus' ? '${T("Planifier")}' : (al.length ? '${T("Publier quand même")}' : '${T("Publier")}');
      feuille.querySelectorAll('[data-q]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-q') === QUAND); });
      pq.hidden = QUAND !== 'plus'; document.getElementById('pq-aide').hidden = QUAND !== 'plus';
      var tq = new Date(pq.value).getTime();
      if (tq > 0) document.getElementById('pq-aide').textContent = '${T("Elle partira {0} (plus tôt si l’application est ouverte), dans la version préparée à ce moment-là.")}'.split('{0}').join(fenetre(Math.floor(tq / 1000)));
    };
    feuille.querySelectorAll('[data-q]').forEach(function(b){ b.onclick = function(){ QUAND = b.getAttribute('data-q'); peindre(); if (QUAND === 'plus') pq.focus(); }; });
    pq.addEventListener('input', peindre); pq.addEventListener('change', peindre);
    peindre(); document.getElementById('pnom').focus();
    document.getElementById('non').onclick = function(){ voile.hidden = true; };
    oui.onclick = function(){
      var nom = document.getElementById('pnom').value.trim();
      if (QUAND !== 'plus') { publier(l, nom); return; }
      var t = new Date(pq.value).getTime();
      if (!(t > Date.now() + 60000)) { szDire(MOTIFS.quand_passe, 'err', pq); return; }
      planifier(l, nom, Math.floor(t / 1000));
    };
  }
  function planifier(l, nom, quand){
    var oui = document.getElementById('oui'); oui.disabled = true;
    appeler('config:bt:sync', ['planifier', { quand: quand, nom: nom, elements: l.map(function(e){ return { tbl: e.tbl, cle: e.cle, choix: choixEl(e), titre: nomDe(e) }; }) }]).then(function(r){
      if (!r || !r.ok) { oui.disabled = false; szDire(motif(r), 'err'); return; }
      feuille.innerHTML = '<div class="fh"><div class="sy-fin ok">' + SVG_OK + '</div><h3>' + '${T("Publication planifiée")}' + '</h3><p>'
        + (nom ? '« ' + esc(nom) + ' » · ' : '') + l.length + ' ' + '${T("changement(s)")}' + ' · ' + esc(quand_(quand)) + '</p><p>' + '${T("Elle partira {0}, même si l’application est fermée.")}'.split('{0}').join(esc(fenetre(quand))) + ' ' + '${T("Vous pouvez l’annuler depuis l’historique tant qu’elle n’est pas partie.")}' + '</p></div>'
        + '<div class="ff"><button type="button" class="btn" id="vh">' + '${T("Voir l’historique")}' + '</button><button type="button" class="btn pri" id="ok">' + '${T("Terminé")}' + '</button></div>';
      document.getElementById('ok').onclick = function(){ voile.hidden = true; };
      document.getElementById('vh').onclick = function(){ geste({ vue: 'hist' }); };
      if (!window.__szBoite) historique();   // en fenetre fille : la mere relit a la fermeture
    });
  }
  function publier(l, nom){
    var lot = 'p' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), i = 0, err = 0, faits = [];
    feuille.innerHTML = '<div class="fh"><h3 id="ph">' + '${T("Publication en cours…")}' + '</h3><p id="pc">0 / ' + l.length + '</p><div class="prog"><i id="pg"></i></div></div>'
      + '<div class="suivi" id="suivi">' + l.map(function(e, j){ return '<div id="s' + j + '"><span class="st"></span><span>' + esc(nomDe(e)) + '</span></div>'; }).join('') + '</div>'
      + '<div class="ff" id="pf" hidden></div>';
    appeler('config:bt:sync', ['debut', { n: l.length, lot: lot, nom: nom || '' }]).then(suivant);
    function suivant(){
      if (i >= l.length) return fin();
      var e = l[i], ligne = document.getElementById('s' + i);
      ligne.className = 'en'; ligne.firstChild.innerHTML = '<i></i>';
      try { ligne.scrollIntoView({ block: 'nearest' }); } catch (x) {}
      appeler('config:bt:sync', ['appliquer', { tbl: e.tbl, cle: e.cle, choix: choixEl(e), jeton: e.jeton, lot: lot }]).then(function(r){
        if (r && r.ok) { ligne.className = 'ok'; ligne.firstChild.innerHTML = SVG_OK; faits.push(e); }
        else { err++; ligne.className = 'ko'; ligne.firstChild.innerHTML = '✕'; ligne.lastChild.textContent = nomDe(e) + ' — ' + motif(r).replace(/<[^>]+>/g, ''); }
        i++;
        document.getElementById('pg').style.width = Math.round(i * 100 / l.length) + '%';
        document.getElementById('pc').textContent = i + ' / ' + l.length;
        suivant();
      });
    }
    function fin(){
      FINI = true;
      appeler('config:bt:sync', ['fin', { n: l.length, erreurs: err }]);
      document.getElementById('ph').textContent = err ? ('${T("Publication terminée avec")}' + ' ' + err + ' ' + '${T("échec(s)")}') : ((nom ? '« ' + nom + ' » ' : '') + '${T("est en ligne")}');
      document.getElementById('pc').textContent = (l.length - err) + ' ' + '${T("changement(s) en ligne.")}' + (err ? ' ' + '${T("Ceux en échec restent à publier.")}' : '');
      var pf = document.getElementById('pf'); pf.hidden = false;
      /* (2026-11-25) L'ÉCRAN DE FIN : « Annuler cette publication » tout de suite, sans aller chercher dans l'historique. */
      pf.innerHTML = (faits.length ? '<button type="button" class="btn dgr" id="annl">' + '${T("Annuler cette publication")}' + '</button><span style="flex:1"></span>' : '')
        + '<button type="button" class="btn" id="vh">' + '${T("Voir l’historique")}' + '</button><button type="button" class="btn pri" id="ok">' + '${T("Terminé")}' + '</button>';
      document.getElementById('ok').onclick = function(){ FINI = false; voile.hidden = true; };
      var an = document.getElementById('annl');
      if (an) an.onclick = function(){
        szConfirmer({ danger: true, titre: '${T("Annuler cette publication")}', texte: faits.length + ' ' + '${T("changement(s) : la boutique en ligne retrouvera leur version d’avant. Le stock du moment est gardé.")}', oui: '${T("Annuler cette publication")}' })
          .then(function(ok){
            if (!ok) return;
            an.disabled = true;
            appeler('config:bt:sync', ['historique']).then(function(h){
              var ids = (h && h.ok ? (h.envois || []) : []).filter(function(x){ return x.lot === lot && !x.annule; }).map(function(x){ return x.id; });
              if (!ids.length) { szDire('${T("Rien à annuler pour cette publication.")}', 'att'); return; }
              if (window.__szBoite) { geste({ annuler: ids }); return; }
              voile.hidden = true; annuler(ids, an);
            });
          });
      };
      document.getElementById('vh').onclick = function(){ geste({ vue: 'hist' }); };
      if (!window.__szBoite) { analyser(); historique(); }   // en fenetre fille : la mere relit a la fermeture
    }
  }

  /* ── L'historique ── */
  function historique(){
    appeler('config:bt:sync', ['historique']).then(function(r){ HI = r && r.ok ? (r.envois || []) : { err: motif(r) }; NOMS = (r && r.noms) || {}; dessinerHist(); });
    appeler('config:bt:sync', ['planifs']).then(function(r){ PL = r && r.ok ? (r.planifs || []) : []; dessinerHist(); });
  }
  function quand_(t){ return quand(t); }
  /* (2026-11-26, l'essai de la Chemise Walla) LA FENÊTRE DE DÉPART : le réveil du serveur passe toutes les 10 minutes,
     donc une publication planifiée part entre l'heure dite et 10 minutes plus tard (plus tôt si l'application est
     ouverte : son compteur la fait partir à la minute). On le DIT au lieu de laisser deviner. */
  function hm(s){ var d = new Date(s * 1000); try { return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); } catch (e) { return d.toTimeString().slice(0, 5); } }
  function fenetre(s){ return '${T("entre {0} et {1}")}'.split('{0}').join(hm(s)).split('{1}').join(hm(s + 600)); }
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
    /* (2026-11-25) Les publications PLANIFIÉES, en tête : celles qui attendent (annulables), et celles parties avec des échecs. */
    var pl = (PL || []).filter(function(p){ return p.etat === 'attente' || p.etat === 'cours' || (p.etat === 'fait' && p.bilan && p.bilan.erreurs && p.bilan.erreurs.length); });
    var hp = pl.length ? '<div class="sy-pl-t">' + '${T("Planifiées")}' + '</div>' + pl.map(function(p){
      var et = p.etat === 'attente' ? '${T("partira {0}")}'.split('{0}').join(fenetre(p.quand)) : (p.etat === 'cours' ? '${T("en cours")}' : (p.bilan.ok + ' ' + '${T("en ligne")}' + ', ' + p.bilan.erreurs.length + ' ' + '${T("en échec")}'));
      return '<div class="sy-pl"><div class="sy-pl-i"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>'
        + '<div class="sy-pl-x"><div class="q">' + (p.nom ? '« ' + esc(p.nom) + ' » · ' : '') + esc(quand(p.quand)) + '</div><div class="w">' + p.elements.length + ' ' + '${T("changement(s)")}' + (p.par ? ' · ' + '${T("par")}' + ' ' + esc(p.par) : '') + ' · ' + esc(et) + '</div>'
        + (p.etat === 'fait' ? '<div class="w">' + p.bilan.erreurs.slice(0, 4).map(function(x){ return esc((x.titre || x.cle) + ' — ' + motif({ motif: x.motif })); }).join('<br>') + '</div>' : '') + '</div>'
        + (p.etat === 'attente' ? '<button type="button" class="mini" data-dp="' + p.id + '">' + '${T("Annuler la planification")}' + '</button>' : '') + '</div>';
    }).join('') : '';
    if (!L.length && hp) { vHist.innerHTML = '<div class="hist">' + hp + '</div>'; brancherPl(); return; }
    if (!L.length) { vHist.innerHTML = '<div class="etat"><div class="in"><div class="rond"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><h3>' + '${T("Aucune publication")}' + '</h3><p>' + '${T("Chaque publication apparaîtra ici, avec ce qu’elle a changé, qui l’a faite et quand.")}' + '</p></div></div>'; return; }
    vHist.innerHTML = '<div class="hist">' + hp + (hp ? '<div class="sy-pl-t">' + '${T("Publiées")}' + '</div>' : '') + L.map(function(g){
      var actifs = g.el.filter(function(x){ return !x.annule; }).length;
      return '<div class="lot' + (OUVERTS[g.k] ? ' ouvert' : '') + '" data-l="' + esc(g.k) + '"><div class="lt"><div><div class="q">' + (NOMS[g.k] ? '« ' + esc(NOMS[g.k]) + ' » · ' : '') + esc(quand(g.le)) + '</div>'
        + '<div class="w">' + g.el.length + ' ' + (g.el.length > 1 ? '${T("changements")}' : '${T("changement")}') + (g.par ? ' · ' + '${T("par")}' + ' ' + esc(g.par) : '')
        + (actifs < g.el.length ? ' · ' + (g.el.length - actifs) + ' ' + '${T("annulé(s)")}' : '') + '</div></div>'
        + '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></div>'
        + '<div class="li">' + g.el.map(function(x){
          return '<div class="el' + (x.annule ? ' annule' : '') + '"><span class="t">' + esc(x.tbl === 'products' ? (x.titre || x.cle) : (CLES[x.cle] || x.titre || x.cle)) + '</span>'
            + '<span class="x">' + (x.creation ? '${T("créé")}' : x.suppression ? '${T("retiré")}' : '${T("modifié")}') + '</span>'
            + (x.annule ? '<span class="x">' + '${T("annulé")}' + '</span>' : '<button type="button" class="mini" data-a="' + x.id + '">' + '${T("Annuler l’envoi")}' + '</button>') + '</div>'
            + (OUVERTS[g.k] ? detailEnvoi(x) : '');
        }).join('') + (actifs > 1 ? '<div class="bas"><button type="button" class="mini" data-al="' + esc(g.k) + '">' + '${T("Annuler toute la publication")}' + '</button></div>' : '') + '</div></div>';
    }).join('') + '</div>';
    brancherPl(); brancherFc();
    vHist.querySelectorAll('.lot .lt').forEach(function(t){ t.onclick = function(){ var k = t.parentNode.getAttribute('data-l'); OUVERTS[k] = !OUVERTS[k]; if (OUVERTS[k]) chargerDetails(k); dessinerHist(); }; });
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
  /* (2026-11-25) Le détail d'un envoi : les mêmes tuiles « avant → après » que la Publication, lues à l'ouverture du lot. */
  function detailEnvoi(x){
    var d = DET[x.id];
    if (!d) return '<div class="sy-hd"><span class="sy-hd-att">' + '${T("Lecture du détail…")}' + '</span></div>';
    if (!d.ok) return '<div class="sy-hd"><span class="sy-hd-att">' + esc(motif(d)) + '</span></div>';
    if (!d.champs.length) return '<div class="sy-hd"><span class="sy-hd-att">' + '${T("Aucun champ visible n’a changé (stock ou horodatage seulement).")}' + '</span></div>';
    var e = { tbl: x.tbl, photos: d.photos ? { prod: d.photos.avant || [], test: d.photos.apres || [] } : null, ctx: d.ctx || null };
    return '<div class="sy-hd"><div class="sy-tuiles">' + d.champs.map(function(c){ return tuile(e, { champ: c.champ, prod: c.avant, test: c.apres }, []); }).join('') + '</div>'
      + '<div class="sy-plus"><button type="button" class="btn" data-hfc="' + x.id + '">' + SVG_FICHE + ' ' + '${T("Afficher la fiche complète")}' + '</button></div></div>';
  }
  function chargerDetails(k){
    var g = lots().filter(function(y){ return y.k === k; })[0]; if (!g) return;
    g.el.filter(function(x){ return !DET[x.id]; }).slice(0, 25).forEach(function(x){
      DET[x.id] = null;
      appeler('config:bt:sync', ['detail', { id: x.id }]).then(function(r){ DET[x.id] = r && r.ok ? r : (r || { ok: false, motif: 'echec' }); dessinerHist(); });
    });
  }
  function brancherFc(){
    vHist.querySelectorAll('[data-hfc]').forEach(function(b){ b.onclick = function(){
      var id = +b.getAttribute('data-hfc'), d = DET[id], x = (HI || []).filter(function(y){ return y.id === id; })[0]; if (!d || !x) return;
      var aH = { titre: x.tbl === 'products' ? (x.titre || x.cle) : (CLES[x.cle] || x.titre || x.cle), d: { a: d.avant, b: d.apres, vivants: x.tbl === 'products' ? ['stock', 'warehouseLocations', 'stockReserve', 'reserved'] : [] } };
      szBoite('ficheHist', aH, function(){ ficheComplete(aH.titre, '${T("Avant")}', '${T("Après")}', aH.d); });
    }; });
  }
  function brancherPl(){
    vHist.querySelectorAll('[data-dp]').forEach(function(b){ b.onclick = function(){
      var id = +b.getAttribute('data-dp');
      szConfirmer({ danger: true, titre: '${T("Annuler la planification")}', texte: '${T("Rien ne partira à la date prévue. Les changements restent dans la boutique préparée.")}', oui: '${T("Annuler la planification")}' })
        .then(function(ok){ if (!ok) return; b.disabled = true;
          appeler('config:bt:sync', ['deplanifier', { id: id }]).then(function(r){ if (r && r.ok) szDire('${T("Planification annulée.")}', 'bon'); else szDire(motif(r), 'err'); historique(); }); });
    }; });
  }
  function annuler(ids, bouton){
    if (bouton) bouton.disabled = true;   // null : annulation rendue par la fenetre fille de la publication
    var i = 0, err = 0, dernier = null;
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
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape' && !voile.hidden && !document.getElementById('pf')) fermerFiche(); });
  /* (2026-11-25, sa demande) LES RACCOURCIS — vue « À publier », hors d'un champ de saisie et hors d'une feuille ouverte :
     ↑ ↓ (ou J K) passent d'un changement à l'autre ; Espace l'inclut ou l'exclut ; Entrée le déplie (liste compacte) ;
     / cherche ; Échap vide la recherche ; V change d'affichage ; Ctrl + Entrée publie. */
  document.addEventListener('keydown', function(ev){
    if (vPub.hidden || !voile.hidden || !R) return;
    var t = ev.target, saisie = t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
    if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); if (selection().length) confirmer(); return; }
    if (saisie) { if (ev.key === 'Escape' && t.id === 'rech') { RECH = ''; t.value = ''; dessinerPub(); t.blur(); } if (ev.key === 'ArrowDown' && t.id === 'rech') { ev.preventDefault(); t.blur(); bouger(1); } return; }
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    var k = ev.key;
    if (k === 'ArrowDown' || k === 'j' || k === 'J') { ev.preventDefault(); bouger(1); }
    else if (k === 'ArrowUp' || k === 'k' || k === 'K') { ev.preventDefault(); bouger(-1); }
    else if (k === ' ' && FOC) { ev.preventDefault(); var e = R.elements.filter(function(x){ return cle(x) === FOC; })[0]; if (e && aPublier(e)) { SEL[FOC] = !SEL[FOC]; dessinerPub(); } }
    else if (k === 'Enter' && FOC && AFF === 'liste') { ev.preventDefault(); var o = vPub.querySelector('[data-plier="' + FOC.replace(/"/g, '') + '"]'); DEPLIE[FOC] = !(o && o.getAttribute('aria-expanded') === 'true'); dessinerPub(); }
    else if (k === '/') { ev.preventDefault(); var ri = document.getElementById('rech'); if (ri) ri.focus(); }
    else if (k === 'v' || k === 'V') { AFF = AFF === 'liste' ? 'cartes' : 'liste'; try { localStorage.setItem('sz-synchro-aff', AFF); } catch (e2) {} dessinerPub(); }
  });
  function bouger(d){
    var v = visibles(); if (!v.length) return;
    var i = -1; v.forEach(function(e, j){ if (cle(e) === FOC) i = j; });
    i = Math.max(0, Math.min(v.length - 1, i < 0 ? 0 : i + d));
    FOC = cle(v[i]); dessinerPub();
    var el = vPub.querySelector('.sy-foc'); if (el) try { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { el.scrollIntoView(); }
  }
  /* (2026-11-25, sa capture : « on clique Publier, il n'y avait rien ; on fait un changement, on reclique : ça ne se recharge
     pas ») La fenêtre déjà ouverte revenait au premier plan avec l'analyse d'avant. Elle se RELANCE maintenant chaque fois
     qu'elle revient devant (clic sur « Publier », Alt+Tab…) — sauf pendant une lecture ou une publication, et pas plus
     d'une fois toutes les 3 secondes. Les cases cochées et les conflits tranchés sont gardés (voir analyser). */
  var DERNIERE = Date.now();
  /* (2026-11-25, sa capture en 9.2.38 : de retour sur « Publier » (« À jour »), l'écran de fin de la publication d'avant
     était encore là) Un retour sur la fenêtre FERME ce qui appartient au passé — l'écran de fin, la fiche complète, la
     planification confirmée — puis relit. Seule une publication EN COURS (ou une confirmation pas encore répondue) reste. */
  function relancer(force){
    if (window.__szBoite) return;   // la fenetre fille (szBoite) ne montre que sa fiche : rien a relire ni a fermer
    if (!voile.hidden && (FINI || feuille.classList.contains('sy-large') || document.getElementById('vh'))) { FINI = false; fermerFiche(); }
    if (LECTURE || !voile.hidden) return;
    if (force !== true && Date.now() - DERNIERE < 3000) return;
    DERNIERE = Date.now(); analyser(); if (!vHist.hidden) historique();
  }
  // La fenêtre ANCRÉE dans la fenêtre principale ne reçoit pas « focus » : la coquille appelle szRevenir (main.js).
  window.szRevenir = function(){ relancer(true); };
  window.addEventListener('focus', relancer);
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) relancer(); });
  /* (2026-11-27, phase 2) En fenetre fille (szBoite) : la fiche demandee, seule a l ecran — sans relancer
     l analyse entiere de la boutique, dont elle n a pas besoin. */
  if (!szBoiteSiDemandee({
    fiche: function(a){ if (a && a.tbl) ficheEnLigne(a); },
    ficheHist: function(a){ if (a && a.d) ficheComplete(a.titre, '${T("Avant")}', '${T("Après")}', a.d); },
    publier: function(a){ if (a && Array.isArray(a.l) && a.l.length) ouvrirPublier(a.l); }
  })) analyser();
})();
</script></body></html>`;
}

module.exports = { pageSynchro };
