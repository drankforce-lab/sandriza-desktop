'use strict';

/*
 * FENÊTRE « ATELIER DE CRÉATION » — NATIVE (2026-10-16)
 * =============================================================================
 * Sa demande : « un moteur et éditeur pour m'aider dans la création de vêtement
 * et l'enregistrement de modèle et l'impression aussi dans les différents
 * formats ». Esquisses approuvées (« go code le module ») :
 * https://claude.ai/artifact/P9nkurdJFtCvvSTgojfrae
 *
 * LOT 1 : la BIBLIOTHÈQUE des modèles et le MOTEUR — créer un
 * modèle depuis un patron de base (robe, chemisier, jupe, pantalon), régler ses
 * options, son tableau de tailles et ses aisances, voir le patron se tracer en
 * direct, dans une taille ou toutes emboîtées, et l'enregistrer (versions).
 * LOT 2 (7.41.0) : l'ÉDITEUR DE PATRON — une toile en cm (zoom, règle, taille
 * réelle) ; glisser points, poignées de courbe, crans, pinces et droit-fil ;
 * ajouter un point, rendre un bord droit ou courbe, poser un cran ou une pince,
 * mesurer ; aimantation ; couture par bord ; pièces ajoutées, dupliquées,
 * supprimées ; historique (Ctrl+Z / Ctrl+Y) ; enregistrer une version.
 * LOT 2b (7.42.0) : la GRADATION des retouches (règle par point et par taille,
 * onglet Gradation, calque « Toutes les tailles »), les NOMS de bords, les
 * ASSEMBLAGES (écart, Égaliser) et la restauration des VERSIONS. Les pièces
 * passent par atelier:preparer à l'ouverture.
 * LOT 3 (7.43.0) : IMPRIMER ET EXPORTER — la fenêtre choisit la destination et
 * les réglages, montre l'aperçu que le site dessine (atelier:exporter, apercu),
 * fait changer le HTML en PDF par la coquille (P.documentPdf, taille de page
 * exacte) et enregistre dans le dossier des exports (P.enregistrerExport).
 * LOT 4 (7.44.0) : l'APERÇU 3D — le site calcule mannequin et vêtement
 * (atelier:apercu3d, des tubes d'anneaux) ; la fenêtre les maille et les PEINT
 * en 3D logicielle sur un canevas 2D (projection, ombrage, tri des faces) ; la
 * souris fait tourner l'objet en direct (sa demande). Aperçu géométrique : le
 * tombé du tissu n'est pas simulé, et la fenêtre le dit.
 * LOT 5 (7.45.0) : le MOTIF ET L'IMPRESSION TEXTILE — placé sur une pièce
 * (dépliée au pli) ou au mètre (raccords) ; calques image / texte / forme
 * placés à la souris ; le site nettoie, contrôle et fabrique les sorties ;
 * la fenêtre rastérise le PNG et y inscrit la résolution (bloc pHYs).
 *
 * ⚠ LA FENÊTRE NE TRACE RIEN (sauf le geste de l'éditeur : un point suit la
 * souris ; la ligne de coupe, les longueurs et le tissu reviennent du site par
 * atelier:analyser, et ce qui s'enregistre est renettoyé par le site). Toute la géométrie (pièces, pinces, crans, tête
 * de manche, gradation par taille, tissu estimé) vient du site (assets/js/
 * atelier.js, op atelier:apercu) ; la fenêtre ne fait que DESSINER les contours
 * reçus, en centimètres, à l'échelle de sa zone.
 *
 * ⚠ ON N'ENVOIE JAMAIS UN TEXTE TRADUIT : bases, catégories, états, options et
 * mesures voyagent par leur CLÉ ; la fenêtre les met en mots avec ses propres
 * libellés (src/langue/atelier.js).
 *
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script : elle
 * vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU, SEP_DEC } = require('./socle.js');
const T = require('../langue').tr('atelier');

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
#corps{overflow:hidden}
input,select,textarea,button{font:inherit;color:var(--tx)}
input,select,textarea{background:var(--f-champ);border:1px solid var(--v16);border-radius:8px;padding:.32rem .5rem;min-width:0}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--or)}
button{cursor:pointer;background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.32rem .7rem}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#17202c;font-weight:600}
button.danger{border-color:rgba(239,68,68,.55);color:var(--tx-err2)}
button.mini{padding:.12rem .5rem;font-size:.76rem}
.ed-seg button{border:none}
.cx-barre .rf-rch{width:18rem;flex:0 0 auto}
.vide{padding:1.4rem .8rem;text-align:center;color:var(--tx2);font-size:.86rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}

/* ── La bibliothèque ── */
.at-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(11.5rem,1fr));grid-auto-rows:15.5rem;gap:.8rem;align-content:start}
.at-carte{display:flex;flex-direction:column;border:1px solid var(--sz-bord);border-radius:14px;background:var(--f-carte2);overflow:hidden;
  cursor:pointer;text-align:left;padding:0;min-width:0}
