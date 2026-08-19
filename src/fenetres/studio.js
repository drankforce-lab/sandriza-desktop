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

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .credits{margin-left:auto;font-size:.74rem;color:#8fa1b8}
.tete .credits b{color:#c9a97e}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
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
.rail{flex:0 0 clamp(21rem,40%,34rem);min-width:0;overflow-y:auto;padding-right:.35rem;
  display:flex;flex-direction:column;gap:.8rem}
.scene{flex:1 1 auto;min-width:0;overflow-y:auto;display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar,.rail::-webkit-scrollbar,.scene::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb,.rail::-webkit-scrollbar-thumb,
.scene::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.9rem 1rem;min-width:0;display:flex;flex-direction:column}
.carte h2{margin:0 0 .1rem;font:700 .74rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8}
.carte .sous{margin:0 0 .7rem;font-size:.75rem;color:#6d7f96}
/* ── UNE ETAPE ─────────────────────────────────────────────────────────────
   Un numero qui devient une COCHE des que l etape est faite, un titre lisible,
   et a droite CE QUI A ETE CHOISI. On voit ou l on en est sans rien lire —
   c est le critere qu il a nomme en dernier et souligne : intuitif. */
.etape{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:12px;
  padding:.85rem .95rem;min-width:0}
.etape.vif{border-color:rgba(201,169,126,.45)}
.eth{display:flex;align-items:center;gap:.55rem}
.eth .num{flex:0 0 auto;width:1.5rem;height:1.5rem;border-radius:50%;
  border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);
  display:flex;align-items:center;justify-content:center;font:700 .76rem/1 system-ui;color:#8fa1b8}
.eth .num.ok{background:#c9a97e;border-color:#c9a97e;color:#1a1208}
.eth h2{margin:0;font:700 .88rem/1.2 system-ui;color:#e8edf5;text-transform:none;letter-spacing:0}
.eth .etat{margin-left:auto;font-size:.73rem;color:#6d7f96;min-width:0;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eth .etat.on{color:#c9a97e}
.etape .sous{margin:.28rem 0 0 2.05rem;font-size:.74rem;color:#6d7f96;line-height:1.4}
.etc{margin-top:.7rem}
.pbtn{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.6rem}
.pbtn button{flex:1 1 auto}
.pt2{font-size:.7rem;color:#6d7f96}
/* Deux menus courts cote a cote quand la place le permet, l un sous l autre
   sinon. auto-fit, donc jamais deux colonnes serrees dans un volet etroit. */
.duo{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:.6rem;margin-top:.7rem}
.duo .ch{margin:0}
/* ── LE VOLET DE DROITE ────────────────────────────────────────────────────
   Ce qu on va obtenir, toujours visible : le recapitulatif de la commande, puis
   l image. */
.bloc{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:12px;
  padding:.85rem 1rem;min-width:0}
.recap .rt{font:700 .74rem/1.2 system-ui;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.recap .rc2{display:flex;flex-wrap:wrap;gap:.32rem;margin-top:.5rem}
.recap .jt{font-size:.75rem;padding:.16rem .55rem;border-radius:99px;
  background:rgba(201,169,126,.14);border:1px solid rgba(201,169,126,.3);color:#e8dcc6}
.recap .jt.gris{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.14);color:#8fa1b8}
.recap .note{margin-top:.55rem;font-size:.73rem;color:#6d7f96;line-height:1.5}
/* Le geste suivant, sans avoir a lire une aide : ce qui est fait porte une
   coche, ce qui vient est mis en avant. */
.guide{display:flex;flex-direction:column;gap:.45rem;text-align:left;margin:.7rem auto 0;max-width:24rem}
.guide .gp{display:flex;align-items:center;gap:.55rem;font-size:.82rem;color:#6d7f96}
.guide .gp .n{flex:0 0 auto;width:1.35rem;height:1.35rem;border-radius:50%;
  border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);
  display:flex;align-items:center;justify-content:center;font:700 .72rem/1 system-ui;color:#8fa1b8}
.guide .gp.ok{color:#cbd8e6}
.guide .gp.ok .n{background:#c9a97e;border-color:#c9a97e;color:#1a1208}
.guide .gp.suiv{color:#e8dcc6;font-weight:600}
.guide .gp.suiv .n{border-color:#c9a97e;color:#c9a97e}
/* Dépôt de photo */
.depot{border:1.5px dashed #2b3444;border-radius:10px;background:#0f1724;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;
  min-height:9rem;text-align:center;color:#8fa1b8;font-size:.82rem;padding:1rem;-webkit-user-select:none;user-select:none}
.depot:hover,.depot.survol{border-color:#c9a97e;color:#cbd8e6}
.depot .gros{font-size:1.6rem;filter:grayscale(1) brightness(1.6)}
.depot img{max-width:100%;max-height:14rem;border-radius:8px}
.depot .refaire{font-size:.72rem;color:#8fa1b8;text-decoration:underline;margin-top:.3rem}
/* Choix dans la photothèque */
.phbarre{display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem}
.phbarre .phinfo{font-size:.74rem;color:#8fa1b8;margin-left:auto;white-space:nowrap}
.phbarre #ph-q{flex:1 1 auto;min-width:6rem;max-width:22rem;font:inherit;color:#e8edf5;
  background:#0f1724;border:1px solid #2b3444;border-radius:8px;padding:.34rem .55rem}
.phbarre #ph-q:focus{outline:none;border-color:#c9a97e}
/* ⚠ 7rem, pas 5,5 : la vignette porte desormais une coche et des pastilles.
   A l ancienne largeur, le nom passait dessous et devenait illisible. */
.phgrille{display:grid;grid-template-columns:repeat(auto-fill,minmax(7rem,1fr));gap:.5rem;
  max-height:calc(100vh - 18rem);min-height:14rem;overflow-y:auto;padding-right:.2rem}
.phgrille::-webkit-scrollbar{width:8px}
.phgrille::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.phvig{background:#0f1724;border:1px solid #2b3444;border-radius:8px;overflow:hidden;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;transition:border-color .12s}
.phvig:hover{border-color:#c9a97e}
.phvig img{width:100%;height:4.6rem;object-fit:contain;background:#0b1220}
.phvig .attente{font-size:.68rem;color:#6d7f96;padding:1.6rem .3rem}
.phvig .phnom{font-size:.64rem;color:#8fa1b8;padding:.15rem .25rem;max-width:100%;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* ── Explorateur : filtres, panier de selection, coches et pastilles ─────── */
.phfiltres{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin-bottom:.45rem}
.jeton{font:inherit;font-size:.73rem;padding:.16rem .55rem;border-radius:99px;cursor:pointer;
  color:#cbd8e6;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15)}
.jeton:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
.jeton:disabled{opacity:.4;cursor:default}
.jeton.on{background:rgba(201,169,126,.2);border-color:#c9a97e;color:#e8dcc6;font-weight:600}
.jeton.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
.phfiltres select{font:inherit;font-size:.73rem;color:#cbd8e6;background:#0f1724;
  border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.14rem .4rem;
  width:auto;max-width:15rem;flex:0 1 auto}
.phsel{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.45rem;
  padding:.35rem .5rem;border-radius:9px;background:rgba(255,255,255,.035);
  border:1px solid rgba(255,255,255,.08)}
.phsel .cpt{font-size:.76rem;color:#8fa1b8}
.phsel .cpt.on{color:#e8dcc6;font-weight:700}
.phsel .droite{margin-left:auto;display:flex;align-items:center;gap:.4rem}
.phsel .aide{font-size:.72rem;color:#8fa1b8}
.phvig{position:relative}
.phvig.pris{border-color:#c9a97e;box-shadow:0 0 0 1px #c9a97e inset}
.phcoche{position:absolute;top:.2rem;left:.2rem;width:1.05rem;height:1.05rem;z-index:2;
  border-radius:5px;border:1px solid rgba(255,255,255,.35);background:rgba(8,12,20,.7);
  display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#17202c}
.phvig.pris .phcoche{background:#c9a97e;border-color:#c9a97e;font-weight:700}
.phpast{position:absolute;top:.2rem;right:.2rem;z-index:2;display:flex;gap:.12rem}
.phpast .pt{font-size:.6rem;line-height:1;padding:.12rem .22rem;border-radius:4px;
  background:rgba(8,12,20,.75);color:#8fa1b8}
.phpast .pt.fait{color:#4ade80}
/* Le panier venu de l explorateur : ce qu on s apprete a traiter. */
.panier{margin-top:.55rem;padding:.5rem .6rem;border-radius:10px;
  background:rgba(201,169,126,.1);border:1px solid rgba(201,169,126,.35)}
.panier .pt{display:flex;align-items:center;gap:.4rem;font-size:.8rem;margin-bottom:.4rem}
.panier .pt .dt{color:#8fa1b8;font-size:.74rem}
.panier .pt button{margin-left:auto}
.panier .pv{display:flex;gap:.25rem;align-items:center;flex-wrap:wrap;margin-bottom:.45rem}
.panier .pv img{width:2.2rem;height:2.2rem;object-fit:contain;border-radius:5px;background:#0b1220}
.panier .pv .tr{width:2.2rem;height:2.2rem;border-radius:5px;background:rgba(255,255,255,.06)}
.panier .pv .pl{font-size:.72rem;color:#8fa1b8}
.panier button.prim{width:100%}
/* ── Suivi des lots ──────────────────────────────────────────────────────── */
.lots{display:flex;flex-direction:column;gap:.5rem;max-height:calc(100vh - 14rem);overflow-y:auto}
.lotc{background:#111a29;border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:.5rem .65rem}
.lotc.vif{border-color:#c9a97e}
.lott{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap;margin-bottom:.35rem}
.lott strong{font-size:.85rem}
.lott .dt{font-size:.72rem;color:#8fa1b8;margin-left:auto}
.lotc .jauge{height:.42rem;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}
.lotc .jauge i{display:block;height:100%;background:#c9a97e;transition:width .3s}
.lotd{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:.35rem;
  font-size:.76rem;color:#cbd8e6}
.lotd .mal{color:#f87171}
.lotd .droite{margin-left:auto;display:flex;gap:.3rem;flex-wrap:wrap}
.lote{margin-top:.3rem;font-size:.71rem;color:#8fa1b8;line-height:1.5}
.pill.acc{background:rgba(201,169,126,.18);color:#dcc39b}
.pill.err{background:rgba(239,68,68,.16);color:#f87171}
/* ── VOIES ET AMBIANCES ────────────────────────────────────────────────────
   ⚠⚠ ELLES ETAIENT EN FLEX SUR UNE SEULE LIGNE : le titre et sa description se
   disputaient la largeur d une tuile large d un tiers de demi-carte, et l on ne
   lisait ni l un ni l autre. La regle .tuile .txt existait pour les empiler,
   mais AUCUN des deux rendus ne posait ce conteneur — elle n a jamais servi.
   La tuile est donc une grille : l emoji tient la colonne de gauche sur deux
   rangs, le titre et la description se rangent l un SOUS l autre a droite. */
.tuiles{display:grid;grid-template-columns:1fr;gap:.4rem}
.tuile{background:#111a29;border:1px solid rgba(255,255,255,.09);border-radius:10px;
  padding:.58rem .7rem;cursor:pointer;-webkit-user-select:none;user-select:none;
  display:grid;grid-template-columns:auto 1fr;column-gap:.65rem;row-gap:.08rem;
  align-items:center;text-align:left;transition:border-color .12s,background .12s}
.tuile:hover{border-color:rgba(201,169,126,.5)}
.tuile.on{border-color:#c9a97e;background:rgba(201,169,126,.14)}
/* ⚠ Emoji en GRIS (comme le reste de l administration), jamais en couleur. */
.tuile .em{grid-row:1/3;align-self:center;font-size:1.35rem;line-height:1;
  filter:grayscale(1) brightness(1.45);opacity:.9}
.tuile .t{grid-column:2;font-size:.85rem;font-weight:700;line-height:1.25}
.tuile .d{grid-column:2;font-size:.72rem;color:#6d7f96;line-height:1.32}
/* Les ambiances passent a deux colonnes DES QUE le volet est assez large, et
   restent sur une seule quand il ne l est pas. C est auto-fill qui en decide,
   pas un nombre de colonnes ecrit en dur. */
.amb{grid-template-columns:repeat(auto-fill,minmax(13rem,1fr))}
/* Galerie de modèles — c'est la liste de CHOIX du mannequin, plus un menu texte.
   ⚠ contain et non cover : on veut voir la SILHOUETTE ENTIÈRE (demande du
   2026-08-11 : « je veux juste voir la forme du modèle et le corps aussi »).
   cover avec object-position:top recadrait sur le visage — exactement ce
   qu'il ne fallait pas montrer.
   ⚠ AUCUN ACCENT GRAVE ICI : cette feuille vit dans un littéral de gabarit. */
.mgal-info{font-size:.72rem;color:#8fa1b8;flex:1 1 12rem;min-width:0}
.mgrille{display:grid;grid-template-columns:repeat(auto-fill,minmax(5.8rem,1fr));gap:.55rem;
  max-height:24rem;overflow-y:auto;padding-right:.2rem}
.mgrille::-webkit-scrollbar{width:8px}
.mgrille::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.mvig{background:#0f1724;border:1px solid #2b3444;border-radius:9px;overflow:hidden;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;position:relative;
  transition:border-color .12s,background .12s}
.mvig:hover{border-color:rgba(201,169,126,.6);background:#121c2c}
.mvig.on{border-color:#c9a97e;box-shadow:0 0 0 1px #c9a97e inset;background:rgba(201,169,126,.1)}
.mvig img{width:100%;height:9rem;object-fit:contain;background:#0b1220;padding:.15rem;display:block}
.mvig .matt{height:9rem;display:flex;align-items:center;justify-content:center;
  color:#5c6b80;font-size:.7rem;width:100%;background:#0b1220;text-align:center;padding:.3rem}
.mvig .mnom{font-size:.72rem;font-weight:600;color:#cbd8e6;padding:.24rem .3rem;
  max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mvig.on .mnom{color:#e7d3b3}
/* Pastille discrète : cette vignette montre VOTRE vêtement, pas le témoin. */
.mvig .mtag{position:absolute;top:.25rem;right:.25rem;font-size:.6rem;line-height:1;
  padding:.14rem .3rem;border-radius:5px;background:rgba(201,169,126,.9);color:#1a1208;font-weight:700}
.mvig .mcoche{position:absolute;top:.25rem;left:.25rem;font-size:.7rem;line-height:1;
  width:1.05rem;height:1.05rem;border-radius:50%;background:#c9a97e;color:#1a1208;
  display:flex;align-items:center;justify-content:center;font-weight:700}
.mbarre{display:flex;align-items:center;gap:.5rem;margin-top:.55rem;flex-wrap:wrap}
.ch{margin:.7rem 0 0}
.ch label{display:block;margin-bottom:.25rem;font-size:.76rem;color:#8fa1b8}
select{width:100%;font:inherit;color:#e8edf5;background:#0f1724;border:1px solid #2b3444;
  border-radius:8px;padding:.4rem .5rem}
select:focus{outline:none;border-color:#c9a97e}
.bascule{display:flex;align-items:flex-start;gap:.55rem;font-size:.82rem;cursor:pointer;
  -webkit-user-select:none;user-select:none;margin:.2rem 0 0}
.bascule input{width:1.05rem;height:1.05rem;accent-color:#c9a97e;cursor:pointer;margin-top:.12rem;flex:0 0 auto}
.bascule .d{font-size:.72rem;color:#6d7f96;display:block;margin-top:.08rem}
/* ── RÉGLAGES AVANCÉS ─────────────────────────────────────────────────────
   ⚠ CHAQUE VOIE N ACCEPTE PAS LES MEMES REGLAGES, et le panneau ne montre que
   ce qui s applique : le relais ne pose la finition (fond decrit, ombre,
   relumiere) que sur le FANTOME et le PRODUIT A PLAT — le mannequin virtuel
   compose sa scene autrement. Une glissiere d ombre dessinee sous un mannequin
   virtuel serait un mensonge d ecran : elle serait recue et ignoree en silence. */
.avbar{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.avbar button{flex:1 1 auto}
/* ⚠⚠ UNE SEULE COLONNE, ET C EST LE COEUR DE LA REFONTE DU PANNEAU. Il etait en
   DEUX colonnes serrees a l interieur d une carte deja large d une demi-page :
   des glissieres, des menus et leurs textes d aide a moins de dix caracteres de
   large. Un reglage de plus qui rentre a l ecran n est pas gagne s il rend les
   dix autres illisibles. */
.avgrille{display:flex;flex-direction:column;gap:.7rem;margin-top:.75rem}
.avgrille>*{margin:0}
.avsec{margin:.4rem 0 -.15rem;padding-top:.65rem;
  border-top:1px solid rgba(255,255,255,.08);font:700 .72rem/1.2 system-ui;
  text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.avsec.prem{margin-top:0;padding-top:0;border-top:0}
.aidep{font-size:.71rem;color:#6d7f96;line-height:1.45;margin-top:.22rem}
.aidep.att{color:#d8b57a}
textarea{width:100%;font:inherit;font-size:.82rem;color:#e8edf5;background:#0f1724;
  border:1px solid #2b3444;border-radius:8px;padding:.4rem .5rem;resize:vertical;min-height:3.2rem}
textarea:focus{outline:none;border-color:#c9a97e}
input[type=text]{width:100%;font:inherit;color:#e8edf5;background:#0f1724;
  border:1px solid #2b3444;border-radius:8px;padding:.4rem .5rem}
input[type=text]:focus{outline:none;border-color:#c9a97e}
input[type=range]{width:100%;accent-color:#c9a97e;margin:.3rem 0 0;cursor:pointer}
.avlab{display:flex;align-items:baseline;gap:.4rem}
.avlab b{color:#c9a97e;font-size:.78rem;font-variant-numeric:tabular-nums}
.avint{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:.4rem}
.avint img{width:3.4rem;height:3.4rem;object-fit:contain;background:#0b1220;border-radius:7px;
  border:1px solid rgba(255,255,255,.1)}
/* ⚠ flex:0 1 auto, PAS 1 1 : en poussant, le nom occupait toute la largeur de la
   carte et rejetait le bouton << Choisir un fichier >> a l autre bout de l ecran,
   a plus de mille pixels de son libelle. */
.avint .nm{font-size:.76rem;color:#cbd8e6;min-width:0;flex:0 1 22rem;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Résultat — il occupe tout ce qui reste du volet de droite. */
.res{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:15rem;text-align:center;color:#8fa1b8}
.res img{max-width:100%;max-height:min(58vh,32rem);border-radius:9px;
  border:1px solid rgba(255,255,255,.1)}
.res .filig{margin-top:.5rem;font-size:.74rem;color:#facc15}
.res .avis{margin-top:.4rem;font-size:.74rem;color:#8fa1b8}
.res .dims{font-size:.7rem;color:#6d7f96;margin-top:.2rem}
.res .dl{margin-top:.6rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.55rem;
  padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.42rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
/* ⚠ L APERCU EST GRATUIT, ET C EST LE LEVIER CREDITS : la seule facon de juger
   sans depenser. Un bouton gris a cote d un bouton dore se lit comme le choix
   secondaire — exactement l inverse de ce qu on veut. */
button.gratuit{border-color:rgba(74,222,128,.42);color:#c9ead6}
button.gratuit:hover:not(:disabled){background:rgba(74,222,128,.12)}
button.conf{background:#f0a05a;border-color:#f0a05a;color:#241703;font-weight:700}
.vide{padding:1rem;text-align:center;color:#8fa1b8;font-size:.82rem}
/* ⚠ LA SURCOUCHE DU LANCEMENT DE LOT. Elle manquait — habillage ET fonction :
   ouvrirLotVoile() appelait un voile() qui n'existait nulle part, et le clic
   mourait sur un ReferenceError. Le bouton « Traiter ces N en lot… » n'a donc
   JAMAIS rien fait, par aucun des deux chemins (panier ou sélecteur). */
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.1rem;z-index:60}
.voile .boite{background:#16202f;border:1px solid rgba(255,255,255,.12);
  border-radius:13px;padding:1rem 1.15rem;max-width:29rem;width:100%;
  max-height:88vh;overflow-y:auto;box-shadow:0 18px 46px rgba(0,0,0,.5)}
.voile h3{margin:0 0 .5rem;font:700 1.02rem/1.25 Georgia,serif}
.voile p{margin:.6rem 0 0;font-size:.79rem;line-height:1.55}
.voile input[type=text],.voile input:not([type]){width:100%;font:inherit;color:#e8edf5;
  background:#0f1724;border:1px solid #2b3444;border-radius:8px;padding:.4rem .5rem}
.voile input:focus{outline:none;border-color:#c9a97e}
.rc{display:flex;align-items:flex-start;gap:.55rem;font-size:.8rem;line-height:1.5;
  cursor:pointer;-webkit-user-select:none;user-select:none;margin:.6rem 0 0}
.rc input{width:1.05rem;height:1.05rem;accent-color:#c9a97e;cursor:pointer;
  margin-top:.12rem;flex:0 0 auto}
.fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem}
@media (max-width:900px){
  .corps{flex-direction:column;overflow-y:auto}
  .rail{flex:0 0 auto;overflow:visible;padding-right:0}
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
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Studio virtuel — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🎨</span><h1>Studio virtuel</h1>
  <span class="credits" id="credits"></span></div>
<div class="ro" id="ro" hidden>Lecture seule : votre rôle ne permet pas de lancer de traitement.</div>
<div class="corps plein" id="corps"><div class="carte"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
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
        + 'border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);'
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
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
  var ENREG = false;     // le resultat a-t-il ete enregistre dans la phototheque ?
  // Galerie de modeles : apercus SANDBOX (gratuits) du vetement sur chaque modele,
  // pour choisir AVANT de generer en pleine qualite.
  var MODELE_SEL = 'sophia'; // modele choisi (persiste entre les rendus)
  var APM = {};              // cache : modele -> data URL de l apercu de VOTRE vetement
  var APM_SIG = '';          // empreinte (photo+ambiance) pour invalider le cache
  var COMPARE_STOP = false;  // demande d arret de la generation en cours
  /* PORTRAITS PERSISTANTS : modele -> adresse R2. Fabriques UNE FOIS a partir d un
     vetement temoin pris dans la phototheque, puis relus indefiniment.
     ⚠ C EST TOUT L INTERET : << je ne veux pas payer un nouveau credit a chaque
     fois que je consulte la liste >>. Rien ici ne rappelle Photoroom. */
  var PORTRAITS = {};
  var PORT_OCC = false;      // fabrication des portraits en cours
  var PORT_STOP = false;     // demande d arret

  var VOIES = [
    { cle: 'humain',  em: '👗', t: 'Mannequin virtuel', d: 'Porté par un modèle, décor intégré' },
    { cle: 'fantome', em: '👻', t: 'Fantôme habillé',   d: 'Sans mannequin, décor pro ajouté' },
    { cle: 'plat',    em: '📦', t: 'Produit à plat',    d: 'Détourage + décor + ombre' }
  ];
  // Quelques modèles (mannequin virtuel). Le relais accepte tout nom connu.
  // Les 16 modeles REELS de Photoroom (virtualModel.model.preset.name, verifies
  // dans la doc 2026-08-11). Sophia en tete = choix par defaut. Photoroom ne
  // publie pas l apparence de chaque modele : le bouton << Comparer >> genere un
  // apercu sandbox gratuit du VRAI vetement sur chacun pour choisir a l oeil.
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
  var AV_OUV = false;
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
        + '<span>Glissez une photo studio ici, ou cliquez pour choisir un fichier</span>'
        + '<span class="pt2">Fond blanc, un vêtement — JPEG ou PNG</span></div>';
    }
    h += '<input type="file" id="fichier" accept="image/*" hidden><div class="pbtn">';
    if (!aUnePhoto()) {
      h += '<button id="ph-ouvrir">📚 Depuis la photothèque</button>'
        // ⚠ L EXPLORATEUR EST DANS SA PROPRE FENETRE (#32) : le selecteur
        // ci-contre reste pour prendre UNE photo vite fait, l explorateur sert a
        // en choisir des centaines — il lui faut de la place et un apercu.
        + '<button id="ph-explorateur" title="Parcourir la photothèque en grand, avec aperçu">'
        + '🗂️ Explorateur…</button>';
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
  function sigActuelle(){
    var p = PHOTO_ID || (PHOTO ? (PHOTO.length + ':' + PHOTO.slice(0, 40)) : '');
    return p + '|' + PRESET;
  }
  function portraitsFaits(){
    var n = 0;
    for (var i = 0; i < MODELES.length; i++) { if (PORTRAITS[MODELES[i]]) n++; }
    return n;
  }
  /* Ce qu on montre pour un mannequin, par ordre de preference :
       1. l apercu de VOTRE vetement (le plus utile pour juger) ;
       2. son portrait persistant (le temoin, relu de R2 — gratuit) ;
       3. un carre d attente qui DIT ce qu il manque.
     ⚠ Une seule grille pour les deux : deux listes cote a cote obligeaient a
     choisir un mannequin dans l une en le regardant dans l autre. */
  function vignetteHtml(m){
    var mien = APM[m], port = PORTRAITS[m];
    var vis;
    if (mien)      vis = '<img src="' + mien + '" alt="' + esc(nomModele(m)) + '" loading="lazy">'
                       + '<span class="mtag">votre photo</span>';
    else if (port) vis = '<img src="' + esc(port) + '" alt="' + esc(nomModele(m)) + '" loading="lazy">';
    else           vis = '<span class="matt">portrait<br>à venir</span>';
    return '<div class="mvig' + (MODELE_SEL === m ? ' on' : '') + '" data-mod="' + esc(m) + '"'
      + ' title="' + esc(nomModele(m)) + '">' + vis
      + (MODELE_SEL === m ? '<span class="mcoche">✓</span>' : '')
      + '<span class="mnom">' + esc(nomModele(m)) + '</span></div>';
  }
  function grilleModelesHtml(){
    return '<div class="mgrille" id="mgrille">'
      + MODELES.map(vignetteHtml).join('') + '</div>';
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
  // Redessine UNE vignette sans toucher au reste (on ne casse ni le défilement
  // de la grille, ni le focus, pendant une fabrication qui dure).
  function majVig(m){
    var v = corps.querySelector('[data-mod="' + m + '"]');
    if (!v) return;
    var neuf = document.createElement('div');
    neuf.innerHTML = vignetteHtml(m);
    var rempl = neuf.firstChild;
    if (rempl) { v.parentNode.replaceChild(rempl, v); brancherVignettes(); }
  }
  function brancherVignettes(){
    corps.querySelectorAll('[data-mod]').forEach(function(el){
      el.onclick = function(){ choisirModele(el.getAttribute('data-mod')); };
    });
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

  function avanceCorpsHtml(){
    if (!AV_OUV) return '';
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
        + '<textarea id="av-extra" rows="2" maxlength="200"' + (RO ? ' disabled' : '')
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
        + '<textarea id="av-fond" rows="2" maxlength="500"' + (RO ? ' disabled' : '')
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

      h.push('<div class="avsec">Ombre portée</div>');
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

      h.push('<div class="avsec">Relumière</div>');
      h.push(chSel('av-lum', 'Accorder la lumière du sujet au décor', LUMIERES, AV.lumiere,
        '« Préserver la teinte » garde la <strong>vraie couleur du tissu</strong> : c’est le seul choix sûr '
        + 'quand on vend l’article sur sa couleur. « Automatique » éclaire mieux mais peut la déplacer — '
        + 'un bleu nuit qui ressort bleu roi fait un retour.'));

      if (VOIE === 'fantome') {
        h.push('<div class="avsec">Photo de l’intérieur du vêtement</div>');
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
      }
    }

    h.push('<div class="avsec">Agrandissement</div>');
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
  function avanceHtml(){
    var r = resumeAvance(VOIE);
    return '<section class="etape">'
      + '<div class="eth"><span class="num">4</span><h2>Réglages avancés</h2>'
      + '<span class="etat' + (r ? ' on' : '') + '" id="av-resume">'
      + (r ? esc(r) : 'Facultatif') + '</span></div>'
      + '<p class="sous">L’ambiance suffit dans la plupart des cas. Le panneau ne montre que '
      + 'ce que la voie choisie accepte vraiment.</p>'
      + '<div class="etc"><div class="avbar"><button id="av-bascule">'
      + (AV_OUV ? '▾ Masquer' : '▸ Afficher') + ' les réglages avancés</button></div>'
      + '<div id="av-zone">' + avanceCorpsHtml() + '</div></div></section>';
  }

  // Ne repeint QUE le panneau : un redessin complet perdrait la grille de
  // photos, son défilement et le focus de la saisie en cours.
  function majAvance(){
    var z = document.getElementById('av-zone');
    if (!z) { dessiner(); return; }
    z.innerHTML = avanceCorpsHtml();
    brancherAvance();
    majAvResume();
  }
  function majAvResume(){
    var el = document.getElementById('av-resume');
    if (!el) return;
    var r = resumeAvance(VOIE);
    el.textContent = r || 'Facultatif';
    el.className = 'etat' + (r ? ' on' : '');
  }

  function brancherAvance(){
    var b = document.getElementById('av-bascule');
    if (b) b.onclick = function(){ AV_OUV = !AV_OUV; majAvance();
      var z = document.getElementById('av-bascule');
      if (z) z.textContent = (AV_OUV ? '▾ Masquer' : '▸ Afficher') + ' les réglages avancés'; };
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

  function resultatHtml(){
    if (!RESULT) {
      return '<div class="vide" style="padding:.2rem">L’image apparaîtra ici.</div>' + guideHtml();
    }
    var h = '<img src="' + RESULT.image + '" alt="résultat">';
    if (RESULT.essai) h += '<div class="filig">⚠ Aperçu filigrané (sandbox) — gratuit. « Générer en pleine qualité » retire le filigrane.</div>';
    if (RESULT.decorErreur) h += '<div class="filig">⚠ Le décor n’a pas pu être appliqué : ' + esc(RESULT.decorErreur) + '</div>';
    if (RESULT.ignores) h += '<div class="filig">⚠ Le service a <strong>ignoré</strong> : '
      + esc(ignoresLisible(RESULT.ignores)) + '. Le reste du traitement a bien eu lieu.</div>';
    if (RESULT.upNote) h += '<div class="avis">' + esc(RESULT.upNote) + '</div>';
    if (RESULT.largeur) h += '<div class="dims">' + RESULT.largeur + ' × ' + RESULT.hauteur + ' px</div>';
    h += '<div class="dl"><button id="b-dl">Télécharger l’image</button> '
      + '<button id="b-save"' + (ENREG ? ' disabled' : '') + '>' + (ENREG ? '✓ Dans la photothèque' : '💾 Enregistrer dans la photothèque') + '</button></div>';
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
  // Une etape est FAITE quand elle a recu son choix. La voie l est toujours :
  // il y en a une par defaut, et l ecran ne peut pas ne pas en avoir.
  function etapeFaite(n){
    if (n === 1) return aUnePhoto();
    if (n === 2) return true;
    if (n === 3) return !!PRESET;
    return false;
  }
  function enteteEtape(n, titre, sous, etat){
    var ok = etapeFaite(n);
    return '<div class="eth"><span class="num' + (ok ? ' ok' : '') + '">' + (ok ? '✓' : n)
      + '</span><h2>' + titre + '</h2>'
      + '<span class="etat' + (ok ? ' on' : '') + '">' + esc(etat || '') + '</span></div>'
      + '<p class="sous">' + sous + '</p>';
  }

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
    var r = [];
    r.push('<section class="etape' + (aUnePhoto() ? '' : ' vif') + '">'
      + enteteEtape(1, 'La photo', 'Celle de départ, prise en studio sur fond blanc.',
          aUnePhoto() ? (PHOTO_NOM || 'photo prête') : 'Aucune photo')
      + '<div class="etc">' + photoHtml() + '</div></section>');
    r.push('<section class="etape">'
      + enteteEtape(2, 'La mise en valeur', 'Comment le vêtement est présenté.', nomVoie(VOIE))
      + '<div class="etc"><div class="tuiles">' + voiesHtml() + '</div>'
      + modeleHtml() + '</div></section>');
    r.push('<section class="etape' + (PRESET || !aUnePhoto() ? '' : ' vif') + '">'
      + enteteEtape(3, 'L’ambiance', 'Un clic règle décor, ombre ancrée et lumière.',
          PRESET ? nomPreset(PRESET) : 'À choisir')
      + '<div class="etc">' + ambiancesHtml() + '</div></section>');
    r.push(avanceHtml());
    corps.innerHTML = '<div class="rail">' + r.join('') + '</div>'
      + '<div class="scene">' + recapHtml()
      + '<div class="bloc res" id="res">' + resultatHtml() + '</div></div>';
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
    /* ⚠ La pose change ce que le rendu montre : le cache des apercus par modele
       (APM) porte donc sur une pose donnee. On le vide, sinon la grille
       garderait les silhouettes de l ancienne pose. */
    if (ps) ps.onchange = function(){
      POSE_SEL = ps.value;
      APM = {}; APM_SIG = '';
      dessiner();
      dire('Pose : ' + (POSES.filter(function(p){ return p.cle === POSE_SEL; })[0] || {}).t + '.', 'att');
    };
    var msel = document.getElementById('modele-sel');
    if (msel) msel.onchange = function(){ choisirModele(msel.value); };
    // Anciens boutons de galerie retirés (menu déroulant) ; gardes conservées au
    // cas où un rendu partiel les ramènerait.
    var bm = document.getElementById('b-mgen');
    if (bm) bm.onclick = genererApercusModeles;
    var bp = document.getElementById('b-port');
    if (bp) bp.onclick = fabriquerPortraits;
    var br = document.getElementById('b-port-refaire');
    if (br) br.onclick = refairePortraits;
    brancherVignettes();
    brancherAvance();
    var dl = document.getElementById('b-dl');
    if (dl && RESULT) dl.onclick = telecharger;
    var sv = document.getElementById('b-save');
    if (sv && RESULT) sv.onclick = enregistrerResultat;
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

  /* ══ PORTRAITS PERSISTANTS ═════════════════════════════════════════════════
     Un appel PAR mannequin (seize traitements d image dans un seul appel
     depasseraient le delai du pont), et chaque portrait est depose dans R2 des
     qu il est pret : si la fabrication est interrompue a mi-chemin, ce qui est
     deja fait est deja garde. Rouvrir la fenetre ne refabrique QUE ce qui
     manque — c est ce qui fait qu on ne repaye jamais pour regarder la liste. */
  function fabriquerPortraits(){
    if (PORT_OCC) { PORT_STOP = true; dire('Arrêt demandé…', 'att'); return; }
    if (RO || OCCUPE) return;
    var todo = MODELES.filter(function(m){ return !PORTRAITS[m]; });
    if (!todo.length) { dire('Les portraits sont déjà là.', 'att'); return; }
    PORT_OCC = true; PORT_STOP = false;
    bApercu.disabled = true; bFinal.disabled = true;
    dessiner();
    var i = 0, echecs = 0;
    function fini(msg, cl){
      PORT_OCC = false; bApercu.disabled = RO; bFinal.disabled = RO;
      dessiner(); majBoutons(); dire(msg, cl);
    }
    function suite(){
      if (PORT_STOP) { fini('Arrêté — les portraits déjà faits sont gardés.', 'att'); return; }
      if (i >= todo.length) {
        fini(echecs ? ('Portraits prêts, sauf ' + echecs + '. Recliquez pour reprendre.')
                    : 'Portraits prêts — cliquez celui qui vous plaît.',
             echecs ? 'att' : 'bon');
        return;
      }
      var m = todo[i]; i++;
      dire('Portrait ' + i + '/' + todo.length + ' — ' + nomModele(m) + '…');
      appeler('studio:modeleGenerer', [{ modele: m }]).then(function(r){
        if (r && r.ok && r.vignette) { PORTRAITS[m] = r.vignette; majVig(m); }
        else {
          echecs++;
          /* Un motif qui ne se corrigera pas tout seul arrête la série : enchaîner
             quinze échecs identiques ne dit rien de plus que le premier. */
          if (r && (r.motif === 'phototheque_vide' || r.motif === 'non_configure'
                 || r.motif === 'droit' || r.motif === 'session')) {
            fini(expliquer(r), 'err'); return;
          }
        }
        suite();
      });
    }
    suite();
  }

  function refairePortraits(){
    if (PORT_OCC || RO || OCCUPE) return;
    dire('Retrait des anciens portraits…');
    appeler('studio:modelesVider').then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      PORTRAITS = {};
      dessiner();
      fabriquerPortraits();
    });
  }

  // Génère (ou arrête) les aperçus SANDBOX du vêtement sur chaque modèle. Séquentiel
  // (le pont porte une image à la fois), avec progression et arrêt.
  var COMPARE_OCC = false;
  function genererApercusModeles(){
    if (COMPARE_OCC) { COMPARE_STOP = true; return; }   // 2e clic = Arrêter
    if (RO || OCCUPE || !aUnePhoto()) return;
    if (APM_SIG !== sigActuelle()) { APM = {}; APM_SIG = sigActuelle(); }
    var todo = MODELES.filter(function(m){ return !APM[m]; });
    if (!todo.length) { dire('Tous les aperçus sont déjà générés — cliquez un modèle.', 'att'); return; }
    COMPARE_OCC = true; COMPARE_STOP = false;
    bApercu.disabled = true; bFinal.disabled = true;
    /* ⚠ LE LIBELLÉ NE VIT QU'À UN ENDROIT (modeleHtml). L'écrire aussi ici
       remettait « Générer les aperçus » alors que le bouton s'appelle autrement
       depuis la refonte — un bouton qui se contredit d'un clic à l'autre. */
    var bm = document.getElementById('b-mgen'); if (bm) bm.textContent = 'Arrêter';
    var i = 0;
    function fini(msg, cl){
      COMPARE_OCC = false; bApercu.disabled = RO; bFinal.disabled = RO;
      dessiner(); majBoutons(); dire(msg, cl);
    }
    function suite(){
      if (COMPARE_STOP) { fini('Arrêté.', 'att'); return; }
      if (i >= todo.length) { fini('Aperçus prêts — cliquez le modèle qui vous plaît.', 'bon'); return; }
      var m = todo[i]; i++;
      dire('Aperçu ' + i + '/' + todo.length + ' — ' + nomModele(m) + '…');
      var s = { geste: 'humain', preset: PRESET, apercu: true,
                options: { modele: m, pose: POSE_SEL } };
      if (PHOTO_ID) s.photoId = PHOTO_ID; else s.image = PHOTO;
      appeler('studio:traiter', [s]).then(function(r){
        if (r && r.ok && r.image) { APM[m] = r.image; majVig(m); }
        suite();
      });
    }
    suite();
  }

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
      if (p.lieId) pastilles += '<span class="pt" title="' + esc(p.lieNom || 'Produit lié') + '">🔗</span>';
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
  function reglagesLotHtml(voie, coche){
    if (!estVoie(voie)) {
      return '<p style="color:#d8b57a;margin:.6rem 0 0">⚠ Ce traitement ne passe pas par Photoroom : '
        + 'ni l’ambiance, ni la mise en scène, ni les réglages avancés n’y changent quoi que ce soit. '
        + 'Le détourage se fait au détoureur, et il n’a pas de décor à composer.</p>';
    }
    var r = resumeReglages(voie);
    if (!r) {
      return '<p style="color:#8fa1b8;margin:.6rem 0 0">Aucune ambiance ni mise en scène '
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
      + '<span style="font-size:.74rem;color:#8fa1b8">Décochez pour un traitement brut, '
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
    voile('<h3>⚙ Traiter ' + nP + ' photo' + (nP > 1 ? 's' : '') + ' en lot</h3>'
      + '<div class="ch"><label for="lot-quoi">Traitement à appliquer</label>'
      + '<select id="lot-quoi">' + opts.map(function(t){
          return '<option value="' + esc(t.cle) + '"' + (t.cle === voieDef ? ' selected' : '')
            + '>' + esc(t.nom) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="lot-nom">Nom du lot (pour le retrouver dans le suivi)</label>'
      + '<input id="lot-nom" placeholder="Collection automne — détourage"></div>'
      + '<div id="lot-reg">' + reglagesLotHtml(voiePourQuoi(voieDef)) + '</div>'
      + '<label class="rc"><input type="checkbox" id="lot-prio"> '
      + '<span><strong>Priorité haute</strong> — ce lot passe devant ceux qui attendent.</span></label>'
      + '<label class="rc"><input type="checkbox" id="lot-refaire"> '
      + '<span><strong>Refaire celles déjà traitées.</strong> Par défaut elles sont écartées : '
      + 'les repasser coûte un appel chacune pour un résultat identique.</span></label>'
      + '<p style="color:#8fa1b8">Chaque photo est un appel facturé. Le lot part en arrière-plan : '
      + 'vous pouvez fermer cette fenêtre, le traitement continue et se suit depuis n’importe quel écran.</p>'
      /* ⚠ CE QUE ÇA VA COÛTER, AVANT DE CLIQUER. Le chiffre est demandé au relais
         (« studio:estimer ») et jamais recalculé ici : lui seul sait qu un fantôme
         avec décor est DEUX appels, et que le détourage part chez un autre
         fournisseur, cinquante fois moins cher. */
      + '<div id="lot-estim" style="margin:.6rem 0 0;padding:.5rem .6rem;border:1px solid #2a3a4e;'
      + 'border-radius:6px;background:#16202c;font-size:.8rem;color:#8fa1b8">Estimation du coût…</div>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Lancer le lot</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        var g = function(i){ var e = document.getElementById(i); return e ? e.value : ''; };
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
              h += '<br><span style="color:#8fa1b8">Aucun plafond mensuel n’est posé '
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
          z.innerHTML = reglagesLotHtml(voiePourQuoi(sq.value), avait);
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
            options: c('lot-reglages') ? reglagesPour(voiePourQuoi(g('lot-quoi'))) : {} }]).then(function(r){
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
        var res = document.getElementById('res');
        if (res) {
          res.innerHTML = resultatHtml();
          var dl = document.getElementById('b-dl'); if (dl) dl.onclick = telecharger;
          var sv = document.getElementById('b-save'); if (sv) sv.onclick = enregistrerResultat;
        } else {
          // Le volet de droite n existait pas (plein ecran) : on redessine, sinon
          // l image serait produite, facturee — et jamais montree.
          dessiner();
        }
        dire(apercu ? 'Aperçu prêt (gratuit).' : 'Image générée.', 'bon');
        if (!apercu) chargerCredits();
      } else {
        dire(expliquer(r), 'err');
      }
    });
  }

  // Aperçu : gratuit, part directement.
  bApercu.onclick = function(){ lancer(true); };
  // Pleine qualité : consomme des crédits → armement en deux temps.
  bFinal.onclick = function(){
    if (RO || OCCUPE) return;
    if (!ARME) {
      ARME = true; bFinal.className = 'prim conf'; bFinal.textContent = 'Confirmer (consomme des crédits)';
      dire('Un clic de plus lance un vrai rendu payant.', 'att');
      return;
    }
    ARME = false; bFinal.className = 'prim'; bFinal.textContent = 'Générer en pleine qualité';
    lancer(false);
  };

  function telecharger(){
    if (!RESULT || !RESULT.image) return;
    try {
      var a = document.createElement('a');
      a.href = RESULT.image;
      a.download = 'studio-' + VOIE + '-' + PRESET + '.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      dire('Téléchargement lancé.', 'bon');
    } catch (e) { dire('Téléchargement impossible.', 'err'); }
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
      dire('');
      chargerCredits();
      chargerPortraits();
    });
  }

  /* Les portraits déjà fabriqués : de simples ADRESSES relues de la base. Aucun
     appel à Photoroom, aucun crédit — c'est exactement le but du rangement dans
     R2. Si la lecture échoue, la grille reste utilisable (on peut toujours
     choisir un mannequin par son nom) : on ne bloque pas l'écran pour ça. */
  function chargerPortraits(){
    appeler('studio:modeles').then(function(r){
      if (!r || !r.ok) return;
      PORTRAITS = r.vignettes || {};
      if (VOIE === 'humain') dessiner();
    });
  }

  /* ⚠ IDENTIFIANTS D OUVERTURE DU PANNEAU AVANCÉ. Replié, il ne se déplie qu au
     CLIC — et le banc dessine, il ne clique pas : tout le panneau serait resté
     hors de tout contrôle, comme le lanceur de lot qui n a jamais pu partir
     pendant deux versions. << avance-plein >> ouvre en plus la voie du fantôme
     avec ombre et agrandissement actifs, parce que les glissières d ombre, le
     mode d agrandissement et le bloc de la photo d intérieur ne sont dessinés
     que dans cet état-là. C est l écran qui décide CE QU ON PAIE : il se
     vérifie. */
  if (${avOuvre ? 'true' : 'false'}) AV_OUV = true;
  if (${avPlein ? 'true' : 'false'}) { VOIE = 'fantome'; AV.ombreActive = true; AV.upActive = true; }
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
