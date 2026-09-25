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
 * relais ne pose finition (fond décrit au texte, ombre réglable, relumière)
 * que sur le FANTÔME — en un second appel — et sur le PRODUIT À PLAT, en un
 * appel unique. Le mannequin virtuel compose sa scène par options (décor,
 * pose, modèle, expression, précisions libres) et la photo d'intérieur n'est lue
 * que pour le fantôme. Dessiner une glissière d'ombre sous un mannequin virtuel
 * serait un mensonge d'écran : le réglage partirait, serait ignoré en silence, et
 * l'on chercherait la panne dans le résultat.
 *
 * ⚠ preset et finition voyagent À LA RACINE du corps, jamais dans options —
 * enfouis là, ils sont reçus et jetés sans un mot (le défaut des lots, 3.40.0).
 *
 * ⚠ L'APERÇU SANDBOX EST GRATUIT ET FILIGRANÉ : c'est le levier crédits. Le bouton
 * payant s'arme en deux temps pour qu'aucun crédit ne parte par mégarde.
 *
 * ⚠ AUCUN CARACTÈRE  (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, SEP_DEC } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('studio');

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
.tete .credits{margin-left:auto;font-size:.74rem;color:var(--tx2)}
/* Le temoin des traitements, dans l en-tete (2026-09-09). Discret : pas de fond,
   pas de cadre, la couleur du texte secondaire — il ne reclame rien tant qu on
   ne le cherche pas. Il s eclaire au survol, comme tout ce qui se clique.
   ⚠ 30 px de cote au minimum : une icone de 16 px sans cadre est une cible
   qu on rate, et ce depot a deja paye ca sur les cadenas des listes (<< viser
   douze pixels a la souris est un exercice d adresse >>). */
.tete .tj{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;
  width:30px;height:30px;padding:0;margin-left:.55rem;border:0;border-radius:8px;
  background:none;color:var(--tx2);cursor:pointer}
.tete .tj:hover{background:var(--v08);color:var(--tx)}
.tete .tj:focus-visible{outline:2px solid #c9a97e;outline-offset:1px}
.tete .tj svg{width:17px;height:17px;display:block}
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
.scene::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
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
  background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;
  padding:.5rem .6rem}