.at-carte:hover{border-color:rgba(var(--or-rgb),.6)}
.at-carte.on{border:2px solid var(--or)}
.at-carte .vig{flex:1 1 auto;min-height:0;background:#EFE8DD;color:#1C1B18;display:flex;align-items:center;justify-content:center}
.at-carte .vig svg{display:block}
.at-carte .tx{padding:.5rem .7rem}
.at-carte .tx b{display:block;font-size:.86rem;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.at-carte .tx span{display:block;font-size:.74rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.at-carte.nouveau{border-style:dashed;background:transparent;align-items:center;justify-content:center;gap:.4rem;padding:1rem;text-align:center;color:var(--tx2)}
.at-carte.nouveau b{color:var(--tx);font-size:.9rem}
.at-puce{display:inline-flex;align-items:center;font-size:.72rem;padding:.1rem .6rem;border-radius:999px;border:1px solid var(--v16);white-space:nowrap}
.at-puce.pret{border-color:color-mix(in srgb,var(--tx-ok) 40%,transparent);color:color-mix(in srgb,var(--tx-ok) 80%,var(--tx))}
.at-puce.brouillon{border-color:color-mix(in srgb,var(--tx-att) 40%,transparent);color:color-mix(in srgb,var(--tx-att) 80%,var(--tx))}
.at-puce.base{border-color:var(--or);color:var(--tx)}
.at-tailles{display:flex;flex-wrap:wrap;gap:.35rem}
.at-gestes{margin-top:auto;display:flex;gap:.5rem;flex-wrap:wrap}
.at-gestes button{flex:1 1 auto}

/* ── Le modèle (moteur) ── */
.at-trois{display:grid;grid-template-columns:19rem minmax(0,1fr) 23rem;gap:.9rem}
.cx>.at-trois{flex:1 1 0;min-height:0}
.at-bases{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem}
.at-base{display:flex;align-items:center;gap:.55rem;padding:.45rem .55rem;border-radius:10px;text-align:left;background:var(--f-carte2);min-width:0}
.at-base.on{border:2px solid var(--or)}
.at-base svg{width:1.6rem;height:2rem;flex:0 0 auto}
.at-base b{display:block;font-size:.82rem}
.at-champs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem .6rem}
.at-champs label{display:flex;flex-direction:column;gap:.2rem;font-size:.74rem;color:var(--tx2);min-width:0}
.at-champs label.large{grid-column:1/-1}
.at-champs input,.at-champs select,.at-champs textarea{font-size:.84rem;width:100%}
.at-champs textarea{resize:none;height:3.4em}
table.at-tab{width:100%;border-collapse:collapse;font-size:.8rem;font-variant-numeric:tabular-nums}
.at-tab th{font-weight:600;color:var(--tx2);text-align:center;padding:.2rem .25rem;white-space:nowrap}
.at-tab th:first-child,.at-tab td:first-child{text-align:left}
.at-tab td{padding:.12rem .25rem;border-top:1px solid var(--v055)}
.at-tab input[type=text]{width:4.2rem;text-align:right;padding:.16rem .35rem;font-size:.8rem}
.at-tab th label{display:inline-flex;align-items:center;gap:.25rem;cursor:pointer}
.at-tab th.base{color:var(--tx-or)}
.at-ais{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}
.at-ais label{display:flex;flex-direction:column;gap:.2rem;font-size:.74rem;color:var(--tx2)}
.cx-carte>.at-apercu{flex:1 1 0;min-height:0}
.at-apercu{border-radius:12px;background:#F3EEE5;color:#1C1B18;display:flex;align-items:center;justify-content:center;overflow:hidden}
.at-apercu svg{display:block}
.at-ligne{display:flex;justify-content:space-between;gap:.6rem;font-size:.8rem}
.at-ligne span:first-child{color:var(--tx2)}
.at-ligne span:last-child{font-variant-numeric:tabular-nums;text-align:right}

/* ── L éditeur de patron (lot 2) ── */
.ed-cadre{display:grid;grid-template-columns:auto minmax(0,1fr) 21rem;gap:.7rem;min-height:0}
.cx>.ed-cadre{flex:1 1 0}
.ed-outils{display:flex;flex-direction:column;gap:.3rem;padding:.4rem;border:1px solid var(--sz-bord);border-radius:12px;background:var(--f-carte2);overflow:auto}
.ed-outil{display:flex;flex-direction:column;align-items:center;gap:.15rem;padding:.4rem .3rem;font-size:.72rem;min-width:4.6rem;border-radius:9px;background:transparent;border:1px solid transparent}
.ed-outil svg{width:1.3rem;height:1.3rem}
.ed-outil.on{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
.ed-outils hr{width:100%;border:none;border-top:1px solid var(--v08);margin:.2rem 0}
.ed-toile{position:relative;border-radius:12px;background:#F3EEE5;color:#1C1B18;overflow:hidden;min-height:0;user-select:none}
.ed-toile svg{display:block;position:absolute;left:0;top:0}
.ed-toile.o-sel{cursor:default}.ed-toile.o-point,.ed-toile.o-courbe,.ed-toile.o-cran,.ed-toile.o-pince,.ed-toile.o-mesure{cursor:crosshair}
.ed-toile.glisse{cursor:grabbing}
.ed-coin{position:absolute;right:.6rem;bottom:.5rem;font-size:.76rem;color:#3F3A32;background:rgba(243,238,229,.92);padding:.1rem .45rem;border-radius:6px;font-variant-numeric:tabular-nums;pointer-events:none}
.ed-panneau{min-height:0;overflow:auto}
.ed-panneau .ed-seg{margin-bottom:.6rem;display:flex;flex-wrap:wrap}
.ed-panneau .ed-seg button{padding:.3rem .55rem;font-size:.8rem}
.ed-bas{display:flex;flex-wrap:wrap;align-items:center;gap:.45rem 1.1rem;font-size:.78rem;color:var(--tx2);padding-top:.55rem}
.ed-bas .grp{display:inline-flex;align-items:center;gap:.3rem}
.ed-bas button.mini.on{border-color:var(--or);background:rgba(var(--or-rgb),.14);color:var(--tx)}
.ed-ligne{display:flex;align-items:center;justify-content:space-between;gap:.5rem;width:100%;padding:.35rem .5rem;border-radius:8px;text-align:left;font-size:.82rem;background:transparent;border:1px solid transparent}
.ed-ligne.on{border-color:var(--or)}
.ed-ligne span:last-child{color:var(--tx2);font-size:.74rem;white-space:nowrap}
.ed-gestes{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.5rem}
.ed-note{font-size:.76rem;color:var(--tx2);margin:.35rem 0 .1rem}
.ed-bords{font-variant-numeric:tabular-nums}

/* ── Imprimer et exporter (lot 3) ── */
.im-trois{display:grid;grid-template-columns:19rem minmax(0,1fr) 21rem;gap:.9rem;min-height:0}
.cx>.im-trois{flex:1 1 0}
.im-trois>.cx-carte{min-height:0;overflow:auto}
.im-dest{display:flex;flex-direction:column;gap:.15rem;width:100%;text-align:left;padding:.5rem .65rem;border-radius:10px;background:transparent;border:1px solid transparent;margin-bottom:.3rem}
.im-dest b{font-size:.84rem;font-weight:650}
.im-dest span{font-size:.74rem;color:var(--tx2)}
.im-dest.on{border-color:var(--or);background:rgba(var(--or-rgb),.12)}
.im-groupe{font-size:.72rem;letter-spacing:.04em;text-transform:uppercase;color:var(--tx2);margin:.6rem 0 .3rem}
.cx-carte>.im-apercu{flex:1 1 0;min-height:0}
.im-apercu{border-radius:12px;background:#FFFFFF;color:#1C1B18;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:.6rem}
.im-apercu svg{display:block;max-width:100%;max-height:100%}
.im-cases{display:flex;flex-direction:column;gap:.3rem;font-size:.82rem}
.im-cases label{display:flex;align-items:center;gap:.45rem;cursor:pointer}
.im-resume{font-size:.8rem;color:var(--tx2);margin-top:.5rem;font-variant-numeric:tabular-nums}

/* ── Aperçu 3D (lot 4) ── */
.v3-trois{display:grid;grid-template-columns:18rem minmax(0,1fr) 20rem;gap:.9rem;min-height:0}
.cx>.v3-trois{flex:1 1 0}
.v3-trois>.cx-carte{min-height:0;overflow:auto}
.v3-scene{position:relative;border-radius:12px;overflow:hidden;min-height:0;cursor:grab;user-select:none}
.v3-scene.glisse{cursor:grabbing}
.v3-scene canvas{display:block;position:absolute;left:0;top:0;width:100%;height:100%}
.v3-scene.beige{background:#EFE8DD}.v3-scene.blanc{background:#FFFFFF}
.v3-aide{position:absolute;left:.7rem;bottom:.55rem;font-size:.76rem;color:#3F3A32;background:rgba(243,238,229,.92);padding:.12rem .5rem;border-radius:6px;pointer-events:none}
.v3-couleurs{display:flex;flex-wrap:wrap;gap:.4rem}
.v3-couleurs button{width:1.9rem;height:1.9rem;border-radius:50%;padding:0;border:2px solid var(--v16)}
.v3-couleurs button.on{border-color:var(--or);box-shadow:0 0 0 2px var(--or)}
.v3-zone{display:flex;align-items:center;gap:.55rem;padding:.4rem 0;border-top:1px solid var(--v055);font-size:.84rem}
.v3-zone b{font-weight:600;flex:1 1 auto}
.v3-zone span{font-variant-numeric:tabular-nums}
.v3-pt{width:.8rem;height:.8rem;border-radius:50%;flex:0 0 auto;border:1px solid rgba(0,0,0,.25)}
.v3-legende{display:flex;flex-wrap:wrap;gap:.35rem .9rem;font-size:.76rem;color:var(--tx2);margin:.4rem 0}
.v3-legende span{display:inline-flex;align-items:center;gap:.3rem}

/* ── Éditeur de motif (lot 5) ── */
.mo-trois{display:grid;grid-template-columns:18rem minmax(0,1fr) 21rem;gap:.9rem;min-height:0}
.cx>.mo-trois{flex:1 1 0}
.mo-trois>.cx-carte{min-height:0;overflow:auto}
.mo-toile{position:relative;border-radius:12px;background:#EFE8DD;color:#1C1B18;overflow:hidden;min-height:0;user-select:none}
.mo-toile svg{display:block;position:absolute;left:0;top:0}
.mo-calque{display:flex;align-items:center;gap:.45rem;width:100%;padding:.3rem .4rem;border-radius:8px;text-align:left;font-size:.82rem;background:transparent;border:1px solid transparent;cursor:pointer}
.mo-calque:hover{background:var(--v05)}
.mo-oeil{flex:0 0 auto;width:1.6rem;height:1.6rem;padding:0;border-radius:6px;font-size:.78rem;line-height:1;background:transparent;border:1px solid var(--v16)}
.mo-oeil.off{color:var(--tx2)}
.mo-vue{position:absolute;right:.6rem;top:.5rem;display:flex;align-items:center;gap:.3rem;background:rgba(243,238,229,.94);color:#1C1B18;border-radius:8px;padding:.2rem .35rem;font-size:.76rem}
.mo-vue button.mini{color:#1C1B18;background:#FFFFFF;border-color:#C9BFAE}
.mo-aide{position:absolute;left:.6rem;bottom:.45rem;right:.6rem;font-size:.72rem;color:#3F3A32;background:rgba(243,238,229,.92);padding:.12rem .45rem;border-radius:6px;pointer-events:none}
.mo-grille{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.35rem}
.mo-calque.on{border-color:var(--or)}
.mo-calque .t{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mo-calque .k{font-size:.7rem;color:var(--tx2)}
.mo-ctl{display:flex;gap:.5rem;align-items:flex-start;font-size:.8rem;padding:.35rem 0;border-top:1px solid var(--v055)}
.mo-ctl i{flex:0 0 auto;width:.7rem;height:.7rem;border-radius:50%;margin-top:.3rem}
.mo-ctl.bon i{background:#16A34A}.mo-ctl.att i{background:#F59E0B}.mo-ctl.err i{background:#DC2626}
.mo-sorties{display:flex;flex-direction:column;gap:.4rem;margin-top:.4rem}
input[type=color]{width:100%;height:2rem;padding:.1rem;cursor:pointer}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Atelier de création ». */
function pageAtelier(ouverture) {
  const depart = JSON.stringify(String(ouverture || ''));
  return `${TETE()}
<title>${T("Atelier de création — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.atelier}</span><h1 id="titre">${T("Atelier de création")}</h1>
  <span class="cx-resume" id="sous"></span>
  <div class="cx-actions" id="actions"></div></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var DEPART = ${depart};

  var D = null;            // atelier:donnees
  var VUE = 'biblio';      // 'biblio' | 'modele'
  var CAT = '', ETAT = '', Q = '';
  var SEL = '';            // modèle choisi dans la bibliothèque
  var M = null;            // le modèle en création ou en modification
  var TRACE = false;       // base, options, tableau ou aisances changés : retracer à l enregistrement
  var AP = null;           // dernier aperçu reçu
  var TAP = 'M';           // taille montrée dans l aperçu
  var TOUTES = false;      // toutes les tailles emboîtées
  var OCCUPE = false;

  /* Les mots de la fenêtre, par CLÉ (voir l en-tête). */
  var LBASE = { robe: '${T("Robe droite")}', chemisier: '${T("Chemisier")}', jupe: '${T("Jupe")}', pantalon: '${T("Pantalon")}' };
  var LBASED = { robe: '${T("devant, dos, pinces de taille")}', chemisier: '${T("devant, dos, manche")}',
    jupe: '${T("devant, dos, pinces")}', pantalon: '${T("devant, dos")}' };
  var LCAT = { robes: '${T("Robes")}', hauts: '${T("Hauts")}', pantalons: '${T("Pantalons")}', jupes: '${T("Jupes")}',
    manteaux: '${T("Manteaux")}', motifs: '${T("Motifs")}' };
  var LETAT = { brouillon: '${T("Brouillon")}', pret: '${T("Prêt à couper")}', archive: '${T("Archivé")}' };
  var LETATS = { brouillon: '${T("Brouillons")}', pret: '${T("Prêts à couper")}', archive: '${T("Archivés")}' };
  var LMES = { poitrine: '${T("Tour de poitrine")}', taille: '${T("Tour de taille")}', hanches: '${T("Tour de hanches")}',
    longDos: '${T("Longueur taille-dos")}', carrure: '${T("Carrure dos")}', hautPoitrine: '${T("Hauteur de poitrine")}',
    cou: '${T("Tour de cou")}', tourBras: '${T("Tour de bras")}', longBras: '${T("Longueur de bras")}',
    montant: '${T("Hauteur de montant")}', entrejambe: '${T("Longueur d’entrejambe")}' };
  var LOPT = {
    encolure: { ronde: '${T("Ronde")}', v: '${T("En V")}', bateau: '${T("Bateau")}' },
    manche: { sans: '${T("Sans manche")}', courte: '${T("Courte")}', longue: '${T("Longue")}' },
    formeJupe: { droite: '${T("Droite")}', crayon: '${T("Crayon")}', evasee: '${T("Évasée")}' },
    formePantalon: { droit: '${T("Droit")}', large: '${T("Large")}', fusele: '${T("Fuselé")}' }
  };
  var LPIECE = { devant: '${T("Devant")}', dos: '${T("Dos")}', manche: '${T("Manche")}' };
  var LCTRL = { emmanchure: '${T("Emmanchure")}', cote: '${T("Couture de côté")}', tete: '${T("Tête de manche")}',
    embu: '${T("Embu de la manche")}', fourche: '${T("Fourche")}', entrejambe: '${T("Entrejambe")}' };
  /* Les pictogrammes des bases : un croquis à plat, trait seul. */
  var PICTO = {
    robe: '<svg viewBox="0 0 120 160" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M44 10l-22 14 6 30 10-4-4 100h52l-4-100 10 4 6-30-22-14c-2 8-9 12-16 12s-14-4-16-12z"/></svg>',
    chemisier: '<svg viewBox="0 0 130 120" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M48 8L14 22l-8 44 16 4 6-26v68h74V44l6 26 16-4-8-44L82 8c-3 8-10 12-17 12S51 16 48 8z"/></svg>',
    jupe: '<svg viewBox="0 0 120 130" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M30 8h60l22 112H8z"/></svg>',
    pantalon: '<svg viewBox="0 0 100 170" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M18 6h64l8 156H58L50 50l-8 112H10z"/></svg>'
  };

  var MOTIFS = {
    session: '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit: '${T("Votre rôle ne permet pas ce geste dans l’atelier.")}',
    indisponible: '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    delai: '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    nom: '${T("Donnez un nom au modèle.")}',
    base: '${T("Choisissez un patron de base.")}',
    ref_prise: '${T("Cette référence est déjà prise par un autre modèle.")}',
    tailles: '${T("Gardez au moins une taille, dont la taille de base.")}',
    introuvable: '${T("Ce modèle n’existe plus.")}',
    nuage: '${T("Enregistré sur ce poste seulement : le serveur n’a pas confirmé. Réessayez.")}',
    version: '${T("Cette version ne se restaure plus (seules les 5 dernières qui ont changé les pièces le peuvent).")}',
    assemblage: '${T("Un des deux bords de cet assemblage n’existe plus.")}',
    retouche_et_retrace: '${T("Impossible d’enregistrer une retouche et de retracer en même temps.")}',
    pieces: '${T("Le patron n’a plus de pièce valable.")}',
    aucune_piece: '${T("Aucune des pièces choisies n’existe dans ce modèle.")}',
    motif_vide: '${T("Le motif est vide : ajoutez un calque, puis enregistrez.")}',
    aucune_encre: '${T("Aucune encre à séparer : les images ne se séparent pas en aplats.")}',
    image_format: '${T("Choisissez une image PNG ou JPEG.")}',
    image_lourde: '${T("Image trop lourde (20 Mo au plus).")}',
    televersement: '${T("Le dépôt de l’image a échoué. Réessayez.")}',
    echec: '${T("L’opération a échoué.")}'
  };
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ((r && r.detail) ? String(r.detail) : ('${T("Erreur inattendue (")}' + esc(m || '?') + ').')); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function nombre(v, d){ var n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : d; }
  function cm(v){
    var n = Math.round((Number(v) || 0) * 10) / 10;
    return String(n).replace('.', '${SEP_DEC()}') + ' cm';
  }
  function jour(iso){
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('${LIEU()}', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return String(iso).slice(0, 10); }
  }
  function nomPiece(p){ return LPIECE[p.id] || szTd(p.nom || ''); }

  /* ══ LE DESSIN DES PIÈCES (SVG, en cm mis à l échelle) ═══════════════════
     « jeux » : une liste de { pieces, style } — plusieurs jeux se superposent
     (tailles emboîtées). La mise en page (une pièce à côté de l autre) se fait
     sur l union des boîtes de tous les jeux, pour que les tailles s alignent. */
  function boitePiece(p){
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    (p.contour || []).forEach(function(n){
      [n, n.c1, n.c2].forEach(function(q){ if (!q) return;
        if (q.x < x0) x0 = q.x; if (q.y < y0) y0 = q.y; if (q.x > x1) x1 = q.x; if (q.y > y1) y1 = q.y; });
    });
    return { x0: x0, y0: y0, x1: x1, y1: y1 };
  }
  function chemin(contour, X, Y){
    if (!contour || !contour.length) return '';
    var d = 'M' + X(contour[0].x) + ' ' + Y(contour[0].y);
    for (var i = 1; i < contour.length; i++) {
      var n = contour[i];
      d += n.c1 && n.c2 ? ' C' + X(n.c1.x) + ' ' + Y(n.c1.y) + ' ' + X(n.c2.x) + ' ' + Y(n.c2.y) + ' ' + X(n.x) + ' ' + Y(n.y)
                        : ' L' + X(n.x) + ' ' + Y(n.y);
    }
    var f = contour[0];
    if (f.c1 && f.c2) d += ' C' + X(f.c1.x) + ' ' + Y(f.c1.y) + ' ' + X(f.c2.x) + ' ' + Y(f.c2.y) + ' ' + X(f.x) + ' ' + Y(f.y);
    return d + ' Z';
  }
  function svgPieces(jeux, W, H, o){
    o = o || {};
    var ref = jeux[0] ? jeux[0].pieces : [];
    if (!ref || !ref.length) return '';
    var boites = ref.map(function(p, i){
      var b = boitePiece(p);
      jeux.forEach(function(j){ var q = j.pieces[i]; if (!q) return; var c = boitePiece(q);
        b.x0 = Math.min(b.x0, c.x0); b.y0 = Math.min(b.y0, c.y0); b.x1 = Math.max(b.x1, c.x1); b.y1 = Math.max(b.y1, c.y1); });
      return b;
    });
    var ecart = o.mini ? 4 : 7;
    var largeur = 0, hauteur = 0;
    boites.forEach(function(b){ largeur += (b.x1 - b.x0); hauteur = Math.max(hauteur, b.y1 - b.y0); });
    largeur += ecart * (boites.length - 1);
    var marge = o.mini ? 8 : 18;
    var k = Math.min((W - 2 * marge) / Math.max(1, largeur), (H - 2 * marge - (o.mini ? 0 : 16)) / Math.max(1, hauteur));
    var ox0 = (W - largeur * k) / 2, oy0 = (H - hauteur * k) / 2 - (o.mini ? 0 : 6);
    var r1 = function(v){ return Math.round(v * 10) / 10; };
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" fill="none" stroke-linejoin="round" role="img" aria-label="' + esc(o.titre || '${T("Pièces du patron")}') + '">';
    var cur = 0;
    boites.forEach(function(b, i){
      var bx = cur; cur += (b.x1 - b.x0) + ecart;
      var X = function(x){ return r1(ox0 + (bx + x - b.x0) * k); };
      var Y = function(y){ return r1(oy0 + (y - b.y0) * k); };
      jeux.forEach(function(j){
        var p = j.pieces[i]; if (!p) return;
        s += '<path d="' + chemin(p.contour, X, Y) + '" stroke="' + (j.trait || '#1C1B18') + '" stroke-width="' + (j.epais || 1.6) + '"'
          + (j.tirets ? ' stroke-dasharray="' + j.tirets + '"' : '') + '/>';
      });
      var p0 = jeux[0].pieces[i];
      if (o.mini || !p0) return;
      if (p0.pli) s += '<path d="M' + X(p0.pli.a.x) + ' ' + Y(p0.pli.a.y) + ' L' + X(p0.pli.b.x) + ' ' + Y(p0.pli.b.y) + '" stroke="#1C1B18" stroke-width="1.2" stroke-dasharray="8 4"/>';
      (p0.pinces || []).forEach(function(pc){
        s += '<path d="M' + X(pc.gauche.x) + ' ' + Y(pc.gauche.y) + ' L' + X(pc.sommet.x) + ' ' + Y(pc.sommet.y) + ' L' + X(pc.droite.x) + ' ' + Y(pc.droite.y)
          + (pc.bas ? ' L' + X(pc.bas.x) + ' ' + Y(pc.bas.y) + ' L' + X(pc.gauche.x) + ' ' + Y(pc.gauche.y) : '') + '" stroke="#A04A3A" stroke-width="1.3"/>';
      });
      if (p0.droitFil) {
        var a = p0.droitFil.a, z = p0.droitFil.b;
        s += '<path d="M' + X(a.x) + ' ' + Y(a.y) + ' L' + X(z.x) + ' ' + Y(z.y) + ' M' + r1(X(a.x) - 4) + ' ' + r1(Y(a.y) + 6) + ' L' + X(a.x) + ' ' + Y(a.y) + ' L' + r1(X(a.x) + 4) + ' ' + r1(Y(a.y) + 6)
          + ' M' + r1(X(z.x) - 4) + ' ' + r1(Y(z.y) - 6) + ' L' + X(z.x) + ' ' + Y(z.y) + ' L' + r1(X(z.x) + 4) + ' ' + r1(Y(z.y) - 6) + '" stroke="#1C1B18" stroke-width="1.1"/>';
      }
      (p0.crans || []).forEach(function(c){ s += '<circle cx="' + X(c.x) + '" cy="' + Y(c.y) + '" r="2.2" fill="#1C1B18" stroke="none"/>'; });
      var cxm = X((b.x0 + b.x1) / 2), cym = r1(oy0 + hauteur * k + 14);
      s += '<text x="' + cxm + '" y="' + cym + '" text-anchor="middle" fill="#1C1B18" stroke="none" font-size="11" font-weight="700" font-family="Segoe UI, sans-serif">'
        + esc(nomPiece(p0).toUpperCase()) + '</text>';
    });
    return s + '</svg>';
  }

  /* ══ LA BIBLIOTHÈQUE ═══════════════════════════════════════════════════ */
  function filtres(){
    var q = Q.trim().toLowerCase();
    return (D.modeles || []).filter(function(m){
      if (CAT && m.categorie !== CAT) return false;
      if (ETAT && m.etat !== ETAT) return false;
      if (!ETAT && m.etat === 'archive') return false;
      if (!q) return true;
      return (m.nom + ' ' + m.ref + ' ' + (LBASE[m.base] || '')).toLowerCase().indexOf(q) >= 0;
    });
  }
  function dessinerBiblio(){
    var tous = D.modeles || [];
    var nbBr = tous.filter(function(m){ return m.etat === 'brouillon'; }).length;
    document.getElementById('titre').textContent = '${T("Atelier de création")}';
    document.getElementById('sous').textContent = (tous.length > 1 ? '${T("{0} modèles")}'.split('{0}').join(tous.length) : '${T("{0} modèle")}'.split('{0}').join(tous.length))
      + (nbBr ? ' · ' + (nbBr > 1 ? '${T("{0} brouillons")}'.split('{0}').join(nbBr) : '${T("1 brouillon")}') : '');
    document.getElementById('actions').innerHTML = D.peutAjouter ? '<button type="button" class="prim" id="a-nouveau">${T("Nouveau modèle")}</button>' : '';

    var seg = function(attr, v, lib, actif){
      return '<button type="button" class="' + (actif ? 'on' : '') + '" ' + attr + '="' + v + '">' + lib + '</button>';
    };
    var h = '<div class="cx-barre"><div class="ed-seg" role="group" aria-label="${T("Catégorie")}">'
      + seg('data-cat', '', '${T("Tous")}', !CAT)
      + (D.categories || []).map(function(c){ return seg('data-cat', c.cle, LCAT[c.cle] || szTd(c.nom), CAT === c.cle); }).join('')
      + '</div><div class="ed-seg" role="group" aria-label="${T("État")}">'
      + (D.etats || []).map(function(e){ return seg('data-etat', e.cle, LETATS[e.cle] || szTd(e.nom), ETAT === e.cle); }).join('')
      + '</div><div class="droite"><label class="rf-rch">${ICO.loupe}<input type="search" id="a-q" maxlength="60" aria-label="${T("Rechercher un modèle")}" placeholder="${T("Nom, référence, base…")}" value="' + esc(Q) + '"></label></div></div>';

    var liste = filtres();
    var t = '<div class="cx-carte sz-pagee">';
    if (!tous.length) {
      t += '<div class="vide">${T("Aucun modèle pour l’instant. Partez d’un patron de base : il se trace à vos mesures.")}</div>';
    }
    t += '<div class="at-grille" data-pages="atelier">';
    t += liste.map(function(m){
      return '<button type="button" class="at-carte' + (SEL === m.id ? ' on' : '') + '" data-sel="' + esc(m.id) + '" data-ctx-ligne="' + esc(m.id) + '" title="${T("Clic : détails · double-clic : ouvrir")}">'
        + '<span class="vig">' + svgPieces([{ pieces: m.pieces || [] }], 176, 150, { mini: true, titre: m.nom }) + '</span>'
        + '<span class="tx"><b>' + esc(m.nom) + '</b><span>' + esc((m.ref ? m.ref + ' · ' : '') + 'v' + (m.version || 1) + ' · ' + (m.tailles || []).join(' ')) + '</span></span></button>';
    }).join('');
    // (2026-10-17, sa demande « retire ça » : la carte « Partir d un patron de base » doublait le bouton « Nouveau modèle » de la tête.)
    t += '</div>';
    if (tous.length && !liste.length) t += '<div class="vide">${T("Aucun modèle ne correspond.")}</div>';
    t += '<div class="cx-pied"><span>' + liste.length + ' ' + (liste.length > 1 ? '${T("modèles")}' : '${T("modèle")}') + '</span></div></div>';

    var m = SEL ? (D.modeles || []).filter(function(x){ return x.id === SEL; })[0] : null;
    var p = '<div class="cx-carte">';
    if (!m) {
      p += '<h2>${T("Modèle choisi")}</h2><div class="cx-sub">${T("Cliquez une carte pour voir ses pièces, ses tailles et ses versions.")}</div>';
    } else {
      p += '<h2>' + esc(m.nom) + ' <span class="at-puce ' + esc(m.etat) + '">' + esc(LETAT[m.etat] || m.etat) + '</span></h2>'
        + '<div class="cx-sub">' + esc((m.ref ? m.ref + ' · ' : '') + (LBASE[m.base] || '') + ' · ' + '${T("modifié le {0}")}'.split('{0}').join(jour(m.updatedAt))) + '</div>'
        + '<div class="cx-sep"></div><h2>${T("Pièces du patron")}</h2>'
        + (m.pieces || []).map(function(pc){
            return '<div class="cx-etat"><span>' + esc(nomPiece(pc)) + ' · ×' + (pc.qte || 1) + (pc.aupli ? ' ${T("au pli")}' : '') + '</span><span class="cx-gris">' + (pc.pinces && pc.pinces.length ? '${T("pince")}' : '') + '</span></div>';
          }).join('')
        + '<div class="cx-sep"></div><h2>${T("Tailles gradées")}</h2><div class="at-tailles">'
        + (m.tailles || []).map(function(tl){ return '<span class="at-puce' + (tl === m.tailleBase ? ' base' : '') + '">' + esc(tl) + (tl === m.tailleBase ? ' · ${T("base")}' : '') + '</span>'; }).join('')
        + '</div>'
        + '<div class="cx-etat"><span>${T("Tissu estimé (laize 140 cm)")}</span><span>' + (m.tissu ? String(m.tissu.metres).replace('.', '${SEP_DEC()}') + ' m' : '—') + '</span></div>'
        + '<div class="cx-sep"></div><h2>${T("Versions")}</h2>'
        + (m.versions || []).slice(-4).reverse().map(function(v){
            return '<div class="cx-etat"><span>v' + v.n + ' — ' + esc(v.note || '') + '</span><span class="cx-gris">' + esc(jour(v.date)) + '</span></div>';
          }).join('')
        + '<div class="at-gestes">'
        + (D.peutSupprimer ? '<button type="button" class="danger" data-suppr="' + esc(m.id) + '">${T("Supprimer")}</button>' : '')
        + (D.peutAjouter ? '<button type="button" data-dupl="' + esc(m.id) + '">${T("Dupliquer")}</button>' : '')
        + '<button type="button" data-editer="' + esc(m.id) + '">${T("Éditer le patron")}</button>'
        + '<button type="button" data-imprimer="' + esc(m.id) + '">${T("Imprimer / exporter")}</button>'
        + '<button type="button" data-v3="' + esc(m.id) + '">${T("Aperçu 3D")}</button>'
        + '<button type="button" data-motif="' + esc(m.id) + '">${T("Motif et impression textile")}</button>'
        + '<button type="button" class="prim" data-ouvrir="' + esc(m.id) + '">${T("Ouvrir le modèle")}</button></div>'
        + (m.edite ? '<div class="ed-note">${T("Patron retouché dans l’éditeur : « retracer » depuis le modèle effacerait ces retouches.")}</div>' : '');
    }
    p += '</div>';
    corps.innerHTML = h + '<div class="cx-deux">' + t + p + '</div>';
  }

  /* ══ LE MODÈLE (le moteur) ═════════════════════════════════════════════ */
  function copie(o){ return JSON.parse(JSON.stringify(o || {})); }
  function modeleNeuf(base){
    var b = (D.bases || []).filter(function(x){ return x.cle === base; })[0] || D.bases[0];
    return { id: '', nom: '', ref: '', categorie: b.categorie, etat: 'brouillon', base: b.cle, options: copie(b.options),
      tableau: copie(D.standard), aisances: copie(D.aisances), tailleBase: 'M', tailles: (D.tailles || []).slice(),
      produitId: '', notes: '' };
  }
  function optionsBase(){
    var o = M.options || {};
    var sel = function(id, lib, liste, cle, val){
      return '<label>' + lib + '<select id="' + id + '">' + Object.keys(liste).map(function(k){
        return '<option value="' + k + '"' + (val === k ? ' selected' : '') + '>' + liste[k] + '</option>'; }).join('') + '</select></label>';
    };
    var h = '';
    if (M.base === 'robe' || M.base === 'chemisier') {
      h += sel('o-encolure', '${T("Encolure")}', LOPT.encolure, 'encolure', o.encolure || 'ronde');
      h += sel('o-manche', '${T("Manche")}', LOPT.manche, 'manche', o.manche || (M.base === 'robe' ? 'sans' : 'longue'));
    }
    if (M.base === 'jupe') h += sel('o-forme', '${T("Forme")}', LOPT.formeJupe, 'forme', o.forme || 'droite');
    if (M.base === 'pantalon') h += sel('o-forme', '${T("Forme")}', LOPT.formePantalon, 'forme', o.forme || 'droit');
    var libL = M.base === 'pantalon' ? '${T("Longueur de jambe (0 = entrejambe)")}' : (M.base === 'chemisier' ? '${T("Longueur sous la taille")}' : '${T("Longueur sous la taille")}');
    h += '<label>' + libL + '<input type="text" id="o-longueur" maxlength="5" inputmode="decimal" value="' + esc(o.longueur != null ? String(o.longueur).replace('.', '${SEP_DEC()}') : '') + '"></label>';
    return h;
  }
  function dessinerModele(){
    var neuf = !M.id;
    document.getElementById('titre').textContent = neuf ? '${T("Nouveau modèle")}' : (M.nom || '${T("Modèle")}');
    document.getElementById('sous').textContent = neuf ? '${T("Tracé à partir d’un patron de base et de vos mesures")}'
      : ((M.ref ? M.ref + ' · ' : '') + 'v' + (M.version || 1));
    document.getElementById('actions').innerHTML = '<button type="button" id="m-retour">${T("← Bibliothèque")}</button>'
      + (!neuf ? '<button type="button" id="m-editer"' + (TRACE ? ' disabled title="${T("Enregistrez d’abord les changements du modèle.")}"' : '') + '>${T("Éditer le patron")}</button>' : '')
      + ((neuf ? D.peutAjouter : D.peutModifier) ? '<button type="button" class="prim" id="m-enreg">' + (neuf ? '${T("Créer le modèle")}' : '${T("Enregistrer la version")}') + '</button>' : '');

    var g = '<div class="cx-carte"><h2>${T("Patron de base")}</h2><div class="at-bases">'
      + (D.bases || []).map(function(b){
          return '<button type="button" class="at-base' + (M.base === b.cle ? ' on' : '') + '" data-base="' + b.cle + '">' + (PICTO[b.cle] || '')
            + '<span><b>' + esc(LBASE[b.cle] || szTd(b.nom)) + '</b><span class="cx-sub">' + esc(LBASED[b.cle] || '') + '</span></span></button>';
        }).join('') + '</div>'
      + '<div class="at-champs">' + optionsBase() + '</div>'
      + '<div class="cx-sep"></div><h2>${T("Le modèle")}</h2><div class="at-champs">'
      + '<label class="large">${T("Nom")}<input type="text" id="m-nom" maxlength="80" value="' + esc(M.nom) + '"></label>'
      + '<label>${T("Référence")}<input type="text" id="m-ref" maxlength="24" value="' + esc(M.ref) + '" placeholder="RB-014"></label>'
      + '<label>${T("Catégorie")}<select id="m-cat">' + (D.categories || []).map(function(c){
          return '<option value="' + c.cle + '"' + (M.categorie === c.cle ? ' selected' : '') + '>' + esc(LCAT[c.cle] || szTd(c.nom)) + '</option>'; }).join('') + '</select></label>'
      + '<label>${T("État")}<select id="m-etat">' + (D.etats || []).map(function(e){
          return '<option value="' + e.cle + '"' + (M.etat === e.cle ? ' selected' : '') + '>' + esc(LETAT[e.cle] || szTd(e.nom)) + '</option>'; }).join('') + '</select></label>'
      + '<label>${T("Produit lié")}<select id="m-prod"><option value="">${T("— Aucun —")}</option>' + (D.produits || []).map(function(pr){
          return '<option value="' + esc(pr.id) + '"' + (M.produitId === pr.id ? ' selected' : '') + '>' + esc(pr.nom) + '</option>'; }).join('') + '</select></label>'
      + '<label class="large">${T("Notes")}<textarea id="m-notes" maxlength="600">' + esc(M.notes) + '</textarea></label>'
      + '</div></div>';

    var tl = D.tailles || [];
    var c = '<div class="cx-carte"><h2>${T("Tableau de tailles")} <span class="cx-sub">${T("mesures du corps, en cm")}</span>'
      + '<span class="droite"><button type="button" class="mini" id="m-standard">${T("Tableau standard")}</button></span></h2>'
      + '<table class="at-tab"><thead><tr><th>${T("Mesure")}</th>'
      + tl.map(function(t){
          var inclus = (M.tailles || []).indexOf(t) >= 0;
          return '<th class="' + (M.tailleBase === t ? 'base' : '') + '"><label><input type="checkbox" data-taille="' + t + '"' + (inclus ? ' checked' : '') + ' aria-label="${T("Taille gardée :")} ' + t + '">' + t + '</label></th>';
        }).join('') + '</tr></thead><tbody>'
      + (D.mesures || []).map(function(m){
          return '<tr><td>' + esc(LMES[m.cle] || szTd(m.nom)) + '</td>' + tl.map(function(t){
            var v = ((M.tableau || {})[t] || {})[m.cle];
            return '<td><input type="text" inputmode="decimal" maxlength="5" data-t="' + t + '" data-m="' + m.cle + '" aria-label="' + esc((LMES[m.cle] || m.nom) + ' ' + t) + '" value="' + esc(v != null ? String(v).replace('.', '${SEP_DEC()}') : '') + '"></td>';
          }).join('') + '</tr>';
        }).join('')
      + '</tbody></table>'
      + '<div class="at-champs"><label>${T("Taille de base (tracé de référence)")}<select id="m-tbase">' + tl.map(function(t){
          return '<option value="' + t + '"' + (M.tailleBase === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label></div>'
      + '<div class="cx-sep"></div><h2>${T("Aisances")} <span class="cx-sub">${T("ajoutées au tour, en cm")}</span></h2><div class="at-ais">'
      + ['poitrine', 'taille', 'hanches'].map(function(k){
          return '<label>' + esc(LMES[k]) + '<input type="text" inputmode="decimal" maxlength="4" id="a-' + k + '" value="' + esc(String((M.aisances || {})[k] != null ? M.aisances[k] : '').replace('.', '${SEP_DEC()}')) + '"></label>';
        }).join('') + '</div></div>';

    var a = '<div class="cx-carte"><h2>${T("Aperçu")}<span class="droite"><span class="ed-seg" role="group" aria-label="${T("Taille de l’aperçu")}">'
      + tl.map(function(t){ return '<button type="button" class="' + (!TOUTES && TAP === t ? 'on' : '') + '" data-tap="' + t + '">' + t + '</button>'; }).join('')
      + '<button type="button" class="' + (TOUTES ? 'on' : '') + '" data-toutes="1">${T("Toutes")}</button></span></span></h2>'
      + '<div class="at-apercu" id="m-apercu"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div></div>'
      + '<div id="m-ctrl"></div></div>';

    corps.innerHTML = '<div class="at-trois">' + g + c + a + '</div>';
    if (!neuf && TRACE) dire(M.edite ? '${T("Attention : retracer effacera les retouches faites dans l’éditeur de patron.")}'
      : '${T("Base, options ou mesures changées : les pièces seront retracées à l’enregistrement.")}', 'att');
    demanderApercu();
  }

  /* L aperçu : redemandé au site à chaque réglage (après une pause de frappe). */
  var apT = null, apN = 0;
  function demanderApercu(){
    clearTimeout(apT);
    apT = setTimeout(function(){
      var n = ++apN;
      appeler('atelier:apercu', [{ base: M.base, options: M.options, tableau: M.tableau, aisances: M.aisances,
        taille: TAP, toutes: TOUTES }]).then(function(r){
        if (n !== apN) return;                      // une réponse dépassée par une plus récente
        AP = r && r.ok ? r : null;
        peindreApercu(r);
      });
    }, 220);
  }
  function peindreApercu(r){
    var z = document.getElementById('m-apercu'); if (!z) return;
    var ctrl = document.getElementById('m-ctrl');
    if (!r || !r.ok) { z.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; if (ctrl) ctrl.innerHTML = ''; return; }
    var W = Math.max(200, z.clientWidth || 340), H = Math.max(200, z.clientHeight || 420);
    var jeux;
    if (TOUTES && r.tailles) {
      jeux = [{ pieces: r.tailles[M.tailleBase] || r.pieces, trait: '#1C1B18', epais: 1.8 }];
      (M.tailles || []).forEach(function(t){
        if (t === M.tailleBase || !r.tailles[t]) return;
        jeux.push({ pieces: r.tailles[t], trait: '#8F897D', epais: 0.9, tirets: '4 3' });
      });
    } else jeux = [{ pieces: r.pieces }];
    z.innerHTML = svgPieces(jeux, W, H, { titre: TOUTES ? '${T("Toutes les tailles emboîtées")}' : '${T("Pièces de la taille")} ' + TAP });
    if (!ctrl) return;
    var lignes = '<div class="at-ligne"><span>${T("Tissu estimé (laize 140 cm)")}</span><span>' + String(r.tissu ? r.tissu.metres : 0).replace('.', '${SEP_DEC()}') + ' m</span></div>';
    (r.pieces || []).forEach(function(p){
      Object.keys(p.mesures || {}).forEach(function(k){
        lignes += '<div class="at-ligne"><span>' + esc(nomPiece(p) + ' · ' + (LCTRL[k] || k)) + '</span><span>' + cm(p.mesures[k]) + '</span></div>';
      });
    });
    ctrl.innerHTML = lignes;
  }

  /* Ramasse la saisie du formulaire dans M (sans redessiner : on garde le curseur). */
  function ramasser(cible){
    if (!M || !cible) return;
    var id = cible.id || '';
    if (id === 'm-nom') M.nom = cible.value;
    else if (id === 'm-ref') M.ref = cible.value;
    else if (id === 'm-cat') M.categorie = cible.value;
    else if (id === 'm-etat') M.etat = cible.value;
    else if (id === 'm-prod') M.produitId = cible.value;
    else if (id === 'm-notes') M.notes = cible.value;
    else if (id === 'm-tbase') { M.tailleBase = cible.value; if ((M.tailles || []).indexOf(cible.value) < 0) M.tailles.push(cible.value); TRACE = true; dessinerModele(); return; }
    else if (id === 'o-encolure' || id === 'o-manche' || id === 'o-forme') { M.options = M.options || {}; M.options[id.slice(2)] = cible.value; TRACE = true; demanderApercu(); }
    else if (id === 'o-longueur') { M.options = M.options || {}; var L = nombre(cible.value, NaN); if (isFinite(L)) { M.options.longueur = L; TRACE = true; demanderApercu(); } }
    else if (id.indexOf('a-') === 0 && id !== 'a-q') { var v = nombre(cible.value, NaN); if (isFinite(v)) { M.aisances[id.slice(2)] = v; TRACE = true; demanderApercu(); } }
    else if (cible.hasAttribute('data-t')) {
      var t = cible.getAttribute('data-t'), mk = cible.getAttribute('data-m'), x = nombre(cible.value, NaN);
      if (isFinite(x)) { M.tableau[t] = M.tableau[t] || {}; M.tableau[t][mk] = x; TRACE = true; demanderApercu(); }
    }
  }

  function enregistrer(btn){
    if (OCCUPE || !M) return;
    if (!String(M.nom || '').trim()) { dire(MOTIFS.nom, 'err'); var n = document.getElementById('m-nom'); if (n) n.focus(); return; }
    if (M.edite && TRACE && !enregistrer.confirme) {
      szConfirmer({ titre: '${T("Retracer le patron ?")}', texte: '${T("Les pièces seront retracées depuis la base : les retouches faites dans l’éditeur de patron seront perdues.")}',
        oui: '${T("Retracer et enregistrer")}', danger: true }).then(function(ok){ if (ok) { enregistrer.confirme = true; enregistrer(btn); enregistrer.confirme = false; } });
      return;
    }
    OCCUPE = true; if (btn) btn.disabled = true;
    dire('${T("Enregistrement…")}');
    var s = copie(M); s.regenerer = TRACE;
    appeler('atelier:ecrire', [s]).then(function(r){
      OCCUPE = false; if (btn) btn.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      SEL = r.id || SEL; TRACE = false; VUE = 'biblio'; M = null;
      charger(function(){ dire('${T("Modèle enregistré.")}', 'bon'); });
    });
  }

  /* ══ L ÉDITEUR DE PATRON (lot 2) ════════════════════════════════════════
     La fenêtre déplace les nœuds elle-même : le geste doit suivre la souris.
     Ce qui se CALCULE (ligne de coupe, longueur des bords, tissu) vient du site
     (atelier:analyser) ; ce qui s ENREGISTRE est renettoyé par le site.
     Coordonnées des pièces en cm ; chaque pièce est posée sur la toile à POS[i]
     (une mise en page de la toile, jamais enregistrée).
     Le bord i va du nœud i − 1 au nœud i ; le bord 0 ferme le contour. */
  var E = null;            // { m: le modèle, pieces, sel, noeud, poignee, bord, cran, pince }
  var OUTIL = 'sel';
  var K = 6, OX = 40, OY = 40;   // zoom (px par cm) et décalage de la toile
  var POS = [];
  var PILE = [], REFAIRE = [];
  var AN = null;           // dernière analyse du site
  var AIM = { points: true, grille: false, a45: true };
  var CALQ = { couture: true, crans: true, constr: true, tailles: false };
  var UNITE = 'cm';
  var SALE = false;
  var MES = null;          // la mesure en cours : { a, b } en cm de toile
  var GLISSE = null;       // le geste de souris en cours
  var ONGLET = 'prop';
  var GR = null;           // les tailles graduées (atelier:graduer), pour le calque « Tailles »
  var PRESSE = null;       // une règle de gradation copiée
  var ASSDE = null;        // « Assembler avec… » : le bord de départ { p, k }
  var LTISSU = { principal: '${T("Principal")}', doublure: '${T("Doublure")}', entoilage: '${T("Entoilage")}', contraste: '${T("Contraste")}' };
  var OUTILS = [
    { cle: 'sel', lib: '${T("Sélection")}', touche: 'V', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 3l14 8-6 1.5L10 19z"/></svg>' },
    { cle: 'point', lib: '${T("Point")}', touche: 'P', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18L21 6"/><rect x="9" y="9" width="6" height="6" fill="currentColor"/></svg>' },
    { cle: 'courbe', lib: '${T("Courbe")}', touche: 'C', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 19C7 3 17 3 21 19"/><circle cx="7" cy="6" r="1.6" fill="currentColor"/><circle cx="17" cy="6" r="1.6" fill="currentColor"/></svg>' },
    { cle: 'cran', lib: '${T("Cran")}', touche: 'N', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 8h18"/><path d="M12 8v8"/><path d="M9 20h6"/></svg>' },
    { cle: 'pince', lib: '${T("Pince")}', touche: 'D', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 20h18"/><path d="M8 20l4-15 4 15"/></svg>' },
    { cle: 'mesure', lib: '${T("Mesure")}', touche: 'M', ico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>' }
  ];
  var AIDE_OUTIL = {
    sel: '${T("Glissez un point, une poignée, un cran ou une pince ; cliquez un bord pour le régler ; glissez une pièce pour la ranger, le fond pour vous déplacer.")}',
    point: '${T("Cliquez un bord : un point s’y ajoute sans changer la forme.")}',
    courbe: '${T("Cliquez un bord : une droite devient courbe (glissez ensuite ses poignées), une courbe redevient droite.")}',
    cran: '${T("Cliquez le contour pour poser un cran ; cliquez un cran pour le retirer.")}',
    pince: '${T("Cliquez un bord : une pince de 2 cm sur 8 cm s’y pose, à régler en glissant ses pointes.")}',
    mesure: '${T("Cliquez deux points : la distance s’affiche dans les propriétés.")}'
  };

  /* ── Unités ── */
  function enUnite(v){
    var n = Number(v) || 0;
    if (UNITE === 'mm') return String(Math.round(n * 10));
    if (UNITE === 'po') return String(Math.round(n / 2.54 * 100) / 100).replace('.', '${SEP_DEC()}');
    return String(Math.round(n * 10) / 10).replace('.', '${SEP_DEC()}');
  }
  function lUnite(v){ return enUnite(v) + ' ' + (UNITE === 'po' ? '${T("po")}' : UNITE); }
  function depuisUnite(t){
    var n = nombre(t, NaN); if (!isFinite(n)) return NaN;
    return UNITE === 'mm' ? n / 10 : (UNITE === 'po' ? n * 2.54 : n);
  }

  /* ── Géométrie d interaction (le site garde le calcul qui s enregistre) ── */
  function cub(a, b, c, d, t){
    var u = 1 - t;
    return { x: u*u*u*a.x + 3*u*u*t*b.x + 3*u*t*t*c.x + t*t*t*d.x, y: u*u*u*a.y + 3*u*u*t*b.y + 3*u*t*t*c.y + t*t*t*d.y };
  }
  function lerp(a, b, t){ return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
  function r2(v){ return Math.round(v * 100) / 100; }
  function debutBord(p, b){ var L = p.contour.length; return p.contour[(b - 1 + L) % L]; }
  function pointBord(p, b, t){
    var a = debutBord(p, b), z = p.contour[b];
    return z.c1 && z.c2 ? cub(a, z.c1, z.c2, z, t) : lerp(a, z, t);
  }
  function echantillons(p){
    var out = [];
    for (var b = 1; b <= p.contour.length; b++) {
      var bb = b % p.contour.length, z = p.contour[bb];
      if (z.c1 && z.c2) for (var k = 1; k <= 16; k++) out.push(pointBord(p, bb, k / 16));
      else out.push({ x: z.x, y: z.y });
    }
    return out;
  }
  function dedans(p, x, y){
    var pts = echantillons(p), c = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var a = pts[i], b = pts[j];
      if (((a.y > y) !== (b.y > y)) && (x < (b.x - a.x) * (y - a.y) / ((b.y - a.y) || 1e-9) + a.x)) c = !c;
    }
    return c;
  }
  function sensPiece(p){
    var pts = echantillons(p), s = 0;
    for (var i = 0; i < pts.length; i++) { var a = pts[i], b = pts[(i + 1) % pts.length]; s += a.x * b.y - b.x * a.y; }
    return s > 0 ? 1 : -1;
  }
  /* Le point du contour le plus proche de (x, y), en cm de la pièce : { bord, t, pt, d }. */
  function plusProcheBord(p, x, y){
    var best = null;
    for (var b = 0; b < p.contour.length; b++) {
      for (var k = 0; k <= 48; k++) {
        var t = k / 48, q = pointBord(p, b, t), d = Math.hypot(q.x - x, q.y - y);
        if (!best || d < best.d) best = { bord: b, t: t, pt: q, d: d };
      }
    }
    if (best) {                                   // affinage autour du meilleur pas
      var lo = Math.max(0, best.t - 1 / 48), hi = Math.min(1, best.t + 1 / 48);
      for (var n = 0; n <= 20; n++) {
        var tt = lo + (hi - lo) * n / 20, qq = pointBord(p, best.bord, tt), dd = Math.hypot(qq.x - x, qq.y - y);
        if (dd < best.d) best = { bord: best.bord, t: tt, pt: qq, d: dd };
      }
    }
    return best;
  }

  /* ── Toile ↔ écran ── */
  function sx(i, x){ return Math.round(((x + POS[i].x) * K + OX) * 10) / 10; }
  function sy(i, y){ return Math.round(((y + POS[i].y) * K + OY) * 10) / 10; }
  function versPiece(i, mx, my){ return { x: (mx - OX) / K - POS[i].x, y: (my - OY) / K - POS[i].y }; }
  function boiteP(p){
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    echantillons(p).forEach(function(q){ if (q.x < x0) x0 = q.x; if (q.y < y0) y0 = q.y; if (q.x > x1) x1 = q.x; if (q.y > y1) y1 = q.y; });
    return { x0: x0, y0: y0, x1: x1, y1: y1 };
  }
  function ranger(){
    var cur = 0; POS = [];
    E.pieces.forEach(function(p){ var b = boiteP(p); POS.push({ x: cur - b.x0, y: -b.y0 }); cur += (b.x1 - b.x0) + 8; });
  }
  function ajuster(){
    var z = document.getElementById('e-toile'); if (!z || !E.pieces.length) return;
    var W = z.clientWidth || 800, H = z.clientHeight || 600;
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    E.pieces.forEach(function(p, i){ var b = boiteP(p);
      x0 = Math.min(x0, b.x0 + POS[i].x); y0 = Math.min(y0, b.y0 + POS[i].y); x1 = Math.max(x1, b.x1 + POS[i].x); y1 = Math.max(y1, b.y1 + POS[i].y); });
    K = Math.max(1, Math.min((W - 80) / Math.max(1, x1 - x0), (H - 90) / Math.max(1, y1 - y0)));
    OX = (W - (x1 - x0) * K) / 2 - x0 * K; OY = (H - (y1 - y0) * K) / 2 - y0 * K + 10;
  }
  function zoomer(k2, mx, my){
    k2 = Math.max(1, Math.min(80, k2));
    OX = mx - (mx - OX) * k2 / K; OY = my - (my - OY) * k2 / K; K = k2;
    peindre();
  }

  /* ── L historique ── */
  function etat(){ return JSON.stringify({ p: E.pieces, pos: POS, a: E.ass }); }
  function memo(lib){
    PILE.push({ lib: lib, e: etat() }); if (PILE.length > 100) PILE.shift();
    REFAIRE = []; SALE = true;
  }
  function remettre(s){ var o = JSON.parse(s); E.pieces = o.p; POS = o.pos; E.ass = o.a || []; if (E.sel >= E.pieces.length) E.sel = E.pieces.length ? 0 : -1; deselectionner(true); }
  function annuler(){
    if (!PILE.length) return;
    var d = PILE.pop(); REFAIRE.push({ lib: d.lib, e: etat() }); remettre(d.e); SALE = true;
    dire('${T("Annulé :")} ' + d.lib); apresChangement();
  }
  function refaire(){
    if (!REFAIRE.length) return;
    var d = REFAIRE.pop(); PILE.push({ lib: d.lib, e: etat() }); remettre(d.e); SALE = true;
    dire('${T("Refait :")} ' + d.lib); apresChangement();
  }
  function revenirA(n){                       // l historique : revenir avant l action n
    while (PILE.length > n) { var d = PILE.pop(); REFAIRE.push({ lib: d.lib, e: etat() }); remettre(d.e); }
    SALE = true; apresChangement();
  }
  function deselectionner(garderPiece){
    E.noeud = -1; E.poignee = ''; E.bord = -1; E.cran = -1; E.pince = -1;
    if (!garderPiece) E.sel = -1;
  }

  /* ── Les coutures par bord suivent les nœuds qu on ajoute ou retire ── */
  function decalerCoutures(p, i, ajout){
    var c = p.coutures || {}, n = {}, L = p.contour.length;   // L : longueur APRÈS le changement
    Object.keys(c).forEach(function(k){
      var b = parseInt(k, 10);
      if (ajout) {
        if (i === 0) { n[b] = c[k]; if (b === 0) n[L - 1] = c[k]; }       // nœud ajouté à la fin (bord de fermeture)
        else if (b >= i) { n[b + 1] = c[k]; if (b === i) n[i] = c[k]; }
        else n[b] = c[k];
      } else {
        // nœud i retiré (L + 1 nœuds avant) : les bords i et i + 1 fusionnent en un seul, d indice M ;
        // le bord fusionné garde la valeur du premier des deux qui en porte une.
        var L0 = L + 1, M = i === L0 - 1 ? 0 : i, suiv = (i + 1) % L0;
        if (b === i) n[M] = c[k];
        else if (b === suiv) { if (c[i] == null) n[M] = c[k]; }
        else n[b < i ? b : b - 1] = c[k];
      }
    });
    p.coutures = n;
  }
  function ajouterPoint(i, bord, t){
    var p = E.pieces[i], z = p.contour[bord], a = debutBord(p, bord), nv;
    if (z.c1 && z.c2) {                         // de Casteljau : la courbe garde sa forme
      var q0 = lerp(a, z.c1, t), q1 = lerp(z.c1, z.c2, t), q2 = lerp(z.c2, z, t), r0 = lerp(q0, q1, t), r1 = lerp(q1, q2, t), s = lerp(r0, r1, t);
      nv = { x: r2(s.x), y: r2(s.y), c1: { x: r2(q0.x), y: r2(q0.y) }, c2: { x: r2(r0.x), y: r2(r0.y) } };
      z.c1 = { x: r2(r1.x), y: r2(r1.y) }; z.c2 = { x: r2(q2.x), y: r2(q2.y) };
    } else { var m = lerp(a, z, t); nv = { x: r2(m.x), y: r2(m.y) }; }
    /* Lot 2b : le nouveau point reçoit une identité et une règle de gradation
       interpolée entre ses deux voisins ; les poignées du bord coupé reprennent
       la règle par défaut (2 nombres). */
    var nk = 1; while (p.contour.some(function(q){ return q.k === 'n' + nk; })) nk++;
    nv.k = 'n' + nk;
    if (a.g || z.g) {
      nv.g = {};
      Object.keys(Object.assign({}, a.g || {}, z.g || {})).forEach(function(tl){
        var ga = (a.g && a.g[tl]) || [0, 0], gz = (z.g && z.g[tl]) || [0, 0];
        nv.g[tl] = [r2(ga[0] + (gz[0] - ga[0]) * t), r2(ga[1] + (gz[1] - ga[1]) * t)];
      });
      if (z.g) Object.keys(z.g).forEach(function(tl){ z.g[tl] = z.g[tl].slice(0, 2); });
    }
    if (z.nom) nv.nom = z.nom;
    var at = bord === 0 ? p.contour.length : bord;
    p.contour.splice(at, 0, nv);
    decalerCoutures(p, bord, true);
    return at;
  }
  /* Un cran posé SUR un point le suit quand le point bouge (un cran de bas d emmanchure reste au bas d emmanchure). */
  function suivreCrans(p, ancien, dx, dy){
    (p.crans || []).forEach(function(c){ if (Math.hypot(c.x - ancien.x, c.y - ancien.y) < 0.15) { c.x = r2(c.x + dx); c.y = r2(c.y + dy); } });
  }
  function retirerPoint(i, n){
    var p = E.pieces[i];
    if (p.contour.length <= 3) { dire('${T("Une pièce garde au moins trois points.")}', 'att'); return false; }
    var kk = p.contour[n].k;
    E.ass = (E.ass || []).filter(function(x){ return !((x.a.p === p.id && x.a.k === kk) || (x.b.p === p.id && x.b.k === kk)); });
    p.contour.splice(n, 1);
    decalerCoutures(p, n, false);
    return true;
  }

  /* ── Le dessin ── */
  function cheminP(i, p){
    var c = p.contour, d = 'M' + sx(i, c[0].x) + ' ' + sy(i, c[0].y);
    for (var n = 1; n <= c.length; n++) {
      var z = c[n % c.length];
      d += z.c1 && z.c2 ? ' C' + sx(i, z.c1.x) + ' ' + sy(i, z.c1.y) + ' ' + sx(i, z.c2.x) + ' ' + sy(i, z.c2.y) + ' ' + sx(i, z.x) + ' ' + sy(i, z.y)
                        : ' L' + sx(i, z.x) + ' ' + sy(i, z.y);
    }
    return d + ' Z';
  }
  function cheminBord(i, p, b){
    var a = debutBord(p, b), z = p.contour[b];
    return 'M' + sx(i, a.x) + ' ' + sy(i, a.y) + (z.c1 && z.c2
      ? ' C' + sx(i, z.c1.x) + ' ' + sy(i, z.c1.y) + ' ' + sx(i, z.c2.x) + ' ' + sy(i, z.c2.y) + ' ' + sx(i, z.x) + ' ' + sy(i, z.y)
      : ' L' + sx(i, z.x) + ' ' + sy(i, z.y));
  }
  function grille(W, H){
    var s = '', pas = K >= 5 ? 1 : 5, x0 = Math.floor(-OX / K / pas) * pas, x1 = Math.ceil((W - OX) / K), y0 = Math.floor(-OY / K / pas) * pas, y1 = Math.ceil((H - OY) / K);
    for (var x = x0; x <= x1; x += pas) { var X = Math.round(x * K + OX) + 0.5; s += '<path d="M' + X + ' 0V' + H + '" stroke="' + (x % 10 === 0 ? '#D3C8B6' : '#E6DED1') + '" stroke-width="1"/>'; }
    for (var y = y0; y <= y1; y += pas) { var Y = Math.round(y * K + OY) + 0.5; s += '<path d="M0 ' + Y + 'H' + W + '" stroke="' + (y % 10 === 0 ? '#D3C8B6' : '#E6DED1') + '" stroke-width="1"/>'; }
    var reg = '<rect x="0" y="0" width="' + W + '" height="16" fill="#EAE2D5"/>';
    for (var g = Math.ceil(-OX / K / 10) * 10; g <= x1; g += 10) {
      if (K * 10 < 34 && g % 50 !== 0) continue;
      reg += '<text x="' + (Math.round(g * K + OX) + 3) + '" y="12" font-size="10" fill="#4A443A" font-family="Segoe UI, sans-serif">' + g + '</text>';
    }
    return s + reg;
  }
  function fleche(x1, y1, x2, y2){
    var a = Math.atan2(y2 - y1, x2 - x1), L = 7, s = '';
    [[x1, y1, a + Math.PI], [x2, y2, a]].forEach(function(e){
      s += ' M' + r2(e[0] - L * Math.cos(e[2] - 0.45)) + ' ' + r2(e[1] - L * Math.sin(e[2] - 0.45)) + ' L' + e[0] + ' ' + e[1]
        + ' L' + r2(e[0] - L * Math.cos(e[2] + 0.45)) + ' ' + r2(e[1] - L * Math.sin(e[2] + 0.45));
    });
    return '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + s + '" stroke="#1C1B18" stroke-width="1.1" fill="none"/>';
  }
  function dessinTailles(p, i){
    if (!CALQ.tailles || !GR || !GR.tailles || (GLISSE && GLISSE.bouge)) return '';
    var s = '';
    Object.keys(GR.tailles).forEach(function(tl){
      if (tl === GR.tailleBase) return;
      var q = (GR.tailles[tl] || []).filter(function(x){ return x.id === p.id; })[0];
      if (!q || q.contour.length !== p.contour.length) return;
      s += '<path d="' + cheminP(i, q) + '" fill="none" stroke="#7A7366" stroke-width="0.9" stroke-dasharray="4 3"/>';
      if (i === E.sel && E.noeud >= 0 && q.contour[E.noeud]) s += '<circle cx="' + sx(i, q.contour[E.noeud].x) + '" cy="' + sy(i, q.contour[E.noeud].y) + '" r="3" fill="#2563EB"/>';
    });
    return s;
  }
  function dessinPiece(p, i){
    var sel = i === E.sel, s = dessinTailles(p, i), an = analyseDe(i);
    if (CALQ.couture && an && an.coupe && an.coupe.length && !(GLISSE && GLISSE.piece === i && GLISSE.bouge)) {
      s += '<path d="M' + an.coupe.map(function(q){ return sx(i, q.x) + ' ' + sy(i, q.y); }).join(' L') + ' Z" stroke="#6E675B" stroke-width="1" fill="none"/>';
    }
    s += '<path d="' + cheminP(i, p) + '" fill="' + (sel ? '#F6E6DA' : '#F8F4EC') + '" stroke="' + (sel ? '#9A3412' : '#1C1B18') + '" stroke-width="' + (sel ? 2 : 1.6) + '"/>';
    if (sel && E.bord >= 0 && E.bord < p.contour.length) s += '<path d="' + cheminBord(i, p, E.bord) + '" stroke="#2563EB" stroke-width="4" fill="none" stroke-linecap="round"/>';
    if (CALQ.constr) {
      if (p.aupli && p.pli) s += '<path d="M' + sx(i, p.pli.a.x) + ' ' + sy(i, p.pli.a.y) + ' L' + sx(i, p.pli.b.x) + ' ' + sy(i, p.pli.b.y) + '" stroke="#1C1B18" stroke-width="1.2" stroke-dasharray="9 4 2 4"/>';
      if (p.droitFil) s += fleche(sx(i, p.droitFil.a.x), sy(i, p.droitFil.a.y), sx(i, p.droitFil.b.x), sy(i, p.droitFil.b.y));
      (p.pinces || []).forEach(function(d, k){
        s += '<path d="M' + sx(i, d.gauche.x) + ' ' + sy(i, d.gauche.y) + ' L' + sx(i, d.sommet.x) + ' ' + sy(i, d.sommet.y) + ' L' + sx(i, d.droite.x) + ' ' + sy(i, d.droite.y)
          + (d.bas ? ' L' + sx(i, d.bas.x) + ' ' + sy(i, d.bas.y) + ' Z' : '') + '" stroke="' + (sel && E.pince === k ? '#2563EB' : '#A04A3A') + '" stroke-width="' + (sel && E.pince === k ? 2 : 1.3) + '" fill="none"/>';
      });
    }
    if (CALQ.crans) (p.crans || []).forEach(function(c, k){
      s += '<circle cx="' + sx(i, c.x) + '" cy="' + sy(i, c.y) + '" r="' + (sel && E.cran === k ? 4 : 2.6) + '" fill="' + (sel && E.cran === k ? '#2563EB' : '#1C1B18') + '"/>';
    });
    // Le nom aux trois quarts de la hauteur : le milieu est celui des pinces et du droit-fil.
    var b = boiteP(p), cx = sx(i, (b.x0 + b.x1) / 2), cy = sy(i, b.y0 + (b.y1 - b.y0) * 0.74);
    s += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" font-size="13" font-weight="700" fill="#1C1B18" font-family="Segoe UI, sans-serif">' + esc(nomPiece(p).toUpperCase()) + '</text>'
      + '<text x="' + cx + '" y="' + r2(cy + 15) + '" text-anchor="middle" font-size="10.5" fill="#3F3A32" font-family="Segoe UI, sans-serif">'
      + esc(((E.m.ref ? E.m.ref + ' · ' : '') + (E.m.tailleBase || 'M') + ' · ×' + (p.qte || 1) + (p.aupli ? ' ${T("au pli")}' : '') + ' · ' + (LTISSU[p.tissu] || ''))) + '</text>';
    if (sel) {
      if (CALQ.constr) {
        (p.pinces || []).forEach(function(d){ ['gauche', 'sommet', 'droite'].concat(d.bas ? ['bas'] : []).forEach(function(c){
          s += '<rect x="' + r2(sx(i, d[c].x) - 3.5) + '" y="' + r2(sy(i, d[c].y) - 3.5) + '" width="7" height="7" transform="rotate(45 ' + sx(i, d[c].x) + ' ' + sy(i, d[c].y) + ')" fill="#fff" stroke="#A04A3A" stroke-width="1.3"/>'; }); });
        if (p.droitFil) ['a', 'b'].forEach(function(c){ s += '<circle cx="' + sx(i, p.droitFil[c].x) + '" cy="' + sy(i, p.droitFil[c].y) + '" r="3.5" fill="#fff" stroke="#1C1B18" stroke-width="1.2"/>'; });
      }
      var L = p.contour.length;
      if (E.noeud >= 0 && E.noeud < L) {
        var z = p.contour[E.noeud], nx = p.contour[(E.noeud + 1) % L];
        var poig = [];
        if (z.c1 && z.c2) poig.push(['c2', E.noeud, z.c2, z], ['c1', E.noeud, z.c1, debutBord(p, E.noeud)]);
        if (nx.c1 && nx.c2) poig.push(['c1', (E.noeud + 1) % L, nx.c1, z], ['c2', (E.noeud + 1) % L, nx.c2, nx]);
        poig.forEach(function(h){
          s += '<path d="M' + sx(i, h[3].x) + ' ' + sy(i, h[3].y) + ' L' + sx(i, h[2].x) + ' ' + sy(i, h[2].y) + '" stroke="#2563EB" stroke-width="1"/>'
            + '<circle cx="' + sx(i, h[2].x) + '" cy="' + sy(i, h[2].y) + '" r="4" fill="#fff" stroke="#2563EB" stroke-width="1.5"/>';
        });
      }
      p.contour.forEach(function(n, k){
        var on = E.noeud === k;
        s += '<rect x="' + r2(sx(i, n.x) - 4) + '" y="' + r2(sy(i, n.y) - 4) + '" width="8" height="8" fill="' + (on ? '#C2410C' : '#fff') + '" stroke="' + (on ? '#7C2D12' : '#1C1B18') + '" stroke-width="1.3"/>';
      });
    }
    return s;
  }
  function peindre(){
    var z = document.getElementById('e-toile'), svg = document.getElementById('e-svg'); if (!z || !svg || !E) return;
    var W = z.clientWidth || 800, H = z.clientHeight || 600;
    var s = grille(W, H);
    E.pieces.forEach(function(p, i){ if (i !== E.sel) s += dessinPiece(p, i); });
    if (E.sel >= 0 && E.pieces[E.sel]) s += dessinPiece(E.pieces[E.sel], E.sel);
    if (MES && MES.a) {
      var b = MES.b || MES.a, ax = r2(MES.a.x * K + OX), ay = r2(MES.a.y * K + OY), bx = r2(b.x * K + OX), by = r2(b.y * K + OY);
      s += '<path d="M' + ax + ' ' + ay + ' L' + bx + ' ' + by + '" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="6 4"/>'
        + '<circle cx="' + ax + '" cy="' + ay + '" r="3.5" fill="#2563EB"/><circle cx="' + bx + '" cy="' + by + '" r="3.5" fill="#2563EB"/>';
      if (MES.b) s += '<text x="' + r2((ax + bx) / 2 + 8) + '" y="' + r2((ay + by) / 2 - 8) + '" font-size="12" font-weight="700" fill="#1E40AF" font-family="Segoe UI, sans-serif">'
        + esc(lUnite(Math.hypot(MES.b.x - MES.a.x, MES.b.y - MES.a.y))) + '</text>';
    }
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = s;
    var zz = document.getElementById('e-zoom'); if (zz) zz.textContent = Math.round(K / 37.8 * 100) + ' %';
  }

  /* L analyse du site pour la pièce i, seulement si elle décrit encore cette pièce (même id, même nombre de bords). */
  function analyseDe(i){
    var a = AN && AN.pieces ? AN.pieces[i] : null, p = E.pieces[i];
    return a && p && a.id === p.id && a.bords && a.bords.length === p.contour.length ? a : null;
  }

  /* ── Lot 2b : noms des bords, assemblages ── */
  function nomBord(p, b){
    var z = p.contour[b];
    return '${T("Bord {0}")}'.split('{0}').join(b + 1) + (z && z.nom ? ' · ' + szTd(z.nom) : '');
  }
  function assDe(p, z){
    return (E.ass || []).filter(function(x){ return (x.a.p === p.id && x.a.k === z.k) || (x.b.p === p.id && x.b.k === z.k); })[0] || null;
  }
  function libRef(r){
    var q = E.pieces.filter(function(x){ return x.id === r.p; })[0]; if (!q) return '?';
    var b = q.contour.findIndex(function(n){ return n.k === r.k; });
    return nomPiece(q) + ' · ' + (b >= 0 ? nomBord(q, b) : '?');
  }
  function infoAss(x){
    var a = AN && AN.assemblages ? AN.assemblages.filter(function(y){ return y.a.p === x.a.p && y.a.k === x.a.k && y.b.p === x.b.p && y.b.k === x.b.k; })[0] : null;
    return a;
  }
  function blocAssemblage(p, z){
    var x = assDe(p, z);
    if (!x) return '<div class="ed-gestes"><button type="button" class="mini" id="e-ass-de">${T("Assembler avec un autre bord…")}</button></div><div class="cx-sep"></div>';
    var autre = x.a.p === p.id && x.a.k === z.k ? x.b : x.a, inf = infoAss(x);
    return '<div class="cx-etat"><span>${T("Cousu avec")}</span><span>' + esc(libRef(autre)) + '</span></div>'
      + (inf ? '<div class="cx-etat"><span>${T("Écart de longueur")}</span><span>' + (inf.ecart > 0 ? '+' : '') + esc(lUnite(inf.ecart)) + '</span></div>' : '')
      + '<div class="ed-gestes"><button type="button" class="mini" id="e-ass-egal">${T("Égaliser")}</button><button type="button" class="mini" id="e-ass-defaire">${T("Défaire l’assemblage")}</button></div><div class="cx-sep"></div>';
  }

  /* ── Lot 2b : la gradation d un point ── */
  function panneauGrad(){
    var p = E.pieces[E.sel];
    if (!p) return '<h2>${T("Gradation")}</h2><div class="cx-sub">${T("Cliquez une pièce, puis un de ses points.")}</div>';
    var avecRegle = p.contour.filter(function(n){ return n.g && Object.keys(n.g).length; }).length;
    var h = '<h2>${T("Gradation")} <span class="cx-sub">' + '${T("{0} points sur {1} ont une règle")}'.split('{0}').join(avecRegle).split('{1}').join(p.contour.length) + '</span></h2>';
    if (!CALQ.tailles) h += '<div class="ed-gestes"><button type="button" class="mini" data-ecalq="tailles">${T("Voir toutes les tailles sur la toile")}</button></div>';
    if (E.noeud < 0 || !p.contour[E.noeud]) return h + '<div class="ed-note">${T("Cliquez un point de la pièce : sa règle de gradation (déplacement par taille) s’affiche ici.")}</div>';
    var n = p.contour[E.noeud], tb = E.m.tailleBase || 'M';
    h += '<div class="cx-sub">' + esc(nomBord(p, E.noeud)) + '</div>'
      + '<table class="at-tab"><thead><tr><th>${T("Taille")}</th><th>Δx (' + UNITE + ')</th><th>Δy (' + UNITE + ')</th></tr></thead><tbody>'
      + (E.m.tailles || []).map(function(tl){
          if (tl === tb) return '<tr><td>' + esc(tl) + ' · ${T("base")}</td><td>0</td><td>0</td></tr>';
          var g = (n.g && n.g[tl]) || [0, 0];
          return '<tr><td>' + esc(tl) + '</td>' + [0, 1].map(function(c){
            return '<td><input type="text" inputmode="decimal" maxlength="7" data-gt="' + esc(tl) + '" data-gc="' + c + '" aria-label="' + esc((c ? 'Δy ' : 'Δx ') + tl) + '" value="' + esc(enUnite(g[c] || 0)) + '"></td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table>'
      + '<div class="ed-gestes"><button type="button" class="mini" id="e-g-copier">${T("Copier la règle")}</button>'
      + '<button type="button" class="mini" id="e-g-coller"' + (PRESSE ? '' : ' disabled') + '>${T("Coller")}</button>'
      + '<button type="button" class="mini" id="e-g-prop">${T("Proportionnel")}</button>'
      + '<button type="button" class="mini" id="e-g-zero">${T("Remettre à zéro")}</button></div>'
      + '<div class="ed-note">${T("« Proportionnel » reprend l’écart de la taille juste au-dessus de la base et le répète d’une taille à l’autre.")}</div>';
    return h;
  }

  /* ── Le panneau de droite ── */
  function champ(id, lib, val, attrs){ return '<label>' + lib + '<input type="text" id="' + id + '" value="' + esc(val) + '" ' + (attrs || '') + '></label>'; }
  function panneauProp(){
    var p = E.pieces[E.sel];
    if (MES && MES.b) {
      var dx = MES.b.x - MES.a.x, dy = MES.b.y - MES.a.y;
      return '<h2>${T("Mesure")}</h2><div class="cx-etat"><span>${T("Distance")}</span><span>' + esc(lUnite(Math.hypot(dx, dy))) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Horizontal")}</span><span>' + esc(lUnite(Math.abs(dx))) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Vertical")}</span><span>' + esc(lUnite(Math.abs(dy))) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Angle")}</span><span>' + Math.round(Math.atan2(-dy, dx) * 180 / Math.PI) + '°</span></div>'
        + '<div class="ed-note">${T("Cliquez ailleurs pour une nouvelle mesure.")}</div>';
    }
    if (!p) return '<h2>${T("Propriétés")}</h2><div class="cx-sub">${T("Cliquez une pièce pour la régler.")}</div><div class="ed-note">' + esc(AIDE_OUTIL[OUTIL]) + '</div>';
    var an = analyseDe(E.sel);
    var h = '<h2>' + esc(nomPiece(p)) + ' <span class="cx-sub">' + '${T("pièce {0} / {1}")}'.split('{0}').join(E.sel + 1).split('{1}').join(E.pieces.length) + '</span></h2>';
    if (E.noeud >= 0 && p.contour[E.noeud]) {
      var n = p.contour[E.noeud];
      h += '<div class="at-champs">' + champ('e-nx', '${T("Point · X")} (' + UNITE + ')', enUnite(n.x), 'inputmode="decimal" maxlength="8"')
        + champ('e-ny', '${T("Point · Y")} (' + UNITE + ')', enUnite(n.y), 'inputmode="decimal" maxlength="8"') + '</div>'
        + '<div class="ed-gestes"><button type="button" class="mini danger" id="e-retirer-point">${T("Retirer le point")}</button></div><div class="cx-sep"></div>';
    }
    if (E.cran >= 0) h += '<div class="cx-etat"><span>${T("Cran choisi")}</span><span><button type="button" class="mini danger" id="e-retirer-cran">${T("Retirer le cran")}</button></span></div><div class="cx-sep"></div>';
    if (E.pince >= 0 && p.pinces[E.pince]) {
      var d = p.pinces[E.pince];
      h += '<div class="cx-etat"><span>${T("Pince · ouverture")}</span><span>' + esc(lUnite(Math.hypot(d.droite.x - d.gauche.x, d.droite.y - d.gauche.y))) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Pince · profondeur")}</span><span>' + esc(lUnite(Math.hypot(d.sommet.x - (d.gauche.x + d.droite.x) / 2, d.sommet.y - (d.gauche.y + d.droite.y) / 2))) + '</span></div>'
        + '<div class="ed-gestes"><button type="button" class="mini danger" id="e-retirer-pince">${T("Retirer la pince")}</button></div><div class="cx-sep"></div>';
    }
    if (E.bord >= 0 && p.contour[E.bord]) {
      var z = p.contour[E.bord], cv = (p.coutures || {})[E.bord];
      h += '<h2>' + esc(nomBord(p, E.bord)) + ' <span class="cx-sub">' + (z.c1 && z.c2 ? '${T("courbe")}' : '${T("droite")}') + '</span></h2>'
        + '<div class="cx-etat"><span>${T("Longueur")}</span><span>' + (an ? esc(lUnite(an.bords[E.bord])) : '…') + '</span></div>'
        + '<div class="at-champs"><label class="large">${T("Nom du bord")}<input type="text" id="e-bnom" maxlength="30" value="' + esc(z.nom || '') + '" placeholder="${T("Épaule, côté, ourlet…")}"></label></div>'
        + blocAssemblage(p, z)
        + '<div class="at-champs">' + champ('e-bc', '${T("Couture de ce bord")} (' + UNITE + ')', cv != null ? enUnite(cv) : '', 'inputmode="decimal" maxlength="6" placeholder="' + esc(enUnite(p.couture)) + '"') + '</div>'
        + '<div class="ed-gestes"><button type="button" class="mini" id="e-b-ourlet">${T("Mettre l’ourlet")}</button>'
        + '<button type="button" class="mini" id="e-b-piece">${T("Valeur de la pièce")}</button>'
        + '<button type="button" class="mini" id="e-b-type">' + (z.c1 && z.c2 ? '${T("Rendre droit")}' : '${T("Rendre courbe")}') + '</button></div><div class="cx-sep"></div>';
    }
    h += '<div class="at-champs">'
      + '<label class="large">${T("Nom")}<input type="text" id="e-pnom" maxlength="40" value="' + esc(p.nom || nomPiece(p)) + '"></label>'
      + champ('e-pqte', '${T("Quantité")}', String(p.qte || 1), 'inputmode="numeric" maxlength="2"')
      + '<label>${T("Tissu")}<select id="e-ptissu">' + Object.keys(LTISSU).map(function(k){ return '<option value="' + k + '"' + (p.tissu === k ? ' selected' : '') + '>' + LTISSU[k] + '</option>'; }).join('') + '</select></label>'
      + champ('e-pcout', '${T("Couture")} (' + UNITE + ')', enUnite(p.couture != null ? p.couture : 1), 'inputmode="decimal" maxlength="6"')
      + champ('e-pourl', '${T("Ourlet")} (' + UNITE + ')', enUnite(p.ourlet != null ? p.ourlet : 3), 'inputmode="decimal" maxlength="6"')
      + '<label class="large" style="flex-direction:row;align-items:center;gap:.45rem"><input type="checkbox" id="e-ppli"' + (p.aupli ? ' checked' : '') + (p.pli ? '' : ' disabled') + '>${T("Coupé au pli (le bord du pli ne prend pas de couture)")}</label>'
      + '</div>';
    if (an) {
      var surcharges = Object.keys(p.coutures || {}).length;
      h += '<div class="cx-sep"></div><h2>${T("Contrôle")}</h2>'
        + '<div class="cx-etat"><span>${T("Périmètre (ligne de couture)")}</span><span>' + esc(lUnite(an.perimetre)) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Encombrement")}</span><span>' + esc(enUnite(an.boite.l) + ' × ' + lUnite(an.boite.h)) + '</span></div>'
        + '<div class="cx-etat"><span>${T("Bords à couture propre")}</span><span>' + surcharges + '</span></div>'
        + '<div class="cx-etat"><span>${T("Tissu estimé, tout le patron (laize 140 cm)")}</span><span>' + String(AN.tissu ? AN.tissu.metres : 0).replace('.', '${SEP_DEC()}') + ' m</span></div>'
        + '<div class="ed-bords">' + an.bords.map(function(L, b){
            return '<button type="button" class="ed-ligne' + (E.bord === b ? ' on' : '') + '" data-ebord="' + b + '"><span>' + esc(nomBord(p, b))
              + ((p.coutures || {})[b] != null ? ' · ' + esc(lUnite(p.coutures[b])) : '') + '</span><span>' + esc(lUnite(L)) + '</span></button>';
          }).join('') + '</div>';
    }
    return h;
  }
  function panneauPieces(){
    return '<h2>${T("Pièces")}</h2>' + E.pieces.map(function(p, i){
        return '<button type="button" class="ed-ligne' + (E.sel === i ? ' on' : '') + '" data-epiece="' + i + '" data-ctx-ligne="p:' + i + '"><span>' + esc(nomPiece(p)) + '</span><span>×' + (p.qte || 1) + (p.aupli ? ' ${T("au pli")}' : '') + ' · ' + esc(LTISSU[p.tissu] || '') + '</span></button>';
      }).join('')
      + '<div class="ed-gestes"><button type="button" class="mini" id="e-p-rect">${T("+ Pièce rectangulaire")}</button>'
      + (E.sel >= 0 ? '<button type="button" class="mini" id="e-p-dupl">${T("Dupliquer la pièce")}</button><button type="button" class="mini danger" id="e-p-suppr">${T("Supprimer la pièce")}</button>' : '')
      + '</div><div class="ed-note">${T("Une pièce rectangulaire se pose à 20 × 30 cm : parementure, poche, ceinture… à reformer ensuite.")}</div>'
      + '<div class="cx-sep"></div><h2>${T("Coutures assemblées")}</h2>'
      + ((E.ass || []).length ? (E.ass || []).map(function(x, j){
          var inf = infoAss(x), e = inf ? inf.ecart : null, bon = e != null && Math.abs(e) < 0.15;
          return '<button type="button" class="ed-ligne" data-eass="' + j + '"><span>' + esc(libRef(x.a)) + ' ↔ ' + esc(libRef(x.b)) + '</span><span>'
            + (e == null ? '…' : (bon ? '${T("égales")}' : (e > 0 ? '+' : '') + esc(lUnite(e)))) + '</span></button>';
        }).join('') : '<div class="cx-sub">${T("Aucune. Choisissez un bord, puis « Assembler avec un autre bord… ».")}</div>')
      + '<div class="ed-note">${T("L’écart est la longueur du second bord moins celle du premier ; « Égaliser » allonge ou raccourcit le second.")}</div>';
  }
  function panneauHist(){
    var h = !PILE.length ? '<h2>${T("Historique")}</h2><div class="cx-sub">${T("Aucune modification depuis l’ouverture.")}</div>'
      : '<h2>${T("Historique")}</h2><div class="ed-note">${T("Cliquez une étape pour revenir juste avant elle.")}</div>'
      + PILE.map(function(d, n){ return { d: d, n: n }; }).reverse().map(function(o){
          return '<button type="button" class="ed-ligne" data-ehist="' + o.n + '"><span>' + esc(o.d.lib) + '</span><span>' + (o.n + 1) + '</span></button>';
        }).join('');
    var vs = (E.m.versions || []).slice().reverse();
    h += '<div class="cx-sep"></div><h2>${T("Versions enregistrées")}</h2>'
      + vs.map(function(v){
          var actuelle = v.n === E.m.version;
          // une version restaurée porte « restaure » (son numéro d origine) : la note se dit alors dans la langue de la fenêtre
          return '<div class="cx-etat"><span>v' + v.n + ' — ' + esc(v.restaure ? '${T("retour à la version {0}")}'.split('{0}').join(v.restaure) : szTd(String(v.note || ''))) + '<span class="cx-gris"> · ' + esc(jour(v.date)) + '</span></span><span>'
            + (actuelle ? '<span class="cx-gris">${T("actuelle")}</span>' : (v.restaurable && D.peutModifier ? '<button type="button" class="mini" data-erest="' + v.n + '">${T("Restaurer")}</button>' : ''))
            + '</span></div>';
        }).join('')
      + '<div class="ed-note">${T("Restaurer crée une nouvelle version avec les pièces d’alors : rien n’est effacé. Les 5 dernières versions qui ont changé les pièces se restaurent.")}</div>';
    return h;
  }
  function peindrePanneau(force){
    var z = document.getElementById('e-pan'); if (!z || !E) return;
    if (!force && document.activeElement && z.contains(document.activeElement) && /^(INPUT|SELECT)$/.test(document.activeElement.tagName)) return;
    var seg = function(k, lib){ return '<button type="button" class="' + (ONGLET === k ? 'on' : '') + '" data-eonglet="' + k + '">' + lib + '</button>'; };
    z.innerHTML = '<div class="ed-seg" role="group" aria-label="${T("Panneau")}">' + seg('prop', '${T("Propriétés")}') + seg('grad', '${T("Gradation")}') + seg('pieces', '${T("Pièces")}') + seg('hist', '${T("Historique")}') + '</div>'
      + (ONGLET === 'pieces' ? panneauPieces() : ONGLET === 'hist' ? panneauHist() : ONGLET === 'grad' ? panneauGrad() : panneauProp());
  }
  function teteEditeur(){
    document.getElementById('titre').textContent = E.m.nom || '${T("Modèle")}';
    document.getElementById('sous').textContent = (E.m.ref ? E.m.ref + ' · ' : '') + 'v' + (E.m.version || 1)
      + (SALE ? ' · ${T("modifications non enregistrées")}' : '');
    var a = document.getElementById('actions');
    a.innerHTML = '<button type="button" id="e-retour">${T("← Bibliothèque")}</button>'
      + '<button type="button" id="e-3d">${T("Aperçu 3D")}</button>'
      + '<button type="button" id="e-imprimer">${T("Imprimer / exporter")}</button>'
      + '<button type="button" id="e-annuler" title="${T("Annuler (Ctrl+Z)")}" aria-label="${T("Annuler")}"' + (PILE.length ? '' : ' disabled') + '>↶</button>'
      + '<button type="button" id="e-refaire" title="${T("Refaire (Ctrl+Y)")}" aria-label="${T("Refaire")}"' + (REFAIRE.length ? '' : ' disabled') + '>↷</button>'
      + (D.peutModifier ? '<button type="button" class="prim" id="e-enreg"' + (SALE ? '' : ' disabled') + '>${T("Enregistrer la version")}</button>' : '');
  }
  function dessinerEditeur(){
    teteEditeur();
    var o = '<div class="ed-outils" role="toolbar" aria-label="${T("Outils")}">'
      + OUTILS.map(function(t){
          return '<button type="button" class="ed-outil' + (OUTIL === t.cle ? ' on' : '') + '" data-eoutil="' + t.cle + '" title="' + esc(t.lib + ' (' + t.touche + ')') + '" aria-pressed="' + (OUTIL === t.cle) + '">' + t.ico + '<span>' + t.lib + '</span></button>';
        }).join('') + '</div>';
    var chip = function(attr, k, lib, on){ return '<button type="button" class="mini' + (on ? ' on' : '') + '" ' + attr + '="' + k + '" aria-pressed="' + !!on + '">' + lib + '</button>'; };
    var bas = '<div class="ed-bas">'
      + '<span class="grp">${T("Aimanter :")}' + chip('data-eaim', 'points', '${T("Points")}', AIM.points) + chip('data-eaim', 'grille', '${T("Grille 5 mm")}', AIM.grille) + chip('data-eaim', 'a45', '45°', AIM.a45) + '</span>'
      + '<span class="grp">${T("Calques :")}' + chip('data-ecalq', 'couture', '${T("Ligne de coupe")}', CALQ.couture) + chip('data-ecalq', 'crans', '${T("Crans")}', CALQ.crans) + chip('data-ecalq', 'constr', '${T("Construction")}', CALQ.constr) + chip('data-ecalq', 'tailles', '${T("Toutes les tailles")}', CALQ.tailles) + '</span>'
      + '<span class="grp">${T("Zoom :")} <b id="e-zoom"></b>' + chip('data-ezoom', '25', '25 %', false) + chip('data-ezoom', '50', '50 %', false) + chip('data-ezoom', '100', '${T("100 % (taille réelle)")}', false) + chip('data-ezoom', 'ajuster', '${T("Tout voir")}', false) + '</span>'
      + '<span class="grp">${T("Unité :")}' + chip('data-eunite', 'cm', 'cm', UNITE === 'cm') + chip('data-eunite', 'mm', 'mm', UNITE === 'mm') + chip('data-eunite', 'po', '${T("po")}', UNITE === 'po') + '</span>'
      + '</div>';
    corps.innerHTML = '<div class="ed-cadre">' + o
      + '<div class="ed-toile o-' + OUTIL + '" id="e-toile"><svg id="e-svg" role="img" aria-label="${T("Toile de l’éditeur de patron")}"></svg><span class="ed-coin" id="e-coin"></span></div>'
      + '<div class="cx-carte ed-panneau" id="e-pan"></div></div>' + bas
      + '<div class="ed-note">' + '${T("Retouches sur la taille de base ({0}) ; les autres tailles suivent la règle de gradation de chaque point (onglet Gradation, calque « Toutes les tailles »).")}'.split('{0}').join(esc(E.m.tailleBase || 'M')) + '</div>';
    peindre(); peindrePanneau(true);
    /* La toile change de taille APRÈS le premier dessin (le panneau se remplit, la fenêtre se règle) :
       on redessine à chaque changement de sa taille, sinon la grille s arrête au milieu. */
    var tz = document.getElementById('e-toile');
    if (window.ResizeObserver && tz) {
      if (window._atRO) window._atRO.disconnect();
      window._atRO = new ResizeObserver(function(){ if (VUE === 'editeur' && E) peindre(); });
      window._atRO.observe(tz);
    }
  }
  function apresChangement(){ teteEditeur(); peindre(); peindrePanneau(); analyser(); }

  var anT = null, anN = 0;
  function analyser(){
    clearTimeout(anT);
    anT = setTimeout(function(){
      var n = ++anN;
      appeler('atelier:analyser', [{ pieces: E.pieces, assemblages: E.ass, laize: 140 }]).then(function(r){
        if (n !== anN || VUE !== 'editeur' || !E) return;
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        AN = r; peindre(); peindrePanneau();
      });
      if (CALQ.tailles) appeler('atelier:graduer', [{ pieces: E.pieces, tailleBase: E.m.tailleBase, tailles: E.m.tailles }]).then(function(r){
        if (n !== anN || VUE !== 'editeur' || !E) return;
        GR = r && r.ok ? r : null; peindre();
      });
    }, 180);
  }

  function ouvrirEditeur(id){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (!m) { dire(MOTIFS.introuvable, 'err'); return; }
    if (!(m.pieces || []).length) { dire('${T("Ce modèle n’a pas encore de pièces : enregistrez-le d’abord.")}', 'att'); return; }
    SEL = id;
    dire('${T("Préparation du patron…")}');
    /* Le site complète les pièces : identités des points, noms des bords, règles de gradation, assemblages. */
    appeler('atelier:preparer', [{ base: m.base, tableau: m.tableau, options: m.options, aisances: m.aisances, tailleBase: m.tailleBase,
      pieces: m.pieces, assemblages: m.assemblages, sansAuto: !!m.edite }]).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      E = { m: copie(m), pieces: r.pieces, ass: r.assemblages || [], sel: 0, noeud: -1, poignee: '', bord: -1, cran: -1, pince: -1 };
      E.pieces.forEach(function(p){ if (!p.coutures) p.coutures = {}; });
      PILE = []; REFAIRE = []; SALE = false; AN = null; GR = null; MES = null; ASSDE = null; OUTIL = 'sel'; ONGLET = 'prop';
      VUE = 'editeur';
      ranger(); dessinerEditeur(); ajuster(); peindre(); analyser();
      dire(AIDE_OUTIL.sel);
    });
  }
  function quitterEditeur(){
    var sortir = function(){ E = null; SALE = false; PILE = []; REFAIRE = []; VUE = 'biblio'; dessiner(); dire(''); };
    if (!SALE) { sortir(); return; }
    szConfirmer({ titre: '${T("Quitter sans enregistrer ?")}', texte: '${T("Les retouches du patron depuis le dernier enregistrement seront perdues.")}', oui: '${T("Quitter")}', danger: true })
      .then(function(ok){ if (ok) sortir(); });
  }
  /* L export part de la version ENREGISTRÉE : des retouches en cours s enregistrent d abord. */
  function imprimerDepuisEditeur(){
    if (!E) return;
    var id = E.m.id;
    if (!SALE) { E = null; ouvrirImpression(id, 'editeur'); return; }
    szConfirmer({ titre: '${T("Enregistrer avant d’exporter ?")}', texte: '${T("L’export part de la version enregistrée. Vos retouches en cours seront enregistrées comme une nouvelle version.")}',
      oui: '${T("Enregistrer et exporter")}' }).then(function(ok){
      if (ok) enregistrerEditeur(document.getElementById('e-enreg'), function(){ E = null; ouvrirImpression(id, 'editeur'); });
    });
  }
  /* L aperçu 3D, comme l export, part de la version ENREGISTRÉE. */
  function troisDDepuisEditeur(){
    if (!E) return;
    var id = E.m.id;
    if (!SALE) { E = null; ouvrir3d(id, 'editeur'); return; }
    szConfirmer({ titre: '${T("Enregistrer avant l’aperçu 3D ?")}', texte: '${T("L’aperçu 3D montre la version enregistrée. Vos retouches en cours seront enregistrées comme une nouvelle version.")}',
      oui: '${T("Enregistrer et voir en 3D")}' }).then(function(ok){
      if (ok) enregistrerEditeur(document.getElementById('e-enreg'), function(){ E = null; ouvrir3d(id, 'editeur'); });
    });
  }
  function enregistrerEditeur(btn, apres){
    if (OCCUPE || !E || !SALE) return;
    OCCUPE = true; if (btn) btn.disabled = true;
    dire('${T("Enregistrement…")}');
    appeler('atelier:ecrire', [{ id: E.m.id, nom: E.m.nom, pieces: E.pieces, assemblages: E.ass, piecesEditees: true }]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { if (btn) btn.disabled = false; dire(expliquer(r), 'err'); return; }
      SALE = false;
      appeler('atelier:donnees', []).then(function(d){
        if (d && d.ok) { D = d; var m = (D.modeles || []).filter(function(x){ return x.id === E.m.id; })[0]; if (m && E) E.m = copie(m); }
        if (VUE === 'editeur' && E) { teteEditeur(); dire('${T("Version enregistrée.")}', 'bon'); }
        if (apres) apres();
      });
    });
  }

  /* ── La souris sur la toile ── */
  function souris(ev){
    var svg = document.getElementById('e-svg'); var r = svg.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }
  function pres(i, q, m, rayon){ return Math.hypot(sx(i, q.x) - m.x, sy(i, q.y) - m.y) <= (rayon || 7); }
  /* Le point aimanté (cm de la pièce i) pour un nœud qu on glisse : un autre nœud, 45° depuis le voisin, la grille. */
  function aimanter(i, q, m, exclu, ref, force45){
    var p = E.pieces[i];
    if (AIM.points) {
      for (var k = 0; k < p.contour.length; k++) {
        if (k === exclu) continue;
        if (pres(i, p.contour[k], m, 8)) return { x: p.contour[k].x, y: p.contour[k].y };
      }
    }
    var x = q.x, y = q.y;
    if (ref && (force45 || AIM.a45)) {
      var dx = x - ref.x, dy = y - ref.y, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx), a45 = Math.round(a / (Math.PI / 4)) * (Math.PI / 4);
      if (force45 || Math.abs(a - a45) < 0.06) { x = ref.x + L * Math.cos(a45); y = ref.y + L * Math.sin(a45); }
    }
    var pas = AIM.grille ? 0.5 : 0.1;
    return { x: Math.round(x / pas) * pas, y: Math.round(y / pas) * pas };
  }
  function cibleBord(m){
    var best = null;
    var ordre = E.pieces.map(function(p, i){ return i; });
    if (E.sel >= 0) { ordre.splice(E.sel, 1); ordre.unshift(E.sel); }
    ordre.forEach(function(i){
      var pp = versPiece(i, m.x, m.y), b = plusProcheBord(E.pieces[i], pp.x, pp.y);
      if (b && b.d * K <= 9 && (!best || b.d * K < best.d * K - 0.5)) { best = b; best.piece = i; }
    });
    return best;
  }
  function pieceSous(m){                      // la pièce choisie d abord (elle est dessinée par-dessus)
    var ordre = E.sel >= 0 ? [E.sel] : [];
    for (var i = E.pieces.length - 1; i >= 0; i--) if (i !== E.sel) ordre.push(i);
    for (var k = 0; k < ordre.length; k++) { var pp = versPiece(ordre[k], m.x, m.y); if (dedans(E.pieces[ordre[k]], pp.x, pp.y)) return ordre[k]; }
    return -1;
  }
  function choisir(i){ if (E.sel !== i) { E.sel = i; deselectionner(true); } }

  function baisser(ev){
    if (ev.button !== 0 && ev.button !== 1) return;
    var m = souris(ev);
    if (ev.button === 1) { GLISSE = { type: 'vue', m0: m, ox: OX, oy: OY }; ev.preventDefault(); return; }
    var i = E.sel, p = E.pieces[i];
    if (OUTIL === 'mesure') {
      var at = { x: (m.x - OX) / K, y: (m.y - OY) / K };
      E.pieces.forEach(function(pc, k){ pc.contour.forEach(function(n){ if (pres(k, n, m, 8)) at = { x: n.x + POS[k].x, y: n.y + POS[k].y }; }); });
      if (!MES || MES.b) MES = { a: at, b: null }; else MES.b = at;
      if (MES.b) { ONGLET = 'prop'; peindrePanneau(true); }
      peindre(); return;
    }
    if (OUTIL === 'sel' && p) {
      var L = p.contour.length;
      if (E.noeud >= 0 && E.noeud < L) {               // ① les poignées du point choisi
        var z = p.contour[E.noeud], nx = p.contour[(E.noeud + 1) % L], h = null;
        if (z.c2 && pres(i, z.c2, m)) h = [E.noeud, 'c2']; else if (z.c1 && pres(i, z.c1, m)) h = [E.noeud, 'c1'];
        else if (nx.c1 && pres(i, nx.c1, m)) h = [(E.noeud + 1) % L, 'c1']; else if (nx.c2 && pres(i, nx.c2, m)) h = [(E.noeud + 1) % L, 'c2'];
        if (h) { GLISSE = { type: 'poignee', piece: i, n: h[0], c: h[1], avant: etat(), m0: m }; return; }
      }
      for (var k = 0; k < L; k++) if (pres(i, p.contour[k], m)) {   // ② les points
        E.noeud = k; E.bord = -1; E.cran = -1; E.pince = -1;
        GLISSE = { type: 'noeud', piece: i, n: k, avant: etat(), m0: m }; peindre(); peindrePanneau(); return;
      }
      if (CALQ.constr) {
        for (var d = 0; d < (p.pinces || []).length; d++) {        // ③ les pointes de pince
          var pc = p.pinces[d], cles = ['sommet', 'gauche', 'droite'].concat(pc.bas ? ['bas'] : []);
          for (var c = 0; c < cles.length; c++) if (pres(i, pc[cles[c]], m)) {
            E.pince = d; E.noeud = -1; E.bord = -1; E.cran = -1;
            GLISSE = { type: 'pince', piece: i, d: d, c: cles[c], avant: etat(), m0: m }; peindre(); peindrePanneau(); return;
          }
        }
        if (p.droitFil) for (var e = 0; e < 2; e++) { var cl = e ? 'b' : 'a';  // ④ le droit-fil
          if (pres(i, p.droitFil[cl], m)) { GLISSE = { type: 'fil', piece: i, c: cl, avant: etat(), m0: m }; return; } }
      }
      if (CALQ.crans) for (var g = 0; g < (p.crans || []).length; g++) if (pres(i, p.crans[g], m)) {   // ⑤ les crans
        E.cran = g; E.noeud = -1; E.bord = -1; E.pince = -1;
        GLISSE = { type: 'cran', piece: i, c: g, avant: etat(), m0: m }; peindre(); peindrePanneau(); return;
      }
    }
    var cb = cibleBord(m);
    if (OUTIL !== 'sel') {
      if (OUTIL === 'cran' && E.sel >= 0) {             // un clic sur un cran existant le retire
        var pcr = E.pieces[E.sel];
        for (var q = 0; q < (pcr.crans || []).length; q++) if (pres(E.sel, pcr.crans[q], m)) {
          memo('${T("Cran retiré")}'); pcr.crans.splice(q, 1); E.cran = -1; apresChangement(); return; }
      }
      if (!cb) { dire('${T("Cliquez plus près d’un bord.")}', 'att'); return; }
      choisir(cb.piece);
      var pp = E.pieces[cb.piece];
      if (OUTIL === 'point') {
        memo('${T("Point ajouté")}');
        var at2 = ajouterPoint(cb.piece, cb.bord, cb.t); E.noeud = at2; E.bord = -1; apresChangement(); return;
      }
      if (OUTIL === 'courbe') {
        var z2 = pp.contour[cb.bord], a2 = debutBord(pp, cb.bord);
        if (z2.c1 && z2.c2) { memo('${T("Bord rendu droit")}'); delete z2.c1; delete z2.c2; }
        else { memo('${T("Bord rendu courbe")}'); z2.c1 = { x: r2(a2.x + (z2.x - a2.x) / 3), y: r2(a2.y + (z2.y - a2.y) / 3) }; z2.c2 = { x: r2(a2.x + 2 * (z2.x - a2.x) / 3), y: r2(a2.y + 2 * (z2.y - a2.y) / 3) }; }
        E.noeud = cb.bord; E.bord = -1; OUTIL = 'sel'; dessinerEditeur(); analyser();
        dire('${T("Glissez les poignées bleues pour former la courbe.")}'); return;
      }
      if (OUTIL === 'cran') { memo('${T("Cran posé")}'); pp.crans = pp.crans || []; pp.crans.push({ x: r2(cb.pt.x), y: r2(cb.pt.y) }); E.cran = pp.crans.length - 1; apresChangement(); return; }
      if (OUTIL === 'pince') {
        var t0 = Math.max(0, cb.t - 0.01), t1 = Math.min(1, cb.t + 0.01), u0 = pointBord(pp, cb.bord, t0), u1 = pointBord(pp, cb.bord, t1);
        var ux = u1.x - u0.x, uy = u1.y - u0.y, ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
        var sg = sensPiece(pp), nx2 = -sg * uy, ny2 = sg * ux;     // vers l intérieur de la pièce
        memo('${T("Pince posée")}');
        pp.pinces = pp.pinces || [];
        pp.pinces.push({ sommet: { x: r2(cb.pt.x + nx2 * 8), y: r2(cb.pt.y + ny2 * 8) }, gauche: { x: r2(cb.pt.x - ux), y: r2(cb.pt.y - uy) }, droite: { x: r2(cb.pt.x + ux), y: r2(cb.pt.y + uy) }, bas: null });
        E.pince = pp.pinces.length - 1; OUTIL = 'sel'; dessinerEditeur(); analyser(); return;
      }
      return;
    }
    if (cb && ASSDE) {                          // « Assembler avec… » : le second bord
      var pb = E.pieces[cb.piece], kb = pb.contour[cb.bord].k, de = ASSDE; ASSDE = null;
      if (de.p === pb.id && de.k === kb) { dire('${T("Choisissez un AUTRE bord.")}', 'att'); return; }
      memo('${T("Bords assemblés")}');
      E.ass = (E.ass || []).filter(function(x){ return !((x.a.p === de.p && x.a.k === de.k) || (x.b.p === de.p && x.b.k === de.k) || (x.a.p === pb.id && x.a.k === kb) || (x.b.p === pb.id && x.b.k === kb)); });
      E.ass.push({ a: de, b: { p: pb.id, k: kb } });
      choisir(cb.piece); E.bord = cb.bord; ONGLET = 'prop'; apresChangement(); peindrePanneau(true);
      dire('${T("Bords assemblés : l’écart s’affiche dans les propriétés.")}', 'bon'); return;
    }
    if (cb) { choisir(cb.piece); E.bord = cb.bord; E.noeud = -1; E.cran = -1; E.pince = -1; ONGLET = 'prop'; peindre(); peindrePanneau(true); return; }
    var sous = pieceSous(m);
    if (sous >= 0) { choisir(sous); peindre(); peindrePanneau(true); GLISSE = { type: 'piece', piece: sous, m0: m, avant: etat(), px: POS[sous].x, py: POS[sous].y }; return; }
    E.sel = -1; deselectionner(); MES = null; peindre(); peindrePanneau(true);
    GLISSE = { type: 'vue', m0: m, ox: OX, oy: OY };
  }
  function bouger(ev){
    if (!GLISSE || VUE !== 'editeur') {
      var cz = document.getElementById('e-coin');
      if (cz && VUE === 'editeur' && ev.target && ev.target.closest && ev.target.closest('#e-toile')) {
        var mm = souris(ev), ix = E.sel >= 0 ? E.sel : -1;
        var q0 = ix >= 0 ? versPiece(ix, mm.x, mm.y) : { x: (mm.x - OX) / K, y: (mm.y - OY) / K };
        cz.textContent = 'x ' + enUnite(q0.x) + ' · y ' + lUnite(q0.y);
      }
      return;
    }
    var m = souris(ev), g = GLISSE;
    if (!g.bouge && Math.hypot(m.x - g.m0.x, m.y - g.m0.y) < 3) return;
    g.bouge = true;
    var tz = document.getElementById('e-toile'); if (tz) tz.classList.add('glisse');
    if (g.type === 'vue') { OX = g.ox + m.x - g.m0.x; OY = g.oy + m.y - g.m0.y; peindre(); return; }
    if (g.type === 'piece') { POS[g.piece].x = g.px + (m.x - g.m0.x) / K; POS[g.piece].y = g.py + (m.y - g.m0.y) / K; peindre(); return; }
    var p = E.pieces[g.piece], q = versPiece(g.piece, m.x, m.y);
    if (g.type === 'noeud') {
      var L = p.contour.length, n = p.contour[g.n], prev = p.contour[(g.n - 1 + L) % L], nx = p.contour[(g.n + 1) % L];
      var a = aimanter(g.piece, q, m, g.n, prev, ev.shiftKey), dx = a.x - n.x, dy = a.y - n.y;
      suivreCrans(p, n, dx, dy);
      n.x = r2(a.x); n.y = r2(a.y);
      if (n.c2) { n.c2.x = r2(n.c2.x + dx); n.c2.y = r2(n.c2.y + dy); }
      if (nx.c1 && nx !== n) { nx.c1.x = r2(nx.c1.x + dx); nx.c1.y = r2(nx.c1.y + dy); }
    } else if (g.type === 'poignee') {
      var hp = p.contour[g.n][g.c], ancre = g.c === 'c2' ? p.contour[g.n] : debutBord(p, g.n);
      var a2 = aimanter(g.piece, q, m, -2, ancre, ev.shiftKey); hp.x = r2(a2.x); hp.y = r2(a2.y);
    } else if (g.type === 'pince') {
      var a3 = aimanter(g.piece, q, m, -2, null, false); p.pinces[g.d][g.c] = { x: r2(a3.x), y: r2(a3.y) };
    } else if (g.type === 'fil') {
      var o = p.droitFil[g.c === 'a' ? 'b' : 'a'], a4 = aimanter(g.piece, q, m, -2, o, ev.shiftKey); p.droitFil[g.c] = { x: r2(a4.x), y: r2(a4.y) };
    } else if (g.type === 'cran') {
      var bb = plusProcheBord(p, q.x, q.y); if (bb) p.crans[g.c] = { x: r2(bb.pt.x), y: r2(bb.pt.y) };   // un cran reste sur le contour
    }
    peindre();
    var cz2 = document.getElementById('e-coin'); if (cz2) cz2.textContent = 'x ' + enUnite(q.x) + ' · y ' + lUnite(q.y);
  }
  function lever(){
    var g = GLISSE; GLISSE = null;
    var tz = document.getElementById('e-toile'); if (tz) tz.classList.remove('glisse');
    if (!g || !g.bouge || VUE !== 'editeur') return;
    if (g.type === 'vue') return;
    var LIB = { piece: '${T("Pièce déplacée sur la toile")}', noeud: '${T("Point déplacé")}', poignee: '${T("Courbe reformée")}', pince: '${T("Pince réglée")}', fil: '${T("Droit-fil réglé")}', cran: '${T("Cran déplacé")}' };
    PILE.push({ lib: LIB[g.type] || '${T("Modification")}', e: g.avant }); if (PILE.length > 100) PILE.shift();
    REFAIRE = [];
    if (g.type !== 'piece') SALE = true;
    apresChangement();
  }

  /* ── Le panneau et la barre du bas ── */
  function clicEditeur(ev){
    var t = ev.target, b;
    if ((b = t.closest('[data-eoutil]'))) { OUTIL = b.getAttribute('data-eoutil'); MES = null; dessinerEditeur(); dire(AIDE_OUTIL[OUTIL]); return; }
    if ((b = t.closest('[data-eonglet]'))) { ONGLET = b.getAttribute('data-eonglet'); peindrePanneau(true); return; }
    if ((b = t.closest('[data-eaim]'))) { var a = b.getAttribute('data-eaim'); AIM[a] = !AIM[a]; dessinerEditeur(); return; }
    if ((b = t.closest('[data-ecalq]'))) { var c = b.getAttribute('data-ecalq'); CALQ[c] = !CALQ[c]; dessinerEditeur(); if (c === 'tailles' && CALQ.tailles) analyser(); return; }
    if ((b = t.closest('[data-eunite]'))) { UNITE = b.getAttribute('data-eunite'); dessinerEditeur(); return; }
    if ((b = t.closest('[data-ezoom]'))) {
      var zv = b.getAttribute('data-ezoom'), tz = document.getElementById('e-toile');
      if (zv === 'ajuster') { ajuster(); peindre(); } else zoomer(37.8 * parseInt(zv, 10) / 100, tz.clientWidth / 2, tz.clientHeight / 2);
      return;
    }
    if ((b = t.closest('[data-epiece]'))) { choisir(parseInt(b.getAttribute('data-epiece'), 10)); peindre(); peindrePanneau(true); return; }
    if ((b = t.closest('[data-ebord]'))) { E.bord = parseInt(b.getAttribute('data-ebord'), 10); E.noeud = -1; E.cran = -1; E.pince = -1; peindre(); peindrePanneau(true); return; }
    if ((b = t.closest('[data-eass]'))) {
      var xa = (E.ass || [])[parseInt(b.getAttribute('data-eass'), 10)]; if (!xa) return;
      var ip = E.pieces.findIndex(function(q){ return q.id === xa.b.p; });
      if (ip >= 0) { choisir(ip); E.bord = E.pieces[ip].contour.findIndex(function(n){ return n.k === xa.b.k; }); ONGLET = 'prop'; peindre(); peindrePanneau(true); }
      return;
    }
    if ((b = t.closest('[data-erest]'))) { restaurerVersion(parseInt(b.getAttribute('data-erest'), 10)); return; }
    if ((b = t.closest('[data-ehist]'))) { revenirA(parseInt(b.getAttribute('data-ehist'), 10)); dire('${T("Patron remis à cette étape.")}'); return; }
    var p = E.pieces[E.sel];
    if (t.closest('#e-retirer-point') && p) { memo('${T("Point retiré")}'); if (retirerPoint(E.sel, E.noeud)) { E.noeud = -1; apresChangement(); } else PILE.pop(); return; }
    if (t.closest('#e-retirer-cran') && p) { memo('${T("Cran retiré")}'); p.crans.splice(E.cran, 1); E.cran = -1; apresChangement(); return; }
    if (t.closest('#e-retirer-pince') && p) { memo('${T("Pince retirée")}'); p.pinces.splice(E.pince, 1); E.pince = -1; apresChangement(); return; }
    if (t.closest('#e-b-ourlet') && p) { memo('${T("Ourlet posé sur un bord")}'); p.coutures[E.bord] = p.ourlet != null ? p.ourlet : 3; apresChangement(); return; }
    if (t.closest('#e-b-piece') && p) { memo('${T("Couture du bord remise à celle de la pièce")}'); delete p.coutures[E.bord]; apresChangement(); return; }
    if (t.closest('#e-b-type') && p) {
      var z = p.contour[E.bord], a0 = debutBord(p, E.bord);
      if (z.c1 && z.c2) { memo('${T("Bord rendu droit")}'); delete z.c1; delete z.c2; }
      else { memo('${T("Bord rendu courbe")}'); z.c1 = { x: r2(a0.x + (z.x - a0.x) / 3), y: r2(a0.y + (z.y - a0.y) / 3) }; z.c2 = { x: r2(a0.x + 2 * (z.x - a0.x) / 3), y: r2(a0.y + 2 * (z.y - a0.y) / 3) }; E.noeud = E.bord; }
      apresChangement(); return;
    }
    if (t.closest('#e-ass-de') && p) { ASSDE = { p: p.id, k: p.contour[E.bord].k }; OUTIL = 'sel'; dire('${T("Cliquez maintenant le bord qui se coud avec celui-ci.")}', 'att'); return; }
    if (t.closest('#e-ass-defaire') && p) {
      var zd = p.contour[E.bord]; memo('${T("Assemblage défait")}');
      E.ass = (E.ass || []).filter(function(x){ return !((x.a.p === p.id && x.a.k === zd.k) || (x.b.p === p.id && x.b.k === zd.k)); });
      apresChangement(); peindrePanneau(true); return;
    }
    if (t.closest('#e-ass-egal') && p) { egaliser(p, p.contour[E.bord]); return; }
    var ng = p && E.noeud >= 0 ? p.contour[E.noeud] : null;
    if (t.closest('#e-g-copier') && ng) { PRESSE = copie(ng.g || {}); dire('${T("Règle copiée.")}', 'bon'); peindrePanneau(true); return; }
    if (t.closest('#e-g-coller') && ng && PRESSE) { memo('${T("Règle collée")}'); ng.g = copie(PRESSE); apresChangement(); peindrePanneau(true); return; }
    if (t.closest('#e-g-zero') && ng) { memo('${T("Règle remise à zéro")}'); delete ng.g; apresChangement(); peindrePanneau(true); return; }
    if (t.closest('#e-g-prop') && ng) { proportionnel(ng); return; }
    if (t.closest('#e-p-rect')) { nouvellePiece(); return; }
    if (t.closest('#e-p-dupl') && p) { dupliquerPiece(E.sel); return; }
    if (t.closest('#e-p-suppr') && p) { supprimerPiece(E.sel); return; }
  }
  function egaliser(p, z){
    var x = assDe(p, z); if (!x) return;
    dire('${T("Égalisation…")}');
    appeler('atelier:egaliser', [{ pieces: E.pieces, a: x.a, b: x.b }]).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      memo('${T("Assemblage égalisé")}');
      var garde = {}; E.pieces.forEach(function(q){ garde[q.id] = q.coutures || {}; });
      E.pieces = r.pieces; E.pieces.forEach(function(q){ q.coutures = q.coutures || garde[q.id] || {}; });
      apresChangement(); peindrePanneau(true);
      dire('${T("Égalisé : le second bord a bougé de {0}.")}'.split('{0}').join(lUnite(Math.abs(r.deplacement))), 'bon');
    });
  }
  function proportionnel(n){
    var ts = E.m.tailles || [], tb = E.m.tailleBase || 'M', ib = ts.indexOf(tb);
    var ref = ts[ib + 1] || ts[ib - 1]; if (!ref) { dire('${T("Il faut au moins deux tailles.")}', 'att'); return; }
    var g = (n.g && n.g[ref]) || [0, 0], sens = ts.indexOf(ref) > ib ? 1 : -1;
    if (!g[0] && !g[1]) { dire('${T("Donnez d’abord l’écart de la taille {0}.")}'.split('{0}').join(ref), 'att'); return; }
    memo('${T("Règle proportionnelle")}');
    n.g = n.g || {};
    ts.forEach(function(tl, i){ if (tl === tb) return; var k = (i - ib) * sens; n.g[tl] = [r2(g[0] * k), r2(g[1] * k)]; });
    apresChangement(); peindrePanneau(true);
  }
  function restaurerVersion(nv){
    if (SALE) { dire('${T("Enregistrez ou annulez vos retouches avant de restaurer une version.")}', 'att'); return; }
    szConfirmer({ titre: '${T("Restaurer cette version ?")}', texte: '${T("Les pièces de la version {0} deviennent une nouvelle version. La version actuelle reste dans l’historique.")}'.split('{0}').join(nv),
      oui: '${T("Restaurer la version")}' }).then(function(ok){
      if (!ok) return;
      dire('${T("Restauration…")}');
      appeler('atelier:restaurer', [E.m.id, nv]).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        var mid = E.m.id;
        appeler('atelier:donnees', []).then(function(d){
          if (d && d.ok) D = d;
          E = null; ouvrirEditeur(mid);
          setTimeout(function(){ dire('${T("Version restaurée.")}', 'bon'); }, 400);
        });
      });
    });
  }
  function nouvellePiece(){
    memo('${T("Pièce ajoutée")}');
    var n = E.pieces.length + 1, id = 'piece' + n;
    while (E.pieces.some(function(p){ return p.id === id; })) id += '_';
    E.pieces.push({ id: id, nom: '${T("Nouvelle pièce")}', qte: 1, tissu: 'principal', couture: 1, ourlet: 3, aupli: false, coutures: {},
      contour: [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 30 }, { x: 0, y: 30 }], pinces: [], crans: [], droitFil: { a: { x: 10, y: 5 }, b: { x: 10, y: 25 } }, pli: null, mesures: {} });
    var dern = POS.length ? POS[POS.length - 1] : { x: 0, y: 0 }, bp = E.pieces.length > 1 ? boiteP(E.pieces[E.pieces.length - 2]) : { x1: -8 };
    POS.push({ x: dern.x + bp.x1 + 8, y: 0 });
    E.sel = E.pieces.length - 1; deselectionner(true); ONGLET = 'prop';
    apresChangement();
  }
  function dupliquerPiece(i){
    memo('${T("Pièce dupliquée")}');
    var c = copie(E.pieces[i]), id = c.id + '_2';
    while (E.pieces.some(function(p){ return p.id === id; })) id += '_';
    c.id = id; c.nom = (c.nom || nomPiece(E.pieces[i])) + ' ${T("(copie)")}';
    E.pieces.splice(i + 1, 0, c);
    var b = boiteP(c); POS.splice(i + 1, 0, { x: POS[i].x + (b.x1 - b.x0) + 8, y: POS[i].y + 4 });
    E.sel = i + 1; deselectionner(true); apresChangement();
  }
  function supprimerPiece(i){
    if (E.pieces.length <= 1) { dire('${T("Un patron garde au moins une pièce.")}', 'att'); return; }
    var p = E.pieces[i];
    szConfirmer({ titre: '${T("Supprimer cette pièce ?")}', texte: '${T("La pièce disparaît du patron. « Annuler » la ramène tant que la fenêtre reste ouverte.")}',
      details: [['${T("Pièce")}', nomPiece(p)]], oui: '${T("Supprimer la pièce")}', danger: true }).then(function(ok){
      if (!ok) return;
      memo('${T("Pièce supprimée")}');
      E.pieces.splice(i, 1); POS.splice(i, 1); E.sel = Math.min(i, E.pieces.length - 1); deselectionner(true); apresChangement();
    });
  }
  function changeEditeur(t){
    var p = E.pieces[E.sel]; if (!p) return;
    var id = t.id, v;
    if (id === 'e-nx' || id === 'e-ny') {
      v = depuisUnite(t.value); if (!isFinite(v)) { dire('${T("Nombre illisible.")}', 'err'); return; }
      memo('${T("Point placé au clavier")}');
      var n = p.contour[E.noeud], L = p.contour.length, nx = p.contour[(E.noeud + 1) % L], k = id === 'e-nx' ? 'x' : 'y', dd = r2(v) - n[k];
      suivreCrans(p, n, k === 'x' ? dd : 0, k === 'y' ? dd : 0);
      n[k] = r2(v); if (n.c2) n.c2[k] = r2(n.c2[k] + dd); if (nx.c1 && nx !== n) nx.c1[k] = r2(nx.c1[k] + dd);
    } else if (id === 'e-bc') {
      if (!String(t.value).trim()) { memo('${T("Couture du bord remise à celle de la pièce")}'); delete p.coutures[E.bord]; }
      else { v = depuisUnite(t.value); if (!isFinite(v) || v < 0 || v > 10) { dire('${T("Une couture va de 0 à 10 cm.")}', 'err'); return; } memo('${T("Couture d’un bord")}'); p.coutures[E.bord] = r2(v); }
    } else if (id === 'e-bnom') { memo('${T("Bord renommé")}'); var zb = p.contour[E.bord]; var nb = String(t.value).trim().slice(0, 30); if (nb) zb.nom = nb; else delete zb.nom;
    } else if (t.hasAttribute('data-gt')) {
      v = depuisUnite(t.value); if (!isFinite(v) || Math.abs(v) > 50) { dire('${T("Un déplacement va de −50 à 50 cm.")}', 'err'); return; }
      var ngr = p.contour[E.noeud]; if (!ngr) return;
      memo('${T("Règle de gradation")}');
      var tl = t.getAttribute('data-gt'), c = parseInt(t.getAttribute('data-gc'), 10);
      ngr.g = ngr.g || {}; ngr.g[tl] = (ngr.g[tl] || [0, 0]).slice(0, 2); ngr.g[tl][c] = r2(v);
    } else if (id === 'e-pnom') { memo('${T("Pièce renommée")}'); p.nom = String(t.value).slice(0, 40); }
    else if (id === 'e-pqte') { v = parseInt(t.value, 10); if (!(v >= 1 && v <= 20)) { dire('${T("Une quantité va de 1 à 20.")}', 'err'); return; } memo('${T("Quantité")}'); p.qte = v; }
    else if (id === 'e-ptissu') { memo('${T("Tissu de la pièce")}'); p.tissu = t.value; }
    else if (id === 'e-pcout') { v = depuisUnite(t.value); if (!isFinite(v) || v < 0 || v > 10) { dire('${T("Une couture va de 0 à 10 cm.")}', 'err'); return; } memo('${T("Couture de la pièce")}'); p.couture = r2(v); }
    else if (id === 'e-pourl') { v = depuisUnite(t.value); if (!isFinite(v) || v < 0 || v > 15) { dire('${T("Un ourlet va de 0 à 15 cm.")}', 'err'); return; } memo('${T("Ourlet de la pièce")}'); p.ourlet = r2(v); }
    else if (id === 'e-ppli') { memo(t.checked ? '${T("Pièce coupée au pli")}' : '${T("Pièce coupée en deux")}'); p.aupli = !!t.checked; }
    else return;
    apresChangement(); peindrePanneau(true);
  }
  function toucheEditeur(ev){
    var tag = ev.target && ev.target.tagName;
    var saisie = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
    if ((ev.ctrlKey || ev.metaKey) && !saisie) {
      var k = String(ev.key).toLowerCase();
      if (k === 'z' && !ev.shiftKey) { ev.preventDefault(); annuler(); return true; }
      if (k === 'y' || (k === 'z' && ev.shiftKey)) { ev.preventDefault(); refaire(); return true; }
      if (k === 's') { ev.preventDefault(); enregistrerEditeur(document.getElementById('e-enreg')); return true; }
      return false;
    }
    if (saisie) return false;
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      var p = E.pieces[E.sel]; if (!p) return false;
      ev.preventDefault();
      if (E.noeud >= 0) { memo('${T("Point retiré")}'); if (retirerPoint(E.sel, E.noeud)) { E.noeud = -1; apresChangement(); } else PILE.pop(); }
      else if (E.cran >= 0) { memo('${T("Cran retiré")}'); p.crans.splice(E.cran, 1); E.cran = -1; apresChangement(); }
      else if (E.pince >= 0) { memo('${T("Pince retirée")}'); p.pinces.splice(E.pince, 1); E.pince = -1; apresChangement(); }
      return true;
    }
    var o = OUTILS.filter(function(x){ return x.touche === String(ev.key).toUpperCase(); })[0];
    if (o && !ev.altKey) { OUTIL = o.cle; MES = null; dessinerEditeur(); dire(AIDE_OUTIL[OUTIL]); return true; }
    return false;
  }

  /* ══ IMPRIMER ET EXPORTER (lot 3) ═══════════════════════════════════════
     Tout le contenu des fichiers se FABRIQUE dans le site (atelier:exporter,
     depuis la version ENREGISTRÉE du modèle) ; la fenêtre choisit, montre
     l aperçu que le site dessine, fait changer le HTML en PDF par la coquille
     (P.documentPdf, taille de page exacte) et l enregistre dans le dossier des
     exports (P.enregistrerExport). */
  var IMP = null;
  var DESTS = [
    { cle: 'tuiles', grp: 'patron', lib: '${T("Imprimante de bureau")}', sous: '${T("PDF en tuiles · Lettre, Légal, A4, A3 · à assembler")}' },
    { cle: 'grand', grp: 'patron', lib: '${T("Traceur grand format")}', sous: '${T("PDF A0 ou rouleau 36 po / 60 po")}' },
    { cle: 'plt', grp: 'patron', lib: '${T("Traceur (PLT / HPGL)")}', sous: '${T("Fichier de traçage · imprimante « PBX » : modèle à préciser")}' },
    { cle: 'dxf', grp: 'patron', lib: '${T("Table de coupe")}', sous: '${T("DXF-AAMA · un bloc par pièce et par taille")}' },
    { cle: 'svg', grp: 'fichiers', lib: '${T("Fichier ouvert (SVG)")}', sous: '${T("Vectoriel, à l’échelle 1, en millimètres")}' },
    { cle: 'fiche', grp: 'documents', lib: '${T("Fiche technique")}', sous: '${T("PDF Lettre : croquis, mesures, pièces, tissu")}' }
  ];
  var LGRP = { patron: '${T("Patron")}', fichiers: '${T("Fichiers ouverts")}', documents: '${T("Documents")}' };
  var LPAPIER = { lettre: '${T("Lettre (8,5 × 11 po)")}', legal: '${T("Légal (8,5 × 14 po)")}', a4: 'A4', a3: 'A3', tabloid: '${T("Tabloïd (11 × 17 po)")}' };
  var LTRACEUR = { a0: '${T("A0 (841 × 1189 mm)")}', r36: '${T("Rouleau 36 po (914 mm)")}', r60: '${T("Rouleau 60 po (1524 mm)")}' };

  function ouvrirImpression(id, retour){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (!m) { dire(MOTIFS.introuvable, 'err'); return; }
    SEL = id;
    IMP = { id: id, m: m, retour: retour || 'biblio', format: (IMP && IMP.format) || 'tuiles', papier: (IMP && IMP.papier) || 'lettre',
      chev: (IMP && IMP.chev != null) ? IMP.chev : 10, traceur: 'a0', tailles: 'base', pieces: (m.pieces || []).map(function(p){ return p.id; }),
      calques: { couture: true, crans: true, constr: true, noms: true }, encre: false, ap: null };
    VUE = 'impression'; dessiner(); apercuImpression();
  }
  function optsImpression(apercu){
    var t = IMP.format === 'plt' && IMP.traceur === 'a0' ? 'r36' : IMP.traceur;
    return { id: IMP.id, format: IMP.format, papier: IMP.papier, chevauchement: IMP.chev, traceur: t, tailles: IMP.tailles,
      pieces: IMP.pieces, calques: IMP.calques, encre: IMP.encre, apercu: !!apercu };
  }
  var imN = 0;
  function apercuImpression(){
    var n = ++imN, z = document.getElementById('i-apercu');
    if (z) z.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div>';
    appeler('atelier:exporter', [optsImpression(true)]).then(function(r){
      if (n !== imN || VUE !== 'impression' || !IMP) return;
      IMP.ap = r && r.ok ? r : null;
      var zz = document.getElementById('i-apercu'), rs = document.getElementById('i-resume');
      if (!r || !r.ok) { if (zz) zz.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; if (rs) rs.textContent = ''; return; }
      if (zz) zz.innerHTML = r.apercu || '';
      if (rs) rs.textContent = resumeImpression(r);
    });
  }
  function resumeImpression(r){
    var q = r.resume || {}, cm2 = function(v){ return String(Math.round((v || 0) * 10) / 10).replace('.', '${SEP_DEC()}'); };
    if (r.format === 'tuiles') return '${T("{0} pages {1} ({2} × {3}) + 1 page de plan · nom du fichier : {4}")}'.split('{0}').join(q.cols * q.rangs).split('{1}').join(szTd(q.papier || '')).split('{2}').join(q.cols).split('{3}').join(q.rangs).split('{4}').join(r.nom);
    if (r.format === 'grand') return '${T("{0} feuille(s) · plan de {1} × {2} cm · {3}")}'.split('{0}').join(r.pages).split('{1}').join(cm2(q.largeur)).split('{2}').join(cm2(q.hauteur)).split('{3}').join(r.nom);
    if (r.format === 'fiche') return '${T("1 page Lettre · {0}")}'.split('{0}').join(r.nom);
    return '${T("Plan de {0} × {1} cm · {2}")}'.split('{0}').join(cm2(q.largeur)).split('{1}').join(cm2(q.hauteur)).split('{2}').join(r.nom);
  }
  function dessinerImpression(){
    var m = IMP.m;
    document.getElementById('titre').textContent = '${T("Imprimer et exporter")}';
    document.getElementById('sous').textContent = m.nom + (m.ref ? ' · ' + m.ref : '') + ' · v' + (m.version || 1) + ' · '
      + '${T("{0} pièces")}'.split('{0}').join((m.pieces || []).length);
    document.getElementById('actions').innerHTML = '<button type="button" id="i-retour">' + (IMP.retour === 'editeur' ? '${T("← Éditeur")}' : '${T("← Bibliothèque")}') + '</button>'
      + '<button type="button" id="i-dossier">${T("Ouvrir le dossier des exports")}</button>'
      + '<button type="button" class="prim" id="i-exporter">${T("Exporter le fichier")}</button>';
    var g = '<div class="cx-carte"><h2>${T("Destination")}</h2>', grp = '';
    DESTS.forEach(function(d){
      if (d.grp !== grp) { grp = d.grp; g += '<div class="im-groupe">' + LGRP[grp] + '</div>'; }
      g += '<button type="button" class="im-dest' + (IMP.format === d.cle ? ' on' : '') + '" data-idest="' + d.cle + '" aria-pressed="' + (IMP.format === d.cle) + '"><b>' + d.lib + '</b><span>' + d.sous + '</span></button>';
    });
    g += '</div>';
    var a = '<div class="cx-carte"><h2>${T("Aperçu")}</h2><div class="im-apercu" id="i-apercu"></div><div class="im-resume" id="i-resume"></div></div>';
    var sel = function(id, lib, liste, val){
      return '<label class="large">' + lib + '<select id="' + id + '">' + Object.keys(liste).map(function(k){
        return '<option value="' + k + '"' + (String(val) === k ? ' selected' : '') + '>' + liste[k] + '</option>'; }).join('') + '</select></label>';
    };
    var f = IMP.format, r = '<div class="cx-carte"><h2>${T("Réglages")}</h2><div class="at-champs">';
    if (f === 'tuiles') r += sel('i-papier', '${T("Papier")}', LPAPIER, IMP.papier) + sel('i-chev', '${T("Chevauchement")}', { '0': '${T("Aucun")}', '10': '1 cm', '20': '2 cm' }, IMP.chev);
    if (f === 'grand') r += sel('i-traceur', '${T("Format")}', LTRACEUR, IMP.traceur);
    if (f === 'plt') r += sel('i-traceur', '${T("Largeur du rouleau")}', { r36: LTRACEUR.r36, r60: LTRACEUR.r60 }, IMP.traceur === 'a0' ? 'r36' : IMP.traceur);
    r += '</div>';
    if (f !== 'fiche') {
      var tb = esc(m.tailleBase || 'M');
      r += '<div class="cx-sep"></div><h2>${T("Tailles")}</h2><div class="ed-seg" role="group" aria-label="${T("Tailles")}">'
        + [['base', '${T("Taille {0}")}'.split('{0}').join(tb), '${T("Taille {0} seulement")}'.split('{0}').join(tb)], ['toutes', '${T("Emboîtées")}', '${T("Toutes, emboîtées")}'], ['separees', '${T("Par taille")}', '${T("Une série par taille")}']].map(function(o){
            return '<button type="button" class="' + (IMP.tailles === o[0] ? 'on' : '') + '" data-itailles="' + o[0] + '" title="' + o[2] + '">' + o[1] + '</button>'; }).join('') + '</div>'
        + '<div class="cx-sep"></div><h2>${T("Pièces")}</h2><div class="im-cases">'
        + (m.pieces || []).map(function(p){
            return '<label><input type="checkbox" data-ipiece="' + esc(p.id) + '"' + (IMP.pieces.indexOf(p.id) >= 0 ? ' checked' : '') + '>' + esc(nomPiece(p)) + '</label>'; }).join('')
        + '</div><div class="cx-sep"></div><h2>${T("Sur le patron")}</h2><div class="im-cases">'
        + [['couture', '${T("Ligne de couture (pointillé)")}'], ['crans', '${T("Crans")}'], ['constr', '${T("Pinces")}'], ['noms', '${T("Droit-fil, pli, nom et taille des pièces")}']].map(function(o){
            return '<label><input type="checkbox" data-icalque="' + o[0] + '"' + (IMP.calques[o[0]] ? ' checked' : '') + '>' + o[1] + '</label>'; }).join('')
        + '<label><input type="checkbox" id="i-encre"' + (IMP.encre ? ' checked' : '') + '>${T("Économie d’encre (traits fins)")}</label></div>';
    }
    r += '<div class="cx-sep"></div><div class="ed-note">' + (f === 'tuiles' || f === 'grand'
      ? '${T("Imprimez à 100 % (taille réelle), jamais « ajuster à la page ». Après l’impression, mesurez le carré de contrôle : s’il ne fait pas 10 cm, l’imprimante a mis la page à l’échelle.")}'
      : f === 'plt' ? '${T("Le fichier PLT (HPGL, 40 unités par mm) convient à la plupart des traceurs. Pour l’imprimante « PBX », donnez-nous son modèle exact : son format propre pourra s’ajouter.")}'
      : f === 'dxf' ? '${T("DXF-AAMA en millimètres : contour sur le calque 1, couture 14, crans 4, droit-fil 7, pli 6, pinces 8.")}'
      : f === 'svg' ? '${T("Le SVG s’ouvre dans Illustrator, Inkscape ou un navigateur ; ses dimensions sont en millimètres réels.")}'
      : '${T("La fiche reprend la version enregistrée du modèle : croquis, tableau de tailles, aisances, pièces et tissu estimé.")}') + '</div>'
      + '<div class="ed-note">${T("L’export part de la version ENREGISTRÉE du modèle.")}</div></div>';
    corps.innerHTML = '<div class="im-trois">' + g + a + r + '</div>';
  }
  function clicImpression(ev){
    var t = ev.target, b;
    if ((b = t.closest('[data-idest]'))) { IMP.format = b.getAttribute('data-idest'); if (IMP.format === 'plt' && IMP.traceur === 'a0') IMP.traceur = 'r36'; dessiner(); apercuImpression(); return; }
    if ((b = t.closest('[data-itailles]'))) { IMP.tailles = b.getAttribute('data-itailles'); dessiner(); apercuImpression(); return; }
  }
  function changeImpression(t){
    var id = t.id;
    if (id === 'i-papier') IMP.papier = t.value;
    else if (id === 'i-chev') IMP.chev = parseInt(t.value, 10) || 0;
    else if (id === 'i-traceur') IMP.traceur = t.value;
    else if (id === 'i-encre') IMP.encre = !!t.checked;
    else if (t.hasAttribute('data-icalque')) IMP.calques[t.getAttribute('data-icalque')] = !!t.checked;
    else if (t.hasAttribute('data-ipiece')) {
      var pid = t.getAttribute('data-ipiece');
      IMP.pieces = IMP.pieces.filter(function(x){ return x !== pid; });
      if (t.checked) IMP.pieces.push(pid);
      if (!IMP.pieces.length) { t.checked = true; IMP.pieces.push(pid); dire('${T("Gardez au moins une pièce.")}', 'att'); return; }
    } else return;
    apercuImpression();
  }
  function exporterFichier(btn){
    if (OCCUPE || !IMP) return;
    if (!P || typeof P.enregistrerExport !== 'function') { dire('${T("Cette version de l’application ne sait pas enregistrer un export.")}', 'err'); return; }
    OCCUPE = true; if (btn) btn.disabled = true;
    var fin = function(msg, cl){ OCCUPE = false; if (btn) btn.disabled = false; dire(msg, cl); };
    dire('${T("Préparation du fichier…")}');
    appeler('atelier:exporter', [optsImpression(false)]).then(function(r){
      if (!r || !r.ok || !r.contenu) { fin(expliquer(r), 'err'); return; }
      var ecrire = function(contenu){
        Promise.resolve(P.enregistrerExport(r.nom, contenu)).then(function(w){
          if (w && w.ok) fin('${T("Enregistré : {0}")}'.split('{0}').join(w.path || r.nom), 'bon');
          else if (w && w.annule) fin('${T("Export annulé : le code d’export n’a pas été donné.")}', 'att');
          else fin('${T("L’enregistrement a échoué : {0}")}'.split('{0}').join((w && w.error) || '?'), 'err');
        });
      };
      if (r.type !== 'pdf') { ecrire(r.contenu); return; }
      if (typeof P.documentPdf !== 'function') { fin('${T("Cette version de l’application ne sait pas fabriquer de PDF.")}', 'err'); return; }
      dire('${T("Fabrication du PDF ({0} pages)…")}'.split('{0}').join(r.pages));
      Promise.resolve(P.documentPdf(r.contenu, { pageCss: true })).then(function(pdf){
        if (!pdf || !pdf.ok || !pdf.base64) { fin('${T("Le PDF n’a pas pu être fabriqué : {0}")}'.split('{0}').join((pdf && pdf.error) || '?'), 'err'); return; }
        ecrire('data:application/pdf;base64,' + pdf.base64);
      });
    });
  }
  function quitterImpression(){
    var r = IMP ? IMP.retour : 'biblio', id = IMP ? IMP.id : '';
    IMP = null;
    if (r === 'editeur' && id) { VUE = 'biblio'; ouvrirEditeur(id); return; }
    VUE = 'biblio'; dessiner(); dire('');
  }

  /* ══ L APERÇU 3D (lot 4) ════════════════════════════════════════════════
     Le site calcule le mannequin et le vêtement (atelier:apercu3d) : des tubes
     d anneaux elliptiques, avec l écart vêtement − corps par niveau. La fenêtre
     en fait des triangles et les PEINT elle-même (3D logicielle sur un canevas
     2D : projection, ombrage, tri des faces) — la souris fait tourner l objet
     en direct (sa demande du 2026-10-17 : « avec ma souris pouvoir tourner
     l objet dynamiquement »). */
  var V3 = null;
  var COUL3 = [['#8FA58A', '${T("Sauge")}'], ['#E9E1D2', '${T("Écru")}'], ['#1F2937', '${T("Noir")}'], ['#1E3A5F', '${T("Bleu nuit")}'], ['#B4583C', '${T("Terracotta")}'], ['#C9A9A6', '${T("Rose poudré")}']];
  var ETAT3 = { trop: '#DC2626', serre: '#F59E0B', ajuste: '#16A34A', aise: '#2563EB' };
  var LETAT3 = { trop: '${T("trop serré")}', serre: '${T("serré")}', ajuste: '${T("ajusté")}', aise: '${T("aisé")}' };
  // ⚠ « Taille » seul veut dire la TAILLE du vêtement (Size) dans cette fenêtre : les zones prennent les « Tour de… » (Waist).
  var LZONE3 = { Poitrine: '${T("Tour de poitrine")}', Taille: '${T("Tour de taille")}', Hanches: '${T("Tour de hanches")}', Bras: '${T("Tour de bras")}' };
  var VUES3 = [['face', '${T("Face")}', 0], ['tq', '${T("3/4")}', 0.7, '${T("Trois-quarts")}'], ['profil', '${T("Profil")}', 1.5708], ['dos', '${T("Dos")}', 3.1416]];

  function ouvrir3d(id, retour){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (!m) { dire(MOTIFS.introuvable, 'err'); return; }
    SEL = id;
    V3 = { id: id, m: m, retour: retour || 'biblio', taille: m.tailleBase || 'M', stature: 165, r: null, mesh: null,
      yaw: 0.45, pitch: 0.12, zoom: 1, px: 0, py: 0, carte: false, fil: false, auto: false, couleur: COUL3[0][0], fond: 'beige', sale: true };
    VUE = '3d'; dessiner(); charger3d();
  }
  function charger3d(){
    var n = ++v3N;
    appeler('atelier:apercu3d', [{ id: V3.id, taille: V3.taille, stature: V3.stature }]).then(function(r){
      if (n !== v3N || VUE !== '3d' || !V3) return;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      V3.r = r; V3.mesh = maillage(r); V3.sale = true; peindrePanneau3d(); demander3d();
    });
  }
  var v3N = 0;

  /* ── Des anneaux aux triangles ──
     ⚠ LE VÊTEMENT SEUL (2026-10-17, sa demande : « l aperçu 3D n est pas beau, je veux uniquement voir
     le vêtement »). Le corps sert encore, INVISIBLE, à donner sa forme au vêtement (le site le calcule) ;
     on n en peint plus rien. Chaque point porte sa NORMALE (celle de l ellipse) : l ombrage se fait par
     point et non plus par facette — c est ce qui efface l effet « carrelé ». */
  function maillage(r){
    var N = 48, tri = [];
    var ajouter = function(tubes, vet){
      (tubes || []).forEach(function(tb){
        var an = tb.anneaux || [], pts = [];
        for (var i = 0; i < an.length; i++) {
          var a = an[Math.max(0, i - 1)].c, b = an[Math.min(an.length - 1, i + 1)].c;
          var tx = b.x - a.x, ty = b.y - a.y, tz = (b.z || 0) - (a.z || 0), tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
          // u = z × t (le « côté » de l anneau), v = t × u (l « avant »)
          var ux = -ty, uy = tx, uz = 0, ul = Math.hypot(ux, uy, uz) || 1; ux /= ul; uy /= ul;
          var vx = ty * uz - tz * uy, vy = tz * ux - tx * uz, vz = tx * uy - ty * ux;
          var c = an[i].c, anneau = [];
          for (var k = 0; k < N; k++) {
            var t = 2 * Math.PI * k / N, co = Math.cos(t) * an[i].rx, si = Math.sin(t) * an[i].rz;
            // la normale d une ellipse : (cos / rx, sin / rz), portée par u et v
            var ncu = Math.cos(t) / Math.max(0.1, an[i].rx), ncv = Math.sin(t) / Math.max(0.1, an[i].rz);
            var nx = ux * ncu + vx * ncv, ny = uy * ncu + vy * ncv, nz = uz * ncu + vz * ncv, nn = Math.hypot(nx, ny, nz) || 1;
            anneau.push({ x: c.x + ux * co + vx * si, y: c.y + uy * co + vy * si, z: (c.z || 0) + uz * co + vz * si, n: { x: nx / nn, y: ny / nn, z: nz / nn } });
          }
          pts.push({ p: anneau, etat: an[i].etat || '' });
        }
        for (var j = 0; j + 1 < pts.length; j++) {
          for (var q = 0; q < N; q++) {
            var a0 = pts[j].p[q], a1 = pts[j].p[(q + 1) % N], b0 = pts[j + 1].p[q], b1 = pts[j + 1].p[(q + 1) % N];
            var et = vet ? (pts[j].etat || pts[j + 1].etat) : '';
            tri.push({ v: [a0, b0, b1], vet: vet, etat: et }, { v: [a0, b1, a1], vet: vet, etat: et });
          }
        }
        // fond : true (les deux bouts), « debut » ou « fin » — un bout caché dans le tronc n a pas de couvercle
        if (tb.fond && pts.length) [0, pts.length - 1].forEach(function(j){
          if (tb.fond === 'debut' && j !== 0) return;
          if (tb.fond === 'fin' && j !== pts.length - 1) return;
          var cc = tb.anneaux[j].c, ctr = { x: cc.x, y: cc.y, z: cc.z || 0 };
          for (var q = 0; q < N; q++) tri.push({ v: j ? [ctr, pts[j].p[q], pts[j].p[(q + 1) % N]] : [ctr, pts[j].p[(q + 1) % N], pts[j].p[q]], vet: false, etat: '' });
        });
      });
    };
    ajouter(r.vetement, true);
    var y0 = 1e9, y1 = -1e9;
    tri.forEach(function(t){ t.v.forEach(function(v){ if (v.y < y0) y0 = v.y; if (v.y > y1) y1 = v.y; }); });
    return { tri: tri, cy: (y0 + y1) / 2, h: y1 - y0 };
  }
  function hex(c){ return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }

  /* ── La peinture : rotation, perspective, ombrage, tri des faces ── */
  function peindre3d(){
    var cv = document.getElementById('v3-canevas'); if (!cv || !V3 || !V3.mesh) return;
    var W = cv.clientWidth, H = cv.clientHeight, dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    var cyw = Math.cos(V3.yaw), syw = Math.sin(V3.yaw), cp = Math.cos(V3.pitch), sp = Math.sin(V3.pitch);
    var Dst = 520, f = Math.min(W, H) * 2.9 * V3.zoom * (Dst - 60) / Math.max(120, V3.mesh.h) / Dst * 0.33;
    var cx = W / 2 + V3.px, cy = H / 2 + V3.py, cyM = V3.mesh.cy;
    var proj = function(v){
      var x = v.x * cyw + v.z * syw, z = -v.x * syw + v.z * cyw, y = v.y - cyM;
      var y2 = y * cp - z * sp, z2 = y * sp + z * cp;
      var k = Dst / (Dst - z2);
      return { x: cx + x * f * k, y: cy - y2 * f * k, z: z2 };
    };
    var L = [0.35, 0.55, 0.76], ll = Math.hypot(L[0], L[1], L[2]); L = [L[0] / ll, L[1] / ll, L[2] / ll];
    var cVet = hex(V3.couleur), cCorps = [205, 198, 186];
    // la normale d un point, tournée comme la vue, éclairée (lumière douce, un peu d ambiance)
    var eclaire = function(n){
      var x = n.x * cyw + n.z * syw, z = -n.x * syw + n.z * cyw;
      var y2 = n.y * cp - z * sp, z2 = n.y * sp + z * cp;
      return { l: x * L[0] + y2 * L[1] + z2 * L[2], vers: z2 };    // vers > 0 : la face regarde l oeil
    };
    // l ombre portée au sol, sous l ourlet
    var ybas = 1e9; V3.mesh.tri.forEach(function(t){ t.v.forEach(function(v){ if (v.y < ybas) ybas = v.y; }); });
    var sol = proj({ x: 0, y: ybas - 3, z: 0 }), rs = f * 26;
    var grad = g.createRadialGradient(sol.x, sol.y, 0, sol.x, sol.y, rs);
    grad.addColorStop(0, 'rgba(40,32,22,0.28)'); grad.addColorStop(1, 'rgba(40,32,22,0)');
    g.save(); g.translate(sol.x, sol.y); g.scale(1, 0.16); g.translate(-sol.x, -sol.y);
    g.fillStyle = grad; g.beginPath(); g.arc(sol.x, sol.y, rs, 0, 2 * Math.PI); g.fill(); g.restore();
    var liste = [];
    V3.mesh.tri.forEach(function(t){
      var a = proj(t.v[0]), b = proj(t.v[1]), c = proj(t.v[2]);
      // ⚠ L AVANT ET L ENVERS SE JUGENT À LA NORMALE (tournée vers l oeil ou non), pas à l ordre des sommets
      var e0 = eclaire(t.v[0].n), e1 = eclaire(t.v[1].n), e2 = eclaire(t.v[2].n);
      var e = (e0.l + e1.l + e2.l) / 3, dos = (e0.vers + e1.vers + e2.vers) < 0;
      // vu de dedans (encolure, emmanchures, ourlet), c est l envers du tissu qui reçoit la lumière
      var lum = Math.max(0, dos ? -e : e);
      liste.push({ a: a, b: b, c: c, z: (a.z + b.z + c.z) / 3, lum: lum, t: t, dos: dos });
    });
    liste.sort(function(p, q){ return p.z - q.z; });
    g.lineJoin = 'round';
    liste.forEach(function(o){
      var base = o.t.vet ? (V3.carte && o.t.etat && ETAT3[o.t.etat] ? hex(ETAT3[o.t.etat]) : cVet) : cCorps;
      var k = 0.36 + 0.64 * Math.pow(o.lum, 0.85); if (o.dos) k *= 0.55;
      var col = 'rgb(' + Math.round(base[0] * k) + ',' + Math.round(base[1] * k) + ',' + Math.round(base[2] * k) + ')';
      g.beginPath(); g.moveTo(o.a.x, o.a.y); g.lineTo(o.b.x, o.b.y); g.lineTo(o.c.x, o.c.y); g.closePath();
      if (V3.fil) { g.strokeStyle = col; g.lineWidth = 0.6; g.stroke(); }
      else { g.fillStyle = col; g.fill(); g.strokeStyle = col; g.lineWidth = 0.6; g.stroke(); }
    });
  }
  var v3Raf = 0;
  function demander3d(){
    if (v3Raf) return;
    v3Raf = requestAnimationFrame(function(){
      v3Raf = 0;
      if (VUE !== '3d' || !V3) return;
      if (V3.auto && !V3.glisse) V3.yaw += 0.012;
      peindre3d();
      if (V3.auto) demander3d();
    });
  }

  /* ── La vue et ses panneaux ── */
  function dessiner3d(){
    var m = V3.m;
    document.getElementById('titre').textContent = '${T("Aperçu 3D")}';
    document.getElementById('sous').textContent = m.nom + (m.ref ? ' · ' + m.ref : '') + ' · v' + (m.version || 1) + ' · ' + '${T("taille {0}")}'.split('{0}').join(V3.taille);
    document.getElementById('actions').innerHTML = '<button type="button" id="v3-retour">' + (V3.retour === 'editeur' ? '${T("← Éditeur")}' : '${T("← Bibliothèque")}') + '</button>'
      + '<button type="button" id="v3-photo">${T("Photo du rendu")}</button>';
    var seg = function(attr, k, lib, on){ return '<button type="button" class="' + (on ? 'on' : '') + '" ' + attr + '="' + k + '">' + lib + '</button>'; };
    var chip = function(k, lib, on){ return '<label><input type="checkbox" data-v3o="' + k + '"' + (on ? ' checked' : '') + '>' + lib + '</label>'; };
    var g = '<div class="cx-carte"><h2>${T("Taille")}</h2><div class="ed-seg" role="group" aria-label="${T("Taille affichée")}">'
      + (m.tailles || []).map(function(t){ return seg('data-v3t', t, esc(t), V3.taille === t); }).join('') + '</div>'
      + '<div class="cx-sep"></div><h2>${T("Vue")}</h2><div class="ed-seg" role="group" aria-label="${T("Vue")}">'
      + VUES3.map(function(v){ return seg('data-v3v', v[0], v[1], false).replace('<button ', '<button title="' + (v[3] || v[1]) + '" '); }).join('') + '</div>'
      + '<div class="im-cases" style="margin-top:.6rem">' + chip('carte', '${T("Carte d’ajustement")}', V3.carte) + chip('fil', '${T("Fil de fer")}', V3.fil) + chip('auto', '${T("Rotation automatique")}', V3.auto) + '</div>'
      + '<div class="cx-sep"></div><h2>${T("Couleur du tissu")}</h2><div class="v3-couleurs">'
      + COUL3.map(function(c){ return '<button type="button" class="' + (V3.couleur === c[0] ? 'on' : '') + '" data-v3c="' + c[0] + '" title="' + c[1] + '" aria-label="' + c[1] + '" style="background:' + c[0] + '"></button>'; }).join('') + '</div>'
      + '<div class="cx-sep"></div><h2>${T("Fond")}</h2><div class="ed-seg" role="group" aria-label="${T("Fond")}">' + seg('data-v3f', 'beige', '${T("Beige")}', V3.fond === 'beige') + seg('data-v3f', 'blanc', '${T("Blanc")}', V3.fond === 'blanc') + '</div></div>';
    var sc = '<div class="v3-scene ' + V3.fond + '" id="v3-scene"><canvas id="v3-canevas" role="img" aria-label="${T("Le vêtement en 3D")}"></canvas>'
      + '<span class="v3-aide">${T("Glisser pour tourner · molette pour zoomer · Maj + glisser pour déplacer · double-clic pour recentrer")}</span></div>';
    var d = '<div class="cx-carte" id="v3-pan"></div>';
    corps.innerHTML = '<div class="v3-trois">' + g + sc + d + '</div>';
    peindrePanneau3d();
    var z = document.getElementById('v3-scene');
    if (window.ResizeObserver && z) { if (window._v3RO) window._v3RO.disconnect(); window._v3RO = new ResizeObserver(function(){ demander3d(); }); window._v3RO.observe(z); }
    demander3d();
  }
  function peindrePanneau3d(){
    var z = document.getElementById('v3-pan'); if (!z || !V3) return;
    var r = V3.r;
    if (!r) { z.innerHTML = '<h2>${T("Ajustement")}</h2><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div>'; return; }
    var cm1 = function(v){ return (v > 0 ? '+' : '') + String(Math.round(v * 10) / 10).replace('.', '${SEP_DEC()}') + ' cm'; };
    var h = '<h2>' + '${T("Ajustement · taille {0}")}'.split('{0}').join(esc(r.taille)) + '</h2>'
      + '<div class="v3-legende">' + Object.keys(ETAT3).map(function(k){ return '<span><i class="v3-pt" style="background:' + ETAT3[k] + '"></i>' + LETAT3[k] + '</span>'; }).join('') + '</div>';
    if (!(r.zones || []).length) h += '<div class="cx-sub">${T("Aucune zone mesurable pour ce modèle.")}</div>';
    (r.zones || []).forEach(function(zn){
      h += '<div class="v3-zone"><i class="v3-pt" style="background:' + (ETAT3[zn.etat] || '#888') + '"></i><b>' + esc(LZONE3[zn.zone] || szTd(zn.zone)) + '</b>'
        + '<span>' + esc(LETAT3[zn.etat] || '') + ' · ' + cm1(zn.ecart) + '</span></div>';
    });
    if (r.pire) h += '<div class="ed-note">' + (r.pire.ecart < 0
      ? '${T("Le point le plus serré manque de {0} au corps, à {1} cm du sol : le vêtement ne fermera pas à cet endroit.")}'
      : '${T("Le point le plus serré garde {0} d’aisance, à {1} cm du sol.")}').split('{0}').join(cm1(Math.abs(r.pire.ecart)).replace('+', '')).split('{1}').join(Math.round(r.pire.hauteur)) + '</div>';
    if ((r.nonPosees || []).length) h += '<div class="ed-note">' + '${T("Pièces non posées sur le mannequin : {0}.")}'.split('{0}').join(esc(r.nonPosees.join(', '))) + '</div>';
    if (r.motif3d === 'pieces_inconnues') h += '<div class="ed-note">${T("Ce patron n’a pas de devant et de dos reconnaissables : seul le mannequin est montré.")}</div>';
    h += '<div class="cx-sep"></div><div class="ed-note">${T("Aperçu géométrique : le vêtement est montré seul, porté sur un corps invisible aux mesures du tableau ; sa largeur est mesurée sur les pièces, niveau par niveau (pinces déduites). Le tombé du tissu — plis, poids, glissement — n’est pas simulé.")}</div>'
      + '<div class="ed-note">${T("Les écarts se lisent de 0 à 2 cm serré, de 2 à 8 cm ajusté, au-delà aisé ; sous 0, le vêtement est plus petit que le corps.")}</div>';
    z.innerHTML = h;
  }
  function clic3d(ev){
    var t = ev.target, b;
    if ((b = t.closest('[data-v3t]'))) { V3.taille = b.getAttribute('data-v3t'); dessiner(); V3.r = null; peindrePanneau3d(); charger3d(); return; }
    if ((b = t.closest('[data-v3v]'))) { var v = VUES3.filter(function(x){ return x[0] === b.getAttribute('data-v3v'); })[0]; V3.yaw = v[2]; V3.pitch = 0.05; demander3d(); return; }
    if ((b = t.closest('[data-v3c]'))) { V3.couleur = b.getAttribute('data-v3c'); dessiner(); return; }
    if ((b = t.closest('[data-v3f]'))) { V3.fond = b.getAttribute('data-v3f'); dessiner(); return; }
  }
  function change3d(t){
    if (t.hasAttribute('data-v3o')) { V3[t.getAttribute('data-v3o')] = !!t.checked; demander3d(); return; }

  }
  function photo3d(){
    var cv = document.getElementById('v3-canevas'); if (!cv || !V3) return;
    if (!P || typeof P.enregistrerExport !== 'function') { dire('${T("Cette version de l’application ne sait pas enregistrer un export.")}', 'err'); return; }
    // le fond de la scène est peint sous l image, pour une photo qui ne soit pas transparente
    var c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height;
    var g = c2.getContext('2d'); g.fillStyle = V3.fond === 'blanc' ? '#FFFFFF' : '#EFE8DD'; g.fillRect(0, 0, c2.width, c2.height); g.drawImage(cv, 0, 0);
    var nom = String((V3.m.ref || V3.m.nom) + '-v' + (V3.m.version || 1) + '-3d-' + V3.taille).replace(/[^A-Za-z0-9._-]+/g, '-') + '.png';
    Promise.resolve(P.enregistrerExport(nom, c2.toDataURL('image/png'))).then(function(w){
      if (w && w.ok) dire('${T("Enregistré : {0}")}'.split('{0}').join(w.path || nom), 'bon');
      else if (w && w.annule) dire('${T("Export annulé : le code d’export n’a pas été donné.")}', 'att');
      else dire('${T("L’enregistrement a échoué : {0}")}'.split('{0}').join((w && w.error) || '?'), 'err');
    });
  }
  function quitter3d(){
    var r = V3 ? V3.retour : 'biblio', id = V3 ? V3.id : '';
    V3 = null; if (window._v3RO) { window._v3RO.disconnect(); window._v3RO = null; }
    if (r === 'editeur' && id) { VUE = 'biblio'; ouvrirEditeur(id); return; }
    VUE = 'biblio'; dessiner(); dire('');
  }

  /* ── La souris : tourner, zoomer, déplacer ── */
  corps.addEventListener('mousedown', function(ev){
    if (VUE !== '3d' || !V3 || !(ev.target && ev.target.closest && ev.target.closest('#v3-scene'))) return;
    ev.preventDefault();
    V3.glisse = { x: ev.clientX, y: ev.clientY, yaw: V3.yaw, pitch: V3.pitch, px: V3.px, py: V3.py, dep: ev.shiftKey || ev.button === 1 };
    var z = document.getElementById('v3-scene'); if (z) z.classList.add('glisse');
  });
  window.addEventListener('mousemove', function(ev){
    if (VUE !== '3d' || !V3 || !V3.glisse) return;
    var g = V3.glisse, dx = ev.clientX - g.x, dy = ev.clientY - g.y;
    if (g.dep) { V3.px = g.px + dx; V3.py = g.py + dy; }
    else { V3.yaw = g.yaw + dx * 0.011; V3.pitch = Math.max(-1.2, Math.min(1.2, g.pitch + dy * 0.008)); }
    demander3d();
  });
  window.addEventListener('mouseup', function(){
    if (!V3 || !V3.glisse) return;
    V3.glisse = null; var z = document.getElementById('v3-scene'); if (z) z.classList.remove('glisse');
    if (V3.auto) demander3d();
  });
  corps.addEventListener('wheel', function(ev){
    if (VUE !== '3d' || !V3 || !(ev.target && ev.target.closest && ev.target.closest('#v3-scene'))) return;
    ev.preventDefault();
    V3.zoom = Math.max(0.4, Math.min(5, V3.zoom * (ev.deltaY < 0 ? 1.12 : 1 / 1.12))); demander3d();
  }, { passive: false });
  corps.addEventListener('dblclick', function(ev){
    if (VUE !== '3d' || !V3 || !(ev.target && ev.target.closest && ev.target.closest('#v3-scene'))) return;
    V3.zoom = 1; V3.px = 0; V3.py = 0; V3.pitch = 0.08; demander3d();
  });

  /* ══ L ÉDITEUR DE MOTIF (lot 5) ═════════════════════════════════════════
     Le motif vit dans le modèle (« motif »). La fenêtre place les calques à la
     souris (le geste doit suivre) ; le SITE nettoie, contrôle (atelier:
     motifControler) et fabrique les sorties (atelier:motifExporter) depuis le
     motif ENREGISTRÉ. Les images partent dans R2 à pleine résolution
     (atelier:motifImage) ; la fenêtre les affiche par P.imageLocale.
     Le PNG reçoit la résolution DANS le fichier (bloc pHYs) : sans lui, le
     logiciel d une imprimante DTF le lit à 72 ppp — quatre fois trop grand. */
  var MO = null;
  var MOIMG = {};             // url → donnée (data:) chargée par P.imageLocale
  var MOPILE = [], MOREF = [];
  var LPROC = { dtf: '${T("DTF (film transfert)")}', dtg: '${T("DTG (direct sur vêtement)")}', sublimation: '${T("Sublimation (polyester)")}',
    serigraphie: '${T("Sérigraphie")}', vinyle: '${T("Vinyle / flex (découpe)")}', broderie: '${T("Broderie")}' };
  var LRACC = { droit: '${T("Droit")}', demigoutte: '${T("Demi-goutte")}', demibrique: '${T("Demi-brique")}' };
  var LTYPE = { image: '${T("image")}', texte: '${T("texte")}', forme: '${T("forme")}' };

  function motifDefaut(m){
    var dv = (m.pieces || []).filter(function(p){ return p.id === 'devant'; })[0] || (m.pieces || [])[0];
    var pli = dv && dv.aupli;
    return { mode: 'place', piece: dv ? dv.id : 'devant', zone: { x: pli ? -15 : 2, y: 12, l: 30, h: 35 }, raccord: 'droit',
      procede: 'dtf', ppp: 300, souscouche: 'auto', fond: 'transparent', calques: [] };
  }
  function ouvrirMotif(id, retour){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (!m) { dire(MOTIFS.introuvable, 'err'); return; }
    SEL = id;
    MO = { id: id, m: m, retour: retour || 'biblio', motif: copie(m.motif || motifDefaut(m)), sel: '', onglet: 'calque', ctl: null, sale: false, glisse: null };
    MOPILE = []; MOREF = [];
    VUE = 'motif'; dessiner(); controlerMo(); chargerImagesMo();
  }
  function moMemo(){ MOPILE.push(JSON.stringify(MO.motif)); if (MOPILE.length > 80) MOPILE.shift(); MOREF = []; MO.sale = true; }
  function moCalque(){ return (MO.motif.calques || []).filter(function(c){ return c.id === MO.sel; })[0] || null; }
  function chargerImagesMo(){
    (MO.motif.calques || []).forEach(function(c){
      if (c.type !== 'image' || !c.url || MOIMG[c.url] || !P || !P.imageLocale) return;
      MOIMG[c.url] = 'chargement';
      Promise.resolve(P.imageLocale(c.url)).then(function(d){ MOIMG[c.url] = d || ''; if (VUE === 'motif') peindreMo(); });
    });
  }

  /* ── La toile : la pièce (dépliée si elle est coupée au pli), la zone, les calques ── */
  var MK = 6, MX = 0, MY = 0;
  function reflet(q, pli){
    var dx = pli.b.x - pli.a.x, dy = pli.b.y - pli.a.y, l2 = dx * dx + dy * dy || 1;
    var t = ((q.x - pli.a.x) * dx + (q.y - pli.a.y) * dy) / l2, px = pli.a.x + t * dx, py = pli.a.y + t * dy;
    return { x: 2 * px - q.x, y: 2 * py - q.y };
  }
  function cheminPiece(c, X, Y){
    var d = 'M' + X(c[0].x) + ' ' + Y(c[0].y);
    for (var n = 1; n <= c.length; n++) { var z = c[n % c.length];
      d += z.c1 && z.c2 ? ' C' + X(z.c1.x) + ' ' + Y(z.c1.y) + ' ' + X(z.c2.x) + ' ' + Y(z.c2.y) + ' ' + X(z.x) + ' ' + Y(z.y) : ' L' + X(z.x) + ' ' + Y(z.y); }
    return d + ' Z';
  }
  /* ⚠ LE MÊME DESSIN QUE LE FICHIER (svgMotif, site) : fusion, réglages d image, retournements,
     formes, contour et ajustement du texte. Un écart ici serait un motif qui ne s imprime pas
     comme on l a vu — le banc ⑪ du site vérifie que le fichier porte chacune de ces fonctions. */
  function styleCalqueF(c){
    var f = c.filtres, st = [];
    if (f) st.push('filter:brightness(' + f.lum / 100 + ') contrast(' + f.con / 100 + ') saturate(' + f.sat / 100 + ')' + (f.teinte ? ' hue-rotate(' + f.teinte + 'deg)' : '') + (f.gris ? ' grayscale(1)' : ''));
    if (c.fusion && c.fusion !== 'normal') st.push('mix-blend-mode:' + c.fusion);
    return st.join(';');
  }
  function etoileF(n, l, h){
    var pts = [];
    for (var i = 0; i < n * 2; i++) { var a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? 0.45 : 1; pts.push((Math.cos(a) * l / 2 * r) + ',' + (Math.sin(a) * h / 2 * r)); }
    return pts.join(' ');
  }
  function calqueSvg(c, X, Y){
    var x = X(c.x), y = Y(c.y), l = c.l * MK, h = c.h * MK, cx = x + l / 2, cy = y + h / 2, st = styleCalqueF(c);
    var s = '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + (c.rot || 0) + ')' + (c.miroir || c.retourneV ? ' scale(' + (c.miroir ? -1 : 1) + ' ' + (c.retourneV ? -1 : 1) + ')' : '')
      + '" opacity="' + (c.opacite == null ? 1 : c.opacite) + '"' + (st ? ' style="' + st + '"' : '') + '>';
    if (c.type === 'image') {
      var d = MOIMG[c.url];
      s += d && d !== 'chargement' ? '<image href="' + d + '" x="' + (-l / 2) + '" y="' + (-h / 2) + '" width="' + l + '" height="' + h + '" preserveAspectRatio="none"/>'
        : '<rect x="' + (-l / 2) + '" y="' + (-h / 2) + '" width="' + l + '" height="' + h + '" fill="#D8D0C3"/><text x="0" y="4" text-anchor="middle" font-size="12" fill="#3F3A32" font-family="Segoe UI, sans-serif">' + esc(c.nom || LTYPE.image) + '</text>';
    }
    if (c.type === 'forme') {
      var tr = 'stroke="' + c.couleur + '" stroke-width="' + Math.max(1, (c.contour || 0.1) * MK) + '"';
      var pl = c.plein !== false && c.forme !== 'ligne' ? 'fill="' + c.couleur + '"' : 'fill="none" ' + tr;
      s += c.forme === 'ellipse' ? '<ellipse cx="0" cy="0" rx="' + (l / 2) + '" ry="' + (h / 2) + '" ' + pl + '/>'
        : c.forme === 'ligne' ? '<line x1="' + (-l / 2) + '" y1="0" x2="' + (l / 2) + '" y2="0" ' + tr + ' stroke-linecap="round"/>'
        : c.forme === 'etoile' ? '<polygon points="' + etoileF(c.branches || 5, l, h) + '" ' + pl + '/>'
        : '<rect x="' + (-l / 2) + '" y="' + (-h / 2) + '" width="' + l + '" height="' + h + '"' + (c.forme === 'arrondi' ? ' rx="' + Math.min(Math.min(l, h) / 2, (c.rayon || 0) * MK) + '"' : '') + ' ' + pl + '/>';
    }
    if (c.type === 'texte') s += '<text x="0" y="' + (h * 0.36) + '" font-family="' + esc(c.police || 'Arial') + '" font-size="' + h + '" font-weight="' + (c.gras ? 700 : 400) + '" fill="' + c.couleur + '"'
      + (c.contourEp ? ' stroke="' + (c.contourCouleur || '#FFFFFF') + '" stroke-width="' + c.contourEp * MK + '" paint-order="stroke" stroke-linejoin="round"' : '')
      + ' text-anchor="middle" textLength="' + l + '" lengthAdjust="' + (c.ajustement === 'espacer' ? 'spacing' : 'spacingAndGlyphs') + '">' + esc(c.texte || '') + '</text>';
    return s + '</g>';
  }
  var POIGNEES = [['nw', -1, -1], ['n', 0, -1], ['ne', 1, -1], ['e', 1, 0], ['se', 1, 1], ['s', 0, 1], ['sw', -1, 1], ['w', -1, 0]];
  function vueMo(){ if (!MO.vue) MO.vue = { z: 1, px: 0, py: 0 }; return MO.vue; }
  function peindreMo(){
    var z = document.getElementById('mo-toile'), svg = document.getElementById('mo-svg'); if (!z || !svg || !MO) return;
    var W = z.clientWidth || 800, H = z.clientHeight || 600, mo = MO.motif, zo = mo.zone, s = '', V = vueMo();
    var p = (MO.m.pieces || []).filter(function(x){ return x.id === mo.piece; })[0];
    // la vue : l ajustement à la toile, puis le zoom et le déplacement de la personne
    var cadre = function(mk0, bx0, by0){ MK = mk0 * V.z; return { bx: W / 2 + (bx0 - W / 2) * V.z + V.px, by: H / 2 + (by0 - H / 2) * V.z + V.py }; };
    if (mo.mode === 'raccord') {
      // trois modules sur trois, décalés selon le raccord : on voit le tissu au mètre
      var mk0 = Math.min((W - 60) / (zo.l * 3), (H - 60) / (zo.h * 3)), o = cadre(mk0, (W - zo.l * 3 * mk0) / 2, (H - zo.h * 3 * mk0) / 2);
      MX = o.bx; MY = o.by;
      var X0 = function(v){ return v * MK; }, Y0 = function(v){ return v * MK; };
      s += '<defs><clipPath id="mo-cl"><rect x="0" y="0" width="' + zo.l * MK + '" height="' + zo.h * MK + '"/></clipPath><g id="mo-mod" clip-path="url(#mo-cl)"><rect width="' + zo.l * MK + '" height="' + zo.h * MK + '" fill="' + (mo.fond === 'blanc' ? '#FFFFFF' : '#F6F1E9') + '"/>'
        + (mo.calques || []).filter(function(c){ return c.visible !== false; }).map(function(c){ return calqueSvg(c, X0, Y0); }).join('') + '</g></defs>';
      for (var i = -1; i <= 3; i++) for (var j = -1; j <= 3; j++) {
        var ox = j * zo.l + (mo.raccord === 'demibrique' && i % 2 ? zo.l / 2 : 0), oy = i * zo.h + (mo.raccord === 'demigoutte' && j % 2 ? zo.h / 2 : 0);
        s += '<use href="#mo-mod" x="' + (MX + ox * MK) + '" y="' + (MY + oy * MK) + '"/>';
      }
      MX += zo.l * MK; MY += zo.h * MK;     // le module édité : celui du centre
    } else {
      var pts = p ? p.contour.slice() : [];
      var tous = pts.concat(p && p.aupli && p.pli ? pts.map(function(q){ return reflet(q, p.pli); }) : []).concat([{ x: zo.x, y: zo.y }, { x: zo.x + zo.l, y: zo.y + zo.h }]);
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      tous.forEach(function(q){ x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); });
      var mkp = Math.min((W - 60) / Math.max(1, x1 - x0), (H - 60) / Math.max(1, y1 - y0));
      var op = cadre(mkp, (W - (x1 - x0) * mkp) / 2 - x0 * mkp, (H - (y1 - y0) * mkp) / 2 - y0 * mkp);
      var PX = function(v){ return Math.round((op.bx + v * MK) * 10) / 10; }, PY = function(v){ return Math.round((op.by + v * MK) * 10) / 10; };
      MO.piecePx = { bx: op.bx, by: op.by };
      if (p) {
        s += '<path d="' + cheminPiece(p.contour, PX, PY) + '" fill="#F8F4EC" stroke="#1C1B18" stroke-width="1.4"/>';
        if (p.aupli && p.pli) {
          var mir = p.contour.map(function(q){ var r = reflet(q, p.pli); if (q.c1 && q.c2) { r.c1 = reflet(q.c1, p.pli); r.c2 = reflet(q.c2, p.pli); } return r; });
          s += '<path d="' + cheminPiece(mir, PX, PY) + '" fill="#F8F4EC" stroke="#1C1B18" stroke-width="1.4"/>'
            + '<path d="M' + PX(p.pli.a.x) + ' ' + PY(p.pli.a.y) + ' L' + PX(p.pli.b.x) + ' ' + PY(p.pli.b.y) + '" stroke="#8F897D" stroke-width="1" stroke-dasharray="8 4"/>';
        }
      }
      MX = PX(zo.x); MY = PY(zo.y);
      var Xz = function(v){ return MX + v * MK; }, Yz = function(v){ return MY + v * MK; };
      s += '<rect x="' + MX + '" y="' + MY + '" width="' + zo.l * MK + '" height="' + zo.h * MK + '" fill="' + (MO.zoneSel ? 'rgba(37,99,235,.05)' : 'none') + '" stroke="#2563EB" stroke-width="' + (MO.zoneSel ? 2 : 1.5) + '" stroke-dasharray="6 4"/>'
        + '<text x="' + MX + '" y="' + (MY - 6) + '" font-size="12" fill="#1E40AF" font-family="Segoe UI, sans-serif">' + esc('${T("Zone d’impression · {0} × {1} cm")}'.split('{0}').join(String(zo.l).replace('.', '${SEP_DEC()}')).split('{1}').join(String(zo.h).replace('.', '${SEP_DEC()}'))) + '</text>';
      s += (mo.calques || []).filter(function(c){ return c.visible !== false; }).map(function(c){ return calqueSvg(c, function(v){ return Xz(v); }, function(v){ return Yz(v); }); }).join('');
      if (MO.zoneSel) POIGNEES.forEach(function(h){
        var hx = MX + (h[1] + 1) / 2 * zo.l * MK, hy = MY + (h[2] + 1) / 2 * zo.h * MK;
        s += '<rect x="' + (hx - 5) + '" y="' + (hy - 5) + '" width="10" height="10" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.5"/>';
      });
    }
    // la boîte de transformation du calque choisi : tournée avec lui, 8 poignées, et la rotation
    var c = moCalque();
    if (c && c.visible !== false) {
      var cx = MX + (c.x + c.l / 2) * MK, cy = MY + (c.y + c.h / 2) * MK, l = c.l * MK, h = c.h * MK;
      s += '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + (c.rot || 0) + ')">'
        + '<rect x="' + (-l / 2) + '" y="' + (-h / 2) + '" width="' + l + '" height="' + h + '" fill="none" stroke="' + (c.verrou ? '#8F897D' : '#C2410C') + '" stroke-width="1.2" stroke-dasharray="4 3"/>';
      if (!c.verrou) {
        s += '<path d="M0 ' + (-h / 2) + ' L0 ' + (-h / 2 - 22) + '" stroke="#C2410C" stroke-width="1.2"/><circle cx="0" cy="' + (-h / 2 - 22) + '" r="5.5" fill="#FFFFFF" stroke="#C2410C" stroke-width="1.5"/>';
        POIGNEES.forEach(function(p2){ s += '<rect x="' + (p2[1] * l / 2 - 4.5) + '" y="' + (p2[2] * h / 2 - 4.5) + '" width="9" height="9" fill="#FFFFFF" stroke="#C2410C" stroke-width="1.5"/>'; });
      }
      s += '</g>';
    }
    // les repères commentés (magenta, comme Photoshop) pendant un déplacement aimanté
    (MO.guides || []).forEach(function(g){
      s += g.x != null ? '<path d="M' + (MX + g.x * MK) + ' 0 V' + H + '" stroke="#EC4899" stroke-width="1"/>' : '<path d="M0 ' + (MY + g.y * MK) + ' H' + W + '" stroke="#EC4899" stroke-width="1"/>';
    });
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = s;
    var zz = document.getElementById('mo-zoom'); if (zz) zz.textContent = Math.round(V.z * 100) + ' %';
  }

  /* ── Les panneaux ── */
  function dessinerMo(){
    var m = MO.m, mo = MO.motif;
    document.getElementById('titre').textContent = '${T("Motif")}';
    document.getElementById('sous').textContent = m.nom + (m.ref ? ' · ' + m.ref : '') + (MO.sale ? ' · ${T("modifications non enregistrées")}' : '');
    document.getElementById('actions').innerHTML = '<button type="button" id="mo-retour">${T("← Bibliothèque")}</button>'
      + '<button type="button" id="mo-annuler" aria-label="${T("Annuler")}" title="${T("Annuler (Ctrl+Z)")}"' + (MOPILE.length ? '' : ' disabled') + '>↶</button>'
      + (D.peutModifier ? '<button type="button" class="prim" id="mo-enreg"' + (MO.sale ? '' : ' disabled') + '>${T("Enregistrer")}</button>' : '');
    var seg = function(attr, k, lib, on){ return '<button type="button" class="' + (on ? 'on' : '') + '" ' + attr + '="' + k + '">' + lib + '</button>'; };
    var g = '<div class="cx-carte"><h2>${T("Motif")}</h2><div class="ed-seg" role="group" aria-label="${T("Mode")}">'
      + seg('data-momode', 'place', '${T("Placé")}', mo.mode === 'place') + seg('data-momode', 'raccord', '${T("Au mètre")}', mo.mode === 'raccord') + '</div>';
    if (mo.mode === 'raccord') g += '<div class="ed-seg" role="group" aria-label="${T("Raccord")}" style="margin-top:.5rem">' + Object.keys(LRACC).map(function(k){ return seg('data-moracc', k, LRACC[k], mo.raccord === k); }).join('') + '</div>';
    g += '<div class="at-champs" style="margin-top:.6rem">';
    if (mo.mode === 'place') g += '<label class="large">${T("Pièce")}<select id="mo-piece">' + (m.pieces || []).map(function(p){ return '<option value="' + esc(p.id) + '"' + (mo.piece === p.id ? ' selected' : '') + '>' + esc(nomPiece(p)) + '</option>'; }).join('') + '</select></label>';
    g += '<label>' + (mo.mode === 'raccord' ? '${T("Module · L (cm)")}' : '${T("Zone · L (cm)")}') + '<input type="text" id="mo-zl" inputmode="decimal" maxlength="5" value="' + esc(String(mo.zone.l).replace('.', '${SEP_DEC()}')) + '"></label>'
      + '<label>' + (mo.mode === 'raccord' ? '${T("Module · H (cm)")}' : '${T("Zone · H (cm)")}') + '<input type="text" id="mo-zh" inputmode="decimal" maxlength="5" value="' + esc(String(mo.zone.h).replace('.', '${SEP_DEC()}')) + '"></label></div>';
    if (mo.mode === 'place') g += '<div class="at-champs"><label>${T("Zone · X (cm)")}<input type="text" id="mo-zx" inputmode="decimal" maxlength="6" value="' + esc(String(mo.zone.x).replace('.', '${SEP_DEC()}')) + '"></label>'
      + '<label>${T("Zone · Y (cm)")}<input type="text" id="mo-zy" inputmode="decimal" maxlength="6" value="' + esc(String(mo.zone.y).replace('.', '${SEP_DEC()}')) + '"></label></div>'
      + '<div class="ed-gestes"><button type="button" class="mini" id="mo-centrer">${T("Centrer la zone sur la pièce")}</button></div>'
      + '<div class="ed-note">${T("Cliquez dans la zone pour la saisir : glissez-la, tirez ses poignées.")}</div>';
    g += '<div class="cx-sep"></div><h2>${T("Calques")}</h2>'
      + (mo.calques || []).slice().reverse().map(function(c){
          return '<div class="mo-calque' + (MO.sel === c.id ? ' on' : '') + '" data-mocal="' + esc(c.id) + '" data-ctx-ligne="mo:' + esc(c.id) + '" role="button" tabindex="0">'
            + '<button type="button" class="mo-oeil' + (c.visible === false ? ' off' : '') + '" data-moeil="' + esc(c.id) + '" aria-label="${T("Afficher ou masquer")}" title="${T("Afficher ou masquer")}">' + (c.visible === false ? '◌' : '●') + '</button>'
            + '<span class="t">' + esc(c.type === 'texte' ? (c.texte || '') : (c.nom || LTYPE[c.type])) + '</span><span class="k">' + LTYPE[c.type] + '</span>'
            + '<button type="button" class="mo-oeil' + (c.verrou ? '' : ' off') + '" data-moverrou="' + esc(c.id) + '" aria-label="${T("Verrouiller ou déverrouiller")}" title="${T("Verrouiller ou déverrouiller")}"><span class="ic">' + (c.verrou ? '🔒' : '🔓') + '</span></button></div>';
        }).join('')
      + (!(mo.calques || []).length ? '<div class="cx-sub">${T("Aucun calque : ajoutez une image, un texte ou une forme.")}</div>' : '')
      + '<div class="ed-gestes"><button type="button" class="mini" id="mo-add-image">${T("+ Image")}</button><button type="button" class="mini" id="mo-add-texte">${T("+ Texte")}</button><button type="button" class="mini" id="mo-add-forme">${T("+ Forme")}</button></div>'
      + '<input type="file" id="mo-fichier" accept=".png,.jpg,.jpeg" aria-label="${T("Choisir une image")}" style="display:none">'
      + '<div class="ed-note">${T("Une image se dépose à pleine résolution (PNG ou JPEG, 20 Mo au plus). Pour le DTF, un PNG au fond transparent.")}</div></div>';
    var t = '<div class="mo-toile" id="mo-toile"><svg id="mo-svg" role="img" aria-label="${T("Le motif sur la pièce")}"></svg>'
      + '<div class="mo-vue"><button type="button" class="mini" data-mozoom="-" aria-label="${T("Zoom arrière")}">−</button><b id="mo-zoom">100 %</b><button type="button" class="mini" data-mozoom="+" aria-label="${T("Zoom avant")}">+</button><button type="button" class="mini" data-mozoom="0">${T("Tout voir")}</button></div>'
      + '<div class="mo-aide">${T("Molette : zoom · Espace + glisser : se déplacer · Maj : proportions libres, rotation par 15° · Alt : sans aimant · flèches : 1 mm (Maj : 1 cm)")}</div></div>';
    var d = '<div class="cx-carte" id="mo-pan"></div>';
    corps.innerHTML = '<div class="mo-trois">' + g + t + d + '</div>';
    peindreMo(); peindrePanMo();
    var tz = document.getElementById('mo-toile');
    if (window.ResizeObserver && tz) { if (window._moRO) window._moRO.disconnect(); window._moRO = new ResizeObserver(function(){ peindreMo(); }); window._moRO.observe(tz); }
  }
  function peindrePanMo(){
    var z = document.getElementById('mo-pan'); if (!z || !MO) return;
    var mo = MO.motif, c = moCalque();
    var seg = function(attr, k, lib, on){ return '<button type="button" class="' + (on ? 'on' : '') + '" ' + attr + '="' + k + '">' + lib + '</button>'; };
    var cm = function(v){ return esc(String(Math.round((v || 0) * 10) / 10).replace('.', '${SEP_DEC()}')); };
    var h = '<div class="ed-seg" role="group" aria-label="${T("Panneau")}">' + seg('data-moong', 'calque', '${T("Calque")}', MO.onglet === 'calque') + seg('data-moong', 'impression', '${T("Impression")}', MO.onglet === 'impression') + '</div>';
    if (MO.onglet === 'calque') {
      if (!c) h += '<h2>${T("Calque")}</h2><div class="cx-sub">${T("Cliquez un calque sur la toile ou dans la liste.")}</div>';
      else {
        h += '<h2>' + esc(c.type === 'texte' ? c.texte : (c.nom || LTYPE[c.type])) + ' <span class="cx-sub">' + LTYPE[c.type] + '</span></h2><div class="at-champs">';
        if (c.type === 'texte') h += '<label class="large">${T("Texte")}<input type="text" id="mo-c-texte" maxlength="200" value="' + esc(c.texte) + '"></label>'
          + '<label>${T("Police")}<select id="mo-c-police">' + ['Arial', 'Georgia', 'Courier New', 'Trebuchet MS', 'Impact'].map(function(f){ return '<option' + (c.police === f ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select></label>'
          + '<label>${T("Ajustement")}<select id="mo-c-ajust"><option value="etirer"' + (c.ajustement !== 'espacer' ? ' selected' : '') + '>${T("Étirer les lettres")}</option><option value="espacer"' + (c.ajustement === 'espacer' ? ' selected' : '') + '>${T("Espacer les lettres")}</option></select></label>'
          + '<label style="flex-direction:row;align-items:center;gap:.4rem;margin-top:1.1rem"><input type="checkbox" id="mo-c-gras"' + (c.gras ? ' checked' : '') + '>${T("Gras")}</label>'
          + '<label>${T("Contour · couleur")}<input type="color" id="mo-c-ccoul" value="' + esc(c.contourCouleur || '#FFFFFF') + '"></label>'
          + '<label>${T("Contour (mm)")}<input type="text" id="mo-c-cep" inputmode="decimal" maxlength="4" value="' + cm((c.contourEp || 0) * 10) + '"></label>';
        else h += '<label class="large">${T("Nom")}<input type="text" id="mo-c-nom" maxlength="40" value="' + esc(c.nom || '') + '"></label>';
        if (c.type !== 'image') h += '<label>${T("Couleur")}<input type="color" id="mo-c-couleur" value="' + esc(c.couleur || '#1C1B18') + '"></label>';
        if (c.type === 'forme') {
          var FO = { rect: '${T("Rectangle")}', arrondi: '${T("Rectangle arrondi")}', ellipse: '${T("Ellipse")}', etoile: '${T("Étoile")}', ligne: '${T("Ligne")}' };
          h += '<label>${T("Forme")}<select id="mo-c-forme">' + Object.keys(FO).map(function(k){ return '<option value="' + k + '"' + ((c.forme || 'rect') === k ? ' selected' : '') + '>' + FO[k] + '</option>'; }).join('') + '</select></label>'
            + (c.forme !== 'ligne' ? '<label style="flex-direction:row;align-items:center;gap:.4rem"><input type="checkbox" id="mo-c-plein"' + (c.plein !== false ? ' checked' : '') + '>${T("Plein")}</label>' : '')
            + '<label>${T("Trait (mm)")}<input type="text" id="mo-c-contour" inputmode="decimal" maxlength="4" value="' + cm((c.contour || 0) * 10) + '"></label>'
            + (c.forme === 'arrondi' ? '<label>${T("Rayon (cm)")}<input type="text" id="mo-c-rayon" inputmode="decimal" maxlength="5" value="' + cm(c.rayon || 1) + '"></label>' : '')
            + (c.forme === 'etoile' ? '<label>${T("Branches")}<input type="text" id="mo-c-branches" inputmode="numeric" maxlength="2" value="' + (c.branches || 5) + '"></label>' : '');
        }
        var FU = { normal: '${T("Normal")}', multiply: '${T("Produit")}', overlay: '${T("Superposition")}', screen: '${T("Écran")}', darken: '${T("Obscurcir")}', lighten: '${T("Éclaircir")}' };
        h += '<label>X (cm)<input type="text" id="mo-c-x" inputmode="decimal" maxlength="6" value="' + cm(c.x) + '"></label><label>Y (cm)<input type="text" id="mo-c-y" inputmode="decimal" maxlength="6" value="' + cm(c.y) + '"></label>'
          + '<label>${T("Largeur (cm)")}<input type="text" id="mo-c-l" inputmode="decimal" maxlength="6" value="' + cm(c.l) + '"></label><label>${T("Hauteur (cm)")}<input type="text" id="mo-c-h" inputmode="decimal" maxlength="6" value="' + cm(c.h) + '"></label>'
          + '<label>${T("Rotation (°)")}<input type="text" id="mo-c-rot" inputmode="decimal" maxlength="5" value="' + cm(c.rot) + '"></label><label>${T("Opacité (%)")}<input type="text" id="mo-c-op" inputmode="numeric" maxlength="3" value="' + Math.round((c.opacite == null ? 1 : c.opacite) * 100) + '"></label>'
          + '<label class="large">${T("Mode de fusion")}<select id="mo-c-fusion">' + Object.keys(FU).map(function(k){ return '<option value="' + k + '"' + ((c.fusion || 'normal') === k ? ' selected' : '') + '>' + FU[k] + '</option>'; }).join('') + '</select></label>'
          + '<label style="flex-direction:row;align-items:center;gap:.4rem"><input type="checkbox" id="mo-c-visible"' + (c.visible !== false ? ' checked' : '') + '>${T("Visible")}</label>'
          + '<label style="flex-direction:row;align-items:center;gap:.4rem"><input type="checkbox" id="mo-c-verrou"' + (c.verrou ? ' checked' : '') + '>${T("Verrouillé")}</label></div>';
        h += '<div class="cx-sep"></div><h2>${T("Disposer")}</h2><div class="mo-grille">'
          + [['g', '${T("⇤ Gauche")}'], ['ch', '${T("↔ Centre")}'], ['d', '${T("Droite ⇥")}'], ['h', '${T("⤒ Haut")}'], ['cv', '${T("↕ Milieu")}'], ['b', '${T("⤓ Bas")}']].map(function(a){ return '<button type="button" class="mini" data-moali="' + a[0] + '">' + a[1] + '</button>'; }).join('')
          + '</div><div class="ed-gestes"><button type="button" class="mini" data-moali="ajuster">${T("Ajuster à la zone")}</button><button type="button" class="mini" data-moali="remplir">${T("Remplir la zone")}</button>'
          + '<button type="button" class="mini" data-moali="flipH">${T("Retourner ↔")}</button><button type="button" class="mini" data-moali="flipV">${T("Retourner ↕")}</button></div>';
        if (c.type === 'image') {
          var ppp = Math.min(c.px.l / (c.l / 2.54), c.px.h / (c.h / 2.54)), f = c.filtres || {};
          h += '<div class="cx-etat"><span>${T("Fichier")}</span><span>' + c.px.l + ' × ' + c.px.h + ' px</span></div><div class="cx-etat"><span>${T("Résolution à cette taille")}</span><span>' + Math.round(ppp) + ' ${T("ppp")}</span></div>'
            + '<div class="cx-sep"></div><h2>${T("Réglages de l’image")}</h2><div class="at-champs">'
            + '<label>${T("Luminosité (%)")}<input type="text" id="mo-f-lum" inputmode="numeric" maxlength="3" value="' + (f.lum == null ? 100 : f.lum) + '"></label>'
            + '<label>${T("Contraste (%)")}<input type="text" id="mo-f-con" inputmode="numeric" maxlength="3" value="' + (f.con == null ? 100 : f.con) + '"></label>'
            + '<label>${T("Saturation (%)")}<input type="text" id="mo-f-sat" inputmode="numeric" maxlength="3" value="' + (f.sat == null ? 100 : f.sat) + '"></label>'
            + '<label>${T("Teinte (°)")}<input type="text" id="mo-f-teinte" inputmode="numeric" maxlength="4" value="' + (f.teinte || 0) + '"></label>'
            + '<label style="flex-direction:row;align-items:center;gap:.4rem"><input type="checkbox" id="mo-f-gris"' + (f.gris ? ' checked' : '') + '>${T("Noir et blanc")}</label></div>'
            + '<div class="ed-gestes"><button type="button" class="mini" id="mo-f-zero">${T("Réinitialiser les réglages")}</button></div>'
            + '<div class="cx-sep"></div><h2>${T("Retirer le fond")}</h2><div class="at-champs"><label>${T("Tolérance")}<select id="mo-dt-tol"><option value="20">${T("Faible")}</option><option value="36" selected>${T("Moyenne")}</option><option value="60">${T("Forte")}</option></select></label></div>'
            + '<div class="ed-gestes"><button type="button" class="mini" id="mo-dt">${T("Retirer le fond uni")}</button></div>'
            + '<div class="ed-note">${T("À pleine résolution, pour un fond UNI : le fond devient transparent, l’image détourée remplace celle du calque.")}</div>';
        }
        h += '<div class="cx-sep"></div><div class="ed-gestes"><button type="button" class="mini" id="mo-c-premier">${T("Premier plan")}</button><button type="button" class="mini" id="mo-c-monter">${T("Monter")}</button><button type="button" class="mini" id="mo-c-descendre">${T("Descendre")}</button><button type="button" class="mini" id="mo-c-arriere">${T("Arrière-plan")}</button>'
          + '<button type="button" class="mini" id="mo-c-dupl">${T("Dupliquer")}</button><button type="button" class="mini danger" id="mo-c-suppr">${T("Supprimer")}</button></div>';
      }
    } else {
      h += '<h2>${T("Procédé d’impression")}</h2>' + Object.keys(LPROC).map(function(k){ return '<button type="button" class="im-dest' + (mo.procede === k ? ' on' : '') + '" data-moproc="' + k + '"><b>' + LPROC[k] + '</b></button>'; }).join('');
      h += '<div class="cx-sep"></div><h2>${T("Réglages")}</h2><div class="at-champs">';
      if (mo.procede !== 'vinyle' && mo.procede !== 'broderie') h += '<label>${T("Résolution")}<select id="mo-ppp"><option value="300"' + (mo.ppp !== 600 ? ' selected' : '') + '>300 ${T("ppp")}</option><option value="600"' + (mo.ppp === 600 ? ' selected' : '') + '>600 ${T("ppp")}</option></select></label>';
      if (mo.procede === 'dtf' || mo.procede === 'dtg') h += '<label>${T("Sous-couche blanche")}<select id="mo-sous"><option value="auto"' + (mo.souscouche === 'auto' ? ' selected' : '') + '>${T("Automatique")}</option><option value="pleine"' + (mo.souscouche === 'pleine' ? ' selected' : '') + '>${T("Pleine")}</option><option value="aucune"' + (mo.souscouche === 'aucune' ? ' selected' : '') + '>${T("Aucune")}</option></select></label>';
      h += '<label>${T("Fond")}<select id="mo-fond"><option value="transparent"' + (mo.fond !== 'blanc' ? ' selected' : '') + '>${T("Transparent")}</option><option value="blanc"' + (mo.fond === 'blanc' ? ' selected' : '') + '>${T("Blanc")}</option></select></label></div>';
      h += '<div class="cx-sep"></div><h2>${T("Contrôles avant impression")}</h2>' + (MO.ctl ? MO.ctl.map(function(x){ return '<div class="mo-ctl ' + x.niveau + '"><i></i><span>' + esc(phraseCtl(x)) + '</span></div>'; }).join('') : '<div class="cx-sub">…</div>');
      var so = mo.procede === 'serigraphie' ? [['separations', '${T("Séparations, une par encre (PDF)")}']]
        : mo.procede === 'vinyle' ? [['svg', '${T("Fichier de découpe (SVG)")}']]
        : mo.procede === 'broderie' ? [['pdf', '${T("PDF à l’échelle pour le brodeur")}']]
        : [['png', '${T("PNG à {0} ppp")}'.split('{0}').join(mo.ppp)], ['pdf', '${T("PDF à l’échelle")}']];
      h += '<div class="cx-sep"></div><h2>${T("Sorties")}</h2><div class="mo-sorties">' + so.map(function(x, i){ return '<button type="button" class="' + (i ? '' : 'prim') + '" data-mosortie="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'
        + '<div class="ed-note">${T("Les sorties partent du motif ENREGISTRÉ ; des changements en cours s’enregistrent d’abord.")}</div>';
    }
    z.innerHTML = h;
  }
  /* Le site envoie une CLÉ et des VALEURS ; la phrase se compose ici, dans la langue de la fenêtre. */
  var PHRASES = {
    vide: '${T("Le motif est vide : ajoutez une image, un texte ou une forme.")}',
    'resolution.err': '${T("« {nom} » : {ppp} ppp à cette taille — il en faut {cible} : l’impression sera floue. Réduisez-la ou fournissez un fichier plus grand.")}',
    'resolution.att': '${T("« {nom} » : {ppp} ppp à cette taille ({cible} visés) — acceptable, un peu doux de près.")}',
    'resolution.bon': '${T("Résolution suffisante partout (≥ {cible} ppp).")}',
    'zone.err': '${T("{noms} sort de la zone d’impression : ce qui dépasse ne sera pas imprimé.")}',
    'zone.att': '${T("{noms} dépasse le module : la partie qui déborde sera coupée au raccord.")}',
    'zone.bon': '${T("Tout le design est dans la zone d’impression.")}',
    trait: '${T("« {nom} » : trait de {mm} mm, trop fin pour ce procédé (min. {min} mm).")}',
    texte: '${T("« {texte} » : lettres de {mm} mm, trop petites pour ce procédé (min. {min} mm).")}',
    encres: '${T("Encres : {n} — un écran et une séparation par encre, avec repères de calage.")}',
    image_serigraphie: '${T("Les images en couleurs continues ne se séparent pas en aplats : vectorisez-les, ou passez en DTF / DTG.")}',
    image_vinyle: '${T("Le vinyle se DÉCOUPE : une image ne se découpe pas. Gardez des textes et des formes, ou passez en DTF.")}',
    broderie: '${T("Fichier de broderie (DST, PES) non produit : la broderie demande un numérisage point par point, à faire chez le brodeur à partir du PDF.")}',
    miroir: '${T("Sublimation : le fichier sort en MIROIR, pour un tissu clair à fort taux de polyester.")}',
    'souscouche.pleine': '${T("Sous-couche blanche pleine — à régler dans le logiciel de l’imprimante.")}',
    'souscouche.auto': '${T("Sous-couche blanche automatique, sous ce qui est imprimé — à régler dans le logiciel de l’imprimante.")}'
  };
  function phraseCtl(x){
    var v = x.v || {}, k = x.cle;
    var modele = PHRASES[k + '.' + x.niveau] || (k === 'souscouche' ? PHRASES[v.pleine ? 'souscouche.pleine' : 'souscouche.auto'] : PHRASES[k]);
    if (!modele) return szTd(x.texte || '');
    var nb = function(n){ return String(n).replace('.', '${SEP_DEC()}'); };
    return modele.replace(/[{]([a-z]+)[}]/g, function(a, c){
      var val = v[c];
      if (c === 'noms') return (val || []).map(function(t){ return '« ' + t + ' »'; }).join(', ');
      return val == null ? '' : (typeof val === 'number' ? nb(val) : String(val));
    });
  }
  var moT = null;
  function controlerMo(){
    clearTimeout(moT);
    moT = setTimeout(function(){
      appeler('atelier:motifControler', [{ id: MO.id, motif: MO.motif }]).then(function(r){
        if (VUE !== 'motif' || !MO) return;
        MO.ctl = r && r.ok ? r.controles : [{ niveau: 'err', texte: expliquer(r) }];
        if (MO.onglet === 'impression' && !(document.activeElement && document.getElementById('mo-pan') && document.getElementById('mo-pan').contains(document.activeElement) && /^(INPUT|SELECT)$/.test(document.activeElement.tagName))) peindrePanMo();
      });
    }, 250);
  }
  function apresMo(redessiner){ if (redessiner) dessinerMo(); else { peindreMo(); peindrePanMo(); var e = document.getElementById('mo-enreg'); if (e) e.disabled = !MO.sale; var a = document.getElementById('mo-annuler'); if (a) a.disabled = !MOPILE.length; document.getElementById('sous').textContent = MO.m.nom + (MO.m.ref ? ' · ' + MO.m.ref : '') + (MO.sale ? ' · ${T("modifications non enregistrées")}' : ''); } controlerMo(); }

  function nouveauCalque(type, extra){
    moMemo();
    var n = 1; while ((MO.motif.calques || []).some(function(c){ return c.id === 'c' + n; })) n++;
    var zo = MO.motif.zone, c = { id: 'c' + n, type: type, x: zo.l * 0.2, y: zo.h * 0.3, l: zo.l * 0.6, h: type === 'texte' ? Math.max(1, zo.h * 0.1) : zo.l * 0.6, rot: 0, opacite: 1, miroir: false, visible: true };
    if (type === 'texte') { c.texte = 'SANDRIZA'; c.police = 'Arial'; c.couleur = '#1C1B18'; c.gras = true; }
    if (type === 'forme') { c.forme = 'rect'; c.couleur = '#B4583C'; c.plein = true; c.contour = 0.1; c.l = zo.l * 0.3; c.h = zo.l * 0.3; c.nom = '${T("Forme")}'; }
    if (extra) Object.keys(extra).forEach(function(k){ c[k] = extra[k]; });
    MO.motif.calques = (MO.motif.calques || []).concat([c]); MO.sel = c.id; MO.onglet = 'calque';
    apresMo(true);
  }
  /* Une image : lue, ramenée à 6000 px au plus de côté, déposée dans R2 à pleine résolution. */
  function importerImage(f){
    if (!f) return;
    if (!/^image[/](png|jpeg)$/.test(f.type)) { dire('${T("Choisissez une image PNG ou JPEG.")}', 'err'); return; }
    var lect = new FileReader();
    lect.onload = function(){
      var img = new Image();
      img.onload = function(){
        var w = img.naturalWidth, h = img.naturalHeight, d = String(lect.result || '');
        if (Math.max(w, h) > 6000) {
          var k = 6000 / Math.max(w, h), cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); d = cv.toDataURL(f.type); w = cv.width; h = cv.height;
        }
        dire('${T("Dépôt de l’image ({0} × {1} px)…")}'.split('{0}').join(w).split('{1}').join(h));
        appeler('atelier:motifImage', [d]).then(function(r){
          if (!r || !r.ok) { dire(r && r.motif === 'image_lourde' ? '${T("Image trop lourde (20 Mo au plus).")}' : expliquer(r), 'err'); return; }
          MOIMG[r.url] = d;
          var zo = MO.motif.zone, l = Math.min(zo.l * 0.8, w / 300 * 2.54), hh = l * h / w;
          if (hh > zo.h * 0.8) { hh = zo.h * 0.8; l = hh * w / h; }
          nouveauCalque('image', { url: r.url, px: { l: w, h: h }, nom: String(f.name || 'image').slice(0, 40), l: l, h: hh, x: (zo.l - l) / 2, y: (zo.h - hh) / 2 });
          dire('${T("Image déposée.")}', 'bon');
        });
      };
      img.onerror = function(){ dire('${T("Image illisible.")}', 'err'); };
      img.src = String(lect.result || '');
    };
    lect.readAsDataURL(f);
  }

  /* ── La souris (lot 5b) : la ZONE se saisit et se redimensionne ; un calque se déplace, se
     transforme par ses 8 poignées (Maj : proportions libres), tourne par sa poignée (Maj : 15°),
     s aimante aux bords et au centre de la zone et des autres calques (Alt : sans aimant) ; la
     molette zoome, Espace + glisser (ou le bouton du milieu) déplace la vue. Tout geste qui bouge
     quelque chose prend une étape d historique (Ctrl+Z). */
  function ecranMo(ev){ var r = document.getElementById('mo-svg').getBoundingClientRect(); return { sx: ev.clientX - r.left, sy: ev.clientY - r.top }; }
  function sourisMo(ev){ var e = ecranMo(ev); return { x: (e.sx - MX) / MK, y: (e.sy - MY) / MK }; }
  function localCalque(c, q){
    var a = -(c.rot || 0) * Math.PI / 180, cx = c.x + c.l / 2, cy = c.y + c.h / 2, dx = q.x - cx, dy = q.y - cy;
    return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) };
  }
  function dansCalque(c, q){
    var L = localCalque(c, q);
    if (!(Math.abs(L.x) <= c.l / 2 && Math.abs(L.y) <= Math.max(c.h, 6 / MK) / 2)) return false;
    // une forme NON PLEINE ne se saisit que près de son trait : son intérieur laisse passer le clic
    if (c.type === 'forme' && (c.plein === false || c.forme === 'ligne') && c.forme !== 'ligne') { var m = 8 / MK; return Math.abs(L.x) >= c.l / 2 - m || Math.abs(L.y) >= c.h / 2 - m; }
    return true;
  }
  function boiteRot(c){
    var a = (c.rot || 0) * Math.PI / 180, cx = c.x + c.l / 2, cy = c.y + c.h / 2, ex = Math.abs(Math.cos(a)) * c.l / 2 + Math.abs(Math.sin(a)) * c.h / 2, ey = Math.abs(Math.sin(a)) * c.l / 2 + Math.abs(Math.cos(a)) * c.h / 2;
    return { x0: cx - ex, x1: cx + ex, y0: cy - ey, y1: cy + ey, cx: cx, cy: cy };
  }
  /* L aimant : les bords et le centre de la boîte qui bouge vers ceux de la zone et des autres calques. */
  function aimanterMo(c, ev){
    MO.guides = [];
    if (ev.altKey) return;
    var b = boiteRot(c), zo = MO.motif.zone, seuil = 6 / MK, cibX = [0, zo.l / 2, zo.l], cibY = [0, zo.h / 2, zo.h];
    (MO.motif.calques || []).forEach(function(o){ if (o === c || o.visible === false) return; var bo = boiteRot(o); cibX.push(bo.x0, bo.cx, bo.x1); cibY.push(bo.y0, bo.cy, bo.y1); });
    var meilleur = function(bords, cibles){ var best = null; bords.forEach(function(e){ cibles.forEach(function(t){ var d = t - e; if (Math.abs(d) < seuil && (!best || Math.abs(d) < Math.abs(best.d))) best = { d: d, t: t }; }); }); return best; };
    var sx = meilleur([b.x0, b.cx, b.x1], cibX), sy = meilleur([b.y0, b.cy, b.y1], cibY);
    if (sx) { c.x += sx.d; MO.guides.push({ x: sx.t }); }
    if (sy) { c.y += sy.d; MO.guides.push({ y: sy.t }); }
  }
  var r1 = function(v){ return Math.round(v * 100) / 100; };
  corps.addEventListener('mousedown', function(ev){
    if (VUE !== 'motif' || !MO || !(ev.target && ev.target.closest && ev.target.closest('#mo-svg'))) return;
    ev.preventDefault();
    var e = ecranMo(ev), q = sourisMo(ev), c = moCalque(), V = vueMo(), avant = JSON.stringify(MO.motif);
    if (ev.button === 1 || MO.espace) { MO.glisse = { type: 'vue', e0: e, px: V.px, py: V.py }; return; }
    if (c && !c.verrou && c.visible !== false) {
      var L = localCalque(c, q), t = 7 / MK;
      if (Math.hypot(L.x, L.y + c.h / 2 + 22 / MK) < 8 / MK) {
        var ccx = c.x + c.l / 2, ccy = c.y + c.h / 2;
        MO.glisse = { type: 'rot', cx: ccx, cy: ccy, rot0: c.rot || 0, a0: Math.atan2(q.y - ccy, q.x - ccx), avant: avant }; return;
      }
      for (var k = 0; k < POIGNEES.length; k++) { var pg = POIGNEES[k];
        if (Math.abs(L.x - pg[1] * c.l / 2) < t && Math.abs(L.y - pg[2] * c.h / 2) < t) {
          MO.glisse = { type: 'taille', sx: pg[1], sy: pg[2], e0: e, l0: c.l, h0: c.h, cx0: c.x + c.l / 2, cy0: c.y + c.h / 2, avant: avant }; return;
        }
      }
    }
    var zo = MO.motif.zone, place = MO.motif.mode === 'place';
    if (place && MO.zoneSel) for (var z2 = 0; z2 < POIGNEES.length; z2++) { var pz = POIGNEES[z2];
      if (Math.abs(q.x - (pz[1] + 1) / 2 * zo.l) * MK < 8 && Math.abs(q.y - (pz[2] + 1) / 2 * zo.h) * MK < 8) {
        MO.glisse = { type: 'zoneTaille', sx: pz[1], sy: pz[2], e0: e, z0: { x: zo.x, y: zo.y, l: zo.l, h: zo.h }, avant: avant }; return;
      }
    }
    // le calque déjà choisi passe d abord ; un calque verrouillé ou masqué ne se saisit pas sur la toile
    var cs = (MO.motif.calques || []).slice().reverse().filter(function(x){ return x.visible !== false && !x.verrou; });
    if (c && c.visible !== false && !c.verrou) cs = [c].concat(cs.filter(function(x){ return x !== c; }));
    for (var i = 0; i < cs.length; i++) if (dansCalque(cs[i], q)) {
      var neuf = MO.sel !== cs[i].id; MO.sel = cs[i].id; MO.zoneSel = false; MO.onglet = 'calque';
      MO.glisse = { type: 'deplacer', e0: e, x: cs[i].x, y: cs[i].y, avant: avant };
      if (neuf) dessinerMo(); else peindreMo();
      return;
    }
    if (place && q.x >= 0 && q.y >= 0 && q.x <= zo.l && q.y <= zo.h) {
      MO.sel = ''; MO.zoneSel = true;
      MO.glisse = { type: 'zone', e0: e, x: zo.x, y: zo.y, avant: avant };
      dessinerMo(); return;
    }
    MO.sel = ''; MO.zoneSel = false; dessinerMo();
    MO.glisse = { type: 'vue', e0: e, px: V.px, py: V.py };
  });
  window.addEventListener('mousemove', function(ev){
    if (VUE !== 'motif' || !MO || !MO.glisse) return;
    var g = MO.glisse, e = ecranMo(ev), dx = (e.sx - (g.e0 ? g.e0.sx : 0)) / MK, dy = (e.sy - (g.e0 ? g.e0.sy : 0)) / MK, c = moCalque(), zo = MO.motif.zone;
    if (g.e0 && !g.bouge && Math.hypot(e.sx - g.e0.sx, e.sy - g.e0.sy) < 2) return;
    g.bouge = true;
    if (g.type === 'vue') { var V = vueMo(); V.px = g.px + e.sx - g.e0.sx; V.py = g.py + e.sy - g.e0.sy; peindreMo(); return; }
    if (g.type === 'zone') { zo.x = r1(g.x + dx); zo.y = r1(g.y + dy); MO.guides = []; peindreMo(); return; }
    if (g.type === 'zoneTaille') {
      var z0 = g.z0;
      if (g.sx) { var nl = Math.max(2, z0.l + g.sx * dx); zo.l = r1(nl); zo.x = r1(g.sx < 0 ? z0.x + z0.l - nl : z0.x); }
      if (g.sy) { var nh = Math.max(2, z0.h + g.sy * dy); zo.h = r1(nh); zo.y = r1(g.sy < 0 ? z0.y + z0.h - nh : z0.y); }
      peindreMo(); return;
    }
    if (!c) return;
    if (g.type === 'deplacer') { c.x = r1(g.x + dx); c.y = r1(g.y + dy); aimanterMo(c, ev); c.x = r1(c.x); c.y = r1(c.y); }
    else if (g.type === 'rot') {
      var q = sourisMo(ev), a = g.rot0 + (Math.atan2(q.y - g.cy, q.x - g.cx) - g.a0) * 180 / Math.PI;
      if (ev.shiftKey) a = Math.round(a / 15) * 15;
      c.rot = Math.round(((a % 360 + 540) % 360 - 180) * 10) / 10;
    } else if (g.type === 'taille') {
      var ra = (c.rot || 0) * Math.PI / 180, lx = dx * Math.cos(-ra) - dy * Math.sin(-ra), ly = dx * Math.sin(-ra) + dy * Math.cos(-ra);
      var nlc = g.sx ? Math.max(0.2, g.l0 + g.sx * lx) : g.l0, nhc = g.sy ? Math.max(0.2, g.h0 + g.sy * ly) : g.h0;
      // un coin garde les proportions (Maj : libres), un côté étire un seul sens
      if (g.sx && g.sy && !ev.shiftKey) { var kk = Math.max(nlc / g.l0, nhc / g.h0); nlc = Math.max(0.2, g.l0 * kk); nhc = Math.max(0.2, g.h0 * kk); }
      var ox = g.sx * (nlc - g.l0) / 2, oy = g.sy * (nhc - g.h0) / 2;
      var ncx = g.cx0 + ox * Math.cos(ra) - oy * Math.sin(ra), ncy = g.cy0 + ox * Math.sin(ra) + oy * Math.cos(ra);
      c.l = r1(nlc); c.h = r1(nhc); c.x = r1(ncx - nlc / 2); c.y = r1(ncy - nhc / 2);
    }
    peindreMo();
  });
  window.addEventListener('mouseup', function(){
    if (!MO || !MO.glisse) return;
    var g = MO.glisse; MO.glisse = null; MO.guides = [];
    if (g.bouge && g.type !== 'vue') { MOPILE.push(g.avant); if (MOPILE.length > 80) MOPILE.shift(); MOREF = []; MO.sale = true; apresMo(g.type === 'zone' || g.type === 'zoneTaille'); }
    else peindreMo();
  });
  corps.addEventListener('wheel', function(ev){
    if (VUE !== 'motif' || !MO || !(ev.target && ev.target.closest && ev.target.closest('#mo-toile'))) return;
    ev.preventDefault();
    zoomerMo(ev.deltaY < 0 ? 1.15 : 1 / 1.15, ecranMo(ev));
  }, { passive: false });
  function zoomerMo(f, e){
    var V = vueMo(), z = document.getElementById('mo-toile'), W = z ? z.clientWidth : 800, H = z ? z.clientHeight : 600;
    var p = e || { sx: W / 2, sy: H / 2 }, z2 = Math.max(0.25, Math.min(12, V.z * f));
    // le point sous la souris reste sous la souris
    var ux = (p.sx - W / 2 - V.px) / V.z, uy = (p.sy - H / 2 - V.py) / V.z;
    V.px = p.sx - W / 2 - ux * z2; V.py = p.sy - H / 2 - uy * z2; V.z = z2;
    peindreMo();
  }
  /* Les raccourcis (lot 5b), hors d un champ de saisie. */
  function toucheMo(ev){
    var tag = (ev.target && ev.target.tagName) || '';
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) return false;
    var c = moCalque(), k = String(ev.key), ctrl = ev.ctrlKey || ev.metaKey, cs = MO.motif.calques || [];
    if (k === ' ') { MO.espace = true; ev.preventDefault(); return true; }
    if (ctrl && k.toLowerCase() === 'z') { ev.preventDefault(); if (ev.shiftKey) refaireMo(); else annulerMo(); return true; }
    if (ctrl && k.toLowerCase() === 'y') { ev.preventDefault(); refaireMo(); return true; }
    if (ctrl && (k === '0')) { ev.preventDefault(); var V = vueMo(); V.z = 1; V.px = 0; V.py = 0; peindreMo(); return true; }
    if (ctrl && (k === '+' || k === '=')) { ev.preventDefault(); zoomerMo(1.25); return true; }
    if (ctrl && k === '-') { ev.preventDefault(); zoomerMo(1 / 1.25); return true; }
    if (/^Arrow/.test(k) && (c || MO.zoneSel)) {
      ev.preventDefault();
      var pas = ev.shiftKey ? 1 : 0.1, cible = c && !c.verrou ? c : (MO.zoneSel ? MO.motif.zone : null); if (!cible) return true;
      moMemo();
      if (k === 'ArrowLeft') cible.x = r1(cible.x - pas); if (k === 'ArrowRight') cible.x = r1(cible.x + pas);
      if (k === 'ArrowUp') cible.y = r1(cible.y - pas); if (k === 'ArrowDown') cible.y = r1(cible.y + pas);
      apresMo(false); return true;
    }
    if (!c) return false;
    var i = cs.indexOf(c);
    if ((k === 'Delete' || k === 'Backspace') && !c.verrou) { ev.preventDefault(); moMemo(); cs.splice(i, 1); MO.sel = ''; apresMo(true); return true; }
    if (ctrl && (k.toLowerCase() === 'j' || k.toLowerCase() === 'd')) { ev.preventDefault(); dupliquerCalque(c); return true; }
    if (ctrl && (k === ']' || k === '}')) { ev.preventDefault(); ordreCalque(c, ev.shiftKey ? 'premier' : 'monter'); return true; }
    if (ctrl && (k === '[' || k === '{')) { ev.preventDefault(); ordreCalque(c, ev.shiftKey ? 'arriere' : 'descendre'); return true; }
    return false;
  }
  document.addEventListener('keyup', function(ev){ if (MO && String(ev.key) === ' ') MO.espace = false; });
  function dupliquerCalque(c){
    var cs = MO.motif.calques, d = copie(c), n = 1; while (cs.some(function(x){ return x.id === 'c' + n; })) n++;
    moMemo(); d.id = 'c' + n; d.x = r1(d.x + 1); d.y = r1(d.y + 1); d.verrou = false; cs.splice(cs.indexOf(c) + 1, 0, d); MO.sel = d.id; apresMo(true);
  }
  function ordreCalque(c, o){
    var cs = MO.motif.calques, i = cs.indexOf(c), j = o === 'monter' ? i + 1 : o === 'descendre' ? i - 1 : o === 'premier' ? cs.length - 1 : 0;
    if (j < 0 || j >= cs.length || j === i) return;
    moMemo(); cs.splice(i, 1); cs.splice(j, 0, c); apresMo(true);
  }
  function refaireMo(){ if (!MOREF.length) return; MOPILE.push(JSON.stringify(MO.motif)); MO.motif = JSON.parse(MOREF.pop()); MO.sale = true; if (!moCalque()) MO.sel = ''; apresMo(true); }
  /* Disposer dans la zone : aligner (sur la boîte tournée), ajuster, remplir, retourner. */
  function disposerMo(c, a){
    var zo = MO.motif.zone, b = boiteRot(c);
    moMemo();
    if (a === 'g') c.x = r1(c.x - b.x0); if (a === 'd') c.x = r1(c.x + zo.l - b.x1); if (a === 'ch') c.x = r1(c.x + zo.l / 2 - b.cx);
    if (a === 'h') c.y = r1(c.y - b.y0); if (a === 'b') c.y = r1(c.y + zo.h - b.y1); if (a === 'cv') c.y = r1(c.y + zo.h / 2 - b.cy);
    if (a === 'ajuster' || a === 'remplir') {
      var k = a === 'ajuster' ? Math.min(zo.l / c.l, zo.h / c.h) : Math.max(zo.l / c.l, zo.h / c.h);
      c.rot = 0; c.l = r1(c.l * k); c.h = r1(c.h * k); c.x = r1((zo.l - c.l) / 2); c.y = r1((zo.h - c.h) / 2);
    }
    if (a === 'flipH') c.miroir = !c.miroir;
    if (a === 'flipV') c.retourneV = !c.retourneV;
    apresMo(false);
  }
  function detourerMo(c){
    var sel = document.getElementById('mo-dt-tol'), tol = sel ? parseInt(sel.value, 10) : 36, b = document.getElementById('mo-dt');
    if (b) b.disabled = true;
    dire('${T("Retrait du fond à pleine résolution…")}');
    appeler('atelier:motifDetourer', [c.url, tol]).then(function(r){
      if (b) b.disabled = false;
      if (!r || !r.ok) { dire(r && r.motif === 'fond_non_uni' ? '${T("Le fond n’est pas uni : presque rien n’a été retiré. Essayez une tolérance plus forte, ou une image au fond uni.")}' : expliquer(r), 'err'); return; }
      moMemo(); c.url = r.url; c.px = r.px; MOIMG[r.url] = ''; chargerImagesMo(); apresMo(false);
      dire('${T("Fond retiré ({0} % de l’image).")}'.split('{0}').join(Math.round(r.part * 100)), 'bon');
    });
  }

  function clicMo(ev){
    var t = ev.target, b, c = moCalque();
    if ((b = t.closest('[data-momode]'))) { moMemo(); MO.motif.mode = b.getAttribute('data-momode'); apresMo(true); return; }
    if ((b = t.closest('[data-moracc]'))) { moMemo(); MO.motif.raccord = b.getAttribute('data-moracc'); apresMo(true); return; }
    if ((b = t.closest('[data-moeil]'))) { var ce = (MO.motif.calques || []).filter(function(x){ return x.id === b.getAttribute('data-moeil'); })[0]; if (ce) { moMemo(); ce.visible = ce.visible === false; apresMo(true); } return; }
    if ((b = t.closest('[data-moverrou]'))) { var cv = (MO.motif.calques || []).filter(function(x){ return x.id === b.getAttribute('data-moverrou'); })[0]; if (cv) { moMemo(); cv.verrou = !cv.verrou; apresMo(true); } return; }
    if ((b = t.closest('[data-mozoom]'))) { var zv = b.getAttribute('data-mozoom'); if (zv === '0') { var V = vueMo(); V.z = 1; V.px = 0; V.py = 0; peindreMo(); } else zoomerMo(zv === '+' ? 1.25 : 1 / 1.25); return; }
    if ((b = t.closest('[data-mocal]'))) { MO.sel = b.getAttribute('data-mocal'); MO.zoneSel = false; MO.onglet = 'calque'; dessinerMo(); return; }
    if ((b = t.closest('[data-moong]'))) { MO.onglet = b.getAttribute('data-moong'); peindrePanMo(); return; }
    if ((b = t.closest('[data-moproc]'))) { moMemo(); MO.motif.procede = b.getAttribute('data-moproc'); apresMo(false); return; }
    if ((b = t.closest('[data-mosortie]'))) { sortieMo(b.getAttribute('data-mosortie'), b); return; }
    if (t.closest('#mo-add-image')) { var f = document.getElementById('mo-fichier'); if (f) { f.value = ''; f.click(); } return; }
    if (t.closest('#mo-add-texte')) { nouveauCalque('texte'); return; }
    if (t.closest('#mo-add-forme')) { nouveauCalque('forme'); return; }
    if (t.closest('#mo-centrer')) {
      var p = (MO.m.pieces || []).filter(function(x){ return x.id === MO.motif.piece; })[0]; if (!p) return;
      moMemo();
      var bb = boitePiece(p), zo = MO.motif.zone;
      zo.x = p.aupli && p.pli ? Math.round(-zo.l / 2 * 10) / 10 : Math.round(((bb.x0 + bb.x1) / 2 - zo.l / 2) * 10) / 10;
      apresMo(false); return;
    }
    if (!c) return;
    if ((b = t.closest('[data-moali]'))) { disposerMo(c, b.getAttribute('data-moali')); return; }
    var cs = MO.motif.calques, i = cs.indexOf(c);
    if (t.closest('#mo-c-premier')) { ordreCalque(c, 'premier'); return; }
    if (t.closest('#mo-c-monter')) { ordreCalque(c, 'monter'); return; }
    if (t.closest('#mo-c-descendre')) { ordreCalque(c, 'descendre'); return; }
    if (t.closest('#mo-c-arriere')) { ordreCalque(c, 'arriere'); return; }
    if (t.closest('#mo-c-dupl')) { dupliquerCalque(c); return; }
    if (t.closest('#mo-c-suppr')) { moMemo(); cs.splice(i, 1); MO.sel = ''; apresMo(true); return; }
    if (t.closest('#mo-f-zero')) { moMemo(); delete c.filtres; apresMo(false); return; }
    if (t.closest('#mo-dt')) { detourerMo(c); return; }
  }
  function changeMo(t){
    var id = t.id, mo = MO.motif, c = moCalque();
    var num = function(v){ return nombre(v, NaN); };
    if (id === 'mo-fichier') { importerImage(t.files && t.files[0]); return; }
    if (id === 'mo-piece') { moMemo(); mo.piece = t.value; apresMo(false); return; }
    if (id === 'mo-zx' || id === 'mo-zy') { var vz = num(t.value); if (!isFinite(vz) || Math.abs(vz) > 300) { dire('${T("Nombre illisible.")}', 'err'); return; } moMemo(); mo.zone[id === 'mo-zx' ? 'x' : 'y'] = r1(vz); apresMo(false); return; }
    if (id === 'mo-zl' || id === 'mo-zh') { var v = num(t.value); if (!(v >= 2 && v <= 300)) { dire('${T("Une zone va de 2 à 300 cm.")}', 'err'); return; } moMemo(); mo.zone[id === 'mo-zl' ? 'l' : 'h'] = Math.round(v * 10) / 10; apresMo(false); return; }
    if (id === 'mo-ppp') { moMemo(); mo.ppp = parseInt(t.value, 10) === 600 ? 600 : 300; apresMo(false); return; }
    if (id === 'mo-sous') { moMemo(); mo.souscouche = t.value; apresMo(false); return; }
    if (id === 'mo-fond') { moMemo(); mo.fond = t.value; apresMo(false); return; }
    if (!c) return;
    var champs = { 'mo-c-x': 'x', 'mo-c-y': 'y', 'mo-c-l': 'l', 'mo-c-h': 'h', 'mo-c-rot': 'rot' };
    if (champs[id]) { var w = num(t.value); if (!isFinite(w)) { dire('${T("Nombre illisible.")}', 'err'); return; } if ((id === 'mo-c-l' || id === 'mo-c-h') && w < 0.2) { dire('${T("Au moins 2 mm.")}', 'err'); return; } moMemo(); c[champs[id]] = Math.round(w * 10) / 10; apresMo(false); return; }
    moMemo();
    if (id === 'mo-c-op') c.opacite = Math.max(0, Math.min(100, parseInt(t.value, 10) || 0)) / 100;
    else if (id === 'mo-c-texte') c.texte = String(t.value).slice(0, 200);
    else if (id === 'mo-c-nom') c.nom = String(t.value).slice(0, 40);
    else if (id === 'mo-c-police') c.police = t.value;
    else if (id === 'mo-c-gras') c.gras = !!t.checked;
    else if (id === 'mo-c-couleur') c.couleur = String(t.value).toUpperCase();
    else if (id === 'mo-c-forme') c.forme = t.value;
    else if (id === 'mo-c-plein') c.plein = !!t.checked;
    else if (id === 'mo-c-contour') c.contour = Math.max(0, Math.min(50, num(t.value) || 0)) / 10;
    else if (id === 'mo-c-miroir') c.miroir = !!t.checked;
    else if (id === 'mo-c-visible') c.visible = !!t.checked;
    else if (id === 'mo-c-verrou') c.verrou = !!t.checked;
    else if (id === 'mo-c-fusion') c.fusion = t.value;
    else if (id === 'mo-c-ajust') c.ajustement = t.value;
    else if (id === 'mo-c-ccoul') c.contourCouleur = String(t.value).toUpperCase();
    else if (id === 'mo-c-cep') c.contourEp = Math.max(0, Math.min(20, num(t.value) || 0)) / 10;
    else if (id === 'mo-c-rayon') c.rayon = Math.max(0, Math.min(100, num(t.value) || 0));
    else if (id === 'mo-c-branches') c.branches = Math.max(3, Math.min(12, parseInt(t.value, 10) || 5));
    else if (/^mo-f-/.test(id)) {
      var f = c.filtres || { lum: 100, con: 100, sat: 100, teinte: 0, gris: false }, cle = id.slice(5), bornes = { lum: [0, 200], con: [0, 200], sat: [0, 300], teinte: [-180, 180] };
      if (cle === 'gris') f.gris = !!t.checked; else { var vf = num(t.value); if (!isFinite(vf)) { MOPILE.pop(); dire('${T("Nombre illisible.")}', 'err'); return; } f[cle] = Math.max(bornes[cle][0], Math.min(bornes[cle][1], Math.round(vf))); }
      c.filtres = f;
    }
    else { MOPILE.pop(); return; }
    apresMo(id === 'mo-c-texte' || id === 'mo-c-nom' || id === 'mo-c-visible' || id === 'mo-c-verrou' || id === 'mo-c-forme');
  }
  function enregistrerMo(apres){
    if (OCCUPE || !MO) return;
    if (!MO.sale) { if (apres) apres(); return; }
    OCCUPE = true; dire('${T("Enregistrement…")}');
    appeler('atelier:ecrire', [{ id: MO.id, nom: MO.m.nom, motif: MO.motif }]).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      MO.sale = false;
      appeler('atelier:donnees', []).then(function(d){
        if (d && d.ok) { D = d; var m = (D.modeles || []).filter(function(x){ return x.id === MO.id; })[0]; if (m && MO) { MO.m = m; MO.motif = copie(m.motif || MO.motif); } }
        if (VUE === 'motif' && MO) { apresMo(false); dire('${T("Motif enregistré.")}', 'bon'); }
        if (apres) apres();
      });
    });
  }
  /* Remplacer les adresses des images par leur donnée : le PDF et le PNG doivent les contenir. */
  function avecDonnees(txt){
    var urls = {}; String(txt).replace(/href="(https:[^"]+)"/g, function(a, u){ urls[u] = 1; return a; });
    return Promise.all(Object.keys(urls).map(function(u){
      if (MOIMG[u] && MOIMG[u] !== 'chargement') return Promise.resolve();
      return Promise.resolve(P && P.imageLocale ? P.imageLocale(u) : null).then(function(d){ MOIMG[u] = d || ''; });
    })).then(function(){
      return String(txt).replace(/href="(https:[^"]+)"/g, function(a, u){ return MOIMG[u] ? 'href="' + MOIMG[u] + '"' : a; });
    });
  }
  /* Le bloc PNG « pHYs » : la résolution écrite dans le fichier. */
  var CRC = null;
  function crc32(oct){
    if (!CRC) { CRC = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0; } }
    var x = 0xFFFFFFFF; for (var i = 0; i < oct.length; i++) x = CRC[(x ^ oct[i]) & 255] ^ (x >>> 8);
    return (x ^ 0xFFFFFFFF) >>> 0;
  }
  function pngAvecPpp(dataUrl, ppp){
    var b64 = dataUrl.slice(dataUrl.indexOf(',') + 1), bin = atob(b64), n = bin.length, o = new Uint8Array(n);
    for (var i = 0; i < n; i++) o[i] = bin.charCodeAt(i);
    var ppm = Math.round(ppp / 0.0254), u32 = function(v){ return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]; };
    var corpsC = [112, 72, 89, 115].concat(u32(ppm), u32(ppm), [1]);
    var bloc = u32(9).concat(corpsC, u32(crc32(corpsC)));
    var sortie = new Uint8Array(n + bloc.length);
    sortie.set(o.subarray(0, 33), 0); sortie.set(bloc, 33); sortie.set(o.subarray(33), 33 + bloc.length);   // juste après IHDR
    var s = ''; for (var j = 0; j < sortie.length; j += 32768) s += String.fromCharCode.apply(null, sortie.subarray(j, j + 32768));
    return 'data:image/png;base64,' + btoa(s);
  }
  function sortieMo(format, btn){
    if (!P || typeof P.enregistrerExport !== 'function') { dire('${T("Cette version de l’application ne sait pas enregistrer un export.")}', 'err'); return; }
    enregistrerMo(function(){
      if (btn) btn.disabled = true;
      var fin = function(msg, cl){ if (btn) btn.disabled = false; dire(msg, cl); };
      dire('${T("Préparation du fichier…")}');
      appeler('atelier:motifExporter', [{ id: MO.id, format: format }]).then(function(r){
        if (!r || !r.ok) { fin(expliquer(r), 'err'); return; }
        var ecrire = function(contenu){
          Promise.resolve(P.enregistrerExport(r.nom, contenu)).then(function(w){
            if (w && w.ok) fin('${T("Enregistré : {0}")}'.split('{0}').join(w.path || r.nom), 'bon');
            else if (w && w.annule) fin('${T("Export annulé : le code d’export n’a pas été donné.")}', 'att');
            else fin('${T("L’enregistrement a échoué : {0}")}'.split('{0}').join((w && w.error) || '?'), 'err');
          });
        };
        if (r.type === 'texte') { avecDonnees(r.contenu).then(ecrire); return; }
        if (r.type === 'pdf') {
          if (typeof P.documentPdf !== 'function') { fin('${T("Cette version de l’application ne sait pas fabriquer de PDF.")}', 'err'); return; }
          avecDonnees(r.contenu).then(function(html){
            Promise.resolve(P.documentPdf(html, { pageCss: true })).then(function(pdf){
              if (!pdf || !pdf.ok) { fin('${T("Le PDF n’a pas pu être fabriqué : {0}")}'.split('{0}').join((pdf && pdf.error) || '?'), 'err'); return; }
              ecrire('data:application/pdf;base64,' + pdf.base64);
            });
          });
          return;
        }
        // PNG : le SVG du site rastérisé à la résolution voulue, la résolution écrite dans le fichier
        dire('${T("Rendu de l’image ({0} × {1} px)…")}'.split('{0}').join(r.pixels.l).split('{1}').join(r.pixels.h));
        avecDonnees(r.svg).then(function(svg){
          svg = svg.replace(/width="[^"]*mm" height="[^"]*mm"/, 'width="' + r.pixels.l + '" height="' + r.pixels.h + '"');
          var img = new Image();
          img.onload = function(){
            var cv = document.createElement('canvas'); cv.width = r.pixels.l; cv.height = r.pixels.h;
            var g = cv.getContext('2d'); if (r.fond === 'blanc') { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, cv.width, cv.height); }
            g.drawImage(img, 0, 0, cv.width, cv.height);
            try { ecrire(pngAvecPpp(cv.toDataURL('image/png'), r.ppp)); }
            catch (e) { fin('${T("Le rendu a échoué : {0}")}'.split('{0}').join(String((e && e.message) || e)), 'err'); }
          };
          img.onerror = function(){ fin('${T("Le rendu a échoué : {0}")}'.split('{0}').join('svg'), 'err'); };
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        });
      });
    });
  }
  function quitterMo(){
    var sortir = function(){ var r = MO ? MO.retour : 'biblio', id = MO ? MO.id : ''; MO = null; if (window._moRO) { window._moRO.disconnect(); window._moRO = null; }
      if (r === 'editeur' && id) { VUE = 'biblio'; ouvrirEditeur(id); return; } VUE = 'biblio'; dessiner(); dire(''); };
    if (!MO || !MO.sale) { sortir(); return; }
    szConfirmer({ titre: '${T("Quitter sans enregistrer ?")}', texte: '${T("Les changements du motif seront perdus.")}', oui: '${T("Quitter")}', danger: true }).then(function(ok){ if (ok) sortir(); });
  }
  function annulerMo(){ if (!MOPILE.length) return; MOREF.push(JSON.stringify(MO.motif)); MO.motif = JSON.parse(MOPILE.pop()); MO.sale = true; if (!moCalque()) MO.sel = ''; apresMo(true); }

  /* ══ LES GESTES ═══════════════════════════════════════════════════════ */
  corps.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    if (VUE === 'editeur') { if (E) clicEditeur(ev); return; }
    if (VUE === 'impression') { if (IMP) clicImpression(ev); return; }
    if (VUE === '3d') { if (V3) clic3d(ev); return; }
    if (VUE === 'motif') { if (MO) clicMo(ev); return; }
    var b;
    if ((b = t.closest('[data-motif]'))) { ouvrirMotif(b.getAttribute('data-motif'), 'biblio'); return; }
    if ((b = t.closest('[data-v3]'))) { ouvrir3d(b.getAttribute('data-v3'), 'biblio'); return; }
    if ((b = t.closest('[data-imprimer]'))) { ouvrirImpression(b.getAttribute('data-imprimer'), 'biblio'); return; }
    if ((b = t.closest('[data-editer]'))) { ouvrirEditeur(b.getAttribute('data-editer')); return; }
    if ((b = t.closest('[data-cat]'))) { CAT = b.getAttribute('data-cat'); dessiner(); return; }
    if ((b = t.closest('[data-etat]'))) { var e = b.getAttribute('data-etat'); ETAT = ETAT === e ? '' : e; dessiner(); return; }
    if ((b = t.closest('[data-ouvrir]'))) { ouvrirModele(b.getAttribute('data-ouvrir')); return; }
    if ((b = t.closest('[data-dupl]'))) { dupliquer(b.getAttribute('data-dupl')); return; }
    if ((b = t.closest('[data-suppr]'))) { supprimer(b.getAttribute('data-suppr')); return; }
    if ((b = t.closest('[data-sel]'))) { SEL = b.getAttribute('data-sel'); dessiner(); return; }
    if ((b = t.closest('[data-base]'))) {
      var nb = b.getAttribute('data-base'); if (nb === M.base) return;
      var bs = (D.bases || []).filter(function(x){ return x.cle === nb; })[0];
      M.base = nb; M.options = copie(bs ? bs.options : {}); if (!M.id && bs) M.categorie = bs.categorie;
      TRACE = true; dessinerModele(); return;
    }
    if ((b = t.closest('[data-tap]'))) { TAP = b.getAttribute('data-tap'); TOUTES = false; dessinerModele(); return; }
    if ((b = t.closest('[data-toutes]'))) { TOUTES = !TOUTES; dessinerModele(); return; }
    if ((b = t.closest('#m-standard'))) { M.tableau = copie(D.standard); TRACE = true; dessinerModele(); dire('${T("Tableau standard remis.")}', 'bon'); return; }
  });
  corps.addEventListener('dblclick', function(ev){
    if (VUE === 'editeur' || VUE === 'impression' || VUE === '3d' || VUE === 'motif') return;
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-sel]') : null;
    if (b) ouvrirModele(b.getAttribute('data-sel'));
  });
  corps.addEventListener('input', function(ev){
    if (VUE === 'editeur' || VUE === 'impression' || VUE === '3d' || VUE === 'motif') return;
    var t = ev.target;
    if (t && t.id === 'a-q') { Q = t.value; clearTimeout(window._atQ); window._atQ = setTimeout(redessinerSansPerdreLaSaisie, 200); return; }
    ramasser(t);
  });
  corps.addEventListener('change', function(ev){
    var t = ev.target; if (!t) return;
    if (VUE === 'editeur') { if (E) changeEditeur(t); return; }
    if (VUE === 'impression') { if (IMP) changeImpression(t); return; }
    if (VUE === '3d') { if (V3) change3d(t); return; }
    if (VUE === 'motif') { if (MO) changeMo(t); return; }
    if (t.hasAttribute && t.hasAttribute('data-taille')) {
      var tl = t.getAttribute('data-taille');
      var ls = (M.tailles || []).filter(function(x){ return x !== tl; });
      if (t.checked) ls.push(tl);
      if (tl === M.tailleBase && !t.checked) { t.checked = true; dire(MOTIFS.tailles, 'att'); return; }
      M.tailles = (D.tailles || []).filter(function(x){ return ls.indexOf(x) >= 0; });
      if (TOUTES) demanderApercu();
      return;
    }
    if (t.tagName === 'SELECT') ramasser(t);
  });
  corps.addEventListener('mousedown', function(ev){
    if (VUE === 'editeur' && E && ev.target && ev.target.closest && ev.target.closest('#e-svg')) baisser(ev);
  });
  window.addEventListener('mousemove', function(ev){ if (VUE === 'editeur' && E) bouger(ev); });
  window.addEventListener('mouseup', function(){ if (GLISSE) lever(); });
  corps.addEventListener('wheel', function(ev){
    if (VUE !== 'editeur' || !E || !(ev.target && ev.target.closest && ev.target.closest('#e-toile'))) return;
    ev.preventDefault();
    var m = souris(ev); zoomer(K * (ev.deltaY < 0 ? 1.15 : 1 / 1.15), m.x, m.y);
  }, { passive: false });
  document.addEventListener('click', function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    if (t.closest('#e-retour')) { quitterEditeur(); return; }
    if (t.closest('#e-imprimer')) { imprimerDepuisEditeur(); return; }
    if (t.closest('#i-retour')) { quitterImpression(); return; }
    if (t.closest('#v3-retour')) { quitter3d(); return; }
    if (t.closest('#mo-retour')) { quitterMo(); return; }
    if (t.closest('#mo-enreg')) { enregistrerMo(); return; }
    if (t.closest('#mo-annuler')) { annulerMo(); return; }
    if (t.closest('#v3-photo')) { photo3d(); return; }
    if (t.closest('#e-3d')) { troisDDepuisEditeur(); return; }
    if (t.closest('#i-exporter')) { exporterFichier(t.closest('#i-exporter')); return; }
    if (t.closest('#i-dossier')) { if (P && P.ouvrirDossierExports) P.ouvrirDossierExports(); return; }
    if (t.closest('#e-annuler')) { annuler(); return; }
    if (t.closest('#e-refaire')) { refaire(); return; }
    if (t.closest('#e-enreg')) { enregistrerEditeur(t.closest('#e-enreg')); return; }
    if (t.closest('#m-editer')) { if (M && M.id && !TRACE) { var mid = M.id; M = null; ouvrirEditeur(mid); } return; }
    if (t.closest('#a-nouveau')) { ouvrirNeuf(); return; }
    if (t.closest('#m-retour')) { revenir(); return; }
    if (t.closest('#m-enreg')) { enregistrer(t.closest('#m-enreg')); return; }
  });

  function ouvrirNeuf(){ if (!D) return; M = modeleNeuf('robe'); TRACE = true; TAP = 'M'; TOUTES = false; VUE = 'modele'; dessiner(); var n = document.getElementById('m-nom'); if (n) n.focus(); }
  function ouvrirModele(id){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (!m) { dire(MOTIFS.introuvable, 'err'); return; }
    SEL = id; M = copie(m); TRACE = false; TAP = m.tailleBase || 'M'; TOUTES = false; VUE = 'modele'; dessiner();
  }
  function revenir(){
    if (TRACE && M && M.id) {
      szConfirmer({ titre: '${T("Quitter sans enregistrer ?")}', texte: '${T("Les changements de base, d’options ou de mesures seront perdus.")}', oui: '${T("Quitter")}', danger: true })
        .then(function(ok){ if (ok) { M = null; TRACE = false; VUE = 'biblio'; dessiner(); } });
      return;
    }
    M = null; TRACE = false; VUE = 'biblio'; dessiner();
  }
  function dupliquer(id){
    if (OCCUPE) return; OCCUPE = true; dire('${T("Copie…")}');
    appeler('atelier:dupliquer', [id]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      SEL = r.id || SEL; charger(function(){ dire('${T("Copie créée, en brouillon.")}', 'bon'); });
    });
  }
  function supprimer(id){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0]; if (!m) return;
    szConfirmer({ titre: '${T("Supprimer ce modèle ?")}', texte: '${T("Le modèle, ses pièces et ses versions disparaissent. Les produits liés ne sont pas touchés.")}',
      details: [['${T("Modèle")}', m.nom + (m.ref ? ' (' + m.ref + ')' : '')], ['${T("Versions")}', String((m.versions || []).length)]],
      oui: '${T("Supprimer le modèle")}', danger: true }).then(function(ok){
      if (!ok) return;
      dire('${T("Suppression…")}');
      appeler('atelier:supprimer', [id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        if (SEL === id) SEL = '';
        charger(function(){ dire('${T("Modèle supprimé.")}', 'att'); });
      });
    });
  }

  /* Le clic droit du socle : les gestes de la carte. */
  /* Mêmes gestes, mêmes droits que les boutons du panneau (règle #110). */
  window.szCtxEntrees = function(el){
    var id = el && el.getAttribute ? el.getAttribute('data-ctx-ligne') : '';
    if (!id || !D) return null;
    if (id.indexOf('mo:') === 0) {                // un calque du motif
      var mc = MO ? (MO.motif.calques || []).filter(function(x){ return x.id === id.slice(3); })[0] : null; if (!mc) return null;
      return [{ lib: '${T("Dupliquer")}', fn: function(){ dupliquerCalque(mc); } },
        { lib: '${T("Premier plan")}', fn: function(){ ordreCalque(mc, 'premier'); } }, { lib: '${T("Arrière-plan")}', fn: function(){ ordreCalque(mc, 'arriere'); } },
        { lib: mc.visible === false ? '${T("Afficher")}' : '${T("Masquer")}', fn: function(){ moMemo(); mc.visible = mc.visible === false; apresMo(true); } },
        { lib: mc.verrou ? '${T("Déverrouiller")}' : '${T("Verrouiller")}', fn: function(){ moMemo(); mc.verrou = !mc.verrou; apresMo(true); } },
        { trait: true }, { lib: '${T("Supprimer")}', dgr: true, fn: function(){ var cs = MO.motif.calques; moMemo(); cs.splice(cs.indexOf(mc), 1); MO.sel = ''; apresMo(true); } }];
    }
    if (id.indexOf('p:') === 0) {                 // une pièce, dans le panneau de l éditeur
      var pi = parseInt(id.slice(2), 10); if (!E || !E.pieces[pi]) return null;
      return [{ lib: '${T("Choisir la pièce")}', fn: function(){ choisir(pi); peindre(); ONGLET = 'prop'; peindrePanneau(true); } },
        { lib: '${T("Dupliquer la pièce")}', fn: function(){ dupliquerPiece(pi); } },
        { trait: true }, { lib: '${T("Supprimer la pièce")}', dgr: true, fn: function(){ supprimerPiece(pi); } }];
    }
    var out = [{ lib: '${T("Ouvrir le modèle")}', fn: function(){ ouvrirModele(id); } },
      { lib: '${T("Éditer le patron")}', fn: function(){ ouvrirEditeur(id); } },
      { lib: '${T("Imprimer / exporter")}', fn: function(){ ouvrirImpression(id, 'biblio'); } },
      { lib: '${T("Aperçu 3D")}', fn: function(){ ouvrir3d(id, 'biblio'); } },
      { lib: '${T("Motif et impression textile")}', fn: function(){ ouvrirMotif(id, 'biblio'); } }];
    if (D.peutAjouter) out.push({ lib: '${T("Dupliquer")}', fn: function(){ dupliquer(id); } });
    if (D.peutSupprimer) { out.push({ trait: true }); out.push({ lib: '${T("Supprimer")}', dgr: true, fn: function(){ supprimer(id); } }); }
    return out;
  };

  function dessiner(){
    if (!D) return;
    if (VUE === 'motif' && MO) dessinerMo(); else if (VUE === '3d' && V3) dessiner3d(); else if (VUE === 'impression' && IMP) dessinerImpression(); else if (VUE === 'editeur' && E) dessinerEditeur(); else if (VUE === 'modele' && M) dessinerModele(); else dessinerBiblio();
  }
  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('a-q');
    var d0 = q ? q.selectionStart : null, f0 = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('a-q');
    if (q2) { q2.focus({ preventScroll: true }); try { if (d0 != null) q2.setSelectionRange(d0, f0); } catch (e) {} }
  }
  function charger(apres){
    appeler('atelier:donnees', []).then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="vide"><strong>${T("Atelier indisponible")}</strong><div style="margin-top:.4rem">' + esc(expliquer(r)) + '</div></div>';
        dire(expliquer(r), 'err'); return;
      }
      D = r;
      if (SEL && !(D.modeles || []).some(function(m){ return m.id === SEL; })) SEL = '';
      if (DEPART === 'nouveau' && D.peutAjouter) { DEPART = ''; ouvrirNeuf(); }
      else if (DEPART.indexOf('editeur:') === 0) { var de = DEPART.slice(8); DEPART = ''; ouvrirEditeur(de); }
      else if (DEPART.indexOf('impression:') === 0) { var di = DEPART.slice(11); DEPART = ''; ouvrirImpression(di, 'biblio'); }
      else if (DEPART.indexOf('3d:') === 0) { var d3 = DEPART.slice(3); DEPART = ''; ouvrir3d(d3, 'biblio'); }
      else if (DEPART.indexOf('motif:') === 0) { var dm = DEPART.slice(6); DEPART = ''; ouvrirMotif(dm, 'biblio'); }
      else dessiner();
      if (apres) apres(); else dire('');
    });
  }

  window.addEventListener('resize', function(){
    clearTimeout(window._atR);
    window._atR = setTimeout(function(){ if (VUE === 'modele' && AP) peindreApercu(AP); if (VUE === 'editeur' && E) peindre(); }, 160);
  });
  /* ⚠ JAMAIS PENDANT UNE SAISIE : recharger remettrait le formulaire à zéro. */
  window.szActualiser = function(){ if (VUE === 'biblio' && !OCCUPE) charger(); };
  window.szRevenir = window.szActualiser;
  document.addEventListener('keydown', function(ev){
    if (VUE === 'editeur' && E && ev.key !== 'Escape' && toucheEditeur(ev)) return;
    if (VUE === 'motif' && MO && ev.key !== 'Escape' && toucheMo(ev)) return;
    if (VUE === 'motif' && MO && ev.key === 'Escape' && (MO.sel || MO.zoneSel)) { ev.preventDefault(); MO.sel = ''; MO.zoneSel = false; dessinerMo(); return; }
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    if (VUE === 'impression') { quitterImpression(); return; }
    if (VUE === '3d') { quitter3d(); return; }
    if (VUE === 'motif') { quitterMo(); return; }
    if (VUE === 'editeur' && E) {
      if (GLISSE) return;
      if (MES) { MES = null; peindre(); peindrePanneau(true); return; }
      if (E.noeud >= 0 || E.bord >= 0 || E.cran >= 0 || E.pince >= 0) { deselectionner(true); peindre(); peindrePanneau(true); return; }
      if (E.sel >= 0) { E.sel = -1; peindre(); peindrePanneau(true); return; }
      quitterEditeur(); return;
    }
    if (VUE === 'modele') { revenir(); return; }
    if (P && P.fermer) P.fermer();
  });

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
</script>
</body></html>`;
}

module.exports = { pageAtelier };
