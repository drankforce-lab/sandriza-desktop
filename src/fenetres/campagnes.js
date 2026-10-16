'use strict';

/*
 * FENÊTRE « CAMPAGNES ET CHAÎNES » — NATIVE (2.1.0, palier 4)
 * =============================================================================
 * Deux onglets : les CAMPAGNES (un envoi, toute la liste, une fois) et les
 * CHAÎNES (des séquences qui partent toutes seules, selon un déclencheur).
 *
 * ⚠⚠ CE SONT DE VRAIS COURRIELS VERS DE VRAIES PERSONNES, et ils ne se
 * rattrapent pas. Les deux gestes qui envoient — « Envoyer » et « Traiter les
 * étapes échues » — sont armés en deux clics, annoncent d'avance combien de
 * personnes sont concernées, et rendent le verdict RÉEL (partis / échoués).
 *
 * ⚠ TROIS PIÈGES ANNONCÉS DANS LA FENÊTRE, parce qu'ils se paient en courriels :
 *   ① suspendre une chaîne n'arrête pas seulement ses envois — au traitement
 *      suivant, ses inscriptions en cours sont abandonnées pour de bon ;
 *   ② si « Séquences automatisées » est en pause dans les contrôles d'envoi,
 *      traiter ne ferait que brûler les inscriptions : c'est refusé, et dit ;
 *   ③ « en attente » n'est pas « échu » : seules les étapes dont le délai est
 *      écoulé partiront.
 *
 * ⚠ PÉRIMÈTRE PARTIEL, ET LA FENÊTRE LE DIT : la RÉDACTION du contenu (éditeur
 * visuel par blocs), la configuration Resend et l'offre de bienvenue restent à
 * l'écran Infolettre de la fenêtre principale.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, JS_TUILES, CSS_JOUR, ICO, TETE } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('campagnes');

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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.7rem}
/* 2026-10-12 : les LISTES (campagnes, chaines, segments) sont en PAGES mesurees (JS_PAGES du
   socle), jamais de glissiere. LE FORMULAIRE AUSSI (meme jour) : la carte prend toute la hauteur
   du corps, en deux colonnes (les reglages a gauche, ce qui grandit a droite), et ce qui grandit
   — les blocs du courriel, les pastilles des etapes, les criteres d un segment — est en pages.
   Chaque bloc, chaque etape, chaque critere est UN element de page. */
.corps.formulaire>.carte.form{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.carte.form>*{flex:0 0 auto}
.carte.form>[data-pages]{flex:1 1 0;min-height:0}
.fcols{flex:1 1 0!important;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);
  grid-template-rows:minmax(0,1fr);gap:.9rem}
