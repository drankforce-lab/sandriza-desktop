'use strict';

/*
 * ASSISTANT « PRODUIT » — NATIF, SEPT ÉTAPES
 * =============================================================================
 * La réécriture fidèle de l'éditeur de produit : identité, classement, tailles
 * et couleurs, prix et poids, photo, détails, stock. Écrit ici, aucune page du
 * site chargée, aucun appel web.
 *
 * ⚠ L'ENREGISTREMENT PASSE PAR `Admin._pfDoSave`, LA MÊME FONCTION QUE L'ÉDITEUR
 * DU SITE. Elle prend ses données en paramètre — elle ne lit pas le DOM — donc la
 * fenêtre native peut s'en servir telle quelle. C'est ce qui garantit que la
 * détection de conflit, le dépôt des images vers R2 et le ménage des images
 * orphelines se comportent EXACTEMENT pareil selon la fenêtre d'où l'on part.
 * Réécrire tout cela ici aurait créé une seconde façon d'enregistrer un produit,
 * qui aurait dérivé de la première au premier ajustement.
 *
 * ⚠ CE QUI N'EST PAS ICI, ET POURQUOI.
 * L'aperçu boutique de l'éditeur du site est la fiche RÉELLE, dessinée par les
 * feuilles de style de la boutique. Le reproduire ici en ferait une IMITATION —
 * et une imitation qui diverge est pire qu'aucun aperçu, parce qu'on y croit.
 * ⚠⚠ CE PARAGRAPHE A ÉTÉ CORRIGÉ LE 2026-08-20 : il disait le contraire de la
 * réalité depuis des semaines, et la déclaration de couverture le répétait.
 * L'APERÇU BOUTIQUE EST ICI, et ce n'est pas une imitation : le SITE le dessine
 * (`produit:apercu` → `Admin._pfApercuHtml` → `Shop.renderProductCard`), règles
 * CSS vivantes comprises. La génération par IA, le détourage et la teinte sont
 * ici aussi (`produit:photoIa` / `detourer` / `teinter`) : c'est toujours le site
 * qui appelle les services, avec ses clés — aucune clé ne traverse le pont — mais
 * le geste part d'ici. Il ne reste AUCUN renvoi vers l'éditeur du site.
 *
 * ⚠ LE COIN DROIT DE L'EN-TÊTE EST RÉSERVÉ AU VERROU, et à rien d'autre.
 */

const { CSS_SOCLE, CSS_JOUR, CSS_FICHE, JS_SOCLE, ICO, TETE, LIEU, JS_BORNER, SEP_DEC } = require('./socle');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('produit');

const CSS_PROPRE = `
/* ══ LA NOUVELLE REFONTE (2026-09-30, sa demande : « refaire aussi les ajouts
   de produit en nouvelle refonte ») ═════════════════════════════════════════
   ① LE VOLET « FICHE », a droite de chaque etape : la photo principale, le nom,
   le prix et la marge, les tailles, les couleurs, le stock, la visibilite — et
   ce qui MANQUE pour enregistrer. Les etapes 2 et 4 laissaient la moitie de la
   fenetre vide ; on y voit maintenant le produit se construire, et on sait a
   tout moment pourquoi « Enregistrer » refuserait.
   ② L ETAPE 1 TIENT ENTIERE : la rangee Etiquette / Fournisseur passait sous le
   pied de la fenetre, sans barre pour l atteindre. */
/* L etape 1 : Identification en quatre colonnes, Classement en trois. */
/* ⚠ ETAPE 3 DU PLAN DE LISIBILITE (2026-10-11) : quatre colonnes tassaient le nom, la
   categorie et le SKU sur une ligne et laissaient 170 px vides sous les cartes. Trois
   colonnes (nom sur deux, puis marque / poids / SKU), la description sur toute la largeur,
   des ecarts plus francs, et le Classement et le Prix a la meme hauteur. Mesure a
   1400 x 833 : tout tient, sans barre. */
/* ══ L'ÉDITEUR REFAIT (2026-10-26, sa demande : « vraiment moderne, avec champs dynamiques » — direction A des
   esquisses) ══
   ① L'ÉTIQUETTE DANS LE CHAMP : le libellé se pose en petit dans le haut du cadre, la saisie dessous — un champ
     se lit d'un seul bloc, et la grille respire. Seuls les champs simples (étiquette puis saisie) le prennent.
   ② Des PASTILLES au lieu d'un menu pour les choix courts (genre, groupe d'âge) : le menu reste dans la page,
     caché, et c'est toujours lui qu'on lit et qu'on enregistre (crochets p-genre, p-age gardés).
   ③ Le prix soldé ne paraît que si l'on met en solde ; la marge se lit sur une barre.
   ④ Aucune bulle ni texte d'aide (sa demande) : l'écran dit ce qu'il fait par ce qu'il montre. */
.etape .ch:has(>label:first-child + :is(input:not([type=checkbox]):not([type=radio]),select,textarea,.paire)){position:relative;gap:0}
.etape .ch:has(>label:first-child + :is(input:not([type=checkbox]):not([type=radio]),select,textarea,.paire))>label:first-child{
  position:absolute;top:.5rem;left:.95rem;right:.95rem;z-index:1;margin:0;font-size:.68rem;font-weight:600;letter-spacing:.01em;
  color:var(--tx2);pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.etape .ch:has(>label:first-child + :is(input:not([type=checkbox]):not([type=radio]),select,textarea,.paire)):focus-within>label:first-child{color:var(--tx-or)}
.etape .ch>label:first-child + input:not([type=checkbox]):not([type=radio]),.etape .ch>label:first-child + select,
.etape .ch>label:first-child + textarea,.etape .ch>label:first-child + .paire input,.etape .ch>label:first-child + .paire select{
  padding-top:1.5rem!important;padding-bottom:.5rem!important;min-height:3.35rem;border-radius:12px!important;font-size:.95rem}
.etape .ch>label:first-child + select{background-position:right .8rem top 1.55rem!important}
.prixgrille{grid-template-rows:auto!important;align-items:start}
.prixgrille .ch{display:flex!important;grid-row:auto!important}
.carte{border-radius:16px}
.carte>h2{font-size:.95rem;letter-spacing:0;text-transform:none;font-weight:650;color:var(--tx)}
.etape label[data-cpt]::after{content:attr(data-cpt);float:right;font-weight:400;color:var(--tx2)}
.pf-puces{display:flex;flex-wrap:wrap;gap:.35rem;padding-top:1.55rem}
.pf-puces button{height:2.05rem;padding:0 .7rem;font-size:.8rem!important;border-radius:99px;border:1px solid var(--v16);background:transparent;color:var(--tx2);font-size:.84rem}
.pf-puces button.on{background:rgba(var(--or-rgb),.16);border-color:var(--or);color:var(--tx);font-weight:600}
.ch.a-puces{position:relative}
.ch.a-puces>select{display:none}
.ch.a-puces>label:first-child{position:absolute;top:.2rem;left:.1rem;font-size:.68rem;font-weight:600;color:var(--tx2)}
.pf-sw{margin-top:.8rem;padding-top:.75rem;border-top:1px solid var(--v08)}
.sans-solde .prixgrille .ch:has(#p-solde),.sans-solde #p-rabais{display:none!important}
.sans-solde .prixgrille{grid-template-columns:repeat(2,1fr)!important}
.pf-marge-barre{height:.45rem;border-radius:99px;background:var(--v10);overflow:hidden;margin-top:.4rem}
.pf-marge-barre i{display:block;height:100%;border-radius:99px;background:#6fae73}
.pf-marge-barre i.perte{background:var(--tx-err)}
.pf-ia{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-top:.5rem}
.pf-ia .ed-seg button{height:1.85rem;font-size:.78rem;padding:0 .75rem}
/* L'étape Photos (2026-10-26) : la principale en GRAND à gauche ; à droite, l'aperçu 3D EN HAUT (sa demande), puis les
   autres photos. */
/* (2026-10-26, sa capture : « prends toute l'espace de haut en bas et agrandis les photos en conséquence ») La carte
   Photos REMPLIT l'étape, et ajusterPhotos() calcule la taille des cases d'après la place réelle : la principale prend
   la hauteur, les autres cases la plus grande taille qui tient sans rien couper (variables --pv-*). */
.carte.pf-photos{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}
.carte.pf-photos>.ligne-photos{flex:1 1 auto;min-height:0}
.ligne-photos{display:grid!important;grid-template-columns:var(--pv-main-w,15.5rem) minmax(0,1fr);column-gap:1.3rem;row-gap:.8rem;align-items:start;align-content:start}
.ligne-photos>.vue-principale{grid-column:1;grid-row:1 / span 4;width:auto}
.ligne-photos>:not(.vue-principale){grid-column:2}
.ligne-photos .vue-principale .vign{width:var(--pv-main-w,15.5rem);height:var(--pv-main-h,19.5rem);border-radius:16px}
.ligne-photos .vue-principale .mini-decor{width:100%}
.pf-3d{margin:0;padding:.75rem .9rem;border-radius:14px;background:var(--v03);border:1px solid var(--v08)}
.pf-3d .pf-med-l{margin:0}
.pf-cab{margin-bottom:.6rem}
.pf-cab .t{font-weight:700;font-size:.85rem;margin-bottom:.3rem}
.pf-cab .cab-l{font-size:.78rem;color:var(--tx2);margin:.2rem 0}
.pf-cab .cab-l b{color:var(--tx)}
.pf-cab .cab-a{display:flex;gap:.3rem;flex-wrap:wrap;margin:.4rem 0}
.pf-cab .cab-a span{font-size:.7rem;padding:.05rem .5rem;border-radius:99px;background:var(--v06);color:var(--tx2)}
.pf-cab .cab-a span.ok{background:rgba(74,222,128,.14);color:var(--tx-ok)}
html.jour .pf-cab .cab-a span.ok{color:#1f6b3d}
.pf-cab .cab-a span.cours{color:var(--tx-att)}
.pf-cab .cab-a span.rate{color:var(--tx-err,#e5484d)}
.pf-id{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.95rem 1.1rem}
.pf-id .l2{grid-column:span 2}
.pf-id .l4{grid-column:1 / -1}
.pf-id #p-desc{min-height:4.6rem}
.pf-cl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.95rem 1.1rem}
.cote.pf-bas{align-items:stretch}
.cote.pf-bas .prixgrille{gap:.95rem 1.1rem}
/* La carte « Médias » (2026-10-07) : le mannequin sur une rangée de trois, puis
   la vidéo et la vue 360 chacune sur sa ligne, avec leur bouton de retrait. */
.pf-med{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem .75rem}
.pf-med-l{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:.65rem}
.pf-med-l video{height:96px;max-width:170px;border-radius:8px;background:#000}
html.jour .pf-med-l video{background:#1d2433}
/* ⚠ LA CARTE NE SE TASSE PAS (2026-10-18) : « plein » la laisse rétrécir dans l'étape, et 36 vues 360° plus la ligne
   de génération débordaient de son cadre. Elle prend la hauteur de son contenu ; c'est l'étape qui défile. */
#p-med-carte{flex:0 0 auto}
/* LA BARRE D'ÉTAPES DE L'APERÇU 3D (2026-10-18, sa demande : « chaque étape cochée, l'étape en cours et sa durée »). */
#p-3dg-etapes{list-style:none;margin:.55rem 0 0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem .45rem}
#p-3dg-etapes li{display:flex;align-items:center;gap:.35rem;font-size:.75rem;color:var(--tx2);
  padding:.2rem .55rem;border-radius:99px;border:1px solid var(--v12);background:var(--v05)}
#p-3dg-etapes li .m{font-weight:700;min-width:1em;text-align:center}
#p-3dg-etapes li .d{color:var(--tx3);font-variant-numeric:tabular-nums}
#p-3dg-etapes li.cours{border-color:var(--or);color:var(--tx)}
#p-3dg-etapes li.fait{color:var(--tx)}
#p-3dg-etapes li.fait .m{color:var(--tx-ok)}
#p-3dg-etapes li.err{border-color:var(--tx-err);color:var(--tx-err)}
#p-3dg-etapes li.attente{border-color:var(--tx-att);color:var(--tx-att)}
/* LE VERROU DES PHOTOS PENDANT UNE GÉNÉRATION (2026-10-18) : ni ajout, ni retrait, ni déplacement de photo jusqu'à
   la fin ; le reste de la fiche reste modifiable. Le serveur refuse de toute façon (gen_photos_garde) : l'écran le
   montre AVANT, pour qu'on ne fasse pas un geste qui serait refusé à l'enregistrement. */
.p-verrou-photos{display:none;margin:0 0 .6rem;padding:.45rem .7rem;border-radius:9px;font-size:.8rem;
  border:1px solid rgba(var(--or-rgb),.55);background:rgba(var(--or-rgb),.10);color:var(--tx)}
html.photos-verrou .p-verrou-photos{display:block}
html.photos-verrou .ligne-photos,html.photos-verrou #p-parcoul,html.photos-verrou #p-cv-gen,
html.photos-verrou #p-360-choisir,html.photos-verrou #p-360-retirer,html.photos-verrou #p-360-bande{pointer-events:none;opacity:.55}
#p-360-bande{display:flex;gap:4px;flex-wrap:wrap;margin-top:.4rem}
#p-360-bande img{width:40px;height:52px;object-fit:cover;border-radius:5px;border:1px solid var(--v22)}
.cote.pf-bas{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)}
/* Composition et entretien (2026-10-11) : les consignes en cases, par groupe, le pictogramme
   de la boutique a cote (il vient du site par le pont, avec la liste). */
.ent-modeles{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin:.7rem 0 .7rem}
.ent-modeles .aide{margin-right:.15rem;font-weight:600}
.ent-seg{display:inline-flex;border:1px solid var(--v12);border-radius:10px;overflow:hidden}
.ent-seg button{border:0;border-radius:0;background:transparent;padding:.42rem .8rem;font-size:.8rem}
.ent-seg button+button{border-left:1px solid var(--v12)}
.ent-seg button:hover{background:var(--v05)}
.ent-seg button.on{background:rgba(var(--or-rgb),.18);color:var(--tx);font-weight:700}
.ent-vider{font-size:.78rem}
/* En colonnes (et non en grille) : les groupes se tassent l un sous l autre — « Lavage » et ses neuf
   consignes ne laissent plus un trou sous « Javellisant », et l etape tient dans l ecran. */
#p-ent{columns:3 250px;column-gap:.7rem}
.ent-groupe{border:1px solid var(--v10);border-radius:11px;padding:.5rem .55rem .45rem;background:var(--v03);break-inside:avoid;margin:0 0 .7rem;display:inline-block;width:100%;box-sizing:border-box}
.ent-groupe h3{display:flex;justify-content:space-between;align-items:center;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);margin:0 0 .35rem;padding:0 .2rem;font-weight:700}
.ent-groupe h3 .n{font-size:.7rem;letter-spacing:0;text-transform:none;font-weight:700;color:var(--tx);background:rgba(var(--or-rgb),.2);border-radius:999px;padding:.05rem .45rem}
.ent-grille{display:flex;flex-direction:column;gap:2px}
.ent-grille label{display:flex;align-items:center;gap:.5rem;font-size:.8rem;line-height:1.2;cursor:pointer;padding:.22rem .35rem;border-radius:7px;border:1px solid transparent;min-width:0}
.ent-grille label span{min-width:0;overflow-wrap:anywhere}
.ent-grille label:hover{background:var(--v05)}
.ent-grille label.on{background:rgba(var(--or-rgb),.13);border-color:rgba(var(--or-rgb),.45)}
.ent-grille svg{width:20px;height:20px;flex:0 0 auto;color:var(--tx2)}
.ent-grille label.on svg{color:var(--tx)}
.ent-grille input{margin:0;flex:0 0 auto;accent-color:var(--or)}
#p-ent-carte .ent-haut{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 .9rem}
#p-ent-carte .ent-haut .ch{margin:0}
#p-ent-autre{min-height:0;height:2.45rem;resize:vertical}
/* L ajustement du modele, sous les tailles (2026-10-07). */
.pf-aj{margin-top:.7rem;max-width:30rem}
.pf-aj .aide .mini{margin-left:.4rem}
/* Les tailles : de vraies touches, pas des pastilles de 1,75 rem. */
#p-tailles .jeton{height:2.4rem;min-width:3.1rem;justify-content:center;font-weight:700;border-radius:10px;font-size:.88rem}
#p-tailles .jeton.on{background:var(--or);border-color:var(--or);color:#1a1208}
/* Un emplacement de photo vide DIT qu il attend : un signe plus, pas un mot seul. */
.vue .cadre:not(.pleine)::before{content:'+';display:block;font-size:1.5rem;line-height:1;color:var(--tx3);margin-bottom:.15rem}
.vue .cadre:not(.pleine){flex-direction:column}
.ligne-photos .lgd-principale{text-transform:none;letter-spacing:0;font-size:.72rem}
.jetons{display:flex;flex-wrap:wrap;gap:.35rem;align-content:flex-start;
  flex:1 1 auto;min-height:0;overflow:hidden}
.jeton{display:inline-flex;align-items:center;gap:.32rem;padding:.2rem .55rem;
  border:1px solid var(--v16);border-radius:99px;font-size:.82rem;
  cursor:pointer;user-select:none;height:1.75rem}
.jeton.on{background:rgba(var(--or-rgb),.18);border-color:var(--or);color:var(--tx-f0e4d2)}
.jeton .pt{width:10px;height:10px;border-radius:50%;border:1px solid var(--v30);flex:0 0 auto}
.photo{display:flex;gap:.85rem;align-items:flex-start}
/* ── LA LIGNE UNIQUE DES PHOTOS (fusion demandee le 2026-08-08) ──
   Principale et secondaires cote a cote ; la principale se reconnait a son
   contour PLEIN or et a son libelle, les secondaires restent en POINTILLE
   meme remplies. Tout se glisse : une secondaire deposee sur la principale
   prend sa place (l ancienne descend dans la ligne). */
.ligne-photos{display:flex;gap:.7rem;align-items:flex-start;flex-wrap:wrap}
.vue-principale{flex:0 0 auto;width:160px}
/* ⚠ STYLE COMPLET, pas un simple habillage : la vignette vivait dans .photo
   et ses regles (centrage flex, couleurs, curseur) etaient prefixees .photo —
   sortie du conteneur a la fusion, elle avait tout perdu et << aucune photo >>
   collait au coin (2026-08-08). */
.ligne-photos .vign{position:relative;width:160px;height:160px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;color:var(--tx2);
  font-size:.75rem;overflow:hidden;text-align:center;cursor:pointer;
  background:var(--f-0f1826);border:2px solid var(--or)}
.ligne-photos .vign:hover{border-color:var(--or-clair)}
.ligne-photos .vign img{width:100%;height:100%;object-fit:cover}
.lgd-principale{font-size:.6875rem;color:var(--tx-or);text-align:center;margin-top:.22rem;
  font-weight:700;text-transform:uppercase;letter-spacing:.04em}
#p-vues .vue .cadre{width:100%;height:160px}
#p-vues .cadre.pleine{border-style:dashed;border-color:var(--v40)}
.cadre.survol,.vign.survol{outline:3px solid #4ade80;outline-offset:2px}
/* Pendant le glisser (2026-10-18) : la case qu on tire s estompe, la case visee dit ce que le depot va faire. */
#p-vues .cadre{position:relative}
.cadre.tire,.vign.tire{opacity:.38}
.cadre.survol[data-geste]::after,.vign.survol[data-geste]::after{content:attr(data-geste);position:absolute;left:50%;bottom:8px;
  transform:translateX(-50%);padding:.22rem .6rem;border-radius:99px;background:#14532d;color:var(--tx-sur-accent);font-size:.72rem;
  font-weight:700;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.35)}
/* Les gestes au clavier : ‹ ⇤ › au pied de la case, visibles au survol et au foyer. */
.vue .depl{position:absolute;left:0;right:0;bottom:calc(1.25rem + 8px);display:flex;justify-content:center;gap:4px;
  opacity:0;transition:opacity .12s}
.vue:hover .depl,.vue .depl:focus-within{opacity:1}
.vue .depl button{width:26px;height:24px;padding:0;border-radius:7px;font-size:.85rem;line-height:1;font-weight:700;
  background:rgba(12,18,28,.86);border:1px solid var(--v28);color:var(--tx-blanc)}
.vue .depl button:hover:not(:disabled){background:var(--or);border-color:var(--or);color:#1a1208}
.vue .depl button:focus-visible{outline:2px solid var(--or);outline-offset:1px}
.vue .depl button:disabled{opacity:.35;cursor:default}
html.jour .cadre.survol[data-geste]::after,html.jour .vign.survol[data-geste]::after{background:#166534;color:var(--tx-sur-accent)}
html.jour .vue .depl button{background:rgba(255,255,255,.92);color:#1d2433;border-color:rgba(29,36,51,.25)}
.mini-decor{display:block;width:100%;margin-top:.3rem;font-size:.72rem;
  padding:.14rem .3rem;border-radius:7px;border:1px solid var(--v16);
  background:var(--v05);color:var(--tx);cursor:pointer}
.mini-decor:hover:not(:disabled){border-color:var(--or)}
.mini-decor:disabled{opacity:.35;cursor:default}
/* Le gros plan sur la fibre (2026-10-17) */
.gp-deux{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin:.6rem 0}
.gp-photo{position:relative;border-radius:10px;overflow:hidden;background:var(--f-0f1826);cursor:crosshair;align-self:start}
.gp-photo img{display:block;width:100%;height:auto}
.gp-cadre{position:absolute;border:2px solid #F59E0B;box-shadow:0 0 0 9999px rgba(0,0,0,.35);pointer-events:none}
.gp-res{border-radius:10px;overflow:hidden;background:var(--f-0f1826);aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;color:var(--tx2);font-size:.8rem;text-align:center}
.gp-res .vu{width:100%;height:100%;background-repeat:no-repeat}
.gp-res img{display:block;width:100%;height:100%;object-fit:cover}
.gp-lgd{font-size:.74rem;color:var(--tx2);margin-top:.25rem}
.gp-ia{display:flex;align-items:center;gap:.45rem;font-size:.82rem;margin:.2rem 0 .4rem}
.gp-modes{display:flex;flex-direction:column;gap:.15rem;margin:.3rem 0 .4rem}
.gp-modes .gp-ia{margin:0}
.fonds{display:flex;gap:.4rem;flex-wrap:wrap;margin:.5rem 0}
.fonds button{display:inline-flex;align-items:center;gap:.35rem;font-size:.76rem;
  padding:.2rem .5rem;border-radius:99px;border:1px solid var(--v18);
  background:var(--v05);color:var(--tx);cursor:pointer}
.fonds button.on{border-color:var(--or);background:rgba(var(--or-rgb),.18);color:var(--tx-f0e4d2)}
.fonds .past{width:12px;height:12px;border-radius:50%;border:1px solid rgba(0,0,0,.3);flex:0 0 auto}
.modeles{display:flex;gap:.45rem;flex-wrap:wrap;margin:.4rem 0}
.modeles .md{width:64px;cursor:pointer;text-align:center}
.modeles .md .cd{height:84px;border-radius:7px;overflow:hidden;
  border:2px solid var(--v16)}
.modeles .md.on .cd{border-color:var(--or)}
.modeles .md img{width:100%;height:100%;object-fit:cover;display:block}
.modeles .md .nm{font-size:.6875rem;color:var(--tx2);white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;margin-top:.1rem}
[draggable=true]{cursor:grab}
.photo .vign{position:relative;flex:0 0 auto;width:172px;height:172px;border-radius:10px;
  border:1px dashed var(--v18);display:flex;align-items:center;
  justify-content:center;color:var(--tx2);font-size:.75rem;overflow:hidden;text-align:center;
  cursor:pointer;background:var(--f-0f1826)}
.photo .vign:hover{border-color:var(--or)}
.photo .vign.pleine{border-style:solid;border-color:var(--v22)}
.photo .vign img{width:100%;height:100%;object-fit:cover}
.photo .cmd{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:.45rem}
#p-coul-sug{position:absolute;top:100%;left:0;right:5.5rem;z-index:40;margin-top:2px;
  background:var(--f-carte);border:1px solid var(--v14);border-radius:9px;
  box-shadow:0 10px 28px rgba(0,0,0,.45);max-height:230px;overflow-y:auto;display:none}
#p-coul-sug.on{display:block}
#p-coul-sug .s{display:flex;align-items:center;gap:.5rem;padding:.3rem .55rem;cursor:pointer;font-size:.85rem}
#p-coul-sug .s:hover,#p-coul-sug .s.vis{background:rgba(var(--or-rgb),.16)}
#p-coul-sug .s .pt{width:16px;height:16px;border-radius:50%;flex:0 0 auto;
  border:1px solid var(--v25)}
#p-coul-sug .s .deja{margin-left:auto;font-size:.72rem;color:var(--tx2);flex:0 0 auto}
.jeton .x{margin-left:.15rem;opacity:.55}
.jeton:hover .x{opacity:1}
.vues{display:flex;flex-wrap:wrap;gap:.5rem;align-content:flex-start;overflow:hidden}
.vue{position:relative;width:88px;flex:0 0 auto}
.vue .cadre{width:88px;height:88px;border-radius:9px;border:1px dashed var(--v18);
  display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;
  background:var(--f-0f1826);color:var(--tx2);font-size:.6875rem;text-align:center;padding:.2rem}
.vue .cadre:hover{border-color:var(--or)}
.vue .cadre.pleine{border-style:solid;border-color:var(--v22)}
/* Photo de couleur OBLIGATOIRE encore vide (2026-10-09) : le contour or la signale. */
.vue .cadre.requise{border-color:var(--or);color:var(--tx2)}
.vue img{width:100%;height:100%;object-fit:cover}
/* Mesures du vêtement (7.13.0, refaites le 2026-10-20) : les cartes ne se compriment plus
   (c est ce qui faisait déborder le tableau de sa carte), cases étroites avec leur unité. */
#p-mesv-carte,#p-ent-carte{flex:0 0 auto}
.mesv-barre{display:flex;flex-wrap:wrap;align-items:flex-end;gap:.6rem 1rem;margin-bottom:.9rem}
.mesv-barre .mv-ch{display:flex;flex-direction:column;gap:.25rem}
.mesv-barre label{font-size:.74rem;color:var(--tx2);font-weight:600;margin:0}
#p-mesv-type{width:16.5rem;min-width:0}
#p-mesv-t{width:7rem;min-width:0}
.mesv-barre .esp{flex:1 1 auto}
.mesv-cadre{border:1px solid var(--v10);border-radius:11px;overflow-x:auto;overflow-y:hidden}
table.mesv{width:100%;border-collapse:collapse;font-size:.84rem;font-variant-numeric:tabular-nums;table-layout:fixed}
table.mesv col.c-t{width:5.5rem}
table.mesv thead th{text-align:left;vertical-align:bottom;padding:.6rem .8rem .5rem;border-bottom:1px solid var(--v10);background:var(--v05)}
html table.mesv thead th:first-child{background-image:none}
table.mesv thead th b{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx);font-weight:700}
table.mesv thead th small{display:block;font-size:.7rem;color:var(--tx2);font-weight:400;margin-top:.12rem;line-height:1.25;letter-spacing:0;text-transform:none;white-space:normal}
table.mesv tbody th{padding:.32rem .8rem;text-align:left;background:transparent}
table.mesv tbody th span{display:inline-flex;align-items:center;justify-content:center;min-width:2.4rem;height:1.8rem;padding:0 .5rem;border-radius:8px;border:1px solid var(--v12);font-weight:700;font-size:.8rem}
table.mesv tbody tr.mv-ref th span{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
table.mesv td{padding:.32rem .8rem}
table.mesv tbody tr+tr th,table.mesv tbody tr+tr td{border-top:1px solid var(--v05)}
.mv-cm{display:inline-flex;align-items:center;border:1px solid var(--v12);border-radius:8px;overflow:hidden;max-width:100%}
.mv-cm:focus-within{border-color:var(--or)}
table.mesv .mv-cm input{width:4.2rem;height:auto;min-height:0;border:0;border-radius:0;background:transparent;text-align:right;padding:.34rem .3rem;box-shadow:none}
.mv-cm i{font-style:normal;font-size:.72rem;color:var(--tx3,var(--tx2));padding:0 .55rem 0 .15rem}
/* Une case COMPLÉTÉE par la gradation : pointillée et en italique — on voit ce qui a été mesuré. */
.mv-cm.grad{border-style:dashed}
.mv-cm.grad input{font-style:italic;color:var(--tx2)}
.stm-voile{z-index:60}
.stm-boite{max-width:58rem!important;width:min(58rem,calc(100vw - 2rem))}
.stm-tete{display:flex;align-items:center;justify-content:space-between;gap:.6rem}
.stm-boite .stm-tete h3{margin:0 7rem .2rem 0;color:var(--tx)}
.stm-x{border:0;background:transparent;font-size:1rem;padding:.2rem .5rem;color:var(--tx2)}
.stm-titre{margin:.75rem 0 .35rem;font-size:.74rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);font-weight:700}
.stm-photos{display:flex;gap:.8rem}
.stm-photo{width:12rem;border:1px dashed var(--v22);border-radius:12px;padding:.5rem;display:flex;flex-direction:column;gap:.4rem}
.stm-photo.on{border-style:solid;border-color:var(--or)}
.stm-vign{aspect-ratio:3/4;border-radius:9px;background:var(--v05);display:flex;align-items:center;justify-content:center;overflow:hidden;color:var(--tx2);font-size:.8rem;text-align:center;padding:.3rem}
.stm-vign img{width:100%;height:100%;object-fit:contain}
.stm-photo label{display:flex;align-items:center;gap:.35rem;cursor:pointer}
.stm-etat{font-size:.78rem;color:var(--tx2)}
.stm-voies{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}
.stm-voie{display:flex;flex-direction:column;align-items:flex-start;gap:.2rem;text-align:left;padding:.6rem .75rem;border-radius:11px;white-space:normal}
.stm-voie span{font-size:.76rem;color:var(--tx2);font-weight:400}
.stm-voie.on{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
.stm-regl{display:flex;flex-wrap:wrap;gap:1rem;margin-top:.7rem;font-size:.84rem}
.stm-desc{display:flex;flex-direction:column;gap:.3rem;margin-top:.7rem;font-size:.82rem}
.stm-desc textarea{min-height:0;resize:vertical}
.stm-sourire{display:flex;align-items:center;gap:.4rem;color:var(--tx)}
.stm-defr{margin-top:.7rem;font-size:.85rem}.stm-defr .aide{margin:0}
.stm-regl label{display:flex;align-items:center;gap:.45rem}
/* Une section MODIFIÉE depuis l ouverture : un point dans son onglet, jusqu à l enregistrement. */
#pas button.modif .n{box-shadow:0 0 0 2px var(--or)}
#pas button.modif::after{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--or);margin-left:.4rem;vertical-align:middle}
.mesv-pages{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;margin-top:.5rem;font-size:.8rem;color:var(--tx2)}
.mesv-note{margin-top:.55rem;display:flex;flex-wrap:wrap;gap:.3rem 1rem}
.mesv-note .lg{display:inline-flex;align-items:center;gap:.35rem}
.mesv-note .lg i{display:inline-block;width:1.4rem;height:.85rem;border:1px dashed var(--v22);border-radius:4px}
.mesv-auto{display:flex;gap:.9rem;align-items:center;border:1px solid var(--v10);border-radius:11px;padding:.5rem .8rem .5rem .5rem;margin:0 0 .8rem;background:var(--v03)}
.mesv-auto.mv-vide{display:block;padding:.55rem .8rem}
.mesv-auto canvas{flex:0 0 auto;border-radius:8px;border:1px solid var(--v12);height:84px;width:auto}
.mesv-auto-txt{min-width:0;flex:1 1 auto}
.mesv-auto-txt b{display:flex;align-items:center;gap:.4rem;font-size:.84rem;margin-bottom:.15rem}
.mesv-auto-txt b .ok{color:var(--tx-ok)}
.mesv-auto-txt .aide b.att{display:inline;font-size:inherit;color:var(--tx)}
.mesv-auto-act{flex:0 0 auto}
.mv-boite{max-width:62rem!important}
.mv-barre{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;margin-bottom:.5rem;font-size:.82rem}
.mv-q{font-weight:600;color:var(--tx)!important}
.mv-zone{max-height:62vh;overflow:auto;border:1px solid var(--v10);border-radius:9px;background:#000;display:flex;justify-content:center}
html.jour .mv-zone{background:#e9e6df}
.mv-zone canvas{display:block;max-width:100%;height:auto;cursor:crosshair}
.mv-res{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.6rem;font-size:.8rem}
.mv-res span{padding:.2rem .55rem;border:1px solid var(--v12);border-radius:999px;cursor:pointer;color:var(--tx2)}
.mv-res span.fait{border-color:var(--or);color:var(--tx)}
.mv-connue{display:flex;gap:.5rem;align-items:center;margin:0 0 .5rem;font-size:.84rem}
.mv-connue[hidden],#mv-f-l[hidden]{display:none}
.mv-connue input{width:6rem}
.mv-retenir{display:flex;gap:.45rem;align-items:center;margin-top:.5rem;font-size:.8rem;color:var(--tx2)}
/* La grille des photos par couleur (étape à part) : autant de colonnes que la largeur en
   permet, cases au format portrait — dix couleurs ne déforment rien, elles passent à la ligne. */
#p-parcoul{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:.75rem;overflow:visible}
#p-parcoul .vue{width:auto}
#p-parcoul .vue .cadre{width:100%;height:auto;aspect-ratio:3/4;font-size:.78rem}
#p-parcoul .lgd{text-align:center;font-weight:600;margin-top:.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vue .lgd{font-size:.6875rem;color:var(--tx2);text-align:center;margin-top:.18rem;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vue .x,.vign .x{position:absolute;top:3px;right:3px;width:20px;height:20px;padding:0;
  border-radius:50%;font-size:.78rem;line-height:1;font-weight:700;
  background:rgba(200,40,40,.94);border:1px solid var(--v28);color:var(--tx-sur-accent)}
.vue .x:hover,.vign .x:hover{background:#e04141;border-color:var(--v50)}
/* (2026-10-25, audit) Le × reste BLANC sur le rouge en jour (--tx-blanc y vaut #1d2433),
   et le survol reste rouge : html.jour button:hover:not(:disabled) le rendait beige. */
html.jour .vue .x:hover:not(:disabled),html.jour .vign .x:hover:not(:disabled){background:#e04141;color:var(--tx-sur-accent)}
/* La pastille « Dos » (mode photos simples, 2026-10-18) : désigne la photo du dos de l’aperçu 3D. */
.vue .dos{position:absolute;top:3px;left:3px;height:20px;padding:0 .5rem;border-radius:99px;
  font-size:.6875rem;font-weight:700;line-height:1;background:var(--f-carte);border:1px solid var(--v28);color:var(--tx2)}
.vue .dos.on{background:var(--or);border-color:var(--or);color:#1a1208}
#p-3d-vues{font-size:.75rem;color:var(--tx2)}
/* ⚠ CINQ CADRES, UNE SEULE LIGNE, A TOUTE LARGEUR DE FENETRE. Une largeur fixe
   ne peut pas tenir les deux promesses a la fois : assez grande sur une fenetre
   large, elle passe a deux lignes des qu on la reduit — or le nombre de photos
   ne depend pas de la taille de la fenetre. Les cadres se PARTAGENT donc la
   largeur disponible ; « aspect-ratio » tient le carre, donc ils grandissent et
   se resserrent sans jamais se deformer, et « nowrap » interdit le retour a la
   ligne au lieu de compter sur la chance. */
/* (2026-10-26) Le dos à part, puis une GRILLE qui passe à la ligne : plus rien ne sort de la carte. */
#p-vues{display:block!important;overflow:visible}
#p-vues .pv-grille{display:grid;grid-template-columns:repeat(auto-fill,var(--pv-w,7.5rem));gap:.6rem}
#p-vues .vue-dos .lgd{color:var(--tx-or);font-weight:650}
#p-vues .vue{flex:none;width:auto;max-width:none;min-width:0}
#p-vues .vue .cadre{width:100%;height:auto;aspect-ratio:3/4;font-size:.72rem}
.pv-t{font-size:.76rem;font-weight:650;color:var(--tx2);margin:0 0 .4rem}
.pv-opt{font-weight:400;color:var(--tx3);margin-left:.3rem}
.pv-fibre{margin-top:1rem;padding-top:.9rem;border-top:1px solid var(--v08)}
.pv-fibre-l{display:flex;gap:1rem;align-items:center;flex-wrap:wrap}
.cadre-fibre{width:var(--pv-w,7.5rem);aspect-ratio:1/1;border-radius:12px;border:1.5px dashed var(--v16);display:flex;align-items:center;
  justify-content:center;overflow:hidden;font-size:.72rem;color:var(--tx3);flex:0 0 auto}
.cadre-fibre.pleine{border-style:solid;border-color:var(--v16)}
.cadre-fibre img{width:100%;height:100%;object-fit:cover}
.pv-fibre-g{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.pv-etat{font-size:.78rem;color:var(--tx2)}
.pv-demarquer{display:block;width:100%;margin-top:.25rem;height:1.75rem;font-size:.74rem!important;padding:0 .4rem}
/* Une fenêtre basse : des cases un peu plus petites, pour que la fibre reste au-dessus du pied. */
.lgstk{display:flex;align-items:center;gap:.5rem;padding:.2rem .3rem;border-radius:6px}
/* (2026-10-25, audit) La liste du stock est paginée par Pagi : elle vit dans un CADRE pour ne pas
   être enfant direct de .carte.plein, sans quoi le socle (_SZ_PG_AUTO) la paginait une SECONDE fois
   — deux barres de pages, et des lignes masquées que ni l une ni l autre ne montrait. */
#p-zone>.stk-cadre{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.lgstk .c1{flex:0 0 4.5rem}
/* ⚠ LA COULEUR NE PREND PLUS TOUTE LA LARGEUR RESTANTE, l ENTREPOT l absorbe.
   Un nom de couleur tient en un mot ; un entrepot porte son CODE et sa
   reference — c est lui qui manquait de place, et sa liste etait coupee. */
/* ⚠ LES DEUX COLONNES SE PARTAGENT LE RESTE, a parts egales. Donner toute la
   largeur restante a l entrepot le rendait demesurement large sur une grande
   fenetre — un menu de quarante caracteres pour choisir un code de trois. Et la
   lui refuser entierement coupait sa liste. Les deux grandissent donc ensemble,
   et l entrepot est PLAFONNE : au-dela, le surplus retourne a la couleur. */
.lgstk .c2{flex:1 1 9rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lgstk .c3{flex:0 0 7.4rem;display:flex;align-items:center;gap:.35rem}
.lgstk .c3 .q{width:4.9rem;flex:0 0 auto}
.lgstk .c4{flex:1 1 12rem;max-width:22rem;min-width:0}
/* Sous le seuil : un AVERTISSEMENT, pas un refus. On peut tres bien enregistrer
   une variante juste sous son seuil — mais on doit le savoir, et savoir combien
   il en manque, sans avoir a faire la soustraction soi-meme. */
.lgstk .al{flex:0 0 auto;font-size:.86rem;line-height:1;cursor:help;color:var(--tx-att)}
.lgstk.entete{font-size:.6875rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);
  border-bottom:1px solid var(--v12);padding-bottom:.3rem;margin-bottom:.25rem;flex:0 0 auto}
.lgstk:not(.entete):hover{background:var(--v04)}
/* ⚠ UNE LIGNE QUI PORTE DU STOCK SE VOIT, comme dans le tableau d inventaire du
   site : on balaie la liste et l on sait ou il y a de la marchandise sans lire
   les chiffres un par un. Le site teinte a 6 % sur un fond CLAIR ; sur ce fond
   sombre la meme valeur est invisible — c est la teinte qui s adapte au fond,
   pas l intention qui change. */
.lgstk.enstock{background:rgba(34,197,94,.10)}
.lgstk.enstock:hover{background:rgba(34,197,94,.15)}
.lgstk.enstock .c1,.lgstk.enstock .c2{color:#86efac;font-weight:600}
/* ⚠ EN JOUR, le vert pale sur la teinte verte etait illisible (vu a la capture). */
html.jour .lgstk.enstock .c1,html.jour .lgstk.enstock .c2{color:#166534}
/* ⚠ EMPLACEMENT OBLIGATOIRE DES QUE LA QUANTITE DEPASSE ZERO — et depuis le
   2026-08-08, une CREATION exige au moins une variante avec une quantite
   (une fiche entiere a zero se creait sans un mot). Sans ce rappel on
   enregistre de la marchandise que l inventaire ne sait pas ou aller
   chercher. */
.lgstk select.manque{border-color:#f87171}
.theque{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:.5rem;
  max-height:46vh;overflow-y:auto;padding-right:.2rem}
.theque .ph{cursor:pointer;border-radius:8px;overflow:hidden;border:1px solid var(--v12);
  background:var(--f-0f1826)}
.theque .ph:hover{border-color:var(--or)}
.theque .ph img{width:100%;height:88px;object-fit:cover;display:block}
.theque .ph .lg{font-size:.6875rem;color:var(--tx2);padding:.16rem .25rem;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
/* Le code de l article qui se sert deja de la photo — en couleur d accent, pour
   qu il se distingue du code de la photo elle-meme juste au-dessus. */
.theque .ph .lg.sku{color:var(--tx-or);font-weight:700;padding-top:0;
  font-family:ui-monospace,Consolas,monospace}
.theque .ph .lg.libre{color:var(--tx-ok);padding-top:0}
.avis{display:none;font-size:.74rem;line-height:1.4;color:var(--tx-att);margin-top:.3rem}
.avis.on{display:block}
.voile{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;
  background:rgba(8,12,18,.6);padding:1.2rem}
.voile .boite{width:100%;max-width:460px;background:var(--f-carte);border:1px solid var(--v10);
  border-radius:12px;padding:1rem 1.1rem;box-shadow:0 24px 64px rgba(0,0,0,.5)}
.voile h3{margin:0 0 .5rem;font-size:1rem;font-weight:700;line-height:1.3;color:var(--tx)}
/* (2026-10-25, audit) Le rouge d erreur seulement pour l alerte (prix sous le coût) :
   « Détourer », « Gros plan », le Studio sont des boîtes neutres. */
.voile .boite.alerte h3{color:var(--tx-err2)}
.voile p{margin:0 0 .7rem;font-size:.86rem;line-height:1.5;color:var(--tx-bleute)}
.voile .pied2{display:flex;justify-content:flex-end;gap:.45rem;margin-top:.8rem}
.cote{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;align-items:start}
.cote .grille{grid-template-columns:repeat(2,minmax(0,1fr))}
.prixgrille{display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem .9rem;align-items:start}
@media (max-width:980px){.cote{grid-template-columns:1fr}}
/* ALIGNEMENT (2026-10-04, sa capture) : le libelle etait un flex — l etoile partait au bout de la colonne et un libelle sur deux lignes descendait son champ. Libelle en texte, et les trois champs partagent leurs RANGEES (subgrid) : les cases restent sur une meme ligne. */
.prixgrille{grid-template-rows:auto auto}
.prixgrille .ch{display:grid;grid-row:span 2;grid-template-rows:subgrid;row-gap:.3rem}
.prixgrille .ch label{display:block;align-self:end;margin-bottom:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prixgrille .ch label .pastille{margin-left:.4rem;vertical-align:middle}
.pastille{margin-left:auto;padding:.06rem .4rem;border-radius:99px;background:var(--or);
  color:#17202c;font-size:.7rem;font-weight:700;display:none}
.pastille.on{display:inline-block}
/* ⚠ UNE SEULE LIGNE (2026-09-25, sa regle : << ca ne doit pas etre sur deux lignes, ramene tout sur une ligne ou propose-moi quelque chose sans perdre le contenu >>). Mesure a 1280 px en ANGLAIS, ou les libelles sont les plus longs. */
.rabais{display:flex;gap:.2rem;flex-wrap:nowrap;margin-top:.35rem}
.rabais button{padding:.14rem .3rem;font-size:.7rem;border-radius:6px;white-space:nowrap}
.rabais button.on{background:var(--or);border-color:var(--or);color:#17202c;font-weight:600}
@media (max-width:700px){.prixgrille{grid-template-columns:1fr}}
.paire{display:flex;gap:.4rem;align-items:center}
.paire input{flex:1 1 auto}
.paire select{flex:0 0 5rem}
.stk{width:100%;border-collapse:collapse}
.stk th{font-size:.69rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);
  text-align:left;padding:.22rem .35rem;border-bottom:1px solid var(--v10)}
.stk td{padding:.14rem .35rem;border-bottom:1px solid var(--v05)}
.stk input,.stk select{padding:.18rem .35rem;font-size:.83rem}
.stk .q{width:5rem}
.bascules{display:flex;flex-direction:column;gap:.45rem}
/* ⚠ LES OUTILS SE POSENT APRES LE TITRE, JAMAIS AU COIN DROIT — celui-la est
   reserve au verrou (.sous, qui garde son margin-left:auto). */
.tete .outils{display:flex;align-items:center;gap:.3rem;flex:0 0 auto}
.tete .outils button{padding:.14rem .45rem;font-size:.78rem;line-height:1.35}
.tete .outils .n{font-variant-numeric:tabular-nums;font-weight:700}
/* Journal des modifications — une boite qui SE LIT, donc elle peut defiler : la
   regle « aucun defilement » vise les etapes du formulaire, pas la consultation
   d une liste dont on ne connait pas la longueur (meme choix que .theque). */
.jrn{max-height:52vh;overflow-y:auto;padding-right:.2rem;text-align:left}
.jrn .sec{display:flex;align-items:center;gap:.4rem;margin:.5rem 0 .5rem}
.jrn .sec .t{font-size:.6875rem;font-weight:800;letter-spacing:.06em;
  text-transform:uppercase;color:var(--tx-or);flex:0 0 auto}
.jrn .sec .tr{flex:1 1 auto;height:1px;background:var(--v12)}
.jrn .bl{padding:.5rem .6rem;border:1px solid var(--v10);border-radius:8px;
  background:var(--f-0f1826);margin-bottom:.45rem}
.jrn .bl.cliq{cursor:pointer;user-select:none}
.jrn .bl.cliq:hover{border-color:rgba(var(--or-rgb),.45)}
.jrn .et{font-size:.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;
  color:var(--tx2);margin-bottom:.15rem}
.jrn .dif{display:flex;align-items:center;gap:.4rem;font-size:.82rem;flex-wrap:wrap}
.jrn .dif .av{color:var(--tx2);text-decoration:line-through;opacity:.75;word-break:break-word}
.jrn .dif .fl{color:var(--tx-or);flex:0 0 auto}
.jrn .dif .ap{color:var(--tx);font-weight:600;word-break:break-word}
.jrn .qd{display:flex;justify-content:space-between;align-items:center;gap:.4rem;
  font-size:.6875rem;color:var(--tx2);margin-bottom:.35rem}
.jrn .qui{margin-top:.45rem;padding-top:.4rem;border-top:1px dashed var(--v14);
  font-size:.72rem;color:var(--tx2);line-height:1.5}
.jrn .an{font-size:.72rem;font-weight:800;letter-spacing:.06em;color:var(--tx-or);
  text-transform:uppercase;margin:.2rem 0 .5rem;border-bottom:1px solid var(--v12);
  padding-bottom:.3rem}
.jrn .fin{font-size:.7rem;color:var(--tx2);text-align:center;line-height:1.45;margin-top:.5rem}
.jrn .lien{color:var(--tx-or);text-decoration:none;font-weight:600;cursor:pointer}
`;

/** Page complète de l'assistant. `id` vide = création. */
function pageProduit(id) {
  const ident = JSON.stringify(String(id || ''));
  return `${TETE()}
<title>${T("Produit — Administration Sandriza")}</title>
<style>${CSS_SOCLE}${CSS_FICHE}${CSS_PROPRE}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.products}</span><h1 id="titre">${T("Produit")}</h1>
  <span class="outils">
    <button type="button" id="btn-jrn" title="${T("Modifications de cette fiche")}" style="display:none"><span class="ic">🕘</span> <span class="n" id="jrn-n">0</span></button>
    <button type="button" id="btn-apercu" title="${T("Aperçu boutique — dessiné par le site, avec ses vraies fonctions")}"><span class="ic">👁</span> ${T("Aperçu")}</button>
  </span>
  <span class="sous" id="sous"></span></div>
<div class="pas" id="pas"></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions">
    <button id="btn-prec">${T("Précédent")}</button>
    <button id="btn-suiv">${T("Suivant")}</button>
    <button id="btn-annuler">${T("Annuler")}</button>
    <button id="btn-enr" class="prim" disabled>${T("Enregistrer")}</button>
  </span></div>
<script>
(function(){
  'use strict';
  ${JS_SOCLE()}${JS_BORNER({'p-marque':60,'p-desc':4000,'p-prix':12,'p-solde':12,'p-cout':12})}
  MOTIFS.prix_invalide  = '${T("Le prix doit être supérieur à zéro.")}';
  MOTIFS.cout_requis    = '${T("Le coût d’acquisition est obligatoire.")}';
  MOTIFS.poids_requis   = '${T("Le poids unitaire est obligatoire.")}';
  // Les motifs du DOUBLE FILET du pont (produit:enregistrer). Les gardes
  // locales les attrapent avant lui en temps normal : s’ils arrivent ici,
  // c’est qu’une garde a été contournée — ils doivent avoir une phrase,
  // sinon le socle dirait « Erreur inattendue » sur un refus légitime.
  MOTIFS.photo_requise = '${T("La photo principale est obligatoire.")}';
  MOTIFS.tailles_couleurs_requises = '${T("Choisissez au moins une taille ET une couleur.")}';
  MOTIFS.emplacement_requis = '${T("Un emplacement d’entrepôt manque pour des variantes en stock.")}';
  MOTIFS.stock_requis = '${T("Saisissez une quantité pour au moins une variante.")}';
  MOTIFS.couleur_non_mappee = '${T("Cette couleur n’a pas de teinte unie attribuée.")}';
  MOTIFS.fal = '${T("Fal.ai a refusé la demande.")}';
  MOTIFS.limite3d = '${T("Trois aperçus 3D déjà générés pour cet article dans les dernières 24 heures : réessayez demain.")}';
  MOTIFS.cle_absente = '${T("Clé The New Black absente : posez-la dans Configuration › Sécurité.")}';
  MOTIFS.credits_insuffisants = '${T("Crédits The New Black insuffisants.")}';
  MOTIFS.tnb_echec = '${T("The New Black n’a pas pu générer le modèle 3D (crédits remboursés).")}';
  MOTIFS.version_coquille = '${T("Cette version de l’application ne sait pas préparer l’aperçu 3D : mettez-la à jour.")}';
  MOTIFS.tnb_erreur = '${T("The New Black a refusé la demande.")}';
  MOTIFS.tnb_injoignable = '${T("The New Black est injoignable.")}';
  MOTIFS.plafond = '${T("Plafond mensuel des traitements d’image atteint.")}';
  MOTIFS.produit_non_enregistre = '${T("Enregistrez d’abord la fiche : l’aperçu 3D se pose directement sur elle, même si vous la fermez.")}';
  MOTIFS.file_pleine = '${T("Quatre générations sont déjà en cours chez The New Black : attendez qu’une se termine.")}';
  MOTIFS.photos_verrouillees = '${T("Un aperçu 3D est en cours de génération : les photos de cette fiche sont verrouillées jusqu’à la fin.")}';
  // Le NIP des photos (2026-10-19) : retirer une photo de l'article l'exige — le serveur le vérifie.
  MOTIFS.photos_nip_absent = '${T("Aucun NIP des photos n’est défini : seul un super-administrateur peut retirer une photo d’un article. Il se définit dans Configuration › NIP.")}';
  MOTIFS.photos_nip_bloque = '${T("Trop d’essais faux — les retraits de photos sont bloqués 15 minutes.")}';
  MOTIFS.photo_format = '${T("La photo principale n’est pas dans un format accepté.")}';
  // L'aperçu 3D exige le devant ET le dos (2026-10-18) : refusé au pont et au relais, motifs nommés.
  MOTIFS.photo_absente = '${T("Choisissez d’abord la photo principale.")}';
  MOTIFS.photo_dos_absente = '${T("Ajoutez une photo du dos pour générer l’aperçu 3D.")}';
  MOTIFS.photo_dos_format = '${T("La photo du dos n’est pas dans un format accepté.")}';
  MOTIFS.photo_dos_identique = '${T("La photo du dos est la même que celle du devant : choisissez une vraie photo du dos.")}';
  MOTIFS.modele3d_trop_lourd = '${T("L’aperçu 3D est trop lourd (plus de 5,5 Mo).")}';
  MOTIFS.modele3d_format = '${T("L’aperçu 3D n’est pas dans un format accepté.")}';
  // La cabine d’essayage (2026-10-30) : refus du pont (double filet) et du serveur (tnb-proxy.php, actions cabine*).
  MOTIFS.cabine_requise = '${T("La cabine d’essayage est obligatoire pour cet article : préparez-la (étape Photos) avant d’enregistrer.")}';
  MOTIFS.cabine_injoignable = '${T("La cabine d’essayage n’a pas pu être vérifiée au serveur : réessayez dans un instant.")}';
  MOTIFS.face_non_tnb = '${T("La photo principale n’est pas une photo « sans mannequin » faite au Studio : rien n’a été lancé.")}';
  MOTIFS.dos_non_tnb = '${T("La photo du dos n’est pas une photo « sans mannequin » faite au Studio : rien n’a été lancé.")}';
  MOTIFS.mannequin_absente = '${T("La cabine n’est pas encore ouverte : la mannequin n’est pas configurée au serveur.")}';
  MOTIFS.prix_change = '${T("Le prix a changé depuis l’affichage : rien n’a été lancé. Relisez le nouveau montant.")}';
  MOTIFS.serveur_indisponible = '${T("Base injoignable : rien n’a été lancé.")}';
  MOTIFS.reprise_a_confirmer = '${T("Cet angle a été rejeté : sa reprise (payante) doit être demandée explicitement.")}';
  MOTIFS.plafond_angle = '${T("Cet angle a déjà été repris une fois : plus de reprise possible.")}';
  MOTIFS.mannequin_incomplet = '${T("Mannequin : le prénom, la taille (120 à 220 cm) et la taille portée vont ensemble.")}';
  MOTIFS.mannequin_taille = '${T("Mannequin : la taille portée doit être une des tailles offertes.")}';
  MOTIFS.video_trop_lourde = '${T("Vidéo trop lourde (maximum 5,5 Mo).")}';
  MOTIFS.video_format = '${T("Format refusé — MP4 ou WebM seulement.")}';
  MOTIFS.vue360_nombre = '${T("La vue 360° demande de 8 à 36 images.")}';
  MOTIFS.vue360_format = '${T("Vue 360° : une des images est illisible.")}';
  MOTIFS.anticipe_date = '${T("Accès anticipé : indiquez la date d’ouverture à tous.")}';
  MOTIFS.non_enregistre ='${T("La fiche n’a PAS été enregistrée. Voyez l’avis dans la fenêtre principale — le plus souvent, un collègue vient de modifier la même fiche.")}';

  var ID   = ${ident};
  var bEnr = document.getElementById('btn-enr');
  var sous = document.getElementById('sous');
  var CTX = null, FICHE = null, IMAGE = '', STOCK = {}, STOCK0 = null, LOCS = {}, PAGI = null;
  // ⚠ CES DEUX-LA ETAIENT DEJA ENVOYES AU PONT MAIS JAMAIS REMPLIS : la fenetre
  // expediait deux objets vides, et modifier une fiche depuis l application lui
  // FAISAIT PERDRE ses photos par couleur. Un defaut qui ne se voit pas a
  // l enregistrement — il se decouvre plus tard, sur la boutique.
  var VUES = {};      // { 'vue-2': dataUrl | url, … }
  // LA PHOTO DU DOS EN MODE PHOTOS SIMPLES (2026-10-18) : l'aperçu 3D exige un devant (la principale) ET un
  // dos. En mode angles, le dos est la vue « Derrière » ; en mode simple, les photos n'ont pas de rôle — la
  // pastille « Dos » en marque une, retenue ICI par sa chaîne (elle survit au glisser-déposer). Enregistrée
  // dans la fiche sous photoDos (le pont ne la garde que si elle est une des photos supplémentaires).
  var DOS_SRC = '';
  var PARCOUL = {};   // { 'Noir': { principale: dataUrl | url }, … }
  // ⚠ LES VUES SUIVENT LA CATEGORIE, comme dans l editeur du site. Une categorie
  // en mode « standard » demande une serie de vues sans couleur ; les autres
  // demandent des vues par ANGLE plus une photo par couleur. Ce reglage vit dans
  // Inventaire → Categories : si la fenetre en decidait autrement, deux ecrans du
  // meme produit ne demanderaient pas les memes photos.
  var ANGLES = { devant: '${T("Devant")}', derriere: '${T("Derrière")}', coteG: '${T("Côté gauche")}', coteD: '${T("Côté droit")}', autres: '${T("Autre")}' };
  function modeStandard(){
    var c = val('p-cat');
    return !!(c && CTX.modesPhoto && CTX.modesPhoto[c] === 'standard');
  }
  // ⚠ ABSENTE = ACTIVÉE, la règle de l’éditeur du site (_catHasAiColorGen) :
  // une catégorie qui n’a jamais réglé aiColorGen est en mode auto. Un site
  // antérieur à couleursAuto ne l’envoie pas — même défaut, même résultat.
  function modeAutoCouleur(){
    var c = val('p-cat');
    if (!c || !CTX.couleursAuto) return true;
    return CTX.couleursAuto[c] !== false;
  }
  // ⚠ EN MODE MANUEL, LES PHOTOS N ONT PAS DE ROLE FIXE. La categorie dit
  // « manuel » justement parce que ces articles ne se photographient pas selon
  // des angles convenus : imposer cinq cases nommees aurait redonne la
  // contrainte que le reglage sert a lever. On ajoute autant de photos qu il en
  // faut, et l ordre est celui de l ajout.
  function clesVues(){
    if (modeStandard()) {
      /* ⚠ LES CASES PEUVENT AVOIR DES TROUS (2026-10-18, sa demande : glisser la photo 1 dans la case 2 vide
         doit l y mettre). On montre donc jusqu a la PLUS HAUTE case occupée, plus une vide au bout. Le pont
         remet les photos dans l ordre des cases à l enregistrement : un trou ne part jamais sur la boutique. */
      var occ = Object.keys(VUES).filter(function(k){ return k.indexOf('libre') === 0 && VUES[k]; });
      var hi = 0;
      occ.forEach(function(k){ var x = parseInt(k.slice(5), 10) || 0; if (x > hi) hi = x; });
      var l = [];
      // Une case vide au bout TANT QU IL RESTE DE LA PLACE : en proposer une
      // sixieme laisserait croire qu on peut depasser, et le refus arriverait
      // apres avoir choisi le fichier.
      var max = Math.min(Math.max(hi, occ.length) + 1, MAX_PHOTOS);
      for (var i = 1; i <= max; i++) l.push('libre' + i);
      return l;
    }
    return (CTX.vuesAngles || ['devant', 'derriere', 'coteG', 'coteD', 'autres']);
  }
  function nomVue(k){ return ANGLES[k] || ('Photo ' + String(k).replace(/^libre/, '')); }

  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function vide(titre, detail){
    document.getElementById('corps').innerHTML =
      '<div class="vide"><div class="gros">' + esc(titre) + '</div><div>' + esc(detail || '') + '</div></div>';
    document.getElementById('pas').innerHTML = '';
    ['btn-enr','btn-prec','btn-suiv'].forEach(function(b){ document.getElementById(b).disabled = true; });
  }

  function ch(id, lbl, o){
    o = o || {};
    return '<div class="ch' + (o.large ? ' large' : '') + '">'
      + '<label for="' + id + '">' + esc(lbl) + (o.requis ? ' <span class="req">*</span>' : '') + '</label>'
      + (o.multi ? '<textarea id="' + id + '" rows="' + (o.rows || 4) + '"></textarea>'
                 : '<input id="' + id + '" type="' + (o.argent ? 'text' : (o.type || 'text')) + '"'
                   + (o.argent ? ' inputmode="decimal" class="argent"' : '')
                   + (o.pas ? ' step="' + o.pas + '"' : '') + (o.min !== undefined ? ' min="' + o.min + '"' : '')
                   + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + '>')
      + '</div>';
  }
  function sel(id, lbl, opts, o){
    o = o || {};
    return '<div class="ch' + (o.large ? ' large' : '') + '">'
      + '<label for="' + id + '">' + esc(lbl) + (o.requis ? ' <span class="req">*</span>' : '') + '</label>'
      + '<select id="' + id + '">'
      + opts.map(function(x){ return '<option value="' + esc(x.v) + '">' + esc(x.l) + '</option>'; }).join('')
      + '</select></div>';
  }
  function bascule(id, lbl){
    return '<label style="display:flex;align-items:center;gap:.45rem;font-size:.86rem;cursor:pointer">'
      + '<input type="checkbox" id="' + id + '">' + esc(lbl) + '</label>';
  }
  var rien = [{ v: '', l: '${T("Non précisé")}' }];
  function opt(l, cV, cL){ return l.map(function(x){ return { v: x[cV], l: x[cL] }; }); }

  function dessiner(){
    var h = [];

    /* (2026-10-26, sa demande) LES PHOTOS D'ABORD : l'IA s'en sert ensuite pour rédiger la description. */
    // 5 — Photos : principale, vues supplémentaires, et par couleur
    h.push('<div class="etape">'
      // ⚠ LA VIGNETTE EST LE CONTROLE, plus un bouton a cote d elle. Un bouton
      // « Retirer » pose sous la carte n indique pas a quelle photo il
      // s applique, et il occupait la place d une action principale pour un
      // geste secondaire. On clique la photo pour la choisir, on clique la
      // pastille rouge de son coin pour la retirer — la ou l oeil est deja.
      /* ⚠ COTE A COTE, SANS TEXTE D AIDE (demande le 2026-08-07) : la vignette
         principale laissait toute sa moitie droite vide, et les deux phrases
         d explication n apprenaient rien apres la premiere utilisation. Le
         MAXIMUM, seul renseignement qui compte, vit dans le TITRE. */
      + '<div class="carte pf-photos"><div class="p-verrou-photos" role="status"></div><h2 id="p-vues-titre">Photos</h2>'
      + '<div class="ligne-photos">'
      + '<div class="vue-principale">'
      + '<div class="vign" id="p-vign" >${T("choisir une photo")}</div>'
      + '<div class="lgd-principale">${T("Photo principale")}</div>'
      + '<button type="button" id="p-detourer" class="mini-decor" disabled '
      + '><span class="ic">✂</span> ${T("Décor")}</button>'
      + '<button type="button" id="p-studio" class="mini-decor" disabled '
      + '><span class="ic">📷</span> ${T("Créer au studio")}</button></div>'
      + '<div class="aide p-studio-attente" id="p-studio-attente" style="display:none"></div>'
      /* LA CABINE D ESSAYAGE (2026-10-30, ses décisions) : obligatoire pour les vêtements et les accessoires de tête ;
         le coût affiché PENDANT la création est celui du serveur (cabine:etat). Dessinée par dessinerCabine. */
      + '<div class="pf-3d pf-cab" id="p-cab-carte" style="display:none" aria-live="polite"></div>'
      + '<div class="pf-3d" id="p-3d-carte">'
      + '<div class="pf-med-l" id="p-3dg-l">'
      + '<button type="button" id="p-3d-gen"><span class="ic">🧊</span> ${T("Générer l’aperçu 3D")}</button>'
      + '<span id="p-3d-vues"></span>'
      + '<span class="aide" id="p-3dg-etat"></span></div>'
      + '<ol id="p-3dg-etapes" style="display:none"></ol>'
      + '<div class="pf-med-l" id="p-3d-attente" style="display:none">'
      + '<button type="button" id="p-3d-publier">${T("Publier quand même")}</button>'
      + '<button type="button" id="p-3d-rejeter">${T("Rejeter le modèle")}</button></div>'
      + '<div class="pf-med-l" id="p-3d-l" style="display:none">'
      + '<span class="aide" id="p-3d-etat"></span>'
      + '<button type="button" id="p-3d-refaire" >${T("Refaire le rendu")}</button>'
      + '<button type="button" id="p-3d-retirer">${T("Retirer l’aperçu 3D")}</button></div>'
      + '</div>'
      + '<div class="vues" id="p-vues"></div>'
      /* LA FIBRE AGRANDIE (2026-10-26, sa demande) : une case à part, FACULTATIVE, sous les photos ; un bouton qui
         génère TOUJOURS le rendu le plus précis (la macro professionnelle) — pas de choix à faire. La boutique
         l'affiche EN GRAND, dans sa propre section. Champ de la fiche : photoFibre. */
      + '<div class="pv-fibre" id="p-fibre-bloc"></div>'
      + '</div></div>'
      /* ⚠ LES MÉDIAS (2026-10-07, sa demande : « Sophie mesure 1,68 m et porte
         un S », « une courte vidéo de 5 secondes qui montre le tombé », « un 360
         degrés »). Tout est FACULTATIF : une fiche sans médias s affiche en
         boutique exactement comme avant. La taille portée se CHOISIT parmi les
         tailles offertes — tapée, elle finirait par annoncer une taille que la
         fiche ne vend pas. */
      + '<div hidden aria-hidden="true" id="p-med-carte">'
      + '<div class="pf-med">'
      + ch('p-mq-prenom', '${T("Prénom du mannequin")}', { placeholder: '${T("Ex : Sophie")}' })
      + ch('p-mq-cm', '${T("Taille du mannequin (cm)")}', { type: 'number', min: 120, pas: '1', placeholder: '${T("Ex : 168")}' })
      + sel('p-mq-taille', '${T("Taille portée")}', [{ v: '', l: '—' }])
      + '</div>'
      + '<div class="aide" id="p-mq-apercu" style="margin-top:.35rem"></div>'
      + '<div class="pf-med-l">'
      + '<button type="button" id="p-vid-choisir"><span class="ic">🎬</span> ${T("Choisir une vidéo (MP4, WebM)")}</button>'
      + '<span id="p-vid-apercu"></span>'
      + '<span class="aide" id="p-vid-etat"></span>'
      + '<button type="button" id="p-vid-retirer" style="display:none">${T("Retirer la vidéo")}</button></div>'
      + '<div class="pf-med-l">'
      + '<button type="button" id="p-360-choisir"><span class="ic">🔄</span> ${T("Choisir les vues 360° (8 à 36 images)")}</button>'
      + '<span class="aide" id="p-360-etat"></span>'
      + '<button type="button" id="p-360-retirer" style="display:none">${T("Tout retirer")}</button></div>'
      + '<div id="p-360-bande"></div>'
      /* L'APERÇU 3D GÉNÉRÉ (2026-10-18, sa décision : « Image to 3D » de The New Black — la vue 360° en images est
         retirée). Devant ET dos exigés (sinon le bouton est désactivé, avec la raison) ; ≈ 0,65 $ US (10 crédits). La
         barre d'étapes, la conformité et, sous le seuil, « Publier quand même / Rejeter ». */
      + '</div>'      + '</div></div>');

    // 1 — Identité ET classement (fusionnées : elles décrivent la même chose,
    // et les séparer obligeait à un aller-retour pour une poignée de listes).
    h.push('<div class="etape">'
      + '<div class="carte"><h2>${T("Identification")}</h2><div class="pf-id">'
      + '<div class="l2">' + ch('p-nom', '${T("Nom du produit")}', { requis: true, placeholder: '${T("Ex : Robe fleurie été")}' }) + '</div>'
      + sel('p-cat', '${T("Catégorie")}', rien.concat(opt(CTX.categories, 'cle', 'libelle')), { requis: true })
      + ch('p-marque', '${T("Marque")}')
      // Le poids appartient a l identite du vetement, pas au prix : c est une
      // caracteristique de l article, et il tenait seul dans une carte entiere.
      + '<div class="ch"><label for="p-poids">${T("Poids unitaire ")}<span class="req">*</span></label>'
      + '<div class="paire"><input id="p-poids" type="number" step="0.001" min="0" placeholder="${T("Ex : 350")}">'
      + '<select id="p-unite" aria-label="${T("Unité du poids")}"><option value="g">g</option><option value="kg">kg</option>'
      + '<option value="lb">lb</option></select></div>'
      + '</div>'
      // ⚠ LE SKU EST VISIBLE, en lecture seule. Un code attribué « quelque part
      // plus tard » ne peut ni être lu, ni recopié sur une étiquette, ni
      // vérifié. Il se calcule dès que la catégorie est choisie.
      + '<div class="ch"><label for="p-sku">${T("Code (SKU)")}</label>'
      + '<input id="p-sku" readonly style="font-family:ui-monospace,Consolas,monospace;'
      + 'background:var(--f-pied);color:var(--tx-or)" placeholder="${T("choisissez une catégorie")}"></div>'
      + '<div class="ch l4"><label for="p-desc">${T("Description")}'
      + '</label>'
      + '<textarea id="p-desc" rows="3"></textarea>'
      // La redaction par IA passe par le PONT : la fenetre envoie la photo et les
      // renseignements, le SITE interroge le service avec sa cle. Rien ne sort
      // d ici, aucune cle ne voyage.
      + '<div class="pf-ia">'
      + '<button type="button" id="p-ia"><span class="ic">✨</span> ${T("Rédiger avec l’IA")}</button>'
      + '<span class="ed-seg" id="p-ia-ton" role="group" aria-label="${T("Ton de la description")}">'
      + '<button type="button" data-ton="chaleureux" class="on">${T("Chaleureux")}</button>'
      + '<button type="button" data-ton="sobre">${T("Sobre")}</button>'
      + '<button type="button" data-ton="court">${T("Court")}</button></span></div></div>'
      + '</div></div>'
      + '<div class="cote pf-bas">'
      + '<div class="carte"><h2>${T("Classement")}</h2><div class="pf-cl">'
      + sel('p-genre', '${T("Genre")}', rien.concat(opt(CTX.genres, 'cle', 'libelle')))
      + sel('p-age', '${T("Groupe d’âge")}', rien.concat(opt(CTX.groupesAge, 'cle', 'libelle')))
      + sel('p-style', '${T("Style")}', rien.concat(opt(CTX.styles, 'cle', 'libelle')))
      + sel('p-guide', '${T("Guide des tailles")}', rien.concat(opt(CTX.guides, 'id', 'nom')))
      // ⚠⚠ LA VALEUR N EST PAS TRADUITE, LE LIBELLE L EST. Ce qui part dans
      // le champ v est ECRIT dans la fiche et relu par le site ; le traduire ferait
      // enregistrer « Popular » depuis un poste anglais et « Populaire »
      // depuis un poste francais, pour la meme etiquette. On ne traduit que
      // ce qui se lit.
      + sel('p-etiq', '${T("Étiquette")}', [{ v: '', l: '${T("Aucune")}' }, { v: 'Populaire', l: '${T("Populaire")}' },
            // ⚠ LE LIBELLE NE REPREND PAS LE MOT DE LA VALEUR, ET C EST VOULU.
            // La valeur est posee telle quelle dans le champ plus bas, quand le
            // prix solde passe sous le prix de vente : c est de la DONNEE. Une
            // entree de dictionnaire portant ce mot le rendrait traduisible
            // PARTOUT, y compris la ou il s ecrit — banc-langue-donnees le
            // refuse, et il a raison. Le libelle porte donc sa propre phrase.
            { v: 'Solde', l: '${T("En solde")}' }].concat(opt(CTX.etiquettes, 'cle', 'libelle')))
      + sel('p-fourn', '${T("Fournisseur")}', rien.concat(opt(CTX.fournisseurs, 'id', 'nom')))
      + '</div></div>'
      + '<div class="carte sans-solde" id="p-prix-carte"><h2>${T("Prix")}</h2>'
      + '<div class="prixgrille">'
      + ch('p-prix', '${T("Prix de vente ($)")}', { requis: true, argent: true })
      + '<div class="ch"><label for="p-solde">${T("Prix soldé ($)")}'
      + '<span id="p-pastille" class="pastille"></span></label>'
      + '<input id="p-solde" type="text" inputmode="decimal" class="argent" placeholder="${T("aucun")}"></div>'
      + ch('p-cout', '${T("Coût d’achat ($)")}', { requis: true, argent: true })
      + '</div>'
      // Les rabais rapides sous TOUTE la carte (2026-09-30) : sous le seul champ
      // du prix solde, la carte plus etroite les coupait au cinquieme.
      + '<div id="p-rabais" class="rabais"></div>'
      + '<div class="aide" id="p-marge" style="margin-top:.7rem"></div><div class="pf-marge-barre" id="p-marge-barre" hidden><i></i></div>'
      + '<div class="pf-sw">' + szInter('p-solde-on', '${T("Mettre en solde")}', '', false) + '</div>'
      + '<div id="p-alerte" style="display:none;color:var(--tx-err);font-size:.78rem;margin-top:.4rem"></div></div>'
      + '</div></div>');

    // 3 — Tailles et couleurs
    h.push('<div class="etape">'
      + '<div class="carte"><h2>${T("Tailles offertes")}</h2><div class="jetons" id="p-tailles">'
      + (CTX.tailles.length
          ? CTX.tailles.map(function(t){ return '<span class="jeton" data-t="' + esc(t) + '">' + esc(t) + '</span>'; }).join('')
          : '<span class="aide">${T("Aucune taille au référentiel.")}</span>')
      + '</div>'
      // L AJUSTEMENT DU MODELE (2026-10-07) : un champ PUBLIC de la fiche, que la
      // boutique affiche sous le choix de la taille. Pose A LA MAIN ; la ligne
      // dessous PROPOSE une valeur calculee d apres les retours << taille
      // incorrecte >> (produit:ajustement) — les retours ne quittent jamais
      // l administration. ⚠ Les valeurs (petit, grand) sont de la DONNEE : seuls
      // les libelles se traduisent.
      + '<div class="pf-aj">'
      + sel('p-ajust', '${T("Ajustement")}', [{ v: '', l: '${T("Normal")}' },
            { v: 'petit', l: '${T("Taille petit (conseiller la taille au-dessus)")}' },
            { v: 'grand', l: '${T("Taille grand (conseiller la taille au-dessous)")}' }])
      + '<div class="aide" id="p-ajust-sug"></div></div>'
      + '</div>'
      + '<div class="carte plein"><h2>${T("Couleurs offertes")}</h2>'
      // ⚠ UNE RECHERCHE, PAS UN MUR DE JETONS. Le moteur de couleurs en propose
      // des centaines : les afficher toutes etait impossible, et c est
      // exactement pour cela que l editeur du site propose une recherche.
      // Les jetons montrent les couleurs CHOISIES ; la recherche sert a en
      // ajouter, du referentiel ou hors referentiel.
      + '<div class="rech" style="margin-bottom:.4rem;position:relative">'
      + '<input aria-label="${T("Chercher une couleur, ou en saisir une nouvelle")}" id="p-coul-libre" autocomplete="off" placeholder="${T("Chercher une couleur, ou en saisir une nouvelle…")}">'
      + '<button type="button" id="p-coul-add">${T("Ajouter")}</button>'
      + '<div id="p-coul-sug"></div></div>'
      + '<div class="jetons" id="p-couleurs"></div>'
      + '<div class="aide" id="p-coul-vide" style="margin-top:.3rem">${T("Aucune couleur choisie.")}</div>'
      + '</div></div>');

    /* 5 bis — PHOTOS PAR COULEUR, ÉTAPE À PART (2026-10-09, sa demande : « que les espaces pour
       les photos puissent prendre plusieurs couleurs sans déformer l’assistant ; au besoin ajoute
       des étapes »). Coincée sous les vues et les médias, la rangée de cases débordait dès cinq ou
       six couleurs. Ici : une grille qui se remplit à la largeur de la fenêtre, une case par
       couleur, au format portrait d’une photo de vêtement. */
    h.push('<div class="etape">'
      /* ⚠ DEUX MODES, DÉCIDÉS PAR LA CATÉGORIE, comme l’éditeur du site :
         AUTO (aiColorGen) = les variantes se GÉNÈRENT en teintant les photos
         du produit au canevas — par le site, via le pont — et se régénèrent à
         l’enregistrement ; MANUEL = on dépose une photo par couleur. La
         1ʳᵉ couleur n’a jamais de variante : ses photos SONT celles du
         produit (la boutique ne lit une variante que pour les autres). */
      + '<div class="carte plein" id="p-parcoul-carte"><div class="p-verrou-photos" role="status"></div><h2 id="p-parcoul-titre">${T("Photo par couleur")}</h2>'
      + '<div class="aide" id="p-parcoul-aide" style="margin-bottom:.5rem"></div>'
      + '<div class="vues" id="p-parcoul"></div>'
      + '<div style="margin-top:.5rem"><button type="button" id="p-cv-gen" style="display:none" '
      + '>'
      + '${T("Tout générer")}</button></div></div>'
      + '</div>');

    /* 5 ter — MESURES DU VÊTEMENT (7.13.0) : facultatives, elles font la taille suggérée. */
    h.push('<div class="etape"><div class="carte plein" id="p-mesv-carte"><h2>${T("Mesures du vêtement")}</h2>'
      + '<div class="mesv-barre"><div class="mv-ch"><label for="p-mesv-type">${T("Type")}</label><select id="p-mesv-type">'
      + '<option value="haut">${T("Haut (chandail, chemisier, veste)")}</option><option value="bas">${T("Bas (pantalon, jupe, short)")}</option>'
      + '<option value="robe">${T("Robe ou combinaison")}</option><option value="aucun">${T("Aucune mesure")}</option></select></div>'
      + '<div class="mv-ch"><label for="p-mesv-t">${T("Taille photographiée")}</label><select id="p-mesv-t"></select></div>'
      + '<span class="esp"></span><button type="button" id="p-mesv-photo"><span class="ic">📏</span> ${T("Mesurer sur une photo")}</button></div>'
      + '<div id="p-mesv-auto"></div><div id="p-mesv-table"></div></div></div>');
    h.push('<div class="etape">'
      /* COMPOSITION ET ENTRETIEN (2026-10-11, sa demande) : des cases, pas du texte libre — la
         boutique affiche chaque consigne dans la langue de la cliente, avec son pictogramme. */
      + '<div class="carte plein" id="p-ent-carte"><h2>${T("Composition et entretien")}</h2>'
      + '<div class="ent-haut"><div class="ch"><label for="p-compo">${T("Composition")}</label>'
      + '<input id="p-compo" maxlength="200" placeholder="${T("Ex : 95 % polyester, 5 % élasthanne")}"></div>'
      + '<div class="ch"><label for="p-ent-autre">${T("Autre consigne (facultatif)")}</label>'
      + '<textarea id="p-ent-autre" rows="1" maxlength="400"></textarea></div></div>'
      + '<div class="ent-modeles" id="p-ent-modeles"></div>'
      + '<div id="p-ent"></div>'
      + '</div></div>');

    // 6 — Détails
    // ⚠ LE REGIME DE VENTE N EST PAS UN JEU DE CASES INDEPENDANTES. Mes cases
    // permettaient « vente finale ET aucun retour ET liquidation » — une
    // combinaison que l editeur du site ne peut pas produire et que la boutique
    // ne sait pas afficher. D ou deux menus dont les valeurs se contraignent.
    h.push('<div class="etape"><div class="carte"><h2>${T("Mise en marché")}</h2><div class="bascules">'
      + bascule('p-actif', '${T("Produit actif (visible en boutique)")}')
      /* (2026-10-26, sa demande) METTRE EN VENTE DIRECTEMENT : le produit sort de l'accès anticipé automatique (48 h
         réservées aux paliers de fidélité) et paraît à tous dès l'enregistrement. Champ de la fiche : anticipeExclu. */
      + bascule('p-direct', '${T("Mettre en vente directement, pour tout le monde (sans accès anticipé)")}')
      // ⚠ DEUX CONTROLES, LES MEMES QUATRE ETATS QU AVANT. Un menu unique
      // melangeait deux questions sans rapport : comment l article est mis en
      // marche, et si la cliente peut le retourner. Rien ne disait que
      // << Vente finale >> excluait les retours — il fallait le savoir.
      // Combinaisons : normal+retour, normal+aucun, liquidation, vente finale.
      // Soit les quatre d origine, ni plus ni moins.
      + '<div class="cote" style="margin-top:.3rem">'
      + '<div class="ch"><label for="p-regime">${T("Régime de vente")}</label>'
      + '<select id="p-regime">'
      // (2026-10-25, audit) Pas d émoji dans un <option> : l analyseur y jette le
      // <span class="ic">, l émoji brut restait EN COULEUR, hors de la règle des
      // pictogrammes monochromes.
      + '<option value="normal">${T("Normal")}</option>'
      + '<option value="liq">${T("Liquidation")}</option>'
      + '<option value="final">${T("Vente finale")}</option>'
      + '</select></div>'
      + '<div class="ch"><label for="p-retours">${T("Retours")}</label>'
      + '<select id="p-retours">'
      + '<option value="ok">${T("Acceptés")}</option>'
      + '<option value="aucun">${T("Aucun retour")}</option>'
      + '</select></div>'
      + '</div>'
      // ⚠ DEUX ENCARTS RETIRES le 2026-08-07, a la demande : ils EXPLIQUAIENT ce
      // que l ecran montrait deja. Un champ grise et desactive dit tout seul qu il
      // est impose ; lui ajouter << Impose par le regime de vente choisi >> ne
      // renseigne personne et occupe la place utile. Meme chose pour le paragraphe
      // sur l etiquette de mise en marche : le champ Etiquette se vide sous les
      // yeux, ce qui est plus clair que trois lignes pour le dire.
      // ⚠ « VENTE FINALE, MAIS RETOUR ACCEPTE MALGRE TOUT » A ETE RETIRE, et il
      // n aurait jamais du reapparaitre ici. Le site a ABANDONNE ce reglage :
      // admin.js le dit explicitement (<< finalSaleReturnOk n a donc plus de
      // mode qui le mette a true, ancien mode liq_ok retire >>) et ses trois
      // modes le forcent tous a false. Cette fenetre etait devenue le SEUL
      // endroit du projet capable de le remettre a vrai — donc de produire une
      // fiche que l editeur du site ne sait pas representer, et dont la boutique
      // afficherait deux promesses contraires a la meme cliente.
      + '</div></div>'
      // ⚠ « Repères » retire a la demande. L emoji et la couleur d accent ne
      // servent qu au rendu interne des listes ; les demander a la creation d un
      // produit occupait une carte entiere pour deux reglages qu on ne touche
      // jamais. Le SEUIL, lui, reste : il declenche les alertes de stock.
      + '<div class="carte"><h2>${T("Alerte et limites")}</h2><div class="grille">'
      + ch('p-seuil', '${T("Seuil d’alerte")}', { type: 'number', min: 0, pas: '1' })
      // ⚠ LIMITE PAR CLIENT (2026-08-08) : toutes commandes confondues, par
      // adresse courriel — le cumul est tranché par le SERVEUR à la caisse
      // (client_limit_check). Vide = aucune limite propre au produit.
      // ⚠ SANS texte d aide (retire a la demande, 2026-08-08) : l explication
      // vit dans l INFOBULLE, comme le veut la regle des encarts qui expliquent
      // ce que l ecran montre deja.
      + '<div class="ch"><label for="p-limclient">${T("Limite par client")}</label>'
      + '<input id="p-limclient" type="number" min="1" step="1" placeholder="${T("aucune")}" '
      + '></div>'
      + '</div>'
      // L ACCES ANTICIPE DES PALIERS DE FIDELITE (2026-10-07) : avant la date, le
      // produit n est visible qu aux paliers qui y ont droit (Fidelisation > Paliers).
      // Paliers eteints : la marque est ignoree, le produit est visible de tous.
      + '<div class="pf-aj">' + bascule('p-anticipe', '${T("Accès anticipé (paliers de fidélité)")}')
      + ch('p-publie', '${T("Ouvert à tous le")}', { type: 'date' }) + '</div>'
      + '</div></div>');

    // 7 — Stock
    h.push('<div class="etape"><div class="carte plein" id="p-zone"><h2>${T("Stock par variante")}</h2>'
      // ⚠ LA REGLE DE L EDITEUR DU SITE, DITE ICI AUSSI. Sans entrepot configure,
      // la colonne disparaissait sans un mot : on saisissait des quantites en
      // croyant l emplacement facultatif, alors qu il est obligatoire des que la
      // quantite depasse zero.
      + (CTX.entrepots.length
          ? ''
          : '<div class="aide" style="margin:-.2rem 0 .5rem;color:var(--tx-att)"><span class="ic">⚠</span> ${T("Aucun emplacement ")}'
            + '${T("configuré — créez-en un dans Inventaire → Entrepôt pour pouvoir en assigner un aux")} '
            + '${T("variantes en stock.")}</div>')
      + '<div class="rech"><input aria-label="${T("Filtrer par taille ou couleur")}" placeholder="${T("Filtrer par taille ou couleur…")}"><span class="cpt" id="p-somme"></span></div>'
      + '<div class="lgstk entete"><span class="c1">${T("Taille")}</span><span class="c2">${T("Couleur")}</span>'
      + '<span class="c3">${T("Quantité")}</span><span class="c4">${T("Entrepôt")}</span></div>'
      + '<div class="stk-cadre"><div class="liste"></div></div><div class="pagi"></div></div></div>');

    document.getElementById('corps').innerHTML = h.join('')
      + '<aside class="pf-fiche" id="pf-fiche" aria-label="${T("Fiche du produit")}"></aside>';
    brancher();
    brancherMedias();
    // Le volet suit CHAQUE saisie, et les gestes qui ne passent pas par un champ
    // (tailles, couleurs, photos, stock) le rappellent eux-memes.
    var corpsEl = document.getElementById('corps');
    corpsEl.addEventListener('input', majFicheBientot);
    corpsEl.addEventListener('change', majFicheBientot);
    corpsEl.addEventListener('click', majFicheBientot);
    if (FICHE) remplir(FICHE);
    else {
      document.getElementById('p-actif').checked = true;
      poser('p-seuil', String(CTX.seuilDefaut));
      poser('p-regime', 'normal');
      poser('p-retours', 'ok');
      // Une categorie deja choisie n emet aucun evenement : on demande le code
      // des l ouverture, sinon il n arrive qu au premier changement.
      if (val('p-cat')) majSku();
    }
    if (window.__pfMajDirect) window.__pfMajDirect();   // « directement » et l'accès anticipé s'excluent
    majNom();
    MODE_PH = modeStandard();
    dessinerJetons();
    majMarge();
    majFiche();

    Assist.poser([
      // ⚠ Les obligations du prix rejoignent la PREMIERE etape avec ses champs :
      // une etape ne peut pas exiger un champ qui vit ailleurs — le fil dirait
      // « incomplet » sur une etape ou rien ne manque a l ecran.
      { t: 'Photos',                  obl: [] },
      { t: '${T("Identité, prix et poids")}', obl: ['p-nom', 'p-cat', 'p-poids', 'p-prix', 'p-cout'] },
      { t: '${T("Tailles et couleurs")}',     obl: [] },
      { t: '${T("Couleurs")}',                obl: [] },
      /* « Composition et entretien » A PART (2026-10-20, sa demande : « tu vas me mettre ça dans une
         section à part ») : sous les mesures, la carte tombait sous le pied de la fenêtre. */
      { t: '${T("Mesures")}',                 obl: [] },
      { t: '${T("Composition et entretien")}', obl: [] },
      { t: '${T("Mise en marché")}',          obl: [] },
      { t: 'Stock',                   obl: [] }
    ], function(i){ if (i === 0) { dessinerVues(); dessinerMedias(); setTimeout(ajusterPhotos, 30); } if (i === 3) dessinerVues(); if (i === 4) dessinerMesures(); if (i === 5) dessinerEntretien(); if (i === 7) majStock(); });

    bEnr.disabled = !(ID ? CTX.peutModifier : CTX.peutAjouter);
    chargerCouts();   // les coûts numériques de l'article (journal des appels payants)
    if (bEnr.disabled) dire('${T("Consultation seulement — votre rôle ne permet pas d’enregistrer.")}', 'att');
  }

  /* ══ LE VOLET « FICHE » (2026-09-30) ═══════════════════════════════════
     ⚠ IL NE DECIDE RIEN : il relit les champs, CHOIX, IMAGE et STOCK — les
     memes sources que l enregistrement. La liste « Pour enregistrer » reprend
     les gardes d enregistrer() dans le meme ordre ; un clic mene a l etape. */
  var FICHE_T = null;
  function majFicheBientot(){ clearTimeout(FICHE_T); FICHE_T = setTimeout(majFiche, 60); }
  /* LES PASTILLES (2026-10-26) : un menu court devient une rangée de pastilles. Le <select> reste la source :
     une pastille le pose et émet « change » ; majPuces() relit le menu (fiche ouverte, brouillon repris). */
  function pucer(id){
    var se = document.getElementById(id); if (!se || se.options.length > 7) return;
    var chp = se.parentNode; if (!chp || !chp.classList) return; chp.classList.add('a-puces');
    var z = document.createElement('div'); z.className = 'pf-puces'; z.setAttribute('data-puces', id);
    // « Non précisé » n'a pas de pastille : on DÉSÉLECTIONNE en recliquant la pastille choisie.
    z.innerHTML = Array.prototype.filter.call(se.options, function(o){ return o.value !== ''; }).map(function(o){
      return '<button type="button" data-v="' + esc(o.value) + '">' + esc(o.textContent) + '</button>';
    }).join('');
    z.onclick = function(ev){
      var b = ev.target.closest && ev.target.closest('[data-v]'); if (!b) return;
      var v = b.getAttribute('data-v'); se.value = (se.value === v) ? '' : v; se.dispatchEvent(new Event('change', { bubbles: true })); majPuces();
    };
    chp.appendChild(z); majPuces();
  }
  function majPuces(){
    document.querySelectorAll('[data-puces]').forEach(function(z){
      var se = document.getElementById(z.getAttribute('data-puces')); if (!se) return;
      z.querySelectorAll('[data-v]').forEach(function(b){ if (b.classList) b.classList.toggle('on', b.getAttribute('data-v') === se.value); });
    });
  }
  function majFiche(){
    majPuces();
    majCabine();
    var z = document.getElementById('pf-fiche');
    if (!z || !CTX) return;
    var nom = String(val('p-nom') || '').trim();
    var sku = String(val('p-sku') || '').trim();
    var p = argentNombre(val('p-prix')) || 0, so = argentNombre(val('p-solde')) || 0, co = argentNombre(val('p-cout')) || 0;
    var eff = (so > 0 && so < p) ? so : p;
    var t = tailles(), c = couleurs();
    var tot = 0; Object.keys(STOCK).forEach(function(k){ tot += (+STOCK[k] || 0); });
    var actif = !!(document.getElementById('p-actif') || {}).checked;
    var h = '<div class="ph">' + (IMAGE ? '<img src="' + esc(IMAGE) + '" alt="">'
          : '<span><span class="ico">${ICO.image}</span><br>${T("Aucune photo principale")}</span>') + '</div>';
    h += '<div><div class="nm' + (nom ? '' : ' sansnom') + '">' + esc(nom || '${T("Sans nom")}') + '</div>'
      + (sku ? '<div class="sk">' + esc(sku) + '</div>' : '') + '</div>';
    if (p > 0) {
      h += '<div class="px"><span class="v">' + esc(szArgent(eff)) + '</span>'
        + (eff < p ? '<span class="b">' + esc(szArgent(p)) + '</span>' : '')
        + (co > 0 ? '<span class="m">${T("Marge :")} ' + esc(szArgent(eff - co)) + ' (' + Math.round((eff - co) / eff * 100) + ' %)</span>' : '')
        + '</div>';
    }
    var ligne = function(k, v){ return '<div class="l"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; };
    /* LES COÛTS NUMÉRIQUES DE L'ARTICLE (7.16.0) : ce que le journal a facturé pour lui (Fal.ai,
       Photoroom, 3D), et la marge une fois ce coût réparti sur ses unités en stock. */
    var totU = 0; Object.keys(STOCK).forEach(function(k){ totU += (+STOCK[k] || 0); });
    if (COUTS && COUTS.total > 0) {
      var NOMS_GESTE = { apercu3d_tnb: '${T("Aperçu 3D (The New Black)")}', vue360: '${T("Vue 360°")}', apercu3d: '${T("Aperçu 3D")}', fantome: '${T("Mannequin retiré")}' };
      var det = (COUTS.detail || []).map(function(x){ return x.n + ' × ' + (NOMS_GESTE[x.geste] || x.geste || x.modele) + ' : ' + szArgent(x.cout); }).join(' · ');
      var parU = COUTS.total / Math.max(1, totU);
      h += '<div class="l" title="' + esc(det) + '"><span class="k">${T("Coûts numériques")}</span><span class="v">' + esc(szArgent(COUTS.total))
        + ' <span class="sous" style="font-size:.72rem;color:var(--tx3)">(' + COUTS.n + ' ' + szPl(COUTS.n, '${T("appel")}', '${T("appels")}') + ')</span></span></div>';
      if (p > 0 && co > 0) h += ligne('${T("Marge après coûts numériques")}', esc(szArgent(eff - co - parU)) + ' (' + Math.round((eff - co - parU) / eff * 100) + ' %)');
    }
    h += ligne('${T("Catégorie")}', esc(libCat(val('p-cat')) || '—'));
    h += ligne('${T("Tailles")}', esc(t.length ? t.join(' · ') : '—'));
    h += ligne('${T("Couleurs")}', c.length
      ? '<span class="pts">' + c.slice(0, 8).map(function(n){ return '<i style="background:' + esc(teinte(n)) + '" title="' + esc(couleurLue(n)) + '"></i>'; }).join('') + '</span>'
        + (c.length > 8 ? ' +' + (c.length - 8) : '')
      : '—');
    h += ligne('${T("Stock")}', tot ? szNombre(tot) + ' ' + (tot > 1 ? '${T("unités")}' : '${T("unité")}') : '—');
    h += ligne('${T("Boutique")}', '<span class="etat ' + (actif ? 'on">${T("Visible")}' : 'off">${T("Masqué")}') + '</span>');
    // Les gardes d enregistrer(), dans leur ordre. ⚠ TOUTES restent affichees
    // (2026-10-04, sa demande) : celle qui est remplie prend un crochet vert au lieu
    // de disparaitre — on voit ce qui est fait, pas seulement ce qui reste.
    var exig = [
      [0, '${T("Photo principale")}', !!IMAGE],
      [1, '${T("Nom du produit")}', !!nom],
      [1, '${T("Catégorie")}', !!val('p-cat')],
      [1, '${T("Poids unitaire")}', !!String(val('p-poids') || '').trim()],
      [1, '${T("Prix de vente")}', p > 0],
      [1, '${T("Coût d’achat")}', co > 0],
      [2, '${T("Au moins une taille et une couleur")}', !!(t.length && c.length)]
    ];
    if (c.length > 1) exig.push([3, '${T("Une photo par couleur secondaire")}',
      c.slice(1).every(function(x){ return !!(PARCOUL[x] && (PARCOUL[x].main || PARCOUL[x].principale)); })]);
    if (!ID && t.length && c.length) exig.push([7, '${T("Une quantité en stock")}', tot > 0]);
    if (cabExigee()) exig.push([0, '${T("Cabine d’essayage prête")}', !!CAB.t.pret]);
    var nManque = exig.filter(function(m){ return !m[2]; }).length;
    h += '<div class="reste">' + (nManque
      ? '<div class="t">${T("Pour enregistrer")}</div>'
      : '<div class="ok"><span class="ic">✓</span> ${T("Prête à enregistrer")}</div>')
      + exig.map(function(m){
          return '<button type="button" data-pfaller="' + m[0] + '"' + (m[2] ? ' class="fait"' : '') + '><span class="o">'
            + (m[2] ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8.5l2.6 2.5L12 5.5"/></svg>' : '')
            + '</span>' + m[1] + '</button>'; }).join('')
      + '</div>';
    // ⚠ RIEN DE CHANGE, RIEN DE REECRIT (2026-10-04). Le volet suit chaque CLIC du
    // formulaire : le reecrire a l identique declenchait l observateur de hauteur,
    // la fenetre se redimensionnait — et Windows ferme une liste deroulante ouverte
    // quand sa fenetre change de taille. La Categorie se refermait seule.
    if (z.getAttribute('data-h') === h) return;
    z.setAttribute('data-h', h);
    z.innerHTML = h;
    z.querySelectorAll('[data-pfaller]').forEach(function(b){
      b.onclick = function(){ Assist.aller(parseInt(b.getAttribute('data-pfaller'), 10) || 0); };
    });
  }

  /* ══ LA CABINE D ESSAYAGE (2026-10-30, ses décisions) ══
     · OBLIGATOIRE pour les vêtements et les accessoires de tête (chapeaux, écharpes…), à la création comme à la
       modification d un ancien article ; chaussures, sacs, bijoux exemptés — la règle vit au pont (_cabineRequise) ;
     · seulement si la face ET le dos sont des photos « sans mannequin » faites au Studio (The New Black) ;
     · le coût affiché ici est celui du SERVEUR (tableau cabine:etat) : déjà payé, reste à faire ; « Préparer la
       cabine » lance chaque angle manquant au prix annoncé — le serveur refuse tout ce qui serait payé deux fois ;
     · tant que la mannequin n est pas configurée au serveur, la cabine est fermée : rien n est exigé. */
  var CAB = { cle: '', t: null, charge: false, enCours: false, suivis: {}, minuterie: null };
  var CAB_T = null;
  var CAB_ANGLES = { a000: '${T("Face")}', a060: '60°', a120: '120°', a180: '${T("Dos")}', a240: '240°', a300: '300°' };
  function cabCategorie(){ return String(val('p-cat') || '') + ' ' + (libCat(val('p-cat')) || ''); }
  function cabExigee(){ if (!CAB) return false; var t = CAB.t; return !!(t && t.ok && t.requise && t.ouverte); }
  function majCabine(force){
    if (!CAB) return;   // appelée par majFiche avant que la cabine soit posée (premier dessin)
    var k = [IMAGE || '', photoDos() || '', cabCategorie(), String(val('p-nom') || '').trim()].join('|');
    if (!force && k === CAB.cle) return;
    CAB.cle = k;
    clearTimeout(CAB_T);
    CAB_T = setTimeout(function(){
      var k0 = CAB.cle;
      CAB.charge = true; dessinerCabine();
      P.appeler('cabine:etat', { face: IMAGE || '', dos: photoDos() || '', categorie: cabCategorie(), nom: String(val('p-nom') || '').trim() }).then(function(t){
        if (k0 !== CAB.cle) return;   // les photos ont changé pendant la lecture : la lecture suivante fait foi
        CAB.charge = false; CAB.t = t || { ok: false, motif: 'cabine_injoignable' };
        dessinerCabine(); majFicheBientot(); cabReprendre();
      });
    }, 400);
  }
  function cabMontant(cr, us){ return szNombre(cr) + ' ' + szPl(cr, '${T("crédit")}', '${T("crédits")}') + ' (' + prixUS(us) + ')'; }
  // Ce qui manque, en une phrase — la même pour la carte et pour le refus d enregistrer.
  function raisonCabine(){
    var t = CAB.t; if (!cabExigee() || t.pret) return '';
    if (t.photosManquantes) return '${T("La cabine d’essayage est obligatoire pour cet article : il faut une photo principale (face) et une photo du dos, faites « sans mannequin » au Studio.")}';
    if (!(t.face && t.face.reconnue) || !(t.dos && t.dos.reconnue)) return '${T("La cabine d’essayage est obligatoire pour cet article : la face et le dos doivent être des photos « sans mannequin » faites au Studio (bouton « Créer au studio »).")}';
    if (t.identiques) return '${T("La photo du dos descend de la même photo que la face : choisissez une vraie photo du dos.")}';
    var enCours = (t.angles || []).some(function(a){ return a.etat === 'cours'; });
    if (enCours || CAB.enCours) return '${T("La cabine d’essayage se prépare : attendez la fin des essayages pour enregistrer.")}';
    return (t.aFaire > 1 ? '${T("Préparez la cabine d’essayage avant d’enregistrer : {0} angles à faire, {1}.")}' : '${T("Préparez la cabine d’essayage avant d’enregistrer : {0} angle à faire, {1}.")}')
      .split('{0}').join(String(t.aFaire)).split('{1}').join(t.resteCredits != null ? cabMontant(t.resteCredits, t.resteDollars) : '…');
  }
  function dessinerCabine(){
    var z = document.getElementById('p-cab-carte'); if (!z) return;
    var t = CAB.t;
    if (!t || (t.ok && t.requise === false)) { z.style.display = 'none'; z.innerHTML = ''; z.removeAttribute('data-h'); return; }
    z.style.display = '';
    var h = '<div class="t"><span class="ic">👗</span> ${T("Cabine d’essayage")}</div>';
    if (!t.ok) h += '<div class="cab-l">' + esc(expliquer(t)) + '</div>';
    else if (!t.ouverte) h += '<div class="cab-l">${T("Pas encore ouverte : la mannequin n’est pas configurée au serveur. Rien n’est exigé pour l’instant.")}</div>';
    else {
      if (!t.photosManquantes) {
        var rec = function(x){ return x && x.reconnue ? (x.origine === 'retouche' ? '${T("✓ sans mannequin (Studio), retouchée")}' : '${T("✓ sans mannequin (Studio)")}') : '${T("✗ pas une photo « sans mannequin » du Studio")}'; };
        h += '<div class="cab-l">${T("Face :")} <b>' + rec(t.face) + '</b></div><div class="cab-l">${T("Dos :")} <b>' + rec(t.dos) + '</b></div>';
      }
      h += '<div class="cab-a">' + (t.angles || []).map(function(a){
        var cl = a.etat === 'reussi' ? 'ok' : (a.etat === 'cours' ? 'cours' : (a.etat === 'rejete' ? 'rate' : ''));
        var ic = a.etat === 'reussi' ? '✓ ' : (a.etat === 'cours' ? '⏳ ' : (a.etat === 'rejete' ? '✗ ' : ''));
        return '<span class="' + cl + '">' + ic + esc(CAB_ANGLES[a.angle] || a.angle) + '</span>';
      }).join('') + '</div>';
      if (t.pret) h += '<div class="cab-l"><b>' + (t.dejaPaye > 0 ? '${T("✓ Cabine prête — payé : {0}")}'.split('{0}').join(prixUS(t.dejaPaye)) : '${T("✓ Cabine prête")}') + '</b></div>';
      else {
        if (t.resteCredits != null && t.aFaire > 0) h += '<div class="cab-l">' + (t.dejaPaye > 0 ? '${T("Reste : {0} — déjà payé : {1}")}' : '${T("Reste : {0}")}')
          .split('{0}').join('<b>' + t.aFaire + ' × ' + szNombre(t.creditsParEssai) + ' = ' + esc(cabMontant(t.resteCredits, t.resteDollars)) + '</b>').split('{1}').join(esc(prixUS(t.dejaPaye || 0))) + '</div>';
        var r = raisonCabine();
        if (r) h += '<div class="cab-l">' + esc(r) + '</div>';
        var peut = !CAB.enCours && t.aFaire > 0 && t.face && t.face.reconnue && t.dos && t.dos.reconnue && !t.identiques;
        if (t.aFaire > 0) h += '<div class="pf-med-l"><button type="button" id="p-cab-go"' + (peut ? '' : ' disabled') + '>'
          + (CAB.enCours ? '<span class="ic">⏳</span> ${T("Lancement…")}' : '<span class="ic">👗</span> ' + '${T("Préparer la cabine ({0})")}'.split('{0}').join(cabMontant(t.resteCredits || 0, t.resteDollars || 0))) + '</button></div>';
      }
    }
    if (CAB.charge) h += '<div class="cab-l">${T("Lecture au serveur…")}</div>';
    if (z.getAttribute('data-h') === h) return;   // rien de changé, rien de réécrit (voir majFiche)
    z.setAttribute('data-h', h); z.innerHTML = h;
    var b = document.getElementById('p-cab-go'); if (b) b.onclick = preparerCabine;
  }
  function preparerCabine(){
    var t = CAB.t;
    if (!cabExigee() || t.pret || CAB.enCours) return;
    var aFaire = (t.angles || []).filter(function(a){ return a.etat === 'a_faire'; }).map(function(a){ return a.angle; });
    if (!aFaire.length || t.prixParEssai == null) return;
    szConfirmer({ prudent: true, titre: '${T("Préparer la cabine d’essayage")}',
      texte: '${T("Le vêtement est essayé par The New Black sur la mannequin de la boutique, sous chaque angle manquant. Chaque essayage n’est payé qu’une fois : une page rechargée, un second poste ou un double clic ne repaient rien.")}',
      details: [['${T("Angles")}', aFaire.map(function(a){ return CAB_ANGLES[a] || a; }).join(' · ')],
        ['${T("Coût")}', cabMontant(t.resteCredits, t.resteDollars)],
        ['${T("Déjà payé pour ces photos")}', prixUS(t.dejaPaye || 0)]],
      oui: '${T("Lancer ({0})")}'.split('{0}').join(prixUS(t.resteDollars)) }).then(function(ok){
        if (!ok || CAB.enCours) return;
        CAB.enCours = true; dessinerCabine();
        var face = IMAGE, dos = photoDos(), prix = t.prixParEssai, refus = null;
        var suite = function(i){
          if (i >= aFaire.length || refus) {
            CAB.enCours = false;
            if (refus) dire(expliquer(refus), 'err'); else dire('${T("Essayages lancés — la cabine se prépare (environ une minute par angle).")}', 'bon');
            majCabine(true); cabSuivre();
            return;
          }
          P.appeler('cabine:essayer', { face: face, dos: dos, angle: aFaire[i], prixAnnonce: prix, produit: ID ? String(ID) : '' }).then(function(r){
            if (r && r.ok && r.id && !r.deja) CAB.suivis[r.id] = aFaire[i];
            else if (!(r && r.ok)) refus = r || { motif: 'echec' };   // le premier refus ARRÊTE la suite : rien d autre ne part
            suite(i + 1);
          });
        };
        suite(0);
      });
  }
  // Les essayages « en cours » du tableau (lancés ici, ou sur un autre poste) sont suivis jusqu à leur fin.
  function cabReprendre(){
    var t = CAB.t; if (!t || !t.ok || !t.angles) return;
    t.angles.forEach(function(a){ if (a.etat === 'cours' && a.tnb) CAB.suivis[a.tnb] = a.angle; });
    cabSuivre();
  }
  function cabSuivre(){
    if (CAB.minuterie || !Object.keys(CAB.suivis).length) return;
    CAB.minuterie = setTimeout(function(){
      var ids = Object.keys(CAB.suivis), fini = 0, n = ids.length;
      ids.forEach(function(id){
        P.appeler('cabine:suivre', { id: id }).then(function(r){
          if (r && r.termine) { delete CAB.suivis[id]; fini++; }
          if (--n > 0) return;
          CAB.minuterie = null;
          if (fini) majCabine(true);
          cabSuivre();
        });
      });
    }, 4000);
  }

  function brancher(){
    document.getElementById('corps').addEventListener('click', function(ev){
      var x = ev.target.closest('[data-coulretire]');
      if (x) { retirerCouleur(x.getAttribute('data-coulretire')); return; }
      // Les TAILLES restent des jetons a bascule ; les COULEURS sont une liste
      // qu on alimente par la recherche, donc leurs jetons ne basculent plus.
      var j = ev.target.closest('#p-tailles .jeton');
      if (j) j.classList.toggle('on');
    });
    ['p-prix', 'p-cout', 'p-solde'].forEach(function(i){
      var e = document.getElementById(i); if (!e) return;
      e.onfocus = function(){ argentFocus(this); };
      e.onblur  = function(){ argentBlur(this); this.classList.remove('manque'); };
      e.oninput = majMarge;
    });
    ['p-nom', 'p-cat', 'p-poids'].forEach(function(i){
      var e = document.getElementById(i);
      if (e) e.oninput = e.onchange = function(){ this.classList.remove('manque'); Assist.fil(); majNom(); };
    });
    var nm = document.getElementById('p-nom');
    if (nm) nm.setAttribute('maxlength', '70');
    majNom();
    var bIa = document.getElementById('p-ia');
    if (bIa) bIa.onclick = rediger;
    var tons = document.getElementById('p-ia-ton');
    if (tons) tons.onclick = function(ev){
      var b = ev.target.closest && ev.target.closest('[data-ton]'); if (!b) return;
      tons.querySelectorAll('[data-ton]').forEach(function(x){ if (x.classList) x.classList.toggle('on', x === b); });
    };
    var sw = document.getElementById('p-solde-on');
    if (sw) sw.onchange = function(){
      if (!this.checked) { var so = document.getElementById('p-solde'); if (so && so.value) { so.value = ''; so.dispatchEvent(new Event('input', { bubbles: true })); } }
      majMarge();
    };
    pucer('p-genre'); pucer('p-age');
    var pDir = document.getElementById('p-direct'), pAnt = document.getElementById('p-anticipe');
    var majDirect = function(){
      if (!pDir || !pAnt) return;
      if (pDir.checked) pAnt.checked = false;
      pAnt.disabled = pDir.checked;
      var pu = document.getElementById('p-publie'); if (pu) pu.disabled = pDir.checked;
    };
    if (pDir) pDir.addEventListener('change', majDirect);
    if (pAnt) pAnt.addEventListener('change', function(){ if (pAnt.checked && pDir) { pDir.checked = false; majDirect(); } });
    window.__pfMajDirect = majDirect;
    majIa();
    // Le SKU suit la categorie — sauf sur une fiche existante, dont le code est
    // deja attribue : le recalculer lui en donnerait un autre a chaque ouverture.
    // ⚠ CHANGER L UNITE NE CHANGE PAS LE POIDS. Passer de « 350 g » a « kg »
    // doit donner « 0.35 », pas « 350 kg ». Sans cette conversion, on croit
    // corriger une unite et l on multiplie le poids par mille — les frais
    // d expedition suivent.
    var uni = document.getElementById('p-unite');
    if (uni) {
      uni.dataset.prec = uni.value;
      uni.onchange = function(){
        var v = parseFloat(val('p-poids')) || 0;
        if (v > 0) {
          var kg = enKg(v, this.dataset.prec || 'g');
          var n = (this.value === 'kg') ? kg : (this.value === 'lb') ? kg / 0.45359237 : kg * 1000;
          poser('p-poids', String(Math.round(n * 1000) / 1000));
        }
        this.dataset.prec = this.value;
      };
    }
    // ⚠ « VENTE FINALE » (1) ET « LIQUIDATION » (3) RETIRENT L ETIQUETTE, pas
    // « aucun retour » (4) : ce dernier bloque les retours sans etre un mode de
    // solde, et son etiquette marketing reste donc legitime. Confondre les trois
    // aurait efface une etiquette voulue.
    // ⚠ LE CHAMP « RETOURS » EST UN MIROIR DE LA CONSEQUENCE, PAS UN 2e REGLAGE.
    // Sur liquidation ou vente finale, il affiche << Aucun retour >>, se grise et
    // se desactive : ces regimes excluent deja les retours par finalSale et
    // liquidation, que la boutique lit depuis toujours.
    // ⚠ ET noReturn N EST PAS FORCE A VRAI POUR AUTANT. Il ne vaut vrai que
    // dans le cas << normal + aucun retour >>, exactement comme avant : l ecrire
    // aussi pour la liquidation reecrirait des donnees que personne n a demande
    // de changer, et la colonne aucun_retour de l export CSV s en trouverait
    // modifiee sur tout le catalogue. Ce qui change, c est ce qu on MONTRE.
    var reg = document.getElementById('p-regime');
    var ret = document.getElementById('p-retours');
    if (reg) reg.onchange = majRegime;
    if (ret) ret.onchange = majRegime;
    majRegime();
    var cat = document.getElementById('p-cat');
    if (cat) cat.addEventListener('change', function(){ if (!ID) majSku(); suivreModePhotos(); dessinerVues(); });
    var rab = document.getElementById('p-rabais');
    if (rab) rab.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-pct]'); if (!b || b.disabled) return;
      var pr = argentNombre(val('p-prix')) || 0;
      if (!pr) return;
      // ⚠ RECLIQUER SUR LE RABAIS ACTIF LE RETIRE. Sans cela, il fallait vider le
      // champ a la main pour revenir au plein prix — et l on garde un solde qu on
      // ne voulait plus, sans s en apercevoir.
      if (b.classList.contains('on')) { poser('p-solde', ''); majMarge(); return; }
      poser('p-solde', szArgentChamp(pr * (1 - parseInt(b.getAttribute('data-pct'), 10) / 100)));
      majMarge();
    });
    document.getElementById('corps').addEventListener('click', function(ev){
      // ⚠ LA PASTILLE DE RETRAIT SE TESTE AVANT LE CADRE QUI LA PORTE. Elle est
      // DANS la vignette : chercher le cadre d abord aurait rouvert le selecteur
      // au moment ou l on voulait retirer la photo.
      if (ev.target.closest('#p-vider')) {
        IMAGE = ''; montrerImage(''); majIa(); dire('');
        return;
      }
      if (ev.target.closest('#p-detourer')) { ouvrirDetourage(); return; }
      if (ev.target.closest('#p-fibre-gen')) { genererFibre(); return; }
      if (ev.target.closest('#p-fibre-x')) { FIBRE = ''; dessinerFibre(); return; }
      if (ev.target.closest('#p-studio')) { ouvrirStudio(); return; }
      if (ev.target.closest('#p-studio-placer')) { placerPrevues(); return; }
      if (ev.target.closest('#p-cv-gen')) { genererVariantes(); return; }
      if (ev.target.closest('#p-vign')) {
        choisirPhoto(function(ds){ IMAGE = ds[0]; montrerImage(IMAGE); majIa(); });
        return;
      }
      var c = ev.target.closest('[data-vue]');
      if (c && modeStandard() && c.getAttribute('data-vue') === cleDos() && cleDos()) {
        // La case Dos PLEINE du mode simple : une seule photo, qui remplace le dos.
        var kr = c.getAttribute('data-vue');
        choisirPhoto(function(ds){ VUES[kr] = ds[0]; DOS_SRC = ds[0]; dessinerVues(); }, false);
        return;
      }
      if (c && c.getAttribute('data-vue') === '__dos__') {
        // La case Dos du mode simple : la photo prend une case libre ET devient le dos.
        choisirPhoto(function(ds){
          var kd = ajouterLibre(ds[0]);
          if (!kd) { dire('Maximum ' + MAX_PHOTOS + ' ${T("photos supplémentaires —")} ${T("retirez-en une pour ajouter le dos.")}', 'att'); return; }
          DOS_SRC = ds[0]; dessinerVues();
        }, false);
        return;
      }
      if (c) {
        var k = c.getAttribute('data-vue');
        // Les cases NOMMEES (angles) prennent une photo chacune ; les cases
        // LIBRES du mode manuel se remplissent en serie.
        var libre = k.indexOf('libre') === 0;
        choisirPhoto(function(ds){
          if (!libre) { VUES[k] = ds[0]; dessinerVues(); return; }
          // Les cases VIDES reçoivent les photos — celle qu on a cliquée d abord, puis les autres dans l ordre
          // (les cases peuvent avoir des trous depuis le glisser-déposer : compter les pleines écraserait).
          var places = [];
          if (!VUES[k]) places.push(k);
          for (var ip = 1; ip <= MAX_PHOTOS; ip++) { if (!VUES['libre' + ip] && ('libre' + ip) !== k) places.push('libre' + ip); }
          var place = places.length;
          if (ds.length > place) {
            dire('Maximum ' + MAX_PHOTOS + ' ${T("photos supplémentaires —")} '
              + (ds.length - place) + ' ' + szPl(ds.length - place, '${T("ignorée.")}', '${T("ignorées.")}'), 'att');
          }
          ds.slice(0, place).forEach(function(d, i){ VUES[places[i]] = d; });
          dessinerVues();
        }, libre);
        return;
      }
      var x = ev.target.closest('[data-vuex]');
      if (x) { var kx = x.getAttribute('data-vuex'); if (DOS_SRC && VUES[kx] === DOS_SRC) DOS_SRC = ''; delete VUES[kx]; dessinerVues(); return; }
      var dp = ev.target.closest('[data-depl]');
      if (dp) { deplacerAuClavier(dp.getAttribute('data-cle'), dp.getAttribute('data-depl')); return; }
      if (ev.target.closest('[data-dosnon]')) { DOS_SRC = ''; dessinerVues(); dire('${T("La photo redevient une photo supplémentaire.")}', 'bon'); return; }
      var xd = ev.target.closest('[data-vuedos]');
      if (xd) {
        var sd = VUES[xd.getAttribute('data-vuedos')] || '';
        DOS_SRC = (sd && sd !== DOS_SRC) ? sd : '';
        dessinerVues();
        return;
      }
      var p = ev.target.closest('[data-coul]');
      if (p) {
        var n = p.getAttribute('data-coul');
        // ⚠ « main », JAMAIS « principale » : la boutique lit main (et les clés
        // d’angle) dans colorVariants. La fenêtre a déposé sous « principale »
        // de 1.40.1 à 1.43.0 — des photos enregistrées que la boutique
        // n’affichait jamais. Le pont traduit encore l’ancienne clé, mais plus
        // personne ne doit l’écrire.
        choisirPhoto(function(ds){
          PARCOUL[n] = PARCOUL[n] || {};
          PARCOUL[n].main = ds[0];
          delete PARCOUL[n].principale;
          dessinerVues();
        });
        return;
      }
      var px = ev.target.closest('[data-coulx]');
      if (px) { delete PARCOUL[px.getAttribute('data-coulx')]; dessinerVues(); }
    });
    var ca = document.getElementById('p-coul-add');
    if (ca) ca.onclick = function(){ ajouterCouleur(); };
    var cl = document.getElementById('p-coul-libre');
    if (cl) {
      cl.oninput = function(){ chercher(this.value); };
      cl.onkeydown = function(ev){
        if (ev.key === 'ArrowDown') { ev.preventDefault(); viser(1); return; }
        if (ev.key === 'ArrowUp')   { ev.preventDefault(); viser(-1); return; }
        if (ev.key === 'Escape')    { if (SUG.length) { ev.stopPropagation(); cacherSug(); } return; }
        if (ev.key === 'Enter') {
          ev.preventDefault();
          // Entree prend la suggestion visee si elle existe, la saisie sinon :
          // c est ce qui permet d ajouter une couleur qui n est pas au catalogue.
          ajouterCouleur(SUG.length && SUGi >= 0 ? SUG[SUGi].nom : null);
        }
      };
      cl.onblur = function(){ setTimeout(cacherSug, 160); };
    }
    var zs = document.getElementById('p-coul-sug');
    if (zs) zs.addEventListener('mousedown', function(ev){
      var e = ev.target.closest('[data-sug]'); if (!e) return;
      ev.preventDefault(); ajouterCouleur(e.getAttribute('data-sug'));
    });
  }

  // ⚠ La marge se calcule sur le prix REELLEMENT paye : un solde actif remplace
  // le prix de vente. L afficher sur le prix barre donnerait une marge que
  // personne n encaisse.
  // Le prochain code libre pour la categorie choisie. "configure: false" veut
  // dire qu aucun prefixe n est defini pour cette categorie : on le DIT, au lieu
  // de laisser un champ vide qui ressemble a un chargement qui n arrive jamais.
  function majSku(){
    var c = val('p-cat');
    if (!c) { poser('p-sku', ''); return; }
    var e = document.getElementById('p-sku');
    if (e) e.placeholder = '${T("calcul du code…")}';
    P.appeler('produit:sku', c).then(function(r){
      if (!e) return;
      // ⚠ UN ECHEC NE DOIT PAS VIDER LE CHAMP EN SILENCE. C est ce que je faisais :
      // le code n apparaissait pas et rien ne disait pourquoi — coquille trop
      // ancienne pour connaitre l operation, droit refuse, ou simplement aucun
      // prefixe configure. Trois causes, un seul symptome, aucun message.
      if (!r || !r.ok) {
        poser('p-sku', '');
        e.placeholder = '${T("code indisponible")}';
        dire('${T("Code (SKU) :")} ' + expliquer(r), 'att');
        return;
      }
      poser('p-sku', r.sku);
      e.placeholder = r.configure ? '' : '${T("aucun code configuré pour cette catégorie")}';
      if (!r.configure) {
        dire('${T("Aucun préfixe de code n’est configuré pour cette catégorie — voyez Inventaire → Catégories.")}', 'att');
      } else { dire(''); }
    });
  }

  function majNom(){
    /* (2026-10-26) Le compteur du NOM (70 au plus) se lit dans SON étiquette : il était posé dans celle de la
       Description, et ne suivait pas la fiche ouverte. */
    var e = document.getElementById('p-nom'), z = document.querySelector('label[for="p-nom"]');
    if (e && z && z.setAttribute) z.setAttribute('data-cpt', (e.value || '').length + '/70');
  }

  // ⚠ AU NIVEAU DU MODULE, PAS DANS brancher. Elle etait imbriquee dans
  // brancher(), donc invisible depuis la reprise d un brouillon : l appeler de
  // la aurait leve une erreur, et le champ des retours serait reste modifiable
  // sur une fiche en vente finale.
  // ⚠ LE CHAMP « RETOURS » EST UN MIROIR DE LA CONSEQUENCE, PAS UN 2e REGLAGE.
  // Sur liquidation ou vente finale, il affiche << Aucun retour >>, se grise et
  // se desactive : ces regimes excluent deja les retours par finalSale et
  // liquidation, que la boutique lit depuis toujours.
  // ⚠ ET noReturn N EST PAS FORCE A VRAI POUR AUTANT (voir pont.js) : il ne
  // vaut vrai que dans le cas << normal + aucun retour >>, exactement comme
  // avant. Ce qui change ici est ce qu on MONTRE, pas ce qu on ecrit.
  function majRegime(){
    var reg = document.getElementById('p-regime');
    var ret = document.getElementById('p-retours');
    var impose = !!reg && reg.value !== 'normal';
    if (impose) { var t = document.getElementById('p-etiq'); if (t) t.value = ''; }
    if (ret) {
      if (impose) {
        // On garde le choix precedent : revenir a << Normal >> doit rendre ce qui
        // avait ete pose, pas un defaut arbitraire.
        if (!ret.disabled) ret.dataset.avant = ret.value;
        ret.value = 'aucun';
        ret.disabled = true;
        ret.style.opacity = '.55';
        ret.style.cursor = 'not-allowed';
      } else {
        if (ret.disabled && ret.dataset.avant) ret.value = ret.dataset.avant;
        ret.disabled = false;
        ret.style.opacity = '';
        ret.style.cursor = '';
      }
    }
    majMarge();
  }

  // Le bouton de redaction n a de sens qu avec une photo : le service regarde
  // le vetement. On le DIT plutot que de laisser cliquer pour rien.
  function majIa(){
    var b = document.getElementById('p-ia');
    if (!b) return;
    var pret = !!IMAGE;
    b.disabled = !pret;
    // ⚠ L explication passe par l INFOBULLE, pas par une ligne sous le bouton.
    // Une phrase d aide permanente occupe la place du formulaire pour dire une
    // chose qu on n a besoin de lire qu une fois.

  }

  function rediger(){
    var b = document.getElementById('p-ia');
    b.disabled = true; dire('${T("Rédaction en cours…")}');
    var cat = (CTX.categories.find(function(c){ return c.cle === val('p-cat'); }) || {}).libelle || '';
    P.appeler('produit:decrire', {
      nom: val('p-nom'), categorie: cat, couleurs: couleurs(), imageDataUrl: IMAGE,
      ton: ((document.querySelector('#p-ia-ton .on') || {}).getAttribute ? document.querySelector('#p-ia-ton .on').getAttribute('data-ton') : 'chaleureux')
    }).then(function(r){
      b.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r) + (r && r.detail ? ' — ' + r.detail : ''), 'err'); return; }
      poser('p-desc', r.texte);
      dire('${T("Description rédigée — relisez-la avant d’enregistrer.")}', 'bon');
    });
  }

  // Les couleurs CHOISIES vivent dans ce tableau, pas dans le DOM : les jetons
  // sont redessines a chaque ajout.
  var CHOIX = [];
  function teinte(nom){
    var c = CTX.couleurs.find(function(x){ return x.nom === nom; });
    return (c && c.hex) || '#888';
  }
  /* ══ LE NOM D UNE COULEUR A DEUX FACES, ET UNE SEULE SE TRADUIT ═══════════
     ⚠⚠⚠ Sa capture du 2026-09-13 : un tableau << SIZE / COLOUR >> dont les
     lignes disaient << XS / rouge >>. La couleur est a la fois une DONNEE et
     un TEXTE :
       · ce que CHOIX garde, ce qui compose la cle de stock (XS-rouge) et ce
         qui repart au site est la DONNEE — elle ne bouge JAMAIS ;
       · ce qui s affiche est le LIBELLE, que la coquille a traduit en chemin.
     Traduire la donnee scinderait l inventaire en silence : XS-rouge et XS-red
     deviendraient deux variantes.
     ⚠ UNE COULEUR AJOUTEE A LA MAIN n est pas au lexique : elle ressort telle
     qu elle a ete tapee, dans les deux langues. C est le mot de la boutique. */
  function couleurLue(nom){
    var c = CTX.couleurs.find(function(x){ return x.nom === nom; });
    return (c && c.libelle) || nom;
  }
  function dessinerJetons(){
    var z = document.getElementById('p-couleurs');
    if (!z) return;
    z.innerHTML = CHOIX.map(function(n){
      return '<span class="jeton on" data-c="' + esc(n) + '">'
        + '<span class="pt" style="background:' + esc(teinte(n)) + '"></span>'
        + esc(couleurLue(n)) + '<span class="x" data-coulretire="' + esc(n) + '">×</span></span>';
    }).join('');
    var v = document.getElementById('p-coul-vide');
    if (v) v.style.display = CHOIX.length ? 'none' : '';
    dessinerVues();
    majFicheBientot();
  }
  function ajouterCouleur(nom){
    var e = document.getElementById('p-coul-libre');
    var v = String(nom != null ? nom : (e ? e.value : '')).trim();
    if (!v) return;
    if (CHOIX.indexOf(v) >= 0) { dire('« ' + v +' ${T("» est déjà dans la liste.")}', 'att'); }
    else { CHOIX.push(v); dire(''); }
    if (e) e.value = '';
    cacherSug();
    dessinerJetons();
  }
  function retirerCouleur(nom){
    var i = CHOIX.indexOf(nom);
    if (i >= 0) CHOIX.splice(i, 1);
    dessinerJetons();
  }

  // ── Suggestions, calquees sur l editeur du site ─────────────────────────
  // Celles qui COMMENCENT par la saisie viennent d abord : c est ce qu on
  // cherche quand on tape « no » pour « noir ».
  var SUG = [], SUGi = -1;
  function cacherSug(){
    var z = document.getElementById('p-coul-sug');
    if (z) { z.classList.remove('on'); z.innerHTML = ''; }
    SUG = []; SUGi = -1;
  }
  function chercher(q){
    q = String(q || '').trim().toLowerCase();
    var z = document.getElementById('p-coul-sug');
    if (!z) return;
    if (!q) { cacherSug(); return; }
    /* ⚠ ON CHERCHE DANS LES DEUX NOMS, et c est necessaire : sur un poste
       anglais la liste affiche << red >>, donc c est << red >> qu on tape. Ne
       chercher que dans la donnee ferait une recherche qui ne trouve pas ce
       qu elle montre. On garde aussi le francais — le meme poste peut recevoir
       un code d article ou une consigne ecrite dans l autre langue. */
    var _cherchable = function(c){ return (c.nom + ' ' + (c.libelle || '')).toLowerCase(); };
    var _debut = function(c){
      return (c.nom.toLowerCase().indexOf(q) === 0 || String(c.libelle || '').toLowerCase().indexOf(q) === 0) ? 0 : 1;
    };
    SUG = CTX.couleurs.filter(function(c){ return _cherchable(c).indexOf(q) >= 0; })
      .sort(function(a, b){ return _debut(a) - _debut(b); }).slice(0, 40);
    if (!SUG.length) { cacherSug(); return; }
    SUGi = 0;
    z.innerHTML = SUG.map(function(c, i){
      var deja = CHOIX.indexOf(c.nom) >= 0;
      return '<div class="s' + (i === 0 ? ' vis' : '') + '" data-sug="' + esc(c.nom) + '">'
        + '<span class="pt" style="background:' + esc(c.hex || '#888') + '"></span>'
        + '<span style="text-transform:capitalize">' + esc(c.libelle || c.nom) + '</span>'
        + (deja ? '<span class="deja">${T("déjà choisie")}</span>' : '') + '</div>';
    }).join('');
    z.classList.add('on');
  }
  function viser(d){
    if (!SUG.length) return;
    SUGi = Math.max(0, Math.min(SUG.length - 1, SUGi + d));
    var z = document.getElementById('p-coul-sug');
    Array.prototype.forEach.call(z.querySelectorAll('.s'), function(e, i){
      e.classList.toggle('vis', i === SUGi);
      if (i === SUGi) e.scrollIntoView({ block: 'nearest' });
    });
  }

  // ── Champs d argent, calques sur l editeur du site ──────────────────────
  // ⚠ LA VIRGULE EST ACCEPTEE. C est le separateur decimal d ici : quelqu un qui
  // tape « 125,50 » a raison, et un champ qui lui rend zero a tort.
  // A la prise de focus on montre le nombre NU — on ne corrige pas « 125.00 $ »
  // en se battant contre le curseur. Au depart du champ, on met en forme.
  // ⚠ ET LE SEPARATEUR DE MILLIERS AUSSI (2026-10-25, audit). « 1,234.50 » tapé
  // en anglais devenait « 1.234.50 » → 1,23 $ : le prix divisé par mille. Règle :
  // si les deux signes sont présents, le DERNIER est la décimale ; un signe
  // répété est un groupement ; en anglais, une virgule seule suivie de trois
  // chiffres groupe les milliers. Un point seul reste décimal dans les deux
  // langues (argentFocus écrit « 125.5 »).
  function argentNombre(v){
    var s = String(v || '').replace(/[^0-9.,-]/g, '');
    var pv = s.lastIndexOf(','), pp = s.lastIndexOf('.');
    if (pv >= 0 && pp >= 0) {
      s = (pv > pp) ? s.split('.').join('').replace(',', '.') : s.split(',').join('');
    } else if (pv >= 0) {
      if (s.indexOf(',') !== pv) s = s.split(',').join('');
      else if ('${SEP_DEC()}' === '.' && /^-?[0-9]{1,3},[0-9]{3}$/.test(s)) s = s.replace(',', '');
      else s = s.replace(',', '.');
    } else if (pp >= 0 && s.indexOf('.') !== pp) {
      s = s.split('.').join('');
    }
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  function argentFocus(e){ var n = argentNombre(e.value); e.value = (n === null) ? '' : String(n); }
  function argentBlur(e){
    var n = argentNombre(e.value);
    e.value = (n === null) ? '' : szArgentChamp(n);
    majMarge(); Assist.fil();
  }

  var PCTS = [10, 15, 20, 25, 30, 40, 50];
  function majMarge(){
    // ⚠ On lit par "argentNombre" : le champ contient « 125.00 $ » une fois mis
    // en forme, et "parseFloat" s arreterait au premier caractere non numerique
    // — ce qui marche par hasard ici, mais pas avec une virgule decimale.
    var p = argentNombre(val('p-prix')) || 0;
    var s = argentNombre(val('p-solde')) || 0;
    var c = argentNombre(val('p-cout')) || 0;
    var eff = (s > 0 && s < p) ? s : p;

    // Rabais rapides — un bouton par pourcentage, DESACTIVE si le prix obtenu
    // passe sous le cout. Proposer un rabais qui fait vendre a perte, c est
    // proposer une erreur.
    // Sans etiquette : les boutons sont sous le champ qu ils modifient, et
    // « -10% » se comprend seul.
    var z = document.getElementById('p-rabais');
    if (z) {
      z.innerHTML = PCTS.map(function(pct){
        var sp = p ? +(p * (1 - pct / 100)).toFixed(2) : 0;
        var sousCout = c > 0 && sp > 0 && sp < c;
        var actif = s > 0 && p > 0 && Math.round((1 - s / p) * 100) === pct;
        return '<button type="button" data-pct="' + pct + '"' + (actif ? ' class="on"' : '')
          + (!p || sousCout ? ' disabled' : '') + '>'
          + '−' + pct + ' %</button>';
      }).join('');
    }
    // La pastille se pose DANS l etiquette du prix solde, a droite : c est la
    // qu on regarde pour savoir de combien on rabat.
    var pa = document.getElementById('p-pastille');
    if (pa) {
      var remise = (s > 0 && p > 0 && s < p) ? Math.round((1 - s / p) * 100) : 0;
      pa.textContent = remise ? '−' + remise + ' %' : '';
      pa.classList.toggle('on', !!remise);
    }

    // ⚠ ETIQUETTE « SOLDE » AUTOMATIQUE, comme dans l editeur du site — mais
    // JAMAIS sur un produit deja en liquidation ou en vente finale : ces regimes
    // ont leur propre etiquette, et en poser une seconde par-dessus donne deux
    // messages contradictoires sur la meme fiche.
    var etiq = document.getElementById('p-etiq');
    var reg = val('p-regime');
    if (etiq && reg === 'normal') {
      if (p && s && s < p) etiq.value = 'Solde';
      else if (etiq.value === 'Solde') etiq.value = '';
    }

    var al = document.getElementById('p-alerte');
    if (al) {
      if (c > 0 && eff > 0 && eff < c) {
        al.textContent = '${T("Le prix de vente effectif (")}' + szArgent(eff) + '${T(") est inférieur au coût d’acquisition (")}'
          + szArgent(c) + ').';
        al.style.display = 'block';
      } else { al.style.display = 'none'; }
    }

    // « Mettre en solde » (2026-10-26) : un prix soldé posé (fiche, brouillon, rabais rapide) ouvre la bascule.
    var sw = document.getElementById('p-solde-on'), pc = document.getElementById('p-prix-carte');
    if (sw && s > 0) sw.checked = true;
    if (pc && sw && pc.classList) pc.classList.toggle('sans-solde', !sw.checked);
    var el = document.getElementById('p-marge'); if (!el) return;
    var mb = document.getElementById('p-marge-barre');
    if (!(eff > 0) || !(c > 0)) { el.textContent = ''; if (mb) mb.hidden = true; return; }
    var m = eff - c, pct = Math.round((m / eff) * 100);
    if (mb) { mb.hidden = false; var mi = mb.querySelector && mb.querySelector('i'); if (mi) mi.style.width = Math.max(2, Math.min(100, pct)) + '%'; if (mi && mi.classList) mi.classList.toggle('perte', m <= 0); }
    el.innerHTML = '${T("Marge :")} <strong>' + szArgent(m) + '</strong> (' + szNombre(pct, 1) + ' %)'
      + (s > 0 && s < p ? ' ${T("— calculée sur le prix soldé")}' : '')
      + (m <= 0 ? ' <span style="color:var(--tx-err)">${T("— vente à perte")}</span>' : '');
  }

  // Un cadre par vue : on clique, on choisit un fichier. Le « x » retire.
  /* ══ MESURES DU VÊTEMENT (7.13.0, 2026-10-09) ═══════════════════════════════════════════
     Sa demande : « un système automatisé qui, à partir de la photo du vêtement, donne les
     mesures de taille… le tout pour réduire les retours au maximum ». Gratuit, sans service :
     on photographie le vêtement À PLAT à côté d une feuille LETTRE (ou A4) ; la fenêtre trouve
     la feuille toute seule (la plus grande zone blanche au bon rapport de côtés) et en tire
     l échelle ; on clique ensuite le début et la fin de chaque mesure. La gradation standard
     complète les autres tailles, à corriger au besoin. La boutique compare ces mesures à
     celles de la cliente (taille suggérée).
     Les mesures de tour sont prises À PLAT (moitié du tour), comme on mesure un vêtement posé.
     ⚠ La détection de la feuille veut un fond qui n est PAS blanc : sur un drap blanc, elle
     échoue et le dit — on clique alors les deux bouts du grand côté de la feuille. */
  var MESV = { type: '', tailles: {} };
  var MV_TYPES = {
    haut: [['poitrine', '${T("Poitrine (à plat)")}', '${T("d’une aisselle à l’autre")}'],
           ['longueur', '${T("Longueur")}', '${T("du haut de l’épaule jusqu’au bas")}'],
           ['manche', '${T("Manche")}', '${T("de la couture d’épaule au poignet")}'],
           ['epaules', '${T("Épaules")}', '${T("d’une couture d’épaule à l’autre")}']],
    bas:  [['taille', '${T("Taille (à plat)")}', '${T("d’un côté à l’autre de la ceinture")}'],
           ['hanches', '${T("Hanches (à plat)")}', '${T("au plus large, sous la braguette")}'],
           ['longueur', '${T("Longueur")}', '${T("de la ceinture jusqu’au bas")}'],
           ['entrejambe', '${T("Entrejambe")}', '${T("de l’entrejambe jusqu’au bas")}']],
    robe: [['poitrine', '${T("Poitrine (à plat)")}', '${T("d’une aisselle à l’autre")}'],
           ['taille', '${T("Taille (à plat)")}', '${T("au plus étroit")}'],
           ['hanches', '${T("Hanches (à plat)")}', '${T("au plus large")}'],
           ['longueur', '${T("Longueur")}', '${T("du haut de l’épaule jusqu’au bas")}']]
  };
  // Le pas de gradation entre deux tailles voisines (cm) — l usage courant du prêt-à-porter.
  var MV_PAS = { poitrine: 2.5, taille: 2.5, hanches: 2.5, epaules: 1, longueur: 1.5, manche: 1, entrejambe: 0 };
  function mvTypeDefaut(){
    var c = String(val('p-cat') || '').toLowerCase();
    if (/robe|combin/.test(c)) return 'robe';
    if (/pantalon|jean|jupe|short|legging/.test(c)) return 'bas';
    if (/accessoire|chaussure|bijou|sac/.test(c)) return '';
    return 'haut';
  }
  function mvType(){ return MESV.type === 'aucun' ? '' : (MESV.type || mvTypeDefaut()); }
  function mvDepuisFiche(m){
    var o = { type: '', tailles: {} };
    if (!m || typeof m !== 'object') return o;
    o.type = MV_TYPES[m.type] ? m.type : '';
    Object.keys(m.tailles || {}).forEach(function(t){
      var src = m.tailles[t] || {}, d = {};
      Object.keys(src).forEach(function(k){ var n = parseFloat(src[k]); if (n > 0) d[k] = n; });
      if (Object.keys(d).length) o.tailles[t] = d;
    });
    return o;
  }
  function mvPourEnvoi(){
    var ty = mvType(); if (!ty) return null;
    var cles = MV_TYPES[ty].map(function(x){ return x[0]; }), out = {};
    tailles().forEach(function(t){
      var src = MESV.tailles[t] || {}, d = {};
      cles.forEach(function(k){ var n = parseFloat(src[k]); if (n > 0) d[k] = Math.round(n * 2) / 2; });
      if (Object.keys(d).length) out[t] = d;
    });
    return Object.keys(out).length ? { type: ty, unite: 'cm', tailles: out } : null;
  }
  /* ══ COMPOSITION ET ENTRETIEN (2026-10-11) ═══════════════════════════════
     ENT = les CLÉS cochées. La liste et les libellés viennent du site (CTX.entretien) :
     la fenêtre n'en a pas de copie. Seules les clés partent ; le pont refuse les autres. */
  var ENT = new Set();
  var ENT_LG = '${require('../langue').langueCourante() === 'en' ? 'en' : 'fr'}';
  function dessinerEntretien(){
    var z = document.getElementById('p-ent'); if (!z || !CTX) return;
    var liste = CTX.entretien || [], groupes = CTX.entretienGroupes || [], modeles = CTX.entretienModeles || [];
    if (!liste.length) { z.innerHTML = '<div class="aide">${T("Liste des consignes indisponible — mettez le site à jour.")}</div>'; return; }
    var zm = document.getElementById('p-ent-modeles');
    if (zm) {
      var pareil = function(m){ return m.codes.length === ENT.size && m.codes.every(function(c){ return ENT.has(c); }); };
      zm.innerHTML = '<span class="aide">${T("Ensembles rapides :")}</span><span class="ent-seg">' + modeles.map(function(m){
        return '<button type="button" data-ent-modele="' + esc(m.cle) + '"' + (pareil(m) ? ' class="on"' : '') + '>' + esc(m[ENT_LG] || m.fr) + '</button>';
      }).join('') + '</span>' + (ENT.size ? '<button type="button" class="mini ent-vider" data-ent-vider="1">${T("Tout décocher")}</button>' : '');
      zm.querySelectorAll('[data-ent-modele]').forEach(function(b){
        b.onclick = function(){
          var m = modeles.filter(function(x){ return x.cle === b.getAttribute('data-ent-modele'); })[0];
          if (!m) return;
          ENT = new Set(m.codes); dessinerEntretien(); majFicheBientot();
        };
      });
      var bv = zm.querySelector('[data-ent-vider]');
      if (bv) bv.onclick = function(){ ENT = new Set(); dessinerEntretien(); majFicheBientot(); };
    }
    z.innerHTML = groupes.map(function(g){
      var items = liste.filter(function(c){ return c.groupe === g.cle; });
      if (!items.length) return '';
      var pris = items.filter(function(c){ return ENT.has(c.cle); }).length;
      return '<div class="ent-groupe"><h3><span>' + esc(g[ENT_LG] || g.fr) + '</span>' + (pris ? '<span class="n">' + pris + '</span>' : '') + '</h3><div class="ent-grille">'
        + items.map(function(c){
          var on = ENT.has(c.cle);
          return '<label class="' + (on ? 'on' : '') + '"><input type="checkbox" data-ent="' + esc(c.cle) + '"' + (on ? ' checked' : '') + '>'
            + (c.ico || '') + '<span>' + esc(c[ENT_LG] || c.fr) + '</span></label>';
        }).join('') + '</div></div>';
    }).join('');
    z.querySelectorAll('input[data-ent]').forEach(function(cb){
      cb.onchange = function(){
        var k = cb.getAttribute('data-ent');
        if (cb.checked) ENT.add(k); else ENT.delete(k);
        dessinerEntretien(); majFicheBientot();
        var re = document.querySelector('input[data-ent="' + k + '"]'); if (re) re.focus();
      };
    });
  }
  function entPourEnvoi(){
    return { codes: Array.from(ENT), autre: String(val('p-ent-autre') || '').trim(), composition: String(val('p-compo') || '').trim() };
  }
  function dessinerMesures(){
    var z = document.getElementById('p-mesv-table'); if (!z) return;
    var sel = document.getElementById('p-mesv-type');
    var ty = mvType();
    if (sel) { sel.value = ty || 'aucun'; sel.onchange = function(){ MESV.type = sel.value; dessinerMesures(); }; }
    var bp = document.getElementById('p-mesv-photo'); if (bp) bp.onclick = mvOutilPhoto;
    var ts = tailles();
    var st = document.getElementById('p-mesv-t');
    if (st) {
      var tp = mvTaillePhoto();
      st.innerHTML = ts.map(function(t){ return '<option' + (t === tp ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('');
      st.disabled = !ty || !ts.length;
      st.onchange = function(){ mvChangerTaille(st.value); };
    }
    mvAnalyser();
    if (!ty) { z.innerHTML = '<div class="aide">${T("Aucune mesure pour ce type d’article. Choisissez un type ci-dessus si le vêtement en a besoin.")}</div>'; return; }
    if (!ts.length) { z.innerHTML = '<div class="aide">${T("Choisissez d’abord les tailles à l’étape « Tailles et couleurs ».")}</div>'; return; }
    var cols = MV_TYPES[ty];
    var tpo = mvTaillePhoto();
    /* DES PAGES, PAS UNE GLISSIÈRE (2026-10-20, sa question : « as-tu prévu une vingtaine de lignes ? ») : au-delà
       de 8 tailles, le tableau se lit page par page ; la page s ouvre sur la taille photographiée. */
    var PAR = 8, nbP = Math.max(1, Math.ceil(ts.length / PAR));
    if (MV_PAGE == null || MV_PAGE >= nbP) MV_PAGE = Math.max(0, Math.floor(Math.max(0, ts.indexOf(tpo)) / PAR));
    var tsP = ts.slice(MV_PAGE * PAR, MV_PAGE * PAR + PAR);
    z.innerHTML = '<div class="mesv-cadre"><table class="mesv"><colgroup><col class="c-t">' + cols.map(function(){ return '<col>'; }).join('') + '</colgroup><thead><tr><th><b>${T("Taille")}</b></th>'
      + cols.map(function(c){ return '<th><b>' + c[1] + '</b><small>' + c[2] + '</small></th>'; }).join('') + '</tr></thead><tbody>'
      + tsP.map(function(t){
          var r = MESV.tailles[t] || {};
          return '<tr' + (t === tpo ? ' class="mv-ref"' : '') + '><th><span>' + esc(t) + '</span></th>' + cols.map(function(c){
            return '<td><span class="mv-cm' + (MV_GRAD[t + '|' + c[0]] ? ' grad' : '') + '"><input type="number" min="0" step="0.5" inputmode="decimal" data-mvt="' + esc(t) + '" data-mvk="' + c[0] + '" value="' + (r[c[0]] || '') + '" aria-label="' + esc(t + ' — ' + c[1]) + '"><i>cm</i></span></td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>'
      + (nbP > 1 ? '<div class="mesv-pages"><button type="button" class="mini" data-mvp="-1"' + (MV_PAGE ? '' : ' disabled') + '>‹</button><span>${T("Tailles")} '
          + (MV_PAGE * PAR + 1) + '–' + Math.min(ts.length, MV_PAGE * PAR + PAR) + ' ${T("sur")} ' + ts.length + '</span>'
          + '<button type="button" class="mini" data-mvp="1"' + (MV_PAGE < nbP - 1 ? '' : ' disabled') + '>›</button></div>' : '')
      + '<div class="aide mesv-note">'
      + '<span class="lg"><i></i>${T("complétée d’après la taille mesurée — tapez-y pour la remplacer")}</span></div>';
    z.querySelectorAll('[data-mvp]').forEach(function(b){ b.onclick = function(){ MV_PAGE += +b.getAttribute('data-mvp'); dessinerMesures(); }; });
    z.querySelectorAll('input[data-mvt]').forEach(function(el){
      el.oninput = function(){
        var t = el.getAttribute('data-mvt'), k = el.getAttribute('data-mvk'), n = parseFloat(String(el.value).replace(',', '.'));
        MESV.tailles[t] = MESV.tailles[t] || {};
        if (n > 0) MESV.tailles[t][k] = n; else delete MESV.tailles[t][k];
        delete MV_GRAD[t + '|' + k]; el.parentNode.classList.remove('grad');
        mvAutoGraduer(true);
      };
    });
  }
  /* LES AUTRES TAILLES SE COMPLÈTENT TOUTES SEULES (2026-10-20, sa demande : « au minimum, que mes tailles
     se complètent seules »). La taille de référence est celle qui a le plus de mesures PRISES (tapées ou
     lues sur la photo) ; chaque autre taille reçoit, dans ses cases vides, la gradation standard du
     prêt-à-porter (MV_PAS). Une case complétée ainsi reste marquée (MV_GRAD) : elle suit la référence
     si celle-ci change, et ne bouge plus dès qu on y tape. */
  var MV_GRAD = {}, MV_PAGE = null;
  function mvAutoGraduer(enPlace){
    var ty = mvType(), ts = tailles(); if (!ty || ts.length < 2) return;
    var cles = MV_TYPES[ty].map(function(x){ return x[0]; });
    var prises = function(t){ var r = MESV.tailles[t] || {}; return cles.filter(function(k){ return r[k] > 0 && !MV_GRAD[t + '|' + k]; }).length; };
    var ref = null, max = 0;
    ts.forEach(function(t){ var n = prises(t); if (n > max) { max = n; ref = t; } });
    var iRef = ts.indexOf(ref);
    ts.forEach(function(t, i){
      MESV.tailles[t] = MESV.tailles[t] || {};
      cles.forEach(function(k){
        var cle = t + '|' + k, r = MESV.tailles[t];
        if (r[k] > 0 && !MV_GRAD[cle]) return;              // une valeur prise : on n y touche jamais
        var base = ref && t !== ref ? (MESV.tailles[ref] || {})[k] : 0;
        var v = (base > 0 && !MV_GRAD[ref + '|' + k]) ? Math.round((base + (i - iRef) * (MV_PAS[k] || 0)) * 2) / 2 : 0;
        if (v > 0) { r[k] = v; MV_GRAD[cle] = 1; } else if (MV_GRAD[cle]) { delete r[k]; delete MV_GRAD[cle]; }
        if (enPlace) {
          var el = document.querySelector('input[data-mvt="' + t + '"][data-mvk="' + k + '"]');
          if (el && document.activeElement !== el) { el.value = r[k] || ''; el.parentNode.classList.toggle('grad', !!MV_GRAD[cle]); }
        }
      });
    });
  }
  // Complète les cases VIDES à partir de la taille la mieux remplie (gradation standard).
  function mvGraduer(){
    var ty = mvType(), ts = tailles(); if (!ty || !ts.length) return;
    var cles = MV_TYPES[ty].map(function(x){ return x[0]; });
    var ref = null, max = 0;
    ts.forEach(function(t){ var n = Object.keys(MESV.tailles[t] || {}).length; if (n > max) { max = n; ref = t; } });
    if (!ref) { dire('${T("Mesurez d’abord au moins une taille.")}', 'att'); return; }
    var iRef = ts.indexOf(ref), faits = 0;
    ts.forEach(function(t, i){
      if (t === ref) return;
      MESV.tailles[t] = MESV.tailles[t] || {};
      cles.forEach(function(k){
        var base = MESV.tailles[ref][k];
        if (!(base > 0) || MESV.tailles[t][k] > 0) return;
        MESV.tailles[t][k] = Math.round((base + (i - iRef) * (MV_PAS[k] || 0)) * 2) / 2; faits++;
      });
    });
    dessinerMesures();
    dire(faits ? '${T("Autres tailles complétées d’après la taille ")}' + ref + '${T(" — vérifiez-les si vous avez le vêtement.")}' : '${T("Rien à compléter.")}', faits ? 'bon' : '');
  }

  /* LA FEUILLE, TROUVÉE TOUTE SEULE : la plus grande zone blanche (claire et peu colorée),
     d un seul tenant, pleine, au rapport de côtés d une feuille. Ses dimensions viennent de
     ses moments (un rectangle plein de côté L a une variance L²/12 le long de son axe). */
  function mvTrouverFeuille(cv, format){
    var W = cv.width, H = cv.height, pas = Math.max(1, Math.round(Math.max(W, H) / 420));
    var w = Math.floor(W / pas), h = Math.floor(H / pas);
    var px = cv.getContext('2d').getImageData(0, 0, W, H).data;
    var blanc = new Uint8Array(w * h), lum = [];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = ((y * pas) * W + x * pas) * 4, r = px[i], g = px[i + 1], b = px[i + 2];
      var l = (r + g + b) / 3; lum.push(l);
      blanc[y * w + x] = (l > 0 && (Math.max(r, g, b) - Math.min(r, g, b)) < 34) ? Math.round(l) : 0;
    }
    lum.sort(function(a, b){ return a - b; });
    var seuil = Math.max(170, lum[Math.floor(lum.length * 0.97)] - 32);
    var vu = new Uint8Array(w * h), meilleur = null;
    for (var s0 = 0; s0 < w * h; s0++) {
      if (vu[s0] || blanc[s0] < seuil) continue;
      var pile = [s0], n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, auBord = false; vu[s0] = 1;
      while (pile.length) {
        var c = pile.pop(), cx = c % w, cy = (c - cx) / w;
        if (cx === 0 || cy === 0 || cx === w - 1 || cy === h - 1) auBord = true;
        n++; sx += cx; sy += cy; sxx += cx * cx; syy += cy * cy; sxy += cx * cy;
        var v = [c - 1, c + 1, c - w, c + w];
        for (var k = 0; k < 4; k++) {
          var q = v[k]; if (q < 0 || q >= w * h || vu[q]) continue;
          if ((k === 0 && cx === 0) || (k === 1 && cx === w - 1)) continue;
          if (blanc[q] >= seuil) { vu[q] = 1; pile.push(q); }
        }
      }
      /* Une feuille est POSÉE dans la photo : elle ne touche pas le bord et n en couvre pas le
         quart (2026-10-20 : sur un mur blanc, le mur lui-même passait pour la feuille). */
      if (auBord || n < w * h * 0.01 || n > w * h * 0.25) continue;
      var mx = sx / n, my = sy / n, a = sxx / n - mx * mx, d = syy / n - my * my, bb = sxy / n - mx * my;
      var t2 = (a + d) / 2, del = Math.sqrt(Math.max(0, (a - d) * (a - d) / 4 + bb * bb));
      var L = Math.sqrt(12 * (t2 + del)), l2 = Math.sqrt(12 * Math.max(0, t2 - del));
      if (!(l2 > 0)) continue;
      var ratio = L / l2, cible = format === 'a4' ? 297 / 210 : 279.4 / 215.9;
      var plein = n / (L * l2);
      if (Math.abs(ratio - cible) > 0.16 || plein < 0.78) continue;
      if (!meilleur || n > meilleur.n) meilleur = { n: n, L: L * pas, l: l2 * pas, cx: mx * pas, cy: my * pas,
        ang: 0.5 * Math.atan2(2 * bb, a - d) };
    }
    if (!meilleur) return null;
    var dims = format === 'a4' ? [29.7, 21] : [27.94, 21.59];
    meilleur.pxParCm = (meilleur.L / dims[0] + meilleur.l / dims[1]) / 2;
    return meilleur;
  }

  /* LES MESURES, PRISES TOUTES SEULES (2026-10-20, sa demande : « ne mesure pas automatiquement
     les mesures et ça le devrait »). Le vêtement est ce qui ne ressemble pas au FOND — le fond
     étant lu sur le pourtour de la photo — moins la feuille ; on garde la plus grande pièce
     d un seul tenant, puis on lit sa silhouette rangée par rangée :
       · la rangée « du corps » est le segment qui contient l axe du vêtement ;
       · l aisselle est là où ce segment SAUTE (les manches s y rattachent, ou l emmanchure
         d un sans-manches le rétrécit) ; la poitrine se lit 2,5 cm plus bas ;
       · les épaules, 3 cm sous le haut ; la manche, de l épaule au point le plus éloigné ;
       · pour un bas, l entrejambe commence où l axe sort du tissu.
     Ce sont des ESTIMATIONS : chaque trait est dessiné sur la photo et se refait d un clic.
     Elles ne valent que pour un vêtement À PLAT sur un fond qui tranche ; sur un mannequin ou
     un fond de la couleur du tissu, la silhouette n est pas celle du vêtement — on le dit. */
  function mvMesurerAuto(cv, ty, echelle, feuille){
    var W = cv.width, H = cv.height, pas = Math.max(1, Math.round(Math.max(W, H) / 420));
    var w = Math.floor(W / pas), h = Math.floor(H / pas), N = w * h;
    var px = cv.getContext('2d').getImageData(0, 0, W, H).data;
    var R = new Float32Array(N), G = new Float32Array(N), B = new Float32Array(N);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = ((y * pas) * W + x * pas) * 4, j = y * w + x;
      R[j] = px[i]; G[j] = px[i + 1]; B[j] = px[i + 2];
    }
    // Le fond : la médiane du pourtour, et son écart (un fond texturé élargit le seuil).
    var bord = [];
    for (var x2 = 0; x2 < w; x2++) { bord.push(x2, (h - 1) * w + x2); }
    for (var y2 = 0; y2 < h; y2++) { bord.push(y2 * w, y2 * w + w - 1); }
    var med = function(t){ var a = bord.map(function(j){ return t[j]; }).sort(function(p, q){ return p - q; }); return a[a.length >> 1]; };
    var fr = med(R), fg = med(G), fb = med(B);
    var dist = function(j){ return Math.sqrt((R[j] - fr) * (R[j] - fr) + (G[j] - fg) * (G[j] - fg) + (B[j] - fb) * (B[j] - fb)); };
    var db = bord.map(dist).sort(function(p, q){ return p - q; });
    /* Le pourtour n est pas tout fond (2026-10-20, sa photo : un cadre de porte à gauche, de la brique à
       droite) : l écart se lit sur la MOITIÉ du pourtour la plus proche de la médiane, le vrai fond. */
    var seuil = Math.max(30, db[Math.floor(db.length * 0.45)] + 14);
    var dans = function(xx, yy){
      if (!feuille) return false;
      var dx = xx * pas - feuille.cx, dy = yy * pas - feuille.cy, c = Math.cos(-feuille.ang), s = Math.sin(-feuille.ang);
      return Math.abs(dx * c - dy * s) < feuille.L * 0.56 && Math.abs(dx * s + dy * c) < feuille.l * 0.56;
    };
    var m = new Uint8Array(N);
    for (var y3 = 0; y3 < h; y3++) for (var x3 = 0; x3 < w; x3++) {
      var j3 = y3 * w + x3; m[j3] = (dist(j3) > seuil && !dans(x3, y3)) ? 1 : 0;
    }
    // Fermeture 3 × 3 : bouche les petits trous (un imprimé de la couleur du fond).
    var dil = new Uint8Array(N), m2 = new Uint8Array(N);
    for (var y4 = 1; y4 < h - 1; y4++) for (var x4 = 1; x4 < w - 1; x4++) {
      var j4 = y4 * w + x4;
      dil[j4] = (m[j4] | m[j4 - 1] | m[j4 + 1] | m[j4 - w] | m[j4 + w] | m[j4 - w - 1] | m[j4 - w + 1] | m[j4 + w - 1] | m[j4 + w + 1]) ? 1 : 0;
    }
    for (var y5 = 1; y5 < h - 1; y5++) for (var x5 = 1; x5 < w - 1; x5++) {
      var j5 = y5 * w + x5;
      m2[j5] = (dil[j5] & dil[j5 - 1] & dil[j5 + 1] & dil[j5 - w] & dil[j5 + w] & dil[j5 - w - 1] & dil[j5 - w + 1] & dil[j5 + w - 1] & dil[j5 + w + 1]) ? 1 : 0;
    }
    // La plus grande pièce d un seul tenant.
    var lab = new Int32Array(N), meil = 0, meilN = 0, nlab = 0, touche = 0;
    for (var s0 = 0; s0 < N; s0++) {
      if (!m2[s0] || lab[s0]) continue;
      nlab++; var pile = [s0], n = 0, tb = 0; lab[s0] = nlab;
      while (pile.length) {
        var c = pile.pop(), cx = c % w, cy = (c - cx) / w; n++;
        if (cx <= 1 || cy <= 1 || cx >= w - 2 || cy >= h - 2) tb++;
        if (cx > 0 && m2[c - 1] && !lab[c - 1]) { lab[c - 1] = nlab; pile.push(c - 1); }
        if (cx < w - 1 && m2[c + 1] && !lab[c + 1]) { lab[c + 1] = nlab; pile.push(c + 1); }
        if (cy > 0 && m2[c - w] && !lab[c - w]) { lab[c - w] = nlab; pile.push(c - w); }
        if (cy < h - 1 && m2[c + w] && !lab[c + w]) { lab[c + w] = nlab; pile.push(c + w); }
      }
      // Une pièce collée au pourtour sur plus du dixième de sa longueur est le décor (porte, mur), pas le vêtement.
      if (tb > (w + h) * 0.2) continue;
      if (n > meilN) { meilN = n; meil = nlab; touche = tb; }
    }
    if (meilN < N * 0.03) return { erreur: 'fond' };
    if (touche > (w + h) * 0.25) return { erreur: 'bord' };
    var top = h, bas = -1, sxm = 0;
    var ext = [];
    for (var y6 = 0; y6 < h; y6++) {
      var g = -1, d = -1;
      for (var x6 = 0; x6 < w; x6++) if (lab[y6 * w + x6] === meil) { if (g < 0) g = x6; d = x6; sxm += x6; }
      ext.push([g, d]);
      if (g >= 0) { if (y6 < top) top = y6; bas = y6; }
    }
    var axe = Math.round(sxm / meilN);
    // Le segment du corps sur une rangée : celui qui contient l axe (ou le plus proche).
    var corps = function(yy){
      if (yy < 0 || yy >= h || ext[yy][0] < 0) return null;
      var best = null, a = -1;
      for (var xx = 0; xx <= w; xx++) {
        var on = xx < w && lab[yy * w + xx] === meil;
        if (on && a < 0) a = xx;
        if (!on && a >= 0) {
          var dd = axe < a ? a - axe : axe > xx - 1 ? axe - xx + 1 : 0;
          if (!best || dd < best.dd || (dd === best.dd && xx - a > best.d - best.g)) best = { g: a, d: xx - 1, dd: dd };
          a = -1;
        }
      }
      return best && best.dd <= Math.max(3, w * 0.03) ? best : null;
    };
    var parCm = echelle / pas;
    var P = function(xx, yy){ return [xx * pas + pas / 2, yy * pas + pas / 2]; };
    var out = {};
    /* LA VRAISEMBLANCE (2026-10-20, sa photo sur mannequin : « épaules 156 cm ») : un trait qui touche le
       bord de la photo mesure le cadrage, pas le vêtement ; une valeur hors de ce qu un vêtement à plat
       peut mesurer vient d une silhouette mêlée au décor. Dans les deux cas : rien plutôt qu un chiffre faux. */
    var BORNES = { poitrine: [25, 80], taille: [20, 75], hanches: [25, 85], epaules: [25, 60], longueur: [30, 160], manche: [10, 90], entrejambe: [30, 100] };
    var auBord = function(p){ return p[0] < W * 0.015 || p[1] < H * 0.015 || p[0] > W * 0.985 || p[1] > H * 0.985; };
    var ecartes = 0;
    var ligne = function(k, a, b){
      var l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (!(l > 2)) return;
      var v = Math.round(l / echelle * 2) / 2, bo = BORNES[k] || [1, 300];
      if (auBord(a) || auBord(b) || v < bo[0] || v > bo[1]) { ecartes++; return; }
      out[k] = { a: a, b: b, cm: v };
    };
    var haut0 = top, bas0 = bas, L = bas0 - haut0;
    if (L < 10) return { erreur: 'fond' };
    var basAxe = bas0;
    for (var y8 = bas0; y8 > haut0; y8--) { if (lab[y8 * w + axe] === meil) { basAxe = y8; break; } }
    var aisselle = function(){
      var lw = [];
      for (var yy = Math.round(haut0 + L * 0.7); yy > haut0 + L * 0.12; yy--) {
        var c2 = corps(yy); if (!c2) continue;
        var wd = c2.d - c2.g + 1;
        if (lw.length >= 6) {
          var t = lw.slice(-12).sort(function(p, q){ return p - q; }), md = t[t.length >> 1];
          if (wd > md * 1.14 || wd < md * 0.86) return yy + 1;
        }
        lw.push(wd);
      }
      return null;
    };
    if (ty === 'haut' || ty === 'robe') {
      ligne('longueur', P(axe, haut0), P(axe, basAxe));   // du point haut de l épaule, pas du creux du col
      var ya = aisselle();
      if (ya != null) {
        var yp = Math.min(bas0, Math.round(ya + 2.5 * parCm)), cp = corps(yp);
        if (cp) ligne('poitrine', P(cp.g, yp), P(cp.d + 1, yp));
      }
      if (ty === 'haut') {
        var ys = Math.round(haut0 + 3 * parCm);
        var cs = corps(ys);
        if (cs) {
          // Plus large que la poitrine : la rangée court déjà dans les manches — on ne devine pas.
          if (!out.poitrine || (cs.d - cs.g + 1) * pas <= (out.poitrine.b[0] - out.poitrine.a[0]) * 1.04) ligne('epaules', P(cs.g, ys), P(cs.d + 1, ys));
          // La manche : de l épaule au point du vêtement le plus éloigné, côté droit de la photo.
          var torse = out.poitrine ? (out.poitrine.b[0] - out.poitrine.a[0]) / pas : cs.d - cs.g;
          var large = 0; ext.forEach(function(e){ if (e[0] >= 0 && e[1] - e[0] > large) large = e[1] - e[0]; });
          if (large > torse * 1.18) {
            var sx = cs.d + 1, sy = ys, loin = 0, lx = sx, ly = sy;
            for (var y9 = haut0; y9 <= bas0; y9++) for (var x9 = sx; x9 < w; x9++) {
              if (lab[y9 * w + x9] !== meil) continue;
              var dd2 = (x9 - sx) * (x9 - sx) + (y9 - sy) * (y9 - sy);
              if (dd2 > loin) { loin = dd2; lx = x9; ly = y9; }
            }
            if (loin > 0) ligne('manche', P(sx, sy), P(lx, ly));
          }
        }
      } else {
        // Robe : la taille au plus étroit entre l aisselle et la mi-longueur ; les hanches 18 cm plus bas.
        var y0 = ya != null ? ya + 4 * parCm : haut0 + L * 0.25, yt = null, wt = 1e9;
        for (var yy2 = Math.round(y0); yy2 < haut0 + L * 0.6; yy2++) { var c3 = corps(yy2); if (c3 && c3.d - c3.g < wt) { wt = c3.d - c3.g; yt = yy2; } }
        if (yt != null) {
          var c4 = corps(yt); ligne('taille', P(c4.g, yt), P(c4.d + 1, yt));
          var yh = Math.min(bas0, Math.round(yt + 18 * parCm)), c5 = corps(yh);
          if (c5) ligne('hanches', P(c5.g, yh), P(c5.d + 1, yh));
        }
      }
    } else if (ty === 'bas') {
      var yc = Math.round(haut0 + 1.5 * parCm), c6 = corps(yc);
      if (c6) ligne('taille', P(c6.g, yc), P(c6.d + 1, yc));
      // L entrejambe : la première rangée, sous la ceinture, où l axe n est plus dans le tissu.
      var yE = null;
      for (var y10 = Math.round(haut0 + L * 0.15); y10 < bas0; y10++) if (lab[y10 * w + axe] !== meil) { yE = y10; break; }
      var yH = Math.round(haut0 + (yE != null ? (yE - haut0) * 0.8 : 20 * parCm)), c7 = corps(yH);
      if (c7) ligne('hanches', P(c7.g, yH), P(c7.d + 1, yH));
      var eg = ext[haut0] || [axe, axe];
      ligne('longueur', P(eg[0], haut0), P(eg[0], bas0));
      if (yE != null && bas0 - yE > 10 * parCm) ligne('entrejambe', P(axe, yE), P(axe, bas0));
    }
    if (out.epaules && out.poitrine && out.epaules.cm > out.poitrine.cm * 1.2) { delete out.epaules; ecartes++; }
    if (out.manche && out.longueur && out.manche.cm > out.longueur.cm * 1.1) { delete out.manche; ecartes++; }
    return { mesures: out, n: Object.keys(out).length, ecartes: ecartes };
  }

  /* LA FEUILLE PAR SON X (2026-10-20, sa photo : une feuille blanche sur un mur blanc — 205 contre
     206 sur 255, aucune blancheur ne l en distingue). Le X tracé au feutre d un coin à l autre,
     lui, tranche sur n importe quel fond : ses quatre bouts SONT les coins de la feuille.
     On cherche les traits fins (un pixel qui s écarte de son voisinage immédiat), on les regroupe
     d un seul tenant, et l on garde le groupe dont presque tous les pixels tombent sur les deux
     diagonales de son cadre, au rapport de côtés d une feuille. */
  function mvTrouverX(cv, format){
    var W = cv.width, H = cv.height, N = W * H;
    var px = cv.getContext('2d').getImageData(0, 0, W, H).data;
    var R = 4;   // le voisinage : assez large pour qu un trait de 1 à 3 px s en écarte
    // Moyennes locales par images intégrales (une par canal).
    var I = [new Float64Array((W + 1) * (H + 1)), new Float64Array((W + 1) * (H + 1)), new Float64Array((W + 1) * (H + 1))];
    for (var y = 0; y < H; y++) {
      var s0 = 0, s1 = 0, s2 = 0;
      for (var x = 0; x < W; x++) {
        var i = (y * W + x) * 4; s0 += px[i]; s1 += px[i + 1]; s2 += px[i + 2];
        var o = (y + 1) * (W + 1) + x + 1;
        I[0][o] = I[0][o - W - 1] + s0; I[1][o] = I[1][o - W - 1] + s1; I[2][o] = I[2][o - W - 1] + s2;
      }
    }
    var ecart = new Float32Array(N);
    for (var y2 = 0; y2 < H; y2++) for (var x2 = 0; x2 < W; x2++) {
      var xa = Math.max(0, x2 - R), xb = Math.min(W, x2 + R + 1), ya = Math.max(0, y2 - R), yb = Math.min(H, y2 + R + 1);
      var aire = (xb - xa) * (yb - ya), j = (y2 * W + x2) * 4, d = 0;
      for (var c = 0; c < 3; c++) {
        var T = I[c], m = (T[yb * (W + 1) + xb] - T[ya * (W + 1) + xb] - T[yb * (W + 1) + xa] + T[ya * (W + 1) + xa]) / aire;
        d += Math.abs(px[j + c] - m);
      }
      ecart[y2 * W + x2] = d;
    }
    // Seuils à hystérésis : un trait fort amorce, un trait plus faible prolonge.
    var FORT = 24, FAIBLE = 12, vu = new Uint8Array(N), meilleur = null;
    for (var s = 0; s < N; s++) {
      if (vu[s] || ecart[s] < FORT) continue;
      var pile = [s], pts = [], minx = W, maxx = 0, miny = H, maxy = 0; vu[s] = 1;
      while (pile.length && pts.length < 60000) {
        var q = pile.pop(), qx = q % W, qy = (q - qx) / W; pts.push(q);
        if (qx < minx) minx = qx; if (qx > maxx) maxx = qx; if (qy < miny) miny = qy; if (qy > maxy) maxy = qy;
        for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) {
          var nx = qx + dx, ny = qy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          var nq = ny * W + nx; if (!vu[nq] && ecart[nq] >= FAIBLE) { vu[nq] = 1; pile.push(nq); }
        }
      }
      var bw = maxx - minx, bh = maxy - miny;
      if (bw < Math.max(W, H) * 0.04 || bh < Math.max(W, H) * 0.04 || pts.length < 30) continue;
      if (minx <= 1 || miny <= 1 || maxx >= W - 2 || maxy >= H - 2) continue;
      var ratio = Math.max(bw, bh) / Math.min(bw, bh), cible = format === 'a4' ? 297 / 210 : 279.4 / 215.9;
      if (Math.abs(ratio - cible) > 0.22) continue;
      // Sur les deux diagonales du cadre ?
      var diag = Math.hypot(bw, bh), tol = Math.max(2.5, diag * 0.035), sur1 = 0, sur2 = 0;
      var A = [[minx, miny, maxx, maxy], [maxx, miny, minx, maxy]], couv = [new Uint8Array(20), new Uint8Array(20)];
      for (var k = 0; k < pts.length; k++) {
        var X = pts[k] % W, Y = (pts[k] - X) / W, best = -1, bd = 1e9;
        for (var g = 0; g < 2; g++) {
          var a = A[g], ux = (a[2] - a[0]) / diag, uy = (a[3] - a[1]) / diag;
          var dd = Math.abs((X - a[0]) * uy - (Y - a[1]) * ux);
          if (dd < bd) { bd = dd; best = g; }
        }
        if (bd > tol) continue;
        if (best === 0) sur1++; else sur2++;
        var a2 = A[best], tt = ((X - a2[0]) * (a2[2] - a2[0]) + (Y - a2[1]) * (a2[3] - a2[1])) / (diag * diag);
        couv[best][Math.max(0, Math.min(19, Math.floor(tt * 20)))] = 1;
      }
      var part = (sur1 + sur2) / pts.length;
      var c1 = 0, c2 = 0; for (var b = 0; b < 20; b++) { c1 += couv[0][b]; c2 += couv[1][b]; }
      if (part < 0.8 || sur1 < pts.length * 0.25 || sur2 < pts.length * 0.25 || c1 < 16 || c2 < 16) continue;
      var score = diag * part;
      if (!meilleur || score > meilleur.score) meilleur = { score: score, L: Math.max(bw, bh), l: Math.min(bw, bh),
        cx: (minx + maxx) / 2, cy: (miny + maxy) / 2, ang: bw >= bh ? 0 : Math.PI / 2, parX: true };
    }
    if (!meilleur) return null;
    var dims = format === 'a4' ? [29.7, 21] : [27.94, 21.59];
    meilleur.pxParCm = (meilleur.L / dims[0] + meilleur.l / dims[1]) / 2;
    return meilleur;
  }

  /* L'ANALYSE SUR PLACE (2026-10-20, sa demande : « ça devrait analyser la photo automatiquement, sans
     avoir à ouvrir un autre écran, s il détecte la feuille »). Dès que l étape s ouvre, la photo
     principale est lue en arrière-plan : feuille trouvée → l échelle est posée, les mesures que la
     silhouette permet sont inscrites dans le tableau (jamais par-dessus une valeur saisie), et l aperçu
     montre chaque trait. L outil « Mesurer sur une photo » ne sert plus qu à AJUSTER ou à tracer ce
     qui manque. Une seule lecture par photo et par type : revenir à l étape ne relit rien. */
  var MV_AUTO = null, MV_T = '';
  function mvTaillePhoto(){
    var ts = tailles();
    if (MV_T && ts.indexOf(MV_T) >= 0) return MV_T;
    return ts[Math.floor((ts.length - 1) / 2)] || '';   // la taille du milieu : celle qu on photographie d ordinaire
  }
  function mvChargerImage(src, fini){
    var img = new Image();
    img.onload = function(){ fini(img); };
    img.onerror = function(){ fini(null); };
    if (/^data:/.test(src) || !(P && P.imageLocale)) { img.src = src; return; }
    P.imageLocale(src).then(function(d){ img.src = d || src; }, function(){ img.src = src; });
  }
  // Le résultat de l IA, gardé sur le poste par photo (on ne paie pas deux fois la même photo).
  var MV_REESSAI = {};
  /* ⚠ PAS DE localStorage ICI (2026-10-25, audit) : la page est en data:text/html,
     il lève SecurityError — rien n était gardé, et la mesure payante était
     redemandée à chaque ouverture. Les deux mémoires (mesure IA par photo, échelle
     du poste photo par format) vivent dans le principal (szPont.memoPoste*),
     lues UNE fois à l ouverture et gardées ici en cache.
     ⚠ La clé est une EMPREINTE de « photo|type » : la photo peut être une donnée
     base64 de plusieurs mégaoctets. */
  var MEMO_IA = {}, MEMO_ECH = {};
  try {
    if (P && P.memoPosteLire) {
      P.memoPosteLire('mesureIA').then(function(o){ if (o && typeof o === 'object') MEMO_IA = Object.assign(o, MEMO_IA); });
      P.memoPosteLire('echelleMv').then(function(o){ if (o && typeof o === 'object') MEMO_ECH = Object.assign(o, MEMO_ECH); });
    }
  } catch (e) {}
  function memoPosteEcrire(cle, o){ try { if (P && P.memoPosteEcrire) P.memoPosteEcrire(cle, o); } catch (e) {} }
  function mvEmpreinte(c){
    c = String(c || ''); var h1 = 5381, h2 = 52711;
    for (var i = 0; i < c.length; i++) { var ch = c.charCodeAt(i); h1 = ((h1 * 33) ^ ch) | 0; h2 = ((h2 * 31) ^ ch) | 0; }
    return c.length + '-' + (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
  }
  function mvMemoIA(cle, val){
    var o = MEMO_IA, k = mvEmpreinte(cle);
    if (val === undefined) return o[k] || null;
    o[k] = val.echec ? { echec: String(val.echec), au: Date.now() }
      : { mesures: val.mesures, n: val.n, ecartes: val.ecartes || 0, mancheManuelle: !!val.mancheManuelle, au: Date.now() };
    var cles = Object.keys(o).sort(function(a, b){ return (o[b].au || 0) - (o[a].au || 0); });
    cles.slice(40).forEach(function(x){ delete o[x]; });
    memoPosteEcrire('mesureIA', o);
    return o[k];
  }
  function mvAnalyser(){
    var ty = mvType(), z = document.getElementById('p-mesv-auto');
    if (!z) return;
    if (!ty || !tailles().length) { z.innerHTML = ''; return; }
    if (!IMAGE) { z.innerHTML = '<div class="mesv-auto mv-vide"><div class="aide">${T("Ajoutez la photo principale (étape « Photo ») : si une feuille marquée d’un X y figure, les mesures se prennent toutes seules ici.")}</div></div>'; return; }
    var cle = IMAGE + '|' + ty;
    if (MV_AUTO && MV_AUTO.cle === cle) { mvMontrerAuto(); return; }
    MV_AUTO = { cle: cle, enCours: true };
    z.innerHTML = '<div class="mesv-auto"><div class="aide">${T("Analyse de la photo principale…")}</div></div>';
    mvChargerImage(IMAGE, function(img){
      if (!MV_AUTO || MV_AUTO.cle !== cle) return;   // la photo a changé entre-temps
      if (!img) { MV_AUTO = { cle: cle, erreur: true }; mvMontrerAuto(); return; }
      var r = Math.min(1, 1200 / img.naturalWidth, 900 / img.naturalHeight);
      var cv = document.createElement('canvas');
      cv.width = Math.round(img.naturalWidth * r); cv.height = Math.round(img.naturalHeight * r);
      var feuille = null, res = null;
      try {
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        feuille = mvTrouverX(cv, 'lettre') || mvTrouverFeuille(cv, 'lettre');
        if (feuille) res = mvMesurerAuto(cv, ty, feuille.pxParCm, feuille);
      } catch (e) { feuille = null; res = null; }
      var finir = function(res2, viaIA, note){
        if (!MV_AUTO || MV_AUTO.cle !== cle) return;
        MV_AUTO = { cle: cle, cv: cv, feuille: feuille, res: res2, t: mvTaillePhoto(), poses: [], ia: !!viaIA, note: note || '', forcer: forcer && !!viaIA };
        mvPoserAuto();
        mvAutoGraduer(false);
        dessinerMesures();
      };
      /* SUR MANNEQUIN : LE CONTOUR PAR L IA (2026-10-20, essai validé sur sa photo du manteau gris). Quand la
         feuille est trouvée mais que la silhouette locale ne donne pas l essentiel, on demande le contour du
         vêtement (produit:mesureMasque, ~0,007 $ CA) — UNE fois par photo : le résultat est gardé sur le poste. */
      var forcer = !!MV_REESSAI[cle];
      if (!feuille || (res && res.n >= 3 && !forcer)) { finir(res, false); if (feuille && MV_AUTO) MV_AUTO.proposerIA = true; return; }
      var memo = mvMemoIA(cle);
      if (memo && memo.n && !forcer) { finir(memo, true); return; }
      /* L APPEL PAYANT NE PART QUE SUR SON CLIC (2026-10-20, sa décision : « mets-moi un bouton pour lancer la
         demande manuellement : comme c est payant, je ne veux peut-être pas le faire pour tous les items »).
         À l arrivée sur l étape, seul le travail GRATUIT se fait (feuille, échelle, silhouette locale) ; un
         résultat déjà payé pour cette photo est relu sans rien payer. */
      if (!forcer) { finir(res && res.n ? res : null, false, memo && memo.echec ? memo.echec : ''); if (MV_AUTO) MV_AUTO.proposerIA = true; mvMontrerAuto(); return; }
      /* ⚠ PAS DE FACTURE POUR RIEN (2026-10-20, sa règle : « je ne veux pas être facturée pour le fun ») : une
         photo n est envoyée QU UNE FOIS d office. Un échec est retenu lui aussi ; le réessai ne part que
         sur son clic, prix affiché. */
      if (!(P && P.appeler)) { finir(res, false); return; }
      delete MV_REESSAI[cle];
      MV_AUTO.enCours = true;
      z.innerHTML = '<div class="mesv-auto"><div class="aide">${T("Feuille trouvée — le contour du vêtement est demandé au service d’images (quelques secondes)…")}</div></div>';
      P.appeler('produit:mesureMasque', IMAGE, ty).then(function(rm){
        if (!MV_AUTO || MV_AUTO.cle !== cle) return;
        if (!rm || !rm.ok || !rm.masque) {
          var pourquoi = rm && rm.motif === 'plafond' ? '${T("Plafond des traitements d’images atteint : mesure automatique impossible pour le moment.")}' : '${T("Le service d’images n’a pas répondu : mesure automatique impossible pour le moment.")}';
          mvMemoIA(cle, { echec: pourquoi });
          finir(res, false, pourquoi); if (MV_AUTO) MV_AUTO.proposerIA = true; mvMontrerAuto();
          return;
        }
        var mi = new Image();
        mi.onload = function(){
          var mc = document.createElement('canvas'); mc.width = cv.width; mc.height = cv.height;
          var r3 = null;
          try { mc.getContext('2d').drawImage(mi, 0, 0, mc.width, mc.height); r3 = mvMesurerMasque(mc, ty, feuille.pxParCm, cv); } catch (e) { r3 = null; }
          mvMemoIA(cle, r3 && r3.n ? r3 : { echec: '${T("Le contour du vêtement a été reçu, mais aucune mesure n’a pu en être tirée.")}' });
          finir(r3 && r3.n ? r3 : res, !!(r3 && r3.n));
        };
        mi.onerror = function(){ finir(res, false); };
        mi.src = rm.masque;
      }, function(){ finir(res, false); });
    });
  }
  // Inscrit les mesures estimées dans la taille photographiée — seulement dans les cases vides.
  function mvPoserAuto(){
    var A = MV_AUTO; if (!A || !A.res || !A.res.mesures) return;
    var t = A.t; if (!t) return;
    MESV.type = mvType();
    MESV.tailles[t] = MESV.tailles[t] || {};
    A.poses = [];
    Object.keys(A.res.mesures).forEach(function(k){
      if (MESV.tailles[t][k] > 0 && !A.forcer) return;   // « Relancer le calcul » remplace la taille photographiée
      MESV.tailles[t][k] = A.res.mesures[k].cm; delete MV_GRAD[t + '|' + k]; A.poses.push(k);
    });
  }
  // Changer la taille photographiée déplace ce que l analyse a posé (et rien de ce qu on a tapé).
  function mvChangerTaille(t){
    var A = MV_AUTO;
    if (A && A.t && A.poses) A.poses.forEach(function(k){
      var r = MESV.tailles[A.t]; if (r && A.res && A.res.mesures[k] && r[k] === A.res.mesures[k].cm) delete r[k];
    });
    MV_T = t; MV_PAGE = null; if (A) { A.t = t; mvPoserAuto(); }
    mvAutoGraduer(false);
    dessinerMesures();
  }
  function mvMontrerAuto(){
    var z = document.getElementById('p-mesv-auto'), A = MV_AUTO; if (!z || !A) return;
    if (A.enCours) return;
    if (A.erreur) { z.innerHTML = '<div class="mesv-auto mv-vide"><div class="aide">${T("La photo principale n’a pas pu être lue.")}</div></div>'; return; }
    if (!A.feuille) {
      z.innerHTML = '<div class="mesv-auto mv-vide"><div class="aide">${T("Aucune feuille repérée dans la photo principale. Pour une mesure automatique : une feuille lettre posée à plat près du vêtement, marquée d’un X au feutre d’un coin à l’autre. Sinon, « Mesurer sur une photo » pour poser l’échelle à la main.")}</div></div>';
      return;
    }
    var n = A.res ? A.res.n : 0, poses = (A.poses || []).length;

    var plus = (A.res && A.res.mancheManuelle && mvType() === 'haut')
      ? ' <b class="att">${T("Manche : aucun des deux bras n’est assez droit sur la photo pour la mesurer — prenez-la au ruban et tapez-la dans le tableau.")}</b>' : '';
    if (A.note) plus += ' ' + esc(A.note);
    var txt = n
      ? (poses ? poses + '${T(" mesure(s) estimée(s) inscrite(s) pour la taille ")}' + esc(A.t) + '.' : '${T("Mesures estimées : les cases étaient déjà remplies, rien n’a été remplacé.")}')
        + ' ${T("Vérifiez chaque trait sur l’aperçu.")}' + plus
      : (A.proposerIA ? '${T("Échelle posée. Sur un mannequin, l’application ne sait pas isoler le vêtement seule : « Mesurer par l’IA » le fait pour cette photo (≈ 0,007 $, une seule fois — le résultat est gardé). Sinon, tapez les mesures d’une taille : les autres suivront.")}'
        : '${T("Le vêtement n’a pas pu être mesuré automatiquement sur cette photo : tapez les mesures d’une taille dans le tableau, les autres suivront.")}') + plus;
    z.innerHTML = '<div class="mesv-auto"><canvas id="p-mesv-apercu"></canvas><div class="mesv-auto-txt">'
      + '<b><span class="ok">✓</span>' + (A.ia ? '${T("Mesures prises d’après le contour du vêtement")}' : '${T("Feuille trouvée dans la photo principale")}') + '</b><div class="aide">' + txt + '</div></div>'
      + '<div class="mesv-auto-act"><button type="button" class="' + (A.ia ? 'mini' : 'prim') + '" id="p-mesv-reessai">'
      + (A.ia ? '${T("Relancer par l’IA (≈ 0,007 $)")}' : '${T("Mesurer par l’IA (≈ 0,007 $)")}') + '</button></div></div>';
    var c = document.getElementById('p-mesv-apercu'), s = Math.min(1, 220 / A.cv.width, 220 / A.cv.height);
    c.width = Math.round(A.cv.width * s); c.height = Math.round(A.cv.height * s);
    var g = c.getContext('2d'); g.drawImage(A.cv, 0, 0, c.width, c.height);
    var f = A.feuille; g.save(); g.scale(s, s); g.translate(f.cx, f.cy); g.rotate(f.ang || 0);
    g.strokeStyle = '#22c55e'; g.lineWidth = 3 / s; g.strokeRect(-f.L / 2, -f.l / 2, f.L, f.l); g.restore();
    var br = document.getElementById('p-mesv-reessai');
    if (br) br.onclick = function(){ var k0 = A.cle; MV_REESSAI[k0] = 1; MV_AUTO = null; mvAnalyser(); };
    if (A.res) Object.keys(A.res.mesures).forEach(function(k){
      var m = A.res.mesures[k]; g.strokeStyle = '#c9a97e'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(m.a[0] * s, m.a[1] * s); g.lineTo(m.b[0] * s, m.b[1] * s); g.stroke();
    });
  }

  /* LES MESURES D APRÈS LE CONTOUR DU VÊTEMENT (2026-10-20, essai sur sa photo du manteau gris).
     Le contour vient du service de segmentation (fal, evf-sam : « le vêtement », sans le mannequin ni
     le mur). Sur un mannequin, les bras pendent le long du corps : on ne cherche donc pas l aisselle
     à l œil, on lit les largeurs DANS LA BANDE DES ÉPAULES, aux hauteurs d usage du prêt-à-porter
     féminin (épaules à 4 cm sous le haut, poitrine à 22 cm, taille à 38 cm, hanches à 56 cm). La
     manche va de l épaule au point du vêtement le plus éloigné HORS de cette bande. */
  function mvMesurerMasque(cv, ty, echelle, orig){
    var W = cv.width, H = cv.height, pas = Math.max(1, Math.round(Math.max(W, H) / 600));
    var w = Math.floor(W / pas), h = Math.floor(H / pas), N = w * h;
    var px = cv.getContext('2d').getImageData(0, 0, W, H).data, m = new Uint8Array(N);
    var po = orig ? orig.getContext('2d').getImageData(0, 0, W, H).data : null;
    // La peau du mannequin (orangée, chaude) dans la photo d origine : c est elle qui montre où sort la main.
    var peau = function(xx, yy){ if (!po) return false; var i = ((yy * pas) * W + xx * pas) * 4, r = po[i], g = po[i + 1], b = po[i + 2];
      return r > g && g >= b - 4 && r - b > 32 && r - g > 10; };
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = ((y * pas) * W + x * pas) * 4;
      // Masque blanc sur noir, ou détourage transparent : les deux disent « vêtement ».
      m[y * w + x] = (px[i + 3] > 127 && px[i] + px[i + 1] + px[i + 2] > 382) ? 1 : 0;
    }
    var parCm = echelle / pas;
    var ext = [], top = -1, bas = -1, larg = Math.max(3, 5 * parCm);
    for (var y1 = 0; y1 < h; y1++) {
      var g = -1, d = -1;
      for (var x1 = 0; x1 < w; x1++) if (m[y1 * w + x1]) { if (g < 0) g = x1; d = x1; }
      ext.push([g, d]);
      if (g >= 0 && d - g >= larg) { if (top < 0) top = y1; bas = y1; }   // une rangée de 5 cm au moins : pas un fil
    }
    var out = {}, ecartes = 0, mancheManuelle = false;
    if (top < 0 || bas - top < 20 * parCm) return { mesures: out, n: 0, ecartes: 0 };
    var P = function(xx, yy){ return [xx * pas + pas / 2, yy * pas + pas / 2]; };
    var BORNES = { poitrine: [25, 80], taille: [20, 75], hanches: [25, 85], epaules: [25, 60], longueur: [30, 160], manche: [10, 90], entrejambe: [30, 100] };
    var auBord = function(p){ return p[0] < W * 0.01 || p[1] < H * 0.01 || p[0] > W * 0.99 || p[1] > H * 0.99; };
    var ligne = function(k, a, b){
      var l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (!(l > 2)) return;
      var v = Math.round(l / echelle * 2) / 2, bo = BORNES[k] || [1, 300];
      if (auBord(a) || auBord(b) || v < bo[0] || v > bo[1]) { ecartes++; return; }
      out[k] = { a: a, b: b, cm: v };
    };
    var bande = function(yy, ga, dr){
      if (yy < 0 || yy >= h) return null;
      var g2 = -1, d2 = -1;
      for (var xx = Math.max(0, Math.round(ga)); xx <= Math.min(w - 1, Math.round(dr)); xx++) if (m[yy * w + xx]) { if (g2 < 0) g2 = xx; d2 = xx; }
      return g2 < 0 ? null : [g2, d2];
    };
    var rang = function(cm){ return Math.min(bas, Math.round(top + cm * parCm)); };
    var ys = rang(4), es = ext[ys];
    if (!es || es[0] < 0) return { mesures: out, n: 0, ecartes: 0 };
    var axe = Math.round((es[0] + es[1]) / 2);
    var basAxe = bas; for (var y2 = bas; y2 > top; y2--) if (m[y2 * w + axe]) { basAxe = y2; break; }
    if (ty === 'bas') {
      var yc = rang(1.5), c = ext[yc]; if (c && c[0] >= 0) ligne('taille', P(c[0], yc), P(c[1] + 1, yc));
      var yh = rang(20), c2 = ext[yh]; if (c2 && c2[0] >= 0) ligne('hanches', P(c2[0], yh), P(c2[1] + 1, yh));
      ligne('longueur', P(ext[top][0], top), P(ext[top][0], bas));
      return { mesures: out, n: Object.keys(out).length, ecartes: ecartes };
    }
    ligne('longueur', P(axe, top), P(axe, basAxe));
    var marge = 2 * parCm, ga = es[0] + marge, dr = es[1] - marge;   // la bande du corps : un peu EN DEDANS des épaules
    if (ty === 'haut') ligne('epaules', P(es[0], ys), P(es[1] + 1, ys));
    var yp = rang(22), cp = bande(yp, ga - 2 * marge, dr + 2 * marge);
    if (cp) ligne('poitrine', P(cp[0], yp), P(cp[1] + 1, yp));
    if (ty === 'robe') {
      var yt = rang(38), ct = bande(yt, ga - 2 * marge, dr + 2 * marge); if (ct) ligne('taille', P(ct[0], yt), P(ct[1] + 1, yt));
      var yh2 = rang(56), ch = bande(yh2, ga - 6 * marge, dr + 6 * marge); if (ch) ligne('hanches', P(ch[0], yh2), P(ch[1] + 1, yh2));
    } else {
      // La manche : du bout de l épaule au point le plus éloigné, du côté où le vêtement sort de la bande.
      /* LES DEUX BRAS, TOUJOURS (2026-10-20, sa règle : « il faut toujours que tu regardes les deux bras ;
         il y en a toujours un de correct ; si ni l un ni l autre ne l est, un message, et on le remplit à la
         main »). Pour chaque côté : le POIGNET est la peau du mannequin, hors du vêtement et hors de la bande
         du corps, qui touche la manche, la plus proche de l épaule ; le bras est DROIT si la ligne épaule →
         poignet reste dans la manche (95 % au moins). Un bras plié (main sur la hanche) sort de sa manche
         ou n a pas de poignet de son côté : il est écarté. Deux bras droits : le plus long (l autre est
         raccourci par la perspective). */
      var meilleur = null, vus = 0;
      [[es[1], 1], [es[0], -1]].forEach(function(cote){
        var sxp = cote[0], sg = cote[1], poignet = null;
        for (var y9 = Math.round(ys + 15 * parCm); y9 < Math.min(h - 1, ys + 90 * parCm); y9++) for (var x9 = 1; x9 < w - 1; x9++) {
          if (sg > 0 ? x9 <= dr : x9 >= ga) continue;
          if (m[y9 * w + x9] || !peau(x9, y9)) continue;
          var pres = m[y9 * w + x9 - 1] || m[y9 * w + x9 + 1] || m[(y9 - 1) * w + x9] || m[(y9 + 1) * w + x9];
          if (!pres) continue;
          var dd = Math.hypot(x9 - sxp, y9 - ys);
          if (!poignet || dd < poignet.d) poignet = { x: x9, y: y9, d: dd };
        }
        if (!poignet) return;
        vus++;
        var n = 0, dans = 0;
        for (var t = 0; t <= 1.0001; t += 0.01) { var X = Math.round(sxp + (poignet.x - sxp) * t), Y = Math.round(ys + (poignet.y - ys) * t); n++; if (m[Y * w + X]) dans++; }
        if (dans / n < 0.95) return;
        if (!meilleur || poignet.d > meilleur.d) meilleur = { d: poignet.d, a: P(sxp, ys), b: P(poignet.x, poignet.y) };
      });
      if (!meilleur) mancheManuelle = true;
      if (meilleur) ligne('manche', meilleur.a, meilleur.b);
    }
    if (out.epaules && out.poitrine && out.epaules.cm > out.poitrine.cm * 1.25) { delete out.epaules; ecartes++; }
    if (out.manche && out.longueur && out.manche.cm > out.longueur.cm * 1.1) { delete out.manche; ecartes++; }
    if (ty === 'haut' && !out.manche) mancheManuelle = true;
    return { mesures: out, n: Object.keys(out).length, ecartes: ecartes, mancheManuelle: mancheManuelle };
  }

  function mvOutilPhoto(){
    var ty = mvType(), ts = tailles();
    if (!ty) { dire('${T("Choisissez d’abord le type de vêtement.")}', 'att'); return; }
    if (!ts.length) { dire('${T("Choisissez d’abord les tailles à l’étape « Tailles et couleurs ».")}', 'att'); return; }
    /* LA PHOTO PRINCIPALE D'ABORD (2026-10-09, sa demande : « le bouton doit lire la photo
       principale de l'article »). « Autre photo… » en ouvre une autre ; sans photo principale,
       le sélecteur. Une photo DÉJÀ EN LIGNE (stockage R2, sans en-tête CORS) est récupérée par
       l'application elle-même (szPont.imageLocale) : sinon ses pixels ne se lisent pas.
       ⚠ TROIS FAÇONS DE POSER L'ÉCHELLE (même jour, sa question : « pour éviter la feuille de papier,
       tu ne peux pas faire autrement ? ») — une photo seule ne dit pas sa taille, il faut UN repère :
         · la feuille lettre/A4, trouvée toute seule (inchangé) ;
         · UNE MESURE CONNUE : on clique ses deux bouts et on tape sa valeur (la longueur prise au
           ruban, ou celle de la fiche du fournisseur) — plus de feuille du tout ;
         · L'ÉCHELLE RETENUE d'un poste photo fixe (même appareil, même hauteur) : posée une fois,
           réutilisée pour toute photo de même format. */
    var ouvrir = function(src0){
      var cols = MV_TYPES[ty];
      var v = document.createElement('div');
      v.className = 'voile';
      v.innerHTML = '<div class="boite mv-boite"><h3 style="color:var(--tx)">${T("Mesurer sur la photo")}</h3>'
        + '<div class="mv-barre"><label>${T("Taille photographiée")} <select id="mv-t">' + ts.map(function(t){ return '<option' + (t === mvTaillePhoto() ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></label>'
        + '<label>${T("Échelle")} <select id="mv-mode"><option value="feuille">${T("Feuille dans la photo (automatique)")}</option>'
        + '<option value="connue">${T("Une mesure que je connais")}</option><option value="memo">${T("Échelle retenue du poste photo")}</option>'
        + '<option value="main">${T("Feuille, à la main")}</option></select></label>'
        + '<label id="mv-f-l">${T("Feuille")} <select id="mv-f"><option value="lettre">${T("Lettre (8,5 × 11 po)")}</option><option value="a4">A4</option></select></label>'
        + '<button type="button" id="mv-autre">${T("Autre photo…")}</button></div>'
        + '<p id="mv-q" class="mv-q"></p>'
        + '<div class="mv-connue" id="mv-connue" hidden><label>${T("Ce segment mesure")} <input id="mv-cm" type="number" min="1" step="0.5" inputmode="decimal"> cm</label>'
        + '<button type="button" class="prim" id="mv-cm-ok">${T("Poser l’échelle")}</button></div>'
        + '<div class="mv-zone"><canvas id="mv-cv"></canvas></div>'
        + '<label class="mv-retenir"><input type="checkbox" id="mv-ret"> ${T("Retenir cette échelle pour mes photos de même format (poste photo fixe)")}</label>'
        + '<div class="mv-res" id="mv-res"></div>'
        + '<div class="pied2"><button type="button" id="mv-annuler">${T("Annuler")}</button>'
        + '<button type="button" id="mv-recommencer">${T("Effacer les mesures")}</button>'
        + '<button type="button" id="mv-auto">${T("Mesurer automatiquement")}</button>'
        + '<button type="button" class="prim" id="mv-ok" disabled>${T("✓ Garder ces mesures")}</button></div></div>';
      document.body.appendChild(v);
      var $ = function(id){ return document.getElementById(id); };
      var cv = $('mv-cv'), ctx = cv.getContext('2d');
      var img = new Image(), r = 1, echelle = null, feuille = null, clics = [], iDim = 0, res = {}, mode = 'feuille', segment = null;
      // L échelle retenue du poste photo, par format : la mémoire de poste (MEMO_ECH), pas localStorage (2026-10-25, audit).
      function memoLire(){ var x = Number(MEMO_ECH[img.naturalWidth + 'x' + img.naturalHeight]); return x > 0 ? x : null; }
      function memoEcrire(){
        MEMO_ECH[img.naturalWidth + 'x' + img.naturalHeight] = echelle / r;
        var cles = Object.keys(MEMO_ECH); if (cles.length > 30) delete MEMO_ECH[cles[0]];
        memoPosteEcrire('echelleMv', MEMO_ECH);
      }
      function q(t){ $('mv-q').textContent = t; }
      /* Les pixels de la PHOTO SEULE (2026-10-20) : le canevas visible porte les traits déjà
         tracés, et il est vide tant que rien n y a été peint — la feuille était cherchée dans
         une image vide à l ouverture, puis dans la photo barrée de ses propres traits. */
      function propre(){ var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c; }
      function auto(silence){
        if (!echelle) { if (!silence) dire('${T("Posez d’abord l’échelle.")}', 'att'); return; }
        var o = null;
        try { o = mvMesurerAuto(propre(), ty, echelle, feuille); } catch (e) { o = null; }
        if (!o || o.erreur || !o.n) {
          dire(o && o.erreur === 'bord'
            ? '${T("Le vêtement touche le bord de la photo (ou le fond n’est pas uni) : les mesures ne peuvent pas se prendre toutes seules. Cliquez-les.")}'
            : '${T("Le vêtement ne se détache pas assez du fond pour être mesuré tout seul. Cliquez les mesures, ou reprenez la photo à plat sur un fond uni qui tranche.")}', 'att');
          return;
        }
        res = o.mesures; iDim = 0; peindre(); resume(); suivante();
        dire(o.n + '${T(" mesure(s) estimée(s) d’après la silhouette. Vérifiez chaque trait sur la photo ; cliquez une mesure en bas pour la refaire.")}', 'bon');
      }
      function fermer(){ v.remove(); }
      function peindre(){
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        if (feuille) {
          ctx.save(); ctx.translate(feuille.cx, feuille.cy); ctx.rotate(feuille.ang);
          ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3; ctx.strokeRect(-feuille.L / 2, -feuille.l / 2, feuille.L, feuille.l); ctx.restore();
        }
        ctx.lineWidth = 3; ctx.font = 'bold 15px system-ui';
        if (segment) { ctx.strokeStyle = '#22c55e'; ctx.beginPath(); ctx.moveTo(segment[0][0], segment[0][1]); ctx.lineTo(segment[1][0], segment[1][1]); ctx.stroke(); }
        Object.keys(res).forEach(function(k){ var s = res[k];
          ctx.strokeStyle = '#c9a97e'; ctx.beginPath(); ctx.moveTo(s.a[0], s.a[1]); ctx.lineTo(s.b[0], s.b[1]); ctx.stroke();
          ctx.fillStyle = '#000'; ctx.fillRect((s.a[0] + s.b[0]) / 2 - 4, (s.a[1] + s.b[1]) / 2 - 18, 74, 22);
          ctx.fillStyle = '#fff'; ctx.fillText(s.cm + ' cm', (s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2 - 2); });
        clics.forEach(function(c){ ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(c[0], c[1], 5, 0, 7); ctx.fill(); });
      }
      function resume(){
        $('mv-res').innerHTML = cols.map(function(c){
          return '<span class="' + (res[c[0]] ? 'fait' : '') + '">' + c[1] + ' : <b>' + (res[c[0]] ? res[c[0]].cm + ' cm' : '—') + '</b></span>'; }).join('');
        $('mv-ok').disabled = !Object.keys(res).length;
      }
      function suivante(){
        clics = [];
        $('mv-f-l').hidden = !(mode === 'feuille' || mode === 'main');
        if (!echelle) {
          if (mode === 'connue') q(segment ? '${T("Tapez sa longueur réelle, puis Entrée — UNE seule fois : toutes les autres mesures se calculeront ensuite toutes seules.")}' : '${T("Une seule fois : tracez une mesure que vous connaissez (par exemple la longueur, prise au ruban). Ensuite, chaque trait se mesure tout seul.")}');
          else q('${T("Cliquez les deux bouts du GRAND côté de la feuille.")}');
          return;
        }
        while (iDim < cols.length && res[cols[iDim][0]]) iDim++;
        if (iDim >= cols.length) { q('${T("Toutes les mesures sont prises. Gardez-les, ou cliquez une ligne pour la refaire.")}'); return; }
        q('${T("Cliquez le début puis la fin : ")}' + cols[iDim][1] + ' — ' + cols[iDim][2] + '.');
      }
      function poserEchelle(px, message){
        echelle = px; segment = null; $('mv-connue').hidden = true;
        if ($('mv-ret').checked) memoEcrire();
        peindre(); suivante();
        if (!Object.keys(res).length) { dire(message, 'bon'); auto(true); if (!Object.keys(res).length) dire(message + ' ${T("Cliquez maintenant vos mesures : elles se calculent toutes seules.")}', 'bon'); }
        else dire(message, 'bon');
      }
      // Le mode choisi ; « feuille » cherche, et se rabat sur l'échelle retenue puis sur la mesure connue.
      function appliquerMode(m){
        mode = m; $('mv-mode').value = m; echelle = null; feuille = null; segment = null; $('mv-connue').hidden = true;
        if (m === 'feuille') {
          try { var pp = propre(); feuille = mvTrouverX(pp, $('mv-f').value) || mvTrouverFeuille(pp, $('mv-f').value); } catch (e) { feuille = null; }
          if (feuille) { poserEchelle(feuille.pxParCm, '${T("Feuille trouvée : l’échelle est posée.")}'); return; }
          var mm = memoLire();
          if (mm) { mode = 'memo'; $('mv-mode').value = 'memo'; poserEchelle(mm * r, '${T("Pas de feuille : l’échelle retenue du poste photo est utilisée.")}'); return; }
          mode = 'connue'; $('mv-mode').value = 'connue';
          dire('${T("Pas de feuille dans cette photo : il faut UN repère connu pour donner l’échelle — tracez une mesure que vous connaissez, une seule fois.")}', 'att');
        } else if (m === 'memo') {
          var m2 = memoLire();
          if (m2) { poserEchelle(m2 * r, '${T("Échelle retenue du poste photo utilisée.")}'); return; }
          dire('${T("Aucune échelle retenue pour ce format de photo : posez-la une fois, cochez « Retenir ».")}', 'att');
          mode = 'connue'; $('mv-mode').value = 'connue';
        }
        peindre(); suivante();
      }
      img.onload = function(){
        r = Math.min(1, 980 / img.naturalWidth, 600 / img.naturalHeight);
        cv.width = Math.round(img.naturalWidth * r); cv.height = Math.round(img.naturalHeight * r);
        res = {}; iDim = 0; resume(); appliquerMode('feuille');
      };
      img.onerror = function(){ dire('${T("Impossible d’ouvrir cette photo.")}', 'err'); };
      // Une photo en ligne passe par l'application (pixels lisibles) ; une photo locale est déjà une donnée.
      function charger(src){
        if (/^data:/.test(src) || !(P && P.imageLocale)) { img.src = src; return; }
        dire('${T("Lecture de la photo…")}');
        P.imageLocale(src).then(function(d){ img.src = d || src; });
      }
      charger(src0);
      $('mv-autre').onclick = function(){ choisirFichier(function(ds){ if (ds && ds[0]) charger(ds[0]); }, false); };
      $('mv-mode').onchange = function(){ appliquerMode($('mv-mode').value); };
      $('mv-f').onchange = function(){ if (mode === 'feuille') appliquerMode('feuille'); };
      $('mv-ret').onchange = function(){ if ($('mv-ret').checked && echelle) { memoEcrire(); dire('${T("Échelle retenue pour ce format de photo.")}', 'bon'); } };
      $('mv-cm').onkeydown = function(ev){ if (ev.key === 'Enter') { ev.preventDefault(); $('mv-cm-ok').click(); } };
      $('mv-cm-ok').onclick = function(){
        var cm = parseFloat(String($('mv-cm').value).replace(',', '.'));
        if (!segment || !(cm > 0)) { dire('${T("Tapez la longueur réelle du segment, en centimètres.")}', 'err'); return; }
        poserEchelle(Math.hypot(segment[1][0] - segment[0][0], segment[1][1] - segment[0][1]) / cm, '${T("Échelle posée d’après votre mesure.")}');
      };
      cv.onclick = function(ev){
        var b = cv.getBoundingClientRect();
        var p = [(ev.clientX - b.left) * cv.width / b.width, (ev.clientY - b.top) * cv.height / b.height];
        if (!echelle && mode === 'connue' && segment) return;   // on attend la valeur tapée
        clics.push(p);
        if (clics.length < 2) { peindre(); return; }
        var dpx = Math.hypot(clics[1][0] - clics[0][0], clics[1][1] - clics[0][1]);
        if (!echelle && mode === 'connue') {
          segment = [clics[0], clics[1]]; clics = [];
          $('mv-connue').hidden = false; peindre(); suivante(); $('mv-cm').focus(); return;
        }
        if (!echelle) {
          var lg = $('mv-f').value === 'a4' ? 29.7 : 27.94;
          clics = []; poserEchelle(dpx / lg, '${T("Échelle posée à la main.")}'); return;
        }
        if (iDim < cols.length) {
          res[cols[iDim][0]] = { a: clics[0], b: clics[1], cm: Math.round(dpx / echelle * 2) / 2 };
          iDim++;
        }
        peindre(); resume(); suivante();
      };
      $('mv-res').onclick = function(ev){
        var sp = ev.target.closest('span'); if (!sp) return;
        var i = Array.prototype.indexOf.call(this.children, sp); if (i < 0) return;
        delete res[cols[i][0]]; iDim = i; peindre(); resume(); suivante();
      };
      $('mv-recommencer').onclick = function(){ res = {}; iDim = 0; peindre(); resume(); suivante(); };
      $('mv-auto').onclick = function(){ auto(false); };
      $('mv-annuler').onclick = fermer;
      $('mv-ok').onclick = function(){
        var t = $('mv-t').value;
        MESV.type = ty;
        MESV.tailles[t] = MESV.tailles[t] || {};
        Object.keys(res).forEach(function(k){ MESV.tailles[t][k] = res[k].cm; delete MV_GRAD[t + '|' + k]; });
        mvAutoGraduer(false);
        fermer(); dessinerMesures();
        dire('${T("Mesures de la taille ")}' + t + '${T(" enregistrées dans le tableau. « Compléter les autres tailles » remplit le reste.")}', 'bon');
      };
    };
    if (IMAGE) ouvrir(IMAGE);
    else choisirFichier(function(ds){ if (ds && ds[0]) ouvrir(ds[0]); }, false);
  }

  function dessinerVues(){
    majFicheBientot();   // la photo principale a pu changer (volet « Fiche »)
    var bs0 = document.getElementById('p-studio');
    if (bs0) bs0.disabled = !IMAGE && !photoDos();   // le Studio part d au moins une photo (2026-10-21)
    var t = document.getElementById('p-vues-titre');
    if (t) t.textContent = modeStandard()
      ? '${T("Photos — 1 principale +")} ' + MAX_PHOTOS + ' ${T("supplémentaires maximum")}'
      : '${T("Photos — principale + vues")}';
    var z = document.getElementById('p-vues');
    if (z) {
      /* ══ LES CASES REFAITES (2026-10-26, sa demande : « une case pour la photo de dos, et le reste ses photos
         supplémentaires ») ══ Le DOS a SA case, à part et nommée ; les autres photos suivent dans une grille qui
         PASSE À LA LIGNE (avant : une rangée fixe de cases de 160 px qui sortait de la carte sur une fenêtre
         étroite — sa capture, « Côté droit » coupé).
         · Mode « angles » : la case Dos est la vue « Derrière » (la clé derriere, inchangée).
         · Mode « simple » : la case Dos montre la photo marquée dos (DOS_SRC, dans une case libreN) ; vide, elle
           s'appelle « __dos__ » : la photo choisie va dans une case libre ET devient le dos. */
      var std = modeStandard();
      var kDos = std ? (cleDos() || '__dos__') : 'derriere';
      var cles = clesGrille();
      var tuile = function(cle, i, n, nom, dos){
        var src = cle === '__dos__' ? '' : (VUES[cle] || '');
        var lib = esc(nom);
        var depl = (src && !dos) ? '<div class="depl">'
          + '<button type="button" data-depl="g" data-cle="' + esc(cle) + '"' + (i === 0 ? ' disabled' : '')
          + ' aria-label="${T("Déplacer vers la case précédente")} — ' + lib + '">‹</button>'
          + '<button type="button" data-depl="p" data-cle="' + esc(cle) + '"'
          + ' aria-label="${T("Échanger avec la photo principale")} — ' + lib + '">⇤</button>'
          + '<button type="button" data-depl="d" data-cle="' + esc(cle) + '"' + (i === n - 1 ? ' disabled' : '')
          + ' aria-label="${T("Déplacer vers la case suivante")} — ' + lib + '">›</button>'
          + '</div>' : '';
        return '<div class="vue' + (dos ? ' vue-dos' : '') + '"><div class="cadre' + (src ? ' pleine" draggable="true' : '') + '" data-vue="' + esc(cle) + '">'
          + (src ? '<img src="' + esc(src) + '" alt="" draggable="false">' : '${T("ajouter")}') + '</div>'
          + (src ? '<button type="button" class="x" data-vuex="' + esc(cle) + '" aria-label="${T("Retirer")} — ' + lib + '">×</button>' : '')
          + depl + '<div class="lgd">' + lib + '</div></div>';
      };
      /* (2026-10-26, sa demande) Plus de « Devant / Côté gauche / Côté droit / Autre » : des PHOTOS ADDITIONNELLES
         numérotées. Les clés enregistrées (devant, coteG…) ne changent pas — seul le nom affiché change. */
      z.innerHTML = '<div class="pv-t">${T("Dos et photos additionnelles")}</div><div class="pv-grille">'
        + tuile(kDos, 0, 1, '${T("Dos")}', true)
        + cles.map(function(cle, i){ return tuile(cle, i, cles.length, 'Photo ' + (i + 1), false); }).join('')
        + '</div>';
      // Mode simple : la photo du dos peut redevenir une photo additionnelle (elle garde sa place).
      if (std && kDos !== '__dos__') {
        var vd = z.querySelector('.vue-dos');
        if (vd) vd.insertAdjacentHTML('beforeend', '<button type="button" class="pv-demarquer" data-dosnon="1">${T("Démarquer")}</button>');
      }
    }
    // Deux passes : tout de suite, puis une fois la page entièrement posée (3D, fibre, polices).
    setTimeout(ajusterPhotos, 0); setTimeout(ajusterPhotos, 180);
    dessinerFibre();
    dessiner3d();   // le bouton de l'aperçu 3D dépend de la photo du dos
    var p = document.getElementById('p-parcoul');
    if (!p) return;
    // ⚠ ON MASQUE LA CARTE ENTIERE, on n y met pas un message d excuse. Une carte
    // qui explique pourquoi elle est vide occupe la place d une carte utile, et
    // laisse croire qu il manque quelque chose alors que le reglage est respecte.
    /* ⚠ OBLIGATOIRE DANS TOUTES LES CATÉGORIES (2026-10-09, sa demande : « une photo pour chaque
       couleur secondaire, et cette photo est obligatoire ; les autres photos ne changent pas de
       couleur, elles restent liées à la photo principale »). Avant : la carte disparaissait en mode
       « standard » et la photo était facultative. Chaque case reste cliquable, même en mode auto :
       une couleur que la teinte ne sait pas faire doit pouvoir recevoir sa photo à la main. */
    var carte = p.closest('.carte');
    if (carte) carte.style.display = '';
    var auto = modeAutoCouleur() && !modeStandard();
    var titre = document.getElementById('p-parcoul-titre');
    if (titre) titre.textContent = '${T("Photo par couleur (obligatoire)")}';
    var aide = document.getElementById('p-parcoul-aide');
    if (aide) { aide.textContent = ''; aide.style.display = 'none'; }   // (2026-10-26) aucune aide dans l'éditeur, sa demande
    var cs = couleurs();
    var bg = document.getElementById('p-cv-gen');
    // ⚠ LA 1ʳᵉ COULEUR N’A PAS DE CASE : ses photos sont celles du produit, et
    // la boutique ne lit jamais de variante pour elle. Lui offrir une case
    // faisait déposer une photo qui ne s’affichait nulle part.
    var variantes = cs.slice(1);
    if (bg) bg.style.display = (auto && variantes.length && IMAGE) ? '' : 'none';
    if (!cs.length) {
      p.innerHTML = '<div class="aide">${T("Choisissez d’abord des couleurs à l’étape « Tailles et couleurs ».")}</div>';
      return;
    }
    if (!variantes.length) {
      p.innerHTML = '<div class="aide">${T("Ajoutez au moins une couleur de plus — «")} ' + esc(cs[0])
        + ' ${T("» est la couleur principale, ses photos sont celles du produit.")}</div>';
      return;
    }
    p.innerHTML = variantes.map(function(c){
      var src = (PARCOUL[c] && (PARCOUL[c].main || PARCOUL[c].principale)) || '';
      /* Une case vide se MARQUE (obligatoire) ; en mode auto elle dit qu’elle sera générée. */
      return '<div class="vue"><div class="cadre' + (src ? ' pleine' : ' requise') + '" data-coul="' + esc(c) + '">'
        + (src ? '<img src="' + esc(src) + '" alt="">' : (auto ? '${T("à générer")}' : '${T("ajouter *")}')) + '</div>'
        + (src ? '<button type="button" class="x" data-coulx="' + esc(c) + '" title="${T("Retirer")}">×</button>' : '')
        + '<div class="lgd">' + esc(c) + '</div></div>';
    }).join('');
  }

  // Un seul sélecteur de fichier, réutilisé : en créer un par cadre laisserait
  // autant d’éléments invisibles dans la page, et le navigateur n’en garde pas
  // la trace une fois le cadre redessiné.
  // ⚠ PLUSIEURS PHOTOS D UN COUP. On en depose rarement une seule : obliger a
  // rouvrir le selecteur cinq fois pour cinq vues d un meme vetement transforme
  // une minute de travail en cinq. Le selecteur accepte donc une selection
  // multiple, et les fichiers remplissent les cases libres dans l ordre.
  var MAX_PHOTOS = 5;
  function choisirFichier(surCharge, multiple){
    var e = document.createElement('input');
    e.type = 'file'; e.accept = 'image/*';
    if (multiple) e.multiple = true;
    e.onchange = function(){
      var fs = Array.prototype.slice.call(e.files || []);
      if (!fs.length) return;
      var trop = fs.filter(function(f){ return f.size > MAX_MO * 1024 * 1024; });
      fs = fs.filter(function(f){ return f.size <= MAX_MO * 1024 * 1024; });
      if (trop.length) {
        dire(trop.length + (trop.length > 1 ? '${T(" photos ignorées : plus de ")}' : '${T(" photo ignorée : plus de ")}')
          + szOctets(MAX_MO * 1048576) + '.', 'att');
      }
      if (!fs.length) return;
      // ⚠ Les lectures sont ASYNCHRONES : sans ce compteur, les photos
      // arriveraient dans le desordre et la derniere lue ecraserait l ordre
      // choisi. On les repose a leur rang une fois toutes lues.
      var lues = new Array(fs.length), reste = fs.length;
      fs.forEach(function(f, i){
        var l = new FileReader();
        l.onload = function(){
          lues[i] = String(l.result || '');
          if (--reste === 0) { surCharge(lues.filter(Boolean)); if (!trop.length) dire(''); }
        };
        l.onerror = function(){ if (--reste === 0) { surCharge(lues.filter(Boolean)); } };
        l.readAsDataURL(f);
      });
    };
    e.click();
  }

  // ⚠ LA PHOTOTHEQUE D ABORD, L ORDINATEUR ENSUITE — pour TOUS les emplacements
  // photo, pas seulement la principale. Une photo deja importee dans la session a
  // deja ete choisie et nommee : aller la rechercher dans un dossier refait un
  // travail deja fait, et depose un second exemplaire du meme fichier dans le
  // stockage. L import reste offert, dans la meme boite — il n est pas cache, il
  // est second.
  // La fonction de retour recoit TOUJOURS un TABLEAU, quelle que soit la porte
  // empruntee : sans quoi chaque appelant devrait distinguer les deux cas, et
  // l un d eux l aurait oublie.
  function choisirPhoto(surChoix, multiple){
    ouvrirTheque(surChoix, multiple);
  }

  // ⚠ ELLE DIT CE QU ELLE EST. La photothèque se vide à chaque démarrage : sans
  // cette phrase, un sélecteur vide ressemble à une panne alors que c est un plan
  // de travail neuf. On renvoie aussi vers l endroit où l on importe.
  function ouvrirTheque(surChoix, multiple){
    /* (2026-10-19, audit — lot VOLUME 2) LA PHOTOTHEQUE PAR PAGES, EN VIGNETTES. Elle recevait TOUTES les
       photos en pleine taille (des data URL de centaines de Ko) pour en montrer une grille : 2 000 photos
       faisaient des centaines de Mo sur le pont. On demande { page, parPage: 24, q } ; le pont rend la
       page, le vrai total et une VIGNETTE reduite par photo. La photo ENTIERE se demande au choix
       (photos:source). Un site plus ancien (sans « pagine ») rend tout : l ancienne grille, en lazy. */
    var TH = { page: 0, q: '', minu: null, v: null };
    function bulleDe(x){
      var sku = x.codeProduit || '';
      // ⚠ DOUBLE ANTISLASH VOULU (le script vit dans un litteral de gabarit).
      return x.nom + (x.rattacheA ? '\\n' + '${T("Déjà utilisée par :")} ' + x.rattacheA
        + (sku ? ' (' + sku + ')' : '') : '\\n' + '${T("Jamais utilisée")}');
    }
    function caseDe(x, img, entiere){
      var sku = x.codeProduit || '';
      return '<div class="ph" data-src="' + esc(entiere ? '' : img) + '" data-id="' + esc(x.id) + '"'
        + (entiere ? ' data-entiere="1"' : '') + ' title="' + esc(bulleDe(x)) + '">'
        + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async">' : '<div style="height:88px"></div>')
        + '<div class="lg">' + esc(x.code) + '</div>'
        + (x.rattacheA
            ? '<div class="lg sku" title="' + esc(x.rattacheA) + '">' + esc(sku || x.rattacheA) + '</div>'
            : '<div class="lg libre">${T("libre")}</div>')
        + '</div>';
    }
    function corpsDe(r){
      if (!r || !r.ok) {
        // ⚠ « INDISPONIBLE » N EST PAS « VIDE » : le motif du refus s affiche.
        return '<p style="font-size:.86rem;line-height:1.5;color:var(--tx-att)">${T("Photothèque")} '
          + '${T("indisponible : ")}' + esc(expliquer(r)) + '</p>';
      }
      var l = r.pagine ? (r.lignes || []) : (r.photos || []);
      if (!l.length) {
        if (r.pagine && TH.q) return '<p style="font-size:.86rem;color:var(--tx2)">${T("Aucune photo ne correspond.")}</p>';
        return '<p style="font-size:.86rem;line-height:1.5;color:var(--tx2)">${T("La photothèque est vide. ")}'
          + '${T("Elle se remplit par ")}<strong>${T("Catalogue → Photos")}</strong>${T(", dans la fenêtre principale, ")}'
          + '${T("et repart à zéro à chaque démarrage de l’application.")}</p>';
      }
      var h = '<div class="theque">' + l.map(function(x){
        if (r.pagine) return caseDe(x, x.vignette || '', !!x.entiere);
        return caseDe(x, x.src, false);
      }).join('') + '</div>';
      if (r.pagine && r.pages > 1) {
        h += '<div class="pied2" style="justify-content:center;gap:.5rem;margin-top:.4rem">'
          + '<button type="button" data-thpg="-1"' + (r.page <= 0 ? ' disabled' : '') + ' aria-label="${T("Page précédente")}">‹</button>'
          + '<span style="font-size:.8rem;color:var(--tx2)">' + (r.page * r.parPage + 1) + '–' + Math.min(r.total, (r.page + 1) * r.parPage)
          + ' ${T("sur")} ' + r.total + '</span>'
          + '<button type="button" data-thpg="1"' + (r.page >= r.pages - 1 ? ' disabled' : '') + ' aria-label="${T("Page suivante")}">›</button></div>';
      }
      return h;
    }
    function charger(premier){
      P.appeler('photos:liste', { page: TH.page, parPage: 24, q: TH.q }).then(function(r){
        if (premier) monter(r);
        else { var z = document.getElementById('th-corps'); if (z) z.innerHTML = corpsDe(r); }
        if (r && r.ok && r.pagine) TH.page = r.page;
      });
    }
    function monter(r){
      var v = document.createElement('div');
      TH.v = v;
      v.className = 'voile';
      v.innerHTML = '<div class="boite" style="max-width:620px"><h3 style="color:var(--tx-creme)">${T("Photothèque")}</h3>'
        + ((r && r.ok && r.pagine) ? '<input type="search" id="th-q" placeholder="${T("Chercher : code, nom ou SKU…")}"'
            + ' aria-label="${T("Chercher une photo")}" style="margin-bottom:.4rem;width:100%">' : '')
        + '<div id="th-corps">' + corpsDe(r) + '</div>'
        + '<div class="pied2" style="justify-content:space-between">'
        + '<button type="button" id="th-fich"><span class="ic">📂</span> ${T("Importer de l’ordinateur…")}</button>'
        + '<button type="button" id="th-non">${T("Annuler")}</button></div></div>';
      document.body.appendChild(v);
      document.getElementById('th-non').onclick = function(){ v.remove(); };
      document.getElementById('th-fich').onclick = function(){
        v.remove(); choisirFichier(surChoix, multiple);
      };
      var q = document.getElementById('th-q');
      if (q) q.oninput = function(){
        clearTimeout(TH.minu);
        TH.minu = setTimeout(function(){ TH.q = q.value.trim(); TH.page = 0; charger(false); }, 250);
      };
      v.addEventListener('click', function(ev){
        if (ev.target === v) return;   // le voile ne ferme plus (2026-10-07) : seulement Fermer
        var pg = ev.target.closest('[data-thpg]');
        if (pg) { if (pg.disabled) return; TH.page = Math.max(0, TH.page + parseInt(pg.getAttribute('data-thpg'), 10)); charger(false); return; }
        var p2 = ev.target.closest('.ph'); if (!p2) return;
        if (p2.getAttribute('data-entiere') === '1') {
          // La photo ENTIERE se demande maintenant, une seule.
          P.appeler('photos:source', p2.getAttribute('data-id')).then(function(rs){
            if (!rs || !rs.ok || !rs.src) { dire(expliquer(rs), 'err'); return; }
            v.remove();
            surChoix([rs.src]);
            dire('${T("Photo reprise de la photothèque.")}', 'bon');
          });
          return;
        }
        v.remove();
        surChoix([p2.getAttribute('data-src')]);
        dire('${T("Photo reprise de la photothèque.")}', 'bon');
      });
    }
    charger(true);
  }

  /* ══ L ALLER-RETOUR ASSISTANT → STUDIO → ASSISTANT (2026-10-19, sa demande) ══════════════════════════════════
     « Créer au studio » ouvre le Studio POUR cet article (un identifiant PROVISOIRE s il n est pas encore
     enregistré) ; « Placer dans la fiche », au Studio, dépose la photo dans la boîte aux lettres de cette fiche :
     ce qui suit la relève toutes les 2 s et la pose dans sa case — le devant en photo principale, le dos dans la
     case « Derrière » (ou marqué « Dos »), le reste dans une case libre — ⚠ EN DEMANDANT avant de remplacer une
     photo. L enregistrement de la fiche les attache ; un article provisoire passe alors à son vrai identifiant.
     ⚠ Fenêtre fermée : rien ne se perd — la photo attend, étiquetée, et la fiche la propose à son ouverture. */
  var PROV = 'prov_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  var RET_VU = {}, RET_OCC = false, RET_T = null, PREVUES = [];
  function cleStudio(){ return ID ? String(ID) : PROV; }
  /* LES ORIGINALES ENVOYÉES AU STUDIO (2026-10-20, sa demande) : la photo traitée qui revient les REMPLACE sans
     question (c est pour ça qu on est allé au Studio) ; l originale est RETIRÉE (poserDuStudio) — l enregistrement ne
     pose plus de question (2026-10-25, audit). */
  var STU_ORIG = null;
  /* ══ LE STUDIO DANS LA FICHE (2026-10-20, sa demande, capture à l appui) ═══════════════════════════════════════
     « J aimerais plutôt voir cela, mais sans le module Studio en arrière : garder l inventaire ouvert, comme gelé en
     attente le temps du traitement. » Le Studio séparé se réduisait au premier clic et cachait la fiche : l écran
     simple s ouvre donc ICI, en voile par-dessus la fiche. Les photos traitées se posent directement dans leurs
     cases (les originales passent en case libre ; l enregistrement proposera de les effacer). Pendant un
     traitement, le voile ne se ferme pas ; sinon « Fermer » (ou Échap) le quitte sans rien changer. */
  var STM = null, STM_PRESETS = null;
  var STM_VOIES = [
    { cle: 'humain',  t: '${T("Mannequin virtuel")}', d: '${T("Porté par un modèle, décor intégré")}' },
    { cle: 'fantome', t: '${T("Vêtement sans mannequin")}', d: '${T("Mannequin retiré, col et volume reconstruits, fond transparent ou uni")}' },
    { cle: 'plat',    t: '${T("Produit à plat")}', d: '${T("Détourage + décor + ombre")}' }
  ];
  var STM_MODELES = ['sophia', 'emma', 'ava', 'zoe', 'maya', 'lena', 'julia', 'fiona'];
  function stmNom(m){ return m.charAt(0).toUpperCase() + m.slice(1); }
  function stmPreset(){ return STM.preset === 'transparent' ? ((STM_PRESETS[0] || {}).cle || '') : STM.preset; }
  function stmSaisie(image){
    var s = { geste: STM.voie, preset: stmPreset(), apercu: false, image: image,
      produit: ID ? String(ID) : '', produitNom: val('p-nom').trim(), produitSku: val('p-sku') };
    if (STM.voie === 'fantome') { s.palier = 'standard'; if (STM.preset === 'transparent') s.fondTransparent = true; if (STM.defroisser !== false) s.defroisser = true; }
    // LA DESCRIPTION LIBRE (2026-10-21, sa demande : « garde la possibilité de décrire ce que l on veut ») : scène, tenue,
    // accessoires — The New Black génère le mannequin d après ces mots (le sourire est demandé d office).
    if (STM.voie === 'humain') s.options = { pose: STM.pose || 'standing', sourire: STM.sourire === false ? 0 : 1, extra: STM.desc || '' };
    if (STM.prix != null) s.prixAnnonce = STM.prix;
    return s;
  }
  function stmEstimer(){
    STM.prix = null;
    P.appeler('studio:estimer', { geste: STM.voie, palier: STM.voie === 'fantome' ? 'standard' : '', preset: stmPreset(), nb: 1,
      finition: {}, options: STM.voie === 'humain' ? { pose: STM.pose || 'standing', sourire: 1 } : {} }).then(function(r){
      if (!STM) return;
      STM.prix = (r && r.ok && r.coutMax != null) ? r.coutMax : null;
      stmDessiner();
    });
  }
  function stmChoisies(){ return STM.photos.filter(function(p){ return p.on && p.src; }); }
  function stmFermer(){ if (!STM || STM.enCours) return; var v = STM.voile; STM = null; if (v) v.remove(); }
  function ouvrirStudio(){
    if (!P || !P.appeler) return;
    var dos = photoDos();
    if (!IMAGE && !dos) return;   // au moins une photo (2026-10-21, sa demande) : le bouton est grisé sans elle
    STU_ORIG = { devant: IMAGE || '', dos: dos || '' };
    var v = document.createElement('div'); v.className = 'voile stm-voile';
    v.innerHTML = '<div class="boite stm-boite" role="dialog" aria-modal="true"><div class="aide">${T("Chargement du Studio…")}</div></div>';
    document.body.appendChild(v);
    STM = { voile: v, photos: [{ role: 'devant', src: IMAGE || '', on: !!IMAGE }, { role: 'dos', src: dos || '', on: !!dos }],
      // Par défaut : le vêtement SANS mannequin, fond transparent (2026-10-20, sa demande : « c est lui qui sera le plus utilisé »).
      voie: 'fantome', modele: 'sophia', preset: 'transparent', prix: null, etats: {}, enCours: false };
    // (2026-10-25, audit) Plus de fermeture d un clic à côté : comme les autres
    // boîtes de cette fenêtre, le Studio ne se ferme que par son bouton (ou Échap).
    var charger = STM_PRESETS ? Promise.resolve({ ok: true, presets: STM_PRESETS }) : P.appeler('studio:presets');
    charger.then(function(r){
      if (!STM) return;
      if (!r || !r.ok) { STM.erreur = expliquer(r); stmDessiner(); return; }
      STM_PRESETS = r.presets || [];
      if (STM.voie !== 'fantome') STM.preset = (STM_PRESETS[0] || {}).cle || '';
      stmDessiner(); stmEstimer();
    });
  }
  function stmDessiner(){
    if (!STM) return;
    var b = STM.voile.querySelector('.stm-boite'), occ = STM.enCours;
    if (STM.erreur) { b.innerHTML = '<h3>${T("Studio")}</h3><p class="aide">' + esc(STM.erreur) + '</p><div class="pied2"><button type="button" id="stm-x">${T("Fermer")}</button></div>'; document.getElementById('stm-x').onclick = stmFermer; return; }
    var lib = { devant: '${T("Devant")}', dos: '${T("Dos")}' };
    var cartes = STM.photos.map(function(p, i){
      var et = STM.etats[p.role] || '';
      return '<div class="stm-photo' + (p.on && p.src ? ' on' : '') + '"><div class="stm-vign">'
        + (p.src ? '<img src="' + esc(p.src) + '" alt="">' : '<span>' + (p.role === 'dos' ? '${T("Pas de photo du dos")}' : '${T("Aucune photo")}') + '</span>') + '</div>'
        + '<label><input type="checkbox" data-stm-on="' + i + '"' + (p.on && p.src ? ' checked' : '') + (p.src && !occ ? '' : ' disabled') + '> <b>' + lib[p.role] + '</b></label>'
        + (et ? '<div class="stm-etat">' + esc(et) + '</div>' : '') + '</div>';
    }).join('');
    var voies = STM_VOIES.map(function(x){
      return '<button type="button" class="stm-voie' + (STM.voie === x.cle ? ' on' : '') + '" data-stm-voie="' + x.cle + '"' + (occ ? ' disabled' : '') + '><b>' + x.t + '</b><span>' + x.d + '</span></button>';
    }).join('');
    var fonds = (STM.voie === 'fantome' ? [{ cle: 'transparent', label: '${T("Fond transparent")}' }] : []).concat(STM_PRESETS || []);
    var n = stmChoisies().length, prix = STM.prix != null && n ? ' — ≈ ' + szArgentSymbole(szArgentNombre(STM.prix * n, 2)) : '';
    b.innerHTML = '<div class="stm-tete"><h3>' + '${T("Photos de « {p} »")}'.replace('{p}', esc(val('p-nom').trim() || '${T("cet article")}')) + '</h3></div>'
      + '<div class="stm-titre">${T("1. Les photos")}</div><div class="stm-photos">' + cartes + '</div>'
      + '<div class="stm-titre">${T("2. La présentation")}</div><div class="stm-voies">' + voies + '</div>'
      + (STM.voie === 'humain' ? '<div class="stm-desc"><label for="stm-desc">${T("Décrivez la scène, la tenue et les accessoires (facultatif)")}</label>'
          + '<textarea id="stm-desc" rows="2" maxlength="300" placeholder="${T("Ex. : sur une plage au coucher du soleil, chapeau de paille, sandales, souriante")}"' + (occ ? ' disabled' : '') + '>' + esc(STM.desc || '') + '</textarea>'
          + '<label class="stm-sourire"><input type="checkbox" id="stm-sourire"' + (STM.sourire === false ? '' : ' checked') + (occ ? ' disabled' : '') + '> ${T("Mannequin souriant")}</label></div>' : '')
      // LE DÉFROISSAGE (7.70.8) : sans mannequin ET défroissé en un seul appel The New Black, au même prix ; coché par défaut
      + (STM.voie === 'fantome' ? '<label class="stm-sourire stm-defr"><input type="checkbox" id="stm-defroisser"' + (STM.defroisser === false ? '' : ' checked') + (occ ? ' disabled' : '') + '> ${T("Défroisser le vêtement")} <span class="aide">${T("(même prix)")}</span></label>' : '')
      + '<div class="stm-regl">'
      + '<label>${T("Fond")} <select id="stm-fond"' + (occ ? ' disabled' : '') + '>'
      + fonds.map(function(p){ return '<option value="' + esc(p.cle) + '"' + (p.cle === STM.preset ? ' selected' : '') + '>' + esc(p.label) + '</option>'; }).join('') + '</select></label></div>'
      + '<div class="pied2"><button type="button" id="stm-annuler"' + (occ ? ' disabled' : '') + '>${T("Fermer")}</button>'
      + '<button type="button" class="prim" id="stm-go"' + (occ || !n ? ' disabled' : '') + '>' + (occ ? '${T("Génération en cours…")}' : '${T("Générer et placer dans la fiche")}' + prix) + '</button></div>';
    var $ = function(id){ return document.getElementById(id); };
    b.querySelectorAll('[data-stm-on]').forEach(function(cb){ cb.onchange = function(){ STM.photos[+cb.getAttribute('data-stm-on')].on = cb.checked; stmDessiner(); }; });
    b.querySelectorAll('[data-stm-voie]').forEach(function(x){ x.onclick = function(){
      STM.voie = x.getAttribute('data-stm-voie');
      if (STM.voie !== 'fantome' && STM.preset === 'transparent') STM.preset = (STM_PRESETS[0] || {}).cle || '';
      if (STM.voie === 'fantome' && !STM.choisiFond) STM.preset = 'transparent';
      stmDessiner(); stmEstimer(); }; });
    if ($('stm-fond')) $('stm-fond').onchange = function(){ STM.preset = this.value; STM.choisiFond = true; stmEstimer(); };
    if ($('stm-desc')) $('stm-desc').oninput = function(){ STM.desc = this.value; };
    if ($('stm-sourire')) $('stm-sourire').onchange = function(){ STM.sourire = this.checked; };
    if ($('stm-defroisser')) $('stm-defroisser').onchange = function(){ STM.defroisser = this.checked; };
    $('stm-annuler').onclick = stmFermer;
    $('stm-go').onclick = stmGenerer;
  }
  function stmSource(src, fini){
    if (/^data:/.test(src) || !(P && P.imageLocale)) { fini(src); return; }
    P.imageLocale(src).then(function(d){ fini(d || src); }, function(){ fini(src); });
  }
  function stmGenerer(){
    if (!STM || STM.enCours) return;
    var liste = stmChoisies(); if (!liste.length) return;
    STM.enCours = true; STM.etats = {}; stmDessiner();
    var refDevant = '', echec = false;
    var suite = function(i){
      if (!STM) return;
      if (i >= liste.length) {
        STM.enCours = false;
        if (!echec) { dire('${T("Photos du Studio placées dans la fiche. Enregistrez la fiche pour les attacher.")}', 'bon'); stmFermer(); }
        else stmDessiner();
        return;
      }
      var p = liste[i];
      STM.etats[p.role] = '${T("Génération…")}'; stmDessiner();
      stmSource(p.src, function(img){
        P.appeler('studio:traiter', stmSaisie(img)).then(function(r){
          if (!STM) return;
          if (!r || !r.ok) { STM.etats[p.role] = '✗ ' + expliquer(r); echec = true; suite(liste.length); return; }
          /* RANGÉE DANS LA PHOTOTHÈQUE D ABORD (7.70.10, sa remarque : « tu n enregistres pas les photos de dos dans la
             photothèque ») : le Studio de la fiche posait le rendu tel quel, en donnée — ni le devant ni le dos n étaient
             rangés. Chaque photo est maintenant importée, étiquetée (article et rôle), et la fiche reçoit son ADRESSE ;
             un rangement raté garde la donnée, rien ne se perd. */
          var poser = function(im){
            if (p.role === 'devant') refDevant = im;
            STM.etats[p.role] = '${T("Rangement dans la photothèque…")}'; stmDessiner();
            var nom = (val('p-sku') || val('p-nom').trim() || 'studio') + '-' + (p.role === 'dos' ? 'dos' : 'devant');
            // parentTnb : l empreinte de l image rendue par The New Black — la photo finie lui est rattachée (cabine d essayage)
            P.appeler('studio:enregistrer', { image: im, nom: nom, produit: ID ? String(ID) : '', produitNom: val('p-nom').trim(), role: p.role, parentTnb: r.empreinte || '' }).then(function(e){
              if (!STM) return;
              var ok = !!(e && e.ok && e.url);
              poserDuStudio({ url: ok ? e.url : im, role: p.role, code: (e && e.code) || '' }, function(){
                if (!STM) return;
                STM.etats[p.role] = '✓ ' + (ok ? '${T("Placée dans la fiche et rangée dans la photothèque")}' : '${T("Placée dans la fiche (non rangée dans la photothèque)")}');
                suite(i + 1);
              });
            });
          };
          /* LA COULEUR DE L ORIGINAL (2026-10-20, sa capture : le gris taupe devenu gris bleuté). Chaque résultat est
             mesuré contre SA photo d origine et ramené sur elle dès qu il s en écarte (ΔE > 6) ; le dos, contre le
             devant déjà accordé — les deux faces portent alors la même teinte. */
          var ref = p.role === 'dos' && refDevant ? refDevant : img;
          STM.etats[p.role] = '${T("Accord de la couleur sur l’original…")}'; stmDessiner();
          P.appeler('studio:teinte', { image: r.image, reference: ref }).then(function(t){
            if (t && t.ok && t.meme && t.deltaE <= 6) { poser(r.image); return; }
            /* ⚠ L ACCORD EST VÉRIFIÉ (2026-10-21, sa capture : un dos nettement plus foncé que le devant) : après un
               passage, on remesure ; encore à plus de ΔE 4, un second passage — on ne pose jamais un accord à moitié fait. */
            P.appeler('studio:harmoniser', { image: r.image, reference: ref }).then(function(hh){
              var im1 = hh && hh.ok ? hh.image : r.image;
              if (!(hh && hh.ok)) { poser(im1); return; }
              P.appeler('studio:teinte', { image: im1, reference: ref }).then(function(t2){
                if (t2 && t2.ok && t2.meme && t2.deltaE <= 4) { poser(im1); return; }
                P.appeler('studio:harmoniser', { image: im1, reference: ref }).then(function(h2){ poser(h2 && h2.ok ? h2.image : im1); });
              });
            });
          });
        });
      });
    };
    suite(0);
  }
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape' && STM && !STM.enCours) { ev.stopPropagation(); stmFermer(); } }, true);
  function suivreStudio(){
    if (RET_T) return;
    var tour = function(){ if (!document.hidden) releverStudio(); };
    tour();
    RET_T = setInterval(tour, 2000);
  }
  function releverStudio(){
    if (RET_OCC) return;
    P.appeler('studio:retours', cleStudio()).then(function(r){
      if (!r || !r.ok) return;
      var l = (r.retours || []).filter(function(x){ return !RET_VU[x.id]; });
      if (!l.length) return;
      RET_OCC = true;
      var suite = function(i){
        if (i >= l.length) { RET_OCC = false; return; }
        RET_VU[l[i].id] = 1;
        poserDuStudio(l[i], function(){ P.appeler('studio:retourPris', cleStudio(), l[i].id); suite(i + 1); });
      };
      suite(0);
    });
  }
  // Une case libre pour une photo : la première libre (mode simple), ou « Autre » puis les côtés (mode angles).
  function caseLibre(){
    var cles = modeStandard() ? (function(){ var x = []; for (var i = 1; i <= MAX_PHOTOS; i++) x.push('libre' + i); return x; })() : ['autres', 'coteG', 'coteD'];
    for (var i = 0; i < cles.length; i++) if (!VUES[cles[i]]) return cles[i];
    return '';
  }
  function ajouterLibre(url){ var k = caseLibre(); if (k) VUES[k] = url; return k; }
  function nomRoleStudio(r){ return r === 'dos' ? '${T("Dos")}' : (r === 'autre' ? '${T("Autre")}' : '${T("Devant")}'); }
  function poserDuStudio(it, fini){
    var url = it.url, role = it.role || 'autre';
    var conclure = function(ou){
      dessinerVues(); montrerImage(IMAGE); majIa(); dessiner3d();
      try { Assist.fil(); } catch (e) {}
      dire(ou ? '${T("Photo du Studio posée ({r}) — {c}. Enregistrez la fiche pour l’attacher.")}'.replace('{r}', nomRoleStudio(role)).replace('{c}', ou)
        : '${T("Plus de case libre pour la photo du Studio {c} : retirez une photo, puis rouvrez la fiche.")}'.replace('{c}', it.code || ''), ou ? 'bon' : 'att');
      fini();
    };
    var deja = function(){ return url === IMAGE || Object.keys(VUES).some(function(k){ return VUES[k] === url; }); };
    if (deja()) { fini(); return; }
    try { if (P && P.premierPlan) P.premierPlan(); } catch (e) {}
    var retirerVue = function(a){ if (!a) return; Object.keys(VUES).forEach(function(k){ if (VUES[k] === a) delete VUES[k]; }); if (DOS_SRC === a) DOS_SRC = ''; };
    if (role === 'devant') {
      if (!IMAGE) { IMAGE = url; conclure('${T("photo principale")}'); return; }
      /* L ORIGINALE EST RETIRÉE (2026-10-20, sa demande : « quand tu termines les photos avec le Studio, tu dois retirer
         les anciennes aussi ») : la photo traitée prend sa place, et l originale quitte la fiche — l enregistrement
         efface du stockage ce qui n est plus cité. */
      if (STU_ORIG && STU_ORIG.devant && IMAGE === STU_ORIG.devant) { var a0 = IMAGE; IMAGE = url; retirerVue(a0); STU_ORIG.devant = ''; conclure('${T("photo principale")}'); return; }
      szConfirmer({ prudent: true, titre: '${T("Remplacer la photo principale ?")}',
        texte: '${T("Le Studio envoie une nouvelle photo du devant ({c}). L’actuelle passera dans une case libre.")}'.replace('{c}', it.code || ''),
        oui: '${T("Remplacer")}', non: '${T("Ajouter aux photos")}' }).then(function(ok){
          if (ok) { var a = IMAGE; IMAGE = url; ajouterLibre(a); conclure('${T("photo principale")}'); }
          else conclure(ajouterLibre(url) ? '${T("case libre")}' : '');
        });
      return;
    }
    if (role === 'dos') {
      if (!modeStandard()) {
        if (!VUES.derriere) { VUES.derriere = url; conclure('${T("case « Derrière »")}'); return; }
        if (STU_ORIG && STU_ORIG.dos && VUES.derriere === STU_ORIG.dos) { var a1 = VUES.derriere; VUES.derriere = url; retirerVue(a1); STU_ORIG.dos = ''; conclure('${T("case « Derrière »")}'); return; }
        szConfirmer({ prudent: true, titre: '${T("Remplacer la photo « Derrière » ?")}',
          texte: '${T("Le Studio envoie une nouvelle photo du dos ({c}). L’actuelle passera dans une case libre.")}'.replace('{c}', it.code || ''),
          oui: '${T("Remplacer")}', non: '${T("Ajouter aux photos")}' }).then(function(ok){
            if (ok) { var a = VUES.derriere; VUES.derriere = url; ajouterLibre(a); conclure('${T("case « Derrière »")}'); }
            else conclure(ajouterLibre(url) ? '${T("case libre")}' : '');
          });
        return;
      }
      var marquer = function(){ var k = ajouterLibre(url); if (k) DOS_SRC = url; conclure(k ? '${T("marquée « Dos »")}' : ''); };
      if (!photoDos()) { marquer(); return; }
      if (STU_ORIG && STU_ORIG.dos && photoDos() === STU_ORIG.dos) { var a2 = STU_ORIG.dos; STU_ORIG.dos = ''; retirerVue(a2); marquer(); return; }
      szConfirmer({ prudent: true, titre: '${T("Marquer la nouvelle photo « Dos » ?")}',
        texte: '${T("Le Studio envoie une nouvelle photo du dos ({c}). L’actuelle reste parmi les photos, sans la marque « Dos ».")}'.replace('{c}', it.code || ''),
        oui: '${T("Marquer « Dos »")}', non: '${T("Ajouter aux photos")}' }).then(function(ok){
          if (ok) marquer(); else conclure(ajouterLibre(url) ? '${T("case libre")}' : '');
        });
      return;
    }
    conclure(ajouterLibre(url) ? '${T("case libre")}' : '');
  }
  // À l ouverture d une fiche : les photos du Studio étiquetées pour elle et pas encore posées sont PROPOSÉES.
  function proposerPrevues(){
    if (!ID) return;
    P.appeler('studio:retours', String(ID), { prevues: true }).then(function(r){
      var b = document.getElementById('p-studio-attente');
      PREVUES = (r && r.ok && r.prevues) ? r.prevues : [];
      if ((r && r.ok && (r.retours || []).length)) suivreStudio();
      if (!b) return;
      b.style.display = PREVUES.length ? '' : 'none';
      b.innerHTML = PREVUES.length ? (PREVUES.length > 1 ? '${T("{n} photos du Studio attendent cette fiche.")}' : '${T("{n} photo du Studio attend cette fiche.")}').replace('{n}', String(PREVUES.length))
        + ' <button type="button" id="p-studio-placer">${T("Les placer")}</button>' : '';
    });
  }
  function placerPrevues(){
    var l = PREVUES.slice(); PREVUES = [];
    var b = document.getElementById('p-studio-attente'); if (b) b.style.display = 'none';
    var suite = function(i){ if (i < l.length) poserDuStudio({ url: l[i].url, role: l[i].role, code: l[i].code }, function(){ suite(i + 1); }); };
    suite(0);
  }
  window.addEventListener('pagehide', function(){ if (RET_T) { clearInterval(RET_T); RET_T = null; } });

  /* LA TAILLE DES CASES (2026-10-26) : la carte Photos remplit l'étape ; on donne à la principale toute la hauteur
     (moins ses gestes), puis on cherche la PLUS GRANDE case (3:4) qui tient — grille du dos et des photos
     additionnelles, puis la fibre — dans la colonne de droite. Recalculée au dessin, à l'ouverture de l'étape, au
     redimensionnement. */
  function ajusterPhotos(){
    var lp = document.querySelector('.carte.pf-photos .ligne-photos');
    if (!lp || !lp.offsetParent) return;
    // La hauteur OFFERTE : du haut de la rangée au bas de la CARTE (qui remplit l'étape) — pas la hauteur de la
    // rangée elle-même, qui ne mesure que son contenu.
    var carte = lp.closest('.carte') || lp, rc = carte.getBoundingClientRect(), rl = lp.getBoundingClientRect();
    // La carte n'a pas toujours sa taille finale au premier calcul : on la SUIT (une fois) et l'on recalcule à chaque
    // changement de taille réel — ouverture de l'étape, fenêtre redimensionnée, panneau voisin qui se dessine.
    if (!carte.__pvSuivi && typeof ResizeObserver !== 'undefined') {
      carte.__pvSuivi = true;
      var dernier = 0;
      new ResizeObserver(function(){ var hh = carte.clientHeight + 'x' + carte.clientWidth; if (hh !== dernier) { dernier = hh; requestAnimationFrame(ajusterPhotos); } }).observe(carte);
    }
    var H = Math.floor(rc.bottom - rl.top - (parseFloat(getComputedStyle(carte).paddingBottom) || 0) - 4), W = lp.clientWidth;
    if (!(H > 150 && W > 300)) return;
    var vp = lp.querySelector('.vue-principale'), gestes = 0;
    if (vp) Array.prototype.forEach.call(vp.children, function(c){ if (!c.classList.contains('vign') && c.offsetParent) gestes += c.offsetHeight + 6; });
    var mh = Math.max(180, H - gestes - 4), mw = Math.min(mh * 0.75, W * 0.42);
    mh = mw / 0.75;
    lp.style.setProperty('--pv-main-w', Math.floor(mw) + 'px');
    lp.style.setProperty('--pv-main-h', Math.floor(mh) + 'px');
    var rw = W - mw - 21, haut = 0;
    ['p-studio-attente', 'p-3d-carte'].forEach(function(id){ var e = document.getElementById(id); if (e && e.offsetParent) haut += e.offsetHeight + 13; });
    var n = Math.max(1, document.querySelectorAll('#p-vues .vue').length);
    var demarquer = document.querySelector('.pv-demarquer') ? 32 : 0;
    var fibre = document.getElementById('p-fibre-bloc'), fibreTete = fibre ? 64 : 0;
    var meilleur = 88;
    for (var w = 260; w >= 88; w -= 4) {
      var cols = Math.max(1, Math.floor((rw + 10) / (w + 10))), rangs = Math.ceil(n / cols);
      var besoin = haut + 24 + rangs * (w * 4 / 3 + 24) + (rangs - 1) * 10 + demarquer + (fibre ? fibreTete + w : 0);
      if (besoin <= H) { meilleur = w; break; }
    }
    lp.style.setProperty('--pv-w', meilleur + 'px');
  }
  window.addEventListener('resize', function(){ clearTimeout(window.__pvT); window.__pvT = setTimeout(ajusterPhotos, 80); });
  /* La case FIBRE (2026-10-26). FIBRE : l'image (data: neuve, ou adresse déjà en ligne) — vide, rien n'est envoyé. */
  var FIBRE = '', FIBRE_OCC = false, PRIX_FIBRE = 0.04;
  function dessinerFibre(){
    var z = document.getElementById('p-fibre-bloc'); if (!z) return;
    z.innerHTML = '<div class="pv-t">${T("Fibre agrandie")} <span class="pv-opt">${T("facultatif")}</span></div>'
      + '<div class="pv-fibre-l"><div class="cadre-fibre' + (FIBRE ? ' pleine' : '') + '">'
      + (FIBRE ? '<img src="' + esc(FIBRE) + '" alt="">' : '<span>${T("aucune")}</span>') + '</div>'
      + '<div class="pv-fibre-g">'
      + '<button type="button" id="p-fibre-gen"' + (!IMAGE || FIBRE_OCC ? ' disabled' : '') + '>'
      + (FIBRE_OCC ? '${T("Génération en cours…")}' : (FIBRE ? '${T("Regénérer le gros plan")}' : '${T("Générer le gros plan de la fibre")}'))
      + ' · ' + szArgentSymbole(szArgentNombre(PRIX_FIBRE, 2)) + ' US</button>'
      + (FIBRE ? '<button type="button" id="p-fibre-x">${T("Retirer")}</button>' : '')
      + (!IMAGE ? '<span class="pv-etat">${T("Choisissez d’abord la photo principale.")}</span>' : '')
      + '</div></div>';
  }
  function genererFibre(){
    if (!IMAGE || FIBRE_OCC) return;
    FIBRE_OCC = true; dessinerFibre(); dire('${T("Gros plan de la fibre : recherche de la zone de tissu…")}');
    P.appeler('produit:grosPlanZone', IMAGE).then(function(rz){
      if (!rz || !rz.ok) {
        FIBRE_OCC = false; dessinerFibre();
        dire(rz && rz.motif === 'zone_introuvable' ? '${T("Aucune zone de tissu assez grande et unie dans la photo principale.")}' : expliquer(rz), 'err');
        return;
      }
      dire('${T("Gros plan de la fibre : rendu par l’IA… (environ 20 s)")}');
      P.appeler('produit:grosPlan', IMAGE, rz.zone, 'pro', cleCouts(), PRIX_FIBRE).then(function(r){
        FIBRE_OCC = false;
        if (r && r.motif === 'prix_change' && r.prixReel != null) {
          PRIX_FIBRE = Number(r.prixReel); dessinerFibre();
          dire('${T("Le prix a changé : rien n’a été lancé. Le bouton affiche le nouveau prix — recliquez pour lancer.")}', 'att');
          return;
        }
        if (!r || !r.ok || !r.image) { dessinerFibre(); dire((r && r.detail) || expliquer(r), 'err'); return; }
        FIBRE = r.image; dessinerFibre(); chargerCouts(); majFicheBientot();
        dire('${T("Gros plan de la fibre prêt — il sera enregistré avec la fiche.")}', 'bon');
      });
    });
  }
  function montrerImage(src){
    dessiner3d();   // le devant de l'aperçu 3D est la photo principale
    /* (2026-10-26, sa remarque « la description IA ne marche pas ») Le bouton « Rédiger avec l'IA » suit la photo
       principale ICI, à chaque affichage : à l'ouverture d'une fiche existante, il restait grisé — remplir() posait la
       photo sans le réévaluer. */
    majIa();
    dessinerFibre();
    var v = document.getElementById('p-vign'); if (!v) return;
    v.classList.toggle('pleine', !!src);
    v.setAttribute('draggable', src ? 'true' : 'false');
    var bd = document.getElementById('p-detourer');
    if (bd) bd.disabled = !src;
    var bf = document.getElementById('p-fibre');
    if (bf) bf.disabled = !src;
    var bs = document.getElementById('p-studio');
    if (bs) bs.disabled = !src && !photoDos();
    v.innerHTML = src
      ? '<img src="' + esc(src) + '" alt="" draggable="false">'
        + '<button type="button" class="x" id="p-vider" title="${T("Retirer la photo")}">×</button>'
      : '${T("choisir une photo")}';
  }

  /* ── GLISSER-DEPOSER DES PHOTOS (demande le 2026-08-08, refait le 2026-10-18) ──
     ⚠ UNE SEULE REGLE, DANS LES DEUX MODES (photos simples et angles) : déposer une photo sur une case
     PLEINE les ÉCHANGE ; sur une case VIDE, elle s y DÉPLACE. La principale suit la même règle : une
     secondaire déposée sur elle prend sa place et l ancienne descend dans la case quittée — rien ne se perd.
     Avant (2026-10-18, sa capture) : les cases libres se « réordonnaient » en se tassant, si bien que glisser
     la photo 1 sur la case 2 vide la remettait… en 1 — rien ne bougeait, le geste semblait mort.
     ⚠ LE RÔLE « DOS » SUIT LA PHOTO, pas la case : DOS_SRC retient son adresse. Il ne tombe que si la photo
     devient la principale (le devant et le dos ne peuvent pas être la même photo). En mode angles, le dos
     est la case « Derrière » : c est une place, et la photo qu on y dépose devient le dos.
     Tout vit dans IMAGE et VUES, jamais dans l écran : le redessin repart de l état. */
  function libresOrdonnees(){
    return Object.keys(VUES).filter(function(k){ return k.indexOf('libre') === 0 && VUES[k]; })
      .sort(function(a, b){ return parseInt(a.slice(5), 10) - parseInt(b.slice(5), 10); })
      .map(function(k){ return VUES[k]; });
  }
  function valeurCase(k){ return k === 'principale' ? IMAGE : (VUES[k] || ''); }
  function poserCase(k, v){
    if (k === 'principale') { IMAGE = v || ''; return; }
    if (v) VUES[k] = v; else delete VUES[k];
  }
  function nomCase(k){ return k === 'principale' ? '${T("Photo principale")}' : nomVue(k); }
  // Déplace (case vide) ou échange (case pleine). Rend true si quelque chose a bougé.
  function deplacer(src, cible){
    if (!src || !cible || src === cible) return false;
    var a = valeurCase(src), b = valeurCase(cible);
    if (!a) return false;
    poserCase(cible, a);
    poserCase(src, b);
    var dosPerdu = false;
    if (DOS_SRC && IMAGE && IMAGE === DOS_SRC) { DOS_SRC = ''; dosPerdu = true; }
    montrerImage(IMAGE); dessinerVues(); majIa();
    var m;
    if (cible === 'principale' || src === 'principale') {
      m = (cible === 'principale' && b) || (src === 'principale' && b)
        ? '${T("Photo principale remplacée — l’ancienne a pris la case quittée.")}'
        : '${T("Photo déplacée dans « {0} ».")}'.split('{0}').join(nomCase(cible));
    } else {
      m = b ? '${T("Photos échangées : « {0} » et « {1} ».")}'.split('{0}').join(nomCase(src)).split('{1}').join(nomCase(cible))
        : '${T("Photo déplacée dans « {0} ».")}'.split('{0}').join(nomCase(cible));
    }
    if (dosPerdu) m += ' ${T("Elle ne peut plus servir de dos : la marque « Dos » est retirée.")}';
    dire(m, dosPerdu ? 'att' : 'bon');
    return true;
  }
  // Le clavier : ‹ › vers la case voisine, ⇤ avec la principale. Le foyer suit la photo dans sa nouvelle case.
  // Les cases de la GRILLE des photos supplémentaires (sans la case Dos) — la même liste au dessin et au clavier.
  function clesGrille(){
    var kd = modeStandard() ? cleDos() : 'derriere';
    return clesVues().filter(function(k){ return k !== 'derriere' && k !== kd; });
  }
  function deplacerAuClavier(cle, sens){
    var cles = clesGrille();
    var i = cles.indexOf(cle);
    if (i < 0) return;
    var cible = sens === 'p' ? 'principale' : cles[i + (sens === 'g' ? -1 : 1)];
    if (!cible) return;
    if (!deplacer(cle, cible)) return;
    var vers = sens === 'p' ? cle : cible;   // après ⇤, la case garde le foyer (elle porte l ancienne principale)
    var bt = document.querySelector('#p-vues [data-depl="' + sens + '"][data-cle="' + vers + '"]');
    if (bt && !bt.disabled) bt.focus();
    else { var autre = document.querySelector('#p-vues [data-cle="' + vers + '"]:not([disabled])'); if (autre) autre.focus(); }
  }
  var GLISSE = null; // 'principale' | cle de la vue tiree
  function nettoyerSurvol(){
    Array.prototype.forEach.call(document.querySelectorAll('.survol'), function(el){
      el.classList.remove('survol'); el.removeAttribute('data-geste');
    });
  }
  function finGlisser(){
    GLISSE = null;
    nettoyerSurvol();
    Array.prototype.forEach.call(document.querySelectorAll('.tire'), function(el){ el.classList.remove('tire'); });
  }
  // La case visée : la principale, un cadre, ou n importe quoi DANS la case (pastille, boutons, légende).
  function caseVisee(el){
    if (!el || !el.closest) return null;
    var v = el.closest('#p-vign'); if (v) return v;
    var c = el.closest('#p-vues [data-vue]'); if (c) return c;
    var w = el.closest('#p-vues .vue');
    return w ? w.querySelector('[data-vue]') : null;
  }
  function cleDe(el){ return el.id === 'p-vign' ? 'principale' : el.getAttribute('data-vue'); }
  document.getElementById('corps').addEventListener('dragstart', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var el = null;
    if (t.closest('#p-vign')) {
      if (!IMAGE) return;
      el = t.closest('#p-vign'); GLISSE = 'principale';
    } else {
      var c = t.closest('#p-vues [data-vue]');
      if (!c || !c.classList.contains('pleine')) return;
      el = c; GLISSE = c.getAttribute('data-vue');
    }
    try { ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', GLISSE); } catch (e) {}
    // La case qu on tire s estompe : on voit d où part la photo pendant tout le geste.
    setTimeout(function(){ if (GLISSE) el.classList.add('tire'); }, 0);
  });
  document.getElementById('corps').addEventListener('dragover', function(ev){
    if (!GLISSE) return;
    var t = caseVisee(ev.target);
    if (!t) { nettoyerSurvol(); return; }
    var k = cleDe(t);
    if (k === GLISSE) { nettoyerSurvol(); return; }
    ev.preventDefault();
    try { ev.dataTransfer.dropEffect = 'move'; } catch (e) {}
    if (t.classList.contains('survol')) return;
    nettoyerSurvol();
    t.classList.add('survol');
    // Ce que le dépôt va faire, écrit sur la case visée.
    t.setAttribute('data-geste', valeurCase(k) ? '${T("⇄ Échanger")}' : '${T("Déposer ici")}');
  });
  document.getElementById('corps').addEventListener('dragend', finGlisser);
  document.getElementById('corps').addEventListener('drop', function(ev){
    if (!GLISSE) return;
    var src = GLISSE;
    var t = caseVisee(ev.target);
    finGlisser();
    if (!t) return;
    ev.preventDefault();
    var cib = cleDe(t);
    if (cib === '__dos__' || (modeStandard() && cib === cleDos() && src !== 'principale')) {
      var vs = valeurCase(src);
      if (src === 'principale' || !vs) { dire('${T("La photo principale est le devant : glissez une photo supplémentaire dans la case Dos.")}', 'att'); return; }
      DOS_SRC = vs; dessinerVues(); dire('${T("Photo marquée comme dos.")}', 'bon'); return;
    }
    deplacer(src, cib);
  });
  var MAX_MO = 8;

  /* ══ LES MÉDIAS DE LA FICHE (2026-10-07) ══════════════════════════════════
     Trois champs facultatifs : mannequin { prenom, tailleCm, taillePortee },
     video (une adresse) et vue360 (8 à 36 adresses). La fenêtre ne garde que
     des data URL NEUVES ou des adresses déjà en ligne ; c est le site
     (_pfDoSave) qui dépose les neuves dans R2, par le même chemin que les
     photos — la fiche ne porte JAMAIS de data URL.
     ⚠ LE PLAFOND DE LA VIDÉO EST 5,5 Mo, ET IL NE SE DÉCIDE PAS ICI : le dépôt
     voyage en base64 (+33 %) dans une requête que PHP borne à 8 Mo
     (post_max_size, php.ini-production du Dockerfile). Au-delà, le serveur jette
     le corps sans un mot — d où le refus AVANT la lecture du fichier. */
  var VIDEO = '', VIDEO_OCTETS = 0, VUE360 = [], MQ_TAILLE = '';

  /* ══ L'APERÇU 3D GÉNÉRÉ ET LES COÛTS DE L'ARTICLE (2026-10-18 ; les coûts : 7.16.0) ═════════════════════════
     Sa décision : un VRAI modèle 3D par « Image to 3D » de The New Black (la vue 360° en images est retirée ; les vues
     déjà posées restent). Le poste y projette les VRAIES photos du devant et du dos, puis en contrôle la conformité.
     MOD3D : le modèle posé sur la fiche (adresse) ; un ancien aperçu Hunyuan reste tel quel, retirable.
     CLE_COUTS : la clé sous laquelle le journal des appels payants range ce qu'on dépense ICI —
     l'identifiant du produit, ou « brouillon:… » pendant une création (rattaché au vrai produit à
     l'enregistrement). COUTS : ce que le journal dit avoir dépensé pour cet article.
     G3D : la génération en cours, suivie dans la FILE DES GÉNÉRATIONS de la page principale. */
  var MOD3D = '', CLE_COUTS = '', COUTS = null;
  /* LE MODÈLE 3D NE PART QUE S IL A ÉTÉ CHANGÉ ICI (2026-10-21) : sinon une fiche ouverte avant qu une génération pose
     un nouveau modèle renvoyait l ancien (ou aucun) et l écrasait — et le nouveau fichier quittait le stockage. */
  var MOD3D0 = '';
  function sansModele3d(o){ if (MOD3D === MOD3D0) delete o.modele3d; return o; }
  var G3D = { conf: false, forcer: false, enCours: false, genId: '', etapes: null, minuterie: 0, verrou: null, vu: '', attente: null };
  /* LES DIX ÉTAPES viennent de la FILE (generations:etat) — sa condition : « aucune étape silencieuse ». Les libellés
     sont traduits ICI, par rang. The New Black met ~2 min 30 s à rendre le modèle ; le travail au poste, ~15 s. */
  var ETAPES_3D = ['${T("Envoi des photos")}', '${T("Génération 3D chez The New Black")}', '${T("Téléchargement du modèle")}',
    '${T("Détourage et recalage des photos devant/dos")}', '${T("Projection des photos sur le modèle")}', '${T("Relief inventé effacé sous les photos")}',
    '${T("Couleur fidèle")}', '${T("Compression")}', '${T("Contrôle de conformité")}', '${T("Dépôt (R2 et photothèque)")}', '${T("Posé sur la fiche")}'];
  /* (2026-10-19, sa demande) PLUS DE LONGUE BARRE D ÉTAPES ICI : le suivi détaillé passe par la NOTIFICATION (une petite
     fenêtre à part, en bas à droite de l écran) et la fenêtre Générations. La fiche garde UNE ligne d état discrète. */
  function dessinerEtapes3d(){
    var z = document.getElementById('p-3dg-etapes'); if (!z) return;
    if (!G3D.etapes) { z.style.display = 'none'; z.innerHTML = ''; return; }
    var e = G3D.etapes, n = e.length || 1, fait = 0, ic = -1;
    e.forEach(function(x, i){ if (x.etat === 'fait') fait++; if (x.etat === 'cours' && ic < 0) ic = i; });
    var att = e.some(function(x){ return x.etat === 'attente'; }), err = e.some(function(x){ return x.etat === 'err'; });
    var frac = 0;
    if (ic >= 0 && e[ic].t0) frac = Math.min(0.95, (Date.now() - e[ic].t0) / 1000 / (ic === 1 ? (G3D.duree || 150) : 6));
    var pct = Math.round(Math.min(99, (fait + frac) / n * 100));
    var t = att ? '${T("Aperçu 3D en attente de votre confirmation")}' : (err ? '${T("Aperçu 3D : échec")}'
      : (ic >= 0 ? '${T("Aperçu 3D en cours — {0} %")}'.replace('{0}', String(pct)) : ''));
    z.style.display = t ? '' : 'none';
    z.innerHTML = t ? '<li class="' + (att ? 'attente' : (err ? 'err' : 'cours')) + '">' + esc(t) + '</li>' : '';
  }
  // Le verrou des photos : posé par une génération de CE produit (ici ou sur un autre poste), levé à sa fin.
  function verrouPhotos(v){
    G3D.verrou = v || null;
    document.documentElement.classList.toggle('photos-verrou', !!v);
    var txt = v ? ('${T("Aperçu 3D en cours de génération par {p} — étape {e}. Les photos sont verrouillées jusqu’à la fin ; le reste de la fiche reste modifiable, et vous pouvez l’enregistrer ou la fermer.")}'
      .replace('{p}', v.par || '—').replace('{e}', v.etape || '…')) : '';
    Array.prototype.forEach.call(document.querySelectorAll('.p-verrou-photos'), function(b){ b.textContent = txt; });
  }
  // La conformité, dite en clair : « Conforme au devant : 98 % · au dos : 93 % ».
  function texteConformite(c){
    if (!c || c.devant == null) return '';
    return '${T("Conforme au devant : {d} % · au dos : {o} %")}'.replace('{d}', String(c.devant)).replace('{o}', String(c.dos))
      + (c.reliefEfface != null ? ' · ' + '${T("relief inventé effacé à {r} %")}'.replace('{r}', String(c.reliefEfface)) : '')
      + (c.teinteUniformite != null ? ' · ' + '${T("teinte uniforme à ΔE {u} (face/photo ΔE {p})")}'.replace('{u}', String(c.teinteUniformite)).replace('{p}', String(c.teinteEcartPhoto)) : '')
      + (c.structureDos != null ? ' · ' + '${T("structure du dos {s}")}'.replace('{s}', szNombre(c.structureDos, 2)) : '');
  }
  /* LE SUIVI : toutes les 2 s tant qu'une génération concerne cette fiche. ⚠ À la fin, le modèle posé par la
     génération REMPLACE celui de la fenêtre : sans cela, enregistrer la fiche ensuite remettrait l'ancien. */
  function suivre3d(){
    clearInterval(G3D.minuterie);
    var tour = function(){
      if (!ID) return;
      P.appeler('generations:etat').then(function(r){
        var l = (r && r.ok && r.liste) ? r.liste.filter(function(x){ return x.produit === String(ID) && x.genre === '3d'; }) : [];
        var g = l.filter(function(x){ return x.id === G3D.genId; })[0]
          || l.filter(function(x){ return x.etat === 'cours' || x.etat === 'attente'; })[0]
          // À l ouverture : la plus récente des dernières 24 h, pour DIRE ce qu il est advenu (échec, interrompue…).
          || (!G3D.vu ? l.filter(function(x){ return Date.now() - (x.fin || x.debut || 0) < 24 * 3600000; })
               .sort(function(a, b){ return (b.fin || b.debut || 0) - (a.fin || a.debut || 0); })[0] : null) || null;
        if (!g) {
          // rien ici : peut-être sur un autre poste (le serveur le sait)
          P.appeler('produit:photosVerrou', ID).then(function(v){
            verrouPhotos(v && v.ok ? v.verrou : null);
            if (!(v && v.ok && v.verrou)) { G3D.enCours = false; clearInterval(G3D.minuterie); dessiner3d(); }
          });
          return;
        }
        G3D.genId = g.id; G3D.etapes = g.etapes; G3D.duree = g.dureeEstimee; G3D.attente = g.etat === 'attente' ? g : null;
        dessinerEtapes3d();
        var e = document.getElementById('p-3dg-etat');
        if (g.etat === 'cours') {
          G3D.enCours = true;
          verrouPhotos({ par: g.par, etape: (g.etapeCourante + 1) + '/' + g.etapes.length + ' · ' + (ETAPES_3D[g.etapeCourante] || '') });
          if (e) e.textContent = '${T("Suivie dans le panneau des générations : vous pouvez enregistrer, fermer ou changer de module.")}';
        } else {
          G3D.enCours = false; verrouPhotos(null);
          if (g.etat !== 'attente') clearInterval(G3D.minuterie);
          if (G3D.vu !== g.id + g.etat) {
            G3D.vu = g.id + g.etat;
            if (g.etat === 'fini' && g.modele3d) {
              MOD3D = g.modele3d; MOD3D0 = g.modele3d; dessinerMedias();
              dire('${T("Aperçu 3D posé sur la fiche.")} ' + texteConformite(g.conformite), 'bon');
            } else if (g.etat === 'attente') dire('${T("Le modèle 3D ne correspond pas bien aux photos : il attend votre confirmation.")} ' + texteConformite(g.conformite), 'att');
            else if (g.etat === 'echec') dire('${T("L’aperçu 3D a échoué :")} ' + (g.message || ''), 'err');
            else if (g.etat === 'interrompu') dire('${T("Aperçu 3D interrompu.")} ' + (g.message || ''), 'att');
            else if (g.etat === 'rejete') dire('${T("Modèle 3D rejeté — rien n’a été posé sur la fiche.")}', 'att');
          }
          if (e) e.textContent = g.etat === 'attente' ? texteConformite(g.conformite) : '';
        }
        dessiner3d();
      });
    };
    tour();
    G3D.minuterie = setInterval(tour, 2000);
  }
  /* LE PRIX ANNONCÉ : 10 crédits × 0,065 $ (forfait Business) = 0,65 $ US. Il part avec la demande (prixAnnonce) :
     si le relais lit un autre barème chez The New Black, rien ne part et la fenêtre affiche le vrai montant. */
  var PRIX_3D = 0.65;
  function prixUS(x){ return '${T("≈ {n} $ US")}'.replace('{n}', szNombre(Math.round(x * 100) / 100, 2)); }
  function prix3d(){ return prixUS(PRIX_3D); }
  // La photo du dos : la vue « Derrière » (mode angles) ou la photo marquée « Dos » (mode simple).
  function photoDos(){
    if (!modeStandard()) return VUES.derriere || '';
    return (DOS_SRC && libresOrdonnees().indexOf(DOS_SRC) >= 0) ? DOS_SRC : '';
  }
  // Le brouillon retient la CASE de la photo du dos, pas l'image une seconde fois.
  function cleDos(){
    if (!DOS_SRC) return '';
    var k = Object.keys(VUES).filter(function(x){ return VUES[x] === DOS_SRC; })[0];
    return k || '';
  }
  function raison3d(){
    if (!ID) return '${T("Enregistrez d’abord la fiche : l’aperçu 3D se pose directement sur elle, même si vous la fermez.")}';
    if (G3D.verrou && !G3D.enCours) return '${T("Un aperçu 3D est déjà en cours pour cet article.")}';
    if (G3D.attente) return '${T("Un modèle 3D attend votre confirmation pour cet article.")}';
    if (!IMAGE) return '${T("Choisissez d’abord la photo principale.")}';
    var d = photoDos();
    if (!d) return '${T("Ajoutez une photo du dos pour générer l’aperçu 3D.")}' + ' '
      + (modeStandard() ? '${T("Marquez-la « Dos » parmi les photos.")}' : '${T("Déposez-la dans la case « Derrière ».")}');
    if (d === IMAGE) return '${T("La photo du dos est la même que celle du devant : choisissez une vraie photo du dos.")}';
    return '';
  }
  function cleCouts(){
    if (ID) return String(ID);
    if (!CLE_COUTS) CLE_COUTS = 'brouillon:' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return CLE_COUTS;
  }
  function chargerCouts(){
    P.appeler('produit:couts', [cleCouts()]).then(function(r){
      COUTS = (r && r.ok) ? ((r.couts || {})[cleCouts()] || { total: 0, n: 0, detail: [] }) : null;
      majFicheBientot();
    });
  }
  function dessiner3d(){
    var b = document.getElementById('p-3d-gen'), e = document.getElementById('p-3dg-etat');
    if (!b || !G3D) return;
    var raison = raison3d(), pv = document.getElementById('p-3d-vues');
    b.disabled = G3D.enCours || !!raison;
    b.innerHTML = G3D.enCours ? '<span class="ic">⏳</span> ${T("Génération en cours…")}'
      : (G3D.forcer ? '<span class="ic">⚠</span> ${T("Regénérer quand même")}'
        : '<span class="ic">🧊</span> ' + (MOD3D ? '${T("Regénérer l’aperçu 3D")}' : '${T("Générer l’aperçu 3D")}'))
        + ' (${T("par The New Black")}, ' + prix3d() + ')';
    // Ce qui sert, dit en clair : le devant part chez The New Black, le dos est projeté au poste.
    if (pv) pv.textContent = '${T("Devant :")} ' + (IMAGE ? '✓ ${T("photo principale")}' : '—') + ' · ${T("Dos :")} '
      + (photoDos() ? '✓ ' + (modeStandard() ? '${T("photo marquée « Dos »")}' : '${T("vue « Derrière »")}') : '—');
    if (e && !G3D.enCours && !G3D.attente) e.textContent = raison;
    b.onclick = lancer3d;
    // un modèle en attente de confirmation : Publier quand même / Rejeter
    var at = document.getElementById('p-3d-attente');
    if (at) {
      at.style.display = G3D.attente ? '' : 'none';
      var pq = document.getElementById('p-3d-publier'), rj = document.getElementById('p-3d-rejeter');
      if (pq) pq.onclick = function(){ agirAttente('confirmer'); };
      if (rj) rj.onclick = function(){ agirAttente('rejeter'); };
    }
    // le modèle posé : en ligne, retirable
    var l3 = document.getElementById('p-3d-l'), e3 = document.getElementById('p-3d-etat'), rt = document.getElementById('p-3d-retirer');
    if (l3) l3.style.display = MOD3D ? '' : 'none';
    if (e3) e3.textContent = MOD3D ? '${T("Aperçu 3D en ligne sur la fiche — le client le tourne de gauche à droite.")}' : '';
    if (rt) rt.onclick = function(){ MOD3D = ''; dessiner3d(); dire('${T("Aperçu 3D retiré — enregistrez pour l’enlever de la boutique.")}', 'att'); };
    var rf = document.getElementById('p-3d-refaire');
    if (rf) {
      /* ⚠ L'ORIGINAL, GARDÉ 30 JOURS (2026-10-19, sa décision) : « Refaire le rendu » ne repart que de l'original de
         The New Black. Supprimé (30 jours) ou jamais conservé : le bouton est GRISÉ, avec la raison, jusqu'à une
         nouvelle génération. L'état se demande au pont (sans rien lancer) ; une génération en cours le fait redemander. */
      if (G3D.enCours) BRUT3D = null;
      if (!BRUT3D && ID && !G3D.enCours && !BRUT3D_DEMANDE) {
        BRUT3D_DEMANDE = true;
        P.appeler('generations:refaireCouleur', String(ID), { verifier: true }).then(function(r){
          BRUT3D = r || { ok: false, motif: 'echec' }; BRUT3D_DEMANDE = false; dessiner3d();
        }, function(){ BRUT3D = { ok: false, motif: 'echec' }; BRUT3D_DEMANDE = false; dessiner3d(); });
      }
      var rr = raisonRefaire3d();
      rf.disabled = G3D.enCours || !!G3D.attente || !ID || !BRUT3D || !!rr;
      rf.title = rr || (BRUT3D && BRUT3D.expireLe ? '${T("Retraite l’aperçu au poste depuis l’original de The New Black — sans nouvel appel payant. Original conservé jusqu’au")} ' + dateCourte3d(BRUT3D.expireLe) + '.' : '');
      if (e3 && MOD3D && rr) e3.textContent = rr;
      rf.onclick = refaireCouleur3d;
    }
  }
  var BRUT3D = null, BRUT3D_DEMANDE = false;
  /* (2026-10-22, sa demande) Le lien TEMPORAIRE « Rattacher un original… » (2026-10-19) est retiré : les aperçus 3D
     d'avant la conservation des originaux sont réparés (la Walla a son original). Passé 30 jours, l'original part
     (cron-maintenance 5d) et « Refaire le rendu » se grise en le disant : on génère alors un nouvel aperçu 3D. */
  function dateCourte3d(ms){ try { return new Date(ms).toLocaleDateString('${LIEU()}', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }
  function raisonRefaire3d(){
    if (!BRUT3D || BRUT3D.ok) return '';
    if (BRUT3D.motif === 'original_supprime') return '${T("Original supprimé après 30 jours — générez un nouvel aperçu 3D pour pouvoir refaire le rendu.")}';
    if (BRUT3D.motif === 'original_absent') return '${T("L’original de The New Black n’a pas été conservé pour cet aperçu — générez un nouvel aperçu 3D pour pouvoir refaire le rendu.")}';
    return expliquer(BRUT3D);
  }
  /* « REFAIRE LE RENDU » (2026-10-19) : l'aperçu est RETRAITÉ au poste depuis l'ORIGINAL de The New Black, conservé
     30 jours — jamais depuis le modèle posé ; aucun nouvel appel payant. Suivi comme une génération. */
  function refaireCouleur3d(){
    if (!ID || G3D.enCours) return;
    szConfirmer({ prudent: true, titre: '${T("Refaire le rendu de l’aperçu 3D")}',
      texte: '${T("Le modèle est retraité au poste, sans nouvel appel payant : matière mate, relief inventé effacé sous les photos, une seule teinte vérifiée au rendu de la boutique sous huit angles (devant et dos égaux), structure du dos comparée à la photo ; puis l’aperçu est reposé sur la fiche.")}',
      details: [['${T("Coût")}', '${T("0 $ — sans nouvel appel")}'], ['${T("Durée")}', '${T("environ 1 minute au poste")}'],
        ['${T("Source")}', '${T("l’original de The New Black, conservé 30 jours après la génération")}' + (BRUT3D && BRUT3D.expireLe ? ' (${T("jusqu’au")} ' + dateCourte3d(BRUT3D.expireLe) + ')' : '')]],
      oui: '${T("Refaire le rendu")}' }).then(function(ok){
        if (!ok) return;
        P.appeler('generations:refaireCouleur', String(ID)).then(function(r){
          if (!r || !r.ok) { BRUT3D = r || null; dessiner3d(); dire(r && (r.motif === 'original_supprime' || r.motif === 'original_absent') ? raisonRefaire3d() : expliquer(r), 'err'); return; }
          G3D.genId = r.id; G3D.enCours = true; dessiner3d();
          dire('${T("Rendu en cours de retraitement — suivi dans la fenêtre Générations.")}', 'bon');
          suivre3d();
        });
      });
  }
  function agirAttente(geste){
    var g = G3D.attente; if (!g) return;
    szConfirmer({ prudent: geste !== 'rejeter', danger: geste === 'rejeter',
      titre: geste === 'rejeter' ? '${T("Rejeter le modèle 3D")}' : '${T("Publier le modèle 3D")}',
      texte: (geste === 'rejeter' ? '${T("Le modèle sera retiré de la photothèque et rien ne sera posé sur la fiche. Le coût engagé chez The New Black n’est pas remboursé.")}'
        : '${T("Le modèle ne correspond pas bien aux photos. Il sera posé sur la fiche tel quel, et visible en boutique.")}') + ' ' + texteConformite(g.conformite),
      oui: geste === 'rejeter' ? '${T("Rejeter le modèle")}' : '${T("Publier quand même")}' }).then(function(ok){
        if (!ok) return;
        P.appeler('generations:agir', g.id, geste).then(function(r){ if (!r || !r.ok) dire(expliquer(r), 'err'); suivre3d(); });
      });
  }
  function lancer3d(){
    if (G3D.enCours) return;
    var raison = raison3d();
    if (raison) { dire(raison, 'att'); dessiner3d(); return; }
    if (IMAGE.indexOf('data:') === 0 || String(photoDos()).indexOf('data:') === 0) {
      dire('${T("Enregistrez d’abord la fiche : une photo neuve doit être déposée avant la génération.")}', 'att'); return;
    }
    if (!G3D.conf) {
      szConfirmer({ prudent: true,
        titre: (MOD3D || G3D.forcer) ? '${T("Regénérer l’aperçu 3D")}' : '${T("Générer l’aperçu 3D")}',
        texte: '${T("The New Black construit un modèle 3D à partir de la photo du devant ; le poste y projette ensuite les vraies photos du devant et du dos, en corrige la couleur, le compresse et en contrôle la conformité. Sous le seuil, rien n’est posé sans votre accord. Ce traitement est facturé.")}'
          + ((MOD3D || G3D.forcer) ? ' ${T("Il remplacera l’aperçu 3D actuel.")}' : ''),
        details: [['${T("Coût estimé")}', prix3d()], ['${T("Photos")}', '${T("devant (envoyée) + dos (projetée au poste)")}'],
          ['${T("Durée")}', '${T("environ 2 minutes 30 chez The New Black, puis 15 secondes au poste")}'],
          ['${T("Poids en boutique")}', '${T("environ 1 à 2 Mo, chargés seulement si le client ouvre l’aperçu 3D")}']],
        oui: (MOD3D || G3D.forcer) ? '${T("Regénérer l’aperçu 3D")}' : '${T("Générer l’aperçu 3D")}' }).then(function(ok){ if (ok) { G3D.conf = true; lancer3d(); } });
      return;
    }
    G3D.conf = false; G3D.enCours = true; dessiner3d();
    var e = document.getElementById('p-3dg-etat'); if (e) e.textContent = '${T("Envoi de la photo à The New Black…")}';
    P.appeler('generations:lancer3d', { produit: String(ID), image: IMAGE, dos: photoDos(), forcer: G3D.forcer, prix: PRIX_3D }).then(function(r){
      if (!r || !r.ok) {
        G3D.enCours = false;
        if (e) e.textContent = '';
        if (r && r.motif === 'prix_change' && r.prixReel != null) {
          // ⚠ LE CONTRÔLE DES COÛTS : le relais a un autre prix que celui affiché — RIEN n'est parti.
          var avant = PRIX_3D; PRIX_3D = Number(r.prixReel); dessiner3d();
          dire('${T("Le prix a changé : ")}' + prix3d() + '${T(" au lieu de ")}' + prixUS(avant)
            + '${T(". Rien n’a été lancé — cliquez de nouveau pour confirmer au nouveau prix.")}', 'att');
          return;
        }
        if (r && r.motif === 'avertir') {
          // ⚠ LE GARDE-FOU ANTI-BOUCLE : le serveur a déjà des aperçus 3D générés pour cet article.
          G3D.forcer = true; dessiner3d();
          dire('${T("Cet article a déjà ")}' + r.deja + '${T(" aperçu(s) 3D généré(s) (")}' + szArgent(r.dejaCout || 0) + '${T("). Un autre coûtera ")}' + prix3d()
            + '${T(" : cliquez « Regénérer quand même » si c’est voulu.")}', 'att');
          return;
        }
        if (r && r.motif === 'deja_en_cours') {
          dire('${T("Un aperçu 3D est déjà en cours pour cet article, par {p} (étape {e}).")}'.replace('{p}', r.par || '—').replace('{e}', String(r.etape || '…')), 'att');
          suivre3d(); return;
        }
        dessiner3d(); dire(expliquer(r), 'err'); return;
      }
      G3D.forcer = false; G3D.genId = r.id; chargerCouts();
      dire('${T("Aperçu 3D lancé — il continue même si vous enregistrez, fermez la fiche ou changez de module.")}', 'bon');
      suivre3d();
    });
  }
  var MAX_VIDEO_MO = 5.5;

  // La phrase de la boutique, montrée telle qu elle paraîtra : c est le moyen le
  // plus sûr de voir une taille en pouces au lieu de centimètres.
  function lireMannequin(){
    var prenom = val('p-mq-prenom').trim();
    var brut = val('p-mq-cm').trim();
    var cm = Math.round(Number(brut));
    var t = val('p-mq-taille') || '';
    if (!prenom && !brut && !t) return null;
    if (!prenom || !(cm >= 120 && cm <= 220) || !t) return false;
    return { prenom: prenom, tailleCm: cm, taillePortee: t };
  }
  function apercuMannequin(){
    var z = document.getElementById('p-mq-apercu');
    if (!z) return;
    var m = lireMannequin();
    if (m === null) { z.textContent = '${T("Facultatif — les trois champs ensemble, ou aucun.")}'; z.style.color = ''; return; }
    if (m === false) { z.textContent = '${T("Incomplet : prénom, taille de 120 à 220 cm et taille portée.")}'; z.style.color = 'var(--tx-att)'; return; }
    z.style.color = '';
    // Le modèle de phrase suit la langue du poste, comme la boutique : mètres
    // en français, pieds et pouces en anglais.
    var po = Math.round(m.tailleCm / 2.54);
    z.textContent = '${T("En boutique :")} « ' + '${T("{p} mesure {m} m et porte un {t}")}'
      .replace('{p}', m.prenom).replace('{t}', m.taillePortee).replace('{cm}', String(m.tailleCm))
      .replace('{m}', szNombre(m.tailleCm / 100, 2))
      .replace('{pi}', Math.floor(po / 12) + '′' + (po % 12) + '″') + ' »';
  }

  function dessinerMedias(){
    dessiner3d();
    // La taille portée suit les tailles COCHÉES à l étape 2 ; une taille retirée
    // depuis vide le choix plutôt que d annoncer une taille que la fiche ne vend pas.
    var s = document.getElementById('p-mq-taille');
    if (s) {
      var ts = tailles();
      s.innerHTML = '<option value="">—</option>' + ts.map(function(t){
        return '<option value="' + esc(t) + '">' + esc(t) + '</option>'; }).join('');
      s.value = (ts.indexOf(MQ_TAILLE) >= 0) ? MQ_TAILLE : '';
    }
    apercuMannequin();
    var ve = document.getElementById('p-vid-etat'), va = document.getElementById('p-vid-apercu');
    var vr = document.getElementById('p-vid-retirer');
    if (va) va.innerHTML = VIDEO ? '<video src="' + esc(VIDEO) + '" muted loop playsinline controls preload="metadata"></video>' : '';
    if (ve) {
      ve.textContent = !VIDEO ? '${T("Aucune vidéo.")}'
        : (VIDEO.indexOf('data:') === 0
            ? szOctets(VIDEO_OCTETS) + ' — ${T("déposée à l’enregistrement.")}'
            : '${T("Vidéo en ligne.")}');
      var v = va && va.querySelector('video');
      if (v) v.addEventListener('loadedmetadata', function(){
        if (v.duration && isFinite(v.duration)) ve.textContent += ' ' + szNombre(Math.round(v.duration * 10) / 10, 1) + ' s.';
      });
    }
    if (vr) vr.style.display = VIDEO ? '' : 'none';
    var e3 = document.getElementById('p-360-etat'), b3 = document.getElementById('p-360-bande');
    var r3 = document.getElementById('p-360-retirer');
    if (e3) e3.textContent = VUE360.length ? (VUE360.length + ' ${T("vues, dans l’ordre des noms de fichier.")}') : '${T("Aucune vue 360°.")}';
    if (b3) b3.innerHTML = VUE360.map(function(src, i){
      return '<img src="' + esc(src) + '" alt="" title="' + (i + 1) + '">'; }).join('');
    if (r3) r3.style.display = VUE360.length ? '' : 'none';
  }

  function choisirVideo(){
    var e = document.createElement('input');
    e.type = 'file'; e.accept = 'video/mp4,video/webm';
    e.onchange = function(){
      var f = e.files && e.files[0];
      if (!f) return;
      if (['video/mp4', 'video/webm'].indexOf(String(f.type || '').toLowerCase()) < 0) { dire('${T("Format refusé — MP4 ou WebM seulement.")}', 'err'); return; }
      if (f.size > MAX_VIDEO_MO * 1024 * 1024) {
        dire('${T("Vidéo trop lourde :")} ' + szOctets(f.size) + ' (${T("maximum 5,5 Mo — raccourcissez-la ou réduisez sa résolution")}).', 'err');
        return;
      }
      var l = new FileReader();
      l.onload = function(){ VIDEO = String(l.result || ''); VIDEO_OCTETS = f.size; dessinerMedias(); dire(''); majFicheBientot(); };
      l.onerror = function(){ dire('${T("Lecture de la vidéo impossible.")}', 'err'); };
      l.readAsDataURL(f);
    };
    e.click();
  }

  // ⚠ LES VUES SONT RÉDUITES ICI (1000 px, WebP) AVANT DE PASSER LE PONT : 36
  // photos d appareil de 5 Mo chacune feraient 180 Mo à traverser, pour une
  // image que la boutique montre en 600 px. Le site recompresse de toute façon.
  function reduireVue(src, fini){
    var im = new Image();
    im.onload = function(){
      var w = im.naturalWidth, h = im.naturalHeight;
      if (!w || !h) { fini(src); return; }
      var r = Math.min(1, 1000 / Math.max(w, h));
      var c = document.createElement('canvas');
      c.width = Math.round(w * r); c.height = Math.round(h * r);
      var o = '';
      try { c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); o = c.toDataURL('image/webp', 0.85); } catch (er) { o = ''; }
      fini((o && o.indexOf('data:image/webp') === 0 && o.length < src.length) ? o : src);
    };
    im.onerror = function(){ fini(''); };
    im.src = src;
  }
  function choisir360(){
    var e = document.createElement('input');
    e.type = 'file'; e.accept = 'image/*'; e.multiple = true;
    e.onchange = function(){
      // L ORDRE EST CELUI DES NOMS DE FICHIER (vue-01, vue-02… ou IMG_0001…),
      // en comparant les nombres comme des nombres : « vue-10 » vient après
      // « vue-9 », pas après « vue-1 ».
      var fs = Array.prototype.slice.call(e.files || []).sort(function(a, b){
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }); });
      if (!fs.length) return;
      if (fs.length < 8 || fs.length > 36) {
        dire('${T("La vue 360° demande de 8 à 36 images —")} ' + fs.length + ' ${T("choisie(s).")}', 'err');
        return;
      }
      var trop = fs.filter(function(f){ return f.size > MAX_MO * 1024 * 1024; });
      if (trop.length) { dire(trop.length + ' ${T("image(s) de plus de")} ' + szOctets(MAX_MO * 1048576) + ' — ${T("rien n’a été ajouté.")}', 'err'); return; }
      var lues = new Array(fs.length), reste = fs.length, rates = 0;
      dire('${T("Préparation des vues 360°…")}');
      fs.forEach(function(f, i){
        var l = new FileReader();
        var fin = function(r){
          if (r) lues[i] = r; else rates++;
          if (--reste === 0) {
            if (rates) { dire(rates + ' ${T("image(s) illisible(s) — rien n’a été ajouté.")}', 'err'); return; }
            VUE360 = lues; dessinerMedias(); dire(''); majFicheBientot();
          }
        };
        l.onload = function(){ reduireVue(String(l.result || ''), fin); };
        l.onerror = function(){ fin(''); };
        l.readAsDataURL(f);
      });
    };
    e.click();
  }

  function brancherMedias(){
    ['p-mq-prenom', 'p-mq-cm'].forEach(function(i){
      var e = document.getElementById(i); if (e) e.addEventListener('input', apercuMannequin);
    });
    var pr = document.getElementById('p-mq-prenom'); if (pr) pr.setAttribute('maxlength', '40');
    var s = document.getElementById('p-mq-taille');
    if (s) s.addEventListener('change', function(){ MQ_TAILLE = s.value; apercuMannequin(); });
    var a = document.getElementById('p-vid-choisir'); if (a) a.onclick = choisirVideo;
    var b = document.getElementById('p-vid-retirer');
    if (b) b.onclick = function(){ VIDEO = ''; VIDEO_OCTETS = 0; dessinerMedias(); };
    var c = document.getElementById('p-360-choisir'); if (c) c.onclick = choisir360;
    var d = document.getElementById('p-360-retirer');
    if (d) d.onclick = function(){ VUE360 = []; dessinerMedias(); };
  }

  function tailles(){
    return Array.prototype.filter.call(document.querySelectorAll('#p-tailles .jeton'), function(j){
      return j.classList.contains('on'); }).map(function(j){ return j.getAttribute('data-t'); });
  }
  function couleurs(){ return CHOIX.slice(); }

  // ⚠ LA CLE DE STOCK EST « taille-couleur », exactement comme dans le site. Une
  // autre convention aurait produit un stock que l inventaire ne sait pas lire :
  // invisible, et donc jamais commande.
  // ⚠ LES QUANTITES VIVENT DANS "STOCK", PAS DANS LES CHAMPS. La liste est
  // paginee et redessinee : lire les champs a l enregistrement n aurait rendu
  // que la page affichee, et le reste aurait ete perdu sans un mot.
  // ⚠ LE SEUIL A ZERO VEUT DIRE « NE JAMAIS ALERTER », c est la regle du projet
  // (cascade variante -> produit -> general). Le traiter comme un seuil ordinaire
  // aurait fait crier une alerte sur toutes les variantes vides d un produit dont
  // on a justement decide qu il ne devait pas en declencher.
  // ⚠ ET RIEN SUR UNE QUANTITE DE ZERO : une variante a zero sur une fiche neuve
  // n est pas « sous le seuil », elle n est pas encore approvisionnee. Avertir
  // partout a la creation, c est n avertir nulle part — on apprend a ne plus voir
  // le symbole.
  // ⚠ ATTEINDRE LE SEUIL SUFFIT — il n y a pas a le depasser. Le seuil est le
  // plancher a partir duquel on reappprovisionne : y etre, c est etre au minimum
  // voulu, pas en dessous. J exigeais une unite de plus, ce qui faisait persister
  // l avertissement sur une variante pourtant conforme.
  function alerteSeuil(q){
    var s = parseInt(val('p-seuil'), 10);
    if (!(s > 0) || !(q > 0) || q >= s) return '';
    return '<span class="al" title="${T("Sous le seuil d’alerte")} (' + s + '). '
      + '${T("Il en manque {n} pour l’atteindre.")}'.replace('{n}', s - q) + '"><span class="ic">⚠</span></span>';
  }

  function majStock(){
    var t = tailles(), c = couleurs();
    var lignes = [];
    t.forEach(function(ta){ c.forEach(function(co){
      lignes.push({ cle: ta + '-' + co, taille: ta, couleur: co, nom: ta + ' ' + co });
    }); });
    var zone = document.getElementById('p-zone');
    if (!PAGI) {
      PAGI = new Pagi(zone, {
        // ⚠ UN VRAI TABLEAU, avec ses en-tetes. Sans eux, on voyait quatre
        // colonnes sans savoir laquelle se saisit et laquelle se choisit — et la
        // quantite ressemblait a un identifiant.
        ligne: function(x){
          var q = STOCK[x.cle] || 0, lo = LOCS[x.cle] || '';
          // Une variante SANS emplacement alors qu elle porte du stock est
          // signalee des le dessin, pas seulement quand on y touche : une liste
          // paginee se rouvre a la page 2 et le rappel doit y etre deja.
          var manque = (q > 0 && CTX.entrepots.length && !lo);
          return '<div class="lgstk' + (q > 0 ? ' enstock' : '') + '">'
            + '<span class="c1">' + esc(x.taille) + '</span>'
            + '<span class="c2">' + esc(couleurLue(x.couleur)) + '</span>'
            + '<span class="c3"><input class="q" type="number" min="0" step="1" placeholder="0"'
      + ' aria-label="' + esc('${T("Quantité —")} ' + x.taille + ' / ' + couleurLue(x.couleur)) + '"'
            + ' data-cle="' + esc(x.cle) + '" value="' + esc(q) + '">' + alerteSeuil(q) + '</span>'
            + (CTX.entrepots.length
                ? '<span class="c4"><select class="loc' + (manque ? ' manque' : '') + '" data-cle="' + esc(x.cle) + '"'
                  + ' aria-label="' + esc('${T("Emplacement —")} ' + x.taille + ' / ' + couleurLue(x.couleur)) + '">'
                  + '<option value="">${T("Choisir l’emplacement")}</option>'
                  + CTX.entrepots.map(function(w){
                      return '<option value="' + esc(w.id) + '"' + (lo === w.id ? ' selected' : '') + '>' + esc(w.nom) + '</option>';
                    }).join('') + '</select></span>'
                : '')
            + '</div>';
        },
        surMaj: function(){
          var n = 0;
          Object.keys(STOCK).forEach(function(k){ n += STOCK[k] || 0; });
          var s = document.getElementById('p-somme');
          if (s) s.textContent = n + (n > 1 ? ' ${T("unités au total")}' : ' ${T("unité au total")}');
        }
      });
      PAGI.brancher();
      // ⚠ ON REPEINT LA LIGNE, ON NE REDESSINE PAS LA LISTE. Un redessin
      // remplacerait le champ pendant la frappe : le curseur repartirait au
      // debut et l on perdrait le deuxieme chiffre d une quantite a deux
      // chiffres. La ligne existe deja — on ne fait que changer son etat.
      var peindre = function(el, cle){
        if (!el) return;
        var q = STOCK[cle] || 0;
        el.classList.toggle('enstock', q > 0);
        var s = el.querySelector('.loc');
        if (s) s.classList.toggle('manque', q > 0 && !s.value);
        // L avertissement de seuil suit la frappe : on remplace le seul marqueur,
        // jamais la cellule — reecrire la cellule emporterait le champ en cours
        // de saisie et le curseur avec lui.
        var c3 = el.querySelector('.c3');
        if (c3) {
          var vieux = c3.querySelector('.al');
          if (vieux) vieux.remove();
          var neuf = alerteSeuil(q);
          if (neuf) c3.insertAdjacentHTML('beforeend', neuf);
        }
      };
      zone.querySelector('.liste').addEventListener('input', function(ev){
        var q = ev.target.closest('.q');
        if (q) {
          STOCK[q.dataset.cle] = parseInt(q.value, 10) || 0;
          peindre(q.closest('.lgstk'), q.dataset.cle);
          PAGI.surMaj();
          return;
        }
      });
      zone.querySelector('.liste').addEventListener('change', function(ev){
        var l = ev.target.closest('.loc');
        if (l) { LOCS[l.dataset.cle] = l.value; peindre(l.closest('.lgstk'), l.dataset.cle); }
      });
    }
    PAGI.tout = lignes;
    if (!lignes.length) {
      zone.querySelector('.liste').innerHTML =
        '<div class="aide">${T("Choisissez au moins une taille et une couleur à l’étape « Tailles et couleurs ».")}</div>';
      zone.querySelector('.pagi').innerHTML = '';
      return;
    }
    PAGI.dessiner();
  }

  function remplir(p){
    poser('p-nom', p.name); poser('p-cat', p.category); poser('p-sku', p.sku);
    poser('p-marque', p.brand); poser('p-desc', p.description);
    poser('p-genre', p.genre || ''); poser('p-age', p.ageGroup || '');
    poser('p-style', p.style || ''); poser('p-guide', p.sizeGuideId || '');
    poser('p-etiq', p.tag || ''); poser('p-fourn', p.supplierId || '');
    poser('p-ajust', (p.ajustement === 'petit' || p.ajustement === 'grand') ? p.ajustement : '');
    var _ent = (p.entretien && typeof p.entretien === 'object') ? p.entretien : {};
    ENT = new Set(Array.isArray(_ent.codes) ? _ent.codes.map(String) : []);
    poser('p-compo', _ent.composition || ''); poser('p-ent-autre', _ent.autre || '');
    poser('p-prix', p.price != null ? szArgentChamp(p.price) : '');
    poser('p-solde', p.salePrice != null ? szArgentChamp(p.salePrice) : '');
    poser('p-cout', p.acquisitionCost != null ? szArgentChamp(p.acquisitionCost) : '');
    // Le poids est conserve en KILOGRAMMES : on l affiche en grammes, l unite la
    // plus lisible pour un vetement.
    poser('p-poids', p.weight ? String(Math.round(p.weight * 1000 * 10) / 10) : '');
    poser('p-unite', 'g');
    poser('p-seuil', p.lowStock != null ? String(p.lowStock) : String(CTX.seuilDefaut));
    poser('p-limclient', (Number(p.buyMaxClient) >= 1) ? String(Math.floor(Number(p.buyMaxClient))) : '');
    document.getElementById('p-actif').checked = p.active !== false;
    // L acces anticipe (2026-10-07) : absent d une fiche ancienne = non marque.
    document.getElementById('p-anticipe').checked = !!p.accesAnticipe;
    var pdi = document.getElementById('p-direct'); if (pdi) pdi.checked = !!p.anticipeExclu && !p.accesAnticipe;
    poser('p-publie', /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(p.publieLe || '')) ? String(p.publieLe) : '');
    // ⚠ LES DEUX AXES SE LISENT SEPAREMENT, comme dans l editeur du site : la
    // liquidation et la vente finale sont des REGIMES, noReturn est la politique
    // de retour d un article par ailleurs normal. Les confondre ferait perdre
    // l un des deux a chaque ouverture.
    poser('p-regime', p.liquidation ? 'liq' : (p.finalSale ? 'final' : 'normal'));
    // ⚠ « aucun » est la VALEUR de l option, pas un texte affiché : la passer par
    // T() donnait « none » en anglais, aucune option ne correspondait, et
    // enregistrer remettait l article en « retours acceptés » (2026-10-25, audit).
    poser('p-retours', p.noReturn ? 'aucun' : 'ok');
    // Le régime impose « Aucun retour » et vide l étiquette : majRegime() a tourné
    // dans brancher(), AVANT que la fiche soit posée — on le rappelle ici, comme
    // la reprise du brouillon (2026-10-25, audit).
    majRegime();
    (p.sizes || []).forEach(function(t){
      var j = document.querySelector('#p-tailles .jeton[data-t="' + String(t).replace(/"/g, '') + '"]');
      if (j) j.classList.add('on');
    });
    CHOIX = (p.colors || []).map(String);
    dessinerJetons();
    STOCK = Object.assign({}, p.stock || {});
    STOCK0 = Object.assign({}, STOCK);   // (2026-10-19) ce que la fiche avait à l ouverture : on n envoie que ce qui a changé
    // ⚠ LE CHAMP DU PRODUIT EST warehouseLocations. Cette fenêtre lisait
    // « stockLoc », un nom qu'elle avait inventé : les emplacements existants
    // ne s'affichaient JAMAIS (tout restait à « Choisir l'emplacement »), et
    // ceux qu'on choisissait n'étaient jamais écrits — le pont traduit
    // désormais l'envoi (la fenêtre continue d'expédier « stockLoc » sur le
    // fil, c'est le contrat des coquilles déjà installées).
    LOCS = Object.assign({}, p.warehouseLocations || p.stockLoc || {});
    if (p.image) { IMAGE = p.image; montrerImage(IMAGE); }
    VUES = vuesDepuisFiche(p.additionalImages);
    // La photo du dos (mode simple) : retenue telle quelle ; photoDos() vérifie qu'elle est encore une des photos.
    DOS_SRC = (typeof p.photoDos === 'string' && p.photoDos) ? p.photoDos : '';
    FIBRE = (typeof p.photoFibre === 'string' && p.photoFibre) ? p.photoFibre : '';
    // ⚠ COPIE PROFONDE : chaque couleur porte son propre objet. Une copie de
    // surface les partagerait avec la fiche d origine, et retirer une photo ici
    // la retirerait aussi de la reference qui sert a detecter les conflits.
    PARCOUL = parcoulDepuisFiche(p.colorVariants);
    MESV = mvDepuisFiche(p.mesuresVetement);
    // Les médias : la taille portée attend que la liste des tailles soit posée,
    // elle est donc gardée de côté (MQ_TAILLE) et choisie au dessin.
    var mq = (p.mannequin && typeof p.mannequin === 'object') ? p.mannequin : {};
    poser('p-mq-prenom', mq.prenom || '');
    poser('p-mq-cm', mq.tailleCm ? String(mq.tailleCm) : '');
    MQ_TAILLE = String(mq.taillePortee || '');
    VIDEO = (typeof p.video === 'string') ? p.video : '';
    MOD3D = (typeof p.modele3d === 'string') ? p.modele3d : ''; MOD3D0 = MOD3D;
    VIDEO_OCTETS = 0;
    VUE360 = Array.isArray(p.vue360) ? p.vue360.filter(Boolean).map(String) : [];
    dessinerMedias();
    // Une génération en cours pour cette fiche (ici ou ailleurs) : ses étapes, et le verrou des photos.
    if (ID) suivre3d();
    // Des photos du Studio l attendent peut-être (étiquetées pour elle, ou déposées pendant qu elle était fermée).
    if (ID) proposerPrevues();
  }

  // ⚠ LA FICHE PEUT PORTER TROIS FORMES de photos supplémentaires : un TABLEAU
  // (la forme que le pont écrit depuis le 2026-08-08), des clés d’ANGLE
  // (l’éditeur du site), ou des clés libre1..5 (cette fenêtre, 1.15.0 à
  // 1.43.0). On traduit vers ce que le MODE de la catégorie attend — sans ça,
  // les photos existaient dans la fiche mais les cases restaient vides ici.
  // La catégorie est déjà posée quand remplir nous appelle.
  /* ══ LE MODE DES PHOTOS SUIT LA CATÉGORIE (2026-10-26, relecture) ══ Les Photos passent AVANT la catégorie : sur
     une fiche neuve, on dépose ses photos en mode « angles » (catégorie vide), puis la catégorie choisie peut être en
     mode « simple ». Sans cette bascule, les photos des clés d'angle n'étaient plus dessinées NULLE PART (ni voyables
     ni retirables) et partaient quand même à l'enregistrement. On les transporte d'un mode à l'autre, dos compris. */
  var MODE_PH = null;
  function suivreModePhotos(){
    var std = modeStandard();
    if (MODE_PH === null) { MODE_PH = std; return; }
    if (std === MODE_PH) return;
    var ANG = ['devant', 'coteG', 'coteD', 'autres'];
    if (std) {
      // angles → simple : les vues dans l'ordre, le dos à la suite, marqué
      var dos = VUES.derriere || '';
      var l = ANG.map(function(k){ return VUES[k]; }).filter(Boolean);
      if (dos) l.push(dos);
      VUES = {}; l.slice(0, MAX_PHOTOS).forEach(function(u, i){ VUES['libre' + (i + 1)] = u; });
      DOS_SRC = dos && l.slice(0, MAX_PHOTOS).indexOf(dos) >= 0 ? dos : '';
    } else {
      // simple → angles : le dos dans « Derrière », les autres dans les angles libres
      var d2 = photoDosStd();
      var libres = Object.keys(VUES).filter(function(k){ return k.indexOf('libre') === 0 && VUES[k]; })
        .sort(function(a, b){ return (parseInt(a.slice(5), 10) || 0) - (parseInt(b.slice(5), 10) || 0); })
        .map(function(k){ return VUES[k]; }).filter(function(u){ return u !== d2; });
      VUES = {}; if (d2) VUES.derriere = d2;
      ANG.forEach(function(k, i){ if (libres[i]) VUES[k] = libres[i]; });
      if (libres.length > ANG.length) dire('${T("Cette catégorie prend 4 vues en plus du dos : la photo en trop a été retirée.")}', 'att');
      DOS_SRC = '';
    }
    MODE_PH = std;
  }
  function photoDosStd(){ return (DOS_SRC && Object.keys(VUES).some(function(k){ return k.indexOf('libre') === 0 && VUES[k] === DOS_SRC; })) ? DOS_SRC : ''; }
  function vuesDepuisFiche(brut){
    var angles = ['devant', 'derriere', 'coteG', 'coteD', 'autres'];
    var liste = [];
    if (Array.isArray(brut)) {
      liste = brut.filter(Boolean);
    } else if (brut && typeof brut === 'object') {
      if (!modeStandard()) {
        // Mode angles : les clés d’angle se gardent telles quelles ; des clés
        // libres héritées s’ajoutent à la suite, dans les angles encore vides.
        var v = {};
        angles.forEach(function(k){ if (brut[k]) v[k] = brut[k]; });
        Object.keys(brut).filter(function(k){ return k.indexOf('libre') === 0 && brut[k]; })
          .sort(function(a, b){ return (parseInt(a.slice(5), 10) || 0) - (parseInt(b.slice(5), 10) || 0); })
          .forEach(function(k){
            for (var i = 0; i < angles.length; i++) {
              if (!v[angles[i]]) { v[angles[i]] = brut[k]; return; }
            }
          });
        return v;
      }
      // Mode standard : angles puis libres, dans l’ordre, vers libre1..N.
      liste = angles.map(function(k){ return brut[k]; }).filter(Boolean)
        .concat(Object.keys(brut).filter(function(k){ return k.indexOf('libre') === 0 && brut[k]; })
          .sort(function(a, b){ return (parseInt(a.slice(5), 10) || 0) - (parseInt(b.slice(5), 10) || 0); })
          .map(function(k){ return brut[k]; }));
    } else { return {}; }
    var res = {};
    if (modeStandard()) {
      liste.slice(0, MAX_PHOTOS).forEach(function(src, i){ res['libre' + (i + 1)] = src; });
    } else {
      liste.slice(0, angles.length).forEach(function(src, i){ res[angles[i]] = src; });
    }
    return res;
  }
  // « principale » était la clé de cette fenêtre ; la boutique lit « main ».
  function parcoulDepuisFiche(brut){
    var g = {};
    Object.keys(brut || {}).forEach(function(c){
      var v = Object.assign({}, brut[c] || {});
      if (v.principale && !v.main) v.main = v.principale;
      delete v.principale;
      g[c] = v;
    });
    return g;
  }

  function enKg(v, u){
    var n = parseFloat(v) || 0;
    if (u === 'kg') return n;
    if (u === 'lb') return n * 0.45359237;
    return n / 1000;
  }

  // ══ PLEIN ÉCRAN — RETIRÉ D'ICI (3.11.0) ═══════════════════════════════════
  // ⚠ SON BOUTON ÉCRIT À LA MAIN A ÉTÉ SUPPRIMÉ, ET CE N'EST PAS UNE PERTE :
  // l'installateur du socle (JS_FENPLEIN) le pose maintenant dans les 83
  // fenêtres, celle-ci comprise. Garder les deux, c'était deux mécanismes pour
  // un geste, et le nôtre était le moins bon : il ne se mettait à jour QUE sur
  // ses propres clics, donc il annonçait encore « Plein écran » après une sortie
  // par la touche du système. Mesuré : 9 verdicts sur 10, celui-là en échec.
  // Celui du socle observe la classe « sz-zoom-fen » et ne peut pas mentir.
  // ⚠ Il reste ici la seule chose qui soit propre à cette fenêtre : l'aperçu.
  /* ── APERCU BOUTIQUE ── Le SITE dessine (produit:apercu → Shop.renderProductCard
     et la vue page produit de _pfApercuHtml, avec ses regles vivantes) ; ici on
     ne fait que poser le document sur fond clair. Deux onglets, comme l editeur
     du site. La saisie part TELLE QUELLE : l apercu montre ce qu on est en
     train d ecrire, pas la fiche enregistree. */
  var APERCU_ONGLET = 'card';
  function saisieApercu(){
    return {
      name: val('p-nom').trim(), category: val('p-cat'),
      price: argentNombre(val('p-prix')) || 0, salePrice: argentNombre(val('p-solde')) || null,
      description: val('p-desc'), brand: val('p-marque'), tag: val('p-etiq'),
      active: coché('p-actif'), image: IMAGE || null,
      sizes: tailles(), colors: couleurs()
    };
  }
  function ouvrirApercu(){
    var v = document.createElement('div');
    v.className = 'voile';
    /* ══ L APERCU BOUTIQUE, REFAIT (2026-09-26) ══════════════════════════════
       Sa capture : « ameliore cela et retire le fond beige, c est affreux ».
       • Grille : la carte de la boutique (blanche, telle que la cliente la verra)
         se pose sur la SURFACE DE LA FENETRE, plus sur du beige ; les quatre
         chiffres prennent les tuiles de la refonte.
       • Page produit : c est une page ENTIERE de la boutique, ecrite en encre
         foncee — elle garde un fond, mais blanc et net.
       • Le titre dans la police de l ecran, les onglets en pastilles. */
    v.innerHTML = '<div class="boite ap" style="max-width:44rem">'
      + '<style>'
      + '.boite.ap h3{font-family:inherit;font-size:1.1rem;font-weight:800;color:var(--tx)}'
      + '.ap .ongs{display:flex;gap:.4rem;margin:.5rem 0 .75rem}'
      + '.ap .ongs button{height:2.3rem;padding:0 .9rem;border-radius:99px;border:1px solid var(--v10);'
      +   'background:var(--f-0f1826);color:var(--tx-gris2);font-size:.82rem;cursor:pointer}'
      + '.ap .ongs button.on{background:rgba(var(--or-rgb),.14);border-color:rgba(var(--or-rgb),.55);color:var(--tx-or2);font-weight:700}'
      + '#ap-zone{border:1px solid var(--v08);border-radius:12px;padding:1rem;max-height:64vh;overflow-y:auto;'
      +   'background:var(--f-0f1826);color:var(--tx)}'
      + '#ap-zone.page{background:#fff;color:#1a1a1a}'
      + '#ap-zone .pf-prev-card-bg,#ap-zone .pf-prev-detail-bg{background:transparent!important;padding:0;min-height:0}'
      + '#ap-zone .pf-prev-card-label{text-transform:none;letter-spacing:0;font-size:.8rem;font-weight:700;color:var(--tx2);margin:0 0 .6rem}'
      + '#ap-zone .pf-prev-card-wrap{max-width:280px;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.28)}'
      + '#ap-zone:not(.page) .pf-prev-stats{grid-template-columns:repeat(4,minmax(0,1fr));gap:.6rem;margin-top:1rem}'
      + '#ap-zone:not(.page) .pf-stat{background:var(--f-carte);border:1px solid var(--v07);border-radius:13px;padding:.7rem .85rem;'
      +   'flex-direction:column-reverse;gap:.15rem;color:var(--tx)}'
      + '#ap-zone:not(.page) .pf-stat span{font-size:1.15rem;font-weight:800}'
      + '#ap-zone:not(.page) .pf-stat small{font-size:.76rem;font-weight:600;color:var(--tx2)}'
      /* Les couleurs de reussite et d erreur que le site pose en ligne (ses
         variables c-success et c-error) n existent pas dans cette fenetre : on
         les ramene aux siennes. */
      + '#ap-zone:not(.page) .pf-stat span[style*="c-success"]{color:var(--tx-ok)!important}'
      + '#ap-zone:not(.page) .pf-stat span[style*="c-error"]{color:var(--tx-err)!important}'
      + '</style>'
      + '<h3><span class="ic">👁</span> ${T("Aperçu boutique")}</h3>'
      + '<div class="ongs">'
      + '<button type="button" id="ap-card">${T("Grille boutique")}</button>'
      + '<button type="button" id="ap-detail">${T("Page produit")}</button></div>'
      + '<div id="ap-zone"></div>'
      + '<div class="pied2"><button type="button" id="ap-non">${T("Fermer")}</button></div></div>';
    document.body.appendChild(v);
    function peindre(){
      var c = document.getElementById('ap-card'), d = document.getElementById('ap-detail');
      if (c) c.className = APERCU_ONGLET === 'card' ? 'on' : '';
      if (d) d.className = APERCU_ONGLET === 'detail' ? 'on' : '';
      var z0 = document.getElementById('ap-zone');
      if (z0) z0.className = APERCU_ONGLET === 'detail' ? 'page' : '';
    }
    function chargerApercu(){
      var z = document.getElementById('ap-zone');
      if (z) z.innerHTML = '<div style="padding:2rem;text-align:center;opacity:.7">${T("Chargement…")}</div>';
      P.appeler('produit:apercu', saisieApercu(), APERCU_ONGLET).then(function(r){
        var z2 = document.getElementById('ap-zone');
        if (!z2) return;
        if (!r || !r.ok) {
          z2.innerHTML = '<div style="padding:1.5rem;text-align:center;color:#b91c1c">' + esc(expliquer(r)) + '</div>';
          return;
        }
        z2.innerHTML = '<style>' + (r.css || '') + '</style>' + (r.html || '');
      });
    }
    document.getElementById('ap-card').onclick = function(){ APERCU_ONGLET = 'card'; peindre(); chargerApercu(); };
    document.getElementById('ap-detail').onclick = function(){ APERCU_ONGLET = 'detail'; peindre(); chargerApercu(); };
    document.getElementById('ap-non').onclick = function(){ v.remove(); };
    peindre();
    chargerApercu();
  }

  /* ── DETOURAGE ── Le SITE fait le travail (produit:detourer : retrait local
     du fond au canevas + decor compose), et il CACHE la transparente : changer
     de decor est instantane. Le resultat ne REMPLACE la photo principale que
     sur << Utiliser cette photo >> — jamais a l aveugle. */
  var FOND_CHOISI = 'studio';
  function ouvrirDetourage(){
    if (!IMAGE) return;
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite" style="max-width:32rem">'
      + '<h3><span class="ic">✂</span> ${T("Détourer et changer le décor")}</h3>'
      + '<div class="fonds" id="dt-fonds"></div>'
      + '<div id="dt-zone" style="background:var(--f-0f1826);border-radius:10px;min-height:14rem;'
      + 'display:flex;align-items:center;justify-content:center;overflow:hidden"></div>'
      + '<div class="pied2"><button type="button" id="dt-non">${T("Annuler")}</button>'
      + '<button type="button" class="prim" id="dt-oui" disabled>${T("✓ Utiliser cette photo")}</button></div></div>';
    document.body.appendChild(v);
    var RESULTAT = '';
    function zone(html){ var z = document.getElementById('dt-zone'); if (z) z.innerHTML = html; }
    function lancer(){
      zone('<div style="padding:2rem;text-align:center;color:var(--tx2)">${T("Détourage…")}</div>');
      var oui = document.getElementById('dt-oui');
      if (oui) oui.disabled = true;
      P.appeler('produit:detourer', IMAGE, FOND_CHOISI).then(function(r){
        if (!r || !r.ok) {
          zone('<div style="padding:1.5rem;text-align:center;color:var(--tx-err)">'
            + esc((r && r.detail) || expliquer(r)) + '</div>');
          return;
        }
        RESULTAT = r.image || '';
        zone('<img src="' + esc(RESULTAT) + '" style="max-width:100%;max-height:20rem;object-fit:contain" alt="">');
        var oui2 = document.getElementById('dt-oui');
        if (oui2) oui2.disabled = !RESULTAT;
      });
    }
    function peindreFonds(fonds){
      var z = document.getElementById('dt-fonds');
      if (!z) return;
      z.innerHTML = fonds.map(function(f){
        return '<button type="button" data-fond="' + esc(f.cle) + '"'
          + (f.cle === FOND_CHOISI ? ' class="on"' : '') + '>'
          + '<span class="past" style="background:' + esc(f.couleur) + '"></span>'
          + esc(f.libelle) + '</button>'; }).join('');
      z.onclick = function(ev){
        var b = ev.target && ev.target.closest ? ev.target.closest('[data-fond]') : null;
        if (!b) return;
        FOND_CHOISI = b.getAttribute('data-fond');
        peindreFonds(fonds);
        lancer();
      };
    }
    P.appeler('produit:fonds').then(function(r){
      if (!r || !r.ok) { zone('<div style="padding:1.5rem;text-align:center;color:var(--tx-err)">' + esc(expliquer(r)) + '</div>'); return; }
      peindreFonds(r.fonds || []);
      lancer();
    });
    document.getElementById('dt-non').onclick = function(){ v.remove(); };
    document.getElementById('dt-oui').onclick = function(){
      if (!RESULTAT) return;
      IMAGE = RESULTAT;
      montrerImage(IMAGE); majIa();
      v.remove();
      dire('${T("Photo principale remplacée par la version détourée.")}', 'bon');
    };
  }

  /* ── LE GROS PLAN SUR LA FIBRE (2026-10-17) ── Sa demande : « à partir de la photo
     principale, une photo en GROS PLAN sur la FIBRE, ajoutée aux photos du produit ».
     Le SITE trouve la zone de tissu (produit:grosPlanZone : dans le vêtement, loin des
     coutures, boutons, imprimés — gratuit), puis fabrique le gros plan (produit:grosPlan :
     recadré, agrandi ×4 par Real-ESRGAN chez fal.ai, FIDÈLE à la matière ; ou recadré
     seulement, sans IA). Un clic sur la photo déplace la zone. Rien ne s ajoute aux photos
     sans « Ajouter aux photos », et rien ne s enregistre avant la fiche. */
  function ouvrirGrosPlan(){
    if (!IMAGE) return;
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite" style="max-width:46rem">'
      + '<h3><span class="ic">🔍</span> ${T("Gros plan sur la fibre")}</h3>'
      + '<div class="gp-deux"><div><div class="gp-photo" id="gp-photo"><img id="gp-img" src="' + esc(IMAGE) + '" alt=""><div class="gp-cadre" id="gp-cadre" style="display:none"></div></div>'
      + '<div class="gp-lgd">${T("Photo principale")}</div></div>'
      + '<div><div class="gp-res" id="gp-res">${T("Recherche de la zone de tissu…")}</div><div class="gp-lgd" id="gp-lgd">${T("Aperçu du recadrage")}</div></div></div>'
      // (2026-10-17, sa remarque : « l agrandissement n est pas de haute qualité… que l on voie les mailles ») : le rendu PRO
      // refait une macro du même tissu ; l agrandissement fidèle et le simple recadrage restent au choix
      + '<div class="gp-modes" role="radiogroup" aria-label="${T("Qualité du gros plan")}">'
      + '<label class="gp-ia"><input type="radio" name="gp-mode" value="pro" checked> ${T("Rendu professionnel par l’IA : une macro du même tissu, mailles et fibres visibles (reconstituée par FLUX) · environ 0,04 $ US")}</label>'
      + '<label class="gp-ia"><input type="radio" name="gp-mode" value="fidele"> ${T("Agrandir avec l’IA (Real-ESRGAN : fidèle à la matière, n’invente pas de tissage) · environ 0,005 $ US")}</label>'
      + '<label class="gp-ia"><input type="radio" name="gp-mode" value="non"> ${T("Recadrer seulement, sans IA")}</label></div>'
      + '<div class="pied2"><button type="button" id="gp-non">${T("Annuler")}</button>'
      + '<button type="button" id="gp-lancer" disabled>${T("Fabriquer le gros plan")}</button>'
      + '<button type="button" class="prim" id="gp-oui" disabled>${T("✓ Ajouter aux photos")}</button></div></div>';
    document.body.appendChild(v);
    var ZONE = null, SRC = null, RESULTAT = '', OCC = false;
    // les montants AFFICHÉS ci-dessus, envoyés avec la demande : le relais les vérifie avant tout appel (contrôle des coûts)
    var PRIX_GP = { pro: 0.04, fidele: 0.005 };
    function el(id){ return document.getElementById(id); }
    function peindreZone(){
      var c = el('gp-cadre'), r = el('gp-res'); if (!c || !ZONE || !SRC) return;
      c.style.display = 'block';
      c.style.left = (ZONE.x / SRC.l * 100) + '%'; c.style.top = (ZONE.y / SRC.h * 100) + '%';
      c.style.width = (ZONE.c / SRC.l * 100) + '%'; c.style.height = (ZONE.c / SRC.h * 100) + '%';
      // l aperçu du recadrage : la photo en fond, agrandie et décalée (pas de canevas : une photo R2 le « teinterait »)
      if (!RESULTAT && r) r.innerHTML = '<div class="vu" style="background-image:url(&quot;' + esc(IMAGE) + '&quot;);background-size:' + (SRC.l / ZONE.c * 100) + '% ' + (SRC.h / ZONE.c * 100) + '%;background-position:'
        + (SRC.l === ZONE.c ? 0 : ZONE.x / (SRC.l - ZONE.c) * 100) + '% ' + (SRC.h === ZONE.c ? 0 : ZONE.y / (SRC.h - ZONE.c) * 100) + '%"></div>';
    }
    P.appeler('produit:grosPlanZone', IMAGE).then(function(r){
      if (!r || !r.ok) {
        el('gp-res').innerHTML = '<div style="padding:1rem;color:var(--tx-err)">' + esc(r && r.motif === 'zone_introuvable'
          ? '${T("Aucune zone de tissu assez grande et unie dans cette photo. Cliquez la photo pour choisir la zone vous-même.")}' : expliquer(r)) + '</div>';
        var im = el('gp-img');
        SRC = { l: (im && im.naturalWidth) || 1000, h: (im && im.naturalHeight) || 1000 };
        el('gp-lancer').disabled = true;
        return;
      }
      ZONE = r.zone; SRC = r.source; peindreZone(); el('gp-lancer').disabled = false;
    });
    el('gp-photo').onclick = function(ev){
      if (OCC) return;
      var im = el('gp-img'); if (!im) return;
      if (!SRC) SRC = { l: im.naturalWidth || 1000, h: im.naturalHeight || 1000 };
      var b = im.getBoundingClientRect(), fx = (ev.clientX - b.left) / b.width, fy = (ev.clientY - b.top) / b.height;
      var c = ZONE ? ZONE.c : Math.round(Math.min(SRC.l, SRC.h) * 0.2);
      ZONE = { c: c, x: Math.round(Math.max(0, Math.min(SRC.l - c, fx * SRC.l - c / 2))), y: Math.round(Math.max(0, Math.min(SRC.h - c, fy * SRC.h - c / 2))) };
      RESULTAT = ''; el('gp-oui').disabled = true; el('gp-lancer').disabled = false;
      el('gp-lgd').textContent = '${T("Aperçu du recadrage")}';
      peindreZone();
    };
    el('gp-lancer').onclick = function(){
      if (OCC || !ZONE) return;
      OCC = true; el('gp-lancer').disabled = true;
      var mc = v.querySelector('input[name="gp-mode"]:checked'), mode = mc ? mc.value : 'pro', ia = mode === 'pro' ? 'pro' : mode === 'fidele';
      el('gp-res').innerHTML = mode === 'pro' ? '${T("Rendu professionnel par l’IA… (environ 20 s)")}' : ia ? '${T("Agrandissement par l’IA…")}' : '${T("Recadrage…")}';
      P.appeler('produit:grosPlan', IMAGE, ZONE, ia, cleCouts(), ia ? PRIX_GP[mode] : null).then(function(r){
        OCC = false; el('gp-lancer').disabled = false;
        if (r && r.motif === 'prix_change' && r.prixReel != null) {
          var avant = PRIX_GP[mode]; PRIX_GP[mode] = Number(r.prixReel);
          var fmt = function(n){ return szArgentSymbole(szArgentNombre(Number(n), n < 0.01 ? 3 : 2)); };
          el('gp-res').innerHTML = '<div style="padding:1rem;color:var(--tx-att)">' + esc('${T("Le prix a changé : {0} au lieu de {1}. Rien n’a été lancé — cliquez de nouveau sur « Fabriquer le gros plan » pour le lancer à ce prix.")}'.split('{0}').join(fmt(r.prixReel)).split('{1}').join(fmt(avant))) + '</div>';
          return;
        }
        if (!r || !r.ok) { el('gp-res').innerHTML = '<div style="padding:1rem;color:var(--tx-err)">' + esc((r && r.detail) || expliquer(r)) + '</div>'; return; }
        RESULTAT = r.image || '';
        el('gp-res').innerHTML = '<img src="' + esc(RESULTAT) + '" alt="">';
        el('gp-lgd').textContent = r.pro ? '${T("Macro professionnelle reconstituée par l’IA (1200 × 1200 px)")}' : r.agrandi ? '${T("Gros plan agrandi ×4 par l’IA (1200 × 1200 px)")}' : '${T("Gros plan recadré, sans IA (1200 × 1200 px)")}';
        el('gp-oui').disabled = !RESULTAT;
        if (r.agrandi) chargerCouts();
      });
    };
    el('gp-non').onclick = function(){ v.remove(); };
    el('gp-oui').onclick = function(){
      if (!RESULTAT) return;
      // ⚠ caseLibre() connaît les DEUX modes (2026-10-25, audit) : en mode
      // « angles », une clé libreN n était dessinée par aucune case — le gros plan
      // était « ajouté » sans que personne puisse le voir ni le retirer.
      var k = caseLibre();
      if (!k) { dire('${T("Les photos supplémentaires sont toutes prises : retirez-en une, puis recommencez.")}', 'att'); return; }
      VUES[k] = RESULTAT; dessinerVues();
      v.remove();
      dire('${T("Gros plan ajouté aux photos du produit. Il sera enregistré avec la fiche.")}', 'bon');
    };
  }

  /* ── VARIANTES PAR COULEUR ── ⚠ PAS FAL.AI : le site TEINTE au canevas, en
     local, sans clé ni crédit (produit:teinter — la même mécanique que « Tout
     générer » de l’éditeur du site). La boucle vit ICI : une image et une
     couleur par appel, le canal du pont porte les images une à la fois. La
     1ʳᵉ couleur est sautée (ses photos SONT celles du produit), une couleur
     sans teinte attribuée est sautée EN LE DISANT. Et comme l’éditeur du
     site, tout se REGÉNÈRE à l’enregistrement en mode auto. */
  var GEN_ENCOURS = false;
  /* ⚠ LA PHOTO PRINCIPALE SEULEMENT (2026-10-09) : les photos supplémentaires ne changent plus
     de couleur — elles restent celles du produit, quelle que soit la couleur choisie. Teinter
     chaque vue coûtait du temps pour des images que la boutique n’affiche plus. */
  function slotsSources(){
    var l = [];
    if (IMAGE) l.push({ cle: 'main', src: IMAGE });
    return l;
  }
  // seulementVides (à l’enregistrement) : une photo déposée ou déjà générée n’est pas refaite.
  function genererVariantes(fini, seulementVides){
    if (GEN_ENCOURS) { if (fini) fini(); return; }
    var cibles = couleurs().slice(1).filter(function(c){ return !seulementVides || !(PARCOUL[c] && PARCOUL[c].main); });
    var slots = slotsSources();
    if (!cibles.length || !slots.length) { if (fini) fini(); return; }
    GEN_ENCOURS = true;
    var b = document.getElementById('p-cv-gen');
    if (b) { b.disabled = true; b.textContent = '${T("⏳ Génération…")}'; }
    var total = cibles.length * slots.length, fait = 0;
    var sautees = [], iC = 0, iS = 0, arret = '';
    function conclure(){
      GEN_ENCOURS = false;
      if (b) { b.disabled = false; b.textContent = '${T("Tout générer")}'; }
      dessinerVues();
      if (arret) { dire('${T("Variantes de couleur :")} ' + arret, 'err'); }
      else {
        dire('${T("Variantes de couleur générées")}'
          + (sautees.length ? ' ${T("— sans teinte attribuée pour :")} ' + sautees.join(', ')
            + ' ${T("(Inventaire → Références)")}' : '') + '.', sautees.length ? 'att' : 'bon');
      }
      if (fini) fini(arret || null);
    }
    function suivant(){
      if (iC >= cibles.length) { conclure(); return; }
      if (iS >= slots.length) { iC++; iS = 0; suivant(); return; }
      var coul = cibles[iC], slot = slots[iS];
      fait++;
      dire('${T("Variantes de couleur :")} ' + coul + ' (' + fait + '/' + total + ')…');
      P.appeler('produit:teinter', slot.src, coul).then(function(r){
        if (!r || !r.ok) {
          if (r && r.motif === 'couleur_non_mappee') {
            // Inutile d’essayer les autres vues de cette couleur.
            if (sautees.indexOf(coul) < 0) sautees.push(coul);
            iC++; iS = 0; suivant(); return;
          }
          if (r && (r.motif === 'operation_inconnue' || r.motif === 'session' || r.motif === 'droit')) {
            // Un refus qui frappera CHAQUE appel : on s’arrête au premier au
            // lieu de le collectionner N fois.
            arret = expliquer(r); conclure(); return;
          }
          // Échec d’une seule image : on continue, la photo principale de la
          // couleur peut réussir même si une vue échoue.
          iS++; suivant(); return;
        }
        PARCOUL[coul] = PARCOUL[coul] || {};
        PARCOUL[coul][slot.cle] = r.image;
        delete PARCOUL[coul].principale;
        iS++; suivant();
      });
    }
    suivant();
  }

  function brancherApercu(){
    var ba = document.getElementById('btn-apercu');
    if (ba) ba.onclick = ouvrirApercu;
  }

  // ══ JOURNAL DES MODIFICATIONS ═════════════════════════════════════════════
  // Reprise du « Résumé des changements » de l'éditeur du site : les mêmes champs
  // suivis, dans le même ordre, avec les mêmes mises en forme.
  // ⚠ DEUX PARTIES DE NATURES DIFFÉRENTES, et il faut les garder distinctes :
  //   — NON ENREGISTRÉES : écart entre l'état courant et celui pris à l'ouverture.
  //     Purement local, aucune question au serveur.
  //   — ENREGISTRÉES depuis moins de 24 h : c'est la BASE qui décide de la
  //     fenêtre de 24 h (colonne summary_until), pas l'horloge de ce poste. Un
  //     cache vidé ou une horloge décalée ne doivent pas changer ce qui est récent.
  var BASE = null;      // instantané pris à l'ouverture (modification seulement)
  var RECENT = null;    // { etat: 'attente'|'pret'|'erreur', entrees, motif }
  var OUVERT = {};      // horodatages dont l'auteur est révélé
  var JRN_T = null;

  function libCat(c){
    var x = (CTX.categories || []).find(function(y){ return y.cle === c; });
    return (x && x.libelle) || c || '';
  }
  function libEtiq(t){
    if (!t) return '';
    var x = (CTX.etiquettes || []).find(function(y){ return y.cle === t; });
    return (x && x.libelle) || String(t).replace(/^lbl:/, '');
  }
  /* ⚠⚠ szArgentChamp ET NON szArgent — LA DIFFERENCE EST LE GROUPEMENT DES
     MILLIERS. Ces montants-la sont RELUS : argentNombre retire tout ce qui n est
     pas un chiffre puis remplace la virgule par un point. Sur << $1,234.50 >> ca
     donnerait << 1.234.50 >>, donc 1,234 $ — un prix divise par mille, sans
     message d erreur. La forme sans groupement se relit dans les deux langues. */
  function argentTxt(v){
    var n = argentNombre(v);
    return (n === null) ? '' : szArgentChamp(n);
  }
  // ⚠ LA MÊME LISTE QUE _PF_CHG_FIELDS DE L'ÉDITEUR DU SITE, VOLONTAIREMENT.
  // Le site n'y résout PAS les libellés du genre, du groupe d'âge, du style ni du
  // guide des tailles : il affiche la valeur brute. Je le reproduis tel quel — si
  // cet écran montrait « Chic décontracté » là où l'éditeur web montre
  // « chic_decontracte », les deux écrans ne diraient plus la même chose de la
  // même modification. À corriger DES DEUX CÔTÉS, pas d'un seul.
  var SUIVIS = [
    { c: 'nom',      l: '${T("Nom")}' },
    { c: 'cat',      l: '${T("Catégorie")}',            f: libCat },
    { c: 'marque',   l: '${T("Marque")}' },
    { c: 'etiq',     l: '${T("Étiquette")}',            f: libEtiq },
    { c: 'actif',    l: '${T("Visible en boutique")}',  f: function(x){ return x === '1' ? '${T("Oui")}' : '${T("Non")}'; } },
    { c: 'prix',     l: '${T("Prix régulier")}',        f: argentTxt },
    { c: 'solde',    l: '${T("Prix soldé")}',           f: argentTxt },
    { c: 'cout',     l: '${T("Coût d’acquisition")}',   f: argentTxt },
    { c: 'genre',    l: '${T("Genre")}' },
    { c: 'age',      l: '${T("Groupe d’âge")}' },
    { c: 'style',    l: '${T("Style")}' },
    { c: 'guide',    l: '${T("Guide des tailles")}' },
    { c: 'desc',     l: '${T("Description")}' },
    { c: 'tailles',  l: '${T("Tailles")}',   f: function(x){ return String(x).split(',').filter(Boolean).join(', '); } },
    { c: 'couleurs', l: '${T("Couleurs")}',  f: function(x){ return String(x).split(',').filter(Boolean).join(', '); } }
  ];
  function instantane(){
    return {
      nom: val('p-nom').trim(), cat: val('p-cat'), marque: val('p-marque').trim(),
      etiq: val('p-etiq'), actif: coché('p-actif') ? '1' : '0',
      prix: val('p-prix'), solde: val('p-solde'), cout: val('p-cout'),
      genre: val('p-genre'), age: val('p-age'), style: val('p-style'),
      guide: val('p-guide'), desc: val('p-desc').trim(),
      tailles: tailles().join(','), couleurs: couleurs().join(',')
    };
  }
  function enAttente(){
    if (!BASE) return [];
    var m = instantane(), l = [];
    SUIVIS.forEach(function(s){
      var a = BASE[s.c] == null ? '' : BASE[s.c];
      var b = m[s.c] == null ? '' : m[s.c];
      if (String(a) === String(b)) return;
      l.push({ l: s.l, av: (s.f ? s.f(a) : a) || '—', ap: (s.f ? s.f(b) : b) || '—' });
    });
    return l;
  }
  // Reprise de _pfAgo : « à l’instant », « il y a 12 min », « il y a 3 h 20 min ».
  function ilYa(ts){
    var m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (m < 1) return '${T("à l’instant")}';
    if (m < 60) return '${T("il y a {m} min")}'.replace('{m}', m);
    var h = Math.floor(m / 60);
    return (m % 60 ? '${T("il y a {h} h {m} min")}' : '${T("il y a {h} h")}').replace('{h}', h).replace('{m}', m % 60);
  }
  function dateLongue(ts){
    try { return new Date(ts).toLocaleString('${LIEU()}', { dateStyle: 'long', timeStyle: 'short' }); }
    catch (e) { return String(ts); }
  }
  function dateCourte(ts){
    try { return new Date(ts).toLocaleString('${LIEU()}', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (e) { return String(ts); }
  }

  function chargerRecent(){
    if (!ID) return;
    RECENT = { etat: 'attente', entrees: (RECENT && RECENT.entrees) || [], motif: '' };
    P.appeler('produit:changements', ID).then(function(r){
      if (!r || !r.ok) {
        RECENT = { etat: 'erreur', entrees: [], motif: expliquer(r) };
      } else {
        RECENT = { etat: 'pret', entrees: r.entrees || [], motif: '' };
      }
      majPastille();
      if (document.getElementById('jrn-corps')) dessinerJournal();
    });
  }
  /* L ÉTAT DES ÉTAPES ET LES SECTIONS MODIFIÉES (2026-10-20, sa demande : « enregistre le statut dans le produit
     si c est rempli : à la réouverture, ça devrait rester complété, sauf si on retire les obligatoires ; et si une
     section se fait mettre à jour, un petit signe dans l onglet, temporairement »).
     · Une fiche ENREGISTRÉE a été remplie : toutes ses étapes comptent comme vues ; le crochet vert ne tombe que si
       une étape cesse d être complète (un obligatoire vidé).
     · Une section touchée depuis l ouverture porte un point or dans son onglet jusqu à l enregistrement : une saisie
       dans l étape, ou ses photos, mesures ou consignes qui diffèrent de l ouverture. */
  var MODIF = {}, SIG0 = null;
  function etapeSigs(){
    return { 0: (IMAGE || '') + '|' + JSON.stringify(VUES || {}) + '|' + (DOS_SRC || '') + '|' + (FIBRE || ''), 4: JSON.stringify(MESV || {}),
      5: JSON.stringify(entPourEnvoi()) };
  }
  function etapesSuivre(){
    for (var k = 0; k < (Assist.etapes || []).length; k++) Assist.vus[k] = true;
    SIG0 = etapeSigs(); MODIF = {};
    var corps = document.getElementById('corps');
    var noter = function(ev){
      var e = ev.target && ev.target.closest && ev.target.closest('.etape'); if (!e) return;
      var k = Array.prototype.indexOf.call(document.querySelectorAll('.etape'), e);
      if (k >= 0 && !MODIF[k]) { MODIF[k] = 1; Assist.fil(); }
    };
    corps.addEventListener('input', noter); corps.addEventListener('change', noter);
    var filOrig = Assist.fil;
    Assist.fil = function(){ filOrig.apply(this, arguments); marquerModifs(); };
    Assist.fil();
  }
  function marquerModifs(){
    if (!SIG0) return;
    var sig = etapeSigs();
    document.querySelectorAll('#pas [data-etape]').forEach(function(b){
      var k = +b.getAttribute('data-etape');
      var m = !!MODIF[k] || (sig[k] != null && sig[k] !== SIG0[k]);
      b.classList.toggle('modif', m);
      b.removeAttribute('title');
    });
  }
  function majPastille(){
    var b = document.getElementById('btn-jrn'), n = document.getElementById('jrn-n');
    if (!b || !n) return;
    if (!ID) { b.style.display = 'none'; return; }
    b.style.display = '';
    var enr = 0;
    if (RECENT && RECENT.etat === 'pret') {
      (RECENT.entrees || []).forEach(function(e){ enr += (e.changements || []).length; });
    }
    n.textContent = String(enAttente().length + enr);
  }

  function dif(av, ap){
    return '<div class="dif"><span class="av">' + esc(av) + '</span>'
      + '<span class="fl">→</span><span class="ap">' + esc(ap) + '</span></div>';
  }
  function sec(t){ return '<div class="sec"><span class="t">' + esc(t) + '</span><span class="tr"></span></div>'; }

  function dessinerJournal(){
    var z = document.getElementById('jrn-corps');
    if (!z) return;
    var att = enAttente();
    var h = '';
    if (att.length) {
      h += sec('${T("Non enregistrées")}')
        + att.map(function(r){
            return '<div class="bl"><div class="et">' + esc(r.l) + '</div>' + dif(r.av, r.ap) + '</div>';
          }).join('');
    }
    if (RECENT && RECENT.etat === 'attente' && !(RECENT.entrees || []).length) {
      h += '<div class="fin">${T("Lecture des modifications enregistrées…")}</div>';
    } else if (RECENT && RECENT.etat === 'erreur') {
      // ⚠ « INDISPONIBLE » N EST PAS « AUCUNE MODIFICATION ». Afficher une fiche
      // vierge sur une panne de réseau ferait croire qu’elle n’a jamais été
      // touchée — exactement l’inverse de ce qu’un journal doit garantir.
      h += '<div class="fin" style="color:var(--tx-att)">${T("Modifications enregistrées indisponibles (")}'
        + esc(RECENT.motif) + ') — <span class="lien" id="jrn-retry">${T("réessayer")}</span>.</div>';
    } else if (RECENT && (RECENT.entrees || []).length) {
      h += sec('${T("Enregistrées — dernières 24 h")}')
        + RECENT.entrees.map(function(e){
            var k = String(e.ts), vu = !!OUVERT[k];
            return '<div class="bl cliq" data-qui="' + esc(k) + '" title="${T("Cliquer pour voir qui a fait cette modification")}">'
              + '<div class="qd"><span title="' + esc(dateCourte(e.ts)) + '">' + esc(ilYa(e.ts)) + '</span>'
              + '<span style="opacity:.7">' + (vu ? '▴' : '▾') + '</span></div>'
              + (e.changements || []).map(function(c){
                  return '<div style="margin-bottom:.3rem"><div class="et">' + esc(c.libelle) + '</div>'
                    + dif(c.avant || '—', c.apres || '—') + '</div>';
                }).join('')
              + (vu ? '<div class="qui"><span class="ic">👤</span> <strong style="color:var(--tx)">'
                  + esc(e.par || '${T("Auteur non enregistré")}') + '</strong><br><span class="ic">🕘</span> '
                  + esc(dateLongue(e.ts)) + '</div>' : '')
              + '</div>';
          }).join('')
        + '<div class="fin">${T("Après 24 h, ces modifications ne s’affichent plus ici — elles restent")} '
        + '${T("consultables dans ")}<span class="lien" id="jrn-tout"><span class="ic">🕘</span> ${T("tout l’historique")}</span>.</div>';
    } else if (RECENT && RECENT.etat === 'pret' && !att.length) {
      h += '<div class="fin">${T("Aucune modification depuis l’ouverture, et aucune enregistrée")} '
        + '${T("dans les dernières 24 h. ")}<span class="lien" id="jrn-tout"><span class="ic">🕘</span> ${T("Tout l’historique")}</span></div>';
    }
    if (!h) h = '<div class="fin">${T("Aucune modification.")}</div>';
    z.innerHTML = h;
  }

  function ouvrirJournal(){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite" style="max-width:640px">'
      + '<h3 style="color:var(--tx-creme)"><span class="ic">🕘</span> ${T("Modifications de cette fiche")}</h3>'
      + '<div class="jrn" id="jrn-corps"></div>'
      + '<div class="pied2"><button type="button" id="jrn-non">${T("Fermer")}</button></div></div>';
    document.body.appendChild(v);
    dessinerJournal();
    document.getElementById('jrn-non').onclick = function(){ v.remove(); };
    v.addEventListener('click', function(ev){
      if (ev.target === v) return;   // le voile ne ferme plus (2026-10-07) : seulement Fermer
      if (ev.target.closest('#jrn-retry')) { chargerRecent(); dessinerJournal(); return; }
      if (ev.target.closest('#jrn-tout')) { v.remove(); ouvrirHistorique(); return; }
      // L'auteur n'est PAS montré d'office : on le révèle au clic sur le bloc
      // concerné, comme dans l'éditeur du site. L'état ouvert survit aux redessins.
      var b = ev.target.closest('[data-qui]');
      if (b) {
        var k = b.getAttribute('data-qui');
        OUVERT[k] = !OUVERT[k];
        dessinerJournal();
      }
    });
  }

  // L'historique COMPLET, groupé par année — le pendant de _pfShowHistory.
  function ouvrirHistorique(){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite" style="max-width:640px">'
      + '<h3 style="color:var(--tx-creme)"><span class="ic">🕘</span> ${T("Historique complet")}</h3>'
      + '<div class="jrn" id="hist-corps"><div class="fin">${T("Lecture…")}</div></div>'
      + '<div class="pied2"><button type="button" id="hist-non">${T("Fermer")}</button></div></div>';
    document.body.appendChild(v);
    document.getElementById('hist-non').onclick = function(){ v.remove(); };
    P.appeler('produit:historique', ID).then(function(r){
      var z = document.getElementById('hist-corps');
      if (!z) return;
      if (!r || !r.ok) {
        z.innerHTML = '<div class="fin" style="color:var(--tx-att)">${T("Historique indisponible :")} '
          + esc(expliquer(r)) + '${T(".<br>Rien n’est perdu — réessayez une fois reconnecté.")}</div>';
        return;
      }
      var e2 = r.entrees || [];
      if (!e2.length) { z.innerHTML = '<div class="fin">${T("Aucune modification enregistrée pour cet article.")}</div>'; return; }
      var parAn = {};
      e2.forEach(function(e){
        var a;
        try { a = new Date(e.ts).getFullYear(); } catch (x) { a = '?'; }
        (parAn[a] = parAn[a] || []).push(e);
      });
      var ans = Object.keys(parAn).sort(function(a, b){ return b - a; });
      z.innerHTML = '<div class="fin" style="text-align:left;margin:0 0 .6rem">${T("Modifications conservées")} '
        + '${T("jusqu’au retrait de l’article, archivées par année, purgées au-delà de 5 ans.")}</div>'
        + ans.map(function(a){
            var l = parAn[a];
            return '<div class="an">' + esc(a) + ' · ' + l.length + ' '
              + (l.length > 1 ? '${T("modifications")}' : '${T("modification")}') + '</div>'
              + l.map(function(e){
                  return '<div class="bl"><div class="qd"><span>' + esc(dateCourte(e.ts)) + '</span>'
                    + (e.par ? '<span>${T("par")} ' + esc(e.par) + '</span>' : '') + '</div>'
                    + (e.changements || []).map(function(c){
                        return '<div style="margin-bottom:.3rem"><div class="et">' + esc(c.libelle) + '</div>'
                          + dif(c.avant || '—', c.apres || '—') + '</div>';
                      }).join('') + '</div>';
                }).join('');
          }).join('');
    });
  }

  // ══ BROUILLON AUTOMATIQUE ═════════════════════════════════════════════════
  // ⚠ IL NE PEUT PAS VIVRE ICI. Cette fenêtre est chargée en data:text/html :
  // son origine est nulle et localStorage y lève SecurityError — mesuré, pas
  // supposé. Le brouillon passe donc par le pont, dans le stockage du site, sous
  // une sous-clé qui lui est propre (voir pont.js).
  // ⚠ EN CRÉATION SEULEMENT, comme l'éditeur du site : sur une fiche existante, un
  // brouillon ferait concurrence à la fiche enregistrée sans qu'on sache laquelle
  // fait foi.
  var BR_DERNIER = '', BR_T = null, BR_FINI = false;
  function brCapturer(){
    return {
      ts: Date.now(),
      etape: Assist.i, ordre: 'photos-d-abord',
      f: {
        nom: val('p-nom'), cat: val('p-cat'), sku: val('p-sku'), marque: val('p-marque'),
        desc: val('p-desc'), genre: val('p-genre'), age: val('p-age'), style: val('p-style'),
        guide: val('p-guide'), etiq: val('p-etiq'), fourn: val('p-fourn'), ajust: val('p-ajust'),
        prix: val('p-prix'), solde: val('p-solde'), cout: val('p-cout'),
        poids: val('p-poids'), unite: val('p-unite'), seuil: val('p-seuil'),
        limclient: val('p-limclient'), compo: val('p-compo'), entAutre: val('p-ent-autre'),
        regime: val('p-regime'), retours: val('p-retours'), actif: coché('p-actif'),
        direct: coché('p-direct'), anticipe: coché('p-anticipe'), publie: val('p-publie')
      },
      tailles: tailles(), couleurs: couleurs(),
      image: IMAGE || '', vues: VUES, dosCle: cleDos(), fibre: FIBRE || '', parcoul: PARCOUL, stock: STOCK, locs: LOCS, mesv: MESV,
      ent: Array.from(ENT)
    };
  }
  // « Utile » = la personne a réellement saisi quelque chose. On EXCLUT les
  // tailles, comme le site : sur une fiche neuve elles peuvent être cochées par
  // défaut, et l'on garderait un brouillon d'un formulaire vierge.
  function brUtile(d){
    return !!(d && d.f && (d.f.nom || d.f.prix || d.f.cout || d.image || d.f.desc
      || d.f.marque || (d.couleurs && d.couleurs.length)));
  }
  function brEnregistrer(){
    if (ID || BR_FINI) return;
    var d = brCapturer();
    if (!brUtile(d)) return;
    var s = JSON.stringify(d);
    // ⚠ ON N ENVOIE QUE SI QUELQUE CHOSE A CHANGÉ. Un brouillon porte des photos
    // en base64 : le repousser toutes les cinq secondes sans raison ferait voyager
    // plusieurs mégaoctets pour rien, à travers le pont, en continu.
    if (s === BR_DERNIER) return;
    BR_DERNIER = s;
    P.appeler('produit:brouillonEcrire', d).then(function(r){
      if (r && r.ok) return;
      // ⚠ UN BROUILLON QUI N EST PAS GARDÉ DOIT LE DIRE. Le site avale l'échec de
      // quota en silence ; ici on l'annonce, parce que se croire à l'abri est pire
      // que de savoir qu'on ne l'est pas.
      BR_DERNIER = '';
      dire('${T("Brouillon non conservé —")} ' + expliquer(r), 'att');
    });
  }
  function brArreter(){ if (BR_T) { clearInterval(BR_T); BR_T = null; } }

  function brReprendre(d){
    var f = d.f || {};
    poser('p-nom', f.nom); poser('p-cat', f.cat); poser('p-sku', f.sku);
    poser('p-marque', f.marque); poser('p-desc', f.desc);
    poser('p-genre', f.genre); poser('p-age', f.age); poser('p-style', f.style);
    poser('p-guide', f.guide); poser('p-etiq', f.etiq); poser('p-fourn', f.fourn);
    poser('p-ajust', f.ajust || '');
    poser('p-prix', f.prix); poser('p-solde', f.solde); poser('p-cout', f.cout);
    poser('p-poids', f.poids); poser('p-seuil', f.seuil);
    poser('p-limclient', f.limclient || '');
    poser('p-compo', f.compo || ''); poser('p-ent-autre', f.entAutre || '');
    ENT = new Set(Array.isArray(d.ent) ? d.ent.map(String) : []);
    // ⚠ UN BROUILLON ECRIT PAR LA VERSION PRECEDENTE ne porte que l ancien code
    // ('0' | '1' | '3' | '4'). On le traduit : sans cela la reprise reposerait
    // << Normal >> sur une fiche mise en vente finale, a l endroit precis ou l on
    // croit tout retrouver.
    poser('p-regime', f.regime === 'liq' || f.regime === '3' ? 'liq'
      : (f.regime === 'final' || f.regime === '1' ? 'final' : 'normal'));
    poser('p-retours', f.retours === 'aucun' || f.regime === '4' ? 'aucun' : 'ok');   // la valeur, pas le texte (2026-10-25, audit)
    majRegime();
    // ⚠ L UNITÉ ET SA MÉMOIRE VONT ENSEMBLE. dataset.prec sert à convertir le
    // poids au changement d'unité ; le laisser sur « g » après avoir restauré
    // « kg » ferait multiplier le poids par mille au premier changement.
    var uni = document.getElementById('p-unite');
    if (uni) { uni.value = f.unite || 'g'; uni.dataset.prec = uni.value; }
    var a = document.getElementById('p-actif'); if (a) a.checked = f.actif !== false;
    var dr = document.getElementById('p-direct'); if (dr) dr.checked = !!f.direct;
    var an = document.getElementById('p-anticipe'); if (an) an.checked = !!f.anticipe && !f.direct;
    if (f.publie) poser('p-publie', f.publie);
    if (window.__pfMajDirect) window.__pfMajDirect();
    Array.prototype.forEach.call(document.querySelectorAll('#p-tailles .jeton'), function(j){
      j.classList.toggle('on', (d.tailles || []).indexOf(j.getAttribute('data-t')) >= 0);
    });
    CHOIX = (d.couleurs || []).map(String);
    IMAGE = d.image || '';
    VUES = Object.assign({}, d.vues || {});
    DOS_SRC = (d.dosCle && VUES[d.dosCle]) ? VUES[d.dosCle] : '';
    FIBRE = typeof d.fibre === 'string' ? d.fibre : '';
    MODE_PH = modeStandard();   // les photos reprises sont dans le mode de la catégorie reprise
    // Un brouillon d’une version antérieure porte encore la clé « principale ».
    PARCOUL = parcoulDepuisFiche(d.parcoul);
    MESV = mvDepuisFiche(d.mesv);
    if (d.mesv && d.mesv.type === 'aucun') MESV.type = 'aucun';
    STOCK = Object.assign({}, d.stock || {});
    LOCS = Object.assign({}, d.locs || {});
    montrerImage(IMAGE);
    dessinerJetons(); majMarge(); majIa(); majNom();
    // On repart de l'étape où la personne s'était arrêtée : la ramener à la
    // première l'obligerait à retraverser ce qu'elle avait déjà rempli.
    if (typeof d.etape === 'number') Assist.aller(Math.max(0, Math.min(7, d.ordre === 'photos-d-abord' ? d.etape : ([1, 2, 0, 3, 4, 5, 6, 7][d.etape] || 0))));
    else Assist.fil();
    // Le brouillon restauré est déjà celui du stockage : sans cette ligne, le
    // premier tic le réécrirait à l'identique.
    BR_DERNIER = JSON.stringify(brCapturer());
    dire('${T("Brouillon repris.")}', 'bon');
  }

  // ⚠ UNE BOÎTE, PAS UN BANDEAU. L'éditeur du site pose un bandeau au-dessus du
  // formulaire parce que sa page défile ; ici une étape doit tenir dans la
  // fenêtre, et un bandeau permanent volerait la place d'une carte. La question
  // se pose une fois, à l'ouverture, et disparaît.
  function brProposer(){
    if (ID) return Promise.resolve();
    return P.appeler('produit:brouillonLire').then(function(r){
      if (!r || !r.ok || !r.brouillon || !brUtile(r.brouillon)) return;
      return new Promise(function(resoudre){
        var v = document.createElement('div');
        v.className = 'voile';
        v.innerHTML = '<div class="boite"><h3 style="color:var(--tx-creme)"><span class="ic">📝</span> ${T("Un brouillon non terminé")}</h3>'
          + '<p>${T("Une saisie a été laissée en cours")} <strong>' + esc(ilYa(r.brouillon.ts))
          + '</strong>${T(". La reprendre, ou repartir d’une fiche vierge ?")}</p>'
          + '<p style="font-size:.78rem;color:var(--tx2)">${T("Un brouillon est gardé 15 minutes,")} '
          + '${T("puis il disparaît de lui-même.")}</p>'
          + '<div class="pied2"><button type="button" id="br-non">${T("Repartir à neuf")}</button>'
          + '<button type="button" class="prim" id="br-oui">${T("Reprendre")}</button></div></div>';
        document.body.appendChild(v);
        document.getElementById('br-oui').onclick = function(){
          v.remove(); brReprendre(r.brouillon); resoudre();
        };
        document.getElementById('br-non').onclick = function(){
          v.remove(); P.appeler('produit:brouillonJeter'); BR_DERNIER = ''; resoudre();
        };
      });
    });
  }

  /* (2026-10-19, audit — lot S1) LE VERROU EST RENDU À LA FERMETURE. Il ne l'était jamais : la fiche restait
     « ouverte par vous » chez les collègues tant que le site renouvelait — et, un poste tenant désormais un
     verrou PAR fiche, il ne tombait plus en ouvrant la suivante. On rend CETTE fiche ([portée, id]). */
  var VERROU_PRIS = '';
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    var id = VERROU_PRIS; VERROU_PRIS = '';
    try { P.appeler('verrou:rendre', 'products', id); } catch (e) {}
  }
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });
  function verrou(){
    if (!ID) return Promise.resolve();
    return P.appeler('verrou:prendre', 'products', ID).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      if (v.obtenu) VERROU_PRIS = String(ID);
      if (v.obtenu) { sous.textContent = v.horsLigne ? '${T("hors ligne")}' : '${T("Section verrouillée en modification par :")} ' + (v.par || '${T("vous")}'); return; }
      sous.textContent = '${T("ouverte par ")}' + (v.parQui || '${T("quelqu’un d’autre")}');
      bEnr.disabled = true;
      dire('${T("Enregistrement bloqué : cette fiche est ouverte ailleurs.")}', 'err');
    });
  }

  /* La proposition << Auto d apres les retours >> sous le choix de l ajustement.
     Une fiche neuve n a aucun retour : la ligne le dit, sans appel. Un echec du
     pont n est pas grave ici — la ligne se tait, le choix manuel reste. */
  function chargerAjustement(){
    var z = document.getElementById('p-ajust-sug');
    if (!z) return;
    if (!ID) { z.textContent = '${T("Auto d’après les retours : aucune donnée pour une fiche neuve.")}'; return; }
    P.appeler('produit:ajustement', ID).then(function(r){
      if (!r || !r.ok) { z.textContent = ''; return; }
      var lib = { petit: '${T("taille petit")}', grand: '${T("taille grand")}' };
      var dec = szNombre(r.petit) + ' ' + '${T("vers une taille au-dessus")}' + ', ' + szNombre(r.grand) + ' ' + '${T("vers une taille au-dessous")}';
      if (!r.total) { z.textContent = '${T("Auto d’après les retours : aucun retour « taille incorrecte » pour ce produit.")}'; return; }
      if (!r.suggestion) {
        z.textContent = '${T("Auto d’après les retours : aucune tendance nette")}' + ' (' + szNombre(r.total) + ' ' + szPl(r.total, '${T("retour « taille incorrecte »")}', '${T("retours « taille incorrecte »")}') + ' — ' + dec
          + ' ; ' + '${T("seuil")}' + ' ' + szNombre(r.seuil) + ', 60 %).';
        return;
      }
      z.innerHTML = '';
      z.appendChild(document.createTextNode('${T("Auto d’après les retours :")}' + ' ' + lib[r.suggestion] + ' (' + szNombre(r.total)
        + ' ' + szPl(r.total, '${T("retour « taille incorrecte »")}', '${T("retours « taille incorrecte »")}') + ' — ' + dec + '). '));
      if (val('p-ajust') !== r.suggestion) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'mini'; b.textContent = '${T("Appliquer")}';
        b.onclick = function(){
          poser('p-ajust', r.suggestion);
          b.remove();
          try { document.getElementById('p-ajust').dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
        };
        z.appendChild(b);
      }
    });
  }

  function charger(){
    P.appeler('produit:contexte').then(function(c){
      if (!c || !c.ok) { vide('${T("Formulaire indisponible")}', expliquer(c)); return; }
      CTX = c;
      return P.appeler('produit:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('${T("Fiche indisponible")}', expliquer(r)); return; }
        FICHE = r.fiche;
        document.getElementById('titre').textContent = ID ? '${T("Modifier le produit")}' : '${T("Nouveau produit")}';
        dessiner();
        brancherApercu();
        chargerAjustement();
        if (ID) {
          // ⚠ L INSTANTANÉ SE PREND APRÈS remplir, jamais avant : pris trop tôt
          // il serait vide, et la fiche entière passerait pour « modifiée » dès
          // l'ouverture — un journal qui crie au loup ne se lit plus.
          BASE = instantane();
          chargerRecent();
          // La fenêtre des 24 h expire côté serveur pendant qu'on travaille : on
          // redemande chaque minute, comme l'éditeur du site, plutôt que de
          // recalculer une échéance ici avec l'horloge de ce poste.
          JRN_T = setInterval(chargerRecent, 60000);
          var bj = document.getElementById('btn-jrn');
          if (bj) bj.onclick = ouvrirJournal;
          // La pastille suit la saisie : un écart apparaît dès qu'on touche un champ.
          document.getElementById('corps').addEventListener('input', majPastille);
          document.getElementById('corps').addEventListener('change', majPastille);
          majPastille();
          etapesSuivre();
          /* UN APERÇU 3D PAYÉ DONT LE SUIVI S EST PERDU (2026-10-21) : la fiche demande au site de le reprendre, puis
             montre l état de la génération de cet article (en cours, en attente de confirmation, échouée). */
          if (P.appeler) P.appeler('generations:rattraper').then(function(){ suivre3d(); }, function(){ suivre3d(); });
        } else {
          // Autosauvegarde toutes les 5 secondes, comme l'éditeur du site.
          BR_T = setInterval(brEnregistrer, 5000);
        }
        return verrou().then(function(){ return brProposer(); });
      });
    });
  }

  // ⚠ VENDRE SOUS LE COUT RESTE POSSIBLE — c est parfois voulu (ecoulement, fin
  // de serie) — mais jamais SANS TRACE ni sans autorisation. La raison est
  // ecrite dans la fiche, et un code est exige s il en existe un.
  var SOUSCOUT = null;   // { raison, nip } une fois accorde
  var VAR_FAITES = false; // variantes de couleur regenerees pour CET envoi
  function demanderSousCout(eff, cout){
    return P.appeler('produit:nipExige').then(function(x){
      var exige = !!(x && x.exige);
      return new Promise(function(resoudre){
        var v = document.createElement('div');
        v.className = 'voile';
        v.innerHTML = '<div class="boite alerte"><h3><span class="ic">⚠</span> ${T("Prix inférieur au coût d’acquisition")}</h3>'
          + '<p>${T("Le prix de vente effectif (")}<strong>' + szArgent(eff) + '</strong>${T(") est inférieur au coût d’acquisition (")}<strong>' + szArgent(cout) + '</strong>).</p>'
          + '<div class="ch"><label for="bc-raison">${T("Raison ")}<span class="req">*</span></label>'
          + '<textarea id="bc-raison" rows="3" placeholder="${T("Écoulement de fin de série, article abîmé…")}"></textarea></div>'
          + (exige ? '<div class="ch" style="margin-top:.5rem"><label for="bc-nip">${T("Code d’autorisation ")}<span class="req">*</span></label>'
              + '<input id="bc-nip" type="password" autocomplete="off"></div>' : '')
          + '<div class="msg err" id="bc-err" style="min-height:1.1em;margin-top:.4rem"></div>'
          + '<div class="pied2"><button type="button" id="bc-non">${T("Annuler")}</button>'
          + '<button type="button" class="prim" id="bc-oui">${T("Autoriser et enregistrer")}</button></div></div>';
        document.body.appendChild(v);
        var r = document.getElementById('bc-raison'); if (r) r.focus();
        document.getElementById('bc-non').onclick = function(){ v.remove(); resoudre(null); };
        document.getElementById('bc-oui').onclick = function(){
          var raison = (document.getElementById('bc-raison').value || '').trim();
          var err = document.getElementById('bc-err');
          if (!raison) { err.textContent = '${T("La raison est obligatoire.")}'; return; }
          var nip = exige ? (document.getElementById('bc-nip').value || '') : '';
          P.appeler('produit:nip', nip).then(function(z){
            if (!z || !z.ok) { err.textContent = expliquer(z); return; }
            if (!z.valide) { err.textContent = '${T("Code incorrect — réessayez.")}'; return; }
            v.remove(); resoudre({ raison: raison });
          });
        };
      });
    });
  }

  /* nipPhotos (2026-10-19) : le NIP des photos, quand le serveur le réclame parce que la fiche RETIRE une photo de
     l'article. La fenêtre ne le compare pas ; il part avec l'envoi, et seulement pour cet envoi. */
  var NIP_PHOTOS = '';
  function enregistrer(nipPhotos){
    NIP_PHOTOS = (typeof nipPhotos === 'string') ? nipPhotos : '';
    if (!Assist.toutValide()) return;
    /* (2026-10-25, audit) LA QUESTION « Effacer les photos originales ? » EST RETIRÉE : ORIG_A_EFFACER n était
       plus jamais rempli depuis que le retour du Studio RETIRE lui-même l originale (poserDuStudio, 2026-10-20).
       Le bloc ne pouvait plus s exécuter et laissait croire à une question qui ne venait jamais. */
    if (!tailles().length || !couleurs().length) {
      Assist.aller(2);
      dire('${T("Choisissez au moins une taille ET une couleur avant d’enregistrer.")}', 'err');
      return;
    }
    if (!IMAGE) {
      Assist.aller(0);
      dire('${T("La photo principale est obligatoire.")}', 'err');
      return;
    }
    // LA CABINE D ESSAYAGE (2026-10-30) : le pont refait la même vérification au serveur (double filet)
    if (cabExigee() && !CAB.t.pret) {
      Assist.aller(0);
      dire(raisonCabine(), 'err');
      return;
    }
    // Les médias sont facultatifs, mais un mannequin à moitié décrit ou une
    // vue 360 trop courte se refusent ICI, l étape sous les yeux.
    /* (2026-10-26) Le mannequin n'est plus à l'écran (sa demande) : une fiche ancienne au mannequin incomplet ne
       doit pas bloquer l'enregistrement sur des champs qu'on ne voit plus — on n'envoie alors aucun mannequin. */
    var MQ = lireMannequin();
    if (MQ === false) MQ = null;
    /* (2026-10-26, relecture) Le 360° n'est plus à l'écran : une ancienne vue au mauvais nombre d'images ne doit pas
       bloquer l'enregistrement sur un champ invisible — elle n'est simplement plus envoyée (retirée de la fiche). */
    if (VUE360.length && (VUE360.length < 8 || VUE360.length > 36)) VUE360 = [];
    // ⚠ REGLE ARRETEE le 2026-08-08 (2e passe, a sa demande) : l emplacement
    // suit la QUANTITE — une variante a zero n en exige pas — mais une
    // CREATION doit porter du stock : au moins une variante avec une
    // quantite. La fiche << tout a zero >> se creait sans un mot. En
    // MODIFICATION, pas d exigence : un produit vendu a zero reste modifiable.
    var enStock = [];
    tailles().forEach(function(t){ couleurs().forEach(function(c){
      if ((STOCK[t + '-' + c] || 0) > 0) enStock.push(t + '-' + c);
    }); });
    if (!ID && !enStock.length) {
      Assist.aller(7);
      dire('${T("Saisissez une quantité pour au moins une variante avant d’enregistrer.")}', 'err');
      return;
    }
    if (CTX && (CTX.entrepots || []).length) {
      var sansLieu = enStock.filter(function(k){ return !LOCS[k]; });
      if (sansLieu.length) {
        Assist.aller(7);
        dire('${T("Sélectionnez un emplacement d’entrepôt pour :")} '
          + sansLieu.slice(0, 3).join(', ')
          + (sansLieu.length > 3 ? '… (' + sansLieu.length + ' variantes)' : '') + '.', 'err');
        return;
      }
    }
    // On regarde AVANT d envoyer : le refus doit arriver pendant qu on a encore
    // le formulaire sous les yeux.
    var pr = argentNombre(val('p-prix')) || 0;
    var so = argentNombre(val('p-solde')) || 0;
    var co = argentNombre(val('p-cout')) || 0;
    var eff = (so > 0 && so < pr) ? so : pr;
    if (co > 0 && eff > 0 && eff < co && !SOUSCOUT) {
      demanderSousCout(eff, co).then(function(a){
        if (!a) { dire('${T("Enregistrement annulé.")}', 'att'); return; }
        SOUSCOUT = a; enregistrer();
      });
      return;
    }
    // ⚠ COMME L’ÉDITEUR DU SITE : en mode auto, les variantes de couleur se
    // RÉGÉNÈRENT à l’enregistrement (le bouton de l’éditeur affiche le même
    // « ⏳ Génération… » avant d’écrire). Après la question du sous-coût, pour
    // ne pas faire attendre la personne avant de l’interroger. Un échec de
    // teinte n’empêche PAS d’enregistrer : générer est un plus, pas une porte.
    if (!VAR_FAITES && modeAutoCouleur() && !modeStandard() && IMAGE && couleurs().length > 1) {
      bEnr.disabled = true;
      genererVariantes(function(){
        bEnr.disabled = false;
        VAR_FAITES = true;
        enregistrer();
      }, true);
      return;
    }
    // ⚠ CHAQUE COULEUR SECONDAIRE A SA PHOTO — sinon on ne part pas (sa règle du 2026-10-09).
    // Après la teinte automatique : ce qu’elle n’a pas su faire se dit ici, couleur par couleur.
    var sansPhoto = couleurs().slice(1).filter(function(c){ return !(PARCOUL[c] && (PARCOUL[c].main || PARCOUL[c].principale)); });
    if (sansPhoto.length) {
      VAR_FAITES = false;
      Assist.aller(3); dessinerVues();
      dire('${T("Photo obligatoire pour chaque couleur secondaire — manquante :")} ' + sansPhoto.join(', ') + '.', 'err');
      return;
    }
    // Le stock est purge des variantes qui n existent plus : garder une quantite
    // sur une couleur retiree la ferait compter dans l inventaire sans qu aucun
    // ecran ne la montre.
    var valides = {};
    tailles().forEach(function(t){ couleurs().forEach(function(c){ valides[t + '-' + c] = true; }); });
    var stock = {}, locs = {};
    /* (2026-10-19, audit — lot S1) Une variante à 0 RESTE (0 est une quantité : la retirer effaçait la variante
       de la fiche, et le site la croyait disparue). Seules les variantes qui n existent plus partent. */
    Object.keys(STOCK).forEach(function(k){ if (valides[k]) stock[k] = Math.max(0, parseInt(STOCK[k], 10) || 0); });
    /* Et le stock n est ENVOYÉ que s il a changé depuis l ouverture : le site en tire des DIFFÉRENCES par variante
       (stock_ajuster), et une vente faite pendant la saisie reste comptée. Fiche neuve : toujours envoyé. */
    var stockChange = !ID || !STOCK0 || Object.keys(stock).some(function(k){ return (parseInt(STOCK0[k], 10) || 0) !== stock[k]; });
    Object.keys(LOCS).forEach(function(k){ if (valides[k] && LOCS[k]) locs[k] = LOCS[k]; });

    bEnr.disabled = true;
    var medNeufs = VIDEO.indexOf('data:') === 0 || VUE360.some(function(x){ return String(x).indexOf('data:') === 0; });
    dire(medNeufs ? '${T("Dépôt des médias et enregistrement…")}'
      : (IMAGE && IMAGE.indexOf('data:') === 0 ? '${T("Dépôt de la photo et enregistrement…")}' : '${T("Enregistrement…")}'));
    P.appeler('produit:enregistrer', ID, sansModele3d({
      name: val('p-nom').trim(), category: val('p-cat'), sku: val('p-sku'),
      brand: val('p-marque'), description: val('p-desc'),
      genre: val('p-genre'), ageGroup: val('p-age'), style: val('p-style'),
      sizeGuideId: val('p-guide'), tag: val('p-etiq'), supplierId: val('p-fourn'),
      ajustement: val('p-ajust') || null,
      entretien: entPourEnvoi(),
      price: argentNombre(val('p-prix')),
      salePrice: argentNombre(val('p-solde')),
      acquisitionCost: argentNombre(val('p-cout')),
      weight: enKg(val('p-poids'), val('p-unite')),
      lowStock: parseInt(val('p-seuil'), 10),
      buyMaxClient: (parseInt(val('p-limclient'), 10) >= 1) ? parseInt(val('p-limclient'), 10) : null,
      active: coché('p-actif'), regime: val('p-regime'), retours: val('p-retours'),
      // L acces anticipe des paliers (2026-10-07) : le pont exige la date quand il est coche.
      accesAnticipe: coché('p-direct') ? false : coché('p-anticipe'), publieLe: coché('p-direct') ? null : (val('p-publie') || null),
      anticipeExclu: coché('p-direct'),
      sizes: tailles(), colors: couleurs(),
      image: IMAGE,
      belowCost: !!SOUSCOUT,
      belowCostReason: SOUSCOUT ? SOUSCOUT.raison : '',
      additionalImages: VUES,
      // La photo du dos en mode simple (l'aperçu 3D) ; en mode angles, c'est la vue « Derrière » — null.
      photoDos: (modeStandard() && photoDos()) ? photoDos() : null,
      photoFibre: FIBRE || null,   // (2026-10-26) le gros plan de la fibre, affiché en grand en boutique
      // Les mesures du vêtement (7.13.0) : null = aucune. Le pont ne les écrit que si la clé est envoyée.
      mesuresVetement: mvPourEnvoi(),
      // Les photos des couleurs RETIREES ne partent pas : le site les
      // televerserait puis les garderait dans le stockage sans que rien ne les
      // affiche jamais.
      colorVariants: (function(){
        var g = {}, cs = couleurs();
        cs.forEach(function(c){ if (PARCOUL[c]) g[c] = PARCOUL[c]; });
        return g;
      })(),
      stock: stockChange ? stock : undefined, stockLoc: locs,
      // Les médias : null = aucun (ou retiré). Le pont ne les écrit que parce
      // que la clé est envoyée — une coquille plus ancienne ne les efface pas.
      mannequin: MQ || null,
      video: VIDEO || null,
      vue360: VUE360.length ? VUE360.slice() : null,
      // L'aperçu 3D (gardé, ou retiré), et la clé des coûts engagés pendant la création (rattachés au produit).
      modele3d: MOD3D || null,
      brouillonCouts: (!ID && CLE_COUTS) ? CLE_COUTS : '',
      photosNip: NIP_PHOTOS
    })).then(function(r){
      // Le prochain envoi repart de zéro : les photos ont pu changer entre-temps.
      VAR_FAITES = false;
      if (!r || !r.ok) {
        bEnr.disabled = false;
        if (r && r.motif === 'delai') {
          // ⚠ Le plafond du pont a sonne mais le SITE continue le depot de la
          // photo : la fiche est souvent enregistree quand meme. Recommencer
          // tout de suite fabriquerait un DOUBLON.
          dire('${T("L’enregistrement prend du temps (dépôt de la photo) et se poursuit")} '
            + '${T("peut-être — vérifiez la liste des produits avant de recommencer.")}', 'att');
          return;
        }
        // Le DOUBLE FILET du pont : on RAMÈNE à l’étape fautive, exactement
        // comme les gardes locales — un refus sans l’écran concerné sous les
        // yeux oblige à chercher ce qui manque.
        if (r && r.motif === 'tailles_couleurs_requises') Assist.aller(2);
        if (r && r.motif === 'photo_requise') Assist.aller(0);
        if (r && /^(mannequin_|video_|vue360_)/.test(String(r.motif || ''))) Assist.aller(0);
        if (r && r.motif === 'stock_requis') Assist.aller(7);
        // LE NIP DES PHOTOS : demandé (et redemandé s'il est faux) ; annuler laisse la fiche telle qu'à l'écran.
        if (r && (r.motif === 'photos_nip_requis' || r.motif === 'photos_nip_faux')) {
          dire('');
          szDemanderNip({ titre: '${T("Retirer une photo de l’article")}',
            texte: '${T("Cet enregistrement retire une photo de la fiche. Entrez le NIP des photos pour l’enregistrer.")}',
            oui: '${T("Enregistrer")}',
            erreur: r.motif === 'photos_nip_faux' ? ((r.restant > 0) ? '${T("NIP incorrect — essais restants :")} ' + r.restant
              : '${T("NIP incorrect — retraits de photos bloqués 15 minutes.")}') : '' })
            .then(function(n){ if (n) enregistrer(n); else dire('${T("Non enregistré — la fiche est restée à l’écran.")}', 'att'); });
          return;
        }
        if (r && r.motif === 'emplacement_requis') {
          Assist.aller(7);
          dire('${T("Sélectionnez un emplacement d’entrepôt pour :")} '
            + (r.manquants || []).join(', ') + '.', 'err');
          return;
        }
        dire(expliquer(r), 'err');
        return;
      }
      // ⚠ LE BROUILLON SE JETTE SEULEMENT MAINTENANT, et l'autosauvegarde s'arrête
      // AVANT : sans cela, un dernier tic le réécrirait juste après l'avoir jeté,
      // et la prochaine ouverture proposerait de reprendre une fiche déjà créée.
      BR_FINI = true; brArreter();
      if (!ID) P.appeler('produit:brouillonJeter');
      // l article provisoire du Studio prend son vrai identifiant : ses photos étiquetées et sa boîte aux lettres suivent
      if (!ID && r.id) P.appeler('studio:lierProvisoire', PROV, String(r.id), val('p-nom').trim());
      dire('${T("Enregistré.")}', 'bon');
      setTimeout(function(){ rendreVerrou(); P.fermer(); }, 700);
    });
  }

  // ⚠ ON NE FERME PAS SANS AVOIR GARDÉ LA SAISIE. Fermer par mégarde après dix
  // minutes de travail est exactement le cas où un brouillon sert à quelque chose.
  // On attend la réponse du pont avant de fermer : la fenêtre disparue, plus
  // personne ne porte l'écriture.
  function fermerProprement(){
    brArreter();
    rendreVerrou();
    if (ID || BR_FINI) { P.fermer(); return; }
    var d = brCapturer();
    if (!brUtile(d)) { P.fermer(); return; }
    dire('${T("Brouillon conservé…")}');
    P.appeler('produit:brouillonEcrire', d).then(function(){ P.fermer(); });
  }

  /* ⚠⚠ AUCUNE GLISSIERE, A AUCUNE ETAPE — ET QUE CA LE RESTE MALGRE LES AJOUTS.
     Le corps ne defile pas (regle du socle) : quand une etape est plus haute que
     la fenetre, elle etait COUPEE en bas (vu sur << Identite, prix et poids >>,
     2026-08-07). La fenetre se met donc A LA TAILLE DE SON CONTENU :
     - a chaque etape et a CHAQUE changement du contenu (MutationObserver — un
       jeton de couleur ajoute, une ligne de stock de plus, tout est vu, y
       compris ce qu on ajoutera plus tard), la hauteur necessaire est mesuree
       et demandee au processus principal ;
     - << garder >> : la fenetre reste ou la personne l a posee (juste ramenee dans
       l ecran si le bas sort), au lieu d etre recentree a chaque etape ;
     - le principal PLAFONNE a la hauteur de l ecran ; si malgre tout ca ne
       tient pas (petit ecran), on REDUIT LE RENDU (zoom) plutot que de couper
       ou de faire apparaitre une glissiere. */
  var calT = null, calDern = 0;
  // ⚠ JAMAIS DE REDIMENSIONNEMENT PENDANT QU UNE LISTE EST OUVERTE (2026-10-04) :
  // la liste native se refermerait sous le doigt. On attend le choix (ou la sortie).
  function listeActive(){
    var a = document.activeElement;
    if (!a || a.tagName !== 'SELECT') return false;
    if (!a._szCaler) {
      a._szCaler = true;
      var apres = function(){ a._szCaler = false; a.removeEventListener('change', apres); a.removeEventListener('blur', apres); calerBientot(); };
      a.addEventListener('change', apres); a.addEventListener('blur', apres);
    }
    return true;
  }
  function caler(){
    if (!P || !P.ajusterHauteur) return;
    if (listeActive()) return;
    var corps = document.getElementById('corps');
    if (!corps || !corps.style) return;
    corps.style.zoom = '';
    var besoin = document.body.scrollHeight - corps.clientHeight + corps.scrollHeight;
    if (!(besoin > 0)) return;
    // On ne redemande pas la meme hauteur en boucle : l observateur voit aussi
    // nos propres retouches de style.
    if (Math.abs(besoin - calDern) < 3) { secours(); return; }
    calDern = besoin;
    P.ajusterHauteur(besoin + 2, true);
  }
  function secours(){
    if (listeActive()) return;
    var corps = document.getElementById('corps');
    if (!corps || !corps.style) return;
    corps.style.zoom = '';
    var deb = corps.scrollHeight, vu = corps.clientHeight;
    if (deb > 0 && vu > 0 && deb > vu + 4) corps.style.zoom = String(Math.max(0.7, vu / deb));
  }
  function calerBientot(){ clearTimeout(calT); calT = setTimeout(caler, 120); }
  window.addEventListener('resize', function(){ clearTimeout(calT); calT = setTimeout(secours, 150); });
  if (typeof MutationObserver !== 'undefined') {
    // childList + subtree SEULEMENT : observer les attributs verrait nos propres
    // changements de style (zoom) et tournerait en rond.
    new MutationObserver(calerBientot).observe(document.getElementById('corps'), { childList: true, subtree: true });
  }
  document.getElementById('pas').addEventListener('click', calerBientot);
  document.getElementById('btn-prec').addEventListener('click', calerBientot);
  document.getElementById('btn-suiv').addEventListener('click', calerBientot);
  calerBientot();

  bEnr.onclick = enregistrer;
  document.getElementById('btn-annuler').onclick = fermerProprement;
  document.addEventListener('keydown', function(ev){
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 's' || ev.key === 'S')) {
      ev.preventDefault(); if (!bEnr.disabled) enregistrer();
    }
    if (ev.key === 'Escape') {
      ev.preventDefault();
      // ⚠ ÉCHAP FERME D ABORD CE QUI EST PAR-DESSUS. Sans ce test, fermer une
      // boîte de dialogue fermait LA FENÊTRE : on demandait à quitter un journal
      // et l'on perdait la fiche en cours de saisie.
      // (2026-10-25, audit) Pendant une génération du Studio, Échap ne retire
      // RIEN : le traitement continue derrière, et le voile ôté laissait STM
      // pointer une boîte disparue.
      if (STM && STM.enCours) return;
      var voiles = document.querySelectorAll('.voile');
      if (voiles.length) { voiles[voiles.length - 1].remove(); return; }
      fermerProprement();
    }
  });
  charger();
})();
</script></body></html>`;
}

module.exports = { pageProduit };
