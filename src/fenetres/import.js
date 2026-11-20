'use strict';

/*
 * FENÊTRE « IMPORT DE PRODUITS FOURNISSEURS » — NATIVE (8.33.0, sa demande du 2026-11-17)
 * =============================================================================
 * « Un vrai module où j'ai d'un côté tous mes fournisseurs, et ensuite une option
 *   facilitante pour l'ajout des produits par simple recherche de nom de produit. »
 *
 * LA DISPOSITION
 *   · À GAUCHE, LES FOURNISSEURS — tous les fournisseurs actifs, avec leur famille
 *     (vêtements, accessoires…), l'état de leur site (prêt / à configurer) et le
 *     nombre de fiches qui attendent. « + Nouveau fournisseur » en bas.
 *   · À DROITE, LE FOURNISSEUR CHOISI, en trois onglets :
 *       Rechercher   — une barre : le nom du produit, Entrée. Les résultats du site
 *                      arrivent en cartes ; « Préparer la fiche » sur le bon. Pour
 *                      une liste de noms, « Plusieurs noms à la fois ».
 *       À compléter  — les fiches préparées : photos à garder, catégorie, mise en
 *                      ligne, ce qui manque ; « Compléter et créer le produit ».
 *       Créés        — ce qui est devenu un produit (photos dans la photothèque).
 *
 * ⚠ LA FENÊTRE NE DÉCIDE RIEN : la lecture du site est dans la coquille
 *   (src/import-fournisseur.js), la traduction vers nos tailles et couleurs et la
 *   liste des fiches sont dans le site (assets/js/importfournisseur.js, ops import:*).
 * ⚠ UNE RECHERCHE SIMPLE NE CRÉE RIEN : les résultats ne sont que regardés ; seule
 *   « Préparer la fiche » écrit (une fiche d'import, jamais un produit).
 * ⚠ LISTES EN PAGES MESURÉES (data-pages), jamais de glissière.
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script.
 * ⚠ LES IMAGES DU FOURNISSEUR s'affichent par leur adresse, sans référent
 *   (referrerpolicy=no-referrer) ; ses TEXTES passent tous par esc().
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('import');

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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;display:flex}
button,select,input,textarea{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px}
button{padding:.3rem .65rem;cursor:pointer}
select,input{padding:.25rem .45rem}
textarea{padding:.45rem .55rem;resize:none;width:100%}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button:focus,select:focus,input:focus,textarea:focus{outline:none;border-color:var(--or)}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.lien{background:transparent;border-color:transparent;color:var(--or);padding:.2rem .3rem;font-size:.8rem;font-weight:600}
button.lien:hover:not(:disabled){background:transparent;text-decoration:underline}
.module{flex:1 1 auto;min-width:0;min-height:0;display:grid;grid-template-columns:17.5rem minmax(0,1fr);gap:.9rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;padding:.75rem .85rem;display:flex;flex-direction:column;gap:.5rem;min-height:0;min-width:0}
.carte h2{margin:0;font:700 .74rem/1.3 system-ui;color:var(--tx2);text-transform:uppercase;letter-spacing:.06em}
.aide{font-size:.75rem;color:var(--tx2);line-height:1.45}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.accueil-vide{flex:1 1 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7rem;text-align:center;padding:2rem}
.accueil-vide .av-ic{width:64px;height:64px;border-radius:18px;display:inline-flex;align-items:center;justify-content:center;
  background:color-mix(in srgb,var(--vv,#5fd4a4) 16%,transparent);color:var(--vv,#5fd4a4);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--vv,#5fd4a4) 40%,transparent)}
.accueil-vide .av-ic svg{width:32px;height:32px}
.accueil-vide h2{margin:.4rem 0 0;font-size:1.25rem;color:var(--tx)}
.accueil-vide p{margin:0;max-width:30rem;color:var(--tx2);font-size:.9rem;line-height:1.5}
.accueil-vide .prim{margin-top:.6rem;padding:.65rem 1.4rem;border-radius:11px;font-size:.92rem}

/* ── LES FOURNISSEURS (colonne de gauche) ── */
.cote input.filtre{width:100%}
.fos{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:.25rem;overflow:hidden}
.fo{display:grid;grid-template-columns:2.2rem minmax(0,1fr) auto;gap:.6rem;align-items:center;padding:.45rem .45rem;border-radius:10px;border:1px solid transparent;cursor:pointer}
.fo:hover{background:var(--v05)}
.fo.sel{background:var(--v08);border-color:var(--or)}
.mono{width:2.2rem;height:2.2rem;border-radius:9px;display:flex;align-items:center;justify-content:center;font:700 .78rem/1 system-ui;background:var(--v10);color:var(--tx)}
.fo.sel .mono{background:var(--or);color:#1a1208}
.fo .t{min-width:0}
.fo .t b{display:block;font-size:.84rem;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fo .t small{display:flex;align-items:center;gap:.35rem;font-size:.7rem;color:var(--tx2);white-space:nowrap;overflow:hidden}
.point{width:.45rem;height:.45rem;border-radius:99px;flex:0 0 auto;background:var(--tx-ok)}
.point.off{background:var(--tx-att)}
.cpt{min-width:1.4rem;height:1.4rem;padding:0 .4rem;border-radius:99px;background:var(--or);color:#1a1208;font:700 .7rem/1.4rem system-ui;text-align:center}
.cote .bas{display:flex;flex-direction:column;gap:.3rem}

/* ── LE FOURNISSEUR CHOISI ── */
.princ{display:flex;flex-direction:column;gap:.7rem;min-width:0;min-height:0}
.entete{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
.entete .mono{width:2.8rem;height:2.8rem;font-size:.95rem;background:var(--or);color:#1a1208;border-radius:12px}
.entete .nom{min-width:0;flex:1 1 auto}
.entete h2{margin:0;font:700 1.15rem/1.25 system-ui;color:var(--tx)}
.entete .site{font-size:.76rem;color:var(--tx2);display:flex;gap:.45rem;align-items:center;flex-wrap:wrap}
.badge{display:inline-block;font-size:.68rem;font-weight:700;padding:.1rem .5rem;border-radius:99px;background:var(--v08);color:var(--tx2);white-space:nowrap}
.onglets{display:flex;gap:.3rem;border-bottom:1px solid var(--v08);padding-bottom:.45rem;flex-wrap:wrap}
.onglets button{background:transparent;border:1px solid transparent;color:var(--tx2);padding:.35rem .75rem;font-weight:650;font-size:.83rem;display:flex;align-items:center;gap:.4rem}
.onglets button:hover:not(:disabled){background:var(--v05);color:var(--tx)}
.onglets button.actif{border-color:var(--or);color:var(--tx);background:var(--v05)}
.onglets .n{font-size:.68rem;padding:0 .4rem;border-radius:99px;background:var(--v10);color:var(--tx2);line-height:1.3rem}
.onglets button.actif .n{background:var(--or);color:#1a1208}
.zone{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:.65rem}

/* la barre de recherche */
.barre{display:grid;grid-template-columns:minmax(0,1fr) 13rem auto;gap:.5rem;align-items:stretch}
.barre .q{position:relative;display:flex}
.barre .q svg{position:absolute;left:.75rem;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--tx2);pointer-events:none}
.barre input#o-nom{width:100%;padding:.65rem .8rem .65rem 2.4rem;font-size:1rem;border-radius:10px}
.barre select{border-radius:10px}
.barre .prim{padding:.55rem 1.3rem;border-radius:10px;font-size:.92rem}
.options{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;font-size:.8rem;color:var(--tx2)}
.options label{display:flex;align-items:center;gap:.4rem}
.multi{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.6rem;align-items:start}
.avance{font-size:.8rem;color:var(--tx2);min-height:1.2em}
.res-t{display:flex;align-items:baseline;gap:.6rem;flex-wrap:wrap;font-size:.84rem;color:var(--tx2)}
.res-t b{color:var(--tx)}
/* (8.33.3, sa capture : « c'est bien trop pogné, ça doit être plus professionnel ») Des cartes plus larges et aérées :
   photo carrée sur fond blanc (les photos de grossiste sont détourées sur blanc), titre sur deux lignes, puis UN
   chiffre qui se lit de loin — la vente proposée — et dessous, en petit, le prix du fournisseur et notre coût,
   alignés en colonnes. L alerte de quantité tient sur une ligne ; la phrase entière reste au survol. */
.res{flex:1 1 0;min-height:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(13.5rem,1fr));gap:1rem;overflow:hidden;align-content:start}
.rc{display:flex;flex-direction:column;border:1px solid var(--v10);border-radius:14px;overflow:hidden;background:var(--v03,transparent);box-shadow:0 6px 18px -12px rgba(0,0,0,.45);transition:border-color .15s ease}
.rc:hover{border-color:var(--v20,var(--v10))}
.rc .im{position:relative;aspect-ratio:1/1;background:#fff}
.rc .im img{width:100%;height:100%;object-fit:cover;display:block}
.rc .sc{position:absolute;left:.4rem;top:.4rem;font:700 .66rem/1 system-ui;padding:.22rem .45rem;border-radius:99px;background:rgba(10,14,22,.78);color:var(--tx)}
.rc .sc.haut{background:var(--or);color:#1a1208}
.rc .bd{padding:.8rem .9rem .9rem;display:flex;flex-direction:column;gap:.6rem;flex:1 1 auto}
.rc [data-ti] b{font-size:.8rem;font-weight:600;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.7em}
.rc [data-ti]{display:block}
/* (8.33.3) le titre est limité à deux lignes plus haut : pas de display:block ici, il annulerait la limite */
.rc .px{display:flex;flex-direction:column;gap:.5rem;padding-top:.6rem;border-top:1px solid var(--v08);font-size:.72rem;color:var(--tx2);line-height:1.35}
.rc .px .pf{color:var(--tx);font-weight:600}
.rc .px .lec{font-style:italic}
.rc .pv{display:flex;align-items:baseline;justify-content:space-between;gap:.5rem}
.rc .pv-l{font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--tx2)}
.rc .pv-v{font:700 1.2rem/1 system-ui;color:var(--tx);font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.rc .kv{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.25rem .75rem}
.rc .kv span:nth-child(even){color:var(--tx);text-align:right;font-weight:550;font-variant-numeric:tabular-nums;white-space:nowrap}
.rc .qte{font-size:.7rem;font-weight:650;color:var(--tx-ok);background:rgba(34,197,94,.10);border-radius:7px;padding:.32rem .55rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html.jour .rc .qte{color:#1d5e33}
.rc .orig{font-size:.64rem;color:var(--tx2)}
.alerte-q{display:inline-block;font-size:.68rem;font-weight:700;padding:.12rem .45rem;border-radius:7px;background:rgba(34,197,94,.14);color:var(--tx-ok);line-height:1.35}
html.jour .alerte-q{color:#1d5e33;background:rgba(34,197,94,.12)}
.rc button{margin-top:auto;width:100%;padding:.5rem .7rem;font-size:.78rem;font-weight:650}
.rc.fait{border-color:var(--tx-ok)}
.rc.fait button{color:var(--tx-ok)}
.etapes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem;margin-top:.4rem}
.etapes div{border:1px dashed var(--v16);border-radius:12px;padding:.8rem .9rem;display:flex;flex-direction:column;gap:.3rem}
.etapes b{font-size:.84rem}
.etapes span{font-size:.76rem;color:var(--tx2);line-height:1.45}
.etapes .num{font:700 .7rem/1 system-ui;color:var(--or);letter-spacing:.05em}
.config{max-width:34rem;margin:1.5rem auto;display:flex;flex-direction:column;gap:.7rem;align-items:flex-start;padding:1.2rem 1.3rem;border:1px dashed var(--v16);border-radius:14px}
.config h3{margin:0;font:700 1rem/1.3 system-ui}

/* À compléter / Créés : liste + volet */
.duo{flex:1 1 0;min-height:0;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.35fr);gap:.8rem}
.liste{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:.3rem;overflow:hidden}
.fi{display:grid;grid-template-columns:2.6rem minmax(0,1fr) auto;gap:.55rem;align-items:center;padding:.35rem .4rem;border:1px solid transparent;border-radius:9px;cursor:pointer}
.fi:hover{background:var(--v05)}
.fi.sel{border-color:var(--or);background:var(--v05)}
.fi .vg{width:2.6rem;height:2.6rem;border-radius:7px;background:var(--v08);object-fit:cover;display:block}
.fi .t{min-width:0}
.fi .t b{display:block;font-size:.8rem;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fi .t small{display:block;font-size:.7rem;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pill{display:inline-block;font-size:.64rem;font-weight:700;padding:.06rem .45rem;border-radius:99px;white-space:nowrap}
.pill.a_verifier{background:rgba(212,175,55,.16);color:var(--tx-att)}
.pill.plusieurs{background:rgba(96,165,250,.16);color:var(--tx-info,#93c5fd)}
.pill.introuvable,.pill.erreur{background:rgba(239,68,68,.16);color:var(--tx-err2)}
.pill.creee{background:rgba(34,197,94,.16);color:var(--tx-ok)}
/* (2026-11-18, relooking phase 2) Épuré : TROIS tons — le vert (configuré, fait, créé) devient NEUTRE. */
html[data-sz-theme="epure"] .point:not(.off),html[data-sz-theme="epure"].jour .point:not(.off){background:var(--tx2)}
html[data-sz-theme="epure"] .rc .qte,html[data-sz-theme="epure"].jour .rc .qte,html[data-sz-theme="epure"] .alerte-q,html[data-sz-theme="epure"].jour .alerte-q,html[data-sz-theme="epure"] .pill.creee,html[data-sz-theme="epure"].jour .pill.creee{background:var(--ep-neutre-f);color:var(--ep-neutre-t)}
html[data-sz-theme="epure"] .rc.fait,html[data-sz-theme="epure"].jour .rc.fait{border-color:var(--v16)}
html[data-sz-theme="epure"] .rc.fait button,html[data-sz-theme="epure"].jour .rc.fait button{color:var(--tx)}
html.jour .pill.a_verifier{color:#7a5a00}
html.jour .pill.plusieurs{color:#1e4f8f}
html.jour .pill.introuvable,html.jour .pill.erreur{color:#7a2e2e}
html.jour .pill.creee{color:#1d5e33}
html.jour .badge{color:#2f3845;background:rgba(0,0,0,.07)}
html.jour .rc .sc{background:rgba(255,255,255,.92)}
html.jour .onglets .n{color:#2f3845;background:rgba(0,0,0,.08)}
html.jour .rc .sc.haut{background:var(--or);color:#1a1208}
.detail{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:.55rem;overflow:hidden}
.detail h2{margin:0;font:700 .95rem/1.3 system-ui;color:var(--tx)}
.d-tete input{width:100%;font-weight:650}
.d-src{font-size:.72rem;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.galerie{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:.35rem;flex:0 0 auto}
.ph{position:relative;aspect-ratio:4/5;border-radius:8px;overflow:hidden;border:2px solid transparent;background:var(--v08);cursor:pointer;padding:0}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.ph.on{border-color:var(--or)}
.ph .n{position:absolute;top:.2rem;left:.2rem;min-width:1.25rem;height:1.25rem;border-radius:99px;background:var(--or);color:#1a1208;font:700 .68rem/1.25rem system-ui;text-align:center;padding:0 .25rem}
.ph:not(.on) img{opacity:.45}
.lignes{display:grid;grid-template-columns:8.5rem minmax(0,1fr);gap:.25rem .8rem;font-size:.8rem}
.lignes .k{color:var(--tx2)}
.lignes .v{min-width:0;overflow:hidden;text-overflow:ellipsis}
.jet{display:inline-block;font-size:.7rem;padding:.04rem .4rem;border-radius:6px;background:var(--v08);margin:0 .2rem .15rem 0}
.jet.inc{background:rgba(245,158,11,.16);color:var(--tx-att)}
html.jour .jet.inc{color:#7a5a00}
.desc{flex:0 0 auto;font-size:.76rem;color:var(--tx2);line-height:1.45;max-height:2.9em;white-space:normal;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.detail > *{flex-shrink:0}
.manque{display:flex;flex-wrap:wrap;gap:.3rem}
.manque span{font-size:.7rem;padding:.08rem .45rem;border-radius:99px;border:1px solid var(--v16);color:var(--tx2)}
.cands{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}
.cand{display:flex;flex-direction:column;gap:.25rem;padding:.4rem;border:1px solid var(--v10);border-radius:10px;cursor:pointer;text-align:left;background:var(--v03,transparent)}
.cand:hover{border-color:var(--or)}
.cand img,.cand .vide-img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:7px;background:var(--v08);display:block}
.cand b{font-size:.74rem;font-weight:650;line-height:1.3;max-height:2.6em;overflow:hidden}
.cand small{font-size:.68rem;color:var(--tx2)}
.actions-d{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:auto}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (max-width:1240px){.module{grid-template-columns:15.5rem minmax(0,1fr)}.galerie{grid-template-columns:repeat(6,minmax(0,1fr))}.barre{grid-template-columns:minmax(0,1fr) 10.5rem auto}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
/* ══ « ÉPURÉ » (8.44.0, fidèle à Import.dc.html) : la colonne des fournisseurs pleine hauteur, blanche,
   à filet ; des fournisseurs en rangées bordées ; un en-tête plus grand ; la recherche de 48 px. Pastilles
   et carrés à lettre NEUTRES ; trois tons. ══ */
html[data-sz-theme="epure"] .module{gap:0}
html[data-sz-theme="epure"] .module>.cote{border-radius:0;border:0;border-right:1px solid var(--v08);padding:24px 16px;gap:14px;margin:-.75rem 0 -.75rem -1.05rem}
html[data-sz-theme="epure"] .cote h2{font-size:16px;font-weight:800;letter-spacing:0;text-transform:none;color:var(--tx)}
html[data-sz-theme="epure"] .fos{gap:8px}
html[data-sz-theme="epure"] .fo{grid-template-columns:40px minmax(0,1fr) auto;gap:12px;padding:12px;border-radius:12px;border:1px solid var(--v08);background:var(--f-carte)}
html[data-sz-theme="epure"] .fo.sel{background:var(--ep-ambre-f);border-color:var(--v20)}
html[data-sz-theme="epure"] .mono,html[data-sz-theme="epure"] .fo.sel .mono{width:40px;height:40px;border-radius:10px;background:var(--ep-neutre-f);color:var(--ep-neutre-t);font-weight:800;font-size:14px}
html[data-sz-theme="epure"] .fo .t b{font-size:14px;font-weight:700}
html[data-sz-theme="epure"] .princ{padding:0 0 0 32px;gap:18px}
html[data-sz-theme="epure"] .entete .mono{width:48px;height:48px;border-radius:12px;font-size:17px;background:var(--ep-neutre-f);color:var(--ep-neutre-t)}
html[data-sz-theme="epure"] .entete h2{font-size:26px;font-weight:800;letter-spacing:-.02em}
html[data-sz-theme="epure"] .onglets button.actif .n{background:var(--ep-neutre-f);color:var(--ep-neutre-t)}
html[data-sz-theme="epure"] .barre .q,html[data-sz-theme="epure"] .barre select,html[data-sz-theme="epure"] .barre .prim{height:48px;border-radius:12px}
html[data-sz-theme="epure"] .barre input#o-nom{height:48px;border-radius:12px;font-size:15px}
html[data-sz-theme="epure"] .barre .prim{padding:0 22px;font-size:14px;font-weight:700}
html[data-sz-theme="epure"] .rc{border-radius:16px;border-color:var(--v08);background:var(--f-carte);box-shadow:none}
html[data-sz-theme="epure"] .rc .sc,html[data-sz-theme="epure"] .rc .sc.haut{background:var(--f-carte);color:var(--tx);border-radius:8px;font-size:12px;padding:4px 8px}

`;

/** Page de la fenêtre. */
function pageImport() {
  return `${TETE()}
<title>${T("Import de produits fournisseurs — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.suppliers}</span><h1>${T("Import de produits fournisseurs")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var CTX = null, FICHES = [], FID = '', ONGLET = 'chercher', SEL = '', FILTRE_F = '';
  var CAT = {}, EN_LIGNE = false, MULTI = false, NOMS = '', NOM = '';
  var RES = {};      /* par fournisseur : { nom, candidats, motif } — la dernière recherche, regardée seulement */
  var PREP = {};     /* adresse d un résultat → id de la fiche préparée */
  var OCCUPE = false, ARRET = false;
  /* (8.33.2) LES PRIX AU MOMENT DE LA RECHERCHE (sa demande : « je dois voir les prix au scan, avoir une idée de
     mon prix de vente, et être alertée si le prix en quantité est moins cher »). Les cartes s affichent tout de
     suite ; puis chaque produit est lu chez le fournisseur, UN À LA FOIS, et sa carte se complète : prix du
     fournisseur, coût chez nous (taux de la Banque du Canada), prix de vente proposé, alerte palier.
     EST : adresse → { etat: lecture | ok | echec, e: estimation }. GEN : une nouvelle recherche arrête la lecture
     de la précédente. La coquille garde ce qu elle a lu : « Préparer la fiche » ne relit pas la page. */
  var EST = {}, GEN = 0;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  var MOTIFS = {
  maj_en_cours: '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session:           '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:             '${T("Votre rôle ne permet pas d’ajouter des produits.")}',
    indisponible:      '${T("Le module d’import n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    pont:              '${T("L’application n’a pas répondu.")}',
    delai:             '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue:'${T("Cette version de l’application ne connaît pas cette opération : mettez-la à jour.")}',
    nuage:             '${T("La base n’a pas confirmé l’enregistrement : réessayez.")}',
    liste_pleine:      '${T("500 fiches d’import en attente : retirez celles qui ne servent plus.")}',
    introuvable:       '${T("Cette fiche n’existe plus.")}',
    deja_creee:        '${T("Ce produit a déjà été créé depuis cette fiche.")}',
    fournisseur_introuvable: '${T("Fournisseur introuvable.")}',
    fournisseur_sans_site:   '${T("Ce fournisseur n’a pas de site configuré.")}',
    categorie_invalide:      '${T("Catégorie inconnue.")}',
    categorie_hors_famille:  '${T("Cette catégorie ne correspond pas à ce que vend ce fournisseur.")}',
    import_sans_fiche:       '${T("Choisissez d’abord le bon produit parmi les résultats.")}',
    import_sans_categorie:   '${T("Choisissez d’abord la catégorie.")}',
    photos_trop:             '${T("Cinq photos au plus.")}',
    site_invalide:     '${T("L’adresse du site du fournisseur est invalide.")}',
    recherche_invalide:'${T("L’adresse de recherche du fournisseur est invalide.")}',
    site_injoignable:  '${T("Le site du fournisseur ne répond pas.")}',
    page_illisible:    '${T("La page du produit n’a pas pu être lue.")}',
    adresse:           '${T("Adresse refusée (locale ou invalide).")}',
    hors_site:         '${T("Ce lien sort du site du fournisseur.")}',
    nom_requis:        '${T("Nom trop court.")}',
    echec:             '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  var STATUT = { a_verifier: '${T("À vérifier")}', plusieurs: '${T("À choisir")}', introuvable: '${T("Introuvable")}', erreur: '${T("Erreur")}', creee: '${T("Créée")}' };
  var MANQUE = { categorie: '${T("catégorie")}', nom: '${T("nom")}', photo: '${T("photo")}', cout: '${T("coût")}', prix: '${T("prix")}',
    tailles: '${T("tailles")}', couleurs: '${T("couleurs")}', poids: '${T("poids")}', stock: '${T("stock")}' };
  var LOUPE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';

  function fournisseur(id){ return (CTX && CTX.fournisseurs || []).filter(function(f){ return f.id === (id || FID); })[0] || null; }
  function familleLib(cle){ var l = ''; (CTX.familles || []).forEach(function(f){ if (f.cle === cle) l = f.libelle; }); return l; }
  function categoriesDe(f){
    if (!f || !f.configure) return [];
    return (CTX.categories || []).filter(function(c){ return f.type === 'mixte' || c.famille === f.type; });
  }
  function catLib(cle){ var l = ''; (CTX.categories || []).forEach(function(c){ if (c.cle === cle) l = c.libelle; }); return l; }
  function argent(n){ return (n == null) ? '—' : szArgent(n); }
  function img(u, cl){ return u ? '<img class="' + (cl || '') + '" src="' + esc(u) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<span class="' + (cl || '') + ' vide-img"></span>'; }
  function fiche(id){ return FICHES.filter(function(x){ return x.id === id; })[0] || null; }
  function initiales(n){
    var m = String(n || '').trim().split(' ').filter(Boolean);
    return ((m[0] || '').charAt(0) + (m.length > 1 ? m[m.length - 1].charAt(0) : (m[0] || '').charAt(1))).toUpperCase() || '?';
  }
  function domaine(u){ return String(u || '').replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]; }
  function fichesDe(fid, quoi){
    return FICHES.filter(function(x){ return x.fournisseurId === fid && (quoi === 'creees' ? x.statut === 'creee' : x.statut !== 'creee'); });
  }

  /* ══ LE DESSIN ═════════════════════════════════════════════════════════ */
  function dessiner(){
    garderSaisies();
    corps.innerHTML = '<div class="module">' + vueFournisseurs() + '<div class="princ">' + vuePrincipale() + '</div></div>';
    var on = document.getElementById('o-nom'); if (on) on.value = NOM;
    var ta = document.getElementById('o-noms'); if (ta) ta.value = NOMS;
    var att = FICHES.filter(function(x){ return x.statut !== 'creee'; }).length;
    document.getElementById('sous').textContent = '${T("{0} fiches en attente")}'.replace('{0}', String(att));
  }
  function garderSaisies(){
    var on = document.getElementById('o-nom'); if (on) NOM = on.value;
    var ta = document.getElementById('o-noms'); if (ta) NOMS = ta.value;
    var ff = document.getElementById('o-ffiltre'); if (ff) FILTRE_F = ff.value;
  }

  function vueFournisseurs(){
    var q = String(FILTRE_F || '').trim().toLowerCase();
    var l = (CTX.fournisseurs || []).filter(function(f){ return !q || f.nom.toLowerCase().indexOf(q) >= 0; });
    var h = '<div class="carte cote"><h2>${T("Mes fournisseurs")}</h2>'
      + '<input class="filtre" id="o-ffiltre" placeholder="${T("Filtrer…")}" aria-label="${T("Filtrer les fournisseurs")}" value="' + esc(FILTRE_F) + '">';
    if (!(CTX.fournisseurs || []).length) h += '<div class="vide">${T("Aucun fournisseur pour l’instant.")}</div>';
    else if (!l.length) h += '<div class="vide">${T("Aucun fournisseur ne correspond.")}</div>';
    else h += '<div class="fos" data-pages="import-fournisseurs">' + l.map(function(f){
      var n = fichesDe(f.id, 'attente').length;
      return '<div class="fo' + (f.id === FID ? ' sel' : '') + '" data-f="' + esc(f.id) + '" tabindex="0" role="button" aria-pressed="' + (f.id === FID) + '">'
        + '<span class="mono">' + esc(initiales(f.nom)) + '</span>'
        + '<span class="t"><b>' + esc(f.nom) + '</b><small><span class="point' + (f.configure ? '' : ' off') + '"></span>'
        + (f.configure ? esc(familleLib(f.type)) : '${T("site à configurer")}') + '</small></span>'
        + (n ? '<span class="cpt" title="${T("Fiches à compléter")}">' + n + '</span>' : '<span></span>') + '</div>';
    }).join('') + '</div>';
    // (2026-11-20, sa capture : « deux boutons Nouveau fournisseur ») Liste vide : le bouton vit au centre, dans l'accueil.
    h += '<div class="bas">' + (CTX.peutAjouterFournisseur && (CTX.fournisseurs || []).length ? '<button type="button" data-a="nouveauF">${T("+ Nouveau fournisseur")}</button>' : '') + '</div></div>';
    return h;
  }

  function vuePrincipale(){
    var f = fournisseur();
    // (2026-11-20, sa capture : une immense carte vide et une phrase grise) Un accueil, pas un cadre vide : sans
    // aucun fournisseur, on invite à créer le premier ; sinon, on montre où choisir.
    if (!f) {
      var aucun = !(CTX.fournisseurs || []).length;
      return '<div class="accueil-vide"><span class="av-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg></span>'
        + (aucun
          ? '<h2>${T("Ajoutez votre premier fournisseur")}</h2><p>${T("Donnez le site d’un fournisseur : vous pourrez ensuite chercher ses produits par leur nom et en préparer les fiches en quelques secondes.")}</p>'
            + (CTX.peutAjouterFournisseur ? '<button type="button" class="prim" data-a="nouveauF">${T("+ Nouveau fournisseur")}</button>' : '')
          : '<h2>${T("Choisissez un fournisseur")}</h2><p>${T("Choisissez un fournisseur à gauche.")}</p>')
        + '</div>';
    }
    var nA = fichesDe(f.id, 'attente').length, nC = fichesDe(f.id, 'creees').length;
    var h = '<div class="entete"><span class="mono">' + esc(initiales(f.nom)) + '</span><div class="nom"><h2>' + esc(f.nom) + '</h2>'
      + '<div class="site">' + (f.configure ? esc(domaine(f.site)) + ' <span class="badge">' + esc(familleLib(f.type)) + '</span>' : '${T("Aucun site configuré")}') + '</div></div>'
      + (CTX.peutConfigurer ? '<button type="button" data-a="config">' + (f.configure ? '${T("Réglages du fournisseur")}' : '${T("Configurer son site")}') + '</button>' : '') + '</div>';
    h += '<div class="onglets" role="tablist">'
      + '<button type="button" role="tab" data-onglet="chercher" class="' + (ONGLET === 'chercher' ? 'actif' : '') + '" aria-selected="' + (ONGLET === 'chercher') + '">${T("Rechercher")}</button>'
      + '<button type="button" role="tab" data-onglet="attente" class="' + (ONGLET === 'attente' ? 'actif' : '') + '" aria-selected="' + (ONGLET === 'attente') + '">${T("À compléter")} <span class="n">' + nA + '</span></button>'
      + '<button type="button" role="tab" data-onglet="creees" class="' + (ONGLET === 'creees' ? 'actif' : '') + '" aria-selected="' + (ONGLET === 'creees') + '">${T("Créés")} <span class="n">' + nC + '</span></button></div>';
    h += '<div class="zone">' + (ONGLET === 'chercher' ? vueChercher(f) : vueFiches(f, ONGLET)) + '</div>';
    return h;
  }

  function vueChercher(f){
    if (!f.configure) {
      return '<div class="config"><h3>${T("Ce fournisseur n’a pas encore de site")}</h3>'
        + '<div class="aide">${T("Indiquez l’adresse de son catalogue et ce qu’il vend (vêtements, accessoires…) : vous pourrez ensuite chercher ses produits par leur nom.")}</div>'
        + (CTX.peutConfigurer ? '<button type="button" class="prim" data-a="config">${T("Configurer son site")}</button>' : '') + '</div>';
    }
    var cats = categoriesDe(f), cat = CAT[f.id] || '';
    if (!cat && cats.length === 1) { cat = cats[0].cle; CAT[f.id] = cat; }
    var h = '<div class="barre"><div class="q">' + LOUPE + '<input id="o-nom" placeholder="${T("Nom ou référence du produit chez ce fournisseur")}" aria-label="${T("Nom du produit à chercher")}" autocomplete="off"' + (OCCUPE || MULTI ? ' disabled' : '') + '></div>'
      + '<select id="o-cat" aria-label="${T("Catégorie")}"><option value="">${T("Catégorie…")}</option>'
      + cats.map(function(c){ return '<option value="' + esc(c.cle) + '"' + (c.cle === cat ? ' selected' : '') + '>' + esc(c.libelle) + '</option>'; }).join('') + '</select>'
      + '<button type="button" class="prim" data-a="chercher"' + (OCCUPE || MULTI ? ' disabled' : '') + '>${T("Chercher")}</button></div>'
      + '<div class="options"><label title="${T("Le produit est mis en vente dès qu’il est créé ; sinon il reste retiré de la vente.")}"><input type="checkbox" id="o-ligne"' + (EN_LIGNE ? ' checked' : '') + '> ${T("Mettre en ligne à la création")}</label>'
      + '<button type="button" class="lien" data-a="multi">' + (MULTI ? '${T("Un seul nom")}' : '${T("Plusieurs noms à la fois")}') + '</button></div>';
    if (MULTI) {
      h += '<div class="multi"><textarea id="o-noms" rows="5" placeholder="${T("Un nom par ligne (25 au plus)")}" aria-label="${T("Noms des produits, un par ligne")}"' + (OCCUPE ? ' disabled' : '') + '></textarea>'
        + (OCCUPE ? '<button type="button" data-a="arreter">${T("Arrêter après celui-ci")}</button>'
          : '<button type="button" class="prim" data-a="chercherTous">${T("Préparer les fiches")}</button>') + '</div>'
        + '<div class="aide">${T("Chaque nom au résultat net devient une fiche « À compléter » ; quand plusieurs produits se ressemblent, vous choisirez dans l’onglet À compléter.")}</div>'
        + '<div class="avance" id="avance"></div>';
      return h;
    }
    var r = RES[f.id];
    if (OCCUPE && r && r.enCours) return h + '<div class="avance">' + '${T("Recherche de « {0} » chez {1}…")}'.replace('{0}', esc(r.nom)).replace('{1}', esc(f.nom)) + '</div>';
    if (!r) {
      return h + '<div class="etapes">'
        + '<div><span class="num">1</span><b>${T("Tapez le nom")}</b><span>${T("Le nom du produit ou sa référence chez le fournisseur, puis Entrée.")}</span></div>'
        + '<div><span class="num">2</span><b>${T("Choisissez le bon")}</b><span>${T("Les produits trouvés sur son site s’affichent avec leur photo, leur prix et votre prix de vente proposé.")}</span></div>'
        + '<div><span class="num">3</span><b>${T("Préparez la fiche")}</b><span>${T("Photos, tailles, couleurs et composition sont récupérées ; vous complétez le reste.")}</span></div></div>';
    }
    if (r.motif) return h + '<div class="vide">' + esc(expliquer({ motif: r.motif })) + '</div>';
    if (!r.candidats.length) return h + '<div class="vide">' + '${T("Aucun produit trouvé pour « {0} ». Essayez un autre mot ou la référence du fournisseur.")}'.replace('{0}', esc(r.nom)) + '</div>';
    h += '<div class="res-t">' + '${T("{0} résultats pour « {1} »")}'.replace('{0}', '<b>' + r.candidats.length + '</b>').replace('{1}', esc(r.nom))
      + (r.en ? '<span>' + '${T("— cherché en anglais : « {0} »")}'.replace('{0}', esc(r.en)) + '</span>' : '')
      + '<span>${T("— le plus ressemblant d’abord")}</span></div>';
    h += '<div class="res" data-pages="import-resultats">' + r.candidats.map(function(c, i){
      var fid = PREP[c.url];
      return '<div class="rc' + (fid ? ' fait' : '') + '"><div class="im" data-im="' + i + '">' + imCarte(c) + '</div>'
        + '<div class="bd"><span data-ti="' + i + '">' + tiCarte(c) + '</span><div class="px" data-px="' + i + '">' + pxCarte(c) + '</div>'
        + (fid ? '<button type="button" data-voir="' + esc(fid) + '">${T("✓ Fiche prête — compléter")}</button>'
               : '<button type="button" data-prep="' + i + '"' + (OCCUPE ? ' disabled' : '') + '>${T("Préparer la fiche")}</button>') + '</div></div>';
    }).join('') + '</div>';
    return h;
  }

  function vueFiches(f, quoi){
    var l = fichesDe(f.id, quoi);
    if (!l.length) {
      return '<div class="carte" style="flex:1 1 0"><div class="vide">' + (quoi === 'creees' ? '${T("Aucun produit créé depuis ce fournisseur.")}'
        : '${T("Aucune fiche à compléter : cherchez un produit dans l’onglet Rechercher.")}') + '</div></div>';
    }
    if (!SEL || !l.some(function(x){ return x.id === SEL; })) SEL = l[0].id;
    return '<div class="duo"><div class="carte"><div class="liste" data-pages="import-fiches">' + l.map(function(x){
      var fi = x.fiche || {};
      var vg = (fi.photos && fi.photos[0]) || (fi.images && fi.images[0]) || ((x.candidats || [])[0] || {}).image || '';
      return '<div class="fi' + (x.id === SEL ? ' sel' : '') + '" data-id="' + esc(x.id) + '" tabindex="0">' + img(vg, 'vg')
        + '<span class="t"><b>' + esc(fi.nom || x.recherche) + '</b><small>' + esc(catLib(x.categorie) || '${T("sans catégorie")}') + '</small></span>'
        + '<span class="pill ' + esc(x.statut) + '">' + STATUT[x.statut] + '</span></div>';
    }).join('') + '</div></div><div class="carte">' + vueDetail() + '</div></div>';
  }

  function vueDetail(){
    var x = fiche(SEL);
    var h = '<div class="detail">';
    if (!x) return h + '<div class="vide">${T("Choisissez une fiche dans la liste.")}</div></div>';
    var fi = x.fiche || {};
    if (x.statut === 'creee') {
      h += '<h2>${T("Produit créé")}</h2><div class="lignes">'
        + '<span class="k">${T("Produit")}</span><span class="v">' + esc(x.produitNom) + '</span>'
        + '<span class="k">${T("Photothèque")}</span><span class="v">' + '${T("{0} photos copiées, liées au produit")}'.replace('{0}', String(x.photosCopiees || 0)) + '</span></div>'
        + '<div class="actions-d"><button type="button" class="prim" data-a="ouvrirProduit">${T("Ouvrir le produit")}</button>'
        + '<button type="button" data-a="retirer">${T("Retirer de la liste")}</button></div>';
      return h + '</div>';
    }
    if (x.statut === 'plusieurs') {
      h += '<h2>${T("Plusieurs produits correspondent")}</h2><div class="aide">' + '${T("Recherche : « {0} ». Choisissez le bon produit.")}'.replace('{0}', esc(x.recherche)) + '</div>'
        + '<div class="cands">' + (x.candidats || []).slice(0, 6).map(function(c, i){
            return '<button type="button" class="cand" data-cand="' + i + '">' + img(c.image) + '<b>' + esc(c.titre) + '</b><small>'
              + (c.prix != null ? esc(argent(c.prix)) + ' · ' : '') + Math.round((c.score || 0) * 100) + ' %</small></button>'; }).join('') + '</div>'
        + '<div class="actions-d"><button type="button" data-a="retirer">${T("Retirer")}</button></div>';
      return h + '</div>';
    }
    if (x.statut === 'introuvable' || x.statut === 'erreur') {
      h += '<h2>' + (x.statut === 'erreur' ? '${T("La recherche a échoué")}' : '${T("Aucun produit trouvé")}') + '</h2>'
        + '<div class="aide">' + '${T("Recherche : « {0} ».")}'.replace('{0}', esc(x.recherche)) + (x.motif ? ' ' + esc(expliquer({ motif: x.motif })) : '') + '</div>'
        + '<label class="aide" for="d-autre">${T("Chercher autrement (un autre nom, la référence du fournisseur) :")}</label>'
        + '<input id="d-autre" value="' + esc(x.recherche) + '">'
        + '<div class="actions-d"><button type="button" class="prim" data-a="rechercher"' + (OCCUPE ? ' disabled' : '') + '>${T("Chercher de nouveau")}</button>'
        + '<button type="button" data-a="retirer">${T("Retirer")}</button></div>';
      return h + '</div>';
    }
    var photos = fi.photos || [];
    var cats = categoriesDe(fournisseur(x.fournisseurId));
    h += '<div class="d-tete"><input id="d-nom" maxlength="160" value="' + esc(fi.nom) + '" aria-label="${T("Nom du produit")}"></div>'
      + '<div class="d-src" title="' + esc(fi.url) + '">' + (fi.ref ? '${T("réf.")} ' + esc(fi.ref) + ' · ' : '') + esc(fi.url) + '</div>'
      + '<div class="aide">${T("Cliquez les photos à garder, dans l’ordre (1 = photo principale, 5 au plus).")}</div>'
      + '<div class="galerie">' + (fi.images || []).slice(0, 12).map(function(u){
          var n = photos.indexOf(u);
          return '<button type="button" class="ph' + (n >= 0 ? ' on' : '') + '" data-ph="' + esc(u) + '" aria-pressed="' + (n >= 0) + '">' + img(u) + (n >= 0 ? '<span class="n">' + (n + 1) + '</span>' : '') + '</button>';
        }).join('') + '</div>'
      + '<div class="lignes">'
      + '<span class="k">${T("Catégorie")}</span><span class="v"><select id="d-cat" aria-label="${T("Catégorie")}"><option value="">${T("Choisir…")}</option>'
      + cats.map(function(c){ return '<option value="' + esc(c.cle) + '"' + (c.cle === x.categorie ? ' selected' : '') + '>' + esc(c.libelle) + '</option>'; }).join('') + '</select>'
      + ' <label style="margin-left:.6rem;color:var(--tx2)"><input type="checkbox" id="d-ligne"' + (x.enLigne ? ' checked' : '') + '> ${T("Mettre en ligne")}</label></span>'
      + lignesPrix(fi)
      + '<span class="k">${T("Tailles")}</span><span class="v">' + jetons(fi.tailles, fi.taillesInconnues) + '</span>'
      + '<span class="k">${T("Couleurs")}</span><span class="v">' + jetons(fi.couleurs, fi.couleursInconnues) + '</span>'
      + '<span class="k">${T("Composition")}</span><span class="v">' + (fi.composition ? esc(fi.composition) + (fi.compositionSure ? '' : ' <span class="jet inc">${T("à vérifier")}</span>') : '—') + '</span>'
      + '</div>'
      + (fi.description ? '<div class="desc">' + esc(fi.description) + '</div>' : '')
      + '<div class="aide">${T("À compléter dans la fiche produit :")}</div><div class="manque">'
      + (x.manquants || []).map(function(m){ return '<span>' + (MANQUE[m] || esc(m)) + '</span>'; }).join('') + '</div>'
      + '<div class="actions-d"><button type="button" class="prim" data-a="creer"' + (CTX.peutCreer ? '' : ' disabled') + '>${T("Compléter et créer le produit")}</button>'
      + '<button type="button" data-a="retirer">${T("Retirer")}</button></div>';
    return h + '</div>';
  }
  /* (8.33.2) Le prix du fournisseur dans sa devise, le taux appliqué (et sa date : un coût se vérifie), le coût
     chez nous et le prix proposé, puis les paliers de quantité — le plus bas signalé. Et la traduction. */
  function lignesPrix(fi){
    var dv = fi.devise && fi.devise !== 'CAD' ? fi.devise : '';
    var h = '<span class="k">${T("Prix du fournisseur")}</span><span class="v">' + esc(montant(fi.prixFournisseur, dv));
    if (dv && fi.taux) h += ' · ' + '${T("taux {0} (Banque du Canada, {1})")}'.replace('{0}', esc(szArgentNombre(fi.taux, 4))).replace('{1}', esc(fi.tauxDate || ''));
    else if (dv && fi.prixFournisseur != null) h += ' <span class="jet inc">${T("taux indisponible : coût à saisir")}</span>';
    h += '</span><span class="k">${T("Coût / prix proposé")}</span><span class="v">' + esc(argent(fi.cout)) + ' → <b>' + esc(argent(fi.prix)) + '</b></span>';
    if (fi.paliers && fi.paliers.length) {
      h += '<span class="k">${T("Prix en quantité")}</span><span class="v">' + fi.paliers.map(function(p){
        var q = p.max ? p.min + '–' + p.max : '≥ ' + p.min;
        return '<span class="jet">' + esc(q) + ' : ' + esc(montant(p.prix, dv)) + '</span>';
      }).join('') + (fi.alerte ? ' <span class="alerte-q">' + alerteTexte(fi.alerte, dv) + '</span>' : '') + '</span>';
    }
    if (fi.traduit) {
      var LG = { zh: '${T("du chinois")}', ja: '${T("du japonais")}', ko: '${T("du coréen")}', en: '${T("de l’anglais")}' };
      h += '<span class="k">${T("Traduction")}</span><span class="v" title="' + esc(fi.nomOriginal || '') + '">'
        + '${T("Traduit {0} — original : « {1} »")}'.replace('{0}', LG[fi.traduit] || '').replace('{1}', esc(fi.nomOriginal || '')) + '</span>';
    }
    return h;
  }
  function jetons(ok, inc){
    var h = (ok || []).map(function(t){ return '<span class="jet">' + esc(t) + '</span>'; }).join('')
      + (inc || []).map(function(t){ return '<span class="jet inc" title="${T("Absente de votre référentiel")}">' + esc(t) + ' ?</span>'; }).join('');
    return h || '—';
  }

  /* ══ LES CARTES DE RÉSULTAT ET LEURS PRIX (8.33.2) ═════════════════════ */
  /* Un montant dans la devise du fournisseur : « 6,92 USD » ; le nôtre garde son symbole (szArgent). */
  function montant(n, dv){
    if (n == null) return '—';
    return (!dv || dv === 'CAD') ? szArgent(n) : szArgentNombre(n, 2) + ' ' + dv;
  }
  function pct(n){ return String(Math.round(Number(n) || 0)); }
  function imCarte(c){
    var p = Math.round((c.score || 0) * 100);
    return img(c.image) + '<span class="sc' + (p >= 75 ? ' haut' : '') + '">' + p + ' %</span>';
  }
  /* Le titre traduit (chinois, anglais… → français) ; l original reste lisible au survol et en petit dessous. */
  function tiCarte(c){
    if (c.titreFr) return '<b title="' + esc(c.titre) + '">' + esc(c.titreFr) + '</b>';
    return '<b title="' + esc(c.titre) + '">' + esc(c.titre) + '</b>';
  }
  function alerteTexte(a, dv){
    return '${T("Moins cher en quantité : {0} dès {1} pièces (−{2} %)")}'.replace('{0}', esc(montant(a.prix, dv))).replace('{1}', String(a.min)).replace('{2}', pct(a.economie));
  }
  function pxCarte(c){
    var x = EST[c.url];
    var brut = (c.prix != null) ? '<span class="pf">' + esc(argent(c.prix)) + '</span>' : '';
    if (!x || x.etat === 'lecture') return brut + '<span class="lec">${T("Lecture des prix…")}</span>';
    if (x.etat !== 'ok' || !x.e || x.e.prixFournisseur == null) return brut || '${T("Prix non affiché")}';
    var e = x.e, h = '';
    if (e.prix != null) h += '<div class="pv"><span class="pv-l">${T("Vente proposée")}</span><span class="pv-v">' + esc(argent(e.prix)) + '</span></div>';
    h += '<div class="kv"><span>${T("Fournisseur")}</span><span>' + esc(montant(e.prixFournisseur, e.devise)) + '</span>';
    if (e.devise !== 'CAD') h += '<span>${T("Coût chez nous")}</span><span>' + (e.cout != null ? '≈ ' + esc(argent(e.cout)) : '${T("à saisir")}') + '</span>';
    if (e.qteMin > 1) h += '<span>${T("Minimum")}</span><span>' + '${T("{0} pièces")}'.replace('{0}', String(e.qteMin)) + '</span>';
    h += '</div>';
    if (e.devise !== 'CAD' && e.cout == null) h += '<span class="lec">${T("Taux de change indisponible : coût à saisir")}</span>';
    if (e.alerte) h += '<div class="qte" title="' + esc(alerteTexte(e.alerte, e.devise)) + '">'
      + '${T("−{0} % dès {1} pièces · {2}")}'.replace('{0}', pct(e.alerte.economie)).replace('{1}', String(e.alerte.min)).replace('{2}', esc(montant(e.alerte.prix, e.devise))) + '</div>';
    return h;
  }
  /* Une carte se complète SANS redessiner la fenêtre (la saisie en cours et la page affichée ne bougent pas). */
  function majCarte(r, i){
    var c = r.candidats[i]; if (!c) return;
    var a = corps.querySelector('[data-px="' + i + '"]'); if (a) a.innerHTML = pxCarte(c);
    var b = corps.querySelector('[data-ti="' + i + '"]'); if (b) b.innerHTML = tiCarte(c);
    var m = corps.querySelector('[data-im="' + i + '"]'); if (m && c.image && !m.querySelector('img')) m.innerHTML = imCarte(c);
  }
  function enrichir(f, r){
    var gen = ++GEN;
    var l = r.candidats.slice(0, 8);
    if (!l.length) return;
    // Les titres qui ne sont pas en français : traduits en un seul appel (le site ne traduit que ceux-là).
    appeler('import:traduire', [{ textes: l.map(function(c){ return c.titre; }), vers: 'fr', siEtranger: true }]).then(function(t){
      if (gen !== GEN || !t || !t.ok) return;
      (t.traductions || []).forEach(function(tr, i){ if (tr && l[i]) { l[i].titreFr = tr; majCarte(r, i); } });
    });
    var i = 0;
    function suivant(){
      if (gen !== GEN || i >= l.length) return;
      var k = i++, c = l[k];
      if (EST[c.url] && EST[c.url].etat === 'ok') { majCarte(r, k); suivant(); return; }
      EST[c.url] = { etat: 'lecture' };
      lireFiche(f, c).then(function(e){
        if (gen !== GEN) return;
        if (!e || !e.ok || !e.fiche) { EST[c.url] = { etat: 'echec' }; majCarte(r, k); suivant(); return; }
        var b = e.fiche;
        if (!c.image && b.images && b.images[0]) c.image = b.images[0];
        return appeler('import:estimer', [{ fournisseurId: f.id, items: [{ prix: b.prix, devise: b.devise || 'CAD', paliers: b.paliers || [] }] }]).then(function(s){
          EST[c.url] = (s && s.ok && s.estimations && s.estimations[0]) ? { etat: 'ok', e: s.estimations[0] } : { etat: 'echec' };
          if (gen === GEN) { majCarte(r, k); suivant(); }
        });
      }, function(){ EST[c.url] = { etat: 'echec' }; majCarte(r, k); suivant(); });
    }
    suivant();
  }
  /* Chercher sur le site ; RIEN trouvé avec le nom tapé (souvent en français, sur un site anglais) : le nom est
     traduit en anglais et cherché une seconde fois. Rend { r, en } — en : le nom anglais, s il a servi. */
  function chercherSite(f, nom){
    return P.importFournisseur.chercher({ site: f.site, recherche: f.recherche, nom: nom }).then(function(r){
      if (!r || !r.ok || (r.candidats || []).length) return { r: r, en: '' };
      return appeler('import:traduire', [{ textes: [nom], vers: 'en' }]).then(function(t){
        var en = (t && t.ok && t.traductions && t.traductions[0]) ? String(t.traductions[0]).trim() : '';
        if (!en || en.length < 2 || en.toLowerCase() === nom.toLowerCase()) return { r: r, en: '' };
        return P.importFournisseur.chercher({ site: f.site, recherche: f.recherche, nom: en.slice(0, 120) }).then(function(r2){
          return (r2 && r2.ok && (r2.candidats || []).length) ? { r: r2, en: en } : { r: r, en: '' };
        });
      });
    });
  }

  /* ══ LES DONNÉES ═══════════════════════════════════════════════════════ */
  function charger(){
    appeler('import:contexte').then(function(c){
      if (!c || !c.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(c)) + '</div>'; dire(expliquer(c), 'err'); return; }
      CTX = c;
      if (!FID || !fournisseur()) { var pf = (c.fournisseurs || []).filter(function(f){ return f.configure; })[0] || (c.fournisseurs || [])[0]; FID = pf ? pf.id : ''; }
      chargerFiches();
    });
  }
  function chargerFiches(){
    return appeler('import:fiches', ['']).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      FICHES = r.fiches || [];
      if (SEL && !fiche(SEL)) SEL = '';
      dessiner();
    });
  }
  function remplacer(x){
    var i = -1; FICHES.forEach(function(y, k){ if (y.id === x.id) i = k; });
    if (i >= 0) FICHES[i] = x; else FICHES.unshift(x);
  }
  function avance(t){ var a = document.getElementById('avance'); if (a) a.textContent = t || ''; }
  function catChoisie(f){
    var c = CAT[f.id] || '';
    if (!c) { dire('${T("Choisissez d’abord la catégorie : elle sera celle des fiches préparées.")}', 'att'); var s = document.getElementById('o-cat'); if (s) s.focus(); }
    return c;
  }
  function liste(cands){ return (cands || []).map(function(c){ return { url: c.url, titre: c.titre, image: c.image, prix: c.prix, score: c.score }; }); }

  /* ══ RECHERCHER (un nom) : on REGARDE les résultats, rien n est écrit ══ */
  function chercher(){
    var f = fournisseur(); if (!f || !f.configure || OCCUPE) return;
    if (!P.importFournisseur) { dire('${T("Cette version de l’application ne sait pas lire un site : mettez-la à jour.")}', 'err'); return; }
    garderSaisies();
    var nom = String(NOM || '').trim();
    if (nom.length < 2) { dire('${T("Tapez le nom du produit à chercher.")}', 'att'); var o = document.getElementById('o-nom'); if (o) o.focus(); return; }
    OCCUPE = true; GEN++; RES[f.id] = { nom: nom, candidats: [], enCours: true }; dessiner();
    chercherSite(f, nom).then(function(o){
      var r = o.r;
      OCCUPE = false;
      RES[f.id] = (r && r.ok) ? { nom: nom, en: o.en, candidats: r.candidats || [] } : { nom: nom, candidats: [], motif: (r && r.motif) || 'echec' };
      dessiner();
      var on = document.getElementById('o-nom'); if (on) { on.focus(); on.select(); }
      if (RES[f.id].candidats.length) enrichir(f, RES[f.id]);
    }, function(){ OCCUPE = false; RES[f.id] = { nom: nom, candidats: [], motif: 'echec' }; dessiner(); });
  }
  /* « Préparer la fiche » sur un résultat : la fiche est lue chez le fournisseur et devient une fiche d import. */
  function preparer(i){
    var f = fournisseur(); var r = RES[f && f.id]; if (!f || !r || OCCUPE) return;
    var c = r.candidats[i]; if (!c) return;
    var cat = catChoisie(f); if (!cat) return;
    OCCUPE = true; dessiner(); dire('${T("Lecture de la fiche du fournisseur…")}');
    lireFiche(f, c).then(function(e){
      if (!e || !e.ok) { OCCUPE = false; dessiner(); dire(expliquer(e), 'err'); return; }
      return appeler('import:preparer', [{ fournisseurId: f.id, recherche: r.nom, categorie: cat, enLigne: EN_LIGNE, brut: e.fiche, candidats: liste(r.candidats) }]).then(function(p){
        OCCUPE = false;
        if (!p || !p.ok) { dessiner(); dire(expliquer(p), 'err'); return; }
        remplacer(p.fiche); PREP[c.url] = p.fiche.id; dessiner();
        dire('${T("Fiche prête : complétez-la dans l’onglet À compléter.")}', 'bon');
      });
    });
  }
  function lireFiche(f, c){
    if (c.brut) return Promise.resolve({ ok: true, fiche: c.brut });
    return P.importFournisseur.extraire({ url: c.url, site: f.site });
  }

  /* ══ PLUSIEURS NOMS : un nom après l autre (le site du fournisseur n est pas pressé) ══ */
  function decider(cands){
    if (!cands.length) return null;
    var a = cands[0], b = cands[1];
    if (a.score >= 0.75 && (!b || b.score <= a.score - 0.08)) return a;
    return null;
  }
  function chercherUn(f, nom, idExistant, cat){
    return chercherSite(f, nom).then(function(o){
      var r = o.r;
      var base = { id: idExistant || '', fournisseurId: f.id, recherche: nom, categorie: cat || (fiche(idExistant) || {}).categorie || '', enLigne: EN_LIGNE };
      if (!r || !r.ok) return appeler('import:preparer', [Object.assign(base, { statut: 'erreur', motif: (r && r.motif) || 'echec' })]);
      var cands = r.candidats || [];
      if (!cands.length) return appeler('import:preparer', [Object.assign(base, { statut: 'introuvable', candidats: [] })]);
      var net = decider(cands);
      if (!net) return appeler('import:preparer', [Object.assign(base, { statut: 'plusieurs', candidats: liste(cands) })]);
      return lireFiche(f, net).then(function(e){
        if (!e.ok) return appeler('import:preparer', [Object.assign(base, { statut: 'erreur', motif: e.motif, candidats: liste(cands) })]);
        return appeler('import:preparer', [Object.assign(base, { brut: e.fiche, candidats: liste(cands) })]);
      });
    });
  }
  function chercherTous(){
    var f = fournisseur(); if (!f || !f.configure || OCCUPE) return;
    if (!P.importFournisseur) { dire('${T("Cette version de l’application ne sait pas lire un site : mettez-la à jour.")}', 'err'); return; }
    var cat = catChoisie(f); if (!cat) return;
    garderSaisies();
    var noms = String(NOMS || '').split(String.fromCharCode(10)).map(function(s){ return s.trim(); }).filter(function(s){ return s.length >= 2; });
    var vus = {}; noms = noms.filter(function(n){ var k = n.toLowerCase(); if (vus[k]) return false; vus[k] = 1; return true; });
    if (!noms.length) { dire('${T("Tapez au moins un nom de produit.")}', 'att'); return; }
    if (noms.length > 25) { dire('${T("25 noms au plus par recherche.")}', 'att'); return; }
    OCCUPE = true; ARRET = false; dessiner();
    var i = 0, nets = 0, choix = 0, rates = 0;
    function suivant(){
      if (ARRET || i >= noms.length) {
        OCCUPE = false;
        if (!ARRET) NOMS = '';
        dessiner();
        dire('${T("Recherche terminée : {0} à vérifier, {1} à choisir, {2} sans résultat.")}'.replace('{0}', nets).replace('{1}', choix).replace('{2}', rates), rates ? 'att' : 'bon');
        return;
      }
      var nom = noms[i++];
      var txt = '${T("{0} sur {1} — {2}…")}'.replace('{0}', i).replace('{1}', noms.length).replace('{2}', nom);
      avance(txt);
      chercherUn(f, nom, '', cat).then(function(r){
        if (r && r.ok && r.fiche) {
          remplacer(r.fiche);
          if (r.fiche.statut === 'a_verifier') nets++; else if (r.fiche.statut === 'plusieurs') choix++; else rates++;
        } else { rates++; dire(expliquer(r), 'err'); }
        dessiner(); avance(txt);
        suivant();
      }, function(){ rates++; suivant(); });
    }
    suivant();
  }

  /* ══ LES FICHES ════════════════════════════════════════════════════════ */
  function rechercher(){
    var x = fiche(SEL); if (!x || OCCUPE) return;
    var f = fournisseur(x.fournisseurId);
    if (!f || !f.configure) { dire(MOTIFS.fournisseur_sans_site, 'err'); return; }
    var nom = String((document.getElementById('d-autre') || {}).value || '').trim();
    if (nom.length < 2) { dire(MOTIFS.nom_requis, 'att'); return; }
    OCCUPE = true; dire('${T("Recherche…")}');
    chercherUn(f, nom, x.id, x.categorie).then(function(r){
      OCCUPE = false;
      if (r && r.ok && r.fiche) { remplacer(r.fiche); dire(''); } else dire(expliquer(r), 'err');
      dessiner();
    });
  }
  function choisirCandidat(i){
    var x = fiche(SEL); if (!x || OCCUPE) return;
    var c = (x.candidats || [])[i]; if (!c) return;
    var f = fournisseur(x.fournisseurId); if (!f) return;
    OCCUPE = true; dire('${T("Lecture de la fiche du fournisseur…")}');
    P.importFournisseur.extraire({ url: c.url, site: f.site }).then(function(e){
      if (!e || !e.ok) { OCCUPE = false; dire(expliquer(e), 'err'); return; }
      return appeler('import:preparer', [{ id: x.id, fournisseurId: x.fournisseurId, recherche: x.recherche, brut: e.fiche, candidats: x.candidats }]).then(function(r){
        OCCUPE = false;
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        remplacer(r.fiche); dire(''); dessiner();
      });
    });
  }
  function modifier(ch){
    var x = fiche(SEL); if (!x) return Promise.resolve();
    return appeler('import:modifier', [x.id, ch]).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
      remplacer(r.fiche); dessiner();
    });
  }
  function basculerPhoto(u){
    var x = fiche(SEL); if (!x || !x.fiche) return;
    var l = (x.fiche.photos || []).slice();
    var i = l.indexOf(u);
    if (i >= 0) l.splice(i, 1);
    else { if (l.length >= 5) { dire(MOTIFS.photos_trop, 'att'); return; } l.push(u); }
    x.fiche.photos = l; dessiner();   // tout de suite à l écran ; le nuage suit
    modifier({ photos: l });
  }
  function retirer(){
    var x = fiche(SEL); if (!x) return;
    szConfirmer({ titre: '${T("Retirer la fiche d’import")}',
      texte: x.statut === 'creee' ? '${T("La fiche quitte la liste. Le produit créé et ses photos ne bougent pas.")}' : '${T("La fiche et ce qui a été lu chez le fournisseur sont retirés. Rien n’a été créé.")}',
      oui: '${T("Retirer")}' }).then(function(ok){
      if (!ok) return;
      appeler('import:retirer', [x.id]).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        FICHES = FICHES.filter(function(y){ return y.id !== x.id; });
        Object.keys(PREP).forEach(function(k){ if (PREP[k] === x.id) delete PREP[k]; });
        SEL = ''; dessiner();
      });
    });
  }
  function creer(){
    var x = fiche(SEL); if (!x) return;
    if (!x.categorie) { dire(MOTIFS.import_sans_categorie, 'att'); var dc = document.getElementById('d-cat'); if (dc) dc.focus(); return; }
    if (!(x.fiche && x.fiche.photos && x.fiche.photos.length)) { dire('${T("Gardez au moins une photo (la photo principale est obligatoire).")}', 'att'); return; }
    var nom = String((document.getElementById('d-nom') || {}).value || '').trim();
    var avant = (nom && nom !== x.fiche.nom) ? modifier({ nom: nom }) : Promise.resolve();
    avant.then(function(){
      appeler('import:ouvrir', [x.id]).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        dire('${T("Fiche produit ouverte : complétez-la puis enregistrez. Cette liste se met à jour au retour.")}', 'bon');
      });
    });
  }

  /* ══ LES GESTES ════════════════════════════════════════════════════════ */
  function choisirFournisseur(id){ if (id === FID) return; FID = id; ONGLET = 'chercher'; SEL = ''; NOM = ''; dessiner(); }
  corps.onclick = function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var fo = t.closest('[data-f]'); if (fo) { choisirFournisseur(fo.getAttribute('data-f')); return; }
    var og = t.closest('[data-onglet]'); if (og) { ONGLET = og.getAttribute('data-onglet'); SEL = ''; dessiner(); return; }
    var li = t.closest('.fi[data-id]'); if (li) { SEL = li.getAttribute('data-id'); dessiner(); return; }
    var ph = t.closest('[data-ph]'); if (ph) { basculerPhoto(ph.getAttribute('data-ph')); return; }
    var cd = t.closest('[data-cand]'); if (cd) { choisirCandidat(parseInt(cd.getAttribute('data-cand'), 10) || 0); return; }
    var pr = t.closest('[data-prep]'); if (pr && !pr.disabled) { preparer(parseInt(pr.getAttribute('data-prep'), 10) || 0); return; }
    var vo = t.closest('[data-voir]'); if (vo) { SEL = vo.getAttribute('data-voir'); ONGLET = 'attente'; dessiner(); return; }
    var a = t.closest('[data-a]'); if (!a || a.disabled) return;
    var k = a.getAttribute('data-a');
    if (k === 'chercher') chercher();
    else if (k === 'chercherTous') chercherTous();
    else if (k === 'multi') { MULTI = !MULTI; dessiner(); }
    else if (k === 'arreter') { ARRET = true; dire('${T("Arrêt après le produit en cours…")}', 'att'); }
    else if (k === 'rechercher') rechercher();
    else if (k === 'retirer') retirer();
    else if (k === 'creer') creer();
    else if (k === 'config') appeler('import:ouvrirFournisseur', [FID]).then(function(r){ if (!r || !r.ok) dire(expliquer(r), 'err'); else dire('${T("Réglez le site à l’étape « Import de produits », enregistrez : cette fenêtre se met à jour au retour.")}'); });
    else if (k === 'nouveauF') appeler('import:ouvrirFournisseur', ['']).then(function(r){ if (!r || !r.ok) dire(expliquer(r), 'err'); else dire('${T("Enregistrez le nouveau fournisseur avec son site : il apparaîtra dans la liste au retour.")}'); });
    else if (k === 'ouvrirProduit') { var x = fiche(SEL); if (x) appeler('produits:ouvrir', [x.produitId]).then(function(r){ if (!r || !r.ok) dire(expliquer(r), 'err'); }); }
  };
  corps.addEventListener('keydown', function(ev){
    var t = ev.target; if (!t) return;
    if (t.id === 'o-nom' && ev.key === 'Enter') { ev.preventDefault(); chercher(); return; }
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var fo = t.closest && t.closest('[data-f]'); if (fo) { ev.preventDefault(); choisirFournisseur(fo.getAttribute('data-f')); return; }
    var li = t.closest && t.closest('.fi[data-id]');
    if (li) { ev.preventDefault(); SEL = li.getAttribute('data-id'); dessiner(); }
  });
  corps.addEventListener('input', function(ev){
    var t = ev.target; if (!t || t.id !== 'o-ffiltre') return;
    FILTRE_F = t.value;
    var pos = t.selectionStart; dessiner();
    var n = document.getElementById('o-ffiltre'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} }
  });
  corps.addEventListener('change', function(ev){
    var t = ev.target; if (!t) return;
    if (t.id === 'o-cat') CAT[FID] = t.value;
    else if (t.id === 'o-ligne') EN_LIGNE = !!t.checked;
    else if (t.id === 'd-cat') modifier({ categorie: t.value });
    else if (t.id === 'd-ligne') modifier({ enLigne: !!t.checked });
    else if (t.id === 'd-nom') { var v = String(t.value || '').trim(); if (v) modifier({ nom: v }); }
  });
  // Au retour (une fiche produit vient d être créée, un fournisseur réglé) : on relit.
  window.szRevenir = function(){ if (!OCCUPE) charger(); };
  window.addEventListener('focus', function(){ if (!OCCUPE && CTX) { garderSaisies(); charger(); } });
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); P.fermer(); } });
  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageImport };
