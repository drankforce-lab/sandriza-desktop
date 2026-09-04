'use strict';

/*
 * FENÊTRE « STUDIO VIRTUEL » — NATIVE (Catalogue, palier 5, chantier #14)
 * =============================================================================
 * Mise en scène guidée d'une photo studio (fond blanc) par Photoroom. On importe
 * une photo, on choisit UNE des trois voies, une AMBIANCE de marque, et l'on juge
 * d'abord en APERÇU GRATUIT (sandbox, filigrané) avant de dépenser un crédit.
 *
 *   👗 Mannequin virtuel — le vêtement porté par un modèle réel, décor et lumière
 *      intégrés (un seul appel). C'est la voie « pieds dans le sable ».
 *   👻 Fantôme habillé — le mannequin disparaît, puis un décor pro est posé
 *      (fond + ombre ancrée + relumière ; deux appels).
 *   📦 Produit à plat — détourage + décor + ombre + relumière (un appel).
 *
 * ⚠ TOUT LE TRAVAIL EST AU RELAIS (photoroom-proxy.php) : cette fenêtre n'envoie
 * qu'une image, une voie, une ambiance, ses réglages avancés et le drapeau
 * « aperçu ». Les clés ne la traversent jamais, les crédits se comptent là-bas,
 * l'ambiance s'y résout.
 *
 * ⚠⚠ LE PANNEAU « RÉGLAGES AVANCÉS » NE MONTRE QUE CE QUE LA VOIE ACCEPTE. Le
 * relais ne pose `finition` (fond décrit au texte, ombre réglable, relumière)
 * que sur le FANTÔME — en un second appel — et sur le PRODUIT À PLAT, en un
 * appel unique. Le mannequin virtuel compose sa scène par `options` (décor,
 * pose, modèle, expression, précisions libres) et la photo d'intérieur n'est lue
 * que pour le fantôme. Dessiner une glissière d'ombre sous un mannequin virtuel
 * serait un mensonge d'écran : le réglage partirait, serait ignoré en silence, et
 * l'on chercherait la panne dans le résultat.
 *
 * ⚠ `preset` et `finition` voyagent À LA RACINE du corps, jamais dans `options` —
 * enfouis là, ils sont reçus et jetés sans un mot (le défaut des lots, 3.40.0).
 *
 * ⚠ L'APERÇU SANDBOX EST GRATUIT ET FILIGRANÉ : c'est le levier crédits. Le bouton
 * payant s'arme en deux temps pour qu'aucun crédit ne parte par mégarde.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .credits{margin-left:auto;font-size:.74rem;color:var(--tx2)}
.tete .credits b{color:var(--tx-or)}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
/* ══ LA DISPOSITION EN DEUX VOLETS (refonte du 2026-08-18) ══════════════════
   AVANT : cinq cartes dans une grille a deux colonnes fixes, tout l ecran
   defilant d un seul bloc — et le RESULTAT, la seule chose qu on paie, tout en
   bas, hors de vue pendant qu on reglait. Chaque fonction avait ete posee dans
   la place qui restait ; personne n avait jamais redessine l ensemble.
   MAINTENANT : a gauche les etapes, qui defilent seules ; a droite ce qu on va
   obtenir, qui ne bouge plus. */
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;display:flex;gap:1rem;overflow:hidden}
/* ⚠ LE SELECTEUR DE PHOTOS ET LE SUIVI DES LOTS PRENNENT TOUT L ECRAN. Ce sont
   des ecrans a part entiere — une grille de centaines de vignettes, une file de
   lots avec ses boutons. Les serrer dans le volet de gauche redonnerait
   exactement la compression qu on vient de retirer. */
.corps.plein{display:block;overflow-y:auto}
.rail{flex:0 0 clamp(24rem,42%,36rem);min-width:0;min-height:0;
  display:flex;flex-direction:column;gap:.7rem}
