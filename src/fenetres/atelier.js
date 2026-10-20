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
.at-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(12.5rem,1fr));grid-auto-rows:16.5rem;gap:.9rem;align-content:start}
/* ⚠ la HAUTEUR est celle de la carte, pas de la rangée : le socle impose grid-auto-rows:max-content à tout conteneur paginé */
.at-carte{position:relative;display:flex;flex-direction:column;height:16.5rem;border:1px solid var(--sz-bord);border-radius:16px;background:var(--f-carte2);overflow:hidden;
  cursor:pointer;text-align:left;padding:0;min-width:0;transition:transform .14s ease,box-shadow .14s ease,border-color .14s ease}
.at-carte:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.28);border-color:rgba(var(--or-rgb),.55)}
.at-carte.on{border:2px solid var(--or);box-shadow:0 0 0 3px rgba(var(--or-rgb),.18)}
.at-carte .vig{position:relative;flex:1 1 0;min-height:0;width:100%;background:linear-gradient(180deg,#F6F1E8,#ECE4D6);color:#1C1B18;display:block}
/* ⚠ le croquis en POSITION ABSOLUE : à 100 % d une hauteur « auto », un SVG prend la sienne (celle de ses
   proportions) et étirait la carte au-delà de sa rangée — le texte passait sous le bord (fenêtre détachée) */
.at-carte .vig svg{position:absolute;left:.9rem;right:.9rem;top:.9rem;bottom:.6rem;width:calc(100% - 1.8rem);height:calc(100% - 1.5rem);display:block}
.at-carte .tx{display:block;padding:.65rem .85rem .75rem;border-top:1px solid var(--sz-bord)}
.at-carte .tx .l1{display:flex;align-items:center;gap:.45rem;min-width:0}
.at-carte .tx .l1 b{flex:1 1 auto;min-width:0;font-size:.9rem;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.at-carte .tx .l2,.at-carte .tx .l3{display:block;font-size:.74rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:.2rem}
.at-carte .tx .l3{font-size:.7rem}
.at-carte.nouveau{border-style:dashed;background:transparent;align-items:center;justify-content:center;gap:.4rem;padding:1rem;text-align:center;color:var(--tx2)}
.at-carte.nouveau b{color:var(--tx);font-size:.9rem}
.at-puce{display:inline-flex;align-items:center;font-size:.72rem;padding:.1rem .6rem;border-radius:999px;border:1px solid var(--v16);white-space:nowrap}
.at-puce.pret{border-color:color-mix(in srgb,var(--tx-ok) 40%,transparent);color:color-mix(in srgb,var(--tx-ok) 80%,var(--tx))}
.at-puce.brouillon{border-color:color-mix(in srgb,var(--tx-att) 40%,transparent);color:color-mix(in srgb,var(--tx-att) 80%,var(--tx))}
.at-puce.base{border-color:var(--or);color:var(--tx)}
.at-tailles{display:flex;flex-wrap:wrap;gap:.35rem}
.at-gestes{margin-top:auto;display:flex;gap:.5rem;flex-wrap:wrap}
.at-gestes.at-tete{margin-top:.65rem;gap:.35rem}
.at-gestes.at-tete button{padding:.3rem .65rem;font-size:.8rem}
.at-gestes button{flex:1 1 auto}
/* ── La fiche du modèle choisi (2026-10-18, sa demande : « trop condensé ; des onglets à droite pour l historique ;
   des boutons plus professionnels ; un petit aperçu 3D qui tourne ») ── */
.cx-carte.at-fiche{display:flex;flex-direction:column;gap:.75rem;padding:0;overflow:hidden}
.at-fiche-tete{padding:1rem 1.1rem 0}
.at-fiche-titre{display:flex;align-items:center;gap:.55rem;min-width:0}
.at-fiche-titre h2{margin:0;font-size:1.12rem;font-weight:650;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.at-fiche-tete .cx-sub{margin-top:.2rem}
.at-scene{position:relative;margin:0 1.1rem;height:13.5rem;flex:0 0 auto;border-radius:14px;overflow:hidden;
  background:radial-gradient(ellipse at 50% 38%,#FBF8F2 0%,#EFE7DA 70%,#E6DCCB 100%);color:#1C1B18;cursor:grab;user-select:none}
.at-scene:active{cursor:grabbing}
.at-scene .at-scene-vig{position:absolute;inset:0;display:block;transition:opacity .35s ease}
.at-scene .at-scene-vig img.vigp{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:50% 50%}
.at-scene .at-scene-vig svg{position:absolute;inset:.8rem;width:calc(100% - 1.6rem);height:calc(100% - 1.6rem)}
.at-scene canvas.at-mini-cv{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .35s ease}
.at-scene.pret canvas.at-mini-cv{opacity:1}
.at-scene.pret .at-scene-vig{opacity:0}
.at-scene .at-scene-aide{position:absolute;left:.6rem;bottom:.5rem;font-size:.68rem;padding:.15rem .5rem;border-radius:999px;background:rgba(28,27,24,.86);color:#F6F1E8;opacity:0;transition:opacity .2s ease;pointer-events:none}
.at-scene.pret:hover .at-scene-aide{opacity:1}
.at-scene .at-scene-3d{position:absolute;right:.5rem;top:.5rem;font-size:.64rem;font-weight:700;letter-spacing:.08em;padding:.12rem .45rem;border-radius:6px;background:rgba(28,27,24,.86);color:#F6F1E8;opacity:0;transition:opacity .35s ease}
.at-scene.pret .at-scene-3d{opacity:1}
.at-actions{display:flex;gap:.45rem;padding:0 1.1rem}
.at-actions button{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;padding:.5rem .8rem;font-size:.84rem;border-radius:10px;white-space:nowrap}
.at-actions button{min-width:0;flex:1 1 0}
.at-actions button.prim{font-weight:600}
.at-actions button svg,.at-outil svg{width:1.05rem;height:1.05rem;flex:0 0 auto}
.at-actions .at-plus{flex:0 0 auto;padding:.5rem .55rem}
.at-outils{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.35rem;padding:0 1.1rem}
.at-outil{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3rem;padding:.55rem .2rem .5rem;border-radius:10px;
  background:var(--f-carte2);border:1px solid var(--sz-bord);color:var(--tx2);font-size:.7rem;line-height:1.1;text-align:center;min-width:0;cursor:pointer;
  transition:background .14s ease,color .14s ease,border-color .14s ease}
.at-outil svg{width:1.25rem;height:1.25rem}
.at-outil span{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.at-outil:hover{color:var(--tx);border-color:rgba(var(--or-rgb),.55);background:color-mix(in srgb,var(--f-carte2) 86%,var(--or) 10%)}
.at-outil:disabled{opacity:.5;cursor:default}
.at-fiche>.ed-note{margin:0 1.1rem}
.at-onglets{display:flex;gap:.2rem;padding:0 1.1rem;border-bottom:1px solid var(--sz-bord);margin-top:.15rem}
.at-onglets button{background:none;border:0;border-radius:0;padding:.55rem .65rem .6rem;font-size:.82rem;color:var(--tx2);cursor:pointer;
  border-bottom:2px solid transparent;margin-bottom:-1px;display:inline-flex;align-items:center;gap:.35rem}
.at-onglets button:hover{color:var(--tx)}
.at-onglets button.on{color:var(--tx);border-bottom-color:var(--or);font-weight:600}
.at-onglets .n{font-size:.66rem;padding:0 .4rem;border-radius:999px;background:var(--v08);color:var(--tx);font-weight:600}
.at-onglet-corps{flex:1 1 0;min-height:0;overflow:auto;padding:.3rem 1.1rem 1.1rem;display:flex;flex-direction:column;gap:.55rem}
.at-onglet-corps h3{margin:.55rem 0 .1rem;font-size:.72rem;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2)}
.at-fiche-dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:.35rem 1rem;margin:0;font-size:.82rem}
.at-fiche-dl dt{color:var(--tx2)}
.at-fiche-dl dd{margin:0;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.at-pieces{display:flex;flex-direction:column;border:1px solid var(--sz-bord);border-radius:10px;overflow:hidden}
.at-pieces>div{display:flex;justify-content:space-between;gap:.6rem;padding:.42rem .7rem;font-size:.82rem}
.at-pieces>div+div{border-top:1px solid var(--sz-bord)}
.at-hist{list-style:none;margin:.3rem 0 0;padding:0 0 0 .2rem;position:relative}
.at-hist li{position:relative;padding:0 0 .9rem 1.3rem}
.at-hist li::before{content:"";position:absolute;left:.25rem;top:.35rem;width:.55rem;height:.55rem;border-radius:50%;background:var(--f-carte2);border:2px solid var(--v16)}
.at-hist li::after{content:"";position:absolute;left:.5rem;top:1.05rem;bottom:0;width:1px;background:var(--sz-bord)}
.at-hist li:last-child::after{display:none}
.at-hist li.actuelle::before{border-color:var(--or);background:var(--or)}
.at-hist .h1{display:flex;align-items:baseline;gap:.5rem;font-size:.84rem}
.at-hist .h1 b{font-weight:650}
.at-hist .h2{font-size:.74rem;color:var(--tx2);margin-top:.12rem}
.at-hist .moi{font-size:.66rem;padding:.02rem .45rem;border-radius:999px;border:1px solid var(--or);color:var(--tx)}
.at-prot{display:flex;align-items:center;gap:.6rem;padding:.65rem .75rem;border-radius:10px;border:1px solid var(--sz-bord);font-size:.84rem}
.at-prot .ic{font-size:1rem}
@media (max-height:760px){.at-scene{height:10rem}}
@media (max-height:620px){.at-scene{height:7.5rem}}

/* ── Le modèle (moteur) ── */
.at-trois{display:grid;grid-template-columns:19rem minmax(0,1fr) 23rem;gap:.9rem}
.cx>.at-trois{flex:1 1 0;min-height:0}
.at-bases{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem}
.at-base{display:flex;align-items:center;gap:.55rem;padding:.45rem .55rem;border-radius:10px;text-align:left;background:var(--f-carte2);min-width:0}
.at-base.on{border:2px solid var(--or)}
.at-base svg{width:1.6rem;height:2rem;flex:0 0 auto}
.at-base b{display:block;font-size:.82rem}
.at-liste{width:100%;border-collapse:separate;border-spacing:0 .35rem;font-size:.84rem}
.at-liste th{text-align:left;font-weight:600;color:var(--tx2);font-size:.72rem;letter-spacing:.03em;padding:.2rem .7rem;white-space:nowrap}
.at-liste td{padding:.45rem .7rem;background:var(--f-carte2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:16rem;vertical-align:middle}
.at-liste td:first-child{border-radius:12px 0 0 12px}
.at-liste td:last-child{border-radius:0 12px 12px 0}
.at-liste .nomv{display:flex;align-items:center;gap:.8rem;min-width:0}
.at-liste .vigm{flex:0 0 auto;display:block;position:relative;width:2.8rem;height:3.4rem;border-radius:9px;overflow:hidden;background:linear-gradient(180deg,#F6F1E8,#ECE4D6);color:#1C1B18}
.at-liste .vigm svg{position:absolute;left:.2rem;top:.2rem;width:calc(100% - .4rem);height:calc(100% - .4rem);display:block}
.at-liste .vigm img.vigp,.at-carte .vig img.vigp{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%;display:block}
.at-liste .nomt{display:block;min-width:0}
.at-liste td.nom b{display:block;font-weight:650;overflow:hidden;text-overflow:ellipsis}
.at-liste .nomt>span{display:block;font-size:.72rem;margin-top:.1rem}
.at-liste tbody tr{cursor:pointer}
.at-liste tbody tr:hover td{background:color-mix(in srgb,var(--f-carte2) 80%,var(--or) 8%)}
.at-liste tbody tr.on td{background:color-mix(in srgb,var(--f-carte2) 82%,var(--or) 14%)}
.at-liste tbody tr.on td:first-child{box-shadow:inset 3px 0 0 var(--or)}
.at-tri{background:none;border:none;padding:0;color:inherit;font:inherit;cursor:pointer}
.at-tri.on{color:var(--tx)}
.nip-champ{display:flex;flex-direction:column;gap:.25rem;margin:.5rem 0;font-size:.8rem}
.nip-champ input{font-size:1.1rem;letter-spacing:.3em;padding:.35rem .5rem}
.nip-err{min-height:1.1rem;font-size:.8rem;color:var(--rouge,#DC2626)}
.at-fam{grid-column:1/-1;font-size:.72rem;font-weight:600;color:var(--tx2);text-transform:uppercase;letter-spacing:.06em;margin-top:.35rem}
.pl-deux{display:grid;grid-template-columns:18rem minmax(0,1fr);gap:.9rem;min-height:0}
.cx>.pl-deux{flex:1 1 0}
.pl-deux>.cx-carte{min-height:0;overflow:auto;scrollbar-gutter:stable}
.pl-toile{cursor:crosshair}
.pl-toile svg{display:block;width:100%;height:100%}
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

/* ── LE STUDIO DU MODÈLE (2026-10-18, sa demande : « tout est à refaire, pas assez professionnel, les options trop
   tassées — un studio avec menus et options au même principe que Photoshop ») ──
   menus · barre d options · palette des types | plan de travail | panneaux à onglets, repliables · barre d état */
.cx>.st{flex:1 1 0;min-height:0}
.st{position:relative;display:flex;flex-direction:column;min-height:0;border:1px solid var(--sz-bord);border-radius:12px;overflow:hidden;background:var(--f-carte)}
.st-menus{display:flex;align-items:center;gap:.1rem;padding:.2rem .4rem;border-bottom:1px solid var(--sz-bord);background:var(--f-entete,var(--f-carte2))}
.st-menus>button{background:none;border:0;color:var(--tx);font-size:.82rem;padding:.32rem .65rem;border-radius:6px;cursor:pointer}
.st-menus>button:hover,.st-menus>button[aria-expanded="true"]{background:var(--v08)}
.st-menus>button:focus-visible{outline:2px solid var(--or);outline-offset:-2px}
.st-menu-liste{position:absolute;z-index:40;min-width:16rem;max-width:22rem;max-height:calc(100% - 3rem);overflow-y:auto;padding:.3rem;border-radius:10px;
  background:var(--sz-surface,var(--f-carte));border:1px solid var(--sz-bord-fort,var(--v16));box-shadow:0 14px 34px rgba(0,0,0,.42)}
.st-menu-liste button{display:grid;grid-template-columns:1.1rem minmax(0,1fr) auto;align-items:center;gap:.35rem;width:100%;text-align:left;background:none;border:0;
  color:var(--tx);font-size:.82rem;padding:.4rem .55rem;border-radius:6px;cursor:pointer}
.st-menu-liste button:hover:not(:disabled),.st-menu-liste button:focus-visible{background:var(--sz-survol,var(--v10));outline:none}
.st-menu-liste button:disabled{opacity:.45;cursor:default}
.st-menu-liste .ck{color:var(--tx-or);font-weight:700;text-align:center}
.st-menu-liste .rac{color:var(--tx2);font-size:.74rem;font-variant-numeric:tabular-nums;padding-left:1.2rem}
.st-menu-liste .sec{font-size:.68rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);padding:.45rem .55rem .2rem 2rem}
.st-menu-liste .trait{height:1px;background:var(--v08);margin:.3rem .4rem}
.st-options{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;padding:.45rem .75rem;border-bottom:1px solid var(--sz-bord);background:var(--f-carte2)}
.st-options .grp{display:flex;align-items:center;gap:.4rem;padding-right:.7rem;border-right:1px solid var(--v08)}
.st-options .grp:last-of-type{border-right:0}
.st-options .lib{font-size:.72rem;color:var(--tx2);white-space:nowrap}
.st-options .ed-seg button{padding:.24rem .55rem;font-size:.78rem}
.st-options .ecart{flex:1 1 auto}
.st-type{display:inline-flex;align-items:center;gap:.45rem;padding:.25rem .6rem .25rem .4rem;font-size:.82rem;font-weight:600;border-radius:8px}
.st-type svg{width:1.15rem;height:1.4rem;flex:0 0 auto}
.st-type .fl{color:var(--tx2);font-weight:400;font-size:.7rem}
.st-zoom{display:inline-flex;align-items:center;gap:.2rem}
.st-zoom button{min-width:1.9rem;padding:.2rem .4rem;font-size:.85rem;line-height:1}
.st-zoom .val{min-width:3.2rem;text-align:center;font-size:.78rem;font-variant-numeric:tabular-nums;color:var(--tx)}
.st-options button.prim{font-weight:600}
.st-corps{position:relative;flex:1 1 0;min-height:0;display:grid;grid-template-columns:4.6rem minmax(0,1fr) 27rem}
.st-palette{display:flex;flex-direction:column;gap:.3rem;padding:.5rem .35rem;border-right:1px solid var(--sz-bord);background:var(--f-carte2);overflow-y:auto}
.st-outil{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.45rem .2rem;border-radius:9px;background:none;border:1px solid transparent;color:var(--tx2);font-size:.62rem;line-height:1.15;text-align:center;cursor:pointer}
.st-outil svg{width:1.45rem;height:1.6rem}
.st-outil:hover{background:var(--v06);color:var(--tx)}
.st-outil.on{background:var(--v08);border-color:var(--or);color:var(--tx)}
.st-outil[aria-expanded="true"]{background:var(--v10);color:var(--tx)}
.st-fly{position:absolute;z-index:30;left:4.8rem;top:.5rem;max-height:calc(100% - 1rem);width:min(34rem,calc(100% - 6rem));display:flex;flex-direction:column;border-radius:12px;
  background:var(--sz-surface,var(--f-carte));border:1px solid var(--sz-bord-fort,var(--v16));box-shadow:0 18px 44px rgba(0,0,0,.45)}
.st-fly-tete{display:flex;align-items:center;justify-content:space-between;gap:.6rem;padding:.65rem .9rem;border-bottom:1px solid var(--v08)}
.st-fly-tete b{font-size:.9rem}
.st-fly-tete button{background:none;border:0;color:var(--tx2);font-size:1.2rem;line-height:1;padding:.15rem .4rem;border-radius:6px;cursor:pointer}
.st-fly-tete button:hover{background:var(--v08);color:var(--tx)}
.st-fly-corps{flex:1 1 auto;min-height:0;overflow-y:auto;padding:.4rem .9rem .9rem}
.st-fly-corps .at-bases{grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr));gap:.5rem}
.st-fly-corps .at-base{padding:.55rem .6rem;border:1px solid var(--v08)}
.st-fly-corps .at-base:hover{border-color:rgba(var(--or-rgb),.55)}
.st-fly-corps .at-base.on{border:2px solid var(--or)}
.st-plan{position:relative;min-width:0;min-height:0;overflow:auto;background:var(--f-page);display:flex}
.st-plan.grille{background-image:linear-gradient(var(--v04) 1px,transparent 1px),linear-gradient(90deg,var(--v04) 1px,transparent 1px);background-size:24px 24px}
.st-feuille{margin:auto;padding:1.4rem}
.st-feuille>.at-apercu{border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.12)}
.st-panneaux{display:flex;flex-direction:column;gap:0;min-height:0;min-width:0;overflow-y:auto;overflow-x:hidden;border-left:1px solid var(--sz-bord);background:var(--f-carte2)}
/* ⚠ flex:0 0 auto — un panneau ne RÉTRÉCIT pas : c est la colonne qui défile (sinon ils se chevauchent) */
.st-pan{flex:0 0 auto;border-bottom:1px solid var(--sz-bord);display:flex;flex-direction:column}
.st-pan-tete{display:flex;align-items:center;gap:.2rem;padding:0 .3rem 0 .5rem;background:var(--f-entete,var(--f-carte));border-bottom:1px solid var(--v08)}
.st-pan.replie .st-pan-tete{border-bottom:0}
.st-onglets{display:flex;gap:.1rem;flex:1 1 auto;min-width:0}
.st-onglets button{background:none;border:0;border-bottom:2px solid transparent;color:var(--tx2);font-size:.76rem;font-weight:600;letter-spacing:.02em;padding:.55rem .6rem .45rem;cursor:pointer;white-space:nowrap}
.st-onglets button.on{color:var(--tx);border-bottom-color:var(--or)}
.st-onglets button:hover{color:var(--tx)}
.st-repli{background:none;border:0;color:var(--tx2);padding:.3rem .4rem;border-radius:6px;cursor:pointer;line-height:0}
.st-repli:hover{background:var(--v08);color:var(--tx)}
.st-repli svg{width:14px;height:14px;transition:transform .15s ease}
.st-pan.replie .st-repli svg{transform:rotate(-90deg)}
.st-pan-corps{padding:.8rem .9rem .9rem;display:flex;flex-direction:column;gap:.55rem}
.st-form{display:flex;flex-direction:column;gap:.55rem}
.st-form>label{display:grid;grid-template-columns:8.6rem minmax(0,1fr);align-items:center;gap:.6rem;font-size:.78rem;color:var(--tx2)}
.st-form>label.haut{align-items:start}
.st-form>label.haut>textarea{min-height:4.4em;resize:vertical}
.st-form input,.st-form select,.st-form textarea{font-size:.82rem;width:100%;min-width:0}
.st-type-ligne{display:grid;grid-template-columns:8.6rem minmax(0,1fr);align-items:center;gap:.6rem;font-size:.78rem;color:var(--tx2)}
.st-type-ligne button{justify-self:start}
/* ⚠ un champ de mesure fait au moins 48 px (banc-champs) : quand la colonne est étroite, le TABLEAU défile de côté,
   la colonne des noms reste en place */
.st-mes-zone{overflow-x:auto;margin:0 -.2rem;padding:0 .2rem}
.st-mes{width:100%;border-collapse:separate;border-spacing:0;font-size:.78rem}
.st-mes th{font-weight:600;color:var(--tx2);text-align:center;padding:.25rem .15rem .4rem;white-space:nowrap}
.st-mes th:first-child,.st-mes td:first-child{text-align:left;padding-left:0;position:sticky;left:0;background:var(--f-carte2);z-index:1}
.st-mes th.base{color:var(--tx-or)}
.st-mes th label{display:inline-flex;align-items:center;gap:.2rem;cursor:pointer}
.st-mes td{padding:.14rem .12rem;border-top:1px solid var(--v055)}
.st-mes td:first-child{color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:8rem;min-width:6.5rem;padding-right:.4rem}
.st-mes input[type=text]{width:3.1rem;min-width:3rem;text-align:right;padding:.16rem .3rem;font-size:.78rem;font-variant-numeric:tabular-nums}
.st-pied-pan{display:flex;align-items:center;justify-content:space-between;gap:.6rem;padding-top:.3rem;border-top:1px solid var(--v08)}
.st-pied-pan label{display:flex;align-items:center;gap:.45rem;font-size:.76rem;color:var(--tx2)}
.st-pied-pan select{width:auto}
.st-note{font-size:.72rem;color:var(--tx2);margin:0}
.st-etat{display:flex;align-items:center;gap:1.1rem;padding:.3rem .8rem;border-top:1px solid var(--sz-bord);background:var(--f-pied);font-size:.72rem;color:var(--tx2);white-space:nowrap;overflow:hidden}
.st-etat b{color:var(--tx);font-weight:600;font-variant-numeric:tabular-nums}
.st-etat .ecart{flex:1 1 auto}
.st-etat .att{color:var(--tx-att)}
.st-etat .ok{color:var(--tx-ok)}
/* mode jour : le socle habille TOUT bouton en blanc encadré — les commandes « à plat » du studio (menus, onglets,
   palette, repli, croix, entrées de menu) restent à plat */
html.jour .st-menus>button,html.jour .st-onglets button,html.jour .st-outil,html.jour .st-repli,html.jour .st-fly-tete button,html.jour .st-menu-liste button{background:none;border-color:transparent;box-shadow:none}
html.jour .st-menus>button:hover:not(:disabled),html.jour .st-menus>button[aria-expanded="true"],html.jour .st-outil:hover:not(:disabled),html.jour .st-repli:hover:not(:disabled),html.jour .st-menu-liste button:hover:not(:disabled){background:var(--v08)}
html.jour .st-outil.on{background:var(--v08);border-color:var(--or)}
html.jour .st-onglets button.on{border-bottom-color:var(--or)}
@media (max-width:1180px){.st-corps{grid-template-columns:4.2rem minmax(0,1fr) 22rem}.st-form>label,.st-type-ligne{grid-template-columns:7rem minmax(0,1fr)}
  .st-mes th{font-size:.7rem;padding-left:0;padding-right:0}.st-mes th label{gap:.1rem}}
@media (max-width:960px){.st-corps{grid-template-columns:4rem minmax(0,1fr) 19rem}.st-options .lib{display:none}}
@media (max-height:760px){.st-pan-corps{padding:.6rem .75rem .7rem;gap:.45rem}.st-form{gap:.42rem}.st-feuille{padding:.8rem}.st-options{padding:.32rem .6rem}}
@media (max-height:620px){.st-etat{display:none}.st-outil span{display:none}}

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

/* ── Aperçu 3D (lot 4) ── LE MÊME LANGAGE QUE LE STUDIO (2026-10-18, sa demande : « les options disparaissent ou
   ne sont pas visibles ») : menus, barre d options, palette d outils, la scène au centre, des panneaux à onglets qui
   DÉFILENT chacun dans la colonne, la barre d état. Rien n est conditionné à un état passager (le mannequin chargé). */
.v3 .st-corps{grid-template-columns:4.2rem minmax(0,1fr) 21rem}
.v3-plan{position:relative;min-width:0;min-height:0;padding:.7rem;background:var(--f-page);display:flex}
.v3-plan>.v3-scene{flex:1 1 auto;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.12)}
.v3 .st-panneaux{scrollbar-gutter:stable}
.v3 .ed-seg{display:flex;flex-wrap:wrap}
.v3 .st-outil:disabled{opacity:.4;cursor:default;background:none;border-color:transparent}
.v3 .st-options .ecart{min-width:.5rem}
.v3-gestes{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap}
.v3-gestes button{padding:.28rem .7rem;font-size:.8rem}
.v3-sec{font-size:.68rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);margin:.25rem 0 -.15rem}
.v3-sec:first-child{margin-top:0}
.v3-cam{position:absolute;right:.6rem;top:.6rem;z-index:2;display:flex;align-items:center;gap:.15rem;padding:.2rem;border-radius:9px;background:rgba(243,238,229,.92);box-shadow:0 2px 8px rgba(0,0,0,.18)}
.v3-cam button{background:none;border:0;color:#3F3A32;min-width:1.85rem;height:1.85rem;padding:0 .45rem;border-radius:6px;font-size:.8rem;line-height:1;cursor:pointer}
.v3-cam button:hover{background:rgba(63,58,50,.12)}
.v3-cam button[aria-pressed="true"]{background:#DDD5C8;color:#3F3A32;font-weight:700}
.v3-cam .val{min-width:3rem;text-align:center;font-size:.76rem;color:#3F3A32;font-variant-numeric:tabular-nums}
html.jour .v3-cam button{background:none;border-color:transparent;box-shadow:none}
html.jour .v3-cam button[aria-pressed="true"]{background:#DDD5C8}
.v3-mes{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.15rem .8rem;font-size:.78rem}
.v3-mes span{color:var(--tx2)}
.v3-mes b{font-weight:600;font-variant-numeric:tabular-nums;text-align:right}
.v3-apropos{font-size:.74rem;color:var(--tx2);border-top:1px solid var(--v08);padding-top:.45rem}
.v3-apropos summary{cursor:pointer;color:var(--tx);font-weight:600}
.v3-apropos p{margin:.4rem 0 0}
@media (max-width:1180px){.v3 .st-corps{grid-template-columns:3.8rem minmax(0,1fr) 18.5rem}}
@media (max-width:960px){.v3 .st-corps{grid-template-columns:3.4rem minmax(0,1fr) 16.5rem}.v3 .st-outil span{display:none}}
@media (max-width:760px){.v3 .st-corps{grid-template-columns:3.2rem minmax(0,1fr);grid-template-rows:minmax(13rem,1fr) minmax(0,42%)}
  .v3 .st-palette{grid-row:1}.v3 .st-panneaux{grid-column:1 / span 2;border-left:0;border-top:1px solid var(--sz-bord)}.v3-aide{display:none}}
@media (max-height:760px){.v3-plan{padding:.45rem}.v3-aide{font-size:.7rem}}
@media (max-height:560px){.v3-aide{display:none}.v3-cam{top:.35rem;right:.35rem}}
.v3-scene{position:relative;border-radius:12px;overflow:hidden;min-height:0;cursor:grab;user-select:none}
.v3-scene.glisse{cursor:grabbing}
.v3-scene.vise{cursor:crosshair}
.szc-boite.v3-fiche{max-width:46rem;width:calc(100vw - 4rem)}
.v3r-duo{display:flex;gap:.8rem;justify-content:center}
.v3r-duo figure{margin:0;flex:1 1 0;max-width:20rem;text-align:center}
.v3f-vign.v3r-duo img{width:100%;height:auto;max-width:none;max-height:22rem;object-fit:contain;border-radius:10px;background:#FFFFFF;display:block}
.v3r-duo figcaption{font-size:.74rem;color:var(--tx2);margin-top:.3rem}
.v3f-vign{display:flex;gap:.6rem;margin:.7rem 0;min-height:9rem;align-items:center}
.v3f-vign img{width:6.75rem;height:9rem;object-fit:contain;border-radius:8px;border:1px solid var(--sz-bord);background:#FFFFFF}
.ph-trois .ed-seg{display:flex;flex-wrap:wrap}
.ph-vign{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.35rem;margin-bottom:.5rem}
.ph-vign button{position:relative;aspect-ratio:3/4;padding:0;border-radius:8px;overflow:hidden;border:2px solid var(--v16);background:var(--f-carte);color:var(--tx)}
.ph-vign button img{width:100%;height:100%;object-fit:cover;display:block}
.ph-vign button.face{border-color:var(--or)}.ph-vign button.dos{border-color:var(--tx2)}
.ph-vign button b{position:absolute;left:0;right:0;bottom:0;font-size:.68rem;font-weight:600;background:var(--f-carte);color:var(--tx);padding:.05rem 0}
.v3-scene canvas{display:block;position:absolute;left:0;top:0;width:100%;height:100%}
/* LE RENDU PHOTO DE THE NEW BLACK (2026-10-19) : la VUE PRINCIPALE, sur la scène ; la vue 3D du poste devient la « Vue technique 3D » */
.v3-tnb{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7rem;
  background:inherit;cursor:default;text-align:center;padding:1.2rem;color-scheme:light}
.v3-tnb .rp-grand{position:absolute;inset:0 0 5.2rem;width:100%;height:calc(100% - 5.2rem);object-fit:contain}
.v3-tnb .rp-vign{position:absolute;left:0;right:0;bottom:.5rem;display:flex;justify-content:center;gap:.5rem}
.v3-tnb .rp-vign button{display:flex;flex-direction:column;align-items:center;gap:.15rem;padding:.2rem;border-radius:9px;cursor:pointer;
  border:2px solid transparent;background:#F7F4EF;color:#2b2621;font:inherit;font-size:.7rem}
.v3-tnb .rp-vign button.on{border-color:var(--or-jour)}
.v3-tnb .rp-vign img{width:3rem;height:4rem;object-fit:cover;border-radius:6px}
.v3-tnb .rp-opts{display:flex;flex-wrap:wrap;gap:.35rem .8rem;align-items:center;justify-content:center;font-size:.8rem;color:#2b2621}
.v3-tnb .rp-opts .lib{font-weight:700;color:#4f463d}
.v3-tnb .rp-opts label{display:inline-flex;align-items:center;gap:.3rem;cursor:pointer}
.v3-rp-retour{position:absolute;right:.7rem;top:.7rem;z-index:4;font:inherit;font-size:.75rem;padding:.25rem .6rem;border-radius:8px;cursor:pointer;
  border:1px solid rgba(0,0,0,.25);background:#FBF9F6;color:#2b2621}
.v3-tnb .t1{font:700 1.02rem/1.3 system-ui;color:#2b2621}
.v3-tnb .t2{font-size:.84rem;color:#4f463d;max-width:30rem;line-height:1.5}
.v3-tnb .gen{font:inherit;font-size:.9rem;font-weight:600;padding:.55rem 1.1rem;border-radius:9px;cursor:pointer;border:1px solid var(--or-jour);
  background:var(--or-jour);color:var(--tx-sur-accent)}
.v3-tnb .gen:hover{filter:brightness(1.08)}
.v3-tnb .barre{width:min(22rem,80%);height:.5rem;border-radius:99px;background:rgba(0,0,0,.12);overflow:hidden}
.v3-tnb .barre i{display:block;height:100%;background:var(--or)}
.v3-tnb .coin{position:absolute;right:.7rem;top:.7rem;z-index:4;display:flex;gap:.4rem;align-items:center}
.v3-tnb .coin span{font-size:.72rem;color:#3d362f;background:#F7F4EF;border-radius:99px;padding:.15rem .55rem}
.v3-tnb .coin button,.v3-tnb .perime button{font:inherit;font-size:.75rem;padding:.25rem .6rem;border-radius:8px;cursor:pointer;
  border:1px solid rgba(0,0,0,.25);background:#FBF9F6;color:#2b2621}
/* L aperçu 3D construit (2026-10-19) : l afficheur de la boutique, et « Prêt à construire ? » */
.v3-tnb .c3-mv{position:absolute;inset:0;width:100%;height:100%;--poster-color:transparent;background:transparent}
.v3-tnb .c3-pan{display:flex;flex-direction:column;align-items:center;gap:.6rem;max-width:44rem}
.v3-tnb .c3-grille{display:flex;gap:1rem;align-items:flex-start;text-align:left}
.v3-tnb .c3-ctl{display:flex;flex-direction:column;gap:.35rem;min-width:20rem}
.v3-tnb .c3-ctl .lib{font-weight:700;color:#4f463d;font-size:.82rem}
.v3-tnb .c3-l{display:flex;gap:.5rem;align-items:flex-start;font-size:.8rem;color:#2b2621;background:#F7F4EF;border-radius:8px;padding:.35rem .5rem}
.v3-tnb .c3-l .s{flex:0 0 1.1rem;font-weight:700}
.v3-tnb .c3-l.ok .s{color:#1f6b3a}.v3-tnb .c3-l.non .s{color:#9b2c2c}
.v3-tnb .c3-l small{display:block;color:#4f463d;font-size:.74rem}
.v3-tnb .c3-l button{margin-left:auto;flex:0 0 auto;font:inherit;font-size:.74rem;padding:.2rem .55rem;border-radius:7px;cursor:pointer;border:1px solid rgba(0,0,0,.25);background:#FBF9F6;color:#2b2621}
.v3-tnb .c3-src{margin:0;display:flex;flex-direction:column;align-items:center;gap:.2rem;font-size:.72rem;color:#4f463d}
.v3-tnb .c3-src img{width:7.5rem;height:10rem;object-fit:contain;background:#fff;border:1px solid rgba(0,0,0,.15);border-radius:6px}
.v3-tnb .c3-non{color:#9b2c2c;font-weight:600}
.v3-tnb .gen:disabled{opacity:.45;cursor:default;filter:none}
.v3-tnb .c3-info b{font-weight:600}
.v3-tnb .perime{position:absolute;left:50%;transform:translateX(-50%);bottom:.8rem;z-index:4;font-size:.78rem;color:#5c3d0e;
  background:rgba(255,236,200,.95);border:1px solid rgba(160,110,30,.45);border-radius:9px;padding:.35rem .6rem;display:flex;gap:.5rem;align-items:center}
/* le fond de studio : un léger dégradé, plus clair derrière le vêtement (le cyclo d un photographe) */
.v3-scene.beige{background:#EFE8DD;background:radial-gradient(ellipse 70% 60% at 50% 42%,#F7F3EC 0%,#EFE8DD 58%,#E3DACB 100%)}.v3-scene.blanc{background:#FFFFFF;background:radial-gradient(ellipse 70% 60% at 50% 42%,#FFFFFF 0%,#FAFAF8 60%,#EEEDEA 100%)}
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
.mo-trois>.cx-carte{min-height:0;overflow:auto;scrollbar-gutter:stable}
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
  /* (2026-10-19, audit — lot VOLUME 2) LA BIBLIOTHEQUE LEGERE ET PAR PAGES. atelier:donnees { leger: true,
     page, parPage, q, categorie, etat } rend 24 RESUMES (ni pieces, ni tableaux, ni historique) et le vrai
     total ; le modele ENTIER se lit quand on le touche (atelier:modele) et remplace son resume dans
     D.modeles ; les produits se CHERCHENT (atelier:produits). Un site plus ancien (sans « leger ») rend tout :
     la fenetre fait alors exactement comme avant. */
  var LEGER = false, PGA = null, PG_PAGE = 0, PRODS = null, MINU_PQ = null;
  var VUE = 'biblio';      // 'biblio' | 'modele'
  var CAT = '', ETAT = '', Q = '';
  var SEL = '';            // modèle choisi dans la bibliothèque
  // l onglet de la fiche (Détails, Historique, Protection) : gardé sur ce poste
  var ONGLETB = (function(){ try { var o = localStorage.getItem('sz-atelier-onglet'); return o === 'hist' || o === 'prot' ? o : 'details'; } catch (e) { return 'details'; } })();
  var M = null;            // le modèle en création ou en modification
  var TRACE = false;       // base, options, tableau ou aisances changés : retracer à l enregistrement
  var AP = null;           // dernier aperçu reçu
  var TAP = 'M';           // taille montrée dans l aperçu
  var TOUTES = false;      // toutes les tailles emboîtées
  var OCCUPE = false;

  /* Les mots de la fenêtre, par CLÉ (voir l en-tête). */
  var LBASE = { robe: '${T("Robe")}', chemisier: '${T("Chemisier")}', jupe: '${T("Jupe")}', pantalon: '${T("Pantalon")}',
    tshirt: '${T("T-shirt")}', chemise: '${T("Chemise")}', debardeur: '${T("Débardeur")}', sweat: '${T("Sweat")}', jean: '${T("Jean")}', short: '${T("Short")}',
    legging: '${T("Legging")}', culotte: '${T("Culotte")}', brassiere: '${T("Brassière")}', casquette: '${T("Casquette")}', bob: '${T("Bob")}', tuque: '${T("Tuque")}' };
  var LBASED = { robe: '${T("devant, dos, pinces de taille")}', chemisier: '${T("devant, dos, manche")}',
    jupe: '${T("devant, dos, pinces")}', pantalon: '${T("devant, dos")}',
    tshirt: '${T("devant, dos, manche, bande")}', chemise: '${T("patte, empiècement, col, poignets")}', debardeur: '${T("devant, dos, biais")}',
    sweat: '${T("bord-côte, poignets, capuche")}', jean: '${T("empiècement, poches, ceinture")}', short: '${T("devant, dos, ceinture")}',
    legging: '${T("jersey, ceinture élastique")}', culotte: '${T("devant, dos, fond")}', brassiere: '${T("bonnets, bande, bretelles")}',
    casquette: '${T("6 panneaux, visière")}', bob: '${T("calotte, côtés, bord")}', tuque: '${T("4 fuseaux, revers")}' };
  var LFAM = { haut: '${T("Hauts et robes")}', jupe: '${T("Jupes")}', bas: '${T("Pantalons")}', lingerie: '${T("Lingerie")}', tete: '${T("Chapeaux")}' };
  var LCH = { encolure: '${T("Encolure")}', manche: '${T("Manche")}', forme: '${T("Forme")}', col: '${T("Col")}', capuche: '${T("Capuche")}', revers: '${T("Revers")}' };
  var LLONG = { robe: '${T("Longueur sous la taille")}', chemisier: '${T("Longueur sous la taille")}', tshirt: '${T("Longueur sous la taille")}', chemise: '${T("Longueur sous la taille")}',
    debardeur: '${T("Longueur sous la taille")}', sweat: '${T("Longueur sous la taille")}', jupe: '${T("Longueur")}', pantalon: '${T("Longueur de jambe (0 = entrejambe)")}',
    jean: '${T("Longueur de jambe (0 = entrejambe)")}', legging: '${T("Longueur de jambe (0 = entrejambe)")}', short: '${T("Longueur de jambe")}', bob: '${T("Largeur du bord")}', tuque: '${T("Hauteur")}' };
  var LCAT = { robes: '${T("Robes")}', hauts: '${T("Hauts")}', pantalons: '${T("Pantalons")}', jupes: '${T("Jupes")}',
    manteaux: '${T("Manteaux")}', lingerie: '${T("Lingerie")}', accessoires: '${T("Accessoires")}', motifs: '${T("Motifs")}' };
  var LETAT = { brouillon: '${T("Brouillon")}', pret: '${T("Prêt à couper")}', archive: '${T("Archivé")}' };
  var LETATS = { brouillon: '${T("Brouillons")}', pret: '${T("Prêts à couper")}', archive: '${T("Archivés")}' };
  var LMES = { poitrine: '${T("Tour de poitrine")}', taille: '${T("Tour de taille")}', hanches: '${T("Tour de hanches")}',
    longDos: '${T("Longueur taille-dos")}', carrure: '${T("Carrure dos")}', hautPoitrine: '${T("Hauteur de poitrine")}',
    cou: '${T("Tour de cou")}', tourBras: '${T("Tour de bras")}', longBras: '${T("Longueur de bras")}',
    montant: '${T("Hauteur de montant")}', entrejambe: '${T("Longueur d’entrejambe")}',
    sousPoitrine: '${T("Tour de dessous de poitrine")}', tete: '${T("Tour de tête")}' };
  var LOPT = {
    encolure: { ronde: '${T("Ronde")}', v: '${T("En V")}', bateau: '${T("Bateau")}' },
    manche: { sans: '${T("Sans manche")}', courte: '${T("Courte")}', longue: '${T("Longue")}' },
    formeJupe: { droite: '${T("Droite")}', crayon: '${T("Crayon")}', evasee: '${T("Évasée")}' },
    formePantalon: { droit: '${T("Droit")}', large: '${T("Large")}', fusele: '${T("Fuselé")}' },
    formeRobe: { droite: '${T("Droite")}', trapeze: '${T("Trapèze")}' },
    col: { classique: '${T("Classique")}', mao: '${T("Mao")}' },
    ouiNon: { non: '${T("Non")}', oui: '${T("Oui")}' },
    formeCulotte: { classique: '${T("Classique")}', haute: '${T("Taille haute")}', hipster: '${T("Hipster")}' }
  };
  var LPIECE = { devant: '${T("Devant")}', dos: '${T("Dos")}', manche: '${T("Manche")}', empiecement: '${T("Empiècement")}', col: '${T("Col")}',
    piedcol: '${T("Pied de col")}', poignet: '${T("Poignet")}', bande: '${T("Bande")}', biais: '${T("Biais")}', bordcote: '${T("Bord-côte")}', capuche: '${T("Capuche")}',
    ceinture: '${T("Ceinture")}', pochear: '${T("Poche arrière")}', garde: '${T("Garde-poche")}', patte: '${T("Patte de braguette")}',
    bonnet: '${T("Bonnet")}', bretelle: '${T("Bretelle")}', panneau: '${T("Panneau")}', visiere: '${T("Visière")}', renfort: '${T("Renfort de visière")}',
    calotte: '${T("Calotte")}', cote: '${T("Côté")}', bord: '${T("Bord")}', fuseau: '${T("Fuseau")}', revers: '${T("Revers")}' };
  var LCTRL = { emmanchure: '${T("Emmanchure")}', cote: '${T("Couture de côté")}', tete: '${T("Tête de manche")}',
    embu: '${T("Embu de la manche")}', fourche: '${T("Fourche")}', entrejambe: '${T("Entrejambe")}' };
  /* Les pictogrammes des bases : un croquis à plat, trait seul. */
  var PICTO = {
    robe: '<svg viewBox="0 0 120 160" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M44 10l-22 14 6 30 10-4-4 100h52l-4-100 10 4 6-30-22-14c-2 8-9 12-16 12s-14-4-16-12z"/></svg>',
    chemisier: '<svg viewBox="0 0 130 120" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M48 8L14 22l-8 44 16 4 6-26v68h74V44l6 26 16-4-8-44L82 8c-3 8-10 12-17 12S51 16 48 8z"/></svg>',
    jupe: '<svg viewBox="0 0 120 130" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M30 8h60l22 112H8z"/></svg>',
    pantalon: '<svg viewBox="0 0 100 170" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M18 6h64l8 156H58L50 50l-8 112H10z"/></svg>',
    tshirt: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M40 10L10 26l10 22 12-6v88h56V42l12 6 10-22-30-16c-3 8-10 12-20 12s-17-4-20-12z"/></svg>',
    chemise: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M40 10L10 26l4 92 14-2 4-74v88h56V42l4 74 14 2 4-92-30-16-20 18zM60 28v100"/></svg>',
    debardeur: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M38 8c2 14 10 20 22 20s20-6 22-20l10 4c-6 18-4 30 8 40v80H20V52c12-10 14-22 8-40z"/></svg>',
    sweat: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M42 20c0-12 8-16 18-16s18 4 18 16l30 16 6 86h-16l-10-70v80H30V52l-10 70H4l6-86z"/></svg>',
    jean: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M18 6h64l8 128H58L50 50l-8 84H10zM18 20h64"/></svg>',
    short: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M18 20h84l12 70H70l-10-30-10 30H6z"/></svg>',
    legging: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M30 6h60l-2 128H66L60 50l-6 84H32z"/></svg>',
    culotte: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M10 30h100c-10 40-36 50-42 70H52C46 80 20 70 10 30z"/></svg>',
    brassiere: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M10 80c8-30 20-44 28-60h4c8 20 16 32 18 44 2-12 10-24 18-44h4c8 16 20 30 28 60zM10 80h100v16H10z"/></svg>',
    casquette: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M14 90c0-40 22-64 46-64s46 24 46 64zM14 90c20 12 60 14 92 4"/></svg>',
    bob: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M30 80l8-44h44l8 44M6 100c20-14 40-22 54-22s34 8 54 22c-30 10-78 10-108 0z"/></svg>',
    tuque: '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" aria-hidden="true"><path d="M18 100c0-50 18-80 42-80s42 30 42 80zM14 100h92v26H14z"/></svg>'
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
    nip: '${T("NIP incorrect.")}',
    produit_introuvable: '${T("Ce produit n’existe plus dans la boutique.")}',
    aucune_image: '${T("Aucun rendu à envoyer.")}',
    trop_de_photos: '${T("La fiche n’a plus de place pour ces rendus.")}',
    nip_requis: '${T("Ce modèle est protégé : son NIP est demandé.")}',
    nip_bloque: '${T("Trop d’essais : réessayez dans 5 minutes.")}',
    nip_format: '${T("Un NIP de 4 à 8 chiffres.")}',
    pas_de_nip: '${T("Ce modèle n’est pas protégé.")}',
    nip_annule: '${T("Changement non enregistré : le NIP n’a pas été donné.")}',
    superadmin_requis: '${T("Réservé au super-administrateur.")}',
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
    var id = op === 'atelier:ecrire' ? (args && args[0] && args[0].id) : (op === 'atelier:supprimer' || op === 'atelier:dupliquer' || op === 'atelier:restaurer') ? (args && args[0]) : '';
    var m = id && D ? (D.modeles || []).filter(function(x){ return x.id === id; })[0] : null;
    if (!m || !m.verrouille) return appelerBrut(op, args);
    return obtenirNip(m).then(function(nip){
      if (!nip) return { ok: false, motif: 'nip_annule' };
      var a = args.slice();
      if (op === 'atelier:ecrire') { a[0] = {}; Object.keys(args[0]).forEach(function(k){ a[0][k] = args[0][k]; }); a[0].nip = nip; }
      else if (op === 'atelier:restaurer') a[2] = nip; else a[1] = nip;
      return appelerBrut(op, a).then(function(r){ if (r && (r.motif === 'nip' || r.motif === 'nip_requis' || r.motif === 'nip_bloque')) delete NIPS[id]; return r; });
    });
  }
  function appelerBrut(op, args){
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


  /* ══ LA PROTECTION D UN MODÈLE (lot 9, 2026-10-17) ═══════════════════════════
     Sa demande : « une protection par NIP si nécessaire pour la modification du modèle, sur
     demande ». Le NIP se demande UNE fois par séance et par modèle, au premier geste qui écrit
     (enregistrer, retoucher, motif, design 3D, planche, restaurer, copier, supprimer) ; il vit en
     mémoire seulement, et s oublie s il est refusé. Le site n en garde que l empreinte. */
  var NIPS = {};
  function demanderNip(o){
    return new Promise(function(fin){
      var v = document.createElement('div'); v.className = 'szc-voile';
      var champs = o.champs || [{ id: 'nip', lib: '${T("NIP")}' }];
      v.innerHTML = '<div class="szc-boite" role="dialog" aria-modal="true" aria-labelledby="nip-t"><h3 id="nip-t">' + esc(o.titre) + '</h3>'
        + (o.texte ? '<p>' + esc(o.texte) + '</p>' : '')
        + champs.map(function(c){ return '<label class="nip-champ">' + c.lib + '<input type="password" inputmode="numeric" autocomplete="off" maxlength="8" data-nipc="' + c.id + '"></label>'; }).join('')
        + '<div class="nip-err" role="alert"></div><div class="szc-pied"><button type="button" class="szc-non">${T("Annuler")}</button><button type="button" class="szc-oui">' + esc(o.oui || '${T("Valider")}') + '</button></div></div>';
      document.body.appendChild(v);
      var fermer = function(r){ if (v.parentNode) v.parentNode.removeChild(v); fin(r); };
      var valider = function(){
        var r = {}; Array.prototype.forEach.call(v.querySelectorAll('[data-nipc]'), function(i){ r[i.getAttribute('data-nipc')] = i.value.trim(); });
        var err = o.verifier ? o.verifier(r) : (/^[0-9]{4,8}$/.test(r[champs[0].id]) ? '' : '${T("Un NIP de 4 à 8 chiffres.")}');
        if (err) { v.querySelector('.nip-err').textContent = err; return; }
        fermer(champs.length === 1 ? r[champs[0].id] : r);
      };
      v.querySelector('.szc-non').onclick = function(){ fermer(null); };
      v.querySelector('.szc-oui').onclick = valider;
      v.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') { ev.preventDefault(); fermer(null); } else if (ev.key === 'Enter') { ev.preventDefault(); valider(); } });
      v.addEventListener('mousedown', function(ev){ if (ev.target === v) fermer(null); });
      try { v.querySelector('input').focus(); } catch (e) {}
    });
  }
  function obtenirNip(m){
    if (NIPS[m.id]) return Promise.resolve(NIPS[m.id]);
    return demanderNip({ titre: '${T("Modèle protégé")}', texte: '${T("« {0} » est protégé par un NIP. Entrez-le pour enregistrer ce changement.")}'.split('{0}').join(m.nom), oui: '${T("Déverrouiller")}' })
      .then(function(n){ if (n) NIPS[m.id] = n; return n; });
  }
  function nipValide(r){ return /^[0-9]{4,8}$/.test(r.n1 || '') ? (r.n1 !== r.n2 ? '${T("Les deux NIP diffèrent.")}' : '') : '${T("Un NIP de 4 à 8 chiffres.")}'; }
  function protegerModele(id, geste){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0]; if (!m || OCCUPE) return;
    if (geste === 'forcer') {
      szConfirmer({ titre: '${T("Retirer le NIP sans le connaître ?")}', texte: '${T("Réservé au super-administrateur, pour un NIP oublié. Le modèle redevient modifiable par toute personne autorisée ; votre nom et la date sont gardés avec le modèle.")}',
        details: [['${T("Modèle")}', m.nom]], oui: '${T("Retirer le NIP")}', danger: true }).then(function(ok){
        if (!ok) return;
        OCCUPE = true; dire('${T("Enregistrement…")}');
        appelerBrut('atelier:verrou', [{ id: id, retirer: true, forcer: true }]).then(function(w){
          OCCUPE = false;
          if (!w || !w.ok) { dire(expliquer(w), 'err'); return; }
          delete NIPS[id];
          charger(function(){ dire('${T("Protection retirée.")}', 'bon'); });
        });
      });
      return;
    }
    var champs = geste === 'poser' ? [{ id: 'n1', lib: '${T("Nouveau NIP")}' }, { id: 'n2', lib: '${T("Confirmer le NIP")}' }]
      : geste === 'changer' ? [{ id: 'actuel', lib: '${T("NIP actuel")}' }, { id: 'n1', lib: '${T("Nouveau NIP")}' }, { id: 'n2', lib: '${T("Confirmer le NIP")}' }]
      : [{ id: 'actuel', lib: '${T("NIP actuel")}' }];
    demanderNip({ champs: champs,
      titre: geste === 'poser' ? '${T("Protéger « {0} » par un NIP")}'.split('{0}').join(m.nom) : geste === 'changer' ? '${T("Changer le NIP")}' : '${T("Retirer la protection")}',
      texte: geste === 'retirer' ? '${T("Le modèle redeviendra modifiable sans NIP.")}' : '${T("Le NIP (4 à 8 chiffres) sera demandé pour modifier, copier ou supprimer ce modèle. Il n’est pas gardé en clair : notez-le, un NIP oublié ne se retrouve pas.")}',
      oui: geste === 'retirer' ? '${T("Retirer")}' : '${T("Protéger")}',
      verifier: function(r){ if (geste !== 'poser' && !/^[0-9]{4,8}$/.test(r.actuel || '')) return '${T("Entrez le NIP actuel.")}'; return geste === 'retirer' ? '' : nipValide(r); }
    }).then(function(r){
      if (!r) return;
      OCCUPE = true; dire('${T("Enregistrement…")}');
      appelerBrut('atelier:verrou', [{ id: id, nip: r.actuel || '', nouveau: r.n1 || '', retirer: geste === 'retirer' }]).then(function(w){
        OCCUPE = false;
        if (!w || !w.ok) { dire(expliquer(w), 'err'); return; }
        if (geste === 'retirer') delete NIPS[id]; else NIPS[id] = r.n1;
        charger(function(){ dire(geste === 'retirer' ? '${T("Protection retirée.")}' : '${T("Modèle protégé par NIP.")}', 'bon'); });
      });
    });
  }
  /* Un PDF du modèle (la planche, le dossier de protection) : le site le compose, la coquille l imprime. */
  function exporterPdfModele(id, format, btn){
    if (OCCUPE) return;
    if (!P || typeof P.enregistrerExport !== 'function' || typeof P.documentPdf !== 'function') { dire('${T("Cette version de l’application ne sait pas fabriquer de PDF.")}', 'err'); return; }
    OCCUPE = true; if (btn) btn.disabled = true;
    var fin = function(msg, cl){ OCCUPE = false; if (btn) btn.disabled = false; dire(msg, cl); };
    dire('${T("Préparation du fichier…")}');
    appeler('atelier:exporter', [{ id: id, format: format }]).then(function(r){
      if (!r || !r.ok || !r.contenu) { fin(expliquer(r), 'err'); return; }
      Promise.resolve(P.documentPdf(r.contenu, { pageCss: true })).then(function(pdf){
        if (!pdf || !pdf.ok || !pdf.base64) { fin('${T("Le PDF n’a pas pu être fabriqué : {0}")}'.split('{0}').join((pdf && pdf.error) || '?'), 'err'); return; }
        Promise.resolve(P.enregistrerExport(r.nom, 'data:application/pdf;base64,' + pdf.base64)).then(function(w){
          if (w && w.ok) fin('${T("Enregistré : {0}")}'.split('{0}').join(w.path || r.nom), 'bon');
          else if (w && w.annule) fin('${T("Export annulé : le code d’export n’a pas été donné.")}', 'att');
          else fin('${T("L’enregistrement a échoué : {0}")}'.split('{0}').join((w && w.error) || '?'), 'err');
        });
      });
    });
  }

  /* ══ LA LISTE COMPACTE (lot 9) ══ sa demande : « un mode d affichage par liste compacte, avec les
     dates de création et de modification ». Le choix cartes / liste reste sur ce poste. */
  var VUEB = (function(){ try { return localStorage.getItem('sz-atelier-vue') === 'liste' ? 'liste' : 'cartes'; } catch (e) { return 'cartes'; } })();
  var TRI = { cle: 'maj', sens: -1 };
  function trierModeles(l){
    var v = function(m){ return TRI.cle === 'nom' ? String(m.nom || '').toLowerCase() : TRI.cle === 'ref' ? String(m.ref || '').toLowerCase() : TRI.cle === 'type' ? String(LBASE[m.base] || m.base || '')
      : TRI.cle === 'cree' ? String(m.createdAt || '') : TRI.cle === 'version' ? (m.version || 1) : String(m.updatedAt || ''); };
    return l.slice().sort(function(a, b){ var x = v(a), y = v(b); return (x < y ? -1 : x > y ? 1 : 0) * TRI.sens; });
  }
  function listeCompacte(liste){
    var th = function(cle, lib){ return '<th><button type="button" class="at-tri' + (TRI.cle === cle ? ' on' : '') + '" data-tri="' + cle + '">' + lib + (TRI.cle === cle ? (TRI.sens > 0 ? ' ▲' : ' ▼') : '') + '</button></th>'; };
    return '<div class="cx-pages" data-pages="atelier"' + (LEGER ? szPagesCoeurAttr(PGA) : '') + '><table class="at-liste"><thead><tr>' + th('nom', '${T("Nom")}') + th('type', '${T("Type")}')
      + '<th>${T("État")}</th>' + th('version', '${T("Version")}') + th('cree', '${T("Créé le")}') + th('maj', '${T("Modifié le")}') + '</tr></thead><tbody>'
      + trierModeles(liste).map(function(m){
          return '<tr class="' + (SEL === m.id ? 'on' : '') + '" data-sel="' + esc(m.id) + '" data-ctx-ligne="' + esc(m.id) + '" tabindex="0">'
            // ⚠ la vignette DANS la cellule du nom : seule dans sa colonne, le socle lui dessinait sa propre carte et la rangée paraissait coupée en deux
            + '<td class="nom"><span class="nomv"><span class="vigm">' + (m.vignette || '') + '</span><span class="nomt"><b>' + esc(m.nom) + (m.verrouille ? ' <span class="ic" title="${T("Protégé par NIP")}" aria-label="${T("Protégé par NIP")}">🔒</span>' : '') + '</b><span class="cx-gris">' + esc(m.ref || '${T("sans référence")}') + '</span></span></span></td>'
            + '<td>' + esc(LBASE[m.base] || szTd(m.base || '')) + '</td>'
            + '<td><span class="at-puce ' + esc(m.etat) + '">' + esc(LETAT[m.etat] || m.etat) + '</span></td><td>v' + (m.version || 1) + '</td>'
            + '<td class="cx-gris">' + esc(jour(m.createdAt)) + '</td><td class="cx-gris">' + esc(jour(m.updatedAt)) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
  }

  /* ══ LA BIBLIOTHÈQUE ═══════════════════════════════════════════════════ */
  function filtres(){
    if (LEGER && PGA) {
      var ids = PGA.ids || [];
      return ids.map(function(id){ return (D.modeles || []).filter(function(x){ return x.id === id; })[0]; })
        .filter(function(m){ return m && (ETAT || m.etat !== 'archive'); });
    }
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
    var nbBr = LEGER ? 0 : tous.filter(function(m){ return m.etat === 'brouillon'; }).length;
    var nbTous = LEGER ? (D.nbModeles || 0) : tous.length;
    if (LEGER && !nbTous) tous = [];
    document.getElementById('titre').textContent = '${T("Atelier de création")}';
    document.getElementById('sous').textContent = (nbTous > 1 ? '${T("{0} modèles")}'.split('{0}').join(nbTous) : '${T("{0} modèle")}'.split('{0}').join(nbTous))
      + (nbBr ? ' · ' + (nbBr > 1 ? '${T("{0} brouillons")}'.split('{0}').join(nbBr) : '${T("1 brouillon")}') : '');
    document.getElementById('actions').innerHTML = D.peutAjouter ? '<button type="button" id="a-photo">${T("Depuis une photo")}</button><button type="button" class="prim" id="a-nouveau">${T("Nouveau modèle")}</button>' : '';

    var seg = function(attr, v, lib, actif){
      return '<button type="button" class="' + (actif ? 'on' : '') + '" ' + attr + '="' + v + '">' + lib + '</button>';
    };
    var h = '<div class="cx-barre"><div class="ed-seg" role="group" aria-label="${T("Catégorie")}">'
      + seg('data-cat', '', '${T("Tous")}', !CAT)
      + (D.categories || []).map(function(c){ return seg('data-cat', c.cle, LCAT[c.cle] || szTd(c.nom), CAT === c.cle); }).join('')
      + '</div><div class="ed-seg" role="group" aria-label="${T("État")}">'
      + (D.etats || []).map(function(e){ return seg('data-etat', e.cle, LETATS[e.cle] || szTd(e.nom), ETAT === e.cle); }).join('')
      + '</div><div class="ed-seg" role="group" aria-label="${T("Affichage")}">' + seg('data-vueb', 'cartes', '${T("Cartes")}', VUEB === 'cartes') + seg('data-vueb', 'liste', '${T("Liste")}', VUEB === 'liste')
      + '</div><div class="droite"><label class="rf-rch">${ICO.loupe}<input type="search" id="a-q" maxlength="60" aria-label="${T("Rechercher un modèle")}" placeholder="${T("Nom, référence, base…")}" value="' + esc(Q) + '"></label></div></div>';

    var liste = filtres();
    var t = '<div class="cx-carte sz-pagee">';
    if (!tous.length) {
      t += '<div class="vide">${T("Aucun modèle pour l’instant. Partez d’un patron de base : il se trace à vos mesures.")}</div>';
    }
    if (VUEB === 'liste') t += listeCompacte(liste);
    else t += '<div class="at-grille" data-pages="atelier"' + (LEGER ? szPagesCoeurAttr(PGA) : '') + '>' + liste.map(function(m){
      return '<button type="button" class="at-carte' + (SEL === m.id ? ' on' : '') + '" data-sel="' + esc(m.id) + '" data-ctx-ligne="' + esc(m.id) + '" title="${T("Clic : détails · double-clic : ouvrir")}">'
        // le croquis de face (le vêtement qu on reconnaît) ; à défaut, les pièces à plat
        + '<span class="vig">' + (m.vignette || svgPieces([{ pieces: m.pieces || [] }], 176, 150, { mini: true, titre: m.nom })) + '</span>'
        + '<span class="tx"><span class="l1"><b>' + esc(m.nom) + '</b>' + (m.verrouille ? '<span class="ic" title="${T("Protégé par NIP")}" aria-label="${T("Protégé par NIP")}">🔒</span>' : '')
        + '<span class="at-puce ' + esc(m.etat) + '">' + esc(LETAT[m.etat] || m.etat) + '</span></span>'
        + '<span class="l2">' + esc([LBASE[m.base] || '', m.ref, 'v' + (m.version || 1), (m.tailles || []).join(' ')].filter(Boolean).join(' · ')) + '</span>'
        + '<span class="l3">' + esc('${T("modifié le {0}")}'.split('{0}').join(jour(m.updatedAt))) + '</span></span></button>';
    }).join('') + '</div>';
    // (2026-10-17, sa demande « retire ça » : la carte « Partir d un patron de base » doublait le bouton « Nouveau modèle » de la tête.)
    if (tous.length && !liste.length) t += '<div class="vide">${T("Aucun modèle ne correspond.")}</div>';
    var nbVue = (LEGER && PGA) ? PGA.total : liste.length;
    t += '<div class="cx-pied"><span>' + nbVue + ' ' + (nbVue > 1 ? '${T("modèles")}' : '${T("modèle")}') + '</span></div></div>';

    var m = SEL ? (D.modeles || []).filter(function(x){ return x.id === SEL; })[0] : null;
    var p = '<div class="cx-carte' + (m ? ' at-fiche' : '') + '">';
    if (!m) {
      p += '<h2>${T("Modèle choisi")}</h2><div class="cx-sub">${T("Cliquez une carte pour voir ses pièces, ses tailles et ses versions.")}</div>';
    } else {
      /* LA FICHE (2026-10-18, sa demande : « trop condensé ; des onglets à droite pour l historique ; des boutons plus
         professionnels ; un petit aperçu 3D qui tourne quand on clique sur le modèle »). En tête : le vêtement qui tourne,
         les deux gestes principaux, puis les outils en tuiles ; dessous, trois onglets — Détails, Historique, Protection. */
      var outil = function(attr, ico, court, long){ return '<button type="button" class="at-outil" ' + attr + '="' + esc(m.id) + '" title="' + long + '" aria-label="' + long + '">' + ico + '<span>' + court + '</span></button>'; };
      var ong = function(k, lib, n){ return '<button type="button" role="tab" aria-selected="' + (ONGLETB === k) + '" class="' + (ONGLETB === k ? 'on' : '') + '" data-bonglet="' + k + '">' + lib + (n ? '<span class="n">' + n + '</span>' : '') + '</button>'; };
      var vs = (m.versions || []).slice().reverse();
      p += '<div class="at-fiche-tete"><div class="at-fiche-titre"><h2>' + esc(m.nom) + '</h2>'
        + (m.verrouille ? '<span class="ic" title="${T("Protégé par NIP")}" aria-label="${T("Protégé par NIP")}">🔒</span>' : '')
        + '<span class="at-puce ' + esc(m.etat) + '">' + esc(LETAT[m.etat] || m.etat) + '</span></div>'
        + '<div class="cx-sub">' + esc([LBASE[m.base] || '', m.ref, 'v' + (m.version || 1)].filter(Boolean).join(' · ')) + '</div></div>'
        + '<div class="at-scene" id="at-mini" title="${T("Glisser pour tourner · double-clic : aperçu 3D")}">'
        + '<span class="at-scene-vig">' + (m.vignette || svgPieces([{ pieces: m.pieces || [] }], 300, 220, { mini: true, titre: m.nom })) + '</span>'
        + '<span class="at-scene-3d">3D</span><span class="at-scene-aide">${T("Glisser pour tourner")}</span></div>'
        + '<div class="at-actions">'
        + '<button type="button" class="prim" data-ouvrir="' + esc(m.id) + '">${T("Ouvrir le modèle")}</button>'
        + '<button type="button" data-editer="' + esc(m.id) + '">' + ICA.patron + '${T("Éditer le patron")}</button>'
        + '<button type="button" class="at-plus" data-plus="' + esc(m.id) + '" data-ctx-ligne="' + esc(m.id) + '" title="${T("Plus d’actions")}" aria-label="${T("Plus d’actions")}" aria-haspopup="menu">' + ICA.plus + '</button>'
        + '</div>'
        + '<div class="at-outils">'
        + outil('data-v3', ICA.cube, '${T("3D")}', '${T("Aperçu 3D")}')
        + outil('data-planche', ICA.crayon, '${T("Planche")}', '${T("Planche de dessin")}')
        + outil('data-motif', ICA.motif, '${T("Motif")}', '${T("Motif et impression textile")}')
        + outil('data-imprimer', ICA.imprimer, '${T("Imprimer")}', '${T("Imprimer / exporter")}')
        + outil('data-protection', ICA.dossier, '${T("Dossier")}', '${T("Dossier de protection (PDF)")}')
        + '</div>'
        + (m.edite ? '<div class="ed-note">${T("Patron retouché dans l’éditeur : « retracer » depuis le modèle effacerait ces retouches.")}</div>' : '')
        + '<div class="at-onglets" role="tablist" aria-label="${T("Fiche du modèle")}">'
        + ong('details', '${T("Détails")}') + ong('hist', '${T("Historique")}', vs.length) + ong('prot', '${T("Protection")}') + '</div>'
        + '<div class="at-onglet-corps" role="tabpanel">';
      if (ONGLETB === 'hist') {
        p += '<ul class="at-hist">' + vs.map(function(v){
            var actuelle = v.n === (m.version || 1);
            return '<li class="' + (actuelle ? 'actuelle' : '') + '"><div class="h1"><b>v' + v.n + '</b><span>' + esc(v.restaure ? '${T("retour à la version {0}")}'.split('{0}').join(v.restaure) : szTd(String(v.note || ''))) + '</span>'
              + (actuelle ? '<span class="moi">${T("actuelle")}</span>' : '') + '</div><div class="h2">' + esc(jour(v.date)) + '</div></li>';
          }).join('')
          + '<li><div class="h1"><b>${T("Création")}</b></div><div class="h2">' + esc(jour(m.createdAt)) + '</div></li></ul>'
          + (m.verrouRetire ? '<div class="cx-sub">' + esc('${T("NIP retiré par {0} le {1}.")}'.split('{0}').join(m.verrouRetire.par || '?').split('{1}').join(jour(m.verrouRetire.le))) + '</div>' : '')
          + '<div class="ed-note">${T("Pour revenir à une version, ouvrez « Éditer le patron » : son onglet Historique la restaure sans rien effacer.")}</div>';
      } else if (ONGLETB === 'prot') {
        p += (m.verrouille ? '<div class="at-prot"><span class="ic">🔒</span><span>${T("Protégé par NIP")}<span class="cx-gris"> · ' + esc(jour(m.verrouDepuis)) + '</span></span></div>'
            : '<div class="at-prot"><span class="ic">🔓</span><span>${T("Non protégé : toute personne autorisée peut le modifier.")}</span></div>')
          + '<div class="at-gestes">' + (D.peutModifier ? (m.verrouille ? '<button type="button" data-nip="changer:' + esc(m.id) + '">${T("Changer le NIP")}</button><button type="button" data-nip="retirer:' + esc(m.id) + '">${T("Retirer la protection")}</button>'
            : '<button type="button" data-nip="poser:' + esc(m.id) + '">${T("Protéger par NIP")}</button>') : '')
          // le retrait SANS le NIP (oublié) : visible du seul super-administrateur ; le site le revérifie
          + (m.verrouille && D.superadmin ? '<button type="button" class="danger" data-nip="forcer:' + esc(m.id) + '">${T("Retirer le NIP (super-administrateur)")}</button>' : '')
          + '</div>'
          + '<h3>${T("Dossier de protection")}</h3>'
          + '<div class="ed-note">${T("Le dossier prépare l’enregistrement d’un dessin industriel (l’apparence d’un vêtement ne se brevète pas) : vues, description, historique daté, empreinte numérique et questions pour votre juriste. Ce n’est pas un avis juridique.")}</div>'
          + '<div class="at-gestes"><button type="button" data-protection="' + esc(m.id) + '">' + ICA.dossier + ' ${T("Dossier de protection (PDF)")}</button></div>';
      } else {
        p += '<dl class="at-fiche-dl">'
          + '<dt>${T("Type")}</dt><dd>' + esc(LBASE[m.base] || szTd(m.base || '')) + '</dd>'
          + '<dt>${T("Référence")}</dt><dd>' + esc(m.ref || '—') + '</dd>'
          + '<dt>${T("Version")}</dt><dd>v' + (m.version || 1) + '</dd>'
          + '<dt>${T("Créé le")}</dt><dd>' + esc(jour(m.createdAt)) + '</dd>'
          + '<dt>${T("Modifié le")}</dt><dd>' + esc(jour(m.updatedAt)) + '</dd>'
          + '<dt>${T("Tissu estimé (laize 140 cm)")}</dt><dd>' + (m.tissu ? String(m.tissu.metres).replace('.', '${SEP_DEC()}') + ' m' : '—') + '</dd></dl>'
          + '<h3>${T("Pièces du patron")}</h3><div class="at-pieces">'
          + (m.pieces || []).map(function(pc){
              return '<div><span>' + esc(nomPiece(pc)) + ' · ×' + (pc.qte || 1) + (pc.aupli ? ' ${T("au pli")}' : '') + '</span><span class="cx-gris">' + (pc.pinces && pc.pinces.length ? '${T("pince")}' : '') + '</span></div>';
            }).join('') + '</div>'
          + '<h3>${T("Tailles gradées")}</h3><div class="at-tailles">'
          + (m.tailles || []).map(function(tl){ return '<span class="at-puce' + (tl === m.tailleBase ? ' base' : '') + '">' + esc(tl) + (tl === m.tailleBase ? ' · ${T("base")}' : '') + '</span>'; }).join('')
          + '</div>';
      }
      p += '</div>';
    }
    p += '</div>';
    corps.innerHTML = h + '<div class="cx-deux">' + t + p + '</div>';
    miniPoser(m);
  }

  /* Les pictogrammes de la fiche : même trait que ceux du socle (24 px, 1,75). */
  var SVGA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var ICA = {
    cube: SVGA + '<path d="M12 2.8l8 4.5v9.4l-8 4.5-8-4.5V7.3z"/><path d="M4 7.3l8 4.5 8-4.5M12 11.8v9.4"/></svg>',
    crayon: SVGA + '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    motif: SVGA + '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="8.5" cy="8.5" r="1.6"/><circle cx="15.5" cy="8.5" r="1.6"/><circle cx="8.5" cy="15.5" r="1.6"/><circle cx="15.5" cy="15.5" r="1.6"/></svg>',
    imprimer: SVGA + '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/></svg>',
    dossier: SVGA + '<path d="M12 3l7.5 3v5.5c0 4.4-3.1 8.1-7.5 9.5-4.4-1.4-7.5-5.1-7.5-9.5V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    patron: SVGA + '<circle cx="6" cy="6.5" r="2.5"/><circle cx="6" cy="17.5" r="2.5"/><path d="M8 8l12 9M8 16l12-9"/></svg>',
    plus: SVGA + '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>'
  };

  /* ══ L APERÇU QUI TOURNE (2026-10-18) ══════════════════════════════════════
     Sa demande : « un petit aperçu 3D qui tourne quand on clique sur le modèle ». C est le moteur de la vue 3D,
     dans son PROPRE contexte : V3 et GLV sont échangés le temps de chaque image, puis rendus — la vue 3D et ses
     vignettes n en voient rien. Un seul canevas, déplacé d un dessin à l autre : un contexte WebGL par dessin
     finirait par faire perdre les plus anciens (la vue 3D comprise). Sans WebGL, la vignette reste, immobile.
     Glisser fait tourner à la main ; un double-clic ouvre la vraie vue 3D. */
  var MINI = { cv: null, v3: null, glv: null, id: '', cle: '', n: 0, raf: 0, glisse: null, repos: 0, cadre: false };
  var MINI_CALME = (function(){ try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  function avecMini(fn){
    var sv = V3, sg = GLV; V3 = MINI.v3; GLV = MINI.glv;
    try { return fn(); } finally { MINI.glv = GLV; V3 = sv; GLV = sg; }
  }
  function miniPoser(m){
    var hote = document.getElementById('at-mini');
    if (!hote || !m) { MINI.n++; return; }
    if (!MINI.cv) {
      MINI.cv = document.createElement('canvas'); MINI.cv.className = 'at-mini-cv';
      MINI.cv.addEventListener('pointerdown', function(ev){ if (!MINI.v3) return; MINI.glisse = { x: ev.clientX, yaw: MINI.v3.yaw }; try { MINI.cv.setPointerCapture(ev.pointerId); } catch (e) {} });
      MINI.cv.addEventListener('pointermove', function(ev){ if (!MINI.glisse || !MINI.v3) return; MINI.v3.yaw = MINI.glisse.yaw + (ev.clientX - MINI.glisse.x) * 0.012; miniDemander(); });
      var lacher = function(){ if (MINI.glisse) { MINI.glisse = null; MINI.repos = Date.now() + 1800; miniDemander(); } };
      MINI.cv.addEventListener('pointerup', lacher); MINI.cv.addEventListener('pointercancel', lacher);
      MINI.cv.addEventListener('dblclick', function(ev){ ev.stopPropagation(); if (MINI.id) ouvrir3d(MINI.id, 'biblio'); });
    }
    hote.appendChild(MINI.cv);
    var cle = m.id + '|' + (m.version || 0) + '|' + (m.updatedAt || '') + '|' + genre3d(m.id);
    if (MINI.cle === cle) { if (MINI.v3 && MINI.cadre) hote.classList.add('pret'); miniDemander(); return; }
    MINI.cle = cle; MINI.id = m.id; MINI.v3 = null; MINI.cadre = false;
    var n = ++MINI.n;
    if (!webglDispo()) return;
    appeler('atelier:apercu3d', [{ id: m.id, taille: m.tailleBase || 'M', stature: STATURE3[genre3d(m.id)], genre: genre3d(m.id) }]).then(function(r){
      if (n !== MINI.n || !r || !r.ok) return;
      MINI.v3 = { id: m.id, m: m, r: r, taille: m.tailleBase || 'M', yaw: 0.45, pitch: 0.1, zoom: 1, px: 0, py: 0, carte: false, fil: false, mannequin: false, vueNom: '',
        couleur: m.photo3d ? m.photo3d.couleur : COUL3[0][0], photo: !!m.photo3d,
        design: { decoupes: ((m.design3d && m.design3d.decoupes) || []).slice(), elements: ((m.design3d && m.design3d.elements) || []).slice() } };
      var ok = avecMini(function(){ if (!plaque3d()) return false; imagesMotif3d(); return true; });
      if (!ok) { MINI.v3 = null; return; }
      miniDemander();
    });
  }
  function miniDemander(){
    if (MINI.raf) return;
    MINI.raf = requestAnimationFrame(function(){
      MINI.raf = 0;
      var cv = MINI.cv;
      if (VUE !== 'biblio' || !MINI.v3 || !cv || !cv.isConnected || document.hidden) return;
      if (MINI.glv && MINI.glv.gl && MINI.glv.gl.isContextLost()) MINI.glv = null;
      if (!cv.clientWidth || !cv.clientHeight) return;
      var tourne = !MINI_CALME && !MINI.glisse && Date.now() > MINI.repos;
      if (tourne) MINI.v3.yaw += 0.014;
      var peint = avecMini(function(){
        if (!peindreGL(cv)) return false;
        // le cadrage : le vêtement entier, à 80 % de la hauteur (comme les vignettes), une fois ses mesures connues
        if (!MINI.cadre && GLV && GLV.h) {
          var W = cv.clientWidth, H = cv.clientHeight;
          V3.zoom = Math.min(H * 0.8 * Math.max(GLV.minH || 120, GLV.h) / (GLV.h * W * 0.85), 1.6);
          MINI.cadre = true; peindreGL(cv);
        }
        return true;
      });
      if (!peint) { MINI.v3 = null; return; }
      var hote = document.getElementById('at-mini'); if (hote && MINI.cadre) hote.classList.add('pret');
      if (tourne || MINI.glisse || Date.now() <= MINI.repos) miniDemander();
    });
  }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) miniDemander(); });

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
    var h = '', b = (D.bases || []).filter(function(x){ return x.cle === M.base; })[0] || {}, ch = b.choix || {};
    Object.keys(ch).forEach(function(k){ if (LOPT[ch[k]]) h += sel('o-' + k, LCH[k] || k, LOPT[ch[k]], k, o[k] || (b.options || {})[k]); });
    if (b.options && b.options.longueur != null) h += '<label>' + (LLONG[M.base] || '${T("Longueur")}') + '<input type="text" id="o-longueur" maxlength="5" inputmode="decimal" value="' + esc(o.longueur != null ? String(o.longueur).replace('.', '${SEP_DEC()}') : '') + '"></label>';
    return h;
  }
  /* ══ LE STUDIO DU MODÈLE (2026-10-18, sa demande, capture à l appui : « tout est à refaire, c est pas assez
     professionnel et les options sont trop tassées — il faut un studio avec menus et options au même principe que
     Photoshop ») ══════════════════════════════════════════════════════════════
     · une BARRE DE MENUS (Fichier, Édition, Modèle, Tailles, Affichage, Fenêtre), au clavier (F10, flèches, Échap),
       raccourcis affichés et actifs (Ctrl+S, Ctrl+Z / Ctrl+Y, Ctrl+N, Ctrl+P, Ctrl++ / Ctrl+- / Ctrl+0) ;
     · une BARRE D OPTIONS (type, taille affichée, zoom, gestes principaux) ;
     · à gauche une PALETTE étroite des familles de vêtements ; le choix du type s ouvre en volet (plus de colonne de
       tuiles) ;
     · au centre le PLAN DE TRAVAIL : le patron en grand, zoomable (Ctrl + molette), grille au choix ;
     · à droite des PANNEAUX à onglets, repliables, qu on montre ou cache (menu Fenêtre) — l espace de travail est
       gardé sur ce poste ;
     · une BARRE D ÉTAT (taille de base, tailles, tissu, zoom, état d enregistrement).
     Rien n a disparu : mêmes champs, mêmes identifiants, mêmes gestionnaires — seulement réorganisés. Annuler /
     Rétablir est nouveau (instantanés du modèle, 60 au plus). */
  var ST = (function(){
    var d = { pans: { prop: 1, mod: 1, mes: 1, ais: 1, inf: 1 }, ong: { a: 'prop', b: 'mes' }, repli: {}, grille: 1 };
    try {
      var s = JSON.parse(localStorage.getItem('sz-atelier-studio') || 'null');
      if (s && s.pans) { d.pans = Object.assign(d.pans, s.pans); d.ong = Object.assign(d.ong, s.ong || {}); d.repli = s.repli || {}; d.grille = s.grille === 0 ? 0 : 1; }
    } catch (e) {}
    return d;
  })();
  function stGarder(){ try { localStorage.setItem('sz-atelier-studio', JSON.stringify(ST)); } catch (e) {} }
  var ZOOM = 1, FLY = '', MENU = '', PILEM = [], REFM = [];
  var STP = { prop: '${T("Propriétés")}', mod: '${T("Modèle")}', mes: '${T("Mesures")}', ais: '${T("Aisances")}', inf: '${T("Infos")}' };
  var STG = [['a', ['prop', 'mod']], ['b', ['mes', 'ais']], ['c', ['inf']]];
  var LFAMC = { haut: '${T("Hauts")}', jupe: '${T("Jupes")}', bas: '${T("Bas")}', lingerie: '${T("Lingerie")}', tete: '${T("Chapeaux")}' };
  var MENUS = [['fichier', '${T("Fichier")}'], ['edition', '${T("Édition")}'], ['modele', '${T("Modèle")}'], ['tailles', '${T("Tailles")}'],
    ['affichage', '${T("Affichage")}'], ['fenetre', '${T("Fenêtre")}']];
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

  /* Annuler / Rétablir : un instantané du modèle avant chaque changement (premier caractère d un champ, choix d une
     liste, type, tailles, tableau standard). */
  function memoM(){ if (!M) return; PILEM.push({ m: copie(M), t: TRACE }); if (PILEM.length > 60) PILEM.shift(); REFM = []; }
  function annulerM(){
    if (!PILEM.length) { dire('${T("Rien à annuler.")}', 'att'); return; }
    REFM.push({ m: copie(M), t: TRACE }); var s = PILEM.pop(); M = s.m; TRACE = s.t; dessinerModele(); dire('${T("Annulé.")}');
  }
  function retablirM(){
    if (!REFM.length) { dire('${T("Rien à rétablir.")}', 'att'); return; }
    PILEM.push({ m: copie(M), t: TRACE }); var s = REFM.pop(); M = s.m; TRACE = s.t; dessinerModele(); dire('${T("Rétabli.")}');
  }
  function stFamilles(){ var f = []; (D.bases || []).forEach(function(b){ var k = b.famille || ''; if (f.indexOf(k) < 0) f.push(k); }); return f; }
  function stZoom(z){
    ZOOM = Math.max(0.5, Math.min(4, z));
    var v = document.getElementById('st-zoomv'); if (v) v.textContent = Math.round(ZOOM * 100) + ' %';
    if (AP) peindreApercu(AP); else majEtat();
  }
  function stNomType(){ var b = (D.bases || []).filter(function(x){ return x.cle === M.base; })[0] || {}; return LBASE[M.base] || szTd(b.nom || ''); }

  /* ── les panneaux ── */
  function stPanneau(k){
    var tl = D.tailles || [];
    if (k === 'prop') {
      var o = optionsBase();
      return '<div class="st-type-ligne"><span>${T("Type")}</span><button type="button" class="st-type" data-st-fly="tous" aria-haspopup="dialog">' + (PICTO[M.base] || '')
        + '<span>' + esc(stNomType()) + '</span><span class="fl" aria-hidden="true">▾</span></button></div>'
        + (o ? '<div class="st-form">' + o + '</div>' : '<p class="st-note">${T("Ce type n’a pas d’option.")}</p>')
        + (LBASED[M.base] ? '<p class="st-note">${T("Pièces :")} ' + esc(LBASED[M.base]) + '</p>' : '');
    }
    if (k === 'mod') {
      return '<div class="st-form">'
        + '<label>${T("Nom")}<input type="text" id="m-nom" maxlength="80" value="' + esc(M.nom) + '"></label>'
        + '<label>${T("Référence")}<input type="text" id="m-ref" maxlength="24" value="' + esc(M.ref) + '" placeholder="RB-014"></label>'
        + '<label>${T("Catégorie")}<select id="m-cat">' + (D.categories || []).map(function(c){
            return '<option value="' + c.cle + '"' + (M.categorie === c.cle ? ' selected' : '') + '>' + esc(LCAT[c.cle] || szTd(c.nom)) + '</option>'; }).join('') + '</select></label>'
        + '<label>${T("État")}<select id="m-etat">' + (D.etats || []).map(function(e){
            return '<option value="' + e.cle + '"' + (M.etat === e.cle ? ' selected' : '') + '>' + esc(LETAT[e.cle] || szTd(e.nom)) + '</option>'; }).join('') + '</select></label>'
        + (LEGER ? '<label>${T("Chercher un produit")}<input type="search" id="m-prodq" data-prodq="m-prod" maxlength="60" placeholder="${T("Nom ou SKU…")}"></label>' : '')
        + '<label>${T("Produit lié")}<select id="m-prod"><option value="">${T("— Aucun —")}</option>' + (D.produits || []).map(function(pr){
            return '<option value="' + esc(pr.id) + '"' + (M.produitId === pr.id ? ' selected' : '') + '>' + esc(pr.nom) + '</option>'; }).join('') + '</select></label>'
        + '<label class="haut">${T("Notes")}<textarea id="m-notes" maxlength="600">' + esc(M.notes) + '</textarea></label>'
        + '</div>';
    }
    if (k === 'mes') {
      return '<p class="st-note">${T("Mesures du corps, en cm. Décochez une taille pour ne pas la garder.")}</p>'
        + '<div class="st-mes-zone"><table class="st-mes"><thead><tr><th>${T("Mesure")}</th>'
        + tl.map(function(t){
            var inclus = (M.tailles || []).indexOf(t) >= 0;
            return '<th class="' + (M.tailleBase === t ? 'base' : '') + '"><label><input type="checkbox" data-taille="' + t + '"' + (inclus ? ' checked' : '') + ' aria-label="${T("Taille gardée :")} ' + t + '">' + t + '</label></th>';
          }).join('') + '</tr></thead><tbody>'
        + (D.mesures || []).map(function(m){
            var nm = LMES[m.cle] || szTd(m.nom);
            return '<tr><td title="' + esc(nm) + '">' + esc(nm) + '</td>' + tl.map(function(t){
              var v = ((M.tableau || {})[t] || {})[m.cle];
              return '<td><input type="text" inputmode="decimal" maxlength="5" data-t="' + t + '" data-m="' + m.cle + '" aria-label="' + esc(nm + ' ' + t) + '" value="' + esc(v != null ? String(v).replace('.', '${SEP_DEC()}') : '') + '"></td>';
            }).join('') + '</tr>';
          }).join('')
        + '</tbody></table></div>'
        + '<div class="st-pied-pan"><label>${T("Taille de base")}<select id="m-tbase" title="${T("Taille de base (tracé de référence)")}">' + tl.map(function(t){
            return '<option value="' + t + '"' + (M.tailleBase === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label>'
        + '<button type="button" class="mini" id="m-standard">${T("Tableau standard")}</button></div>';
    }
    if (k === 'ais') {
      return '<p class="st-note">${T("Ajoutées au tour du corps, en cm.")}</p><div class="st-form">'
        + ['poitrine', 'taille', 'hanches'].map(function(q){
            return '<label>' + esc(LMES[q]) + '<input type="text" inputmode="decimal" maxlength="4" id="a-' + q + '" value="' + esc(String((M.aisances || {})[q] != null ? M.aisances[q] : '').replace('.', '${SEP_DEC()}')) + '"></label>';
          }).join('') + '</div>';
    }
    return '<div id="m-ctrl"><p class="st-note">${T("Calcul en cours…")}</p></div>';
  }
  function stPanneaux(){
    var h = STG.map(function(g){
      var vis = g[1].filter(function(k){ return ST.pans[k]; }); if (!vis.length) return '';
      var act = vis.indexOf(ST.ong[g[0]]) >= 0 ? ST.ong[g[0]] : vis[0], rep = !!ST.repli[g[0]];
      var lr = rep ? '${T("Déplier le panneau")}' : '${T("Replier le panneau")}';
      return '<section class="st-pan' + (rep ? ' replie' : '') + '" aria-label="' + esc(vis.map(function(k){ return STP[k]; }).join(' · ')) + '">'
        + '<div class="st-pan-tete"><div class="st-onglets" role="tablist">' + vis.map(function(k){
            return '<button type="button" role="tab" aria-selected="' + (k === act) + '" class="' + (k === act ? 'on' : '') + '" data-st-onglet="' + g[0] + ':' + k + '">' + STP[k] + '</button>';
          }).join('')
        + '</div><button type="button" class="st-repli" data-st-repli="' + g[0] + '" aria-expanded="' + !rep + '" title="' + lr + '" aria-label="' + lr + '">' + CHEV + '</button></div>'
        + (rep ? '' : '<div class="st-pan-corps" role="tabpanel">' + stPanneau(act) + '</div>') + '</section>';
    }).join('');
    return h || '<p class="st-note" style="padding:1rem">${T("Tous les panneaux sont masqués : menu Fenêtre.")}</p>';
  }
  function stPeindrePanneaux(){
    var p = corps.querySelector('.st-panneaux'); if (!p) return;
    p.innerHTML = stPanneaux();
    if (AP) peindreApercu(AP);
  }
  /* montrer un panneau (et y poser le curseur) — depuis les menus */
  function stMontrer(g, k, champ){
    ST.pans[k] = 1; ST.ong[g] = k; ST.repli[g] = 0; stGarder(); stPeindrePanneaux();
    var c = champ ? document.getElementById(champ) : corps.querySelector('.st-pan-corps input, .st-pan-corps select');
    if (c) c.focus();
  }

  /* ── le volet « Type de vêtement » ── */
  function stFly(){
    if (!FLY) return '';
    var fams = FLY === 'tous' ? stFamilles() : [FLY];
    return '<div class="st-fly" role="dialog" aria-label="${T("Type de vêtement")}"><div class="st-fly-tete"><b>'
      + (FLY === 'tous' ? '${T("Type de vêtement")}' : esc(LFAM[FLY] || FLY)) + '</b>'
      + '<button type="button" data-st-fly-fermer="1" aria-label="${T("Fermer")}" title="${T("Fermer (Échap)")}">×</button></div>'
      + '<div class="st-fly-corps"><div class="at-bases">'
      + fams.map(function(f){
          return (fams.length > 1 ? '<div class="at-fam">' + esc(LFAM[f] || f) + '</div>' : '')
            + (D.bases || []).filter(function(b){ return (b.famille || '') === f; }).map(function(b){
                return '<button type="button" class="at-base' + (M.base === b.cle ? ' on' : '') + '" data-base="' + b.cle + '" aria-pressed="' + (M.base === b.cle) + '">' + (PICTO[b.cle] || '')
                  + '<span><b>' + esc(LBASE[b.cle] || szTd(b.nom)) + '</b><span class="cx-sub">' + esc(LBASED[b.cle] || '') + '</span></span></button>';
              }).join('');
        }).join('') + '</div></div></div>';
  }
  function stPeindreFly(){
    var c = corps.querySelector('.st-corps'); if (!c) return;
    var v = c.querySelector('.st-fly'); if (v) v.remove();
    if (FLY) c.insertAdjacentHTML('beforeend', stFly());
    corps.querySelectorAll('[data-st-fly]').forEach(function(b){ b.setAttribute('aria-expanded', String(FLY !== '' && b.getAttribute('data-st-fly') === FLY)); });
    var p = FLY ? c.querySelector('.st-fly .at-base.on, .st-fly .at-base') : null; if (p) p.focus();
  }

  /* ── la barre d état ── */
  function stEtatHtml(){
    var etat = !M.id ? '<span class="att">${T("Nouveau modèle — pas encore enregistré")}</span>'
      : TRACE ? '<span class="att">${T("Modifié — les pièces seront retracées à l’enregistrement")}</span>'
      : '<span class="ok">${T("Enregistré")}</span> <span>· v' + (M.version || 1) + '</span>';
    return '<span>${T("Taille de base")} <b>' + esc(M.tailleBase || '') + '</b></span>'
      + '<span>${T("Tailles")} <b>' + esc((M.tailles || []).join(' ')) + '</b></span>'
      + '<span>${T("Tissu estimé")} <b>' + (AP && AP.tissu ? String(AP.tissu.metres).replace('.', '${SEP_DEC()}') + ' m' : '—') + '</b></span>'
      + '<span>${T("Zoom")} <b>' + Math.round(ZOOM * 100) + ' %</b></span><span class="ecart"></span>' + etat;
  }
  function majEtat(){ var e = document.getElementById('st-etat'); if (e) e.innerHTML = stEtatHtml(); }

  /* ── les menus ── */
  function stNouveau(){
    if (!D.peutAjouter) return;
    if ((M && M.id && TRACE) || (M && !M.id && String(M.nom || '').trim())) {
      szConfirmer({ titre: '${T("Quitter sans enregistrer ?")}', texte: '${T("Les changements de base, d’options ou de mesures seront perdus.")}', oui: '${T("Nouveau modèle")}', danger: true })
        .then(function(ok){ if (ok) ouvrirNeuf(); });
      return;
    }
    ouvrirNeuf();
  }
  function stTableauStandard(){ memoM(); M.tableau = copie(D.standard); TRACE = true; dessinerModele(); dire('${T("Tableau standard remis.")}', 'bon'); }
  function stEntrees(k){
    var neuf = !M.id, peut = neuf ? D.peutAjouter : D.peutModifier, fige = neuf || TRACE, tl = D.tailles || [], l = [];
    var sec = function(t){ l.push({ sec: t }); }, tr = function(){ l.push({ trait: true }); };
    var quitterVers = function(fn){ return function(){ var mid = M.id; M = null; fn(mid); }; };
    if (k === 'fichier') {
      l.push({ lib: '${T("Nouveau modèle")}', rac: 'Ctrl+N', off: !D.peutAjouter, fn: stNouveau });
      tr();
      l.push({ lib: neuf ? '${T("Créer le modèle")}' : '${T("Enregistrer la version")}', rac: 'Ctrl+S', off: !peut, fn: function(){ enregistrer(document.getElementById('m-enreg')); } });
      tr();
      l.push({ lib: '${T("Éditer le patron")}', off: fige, fn: quitterVers(function(id){ ouvrirEditeur(id); }) });
      l.push({ lib: '${T("Aperçu 3D")}', off: fige, fn: quitterVers(function(id){ ouvrir3d(id, 'biblio'); }) });
      l.push({ lib: '${T("Imprimer / exporter…")}', rac: 'Ctrl+P', off: fige, fn: quitterVers(function(id){ ouvrirImpression(id, 'biblio'); }) });
      tr();
      l.push({ lib: '${T("Fermer")}', rac: '${T("Échap")}', fn: revenir });
    } else if (k === 'edition') {
      // « Annuler la modification » : « Annuler » seul est déjà traduit « Cancel » (bouton de boîte) — ici c est « Undo »
      l.push({ lib: '${T("Annuler la modification")}', rac: 'Ctrl+Z', off: !PILEM.length, fn: annulerM });
      l.push({ lib: '${T("Rétablir")}', rac: 'Ctrl+Y', off: !REFM.length, fn: retablirM });
      tr();
      l.push({ lib: '${T("Tableau standard")}', fn: stTableauStandard });
    } else if (k === 'modele') {
      l.push({ lib: '${T("Type de vêtement…")}', fn: function(){ FLY = 'tous'; stPeindreFly(); } });
      l.push({ lib: '${T("Options du type")}', fn: function(){ stMontrer('a', 'prop'); } });
      l.push({ lib: '${T("Informations du modèle")}', fn: function(){ stMontrer('a', 'mod', 'm-nom'); } });
      tr();
      l.push({ lib: '${T("Mesures")}', fn: function(){ stMontrer('b', 'mes'); } });
      l.push({ lib: '${T("Aisances")}', fn: function(){ stMontrer('b', 'ais', 'a-poitrine'); } });
    } else if (k === 'tailles') {
      sec('${T("Tailles du modèle")}');
      tl.forEach(function(t){
        var inclus = (M.tailles || []).indexOf(t) >= 0;
        l.push({ lib: t, coche: inclus, off: t === M.tailleBase, fn: function(){
          memoM(); var ls = (M.tailles || []).filter(function(x){ return x !== t; }); if (!inclus) ls.push(t);
          M.tailles = tl.filter(function(x){ return ls.indexOf(x) >= 0; }); dessinerModele(); } });
      });
      sec('${T("Taille de base")}');
      tl.forEach(function(t){
        l.push({ lib: t, coche: M.tailleBase === t, fn: function(){
          if (M.tailleBase === t) return;
          memoM(); M.tailleBase = t; if ((M.tailles || []).indexOf(t) < 0) M.tailles.push(t); TRACE = true; dessinerModele(); } });
      });
      tr();
      l.push({ lib: '${T("Tableau standard")}', fn: stTableauStandard });
    } else if (k === 'affichage') {
      sec('${T("Taille affichée")}');
      tl.forEach(function(t){ l.push({ lib: t, coche: !TOUTES && TAP === t, fn: function(){ TAP = t; TOUTES = false; dessinerModele(); } }); });
      l.push({ lib: '${T("Toutes les tailles emboîtées")}', coche: TOUTES, fn: function(){ TOUTES = !TOUTES; dessinerModele(); } });
      tr();
      l.push({ lib: '${T("Zoom avant")}', rac: 'Ctrl++', fn: function(){ stZoom(ZOOM * 1.25); } });
      l.push({ lib: '${T("Zoom arrière")}', rac: 'Ctrl+-', fn: function(){ stZoom(ZOOM / 1.25); } });
      l.push({ lib: '${T("Ajuster à la fenêtre")}', rac: 'Ctrl+0', fn: function(){ stZoom(1); } });
      tr();
      l.push({ lib: '${T("Grille")}', coche: !!ST.grille, fn: function(){ ST.grille = ST.grille ? 0 : 1; stGarder(); var pl = document.getElementById('st-plan'); if (pl) pl.classList.toggle('grille', !!ST.grille); } });
    } else if (k === 'fenetre') {
      ['prop', 'mod', 'mes', 'ais', 'inf'].forEach(function(p){
        l.push({ lib: STP[p], coche: !!ST.pans[p], fn: function(){ ST.pans[p] = ST.pans[p] ? 0 : 1; stGarder(); stPeindrePanneaux(); } });
      });
      tr();
      l.push({ lib: '${T("Réinitialiser l’espace de travail")}', fn: function(){
        ST.pans = { prop: 1, mod: 1, mes: 1, ais: 1, inf: 1 }; ST.ong = { a: 'prop', b: 'mes' }; ST.repli = {}; ST.grille = 1; stGarder(); ZOOM = 1; dessinerModele(); } });
    }
    return l;
  }
  function stFermerMenu(){
    MENU = '';
    var m = corps.querySelector('.st-menu-liste'); if (m) m.remove();
    corps.querySelectorAll('[data-st-menu]').forEach(function(b){ b.setAttribute('aria-expanded', 'false'); });
  }
  function stOuvrirMenu(k, focusPremier){
    stFermerMenu();
    var btn = corps.querySelector('[data-st-menu="' + k + '"]'), st = corps.querySelector('.st'); if (!btn || !st || (VUE === '3d' ? !V3 : !M)) return;
    MENU = k; btn.setAttribute('aria-expanded', 'true');
    var l = VUE === '3d' ? v3Entrees(k) : stEntrees(k), h = '';  // l aperçu 3D partage les menus du studio
    l.forEach(function(e, i){
      if (e.trait) { h += '<div class="trait" role="separator"></div>'; return; }
      if (e.sec) { h += '<div class="sec" role="presentation">' + esc(e.sec) + '</div>'; return; }
      h += '<button type="button" role="' + (e.coche != null ? 'menuitemcheckbox' : 'menuitem') + '"' + (e.coche != null ? ' aria-checked="' + !!e.coche + '"' : '')
        + ' data-st-mi="' + i + '"' + (e.off ? ' disabled' : '') + '><span class="ck" aria-hidden="true">' + (e.coche ? '✓' : '') + '</span><span>' + esc(e.lib) + '</span><span class="rac">' + esc(e.rac || '') + '</span></button>';
    });
    var m = document.createElement('div'); m.className = 'st-menu-liste'; m.setAttribute('role', 'menu'); m.setAttribute('aria-label', btn.textContent);
    m.innerHTML = h;
    var rs = st.getBoundingClientRect(), rb = btn.getBoundingClientRect();
    m.style.left = Math.max(4, rb.left - rs.left) + 'px'; m.style.top = (rb.bottom - rs.top + 2) + 'px';
    st.appendChild(m);
    m.onclick = function(ev){
      var b = ev.target.closest('[data-st-mi]'); if (!b || b.disabled) return;
      ev.stopPropagation();
      var e = l[+b.getAttribute('data-st-mi')]; stFermerMenu(); btn.focus();
      try { e.fn(); } catch (x) { dire(String((x && x.message) || x), 'err'); }
    };
    if (focusPremier) { var p = m.querySelector('button:not(:disabled)'); if (p) p.focus(); }
  }

  function dessinerModele(){
    var neuf = !M.id, tl = D.tailles || [], peut = neuf ? D.peutAjouter : D.peutModifier;
    var b0 = (D.bases || []).filter(function(x){ return x.cle === M.base; })[0] || {};
    document.getElementById('titre').textContent = neuf ? '${T("Nouveau modèle")}' : (M.nom || '${T("Modèle")}');
    document.getElementById('sous').textContent = neuf ? '${T("Tracé à partir d’un patron de base et de vos mesures")}'
      : ((M.ref ? M.ref + ' · ' : '') + 'v' + (M.version || 1));
    document.getElementById('actions').innerHTML = '<button type="button" id="m-retour">${T("← Bibliothèque")}</button>';

    var menus = '<div class="st-menus" role="menubar" aria-label="${T("Menus du studio")}">'
      + MENUS.map(function(m){ return '<button type="button" role="menuitem" aria-haspopup="menu" aria-expanded="false" data-st-menu="' + m[0] + '">' + m[1] + '</button>'; }).join('')
      + '</div>';
    var opt = '<div class="st-options" role="toolbar" aria-label="${T("Options du studio")}">'
      + '<div class="grp"><span class="lib">${T("Type")}</span><button type="button" class="st-type" data-st-fly="tous" aria-haspopup="dialog" aria-expanded="' + (FLY === 'tous') + '">'
      + (PICTO[M.base] || '') + '<span>' + esc(stNomType()) + '</span><span class="fl" aria-hidden="true">▾</span></button></div>'
      + '<div class="grp"><span class="lib">${T("Taille affichée")}</span><span class="ed-seg" role="group" aria-label="${T("Taille de l’aperçu")}">'
      + tl.map(function(t){ return '<button type="button" class="' + (!TOUTES && TAP === t ? 'on' : '') + '" data-tap="' + t + '">' + t + '</button>'; }).join('')
      + '<button type="button" class="' + (TOUTES ? 'on' : '') + '" data-toutes="1">${T("Toutes")}</button></span></div>'
      + '<div class="grp"><span class="lib">${T("Zoom")}</span><span class="st-zoom">'
      + '<button type="button" data-st-zoom="-" title="${T("Zoom arrière (Ctrl+-)")}" aria-label="${T("Zoom arrière")}">−</button>'
      + '<span class="val" id="st-zoomv">' + Math.round(ZOOM * 100) + ' %</span>'
      + '<button type="button" data-st-zoom="+" title="${T("Zoom avant (Ctrl++)")}" aria-label="${T("Zoom avant")}">+</button>'
      + '<button type="button" data-st-zoom="0" title="${T("Ajuster à la fenêtre (Ctrl+0)")}">${T("Ajuster")}</button></span></div>'
      + '<span class="ecart"></span>'
      + (!neuf ? '<button type="button" id="m-editer"' + (TRACE ? ' disabled title="${T("Enregistrez d’abord les changements du modèle.")}"' : '') + '>${T("Éditer le patron")}</button>' : '')
      + (peut ? '<button type="button" class="prim" id="m-enreg" title="Ctrl+S">' + (neuf ? '${T("Créer le modèle")}' : '${T("Enregistrer la version")}') + '</button>' : '')
      + '</div>';
    var pal = '<nav class="st-palette" aria-label="${T("Types de vêtement")}">' + stFamilles().map(function(f){
        var bf = (D.bases || []).filter(function(x){ return (x.famille || '') === f; });
        var ic = bf.some(function(x){ return x.cle === M.base; }) ? M.base : (bf[0] || {}).cle;
        return '<button type="button" class="st-outil' + (f === (b0.famille || '') ? ' on' : '') + '" data-st-fly="' + f + '" aria-haspopup="dialog" aria-expanded="' + (FLY === f) + '" title="' + esc(LFAM[f] || f) + '">'
          + (PICTO[ic] || '') + '<span>' + esc(LFAMC[f] || LFAM[f] || f) + '</span></button>';
      }).join('') + '</nav>';
    var plan = '<div class="st-plan' + (ST.grille ? ' grille' : '') + '" id="st-plan" role="region" aria-label="${T("Plan de travail")}"><div class="st-feuille">'
      + '<div class="at-apercu" id="m-apercu"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div></div></div></div>';

    corps.innerHTML = '<div class="st">' + menus + opt
      + '<div class="st-corps">' + pal + plan + '<aside class="st-panneaux" aria-label="${T("Panneaux")}">' + stPanneaux() + '</aside>' + stFly() + '</div>'
      + '<div class="st-etat" id="st-etat" role="status">' + stEtatHtml() + '</div></div>';
    MENU = '';
    // la feuille suit la TAILLE DU PLAN (panneaux repliés, fenêtre redimensionnée, mise en page pas encore faite au
    // premier dessin) — l événement « resize » de la fenêtre ne voit pas tout cela
    if (window.ResizeObserver) {
      if (window._stRO) window._stRO.disconnect();
      var pl = document.getElementById('st-plan'), dim = '';
      window._stRO = new ResizeObserver(function(){
        if (VUE !== 'modele' || !AP || !pl) return;
        var d2 = pl.clientWidth + 'x' + pl.clientHeight; if (d2 === dim) return; dim = d2; peindreApercu(AP);
      });
      if (pl) window._stRO.observe(pl);
    }
    if (!neuf && TRACE) dire(M.edite ? '${T("Attention : retracer effacera les retouches faites dans l’éditeur de patron.")}'
      : '${T("Base, options ou mesures changées : les pièces seront retracées à l’enregistrement.")}', 'att');
    demanderApercu();
  }

  /* ── les gestes du studio (posés AVANT ceux de la bibliothèque, plus bas : les instantanés d annulation se
     prennent avant que le gestionnaire commun ne change le modèle) ── */
  corps.addEventListener('click', function(ev){
    if (VUE !== 'modele' || !M) return;
    var t = ev.target; if (!t || !t.closest) return;
    var b;
    if ((b = t.closest('[data-st-menu]'))) { var k = b.getAttribute('data-st-menu'); if (MENU === k) stFermerMenu(); else stOuvrirMenu(k, false); return; }
    if ((b = t.closest('[data-st-fly-fermer]'))) { FLY = ''; stPeindreFly(); return; }
    if ((b = t.closest('[data-st-fly]'))) { var f = b.getAttribute('data-st-fly'); FLY = FLY === f ? '' : f; stPeindreFly(); return; }
    if ((b = t.closest('[data-st-onglet]'))) { var p = b.getAttribute('data-st-onglet').split(':'); ST.ong[p[0]] = p[1]; stGarder(); stPeindrePanneaux(); return; }
    if ((b = t.closest('[data-st-repli]'))) { var g = b.getAttribute('data-st-repli'); ST.repli[g] = ST.repli[g] ? 0 : 1; stGarder(); stPeindrePanneaux(); return; }
    if ((b = t.closest('[data-st-zoom]'))) { var z = b.getAttribute('data-st-zoom'); stZoom(z === '+' ? ZOOM * 1.25 : z === '-' ? ZOOM / 1.25 : 1); return; }
    if ((b = t.closest('[data-base]')) && b.getAttribute('data-base') !== M.base) { memoM(); FLY = ''; return; }
    if (t.closest('#m-standard')) { memoM(); return; }
  });
  corps.addEventListener('mouseover', function(ev){
    if (VUE !== 'modele' || !MENU) return;
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-st-menu]') : null;
    if (b && b.getAttribute('data-st-menu') !== MENU) stOuvrirMenu(b.getAttribute('data-st-menu'), false);
  });
  corps.addEventListener('input', function(ev){
    if (VUE !== 'modele' || !M) return;
    var t = ev.target; if (!t || !t.closest || !t.closest('.st') || t._szMemo) return;
    memoM(); t._szMemo = true;
  });
  corps.addEventListener('change', function(ev){
    if (VUE !== 'modele' || !M) return;
    var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-taille')) { memoM(); setTimeout(majEtat, 0); }
  });
  corps.addEventListener('wheel', function(ev){
    if (VUE !== 'modele' || !ev.ctrlKey || !(ev.target && ev.target.closest && ev.target.closest('#st-plan'))) return;
    ev.preventDefault(); stZoom(ev.deltaY < 0 ? ZOOM * 1.15 : ZOOM / 1.15);
  }, { passive: false });
  document.addEventListener('mousedown', function(ev){
    if (VUE !== 'modele') return;
    var t = ev.target;
    if (MENU && !(t && t.closest && t.closest('.st-menu-liste, [data-st-menu]'))) stFermerMenu();
    if (FLY && !(t && t.closest && t.closest('.st-fly, [data-st-fly]'))) { FLY = ''; stPeindreFly(); }
  }, true);
  /* Le clavier : F10 (menus), flèches dans les menus, Échap, et les raccourcis. En capture : Échap ferme d abord le
     menu ou le volet ouvert, sans quitter le studio. */
  document.addEventListener('keydown', function(ev){
    if (VUE !== 'modele' || !M || document.querySelector('.szc-voile')) return;
    var k = ev.key, ctrl = ev.ctrlKey || ev.metaKey, a = document.activeElement;
    var barre = function(){ return Array.prototype.slice.call(corps.querySelectorAll('[data-st-menu]')); };
    var stop = function(){ ev.preventDefault(); ev.stopImmediatePropagation(); };
    var liste = corps.querySelector('.st-menu-liste');
    if (liste && a && liste.contains(a)) {
      var its = Array.prototype.slice.call(liste.querySelectorAll('button:not(:disabled)')), i = its.indexOf(a);
      if (k === 'ArrowDown' || k === 'ArrowUp') { stop(); var n = its[(i + (k === 'ArrowDown' ? 1 : -1) + its.length) % its.length]; if (n) n.focus(); return; }
      if (k === 'Home' || k === 'End') { stop(); var e2 = its[k === 'Home' ? 0 : its.length - 1]; if (e2) e2.focus(); return; }
      if (k === 'ArrowRight' || k === 'ArrowLeft') {
        stop(); var bs = barre(), j = MENUS.map(function(m){ return m[0]; }).indexOf(MENU);
        var nk = MENUS[(j + (k === 'ArrowRight' ? 1 : -1) + MENUS.length) % MENUS.length][0]; stOuvrirMenu(nk, true); return;
      }
      if (k === 'Tab') { stFermerMenu(); return; }
    }
    if (a && a.hasAttribute && a.hasAttribute('data-st-menu')) {
      var bb = barre(), x = bb.indexOf(a);
      if (k === 'ArrowRight' || k === 'ArrowLeft') { stop(); var nb = bb[(x + (k === 'ArrowRight' ? 1 : -1) + bb.length) % bb.length]; if (nb) { nb.focus(); if (MENU) stOuvrirMenu(nb.getAttribute('data-st-menu'), false); } return; }
      if (k === 'ArrowDown' || k === 'Enter' || k === ' ') { stop(); stOuvrirMenu(a.getAttribute('data-st-menu'), true); return; }
    }
    if (k === 'F10') { stop(); var pb = barre()[0]; if (pb) pb.focus(); return; }
    if (k === 'Escape') {
      if (MENU) { stop(); var mb = corps.querySelector('[data-st-menu="' + MENU + '"]'); stFermerMenu(); if (mb) mb.focus(); return; }
      if (FLY) { stop(); FLY = ''; stPeindreFly(); return; }
      return;
    }
    if (!ctrl) return;
    var champ = a && /^(INPUT|TEXTAREA)$/.test(a.tagName);
    var kl = String(k).toLowerCase();
    if (kl === 's') { stop(); var be = document.getElementById('m-enreg'); if (be && !be.disabled) enregistrer(be); return; }
    if (kl === 'n') { stop(); stNouveau(); return; }
    if (kl === 'p') { stop(); if (M.id && !TRACE) { var mid = M.id; M = null; ouvrirImpression(mid, 'biblio'); } return; }
    if (kl === 'z' && !ev.shiftKey && !champ) { stop(); annulerM(); return; }
    if ((kl === 'y' || (kl === 'z' && ev.shiftKey)) && !champ) { stop(); retablirM(); return; }
    if (k === '+' || k === '=') { stop(); stZoom(ZOOM * 1.25); return; }
    if (k === '-') { stop(); stZoom(ZOOM / 1.25); return; }
    if (k === '0') { stop(); stZoom(1); return; }
  }, true);

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
    if (!r || !r.ok) { z.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; if (ctrl) ctrl.innerHTML = ''; majEtat(); return; }
    var W, H, plan = document.getElementById('st-plan');
    if (plan) {
      // le plan de travail du studio : la feuille prend la place du plan (moins ses marges), multipliée par le zoom
      var mg = parseFloat(getComputedStyle(plan.firstElementChild).paddingLeft) || 22;
      // ⚠ à 100 %, le plan ne défile pas : un pixel de trop ferait naître une barre, qui rétrécirait le plan, etc.
      plan.style.overflow = ZOOM > 1 ? 'auto' : 'hidden';
      W = Math.floor(Math.max(260, plan.clientWidth - 2 * mg - 4) * ZOOM); H = Math.floor(Math.max(260, plan.clientHeight - 2 * mg - 4) * ZOOM);
      z.style.width = W + 'px'; z.style.height = H + 'px';
    } else { W = Math.max(200, z.clientWidth || 340); H = Math.max(200, z.clientHeight || 420); }
    var jeux;
    if (TOUTES && r.tailles) {
      jeux = [{ pieces: r.tailles[M.tailleBase] || r.pieces, trait: '#1C1B18', epais: 1.8 }];
      (M.tailles || []).forEach(function(t){
        if (t === M.tailleBase || !r.tailles[t]) return;
        jeux.push({ pieces: r.tailles[t], trait: '#8F897D', epais: 0.9, tirets: '4 3' });
      });
    } else jeux = [{ pieces: r.pieces }];
    z.innerHTML = svgPieces(jeux, W, H, { titre: TOUTES ? '${T("Toutes les tailles emboîtées")}' : '${T("Pièces de la taille")} ' + TAP });
    majEtat();
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
    else if (/^o-/.test(id) && id !== 'o-longueur') { M.options = M.options || {}; M.options[id.slice(2)] = cible.value; TRACE = true; demanderApercu(); }
    else if (id === 'o-longueur') { M.options = M.options || {}; var L = nombre(cible.value, NaN); if (isFinite(L)) { M.options.longueur = L; TRACE = true; demanderApercu(); } }
    else if (id.indexOf('a-') === 0 && id !== 'a-q') { var v = nombre(cible.value, NaN); if (isFinite(v)) { M.aisances[id.slice(2)] = v; TRACE = true; demanderApercu(); } }
    else if (cible.hasAttribute('data-t')) {
      var t = cible.getAttribute('data-t'), mk = cible.getAttribute('data-m'), x = nombre(cible.value, NaN);
      if (isFinite(x)) { M.tableau[t] = M.tableau[t] || {}; M.tableau[t][mk] = x; TRACE = true; demanderApercu(); }
    }
  }

  function enregistrer(btn){
    if (OCCUPE || !M) return;
    if (!String(M.nom || '').trim()) {
      dire(MOTIFS.nom, 'err'); var n = document.getElementById('m-nom');
      // le champ vit dans l onglet « Modèle » du studio : on l ouvre s il est caché
      if (!n && VUE === 'modele') { stMontrer('a', 'mod', 'm-nom'); return; }
      if (n) n.focus(); return;
    }
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
      relireDonnees().then(function(d){
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
        relireDonnees().then(function(d){
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
  /* LE MANNEQUIN FEMME / HOMME (2026-10-18) : retenu PAR MODÈLE, sur le poste ; le site bâtit le corps homme
     depuis son tableau standard homme (le patron, lui, garde ses mesures). */
  var STATURE3 = { femme: 165, homme: 178 };
  function genre3d(id){ try { var g = JSON.parse(localStorage.getItem('sz-atelier-genre') || '{}'); return g && g[id] === 'homme' ? 'homme' : 'femme'; } catch (e) { return 'femme'; } }
  function garderGenre3d(id, g){ try { var o = JSON.parse(localStorage.getItem('sz-atelier-genre') || '{}') || {}; if (g === 'homme') o[id] = g; else delete o[id]; localStorage.setItem('sz-atelier-genre', JSON.stringify(o)); } catch (e) {} }
  var VUES3 = [['fantome', '${T("Fantôme")}', 0, '${T("Comme un mannequin fantôme : de face, un peu d en haut, l intérieur visible par l encolure")}', 0.26], ['face', '${T("Face")}', 0], ['tq', '${T("3/4")}', 0.7, '${T("Trois-quarts")}'], ['profil', '${T("Profil")}', 1.5708], ['dos', '${T("Dos")}', 3.1416]];

  function ouvrir3d(id, retour){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (!m) { dire(MOTIFS.introuvable, 'err'); return; }
    SEL = id;
    var gen = genre3d(id);
    V3 = { id: id, m: m, retour: retour || 'biblio', taille: m.tailleBase || 'M', genre: gen, stature: STATURE3[gen], r: null, mesh: null,
      yaw: 0, pitch: 0.26, zoom: 1, px: 0, py: 0, carte: false, fil: false, auto: false, mannequin: (function(){ try { return localStorage.getItem('sz-atelier-mannequin') !== '0'; } catch (e) { return true; } })(), couleur: m.photo3d ? m.photo3d.couleur : COUL3[0][0], fond: 'beige', sale: true, photo: !!m.photo3d,
      outil: 'tourner', dec: { forme: 'rond', l: 3, h: 3 }, el: { type: 'perle', matiere: 'or', taille: 0.8 }, pile: [], dsale: false,
      design: { decoupes: ((m.design3d && m.design3d.decoupes) || []).slice(), elements: ((m.design3d && m.design3d.elements) || []).slice() } };
    /* ⚠ (2026-10-18, son bogue : « j ouvre un autre modèle en vue 3D, ça me ramène dans l ancien » — non reproduit au banc,
       correctif défensif) Le canevas WebGL est GARDÉ d une ouverture à l autre et garde sa dernière image (preserveDrawingBuffer) :
       si son contexte a été perdu sans que la perte soit encore signalée, rien ne s y redessinait, et le vêtement d AVANT restait
       sous l en-tête du nouveau. Donc : un contexte perdu n est pas repris (dessiner3d pose un canevas neuf) ; et l image d un
       AUTRE modèle est effacée tout de suite, la barre d état disant ce qui se charge. */
    if (GLV && GLV.gl && GLV.gl.isContextLost()) GLV = null;
    VUE = '3d'; dessiner();
    if (GLV && GLV.gl && GLV.dessineId !== id) { var gl0 = GLV.gl; gl0.clearColor(0, 0, 0, 0); gl0.clear(gl0.COLOR_BUFFER_BIT | gl0.DEPTH_BUFFER_BIT); GLV.dessineId = ''; }
    dire('${T("Chargement de « {0} »…")}'.split('{0}').join(m.nom || ''), 'att');
    charger3d();
  }
  // un canevas NEUF pour la vue 3D (nouvel élément, nouveau contexte) : l ancien ne se dessine plus (contexte perdu, ou pris en 2D)
  // ⚠ (2026-10-18, contrôle « contrastes » rouge en construction, Linux sans carte graphique) UNE SEULE fois par ouverture : un
  // contexte qui se reperd à chaque construction (WebGL logiciel trop lent) faisait reconstruire la scène sans fin (~2 s chaque fois),
  // et la page ne rendait jamais la main. Au-delà, la vue passe au dessin 2D (V3.glNon), qui finit toujours.
  function canevasNeuf3d(){
    var cv = document.getElementById('v3-canevas'); if (!cv || !cv.parentNode || !V3) return;
    V3.neufs = (V3.neufs || 0) + 1; if (V3.neufs > 1) V3.glNon = true;
    var nv = cv.cloneNode(false); cv.parentNode.replaceChild(nv, cv);
    if (GLV && GLV.cv === cv) GLV = null;
    if (V3.neufs <= 2) demander3d();
  }
  function charger3d(){
    var n = ++v3N;
    appeler('atelier:apercu3d', [{ id: V3.id, taille: V3.taille, stature: V3.stature, genre: V3.genre }]).then(function(r){
      if (n !== v3N || VUE !== '3d' || !V3) return;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      dire('');
      V3.r = r; V3.mesh = maillage(r); V3.sale = true; peindrePanneau3d(); peindreDesign3d(); entete3d(); imagesMotif3d(); demander3d();
      programmerVignette();
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




  /* ══ LA PLANCHE DE DESSIN (lot 8, 2026-10-17) ═══════════════════════════════
     Sa demande : « les planches de dessin et modèles pour la plupart des types de vêtements ».
     Le SITE dessine le croquis technique (devant, dos) depuis les pièces du modèle ; on dessine
     PAR-DESSUS au crayon, dans le même repère (le cm du croquis) — le dessin est enregistré avec
     le modèle et sort tel quel dans la planche PDF et la fiche technique. */
  var PL = null;
  var COUL_PL = ['#1C1B18', '#B4583C', '#1E3A5F', '#8FA58A', '#C9A9A6', '#F2C14E', '#7C3AED', '#2563EB'];
  var EP_PL = [['fin', '${T("Fin")}', 0.12], ['moyen', '${T("Moyen")}', 0.25], ['epais', '${T("Épais")}', 0.5]];
  function ouvrirPlanche(id, retour){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (!m) { dire(MOTIFS.introuvable, 'err'); return; }
    SEL = id;
    PL = { id: id, m: m, retour: retour || 'biblio', cq: null, traits: copie((m.planche && m.planche.traits) || []), note: (m.planche && m.planche.note) || '',
      outil: 'crayon', couleur: COUL_PL[0], ep: 'moyen', pile: [], sale: false, trait: null };
    VUE = 'planche'; dessiner();
    appeler('atelier:croquis', [{ id: id }]).then(function(r){
      if (!PL || PL.id !== id) return;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      PL.cq = r; peindrePL();
    });
  }
  function dessinerPlanche(){
    var m = PL.m;
    document.getElementById('titre').textContent = '${T("Planche de dessin")}';
    document.getElementById('sous').textContent = m.nom + (m.ref ? ' · ' + m.ref : '') + ' · v' + (m.version || 1) + (PL.sale ? ' · ${T("modifications non enregistrées")}' : '');
    document.getElementById('actions').innerHTML = '<button type="button" id="pl-retour">${T("← Bibliothèque")}</button>'
      + '<button type="button" id="pl-annuler" aria-label="${T("Annuler")}" title="${T("Annuler")}"' + (PL.pile.length ? '' : ' disabled') + '>↶</button>'
      + '<button type="button" id="pl-pdf">${T("Planche PDF")}</button>'
      + (D.peutModifier ? '<button type="button" class="prim" id="pl-enreg"' + (PL.sale ? '' : ' disabled') + '>${T("Enregistrer")}</button>' : '');
    var seg = function(attr, k, lib, on){ return '<button type="button" class="' + (on ? 'on' : '') + '" ' + attr + '="' + k + '">' + lib + '</button>'; };
    var g = '<div class="cx-carte"><h2>${T("Outil")}</h2><div class="ed-seg" role="group" aria-label="${T("Outil")}">'
      + seg('data-plout', 'crayon', '${T("Crayon")}', PL.outil === 'crayon') + seg('data-plout', 'gomme', '${T("Gomme")}', PL.outil === 'gomme') + '</div>'
      + '<div class="cx-sep"></div><h2>${T("Épaisseur")}</h2><div class="ed-seg" role="group" aria-label="${T("Épaisseur")}">'
      + EP_PL.map(function(e){ return seg('data-plep', e[0], e[1], PL.ep === e[0]); }).join('') + '</div>'
      + '<div class="cx-sep"></div><h2>${T("Couleur")}</h2><div class="v3-couleurs">'
      + COUL_PL.map(function(c){ return '<button type="button" class="' + (PL.couleur === c ? 'on' : '') + '" data-plc="' + c + '" aria-label="' + c + '" title="' + c + '" style="background:' + c + '"></button>'; }).join('') + '</div>'
      + '<div class="cx-sep"></div><div class="at-champs"><label class="large">${T("Notes de la planche")}<textarea id="pl-note" maxlength="2000">' + esc(PL.note) + '</textarea></label></div>'
      + '<div class="ed-gestes"><button type="button" class="mini danger" id="pl-effacer"' + (PL.traits.length ? '' : ' disabled') + '>${T("Effacer le dessin")}</button></div>'
      + '<div class="ed-note">${T("Le croquis vient du patron (taille de base) : retouchez le patron, le croquis suit. Le dessin se garde avec le modèle et sort dans la planche PDF et la fiche technique.")}</div></div>';
    var c = '<div class="mo-toile pl-toile" id="pl-toile"><svg id="pl-svg" role="img" aria-label="${T("Le croquis technique et le dessin")}"></svg></div>';
    corps.innerHTML = '<div class="pl-deux">' + g + c + '</div>';
    peindrePL();
    var tz = document.getElementById('pl-toile');
    if (window.ResizeObserver && tz) { if (window._plRO) window._plRO.disconnect(); window._plRO = new ResizeObserver(function(){ peindrePL(); }); window._plRO.observe(tz); }
  }
  function cheminTrait(t){ var d = ''; for (var i = 0; i + 1 < t.pts.length; i += 2) d += (i ? ' L' : 'M') + t.pts[i] + ' ' + t.pts[i + 1]; return d; }
  function svgTrait(t){ return '<path d="' + cheminTrait(t) + '" fill="none" stroke="' + t.c + '" stroke-width="' + t.e + '" stroke-opacity="' + (t.o == null ? 1 : t.o) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function peindrePL(){
    var svg = document.getElementById('pl-svg'), z = document.getElementById('pl-toile'); if (!svg || !z || !PL) return;
    var W = z.clientWidth || 800, H = z.clientHeight || 600;
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    if (!PL.cq) { svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = '<text x="' + W / 2 + '" y="' + H / 2 + '" text-anchor="middle" font-size="14" fill="#3F3A32" font-family="Segoe UI, sans-serif">${T("Croquis en préparation…")}</text>'; return; }
    var cq = PL.cq;
    svg.setAttribute('viewBox', '0 0 ' + cq.l + ' ' + cq.h); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = '<rect x="0" y="0" width="' + cq.l + '" height="' + cq.h + '" fill="#FFFFFF"/>' + cq.corps + PL.traits.map(svgTrait).join('') + (PL.trait ? svgTrait(PL.trait) : '');
  }
  // l écran → le repère du croquis (cm)
  function pointPL(ev){
    var svg = document.getElementById('pl-svg'); if (!svg || !svg.getScreenCTM) return null;
    var m = svg.getScreenCTM(); if (!m) return null;
    var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
    var q = p.matrixTransform(m.inverse());
    return { x: Math.round(q.x * 10) / 10, y: Math.round(q.y * 10) / 10 };
  }
  function memoPL(){ PL.pile.push(JSON.stringify(PL.traits)); if (PL.pile.length > 60) PL.pile.shift(); PL.sale = true; }
  function apresPL(){ dessinerPlanche(); }
  function gommerPL(q){
    var meilleur = -1, dm = 1e9;
    PL.traits.forEach(function(t, i){ for (var k = 0; k + 1 < t.pts.length; k += 2) { var d = Math.hypot(t.pts[k] - q.x, t.pts[k + 1] - q.y); if (d < dm) { dm = d; meilleur = i; } } });
    if (meilleur < 0 || dm > 1.2) return;
    memoPL(); PL.traits.splice(meilleur, 1); apresPL();
  }
  function enregistrerPL(){
    if (OCCUPE || !PL || !PL.sale) return;
    OCCUPE = true; dire('${T("Enregistrement…")}');
    appeler('atelier:ecrire', [{ id: PL.id, nom: PL.m.nom, planche: { traits: PL.traits, note: PL.note } }]).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      PL.sale = false; PL.pile = [];
      relireDonnees().then(function(d){
        if (d && d.ok) { D = d; var m = (D.modeles || []).filter(function(x){ return x.id === PL.id; })[0]; if (m && PL) PL.m = m; }
        if (VUE === 'planche' && PL) { dessinerPlanche(); dire('${T("Planche enregistrée.")}', 'bon'); }
      });
    });
  }
  function pdfPL(btn){
    if (OCCUPE || !PL) return;
    if (PL.sale) { dire('${T("Enregistrez d’abord la planche : le PDF reprend la version enregistrée.")}', 'att'); return; }
    if (!P || typeof P.enregistrerExport !== 'function' || typeof P.documentPdf !== 'function') { dire('${T("Cette version de l’application ne sait pas fabriquer de PDF.")}', 'err'); return; }
    OCCUPE = true; if (btn) btn.disabled = true;
    var fin = function(msg, cl){ OCCUPE = false; if (btn) btn.disabled = false; dire(msg, cl); };
    dire('${T("Préparation du fichier…")}');
    appeler('atelier:exporter', [{ id: PL.id, format: 'planche' }]).then(function(r){
      if (!r || !r.ok || !r.contenu) { fin(expliquer(r), 'err'); return; }
      Promise.resolve(P.documentPdf(r.contenu, { pageCss: true })).then(function(pdf){
        if (!pdf || !pdf.ok || !pdf.base64) { fin('${T("Le PDF n’a pas pu être fabriqué : {0}")}'.split('{0}').join((pdf && pdf.error) || '?'), 'err'); return; }
        Promise.resolve(P.enregistrerExport(r.nom, 'data:application/pdf;base64,' + pdf.base64)).then(function(w){
          if (w && w.ok) fin('${T("Enregistré : {0}")}'.split('{0}').join(w.path || r.nom), 'bon');
          else if (w && w.annule) fin('${T("Export annulé : le code d’export n’a pas été donné.")}', 'att');
          else fin('${T("L’enregistrement a échoué : {0}")}'.split('{0}').join((w && w.error) || '?'), 'err');
        });
      });
    });
  }
  function quitterPL(){
    var sortir = function(){ PL = null; if (window._plRO) { window._plRO.disconnect(); window._plRO = null; } VUE = 'biblio'; dessiner(); dire(''); };
    if (!PL || !PL.sale) { sortir(); return; }
    szConfirmer({ titre: '${T("Quitter sans enregistrer ?")}', texte: '${T("Le dessin de la planche sera perdu.")}', oui: '${T("Quitter")}', danger: true }).then(function(ok){ if (ok) sortir(); });
  }
  function clicPL(ev){
    var t = ev.target, b;
    if ((b = t.closest('[data-plout]'))) { PL.outil = b.getAttribute('data-plout'); dessinerPlanche(); return; }
    if ((b = t.closest('[data-plep]'))) { PL.ep = b.getAttribute('data-plep'); dessinerPlanche(); return; }
    if ((b = t.closest('[data-plc]'))) { PL.couleur = b.getAttribute('data-plc'); PL.outil = 'crayon'; dessinerPlanche(); return; }
    if (t.closest('#pl-effacer')) {
      szConfirmer({ titre: '${T("Effacer tout le dessin ?")}', texte: '${T("Le croquis reste ; seuls vos traits sont effacés (Annuler les rend).")}', oui: '${T("Effacer")}', danger: true }).then(function(ok){
        if (ok && PL) { memoPL(); PL.traits = []; apresPL(); } });
    }
  }
  function changePL(t){ if (t.id === 'pl-note') { if (t.value !== PL.note) { PL.note = t.value; PL.sale = true; dessinerPlanche(); } } }
  function annulerPL(){ if (!PL || !PL.pile.length) return; PL.traits = JSON.parse(PL.pile.pop()); PL.sale = true; apresPL(); }

  /* ══ LE PATRON DEPUIS UNE PHOTO (lot 7, 2026-10-17) ═══════════════════════
     Sa demande : « regénérer un patron à partir d une photo de vêtement sous mannequin fantôme,
     et ensuite utiliser le moteur 3D ». Le SITE lit la photo (silhouette, IA de vision) et propose
     une base, des options, des aisances ; la fenêtre MONTRE le patron proposé PAR-DESSUS la photo
     pour qu on l ajuste à l œil — c est un patron de même allure, pas le patron du fournisseur.
     « Créer le modèle » l enregistre avec la photo détourée, que l aperçu 3D plaque sur le devant. */
  var PH = null, PHIMG = {};
  var LTYPE7 = { '': '${T("Auto (IA)")}', robe: '${T("Robe")}', chemisier: '${T("Haut")}', tshirt: '${T("T-shirt")}', chemise: '${T("Chemise")}', jupe: '${T("Jupe")}', pantalon: '${T("Pantalon")}', jean: '${T("Jean")}' };
  var LNOTE7 = { echelle_poitrine: '${T("L’échelle est prise à la poitrine, en supposant son aisance habituelle : si le tracé déborde ou flotte partout, corrigez l’échelle.")}',
    echelle_taille: '${T("L’échelle est prise à la taille, en supposant son aisance habituelle : si le tracé déborde ou flotte partout, corrigez l’échelle.")}',
    taille_supposee: '${T("La taille ne se voit pas sur la photo (vêtement droit) : sa hauteur est supposée.")}',
    hanches_non_vues: '${T("Le vêtement s’arrête avant les hanches : leur aisance reste standard.")}',
    fourche_non_vue: '${T("La fourche ne se voit pas : la longueur de jambe reste celle du tableau.")}',
    dos_illisible: '${T("La photo de dos n’a pas pu être détourée : seul le devant sera plaqué.")}',
    dos_non_televerse: '${T("La photo de dos n’a pas pu être enregistrée : seul le devant sera plaqué.")}' };
  function ouvrirPhoto(){
    if (!D || !D.peutAjouter) return;
    PH = { produit: '', face: '', dos: '', choix: 'face', taille: 'M', type: '', r: null, ap: null, nom: '', occupe: false };
    VUE = 'photo'; dessiner();
  }
  function produitsAvecPhoto(){ return (D.produits || []).filter(function(p){ return (p.photos || []).length; }); }
  // une image https → un Image décodé (pour le canevas), mise en cache ; le rappel redessine
  function imagePH(url, rappel){
    if (!url) return null;
    var e = PHIMG[url];
    if (e && e.im) return e.im;
    if (e) return null;
    PHIMG[url] = { im: null };
    var poser = function(src){ if (!src) return; var im = new Image(); im.onload = function(){ PHIMG[url].im = im; if (rappel) rappel(); }; im.src = src; };
    if (/^data:/.test(url)) poser(url);
    else if (P && P.imageLocale) Promise.resolve(P.imageLocale(url)).then(poser);
    return null;
  }
  function dessinerPhoto(){
    document.getElementById('titre').textContent = '${T("Patron depuis une photo")}';
    document.getElementById('sous').textContent = '${T("Une photo sur mannequin fantôme, fond uni : le patron de même allure, puis le vêtement en 3D")}';
    document.getElementById('actions').innerHTML = '<button type="button" id="ph-retour">${T("← Bibliothèque")}</button>'
      + (PH.r ? '<button type="button" class="prim" id="ph-creer">${T("Créer le modèle")}</button>' : '');
    var seg = function(attr, k, lib, on){ return '<button type="button" class="' + (on ? 'on' : '') + '" ' + attr + '="' + k + '">' + lib + '</button>'; };
    var prods = produitsAvecPhoto(), pr = prods.filter(function(p){ return p.id === PH.produit; })[0];
    var g = '<div class="cx-carte"><h2>${T("Photo")}</h2><div class="at-champs">'
      + (LEGER ? '<label class="large">${T("Chercher un produit")}<input type="search" id="ph-prodq" data-prodq="ph-produit" maxlength="60" placeholder="${T("Nom ou SKU…")}"></label>' : '')
      + '<label class="large">${T("Produit de la boutique")}<select id="ph-produit"><option value="">${T("— Choisir un produit —")}</option>'
      + prods.map(function(p){ return '<option value="' + esc(p.id) + '"' + (PH.produit === p.id ? ' selected' : '') + '>' + esc(p.nom) + '</option>'; }).join('') + '</select></label></div>';
    if (pr) g += '<div class="ed-seg" role="group" aria-label="${T("Photo choisie")}" style="margin:.5rem 0">' + seg('data-phchoix', 'face', '${T("Face")}', PH.choix === 'face') + seg('data-phchoix', 'dos', '${T("Dos (facultatif)")}', PH.choix === 'dos') + '</div>'
      + '<div class="ph-vign">' + pr.photos.map(function(u){ var im = PHIMG[u] && PHIMG[u].im;
          return '<button type="button" data-phphoto="' + esc(u) + '" class="' + (PH.face === u ? 'face' : PH.dos === u ? 'dos' : '') + '" aria-label="${T("Choisir cette photo")}">'
            + (im ? '<img src="' + esc(im.src) + '" alt="">' : '<span class="ic">🖼</span>') + (PH.face === u ? '<b>${T("Face")}</b>' : PH.dos === u ? '<b>${T("Dos")}</b>' : '') + '</button>'; }).join('') + '</div>';
    g += '<div class="ed-gestes"><button type="button" class="mini" id="ph-deposer">${T("Déposer une photo…")}</button></div>'
      + '<input type="file" id="ph-fichier" accept=".png,.jpg,.jpeg,.webp" aria-label="${T("Choisir une photo")}" style="display:none">'
      + '<div class="cx-sep"></div><h2>${T("Taille photographiée")}</h2><div class="ed-seg" role="group" aria-label="${T("Taille photographiée")}">'
      + (D.tailles || []).map(function(t){ return seg('data-phtaille', t, esc(t), PH.taille === t); }).join('') + '</div>'
      + '<div class="cx-sep"></div><h2>${T("Type de vêtement")}</h2><div class="ed-seg" role="group" aria-label="${T("Type de vêtement")}">'
      + Object.keys(LTYPE7).map(function(k){ return seg('data-phtype', k, LTYPE7[k], PH.type === k); }).join('') + '</div>'
      + '<div class="ed-gestes" style="margin-top:.7rem"><button type="button" class="prim" id="ph-analyser"' + (PH.face && !PH.occupe ? '' : ' disabled') + '>${T("Analyser la photo")}</button></div>'
      + '<div class="ed-note">${T("Le fond doit être uni (blanc ou gris) : il est retiré pour lire la silhouette. L’IA de vision reconnaît le type, l’encolure et les manches ; les mesures viennent de la silhouette, à l’échelle de la taille photographiée.")}</div></div>';
    var c = '<div class="mo-toile" id="ph-toile"><svg id="ph-svg" role="img" aria-label="${T("La photo et le patron proposé")}"></svg></div>';
    var d = '<div class="cx-carte" id="ph-pan"></div>';
    corps.innerHTML = '<div class="mo-trois ph-trois">' + g + c + d + '</div>';
    peindrePH(); panneauPH();
    var tz = document.getElementById('ph-toile');
    if (window.ResizeObserver && tz) { if (window._phRO) window._phRO.disconnect(); window._phRO = new ResizeObserver(function(){ peindrePH(); }); window._phRO.observe(tz); }
  }
  function panneauPH(){
    var z = document.getElementById('ph-pan'); if (!z || !PH) return;
    var r = PH.r;
    if (PH.occupe) { z.innerHTML = '<h2>${T("Patron proposé")}</h2><div class="sz-squel" role="status" aria-label="${T("Analyse en cours")}"><i></i><i></i><i></i></div><div class="ed-note">${T("Lecture de la silhouette et de l’IA de vision…")}</div>'; return; }
    if (!r) { z.innerHTML = '<h2>${T("Patron proposé")}</h2><div class="cx-sub">${T("Choisissez une photo de face, puis « Analyser la photo ».")}</div>'; return; }
    var seg = function(attr, k, lib, on){ return '<button type="button" class="' + (on ? 'on' : '') + '" ' + attr + '="' + k + '">' + lib + '</button>'; };
    var nb = function(v){ return esc(String(v).replace('.', '${SEP_DEC()}')); };
    var o = r.options || {}, a = r.aisances || {}, opt = D.options || {};
    var h = '<h2>${T("Patron proposé")}</h2><div class="ed-seg" role="group" aria-label="${T("Base")}">'
      + (D.bases || []).filter(function(b){ return ['haut', 'jupe', 'bas'].indexOf(b.famille) >= 0; }).map(function(b){ return seg('data-phbase', b.cle, LBASE[b.cle] || szTd(b.nom), r.base === b.cle); }).join('') + '</div>'
      + '<div class="at-champs" style="margin-top:.5rem"><label class="large">${T("Nom")}<input type="text" id="ph-nom" maxlength="80" value="' + esc(PH.nom) + '"></label>';
    var choix = function(id, liste, val){ return '<select id="' + id + '">' + (liste || []).map(function(x){ return '<option value="' + esc(x.cle) + '"' + (val === x.cle ? ' selected' : '') + '>' + esc(szTd(x.nom)) + '</option>'; }).join('') + '</select>'; };
    var bph = (D.bases || []).filter(function(x){ return x.cle === r.base; })[0] || {}, chph = bph.choix || {};
    Object.keys(chph).forEach(function(k){ var l = LOPT[chph[k]]; if (l) h += '<label>' + (LCH[k] || k) + '<select id="ph-opt-' + k + '">' + Object.keys(l).map(function(c){ return '<option value="' + c + '"' + (o[k] === c ? ' selected' : '') + '>' + l[c] + '</option>'; }).join('') + '</select></label>'; });
    h += '<label>' + (bph.famille === 'bas' ? '${T("Entrejambe (cm)")}' : bph.famille === 'jupe' ? '${T("Longueur (cm)")}' : '${T("Sous la taille (cm)")}') + '<input type="text" id="ph-longueur" inputmode="decimal" maxlength="5" value="' + nb(o.longueur || 0) + '"></label>'
      + '<label>${T("Échelle (px/cm)")}<input type="text" id="ph-k" inputmode="decimal" maxlength="6" value="' + nb(r.face.k) + '"></label>'
      + '<label>${T("Aisance poitrine")}<input type="text" id="ph-ap" inputmode="decimal" maxlength="4" value="' + nb(a.poitrine) + '"></label>'
      + '<label>${T("Aisance taille")}<input type="text" id="ph-at" inputmode="decimal" maxlength="4" value="' + nb(a.taille) + '"></label>'
      + '<label>${T("Aisance hanches")}<input type="text" id="ph-ah" inputmode="decimal" maxlength="4" value="' + nb(a.hanches) + '"></label></div>'
      + '<div class="cx-sub" style="margin-top:.4rem">' + (r.ia && r.ia.type ? '${T("IA de vision : {0}.")}'.split('{0}').join(esc(LTYPE7[{ haut: 'chemisier' }[r.ia.type] || r.ia.type] || szTd(r.ia.type))) : '${T("IA de vision indisponible : le type vient de votre choix.")}') + '</div>';
    (r.notes || []).forEach(function(n){ if (LNOTE7[n]) h += '<div class="ed-note">' + LNOTE7[n] + '</div>'; });
    h += '<div class="ed-note">${T("Le tracé bleu est le devant proposé, à l’échelle de la photo. Corrigez les aisances, la longueur ou l’échelle jusqu’à ce qu’il épouse la silhouette.")}</div>';
    z.innerHTML = h;
  }
  /* La toile : la photo (détourée après analyse), et le devant proposé par-dessus — déplié au pli. */
  function peindrePH(){
    var z = document.getElementById('ph-toile'), svg = document.getElementById('ph-svg'); if (!z || !svg || !PH) return;
    var W = z.clientWidth || 800, H = z.clientHeight || 600, r = PH.r, s = '';
    var url = r ? r.face.url : PH.face, im = imagePH(url, function(){ if (VUE === 'photo') { peindrePH(); if (!r) dessinerPhoto(); } });
    var l = r ? r.face.l : (im ? im.naturalWidth : 0), h = r ? r.face.h : (im ? im.naturalHeight : 0);
    if (!url) s = '<text x="' + W / 2 + '" y="' + H / 2 + '" text-anchor="middle" font-size="14" fill="#3F3A32" font-family="Segoe UI, sans-serif">${T("Choisissez la photo de face du vêtement.")}</text>';
    else if (!im || !l) s = '<text x="' + W / 2 + '" y="' + H / 2 + '" text-anchor="middle" font-size="14" fill="#3F3A32" font-family="Segoe UI, sans-serif">${T("Chargement de la photo…")}</text>';
    else {
      var f = Math.min((W - 40) / l, (H - 40) / h), ox = (W - l * f) / 2, oy = (H - h * f) / 2;
      s += '<image href="' + im.src + '" x="' + ox + '" y="' + oy + '" width="' + l * f + '" height="' + h * f + '"/>';
      var dv = PH.ap && (PH.ap.pieces || []).filter(function(p){ return p.id === 'devant'; })[0];
      if (r && dv) {
        var k = r.face.k, X = function(v){ return Math.round((ox + (r.face.cx + v * k) * f) * 10) / 10; }, Y = function(v){ return Math.round((oy + (r.face.haut + v * k) * f) * 10) / 10; };
        var axe = dv.pli || { a: { x: 0, y: 0 }, b: { x: 0, y: 1 } };
        var mir = dv.contour.map(function(q){ var m = reflet(q, axe); if (q.c1 && q.c2) { m.c1 = reflet(q.c1, axe); m.c2 = reflet(q.c2, axe); } return m; });
        s += '<path d="' + cheminPiece(dv.contour, X, Y) + ' ' + cheminPiece(mir, X, Y) + '" fill="rgba(37,99,235,.10)" stroke="#1D4ED8" stroke-width="2" stroke-linejoin="round"/>';
      }
    }
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = s;
  }
  // le devant proposé, retracé par le site à chaque réglage (atelier:apercu ne crée rien)
  var phN = 0;
  function retracerPH(){
    if (!PH || !PH.r) return;
    var n = ++phN, r = PH.r;
    appeler('atelier:apercu', [{ base: r.base, options: r.options, aisances: r.aisances, taille: r.taille, tableau: D.standard }]).then(function(a){
      if (n !== phN || !PH || VUE !== 'photo') return;
      if (a && a.ok) { PH.ap = a; peindrePH(); } else dire(expliquer(a), 'err');
    });
  }
  function analyserPH(){
    if (!PH || !PH.face || PH.occupe) return;
    PH.occupe = true; PH.r = null; PH.ap = null; dessinerPhoto(); dire('${T("Analyse de la photo…")}');
    appeler('atelier:depuisPhoto', [{ face: PH.face, dos: PH.dos || '', taille: PH.taille, base: PH.type || '', tableau: D.standard }]).then(function(r){
      if (!PH) return;
      PH.occupe = false;
      if (!r || !r.ok) { dessinerPhoto(); dire(r && r.motif === 'type_inconnu' ? '${T("L’IA n’a pas reconnu le type : choisissez-le, puis analysez de nouveau.")}' : r && r.motif === 'fond_non_uni' ? '${T("Le fond de la photo n’est pas uni : le vêtement ne se détache pas.")}' : expliquer(r), 'err'); return; }
      PH.r = r; if (!PH.nom) { var pr = (D.produits || []).filter(function(p){ return p.id === PH.produit; })[0]; PH.nom = r.nom || (pr ? pr.nom : '') || LTYPE7[r.base]; }
      dessinerPhoto(); retracerPH(); dire('${T("Patron proposé : ajustez-le sur la photo, puis « Créer le modèle ».")}', 'bon');
    });
  }
  function creerPH(){
    if (!PH || !PH.r || OCCUPE) return;
    var r = PH.r, nom = String(PH.nom || '').trim();
    if (!nom) { dire('${T("Donnez un nom au modèle.")}', 'err'); return; }
    OCCUPE = true; dire('${T("Enregistrement…")}');
    appeler('atelier:ecrire', [{ nom: nom, base: r.base, categorie: r.categorie, options: r.options, aisances: r.aisances, tailleBase: r.taille,
      produitId: PH.produit || '', photo3d: { face: r.face, dos: r.dos, couleur: r.couleur }, notes: '${T("Tiré d’une photo (lot 7).")}' }]).then(function(w){
      OCCUPE = false;
      if (!w || !w.ok) { dire(expliquer(w), 'err'); return; }
      var id = w.id || (w.entree && w.entree.id);
      relireDonnees(id ? [id] : []).then(function(d){
        if (d && d.ok) D = d;
        PH = null; if (window._phRO) { window._phRO.disconnect(); window._phRO = null; }
        if (id) ouvrir3d(id, 'biblio'); else { VUE = 'biblio'; dessiner(); }
        dire('${T("Modèle créé depuis la photo.")}', 'bon');
      });
    });
  }
  function quitterPH(){ PH = null; if (window._phRO) { window._phRO.disconnect(); window._phRO = null; } VUE = 'biblio'; dessiner(); dire(''); }
  function clicPH(ev){
    var t = ev.target, b;
    if ((b = t.closest('[data-phchoix]'))) { PH.choix = b.getAttribute('data-phchoix'); dessinerPhoto(); return; }
    if ((b = t.closest('[data-phphoto]'))) {
      var u = b.getAttribute('data-phphoto');
      if (PH.choix === 'dos') PH.dos = PH.dos === u ? '' : u; else { PH.face = u; if (PH.dos === u) PH.dos = ''; }
      PH.r = null; PH.ap = null; dessinerPhoto(); return;
    }
    if ((b = t.closest('[data-phtaille]'))) { PH.taille = b.getAttribute('data-phtaille'); PH.r = null; dessinerPhoto(); return; }
    if ((b = t.closest('[data-phtype]'))) { PH.type = b.getAttribute('data-phtype'); PH.r = null; dessinerPhoto(); return; }
    if ((b = t.closest('[data-phbase]'))) { PH.type = b.getAttribute('data-phbase'); analyserPH(); return; }
    if (t.closest('#ph-deposer')) { var f = document.getElementById('ph-fichier'); if (f) { f.value = ''; f.click(); } return; }
    if (t.closest('#ph-analyser')) { analyserPH(); return; }
  }
  function changePH(t){
    var r = PH.r, v = parseFloat(String(t.value).replace(',', '.'));
    if (t.id === 'ph-produit') { PH.produit = t.value; var pr = (D.produits || []).filter(function(p){ return p.id === t.value; })[0];
      PH.face = pr && pr.photos[0] || ''; PH.dos = ''; PH.choix = 'face'; PH.r = null; PH.ap = null; PH.nom = pr ? pr.nom : ''; dessinerPhoto(); return; }
    if (t.id === 'ph-fichier') {
      var fi = t.files && t.files[0]; if (!fi) return;
      if (fi.size > 20 * 1024 * 1024) { dire('${T("Une photo de 20 Mo au plus.")}', 'err'); return; }
      var lect = new FileReader();
      lect.onload = function(){ var d = String(lect.result || ''); if (PH.choix === 'dos') PH.dos = d; else PH.face = d; PH.r = null; PH.ap = null; dessinerPhoto(); };
      lect.readAsDataURL(fi); return;
    }
    if (t.id === 'ph-nom') { PH.nom = t.value; return; }
    if (!r) return;
    var borne = function(x, a, b){ return Math.max(a, Math.min(b, Math.round(x * 100) / 100)); };
    if (t.id.indexOf('ph-opt-') === 0) r.options[t.id.slice(7)] = t.value;
    else if (!isFinite(v)) { panneauPH(); return; }
    else if (t.id === 'ph-longueur') r.options.longueur = borne(v, 0, 160);
    else if (t.id === 'ph-k') { var k0 = r.face.k; r.face.k = borne(v, 0.05, 500); if (r.dos) r.dos.k = Math.round(r.dos.k * r.face.k / k0 * 1000) / 1000; }
    else if (t.id === 'ph-ap') r.aisances.poitrine = borne(v, 0, 40);
    else if (t.id === 'ph-at') r.aisances.taille = borne(v, 0, 40);
    else if (t.id === 'ph-ah') r.aisances.hanches = borne(v, 0, 40);
    panneauPH(); retracerPH(); peindrePH();
  }


  /* ══ LES RENDUS 3D VERS LA FICHE PRODUIT (2026-10-17) ═══════════════════════
     Sa question : « va-t-on pouvoir utiliser notre moteur 3D pour générer les photos des
     vêtements dans les fiches produit au lieu de payer fal.ai ? » — pour les vêtements de
     l Atelier, oui, et sans frais. Le moteur rend chaque vue à 1200 × 1600 (le format 3:4 de
     la boutique), sur fond blanc ; le SITE les range parmi les photos du produit, sans jamais
     écraser une photo de la personne (les rendus envoyés avant sont remplacés). */
  var VUES_FICHE = [['face', '${T("Face")}', 0, 0.06], ['tq', '${T("3/4")}', 0.6, 0.1], ['dos', '${T("Dos")}', Math.PI, 0.06]];
  function rendreVues3d(cles, fantome, taille, fond, marge){
    var cv = GLV && GLV.cv; if (!cv || !plaque3d() || !GLV.h) return [];
    var sauve = { yaw: V3.yaw, pitch: V3.pitch, zoom: V3.zoom, px: V3.px, py: V3.py, carte: V3.carte, fil: V3.fil, mannequin: V3.mannequin };
    if (fantome) V3.mannequin = false;
    var W = taille ? taille[0] : 1200, H = taille ? taille[1] : 1600, out = [];
    V3.carte = false; V3.fil = false; V3.px = 0; V3.py = 0;
    V3.zoom = H * 0.8 * Math.max(GLV.minH || 120, GLV.h) / (GLV.h * W * 0.85) * (marge || 1);
    VUES_FICHE.filter(function(v){ return cles.indexOf(v[0]) >= 0; }).forEach(function(v){
      V3.yaw = v[2]; V3.pitch = v[3] + (fantome ? 0.22 : 0);
      peindreGL(cv, { W: W, H: H });
      var c2 = document.createElement('canvas'); c2.width = W; c2.height = H;
      var g = c2.getContext('2d'); g.fillStyle = fond || '#FFFFFF'; g.fillRect(0, 0, W, H); g.drawImage(cv, 0, 0, W, H);
      out.push(c2.toDataURL('image/jpeg', W < 600 ? 0.82 : 0.92));
    });
    Object.keys(sauve).forEach(function(k){ V3[k] = sauve[k]; });
    peindreGL(cv);
    return out;
  }
  /* LA VIGNETTE DU VÊTEMENT (2026-10-17, sa remarque : « tu n as pas mis la vraie vignette du vêtement avec le
     logo ») : à l ouverture de la 3D (motif chargé) et après chaque enregistrement, un petit rendu de face part au
     site — la bibliothèque montre alors le vêtement tel qu il est. Un rendu réaliste choisi n est pas écrasé. */
  var VIGT = null;
  function programmerVignette(){
    if (VIGT) clearTimeout(VIGT);
    VIGT = setTimeout(function(){
      VIGT = null;
      if (!V3 || VUE !== '3d' || !D.peutModifier || !plaque3d() || V3.m.vignetteSource === 'ia') return;
      if (Object.keys(MOIMG).some(function(k){ return MOIMG[k] === 'chargement'; })) { programmerVignette(); return; }
      var img = rendreVues3d(['face'], false, [300, 400], '#F3EEE5')[0], id = V3.id; if (!img) return;
      appeler('atelier:vignette', [{ id: id, image: img, source: 'moteur' }]).then(function(r){
        if (r && r.ok && !r.garde) (D.modeles || []).forEach(function(x){ if (x.id === id) x.vignette = '<img class="vigp" src="' + img + '" alt="">'; });
      });
    }, 1800);
  }

  /* « Rendu photo (The New Black) », depuis le menu ou la barre : la VUE PRINCIPALE de l aperçu, panneau de génération
     ouvert (2026-10-19, sa décision — voir peindreTnb3d). */
  function ouvrirRenduIa(){ if (!V3) return; V3.technique = false; V3.vuePrinc = 'photo'; RP.panneau = true; peindreTnb3d(); }
  // une image (adresse ou data:) : petite vignette 300 × 400, recadrée au centre — et l envoi vers la fiche produit
  function vignetteDepuis(src){
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function(){
        var c = document.createElement('canvas'); c.width = 300; c.height = 400;
        var k = Math.max(300 / im.width, 400 / im.height), w = im.width * k, h = im.height * k;
        c.getContext('2d').drawImage(im, (300 - w) / 2, (400 - h) / 2, w, h);
        var d; try { d = c.toDataURL('image/jpeg', 0.82); } catch (e) { dire('${T("Cette image ne peut pas devenir une vignette.")}', 'err'); return; }
        var id = V3.id;
        appeler('atelier:vignette', [{ id: id, image: d, source: 'ia' }]).then(function(r){
          if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
          if (V3) V3.m.vignetteSource = 'ia';
          (D.modeles || []).forEach(function(x){ if (x.id === id) { x.vignette = '<img class="vigp" src="' + d + '" alt="">'; x.vignetteSource = 'ia'; } });
          dire('${T("Vignette du modèle mise à jour.")}', 'bon');
        });
      };
      im.onerror = function(){ dire('${T("Cette image ne peut pas devenir une vignette.")}', 'err'); };
      im.src = src;
  }
  function versFiche(src){
      var prods = D.produits || [], pid = V3.m.produitId && prods.some(function(p){ return p.id === V3.m.produitId; }) ? V3.m.produitId : (prods[0] && prods[0].id);
      if (!pid || OCCUPE) return;
      var envoi = function(d){
        OCCUPE = true; dire('${T("Envoi des rendus…")}');
        appeler('atelier:envoyerFiche', [{ id: V3.id, produitId: pid, images: [d], principale: false }]).then(function(r){
          OCCUPE = false;
          if (!r || !r.ok) { dire(r && r.motif === 'trop_de_photos' ? '${T("La fiche n’a plus de place pour une photo.")}' : expliquer(r), 'err'); return; }
          var pr = prods.filter(function(p){ return p.id === r.produitId; })[0];
          dire('${T("{0} rendu(s) ajouté(s) à la fiche « {1} ».")}'.split('{0}').join(r.envoyees).split('{1}').join(pr ? pr.nom : r.produitId), 'bon');
        });
      };
      if (src.indexOf('data:image/jpeg') === 0 || src.indexOf('data:image/png') === 0) { envoi(src); return; }
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function(){ var c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); try { envoi(c.toDataURL('image/jpeg', 0.92)); } catch (e) { dire('${T("Cette image ne peut pas être envoyée.")}', 'err'); } };
      im.onerror = function(){ dire('${T("Cette image ne peut pas être envoyée.")}', 'err'); };
      im.src = src;
  }
  function ouvrirEnvoiFiche(){
    if (!V3 || !plaque3d() || OCCUPE) return;
    var prods = D.produits || [];
    if (!prods.length) { dire('${T("Aucun produit dans la boutique : créez d’abord la fiche du vêtement.")}', 'att'); return; }
    var st = { produit: V3.m.produitId && prods.some(function(p){ return p.id === V3.m.produitId; }) ? V3.m.produitId : prods[0].id, vues: ['face', 'tq', 'dos'], fantome: true, principale: false, images: [] };
    var v = document.createElement('div'); v.className = 'szc-voile';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    var peindre = function(){
      st.images = rendreVues3d(st.vues, st.fantome);
      v.innerHTML = '<div class="szc-boite v3-fiche" role="dialog" aria-modal="true" aria-labelledby="v3f-t"><h3 id="v3f-t">${T("Envoyer les rendus vers la fiche produit")}</h3>'
        + '<p>${T("Rendus du moteur 3D, à 1200 × 1600 sur fond blanc, sans frais. Les rendus envoyés avant à ce produit sont remplacés ; vos photos ne sont jamais écrasées.")}</p>'
        + '<div class="at-champs"><label class="large">${T("Produit de la boutique")}<select id="v3f-produit">' + prods.map(function(p){ return '<option value="' + esc(p.id) + '"' + (st.produit === p.id ? ' selected' : '') + '>' + esc(p.nom) + '</option>'; }).join('') + '</select></label></div>'
        + '<div class="im-cases">' + VUES_FICHE.map(function(x){ return '<label><input type="checkbox" data-v3fv="' + x[0] + '"' + (st.vues.indexOf(x[0]) >= 0 ? ' checked' : '') + '>' + x[1] + '</label>'; }).join('')
        + '<label><input type="checkbox" id="v3f-fantome"' + (st.fantome ? ' checked' : '') + '>${T("Style mannequin fantôme")}</label>'
        + '<label><input type="checkbox" id="v3f-principale"' + (st.principale ? ' checked' : '') + '>${T("Le premier rendu devient la photo principale")}</label></div>'
        + '<div class="v3f-vign">' + st.images.map(function(d){ return '<img src="' + d + '" alt="">'; }).join('') + (st.images.length ? '' : '<span class="cx-sub">${T("Choisissez au moins une vue.")}</span>') + '</div>'
        + '<div class="szc-pied"><button type="button" class="szc-non">${T("Annuler")}</button><button type="button" class="szc-oui"' + (st.images.length ? '' : ' disabled') + '>' + '${T("Envoyer {0} rendu(s)")}'.split('{0}').join(st.images.length) + '</button></div></div>';
      v.querySelector('.szc-non').onclick = fermer;
      v.querySelector('.szc-oui').onclick = envoyer;
      v.querySelector('#v3f-produit').onchange = function(ev){ st.produit = ev.target.value; };
      Array.prototype.forEach.call(v.querySelectorAll('[data-v3fv]'), function(c){ c.onchange = function(){ var k = c.getAttribute('data-v3fv'); st.vues = c.checked ? st.vues.concat([k]) : st.vues.filter(function(x){ return x !== k; }); st.vues = VUES_FICHE.map(function(x){ return x[0]; }).filter(function(x){ return st.vues.indexOf(x) >= 0; }); peindre(); }; });
      v.querySelector('#v3f-fantome').onchange = function(ev){ st.fantome = ev.target.checked; peindre(); };
      v.querySelector('#v3f-principale').onchange = function(ev){ st.principale = ev.target.checked; };
    };
    var envoyer = function(){
      if (!st.images.length || OCCUPE) return;
      OCCUPE = true; var b = v.querySelector('.szc-oui'); if (b) b.disabled = true;
      dire('${T("Envoi des rendus…")}');
      appeler('atelier:envoyerFiche', [{ id: V3.id, produitId: st.produit, images: st.images, principale: st.principale }]).then(function(r){
        OCCUPE = false;
        if (!r || !r.ok) {
          if (b) b.disabled = false;
          dire(r && r.motif === 'trop_de_photos' ? '${T("La fiche n’a de place que pour {0} rendu(s) : envoyez moins de vues, ou retirez des photos de la fiche.")}'.split('{0}').join(r.places || 0) : expliquer(r), 'err');
          return;
        }
        fermer();
        var pr = prods.filter(function(p){ return p.id === r.produitId; })[0];
        dire('${T("{0} rendu(s) ajouté(s) à la fiche « {1} ».")}'.split('{0}').join(r.envoyees).split('{1}').join(pr ? pr.nom : r.produitId) + (r.principale ? ' ${T("Le premier est la photo principale.")}' : ''), 'bon');
      });
    };
    v.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') fermer(); });
    v.addEventListener('mousedown', function(ev){ if (ev.target === v) fermer(); });
    peindre();
  }

  /* ══ LE MOTEUR WebGL (lot 6, 2026-10-17 — sa décision : « moteur 3D au poste ») ══════════════
     Sa demande : « la même qualité que ce que fal.ai génère, avec plus de détail, surtout une
     reproduction FIDÈLE de l image que nous allons créer sur le vêtement, et la possibilité de
     designer le vêtement : faire des trous, insérer des éléments comme des bijoux ».
     ⚠ LES PIÈCES SONT PLAQUÉES SUR LA FORME : chaque point de la surface EST un point (x, y) du
     patron (le site donne, anneau par anneau, sa hauteur dans le patron et les bords du devant et du
     dos). Le tissu, le motif posé et les découpes sont PEINTS dans une texture par pièce, au même
     dessin que le fichier d impression (calqueSvg) : ce qui est hors de la pièce — encolure,
     emmanchures, trous — n est pas dessiné. Les éléments (perles, strass…) sont de petits objets
     posés sur la surface, tournés selon sa normale.
     ⚠ Sans WebGL, ou pour un pantalon (les jambes ne se plaquent pas encore), la peinture 2D d avant
     reprend la main — rien ne disparaît. */
  var GLV = null, GL_DISPO = null;
  /* LE BANC DE RENDU (tools/banc-3d-haut.js, 2026-10-18) : sa page d essai pose window.__szBanc3d AVANT le chargement ;
     elle lit l état du moteur, repeint à la demande et passe le tissu en mode DIAGNOSTIC (endroit vert, envers rouge,
     sans lumière ni mannequin) pour compter les fentes au pixel près. En usage normal, rien de tout cela n existe. */
  if (window.__szBanc3d) window.__szBanc3d.moteur = { v3: function(){ return V3; }, glv: function(){ return GLV; },
    peindre: function(){ peindre3d(); }, tubes: function(){ return corpsDrape((V3 && V3.r && V3.r.corps) || []); },
    diag: function(on){ if (GLV) GLV.diag = !!on; },
    // (tools/banc-atelier-3d-modeles.js) la vue courante, la sélection, la mini-vue de la fiche
    vue: function(){ return VUE; }, sel: function(){ return SEL; }, mini: function(){ return MINI; } };
  var MAT3 = { or: [0.83, 0.66, 0.26, 1, 60], argent: [0.80, 0.81, 0.84, 1, 80], nacre: [0.94, 0.91, 0.86, 0.25, 40], noir: [0.07, 0.07, 0.08, 0, 90], cristal: [0.86, 0.93, 1.0, 0.7, 140] };
  function webglDispo(){
    if (GL_DISPO !== null) return GL_DISPO;
    try { var c = document.createElement('canvas'), g = c.getContext('webgl'); GL_DISPO = !!g; var x = g && g.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); }
    catch (e) { GL_DISPO = false; }
    return GL_DISPO;
  }
  function plaque3d(){ return !!(V3 && V3.r && V3.r.plaquage === 'oui' && (V3.r.pieces || []).length && !V3.glNon && webglDispo()); }

  /* ── Petits calculs ── */
  function sub3(a, b){ return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function croix3(a, b){ return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function pt3(a, b){ return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function unit3(a){ var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function mul4(a, b){ var o = []; for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) { var s = 0; for (var k = 0; k < 4; k++) s += a[r * 4 + k] * b[k * 4 + c]; o.push(s); } return o; }
  function col4(a){ var o = new Float32Array(16); for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) o[c * 4 + r] = a[r * 4 + c]; return o; }
  function col3(R){ var o = new Float32Array(9); for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) o[c * 3 + r] = R[r][c]; return o; }
  function mul3(A, B){ var o = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) o[r][c] = A[r][0] * B[0][c] + A[r][1] * B[1][c] + A[r][2] * B[2][c]; return o; }
  function sombre(hx, k){ var c = hex(hx); return 'rgb(' + Math.round(c[0] * k) + ',' + Math.round(c[1] * k) + ',' + Math.round(c[2] * k) + ')'; }

  /* La longueur d arc d une ellipse (ra sur l axe de départ, rb sur l autre) : 128 pas. */
  function tableArc(ra, rb){
    var n = 128, L = [0], px = ra, pz = 0;
    for (var i = 1; i <= n; i++) { var t = 2 * Math.PI * i / n, x = ra * Math.cos(t), z = rb * Math.sin(t); L.push(L[i - 1] + Math.hypot(x - px, z - pz)); px = x; pz = z; }
    return L;
  }
  function angleArc(L, s){
    var n = L.length - 1, C = L[n]; s = ((s % C) + C) % C;
    var lo = 0, hi = n; while (hi - lo > 1) { var mi = (lo + hi) >> 1; if (L[mi] <= s) lo = mi; else hi = mi; }
    return 2 * Math.PI * (lo + (s - L[lo]) / Math.max(1e-6, L[hi] - L[lo])) / n;
  }

  /* ── La pièce dépliée : son contour (et son miroir si elle est coupée au pli), son cadre ── */
  // ⚠ le devant et le dos sont des DEMI-pièces : au pli, ou coupées deux fois (milieu dos cousu) — on les déplie toujours
  function depliee(p){
    // ⚠ un pantalon n est PAS fait de demi-pièces : chaque jambe est une pièce entière — on ne la déplie pas
    var axe = p.aupli && p.pli ? p.pli : ((p.id === 'devant' || p.id === 'dos') && fam3d() !== 'bas') ? (p.pli || { a: { x: 0, y: 0 }, b: { x: 0, y: 1 } }) : null;
    var mir = axe ? p.contour.map(function(q){ var r = reflet(q, axe); if (q.c1 && q.c2) { r.c1 = reflet(q.c1, axe); r.c2 = reflet(q.c2, axe); } return r; }) : null;
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    p.contour.concat(mir || []).forEach(function(q){ [q, q.c1, q.c2].forEach(function(z){ if (!z) return; x0 = Math.min(x0, z.x); y0 = Math.min(y0, z.y); x1 = Math.max(x1, z.x); y1 = Math.max(y1, z.y); }); });
    return { p: p, mir: mir, axe: axe, bb: { x0: x0 - 1, y0: y0 - 1, x1: x1 + 1, y1: y1 + 1 } };
  }
  function tracerC(g, c){
    g.moveTo(c[0].x, c[0].y);
    for (var n = 1; n <= c.length; n++) { var z = c[n % c.length]; if (z.c1 && z.c2) g.bezierCurveTo(z.c1.x, z.c1.y, z.c2.x, z.c2.y, z.x, z.y); else g.lineTo(z.x, z.y); }
    g.closePath();
  }
  // les bords, SAUF celui du pli (le tissu y continue)
  /* Le segment k (de c[k] à c[k+1]) est-il COUSU ? Les mêmes bords que bordsCousus. */
  function segCousu(pid, k, n){
    var fam = fam3d();
    if (fam === 'haut' && (pid === 'devant' || pid === 'dos') && n >= 6) return k >= 1 && k <= n - 3;
    if (fam === 'haut' && pid === 'manche' && n >= 5) return k <= 2 || k >= 4;
    if (fam === 'jupe' && (pid === 'devant' || pid === 'dos') && n >= 4) return k >= 1 && k <= 2;
    return false;
  }
  function tracerBords(g, c, pli, pid){
    // la PATTE de boutonnage (bord vertical près du milieu) n a pas de trait : il faisait une bande sombre au milieu
    var patte = function(a, z){ return Math.abs(a.x - z.x) < 0.01 && Math.abs(a.x) > 0.5 && Math.abs(a.x) < 3.5; };
    var surPli = function(q){ if (!pli) return false; var dx = pli.b.x - pli.a.x, dy = pli.b.y - pli.a.y, l = Math.hypot(dx, dy) || 1; return Math.abs((q.x - pli.a.x) * dy - (q.y - pli.a.y) * dx) / l < 0.05; };
    g.moveTo(c[0].x, c[0].y);
    for (var n = 1; n <= c.length; n++) {
      var a = c[n - 1], z = c[n % c.length];
      /* ⚠ (2026-10-18, ses captures : « on voit encore les coutures ») PAS DE TRAIT SUR UN BORD COUSU : chaque pièce
         traçait son ombre de bord, et deux traits côte à côte faisaient une ligne sombre le long de l emmanchure, de
         l épaule et du côté. Le trait ne reste que sur les bords COUPÉS (ourlet, encolure, bas de manche). */
      if ((surPli(a) && surPli(z)) || patte(a, z) || (pid && segCousu(pid, n - 1, c.length))) { g.moveTo(z.x, z.y); continue; }
      if (z.c1 && z.c2) g.bezierCurveTo(z.c1.x, z.c1.y, z.c2.x, z.c2.y, z.x, z.y); else g.lineTo(z.x, z.y);
    }
  }
  /* Le contour d une découpe — LE MÊME que contourDecoupe du site (qui le trace dans le patron). */
  function contourDecoupeF(d){
    var pts = [], n = 32, K = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (var i = 0; i < n; i++) {
      var t = 2 * Math.PI * i / n;
      if (d.forme === 'rect') { var k = K[Math.floor(i / 8)], k2 = K[(Math.floor(i / 8) + 1) % 4], f = (i % 8) / 8; pts.push({ x: d.x + (k[0] + (k2[0] - k[0]) * f) * d.l / 2, y: d.y + (k[1] + (k2[1] - k[1]) * f) * d.h / 2 }); continue; }
      var r = d.forme === 'goutte' ? 1 - 0.55 * Math.pow(Math.max(0, -Math.sin(t)), 3) : 1;
      pts.push({ x: d.x + Math.cos(t) * d.l / 2 * r, y: d.y + Math.sin(t) * d.h / 2 * (d.forme === 'goutte' && Math.sin(t) < 0 ? 1.25 : 1) });
    }
    return pts;
  }
  // une découpe dans une demi-pièce se coupe DES DEUX CÔTÉS (le patron la trace en |x|)
  function decoupesDe(pid, pc){
    var out = [];
    ((V3.design && V3.design.decoupes) || []).forEach(function(d){
      if (d.piece !== pid) return;
      var c = contourDecoupeF(d); out.push(c);
      if (pc.axe) out.push(c.map(function(q){ return reflet(q, pc.axe); }));
    });
    return out;
  }

  /* Le grain du tissu : un bruit fin, discret (il donne la matière sans faire de moiré). */
  /* LE GRAIN selon le tissu (2026-10-17) : JERSEY pour les mailles (t-shirt, sweat, legging, lingerie), SERGÉ pour les
     jeans et pantalons, TOILE fine pour le reste (robes, chemises, jupes). */
  var GRAIN = {};
  function genreTissu(){ var b = V3 && V3.m ? V3.m.base : ''; return ['tshirt', 'debardeur', 'sweat', 'legging', 'culotte', 'brassiere', 'tuque'].indexOf(b) >= 0 ? 'jersey' : ['jean', 'pantalon', 'short'].indexOf(b) >= 0 ? 'serge' : 'toile'; }
  function grain(){
    var genre = genreTissu();
    if (GRAIN[genre]) return GRAIN[genre];
    var c = document.createElement('canvas'); c.width = c.height = 96;
    var g = c.getContext('2d'), im = g.createImageData(96, 96), s = 7;
    for (var i = 0; i < 96 * 96; i++) {
      s = (s * 16807) % 2147483647; var v = (s % 1000) / 1000, x = i % 96, y = Math.floor(i / 96);
      /* LE JERSEY (2026-10-17) : des colonnes de mailles VERTICALES (4 px = 1/8 de cm à 32 px/cm), chaque maille un
         petit « V » plus clair au centre, plus sombre entre deux colonnes — le grain d un t-shirt, pas un sergé */
      if (genre === 'jersey') {
        var cx = (x % 4) / 4, ry = (y % 5) / 5, vm = Math.abs(cx - 0.5) * 2, creux = vm > 0.8 ? 1 : 0;
        var maille = Math.abs(vm - (0.35 + 0.4 * ry)) < 0.22 ? 1 : 0;
        im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = creux ? 0 : (maille ? 255 : (v > 0.5 ? 255 : 0));
        im.data[i * 4 + 3] = Math.round(5 + 8 * Math.abs(v - 0.5) + creux * 16 + maille * 9);
      } else {
        // le sergé : des côtes en DIAGONALE (le denim) ; la toile : un fin quadrillé
        var trame = genre === 'serge' ? (((x + y) % 6 < 3) ? 1 : 0) : (((x % 3 === 0) !== (y % 3 === 0)) ? 1 : 0);
        im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = trame ? 0 : (v > 0.5 ? 255 : 0);
        im.data[i * 4 + 3] = Math.round(7 + 9 * Math.abs(v - 0.5) + trame * (genre === 'serge' ? 14 : 6));
      }
    }
    g.putImageData(im, 0, 0); GRAIN[genre] = c; return c;
  }

  /* LE MOTIF, au dessin du fichier : un SVG en millimètres sur le cadre de la pièce. */
  function svgMotifPiece(pc, pid, cw, ch){
    var mo = V3.m.motif; if (!mo || !(mo.calques || []).length) return '';
    if (mo.mode !== 'raccord' && mo.piece !== pid) return '';
    var bb = pc.bb, Wm = (bb.x1 - bb.x0) * 10, Hm = (bb.y1 - bb.y0) * 10, zo = mo.zone, s = '', mk = MK;
    var vis = mo.calques.filter(function(c){ return c.visible !== false && (c.type !== 'image' || (MOIMG[c.url] && MOIMG[c.url] !== 'chargement')); });
    MK = 10;
    try {
      if (mo.mode === 'raccord') {
        var X0 = function(v){ return v * 10; };
        s += '<defs><clipPath id="m3c"><rect x="0" y="0" width="' + zo.l * 10 + '" height="' + zo.h * 10 + '"/></clipPath><g id="m3m" clip-path="url(#m3c)">'
          + (mo.fond === 'blanc' ? '<rect width="' + zo.l * 10 + '" height="' + zo.h * 10 + '" fill="#FFFFFF"/>' : '')
          + vis.map(function(c){ return calqueSvg(c, X0, X0); }).join('') + '</g></defs>';
        var i0 = Math.floor(bb.y0 / zo.h) - 1, i1 = Math.ceil(bb.y1 / zo.h) + 1, j0 = Math.floor(bb.x0 / zo.l) - 1, j1 = Math.ceil(bb.x1 / zo.l) + 1;
        for (var i = i0; i <= i1; i++) for (var j = j0; j <= j1; j++) {
          var ox = j * zo.l + (mo.raccord === 'demibrique' && i % 2 ? zo.l / 2 : 0), oy = i * zo.h + (mo.raccord === 'demigoutte' && j % 2 ? zo.h / 2 : 0);
          s += '<use href="#m3m" x="' + ((ox - bb.x0) * 10) + '" y="' + ((oy - bb.y0) * 10) + '"/>';
        }
      } else {
        var Xz = function(v){ return (zo.x + v - bb.x0) * 10; }, Yz = function(v){ return (zo.y + v - bb.y0) * 10; };
        if (mo.fond === 'blanc') s += '<rect x="' + Xz(0) + '" y="' + Yz(0) + '" width="' + zo.l * 10 + '" height="' + zo.h * 10 + '" fill="#FFFFFF"/>';
        s += vis.map(function(c){ return calqueSvg(c, Xz, Yz); }).join('');
      }
    } finally { MK = mk; }
    return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + cw + '" height="' + ch + '" viewBox="0 0 ' + Wm + ' ' + Hm + '" preserveAspectRatio="none">' + s + '</svg>';
  }

  /* La toile d une pièce : le tissu, le grain, le motif, les bords, les découpes. */
  // les bords cousus d une pièce (chemins en cm), selon la famille : corps = épaule, emmanchure, côté ; manche = tête et dessous
  function bordsCousus(pc, pid){
    var fam = fam3d(), out = [], cs = [pc.p.contour].concat(pc.mir ? [pc.mir] : []);
    cs.forEach(function(c){
      var n = c.length, pts = function(k0, k1){ return bordPts(c, k0, k1, 1).pts; };
      // (l épaule comprise : sa marge passe de l autre côté de la crête, sous la pièce d en face — voir mailleCorps)
      if (fam === 'haut' && (pid === 'devant' || pid === 'dos') && n >= 6) out.push(pts(1, n - 2));
      else if (fam === 'haut' && pid === 'manche' && n >= 5) { out.push(pts(0, 3)); out.push(pts(4, 0)); }
      else if (fam === 'jupe' && (pid === 'devant' || pid === 'dos') && n >= 4) out.push(pts(1, 3));
    });
    return out;
  }
  /* LES FINITIONS (2026-10-17, sa référence Fal.ai) : ce qui fait qu un vêtement a l air COUSU — la bande d encolure
     en côte 1 × 1 (t-shirt, débardeur, sweat : la pièce existe dans le patron), et la double surpiqûre des ourlets du
     corps et des manches. Peintes dans la toile, parallèles au bord, du côté de la pièce. */
  function decaler(c, pts, d){
    var poly = contourPts(c), out = [];
    for (var i = 0; i < pts.length; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l;
      var q = pts[i], dedans = dansPoly(poly, q[0] + nx * 0.6, q[1] + ny * 0.6) ? 1 : -1;
      out.push([q[0] + nx * d * dedans, q[1] + ny * d * dedans]);
    }
    return out;
  }
  function finitions(g, pc, pid, enCm){
    var fam = fam3d(); if (fam !== 'haut') return;
    var base = V3.m.base, aBande = ['tshirt', 'debardeur', 'sweat'].indexOf(base) >= 0 && (V3.m.pieces || []).some(function(p){ return p.id === 'bande'; });
    var fil = sombre(V3.couleur, 0.78), ligne = function(pts, ep, tirets){ g.beginPath(); pts.forEach(function(q, k){ if (k) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.lineWidth = ep; g.setLineDash(tirets || []); g.stroke(); g.setLineDash([]); };
    enCm(); g.lineCap = 'butt'; g.lineJoin = 'round';
    [pc.p.contour].concat(pc.mir ? [pc.mir] : []).forEach(function(c){
      var n = c.length;
      if ((pid === 'devant' || pid === 'dos') && n >= 6) {
        if (aBande) {
          // la bande : 2 cm de côte (des côtes fines perpendiculaires au bord), un peu plus sombre, puis la surpiqûre
          var bord = bordPts(c, 0, 1, 1).pts, int = decaler(c, bord, 2);
          g.fillStyle = sombre(V3.couleur, 0.93); g.beginPath(); bord.forEach(function(q, k){ if (k) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); });
          for (var k2 = int.length - 1; k2 >= 0; k2--) g.lineTo(int[k2][0], int[k2][1]); g.closePath(); g.fill();
          var lg = 0; for (var k3 = 1; k3 < bord.length; k3++) lg += Math.hypot(bord[k3][0] - bord[k3 - 1][0], bord[k3][1] - bord[k3 - 1][1]);
          var nb = Math.round(lg / 0.22); g.strokeStyle = sombre(V3.couleur, 0.82); g.lineWidth = 0.06;
          for (var r2 = 0; r2 <= nb; r2++) { var t2 = r2 / Math.max(1, nb), ix = Math.min(bord.length - 1, Math.round(t2 * (bord.length - 1))); g.beginPath(); g.moveTo(bord[ix][0], bord[ix][1]); g.lineTo(int[ix][0], int[ix][1]); g.stroke(); }
          g.strokeStyle = fil; ligne(decaler(c, bord, 2.25), 0.07, [0.28, 0.14]);
          // (2026-10-18) la bande est DOUBLE : vue de l intérieur de l encolure, c est encore la côte. La toile le dit au shader par
          // son alpha — 0,88 : opaque, mais marqué
          var op = g.globalCompositeOperation; g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,0.12)'; g.beginPath();
          bord.forEach(function(q, k){ if (k) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); for (var k4 = int.length - 1; k4 >= 0; k4--) g.lineTo(int[k4][0], int[k4][1]);
          g.closePath(); g.fill(); g.globalCompositeOperation = op;
        }
        var ourlet = bordPts(c, n - 2, n - 1, 1).pts; g.strokeStyle = fil;
        ligne(decaler(c, ourlet, 1.5), 0.07, [0.28, 0.14]); ligne(decaler(c, ourlet, 2.1), 0.07, [0.28, 0.14]);
      }
      if (pid === 'manche' && n >= 5) {
        var om = bordPts(c, 3, 4, 1).pts; g.strokeStyle = fil;
        ligne(decaler(c, om, 1.5), 0.07, [0.28, 0.14]); ligne(decaler(c, om, 2.1), 0.07, [0.28, 0.14]);
      }
    });
  }
  function peindreToile(pc, pid, motifImg){
    var bb = pc.bb, cv = pc.toile, cw = cv.width, ch = cv.height, g = cv.getContext('2d');
    var sx = cw / (bb.x1 - bb.x0), sy = ch / (bb.y1 - bb.y0);
    var enCm = function(){ g.setTransform(sx, 0, 0, sy, -bb.x0 * sx, -bb.y0 * sy); };
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, cw, ch);
    // ⚠ deux remplissages : une seule forme (pièce + miroir, tracés en sens contraires) s ANNULAIT là où ils se
    // recouvrent — la patte de boutonnage de la chemise restait vide, la chemise paraissait ouverte
    enCm(); g.fillStyle = V3.couleur; g.beginPath(); tracerC(g, pc.p.contour); g.fill(); if (pc.mir) { g.beginPath(); tracerC(g, pc.mir); g.fill(); }
    /* LA VALEUR DE COUTURE (2026-10-17) : sur les bords COUSUS, 0,7 cm de tissu de plus, qui passe sous la pièce
       voisine — sans elle, le fond se voyait entre deux pièces là où le maillage se plie (des dents de scie aux
       emmanchures et aux côtés). L ourlet et l encolure restent coupés net. */
    var cous = bordsCousus(pc, pid);
    if (cous.length) { g.strokeStyle = V3.couleur; g.lineWidth = 2; g.lineJoin = 'round'; g.lineCap = 'round';
      // la manche : pas de marge au sommet de la tête (1,5 cm), où la manche n est encore qu un anneau ouvert — elle y
      // dessinait de petites boucles au bout des épaules
      g.save(); if (pid === 'manche') { g.beginPath(); g.rect(bb.x0 - 5, 1.5, bb.x1 - bb.x0 + 10, bb.y1 + 5); g.clip(); }
      cous.forEach(function(ch2){ g.beginPath(); ch2.forEach(function(q, k){ if (k) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke(); });
      g.restore(); }
    var ph = V3.photo && V3.m.photo3d ? (pid === 'devant' ? V3.m.photo3d.face : pid === 'dos' ? V3.m.photo3d.dos : null) : null;
    var phi = ph && imagePH(ph.url, function(){ if (GLV) { GLV.cle = ''; demander3d(); } });
    if (phi) { enCm(); g.globalCompositeOperation = 'source-atop'; g.drawImage(phi, -ph.cx / ph.k, -ph.haut / ph.k, ph.l / ph.k, ph.h / ph.k); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
    g.fillStyle = g.createPattern(grain(), 'repeat'); g.fillRect(0, 0, cw, ch);
    if (motifImg) g.drawImage(motifImg, 0, 0, cw, ch);
    finitions(g, pc, pid, enCm);
    // les bords : une ombre de couture, d un ton plus sombre que le tissu
    enCm(); g.strokeStyle = sombre(V3.couleur, 0.9); g.lineWidth = 0.16; g.lineJoin = 'round';
    g.beginPath(); tracerBords(g, pc.p.contour, pc.axe, pid); if (pc.mir) tracerBords(g, pc.mir, pc.axe, pid); g.stroke();
    // les découpes : le trou, puis son bord (le tissu tranché)
    var trous = decoupesDe(pid, pc);
    if (trous.length) {
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000000';
      trous.forEach(function(c){ g.beginPath(); tracerC(g, c); g.fill(); });
      g.globalCompositeOperation = 'source-atop'; g.strokeStyle = sombre(V3.couleur, 0.6); g.lineWidth = 0.35;
      trous.forEach(function(c){ g.beginPath(); tracerC(g, c); g.stroke(); });
    }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
  }

  /* ── Les maillages : le devant et le dos sur les anneaux du corps, la pièce de manche sur chaque manche ── */
  function grille3d(R, J, fab){
    var n = R * (J + 1), pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), tint = new Float32Array(n * 4), cen = [], ao = new Float32Array(n).fill(1);
    // le pli de chaque sommet, GARDÉ à part (sa profondeur et sa direction) : le relâchement des hauts l ôte, rend au
    // tissu ses longueurs, puis le repose le long de la nouvelle normale
    var pliD = new Float32Array(n), pliV = new Float32Array(n * 3);
    for (var i = 0; i < R; i++) {
      var ri = fab.anneau(i); cen.push(ri.c);
      for (var j = 0; j <= J; j++) {
        var q = fab.point(i, j, ri), k = i * (J + 1) + j;
        if (fab.pli) {
          // LE PLI : un déplacement perpendiculaire à l axe de l anneau (vers le dehors ou le dedans)
          var dpl = fab.pli(i, j), rx0 = q.p[0] - ri.c[0], ry0 = fab.axe ? 0 : q.p[1] - ri.c[1], rz0 = q.p[2] - ri.c[2], rl = Math.hypot(rx0, ry0, rz0) || 1;
          if (fab.axe) { var ax = fab.axe(i), pr = rx0 * ax[0] + (q.p[1] - ri.c[1]) * ax[1] + rz0 * ax[2]; rx0 -= ax[0] * pr; ry0 = (q.p[1] - ri.c[1]) - ax[1] * pr; rz0 -= ax[2] * pr; rl = Math.hypot(rx0, ry0, rz0) || 1; }
          q.p = [q.p[0] + rx0 / rl * dpl, q.p[1] + ry0 / rl * dpl, q.p[2] + rz0 / rl * dpl];
          pliD[k] = dpl; pliV[k * 3] = rx0 / rl; pliV[k * 3 + 1] = ry0 / rl; pliV[k * 3 + 2] = rz0 / rl;
          ao[k] = Math.max(0.7, Math.min(1.06, 1 + dpl * 0.16));
        }
        pos[k * 3] = q.p[0]; pos[k * 3 + 1] = q.p[1]; pos[k * 3 + 2] = q.p[2];
        uv[k * 2] = q.u; uv[k * 2 + 1] = q.v;
        var e = ETAT3[ri.etat]; if (e) { var h = hex(e); tint[k * 4] = h[0] / 255; tint[k * 4 + 1] = h[1] / 255; tint[k * 4 + 2] = h[2] / 255; tint[k * 4 + 3] = 1; }
      }
    }
    var nor = new Float32Array(n * 3), at = function(i, j){ var k = (i * (J + 1) + j) * 3; return [pos[k], pos[k + 1], pos[k + 2]]; };
    for (var i2 = 0; i2 < R; i2++) for (var j2 = 0; j2 <= J; j2++) {
      var du = sub3(at(i2, Math.min(J, j2 + 1)), at(i2, Math.max(0, j2 - 1))), dv = sub3(at(Math.min(R - 1, i2 + 1), j2), at(Math.max(0, i2 - 1), j2));
      var nn = unit3(croix3(du, dv)), pp = at(i2, j2);
      if (pt3(nn, sub3(pp, cen[i2])) < 0) nn = [-nn[0], -nn[1], -nn[2]];       // vers le dehors
      var k2 = (i2 * (J + 1) + j2) * 3; nor[k2] = nn[0]; nor[k2 + 1] = nn[1]; nor[k2 + 2] = nn[2];
    }
    var idx = [], lig = [];
    for (var a = 0; a + 1 < R; a++) for (var b = 0; b < J; b++) {
      var v0 = a * (J + 1) + b, v1 = v0 + 1, w0 = v0 + J + 1, w1 = w0 + 1;
      idx.push(v0, w0, w1, v0, w1, v1); lig.push(v0, v1, v0, w0);
    }
    return { pos: pos, nor: nor, uv: uv, tint: tint, ao: ao, idx: new Uint16Array(idx), lig: new Uint16Array(lig), R: R, J: J, pliD: pliD, pliV: pliV };
  }
  /* ══ LA VIE DU TISSU (2026-10-17, sa demande : « une fonction pour donner vie au vêtement, ajouter des
     plis naturels ») ══ Les plis se calculent, ils ne se simulent pas : ils suivent trois règles de vêtement —
     la PESANTEUR (ils se creusent vers le bas : la jupe d une robe, le bas d un haut), l AISANCE (un vêtement
     ajusté reste presque lisse, un vêtement ample ondule) et le BRAS (une manche longue tasse un peu vers le
     poignet). Le TISSU règle leur largeur et leur profondeur : fluide = plis fins et nombreux, rigide = rares
     et larges. Ils suivent la pièce (x, y du patron) : le motif, les bijoux et les rendus les suivent. */
  var PLIS = [['aucun', '${T("Aucun")}', 0], ['legers', '${T("Légers")}', 0.5], ['naturels', '${T("Naturels")}', 1], ['marques', '${T("Marqués")}', 1.7]];
  var TISSUS3 = [['fluide', '${T("Fluide")}', 1.15, 6.5], ['moyen', '${T("Moyen")}', 1, 9.5], ['rigide', '${T("Rigide")}', 0.8, 14]];
  var VIE = (function(){ try { var v = JSON.parse(localStorage.getItem('sz-atelier-vie') || '{}'); return { plis: v.plis || 'naturels', tissu: v.tissu || 'moyen' }; } catch (e) { return { plis: 'naturels', tissu: 'moyen' }; } })();
  function reglageVie(){
    var p = PLIS.filter(function(x){ return x[0] === VIE.plis; })[0] || PLIS[2], t = TISSUS3.filter(function(x){ return x[0] === VIE.tissu; })[0] || TISSUS3[1];
    return { a: p[2] * t[2] * 0.85, l: t[3] };
  }
  // une onde qui « erre » doucement en descendant : deux harmoniques, des phases qui varient avec la hauteur
  function onde(x, y, l, graine){
    var f1 = 1.3 * Math.sin(y / 23 + graine) + 0.45 * Math.sin(y / 7.3 + graine * 2.1), f2 = 2.1 * Math.cos(y / 17 + graine * 0.7);
    return 0.66 * Math.sin(2 * Math.PI * x / l + f1) + 0.34 * Math.sin(2 * Math.PI * x / (l * 0.53) + f2);
  }

  /* Au-dessus de l emmanchure, les anneaux du site serrent le corps (les pièces n y font plus un tour) :
     on y passe EN DOUCEUR depuis le dernier anneau jugé, sur 12 cm — une marche se voyait à la poitrine. */
  function adoucir(an){
    var k = -1; for (var i = 0; i < an.length; i++) if (an[i].e != null) { k = i; break; }
    if (k <= 0) return an;
    var top = an[k];
    return an.map(function(a, i){
      if (i >= k) return a;
      var t = Math.min(1, Math.max(0, (top.yp - a.yp) / 12)), w = 1 - t * t * (3 - 2 * t);
      return Object.assign({}, a, { rx: Math.max(a.rx, a.rx + (top.rx - a.rx) * w), rz: Math.max(a.rz, a.rz + (top.rz - a.rz) * w) });
    });
  }
  function mailleCorps(an, pc, pid){
    // (2026-10-18) un haut reçoit DEUX RANGS au-dessus de son premier anneau : le cou (y = 0 au patron) tombait au-dessus de
    // la grille, et la couture d épaule s y lisait au mauvais endroit
    if (fam3d() === 'haut' && an.length && an[0].yp > -1.5) { var a00 = an[0]; an = [-2, -1].map(function(d){ return Object.assign({}, a00, { yp: a00.yp + d - 0.2, c: { x: a00.c.x, y: a00.c.y - d + 0.2, z: a00.c.z || 0 }, e: null }); }).concat(an); }
    var bb = pc.bb, J = 72, tabs = an.map(function(a){ return tableArc(a.rz, a.rx); });
    /* LA COUTURE D ÉPAULE : le devant et le dos s y REJOIGNENT (sa capture du 2026-10-17 : on voyait
       l envers du dos entre les deux, et une pointe au cou). Près de la ligne d épaule de la pièce
       (du cou au point d épaule), la profondeur se resserre vers le milieu ; à 7 cm sous la ligne,
       la pièce a retrouvé la forme du corps. */
    var cc = pc.p.contour, nk = cc[1] || { x: 0, y: 0 }, ep = cc[2] || nk, haut = fam3d() === 'haut' && cc.length > 3;
    var ligne = function(ax){ return ax <= nk.x ? nk.y : ax >= ep.x ? ep.y : nk.y + (ep.y - nk.y) * (ax - nk.x) / Math.max(0.1, ep.x - nk.x); };
    var vie = reglageVie(), R0 = an.length;
    /* LES PLIS DE TRACTION (2026-10-17, sa référence Fal.ai) : sous l emmanchure, le tissu tiré par la manche fait de
       longs plis en éventail, de l aisselle vers le milieu et vers le bas. Ils partent du bas d emmanchure (le nœud 3),
       rayonnent sur un quart de tour et s éteignent en une douzaine de centimètres. */
    var ais = haut && cc[3] ? cc[3] : null;
    var aisselle = function(ax, y){
      if (!ais || !(vie.a > 0)) return 0;
      var dx = ax - ais.x, dy = y - ais.y, r = Math.hypot(dx, dy); if (r < 0.8 || r > 16 || dx > 1.5) return 0;
      var th = Math.atan2(dy, -dx); if (th < -0.5 || th > 1.9) return 0;           // vers l intérieur et vers le bas
      var ev = Math.min(1, (th + 0.5) / 0.5) * Math.min(1, (1.9 - th) / 0.5);
      return 0.42 * vie.a * Math.exp(-r / 6.5) * Math.min(1, r / 2) * ev * Math.sin(th * 7 + r * 0.25);
    };
    // la hauteur 3D d un rang du patron (interpolée entre les anneaux)
    var yDeYp = function(y){ if (y <= an[0].yp) return an[0].c.y + (an[0].yp - y); for (var q = 0; q + 1 < R0; q++) if (an[q + 1].yp >= y) { var u = (y - an[q].yp) / ((an[q + 1].yp - an[q].yp) || 1); return an[q].c.y + (an[q + 1].c.y - an[q].c.y) * u; } return an[R0 - 1].c.y; };
    // la force des plis, rang par rang, LISSÉE sur ±4 cm (un saut d aisance aux hanches faisait une ride)
    var brut = an.map(function(a, i){ var yr = i / Math.max(1, R0 - 1), g = Math.min(1, Math.max(0, (yr - 0.25) / 0.75));
      return (a.e == null ? 0.7 : Math.max(0.15, Math.min(1.25, a.e / 6))) * (0.12 + 0.88 * g * g * (3 - 2 * g)); });
    var force = brut.map(function(_, i){ var n = 0, s2 = 0; for (var k = Math.max(0, i - 4); k <= Math.min(R0 - 1, i + 4); k++) { n++; s2 += brut[k]; } return s2 / n; });
    /* ══ LE HAUT PORTÉ PAR LES ÉPAULES (2026-10-18, mesuré par tools/banc-3d-haut.js) ══
       Chaque COLONNE de la pièce est un chemin : il part de la crête de l épaule (à la hauteur de la couture d épaule,
       la même pour le devant et le dos), passe l épaule en quart d ellipse (à plat au sommet, vertical dessous), puis
       descend le long des anneaux du corps. Chaque rang du patron est posé à sa LONGUEUR D ARC depuis la couture :
       le tissu n est plus ni étiré ni tassé en hauteur (il l était 2,3 fois sous l emmanchure, et le vêtement
       glissait), et l encolure tombe au bas du cou. Au-dessus de la couture (la marge, hors de la pièce), le chemin
       continue de l autre côté de la crête. */
    var chemins = null;
    if (haut) {
      var ligneP = GLV && GLV.ligneEpaule ? GLV.ligneEpaule : function(ax){ return ligne(ax); };
      var anneauH = function(h){
        if (h >= an[0].c.y) return { q: 0, u: 0 };
        for (var q = 0; q + 1 < R0; q++) if (an[q + 1].c.y <= h) return { q: q, u: (an[q].c.y - h) / ((an[q].c.y - an[q + 1].c.y) || 1) };
        return { q: R0 - 2, u: 1 };
      };
      // ⚠ sous l aisselle, le devant et le dos font LE TOUR de l anneau (k sans plafond : les côtés se rejoignent, la couture
      // de côté partait ouverte de 3 cm) ; au-dessus, le plafond laisse l emmanchure ouverte (là se coud la manche)
      var yAis = cc.length > 3 ? cc[3].y : 0;
      // un point d anneau (ring q) pour la colonne x, l échelle venant du TOUR DU PATRON au rang y (devant + dos)
      var surAnneau = function(q, x, y){ var a = an[q], L = tabs[q], C = L[L.length - 1], W = GLV.tourPatron ? GLV.tourPatron(y) : 0;
        if (!(W > 0)) W = (a.sf || 0) + (a.sb || 0);
        var k0 = C / Math.max(1, 2 * W), k = y >= yAis - 0.5 ? k0 : Math.min(1, k0);
        var f = angleArc(L, pid === 'devant' ? x * k : C / 2 + x * k), p = [a.c.x + Math.sin(f) * a.rx, a.c.y, (a.c.z || 0) + Math.cos(f) * a.rz];
        /* ⚠ (2026-10-18, banc 3D) AU-DESSUS DE L AISSELLE, l anneau du tronc s arrête au flanc — l épaule, elle, continue sur la
           capsule jusqu au bras. Enroulé sur l ellipse, le bout de la couture d épaule repartait vers le dos et x plafonnait au
           flanc : le point d épaule du XS tombait 3,5 cm en dedans de l articulation, 4,5 cm de couture tassés en corne. Passé
           l angle où l ellipse tourne plus qu elle n avance (|dz/dx| = 1), le tissu file DROIT vers le dehors ; on y passe en
           douceur sur les 4 cm au-dessus de l aisselle. */
        var gk = Math.max(0, Math.min(1, (yAis - 0.5 - y) / 4)), fm = Math.atan2(a.rx, a.rz), sx = Math.abs(x * k);
        var Lm = L[Math.round(fm / (Math.PI / 2) * 32)], o = sx - Lm;
        if (gk > 0 && o > 0) {
          var sg = x >= 0 ? 1 : -1, fs = angleArc(L, pid === 'devant' ? sg * Lm : C / 2 + sg * Lm), dxs = Math.sin(fs) >= 0 ? 1 : -1;
          var q3 = [a.c.x + Math.sin(fs) * a.rx + dxs * o, a.c.y, (a.c.z || 0) + Math.cos(fs) * a.rz], w3 = gk * gk * (3 - 2 * gk);
          p = [p[0] + (q3[0] - p[0]) * w3, p[1], p[2] + (q3[2] - p[2]) * w3];
        }
        return p; };
      var aHauteur = function(h, x, y){ var r = anneauH(h), p0 = surAnneau(r.q, x, y), p1 = surAnneau(Math.min(R0 - 1, r.q + 1), x, y), u = Math.max(0, Math.min(1, r.u));
        return [p0[0] + (p1[0] - p0[0]) * u, h, p0[2] + (p1[2] - p0[2]) * u]; };
      var centreZ = function(h){ var r = anneauH(h), a0 = an[r.q], a1 = an[Math.min(R0 - 1, r.q + 1)]; return (a0.c.z || 0) + ((a1.c.z || 0) - (a0.c.z || 0)) * Math.max(0, Math.min(1, r.u)); };
      chemins = [];
      var parEllipse = function(xc){
        var axc = Math.abs(xc), ysx = ligneP(Math.min(axc, ep.x)), hTop = yDeYp(ysx);
        var zc = centreZ(hTop - 3), probe = aHauteur(hTop - 3, xc, ysx + 3), b0 = probe[2] - zc, bz = Math.max(0.8, Math.abs(b0));
        var aa = Math.max(1.8, Math.min(4.5, bz * 0.45));
        return { ys: ysx, haut: hTop, zc: zc, sg: b0 >= 0 ? 1 : -1, a: aa, bz: bz };
      };
      for (var jc = 0; jc <= J; jc++) {
        var xc = bb.x0 + (bb.x1 - bb.x0) * jc / J, pe0 = parEllipse(xc);
        // au-delà du point d épaule (le côté, sous l emmanchure), la DESCENTE est celle du point d épaule : le devant et le dos
        // arrivent ainsi à la même hauteur à la couture de côté (leurs profondeurs y diffèrent)
        var peH = Math.abs(xc) > ep.x ? parEllipse((xc >= 0 ? 1 : -1) * ep.x) : pe0;
        var aa = peH.a, bE = pe0.bz, SEh = 0, Pst = null, tab = null;
        var arcs = function(a2, b2){ var T = [0], px = 0, py = 0; for (var e = 1; e <= 32; e++) { var th = e / 32 * Math.PI / 2, x2 = b2 * Math.sin(th), y2 = a2 * (1 - Math.cos(th)); T.push(T[e - 1] + Math.hypot(x2 - px, y2 - py)); px = x2; py = y2; } return T; };
        // la longueur de descente sur l épaule : celle de l ellipse de RÉFÉRENCE (hauteur aa, profondeur de peH)
        SEh = arcs(peH.a, peH.bz)[32];
        for (var itc = 0; itc < 3; itc++) { Pst = aHauteur(pe0.haut - aa, xc, pe0.ys + SEh); bE = Math.max(0.8, Math.abs(Pst[2] - pe0.zc)); }
        /* ⚠ (2026-10-18, banc 3D) DANS LA LARGEUR DU COU, la crête part de la SURFACE du cou, pas de son axe : l encolure du dos,
           à 2 cm sous la ligne, restait sur le haut de l ellipse — DANS le cou (z = -2,5 pour un cou de 5,4) ; repoussée de 3 cm,
           elle s étirait trois fois au milieu dos. L ellipse perd d autant de profondeur : elle arrive au même point. */
        var u0 = Math.abs(xc) / Math.max(0.1, nk.x), z0 = u0 < 1 ? Math.max(0, Math.min(bE - 0.8, 0.85 * nk.x * (1 - u0 * u0))) : 0;
        bE -= z0;
        tab = arcs(aa, bE);
        /* ⚠ (2026-10-18, son motif : « SANDRIZA » s arquait sur la poitrine) LE NIVEAU DES RANGS : sous l ellipse, un rang descend de
           (longueur passée sur l épaule − hauteur perdue) = SE − a, plus grand là où le corps est profond — le milieu devant montait de
           1 cm. Sous l ellipse, chaque colonne rejoint en 6 cm la valeur du POINT D ÉPAULE (celle des colonnes au-delà : la couture de
           côté ne bouge pas) ; le rang redevient droit, l étirement vertical reste sous 20 %. */
        var peR = parEllipse((xc >= 0 ? 1 : -1) * ep.x), dD = (arcs(peR.a, peR.bz)[32] - peR.a) - (SEh - aa);
        chemins.push({ ys: pe0.ys, haut: pe0.haut, a: aa, b: bE, z0: z0, sg: pe0.sg, x0: Pst[0], zc: pe0.zc, SE: SEh, tab: tab, x: xc, dD: dD });
      }
    }
    var surChemin = function(ch, s, y){
      if (s <= ch.SE) {
        // sur l épaule (et au-delà de la crête, hors de la pièce) : le quart d ellipse, en vraie longueur d arc (rapportée à la
        // descente de référence, la même pour le devant et le dos)
        var th;
        if (s <= 0) th = s / Math.max(0.8, ch.b);
        else { var T = ch.tab, d = s / ch.SE * T[32], e = 1; while (e < 32 && T[e] < d) e++; th = (e - 1 + (d - T[e - 1]) / ((T[e] - T[e - 1]) || 1)) / 32 * Math.PI / 2; }
        return [ch.x0, ch.haut - ch.a * (1 - Math.cos(th)), ch.zc + ch.sg * (ch.z0 + ch.b * Math.sin(th))];
      }
      // dessous : un centimètre de patron = un centimètre de hauteur, sur l anneau de cette hauteur (le même pour le devant et le dos)
      var tR = Math.min(1, (s - ch.SE) / 4), wR = tR * tR * (3 - 2 * tR);
      return aHauteurC(ch.haut - ch.a - (s - ch.SE) + (ch.dD || 0) * wR, ch.x, y);
    };
    var aHauteurC = chemins ? aHauteur : null;
    var m = grille3d(an.length, J, {
      anneau: function(i){ var a = an[i]; return { c: [a.c.x, a.c.y, a.c.z || 0], etat: a.etat }; },
      pli: vie.a > 0 ? function(i, j){
        var a = an[i], x = bb.x0 + (bb.x1 - bb.x0) * j / J;
        // à la couture de côté, le pli s efface : le devant et le dos se rejoignent sans fente
        var bord = (pid === 'devant' ? a.sf : a.sb) || 0, cou = bord > 0 ? Math.max(0, Math.min(1, (bord - Math.abs(x)) / 4)) : 1;
        return vie.a * force[i] * cou * onde(x + (pid === 'dos' ? 211 : 0), a.yp, vie.l, pid === 'dos' ? 3.1 : 0.4) + aisselle(Math.abs(x), a.yp) * cou;
      } : null,
      point: function(i, j){
        var a = an[i], L = tabs[i], C = L[L.length - 1], k = Math.min(1, C / Math.max(1, 2 * ((a.sf || 0) + (a.sb || 0))));
        var x = bb.x0 + (bb.x1 - bb.x0) * j / J;
        if (chemins) { var chm = chemins[j], pc3 = surChemin(chm, a.yp - chm.ys, a.yp); return { p: pc3, u: (x - bb.x0) / (bb.x1 - bb.x0), v: (a.yp - bb.y0) / (bb.y1 - bb.y0) }; }
        // le devant part du milieu devant vers +x ; le dos, du milieu dos (C / 2) — les côtés se rejoignent
        var f = angleArc(L, pid === 'devant' ? x * k : C / 2 + x * k);
        var d = haut ? a.yp - ligne(Math.abs(x)) : 99, px = a.c.x + Math.sin(f) * a.rx, zr = Math.cos(f) * a.rz, py = a.c.y, pz = zr;
        /* ⚠ L ÉPAULE ENROULÉE (2026-10-17, sa référence Fal.ai) : près de la couture d épaule, la pièce ne s aplatit
           plus en couvercle (le devant et le dos qui se rejoignaient à plat faisaient une boîte, que le mannequin
           traversait). Elle PASSE PAR-DESSUS l épaule : depuis la couture (au sommet, z = 0), elle tourne sur un
           quart de cercle de rayon = la profondeur du corps à cet endroit, puis redescend — la longueur du patron
           est gardée. On rejoint ensuite, en douceur, la hauteur des anneaux du site. */
        // ⚠ (2026-10-17) PAS de borne à 16 cm : là où le corps est profond, la transition n y était pas finie et la
        // surface sautait — le « rectangle » en relief en haut de la poitrine. La transition s achève d elle-même (sb = 1).
        if (haut && d < 60) {
          // au-dessus de la couture (d < 0 : la marge), la pièce CONTINUE sur la courbe de l épaule, de l autre côté de
          // la crête et un peu dessous : le devant et le dos se chevauchent comme une vraie couture, sans trou ni rabat
          var dz = Math.max(-2.5, d), rr = Math.max(0.6, Math.abs(zr)) * (d < 0 ? 0.96 : 1), th = Math.min(Math.PI / 2, dz / rr), ys = yDeYp(ligne(Math.abs(x)));
          /* ⚠ LA HAUTEUR suit un rayon UNIQUE par rang (la profondeur du corps au milieu, a.rz) : avec le rayon local, le
             tissu remontait plus au milieu que sur les côtés, et un motif imprimé s arquait. La profondeur (z), elle,
             garde le rayon local — c est elle qui fait l épaule. */
          var Rg = Math.max(0.6, a.rz * (d < 0 ? 0.96 : 1)), thg = Math.min(Math.PI / 2, dz / Rg);
          var yw = ys - Rg * (1 - Math.cos(thg)) - Math.max(0, dz - Rg * Math.PI / 2), zw = (zr >= 0 ? 1 : -1) * rr * Math.sin(th);
          // le retour aux anneaux se cale sur le RANG (sous le point d épaule le plus bas), pas sur la ligne d épaule
          // de chaque colonne — sinon il commençait plus tôt au cou qu aux épaules, et le motif s arquait
          var dRang = a.yp - Math.max(nk.y, ep.y), tb = Math.max(0, Math.min(1, (dRang - Rg * Math.PI / 2 + 2) / 8)), sb = tb * tb * (3 - 2 * tb);
          py = yw + (a.c.y - yw) * sb; pz = zw + (zr - zw) * sb;
        }
        return { p: [px, py, (a.c.z || 0) + pz], u: (x - bb.x0) / (bb.x1 - bb.x0), v: (a.yp - bb.y0) / (bb.y1 - bb.y0) };
      }
    });
    m.pid = pid; m.pc = pc; m.yp = an.map(function(a){ return a.yp; }); return m;
  }
  /* LA MANCHE MONTÉE (2026-10-17, sa capture : « le moteur 3D est affreux… que ce soit un vrai vêtement »).
     ⚠ Le site ne donne la manche qu à partir du DESSOUS DE BRAS : la tête de manche manquait, les manches
     flottaient comme deux tubes à côté du corps. On la reconstruit ici depuis la PIÈCE : chaque rang du
     patron (yp) est un anneau dont le tour EST la largeur de la pièce à ce rang ; la tête (yp < hauteur de
     tête) va du POINT D ÉPAULE du corsage au BAS D EMMANCHURE — la manche est cousue au corps — puis le bras
     suit la direction donnée par le site. La tête se découpe toute seule : hors de la pièce, la toile est vide. */
  function bornesXF(c, y){
    var pts = []; for (var i = 0; i < c.length; i++) { var a = c[i === 0 ? c.length - 1 : i - 1], b = c[i];
      for (var k = 1; k <= 12; k++) { var t = k / 12; if (b.c1 && b.c2) { var u = 1 - t; pts.push({ x: u * u * u * a.x + 3 * u * u * t * b.c1.x + 3 * u * t * t * b.c2.x + t * t * t * b.x, y: u * u * u * a.y + 3 * u * u * t * b.c1.y + 3 * u * t * t * b.c2.y + t * t * t * b.y }); } else pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); } }
    var x0 = 1e9, x1 = -1e9;
    for (var j = 0; j < pts.length; j++) { var p = pts[j], q = pts[(j + 1) % pts.length]; if ((p.y - y) * (q.y - y) <= 0 && p.y !== q.y) { var x = p.x + (q.x - p.x) * (y - p.y) / (q.y - p.y); x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }
    return x1 > x0 ? { x0: x0, x1: x1 } : null;
  }
  function mailleManche(an, pc, attache){
    var bb = pc.bb, J = 48, sx = 0; an.forEach(function(a){ sx += a.c.x; }); var sg = sx >= 0 ? 1 : -1;
    var c = pc.p.contour, ch = Math.max(4, (c[0] && c[0].y) || 10), yEnd = an[an.length - 1].yp;
    var bu = bornesXF(c, ch + 0.5), ru = bu ? (bu.x1 - bu.x0) / (2 * Math.PI) : 5;
    // le rayon du bras du corps (le plus proche de cette manche), pour que la manche l habille
    var rBras = 0, bras = null; ((V3 && V3.r && V3.r.corps) || []).forEach(function(tb){ if (!/bras/.test(tb.nom || '') || (tb.anneaux || []).length < 2) return; var a0 = tb.anneaux[0]; if ((a0.c.x >= 0 ? 1 : -1) === sg) { rBras = Math.max(a0.rx, a0.rz); bras = tb.anneaux; } });
    // la direction du bras : celle des anneaux du site
    var t0 = unit3([an[an.length - 1].c.x - an[0].c.x, an[an.length - 1].c.y - an[0].c.y, 0]);
    var cadre = function(t){ var u = unit3([-t[1], t[0], 0]); if (u[0] * sg < 0) u = [-u[0], -u[1], -u[2]]; var v = unit3(croix3(t, u)); if (v[2] < 0) v = [-v[0], -v[1], -v[2]]; return { u: u, v: v }; };
    // l attache : le haut de la tête sur le point d épaule, le dessous de bras sur le bas d emmanchure
    var P0, Pch, tc = t0;
    /* ⚠ LA MANCHE HABILLE LE BRAS (2026-10-17, avec le mannequin) : son axe EST celui du bras du corps. Calée sur le
       point d épaule du vêtement (2,5 cm plus près du cou que l articulation), elle passait derrière le bras. La tête
       commence juste au-dessus de l articulation ; le dessous de bras est à la hauteur du bas d emmanchure. Le
       drapé coud ensuite la tête à l emmanchure. */
    if (bras) {
      var J0 = [bras[0].c.x, bras[0].c.y, bras[0].c.z || 0], J1 = [bras[bras.length - 1].c.x, bras[bras.length - 1].c.y, bras[bras.length - 1].c.z || 0];
      t0 = unit3(sub3(J1, J0)); tc = t0;
      var sA = attache ? Math.max(3, pt3(sub3(attache.A, J0), t0)) : ch * 0.6;
      // la tête part à peine au-dessus de l articulation (plus haut, elle bouffait au-dessus de l épaule)
      P0 = [J0[0] - t0[0] * rBras * 0.25, J0[1] - t0[1] * rBras * 0.25, J0[2] - t0[2] * rBras * 0.25];
      Pch = [J0[0] + t0[0] * sA, J0[1] + t0[1] * sA, J0[2] + t0[2] * sA];
    } else if (attache) {
      for (var it = 0; it < 3; it++) { var f0 = cadre(tc); P0 = sub3(attache.S, [f0.u[0] * ru, f0.u[1] * ru, f0.u[2] * ru]); Pch = [attache.A[0] + f0.u[0] * ru, attache.A[1] + f0.u[1] * ru, attache.A[2] + f0.u[2] * ru]; tc = unit3(sub3(Pch, P0)); }
    } else { var a0 = an[0].c; Pch = [a0.x, a0.y, a0.z || 0]; P0 = sub3(Pch, [t0[0] * ch, t0[1] * ch, 0]); tc = t0; }
    var lc = Math.hypot(Pch[0] - P0[0], Pch[1] - P0[1], Pch[2] - P0[2]);
    var rangs = [];
    for (var y = bras ? -1.7 : 0.3; y <= yEnd + 0.01; y += 1) {
      var b = bornesXF(c, y), w = b ? b.x1 - b.x0 : 0, cap = y < ch;
      // la tête de manche s ARRONDIT vers le haut (un cylindre faisait un coin carré au-dessus de l épaule)
      // ⚠ (2026-10-17, avec le mannequin) la tête ne descend plus sous le rayon du BRAS + 0,6 cm : plus fine, elle
      // passait DANS le bras et le bras nu ressortait au-dessus de la manche
      var r = cap ? Math.max((rBras + 0.6) * (0.82 + 0.18 * Math.sqrt(Math.max(0, y) / ch)), ru * (0.62 + 0.38 * Math.pow(Math.max(0, y) / ch, 0.6))) : Math.max(rBras + 0.4, w / (2 * Math.PI)), t, ctr;
      // la tête suit l AXE DU BRAS (le haut d un fourreau) ; la couture la ramène sur l emmanchure — suivre la pente
      // épaule → aisselle, très inclinée, la poussait vers le dehors en épaulette
      if (cap && bras) {
        /* LA TÊTE EN DÔME (2026-10-17, le haut sans drapé : une tête en tube laissait l épaule du bras à nu). À chaque
           rang, le tour EST la largeur de la pièce (étroite au sommet de la tête, pleine au dessous de bras) ; l anneau
           recule le long du bras d autant que le dôme se referme — une demi-ellipse de la hauteur de la tête. La
           collision pousse ensuite le dôme au-dessus de la tête du bras. */
        var Rc = Math.max(rBras + 0.6, ru);
        r = Math.max(0.5, Math.min(Rc, w / (2 * Math.PI)));
        // la hauteur du dôme : celle du patron, mais assez pour COIFFER la tête du bras (son sommet est rBras au-dessus de l articulation)
        var Hd = Math.max(ch, sA + rBras + 0.6), sY = sA - Hd * Math.sqrt(Math.max(0, 1 - (r / Rc) * (r / Rc)));
        t = t0; ctr = [J0[0] + t0[0] * sY, J0[1] + t0[1] * sY, J0[2] + t0[2] * sY];
      }
      else if (cap) { t = t0; var lc0 = Math.max(2, pt3(sub3(Pch, P0), t0)); ctr = [P0[0] + t0[0] * lc0 * y / ch, P0[1] + t0[1] * lc0 * y / ch, P0[2] + t0[2] * lc0 * y / ch]; }
      else { t = t0; var lc1 = Math.max(2, pt3(sub3(Pch, P0), t0)); ctr = [P0[0] + t0[0] * (lc1 + y - ch), P0[1] + t0[1] * (lc1 + y - ch), P0[2] + t0[2] * (lc1 + y - ch)];
        /* ⚠ (2026-10-18, banc 3D) sous la tête, le tour ne descend pas sous le bras À CETTE HAUTEUR — pas sous le haut du bras : une
           manche longue (poignet de 22 cm) gardait un anneau de 31 cm au poignet, et sa couture de dessous restait ouverte de 6 à
           7 cm avant le zip (étirée en éclats en la refermant). */
        if (bras) { var sB = pt3(sub3(ctr, J0), t0), rL = 0, bP = -1e9;
          bras.forEach(function(a){ var sa = (a.c.x - J0[0]) * t0[0] + (a.c.y - J0[1]) * t0[1] + ((a.c.z || 0) - J0[2]) * t0[2]; if (sa <= sB && sa > bP) { bP = sa; rL = Math.max(a.rx, a.rz); } });
          // (sur les 10 premiers cm sous la tête, le haut du bras comme avant — serrée là, la manche courte faisait un repli au bas
          // d emmanchure ; puis, sur 8 cm, le bras à sa hauteur : l avant-bras des manches longues)
          var tB = Math.max(0, Math.min(1, (y - ch - 14) / 8)), wB = tB * tB * (3 - 2 * tB);
          if (bP > -1e9) r = Math.max(rBras + (rL - rBras) * wB + 0.4, w / (2 * Math.PI)); } }
      var proche = an.reduce(function(m, a){ return !m || Math.abs(a.yp - y) < Math.abs(m.yp - y) ? a : m; }, null);
      rangs.push({ yp: y, r: r, c: ctr, f: cadre(t), etat: proche && Math.abs(proche.yp - y) < 1.5 ? proche.etat : '' });
    }
    var vie = reglageVie(), Lm = rangs.length ? rangs[rangs.length - 1].yp : 1;
    var m = grille3d(rangs.length, J, {
      anneau: function(i){ return { c: rangs[i].c, etat: rangs[i].etat }; },
      axe: function(i){ return unit3(croix3(rangs[i].f.u, rangs[i].f.v)); },
      pli: vie.a > 0 ? function(i, j){
        var a = rangs[i]; if (a.yp < ch + 2) return 0;
        var x = bb.x0 + (bb.x1 - bb.x0) * j / J, t = Math.min(1, (a.yp - ch) / Math.max(1, Lm - ch));
        // ⚠ pas une sinusoïde le long du bras : elle faisait des côtes en accordéon (sa capture du 2026-10-17)
        return vie.a * 0.14 * (0.3 + 0.7 * t) * onde(a.yp * 1.3 + x * 0.6, x * 0.5 + a.yp * 0.2, vie.l * 0.9, 1.7 + sg);
      } : null,
      point: function(i, j){
        var a = rangs[i], x = bb.x0 + (bb.x1 - bb.x0) * j / J, f = x / a.r, co = Math.cos(f) * a.r, si = Math.sin(f) * a.r;
        return { p: [a.c[0] + a.f.u[0] * co + a.f.v[0] * si, a.c[1] + a.f.u[1] * co + a.f.v[1] * si, a.c[2] + a.f.u[2] * co + a.f.v[2] * si], u: (x - bb.x0) / (bb.x1 - bb.x0), v: (a.yp - bb.y0) / (bb.y1 - bb.y0) };
      }
    });
    m.pid = 'manche'; m.pc = pc; m.yp = rangs.map(function(a){ return a.yp; }); return m;
  }
  /* LE PANTALON EN 3D (2026-10-17) : chaque pièce est plaquée d une couture à l autre. Au-dessus de la fourche
     (« haut »), le devant va de la couture de côté (f = 0) au milieu devant (f = 1), le dos du côté au milieu
     dos ; sous la fourche (« jambe »), le devant fait la moitié avant de la jambe, de la couture de côté à
     l entrejambe, et le dos la moitié arrière. Le côté gauche (sg = +1) est le miroir du droit. */
  function mailleBas(an, pc, pid, sg, mode){
    var bb = pc.bb, J = 56, tabs = an.map(function(a){ return tableArc(a.rz, a.rx); }), vie = reglageVie(), R0 = an.length;
    var bords = an.map(function(a, i){ var w = pid === 'devant' ? a.wf : a.wb; return w && w.x1 > w.x0 ? w : null; });
    for (var i = 0; i < bords.length; i++) if (!bords[i]) bords[i] = bords[i - 1] || bords.filter(Boolean)[0] || { x0: 0, x1: 1 };
    var arc = function(i, x){
      var a = an[i], L = tabs[i], C = L[L.length - 1], w = bords[i], f = (x - w.x0) / (w.x1 - w.x0), s2, md = a.mode || mode;
      if (md === 'haut') s2 = pid === 'devant' ? (1 - f) * C / 4 : C / 2 - (1 - f) * C / 4;
      else s2 = pid === 'devant' ? C / 4 - f * C / 2 : C / 4 + f * C / 2;
      return { f: f, phi: angleArc(L, sg * s2) };
    };
    var m = grille3d(R0, J, {
      anneau: function(i){ var a = an[i]; return { c: [a.c.x, a.c.y, a.c.z || 0], etat: a.etat }; },
      pli: vie.a > 0 ? function(i, j){
        var a = an[i], x = bb.x0 + (bb.x1 - bb.x0) * j / J, f = arc(i, x).f, cou = Math.max(0, Math.min(1, f / 0.12, (1 - f) / 0.12));
        var g = (an[i].mode || mode) === 'haut' ? 0.15 : 0.25 + 0.75 * Math.min(1, i / Math.max(1, R0 - 1));
        return vie.a * 0.6 * g * cou * onde(x + (pid === 'dos' ? 137 : 0) + sg * 50, a.yp, vie.l * 0.8, pid === 'dos' ? 2.2 : 0.9);
      } : null,
      point: function(i, j){
        var a = an[i], x = bb.x0 + (bb.x1 - bb.x0) * j / J, ph = arc(i, x).phi;
        return { p: [a.c.x + Math.sin(ph) * a.rx, a.c.y, (a.c.z || 0) + Math.cos(ph) * a.rz], u: (x - bb.x0) / (bb.x1 - bb.x0), v: (a.yp - bb.y0) / (bb.y1 - bb.y0) };
      }
    });
    m.pid = pid; m.pc = pc; m.yp = an.map(function(a){ return a.yp; }); return m;
  }
  /* L attache d une manche, côté sg : le point d épaule et le bas d emmanchure du corsage, en 3D
     (la moyenne du devant et du dos — le dos est tourné : son x positif part vers −x). */
  function attacheManche(sg){
    var dv = GLV.mailles.filter(function(m){ return m.pid === 'devant'; })[0], ds = GLV.mailles.filter(function(m){ return m.pid === 'dos'; })[0];
    if (!dv || !ds) return null;
    var cf = dv.pc.p.contour, cb = ds.pc.p.contour; if (cf.length < 4 || cb.length < 4) return null;
    var Sf = surface3d(dv, sg * cf[2].x, cf[2].y), Sb = surface3d(ds, -sg * cb[2].x, cb[2].y);
    var Af = surface3d(dv, sg * cf[3].x, cf[3].y - 0.5), Ab = surface3d(ds, -sg * cb[3].x, cb[3].y - 0.5);
    if (!Sf || !Sb || !Af || !Ab) return null;
    var moy = function(a, b){ return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.6, (a[2] + b[2]) / 2]; };
    return { S: moy(Sf.p, Sb.p), A: moy(Af.p, Ab.p) };
  }
  /* La silhouette LISSÉE en hauteur (une moyenne sur 5 rangs) : un pli horizontal se voyait à la taille. */
  /* LE DESSUS DES ÉPAULES : au-dessus du point d épaule, les anneaux du corps se resserrent jusqu au cou
     et les pièces s y tassaient en pointes. On y garde la LARGEUR des épaules et l on aplatit la
     PROFONDEUR (le dessus d une épaule) ; l encolure, elle, reste découpée par la pièce. */
  function fam3d(){ var b = (D.bases || []).filter(function(x){ return V3 && x.cle === V3.m.base; })[0]; return b ? b.famille : ''; }
  function epaules(an, yS){
    if (!(yS > 0)) return an;
    var k = -1; for (var i = 0; i < an.length; i++) if (an[i].yp >= yS) { k = i; break; }
    if (k <= 0) return an;
    var ref = an[k];
    return an.map(function(a, i){
      if (i >= k) return a;
      var f = Math.max(0, a.yp / yS);
      return Object.assign({}, a, { rx: Math.max(a.rx, ref.rx * (0.9 + 0.1 * f)), rz: ref.rz });
    });
  }
  function lisser(an){
    return an.map(function(a, i){
      var n = 0, rx = 0, rz = 0;
      for (var k = Math.max(0, i - 2); k <= Math.min(an.length - 1, i + 2); k++) { n++; rx += an[k].rx; rz += an[k].rz; }
      return Object.assign({}, a, { rx: rx / n, rz: rz / n });
    });
  }

  /* Un point du patron (pièce, x, y) → un point de la surface, sa normale, et le « haut » de la pièce. */
  function surface3d(ma, x, y){
    var R = ma.R, J = ma.J, yp = ma.yp, i0 = -1, bb = ma.pc.bb;
    for (var i = 0; i + 1 < R; i++) if ((yp[i] - y) * (yp[i + 1] - y) <= 0 && yp[i] !== yp[i + 1]) { i0 = i; break; }
    if (i0 < 0) return null;
    var fi = (y - yp[i0]) / (yp[i0 + 1] - yp[i0]), fj = (x - bb.x0) / (bb.x1 - bb.x0) * J;
    if (fj < 0 || fj > J) return null;
    var j0 = Math.min(J - 1, Math.floor(fj)), gj = fj - j0;
    var mel = function(arr){ var o = []; for (var c = 0; c < 3; c++) { var at = function(i, j){ return arr[(i * (J + 1) + j) * 3 + c]; };
      o.push((at(i0, j0) * (1 - gj) + at(i0, j0 + 1) * gj) * (1 - fi) + (at(i0 + 1, j0) * (1 - gj) + at(i0 + 1, j0 + 1) * gj) * fi); } return o; };
    var p = mel(ma.pos), n = unit3(mel(ma.nor));
    var k0 = (i0 * (J + 1) + j0) * 3, k1 = ((i0 + 1) * (J + 1) + j0) * 3;
    var t = [ma.pos[k0] - ma.pos[k1], ma.pos[k0 + 1] - ma.pos[k1 + 1], ma.pos[k0 + 2] - ma.pos[k1 + 2]];
    if (yp[i0] > yp[i0 + 1]) t = [-t[0], -t[1], -t[2]];
    return { p: p, n: n, t: t };
  }

  /* ── Les objets : chacun est un tour (un profil qu on fait tourner autour de sa normale) ── */
  function tour3(profil, seg, plat, zc){
    var PO = [], NO = [], pt = function(q, a){ return [q[0] * Math.cos(a), q[0] * Math.sin(a), q[1]]; };
    var nm = function(q, a){ return [q[2] * Math.cos(a), q[2] * Math.sin(a), q[3]]; };
    for (var i = 0; i + 1 < profil.length; i++) for (var s = 0; s < seg; s++) {
      var a0 = 2 * Math.PI * s / seg, a1 = 2 * Math.PI * (s + 1) / seg, A = profil[i], B = profil[i + 1];
      var tri = [[[A, a0], [B, a0], [B, a1]], [[A, a0], [B, a1], [A, a1]]];
      tri.forEach(function(T){
        var v = T.map(function(x){ return pt(x[0], x[1]); });
        if (plat) {
          var f = croix3(sub3(v[1], v[0]), sub3(v[2], v[0])); if (Math.hypot(f[0], f[1], f[2]) < 1e-9) return;
          f = unit3(f); var c = [(v[0][0] + v[1][0] + v[2][0]) / 3, (v[0][1] + v[1][1] + v[2][1]) / 3, (v[0][2] + v[1][2] + v[2][2]) / 3 - zc];
          if (pt3(f, c) < 0) f = [-f[0], -f[1], -f[2]];
          v.forEach(function(q){ PO.push(q[0], q[1], q[2]); NO.push(f[0], f[1], f[2]); });
        } else T.forEach(function(x, k){ var q = v[k], n = nm(x[0], x[1]); PO.push(q[0], q[1], q[2]); NO.push(n[0], n[1], n[2]); });
      });
    }
    return { pos: new Float32Array(PO), nor: new Float32Array(NO), n: PO.length / 3 };
  }
  function objets3d(){
    var arc = function(n, f){ var o = []; for (var k = 0; k <= n; k++) o.push(f(k / n)); return o; };
    return {
      perle: tour3(arc(14, function(t){ var a = -Math.PI / 2 + Math.PI * t; return [Math.cos(a), 0.8 + Math.sin(a), Math.cos(a), Math.sin(a)]; }), 24, false),
      anneau: tour3(arc(20, function(t){ var a = 2 * Math.PI * t; return [0.72 + 0.28 * Math.cos(a), 0.28 + 0.28 * Math.sin(a), Math.cos(a), Math.sin(a)]; }), 32, false),
      oeillet: tour3(arc(20, function(t){ var a = 2 * Math.PI * t; return [0.66 + 0.34 * Math.cos(a), 0.16 + 0.16 * Math.sin(a), Math.cos(a) * 0.5, Math.sin(a)]; }), 32, false),
      bouton: tour3([[0, 0.4, 0, 1], [0.78, 0.4, 0, 1], [0.78, 0.4, 0.6, 0.8], [1, 0.26, 1, 0.2], [1, 0.05, 1, 0], [1, 0.05, 0, -1], [0, 0.05, 0, -1]], 32, false),
      strass: tour3([[0, 0], [1, 0.32], [0.58, 0.7], [0, 0.7]], 10, true, 0.35),
      clou: tour3([[0, 0], [1, 0], [0, 1.1]], 4, true, 0.35)
    };
  }

  /* ── Les programmes ── */
  var VS_TISSU = 'attribute vec3 aP; attribute vec3 aN; attribute vec2 aT; attribute vec4 aK; attribute float aO; uniform mat4 uM; uniform mat4 uV; uniform mat3 uR; varying vec3 vN; varying vec2 vT; varying vec3 vE; varying vec4 vK; varying float vO;'
    + ' void main(){ vec4 p = uV * vec4(aP, 1.0); vE = -p.xyz; vN = uR * aN; vT = aT; vK = aK; vO = aO; gl_Position = uM * vec4(aP, 1.0); }';
  var FS_TISSU = 'precision mediump float; uniform sampler2D uS; uniform vec3 uL; uniform float uC; uniform vec3 uF; varying vec3 vN; varying vec2 vT; varying vec3 vE; varying vec4 vK; varying float vO;'
    + ' uniform float uDg; void main(){ vec4 t = texture2D(uS, vT); if (t.a < 0.5) discard; vec3 n = normalize(vN); vec3 e = normalize(vE); float de = 0.0;'
    + ' if (dot(n, e) < 0.0) { n = -n; de = 1.0; }'
    // le mode DIAGNOSTIC du banc de rendu : l endroit en vert pur, l envers en rouge pur
    + ' if (uDg > 0.5) { gl_FragColor = de > 0.5 ? vec4(1.0, 0.0, 0.0, 1.0) : vec4(0.0, 1.0, 0.0, 1.0); return; }'
    // LA LUMIÈRE DE STUDIO (2026-10-17) : une boîte à lumière (diffuse enveloppante), un ciel plus clair en haut qu en
    // bas (le dessous des manches et de l ourlet s assombrit), un léger satiné de jersey sur les bords
    + ' float d = max(0.0, (dot(n, uL) + 0.45) / 1.45); float r = pow(1.0 - max(0.0, dot(n, e)), 2.2);'
    + ' vec3 h = normalize(uL + e); float sp = pow(max(0.0, dot(n, h)), 18.0) * 0.035; float ciel = 0.26 + 0.14 * (0.5 + 0.5 * n.y);'
    + ' vec3 b = mix(t.rgb, vK.rgb, vK.a * uC); float d2 = d * d * (3.0 - 2.0 * d); vec3 c = b * (ciel * 0.82 + 0.80 * d2) + b * r * 0.20 + vec3(sp);'
    + ' if (de > 0.5) { float o = 0.62 + 0.38 * clamp(1.0 - abs(dot(n, e)), 0.0, 1.0); c = uF * (0.78 + 0.24 * d) * o; } gl_FragColor = vec4(c * vO, 1.0); }';
  /* ══ LA VRAIE FIBRE (2026-10-18, sa demande : « la vraie fibre comme sur un t-shirt, pas un polygone brut — comme une
     photo réelle ») ══ Le tissu est calculé AU CM DU PATRON (uTa : la taille de la pièce, vT : sa position) :
       · la MATIÈRE (uMat) : 0 jersey (mailles en V, colonnes verticales), 1 bord-côte, 2 sergé (diagonale), 3 toile ;
         elle relève la NORMALE (relief de la maille, repère tangent tiré des dérivées d écran) et module à peine la teinte
         (creux un peu plus sombres, léger chiné) — le motif imprimé garde sa netteté ;
       · elle S EFFACE au loin (empreinte du pixel en cm comparée au pas de la maille) : pas de moiré ni de scintillement ;
       · la LUMIÈRE DE STUDIO : une boîte à lumière enveloppante, une lumière d appoint de l autre côté, un ciel plus clair
         en haut, et le SATINÉ du coton aux angles rasants ; la couleur choisie reste celle qu on voit de face.
     Sans l extension des dérivées (rare), la maille ne module que la teinte, effacée par la distance. */
  var NL3 = String.fromCharCode(10);
  function fsTissu(der){
    return (der ? '#extension GL_OES_standard_derivatives : enable' + NL3 : '')
      + '#ifdef GL_FRAGMENT_PRECISION_HIGH' + NL3 + 'precision highp float;' + NL3 + '#else' + NL3 + 'precision mediump float;' + NL3 + '#endif' + NL3
      + 'uniform sampler2D uS; uniform vec3 uL; uniform float uC; uniform vec3 uF; uniform float uDg; uniform vec2 uTa; uniform float uMat;'
      + ' varying vec3 vN; varying vec2 vT; varying vec3 vE; varying vec4 vK; varying float vO;'
      + ' float hs(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }'
      + ' float vn(vec2 q){ vec2 i = floor(q); vec2 f = fract(q); f = f * f * (3.0 - 2.0 * f);'
      + '   return mix(mix(hs(i), hs(i + vec2(1.0, 0.0)), f.x), mix(hs(i + vec2(0.0, 1.0)), hs(i + vec2(1.0, 1.0)), f.x), f.y); }'
      // le relief de l armure au point p (cm), de 0 (creux) à 1 (sommet de la maille)
      + ' float relief(vec2 p){'
      // jersey : des COLONNES de mailles (le trait dominant d un t-shirt), chaque maille un peu différente de sa voisine
      // (épaisseur du fil) — sans ce hasard, une grille de points trop régulière, qui ne ressemble à aucun tissu
      // la maille du jersey : deux JAMBES inclinées qui forment un V (le point endroit d un t-shirt), creux entre les colonnes
      + '   if (uMat < 0.5) { vec2 q = vec2(p.x / 0.16, p.y / 0.13); float a = abs(fract(q.x) - 0.5); float v = fract(q.y);'
      + '     float rn = 0.82 + 0.36 * hs(floor(q)); float ac = 0.34 - 0.26 * v;'
      + '     float dl = clamp(abs(a - ac) / 0.21, 0.0, 1.0); float leg = 1.0 - dl * dl; float creux = 1.0 - smoothstep(0.42, 0.5, a);'
      + '     return (0.25 + 0.75 * leg) * creux * rn; }'
      + '   if (uMat < 1.5) { float lr = fract(p.x / 0.32) - 0.5; return 1.0 - pow(abs(lr) * 2.0, 1.6); }'
      + '   if (uMat < 2.5) { return 0.5 + 0.5 * cos(6.2832 * fract((p.x + p.y) / 0.13)); }'
      + '   float a = 0.5 + 0.5 * cos(6.2832 * p.x / 0.09); float b = 0.5 + 0.5 * cos(6.2832 * p.y / 0.09);'
      + '   return mix(a, b, step(0.5, fract((floor(p.x / 0.09) + floor(p.y / 0.09)) * 0.5))); }'
      + ' void main(){ vec4 t = texture2D(uS, vT); if (t.a < 0.5) discard; vec3 n = normalize(vN); vec3 e = normalize(vE); float de = 0.0;'
      + ' if (dot(n, e) < 0.0) { n = -n; de = 1.0; }'
      // le mode DIAGNOSTIC du banc de rendu : l endroit en vert pur, l envers en rouge pur
      + ' if (uDg > 0.5) { gl_FragColor = de > 0.5 ? vec4(1.0, 0.0, 0.0, 1.0) : vec4(0.0, 1.0, 0.0, 1.0); return; }'
      + ' vec2 p = vT * uTa; float per = uMat < 0.5 ? 0.16 : (uMat < 1.5 ? 0.32 : 0.11);'
      + (der ? ' vec2 dpx = dFdx(p); vec2 dpy = dFdy(p); float fw = max(length(dpx), length(dpy));'
             : ' float fw = length(vE) * 0.0016;')
      // la maille ne se montre que lorsqu elle couvre assez de pixels pour se lire (≥ ~20 px) ; plus petite, elle s efface — et
      // tout à fait sous ~7 px. ⚠ (2026-10-18, sa capture 72) effacée seulement sous ~3 px, elle tombait en poussière de points et
      // en MOIRÉ sur le haut du dos et la poitrine vus de haut (le relief, plus fin que le pixel, échantillonné de travers)
      + ' float vis = 1.0 - smoothstep(per * 0.05, per * 0.15, fw); float h = relief(p);'
      + (der ? ' if (vis > 0.01) { float ep = per * 0.07; float gx = (relief(p + vec2(ep, 0.0)) - h) / ep; float gy = (relief(p + vec2(0.0, ep)) - h) / ep;'
             + '   vec3 qx = dFdx(-vE); vec3 qy = dFdy(-vE); float det = dpx.x * dpy.y - dpx.y * dpy.x;'
             + '   if (abs(det) > 1e-12) { vec3 T = (qx * dpy.y - qy * dpx.y) / det; vec3 B = (qy * dpx.x - qx * dpy.x) / det;'
             + '     T = T - n * dot(n, T); B = B - n * dot(n, B); float lt = length(T); float lb = length(B);'
             + '     if (lt > 1e-6 && lb > 1e-6) { float amp = per * (uMat < 0.5 ? 0.20 : (uMat < 1.5 ? 0.38 : 0.10)) * vis;'
             + '       n = normalize(n - amp * (T / lt * gx + B / lb * gy)); } } }'
             : '')
      // la teinte : la pièce (motif compris), puis les creux de la maille un peu plus sombres et un léger chiné
      + ' vec3 b = mix(t.rgb, vK.rgb, vK.a * uC); float sl = vn(p * 2.2) * 0.6 + vn(p * 6.5) * 0.4;'
      + ' b = b * (1.0 + (h - 0.62) * 0.05 * vis) * (0.982 + 0.036 * sl);'
      // la lumière de studio : principale enveloppante, appoint opposé, ciel, satiné du coton, reflet à peine marqué
      + ' float d = max(0.0, (dot(n, uL) + 0.5) / 1.5); float d2 = d * d * (3.0 - 2.0 * d);'
      + ' vec3 lf = normalize(vec3(-0.75, 0.15, 0.62)); float df = max(0.0, (dot(n, lf) + 0.3) / 1.3);'
      + ' float ciel = 0.22 + 0.16 * (0.5 + 0.5 * n.y); float nv = max(0.0, dot(n, e));'
      + ' float sh = pow(1.0 - nv, 3.0) * (0.55 + 0.45 * d); vec3 hh = normalize(uL + e); float sp = pow(max(0.0, dot(n, hh)), 28.0) * 0.022;'
      + ' vec3 c = b * (ciel * 0.80 + 0.70 * d2 + 0.16 * df) + mix(b, vec3(1.0), 0.45) * sh * 0.24 + vec3(sp);'
      + ' if (de > 0.5) { float o = 0.62 + 0.38 * clamp(1.0 - abs(dot(n, e)), 0.0, 1.0); c = uF * (0.78 + 0.24 * d) * o * (1.0 + (h - 0.62) * 0.08 * vis);'
      // la bande DOUBLE (alpha de la toile < 0,95, voir finitions) : vue de dedans, c est encore la côte, pas l envers du jersey
      + ' if (t.a < 0.95) c = b * 0.92 * (0.78 + 0.24 * d) * o * (1.0 + (h - 0.62) * 0.08 * vis); }'
      + ' gl_FragColor = vec4(c * vO, 1.0); }';
  }
  // la MATIÈRE d une pièce : bord-côte pour les bandes et poignets ; sergé pour jean, pantalon, jupe, casquette ; toile
  // pour chemise, chemisier, robe ; jersey pour le reste (t-shirt, sweat, débardeur, legging, culotte, brassière, tuque)
  function matTissu3(pid){
    var b = (V3 && V3.m && V3.m.base) || '', id = String(pid || '');
    if (/bande|poignet|bord|revers|ceinture|col/.test(id) && b !== 'chemise') return 1;
    if (/^(jean|pantalon|jupe|casquette|bob|short)$/.test(b)) return 2;
    if (/^(chemise|chemisier|robe)$/.test(b)) return 3;
    return 0;
  }
  // aA : l ombre du vêtement sur le mannequin (voir mannequinGL) ; les bijoux, sans tableau, la lisent à 1
  var VS_OBJ = 'attribute vec3 aP; attribute vec3 aN; attribute float aA; uniform mat4 uM; uniform mat4 uV; uniform mat3 uR; varying vec3 vN; varying vec3 vE; varying float vA;'
    + ' void main(){ vec4 p = uV * vec4(aP, 1.0); vE = -p.xyz; vN = uR * aN; vA = aA; gl_Position = uM * vec4(aP, 1.0); }';
  var FS_OBJ = 'precision mediump float; uniform vec3 uL; uniform vec3 uB; uniform float uMet; uniform float uBr; varying vec3 vN; varying vec3 vE; varying float vA;'
    + ' void main(){ vec3 n = normalize(vN); vec3 e = normalize(vE); if (dot(n, e) < 0.0) n = -n; float d = max(0.0, dot(n, uL)); vec3 h = normalize(uL + e);'
    + ' float sp = pow(max(0.0, dot(n, h)), uBr); vec3 env = mix(vec3(0.30, 0.28, 0.26), vec3(1.0, 0.98, 0.95), 0.5 + 0.5 * n.y);'
    + ' vec3 dif = uB * (0.30 + 0.75 * d); vec3 met = uB * env * (0.45 + 0.6 * d); vec3 c = mix(dif, met, uMet) + vec3(sp) * mix(0.5, 1.2, uMet);'
    + ' gl_FragColor = vec4(c * vA, 1.0); }';
  var VS_SOL = 'attribute vec2 aQ; uniform mat4 uM; uniform vec3 uO; uniform float uRay; varying vec2 vQ;'
    + ' void main(){ vQ = aQ; gl_Position = uM * vec4(uO.x + aQ.x * uRay, uO.y, uO.z + aQ.y * uRay * 0.7, 1.0); }';
  var FS_SOL = 'precision mediump float; varying vec2 vQ; void main(){ float a = 0.30 * (1.0 - smoothstep(0.0, 1.0, length(vQ))); gl_FragColor = vec4(0.16 * a, 0.12 * a, 0.09 * a, a); }';
  function progGL(gl, vs, fs){
    var mk = function(t, src){ var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    var p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var o = { p: p, a: {}, u: {} }, na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES), nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < na; i++) { var x = gl.getActiveAttrib(p, i); o.a[x.name] = gl.getAttribLocation(p, x.name); }
    for (var k = 0; k < nu; k++) { var y = gl.getActiveUniform(p, k); o.u[y.name] = gl.getUniformLocation(p, y.name); }
    return o;
  }
  function tampon(gl, data, cible){ var b = gl.createBuffer(); gl.bindBuffer(cible || gl.ARRAY_BUFFER, b); gl.bufferData(cible || gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; }
  function lier(gl, pr, nom, buf, n){
    var l = pr.a[nom]; if (l == null || l < 0) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0);
  }
  function delier(gl){ for (var i = 0; i < 8; i++) gl.disableVertexAttribArray(i); }

  function initGL(cv){
    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: true, preserveDrawingBuffer: true, alpha: true, premultipliedAlpha: true }); } catch (e) { gl = null; }
    if (!gl) { V3.glNon = true; return false; }
    try {
      // la fibre (fsTissu) : avec les dérivées d écran si la carte les offre ; sinon (ou si elle refuse le programme) la
      // version sans relief, puis l ancien tissu — jamais d écran vide
      var der = !!gl.getExtension('OES_standard_derivatives'), progT = null;
      try { progT = progGL(gl, VS_TISSU, fsTissu(der)); } catch (e1) { try { progT = progGL(gl, VS_TISSU, fsTissu(false)); } catch (e2) { progT = progGL(gl, VS_TISSU, FS_TISSU); } }
      GLV = { cv: cv, gl: gl, tissu: progT, obj: progGL(gl, VS_OBJ, FS_OBJ), sol: progGL(gl, VS_SOL, FS_SOL), r: null, cle: '', mailles: [], toiles: {}, inst: [], n: 0 };
    } catch (e) { GLV = null; V3.glNon = true; return false; }
    GLV.solB = tampon(gl, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]));
    var ob = objets3d(); GLV.objets = {};
    Object.keys(ob).forEach(function(k){ GLV.objets[k] = { pos: tampon(gl, ob[k].pos), nor: tampon(gl, ob[k].nor), n: ob[k].n }; });
    // ⚠ les petits textes et les images fines du motif demandent de la définition : 32 px/cm, borné par la carte
    GLV.maxTex = Math.max(1024, Math.min(4096, gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048));
    GLV.aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
    // ⚠ (2026-10-18) seulement si le GLV courant est CELUI de ce canevas : la perte, signalée après coup, de la mini-vue ou d un canevas
    // déjà remplacé effaçait le contexte NEUF de la vue 3D (rien ne s y redessinait plus)
    cv.addEventListener('webglcontextlost', function(ev){ ev.preventDefault(); if (GLV && GLV.cv === cv) { GLV = null; if (VUE === '3d' && V3 && !(V3.neufs > 1)) demander3d(); } });
    return true;
  }


  /* ══ LES CHAPEAUX EN 3D (2026-10-17) ═══════════════════════════════════════
     Montés depuis leurs PIÈCES, autour d une tête au tour du tableau (le site l envoie) :
       · tuque, casquette : n fuseaux (4, 6) forment une coupole — à chaque rang, le tour est n fois la
         largeur du fuseau ; la hauteur se déduit de la longueur du fuseau (le méridien) ;
       · la visière sort à l avant, légèrement baissée ; le revers fait une bande au bas de la tuque ;
       · le bob : la calotte en haut, les deux côtés en tronc de cône, le bord qui retombe.
     Toutes les pièces gardent leur toile : motif, découpes et bijoux s y posent comme ailleurs. */
  function coupole(pc, n, rang0, hauteurBase){
    var c = pc.p.contour, bb = pc.bb, yMax = bb.y1 - 1, J = 24, rangs = [], dy = 0.5;
    for (var y = Math.max(0.05, bb.y0 + 1); y <= yMax + 0.001; y += dy) { var b = bornesXF(c, y); rangs.push({ y: y, r: b ? n * (b.x1 - b.x0) / (2 * Math.PI) : 0.05 }); }
    // la hauteur : le long du méridien, de haut en bas (dh = racine(dy² − dr²)), puis posée sur la base
    var h = 0; rangs[0].h = 0;
    for (var i = 1; i < rangs.length; i++) { var dr = rangs[i].r - rangs[i - 1].r; h -= Math.sqrt(Math.max(0.0001, dy * dy - dr * dr)); rangs[i].h = h; }
    var dec = hauteurBase - rangs[rangs.length - 1].h;
    var mailles = [];
    for (var g = 0; g < n; g++) {
      var th0 = rang0 + 2 * Math.PI * g / n;
      var m = grille3d(rangs.length, J, {
        anneau: function(i){ return { c: [0, rangs[i].h + dec, 0], etat: '' }; },
        point: function(i, j){
          var a = rangs[i], x = bb.x0 + (bb.x1 - bb.x0) * j / J, th = th0 + x / Math.max(0.05, a.r);
          return { p: [Math.sin(th) * a.r * 0.96, a.h + dec, Math.cos(th) * a.r * 1.06], u: (x - bb.x0) / (bb.x1 - bb.x0), v: (a.y - bb.y0) / (bb.y1 - bb.y0) };
        }
      });
      m.pid = pc.p.id; m.pc = pc; m.yp = rangs.map(function(a){ return a.y; }); mailles.push(m);
    }
    return { mailles: mailles, rBase: rangs[rangs.length - 1].r };
  }
  // une bande (revers, côté de bob) : x le long du tour, y vers le bas ; rH en haut, rB en bas
  // ⚠ la HAUTEUR de la pièce (sans la marge de 1 cm de sa toile) va de hHaut à hBas ; « tour » = les cm qui font un tour complet
  function bande(pc, th0, rH, rB, hHaut, hBas, sens, tour){
    var bb = pc.bb, J = 48, R = 14, ya = bb.y0 + 1, yb = bb.y1 - 1;
    var hy = function(y){ return hHaut + (hBas - hHaut) * (y - ya) / Math.max(0.1, yb - ya); }, ry = function(y){ return rH + (rB - rH) * (y - ya) / Math.max(0.1, yb - ya); };
    var mm = grille3d(R, J, {
      anneau: function(i){ var y = bb.y0 + (bb.y1 - bb.y0) * i / (R - 1); return { c: [0, hy(y), 0], etat: '' }; },
      point: function(i, j){
        var y = bb.y0 + (bb.y1 - bb.y0) * i / (R - 1), x = bb.x0 + (bb.x1 - bb.x0) * j / J, r = ry(y), th = th0 + sens * 2 * Math.PI * x / tour;
        return { p: [Math.sin(th) * r * 0.96, hy(y), Math.cos(th) * r * 1.06], u: (x - bb.x0) / (bb.x1 - bb.x0), v: (y - bb.y0) / (bb.y1 - bb.y0) };
      }
    });
    mm.pid = pc.p.id; mm.pc = pc; mm.yp = []; for (var i = 0; i < R; i++) mm.yp.push(bb.y0 + (bb.y1 - bb.y0) * i / (R - 1));
    return mm;
  }
  // une pièce posée À PLAT (calotte, visière, bord) : f(x, y) → point 3D ; centre pour orienter la normale
  function aPlat(pc, f, centre){
    var bb = pc.bb, J = 40, R = 30, mm = grille3d(R, J, {
      anneau: function(){ return { c: centre, etat: '' }; },
      point: function(i, j){ var x = bb.x0 + (bb.x1 - bb.x0) * j / J, y = bb.y0 + (bb.y1 - bb.y0) * i / (R - 1); return { p: f(x, y), u: (x - bb.x0) / (bb.x1 - bb.x0), v: (y - bb.y0) / (bb.y1 - bb.y0) }; }
    });
    mm.pid = pc.p.id; mm.pc = pc; mm.yp = []; for (var i = 0; i < R; i++) mm.yp.push(bb.y0 + (bb.y1 - bb.y0) * i / (R - 1));
    return mm;
  }
  function maillesTete(r, pieces){
    var out = [], base = V3.m.base, T = (r.tete || 56) + 1;
    if (base === 'tuque' && pieces.fuseau) {
      var cp = coupole(pieces.fuseau, 4, Math.PI / 4, 0); out = out.concat(cp.mailles);
      if (pieces.revers) { var wr = pieces.revers.bb.x1 - pieces.revers.bb.x0 - 2; out.push(bande(pieces.revers, 0, cp.rBase + 0.4, cp.rBase + 0.4, 7, -1, 1, wr)); }
    }
    if (base === 'casquette' && pieces.panneau) {
      var cq = coupole(pieces.panneau, 6, 0, 0); out = out.concat(cq.mailles);
      if (pieces.visiere) {
        var v = pieces.visiere, r0 = cq.rBase;
        // l arc intérieur se colle au bas de la calotte, à l avant ; la visière sort en s inclinant de 12°
        // la visière s incurve : ses côtés descendent (comme une visière cintrée), sa pointe avance un peu baissée
        var av = (boiteC(v.p.contour).rx) || 10;
        out.push(aPlat(v, function(x, y){ var phi = x / r0, d = Math.max(0, y + 3), rr = r0 - 0.4 + d * 0.98, cb = (x / av) * (x / av); return [Math.sin(phi) * rr * 0.96, 0.4 - d * 0.16 - cb * (1.2 + d * 0.25), Math.cos(phi) * rr * 1.06]; }, [0, -30, 0]));
      }
    }
    if (base === 'bob' && pieces.cote) {
      var rB = T / (2 * Math.PI), hC = 8, rT = rB * 0.95;
      out.push(bande(pieces.cote, -Math.PI / 2, rT, rB, hC, 0, 1, T));
      out.push(bande(pieces.cote, Math.PI / 2, rT, rB, hC, 0, 1, T));
      if (pieces.calotte) { var bc = boiteC(pieces.calotte.p.contour); out.push(aPlat(pieces.calotte, function(x, y){ return [x * rT * 0.96 / bc.rx, hC + 0.6 - (x * x / (bc.rx * bc.rx) + y * y / (bc.rz * bc.rz)) * 0.6, y * rT * 1.06 / bc.rz]; }, [0, -30, 0])); }
      if (pieces.bord) [0, Math.PI].forEach(function(o){
        out.push(aPlat(pieces.bord, function(x, y){ var rho = Math.hypot(x, y), al = Math.atan2(y, x) + o + Math.PI / 2, d = Math.max(0, rho - rB); return [Math.sin(al) * rho * 0.96, -d * 0.42, Math.cos(al) * rho * 1.06]; }, [0, -30, 0]));
      });
    }
    return out;
  }
  function boiteC(c){ var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; c.forEach(function(q){ x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }); return { rx: Math.max(1, (x1 - x0) / 2), rz: Math.max(1, (y1 - y0) / 2) }; }


  /* ══ LE DRAPÉ (2026-10-17, sa demande : « ce n est pas beau, il faut que tu améliores le rendu vraiment
     mieux que ça ») ═══════════════════════════════════════════════════════════════════════════════
     Le plaquage sur des anneaux ne COUD rien : l épaule restait ouverte, la tête de manche flottait, les
     plis étaient dessinés. Ici le vêtement est DRAPÉ, comme dans les logiciels de mode (en version légère) :
       · chaque sommet d une pièce devient une particule ; ses mailles gardent leur LONGUEUR DU PATRON
         (la vraie, en cm) ;
       · les bords qui se touchent au départ (côtés, épaules, tête de manche) sont SOUDÉS ;
       · un CORPS invisible aux mesures du tableau repousse le tissu ;
       · la PESANTEUR tire ; le vêtement est TENU au cou et aux épaules (un haut) ou à la ceinture (un bas).
     Méthode : dynamique par positions (PBD), quelques dizaines de pas — une à deux secondes. */
  function contourPts(c){
    var pts = []; for (var i = 0; i < c.length; i++) { var a = c[i === 0 ? c.length - 1 : i - 1], b = c[i];
      for (var k = 1; k <= 8; k++) { var t = k / 8; if (b.c1 && b.c2) { var u = 1 - t; pts.push([u * u * u * a.x + 3 * u * u * t * b.c1.x + 3 * u * t * t * b.c2.x + t * t * t * b.x, u * u * u * a.y + 3 * u * u * t * b.c1.y + 3 * u * t * t * b.c2.y + t * t * t * b.y]); } else pts.push([a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t]); } }
    return pts;
  }
  function dansPoly(pts, x, y){
    var d = false; for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) { var a = pts[i], b = pts[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) d = !d; }
    return d;
  }
  /* Le corps : chaque tube est une suite d anneaux le long de son axe (du premier au dernier centre). */
  /* LES ÉPAULES DU CORPS (2026-10-17, vu avec le mannequin) : le site donne un tronc qui monte droit jusqu au cou
     et deux bras posés à côté — PAS d épaules. Le vêtement n avait rien sur quoi se poser (une boîte plate, que le
     mannequin traversait). On ajoute la ligne d épaules : une capsule d un bras à l autre, à la hauteur des
     articulations, et l on arrondit le haut de chaque bras (une demi-sphère au lieu d un disque). */
  function corpsComplet(tubes){
    tubes = (tubes || []).slice();
    var bras = tubes.filter(function(t){ return /bras/.test(t.nom || '') && (t.anneaux || []).length > 1; });
    if (bras.length === 2) {
      var a0 = bras[0].anneaux[0], b0 = bras[1].anneaux[0], xg = Math.max(Math.abs(a0.c.x), Math.abs(b0.c.x)), yj = (a0.c.y + b0.c.y) / 2;
      var tr = tubes.filter(function(t){ return /tronc/.test(t.nom || ''); })[0], rzT = 7;
      if (tr) { var pr = tr.anneaux.reduce(function(m, a){ return !m || Math.abs(a.c.y - yj) < Math.abs(m.c.y - yj) ? a : m; }, null); if (pr) rzT = pr.rz; }
      // la PENTE d une épaule : du bas du cou (le haut du tronc) à l articulation du bras ; le dessus de la capsule
      // suit cette pente, son épaisseur (rx, verticale) est celle d une épaule, sa profondeur celle du tronc
      var yN = tr ? tr.anneaux[tr.anneaux.length - 1].c.y : yj + 6, ep = [], n = 15;
      // l anneau du tronc à une hauteur (interpolé)
      var anneauTronc = function(h){ if (!tr) return null; var A = tr.anneaux;
        for (var q = 0; q + 1 < A.length; q++) if ((A[q].c.y - h) * (A[q + 1].c.y - h) <= 0) { var u = (h - A[q].c.y) / ((A[q + 1].c.y - A[q].c.y) || 1);
          return { rx: A[q].rx + (A[q + 1].rx - A[q].rx) * u, rz: A[q].rz + (A[q + 1].rz - A[q].rz) * u }; }
        return null; };
      for (var k = 0; k < n; k++) {
        var u = -1 + 2 * k / (n - 1), x = u * xg, bout = Math.abs(u), pente = Math.min(1, Math.max(0, (bout * xg - 6) / Math.max(1, xg - 6)));
        /* ⚠ (2026-10-18, sa remarque : « des manches ballon ») AU BOUT DE L ÉPAULE, la capsule REJOINT LE BRAS : même hauteur que le
           dessus du bras à l articulation, même épaisseur, même profondeur. Elle s arrêtait 1 cm plus bas et plus mince : la boule
           de l articulation dépassait au-dessus de la ligne d épaule, et le vêtement passait par-dessus en épaulette. */
        var pf = Math.pow(pente, 0.8), haut2 = yN - 0.5 - (yN - 0.5 - (yj + a0.rx)) * pf, rv = 2.6 + (a0.rx - 2.6) * pente;
        // (2026-10-17) un peu MOINS profonde que le buste dessous : plus profonde, elle faisait une marche — un rectangle en
        // relief sous le tissu, en haut de la poitrine
        /* ⚠ (2026-10-18, banc 3D) et au bout, la MÊME PROFONDEUR que le bras : le disque qui ferme la capsule était plus profond
           (5,2 cm contre 3,8) — il dépassait devant et derrière l articulation, et le corps du vêtement y faisait une corne. */
        var rzC = Math.max(a0.rz, rzT * (0.74 - 0.2 * pente)), rzE = a0.rz + (rzC - a0.rz) * (1 - pente * pente);
        /* ⚠ (2026-10-18, son chemisier vu de face-dessus) DANS la largeur du tronc, la capsule ne dépasse pas son devant ni son dos :
           elle sortait de 2 à 5 mm sur la poitrine — des taches blanches (sa surface regarde le haut, elle prend la lumière), un
           croissant blanc dans l encolure, et une marche sous le tissu. Jamais plus mince que le bras. */
        var at = anneauTronc(haut2 - rv);
        if (at && Math.abs(x) < at.rx) rzE = Math.max(a0.rz, Math.min(rzE, at.rz * Math.sqrt(1 - (x / at.rx) * (x / at.rx)) - 0.3));
        ep.push({ c: { x: x, y: haut2 - rv, z: 0 }, rx: rv, rz: rzE });
      }
      tubes.push({ nom: 'epaules', anneaux: ep });
      /* ⚠ (2026-10-18, banc 3D) LE HAUT DU TRONC SOUS LA LIGNE D ÉPAULES : le tronc du site est une boîte (16 cm de demi-largeur
         à 3 cm sous le cou) — des épaules carrées, qui dépassaient la capsule de 4 cm au milieu de l épaule depuis que les bras
         sont abaissés. Le tissu, repoussé de côté, s entassait au point d épaule. Chaque anneau du haut est borné à la largeur où
         le dessus de la capsule passe à sa hauteur. */
      if (tr) {
        var dess = ep.filter(function(a){ return a.c.x >= 0; }).sort(function(a, b){ return a.c.x - b.c.x; }).map(function(a){ return [a.c.x, a.c.y + a.rx]; });
        // au-dessus du dessus de la capsule, c est le COU (la chemise M finissait le tronc en boîte de 8,9 cm à 1 cm sous le cou :
        // son dessus plat se voyait, blanc, dans l encolure)
        var tete = tubes.filter(function(t){ return /tete/.test(t.nom || '') && (t.anneaux || []).length; })[0], a0t = tete ? tete.anneaux[0] : null;
        var xCap = function(h){ if (h > dess[0][1]) return a0t ? a0t.rx : null; if (h <= dess[dess.length - 1][1]) return null;
          for (var d = 0; d + 1 < dess.length; d++) if (dess[d + 1][1] <= h) { var p0 = dess[d], p1 = dess[d + 1]; return p0[0] + (p1[0] - p0[0]) * (p0[1] - h) / ((p0[1] - p1[1]) || 1); }
          return null; };
        var rCou = tr.anneaux[tr.anneaux.length - 1].rx;
        tubes = tubes.map(function(t){ if (t !== tr) return t;
          return Object.assign({}, t, { anneaux: t.anneaux.map(function(a){ var xc = xCap(a.c.y), cou = a0t && a.c.y > dess[0][1];
            if (cou) return Object.assign({}, a, { rx: Math.min(a.rx, a0t.rx), rz: Math.min(a.rz, a0t.rz) });
            return xc != null && a.rx > xc ? Object.assign({}, a, { rx: Math.max(rCou, xc) }) : a; }).concat(
            // et le tronc va JUSQU AU cou : celui de la chemise M s arrêtait 1 cm dessous — une bande vide sous le cou
            a0t && a0t.c.y > t.anneaux[t.anneaux.length - 1].c.y + 0.05 ? [Object.assign({}, a0t, { c: { x: a0t.c.x, y: a0t.c.y, z: a0t.c.z || 0 } })] : []) }); });
      }
      /* LA POITRINE (2026-10-17, sa référence : sur le mannequin Fal.ai, le t-shirt a du VOLUME devant). Le tronc du site
         est une ellipse lisse. ⚠ Deux sphères faisaient deux bosses où le tissu collait comme un film : un t-shirt JETTE
         UN PONT de l une à l autre. Une seule BANDE de buste, couchée d un flanc à l autre, dont l avant suit le devant
         du tronc + un galbe discret (0,9 cm au plus, 0,25 au milieu ; plus haut et plus doux, sinon une robe ajustée y faisait une marche) ; son arrière reste dans le tronc. */
      if (tr) {
        var poi = null; tr.anneaux.forEach(function(a){ if (a.c.y < yj - 5 && a.c.y > yj - 24 && (!poi || a.rz > poi.rz)) poi = a; });
        if (poi) {
          var bd = [], nb5 = 17, X5 = poi.rx * 0.72;
          for (var q5 = 0; q5 < nb5; q5++) {
            var x5 = -X5 + 2 * X5 * q5 / (nb5 - 1), fr = poi.rz * Math.sqrt(Math.max(0.05, 1 - (x5 / poi.rx) * (x5 / poi.rx)));
            var gal = 0.25 + 0.65 * Math.exp(-Math.pow((Math.abs(x5) - poi.rx * 0.4) / (poi.rx * 0.28), 2)), bout5 = Math.abs(x5) / X5;
            var R5 = fr * 0.6, cz5 = (poi.c.z || 0) + fr + gal * (1 - bout5 * bout5) - R5;
            bd.push({ c: { x: x5, y: poi.c.y + 1.5, z: cz5 }, rx: 9 * (1 - 0.4 * bout5 * bout5), rz: R5 });
          }
          tubes.push({ nom: 'poitrine', anneaux: bd });
        }
      }
      tubes = tubes.map(function(t){
        if (!/bras/.test(t.nom || '')) return t;
        var an = t.anneaux, c0 = an[0].c, c1 = an[1].c, ax = unit3([c1.x - c0.x, c1.y - c0.y, 0]), cap = [];
        for (var q = 5; q >= 1; q--) { var th = q / 5 * Math.PI / 2, d = Math.sin(th) * an[0].rx, rr = Math.cos(th);
          cap.push({ c: { x: c0.x - ax[0] * d, y: c0.y - ax[1] * d, z: c0.z || 0 }, rx: Math.max(0.3, an[0].rx * rr), rz: Math.max(0.3, an[0].rz * rr) }); }
        return Object.assign({}, t, { anneaux: cap.concat(an) });
      });
    }
    return tubes;
  }
  function corpsDrape(tubes){
    return (corpsComplet(tubes) || []).filter(function(t){ return (t.anneaux || []).length > 1; }).map(function(t){
      var an = t.anneaux, c0 = an[0].c, c1 = an[an.length - 1].c, ax = unit3([c1.x - c0.x, c1.y - c0.y, (c1.z || 0) - (c0.z || 0)]);
      var proj = an.map(function(a){ return (a.c.x - c0.x) * ax[0] + (a.c.y - c0.y) * ax[1] + ((a.c.z || 0) - (c0.z || 0)) * ax[2]; });
      var vertical = Math.abs(ax[1]) > 0.9, rmax = 0; an.forEach(function(a){ rmax = Math.max(rmax, a.rx, a.rz); });
      return { nom: String(t.nom || ''), an: an, c0: c0, ax: ax, u: unit3(croix3(ax, [0, 0, 1])), proj: proj, vertical: vertical, rmax: rmax, pmin: Math.min(proj[0], proj[proj.length - 1]), pmax: Math.max(proj[0], proj[proj.length - 1]) };
    });
  }
  function repousser(PX, k, tubes, marge){
    var x = PX[k * 3], y = PX[k * 3 + 1], z = PX[k * 3 + 2];
    // ⚠ (2026-10-18, banc 3D) jusqu à TROIS passes : au creux de l aisselle (bras abaissé contre le tronc), le bras repoussait dans
    // le tronc ce que le tronc venait de sortir — des sommets restaient 0,5 cm dedans
    for (var passe = 0, bouge = true; passe < 3 && bouge; passe++) { bouge = false;
    for (var t = 0; t < tubes.length; t++) {
      var T = tubes[t], q = (x - T.c0.x) * T.ax[0] + (y - T.c0.y) * T.ax[1] + (z - (T.c0.z || 0)) * T.ax[2];
      // ⚠ (2026-10-18, banc 3D) PAS de marge au bout de la ligne d épaules : ses bouts sont DANS la boule du bras, et le centimètre
      // de plus en faisait un cylindre invisible à plein rayon — il soulevait le tissu de 1,5 cm juste après le point d épaule (une corne)
      var tol = T.nom === 'epaules' ? 0 : 1;
      if (q < T.pmin - tol || q > T.pmax + tol) continue;
      // l anneau à cette hauteur de l axe (interpolé)
      var an = T.an, pr = T.proj, i = 0; var mont = pr[pr.length - 1] > pr[0];
      while (i + 1 < pr.length - 1 && (mont ? pr[i + 1] < q : pr[i + 1] > q)) i++;
      var u = Math.max(0, Math.min(1, (q - pr[i]) / ((pr[i + 1] - pr[i]) || 1))), a = an[i], b = an[i + 1];
      var cx = a.c.x + (b.c.x - a.c.x) * u, cy = a.c.y + (b.c.y - a.c.y) * u, cz = (a.c.z || 0) + ((b.c.z || 0) - (a.c.z || 0)) * u;
      var rx = a.rx + (b.rx - a.rx) * u + marge, rz = a.rz + (b.rz - a.rz) * u + marge;
      var dx = x - cx, dy = y - cy, dz = z - cz, pa = dx * T.ax[0] + dy * T.ax[1] + dz * T.ax[2];
      dx -= T.ax[0] * pa; dy -= T.ax[1] * pa; dz -= T.ax[2] * pa;
      // ⚠ un tube couché (bras, ligne d épaules) est une ELLIPSE dans son plan (rx le long de u = axe × z, rz le
      // long de z) — le même repère que le mannequin peint ; une sphère au rayon moyen laissait la capsule
      // des épaules traverser le tissu
      var e; if (T.vertical) e = Math.sqrt((dx / rx) * (dx / rx) + (dz / rz) * (dz / rz));
      else { var uu = T.u, du = dx * uu[0] + dy * uu[1] + dz * uu[2]; e = Math.sqrt((du / rx) * (du / rx) + (dz / rz) * (dz / rz)); }
      if (e < 1 && e > 1e-4) { var f = 1 / e; x = cx + T.ax[0] * pa + dx * f; y = cy + T.ax[1] * pa + dy * f; z = cz + T.ax[2] * pa + dz * f; bouge = passe < 2; }
    }
    }
    PX[k * 3] = x; PX[k * 3 + 1] = y; PX[k * 3 + 2] = z;
  }
  /* epingle(ma, i, j) : vrai = tenu (ne bouge pas). Renvoie le nombre de soudures posées (pour le banc d essai). */
  function draper(mailles, tubesCorps, epingle, pas, longueursPatron){
    var N = 0;
    mailles.forEach(function(ma){
      var R = ma.R, J = ma.J, bb = ma.pc.bb, n = R * (J + 1), polys = [contourPts(ma.pc.p.contour)].concat(ma.pc.mir ? [contourPts(ma.pc.mir)] : []);
      var dedans = new Uint8Array(n), act = new Uint8Array(n);
      for (var i = 0; i < R; i++) for (var j = 0; j <= J; j++) { var x = bb.x0 + (bb.x1 - bb.x0) * j / J; if (polys.some(function(pp){ return dansPoly(pp, x, ma.yp[i]); })) dedans[i * (J + 1) + j] = 1; }
      for (var i2 = 0; i2 < R; i2++) for (var j2 = 0; j2 <= J; j2++) if (dedans[i2 * (J + 1) + j2]) for (var di = -1; di <= 1; di++) for (var dj = -1; dj <= 1; dj++) { var a = i2 + di, b = j2 + dj; if (a >= 0 && a < R && b >= 0 && b <= J) act[a * (J + 1) + b] = 1; }
      ma.act = act; ma.dedans = dedans; ma.gid = new Int32Array(n).fill(-1);
      for (var k = 0; k < n; k++) if (act[k]) ma.gid[k] = N++;
    });
    if (!N) return 0;
    var PX = new Float32Array(N * 3), V = new Float32Array(N * 3), W = new Float32Array(N).fill(1);
    var CA = [], CB = [], CL = [], CK = [];
    var lien = function(a, b, L, k){ if (a < 0 || b < 0) return; CA.push(a); CB.push(b); CL.push(L); CK.push(k); };
    var bords = [];
    mailles.forEach(function(ma, mi){
      var R = ma.R, J = ma.J, bb = ma.pc.bb, dx = (bb.x1 - bb.x0) / J, g = ma.gid;
      for (var i = 0; i < R; i++) for (var j = 0; j <= J; j++) {
        var k = i * (J + 1) + j, id = g[k]; if (id < 0) continue;
        PX[id * 3] = ma.pos[k * 3]; PX[id * 3 + 1] = ma.pos[k * 3 + 1]; PX[id * 3 + 2] = ma.pos[k * 3 + 2];
        if (epingle(ma, i, j)) W[id] = 0;
        var dy = i + 1 < R ? Math.abs(ma.yp[i + 1] - ma.yp[i]) : 1;
        if (j < J) lien(id, g[k + 1], dx, 1);
        if (i + 1 < R) { lien(id, g[k + J + 1], dy, 1); if (j < J) lien(id, g[k + J + 2], Math.hypot(dx, dy), 0.6); if (j > 0) lien(id, g[k + J], Math.hypot(dx, dy), 0.6); }
        if (j + 2 <= J) lien(id, g[k + 2], 2 * dx, 0.12);
        if (i + 2 < R) lien(id, g[k + 2 * (J + 1)], dy + (i + 2 < R ? Math.abs(ma.yp[i + 2] - ma.yp[i + 1]) : dy), 0.12);
        // un BORD : un sommet de la pièce qui touche le vide (ou le bout de la grille)
        if (ma.dedans[k] && (j === 0 || j === J || i === 0 || i === R - 1 || !ma.dedans[k - 1] || !ma.dedans[k + 1] || !ma.dedans[k - J - 1] || !ma.dedans[k + J + 1])) bords.push({ id: id, m: mi, i: i, j: j });
      }
    });
    // LES COUTURES : celles du patron (couturesPatron), point pour point
    var soudes = 0;
    (couturesPatron(mailles) || []).forEach(function(pr){ lien(pr[0], pr[1], 0, 1); soudes++; });
    var nC = CA.length, A = Int32Array.from(CA), B = Int32Array.from(CB), L = Float32Array.from(CL), K = Float32Array.from(CK);
    /* ⚠ LA FORME DE DÉPART EST GARDÉE (vu à l essai) : avec les longueurs du PATRON, la tête de manche — plus
       longue que l emmanchure, c est l embu — débordait au-dessus de l épaule en épaulette carrée. Les mailles
       gardent donc leur longueur de départ ; seules les COUTURES (longueur 0) se ferment, et le maillage se
       déforme en douceur autour d elles. Les plis viennent de la « vie du tissu ». */
    if (!longueursPatron) for (var cz = 0; cz < nC; cz++) if (L[cz] > 0) { var za = A[cz] * 3, zb = B[cz] * 3; L[cz] = Math.hypot(PX[zb] - PX[za], PX[zb + 1] - PX[za + 1], PX[zb + 2] - PX[za + 2]); }
    /* ⚠ UN RELÂCHEMENT ANCRÉ, PAS UNE CHUTE LIBRE (vu à l essai) : tenu au seul cou, le vêtement glissait et se
       tordait d un côté. Chaque particule est rappelée DOUCEMENT vers sa pose de départ (qui est bonne) : le drapé
       coud les bords, rend au tissu ses longueurs et le laisse tomber un peu — il ne le promène pas. */
    var P0 = PX.slice(), ancre = 0.012;
    var tubes = corpsDrape(tubesCorps), G = -0.01, iters = 8, n3 = N * 3;
    for (var s = 0; s < (pas || 60); s++) {
      for (var p = 0; p < N; p++) { if (!W[p]) continue; var o3 = p * 3; V[o3 + 1] += G; PX[o3] += V[o3] * 0.9; PX[o3 + 1] += V[o3 + 1] * 0.9; PX[o3 + 2] += V[o3 + 2] * 0.9; }
      var avant = PX.slice();
      for (var it = 0; it < iters; it++) {
        for (var c3 = 0; c3 < nC; c3++) {
          var a3 = A[c3] * 3, b3 = B[c3] * 3, wa = W[A[c3]], wb = W[B[c3]], ws = wa + wb; if (!ws) continue;
          var ex = PX[b3] - PX[a3], ey = PX[b3 + 1] - PX[a3 + 1], ez = PX[b3 + 2] - PX[a3 + 2], d = Math.sqrt(ex * ex + ey * ey + ez * ez) || 1e-6;
          var f = (d - L[c3]) / d * K[c3] / ws;
          PX[a3] += ex * f * wa; PX[a3 + 1] += ey * f * wa; PX[a3 + 2] += ez * f * wa;
          PX[b3] -= ex * f * wb; PX[b3 + 1] -= ey * f * wb; PX[b3 + 2] -= ez * f * wb;
        }
        for (var qa = 0; qa < N; qa++) if (W[qa]) { var oa = qa * 3; PX[oa] += (P0[oa] - PX[oa]) * ancre; PX[oa + 1] += (P0[oa + 1] - PX[oa + 1]) * ancre * 0.5; PX[oa + 2] += (P0[oa + 2] - PX[oa + 2]) * ancre; }
        if (it === iters - 1 || it % 3 === 0) for (var q = 0; q < N; q++) if (W[q]) repousser(PX, q, tubes, 0.35);
      }
      // la vitesse : ce que le pas a VRAIMENT fait (amorti), pas ce qu on avait prévu
      for (var v = 0; v < n3; v++) V[v] = (PX[v] - avant[v]) * 0.6 + V[v] * 0.25;
    }
    mailles.forEach(function(ma){ var g = ma.gid; for (var k = 0; k < g.length; k++) if (g[k] >= 0) { ma.pos[k * 3] = PX[g[k] * 3]; ma.pos[k * 3 + 1] = PX[g[k] * 3 + 1]; ma.pos[k * 3 + 2] = PX[g[k] * 3 + 2]; } });
    /* UN LISSAGE LÉGER après le drapé : l embu de la tête de manche se tassait en petits froissés. Les sommets
       cousus et tenus ne bougent pas ; les manches se lissent davantage que le corps. */
    var cousu = new Uint8Array(N); for (var cc = 0; cc < nC; cc++) if (L[cc] === 0) { cousu[A[cc]] = 1; cousu[B[cc]] = 1; }
    /* ⚠ (2026-10-17) LES COUTURES SE LISSENT AUSSI : chaque point de couture est tiré seul, ses voisins non — exclus du
       lissage, les points cousus et les bords laissaient un froissé en dents de scie le long des emmanchures et des
       côtés. On lisse chaque sommet sur les voisins qui EXISTENT (un bord n en a que deux ou trois), puis on referme
       chaque couture sur son point milieu ; les sommets tenus (l encolure) ne bougent pas. */
    var maDe = [], kDe = new Int32Array(N);
    mailles.forEach(function(ma, mi){ for (var k = 0; k < ma.gid.length; k++) if (ma.gid[k] >= 0) { maDe[ma.gid[k]] = mi; kDe[ma.gid[k]] = k; } });
    var refermer = function(){ for (var cz2 = 0; cz2 < nC; cz2++) if (L[cz2] === 0) {
      var ga = A[cz2], gb = B[cz2], ma1 = mailles[maDe[ga]], mb1 = mailles[maDe[gb]], ka = kDe[ga] * 3, kb = kDe[gb] * 3;
      for (var c5 = 0; c5 < 3; c5++) { var mm = W[ga] && W[gb] ? (ma1.pos[ka + c5] + mb1.pos[kb + c5]) / 2 : (W[ga] ? mb1.pos[kb + c5] : ma1.pos[ka + c5]); ma1.pos[ka + c5] = mm; mb1.pos[kb + c5] = mm; } } };
    for (var ps = 0; ps < 4; ps++) {
      mailles.forEach(function(ma){
        if (ps >= (ma.pid === 'manche' ? 4 : 3)) return;
        var R = ma.R, J = ma.J, g = ma.gid, pos = ma.pos, nv = pos.slice();
        for (var i = 0; i < R; i++) for (var j = 0; j <= J; j++) {
          var k = i * (J + 1) + j; if (g[k] < 0 || !W[g[k]]) continue;
          var vs = []; if (j > 0) vs.push(k - 1); if (j < J) vs.push(k + 1); if (i > 0) vs.push(k - J - 1); if (i + 1 < R) vs.push(k + J + 1);
          vs = vs.filter(function(q){ return g[q] >= 0; }); if (vs.length < 2) continue;
          var poids = cousu[g[k]] ? 0.35 : 0.45;
          for (var c4 = 0; c4 < 3; c4++) { var m4 = 0; vs.forEach(function(q){ m4 += pos[q * 3 + c4]; }); m4 /= vs.length; nv[k * 3 + c4] = pos[k * 3 + c4] * (1 - poids) + m4 * poids; }
        }
        pos.set(nv);
      });
      refermer();
    }
    // ⚠ une DERNIÈRE collision : le lissage pouvait renfoncer un peu de tissu dans le corps (le mannequin perçait à l emmanchure)
    mailles.forEach(function(ma){ var g = ma.gid; for (var k = 0; k < g.length; k++) if (g[k] >= 0) { PX[g[k] * 3] = ma.pos[k * 3]; PX[g[k] * 3 + 1] = ma.pos[k * 3 + 1]; PX[g[k] * 3 + 2] = ma.pos[k * 3 + 2]; } });
    for (var q2 = 0; q2 < N; q2++) if (W[q2]) repousser(PX, q2, tubes, 0.45);
    mailles.forEach(function(ma){ var g = ma.gid; for (var k = 0; k < g.length; k++) if (g[k] >= 0) { ma.pos[k * 3] = PX[g[k] * 3]; ma.pos[k * 3 + 1] = PX[g[k] * 3 + 1]; ma.pos[k * 3 + 2] = PX[g[k] * 3 + 2]; } });
    // LE BORD LISSÉ LE LONG DE LUI-MÊME (2026-10-17, vu de près : la couture d emmanchure en escalier) : la bande des
    // sommets autour du contour (le dernier rang du dedans et le premier du dehors) se lisse sur ses seuls voisins de
    // bande — le zigzag le long du bord s efface sans tirer le tissu vers l intérieur ; puis les coutures se referment
    mailles.forEach(function(ma){ lisserBord(ma, W); });
    refermer();
    mailles.forEach(function(ma){ var g = ma.gid; for (var k = 0; k < g.length; k++) if (g[k] >= 0) { PX[g[k] * 3] = ma.pos[k * 3]; PX[g[k] * 3 + 1] = ma.pos[k * 3 + 1]; PX[g[k] * 3 + 2] = ma.pos[k * 3 + 2]; } });
    for (var q3 = 0; q3 < N; q3++) if (W[q3]) repousser(PX, q3, tubes, 0.45);
    mailles.forEach(function(ma){ var g = ma.gid; for (var k = 0; k < g.length; k++) if (g[k] >= 0) { ma.pos[k * 3] = PX[g[k] * 3]; ma.pos[k * 3 + 1] = PX[g[k] * 3 + 1]; ma.pos[k * 3 + 2] = PX[g[k] * 3 + 2]; } });
    mailles.forEach(function(ma){ normalesGrille(ma); });
    return soudes;
  }
  /* ══ LE HAUT RELÂCHÉ (2026-10-18, sa capture en XS : « encore terrible » — échardes à l épaule, fentes à
     l emmanchure, tête de manche en pointe ; « je veux que tu te fasses des bancs de rendu… aucun défaut »).
     Mesuré par tools/banc-3d-haut.js : sous l emmanchure, le tissu était étiré 2,3 fois en hauteur (le passage
     par-dessus l épaule consommait plus de longueur que le patron n en donne, et le retour aux anneaux l absorbait
     d un coup) ; la tête de manche, un dôme refermé en POINTE, étirait ses derniers rangs jusqu à 10 fois.
       1. la tête de manche n est plus un dôme : c est un RACCORD entre l emmanchure du corps (le devant et le dos,
          point pour point, par fraction de longueur) et l anneau du bras sous l aisselle — plus de pointe ;
       2. un RELÂCHEMENT sur les longueurs du PATRON : le tissu résiste à l étirement, cède à la compression (l embu),
          et le corps le repousse ; les coutures sont cousues en points VIRTUELS — le point exact du bord, interpolé
          comme le GPU dessine le triangle — et non au sommet le plus proche (qui tirait le tissu en dents de scie).
     Les plis de la vie du tissu sont ôtés avant et reposés après, le long de la nouvelle normale. */
  // le point d une maille sous un point (x, y) du patron : 3 sommets et leurs poids — ceux du triangle DESSINÉ
  function pointVirtuel(ma, x, y){
    var R = ma.R, J = ma.J, bb = ma.pc.bb, yp = ma.yp, i = 0;
    while (i + 2 < R && yp[i + 1] < y) i++;
    var fy = Math.max(0, Math.min(1, (y - yp[i]) / ((yp[i + 1] - yp[i]) || 1)));
    var fj = (x - bb.x0) / (bb.x1 - bb.x0) * J, j = Math.max(0, Math.min(J - 1, Math.floor(fj))), fx = Math.max(0, Math.min(1, fj - j));
    var v0 = i * (J + 1) + j, v1 = v0 + 1, w0 = v0 + J + 1, w1 = w0 + 1;
    // grille3d coupe chaque carré par sa diagonale v0 → w1 : (v0, w0, w1) d un côté, (v0, w1, v1) de l autre
    // (v0, w0, w1) : v0 + fy (w0 - v0) + fx (w1 - w0) ; (v0, w1, v1) : v0 + fx (v1 - v0) + fy (w1 - v1)
    return fx <= fy ? { k: [v0, w0, w1], w: [1 - fy, fy - fx, fx] } : { k: [v0, w1, v1], w: [1 - fx, fy, fx - fy] };
  }
  function posVirtuel(ma, pv){
    var o = [0, 0, 0];
    for (var t = 0; t < 3; t++) { var k = pv.k[t] * 3, w = pv.w[t]; o[0] += ma.pos[k] * w; o[1] += ma.pos[k + 1] * w; o[2] += ma.pos[k + 2] * w; }
    return o;
  }
  function coteMaille(ma){ var sx = 0, n = 0; for (var k = 0; k < ma.pos.length; k += 30) { sx += ma.pos[k]; n++; } return (sx / Math.max(1, n)) >= 0 ? 1 : -1; }
  // la hauteur du bord de tête à un x du patron de manche, et sa fraction de longueur depuis le sommet de tête
  function bordTete(cap, x){
    var p = cap.pts, L = cap.L, ax = Math.abs(x);
    for (var i = 0; i + 1 < p.length; i++) {
      var a = Math.abs(p[i][0]), b = Math.abs(p[i + 1][0]);
      if ((ax - a) * (ax - b) <= 0 && a !== b) { var u = (ax - a) / (b - a); return { y: p[i][1] + (p[i + 1][1] - p[i][1]) * u, f: (L[i] + (L[i + 1] - L[i]) * u) / cap.tot }; }
    }
    var last = p[p.length - 1]; return ax <= Math.abs(p[0][0]) ? { y: p[0][1], f: 0 } : { y: last[1], f: 1 };
  }
  /* L EMBU SOUTENU (2026-10-18, banc 3D) : la couture de tête est plus longue que l emmanchure (l embu). Posée par fraction de
     longueur, la différence se répartissait partout — jusque sous le bras, où la tête n a pas la place de l absorber : ~25 replis
     retournés par manche le long du bas d emmanchure. Comme une couturière qui « soutient » la tête, on ne met AUCUN embu sur le
     bas (45 % inférieurs de chaque demi-tête : un centimètre de tête pour un centimètre d emmanchure), et tout le surplus sur le
     haut, où la tête s arrondit. g(u) : la fraction d emmanchure où va la fraction u de tête (u = 0 au sommet, 1 sous le bras). */
  function embu(Lc, Lb){
    var r = Lb / Math.max(1e-6, Lc); if (!(r < 0.999)) return function(u){ return u; };
    var a = 0.35, w = 0.2, H = 1 - a - w / 2, k0 = Math.max(0.5, (r - H) / (1 - H));
    var Hc = function(u){ if (u <= a) return 0; if (u >= a + w) return w / 2 + (u - a - w); var t = (u - a) / w; return w * (t * t * t - t * t * t * t / 2); };
    var tot = k0 + (1 - k0) * Hc(1);
    return function(u){ u = Math.max(0, Math.min(1, u)); return (k0 * u + (1 - k0) * Hc(u)) / tot; };
  }
  function teteSurEmmanchure(mailles){
    var dv = mailles.filter(function(m){ return m.pid === 'devant'; })[0], ds = mailles.filter(function(m){ return m.pid === 'dos'; })[0];
    if (!dv || !ds) return;
    var cf = dv.pc.p.contour, cb = ds.pc.p.contour; if (cf.length < 5 || cb.length < 5) return;
    var emF = bordPts(cf, 2, 3, 1), emB = bordPts(cb, 2, 3, 1);
    mailles.forEach(function(ma){
      if (ma.pid !== 'manche') return;
      var c = ma.pc.p.contour; if (c.length < 5) return;
      var S = coteMaille(ma), J = ma.J, R = ma.R, bb = ma.pc.bb, yp = ma.yp, pos = ma.pos;
      var capAv = bordPts(c, 1, 2, 1), capAr = bordPts(c, 1, 0, -1), ch = Math.max(c[0].y, c[2].y);
      var gAv = embu(capAv.tot, emF.tot), gAr = embu(capAr.tot, emB.tot);     // l embu soutenu (voir embu)
      // le rang où le bras reprend : un peu sous le bas de la tête
      var iT = 0; while (iT + 1 < R && yp[iT] < ch + 1.5) iT++;
      if (iT < 2 || iT + 2 >= R) return;
      // l axe du bras : du centre du rang iT au centre du dernier rang
      var centre = function(i){ var o = [0, 0, 0]; for (var j = 0; j <= J; j++) { var k = (i * (J + 1) + j) * 3; o[0] += pos[k]; o[1] += pos[k + 1]; o[2] += pos[k + 2]; } return [o[0] / (J + 1), o[1] / (J + 1), o[2] / (J + 1)]; };
      var C0 = centre(iT), ax = unit3(sub3(centre(R - 1), C0));
      /* LA MANCHE PEND DE L EMMANCHURE (2026-10-18, mesuré : la tête était étirée près de 2 fois) : le tube du bras partait trop bas
         sur le bras — du point d épaule à l anneau sous la tête, il y avait deux fois la hauteur de tête du patron. On remonte TOUTE la
         manche le long du bras jusqu à ce que ce chemin (au sommet de tête) ait la longueur du patron ; l ourlet remonte d autant. */
      var jx0 = Math.round((0 - bb.x0) / (bb.x1 - bb.x0) * J), pe00 = auT(emF, 0), A00 = posVirtuel(dv, pointVirtuel(dv, S * pe00[0], pe00[1]));
      for (var itm = 0; itm < 3; itm++) {
        var kq0 = (iT * (J + 1) + jx0) * 3, Q00 = [pos[kq0], pos[kq0 + 1], pos[kq0 + 2]], lp0 = yp[iT] - bordTete(capAv, 0).y;
        var dQ = Math.hypot(Q00[0] - A00[0], Q00[1] - A00[1], Q00[2] - A00[2]) * 1.08 - lp0;
        if (dQ <= 0.2) break;
        var dep = -Math.min(dQ, 12) * 0.9;
        for (var ii = iT; ii < R; ii++) for (var jj = 0; jj <= J; jj++) { var kk = (ii * (J + 1) + jj) * 3; pos[kk] += ax[0] * dep; pos[kk + 1] += ax[1] * dep; pos[kk + 2] += ax[2] * dep; }
        C0 = centre(iT);
      }
      /* LA COURBE DE LA TÊTE (2026-10-18, sa remarque : « des manches ballon ») : une Bézier CUBIQUE de l emmanchure (A) à l anneau
         du bras (Q). Elle QUITTE l emmanchure dans le prolongement du corps (la pente d épaule au sommet, le flanc dessous) et ARRIVE
         dans l axe du bras : la tête prolonge la ligne d épaule et tombe le long du bras. Une courbe sans tangente imposée partait à
         plat au-dessus de l épaule et s arrondissait en épaulette. Parcourue en longueur d arc ; au-delà du bord (hors de la pièce),
         prolongée le long de sa tangente. */
      var courbeTete = function(x, Q){
        var av = x >= 0, bt = bordTete(av ? capAv : capAr, x), em = av ? emF : emB, mc = av ? dv : ds, sx = av ? S : -S;
        var pe = auT(em, (av ? gAv : gAr)(Math.max(0, Math.min(1, bt.f)))), A = posVirtuel(mc, pointVirtuel(mc, sx * pe[0], pe[1]));
        var Pin = posVirtuel(mc, pointVirtuel(mc, sx * (pe[0] - 1), pe[1])), Tc = unit3(sub3(A, Pin));
        var Lq = Math.hypot(Q[0] - A[0], Q[1] - A[1], Q[2] - A[2]), corde = unit3(sub3(Q, A)), mixT = 0.35;
        var T0 = unit3([Tc[0] * mixT + corde[0] * (1 - mixT), Tc[1] * mixT + corde[1] * (1 - mixT), Tc[2] * mixT + corde[2] * (1 - mixT)]);
        var C1 = [A[0] + T0[0] * Lq / 3, A[1] + T0[1] * Lq / 3, A[2] + T0[2] * Lq / 3], C2 = [Q[0] - ax[0] * Lq / 3, Q[1] - ax[1] * Lq / 3, Q[2] - ax[2] * Lq / 3];
        var ev = function(t){ var u = 1 - t, a1 = u * u * u, a2 = 3 * u * u * t, a3 = 3 * u * t * t, a4 = t * t * t;
          return [a1 * A[0] + a2 * C1[0] + a3 * C2[0] + a4 * Q[0], a1 * A[1] + a2 * C1[1] + a3 * C2[1] + a4 * Q[1], a1 * A[2] + a2 * C1[2] + a3 * C2[2] + a4 * Q[2]]; };
        var T, mesurer = function(){ T = [0]; var prev = A; for (var e = 1; e <= 24; e++) { var pn = ev(e / 24); T.push(T[e - 1] + Math.hypot(pn[0] - prev[0], pn[1] - prev[1], pn[2] - prev[2])); prev = pn; } };
        mesurer();
        /* ⚠ (2026-10-18, banc 3D) L AISANCE DU BAS DE TÊTE : sur les côtés bas de la tête, l anneau du bras passe tout près de
           l emmanchure — 1 cm de courbe pour 5 cm de patron, le tissu tassé dix fois (des éclats sous le bras). Le tissu de trop
           s écarte du bras : la courbe prend un ventre, vers le dehors de l axe du bras, jusqu à 80 % de la longueur du patron. */
        var Lp = Math.max(0.5, yp[iT] - bt.y), ventre = 0;
        var gonfler = function(hv){
          var mil = [(A[0] + Q[0]) / 2 - C0[0], (A[1] + Q[1]) / 2 - C0[1], (A[2] + Q[2]) / 2 - C0[2]], pa3 = pt3(mil, ax);
          var rd3 = [mil[0] - ax[0] * pa3, mil[1] - ax[1] * pa3, mil[2] - ax[2] * pa3], pc3 = pt3(rd3, corde);
          rd3 = unit3([rd3[0] - corde[0] * pc3, rd3[1] - corde[1] * pc3, rd3[2] - corde[2] * pc3]);
          // le ventre se prend côté bras (C2) seulement : déplacer C1 changeait l angle où la tête quitte la couture — un pli le long
          // du bas d emmanchure
          for (var cv = 0; cv < 3; cv++) C2[cv] += rd3[cv] * hv * 2;
          ventre += hv; mesurer();
        };
        // le ventre LISSÉ d une colonne à l autre (ventreDe, posé plus bas) ; sans lui, on le calcule — linéaire dans le manque, pas
        // en racine : une colonne bombée à côté d une colonne qui ne l était pas faisait un pli cassé
        if (ventreDe) { var vd = ventreDe(x); if (vd > 0) gonfler(vd); }
        else for (var iv = 0; iv < 3 && T[24] < 0.8 * Lp; iv++) gonfler(Math.min(2.5, 0.45 * (0.8 * Lp - T[24])) / 0.75);
        return { bt: bt, A: A, ventre: ventre, point: function(tl){
          if (tl < 0) { var te = Math.max(-1, tl); return [A[0] + 3 * (C1[0] - A[0]) * te, A[1] + 3 * (C1[1] - A[1]) * te, A[2] + 3 * (C1[2] - A[2]) * te]; }
          var d = Math.min(1, tl) * T[24], k = 1; while (k < 24 && T[k] < d) k++;
          return ev((k - 1 + (d - T[k - 1]) / ((T[k] - T[k - 1]) || 1)) / 24); } };
      };
      // le ventre de chaque colonne, puis LISSÉ sur ± 3 colonnes (trois passes) : la grille et le raccord lisent le même
      var ventreDe = null, vbrut = [];
      for (var jv = 0; jv <= J; jv++) { var kv = (iT * (J + 1) + jv) * 3; vbrut.push(courbeTete(bb.x0 + (bb.x1 - bb.x0) * jv / J, [pos[kv], pos[kv + 1], pos[kv + 2]]).ventre); }
      for (var pv5 = 0; pv5 < 3; pv5++) vbrut = vbrut.map(function(v, jv){ var s5 = 0, n5 = 0; for (var d5 = -3; d5 <= 3; d5++) { var q5 = jv + d5; if (q5 >= 0 && q5 <= J) { s5 += vbrut[q5]; n5++; } } return s5 / n5; });
      ventreDe = function(x){ var f = Math.max(0, Math.min(J, (x - bb.x0) / (bb.x1 - bb.x0) * J)), j0 = Math.min(J - 1, Math.floor(f)); return vbrut[j0] + (vbrut[j0 + 1] - vbrut[j0]) * (f - j0); };
      var neuf = new Float32Array(iT * (J + 1) * 3);
      for (var j = 0; j <= J; j++) {
        var x = bb.x0 + (bb.x1 - bb.x0) * j / J, kq = (iT * (J + 1) + j) * 3, ct = courbeTete(x, [pos[kq], pos[kq + 1], pos[kq + 2]]);
        for (var i = 0; i < iT; i++) {
          var P3 = ct.point((yp[i] - ct.bt.y) / Math.max(0.5, yp[iT] - ct.bt.y)), kn = (i * (J + 1) + j) * 3;
          neuf[kn] = P3[0]; neuf[kn + 1] = P3[1]; neuf[kn + 2] = P3[2];
        }
      }
      pos.set(neuf, 0);
      if (ma.pliD) for (var z = 0; z < iT * (J + 1); z++) ma.pliD[z] = 0;     // la tête n a pas de plis
      /* LA FORMULE DU RACCORD, gardée pour TOUT point du patron (x, y) de la tête : le maillage dessiné la lit directement dans
         la bande du bord. Par la grille, chaque rang que le bord de tête traverse en biais mêlait un point d avant et un point
         d après le bord — une dent par rang le long de l emmanchure. */
      var rangT = []; for (var jr = 0; jr <= J; jr++) { var kr = (iT * (J + 1) + jr) * 3; rangT.push([pos[kr], pos[kr + 1], pos[kr + 2]]); }
      var yT = yp[iT];
      ma.raccord = function(x, y){
        var fj = Math.max(0, Math.min(J, (x - bb.x0) / (bb.x1 - bb.x0) * J)), j0 = Math.min(J - 1, Math.floor(fj)), u = fj - j0;
        var ct2 = courbeTete(x, [rangT[j0][0] + (rangT[j0 + 1][0] - rangT[j0][0]) * u, rangT[j0][1] + (rangT[j0 + 1][1] - rangT[j0][1]) * u, rangT[j0][2] + (rangT[j0 + 1][2] - rangT[j0][2]) * u]);
        return ct2.point((y - ct2.bt.y) / Math.max(0.5, yT - ct2.bt.y));
      };
      ma.bordTeteY = function(x){ return bordTete(x >= 0 ? capAv : capAr, x).y; };
    });
  }
  // les coutures d un haut : [maille A, bord A, signe A, maille B, bord B, signe B, nom, pas] — le zip les referme
  function descrCouturesHaut(mailles){
    var out = [], dv = mailles.filter(function(m){ return m.pid === 'devant'; })[0], ds = mailles.filter(function(m){ return m.pid === 'dos'; })[0];
    if (!dv || !ds) return out;
    var cf = dv.pc.p.contour, cb = ds.pc.p.contour, nf = cf.length, nb = cb.length, nom = '';
    var coud = function(maA, bA, sA, maB, bB, sB, pas){ out.push([maA, bA, sA, maB, bB, sB, nom, pas]); };
    [1, -1].forEach(function(S){
      if (nf < 6 || nb < 6) return;
      nom = 'epaule'; coud(dv, bordPts(cf, 1, 2, 1), S, ds, bordPts(cb, 1, 2, 1), -S, 0.2);
      nom = 'cote'; coud(dv, bordPts(cf, 3, nf - 2, 1), S, ds, bordPts(cb, 3, nb - 2, 1), -S, 0.4);
      var mc = mailles.filter(function(m){ return m.pid === 'manche' && coteMaille(m) === S; })[0];
      if (mc && mc.pc.p.contour.length >= 5) {
        var cm = mc.pc.p.contour;
        // la tête se coud SUR l emmanchure (le corps, plus lisse, porte la couture : maître = B)
        nom = 'tete-av'; coud(mc, bordPts(cm, 1, 2, 1), 1, dv, bordPts(cf, 2, 3, 1), S, 0.2); out[out.length - 1].push('B');
        nom = 'tete-ar'; coud(mc, bordPts(cm, 1, 0, -1), 1, ds, bordPts(cb, 2, 3, 1), -S, 0.2); out[out.length - 1].push('B');
        nom = 'dessous'; coud(mc, bordPts(cm, 2, 3, 1), 1, mc, bordPts(cm, 0, 4, -1), 1, 0.4);      // dessous de manche
      }
    });
    return out;
  }
  /* L AJUSTEMENT AU CORPS (2026-10-18) : la forme construite est juste (mesurée : le tissu n y est ni étiré ni tassé) ;
     on la garde, et l on se contente de repousser hors du corps ce qui y entre — la tête de manche sur la tête du bras,
     surtout — puis de lisser LÀ SEULEMENT où le tissu a été poussé (il jette un pont sur les creux, il ne moule pas). Un
     relâchement global sur les longueurs du patron a été essayé : il dégradait cette forme (l encolure s ouvrait jusqu aux
     épaules), faute de pouvoir corriger en quelques passes ce qui demande de déplacer tout le vêtement. */
  // la distance (cm) d un point au corps, DEHORS, et la direction qui y ramène : le tube le plus proche
  function versCorps(tubes, x, y, z){
    var best = { d: 1e9, dir: null };
    for (var t = 0; t < tubes.length; t++) {
      var T = tubes[t], q = (x - T.c0.x) * T.ax[0] + (y - T.c0.y) * T.ax[1] + (z - (T.c0.z || 0)) * T.ax[2];
      if (q < T.pmin - 0.5 || q > T.pmax + 0.5) continue;
      var an = T.an, pr = T.proj, i = 0, mont = pr[pr.length - 1] > pr[0];
      while (i + 1 < pr.length - 1 && (mont ? pr[i + 1] < q : pr[i + 1] > q)) i++;
      var u = Math.max(0, Math.min(1, (q - pr[i]) / ((pr[i + 1] - pr[i]) || 1))), a = an[i], b = an[i + 1];
      var cx = a.c.x + (b.c.x - a.c.x) * u, cy = a.c.y + (b.c.y - a.c.y) * u, cz = (a.c.z || 0) + ((b.c.z || 0) - (a.c.z || 0)) * u;
      var rx = a.rx + (b.rx - a.rx) * u, rz = a.rz + (b.rz - a.rz) * u;
      var dx = x - cx, dy = y - cy, dz = z - cz, pa = dx * T.ax[0] + dy * T.ax[1] + dz * T.ax[2];
      dx -= T.ax[0] * pa; dy -= T.ax[1] * pa; dz -= T.ax[2] * pa;
      var e; if (T.vertical) e = Math.sqrt((dx / rx) * (dx / rx) + (dz / rz) * (dz / rz));
      else { var uu = T.u, du = dx * uu[0] + dy * uu[1] + dz * uu[2]; e = Math.sqrt((du / rx) * (du / rx) + (dz / rz) * (dz / rz)); }
      var rr = Math.hypot(dx, dy, dz) || 1e-6, d = Math.max(0, rr - rr / Math.max(e, 1e-6));
      if (d < best.d) best = { d: d, dir: [-dx / rr, -dy / rr, -dz / rr] };
    }
    return best;
  }
  function ajusterAuCorps(mailles, tubes, fige, plaque){
    mailles.forEach(function(ma){
      // ⚠ le contour FIN (celui du maillage conforme) : le grossier (8 points par courbe) passait au-dessus de la tête de manche,
      // et des sommets DE la pièce, pris pour « dehors », étaient refaits par prolongerDehors (1,2 cm d écart au bord cousu)
      var R = ma.R, J = ma.J, bb = ma.pc.bb, n = R * (J + 1), PZ = ma.pos, polys = [contourFin(ma.pc.p.contour)].concat(ma.pc.mir ? [contourFin(ma.pc.mir)] : []);
      var dd = new Uint8Array(n);
      for (var i = 0; i < R; i++) for (var j = 0; j <= J; j++) { var x = bb.x0 + (bb.x1 - bb.x0) * j / J; if (polys.some(function(pp){ return dansPoly(pp, x, ma.yp[i]); })) dd[i * (J + 1) + j] = 1; }
      ma.dedans = dd;
      // les sommets FIGÉS ne bougent pas (le bord de tête de manche, posé exactement sur l emmanchure) ; ils restent voisins
      var fx = new Uint8Array(n); if (fige) for (var fi = 0; fi < R; fi++) for (var fj = 0; fj <= J; fj++) if (fige(ma, fi, fj)) fx[fi * (J + 1) + fj] = 1;
      var depart = PZ.slice(), bouge = new Float32Array(n);
      // la cible d écart au corps de chaque sommet (plaque) : au-delà, le tissu FLOTTE et il est ramené vers le corps
      var cibleEcart = plaque ? plaque(ma) : null;
      for (var tour = 0; tour < 4; tour++) {
        var av = PZ.slice();
        if (cibleEcart) for (var kp = 0; kp < n; kp++) { if (fx[kp] || !(cibleEcart[kp] > 0)) continue;
          var vc = versCorps(tubes, PZ[kp * 3], PZ[kp * 3 + 1], PZ[kp * 3 + 2]); if (!vc.dir || vc.d <= cibleEcart[kp] || vc.d > 8) continue;
          var mv = (vc.d - cibleEcart[kp]) * 0.6; PZ[kp * 3] += vc.dir[0] * mv; PZ[kp * 3 + 1] += vc.dir[1] * mv; PZ[kp * 3 + 2] += vc.dir[2] * mv; }
        for (var k = 0; k < n; k++) if (!fx[k]) repousser(PZ, k, tubes, 0.45);
        for (var k2 = 0; k2 < n; k2++) bouge[k2] = Math.max(bouge[k2], Math.abs(PZ[k2 * 3] - av[k2 * 3]) + Math.abs(PZ[k2 * 3 + 1] - av[k2 * 3 + 1]) + Math.abs(PZ[k2 * 3 + 2] - av[k2 * 3 + 2]));
        for (var ps = 0; ps < 4; ps++) {
          var nv = PZ.slice();
          for (var i2 = 1; i2 < R - 1; i2++) for (var j2 = 1; j2 < J; j2++) {
            var q = i2 * (J + 1) + j2, wv = Math.min(1, bouge[q] / 0.5) * 0.5; if (fx[q]) continue;
            // le voisinage d un point poussé se lisse aussi (sans quoi une marche se voyait au bord de la zone poussée)
            for (var di = -1; di <= 1; di++) for (var dj = -1; dj <= 1; dj++) wv = Math.max(wv, Math.min(1, bouge[q + di * (J + 1) + dj] / 0.5) * 0.35);
            if (wv <= 0) continue;
            for (var c = 0; c < 3; c++) { var m = (PZ[(q - 1) * 3 + c] + PZ[(q + 1) * 3 + c] + PZ[(q - J - 1) * 3 + c] + PZ[(q + J + 1) * 3 + c]) / 4; nv[q * 3 + c] = PZ[q * 3 + c] * (1 - wv) + m * wv; }
          }
          PZ.set(nv);
        }
      }
      for (var k3 = 0; k3 < n; k3++) if (!fx[k3]) repousser(PZ, k3, tubes, 0.45);
      normalesGrille(ma);
    });
  }
  /* ══ LE MAILLAGE CONFORME DES HAUTS (2026-10-18) ══════════════════════════════════════════════════════
     Jusqu ici, chaque pièce était une GRILLE rectangulaire découpée par la transparence de sa toile : son bord
     passait au milieu des triangles. Deux grilles ne se rejoignent pas sur une courbe qui traverse leurs triangles
     — c étaient les fentes et les échardes aux coutures (le banc les comptait par centaines).
     Ici, la pièce dessinée est DÉCOUPÉE au contour exact du patron : chaque case de la grille est coupée par le
     contour (Sutherland-Hodgman), puis triangulée ; le bord du maillage EST le bord du patron. Les coutures sont
     ensuite ZIPPÉES : chaque sommet de bord rejoint la courbe moyenne des deux pièces cousues (le point de l une et
     son vis-à-vis de l autre, par fraction de longueur), et le voisinage suit en douceur sur 2,5 cm. La grille reste
     dessous : les bijoux, la visée et l ombre de contact s en servent toujours. */
  function decoupeCase(poly, xa, xb, ya, yb){
    var out = poly, bords = [[0, xa, 1], [0, xb, -1], [1, ya, 1], [1, yb, -1]];
    for (var e = 0; e < 4 && out.length; e++) {
      var ax = bords[e][0], v = bords[e][1], sg = bords[e][2], inp = out; out = [];
      var dedans = function(p){ return (p[ax] - v) * sg >= -1e-9; };
      for (var i = 0; i < inp.length; i++) {
        var a = inp[i], b = inp[(i + 1) % inp.length], ia = dedans(a), ib = dedans(b);
        if (ia) out.push(a);
        if (ia !== ib) { var t = (v - a[ax]) / ((b[ax] - a[ax]) || 1e-12), q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; q[ax] = v; out.push(q); }
      }
    }
    return out;
  }
  function aire2(p){ var s = 0; for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
  // une triangulation par « oreilles » (le polygone d une case découpée est petit, parfois concave)
  function oreilles(p){
    var n = p.length, ids = []; for (var i = 0; i < n; i++) ids.push(i);
    if (aire2(p) < 0) ids.reverse();
    var tri = [], garde = 0;
    while (ids.length > 3 && garde++ < 200) {
      var coupe = false;
      for (var k = 0; k < ids.length; k++) {
        var i0 = ids[(k + ids.length - 1) % ids.length], i1 = ids[k], i2 = ids[(k + 1) % ids.length], a = p[i0], b = p[i1], c = p[i2];
        var cr = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); if (cr <= 1e-12) continue;
        var vide = true;
        for (var m = 0; m < ids.length && vide; m++) { var q = p[ids[m]]; if (ids[m] === i0 || ids[m] === i1 || ids[m] === i2) continue;
          var d1 = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]), d2 = (c[0] - b[0]) * (q[1] - b[1]) - (c[1] - b[1]) * (q[0] - b[0]), d3 = (a[0] - c[0]) * (q[1] - c[1]) - (a[1] - c[1]) * (q[0] - c[0]);
          if (d1 > 1e-12 && d2 > 1e-12 && d3 > 1e-12) vide = false; }
        if (!vide) continue;
        tri.push([i0, i1, i2]); ids.splice(k, 1); coupe = true; break;
      }
      if (!coupe) break;
    }
    if (ids.length === 3) tri.push([ids[0], ids[1], ids[2]]);
    return tri;
  }
  // les contours dessinés d une pièce de haut : la moitié (x >= 0) et son miroir pour une pièce dépliée
  // le contour, échantillonné FIN (32 points par courbe) : le bord du maillage et la couture doivent suivre la même courbe
  function contourFin(c){
    var pts = []; for (var i = 0; i < c.length; i++) { var a = c[i === 0 ? c.length - 1 : i - 1], b = c[i], n = b.c1 && b.c2 ? 32 : 1;
      for (var k = 1; k <= n; k++) pts.push(cubSeg(a, b, k / n)); }
    return pts;
  }
  function polysPiece(ma){
    var c = contourFin(ma.pc.p.contour);
    if (!ma.pc.mir) return [c];
    var ax = ma.pc.axe; if (!ax || Math.abs(ax.a.x) > 1e-6 || Math.abs(ax.b.x) > 1e-6) return null;
    var moitie = decoupeCase(c, 0, 1e6, -1e6, 1e6);
    return [moitie, moitie.map(function(q){ return [-q[0], q[1]]; }).reverse()];
  }
  function maillageConforme(ma){
    var polys = polysPiece(ma); if (!polys) return null;
    var R = ma.R, J = ma.J, bb = ma.pc.bb, yp = ma.yp, X = function(j){ return bb.x0 + (bb.x1 - bb.x0) * j / J; };
    var vx = [], vy = [], cle = {}, tri = [];
    var sommet = function(q){ var k = Math.round(q[0] * 1e4) + '_' + Math.round(q[1] * 1e4); if (cle[k] === undefined) { cle[k] = vx.length; vx.push(q[0]); vy.push(q[1]); } return cle[k]; };
    // les arêtes de chaque contour, pour savoir vite si une case est coupée
    var aretes = polys.map(function(p){ return p.map(function(a, i){ var b = p[(i + 1) % p.length]; return [Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1])]; }); });
    for (var i = 0; i + 1 < R; i++) for (var j = 0; j < J; j++) {
      var xa = X(j), xb = X(j + 1), ya = yp[i], yb = yp[i + 1];
      for (var pi = 0; pi < polys.length; pi++) {
        var coupe = aretes[pi].some(function(e){ return e[1] >= xa && e[0] <= xb && e[3] >= ya && e[2] <= yb; });
        if (!coupe) {
          if (!dansPoly(polys[pi], (xa + xb) / 2, (ya + yb) / 2)) continue;
          var a0 = sommet([xa, ya]), a1 = sommet([xb, ya]), b0 = sommet([xa, yb]), b1 = sommet([xb, yb]);
          tri.push(a0, b0, b1, a0, b1, a1); continue;
        }
        var cp = decoupeCase(polys[pi], xa, xb, ya, yb);
        if (cp.length < 3 || Math.abs(aire2(cp)) < 1e-6) continue;
        var idv = cp.map(sommet);
        oreilles(cp).forEach(function(t){ if (idv[t[0]] !== idv[t[1]] && idv[t[1]] !== idv[t[2]] && idv[t[0]] !== idv[t[2]]) tri.push(idv[t[0]], idv[t[1]], idv[t[2]]); });
      }
    }
    if (vx.length > 65000) return null;
    // ⚠ UN SEUL SENS DE ROTATION, au patron : les cases entières (sens horaire) et les cases découpées (anti-horaire) se
    // mélangeaient, et l orientation face par face sur la normale de la grille — peu fiable au bord — retournait des faces saines :
    // le shader les peignait comme l envers (des « dents » le long de l emmanchure)
    for (var tq = 0; tq < tri.length; tq += 3) { var ta = tri[tq], tb = tri[tq + 1], tc = tri[tq + 2];
      if ((vx[tb] - vx[ta]) * (vy[tc] - vy[ta]) - (vy[tb] - vy[ta]) * (vx[tc] - vx[ta]) < 0) { tri[tq + 1] = tc; tri[tq + 2] = tb; } }
    var n = vx.length, pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), poids = [];
    // la position d un point du patron : la formule du raccord dans la bande du bord de tête, la grille ailleurs
    var en3d = function(x, y){ return ma.raccord && y < ma.bordTeteY(x) + 1.5 ? ma.raccord(x, y) : posVirtuel(ma, pointVirtuel(ma, x, y)); };
    for (var v = 0; v < n; v++) {
      var pv = pointVirtuel(ma, vx[v], vy[v]), p;
      /* ⚠ UN POINT SUR UN CÔTÉ DE CASE (là où le contour la coupe) est posé EN LIGNE DROITE entre les deux coins : la case voisine,
         entière, ne voit que ses coins — posé par la formule (courbe), il quittait leur segment et laissait un jour en T (des
         pointillés blancs sur la manche). */
      var fj = (vx[v] - bb.x0) / (bb.x1 - bb.x0) * J, jr = Math.round(fj), surCol = Math.abs(fj - jr) < 1e-6, ir = -1;
      for (var q = 0; q < R; q++) if (Math.abs(yp[q] - vy[v]) < 1e-6) { ir = q; break; }
      if (surCol && ir < 0) { var i0 = 0; while (i0 + 2 < R && yp[i0 + 1] < vy[v]) i0++; var ft = (vy[v] - yp[i0]) / ((yp[i0 + 1] - yp[i0]) || 1), pa = en3d(vx[v], yp[i0]), pb = en3d(vx[v], yp[i0 + 1]);
        p = [pa[0] + (pb[0] - pa[0]) * ft, pa[1] + (pb[1] - pa[1]) * ft, pa[2] + (pb[2] - pa[2]) * ft]; }
      else if (!surCol && ir >= 0) { var j0 = Math.max(0, Math.min(J - 1, Math.floor(fj))), fs = fj - j0, pc = en3d(X(j0), vy[v]), pd = en3d(X(j0 + 1), vy[v]);
        p = [pc[0] + (pd[0] - pc[0]) * fs, pc[1] + (pd[1] - pc[1]) * fs, pc[2] + (pd[2] - pc[2]) * fs]; }
      else p = en3d(vx[v], vy[v]);
      poids.push(pv);
      pos[v * 3] = p[0]; pos[v * 3 + 1] = p[1]; pos[v * 3 + 2] = p[2];
      uv[v * 2] = (vx[v] - bb.x0) / (bb.x1 - bb.x0); uv[v * 2 + 1] = (vy[v] - bb.y0) / (bb.y1 - bb.y0);
    }
    return { pos: pos, uv: uv, idx: tri, vx: vx, vy: vy, poids: poids, n: n };
  }
  // la distance (patron) d un point à un bord, et sa fraction de longueur le long du bord
  function surBord(b, s, x, y){
    var p = b.pts, L = b.L, best = 1e9, tb = 0;
    for (var i = 0; i + 1 < p.length; i++) {
      var ax = p[i][0] * s, ay = p[i][1], bx = p[i + 1][0] * s, by = p[i + 1][1], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-12;
      var u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)), qx = ax + dx * u, qy = ay + dy * u, d = Math.hypot(x - qx, y - qy);
      if (d < best) { best = d; tb = (L[i] + (L[i + 1] - L[i]) * u) / b.tot; }
    }
    return { d: best, t: tb };
  }
  function zipperCoutures(mailles, descr, tubes){
    var RF = 2.5, lisse = function(u){ u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
    var acc = new Map();
    // deux comptes : ce qui est SUR une couture (le sommet suit exactement sa ou ses coutures), et le fondu de l intérieur
    mailles.forEach(function(ma){ if (ma.rendu) acc.set(ma, { d: new Float32Array(ma.rendu.n * 3), w: new Float32Array(ma.rendu.n), ex: new Float32Array(ma.rendu.n * 3), nx: new Float32Array(ma.rendu.n) }); });
    var surGrille = function(M, b, s, t){ var p = auT(b, t); return posVirtuel(M, pointVirtuel(M, p[0] * s, p[1])); };
    // ⚠ (2026-10-18, banc 3D) sur le bord de TÊTE, le maillage dessiné est posé par la FORMULE du raccord (voir maillageConforme) :
    // le point de bord se lit au même endroit. Lu sur la grille (plus grossière, là où la tête tourne fort), il en différait — la
    // correction de la couture dépassait, et le bas de tête faisait des dents retournées sous le bras.
    var surTete = function(M, b, s, t){ var p = auT(b, t); return M.raccord ? M.raccord(p[0] * s, p[1]) : surGrille(M, b, s, t); };
    /* LES JONCTIONS : là où plusieurs coutures se rejoignent (le point d épaule, l aisselle — quatre pièces —, le sommet de
       tête), chaque couture visait SON milieu et le coin restait ouvert. Les bouts de couture qui se touchent forment un
       groupe ; le groupe vise UN point (la moyenne de ses pièces), et chaque couture y plie sa courbe sur ses 2 derniers cm. */
    var noeuds = [], groupe = [];
    var noeud = function(M, b, s, t){ var p = auT(b, t), x = p[0] * s, y = p[1];
      for (var i = 0; i < noeuds.length; i++) if (noeuds[i].M === M && Math.abs(noeuds[i].x - x) < 0.05 && Math.abs(noeuds[i].y - y) < 0.05) return i;
      noeuds.push({ M: M, x: x, y: y, P: posVirtuel(M, pointVirtuel(M, x, y)) }); groupe.push(noeuds.length - 1); return noeuds.length - 1; };
    var racine = function(i){ while (groupe[i] !== i) i = groupe[i] = groupe[groupe[i]]; return i; };
    var bouts = descr.map(function(D){ return [0, 1].map(function(t){ var a = noeud(D[0], D[1], D[2], t), b = noeud(D[3], D[4], D[5], t); groupe[racine(a)] = racine(b); return a; }); });
    var cible = {};
    /* ⚠ (2026-10-18, banc 3D) le CORPS COMMANDE, comme pour l emmanchure (« B ») : au point d épaule, la moyenne avec le sommet de
       tête, plus bas, tirait le seul coin du corps 1,4 cm vers le bas sur 2 cm de couture — une corne au bout de l épaule. Dans un
       groupe qui touche le corps, la manche rejoint le corps et ne compte pas. */
    var corpsDans = {}; noeuds.forEach(function(nd, i){ if (nd.M.pid !== 'manche') corpsDans[racine(i)] = 1; });
    noeuds.forEach(function(nd, i){ var r = racine(i); if (corpsDans[r] && nd.M.pid === 'manche') return;
      var c = cible[r] = cible[r] || [0, 0, 0, 0]; c[0] += nd.P[0]; c[1] += nd.P[1]; c[2] += nd.P[2]; c[3]++; });
    var cibleDe = function(i){ var c = cible[racine(i)]; return [c[0] / c[3], c[1] / c[3], c[2] / c[3]]; };
    descr.forEach(function(D, di){
      var L = Math.max(D[1].tot, D[4].tot), M0 = null, M1 = null;
      var milieu = function(t){ var b = surGrille(D[3], D[4], D[5], t); if (D[8] === 'B') return b; var a = surGrille(D[0], D[1], D[2], t); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; };
      M0 = milieu(0); M1 = milieu(1);
      var T0 = cibleDe(bouts[di][0]), T1 = cibleDe(bouts[di][1]);
      // la courbe cousue : le milieu des deux pièces, pliée vers les jonctions près des bouts
      // (la courbe cousue est repoussée hors du corps : le point de jonction de l épaule, moyenne de trois pièces, y tombait — le
      // mannequin affleurait au sommet de la tête de manche. Les deux pièces lisent la MÊME courbe, déjà dehors.)
      var courbeBrute = function(t){ var m = milieu(t), f0 = lisse(1 - t * L / 2), f1 = lisse(1 - (1 - t) * L / 2);
        var c3 = new Float32Array([m[0] + (T0[0] - M0[0]) * f0 + (T1[0] - M1[0]) * f1, m[1] + (T0[1] - M0[1]) * f0 + (T1[1] - M1[1]) * f1, m[2] + (T0[2] - M0[2]) * f0 + (T1[2] - M1[2]) * f1]);
        if (tubes) repousser(c3, 0, tubes, 0.4); return [c3[0], c3[1], c3[2]]; };
      /* ⚠ (2026-10-18, banc 3D) LA COURBE CALCULÉE UNE FOIS : repoussée hors du corps point par point, elle sortait un peu en dents au
         creux de l aisselle ; le corps et la manche la lisaient à des endroits différents, leurs deux bords ne suivaient pas les mêmes
         dents — un fil de jour au bas de l emmanchure. Elle est tabulée (200 points), lissée (bouts fixes), puis lue par interpolation :
         les deux pièces sont sur la MÊME courbe. */
      var NC = 200, tabC = []; for (var kc = 0; kc <= NC; kc++) tabC.push(courbeBrute(kc / NC));
      for (var pc = 0; pc < 3; pc++) tabC = tabC.map(function(p, k){ if (k === 0 || k === NC) return p; var a = tabC[k - 1], b = tabC[k + 1];
        return [(a[0] + 2 * p[0] + b[0]) / 4, (a[1] + 2 * p[1] + b[1]) / 4, (a[2] + 2 * p[2] + b[2]) / 4]; });
      var courbe = function(t){ var f = Math.max(0, Math.min(1, t)) * NC, k = Math.min(NC - 1, Math.floor(f)), u = f - k, a = tabC[k], b = tabC[k + 1];
        return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; };
      // la courbe est paramétrée par l emmanchure (le maître) ; la tête de manche y va par l embu soutenu (voir embu)
      var gD = D[8] === 'B' ? embu(D[1].tot, D[4].tot) : null;
      [[D[0], D[1], D[2]], [D[3], D[4], D[5]]].forEach(function(S){
        var M = S[0], b = S[1], s = S[2], rd = M.rendu, a = acc.get(M); if (!rd || !a) return;
        for (var v = 0; v < rd.n; v++) {
          var sb = surBord(b, s, rd.vx[v], rd.vy[v]); if (sb.d >= RF) continue;
          // (la formule seulement sur le BAS de la tête, là où elle tourne fort — en haut la grille suffit, et le coin d aisselle suit
          // la jonction des quatre pièces)
          var tete = gD && M === D[0], E = tete && sb.t >= 0.5 && sb.t <= 0.9 ? surTete(M, b, s, sb.t) : surGrille(M, b, s, sb.t), C = courbe(tete ? gD(sb.t) : sb.t);
          // SUR la couture : le sommet prend la position même de la courbe cousue (absolue — un déplacement relatif reportait
          // l écart entre le sommet et son point projeté, sensible là où la tête de manche est raide)
          if (sb.d < 0.02) { a.ex[v * 3] += C[0]; a.ex[v * 3 + 1] += C[1]; a.ex[v * 3 + 2] += C[2]; a.nx[v]++; continue; }
          var w = lisse(1 - sb.d / RF);
          a.d[v * 3] += (C[0] - E[0]) * w; a.d[v * 3 + 1] += (C[1] - E[1]) * w; a.d[v * 3 + 2] += (C[2] - E[2]) * w; a.w[v] += w;
        }
      });
    });
    acc.forEach(function(a, ma){ var PZ = ma.rendu.pos; for (var v = 0; v < ma.rendu.n; v++) {
      if (a.nx[v] > 0) { PZ[v * 3] = a.ex[v * 3] / a.nx[v]; PZ[v * 3 + 1] = a.ex[v * 3 + 1] / a.nx[v]; PZ[v * 3 + 2] = a.ex[v * 3 + 2] / a.nx[v]; }
      else if (a.w[v] > 0) { var k = Math.max(1, a.w[v]); PZ[v * 3] += a.d[v * 3] / k; PZ[v * 3 + 1] += a.d[v * 3 + 1] / k; PZ[v * 3 + 2] += a.d[v * 3 + 2] / k; } } });
    /* LA BANDE DE COUTURE LISSÉE (2026-10-18) : le bord cousu est posé exactement, la bande derrière lui (2,5 cm) ne suivait
       qu en partie — là où la manche devait beaucoup bouger, ses triangles se retournaient en dents le long de l emmanchure.
       Les sommets cousus restent FIXES ; le reste de la bande se lisse sur ses voisins, puis le corps le repousse. */
    acc.forEach(function(a, ma){
      var rd = ma.rendu, PZ = rd.pos, I = rd.idx, n = rd.n, vois = [];
      for (var v = 0; v < n; v++) vois.push([]);
      for (var t = 0; t < I.length; t += 3) for (var e = 0; e < 3; e++) { var x = I[t + e], y = I[t + (e + 1) % 3]; if (vois[x].indexOf(y) < 0) vois[x].push(y); if (vois[y].indexOf(x) < 0) vois[y].push(x); }
      var bande = []; for (var v2 = 0; v2 < n; v2++) if (a.nx[v2] === 0 && a.w[v2] > 0) bande.push(v2);
      rd.cousu = new Uint8Array(n); for (var v5 = 0; v5 < n; v5++) if (a.nx[v5] > 0) rd.cousu[v5] = 1;     // pour detordre
      // ⚠ le lissage ne garde que sa composante NORMALE à la surface : la moyenne des voisins, près des petits triangles du bord,
      // faisait GLISSER les sommets le long du tissu (jusqu à 1 cm au sommet de la tête de manche : des triangles étirés 20 fois)
      var nrm = function(v){ var pv = rd.poids[v], o = [0, 0, 0]; for (var q = 0; q < 3; q++) { var k = pv.k[q], w = pv.w[q]; o[0] += ma.nor[k * 3] * w; o[1] += ma.nor[k * 3 + 1] * w; o[2] += ma.nor[k * 3 + 2] * w; } return unit3(o); };
      var NB = {}; bande.forEach(function(v){ NB[v] = nrm(v); });
      for (var ps = 0; ps < 12; ps++) {
        var nv = PZ.slice();
        bande.forEach(function(v3){ var l = vois[v3]; if (l.length < 3) return; var m = [0, 0, 0]; l.forEach(function(q){ m[0] += PZ[q * 3]; m[1] += PZ[q * 3 + 1]; m[2] += PZ[q * 3 + 2]; });
          var w = Math.min(1, a.w[v3]) * 0.6, nn = NB[v3], dl = [m[0] / l.length - PZ[v3 * 3], m[1] / l.length - PZ[v3 * 3 + 1], m[2] / l.length - PZ[v3 * 3 + 2]], dn = pt3(dl, nn);
          for (var c = 0; c < 3; c++) nv[v3 * 3 + c] = PZ[v3 * 3 + c] + nn[c] * dn * w; });
        PZ.set(nv);
      }
      // la dernière collision : tout le dessiné (la bande figée du bord de tête y échappait), sauf les sommets cousus — ceux-là sont
      // posés sur la courbe cousue, déjà repoussée hors du corps (voir « courbe ») ; les repousser un à un rouvrait les coutures
      if (tubes) for (var v4 = 0; v4 < n; v4++) if (a.nx[v4] === 0) repousser(PZ, v4, tubes, 0.4);
    });
  }
  /* LA LUMIÈRE CONTINUE À TRAVERS LES COUTURES (2026-10-18, sa capture : « on voit encore les coutures ») : chaque pièce calculait
     ses normales seule ; sur la couture, les deux bords n avaient pas la même — un saut de lumière (la manche plus claire que le
     corps) dessinait la couture. Les sommets cousus de pièces DIFFÉRENTES au même endroit (à 1 mm) prennent la normale moyenne.
     (L ombre de contact, elle, relève du rendu du tissu : pas touchée ici.) */
  function soudeNormales(mailles){
    var cle = function(x, y, z){ return Math.round(x * 10) + '_' + Math.round(y * 10) + '_' + Math.round(z * 10); }, cases = {};
    mailles.forEach(function(ma, mi){ var rd = ma.rendu; if (!rd.cousu || !rd.nor) return;
      for (var v = 0; v < rd.n; v++) { if (!rd.cousu[v]) continue; var k = cle(rd.pos[v * 3], rd.pos[v * 3 + 1], rd.pos[v * 3 + 2]); (cases[k] = cases[k] || []).push([mi, v]); } });
    var voisins = function(rd, v){ var x = Math.round(rd.pos[v * 3] * 10), y = Math.round(rd.pos[v * 3 + 1] * 10), z = Math.round(rd.pos[v * 3 + 2] * 10), out = [];
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) for (var dz = -1; dz <= 1; dz++) { var l = cases[(x + dx) + '_' + (y + dy) + '_' + (z + dz)]; if (l) out = out.concat(l); }
      return out; };
    var nouv = [];
    mailles.forEach(function(ma, mi){ var rd = ma.rendu; if (!rd.cousu || !rd.nor) return;
      for (var v = 0; v < rd.n; v++) { if (!rd.cousu[v]) continue;
        var n = [rd.nor[v * 3], rd.nor[v * 3 + 1], rd.nor[v * 3 + 2]], autre = false;
        voisins(rd, v).forEach(function(e){ if (e[0] === mi) return; var r2 = mailles[e[0]].rendu, w = e[1];
          if (Math.hypot(r2.pos[w * 3] - rd.pos[v * 3], r2.pos[w * 3 + 1] - rd.pos[v * 3 + 1], r2.pos[w * 3 + 2] - rd.pos[v * 3 + 2]) > 0.1) return;
          if (r2.nor[w * 3] * n[0] + r2.nor[w * 3 + 1] * n[1] + r2.nor[w * 3 + 2] * n[2] < 0) return;      // pas à travers un pli
          n[0] += r2.nor[w * 3]; n[1] += r2.nor[w * 3 + 1]; n[2] += r2.nor[w * 3 + 2]; autre = true; });
        if (autre) nouv.push([rd, v, unit3(n)]); } });
    nouv.forEach(function(e){ var rd = e[0], v = e[1]; rd.nor[v * 3] = e[2][0]; rd.nor[v * 3 + 1] = e[2][1]; rd.nor[v * 3 + 2] = e[2][2]; });
  }
  /* LE RECOUVREMENT DES COUTURES (2026-10-18, sa capture 72 : « les coutures d épaule et la couture dos en fines lignes blanches
     pointillées ») : deux pièces cousues se touchent bord à bord, mais leurs bords ne sont pas la même ligne entre deux sommets
     (une corde de chaque côté) — sous le pixel, le rastériseur laissait passer le mannequin par points le long de la couture.
     Ce qui se DESSINE de chaque bord cousu avance donc de 0,3 mm sous la pièce voisine, dans le plan du tissu (l application
     du patron sur le triangle du bord ; la toile suit — elle porte sa marge peinte). Seul le dessin bouge : rd.pos (le drapé,
     les mesures) reste tel quel. ⚠ Essayé plus (1 à 1,5 mm), et plié vers le corps : le prolongement sortait de la voisine sur
     les coutures en arête (emmanchure) — un liseré clair et des fentes au banc (liseré de face 14,8 → 30 ; fentes 0 → 4 à 7). */
  function recouvrement(ma){
    var rd = ma.rendu; if (!rd || !rd.cousu) return null;
    var I = rd.idx, n = rd.n, bb = ma.pc.bb, cnt = {}, tri = {}, D2 = new Float32Array(n * 2), D3 = new Float32Array(n * 3), nb = new Uint8Array(n), P = rd.pos;
    for (var t = 0; t < I.length; t += 3) for (var e = 0; e < 3; e++) { var x = I[t + e], y = I[t + (e + 1) % 3], k = Math.min(x, y) + '_' + Math.max(x, y); cnt[k] = (cnt[k] || 0) + 1; tri[k] = I[t + (e + 2) % 3]; }
    Object.keys(cnt).forEach(function(k){
      if (cnt[k] !== 1) return; var ab = k.split('_'), a = +ab[0], b = +ab[1]; if (!rd.cousu[a] || !rd.cousu[b]) return;
      var c = tri[k], ex = rd.vx[b] - rd.vx[a], ey = rd.vy[b] - rd.vy[a], le = Math.hypot(ex, ey); if (le < 1e-6) return;
      var ox = ey / le, oy = -ex / le; if (ox * (rd.vx[c] - rd.vx[a]) + oy * (rd.vy[c] - rd.vy[a]) > 0) { ox = -ox; oy = -oy; }
      // l image 3D de (ox, oy) par le triangle du bord : (ox, oy) = s (b - a) + u (c - a) au patron, le même mélange en 3D
      var fx = rd.vx[c] - rd.vx[a], fy = rd.vy[c] - rd.vy[a], det = ex * fy - ey * fx; if (Math.abs(det) < 1e-9) return;
      var s = (ox * fy - oy * fx) / det, u = (ex * oy - ey * ox) / det;
      var d3 = [0, 1, 2].map(function(q){ return s * (P[b * 3 + q] - P[a * 3 + q]) + u * (P[c * 3 + q] - P[a * 3 + q]); }), l3 = Math.hypot(d3[0], d3[1], d3[2]);
      if (!(l3 > 1e-6) || l3 > 4) return;
      [a, b].forEach(function(v){ D2[v * 2] += ox; D2[v * 2 + 1] += oy; for (var q = 0; q < 3; q++) D3[v * 3 + q] += d3[q] / l3; nb[v]++; });
    });
    var pos = new Float32Array(P), uv = new Float32Array(rd.uv), AV = 0.03;
    for (var v = 0; v < n; v++) {
      if (!nb[v]) continue;
      var l2 = Math.hypot(D2[v * 2], D2[v * 2 + 1]), l3 = Math.hypot(D3[v * 3], D3[v * 3 + 1], D3[v * 3 + 2]); if (l2 < 0.3 || l3 < 0.3) continue;     // un coin trop aigu : on ne pousse pas
      for (var q = 0; q < 3; q++) pos[v * 3 + q] += D3[v * 3 + q] / l3 * AV;
      uv[v * 2] += D2[v * 2] / l2 * AV / (bb.x1 - bb.x0); uv[v * 2 + 1] += D2[v * 2 + 1] / l2 * AV / (bb.y1 - bb.y0);
    }
    return { pos: pos, uv: uv };
  }
  // les attributs du maillage conforme : normales (orientées comme la grille), ombre, teinte, traits
  function finirConforme(ma){
    var rd = ma.rendu, n = rd.n, PZ = rd.pos, I = rd.idx, nor = new Float32Array(n * 3), ao = new Float32Array(n), tint = new Float32Array(n * 4);
    // la normale de la GRILLE sous chaque sommet : elle dit où est le dehors
    var refN = new Float32Array(n * 3);
    for (var r0 = 0; r0 < n; r0++) { var pv0 = rd.poids[r0]; for (var q0 = 0; q0 < 3; q0++) { var k0 = pv0.k[q0], w0 = pv0.w[q0]; refN[r0 * 3] += ma.nor[k0 * 3] * w0; refN[r0 * 3 + 1] += ma.nor[k0 * 3 + 1] * w0; refN[r0 * 3 + 2] += ma.nor[k0 * 3 + 2] * w0; } }
    // le sens est le même pour toutes les faces (voir maillageConforme) : le dehors se décide UNE fois, à la majorité
    var fn = new Float32Array(I.length), vote = 0;
    for (var t = 0; t < I.length; t += 3) {
      var a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
      var ex = PZ[b] - PZ[a], ey = PZ[b + 1] - PZ[a + 1], ez = PZ[b + 2] - PZ[a + 2], fx = PZ[c] - PZ[a], fy = PZ[c + 1] - PZ[a + 1], fz = PZ[c + 2] - PZ[a + 2];
      fn[t] = ey * fz - ez * fy; fn[t + 1] = ez * fx - ex * fz; fn[t + 2] = ex * fy - ey * fx;
      vote += fn[t] * (refN[a] + refN[b] + refN[c]) + fn[t + 1] * (refN[a + 1] + refN[b + 1] + refN[c + 1]) + fn[t + 2] * (refN[a + 2] + refN[b + 2] + refN[c + 2]);
    }
    var sgn = vote < 0 ? -1 : 1;
    for (var t2 = 0; t2 < I.length; t2 += 3) [I[t2] * 3, I[t2 + 1] * 3, I[t2 + 2] * 3].forEach(function(k){ nor[k] += fn[t2] * sgn; nor[k + 1] += fn[t2 + 1] * sgn; nor[k + 2] += fn[t2 + 2] * sgn; });
    for (var v = 0; v < n; v++) {
      var pv = rd.poids[v], ref = [0, 0, 0], o = 0, tt = [0, 0, 0, 0];
      for (var q = 0; q < 3; q++) { var k = pv.k[q], w = pv.w[q]; ref[0] += ma.nor[k * 3] * w; ref[1] += ma.nor[k * 3 + 1] * w; ref[2] += ma.nor[k * 3 + 2] * w; o += ma.ao[k] * w; for (var z = 0; z < 4; z++) tt[z] += ma.tint[k * 4 + z] * w; }
      var nn = [nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]], l = Math.hypot(nn[0], nn[1], nn[2]) || 1;
      nor[v * 3] = nn[0] / l; nor[v * 3 + 1] = nn[1] / l; nor[v * 3 + 2] = nn[2] / l; ao[v] = o;
      for (var z2 = 0; z2 < 4; z2++) tint[v * 4 + z2] = tt[z2];
    }
    var lig = []; for (var t2 = 0; t2 < I.length; t2 += 3) lig.push(I[t2], I[t2 + 1], I[t2 + 1], I[t2 + 2]);
    rd.nor = nor; rd.ao = ao; rd.tint = tint; rd.idx = new Uint16Array(I); rd.lig = new Uint16Array(lig);
  }
  /* Hors de la pièce, la grille n est qu un ÉCHAFAUDAGE : les sommets du bord du maillage conforme s interpolent
     dans des cases dont un coin est dehors. Ces coins, froissés par le relâchement, faisaient des échardes en losange
     le long des coutures : on les REFAIT — la forme construite, déplacée comme leurs voisins du dedans (trois rangs). */
  function prolongerDehors(ma){
    var R = ma.R, J = ma.J, PZ = ma.pos, dd = ma.dedans; if (!dd || !ma.pos0) return;
    // hors de la pièce : la forme CONSTRUITE (elle prolonge déjà le tissu, par-dessus l épaule par exemple), déplacée comme
    // ses voisins du dedans l ont été par le relâchement
    var P0 = ma.pos0, D = new Float32Array(PZ.length), ok0 = new Uint8Array(R * (J + 1));
    for (var k0 = 0; k0 < ok0.length; k0++) if (dd[k0]) { ok0[k0] = 1; for (var c0 = 0; c0 < 3; c0++) D[k0 * 3 + c0] = PZ[k0 * 3 + c0] - P0[k0 * 3 + c0]; }
    for (var tour0 = 0; tour0 < 3; tour0++) {
      var faits = [];
      for (var i0 = 0; i0 < R; i0++) for (var j0 = 0; j0 <= J; j0++) { var q0 = i0 * (J + 1) + j0; if (ok0[q0]) continue;
        var s0 = [0, 0, 0], n0 = 0;
        for (var di0 = -1; di0 <= 1; di0++) for (var dj0 = -1; dj0 <= 1; dj0++) { var a0 = i0 + di0, b0 = j0 + dj0; if (a0 < 0 || a0 >= R || b0 < 0 || b0 > J || !ok0[a0 * (J + 1) + b0]) continue;
          var w0 = a0 * (J + 1) + b0; s0[0] += D[w0 * 3]; s0[1] += D[w0 * 3 + 1]; s0[2] += D[w0 * 3 + 2]; n0++; }
        if (n0) faits.push([q0, s0[0] / n0, s0[1] / n0, s0[2] / n0]); }
      faits.forEach(function(f){ D[f[0] * 3] = f[1]; D[f[0] * 3 + 1] = f[2]; D[f[0] * 3 + 2] = f[3]; ok0[f[0]] = 1; PZ[f[0] * 3] = P0[f[0] * 3] + f[1]; PZ[f[0] * 3 + 1] = P0[f[0] * 3 + 1] + f[2]; PZ[f[0] * 3 + 2] = P0[f[0] * 3 + 2] + f[3]; });
    }
  }
  // l écart (cm) DESSINÉ de chaque couture : les sommets de bord de l une pièce contre le bord de l autre — pour le banc
  function ecartsRendus(descr){
    var bordDe = function(ma, b, sg){
      var rd = ma.rendu, I = rd.idx, cnt = {}, sur = new Uint8Array(rd.n), segs = [];
      for (var v = 0; v < rd.n; v++) if (surBord(b, sg, rd.vx[v], rd.vy[v]).d < 0.02) sur[v] = 1;
      for (var t = 0; t < I.length; t += 3) for (var e = 0; e < 3; e++) { var a = I[t + e], c = I[t + (e + 1) % 3], k = Math.min(a, c) + '_' + Math.max(a, c); cnt[k] = (cnt[k] || 0) + 1; }
      Object.keys(cnt).forEach(function(k){ if (cnt[k] !== 1) return; var ab = k.split('_').map(Number); if (sur[ab[0]] && sur[ab[1]]) segs.push(ab); });
      return { sur: sur, segs: segs, rd: rd };
    };
    var m = {};
    descr.forEach(function(D){
      if (!D[0].rendu || !D[3].rendu) return;
      var A = bordDe(D[0], D[1], D[2]), B = bordDe(D[3], D[4], D[5]), PZ = A.rd.pos, Q = B.rd.pos, pire = 0, ou = null;
      for (var v = 0; v < A.rd.n; v++) { if (!A.sur[v]) continue; var best = 1e9;
        B.segs.forEach(function(sg2){ var a = sg2[0] * 3, c = sg2[1] * 3, dx = Q[c] - Q[a], dy = Q[c + 1] - Q[a + 1], dz = Q[c + 2] - Q[a + 2], l2 = dx * dx + dy * dy + dz * dz || 1e-12;
          var u = Math.max(0, Math.min(1, ((PZ[v * 3] - Q[a]) * dx + (PZ[v * 3 + 1] - Q[a + 1]) * dy + (PZ[v * 3 + 2] - Q[a + 2]) * dz) / l2));
          var d = Math.hypot(PZ[v * 3] - Q[a] - dx * u, PZ[v * 3 + 1] - Q[a + 1] - dy * u, PZ[v * 3 + 2] - Q[a + 2] - dz * u); if (d < best) best = d; });
        if (best < 1e9 && best > pire) { pire = best; ou = [A.rd.vx[v], A.rd.vy[v]].map(function(x){ return Math.round(x * 10) / 10; }); } }
      var k2 = D[6] + (D[2] > 0 ? '+' : '-'); m[k2] = [Math.round(pire * 1000) / 1000, ou];
    });
    return m;
  }
  // l écart (cm) de chaque couture, sur la grille — pour le banc de rendu
  function ecartsCoutures(mailles){
    var m = {};
    descrCouturesHaut(mailles).forEach(function(D){ var gD = D[8] === 'B' ? embu(D[1].tot, D[4].tot) : function(u){ return u; };
      for (var k = 0; k <= 40; k++) { var t = k / 40, pa = auT(D[1], t), pb = auT(D[4], gD(t));
      var A = posVirtuel(D[0], pointVirtuel(D[0], pa[0] * D[2], pa[1])), B = posVirtuel(D[3], pointVirtuel(D[3], pb[0] * D[5], pb[1]));
      var e = Math.round(Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]) * 100) / 100; if (!m[D[6]] || e > m[D[6]][0]) m[D[6]] = [e, t, [A[0] - B[0], A[1] - B[1], A[2] - B[2]].map(function(v){ return Math.round(v * 10) / 10; })]; } });
    return m;
  }
  /* LES TRIANGLES RETOURNÉS (2026-10-18, banc 3D) : le long du bas d emmanchure (au creux de l aisselle, le bras et le tronc
     repoussent la bande de couture dans deux sens) et au bord de l encolure du dos, des triangles se retournaient — pas du drapé,
     un tissu replié sur lui-même (plis cassés à 170°). Une face est retournée quand sa normale s écarte de plus de ~100° de celle
     de la grille dessous (qui dit où est le dehors) ; ses sommets — jamais ceux cousus sur une couture — vont où le patron les
     place par rapport à leurs voisins, puis sortent du corps, si cela ne fait aucun éclat. On recommence (12 fois au plus). */
  /* LE DÉFROISSAGE (2026-10-18, le coin d aisselle) : après detordre, il reste des PLIS CASSÉS — deux triangles voisins à plus de 75° —
     surtout dans la bande cousue de la manche et au bas d emmanchure. Chaque sommet d un pli cassé essaie quelques places : vers la
     moyenne de ses voisins (5 pas), sur le plan de ses voisins, ou retourné de l autre côté de ce plan (un sommet replié). Il prend
     la meilleure si elle casse moins d arêtes autour de lui — ou autant, plus ouvertes — SANS faire d éclat (étiré > 2, tassé < 0,4),
     sans retourner de face (contre la normale de la grille), et sans s approcher du corps à moins de 8 mm (ou de son écart d avant).
     Les sommets cousus, ceux à moins de 1 cm d une couture (la voisine s y dessinait par un jour : le mannequin perçait) et ceux à
     moins de 3 cm d un bord libre (la silhouette de l encolure et de l ourlet) ne bougent pas. ⚠ Essayé aussi (2026-10-18) : rendre
     aux arêtes de la bande cousue leur longueur au patron (ressorts bornés à 0,45–1,9) — les éclats tombaient presque à zéro, mais
     l excès de tissu se repliait en plis cassés (41 → 58) ; et une membrane harmonique au coin d aisselle — plus d éclats. */
  function defroisser(ma, tubes){
    var rd = ma.rendu, PZ = rd.pos, I = rd.idx, n = rd.n, triDe = [], vois = [], cnt = {}, ar = {};
    for (var v = 0; v < n; v++) { triDe.push([]); vois.push([]); }
    for (var t = 0; t < I.length; t += 3) for (var e = 0; e < 3; e++) { var a = I[t + e], b = I[t + (e + 1) % 3], k = Math.min(a, b) + '_' + Math.max(a, b);
      triDe[a].push(t); if (vois[a].indexOf(b) < 0) vois[a].push(b); if (vois[b].indexOf(a) < 0) vois[b].push(a); cnt[k] = (cnt[k] || 0) + 1; (ar[k] = ar[k] || []).push(t); }
    // qui peut bouger : loin des coutures (1 cm) et des bords libres (3 cm), au patron
    var cx = [], cy = [], lx = [], ly = [];
    for (var v1 = 0; v1 < n; v1++) if (rd.cousu && rd.cousu[v1]) { cx.push(rd.vx[v1]); cy.push(rd.vy[v1]); }
    Object.keys(cnt).forEach(function(k){ if (cnt[k] !== 1) return; k.split('_').forEach(function(q){ q = +q; if (!rd.cousu || !rd.cousu[q]) { lx.push(rd.vx[q]); ly.push(rd.vy[q]); } }); });
    var loin = function(v, X, Y, d){ for (var i = 0; i < X.length; i++) if (Math.abs(rd.vx[v] - X[i]) < d && Math.abs(rd.vy[v] - Y[i]) < d && Math.hypot(rd.vx[v] - X[i], rd.vy[v] - Y[i]) < d) return false; return true; };
    var libre = []; for (var v2 = 0; v2 < n; v2++) if ((!rd.cousu || !rd.cousu[v2]) && loin(v2, cx, cy, 1) && loin(v2, lx, ly, 3)) libre.push(v2);
    if (!libre.length) return;
    var nrm = function(t){ var a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3; return unit3(croix3([PZ[b] - PZ[a], PZ[b + 1] - PZ[a + 1], PZ[b + 2] - PZ[a + 2]], [PZ[c] - PZ[a], PZ[c + 1] - PZ[a + 1], PZ[c + 2] - PZ[a + 2]])); };
    var COS = Math.cos(75 * Math.PI / 180);
    // la normale de référence (la grille dit où est le dehors) et le sens des faces, à la majorité (comme detordre)
    var refN = []; for (var r = 0; r < n; r++) { var pv = rd.poids[r], o = [0, 0, 0]; for (var q = 0; q < 3; q++) { var kk = pv.k[q], ww = pv.w[q]; o[0] += ma.nor[kk * 3] * ww; o[1] += ma.nor[kk * 3 + 1] * ww; o[2] += ma.nor[kk * 3 + 2] * ww; } refN.push(unit3(o)); }
    var vote = 0; for (var t0 = 0; t0 < I.length; t0 += 3) { var f0 = nrm(t0); vote += pt3(f0, refN[I[t0]]) + pt3(f0, refN[I[t0 + 1]]) + pt3(f0, refN[I[t0 + 2]]); }
    var sg = vote < 0 ? -1 : 1;
    var retourne = function(t){ var f = nrm(t), m = unit3([refN[I[t]][0] + refN[I[t + 1]][0] + refN[I[t + 2]][0], refN[I[t]][1] + refN[I[t + 1]][1] + refN[I[t + 2]][1], refN[I[t]][2] + refN[I[t + 1]][2] + refN[I[t + 2]][2]]); return sg * pt3(f, m) < -0.17; };
    // autour de v : les arêtes cassées, l angle le plus fort (son cosinus), les éclats et les faces retournées de ses triangles
    var etat = function(v){ var nc = 0, pire = 1, ecl = 0, rt = 0, vu = {};
      triDe[v].forEach(function(t){ var nt = nrm(t); if (retourne(t)) rt++;
        for (var e3 = 0; e3 < 3; e3++) { var a = I[t + e3], b = I[t + (e3 + 1) % 3], k = Math.min(a, b) + '_' + Math.max(a, b);
          ar[k].forEach(function(u){ if (u === t || vu[k + '|' + Math.min(t, u)]) return; vu[k + '|' + Math.min(t, u)] = 1; var d = pt3(nt, nrm(u)); if (d < pire) pire = d; if (d < COS) nc++; });
          var L0 = Math.hypot(rd.vx[a] - rd.vx[b], rd.vy[a] - rd.vy[b]); if (L0 > 1e-6) { var rr = Math.hypot(PZ[a * 3] - PZ[b * 3], PZ[a * 3 + 1] - PZ[b * 3 + 1], PZ[a * 3 + 2] - PZ[b * 3 + 2]) / L0; if (rr > 2 || rr < 0.4) ecl++; } } });
      return { nc: nc, cos: pire, ecl: ecl, rt: rt }; };
    var mieux = function(e1, e0){ return e1.ecl <= e0.ecl && e1.rt <= e0.rt && (e1.nc < e0.nc || (e1.nc === e0.nc && e1.cos > e0.cos + 1e-3)); };
    var un = new Float32Array(3);
    for (var tour = 0; tour < 40; tour++) {
      var bouge = 0, casse = new Uint8Array(n), fnT = {};
      // (les candidats d abord : les sommets d une arête à plus de 75° — évaluer tous les sommets libres à chaque tour coûtait ~400 ms)
      Object.keys(ar).forEach(function(k){ var l2 = ar[k]; if (l2.length !== 2) return; var a2 = fnT[l2[0]] || (fnT[l2[0]] = nrm(l2[0])), b2 = fnT[l2[1]] || (fnT[l2[1]] = nrm(l2[1]));
        if (pt3(a2, b2) < COS) { var ab = k.split('_'); casse[+ab[0]] = 1; casse[+ab[1]] = 1; } });
      libre.forEach(function(v){
        if (!casse[v]) { var pres = false; for (var iv = 0; iv < vois[v].length && !pres; iv++) if (casse[vois[v][iv]]) pres = true; if (!pres) return; }
        var e0 = etat(v); if (e0.cos > COS) return;
        var l = vois[v], m = [0, 0, 0]; l.forEach(function(q){ m[0] += PZ[q * 3] / l.length; m[1] += PZ[q * 3 + 1] / l.length; m[2] += PZ[q * 3 + 2] / l.length; });
        var old = [PZ[v * 3], PZ[v * 3 + 1], PZ[v * 3 + 2]], pn = [0, 0, 0];
        for (var i = 0; i < l.length; i++) { var a = l[i], b = l[(i + 1) % l.length], c = croix3([PZ[a * 3] - m[0], PZ[a * 3 + 1] - m[1], PZ[a * 3 + 2] - m[2]], [PZ[b * 3] - m[0], PZ[b * 3 + 1] - m[1], PZ[b * 3 + 2] - m[2]]); pn[0] += c[0]; pn[1] += c[1]; pn[2] += c[2]; }
        var cands = []; for (var f = 0.8; f >= 0.1; f /= 2) cands.push([old[0] + (m[0] - old[0]) * f, old[1] + (m[1] - old[1]) * f, old[2] + (m[2] - old[2]) * f]);
        if (Math.hypot(pn[0], pn[1], pn[2]) > 1e-9) { pn = unit3(pn); var h = (old[0] - m[0]) * pn[0] + (old[1] - m[1]) * pn[1] + (old[2] - m[2]) * pn[2];
          cands.push([old[0] - 2 * h * pn[0], old[1] - 2 * h * pn[1], old[2] - 2 * h * pn[2]]); cands.push([old[0] - h * pn[0], old[1] - h * pn[1], old[2] - h * pn[2]]); }
        var best = null, be = e0, dmin = tubes ? Math.min(versCorps(tubes, old[0], old[1], old[2]).d, 0.8) : 0;
        cands.forEach(function(c){ un[0] = c[0]; un[1] = c[1]; un[2] = c[2]; if (tubes) { repousser(un, 0, tubes, 0.4); if (versCorps(tubes, un[0], un[1], un[2]).d < dmin - 1e-3) return; }
          PZ[v * 3] = un[0]; PZ[v * 3 + 1] = un[1]; PZ[v * 3 + 2] = un[2]; var e1 = etat(v); if (mieux(e1, be)) { be = e1; best = [un[0], un[1], un[2]]; } });
        if (best) { PZ[v * 3] = best[0]; PZ[v * 3 + 1] = best[1]; PZ[v * 3 + 2] = best[2]; bouge++; } else { PZ[v * 3] = old[0]; PZ[v * 3 + 1] = old[1]; PZ[v * 3 + 2] = old[2]; }
      });
      if (!bouge) break;
    }
  }
  function detordre(ma, tubes){
    var rd = ma.rendu, PZ = rd.pos, I = rd.idx, n = rd.n, cousu = rd.cousu || new Uint8Array(n), vois = [];
    for (var v = 0; v < n; v++) vois.push([]);
    for (var t = 0; t < I.length; t += 3) for (var e = 0; e < 3; e++) { var x = I[t + e], y = I[t + (e + 1) % 3]; if (vois[x].indexOf(y) < 0) vois[x].push(y); if (vois[y].indexOf(x) < 0) vois[y].push(x); }
    var refN = new Float32Array(n * 3);
    for (var r = 0; r < n; r++) { var pv = rd.poids[r], o = [0, 0, 0]; for (var q = 0; q < 3; q++) { var k = pv.k[q], w = pv.w[q]; o[0] += ma.nor[k * 3] * w; o[1] += ma.nor[k * 3 + 1] * w; o[2] += ma.nor[k * 3 + 2] * w; }
      o = unit3(o); refN[r * 3] = o[0]; refN[r * 3 + 1] = o[1]; refN[r * 3 + 2] = o[2]; }
    var normale = function(t){ var a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
      var ex = PZ[b] - PZ[a], ey = PZ[b + 1] - PZ[a + 1], ez = PZ[b + 2] - PZ[a + 2], fx = PZ[c] - PZ[a], fy = PZ[c + 1] - PZ[a + 1], fz = PZ[c + 2] - PZ[a + 2];
      return [ey * fz - ez * fy, ez * fx - ex * fz, ex * fy - ey * fx]; };
    // le sens des faces se décide une fois, à la majorité (comme finirConforme)
    var vote = 0; for (var t0 = 0; t0 < I.length; t0 += 3) { var f0 = normale(t0); for (var s0 = 0; s0 < 3; s0++) vote += f0[0] * refN[I[t0 + s0] * 3] + f0[1] * refN[I[t0 + s0] * 3 + 1] + f0[2] * refN[I[t0 + s0] * 3 + 2]; }
    var sg = vote < 0 ? -1 : 1;
    // les triangles de chaque sommet, et combien seraient des éclats si le sommet était en (px, py, pz)
    var triDe = []; for (var v6 = 0; v6 < n; v6++) triDe.push([]);
    for (var t6 = 0; t6 < I.length; t6 += 3) for (var s6 = 0; s6 < 3; s6++) triDe[I[t6 + s6]].push(t6);
    var eclats = function(v, px, py, pz){ var nb2 = 0;
      triDe[v].forEach(function(t){
        var a2 = Math.abs((rd.vx[I[t + 1]] - rd.vx[I[t]]) * (rd.vy[I[t + 2]] - rd.vy[I[t]]) - (rd.vy[I[t + 1]] - rd.vy[I[t]]) * (rd.vx[I[t + 2]] - rd.vx[I[t]])) / 2;
        if (a2 < 0.02) return;
        for (var e2 = 0; e2 < 3; e2++) { var a = I[t + e2], b = I[t + (e2 + 1) % 3];
          var pa = a === v ? [px, py, pz] : [PZ[a * 3], PZ[a * 3 + 1], PZ[a * 3 + 2]], pb = b === v ? [px, py, pz] : [PZ[b * 3], PZ[b * 3 + 1], PZ[b * 3 + 2]];
          var l2 = Math.hypot(rd.vx[a] - rd.vx[b], rd.vy[a] - rd.vy[b]); if (l2 < 1e-6) continue;
          var r2 = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]) / l2; if (r2 > 2 || r2 < 0.4) { nb2++; return; } } });
      return nb2; };
    for (var tour = 0; tour < 12; tour++) {
      var mauvais = new Uint8Array(n), nb = 0;
      for (var t1 = 0; t1 < I.length; t1 += 3) {
        var f1 = normale(t1), l1 = Math.hypot(f1[0], f1[1], f1[2]); if (l1 < 1e-9) continue;
        var rm = [0, 0, 0]; for (var s1 = 0; s1 < 3; s1++) for (var c1 = 0; c1 < 3; c1++) rm[c1] += refN[I[t1 + s1] * 3 + c1];
        rm = unit3(rm);
        if (sg * (f1[0] * rm[0] + f1[1] * rm[1] + f1[2] * rm[2]) / l1 < -0.17) for (var s2 = 0; s2 < 3; s2++) { var vv = I[t1 + s2]; if (!cousu[vv] && !mauvais[vv]) { mauvais[vv] = 1; nb++; } }
      }
      if (!nb) break;
      var nv = PZ.slice();
      // ⚠ pas la simple moyenne des voisins : elle tassait les triangles (des éclats à la place des plis). Le sommet va là où le
      // PATRON le place par rapport à ses voisins : l application patron → 3D, ajustée sur eux (moindres carrés), en son point
      for (var v3 = 0; v3 < n; v3++) { if (!mauvais[v3] || vois[v3].length < 3) continue;
        var L = vois[v3], nq = L.length, um = 0, wm = 0, m = [0, 0, 0];
        L.forEach(function(qq){ um += rd.vx[qq]; wm += rd.vy[qq]; m[0] += PZ[qq * 3]; m[1] += PZ[qq * 3 + 1]; m[2] += PZ[qq * 3 + 2]; });
        um /= nq; wm /= nq; m = [m[0] / nq, m[1] / nq, m[2] / nq];
        var suu = 0, suw = 0, sww = 0, bu = [0, 0, 0], bw = [0, 0, 0];
        L.forEach(function(qq){ var du = rd.vx[qq] - um, dw = rd.vy[qq] - wm; suu += du * du; suw += du * dw; sww += dw * dw;
          for (var c2 = 0; c2 < 3; c2++) { var dp = PZ[qq * 3 + c2] - m[c2]; bu[c2] += du * dp; bw[c2] += dw * dp; } });
        var det = suu * sww - suw * suw, du0 = rd.vx[v3] - um, dw0 = rd.vy[v3] - wm;
        for (var c3 = 0; c3 < 3; c3++) {
          var ju = det > 1e-9 ? (bu[c3] * sww - bw[c3] * suw) / det : 0, jw = det > 1e-9 ? (bw[c3] * suu - bu[c3] * suw) / det : 0;
          nv[v3 * 3 + c3] = m[c3] + ju * du0 + jw * dw0; } }
      // ⚠ un sommet ne bouge que si AUCUN de ses triangles ne devient un éclat (étiré au-delà de 2 fois, tassé sous 0,4 — le
      // critère du banc) : au creux de l aisselle, le pli retourné absorbe du tissu de trop, et le déplier le tassait ailleurs
      var un = new Float32Array(3), bouge = 0;
      for (var v4 = 0; v4 < n; v4++) { if (!mauvais[v4]) continue;
        un[0] = nv[v4 * 3]; un[1] = nv[v4 * 3 + 1]; un[2] = nv[v4 * 3 + 2]; if (tubes) repousser(un, 0, tubes, 0.4);
        if (eclats(v4, PZ[v4 * 3], PZ[v4 * 3 + 1], PZ[v4 * 3 + 2]) < eclats(v4, un[0], un[1], un[2])) continue;
        PZ[v4 * 3] = un[0]; PZ[v4 * 3 + 1] = un[1]; PZ[v4 * 3 + 2] = un[2]; bouge++; }
      if (!bouge) break;
    }
  }
  /* ══ LES PLIS DE VIE (2026-10-18, sa demande : « continue le moteur 3D, ajoute les plis de vie » — que l aperçu ressemble à la
     photo d un vrai vêtement porté) ══ Posés APRÈS la couture, sur le maillage dessiné, comme un champ de déplacement défini dans
     l ESPACE (pas sur le patron) : continu d une pièce à l autre, il ne peut pas ouvrir une couture — les sommets cousus prennent
     en plus le même déplacement que leur vis-à-vis. Le tissu ne se creuse jamais vers le corps : il se soulève, le long de sa
     normale, de 0 à A.
       · le TOMBÉ : sous la poitrine, des ondulations verticales qui s accentuent vers le bas et là où le tissu flotte ;
       · la TAILLE : de douces ondulations horizontales, surtout sur les côtés, là où le haut ajusté se tasse ;
       · l AISSELLE : des plis en éventail qui rayonnent du bas d emmanchure, sur le corps et sur la manche — plus longs et plus
         marqués vers la poitrine (les plis de TRACTION du buste vers l aisselle) ;
       · le COUDE (manches longues) : des fronces en travers, surtout au creux, côté intérieur ;
       · l OURLET (bas du corps, bas de manche) : un léger ROULÉ juste au-dessus du bord — l épaisseur du tissu replié, à tous les
         réglages (ce n est pas un pli).
     L amplitude suit « Plis » (Aucun : rien ; Naturels : ~0,7 cm au plus ; Marqués : un peu plus, ses plis de grille faisant le
     reste), la longueur d onde suit le tissu (fluide : plis fins et nombreux ; rigide : larges et rares). La phase vient du modèle
     (même modèle, mêmes plis). Chaque sommet garde son « creux » : l ombre de contact l assombrit (plisAO).
     ⚠ LE GARDE-FOU : un soulèvement qui étirerait un triangle au-delà de 1,95 fois sa longueur au patron, le tasserait sous 0,42
     ou casserait un pli (plus de 75° entre deux triangles voisins) — là où le tissu n en était pas déjà là — est réduit, sommet
     par sommet, jusqu à ce qu il n y en ait plus. Mesuré par tools/banc-3d-haut.js (« plis de vie », plafonds). */
  function plisDeVie(mailles, tubes){
    var vie = reglageVie(), A0 = vie.a, L = vie.l, stats = { max: 0, rms: 0, n: 0 }, colBC = [];
    var aBande3 = V3 && V3.m && ['tshirt', 'debardeur', 'sweat'].indexOf(V3.m.base) >= 0 && (V3.m.pieces || []).some(function(p){ return p.id === 'bande'; });
    mailles.forEach(function(ma){ if (ma.rendu) ma.rendu.creux = null; });
    var tronc = tubes ? tubes.filter(function(t){ return t.nom === 'tronc'; })[0] : null;
    if (!tronc) { GLV.plisVie = stats; return; }
    // (« Marqués » ne la pousse pas plus loin que A0 = 1 : ses plis de grille, déjà 1,7 fois plus forts, font le reste)
    var Amax = A0 > 0 ? Math.min(0.8, 0.09 * L) * Math.min(1, A0) : 0, AROULE = 0.14;
    var sid = String((V3 && V3.m && V3.m.id) || ''), g0 = 7; for (var c0 = 0; c0 < sid.length; c0++) g0 = (g0 * 31 + sid.charCodeAt(c0)) % 9973;
    var ph = g0 / 9973 * 2 * Math.PI, lisse = function(u){ u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
    var poi = tubes.filter(function(t){ return t.nom === 'poitrine'; })[0], brasT = tubes.filter(function(t){ return /bras/.test(t.nom); });
    var anneau = function(h){ var A = tronc.an;
      for (var q = 0; q + 1 < A.length; q++) if ((A[q].c.y - h) * (A[q + 1].c.y - h) <= 0) { var u = (h - A[q].c.y) / ((A[q + 1].c.y - A[q].c.y) || 1);
        return { x: A[q].c.x + (A[q + 1].c.x - A[q].c.x) * u, z: (A[q].c.z || 0) + ((A[q + 1].c.z || 0) - (A[q].c.z || 0)) * u, r: (A[q].rx + A[q].rz + (A[q + 1].rx + A[q + 1].rz - A[q].rx - A[q].rz) * u) / 2 }; }
      var a = A[h < A[0].c.y ? 0 : A.length - 1]; return { x: a.c.x, z: a.c.z || 0, r: (a.rx + a.rz) / 2 }; };
    // les repères : le bas d emmanchure (de chaque côté), la poitrine (et son sommet de chaque côté), la taille
    var dv = mailles.filter(function(m){ return m.pid === 'devant' && m.rendu; })[0]; if (!dv) { GLV.plisVie = stats; return; }
    var cA = dv.pc.p.contour[3], PA = [1, -1].map(function(S){ var rd = dv.rendu, b = -1, bd = 1e9;
      for (var v = 0; v < rd.n; v++) { var dd = Math.hypot(rd.vx[v] - S * Math.abs(cA.x), rd.vy[v] - cA.y); if (dd < bd) { bd = dd; b = v; } }
      return [rd.pos[b * 3], rd.pos[b * 3 + 1], rd.pos[b * 3 + 2]]; });
    var yA = (PA[0][1] + PA[1][1]) / 2, yB = poi ? poi.an[0].c.y : yA - 8, yW = yA - 15, rW = 1e9;
    tronc.an.forEach(function(a){ if (a.c.y < yA - 6 && a.c.y > yA - 30 && a.rx < rW) { rW = a.rx; yW = a.c.y; } });
    // le sommet de la poitrine, de chaque côté : l anneau de la bande de buste le plus en avant, à mi-chemin du milieu et du flanc
    var bustes = [1, -1].map(function(S){ var best = null;
      if (poi) poi.an.forEach(function(a){ if ((a.c.x >= 0 ? 1 : -1) !== S && Math.abs(a.c.x) > 0.5) return; var z = (a.c.z || 0) + a.rz; if (!best || z > best[2]) best = [a.c.x, a.c.y, z]; });
      return best || [S * 7, yB, anneau(yB).z + anneau(yB).r]; });
    // l omoplate, de chaque côté : sur le dos, 4 cm au-dessus du bas d emmanchure, à ~43° du milieu dos (le but des plis de traction du dos)
    var omoplates = [1, -1].map(function(S){ var a = anneau(yA + 4), th = S * (Math.PI - 0.75); return [a.x + Math.sin(th) * a.r, yA + 4, a.z + Math.cos(th) * a.r]; });
    // un NOMBRE ENTIER de plis autour du tronc (pris à la taille) : la phase fait le tour sans saut — l angle passe de +π à -π au milieu
    // dos, et une longueur d onde quelconque y cassait les plis en V
    var Nt = Math.max(3, Math.round(2 * Math.PI * anneau(yW).r / L));
    var coude = brasT.map(function(T){ var a = T.an[0].c, b = T.an[T.an.length - 1].c, Lb = Math.hypot(b.x - a.x, b.y - a.y, (b.z || 0) - (a.z || 0));
      return { o: [a.x, a.y, a.z || 0], ax: unit3([b.x - a.x, b.y - a.y, (b.z || 0) - (a.z || 0)]), te: Lb * 0.47, S: a.x >= 0 ? 1 : -1 }; });
    // les sommets cousus et leurs vis-à-vis (avant de bouger quoi que ce soit)
    var cases = {}, cle = function(x, y, z){ return Math.round(x * 20) + '_' + Math.round(y * 20) + '_' + Math.round(z * 20); };
    mailles.forEach(function(ma, mi){ var rd = ma.rendu; if (!rd || !rd.cousu) return;
      for (var v = 0; v < rd.n; v++) if (rd.cousu[v]) { var k = cle(rd.pos[v * 3], rd.pos[v * 3 + 1], rd.pos[v * 3 + 2]); (cases[k] = cases[k] || []).push([mi, v]); } });
    // la distance (3D) au sommet cousu le plus proche, par une grille de 1 cm
    var grilleC = {}; mailles.forEach(function(ma){ var rd = ma.rendu; if (!rd || !rd.cousu) return;
      for (var v = 0; v < rd.n; v++) if (rd.cousu[v]) { var k = Math.floor(rd.pos[v * 3]) + '_' + Math.floor(rd.pos[v * 3 + 1]) + '_' + Math.floor(rd.pos[v * 3 + 2]); (grilleC[k] = grilleC[k] || []).push([rd.pos[v * 3], rd.pos[v * 3 + 1], rd.pos[v * 3 + 2]]); } });
    var versCouture = function(p){ var x = Math.floor(p[0]), y = Math.floor(p[1]), z = Math.floor(p[2]), b = 9;
      for (var dx = -2; dx <= 2; dx++) for (var dy = -2; dy <= 2; dy++) for (var dz = -2; dz <= 2; dz++) (grilleC[(x + dx) + '_' + (y + dy) + '_' + (z + dz)] || []).forEach(function(q){ b = Math.min(b, Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2])); });
      return b; };
    var champ = function(ma, p){
      var amp = [], gs = [], aw = [], a = anneau(p[1]), th = Math.atan2(p[0] - a.x, p[2] - a.z), corps = ma.pid !== 'manche';
      if (!(Amax > 0)) return { d: 0, a: 0 };
      var vc = versCorps(tubes, p[0], p[1], p[2]), e = Math.max(0, Math.min(1, (vc.d < 1e8 ? vc.d : 0) / 1.2)), dC = versCouture(p);
      if (corps) {
        // le tombé et la taille s effacent à l approche d une couture (1,5 cm) ; le garde-fou fait le reste
        var fc = lisse(dC / 1.5);
        amp.push(fc * Amax * (0.35 + 0.65 * e) * lisse((yB - 2 - p[1]) / 16)); gs.push(0.5 - 0.5 * Math.cos(Nt * th + 0.9 * Math.sin(p[1] / 11 + ph) + ph));
        // (surtout sur les CÔTÉS — là où un haut se tasse sur la hanche ; tout autour, on aurait dit des anneaux)
        var cote = Math.pow(Math.abs(Math.sin(th)), 1.5);
        amp.push(fc * Amax * 0.3 * Math.exp(-Math.pow((p[1] - yW) / 5, 2)) * (1 - 0.6 * e) * (0.25 + 0.75 * cote)); gs.push(0.5 - 0.5 * Math.cos(2 * Math.PI * (p[1] - yW) / (0.75 * L) + 0.7 * Math.sin(2 * th + ph)));
      }
      // les éventails d aisselle, plus longs et plus forts du côté de la poitrine (la traction du buste vers l aisselle) ; ils
      // meurent à 1 cm de la couture. (15 cm de rayon — jusqu à 18 vers la poitrine seulement, et 12 sur la manche : plus loin,
      // l éventail atteignait le bas d une manche courte et le flanc dessous, et les écartait l un de l autre)
      PA.forEach(function(P, iS){ var dx = p[0] - P[0], dy = p[1] - P[1], dz = p[2] - P[2], r = Math.hypot(dx, dy, dz); if (r > 18 || dy > 1.5) return;
        var B = bustes[iS], vb = unit3([B[0] - P[0], B[1] - P[1], B[2] - P[2]]), cb = r > 0.01 ? Math.max(0, (dx * vb[0] + dy * vb[1] + dz * vb[2]) / r) : 0;
        // (la traction ne vaut que sur le DEVANT de la poitrine — sur le flanc, sous la manche, elle l écartait du corps)
        var tr = corps ? cb * cb * lisse((Math.cos(th) - 0.4) / 0.3) : 0, lg = 7 + 3 * tr; if (r > (corps ? 15 + 3 * tr : 12)) return;
        amp.push(lisse(dC / 1) * Amax * (0.5 + 0.2 * tr) * Math.exp(-r / lg) * lisse((r - 3) / 2)); gs.push(0.5 - 0.5 * Math.cos(8 * Math.atan2(-dy, Math.hypot(dx, dz)) + ph)); });
      /* LES PLIS DE TRACTION (2026-10-18, sa demande : « des plis de traction francs du buste vers l aisselle, et du dos vers
         l aisselle, lisibles à distance normale ») : des CRÊTES en rayons, du bas d emmanchure vers le sommet de la poitrine (trois,
         devant) et vers l omoplate (deux, plus douces, dos). Larges de ~3 cm EN TRAVERS du rayon (le maillage fait 1 cm : une crête
         plus fine ne se dessinait pas), espacées de 16°, elles naissent à 1 cm de l aisselle et s effilent jusqu à rien aux 85 % du
         chemin. Leur ombre (aw, à moitié) borde la crête seulement : comptée sur tout l éventail, elle noircissait le buste en aplat.
         ⚠ (2026-10-18, sa décision : « adoucis les plis de traction ») une première version, 3 fois plus haute (0,75 cm) et coupée
         net avant la poitrine, se lisait comme des creux et des bosses — une bosse isolée au milieu du buste du t-shirt L. Ici ~0,2 cm. */
      if (corps) PA.forEach(function(P, iS){
        [[bustes[iS], 1, 3], [omoplates[iS], 0.7, 2]].forEach(function(cfg){ var B = cfg[0];
          var dx = p[0] - P[0], dy = p[1] - P[1], dz = p[2] - P[2], r = Math.hypot(dx, dy, dz), u = [B[0] - P[0], B[1] - P[1], B[2] - P[2]], LB = Math.hypot(u[0], u[1], u[2]);
          if (r < 0.5 || LB < 1 || r > LB * 0.85) return; u = [u[0] / LB, u[1] / LB, u[2] / LB];
          var c = Math.max(-1, Math.min(1, (dx * u[0] + dy * u[1] + dz * u[2]) / r)); if (c < 0.6) return;
          // de quel côté du rayon central : le signe de la composante perpendiculaire, vers le haut
          var perp = [dx / r - u[0] * c, dy / r - u[1] * c, dz / r - u[2] * c], up = [-u[0] * u[1], 1 - u[1] * u[1], -u[2] * u[1]], phi = (pt3(perp, up) >= 0 ? 1 : -1) * Math.acos(c);
          var sl = r * Math.sin(phi), nf = cfg[2], g = 0;
          for (var k = 0; k < nf; k++) { var c0 = r * Math.sin(((k - (nf - 1) / 2) * 16 - 4) * Math.PI / 180), z = (sl - c0) / 1.7; g = Math.max(g, Math.exp(-z * z / 2) * (1 - 0.25 * Math.abs(k - (nf - 1) / 2))); }
          // l amplitude décroît d un bout à l autre (forte à l aisselle, nulle avant la poitrine) : pas de bosse isolée au milieu du buste
          var A = lisse(dC / 1) * Amax * 0.5 * cfg[1] * lisse((r - 1) / 3) * Math.pow(Math.max(0, 1 - r / (LB * 0.85)), 0.8) * lisse((c - 0.6) / 0.2);
          amp.push(A); gs.push(g); aw[amp.length - 1] = A * Math.min(1, g * 1.4) * 0.5; }); });
      if (!corps) coude.forEach(function(C){ if ((p[0] >= 0 ? 1 : -1) !== C.S) return;
        var w = sub3(p, C.o), t = pt3(w, C.ax), rr = [w[0] - C.ax[0] * t, w[1] - C.ax[1] * t, w[2] - C.ax[2] * t], rl = Math.hypot(rr[0], rr[1], rr[2]) || 1;
        amp.push(Amax * 0.55 * Math.exp(-Math.pow((t - C.te) / 4, 2)) * (0.3 + 0.7 * Math.max(0, rr[2] / rl)));
        gs.push(0.5 - 0.5 * Math.cos(2 * Math.PI * t / 3.5 + 1.3 * Math.sin(2 * Math.atan2(rr[2], rr[0] * C.S) + ph))); });
      var d = 0, al = 0; for (var i = 0; i < amp.length; i++) { d += amp[i] * gs[i]; al += aw[i] != null ? aw[i] : amp[i]; }
      return { d: Math.min(d, Amax * 1.2), a: Math.min(al, Amax * 1.2) };
    };
    // la normale de chaque sommet (orientée vers le dehors, à la majorité, comme finirConforme), et ses voisins
    mailles.forEach(function(ma){
      var rd = ma.rendu; if (!rd) return; var PZ = rd.pos, I = rd.idx, n = rd.n, nor = new Float32Array(n * 3), refN = new Float32Array(n * 3), vote = 0, fn = [];
      for (var r0 = 0; r0 < n; r0++) { var pv = rd.poids[r0]; for (var q0 = 0; q0 < 3; q0++) { var k0 = pv.k[q0], w0 = pv.w[q0]; refN[r0 * 3] += ma.nor[k0 * 3] * w0; refN[r0 * 3 + 1] += ma.nor[k0 * 3 + 1] * w0; refN[r0 * 3 + 2] += ma.nor[k0 * 3 + 2] * w0; } }
      for (var t = 0; t < I.length; t += 3) { var a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
        var ex = PZ[b] - PZ[a], ey = PZ[b + 1] - PZ[a + 1], ez = PZ[b + 2] - PZ[a + 2], fx = PZ[c] - PZ[a], fy = PZ[c + 1] - PZ[a + 1], fz = PZ[c + 2] - PZ[a + 2];
        var f = [ey * fz - ez * fy, ez * fx - ex * fz, ex * fy - ey * fx]; fn.push(f); vote += f[0] * refN[a] + f[1] * refN[a + 1] + f[2] * refN[a + 2]; }
      var sg = vote < 0 ? -1 : 1;
      for (var t2 = 0; t2 < I.length; t2 += 3) { var f2 = fn[t2 / 3]; for (var s2 = 0; s2 < 3; s2++) { var k2 = I[t2 + s2] * 3; nor[k2] += f2[0] * sg; nor[k2 + 1] += f2[1] * sg; nor[k2 + 2] += f2[2] * sg; } }
      for (var v1 = 0; v1 < n; v1++) { var u1 = unit3([nor[v1 * 3], nor[v1 * 3 + 1], nor[v1 * 3 + 2]]); nor[v1 * 3] = u1[0]; nor[v1 * 3 + 1] = u1[1]; nor[v1 * 3 + 2] = u1[2]; }
      rd.nPli = nor;
    });
    // ⚠ sur une couture, les deux bords se soulèvent selon la MÊME normale (la moyenne du groupe) : chacun selon la sienne, ils
    // s écartaient
    Object.keys(cases).forEach(function(k){ var l = cases[k]; if (l.length < 2) return; var m = [0, 0, 0];
      l.forEach(function(e){ var N = mailles[e[0]].rendu.nPli; m[0] += N[e[1] * 3]; m[1] += N[e[1] * 3 + 1]; m[2] += N[e[1] * 3 + 2]; });
      m = unit3(m); l.forEach(function(e){ var N = mailles[e[0]].rendu.nPli; N[e[1] * 3] = m[0]; N[e[1] * 3 + 1] = m[1]; N[e[1] * 3 + 2] = m[2]; }); });
    mailles.forEach(function(ma){
      var rd = ma.rendu; if (!rd || !rd.nPli) return; var PZ = rd.pos, n = rd.n, nor = rd.nPli, I = rd.idx, vois = [], cnt = {};
      for (var v0 = 0; v0 < n; v0++) vois.push([]);
      for (var t0 = 0; t0 < I.length; t0 += 3) for (var e0 = 0; e0 < 3; e0++) { var x0 = I[t0 + e0], y0 = I[t0 + (e0 + 1) % 3]; if (vois[x0].indexOf(y0) < 0) vois[x0].push(y0); if (vois[y0].indexOf(x0) < 0) vois[y0].push(x0);
        var kk = Math.min(x0, y0) + '_' + Math.max(x0, y0); cnt[kk] = (cnt[kk] || 0) + 1; }
      // l OURLET : les bords libres du BAS de la pièce (ourlet du corps, bas de manche) — la distance au patron de chaque sommet
      var ymax = -1e9; for (var vy = 0; vy < n; vy++) ymax = Math.max(ymax, rd.vy[vy]);
      var bas = []; Object.keys(cnt).forEach(function(kk){ if (cnt[kk] !== 1) return; kk.split('_').forEach(function(q){ q = +q; if ((!rd.cousu || !rd.cousu[q]) && rd.vy[q] > ymax - 2.5 && bas.indexOf(q) < 0) bas.push(q); }); });
      // l ENCOLURE en bord-côte (la bande des t-shirts, débardeurs, sweats) : les bords libres du HAUT du devant et du dos
      var col = [];
      if (aBande3 && (ma.pid === 'devant' || ma.pid === 'dos')) Object.keys(cnt).forEach(function(kk){ if (cnt[kk] !== 1) return; kk.split('_').forEach(function(q){ q = +q; if ((!rd.cousu || !rd.cousu[q]) && rd.vy[q] < ymax - 2.5 && col.indexOf(q) < 0) col.push(q); }); });
      var creux = new Float32Array(n), dep = new Float32Array(n * 3), pD = new Float32Array(n);
      for (var v = 0; v < n; v++) {
        var nn = [nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]], ch = champ(ma, [PZ[v * 3], PZ[v * 3 + 1], PZ[v * 3 + 2]]);
        /* ⚠ dans un CREUX du tissu (concave), soulever le long de la normale retourne les triangles dès que le soulèvement dépasse le
           rayon du creux ; sur une CRÊTE vive (convexe), les normales voisines divergent et le soulèvement étire le tissu. Il est
           borné à la moitié du rayon : R ≈ e² / 2|h|, h la hauteur du milieu des voisins au-dessus du plan tangent, e leur distance. */
        var L0 = vois[v]; if (L0.length >= 3 && ch.d > 0) { var mx = 0, my = 0, mz = 0, el = 0;
          L0.forEach(function(q){ mx += PZ[q * 3]; my += PZ[q * 3 + 1]; mz += PZ[q * 3 + 2]; el += Math.hypot(PZ[q * 3] - PZ[v * 3], PZ[q * 3 + 1] - PZ[v * 3 + 1], PZ[q * 3 + 2] - PZ[v * 3 + 2]); });
          var hh = (mx / L0.length - PZ[v * 3]) * nn[0] + (my / L0.length - PZ[v * 3 + 1]) * nn[1] + (mz / L0.length - PZ[v * 3 + 2]) * nn[2]; el /= L0.length;
          if (Math.abs(hh) > 1e-4) { var dR = Math.min(ch.d, 0.5 * el * el / (2 * Math.abs(hh))); ch.a *= dR / ch.d; ch.d = dR; } }
        creux[v] = ch.a > 0.03 ? (ch.a - ch.d) / Math.max(ch.a, 0.3) * Math.min(1, ch.a / 0.4) : 0; pD[v] = ch.d;
        // le roulé de l ourlet : une crête douce à ~4 mm du bord, et une ombre juste au-dessus
        var db = 9; for (var ib = 0; ib < bas.length; ib++) { var qb = bas[ib]; db = Math.min(db, Math.hypot(rd.vx[qb] - rd.vx[v], rd.vy[qb] - rd.vy[v])); }
        var ro = db < 2 ? AROULE * Math.exp(-Math.pow((db - 0.4) / 0.32, 2)) : 0;
        if (db < 2) creux[v] = Math.max(creux[v], 0.5 * Math.exp(-Math.pow((db - 1.0) / 0.3, 2)));
        /* L ÉPAISSEUR DU BORD-CÔTE (2026-10-18, sa demande) : la bande, double, se tient 1,3 mm plus haut que le jersey (une marche à la
           couture, 2 cm du bord, et son ombre) ; son bord est un pli ROULÉ — il bombe à ~4 mm, puis le tissu tourne vers le dedans :
           l épaisseur se lit de dessus. Effacé près de la couture d épaule : le devant et le dos s y levaient différemment (une
           fente au point de cou). À tous les réglages, comme le roulé de l ourlet. */
        if (col.length) { var dc = 9; for (var ic = 0; ic < col.length; ic++) { var qc = col[ic]; dc = Math.min(dc, Math.hypot(rd.vx[qc] - rd.vx[v], rd.vy[qc] - rd.vy[v])); }
          if (dc < 3) { var fcs = lisse(versCouture([PZ[v * 3], PZ[v * 3 + 1], PZ[v * 3 + 2]]) / 1.5);
            var bc = (0.13 * lisse((2.15 - dc) / 0.3) + 0.09 * Math.exp(-Math.pow((dc - 0.4) / 0.25, 2)) - 0.16 * lisse((0.3 - dc) / 0.3)) * fcs;
            ro += bc; colBC.push([dc, bc]); creux[v] = Math.max(creux[v], 0.45 * Math.exp(-Math.pow((dc - 2.25) / 0.18, 2))); } }
        var dd = ch.d + ro; dep[v * 3] = nn[0] * dd; dep[v * 3 + 1] = nn[1] * dd; dep[v * 3 + 2] = nn[2] * dd;
      }
      rd.creux = creux; rd.nPli = null; rd.dep = dep; rd.pD = pD;
    });
    /* les coutures tenues : les sommets cousus qui COÏNCIDAIENT (à 0,05 mm) prennent le même déplacement (la moyenne). ⚠ Pas la
       position moyenne d une case : au point de cou, elle mêlait des sommets voisins mais distincts et retournait les petits
       triangles du coin. */
    var groupes = [];
    Object.keys(cases).forEach(function(k){ var l = cases[k]; if (l.length < 2) return;
      var P0 = mailles[l[0][0]].rendu.pos, i0 = l[0][1], grp = l.filter(function(e){ var P = mailles[e[0]].rendu.pos;
        return Math.hypot(P[e[1] * 3] - P0[i0 * 3], P[e[1] * 3 + 1] - P0[i0 * 3 + 1], P[e[1] * 3 + 2] - P0[i0 * 3 + 2]) < 0.005; });
      if (grp.length < 2) return; groupes.push(grp); var m = [0, 0, 0];
      grp.forEach(function(e){ var d = mailles[e[0]].rendu.dep; m[0] += d[e[1] * 3]; m[1] += d[e[1] * 3 + 1]; m[2] += d[e[1] * 3 + 2]; });
      grp.forEach(function(e){ var d = mailles[e[0]].rendu.dep; d[e[1] * 3] = m[0] / grp.length; d[e[1] * 3 + 1] = m[1] / grp.length; d[e[1] * 3 + 2] = m[2] / grp.length; }); });
    /* LE GARDE-FOU (voir plus haut) : chaque pièce garde un facteur par sommet (1 au départ) ; on cherche les triangles que le
       soulèvement étirerait au-delà de 1,95, tasserait sous 0,42, ou les paires qu il casserait (> 75°), là où ce n était pas déjà
       le cas — leurs sommets sont réduits de 40 %, et l on recommence (8 fois au plus). Un groupe cousu prend le plus petit facteur
       de ses membres : la couture reste fermée. */
    var etat = mailles.map(function(ma){ var rd = ma.rendu; if (!rd || !rd.dep) return null; var I = rd.idx, ar = {};
      for (var t = 0; t < I.length; t += 3) for (var e = 0; e < 3; e++) { var a = I[t + e], b = I[t + (e + 1) % 3], k = Math.min(a, b) + '_' + Math.max(a, b); (ar[k] = ar[k] || []).push(t); }
      return { s: new Float32Array(rd.n).fill(1), ar: ar }; });
    var posA = function(rd, s, v, apres){ var f = apres ? s[v] : 0; return [rd.pos[v * 3] + rd.dep[v * 3] * f, rd.pos[v * 3 + 1] + rd.dep[v * 3 + 1] * f, rd.pos[v * 3 + 2] + rd.dep[v * 3 + 2] * f]; };
    var bilan = function(rd, s, t, apres){ var I = rd.idx, a = I[t], b = I[t + 1], c = I[t + 2], P = [posA(rd, s, a, apres), posA(rd, s, b, apres), posA(rd, s, c, apres)], mn = 9, mx = 0;
      [[a, b, 0, 1], [b, c, 1, 2], [c, a, 2, 0]].forEach(function(e){ var l2 = Math.hypot(rd.vx[e[0]] - rd.vx[e[1]], rd.vy[e[0]] - rd.vy[e[1]]); if (l2 < 0.05) return;
        var r = Math.hypot(P[e[2]][0] - P[e[3]][0], P[e[2]][1] - P[e[3]][1], P[e[2]][2] - P[e[3]][2]) / l2; mn = Math.min(mn, r); mx = Math.max(mx, r); });
      return { mn: mn, mx: mx, n: unit3(croix3(sub3(P[1], P[0]), sub3(P[2], P[0]))) }; };
    for (var tour = 0; tour < 8; tour++) {
      var marque = 0;
      mailles.forEach(function(ma, mi){ var E = etat[mi]; if (!E) return; var rd = ma.rendu, I = rd.idx, s = E.s, mauvais = new Uint8Array(rd.n), av = [], ap = [];
        for (var t = 0; t < I.length; t += 3) { var b0 = bilan(rd, s, t, false), b1 = bilan(rd, s, t, true); av.push(b0); ap.push(b1);
          if ((b1.mx > 1.95 && b1.mx > b0.mx + 0.005) || (b1.mn < 0.42 && b1.mn < b0.mn - 0.005)) { mauvais[I[t]] = mauvais[I[t + 1]] = mauvais[I[t + 2]] = 1; } }
        Object.keys(E.ar).forEach(function(k){ var l = E.ar[k]; if (l.length !== 2) return; var x = av[l[0] / 3], y = av[l[1] / 3], x1 = ap[l[0] / 3], y1 = ap[l[1] / 3];
          var c0 = x.n[0] * y.n[0] + x.n[1] * y.n[1] + x.n[2] * y.n[2], c1 = x1.n[0] * y1.n[0] + x1.n[1] * y1.n[1] + x1.n[2] * y1.n[2];
          if (c1 < 0.26 && c1 < c0 - 0.005) [l[0], l[1]].forEach(function(t){ mauvais[I[t]] = mauvais[I[t + 1]] = mauvais[I[t + 2]] = 1; }); });
        for (var v = 0; v < rd.n; v++) if (mauvais[v] && s[v] > 0.01) { s[v] *= 0.6; marque++; } });
      groupes.forEach(function(grp){ var m = 1; grp.forEach(function(e){ var E = etat[e[0]]; if (E) m = Math.min(m, E.s[e[1]]); }); grp.forEach(function(e){ var E = etat[e[0]]; if (E) E.s[e[1]] = m; }); });
      if (!marque) break;
    }
    mailles.forEach(function(ma, mi){ var rd = ma.rendu, E = etat[mi]; if (!rd || !rd.dep || !E) return;
      for (var v3 = 0; v3 < rd.n; v3++) { var f = E.s[v3]; rd.pos[v3 * 3] += rd.dep[v3 * 3] * f; rd.pos[v3 * 3 + 1] += rd.dep[v3 * 3 + 1] * f; rd.pos[v3 * 3 + 2] += rd.dep[v3 * 3 + 2] * f; if (f < 1) rd.creux[v3] *= f;
        // (la mesure du banc : le pli vraiment posé, après le garde-fou — sans le roulé d ourlet, qui n est pas un pli)
        if (ma.pid !== 'manche') { var dq = rd.pD[v3] * f; stats.max = Math.max(stats.max, dq); stats.rms += dq * dq; stats.n++; } }
      if (ma.pid !== 'manche') { rd.levee = new Float32Array(rd.n); for (var v4 = 0; v4 < rd.n; v4++) rd.levee[v4] = rd.pD[v4] * E.s[v4]; }
      rd.dep = null; rd.pD = null; });
    stats.rms = stats.n ? Math.sqrt(stats.rms / stats.n) : 0;
    /* (la mesure du banc) LES PLIS DE TRACTION : sur un arc entre 25 et 50 % du chemin du bas d emmanchure au sommet de la poitrine
       (devant), à l omoplate (dos), à ±45° de cette direction, la plus forte levée posée par pas de 2° ; on compte les crêtes qui
       dominent leurs creux d au moins 0,5 mm. Par côté : [crêtes, la plus franche (cm)]. Puis le bord-côte : sa marche (cm, la
       bande contre le jersey dessous) et son roulé (la bosse du bord contre le bord lui-même). */
    stats.traction = {}; [['devant', bustes], ['dos', omoplates]].forEach(function(cf){ var ma = mailles.filter(function(m){ return m.pid === cf[0] && m.rendu && m.rendu.levee; })[0]; if (!ma) return;
      stats.traction[cf[0]] = PA.map(function(P, iS){ var B = cf[1][iS], u = sub3(B, P), LB = Math.hypot(u[0], u[1], u[2]), rd = ma.rendu, bins = []; u = [u[0] / LB, u[1] / LB, u[2] / LB];
        for (var v = 0; v < rd.n; v++) { var d = [rd.pos[v * 3] - P[0], rd.pos[v * 3 + 1] - P[1], rd.pos[v * 3 + 2] - P[2]], r = Math.hypot(d[0], d[1], d[2]); if (r < 0.25 * LB || r > 0.5 * LB) continue;
          var c = pt3(d, u) / r; if (c < 0.7) continue; var pp = [d[0] / r - u[0] * c, d[1] / r - u[1] * c, d[2] / r - u[2] * c], up = [-u[0] * u[1], 1 - u[1] * u[1], -u[2] * u[1]];
          var k = Math.round((pt3(pp, up) >= 0 ? 1 : -1) * Math.acos(Math.min(1, c)) * 90 / Math.PI) + 23; bins[k] = Math.max(bins[k] || 0, rd.levee[v]); }
        var l = []; for (var i = 0; i <= 46; i++) if (bins[i] != null) l.push(bins[i]);
        var nC = 0, best = 0; for (var j = 1; j + 1 < l.length; j++) { if (!(l[j] >= l[j - 1] && l[j] >= l[j + 1])) continue;
          var gm = l[j], dm = l[j]; for (var g2 = j - 1; g2 >= 0; g2--) { gm = Math.min(gm, l[g2]); if (l[g2] > l[j]) break; } for (var d2 = j + 1; d2 < l.length; d2++) { dm = Math.min(dm, l[d2]); if (l[d2] > l[j]) break; }
          var pr = l[j] - Math.max(gm, dm); if (pr >= 0.05) { nC++; best = Math.max(best, pr); } }
        return [nC, Math.round(best * 100) / 100]; }); });
    if (colBC.length) { var mk = function(a, b){ var s0 = 0, n0 = 0; colBC.forEach(function(e){ if (e[0] >= a && e[0] < b) { s0 += e[1]; n0++; } }); return n0 ? s0 / n0 : 0; };
      stats.bordCote = { marche: Math.round((mk(0.8, 1.6) - mk(2.6, 3)) * 1000) / 1000, roule: Math.round((mk(0.3, 0.5) - mk(0, 0.1)) * 1000) / 1000 }; }
    GLV.plisVie = stats;
  }
  // l ombre des creux de plis (après finirConforme : elle multiplie l ombre de contact du sommet)
  function plisAO(mailles){ mailles.forEach(function(ma){ var rd = ma.rendu; if (!rd || !rd.creux || !rd.ao) return; for (var v = 0; v < rd.n; v++) rd.ao[v] *= 1 - 0.28 * rd.creux[v]; }); }
  function conformerHaut(mailles, tubes){
    var tops = mailles.filter(function(m){ return m.pid === 'devant' || m.pid === 'dos' || m.pid === 'manche'; });
    if (window.__szBanc3d) GLV.ecartsAvantZip = ecartsCoutures(mailles);
    tops.forEach(function(ma){ try { ma.rendu = maillageConforme(ma); } catch (e) { ma.rendu = null; GLV.erreurConf = String(e && e.stack || e); } });
    try { zipperCoutures(tops, descrCouturesHaut(mailles), tubes); } catch (e) { GLV.erreurConf = String(e && e.stack || e); }
    tops.forEach(function(ma){ if (ma.rendu) detordre(ma, tubes); });
    tops.forEach(function(ma){ if (ma.rendu) defroisser(ma, tubes); });
    if (window.__szBanc3d) try { GLV.ecartsRendus = ecartsRendus(descrCouturesHaut(mailles)); } catch (e) { GLV.erreurConf = String(e && e.stack || e); }
  }
  /* L OMBRE DE CONTACT (occlusion ambiante, 2026-10-17, sa référence Fal.ai : le tissu y a de la PROFONDEUR — plus
     sombre sous les manches, sur les flancs contre les bras). Pour chaque sommet, douze directions de la demi-sphère
     au-dessus de sa normale ; on avance de 0,6 à 9 cm et l on compte ce que le corps (tronc, bras, épaules) cache.
     Le résultat multiplie la lumière du sommet (aO). */
  function dansTube(T, x, y, z){
    var q = (x - T.c0.x) * T.ax[0] + (y - T.c0.y) * T.ax[1] + (z - (T.c0.z || 0)) * T.ax[2];
    if (q < T.pmin || q > T.pmax) return false;
    var an = T.an, pr = T.proj, i = 0, mont = pr[pr.length - 1] > pr[0];
    while (i + 1 < pr.length - 1 && (mont ? pr[i + 1] < q : pr[i + 1] > q)) i++;
    var u = Math.max(0, Math.min(1, (q - pr[i]) / ((pr[i + 1] - pr[i]) || 1))), a = an[i], b = an[i + 1];
    var cx = a.c.x + (b.c.x - a.c.x) * u, cy = a.c.y + (b.c.y - a.c.y) * u, cz = (a.c.z || 0) + ((b.c.z || 0) - (a.c.z || 0)) * u;
    var rx = a.rx + (b.rx - a.rx) * u, rz = a.rz + (b.rz - a.rz) * u, dx = x - cx, dy = y - cy, dz = z - cz, pa = dx * T.ax[0] + dy * T.ax[1] + dz * T.ax[2];
    dx -= T.ax[0] * pa; dy -= T.ax[1] * pa; dz -= T.ax[2] * pa;
    if (T.vertical) return (dx / rx) * (dx / rx) + (dz / rz) * (dz / rz) < 1;
    var du = dx * T.u[0] + dy * T.u[1] + dz * T.u[2]; return (du / rx) * (du / rx) + (dz / rz) * (dz / rz) < 1;
  }
  function ombreContact(mailles, tubes){
    if (!tubes || !tubes.length) return;
    var DIRS = [], PAS = [0.6, 1.5, 3, 5.5, 9];
    for (var k = 0; k < 12; k++) { var a = 2 * Math.PI * k / 12 + (k % 2) * 0.26, el = k % 2 ? 0.35 : 0.85; DIRS.push([Math.cos(a) * Math.sin(Math.acos(el)), el, Math.sin(a) * Math.sin(Math.acos(el))]); }
    mailles.forEach(function(ma){
      var n = ma.R * (ma.J + 1), pos = ma.pos, nor = ma.nor, oc = new Float32Array(n).fill(1);
      for (var v = 0; v < n; v++) {
        if (ma.dedans && !ma.dedans[v]) continue;
        var px = pos[v * 3], py = pos[v * 3 + 1], pz = pos[v * 3 + 2], nn = [nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]];
        var tg = Math.abs(nn[1]) < 0.9 ? unit3(croix3(nn, [0, 1, 0])) : unit3(croix3(nn, [1, 0, 0])), bt = croix3(nn, tg), occ = 0;
        for (var d = 0; d < 12; d++) {
          var D = DIRS[d], dir = [tg[0] * D[0] + nn[0] * D[1] + bt[0] * D[2], tg[1] * D[0] + nn[1] * D[1] + bt[1] * D[2], tg[2] * D[0] + nn[2] * D[1] + bt[2] * D[2]];
          for (var s2 = 0; s2 < PAS.length; s2++) { var t = PAS[s2], x = px + dir[0] * t, y = py + dir[1] * t, z = pz + dir[2] * t, cache = false;
            for (var ti = 0; ti < tubes.length && !cache; ti++) cache = dansTube(tubes[ti], x, y, z);
            if (cache) { occ += 1 - t / 12; break; } }
        }
        oc[v] = 1 - 0.5 * Math.min(1, occ / 12 * 1.6);
      }
      // lissée sur ses voisins (deux passes) : point par point, elle mouchetait les flancs
      for (var ps = 0; ps < 2; ps++) { var o2 = oc.slice(); for (var i = 0; i < ma.R; i++) for (var j = 0; j <= ma.J; j++) { var q = i * (ma.J + 1) + j, sm = oc[q] * 2, nb = 2;
        if (j > 0) { sm += oc[q - 1]; nb++; } if (j < ma.J) { sm += oc[q + 1]; nb++; } if (i > 0) { sm += oc[q - ma.J - 1]; nb++; } if (i + 1 < ma.R) { sm += oc[q + ma.J + 1]; nb++; } o2[q] = sm / nb; } oc = o2; }
      for (var v2 = 0; v2 < n; v2++) ma.ao[v2] *= oc[v2];
    });
  }
  function lisserBord(ma, W){
    var R = ma.R, J = ma.J, dd = ma.dedans, g = ma.gid, pos = ma.pos; if (!dd) return;
    var bande = new Uint8Array(R * (J + 1));
    for (var i = 0; i < R; i++) for (var j = 0; j <= J; j++) {
      var k = i * (J + 1) + j; if (g[k] < 0 || !W[g[k]]) continue;
      var bord = false; for (var di = -1; di <= 1 && !bord; di++) for (var dj = -1; dj <= 1; dj++) { var a = i + di, b = j + dj; if (a < 0 || a >= R || b < 0 || b > J) continue; if (dd[a * (J + 1) + b] !== dd[k]) { bord = true; break; } }
      if (bord) bande[k] = 1;
    }
    for (var ps = 0; ps < 6; ps++) {
      var nv = pos.slice();
      for (var i2 = 0; i2 < R; i2++) for (var j2 = 0; j2 <= J; j2++) {
        var k2 = i2 * (J + 1) + j2; if (!bande[k2]) continue;
        var n = 0, sx = 0, sy = 0, sz = 0;
        for (var di2 = -1; di2 <= 1; di2++) for (var dj2 = -1; dj2 <= 1; dj2++) { if (!di2 && !dj2) continue; var a2 = i2 + di2, b2 = j2 + dj2; if (a2 < 0 || a2 >= R || b2 < 0 || b2 > J) continue;
          var q = a2 * (J + 1) + b2; if (!bande[q] || dd[q] !== dd[k2]) continue; n++; sx += pos[q * 3]; sy += pos[q * 3 + 1]; sz += pos[q * 3 + 2]; }
        if (n < 2) continue;
        nv[k2 * 3] = pos[k2 * 3] * 0.5 + sx / n * 0.5; nv[k2 * 3 + 1] = pos[k2 * 3 + 1] * 0.5 + sy / n * 0.5; nv[k2 * 3 + 2] = pos[k2 * 3 + 2] * 0.5 + sz / n * 0.5;
      }
      pos.set(nv);
    }
  }
  // les normales recalculées après le drapé (différences finies, orientées vers le dehors)
  function normalesGrille(ma){
    var R = ma.R, J = ma.J, pos = ma.pos, nor = ma.nor, at = function(i, j){ var k = (i * (J + 1) + j) * 3; return [pos[k], pos[k + 1], pos[k + 2]]; };
    for (var i = 0; i < R; i++) for (var j = 0; j <= J; j++) {
      var nn = unit3(croix3(sub3(at(i, Math.min(J, j + 1)), at(i, Math.max(0, j - 1))), sub3(at(Math.min(R - 1, i + 1), j), at(Math.max(0, i - 1), j)))), k = (i * (J + 1) + j) * 3;
      var ref = [nor[k], nor[k + 1], nor[k + 2]]; if (pt3(nn, ref) < 0) nn = [-nn[0], -nn[1], -nn[2]];
      nor[k] = nn[0]; nor[k + 1] = nn[1]; nor[k + 2] = nn[2];
    }
  }


  /* LES COUTURES DU PATRON : les bords cousus ensemble, tirés des NŒUDS des pièces (comme l atelier les nomme) —
     et non « au plus proche », qui soudait n importe quoi (dents de scie aux côtés, épaulettes aux manches).
     Chaque bord est échantillonné par longueur ; le k-ième point de l un se coud au k-ième de l autre. */
  function cubSeg(a, b, t){
    if (b.c1 && b.c2) { var u = 1 - t; return [u * u * u * a.x + 3 * u * u * t * b.c1.x + 3 * u * t * t * b.c2.x + t * t * t * b.x, u * u * u * a.y + 3 * u * u * t * b.c1.y + 3 * u * t * t * b.c2.y + t * t * t * b.y]; }
    return [a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t];
  }
  function bordPts(c, k0, k1, sens){
    // le chemin de nœud en nœud, de k0 à k1 (sens +1 : nœuds croissants ; −1 : décroissants) — une courbe va de
    // son nœud d avant au nœud qui porte ses poignées ; à l envers, on la parcourt de t = 1 à t = 0
    var n = c.length, pts = [[c[k0].x, c[k0].y]], k = k0, garde = 0;
    while (k !== k1 && garde++ < n + 2) {
      var kn = (k + sens + n) % n, a = sens > 0 ? c[k] : c[kn], b = sens > 0 ? c[kn] : c[k];
      var ns = b.c1 && b.c2 ? 32 : 12;
      for (var s = 1; s <= ns; s++) pts.push(cubSeg(a, b, sens > 0 ? s / ns : 1 - s / ns));
      k = kn;
    }
    // ré-échantillonné tous les 0,8 cm
    var Ls = [0]; for (var i = 1; i < pts.length; i++) Ls.push(Ls[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts: pts, L: Ls, tot: Ls[Ls.length - 1] };
  }
  function auT(b, t){
    var d = t * b.tot, i = 1; while (i < b.L.length - 1 && b.L[i] < d) i++;
    var u = (d - b.L[i - 1]) / ((b.L[i] - b.L[i - 1]) || 1), p = b.pts[i - 1], q = b.pts[i];
    return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
  }
  // la particule d une maille la plus proche d un point (x, y) du patron
  function gidPres(ma, x, y){
    var R = ma.R, J = ma.J, bb = ma.pc.bb, i = 0, dm = 1e9;
    for (var r = 0; r < R; r++) { var d = Math.abs(ma.yp[r] - y); if (d < dm) { dm = d; i = r; } }
    var j = Math.round((x - bb.x0) / (bb.x1 - bb.x0) * J);
    for (var rr = 0; rr <= 2; rr++) for (var di = -rr; di <= rr; di++) for (var dj = -rr; dj <= rr; dj++) {
      var a = i + di, b2 = j + dj; if (a < 0 || a >= R || b2 < 0 || b2 > J) continue;
      var g = ma.gid[a * (J + 1) + b2]; if (g >= 0) return g;
    }
    return -1;
  }
  function coudre(paires, maA, bA, sxA, maB, bB, sxB, pas){
    if (!maA || !maB) return;
    var n = Math.max(6, Math.round(Math.max(bA.tot, bB.tot) / (pas || 0.4)));
    for (var k = 0; k <= n; k++) {
      var t = k / n, pa = auT(bA, t), pb = auT(bB, t);
      var ga = gidPres(maA, pa[0] * sxA, pa[1]), gb = gidPres(maB, pb[0] * sxB, pb[1]);
      if (ga >= 0 && gb >= 0 && ga !== gb) paires.push([ga, gb]);
    }
  }
  /* Les coutures d un HAUT (et d une jupe) : épaules, côtés, têtes et dessous de manche, des deux côtés. */
  function couturesPatron(mailles){
    var paires = [], dv = mailles.filter(function(m){ return m.pid === 'devant'; })[0], ds = mailles.filter(function(m){ return m.pid === 'dos'; })[0];
    if (!dv || !ds) return paires;
    var cf = dv.pc.p.contour, cb = ds.pc.p.contour, fam = fam3d(), nf = cf.length, nb = cb.length;
    var manches = mailles.filter(function(m){ return m.pid === 'manche'; });
    if (fam === 'bas') {
      var cote = function(pid, S){ return mailles.filter(function(m){ if (m.pid !== pid) return false; var sx = 0, n = 0; for (var k = 0; k < m.pos.length; k += 30) { sx += m.pos[k]; n++; } return (sx / Math.max(1, n)) * S > 0; })[0]; };
      [1, -1].forEach(function(S){
        var a = cote('devant', S), b = cote('dos', S); if (!a || !b || nf < 9 || nb < 9) return;
        coudre(paires, a, bordPts(cf, 6, 8, 1), 1, b, bordPts(cb, 6, 8, 1), 1);                        // côté
        coudre(paires, a, bordPts(cf, 3, 5, 1), 1, b, bordPts(cb, 3, 5, 1), 1);                        // entrejambe
      });
      coudre(paires, cote('devant', 1), bordPts(cf, 1, 3, 1), 1, cote('devant', -1), bordPts(cf, 1, 3, 1), 1);   // milieu devant
      coudre(paires, cote('dos', 1), bordPts(cb, 1, 3, 1), 1, cote('dos', -1), bordPts(cb, 1, 3, 1), 1);         // milieu dos
      return paires;
    }
    [1, -1].forEach(function(S){
      // le devant côté S est son x de signe S ; le dos côté S, son x de signe −S (le dos est tourné)
      if (fam === 'jupe') { coudre(paires, dv, bordPts(cf, 1, 3, 1), S, ds, bordPts(cb, 1, 3, 1), -S); return; }
      if (nf < 6 || nb < 6) return;
      // l épaule, cousue SERRÉ (un point tous les 1,5 mm) : le devant et le dos s écartaient entre deux points
      coudre(paires, dv, bordPts(cf, 1, 2, 1), S, ds, bordPts(cb, 1, 2, 1), -S, 0.15);                 // épaule
      coudre(paires, dv, bordPts(cf, 3, nf - 2, 1), S, ds, bordPts(cb, 3, nb - 2, 1), -S);             // côté
      var mc = manches.filter(function(m){ var sx = 0, n = 0; for (var k = 0; k < m.pos.length; k += 30) { sx += m.pos[k]; n++; } return (sx / Math.max(1, n)) * S > 0; })[0];
      if (mc && mc.pc.p.contour.length >= 5) {
        var cm = mc.pc.p.contour;
        coudre(paires, mc, bordPts(cm, 1, 2, 1), 1, dv, bordPts(cf, 2, 3, 1), S);                      // tête avant → emmanchure du devant
        coudre(paires, mc, bordPts(cm, 1, 0, -1), 1, ds, bordPts(cb, 2, 3, 1), -S);                    // tête arrière → emmanchure du dos
        coudre(paires, mc, bordPts(cm, 2, 3, 1), 1, mc, bordPts(cm, 0, 4, -1), 1);                     // dessous de manche
      }
    });
    return paires;
  }

  /* Les maillages d une taille (à chaque nouvel aperçu du site). */
  /* LES ÉPAULES DU MANNEQUIN (2026-10-18, sa remarque : « des manches ballon »). Le corps du site pose l articulation des bras si haut
     que le dessus du bras arrive à 2 cm sous la base du cou : une épaule CARRÉE. Le patron, lui, fait descendre l épaule de 4 à 5 cm :
     le dessus du bras dépassait la ligne d épaule du vêtement, et la manche l enjambait en épaulette. Pour un haut, les bras sont
     abaissés jusqu à ce que leur sommet tombe 2 cm SOUS LE POINT D ÉPAULE DU PATRON (sa pente : le cou du patron → le point d épaule) ;
     la tête prolonge alors la ligne d épaule sans être soulevée (mesuré : « épaulette » de tools/banc-3d-haut.js). Une fois. */
  function abaisserBras(r, chute){
    if (!r || r._brasAbaisses || !(r.corps || []).length) return;
    r._brasAbaisses = true;
    var tr = r.corps.filter(function(t){ return /tronc/.test(t.nom || ''); })[0]; if (!tr || !(tr.anneaux || []).length) return;
    var yN = tr.anneaux[tr.anneaux.length - 1].c.y;
    r.corps.forEach(function(t){
      if (!/bras/.test(t.nom || '') || (t.anneaux || []).length < 2) return;
      var a0 = t.anneaux[0], d = (a0.c.y + Math.max(a0.rx, a0.rz)) - (yN - (chute || 4.5)); if (!(d > 0)) return;
      t.anneaux = t.anneaux.map(function(a){ return Object.assign({}, a, { c: { x: a.c.x, y: a.c.y - d, z: a.c.z || 0 } }); });
    });
  }
  function construireGL(r){
    var gl = GLV.gl, pieces = {};

    GLV.mailles.forEach(function(ma){ [ma.bP, ma.bN, ma.bT, ma.bK, ma.bO, ma.bI, ma.bL].forEach(function(b){ if (b) gl.deleteBuffer(b); }); });
    Object.keys(GLV.toiles).forEach(function(k){ if (GLV.toiles[k].tex) gl.deleteTexture(GLV.toiles[k].tex); });
    GLV.mailles = []; GLV.toiles = {};
    (r.pieces || []).forEach(function(p){
      var pc = depliee(p), bb = pc.bb, pp = function(v){ var n = 256; while (n < v && n < GLV.maxTex) n *= 2; return n; };
      pc.toile = document.createElement('canvas'); pc.toile.width = pp((bb.x1 - bb.x0) * 32); pc.toile.height = pp((bb.y1 - bb.y0) * 32);
      pieces[p.id] = pc; GLV.toiles[p.id] = pc;
    });
    if (fam3d() === 'haut' && pieces.devant && pieces.dos && pieces.devant.p.contour.length > 3 && pieces.dos.p.contour.length > 3) {
      var cdv = pieces.devant.p.contour, cds = pieces.dos.p.contour;
      abaisserBras(r, ((cdv[2].y - cdv[1].y) + (cds[2].y - cds[1].y)) / 2 + 2);
    }
    if (r.motif3d === 'tete') GLV.mailles = maillesTete(r, pieces);
    /* LE PANTALON : chaque pièce de chaque jambe est UN maillage, de la ceinture à l ourlet — au-dessus de la
       fourche sur l anneau des hanches, au-dessous sur celui de la jambe (le haut et les jambes se chevauchaient : une
       marche se voyait). Le drapé coud ensuite le côté, l entrejambe et les milieux. */
    if (fam3d() === 'bas' && r.fourche != null) {
      var tH = (r.vetement || []).filter(function(t){ return /haut/.test(t.nom || ''); })[0];
      [[1, /gauche/], [-1, /droite/]].forEach(function(x){
        var tj = (r.vetement || []).filter(function(t){ return x[1].test(t.nom || ''); })[0]; if (!tH || !tj) return;
        var rangs = tH.anneaux.filter(function(a){ return a.yp != null && a.yp < r.fourche; }).map(function(a){ return Object.assign({}, a, { mode: 'haut' }); })
          .concat(tj.anneaux.filter(function(a){ return a.yp != null && a.yp >= r.fourche; }).map(function(a){ return Object.assign({}, a, { mode: 'jambe' }); }));
        if (rangs.length > 2) ['devant', 'dos'].forEach(function(pid){ if (pieces[pid]) GLV.mailles.push(mailleBas(rangs, pieces[pid], pid, x[0], 'jambe')); });
      });
    }
    // la ligne d épaule PARTAGÉE (la moyenne du devant et du dos) : les deux pièces partent de la même crête
    GLV.ligneEpaule = null;
    if (fam3d() === 'haut' && pieces.devant && pieces.dos && pieces.devant.p.contour.length > 3 && pieces.dos.p.contour.length > 3) {
      var ligneDe = function(c){ var nk = c[1], ep = c[2]; return function(ax){ return ax <= nk.x ? nk.y : ax >= ep.x ? ep.y : nk.y + (ep.y - nk.y) * (ax - nk.x) / Math.max(0.1, ep.x - nk.x); }; };
      var lf = ligneDe(pieces.devant.p.contour), lb = ligneDe(pieces.dos.p.contour);
      GLV.ligneEpaule = function(ax){ return (lf(ax) + lb(ax)) / 2; };
      // la largeur du patron (devant + dos) à un rang : c est elle qui fait le tour de l anneau, au rang POSÉ
      var cfL = pieces.devant.p.contour, cbL = pieces.dos.p.contour;
      GLV.tourPatron = function(y){ var a = bornesXF(cfL, y), b = bornesXF(cbL, y); return a && b ? Math.max(Math.abs(a.x0), Math.abs(a.x1)) + Math.max(Math.abs(b.x0), Math.abs(b.x1)) : 0; };
    }
    (r.vetement || []).forEach(function(tb){
      var an = (tb.anneaux || []).filter(function(a){ return a.yp != null; }); if (an.length < 2) return;
      // ⚠ avec le DRAPÉ, le haut garde la forme du CORPS (des épaules qui tombent) : élargi jusqu au cou, il faisait
      // des épaules carrées, et la tête de manche s accrochait au coin en épaulette. Sans drapé, l élargissement reste.
      if (an[0].sf != null) { var drapeOn = ['haut', 'jupe'].indexOf(fam3d()) >= 0 && (r.corps || []).length; an = lisser(drapeOn ? adoucir(an) : epaules(adoucir(an), pieces.devant && pieces.devant.p.contour[2] ? pieces.devant.p.contour[2].y : 0)); }
      if (an[0].sf != null) ['devant', 'dos'].forEach(function(pid){ if (pieces[pid]) GLV.mailles.push(mailleCorps(an, pieces[pid], pid)); });
      else if (an[0].wf !== undefined && r.fourche == null) {
        var mode = /haut/.test(tb.nom || '') ? 'haut' : 'jambe', cotes = mode === 'haut' ? [1, -1] : [/gauche/.test(tb.nom || '') ? 1 : -1];
        cotes.forEach(function(sgb){ ['devant', 'dos'].forEach(function(pid){ if (pieces[pid]) GLV.mailles.push(mailleBas(an, pieces[pid], pid, sgb, mode)); }); });
      }
      else if (an[0].s0 != null && pieces.manche) { var sxm = 0; an.forEach(function(a){ sxm += a.c.x; }); GLV.mailles.push(mailleManche(an, pieces.manche, attacheManche(sxm >= 0 ? 1 : -1))); }
    });
    // LE DRAPÉ : les vêtements portés sur le corps (pas les chapeaux)
    var famD = fam3d();
    if (famD === 'haut' && (r.corps || []).length) {
      /* ⚠ LE HAUT N EST PLUS DRAPÉ (2026-10-17, ses captures en XS : « affreux », coutures d épaule et de côté déchirées).
         Le drapé recousait des pièces construites séparément, au sommet de grille le plus proche : il les tirait de
         travers, et c est ce qui froissait et déchirait. La forme CONSTRUITE est juste (l épaule enroulée sur le
         mannequin, les côtés joints par construction, la manche en dôme sur l axe du bras) : elle reste telle quelle,
         avec une passe de collision et un lissage là où le tissu a été poussé. Jupes et pantalons gardent le drapé. */
      var tubesH = corpsDrape(r.corps);
      // d abord le CORPS seul (il trouve sa forme) ; puis la tête de manche se raccorde à SON emmanchure ; puis tout ensemble
      var brut = window.__szBanc3d && window.__szBanc3d.cas && window.__szBanc3d.cas.brut;     // le banc : la forme construite, sans ajustement
      // la forme CONSTRUITE, gardée : hors de la pièce, la grille la suit (voir prolongerDehors)
      // ⚠ L ORDRE COMPTE : le corps s ajuste d abord ; la tête de manche se raccorde ensuite à SON emmanchure ajustée (raccordée
      // avant, elle restait sur l emmanchure d avant et le zip devait la replier : une languette vue par l envers) ; puis la manche s ajuste
      var corpsH = GLV.mailles.filter(function(m){ return m.pid === 'devant' || m.pid === 'dos'; }), manchesH = GLV.mailles.filter(function(m){ return m.pid === 'manche'; });
      // (le dehors de chaque pièce est refait JUSTE APRÈS son ajustement : refait plus tard, il déplaçait le bord de l emmanchure
      // sous la tête de manche déjà raccordée — le zip devait alors l étirer jusqu à 16 fois)
      corpsH.forEach(function(m){ m.pos0 = m.pos.slice(); });
      /* L EMPIÈCEMENT PLAQUÉ (2026-10-18) : au-dessus de l aisselle, le haut est construit sur les anneaux du site ; le mannequin, lui,
         descend plus vite au bout de l épaule — le coin d épaule restait EN L AIR au-dessus du bras (une petite corne). Il est ramené
         vers le corps, à 0,6 cm d aisance. */
      var plaqueEmp = function(ma){ var cc = ma.pc.p.contour; if (cc.length < 4) return null; var ya = cc[3].y, R = ma.R, J = ma.J, cib = new Float32Array(R * (J + 1));
        for (var i = 0; i < R; i++) if (ma.yp[i] < ya) for (var j = 0; j <= J; j++) cib[i * (J + 1) + j] = 0.6 + Math.max(0, ma.yp[i] - (ya - 4)) * 0.3;
        return cib; };
      if (!brut) { ajusterAuCorps(corpsH, tubesH, null, plaqueEmp); corpsH.forEach(prolongerDehors); }
      teteSurEmmanchure(GLV.mailles);
      manchesH.forEach(function(m){ m.pos0 = m.pos.slice(); });
      // la bande du bord de tête (1,5 cm au patron) reste où le raccord l a posée : sur l emmanchure, déjà hors du corps
      var figeTete = function(ma, i, j){ var c = ma.pc.p.contour; if (c.length < 5) return false; var x = ma.pc.bb.x0 + (ma.pc.bb.x1 - ma.pc.bb.x0) * j / ma.J;
        return ma.yp[i] < bordTete(x >= 0 ? bordPts(c, 1, 2, 1) : bordPts(c, 1, 0, -1), x).y + 1.5; };
      /* LA TÊTE PLAQUÉE (2026-10-18, sa remarque : « des manches ballon ») : au-dessus de l anneau du bras, la tête ne garde que
         l AISANCE DE LA MANCHE (l écart de son anneau au bras, 0,5 cm au moins) — elle flottait jusqu à 1,5 cm au-dessus de l épaule. */
      var plaqueTete = function(ma){
        var c = ma.pc.p.contour; if (c.length < 5) return null;
        var ch = Math.max(c[0].y, c[2].y), R = ma.R, J = ma.J, yp = ma.yp, iT = 0; while (iT + 1 < R && yp[iT] < ch + 1.5) iT++;
        var cib = new Float32Array(R * (J + 1));
        for (var j = 0; j <= J; j++) { var k0 = (iT * (J + 1) + j) * 3, g0 = versCorps(tubesH, ma.pos[k0], ma.pos[k0 + 1], ma.pos[k0 + 2]).d, cible = Math.max(0.5, Math.min(1.2, g0 < 1e8 ? g0 : 0.8));
          for (var i = 0; i <= Math.min(R - 1, iT + 1); i++) cib[i * (J + 1) + j] = cible; }
        return cib;
      };
      if (!brut) { ajusterAuCorps(manchesH, tubesH, figeTete, plaqueTete); manchesH.forEach(prolongerDehors); }
      // (seuls les BRAS font une ombre de contact — sous les manches, sur les flancs ; le cou, la ligne d épaules et la
      // bande de buste, aux bouts plats, dessinaient un rectangle sombre en haut de la poitrine)
      try { ombreContact(GLV.mailles, tubesH.filter(function(t){ return /bras/.test(t.nom); })); } catch (e) {}
      // la pièce DESSINÉE au contour exact, ses coutures zippées (voir maillageConforme)
      conformerHaut(GLV.mailles, tubesH);
      try { plisDeVie(GLV.mailles.filter(function(ma){ return ma.rendu; }), tubesH); } catch (e) { GLV.plisVie = { erreur: String(e && e.message || e) }; }
      GLV.mailles.forEach(function(ma){ if (ma.rendu) finirConforme(ma); });
      soudeNormales(GLV.mailles.filter(function(ma){ return ma.rendu; }));
      plisAO(GLV.mailles);
    } else if (['haut', 'jupe', 'bas'].indexOf(famD) >= 0 && (r.corps || []).length) {
      var epY = pieces.devant && pieces.devant.p.contour[2] ? pieces.devant.p.contour[2].y : 0;
      try {
        GLV.soudures = draper(GLV.mailles, r.corps, function(ma, i){
          if (ma.pid !== 'devant' && ma.pid !== 'dos') return false;
          return famD === 'haut' ? ma.yp[i] <= 1.2 : i <= 2;                   // tenu à l encolure (les épaules se posent sur le corps), ou à la ceinture
          // (⚠ tenir aussi la crête d épaule a été essayé le 2026-10-17 : le mannequin la traversait — voir coudre, pas serré)
        }, 60, famD === 'bas');                                            // un pantalon reprend ses longueurs du patron (la hanche rejoint la jambe)
      } catch (e) { GLV.soudures = -1; }
      try { ombreContact(GLV.mailles, corpsDrape(r.corps)); } catch (e) {}
    }
    var y0 = 1e9, y1 = -1e9;
    GLV.mailles.forEach(function(ma){
      for (var k = 1; k < ma.pos.length; k += 3) { if (ma.pos[k] < y0) y0 = ma.pos[k]; if (ma.pos[k] > y1) y1 = ma.pos[k]; }
      // ce qui se DESSINE : le maillage conforme s il existe (les hauts), sinon la grille
      var rd = ma.rendu || ma, rc = ma.rendu ? recouvrement(ma) : null;
      ma.bP = tampon(gl, rc ? rc.pos : rd.pos); ma.bN = tampon(gl, rd.nor); ma.bT = tampon(gl, rc ? rc.uv : rd.uv); ma.bK = tampon(gl, rd.tint); ma.bO = tampon(gl, rd.ao);
      ma.bI = tampon(gl, rd.idx, gl.ELEMENT_ARRAY_BUFFER); ma.bL = tampon(gl, rd.lig, gl.ELEMENT_ARRAY_BUFFER); ma.nIdx = rd.idx.length; ma.nLig = rd.lig.length;
    });
    if (GLV.mq) { gl.deleteBuffer(GLV.mq.bP); gl.deleteBuffer(GLV.mq.bN); if (GLV.mq.bA) gl.deleteBuffer(GLV.mq.bA); GLV.mq = null; }
    if (['haut', 'jupe', 'bas'].indexOf(famD) >= 0 && (r.corps || []).length) { var mq = mannequinGL(r); if (mq.n) GLV.mq = { bP: tampon(gl, mq.pos), bN: tampon(gl, mq.nor), bA: tampon(gl, mq.omb), n: mq.n }; }
    GLV.cy = (y0 + y1) / 2; GLV.h = Math.max(1, y1 - y0); GLV.ybas = y0; GLV.r = r; GLV.cle = '';
    // le cadrage : SERRÉ sur le vêtement, comme une photo de studio (sa référence Fal.ai) — un cadre de 120 cm au moins
    // laissait un t-shirt de 65 cm perdu au milieu ; un chapeau garde 34 cm au moins
    GLV.minH = r.motif3d === 'tete' ? 34 : 40;
  }

  /* ══ LE MANNEQUIN (2026-10-17, sa référence : le rendu Fal.ai, un t-shirt sur un mannequin blanc) ══
     Le corps invisible qui sert au drapé (le tronc, le cou, les bras ; les jambes pour une jupe ou un pantalon),
     peint en mannequin de vitrine : blanc cassé, satiné. Il remplit l encolure (sans lui, un trou sombre) et
     donne au vêtement son échelle. Le cou s arrête net à 9 cm, comme un buste de couture. */
  function mannequinGL(r){
    var pos = [], nor = [], fam = fam3d(), S = 36;
    // ⚠ PEINT 5 mm PLUS MINCE que le corps du drapé : un mannequin a du jeu sous le vêtement — au ras du tissu, il
    // affleurait par le moindre interstice (des taches grises le long de la crête d épaule)
    var anneau = function(a0, ax){
      var a = { c: a0.c, rx: Math.max(0.2, a0.rx - 0.5), rz: Math.max(0.2, a0.rz - 0.5) };
      var c = [a.c.x, a.c.y, a.c.z || 0], u, v;
      if (Math.abs(ax[1]) > 0.9) { u = [1, 0, 0]; v = [0, 0, 1]; } else { u = unit3(croix3(ax, [0, 0, 1])); v = [0, 0, 1]; }
      var pts = [], nrm = [];
      for (var s2 = 0; s2 <= S; s2++) { var t = 2 * Math.PI * s2 / S, co = Math.cos(t), si = Math.sin(t);
        pts.push([c[0] + u[0] * a.rx * si + v[0] * a.rz * co, c[1] + u[1] * a.rx * si + v[1] * a.rz * co, c[2] + u[2] * a.rx * si + v[2] * a.rz * co]);
        nrm.push(unit3([u[0] * si / a.rx + v[0] * co / a.rz, u[1] * si / a.rx + v[1] * co / a.rz, u[2] * si / a.rx + v[2] * co / a.rz])); }
      return { p: pts, n: nrm, c: c, ax: ax };
    };
    var tri = function(a, b, c2, na, nb, nc){ pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c2[0], c2[1], c2[2]); nor.push(na[0], na[1], na[2], nb[0], nb[1], nb[2], nc[0], nc[1], nc[2]); };
    var bouchon = function(A, sens){ var nn = [A.ax[0] * sens, A.ax[1] * sens, A.ax[2] * sens]; for (var s3 = 0; s3 < S; s3++) tri(A.c, A.p[s3], A.p[s3 + 1], nn, nn, nn); };
    corpsComplet(r.corps).forEach(function(t){
      var nm = String(t.nom || ''), an = (t.anneaux || []).slice();
      if (/jambe/.test(nm) && ['bas', 'jupe'].indexOf(fam) < 0) return;
      if (/tete/.test(nm)) { var y0 = an[0].c.y; an = an.filter(function(a){ return a.c.y <= y0 + 8; }); if (an.length < 2) return;
        // le haut du cou s arrondit (un buste de couture, pas un tube coupé)
        var hn = an[an.length - 1]; for (var qn = 1; qn <= 4; qn++) { var th2 = qn / 4 * Math.PI / 2; an.push({ c: { x: hn.c.x, y: hn.c.y + Math.sin(th2) * 1.6, z: hn.c.z || 0 }, rx: Math.max(0.2, hn.rx * Math.cos(th2)), rz: Math.max(0.2, hn.rz * Math.cos(th2)) }); } }
      if (an.length < 2) return;
      var rings = an.map(function(a, i){ var b = an[Math.min(an.length - 1, i + 1)], c0 = an[Math.max(0, i - 1)];
        return anneau(a, unit3([b.c.x - c0.c.x, b.c.y - c0.c.y, (b.c.z || 0) - (c0.c.z || 0)])); });
      for (var i = 0; i + 1 < rings.length; i++) { var A = rings[i], B = rings[i + 1];
        for (var k = 0; k < S; k++) { tri(A.p[k], B.p[k], B.p[k + 1], A.n[k], B.n[k], B.n[k + 1]); tri(A.p[k], B.p[k + 1], A.p[k + 1], A.n[k], B.n[k + 1], A.n[k + 1]); } }
      if (/tete/.test(nm)) bouchon(rings[rings.length - 1], 1);
      if (/bras/.test(nm) || /jambe/.test(nm) || /epaules/.test(nm) || /poitrine/.test(nm)) bouchon(rings[rings.length - 1], 1);
      if (/epaules/.test(nm) || /poitrine/.test(nm)) bouchon(rings[0], -1);
      // fermé en haut : l intérieur se voyait dans l encolure. ⚠ (2026-10-18) le couvercle est posé 1 cm SOUS le dernier anneau : à
      // sa hauteur, son bord (en pleine lumière, tourné vers le haut) se confondait avec le pied du cou — une ellipse de points
      // blancs, vue d en haut (il en reste quelques-uns, plus rares)
      if (/tronc/.test(nm)) { bouchon(rings[0], -1); var hautT = rings[rings.length - 1], dC = function(q){ return [q[0] - hautT.ax[0], q[1] - hautT.ax[1], q[2] - hautT.ax[2]]; };
        bouchon({ c: dC(hautT.c), p: hautT.p.map(dC), ax: hautT.ax }, 1); }
    });
    /* L OMBRE DU VÊTEMENT SUR LE MANNEQUIN (2026-10-18, sa capture 72 : « le gris du cou passe par des triangles », des coins
       blancs au dos du col ; et sur le mannequin homme, deux reflets blancs dans l encolure — la cassure de la capsule des
       épaules) : vu d en haut, la pente des épaules du mannequin — en pleine lumière, à facettes — brillait entre le cou et le
       bord-côte, comme des éclats. Sous un vêtement, le corps est dans l ombre du tissu : chaque point du mannequin s assombrit
       à l approche du tissu (de moitié au contact, plus rien à 4 cm). Le cou, loin du col, reste clair. */
    var omb = new Float32Array(pos.length / 3).fill(1), cases = {}, CS = 2;
    (GLV && GLV.mailles || []).forEach(function(ma){ var P = (ma.rendu || ma).pos; for (var k = 0; k < P.length; k += 3) {
      var cl = Math.floor(P[k] / CS) + '_' + Math.floor(P[k + 1] / CS) + '_' + Math.floor(P[k + 2] / CS); (cases[cl] = cases[cl] || []).push(P[k], P[k + 1], P[k + 2]); } });
    var deja = {};      // (le mannequin est une soupe de triangles : chaque point y revient ~6 fois — calculé une fois)
    for (var w = 0; w < omb.length; w++) {
      var x = pos[w * 3], y = pos[w * 3 + 1], z = pos[w * 3 + 2], cleP = Math.round(x * 100) + '_' + Math.round(y * 100) + '_' + Math.round(z * 100);
      if (deja[cleP] != null) { omb[w] = deja[cleP]; continue; }
      var gx = Math.floor(x / CS), gy = Math.floor(y / CS), gz = Math.floor(z / CS), d2 = 16;
      for (var ax2 = -2; ax2 <= 2; ax2++) for (var ay = -2; ay <= 2; ay++) for (var az = -2; az <= 2; az++) { var l = cases[(gx + ax2) + '_' + (gy + ay) + '_' + (gz + az)]; if (!l) continue;
        for (var q = 0; q < l.length; q += 3) { var dd = (l[q] - x) * (l[q] - x) + (l[q + 1] - y) * (l[q + 1] - y) + (l[q + 2] - z) * (l[q + 2] - z); if (dd < d2) d2 = dd; } }
      var t2 = Math.min(1, Math.sqrt(d2) / 4); omb[w] = deja[cleP] = 0.5 + 0.5 * t2 * t2 * (3 - 2 * t2);
    }
    return { pos: new Float32Array(pos), nor: new Float32Array(nor), omb: omb, n: pos.length / 3 };
  }

  /* LE DÉBORD DES COULEURS (2026-10-18) : hors du contour, la toile est transparente — et NOIRE (rgb 0). Les mipmaps mêlaient ce noir
     au bord de la pièce : vu de loin ou en biais, un bord libre prenait un liseré sombre (le bord-côte de l encolure, vu de dedans,
     un trait noir). La couleur du bord est étendue de quelques pixels dans le vide — l alpha reste 0, rien n apparaît là. Sur une
     ImageData : un canevas ne garde pas la couleur d un pixel transparent. */
  function deborder(cv, passes){
    // (par FRONTIÈRE : seuls les pixels vides qui touchent la couleur sont visités — une image entière par passe coûtait ~180 ms par pièce)
    var W = cv.width, H = cv.height, im = cv.getContext('2d').getImageData(0, 0, W, H), d = im.data, N = W * H, etat = new Uint8Array(N);
    var fr = new Int32Array(N), nf = 0, suite = new Int32Array(N), ns = 0, vu = new Uint8Array(N);
    for (var p = 0; p < N; p++) if (d[p * 4 + 3] > 0) etat[p] = 1;
    var pousser = function(q){ if (q >= 0 && q < N && !etat[q] && !vu[q]) { vu[q] = 1; suite[ns++] = q; } };
    for (var p2 = 0; p2 < N; p2++) { if (!etat[p2]) continue; var x0 = p2 % W; if (x0 > 0) pousser(p2 - 1); if (x0 < W - 1) pousser(p2 + 1); pousser(p2 - W); pousser(p2 + W); }
    for (var ps = 0; ps < passes && ns; ps++) {
      var t = fr; fr = suite; suite = t; nf = ns; ns = 0; vu.fill(0);
      for (var i2 = 0; i2 < nf; i2++) { var q = fr[i2], x = q % W, r = 0, g = 0, b = 0, n = 0, z;
        if (x > 0 && etat[z = q - 1] === 1) { r += d[z * 4]; g += d[z * 4 + 1]; b += d[z * 4 + 2]; n++; }
        if (x < W - 1 && etat[z = q + 1] === 1) { r += d[z * 4]; g += d[z * 4 + 1]; b += d[z * 4 + 2]; n++; }
        if (q >= W && etat[z = q - W] === 1) { r += d[z * 4]; g += d[z * 4 + 1]; b += d[z * 4 + 2]; n++; }
        if (q < N - W && etat[z = q + W] === 1) { r += d[z * 4]; g += d[z * 4 + 1]; b += d[z * 4 + 2]; n++; }
        if (n) { d[q * 4] = r / n; d[q * 4 + 1] = g / n; d[q * 4 + 2] = b / n; etat[q] = 2; } }
      for (var i3 = 0; i3 < nf; i3++) { var q2 = fr[i3]; if (etat[q2] !== 2) continue; etat[q2] = 1; var x2 = q2 % W;
        if (x2 > 0) pousser(q2 - 1); if (x2 < W - 1) pousser(q2 + 1); pousser(q2 - W); pousser(q2 + W); }
    }
    return im;
  }
  /* Les toiles (tissu + motif + découpes) et les objets posés. Le motif arrive en second : il se charge. */
  function toilesGL(){
    var n = GLV.toileN = (GLV.toileN || 0) + 1, gl = GLV.gl, ctxV3 = V3, ctxGLV = GLV;
    var envoyer = function(pc){
      if (!GLV) return;
      if (!pc.tex) pc.tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, pc.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, deborder(pc.toile, 6));
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (GLV.aniso) gl.texParameterf(gl.TEXTURE_2D, GLV.aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(GLV.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    };
    Object.keys(GLV.toiles).forEach(function(pid){
      var pc = GLV.toiles[pid]; peindreToile(pc, pid, null); envoyer(pc);
      var svg = svgMotifPiece(pc, pid, pc.toile.width, pc.toile.height); if (!svg) return;
      var im = new Image();
      // ⚠ l image arrive plus tard : on repeint dans le contexte qui l a demandée (la vue 3D OU l aperçu de la fiche)
      im.onload = function(){
        var sv = V3, sg = GLV; V3 = ctxV3; GLV = ctxGLV;
        try { if (n !== ctxGLV.toileN || ctxGLV.toiles[pid] !== pc) return; try { peindreToile(pc, pid, im); envoyer(pc); } catch (e) { peindreToile(pc, pid, null); envoyer(pc); } }
        finally { V3 = sv; GLV = sg; }
        if (ctxV3 && ctxV3 === MINI.v3) miniDemander(); else demander3d();
      };
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
    instancesGL();
  }
  // les images du motif : chargées une fois (P.imageLocale), puis les toiles se repeignent
  function imagesMotif3d(){
    var mo = V3 && V3.m && V3.m.motif; if (!mo || !P || !P.imageLocale) return;
    (mo.calques || []).forEach(function(c){
      if (c.type !== 'image' || !c.url || MOIMG[c.url]) return;
      MOIMG[c.url] = 'chargement';
      Promise.resolve(P.imageLocale(c.url)).then(function(d){ MOIMG[c.url] = d || ''; if (GLV && VUE === '3d') { GLV.cle = ''; demander3d(); }
        if (MINI.glv) { MINI.glv.cle = ''; miniDemander(); } });
    });
  }
  function instancesGL(){
    GLV.inst = [];
    ((V3.design && V3.design.elements) || []).forEach(function(el){
      GLV.mailles.forEach(function(ma){
        if (ma.pid !== el.piece) return;
        var s = surface3d(ma, el.x, el.y); if (!s) return;
        var n = s.n, t = unit3(sub3(s.t, [n[0] * pt3(n, s.t), n[1] * pt3(n, s.t), n[2] * pt3(n, s.t)])), b = croix3(t, n), k = el.taille / 2, e = 0.06;
        GLV.inst.push({ type: el.type, matiere: el.matiere,
          M: [b[0] * k, t[0] * k, n[0] * k, s.p[0] + n[0] * e, b[1] * k, t[1] * k, n[1] * k, s.p[1] + n[1] * e, b[2] * k, t[2] * k, n[2] * k, s.p[2] + n[2] * e, 0, 0, 0, 1],
          B: [[b[0], t[0], n[0]], [b[1], t[1], n[1]], [b[2], t[2], n[2]]] });
      });
    });
  }

  /* La caméra : la même que la peinture 2D (glisser, molette, Maj + glisser), en perspective. */
  function cameraGL(W, H){
    var cyw = Math.cos(V3.yaw), syw = Math.sin(V3.yaw), cp = Math.cos(V3.pitch), sp = Math.sin(V3.pitch), dist = 300, cy = GLV.cy;
    var R = [[cyw, 0, syw], [sp * syw, cp, -sp * cyw], [-cp * syw, sp, cp * cyw]];
    var V = [R[0][0], R[0][1], R[0][2], R[0][1] * -cy, R[1][0], R[1][1], R[1][2], R[1][1] * -cy, R[2][0], R[2][1], R[2][2], R[2][1] * -cy - dist, 0, 0, 0, 1];
    var F = Math.min(W, H) * 0.85 * V3.zoom / Math.max(GLV.minH || 120, GLV.h) * dist, nr = 20, fr = 2000;
    var Pm = [2 * F / W, 0, 0, 0, 0, 2 * F / H, 0, 0, 0, 0, -(fr + nr) / (fr - nr), -2 * fr * nr / (fr - nr), 0, 0, -1, 0];
    var M = mul4(Pm, V), tx = 2 * V3.px / W, ty = -2 * V3.py / H;
    for (var c = 0; c < 4; c++) { M[c] += tx * M[12 + c]; M[4 + c] += ty * M[12 + c]; }
    return { M: M, V: V, R: R, W: W, H: H };
  }

  function peindreGL(cv, dims){
    // ⚠ (2026-10-18) un contexte PERDU (la carte graphique l a repris) dessine sans erreur… et sans rien : on le lâche, la vue en
    // prend un neuf (voir canevasNeuf3d)
    if (GLV && GLV.cv === cv && GLV.gl && GLV.gl.isContextLost()) { GLV = null; return false; }
    if (!GLV || GLV.cv !== cv) { if (!initGL(cv)) return false; }
    var gl = GLV.gl;
    if (GLV.r !== V3.r || GLV.vie !== VIE.plis + '|' + VIE.tissu) { construireGL(V3.r); GLV.vie = VIE.plis + '|' + VIE.tissu; }
    var cle = V3.id + '|' + V3.couleur + '|' + (V3.photo ? 1 : 0) + '|' + JSON.stringify(V3.design || {}) + '|' + (V3.m.version || 0);
    if (GLV.cle !== cle) { GLV.cle = cle; toilesGL(); }
    var W = dims ? dims.W : cv.clientWidth, H = dims ? dims.H : cv.clientHeight, dpr = dims ? 1 : (window.devicePixelRatio || 1);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(0, 0, 0, 0); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var cam = GLV.cam = cameraGL(W, H), L = unit3([0.35, 0.55, 0.76]);
    // l ombre au sol, d abord, sans écrire la profondeur
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(GLV.sol.p); delier(gl); lier(gl, GLV.sol, 'aQ', GLV.solB, 2);
    gl.uniformMatrix4fv(GLV.sol.u.uM, false, col4(cam.M)); gl.uniform3f(GLV.sol.u.uO, 0, GLV.ybas - 1.5, 0); gl.uniform1f(GLV.sol.u.uRay, 30);
    if (!GLV.diag) gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    // le tissu
    var pt = GLV.tissu; gl.useProgram(pt.p); delier(gl);
    gl.uniformMatrix4fv(pt.u.uM, false, col4(cam.M)); gl.uniformMatrix4fv(pt.u.uV, false, col4(cam.V)); gl.uniformMatrix3fv(pt.u.uR, false, col3(cam.R));
    if (pt.u.uDg) gl.uniform1f(pt.u.uDg, GLV.diag ? 1 : 0);
    gl.uniform3f(pt.u.uL, L[0], L[1], L[2]); gl.uniform1f(pt.u.uC, V3.carte ? 0.6 : 0); var fo = hex(V3.couleur); gl.uniform3f(pt.u.uF, fo[0] / 255 * 0.92, fo[1] / 255 * 0.92, fo[2] / 255 * 0.92); gl.uniform1i(pt.u.uS, 0); gl.activeTexture(gl.TEXTURE0);
    GLV.mailles.forEach(function(ma){
      if (!ma.pc.tex) return;
      gl.bindTexture(gl.TEXTURE_2D, ma.pc.tex);
      // la fibre se calcule au cm de la pièce : sa taille, et sa matière
      if (pt.u.uTa) { var bbT = ma.pc.bb || { x0: 0, x1: 1, y0: 0, y1: 1 }; gl.uniform2f(pt.u.uTa, Math.max(0.1, bbT.x1 - bbT.x0), Math.max(0.1, bbT.y1 - bbT.y0)); }
      if (pt.u.uMat) gl.uniform1f(pt.u.uMat, matTissu3(ma.pid));
      lier(gl, pt, 'aP', ma.bP, 3); lier(gl, pt, 'aN', ma.bN, 3); lier(gl, pt, 'aT', ma.bT, 2); lier(gl, pt, 'aK', ma.bK, 4); lier(gl, pt, 'aO', ma.bO, 1);
      if (V3.fil) { gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ma.bL); gl.drawElements(gl.LINES, ma.nLig, gl.UNSIGNED_SHORT, 0); }
      else { gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ma.bI); gl.drawElements(gl.TRIANGLES, ma.nIdx, gl.UNSIGNED_SHORT, 0); }
    });
    // les éléments posés
    var po = GLV.obj; gl.useProgram(po.p); delier(gl); gl.uniform3f(po.u.uL, L[0], L[1], L[2]);
    // le mannequin (même programme que les bijoux : un blanc satiné, sans métal)
    // la vue FANTÔME montre l intérieur du vêtement : le mannequin s efface tant qu elle est choisie
    if (GLV.mq && V3.mannequin !== false && V3.vueNom !== 'fantome' && !GLV.diag) {
      lier(gl, po, 'aP', GLV.mq.bP, 3); lier(gl, po, 'aN', GLV.mq.bN, 3); lier(gl, po, 'aA', GLV.mq.bA, 1);
      gl.uniformMatrix4fv(po.u.uM, false, col4(cam.M)); gl.uniformMatrix4fv(po.u.uV, false, col4(cam.V)); gl.uniformMatrix3fv(po.u.uR, false, col3(cam.R));
      gl.uniform3f(po.u.uB, 1.12, 1.11, 1.09); gl.uniform1f(po.u.uMet, 0); gl.uniform1f(po.u.uBr, 28);
      /* ⚠ (2026-10-18, sa capture 72) le mannequin se dessine ~2 cm plus LOIN qu il n est (décalage de profondeur constant, le même
         pour toutes ses faces — un décalage selon la pente reclassait ses propres faces : une ellipse blanche au pied du cou) : à
         angle rasant, à moins d un millimètre sous le tissu, il le perçait en pointillés (des lignes le long des épaules, vu d en
         haut). Le tissu, lui, ne bouge pas : décalé, son envers passait devant son endroit (des fentes au banc). */
      // (4000 au départ, ~1 cm ; 8000 le 2026-10-18 : sans plis de vie, le tissu colle davantage — points de perçage 124 → 82 sur le sweat)
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(0, 8000);
      gl.drawArrays(gl.TRIANGLES, 0, GLV.mq.n);
      gl.disable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(0, 0);
    }
    // les bijoux : sans ombre (l attribut éteint vaut 1)
    if (po.a.aA != null && po.a.aA >= 0) { gl.disableVertexAttribArray(po.a.aA); gl.vertexAttrib1f(po.a.aA, 1); }
    GLV.inst.forEach(function(it){
      var ob = GLV.objets[it.type] || GLV.objets.perle, mt = MAT3[it.matiere] || MAT3.or;
      lier(gl, po, 'aP', ob.pos, 3); lier(gl, po, 'aN', ob.nor, 3);
      gl.uniformMatrix4fv(po.u.uM, false, col4(mul4(cam.M, it.M))); gl.uniformMatrix4fv(po.u.uV, false, col4(mul4(cam.V, it.M)));
      gl.uniformMatrix3fv(po.u.uR, false, col3(mul3(cam.R, it.B)));
      gl.uniform3f(po.u.uB, mt[0], mt[1], mt[2]); gl.uniform1f(po.u.uMet, mt[3]); gl.uniform1f(po.u.uBr, mt[4]);
      gl.drawArrays(gl.TRIANGLES, 0, ob.n);
    });
    GLV.dessineId = V3.id;          // ce que montre le canevas (voir ouvrir3d : rien d un autre modèle sous son en-tête)
    return true;
  }

  /* ── VISER : quel point du patron est sous la souris ? ──
     Les sommets tournés vers l oeil, à moins de 16 px, le plus proche de l oeil l emporte ; puis on
     retrouve le point exact dans les triangles voisins (coordonnées barycentriques à l écran). */
  function viser3d(ev){
    if (!GLV || !GLV.cam) return null;
    var rc = GLV.cv.getBoundingClientRect(), mx = ev.clientX - rc.left, my = ev.clientY - rc.top, cam = GLV.cam, M = cam.M, V = cam.V;
    var ecran = function(ma, k){ var x = ma.pos[k * 3], y = ma.pos[k * 3 + 1], z = ma.pos[k * 3 + 2];
      var w = M[12] * x + M[13] * y + M[14] * z + M[15]; if (w <= 0) return null;
      return { x: ((M[0] * x + M[1] * y + M[2] * z + M[3]) / w * 0.5 + 0.5) * cam.W, y: (0.5 - (M[4] * x + M[5] * y + M[6] * z + M[7]) / w * 0.5) * cam.H }; };
    var mieux = null;
    GLV.mailles.forEach(function(ma){
      var n = ma.R * (ma.J + 1);
      for (var k = 0; k < n; k++) {
        var s = ecran(ma, k); if (!s) continue;
        var d = Math.hypot(s.x - mx, s.y - my); if (d > 16) continue;
        var x = ma.pos[k * 3], y = ma.pos[k * 3 + 1], z = ma.pos[k * 3 + 2];
        var pv = [V[0] * x + V[1] * y + V[2] * z + V[3], V[4] * x + V[5] * y + V[6] * z + V[7], V[8] * x + V[9] * y + V[10] * z + V[11]];
        var nv = [pt3(cam.R[0], [ma.nor[k * 3], ma.nor[k * 3 + 1], ma.nor[k * 3 + 2]]), pt3(cam.R[1], [ma.nor[k * 3], ma.nor[k * 3 + 1], ma.nor[k * 3 + 2]]), pt3(cam.R[2], [ma.nor[k * 3], ma.nor[k * 3 + 1], ma.nor[k * 3 + 2]])];
        if (pt3(nv, pv) >= 0) continue;                           // le dos de la surface
        var sc = -pv[2] + d * 0.3;
        if (!mieux || sc < mieux.sc) mieux = { sc: sc, ma: ma, k: k };
      }
    });
    if (!mieux) return null;
    var ma = mieux.ma, J = ma.J, i0 = Math.floor(mieux.k / (J + 1)), j0 = mieux.k % (J + 1), bb = ma.pc.bb;
    var px = function(j){ return bb.x0 + (bb.x1 - bb.x0) * j / J; }, res = { piece: ma.pid, x: px(j0), y: ma.yp[i0] };
    for (var a = Math.max(0, i0 - 1); a <= Math.min(ma.R - 2, i0); a++) for (var b = Math.max(0, j0 - 1); b <= Math.min(J - 1, j0); b++) {
      var q = [[a, b], [a + 1, b], [a + 1, b + 1], [a, b + 1]];
      [[0, 1, 2], [0, 2, 3]].forEach(function(T){
        var Q3 = T.map(function(t){ return { s: ecran(ma, q[t][0] * (J + 1) + q[t][1]), x: px(q[t][1]), y: ma.yp[q[t][0]] }; });
        if (!Q3[0].s || !Q3[1].s || !Q3[2].s) return;
        var A = Q3[0].s, B = Q3[1].s, C = Q3[2].s, de = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y); if (Math.abs(de) < 1e-6) return;
        var l1 = ((B.y - C.y) * (mx - C.x) + (C.x - B.x) * (my - C.y)) / de, l2 = ((C.y - A.y) * (mx - C.x) + (A.x - C.x) * (my - C.y)) / de, l3 = 1 - l1 - l2;
        if (l1 < -0.01 || l2 < -0.01 || l3 < -0.01) return;
        res.x = l1 * Q3[0].x + l2 * Q3[1].x + l3 * Q3[2].x; res.y = l1 * Q3[0].y + l2 * Q3[1].y + l3 * Q3[2].y;
      });
    }
    // y a-t-il du tissu à cet endroit ? (la toile le dit)
    var pc = ma.pc, tx = Math.floor((res.x - bb.x0) / (bb.x1 - bb.x0) * pc.toile.width), ty = Math.floor((res.y - bb.y0) / (bb.y1 - bb.y0) * pc.toile.height);
    try { res.tissu = pc.toile.getContext('2d').getImageData(Math.max(0, Math.min(pc.toile.width - 1, tx)), Math.max(0, Math.min(pc.toile.height - 1, ty)), 1, 1).data[3] > 127; } catch (e) { res.tissu = true; }
    res.x = Math.round(res.x * 10) / 10; res.y = Math.round(res.y * 10) / 10;
    return res;
  }

  /* ── LE DESIGN : trouer, poser un bijou, effacer ── */
  function memo3d(){ V3.pile.push(copie(V3.design)); if (V3.pile.length > 50) V3.pile.shift(); }
  function poser3d(ev){
    var v = viser3d(ev);
    if (!v) { dire('${T("Cliquez sur le vêtement.")}', 'att'); return true; }
    var D3 = V3.design;
    if (V3.outil === 'gomme') {
      var pc = GLV.toiles[v.piece], meilleur = null;
      var dist = function(o){ var d = Math.hypot(o.x - v.x, o.y - v.y); if (pc && pc.axe && o.l) { var r = reflet({ x: o.x, y: o.y }, pc.axe); d = Math.min(d, Math.hypot(r.x - v.x, r.y - v.y)); } return d; };
      ['elements', 'decoupes'].forEach(function(gr){ (D3[gr] || []).forEach(function(o, i){
        if (o.piece !== v.piece) return; var d = dist(o), lim = Math.max(1.5, (o.taille || Math.max(o.l || 0, o.h || 0)) * 0.75);
        if (d <= lim && (!meilleur || d < meilleur.d)) meilleur = { d: d, gr: gr, i: i };
      }); });
      if (!meilleur) { dire('${T("Rien à effacer ici.")}', 'att'); return true; }
      memo3d(); D3[meilleur.gr].splice(meilleur.i, 1);
    } else if (V3.outil === 'decoupe') {
      if (!v.tissu) { dire('${T("Pas de tissu à cet endroit.")}', 'att'); return true; }
      if ((D3.decoupes || []).length >= 60) { dire('${T("60 découpes au plus.")}', 'err'); return true; }
      memo3d(); D3.decoupes.push({ piece: v.piece, forme: V3.dec.forme, x: v.x, y: v.y, l: V3.dec.l, h: V3.dec.forme === 'rond' ? V3.dec.l : V3.dec.h });
    } else if (V3.outil === 'element') {
      if (!v.tissu) { dire('${T("Pas de tissu à cet endroit.")}', 'att'); return true; }
      if ((D3.elements || []).length >= 300) { dire('${T("300 éléments au plus.")}', 'err'); return true; }
      memo3d(); D3.elements.push({ piece: v.piece, type: V3.el.type, matiere: V3.el.matiere, x: v.x, y: v.y, taille: V3.el.taille });
    } else return false;
    V3.dsale = true; dire(''); peindreDesign3d(); entete3d(); demander3d();
    return true;
  }
  function annuler3d(){ if (!V3 || !V3.pile.length) return; V3.design = V3.pile.pop(); V3.dsale = true; peindreDesign3d(); entete3d(); demander3d(); }
  function enregistrer3d(){
    if (OCCUPE || !V3 || !V3.dsale) return;
    OCCUPE = true; dire('${T("Enregistrement…")}');
    appeler('atelier:ecrire', [{ id: V3.id, nom: V3.m.nom, design3d: V3.design }]).then(function(r){
      OCCUPE = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      V3.dsale = false; V3.pile = [];
      relireDonnees().then(function(d){
        if (d && d.ok) { D = d; var m = (D.modeles || []).filter(function(x){ return x.id === V3.id; })[0]; if (m && V3) { V3.m = m; V3.design = copie(m.design3d || V3.design); } }
        if (VUE === '3d' && V3) { entete3d(); peindreDesign3d(); dire('${T("Design 3D enregistré.")}', 'bon'); programmerVignette(); }
      });
    });
  }
  /* L en-tête ne garde que le retour (comme le studio) ; les gestes du modèle sont au bout de la barre d options
     (Annuler, Photo, Rendu réaliste, Enregistrer) et TOUS dans le menu Fichier — six boutons alignés en haut
     se lisaient mal et changeaient de place selon l état. */
  function entete3d(){
    var a = document.getElementById('actions'); if (!a || !V3) return;
    var m = V3.m;
    document.getElementById('sous').textContent = m.nom + (m.ref ? ' · ' + m.ref : '') + ' · v' + (m.version || 1) + ' · ' + '${T("taille {0}")}'.split('{0}').join(V3.taille) + (V3.dsale ? ' · ${T("modifications non enregistrées")}' : '');
    a.innerHTML = '<button type="button" id="v3-retour">' + (V3.retour === 'editeur' ? '${T("← Éditeur")}' : '${T("← Bibliothèque")}') + '</button>';
    var g = document.getElementById('v3-gestes'), pq = plaque3d();
    if (g) g.innerHTML = '<button type="button" id="v3-annuler" aria-label="${T("Annuler la modification")}" title="${T("Annuler la modification")} (Ctrl+Z)"' + (pq && V3.pile.length ? '' : ' disabled') + '>↶</button>'
      + '<button type="button" id="v3-photo" title="${T("Enregistrer l’image de la scène")}">${T("Photo du rendu")}</button>'
      + '<button type="button" id="v3-ia"' + (pq ? '' : ' disabled') + '>${T("Rendu photo (The New Black)")}</button>'
      + (D.peutModifier ? '<button type="button" class="prim" id="v3-enreg" title="Ctrl+S"' + (pq && V3.dsale ? '' : ' disabled') + '>${T("Enregistrer")}</button>' : '');
    // les outils de design s ouvrent quand l aperçu plaqué est prêt (il arrive après le premier dessin)
    corps.querySelectorAll('.v3 [data-v3out]').forEach(function(b){ b.disabled = b.getAttribute('data-v3out') !== 'tourner' && !pq; });
    majEtat3d();
  }
  function majEtat3d(){
    var e = document.getElementById('v3-etat'); if (!e || !V3) return;
    var D3 = V3.design || {}, v = VUES3.filter(function(x){ return x[0] === V3.vueNom; })[0];
    e.innerHTML = '<span>${T("Taille")} <b>' + esc(V3.taille) + '</b></span>'
      + '<span>${T("Mannequin")} <b>' + (V3.genre === 'homme' ? '${T("Homme")}' : '${T("Femme")}') + ' · ' + Math.round((V3.r && V3.r.stature) || V3.stature) + ' cm</b></span>'
      + '<span>${T("Vue")} <b>' + (v ? v[1] : '${T("Libre")}') + '</b></span>'
      + '<span>${T("Zoom")} <b>' + Math.round(V3.zoom * 100) + ' %</b></span>'
      + '<span>' + '${T("{0} découpe(s) · {1} élément(s)")}'.split('{0}').join((D3.decoupes || []).length).split('{1}').join((D3.elements || []).length) + '</span>'
      + '<span class="ecart"></span>' + (V3.dsale ? '<span class="att">${T("modifications non enregistrées")}</span>' : '<span class="ok">${T("Enregistré")}</span>');
    var zv = document.getElementById('v3-zoomv'); if (zv) zv.textContent = Math.round(V3.zoom * 100) + ' %';
  }
  function zoom3d(z){ if (!V3) return; V3.zoom = Math.max(0.4, Math.min(5, z)); majEtat3d(); demander3d(); }
  function recentrer3d(){ if (!V3) return; V3.zoom = 1; V3.px = 0; V3.py = 0; majEtat3d(); demander3d(); }
  function vue3d(k){
    var v = VUES3.filter(function(x){ return x[0] === k; })[0]; if (!v || !V3) return;
    V3.yaw = v[2]; V3.pitch = v[4] != null ? v[4] : 0.05; V3.vueNom = v[0];
    corps.querySelectorAll('[data-v3v]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-v3v') === k); });
    majEtat3d(); demander3d();
  }
  function genreChoisi3d(g){
    if (!V3 || V3.genre === g) return;
    V3.genre = g; V3.stature = STATURE3[g]; garderGenre3d(V3.id, g); MINI.cle = '';
    V3.r = null; dessiner(); charger3d();
  }
  function outil3d(k){
    if (!V3) return;
    V3.outil = k;
    if (k !== 'tourner') { V3P.pans.design = 1; V3P.ong.a = 'design'; V3P.repli.a = 0; garderEspace3d(); }
    dessiner();
  }
  function bascule3d(k){
    if (!V3) return;
    V3[k] = k === 'mannequin' ? V3.mannequin === false : !V3[k];      // le mannequin est montré tant qu il n est pas « false »
    if (k === 'mannequin') { try { localStorage.setItem('sz-atelier-mannequin', V3.mannequin ? '1' : '0'); } catch (e) {} }
    if (k === 'photo' && GLV) GLV.cle = '';
    dessiner();
  }
  var LDEC3 = { rond: '${T("Rond")}', ovale: '${T("Ovale")}', goutte: '${T("Goutte")}', rect: '${T("Rectangle")}' };
  var LEL3 = { perle: '${T("Perle")}', bouton: '${T("Bouton")}', strass: '${T("Strass")}', anneau: '${T("Anneau")}', oeillet: '${T("Œillet")}', clou: '${T("Clou")}' };
  var LMAT3 = { or: '${T("Or")}', argent: '${T("Argent")}', nacre: '${T("Nacre")}', noir: '${T("Noir")}', cristal: '${T("Cristal")}' };
  function peindreDesign3d(){
    var z = document.getElementById('v3-design'); if (!z || !V3) return;
    if (!V3.r) { z.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div>'; return; }
    if (!plaque3d()) { z.innerHTML = '<div class="ed-note">${T("Le design en 3D (découpes, bijoux) demande l’aperçu plaqué : il n’est pas encore offert pour un pantalon, ni sans accélération graphique.")}</div>'; return; }
    var seg = function(attr, k, lib, on){ return '<button type="button" class="' + (on ? 'on' : '') + '" ' + attr + '="' + k + '">' + lib + '</button>'; };
    var nb = function(v){ return esc(String(v).replace('.', '${SEP_DEC()}')); };
    var h = '<div class="v3-sec">${T("Outil")}</div><div class="ed-seg" role="group" aria-label="${T("Outil")}">'
      + seg('data-v3out', 'tourner', '${T("Tourner")}', V3.outil === 'tourner') + seg('data-v3out', 'decoupe', '${T("Trouer")}', V3.outil === 'decoupe')
      + seg('data-v3out', 'element', '${T("Bijou")}', V3.outil === 'element') + seg('data-v3out', 'gomme', '${T("Gomme")}', V3.outil === 'gomme') + '</div>';
    if (V3.outil === 'decoupe') h += '<div class="v3-sec">${T("Forme")}</div><div class="ed-seg" role="group" aria-label="${T("Forme")}">' + Object.keys(LDEC3).map(function(k){ return seg('data-v3df', k, LDEC3[k], V3.dec.forme === k); }).join('') + '</div>'
      + '<div class="at-champs" style="margin-top:.5rem"><label>${T("Largeur (cm)")}<input type="text" id="v3-dl" inputmode="decimal" maxlength="4" value="' + nb(V3.dec.l) + '"></label>'
      + (V3.dec.forme === 'rond' ? '' : '<label>${T("Hauteur (cm)")}<input type="text" id="v3-dh" inputmode="decimal" maxlength="4" value="' + nb(V3.dec.h) + '"></label>') + '</div>'
      + '<div class="ed-note">${T("Cliquez sur le vêtement pour le trouer. La découpe est tracée dans le patron imprimé ; sur le devant et le dos (des demi-pièces), elle se répète en miroir.")}</div>';
    if (V3.outil === 'element') h += '<div class="v3-sec">${T("Élément")}</div><div class="ed-seg" role="group" aria-label="${T("Élément")}">' + Object.keys(LEL3).map(function(k){ return seg('data-v3et', k, LEL3[k], V3.el.type === k); }).join('') + '</div>'
      + '<div class="v3-sec">${T("Matière")}</div><div class="ed-seg" role="group" aria-label="${T("Matière")}">' + Object.keys(LMAT3).map(function(k){ return seg('data-v3em', k, LMAT3[k], V3.el.matiere === k); }).join('') + '</div>'
      + '<div class="at-champs" style="margin-top:.5rem"><label>${T("Diamètre (cm)")}<input type="text" id="v3-et" inputmode="decimal" maxlength="4" value="' + nb(V3.el.taille) + '"></label></div>'
      + '<div class="ed-note">${T("Cliquez sur le vêtement pour poser l’élément. Une manche reçoit l’élément sur les deux manches : elles sont coupées dans la même pièce.")}</div>';
    if (V3.outil === 'gomme') h += '<div class="ed-note">${T("Cliquez sur une découpe ou un élément pour l’effacer.")}</div>';
    var D3 = V3.design || {};
    h += '<div class="cx-sub" style="margin-top:.5rem">' + '${T("{0} découpe(s) · {1} élément(s)")}'.split('{0}').join((D3.decoupes || []).length).split('{1}').join((D3.elements || []).length) + '</div>';
    z.innerHTML = h;
  }
  function changeDesign3d(t){
    var v = parseFloat(String(t.value).replace(',', '.'));
    var borne = function(x, a, b, d){ return isFinite(x) ? Math.max(a, Math.min(b, Math.round(x * 10) / 10)) : d; };
    if (t.id === 'v3-dl') { V3.dec.l = borne(v, 0.3, 60, V3.dec.l); t.value = String(V3.dec.l).replace('.', '${SEP_DEC()}'); return true; }
    if (t.id === 'v3-dh') { V3.dec.h = borne(v, 0.3, 60, V3.dec.h); t.value = String(V3.dec.h).replace('.', '${SEP_DEC()}'); return true; }
    if (t.id === 'v3-et') { V3.el.taille = borne(v, 0.2, 5, V3.el.taille); t.value = String(V3.el.taille).replace('.', '${SEP_DEC()}'); return true; }
    return false;
  }

  /* ── La peinture 2D (sans WebGL, ou pour un pantalon) : rotation, perspective, ombrage, tri des faces ── */
  function peindre3d(){
    var cv = document.getElementById('v3-canevas'); if (!cv || !V3 || !V3.mesh) return;
    if (plaque3d()) { if (peindreGL(cv)) return;
      // le contexte vient d être perdu (peindreGL l a lâché) : un canevas neuf, qui prendra un contexte neuf
      if (!GLV && !V3.glNon) { canevasNeuf3d(); return; } }
    var W = cv.clientWidth, H = cv.clientHeight, dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    // ⚠ un canevas qui porte déjà un contexte WebGL refuse le 2D : il garderait l image d avant — un canevas neuf
    var g = cv.getContext('2d'); if (!g) { canevasNeuf3d(); return; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
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

  /* ── La vue et ses panneaux ──
     REFONTE (2026-10-18, sa demande : « c est pas beau et les options disparaissent ou ne sont pas visibles ») : le
     même langage que le studio de création — menus (Fichier, Édition, Affichage, Mannequin, Tissu, Fenêtre), barre
     d options (taille, vue, mannequin ; les gestes au bout), palette d outils à gauche, la scène au centre avec ses
     commandes de caméra, des panneaux à onglets repliables qui DÉFILENT, la barre d état. Toute option a sa place
     fixe : rien ne dépend plus d un état passager (la case « Mannequin » n apparaissait qu une fois le corps chargé). */
  var MENUS3 = [['fichier', '${T("Fichier")}'], ['edition', '${T("Édition")}'], ['affichage', '${T("Affichage")}'], ['mannequin', '${T("Mannequin")}'],
    ['tissu', '${T("Tissu")}'], ['fenetre', '${T("Fenêtre")}']];
  var STP3 = { tissu: '${T("Tissu")}', design: '${T("Design")}', ajust: '${T("Ajustement")}', mannequin: '${T("Mannequin")}' };
  var STG3 = [['a', ['tissu', 'design']], ['b', ['ajust', 'mannequin']]];
  var OUTILS3 = [['tourner', '${T("Tourner")}', '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><polyline points="20 4 20 9 15 9"/>'],
    ['decoupe', '${T("Trouer")}', '<circle cx="12" cy="12" r="7.5" stroke-dasharray="3 2.4"/><circle cx="12" cy="12" r="2.4"/>'],
    ['element', '${T("Bijou")}', '<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M10 4l2 16M14 4l-2 16"/>'],
    ['gomme', '${T("Gomme")}', '<path d="M4 15.5l9.5-9.5 6.5 6.5-7.5 7.5H8z"/><path d="M9.5 10l6.5 6.5M12 20h8"/>']];
  var V3P = (function(){
    var d = { pans: { tissu: 1, design: 1, ajust: 1, mannequin: 1 }, ong: { a: 'tissu', b: 'ajust' }, repli: {} };
    try { var o = JSON.parse(localStorage.getItem('sz-atelier-3d-espace') || 'null'); if (o && o.pans && o.ong) return { pans: o.pans, ong: o.ong, repli: o.repli || {} }; } catch (e) {}
    return d;
  })();
  function garderEspace3d(){ try { localStorage.setItem('sz-atelier-3d-espace', JSON.stringify(V3P)); } catch (e) {} }
  function seg3(attr, k, lib, on, off){ return '<button type="button" class="' + (on ? 'on' : '') + '" ' + attr + '="' + k + '" aria-pressed="' + !!on + '"' + (off ? ' disabled' : '') + '>' + lib + '</button>'; }
  function case3(k, lib, on){ return '<label><input type="checkbox" data-v3o="' + k + '"' + (on ? ' checked' : '') + '>' + lib + '</label>'; }
  function v3Panneau(k){
    var m = V3.m;
    if (k === 'tissu') return '<div class="v3-sec">${T("Couleur du tissu")}</div><div class="v3-couleurs">'
      + COUL3.map(function(c){ return '<button type="button" class="' + (V3.couleur === c[0] ? 'on' : '') + '" data-v3c="' + c[0] + '" title="' + c[1] + '" aria-label="' + c[1] + '" aria-pressed="' + (V3.couleur === c[0]) + '" style="background:' + c[0] + '"></button>'; }).join('') + '</div>'
      + '<div class="v3-sec">${T("Vie du tissu")}</div><div class="ed-seg" role="group" aria-label="${T("Plis")}">' + PLIS.map(function(x){ return seg3('data-v3plis', x[0], x[1], VIE.plis === x[0]); }).join('') + '</div>'
      + '<div class="v3-sec">${T("Tenue")}</div><div class="ed-seg" role="group" aria-label="${T("Tenue")}">' + TISSUS3.map(function(x){ return seg3('data-v3tissu', x[0], x[1], VIE.tissu === x[0]); }).join('') + '</div>'
      + '<div class="v3-sec">${T("Fond")}</div><div class="ed-seg" role="group" aria-label="${T("Fond")}">' + seg3('data-v3f', 'beige', '${T("Beige")}', V3.fond === 'beige') + seg3('data-v3f', 'blanc', '${T("Blanc")}', V3.fond === 'blanc') + '</div>';
    if (k === 'design') return '<div id="v3-design"></div>';
    if (k === 'ajust') return '<div class="im-cases">' + case3('carte', '${T("Carte d’ajustement")}', V3.carte) + '</div><div id="v3-pan"></div>';
    var mc = (V3.r && V3.r.mesuresCorps) || null, cm = function(v){ return String(Math.round(v * 10) / 10).replace('.', '${SEP_DEC()}') + ' cm'; };
    return '<div class="v3-sec">${T("Corps")}</div><div class="ed-seg" role="group" aria-label="${T("Mannequin")}">' + seg3('data-v3g', 'femme', '${T("Femme")}', V3.genre !== 'homme') + seg3('data-v3g', 'homme', '${T("Homme")}', V3.genre === 'homme') + '</div>'
      + '<div class="im-cases">' + case3('mannequin', '${T("Afficher le mannequin")}', V3.mannequin !== false) + '</div>'
      + '<div class="v3-sec">${T("Mesures du corps")}</div>'
      + (mc ? '<div class="v3-mes"><span>${T("Stature")}</span><b>' + cm((V3.r && V3.r.stature) || V3.stature) + '</b>'
        + [['poitrine', '${T("Tour de poitrine")}'], ['taille', '${T("Tour de taille")}'], ['hanches', '${T("Tour de hanches")}'], ['carrure', '${T("Carrure dos")}'], ['cou', '${T("Tour de cou")}'], ['tourBras', '${T("Tour de bras")}']]
          .map(function(x){ return mc[x[0]] != null ? '<span>' + x[1] + '</span><b>' + cm(mc[x[0]]) + '</b>' : ''; }).join('') + '</div>'
        : '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div>')
      + '<div class="ed-note">' + (V3.genre === 'homme' ? '${T("Mannequin homme : le corps suit le tableau standard homme (taille {0}) ; le vêtement garde son patron.")}' : '${T("Mannequin femme : le corps suit le tableau de mesures du modèle (taille {0}).")}').split('{0}').join(esc(V3.taille)) + '</div>'
      + '<div class="v3-sec">${T("Affichage")}</div><div class="im-cases">' + case3('fil', '${T("Fil de fer")}', V3.fil) + case3('auto', '${T("Rotation automatique")}', V3.auto)
      + (m.photo3d ? case3('photo', '${T("Photo plaquée")}', V3.photo) : '') + '</div>';
  }
  function v3Panneaux(){
    var h = STG3.map(function(g){
      var vis = g[1].filter(function(k){ return V3P.pans[k]; }); if (!vis.length) return '';
      var act = vis.indexOf(V3P.ong[g[0]]) >= 0 ? V3P.ong[g[0]] : vis[0], rep = !!V3P.repli[g[0]];
      var lr = rep ? '${T("Déplier le panneau")}' : '${T("Replier le panneau")}';
      return '<section class="st-pan' + (rep ? ' replie' : '') + '" aria-label="' + esc(vis.map(function(k){ return STP3[k]; }).join(' · ')) + '">'
        + '<div class="st-pan-tete"><div class="st-onglets" role="tablist">' + vis.map(function(k){
            return '<button type="button" role="tab" aria-selected="' + (k === act) + '" class="' + (k === act ? 'on' : '') + '" data-st-onglet="' + g[0] + ':' + k + '">' + STP3[k] + '</button>';
          }).join('')
        + '</div><button type="button" class="st-repli" data-st-repli="' + g[0] + '" aria-expanded="' + (rep ? 'false' : 'true') + '" title="' + lr + '" aria-label="' + lr + '">' + CHEV + '</button></div>'
        + (rep ? '' : '<div class="st-pan-corps" role="tabpanel">' + v3Panneau(act) + '</div>') + '</section>';
    }).join('');
    return h || '<p class="st-note" style="padding:1rem">${T("Tous les panneaux sont masqués : menu Fenêtre.")}</p>';
  }
  function v3Entrees(k){
    var l = [], pq = plaque3d(), m = V3.m;
    var sec = function(t){ l.push({ sec: t }); }, tr = function(){ l.push({ trait: true }); };
    if (k === 'fichier') {
      l.push({ lib: '${T("Enregistrer")}', rac: 'Ctrl+S', off: !D.peutModifier || !pq || !V3.dsale, fn: enregistrer3d });
      tr();
      l.push({ lib: '${T("Photo du rendu")}', fn: photo3d });
      l.push({ lib: '${T("Rendu photo (The New Black)")}', off: !pq, fn: ouvrirRenduIa });
      l.push({ lib: '${T("Vers la fiche produit")}', off: !(pq && D.peutModifier && (D.produits || []).length), fn: ouvrirEnvoiFiche });
      tr();
      l.push({ lib: V3.retour === 'editeur' ? '${T("Retour à l’éditeur")}' : '${T("Retour à la bibliothèque")}', rac: '${T("Échap")}', fn: quitter3d });
    } else if (k === 'edition') {
      l.push({ lib: '${T("Annuler la modification")}', rac: 'Ctrl+Z', off: !V3.pile.length, fn: annuler3d });
      sec('${T("Outil")}');
      OUTILS3.forEach(function(o){ l.push({ lib: o[1], coche: V3.outil === o[0], off: o[0] !== 'tourner' && !pq, fn: function(){ outil3d(o[0]); } }); });
    } else if (k === 'affichage') {
      sec('${T("Taille affichée")}');
      (m.tailles || []).forEach(function(t){ l.push({ lib: t, coche: V3.taille === t, fn: function(){ taille3d(t); } }); });
      sec('${T("Vue")}');
      VUES3.forEach(function(v){ l.push({ lib: v[1], coche: V3.vueNom === v[0], fn: function(){ vue3d(v[0]); } }); });
      tr();
      l.push({ lib: '${T("Carte d’ajustement")}', coche: !!V3.carte, fn: function(){ bascule3d('carte'); } });
      l.push({ lib: '${T("Fil de fer")}', coche: !!V3.fil, fn: function(){ bascule3d('fil'); } });
      l.push({ lib: '${T("Rotation automatique")}', coche: !!V3.auto, fn: function(){ bascule3d('auto'); } });
      if (m.photo3d) l.push({ lib: '${T("Photo plaquée")}', coche: !!V3.photo, fn: function(){ bascule3d('photo'); } });
      tr();
      l.push({ lib: '${T("Zoom avant")}', rac: 'Ctrl++', fn: function(){ zoom3d(V3.zoom * 1.2); } });
      l.push({ lib: '${T("Zoom arrière")}', rac: 'Ctrl+-', fn: function(){ zoom3d(V3.zoom / 1.2); } });
      l.push({ lib: '${T("Recentrer")}', rac: 'Ctrl+0', fn: recentrer3d });
    } else if (k === 'mannequin') {
      l.push({ lib: '${T("Femme")}', coche: V3.genre !== 'homme', fn: function(){ genreChoisi3d('femme'); } });
      l.push({ lib: '${T("Homme")}', coche: V3.genre === 'homme', fn: function(){ genreChoisi3d('homme'); } });
      tr();
      l.push({ lib: '${T("Afficher le mannequin")}', coche: V3.mannequin !== false, fn: function(){ bascule3d('mannequin'); } });
      l.push({ lib: '${T("Mesures du corps")}', fn: function(){ montrer3d('b', 'mannequin'); } });
    } else if (k === 'tissu') {
      sec('${T("Vie du tissu")}');
      PLIS.forEach(function(x){ l.push({ lib: x[1], coche: VIE.plis === x[0], fn: function(){ vie3d('plis', x[0]); } }); });
      sec('${T("Tenue")}');
      TISSUS3.forEach(function(x){ l.push({ lib: x[1], coche: VIE.tissu === x[0], fn: function(){ vie3d('tissu', x[0]); } }); });
      sec('${T("Couleur du tissu")}');
      COUL3.forEach(function(c){ l.push({ lib: c[1], coche: V3.couleur === c[0], fn: function(){ V3.couleur = c[0]; V3.couleurChoisie = true; C3.ctl = null; C3.verifPour = ''; dessiner(); } }); });
      sec('${T("Fond")}');
      [['beige', '${T("Beige")}'], ['blanc', '${T("Blanc")}']].forEach(function(f){ l.push({ lib: f[1], coche: V3.fond === f[0], fn: function(){ V3.fond = f[0]; dessiner(); } }); });
    } else if (k === 'fenetre') {
      ['tissu', 'design', 'ajust', 'mannequin'].forEach(function(p){
        l.push({ lib: STP3[p], coche: !!V3P.pans[p], fn: function(){ V3P.pans[p] = V3P.pans[p] ? 0 : 1; garderEspace3d(); dessiner(); } });
      });
      tr();
      l.push({ lib: '${T("Réinitialiser l’espace de travail")}', fn: function(){
        V3P = { pans: { tissu: 1, design: 1, ajust: 1, mannequin: 1 }, ong: { a: 'tissu', b: 'ajust' }, repli: {} }; garderEspace3d(); recentrer3d(); dessiner(); } });
    }
    return l;
  }
  function montrer3d(g, k){ V3P.pans[k] = 1; V3P.ong[g] = k; V3P.repli[g] = 0; garderEspace3d(); dessiner(); }
  function taille3d(t){ if (!V3 || V3.taille === t) return; V3.taille = t; V3.r = null; dessiner(); charger3d(); }
  function vie3d(k, v){ VIE[k] = v; try { localStorage.setItem('sz-atelier-vie', JSON.stringify(VIE)); } catch (e) {} dessiner(); demander3d(); }
  function dessiner3d(){
    var m = V3.m, pq = plaque3d(), ico = function(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
    document.getElementById('titre').textContent = '${T("Aperçu 3D")}';
    var menus = '<div class="st-menus" role="menubar" aria-label="${T("Menus de l’aperçu 3D")}">'
      + MENUS3.map(function(x){ return '<button type="button" role="menuitem" aria-haspopup="menu" aria-expanded="false" data-st-menu="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    var opt = '<div class="st-options" role="toolbar" aria-label="${T("Options de l’aperçu 3D")}">'
      + '<div class="grp"><span class="lib">${T("Taille")}</span><span class="ed-seg" role="group" aria-label="${T("Taille affichée")}">'
      + (m.tailles || []).map(function(t){ return seg3('data-v3t', t, esc(t), V3.taille === t); }).join('') + '</span></div>'
      + '<div class="grp"><span class="lib">${T("Vue")}</span><span class="ed-seg" role="group" aria-label="${T("Vue")}">'
      + VUES3.map(function(v){ return seg3('data-v3v', v[0], v[1], V3.vueNom === v[0]).replace('<button ', '<button title="' + (v[3] || v[1]) + '" '); }).join('') + '</span></div>'
      + '<div class="grp"><span class="lib">${T("Mannequin")}</span><span class="ed-seg" role="group" aria-label="${T("Mannequin")}">'
      + seg3('data-v3g', 'femme', '${T("Femme")}', V3.genre !== 'homme') + seg3('data-v3g', 'homme', '${T("Homme")}', V3.genre === 'homme') + '</span></div>'
      + '<span class="ecart"></span><span class="v3-gestes" id="v3-gestes"></span></div>';
    var pal = '<nav class="st-palette" aria-label="${T("Outils de design")}">' + OUTILS3.map(function(o){
        var off = o[0] !== 'tourner' && !pq;
        return '<button type="button" class="st-outil' + (V3.outil === o[0] ? ' on' : '') + '" data-v3out="' + o[0] + '" aria-pressed="' + (V3.outil === o[0]) + '" title="' + o[1] + '"' + (off ? ' disabled' : '') + '>' + ico(o[2]) + '<span>' + o[1] + '</span></button>';
      }).join('') + '</nav>';
    var sc = '<div class="v3-plan"><div class="v3-scene ' + V3.fond + (V3.outil !== 'tourner' ? ' vise' : '') + '" id="v3-scene" role="region" aria-label="${T("Scène 3D")}"><canvas id="v3-canevas" role="img" aria-label="${T("Le vêtement en 3D")}"></canvas>'
      + '<div class="v3-tnb" id="v3-tnb" role="region" aria-label="${T("Rendu 3D de The New Black")}"></div>'
      + '<div class="v3-cam" role="group" aria-label="${T("Caméra")}">'
      + '<button type="button" data-v3zoom="-" title="${T("Zoom arrière")} (Ctrl+-)" aria-label="${T("Zoom arrière")}">−</button><span class="val" id="v3-zoomv">' + Math.round(V3.zoom * 100) + ' %</span>'
      + '<button type="button" data-v3zoom="+" title="${T("Zoom avant")} (Ctrl++)" aria-label="${T("Zoom avant")}">+</button>'
      + '<button type="button" data-v3zoom="0" title="${T("Recentrer (Ctrl+0)")}">${T("Ajuster")}</button>'
      + '<button type="button" data-v3cam="auto" aria-pressed="' + !!V3.auto + '" title="${T("Rotation automatique")}" aria-label="${T("Rotation automatique")}">⟳</button></div>'
      + '<span class="v3-aide">${T("Glisser pour tourner · molette pour zoomer · Maj + glisser pour déplacer · double-clic pour recentrer")}</span></div></div>';
    corps.innerHTML = '<div class="st v3">' + menus + opt
      + '<div class="st-corps">' + pal + sc + '<aside class="st-panneaux" aria-label="${T("Panneaux")}">' + v3Panneaux() + '</aside></div>'
      + '<div class="st-etat" id="v3-etat" role="status"></div></div>';
    MENU = '';
    entete3d();
    // le canevas WebGL est GARDÉ d une vue à l autre : son contexte et ses toiles restent
    var nv = document.getElementById('v3-canevas');
    if (GLV && GLV.cv && nv && GLV.cv !== nv && V3.m.base !== 'pantalon') nv.parentNode.replaceChild(GLV.cv, nv);
    peindrePanneau3d(); peindreDesign3d(); peindreTnb3d();
    var z = document.getElementById('v3-scene');
    if (window.ResizeObserver && z) { if (window._v3RO) window._v3RO.disconnect(); window._v3RO = new ResizeObserver(function(){ demander3d(); }); window._v3RO.observe(z); }
    demander3d();
  }
  /* ══ LE RENDU PHOTO, VUE PRINCIPALE DE L APERÇU (2026-10-19, sa décision — « comme CLO AI Studio ») ════════════════
     Le moteur du poste ne sert plus qu EN COULISSE : il fabrique l image de chaque angle (fond blanc, sans le mannequin
     blanc), qui part chez The New Black et revient en PHOTO — portée par un mannequin (femme ou homme, celui de la vue),
     sans mannequin, ou à plat, sur un fond de studio gris clair uni. La scène montre ces photos en grand, avec des
     vignettes d angles ; sans rendu : « Aucun rendu » et « Générer le rendu photo » — ⚠ JAMAIS de génération
     automatique, et une confirmation qui dit tout du coût. Les corrections se font sur le modèle (les outils de la
     vue, le patron, le motif), puis « Régénérer ». La vue 3D du poste reste un outil : « Vue technique 3D ».
     (L essai « Image to 3D » depuis l Atelier est ABANDONNÉ — sa décision du même jour.) */
  var RP = { angles: { face: true, dos: false, tq: false }, style: 'porte', palier: 'standard', bareme: null, solde: null,
    gens: {}, pct: {}, vue: 'face', panneau: false, t: null, images: {} };
  var RP_ANGLES = [['face', '${T("Face")}'], ['dos', '${T("Dos")}'], ['tq', '${T("3/4")}']];
  var RP_STYLES = [['porte', '${T("Porté par un mannequin")}'], ['fantome', '${T("Sans mannequin")}'], ['plat', '${T("À plat")}']];
  var RP_PALIERS = [['standard', '${T("Standard")}'], ['pro', '${T("Pro (2K)")}'], ['ultra', '${T("Ultra (4K)")}']];
  function rpPrix(){ var b = RP.bareme && RP.bareme[RP.style] && RP.bareme[RP.style][RP.palier]; return b ? Number(b.prix) : null; }
  function rpChoisis(){ return RP_ANGLES.filter(function(a){ return RP.angles[a[0]]; }).map(function(a){ return a[0]; }); }
  function rpUsd(x){ return x == null ? '…' : '${T("{0} $ US")}'.split('{0}').join(szArgentNombre(x, 3)); }
  function rpEnCours(){ return Object.keys(RP.gens).length > 0; }
  /* ══ L APERÇU 3D CONSTRUIT PAR THE NEW BLACK — LA VUE PRINCIPALE (2026-10-19, sa demande : « la vue 3D des plans de
     l Atelier devra produire une demande chez The New Black pour CONSTRUIRE l aperçu 3D, et ensuite on travaille avec le
     rendu généré ; pour la construction initiale, demande et confirmation ; et des VALIDATIONS côté Atelier avant de
     générer — des barrières pour éviter des générations coûteuses à chaque fois ») ══
     · le GLB construit (sans mannequin puis Image to 3D, traité au poste : non éclairé, orienté de face) s affiche dans
       la scène, en rotation libre — le même afficheur que la boutique (model-viewer, exposition 1) ;
     · « PRÊT À CONSTRUIRE ? » : cinq contrôles, chacun vert ou rouge avec sa raison et un lien pour le corriger ; le
       bouton reste grisé tant qu un seul est rouge ;
     · une construction est liée à la VERSION : déjà construite → seulement « Reconstruire… » (confirmation renforcée,
       ce qu elle a déjà coûté) ; « Régénérer… » n est proposé que si le modèle a changé (les champs qui comptent) ;
       au plus trois constructions par modèle en 24 heures ; le total déjà dépensé est toujours rappelé.
     Le rendu photo (porté, sans mannequin, à plat) reste là, en action SECONDAIRE ; la vue du poste, en « Vue technique 3D ». */
  var C3 = { prix: null, solde: null, chargement: false, ctl: null, verif: 0, source: '', panneau: false, gen: '', pct: 0, t: null };
  var C3_CHAMPS = { base: '${T("la base")}', options: '${T("les options")}', pieces: '${T("le patron")}', motif: '${T("le motif")}', design3d: '${T("les découpes et éléments")}' };
  function c3Usd(x){ return x == null ? '…' : '${T("{0} $ US")}'.split('{0}').join(szArgentNombre(x, 2)); }
  function c3Construit(){ return V3 && V3.m.tnb3d && /^https:/.test(String(V3.m.tnb3d.url || '')) ? V3.m.tnb3d : null; }
  function c3Etat(){ return (V3 && V3.m.construction3d) || { total: 0, constructions: 0, recentes: 0, plafond: 3, plafondAtteint: false, changements: null }; }
  // ce qui a changé depuis la construction : la version, les champs qui comptent, la couleur choisie
  function c3Changements(){
    var t = c3Construit(); if (!t) return null;
    var l = (c3Etat().changements || []).map(function(k){ return C3_CHAMPS[k] || k; });
    if (Number(t.version) !== Number(V3.m.version || 1) && !l.length) l.push('${T("la version")}');
    if (t.couleur && V3.couleur && t.couleur !== V3.couleur) l.push('${T("la couleur du tissu")}');
    return l;
  }
  function chargerPrixC3(){
    if (C3.chargement) return; C3.chargement = true;
    appeler('atelier:modele3dPrix', []).then(function(r){
      C3.chargement = false;
      if (r && r.ok && r.prix != null) { C3.prix = r; C3.solde = r.solde; peindreTnb3d(); }
      else dire(r && (r.detail || r.error) ? '${T("The New Black : {0}")}'.split('{0}').join(r.detail || r.error) : expliquer(r), 'err');
    });
  }
  function c3ModelViewer(){
    if (window.customElements && customElements.get('model-viewer')) return;
    if (document.getElementById('c3-mv-js')) return;
    var sc = document.createElement('script'); sc.type = 'module'; sc.id = 'c3-mv-js';
    sc.src = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
    document.head.appendChild(sc);
  }
  // la vue de face qui PART (fond blanc, sans le mannequin, le vêtement entier avec une marge) — et son contrôle
  function c3Capturer(){
    var img = rendreVues3d(['face'], true, [900, 1200], '#FFFFFF', 0.78)[0];
    if (!img) return Promise.resolve({ ok: false, attente: true, raison: '${T("Le vêtement n’est pas encore calculé : attendez la fin du calcul de la vue.")}' });
    return new Promise(function(ok){
      var im = new Image();
      im.onload = function(){
        var W = 180, H = 240, c = document.createElement('canvas'); c.width = W; c.height = H;
        var g = c.getContext('2d'); g.drawImage(im, 0, 0, W, H);
        var d = g.getImageData(0, 0, W, H).data, bord = 0, plein = 0;
        var fond = function(k){ return d[k] > 238 && d[k + 1] > 238 && d[k + 2] > 238; };
        for (var x = 0; x < W; x++) { if (!fond(x * 4)) bord++; if (!fond(((H - 1) * W + x) * 4)) bord++; }
        for (var y = 0; y < H; y++) { if (!fond((y * W) * 4)) bord++; if (!fond((y * W + W - 1) * 4)) bord++; }
        for (var k = 0; k < W * H; k++) if (!fond(k * 4)) plein++;
        if (plein < W * H * 0.08) ok({ ok: false, image: img, raison: '${T("La vue de face est presque vide : le vêtement n’apparaît pas.")}' });
        else if (bord > 3) ok({ ok: false, image: img, raison: '${T("Quelque chose touche le bord de l’image (le vêtement coupé, ou le support du mannequin) : The New Black le reproduirait.")}' });
        else ok({ ok: true, image: img });
      };
      im.onerror = function(){ ok({ ok: false, raison: '${T("La vue de face n’a pas pu être capturée.")}' }); };
      im.src = img;
    });
  }
  /* « PRÊT À CONSTRUIRE ? » — cinq contrôles ; chacun { ok, lib, raison, lien, geste }. */
  function verifierC3(){
    if (!V3) return;
    var n = ++C3.verif, m = V3.m, ctl = [];
    var fin = function(){ if (n !== C3.verif || !V3) return; C3.ctl = ctl; peindreTnb3d(); };
    ctl.push(V3.dsale
      ? { ok: false, lib: '${T("Modèle enregistré")}', raison: '${T("Des modifications ne sont pas enregistrées : l’aperçu représenterait une version qui n’existe pas.")}', lien: '${T("Enregistrer")}', geste: 'enreg' }
      : { ok: true, lib: '${T("Modèle enregistré")}', raison: '${T("Version {0}")}'.split('{0}').join(String(m.version || 1)) });
    var aMotif = !!(m.motif && (m.motif.calques || []).length);
    var couleurOk = !!(V3.photo || V3.couleurChoisie);
    ctl.push(couleurOk
      ? { ok: true, lib: '${T("Couleur du tissu choisie")}', raison: V3.photo ? '${T("Celle de la photo du modèle")}' : '' }
      : { ok: false, lib: '${T("Couleur du tissu choisie")}', raison: '${T("La couleur par défaut n’a pas été confirmée : choisissez la couleur du tissu dans le panneau Tissu.")}', lien: '${T("Choisir")}', geste: 'couleur' });
    var pieces = m.pieces || [];
    Promise.all([
      pieces.length ? appeler('atelier:analyser', [{ pieces: pieces, assemblages: m.assemblages || [], laize: 140 }]) : Promise.resolve(null),
      pieces.length ? appeler('atelier:graduer', [{ pieces: pieces, tailleBase: m.tailleBase || 'M', tailles: m.tailles || [] }]) : Promise.resolve(null),
      aMotif ? appeler('atelier:motifControler', [{ id: m.id, motif: m.motif }]) : Promise.resolve(null),
      c3Capturer()
    ]).then(function(rs){
      var an = rs[0], gr = rs[1], mo = rs[2], cap = rs[3];
      var ecarts = an && an.ok ? (an.assemblages || []).filter(function(a){ return Math.abs(Number(a.ecart) || 0) > 0.5; }) : [];
      if (!pieces.length) ctl.splice(1, 0, { ok: false, lib: '${T("Patron validé")}', raison: '${T("Le modèle n’a pas de pièces.")}', lien: '${T("Ouvrir le patron")}', geste: 'patron' });
      else if (!an || !an.ok) ctl.splice(1, 0, { ok: false, lib: '${T("Patron validé")}', raison: expliquer(an), lien: '${T("Ouvrir le patron")}', geste: 'patron' });
      else if (ecarts.length) ctl.splice(1, 0, { ok: false, lib: '${T("Patron validé")}', raison: '${T("{0} couture(s) assemblent des bords de longueurs différentes (plus de 0,5 cm).")}'.split('{0}').join(String(ecarts.length)), lien: '${T("Ouvrir le patron")}', geste: 'patron' });
      else if (!gr || !gr.ok) ctl.splice(1, 0, { ok: false, lib: '${T("Patron validé")}', raison: '${T("La gradation des tailles n’a pas pu être calculée.")}', lien: '${T("Ouvrir le patron")}', geste: 'patron' });
      else ctl.splice(1, 0, { ok: true, lib: '${T("Patron validé")}', raison: '${T("{0} pièce(s), coutures cohérentes, gradation calculée")}'.split('{0}').join(String(pieces.length)) });
      if (!aMotif) ctl.splice(2, 0, { ok: true, lib: '${T("Motif / impression")}', raison: '${T("Aucun motif sur ce modèle")}' });
      else {
        var alertes = mo && mo.ok ? (mo.controles || []).filter(function(c){ return c.niveau && c.niveau !== 'ok' && c.niveau !== 'info'; }) : [{ texte: expliquer(mo) }];
        ctl.splice(2, 0, alertes.length
          ? { ok: false, lib: '${T("Motif / impression")}', raison: String(alertes[0].texte || '') + (alertes.length > 1 ? ' (+' + (alertes.length - 1) + ')' : ''), lien: '${T("Ouvrir le motif")}', geste: 'motif' }
          : { ok: true, lib: '${T("Motif / impression")}', raison: '${T("Placé et validé")}' });
      }
      C3.source = cap && cap.image ? cap.image : '';
      // le vêtement encore en calcul : on revérifie toute seule, sans clic (au plus une minute)
      if (cap && cap.attente && (C3.essais = (C3.essais || 0) + 1) < 40) setTimeout(function(){ if (n === C3.verif && V3 && !C3.gen) verifierC3(); }, 1500);
      else if (cap && !cap.attente) C3.essais = 0;
      ctl.push(cap && cap.ok
        ? { ok: true, lib: '${T("Vue de face sans défaut")}', raison: '${T("Le vêtement entier, sans mannequin, sur fond blanc")}' }
        : { ok: false, lib: '${T("Vue de face sans défaut")}', raison: (cap && cap.raison) || '', lien: '${T("Vue technique 3D")}', geste: 'tech' });
      fin();
    });
  }
  function c3Pret(){ return !!(C3.ctl && C3.ctl.every(function(c){ return c.ok; })); }
  function peindreC3(z){
    c3ModelViewer();
    var t = c3Construit(), et = c3Etat(), ch = c3Changements(), h = '';
    var depense = '${T("Déjà dépensé pour ce modèle : {0} ({1} construction(s))")}'.split('{0}').join(c3Usd(et.total)).split('{1}').join(String(et.constructions));
    if (C3.gen) {
      h += '<div class="t1">${T("Construction de l’aperçu 3D…")}</div><div class="t2">${T("Sans mannequin, puis modèle 3D chez The New Black — environ 3 à 4 minutes. Suivie dans la petite fenêtre de suivi et la fenêtre Générations.")}</div>'
        + '<div class="barre" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + C3.pct + '"><i style="width:' + C3.pct + '%"></i></div>'
        + '<div class="coin"><button type="button" data-c3="photo">${T("Rendu photo…")}</button><button type="button" data-c3="tech">${T("Vue technique 3D")}</button></div>';
    } else if (t && !C3.panneau) {
      h += '<model-viewer class="c3-mv" src="' + esc(t.url) + '" camera-controls touch-action="pan-y" exposure="1" shadow-intensity="0.6" camera-orbit="0deg 80deg auto" interaction-prompt="none" alt="' + esc(V3.m.nom || '') + '"></model-viewer>'
        + '<div class="coin">'
        + (ch && ch.length ? '<button type="button" data-c3="panneau">${T("Régénérer…")}</button>' : (D.peutModifier ? '<button type="button" data-c3="panneau">${T("Reconstruire…")}</button>' : ''))
        + '<button type="button" data-c3="photo">${T("Rendu photo…")}</button><button type="button" data-c3="tech">${T("Vue technique 3D")}</button></div>'
        + '<div class="perime c3-info"><span>' + '${T("Aperçu 3D · version {0} · {1}")}'.split('{0}').join(String(t.version)).split('{1}').join(c3Usd(t.cout)) + '</span>'
        + (ch && ch.length ? '<b>' + '${T("Le modèle a changé depuis : {0}")}'.split('{0}').join(ch.join(', ')) + '</b>' : '') + '</div>';
    } else {
      var P = C3.prix, total = P ? Number(P.prix) : null, cred = P ? Number(P.credits) : null;
      var meme = t && Number(t.version) === Number(V3.m.version || 1) && !(ch && ch.length);
      h += '<div class="c3-pan"><div class="t1">' + (t ? (meme ? '${T("Reconstruire l’aperçu 3D")}' : '${T("Régénérer l’aperçu 3D")}') : '${T("Construire l’aperçu 3D")}') + '</div>'
        + '<div class="t2">${T("La vue de face part chez The New Black en deux étapes : un rendu sans mannequin (photoréaliste), puis un modèle 3D construit d’après ce rendu. Rien ne part sans votre confirmation.")}</div>'
        + '<div class="c3-grille"><div class="c3-ctl" role="list" aria-label="${T("Prêt à construire ?")}"><div class="lib">${T("Prêt à construire ?")}</div>'
        + (C3.ctl ? C3.ctl.map(function(c, i){
            return '<div class="c3-l ' + (c.ok ? 'ok' : 'non') + '" role="listitem"><span class="s" aria-hidden="true">' + (c.ok ? '✓' : '✕') + '</span><span><b>' + esc(c.lib) + '</b>'
              + (c.raison ? '<small>' + esc(c.raison) + '</small>' : '') + '</span>' + (!c.ok && c.lien ? '<button type="button" data-c3g="' + c.geste + '">' + esc(c.lien) + '</button>' : '') + '</div>';
          }).join('') : '<div class="c3-l"><span class="s">…</span><span>${T("Vérification du modèle…")}</span></div>')
        + '</div>' + (C3.source ? '<figure class="c3-src"><img src="' + C3.source + '" alt=""><figcaption>${T("La vue qui part")}</figcaption></figure>' : '') + '</div>'
        + '<div class="t2 c3-cout">' + '${T("Coût : {0} ({1} crédits : sans mannequin {2} + modèle 3D {3})")}'.split('{0}').join(c3Usd(total)).split('{1}').join(cred == null ? '…' : String(cred))
            .split('{2}').join(P ? String(P.fantome.credits) : '…').split('{3}').join(P ? String(P.modele3d.credits) : '…')
        + '<br>' + depense + ' · ' + '${T("{0} sur {1} constructions en 24 h")}'.split('{0}').join(String(et.recentes)).split('{1}').join(String(et.plafond)) + '</div>'
        + (et.plafondAtteint ? '<div class="t2 c3-non">${T("Plafond atteint : trois constructions pour ce modèle dans les dernières 24 heures. Réessayez plus tard.")}</div>' : '')
        + (D.peutModifier ? '<button type="button" class="gen" data-c3="construire"' + (c3Pret() && total != null && !et.plafondAtteint ? '' : ' disabled') + '>'
            + (meme ? '${T("Reconstruire… ({0})")}' : '${T("Construire l’aperçu 3D ({0})")}').split('{0}').join(c3Usd(total)) + '</button>' : '')
        + '</div><div class="coin">' + (t ? '<button type="button" data-c3="retour">${T("Annuler")}</button>' : '')
        + '<button type="button" data-c3="photo">${T("Rendu photo…")}</button><button type="button" data-c3="tech">${T("Vue technique 3D")}</button></div>';
      if (!C3.prix) chargerPrixC3();
      if (!C3.ctl && C3.verifPour !== V3.id + ':' + (V3.m.version || 1)) { C3.verifPour = V3.id + ':' + (V3.m.version || 1); setTimeout(verifierC3, 60); }
    }
    z.innerHTML = h;
    Array.prototype.forEach.call(z.querySelectorAll('[data-c3]'), function(b){
      b.onclick = function(){
        var g = b.getAttribute('data-c3');
        if (g === 'tech') { V3.technique = true; peindreTnb3d(); return; }
        if (g === 'photo') { V3.vuePrinc = 'photo'; peindreTnb3d(); return; }
        if (g === 'panneau') { C3.panneau = true; C3.ctl = null; C3.verifPour = ''; peindreTnb3d(); return; }
        if (g === 'retour') { C3.panneau = false; peindreTnb3d(); return; }
        if (g === 'construire') construireC3();
      };
    });
    Array.prototype.forEach.call(z.querySelectorAll('[data-c3g]'), function(b){
      b.onclick = function(){
        var g = b.getAttribute('data-c3g');
        if (g === 'enreg') { enregistrer3d(); return; }
        if (g === 'tech') { V3.technique = true; peindreTnb3d(); return; }
        if (g === 'patron') { if (V3.dsale) { dire('${T("Enregistrez d’abord vos modifications de la vue 3D.")}', 'att'); return; } ouvrirEditeur(V3.id); return; }
        if (g === 'motif') { if (V3.dsale) { dire('${T("Enregistrez d’abord vos modifications de la vue 3D.")}', 'att'); return; } ouvrirMotif(V3.id, '3d'); return; }
        if (g === 'couleur') { var c = document.querySelector('[data-v3c]'); if (c) c.focus(); dire('${T("Choisissez la couleur du tissu dans le panneau Tissu (une pastille).")}', 'att'); }
      };
    });
  }
  function construireC3(){
    if (!V3 || OCCUPE || C3.gen || !c3Pret() || !C3.prix || !C3.source) return;
    var P = C3.prix, total = Number(P.prix), cred = Number(P.credits), t = c3Construit(), et = c3Etat();
    var meme = t && Number(t.version) === Number(V3.m.version || 1) && !(c3Changements() || []).length;
    var d = [['${T("Envoyé")}', '${T("la vue de face du modèle (900 × 1200, fond blanc, sans mannequin)")}'],
      ['${T("Chez")}', 'The New Black'],
      ['${T("Étapes")}', '${T("1) rendu sans mannequin ({0} crédit) · 2) modèle 3D d’après ce rendu ({1} crédits)")}'.split('{0}').join(String(P.fantome.credits)).split('{1}').join(String(P.modele3d.credits))],
      ['${T("Montant total")}', c3Usd(total)], ['${T("Déjà dépensé pour ce modèle")}', c3Usd(et.total)]];
    if (C3.solde != null) d.push(['${T("Solde après")}', '${T("{0} crédits")}'.split('{0}').join(String(Math.round((C3.solde - cred) * 10) / 10))]);
    d.push(['${T("Durée estimée")}', '${T("environ 3 à 4 minutes")}']);
    var q = meme
      ? { danger: true, titre: '${T("Reconstruire l’aperçu 3D")}',
          texte: '${T("Un aperçu existe déjà pour cette version ({0}) : il a coûté {1}. Le reconstruire coûte de nouveau {2}, engagés dès l’envoi et non remboursés.")}'
            .split('{0}').join('v' + (V3.m.version || 1)).split('{1}').join(c3Usd(t.cout)).split('{2}').join(c3Usd(total)),
          details: d, oui: '${T("Reconstruire ({0})")}'.split('{0}').join(c3Usd(total)) }
      : { prudent: true, titre: t ? '${T("Régénérer l’aperçu 3D")}' : '${T("Construire l’aperçu 3D")}',
          texte: '${T("Le coût est engagé dès l’envoi : il n’est pas remboursé si vous arrêtez la construction ensuite.")}',
          details: d, oui: '${T("Construire ({0})")}'.split('{0}').join(c3Usd(total)) };
    szConfirmer(q).then(function(ok){
      if (!ok || !V3) return;
      var id = V3.id;
      dire('${T("Envoi à The New Black…")}');
      appeler('atelier:modele3dLancer', [{ id: id, version: V3.m.version || 1, image: C3.source, prixAnnonce: total, prix3d: Number(P.modele3d.prix),
        vetement: (V3.m.nom || '') + (V3.m.base ? ' (' + V3.m.base + ')' : ''), couleur: V3.couleur || '', reconstruire: !!meme }]).then(function(r){
        if (r && r.motif === 'prix_change') { C3.prix = null; dire('${T("Le prix a changé : {0}. Rien n’a été lancé — relancez pour confirmer ce prix.")}'.split('{0}').join(c3Usd(r.prixReel)), 'att'); peindreTnb3d(); return; }
        if (r && r.motif === 'non_enregistre') { dire('${T("Le modèle a changé depuis la vérification : enregistrez, puis recommencez.")}', 'att'); return; }
        if (r && r.motif === 'plafond') { dire('${T("Plafond atteint : trois constructions pour ce modèle dans les dernières 24 heures.")}', 'att'); return; }
        if (r && r.motif === 'deja_construit') { dire('${T("Un aperçu existe déjà pour cette version.")}', 'att'); return; }
        if (!r || !r.ok) { dire(r && (r.detail || r.error) ? '${T("The New Black : {0}")}'.split('{0}').join(r.detail || r.error) : expliquer(r), 'err'); return; }
        C3.gen = r.id; C3.pct = 3; C3.panneau = false; suivreC3(id);
        dire('${T("Construction lancée — suivie dans la petite fenêtre de suivi.")}', 'bon');
      });
    });
  }
  function suivreC3(modeleId){
    peindreTnb3d();
    if (C3.t) return;
    C3.t = setInterval(function(){
      appeler('generations:etat', []).then(function(r){
        var g = (r && r.ok && r.liste ? r.liste : []).filter(function(x){ return x.id === C3.gen; })[0];
        if (!g) return;
        var e = g.etapes || [], tot = 0, fait = 0;
        e.forEach(function(x){ var w = x.d || 4; tot += w; if (x.etat === 'fait') fait += w; else if (x.etat === 'cours' && x.t0) fait += Math.min(0.95, (Date.now() - x.t0) / 1000 / w) * w; });
        C3.pct = Math.round(Math.min(99, fait / Math.max(1, tot) * 100));
        if (g.etat !== 'cours') {
          clearInterval(C3.t); C3.t = null; C3.gen = '';
          if (g.etat === 'fini') relireDonnees().then(function(d){
            if (d && d.ok) { D = d; var m = (D.modeles || []).filter(function(x){ return x.id === modeleId; })[0]; if (m && V3 && V3.id === modeleId) V3.m = m; }
            dire('${T("Aperçu 3D construit.")}', 'bon'); peindreTnb3d();
          });
          else { dire(g.message || '${T("La construction n’a pas abouti.")}', 'err'); peindreTnb3d(); }
          return;
        }
        if (V3 && V3.id === modeleId) peindreTnb3d();
      });
    }, 2000);
  }
  function peindreTnb3d(){
    var z = document.getElementById('v3-tnb'); if (!z || !V3) return;
    var sc = document.getElementById('v3-scene');
    if (V3.technique) {
      z.style.display = 'none';
      var rb = document.getElementById('v3-rp-retour');
      if (!rb && sc) { rb = document.createElement('button'); rb.type = 'button'; rb.id = 'v3-rp-retour'; rb.className = 'v3-rp-retour';
        rb.textContent = '${T("Aperçu 3D")}'; rb.onclick = function(){ V3.technique = false; peindreTnb3d(); }; sc.appendChild(rb); }
      return;
    }
    var rr = document.getElementById('v3-rp-retour'); if (rr) rr.remove();
    z.style.display = '';
    if (V3.vuePrinc === 'photo') peindreRp(z); else peindreC3(z);
  }
  function peindreRp(z){
    var rendus = V3.m.rendusPhoto || {}, dispo = RP_ANGLES.filter(function(a){ return rendus[a[0]] || RP.images[a[0]]; });
    var h = '';
    if (dispo.length && !RP.panneau) {
      if (!rendus[RP.vue] && !RP.images[RP.vue]) RP.vue = dispo[0][0];
      var src = RP.images[RP.vue] || rendus[RP.vue].url, perime = rendus[RP.vue] && Number(rendus[RP.vue].version || 1) !== Number(V3.m.version || 1);
      h += '<img class="rp-grand" src="' + esc(src) + '" alt="' + esc(V3.m.nom || '') + '">'
        + '<div class="rp-vign" role="group" aria-label="${T("Angles")}">' + dispo.map(function(a){
            return '<button type="button" data-rpv="' + a[0] + '" class="' + (RP.vue === a[0] ? 'on' : '') + '" aria-pressed="' + (RP.vue === a[0]) + '"><img src="' + esc(RP.images[a[0]] || rendus[a[0]].url) + '" alt=""><span>' + a[1] + '</span></button>'; }).join('') + '</div>'
        + '<div class="coin">' + (perime ? '<span>' + '${T("Le modèle a changé depuis ce rendu (version {0}).")}'.split('{0}').join(String(V3.m.version || 1)) + '</span>' : '')
        + (D.peutModifier ? '<button type="button" data-rp="regen">${T("Régénérer…")}</button><button type="button" data-rp="vign">${T("Utiliser comme vignette")}</button>' : '')
        + ((D.produits || []).length && D.peutModifier ? '<button type="button" data-rp="fiche">${T("Vers la fiche produit")}</button>' : '')
        + '<button type="button" data-rp="ap3d">${T("Aperçu 3D")}</button><button type="button" data-rp="tech">${T("Vue technique 3D")}</button></div>';
    } else if (rpEnCours()) {
      var ks = Object.keys(RP.gens), moy = Math.round(ks.reduce(function(a, k){ return a + (RP.pct[k] || 0); }, 0) / ks.length);
      h += '<div class="t1">${T("Rendu photo en cours…")}</div><div class="t2">' + '${T("{0} angle(s) chez The New Black — environ 30 secondes chacun.")}'.split('{0}').join(String(ks.length)) + '</div>'
        + '<div class="barre" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + moy + '"><i style="width:' + moy + '%"></i></div>'
        + '<div class="coin"><button type="button" data-rp="ap3d">${T("Aperçu 3D")}</button><button type="button" data-rp="tech">${T("Vue technique 3D")}</button></div>';
    } else {
      var n = rpChoisis().length, p = rpPrix();
      h += '<div class="t1">' + (dispo.length ? '${T("Régénérer le rendu photo")}' : '${T("Aucun rendu pour ce modèle")}') + '</div>'
        + '<div class="t2">${T("Chaque angle choisi part chez The New Black (la vue du modèle, fond blanc) et revient en photo de studio, fond gris clair uni. Rien ne part sans votre confirmation.")}</div>'
        + '<div class="rp-opts"><span class="lib">${T("Angles")}</span>' + RP_ANGLES.map(function(a){ return '<label><input type="checkbox" data-rpa="' + a[0] + '"' + (RP.angles[a[0]] ? ' checked' : '') + '>' + a[1] + ' · ' + rpUsd(p) + '</label>'; }).join('') + '</div>'
        + '<div class="rp-opts"><span class="lib">${T("Style")}</span>' + RP_STYLES.map(function(a){ return '<label><input type="radio" name="rp-style" data-rps="' + a[0] + '"' + (RP.style === a[0] ? ' checked' : '') + '>' + a[1] + '</label>'; }).join('')
        + (RP.style === 'porte' ? '<span class="lib">' + '${T("Mannequin : {0}")}'.split('{0}').join(V3.genre === 'homme' ? '${T("homme")}' : '${T("femme")}') + '</span>' : '') + '</div>'
        + '<div class="rp-opts"><span class="lib">${T("Qualité")}</span>' + RP_PALIERS.map(function(a){ return '<label><input type="radio" name="rp-pal" data-rpp="' + a[0] + '"' + (RP.palier === a[0] ? ' checked' : '') + '>' + a[1] + '</label>'; }).join('') + '</div>'
        // le bouton est TOUJOURS là pour qui peut modifier : un vêtement encore en calcul est refusé au clic, avec sa raison
        + (D.peutModifier ? '<button type="button" class="gen" data-rp="gen"' + (n && p != null ? '' : ' disabled') + '>' + '${T("Générer le rendu photo ({0})")}'.split('{0}').join(rpUsd(p == null ? null : p * n)) + '</button>' : '')
        + '<div class="coin">' + (dispo.length ? '<button type="button" data-rp="retour">${T("Annuler")}</button>' : '') + '<button type="button" data-rp="ap3d">${T("Aperçu 3D")}</button><button type="button" data-rp="tech">${T("Vue technique 3D")}</button></div>';
      if (!RP.bareme) chargerBaremeRp();
    }
    z.innerHTML = h;
    Array.prototype.forEach.call(z.querySelectorAll('[data-rpv]'), function(b){ b.onclick = function(){ RP.vue = b.getAttribute('data-rpv'); peindreTnb3d(); }; });
    Array.prototype.forEach.call(z.querySelectorAll('[data-rpa]'), function(c){ c.onchange = function(){ RP.angles[c.getAttribute('data-rpa')] = c.checked; peindreTnb3d(); }; });
    Array.prototype.forEach.call(z.querySelectorAll('[data-rps]'), function(c){ c.onchange = function(){ RP.style = c.getAttribute('data-rps'); peindreTnb3d(); }; });
    Array.prototype.forEach.call(z.querySelectorAll('[data-rpp]'), function(c){ c.onchange = function(){ RP.palier = c.getAttribute('data-rpp'); peindreTnb3d(); }; });
    Array.prototype.forEach.call(z.querySelectorAll('[data-rp]'), function(b){
      b.onclick = function(){
        var g = b.getAttribute('data-rp');
        if (g === 'tech') { V3.technique = true; peindreTnb3d(); return; }
        if (g === 'ap3d') { V3.vuePrinc = '3d'; RP.panneau = false; peindreTnb3d(); return; }
        if (g === 'regen') { RP.panneau = true; peindreTnb3d(); return; }
        if (g === 'retour') { RP.panneau = false; peindreTnb3d(); return; }
        if (g === 'gen') { genererRp(); return; }
        var src = RP.images[RP.vue] || ((V3.m.rendusPhoto || {})[RP.vue] || {}).url;
        if (g === 'vign' && src) vignetteDepuis(src);
        if (g === 'fiche' && src) versFiche(src);
      };
    });
  }
  function chargerBaremeRp(){
    if (RP.chargement) return; RP.chargement = true;
    appeler('atelier:renduPrix', []).then(function(r){
      RP.chargement = false;
      if (r && r.ok && r.prix) { RP.bareme = r.prix; RP.solde = r.solde; peindreTnb3d(); }
      else dire(r && (r.detail || r.error) ? '${T("The New Black : {0}")}'.split('{0}').join(r.detail || r.error) : expliquer(r), 'err');
    });
  }
  function genererRp(){
    var angles = rpChoisis(), p = rpPrix();
    if (!V3 || OCCUPE || rpEnCours() || !angles.length || p == null) return;
    if (!plaque3d()) { dire('${T("Le vêtement n’est pas encore prêt : attendez la fin du calcul, puis recommencez.")}', 'att'); return; }
    var sources = {}, img = rendreVues3d(angles, true, [900, 1200], '#FFFFFF');
    angles.forEach(function(a, i){ sources[a] = img[i]; });
    if (angles.some(function(a){ return !sources[a]; })) { dire('${T("La vue du modèle n’a pas pu être capturée.")}', 'err'); return; }
    var tot = p * angles.length, cred = (RP.bareme[RP.style][RP.palier].credits || 1) * angles.length;
    var d = [['${T("Envoyé")}', '${T("la vue du modèle, fond blanc, pour chaque angle :")} ' + angles.map(function(a){ return RP_ANGLES.filter(function(x){ return x[0] === a; })[0][1]; }).join(', ')],
      ['${T("Chez")}', 'The New Black'], ['${T("Style")}', RP_STYLES.filter(function(x){ return x[0] === RP.style; })[0][1]],
      ['${T("Crédits")}', String(cred)], ['${T("Montant")}', rpUsd(tot)]];
    if (RP.solde != null) d.push(['${T("Solde après")}', '${T("{0} crédits")}'.split('{0}').join(String(Math.round((RP.solde - cred) * 10) / 10))]);
    d.push(['${T("Durée estimée")}', '${T("environ 30 secondes par angle")}']);
    szConfirmer({ prudent: true, titre: '${T("Générer le rendu photo")}',
      texte: '${T("Le coût est engagé dès l’envoi : il n’est pas remboursé si vous arrêtez la génération ensuite.")}',
      details: d, oui: '${T("Générer ({0})")}'.split('{0}').join(rpUsd(tot)) }).then(function(ok){
        if (!ok) return;
        RP.panneau = false; var modeleId = V3.id, suite = angles.slice();
        var un = function(){
          if (!suite.length) { peindreTnb3d(); return; }
          var a = suite.shift();
          appeler('atelier:renduTnb', [{ id: modeleId, nom: V3.m.nom || V3.m.ref || '', version: V3.m.version || 1, angle: a, image: sources[a], rendu: RP.style,
            palier: RP.palier, genre: V3.genre === 'homme' ? 'homme' : 'femme', prixAnnonce: p }]).then(function(r){
            if (r && r.motif === 'prix_change') { RP.bareme = null; dire('${T("Le prix a changé : {0}. Rien n’a été lancé — relancez pour confirmer ce prix.")}'.split('{0}').join(rpUsd(r.prixReel)), 'att'); peindreTnb3d(); return; }
            if (!r || !r.ok) { dire(r && (r.detail || r.error) ? '${T("The New Black : {0}")}'.split('{0}').join(r.detail || r.error) : expliquer(r), 'err'); peindreTnb3d(); return; }
            RP.gens[a] = r.id; RP.pct[a] = 5; suivreRp(modeleId); un();
          });
        };
        dire('${T("Envoi à The New Black…")}');
        un();
      });
  }
  function suivreRp(modeleId){
    peindreTnb3d();
    if (RP.t) return;
    RP.t = setInterval(function(){
      appeler('generations:etat', []).then(function(r){
        var l = r && r.ok && r.liste ? r.liste : [];
        Object.keys(RP.gens).forEach(function(a){
          var g = l.filter(function(x){ return x.id === RP.gens[a]; })[0]; if (!g) return;
          var e = g.etapes || [], fait = e.filter(function(x){ return x.etat === 'fait'; }).length, c = e[g.etapeCourante] || {};
          var ec = c.etat === 'cours' && c.t0 ? Math.min(0.95, (Date.now() - c.t0) / 1000 / (g.etapeCourante === 2 ? (g.dureeEstimee || 35) : 3)) : 0;
          RP.pct[a] = Math.round(Math.min(99, (fait + ec) / Math.max(1, e.length) * 100));
          if (g.etat === 'cours') return;
          var id = RP.gens[a]; delete RP.gens[a];
          if (g.etat === 'fini') appeler('atelier:renduResultat', [id]).then(function(x){
            if (!x || !x.ok) return;
            var rend = { url: x.url || x.image, style: RP.style, version: (V3 && V3.m.version) || 1 };
            (D.modeles || []).forEach(function(m){ if (m.id === modeleId) { m.rendusPhoto = Object.assign({}, m.rendusPhoto || {}); m.rendusPhoto[a] = rend; } });
            if (V3 && V3.id === modeleId) { V3.m.rendusPhoto = Object.assign({}, V3.m.rendusPhoto || {}); V3.m.rendusPhoto[a] = rend; if (x.image) RP.images[a] = x.image; RP.vue = a; peindreTnb3d(); }
            dire('${T("Rendu photo prêt — rangé dans la photothèque.")}', 'bon');
          });
          else dire(g.message || '${T("Le rendu photo n’a pas abouti.")}', 'err');
        });
        if (!rpEnCours()) { clearInterval(RP.t); RP.t = null; }
        if (V3 && V3.id === modeleId) peindreTnb3d();
      });
    }, 1500);
  }
  function peindrePanneau3d(){
    var z = document.getElementById('v3-pan'), r = V3 ? V3.r : null;
    // les mesures du corps arrivent avec l aperçu : le panneau Mannequin, s il est ouvert, se redessine
    var om = V3 ? corps.querySelector('.v3 [data-st-onglet="b:mannequin"].on') : null, pm = om && om.closest('.st-pan') ? om.closest('.st-pan').querySelector('.st-pan-corps') : null;
    if (pm) pm.innerHTML = v3Panneau('mannequin');
    if (!z || !V3) return;
    if (!r) { z.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i></div>'; return; }
    var cm1 = function(v){ return (v > 0 ? '+' : '') + String(Math.round(v * 10) / 10).replace('.', '${SEP_DEC()}') + ' cm'; };
    var h = '<div class="v3-sec">' + '${T("Ajustement · taille {0}")}'.split('{0}').join(esc(r.taille)) + '</div>'
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
    if (r.motif3d === 'tete') h += '<div class="ed-note">' + '${T("Monté sur une tête de {0} cm de tour (le tableau de tailles) : la coupole vient de la largeur des pièces, rang par rang.")}'.split('{0}').join(String(r.tete).replace('.', '${SEP_DEC()}')) + '</div>';
    if (r.motif3d === 'type_sans_3d') h += '<div class="ed-note">${T("L’aperçu 3D n’est pas encore offert pour ce type (lingerie, chapeaux) : sa planche de dessin et son patron le sont.")}</div>';
    if (r.motif3d === 'pieces_inconnues') h += '<div class="ed-note">${T("Ce patron n’a pas de devant et de dos reconnaissables : seul le mannequin est montré.")}</div>';
    // les explications de méthode, repliées : elles occupaient la moitié du panneau
    h += '<details class="v3-apropos"><summary>${T("À propos de cet aperçu")}</summary>'
      + '<p>${T("Aperçu géométrique : le vêtement est montré seul, porté sur un corps invisible aux mesures du tableau ; sa largeur est mesurée sur les pièces, niveau par niveau (pinces déduites). Le tombé du tissu — plis, poids, glissement — n’est pas simulé.")}</p>'
      + '<p>${T("Les écarts se lisent de 0 à 2 cm serré, de 2 à 8 cm ajusté, au-delà aisé ; sous 0, le vêtement est plus petit que le corps.")}</p></details>';
    z.innerHTML = h;
  }
  function clic3d(ev){
    var t = ev.target, b;
    if ((b = t.closest('[data-st-menu]'))) { var k = b.getAttribute('data-st-menu'); if (MENU === k) stFermerMenu(); else stOuvrirMenu(k, false); return; }
    if ((b = t.closest('[data-st-onglet]'))) { var p = b.getAttribute('data-st-onglet').split(':'); V3P.ong[p[0]] = p[1]; garderEspace3d(); dessiner(); return; }
    if ((b = t.closest('[data-st-repli]'))) { var g = b.getAttribute('data-st-repli'); V3P.repli[g] = V3P.repli[g] ? 0 : 1; garderEspace3d(); dessiner(); return; }
    if ((b = t.closest('[data-v3zoom]'))) { var zz = b.getAttribute('data-v3zoom'); if (zz === '0') recentrer3d(); else zoom3d(zz === '+' ? V3.zoom * 1.2 : V3.zoom / 1.2); return; }
    if ((b = t.closest('[data-v3cam]'))) { bascule3d('auto'); return; }
    if ((b = t.closest('[data-v3g]'))) { genreChoisi3d(b.getAttribute('data-v3g')); return; }
    if ((b = t.closest('[data-v3t]'))) { taille3d(b.getAttribute('data-v3t')); return; }
    if ((b = t.closest('[data-v3v]'))) { vue3d(b.getAttribute('data-v3v')); return; }
    if ((b = t.closest('[data-v3c]'))) { V3.couleur = b.getAttribute('data-v3c'); V3.couleurChoisie = true; if (C3.ctl) { C3.ctl = null; C3.verifPour = ''; } dessiner(); return; }
    if ((b = t.closest('[data-v3f]'))) { V3.fond = b.getAttribute('data-v3f'); dessiner(); return; }
    if ((b = t.closest('[data-v3plis]')) || (b = t.closest('[data-v3tissu]'))) {
      if (b.hasAttribute('data-v3plis')) vie3d('plis', b.getAttribute('data-v3plis')); else vie3d('tissu', b.getAttribute('data-v3tissu'));
      return;
    }
    if ((b = t.closest('[data-v3out]'))) { if (!b.disabled) outil3d(b.getAttribute('data-v3out')); return; }
    if ((b = t.closest('[data-v3df]'))) { V3.dec.forme = b.getAttribute('data-v3df'); peindreDesign3d(); return; }
    if ((b = t.closest('[data-v3et]'))) { V3.el.type = b.getAttribute('data-v3et'); peindreDesign3d(); return; }
    if ((b = t.closest('[data-v3em]'))) { V3.el.matiere = b.getAttribute('data-v3em'); peindreDesign3d(); return; }
  }
  function change3d(t){
    if (t.hasAttribute('data-v3o')) {
      var k = t.getAttribute('data-v3o'); V3[k] = !!t.checked;
      if (k === 'mannequin') { try { localStorage.setItem('sz-atelier-mannequin', t.checked ? '1' : '0'); } catch (e) {} }
      if (k === 'photo' && GLV) GLV.cle = '';
      if (k === 'auto') { var ba = corps.querySelector('[data-v3cam="auto"]'); if (ba) ba.setAttribute('aria-pressed', String(!!t.checked)); }
      demander3d(); return;
    }
    if (changeDesign3d(t)) return;
  }
  /* Les menus et le clavier de l aperçu (le studio a les siens, liés à son modèle) : survol d un menu à l autre,
     clic hors du menu, F10, flèches, Échap (ferme d abord le menu, sinon quitte), Ctrl+S, Ctrl+Z, zoom. */
  corps.addEventListener('mouseover', function(ev){
    if (VUE !== '3d' || !MENU) return;
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-st-menu]') : null;
    if (b && b.getAttribute('data-st-menu') !== MENU) stOuvrirMenu(b.getAttribute('data-st-menu'), false);
  });
  document.addEventListener('mousedown', function(ev){
    if (VUE !== '3d' || !MENU) return;
    var t = ev.target;
    if (!(t && t.closest && t.closest('.st-menu-liste, [data-st-menu]'))) stFermerMenu();
  }, true);
  document.addEventListener('keydown', function(ev){
    if (VUE !== '3d' || !V3 || document.querySelector('.szc-voile')) return;
    var k = ev.key, ctrl = ev.ctrlKey || ev.metaKey, a = document.activeElement;
    var barre = function(){ return Array.prototype.slice.call(corps.querySelectorAll('[data-st-menu]')); };
    var stop = function(){ ev.preventDefault(); ev.stopImmediatePropagation(); };
    var liste = corps.querySelector('.st-menu-liste');
    if (liste && a && liste.contains(a)) {
      var its = Array.prototype.slice.call(liste.querySelectorAll('button:not(:disabled)')), i = its.indexOf(a);
      if (k === 'ArrowDown' || k === 'ArrowUp') { stop(); var n = its[(i + (k === 'ArrowDown' ? 1 : -1) + its.length) % its.length]; if (n) n.focus(); return; }
      if (k === 'Home' || k === 'End') { stop(); var e2 = its[k === 'Home' ? 0 : its.length - 1]; if (e2) e2.focus(); return; }
      if (k === 'ArrowRight' || k === 'ArrowLeft') {
        stop(); var j = MENUS3.map(function(x){ return x[0]; }).indexOf(MENU);
        stOuvrirMenu(MENUS3[(j + (k === 'ArrowRight' ? 1 : -1) + MENUS3.length) % MENUS3.length][0], true); return;
      }
      if (k === 'Tab') { stFermerMenu(); return; }
    }
    if (a && a.hasAttribute && a.hasAttribute('data-st-menu')) {
      var bb = barre(), x = bb.indexOf(a);
      if (k === 'ArrowRight' || k === 'ArrowLeft') { stop(); var nb = bb[(x + (k === 'ArrowRight' ? 1 : -1) + bb.length) % bb.length]; if (nb) { nb.focus(); if (MENU) stOuvrirMenu(nb.getAttribute('data-st-menu'), false); } return; }
      if (k === 'ArrowDown' || k === 'Enter' || k === ' ') { stop(); stOuvrirMenu(a.getAttribute('data-st-menu'), true); return; }
    }
    if (k === 'F10') { stop(); var pb = barre()[0]; if (pb) pb.focus(); return; }
    if (k === 'Escape' && MENU) { stop(); var mb = corps.querySelector('[data-st-menu="' + MENU + '"]'); stFermerMenu(); if (mb) mb.focus(); return; }
    if (!ctrl) return;
    var champ = a && /^(INPUT|TEXTAREA)$/.test(a.tagName), kl = String(k).toLowerCase();
    if (kl === 's') { stop(); enregistrer3d(); return; }
    if (kl === 'z' && !ev.shiftKey && !champ) { stop(); annuler3d(); return; }
    if (k === '+' || k === '=') { stop(); zoom3d(V3.zoom * 1.2); return; }
    if (k === '-') { stop(); zoom3d(V3.zoom / 1.2); return; }
    if (k === '0') { stop(); recentrer3d(); return; }
  }, true);
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
    if (V3 && V3.dsale && !V3.quitterOk) { szConfirmer({ titre: '${T("Quitter sans enregistrer ?")}', texte: '${T("Le design 3D (découpes, bijoux) sera perdu.")}', oui: '${T("Quitter")}', danger: true }).then(function(ok){ if (ok && V3) { V3.quitterOk = true; quitter3d(); } }); return; }
    var r = V3 ? V3.retour : 'biblio', id = V3 ? V3.id : '';
    V3 = null; if (window._v3RO) { window._v3RO.disconnect(); window._v3RO = null; }
    if (r === 'editeur' && id) { VUE = 'biblio'; ouvrirEditeur(id); return; }
    VUE = 'biblio'; dessiner(); dire('');
  }

  /* ── La planche : le crayon suit la souris ; la gomme ôte le trait le plus proche ── */
  corps.addEventListener('mousedown', function(ev){
    if (VUE !== 'planche' || !PL || !PL.cq || ev.button !== 0 || !(ev.target && ev.target.closest && ev.target.closest('#pl-svg'))) return;
    var q = pointPL(ev); if (!q) return;
    ev.preventDefault();
    if (PL.outil === 'gomme') { gommerPL(q); return; }
    var ep = EP_PL.filter(function(e){ return e[0] === PL.ep; })[0] || EP_PL[1];
    PL.trait = { c: PL.couleur, e: ep[2], o: 1, pts: [q.x, q.y] };
  });
  window.addEventListener('mousemove', function(ev){
    if (VUE !== 'planche' || !PL || !PL.trait) return;
    var q = pointPL(ev); if (!q) return;
    var n = PL.trait.pts.length;
    if (Math.hypot(q.x - PL.trait.pts[n - 2], q.y - PL.trait.pts[n - 1]) < 0.15 || n >= 4000) return;
    PL.trait.pts.push(q.x, q.y); peindrePL();
  });
  window.addEventListener('mouseup', function(){
    if (VUE !== 'planche' || !PL || !PL.trait) return;
    var t = PL.trait; PL.trait = null;
    if (t.pts.length < 4) t.pts.push(t.pts[0] + 0.05, t.pts[1]);       // un point : un petit trait, pour qu il se voie
    if (PL.traits.length >= 600) { dire('${T("600 traits au plus sur une planche.")}', 'err'); peindrePL(); return; }
    memoPL(); PL.traits.push(t); apresPL();
  });

  /* ── La souris : tourner, zoomer, déplacer ── */
  corps.addEventListener('mousedown', function(ev){
    if (VUE !== '3d' || !V3 || !(ev.target && ev.target.closest && ev.target.closest('#v3-scene')) || ev.target.closest('.v3-cam') || ev.target.closest('#v3-tnb')) return;   // les commandes de caméra sont DANS la scène : ni glisser ni poser
    ev.preventDefault();
    if (V3.outil !== 'tourner' && ev.button === 0 && !ev.shiftKey && plaque3d() && GLV && poser3d(ev)) return;
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
    if (VUE !== '3d' || !V3 || !(ev.target && ev.target.closest && ev.target.closest('#v3-scene')) || ev.target.closest('#v3-tnb')) return;
    ev.preventDefault();
    zoom3d(V3.zoom * (ev.deltaY < 0 ? 1.12 : 1 / 1.12));
  }, { passive: false });
  corps.addEventListener('dblclick', function(ev){
    if (VUE !== '3d' || !V3 || !(ev.target && ev.target.closest && ev.target.closest('#v3-scene')) || ev.target.closest('.v3-cam')) return;
    V3.pitch = 0.08; recentrer3d();
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
      relireDonnees().then(function(d){
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
    if (VUE === 'photo') { if (PH) clicPH(ev); return; }
    if (VUE === 'planche') { if (PL) clicPL(ev); return; }
    var b;
    if ((b = t.closest('[data-planche]'))) { ouvrirPlanche(b.getAttribute('data-planche'), 'biblio'); return; }
    if ((b = t.closest('[data-bonglet]'))) { ONGLETB = b.getAttribute('data-bonglet'); try { localStorage.setItem('sz-atelier-onglet', ONGLETB); } catch (e) {} dessiner(); return; }
    if ((b = t.closest('[data-plus]'))) {
      var pid = b.getAttribute('data-plus'), rc = b.getBoundingClientRect(), pm = (D.modeles || []).filter(function(x){ return x.id === pid; })[0];
      var l = window.szCtxEntrees(b) || [];
      // le menu « … » : les gestes qui ne sont pas déjà affichés sur la fiche
      l = l.filter(function(x){ return x.trait || x.dgr || x.lib === '${T("Dupliquer")}'; });
      if (pm && D.peutModifier) l.unshift({ lib: pm.verrouille ? '${T("Changer le NIP")}' : '${T("Protéger par NIP")}', fn: function(){ protegerModele(pid, pm.verrouille ? 'changer' : 'poser'); } });
      while (l.length && l[0].trait) l.shift();
      if (l.length) szCtxMenu(rc.right - 210, rc.bottom + 4, pm ? pm.nom : '', l);
      return;
    }
    if ((b = t.closest('[data-vueb]'))) { VUEB = b.getAttribute('data-vueb'); try { localStorage.setItem('sz-atelier-vue', VUEB); } catch (e) {} dessiner(); return; }
    if ((b = t.closest('[data-tri]'))) { var tk = b.getAttribute('data-tri'); TRI = { cle: tk, sens: TRI.cle === tk ? -TRI.sens : (tk === 'nom' || tk === 'ref' || tk === 'type' ? 1 : -1) }; dessiner(); return; }
    if ((b = t.closest('[data-nip]'))) { var gn = b.getAttribute('data-nip').split(':'); protegerModele(gn.slice(1).join(':'), gn[0]); return; }
    if ((b = t.closest('[data-protection]'))) { exporterPdfModele(b.getAttribute('data-protection'), 'protection', b); return; }
    if ((b = t.closest('[data-motif]'))) { ouvrirMotif(b.getAttribute('data-motif'), 'biblio'); return; }
    if ((b = t.closest('[data-v3]'))) { ouvrir3d(b.getAttribute('data-v3'), 'biblio'); return; }
    if ((b = t.closest('[data-imprimer]'))) { ouvrirImpression(b.getAttribute('data-imprimer'), 'biblio'); return; }
    if ((b = t.closest('[data-editer]'))) { ouvrirEditeur(b.getAttribute('data-editer')); return; }
    if ((b = t.closest('[data-cat]'))) { CAT = b.getAttribute('data-cat'); if (LEGER) { PG_PAGE = 0; charger(); } else dessiner(); return; }
    if ((b = t.closest('[data-etat]'))) { var e = b.getAttribute('data-etat'); ETAT = ETAT === e ? '' : e; if (LEGER) { PG_PAGE = 0; charger(); } else dessiner(); return; }
    if ((b = t.closest('[data-ouvrir]'))) { ouvrirModele(b.getAttribute('data-ouvrir')); return; }
    if ((b = t.closest('[data-dupl]'))) { dupliquer(b.getAttribute('data-dupl')); return; }
    if ((b = t.closest('[data-suppr]'))) { supprimer(b.getAttribute('data-suppr')); return; }
    if ((b = t.closest('[data-sel]'))) { SEL = b.getAttribute('data-sel'); pleinDe(SEL, function(){ dessiner(); }); return; }
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
    if (VUE === 'editeur' || VUE === 'impression' || VUE === '3d' || VUE === 'motif' || VUE === 'photo' || VUE === 'planche') return;
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-sel]') : null;
    if (b) ouvrirModele(b.getAttribute('data-sel'));
  });
  corps.addEventListener('input', function(ev){
    if (VUE === 'editeur' || VUE === 'impression' || VUE === '3d' || VUE === 'motif' || VUE === 'photo' || VUE === 'planche') return;
    var t = ev.target;
    if (t && t.id === 'a-q') { Q = t.value; clearTimeout(window._atQ); window._atQ = setTimeout(LEGER ? function(){ PG_PAGE = 0; charger(); } : redessinerSansPerdreLaSaisie, LEGER ? 250 : 200); return; }
    ramasser(t);
  });
  corps.addEventListener('change', function(ev){
    var t = ev.target; if (!t) return;
    if (VUE === 'editeur') { if (E) changeEditeur(t); return; }
    if (VUE === 'impression') { if (IMP) changeImpression(t); return; }
    if (VUE === '3d') { if (V3) change3d(t); return; }
    if (VUE === 'motif') { if (MO) changeMo(t); return; }
    if (VUE === 'photo') { if (PH) changePH(t); return; }
    if (VUE === 'planche') { if (PL) changePL(t); return; }
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
    if (t.closest('#v3-enreg')) { enregistrer3d(); return; }
    if (t.closest('#v3-fiche')) { ouvrirEnvoiFiche(); return; }
    if (t.closest('#v3-ia')) { ouvrirRenduIa(); return; }
    if (t.closest('#v3-annuler')) { annuler3d(); return; }
    if (t.closest('#e-3d')) { troisDDepuisEditeur(); return; }
    if (t.closest('#i-exporter')) { exporterFichier(t.closest('#i-exporter')); return; }
    if (t.closest('#i-dossier')) { if (P && P.ouvrirDossierExports) P.ouvrirDossierExports(); return; }
    if (t.closest('#e-annuler')) { annuler(); return; }
    if (t.closest('#e-refaire')) { refaire(); return; }
    if (t.closest('#e-enreg')) { enregistrerEditeur(t.closest('#e-enreg')); return; }
    if (t.closest('#m-editer')) { if (M && M.id && !TRACE) { var mid = M.id; M = null; ouvrirEditeur(mid); } return; }
    if (t.closest('#a-nouveau')) { ouvrirNeuf(); return; }
    if (t.closest('#a-photo')) { ouvrirPhoto(); return; }
    if (t.closest('#ph-retour')) { quitterPH(); return; }
    if (t.closest('#ph-creer')) { creerPH(); return; }
    if (t.closest('#pl-retour')) { quitterPL(); return; }
    if (t.closest('#pl-annuler')) { annulerPL(); return; }
    if (t.closest('#pl-enreg')) { enregistrerPL(); return; }
    if (t.closest('#pl-pdf')) { pdfPL(t.closest('#pl-pdf')); return; }
    if (t.closest('#m-retour')) { revenir(); return; }
    if (t.closest('#m-enreg')) { enregistrer(t.closest('#m-enreg')); return; }
  });

  function ouvrirNeuf(){ if (!D) return; M = modeleNeuf('robe'); TRACE = true; TAP = 'M'; TOUTES = false; PILEM = []; REFM = []; FLY = ''; VUE = 'modele'; dessiner(); var n = document.getElementById('m-nom'); if (n) n.focus(); }
  function ouvrirModele(id){
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (!m) { dire(MOTIFS.introuvable, 'err'); return; }
    SEL = id; M = copie(m); TRACE = false; TAP = m.tailleBase || 'M'; TOUTES = false; PILEM = []; REFM = []; FLY = ''; VUE = 'modele'; dessiner();
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
    if (VUE === 'planche' && PL) dessinerPlanche(); else if (VUE === 'photo' && PH) dessinerPhoto(); else if (VUE === 'motif' && MO) dessinerMo(); else if (VUE === '3d' && V3) dessiner3d(); else if (VUE === 'impression' && IMP) dessinerImpression(); else if (VUE === 'editeur' && E) dessinerEditeur(); else if (VUE === 'modele' && M) dessinerModele(); else dessinerBiblio();
  }
  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('a-q');
    var d0 = q ? q.selectionStart : null, f0 = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('a-q');
    if (q2) { q2.focus({ preventScroll: true }); try { if (d0 != null) q2.setSelectionRange(d0, f0); } catch (e) {} }
  }
  /* ── LE MODE LEGER (lot VOLUME 2) ── */
  function demandeLegere(){
    return { leger: true, page: PG_PAGE, parPage: 24, q: Q.trim(), categorie: CAT, etat: ETAT, sansArchive: !ETAT };
  }
  // La page legere ; les modeles deja lus EN ENTIER restent (ceux qu on touche), relus a leur version.
  function lireLeger(extra){
    var garder = LEGER && D ? (D.modeles || []).filter(function(m){ return !m.leger; }).map(function(m){ return m.id; }) : [];
    (extra || []).forEach(function(id){ if (id && garder.indexOf(id) < 0) garder.push(id); });
    return appelerBrut('atelier:donnees', [demandeLegere()]).then(function(r){
      if (!r || !r.ok || !r.leger) return r;
      r.ids = (r.modeles || []).map(function(m){ return m.id; });
      return Promise.all(garder.map(function(id){ return appelerBrut('atelier:modele', [id]); })).then(function(pl){
        pl.forEach(function(x){
          if (!x || !x.ok || !x.modele) return;
          var i = -1; (r.modeles || []).forEach(function(m, k){ if (m.id === x.modele.id) i = k; });
          if (i >= 0) r.modeles[i] = x.modele; else r.modeles.push(x.modele);
        });
        if (PRODS) r.produits = PRODS;
        return r;
      });
    });
  }
  function relireDonnees(extra){
    if (!LEGER) return appeler('atelier:donnees', []);
    return lireLeger(extra).then(function(r){ if (r && r.ok && r.leger) { PGA = r; PG_PAGE = r.page || 0; } return r; });
  }
  // Le modele ENTIER d un resume leger (ou absent de la page) ; le rappel recoit vrai s il est la.
  function pleinDe(id, fn){
    if (!LEGER || !id) { fn(true); return; }
    var m = (D.modeles || []).filter(function(x){ return x.id === id; })[0];
    if (m && !m.leger) { fn(true); return; }
    appelerBrut('atelier:modele', [id]).then(function(r){
      if (!r || !r.ok || !r.modele) { dire(expliquer(r), 'err'); fn(false); return; }
      var i = -1; (D.modeles || []).forEach(function(x, k){ if (x.id === id) i = k; });
      if (i >= 0) D.modeles[i] = r.modele; else (D.modeles = D.modeles || []).push(r.modele);
      fn(true);
    });
  }
  // Les produits CHERCHES (le menu du produit lie, le patron depuis une photo, l envoi a la fiche).
  function chercherProduits(q, fn){
    var lie = (M && M.produitId) || (PH && PH.produit) || (V3 && V3.m && V3.m.produitId) || '';
    Promise.all([appelerBrut('atelier:produits', [{ q: q || '', max: 20 }]),
      lie ? appelerBrut('atelier:produits', [{ id: lie, max: 1 }]) : Promise.resolve(null)]).then(function(rs){
      var l = (rs[0] && rs[0].ok) ? (rs[0].lignes || []) : [];
      var l2 = (rs[1] && rs[1].ok) ? (rs[1].lignes || []) : [];
      l2.forEach(function(p){ if (!l.some(function(x){ return x.id === p.id; })) l.unshift(p); });
      PRODS = l; if (D) D.produits = l;
      if (fn) fn(l);
    });
  }
  /* Un geste sur un modele encore LEGER (clic, double-clic, clic droit) : on lit le modele entier, puis
     on rejoue le geste — chaque fonction d ouverture trouve alors le modele complet, comme avant. */
  var ATTR_ID = ['data-sel', 'data-ouvrir', 'data-editer', 'data-plus', 'data-v3', 'data-planche', 'data-motif',
    'data-imprimer', 'data-protection', 'data-dupl', 'data-suppr', 'data-ctx-ligne'];
  function idDuGeste(t){
    if (!t || !t.closest) return '';
    for (var i = 0; i < ATTR_ID.length; i++) {
      var b = t.closest('[' + ATTR_ID[i] + ']');
      if (b) return b.getAttribute(ATTR_ID[i]) || '';
    }
    var n = t.closest('[data-nip]');
    return n ? n.getAttribute('data-nip').split(':').slice(1).join(':') : '';
  }
  ['click', 'dblclick', 'contextmenu'].forEach(function(type){
    corps.addEventListener(type, function(ev){
      if (!LEGER || VUE !== 'biblio' || ev.__szRejoue) return;
      var id = idDuGeste(ev.target);
      var m = id && D ? (D.modeles || []).filter(function(x){ return x.id === id; })[0] : null;
      if (!m || !m.leger) return;
      ev.preventDefault(); ev.stopPropagation();
      var cible = ev.target, x = ev.clientX, y = ev.clientY;
      pleinDe(id, function(ok){
        if (!ok || !cible.isConnected) { if (ok) dessiner(); return; }
        var e2 = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: type === 'contextmenu' ? 2 : 0 });
        e2.__szRejoue = true;
        cible.dispatchEvent(e2);
      });
    }, true);
  });
  // La recherche d un produit (mode leger) : temporisee, le menu se regarnit sur place.
  document.addEventListener('input', function(ev){
    var t = ev.target; if (!t || !t.getAttribute || !t.getAttribute('data-prodq')) return;
    var sid = t.getAttribute('data-prodq');
    clearTimeout(MINU_PQ);
    MINU_PQ = setTimeout(function(){
      chercherProduits(t.value.trim(), function(l){
        var sel = document.getElementById(sid); if (!sel) return;
        var v = sel.value;
        var avecPhoto = sid === 'ph-produit';
        sel.innerHTML = '<option value="">' + (avecPhoto ? '${T("— Choisir un produit —")}' : '${T("— Aucun —")}') + '</option>'
          + l.filter(function(p){ return !avecPhoto || (p.photos || []).length; }).map(function(p){
              return '<option value="' + esc(p.id) + '"' + (p.id === v ? ' selected' : '') + '>' + esc(p.nom) + '</option>'; }).join('');
      });
    }, 250);
  }, true);
  window.szPagesCoeur.atelier = function(page){ PG_PAGE = Math.max(0, page); charger(); };

  function charger(apres){
    var dem = (LEGER || PGA === null) ? lireLeger(SEL ? [SEL] : []) : appeler('atelier:donnees', []);
    dem.then(function(r){
      if (r && r.ok && !r.leger && !LEGER && PGA === null) { PGA = false; }   // site ancien : la liste entiere
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="vide"><strong>${T("Atelier indisponible")}</strong><div style="margin-top:.4rem">' + esc(expliquer(r)) + '</div></div>';
        dire(expliquer(r), 'err'); return;
      }
      LEGER = !!r.leger;
      if (LEGER) { PGA = r; PG_PAGE = r.page || 0; if (!PRODS) chercherProduits('', null); }
      D = r;
      if (SEL && !(D.modeles || []).some(function(m){ return m.id === SEL; })) SEL = '';
      if (DEPART === 'nouveau' && D.peutAjouter) { DEPART = ''; ouvrirNeuf(); }
      else if (DEPART.indexOf('editeur:') === 0) { var de = DEPART.slice(8); DEPART = ''; pleinDe(de, function(){ ouvrirEditeur(de); }); }
      else if (DEPART.indexOf('impression:') === 0) { var di = DEPART.slice(11); DEPART = ''; pleinDe(di, function(){ ouvrirImpression(di, 'biblio'); }); }
      else if (DEPART.indexOf('3d:') === 0) { var d3 = DEPART.slice(3); DEPART = ''; pleinDe(d3, function(){ ouvrir3d(d3, 'biblio'); }); }
      else if (DEPART === 'photo' && D.peutAjouter) { DEPART = ''; ouvrirPhoto(); }
      else if (DEPART === 'liste') { DEPART = ''; VUEB = 'liste'; SEL = ((D.modeles || [])[0] || {}).id || ''; dessiner(); }
      else if (DEPART.indexOf('planche:') === 0) { var dp = DEPART.slice(8); DEPART = ''; pleinDe(dp, function(){ ouvrirPlanche(dp, 'biblio'); }); }
      else if (DEPART.indexOf('motif:') === 0) { var dm = DEPART.slice(6); DEPART = ''; pleinDe(dm, function(){ ouvrirMotif(dm, 'biblio'); }); }
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