.rcbar label{flex:0 0 auto;font:700 .7rem/1 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.rcbar select{flex:1 1 auto;min-width:0;font-size:.78rem;padding:.3rem .45rem}
.rcbar button{flex:0 0 auto;font:inherit;font-size:.73rem;padding:.3rem .55rem;
  border-radius:8px;cursor:pointer;color:var(--tx-bleute);background:var(--v05);
  border:1px solid var(--v16)}
.rcbar button:hover:not(:disabled){background:var(--v10)}
.rcbar button:disabled{opacity:.4;cursor:default}
.rcbar button.x{color:#e79a9a}
/* L avertissement d ecrasement du voile d enregistrement. */
.rcav{color:var(--tx-or)}
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
.ong:hover:not(.on):not(:disabled){background:var(--v05)}
/* ⚠ L ONGLET FERME TANT QU IL N Y A PAS DE PHOTO (2026-09-09, sa demande).
   ⚠ LE CURSEUR INTERDIT ET PAS SEULEMENT L OPACITE : c est le curseur qui dit
   << ce n est pas encore le moment >> avant meme le clic. L opacite seule se lit
   comme un defaut d affichage.
   ⚠ 55 % et non 40 % : on doit encore POUVOIR LIRE les noms des etapes. Un rail
   illisible ne dit plus ce qui attend, et c est justement ce qu on regarde en
   arrivant sur cet ecran. */
.ong:disabled{opacity:.55;cursor:not-allowed}
.ong.on{background:var(--f-carte);border-color:rgba(201,169,126,.45)}
/* ⚠ L ONGLET OUVERT SE MARQUE PAR SON FOND ET SON LISERE DORES, jamais par un
   pictogramme. Il en portait un, grise ; les pictogrammes ont ete retires le
   2026-09-05 et les regles .oi / .pi sont parties avec eux. */
.ong .ot{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.2}
.ong .ot b{font:600 .79rem/1.25 system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ong .oe{font-size:.68rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ong.on .oe{color:var(--tx2)}
/* ⚠⚠ LE CROCHET EST VERT DEPUIS LE 2026-09-09, sa demande : << mets aussi un
   crochet vert quand la section est remplie, exemple la photo est choisie tu
   coches vert >>.
   IL ETAIT OR — la couleur de l accent de toute cette fenetre, celle de l onglet
   actif, des tuiles choisies, du bouton principal. Un crochet or au milieu de
   tout ce qui est deja or ne se distingue de rien : il disait << rempli >> dans
   la meme voix que << selectionne >> et << a faire >>. Le vert est la seule
   couleur de cette interface qui ne veut dire qu une chose.
   ⚠ --tx-ok2 et non un vert en dur : c est le vert du socle, dont la reprise en
   mode jour est deja verifiee par les bancs. Un vert invente ici aurait ete a
   corriger deux fois.
   ⚠ ET IL GROSSIT UN PEU : a .8 rem, un crochet au bout d une ligne de rail
   etroit passe inapercu — or c est justement ce qu on vient chercher d un coup
   d oeil. */
.ong .oc{flex:0 0 auto;color:var(--tx-ok2);font-size:.95rem;font-weight:700;line-height:1}
.panneau{flex:1 1 auto;min-width:0;min-height:0;overflow-y:auto;
  background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;
  padding:.85rem .95rem}
.pnt{display:flex;align-items:center;gap:.55rem}
.pnt h2{margin:0;font:700 .95rem/1.2 Georgia,serif}
.panneau .sous{margin:.28rem 0 .7rem;font-size:.74rem;color:var(--tx3);line-height:1.4}
.onglets::-webkit-scrollbar,.panneau::-webkit-scrollbar{width:8px}
.onglets::-webkit-scrollbar-thumb,.panneau::-webkit-scrollbar-thumb{
  background:var(--v12);border-radius:8px}
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
.bloc{background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;
  padding:.85rem 1rem;min-width:0}
.recap .rt,.fmt .rt{font:700 .74rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2)}
.recap .rc2{display:flex;flex-wrap:wrap;gap:.32rem;margin-top:.5rem}
.recap .jt{font-size:.75rem;padding:.16rem .55rem;border-radius:99px;
  background:rgba(201,169,126,.14);border:1px solid rgba(201,169,126,.3);color:var(--tx-creme)}
.recap .jt.gris{background:var(--v05);border-color:var(--v14);color:var(--tx2)}
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
.loggr::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.logv{background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;padding:.3rem;cursor:pointer;
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
.posc span{display:block;width:.6rem;height:.6rem;border-radius:2px;background:var(--v35)}
.posc.on{border-color:#c9a97e;background:rgba(201,169,126,.16)}
.posc.on span{background:#c9a97e}
.fmt .fbar{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin-top:.55rem}
.fmt .fbar .grand{margin-left:auto}
.fmtg{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5rem,1fr));gap:.55rem;
  align-content:start;margin-top:.6rem}
.fmtc{background:var(--f-pill);border:1px solid var(--v09);border-radius:9px;padding:.45rem;
  display:flex;flex-direction:column;align-items:center;gap:.3rem;min-width:0}
.fmtc img{width:100%;height:7.5rem;object-fit:contain;background:var(--f-pied);border-radius:6px;
  border:1px solid var(--v07)}
.fmtc .ft{font-size:.82rem;font-weight:700;line-height:1.1}
.fmtc .fd{font-size:.68rem;color:var(--tx3);font-variant-numeric:tabular-nums}
.fmtc .fb{display:flex;gap:.25rem;width:100%}
.fmtc .fb button{flex:1 1 auto;padding:.24rem .3rem;font-size:.72rem}
/* Le geste suivant, sans avoir a lire une aide : ce qui est fait porte une
   coche, ce qui vient est mis en avant. */
.guide{display:flex;flex-direction:column;gap:.45rem;text-align:left;margin:.7rem auto 0;max-width:24rem}
.guide .gp{display:flex;align-items:center;gap:.55rem;font-size:.82rem;color:var(--tx3)}
.guide .gp .n{flex:0 0 auto;width:1.35rem;height:1.35rem;border-radius:50%;
  border:1px solid var(--v18);background:var(--v05);
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
.depot{border:1.5px dashed var(--v12);border-radius:10px;background:var(--f-champ);cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25rem;
  min-height:5rem;text-align:center;color:var(--tx2);font-size:.78rem;padding:.6rem .7rem;
  -webkit-user-select:none;user-select:none}
.depot:hover,.depot.survol{border-color:#c9a97e;color:var(--tx-bleute)}
.depot .gros{font-size:1.15rem;filter:grayscale(1) brightness(1.6)}
.depot img{max-width:100%;max-height:14rem;border-radius:8px}
.depot .refaire{font-size:.72rem;color:var(--tx2);text-decoration:underline;margin-top:.3rem}
/* La barre de l ecran plein largeur (le suivi des lots).
   ⚠ LE RESTE DE CE BLOC EST PARTI AVEC LE SELECTEUR (#30, le 2026-09-19) :
   grille, vignettes, coches, pastilles, filtres et panier de selection. Du CSS
   qui habille un ecran retire est exactement ce que ce fichier reproche
   ailleurs — du code vivant que plus rien ne dessine.
   ⚠ .jeton RESTE, et il n appartenait PAS au selecteur : les boutons des lots
   (pause, arreter, reprendre, retirer), les modes de format et la bascule
   avant/apres s en servent tous. Verifie avant de couper. */
.phbarre{display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem}
.phbarre .phinfo{font-size:.74rem;color:var(--tx2);margin-left:auto;white-space:nowrap}
.jeton{font:inherit;font-size:.73rem;padding:.16rem .55rem;border-radius:99px;cursor:pointer;
  color:var(--tx-bleute);background:var(--v05);border:1px solid var(--v15)}
.jeton:hover:not(:disabled){background:var(--v10);border-color:var(--v30)}
.jeton:disabled{opacity:.4;cursor:default}
.jeton.on{background:rgba(201,169,126,.2);border-color:#c9a97e;color:var(--tx-creme);font-weight:600}
.jeton.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
/* Le panier venu de l explorateur : ce qu on s apprete a traiter. */
.panier{margin-top:.55rem;padding:.5rem .6rem;border-radius:10px;
  background:rgba(201,169,126,.1);border:1px solid rgba(201,169,126,.35)}
.panier .pt{display:flex;align-items:center;gap:.4rem;font-size:.8rem;margin-bottom:.4rem}
.panier .pt .dt{color:var(--tx2);font-size:.74rem}
.panier .pt button{margin-left:auto}
.panier .pv{display:flex;gap:.25rem;align-items:center;flex-wrap:wrap;margin-bottom:.45rem}
.panier .pv img{width:2.2rem;height:2.2rem;object-fit:contain;border-radius:5px;background:var(--f-pied)}
.panier .pv .tr{width:2.2rem;height:2.2rem;border-radius:5px;background:var(--v06)}
.panier .pv .pl{font-size:.72rem;color:var(--tx2)}
.panier .pvb{padding:0;border:2px solid transparent;border-radius:7px;background:none;line-height:0}
.panier .pvb.on{border-color:#c9a97e}
.panier .pvb:hover:not(.on){border-color:var(--v20)}
/* L apercu de la photo de depart, a droite, avant tout rendu (2026-09-25). */
.srcap{display:flex;flex-direction:column;align-items:center;gap:.5rem;width:100%}
.srcap img{max-width:100%;max-height:52vh;object-fit:contain;border-radius:10px;background:var(--f-pied)}
.srcap .nm{font-size:.8rem;color:var(--tx2)}
.navp{display:flex;align-items:center;justify-content:center;gap:.6rem;font-size:.82rem;color:var(--tx2)}
.navp button{min-width:2.3rem;height:2.1rem;font-size:1.05rem;line-height:1}
.panier button.prim{width:100%}
/* ── Suivi des lots ──────────────────────────────────────────────────────── */
.lots{display:flex;flex-direction:column;gap:.5rem;max-height:calc(100vh - 14rem);overflow-y:auto}
.lotc{background:var(--f-pill);border:1px solid var(--v09);border-radius:10px;padding:.5rem .65rem}
.lotc.vif{border-color:#c9a97e}
.lott{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap;margin-bottom:.35rem}
.lott strong{font-size:.85rem}
.lott .dt{font-size:.72rem;color:var(--tx2);margin-left:auto}
.lotc .jauge{height:.42rem;border-radius:99px;background:var(--v12);overflow:hidden}
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
   La tuile empile donc le titre et sa description.
   ⚠ ELLE AVAIT UNE COLONNE DE GAUCHE POUR L EMOJI. Les pictogrammes sont
   retires depuis le 2026-09-05, et la colonne est partie AVEC : la garder
   aurait laisse un retrait vide devant chaque titre, que plus rien n explique. */
.tuiles{display:grid;grid-template-columns:1fr;gap:.4rem}
.tuile{background:var(--f-pill);border:1px solid var(--v09);border-radius:10px;
  padding:.58rem .7rem;cursor:pointer;-webkit-user-select:none;user-select:none;
  display:grid;grid-template-columns:1fr;row-gap:.08rem;
  align-items:center;text-align:left;transition:border-color .12s,background .12s}
.tuile:hover{border-color:rgba(201,169,126,.5)}
.tuile.on{border-color:#c9a97e;background:rgba(201,169,126,.14)}
.tuile .t{font-size:.85rem;font-weight:700;line-height:1.25}
.tuile .d{font-size:.72rem;color:var(--tx3);line-height:1.32}
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
select{width:100%;font:inherit;color:var(--tx);background:var(--f-champ);border:1px solid var(--v12);
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
.aidep.att{color:var(--tx-or)}
textarea{width:100%;font:inherit;font-size:.82rem;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:8px;padding:.4rem .5rem;resize:vertical;min-height:3.2rem}
textarea:focus{outline:none;border-color:#c9a97e}
input[type=text]{width:100%;font:inherit;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:8px;padding:.4rem .5rem}
input[type=text]:focus{outline:none;border-color:#c9a97e}
input[type=range]{width:100%;accent-color:#c9a97e;margin:.3rem 0 0;cursor:pointer}
.avlab{display:flex;align-items:baseline;gap:.4rem}
.avlab b{color:var(--tx-or);font-size:.78rem;font-variant-numeric:tabular-nums}
.avint{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:.4rem}
.avint img{width:3.4rem;height:3.4rem;object-fit:contain;background:var(--f-pied);border-radius:7px;
  border:1px solid var(--v10)}
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
  border:1px solid var(--v10)}
/* ⚠ La couche du DESSUS est l APRES, rognee par la GAUCHE : ce qui reste
   visible a gauche est donc l avant, pose dessous. Un fond opaque, sinon un
   detourage transparent laisserait voir la photo d origine au travers — et
   l on croirait le detourage rate. */
.cmp .cb{position:absolute;inset:0;overflow:hidden;background:var(--f-pied);border-radius:9px;
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
  border:1px solid var(--v10)}
.res .filig{margin-top:.5rem;font-size:.74rem;color:var(--tx-jaune)}
.res .avis{margin-top:.4rem;font-size:.74rem;color:var(--tx2)}
.res .dims{font-size:.7rem;color:var(--tx3);margin-top:.2rem}
.res .dl{margin-top:.6rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.55rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
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
.voile .boite{background:var(--f-carte);border:1px solid var(--v12);
  border-radius:13px;padding:1rem 1.15rem;max-width:29rem;width:100%;
  max-height:88vh;overflow-y:auto;box-shadow:0 18px 46px rgba(0,0,0,.5)}
.voile h3{margin:0 0 .5rem;font:700 1.02rem/1.25 Georgia,serif}
.voile p{margin:.6rem 0 0;font-size:.79rem;line-height:1.55}
.voile input[type=text],.voile input:not([type]){width:100%;font:inherit;color:var(--tx);
  background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;padding:.4rem .5rem}
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
  /* ⚠ L IDENTIFIANT D OUVERTURE << explorateur >> EST PARTI AVEC L ECRAN QU IL
     OUVRAIT (#30, 2026-09-19). Il existait parce que le banc ne clique pas et
     que le selecteur ne s atteignait qu apres un clic ; il n y a plus de
     selecteur a atteindre. L ecran qui choisit ce qu on va payer est
     desormais l EXPLORATEUR, qui a sa propre fenetre et son propre banc. */
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
  return `${TETE()}
<title>${T("Studio virtuel — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.studio}</span><h1>${T("Studio virtuel")}</h1>
  <span class="credits" id="credits"></span>
  <!-- ⚠ « Traitements » EST ICI DEPUIS LE 2026-09-09, sa demande : « une icône
       plus discrète à un autre endroit que lors de la sélection des photos ».
       C'était un bouton pleine largeur au milieu du chemin « choisir une photo »
       — or ce n'est pas une étape du travail, c'est un TÉMOIN.
       ⚠ ET IL N'A PAS BESOIN DE PORTER UN COMPTEUR : le bandeau des lots du
       socle, en bas de CHAQUE fenêtre, montre déjà l'avancement en direct (nom,
       jauge, 12/40, file). Cette icône ne porte donc que la PORTE vers l'écran
       détaillé — celui où l'on met en pause et où l'on arrête. Ajouter un
       compteur ici aurait dit deux fois la même chose, et le premier des deux
       était périmé : le sondage des lots ne tournait que sur l'écran des lots. -->
  <button class="tj" id="lots-voir" title="${T("Traitements par lot — voir la file, mettre en pause, arrêter")}"
    aria-label="${T("Traitements par lot")}">${ICO.clock}</button></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : votre rôle ne permet pas de lancer de traitement.")}</div>
<div class="corps plein" id="corps"><div class="carte"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button id="b-lot">${T("⚙ Traiter en lot…")}</button>
  <button class="gratuit" id="b-apercu" disabled>${T("Aperçu gratuit")}</button>
  <button class="prim" id="b-final" disabled>${T("Générer en pleine qualité")}</button></div>
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
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var bApercu = document.getElementById('b-apercu');
  var bFinal = document.getElementById('b-final');
  var bLot = document.getElementById('b-lot');
  var creditsEl = document.getElementById('credits');
  var RO = false, OCCUPE = false, ARME = false, ARME_T = null;
  var PHOTO = null;      // data URL d une photo importee (fichier), reduite
  var PHOTO_ID = '';     // id d une photo CHOISIE dans la phototheque (l image reste au site)
  var PHOTO_URL = '';    // adresse de la vignette choisie (affichage seulement)
  var PHOTO_NOM = '';    // son nom, dit en tete de l etape 1
  /* ⚠⚠ LE SELECTEUR INTERNE PLEIN ECRAN EST RETIRE (#30, le 2026-09-19, sur sa
     decision #31). Il etait devenu injoignable le 2026-09-09 avec le bouton
     << Depuis la photothèque >>, et son retrait avait ete inscrit comme tache a
     part — expressement pour ne pas retirer deux choses d un coup.
     ➡ LA PHOTOTHEQUE PASSE DESORMAIS PAR L EXPLORATEUR, qui porte la recherche,
     les filtres, la multi-selection et l apercu, avec de la place en plus. Ce
     qu il envoie arrive dans PANIER (panier:poser) et se traite en lot — un
     envoi d UNE photo est un lot d une.
     ⚠ CE QUI PART AVEC LUI, ET QU IL FAUT SAVOIR : PHOTO_ID n etait ecrit que
     par choisirPhoto, dans le selecteur. La photo de travail se pose donc
     maintenant par le fichier (glisser-deposer ou choix), et la photothèque par
     le panier. Verifie AVANT de couper : aucune capacite ne se perd.
     ⚠⚠ L op du pont << studio:phototheque >> n a plus d appelant ET NE PEUT PAS
     ETRE RETIREE — verifie le 2026-09-19, ce n est pas une dette remise a plus
     tard. Deux raisons qui se tiennent l une l autre :
       . cote SITE elle est gardee EXPRES pour les coquilles DEJA INSTALLEES,
         qui l appellent encore (pont.js le dit : << une vieille coquille
         continue de fonctionner sans rien savoir des filtres >>) ;
       . cote COQUILLE, l etape de parite de verifier-fenetres exige que OPS
         (site) et OPS_PONT (main.js) soient identiques DANS LES DEUX SENS : la
         retirer d un seul cote rend << absentes de OPS_PONT >>.
     ➡ Une op sans appelant dans la DERNIERE coquille n est pas une op morte :
     le site sert aussi les anciennes.
     ⚠ ET PAS D ACCENT GRAVE DANS CE FICHIER, MEME EN COMMENTAIRE : tout ce
     script vit dans un litteral de gabarit, et un seul le referme. */
  /* ⚠⚠ LES VIGNETTES NE VIENNENT PAS AVEC LA LIGNE (#143). L op studio:explorer
     ne remplit son champ apercu que si la photo est rangee sur le reseau ; une
     photo importee vit en data: URL cote site, et la case restait donc sur
     << en cours... >> POUR TOUJOURS. On les demande a part, par paquets.
     ⚠ La valeur '' est une REPONSE, pas un trou : elle dit << demandee, rien a
     montrer >>. Sans elle on redemanderait la meme case a chaque repeinture.
     C est undefined qui veut dire << jamais demandee >>. */
  var VIGN = {};         // id -> data URL recue ('' = demandee et sans image)
  var VIGN_OCC = false;  // un paquet de vignettes est-il en route ?
  /* ⚠ SEL RESTE, ET IL N APPARTENAIT PAS QU AU SELECTEUR : c est lui qu on
     remplit depuis PANIER avant d ouvrir le voile du lot. Les jetons de filtre
     (PH_FILTRES, PH_SANS, PH_LOT, PH_TRI, PH_META) sont partis avec la grille
     qu ils filtraient — l Explorateur porte les siens. */
  var SEL = {};          // { <idPhoto>: true } — le panier de selection
  var VOIE = 'humain';   // humain | fantome | plat
  /* ⚠⚠ << MISE EN VALEUR >> A UN DEFAUT, ET UN DEFAUT N EST PAS UN CHOIX.
     C est ce drapeau qui repond au crochet vert, et il existe a cause de mon
     defaut du 2026-09-09 : il a ouvert le Studio et vu << Mise en valeur >>
     DEJA COCHEE alors qu il n avait rien choisi (<< le crochet est deja en place
     ici alors que je n ai pas choisi le reste >>).
     La cause : VOIE vaut << humain >> au demarrage, donc son libelle n est
     JAMAIS vide, et j avais fait dependre le crochet de ce libelle.
     ⚠⚠ ET C EST EXACTEMENT L ERREUR QUE JE VENAIS DE CORRIGER, DANS L AUTRE
     SENS : le matin meme, le crochet dependait du drapeau << obligatoire >>, et
     j ai ecrit qu il fallait deux mecanismes pour deux questions. J en ai remis
     UN SEUL pour les deux — << que montrer sous le nom ? >> et << est-ce
     regle ? >>. C est le seul onglet du rail dont l etat n est pas vide au
     depart : tous les autres partent de rien, donc leur libelle suffit. */
  var VOIE_CHOISIE = false;
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
    { cle: 'hg', t: '${T("En haut à gauche")}' },  { cle: 'hc', t: '${T("En haut, au centre")}' },
    { cle: 'hd', t: '${T("En haut à droite")}' },  { cle: 'mg', t: '${T("Au milieu, à gauche")}' },
    { cle: 'mc', t: '${T("Au centre")}' },         { cle: 'md', t: '${T("Au milieu, à droite")}' },
    { cle: 'bg', t: '${T("En bas à gauche")}' },   { cle: 'bc', t: '${T("En bas, au centre")}' },
    { cle: 'bd', t: '${T("En bas à droite")}' }
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
    { cle: 'humain',  t: '${T("Mannequin virtuel")}', d: '${T("Porté par un modèle, décor intégré")}' },
    { cle: 'fantome', t: '${T("Fantôme habillé")}',   d: '${T("Sans mannequin, décor pro ajouté")}' },
    { cle: 'plat',    t: '${T("Produit à plat")}',    d: '${T("Détourage + décor + ombre")}' }
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
    { cle: '34turn',           t: '${T("Trois-quarts (défaut)")}' },
    { cle: 'standing',         t: '${T("Debout, de face")}' },
    { cle: 'powerstance',      t: '${T("Posture affirmée")}' },
    { cle: 'walkingforward',   t: '${T("En marche")}' },
    { cle: 'handinpocket',     t: '${T("Main dans la poche")}' },
    { cle: 'crossedarms',      t: '${T("Bras croisés")}' },
    { cle: 'overtheshoulder',  t: '${T("Regard par-dessus l’épaule")}' },
    { cle: 'back',             t: '${T("De dos")}' },
    { cle: 'seated',           t: '${T("Assise")}' },
    { cle: 'adjustingclothing',t: '${T("Ajuste son vêtement")}' },
    { cle: 'playfulspin',      t: '${T("Tourne sur elle-même")}' },
    { cle: 'random',           t: '${T("Au hasard")}' }
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
    { cle: 'studio',           t: '${T("Studio")}' },
    { cle: 'coloredstudio',    t: '${T("Studio coloré")}' },
    { cle: 'concretestudio',   t: '${T("Studio béton")}' },
    { cle: 'street',           t: '${T("Rue")}' },
    { cle: 'businessdistrict', t: '${T("Quartier des affaires")}' },
    { cle: 'latincity',        t: '${T("Ville latine")}' },
    { cle: 'asiancity',        t: '${T("Ville asiatique")}' },
    { cle: 'nightlights',      t: '${T("Lumières de nuit")}' },
    { cle: 'cafe',             t: '${T("Café")}' },
    { cle: 'library',          t: '${T("Bibliothèque")}' },
    { cle: 'bedroom',          t: '${T("Chambre")}' },
    { cle: 'factory',          t: '${T("Usine")}' },
    { cle: 'beach',            t: '${T("Plage")}' },
    { cle: 'pool',             t: '${T("Piscine")}' },
    { cle: 'tropical',         t: '${T("Tropical")}' },
    { cle: 'forest',           t: '${T("Forêt")}' },
    { cle: 'flowers',          t: '${T("Fleurs")}' },
    { cle: 'countryside',      t: '${T("Campagne")}' },
    { cle: 'mountain',         t: '${T("Montagne")}' },
    { cle: 'desert',           t: '${T("Désert")}' },
    { cle: 'sunset',           t: '${T("Coucher de soleil")}' },
    { cle: 'goldenlight',      t: '${T("Lumière dorée")}' },
    { cle: 'random',           t: '${T("Au hasard")}' }
  ];
  /* Direction de la lumière (donc de l ombre). ⚠ Le relais attend ces mots
     EXACTS (il les remet en camelCase lui-même) ou un angle. */
  var OMBRE_DIRS = [
    { cle: 'front',       t: '${T("De face")}' },
    { cle: 'frontleft',   t: '${T("Devant, à gauche")}' },
    { cle: 'frontright',  t: '${T("Devant, à droite")}' },
    { cle: 'left',        t: '${T("À gauche")}' },
    { cle: 'right',       t: '${T("À droite")}' },
    { cle: 'behind',      t: '${T("Derrière le sujet")}' },
    { cle: 'behindleft',  t: '${T("Derrière, à gauche")}' },
    { cle: 'behindright', t: '${T("Derrière, à droite")}' }
  ];
  var OMBRE_ETENDUES = [
    { cle: 'short',  t: '${T("Courte — collée au vêtement")}' },
    { cle: 'medium', t: '${T("Moyenne")}' },
    { cle: 'long',   t: '${T("Longue — lumière basse")}' }
  ];
  /* Les trois modes de relumière du service. ⚠ « Préserver la teinte » est le
     seul vraiment sûr pour un vêtement : c est la couleur qu on vend. */
  var LUMIERES = [
    { cle: '', t: '${T("Celle de l’ambiance")}' },
    { cle: 'ai.preserve-hue-and-saturation', t: '${T("Préserver la teinte (recommandé)")}' },
    { cle: 'ai.auto', t: '${T("Automatique — peut déplacer les couleurs")}' },
    { cle: 'ai.optimize-portrait', t: '${T("Optimiser un portrait — s’il y a un visage")}' }
  ];

  // Une image d un pixel, transparente : le porteur du mode de contrôle.
  var PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès au traitement d’image.")}',
    photo_absente:      '${T("Importez d’abord une photo.")}',
    non_configure:      '${T("Aucune clé Photoroom configurée (Configuration ▸ Clés API).")}',
    indisponible:       '${T("Le service n’est pas prêt dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    module_photos:      '${T("La photothèque n’a pas pu être chargée. Rechargez (Ctrl+R) ; si cela revient, reconnectez-vous.")}',
    version_coquille:   '${T("Cette version de l’application ne sait pas encore ouvrir cet écran.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').'))
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
     ET par le guide du volet de droite. Elle inclut le suivi des lots : quand il
     occupe tout l ecran, le volet du resultat n existe plus, et une image
     generee la n aurait nulle part ou s afficher. */
  function pretALancer(){
    return aUnePhoto() && !!PRESET && !RO && !LOTS_VUE;
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
    if (!pret && ARME) { ARME = false; bFinal.className = 'prim'; bFinal.textContent = '${T("Générer en pleine qualité")}'; }
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

  var LOT_ETATS = { file: '${T("En file")}', encours: '${T("En cours")}', pause: '${T("En pause")}',
    fini: '${T("Terminé")}', arrete: '${T("Arrêté")}' };

  function lotsHtml(){
    if (!LOTS) return '<div class="vide charge">${T("Lecture des traitements…")}</div>';
    var l = LOTS.lots || [];
    if (!l.length) {
      return '<div class="vide">${T("Aucun traitement. Choisissez des photos depuis la")} '
        + '${T("photothèque, puis « Traiter en lot ».")}</div>';
    }
    return l.map(function(x){
      var fait = x.faits + x.echecs;
      var pct = x.total ? Math.round((fait / x.total) * 100) : 0;
      var g = '';
      if (LOTS.peutModifier) {
        if (x.etat === 'encours' || x.etat === 'file') {
          g += '<button class="jeton" data-lot="' + esc(x.id) + '" data-geste="pause">${T("⏸ Pause")}</button>';
          g += '<button class="jeton" data-lot="' + esc(x.id) + '" data-geste="arreter">${T("⏹ Arrêter")}</button>';
        }
        if ((x.etat === 'pause' || x.etat === 'arrete') && x.restants) {
          g += '<button class="jeton prim" data-lot="' + esc(x.id) + '" data-geste="reprendre">${T("▶ Reprendre")}</button>';
        }
        if (x.etat === 'encours' || x.etat === 'file' || x.etat === 'pause') {
          g += '<button class="jeton' + (x.priorite ? ' on' : '') + '" data-lot="' + esc(x.id)
            + '" data-geste="priorite" data-val="' + (x.priorite ? '0' : '1') + '">'
            + (x.priorite ? 'Prioritaire' : 'Prioriser') + '</button>';
        }
        if (x.etat !== 'encours') {
          g += '<button class="jeton" data-lot="' + esc(x.id) + '" data-geste="retirer">${T("✕ Retirer")}</button>';
        }
      }
      return '<div class="lotc' + (x.etat === 'encours' ? ' vif' : '') + '">'
        + '<div class="lott"><strong>' + esc(x.nom) + '</strong>'
        + '<span class="pill ' + (x.etat === 'fini' ? 'bon' : x.etat === 'encours' ? 'acc'
            : x.etat === 'arrete' ? 'err' : 'neutre') + '">' + (LOT_ETATS[x.etat] || x.etat) + '</span>'
        + (x.priorite ? '<span class="pill acc"><span class="ic">★</span> ${T("Priorité")}</span>' : '')
        + '<span class="dt">' + esc(x.quoiLibelle) + '</span></div>'
        + '<div class="jauge"><i style="width:' + pct + '%"></i></div>'
        + '<div class="lotd">'
        // ⚠ << photo 15 sur 500 >>, et QUELLE photo : sans le nom, un lot bloque
        // sur une image abimee ne se diagnostique pas.
        + '<span>' + (x.etat === 'encours' && x.courant
            ? ('Photo ' + (fait + 1) + ' sur ' + x.total + ' — ' + esc(x.courant.nom))
            : (fait + ' sur ' + x.total)) + '</span>'
        + (x.echecs ? '<span class="mal">' + x.echecs + ' '
            + (x.echecs > 1 ? '${T("échecs")}' : '${T("échec")}') + '</span>' : '')
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
            ? '<div class="lote" style="color:var(--tx-or)">${T("⏸ Mis en pause :")} ' + esc(x.motifPause) + '</div>'
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
  /* ⚠⚠ LA PHOTO DE L EXPLORATEUR DEVIENT LA PHOTO DE TRAVAIL (2026-09-25). Sa
     capture : << 1 photo venue de l explorateur >>, la vignette a gauche — et a
     droite << L image apparaitra ici >>, l etape 1 toujours a faire, les deux
     boutons de rendu grises. La cause : le panier remplissait PANIER, alors que
     l apercu, le guide et les boutons ne lisent que PHOTO / PHOTO_ID. Depuis le
     retrait du selecteur interne (#30), plus RIEN n ecrivait PHOTO_ID : une
     photo venue de la photothèque ne pouvait donc JAMAIS etre travaillee seule.
     ➡ PANIER_IDX dit laquelle est ouverte ; PANIER_SIG detecte un envoi NEUF
     meme a nombre egal (1 photo remplacee par 1 autre ne changeait rien, et
     << Traiter >> partait avec des ids que l ecran ne montrait pas). */
  var PANIER_IDX = 0, PANIER_SIG = '', DU_PANIER = false, A_REDESSINER = false;
  var PLEIN = {};        // id -> image entiere demandee pour l apercu ('' = sans)

  /* Ouvre la i-eme photo du panier comme photo de travail. ⚠ Le fichier importe
     (PHOTO) est OUBLIE : sinon l ecran montrait la photo de l explorateur et le
     rendu partait avec l ANCIEN fichier, cache derriere — une photo payee pour
     une autre. */
  function choisirDuPanier(i){
    var n = PANIER.length;
    if (!n) return;
    i = ((i % n) + n) % n;
    var p = PANIER[i];
    if (!p) return;
    var meme = (DU_PANIER && PHOTO_ID === p.id);
    PANIER_IDX = i;
    DU_PANIER = true;
    PHOTO = null;
    PHOTO_ID = p.id;
    PHOTO_NOM = p.nom || p.code || '';
    PHOTO_URL = PLEIN[p.id] || p.apercu || VIGN[p.id] || '';
    if (!meme) { RESULT = null; FORMATS = []; ENREG = false; INTERIEUR = null; INTERIEUR_NOM = ''; }
    // L apercu du panier est souvent vide (photo pas encore sur le reseau) : on
    // demande l image entiere, pour celle-ci seulement — comme l explorateur.
    if (PLEIN[p.id] === undefined) {
      PLEIN[p.id] = '';
      var id = p.id;
      appeler('studio:vignettes', [{ ids: [id], plein: true }]).then(function(r){
        var src = (r && r.ok && r.vignettes && r.vignettes[id]) || '';
        PLEIN[id] = src;
        if (src && PHOTO_ID === id && !PHOTO) { PHOTO_URL = src; redessinerSiLibre(); }
      });
    }
  }

  /* Change de photo depuis les fleches de l apercu. ⚠ Un rendu PAYE et pas
     encore enregistre serait perdu : on le demande avant, une seule fois. */
  function panierPasser(d){
    if (PANIER.length < 2 || OCCUPE) return;
    confirmerPerte(function(){ choisirDuPanier(PANIER_IDX + d); dessiner(); });
  }

  /* ⚠ LE VOILE DE LA FENETRE, PAS UNE BOITE DU SYSTEME : celle-ci peut s ouvrir
     DERRIERE la fenetre (vu sur le decompte d inactivite). Rien a demander si le
     rendu est un apercu gratuit ou deja enregistre. */
  function confirmerPerte(suite){
    if (!(RESULT && !RESULT.essai && !ENREG)) { suite(); return; }
    voile('<h3>${T("Rendu non enregistré")}</h3>'
      + '<p>${T("Le rendu affiché n’est pas enregistré dans la photothèque. Passer à une autre photo le fera disparaître.")}</p>'
      + '<div class="fin2"><button id="v-non">${T("Annuler")}</button>'
      + '<button class="prim" id="v-oui">${T("Changer de photo")}</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){ fermer(); suite(); };
      });
  }

  /* ⚠ LES RAFRAICHISSEMENTS DE FOND NE REDESSINENT PAS PENDANT UN TRAVAIL. Un
     dessin reconstruit les boutons ACTIFS : pendant un rendu de trente secondes a
     cinq minutes, ils redevenaient cliquables, et le curseur sautait hors des
     champs. On note qu il faudra redessiner, et occuper(false) le fera. */
  function redessinerSiLibre(){
    if (LOTS_VUE) return;
    if (OCCUPE) { A_REDESSINER = true; return; }
    dessiner();
  }
  function panierHtml(){
    if (!PANIER.length) return '';
    var n = PANIER.length;
    return '<div class="panier"><div class="pt">'
      + '<strong>' + n + ' ' + (n > 1 ? '${T("photos")}' : '${T("photo")}') + '</strong> '
      + '<span class="dt">' + (n > 1 ? '${T("venues de l’explorateur")}' : '${T("venue de l’explorateur")}') + '</span>'
      + '<button class="mini" id="pn-vider" title="${T("Oublier cette sélection")}">✕</button></div>'
      + '<div class="pv">' + PANIER.slice(0, 8).map(function(p, i){
          // ⚠ MEME DEFAUT QUE LA GRILLE (#143) : sans vignette demandee a part,
          // le panier ne montrait que des cases grises.
          var s = p.apercu || VIGN[p.id] || '';
          // Chaque vignette OUVRE sa photo dans l apercu (2026-09-25) ; celle qui
          // est ouverte porte un cadre.
          var on = (i === PANIER_IDX) ? ' on' : '';
          return '<button class="pvb' + on + '" data-pn="' + i + '" title="' + esc(p.nom || p.code || '') + '"'
            + ' aria-label="' + esc('${T("Ouvrir")} ' + (p.nom || p.code || (i + 1))) + '">'
            + (s ? '<img src="' + esc(s) + '" alt="" loading="lazy">' : '<span class="tr"></span>')
            + '</button>'; }).join('')
      + (n > 8 ? '<span class="pl">+' + (n - 8) + '</span>' : '') + '</div>'
      + '<button class="prim" id="pn-lot">${T("⚙ Traiter")} ' + (n > 1 ? ('ces ' + n) : '${T("cette photo")}') + ' ${T("en lot…")}</button>'
      + '</div>';
  }

  function chargerPanier(){
    appeler('panier:lire', []).then(function(r){
      if (!r || !r.ok) return;
      PANIER = r.photos || [];
      var sig = PANIER.map(function(p){ return p && p.id; }).join('|');
      // On ne redessine que si ca a change : sinon on redessinerait toutes les
      // deux secondes sous les doigts de quelqu un. ⚠ Change = les IDS, pas le
      // nombre (voir PANIER_SIG).
      if (sig !== PANIER_SIG) {
        PANIER_SIG = sig;
        if (PANIER.length) {
          // La photo ouverte reste ouverte si elle fait encore partie de l envoi.
          var k = -1;
          for (var i = 0; i < PANIER.length; i++) if (PANIER[i] && PANIER[i].id === PHOTO_ID) k = i;
          choisirDuPanier(k >= 0 ? k : 0);
        } else if (DU_PANIER) {
          // L envoi a ete vide ailleurs : la photo qu il avait ouverte s en va avec.
          DU_PANIER = false; PHOTO_ID = ''; PHOTO_URL = ''; PHOTO_NOM = ''; PANIER_IDX = 0;
          RESULT = null; FORMATS = []; ENREG = false;
        }
        redessinerSiLibre();
      }
      panierVignettes();
    });
  }

  /* Les huit que le panier MONTRE, pas les trois cents qu il contient : on ne
     rapatrie que ce qui se voit. ⚠ Le meme marquage a '' que la grille, pour la
     meme raison — une demande sans reponse ne doit pas se rejouer sans fin. */
  function panierVignettes(){
    if (VIGN_OCC || RO) return;
    var manque = [];
    for (var i = 0; i < PANIER.length && i < 8; i++) {
      var p = PANIER[i];
      if (!p || p.apercu || VIGN[p.id] !== undefined) continue;
      manque.push(p.id);
    }
    if (!manque.length) return;
    VIGN_OCC = true;
    appeler('studio:vignettes', [{ ids: manque, cote: 120 }]).then(function(r){
      VIGN_OCC = false;
      var v = (r && r.ok && r.vignettes) ? r.vignettes : {};
      for (var j = 0; j < manque.length; j++) {
        if (VIGN[manque[j]] === undefined) VIGN[manque[j]] = v[manque[j]] || '';
      }
      // La vignette de la photo ouverte sert d apercu en attendant l image entiere.
      if (DU_PANIER && !PHOTO_URL && VIGN[PHOTO_ID]) PHOTO_URL = VIGN[PHOTO_ID];
      redessinerSiLibre();
    });
  }

  /* ══ L ETAPE 1, DANS LE VOLET DE GAUCHE ═══════════════════════════════════
     ⚠ ELLE NE CONTIENT PLUS NI LE SELECTEUR NI LE SUIVI DES LOTS. Ces deux-la
     sont partis en plein ecran (pleinHtml) : une grille de plusieurs centaines
     de vignettes et une file de lots n ont jamais eu leur place dans une carte
     large d une demi-page — c est cet entassement qu on retire. */
  /* ⚠⚠ TROIS ETATS, UN SEUL A LA FOIS — refonte du 2026-09-09, ses trois
     demandes sur cette zone, qui n en font qu une :
       << ici on ne va garder que Explorateur car il est deja lie a la
          photothèque >>
       << pour la visualisation des traitements par lot mets une icone plus
          discrete a un autre endroit que lors de la selection des photos >>
       << quand les photo sont selectionnees tu devrais retirer les option pour
          ajouter une photo et les faire revenir seulement si on ferme ou retire
          la selection >>
     Le defaut commun : cette zone empilait les trois choses en meme temps — la
     porte pour choisir, ce qui etait choisi, et un temoin de traitements sans
     rapport. Trois etats superposes, donc aucun.

     ① UNE SELECTION EXISTE (le panier de l explorateur) → on ne montre QUE la
        selection. Les portes d ajout partent : elles ne servent a rien tant que
        la selection est la, et son << X >> est ce qui les ramene. C est sa
        demande mot pour mot.
     ② UNE PHOTO EST CHOISIE → on la montre, avec << Choisir une autre photo >>.
     ③ RIEN → la zone de depot et l explorateur.

     ⚠ << DEPUIS LA PHOTOTHEQUE >> EST RETIRE, et il avait bien une raison
     d exister : le commentaire d origine disait que le petit selecteur servait a
     prendre UNE photo vite fait, l explorateur a en choisir des centaines. Sauf
     que l explorateur fait les DEUX — c est la meme photothèque, avec de la place
     et un apercu. Deux portes vers la meme piece, dont l une plus etroite.
     ⚠⚠ ET J AI VERIFIE SA PREMISSE AVANT DE RETIRER LE BOUTON, parce que retirer
     une porte c est repondre de ce qu elle ouvrait — la faute payee le 2026-09-08
     avec << Mon profil >> et la zone du compte. L explorateur porte bien la
     recherche, les filtres, la multi-selection au Maj-clic ET le panier
     (panier:poser) : il couvre TOUT ce que faisait le selecteur interne, avec
     de la place et un apercu en plus. Sa premisse etait juste.
     ⚠⚠ ET LE SELECTEUR INTERNE EST RETIRE DEPUIS (#30, le 2026-09-19). Retirer
     ph-ouvrir le 2026-09-09 l avait rendu INJOIGNABLE — du code vivant que rien
     n appelait — et son retrait avait ete inscrit comme tache a part, pour ne
     pas retirer deux choses d un coup. C est cette tache-la qui est faite ici.
     ⚠ ET LE COMMENTAIRE D ALORS ETAIT DEJA FAUX QUAND ON L A RELU : entre-temps
     le bouton << Traitements par lot >> s etait remis a appeler ouvrirPicker sur
     panier vide. << Plus aucun appelant >> ne se recopie pas, ca se re-verifie.
     Ce chemin mene desormais a l explorateur. La zone de depot, elle, garde son
     glisser-deposer et son choix de fichier.
     ⚠ << TRAITEMENTS >> MONTE DANS L EN-TETE, en icone discrete. Ce n est pas
     une etape du travail, c est un temoin : sa place n est pas au milieu du
     chemin << choisir une photo >>. Et le bandeau des lots du socle, en bas de
     chaque fenetre, montre DEJA l avancement en direct — l en-tete ne porte donc
     que la PORTE vers l ecran detaille. */
  function photoHtml(){
    var h = '';
    if (PANIER.length) {
      // ① Une selection venue de l explorateur : elle occupe la zone seule.
      return panierHtml();
    }
    if (aUnePhoto()) {
      // ② Une photo est déjà choisie (fichier OU photothèque) : on la montre.
      var apercu = PHOTO || PHOTO_URL;
      h += '<div class="depot" id="depot">'
        + (apercu ? '<img src="' + apercu + '" alt="photo">'
                  : '<span class="gros"><span class="ic">🖼</span></span><span>${T("Photo de la photothèque sélectionnée")}</span>')
        + '<span class="refaire">${T("Choisir une autre photo")}</span></div>'
        + '<input type="file" id="fichier" accept="image/*" hidden>';
      return h;
    }
    // ③ Rien de choisi : la zone de dépôt, et l explorateur.
    h += '<div class="depot" id="depot"><span class="gros"><span class="ic">📷</span></span>'
      + '<span>${T("Glissez une photo ici, ou cliquez pour en choisir une")}</span>'
      + '<span class="pt2">${T("Studio, fond blanc, un vêtement — JPEG ou PNG")}</span></div>'
      + '<input type="file" id="fichier" accept="image/*" hidden>'
      + '<div class="pbtn">'
      + '<button id="ph-explorateur" title="${T("Parcourir la photothèque en grand, avec aperçu")}">'
      + '<span class="ic">🗂️</span> ${T("Explorateur…")}</button>'
      + '</div>';
    return h;
  }

  /* ══ L ECRAN PLEIN LARGEUR ════════════════════════════════════════════════
     Le suivi des lots. C est un ecran, pas un encart.
     ⚠ ILS ETAIENT DEUX avant le 2026-09-19 : le selecteur de photos partageait
     cette barre. Il est parti avec #30, et la fonction ne porte donc plus de
     branche — une fonction a un seul cas ne garde pas le test de l autre. */
  function pleinHtml(){
    return '<div class="phbarre"><button id="lots-fermer">${T("← Retour")}</button>'
      + '<span class="phinfo">${T("Traitements par lot")}</span></div>'
      + '<div class="lots">' + lotsHtml() + '</div>';
  }

  function voiesHtml(){
    return VOIES.map(function(v){
      return '<div class="tuile' + (VOIE === v.cle ? ' on' : '') + '" data-voie="' + v.cle + '">'
        + '<span class="t">' + esc(v.t) + '</span>'
        + '<span class="d">' + esc(v.d) + '</span></div>';
    }).join('');
  }

  function nomModele(m){ return m.charAt(0).toUpperCase() + m.slice(1); }
  function nomPose(p){
    var x = POSES.filter(function(o){ return o.cle === p; })[0];
    return x ? x.t.replace(' ${T("(défaut)")}', '') : p;
  }
  function modeleHtml(){
    if (VOIE !== 'humain') return '';
    // ⚠ Retour au MENU DÉROULANT (demande du 2026-08-12) : la galerie de vignettes
    // est retirée. Les aperçus par mannequin sortaient identiques et n'aidaient pas
    // au choix ; le nom suffit. Le modèle et la pose se choisissent dans deux listes.
    // Deux menus courts : cote a cote quand la place le permet, empiles sinon.
    var h = '<div class="duo"><div class="ch"><label for="modele-sel">${T("Modèle")}</label>'
      + '<select id="modele-sel"' + (RO ? ' disabled' : '') + '>'
      + MODELES.map(function(m){ return '<option value="' + esc(m) + '"'
          + (MODELE_SEL === m ? ' selected' : '') + '>' + esc(nomModele(m)) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="pose">Pose</label>'
      + '<select id="pose"' + (RO ? ' disabled' : '') + '>'
      + POSES.map(function(p){ return '<option value="' + p.cle + '"'
          + (POSE_SEL === p.cle ? ' selected' : '') + '>' + esc(p.t) + '</option>'; }).join('')
      + '</select></div></div>'
      + '<div class="aidep">${T("L’aperçu est gratuit : essayez plusieurs mannequins et plusieurs")} '
      + '${T("poses avant de dépenser un crédit.")}</div>';
    return h;
  }
  function ambiancesHtml(){
    if (!PRESETS.length) return '<div class="vide">${T("Aucune ambiance.")}</div>';
    return '<div class="tuiles amb">' + PRESETS.map(function(p){
      return '<div class="tuile' + (PRESET === p.cle ? ' on' : '') + '" data-preset="' + esc(p.cle) + '">'
        + '<span class="t">' + esc(p.label) + '</span>'
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
      if (AV.decor) b.push('${T("décor")} ' + nomDecor(AV.decor));
      if (!AV.sourire) b.push('expression neutre');
      if (String(AV.extra || '').trim()) b.push('${T("précisions libres")}');
    } else {
      if (String(AV.fondPrompt || '').trim()) b.push('${T("décor décrit")}');
      if (AV.ombreActive) b.push('${T("ombre réglée")}');
      if (AV.lumiere) b.push('${T("relumière")}');
      if (voie === 'fantome' && INTERIEUR) b.push('${T("photo d’intérieur")}');
    }
    if (AV.upActive) b.push('${T("agrandissement ×4")}');
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
      h.push('<div class="avsec prem">${T("Mise en scène du mannequin")}</div>');
      h.push(chSel('av-decor', '${T("Décor")}', [{ cle: '', t: '${T("Celui de l’ambiance choisie")}' }].concat(DECORS),
        AV.decor, '${T("Choisi ici, il remplace celui de l’ambiance. Ce sont les 23 décors que le service")} '
        + '${T("connaît : un nom hors liste serait refusé.")}'));
      h.push(chSel('av-sourire', 'Expression',
        [{ cle: '1', t: '${T("Sourire naturel (défaut)")}' }, { cle: '0', t: '${T("Neutre")}' }],
        AV.sourire ? '1' : '0', '${T("Sans consigne, le service rend un visage presque fermé — mesuré sur")} '
        + '${T("pièce. Le sourire se demande, il ne vient pas tout seul.")}'));
      h.push('<div class="ch avun"><label for="av-extra">${T("Précisions libres")}</label>'
        + '<textarea id="av-extra" rows="3" maxlength="200"' + (RO ? ' disabled' : '')
        + ' placeholder="black heels, hair tied back, delicate jewellery">' + esc(AV.extra) + '</textarea>'
        + '</div>');
      h.push('');
    } else {
      h.push('<div class="avsec prem">${T("Décor décrit au texte")}</div>');
      h.push('<div class="ch avun"><label for="av-fond">${T("Décor voulu")}</label>'
        // rows="3" comme les autres zones libres (2026-08-21). /!\ CELLE-CI ACCEPTE
        // 500 CARACTERES, soit environ sept lignes : trois rangees restent en
        // dessous de ce qu'on peut y mettre. C'est un choix a lui, pas un defaut —
        // resize:vertical laisse tirer, et l'outil de mise en page se tait des
        // qu'un rows est ecrit a la main.
        + '<textarea id="av-fond" rows="3" maxlength="500"' + (RO ? ' disabled' : '')
        + ' placeholder="clean marble surface, soft window light from the left">' + esc(AV.fondPrompt)
        + '</textarea></div>');
      h.push('<div class="ch"><label for="av-neg">${T("À éviter")}</label>'
        + '<input type="text" id="av-neg" maxlength="300"' + (RO ? ' disabled' : '')
        + ' value="' + esc(AV.fondNegatif) + '" placeholder="text, logo, hands, harsh reflections">'
        + '<div class="aidep">${T("Ce que le décor ne doit pas contenir.")}</div></div>');
      h.push('<div class="ch"><label for="av-seed">${T("Graine")}</label>'
        + '<input type="text" id="av-seed" inputmode="numeric" maxlength="9"' + (RO ? ' disabled' : '')
        + ' value="' + esc(AV.fondGraine) + '" placeholder="vide = au hasard">'
        + '</div>');
    }
    return '<div class="avgrille">' + h.join('') + '</div>';
  }

  function avOmbresHtml(){
    var h = [];
    h.push('<div class="avsec prem">${T("Ombre portée")}</div>');
    h.push('<label class="bascule avun"><input type="checkbox" id="av-ombre"'
        + (AV.ombreActive ? ' checked' : '') + (RO ? ' disabled' : '')
        + '> <span><strong>${T("Régler l’ombre moi-même")}</strong><span class="d">${T("Décochée, c’est l’ombre de")} '
        + '${T("l’ambiance qui s’applique. Cochée, <strong>vos réglages remplacent entièrement les ")}'
        + '${T("siens</strong> — ce n’est pas un mélange des deux.")}</span></span></label>');
      if (AV.ombreActive) {
        h.push(chRange('av-oi', '${T("Intensité")}', AV.ombreIntensite));
        h.push(chRange('av-od', '${T("Douceur")}', AV.ombreDouceur));
        h.push(chSel('av-oe', '${T("Étendue")}', OMBRE_ETENDUES, AV.ombreEtendue, ''));
        h.push(chSel('av-odir', '${T("Direction de la lumière")}', OMBRE_DIRS, AV.ombreDirection, ''));
        h.push(chSel('av-op', '${T("Pose du sujet")}',
          [{ cle: 'upright', t: '${T("Debout, posé au sol (défaut)")}' }, { cle: 'flatlay', t: '${T("À plat, vu de dessus")}' }],
          AV.ombrePose, '${T("« Debout » ancre le vêtement au sol pour qu’il ne flotte pas. Ne choisissez")} '
          + '${T("« à plat » que si la photo est prise à la verticale, au-dessus du vêtement.")}'));
    }
    return '<div class="avgrille">' + h.join('') + '</div>';
  }

  function avLumiereHtml(){
    var h = [];
    h.push('<div class="avsec prem">${T("Relumière")}</div>');
    h.push(chSel('av-lum', '${T("Accorder la lumière du sujet au décor")}', LUMIERES, AV.lumiere,
      '${T("« Préserver la teinte » garde la <strong>vraie couleur du tissu</strong> : c’est le seul choix sûr ")}'
      + '${T("quand on vend l’article sur sa couleur. « Automatique » éclaire mieux mais peut la déplacer —")} '
      + '${T("un bleu nuit qui ressort bleu roi fait un retour.")}'));
    return '<div class="avgrille">' + h.join('') + '</div>';
  }

  function avInterieurHtml(){
    var h = [];
    h.push('<div class="avsec prem">${T("Photo de l’intérieur du vêtement")}</div>');
    /* ⚠⚠ CES CONTROLES AVAIENT DISPARU LE 2026-09-06 (4.57.0) : l outil qui a
       retire 64 textes d explication a emporte le bloc ENTIER, champ de fichier
       et boutons compris. brancherAvance cherchait av-int-f, av-int-b, av-int-x
       — jamais dessines — et la seconde prise de vue du fantome etait morte
       depuis. Les controles reviennent ; les explications, elles, restent
       retirees (c etait sa decision). */
    h.push('<div class="avun">'
      + '<input type="file" id="av-int-f" hidden accept="image/*">'
      + '<div class="avint">'
      + (INTERIEUR ? '<img src="' + INTERIEUR + '" alt="${T("intérieur du vêtement")}">' : '')
      + '<span class="nm">' + (INTERIEUR ? esc(INTERIEUR_NOM || '${T("photo choisie")}')
      : '${T("Aucune photo d’intérieur.")}') + '</span>'
      + '<button id="av-int-b"' + (RO ? ' disabled' : '') + '>'
      + (INTERIEUR ? '${T("Remplacer")}' : '${T("Choisir un fichier")}') + '</button>'
      + (INTERIEUR ? '<button id="av-int-x"' + (RO ? ' disabled' : '') + '>${T("Retirer")}</button>' : '')
      + '</div></div>');
    return '<div class="avgrille">' + h.join('') + '</div>';
  }

  function avAgrandirHtml(){
    var h = [];
    h.push('<div class="avsec prem">${T("Agrandissement")}</div>');
    h.push('<label class="bascule avun"><input type="checkbox" id="av-up"'
      + (AV.upActive ? ' checked' : '') + (RO ? ' disabled' : '')
      + '> <span><strong>${T("Agrandir ×4")}</strong><span class="d">${T("Un appel de plus, facturé, après le")} '
      + 'traitement.</span></span></label>');
    if (AV.upActive) {
      h.push(chSel('av-up-mode', 'Mode', [
        { cle: 'ai.fast', t: '${T("Rapide — entrée jusqu’à 1000 px")}' },
        { cle: 'ai.slow', t: '${T("Lent, plus fin — entrée jusqu’à 512 px")}' }], AV.upMode, ''));
      h.push('');
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
      return '<div class="avgrille"><div class="aidep att">${T("Aucun logo dans la logothèque.")} '
        + '${T("Ajoutez-en un dans <strong>Configuration ▸ Logothèque</strong>, puis rouvrez cet écran.")}'
        + '</div></div>';
    }
    var lg = logoChoisi();
    var h = '<div class="avgrille"><div class="avsec prem">${T("Le logo")}</div>'
      + '<div class="loggr">' + LOGOS.map(function(l){
          return '<div class="logv' + (FIL.logoId === l.id ? ' on' : '') + '" data-logo="'
            + esc(l.id) + '" title="' + esc(l.nom) + '">'
            + '<img src="' + l.image + '" alt="' + esc(l.nom) + '">'
            + '<span class="ln">' + esc(l.nom) + '</span></div>'; }).join('') + '</div>';
    h += '<div class="avsec">${T("Où le poser")}</div>'
      + '<div class="posgr">' + POSITIONS.map(function(p){
          return '<button class="posc' + (FIL.position === p.cle ? ' on' : '') + '" data-pos="'
            + esc(p.cle) + '" title="' + esc(p.t) + '"><span></span></button>'; }).join('') + '</div>';
    h += '<div class="avsec">${T("Taille et discrétion")}</div>';
    h += chRange2('fil-taille', '${T("Largeur du logo")}', FIL.taille, 5, 60, 1, ' ${T("% de l’image")}');
    h += chRange2('fil-op', '${T("Opacité")}', Math.round(FIL.opacite * 100), 5, 100, 5, ' %');
    h += chRange2('fil-marge', '${T("Marge")}', FIL.marge, 0, 15, 1, ' %');
    h += '<div class="avun"><div class="fbar">'
      + '<button class="prim" id="fil-go"' + ((RESULT && lg && !RO) ? '' : ' disabled') + '>'
      + '${T("Appliquer au résultat")}</button>'
      + ((RESULT && RESULT.filigrane) ? '<button id="fil-off">${T("Retirer")}</button>' : '')
      + '</div>'
      /* ⚠ CE QUE ÇA COÛTE, DIT UNE FOIS POUR TOUTES : rien. C est le seul
         traitement de cet écran dont le prix ne dépend pas du nombre de photos. */
      + '</div>';
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
    dire('${T("Pose du filigrane…")}');
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
      dire('${T("Filigrane posé — aucun crédit dépensé.")}', 'bon');
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
    dire('${T("Filigrane retiré.")}', 'att');
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
    { cle: 'photo',     t: 'Photo',          voies: '*' },
    { cle: 'valeur',    t: '${T("Mise en valeur")}', voies: '*' },
    { cle: 'ambiance',  t: '${T("Ambiance")}',       voies: '*' },
    { cle: 'decor',     t: '${T("Décor")}',          voies: '*' },
    { cle: 'ombres',    t: '${T("Ombres")}',         voies: 'fantome,plat' },
    { cle: 'lumiere',   t: '${T("Lumière")}',        voies: 'fantome,plat' },
    { cle: 'interieur', t: '${T("Intérieur")}',      voies: 'fantome' },
    { cle: 'agrandir',  t: '${T("Agrandissement")}', voies: '*' },
    { cle: 'filigrane', t: '${T("Filigrane")}',      voies: '*' }
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
    /* ⚠⚠ ET ON NE RESTE PAS SUR UN ONGLET FERME (2026-09-09). Tant qu il n y a
       pas de photo, tous les onglets sauf << Photo >> sont desactives : si
       l onglet courant etait l un d eux — on retire la photo alors qu on reglait
       l ambiance, ou un profil a ouvert << Ombres >> — le rail montrerait un
       onglet actif et grise, et le volet reglerait quelque chose qu on ne peut
       plus atteindre. C est le meme defaut que celui decrit juste au-dessus
       (<< l onglet courant peut disparaitre sous le pied >>), vu par l autre
       bout : il ne disparait pas, il devient injouable. */
    if (ongletsFermes() && ONGLET !== 'photo') {
      ONGLET = 'photo';
      for (var k = 0; k < d.length; k++) { if (d[k].cle === 'photo') return d[k]; }
    }
    for (var i = 0; i < d.length; i++) { if (d[i].cle === ONGLET) return d[i]; }
    ONGLET = d[0].cle;
    return d[0];
  }
  // Ce que l onglet a recu, dit SUR l onglet. Vide = rien de choisi.
  function ongletEtat(cle){
    if (cle === 'photo')     return aUnePhoto() ? (PHOTO_NOM || '${T("photo prête")}') : '';
    if (cle === 'valeur')    return nomVoie(VOIE);
    if (cle === 'ambiance')  return PRESET ? nomPreset(PRESET) : '';
    if (cle === 'decor')     return (VOIE === 'humain')
      ? (AV.decor ? nomDecor(AV.decor) : '')
      : (String(AV.fondPrompt || '').trim() ? '${T("décrit au texte")}' : '');
    if (cle === 'ombres')    return AV.ombreActive ? '${T("réglée à la main")}' : '';
    if (cle === 'lumiere')   return AV.lumiere ? 'active' : '';
    if (cle === 'interieur') return INTERIEUR ? (INTERIEUR_NOM || 'photo choisie') : '';
    if (cle === 'agrandir')  return AV.upActive ? '×4' : '';
    if (cle === 'filigrane') { var l = logoChoisi(); return l ? l.nom : ''; }
    return '';
  }
  /* Les deux onglets qu il FAUT remplir pour lancer quoi que ce soit. Les autres
     sont facultatifs — et c est CE drapeau, pas le crochet, qui porte cette
     information : un onglet requis et vide affiche << A choisir >>, un
     facultatif vide affiche << — >>. La distinction se lit donc dans le
     sous-titre, la ou elle est utile. */
  function ongletRequis(cle){ return cle === 'photo' || cle === 'ambiance'; }

  /* ══ EST-CE REGLE ? — LE CROCHET VERT, ET RIEN D AUTRE ════════════════════
     ⚠⚠ TROIS QUESTIONS, TROIS MECANISMES, ET C EST LE FOND DES DEUX DEFAUTS DE
     LA JOURNEE :
       • ongletEtat   : QUE MONTRER sous le nom (le libelle) ;
       • ongletRequis : est-ce OBLIGATOIRE (<< A choisir >> contre << — >>) ;
       • ongletFait   : est-ce REGLE (le crochet vert).
     Le matin, le crochet dependait de ongletRequis : << Mise en valeur >>
     portait toujours une valeur et jamais de crochet. J ai corrige en le faisant
     dependre de ongletEtat… et il s est mis a cocher << Mise en valeur >> DES
     L OUVERTURE, ce qu il a vu tout de suite : << le crochet est deja en place
     ici alors que je n ai pas choisi le reste >>.
     ⚠⚠ LES DEUX FOIS, LA MEME FAUTE : faire repondre UN indicateur a DEUX
     questions. La troisieme fonction n est pas du zele, c est ce qui manquait.

     ⚠ ET LA REGLE, EN UN MOT : << REMPLI >> VEUT DIRE CHOISI, PAS << NON VIDE >>.
     La voie vaut << humain >> au demarrage — un DEFAUT n est pas un choix, et
     cocher un defaut ferait croire qu on a decide quelque chose. C est le SEUL
     onglet dans ce cas : tous les autres partent de rien, donc leur libelle
     suffit a dire qu on y a touche. */
  function ongletFait(cle){
    if (cle === 'valeur') return VOIE_CHOISIE;
    return !!ongletEtat(cle);
  }

  /* ══ TANT QU IL N Y A PAS DE PHOTO, LE RESTE EST FERME ════════════════════
     Sa demande du 2026-09-09 : << tant que les photos ne sont pas selectionnees
     les autres onglets devraient etre desactives >>.
     Il a raison, et pas seulement pour la forme : regler une ambiance, un decor
     ou un filigrane avant qu une photo existe, c est regler un traitement sur
     rien — et le volet de droite ne peut alors rien montrer de ce qu on reglait.
     ⚠ UNE SELECTION VENUE DE L EXPLORATEUR COMPTE AUSSI (PANIER) : c est bien
     << les photos sont selectionnees >>, meme si aucune n est ouverte a l ecran.
     ⚠ << Photo >> N EST JAMAIS FERME, evidemment : c est la seule porte pour
     sortir de cet etat. */
  function ongletsFermes(){ return !aUnePhoto() && !PANIER.length; }

  function ongletsHtml(){
    var courant = ongletSur().cle;
    var fermes = ongletsFermes();
    return ongletsDispo().map(function(o){
      var e = ongletEtat(o.cle);
      var ok = ongletFait(o.cle);
      var bloque = fermes && o.cle !== 'photo';
      /* ⚠ LE TITRE DIT POURQUOI. Un bouton grise sans explication se clique deux
         fois, puis on cherche la panne ailleurs — c est la regle appliquee le
         meme jour aux boutons verrouilles de la sauvegarde. */
      return '<button class="ong' + (o.cle === courant ? ' on' : '') + '" data-ong="' + o.cle
        + '"' + (bloque ? ' disabled title="${T("Choisissez d’abord une photo")}"' : '')
        + ' role="tab" aria-selected="' + (o.cle === courant ? 'true' : 'false') + '">'
        + '<span class="ot"><b>' + esc(o.t) + '</b>'
        + '<span class="oe">' + esc(e || (ongletRequis(o.cle) ? '${T("À choisir")}' : '—')) + '</span></span>'
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
    return '<div class="pnt"><h2>' + esc(o.t) + '</h2></div>'
      + '<p class="sous">' + panneauSousHtml(o.cle) + '</p>'
      + '<div class="pnc">' + corpsG + '</div>';
  }
  function panneauSousHtml(cle){
    if (cle === 'photo')     return '${T("Celle de départ, prise en studio sur fond blanc.")}';
    if (cle === 'valeur')    return '${T("Comment le vêtement est présenté.")}';
    if (cle === 'ambiance')  return '${T("Un clic règle décor, ombre ancrée et lumière.")}';
    if (cle === 'decor')     return '${T("Ce qu’il y a derrière le vêtement. Facultatif : l’ambiance en pose déjà un.")}';
    if (cle === 'ombres')    return '${T("Facultatif : sans réglage, c’est l’ombre de l’ambiance qui s’applique.")}';
    if (cle === 'lumiere')   return '${T("Facultatif : accorder la lumière du sujet à celle du décor.")}';
    if (cle === 'interieur') return '${T("La seconde prise de vue, vêtement retourné — le seul col qui ne soit pas inventé.")}';
    if (cle === 'agrandir')  return '${T("Facultatif, et <strong>facturé un appel de plus</strong>.")}';
    if (cle === 'filigrane') return '${T("Le logo de la marque, posé sur l’image. Aucun appel, aucun crédit.")}';
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
      + '<label for="rc-sel">${T("Profil")}</label>'
      + '<select id="rc-sel"' + (RO ? ' disabled' : '') + '>'
      + '<option value="">${T("— Aucun —")}</option>'
      + RECETTES.map(function(o){
          return '<option value="' + esc(o.id) + '"' + (RC_SEL === o.id ? ' selected' : '')
            + '>' + esc(o.nom) + '</option>'; }).join('')
      + '</select>'
      + '<button id="rc-enr"' + (RO ? ' disabled' : '')
      + ' title="${T("Enregistrer tous les réglages actuels sous un nom")}">'
      + '<span class="ic">💾</span> ${T("Enregistrer…")}</button>'
      + '<button class="x" id="rc-sup"' + ((RO || !x) ? ' disabled' : '')
      + ' title="${T("Retirer ce profil")}">✕</button></div>';
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
    if (!x) { dessiner(); dire('${T("Aucun profil appliqué — les réglages sont ceux de l’écran.")}', 'att'); return; }
    var r = x.r || {};
    var perdus = [];
    if (r.voie && estVoie(r.voie)) { VOIE = r.voie; VOIE_CHOISIE = true; }
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
      perdus.push('${T("le logo")}');
    }
    /* Les reglages viennent de changer : le resultat affiche n est plus celui
       qu ils produiraient, et ses formats non plus. Les garder ferait
       enregistrer une image que l ecran ne decrit plus. */
    RESULT = null; FORMATS = []; ENREG = false;
    dessiner();
    var m = '${T("Profil «")} ' + x.nom +' ${T("» appliqué.")}';
    if (perdus.length) {
      dire(m + ' ' + perdus.join(' et ') + ' ${T("de ce profil")} '
        + (perdus.length > 1 ? '${T("n’existent plus")}' : '${T("n’existe plus")}')
        + ' ${T("— ce réglage est resté au défaut.")}', 'att');
    } else {
      dire(m + ' ${T("Tout est en place : il ne reste que la photo à choisir.")}', 'bon');
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
    voile('<h3><span class="ic">💾</span> ${T("Enregistrer le profil")}</h3>'
      + ''
      + ''
      + '<p><input type="text" id="rc-nom" aria-label="${T("Nom de la recette")}" maxlength="60" placeholder="${T("Ex. : Collection automne — plage dorée")}" '
      + 'value="' + esc(x ? x.nom : '') + '"></p>'
      + '<p class="rcav" id="rc-av">' + (x
          ? '${T("Ce nom est celui du profil choisi : il sera <strong>remplacé</strong>.")}'
          : '') + '</p>'
      + '<div class="fin2"><button id="rc-non">${T("Annuler")}</button>'
      + '<button class="prim" id="rc-oui">${T("Enregistrer")}</button></div>',
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
            ? '${T("Un profil porte déjà ce nom : il sera <strong>remplacé</strong>.")}'
            : '';
        };
        if (n) { n.oninput = majAv; majAv(); }
        if (non) non.onclick = fermer;
        var lancer = function(){
          var nom = String((n && n.value) || '').trim();
          if (!nom) { if (av) av.innerHTML = '${T("Donnez-lui un nom.")}'; if (n) n.focus(); return; }
          if (oui) oui.disabled = true;
          enregistrerRecette(nom, fermer);
        };
        if (oui) oui.onclick = lancer;
        if (n) n.onkeydown = function(ev){ if (ev.key === 'Enter') { ev.preventDefault(); lancer(); } };
      });
  }

  function enregistrerRecette(nom, fermer){
    dire('${T("Enregistrement du profil…")}');
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
      dire('${T("Profil «")} ' + nom + ' ${T("» enregistré.")}', 'bon');
    });
  }

  function retirerRecette(){
    var x = recetteChoisie();
    if (!x || RO) return;
    voile('<h3>${T("Retirer le profil ?")}</h3>'
      + '<p>« <strong>' + esc(x.nom) + '</strong> ${T("» sera effacé. Les réglages restent à l’écran :")} '
      + '${T("c’est le raccourci qui disparaît, pas la mise en scène.")}</p>'
      + '<div class="fin2"><button id="rs-non">${T("Annuler")}</button>'
      + '<button class="conf" id="rs-oui">${T("Retirer")}</button></div>',
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
            dire('${T("Profil retiré.")}', 'att');
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
      dire('${T("Photo d’intérieur retirée.")}', 'att'); };
  }

  function lireInterieur(fi){
    if (!fi || String(fi.type).indexOf('image/') !== 0) { dire('${T("Ce n’est pas une image.")}', 'err'); return; }
    dire('${T("Lecture de la photo d’intérieur…")}');
    var fr = new FileReader();
    fr.onload = function(){ reduire(String(fr.result || ''), function(petite){
      INTERIEUR = petite; INTERIEUR_NOM = String(fi.name || '');
      majAvance(); dire('${T("Photo d’intérieur prête.")}', 'bon'); }); };
    fr.onerror = function(){ dire('${T("Lecture impossible.")}', 'err'); };
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
    'editWithAI.additionalImages.interior.imageFile': '${T("la photo de l’intérieur du vêtement")}',
    'background.prompt': '${T("le décor décrit au texte")}',
    'background.negativePrompt': '${T("l’anti-consigne du décor")}',
    'background.seed': '${T("la graine du décor")}',
    'lighting.mode': '${T("la relumière")}',
    'upscale.mode': 'l’agrandissement',
    'shadow.mode': '${T("l’ombre portée")}',
    'shadow.intensityOverride': '${T("l’intensité de l’ombre")}',
    'shadow.softnessOverride': '${T("la douceur de l’ombre")}',
    'shadow.spreadOverride': '${T("l’étendue de l’ombre")}',
    'shadow.directionOverride': '${T("la direction de l’ombre")}',
    'shadow.subjectPoseOverride': '${T("la pose du sujet pour l’ombre")}',
    'virtualModel.pose': '${T("la pose du mannequin")}',
    'virtualModel.prompt': '${T("l’expression et les précisions libres")}',
    'virtualModel.scene.preset.name': '${T("le décor du mannequin")}',
    'virtualModel.model.preset.name': '${T("le mannequin choisi")}'
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
      + '<img src="' + esc(av) + '" alt="${T("avant")}">'
      + '<div class="cb"><img src="' + RESULT.image + '" alt="${T("après")}"></div>'
      + '<div class="cpg" id="cmp-p" role="slider" tabindex="0"'
      + ' aria-label="${T("Position du rideau entre l’avant et l’après")}"'
      + ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(CMP_POS) + '">'
      + '<span class="cph">⇔</span></div>'
      + '<span class="cet g">${T("Avant")}</span><span class="cet d">${T("Après")}</span></div>'
      + (!PHOTO && PHOTO_URL
          ? '<div class="avis">${T("L’« avant » est la vignette de la photothèque : un repère de")} '
            + '${T("cadrage et de couleur, pas un juge de netteté.")}</div>'
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
    dire('${T("Préparation des formats…")}');
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
            ? (out.length + ' ${T("formats prêts — aucun appel, aucun crédit.")}')
            : '${T("Aucun format n’a pu être préparé.")}', out.length ? 'bon' : 'err');
        } catch (e) {
          FORMATS = [];
          fini('${T("Les formats n’ont pas pu être préparés (")}' + esc((e && e.message) || e) + ').', 'err');
        }
      };
      im.onerror = function(){
        FORMATS = [];
        fini('${T("L’image n’a pas pu être relue pour en tirer des formats.")}', 'err');
      };
      im.src = RESULT.image;
    } catch (e) {
      FORMATS = [];
      fini('${T("Les formats ne sont pas disponibles dans cette fenêtre.")}', 'err');
    }
  }

  function nomRendu(){ return 'studio-' + ((RESULT && RESULT.voie) || VOIE) + '-' + ((RESULT && RESULT.preset) || PRESET); }
  function nomFormat(f){ return nomRendu() + '-' + f.cle; }

  function formatsHtml(){
    if (!RESULT) return '';
    var h = '<span class="rt">${T("Formats de sortie")}</span>'
      + '<div class="note">${T("La même image en 3:4, 1:1, 4:5 et 9:16, préparés ici même —")} '
      + '<strong>${T("aucun appel, aucun crédit")}</strong>.</div>'
      + '<div class="fbar">'
      + '<button class="jeton' + (FORM_MODE === 'recadrer' ? ' on' : '') + '" data-fmode="recadrer">${T("Recadrer")}</button>'
      + '<button class="jeton' + (FORM_MODE === 'marges' ? ' on' : '') + '" data-fmode="marges">${T("Marges")}</button>'
      + '<button class="jeton prim grand" id="fmt-go"' + (FORM_OCC || RO ? ' disabled' : '') + '>'
      + (FORM_OCC ? '${T("Préparation…")}' : (FORMATS.length ? '${T("↻ Refaire les 4 formats")}' : '${T("⚙ Préparer les 4 formats")}'))
      + '</button></div>';
    /* ⚠ CE QUE CHAQUE GESTE COÛTE VRAIMENT, DIT AVANT DE CLIQUER. Un recadrage
       centré COUPE — sur une silhouette entière, le 1:1 emporte forcément le haut
       et le bas. Le taire ferait découvrir la coupe une fois les quatre images
       enregistrées dans la photothèque. */
    h += '';
    if (FORMATS.length) {
      h += '<div class="fmtg">' + FORMATS.map(function(f){
        return '<div class="fmtc"><img src="' + f.image + '" alt="' + esc(f.label) + '" loading="lazy">'
          + '<span class="ft">' + esc(f.label) + '</span>'
          + '<span class="fd">' + f.largeur + ' × ' + f.hauteur + '</span>'
          + '<span class="fb">'
          + '<button data-fdl="' + esc(f.cle) + '" title="${T("Télécharger ce format")}">⤓</button>'
          + '<button data-fsv="' + esc(f.cle) + '"' + (f.enreg ? ' disabled' : '')
          + ' title="${T("Enregistrer dans la photothèque")}">'
      + (f.enreg ? '✓' : '<span class="ic">💾</span>') + '</button>'
          + '</span></div>';
      }).join('') + '</div>'
        + '<div class="fbar"><button class="prim" id="fmt-save-all"'
        + (RO ? ' disabled' : '') + '><span class="ic">💾</span> ${T("Enregistrer les")} ' + FORMATS.length
        + ' ${T("dans la photothèque")}</button></div>';
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
          ? (faits + ' ' + (faits > 1 ? '${T("formats enregistrés")}' : '${T("format enregistré")}')
             + ', ' + rate + ' ${T("en échec.")}')
          : (faits + ' ${T("formats enregistrés dans la photothèque.")}'), rate ? 'att' : 'bon');
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
    dire('${T("Enregistrement du format")} ' + f.label + '…');
    appeler('studio:enregistrer', [{ image: f.image, nom: nomFormat(f) }]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        f.enreg = true;
        peindreResultat();
        dire('Format ' + f.label + ' ${T("enregistré dans la photothèque.")}', 'bon');
      } else dire(expliquer(r), 'err');
    });
  }

  /* Les fleches pour passer d une photo du panier a l autre, dans l apercu. */
  function navPanierHtml(){
    if (!DU_PANIER || PANIER.length < 2) return '';
    return '<div class="navp"><button id="pn-prec" aria-label="${T("Photo précédente")}"' + (OCCUPE ? ' disabled' : '') + '>‹</button>'
      + '<span>' + (PANIER_IDX + 1) + ' / ' + PANIER.length + '</span>'
      + '<button id="pn-suiv" aria-label="${T("Photo suivante")}"' + (OCCUPE ? ' disabled' : '') + '>›</button></div>';
  }

  function resultatHtml(){
    if (!RESULT) {
      /* ⚠ LA PHOTO DE DEPART SE MONTRE AVANT TOUT RENDU (2026-09-25). Le volet
         disait << L image apparaitra ici >> meme une photo choisie : on ne voyait
         pas CE qu on allait traiter, et rien ne distinguait << pas de photo >> de
         << photo choisie, pas encore de rendu >>. */
      var dep = photoAvant();
      if (aUnePhoto()) {
        return '<div class="srcap">'
          + (dep ? '<img src="' + esc(dep) + '" alt="${T("photo de départ")}">'
                 : '<div class="vide" style="padding:.2rem">${T("Chargement de la photo…")}</div>')
          + (PHOTO_NOM ? '<span class="nm">' + esc(PHOTO_NOM) + '</span>' : '')
          + navPanierHtml() + '</div>' + guideHtml();
      }
      return '<div class="vide" style="padding:.2rem">${T("L’image apparaîtra ici.")}</div>' + guideHtml();
    }
    var av = photoAvant();
    var h = navPanierHtml();
    if (av) {
      h += '<div class="cmpb">'
        + '<button class="jeton' + (CMP ? ' on' : '') + '" id="cmp-on">${T("⇔ Avant / après")}</button>'
        + '<button class="jeton' + (CMP ? '' : ' on') + '" id="cmp-off">${T("Résultat seul")}</button></div>';
    }
    h += (av && CMP) ? comparateurHtml(av) : ('<img src="' + RESULT.image + '" alt="${T("résultat")}">');
    if (RESULT.essai) h += '<div class="filig"><span class="ic">⚠</span> ${T("Aperçu filigrané (sandbox) — gratuit. « Générer en pleine qualité » retire le filigrane.")}</div>';
    if (RESULT.decorErreur) h += '<div class="filig"><span class="ic">⚠</span> ${T("Le décor n’a pas pu être appliqué :")} ' + esc(RESULT.decorErreur) + '</div>';
    if (RESULT.ignores) h += '<div class="filig"><span class="ic">⚠</span> ${T("Le service a <strong>ignoré</strong> : ")}'
      + esc(ignoresLisible(RESULT.ignores)) + '${T(". Le reste du traitement a bien eu lieu.")}</div>';
    if (RESULT.upNote) h += '<div class="avis">' + esc(RESULT.upNote) + '</div>';
    if (RESULT.largeur) h += '<div class="dims">' + RESULT.largeur + ' × ' + RESULT.hauteur + ' px</div>';
    h += '<div class="dl"><button id="b-dl">${T("Télécharger l’image")}</button> '
      + '<button id="b-save"' + (ENREG ? ' disabled' : '') + '>' + (ENREG ? '${T("✓ Dans la photothèque")}' : '<span class="ic">💾</span> ${T("Enregistrer dans la photothèque")}') + '</button></div>';
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
                  : '<span class="jt gris">${T("ambiance à choisir")}</span>');
    if (VOIE === 'humain') {
      j.push('<span class="jt">' + esc(nomModele(MODELE_SEL)) + '</span>');
      j.push('<span class="jt">' + esc(nomPose(POSE_SEL)) + '</span>');
    }
    var a = resumeAvance(VOIE);
    if (a) {
      a.split(' · ').forEach(function(x){ j.push('<span class="jt">' + esc(x) + '</span>'); });
    }
    if (RESULT && RESULT.filigrane) j.push('<span class="jt">${T("filigrané")}</span>');
    return '<div class="bloc recap"><span class="rt">${T("Ce qui sera généré")}</span>'
      + '<div class="rc2">' + j.join('') + '</div>'
      + '</div>';
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
      + l(e1, !e1, '1', '${T("Choisissez une photo")}')
      + l(e2, e1 && !e2, '2', '${T("Choisissez une ambiance")}')
      + l(false, e1 && e2, '3', '${T("Cliquez « Aperçu gratuit », en bas de la fenêtre")}')
      + '</div>';
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    /* Le suivi des lots prend TOUT l ecran : il remplace les deux volets au
       lieu de se serrer dans l un des deux. */
    if (LOTS_VUE) {
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
    /* ⚠⚠ ph-ouvrir N EXISTE PLUS (2026-09-09) : le bouton << Depuis la
       photothèque >> est retiré sur sa demande, l explorateur le remplace. Son
       branchement est retiré avec lui — un branchement qui cherche un élément
       absent n est pas une erreur, mais il fait croire que le bouton existe
       encore quelque part.
       ⚠ LA TÂCHE À PART EST FAITE : le sélecteur interne plein écran est retiré
       le 2026-09-19 (#30), sur sa décision #31. */
    var px = document.getElementById('ph-explorateur');
    if (px) px.onclick = function(){
      appeler('explorateur:ouvrir', []).then(function(r){
        dire(r && r.ok ? '${T("Explorateur ouvert dans sa fenêtre.")}' : expliquer(r),
          (r && r.ok) ? 'bon' : 'err');
      });
    };
    var lv = document.getElementById('lots-voir');
    if (lv) lv.onclick = function(){ LOTS_VUE = true; chargerLots(); dessiner(); };
    var pnv = document.getElementById('pn-vider');
    if (pnv) pnv.onclick = function(){
      if (OCCUPE) return;
      // ⚠ On ne vide l ecran que si le site a vide : sinon le sondage suivant
      // ramenait la liste deux secondes plus tard, sans un mot.
      appeler('panier:vider', []).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        PANIER = []; PANIER_SIG = '';
        if (DU_PANIER) { DU_PANIER = false; PHOTO_ID = ''; PHOTO_URL = ''; PHOTO_NOM = ''; PANIER_IDX = 0;
          RESULT = null; FORMATS = []; ENREG = false; }
        dessiner();
      });
    };
    corps.querySelectorAll('[data-pn]').forEach(function(el){
      el.onclick = function(){
        if (OCCUPE) return;
        var i = parseInt(el.getAttribute('data-pn'), 10) || 0;
        if (i === PANIER_IDX && DU_PANIER) return;
        confirmerPerte(function(){ choisirDuPanier(i); dessiner(); });
      };
    });
    var pp = document.getElementById('pn-prec');
    if (pp) pp.onclick = function(){ panierPasser(-1); };
    var psv = document.getElementById('pn-suiv');
    if (psv) psv.onclick = function(){ panierPasser(1); };
    var pnl = document.getElementById('pn-lot');
    if (pnl) pnl.onclick = function(){
      if (OCCUPE) return;
      // Une seule facon de lancer un lot, et c est ce voile.
      SEL = {};
      PANIER.forEach(function(p){ SEL[p.id] = true; });
      ouvrirLotVoile();
    };
    brancherLots();
    brancherOnglets();
    brancherRecettes();
    /* ⚠ LE BRANCHEMENT DU SELECTEUR EST PARTI AVEC LUI (#30, 2026-09-19) :
       ph-retour, ph-q, ph-grille et la barre de filtres. Un branchement qui
       cherche un element absent n est pas une erreur, mais il fait croire que
       l ecran existe encore quelque part — c est la raison meme pour laquelle
       ph-ouvrir avait ete debranche le 2026-09-09. */
    corps.querySelectorAll('[data-voie]').forEach(function(el){
      el.onclick = function(){ if (RO || OCCUPE) return; VOIE = el.getAttribute('data-voie'); VOIE_CHOISIE = true; RESULT = null; FORMATS = []; ENREG = false; dessiner();
        dire('${T("Voie :")} ' + VOIE + '.', 'att'); };
    });
    corps.querySelectorAll('[data-preset]').forEach(function(el){
      el.onclick = function(){ if (RO || OCCUPE) return; PRESET = el.getAttribute('data-preset'); dessiner(); };
    });
    var ps = document.getElementById('pose');
    if (ps) ps.onchange = function(){
      POSE_SEL = ps.value;
      dessiner();
      dire('${T("Pose :")} ' + (POSES.filter(function(p){ return p.cle === POSE_SEL; })[0] || {}).t + '.', 'att');
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
    if (av !== m) dire('${T("Modèle :")} ' + nomModele(m) + '.', 'bon');
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
    RESULT = null; ENREG = false;
    INTERIEUR = null; INTERIEUR_NOM = '';
    dessiner();
  }

  function lireFichier(f){
    if (!f || String(f.type).indexOf('image/') !== 0) { dire('${T("Ce n’est pas une image.")}', 'err'); return; }
    dire('${T("Lecture de la photo…")}');
    var fr = new FileReader();
    fr.onload = function(){ reduire(String(fr.result || ''), function(petite){
      PHOTO = petite; PHOTO_ID = ''; PHOTO_URL = ''; PHOTO_NOM = String(f.name || '');
      RESULT = null; ENREG = false;
      INTERIEUR = null; INTERIEUR_NOM = '';   // elle appartenait au vêtement précédent
      dessiner(); dire('${T("Photo prête.")}', 'bon'); }); };
    fr.onerror = function(){ dire('${T("Lecture impossible.")}', 'err'); };
    fr.readAsDataURL(f);
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
        return '<p style="color:#e08a8a;margin:.6rem 0 0"><span class="ic">⚠</span> <strong>${T("Aucun logo choisi.")}</strong> '
          + '${T("Ouvrez « Filigrane » dans la colonne de gauche et choisissez-en un : sans logo,")} '
          + '${T("le lot échouerait photo après photo.")}</p>';
      }
      return '<label class="rc"><input type="checkbox" id="lot-reglages"'
        + (coche === false ? '' : ' checked') + '> '
        + '<span><strong>${T("Poser le filigrane réglé à l’écran")}</strong> — ' + esc(lg.nom) + ' · '
        + esc(nomPosition(FIL.position)) + ' · ' + FIL.taille + ' % · '
        + Math.round(FIL.opacite * 100) + ' ${T("% d’opacité.")}<br>'
        + '<span style="font-size:.74rem;color:var(--tx2)">${T("Ce traitement ne passe par aucun service :")} '
        + '<strong>${T("aucun appel, aucun crédit")}</strong>${T(", qu’il y ait cinq photos ou cinq cents.")}</span>'
        + '</span></label>';
    }
    var voie = voiePourQuoi(quoi);
    if (!estVoie(voie)) {
      return '<p style="color:var(--tx-or);margin:.6rem 0 0"><span class="ic">⚠</span> ${T("Ce traitement ne passe pas par Photoroom :")} '
        + '${T("ni l’ambiance, ni la mise en scène, ni les réglages avancés n’y changent quoi que ce soit.")} '
        + '${T("Le détourage se fait au détoureur, et il n’a pas de décor à composer.")}</p>';
    }
    var r = resumeReglages(voie);
    if (!r) {
      return '<p style="color:var(--tx2);margin:.6rem 0 0">${T("Aucune ambiance ni mise en scène")} '
        + '${T("choisie à l’écran : le lot partira avec les réglages par défaut.")}</p>';
    }
    // ⚠ La photo d intérieur est la SEULE chose du panneau avancé qui ne peut pas
    // suivre un lot : elle est propre à UN vêtement, pas à cinq cents.
    var sup = (voie === 'fantome' && INTERIEUR)
      ? '<br><span style="font-size:.74rem;color:var(--tx-or)"><span class="ic">⚠</span> ${T("La photo d’intérieur ne suit pas un lot :")} '
        + '${T("chaque photo utilise celle qui lui est attachée dans la photothèque.")}</span>' : '';
    return '<label class="rc"><input type="checkbox" id="lot-reglages"'
      + (coche === false ? '' : ' checked') + '> '
      + '<span><strong>${T("Appliquer la mise en scène de l’écran")}</strong> — ' + esc(r) + '.<br>'
      + '<span style="font-size:.74rem;color:var(--tx2)">${T("Décochez pour un traitement brut,")} '
      + '${T("sans ambiance ni pose imposée.")}</span>' + sup + '</span></label>';
  }

  function ouvrirLotVoile(){
    var ids = Object.keys(SEL);
    /* ⚠ UNE SEULE PHOTO EST UN LOT VALIDE. Le garde etait << moins de 2 >>,
       alors que le panier propose << Traiter cette photo en lot... >> des UNE
       photo : le bouton existait et ne faisait rien. Un lot d une photo garde
       tout son sens — il part en arriere-plan et se suit comme les autres. */
    if (!ids.length) return;
    var nP = ids.length;
    /* ⚠ CETTE LISTE ETAIT UN REPLI, ELLE EST DEVENUE LA SEULE (#30, 2026-09-19).
       Elle se lisait PH_META.traitements sinon ceci — mais PH_META n etait
       rempli QUE par la grille du selecteur interne. Le chemin qui survit (le
       panier venu de l explorateur) prenait donc DEJA ce repli : rien ne change
       pour lui, et plus personne ne lit une variable qui restait vide. */
    var opts = [
      { cle: 'detourage', nom: '${T("Détourage")}' }, { cle: 'fantome', nom: '${T("Mannequin retiré")}' },
      { cle: 'humain', nom: '${T("Porté par un mannequin")}' },
      /* ⚠ LE FILIGRANE MANQUAIT A LA LISTE (2026-09-25) : le site l accepte, et
         tout le code qui le traite plus bas (estimation gratuite, logo) etait
         donc inatteignable. */
      { cle: 'filigrane', nom: '${T("Filigrane / logo")}' }];
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
      ? ('<div class="ch"><label for="lot-rc">${T("Profil (facultatif)")}</label>'
        + '<select id="lot-rc"><option value="">${T("— Garder les réglages de l’écran —")}</option>'
        + RECETTES.map(function(o){
            return '<option value="' + esc(o.id) + '"' + (RC_SEL === o.id ? ' selected' : '')
              + '>' + esc(o.nom) + '</option>'; }).join('')
        + '</select><div class="aidep">${T("Il pose d’un coup la voie, l’ambiance, le mannequin, la")} '
        + '${T("pose, les réglages avancés et le filigrane de ce lot.")}</div></div>')
      : '';
    voile('<h3>${T("⚙ Traiter")} ' + nP + ' '
      + (nP > 1 ? '${T("photos en lot")}' : '${T("photo en lot")}') + '</h3>'
      + rcListe
      + '<div class="ch"><label for="lot-quoi">${T("Traitement à appliquer")}</label>'
      + '<select id="lot-quoi">' + opts.map(function(t){
          return '<option value="' + esc(t.cle) + '"' + (t.cle === voieDef ? ' selected' : '')
            + '>' + esc(t.nom) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="lot-nom">${T("Nom du lot (pour le retrouver dans le suivi)")}</label>'
      + '<input id="lot-nom" placeholder="${T("Collection automne — détourage")}"></div>'
      + '<div id="lot-reg">' + reglagesLotHtml(voieDef) + '</div>'
      + '<label class="rc"><input type="checkbox" id="lot-prio"> '
      + '<span><strong>${T("Priorité haute")}</strong> ${T("— ce lot passe devant ceux qui attendent.")}</span></label>'
      + '<label class="rc"><input type="checkbox" id="lot-refaire"> '
      + '<span><strong>${T("Refaire celles déjà traitées.")}</strong> ${T("Par défaut elles sont écartées :")} '
      + '${T("les repasser coûte un appel chacune pour un résultat identique.")}</span></label>'
      + '<p style="color:var(--tx2)">${T("Chaque photo est un appel facturé. Le lot part en arrière-plan :")} '
      + '${T("vous pouvez fermer cette fenêtre, le traitement continue et se suit depuis n’importe quel écran.")}</p>'
      /* ⚠ CE QUE ÇA VA COÛTER, AVANT DE CLIQUER. Le chiffre est demandé au relais
         (« studio:estimer ») et jamais recalculé ici : lui seul sait qu un fantôme
         avec décor est DEUX appels, et que le détourage part chez un autre
         fournisseur, cinquante fois moins cher. */
      + '<div id="lot-estim" style="margin:.6rem 0 0;padding:.5rem .6rem;border:1px solid #2a3a4e;'
      + 'border-radius:6px;background:var(--f-16202c);font-size:.8rem;color:var(--tx2)">${T("Estimation du coût…")}</div>'
      + '<div class="fin2"><button id="v-non">${T("Annuler")}</button>'
      + '<button class="prim" id="v-oui">${T("Lancer le lot")}</button></div>',
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
        /* ⚠ LA DECISION DES TROIS DECIMALES RESTE ICI — elle appartient a cet
           ecran. Ce qui part vers la piece commune, c est le GROUPEMENT et le
           separateur, qui appartiennent a la langue (#102). */
        var sous = function(v){
          var n = Number(v || 0);
          return szArgentNombre(n, (n > 0 && n < 0.01) ? 3 : 2);
        };
        /* ⚠ UNE ESTIMATION PAR CHANGEMENT, ET SEULE LA DERNIERE COMPTE. Sans ce
           numero, une reponse lente d un reglage precedent ecrasait la plus
           recente — et pouvait reactiver << Lancer le lot >> sur un cout qui
           n etait plus celui affiche. */
        var ESTIM_N = 0;
        var majEstimation = function(){
          var nEst = ++ESTIM_N;
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
            z.innerHTML = '<strong>' + nP + ' ' + (nP > 1 ? '${T("photos")}' : '${T("photo")}')
              + ' ${T("· aucun appel facturé")}</strong><br>${T("Le filigrane est posé dans l’application,")} '
              + '${T("au canevas : il ne coûte rien et n’entame pas le plafond mensuel.")}';
            if (b) b.disabled = false;
            return;
          }
          z.textContent = '${T("Estimation du coût…")}';
          if (b) b.disabled = true;
          appeler('studio:estimer', [{ geste: (voie || quoi), nb: nP,
            preset: reg.preset || '', finition: reg.finition || {}, options: reg }]).then(function(r){
            if (nEst !== ESTIM_N) return;   // un reglage plus recent a deja parle
            if (b) b.disabled = false;
            var z2 = document.getElementById('lot-estim');
            if (!z2) return;
            if (!r || !r.ok) {
              z2.innerHTML = '<span style="color:var(--tx-or)"><span class="ic">⚠</span> ${T("Coût non estimé")}</span> ${T("— le relais n’a pas")} '
                + '${T("répondu (")}' + esc(expliquer(r)) + '${T("). Le lot peut partir : le plafond mensuel, lui,")} '
                + '${T("est appliqué au serveur et arrêtera la file s’il est atteint.")}';
              return;
            }
            var bu = r.budget || {};
            /* Une fourchette quand elle existe : l agrandissement ×4 est ignoré
               au-delà de 1000 px, donc il coûte « au plus » un appel de plus.
               Annoncer un chiffre unique et faux serait pire que la fourchette. */
            /* ⚠ LA FOURCHETTE EST UNE PHRASE, PAS TROIS MORCEAUX COLLES. « de »
               et « à » etaient des litteraux nus : aucun dictionnaire ne les
               atteignait, parce qu ils sont assembles A L EXECUTION et
               n existent nulle part dans la page au moment ou on la releve.
               ⚠ split/join et NON replace : un montant anglais commence par
               << $ >>, et replace lit << $1 >> comme un renvoi de capture. */
            var mt = (r.coutMax > r.coutMin)
              ? '${T("de {0} à {1}")}'
                  .split('{0}').join(szArgentSymbole(sous(r.coutMin)))
                  .split('{1}').join(szArgentSymbole(sous(r.coutMax)))
              : szArgentSymbole(sous(r.coutMax));
            var app = (r.appelsMax > r.appelsMin)
              ? (r.appelsMin + ' à ' + r.appelsMax) : String(r.appelsMax);
            var h = '<strong>' + nP + ' ' + (nP > 1 ? '${T("photos")}' : '${T("photo")}') + ' · ' + app
              + ' ' + (r.appelsMax > 1 ? '${T("appels facturés")}' : '${T("appel facturé")}')
              + ' ≈ ' + mt + '</strong>';
            if (bu.actif) {
              /* ⚠ LE SYMBOLE ETAIT DANS LA PHRASE TRADUITE (« $ dépensés sur »),
                 donc COLLE APRES le nombre dans les deux langues. En anglais il
                 se pose DEVANT : la phrase doit donc porter des trous, pas des
                 symboles. */
              h += '<br>${T("Plafond du mois :")} '
                + '${T("{0} dépensés sur {1} — il reste {2}.")}'
                    .split('{0}').join(szArgentSymbole(sous(bu.depense)))
                    .split('{1}').join(szArgentSymbole(sous(bu.mensuel)))
                    .split('{2}').join(szArgentSymbole(sous(bu.restant)));
            } else {
              h += '<br><span style="color:var(--tx2)">${T("Aucun plafond mensuel n’est posé")} '
                + '${T("(fenêtre « Traitements d’image »).")}</span>';
            }
            if (r.depasse) {
              /* ⚠⚠ ON NE RÉPOND PAS << non >>, ON RÉPOND << COMBIEN >>. Un refus
                 sec laisse deviner ; le nombre de photos qui rentrent permet de
                 découper le lot et de lancer tout de suite ce qui est possible. */
              var n2 = (r.photosPossibles == null) ? 0 : r.photosPossibles;
              h += '<br><span style="color:#e08a8a"><strong>${T("Ce lot ne rentre pas dans le plafond.")}</strong> '
                + (n2 > 0
                    ? ('${T("Il reste de quoi en traiter")} ' + n2 + ' ${T("— désélectionnez-en")} '
                       + (nP - n2) + '${T(", ou relevez le plafond.")}')
                    : '${T("Relevez le plafond mensuel, ou attendez le mois prochain.")}')
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
                ? ('Ces ' + (r.deja || ids.length) + ' ${T("photos ont déjà ce traitement. Cochez « Refaire » pour les repasser.")}')
                : expliquer(r), 'err');
              return;
            }
            SEL = {};
            dire(r.nom + ' — ' + r.total + ' '
              + (r.total > 1 ? '${T("photos en traitement")}' : '${T("photo en traitement")}')
              + (r.ignorees ? ' (' + r.ignorees + ' '
                  + (r.ignorees > 1 ? '${T("déjà faites, écartées")}' : '${T("déjà faite, écartée")}') + ')' : '')
              + '${T(". Suivez-le en bas de n’importe quel écran.")}', 'bon');
            LOTS_VUE = true;
            chargerLots();
          });
        };
      });
  }
  function occuper(o){
    OCCUPE = o;
    if (!o && A_REDESSINER) { A_REDESSINER = false; if (!LOTS_VUE) dessiner(); }
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
    if (ENREG) { dire('${T("Déjà enregistrée dans la photothèque.")}', 'att'); return; }
    occuper(true); dire('${T("Enregistrement dans la photothèque…")}');
    appeler('studio:enregistrer', [{ image: RESULT.image, nom: nomRendu() }]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        ENREG = true;
        var sv = document.getElementById('b-save');
        if (sv) { sv.textContent = '${T("✓ Dans la photothèque")}'; sv.disabled = true; }
        dire('${T("Enregistrée dans la photothèque — vous pouvez l’attacher à un article de là.")}', 'bon');
      } else dire(expliquer(r), 'err');
    });
  }

  function lancer(apercu){
    if (RO || OCCUPE) return;
    if (!aUnePhoto()) { dire('${T("Importez d’abord une photo.")}', 'err'); return; }
    if (!PRESET) { dire('${T("Choisissez une ambiance.")}', 'err'); return; }
    occuper(true);
    dire(apercu ? '${T("Aperçu gratuit en cours…")}' : '${T("Génération en pleine qualité…")}');
    appeler('studio:traiter', [saisie(apercu)]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        ENREG = false;
        RESULT = { image: r.image, essai: !!r.essai, decorErreur: r.decorErreur || '',
                   ignores: r.ignores || '',
                   /* ⚠ LA MISE EN SCENE DU RENDU, gardee avec lui : changer
                      d ambiance apres coup renommait le fichier enregistre
                      (<< studio-humain-plage >> devenait << -foret >>). */
                   voie: VOIE, preset: PRESET,
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
        dire(apercu ? '${T("Aperçu prêt (gratuit).")}' : '${T("Image générée.")}', 'bon');
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
  /* ⚠ PASSE PAR LA PIECE COMMUNE DEPUIS LE 2026-09-14 (#102). Recompose a la
     main, ce montant perdait le GROUPEMENT DES MILLIERS : « 1234,50 $ » ici,
     « 1 234,50 $ » partout ailleurs. Le separateur decimal, lui, etait bon —
     c est ce qui rendait l ecart invisible a la relecture. */
  function argent(n){ return szArgentNombre(n, 2); }

  // Ce qui cause les appels supplementaires, dit dans les mots de l ecran.
  function causesAppels(){
    var c = [];
    if (VOIE === 'fantome') {
      c.push('${T("le <strong>fantôme habillé</strong> demande deux gestes : retirer le mannequin, puis poser le décor")}');
    }
    if (AV.upActive) c.push('${T("l’<strong>agrandissement ×4</strong> est un appel de plus, après le traitement")}');
    return c;
  }

  function confirmerDepense(apercu, suite){
    if (RO || OCCUPE) return;
    var fin = finitionPour(VOIE) || {};
    var opt = (VOIE === 'humain') ? optionsPour('humain') : {};
    dire('${T("Calcul du coût…")}');
    appeler('studio:estimer', [{ geste: VOIE, preset: PRESET, nb: 1, finition: fin, options: opt }])
      .then(function(r){
        if (!r || !r.ok) { dire('${T("Coût non estimé — le rendu part quand même.")}', 'att'); suite(); return; }
        var n = r.appelsMax || 1;
        // Un seul appel par image : rien a confirmer, on ne met pas un voile
        // entre lui et le bouton pour le cas ordinaire.
        if (n <= 1) { dire(''); suite(); return; }
        var causes = causesAppels();
        var bu = r.budget || {};
        var h = '<h3>' + (apercu ? '<span class="ic">👁</span> ${T("Aperçu —")} ' : '')
      /* ⚠ LE <em> COUPAIT LA PHRASE EN TROIS, et c est la FORME SOURCE contre la
         FORME RENDUE : le poseur cherche << appels pour >>, << une seule >> et
         << photo >> separement, la page rendue lit << appels pour une seule
         photo >> d un seul tenant. On enveloppe les DEUX morceaux de part et
         d autre, en gardant l emphase. */
      + n + ' ${T("appels pour")} <em>${T("une seule")}</em> ${T("photo")}</h3>';
        if (apercu) {
          h += ''
            + '<p>${T("Ce qu’il consomme, ce sont vos <strong>aperçus du mois</strong> — ")}' + n
            + '${T(" d’un coup — et le résultat sera <strong>filigrané</strong>.")}</p>';
        } else {
          h += '<p><strong>' + n + ' ${T("appels facturés ≈")} ' + szArgentSymbole(argent(r.coutMax))
            + ' ${T("pour cette")} '
            + '${T("photo. Un mannequin virtuel n’en coûterait qu’un seul.")}</p>';
          if (bu.actif) {
            /* Même phrase à trous que plus haut : le symbole change de côté. */
            h += '<p>${T("Plafond du mois :")} '
              + '${T("{0} dépensés sur {1} — il reste {2}.")}'
                  .split('{0}').join(szArgentSymbole(argent(bu.depense)))
                  .split('{1}').join(szArgentSymbole(argent(bu.mensuel)))
                  .split('{2}').join(szArgentSymbole(argent(bu.restant)))
              + '</p>';
          }
        }
        /* ⚠ ON DIT COMMENT REDESCENDRE A UN APPEL, pas seulement combien ça
           coûte : un avertissement sans porte de sortie ne fait que retarder le
           même clic. Mais on ne le dit QUE si l on sait pourquoi — conseiller de
           decocher un agrandissement qui est deja decoche envoie chercher un
           reglage qui n existe pas, et l ecran perd sa credibilite pour la fois
           suivante, celle ou le montant compte vraiment. */
        if (causes.length) {
          h += '<p>${T("Pourquoi :")} ' + causes.join(' ; ') + '.</p>';
          var sortie = [];
          if (AV.upActive) sortie.push('${T("décochez l’agrandissement")}');
          if (VOIE === 'fantome') sortie.push('${T("passez au « Mannequin virtuel »")}');
          if (sortie.length) {
            h += '<p class="rcav">${T("Pour n’en payer qu’un :")} ' + sortie.join(', ou ') + '.</p>';
          }
        }
        h += '<div class="fin2"><button id="cd-non">${T("Annuler")}</button>'
          + '<button class="' + (apercu ? 'prim' : 'conf') + '" id="cd-oui">'
          + (apercu ? '${T("Lancer l’aperçu")}'
              : '${T("Lancer —")} ' + szArgentSymbole(argent(r.coutMax))) + '</button></div>';
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
      ARME = true; bFinal.className = 'prim conf'; bFinal.textContent = '${T("Confirmer (consomme des crédits)")}';
      dire('${T("Un clic de plus lance un vrai rendu payant.")}', 'att');
      /* ⚠ L ARMEMENT EXPIRE : reste arme, un clic distrait une heure plus tard
         lancait un rendu payant. */
      clearTimeout(ARME_T);
      ARME_T = setTimeout(function(){
        if (!ARME) return;
        ARME = false; bFinal.className = 'prim'; bFinal.textContent = '${T("Générer en pleine qualité")}';
      }, 8000);
      return;
    }
    ARME = false; bFinal.className = 'prim'; bFinal.textContent = '${T("Générer en pleine qualité")}';
    confirmerDepense(false, function(){ lancer(false); });
  };

  /* ⚠ LE LANCEUR DE LOT EST AU PIED DE PAGE, ET C EST TOUT L INTERET : il ne
     demande AUCUN defilement, quel que soit l onglet ouvert.
     ⚠⚠ PANIER VIDE : IL OUVRE L EXPLORATEUR (#30, 2026-09-19). Il ouvrait le
     selecteur interne, qui n existe plus. Repondre << rien a traiter >> a
     quelqu un qui vient justement demander a traiter serait un mur — et c est
     la raison d origine de cette branche, qui reste vraie. On le mene donc la
     ou les photos se choisissent VRAIMENT : l explorateur les renvoie ici par
     le panier, et le bouton retrouve son lot. */
  if (bLot) bLot.onclick = function(){
    if (RO || OCCUPE) return;
    if (PANIER && PANIER.length) {
      SEL = {};
      PANIER.forEach(function(p){ SEL[p.id] = true; });
      ouvrirLotVoile();
      return;
    }
    appeler('explorateur:ouvrir', []).then(function(r){
      dire(r && r.ok
        ? '${T("Choisissez les photos du lot dans l’Explorateur, puis « Envoyer au Studio ».")}'
        : expliquer(r), (r && r.ok) ? 'att' : 'err');
    });
  };

  function telechargerImage(source, nom){
    if (!source) return;
    try {
      var a = document.createElement('a');
      a.href = source;
      a.download = nom;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      dire('${T("Téléchargement lancé.")}', 'bon');
    } catch (e) { dire('${T("Téléchargement impossible.")}', 'err'); }
  }

  function telecharger(){
    if (!RESULT || !RESULT.image) return;
    telechargerImage(RESULT.image, nomRendu() + '.png');
  }

  function chargerCredits(){
    appeler('studio:compte').then(function(r){
      if (!r || !r.ok) { creditsEl.textContent = ''; return; }
      var dispo = r.compte && r.compte.available != null ? r.compte.available : null;
      var sb = r.sandbox || {};
      var t = '';
      if (dispo != null) t += '${T("Crédits :")} <b>' + dispo + '</b>';
      if (sb.utilise != null) t += (t ? ' · ' : '') + '${T("Aperçus ce mois :")} ' + sb.utilise + (sb.quotaMois ? ' / ' + sb.quotaMois : '');
      creditsEl.innerHTML = t;
    });
  }

  function charger(){
    dire('${T("Chargement des ambiances…")}');
    appeler('studio:presets').then(function(r){
      if (!r || !r.ok) {
        corps.className = 'corps plein';
        corps.innerHTML = '<div class="carte"><div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div></div>';
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
    PHOTO_NOM = '${T("photo témoin")}';
    if (!PRESET) PRESET = (PRESETS[0] || {}).cle || '';
    ENREG = false;
    RESULT = { image: PIXEL, essai: true,
               decorErreur: '${T("le décor n’a pas pu être appliqué (témoin)")}',
               ignores: 'background.prompt,shadow.mode',
               upNote: '${T("Agrandissement ignoré : l’entrée dépasse 1000 px (témoin).")}',
               largeur: 1200, hauteur: 1600 };
    /* ⚠ DEUX FORMATS TÉMOINS, DONT UN DÉJÀ ENREGISTRÉ. Les vignettes ne naissent
       qu au CLIC sur « Préparer », et le banc ne clique pas ; et le canevas
       n existe pas dans le contexte de contrôle, donc les fabriquer pour de vrai
       est impossible. On pose donc la liste, seul état dont dépend le dessin —
       les deux états du bouton d enregistrement compris. */
    /* Deux logos témoins, pour que la grille, l état << choisi >> et le bouton
       << Appliquer >> soient dessinés au moins une fois. */
    if (!LOGOS.length) {
      LOGOS = [{ id: 'lg1', nom: '${T("Logo témoin")}', image: PIXEL },
               { id: 'lg2', nom: '${T("Logo témoin 2")}', image: PIXEL }];
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
  /* ⚠⚠ ET ILS POSENT UNE PHOTO TEMOIN DEPUIS LE 2026-09-09 — SANS QUOI CES DEUX
     ECRANS AURAIENT ETE CONTROLES A VIDE, EN SILENCE. Ce jour-la, les onglets
     autres que << Photo >> sont devenus DESACTIVES tant qu aucune photo n est
     choisie (sa demande), et le choix de l onglet courant ramene alors de force
     sur << Photo >>.
     Ces deux identifiants ne posaient aucune photo : ils auraient donc dessine
     le panneau PHOTO en croyant dessiner le decor et les ombres, et les bancs
     auraient continue de passer — un vert qui ne parle de rien, exactement ce
     que ce depot traque.
     ⚠ Ce n est pas un contournement du verrou : un usager ne peut atteindre ces
     onglets QU AVEC une photo. Le banc reproduit donc un etat REEL, ce qui est
     tout ce qu on lui demande.
     ⚠ Trouve en relisant l effet de mon changement sur les bancs, pas par les
     bancs eux-memes. Les bancs passaient. */
  if (${avOuvre ? 'true' : 'false'}) { PHOTO = PIXEL; PHOTO_NOM = '${T("photo témoin")}'; ONGLET = 'decor'; }
  if (${avPlein ? 'true' : 'false'}) { PHOTO = PIXEL; PHOTO_NOM = '${T("photo témoin")}';
    VOIE = 'fantome'; VOIE_CHOISIE = true; AV.ombreActive = true; AV.upActive = true;
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
  var PANIER_T = setInterval(function(){ if (!document.hidden) chargerPanier(); }, 2000);
  window.addEventListener('pagehide', function(){ clearInterval(PANIER_T); });
  if (${lotsDep ? 'true' : 'false'}) { LOTS_VUE = true; chargerLots(); }
})();
</script></body></html>`;
}

module.exports = { pageStudio };