.scene{flex:1 1 auto;min-width:0;overflow-y:auto;display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar,.scene::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb,
.scene::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.carte{background:#16202f;border:1px solid var(--v08);border-radius:11px;
  padding:.9rem 1rem;min-width:0;display:flex;flex-direction:column}
.carte h2{margin:0 0 .1rem;font:700 .74rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.carte .sous{margin:0 0 .7rem;font-size:.75rem;color:var(--tx3)}
/* ── LA BARRE DES RECETTES (lot 3d du #29) ─────────────────────────────────
   EN HAUT du volet de gauche, et volontairement FINE. Ce n est PAS une sixieme
   etape : le volet en porte deja cinq, et une section de plus aurait pousse le
   filigrane sous la ligne de flottaison — le defaut meme qu on vient de corriger
   en separant les deux volets. Une recette n ajoute rien a la commande, elle
   REMPLIT les cinq etapes d un coup : sa place est donc au-dessus d elles. */
.rcbar{flex:0 0 auto;display:flex;align-items:center;gap:.45rem;
  background:#16202f;border:1px solid var(--v08);border-radius:12px;
  padding:.5rem .6rem}
.rcbar label{flex:0 0 auto;font:700 .7rem/1 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.rcbar select{flex:1 1 auto;min-width:0;font-size:.78rem;padding:.3rem .45rem}
.rcbar button{flex:0 0 auto;font:inherit;font-size:.73rem;padding:.3rem .55rem;
  border-radius:8px;cursor:pointer;color:var(--tx-bleute);background:var(--v05);
  border:1px solid var(--v16)}
.rcbar button:hover:not(:disabled){background:var(--v11)}
.rcbar button:disabled{opacity:.4;cursor:default}
.rcbar button.x{color:#e79a9a}
/* L avertissement d ecrasement du voile d enregistrement. */
.rcav{color:#d8b57a}
/* ── LE VOLET DE GAUCHE EN ONGLETS (lot 3g du #29) ─────────────────────────
   Sa demande : << au lieu d avoir une scroll bar, des onglets orientes vers la
   gauche >>. Le volet ne defile donc plus DU TOUT : la bande d onglets tient a
   l ecran, et seul le panneau du groupe ouvert peut deborder — un groupe a la
   fois, c est justement ce qui l en empeche presque toujours.
   ⚠ LES DEUX << min-height:0 >> NE SONT PAS DECORATIFS. Un enfant flex refuse par
   defaut de retrecir sous la hauteur de son contenu : sans eux, le volet
   repousse le pied de page hors de la fenetre et la barre de defilement qu on
   vient de retirer revient par l autre bout. */
.railc{flex:1 1 auto;min-height:0;display:flex;gap:.7rem}
.onglets{flex:0 0 10.5rem;min-width:0;display:flex;flex-direction:column;gap:.25rem;
  overflow-y:auto}
.ong{display:flex;align-items:center;gap:.5rem;width:100%;text-align:left;
  padding:.42rem .5rem;border-radius:9px;border:1px solid transparent;
  background:transparent;color:var(--tx-bleute);cursor:pointer}
.ong:hover:not(.on){background:var(--v05)}
.ong.on{background:#16202f;border-color:rgba(201,169,126,.45)}
/* ⚠ MEME L ONGLET OUVERT RESTE EN GRIS. Il etait degrise pour se distinguer —
   mais c est la seule couleur qui restait dans la bande, et la regle est
   << toujours >>. L onglet ouvert se marque par son fond et son liseré dores,
   pas par un emoji qui reprend des couleurs. */
.ong .oi{flex:0 0 auto;font-size:.95rem;filter:grayscale(1) brightness(1.7);opacity:.85}
.ong.on .oi{opacity:1}
.ong .ot{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.2}
.ong .ot b{font:600 .79rem/1.25 system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ong .oe{font-size:.68rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ong.on .oe{color:var(--tx2)}
.ong .oc{flex:0 0 auto;color:var(--tx-or);font-size:.8rem;font-weight:700}
.panneau{flex:1 1 auto;min-width:0;min-height:0;overflow-y:auto;
  background:#16202f;border:1px solid var(--v08);border-radius:12px;
  padding:.85rem .95rem}
.pnt{display:flex;align-items:center;gap:.55rem}
.pnt .pi{font-size:1rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.pnt h2{margin:0;font:700 .95rem/1.2 Georgia,serif}
.panneau .sous{margin:.28rem 0 .7rem;font-size:.74rem;color:var(--tx3);line-height:1.4}
.onglets::-webkit-scrollbar,.panneau::-webkit-scrollbar{width:8px}
.onglets::-webkit-scrollbar-thumb,.panneau::-webkit-scrollbar-thumb{
  background:var(--v11);border-radius:8px}
/* ⚠ LES CINQ << ETAPES >> NUMEROTEES ONT DISPARU avec le passage aux onglets
   (3.47.0) : le numero qui devenait une coche vit maintenant SUR l onglet
   (.ong .oc), et l en-tete du groupe est .pnt. Les regles .etape / .eth / .num /
   .etc ne trouvaient plus aucun element a habiller — retirees a la cloture du
   chantier #29 plutot que laissees a vieillir. */
.pbtn{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.6rem}
.pbtn button{flex:1 1 auto}
.pt2{font-size:.7rem;color:var(--tx3)}
/* Deux menus courts cote a cote quand la place le permet, l un sous l autre
   sinon. auto-fit, donc jamais deux colonnes serrees dans un volet etroit. */
.duo{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:.6rem;margin-top:.7rem}
.duo .ch{margin:0}
/* ── LE VOLET DE DROITE ────────────────────────────────────────────────────
   Ce qu on va obtenir, toujours visible : le recapitulatif de la commande, puis
   l image. */
.bloc{background:#16202f;border:1px solid var(--v08);border-radius:12px;
  padding:.85rem 1rem;min-width:0}
.recap .rt,.fmt .rt{font:700 .74rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.recap .rc2{display:flex;flex-wrap:wrap;gap:.32rem;margin-top:.5rem}
.recap .jt{font-size:.75rem;padding:.16rem .55rem;border-radius:99px;
  background:rgba(201,169,126,.14);border:1px solid rgba(201,169,126,.3);color:var(--tx-creme)}
.recap .jt.gris{background:var(--v05);border-color:var(--v16);color:var(--tx2)}
.recap .note,.fmt .note{margin-top:.55rem;font-size:.73rem;color:var(--tx3);line-height:1.5}
/* ── FORMATS DE SORTIE (lot 3b) ────────────────────────────────────────────
   La meme image en 3:4, 1:1, 4:5 et 9:16, fabriquee ICI, au canevas de la page.
   ⚠ AUCUN APPEL, AUCUN CREDIT : couper et border une image que l on a deja ne
   demande rien a personne. Le faire redemander au service serait payer une
   seconde fois pour la meme photo. */
/* ── FILIGRANE / LOGO DE MARQUE (lot 3c) ─────────────────────────────────── */
.loggr{display:grid;grid-template-columns:repeat(auto-fill,minmax(6rem,1fr));gap:.45rem;
  align-content:start;max-height:16rem;overflow-y:auto}
.loggr::-webkit-scrollbar{width:8px}
.loggr::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.logv{background:#0f1724;border:1px solid #2b3444;border-radius:8px;padding:.3rem;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;gap:.2rem;min-width:0;
  -webkit-user-select:none;user-select:none;transition:border-color .12s,background .12s}
.logv:hover{border-color:rgba(201,169,126,.6)}
.logv.on{border-color:#c9a97e;box-shadow:0 0 0 1px #c9a97e inset;background:rgba(201,169,126,.1)}
/* ⚠ Fond CLAIR sous le logo : la plupart sont noirs sur transparent, et sur le
   fond sombre de cet ecran ils seraient invisibles — on choisirait a l aveugle. */
.logv img{width:100%;height:3.4rem;object-fit:contain;background:#e8edf5;border-radius:5px;padding:.15rem}
.logv .ln{font-size:.66rem;color:var(--tx2);max-width:100%;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Les neuf ancrages, disposes comme ils le seront sur l image. */
.posgr{display:grid;grid-template-columns:repeat(3,2.3rem);gap:.25rem}
.posc{padding:0;width:2.3rem;height:2.3rem;display:flex;align-items:center;justify-content:center}
.posc span{display:block;width:.6rem;height:.6rem;border-radius:2px;background:var(--v30)}
.posc.on{border-color:#c9a97e;background:rgba(201,169,126,.16)}
.posc.on span{background:#c9a97e}
.fmt .fbar{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin-top:.55rem}
.fmt .fbar .grand{margin-left:auto}
.fmtg{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5rem,1fr));gap:.55rem;
  align-content:start;margin-top:.6rem}
.fmtc{background:#111a29;border:1px solid var(--v08);border-radius:9px;padding:.45rem;
  display:flex;flex-direction:column;align-items:center;gap:.3rem;min-width:0}
.fmtc img{width:100%;height:7.5rem;object-fit:contain;background:#0b1220;border-radius:6px;
  border:1px solid var(--v08)}
.fmtc .ft{font-size:.82rem;font-weight:700;line-height:1.1}
.fmtc .fd{font-size:.68rem;color:var(--tx3);font-variant-numeric:tabular-nums}
.fmtc .fb{display:flex;gap:.25rem;width:100%}
.fmtc .fb button{flex:1 1 auto;padding:.24rem .3rem;font-size:.72rem}
/* Le geste suivant, sans avoir a lire une aide : ce qui est fait porte une
   coche, ce qui vient est mis en avant. */
.guide{display:flex;flex-direction:column;gap:.45rem;text-align:left;margin:.7rem auto 0;max-width:24rem}
.guide .gp{display:flex;align-items:center;gap:.55rem;font-size:.82rem;color:var(--tx3)}
.guide .gp .n{flex:0 0 auto;width:1.35rem;height:1.35rem;border-radius:50%;
  border:1px solid var(--v16);background:var(--v05);
  display:flex;align-items:center;justify-content:center;font:700 .72rem/1 system-ui;color:var(--tx2)}
.guide .gp.ok{color:var(--tx-bleute)}
.guide .gp.ok .n{background:#c9a97e;border-color:#c9a97e;color:#1a1208}
.guide .gp.suiv{color:var(--tx-creme);font-weight:600}
.guide .gp.suiv .n{border-color:#c9a97e;color:var(--tx-or)}
/* Dépôt de photo */
/* ⚠ ELLE ETAIT TROP GRANDE (sa demande du 2026-08-19, capture a l appui). Neuf
   rem de haut, un pictogramme de 1,6 rem et un texte qui passait sur deux lignes :
   la zone de depot occupait la moitie du panneau pour un geste qu on ne fait
   qu UNE fois par photo — et repoussait les boutons qui, eux, servent tout le
   temps. Elle reste evidemment reperable : c est un cadre en pointille, pas un
   affichage. */
.depot{border:1.5px dashed #2b3444;border-radius:10px;background:#0f1724;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25rem;
  min-height:5rem;text-align:center;color:var(--tx2);font-size:.78rem;padding:.6rem .7rem;
  -webkit-user-select:none;user-select:none}
.depot:hover,.depot.survol{border-color:#c9a97e;color:var(--tx-bleute)}
.depot .gros{font-size:1.15rem;filter:grayscale(1) brightness(1.6)}
.depot img{max-width:100%;max-height:14rem;border-radius:8px}
.depot .refaire{font-size:.72rem;color:var(--tx2);text-decoration:underline;margin-top:.3rem}
/* Choix dans la photothèque */
.phbarre{display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem}
.phbarre .phinfo{font-size:.74rem;color:var(--tx2);margin-left:auto;white-space:nowrap}
.phbarre #ph-q{flex:1 1 auto;min-width:6rem;max-width:22rem;font:inherit;color:var(--tx);
  background:#0f1724;border:1px solid #2b3444;border-radius:8px;padding:.34rem .55rem}
.phbarre #ph-q:focus{outline:none;border-color:#c9a97e}
/* ⚠ 7rem, pas 5,5 : la vignette porte desormais une coche et des pastilles.
   A l ancienne largeur, le nom passait dessous et devenait illisible. */
/* ⚠⚠ align-content:start, ET C EST UN CORRECTIF, PAS UNE FINITION. Une grille
   dont le conteneur est plus haut que son contenu ETIRE ses rangees pour combler
   le vide : avec deux photos, les deux vignettes devenaient des boites de trois
   cents pixels de haut, presque vides sous le nom. Le min-height pose avec le
   passage en plein ecran a rendu le defaut visible tout de suite. Signale en
   capture le 2026-08-19.
   ⚠ La vignette passe a 7rem : l ecran est desormais plein, et c est ici qu on
   choisit CE QU ON VA PAYER — a 4,6rem, une robe entiere tenait dans un timbre. */
.phgrille{display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:.5rem;
  align-content:start;
  max-height:calc(100vh - 18rem);min-height:14rem;overflow-y:auto;padding-right:.2rem}
.phgrille::-webkit-scrollbar{width:8px}
.phgrille::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.phvig{background:#0f1724;border:1px solid #2b3444;border-radius:8px;overflow:hidden;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;transition:border-color .12s}
.phvig:hover{border-color:#c9a97e}
/* object-fit:contain : une photo COUCHEE garde ses proportions et se centre dans
   la boite, elle ne s etale pas pour la remplir. */
.phvig img{width:100%;height:7rem;object-fit:contain;background:#0b1220}
.phvig .attente{font-size:.68rem;color:var(--tx3);padding:1.6rem .3rem}
.phvig .phnom{font-size:.64rem;color:var(--tx2);padding:.15rem .25rem;max-width:100%;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* ── Explorateur : filtres, panier de selection, coches et pastilles ─────── */
.phfiltres{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin-bottom:.45rem}
.jeton{font:inherit;font-size:.73rem;padding:.16rem .55rem;border-radius:99px;cursor:pointer;
  color:var(--tx-bleute);background:var(--v05);border:1px solid var(--v16)}
.jeton:hover:not(:disabled){background:var(--v11);border-color:var(--v30)}
.jeton:disabled{opacity:.4;cursor:default}
.jeton.on{background:rgba(201,169,126,.2);border-color:#c9a97e;color:var(--tx-creme);font-weight:600}
.jeton.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-creme2);font-weight:600}
.phfiltres select{font:inherit;font-size:.73rem;color:var(--tx-bleute);background:#0f1724;
  border:1px solid var(--v16);border-radius:8px;padding:.14rem .4rem;
  width:auto;max-width:15rem;flex:0 1 auto}
.phsel{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.45rem;
  padding:.35rem .5rem;border-radius:9px;background:var(--v03);
  border:1px solid var(--v08)}
.phsel .cpt{font-size:.76rem;color:var(--tx2)}
.phsel .cpt.on{color:var(--tx-creme);font-weight:700}
.phsel .droite{margin-left:auto;display:flex;align-items:center;gap:.4rem}
.phsel .aide{font-size:.72rem;color:var(--tx2)}
.phvig{position:relative}
.phvig.pris{border-color:#c9a97e;box-shadow:0 0 0 1px #c9a97e inset}
.phcoche{position:absolute;top:.2rem;left:.2rem;width:1.05rem;height:1.05rem;z-index:2;
  border-radius:5px;border:1px solid var(--v30);background:rgba(8,12,20,.7);
  display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#17202c}
.phvig.pris .phcoche{background:#c9a97e;border-color:#c9a97e;font-weight:700}
.phpast{position:absolute;top:.2rem;right:.2rem;z-index:2;display:flex;gap:.12rem}
.phpast .pt{font-size:.6rem;line-height:1;padding:.12rem .22rem;border-radius:4px;
  background:rgba(8,12,20,.75);color:var(--tx2)}
.phpast .pt.fait{color:var(--tx-ok)}
/* Le panier venu de l explorateur : ce qu on s apprete a traiter. */
.panier{margin-top:.55rem;padding:.5rem .6rem;border-radius:10px;
  background:rgba(201,169,126,.1);border:1px solid rgba(201,169,126,.35)}
.panier .pt{display:flex;align-items:center;gap:.4rem;font-size:.8rem;margin-bottom:.4rem}
.panier .pt .dt{color:var(--tx2);font-size:.74rem}
.panier .pt button{margin-left:auto}
.panier .pv{display:flex;gap:.25rem;align-items:center;flex-wrap:wrap;margin-bottom:.45rem}
.panier .pv img{width:2.2rem;height:2.2rem;object-fit:contain;border-radius:5px;background:#0b1220}
.panier .pv .tr{width:2.2rem;height:2.2rem;border-radius:5px;background:var(--v05)}
.panier .pv .pl{font-size:.72rem;color:var(--tx2)}
.panier button.prim{width:100%}
/* ── Suivi des lots ──────────────────────────────────────────────────────── */
.lots{display:flex;flex-direction:column;gap:.5rem;max-height:calc(100vh - 14rem);overflow-y:auto}
.lotc{background:#111a29;border:1px solid var(--v08);border-radius:10px;padding:.5rem .65rem}
.lotc.vif{border-color:#c9a97e}
.lott{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap;margin-bottom:.35rem}
.lott strong{font-size:.85rem}
.lott .dt{font-size:.72rem;color:var(--tx2);margin-left:auto}
.lotc .jauge{height:.42rem;border-radius:99px;background:var(--v11);overflow:hidden}
.lotc .jauge i{display:block;height:100%;background:#c9a97e;transition:width .3s}
.lotd{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:.35rem;
  font-size:.76rem;color:var(--tx-bleute)}
.lotd .mal{color:var(--tx-err)}
.lotd .droite{margin-left:auto;display:flex;gap:.3rem;flex-wrap:wrap}
.lote{margin-top:.3rem;font-size:.71rem;color:var(--tx2);line-height:1.5}
.pill.acc{background:rgba(201,169,126,.18);color:#dcc39b}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
/* ── VOIES ET AMBIANCES ────────────────────────────────────────────────────
   ⚠⚠ ELLES ETAIENT EN FLEX SUR UNE SEULE LIGNE : le titre et sa description se
   disputaient la largeur d une tuile large d un tiers de demi-carte, et l on ne
   lisait ni l un ni l autre. La regle .tuile .txt existait pour les empiler,
   mais AUCUN des deux rendus ne posait ce conteneur — elle n a jamais servi.
   La tuile est donc une grille : l emoji tient la colonne de gauche sur deux
   rangs, le titre et la description se rangent l un SOUS l autre a droite. */
.tuiles{display:grid;grid-template-columns:1fr;gap:.4rem}
.tuile{background:#111a29;border:1px solid var(--v08);border-radius:10px;
  padding:.58rem .7rem;cursor:pointer;-webkit-user-select:none;user-select:none;
  display:grid;grid-template-columns:auto 1fr;column-gap:.65rem;row-gap:.08rem;
  align-items:center;text-align:left;transition:border-color .12s,background .12s}
.tuile:hover{border-color:rgba(201,169,126,.5)}
.tuile.on{border-color:#c9a97e;background:rgba(201,169,126,.14)}
/* ⚠ Emoji en GRIS (comme le reste de l administration), jamais en couleur. */
.tuile .em{grid-row:1/3;align-self:center;font-size:1.35rem;line-height:1;
  filter:grayscale(1) brightness(1.45);opacity:.9}
.tuile .t{grid-column:2;font-size:.85rem;font-weight:700;line-height:1.25}
.tuile .d{grid-column:2;font-size:.72rem;color:var(--tx3);line-height:1.32}
/* Les ambiances passent a deux colonnes DES QUE le volet est assez large, et
   restent sur une seule quand il ne l est pas. C est auto-fill qui en decide,
   pas un nombre de colonnes ecrit en dur. */
.amb{grid-template-columns:repeat(auto-fill,minmax(13rem,1fr))}
/* ⚠ LA GALERIE DE MANNEQUINS ET SON HABILLAGE (.mgal-info, .mgrille, .mvig et
   ses cinq enfants, .mbarre) ONT ETE RETIRES en 3.50.0, a sa demande. La galerie
   avait quitte l ecran le 2026-08-12 — remplacee par un menu deroulant, parce
   que les apercus par mannequin sortaient identiques et n aidaient pas au choix.
   Le mannequin se choisit maintenant dans .duo / .ch, juste en dessous. */
.ch{margin:.7rem 0 0}
.ch label{display:block;margin-bottom:.25rem;font-size:.76rem;color:var(--tx2)}
select{width:100%;font:inherit;color:var(--tx);background:#0f1724;border:1px solid #2b3444;
  border-radius:8px;padding:.4rem .5rem}
select:focus{outline:none;border-color:#c9a97e}
.bascule{display:flex;align-items:flex-start;gap:.55rem;font-size:.82rem;cursor:pointer;
  -webkit-user-select:none;user-select:none;margin:.2rem 0 0}
.bascule input{width:1.05rem;height:1.05rem;accent-color:#c9a97e;cursor:pointer;margin-top:.12rem;flex:0 0 auto}
.bascule .d{font-size:.72rem;color:var(--tx3);display:block;margin-top:.08rem}
/* ── RÉGLAGES AVANCÉS ─────────────────────────────────────────────────────
   ⚠ CHAQUE VOIE N ACCEPTE PAS LES MEMES REGLAGES, et le panneau ne montre que
   ce qui s applique : le relais ne pose la finition (fond decrit, ombre,
   relumiere) que sur le FANTOME et le PRODUIT A PLAT — le mannequin virtuel
   compose sa scene autrement. Une glissiere d ombre dessinee sous un mannequin
   virtuel serait un mensonge d ecran : elle serait recue et ignoree en silence. */
/* ⚠ .avbar portait le bouton << Afficher les reglages avances >>. Le panneau
   replie a disparu (3.47.0) : ses reglages sont des onglets. */
/* ⚠⚠ UNE SEULE COLONNE, ET C EST LE COEUR DE LA REFONTE DU PANNEAU. Il etait en
   DEUX colonnes serrees a l interieur d une carte deja large d une demi-page :
   des glissieres, des menus et leurs textes d aide a moins de dix caracteres de
   large. Un reglage de plus qui rentre a l ecran n est pas gagne s il rend les
   dix autres illisibles. */
.avgrille{display:flex;flex-direction:column;gap:.7rem;margin-top:.75rem}
.avgrille>*{margin:0}
.avsec{margin:.4rem 0 -.15rem;padding-top:.65rem;
  border-top:1px solid var(--v08);font:700 .72rem/1.2 system-ui;
  text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.avsec.prem{margin-top:0;padding-top:0;border-top:0}
.aidep{font-size:.71rem;color:var(--tx3);line-height:1.45;margin-top:.22rem}
.aidep.att{color:#d8b57a}
textarea{width:100%;font:inherit;font-size:.82rem;color:var(--tx);background:#0f1724;
  border:1px solid #2b3444;border-radius:8px;padding:.4rem .5rem;resize:vertical;min-height:3.2rem}
textarea:focus{outline:none;border-color:#c9a97e}
input[type=text]{width:100%;font:inherit;color:var(--tx);background:#0f1724;
  border:1px solid #2b3444;border-radius:8px;padding:.4rem .5rem}
input[type=text]:focus{outline:none;border-color:#c9a97e}
input[type=range]{width:100%;accent-color:#c9a97e;margin:.3rem 0 0;cursor:pointer}
.avlab{display:flex;align-items:baseline;gap:.4rem}
.avlab b{color:var(--tx-or);font-size:.78rem;font-variant-numeric:tabular-nums}
.avint{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:.4rem}
.avint img{width:3.4rem;height:3.4rem;object-fit:contain;background:#0b1220;border-radius:7px;
  border:1px solid var(--v11)}
/* ⚠ flex:0 1 auto, PAS 1 1 : en poussant, le nom occupait toute la largeur de la
   carte et rejetait le bouton << Choisir un fichier >> a l autre bout de l ecran,
   a plus de mille pixels de son libelle. */
.avint .nm{font-size:.76rem;color:var(--tx-bleute);min-width:0;flex:0 1 22rem;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* ── COMPARATEUR AVANT / APRÈS (lot 3a) ────────────────────────────────────
   Un rideau que l on tire sur l image : a gauche la photo de depart, a droite
   ce que le service a rendu. C est la seule facon honnete de juger un
   detourage, une relumiere ou une ombre — de tete, on ne se souvient pas de la
   couleur d origine, et l on garde une retouche qui a deplace le bleu nuit.
   ⚠ POINTER EVENTS et touch-action:none : son poste est une Surface, ecran
   tactile ET souris. Un rideau qui ne repond qu a la souris ne s ouvre pas au
   doigt (voir la regle des deux entrees). */
.cmpb{display:flex;gap:.3rem;justify-content:center;margin-bottom:.55rem}
.cmp{position:relative;display:inline-block;max-width:100%;line-height:0;
  touch-action:none;-webkit-user-select:none;user-select:none;cursor:ew-resize}
.cmp img{display:block;max-width:100%;max-height:min(56vh,31rem);border-radius:9px;
  border:1px solid var(--v11)}
/* ⚠ La couche du DESSUS est l APRES, rognee par la GAUCHE : ce qui reste
   visible a gauche est donc l avant, pose dessous. Un fond opaque, sinon un
   detourage transparent laisserait voir la photo d origine au travers — et
   l on croirait le detourage rate. */
.cmp .cb{position:absolute;inset:0;overflow:hidden;background:#0b1220;border-radius:9px;
  clip-path:inset(0 0 0 var(--x,50%))}
.cmp .cb img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;
  max-height:none;border:0;border-radius:9px}
.cmp .cpg{position:absolute;top:0;bottom:0;left:var(--x,50%);width:2px;margin-left:-1px;
  background:var(--v90);box-shadow:0 0 6px rgba(0,0,0,.6)}
.cmp .cpg:focus{outline:none}
.cmp .cpg:focus-visible .cph{box-shadow:0 0 0 3px rgba(201,169,126,.75)}
.cmp .cph{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:1.9rem;height:1.9rem;border-radius:50%;background:#c9a97e;color:#1a1208;
  display:flex;align-items:center;justify-content:center;font:700 .82rem/1 system-ui;
  border:2px solid #fff}
.cmp .cet{position:absolute;bottom:.5rem;font-size:.68rem;line-height:1;padding:.22rem .45rem;
  border-radius:5px;background:rgba(8,12,20,.72);color:var(--tx-bleute);pointer-events:none}
.cmp .cet.g{left:.5rem}
.cmp .cet.d{right:.5rem}
/* Résultat — VIDE, il occupe tout ce qui reste du volet de droite et centre son
   guide dans le creux. GARNI, il reprend la taille de son contenu.
   ⚠⚠ ET C EST UN CORRECTIF. Une boite centree (justify-content:center) dont le
   contenu est plus haut qu elle deborde des DEUX cotes a la fois : les bascules
   du rideau passaient par-dessus le recapitulatif, et les deux boutons du bas
   etaient coupes net. Le volet de droite defile deja (.scene) — c est a lui de
   defiler, pas au bloc de se comprimer. */
.res{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:15rem;text-align:center;color:var(--tx2)}
.res.garni{flex:0 0 auto;justify-content:flex-start;min-height:0}
.res img{max-width:100%;max-height:min(58vh,32rem);border-radius:9px;
  border:1px solid var(--v11)}
.res .filig{margin-top:.5rem;font-size:.74rem;color:var(--tx-jaune)}
.res .avis{margin-top:.4rem;font-size:.74rem;color:var(--tx2)}
.res .dims{font-size:.7rem;color:var(--tx3);margin-top:.2rem}
.res .dl{margin-top:.6rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.55rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:#0b1220}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v11)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
/* ⚠ L APERCU EST GRATUIT, ET C EST LE LEVIER CREDITS : la seule facon de juger
   sans depenser. Un bouton gris a cote d un bouton dore se lit comme le choix
   secondaire — exactement l inverse de ce qu on veut. */
button.gratuit{border-color:rgba(74,222,128,.42);color:#c9ead6}
button.gratuit:hover:not(:disabled){background:rgba(74,222,128,.12)}
button.conf{background:#f0a05a;border-color:#f0a05a;color:#241703;font-weight:700}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
/* ⚠ LA SURCOUCHE DU LANCEMENT DE LOT. Elle manquait — habillage ET fonction :
   ouvrirLotVoile() appelait un voile() qui n'existait nulle part, et le clic
   mourait sur un ReferenceError. Le bouton « Traiter ces N en lot… » n'a donc
   JAMAIS rien fait, par aucun des deux chemins (panier ou sélecteur). */
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.1rem;z-index:60}
.voile .boite{background:#16202f;border:1px solid var(--v11);
  border-radius:13px;padding:1rem 1.15rem;max-width:29rem;width:100%;
  max-height:88vh;overflow-y:auto;box-shadow:0 18px 46px rgba(0,0,0,.5)}
.voile h3{margin:0 0 .5rem;font:700 1.02rem/1.25 Georgia,serif}
.voile p{margin:.6rem 0 0;font-size:.79rem;line-height:1.55}
.voile input[type=text],.voile input:not([type]){width:100%;font:inherit;color:var(--tx);
  background:#0f1724;border:1px solid #2b3444;border-radius:8px;padding:.4rem .5rem}
.voile input:focus{outline:none;border-color:#c9a97e}
.rc{display:flex;align-items:flex-start;gap:.55rem;font-size:.8rem;line-height:1.5;
  cursor:pointer;-webkit-user-select:none;user-select:none;margin:.6rem 0 0}
.rc input{width:1.05rem;height:1.05rem;accent-color:#c9a97e;cursor:pointer;
  margin-top:.12rem;flex:0 0 auto}
.fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem}
@media (max-width:900px){
  .corps{flex-direction:column;overflow-y:auto}
  .rail{flex:0 0 auto;min-height:auto}
  /* Trop etroit pour une bande verticale : les onglets passent au-dessus, en
     bandeau qui se replie. Ils restent des onglets — un seul groupe s affiche. */
  .railc{flex-direction:column;min-height:auto}
  .onglets{flex:0 0 auto;flex-direction:row;flex-wrap:wrap;overflow:visible}
  .onglets .ong{width:auto}
  .onglets .oe{display:none}
  .panneau{overflow:visible;min-height:auto}
  .scene{overflow:visible}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageStudio(mode) {
  /* ⚠ IDENTIFIANT D OUVERTURE << explorateur >> : le banc ne clique pas, et le
     selecteur de photos ne s atteint qu apres un clic. Sans lui, l ECRAN QUI
     CHOISIT CE QU ON VA PAYER resterait hors de tout controle. Angle mort #32. */
  const explo = String(mode || '') === 'explorateur';
  const lotsDep = String(mode || '') === 'lots';
  // Le panneau « Réglages avancés » : replié par défaut, donc invisible au banc.
  const avOuvre = String(mode || '').indexOf('avance') === 0;
  const avPlein = String(mode || '') === 'avance-plein';
  // Le volet de droite garni : voir le commentaire au pied du script.
  const resTemoin = String(mode || '') === 'resultat';
  // Le filigrane : un seul onglet est dessine a la fois, donc invisible au banc
  // sans cet identifiant.
  const filTemoin = String(mode || '') === 'filigrane';
  // Les recettes : la barre se voit toujours, le voile d enregistrement non.
  const rcTemoin = String(mode || '') === 'recettes';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Studio virtuel — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.studio}</span><h1>Studio virtuel</h1>
  <span class="credits" id="credits"></span></div>
<div class="ro" id="ro" hidden>Lecture seule : votre rôle ne permet pas de lancer de traitement.</div>
<div class="corps plein" id="corps"><div class="carte"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button id="b-lot">⚙ Traiter en lot…</button>
  <button class="gratuit" id="b-apercu" disabled>Aperçu gratuit</button>
  <button class="prim" id="b-final" disabled>Générer en pleine qualité</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── le meme bouton d'ancrage/detachement que les autres ecrans.
     La coquille appelle szModeAncre(true) quand la vue est ANCREE, (false) quand
     elle est DETACHEE ; on montre le bon libelle et on route vers le pont. */
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
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '⧉ Détacher';
      b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '⚓ Ancrer';
      b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bApercu = document.getElementById('b-apercu');
  var bFinal = document.getElementById('b-final');
  var bLot = document.getElementById('b-lot');
  var creditsEl = document.getElementById('credits');
  var RO = false, OCCUPE = false, ARME = false;
  var PHOTO = null;      // data URL d une photo importee (fichier), reduite
  var PHOTO_ID = '';     // id d une photo CHOISIE dans la phototheque (l image reste au site)
  var PHOTO_URL = '';    // adresse de la vignette choisie (affichage seulement)
  var PHOTO_NOM = '';    // son nom, dit en tete de l etape 1
  var PICKER = false;    // le choix dans la phototheque est-il ouvert ?
  var PHOTHQ = [];       // [{id,nom,apercu,enAttente}] cumule (defilement infini)
  var PH_Q = '';         // recherche courante (nom / code)
  var PH_PAGE = 0;       // derniere page chargee
  var PH_TAILLE = 60;    // photos par page
  var PH_TOTAL = 0;      // total correspondant a la recherche
  var PH_FIN = false;    // plus rien a charger
  var PH_OCC = false;    // une page est-elle en cours de chargement ?
  // ⚠ Trois etats : tant qu il est faux, on ne dit PAS << vide >>.
  var PH_CHARGE = false;
  // ── EXPLORATEUR (#28) ──────────────────────────────────────────────────────
  var PH_FILTRES = [];   // jetons actifs (traitee, isolee, orpheline...)
  var PH_SANS = '';      // sans tel traitement precis
  var PH_LOT = '';       // lot d import
  var PH_TRI = 'recent';
  var PH_META = null;    // filtres/traitements/lots disponibles + tousLesIds
  var SEL = {};          // { <idPhoto>: true } — le panier de selection
  var PH_DEB = null;     // minuterie anti-rebond de la recherche
  var VOIE = 'humain';   // humain | fantome | plat
  var PRESET = '';       // cle d ambiance
  var PRESETS = [];      // [{cle,label,emoji,desc}]
  var RESULT = null;     // { image, essai, decorErreur, upNote, largeur, hauteur }
  /* ══ LE FILIGRANE (lot 3c) ════════════════════════════════════════════════
     ⚠⚠ LE COLLAGE N EST PAS FAIT ICI. La fenetre pourrait le faire dans son
     propre canevas, plus vite d un aller-retour — mais la geometrie serait alors
     ecrite DEUX fois, dans deux depots, et au premier ajustement de marge
     l apercu de l ecran cesserait de correspondre au resultat du lot. On appelle
     donc studio:filigraner, qui partage son code avec le moteur de lots. */
  var LOGOS = [];        // [{id,nom,image}] — les logos EN PIXELS (studio:logos)
  var FIL = { logoId: '', position: 'bd', taille: 20, opacite: 0.8, marge: 3 };
  /* Les valeurs de depart, mises de cote AVANT que quoi que ce soit y touche.
     ⚠ Elles servent a APPLIQUER une recette : voir fusionner(). Une recette
     ecrite avant l ajout d un reglage doit remettre ce reglage a son defaut, pas
     le laisser a la valeur du rendu precedent — sinon la meme recette, appliquee
     deux fois de suite, ne donne pas deux fois le meme resultat. */
  var FIL_DEF = { logoId: '', position: 'bd', taille: 20, opacite: 0.8, marge: 3 };
  var POSITIONS = [
    { cle: 'hg', t: 'En haut à gauche' },  { cle: 'hc', t: 'En haut, au centre' },
    { cle: 'hd', t: 'En haut à droite' },  { cle: 'mg', t: 'Au milieu, à gauche' },
    { cle: 'mc', t: 'Au centre' },         { cle: 'md', t: 'Au milieu, à droite' },
    { cle: 'bg', t: 'En bas à gauche' },   { cle: 'bc', t: 'En bas, au centre' },
    { cle: 'bd', t: 'En bas à droite' }
  ];
  var FORM_MODE = 'recadrer'; // formats de sortie : recadrer (on coupe) ou marges
  var FORMATS = [];      // [{cle,label,largeur,hauteur,image,ext,enreg}] deja fabriques
  var FORM_OCC = false;  // fabrication en cours
  /* Les quatre rapports demandes. ⚠ Ce sont des RAPPORTS, pas des tailles : on ne
     redimensionne jamais vers le haut. Un 9:16 tire d une photo carree serait une
     image inventee sur les cotes — on la borde, ou on coupe, jamais on n agrandit. */
  var RATIOS = [
    { cle: '3x4',  t: '3:4',  v: 3 / 4 },
    { cle: '1x1',  t: '1:1',  v: 1 },
    { cle: '4x5',  t: '4:5',  v: 4 / 5 },
    { cle: '9x16', t: '9:16', v: 9 / 16 }
  ];
  var CMP = true;        // volet de droite : rideau avant/apres, ou resultat seul
  var CMP_POS = 50;      // position du rideau, en pour-cent
  var RES_TEMOIN = false;// mode de controle : poser un resultat inerte (voir plus bas)
  var ENREG = false;     // le resultat a-t-il ete enregistre dans la phototheque ?
  var MODELE_SEL = 'sophia'; // modele choisi (persiste entre les rendus)
  /* ⚠ LES ETATS DE LA GALERIE DE MANNEQUINS (APM, APM_SIG, COMPARE_STOP,
     PORTRAITS, PORT_OCC, PORT_STOP) ONT ETE RETIRES en 3.50.0, a sa demande. La
     galerie avait disparu de l ecran le 2026-08-12 ; son moteur est parti avec.
     Les seize images de R2 sont effacees par un menage unique cote site
     (_purgerPortraits dans pont.js). */
  var VOIES = [
    { cle: 'humain',  em: '👗', t: 'Mannequin virtuel', d: 'Porté par un modèle, décor intégré' },
    { cle: 'fantome', em: '👻', t: 'Fantôme habillé',   d: 'Sans mannequin, décor pro ajouté' },
    { cle: 'plat',    em: '📦', t: 'Produit à plat',    d: 'Détourage + décor + ombre' }
  ];
  /* Les 16 modeles REELS de Photoroom (virtualModel.model.preset.name, verifies
     dans la doc 2026-08-11). Sophia en tete = choix par defaut.
     ⚠ Photoroom ne publie l apparence d AUCUN de ses mannequins, et il n y a
     plus de galerie pour la montrer : on avait fabrique seize portraits pour ca,
     ils sortaient identiques et n aidaient pas au choix (retires le 2026-08-12).
     Le nom suffit, et l apercu du vrai vetement est gratuit. */
  var MODELES = ['sophia','emma','ava','zoe','maya','lena','julia','fiona',
                 'avery','taylor','kendall','casey','sam','jordan','jackson','reece'];

  /* LES POSES — les douze valeurs officielles de Photoroom (verifiees dans la
     documentation le 2026-08-11). ⚠ ELLE ETAIT FIXEE EN DUR au trois-quarts
     cote serveur : le choix appartenait au code, pas a la personne qui regarde
     le resultat — et il a ete refuse des le premier essai (<< je n aime pas
     cette pose >>). Le trois-quarts reste le DEFAUT (il montre la coupe et le
     tombe mieux qu une pose de face), mais il se change maintenant d un clic,
     et l apercu est gratuit : on juge sur piece sans depenser un credit. */
  var POSES = [
    { cle: '34turn',           t: 'Trois-quarts (défaut)' },
    { cle: 'standing',         t: 'Debout, de face' },
    { cle: 'powerstance',      t: 'Posture affirmée' },
    { cle: 'walkingforward',   t: 'En marche' },
    { cle: 'handinpocket',     t: 'Main dans la poche' },
    { cle: 'crossedarms',      t: 'Bras croisés' },
    { cle: 'overtheshoulder',  t: 'Regard par-dessus l’épaule' },
    { cle: 'back',             t: 'De dos' },
    { cle: 'seated',           t: 'Assise' },
    { cle: 'adjustingclothing',t: 'Ajuste son vêtement' },
    { cle: 'playfulspin',      t: 'Tourne sur elle-même' },
    { cle: 'random',           t: 'Au hasard' }
  ];
  var POSE_SEL = '34turn';

  /* ══ LES RÉGLAGES AVANCÉS (lot 1 du #29) ═══════════════════════════════════
     Le relais accepte HUIT capacités que cette fenêtre ne demandait jamais :
     elles étaient écrites, testées, facturables — et injoignables. Le panneau
     les expose enfin.

     ⚠⚠ IL NE MONTRE QUE CE QUE LA VOIE ACCEPTE. Le relais ne pose « finition »
     (fond décrit, ombre, relumière) que sur le FANTÔME — en un second appel —
     et sur le PRODUIT À PLAT, en un appel unique. Le mannequin virtuel, lui,
     compose sa scène par « options » (décor, pose, modèle, expression,
     précisions). Un réglage montré dans la mauvaise voie serait transmis,
     ignoré en silence, et l’on chercherait la panne dans le résultat.

     ⚠ L AGRANDISSEMENT est la seule exception : le relais l’applique en dernier,
     sur l’image sortie, quelle que soit la voie. */
  var AV = {
    // Mannequin virtuel (options)
    decor: '',            // vide = le décor de l ambiance
    sourire: true,
    extra: '',
    // Fantôme et produit à plat (finition)
    fondPrompt: '', fondNegatif: '', fondGraine: '',
    ombreActive: false, ombreIntensite: 0.4, ombreDouceur: 0.7,
    ombreEtendue: 'medium', ombreDirection: 'front', ombrePose: 'upright',
    lumiere: '',
    // Toutes les voies
    upActive: false, upMode: 'ai.fast'
  };
  // Les valeurs de depart des reglages avances — meme role que FIL_DEF.
  var AV_DEF = {
    decor: '', sourire: true, extra: '',
    fondPrompt: '', fondNegatif: '', fondGraine: '',
    ombreActive: false, ombreIntensite: 0.4, ombreDouceur: 0.7,
    ombreEtendue: 'medium', ombreDirection: 'front', ombrePose: 'upright',
    lumiere: '',
    upActive: false, upMode: 'ai.fast'
  };
  /* La SECONDE prise de vue — le vêtement retourné. ⚠ FANTÔME SEULEMENT : le
     relais ne lit « interieur » que pour ce geste, et l ignore ailleurs. */
  var INTERIEUR = null, INTERIEUR_NOM = '';

  /* Les 23 décors réels du mannequin virtuel (virtualModel.scene.preset.name,
     liste fermée côté Photoroom). ⚠ Un nom hors liste est refusé par le service :
     on ne propose que ceux-là, jamais un champ libre. */
  var DECORS = [
    { cle: 'studio',           t: 'Studio' },
    { cle: 'coloredstudio',    t: 'Studio coloré' },
    { cle: 'concretestudio',   t: 'Studio béton' },
    { cle: 'street',           t: 'Rue' },
    { cle: 'businessdistrict', t: 'Quartier des affaires' },
    { cle: 'latincity',        t: 'Ville latine' },
    { cle: 'asiancity',        t: 'Ville asiatique' },
    { cle: 'nightlights',      t: 'Lumières de nuit' },
    { cle: 'cafe',             t: 'Café' },
    { cle: 'library',          t: 'Bibliothèque' },
    { cle: 'bedroom',          t: 'Chambre' },
    { cle: 'factory',          t: 'Usine' },
    { cle: 'beach',            t: 'Plage' },
    { cle: 'pool',             t: 'Piscine' },
    { cle: 'tropical',         t: 'Tropical' },
    { cle: 'forest',           t: 'Forêt' },
    { cle: 'flowers',          t: 'Fleurs' },
    { cle: 'countryside',      t: 'Campagne' },
    { cle: 'mountain',         t: 'Montagne' },
    { cle: 'desert',           t: 'Désert' },
    { cle: 'sunset',           t: 'Coucher de soleil' },
    { cle: 'goldenlight',      t: 'Lumière dorée' },
    { cle: 'random',           t: 'Au hasard' }
  ];
  /* Direction de la lumière (donc de l ombre). ⚠ Le relais attend ces mots
     EXACTS (il les remet en camelCase lui-même) ou un angle. */
  var OMBRE_DIRS = [
    { cle: 'front',       t: 'De face' },
    { cle: 'frontleft',   t: 'Devant, à gauche' },
    { cle: 'frontright',  t: 'Devant, à droite' },
    { cle: 'left',        t: 'À gauche' },
    { cle: 'right',       t: 'À droite' },
    { cle: 'behind',      t: 'Derrière le sujet' },
    { cle: 'behindleft',  t: 'Derrière, à gauche' },
    { cle: 'behindright', t: 'Derrière, à droite' }
  ];
  var OMBRE_ETENDUES = [
    { cle: 'short',  t: 'Courte — collée au vêtement' },
    { cle: 'medium', t: 'Moyenne' },
    { cle: 'long',   t: 'Longue — lumière basse' }
  ];
  /* Les trois modes de relumière du service. ⚠ « Préserver la teinte » est le
     seul vraiment sûr pour un vêtement : c est la couleur qu on vend. */
  var LUMIERES = [
    { cle: '', t: 'Celle de l’ambiance' },
    { cle: 'ai.preserve-hue-and-saturation', t: 'Préserver la teinte (recommandé)' },
    { cle: 'ai.auto', t: 'Automatique — peut déplacer les couleurs' },
    { cle: 'ai.optimize-portrait', t: 'Optimiser un portrait — s’il y a un visage' }
  ];

  // Une image d un pixel, transparente : le porteur du mode de contrôle.
  var PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès au traitement d’image.',
    photo_absente:      'Importez d’abord une photo.',
    non_configure:      'Aucune clé Photoroom configurée (Configuration ▸ Clés API).',
    indisponible:       'Le service n’est pas prêt dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    module_photos:      'La photothèque n’a pas pu être chargée. Rechargez (Ctrl+R) ; si cela revient, reconnectez-vous.',
    version_coquille:   'Cette version de l’application ne sait pas encore ouvrir cet écran.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').'))
      + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  // Réduction locale avant l envoi : un cliché de téléphone pèserait plusieurs Mo
  // sur le pont. 3000 px sur le grand côté suffit (Photoroom rend 1K a 4K), et le
  // fond studio étant opaque, le JPEG ne coûte aucune transparence.
  function reduire(dataUrl, cb){
    try {
      var im = new Image();
      im.onload = function(){
        try {
          var max = 3000, w = im.naturalWidth, h = im.naturalHeight;
          var ech = Math.min(1, max / Math.max(w, h));
          var cw = Math.max(1, Math.round(w * ech)), chh = Math.max(1, Math.round(h * ech));
          var c = document.createElement('canvas'); c.width = cw; c.height = chh;
          c.getContext('2d').drawImage(im, 0, 0, cw, chh);
          cb(c.toDataURL('image/jpeg', 0.92));
        } catch (e) { cb(dataUrl); }
      };
      im.onerror = function(){ cb(dataUrl); };
      im.src = dataUrl;
    } catch (e) { cb(dataUrl); }
  }

  /* ⚠ UNE SEULE VERITE SUR L ETAT << pret a lancer >>, lue par le pied de page
     ET par le guide du volet de droite. Elle inclut desormais le selecteur et le
     suivi des lots : quand ils occupent tout l ecran, le volet du resultat
     n existe plus, et une image generee la n aurait nulle part ou s afficher. */
  function pretALancer(){
    return aUnePhoto() && !!PRESET && !RO && !PICKER && !LOTS_VUE;
  }

  function majBoutons(){
    var pret = pretALancer() && !OCCUPE;
    bApercu.disabled = !pret;
    bFinal.disabled = !pret;
    /* ⚠ LE LANCEUR DE LOT NE SUIT PAS LA MEME REGLE, et c est voulu : un lot ne
       part pas de la photo ouverte a l ecran mais de photos choisies dans la
       photothèque. L exiger prete a l ecran priverait du lot celui qui n a
       justement pas ouvert de photo — le cas le plus courant. */
    if (bLot) bLot.disabled = RO || OCCUPE;
    if (!pret && ARME) { ARME = false; bFinal.className = 'prim'; bFinal.textContent = 'Générer en pleine qualité'; }
  }

  function aUnePhoto(){ return !!PHOTO || !!PHOTO_ID; }

  /* ══ LE SUIVI DES LOTS ════════════════════════════════════════════════════
     Sa demande : voir << lot xxxxx — photo 15 sur 500 >>, pouvoir arreter,
     mettre en pause, reprendre LA OU C ETAIT RENDU, en placer plusieurs en
     file, et donner une priorite.

     ⚠ ARRETER N EFFACE RIEN : ce qui est fait reste fait, et le reste est
     repris tel quel si l on change d avis. Seul << Retirer >> efface le lot de
     la liste — et il refuse tant que le lot tourne. */
  var LOTS = null, LOTS_VUE = false, LOTS_T = null;

  var LOT_ETATS = { file: 'En file', encours: 'En cours', pause: 'En pause',
    fini: 'Terminé', arrete: 'Arrêté' };

  function lotsHtml(){
    if (!LOTS) return '<div class="vide">Lecture des traitements…</div>';
    var l = LOTS.lots || [];
    if (!l.length) {
      return '<div class="vide">Aucun traitement. Choisissez des photos depuis la '
        + 'photothèque, puis « Traiter en lot ».</div>';
    }
    return l.map(function(x){
      var fait = x.faits + x.echecs;
      var pct = x.total ? Math.round((fait / x.total) * 100) : 0;
      var g = '';
      if (LOTS.peutModifier) {
        if (x.etat === 'encours' || x.etat === 'file') {
          g += '<button class="jeton" data-lot="' + esc(x.id) + '" data-geste="pause">⏸ Pause</button>';
          g += '<button class="jeton" data-lot="' + esc(x.id) + '" data-geste="arreter">⏹ Arrêter</button>';
        }
        if ((x.etat === 'pause' || x.etat === 'arrete') && x.restants) {
          g += '<button class="jeton prim" data-lot="' + esc(x.id) + '" data-geste="reprendre">▶ Reprendre</button>';
        }
        if (x.etat === 'encours' || x.etat === 'file' || x.etat === 'pause') {
          g += '<button class="jeton' + (x.priorite ? ' on' : '') + '" data-lot="' + esc(x.id)
            + '" data-geste="priorite" data-val="' + (x.priorite ? '0' : '1') + '">'
            + (x.priorite ? '★ Prioritaire' : '☆ Prioriser') + '</button>';
        }
        if (x.etat !== 'encours') {
          g += '<button class="jeton" data-lot="' + esc(x.id) + '" data-geste="retirer">✕ Retirer</button>';
        }
      }
      return '<div class="lotc' + (x.etat === 'encours' ? ' vif' : '') + '">'
        + '<div class="lott"><strong>' + esc(x.nom) + '</strong>'
        + '<span class="pill ' + (x.etat === 'fini' ? 'bon' : x.etat === 'encours' ? 'acc'
            : x.etat === 'arrete' ? 'err' : 'neutre') + '">' + (LOT_ETATS[x.etat] || x.etat) + '</span>'
        + (x.priorite ? '<span class="pill acc">★ Priorité</span>' : '')
        + '<span class="dt">' + esc(x.quoiLibelle) + '</span></div>'
        + '<div class="jauge"><i style="width:' + pct + '%"></i></div>'
        + '<div class="lotd">'
        // ⚠ << photo 15 sur 500 >>, et QUELLE photo : sans le nom, un lot bloque
        // sur une image abimee ne se diagnostique pas.
        + '<span>' + (x.etat === 'encours' && x.courant
            ? ('Photo ' + (fait + 1) + ' sur ' + x.total + ' — ' + esc(x.courant.nom))
            : (fait + ' sur ' + x.total)) + '</span>'
        + (x.echecs ? '<span class="mal">' + x.echecs + ' échec' + (x.echecs > 1 ? 's' : '') + '</span>' : '')
        + '<span class="droite">' + g + '</span></div>'
        + (x.echecs && x.detailEchecs.length
            ? '<div class="lote">' + x.detailEchecs.map(function(e){
                return esc(e.nom) + ' : ' + esc(String(e.detail).slice(0, 80)); }).join(' · ') + '</div>'
            : '')
        /* ⚠⚠ << EN PAUSE >> SANS RAISON SE LIT COMME UN ARRET QU ON AURAIT
           DEMANDE. Quand c est le plafond de depense qui a arrete la file, il faut
           le DIRE : la personne cherchera sinon une panne, et surtout elle
           cliquera << Reprendre >> en boucle sur un mur qui ne bougera pas tant
           que le plafond n aura pas ete releve. Les photos restantes n ont ete ni
           traitees ni facturees — elles attendent, elles ne sont pas perdues. */
        + (x.motifPause
            ? '<div class="lote" style="color:#d8b57a">⏸ Mis en pause : ' + esc(x.motifPause) + '</div>'
            : '')
        + '</div>';
    }).join('');
  }

  function chargerLots(){
    appeler('lots:etat', []).then(function(r){
      if (!r || !r.ok) return;
      LOTS = r;
      if (LOTS_VUE) dessiner();
    });
  }

  function lotsSuivre(){
    if (LOTS_T) return;
    chargerLots();
    LOTS_T = setInterval(function(){ if (LOTS_VUE && !document.hidden) chargerLots(); }, 2000);
  }
  window.addEventListener('pagehide', function(){ if (LOTS_T) { clearInterval(LOTS_T); LOTS_T = null; } });

  function brancherLots(){
    corps.querySelectorAll('[data-lot]').forEach(function(el){
      el.onclick = function(){
        el.disabled = true;
        appeler('lots:agir', [el.getAttribute('data-lot'), el.getAttribute('data-geste'),
          el.getAttribute('data-val')]).then(function(r){
          if (!r.ok) { el.disabled = false; dire(expliquer(r), 'err'); return; }
          chargerLots();
        });
      };
    });
    var f = document.getElementById('lots-fermer');
    if (f) f.onclick = function(){ LOTS_VUE = false; dessiner(); };
  }

  /* ══ LE PANIER VENU DE L EXPLORATEUR (#32) ═══════════════════════════════
     Sa demande : << la selection doit etre ramenee au studio virtuel, et l on
     execute le lot a cet endroit >>. L explorateur CHOISIT, le Studio DECIDE —
     c est ici qu on voit la voie, l ambiance et le modele, donc ici que le
     choix du traitement a du sens.
     ⚠ ON SONDE, on ne recoit pas : deux fenetres natives ne peuvent pas se
     parler. Le panier vit dans la page, les deux le lisent. */
  var PANIER = [];
  function panierHtml(){
    if (!PANIER.length) return '';
    var n = PANIER.length;
    return '<div class="panier"><div class="pt">'
      + '<strong>' + n + ' photo' + (n > 1 ? 's' : '') + '</strong> '
      + '<span class="dt">venue' + (n > 1 ? 's' : '') + ' de l’explorateur</span>'
      + '<button class="mini" id="pn-vider" title="Oublier cette sélection">✕</button></div>'
      + '<div class="pv">' + PANIER.slice(0, 8).map(function(p){
          return p.apercu ? '<img src="' + esc(p.apercu) + '" alt="" loading="lazy">'
                          : '<span class="tr"></span>'; }).join('')
      + (n > 8 ? '<span class="pl">+' + (n - 8) + '</span>' : '') + '</div>'
      + '<button class="prim" id="pn-lot">⚙ Traiter ' + (n > 1 ? ('ces ' + n) : 'cette photo') + ' en lot…</button>'
      + '</div>';
  }

  function chargerPanier(){
    appeler('panier:lire', []).then(function(r){
      if (!r || !r.ok) return;
      var avant = PANIER.length;
      PANIER = r.photos || [];
      // On ne redessine que si ca a change : sinon on redessinerait toutes les
      // deux secondes sous les doigts de quelqu un.
      if (PANIER.length !== avant && !PICKER && !LOTS_VUE) dessiner();
    });
  }

  /* ══ L ETAPE 1, DANS LE VOLET DE GAUCHE ═══════════════════════════════════
     ⚠ ELLE NE CONTIENT PLUS NI LE SELECTEUR NI LE SUIVI DES LOTS. Ces deux-la
     sont partis en plein ecran (pleinHtml) : une grille de plusieurs centaines
     de vignettes et une file de lots n ont jamais eu leur place dans une carte
     large d une demi-page — c est cet entassement qu on retire. */
  function photoHtml(){
    var h = '';
    if (aUnePhoto()) {
      // Une photo est déjà choisie (fichier OU photothèque) : on la montre.
      var apercu = PHOTO || PHOTO_URL;
      h += '<div class="depot" id="depot">'
        + (apercu ? '<img src="' + apercu + '" alt="photo">'
                  : '<span class="gros">🖼️</span><span>Photo de la photothèque sélectionnée</span>')
        + '<span class="refaire">Choisir une autre photo</span></div>';
    } else {
      h += '<div class="depot" id="depot"><span class="gros">📷</span>'
        + '<span>Glissez une photo ici, ou cliquez pour en choisir une</span>'
        + '<span class="pt2">Studio, fond blanc, un vêtement — JPEG ou PNG</span></div>';
    }
    h += '<input type="file" id="fichier" accept="image/*" hidden><div class="pbtn">';
    if (!aUnePhoto()) {
      h += '<button id="ph-ouvrir"><span class="ic">📚</span> Depuis la photothèque</button>'
        // ⚠ L EXPLORATEUR EST DANS SA PROPRE FENETRE (#32) : le selecteur
        // ci-contre reste pour prendre UNE photo vite fait, l explorateur sert a
        // en choisir des centaines — il lui faut de la place et un apercu.
        + '<button id="ph-explorateur" title="Parcourir la photothèque en grand, avec aperçu">'
        + '<span class="ic">🗂️</span> Explorateur…</button>';
    }
    /* ⚠ LE SUIVI RESTE JOIGNABLE UNE FOIS LA PHOTO CHOISIE, et c est nouveau :
       avant, le bouton disparaissait avec le bloc de depart, si bien qu un lot
       lance puis une photo prise a l ecran rendait la file introuvable sans
       tout reinitialiser. */
    h += '<button id="lots-voir">⚙ Traitements'
      + ((LOTS && LOTS.lots && LOTS.lots.length) ? ' (' + LOTS.lots.length + ')' : '')
      + '</button></div>' + panierHtml();
    return h;
  }

  /* ══ LES DEUX ECRANS PLEIN LARGEUR ════════════════════════════════════════
     Le selecteur de photos (recherche, filtres, panier, grille chargee par
     pages) et le suivi des lots. Ce sont des ecrans, pas des encarts. */
  function pleinHtml(){
    if (LOTS_VUE) {
      return '<div class="phbarre"><button id="lots-fermer">← Retour</button>'
        + '<span class="phinfo">Traitements par lot</span></div>'
        + '<div class="lots">' + lotsHtml() + '</div>';
    }
    var grille = '<div class="phgrille" id="ph-grille">' + phVignettesHtml() + '</div>';
    return '<div class="phbarre"><button id="ph-retour">← Retour</button>'
      + '<input type="search" id="ph-q" placeholder="Rechercher (nom, code, produit, SKU)…" value="' + esc(PH_Q) + '"'
      + (RO ? ' disabled' : '') + '>'
      + '<span class="phinfo" id="ph-info"></span></div>'
      + phFiltresHtml() + phSelectionHtml() + grille;
  }

  function voiesHtml(){
    return VOIES.map(function(v){
      return '<div class="tuile' + (VOIE === v.cle ? ' on' : '') + '" data-voie="' + v.cle + '">'
        + '<span class="em">' + v.em + '</span><span class="t">' + esc(v.t) + '</span>'
        + '<span class="d">' + esc(v.d) + '</span></div>';
    }).join('');
  }

  function nomModele(m){ return m.charAt(0).toUpperCase() + m.slice(1); }
  function nomPose(p){
    var x = POSES.filter(function(o){ return o.cle === p; })[0];
    return x ? x.t.replace(' (défaut)', '') : p;
  }
  function modeleHtml(){
    if (VOIE !== 'humain') return '';
    // ⚠ Retour au MENU DÉROULANT (demande du 2026-08-12) : la galerie de vignettes
    // est retirée. Les aperçus par mannequin sortaient identiques et n'aidaient pas
    // au choix ; le nom suffit. Le modèle et la pose se choisissent dans deux listes.
    // Deux menus courts : cote a cote quand la place le permet, empiles sinon.
    var h = '<div class="duo"><div class="ch"><label for="modele-sel">Modèle</label>'
      + '<select id="modele-sel"' + (RO ? ' disabled' : '') + '>'
      + MODELES.map(function(m){ return '<option value="' + esc(m) + '"'
          + (MODELE_SEL === m ? ' selected' : '') + '>' + esc(nomModele(m)) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="pose">Pose</label>'
      + '<select id="pose"' + (RO ? ' disabled' : '') + '>'
      + POSES.map(function(p){ return '<option value="' + p.cle + '"'
          + (POSE_SEL === p.cle ? ' selected' : '') + '>' + esc(p.t) + '</option>'; }).join('')
      + '</select></div></div>'
      + '<div class="aidep">L’aperçu est gratuit : essayez plusieurs mannequins et plusieurs '
      + 'poses avant de dépenser un crédit.</div>';
    return h;
  }
  function ambiancesHtml(){
    if (!PRESETS.length) return '<div class="vide">Aucune ambiance.</div>';
    return '<div class="tuiles amb">' + PRESETS.map(function(p){
      return '<div class="tuile' + (PRESET === p.cle ? ' on' : '') + '" data-preset="' + esc(p.cle) + '">'
        + '<span class="em">' + (p.emoji || '🎨') + '</span><span class="t">' + esc(p.label) + '</span>'
        + '<span class="d">' + esc(p.desc || '') + '</span></div>';
    }).join('') + '</div>';
  }

  /* ══ CE QUE LA VOIE ACCEPTE VRAIMENT ══════════════════════════════════════
     Trois destinations distinctes dans le corps de la requête, et elles ne
     s ouvrent pas aux mêmes voies :
       finitionPour  → « finition » (À LA RACINE du corps) : fantôme et à plat ;
       optionsPour   → « options » : mannequin virtuel ;
       l intérieur   → « interieur » : fantôme seul.
     ⚠⚠ ELLES PRENNENT LA VOIE EN PARAMÈTRE, PAS L ÉTAT DE L ÉCRAN. Un lot
     choisit son traitement dans son propre sélecteur : il peut demander un
     fantôme alors que l écran montre un mannequin virtuel, et l on n emporte
     alors que ce qui s applique là-bas. */
  function estVoie(v){ return v === 'humain' || v === 'fantome' || v === 'plat'; }

  function finitionPour(voie){
    if (!estVoie(voie)) return null;
    var f = {};
    if (voie === 'fantome' || voie === 'plat') {
      var p = String(AV.fondPrompt || '').trim();
      if (p) {
        f.fond = { prompt: p };
        var n = String(AV.fondNegatif || '').trim();
        if (n) f.fond.negatif = n;
        var g = String(AV.fondGraine == null ? '' : AV.fondGraine).trim();
        if (g !== '' && isFinite(Number(g))) f.fond.seed = Math.abs(Math.round(Number(g)));
      }
      /* ⚠ COCHÉE, ELLE PREND TOUT. Le relais ne pose l ombre de l ambiance que
         si « ombre.active » est absente : dès qu on règle soi-même, ce sont ces
         valeurs-ci qui s appliquent, pas un mélange des deux. Le panneau le dit. */
      if (AV.ombreActive) {
        f.ombre = { active: true, intensite: AV.ombreIntensite, douceur: AV.ombreDouceur,
                    etendue: AV.ombreEtendue, direction: AV.ombreDirection,
                    poseSujet: AV.ombrePose };
      }
      if (AV.lumiere) f.lumiere = { mode: AV.lumiere };
    }
    // ⚠ L AGRANDISSEMENT EST LA SEULE EXCEPTION : le relais l applique en
    // dernier, sur l image déjà produite, quelle que soit la voie.
    if (AV.upActive) f.upscale = { active: true, mode: AV.upMode };
    return Object.keys(f).length ? f : null;
  }

  function optionsPour(voie){
    var o = {};
    if (voie !== 'humain') return o;
    o.modele = MODELE_SEL || 'sophia';
    o.pose = POSE_SEL;
    var d = String(AV.decor || '').trim();
    if (d) o.decor = d;
    /* ⚠ ON L ENVOIE TOUJOURS, MÊME QUAND C EST LE DÉFAUT. Côté relais,
       « sourire » ABSENT vaut sourire : ne le poser que pour le refuser
       marcherait, mais l intention resterait implicite — et c est exactement ce
       genre d implicite qui a laissé les lots partir en réglages d usine. */
    o.sourire = AV.sourire ? 1 : 0;
    var e = String(AV.extra || '').trim();
    if (e) o.extra = e;
    return o;
  }

  function nomDecor(c){
    var x = DECORS.filter(function(o){ return o.cle === c; })[0];
    return x ? x.t : c;
  }
  /* Résumé court des réglages avancés RÉELLEMENT emportés par une voie donnée. */
  function resumeAvance(voie){
    if (!estVoie(voie)) return '';
    var b = [];
    if (voie === 'humain') {
      if (AV.decor) b.push('décor ' + nomDecor(AV.decor));
      if (!AV.sourire) b.push('expression neutre');
      if (String(AV.extra || '').trim()) b.push('précisions libres');
    } else {
      if (String(AV.fondPrompt || '').trim()) b.push('décor décrit');
      if (AV.ombreActive) b.push('ombre réglée');
      if (AV.lumiere) b.push('relumière');
      if (voie === 'fantome' && INTERIEUR) b.push('photo d’intérieur');
    }
    if (AV.upActive) b.push('agrandissement ×4');
    return b.join(' · ');
  }

  /* ══ LE PANNEAU ═══════════════════════════════════════════════════════════ */
  function chSel(id, lab, liste, val, aide){
    return '<div class="ch"><label for="' + id + '">' + lab + '</label>'
      + '<select id="' + id + '"' + (RO ? ' disabled' : '') + '>'
      + liste.map(function(o){ return '<option value="' + esc(o.cle) + '"'
          + (String(val) === String(o.cle) ? ' selected' : '') + '>' + esc(o.t) + '</option>'; }).join('')
      + '</select>' + (aide ? '<div class="aidep">' + aide + '</div>' : '') + '</div>';
  }
  function chRange(id, lab, val){
    return '<div class="ch"><label class="avlab" for="' + id + '">' + lab
      + ' <b id="' + id + '-v">' + Number(val).toFixed(2) + '</b></label>'
      + '<input type="range" id="' + id + '" min="0" max="1" step="0.05" value="' + Number(val)
      + '"' + (RO ? ' disabled' : '') + '></div>';
  }

  /* ══ LES GROUPES DE RÉGLAGES (lot 3g du #29) ═══════════════════════════════
     Sa demande, mot pour mot : << au lieu d avoir une scroll bar, des onglets
     orientes vers la gauche, professionnels, de style regroupement, et n
     afficher que ces options >>.

     ⚠⚠ LE PANNEAU << RÉGLAGES AVANCÉS >> N EXISTE PLUS COMME PANNEAU, et c est
     un gain, pas une perte : replie par defaut, il cachait huit capacites
     FACTURABLES derriere un clic que personne ne donnait. Ses reglages sont
     maintenant des onglets a part entiere — Decor, Ombres, Lumiere, Interieur,
     Agrandissement — donc visibles sans rien deplier, et eprouves par le banc
     sans identifiant d ouverture special.

     ⚠ LA REGLE DES VOIES NE CHANGE PAS, elle change seulement de support : un
     groupe ne parait que si la voie l accepte. Le relais ne pose la finition
     (fond decrit, ombre, relumiere) que sur le FANTOME et le PRODUIT A PLAT ; le
     mannequin virtuel compose sa scene par << options >>. Un onglet << Ombres >>
     sous un mannequin virtuel serait un mensonge d ecran : le reglage partirait,
     serait ignore en silence, et l on chercherait la panne dans un resultat
     qu on a paye.                                                            */
  function avDecorHtml(){
    var h = [];
    if (VOIE === 'humain') {
      h.push('<div class="avsec prem">Mise en scène du mannequin</div>');
      h.push(chSel('av-decor', 'Décor', [{ cle: '', t: 'Celui de l’ambiance choisie' }].concat(DECORS),
        AV.decor, 'Choisi ici, il remplace celui de l’ambiance. Ce sont les 23 décors que le service '
        + 'connaît : un nom hors liste serait refusé.'));
      h.push(chSel('av-sourire', 'Expression',
        [{ cle: '1', t: 'Sourire naturel (défaut)' }, { cle: '0', t: 'Neutre' }],
        AV.sourire ? '1' : '0', 'Sans consigne, le service rend un visage presque fermé — mesuré sur '
        + 'pièce. Le sourire se demande, il ne vient pas tout seul.'));
      h.push('<div class="ch avun"><label for="av-extra">Précisions libres</label>'
        + '<textarea id="av-extra" rows="3" maxlength="200"' + (RO ? ' disabled' : '')
        + ' placeholder="black heels, hair tied back, delicate jewellery">' + esc(AV.extra) + '</textarea>'
        + '<div class="aidep">Chaussures, bijoux, coiffure, ambiance… ⚠ Photoroom n’a <strong>aucun '
        + 'réglage dédié</strong> pour ces éléments : c’est du texte libre ajouté à la consigne, au mieux '
        + 'une suggestion, jamais une garantie. Le service comprend mieux l’anglais.</div></div>');
      h.push('<div class="avun"><div class="aidep att">⚠ Le décor décrit au texte, l’ombre réglable et '
        + 'la relumière ne figurent pas dans cette voie : le mannequin virtuel <strong>compose sa scène '
        + 'lui-même</strong> et le service les ignorerait. Ils sont offerts sur « Fantôme habillé » et '
        + '« Produit à plat ».</div></div>');
    } else {
      h.push('<div class="avsec prem">Décor décrit au texte</div>');
      h.push('<div class="ch avun"><label for="av-fond">Décor voulu</label>'
        // rows="3" comme les autres zones libres (2026-08-21). /!\ CELLE-CI ACCEPTE
        // 500 CARACTERES, soit environ sept lignes : trois rangees restent en
        // dessous de ce qu'on peut y mettre. C'est un choix a lui, pas un defaut —
        // resize:vertical laisse tirer, et l'outil de mise en page se tait des
        // qu'un rows est ecrit a la main.
        + '<textarea id="av-fond" rows="3" maxlength="500"' + (RO ? ' disabled' : '')
        + ' placeholder="clean marble surface, soft window light from the left">' + esc(AV.fondPrompt)
        + '</textarea><div class="aidep">Laissez vide pour garder le décor de l’ambiance ; rempli, il la '
        + 'remplace. Le sujet reste où il est. Le service comprend mieux l’anglais.</div></div>');
      h.push('<div class="ch"><label for="av-neg">À éviter</label>'
        + '<input type="text" id="av-neg" maxlength="300"' + (RO ? ' disabled' : '')
        + ' value="' + esc(AV.fondNegatif) + '" placeholder="text, logo, hands, harsh reflections">'
        + '<div class="aidep">Ce que le décor ne doit pas contenir.</div></div>');
      h.push('<div class="ch"><label for="av-seed">Graine</label>'
        + '<input type="text" id="av-seed" inputmode="numeric" maxlength="9"' + (RO ? ' disabled' : '')
        + ' value="' + esc(AV.fondGraine) + '" placeholder="vide = au hasard">'
        + '<div class="aidep">Un même nombre redonne le <strong>même décor</strong> : c’est ce qui garde '
        + 'une collection cohérente d’une photo à l’autre. Vide, chaque photo repart au hasard.</div></div>');
    }
    return '<div class="avgrille">' + h.join('') + '</div>';
  }

  function avOmbresHtml(){
    var h = [];
    h.push('<div class="avsec prem">Ombre portée</div>');
    h.push('<label class="bascule avun"><input type="checkbox" id="av-ombre"'
        + (AV.ombreActive ? ' checked' : '') + (RO ? ' disabled' : '')
        + '> <span><strong>Régler l’ombre moi-même</strong><span class="d">Décochée, c’est l’ombre de '
        + 'l’ambiance qui s’applique. Cochée, <strong>vos réglages remplacent entièrement les '
        + 'siens</strong> — ce n’est pas un mélange des deux.</span></span></label>');
      if (AV.ombreActive) {
        h.push(chRange('av-oi', 'Intensité', AV.ombreIntensite));
        h.push(chRange('av-od', 'Douceur', AV.ombreDouceur));
        h.push(chSel('av-oe', 'Étendue', OMBRE_ETENDUES, AV.ombreEtendue, ''));
        h.push(chSel('av-odir', 'Direction de la lumière', OMBRE_DIRS, AV.ombreDirection, ''));
        h.push(chSel('av-op', 'Pose du sujet',
          [{ cle: 'upright', t: 'Debout, posé au sol (défaut)' }, { cle: 'flatlay', t: 'À plat, vu de dessus' }],
          AV.ombrePose, '« Debout » ancre le vêtement au sol pour qu’il ne flotte pas. Ne choisissez '
          + '« à plat » que si la photo est prise à la verticale, au-dessus du vêtement.'));
    }
    return '<div class="avgrille">' + h.join('') + '</div>';
  }

  function avLumiereHtml(){
    var h = [];
    h.push('<div class="avsec prem">Relumière</div>');
    h.push(chSel('av-lum', 'Accorder la lumière du sujet au décor', LUMIERES, AV.lumiere,
      '« Préserver la teinte » garde la <strong>vraie couleur du tissu</strong> : c’est le seul choix sûr '
      + 'quand on vend l’article sur sa couleur. « Automatique » éclaire mieux mais peut la déplacer — '
      + 'un bleu nuit qui ressort bleu roi fait un retour.'));
    return '<div class="avgrille">' + h.join('') + '</div>';
  }

  function avInterieurHtml(){
    var h = [];
    h.push('<div class="avsec prem">Photo de l’intérieur du vêtement</div>');
    h.push('<div class="avun"><div class="aidep">Le studio photographie le vêtement à l’endroit, puis '
      + '<strong>retourné</strong> ; le service raccorde les deux. C’est le <strong>seul chemin vers un '
      + 'col qui ne soit pas inventé</strong> — sans elle, l’intérieur de l’encolure est imaginé par le '
      + 'modèle.</div>'
      + '<input type="file" id="av-int-f" hidden accept="image/*">'
      + '<div class="avint">'
      + (INTERIEUR ? '<img src="' + INTERIEUR + '" alt="intérieur du vêtement">' : '')
      + '<span class="nm">' + (INTERIEUR ? esc(INTERIEUR_NOM || 'photo choisie')
      : 'Aucune photo d’intérieur.') + '</span>'
      + '<button id="av-int-b"' + (RO ? ' disabled' : '') + '>'
      + (INTERIEUR ? 'Remplacer' : 'Choisir un fichier') + '</button>'
      + (INTERIEUR ? '<button id="av-int-x"' + (RO ? ' disabled' : '') + '>Retirer</button>' : '')
      + '</div>'
      + '<div class="aidep att">⚠ Photoroom ne documente pas ce paramètre pour le retrait de '
      + 'mannequin, et l’on ne fait pas semblant du contraire : s’il est ignoré, le service le signale '
      + 'et l’écran vous le rapporte.</div>'
      + '<div class="aidep att">⚠ Elle ne voyage <strong>pas</strong> avec un lot : là, l’intérieur '
      + 'utilisé est celui déjà attaché à chaque photo dans la photothèque.</div></div>');
    return '<div class="avgrille">' + h.join('') + '</div>';
  }

  function avAgrandirHtml(){
    var h = [];
    h.push('<div class="avsec prem">Agrandissement</div>');
    h.push('<label class="bascule avun"><input type="checkbox" id="av-up"'
      + (AV.upActive ? ' checked' : '') + (RO ? ' disabled' : '')
      + '> <span><strong>Agrandir ×4</strong><span class="d">Un appel de plus, facturé, après le '
      + 'traitement.</span></span></label>');
    if (AV.upActive) {
      h.push(chSel('av-up-mode', 'Mode', [
        { cle: 'ai.fast', t: 'Rapide — entrée jusqu’à 1000 px' },
        { cle: 'ai.slow', t: 'Lent, plus fin — entrée jusqu’à 512 px' }], AV.upMode, ''));
      h.push('<div class="avun"><div class="aidep att">⚠ L’entrée est plafonnée à <strong>'
        + (AV.upMode === 'ai.slow' ? '512' : '1000') + ' px</strong> sur le grand côté. Au-delà, le '
        + 'service refuse : l’écran vous le dira plutôt que de le facturer. Une photo de studio dépasse '
        + 'largement cette limite — l’agrandissement sert surtout à récupérer une <strong>petite</strong> '
        + 'image (vignette, photo de fournisseur).</div></div>');
    }
    return '<div class="avgrille">' + h.join('') + '</div>';
  }

  /* ⚠ FACULTATIF NE VEUT PAS DIRE MAL RANGE. L etape 4 garde le meme en-tete
     que les trois autres — mais son numero ne devient jamais une coche : elle
     n a rien a valider, et une coche voudrait dire << il manque quelque chose >>
     tant qu on n y a pas touche. Ce qui est reglé se lit a sa droite. */
  function logoChoisi(){
    for (var i = 0; i < LOGOS.length; i++) { if (LOGOS[i].id === FIL.logoId) return LOGOS[i]; }
    return null;
  }
  function nomPosition(c){
    var x = POSITIONS.filter(function(o){ return o.cle === c; })[0];
    return x ? x.t : c;
  }
  // Une glissiere a bornes libres — celle du panneau avance ne va que de 0 a 1.
  function chRange2(id, lab, val, min, max, pas, unite){
    return '<div class="ch"><label class="avlab" for="' + id + '">' + lab
      + ' <b id="' + id + '-v">' + val + esc(unite || '') + '</b></label>'
      + '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + pas
      + '" value="' + val + '"' + (RO ? ' disabled' : '') + '></div>';
  }

  function filigraneCorpsHtml(){
    if (!LOGOS.length) {
      return '<div class="avgrille"><div class="aidep att">Aucun logo dans la logothèque. '
        + 'Ajoutez-en un dans <strong>Configuration ▸ Logothèque</strong>, puis rouvrez cet écran.'
        + '</div></div>';
    }
    var lg = logoChoisi();
    var h = '<div class="avgrille"><div class="avsec prem">Le logo</div>'
      + '<div class="loggr">' + LOGOS.map(function(l){
          return '<div class="logv' + (FIL.logoId === l.id ? ' on' : '') + '" data-logo="'
            + esc(l.id) + '" title="' + esc(l.nom) + '">'
            + '<img src="' + l.image + '" alt="' + esc(l.nom) + '">'
            + '<span class="ln">' + esc(l.nom) + '</span></div>'; }).join('') + '</div>';
    h += '<div class="avsec">Où le poser</div>'
      + '<div class="posgr">' + POSITIONS.map(function(p){
          return '<button class="posc' + (FIL.position === p.cle ? ' on' : '') + '" data-pos="'
            + esc(p.cle) + '" title="' + esc(p.t) + '"><span></span></button>'; }).join('') + '</div>';
    h += '<div class="avsec">Taille et discrétion</div>';
    h += chRange2('fil-taille', 'Largeur du logo', FIL.taille, 5, 60, 1, ' % de l’image');
    h += chRange2('fil-op', 'Opacité', Math.round(FIL.opacite * 100), 5, 100, 5, ' %');
    h += chRange2('fil-marge', 'Marge', FIL.marge, 0, 15, 1, ' %');
    h += '<div class="avun"><div class="fbar">'
      + '<button class="prim" id="fil-go"' + ((RESULT && lg && !RO) ? '' : ' disabled') + '>'
      + 'Appliquer au résultat</button>'
      + ((RESULT && RESULT.filigrane) ? '<button id="fil-off">Retirer</button>' : '')
      + '</div><div class="aidep">'
      + (RESULT
          ? (lg ? 'S’applique à l’image de droite. Les formats de sortie en seront tirés, donc marqués eux aussi.'
                : 'Choisissez un logo ci-dessus.')
          : 'Il n’y a pas encore d’image à marquer — commencez par un aperçu gratuit.')
      + '</div>'
      /* ⚠ CE QUE ÇA COÛTE, DIT UNE FOIS POUR TOUTES : rien. C est le seul
         traitement de cet écran dont le prix ne dépend pas du nombre de photos. */
      + '<div class="aidep">Le lot <strong>« Filigrane / logo »</strong> posera ce même réglage sur '
      + 'chaque photo choisie — <strong>aucun appel, aucun crédit</strong>, qu’il y en ait cinq ou '
      + 'cinq cents.</div></div>';
    return h + '</div>';
  }

  // Le filigrane est devenu un ONGLET (lot 3g) : il n a plus de section repliée
  // ni de zone à lui, il se repeint comme les huit autres.
  function majFiligrane(){ majPanneau(); }

  function brancherFiligrane(){
    corps.querySelectorAll('[data-logo]').forEach(function(el){
      el.onclick = function(){
        var id = el.getAttribute('data-logo');
        // Recliquer le logo choisi le retire : sinon on ne pourrait plus revenir
        // en arrière sans fermer la fenêtre.
        FIL.logoId = (FIL.logoId === id) ? '' : id;
        majFiligrane();
      };
    });
    corps.querySelectorAll('[data-pos]').forEach(function(el){
      el.onclick = function(){ FIL.position = el.getAttribute('data-pos'); majFiligrane(); };
    });
    // ⚠ Les glissières ne redessinent JAMAIS : le curseur sauterait sous le doigt.
    var g = function(id, poser){
      var e = document.getElementById(id), v = document.getElementById(id + '-v');
      if (!e) return;
      e.oninput = function(){
        poser(Number(e.value));
        if (v) v.textContent = e.value + v.textContent.replace(/^[0-9.]+/, '');
      };
    };
    g('fil-taille', function(n){ FIL.taille = n; });
    g('fil-op', function(n){ FIL.opacite = n / 100; });
    g('fil-marge', function(n){ FIL.marge = n; });
    var go = document.getElementById('fil-go');
    if (go) go.onclick = appliquerFiligrane;
    var off = document.getElementById('fil-off');
    if (off) off.onclick = retirerFiligrane;
  }

  function appliquerFiligrane(){
    var lg = logoChoisi();
    if (!RESULT || !lg || OCCUPE || RO) return;
    /* ⚠⚠ ON REPART TOUJOURS DE L IMAGE NUE. Sans elle, changer de position
       poserait un second logo SUR le premier : deux marques superposées, et
       aucun retour possible sans repayer un rendu. */
    var base = RESULT.brut || RESULT.image;
    occuper(true);
    dire('Pose du filigrane…');
    appeler('studio:filigraner', [{ image: base, logo: lg.image, position: FIL.position,
      taille: FIL.taille, opacite: FIL.opacite, marge: FIL.marge }]).then(function(r){
      occuper(false);
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      if (!RESULT.brut) RESULT.brut = RESULT.image;
      RESULT.image = r.image;
      RESULT.filigrane = true;
      /* Les formats avaient été tirés de l image NUE : les garder ferait
         enregistrer quatre cadrages SANS la marque, sous le même nom. */
      FORMATS = [];
      ENREG = false;
      peindreResultat();
      majFiligrane();
      dire('Filigrane posé — aucun crédit dépensé.', 'bon');
    });
  }

  function retirerFiligrane(){
    if (!RESULT || !RESULT.brut || OCCUPE) return;
    RESULT.image = RESULT.brut;
    RESULT.brut = '';
    RESULT.filigrane = false;
    FORMATS = [];
    ENREG = false;
    peindreResultat();
    majFiligrane();
    dire('Filigrane retiré.', 'att');
  }

  function chargerLogos(){
    appeler('studio:logos', []).then(function(r){
      if (!r || !r.ok) return;          // pas de logos : la section le dira
      LOGOS = r.logos || [];
      // La logotheque arrive apres coup : si l onglet du filigrane est ouvert,
      // il montre encore << aucun logo >> — on le repeint.
      if (ONGLET === 'filigrane') majPanneau(); else majAvResume();
    });
  }

  /* ══ LA BANDE D ONGLETS DU VOLET DE GAUCHE (lot 3g du #29) ═════════════════
     Neuf groupes au plus, un seul affiche a la fois, et RIEN a faire defiler :
     c est la demande. Chaque onglet dit a sa droite ce qu il a recu — la coche
     qui vivait sur le numero de l etape a demenage ici, sans quoi il faudrait
     ouvrir les neuf pour savoir ou l on en est.

     ⚠ << Formats >> n est PAS un onglet : il vit dans le volet de DROITE, avec
     le resultat dont il est tire. Le mettre a gauche le separerait de l image
     qu il decoupe. */
  var ONGLET = 'photo';
  var ONGLETS = [
    { cle: 'photo',     em: '📷', t: 'Photo',          voies: '*' },
    { cle: 'valeur',    em: '👗', t: 'Mise en valeur', voies: '*' },
    { cle: 'ambiance',  em: '🎨', t: 'Ambiance',       voies: '*' },
    { cle: 'decor',     em: '🖼', t: 'Décor',          voies: '*' },
    { cle: 'ombres',    em: '🌑', t: 'Ombres',         voies: 'fantome,plat' },
    { cle: 'lumiere',   em: '💡', t: 'Lumière',        voies: 'fantome,plat' },
    { cle: 'interieur', em: '🧥', t: 'Intérieur',      voies: 'fantome' },
    { cle: 'agrandir',  em: '🔍', t: 'Agrandissement', voies: '*' },
    { cle: 'filigrane', em: '💧', t: 'Filigrane',      voies: '*' }
  ];
  function ongletsDispo(){
    return ONGLETS.filter(function(o){
      return o.voies === '*' || o.voies.split(',').indexOf(VOIE) >= 0;
    });
  }
  /* ⚠ L ONGLET COURANT PEUT DISPARAITRE SOUS LE PIED. On regle l ombre, on
     repasse au mannequin virtuel : << Ombres >> n existe plus dans cette voie.
     Sans ce repli, le volet resterait VIDE et l on croirait l ecran casse. */
  function ongletSur(){
    var d = ongletsDispo();
    for (var i = 0; i < d.length; i++) { if (d[i].cle === ONGLET) return d[i]; }
    ONGLET = d[0].cle;
    return d[0];
  }
  // Ce que l onglet a recu, dit SUR l onglet. Vide = rien de choisi.
  function ongletEtat(cle){
    if (cle === 'photo')     return aUnePhoto() ? (PHOTO_NOM || 'photo prête') : '';
    if (cle === 'valeur')    return nomVoie(VOIE);
    if (cle === 'ambiance')  return PRESET ? nomPreset(PRESET) : '';
    if (cle === 'decor')     return (VOIE === 'humain')
      ? (AV.decor ? nomDecor(AV.decor) : '')
      : (String(AV.fondPrompt || '').trim() ? 'décrit au texte' : '');
    if (cle === 'ombres')    return AV.ombreActive ? 'réglée à la main' : '';
    if (cle === 'lumiere')   return AV.lumiere ? 'active' : '';
    if (cle === 'interieur') return INTERIEUR ? (INTERIEUR_NOM || 'photo choisie') : '';
    if (cle === 'agrandir')  return AV.upActive ? '×4' : '';
    if (cle === 'filigrane') { var l = logoChoisi(); return l ? l.nom : ''; }
    return '';
  }
  /* Les trois onglets qu il FAUT remplir pour lancer quoi que ce soit. Les six
     autres sont facultatifs : leur coller une coche voudrait dire << il manque
     quelque chose >> tant qu on n y a pas touche, ce qui est faux. */
  function ongletRequis(cle){ return cle === 'photo' || cle === 'ambiance'; }
  function ongletsHtml(){
    var courant = ongletSur().cle;
    return ongletsDispo().map(function(o){
      var e = ongletEtat(o.cle);
      var ok = ongletRequis(o.cle) ? !!e : false;
      return '<button class="ong' + (o.cle === courant ? ' on' : '') + '" data-ong="' + o.cle
        + '" role="tab" aria-selected="' + (o.cle === courant ? 'true' : 'false') + '">'
        + '<span class="oi">' + o.em + '</span>'
        + '<span class="ot"><b>' + esc(o.t) + '</b>'
        + '<span class="oe">' + esc(e || (ongletRequis(o.cle) ? 'À choisir' : '—')) + '</span></span>'
        + (ok ? '<span class="oc">✓</span>' : '') + '</button>';
    }).join('');
  }
  // Le contenu du groupe affiché, et lui seul.
  function panneauHtml(){
    var o = ongletSur();
    var corpsG = '';
    if (o.cle === 'photo')     corpsG = photoHtml();
    else if (o.cle === 'valeur') corpsG = '<div class="tuiles">' + voiesHtml() + '</div>' + modeleHtml();
    else if (o.cle === 'ambiance')  corpsG = ambiancesHtml();
    else if (o.cle === 'decor')     corpsG = avDecorHtml();
    else if (o.cle === 'ombres')    corpsG = avOmbresHtml();
    else if (o.cle === 'lumiere')   corpsG = avLumiereHtml();
    else if (o.cle === 'interieur') corpsG = avInterieurHtml();
    else if (o.cle === 'agrandir')  corpsG = avAgrandirHtml();
    else if (o.cle === 'filigrane') corpsG = filigraneCorpsHtml();
    return '<div class="pnt"><span class="pi">' + o.em + '</span><h2>' + esc(o.t) + '</h2></div>'
      + '<p class="sous">' + panneauSousHtml(o.cle) + '</p>'
      + '<div class="pnc">' + corpsG + '</div>';
  }
  function panneauSousHtml(cle){
    if (cle === 'photo')     return 'Celle de départ, prise en studio sur fond blanc.';
    if (cle === 'valeur')    return 'Comment le vêtement est présenté.';
    if (cle === 'ambiance')  return 'Un clic règle décor, ombre ancrée et lumière.';
    if (cle === 'decor')     return 'Ce qu’il y a derrière le vêtement. Facultatif : l’ambiance en pose déjà un.';
    if (cle === 'ombres')    return 'Facultatif : sans réglage, c’est l’ombre de l’ambiance qui s’applique.';
    if (cle === 'lumiere')   return 'Facultatif : accorder la lumière du sujet à celle du décor.';
    if (cle === 'interieur') return 'La seconde prise de vue, vêtement retourné — le seul col qui ne soit pas inventé.';
    if (cle === 'agrandir')  return 'Facultatif, et <strong>facturé un appel de plus</strong>.';
    if (cle === 'filigrane') return 'Le logo de la marque, posé sur l’image. Aucun appel, aucun crédit.';
    return '';
  }
  /* Repeindre le SEUL panneau, jamais toute la fenêtre : un redessin complet
     perdrait la grille de photos, son défilement et le focus de la saisie ou de
     la glissière en cours. La bande d onglets se repeint avec, parce que ce
     qu on vient de régler s y affiche. */
  function majPanneau(){
    var z = document.getElementById('panneau');
    if (!z) { dessiner(); return; }
    z.innerHTML = panneauHtml();
    var b = document.getElementById('onglets');
    if (b) b.innerHTML = ongletsHtml();
    brancher();
    majBoutons();
  }
  function majAvance(){ majPanneau(); }
  /* ⚠⚠ CELLE-CI NE TOUCHE PAS AU PANNEAU, ET C EST TOUT SON INTERET. Elle est
     appelee A CHAQUE FRAPPE dans les champs de texte (decor decrit, precisions
     libres, graine) : repeindre le panneau la remplacerait par un champ neuf, et
     le curseur repartirait au debut a chaque lettre. Seule la bande d onglets se
     redessine — elle ne detient aucun focus. */
  function majAvResume(){
    var b = document.getElementById('onglets');
    if (b) b.innerHTML = ongletsHtml();
    brancherOnglets();
  }
  function brancherOnglets(){
    corps.querySelectorAll('[data-ong]').forEach(function(el){
      el.onclick = function(){
        if (OCCUPE) return;   // pendant un traitement, changer d onglet n a pas de sens
        ONGLET = el.getAttribute('data-ong');
        majPanneau();
      };
    });
  }

  /* ══ LES RECETTES DE MISE EN SCÈNE (lot 3d du #29) ═════════════════════════
     Sa demande : << enregistrer des presets d option, les nommer, les reutiliser
     [...] s assurer de prendre TOUTES les options dans les presets, incluant les
     options avancees, je dis vraiment tout >>.

     Une recette, c est donc la commande ENTIERE rangee sous un nom : la voie,
     l ambiance, le mannequin, la pose, les huit reglages avances, le filigrane
     et le format de sortie. La choisir remplit les neuf onglets d un coup —
     c est ca, << accelerer le traitement >> : moins de gestes avant de lancer,
     pas un appel plus rapide (le temps de rendu appartient au service).

     ⚠⚠ UNE RECETTE NE CONTIENT AUCUNE IMAGE — ni la photo de depart, ni la photo
     d INTERIEUR du fantome. Cette derniere est la seconde prise de vue d UN
     vetement precis : rangee dans une recette, elle raccorderait le col d une
     robe sur un manteau, cinq cents fois, et les cinq cents seraient facturees.
     Le pont refuse d ailleurs tout ce qui n est pas explicitement prevu. */
  /* ⚠⚠ A L ECRAN CELA S APPELLE << PROFIL >>, dans le code << recette >>, et ce
     n est pas un oubli. Il a demande le renommage le 2026-08-19, apres avoir vu
     la barre ; l ecran suit sa langue. Mais les identifiants, eux, ne changent
     PAS : l operation du pont (studio:recettes) et la cle de configuration
     (studio_recettes) sont ecrites des DEUX cotes et deja posees dans Turso —
     les renommer serait une migration de donnees pour un mot, avec le risque de
     perdre ce qui est deja enregistre.
     ⚠ NE PAS << CORRIGER >> CETTE DIVERGENCE en renommant les ops : elle est
     voulue, et ceci est le seul endroit ou il faut le savoir. */
  var RECETTES = [];   // [{id,nom,maj,r}] — telles que le pont les rend
  var RC_SEL = '';     // identifiant du profil applique, '' = aucun
  var RC_VOILE_DEP = false;  // identifiant d ouverture du banc — voir le pied du script

  function recetteChoisie(){
    for (var i = 0; i < RECETTES.length; i++) { if (RECETTES[i].id === RC_SEL) return RECETTES[i]; }
    return null;
  }
  function recettesHtml(){
    var x = recetteChoisie();
    return '<div class="rcbar" id="rcbar">'
      + '<label for="rc-sel">Profil</label>'
      + '<select id="rc-sel"' + (RO ? ' disabled' : '') + '>'
      + '<option value="">— Aucun —</option>'
      + RECETTES.map(function(o){
          return '<option value="' + esc(o.id) + '"' + (RC_SEL === o.id ? ' selected' : '')
            + '>' + esc(o.nom) + '</option>'; }).join('')
      + '</select>'
      + '<button id="rc-enr"' + (RO ? ' disabled' : '')
      + ' title="Enregistrer tous les réglages actuels sous un nom">'
      + '<span class="ic">💾</span> Enregistrer…</button>'
      + '<button class="x" id="rc-sup"' + ((RO || !x) ? ' disabled' : '')
      + ' title="Retirer ce profil">✕</button></div>';
  }
  function brancherRecettes(){
    var s = document.getElementById('rc-sel');
    if (s) s.onchange = function(){ appliquerRecette(s.value); };
    var e = document.getElementById('rc-enr');
    if (e) e.onclick = ouvrirRecetteVoile;
    var x = document.getElementById('rc-sup');
    if (x) x.onclick = retirerRecette;
  }

  /* On repart des DEFAUTS, puis l on pose ce que la recette porte.
     ⚠ SANS LE RETOUR AUX DEFAUTS, une recette ecrite avant l ajout d un reglage
     laisserait ce reglage a la valeur du rendu PRECEDENT : la meme recette,
     appliquee deux fois de suite, ne donnerait pas deux fois le meme resultat —
     et l on paierait la difference sans comprendre d ou elle vient.
     ⚠ Le controle de TYPE ecarte une valeur venue d une version qui ne compte
     plus pareil (un nombre devenu texte) plutot que de la transmettre au relais,
     qui la refuserait au milieu d un lot de cinq cents. */
  function fusionner(defauts, sauve){
    var o = {};
    Object.keys(defauts).forEach(function(k){ o[k] = defauts[k]; });
    if (sauve && typeof sauve === 'object') {
      Object.keys(o).forEach(function(k){
        if (sauve[k] !== undefined && typeof sauve[k] === typeof o[k]) o[k] = sauve[k];
      });
    }
    return o;
  }

  /* ⚠⚠ UNE RECETTE QUI CITE CE QUI N EXISTE PLUS DOIT LE DIRE. Une ambiance
     retiree de la liste, un logo sorti de la logotheque : appliquer les onze
     autres reglages en silence donnerait un ecran qui a l air juste et un rendu
     qui ne l est pas — et c est un rendu qu on PAIE, parfois cinq cents fois. On
     applique donc tout le reste, on laisse le manquant a son defaut, et ON LE
     NOMME. */
  function appliquerRecette(id){
    RC_SEL = String(id || '');
    var x = recetteChoisie();
    if (!x) { dessiner(); dire('Aucun profil appliqué — les réglages sont ceux de l’écran.', 'att'); return; }
    var r = x.r || {};
    var perdus = [];
    if (r.voie && estVoie(r.voie)) VOIE = r.voie;
    if (r.modele && MODELES.indexOf(r.modele) >= 0) MODELE_SEL = r.modele;
    if (r.pose && POSES.filter(function(p){ return p.cle === r.pose; }).length) POSE_SEL = r.pose;
    if (r.formMode === 'recadrer' || r.formMode === 'marges') FORM_MODE = r.formMode;
    if (r.preset) {
      if (PRESETS.filter(function(p){ return p.cle === r.preset; }).length) PRESET = r.preset;
      else perdus.push('l’ambiance');
    }
    AV = fusionner(AV_DEF, r.av);
    FIL = fusionner(FIL_DEF, r.fil);
    if (FIL.logoId && !LOGOS.filter(function(l){ return l.id === FIL.logoId; }).length) {
      FIL.logoId = '';
      perdus.push('le logo');
    }
    /* Les reglages viennent de changer : le resultat affiche n est plus celui
       qu ils produiraient, et ses formats non plus. Les garder ferait
       enregistrer une image que l ecran ne decrit plus. */
    RESULT = null; FORMATS = []; ENREG = false;
    dessiner();
    var m = 'Profil « ' + x.nom +' » appliqué.';
    if (perdus.length) {
      dire(m + ' ⚠ ' + perdus.join(' et ') + ' de ce profil '
        + (perdus.length > 1 ? 'n’existent plus' : 'n’existe plus')
        + ' — ce réglage est resté au défaut.', 'att');
    } else {
      dire(m + ' Tout est en place : il ne reste que la photo à choisir.', 'bon');
    }
  }

  // Ce que la recette emporte. ⚠ La photo et l interieur n y sont pas — voir le
  // gros avertissement en tete du bloc.
  function recetteActuelle(){
    return { voie: VOIE, preset: PRESET, modele: MODELE_SEL, pose: POSE_SEL,
      formMode: FORM_MODE, av: fusionner(AV_DEF, AV), fil: fusionner(FIL_DEF, FIL) };
  }

  /* ⚠ LE NOM EST PRE-REMPLI AVEC CELUI DE LA RECETTE CHOISIE, et l ecran DIT
     qu enregistrer va l ecraser. Le geste courant est << j ajuste et je remets a
     jour >>, pas << je fabrique une quinzieme variante >> : ecraser est donc le
     defaut. Mais un ecrasement qu on ne voit pas venir est une perte, et les
     recettes ne se reconstituent pas — elles portent des reglages accordes a
     l oeil sur des dizaines de rendus payes. */
  function ouvrirRecetteVoile(){
    if (RO) return;
    var x = recetteChoisie();
    voile('<h3><span class="ic">💾</span> Enregistrer le profil</h3>'
      + '<p>Il retient <strong>tout</strong> : la mise en valeur, l’ambiance, le mannequin, la '
      + 'pose, les réglages avancés (décor, ombres, lumière, agrandissement), le filigrane et le '
      + 'format de sortie.</p>'
      + '<p><strong>Pas la photo</strong>, ni la photo d’intérieur du fantôme : celle-là appartient '
      + 'à un vêtement précis, et se promènerait d’un article à l’autre.</p>'
      + '<p><input type="text" id="rc-nom" maxlength="60" placeholder="Ex. : Collection automne — plage dorée" '
      + 'value="' + esc(x ? x.nom : '') + '"></p>'
      + '<p class="rcav" id="rc-av">' + (x
          ? '⚠ Ce nom est celui du profil choisi : il sera <strong>remplacé</strong>.'
          : '') + '</p>'
      + '<div class="fin2"><button id="rc-non">Annuler</button>'
      + '<button class="prim" id="rc-oui">Enregistrer</button></div>',
      function(fermer){
        var n = document.getElementById('rc-nom');
        var av = document.getElementById('rc-av');
        var oui = document.getElementById('rc-oui');
        var non = document.getElementById('rc-non');
        if (n) { try { n.focus(); n.select(); } catch (e) {} }
        // L avertissement d ecrasement suit ce qui est TAPE, pas ce qui etait
        // choisi : renommer en cours de route doit l eteindre.
        var majAv = function(){
          if (!av) return;
          var v = String((n && n.value) || '').trim().toLowerCase();
          var d = RECETTES.filter(function(o){ return String(o.nom).trim().toLowerCase() === v; })[0];
          av.innerHTML = (v && d)
            ? '⚠ Un profil porte déjà ce nom : il sera <strong>remplacé</strong>.'
            : '';
        };
        if (n) { n.oninput = majAv; majAv(); }
        if (non) non.onclick = fermer;
        var lancer = function(){
          var nom = String((n && n.value) || '').trim();
          if (!nom) { if (av) av.innerHTML = '⚠ Donnez-lui un nom.'; if (n) n.focus(); return; }
          if (oui) oui.disabled = true;
          enregistrerRecette(nom, fermer);
        };
        if (oui) oui.onclick = lancer;
        if (n) n.onkeydown = function(ev){ if (ev.key === 'Enter') { ev.preventDefault(); lancer(); } };
      });
  }

  function enregistrerRecette(nom, fermer){
    dire('Enregistrement du profil…');
    /* ⚠ ON N ENVOIE PAS L IDENTIFIANT COURANT AVEUGLEMENT. Si le nom tape n est
       plus celui de la recette choisie, c est une recette NEUVE qu on veut, pas
       un renommage de l ancienne — sinon << Enregistrer sous un autre nom >>
       ferait disparaitre celle dont on partait. */
    var x = recetteChoisie();
    var meme = x && String(x.nom).trim().toLowerCase() === nom.toLowerCase();
    appeler('studio:recetteEnregistrer',
      [{ nom: nom, id: meme ? x.id : '', r: recetteActuelle() }]).then(function(res){
      if (!res || !res.ok) { dire(expliquer(res), 'err'); if (fermer) fermer(); return; }
      RECETTES = res.recettes || [];
      RC_SEL = res.id || '';
      if (fermer) fermer();
      dessiner();
      dire('Profil « ' + nom + ' » enregistré.', 'bon');
    });
  }

  function retirerRecette(){
    var x = recetteChoisie();
    if (!x || RO) return;
    voile('<h3>Retirer le profil ?</h3>'
      + '<p>« <strong>' + esc(x.nom) + '</strong> » sera effacé. Les réglages restent à l’écran : '
      + 'c’est le raccourci qui disparaît, pas la mise en scène.</p>'
      + '<div class="fin2"><button id="rs-non">Annuler</button>'
      + '<button class="conf" id="rs-oui">Retirer</button></div>',
      function(fermer){
        var non = document.getElementById('rs-non');
        var oui = document.getElementById('rs-oui');
        if (non) non.onclick = fermer;
        if (oui) oui.onclick = function(){
          oui.disabled = true;
          appeler('studio:recetteRetirer', [{ id: x.id }]).then(function(res){
            if (fermer) fermer();
            if (!res || !res.ok) { dire(expliquer(res), 'err'); return; }
            RECETTES = res.recettes || [];
            RC_SEL = '';
            dessiner();
            dire('Profil retiré.', 'att');
          });
        };
      });
  }

  /* La liste au chargement. ⚠ Une lecture qui echoue ne bloque RIEN : la barre
     reste utilisable (on peut toujours enregistrer), elle est simplement vide.
     Un ecran de mise en scene qui refuserait de s ouvrir parce qu une liste de
     raccourcis manque serait hors de proportion. */
  function chargerRecettes(){
    appeler('studio:recettes', []).then(function(r){
      if (!r || !r.ok) return;
      RECETTES = r.recettes || [];
      // Seule la barre se repeint : le reste du volet peut deja etre en train
      // d etre rempli, et un redessin complet le reprendrait a zero.
      var b = document.getElementById('rcbar');
      if (b) { b.outerHTML = recettesHtml(); brancherRecettes(); }
      /* ⚠ LE VOILE DU BANC S OUVRE ICI, PAS AU DEMARRAGE. Ouvert avant que la
         liste soit revenue, il montrerait un champ vide et aucun avertissement
         d ecrasement — c est-a-dire tout sauf la surface qu on vient controler.
         On pose aussi une recette choisie, sans quoi le champ pre-rempli et
         l avertissement << elle sera remplacee >> ne seraient dessines nulle
         part. */
      if (RC_VOILE_DEP) {
        RC_VOILE_DEP = false;
        /* ⚠ ON APPLIQUE POUR DE VRAI, on ne se contente pas de cocher le menu.
           Une barre qui annonce une recette pendant que les onglets montrent
           autre chose est exactement le mensonge d ecran qu on traque — et le
           chemin d application, celui qui doit dire ce qui a disparu, ne serait
           eprouve nulle part. */
        if (!RC_SEL) appliquerRecette(String((RECETTES[0] || {}).id || ''));
        ouvrirRecetteVoile();
      }
    });
  }

  function brancherAvance(){
    // Un champ de texte ne redessine JAMAIS : on note la valeur et l on met à
    // jour le seul résumé (sinon le curseur sauterait à chaque frappe).
    var t = function(id, cle){
      var e = document.getElementById(id);
      if (e) e.oninput = function(){ AV[cle] = e.value; majAvResume(); };
    };
    t('av-extra', 'extra'); t('av-fond', 'fondPrompt');
    t('av-neg', 'fondNegatif'); t('av-seed', 'fondGraine');
    var s = function(id, cle, conv){
      var e = document.getElementById(id);
      if (e) e.onchange = function(){ AV[cle] = conv ? conv(e.value) : e.value; majAvResume(); };
    };
    s('av-decor', 'decor'); s('av-oe', 'ombreEtendue'); s('av-odir', 'ombreDirection');
    s('av-op', 'ombrePose'); s('av-lum', 'lumiere');
    s('av-sourire', 'sourire', function(v){ return v === '1'; });
    // Les glissières : on écrit la valeur à côté du libellé, sans redessiner.
    var g = function(id, cle){
      var e = document.getElementById(id), v = document.getElementById(id + '-v');
      if (!e) return;
      e.oninput = function(){ AV[cle] = Number(e.value);
        if (v) v.textContent = Number(e.value).toFixed(2); };
    };
    g('av-oi', 'ombreIntensite'); g('av-od', 'ombreDouceur');
    // Ces deux-là font apparaître ou disparaître des contrôles : ils repeignent.
    var o = document.getElementById('av-ombre');
    if (o) o.onchange = function(){ AV.ombreActive = o.checked; majAvance(); };
    var u = document.getElementById('av-up');
    if (u) u.onchange = function(){ AV.upActive = u.checked; majAvance(); };
    var um = document.getElementById('av-up-mode');
    if (um) um.onchange = function(){ AV.upMode = um.value; majAvance(); };
    // La photo de l intérieur (fantôme seulement).
    var f = document.getElementById('av-int-f');
    var ib = document.getElementById('av-int-b');
    if (ib && f) ib.onclick = function(){ f.click(); };
    if (f) f.onchange = function(){ if (f.files && f.files[0]) lireInterieur(f.files[0]); };
    var ix = document.getElementById('av-int-x');
    if (ix) ix.onclick = function(){ INTERIEUR = null; INTERIEUR_NOM = ''; majAvance();
      dire('Photo d’intérieur retirée.', 'att'); };
  }

  function lireInterieur(fi){
    if (!fi || String(fi.type).indexOf('image/') !== 0) { dire('Ce n’est pas une image.', 'err'); return; }
    dire('Lecture de la photo d’intérieur…');
    var fr = new FileReader();
    fr.onload = function(){ reduire(String(fr.result || ''), function(petite){
      INTERIEUR = petite; INTERIEUR_NOM = String(fi.name || '');
      majAvance(); dire('Photo d’intérieur prête.', 'bon'); }); };
    fr.onerror = function(){ dire('Lecture impossible.', 'err'); };
    fr.readAsDataURL(fi);
  }

  /* ══ CE QUE LE SERVICE A IGNORÉ, DIT À L ÉCRAN ═════════════════════════════
     ⚠⚠ Photoroom renvoie l en-tête « pr-unsupported-attributes » quand il JETTE
     un paramètre, et le relais le remonte depuis toujours sous la clé « ignores ».
     Cette fenêtre ne l affichait NULLE PART. Un réglage avancé pouvait donc être
     refusé sans que rien ne le dise — précisément le silence que ce panneau est
     censé lever. Sans cet affichage, la mise en garde sur la photo d intérieur
     (« s il est ignoré, l écran vous le rapporte ») serait une promesse fausse. */
  var IGN_NOMS = {
    'editWithAI.additionalImages.interior.imageFile': 'la photo de l’intérieur du vêtement',
    'background.prompt': 'le décor décrit au texte',
    'background.negativePrompt': 'l’anti-consigne du décor',
    'background.seed': 'la graine du décor',
    'lighting.mode': 'la relumière',
    'upscale.mode': 'l’agrandissement',
    'shadow.mode': 'l’ombre portée',
    'shadow.intensityOverride': 'l’intensité de l’ombre',
    'shadow.softnessOverride': 'la douceur de l’ombre',
    'shadow.spreadOverride': 'l’étendue de l’ombre',
    'shadow.directionOverride': 'la direction de l’ombre',
    'shadow.subjectPoseOverride': 'la pose du sujet pour l’ombre',
    'virtualModel.pose': 'la pose du mannequin',
    'virtualModel.prompt': 'l’expression et les précisions libres',
    'virtualModel.scene.preset.name': 'le décor du mannequin',
    'virtualModel.model.preset.name': 'le mannequin choisi'
  };
  function ignoresLisible(s){
    var l = String(s || '').split(',').map(function(x){ return x.trim(); }).filter(Boolean);
    if (!l.length) return '';
    return l.map(function(x){ return IGN_NOMS[x] || x; }).join(', ');
  }

  /* La photo de DEPART, telle qu on peut la remontrer. ⚠ Venue de la
     photothèque, on n a que sa VIGNETTE (PHOTO_URL = l apercu) : le rideau reste
     un repere de cadrage et de couleur, pas un juge de nettete — et l ecran le
     dit plutot que de laisser croire a une comparaison a definition egale. */
  function photoAvant(){ return PHOTO || PHOTO_URL || ''; }

  function comparateurHtml(av){
    return '<div class="cmp" id="cmp" style="--x:' + CMP_POS.toFixed(2) + '%">'
      + '<img src="' + esc(av) + '" alt="avant">'
      + '<div class="cb"><img src="' + RESULT.image + '" alt="après"></div>'
      + '<div class="cpg" id="cmp-p" role="slider" tabindex="0"'
      + ' aria-label="Position du rideau entre l’avant et l’après"'
      + ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(CMP_POS) + '">'
      + '<span class="cph">⇔</span></div>'
      + '<span class="cet g">Avant</span><span class="cet d">Après</span></div>'
      + (!PHOTO && PHOTO_URL
          ? '<div class="avis">L’« avant » est la vignette de la photothèque : un repère de '
            + 'cadrage et de couleur, pas un juge de netteté.</div>'
          : '');
  }

  /* ══ LES FORMATS DE SORTIE (lot 3b) ═══════════════════════════════════════
     ⚠⚠ TOUT SE PASSE DANS LA PAGE. Couper et border une image qu on a deja ne
     demande rien au service : la refaire produire en quatre cadrages coûterait
     quatre appels facturés pour exactement les mêmes pixels. C est aussi pour ça
     qu il n y a AUCUNE nouvelle opération de pont ici — seul l enregistrement en
     passe une, et elle existait déjà (studio:enregistrer). */

  /* ⚠ UNE IMAGE DÉTOURÉE EST TRANSPARENTE, et lui coller des marges blanches
     détruirait précisément ce qu on a payé pour obtenir. On REGARDE donc l image
     au lieu de demander à l écran ce qu il croit avoir demandé.
     ⚠ DANS LE DOUTE, ON DIT TRANSPARENT. Si la lecture des pixels est refusée
     (image d une autre origine), supposer « opaque » collerait du blanc sous un
     détourage — irréversible. Supposer « transparent » donne au pire des marges
     vides sur une photo : rien n est détruit, et le PNG garde tout. */
  function estOpaque(im){
    try {
      var n = 64;
      var w = Math.max(1, Math.min(n, im.naturalWidth || n));
      var h = Math.max(1, Math.min(n, im.naturalHeight || n));
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var x = c.getContext('2d');
      x.drawImage(im, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data;
      for (var i = 3; i < d.length; i += 4) { if (d[i] < 250) return false; }
      return true;
    } catch (e) { return false; }
  }

  /* Une seule formule pour les deux gestes, et c est le signe des décalages qui
     les sépare : en RECADRANT, le cadre est plus petit que l image, dx et dy sont
     donc NÉGATIFS et l image déborde — c est la coupe. En BORDANT, le cadre est
     plus grand, dx et dy sont positifs — c est la marge. Aucun agrandissement
     dans un cas comme dans l autre. */
  function fabriquerFormat(im, r, opaque){
    var sw = im.naturalWidth, sh = im.naturalHeight;
    if (!sw || !sh) return null;
    var ow, oh;
    if (FORM_MODE === 'marges') {
      // Le plus petit cadre du rapport voulu qui CONTIENT toute l image.
      if (sw / sh > r.v) { ow = sw; oh = Math.round(sw / r.v); }
      else { oh = sh; ow = Math.round(sh * r.v); }
    } else {
      // Le plus grand cadre du rapport voulu qui TIENT dans l image.
      if (sw / sh > r.v) { oh = sh; ow = Math.round(sh * r.v); }
      else { ow = sw; oh = Math.round(sw / r.v); }
    }
    ow = Math.max(1, ow); oh = Math.max(1, oh);
    var c = document.createElement('canvas');
    c.width = ow; c.height = oh;
    var x = c.getContext('2d');
    if (opaque) { x.fillStyle = '#ffffff'; x.fillRect(0, 0, ow, oh); }
    x.drawImage(im, Math.round((ow - sw) / 2), Math.round((oh - sh) / 2), sw, sh);
    return { cle: r.cle, label: r.t, largeur: ow, hauteur: oh, enreg: false,
             ext: opaque ? 'jpg' : 'png',
             image: c.toDataURL(opaque ? 'image/jpeg' : 'image/png', 0.92) };
  }

  function preparerFormats(){
    if (!RESULT || !RESULT.image || FORM_OCC || RO) return;
    FORM_OCC = true; FORMATS = []; peindreResultat();
    dire('Préparation des formats…');
    var fini = function(msg, cl){ FORM_OCC = false; peindreResultat(); dire(msg, cl); };
    /* ⚠ new Image() PEUT NE PAS EXISTER (banc de contrôle, contexte sans canevas).
       On ne fait pas semblant que ça a marché : la liste reste vide et l écran le
       dit. Une vignette manquante qu on prendrait pour un format prêt serait pire
       qu un refus net. */
    try {
      var im = new Image();
      im.onload = function(){
        try {
          var opaque = estOpaque(im);
          var out = [];
          for (var i = 0; i < RATIOS.length; i++) {
            var f = fabriquerFormat(im, RATIOS[i], opaque);
            if (f) out.push(f);
          }
          FORMATS = out;
          fini(out.length
            ? (out.length + ' formats prêts — aucun appel, aucun crédit.')
            : 'Aucun format n’a pu être préparé.', out.length ? 'bon' : 'err');
        } catch (e) {
          FORMATS = [];
          fini('Les formats n’ont pas pu être préparés (' + esc((e && e.message) || e) + ').', 'err');
        }
      };
      im.onerror = function(){
        FORMATS = [];
        fini('L’image n’a pas pu être relue pour en tirer des formats.', 'err');
      };
      im.src = RESULT.image;
    } catch (e) {
      FORMATS = [];
      fini('Les formats ne sont pas disponibles dans cette fenêtre.', 'err');
    }
  }

  function nomFormat(f){ return 'studio-' + VOIE + '-' + PRESET + '-' + f.cle; }

  function formatsHtml(){
    if (!RESULT) return '';
    var h = '<span class="rt">Formats de sortie</span>'
      + '<div class="note">La même image en 3:4, 1:1, 4:5 et 9:16, préparés ici même — '
      + '<strong>aucun appel, aucun crédit</strong>.</div>'
      + '<div class="fbar">'
      + '<button class="jeton' + (FORM_MODE === 'recadrer' ? ' on' : '') + '" data-fmode="recadrer">Recadrer</button>'
      + '<button class="jeton' + (FORM_MODE === 'marges' ? ' on' : '') + '" data-fmode="marges">Marges</button>'
      + '<button class="jeton prim grand" id="fmt-go"' + (FORM_OCC || RO ? ' disabled' : '') + '>'
      + (FORM_OCC ? 'Préparation…' : (FORMATS.length ? '↻ Refaire les 4 formats' : '⚙ Préparer les 4 formats'))
      + '</button></div>';
    /* ⚠ CE QUE CHAQUE GESTE COÛTE VRAIMENT, DIT AVANT DE CLIQUER. Un recadrage
       centré COUPE — sur une silhouette entière, le 1:1 emporte forcément le haut
       et le bas. Le taire ferait découvrir la coupe une fois les quatre images
       enregistrées dans la photothèque. */
    h += '<div class="note">'
      + (FORM_MODE === 'marges'
          ? 'Rien n’est coupé : l’image entière est <strong>bordée</strong> jusqu’au format voulu. '
            + 'Les marges sont <strong>blanches</strong> ; sur une image détourée (fond transparent) '
            + 'elles restent transparentes, et le fichier sort en PNG.'
          : 'Le recadrage est <strong>centré</strong> : sur une silhouette entière, le 1:1 et le 9:16 '
            + 'emportent forcément du haut et du bas. Choisissez « Marges » pour ne rien perdre.')
      + '</div>';
    if (FORMATS.length) {
      h += '<div class="fmtg">' + FORMATS.map(function(f){
        return '<div class="fmtc"><img src="' + f.image + '" alt="' + esc(f.label) + '" loading="lazy">'
          + '<span class="ft">' + esc(f.label) + '</span>'
          + '<span class="fd">' + f.largeur + ' × ' + f.hauteur + '</span>'
          + '<span class="fb">'
          + '<button data-fdl="' + esc(f.cle) + '" title="Télécharger ce format">⤓</button>'
          + '<button data-fsv="' + esc(f.cle) + '"' + (f.enreg ? ' disabled' : '')
          + ' title="Enregistrer dans la photothèque">'
      + (f.enreg ? '✓' : '<span class="ic">💾</span>') + '</button>'
          + '</span></div>';
      }).join('') + '</div>'
        + '<div class="fbar"><button class="prim" id="fmt-save-all"'
        + (RO ? ' disabled' : '') + '><span class="ic">💾</span> Enregistrer les ' + FORMATS.length
        + ' dans la photothèque</button></div>';
    }
    return h;
  }

  function formatParCle(c){
    for (var i = 0; i < FORMATS.length; i++) { if (FORMATS[i].cle === c) return FORMATS[i]; }
    return null;
  }

  /* Les quatre d un coup, EN SÉRIE : le pont porte une image à la fois, et quatre
     envois simultanés d une photo de studio le feraient trébucher. */
  function enregistrerTousFormats(){
    if (!FORMATS.length || OCCUPE || RO) return;
    occuper(true);
    var i = 0, faits = 0, rate = 0;
    var suite = function(){
      if (i >= FORMATS.length) {
        occuper(false);
        peindreResultat();
        dire(rate
          ? (faits + ' format' + (faits > 1 ? 's' : '') + ' enregistré' + (faits > 1 ? 's' : '')
             + ', ' + rate + ' en échec.')
          : (faits + ' formats enregistrés dans la photothèque.'), rate ? 'att' : 'bon');
        return;
      }
      var f = FORMATS[i]; i++;
      if (f.enreg) { faits++; suite(); return; }
      dire('Enregistrement ' + i + ' sur ' + FORMATS.length + ' — ' + f.label + '…');
      appeler('studio:enregistrer', [{ image: f.image, nom: nomFormat(f) }]).then(function(r){
        if (r && r.ok) { f.enreg = true; faits++; } else rate++;
        suite();
      });
    };
    suite();
  }

  function enregistrerUnFormat(f){
    if (!f || f.enreg || OCCUPE || RO) return;
    occuper(true);
    dire('Enregistrement du format ' + f.label + '…');
    appeler('studio:enregistrer', [{ image: f.image, nom: nomFormat(f) }]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        f.enreg = true;
        peindreResultat();
        dire('Format ' + f.label + ' enregistré dans la photothèque.', 'bon');
      } else dire(expliquer(r), 'err');
    });
  }

  function resultatHtml(){
    if (!RESULT) {
      return '<div class="vide" style="padding:.2rem">L’image apparaîtra ici.</div>' + guideHtml();
    }
    var av = photoAvant();
    var h = '';
    if (av) {
      h += '<div class="cmpb">'
        + '<button class="jeton' + (CMP ? ' on' : '') + '" id="cmp-on">⇔ Avant / après</button>'
        + '<button class="jeton' + (CMP ? '' : ' on') + '" id="cmp-off">Résultat seul</button></div>';
    }
    h += (av && CMP) ? comparateurHtml(av) : ('<img src="' + RESULT.image + '" alt="résultat">');
    if (RESULT.essai) h += '<div class="filig">⚠ Aperçu filigrané (sandbox) — gratuit. « Générer en pleine qualité » retire le filigrane.</div>';
    if (RESULT.decorErreur) h += '<div class="filig">⚠ Le décor n’a pas pu être appliqué : ' + esc(RESULT.decorErreur) + '</div>';
    if (RESULT.ignores) h += '<div class="filig">⚠ Le service a <strong>ignoré</strong> : '
      + esc(ignoresLisible(RESULT.ignores)) + '. Le reste du traitement a bien eu lieu.</div>';
    if (RESULT.upNote) h += '<div class="avis">' + esc(RESULT.upNote) + '</div>';
    if (RESULT.largeur) h += '<div class="dims">' + RESULT.largeur + ' × ' + RESULT.hauteur + ' px</div>';
    h += '<div class="dl"><button id="b-dl">Télécharger l’image</button> '
      + '<button id="b-save"' + (ENREG ? ' disabled' : '') + '>' + (ENREG ? '✓ Dans la photothèque' : '<span class="ic">💾</span> Enregistrer dans la photothèque') + '</button></div>';
    return h;
  }

  function nomVoie(v){
    var x = VOIES.filter(function(o){ return o.cle === v; })[0];
    return x ? x.t : v;
  }
  function nomPreset(c){
    var x = PRESETS.filter(function(o){ return o.cle === c; })[0];
    return (x && x.label) || c;
  }
  /* ⚠ << etapeFaite >> et << enteteEtape >> ont ete RETIREES a la cloture du
     chantier #29. Elles dessinaient l en-tete des cinq etapes numerotees,
     remplacees par les onglets en 3.47.0 : la coche vit desormais sur l onglet
     (ongletEtat + ongletRequis), et l en-tete du groupe est panneauHtml. */

  /* ══ CE QU ON VA GENERER, DIT AVANT DE PAYER ══════════════════════════════
     La voie, l ambiance, le mannequin, la pose et les reglages avances etaient
     etales sur quatre cartes : rien ne les rassemblait, et l on cliquait
     << Generer en pleine qualite >> sans pouvoir relire sa commande. */
  function recapHtml(){
    var j = ['<span class="jt">' + esc(nomVoie(VOIE)) + '</span>'];
    j.push(PRESET ? '<span class="jt">' + esc(nomPreset(PRESET)) + '</span>'
                  : '<span class="jt gris">ambiance à choisir</span>');
    if (VOIE === 'humain') {
      j.push('<span class="jt">' + esc(nomModele(MODELE_SEL)) + '</span>');
      j.push('<span class="jt">' + esc(nomPose(POSE_SEL)) + '</span>');
    }
    var a = resumeAvance(VOIE);
    if (a) {
      a.split(' · ').forEach(function(x){ j.push('<span class="jt">' + esc(x) + '</span>'); });
    }
    if (RESULT && RESULT.filigrane) j.push('<span class="jt">filigrané</span>');
    return '<div class="bloc recap"><span class="rt">Ce qui sera généré</span>'
      + '<div class="rc2">' + j.join('') + '</div>'
      + '<div class="note">L’aperçu est <strong>gratuit</strong> et filigrané : jugez d’abord, '
      + 'payez ensuite. Seul « Générer en pleine qualité » consomme un crédit, et il demande '
      + 'deux clics.</div></div>';
  }

  /* ⚠ INTUITIF = LE GESTE SUIVANT EST EVIDENT SANS LIRE. Les deux boutons du
     pied sont grises tant qu il manque une photo ou une ambiance, et rien ne
     disait laquelle : on cliquait sur un bouton mort sans comprendre. */
  function guideHtml(){
    var e1 = aUnePhoto(), e2 = !!PRESET;
    var l = function(ok, suiv, n, t){
      return '<div class="gp' + (ok ? ' ok' : (suiv ? ' suiv' : '')) + '">'
        + '<span class="n">' + (ok ? '✓' : n) + '</span><span>' + t + '</span></div>';
    };
    return '<div class="guide">'
      + l(e1, !e1, '1', 'Choisissez une photo')
      + l(e2, e1 && !e2, '2', 'Choisissez une ambiance')
      + l(false, e1 && e2, '3', 'Cliquez « Aperçu gratuit », en bas de la fenêtre')
      + '</div>';
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    /* Le selecteur de photos et le suivi des lots prennent TOUT l ecran : ils
       remplacent les deux volets au lieu de se serrer dans l un des deux. */
    if (PICKER || LOTS_VUE) {
      corps.className = 'corps plein';
      corps.innerHTML = '<div class="carte">' + pleinHtml() + '</div>';
      brancher();
      majBoutons();
      return;
    }
    corps.className = 'corps';
    /* ⚠ LA BARRE DES RECETTES EST HORS DES ONGLETS, ET AU-DESSUS D EUX. Elle ne
       regle rien elle-meme : elle remplit les neuf onglets d un coup. Rangee
       DANS un onglet, il faudrait savoir lequel avant de pouvoir s en servir. */
    corps.innerHTML = '<div class="rail">' + recettesHtml()
      + '<div class="railc"><div class="onglets" id="onglets" role="tablist">' + ongletsHtml() + '</div>'
      + '<section class="panneau" id="panneau">' + panneauHtml() + '</section></div></div>'
      + '<div class="scene">' + recapHtml()
      + '<div class="bloc res' + (RESULT ? ' garni' : '') + '" id="res">' + resultatHtml() + '</div>'
      /* Le bloc est TOUJOURS posé, même vide et caché : sans lui, il n existerait
         pas au moment où la première image arrive, et peindreResultat n aurait
         rien à remplir — les formats ne paraîtraient qu au redessin suivant. */
      + '<div class="bloc fmt" id="fmt"' + (RESULT ? '' : ' hidden') + '>'
      + formatsHtml() + '</div></div>';
    brancher();
    majBoutons();
  }

  function brancher(){
    var depot = document.getElementById('depot');
    var fichier = document.getElementById('fichier');
    if (depot && fichier && !RO && !aUnePhoto()) {
      depot.onclick = function(){ fichier.click(); };
      depot.ondragover = function(e){ e.preventDefault(); depot.classList.add('survol'); };
      depot.ondragleave = function(){ depot.classList.remove('survol'); };
      depot.ondrop = function(e){ e.preventDefault(); depot.classList.remove('survol');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) lireFichier(e.dataTransfer.files[0]); };
      fichier.onchange = function(){ if (fichier.files && fichier.files[0]) lireFichier(fichier.files[0]); };
    }
    // « Choisir une autre photo » : on repart de zéro.
    if (depot && aUnePhoto() && !RO) { depot.onclick = function(){ reinitPhoto(); }; }
    var phO = document.getElementById('ph-ouvrir'); if (phO) phO.onclick = ouvrirPicker;
    var px = document.getElementById('ph-explorateur');
    if (px) px.onclick = function(){
      appeler('explorateur:ouvrir', []).then(function(r){
        dire(r && r.ok ? 'Explorateur ouvert dans sa fenêtre.' : expliquer(r),
          (r && r.ok) ? 'bon' : 'err');
      });
    };
    var lv = document.getElementById('lots-voir');
    if (lv) lv.onclick = function(){ LOTS_VUE = true; chargerLots(); dessiner(); };
    var pnv = document.getElementById('pn-vider');
    if (pnv) pnv.onclick = function(){
      appeler('panier:vider', []).then(function(){ PANIER = []; dessiner(); });
    };
    var pnl = document.getElementById('pn-lot');
    if (pnl) pnl.onclick = function(){
      // Le meme voile que depuis le selecteur : une seule facon de lancer.
      SEL = {};
      PANIER.forEach(function(p){ SEL[p.id] = true; });
      ouvrirLotVoile();
    };
    brancherLots();
    brancherOnglets();
    brancherRecettes();
    var phR = document.getElementById('ph-retour'); if (phR) phR.onclick = function(){ PICKER = false; PHOTHQ = []; PH_Q = ''; dessiner(); };
    var phQ = document.getElementById('ph-q');
    if (phQ) {
      phQ.oninput = function(){ phRecherche(phQ.value); };
      phQ.onsearch = function(){ if (PH_DEB) { clearTimeout(PH_DEB); PH_DEB = null; } PH_Q = String(phQ.value || '').trim(); PH_PAGE = 0; PH_FIN = false; phChargerPage(true); };
    }
    var phG = document.getElementById('ph-grille');
    if (phG) {
      phBrancherVignettes(phG);
      phG.onscroll = function(){
        if (PH_OCC || PH_FIN) return;
        if (phG.scrollTop + phG.clientHeight >= phG.scrollHeight - 120) phChargerPage(false);
      };
      majPhInfo();
    }
    brancherExplorateur();
    corps.querySelectorAll('[data-voie]').forEach(function(el){
      el.onclick = function(){ if (RO || OCCUPE) return; VOIE = el.getAttribute('data-voie'); RESULT = null; dessiner();
        dire('Voie : ' + VOIE + '.', 'att'); };
    });
    corps.querySelectorAll('[data-preset]').forEach(function(el){
      el.onclick = function(){ if (RO || OCCUPE) return; PRESET = el.getAttribute('data-preset'); dessiner(); };
    });
    var ps = document.getElementById('pose');
    if (ps) ps.onchange = function(){
      POSE_SEL = ps.value;
      dessiner();
      dire('Pose : ' + (POSES.filter(function(p){ return p.cle === POSE_SEL; })[0] || {}).t + '.', 'att');
    };
    var msel = document.getElementById('modele-sel');
    if (msel) msel.onchange = function(){ choisirModele(msel.value); };
    brancherAvance();
    brancherFiligrane();
    brancherResultat();
  }

  /* ⚠ UN SEUL ENDROIT QUI REPEINT LE RESULTAT, et un seul qui le rebranche. Le
     volet se redessine par TROIS chemins (redessin complet, arrivee d une image,
     bascule du rideau) : trois copies du cablage, c est la garantie qu un jour
     l une d elles oubliera un bouton — le defaut exact qui avait laisse le
     lanceur de lot mort pendant deux versions. */
  function peindreResultat(){
    var res = document.getElementById('res');
    if (!res) { dessiner(); return; }
    res.className = 'bloc res' + (RESULT ? ' garni' : '');
    res.innerHTML = resultatHtml();
    // Le bloc des formats vit à côté du résultat, jamais dedans : le résultat est
    // centré dans ce qui reste du volet, et une liste de vignettes s y battrait.
    var fz = document.getElementById('fmt');
    if (fz) { fz.hidden = !RESULT; fz.innerHTML = formatsHtml(); }
    brancherResultat();
  }

  function brancherResultat(){
    var dl = document.getElementById('b-dl');
    if (dl && RESULT) dl.onclick = telecharger;
    var sv = document.getElementById('b-save');
    if (sv && RESULT) sv.onclick = enregistrerResultat;
    var c1 = document.getElementById('cmp-on');
    if (c1) c1.onclick = function(){ if (CMP) return; CMP = true; peindreResultat(); };
    var c0 = document.getElementById('cmp-off');
    if (c0) c0.onclick = function(){ if (!CMP) return; CMP = false; peindreResultat(); };
    brancherComparateur();
    brancherFormats();
  }

  function brancherFormats(){
    corps.querySelectorAll('[data-fmode]').forEach(function(el){
      el.onclick = function(){
        var m = el.getAttribute('data-fmode');
        if (m === FORM_MODE) return;
        FORM_MODE = m;
        /* ⚠ CHANGER DE GESTE INVALIDE CE QUI EST DÉJÀ FABRIQUÉ. Garder les
           vignettes recadrées sous un bouton « Marges » allumé, ce serait montrer
           quatre images qui ne correspondent plus au réglage affiché — et les
           faire enregistrer telles quelles. On les refait, c est instantané. */
        if (FORMATS.length) { preparerFormats(); return; }
        peindreResultat();
      };
    });
    var g = document.getElementById('fmt-go');
    if (g) g.onclick = preparerFormats;
    var sa = document.getElementById('fmt-save-all');
    if (sa) sa.onclick = enregistrerTousFormats;
    corps.querySelectorAll('[data-fdl]').forEach(function(el){
      el.onclick = function(){
        var f = formatParCle(el.getAttribute('data-fdl'));
        if (f) telechargerImage(f.image, nomFormat(f) + '.' + f.ext);
      };
    });
    corps.querySelectorAll('[data-fsv]').forEach(function(el){
      el.onclick = function(){ enregistrerUnFormat(formatParCle(el.getAttribute('data-fsv'))); };
    });
  }

  /* Le rideau. ⚠ POINTER EVENTS, jamais mousedown/mousemove : les deux entrees
     servent sur son poste. setPointerCapture garde le geste meme quand le doigt
     sort de l image, et touch-action:none empeche le defilement de le voler. */
  function brancherComparateur(){
    var z = document.getElementById('cmp');
    if (!z) return;
    var pg = document.getElementById('cmp-p');
    var tire = false;
    var ecrire = function(){
      z.style.setProperty('--x', CMP_POS.toFixed(2) + '%');
      if (pg) pg.setAttribute('aria-valuenow', String(Math.round(CMP_POS)));
    };
    var poser = function(x){
      var r = z.getBoundingClientRect();
      if (!r.width) return;
      CMP_POS = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
      ecrire();
    };
    z.onpointerdown = function(e){
      tire = true;
      try { z.setPointerCapture(e.pointerId); } catch (x) {}
      poser(e.clientX);
      e.preventDefault();
    };
    z.onpointermove = function(e){ if (tire) poser(e.clientX); };
    var fin = function(e){
      tire = false;
      try { z.releasePointerCapture(e.pointerId); } catch (x) {}
    };
    z.onpointerup = fin;
    z.onpointercancel = fin;
    // Au clavier : la poignee prend le focus, les fleches la deplacent.
    if (pg) pg.onkeydown = function(e){
      var d = (e.key === 'ArrowLeft' ? -4 : e.key === 'ArrowRight' ? 4
             : e.key === 'Home' ? -100 : e.key === 'End' ? 100 : 0);
      if (!d) return;
      e.preventDefault();
      CMP_POS = Math.max(0, Math.min(100, CMP_POS + d));
      ecrire();
    };
  }

  /* ⚠ ON NE REDESSINE PAS TOUT, et surtout on n arrete plus la fabrication en
     cours. Choisir un mannequin pendant que les portraits se fabriquent est
     naturel — l ancienne version arretait la generation a ce clic, ce qui
     laissait la liste a moitie remplie sans le dire. */
  function choisirModele(m){
    var av = MODELE_SEL;
    MODELE_SEL = m;
    if (av !== m) dire('Modèle : ' + nomModele(m) + '.', 'bon');
  }

  /* ⚠ << fabriquerPortraits >>, << refairePortraits >> et
     << genererApercusModeles >> ONT ETE RETIREES en 3.50.0, a sa demande. Elles
     fabriquaient les seize portraits de mannequins et les apercus par modele,
     pour une galerie disparue de l ecran le 2026-08-12 : leurs boutons
     (b-port, b-port-refaire, b-mgen) n etaient plus dessines nulle part, donc ce
     code parlait a Photoroom et deposait dans R2 sans que personne puisse le
     declencher — ni l eprouver. */

  /* ⚠ LA PHOTO D INTÉRIEUR PART AVEC LA PHOTO. Elle est celle de CE vêtement
     retourné : gardée d un vêtement au suivant, elle ferait raccorder un col sur
     une autre pièce — un défaut qu on ne verrait qu à l image, sans message. */
  function reinitPhoto(){
    PHOTO = null; PHOTO_ID = ''; PHOTO_URL = ''; PHOTO_NOM = '';
    PICKER = false; RESULT = null; ENREG = false;
    INTERIEUR = null; INTERIEUR_NOM = '';
    dessiner();
  }

  function lireFichier(f){
    if (!f || String(f.type).indexOf('image/') !== 0) { dire('Ce n’est pas une image.', 'err'); return; }
    dire('Lecture de la photo…');
    var fr = new FileReader();
    fr.onload = function(){ reduire(String(fr.result || ''), function(petite){
      PHOTO = petite; PHOTO_ID = ''; PHOTO_URL = ''; PHOTO_NOM = String(f.name || '');
      PICKER = false; RESULT = null; ENREG = false;
      INTERIEUR = null; INTERIEUR_NOM = '';   // elle appartenait au vêtement précédent
      dessiner(); dire('Photo prête.', 'bon'); }); };
    fr.onerror = function(){ dire('Lecture impossible.', 'err'); };
    fr.readAsDataURL(f);
  }

  // Grille de vignettes (partagee : rendu initial + rafraichissements de page).
  function phVignettesHtml(){
    if (!PHOTHQ.length) {
      /* ⚠ TROIS ETATS, PAS DEUX. << Pas encore charge >> n est PAS << vide >> :
         la synchronisation peut n avoir pas encore repondu, et annoncer
         << Photothèque vide >> a ce moment-la fait croire que la mediatheque a
         ete perdue — le message le plus inquietant possible sur des photos.
         Le site fait deja voyager l etat charge ; cette fenetre l ignorait. */
      if (!PH_CHARGE) {
        return '<div class="vide" style="grid-column:1/-1">Lecture de la photothèque…</div>';
      }
      return '<div class="vide" style="grid-column:1/-1">'
        + (PH_Q ? 'Aucune photo ne correspond à « ' + esc(PH_Q) + ' ».'
                : 'Aucune photo dans la photothèque. Importez-en depuis l’écran Photothèque.') + '</div>';
    }
    return PHOTHQ.map(function(p){
      var img = p.apercu
        ? '<img src="' + esc(p.apercu) + '" alt="' + esc(p.nom) + '" loading="lazy">'
        : '<span class="attente">en cours…</span>';
      var pris = !!SEL[p.id];
      // Les pastilles disent ce qu on ne devine pas d une vignette : deja
      // traitee (donc deja payee), detouree, rattachee a un produit.
      var pastilles = '';
      if ((p.faits || []).length) pastilles += '<span class="pt fait" title="Déjà traitée">✓</span>';
      if (p.isole) pastilles += '<span class="pt" title="Détourée">◇</span>';
      if (p.lieId) pastilles += '<span class="pt ic" title="' + esc(p.lieNom || 'Produit lié') + '">🔗</span>';
      return '<div class="phvig' + (pris ? ' pris' : '') + '" data-ph="' + esc(p.id) + '"'
        + ' title="' + esc(p.nom) + (p.lieNom ? ' — ' + esc(p.lieNom) : '') + '">'
        + '<span class="phcoche" data-sel="' + esc(p.id) + '">' + (pris ? '✓' : '') + '</span>'
        + (pastilles ? '<span class="phpast">' + pastilles + '</span>' : '')
        + img + '<span class="phnom">' + esc(p.nom) + '</span></div>';
    }).join('');
  }

  /* ══ LES FILTRES (#28) ════════════════════════════════════════════════════
     Le selecteur n offrait qu une recherche texte : pour choisir vingt photos
     parmi quatre cents, il fallait les reconnaitre a l oeil. Le coeur du site
     savait deja tout cela de chaque photo — ce n etait simplement pas offert. */
  function phFiltresHtml(){
    if (!PH_META) return '';
    var jeton = function(cle, nom){
      return '<button class="jeton' + (PH_FILTRES.indexOf(cle) >= 0 ? ' on' : '') + '"'
        + ' data-filtre="' + esc(cle) + '">' + esc(nom) + '</button>';
    };
    var h = '<div class="phfiltres">'
      + (PH_META.filtres || []).map(function(f){ return jeton(f.cle, f.nom); }).join('');
    // Le filtre le plus utile : ce qui n a PAS encore recu tel traitement.
    // Retraiter une photo deja faite coute un appel pour rien.
    h += '<select id="ph-sans"><option value="">Traitement — tous</option>'
      + (PH_META.traitements || []).map(function(t){
          return '<option value="' + esc(t.cle) + '"' + (PH_SANS === t.cle ? ' selected' : '')
            + '>Sans « ' + esc(t.nom) + ' »</option>'; }).join('') + '</select>';
    if ((PH_META.lots || []).length) {
      h += '<select id="ph-lot"><option value="">Tous les lots</option>'
        + PH_META.lots.map(function(l){
            return '<option value="' + esc(l.cle) + '"' + (PH_LOT === l.cle ? ' selected' : '')
              + '>' + esc(l.nom) + '</option>'; }).join('') + '</select>';
    }
    h += '<select id="ph-tri">'
      + [['recent', 'Plus récentes'], ['code', 'Code'], ['name', 'Nom'],
         ['linked', 'Liées d’abord'], ['size', 'Plus lourdes']].map(function(t){
          return '<option value="' + t[0] + '"' + (PH_TRI === t[0] ? ' selected' : '') + '>'
            + t[1] + '</option>'; }).join('') + '</select>';
    if (PH_FILTRES.length || PH_SANS || PH_LOT || PH_Q) {
      h += '<button class="jeton" id="ph-vider">✕ Tout effacer</button>';
    }
    return h + '</div>';
  }

  /* Le panier de selection : ce qu on emporte, visible AVANT de lancer quoi
     que ce soit. ⚠ << Tout selectionner >> porte sur TOUT LE RESULTAT du
     filtre, pas sur la page affichee — sinon il faudrait defiler six pages
     pour prendre 340 photos. Le coeur envoie exprès les identifiants. */
  function phSelectionHtml(){
    var n = Object.keys(SEL).length;
    var dispo = (PH_META && PH_META.tousLesIds) ? PH_META.tousLesIds.length : 0;
    return '<div class="phsel">'
      + '<span class="cpt' + (n ? ' on' : '') + '">' + (n ? n + ' photo' + (n > 1 ? 's' : '') + ' choisie' + (n > 1 ? 's' : '') : 'Aucune sélection') + '</span>'
      + '<button class="jeton" id="ph-tout"' + (dispo ? '' : ' disabled') + '>Tout sélectionner (' + dispo + ')</button>'
      + '<button class="jeton" id="ph-inv"' + (dispo ? '' : ' disabled') + '>Inverser</button>'
      + '<button class="jeton" id="ph-rien"' + (n ? '' : ' disabled') + '>Vider</button>'
      + '<span class="droite">'
      /* ⚠ ph-ouvrir-sel, PAS ph-ouvrir : ce dernier est le bouton
         « Depuis la photothèque » de l'écran de départ. Le doublon d'identifiant
         a fait que mon câblage écrasait le sien — et le bouton d'entrée ne
         faisait plus rien. Un identifiant réutilisé ne casse rien de visible :
         il détourne, en silence. */
      + (n === 1 ? '<button class="jeton prim" id="ph-ouvrir-sel">Ouvrir cette photo →</button>' : '')
      + (n > 1 ? '<button class="jeton prim" id="ph-lot">⚙ Traiter ces ' + n + ' photos en lot…</button>' : '')
      + '</span></div>';
  }

  /* ══ LANCER UN LOT (#27) ══════════════════════════════════════════════════
     ⚠ ON ANNONCE CE QUE CA COUTE AVANT, PAS APRES. Chaque photo est un appel
     facture : lancer 500 photos sans le dire serait la pire surprise possible.
     Le choix << refaire celles deja traitees >> est DECOCHE par defaut — le
     coeur les ecarte, et les recompter demande un geste volontaire. */
  /* ⚠⚠ CETTE FONCTION MANQUAIT, ET C EST TOUT LE DEFAUT. ouvrirLotVoile
     l appelait depuis le debut ; elle n existait ni ici ni globalement. Le
     clic sur << Traiter ces N en lot... >> levait donc un ReferenceError et
     mourait la : aucune surcouche, aucun message, rien. Les deux chemins
     etaient touches (le panier venu de l explorateur ET la barre du
     selecteur) — le lot n a jamais pu partir depuis l ecran.
     ⚠ LECON : un helper copie d une fenetre a l autre se copie ENTIER, code
     ET habillage. Ici seuls les appels avaient suivi. */
  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    // Clic hors de la boite = annuler (rien n est lance tant qu on n a pas
    // clique << Lancer le lot >>).
    v.onclick = function(ev){ if (ev.target === v) fermer(); };
    if (apres) apres(fermer);
    return fermer;
  }

  /* ══ LE LOT EMPORTE LA MISE EN SCÈNE (corrigé le 2026-08-14) ═══════════════
     ⚠⚠ IL PARTAIT EN RÉGLAGES D USINE, ET PERSONNE NE POUVAIT LE VOIR. Les
     deux lanceurs de lot envoyaient << options vide >> EN DUR : la voie, l ambiance,
     le mannequin et la pose choisis a l ecran juste au-dessus etaient purement
     et simplement jetes. 500 photos revenaient donc en Sophia / trois-quarts /
     aucun decor — et les 500 etaient facturees. C est exactement le contraire
     de ce qui avait ete demande : << je traite 500 photos avec des
     configurations particulieres >>.
     ⚠ LA CASE EST COCHEE PAR DEFAUT, mais elle EXISTE : un lot de simple
     detourage n a que faire d une ambiance, et l on doit pouvoir la refuser
     sans avoir a defaire ses reglages a l ecran. */
  /* ⚠⚠ LE TRAITEMENT D UN LOT N EST PAS LA VOIE DE L ÉCRAN. Le voile a son propre
     sélecteur, et surtout le « détourage » en lot NE PASSE PAS par Photoroom :
     il est fait par le détoureur, avec repli sur le canevas de la page. Ni
     l ambiance, ni la mise en scène, ni la finition n y ont le moindre effet.
     Annoncer « ambiance Plage dorée · Sophia » sur un lot de détourage, c est le
     défaut qu on vient de corriger, en plus discret : un réglage promis à
     l écran que rien n applique. Le voile dit donc la vérité du traitement
     CHOISI, et il la redit quand on en change. */
  function voiePourQuoi(q){
    q = String(q || '');
    return (q === 'humain' || q === 'fantome' || q === 'plat') ? q : '';
  }
  function reglagesPour(voie){
    if (!estVoie(voie)) return {};
    var o = optionsPour(voie);
    if (PRESET) o.preset = PRESET;
    var f = finitionPour(voie);
    if (f) o.finition = f;
    return o;
  }
  function resumeReglages(voie){
    if (!estVoie(voie)) return '';
    var b = [];
    if (PRESET) {
      var p = PRESETS.filter(function(x){ return x.cle === PRESET; })[0];
      b.push('ambiance ' + ((p && p.label) || PRESET));
    }
    if (voie === 'humain') { b.push(nomModele(MODELE_SEL)); b.push(nomPose(POSE_SEL)); }
    var a = resumeAvance(voie);
    if (a) b.push(a);
    return b.join(' · ');
  }
  /* Ce que le lot emporte VRAIMENT, selon le traitement choisi dans le voile.
     ⚠ Le filigrane n a rien a voir avec les reglages Photoroom : il emporte le
     logo (en pixels), sa position, sa taille et son opacite — et rien d autre. */
  function optionsLot(quoi, avecReglages){
    if (!avecReglages) return {};
    if (quoi === 'filigrane') {
      var lg = logoChoisi();
      return lg ? { logo: lg.image, position: FIL.position, taille: FIL.taille,
                    opacite: FIL.opacite, marge: FIL.marge } : {};
    }
    return reglagesPour(voiePourQuoi(quoi));
  }

  function reglagesLotHtml(quoi, coche){
    /* ⚠ LE FILIGRANE A SES PROPRES REGLAGES, et le dire << ne passe pas par
       Photoroom >> serait vrai mais trompeur : ce lot-la EMPORTE bien quelque
       chose de l ecran, et il faut savoir QUOI avant de lancer cinq cents
       photos — un logo mal place se voit sur les cinq cents. */
    if (quoi === 'filigrane') {
      var lg = logoChoisi();
      if (!lg) {
        return '<p style="color:#e08a8a;margin:.6rem 0 0">⚠ <strong>Aucun logo choisi.</strong> '
          + 'Ouvrez « Filigrane » dans la colonne de gauche et choisissez-en un : sans logo, '
          + 'le lot échouerait photo après photo.</p>';
      }
      return '<label class="rc"><input type="checkbox" id="lot-reglages"'
        + (coche === false ? '' : ' checked') + '> '
        + '<span><strong>Poser le filigrane réglé à l’écran</strong> — ' + esc(lg.nom) + ' · '
        + esc(nomPosition(FIL.position)) + ' · ' + FIL.taille + ' % · '
        + Math.round(FIL.opacite * 100) + ' % d’opacité.<br>'
        + '<span style="font-size:.74rem;color:var(--tx2)">Ce traitement ne passe par aucun service : '
        + '<strong>aucun appel, aucun crédit</strong>, qu’il y ait cinq photos ou cinq cents.</span>'
        + '</span></label>';
    }
    var voie = voiePourQuoi(quoi);
    if (!estVoie(voie)) {
      return '<p style="color:#d8b57a;margin:.6rem 0 0">⚠ Ce traitement ne passe pas par Photoroom : '
        + 'ni l’ambiance, ni la mise en scène, ni les réglages avancés n’y changent quoi que ce soit. '
        + 'Le détourage se fait au détoureur, et il n’a pas de décor à composer.</p>';
    }
    var r = resumeReglages(voie);
    if (!r) {
      return '<p style="color:var(--tx2);margin:.6rem 0 0">Aucune ambiance ni mise en scène '
        + 'choisie à l’écran : le lot partira avec les réglages par défaut.</p>';
    }
    // ⚠ La photo d intérieur est la SEULE chose du panneau avancé qui ne peut pas
    // suivre un lot : elle est propre à UN vêtement, pas à cinq cents.
    var sup = (voie === 'fantome' && INTERIEUR)
      ? '<br><span style="font-size:.74rem;color:#d8b57a">⚠ La photo d’intérieur ne suit pas un lot : '
        + 'chaque photo utilise celle qui lui est attachée dans la photothèque.</span>' : '';
    return '<label class="rc"><input type="checkbox" id="lot-reglages"'
      + (coche === false ? '' : ' checked') + '> '
      + '<span><strong>Appliquer la mise en scène de l’écran</strong> — ' + esc(r) + '.<br>'
      + '<span style="font-size:.74rem;color:var(--tx2)">Décochez pour un traitement brut, '
      + 'sans ambiance ni pose imposée.</span>' + sup + '</span></label>';
  }

  function ouvrirLotVoile(){
    var ids = Object.keys(SEL);
    /* ⚠ UNE SEULE PHOTO EST UN LOT VALIDE. Le garde etait << moins de 2 >>,
       alors que le panier propose << Traiter cette photo en lot... >> des UNE
       photo : le bouton existait et ne faisait rien. Un lot d une photo garde
       tout son sens — il part en arriere-plan et se suit comme les autres. */
    if (!ids.length) return;
    var nP = ids.length;
    var opts = (PH_META && PH_META.traitements) || [
      { cle: 'detourage', nom: 'Détourage' }, { cle: 'fantome', nom: 'Mannequin retiré' },
      { cle: 'humain', nom: 'Porté par un mannequin' }];
    /* ⚠ ON PRÉSÉLECTIONNE LA VOIE DE L ÉCRAN quand le lot sait la faire : le
       voile s ouvrait toujours sur le premier traitement de la liste, si bien
       qu on venait de régler un fantôme et qu on lançait un détourage. */
    var voieDef = opts.filter(function(t){ return t.cle === VOIE; }).length
      ? VOIE : String((opts[0] || {}).cle || '');
    /* ⚠ LA RECETTE EST PROPOSEE ICI, EN TETE, ET C EST LA DEMANDE : << pour
       traiter une photo ou des lots complets on doit me proposer si je desire
       utiliser un preset >>. La choisir remplit la mise en scene ENTIERE que le
       lot va emporter — voie, ambiance, mannequin, pose, reglages avances,
       filigrane — au lieu de la refaire reglage par reglage dans le volet de
       gauche avant d ouvrir ce voile.
       ⚠ Elle change AUSSI le traitement du lot, puisque la voie en fait partie :
       laisser le menu du dessus sur l ancienne voie enverrait cinq cents photos
       dans une mise en scene que la recette ne decrit pas. */
    var rcListe = RECETTES.length
      ? ('<div class="ch"><label for="lot-rc">Profil (facultatif)</label>'
        + '<select id="lot-rc"><option value="">— Garder les réglages de l’écran —</option>'
        + RECETTES.map(function(o){
            return '<option value="' + esc(o.id) + '"' + (RC_SEL === o.id ? ' selected' : '')
              + '>' + esc(o.nom) + '</option>'; }).join('')
        + '</select><div class="aidep">Il pose d’un coup la voie, l’ambiance, le mannequin, la '
        + 'pose, les réglages avancés et le filigrane de ce lot.</div></div>')
      : '';
    voile('<h3>⚙ Traiter ' + nP + ' photo' + (nP > 1 ? 's' : '') + ' en lot</h3>'
      + rcListe
      + '<div class="ch"><label for="lot-quoi">Traitement à appliquer</label>'
      + '<select id="lot-quoi">' + opts.map(function(t){
          return '<option value="' + esc(t.cle) + '"' + (t.cle === voieDef ? ' selected' : '')
            + '>' + esc(t.nom) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="lot-nom">Nom du lot (pour le retrouver dans le suivi)</label>'
      + '<input id="lot-nom" placeholder="Collection automne — détourage"></div>'
      + '<div id="lot-reg">' + reglagesLotHtml(voieDef) + '</div>'
      + '<label class="rc"><input type="checkbox" id="lot-prio"> '
      + '<span><strong>Priorité haute</strong> — ce lot passe devant ceux qui attendent.</span></label>'
      + '<label class="rc"><input type="checkbox" id="lot-refaire"> '
      + '<span><strong>Refaire celles déjà traitées.</strong> Par défaut elles sont écartées : '
      + 'les repasser coûte un appel chacune pour un résultat identique.</span></label>'
      + '<p style="color:var(--tx2)">Chaque photo est un appel facturé. Le lot part en arrière-plan : '
      + 'vous pouvez fermer cette fenêtre, le traitement continue et se suit depuis n’importe quel écran.</p>'
      /* ⚠ CE QUE ÇA VA COÛTER, AVANT DE CLIQUER. Le chiffre est demandé au relais
         (« studio:estimer ») et jamais recalculé ici : lui seul sait qu un fantôme
         avec décor est DEUX appels, et que le détourage part chez un autre
         fournisseur, cinquante fois moins cher. */
      + '<div id="lot-estim" style="margin:.6rem 0 0;padding:.5rem .6rem;border:1px solid #2a3a4e;'
      + 'border-radius:6px;background:#16202c;font-size:.8rem;color:var(--tx2)">Estimation du coût…</div>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Lancer le lot</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        var g = function(i){ var e = document.getElementById(i); return e ? e.value : ''; };
        /* Choisir une recette applique tout de suite les reglages a l ecran,
           PUIS rouvre le voile : le menu du traitement, le bloc des reglages et
           l estimation sont alors tous d accord entre eux, sans avoir a
           reproduire ici la logique de chacun. */
        var srcRc = document.getElementById('lot-rc');
        if (srcRc) srcRc.onchange = function(){
          var v = srcRc.value;
          fermer();
          appliquerRecette(v);
          ouvrirLotVoile();
        };
        var c = function(i){ var e = document.getElementById(i); return !!(e && e.checked); };
        /* Changer de traitement change ce qui s applique : on redit la vérité,
           en gardant le choix déjà fait sur la case. */
        /* ── L ESTIMATION, ET LE FREIN QU ELLE COMMANDE ───────────────────
           ⚠ L ÉCRAN PRÉVIENT, IL NE PROTÈGE PAS : le vrai mur est dans les relais
           (image-budget.php), parce qu un lot peut aussi partir d ailleurs. Ici on
           évite seulement de lancer pour rien.
           ⚠⚠ ET SI L ESTIMATION ÉCHOUE, ON LAISSE PARTIR. Bloquer sur un relais
           muet, ce serait interdire de travailler à cause du thermomètre : le
           plafond, lui, sera appliqué au serveur de toute façon. On le dit. */
        /* Un montant en français : « 12,50 », jamais « 12.50 ». ⚠ Sous la
           demi-cenne on garde trois décimales — un détourage coûte 0,002 $, et
           « 0,00 $ » pour cinq cents photos ferait croire à la gratuité. */
        var sous = function(v){
          var n = Number(v || 0);
          return (n > 0 && n < 0.01 ? n.toFixed(3) : n.toFixed(2)).replace('.', ',');
        };
        var majEstimation = function(){
          var z = document.getElementById('lot-estim');
          var b = document.getElementById('v-oui');
          if (!z) return;
          var quoi = g('lot-quoi');
          var voie = voiePourQuoi(quoi);
          var reg = (document.getElementById('lot-reglages') ? c('lot-reglages') : true)
            ? reglagesPour(voie) : {};
          /* ⚠ LE FILIGRANE NE SE DEMANDE PAS AU RELAIS : il ne passe par aucun
             service, donc il n a pas de prix a estimer. Poser la question ferait
             afficher << coût non estimé >> sur un traitement qui est GRATUIT —
             une inquiétude fabriquée de toutes pièces. */
          if (quoi === 'filigrane') {
            z.innerHTML = '<strong>' + nP + ' photo' + (nP > 1 ? 's' : '')
              + ' · aucun appel facturé</strong><br>Le filigrane est posé dans l’application, '
              + 'au canevas : il ne coûte rien et n’entame pas le plafond mensuel.';
            if (b) b.disabled = false;
            return;
          }
          z.textContent = 'Estimation du coût…';
          if (b) b.disabled = true;
          appeler('studio:estimer', [{ geste: (voie || quoi), nb: nP,
            preset: reg.preset || '', finition: reg.finition || {}, options: reg }]).then(function(r){
            if (b) b.disabled = false;
            var z2 = document.getElementById('lot-estim');
            if (!z2) return;
            if (!r || !r.ok) {
              z2.innerHTML = '<span style="color:#d8b57a">⚠ Coût non estimé</span> — le relais n’a pas '
                + 'répondu (' + esc(expliquer(r)) + '). Le lot peut partir : le plafond mensuel, lui, '
                + 'est appliqué au serveur et arrêtera la file s’il est atteint.';
              return;
            }
            var bu = r.budget || {};
            /* Une fourchette quand elle existe : l agrandissement ×4 est ignoré
               au-delà de 1000 px, donc il coûte « au plus » un appel de plus.
               Annoncer un chiffre unique et faux serait pire que la fourchette. */
            var mt = (r.coutMax > r.coutMin)
              ? ('de ' + sous(r.coutMin) + ' à ' + sous(r.coutMax) + ' $')
              : (sous(r.coutMax) + ' $');
            var app = (r.appelsMax > r.appelsMin)
              ? (r.appelsMin + ' à ' + r.appelsMax) : String(r.appelsMax);
            var h = '<strong>' + nP + ' photo' + (nP > 1 ? 's' : '') + ' · ' + app
              + ' appel' + (r.appelsMax > 1 ? 's' : '') + ' facturé' + (r.appelsMax > 1 ? 's' : '')
              + ' ≈ ' + mt + '</strong>';
            if (bu.actif) {
              h += '<br>Plafond du mois : ' + sous(bu.depense) + ' $ dépensés sur '
                + sous(bu.mensuel) + ' $ — il reste ' + sous(bu.restant) + ' $.';
            } else {
              h += '<br><span style="color:var(--tx2)">Aucun plafond mensuel n’est posé '
                + '(fenêtre « Traitements d’image »).</span>';
            }
            if (r.depasse) {
              /* ⚠⚠ ON NE RÉPOND PAS << non >>, ON RÉPOND << COMBIEN >>. Un refus
                 sec laisse deviner ; le nombre de photos qui rentrent permet de
                 découper le lot et de lancer tout de suite ce qui est possible. */
              var n2 = (r.photosPossibles == null) ? 0 : r.photosPossibles;
              h += '<br><span style="color:#e08a8a"><strong>Ce lot ne rentre pas dans le plafond.</strong> '
                + (n2 > 0
                    ? ('Il reste de quoi en traiter ' + n2 + ' — désélectionnez-en '
                       + (nP - n2) + ', ou relevez le plafond.')
                    : 'Relevez le plafond mensuel, ou attendez le mois prochain.')
                + '</span>';
              if (b) b.disabled = true;
            }
            z2.innerHTML = h;
          });
        };

        var sq = document.getElementById('lot-quoi');
        if (sq) sq.onchange = function(){
          var z = document.getElementById('lot-reg');
          if (!z) return;
          var avait = document.getElementById('lot-reglages') ? c('lot-reglages') : true;
          z.innerHTML = reglagesLotHtml(sq.value, avait);
          brancherCase();
          /* ⚠ CHANGER DE TRAITEMENT CHANGE LE PRIX, et pas d un peu : un fantôme
             avec décor coûte deux appels Photoroom, un détourage un appel chez un
             fournisseur cinquante fois moins cher. Laisser l ancien chiffre à
             l écran serait le mensonge que le voile vient tout juste d arrêter de
             dire sur la mise en scène. */
          majEstimation();
        };
        /* La case « appliquer la mise en scène » change elle aussi le compte
           d appels (l ambiance allume le décor du fantôme, donc un 2e appel).
           ⚠ ELLE EST REDESSINÉE À CHAQUE CHANGEMENT DE TRAITEMENT : un écouteur
           posé une seule fois mourrait avec le premier exemplaire de la case. On
           la rebranche donc après chaque redessin.
           ⚠ ET PAS SUR « corps » : la surcouche est ajoutée au BODY par voile(),
           un écouteur posé sur le corps de la fenêtre n aurait jamais rien reçu. */
        var brancherCase = function(){
          var cc = document.getElementById('lot-reglages');
          if (cc) cc.onchange = majEstimation;
        };
        brancherCase();
        majEstimation();
        document.getElementById('v-oui').onclick = function(){
          this.disabled = true;
          appeler('lots:creer', [{ ids: ids, quoi: g('lot-quoi'), nom: g('lot-nom'),
            priorite: c('lot-prio') ? 1 : 0, refaire: c('lot-refaire'),
            options: optionsLot(g('lot-quoi'), c('lot-reglages')) }]).then(function(r){
            fermer();
            if (!r.ok) {
              dire(r.motif === 'toutes_deja_faites'
                ? ('Ces ' + (r.deja || ids.length) + ' photos ont déjà ce traitement. Cochez « Refaire » pour les repasser.')
                : expliquer(r), 'err');
              return;
            }
            SEL = {};
            dire(r.nom + ' — ' + r.total + ' photo' + (r.total > 1 ? 's' : '') + ' en traitement'
              + (r.ignorees ? ' (' + r.ignorees + ' déjà faite' + (r.ignorees > 1 ? 's' : '') + ', écartée' + (r.ignorees > 1 ? 's' : '') + ')' : '')
              + '. Suivez-le en bas de n’importe quel écran.', 'bon');
            PICKER = false;
            LOTS_VUE = true;
            chargerLots();
          });
        };
      });
  }
  function majPhInfo(txt){
    var el = document.getElementById('ph-info');
    if (!el) return;
    if (txt != null) { el.textContent = txt; return; }
    if (PH_TOTAL <= 0) { el.textContent = PH_Q ? '0 résultat' : ''; return; }
    el.textContent = PHOTHQ.length + ' sur ' + PH_TOTAL + (PH_FIN ? '' : ' — défilez pour en voir plus');
  }
  // Rafraichit UNIQUEMENT la grille + le compteur (garde le focus dans la recherche).
  function phMajGrille(){
    var g = document.getElementById('ph-grille');
    if (g) { g.innerHTML = phVignettesHtml(); phBrancherVignettes(g); }
    majPhInfo();
  }

  /* ⚠⚠ LES EN-TETES SE REPEIGNENT AUSSI, ET C EST TOUT LE DEFAUT CORRIGE ICI.
     A l ouverture, la fenetre se dessine AVANT que la reponse arrive : les
     filtres et le panier sont donc rendus avec PH_META encore vide — donc
     aucun jeton, et << Tout selectionner (0) >> grise. Quand la reponse
     arrivait, on ne repeignait que la GRILLE : les en-tetes restaient figes
     sur l etat vide, pour toujours. L explorateur paraissait mort.
     ⚠ On repeint les DEUX blocs sans redessiner la page, pour ne pas voler le
     focus de la recherche pendant qu on tape. */
  function phMajEntetes(){
    var f = corps.querySelector('.phfiltres');
    if (f) f.outerHTML = phFiltresHtml();
    else {
      // Premiere apparition : le bloc n existait pas encore, on l insere
      // juste avant le panier.
      var s0 = corps.querySelector('.phsel');
      if (s0 && phFiltresHtml()) s0.insertAdjacentHTML('beforebegin', phFiltresHtml());
    }
    var s = corps.querySelector('.phsel');
    if (s) s.outerHTML = phSelectionHtml();
    brancherExplorateur();
  }
  /* ⚠ DEUX GESTES SUR UNE MEME VIGNETTE, ET IL FAUT LES DEUX : la COCHE
     ajoute au panier (on en prepare plusieurs), le reste de la vignette
     OUVRE la photo tout de suite (le geste courant, une photo a la fois).
     Confondre les deux forcerait a cocher puis valider pour un seul clic. */
  function brancherExplorateur(){
    // ⚠ RIEN A BRANCHER SI LE SELECTEUR EST FERME. Sans cette garde, on allait
    // chercher des identifiants qui n existent pas dans cet ecran — et l on
    // risquait d en accrocher un qui appartient a un autre bouton.
    if (!PICKER) return;
    corps.querySelectorAll('[data-filtre]').forEach(function(el){
      el.onclick = function(){
        var c = el.getAttribute('data-filtre');
        var i = PH_FILTRES.indexOf(c);
        if (i >= 0) PH_FILTRES.splice(i, 1); else PH_FILTRES.push(c);
        phRelancer();
      };
    });
    var s = document.getElementById('ph-sans');
    if (s) s.onchange = function(){ PH_SANS = s.value; phRelancer(); };
    var l = document.getElementById('ph-lot');
    if (l) l.onchange = function(){ PH_LOT = l.value; phRelancer(); };
    var t = document.getElementById('ph-tri');
    if (t) t.onchange = function(){ PH_TRI = t.value; phRelancer(); };
    var v = document.getElementById('ph-vider');
    if (v) v.onclick = function(){
      PH_FILTRES = []; PH_SANS = ''; PH_LOT = ''; PH_Q = '';
      var q = document.getElementById('ph-q'); if (q) q.value = '';
      phRelancer();
    };
    var tt = document.getElementById('ph-tout');
    if (tt) tt.onclick = function(){
      ((PH_META && PH_META.tousLesIds) || []).forEach(function(id){ SEL[id] = true; });
      phMajSelection();
    };
    var iv = document.getElementById('ph-inv');
    if (iv) iv.onclick = function(){
      ((PH_META && PH_META.tousLesIds) || []).forEach(function(id){
        if (SEL[id]) delete SEL[id]; else SEL[id] = true; });
      phMajSelection();
    };
    var rn = document.getElementById('ph-rien');
    if (rn) rn.onclick = function(){ SEL = {}; phMajSelection(); };
    var ov = document.getElementById('ph-ouvrir-sel');
    if (ov) ov.onclick = function(){
      var ids = Object.keys(SEL);
      if (ids.length === 1) choisirPhoto(ids[0]);
    };
    var lt = document.getElementById('ph-lot');
    if (lt) lt.onclick = ouvrirLotVoile;
  }

  /* ⚠ AUCUN REDESSIN COMPLET ICI : il volerait le focus
     de la recherche pendant qu on tape. Les en-tetes sont repeints par
     phMajEntetes quand la reponse arrive — ce qui suffit, et ne clignote
     pas. On repeint tout de suite les jetons pour que le clic se voie. */
  function phRelancer(){
    PH_PAGE = 0; PH_FIN = false;
    var f = corps.querySelector('.phfiltres');
    if (f) { f.outerHTML = phFiltresHtml(); brancherExplorateur(); }
    phChargerPage(true);
  }

  // Repeint le panier ET les coches, sans recharger la page de photos.
  function phMajSelection(){
    var z = corps.querySelector('.phsel');
    if (z) { z.outerHTML = phSelectionHtml(); brancherExplorateur(); }
    var g = document.getElementById('ph-grille');
    if (g) { g.innerHTML = phVignettesHtml(); phBrancherVignettes(g); }
  }

  function phBrancherVignettes(g){
    g.querySelectorAll('[data-sel]').forEach(function(el){
      el.onclick = function(ev){
        ev.stopPropagation();
        if (OCCUPE) return;
        var id = el.getAttribute('data-sel');
        if (SEL[id]) delete SEL[id]; else SEL[id] = true;
        phMajSelection();
      };
    });
    g.querySelectorAll('[data-ph]').forEach(function(el){
      el.onclick = function(){ if (OCCUPE) return; choisirPhoto(el.getAttribute('data-ph')); };
    });
  }
  // Charge une page. reset=true : nouvelle recherche (remplace) ; sinon : ajoute la suivante.
  function phChargerPage(reset){
    if (PH_OCC || RO) return;
    if (!reset && PH_FIN) return;
    PH_OCC = true;
    var page = reset ? 0 : (PH_PAGE + 1);
    majPhInfo(reset ? 'Recherche…' : 'Chargement…');
    /* ⚠ studio:explorer D ABORD, studio:phototheque EN REPLI : sur un site
       plus ancien la nouvelle op n existe pas, et la fenetre doit continuer de
       marcher — sans filtres, mais elle marche. */
    var saisie = { q: PH_Q, page: page, taille: PH_TAILLE, tri: PH_TRI,
      filtres: PH_FILTRES, sansTraitement: PH_SANS, lot: PH_LOT };
    appeler('studio:explorer', [saisie]).then(function(r){
      if (r && !r.ok && r.motif === 'operation_inconnue') {
        return appeler('studio:phototheque', [{ q: PH_Q, page: page, taille: PH_TAILLE }]);
      }
      return r;
    }).then(function(r){
      PH_OCC = false;
      if (!PICKER) return;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); majPhInfo(''); return; }
      var lot = r.photos || [];
      PH_CHARGE = (r.charge !== false);
      if (r.filtres) PH_META = r;   // l explorateur repond ; sinon on garde l ancien
      PHOTHQ = reset ? lot : PHOTHQ.concat(lot);
      PH_PAGE = (r.page != null) ? r.page : page;
      PH_TOTAL = (r.total != null) ? r.total : PHOTHQ.length;
      PH_FIN = (PHOTHQ.length >= PH_TOTAL) || (lot.length === 0);
      phMajGrille();
      phMajEntetes();
      dire('');
      // La page etait pleine mais la grille ne deborde pas encore : on tire la suivante.
      if (!PH_FIN && reset) phPeutEtreEncore();
    });
  }
  // Si la grille n'est pas encore assez remplie pour defiler, charge une page de plus.
  function phPeutEtreEncore(){
    var g = document.getElementById('ph-grille');
    if (g && !PH_FIN && !PH_OCC && g.scrollHeight <= g.clientHeight + 4) phChargerPage(false);
  }
  function ouvrirPicker(){
    if (RO || OCCUPE) return;
    PICKER = true; PHOTHQ = []; PH_Q = ''; PH_PAGE = 0; PH_TOTAL = 0; PH_FIN = false; PH_OCC = false;
    dessiner(); dire('Chargement de la photothèque…');
    phChargerPage(true);
    var q = document.getElementById('ph-q'); if (q) { try { q.focus(); } catch (e) {} }
  }
  function phRecherche(v){
    if (PH_DEB) clearTimeout(PH_DEB);
    PH_DEB = setTimeout(function(){
      PH_DEB = null;
      PH_Q = String(v || '').trim();
      PH_PAGE = 0; PH_FIN = false;
      phChargerPage(true);
    }, 250);
  }

  function choisirPhoto(id){
    var p = null;
    for (var i = 0; i < PHOTHQ.length; i++) { if (PHOTHQ[i].id === id) { p = PHOTHQ[i]; break; } }
    if (!p) return;
    PHOTO = null; PHOTO_ID = id; PHOTO_URL = p.apercu || ''; PHOTO_NOM = p.nom || '';
    PICKER = false; RESULT = null; ENREG = false;
    INTERIEUR = null; INTERIEUR_NOM = '';   // elle appartenait au vêtement précédent
    dessiner(); dire('Photo choisie : ' + (p.nom || id) + '.', 'bon');
  }

  function occuper(o){
    OCCUPE = o;
    corps.querySelectorAll('button, [data-voie], [data-preset], [data-ph], .depot').forEach(function(b){
      if (b.tagName === 'BUTTON') b.disabled = o; });
    majBoutons();
    var pret = pretALancer();
    bApercu.disabled = o || !pret;
    bFinal.disabled = o || !pret;
    if (bLot) bLot.disabled = o || RO;
  }

  function saisie(apercu){
    var s = { geste: VOIE, preset: PRESET, apercu: apercu };
    if (PHOTO_ID) { s.photoId = PHOTO_ID; } else { s.image = PHOTO; }
    if (VOIE === 'humain') {
      var sel = document.getElementById('modele-sel');
      if (sel) MODELE_SEL = sel.value;   // le menu déroulant reste la source si présent
      s.options = optionsPour('humain');
    }
    /* ⚠ « finition » VA À LA RACINE DU CORPS, jamais dans « options » : le relais ne
       la lit que là. Enfouie ailleurs, elle serait reçue et ignorée en silence —
       c est la faute qui a fait partir les lots en réglages d usine. */
    var f = finitionPour(VOIE);
    if (f) s.finition = f;
    // La seconde prise de vue : le relais ne la lit que pour le fantôme.
    if (VOIE === 'fantome' && INTERIEUR) s.interieur = INTERIEUR;
    return s;
  }

  function enregistrerResultat(){
    if (!RESULT || !RESULT.image || OCCUPE) return;
    if (ENREG) { dire('Déjà enregistrée dans la photothèque.', 'att'); return; }
    occuper(true); dire('Enregistrement dans la photothèque…');
    appeler('studio:enregistrer', [{ image: RESULT.image, nom: 'studio-' + VOIE + '-' + PRESET }]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        ENREG = true;
        var sv = document.getElementById('b-save');
        if (sv) { sv.textContent = '✓ Dans la photothèque'; sv.disabled = true; }
        dire('Enregistrée dans la photothèque — vous pouvez l’attacher à un article de là.', 'bon');
      } else dire(expliquer(r), 'err');
    });
  }

  function lancer(apercu){
    if (RO || OCCUPE) return;
    if (!aUnePhoto()) { dire('Importez d’abord une photo.', 'err'); return; }
    if (!PRESET) { dire('Choisissez une ambiance.', 'err'); return; }
    occuper(true);
    dire(apercu ? 'Aperçu gratuit en cours…' : 'Génération en pleine qualité…');
    appeler('studio:traiter', [saisie(apercu)]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        ENREG = false;
        RESULT = { image: r.image, essai: !!r.essai, decorErreur: r.decorErreur || '',
                   ignores: r.ignores || '',
                   upNote: r.upNote || '', largeur: r.largeur || 0, hauteur: r.hauteur || 0 };
        /* ⚠ LE RIDEAU REVIENT AU MILIEU A CHAQUE NOUVELLE IMAGE. Laisse la ou
           on l avait tire, un rideau pousse a fond a gauche montrerait l ANCIENNE
           photo en plein cadre : on croirait que le traitement n a rien fait —
           et l on relancerait, en payant une seconde fois. */
        CMP_POS = 50;
        /* ⚠⚠ LES FORMATS DE L IMAGE PRÉCÉDENTE SONT JETÉS. Les garder afficherait
           quatre vignettes de l ANCIENNE image sous la nouvelle, prêtes à être
           enregistrées : on rangerait dans la photothèque un cadrage qui n a
           jamais été demandé, sous le nom du bon. */
        FORMATS = [];
        // peindreResultat redessine tout si le volet de droite n existe pas
        // (plein ecran) : sinon l image serait produite, facturee, et jamais vue.
        peindreResultat();
        dire(apercu ? 'Aperçu prêt (gratuit).' : 'Image générée.', 'bon');
        if (!apercu) chargerCredits();
      } else {
        dire(expliquer(r), 'err');
      }
    });
  }

  /* ══ LA CONFIRMATION DE DÉPENSE (lot 3h du #29) ════════════════════════════
     Sa demande : << si plus de 1 credit est necessaire pour la generation par
     image, mettre une confirmation avant le lancement, et ce meme pour
     l apercu >>.

     ⚠ LE SEUIL PORTE SUR LES APPELS PAR IMAGE, PAS SUR LE BOUTON. Un mannequin
     virtuel, c est UN appel. Un fantome avec decor, c est DEUX. Avec
     l agrandissement, TROIS. Rien a l ecran ne disait cet ecart avant le clic :
     on croyait payer la meme chose selon la voie choisie trois onglets plus
     haut. C est exactement ce que ce voile vient rendre visible.

     ⚠⚠ ET L APERÇU NE COÛTE TOUJOURS RIEN. Il part sur la cle bac a sable :
     zero credit, quel que soit le nombre d appels (relais, ligne 610). Le voile
     s ouvre quand meme dans les memes cas — il les a demandes tous les deux —
     mais il DIT zero. Annoncer un montant la ou il n y en a pas fabrique une
     inquietude de toutes pieces, et l on finirait par ne plus croire l ecran le
     jour ou le chiffre est vrai. Ce que l apercu consomme reellement, c est le
     quota mensuel d apercus : c est donc CA qui est affiche.

     ⚠ UNE ESTIMATION QUI ECHOUE NE BLOQUE PAS. On n interdit pas un rendu parce
     qu on n a pas su le chiffrer : on passe, et le pied de page le dit. */
  function argent(n){ return (Math.round(Number(n || 0) * 100) / 100).toFixed(2).replace('.', ','); }

  // Ce qui cause les appels supplementaires, dit dans les mots de l ecran.
  function causesAppels(){
    var c = [];
    if (VOIE === 'fantome') {
      c.push('le <strong>fantôme habillé</strong> demande deux gestes : retirer le mannequin, puis poser le décor');
    }
    if (AV.upActive) c.push('l’<strong>agrandissement ×4</strong> est un appel de plus, après le traitement');
    return c;
  }

  function confirmerDepense(apercu, suite){
    if (RO || OCCUPE) return;
    var fin = finitionPour(VOIE) || {};
    var opt = (VOIE === 'humain') ? optionsPour('humain') : {};
    dire('Calcul du coût…');
    appeler('studio:estimer', [{ geste: VOIE, preset: PRESET, nb: 1, finition: fin, options: opt }])
      .then(function(r){
        if (!r || !r.ok) { dire('Coût non estimé — le rendu part quand même.', 'att'); suite(); return; }
        var n = r.appelsMax || 1;
        // Un seul appel par image : rien a confirmer, on ne met pas un voile
        // entre lui et le bouton pour le cas ordinaire.
        if (n <= 1) { dire(''); suite(); return; }
        var causes = causesAppels();
        var bu = r.budget || {};
        var h = '<h3>' + (apercu ? '<span class="ic">👁</span> Aperçu — ' : '⚠ ')
      + n + ' appels pour <em>une seule</em> photo</h3>';
        if (apercu) {
          h += '<p>Cet aperçu demande <strong>' + n + ' appels</strong> au service au lieu d’un seul. '
            + 'Il reste <strong>gratuit</strong> : il part sur la clé d’essai, <strong>aucun crédit '
            + 'n’est consommé</strong> et le plafond mensuel n’est pas entamé.</p>'
            + '<p>Ce qu’il consomme, ce sont vos <strong>aperçus du mois</strong> — ' + n
            + ' d’un coup — et le résultat sera <strong>filigrané</strong>.</p>';
        } else {
          h += '<p><strong>' + n + ' appels facturés ≈ ' + argent(r.coutMax) + ' $</strong> pour cette '
            + 'photo. Un mannequin virtuel n’en coûterait qu’un seul.</p>';
          if (bu.actif) {
            h += '<p>Plafond du mois : ' + argent(bu.depense) + ' $ dépensés sur ' + argent(bu.mensuel)
              + ' $ — il reste ' + argent(bu.restant) + ' $.</p>';
          }
        }
        /* ⚠ ON DIT COMMENT REDESCENDRE A UN APPEL, pas seulement combien ça
           coûte : un avertissement sans porte de sortie ne fait que retarder le
           même clic. Mais on ne le dit QUE si l on sait pourquoi — conseiller de
           decocher un agrandissement qui est deja decoche envoie chercher un
           reglage qui n existe pas, et l ecran perd sa credibilite pour la fois
           suivante, celle ou le montant compte vraiment. */
        if (causes.length) {
          h += '<p>Pourquoi : ' + causes.join(' ; ') + '.</p>';
          var sortie = [];
          if (AV.upActive) sortie.push('décochez l’agrandissement');
          if (VOIE === 'fantome') sortie.push('passez au « Mannequin virtuel »');
          if (sortie.length) {
            h += '<p class="rcav">Pour n’en payer qu’un : ' + sortie.join(', ou ') + '.</p>';
          }
        }
        h += '<div class="fin2"><button id="cd-non">Annuler</button>'
          + '<button class="' + (apercu ? 'prim' : 'conf') + '" id="cd-oui">'
          + (apercu ? 'Lancer l’aperçu' : 'Lancer — ' + argent(r.coutMax) + ' $') + '</button></div>';
        dire('');
        voile(h, function(fermer){
          var non = document.getElementById('cd-non');
          var oui = document.getElementById('cd-oui');
          if (non) non.onclick = fermer;
          if (oui) oui.onclick = function(){ fermer(); suite(); };
        });
      });
  }

  // Aperçu : gratuit, mais il passe par la même confirmation dès qu il demande
  // plus d un appel — c est la demande, et le voile dit franchement « 0 crédit ».
  bApercu.onclick = function(){
    if (RO || OCCUPE) return;
    confirmerDepense(true, function(){ lancer(true); });
  };
  // Pleine qualité : consomme des crédits → armement en deux temps.
  bFinal.onclick = function(){
    if (RO || OCCUPE) return;
    if (!ARME) {
      ARME = true; bFinal.className = 'prim conf'; bFinal.textContent = 'Confirmer (consomme des crédits)';
      dire('Un clic de plus lance un vrai rendu payant.', 'att');
      return;
    }
    ARME = false; bFinal.className = 'prim'; bFinal.textContent = 'Générer en pleine qualité';
    confirmerDepense(false, function(){ lancer(false); });
  };

  /* ⚠ LE LANCEUR DE LOT EST AU PIED DE PAGE, ET C EST TOUT L INTERET : il ne
     demande AUCUN defilement, quel que soit l onglet ouvert. Avant, il fallait
     ouvrir le selecteur de photos et descendre pour le trouver.
     Sans photo choisie, il ouvre le selecteur — repondre << rien a traiter >>
     a quelqu un qui vient justement demander a traiter serait un mur. */
  if (bLot) bLot.onclick = function(){
    if (RO || OCCUPE) return;
    if (PANIER && PANIER.length) {
      SEL = {};
      PANIER.forEach(function(p){ SEL[p.id] = true; });
      ouvrirLotVoile();
      return;
    }
    dire('Choisissez les photos du lot.', 'att');
    ouvrirPicker();
  };

  function telechargerImage(source, nom){
    if (!source) return;
    try {
      var a = document.createElement('a');
      a.href = source;
      a.download = nom;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      dire('Téléchargement lancé.', 'bon');
    } catch (e) { dire('Téléchargement impossible.', 'err'); }
  }

  function telecharger(){
    if (!RESULT || !RESULT.image) return;
    telechargerImage(RESULT.image, 'studio-' + VOIE + '-' + PRESET + '.png');
  }

  function chargerCredits(){
    appeler('studio:compte').then(function(r){
      if (!r || !r.ok) { creditsEl.textContent = ''; return; }
      var dispo = r.compte && r.compte.available != null ? r.compte.available : null;
      var sb = r.sandbox || {};
      var t = '';
      if (dispo != null) t += 'Crédits : <b>' + dispo + '</b>';
      if (sb.utilise != null) t += (t ? ' · ' : '') + 'Aperçus ce mois : ' + sb.utilise + (sb.quotaMois ? ' / ' + sb.quotaMois : '');
      creditsEl.innerHTML = t;
    });
  }

  function charger(){
    dire('Chargement des ambiances…');
    appeler('studio:presets').then(function(r){
      if (!r || !r.ok) {
        corps.className = 'corps plein';
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      PRESETS = r.presets || [];
      dessiner();
      if (RES_TEMOIN) posterResultatTemoin();
      dire('');
      chargerCredits();
      chargerLogos();
      chargerRecettes();
    });
  }

  /* Le résultat témoin du mode de contrôle : une image d un pixel, aucun appel,
     aucun crédit. Il allume EXPRÈS tous les avis (aperçu filigrané, décor
     refusé, réglages ignorés, note d agrandissement) — sinon ces quatre lignes
     ne seraient dessinées nulle part. */
  function posterResultatTemoin(){
    PHOTO = PIXEL;
    PHOTO_NOM = 'photo témoin';
    if (!PRESET) PRESET = (PRESETS[0] || {}).cle || '';
    ENREG = false;
    RESULT = { image: PIXEL, essai: true,
               decorErreur: 'le décor n’a pas pu être appliqué (témoin)',
               ignores: 'background.prompt,shadow.mode',
               upNote: 'Agrandissement ignoré : l’entrée dépasse 1000 px (témoin).',
               largeur: 1200, hauteur: 1600 };
    /* ⚠ DEUX FORMATS TÉMOINS, DONT UN DÉJÀ ENREGISTRÉ. Les vignettes ne naissent
       qu au CLIC sur « Préparer », et le banc ne clique pas ; et le canevas
       n existe pas dans le contexte de contrôle, donc les fabriquer pour de vrai
       est impossible. On pose donc la liste, seul état dont dépend le dessin —
       les deux états du bouton d enregistrement compris. */
    /* Deux logos témoins, pour que la grille, l état << choisi >> et le bouton
       << Appliquer >> soient dessinés au moins une fois. */
    if (!LOGOS.length) {
      LOGOS = [{ id: 'lg1', nom: 'Logo témoin', image: PIXEL },
               { id: 'lg2', nom: 'Logo témoin 2', image: PIXEL }];
      if (!FIL.logoId) FIL.logoId = 'lg1';
    }
    FORMATS = [
      { cle: '3x4', label: '3:4', largeur: 1200, hauteur: 1600,
        image: PIXEL, ext: 'jpg', enreg: false },
      { cle: '1x1', label: '1:1', largeur: 1200, hauteur: 1200,
        image: PIXEL, ext: 'png', enreg: true }
    ];
    dessiner();
  }

  /* ⚠ IDENTIFIANTS D OUVERTURE DES ONGLETS DE REGLAGES. Le panneau replie a
     disparu (lot 3g), mais le banc ne CLIQUE toujours pas : un seul groupe est
     dessine a la fois, donc sans identifiant, huit des neuf resteraient hors de
     tout controle. << avance >> ouvre le decor du mannequin virtuel ;
     << avance-plein >> passe au fantome avec ombre reglee a la main et
     agrandissement actif et ouvre les OMBRES — c est le seul etat ou les
     glissieres d ombre et le mode d agrandissement existent. C est l ecran qui
     decide CE QU ON PAIE : il se verifie. */
  if (${avOuvre ? 'true' : 'false'}) ONGLET = 'decor';
  if (${avPlein ? 'true' : 'false'}) { VOIE = 'fantome'; AV.ombreActive = true; AV.upActive = true;
    ONGLET = 'ombres'; }
  /* ⚠⚠ IDENTIFIANT D OUVERTURE << resultat >>. Tout le volet de droite garni — le
     comparateur avant/apres, les avis du service, les dimensions, les deux
     boutons — n existe qu APRES un vrai traitement, donc apres un CLIC et un
     appel FACTURE. Le banc ne clique pas et ne paie pas : cette surface serait
     restee hors de tout controle, exactement comme le lanceur de lot mort
     pendant deux versions. Ce mode pose une photo temoin et un resultat temoin,
     tous deux inertes (une image de 1 pixel). La coquille ne l ouvre jamais. */
  if (${resTemoin ? 'true' : 'false'}) RES_TEMOIN = true;
  /* ⚠ IDENTIFIANT D OUVERTURE << filigrane >>. Un seul onglet est dessine a la
     fois : sans lui, la grille de logos, les neuf ancrages, les trois glissieres
     et les deux boutons ne paraitraient nulle part. Il pose en plus un resultat
     temoin, pour que le bouton << Appliquer >> existe. */
  if (${filTemoin ? 'true' : 'false'}) { RES_TEMOIN = true; ONGLET = 'filigrane'; }
  /* ⚠ IDENTIFIANT D OUVERTURE << recettes >>. La BARRE des recettes est toujours
     visible — elle n a rien de replie —, mais le VOILE d enregistrement, si :
     il n existe qu apres un clic sur << Enregistrer... >>, et le banc ne clique
     pas. C est pourtant la que se decide un ECRASEMENT, donc une perte. */
  if (${rcTemoin ? 'true' : 'false'}) RC_VOILE_DEP = true;
  charger();
  lotsSuivre();
  chargerPanier();
  setInterval(function(){ if (!document.hidden) chargerPanier(); }, 2000);
  if (${explo ? 'true' : 'false'}) ouvrirPicker();
  if (${lotsDep ? 'true' : 'false'}) { LOTS_VUE = true; chargerLots(); }
})();
</script></body></html>`;
}

module.exports = { pageStudio };