.fcol{min-height:0;display:flex;flex-direction:column;overflow:hidden;position:relative}
.fcol>*{flex:0 0 auto}
.fcol>.champ.corpsm{flex:1 1 0;min-height:0;display:flex;flex-direction:column;margin-bottom:0}
.corpsm>*{flex:0 0 auto}
.corpsm>#f-blocs{flex:1 1 0;min-height:0;display:flex;flex-direction:column}
.corpsm>#f-html{flex:1 1 0;min-height:6rem}
#f-blocs>*{flex:0 0 auto}
#f-blocs>[data-pages]{flex:1 1 0;min-height:0}
.fcol>#f-etapes{flex:1 1 0;min-height:0;display:flex;flex-direction:column}
#f-etapes>*{flex:0 0 auto}
/* Les pastilles des etapes : deux rangees au plus, le reste en pages. */
.etapes-choix[data-pages]{max-height:4.6rem}
#f-etapes>.sz-pages{margin:-.3rem 0 .5rem}
/* Dans une colonne, deux champs cote a cote ne debordent jamais (un long segment ne pousse rien). */
.fcol .rang{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
/* L apercu se pose PAR-DESSUS la colonne de droite (il ne pousse plus rien hors de vue). */
.fcol>.apercu{position:absolute;inset:0;z-index:5;margin:0;display:flex;flex-direction:column}
.fcol>.apercu .chrome{display:flex;align-items:center;gap:.5rem}
.fcol>.apercu .chrome button{margin-left:auto}
.fcol>.apercu iframe{flex:1 1 auto;height:auto;min-height:0}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,button,textarea,select{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
button{cursor:pointer}
input:focus,button:focus,select:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
button.arme{border-color:#fbbf24;background:rgba(251,191,36,.16);color:#fde68a}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.6875rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:var(--tx-ok)}.tuile .val.neutre{color:var(--tx2)}
.tuile .val.att{color:var(--tx-att)}.tuile .val.mal{color:var(--tx-err)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.95rem 1.1rem}
.carte + .carte{margin-top:.5rem}
.chaine .entete{display:flex;align-items:flex-start;gap:.6rem;flex-wrap:wrap}
.chaine .entete h3{margin:0;font:700 .9rem/1.3 Georgia,serif}
.chaine .entete .gestes{margin-left:auto;display:flex;gap:.4rem;flex-wrap:wrap}
.chaine .desc{font-size:.76rem;color:var(--tx2);margin-top:.1rem}
.chaine .compte{font-size:.74rem;color:var(--tx2);margin:.45rem 0 .35rem}
.etapes{display:flex;flex-wrap:wrap;gap:.35rem}
.etape{background:var(--v04);border:1px solid var(--v10);
  border-radius:8px;padding:.28rem .5rem;font-size:.72rem;max-width:15rem}
.etape .no{color:var(--tx-or);font-weight:700}
.etape .suj{color:var(--tx-gris2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
table{width:100%;border-collapse:collapse;font-size:.85rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.3rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v04)}
.fin{white-space:nowrap;text-align:right}
.num{text-align:right;white-space:nowrap}
.dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.6875rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.pill.att{background:rgba(251,191,36,.16);color:var(--tx-att)}
.pill.acc{background:rgba(var(--or-rgb),.16);color:#dcc39b}
.avis{border-radius:9px;padding:.42rem .65rem;font-size:.78rem;line-height:1.55}
.avis.att{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.32);color:#fde68a}
.avis.mal{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.34);color:var(--tx-err2)}
.note{font-size:.73rem;color:var(--tx2);line-height:1.6;border-top:1px solid var(--v07);
  padding-top:.5rem;margin-top:.2rem}
.vide{padding:1.4rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
/* ── Formulaires de creation / modification (campagne et chaine) ─────────── */
.form .rang{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}
.form .champ{display:flex;flex-direction:column;gap:.18rem;margin-bottom:.55rem}
.form .champ .lbl{font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.form .champ .aide{font-size:.71rem;color:var(--tx2);line-height:1.5}
.form input,.form select,.form textarea{width:100%}
.form textarea{resize:vertical;font-family:Consolas,"Courier New",monospace;font-size:.78rem;
  line-height:1.55;min-height:9rem}
.form textarea.sms{font-family:inherit;font-size:.83rem;min-height:4.5rem}
/* Etape 3 du plan de lisibilite (2026-10-11) : le corps d une etape de chaine tenait en trois
   lignes sous 100 px vides ; on lui donne la place (mesure a 1400 x 833, sans barre). */
.form textarea[id^="e-b-"]{min-height:9rem}
.form .duo{display:flex;gap:.4rem;align-items:center}
.form .duo input{width:5rem}
.form .duo span{font-size:.76rem;color:var(--tx2)}
.form .fin3{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.7rem;
  border-top:1px solid var(--v08);padding-top:.6rem}
.form .fin3 .gauche{margin-right:auto}
/* ══ L EDITEUR PAR BLOCS (3.53.0) ══════════════════════════════════════════
   Il etait le DERNIER trou declare PARTIEL dans la couverture, donc le dernier
   obstacle au retrait du web. Une carte par bloc, dans l ordre du courriel : on
   deplace, on retire, on ajoute — et l on ne voit jamais une balise. */
.bqbar{display:flex;gap:.3rem;flex-wrap:wrap;margin:.35rem 0 .5rem}
.bqbar button{font-size:.72rem;padding:.2rem .45rem;border-radius:7px}
.bloc{border:1px solid var(--v12);border-radius:9px;background:var(--v03);
  padding:.5rem .6rem;margin-bottom:.4rem}
.bloc .bt{display:flex;align-items:center;gap:.4rem;margin-bottom:.35rem}
.bloc .bt .bi{font-size:.82rem;opacity:.85;width:1.3rem;text-align:center}
.bloc .bt b{font:700 .78rem/1.2 system-ui;flex:1 1 auto;min-width:0}
.bloc .bt button{font-size:.7rem;padding:.1rem .35rem;border-radius:6px}
.bloc .bg{display:grid;grid-template-columns:1fr;gap:.3rem}
.bloc .bg .duo2{display:grid;grid-template-columns:1fr 1fr;gap:.3rem}
.bloc label{font-size:.7rem;color:var(--tx2);display:block;margin-bottom:.1rem}
.bloc input,.bloc select,.bloc textarea{width:100%;font-size:.8rem;padding:.24rem .4rem}
.bloc textarea{min-height:3.4rem;font-family:inherit}
.bloc input[type=color]{padding:.1rem;height:1.7rem}
.bvide{padding:1rem;text-align:center;color:var(--tx2);font-size:.8rem;
  border:1.5px dashed var(--v16);border-radius:9px}
/* ══ L ECRITURE PUBLICITAIRE IA (#115) ═════════════════════════════════════
   Le panneau est AU-DESSUS des blocs, pas a cote : ce qu il produit tombe
   juste en dessous, et l ordre de lecture dit l ordre des gestes.
   ⚠ AUCUNE OPACITE SUR UN TEXTE ICI. C est la lecon du 2026-09-14 : un
   << color:var(--tx3) + opacity:.75 >> compose une couleur qu aucune ligne
   n ecrit, et le juge de contrastes l a refusee a 4.20 sur 4.5. On prend
   --tx2, qui est mesure. */
.iabloc{border:1px solid var(--v16);border-radius:9px;background:var(--v05);
  padding:.55rem .65rem;margin:.35rem 0 .5rem}
.iabloc .iatt{display:flex;align-items:center;gap:.4rem;margin-bottom:.45rem}
.iabloc .iatt .ic{font-size:.85rem}
.iabloc .iatt b{font:700 .8rem/1.2 system-ui;flex:1 1 auto;min-width:0}
.iabloc .iatt button{font-size:.72rem;padding:.2rem .5rem;border-radius:7px}
.iabloc .iag{display:grid;grid-template-columns:repeat(auto-fit,minmax(8.5rem,1fr));
  gap:.35rem;margin-bottom:.35rem}
.iabloc .iaplein{grid-column:1/-1}
.iabloc label{font-size:.7rem;color:var(--tx2);display:block;margin-bottom:.1rem}
.iabloc input,.iabloc select,.iabloc textarea{width:100%;font-size:.8rem;padding:.26rem .4rem}
.iabloc textarea{font-family:inherit;min-height:2.6rem}
.iabloc .iapied{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
.iabloc .iapied select{width:auto;font-size:.74rem}
.iabloc .iapied .aide{color:var(--tx2);font-size:.72rem;margin-left:auto}
.iabloc .iaavis{font-size:.76rem;color:var(--tx2);padding:.3rem 0}
.apercu{border:1px solid var(--v14);border-radius:9px;overflow:hidden;
  margin-top:.4rem;background:#fff}
.apercu .chrome{background:var(--f-0f1826);color:var(--tx2);font-size:.7rem;padding:.24rem .55rem;
  border-bottom:1px solid var(--v12)}
.apercu iframe{display:block;width:100%;height:20rem;border:none;background:#fff}
.etapef{border:1px solid var(--v12);border-radius:9px;padding:.55rem .65rem;
  margin-bottom:.5rem;background:var(--v025)}
.etapef .tete2{display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem}
.etapef .tete2 strong{font-size:.8rem}
.etapef .tete2 .gestes{margin-left:auto;display:flex;gap:.3rem}
.vars{font-size:.71rem;color:var(--tx2);line-height:1.7;margin-top:.25rem}
.vars code{background:var(--v07);border:1px solid var(--v12);
  border-radius:4px;padding:.02rem .28rem;color:#dcc39b}
/* ── Criteres d un segment : une ligne = champ, operateur, valeur ────────── */
.critere{display:flex;gap:.4rem;align-items:center;margin-bottom:.4rem;flex-wrap:wrap}
.critere select,.critere input{width:auto;min-width:8rem}
.critere select:first-child{min-width:14rem}
.critere input[type=number]{min-width:6rem;width:6rem}
.critere .u{font-size:.76rem;color:var(--tx2)}
.critere button{margin-left:auto}
.portee{margin-top:.6rem;padding:.45rem .65rem;border-radius:9px;font-size:.82rem;
  background:rgba(var(--or-rgb),.1);border:1px solid rgba(var(--or-rgb),.3);color:var(--tx-creme);
  display:flex;align-items:center;gap:.5rem}
.portee strong{font-size:.95rem;color:var(--tx-f0e2c8)}
.portee button{margin-left:auto}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}

/* Refonte fine (2026-09-26) : la barre d onglets commune — l actif prend l or
   du socle (.onglets .actif) ; ce qui suit les onglets reste a droite. */
.onglets{display:flex;gap:.25rem;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--v08);padding:0 0 .5rem}
.onglets > button{background:transparent;border:1px solid transparent;color:var(--tx2);padding:.38rem .7rem;
  font:inherit;font-weight:600;font-size:.82rem;cursor:pointer}
.onglets > button:hover{background:var(--v05);color:var(--tx)}
.onglets .droite{margin-left:auto}

/* ══ L EDITEUR DE CAMPAGNE, REFAIT (2026-10-15, sa demande : « plus clair et plus beau, il nous faut
   quelque chose qui respire ») — maquette approuvee « oui c est parfait ». Trois colonnes : les BLOCS
   a gauche (une ligne chacun), l APERCU REEL au centre (on clique un bloc pour le choisir), les
   REGLAGES du bloc a droite. Une bande pour l objet, les destinataires et le canal ; l IA dans un
   panneau qu on ouvre. Tout en variables du socle : chaque jeu de couleurs, jour comme nuit. */
.corps.formulaire.ed-corps{padding:0;gap:0}
.ed{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;position:relative;padding-bottom:.9rem}
.ed-tete{flex:0 0 auto;display:flex;align-items:center;gap:.9rem;padding:1rem 1.6rem .8rem}
.ed-tete .retour{background:none;border:none;color:var(--tx2);font-size:.84rem;padding:.2rem 0}
.ed-tete .retour:hover:not(:disabled){background:none;color:var(--tx)}
/* ⚠ Pas d opacite sur un texte (meme un « / ») : le juge des contrastes la mesure composee, et l a
   refusee a 2.65 (2026-10-15). --tx2 tel quel est mesure. */
.ed-tete .sep{color:var(--tx2)}
.ed-tete .nom{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.7rem}
.ed-tete .nom input{flex:1 1 auto;min-width:8rem;max-width:34rem;background:transparent;border:1px solid transparent;
  font-size:1.3rem;font-weight:650;padding:.2rem .4rem;border-radius:9px}
.ed-tete .nom input:hover,.ed-tete .nom input:focus{border-color:var(--sz-bord-fort);background:var(--f-champ)}
.ed-bande{flex:0 0 auto;margin:0 1.6rem;padding:.75rem 1.1rem;border-radius:14px;background:var(--f-carte);
  border:1px solid var(--sz-bord);display:grid;grid-template-columns:minmax(0,1fr) minmax(12rem,17rem) minmax(9rem,12rem);
  gap:1.4rem;align-items:center}
.ed-bande label{display:flex;align-items:center;gap:.8rem;min-width:0;font-size:.76rem;color:var(--tx2)}
.ed-bande label>span{flex:0 0 auto}
.ed-bande input{flex:1 1 auto;min-width:0;border:none;border-bottom:1px solid var(--sz-bord-fort);border-radius:0;
  background:transparent;font-size:.95rem;padding:.35rem .1rem}
.ed-bande select{flex:1 1 auto;min-width:0;height:2.2rem;border-radius:9px;background:var(--f-champ)}
/* La bande du code promo (2026-10-15). */
.ed-offre{flex:0 0 auto;margin:.6rem 1.6rem 0;padding:.55rem 1.1rem;border-radius:12px;background:var(--f-carte);
  border:1px solid var(--sz-bord);display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;font-size:.8rem}
.ed-offre .lbl{font-size:.76rem;color:var(--tx2)}
.ed-offre>span:not(.lbl){display:inline-flex;align-items:center;gap:.5rem}
.ed-offre [hidden]{display:none!important}
.ed-offre select{height:2rem;border-radius:8px;background:var(--f-champ)}
.ed-offre input[type=number]{width:4.6rem;height:2rem;border-radius:8px;background:var(--f-champ)}
.ed-offre #f-offre-coupon{min-width:18rem}
/* Les statistiques d une campagne (2026-10-15). */
.st-tete{padding:0 0 .2rem}
.st-tuiles{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.7rem}
.st-t{display:flex;flex-direction:column;gap:.15rem;padding:.8rem 1rem;border-radius:14px;background:var(--f-carte);border:1px solid var(--sz-bord)}
.st-t span{font-size:.74rem;color:var(--tx2)}
.st-t b{font-size:1.5rem;font-weight:750;line-height:1.2}
.st-t small{font-size:.74rem;color:var(--tx2)}
.st-t.bon b{color:var(--tx-ok)}.st-t.att b{color:var(--tx-att)}.st-t.mal b{color:var(--tx-err)}
.st-cols{flex:1 1 0;min-height:0;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:1rem}
.st-carte{min-height:0;overflow:hidden;padding:1rem 1.1rem;border-radius:16px;background:var(--f-carte);border:1px solid var(--sz-bord);display:flex;flex-direction:column;gap:.7rem}
.st-lien{display:flex;flex-direction:column;gap:.25rem}
.st-lien-t{display:flex;align-items:baseline;gap:.8rem;font-size:.82rem}
.st-lien-t span{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st-lien small{font-size:.72rem;color:var(--tx2)}
.st-barre{height:.4rem;border-radius:99px;background:var(--f-champ);overflow:hidden}
.st-barre i{display:block;height:100%;border-radius:99px;background:var(--sz-accent)}
.st-jours{flex:0 0 9rem;display:flex;align-items:flex-end;gap:.3rem}
.st-j{flex:1 1 0;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:.2rem}
.st-j i{display:block;width:100%;max-width:1.6rem;border-radius:5px 5px 0 0;background:var(--sz-accent)}
.st-j small{font-size:.66rem;color:var(--tx2)}
.st-aud{margin-top:.4rem}
.st-audience{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}
.st-audience .st-t b{font-size:1.2rem}
.ed-sous{flex:0 0 auto;margin:.35rem 1.6rem 0;font-size:.74rem;color:var(--tx2);min-height:1em}
.ed-sms{flex:0 0 auto;margin:.5rem 1.6rem 0;padding:.6rem 1.1rem;border-radius:12px;background:var(--f-carte);
  border:1px solid var(--sz-bord);display:flex;gap:1rem;align-items:flex-start}
.ed-sms textarea{flex:1 1 auto;min-height:3.2rem;resize:none;font-family:inherit;font-size:.86rem}
.ed-sms .aide{flex:0 0 15rem;font-size:.72rem;color:var(--tx2);line-height:1.55}
.ed-cols{flex:1 1 0;min-height:0;display:grid;grid-template-columns:16rem minmax(0,1fr) 20rem;gap:1.2rem;
  padding:1rem 1.6rem 0}
.ed-col{min-height:0;display:flex;flex-direction:column;gap:.6rem;overflow:hidden;position:relative}
.ed-col>*{flex:0 0 auto}
.ed-titre{display:flex;align-items:baseline;justify-content:space-between;font-size:.72rem;font-weight:650;
  letter-spacing:.08em;text-transform:uppercase;color:var(--tx2)}
#f-blocs{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:.45rem;position:relative}
#f-blocs>*{flex:0 0 auto}
#f-blocs>[data-pages]{flex:1 1 0;min-height:0}
.brang{width:100%;height:3.35rem;display:flex;align-items:center;gap:.7rem;padding:0 .7rem;border-radius:12px;
  background:transparent;border:1px solid transparent;text-align:left;margin-bottom:.3rem}
.brang:hover:not(:disabled){background:var(--f-carte)}
.brang.on{background:var(--f-carte);border-color:rgba(var(--or-rgb),.6)}
.brang .bico{width:1.8rem;height:1.8rem;border-radius:8px;background:var(--f-pill);color:var(--tx-or);display:flex;
  align-items:center;justify-content:center;font-size:.78rem;font-weight:700;flex:0 0 auto}
.brang .btx{display:flex;flex-direction:column;min-width:0}
.brang .btx b{font-size:.84rem;font-weight:600}
.brang .btx span{font-size:.76rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ed-ajout{height:2.75rem;border-radius:12px;border:1px dashed var(--sz-bord-fort);background:transparent;
  color:var(--tx-or);font-weight:600}
.ed-modele{margin-top:auto;padding-top:.7rem;border-top:1px solid var(--sz-bord);display:flex;flex-direction:column;gap:.4rem}
.ed-modele span{font-size:.74rem;color:var(--tx2)}
.ed-modele .duo{display:flex;gap:.4rem}
.ed-modele select{flex:1 1 auto;min-width:0;height:2.2rem;border-radius:9px;background:var(--f-carte)}
.ed-scene{flex:1 1 0;min-height:0;border-radius:16px;background:var(--f-champ);border:1px solid var(--sz-bord);
  display:flex;justify-content:center;padding:1.2rem 1rem 0;overflow:hidden}
.ed-scene iframe{width:100%;max-width:40rem;height:100%;border:none;border-radius:10px 10px 0 0;background:#fff;
  box-shadow:0 18px 44px rgba(0,0,0,.35)}
.ed-scene textarea{width:100%;height:100%;resize:none;font-family:Consolas,"Courier New",monospace;font-size:.8rem;line-height:1.55}
.ed-note{font-size:.74rem;color:var(--tx2);padding:.5rem 0 .7rem}
.ed-insp{flex:1 1 0;min-height:0;padding:1.1rem;border-radius:16px;background:var(--f-carte);border:1px solid var(--sz-bord);
  display:flex;flex-direction:column;gap:1rem;overflow:hidden}
.ed-insp>*{flex:0 0 auto}
.ed-insp .it{display:flex;align-items:center;gap:.6rem}
.ed-insp .it .bico{width:1.9rem;height:1.9rem;border-radius:9px;background:var(--sz-accent-doux);color:var(--tx-or);
  display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700}
.ed-insp .it b{font-size:1rem;font-weight:650}
.ed-insp .it .gestes{margin-left:auto;display:flex;gap:.35rem}
.ed-insp .it .gestes button{width:2rem;height:2rem;padding:0;border-radius:8px;background:transparent}
.ed-insp .champs{flex:1 1 0;min-height:0}
.ed-insp .ch{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.85rem}
.ed-insp .ch>label,.ed-insp .ch>.lbl{font-size:.74rem;color:var(--tx2)}
.ed-insp input,.ed-insp select,.ed-insp textarea{width:100%;background:var(--f-champ);border-radius:10px;padding:.45rem .65rem}
.ed-insp textarea{min-height:6rem;resize:none;font-family:inherit;line-height:1.55}
/* (2026-10-15, sa capture : une zone de 3 lignes a glissiere au-dessus d un grand vide) Le champ qui porte une
   zone de texte PREND LA HAUTEUR LIBRE des reglages ; la zone s etire encore a la main (resize). */
.ed-insp .champs{display:flex;flex-direction:column}
.ed-insp .champs>.ch:has(textarea){flex:1 1 auto;display:flex;flex-direction:column;min-height:9rem}
.ed-insp .champs>.ch:has(textarea) textarea{flex:1 1 auto;min-height:8rem;resize:vertical}
body.insp-large .ed-cols{grid-template-columns:16rem minmax(0,1fr) 32rem}
body.insp-large .ed-insp .it .gestes button[data-binsplarge]{border-color:rgba(var(--or-rgb),.6);color:var(--tx-or)}
.ed-insp .pastilles{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.ed-insp .pastilles button{width:1.8rem;height:1.8rem;padding:0;border-radius:50%;border:2px solid var(--sz-bord-fort)}
.ed-insp .pastilles button.on{border-color:var(--tx)}
.ed-insp .pastilles input[type=color]{width:2.4rem;height:1.8rem;padding:.1rem;border-radius:8px}
.ed-infos{display:flex;flex-wrap:wrap;gap:.35rem}
.ed-infos button{height:1.75rem;padding:0 .65rem;border-radius:999px;background:var(--f-champ);font-size:.76rem;color:var(--tx-gris2)}
.ed-retirer{margin-top:auto;height:2.4rem;border-radius:10px;border-color:rgba(239,68,68,.45);background:transparent;
  color:var(--tx-err);font-weight:600}
.ed-vide{flex:1 1 auto;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--tx2);
  font-size:.84rem;line-height:1.6;padding:1rem}
/* Le menu « Ajouter un bloc » : trois familles, chaque type dit a quoi il sert. */
.ed-menu{position:absolute;left:0;bottom:3.3rem;z-index:8;padding:.95rem;border-radius:16px;
  background:var(--f-carte2);border:1px solid var(--sz-bord-fort);box-shadow:0 22px 56px rgba(0,0,0,.5);
  display:flex;flex-direction:column;gap:.55rem;width:30rem}
.ed-menu .ed-titre{margin-top:.15rem}
.ed-menu .grille{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem}
.ed-menu .grille button{display:flex;align-items:center;gap:.6rem;padding:.5rem .6rem;border-radius:11px;
  background:var(--f-champ);text-align:left}
.ed-menu .grille .bico{width:1.8rem;height:1.8rem;border-radius:8px;background:var(--sz-accent-doux);color:var(--tx-or);
  display:flex;align-items:center;justify-content:center;font-size:.76rem;font-weight:700;flex:0 0 auto}
.ed-menu .grille b{display:block;font-size:.82rem;font-weight:600}
.ed-menu .grille small{display:block;font-size:.72rem;color:var(--tx2)}
/* Le panneau de l IA : par-dessus la colonne des reglages, seulement quand on l ouvre. */
.ed-ia{position:absolute;top:0;right:0;bottom:0;width:24rem;z-index:9;background:var(--f-carte);
  border-left:1px solid var(--sz-bord-fort);box-shadow:-20px 0 50px rgba(0,0,0,.4);padding:1.3rem;
  display:none;flex-direction:column;gap:.9rem}
.ed.ia-ouverte .ed-ia{display:flex}
/* (2026-10-15, sa capture : le « × » et les champs du panneau rognés au bord droit, non reproduit ici a
   1000 x 570 ni 1440 x 900) Garde : le panneau ne depasse jamais l editeur, ni ses champs le panneau. */
.ed-ia{max-width:100%}
.ed-ia>*{max-width:100%;min-width:0}
.ed-ia input,.ed-ia select,.ed-ia textarea,.ed-ia button{max-width:100%}
.ed-ia .iabloc{border:none;background:transparent;padding:0;margin:0;display:flex;flex-direction:column;gap:.7rem}
.ed-ia .iatt b{font-size:1.02rem}
.ed-ia input,.ed-ia select,.ed-ia textarea{background:var(--f-champ);border-radius:10px;padding:.45rem .65rem;font-size:.86rem}
.ed-ia .iapied{flex-direction:column;align-items:stretch}
.ed-ia .iapied select{width:100%}
.ed-ia .iapied .aide{margin-left:0}
.ed-ia #f-ia-go{height:2.6rem;font-size:.92rem}
.ed-ia label{font-size:.8rem;color:var(--tx2);margin-bottom:.3rem}
.ed-ia #f-ia-but{min-height:6.5rem;resize:none;line-height:1.55}
.ed-ia .iaavis{font-size:.84rem;line-height:1.6}
.ed-ia .ed-ia-x{position:absolute;top:.9rem;right:.9rem;width:2rem;height:2rem;padding:0;border-radius:8px;background:transparent}
.ed-ia .iatt{padding-right:2.6rem}
.ed-col.gauche{overflow:visible}
/* L editeur de chaine (meme langage) : la bande a trois champs, la ligne du temps, les reglages de l etape. */
.ed-bande-ch{grid-template-columns:minmax(12rem,17rem) minmax(0,1fr) minmax(9rem,12rem)}
.ed-liste{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:.45rem}
.ed-liste>*{flex:0 0 auto}
.ed-liste>[data-pages]{flex:1 1 0;min-height:0}
.ed-insp .duo{display:flex;gap:.5rem;align-items:center}
.ed-insp .duo input[type=number]{width:5rem;flex:0 0 auto}
.ed-insp .duo select{flex:1 1 auto;min-width:0}
.ed-insp .duo span{font-size:.8rem;color:var(--tx2)}
.ed-insp>.ch{margin-bottom:0}
.ed-insp .ed-infos button{height:1.6rem;padding:0 .55rem;font-size:.74rem}
.ed-insp .corps-et{flex:1 1 0;min-height:0;display:flex;flex-direction:column}
/* Le constructeur de segment : les criteres (phrases) a gauche, la portee en grand a droite. */
.seg-cols{grid-template-columns:minmax(0,1fr) 22rem}
.seg-crit{flex:1 1 0;min-height:0}
.seg-crit .critere{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;padding:.75rem .9rem;margin-bottom:.55rem;
  border-radius:12px;background:var(--f-carte);border:1px solid var(--sz-bord)}
.seg-crit .critere .lien{flex:0 0 2.2rem;font-size:.8rem;font-weight:700;color:var(--tx-or)}
.seg-crit .critere select,.seg-crit .critere input{height:2.3rem;border-radius:9px;background:var(--f-champ)}
.seg-crit .critere button{margin-left:auto;width:2rem;height:2rem;padding:0;border-radius:8px}
.seg-portee .lbl{font-size:.78rem;color:var(--tx2)}
.seg-portee .gros{display:flex;flex-direction:column;gap:.2rem}
.seg-portee .gros strong{font-size:3rem;line-height:1;font-weight:750;color:var(--tx)}
.seg-portee .gros span{font-size:.84rem;color:var(--tx2)}
.seg-portee .barre{height:.55rem;border-radius:99px;background:var(--f-champ);overflow:hidden}
.seg-portee .barre i{display:block;height:100%;border-radius:99px;background:var(--sz-accent);transition:width .3s}
.seg-portee .aide{font-size:.8rem;line-height:1.55;color:var(--tx2);margin:0}
.seg-portee #f-compter{margin-top:auto;height:2.4rem;border-radius:10px}
.ed-insp .corps-et textarea{flex:1 1 auto;min-height:7rem;font-family:Consolas,"Courier New",monospace;font-size:.8rem}
.etapes-choix{display:flex;gap:.35rem;flex-wrap:wrap;margin:0 0 .6rem}
.etapes-choix button{font:inherit;font-size:.78rem;font-weight:600;padding:.32rem .75rem;border-radius:99px;
  border:1px solid var(--v12);background:var(--v05);color:var(--tx2);cursor:pointer}
.etapes-choix button.on{background:var(--or);border-color:var(--or);color:#17202c}
`;

/** Page complète de la fenêtre native « Campagnes et chaînes ». */
function pageCampagnes(ongletDepart) {
  /* ⚠ IDENTIFIANTS D OUVERTURE << campagnes:neuve >> et << chaines:neuve >> :
     le banc ne clique pas. Sans eux, les DEUX ecrans qui ECRIVENT — les seuls
     ajouts de ce lot — seraient invisibles au controle. Angle mort de #32. */
  const brut = String(ongletDepart || '');
  const neuf = brut.indexOf(':neuve') > 0;
  const base = neuf ? brut.slice(0, brut.indexOf(':neuve')) : brut;
  const dep = (base === 'chaines') ? 'chaines'
            : (base === 'segments') ? 'segments' : 'campagnes';
  return `${TETE()}
<title>${T("Campagnes et chaînes — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.newsletter}</span><h1>${T("Campagnes et chaînes")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_BROUILLON()}${JS_TUILES('campagnes')}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var ONGLET = ${JSON.stringify(dep)};   // campagnes | chaines
  var FORM_DEPART = ${neuf ? 'true' : 'false'};
  var DC = null;             // donnees des campagnes
  var DH = null;             // donnees des chaines
  var DS = null;             // donnees des segments
  var CRITERES = null;       // criteres en cours d edition (segment seulement)
  var Q = '';
  var ARME = '';             // un seul geste arme a la fois
  var OCCUPE = false;        // un envoi est en cours : on ne redessine pas
  // { type:'campagne'|'chaine', id:'' , d:{...} } — formulaire ouvert, ou null
  var FORM = null;

  /* ══ L EDITEUR PAR BLOCS (3.53.0) ══════════════════════════════════════════
     Sa demande : << porte l editeur en natif >>. C etait le dernier trou declare
     PARTIEL dans la couverture, donc le dernier obstacle au retrait du web.

     ⚠⚠ LA MISE EN PAGE DU COURRIEL N EST PAS ICI, ET NE DOIT JAMAIS Y ETRE.
     Cette fenetre edite des BLOCS — un titre, un texte, un bouton — et rien de
     plus. C est _b2hOne (newsletter.js, cote site) qui decide qu un titre pese
     28 px et qu un bouton a 14 px de fond. Recopier ces regles ici, ce serait
     ecrire la mise en page du courriel DEUX fois, dans DEUX depots : au premier
     ajustement de marge, l apercu cesserait de correspondre a ce que la cliente
     recoit, et personne ne le verrait avant l envoi. On envoie donc les blocs et
     l on recoit du HTML — la lecon du filigrane, appliquee.
     ⚠ LE CATALOGUE VIENT AUSSI DU SITE (nl:blocsCatalogue) : les valeurs de
     depart d un bloc neuf y sont deja ecrites. Les redeclarer ici ferait deux
     verites de plus. */
  var BMODE = 'visuel';   // visuel | html
  var BLOCS = [];         // [{type, ...champs}]
  var BTYPES = [];        // catalogue venu du site : [{cle,label,icone,defaut}]
  var BMODELES = {};      // jeux de blocs de depart, par modele — venus du site aussi

  function typeDe(cle){
    for (var i = 0; i < BTYPES.length; i++) { if (BTYPES[i].cle === cle) return BTYPES[i]; }
    return { cle: cle, label: cle, icone: '?', defaut: { type: cle } };
  }

  /* Les champs de chaque type. ⚠ ILS SONT DECRITS, PAS DESSINES UN PAR UN : une
     liste de champs par type tient dans dix lignes, alors que neuf rendus
     separes en feraient deux cents — et l on en oublierait un a chaque ajout. */
  var BCHAMPS = {
    heading:      [['text', '${T("Titre")}', 'texte'], ['size', '${T("Taille")}', '${T("choix:h1=Grand,h2=Moyen")}'],
                   ['align', '${T("Alignement")}', '${T("choix:left=Gauche,center=Centre,right=Droite")}'],
                   ['color', '${T("Couleur")}', 'couleur']],
    text:         [['content', '${T("Texte")}', 'long'],
                   ['align', '${T("Alignement")}', '${T("choix:left=Gauche,center=Centre,right=Droite")}']],
    button:       [['text', '${T("Libellé")}', 'texte'], ['url', '${T("Lien")}', 'texte'],
                   ['bgColor', '${T("Fond")}', 'couleur'], ['textColor', '${T("Texte")}', 'couleur'],
                   ['align', '${T("Alignement")}', '${T("choix:left=Gauche,center=Centre,right=Droite")}']],
    divider:      [],
    spacer:       [['height', '${T("Hauteur (px)")}', 'nombre']],
    codeBox:      [['label', '${T("Intitulé")}', 'texte'], ['code', '${T("Code")}', 'texte'],
                   ['note', '${T("Note")}', 'texte']],
    discountHero: [['subtitle', '${T("Sur-titre")}', 'texte'], ['percent', '${T("Pourcentage")}', 'texte'],
                   ['label2', '${T("Sous-titre")}', 'texte']],
    highlightBox: [['title', '${T("Titre")}', 'texte'], ['desc', '${T("Description")}', 'texte'],
                   ['code', '${T("Code (facultatif)")}', 'texte'], ['icon', '${T("Pictogramme")}', 'texte']],
    rawHtml:      [['content', 'HTML', 'long']],
    // 2026-10-06 : l'image d'ambiance et les pièces du catalogue (photo, nom, prix lus par le site).
    image:        [['url', '${T("Adresse de l’image (https)")}', 'texte'], ['lien', '${T("Lien")}', 'texte'],
                   ['alt', '${T("Description de l’image")}', 'texte']],
    produits:     [['titre', '${T("Titre (facultatif)")}', 'texte'], ['refs', '${T("Pièces")}', 'produits'],
                   ['colonnes', '${T("Colonnes")}', '${T("choix:2=Deux,3=Trois")}']]
  };
  var BPRODUITS = [];     // les pieces du catalogue, pour le bloc produits — venues du site

  function champBloc(i, cle, lib, genre, val){
    var id = 'b-' + i + '-' + cle;
    var v = (val === undefined || val === null) ? '' : String(val);
    if (genre === 'long') {
      return '<div><label for="' + id + '">' + esc(lib) + '</label>'
        + '<textarea id="' + id + '" data-bi="' + i + '" data-bc="' + cle + '">' + esc(v) + '</textarea></div>';
    }
    if (genre === 'couleur') {
      return '<div><label for="' + id + '">' + esc(lib) + '</label>'
        + '<input type="color" id="' + id + '" data-bi="' + i + '" data-bc="' + cle + '" value="'
        + esc(/^#[0-9a-f]{6}$/i.test(v) ? v : '#111111') + '"></div>';
    }
    if (genre === 'nombre') {
      return '<div><label for="' + id + '">' + esc(lib) + '</label>'
        + '<input type="number" min="4" max="200" id="' + id + '" data-bi="' + i + '" data-bc="' + cle
        + '" value="' + esc(v || '24') + '"></div>';
    }
    if (genre === 'produits') {
      // Choix multiple (Ctrl + clic) : la valeur gardee est la liste des references.
      var pris = v.split(/[,;\\s]+/).filter(Boolean);
      return '<div><label for="' + id + '">' + esc(lib) + ' <span style="opacity:.7">${T("(Ctrl + clic pour en choisir plusieurs)")}</span></label>'
        + '<select multiple size="6" id="' + id + '" data-bi="' + i + '" data-bc="' + cle + '">'
        + BPRODUITS.map(function(p){
            return '<option value="' + esc(p.ref) + '"' + (pris.indexOf(p.ref) >= 0 ? ' selected' : '') + '>'
              + esc(p.nom) + ' — ' + esc(szArgent(Number(p.prix) || 0)) + '</option>';
          }).join('') + '</select></div>';
    }
    if (genre.indexOf('choix:') === 0) {
      var opts = genre.slice(6).split(',').map(function(o){
        var q = o.split('='), sel = (v === q[0]) ? ' selected' : '';
        return '<option value="' + esc(q[0]) + '"' + sel + '>' + esc(q[1]) + '</option>';
      }).join('');
      return '<div><label for="' + id + '">' + esc(lib) + '</label>'
        + '<select id="' + id + '" data-bi="' + i + '" data-bc="' + cle + '">' + opts + '</select></div>';
    }
    return '<div><label for="' + id + '">' + esc(lib) + '</label>'
      + '<input id="' + id + '" data-bi="' + i + '" data-bc="' + cle + '" value="' + esc(v) + '"></div>';
  }

  /* ══ L EDITEUR REFAIT (2026-10-15) — LA LISTE, LE MENU, LES REGLAGES ════════════════════════════
     A gauche une LIGNE par bloc (son nom et un extrait de ce qu il dit) ; un seul bouton « + Ajouter
     un bloc » ouvre un menu en trois familles ; a droite les reglages du SEUL bloc choisi. Avant, onze
     boutons en vrac et un bloc par page : on ne voyait jamais le courriel en entier. */
  var BSEL = -1;        // le bloc choisi : ses reglages a droite, son cadre dans l apercu
  var MENU = false;     // le menu « Ajouter un bloc » est ouvert
  var DERNIER = null;   // le dernier champ de texte touche : « Inserer une information » y ecrit
  var IAOUVERTE = false;
  var BGROUPES = [
    ['${T("Contenu")}', ['heading', 'text', 'button', 'image']],
    ['${T("Ventes")}', ['produits', 'discountHero', 'codeBox']],
    ['${T("Mise en page")}', ['divider', 'spacer', 'highlightBox', 'rawHtml']]
  ];
  var BDESC = { heading: '${T("Une grande phrase d’accroche")}', text: '${T("Un paragraphe")}',
    button: '${T("Un lien vers la boutique")}', image: '${T("Une photo pleine largeur")}',
    produits: '${T("Photos, noms et prix du catalogue")}', discountHero: '${T("Le rabais, en gros")}',
    codeBox: '${T("Un code promo à copier")}', divider: '${T("Une ligne de séparation")}',
    spacer: '${T("De l’air entre deux blocs")}', highlightBox: '${T("Un encadré qui attire l’œil")}',
    rawHtml: '${T("Votre propre HTML")}' };
  // Les couleurs proposees d un clic ; « Autre » garde le choix libre.
  var PALETTE = ['#111111', '#2a2622', '#5f7150', '#9a6b4f', '#7a2e3a', '#c49a6c', '#ffffff'];
  // Les variables, par leur NOM lisible : ce qui part dans le courriel reste la variable.
  var VAR_NOMS = [['{{firstName}}', '${T("Prénom")}'], ['{{promoCode}}', '${T("Code promo")}'],
    ['{{discountPercent}}', '${T("Rabais %")}'], ['{{expiryDate}}', '${T("Date de fin")}'],
    ['{{shopUrl}}', '${T("Lien boutique")}'], ['{{collectionName}}', '${T("Collection")}']];

  function extraitBloc(b){
    if (b.type === 'produits') {
      var n = String(b.refs || '').split(/[,;\\s]+/).filter(Boolean).length;
      return n + ' ' + szPl(n, '${T("pièce")}', '${T("pièces")}');
    }
    if (b.type === 'spacer') return (b.height || 24) + ' px';
    if (b.type === 'divider') return '—';
    var v = b.text || b.content || b.title || b.code || b.label || b.percent || b.titre || b.url || '';
    v = String(v).replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();
    // Les variables se lisent par leur nom (« Prénom »), comme dans les reglages.
    VAR_NOMS.forEach(function(x){ v = v.split(x[0]).join(x[1]); });
    return v || '—';
  }

  function blocsHtml(){
    var h = '<div class="ed-titre"><span>${T("Blocs du courriel")}</span><span>' + BLOCS.length + '</span></div>';
    if (!BLOCS.length) {
      h += '<div class="bvide">${T("Aucun bloc pour l’instant. Ajoutez-en un, partez d’un modèle ou demandez à l’IA.")}</div>';
    } else {
      // En PAGES mesurees (JS_PAGES du socle) : une ligne = un element de page, jamais de glissiere.
      h += '<div data-pages="campagnes-blocs">' + BLOCS.map(function(b, i){
        var t = typeDe(b.type);
        return '<button type="button" class="brang' + (i === BSEL ? ' on' : '') + '" data-bchoix="' + i + '">'
          + '<span class="bico ic">' + esc(t.icone) + '</span>'
          + '<span class="btx"><b>' + esc(szTd(t.label)) + '</b><span>' + esc(extraitBloc(b)) + '</span></span></button>';
      }).join('') + '</div>';
    }
    h += '<button type="button" class="ed-ajout" id="f-ajout" aria-expanded="' + (MENU ? 'true' : 'false') + '">${T("+ Ajouter un bloc")}</button>';
    if (MENU) h += menuHtml();
    return h;
  }

  function menuHtml(){
    var vus = {};
    var famille = function(nom, cles){
      var types = cles.filter(function(k){ vus[k] = true; return BTYPES.some(function(t){ return t.cle === k; }); });
      if (!types.length) return '';
      return '<div class="ed-titre">' + nom + '</div><div class="grille">' + types.map(function(k){
        var t = typeDe(k);
        return '<button type="button" data-bajout="' + esc(k) + '"><span class="bico ic">' + esc(t.icone) + '</span>'
          + '<span><b>' + esc(szTd(t.label)) + '</b><small>' + esc(BDESC[k] || '') + '</small></span></button>';
      }).join('') + '</div>';
    };
    var h = BGROUPES.map(function(g){ return famille(g[0], g[1]); }).join('');
    // Un type ajoute plus tard au catalogue du site parait ici sans attendre qu on le classe.
    var autres = BTYPES.filter(function(t){ return !vus[t.cle]; }).map(function(t){ return t.cle; });
    if (autres.length) h += famille('${T("Autres")}', autres);
    return '<div class="ed-menu" role="menu">' + h + '</div>';
  }

  function champInsp(i, cle, lib, genre, val){
    var v = (val === undefined || val === null) ? '' : String(val);
    if (genre.indexOf('choix:') === 0) {
      return '<div class="ch"><span class="lbl">' + esc(lib) + '</span><div class="ed-seg plein">'
        + genre.slice(6).split(',').map(function(o){
            var q = o.split('=');
            return '<button type="button" class="' + (v === q[0] ? 'on' : '') + '" data-bseg="' + i + '" data-bc="' + cle
              + '" data-bv="' + esc(q[0]) + '">' + esc(q[1]) + '</button>';
          }).join('') + '</div></div>';
    }
    if (genre === 'couleur') {
      var cour = /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : '#111111';
      return '<div class="ch"><span class="lbl">' + esc(lib) + '</span><div class="pastilles">'
        + PALETTE.map(function(p){
            return '<button type="button" class="' + (cour === p ? 'on' : '') + '" data-bcoul="' + i + '" data-bc="' + cle
              + '" data-bv="' + p + '" style="background:' + p + '" aria-label="' + p + '" title="' + p + '"></button>';
          }).join('')
        + '<input type="color" data-bi="' + i + '" data-bc="' + cle + '" value="' + esc(cour)
        + '" aria-label="${T("Autre couleur")}" title="${T("Autre couleur")}"></div></div>';
    }
    return champBloc(i, cle, lib, genre, val).replace(/^<div>/, '<div class="ch">');
  }

  // Le panneau des reglages elargi (2026-10-15) : retenu sur le poste, applique avant le premier dessin.
  try { if (localStorage.getItem('sz_camp_insp_large')) document.body.classList.add('insp-large'); } catch (e) {}

  function inspHtml(){
    if (BMODE !== 'visuel') return '<div class="ed-vide">${T("Mode HTML : le corps se modifie directement au centre.")}</div>';
    var b = BLOCS[BSEL];
    if (!b) {
      return '<div class="ed-vide">' + (BLOCS.length
        ? '${T("Choisissez un bloc à gauche, ou cliquez-le dans l’aperçu, pour le modifier.")}'
        : '${T("Le courriel est vide. Ajoutez un bloc, partez d’un modèle ou demandez à l’IA de le rédiger.")}') + '</div>';
    }
    var t = typeDe(b.type), i = BSEL;
    var defs = BCHAMPS[b.type] || [];
    var champs = defs.map(function(c){ return champInsp(i, c[0], c[1], c[2], b[c[0]]); }).join('');
    var texte = defs.some(function(c){ return c[2] === 'texte' || c[2] === 'long'; });
    return '<div class="it"><span class="bico ic">' + esc(t.icone) + '</span><b>' + esc(szTd(t.label)) + '</b><span class="gestes">'
      + '<button type="button" data-bhaut="' + i + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="${T("Monter")}" title="${T("Monter")}">↑</button>'
      + '<button type="button" data-bbas="' + i + '"' + (i === BLOCS.length - 1 ? ' disabled' : '') + ' aria-label="${T("Descendre")}" title="${T("Descendre")}">↓</button>'
      + '<button type="button" data-bdup="' + i + '" aria-label="${T("Dupliquer")}" title="${T("Dupliquer")}"><span class="ic">⧉</span></button>'
      // (2026-10-15, sa demande : « cette section devrait pouvoir s agrandir ») Le panneau s elargit, et le poste s en souvient.
      + '<button type="button" data-binsplarge aria-pressed="' + (document.body.classList.contains('insp-large') ? 'true' : 'false') + '"'
      + ' aria-label="${T("Élargir les réglages")}" title="${T("Élargir les réglages")}"><span class="ic">⤢</span></button></span></div>'
      + '<div class="champs" data-pages="campagnes-reglages">'
      + (champs || '<div class="ed-vide">${T("Ce bloc n’a rien à régler.")}</div>') + '</div>'
      + (texte ? '<div class="ch"><span class="lbl">${T("Insérer une information")}</span><div class="ed-infos">'
          + VAR_NOMS.map(function(x){ return '<button type="button" data-bvar="' + esc(x[0]) + '" title="' + esc(x[0]) + '">' + esc(x[1]) + '</button>'; }).join('')
          + '</div></div>' : '')
      + '<button type="button" class="ed-retirer" data-bsupp="' + i + '">${T("Retirer ce bloc")}</button>';
  }

  // Ne repeint QUE la zone des blocs : un redessin du formulaire perdrait le
  // sujet, le segment et le SMS deja saisis.
  // << voir >> : le rang du bloc a montrer (ajoute, deplace) — sa page est ouverte.
  function majBlocs(voir){
    var z = document.getElementById('f-blocs');
    if (!z) return;
    z.innerHTML = blocsHtml();
    brancherBlocs();
    if (typeof voir === 'number') montrerNouveau(z.querySelectorAll('.brang')[Math.min(voir, BLOCS.length - 1)]);
  }
  function majInsp(){
    var z = document.getElementById('f-insp');
    if (!z) return;
    z.innerHTML = inspHtml();
    brancherInsp();
  }
  function choisir(i, depuisApercu){
    BSEL = i; MENU = false;
    majBlocs(i); majInsp(); marquerApercu(!depuisApercu);
  }
  function apresChangement(voir){
    majBlocs(typeof voir === 'number' ? voir : BSEL);
    majInsp();
    apercuPlusTard();
  }

  /* ══ L APERCU VIVANT (2026-10-15) ═══════════════════════════════════════════════════════════════
     Le courriel tel qu il partira, au centre, mis a jour pendant qu on ecrit. On demande au site ses
     blocs EN HTML (nl:blocsHtml, la seule mise en page) puis son enveloppe (nl:apercu) — rien n est
     recopie ici. Pour savoir quel bloc on clique dans l apercu, un REPERE (commentaire HTML) precede
     chaque bloc : il n existe QUE dans l apercu, jamais dans ce qui s enregistre.
     ⚠ Bac a sable SANS script (allow-same-origin seulement) : le courriel ne peut rien executer ; on
     lit ses noeuds de l exterieur pour les cadrer, et un clic n ouvre jamais un lien. */
  var APTIMER = null, APVERSION = 0, APGROUPES = [];
  function apercuPlusTard(){ clearTimeout(APTIMER); APTIMER = setTimeout(apercuVivant, 450); }
  function apercuVivant(){
    var fr = document.getElementById('f-vivant');
    if (!fr || BMODE !== 'visuel') return;
    var v = ++APVERSION;
    var marques = [];
    BLOCS.forEach(function(b, i){ marques.push({ type: 'rawHtml', content: '<!--szb:' + i + '-->' }); marques.push(b); });
    appeler('nl:blocsHtml', [marques]).then(function(r){
      if (v !== APVERSION) return null;
      return appeler('nl:apercu', [(r && r.ok) ? (r.html || '') : '']);
    }).then(function(r2){
      if (v !== APVERSION || !r2 || !r2.ok) return;
      var y = 0;
      try { y = fr.contentWindow ? (fr.contentWindow.scrollY || 0) : 0; } catch (e) {}
      fr.onload = function(){ instrumenter(fr, y); };
      fr.setAttribute('srcdoc', r2.html);
    });
  }
  function instrumenter(fr, y){
    var doc = null;
    try { doc = fr.contentDocument; } catch (e) { doc = null; }
    APGROUPES = [];
    if (!doc || !doc.body) return;
    try { fr.contentWindow.scrollTo(0, y || 0); } catch (e) {}
    var w = doc.createTreeWalker(doc.body, 128), n, reps = [];
    while ((n = w.nextNode())) {
      var m = /^szb:(\\d+)$/.exec(n.nodeValue || '');
      if (m) reps.push({ i: Number(m[1]), n: n });
    }
    reps.forEach(function(rp){
      var els = [], s = rp.n.nextSibling;
      while (s && !(s.nodeType === 8 && /^szb:/.test(s.nodeValue || ''))) { if (s.nodeType === 1) els.push(s); s = s.nextSibling; }
      APGROUPES[rp.i] = els;
      els.forEach(function(el){ el.style.cursor = 'pointer'; });
    });
    doc.addEventListener('click', function(e){
      e.preventDefault();
      for (var i = 0; i < APGROUPES.length; i++) {
        var g = APGROUPES[i] || [];
        for (var k = 0; k < g.length; k++) { if (g[k] === e.target || g[k].contains(e.target)) { choisir(i, true); return; } }
      }
    }, true);
    marquerApercu(false);
  }
  function marquerApercu(defiler){
    APGROUPES.forEach(function(g, i){
      (g || []).forEach(function(el){
        el.style.outline = (i === BSEL) ? '2px solid #5f7150' : '';
        el.style.outlineOffset = (i === BSEL) ? '6px' : '';
      });
    });
    var cible = APGROUPES[BSEL] && APGROUPES[BSEL][0];
    if (defiler && cible) { try { cible.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }
  }

  /* ⚠ L ELEMENT AJOUTE (OU DEPLACE) DOIT SE VOIR : le socle revient a la page 1
     quand le nombre change, et un deplacement peut l envoyer sur la page
     voisine. On pagine tout de suite, puis on avance page par page (borne)
     jusqu a ce qu il paraisse. */
  function montrerNouveau(el){
    if (!el || typeof szPagesAjuster !== 'function') return;
    var c = el.closest('[data-pages]'); if (!c) return;
    var it = el; while (it.parentNode && it.parentNode !== c && it.parentNode.tagName !== 'TBODY') it = it.parentNode;
    try { szPagesAjuster(c); } catch (e) { return; }
    if (it.style.display !== 'none') return;
    // Un deplacement vers le haut peut le mettre sur une page PRECEDENTE : on repart de la premiere.
    var bouton = function(sens){
      var p = c.nextElementSibling;
      var b = (p && p.classList.contains('sz-pages')) ? p.querySelector('[data-szpg="' + sens + '"]') : null;
      return (b && !b.disabled) ? b : null;
    };
    var b0;
    for (var m = 0; m < 200 && (b0 = bouton('-1')); m++) b0.click();
    for (var n = 0; n < 200 && it.style.display === 'none'; n++) {
      var b1 = bouton('1');
      if (!b1) break;
      b1.click();
    }
  }

  /* ══ L ECRITURE PUBLICITAIRE IA (#115, 2026-09-14) ═════════════════════════
     Sa demande : << il faut vraiment que cet outil soit avec un mode simple et
     un mode avance >>, et << je dois etre en mesure d apporter des modifications
     ou des deplacements dans les contenus generes >>.

     ⚠⚠ LES DEUX MODES NE SONT PAS DEUX OUTILS. Le mode simple ne cache pas des
     reglages : il en POSE. Ton chaleureux, francais, longueur moyenne, produits
     et promotions du site — ce sont les memes valeurs que le mode avance montre,
     avec les memes commandes derriere. Faire deux chemins separes, ce serait
     deux comportements a tenir d accord, et le simple finirait par ne plus faire
     ce que l avance annonce.
     ⚠⚠ ET L IA NE REMPLACE PAS L EDITEUR : elle le REMPLIT. Ce qui revient, ce
     sont des BLOCS — ils tombent dans les cartes ci-dessous avec leurs fleches,
     leur croix et leurs champs. Tout est modifiable et deplacable a la minute ou
     ca arrive. C est pour cela que le coeur rend des blocs et non du HTML.
     ⚠ LE CHOIX << remplacer / ajouter a la suite >> EXISTE PARCE QU UN CLIC NE
     DOIT PAS EFFACER UNE HEURE DE TRAVAIL. Sans lui, rediger sur une campagne
     deja ecrite la jetterait sans rien demander. */
  var IAMODE = 'simple';     // simple | avance
  var IAETAT = null;         // { clePosee, budget:{plafond,depense}, modeles }
  var IAOCC = false;         // un appel est en cours

  function iaSousBudget(){
    if (!IAETAT || !IAETAT.budget) return '';
    var p = Number(IAETAT.budget.plafond || 0), d = Number(IAETAT.budget.depense || 0);
    if (!p) return szArgent(d) + ' ${T(" ce mois-ci (aucun plafond)")}';
    return szArgent(d) + ' ${T(" sur ")}' + szArgent(p) + ' ${T(" ce mois-ci")}';
  }

  function iaChoix(id, lib, opts, val){
    var o = opts.map(function(q){
      return '<option value="' + esc(q[0]) + '"' + (q[0] === val ? ' selected' : '') + '>' + esc(q[1]) + '</option>';
    }).join('');
    return '<div><label for="' + id + '">' + esc(lib) + '</label>'
      + '<select id="' + id + '">' + o + '</select></div>';
  }

  /* ⚠ LE CONTENANT RESTE, SEUL LE CONTENU SE REPEINT. Cette fonction ne rend
     que l INTERIEUR de la carte : le <div id="f-ia"> est pose une fois par le
     formulaire. La premiere ecriture remplacait le noeud entier
     (<< parentNode.replaceChild >>) et le banc l a refusee — a raison : un noeud
     qu on remplace peut ne plus avoir de parent, et c est exactement le patron
     que << majBlocs >> evite depuis toujours en repeignant << innerHTML >>. */
  function iaPanneauHtml(){
    /* ⚠ L ETAT EST DEMANDE AVANT LE CLIC, pas apres. Sans cle posee, on le dit
       ici et l on renvoie a l ecran ou elle se pose — plutot que de laisser
       ecrire une demande, attendre, et apprendre ensuite qu il n y a pas de cle. */
    var pret = !!(IAETAT && IAETAT.clePosee);
    var h = '<div class="iatt"><span class="ic">✶</span><b>${T("Écrire avec l’IA")}</b>'
      + '<button class="mini' + (IAMODE === 'simple' ? ' on' : '') + '" id="f-ia-simple">${T("Simple")}</button>'
      + '<button class="mini' + (IAMODE === 'avance' ? ' on' : '') + '" id="f-ia-avance">${T("Avancé")}</button>'
      + '</div>';
    if (IAETAT && !pret) {
      return h + '<div class="iaavis">${T("Aucune clé d’écriture IA n’est enregistrée. Elle se pose dans Configuration ▸ Clés API.")}</div>';
    }
    h += '<div class="iag"><div class="iaplein"><label for="f-ia-but">${T("Que faut-il annoncer ?")}</label>'
      + '<textarea id="f-ia-but" rows="4" placeholder="${T("ex. l’arrivée de la collection d’automne, avec 15 % sur les manteaux")}"></textarea></div></div>';
    if (IAMODE === 'avance') {
      h += '<div class="iag">'
        + iaChoix('f-ia-ton', '${T("Ton")}', [['chaleureux', '${T("Chaleureux")}'], ['elegant', '${T("Élégant")}'],
            ['enjoue', '${T("Enjoué")}'], ['urgent', '${T("Pressant")}']], 'chaleureux')
        + iaChoix('f-ia-langue', '${T("Langue")}', [['fr', '${T("Français")}'], ['en', '${T("Anglais")}']], 'fr')
        + iaChoix('f-ia-long', '${T("Longueur")}', [['court', '${T("Courte")}'], ['moyen', '${T("Moyenne")}'],
            ['long', '${T("Longue")}']], 'moyen')
        + iaChoix('f-ia-src', '${T("Contenu du site")}', [['tout', '${T("Produits et promotions")}'],
            ['produits', '${T("Produits seulement")}'], ['rien', '${T("Ne rien joindre")}']], 'tout')
        + '</div>'
        + '<div class="iag"><div class="iaplein"><label for="f-ia-plus">${T("Consignes supplémentaires")}</label>'
        + '<textarea id="f-ia-plus" rows="2" placeholder="${T("ex. ne pas parler de livraison gratuite ; mentionner la boutique de Québec")}"></textarea></div></div>';
    }
    h += '<div class="iapied">'
      + '<select id="f-ia-quoi" aria-label="${T("Où placer le texte rédigé")}">'
      + '<option value="remplacer">${T("Remplacer le corps")}</option>'
      + '<option value="suite">${T("Ajouter à la suite")}</option></select>'
      + '<button class="mini prim" id="f-ia-go"' + (IAOCC ? ' disabled' : '') + '>'
      + (IAOCC ? '${T("Rédaction…")}' : '${T("Rédiger")}') + '</button>'
      + '<span class="aide" id="f-ia-etat">' + esc(iaSousBudget()) + '</span>'
      + '</div>';
    return h;
  }

  /* Ne repeint QUE le panneau : un redessin du formulaire perdrait le sujet et
     le segment deja saisis.
     ⚠ ET LA DEMANDE DEJA ECRITE EST GARDEE A LA MAIN. Passer de << Simple >> a
     << Avancé >> repeint le champ : sans cette mise de cote, la phrase qu on
     vient de taper disparaitrait au moment precis ou l on cherche a la preciser. */
  function majIa(){
    var z = document.getElementById('f-ia');
    if (!z) return;
    var but = document.getElementById('f-ia-but');
    var garde = but ? but.value : '';
    z.innerHTML = iaPanneauHtml();
    var b2 = document.getElementById('f-ia-but');
    if (b2 && garde) b2.value = garde;
    brancherIa();
  }

  function iaDemander(){
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    var but = v('f-ia-but').trim();
    if (!but) { dire('${T("Dites d’abord ce qu’il faut annoncer.")}', 'att'); return; }
    var src = v('f-ia-src') || 'tout';
    var d = { but: but,
      ton: v('f-ia-ton') || 'chaleureux',
      langue: v('f-ia-langue') || 'fr',
      longueur: v('f-ia-long') || 'moyen',
      produits: src !== 'rien',
      promotions: src === 'tout',
      consignesLibres: v('f-ia-plus') || '' };
    var suite = (v('f-ia-quoi') === 'suite');
    IAOCC = true; majIa();
    dire('${T("Rédaction en cours — cela prend une dizaine de secondes.")}');
    appeler('nl:iaRediger', [d]).then(function(r){
      IAOCC = false;
      if (!r || !r.ok) { majIa(); dire(iaExpliquer(r), 'err'); return; }
      if (r.budget) { IAETAT = IAETAT || {}; IAETAT.budget = r.budget; IAETAT.clePosee = true; }
      var prem = suite ? BLOCS.length : 0;   // le premier bloc redige : sa page est ouverte
      BLOCS = suite ? BLOCS.concat(r.blocs) : r.blocs.slice();
      BSEL = BLOCS.length ? prem : -1;
      /* Le panneau se referme : ce qu on veut voir maintenant, c est le courriel redige. */
      IAOUVERTE = false;
      var edx = document.getElementById('f-ed');
      if (edx) edx.classList.remove('ia-ouverte');
      /* ⚠ LE MODE VISUEL EST RETABLI : les blocs venus d ici ne se voient pas en
         mode HTML, et l on croirait que rien n est arrive. */
      if (BMODE !== 'visuel') { BMODE = 'visuel'; dessiner(); }
      else { majIa(); apresChangement(prem); }
      // Le sujet n est pose que s il est VIDE : il a pu etre ecrit a la main, et
      // l IA n a pas a l ecraser.
      var su = document.getElementById('f-suj');
      if (su && !su.value.trim() && r.sujet) su.value = r.sujet;
      var mot = '${T("Rédigé : ")}' + r.blocs.length + ' ' + szPl(r.blocs.length, '${T("bloc")}', '${T("blocs")}')
        + (r.jetes ? (' ${T(" — ")}' + r.jetes + ' ' + szPl(r.jetes, '${T("écarté, hors catalogue")}', '${T("écartés, hors catalogue")}')) : '')
        + (r.cout ? (' ${T(" · ")}' + szArgent(r.cout)) : '');
      dire(mot, 'bon');
    });
  }

  /* ⚠ LES MOTIFS DE LA PASSERELLE SE LISENT ICI, ET CHACUN DIT QUOI FAIRE. Un
     << Erreur inattendue >> sur un plafond atteint enverrait chercher la panne
     dans le reseau alors qu il suffit de relever un chiffre. */
  function iaExpliquer(r){
    var m = (r && (r.motif || r.error)) || '';
    if (m === 'budget') return r.error || '${T("Le plafond mensuel d’écriture IA est atteint. Il se règle dans Configuration ▸ Clés API.")}';
    if (m === 'sans_but') return '${T("Dites d’abord ce qu’il faut annoncer.")}';
    if (m === 'aucun_bloc') return '${T("Le modèle n’a rien produit d’utilisable. Reformulez la demande.")}';
    if (m === 'json_illisible') return '${T("La réponse du modèle n’a pas pu être lue. Réessayez.")}';
    if (m === 'lecture_seule') return '${T("Vous n’avez pas le droit de modifier les campagnes.")}';
    if (m === 'injoignable') return '${T("La passerelle d’écriture IA est injoignable.")}';
    return (r && r.error) || '${T("La rédaction a échoué.")}';
  }

  function brancherIa(){
    var b;
    b = document.getElementById('f-ia-simple');
    if (b) b.onclick = function(){ IAMODE = 'simple'; majIa(); };
    b = document.getElementById('f-ia-avance');
    if (b) b.onclick = function(){ IAMODE = 'avance'; majIa(); };
    b = document.getElementById('f-ia-go');
    if (b) b.onclick = iaDemander;
  }

  // L etat de l ecriture IA, demande une fois par ouverture du formulaire.
  function iaCharger(){
    appeler('nl:iaEtat', []).then(function(r){
      IAETAT = (r && r.ok) ? r : { clePosee: false, budget: {} };
      majIa();
    });
  }

  /* ⚠ ON DEMANDE LE HTML AU SITE, on ne le fabrique pas. */
  function blocsVersHtml(apres){
    appeler('nl:blocsHtml', [BLOCS]).then(function(r){
      apres((r && r.ok) ? (r.html || '') : '');
    });
  }

  // La liste de gauche : choisir un bloc, ouvrir le menu, ajouter un bloc depuis le menu.
  function brancherBlocs(){
    var z = document.getElementById('f-blocs');
    if (!z) return;
    z.querySelectorAll('[data-bchoix]').forEach(function(el){
      el.onclick = function(){ choisir(Number(el.getAttribute('data-bchoix')), false); };
    });
    var aj = document.getElementById('f-ajout');
    if (aj) aj.onclick = function(e){ e.stopPropagation(); MENU = !MENU; majBlocs(); };
    z.querySelectorAll('[data-bajout]').forEach(function(el){
      el.onclick = function(e){
        e.stopPropagation();
        var t = typeDe(el.getAttribute('data-bajout'));
        // Le bloc neuf se pose SOUS le bloc choisi (a la fin si aucun) et devient le bloc choisi.
        var ou = (BSEL >= 0 && BSEL < BLOCS.length) ? BSEL + 1 : BLOCS.length;
        BLOCS.splice(ou, 0, JSON.parse(JSON.stringify(t.defaut || { type: t.cle })));
        BSEL = ou; MENU = false;
        apresChangement(ou);
      };
    });
  }

  /* Les reglages de droite. ⚠ UNE SAISIE NE REDESSINE JAMAIS LE CHAMP : le curseur repartirait au
     debut a chaque lettre. On note la valeur dans le bloc, on rafraichit l extrait de la ligne de
     gauche et, un instant plus tard, l apercu. */
  function brancherInsp(){
    var z = document.getElementById('f-insp');
    if (!z) return;
    var bouger = function(att, pas){
      z.querySelectorAll('[' + att + ']').forEach(function(el){
        el.onclick = function(){
          var i = Number(el.getAttribute(att)), j = i + pas;
          if (j < 0 || j >= BLOCS.length) return;
          var t = BLOCS[i]; BLOCS[i] = BLOCS[j]; BLOCS[j] = t;
          BSEL = j;
          apresChangement(j);
        };
      });
    };
    bouger('data-bhaut', -1);
    bouger('data-bbas', 1);
    z.querySelectorAll('[data-binsplarge]').forEach(function(el){
      el.onclick = function(){
        var on = !document.body.classList.contains('insp-large');
        document.body.classList.toggle('insp-large', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
        try { localStorage.setItem('sz_camp_insp_large', on ? '1' : ''); } catch (e) {}
      };
    });
    z.querySelectorAll('[data-bdup]').forEach(function(el){
      el.onclick = function(){
        var i = Number(el.getAttribute('data-bdup'));
        BLOCS.splice(i + 1, 0, JSON.parse(JSON.stringify(BLOCS[i])));
        BSEL = i + 1;
        apresChangement(i + 1);
      };
    });
    z.querySelectorAll('[data-bsupp]').forEach(function(el){
      // Le bloc qui prend la place du retire devient le bloc choisi : on reste ou l on etait.
      el.onclick = function(){
        var k = Number(el.getAttribute('data-bsupp'));
        BLOCS.splice(k, 1);
        BSEL = Math.min(k, BLOCS.length - 1);
        apresChangement(BSEL);
      };
    });
    var poserValeur = function(i, c, val){
      if (!BLOCS[i]) return;
      BLOCS[i][c] = val;
      majInsp();
      majBlocs(i);
      apercuPlusTard();
    };
    z.querySelectorAll('[data-bseg]').forEach(function(el){
      el.onclick = function(){ poserValeur(Number(el.getAttribute('data-bseg')), el.getAttribute('data-bc'), el.getAttribute('data-bv')); };
    });
    z.querySelectorAll('[data-bcoul]').forEach(function(el){
      el.onclick = function(){ poserValeur(Number(el.getAttribute('data-bcoul')), el.getAttribute('data-bc'), el.getAttribute('data-bv')); };
    });
    z.querySelectorAll('[data-bi]').forEach(function(el){
      var i = Number(el.getAttribute('data-bi')), c = el.getAttribute('data-bc');
      var poser = function(){
        if (!BLOCS[i]) return;
        BLOCS[i][c] = (el.type === 'number') ? (Number(el.value) || 24)
          : el.multiple ? Array.prototype.filter.call(el.options, function(o){ return o.selected; }).map(function(o){ return o.value; }).join(',')
          : el.value;
        var ligne = document.querySelector('[data-bchoix="' + i + '"] .btx span');
        if (ligne) ligne.textContent = extraitBloc(BLOCS[i]);
        apercuPlusTard();
      };
      el.oninput = poser;
      el.onchange = poser;
      if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type !== 'color' && el.type !== 'number')) {
        el.addEventListener('focus', function(){ DERNIER = el; });
      }
    });
    // « Inserer une information » : la variable entre la ou se trouve le curseur du dernier champ touche.
    z.querySelectorAll('[data-bvar]').forEach(function(el){
      el.onmousedown = function(e){ e.preventDefault(); };   // le champ garde son curseur
      el.onclick = function(){
        var cible = (DERNIER && document.body.contains(DERNIER)) ? DERNIER : z.querySelector('input[data-bi]:not([type=color]), textarea[data-bi]');
        if (!cible) return;
        var x = el.getAttribute('data-bvar');
        var d0 = (typeof cible.selectionStart === 'number') ? cible.selectionStart : cible.value.length;
        var d1 = (typeof cible.selectionEnd === 'number') ? cible.selectionEnd : d0;
        cible.value = cible.value.slice(0, d0) + x + cible.value.slice(d1);
        cible.focus();
        try { cible.setSelectionRange(d0 + x.length, d0 + x.length); } catch (e) {}
        cible.dispatchEvent(new Event('input'));
      };
    });
  }

  var ETAPES = null;         // etapes en cours d edition (chaine seulement)
  var ESEL = 0;              // l etape montree (une a la fois)

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  // ⚠ LES DEUX FORMES EN ENTIER. La version d avant collait un « s » au mot
  // recu — ce qui marche en francais et FAUX en anglais (« echecs » n est pas
  // « failures », « inscription » ne fait pas « inscriptions »). Le pluriel se
  // choisit ici entre deux phrases deja traduites, jamais en ajoutant une
  // lettre. Voir tools/banc-pluriel-colle.js.
  function pluriel(n, un, plu){ return n + ' ' + (n > 1 ? plu : un); }

  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès à l’infolettre.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps. L’envoi peut avoir continué : vérifiez le journal d’envoi avant de recommencer.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cet élément n’existe plus.")}',
    deja_envoyee:       '${T("Cette campagne est déjà partie. Une campagne ne s’envoie pas deux fois.")}',
    resend_absent:      '${T("Aucune clé Resend n’est configurée : rien ne peut partir. Écran Infolettre, onglet Configuration.")}',
    envois_suspendus:   '${T("Les « Séquences automatisées » sont en pause dans les contrôles d’envoi. Traiter maintenant abandonnerait les inscriptions sans rien envoyer.")}',
    rien_en_attente:    '${T("Aucune inscription en attente.")}',
    rien_echu:          '${T("Des inscriptions attendent, mais aucune étape n’est échue : leur délai n’est pas écoulé.")}',
    refus:              '${T("L’envoi a été refusé.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    if (r && r.detail) t += ' ' + esc(String(r.detail).slice(0, 160));
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  /* ══ LES LISTES, REFAITES (2026-10-15, lot A de la refonte du marketing) ═══
     Meme langage que les editeurs : une TETE (les trois onglets en boutons a
     choix, le geste principal a droite), les chiffres dans UNE bande qui se
     replie (szTuiles), puis des RANGS aeres — une ligne par campagne, chaine ou
     segment, ce qui compte lisible d un coup d oeil. Crochets gardes :
     data-onglet, #cp-q, #cp-nouvelle, #cp-nouvchaine, #cp-seqpanier,
     #cp-nouvseg, #cp-traiter, data-modif, data-envoyer, data-suppr,
     data-chmodif, data-basculer, data-chsuppr, data-segmodif, data-segsup. */
  function teteListe(droite){
    var o = [['campagnes', '${T("Campagnes")}'], ['chaines', '${T("Chaînes automatisées")}'], ['segments', 'Segments']];
    return '<div class="ls-tete"><div class="ed-seg ls-onglets">'
      + o.map(function(x){
          return '<button type="button" class="' + (ONGLET === x[0] ? 'on' : '') + '" data-onglet="' + x[0] + '">' + x[1] + '</button>';
        }).join('')
      + '</div><div class="droite">' + (droite || '') + '</div></div>';
  }
  function squelListe(){
    return '<div class="ls">' + teteListe('')
      + '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>';
  }

  /* ── LE RENVOI VERS LE RESTE DE L ECRAN ───────────────────────────────────
     Regle nee de << ou sont mes configurations ? >> : une fenetre qui ne
     couvre qu une partie d un ecran doit dire ou trouver le reste. */
  function renvoi(){
    /* ⚠ L EDITEUR PAR BLOCS EST ICI DEPUIS LA 3.53.0 : ce renvoi ne doit plus le
       nommer comme un manque, sinon il envoie chercher a l ecran web quelque
       chose qui est sous les yeux. */
    return '';
  }

  /* ══ FORMULAIRES — CREER / MODIFIER ═══════════════════════════════════════
     Le trou #4 : cette fenetre savait tout faire SAUF en creer une.
     ⚠ LE CORPS S EDITE EN BLOCS **OU** EN HTML depuis la 3.53.0 : l editeur
     visuel a ete porte ici, et la couverture est passee de PARTIEL a COMPLET.
     C etait le dernier trou declare, donc le dernier obstacle au retrait du web. */

  var VARS_CAMP = ['{{firstName}}', '{{shopUrl}}', '{{promoCode}}',
    '{{discountPercent}}', '{{expiryDate}}', '{{collectionName}}'];
  var VARS_CHAINE = ['{{firstName}}', '{{panier}}', '{{panierTotal}}', '{{panierNb}}',
    '{{premierProduit}}', '{{lienPanier}}', '{{lienBoutique}}'];
  // (2026-10-15) Les memes, par leur nom lisible — celles du panier ne valent qu en « Panier abandonne ».
  var VAR_NOMS_CH = [['{{firstName}}', '${T("Prénom")}'], ['{{lienBoutique}}', '${T("Lien boutique")}'],
    ['{{panier}}', '${T("Articles du panier")}'], ['{{panierTotal}}', '${T("Total du panier")}'],
    ['{{panierNb}}', '${T("Nombre d’articles")}'], ['{{premierProduit}}', '${T("Premier produit")}'],
    ['{{lienPanier}}', '${T("Lien du panier")}']];

  function ligneVars(liste, note){
    return '<div class="vars">${T("Variables :")} '
      + liste.map(function(v){ return '<code>' + esc(v) + '</code>'; }).join(' ')
      + (note ? '<br>' + note : '') + '</div>';
  }

  function choixModeles(id, modeles){
    return '<select id="' + id + '"><option value="">${T("Charger un modèle…")}</option>'
      + (modeles || []).map(function(m){
          return '<option value="' + esc(m.cle) + '">' + esc(m.nom) + '</option>'; }).join('')
      + '</select>';
  }

  /* ══ LE CODE PROMO DE LA CAMPAGNE (2026-10-15) ══════════════════════════════════
     Sa capture : un courriel parti avec « {{promoCode}} » en clair, puis « la section campagne
     doit être plus automatisée au niveau de la création des codes ». Trois choix :
       · Aucun ;
       · Créer automatiquement — le site crée le coupon À L ENVOI (code tiré du nom, une
         utilisation par client, valide N jours) et remplit {{promoCode}}, {{discountPercent}},
         {{expiryDate}} ;
       · Coupon existant — un coupon actif de la fenêtre Coupons.
     ⚠ Le site REFUSE d envoyer un courriel qui emploie {{promoCode}} sans code rattaché. */
  function offreHtml(d, c){
    var o = c.offre || { mode: 'aucun', type: 'percent', valeur: 15, jours: 14 };
    var m = o.mode || 'aucun';
    var choix = [['aucun', '${T("Aucun")}'], ['auto', '${T("Créer automatiquement")}'], ['coupon', '${T("Coupon existant")}']];
    return '<div class="ed-offre" id="f-offre">'
      + '<span class="lbl">${T("Code promo")}</span>'
      + '<div class="ed-seg" id="f-offre-seg">' + choix.map(function(x){
          return '<button type="button" data-offre-mode="' + x[0] + '" class="' + (m === x[0] ? 'on' : '') + '">' + x[1] + '</button>';
        }).join('') + '</div>'
      + '<input type="hidden" id="f-offre-mode" value="' + esc(m) + '">'
      + '<span class="of-auto"' + (m === 'auto' ? '' : ' hidden') + '>'
      +   '<select id="f-offre-type" aria-label="${T("Type de rabais")}">'
      +     '<option value="percent"' + (o.type === 'percent' || !o.type ? ' selected' : '') + '>${T("Pourcentage")}</option>'
      +     '<option value="fixed"' + (o.type === 'fixed' ? ' selected' : '') + '>${T("Montant fixe")}</option>'
      +     '<option value="freeshipping"' + (o.type === 'freeshipping' ? ' selected' : '') + '>${T("Livraison gratuite")}</option></select>'
      +   '<input type="number" id="f-offre-val" min="0" step="1" aria-label="${T("Valeur du rabais")}" value="' + esc(o.valeur != null ? o.valeur : 15) + '"'
      +   (o.type === 'freeshipping' ? ' hidden' : '') + '>'
      +   '<span class="dt of-unite">' + (o.type === 'fixed' ? '$' : '%') + '</span>'
      +   '<span class="dt">${T("valide")}</span><input type="number" id="f-offre-jours" min="1" max="365" step="1" aria-label="${T("Jours de validité")}" value="' + esc(o.jours || 14) + '">'
      +   '<span class="dt">${T("jours · une utilisation par client")}</span>'
      +   (o.code ? '<span class="ed-pill" title="${T("Créé au premier envoi ; réutilisé tant que le réglage ne change pas.")}">' + esc(o.code) + '</span>' : '')
      + '</span>'
      + '<span class="of-coupon"' + (m === 'coupon' ? '' : ' hidden') + '>'
      +   '<select id="f-offre-coupon" aria-label="${T("Coupon")}"><option value="">${T("Choisir un coupon…")}</option>'
      +   (d.coupons || []).map(function(x){
            return '<option value="' + esc(x.id) + '"' + (o.couponId === x.id ? ' selected' : '') + '>' + esc(x.libelle) + '</option>';
          }).join('') + '</select>'
      + '</span>'
      + '</div>';
  }
  function brancherOffre(){
    var z = document.getElementById('f-offre'); if (!z) return;
    var majVue = function(){
      var m = document.getElementById('f-offre-mode').value;
      z.querySelector('.of-auto').hidden = (m !== 'auto');
      z.querySelector('.of-coupon').hidden = (m !== 'coupon');
      var ty = document.getElementById('f-offre-type');
      var gratuit = ty && ty.value === 'freeshipping';
      var v = document.getElementById('f-offre-val'); if (v) v.hidden = gratuit;
      var u = z.querySelector('.of-unite'); if (u) { u.hidden = gratuit; u.textContent = (ty && ty.value === 'fixed') ? '$' : '%'; }
    };
    z.querySelectorAll('[data-offre-mode]').forEach(function(b){
      b.onclick = function(){
        document.getElementById('f-offre-mode').value = b.getAttribute('data-offre-mode');
        z.querySelectorAll('[data-offre-mode]').forEach(function(x){ x.classList.toggle('on', x === b); });
        majVue();
      };
    });
    var ty = document.getElementById('f-offre-type'); if (ty) ty.onchange = majVue;
    majVue();
  }
  function offreReleve(){
    var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    return { mode: g('f-offre-mode') || 'aucun', type: g('f-offre-type') || 'percent',
      valeur: parseFloat(g('f-offre-val')) || 0, jours: parseInt(g('f-offre-jours'), 10) || 14,
      couponId: g('f-offre-coupon') };
  }

  function vueFormCampagne(){
    var f = FORM, d = f.d, c = d.campagne || {};
    /* ⚠ LA REFONTE DU 2026-10-15 (maquette approuvee). En haut, le nom et l etat ; une BANDE pour
       l objet, les destinataires et le canal ; puis trois colonnes : les blocs, l APERCU REEL, les
       reglages du bloc choisi. L IA s ouvre dans un panneau. Aucune glissiere : la liste et les
       reglages sont en pages mesurees, l apercu defile dans son propre cadre. Les identifiants des
       champs (f-nom, f-suj, f-seg, f-canal, f-sms, f-html) sont CEUX D AVANT : le brouillon, la
       soumission et la bascule Visuel / HTML les lisent tels quels. */
    var h = '<div class="ed' + (IAOUVERTE ? ' ia-ouverte' : '') + '" id="f-ed">'
      + '<div class="ed-tete">'
      + '<button type="button" class="retour" id="f-annuler">${T("← Campagnes")}</button><span class="sep">/</span>'
      + '<div class="nom"><input id="f-nom" aria-label="${T("Nom interne")}" value="' + esc(c.nom || '')
      + '" placeholder="${T("Nom de la campagne")}">'
      + '<span class="ed-pill" title="${T("Rien ne part tant que vous n’appuyez pas sur « Envoyer ».")}">${T("Brouillon")}</span></div>'
      + '<button type="button" class="ed-bt ia" id="f-ia-ouvrir"><span class="ic">✶</span> ${T("Rédiger avec l’IA")}</button>'
      + '<button type="button" class="ed-bt fort" id="f-ok">${T("Enregistrer")}</button>'
      + '</div>'
      // ⚠ CHAQUE SEGMENT MONTRE SA PORTEE : on choisit en voyant combien de personnes il atteint MAINTENANT.
      + '<div class="ed-bande">'
      + '<label for="f-suj"><span>${T("Objet")}</span><input id="f-suj" value="' + esc(c.sujet || '')
      + '" placeholder="${T("Nos nouveautés sont arrivées !")}"></label>'
      + '<label for="f-seg"><span>${T("À")}</span><select id="f-seg">'
      + (d.segments || []).map(function(s){
          return '<option value="' + esc(s.cle) + '"' + ((c.segment || 'all') === s.cle ? ' selected' : '')
            + '>' + esc(s.nom) + ' · ' + (s.compte || 0) + '</option>';
        }).join('') + '</select></label>'
      + '<label for="f-canal"><span>${T("Canal")}</span><select id="f-canal">'
      + (d.canaux || []).map(function(x){
          return '<option value="' + esc(x.cle) + '"' + ((c.canal || 'email') === x.cle ? ' selected' : '')
            + '>' + esc(x.nom) + '</option>'; }).join('') + '</select></label>'
      + '</div>'
      + offreHtml(d, c)
      + '<div class="ed-sous" id="f-seg-quoi"></div>'
      // Le message texte ne parait que si le canal envoie des SMS (majSms, plus bas).
      + '<div class="ed-sms" id="f-sms-bloc">'
      + '<textarea id="f-sms" aria-label="${T("Message texte (SMS)")}" maxlength="480" placeholder="${T("SANDRIZA : nos nouveautés sont arrivées !")}">'
      + esc(c.sms || '') + '</textarea>'
      + '<div class="aide"><strong>${T("Message texte (SMS)")}</strong> · <span id="f-sms-n">0</span>/480<br>'
      + (d.smsDestinataires || 0) + ' '
      + szPl(d.smsDestinataires || 0, '${T("client ayant consenti, avec un téléphone.")}', '${T("clients ayant consenti, avec un téléphone.")}')
      + (d.smsPret ? '' : '<br><span style="color:var(--tx-err)"><span class="ic">⚠</span> ${T("Téléphonie non configurée : l’envoi SMS échouera.")}</span>')
      + '<br>${T("Twilio gère STOP et AIDE automatiquement.")}</div></div>'
      + '<div class="ed-cols">'
      + '<div class="ed-col gauche"><div id="f-blocs"' + (BMODE === 'visuel' ? '' : ' style="display:none"') + '>' + blocsHtml() + '</div>'
      + '<div class="ed-modele"><span>${T("Partir d’un modèle")}</span><div class="duo">' + choixModeles('f-tpl', d.modeles)
      + '<button type="button" id="f-charger">${T("Charger")}</button></div></div></div>'
      /* ⚠ DEUX MODES, ET LE VISUEL EST LE DEFAUT. Le mode HTML reste : c est le seul moyen de coller un
         gabarit venu d ailleurs, et de relire ce qui part vraiment. Basculer vers HTML CONVERTIT les
         blocs ; revenir au visuel remet le HTML dans un bloc « HTML libre », sans rien perdre. */
      + '<div class="ed-col">'
      + '<div style="display:flex;align-items:center;gap:.7rem">'
      + '<div class="ed-seg"><button type="button" id="f-m-vis" class="' + (BMODE === 'visuel' ? 'on' : '') + '">${T("Visuel")}</button>'
      + '<button type="button" id="f-m-htm" class="' + (BMODE === 'html' ? 'on' : '') + '">HTML</button></div>'
      + '<span class="ed-note" style="margin-left:auto;padding:0">${T("Cliquez un bloc dans l’aperçu pour le modifier.")}</span></div>'
      + '<div class="ed-scene"><iframe id="f-vivant" sandbox="allow-same-origin" title="${T("Aperçu du courriel")}"'
      + (BMODE === 'visuel' ? '' : ' style="display:none"') + '></iframe>'
      + '<textarea id="f-html" spellcheck="false" aria-label="HTML"' + (BMODE === 'visuel' ? ' style="display:none"' : '') + '>'
      + esc(c.html || '') + '</textarea></div>'
      + '<div class="ed-note">${T("Enregistrée en brouillon : rien ne part tant que vous n’appuyez pas sur « Envoyer ».")}</div>'
      + '</div>'
      + '<div class="ed-col"><div class="ed-insp" id="f-insp">' + inspHtml() + '</div></div>'
      + '</div>'
      + '<div class="ed-ia"><button type="button" class="ed-ia-x" id="f-ia-x" aria-label="${T("Fermer")}" title="${T("Fermer")}"><span class="ic">✕</span></button>'
      + '<div class="iabloc" id="f-ia">' + iaPanneauHtml() + '</div></div>'
      + '</div>';
    return h;
  }

  /* ⚠ L EDITEUR DE CHAINE, REFAIT COMME CELUI DES CAMPAGNES (2026-10-15, « le meme genre de refonte
     a chacun des modules ») : le nom en tete, une bande declencheur / description / statut, puis la LIGNE
     DU TEMPS des etapes a gauche (chacune dit QUAND elle part), l APERCU du courriel de l etape choisie
     au centre, et ses reglages a droite. Memes identifiants qu avant (f-nom, f-decl, f-desc, f-statut,
     e-j-i, e-h-i, e-s-i, e-t-i, e-b-i) : brouillon, releve et enregistrement inchanges. */
  function vueFormChaine(){
    var f = FORM, d = f.d, ch = d.chaine || {};
    var h = '<div class="ed" id="f-ed">'
      + '<div class="ed-tete">'
      + '<button type="button" class="retour" id="f-annuler">${T("← Chaînes")}</button><span class="sep">/</span>'
      + '<div class="nom"><input id="f-nom" aria-label="${T("Nom de la chaîne")}" value="' + esc(ch.nom || '')
      + '" placeholder="${T("Bienvenue en trois temps")}"></div>'
      + '<button type="button" class="ed-bt fort" id="f-ok">${T("Enregistrer")}</button>'
      + '</div>'
      + '<div class="ed-bande ed-bande-ch">'
      + '<label for="f-decl"><span>${T("Déclencheur")}</span><select id="f-decl">'
      + (d.declencheurs || []).map(function(x){
          return '<option value="' + esc(x.cle) + '"'
            + ((ch.declencheur || 'subscribe') === x.cle ? ' selected' : '') + '>'
            + esc(x.nom) + '</option>'; }).join('') + '</select></label>'
      + '<label for="f-desc"><span>${T("Description")}</span><input id="f-desc" value="' + esc(ch.description || '')
      + '" placeholder="${T("Trois courriels après l’inscription")}"></label>'
      + '<label for="f-statut"><span>${T("Statut")}</span><select id="f-statut">'
      + '<option value="active"' + (ch.statut !== 'paused' ? ' selected' : '') + '>${T("Active")}</option>'
      + '<option value="paused"' + (ch.statut === 'paused' ? ' selected' : '') + '>${T("Suspendue")}</option>'
      + '</select></label>'
      + '</div>'
      + '<div class="ed-cols">'
      + '<div class="ed-col"><div id="f-etapes-liste" class="ed-liste">' + vueEtapesListe() + '</div></div>'
      + '<div class="ed-col">'
      + '<div class="ed-titre"><span id="f-et-titre">' + esc(titreEtape()) + '</span></div>'
      + '<div class="ed-scene"><iframe id="f-et-vivant" sandbox="" title="${T("Aperçu du courriel")}"></iframe></div>'
      + '<div class="ed-note">${T("Les étapes partent d’elles-mêmes selon leur délai — rien ne part à l’enregistrement.")}</div>'
      + '</div>'
      + '<div class="ed-col"><div class="ed-insp" id="f-etapes">' + vueEtapes() + '</div></div>'
      + '</div>'
      + '</div>';
    return h;
  }

  /* LA LIGNE DU TEMPS : chaque etape dit QUAND elle part, en mots (« Immediatement », « 3 j apres »). */
  function delaiEtape(s){
    var j = parseInt(s.jours, 10) || 0, hh = parseInt(s.heures, 10) || 0;
    if (!j && !hh) return '${T("Immédiatement")}';
    return '+ ' + (j ? j + ' ${T("j")}' : '') + (j && hh ? ' ' : '') + (hh ? hh + ' ${T("h")}' : '');
  }
  function titreEtape(){
    var et = ETAPES || [];
    if (!et.length) return '${T("Aperçu")}';
    var i = Math.min(Math.max(ESEL, 0), et.length - 1);
    return '${T("Étape")} ' + (i + 1) + ' · ' + delaiEtape(et[i]);
  }
  function vueEtapesListe(){
    var et = ETAPES || [];
    var h = '<div class="ed-titre"><span>${T("Étapes")}</span><span>' + et.length + '</span></div>';
    if (!et.length) h += '<div class="bvide">${T("Aucune étape : cette chaîne n’enverrait rien.")}</div>';
    else h += '<div data-pages="campagnes-etapes">' + et.map(function(s, i){
      return '<button type="button" class="brang' + (i === ESEL ? ' on' : '') + '" data-etsel="' + i + '">'
        + '<span class="bico">' + (i + 1) + '</span>'
        + '<span class="btx"><b>' + esc(s.sujet || '${T("(sans sujet)")}') + '</b><span>' + esc(delaiEtape(s)) + '</span></span></button>';
    }).join('') + '</div>';
    return h + '<button type="button" class="ed-ajout" id="f-etape-plus">${T("+ Ajouter une étape")}</button>';
  }

  /* L apercu de l etape choisie : son HTML dans l enveloppe du courriel (nl:apercu), rafraichi pendant
     qu on l ecrit. Bac a sable vide : rien ne s y execute. */
  var ETTIMER = null, ETVER = 0;
  function etApercuPlusTard(){ clearTimeout(ETTIMER); ETTIMER = setTimeout(etApercu, 450); }
  function etApercu(){
    var fr = document.getElementById('f-et-vivant');
    if (!fr) return;
    var b = document.getElementById('e-b-' + ESEL);
    var htm = b ? b.value : (((ETAPES || [])[ESEL] || {}).html || '');
    var v = ++ETVER;
    appeler('nl:apercu', [htm]).then(function(r){
      if (v !== ETVER || !r || !r.ok) return;
      fr.setAttribute('srcdoc', r.html);
    });
    var t = document.getElementById('f-et-titre');
    if (t) t.textContent = titreEtape();
  }

  /* L apercu du courriel, pose par-dessus la colonne de droite : il se ferme par son
     bouton, et le formulaire n a jamais a defiler pour le montrer. */
  function apercuBloc(){
    return '<div class="apercu" id="f-apercu-bloc" style="display:none">'
      + '<div class="chrome"><span class="ic">✉</span> ${T("Aperçu — marie@example.com")}'
      + '<button type="button" class="mini" id="f-apercu-x">${T("Fermer l’aperçu")}</button></div>'
      + '<iframe id="f-frame" sandbox=""></iframe></div>';
  }

  function vueEtapes(){
    var et = ETAPES || [];
    if (!et.length) {
      return '<div class="vide" style="padding:.9rem">${T("Aucune étape : cette chaîne n’enverrait rien.")} '
        + '${T("Cliquez « + Ajouter une étape ».")}</div>';
    }
    var mods = (FORM && FORM.d && FORM.d.modeles) || [];
    /* ⚠ UNE ETAPE A LA FOIS (sa demande : aucune barre de defilement) — la ligne du temps a gauche
       choisit celle qu on edite ; les autres restent dans ETAPES. */
    if (ESEL >= et.length) ESEL = et.length - 1;
    if (ESEL < 0) ESEL = 0;
    return et.map(function(s, i){
      if (i !== ESEL) return '';
      return '<div class="it"><span class="bico">' + (i + 1) + '</span><b>${T("Étape")} ' + (i + 1) + '</b><span class="gestes">'
        + '<button type="button" data-mont="' + i + '"' + (i > 0 ? '' : ' disabled') + ' aria-label="${T("Monter")}" title="${T("Monter")}">↑</button>'
        + '<button type="button" data-desc="' + i + '"' + (i < et.length - 1 ? '' : ' disabled') + ' aria-label="${T("Descendre")}" title="${T("Descendre")}">↓</button>'
        + '</span></div>'
        + '<div class="ch"><span class="lbl">${T("Délai depuis le déclenchement")}</span>'
        /* ⚠ DEUX CHAMPS POUR UN SEUL LIBELLE (<< Delai depuis le declenchement >>)
         et les mots << jours >> / << heures >> ne sont que du texte entre eux :
         en tabulant, le lecteur d ecran annoncait deux fois << nombre >>. */
      /* Un attribut par litteral : colles, l etiquette et la valeur se lisent
         comme un seul texte, et l inventaire ne sait plus ou l une finit. */
      + '<div class="duo"><input type="number" min="0" id="e-j-' + i + '"'
        + ' aria-label="${T("Délai — jours")}"'
        + ' value="' + (s.jours || 0)
        + '"><span>${T("jours")}</span><input type="number" min="0" max="23" id="e-h-' + i + '"'
        + ' aria-label="${T("Délai — heures")}"'
        + ' value="'
        + (s.heures || 0) + '"><span>${T("heures")}</span></div></div>'
        + '<div class="ch"><span class="lbl">${T("Sujet")}</span>'
        + '<input aria-label="${T("Sujet")}" id="e-s-' + i + '" value="' + esc(s.sujet || '') + '"></div>'
        + '<div class="ch"><span class="lbl">${T("Partir d’un modèle")}</span>'
        + '<div class="duo">' + choixModeles('e-t-' + i, mods)
        + '<button type="button" data-etcharger="' + i + '">${T("Charger")}</button></div></div>'
        + '<div class="ch corps-et"><span class="lbl">${T("Corps du courriel (HTML)")}</span>'
        + '<textarea id="e-b-' + i + '" aria-label="${T("Corps du courriel de l’étape ")}' + (i + 1) + '" spellcheck="false">' + esc(s.html || '') + '</textarea></div>'
        // Les variables par leur NOM ; celles du panier ne valent que pour « Panier abandonne ».
        + '<div class="ch"><span class="lbl">${T("Insérer une information")}</span><div class="ed-infos">'
        + VAR_NOMS_CH.map(function(x){ return '<button type="button" data-etvar="' + esc(x[0]) + '" title="' + esc(x[0]) + '">' + esc(x[1]) + '</button>'; }).join('')
        + '</div></div>'
        + '<button type="button" class="ed-retirer" data-etsup="' + i + '">${T("Retirer cette étape")}</button>';
    }).join('');
  }

  /* ⚠ LA SAISIE VIT DANS ETAPES, PAS DANS LE DOM : ajouter ou retirer une
     etape redessine la liste, et ce qui n aurait pas ete releve avant serait
     perdu. On releve donc AVANT chaque redessin. */
  function releverEtapes(){
    (ETAPES || []).forEach(function(s, i){
      /* ⚠ UNE SEULE ETAPE EST A L ECRAN (2026-09-26) : on ne releve QUE celle-la.
         Relire les autres donnerait des champs absents, donc vides — la saisie
         des etapes non montrees serait effacee sans un mot. */
      if (!document.getElementById('e-s-' + i)) return;
      var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
      s.sujet = g('e-s-' + i);
      s.html = g('e-b-' + i);
      s.jours = parseInt(g('e-j-' + i), 10) || 0;
      s.heures = parseInt(g('e-h-' + i), 10) || 0;
    });
  }

  function redessinerEtapes(){
    releverEtapes();
    poserEtapes();
  }

  /* Repeint les etapes PUIS ouvre la page de la pastille choisie : une etape
     ajoutee (le nombre change, le socle revient en page 1) ou deplacee reste en vue. */
  function poserEtapes(){
    var z = document.getElementById('f-etapes');
    if (!z) return;
    z.innerHTML = vueEtapes();
    // (2026-10-15) La ligne du temps a gauche et l apercu au centre suivent.
    var l = document.getElementById('f-etapes-liste');
    if (l) l.innerHTML = vueEtapesListe();
    montrerNouveau(document.querySelector('#f-etapes-liste .brang.on'));
    etApercuPlusTard();
  }

  /* Le catalogue des blocs, demande UNE fois. ⚠ S il n arrive pas, la palette
     reste vide et le mode HTML prend le relais : on ne bloque pas l ecran pour
     une liste de types — mais on le DIT, sinon on chercherait pourquoi aucun
     bouton n apparait. */
  function chargerBlocsCatalogue(){
    appeler('nl:blocsCatalogue', []).then(function(r){
      if (!r || !r.ok) {
        dire('${T("Les types de blocs n’ont pas pu être lus — le mode HTML reste disponible.")}', 'att');
        return;
      }
      BTYPES = r.types || [];
      BMODELES = r.modeles || {};
      BPRODUITS = r.produits || [];
      // La palette n existe qu une fois le formulaire ouvert : on la repeint si
      // elle est deja a l ecran.
      if (document.getElementById('f-blocs')) majBlocs();
    });
  }

  function ouvrirForm(type, id){
    // Le segment n a pas d op de formulaire dediee : ses champs, operateurs,
    // categories et segments automatiques viennent tous de segments:donnees,
    // qu on a deja pour dessiner la liste.
    var op = (type === 'chaine') ? 'chaines:form'
           : (type === 'segment') ? 'segments:donnees' : 'campagnes:form';
    appeler(op, [id || '']).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      if (!r.peutModifier) { dire('${T("Vous êtes en consultation seulement.")}', 'err'); return; }
      FORM = { type: type, id: id || '', d: r };
      /* ⚠ LES BLOCS PARTENT DU HTML EXISTANT, dans un bloc << HTML libre >>.
         Une campagne deja ecrite n a pas de blocs : la deviner en la decoupant
         serait inventer une structure qu on n a pas, et le premier
         enregistrement REECRIRAIT son corps autrement. On la montre telle
         quelle, et qui veut des blocs les ajoute. */
      if (type === 'campagne') {
        var htm0 = String((r.campagne && r.campagne.html) || '');
        BLOCS = htm0 ? [{ type: 'rawHtml', content: htm0 }] : [];
        BMODE = htm0 ? 'html' : 'visuel';
        BSEL = BLOCS.length ? 0 : -1; MENU = false; IAOUVERTE = false; DERNIER = null;
      }
      ESEL = 0;
      ETAPES = (type === 'chaine')
        ? JSON.parse(JSON.stringify((r.chaine && r.chaine.etapes) || [])) : null;
      CRITERES = null;
      if (type === 'segment') {
        var s = (r.segments || []).filter(function(x){ return x.id === id; })[0];
        FORM.nom = s ? s.nom : '';
        CRITERES = s ? JSON.parse(JSON.stringify(s.criteres || [])) : [];
      }
      ARME = '';
      dessiner();
      /* Apres le dessin : la boite de reprise remplit des champs qui n existent
         qu une fois le formulaire pose. */
      szBrouillonProposer();
    });
  }

  /* == LE BROUILLON DES CAMPAGNES, CHAINES ET SEGMENTS ======================
     TROIS formulaires sous un seul etat, et pas les memes champs :
       - une campagne : nom, sujet, segment, canal, le message texte et le corps
         du courriel (plus les BLOCS de l editeur visuel) ;
       - une chaine : nom, description, declencheur, statut, et ses ETAPES ;
       - un segment : nom, et ses CRITERES.
     La cle porte donc le TYPE. Sans lui, une chaine a moitie ecrite serait
     proposee dans le formulaire d une campagne : des champs a moitie remplis dont
     on ne comprendrait pas la provenance.

     ⚠ ET LE PLUS IMPORTANT : ETAPES, CRITERES ET BLOCS NE VIVENT PAS DANS LE DOM.
     Ce sont des copies de travail (JSON.parse(JSON.stringify(...))), justement
     parce que l ecran ne montre pas tout. Les relire depuis l affichage ne rendrait
     qu une partie — et une chaine de cinq etapes reviendrait avec deux. On garde
     donc les VARIABLES, apres avoir appele les fonctions qui les mettent a jour
     depuis les champs affiches (releverEtapes / releverCriteres) : sans cet appel,
     la derniere etape modifiee serait absente du brouillon alors qu elle est a
     l ecran. */
  function brChampsForm(){
    if (!FORM) return [];
    if (FORM.type === 'chaine')  return ['f-nom', 'f-desc', 'f-decl', 'f-statut'];
    if (FORM.type === 'segment') return ['f-nom'];
    return ['f-nom', 'f-suj', 'f-seg', 'f-canal', 'f-sms', 'f-html'];
  }
  szBrouillonBrancher({
    portee: 'campagne',
    libelle: '${T("Une saisie")}',
    ttlMin: 720,
    cle: function(){ return FORM ? (FORM.type + ':' + (FORM.id || '__new__')) : ''; },
    actif: function(){ return !!FORM && !!document.getElementById('f-nom'); },
    valeurs: function(){
      var v = szBrouillonDuDom(brChampsForm(), []);
      if (!v) return null;
      /* On remet les copies de travail a jour AVANT de les garder : elles ne se
         synchronisent qu a l appel. */
      if (FORM.type === 'chaine' && typeof releverEtapes === 'function') releverEtapes();
      if (FORM.type === 'segment' && typeof releverCriteres === 'function') releverCriteres();
      v._type = FORM.type;
      if (FORM.type === 'chaine') v._etapes = ETAPES || [];
      if (FORM.type === 'segment') v._criteres = CRITERES || [];
      if (FORM.type === 'campagne') { v._blocs = BLOCS || []; v._bmode = BMODE; }
      return v;
    },
    rempli: function(){
      var v = szBrouillonDuDom(brChampsForm(), []); if (!v) return false;
      if (szBrouillonQuelqueChose(v, brChampsForm())) return true;
      if (FORM && FORM.type === 'chaine') return (ETAPES || []).length > 0;
      if (FORM && FORM.type === 'segment') return (CRITERES || []).length > 0;
      return (BLOCS || []).length > 0;
    },
    remplir: function(v){
      /* ⚠ UN BROUILLON D UN AUTRE TYPE NE SE REPOSE PAS. La cle porte le type, donc
         ca ne devrait pas arriver — mais un brouillon ecrit par une version
         anterieure pourrait ne pas la porter, et remplir une chaine avec les etapes
         d une campagne ferait un formulaire incoherent. On refuse plutot. */
      if (v._type && FORM && v._type !== FORM.type) return false;
      if (FORM && FORM.type === 'chaine') ETAPES = v._etapes || [];
      if (FORM && FORM.type === 'segment') CRITERES = v._criteres || [];
      if (FORM && FORM.type === 'campagne') {
        BLOCS = v._blocs || [];
        if (v._bmode) BMODE = v._bmode;
      }
      /* Les etapes, les criteres et les blocs sont DESSINES a partir de ces
         variables ; la saisie se repose APRES le dessin (2026-10-07 : avant, elle
         etait posee puis effacee par dessiner(), qui rebatit depuis FORM). */
      dessiner();
      szBrouillonAuDom(v);
    },
  });
  szBrouillonEcouter();

  /* ⚠ UN SEUL CHEMIN FERME CE FORMULAIRE (le bouton Annuler et l enregistrement
     reussi passent tous deux par ici), donc une seule ligne suffit — et l ecriture
     est IMMEDIATE, avant que charger() ne redessine tout. */
  function fermerForm(){ szFermerBoite(function(){ FORM = null; ETAPES = null; CRITERES = null; charger(); }); }

  function apercuDans(html){
    var bloc = document.getElementById('f-apercu-bloc');
    var cadre = document.getElementById('f-frame');
    if (!bloc || !cadre) return;
    dire('${T("Construction de l’aperçu…")}');
    appeler('nl:apercu', [html]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      bloc.style.display = '';
      // ⚠ srcdoc avec un bac a sable VIDE : le courriel est du HTML etranger,
      // il ne doit ni executer de script ni atteindre cette fenetre.
      cadre.setAttribute('srcdoc', r.html);
      dire('');
      // Plus de scrollIntoView : l apercu est pose par-dessus la colonne, il est deja en vue
      // (et faire defiler un corps sans glissiere le laisserait decale).
    });
  }

  function soumettreForm(){
    var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    var b = document.getElementById('f-ok');
    if (FORM.type === 'campagne') {
      /* ⚠⚠ EN MODE VISUEL, LE CHAMP HTML EST VIDE — il est masque et personne ne
         l a rempli. Enregistrer g(f-html) tel quel ecrirait un corps VIDE sur
         une campagne pleine de blocs, et l on ne s en apercevrait qu a l envoi.
         On convertit donc d abord, puis on repasse par ici. */
      if (BMODE === 'visuel') {
        if (b) b.disabled = true;
        dire('${T("Assemblage du courriel…")}');
        blocsVersHtml(function(htm){
          var ta = document.getElementById('f-html');
          if (ta) ta.value = htm;
          BMODE = 'html';              // on ne reconvertira pas deux fois
          if (b) b.disabled = false;
          soumettreForm();
        });
        return;
      }
      var data = { nom: g('f-nom').trim(), sujet: g('f-suj').trim(), segment: g('f-seg'),
        canal: g('f-canal'), sms: g('f-sms').trim(), html: g('f-html'), offre: offreReleve() };
      if (data.offre.mode === 'coupon' && !data.offre.couponId) { dire('${T("Choisissez le coupon de la campagne, ou un autre réglage de code promo.")}', 'err'); return; }
      if (data.offre.mode === 'auto' && data.offre.type !== 'freeshipping' && !(data.offre.valeur > 0)) { dire('${T("Indiquez la valeur du rabais du code automatique.")}', 'err'); return; }
      // ⚠ Le courriel emploie {{promoCode}} sans code : on le dit à l'enregistrement, pas au moment d'envoyer.
      if (data.offre.mode === 'aucun' && /\{\{\s*(promoCode|discountPercent|expiryDate)\s*\}\}/.test(data.sujet + data.html + data.sms)) {
        dire('${T("Ce courriel contient un code promo : choisissez « Créer automatiquement » ou un coupon existant, sinon l’envoi sera refusé.")}', 'err'); return;
      }
      if (!data.nom) { dire('${T("Le nom interne est requis.")}', 'err'); return; }
      if (!data.sujet) { dire('${T("Le sujet est requis.")}', 'err'); return; }
      if ((data.canal === 'sms' || data.canal === 'both') && !data.sms) {
        dire('${T("Le message texte est requis pour ce canal.")}', 'err'); return;
      }
      if (b) b.disabled = true;
      dire('${T("Enregistrement…")}');
      appeler('campagnes:ecrire', [FORM.id, data]).then(function(r){
        if (b) b.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        /* Jeter AVANT de fermer : fermerForm ecrit le brouillon, et il reecrirait
           par-dessus celui qu on vient de jeter. */
        szBrouillonJeter();
        dire(esc(r.nom) + (r.cree ? ' ${T("créée")}' : ' ${T("mise à jour")}') + ' ${T("— en brouillon.")}', 'bon');
        fermerForm();
      });
      return;
    }
    releverEtapes();
    var dch = { nom: g('f-nom').trim(), description: g('f-desc').trim(),
      declencheur: g('f-decl'), statut: g('f-statut'), etapes: ETAPES || [] };
    if (!dch.nom) { dire('${T("Le nom est requis.")}', 'err'); return; }
    if (!dch.etapes.length) { dire('${T("Ajoutez au moins une étape.")}', 'err'); return; }
    if (dch.etapes.some(function(s){ return !String(s.sujet || '').trim(); })) {
      dire('${T("Chaque étape doit avoir un sujet.")}', 'err'); return;
    }
    if (b) b.disabled = true;
    dire('${T("Enregistrement…")}');
    appeler('chaines:ecrire', [FORM.id, dch]).then(function(r){
      if (b) b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      szBrouillonJeter();
      dire(esc(r.nom) + (r.cree ? ' ${T("créée")}' : ' ${T("mise à jour")}') + ' — '
        + pluriel(r.etapes, '${T("étape")}', '${T("étapes")}') + '.', 'bon');
      fermerForm();
    });
  }

  function brancherForm(){
    var a = document.getElementById('f-annuler');
    if (a) a.onclick = fermerForm;
    var o = document.getElementById('f-ok');
    if (o) o.onclick = (FORM.type === 'segment') ? soumettreSegment : soumettreForm;

    if (FORM.type === 'segment') {
      var cp = document.getElementById('f-crit-plus');
      if (cp) cp.onclick = function(){
        releverCriteres();
        // Premier critere par defaut : le plus parlant et le plus courant.
        var d0 = (FORM.d.champs || [])[0] || { cle: 'totalDepense', ops: [{ cle: 'gte' }] };
        CRITERES.push({ champ: d0.cle, op: (d0.ops[0] || {}).cle, valeur: '' });
        redessinerCriteres(CRITERES.length - 1);
      };
      var bc = document.getElementById('f-compter');
      if (bc) bc.onclick = compterPortee;
      // (2026-10-15) Un operateur ou une valeur qui change : la portee se recompte d elle-meme.
      var zc = document.getElementById('f-criteres');
      if (zc) { zc.oninput = function(){ releverCriteres(); porteePlusTard(); }; zc.onchange = zc.oninput; }
      porteePlusTard();
      return;
    }

    if (FORM.type === 'campagne') {
      var canal = document.getElementById('f-canal');
      var bloc = document.getElementById('f-sms-bloc');
      var majSms = function(){
        var v = canal ? canal.value : 'email';
        if (bloc) bloc.style.display = (v === 'sms' || v === 'both') ? '' : 'none';
      };
      if (canal) canal.onchange = majSms;
      majSms();
      // La recette du segment choisi, sous le menu : on sait ce qu on cible.
      var seg = document.getElementById('f-seg');
      var quoi = document.getElementById('f-seg-quoi');
      var majSeg = function(){
        if (!seg || !quoi) return;
        var s = (FORM.d.segments || []).filter(function(x){ return x.cle === seg.value; })[0];
        quoi.textContent = (s && s.phrase) ? s.phrase : '';
      };
      if (seg) seg.onchange = majSeg;
      majSeg();
      var sms = document.getElementById('f-sms');
      var cpt = document.getElementById('f-sms-n');
      var majN = function(){ if (cpt && sms) cpt.textContent = String(sms.value.length); };
      if (sms) sms.oninput = majN;
      majN();
      /* ══ LA BASCULE VISUEL / HTML ═══════════════════════════════════════
         ⚠ ELLE NE PERD RIEN, DANS AUCUN SENS. Vers HTML : on demande au site de
         convertir les blocs (il est le seul a savoir). Vers le visuel : le HTML
         entre dans un bloc << HTML libre >> — on ne tente pas de le decouper en
         blocs, ce serait inventer une structure et reecrire son corps au premier
         enregistrement. */
      var ta = document.getElementById('f-html');
      var zb = document.getElementById('f-blocs');
      var bv = document.getElementById('f-m-vis');
      var bh = document.getElementById('f-m-htm');
      var fv = document.getElementById('f-vivant');
      var majMode = function(){
        if (zb) zb.style.display = (BMODE === 'visuel') ? '' : 'none';
        if (ta) ta.style.display = (BMODE === 'visuel') ? 'none' : '';
        if (fv) fv.style.display = (BMODE === 'visuel') ? '' : 'none';
        if (bv) bv.className = (BMODE === 'visuel' ? 'on' : '');
        if (bh) bh.className = (BMODE === 'html' ? 'on' : '');
        majInsp();
      };
      if (bv) bv.onclick = function(){
        if (BMODE === 'visuel') return;
        var htm = ta ? ta.value : '';
        BLOCS = htm.trim() ? [{ type: 'rawHtml', content: htm }] : [];
        BMODE = 'visuel';
        BSEL = BLOCS.length ? 0 : -1;
        majMode(); majBlocs(); apercuPlusTard();
        dire('${T("Mode visuel. Le HTML est rangé dans un bloc « HTML libre ».")}', 'att');
      };
      if (bh) bh.onclick = function(){
        if (BMODE === 'html') return;
        blocsVersHtml(function(htm){
          if (ta) ta.value = htm;
          BMODE = 'html';
          majMode();
          dire('${T("Mode HTML — c’est exactement ce qui partira.")}', 'att');
        });
      };
      majMode();
      brancherBlocs();
      brancherInsp();
      brancherIa();
      /* Le panneau de l IA s ouvre et se ferme ; il ne repeint rien d autre (la saisie reste). */
      var ed = document.getElementById('f-ed');
      var iaBasculer = function(oui){
        IAOUVERTE = oui;
        if (ed) ed.classList.toggle('ia-ouverte', oui);
        if (oui) { var but = document.getElementById('f-ia-but'); if (but) but.focus(); }
      };
      var io = document.getElementById('f-ia-ouvrir');
      if (io) io.onclick = function(){ iaBasculer(!IAOUVERTE); };
      var ix = document.getElementById('f-ia-x');
      if (ix) ix.onclick = function(){ iaBasculer(false); };
      // Le menu « Ajouter un bloc » se referme d un clic ailleurs (une seule ecoute, posee une fois).
      if (!document.__szMenuFerme) {
        document.__szMenuFerme = true;
        document.addEventListener('click', function(e){
          if (!MENU) return;
          if (e.target.closest && (e.target.closest('.ed-menu') || e.target.closest('#f-ajout'))) return;
          MENU = false; majBlocs();
        });
      }
      // Le courriel s affiche des l ouverture.
      apercuPlusTard();
      /* ⚠ L ETAT DE L IA N EST DEMANDE QU UNE FOIS PAR OUVERTURE. Le redemander
         a chaque redessin du panneau ferait un appel reseau par clic sur
         << Avancé >>, pour une reponse qui ne change pas. */
      if (!IAETAT) iaCharger();

      var ch = document.getElementById('f-charger');
      if (ch) ch.onclick = function(){
        var cle = document.getElementById('f-tpl').value;
        if (!cle) { dire('${T("Choisissez un modèle.")}', 'att'); return; }
        /* ⚠ EN MODE VISUEL, ON CHARGE LES BLOCS DU MODELE, pas son HTML. Charger
           le HTML puis le ranger dans un bloc << HTML libre >> donnerait un
           modele qu on ne peut plus modifier bloc par bloc — c est-a-dire tout
           l inverse de ce que l editeur sert a faire. */
        if (BMODE === 'visuel' && BMODELES[cle]) {
          BLOCS = JSON.parse(JSON.stringify(BMODELES[cle]));
          BSEL = BLOCS.length ? 0 : -1;
          apresChangement(0);
          dire('${T("Modèle chargé en blocs — ajustez-les à votre guise.")}', 'bon');
          return;
        }
        appeler('nl:modele', [cle]).then(function(r){
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          document.getElementById('f-html').value = r.html;
          var s = document.getElementById('f-suj');
          if (s && !s.value.trim()) s.value = r.sujet;
          dire('${T("Modèle «")} ' + esc(r.nom) + ' ${T("» chargé.")}', 'bon');
        });
      };
      var ap = document.getElementById('f-apercu');
      if (ap) ap.onclick = function(){
        // ⚠ L apercu montre TOUJOURS ce qui partira : en mode visuel, on convertit
        // d abord. Montrer le contenu du champ HTML — vide en visuel — annoncerait
        // un courriel vide sur une campagne pleine.
        if (BMODE === 'visuel') { blocsVersHtml(function(h){ apercuDans(h); }); return; }
        apercuDans(document.getElementById('f-html').value);
      };
      return;
    }

    /* (2026-10-15) « + Ajouter une etape » vit dans la ligne du temps, redessinee a chaque geste : son clic
       passe par la delegation commune (plus bas). Ici, la saisie : la ligne du temps et l apercu suivent. */
    if (!document.__szEtapesSaisie) {
      document.__szEtapesSaisie = true;
      document.addEventListener('input', function(e){
        if (!FORM || FORM.type !== 'chaine' || !e.target || !e.target.id) return;
        if (!/^e-[sjhb]-\\d+$/.test(e.target.id)) return;
        releverEtapes();
        var l = document.getElementById('f-etapes-liste');
        if (l && !/^e-b-/.test(e.target.id)) { l.innerHTML = vueEtapesListe(); montrerNouveau(document.querySelector('#f-etapes-liste .brang.on')); }
        if (/^e-b-/.test(e.target.id) || /^e-[jh]-/.test(e.target.id)) etApercuPlusTard();
      });
      document.addEventListener('focusin', function(e){
        if (e.target && /^e-[sb]-\\d+$/.test(e.target.id || '')) DERNIER = e.target;
      });
    }
  }

  /* ══ ONGLET SEGMENTS ══════════════════════════════════════════════════════
     Un segment est une RECETTE reevaluee a chaque envoi, pas une liste figee :
     une cliente qui franchit le seuil entre la creation et l envoi y entre
     d elle-meme. ⚠ Un segment ne fait que RETRECIR la liste des abonnees
     actives — il n ajoute jamais personne (consentement, LCAP / Loi 25). */
  function vueSegments(){
    var D = DS;
    if (!D) return squelListe();
    var h = '<div class="ls">' + teteListe(D.peutModifier
      ? '<button class="ed-bt fort" id="cp-nouvseg">${T("+ Nouveau segment")}</button>' : '');
    /* ⚠ szTuiles(...) ENVELOPPE, il ne remplace rien : le bandeau est ecrit tel
       quel, la piece commune y ajoute le bouton de repli et l etat retenu pour
       ce poste. Les TROIS bandeaux de cette fenetre partagent la meme cle et se
       replient ensemble. Voir JS_TUILES dans socle.js. */
    h += szTuiles('<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">${T("Abonnés actifs")}</div><div class="val bon">'
      + (D.abonnesActifs || 0) + '</div><div class="dt">${T("le point de départ")}</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Segments composés")}</div><div class="val">'
      + (D.segments || []).length + '</div></div></div>');

    // ⚠ La phrase du consentement ne se resume pas (voir src/langue/campagnes.js) : elle reste entiere.
    h += '<div class="ls-note">${T("Un segment ne fait que <strong>restreindre</strong> la liste ")}'
      + '${T("des abonnées actives : il ne peut jamais joindre quelqu’un qui n’a pas consenti")} '
      + '${T("à recevoir l’infolettre.")}</div>';

    h += '<div class="ls-liste sz-pagee">';
    if (!(D.segments || []).length) {
      h += '<div class="ls-vide">${T("Aucun segment composé. Les campagnes")} '
        + '${T("disposent tout de même de « Tous les abonnés » et « Clients avec commandes ».")}</div>';
      return h + '</div>' + renvoi() + '</div>';
    }

    // Les segments en PAGES mesurees (JS_PAGES du socle) : un rang par segment.
    var tous = Math.max(1, D.abonnesActifs || 0);
    h += '<div data-pages="campagnes-segments">'
      + D.segments.map(function(s){
          var gestes = '';
          if (D.peutModifier) {
            gestes += '<button class="mini geste" data-segmodif="' + esc(s.id) + '">${T("Modifier")}</button>';
            var armeS = (ARME === 'segsup:' + s.id);
            gestes += '<button class="mini geste danger' + (armeS ? ' arme' : '') + '" data-segsup="'
              + esc(s.id) + '">' + '${T("Supprimer")}' + '</button>';
          }
          var pc = Math.min(100, Math.round(100 * (s.compte || 0) / tous));
          return '<div data-ctx-ligne class="ls-rang ls-seg">'
            + '<div class="qui"><span class="bico" aria-hidden="true">' + esc(initiales(s.nom)) + '</span>'
            + '<div class="tx"><b>' + esc(s.nom) + '</b><span>' + esc(s.phrase || '—') + '</span></div></div>'
            + '<div class="prt"><div class="ligne"><b>' + (s.compte || 0) + '</b><span>' + pc + ' ${T("% des abonnés actifs")}</span></div>'
            + '<div class="barre"><i style="width:' + pc + '%"></i></div></div>'
            + '<div class="bilan"><span>' + (s.utilisePar ? '${T("Utilisé par")} ' + pluriel(s.utilisePar, '${T("campagne")}', '${T("campagnes")}') : '${T("Inutilisé")}') + '</span></div>'
            + '<div class="gestes">' + gestes + '</div></div>';
        }).join('')
      + '</div></div>';
    return h + renvoi() + '</div>';
  }

  /* ⚠ LE CONSTRUCTEUR DE SEGMENT, REFAIT (2026-10-15, meme langage que les editeurs) : les CRITERES a
     gauche, chacun lu comme une phrase (« Si… », « et… ») ; a droite la PORTEE en grand, recomptee
     d elle-meme a chaque changement (avant : un bouton « Compter » au bas d une page vide). Memes
     identifiants (f-nom, c-c-i, c-o-i, c-v-i, f-crit-plus, f-compter, f-portee-n). */
  function vueFormSegment(){
    var f = FORM, d = f.d;
    return '<div class="ed" id="f-ed">'
      + '<div class="ed-tete">'
      + '<button type="button" class="retour" id="f-annuler">${T("← Segments")}</button><span class="sep">/</span>'
      + '<div class="nom"><input id="f-nom" aria-label="${T("Nom du segment")}" value="' + esc(f.nom || '')
      + '" placeholder="${T("Clients robes, 300 $ et plus")}"></div>'
      + '<button type="button" class="ed-bt fort" id="f-ok">${T("Enregistrer")}</button>'
      + '</div>'
      + '<div class="ed-cols seg-cols">'
      + '<div class="ed-col">'
      + '<div class="ed-titre"><span>${T("Critères")}</span><span>${T("toutes ces conditions doivent être remplies")}</span></div>'
      // Les criteres en PAGES mesurees : un critere = un element de page.
      + '<div id="f-criteres" class="seg-crit" data-pages="campagnes-criteres">' + vueCriteres() + '</div>'
      + '<button type="button" class="ed-ajout" id="f-crit-plus">${T("+ Ajouter un critère")}</button>'
      + '</div>'
      + '<div class="ed-col"><div class="ed-insp seg-portee" id="f-portee">'
      + '<span class="lbl">${T("Portée de ce segment")}</span>'
      + '<div class="gros"><strong id="f-portee-n">—</strong><span>${T("sur")} ' + (d.abonnesActifs || 0) + ' ${T("abonnées actives")}</span></div>'
      + '<div class="barre"><i id="f-portee-barre" style="width:0%"></i></div>'
      + '<p class="aide">${T("Un segment ne fait que restreindre la liste des abonnées actives : il n’ajoute jamais personne.")}</p>'
      + '<button type="button" id="f-compter">${T("Recompter")}</button>'
      + '</div></div>'
      + '</div></div>';
  }

  function champDef(cle){
    var l = (FORM && FORM.d && FORM.d.champs) || [];
    for (var i = 0; i < l.length; i++) { if (l[i].cle === cle) return l[i]; }
    return null;
  }

  // Le controle de VALEUR depend du type du champ : un nombre, une categorie,
  // un segment automatique, un oui/non, ou du texte libre.
  function champValeur(i, c){
    var def = champDef(c.champ);
    var d = FORM.d;
    var id = 'c-v-' + i;
    if (!def) return '<input id="' + id + '" value="' + esc(c.valeur) + '">';
    if (def.type === 'nombre') {
      return '<input type="number" min="0" step="any" id="' + id + '" value="'
        + esc(c.valeur) + '">' + (def.unite ? '<span class="u">' + esc(def.unite) + '</span>' : '');
    }
    if (def.type === 'categorie' || def.type === 'segauto') {
      var opts = (def.type === 'categorie' ? (d.categories || []) : (d.segmentsAuto || []));
      return '<select id="' + id + '">' + opts.map(function(o){
        return '<option value="' + esc(o.cle) + '"' + (String(c.valeur) === o.cle ? ' selected' : '')
          + '>' + esc(o.nom) + '</option>'; }).join('') + '</select>';
    }
    if (def.type === 'booleen') {
      var oui = (c.valeur === true || c.valeur === 'true');
      return '<select id="' + id + '"><option value="true"' + (oui ? ' selected' : '') + '>${T("Oui")}</option>'
        + '<option value="false"' + (oui ? '' : ' selected') + '>${T("Non")}</option></select>';
    }
    return '<input id="' + id + '" value="' + esc(c.valeur) + '">';
  }

  function vueCriteres(){
    var cr = CRITERES || [];
    if (!cr.length) {
      return '<div class="vide" style="padding:.9rem">${T("Aucun critère : ce segment vaudrait")} '
        + '${T("« tous les abonnés ». Ajoutez-en au moins un.")}</div>';
    }
    var champs = (FORM.d && FORM.d.champs) || [];
    return cr.map(function(c, i){
      var def = champDef(c.champ) || { ops: [] };
      return '<div class="critere"><span class="lien">' + (i === 0 ? '${T("Si")}' : '${T("et")}') + '</span>'
        + '<select id="c-c-' + i + '" data-critchamp="' + i + '"'
          + ' aria-label="${T("Critère")} ' + (i + 1) + ' — champ">'
        + champs.map(function(x){
            return '<option value="' + esc(x.cle) + '"' + (x.cle === c.champ ? ' selected' : '')
              + '>' + esc(x.nom) + '</option>'; }).join('') + '</select>'
        + '<select id="c-o-' + i + '" aria-label="${T("Critère")} ' + (i + 1) + ' — opérateur">'
        + (def.ops || []).map(function(o){
            return '<option value="' + esc(o.cle) + '"' + (o.cle === c.op ? ' selected' : '')
              + '>' + esc(o.nom) + '</option>'; }).join('') + '</select>'
        + champValeur(i, c)
        + '<button class="mini danger" data-critsup="' + i + '">✕</button></div>';
    }).join('');
  }

  /* ⚠ MEME PIEGE QUE LES ETAPES : la saisie vit dans CRITERES, pas dans le DOM.
     Ajouter, retirer ou changer un champ redessine la liste — on releve donc
     AVANT chaque redessin, sinon la frappe en cours disparait. */
  function releverCriteres(){
    (CRITERES || []).forEach(function(c, i){
      var g = function(id){ var e = document.getElementById(id); return e ? e.value : null; };
      var ch = g('c-c-' + i); if (ch != null) c.champ = ch;
      var op = g('c-o-' + i); if (op != null) c.op = op;
      var v = g('c-v-' + i); if (v != null) c.valeur = v;
    });
  }

  // << voir >> : le rang du critere a montrer (ajoute, ou celui qui prend la place du retire).
  function redessinerCriteres(voir){
    var z = document.getElementById('f-criteres');
    if (z) z.innerHTML = vueCriteres();
    if (z && typeof voir === 'number') montrerNouveau(z.querySelectorAll('.critere')[Math.min(voir, (CRITERES || []).length - 1)]);
    var p = document.getElementById('f-portee-n');
    if (p) p.textContent = '—';   // la portee affichee ne vaut plus rien
    porteePlusTard();
  }
  // La portee se recompte d elle-meme, un instant apres le dernier changement (2026-10-15).
  var PTIMER = null;
  function porteePlusTard(){ clearTimeout(PTIMER); PTIMER = setTimeout(function(){ if (FORM && FORM.type === 'segment' && (CRITERES || []).length) compterPortee(); }, 600); }

  function compterPortee(){
    releverCriteres();
    var p = document.getElementById('f-portee-n');
    if (p) p.textContent = '…';
    appeler('segments:apercu', [CRITERES || []]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); if (p) p.textContent = '—'; return; }
      if (p) p.textContent = String(r.compte);
      // La barre de proportion (2026-10-15) : la part des abonnees actives que le segment atteint.
      var br = document.getElementById('f-portee-barre');
      if (br) br.style.width = (r.total ? Math.round(100 * r.compte / r.total) : 0) + '%';
      dire(r.compte === 0
        ? '${T("Aucune abonnée ne correspond : ce segment n’enverrait rien.")}'
        : pluriel(r.compte, '${T("abonnée")}', '${T("abonnées")}') + ' sur ' + r.total + '.', r.compte === 0 ? 'att' : 'bon');
    });
  }

  function soumettreSegment(){
    releverCriteres();
    var nom = (document.getElementById('f-nom').value || '').trim();
    if (!nom) { dire('${T("Le nom est requis.")}', 'err'); return; }
    if (!(CRITERES || []).length) { dire('${T("Ajoutez au moins un critère.")}', 'err'); return; }
    var b = document.getElementById('f-ok');
    if (b) b.disabled = true;
    dire('${T("Enregistrement…")}');
    appeler('segments:ecrire', [FORM.id, { nom: nom, criteres: CRITERES }]).then(function(r){
      if (b) b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(esc(r.nom) + (r.cree ? ' ${T("créé")}' : ' ${T("mis à jour")}') + ' — ' + pluriel(r.compte, '${T("abonnée")}', '${T("abonnées")}') + '.'
        + (r.nuage ? '' : ' ${T("Enregistré sur ce poste seulement — le nuage n’a pas confirmé.")}'),
        r.nuage ? 'bon' : 'att');
      szBrouillonJeter();
      fermerForm();
    });
  }

  /* ══ ONGLET CAMPAGNES ═══════════════════════════════════════════════════ */
  function initiales(nom){
    // Seuls les mots qui commencent par une lettre ou un chiffre comptent (« (copie) » ne donne plus « ( »).
    var m = String(nom || '').replace(/[^0-9A-Za-zÀ-ÿ ]+/g, ' ').trim().split(' ').filter(Boolean);
    if (!m.length) return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }
  function vueCampagnes(){
    var D = DC;
    if (!D) return squelListe();
    var q = Q.trim().toLowerCase();
    var rows = (D.campagnes || []).filter(function(c){
      if (!q) return true;
      return (String(c.nom) + ' ' + String(c.sujet)).toLowerCase().indexOf(q) !== -1;
    });

    // La recherche et la creation, dans la tete, juste au-dessus de ce sur quoi elles agissent.
    var h = '<div class="ls">' + teteListe(
        '<label class="ls-rch">${ICO.loupe}<input type="search" id="cp-q" aria-label="${T("Nom ou sujet")}" placeholder="${T("Nom ou sujet…")}" value="'
        + esc(Q) + '"></label>'
        + (D.peutModifier ? '<button class="ed-bt fort" id="cp-nouvelle">${T("+ Nouvelle campagne")}</button>' : ''));

    h += szTuiles('<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">${T("Abonnés actifs")}</div><div class="val bon">'
      + (D.abonnesActifs || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Brouillons")}</div><div class="val neutre">'
      + (D.brouillons || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Campagnes parties")}</div><div class="val">'
      + (D.envoyees || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Courriels partis")}</div><div class="val">'
      + (D.courrielsEnvoyes || 0) + '</div>'
      + (D.courrielsEchoues ? '<div class="dt">' + pluriel(D.courrielsEchoues, '${T("échec")}', '${T("échecs")}') + '</div>' : '')
      + '</div></div>');

    /* Ce qui empeche un envoi, ou le detourne, se dit AVANT le clic. */
    if (!D.resendPret) {
      h += '<div class="avis mal">${T("Aucune clé Resend n’est configurée : <strong>rien ne peut partir</strong>. ")}'
        + '${T("Écran Infolettre → Configuration, dans la fenêtre principale.")}</div>';
    } else if (D.modeTest) {
      h += '<div class="avis att">${T("Mode test allumé : les courriels partiront <strong>uniquement</strong> à ")}'
        + esc(D.courrielTest) + '${T(", et la campagne restera en brouillon. Les SMS, eux, ne partent pas du tout.")}</div>';
    }

    // Les campagnes en PAGES mesurees (JS_PAGES du socle) : la liste prend la hauteur qui reste.
    h += '<div class="ls-liste sz-pagee">';
    if (!rows.length) {
      h += '<div class="ls-vide">' + (q ? '${T("Rien ne correspond.")}'
        : '${T("Aucune campagne pour l’instant. Cliquez « + Nouvelle campagne ».")}') + '</div>';
    } else {
      h += '<div data-pages="campagnes">' + rows.map(function(c){
        var gestes = '';
        if (D.peutModifier) {
          // ⚠ MEME REGLE QUE LE WEB : une campagne PARTIE ne se modifie plus.
          if (c.etat !== 'sent') {
            gestes += '<button class="mini geste" data-modif="' + esc(c.id) + '">${T("Modifier")}</button>';
            var armeE = (ARME === 'env:' + c.id);
            gestes += '<button class="mini geste' + (armeE ? ' arme' : ' prim') + '" data-envoyer="'
              + esc(c.id) + '"' + (D.resendPret || c.canal === 'sms' ? '' : ' disabled')
              + '>' + '${T("Envoyer")}' + '</button>';
          }
          // (2026-10-15, sa demande) Une campagne, même ENVOYÉE, se duplique en brouillon.
          // (2026-10-15, sa demande) Les statistiques d une campagne partie : ouvertures, clics, liens, audience.
          if (c.etat === 'sent') gestes += '<button class="mini geste" data-stats="' + esc(c.id) + '">${T("Statistiques")}</button>';
          gestes += '<button class="mini geste" data-dupliquer="' + esc(c.id) + '">${T("Dupliquer")}</button>';
          var armeS = (ARME === 'sup:' + c.id);
          gestes += '<button class="mini geste danger' + (armeS ? ' arme' : '') + '" data-suppr="'
            + esc(c.id) + '">' + '${T("Supprimer")}' + '</button>';
        }
        var nb = (c.canal === 'sms' ? (D.smsDestinataires || 0) : c.destinataires);
        var parti = (c.etat === 'sent' || c.envoyes);
        return '<div data-ctx-ligne class="ls-rang ls-camp">'
          /* (2026-10-15, sa capture : « C( » pour « Campagne Automne 2026 (copie) », lu comme un identifiant)
             La pastille dit le CANAL — une enveloppe, un téléphone —, pas des lettres tirées du nom. */
          + '<div class="qui"><span class="bico" aria-hidden="true">' + (c.canal === 'sms' ? '${ICO.telephone}' : '${ICO.newsletter}') + '</span>'
          + '<div class="tx"><b>' + esc(c.nom) + '</b><span>' + esc(c.sujet) + '</span></div></div>'
          + '<div class="ou"><b>' + esc(c.segmentLibelle) + '</b><span>' + esc(c.canalLibelle) + ' · '
          + pluriel(nb, '${T("destinataire")}', '${T("destinataires")}') + (c.canal === 'both' ? ' + ' + (D.smsDestinataires || 0) + ' SMS' : '') + '</span></div>'
          + '<div class="etat"><span class="rf-pill ' + (c.etat === 'sent' ? 'vert' : (c.etat === 'sending' ? 'ambre' : ''))
          + '">' + esc(c.etatLibelle) + '</span>'
          + (c.date ? '<span>' + esc(szQuand(c.date)) + '</span>' : '') + '</div>'
          + '<div class="bilan">' + (parti
              ? '<b>' + c.envoyes + '</b><span>' + pluriel(c.envoyes, '${T("courriel parti")}', '${T("courriels partis")}').replace(/^[0-9]+ /, '')
                + (c.echecs ? ' · <em>' + pluriel(c.echecs, '${T("échec")}', '${T("échecs")}') + '</em>' : '') + '</span>'
              : '<span>—</span>') + '</div>'
          + '<div class="gestes">' + gestes + '</div></div>';
      }).join('') + '</div>';
    }
    h += '</div>';
    if (D.resendPret && D.expediteur) {
      h += '<div class="ls-pied">${T("Expéditeur :")} ' + esc(D.expediteur) + '</div>';
    }
    return h + renvoi() + '</div>';
  }

  /* ══ ONGLET CHAINES ═════════════════════════════════════════════════════ */
  function vueChaines(){
    var D = DH;
    if (!D) return squelListe();

    var h = '<div class="ls">' + teteListe(D.peutModifier
      ? '<button class="ed-bt" id="cp-seqpanier" title="${T("Panier abandonné : 1 h, 24 h, 72 h (avec 10 %) — créée en pause, à relire")}">'
        + '${T("Créer la séquence panier en 3 temps")}</button>'
        + '<button class="ed-bt fort" id="cp-nouvchaine">${T("+ Nouvelle chaîne")}</button>'
      : '');

    h += szTuiles('<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">${T("Chaînes actives")}</div><div class="val bon">'
      + (D.actives || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Inscriptions en cours")}</div><div class="val">'
      + (D.enAttente || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">${T("Étapes échues")}</div><div class="val '
      + (D.dues ? 'att' : 'neutre') + '">' + (D.dues || 0) + '</div>'
      + '<div class="dt">${T("prêtes à partir")}</div></div>'
      + '</div>');

    if (!D.envoisPermis) {
      h += '<div class="avis mal">${T("Les « Séquences automatisées » sont <strong>en pause</strong> dans les ")}'
        + '${T("contrôles d’envoi (écran Infolettre → Configuration). Aucune étape ne partira, et les traiter")} '
        + '${T("dans cet état abandonnerait les inscriptions sans rien envoyer.")}</div>';
    }

    // Le geste qui ENVOIE n apparait que s il y a quelque chose a envoyer — arme en deux clics.
    if (D.peutModifier && D.dues) {
      var armeT = (ARME === 'traiter');
      h += '<div class="ls-action"><span>' + pluriel(D.dues, '${T("étape échue")}', '${T("étapes échues")}')
        + ', ${T("prêtes à partir")}</span>'
        + '<button class="ed-bt' + (armeT ? ' arme' : ' fort') + '" id="cp-traiter"'
        + (!D.envoisPermis ? ' disabled' : '') + '>'
        + '${T("Traiter les étapes échues")}'
        + '</button></div>';
    }

    h += '<div class="ls-liste sz-pagee">';
    if (!(D.chaines || []).length) {
      h += '<div class="ls-vide">${T("Aucune chaîne pour l’instant.")} '
        + '${T("Cliquez « + Nouvelle chaîne ».")}</div>';
    } else {
      // Les chaines en PAGES mesurees (JS_PAGES du socle) : un rang par chaine.
      h += '<div data-pages="campagnes-chaines">' + (D.chaines || []).map(function(ch){
        var gestes = '';
        if (D.peutModifier) {
          gestes += '<button class="mini geste" data-chmodif="' + esc(ch.id) + '">${T("Modifier")}</button>';
          var armeB = (ARME === 'bas:' + ch.id);
          gestes += '<button class="mini geste' + (armeB ? ' arme' : '') + '" data-basculer="' + esc(ch.id)
            + '" data-active="' + (ch.active ? '0' : '1') + '">'
            + (ch.active ? '${T("Suspendre")}' : '${T("Activer")}') + '</button>';
          var armeS = (ARME === 'chsup:' + ch.id);
          gestes += '<button class="mini geste danger' + (armeS ? ' arme' : '') + '" data-chsuppr="'
            + esc(ch.id) + '">' + '${T("Supprimer")}' + '</button>';
        }
        // La ligne du temps : quatre etapes au plus, le reste en « +n ».
        var et = ch.etapes || [];
        var temps = et.length
          ? '<div class="ls-temps">' + et.slice(0, 4).map(function(e){
              return '<span class="pt"><i></i><b>' + esc(e.delai) + '</b><small>' + esc(e.sujet) + '</small></span>';
            }).join('') + (et.length > 4 ? '<span class="plus">+' + (et.length - 4) + '</span>' : '') + '</div>'
          : '<div class="ls-temps rien">${T("Aucune étape : cette chaîne n’enverra rien.")}</div>';
        return '<div data-ctx-ligne class="ls-rang ls-ch' + (ch.active ? '' : ' eteinte') + '">'
          + '<div class="qui"><span class="bico" aria-hidden="true">' + esc(initiales(ch.nom)) + '</span>'
          + '<div class="tx"><b>' + esc(ch.nom) + '</b><span>' + esc(ch.description || ch.declencheurLibelle) + '</span></div></div>'
          + temps
          + '<div class="etat"><span class="rf-pill ' + (ch.active ? 'vert' : '') + '">'
          + (ch.active ? '${T("Active")}' : '${T("Suspendue")}') + '</span>'
          + '<span class="rf-pill bleu">' + esc(ch.declencheurLibelle) + '</span></div>'
          + '<div class="bilan"><b>' + (ch.inscriptionsActives || 0) + '</b><span>${T("en cours ·")} '
          + pluriel(ch.inscriptionsFinies || 0, '${T("terminée")}', '${T("terminées")}') + '</span></div>'
          + '<div class="gestes">' + gestes + '</div></div>';
      }).join('') + '</div>';
    }
    h += '</div>';
    return h + renvoi() + '</div>';
  }

  /* ══ LES STATISTIQUES D UNE CAMPAGNE (2026-10-15) ══════════════════════════════════
     Sa demande : « un bouton pour les statistiques des ouvertures, par clic et lien des differentes
     campagnes, et le suivi de l audience aussi — le tout par campagne ». Les chiffres viennent du
     site (campagnes:stats) : le journal d envoi, les evenements de Resend (resend-webhook.php) et la
     liste des abonnes. ⚠ suivi=false : AUCUN evenement n est jamais arrive — le suivi n est pas branche
     chez Resend ; la vue le dit et dit quoi activer, au lieu d afficher des zeros trompeurs. */
  var STATS = null;
  function pct(n, d){ return d ? Math.round(1000 * n / d) / 10 : 0; }
  function vueStats(){
    var S = STATS, E = S.engagement, A = S.audience || {};
    var base = (E && E.livres) || S.partis || 0;
    var tuile = function(lib, val, sous, cl){
      return '<div class="st-t' + (cl ? ' ' + cl : '') + '"><span>' + lib + '</span><b>' + val + '</b>' + (sous ? '<small>' + sous + '</small>' : '') + '</div>';
    };
    var h = '<div class="ls st"><div class="ed-tete st-tete">'
      + '<button type="button" class="retour" id="st-retour">${T("← Campagnes")}</button><span class="sep">/</span>'
      + '<div class="ls-titre"><b>' + esc(S.nom) + '</b><span>' + esc(S.sujet) + (S.envoyeeLe ? ' · ${T("envoyée le")} ' + esc(szQuand(S.envoyeeLe)) : '')
      + (S.segment ? ' · ' + esc(S.segment) : '') + (S.code ? ' · ${T("code")} ' + esc(S.code) : '') + '</span></div></div>';
    h += '<div class="st-tuiles">'
      + tuile('${T("Partis")}', S.partis, S.echecs ? pluriel(S.echecs, '${T("échec")}', '${T("échecs")}') : '')
      + tuile('${T("Livrés")}', E ? E.livres : '—', E && S.partis ? pct(E.livres, S.partis) + ' %' : '')
      + tuile('${T("Ouverts")}', E ? E.ouverts : '—', E && base ? pct(E.ouverts, base) + ' ${T("% d’ouverture")}' : '', 'bon')
      + tuile('${T("Cliqués")}', E ? E.cliques : '—', E && base ? pct(E.cliques, base) + ' ${T("% de clic")}' : '', 'bon')
      + tuile('${T("Rebonds")}', E ? E.rebonds : '—', '', E && E.rebonds ? 'att' : '')
      + tuile('${T("Plaintes")}', E ? E.plaintes : '—', '', E && E.plaintes ? 'mal' : '')
      + '</div>';
    if (!E || !E.suivi) {
      h += '<div class="avis att">' + (S.engagementErreur && S.engagementErreur !== 'echec'
          ? '${T("Les événements de suivi n’ont pas pu être lus")} (' + esc(S.engagementErreur) + '). '
          : '') + '${T("Le suivi des ouvertures et des clics n’est pas encore branché. Chez Resend : 1) Domaines → votre domaine → activez « Open tracking » et « Click tracking » ; 2) Webhooks → ajoutez l’adresse https://www.sandriza.com/resend-webhook.php avec les événements email.* ; 3) copiez son « Signing secret » dans la variable RESEND_WEBHOOK_SECRET du serveur. Les campagnes envoyées ensuite seront suivies.")}</div>';
    }
    var liens = (E && E.liens) || [];
    var maxL = liens.reduce(function(m, l){ return Math.max(m, l.clics); }, 0) || 1;
    var jours = (E && E.jours) || [];
    var maxJ = jours.reduce(function(m, j){ return Math.max(m, j.ouvertures); }, 0) || 1;
    h += '<div class="st-cols">'
      + '<div class="st-carte"><div class="ed-titre"><span>${T("Liens cliqués")}</span><span>' + liens.length + '</span></div>'
      + (liens.length ? liens.map(function(l){
          return '<div class="st-lien"><div class="st-lien-t"><span title="' + esc(l.lien) + '">' + esc(String(l.lien).replace('https://', '').replace('http://', '')) + '</span>'
            + '<b>' + l.clics + '</b></div><div class="st-barre"><i style="width:' + Math.max(3, Math.round(100 * l.clics / maxL)) + '%"></i></div>'
            + '<small>' + pluriel(l.personnes, '${T("personne")}', '${T("personnes")}') + '</small></div>';
        }).join('') : '<div class="ls-note">${T("Aucun clic enregistré pour cette campagne.")}</div>')
      + '</div>'
      + '<div class="st-carte"><div class="ed-titre"><span>${T("Ouvertures par jour")}</span></div>'
      + (jours.length ? '<div class="st-jours">' + jours.map(function(j){
          return '<div class="st-j" title="' + esc(j.jour) + ' · ' + j.ouvertures + '"><i style="height:' + Math.max(4, Math.round(100 * j.ouvertures / maxJ)) + '%"></i><small>' + esc(j.jour.slice(5)) + '</small></div>';
        }).join('') + '</div>' : '<div class="ls-note">${T("Aucune ouverture enregistrée pour cette campagne.")}</div>')
      + '<div class="ed-titre st-aud"><span>${T("Audience")}</span></div>'
      + '<div class="st-audience">'
      + tuile('${T("Abonnés actifs aujourd’hui")}', A.actifsAujourdhui || 0, '')
      + tuile('${T("Nouveaux dans les 7 jours")}', '+' + (A.gagnes7j || 0), '', 'bon')
      + tuile('${T("Désabonnés dans les 7 jours")}', '−' + (A.perdus7j || 0), '', A.perdus7j ? 'att' : '')
      + '</div></div>'
      + '</div></div>';
    return h;
  }

  function dessiner(){
    if (OCCUPE) return;
    // Les statistiques d une campagne prennent tout le corps, comme un editeur.
    if (STATS && !FORM) {
      if (sous) sous.textContent = '';
      corps.classList.remove('formulaire'); corps.classList.remove('ed-corps');
      corps.classList.add('ls-corps');
      corps.innerHTML = vueStats();
      return;
    }
    // ⚠ UN FORMULAIRE OUVERT PREND TOUTE LA VUE : pas d onglets, pas de liste.
    // Redessiner la liste sous un formulaire ferait perdre la saisie en cours.
    if (FORM) {
      if (sous) sous.textContent = '';
      corps.classList.add('formulaire');
      corps.classList.remove('ls-corps');
      // L editeur de campagne refait (2026-10-15) occupe tout le corps, sans la marge des listes.
      corps.classList.toggle('ed-corps', FORM.type === 'campagne' || FORM.type === 'chaine' || FORM.type === 'segment');
      corps.innerHTML = (FORM.type === 'chaine') ? vueFormChaine()
        : (FORM.type === 'segment') ? vueFormSegment() : vueFormCampagne();
      brancherForm();
      if (FORM.type === 'campagne') brancherOffre();
      // La page de l etape choisie (les pages survivent au redessin, la selection aussi).
      if (FORM.type === 'chaine') { montrerNouveau(corps.querySelector('#f-etapes-liste .brang.on')); etApercuPlusTard(); }
      return;
    }
    // La mention suit l ONGLET affiche : dire << consultation seulement >> en
    // regardant les segments parce que les campagnes le sont serait faux.
    var vu = (ONGLET === 'chaines') ? DH : (ONGLET === 'segments') ? DS : DC;
    if (sous) sous.textContent = (vu && !vu.peutModifier) ? 'consultation seulement' : '';
    corps.classList.remove('formulaire');
    corps.classList.remove('ed-corps');
    corps.classList.add('ls-corps');
    corps.innerHTML = (ONGLET === 'chaines' ? vueChaines()
      : ONGLET === 'segments' ? vueSegments() : vueCampagnes());
    brancher();
  }

  function brancher(){
    var q = document.getElementById('cp-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };
    var bn = document.getElementById('cp-nouvelle');
    if (bn) bn.onclick = function(){ ouvrirForm('campagne', ''); };
    var bnc = document.getElementById('cp-nouvchaine');
    if (bnc) bnc.onclick = function(){ ouvrirForm('chaine', ''); };
    /* LA SÉQUENCE PANIER EN TROIS TEMPS (2026-10-06, son choix « B ») : trois modèles du site
       (cartSeq1..3), à 1 h, 24 h et 72 h. Créée EN PAUSE : on la relit, puis on l'active. */
    var bsp = document.getElementById('cp-seqpanier');
    if (bsp) bsp.onclick = function(){
      if (OCCUPE) return; OCCUPE = true; bsp.disabled = true;
      dire('${T("Création de la séquence…")}');
      var cles = ['cartSeq1', 'cartSeq2', 'cartSeq3'], heures = [1, 24, 72];
      Promise.all(cles.map(function(c){ return appeler('nl:modele', [c]); })).then(function(rs){
        if (rs.some(function(r){ return !r || !r.ok; })) throw new Error('${T("modèle introuvable — le site doit être à jour")}');
        var etapes = rs.map(function(r, i){
          return { sujet: r.sujet, html: r.html, jours: Math.floor(heures[i] / 24), heures: heures[i] % 24 };
        });
        return appeler('chaines:ecrire', ['', { nom: '${T("Panier abandonné — séquence en 3 temps")}',
          description: '${T("1 h : rappel · 24 h : avis et rareté · 72 h : 10 % pendant 48 h")}',
          declencheur: 'abandoned_cart', statut: 'paused', etapes: etapes }]);
      }).then(function(r){
        OCCUPE = false; bsp.disabled = false;
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        dire('${T("Séquence créée, en pause : relisez-la puis activez-la.")}', 'bon');
        charger();
      }).catch(function(e){ OCCUPE = false; bsp.disabled = false; dire(String((e && e.message) || e), 'err'); });
    };
    var bns = document.getElementById('cp-nouvseg');
    if (bns) bns.onclick = function(){ ouvrirForm('segment', ''); };
    var bt = document.getElementById('cp-traiter');
    if (bt) bt.onclick = function(){
      if (ARME !== 'traiter') {
        var nD = (DH && DH.dues) || 0;
        szConfirmer({ prudent: true, titre: '${T("Envoyer les étapes échues")}',
          texte: pluriel(nD, '${T("étape échue")}', '${T("étapes échues")}') + ' ' + '${T("va partir par courriel immédiatement. Un envoi ne peut pas être annulé.")}',
          oui: '${T("Envoyer")}' + ' (' + pluriel(nD, '${T("étape")}', '${T("étapes")}') + ')' })
          .then(function(ok){ if (ok) { ARME = 'traiter'; bt.onclick(); } });
        return;
      }
      ARME = '';
      OCCUPE = true;
      bt.disabled = true;
      bt.textContent = '${T("Envoi en cours…")}';
      dire('${T("Envoi des étapes échues… ne fermez pas cette fenêtre.")}', 'att');
      appeler('chaines:traiter', []).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); charger(); return; }
        /* Le verdict dit ce qui est PARTI, pas ce qui a ete tente. */
        dire(pluriel(r.envoyes, '${T("courriel parti")}', '${T("courriels partis")}')
          + (r.echecs ? ', ' + pluriel(r.echecs, '${T("échec")}', '${T("échecs")}') : '')
          + ' sur ' + pluriel(r.traitees, '${T("étape traitée")}', '${T("étapes traitées")}') + '.',
          r.echecs ? 'att' : 'bon');
        charger();
      });
    };
  }

  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('cp-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('cp-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;

    /* ── Gestes PROPRES AU FORMULAIRE (etapes d une chaine, criteres) ───── */
    if (FORM) {
      var cs = t.closest('[data-critsup]');
      if (cs) {
        releverCriteres();
        var kc = parseInt(cs.getAttribute('data-critsup'), 10);
        CRITERES.splice(kc, 1);
        redessinerCriteres(kc);
        return;
      }
      if (t.closest('#f-etape-plus')) {
        releverEtapes();
        ETAPES.push({ sujet: '', html: '', jours: ETAPES.length === 0 ? 0 : 3, heures: 0 });
        ESEL = ETAPES.length - 1;
        poserEtapes();
        return;
      }
      // « Inserer une information » dans une etape : au curseur du dernier champ touche (corps par defaut).
      var etv = t.closest('[data-etvar]');
      if (etv) {
        var cib = (DERNIER && document.body.contains(DERNIER) && /^e-[sb]-/.test(DERNIER.id)) ? DERNIER : document.getElementById('e-b-' + ESEL);
        if (cib) {
          var xv = etv.getAttribute('data-etvar');
          var p0 = (typeof cib.selectionStart === 'number') ? cib.selectionStart : cib.value.length;
          var p1 = (typeof cib.selectionEnd === 'number') ? cib.selectionEnd : p0;
          cib.value = cib.value.slice(0, p0) + xv + cib.value.slice(p1);
          cib.focus();
          try { cib.setSelectionRange(p0 + xv.length, p0 + xv.length); } catch (e2) {}
          cib.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return;
      }
      var esl = t.closest('[data-etsel]');
      if (esl) {
        releverEtapes();
        ESEL = parseInt(esl.getAttribute('data-etsel'), 10) || 0;
        poserEtapes();
        return;
      }
      var sup = t.closest('[data-etsup]');
      if (sup) {
        releverEtapes();
        ETAPES.splice(parseInt(sup.getAttribute('data-etsup'), 10), 1);
        ESEL = Math.max(0, ESEL - 1);
        poserEtapes();
        return;
      }
      var mnt = t.closest('[data-mont]');
      var dsc = t.closest('[data-desc]');
      if (mnt || dsc) {
        releverEtapes();
        var i0 = parseInt((mnt || dsc).getAttribute(mnt ? 'data-mont' : 'data-desc'), 10);
        var j0 = mnt ? i0 - 1 : i0 + 1;
        var tmp = ETAPES[i0]; ETAPES[i0] = ETAPES[j0]; ETAPES[j0] = tmp;
        ESEL = j0;
        poserEtapes();
        return;
      }
      var etc = t.closest('[data-etcharger]');
      if (etc) {
        var ic = etc.getAttribute('data-etcharger');
        var sel = document.getElementById('e-t-' + ic);
        if (!sel || !sel.value) { dire('${T("Choisissez un modèle.")}', 'att'); return; }
        appeler('nl:modele', [sel.value]).then(function(r){
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          var b2 = document.getElementById('e-b-' + ic);
          if (b2) b2.value = r.html;
          var s2 = document.getElementById('e-s-' + ic);
          if (s2 && !s2.value.trim()) s2.value = r.sujet;
          // La ligne du temps (sujet) et l apercu suivent le modele charge.
          if (s2) s2.dispatchEvent(new Event('input', { bubbles: true }));
          etApercuPlusTard();
          dire('${T("Modèle «")} ' + esc(r.nom) + ' ${T("» chargé dans l’étape")} ' + (parseInt(ic, 10) + 1) + '.', 'bon');
        });
        return;
      }
      if (t.closest('#f-apercu-x')) {
        var ab = document.getElementById('f-apercu-bloc');
        if (ab) ab.style.display = 'none';
        return;
      }
      var eta = t.closest('[data-etapercu]');
      if (eta) {
        var b3 = document.getElementById('e-b-' + eta.getAttribute('data-etapercu'));
        apercuDans(b3 ? b3.value : '');
        return;
      }
      return;   // rien d autre ne s ecoute tant qu un formulaire est ouvert
    }

    var bm = t.closest('[data-modif]');
    if (bm) { ouvrirForm('campagne', bm.getAttribute('data-modif')); return; }
    var bcm = t.closest('[data-chmodif]');
    if (bcm) { ouvrirForm('chaine', bcm.getAttribute('data-chmodif')); return; }
    var bsm = t.closest('[data-segmodif]');
    if (bsm) { ouvrirForm('segment', bsm.getAttribute('data-segmodif')); return; }

    var bss = t.closest('[data-segsup]');
    if (bss) {
      var idSg = bss.getAttribute('data-segsup');
      if (ARME !== 'segsup:' + idSg) {
        /* ⚠ (2026-10-15, sa règle) Toute confirmation est une BOÎTE À PART (szConfirmer, socle) :
           confirmé, on arme puis on rejoue le clic — la suite ne change pas. */
        var sgN = ((DS && DS.segments) || []).filter(function(x){ return x.id === idSg; })[0];
        szConfirmer({ danger: true, titre: '${T("Supprimer le segment")}',
          texte: '${T("Le segment")}' + ' « ' + (sgN ? sgN.nom : '') + ' » ' + '${T("sera supprimé définitivement. Les campagnes qui l’utilisent devront d’abord en choisir un autre.")}',
          oui: '${T("Supprimer le segment")}' }).then(function(ok){ if (ok) { ARME = 'segsup:' + idSg; bss.click(); } });
        return;
      }
      ARME = '';
      appeler('segments:supprimer', [idSg]).then(function(r){
        if (!r.ok) {
          // ⚠ Le refus le plus utile : on NOMME les campagnes qui bloquent,
          // sinon il faudrait les chercher une par une.
          dire(r.motif === 'utilise'
            ? ('${T("Impossible :")} ' + pluriel(r.combien, '${T("campagne")}', '${T("campagnes")}') + ' ${T("s’en sert encore (")}'
               + (r.campagnes || []).join(', ') + '${T("). Changez leur segment d’abord.")}')
            : expliquer(r), 'err');
          dessiner();
          return;
        }
        dire(esc(r.nom) + ' ${T("supprimé.")}'
          + (r.nuage ? '' : ' ${T("Retiré sur ce poste seulement — le nuage n’a pas confirmé.")}'),
          r.nuage ? 'bon' : 'att');
        charger();
      });
      return;
    }

    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ARME = ''; STATS = null; charger(); return; }

    var be = t.closest('[data-envoyer]');
    if (be && !be.disabled) {
      var idE = be.getAttribute('data-envoyer');
      var camp = (DC && DC.campagnes || []).filter(function(c){ return c.id === idE; })[0];
      if (ARME !== 'env:' + idE) {
        /* ⚠ On annonce le nombre et le canal AVANT : c est la derniere
           occasion de se raviser, et rien ne se rattrape apres. */
        var combien = camp
          ? (camp.canal === 'sms' ? ((DC.smsDestinataires || 0) + ' SMS')
             : (pluriel(camp.destinataires, '${T("courriel")}', '${T("courriels")}')
                + (camp.canal === 'both' ? ' + ' + (DC.smsDestinataires || 0) + ' SMS' : '')))
          : '${T("les destinataires")}';
        var test = !!(DC && DC.modeTest);
        szConfirmer({ prudent: true, titre: test ? '${T("Envoyer le courriel de test")}' : '${T("Envoyer la campagne")}',
          texte: test
            ? ('${T("Le mode test est activé : un seul courriel sera envoyé, à")}' + ' ' + (DC.courrielTest || '${T("l’adresse de test")}') + '. ' + '${T("La campagne restera en brouillon.")}')
            : ('${T("La campagne sera envoyée immédiatement. Un envoi ne peut pas être annulé.")}'),
          details: camp ? [['${T("Campagne")}', camp.nom], ['${T("Objet")}', camp.sujet || '—'],
            ['${T("Destinataires")}', camp.segmentLibelle], ['${T("Canal")}', camp.canalLibelle], ['${T("Envois")}', test ? '1' : combien]] : [],
          oui: test ? '${T("Envoyer le test")}' : ('${T("Envoyer")}' + ' (' + combien + ')') })
          .then(function(ok){ if (ok) { ARME = 'env:' + idE; be.click(); } });
        return;
      }
      ARME = '';
      OCCUPE = true;
      be.disabled = true;
      be.textContent = '${T("Envoi…")}';
      dire('${T("Envoi en cours… ne fermez pas cette fenêtre.")}', 'att');
      appeler('campagnes:envoyer', [idE]).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); charger(); return; }
        dire(esc(r.nom) + ' — ' + pluriel(r.envoyes, '${T("envoi réussi")}', '${T("envois réussis")}')
          + (r.echecs ? ', ' + pluriel(r.echecs, '${T("échec")}', '${T("échecs")}') : '')
          + (r.modeTest ? ' ${T("(mode test : la campagne reste en brouillon).")}' : '.'),
          r.echecs ? 'att' : 'bon');
        charger();
      });
      return;
    }

    var bst = t.closest('[data-stats]');
    if (bst) {
      bst.disabled = true;
      dire('${T("Lecture des statistiques…")}');
      appeler('campagnes:stats', [bst.getAttribute('data-stats')]).then(function(r){
        bst.disabled = false;
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        dire(''); STATS = r; dessiner();
      });
      return;
    }
    if (t.closest('#st-retour')) { STATS = null; dessiner(); return; }

    var bdu = t.closest('[data-dupliquer]');
    if (bdu) {
      bdu.disabled = true;
      appeler('campagnes:dupliquer', [bdu.getAttribute('data-dupliquer')]).then(function(r){
        bdu.disabled = false;
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        dire(esc(r.nom) + ' ${T("créée en brouillon.")}', 'bon');
        // La copie s'ouvre tout de suite : on la duplique pour la retoucher.
        if (r.id) ouvrirForm('campagne', r.id); else charger();
      });
      return;
    }

    var bs = t.closest('[data-suppr]');
    if (bs) {
      var idS = bs.getAttribute('data-suppr');
      if (ARME !== 'sup:' + idS) {
        var cS = ((DC && DC.campagnes) || []).filter(function(c){ return c.id === idS; })[0];
        szConfirmer({ danger: true, titre: '${T("Supprimer la campagne")}',
          texte: '${T("La campagne")}' + ' « ' + (cS ? cS.nom : '') + ' » ' + '${T("et ses images seront supprimées définitivement. Cette action est irréversible.")}',
          oui: '${T("Supprimer la campagne")}' }).then(function(ok){ if (ok) { ARME = 'sup:' + idS; bs.click(); } });
        return;
      }
      ARME = '';
      appeler('campagnes:supprimer', [idS]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(esc(r.nom) + ' ${T("supprimée.")}', 'bon');
        charger();
      });
      return;
    }

    var bb = t.closest('[data-basculer]');
    if (bb) {
      var idB = bb.getAttribute('data-basculer');
      var versActive = bb.getAttribute('data-active') === '1';
      var ch = (DH && DH.chaines || []).filter(function(c){ return c.id === idB; })[0];
      var enCours = ch ? ch.inscriptionsActives : 0;
      /* ⚠ SUSPENDRE N EST PAS METTRE EN PAUSE : au traitement suivant, les
         inscriptions en cours sont marquees faites et ne repartiront jamais.
         On ne l arme que s il y a vraiment quelque chose a perdre. */
      if (!versActive && enCours && ARME !== 'bas:' + idB) {
        szConfirmer({ danger: true, titre: '${T("Suspendre la chaîne")}',
          texte: '${T("La chaîne")}' + ' « ' + (ch ? ch.nom : '') + ' » ' + '${T("compte")}' + ' ' + pluriel(enCours, '${T("inscription en cours")}', '${T("inscriptions en cours")}') + '. '
            + '${T("Une fois la chaîne suspendue, ces inscriptions seront abandonnées au prochain traitement : la suite de la séquence ne leur sera jamais envoyée.")}',
          oui: '${T("Suspendre la chaîne")}' }).then(function(ok){ if (ok) { ARME = 'bas:' + idB; bb.click(); } });
        return;
      }
      ARME = '';
      bb.disabled = true;
      appeler('chaines:basculer', [idB, versActive]).then(function(r){
        if (!r.ok) { bb.disabled = false; dire(expliquer(r), 'err'); return; }
        dire(esc(r.nom) + (r.active ? ' ${T("est active.")}' : ' ${T("est suspendue.")}')
          + (r.nuage ? '' : ' ${T("Enregistré sur ce poste seulement — le nuage n’a pas confirmé.")}'),
          r.nuage ? 'bon' : 'att');
        charger();
      });
      return;
    }

    var bcs = t.closest('[data-chsuppr]');
    if (bcs) {
      var idC = bcs.getAttribute('data-chsuppr');
      var chS = (DH && DH.chaines || []).filter(function(c){ return c.id === idC; })[0];
      if (ARME !== 'chsup:' + idC) {
        szConfirmer({ danger: true, titre: '${T("Supprimer la chaîne")}',
          texte: '${T("La chaîne")}' + ' « ' + (chS ? chS.nom : '') + ' », ' + '${T("ses étapes et")}' + ' '
            + pluriel(chS ? chS.inscriptionsActives : 0, '${T("inscription en cours")}', '${T("inscriptions en cours")}') + ' '
            + '${T("seront supprimées définitivement. Cette action est irréversible.")}',
          oui: '${T("Supprimer la chaîne")}' }).then(function(ok){ if (ok) { ARME = 'chsup:' + idC; bcs.click(); } });
        return;
      }
      ARME = '';
      appeler('chaines:supprimer', [idC]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(esc(r.nom) + ' ${T("supprimée")}'
          + (r.perdues ? ' — ' + pluriel(r.perdues, '${T("inscription abandonnée")}', '${T("inscriptions abandonnées")}') + '.' : '.')
          + (r.nuage ? '' : ' ${T("Retiré sur ce poste seulement — le nuage n’a pas confirmé.")}'),
          r.nuage ? 'bon' : 'att');
        charger();
      });
      return;
    }

    /* Un clic sur une commande est traite par SA commande : sans cette garde,
       le clic remonterait ici et desarmerait ce qu il vient d armer. */
    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = ''; dessiner(); }
  });

  /* ⚠ CHANGER LE CHAMP D UN CRITERE CHANGE SES OPERATEURS ET SON CONTROLE DE
     VALEUR : << Ville au moins 300 >> n existe pas. On redessine donc la ligne,
     apres avoir releve la saisie, et on remet la valeur a vide — la garder
     ferait un critere qui montre autre chose que ce qu il contient. */
  corps.addEventListener('change', function(ev){
    var t = ev.target;
    if (!FORM || FORM.type !== 'segment' || !t || !t.getAttribute) return;
    var i = t.getAttribute('data-critchamp');
    if (i == null) return;
    releverCriteres();
    var c = CRITERES[parseInt(i, 10)];
    var def = champDef(c.champ);
    c.op = (def && def.ops[0]) ? def.ops[0].cle : 'eq';
    c.valeur = '';
    redessinerCriteres(parseInt(i, 10));
  });

  function charger(){
    if (ONGLET === 'segments') {
      appeler('segments:donnees', []).then(function(r){
        if (!r || !r.ok) { vide('${T("Segments indisponibles")}', expliquer(r)); return; }
        DS = r;
        dessiner();
      });
      return;
    }
    var op = (ONGLET === 'chaines') ? 'chaines:liste' : 'campagnes:liste';
    appeler(op, []).then(function(r){
      if (!r || !r.ok) {
        vide(ONGLET === 'chaines' ? '${T("Chaînes indisponibles")}' : '${T("Campagnes indisponibles")}', expliquer(r));
        return;
      }
      if (ONGLET === 'chaines') DH = r; else DC = r;
      dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER PAR-DESSUS UNE SAISIE : un formulaire ouvert bloque
     l actualisation, sinon la campagne en cours de redaction disparaitrait. */
  window.szActualiser = function(){
    if (OCCUPE || ARME || FORM) return;
    var q = document.getElementById('cp-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ if (!OCCUPE && !FORM) charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans. */
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

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      /* ⚠ Un envoi en cours ne se ferme pas d un coup d Echap. */
      if (OCCUPE) { dire('${T("Un envoi est en cours : attendez le compte rendu.")}', 'att'); return; }
      // ⚠ Echap ferme le FORMULAIRE avant la fenetre : sinon une frappe de trop
      // ferait disparaitre tout ce qui vient d etre saisi.
      if (FORM) { fermerForm(); return; }
      if (ARME) { ARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  /* Le catalogue des blocs, demande des l ouverture : la palette doit etre prete
     quand le formulaire s ouvre, pas trois secondes apres. */
  chargerBlocsCatalogue();

  if (FORM_DEPART) {
    ouvrirForm(ONGLET === 'chaines' ? 'chaine'
             : ONGLET === 'segments' ? 'segment' : 'campagne', '');
  } else charger();
})();
</script>
</body></html>`;
}

module.exports = { pageCampagnes };
