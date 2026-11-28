'use strict';

/*
 * FENÊTRE « COMMANDES » ET « EXPÉDITIONS » — NATIVE
 * =============================================================================
 * ⚠ UN SEUL FICHIER POUR LES DEUX LISTES, ET C'EST DÉLIBÉRÉ. Ce sont les mêmes
 * lignes, filtrées autrement : « Commandes » montre ce qui est en cours,
 * « Expéditions » ce qui est parti. En faire deux fenêtres jumelles, c'est la
 * garantie qu'elles divergeront — le menu détaché l'a déjà vécu : sa feuille
 * avait été recopiée, et un mois plus tard les deux menus, censés être le même,
 * ne se ressemblaient plus.
 *
 * ⚠ DEPUIS 1.37.0 ELLE PORTE AUSSI LE DÉTAIL D'UNE COMMANDE (clic sur la
 * ligne) avec les actions de la fiche du site : changement de statut (sélecteur
 * ET clic droit sur la ligne, avec la case « réautoriser les courriels » du
 * retour en arrière), remboursement (renvoi vers la fenêtre native), frais de
 * service retenus, suppression avec sa cascade complète, bon de commande et
 * facture. LE DÉTAIL PREND LE VERROU 'orders' à l'ouverture : chez les autres,
 * la fiche s'ouvre en LECTURE SEULE (statut, remboursement, destruction
 * désactivés) et la ligne dit « En traitement ». Tous les montants et toutes
 * les règles viennent du site (commandes:detail, _statutEcrire,
 * _commandeSupprimerEcrire, _fraisRetenusEcrire) — la fenêtre ne calcule RIEN.
 *
 * ⚠ LA PAGE SEULE VOYAGE. Le tri, le filtre et la pagination se font dans le
 * site ; le pont ne porte que les vingt lignes affichées. Tout envoyer pour en
 * montrer vingt ferait passer plusieurs mégaoctets à chaque frappe.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne. Huit fois sur ce projet, dont une en emportant la barre de
 * menu entière.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU, SEP_DEC } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('commandes');

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

/* ⚠ LE CORPS NE DEFILE PAS : seule la LISTE le fait, et elle est paginee pour
   que ce soit rare. La barre de recherche et les filtres restent en vue. */
.corps{flex:1 1 auto;min-height:0;padding:.75rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.55rem}

.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.95rem 1.1rem;flex:0 0 auto}
.carte.plein{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}

input,select{font:inherit;color:var(--tx);background:var(--f-0f1826);
  border:1px solid var(--v14);border-radius:8px;padding:.32rem .5rem;
  width:100%;min-width:0}
input:focus,select:focus{outline:none;border-color:var(--or)}
/* ⚠ LE CHAMP DE RECHERCHE NE PREND PLUS TOUTE LA LARGEUR (sa demande du
   2026-09-14 : << reduit le champ des recherche ici ses trop gros >>).
   Il heritait du 100% des champs et portait un corps de 1rem : sur un ecran
   large, une boite de deux mille pixels pour un numero de commande de huit
   caracteres. La cible la plus grande de l ecran servait la saisie la plus
   courte.
   ⚠ UN PLAFOND (max-width) ET NON UNE LARGEUR FIXE : cette fenetre s ancre aussi
   sur un flanc, ou une largeur fixe deborderait. Le 100% reste donc actif en
   dessous du plafond, et la boite se retrecit toute seule. */
#rech{font-size:.9rem;padding:.3rem .55rem;max-width:26rem}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.3rem .7rem;
  border:1px solid var(--v16);background:var(--v05);
  color:var(--tx);transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:var(--v10);border-color:var(--v30)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#17202c;font-weight:600}
button.mini{padding:.1rem .45rem;font-size:.75rem}
/* En traitement : AMBRE et pleine opacite, comme le bouton verrouille du site —
   griser par transparence le rendait presque invisible sur fond sombre alors
   qu il porte une information importante. */
button.traite{background:#78350f;color:#fde68a;border-color:#b45309;
  cursor:not-allowed;opacity:1}

.filtres{display:flex;gap:.45rem;align-items:center;flex-wrap:wrap;margin-top:.45rem}
/* ⚠ LE BOUTON DE LA CORBEILLE EST POUSSE A DROITE, ET DISCRET (#113). Sa
   demande : << juste mettre un petit bouton dans la page des commande >>. Il
   n est pas un filtre — le mettre au milieu des jetons de statut le ferait lire
   comme une vue de plus, alors qu il ouvre un AUTRE ecran. */
.filtres .corb{margin-left:auto;font-size:.74rem;padding:.1rem .5rem;color:var(--tx2)}
.filtres .corb:hover:not(:disabled){color:var(--tx)}
.filtres .lbl{font-size:.72rem;color:var(--tx2)}
.filtres select{width:auto}
.jetons{display:flex;gap:.28rem;flex-wrap:wrap}
.jetons button{font-size:.74rem;padding:.1rem .5rem;border-radius:99px}
.jetons button.on{background:rgba(var(--or-rgb),.18);border-color:var(--or);color:var(--tx-creme)}
/* Prioritaires : l ambre du site, et un compte qui dit le RESTE-A-FAIRE.
   ⚠ Regles AUTONOMES : le bouton vit HORS du groupe .jetons, une regle
   prefixee .jetons ne l atteignait jamais - le bouton ne s allumait pas
   (signale le 2026-08-07). */
button.prio{border-color:rgba(245,158,11,.4);color:var(--tx-bleute);border-radius:99px;
  font-size:.74rem;padding:.1rem .5rem;margin-left:.4rem}
/* ⚠ Actif = teinte ambree sur fond sombre, texte clair. Le plein orange avec
   texte marine noyait l eclair et se lisait mal en theme sombre (2026-08-08). */
button.prio.on{background:rgba(245,158,11,.24);border-color:#f59e0b;color:#fde68a;
  font-weight:700;box-shadow:0 0 0 1px rgba(245,158,11,.35) inset}
button.prio.on:hover{background:rgba(245,158,11,.34);border-color:#fbbf24}
/* Le « ! » dans un cercle jaune, le MEME que le fil du tableau de bord (2026-10-15, sa demande : « Prioritaires
   seulement, rien d autre dans le bouton, mais le ! dans un cercle a cote pour rester fidele »). */
button.prio{display:inline-flex;align-items:center;gap:.4rem}
.prio-pill{flex:0 0 auto;display:inline-grid;place-items:center;width:1.05rem;height:1.05rem;border-radius:50%;
  background:#fbbf24;color:#1a1208;font-size:.72rem;font-weight:900;line-height:1;box-shadow:0 0 0 2px rgba(251,191,36,.22)}
.eclair{color:var(--tx-att);margin-right:.2rem}

/* La liste : la seule zone qui defile. */
/* Les tuiles de tete (refonte du 2026-09-25), aux mesures de l Inventaire. */
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:.6rem;flex:0 0 auto;margin-bottom:.6rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.val.att{color:var(--tx-att)}
.tuile.cliq{cursor:pointer;user-select:none;position:relative}
/* Le geste de ligne aux mesures des zones de la barre (2,4rem, coins de 10px) :
   demande du 2026-09-25, « conforme aux zones ». */
button.mini.ligne-geste{height:2.4rem;padding:0 1rem;border-radius:10px;font-size:.84rem;font-weight:600;
  display:inline-flex;align-items:center;gap:.45rem;white-space:nowrap}
.tuile.cliq:hover{border-color:var(--or)}
.tuile.cliq::after{content:"›";position:absolute;top:.55rem;right:.8rem;font-size:1.1rem;color:var(--tx3)}
.liste{flex:1 1 auto;min-height:0;overflow-y:auto}
/* LA GRAMMAIRE DES FACTURES (2026-10-16) : chiffres cliquables, barre segmentee, tableau + panneau d appui. */
.cx{overflow:hidden}
.cx-carte>.liste{flex:1 1 0;min-height:0}
.cx>.cx-carte.seule{flex:1 1 0;min-height:0}
[data-tuile].cx-averti{cursor:pointer}
.ed-seg button{border:none}
/* 23rem : « Numéro de commande, nom, courriel, suivi… » (Expéditions) tient, polices Linux comprises. */
.cx-barre .rf-rch{width:23rem;flex:0 1 auto;min-width:12rem}
#rech{max-width:none}
.cx-barre select{width:auto}
.tete .sous~.cx-actions{margin-left:0}
/* Prioritaires et Ventes manuelles : la hauteur et le corps des boutons a choix voisins. */
.cx-barre>button.rf-jet{align-self:stretch;display:inline-flex;align-items:center;gap:.4rem;margin-left:0;
  padding:0 .85rem;border-radius:10px;font-size:.84rem}
.cx table{font-size:.84rem}
.cx thead th{text-align:left}
.cx th.d,.cx td.d{text-align:right;white-space:nowrap}
.cx th.c,.cx td.c{text-align:center;white-space:nowrap}
.cx tbody td{vertical-align:middle}
/* LA BASCULE D AFFICHAGE (la meme que l Inventaire et Produits en vente), en icones : le libelle est dans
   l infobulle et pour le lecteur d ecran. */
.vue-bascule{display:inline-flex;align-items:stretch;gap:2px;padding:3px;border-radius:10px;
  background:var(--v04);border:1px solid var(--v12);flex:0 0 auto}
.vue-bascule button{display:inline-flex;align-items:center;height:2rem;padding:0 .6rem;
  border:0!important;border-radius:7px;background:transparent!important;color:var(--tx2)}
.vue-bascule button svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
.vue-bascule button:hover:not(.on){color:var(--tx);background:var(--v06)!important}
.vue-bascule button.on{background:var(--or)!important;color:#1a1208}
/* L AFFICHAGE COMPACT : une ligne par commande — client, numero et date cote a cote, l avatar devient un point,
   des pastilles plus petites. La pagination mesuree en tire plus de lignes. */
.liste.compacte tbody td{padding-top:.2rem!important;padding-bottom:.2rem!important}
.liste.compacte .rf-prod{gap:.55rem}
.liste.compacte .rf-av{width:.55rem!important;height:.55rem!important;min-width:0!important;font-size:0!important;
  border-radius:50%!important;background:var(--or)!important;opacity:.75}
.liste.compacte .rf-prod>div{display:flex;align-items:baseline;gap:.7rem;min-width:0}
.liste.compacte .rf-nom{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.liste.compacte .rf-sous{margin-top:0!important;white-space:nowrap}
.liste.compacte .rf-pill{font-size:.6875rem;padding:.02rem .4rem}
.liste.compacte .ligne-geste{min-height:0;height:1.75rem;padding:0 .55rem;font-size:.75rem}
/* (2026-11-18) Épuré : rien de coupé — le nom entier, le numéro, la date et la ville sur UNE ligne. */
html[data-sz-theme="epure"] .liste.compacte .rf-nom{overflow:visible;text-overflow:clip}
html[data-sz-theme="epure"] .liste.compacte .rf-sous{display:flex;flex-wrap:nowrap;align-items:baseline;gap:.35rem}
html[data-sz-theme="epure"] .liste.compacte .rf-sous span{white-space:nowrap}
html[data-sz-theme="epure"] .kb-col>header b{overflow:visible;text-overflow:clip}
html[data-sz-theme="epure"] .kb-carte .l1{flex-wrap:wrap;row-gap:.1rem}
html[data-sz-theme="epure"] .kb-carte .l1 b{overflow:visible;text-overflow:clip}
html[data-sz-theme="epure"] .kb-carte .l2{flex-wrap:nowrap;white-space:nowrap}
.liste::-webkit-scrollbar{width:8px}
.liste::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
table{width:100%;border-collapse:collapse;font-size:.85rem}
.corps thead th{position:sticky;top:0;background:var(--f-bande);text-align:left;
  padding:.34rem .5rem;font-size:.7rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700}
.corps thead th.d{text-align:right}
.corps thead th.c{text-align:center}
.corps tbody td{padding:.3rem .5rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody td.d{text-align:right;white-space:nowrap}
tbody td.c{text-align:center;white-space:nowrap}
.corps tbody tr:hover{background:var(--v04)}
tbody .num{font-family:ui-monospace,monospace;font-size:.78rem;color:var(--tx-or)}
tbody .det{font-size:.75rem;color:var(--tx2)}
/* Une commande ETIQUETEE mais pas encore expediee : c est exactement celle qu on
   cherche en reprenant le travail. Elle se repere sans lire. */
tbody tr.attente{background:rgba(124,92,255,.09)}
/* ══ COMMANDES FIDÈLE À LA MAQUETTE « Commandes à 50 » (Épuré, 2026-11-18, Volume.dc.html) ══════════════
   Des GROUPES (À préparer déplié ; En préparation, Annulées repliés), un tableau compact de 38 px (barre de ton,
   case, commande, client, reçue, total, paiement, livraison, action), pages MESURÉES — jamais de glissière. */
.mq{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:10px;overflow:hidden}
.cx>.mq{flex:1 1 0;min-height:0}
.mq-g{flex:none;display:flex;flex-direction:column;gap:6px;min-height:0}
.mq-g.ouvert{flex:1 1 0}
.mq-gt{display:flex;align-items:center;gap:10px}
.mq-gt h2{margin:0;font-size:15px;font-weight:800;color:var(--tx);letter-spacing:0;text-transform:none}
.mq-gt span{font-size:12px;color:var(--tx2)}
.mq-carte{flex:1 1 0;min-height:0;display:flex;flex-direction:column;background:var(--f-carte);border:1px solid var(--v08);border-radius:14px;overflow:hidden}
.mq-lignes{flex:1 1 0;min-height:0;overflow:hidden}
.mq table{width:100%;border-collapse:collapse;table-layout:fixed}
.mq th{height:34px;font-size:11px;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em;text-align:left;
  border-bottom:1px solid var(--v08);padding:0 6px;background:transparent}
.mq td{height:38px;font-size:13px;border-bottom:1px solid var(--v06);padding:0 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:transparent}
.mq tbody tr{cursor:pointer}
.mq tbody tr:hover td{background:var(--v03)}
.mq td.b,.mq th.b{padding:0;width:4px}
.mq td.cl .mq-cl{display:inline-flex;align-items:center;gap:8px;max-width:100%;vertical-align:middle}
.mq td.cl .nm{overflow:hidden;text-overflow:ellipsis}
.mq td.cl.prio .nm{font-weight:700}
.mq td.cl .prio-pill{width:18px;height:18px;font-size:11px}
.mq td.b i{display:block;width:4px;height:38px;background:var(--mq-ton,#e8a35b)}
.mq th.b i{display:block;width:4px;height:34px;background:var(--mq-ton,#e8a35b)}
.mq .no{font-weight:700;text-overflow:clip!important}
.mq td.mo-etat{padding:0 6px;text-align:center;font-weight:700;font-size:12.5px;border-left:2px solid var(--f-carte)}
.mq td.mo-etat.n{background:var(--ep-neutre-f);color:var(--ep-neutre-t)}
.mq td.mo-etat.a{background:var(--ep-ambre-f);color:var(--ep-ambre-t)}
.mq td.mo-etat.r{background:var(--ep-rouge-f);color:var(--ep-rouge-t)}
/* (2026-11-18, sa capture : « quand on survole on ne voit pas bien ») Le survol générique des boutons (gris) écrasait le brun : le bouton « Préparer » garde son brun, un ton plus foncé, et son texte. */
.mq .act button.prep:hover:not(:disabled){background:var(--sz-btn-prim-fort,#6b431e);color:var(--sz-btn-prim-txt,#fff);border-color:transparent}
.mq .vieille{color:var(--tx-att);font-weight:700}
.mq .mt{text-align:right;font-weight:700;font-variant-numeric:tabular-nums;padding-right:18px}
.mq .pay{font-size:12px;font-weight:700;padding:3px 9px;border-radius:99px;background:var(--ep-neutre-f,var(--v08));color:var(--ep-neutre-t,var(--tx))}
.mq .pay.a{background:var(--ep-ambre-f,rgba(245,158,11,.16));color:var(--ep-ambre-t,var(--tx-att))}
.mq .act button{width:100%;height:28px;border-radius:7px;font-size:12px;font-weight:700;white-space:nowrap;padding:0 8px}
.mq .act button.prep{background:var(--sz-btn-prim,#8a5a2b);border:0;color:var(--sz-btn-prim-txt,#fff)}
.mq .act .tenu-puce,.tenu-puce{display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 8px;border-radius:99px;background:var(--ep-ambre-f,rgba(245,158,11,.12));color:var(--tx-att);font-size:12px;font-weight:600;white-space:nowrap;cursor:default}
.tenu-puce svg{flex:none}
.mq .act button.tenu{background:var(--ep-ambre-f,rgba(245,158,11,.12));border:1px dashed var(--tx-att);color:var(--tx-att);cursor:default;opacity:1!important}
/* La barre d'outils : les boutons gardent leur largeur (la recherche passe dessous si la place manque, elle ne les recouvre pas). */
html[data-sz-theme="epure"] .cx-barre>*:not(.droite){flex-shrink:0}
/* ⚠ MESURÉ : le bloc de droite débordait VERS LA GAUCHE (justify flex-end) sur « Ventes manuelles » — son minimum = son contenu. */
html[data-sz-theme="epure"] .cx-barre>.droite,html[data-sz-theme="epure"].jour .cx-barre>.droite{min-width:max-content!important}
.mq-pied{flex:none;display:flex;align-items:center;gap:8px;height:42px;padding:0 12px;border-top:1px solid var(--v06)}
.mq-pied span{margin-left:auto;font-size:12px;color:var(--tx2)}
.mq-pied button{width:30px;height:28px;border-radius:7px;padding:0}
.mq-replie{flex:none;display:flex;align-items:center;gap:12px;height:46px;padding:0 14px;border-radius:12px;border:1px solid var(--v08);
  background:var(--f-carte);font:inherit;text-align:left;color:var(--tx);cursor:pointer;width:100%}
.mq-replie .barre{width:4px;height:22px;border-radius:2px;background:var(--mq-ton,#c9ced8)}
.mq-replie b{font-size:14px;font-weight:800}
.mq-replie .det{font-size:12px;color:var(--tx2)}
.mq-replie .nb{margin-left:auto;min-width:26px;height:22px;padding:0 8px;border-radius:99px;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;
  background:var(--ep-neutre-f,var(--v08));color:var(--ep-neutre-t,var(--tx))}
.mq-replie .nb.a{background:var(--ep-ambre-f,rgba(245,158,11,.16));color:var(--ep-ambre-t,var(--tx-att))}
.mq-vide{padding:1.2rem;font-size:13px;color:var(--tx2)}

/* ══ LA FICHE « ÉPURÉ » (8.42.0, fidèle à Commande.dc.html) ═════════════════════════════════════════
   Trois tons seulement : neutre, ambre (ce qui attend), rouge (supprimer). Aucune glissière : les
   articles se mettent en pages à la hauteur réellement offerte (cmAjuste). */
.cm{height:100%;min-height:0;display:flex;flex-direction:column;gap:14px;overflow:hidden}
.cm-ban{flex:none;display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:14px;background:var(--ep-ambre-f,#fff7eb);border:1px solid var(--v10)}
.cm-av{position:relative;width:40px;height:40px;flex:none;border-radius:50%;background:var(--ep-neutre-f,var(--v08));color:var(--ep-neutre-t,var(--tx));
  font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center}
.cm-av .cad{position:absolute;right:-4px;bottom:-4px;width:22px;height:22px;border-radius:50%;background:#a14e00;color:var(--tx-sur-accent,#fff);
  display:flex;align-items:center;justify-content:center;border:2px solid var(--ep-ambre-f,#fff7eb)}
.cm-ban .tx{display:flex;flex-direction:column;gap:2px;margin-right:auto;min-width:0}
.cm-ban .tx b{font-size:14px;font-weight:800;color:var(--ep-ambre-t,#8a3f00);white-space:nowrap}
.cm-ban .tx span{font-size:13px;color:var(--ep-ambre-t,#8a3f00);white-space:nowrap}
.cm-ban .dir{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--ep-ambre-t,#8a3f00);white-space:nowrap}
.cm-ban .dir i{width:8px;height:8px;border-radius:50%;background:var(--ep-ambre-t,#8a3f00)}
.cm-tete{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.cm-tete button,.cm-cote .gestes button{height:40px;padding:0 14px;border-radius:10px;font-size:13px;font-weight:600;white-space:nowrap;display:flex;align-items:center;gap:8px}
.cm-tete .ret{height:38px;padding:0 12px}
.cm-tete .g{display:flex;flex-direction:column;gap:2px;margin-right:auto;min-width:0}
.cm-tete .meta{font-size:12px;color:var(--tx2);font-weight:600;white-space:nowrap}
.cm-tete .lgn{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.cm-tete h1{margin:0;font-size:26px;font-weight:800;letter-spacing:-.02em;color:var(--tx)}
.cm-p{font-size:12px;font-weight:700;padding:5px 10px;border-radius:7px;white-space:nowrap;background:var(--ep-neutre-f,var(--v08));color:var(--ep-neutre-t,var(--tx))}
.cm-p.a{background:var(--ep-ambre-f);color:var(--ep-ambre-t)}
.cm-p.r{background:var(--ep-rouge-f);color:var(--ep-rouge-t)}
.cm-tete button.go{height:44px;padding:0 20px;border-radius:11px;border:0;background:var(--sz-btn-prim,#8a5a2b);color:var(--sz-btn-prim-txt,#fff);font-size:14px;font-weight:800;gap:10px}
.cm-tete button.tenu{height:44px;padding:0 18px;border-radius:11px;border:1px dashed var(--ep-ambre-t);background:var(--ep-ambre-f);color:var(--ep-ambre-t);font-size:14px;font-weight:700;opacity:1!important;cursor:default}
.cm-st{position:relative}
.cm-menu{position:absolute;right:0;top:44px;z-index:20;min-width:220px;padding:6px;border-radius:12px;background:var(--f-carte);border:1px solid var(--v12);
  box-shadow:0 14px 34px -14px rgba(0,0,0,.45);display:flex;flex-direction:column;gap:2px}
.cm-menu button{height:34px;border:0;background:transparent;justify-content:flex-start;font-weight:600;padding:0 10px;border-radius:8px}
.cm-menu button:hover{background:var(--v05)}
.cm-grille{flex:1 1 0;min-height:0;display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:16px}
.cm-g{min-height:0;display:flex;flex-direction:column;gap:16px}
.cm-c{background:var(--f-carte);border:1px solid var(--v08);border-radius:16px;padding:16px 18px;display:flex;flex-direction:column;gap:10px;min-width:0}
.cm-c h2{margin:0;font-size:15px;font-weight:800;color:var(--tx);letter-spacing:0;text-transform:none}
.cm-art{flex:0 1 auto;min-height:0;gap:4px}
.cm-art .l{display:grid;grid-template-columns:56px minmax(0,1fr) 60px 110px;gap:14px;align-items:center}
.cm-art .th{flex:none;font-size:11px;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em;padding-bottom:8px;border-bottom:1px solid var(--v08)}
.cm-lignes{flex:0 1 auto;min-height:0;overflow:hidden}
.cm-art .r{height:77px;box-sizing:border-box;border-bottom:1px solid var(--v06)}
.cm-art .ph{width:56px;height:56px;border-radius:10px;background:var(--ep-neutre-f,var(--v08));color:var(--ep-neutre-t,var(--tx));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;overflow:hidden}
html.jour .cm-av .cad{background:#a14e00}
.cm-art.dense .r{height:55px}
.cm-art.dense .ph{width:40px;height:40px;font-size:14px}
.cm-art .ph img{width:100%;height:100%;object-fit:cover}
.cm-art .nm{display:flex;flex-direction:column;gap:3px;min-width:0}
.cm-art .nm b{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm-art .nm span{font-size:12px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm-art .q{text-align:center;font-weight:700}
.cm-art .m{text-align:right;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
.cm-art .m small{display:block;font-size:11px;font-weight:500;color:var(--tx2)}
.cm-art .rb{font-size:11px;font-weight:700;padding:1px 7px;border-radius:99px;background:var(--ep-ambre-f);color:var(--ep-ambre-t);margin-left:6px}
.cm-pag{flex:none;display:flex;align-items:center;gap:8px;padding:8px 0 4px}
.cm-pag button{width:30px;height:28px;border-radius:7px;padding:0}
.cm-pag span{font-size:12px;color:var(--tx2);white-space:nowrap}
.cm-pag .tot{margin-left:auto;font-weight:700;padding:4px 10px;border-radius:99px;background:var(--ep-neutre-f);color:var(--ep-neutre-t)}
.cm-tot{flex:none;display:grid;grid-template-columns:auto 110px;gap:6px 14px;padding-top:10px;font-size:13px;margin-left:auto;min-width:320px}
.cm-tot span{color:var(--tx2);white-space:nowrap}
.cm-tot span.v{text-align:right;color:var(--tx);font-variant-numeric:tabular-nums}
.cm-tot b{font-size:15px;font-weight:800;border-top:1px solid var(--v08);padding-top:8px;white-space:nowrap}
.cm-tot b.v{text-align:right;font-variant-numeric:tabular-nums}
.cm-chr{flex:none}
.cm-chr .cm-et{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
.cm-chr .cm-et div{display:flex;flex-direction:column;gap:6px;min-width:0}
.cm-chr .cm-et i{height:6px;border-radius:99px;background:var(--v08)}
.cm-chr .cm-et .fait i{background:var(--sz-btn-prim,#8a5a2b)}
.cm-chr .cm-et .cours i{background:var(--ep-ambre-t)}
html.jour .cm-chr .cm-et .cours i{background:#c25e00}
.cm-chr .cm-et b{font-size:12px;font-weight:700;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm-chr .cm-et .fait b,.cm-chr .cm-et .cours b{color:var(--tx)}
.cm-chr .cm-et span{font-size:11px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm-cote{min-height:0;display:flex;flex-direction:column;gap:14px;overflow:hidden}
.cm-cli{display:flex;align-items:center;gap:12px}
.cm-cli .n{display:flex;flex-direction:column;margin-right:auto;min-width:0}
.cm-cli .n b{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm-cli .n span,.cm-c .co{font-size:12px;color:var(--tx2)}
.cm-c .co{font-size:13px;overflow-wrap:anywhere}
.cm-cli button{height:32px;padding:0 10px;border-radius:8px;font-size:12px;font-weight:600;white-space:nowrap}
.cm-pl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px 14px;font-size:13px}
.cm-pl h2{grid-column:span 2}
.cm-pl span{color:var(--tx2);white-space:nowrap}
.cm-pl strong{font-weight:600;overflow-wrap:anywhere}
.cm-note{background:var(--ep-ambre-f);border-color:var(--v08);gap:6px;padding:14px 18px}
.cm-note b{font-size:13px;font-weight:800;color:var(--ep-ambre-t)}
.cm-note span{font-size:13px;color:var(--tx);line-height:1.5}
.cm-rb{gap:6px;font-size:12px}
.cm-rb .x{display:flex;justify-content:space-between;gap:10px;color:var(--tx2)}
.cm-rb .x b{color:var(--tx);font-variant-numeric:tabular-nums;white-space:nowrap}
.cm-cote .gestes{display:flex;gap:8px;margin-top:auto}
.cm-cote .gestes button{flex:1;height:38px;justify-content:center}
.cm-cote .gestes button.sup{color:var(--ep-rouge-t)}
.cm button:disabled{opacity:.55;cursor:default}
/* ══ LA FICHE PLUS ÉPURÉE (2026-11-22, 9.1.2 — sa capture : « refait le détail plus épuré ») ══════════════════════
   Moins de boîtes, moins de contours : les cartes deviennent des surfaces sans bordure ; client, paiement et livraison
   n'en font plus qu'UNE ; les gestes secondaires sont des boutons sans cadre ; le total a un trait continu ; la
   chronologie ne coupe plus ses libellés (« Commande p… »). */
.cm{gap:12px}
.cm-c{border-color:transparent;background:var(--v03);border-radius:14px;padding:16px 18px}
.cm-tete{gap:8px}
.cm-tete h1{font-size:24px}
.cm-p{font-size:11px;padding:4px 9px;border-radius:99px}
.cm-tete button:not(.go):not(.tenu):not(.ret){height:36px;padding:0 12px;border:0;background:transparent;color:var(--tx2);font-weight:600}
.cm-tete button:not(.go):not(.tenu):not(.ret):hover:not(:disabled){background:var(--v06);color:var(--tx)}
.cm-tete button.go,.cm-tete button.tenu{height:40px;padding:0 16px;font-size:13px}
.cm-tete button.tenu{border-style:solid;border-color:transparent}
.cm-art .th{border-bottom-color:var(--v06)}
.cm-art .r{border-bottom-color:var(--v04,var(--v06))}
.cm-art .ph{width:48px;height:48px;border-radius:12px}
.cm-art .l{grid-template-columns:48px minmax(0,1fr) 60px 110px}
.cm-tot{column-gap:0;min-width:300px}
.cm-tot span.v,.cm-tot b.v{padding-left:24px}
.cm-tot b{border-top-color:var(--v08)}
.cm-chr{gap:12px}
.cm-chr .cm-et{gap:10px}
.cm-chr .cm-et i{height:4px}
.cm-chr .cm-et b{white-space:normal;overflow:visible;line-height:1.25;font-size:12px}
.cm-chr .cm-et span{white-space:normal;overflow:visible;font-size:11px}
.cm-fiche{gap:0;padding:0}
.cm-fiche>div{padding:14px 18px}
.cm-fiche>div+div{border-top:1px solid var(--v06)}
.cm-fiche h2{font-size:12px;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}
.cm-fiche .cm-pl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 14px;font-size:13px}
.cm-fiche .cm-pl h2{grid-column:span 2;margin-bottom:2px}
.cm-note{background:transparent;border:0;border-left:3px solid var(--ep-ambre-t);border-radius:0 10px 10px 0;padding:8px 14px}
.cm-note b{font-size:11px;text-transform:uppercase;letter-spacing:.05em}
.cm-cote .gestes{gap:4px;justify-content:flex-end}
.cm-cote .gestes button{flex:0 0 auto;height:34px;padding:0 12px;border:0;background:transparent;color:var(--tx2);font-weight:600}
.cm-cote .gestes button:hover:not(:disabled){background:var(--v06);color:var(--tx)}
.cm-cote .gestes button.sup{color:var(--ep-rouge-t)}
/* ══ LA FICHE VIVANTE (2026-11-23, 9.2.9 — sa capture : « pas beau et non épuré » ; piste B choisie : « B est parfait »)
   Maquette : https://claude.ai/artifact/FgEi6vpiz8qV7dB7j8bky2 (artboard Vivant). Quatre tuiles colorées (le cycle --vv du
   look vivant, C + D du 2026-11-20 ; le statut garde les trois tons : neutre, ambre qui attend, rouge annulée), cartes en
   relief, gestes en vrais boutons, taille et couleur en pastilles, chronologie verticale dans la colonne de droite. */
.cm{gap:14px}
.cm-c{background:var(--f-carte);border:1px solid var(--v08);border-radius:16px;box-shadow:0 14px 30px -18px rgba(0,0,0,.55),inset 0 1px 0 var(--v03)}
html.jour .cm-c{box-shadow:0 10px 24px -16px rgba(20,30,50,.22)}
.cm-tete{align-items:flex-end;gap:10px}
.cm-tete h1{font-size:28px}
.cm-tete button:not(.go):not(.tenu):not(.ret){height:38px;padding:0 13px;border:1px solid var(--v10);background:var(--f-carte);color:var(--tx);border-radius:10px}
.cm-tete button:not(.go):not(.tenu):not(.ret):hover:not(:disabled){background:var(--f-carte2);color:var(--tx)}
.cm-tete button.go{height:44px;padding:0 18px;font-size:14px;box-shadow:0 10px 22px -10px color-mix(in srgb,var(--sz-btn-prim,#c9a27a) 85%,transparent)}
.cm-tete button.tenu{height:44px;font-size:14px}
.cm-tuiles{flex:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.cm-tu{--cm-teinte:var(--vv-1,#5fd4a4);min-width:0;border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:4px;
  background:color-mix(in srgb,var(--cm-teinte,var(--vv-1,#5fd4a4)) var(--vv-pct,20%),var(--f-carte));border:1px solid color-mix(in srgb,var(--cm-teinte,var(--vv-1,#5fd4a4)) 30%,var(--f-carte))}
.cm-tu.t2{--cm-teinte:var(--vv-2,#7cb4f5)}
.cm-tu.t4{--cm-teinte:var(--vv-3,#b49cf7)}
.cm-tu .k{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--cm-teinte,var(--vv-1,#5fd4a4))}
.cm-tu b{font-size:22px;font-weight:800;color:var(--tx);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm-tu b.p{font-size:16px;line-height:1.4}
.cm-tu>span:not(.k){font-size:12px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:16px}
.cm-tu.st{background:var(--ep-neutre-f);border-color:var(--v10)}
.cm-tu.st .k{color:var(--ep-neutre-t)}
.cm-tu.st.a{background:var(--ep-ambre-f);border-color:color-mix(in srgb,var(--ep-ambre-t) 30%,var(--ep-ambre-f))}
.cm-tu.st.a .k,.cm-tu.st.a b{color:var(--ep-ambre-t)}
.cm-tu.st.r{background:var(--ep-rouge-f);border-color:color-mix(in srgb,var(--ep-rouge-t) 30%,var(--ep-rouge-f))}
.cm-tu.st.r .k,.cm-tu.st.r b{color:var(--ep-rouge-t)}
.cm-art .th{color:var(--tx-or,var(--tx2))}
.cm-art .l{grid-template-columns:60px minmax(0,1fr) 44px 100px}
.cm-art .r{height:83px}
.cm-art .ph{width:60px;height:60px;border-radius:12px}
.cm-art.dense .l{grid-template-columns:40px minmax(0,1fr) 44px 100px}
.cm-art.dense .r{height:55px}
.cm-art.dense .ph{width:40px;height:40px}
.cm-art .nm>span{display:flex;align-items:center;gap:6px;overflow:hidden}
.cm-pa{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;background:var(--ep-neutre-f);color:var(--ep-neutre-t);white-space:nowrap}
.cm-pa i{width:8px;height:8px;border-radius:50%;flex:none;box-shadow:0 0 0 1px var(--v12)}
.cm-tot b.v{color:var(--tx-or,var(--tx))}
.cm-fiche{padding:14px 16px;gap:8px}
.cm-fiche>div{padding:0;display:flex;flex-direction:column;gap:8px}
.cm-fiche>div+div{border-top:0}
.cm-fiche .co{font-size:12px;color:var(--ep-neutre-t,var(--tx2));line-height:1.45}
.cm-fiche .cm-cli .cm-av{background:color-mix(in srgb,var(--vv-4,#f08fb8) 22%,var(--f-carte));color:var(--vv-4,#f08fb8)}
.cm-c h2{font-size:14px}
.cm-chv{flex:none;padding:14px 16px;gap:0}
.cm-chv h2{margin-bottom:10px}
.cm-note{background:var(--ep-ambre-f);border:1px solid color-mix(in srgb,var(--ep-ambre-t) 28%,var(--ep-ambre-f));border-radius:16px;padding:12px 16px}
.cm-rb{padding:14px 16px}
.cm-chv .e{display:grid;grid-template-columns:18px minmax(0,1fr);gap:0 10px;align-items:start;padding-bottom:10px}
.cm-chv .e:last-child{padding-bottom:0}
/* (2026-11-24, sa capture : « tu perds trop d'espace dans le bas ») LA PAGE PREND TOUTE LA HAUTEUR : la carte des articles
   s'étire (le total collé au pied), les lignes grandissent quand il y a de la place (vraies vignettes), et à droite la
   chronologie occupe ce qui reste, les gestes en bas. */
.cm-g>.cm-art{flex:1 1 auto}
.cm-art .cm-lignes{flex:1 1 auto}
.cm-art .cm-tot{margin-top:auto}
.cm-cote>.cm-chv{flex:1 1 auto}
.cm-cote>.gestes{margin-top:auto}
.cm-art.grand .r{height:118px}
.cm-art.grand .l{grid-template-columns:96px minmax(0,1fr) 60px 120px}
.cm-art.grand .ph{width:96px;height:96px;border-radius:14px;font-size:28px}
.cm-art.grand .nm b{font-size:16px}
.cm-art.grand .nm span{font-size:13px}
.cm-art.grand .m{font-size:16px}
.cm-chv .e i{width:18px;height:18px;border-radius:50%;box-sizing:border-box;border:2px solid var(--v12);display:flex;align-items:center;justify-content:center}
.cm-chv .e.fait i{background:var(--sz-btn-prim,#c9a27a);border-color:var(--sz-btn-prim,#c9a27a);color:var(--sz-btn-prim-txt,#1a1208)}
.cm-chv .e.cours i{border-color:var(--ep-ambre-t);background:var(--ep-ambre-f)}
.cm-chv .e b{font-size:13px;font-weight:700;color:var(--tx);line-height:18px}
.cm-chv .e.cours b{color:var(--ep-ambre-t)}
.cm-chv .e.avenir b{font-weight:600;color:var(--tx3,var(--tx2))}
.cm-chv .e b span{display:block;font-size:11px;font-weight:500;color:var(--tx2);line-height:1.3}
.cm-cote .gestes{gap:8px;margin-top:0;justify-content:stretch}
.cm-cote .gestes button{flex:1 1 0;height:38px;justify-content:center;border:1px solid var(--v10);background:var(--f-carte);color:var(--tx);border-radius:10px}
.cm-cote .gestes button:hover:not(:disabled){background:var(--f-carte2);color:var(--tx)}
.cm-cote .gestes button.sup{border-color:color-mix(in srgb,var(--ep-rouge-t) 35%,var(--f-carte));color:var(--ep-rouge-t)}
/* Le verrou, dans la bande du haut : un cadenas et un nom, plus une phrase. */
.sz-verrou-puce{display:inline-flex;align-items:center;gap:6px;padding:3px 10px 3px 8px;border-radius:99px;background:var(--v06);color:var(--tx2);font-size:12px;font-weight:600;white-space:nowrap}
.sz-verrou-puce svg{flex:none;opacity:.85}
.sz-verrou-puce.autre{background:var(--ep-ambre-f,rgba(201,140,40,.16));color:var(--ep-ambre-t,#e0a24a)}

/* ══ LA VUE KANBAN (2026-11-18, relooking — ajout choisi par elle) ════════════════════════════════
   Une colonne par statut ; glisser une carte = le MÊME geste qu'un clic droit › statut (flowStatut :
   aperçu du site, confirmation, mêmes refus). ⚠ AUCUNE GLISSIÈRE (sa règle) : les cartes qui ne tiennent
   pas dans la colonne sont MESURÉES et cachées, et « + k autres » ouvre la liste filtrée sur ce statut. */
.kb{display:flex;flex-direction:column;min-height:0}
.kb-cols{flex:1 1 0;min-height:0;display:grid;grid-template-columns:repeat(var(--kb-n,5),minmax(0,1fr));
  grid-template-rows:minmax(0,1fr);gap:.6rem}
/* ⚠ MESURÉ (capture, 30 commandes) : en « flex 1 1 auto » et sans borne de rangée, la grille prenait la hauteur de
   son CONTENU — la colonne débordait sous la fenêtre et la mesure ne voyait jamais de dépassement. */
.cx-liste.kb{min-height:0;overflow:hidden}
/* ⚠ MESURÉ : une règle du socle sur les enfants de la carte (flex 0 1 auto) l'emportait sur .kb-cols — d'où la
   spécificité ici. */
.cx-liste.kb>.kb-cols{flex:1 1 0;min-height:0}
.kb-col{display:flex;flex-direction:column;min-height:0;min-width:0;border:1px solid var(--v08);border-radius:12px;
  background:var(--f-carte2);padding:.5rem}
.kb-col>header{display:flex;align-items:center;justify-content:space-between;gap:.4rem;padding:.15rem .25rem .45rem;
  font-size:.8rem;white-space:nowrap}
.kb-col>header b{overflow:hidden;text-overflow:ellipsis}
.kb-ct{flex:none;min-width:1.6rem;height:1.2rem;padding:0 .35rem;border-radius:99px;display:inline-flex;align-items:center;
  justify-content:center;font-size:.7rem;font-weight:800;background:var(--v08);color:var(--tx2)}
.kb-ct.a{background:rgba(245,158,11,.18);color:var(--tx-att)}
/* ⚠ banc-texte-sur-fond : var(--tx2) sur var(--v08) = 4,27 le jour — assombri, teinte gardée. */
html.jour .kb-ct{color:#454f5c}
.kb-cartes{flex:1 1 auto;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:.4rem}
.kb-carte{flex:none;border:1px solid var(--v10);border-radius:10px;background:var(--f-carte);padding:.45rem .55rem;cursor:grab;
  display:flex;flex-direction:column;gap:.15rem;min-width:0}
.kb-carte[hidden]{display:none}
.kb-carte.tenue{cursor:not-allowed;opacity:.72}
.kb-carte.prise{opacity:.45}
.kb-carte .l1{display:flex;align-items:baseline;gap:.4rem;min-width:0}
.kb-carte .l1 b{flex:1 1 auto;min-width:0;font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kb-carte .l1 span{flex:none;font-size:.78rem;font-variant-numeric:tabular-nums}
.kb-carte .l2{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap;font-size:.7rem;color:var(--tx2)}
.kb-carte .rf-pill{font-size:.64rem;padding:.05rem .45rem}
.kb-col.cible{border-color:var(--or);box-shadow:inset 0 0 0 1px var(--or)}
.kb-plus{flex:none;margin-top:.4rem;align-self:stretch}
.kb-exp .kb-vide{flex:1 1 auto;display:flex;align-items:center;justify-content:center;text-align:center;padding:.6rem;
  font-size:.74rem;color:var(--tx2);border:1px dashed var(--v16);border-radius:10px}
.cx-liste.kb{padding:.6rem;display:flex;flex-direction:column}

.et{font-size:.6875rem;padding:.06rem .45rem;border-radius:99px;white-space:nowrap;
  border:1px solid var(--v16);color:var(--tx2)}
.et.vert{border-color:rgba(74,222,128,.45);color:var(--tx-ok)}
.et.bleu{border-color:rgba(96,165,250,.5);color:var(--tx-bleu)}
.et.jaune{border-color:rgba(245,158,11,.5);color:var(--tx-or2)}
.et.rouge{border-color:rgba(248,113,113,.5);color:var(--tx-f6a5a5)}

.pagi{flex:0 0 auto;display:flex;align-items:center;gap:.5rem;padding-top:.45rem;
  margin-top:.35rem;border-top:1px solid var(--v07);
  font-size:.78rem;color:var(--tx2);flex-wrap:wrap}
.pagi .pos{margin-left:auto}
.pagi select{width:auto;padding:.14rem .35rem;font-size:.76rem}

/* ── Le detail d une commande ── */
.det2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.8rem;margin-top:.55rem}
.bloc h3{margin:0 0 .25rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.08em;color:var(--tx2);font-weight:700}
.bloc .l{font-size:.85rem}
/* Le nom, la pastille et « Changer » sur UNE ligne alignee (2026-10-01) : le
   bouton, plus haut que la ligne, mordait sur celle d en dessous. */
.bloc .l:has(#det-lier){display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
#det-lier{padding:.1rem .5rem;font-size:.72rem;line-height:1.3}
.bloc .mut{color:var(--tx2);font-size:.8rem;line-height:1.5}
.badge2{display:inline-block;font-size:.6875rem;padding:.04rem .45rem;border-radius:99px;
  margin-left:.4rem;vertical-align:1px;background:rgba(148,163,184,.18);color:var(--tx-bleute)}
.badge2.or{background:#f59e0b;color:#1a1a2e;font-weight:700}
.badge2.vertf{background:#166534;color:#dcfce7;font-weight:700}
select.statut{width:auto;font-size:.78rem;padding:.16rem .4rem}
.totaux{display:flex;justify-content:flex-end;gap:2.2rem;font-size:.84rem;
  margin-top:.6rem;border-top:1px solid var(--v08);padding-top:.55rem}
.totaux .d{text-align:right}
.totaux .tt{font-weight:700;margin-top:.2rem}
.bas2{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2.2rem;align-items:start;
  margin-top:.6rem;border-top:1px solid var(--v08);padding-top:.55rem}
.bas2 .totaux{margin-top:0;border-top:0;padding-top:0}
.bas2 .remb{margin-top:0}
/* (2026-10-25, audit) Freres de la .liste paginee dans la carte du detail : ils gardent leur hauteur. */
.carte.plein>.totaux,.carte.plein>.bas2,.carte.plein>.det-notes{flex:0 0 auto}
/* Un trait discret, pas un pointille AMBRE : un remboursement n est pas une
   alerte (la couleur ne dit qu un probleme — 2026-09-29). */
.remb{margin-top:.7rem;border-top:1px solid var(--v10);padding-top:.45rem}
tbody tr.coche td{background:rgba(var(--or-rgb),.1)}
/* LA CHRONOLOGIE (2026-10-27, sa demande) : les gestes datés, en colonne dans l en-tête (la place à droite de la
   livraison était vide) — la liste des articles garde toute sa hauteur. Un point par geste, reliés par un trait. */
.det2.a3{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.1fr)}
.chv{display:flex;flex-direction:column;gap:.18rem;font-size:.76rem}
.chv .ce{position:relative;display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:.5rem;align-items:center}
.chv .ce::before{content:"";position:absolute;left:5px;top:-.55rem;height:.7rem;width:2px;background:rgba(var(--or-rgb),.45)}
.chv .ce:first-child::before{display:none}
.chv .ce b{width:12px;height:12px;border-radius:99px;background:var(--f-carte);border:2px solid var(--tx-or);box-sizing:border-box}
.chv .ce:last-child b{background:var(--tx-or)}
.chv .ce.rb b{border-color:var(--tx-att)}
.chv .ce .l{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chv .ce .d{color:var(--tx2);white-space:nowrap;font-size:.72rem}
.chv .plus{color:var(--tx2);font-size:.72rem;padding-left:1.25rem}
.remb .t{font-size:.69rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx-att);margin-bottom:.25rem}
.remb .lg2{display:flex;justify-content:space-between;gap:1rem;font-size:.8rem;
  padding:.18rem 0;border-bottom:1px solid var(--v05)}
.remb .fin3{text-align:right;font-size:.8rem;font-weight:700;color:var(--tx-att);margin-top:.3rem}
.banniere{flex:0 0 auto;background:#7f1d1d;color:var(--tx-sur-accent);border-radius:9px;
  padding:.5rem .8rem;font-size:.82rem;line-height:1.5}
button.danger{border-color:rgba(239,68,68,.55);color:var(--tx-f6a5a5)}
button.danger:hover:not(:disabled){background:rgba(239,68,68,.15);border-color:#ef4444}

/* ── Menu contextuel (clic droit sur une ligne) ── */
.ctx{position:fixed;z-index:60;background:var(--f-carte);border:1px solid var(--v16);
  border-radius:10px;box-shadow:0 14px 34px rgba(0,0,0,.5);padding:.3rem;min-width:210px}
.ctx .t{font-size:.6875rem;text-transform:uppercase;letter-spacing:.07em;
  color:var(--tx2);padding:.28rem .5rem;font-weight:700}
.ctx button{display:block;width:100%;text-align:left;border:none;
  background:transparent;padding:.3rem .5rem;border-radius:6px;font-size:.83rem}
.ctx button:hover{background:var(--v08)}
.ctx .warn{background:#7f1d1d;color:var(--tx-sur-accent);border-radius:6px;padding:.5rem .65rem;
  font-size:.79rem;line-height:1.5;max-width:290px;margin:.2rem}

/* Confirmations : un voile, jamais une boite du systeme (elle s ouvrirait
   DERRIERE la fenetre, comme le decompte d inactivite l a fait). */
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.5rem;z-index:50}
.voile .boite{background:var(--f-carte);border:1px solid var(--v12);
  border-radius:13px;padding:1.1rem 1.25rem;max-width:36rem;width:100%;
  max-height:84vh;overflow-y:auto}
.voile h3{margin:0 0 .55rem;font:700 1.05rem/1.25 Georgia,serif}
.voile p{margin:.35rem 0;font-size:.86rem;line-height:1.5}
.voile ul{font-size:.83rem;color:var(--tx-bleute);line-height:1.7;margin:.5rem 0 0;padding-left:1.1rem}
.voile li.item{list-style:none;background:var(--v05);border-radius:6px;
  padding:.3rem .6rem;margin:.25rem 0}
.voile label.rc{display:flex;align-items:flex-start;gap:.5rem;margin-top:.9rem;
  font-size:.82rem;line-height:1.5;cursor:pointer;background:rgba(245,158,11,.1);
  border:1px solid rgba(245,158,11,.4);border-radius:8px;padding:.5rem .65rem}
.voile label.rc input{width:auto;margin-top:2px}
.voile .fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem}
/* Rattachement a un client : le champ de recherche et ses resultats. */
.voile input.rech{width:100%;padding:.42rem .6rem;border-radius:8px;
  border:1px solid var(--v18);margin-top:.25rem}
.voile .lres{max-height:250px;overflow-y:auto;display:flex;flex-direction:column;
  gap:.35rem;margin-top:.55rem}
.voile .lres .cli{display:flex;justify-content:space-between;align-items:center;
  gap:.8rem;padding:.45rem .6rem;background:var(--v05);
  border:1px solid var(--v12);border-radius:7px;cursor:pointer}
.voile .lres .cli:hover{border-color:var(--or);background:rgba(var(--or-rgb),.12)}
.voile .lres .cli .nm{font-weight:600;font-size:.85rem}
.voile .lres .cli .em{font-size:.76rem;color:var(--tx2)}
.voile .lres .cli .fl{font-size:.74rem;color:var(--tx-or);white-space:nowrap}
.voile .lres .rien{padding:.5rem .2rem;color:var(--tx2);font-size:.83rem}
.voile .detacher{margin-top:.8rem;padding-top:.6rem;
  border-top:1px solid var(--v10)}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid var(--v08);
  background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.actions{flex:0 0 auto;display:flex;gap:.4rem}
.vide{padding:1.6rem 1rem;text-align:center;color:var(--tx2);font-size:.86rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète. `mode` vaut 'commandes' (en cours) ou 'expeditions' (parties).
 */
function pageCommandes(mode) {
  const brut = String(mode || '');
  const idDetail = brut.indexOf('@') > 0 ? brut.slice(brut.indexOf('@') + 1) : '';
  const mBase = brut.indexOf('@') > 0 ? brut.slice(0, brut.indexOf('@')) : brut;
  const m = (mBase === 'expeditions') ? 'expeditions' : 'commandes';
  const depart = JSON.stringify(m + (idDetail ? '@' + idDetail : ''));
  /* ⚠⚠ LE T() EST ECRIT A LA MAIN ICI, ET C EST OBLIGE. Cette ligne vit AVANT
     le litteral de gabarit : `${…}` n y interpole pas, il s afficherait en
     toutes lettres. Le poseur le signale (« hors du gabarit ») et n y touche
     pas — a dessein. Sans ce geste, l onglet et le grand titre restaient
     « Commandes » sur toute la page anglaise. */
  const titre = (m === 'expeditions') ? T('Expéditions') : T('Commandes');
  // ⚠ CE FICHIER DESSINE DEUX ECRANS, et son pictogramme est donc CALCULE — le
  // seul du lot. Il porte un trace comme les autres, pas un emoji.
  const icone = (m === 'expeditions') ? ICO.shipping : ICO.orders;
  return `${TETE()}
<title>${titre} ${T("— Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${icone}</span><h1 id="titre">${titre}</h1>
  <span class="cx-resume" id="c-resume"></span>
  <span class="sous" id="sous"></span>
  <div class="cx-actions" id="c-actions"></div></div>
<div class="corps" id="corps"></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions" id="actions"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var actions = document.getElementById('actions');
  var sous = document.getElementById('sous');

  var MODE = ${depart};
  // << mode@identifiant >> : la fenetre s ouvre directement sur ce detail.
  var DET_DEPART = '';
  if (MODE.indexOf('@') > 0) { DET_DEPART = MODE.slice(MODE.indexOf('@') + 1); MODE = MODE.slice(0, MODE.indexOf('@')); }
  // ⚠ TROISIEME SEGMENT << @lier >> : ouvre d emblee l ecran de rattachement.
  // Le banc ne CLIQUE pas — sans identifiant d ouverture, un ecran qui ECRIT
  // reste invisible au controle. C est l angle mort de #32, pas une commodite.
  var LIER_DEPART = false;
  /* « id@supprimer » (2026-10-13) : le clic droit du tableau de bord ouvre le detail et LANCE la suppression —
     son aperçu (tout ce qui part) puis sa confirmation, exactement comme le bouton Supprimer du detail. */
  var SUPPR_DEPART = false;
  if (DET_DEPART.indexOf('@supprimer') > 0) {
    SUPPR_DEPART = true;
    DET_DEPART = DET_DEPART.slice(0, DET_DEPART.indexOf('@supprimer'));
  }
  if (DET_DEPART.indexOf('@lier') > 0) {
    LIER_DEPART = true;
    DET_DEPART = DET_DEPART.slice(0, DET_DEPART.indexOf('@lier'));
  }
  window.szIntention = function(q){
    if (q === 'supprimer' && DET && DET.droits && DET.droits.supprimer && VUE === 'detail') flowSupprimer();
  };
  var CTX = null;
  var DONNEES = null;                       // derniere page recue
  // ⚠ L ETAT DU FILTRE VIT ICI, HORS DE LA LISTE : elle est redessinee a chaque
  // frappe, et lire les champs au moment de paginer ne rendrait que l affichage.
  // Auto par defaut : autant de lignes que la hauteur reelle, jamais de glissiere.
  var F = { q: '', statuts: [], annee: 'all', prioritaires: false, manuelles: false, page: 0, parPage: 20, auto: true };
  /* L AFFICHAGE COMPACT (2026-10-12, sa demande : « ajoute-moi aussi un mode compact dans les commandes »), le
     meme que l Inventaire et Produits en vente : une ligne par commande, retenu sur le poste (sous garde). */
  var COMPACT = false;
  /* LES ACTIONS GROUPÉES (2026-10-27, puis 2026-10-29 : sa demande « cases toujours visibles, partout où ça fait
     gagner du temps ») : la pièce commune du socle (szCoches). Les coches vivent dans CK : une page qui change ne
     les perd pas. Le jeu d actions dépend de la liste (Commandes ou Expéditions) — voir lotCoches. */
  var CK = null;
  try { COMPACT = localStorage.getItem('sz-cmd-compact') === '1'; } catch (e) {}
  /* (2026-11-18) La vue Kanban, retenue sur le poste — Commandes seulement (Expéditions reste une liste). */
  var KANBAN = false;
  try { KANBAN = localStorage.getItem('sz-cmd-kanban') === '1'; } catch (e) {}
  function KB(){ return KANBAN && MODE !== 'expeditions'; }
  var enCours = false;
  var VUE = 'liste';        // 'liste' | 'detail'
  // Ouverte par << mode@identifiant >>, la fenetre EST un detail : pas de
  // << Liste >>, et fermer le detail ferme la fenetre (demande le 2026-08-07 :
  // le detail s ouvre dans une fenetre native separee).
  var SEUL = !!DET_DEPART;
  var DET = null, DET_ID = '';
  var VERROU_PRIS = false;  // le detail tient le verrou 'orders'
  var VERROU_PAR = '';      // tenu par quelqu un d autre -> lecture seule

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl, ci){ szDire(t, cl, ci); }
  /* ⚠ Le symbole change de COTE en anglais : << $12.50 >>. Voir szArgent (socle). */
  function argent(n){ return szArgent(n); }
  function dateCourte(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('${LIEU()}', { day: 'numeric', month: 'long', year: 'numeric' });
  }


  /* La preuve de paiement posée par le serveur : vérifiée (vert), en attente (ambre), refusée (rouge). */
  var PV_MOTIFS = {
    sans_paiement: '${T("aucun paiement")}', paiement_inferieur: '${T("montant payé inférieur au total")}',
    sous_plancher: '${T("montant trop bas pour les articles commandés")}', paiement_deja_utilise: '${T("paiement déjà rattaché à une autre commande")}',
    paiement_introuvable: '${T("paiement introuvable chez Square")}', commande_vide: '${T("commande vide")}',
    verification_impossible: '${T("vérification impossible pour le moment")}',
    // Commandes liées à une intention (phase B, 2026-10-11) : le serveur relit le paiement au cent près.
    intention_invalide: '${T("intention de paiement absente ou déjà utilisée")}', commande_modifiee: '${T("commande modifiée après le calcul du total")}',
    square_injoignable: '${T("Square injoignable — vérification reportée")}', base_injoignable: '${T("base de données injoignable — vérification reportée")}',
    paiement_statut: '${T("paiement non complété chez Square")}', paiement_montant: '${T("montant payé différent du total calculé")}',
    paiement_devise: '${T("paiement dans une autre devise que le dollar canadien")}', paiement_rembourse: '${T("paiement déjà remboursé")}',
    paiement_lieu: '${T("paiement fait à un autre point de vente Square")}', paiement_en_trop: '${T("paiement inscrit sur une commande sans montant à payer")}',
    carte_cadeau: '${T("carte-cadeau introuvable")}', carte_cadeau_solde: '${T("solde de la carte-cadeau insuffisant")}',
    carte_cadeau_ecart: '${T("carte-cadeau déjà débitée d’un autre montant")}', carte_cadeau_ecriture: '${T("débit de la carte-cadeau non enregistré")}',
    credit: '${T("crédit demandé sans compte client")}', credit_solde: '${T("crédit du compte insuffisant")}',
    credit_ecart: '${T("crédit déjà débité d’un autre montant")}', credit_ecriture: '${T("débit du crédit non enregistré")}',
    points: '${T("points demandés sans compte client")}', points_solde: '${T("points du compte insuffisants")}',
    points_ecart: '${T("points déjà débités d’un autre nombre")}', points_ecriture: '${T("débit des points non enregistré")}',
    // Le code promo compté par le serveur (2026-10-13) : un code à usage unique ne sert qu une fois.
    coupon_epuise: '${T("code promo déjà utilisé (usage unique épuisé)")}', coupon_ecriture: '${T("usage du code promo non enregistré")}'
  };
  function pvHtml(c){
    var v = c.paiementVerifie;
    if (v && v.ok) return '<div class="mut" style="margin-top:.35rem;color:var(--tx-ok)"><span class="ic">✓</span> ${T("Paiement vérifié par le serveur")}'
      + (v.couvert != null ? ' · ' + esc(szArgent(v.couvert)) : '') + '</div>';
    if (!v && !c.attentePaiement) return '';
    var motif = v && v.motif ? (PV_MOTIFS[v.motif] || esc(v.motif)) : '${T("pas encore vérifié")}';
    // Un vrai paiement est inscrit sur une commande refusée : vérifier À QUI il appartient avant de rembourser.
    var rbm = c.remboursementAVerifier && c.remboursementAVerifier.montant != null ? ' ' + esc(szArgent(c.remboursementAVerifier.montant)) : '';
    var rb = c.rembourseAuto ? ' · <strong>${T("paiement remboursé automatiquement")}</strong>' : c.remboursementAVerifier ?' · <strong>${T("paiement")}' + rbm + ' ${T("à vérifier avant tout remboursement")}</strong>' : '';
    var annulee = c.statut === 'cancelled';
    return '<div style="margin-top:.45rem;padding:.5rem .65rem;border-radius:8px;border:1px solid ' + (annulee ? 'var(--tx-err)' : 'var(--tx-att)') + ';color:' + (annulee ? 'var(--tx-err)' : 'var(--tx-att)') + ';font-size:.82rem">'
      + '<strong>' + (annulee ? '${T("Commande refusée : paiement non vérifié")}' : '${T("Paiement NON vérifié — ne pas expédier")}') + '</strong><br>' + motif + rb + '</div>';
  }

  var MOTIFS = {
  maj_en_cours: '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux commandes.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    version_coquille:   '${T("Cette version de l’application ne sait pas ouvrir cette fenêtre — quittez et relancez pour la mettre à jour.")}',
    introuvable:        '${T("Cette commande n’existe plus.")}',
    plafond_depasse: '${T("Ce remboursement dépasserait ce qui a été payé (ou les frais retenus). Rien n’a été remboursé.")}',
    commande_modifiee: '${T("La commande vient de recevoir un autre remboursement. Rouvrez-la pour voir le solde à jour ; rien n’a été remboursé.")}',
    droit_insuffisant: '${T("Le serveur refuse : votre rôle ne permet pas ce geste.")}',
    base_injoignable: '${T("La base de données ne répond pas. Rien n’a été remboursé — réessayez.")}',
    commande_introuvable: '${T("Commande introuvable sur le serveur.")}',
    square_indisponible: '${T("Aucun paiement Square lié à cette commande.")}',
    sans_facture:       '${T("Aucune facture liée à cette commande.")}',
    sans_paiement:      '${T("Aucun paiement Square associé à cette commande.")}',
    rien_a_rembourser:  '${T("Aucun frais retenu restant à rembourser.")}',
    serveur:            '${T("Suppression non confirmée par le serveur — réessayez.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (r && r.detail) return r.detail;
    return MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
  }

  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  function vide(titre, detail){
    corps.innerHTML = '<div class="carte plein"><div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div></div>';
    actions.innerHTML = '';
  }

  function libelleStatut(cle){
    var l = (CTX && CTX.statuts) || [];
    for (var i = 0; i < l.length; i++) if (l[i].cle === cle) return l[i].libelle;
    return cle || '—';
  }
  /* Les initiales du client, pour sa pastille (Marie Tremblay -> MT). */
  function initiales(nom){
    var m = String(nom || '').trim().split(' ').filter(Boolean);
    if (!m.length || m[0] === '—') return '?';
    return ((m[0][0] || '') + (m.length > 1 ? (m[m.length - 1][0] || '') : '')).toUpperCase();
  }
  /* Une couleur = un sens : ambre ce qui attend un geste, bleu ce qui avance,
     vert ce qui est fini, rouge ce qui est annule, gris le reste. */
  function tonStatut(cle){
    if (cle === 'delivered') return 'vert';
    if (cle === 'shipped' || cle === 'confirmed' || cle === 'verification') return 'bleu';
    if (cle === 'cancelled') return 'rouge';
    if (cle === 'pending' || cle === 'preparing') return 'ambre';
    return '';
  }
  function couleurStatut(cle){
    if (cle === 'delivered') return 'vert';
    if (cle === 'shipped') return 'bleu';
    if (cle === 'cancelled') return 'rouge';
    if (cle === 'pending' || cle === 'preparing') return 'jaune';
    return '';
  }

  // ══ DESSIN ════════════════════════════════════════════════════════════════
  function dessiner(){
    if (VUE === 'detail') { dessinerDetail(); return; }
    var d = DONNEES;
    var expedition = MODE === 'expeditions';

    /* ══ LA GRAMMAIRE DES FACTURES, APPLIQUEE A LA LISTE (2026-10-16, sa demande : « le meme look ») ═════
       Tete (resume, Corbeille a droite), les statuts en boutons a choix (le mot seul), puis le tableau et son
       panneau d appui (CSS_COMPTA). ⚠ AUCUNE BANDE DE CHIFFRES (sa regle, redite le 2026-10-16 : « retirer ces
       cellules partout, sauf dans le tableau de bord »). Les comptes du PONT (tuiles.compteStatuts...) ne
       servent plus qu au resume et au panneau. ⚠ La PAGE SEULE voyage : la pagination
       reste celle du site (.liste mesuree par listeAutoAjuste), pas data-pages.
       Crochets gardes : data-st, data-vider, data-tuile, data-prio, data-manu, data-prep, data-vue,
       tr[data-id], #rech, #f-annee, #c-corbeille, #pg-*. Le detail n est PAS touche (corps.corps). */
    corps.className = 'cx';
    var TU = (d && d.tuiles) || null;
    var cs = (TU && TU.compteStatuts) || {};
    var h = '';
    var nbEnCours = function(n){ return n > 1 ? '${T("{0} commandes en cours")}'.split('{0}').join(n) : (n + '${T(" commande en cours")}'); };
    var nbExped = function(n){ return n > 1 ? '${T("{0} commandes expédiées")}'.split('{0}').join(n) : (n + '${T(" commande expédiée")}'); };

    /* ── LA TETE : le resume a gauche ; la Corbeille a droite (#113 : « un petit bouton dans la page des
       commandes » — seulement dans Commandes, jamais dans Expeditions). ── */
    var resT = document.getElementById('c-resume');
    if (resT) resT.textContent = TU ? ((expedition ? nbExped(TU.nombre || 0) : nbEnCours(TU.nombre || 0))
      + ' · ' + argent(TU.valeurTotale || 0)) : '';
    var actT = document.getElementById('c-actions');
    /* (2026-11-18) LA FILE DE PRÉPARATION : « Lancer la préparation (N) » — N compté sur les statuts que la
       file prend (comptes du pont, liste entière) ; la commande elle-même est choisie AU CLIC par le site. */
    var nFile = 0; ['pending', 'confirmed', 'preparing', 'verification'].forEach(function(k){ nFile += (cs[k] || 0); });
    if (actT) actT.innerHTML = (expedition || EPD()) ? (EPD() && !expedition ? '<button class="mini" id="c-corbeille" title="${T("Voir les commandes supprimées et les remettre en place")}">${T("Corbeille")}</button>' : '') : (nFile ? '<button class="prim" id="c-file" '
      + 'title="${T("Ouvre la commande à préparer en premier — prioritaires d’abord, jamais une qu’un collègue tient ; « Commande suivante » enchaîne")}">'
      + '${T("Lancer la préparation")} (' + nFile + ')</button>' : '')
      + '<button class="mini" id="c-corbeille" '
      + 'title="${T("Voir les commandes supprimées et les remettre en place")}">${T("Corbeille")}</button>';

    /* ── LA BARRE : les statuts en boutons a choix (plusieurs a la fois, comme avant) — « Toutes » defait
       le filtre —, Prioritaires (son « ! ») et Ventes manuelles a cote ; a droite, la recherche, la
       bascule d affichage et l annee. ── */
    /* (2026-11-18, relooking phase 2) Le compte de chaque statut DANS son onglet — montré sous Épuré seulement
       (.ed-seg .ct, socle). Comptes du pont (tuiles.compteStatuts), pris AVANT recherche et filtres : l'onglet dit
       l'état du magasin. Ambre pour ce qui attend une action, neutre sinon ; un zéro s'efface sans disparaître. */
    var ST_A_FAIRE = ['confirmed', 'preparing', 'verification'];   // = STATUTS_A_TRAITER du site (admin.js) : le rail compte les mêmes
    function ctOnglet(n, aFaire){
      if (n == null) return '';
      return '<span class="ct' + (n > 0 && aFaire ? ' a' : '') + (n ? '' : ' z') + '" aria-hidden="true">' + (n > 999 ? '999+' : n) + '</span>';
    }
    var stats = ((CTX && CTX.statuts) || []).filter(function(s){
      // Chaque liste ne propose que SES statuts : offrir << Livrée >> dans
      // Commandes donnerait toujours zero resultat, et l on chercherait pourquoi.
      return expedition ? (s.cle === 'shipped' || s.cle === 'delivered')
                        : (s.cle !== 'shipped' && s.cle !== 'delivered');
    });
    if (EPD()) {
      /* LE PRINCIPE « MONDAY » : les vues en onglets, puis UNE barre (maquette validée le 2026-11-18). Mêmes crochets que la
         barre d'avant (data-st, data-vider, data-prio, data-manu, data-vue, #rech, #c-file) : l'écouteur délégué ne change pas. */
      var nSel = F.statuts.length;
      var vueB = function(v, lib, on){ return '<button type="button" role="tab" aria-selected="' + on + '" class="' + (on ? 'on' : '') + '" data-vue="' + v + '">' + lib + '</button>'; };
      h += '<div class="mo-vues" role="tablist" aria-label="${T("Affichage de la liste")}">'
        + vueB('detail', '${T("Tableau principal")}', !COMPACT && !KB())
        + vueB('compact', '${T("Liste compacte")}', COMPACT && !KB())
        + (expedition ? '' : vueB('kanban', '${T("Kanban")}', KB()))
        + '</div>';
      h += '<div class="mo-outils">'
        + (!expedition && nFile ? '<button class="prim" id="c-file" title="${T("Ouvre la commande à préparer en premier — prioritaires d’abord, jamais une qu’un collègue tient ; « Commande suivante » enchaîne")}">${T("Lancer la préparation")} (' + nFile + ')</button><span class="mo-sep"></span>' : '')
        + '<label class="rf-rch mo-rch">${ICO.loupe}<input id="rech" aria-label="${T("Rechercher une commande")}" autocomplete="off" placeholder="${T("Rechercher")}" value="' + esc(F.q) + '"></label>'
        + '<span class="mo-fil"><button type="button" class="mo-o' + (nSel ? ' actif' : '') + '" data-mo-filtre="1" aria-haspopup="menu" aria-expanded="' + MO_FILTRE + '">'
        +   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8z"/></svg>${T("Filtrer")}' + (nSel ? '<span class="nb">' + nSel + '</span>' : '') + '</button>'
        + (MO_FILTRE ? '<div class="mo-pop" role="menu">'
            + '<button type="button" role="menuitemcheckbox" class="' + (nSel ? '' : 'on') + '" data-vider="1"><span>${T("Toutes")}</span>' + (TU ? '<span class="ct">' + (TU.nombre || 0) + '</span>' : '') + '</button>'
            + stats.map(function(s){
                var n = TU ? (cs[s.cle] || 0) : null;
                return '<button type="button" role="menuitemcheckbox" class="' + (F.statuts.indexOf(s.cle) >= 0 ? 'on' : '') + '" data-st="' + esc(s.cle) + '"><span>' + esc(szTd(s.libelle)) + '</span>'
                  + (n == null ? '' : '<span class="ct' + (n > 0 && ST_A_FAIRE.indexOf(s.cle) >= 0 ? ' a' : '') + '">' + n + '</span>') + '</button>'; }).join('')
            + '</div>' : '')
        + '</span>'
        + '<button type="button" class="mo-o' + (F.prioritaires ? ' actif' : '') + '" data-prio="1" title="${T("N’afficher que les commandes prioritaires")}">'
        +   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10M12 19h.01"/></svg>${T("Prioritaires")}</button>'
        + (expedition ? '' : '<button type="button" class="mo-o' + (F.manuelles ? ' actif' : '') + '" data-manu="1" title="${T("N’afficher que les ventes saisies à la caisse, quel que soit leur statut")}">'
        +   '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h4M7 14h7"/></svg>${T("Ventes manuelles")}</button>')
        + '<span class="droite">'
        + (expedition && CTX && (CTX.annees || []).length ? '<select id="f-annee" aria-label="${T("Année")}"><option value="all"' + (F.annee === 'all' ? ' selected' : '') + '>${T("Toutes")}</option>'
            + CTX.annees.map(function(a){ return '<option value="' + a + '"' + (String(F.annee) === String(a) ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select>' : '')
        + '</span></div>';
    } else {
    h += '<div class="cx-barre"><div class="ed-seg">'
      + '<button type="button" class="' + (F.statuts.length ? '' : 'on') + '" data-vider="1">${T("Toutes")}' + ctOnglet(TU ? TU.nombre : null, false) + '</button>'
      + stats.map(function(s){
          return '<button type="button" class="' + (F.statuts.indexOf(s.cle) >= 0 ? 'on' : '')
            + '" data-st="' + esc(s.cle) + '">' + esc(szTd(s.libelle)) + ctOnglet(TU ? (cs[s.cle] || 0) : null, ST_A_FAIRE.indexOf(s.cle) >= 0) + '</button>'; }).join('')
      + '</div>'
      + '<button class="rf-jet prio' + (F.prioritaires ? ' on' : '') + '" data-prio="1" '
      + 'title="${T("N’afficher que les commandes prioritaires")}">'
      + '${T("Prioritaires")}<span class="prio-pill" aria-hidden="true">!</span></button>'
      /* LES VENTES MANUELLES (2026-10-15, sa demande) : saisies a la caisse, elles sont livrees d office et
         n apparaissaient donc jamais dans Commandes. Le filtre les montre TOUTES, quel que soit l onglet. */
      + '<button class="rf-jet' + (F.manuelles ? ' on' : '') + '" data-manu="1" '
      + 'title="${T("N’afficher que les ventes saisies à la caisse, quel que soit leur statut")}">'
      + '${T("Ventes manuelles")}</button>'
      + '<div class="droite">'
      + '<label class="rf-rch">${ICO.loupe}<input id="rech" aria-label="${T("Rechercher une commande")}" autocomplete="off" placeholder="${T("Numéro de commande, nom, courriel")}'
      + (expedition ? '${T(", suivi")}' : '') + '…" value="' + esc(F.q) + '"></label>'
      + '<span class="vue-bascule" role="group" aria-label="${T("Affichage de la liste")}">'
      +   '<button type="button" data-vue="detail" aria-label="${T("Affichage détaillé")}" aria-pressed="' + (!COMPACT && !KB()) + '" class="' + (!COMPACT && !KB() ? 'on' : '') + '" title="${T("Affichage détaillé")}">'
      +     '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2.5" width="12" height="4.5" rx="1.2"/><rect x="2" y="9" width="12" height="4.5" rx="1.2"/></svg></button>'
      +   '<button type="button" data-vue="compact" aria-label="${T("Affichage compact : une ligne par commande, plus de commandes par page")}" aria-pressed="' + (COMPACT && !KB()) + '" class="' + (COMPACT && !KB() ? 'on' : '') + '" title="${T("Affichage compact : une ligne par commande, plus de commandes par page")}">'
      +     '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3.5h12M2 6.5h12M2 9.5h12M2 12.5h12"/></svg></button>'
      + (expedition ? '' : '<button type="button" data-vue="kanban" aria-label="${T("Vue Kanban : une colonne par statut, glisser une commande pour changer son statut")}" aria-pressed="' + KB() + '" class="' + (KB() ? 'on' : '') + '" title="${T("Vue Kanban : une colonne par statut, glisser une commande pour changer son statut")}">'
      +     '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="3.6" height="11" rx="1"/><rect x="6.2" y="2.5" width="3.6" height="7.5" rx="1"/><rect x="10.9" y="2.5" width="3.6" height="9.5" rx="1"/></svg></button>')
      + '</span>';
    if (expedition && CTX && (CTX.annees || []).length) {
      h += '<select id="f-annee" aria-label="${T("Année")}">'
        + '<option value="all"' + (F.annee === 'all' ? ' selected' : '') + '>${T("Toutes")}</option>'
        + CTX.annees.map(function(a){
            return '<option value="' + a + '"' + (String(F.annee) === String(a) ? ' selected' : '')
              + '>' + a + '</option>'; }).join('')
        + '</select>';
    }
    h += '</div></div>';
    }

    /* ── LE TABLEAU ── */
    var ck = lotCoches();
    var t = '<div class="cx-carte cx-liste">' + ck.barre();
    if (!d || !d.lignes.length) {
      t += '<div class="vide">' + (F.q || F.statuts.length || F.annee !== 'all' || F.prioritaires || F.manuelles
        ? '${T("Aucune commande ne correspond à ces filtres.")}'
        : (expedition ? '${T("Aucune commande expédiée.")}' : '${T("Aucune commande en cours.")}')) + '</div>';
    } else {
      t += '<div class="liste' + (COMPACT ? ' compacte' : '') + '"><table><thead><tr>'
        + ck.th()
        + '<th>${T("Client et commande")}</th>'
        + (expedition ? '<th>${T("Suivi")}</th>' : '<th class="c">${T("Articles")}</th>')
        + '<th class="d">${T("Total")}</th><th>${T("Statut")}</th><th class="c"></th>'
        + '</tr></thead><tbody>';
      d.lignes.forEach(function(o){
        // ⚠ Etiquetee mais pas partie : la ligne se teinte. C est l etat qui se
        // perd le plus facilement, entre l impression et le depot au comptoir.
        var attente = o.aUneEtiquette && o.statut !== 'shipped' && o.statut !== 'delivered';
        t += '<tr class="' + (attente ? 'attente' : '') + ck.classe(o) + (EN_SUPP[o.id] ? ' sz-supp' : '') + '" data-id="' + esc(o.id)
          + '" style="cursor:pointer" title="${T("Clic : détails · clic droit : changer le statut")}">'
          + ck.td(o)
          + '<td><div class="rf-prod"><span class="rf-av" aria-hidden="true">' + esc(initiales(o.client)) + '</span>'
          +   '<div style="min-width:0"><div class="rf-nom">' + esc(o.client)
          +     (o.prioritaire ? ' <span class="rf-pill ambre" title="${T("Traitement prioritaire")}">${T("Prioritaire")}</span>' : '')
          // Vente saisie a la caisse (2026-10-15, sa demande) : rien a preparer, on la reconnait d un coup d oeil.
          +     (o.manuelle ? ' <span class="rf-pill bleu" title="${T("Vente saisie à la caisse")}">${T("Manuelle")}</span>' : '')
          // Vente d un encan en direct (2026-10-23) : canal TikTok, vente finale.
          +     (o.tiktok ? ' <span class="rf-pill ambre" title="${T("Vente d’un encan en direct — vente finale, aucun retour")}">TikTok</span>' : '')
          +     (attente ? ' <span class="rf-pill bleu">${T("étiquette prête")}</span>' : '') + '</div>'
          +   '<div class="rf-sous"><span class="rf-code">' + esc(o.numero) + '</span><span>·</span><span>'
          +     esc(dateCourte(o.date)) + '</span>' + (o.ville ? '<span>·</span><span>' + esc(o.ville) + '</span>' : '')
          +   '</div></div></div></td>'
          + (expedition
              ? '<td>' + (o.suivi ? '<span class="rf-code">' + esc(o.suivi) + '</span>'
                                  : '<span class="det">${T("sans numéro")}</span>') + '</td>'
              : '<td class="c">' + o.articles + ' ' + (o.articles > 1 ? '${T("articles")}' : '${T("article")}') + '</td>')
          + '<td class="d"><span class="rf-mont">' + argent(o.total) + '</span></td>'
          + '<td><span class="rf-pill ' + tonStatut(o.statut) + '">'
          + esc(szTd(libelleStatut(o.statut))) + '</span></td>'
          /* ⚠ UN SEUL BOUTON, DEUX ETATS (demande le 2026-08-07 : << il y a trop
             de boutons differents a ce niveau >>). Verrou tenu par QUICONQUE —
             soi compris, sa propre fenetre de preparation ouverte est un
             traitement en cours — la ligne dit 🔒 En traitement, et par qui.
             Libre : 📦 Preparer la commande, qui ouvre l assistant. Et AUCUN
             bouton sur une commande expediee ou livree. */
          + '<td class="c">'
          + (expedition || o.statut === 'shipped' || o.statut === 'delivered' ? ''
             : (o.enTraitement
                ? '<button class="mini ligne-geste traite" disabled><span class="ic">🔒</span> ${T("En traitement")}' + (o.par ? '${T(" par ")}' + esc(o.par) : '') + '</button>'
                : (CTX.peutEditer
                   ? '<button class="mini ligne-geste" data-prep="' + esc(o.id) + '"><span style="filter:grayscale(1)"><span class="ic">📦</span></span> ${T("Préparer la commande")}</button>' : '')))
          + '</td></tr>';
      });
      t += '</tbody></table></div>';

      t += '<div class="pagi"><span>${T("Afficher")}</span>'
        + '<select id="pg-taille" aria-label="${T("Nombre de commandes par page")}">'
        + '<option value="auto"' + (F.auto ? ' selected' : '') + '>Auto</option>'
        + [10, 20, 50, 100].map(function(n){
            return '<option value="' + n + '"' + (!F.auto && F.parPage === n ? ' selected' : '') + '>' + n + '</option>';
          }).join('')
        + '</select><span>${T("par page")}</span>'
        + '<span class="pos">'
        + '<button class="mini" id="pg-prec"' + (d.page <= 0 ? ' disabled' : '') + '>${T("← Préc.")}</button>'
        + ' ' + (d.page * d.parPage + 1) + '–' + Math.min((d.page + 1) * d.parPage, d.total)
        + '${T(" sur ")}' + d.total + ' '
        + '<button class="mini" id="pg-suiv"' + (d.page >= d.pages - 1 ? ' disabled' : '') + '>${T("Suiv. →")}</button>'
        + '</span></div>';
    }
    t += '</div>';
    if (KB()) t = '<div class="cx-carte cx-liste kb">' + kanban(d, stats) + '</div>';
    else if (MAQ()) t = vueMaquette(d, ck);

    /* ── LE PANNEAU D APPUI : ou en sont les commandes, et ce qui presse — tout depuis les chiffres deja
       recus (tuiles du pont) ; aucune donnee de plus. Absent sur un vieux site. ── */
    if (TU) {
      var tot = TU.nombre || 0;
      var piste = function(lib, n, ton){
        var v = tot > 0 ? Math.max(0, Math.min(100, n / tot * 100)) : 0;
        return '<div class="cx-ligne"><span>' + lib + '</span><div class="cx-piste"><i' + (ton ? ' class="' + ton + '"' : '')
          + ' style="width:' + v.toFixed(0) + '%"></i></div><span>' + n + '</span></div>';
      };
      var p = '<div class="cx-carte">'
        + '<h2>' + (expedition ? '${T("Où en sont les envois")}' : '${T("Où en sont les commandes")}') + '</h2>'
        + stats.map(function(s){
            var ton = s.cle === 'delivered' ? 'ok' : (s.cle === 'shipped' ? 'info' : (s.cle === 'cancelled' ? 'err' : ''));
            return piste(esc(szTd(s.libelle)), cs[s.cle] || 0, ton);
          }).join('');
      if (!expedition) {
        var nP = d.prioritairesNonTraitees || 0, nE = TU.etiquettesPretes || 0;
        p += '<div class="cx-sep"></div><h2>${T("À faire")}</h2>';
        if (nP) p += '<div class="cx-averti" data-tuile="prio" title="${T("Cliquer pour filtrer")}"><span>'
          + esc(nP > 1 ? '${T("{0} commandes prioritaires non traitées.")}'.split('{0}').join(nP) : '${T("1 commande prioritaire non traitée.")}') + '</span></div>';
        if (nE) p += '<div class="cx-info"><span>'
          + esc(nE > 1 ? '${T("{0} étiquettes prêtes, pas encore parties.")}'.split('{0}').join(nE) : '${T("1 étiquette prête, pas encore partie.")}') + '</span></div>';
        if (!nP && !nE) p += '<div class="cx-bon"><span>${T("Rien ne presse.")}</span></div>';
      }
      p += '</div>';
      /* (2026-11-18, sa capture : « tout est trop pogné ») En Épuré, la liste compacte et le Kanban prennent toute la largeur :
         le panneau d'appui répète ce que disent déjà « Filtrer » et les colonnes. */
      h += MAQ() ? t : (EPD() && (COMPACT || KB()) ? t.replace('cx-carte cx-liste', 'cx-carte cx-liste seule') : '<div class="cx-deux">' + t + p + '</div>');   // la maquette n'a pas de panneau d'appui
    } else {
      h += t.replace('cx-carte cx-liste', 'cx-carte cx-liste seule');
    }
    corps.innerHTML = h;
    ck.apres();

    actions.innerHTML = '';
    brancher();
    listeAutoAjuste();
    if (KB()) { kanbanAjuste(); kanbanBrancher(); }
    if (MAQ()) {
      setTimeout(mqAjuste, 0); setTimeout(mqAjuste, 600);
      // ⚠ La police embarquée arrive après le premier dessin (rangées plus hautes) : on remesure à son arrivée.
      try { if (document.fonts && !window.__mqPol) { window.__mqPol = 1; document.fonts.addEventListener('loadingdone', function(){ mqAjuste(); }); } } catch (e) {}
    }
    else corps.ondragstart = corps.ondragend = corps.ondragover = corps.ondrop = null;
  }

  /* ══ LA VUE KANBAN (2026-11-18) — une colonne par statut du mode Commandes, et « Expédier » ══ */

  /* ══ COMMANDES FIDÈLE À LA MAQUETTE (Épuré) — la vue « Détaillé » de ce jeu ══════════════════════════════ */
  var MO_FILTRE = false;   // (Monday) le panneau « Filtrer » est ouvert
  function MAQ(){ return MODE !== 'expeditions' && !COMPACT && !KB() && document.documentElement.getAttribute('data-sz-theme') === 'epure'; }
  var MQ_OUVERT = 'prep', MQ_PG = 0, MQ_CAP = 10;
  var MQ_GROUPES = [
    { cle: 'prep', nom: '${T("À préparer")}', st: ['pending', 'confirmed'], ton: '#e8a35b', a: true, det: '${T("les plus anciennes d’abord")}' },
    { cle: 'cours', nom: '${T("En préparation")}', st: ['preparing', 'verification'], ton: '#e8a35b', a: true, det: '${T("préparation et vérification en cours")}' },
    { cle: 'annulees', nom: '${T("Annulées")}', st: ['cancelled'], ton: '#c9ced8', a: false, det: '${T("plus rien à faire")}' }
  ];
  var MQ_TRANSP = { 'postes-canada': '${T("Postes Canada")}', 'purolator': 'Purolator', 'fedex': 'FedEx', 'ups': 'UPS', 'ramassage': '${T("Ramassage")}', 'canpar': 'Canpar' };
  function mqTransp(k){ k = String(k || ''); if (!k) return '—'; return MQ_TRANSP[k] || (k.charAt(0).toUpperCase() + k.slice(1).replace(/-/g, ' ')); }
  function mqRecue(iso){
    var d = new Date(iso); if (isNaN(d)) return { t: '—', v: false };
    var n = new Date(), j = Math.floor((n - d) / 86400000);
    var hh = d.getHours() + ' h' + (d.getMinutes() ? ' ' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() : '');
    if (d.toDateString() === n.toDateString()) return { t: '${T("auj.")} ' + hh, v: false };
    var hier = new Date(n); hier.setDate(n.getDate() - 1);
    if (d.toDateString() === hier.toDateString()) return { t: '${T("hier")} ' + hh, v: false };
    return { t: '${T("il y a {0} j")}'.split('{0}').join(Math.max(2, j)), v: j >= 2 };
  }
  function mqLignes(d, g){
    return ((d && d.lignes) || []).filter(function(o){ return g.st.indexOf(o.statut) >= 0; })
      .sort(function(a, b){ return (b.prioritaire ? 1 : 0) - (a.prioritaire ? 1 : 0) || String(a.date).localeCompare(String(b.date)); });
  }
  function mqLigne(o, g, ck){
    var r = mqRecue(o.date);
    var act = '';
    if (o.statut !== 'cancelled') {
      /* (2026-11-22, 9.1.2, sa capture : « pas beau… un petit cadenas, épuré ») Plus de bouton en pointillé : un cadenas et
         le nom, sans cadre ; la phrase complète reste en infobulle. */
      if (o.enTraitement) act = '<span class="tenu-puce" title="' + esc((o.par || '${T("Quelqu’un")}') + ' ${T("prépare")}') + '">'
        + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>'
        + esc(o.par || '${T("Quelqu’un")}') + '</span>';
      else if (CTX && CTX.peutEditer && o.statut !== 'pending') act = '<button type="button" class="prep" data-prep="' + esc(o.id) + '">${T("Préparer")}</button>';
    }
    return '<tr class="' + ck.classe(o) + (EN_SUPP[o.id] ? ' sz-supp' : '') + '" data-id="' + esc(o.id) + '" style="--mq-ton:' + g.ton + '" title="${T("Clic : détails · clic droit : changer le statut")}">'
      + '<td class="b"><i></i></td>' + ck.td(o)
      + '<td class="no">' + esc(o.numero) + '</td>'
      /* (2026-11-23, sa capture : « pas beau ») Plus de pastille dans la cellule : la règle Épuré « une pastille seule =
         cellule pleine » la peignait en brun et la centrait. Le « ! » rond des Prioritaires, devant le nom, à gauche. */
      + '<td class="cl' + (o.prioritaire ? ' prio' : '') + '"><span class="mq-cl">' + (o.prioritaire ? '<span class="prio-pill" title="${T("Traitement prioritaire")}">!</span>' : '')
      +   '<span class="nm">' + esc(o.client) + '</span></span></td>'
      + '<td class="' + (r.v ? 'vieille' : '') + '">' + esc(r.t) + '</td>'
      + '<td class="mt">' + argent(o.total) + '</td>'
      /* (Monday) Les états en CELLULES PLEINES, trois tons : ambre (attend), rouge (annulée), neutre (le reste). */
      + '<td class="mo-etat ' + (o.statut === 'pending' ? 'a' : (o.statut === 'cancelled' ? 'r' : 'n')) + '">' + (o.statut === 'pending' ? '${T("En attente")}' : (o.statut === 'cancelled' ? '${T("Annulée")}' : '${T("Payée")}')) + '</td>'
      + (function(){ var lv = o.manuelle ? '${T("Comptoir")}' : mqTransp(o.transporteur); return '<td class="' + (lv && lv !== '—' ? 'mo-etat n' : '') + '">' + esc(lv) + '</td>'; })()
      + '<td class="act">' + act + '</td></tr>';
  }
  function vueMaquette(d, ck){
    var h = '<div class="mq">' + ck.barre();
    var tous = (d && d.lignes) || [];
    if (!tous.length) return h + '<div class="mq-vide">' + (F.q || F.statuts.length || F.prioritaires || F.manuelles ? '${T("Aucune commande ne correspond à ces filtres.")}' : '${T("Aucune commande en cours.")}') + '</div></div>';
    var vus = MQ_GROUPES.filter(function(g){ return mqLignes(d, g).length; });
    if (!vus.some(function(g){ return g.cle === MQ_OUVERT; })) { MQ_OUVERT = vus[0].cle; MQ_PG = 0; }
    vus.forEach(function(g){
      var l = mqLignes(d, g);
      if (g.cle === MQ_OUVERT) {
        var pages = Math.max(1, Math.ceil(l.length / MQ_CAP)); if (MQ_PG > pages - 1) MQ_PG = pages - 1;
        var debut = MQ_PG * MQ_CAP, page = l.slice(debut, debut + MQ_CAP);
        h += '<section class="mq-g ouvert"><div class="mq-gt"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>'
          + '<h2>' + g.nom + '</h2><span>' + l.length + ' ' + (l.length > 1 ? '${T("commandes")}' : '${T("commande")}') + ' · ' + g.det + '</span></div>'
          + '<div class="mq-carte"><div class="mq-lignes"><table><colgroup><col style="width:4px"><col style="width:34px"><col style="width:160px"><col><col style="width:110px"><col style="width:110px"><col style="width:120px"><col style="width:16%"><col style="width:130px"></colgroup>'
          + '<thead><tr style="--mq-ton:' + g.ton + '"><th class="b"><i></i></th>' + ck.th() + '<th>${T("Commande")}</th><th>${T("Client")}</th><th>${T("Reçue")}</th><th class="mt">${T("Total")}</th><th>${T("Paiement")}</th><th>${T("Livraison")}</th><th></th></tr></thead><tbody>'
          + page.map(function(o){ return mqLigne(o, g, ck); }).join('') + '</tbody></table></div>'
          + '<div class="mq-pied"><button type="button" class="mini" data-mq-pg="-1" aria-label="${T("Page précédente")}"' + (MQ_PG <= 0 ? ' disabled' : '') + '>‹</button>'
          + '<button type="button" class="mini" data-mq-pg="1" aria-label="${T("Page suivante")}"' + (MQ_PG >= pages - 1 ? ' disabled' : '') + '>›</button>'
          + '<span>' + (debut + 1) + '–' + Math.min(debut + MQ_CAP, l.length) + '${T(" sur ")}' + l.length + ' · ${T("page")} ' + (MQ_PG + 1) + ' / ' + pages + '</span></div></div></section>';
      } else {
        h += '<button type="button" class="mq-replie" data-mq-g="' + g.cle + '" aria-expanded="false" style="--mq-ton:' + g.ton + '">'
          + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m9 6 6 6-6 6"></path></svg>'
          + '<span class="barre"></span><b>' + g.nom + '</b><span class="det">' + g.det + '</span>'
          + '<span class="nb' + (g.a ? ' a' : '') + '">' + l.length + '</span></button>';
      }
    });
    return h + '</div>';
  }
  /* La page MESURÉE : autant de lignes que la carte en tient (jamais de glissière). Redessine si la capacité change. */
  /* Le jeu de couleurs arrive APRÈS le chargement (la coquille le pose à did-finish-load) : on recharge dans la
     bonne vue dès qu'il change, au lieu d'attendre la relecture suivante. Et la page mesurée suit la fenêtre. */
  try {
    var _mqJeu = document.documentElement.getAttribute('data-sz-theme');
    new MutationObserver(function(){
      var j = document.documentElement.getAttribute('data-sz-theme');
      if (j !== _mqJeu) { _mqJeu = j; MQ_PG = 0; if (typeof charger === 'function' && VUE === 'liste') charger(true); else if (VUE === 'detail' && DET) dessiner(); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-sz-theme'] });
    var _mqT = null;
    window.addEventListener('resize', function(){ clearTimeout(_mqT); _mqT = setTimeout(mqAjuste, 120); });
    // ⚠ MESURÉ : la place change APRÈS le dessin (barre d'outils, police) — on observe la zone elle-même.
    if (window.ResizeObserver) new ResizeObserver(function(){ clearTimeout(_mqT); _mqT = setTimeout(mqAjuste, 60); }).observe(corps);
  } catch (e) {}
  function mqAjuste(){
    if (!MAQ()) return;
    var z = corps.querySelector('.mq-lignes'); if (!z) return;
    var th = z.querySelector('thead'), tr = z.querySelector('tbody tr');
    var hL = tr ? tr.getBoundingClientRect().height : 38; if (!(hL > 0)) hL = 38;
    var cap = Math.max(3, Math.floor((z.clientHeight - (th ? th.getBoundingClientRect().height : 34)) / hL));
    if (cap !== MQ_CAP) { MQ_CAP = cap; dessiner(); }
  }

  function kbCarte(o){
    var tire = !o.enTraitement && !!(CTX && CTX.peutEditer);
    return '<div class="kb-carte' + (o.enTraitement ? ' tenue' : '') + '" data-kb-id="' + esc(o.id) + '" draggable="' + tire + '"'
      + ' title="' + (o.enTraitement ? '${T("En traitement par")} ' + esc(o.par || '') : '${T("Glisser vers une autre colonne pour changer le statut · clic : détails")}') + '">'
      + '<div class="l1"><b>' + esc(o.client) + '</b><span>' + esc(argent(o.total)) + '</span></div>'
      + '<div class="l2"><span>' + esc(o.numero) + '</span>'
      + (o.prioritaire ? '<span class="rf-pill ambre">${T("Prioritaire")}</span>' : '')
      + (o.enTraitement ? '<span class="rf-pill bleu">' + esc(o.par || '${T("En traitement")}') + '</span>' : '')
      + '</div></div>';
  }
  function kanban(d, stats){
    var lignes = (d && d.lignes) || [];
    var aFaire = ['confirmed', 'preparing', 'verification'];
    var exp = !!(CTX && CTX.peutExpedier);
    var h = '<div class="kb-cols" style="--kb-n:' + (stats.length + (exp ? 1 : 0)) + '">';
    stats.forEach(function(s){
      var l = lignes.filter(function(o){ return o.statut === s.cle; });
      h += '<section class="kb-col" data-kb-col="' + esc(s.cle) + '"><header><b>' + esc(szTd(s.libelle)) + '</b>'
        + '<span class="kb-ct' + (l.length && aFaire.indexOf(s.cle) >= 0 ? ' a' : '') + '">' + l.length + '</span></header>'
        + '<div class="kb-cartes">' + l.map(kbCarte).join('') + '</div>'
        + '<button type="button" class="mini kb-plus" data-kb-plus="' + esc(s.cle) + '" hidden></button></section>';
    });
    if (exp) h += '<section class="kb-col kb-exp" data-kb-col="shipped"><header><b>${T("Expédier")}</b></header>'
      + '<div class="kb-vide">${T("Déposez une commande ici pour ouvrir l’expédition.")}</div></section>';
    return h + '</div>';
  }
  /* Les cartes qui ne tiennent pas sont cachées (mesure RÉELLE), et la colonne dit combien il en reste. */
  function kanbanAjuste(){
    Array.prototype.forEach.call(corps.querySelectorAll('.kb-col[data-kb-col]'), function(col){
      var z = col.querySelector('.kb-cartes'); if (!z) return;
      var plus = col.querySelector('.kb-plus');
      var cartes = z.querySelectorAll('.kb-carte');
      Array.prototype.forEach.call(cartes, function(c){ c.hidden = false; });
      if (plus) plus.hidden = true;
      if (z.scrollHeight <= z.clientHeight + 1) return;
      if (plus) { plus.hidden = false; plus.textContent = '+'; }   // sa place se prend sur les cartes
      var cache = 0;
      for (var i = cartes.length - 1; i >= 0 && z.scrollHeight > z.clientHeight + 1; i--) { cartes[i].hidden = true; cache++; }
      // puis on en rend tant qu'elles tiennent (le bouton apparu a pu fausser la première passe)
      while (cache > 0) { var r = cartes[cartes.length - cache]; r.hidden = false; if (z.scrollHeight > z.clientHeight + 1) { r.hidden = true; break; } cache--; }
      if (plus && cache) plus.textContent = '${T("+ {0} autres — voir la liste")}'.split('{0}').join(cache);
    });
  }
  function kanbanBrancher(){
    var tenu = '';
    corps.ondragstart = function(ev){
      var c = ev.target && ev.target.closest ? ev.target.closest('.kb-carte[draggable="true"]') : null;
      if (!c) return;
      tenu = c.getAttribute('data-kb-id');
      c.classList.add('prise');
      try { ev.dataTransfer.setData('text/plain', tenu); ev.dataTransfer.effectAllowed = 'move'; } catch (e) {}
    };
    corps.ondragend = function(){
      tenu = '';
      Array.prototype.forEach.call(corps.querySelectorAll('.kb-carte.prise,.kb-col.cible'), function(x){ x.classList.remove('prise', 'cible'); });
    };
    corps.ondragover = function(ev){
      var col = ev.target && ev.target.closest ? ev.target.closest('.kb-col[data-kb-col]') : null;
      if (!col || !tenu) return;
      ev.preventDefault();
      Array.prototype.forEach.call(corps.querySelectorAll('.kb-col.cible'), function(x){ if (x !== col) x.classList.remove('cible'); });
      col.classList.add('cible');
    };
    corps.ondrop = function(ev){
      var col = ev.target && ev.target.closest ? ev.target.closest('.kb-col[data-kb-col]') : null;
      if (!col || !tenu) return;
      ev.preventDefault();
      var id = tenu, cible = col.getAttribute('data-kb-col');
      corps.ondragend();
      var o = ((DONNEES && DONNEES.lignes) || []).filter(function(x){ return x.id === id; })[0];
      if (!o || o.statut === cible) return;
      if (o.enTraitement) { dire('${T("En traitement par")} ' + (o.par || '') + '.', 'att'); return; }
      flowStatut(id, o.statut, cible);   // LE MÊME GESTE qu'un clic droit › statut — aperçu, confirmation, refus
    };
  }


  /* ── PAGINATION AUTO : autant de lignes que la hauteur REELLE le permet —
     mesuree, jamais devinee. Stable : on ne recharge que si le compte differe. */
  var autoT = null;
  function listeAutoAjuste(){
    if (!F.auto || VUE !== 'liste') return;
    var g = corps.querySelector('.liste');
    if (!g) return;
    var th = g.querySelector('thead');
    var tr = g.querySelector('tbody tr');
    var hL = tr ? tr.offsetHeight : 0;
    if (!(hL > 0)) hL = 36;
    /* ⚠ LES LIGNES SONT DES CARTES ESPACEES (border-spacing, refonte du
       2026-09-25) : offsetHeight ne compte pas l espace entre elles. Sans
       l ajouter, Auto demanderait une ligne de trop et la derniere passerait
       sous le bas du cadre. */
    try {
      var tbE = g.querySelector('table');
      var esp = tbE ? parseFloat(String(getComputedStyle(tbE).borderSpacing || '').split(' ')[1]) : 0;
      if (esp > 0) hL += esp;
    } catch (e) {}
    var dispo = g.clientHeight - ((th && th.offsetHeight) || 30);
    if (!(dispo > 0)) return; // le banc mesure NaN : on ne touche a rien
    var n = Math.max(5, Math.floor(dispo / hL));
    if (isFinite(n) && n !== F.parPage) { F.parPage = n; F.page = 0; charger(); }
  }
  window.addEventListener('resize', function(){
    clearTimeout(autoT);
    autoT = setTimeout(listeAutoAjuste, 180);
  });

  // ══ DETAIL D UNE COMMANDE ═══════════════════════════════════════
  /* ══ LA FICHE « ÉPURÉ » (8.42.0) — Commande.dc.html, à la lettre ════════════════════════════════
     Mêmes données, mêmes gestes, mêmes règles (lecture seule sous verrou, droits) que la fiche
     habituelle : seule la mise en page change. Les autres jeux gardent la fiche d avant. */
  function EPD(){ return document.documentElement.getAttribute('data-sz-theme') === 'epure'; }
  var CM_PAGE = 0, CM_MENU = false;
  var CADENAS = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>';
  function cmEtapes(c, ro){
    var L = c.chronologie || [], st = c.statut;
    function quand(code){ for (var i = L.length - 1; i >= 0; i--) if (L[i].code === code) return L[i].le; return ''; }
    var apres = ['shipped', 'delivered', 'completed'].indexOf(st) >= 0;
    var etq = quand('etiquette'), exp = quand('expediee'), liv = quand('livree') || c.livreLe, fin = quand('terminee');
    var prep = (st === 'preparing' || st === 'verification') ? 'cours' : ((apres || etq) ? 'fait' : 'avenir');
    function e(l, q, etat){ return { l: l, q: q, etat: etat }; }
    return [
      e('${T("Commande passée")}', dateCourte(quand('passee') || c.creeLe), 'fait'),
      e(prep === 'cours' ? '${T("En préparation")}' : '${T("Préparation")}', prep === 'cours' ? (ro ? VERROU_PAR : '${T("en cours")}') : (prep === 'fait' ? '✓' : '${T("à faire")}'), prep),
      e('${T("Étiquette créée")}', etq ? dateCourte(etq) : '—', etq ? 'fait' : 'avenir'),
      e('${T("Expédiée")}', exp ? dateCourte(exp) : '—', (exp || apres) ? 'fait' : 'avenir'),
      e('${T("Livrée")}', liv ? dateCourte(liv) : '—', (liv || st === 'delivered' || st === 'completed') ? 'fait' : 'avenir'),
      e('${T("Terminée")}', fin ? dateCourte(fin) : '—', (fin || st === 'completed') ? 'fait' : 'avenir')
    ];
  }
  /* La pastille de couleur d'un article : un petit rond quand le nom est connu, rien sinon (jamais une teinte inventée). */
  var CM_TEINTES = { noir: '#1d1d1f', blanc: '#f4f4f2', ivoire: '#efe8d8', creme: '#efe3c8', beige: '#d8c3a0',
    gris: '#8b9099', marine: '#1f2f57', bleu: '#3b6fd8', 'bleu royal': '#3a63d6', 'bleu ciel': '#8cc2f0', vert: '#3f9a6b',
    kaki: '#7d7a4f', olive: '#6b6b2e', rouge: '#c8333a', bordeaux: '#7a1f2e', rose: '#e58fb0', fuchsia: '#d63a8a', violet: '#7d55c7',
    lilas: '#b79ee0', jaune: '#e8c440', moutarde: '#c99a2e', orange: '#e57f2e', corail: '#ee7d6b', brun: '#7a4e2d', caramel: '#b9814a',
    camel: '#c19a6b', taupe: '#8b7d6f', 'or': '#c9a227', argent: '#b8bcc4' };
  function cmTeinte(nom){ var k = String(nom || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); return CM_TEINTES[k] || ''; }
  function cmChronoVerticale(et){
    // Les étapes à venir en fin de parcours tiennent sur UNE ligne (« Étiquette créée, expédiée, livrée… »).
    var n = et.length; while (n > 0 && et[n - 1].etat === 'avenir') n--;
    var faites = et.slice(0, n), reste = et.slice(n);
    var COCHE = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>';
    var h = '<section class="cm-c cm-chv"><h2>${T("Chronologie")}</h2>' + faites.map(function(e){
      return '<div class="e ' + e.etat + '"><i>' + (e.etat === 'fait' ? COCHE : '') + '</i><b>' + esc(e.l) + '<span>' + esc(e.q) + '</span></b></div>'; }).join('');
    if (reste.length) h += '<div class="e avenir"><i></i><b>' + esc(reste.map(function(e, i){ return i ? e.l.charAt(0).toLowerCase() + e.l.slice(1) : e.l; }).join(', ')) + '</b></div>';
    return h + '</section>';
  }
  function dessinerDetailMaq(d, c, ro){
    var t = d.totaux, rb = d.remboursements;
    var resD = document.getElementById('c-resume'); if (resD) resD.textContent = '';
    actions.innerHTML = '';
    // La bande dit ce qu'est la fenêtre : le numéro est écrit une fois, en grand, dans la page (9.2.9).
    if (SEUL) { var tB = document.getElementById('titre'); if (tB) tB.textContent = '${T("Détail de commande")}'; }
    var h = '<div class="cm">';
    if (ro) {
      h += '<div class="cm-ban" role="status"><span class="cm-av">' + esc(initiales(VERROU_PAR)) + '<span class="cad">' + CADENAS + '</span></span>'
        + '<span class="tx"><b>' + esc('${T("{0} traite cette commande")}'.split('{0}').join(VERROU_PAR)) + '</b>'
        + '<span>${T("Statut, remboursement et suppression attendent que cette personne termine.")}</span></span>'
        + '<span class="dir"><i></i>${T("En direct")}</span></div>';
    }
    var src = c.manuelle ? '${T("au comptoir")}' : (c.tiktok ? 'TikTok' : '${T("boutique en ligne")}');
    var v = c.paiementVerifie;
    var tonS = c.statut === 'cancelled' ? ' r' : (['pending', 'confirmed', 'preparing', 'verification'].indexOf(c.statut) >= 0 ? ' a' : '');
    var peutPrep = CTX && CTX.peutEditer && ['confirmed', 'preparing', 'verification'].indexOf(c.statut) >= 0;
    h += '<header class="cm-tete">'
      + (SEUL ? '' : '<button type="button" class="ret" id="btn-retour">← ${T("Commandes")}</button>')
      + '<div class="g"><span class="meta">' + esc('${T("Passée le {0}")}'.split('{0}').join(dateCourte(c.creeLe))) + ' · ' + esc(src) + '</span>'
      + '<span class="lgn"><h1>' + esc(c.numero) + '</h1>'
      + (c.prioritaire ? '<span class="cm-p">${T("Prioritaire")}</span>' : '')
      + (c.venteFinale ? '<span class="cm-p">${T("Vente finale")}</span>' : '')
      + (rb.complet ? '<span class="cm-p">${T("Remboursée")}</span>' : '') + '</span></div>'
      + (d.droits.statut ? '<span class="cm-st"><button type="button" id="cm-statut"' + (ro ? ' disabled' : '') + ' aria-haspopup="menu" aria-expanded="' + (CM_MENU && !ro) + '">' + (ro ? CADENAS : '') + '${T("Changer le statut")}</button>'
          + (CM_MENU && !ro ? '<div class="cm-menu" role="menu">' + (d.statuts || []).filter(function(x){
              return x.cle !== c.statut && ['pending', 'cancelled'].indexOf(x.cle) < 0; }).map(function(x){
              return '<button type="button" role="menuitem" data-cm-st="' + esc(x.cle) + '">' + esc(szTd(x.libelle)) + '</button>'; }).join('') + '</div>' : '')
          + '</span>' : '')
      + (d.droits.bon ? '<button type="button" id="det-bon"' + (ro ? ' disabled' : '') + '>${T("Bon de commande")}</button>' : '')
      + (c.aFacture ? '<button type="button" id="det-fact">${T("Facture")}</button>' : '')
      + (ro ? '<button type="button" class="tenu" disabled>' + CADENAS.split('11').join('16') + esc('${T("En préparation par {0}")}'.split('{0}').join(VERROU_PAR)) + '</button>'
          : (peutPrep ? '<button type="button" class="go" id="cm-prep"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"></path><path d="M3 7.5 12 12l9-4.5M12 12v9"></path></svg>${T("Préparer la commande")}</button>' : ''))
      + '</header>';

    /* Articles : toutes les lignes sont posées, cmAjuste n en montre qu une page. */
    var unites = d.articles.reduce(function(n, a){ return n + (Number(a.qte) || 0); }, 0);
    /* ══ LES TUILES (9.2.9, piste B « Vivant ») : ce qu'on cherche d'un coup d'œil — combien, quoi, où en est-elle,
       où va-t-elle. Payée et le statut y vivent : la ligne du numéro ne les répète plus. */
    var verifie = v && v.ok;
    var payTx = rb.complet ? '${T("remboursée")}'
      : (c.attentePaiement || (v && !v.ok)) ? '${T("paiement en attente")}'
      : (c.paiementSquare ? '${T("payée")} · Square' + (c.afterpay ? ' · Afterpay' : '') + (verifie ? ' ${T("vérifié")}' : '') : '${T("aucun paiement Square")}');
    var enAttente = ['pending', 'confirmed', 'preparing', 'verification'].indexOf(c.statut) >= 0;
    var jours = Math.floor((Date.now() - new Date(c.creeLe).getTime()) / 86400000);
    var depuis = !enAttente ? '' : (!(jours >= 1) ? '${T("depuis aujourd’hui")}' : (jours === 1 ? '${T("depuis hier")}' : '${T("depuis {0} jours")}'.split('{0}').join(jours)));
    var ad = c.adresse || {};
    var livB = c.manuelle ? '${T("Au comptoir")}' : ([ad.ville, ad.province ? '(' + ad.province + ')' : ''].filter(Boolean).join(' ') || '—');
    var livS = c.manuelle ? '${T("remise sur place")}' : (c.suivi ? (c.suiviStatut || '${T("suivi")} ' + c.suivi) : (ad.cp || ''));
    h += '<div class="cm-tuiles">'
      + '<div class="cm-tu t1"><span class="k">${T("Total")}</span><b>' + argent(t.total) + '</b><span>' + esc(payTx) + '</span></div>'
      + '<div class="cm-tu t2"><span class="k">${T("Articles")}</span><b>' + d.articles.length + '</b><span>' + esc(unites + ' ' + szPl(unites, '${T("unité")}', '${T("unités")}')) + '</span></div>'
      + '<div class="cm-tu st' + tonS + '"><span class="k">${T("Statut")}</span><b class="p">' + esc(szTd(libelleStatut(c.statut))) + '</b><span>' + esc(depuis) + '</span></div>'
      + '<div class="cm-tu t4"><span class="k">${T("Livraison")}</span><b class="p">' + esc(livB) + '</b><span>' + esc(livS) + '</span></div>'
      + '</div>';
    h += '<div class="cm-grille"><div class="cm-g"><section class="cm-c cm-art">'
      + '<div class="l th"><span></span><span>${T("Article")}</span><span style="text-align:center">${T("Qté")}</span><span style="text-align:right">${T("Montant")}</span></div>'
      + '<div class="cm-lignes">' + d.articles.map(function(a){
          var pas = (a.taille && a.taille !== '—' ? '<span class="cm-pa">' + esc(a.taille) + '</span>' : '')
            + (a.couleur && a.couleur !== '—' ? '<span class="cm-pa">' + (cmTeinte(a.couleur) ? '<i style="background:' + cmTeinte(a.couleur) + '"></i>' : '') + esc(a.couleur) + '</span>' : '');
          return '<div class="l r"><span class="ph">' + (a.image ? '<img src="' + esc(a.image) + '" alt="">' : esc(String(a.nom || '?').trim().charAt(0).toUpperCase() || '?')) + '</span>'
            + '<span class="nm"' + (a.sku ? ' title="' + esc(a.sku) + '"' : '') + '><b>' + esc(a.nom) + '</b><span>' + pas
            + (a.rembourseQte > 0 ? '<span class="rb">' + a.rembourseQte + ' ' + szPl(a.rembourseQte, '${T("unité remboursée")}', '${T("unités remboursées")}') + '</span>' : '') + '</span></span>'
            + '<span class="q">' + a.qte + '</span>'
            + '<span class="m">' + argent(a.montant) + (a.qte > 1 ? '<small>' + argent(a.montant / a.qte) + ' ${T("/ unité")}</small>' : '') + '</span></div>';
        }).join('') + '</div>'
      + '<div class="cm-pag" hidden><button type="button" data-cm-pg="-1" aria-label="${T("Articles précédents")}">‹</button>'
      + '<button type="button" data-cm-pg="1" aria-label="${T("Articles suivants")}">›</button><span class="pos"></span>'
      + '<span class="tot">' + esc(d.articles.length + ' ' + szPl(d.articles.length, '${T("article")}', '${T("articles")}') + ' · ' + unites + ' ' + szPl(unites, '${T("unité")}', '${T("unités")}')) + '</span></div>';
    var tl = [];
    function lt(l, m){ tl.push('<span>' + l + '</span><span class="v">' + m + '</span>'); }
    lt('${T("Sous-total")}', argent(t.sousTotal));
    if (t.rabaisAuto > 0) lt('${T("Promotion automatique")}', '−' + argent(t.rabaisAuto));
    if (t.rabaisComptoir > 0) lt('${T("Rabais sur la vente")}', '−' + argent(t.rabaisComptoir));
    if (t.coupon > 0) lt('${T("Coupon")}', '−' + argent(t.coupon));
    if (t.livraison > 0) lt('${T("Livraison")}', argent(t.livraison));
    if (t.prioritaire > 0) lt('${T("Traitement prioritaire")}', argent(t.prioritaire));
    var tx = (t.taxes || []).reduce(function(n, x){ return n + (Number(x.montant) || 0); }, 0);
    if (tx > 0) lt(esc((t.taxes || []).map(function(x){ return x.nom; }).join(' ${T("et")} ')), argent(tx));
    if (t.carteCadeau > 0) lt('${T("Carte-cadeau")}', '−' + argent(t.carteCadeau));
    if (t.credit > 0) lt('${T("Crédit boutique")}', '−' + argent(t.credit));
    if (t.points > 0) lt('${T("Points de fidélité")}', '−' + argent(t.points));
    h += '<div class="cm-tot">' + tl.join('') + '<b>${T("Total")}</b><b class="v">' + argent(t.total) + '</b></div></section>';
    h += '</div>';

    /* La colonne de droite : client, paiement et livraison, note, remboursements, gestes. */
    var a = c.adresse || {};
    var adr = [a.rue, [a.ville, a.province ? '(' + a.province + ')' : '', a.cp].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    h += '<aside class="cm-cote"><section class="cm-c cm-fiche"><div><div class="cm-cli"><span class="cm-av">' + esc(initiales(c.client.nom)) + '</span>'
      + '<span class="n"><b>' + esc(c.client.nom || '—') + '</b><span>' + (c.membre ? '${T("membre")}' : '${T("invité")}')
      + (c.compte && c.compte.nom && c.compte.nom !== c.client.nom ? ' · ' + esc(c.compte.nom) : '') + (c.client.entreprise ? ' · ' + esc(c.client.entreprise) : '') + '</span></span>'
      + (d.droits.lier && !ro ? '<button type="button" id="det-lier">' + (c.compte ? '${T("Changer")}' : '${T("Lier")}') + '</button>' : '') + '</div>'
      + '<span class="co">' + esc([c.client.courriel, c.client.tel].filter(Boolean).join(' · ')) + '</span>'
      + (adr && !c.manuelle ? '<span class="co">' + esc(adr) + '</span>' : '')
      + (c.suivi ? '<span class="co">${T("Suivi")} ' + esc(c.suivi) + (c.suiviStatut ? ' · ' + esc(c.suiviStatut) : '') + '</span>' : '')
      + (pvHtml(c) && !(v && v.ok) ? '<div>' + pvHtml(c) + '</div>' : '')
      + '</div></section>'
      + cmChronoVerticale(cmEtapes(c, ro))
      + (c.notes ? '<section class="cm-c cm-note"><b>${T("Notes")}</b><span>' + esc(c.notes) + '</span></section>' : '')
      + (rb.lignes.length ? '<section class="cm-c cm-rb"><h2>${T("Remboursements")}</h2>'
          + rb.lignes.slice(-3).map(function(r){ return '<div class="x"><span>' + esc(r.numero) + ' · ' + esc(dateCourte(r.date)) + '</span><b>−' + argent(r.montant) + '</b></div>'; }).join('')
          + '<div class="x"><span>${T("Total remboursé")}</span><b>−' + argent(rb.total) + '</b></div></section>' : '')
      + '<div class="gestes">'
      + (d.droits.frais ? '<button type="button" id="det-frais"' + (ro ? ' disabled' : '') + '>${T("Frais retenus")}</button>' : '')
      + (d.droits.rembourser ? '<button type="button" id="det-remb"' + (ro ? ' disabled' : '') + '>↩ ${T("Rembourser")}</button>' : '')
      + (d.droits.supprimer ? '<button type="button" class="sup" id="det-suppr"' + (ro ? ' disabled' : '') + '>${T("Supprimer")}</button>' : '')
      + '</div></aside></div></div>';
    corps.className = 'corps';
    corps.innerHTML = h;
    brancherDetail();
    var bs = document.getElementById('cm-statut');
    if (bs) bs.onclick = function(ev){ ev.stopPropagation(); CM_MENU = !CM_MENU; dessiner(); };
    corps.onclick = function(ev){
      var m = ev.target.closest('[data-cm-st]');
      if (m) { CM_MENU = false; var cible = m.getAttribute('data-cm-st'); dessiner(); flowStatut(DET_ID, DET.commande.statut, cible, rechargerDetail); return; }
      var pg = ev.target.closest('[data-cm-pg]');
      if (pg) { CM_PAGE += Number(pg.getAttribute('data-cm-pg')); cmAjuste(); return; }
      if (ev.target.closest('#cm-prep')) { ouvrir('commandes:preparer', DET_ID, '${T("Préparation")}'); return; }
      if (CM_MENU && !ev.target.closest('.cm-menu')) { CM_MENU = false; dessiner(); }
    };
    setTimeout(cmAjuste, 0);
  }
  /* Autant d articles que la carte en tient ; le reste en pages (jamais de glissière). */
  function cmAjuste(){
    var z = corps.querySelector('.cm-lignes'); if (!z) return;
    var L = z.querySelectorAll('.r'), pag = corps.querySelector('.cm-pag');
    var sec = z.parentNode;
    L.forEach(function(r){ r.hidden = false; });
    pag.hidden = true; sec.classList.remove('dense');
    // Peu d articles : des lignes plus grandes (vignettes de 96 px), si TOUT tient encore — sinon la taille normale.
    sec.classList.add('grand');
    if (!L.length || L.length * L[0].offsetHeight > z.clientHeight) sec.classList.remove('grand');
    var hl = L.length ? L[0].offsetHeight : 77;
    var tient = Math.max(1, Math.floor(z.clientHeight / hl));
    // Trop d articles pour la carte : des lignes plus serrées d abord (vignettes de 40 px), les pages ensuite.
    if (L.length > tient) { sec.classList.add('dense'); hl = L[0].offsetHeight; tient = Math.max(1, Math.floor(z.clientHeight / hl)); }
    if (L.length > tient) {
      pag.hidden = false;
      tient = Math.max(1, Math.floor(z.clientHeight / hl));
    }
    var pages = Math.max(1, Math.ceil(L.length / tient));
    CM_PAGE = Math.max(0, Math.min(CM_PAGE, pages - 1));
    var de = CM_PAGE * tient;
    L.forEach(function(r, i){ r.hidden = i < de || i >= de + tient; });
    if (!pag.hidden) {
      pag.querySelector('.pos').textContent = '${T("Articles {0}–{1} sur {2} · page {3} / {4}")}'.split('{0}').join(de + 1)
        .split('{1}').join(Math.min(L.length, de + tient)).split('{2}').join(L.length).split('{3}').join(CM_PAGE + 1).split('{4}').join(pages);
      pag.querySelector('[data-cm-pg="-1"]').disabled = CM_PAGE === 0;
      pag.querySelector('[data-cm-pg="1"]').disabled = CM_PAGE >= pages - 1;
    }
  }
  try { if (window.ResizeObserver) new ResizeObserver(function(){ if (VUE === 'detail' && EPD()) cmAjuste(); }).observe(corps); } catch (e) {}

  function dessinerDetail(){
    if (DET && EPD()) { dessinerDetailMaq(DET, DET.commande, !!VERROU_PAR); return; }
    corps.className = 'corps';
    var resD = document.getElementById('c-resume'); if (resD) resD.textContent = '';
    var actD = document.getElementById('c-actions'); if (actD) actD.innerHTML = '';
    var d = DET;
    if (!d) {
      corps.innerHTML = '<div class="carte plein"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>';
      actions.innerHTML = SEUL ? '' : '<button id="btn-retour">${T("← Liste")}</button>';
      brancherDetail();
      return;
    }
    var c = d.commande;
    var ro = !!VERROU_PAR; // tenue par quelqu un d autre -> LECTURE SEULE
    var h = '';
    if (ro) {
      h += '<div class="banniere"><span class="ic">🔒</span> ${T("En traitement par")} <strong>' + esc(VERROU_PAR)
        + '</strong> ${T("— changement de statut, remboursement et suppression désactivés")} '
        + '${T("le temps que cette personne termine.")}</div>';
    }
    h += '<div class="carte">'
      + '<div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">'
      + '<strong style="font-size:1rem">${T("Commande")} <span class="num">' + esc(c.numero) + '</span></strong>';
    if (d.droits.statut && !ro) {
      // ⚠ MEME REGLE QUE LA FICHE DU SITE : ni << En attente >> ni << Annulee >>
      // dans le selecteur, sauf si c est deja le statut courant.
      h += '<select class="statut" id="det-statut" aria-label="${T("Statut de la commande")}">'
        + (d.statuts || []).filter(function(x){
            return ['pending', 'cancelled'].indexOf(x.cle) < 0 || x.cle === c.statut;
          }).map(function(x){
            return '<option value="' + esc(x.cle) + '"' + (x.cle === c.statut ? ' selected' : '')
              + '>' + esc(szTd(x.libelle)) + '</option>'; }).join('')
        + '</select>';
    } else {
      h += '<span class="et ' + couleurStatut(c.statut) + '">' + esc(szTd(libelleStatut(c.statut))) + '</span>';
    }
    h += (c.prioritaire ? '<span class="badge2 or"><span class="ic" aria-hidden="true">⚡</span> ${T("Prioritaire")}</span>' : '')
      + (c.manuelle ? '<span class="badge2" title="${T("Vente saisie à la caisse")}">${T("Manuelle")}</span>' : '')
      + (c.tiktok ? '<span class="badge2 or" title="${T("Vente d’un encan en direct")}' + (c.encanPseudo ? ' — ' + esc(c.encanPseudo) : '') + '">TikTok</span>' : '')
      + (c.venteFinale ? '<span class="badge2">${T("Vente finale")}</span>' : '')
      + (d.remboursements.complet ? '<span class="badge2 vertf"><span class="ic">✅</span> ${T("Remboursée")}</span>'
          : (d.remboursements.lignes.length
              ? '<span class="badge2 or">↩ ' + d.remboursements.lignes.length + ' ' + szPl(d.remboursements.lignes.length, '${T("remboursement")}', '${T("remboursements")}') + '</span>' : ''))
      + '<span style="margin-left:auto" class="mut">' + esc(dateCourte(c.creeLe)) + '</span>'
      + '</div>';
    var hChrono = chronologieHtml(c.chronologie);
    h += '<div class="det2' + (hChrono ? ' a3' : '') + '">'
      + '<div class="bloc"><h3>${T("Client")}</h3>'
      + '<div class="l"><strong>' + esc(c.client.nom || '—') + '</strong>'
      + '<span class="badge2">' + (c.membre ? '${T("membre")}' : '${T("invité")}') + '</span>'
      // Rattacher la commande a un COMPTE : possible meme sur une commande
      // invitee (c est justement le cas a corriger le plus souvent).
      + (d.droits.lier && !ro
          ? '<button class="mini" id="det-lier" title="${T("Rattacher cette commande à un compte client")}"><span class="ic">🔗</span> '
            + (c.compte ? '${T("Changer")}' : '${T("Lier")}') + '</button>' : '')
      + '</div>'
      + (c.compte
          ? '<div class="mut">${T("Compte :")} <strong style="color:var(--tx-bleute)">' + esc(c.compte.nom) + '</strong></div>'
          : '')
      + (c.client.entreprise ? '<div class="l">' + esc(c.client.entreprise) + '</div>' : '')
      + '<div class="mut">' + esc(c.client.courriel) + (c.client.tel ? '<br>' + esc(c.client.tel) : '') + '</div>'
      + '<div class="mut" style="margin-top:.4rem"><span class="ic">💳</span> '
      + (c.paiementSquare ? '${T("Paiement Square")} <span class="num">' + esc(c.paiementSquare) + '</span>'
                          : '<span style="color:var(--tx-att)">${T("Commande démo — aucun paiement Square")}</span>')
      + (c.afterpay ? '<span class="badge2">AFTERPAY</span>' : '') + '</div>'
      /* LA PREUVE DE PAIEMENT DU SERVEUR (2026-10-11) : une commande de la boutique n'est confirmée qu'une
         fois son paiement vérifié chez Square. Ici, ce que le serveur a conclu — en clair, pour ne jamais
         expédier une commande impayée. */
      + pvHtml(c) + '</div>'
      + '<div class="bloc"><h3>${T("Livraison")}</h3>'
      + '<div class="mut">' + esc(c.adresse.rue) + '<br>'
      + esc(c.adresse.ville) + (c.adresse.province ? ', ' + esc(c.adresse.province) : '')
      + ' ' + esc(c.adresse.cp) + '</div>'
      + (c.livreLe ? '<div class="mut" style="margin-top:.3rem"><span class="ic">✅</span> ${T("Livrée le")} ' + esc(dateCourte(c.livreLe)) + '</div>' : '')
      + (c.suivi ? '<div class="mut" style="margin-top:.3rem"><span class="ic">📡</span> <span class="num">' + esc(c.suivi) + '</span>'
          + (c.suiviStatut ? ' — ' + esc(c.suiviStatut)
            + (c.suiviVerifieLe ? ' ${T("(vérifié le")} ' + esc(dateCourte(c.suiviVerifieLe)) + ')' : '') : '') + '</div>' : '')
      + '</div>' + hChrono + '</div></div>';

    h += '<div class="carte plein"><div class="liste">'
      + '<table><thead><tr><th>${T("Article")}</th>'
      + '<th class="c">${T("Qté")}</th><th class="d">${T("Montant")}</th></tr></thead><tbody>'
      + d.articles.map(function(a){
          /* Refonte fine (2026-09-26) : la ligne riche — l initiale, le nom, et la
             taille / couleur en sous-ligne plutot que dans une colonne a part ;
             le remboursement partiel se DIT en pastille. */
          return '<tr><td><div class="rf-prod"><span class="rf-av" aria-hidden="true">'
            + esc(String(a.nom || '?').trim().charAt(0).toUpperCase() || '?') + '</span><div>'
            + '<div class="rf-nom">' + esc(a.nom) + '</div>'
            + '<div class="rf-sous"><span>' + esc(a.taille) + ' / ' + esc(a.couleur) + '</span>'
            + (a.rembourseQte > 0 ? '<span class="rf-pill ambre">' + a.rembourseQte + ' ' + szPl(a.rembourseQte, '${T("unité remboursée")}', '${T("unités remboursées")}') + '</span>' : '')
            + '</div></div></div></td>'
            + '<td class="c">' + a.qte + '</td>'
            + '<td class="d">' + argent(a.montant)
            /* Le prix a l unite sous le montant de la ligne, des qu il y en a plus
               d une : « 179,98 $ » seul ne disait pas que c etait deux robes. */
            + (a.qte > 1 ? '<div class="dt">' + argent(a.montant / a.qte) + ' ${T("/ unité")}</div>' : '')
            + '</td></tr>'; }).join('')
      + '</tbody></table></div>';
    /* ⚠ LA .liste NE PORTE QUE LA TABLE (2026-10-25, audit) : elle est mise en pages d office (_SZ_PG_AUTO,
       overflow:hidden), et la hauteur offerte aux lignes allait jusqu au bas de la liste. Les totaux, les
       remboursements et les notes, places dedans apres la table, etaient COUPES sous la carte. Ils en sont
       maintenant les freres (flex:0 0 auto) : la pagination se fait dans la place qui reste. */

    var t = d.totaux;
    /* Totaux a droite, remboursements a gauche, dans la meme bande : la place
       sous les articles etait vide et le detail defilait (2026-09-26).
       ⚠ CHAQUE MONTANT QUE LE TOTAL DEDUIT A SA LIGNE (2026-10-25, audit) : promotion automatique, rabais
       du comptoir, carte-cadeau, credit, points. Sans elles, « Sous-total + taxes » ne donnait pas le Total. */
    var lib = [], mt = [];
    function ligneTot(l, m){ lib.push('<div>' + l + '</div>'); mt.push('<div>' + m + '</div>'); }
    ligneTot('${T("Sous-total")}', argent(t.sousTotal));
    if (t.rabaisAuto > 0) ligneTot('${T("Promotion automatique")}', '−' + argent(t.rabaisAuto));
    if (t.rabaisComptoir > 0) ligneTot('${T("Rabais sur la vente")}', '−' + argent(t.rabaisComptoir));
    if (t.coupon > 0) ligneTot('${T("Coupon")}', '−' + argent(t.coupon));
    if (t.livraison > 0) ligneTot('${T("Livraison")}', argent(t.livraison));
    if (t.prioritaire > 0) ligneTot('<span class="ic">⚡</span> ${T("Traitement prioritaire")}', argent(t.prioritaire));
    t.taxes.forEach(function(x){ ligneTot(esc(x.nom) + ' (' + szNombre(Math.round(x.taux * 1000000) / 10000, 4) + ' %)', argent(x.montant)); });
    if (t.carteCadeau > 0) ligneTot('${T("Carte-cadeau")}', '−' + argent(t.carteCadeau));
    if (t.credit > 0) ligneTot('${T("Crédit boutique")}', '−' + argent(t.credit));
    if (t.points > 0) ligneTot('${T("Points de fidélité")}', '−' + argent(t.points));
    var hTot = '<div class="totaux"><div>' + lib.join('')
      + '<div class="tt">${T("Total")}</div></div>'
      + '<div class="d">' + mt.join('')
      + '<div class="tt">' + argent(t.total) + '</div></div></div>';

    var rb = d.remboursements, hRemb = '';
    if (rb.lignes.length) {
      hRemb += '<div class="remb"><div class="t">${T("↩ Remboursements émis")}</div>'
        + rb.lignes.map(function(r){
            return '<div class="lg2"><span><strong>' + esc(r.numero) + '</strong> · '
              + esc(dateCourte(r.date)) + ' · <em>' + esc(szTd(r.type)) + '</em>'
              + (r.fraisRetenus > 0 ? ' <span style="color:var(--tx-att);font-size:.72rem">${T("(frais retenus :")} ' + argent(r.fraisRetenus) + ')</span>' : '')
              + '</span><span style="font-weight:700;color:var(--tx-att)">−' + argent(r.montant) + '</span></div>'; }).join('');
      if (rb.fraisRetenus > 0) {
        hRemb += '<div class="fin3" style="color:var(--tx-or2);font-weight:400">${T("Frais de service retenus :")} <strong>'
          + argent(rb.fraisRetenus) + '</strong> '
          + (rb.fraisRestants < 0.01 ? '<span class="badge2 vertf"><span class="ic">✅</span> ${T("Remboursés au client")}</span>'
             : rb.fraisRembourses > 0
               ? '<span class="badge2 or"><span class="ic" aria-hidden="true">⚠</span> ${T("Partiel — remboursé")} ' + argent(rb.fraisRembourses) + ' ${T("· reste")} ' + argent(rb.fraisRestants) + '</span>'
               : '<span class="badge2 or">${T("⏳ Non remboursés")}</span>') + '</div>';
      }
      hRemb += '<div class="fin3">${T("Total remboursé : −")}' + argent(rb.total)
        + (rb.complet ? ' <span class="badge2 vertf"><span class="ic">✅</span> ${T("Entièrement remboursée")}</span>' : '') + '</div></div>';
    }
    h += hRemb ? '<div class="bas2">' + hRemb + hTot + '</div>' : hTot;
    if (c.notes) h += '<div class="mut det-notes" style="margin-top:.6rem"><strong>${T("Notes :")}</strong> ' + esc(c.notes) + '</div>';
    h += '</div>';
    corps.innerHTML = h;

    actions.innerHTML = (SEUL ? '' : '<button id="btn-retour">${T("← Liste")}</button>')
      + (d.droits.bon && !ro ? '<button id="det-bon"><span class="ic">🖨</span> ${T("Bon de commande")}</button>' : '')
      + (c.aFacture ? '<button id="det-fact"><span class="ic">🧾</span> ${T("Facture")}</button>' : '')
      + (d.droits.frais && !ro ? '<button id="det-frais"><span class="ic">💰</span> ${T("Frais retenus (")}' + argent(rb.fraisRestants) + ')</button>' : '')
      + (d.droits.rembourser && !ro ? '<button id="det-remb">${T("↩ Rembourser")}</button>' : '')
      + (d.droits.supprimer && !ro ? '<button class="danger" id="det-suppr"><span class="ic">🗑</span> ${T("Supprimer")}</button>' : '');
    brancherDetail();
  }

  /* La chronologie de la commande (2026-10-27) : le site rend des CODES datés (pont.js, commandesDetail) ;
     les mots sont dits ici. Un seul geste (la commande vient d arriver) ne fait pas une chronologie. */
  var MOTS_CHRONO = {
    passee: '${T("Commande passée")}', etiquette: '${T("Étiquette créée")}', ramassage: '${T("Ramassage demandé")}',
    expediee: '${T("Expédiée")}', livree: '${T("Livrée")}', terminee: '${T("Terminée")}',
    remboursement: '${T("Remboursement")}', archivee: '${T("Archivée")}'
  };
  function chronologieHtml(L){
    if (!L || L.length < 2) return '';
    // L en-tête n a la hauteur que de six lignes : au-delà, les plus récents, et le compte de ce qui est caché.
    var cache = Math.max(0, L.length - 6), V = L.slice(cache);
    return '<div class="bloc"><h3>${T("Chronologie")}</h3><div class="chv" aria-label="${T("Chronologie de la commande")}">'
      + (cache ? '<div class="plus">' + '${T("{0} geste(s) plus ancien(s)")}'.split('{0}').join(cache) + '</div>' : '')
      + V.map(function(e){
          var mot = MOTS_CHRONO[e.code] || e.code, titre = '';
          if (e.code === 'passee' && e.detail === 'comptoir') mot += ' · ${T("au comptoir")}';
          if (e.code === 'passee' && e.detail === 'tiktok') mot += ' · TikTok';
          if (e.code === 'remboursement') { var p = String(e.detail || '').split('|'); mot += ' ' + argent(Number(p[1]) || 0); titre = p[0] || ''; }
          else if (e.detail && e.code !== 'passee') titre = e.detail;
          return '<div class="ce' + (e.code === 'remboursement' ? ' rb' : '') + '"' + (titre ? ' title="' + esc(titre) + '"' : '') + '><b></b>'
            + '<span class="l">' + esc(mot) + '</span><span class="d">' + esc(szQuand(e.le)) + '</span></div>';
        }).join('') + '</div></div>';
  }

  function brancherDetail(){
    var r = document.getElementById('btn-retour');
    if (r) r.onclick = retourListe;
    var st = document.getElementById('det-statut');
    if (st) st.onchange = function(){
      var cible = this.value;
      var courant = DET.commande.statut;
      this.value = courant; // le selecteur ne bouge qu apres la CONFIRMATION
      flowStatut(DET_ID, courant, cible, rechargerDetail);
    };
    var b = document.getElementById('det-bon');
    if (b) b.onclick = function(){
      this.disabled = true;
      var moi = this;
      dire('${T("Impression…")}');
      appeler('commande:bon', [DET_ID]).then(function(z){
        moi.disabled = false;
        dire(z.ok ? '${T("Bon de commande envoyé à l’impression.")}' : expliquer(z), z.ok ? 'bon' : 'err');
      });
    };
    var f = document.getElementById('det-fact');
    if (f) f.onclick = function(){
      appeler('commandes:facture', [DET_ID]).then(function(z){
        dire(z.ok ? (z.web ? '${T("Facture ouverte dans la fenêtre principale.")}' : '${T("Facture ouverte dans sa fenêtre.")}') : expliquer(z), z.ok ? 'bon' : 'err');
      });
    };
    var li = document.getElementById('det-lier');
    if (li) li.onclick = ouvrirLier;
    var fr = document.getElementById('det-frais');
    if (fr) fr.onclick = flowFrais;
    var rb = document.getElementById('det-remb');
    if (rb) rb.onclick = function(){
      // La fenetre Remboursement prend SON verrou sur la meme commande : on rend
      // le notre d abord, sinon elle se croirait ouverte par quelqu un d autre.
      rendreVerrou();
      appeler('commandes:rembourser', [DET_ID]).then(function(z){
        dire(z.ok ? '${T("Remboursement ouvert dans sa fenêtre.")}' : expliquer(z), z.ok ? 'bon' : 'err');
        if (z.ok) retourListe();
        else prendreVerrou(DET_ID); // refus d ouverture : on reprend la fiche
      });
    };
    var sp = document.getElementById('det-suppr');
    if (sp) sp.onclick = function(){ flowSupprimer(); };
    corps.onclick = null;
    corps.oncontextmenu = null;
  }

  function ouvrirDetail(id){
    DET_ID = id; DET = null; VUE = 'detail';
    dire('');
    dessiner();
    appeler('commandes:detail', [id]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); retourListe(); return; }
      DET = r;
      if (SEUL) {
        // (9.2.9) La bande dit ce qu'est la fenêtre ; le numéro est écrit une fois, en grand, dans la page.
        document.getElementById('titre').textContent = EPD() ? '${T("Détail de commande")}' : '${T("Commande")} ' + (r.commande.numero || '');
        document.title = '${T("Commande")} ' + (r.commande.numero || '') + ' ${T("— Administration Sandriza")}';
      }
      dessiner();
      prendreVerrou(id);
      if (LIER_DEPART) { LIER_DEPART = false; ouvrirLier(); }
      if (SUPPR_DEPART) { SUPPR_DEPART = false; if (DET && DET.droits && DET.droits.supprimer) flowSupprimer(); else dire('${T("Votre rôle ne donne pas accès à cette opération.")}', 'err'); }
    });
  }

  function rechargerDetail(){
    if (VUE !== 'detail' || !DET_ID) return;
    appeler('commandes:detail', [DET_ID]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); retourListe(); return; }
      DET = r;
      dessiner();
    });
  }

  // ⚠ A L OUVERTURE DU DETAIL, comme les fenetres de travail : chez les autres
  // la ligne passe << En traitement >> et LEUR detail s ouvre en lecture seule.
  function prendreVerrou(id){
    appeler('verrou:prendre', ['orders', id]).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      /* (2026-11-22, 9.1.2, sa demande : « ça peut être mieux avec un petit cadenas… épuré ») La phrase « Section
         verrouillée en modification par : X » devient une puce : un cadenas et un nom. La phrase reste en infobulle. */
      var puce = function(nom, autre, titre){
        return '<span class="sz-verrou-puce' + (autre ? ' autre' : '') + '" title="' + esc(titre) + '">' + CADENAS.replace('width="11" height="11"', 'width="12" height="12"') + esc(nom) + '</span>';
      };
      if (v.obtenu) {
        VERROU_PRIS = true; VERROU_PAR = '';
        if (v.horsLigne) sous.textContent = '${T("hors ligne")}';
        else sous.innerHTML = puce(v.par || '${T("vous")}', false, '${T("Section verrouillée en modification par :")} ' + (v.par || '${T("vous")}'));
      } else {
        VERROU_PRIS = false; VERROU_PAR = v.parQui || '${T("quelqu’un d’autre")}';
        sous.innerHTML = puce(VERROU_PAR, true, '${T("en traitement par")} ' + VERROU_PAR);
      }
      if (VUE === 'detail') dessiner();
    });
  }
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    VERROU_PRIS = false;
    if (DET_ID) appeler('verrou:rendre', ['orders', DET_ID]);   // (2026-10-19) jamais sans [portée, id]
  }
  function retourListe(){
    rendreVerrou();
    if (SEUL) { P.fermer(); return; }
    VERROU_PAR = ''; DET = null; DET_ID = '';
    VUE = 'liste';
    sous.textContent = (CTX && CTX.peutEditer) ? '' : '${T("Lecture seule")}';
    charger(true);
  }

  // Rouvrir la meme commande ramene cette fenetre : elle RELIT la fiche.
  window.szRevenir = function(){
    if (VUE === 'detail' && DET_ID) rechargerDetail();
  };

  /* ⚠ VERROU RELACHE A LA FERMETURE DE LA FENETRE (#40). Le detail tient le
     verrou 'orders' ; il ne se rendait qu'au bouton Fermer/Liste (retourListe).
     Fermer la fenetre par le bouton du SYSTEME, la detacher/rancrer, ou QUITTER
     la section (la vue ancree se decharge) ne passait PAS par la, et le verrou
     restait pris jusqu a son expiration (~90 s). On le rend donc aussi au
     dechargement de la page : le message part par le pont vers la fenetre
     principale, qui TIENT le verrou et le libere cote serveur meme une fois
     cette fenetre morte. L evenement pagehide couvre la fermeture ET le
     dechargement d une vue ancree ; le garde VERROU_PRIS rend l appel idempotent.
     ⚠ AUCUN accent grave dans ce commentaire (litteral de gabarit). */
  window.addEventListener('pagehide', function(){
    if (VERROU_PRIS && DET_ID) { VERROU_PRIS = false; try { appeler('verrou:rendre', ['orders', DET_ID]); } catch(e){} }
  });

  /* ── MODE ANCRE ── La coquille appelle szModeAncre(true) quand cette page
     vit DANS la fenetre principale (section Commandes de la barre laterale).
     Le meme bouton dit l inverse selon le mode : detacher la vue ancree, ou
     RAMENER la vue detachee dans la fenetre principale (etat retenu). */
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

  // ══ CHANGEMENT DE STATUT (selecteur du detail ET clic droit de la liste) ══
  // L apercu vient du site (implications, case courriels) ; << En livraison >>
  // n ecrit rien ici : il ouvre le flux d expedition, comme la fiche du site.
  function flowStatut(id, de, a, apresOK){
    appeler('commandes:statutApercu', [id, a]).then(function(ap){
      if (!ap.ok) {
        if (ap.motif !== 'inchange') dire(expliquer(ap), 'err');
        return;
      }
      function executer(reinit, fermer){
        if (ap.versExpedition) {
          // Le passage a << En livraison >> se fait DANS le flux d expedition
          // (transporteur + etiquette), jamais par une simple etiquette de statut.
          if (fermer) fermer();
          ouvrir('commandes:expedier', id, '${T("Expédition")}');
          return;
        }
        appeler('commandes:statutEcrire', [id, ap.de, a, reinit]).then(function(r){
          if (fermer) fermer();
          if (!r.ok) {
            dire(r.motif === 'conflit_statut'
              ? '${T("Statut déjà changé ailleurs (actuel :")} ' + (r.actuelLibelle || '?') + ').'
              : expliquer(r), 'err');
          } else if (!r.inchange) {
            dire('${T("Statut mis à jour.")}', 'bon');
          }
          if (apresOK) apresOK(); else charger(true);
        });
      }
      /* (2026-11-27) UNE VRAIE FENETRE DE L APPLICATION (szConfirmer). (Phase 2) La case des tests
         (reautoriser les courriels) passe aussi par une vraie fenetre : szConfirmerCase rend { oui, coche }
         a la page, qui poursuit (ecriture, ou flux d expedition) — pas de fenetre fille, qui le couperait. */
      var oStatut = {
        titre: '${T("Changer le statut")}',
        texte: '${T("Passer {0} de « {1} » à « {2} » ?")}'.split('{0}').join(ap.numero)
          .split('{1}').join(szTd(ap.deLibelle)).split('{2}').join(szTd(ap.aLibelle)),
        liste: ap.implications || [],
        oui: '${T("Changer le statut")}'
      };
      if (!ap.peutReinitCourriels) {
        szConfirmer(oStatut).then(function(oui){ if (oui) executer(false, null); });
        return;
      }
      oStatut.caseLib = '${T("Tests : réautoriser l’envoi des courriels de cette commande (le client pourra les recevoir à nouveau). Sinon, la protection anti-doublon reste active.")}';
      oStatut.caseValeur = false;
      szConfirmerCase(oStatut).then(function(r){ if (r && r.oui) executer(!!r.coche, null); });
    });
  }

  // ══ FRAIS DE SERVICE RETENUS — de l argent SORT (Square) ══════════════
  function flowFrais(){
    appeler('commandes:fraisApercu', [DET_ID]).then(function(ap){
      if (!ap.ok) { dire(expliquer(ap), 'err'); return; }
      /* (2026-11-27) Une vraie fenetre de l application (szConfirmer). La fenetre est modale et se
         referme au clic : le double clic (de l argent part) n a plus de bouton ou tomber. */
      var dF = [['${T("Montant")}', argent(ap.montant)]];
      if (ap.dejaRembourse > 0) dF.push(['${T("Déjà remboursé")}', argent(ap.dejaRembourse)], ['${T("Total retenu")}', argent(ap.totalRetenu)]);
      szConfirmer({
        titre: '${T("Rembourser les frais de service")}',
        texte: '${T("Les frais de service retenus seront remboursés au client via Square.")}',
        details: dF,
        note: '${T("Cette opération est irréversible.")}',
        oui: '${T("Rembourser")}',
        prudent: true
      }).then(function(oui){
        if (!oui) return;
        appeler('commandes:fraisEcrire', [DET_ID]).then(function(r){
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          var sq = r.square || {};
          if (sq.etat === 'initie') dire(r.numero + ' — ' + argent(r.montant) + ' ${T("de frais de service remboursés via Square.")}', 'bon');
          else if (sq.etat === 'echec') dire('${T("Enregistrement local créé mais Square a échoué :")} ' + (sq.detail || '?'), 'err');
          else if (sq.etat === 'reseau') dire('${T("Enregistrement local créé mais erreur réseau Square :")} ' + (sq.detail || '?'), 'err');
          else dire(r.numero + ' ${T("— frais remboursés (aucun jeton Square configuré).")}', 'att');
          rechargerDetail();
        });
      });
    });
  }

  // ══ RATTACHEMENT A UN COMPTE CLIENT ══════════════════════════════════════
  // Corrige une commande passee sous le mauvais compte, ou identifie une
  // invitee apres coup. Trois ops : apercu (etat courant), recherche, ecriture.
  // ⚠ La recherche exige 3 caracteres — c est le coeur du site qui l impose,
  // la fenetre ne fait que l annoncer pour que le champ vide ne paraisse pas mort.
  /* (2026-11-27, phase 2) La recherche s ouvre dans une VRAIE FENETRE (szBoite) ; le detail se relit a sa
     fermeture. flowLier reste l ouverture locale (repli, et ce qui tourne dans la fenetre fille). */
  function ouvrirLier(){
    var id = DET_ID;
    if (!id) return;
    szBoite('lier', { id: id }, flowLier).then(function(r){ if (r) rechargerDetail(); });
  }
  function flowLier(){
    appeler('commande:lierApercu', [DET_ID]).then(function(ap){
      if (!ap.ok) { dire(expliquer(ap), 'err'); return; }
      var etat = ap.actuel
        ? '${T("actuellement liée à")} <strong>' + esc(ap.actuel.nom) + '</strong> ('
          + esc(ap.actuel.courriel) + ')'
        : '${T("en mode <strong>invité</strong> (aucun compte)")}';
      voile('<h3><span class="ic">🔗</span> ${T("Rattacher la commande à un client")}</h3>'
        + '<p>${T("Commande")} <strong>' + esc(ap.numero) + '</strong> — ' + etat + '.</p>'
        + '<label style="font-size:.82rem;color:var(--tx-bleute)">${T("Rechercher un client (nom ou courriel)")}'
        + '<input class="rech" id="v-rech" placeholder="ex : marie@example.com" autocomplete="off"></label>'
        + '<div class="lres" id="v-lres"><div class="rien">${T("Tapez au moins 3 caractères.")}</div></div>'
        + (ap.actuel
            ? '<div class="detacher"><button class="danger" id="v-det"><span class="ic">🔓</span> ${T("Détacher (remettre en mode invité)")}</button></div>'
            : '')
        + '<div class="fin2"><button id="v-non">${T("Fermer")}</button></div>',
        function(fermer){
          var champ = document.getElementById('v-rech');
          var zone = document.getElementById('v-lres');
          document.getElementById('v-non').onclick = fermer;
          var det = document.getElementById('v-det');
          if (det) det.onclick = function(){ confirmerLien(fermer, ap, null, '${T("invité (aucun compte)")}'); };

          // Anti-rebond : on ne rappelle le pont qu une fois la frappe posee.
          var t = null;
          champ.oninput = function(){
            var q = this.value;
            if (t) clearTimeout(t);
            t = setTimeout(function(){ chercher(q); }, 220);
          };
          champ.focus();

          function chercher(q){
            if (String(q || '').trim().length < 3) {
              zone.innerHTML = '<div class="rien">${T("Tapez au moins 3 caractères.")}</div>';
              return;
            }
            appeler('commande:lierChercher', [q]).then(function(r){
              if (!r.ok) { zone.innerHTML = '<div class="rien">' + esc(expliquer(r)) + '</div>'; return; }
              // ⚠ La reponse peut arriver APRES une frappe plus recente : on ne
              // dessine que si le champ contient toujours la meme chose.
              if (champ.value !== q) return;
              var cl = r.clients || [];
              if (!cl.length) { zone.innerHTML = '<div class="rien">${T("Aucun client trouvé.")}</div>'; return; }
              zone.innerHTML = cl.map(function(u){
                return '<div class="cli" data-cli="' + esc(u.id) + '" data-nom="' + esc(u.nom)
                  + '" data-em="' + esc(u.courriel) + '">'
                  + '<div><div class="nm">' + esc(u.nom) + '</div>'
                  + '<div class="em">' + esc(u.courriel) + '</div></div>'
                  + '<span class="fl">${T("Lier →")}</span></div>'; }).join('');
            });
          }

          zone.onclick = function(ev){
            var b = ev.target && ev.target.closest ? ev.target.closest('[data-cli]') : null;
            if (!b) return;
            confirmerLien(fermer, ap, b.getAttribute('data-cli'),
              b.getAttribute('data-nom') + ' (' + b.getAttribute('data-em') + ')');
          };
        });
    });
  }

  // La confirmation est SEPAREE parce que le geste ne touche pas que la
  // commande : la facture suit, et les statistiques d achat des DEUX comptes
  // sont recalculees. On le dit avant, pas apres.
  function confirmerLien(fermerListe, ap, clientId, libelle){
    /* (2026-11-27) Une vraie fenetre de l application (szConfirmer), au-dessus de la recherche. */
    szConfirmer({
      titre: '${T("Rattacher la commande")}',
      texte: '${T("Lier {0} à {1} ?")}'.split('{0}').join(ap.numero).split('{1}').join(libelle)
        + ' ' + '${T("La facture associée sera mise à jour et les statistiques")}'
        + ' ' + '${T("d’achat des comptes concernés recalculées.")}',
      oui: '${T("Lier")}'
    }).then(function(oui){
      if (!oui) return;
      appeler('commande:lierEcrire', [DET_ID, clientId]).then(function(r){
        if (!r.ok) {
          dire(r.motif === 'inchange' ? '${T("Cette commande est déjà rattachée à ce compte.")}'
                                      : expliquer(r), r.motif === 'inchange' ? 'att' : 'err');
          return;
        }
        fermerListe();
        dire(r.invite ? '${T("Commande détachée — remise en mode invité.")}'
                      : '${T("Commande rattachée à")} ' + r.nom + '.', 'bon');
        rechargerDetail();
      });
    });
  }

  // ══ SUPPRESSION — IRREVERSIBLE, cascade annoncee AVANT le bouton ════════
  /* (2026-11-27, sa demande, capture a l appui) LA QUESTION EST UNE VRAIE FENETRE (szConfirmer -> fenetre
     modale de l application), plus une boite dessinee par-dessus la fiche. Et depuis la LISTE, on ne
     passe plus par la fiche : « je ne veux pas voir une fenetre de detail ». « id » absent = la commande
     de la fiche ouverte ; « depuisListe » = on recharge la liste au lieu de revenir a la liste. */
  /* (2026-11-28) UNE SUPPRESSION A LA FOIS PAR COMMANDE : de la confirmation a la reponse du serveur, la commande est
     notee ici ; sa ligne est grisee et sans gestes (sz-supp), et un second « Supprimer » est refuse. */
  var EN_SUPP = {};
  function marquerSupp(id, on){
    if (on) EN_SUPP[id] = 1; else delete EN_SUPP[id];
    var l = corps.querySelectorAll('tr[data-id]');
    for (var i = 0; i < l.length; i++) if (l[i].getAttribute('data-id') === id) l[i].classList.toggle('sz-supp', !!on);
  }
  function flowSupprimer(id, depuisListe){
    var cible = id || DET_ID;
    if (EN_SUPP[cible]) { dire('${T("Suppression déjà en cours pour cette commande.")}', 'att'); return; }
    appeler('commandes:supprimerApercu', [cible]).then(function(ap){
      if (!ap.ok) { dire(expliquer(ap), 'err'); return; }
      szConfirmer({
        titre: '${T("Supprimer la commande")}',
        texte: [ap.numero, ap.client].join(' — '),
        details: [['${T("Date")}', dateCourte(ap.date) || '—'], ['${T("Total")}', argent(ap.total)], ['${T("Statut")}', szTd(ap.statutLibelle)]],
        listeTitre: '${T("Éléments qui seront supprimés :")}',
        liste: (ap.elements || []).map(function(x){ return String(x).replace(/^[^0-9A-Za-zÀ-ÿ]+/, ''); }),
        note: '${T("Cette action est irréversible.")}',
        oui: '${T("Supprimer définitivement")}',
        danger: true
      }).then(function(oui){
        if (!oui) return;
        if (EN_SUPP[cible]) return;
        marquerSupp(cible, true);
        dire('${T("Suppression en cours…")}');
        appeler('commandes:supprimerEcrire', [cible]).then(function(r){
          var sq = r.square || {};
          var note = sq.etat === 'initie' ? ' ${T("Remboursement Square de")} ' + argent(sq.montant) + '${T(" initié.")}'
            : sq.etat === 'deja' ? ' ${T("Déjà entièrement remboursée — rien de plus envoyé à Square.")}'
            : sq.etat === 'echec' ? ' ${T("Remboursement Square échoué :")} ' + (sq.detail || '?')
            : sq.etat === 'reseau' ? ' ${T("Erreur réseau Square :")} ' + (sq.detail || '?') : '';
          if (!r.ok) {
            marquerSupp(cible, false);
            dire('${T("Suppression non confirmée par le serveur (")}' + (r.detail || '${T("erreur inconnue")}') + '${T(") — réessayez.")}' + note, 'err');
            if (!depuisListe) rechargerDetail(); else charger();
            return;
          }
          dire('${T("Commande supprimée — inventaire rétabli.")}' + note, sq.etat === 'echec' || sq.etat === 'reseau' ? 'att' : 'bon');
          // la ligne reste grisee jusqu a ce que la liste relue ne la porte plus (au plus 2 minutes)
          setTimeout(function(){ delete EN_SUPP[cible]; }, 120000);
          if (depuisListe) charger(); else retourListe();
        });
      });
    });
  }

  // ══ LE MENU COMPLET D UNE LIGNE (2026-10-13) — le menu du socle (szCtxMenu), les gestes de la ligne ══
  function menuLigne(ev, o, tr){
    if (EN_SUPP[o.id]) { dire('${T("Suppression en cours…")}'); return; }
    var l = [{ lib: '${T("Ouvrir le détail")}', fn: function(){
      ouvrir('commandes:ouvrirDetail', o.id, '${T("Détail")}'); setTimeout(function(){ charger(); }, 1200); } }];
    var pr = tr.querySelector('[data-prep]');
    if (pr && !pr.disabled) l.push({ lib: '${T("Traiter — lancer la préparation")}', fn: function(){
      ouvrir('commandes:preparer', o.id, '${T("Préparation")}'); setTimeout(function(){ charger(); }, 1200); } });
    if (CTX && CTX.peutEditer) {
      if (o.enTraitement) {
        l.push({ trait: true });
        l.push({ lib: '${T("En traitement par")} ' + (o.par || '${T("quelqu’un d’autre")}'), off: true });
      } else {
        var cibles = ((CTX && CTX.statuts) || []).filter(function(x){
          return ['pending', 'cancelled'].indexOf(x.cle) < 0 && x.cle !== o.statut;
        });
        if (cibles.length) l.push({ trait: true });
        cibles.forEach(function(x){ l.push({ lib: '${T("Passer à : ")}' + szTd(x.libelle), fn: function(){ flowStatut(o.id, o.statut, x.cle, null); } }); });
      }
    }
    if (CTX && CTX.peutSupprimer && !o.enTraitement) {
      l.push({ trait: true });
      l.push({ lib: '${T("Supprimer la commande…")}', dgr: true, fn: function(){ flowSupprimer(o.id, true); } });
    }
    szCtxMenu(ev.clientX, ev.clientY, o.numero || '', l);
  }

  /* (2026-10-25, audit) L ANCIEN MENU DE STATUT (menuStatut / fermerMenu) EST RETIRE : depuis le 2026-10-13,
     le clic droit passe par menuLigne (szCtxMenu du socle) et plus rien ne l appelait — mais son ecouteur
     « mousedown » restait pose en capture, et le code laissait croire a un second menu. */

  // ══ VOILE ══════════════════════════════════════════════════════════
  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  // ══ ECOUTEURS ═════════════════════════════════════════════════════════════
  var rechT = null;
  function brancher(){

    var champ = document.getElementById('rech');
    if (champ) {
      champ.oninput = function(){
        F.q = this.value; F.page = 0;
        clearTimeout(rechT);
        rechT = setTimeout(charger, 230);
      };
      // ⚠ ON RETABLIT LE CURSEUR APRES REDESSIN : sans cela, taper un nom fait
      // sauter le curseur au debut a chaque lettre, et l on ecrit a l envers.
      if (document.activeElement !== champ && F.q) { /* laisse le focus ou il est */ }
    }
    var an = document.getElementById('f-annee');
    if (an) an.onchange = function(){ F.annee = this.value; F.page = 0; charger(); };
    /* ⚠ ON PASSE PAR << ouvrirModule >> ET NON PAR UNE OUVERTURE DIRECTE : une
       fenetre ne choisit pas ce qu elle ouvre dans l application, elle le NOMME,
       et le processus principal filtre le nom contre sa liste blanche (voir
       _MODULES_OUVRABLES dans main.js). Meme chemin que le bouton
       << Verrous >> des Journaux. */
    var cf = document.getElementById('c-file');
    if (cf) cf.onclick = function(){
      cf.disabled = true;
      appeler('commandes:fileSuivante', ['']).then(function(r){
        cf.disabled = false;
        if (r && r.ok && r.vide) dire('${T("Plus rien à préparer — la file est vide.")}', 'bon');
        else if (!r || !r.ok) dire(expliquer(r), 'err');
      });
    };
    var cb = document.getElementById('c-corbeille');
    if (cb) cb.onclick = function(){
      if (P && P.ouvrirModule) P.ouvrirModule('corbeille');
    };
    var pt = document.getElementById('pg-taille');
    if (pt) pt.onchange = function(){
      if (this.value === 'auto') { F.auto = true; F.page = 0; dessiner(); listeAutoAjuste(); }
      else { F.auto = false; F.parPage = parseInt(this.value, 10) || 20; F.page = 0; charger(); }
    };
    var pp = document.getElementById('pg-prec');
    if (pp) pp.onclick = function(){ F.page--; charger(); };
    var ps = document.getElementById('pg-suiv');
    if (ps) ps.onclick = function(){ F.page++; charger(); };

    // Ecouteur DELEGUE : la liste est redessinee a chaque frappe, un ecouteur
    // pose sur chaque bouton serait reperdu aussitot.
    corps.onclick = function(ev){
      var t = ev.target;
      if (!t || !t.closest) return;
      if (CK && VUE === 'liste' && CK.clic(ev)) return;   // une case, « tout cocher » ou la barre d actions
      // (Monday) « Filtrer » ouvre/ferme son panneau ; un clic ailleurs le referme (un état choisi le garde ouvert).
      if (t.closest('[data-mo-filtre]')) { MO_FILTRE = !MO_FILTRE; dessiner(); return; }
      if (MO_FILTRE && !t.closest('.mo-pop')) { MO_FILTRE = false; dessiner(); }
      var vb = t.closest('[data-vue]');
      if (vb) {
        var v = vb.getAttribute('data-vue');
        var k = v === 'kanban', c = v === 'compact';
        if (k !== KANBAN || (!k && c !== COMPACT)) {
          KANBAN = k; if (!k) COMPACT = c;
          try { localStorage.setItem('sz-cmd-compact', COMPACT ? '1' : '0'); localStorage.setItem('sz-cmd-kanban', KANBAN ? '1' : '0'); } catch (e) {}
          F.page = 0; dessiner(); charger();
        }
        return;
      }
      var mg = t.closest('[data-mq-g]');
      if (mg) { MQ_OUVERT = mg.getAttribute('data-mq-g'); MQ_PG = 0; dessiner(); return; }
      var mp = t.closest('[data-mq-pg]');
      if (mp) { if (!mp.disabled) { MQ_PG = Math.max(0, MQ_PG + (+mp.getAttribute('data-mq-pg'))); dessiner(); } return; }
      // Kanban : « + k autres » ouvre la LISTE filtrée sur ce statut ; une carte ouvre le détail.
      var kp = t.closest('[data-kb-plus]');
      if (kp) {
        KANBAN = false; try { localStorage.setItem('sz-cmd-kanban', '0'); } catch (e) {}
        F.statuts = [kp.getAttribute('data-kb-plus')]; F.page = 0; dessiner(); charger();
        return;
      }
      var kc = t.closest('[data-kb-id]');
      if (kc) {
        ouvrir('commandes:ouvrirDetail', kc.getAttribute('data-kb-id'), '${T("Détail")}');
        setTimeout(function(){ charger(); }, 1200);
        return;
      }
      var st = t.closest('[data-st]');
      if (st) {
        if (KB()) { KANBAN = false; try { localStorage.setItem('sz-cmd-kanban', '0'); } catch (e) {} F.statuts = []; }
        var cle = st.getAttribute('data-st');
        var i = F.statuts.indexOf(cle);
        if (i >= 0) F.statuts.splice(i, 1); else F.statuts.push(cle);
        F.page = 0; dessiner(); charger();
        return;
      }
      if (t.closest('[data-vider]')) { F.statuts = []; F.page = 0; dessiner(); charger(); return; }
      // Une tuile filtre la liste sur ce qu elle compte ; recliquer defait.
      var tuT = t.closest('[data-tuile]');
      if (tuT) {
        var gT = tuT.getAttribute('data-tuile');
        if (gT === 'prio') F.prioritaires = !F.prioritaires;
        else F.statuts = (F.statuts.length === 1 && F.statuts[0] === gT) ? [] : [gT];
        F.page = 0; dessiner(); charger();
        return;
      }
      if (t.closest('[data-prio]')) { F.prioritaires = !F.prioritaires; F.page = 0; dessiner(); charger(); return; }
      if (t.closest('[data-manu]')) { F.manuelles = !F.manuelles; F.page = 0; dessiner(); charger(); return; }
      var pr = t.closest('[data-prep]');
      if (pr) {
        ouvrir('commandes:preparer', pr.getAttribute('data-prep'), '${T("Préparation")}');
        // La ligne passe << En traitement >> des que la fenetre a pris son
        // verrou : on recharge sans attendre le prochain battement.
        setTimeout(function(){ charger(); }, 1200);
        return;
      }
      // Le reste de la ligne ouvre le DETAIL — dans SA fenetre native.
      var tr = t.closest('tr[data-id]');
      if (tr) {
        ouvrir('commandes:ouvrirDetail', tr.getAttribute('data-id'), '${T("Détail")}');
        // Le detail prend le verrou : la ligne passe << En traitement >>.
        setTimeout(function(){ charger(); }, 1200);
      }
    };
    /* Clic droit sur une ligne (2026-10-13, ELARGI — sa demande : « supprimer une commande ou encore la
       traiter ») : ouvrir, traiter, puis les statuts (jamais quand la commande est tenue), puis supprimer.
       Memes droits que les boutons : CTX.peutEditer (orders:edit), CTX.peutSupprimer (orders:delete). */
    corps.oncontextmenu = function(ev){
      var t = ev.target;
      var tr = t && t.closest ? t.closest('tr[data-id]') : null;
      if (!tr) return;
      ev.preventDefault();
      var id = tr.getAttribute('data-id');
      var o = ((DONNEES && DONNEES.lignes) || []).filter(function(x){ return x.id === id; })[0];
      if (o) menuLigne(ev, o, tr);
    };
  }

  /* ── LES ACTIONS GROUPÉES (2026-10-27 ; 2026-10-29 : cases toujours visibles, plus d actions) ──
     Une liste = un jeu de coches : passer de Commandes à Expéditions repart à vide (les gestes diffèrent).
     Chaque geste passe par l op UNITAIRE du pont, l une après l autre (szLotDerouler) : mêmes droits, mêmes
     verrous, mêmes refus qu un clic sur la fiche — un lot n est jamais un raccourci autour d une règle. */
  var CK_MODE = '';
  function lotCoches(){
    var expedition = MODE === 'expeditions';
    if (CK && CK_MODE === MODE) return CK;
    CK_MODE = MODE;
    var peutE = !!(CTX && CTX.peutEditer), peutX = !!(CTX && CTX.peutExpedier);
    var finie = function(f){ return f.statut === 'shipped' || f.statut === 'delivered' || f.statut === 'cancelled'; };
    CK = szCoches({
      zone: corps, barre: 'k-barre',
      lignes: function(){ return (DONNEES && DONNEES.lignes) || []; },
      // Un autre filtre, statut, recherche ou année vide la sélection ; changer de page la garde.
      contexte: function(){ return [MODE, F.q, F.statuts.join(','), F.annee, F.prioritaires, F.manuelles].join('|'); },
      id: function(o){ return o.id; },
      nom: function(o){ return o.numero; },
      // La ligne ENTIÈRE est retenue : l export et les gestes la relisent même après un changement de page.
      fiche: function(o){ return Object.assign({ tenue: !!o.enTraitement }, o); },
      compte: ['${T("{0} commande sélectionnée")}', '${T("{0} commandes sélectionnées")}'],
      actions: expedition ? [
        { cle: 'etiq', libelle: '${T("Imprimer les étiquettes")}', prim: true, cache: function(){ return !peutX; },
          pour: function(f){ return !!f.aUneEtiquette; } },
        { cle: 'factures', libelle: '${T("Imprimer les factures")}', pour: function(f){ return !!f.factureId; } },
        { cle: 'csv', libelle: '${T("Exporter (CSV)")}' }
      ] : [
        { cle: 'bons', libelle: '${T("Imprimer les bons")}', cache: function(){ return !peutE; } },
        { cle: 'factures', libelle: '${T("Imprimer les factures")}', pour: function(f){ return !!f.factureId; } },
        { cle: 'prep', libelle: '${T("Passer en préparation")}', prim: true, cache: function(){ return !peutE; },
          pour: function(f){ return !f.tenue && (f.statut === 'confirmed' || f.statut === 'pending'); } },
        /* CRÉER LES ÉTIQUETTES EN LOT (2026-10-29, sa décision : « oui, avec récapitulatif du prix »). Une commande
           active, sans étiquette, tenue par personne, et pas une vente de caisse (déjà remise). */
        { cle: 'etiqCreer', libelle: '${T("Créer les étiquettes")}', cache: function(){ return !peutX; },
          aide: '${T("Cotation de chaque commande, puis un récapitulatif du prix total à confirmer avant de rien acheter.")}',
          pour: function(f){ return !f.tenue && !finie(f) && !f.aUneEtiquette && !f.manuelle; } },
        { cle: 'expedier', libelle: '${T("Marquer expédiée")}', cache: function(){ return !peutX; },
          /* (2026-10-29, sa décision : « seulement si vérifiée ») la fiche exige le scan complet du colis avant
             d expédier ; le lot aussi — verifiee vient du site (même règle que la fiche). */
          aide: '${T("Seulement les commandes vérifiées en entier, avec leur étiquette : le numéro de suivi part au client.")}',
          pour: function(f){ return !f.tenue && !finie(f) && !!f.aUneEtiquette && !!f.suivi && f.verifiee === true; } },
        { cle: 'csv', libelle: '${T("Exporter (CSV)")}' }
      ],
      geste: function(cle, ids, tous){ lotGeste(cle, ids, tous); }
    });
    return CK;
  }
  function lotFiche(id){ return (CK && CK.fiches()[id]) || {}; }
  function lotNom(id){ return lotFiche(id).numero || id; }
  function lotEcartes(ids, tous){
    var n = tous.length - ids.length;
    return n ? ' ' + szPl(n, '${T("{0} autre sélectionnée ne s’y prête pas : elle ne change pas.")}', '${T("{0} autres sélectionnées ne s’y prêtent pas : elles ne changent pas.")}').split('{0}').join(n) : '';
  }
  function lotMotif(r){ return (r && r.detail) ? r.detail : expliquer(r); }
  function lotGeste(cle, ids, tous){
    if (!ids.length) return;
    if (cle === 'csv') return lotExporter(tous);
    if (cle === 'bons') return szLotDerouler({ titre: '${T("Impression des bons")}', ids: ids, nom: lotNom, motif: lotMotif,
      faire: function(id){ return appeler('commande:bon', [id]); },
      fait: function(k){ return szPl(k, '${T("{0} bon envoyé à l’impression.")}', '${T("{0} bons envoyés à l’impression.")}').split('{0}').join(k); } });
    if (cle === 'factures') {
      var sansF = tous.length - ids.length;
      return szLotDerouler({ titre: '${T("Impression des factures")}', ids: ids, nom: lotNom, motif: lotMotif,
        faire: function(id){ return appeler('facture:imprimer', [lotFiche(id).factureId]); },
        fait: function(k){ return szPl(k, '${T("{0} facture envoyée à l’impression.")}', '${T("{0} factures envoyées à l’impression.")}').split('{0}').join(k)
          + (sansF ? ' ' + '${T("Les commandes sans facture sont passées.")}' : ''); } });
    }
    if (cle === 'etiq') return szLotDerouler({ titre: '${T("Impression des étiquettes")}', ids: ids, nom: lotNom, motif: lotMotif,
      faire: function(id){ return appeler('expedition:imprimer', [id, null]); },
      fait: function(k){ return szPl(k, '${T("{0} étiquette envoyée à l’impression.")}', '${T("{0} étiquettes envoyées à l’impression.")}').split('{0}').join(k); } });
    if (cle === 'prep') return szConfirmer({ titre: '${T("Passer en préparation")}',
        texte: szPl(ids.length, '${T("{0} commande passera « En préparation ».")}', '${T("{0} commandes passeront « En préparation ».")}').split('{0}').join(ids.length) + lotEcartes(ids, tous),
        oui: '${T("Passer en préparation")}' }).then(function(oui){
      if (!oui) return;
      return szLotDerouler({ titre: '${T("Mise à jour des statuts")}', ids: ids, nom: lotNom, motif: lotMotif,
        faire: function(id){ return appeler('commandes:statutEcrire', [id, lotFiche(id).statut, 'preparing', false]); },
        fait: function(k){ return szPl(k, '${T("{0} commande passée en préparation.")}', '${T("{0} commandes passées en préparation.")}').split('{0}').join(k); } })
        .then(function(){ CK.vider(); charger(true); });
    });
    if (cle === 'etiqCreer') return lotEtiquettes(ids, tous);
    if (cle === 'expedier') return szConfirmer({ titre: '${T("Marquer expédiée")}', prudent: true,
        texte: '${T("Avant de continuer : chaque colis a son étiquette collée et son bordereau glissé.")}' + ' ' + szPl(ids.length, '${T("{0} commande passera « Expédiée » : le client reçoit son courriel avec le numéro de suivi de l’étiquette.")}', '${T("{0} commandes passeront « Expédiée » : chaque client reçoit son courriel avec le numéro de suivi de son étiquette.")}').split('{0}').join(ids.length) + lotEcartes(ids, tous),
        details: ids.slice(0, 8).map(function(id){ var f = lotFiche(id); return [f.numero || id, (f.transporteur ? f.transporteur + ' · ' : '') + (f.suivi || '')]; }),
        oui: szPl(ids.length, '${T("Expédier {0} commande")}', '${T("Expédier {0} commandes")}').split('{0}').join(ids.length) }).then(function(oui){
      if (!oui) return;
      return szLotDerouler({ titre: '${T("Expédition")}', ids: ids, nom: lotNom, motif: lotMotif,
        /* ⚠ Le verrou que l expédition prend est RENDU aussitôt (relecture du 2026-10-29) : sans cela, chaque
           commande restait « En traitement » chez les collègues une vingtaine de minutes — la fiche unitaire,
           elle, appelle rendreVerrou. Le suivi et le transporteur sont ceux de la fiche RELUE (szCoches.apres). */
        faire: function(id){ var f = lotFiche(id);
          return appeler('commande:expedier', [id, f.transporteur || '', f.suivi || '', false]).then(function(r){
            return appeler('verrou:rendre', ['orders', id]).then(function(){ return r; }, function(){ return r; }); }); },
        fait: function(k){ return szPl(k, '${T("{0} commande expédiée.")}', '${T("{0} commandes expédiées.")}').split('{0}').join(k); } })
        .then(function(){ CK.vider(); charger(true); });
    });
  }
  /* ══ LES ÉTIQUETTES EN LOT — LE GESTE QUI COÛTE ══════════════════════════════════════════════════════════
     1. COTER (gratuit) : pour chaque commande, le poids calculé (le même pré-rempli que la fenêtre Expédition,
        0,5 kg à défaut), puis la comparaison des transporteurs. Le choix : celui de la CLIENTE à la caisse s il
        est coté et sait créer une étiquette (elle a payé ce service), sinon le moins cher qui en crée une — la
        règle de la fenêtre Expédition.
     2. MONTRER : une boîte avec chaque commande, son transporteur, son service, son poids, son prix, et le TOTAL.
        Ce qui n a pas pu être coté est nommé et laissé de côté.
     3. CRÉER, une à la fois, avec le prix affiché (le relais re-cote au cent près et refuse tout écart : rien
        n est acheté à un autre prix). Jamais « forcer » : une commande déjà étiquetée entre-temps est refusée.
     4. Proposer d imprimer celles qui ont été créées. */
  function lotEtiquettes(ids, tous){
    var cotes = [], ecartees = [], i = 0, TRS = [];
    var creeEtiq = function(cle){ for (var k = 0; k < TRS.length; k++) if (TRS[k].cle === cle) return !!TRS[k].etiquette; return false; };
    var nomT = function(cle){ for (var k = 0; k < TRS.length; k++) if (TRS[k].cle === cle) return TRS[k].nom || cle; return cle; };
    // Le libellé du service, tel que la fenêtre Expédition le montre (contexte des transporteurs).
    var nomS = function(t, s, repli){ for (var k = 0; k < TRS.length; k++) if (TRS[k].cle === t)
      for (var j = 0; j < (TRS[k].services || []).length; j++) if (TRS[k].services[j].cle === s) return TRS[k].services[j].libelle || s;
      return repli || s; };
    var services = function(x){ return (x.services && x.services.length) ? x.services : [x]; };
    dire('${T("Cotation des étiquettes…")}' + ' 0 / ' + ids.length);
    return appeler('expedition:contexte', []).then(function(c){
      TRS = (c && c.ok && c.transporteurs) || [];
      return ids.reduce(function(p, id){
        return p.then(function(){
          return appeler('expedition:lire', [id]).then(function(L){
            if (!L || !L.ok) { ecartees.push([lotNom(id), lotMotif(L)]); return; }
            if (L.commande && L.commande.aUneEtiquette) { ecartees.push([lotNom(id), '${T("a déjà une étiquette")}']); return; }
            var pw = L.poids || {};
            var poids = Number(Math.round(Number(((pw.calcule > 0) ? pw.calcule : 0.5) + 'e2')) + 'e-2');
            return appeler('expedition:comparer', [id, poids]).then(function(r){
              if (!r || !r.ok) { ecartees.push([lotNom(id), lotMotif(r)]); return; }
              var res = (r.resultats || []).filter(function(x){ return x.ok && creeEtiq(x.transporteur); });
              var choix = null, cc = L.commande && L.commande.choixClient;
              if (cc && cc.transporteur) res.forEach(function(x){ if (x.transporteur !== cc.transporteur || choix) return;
                services(x).forEach(function(s){ if (!choix && s.service === cc.service && +s.reel > 0) choix = { t: x.transporteur, s: s.service, nomS: nomS(x.transporteur, s.service, cc.nomService), prix: +s.reel, client: true }; }); });
              if (!choix && res[0]) { var s0 = services(res[0]).filter(function(s){ return +s.reel > 0; })[0] || null;
                if (s0 || +res[0].reel > 0) choix = { t: res[0].transporteur, s: (s0 || res[0]).service, nomS: nomS(res[0].transporteur, (s0 || res[0]).service), prix: +(s0 || res[0]).reel, client: false }; }
              if (!choix) { ecartees.push([lotNom(id), '${T("aucun transporteur qui crée des étiquettes n’a coté cet envoi")}']); return; }
              cotes.push({ id: id, t: choix.t, s: choix.s, nomS: choix.nomS, prix: choix.prix, poids: (+r.poidsKg > 0 ? +r.poidsKg : poids), client: choix.client, estime: !!pw.estime });
            });
          }).then(function(){ i++; dire('${T("Cotation des étiquettes…")}' + ' ' + i + ' / ' + ids.length); });
        });
      }, Promise.resolve());
    }).then(function(){
      if (!cotes.length) {
        dire('${T("Aucune étiquette ne peut être créée.")}', 'err');
        if (ecartees.length) szConfirmer({ titre: '${T("Créer les étiquettes")}', texte: '${T("Aucune des commandes n’a pu être cotée :")}', details: ecartees.slice(0, 12), oui: '${T("Fermer")}', seul: true });
        return;
      }
      var total = cotes.reduce(function(m, x){ return m + x.prix; }, 0);
      dire('');
      var det = cotes.map(function(x){ return [lotNom(x.id), nomT(x.t) + ' · ' + x.nomS + ' · ' + szNombre(x.poids, 2) + ' kg'
        + (x.estime ? ' ${T("(estimé)")}' : '') + (x.client ? ' · ${T("choix du client")}' : '') + ' — ' + argent(x.prix)]; });
      ecartees.forEach(function(e){ det.push([e[0], '${T("laissée de côté : ")}' + e[1]]); });
      return szConfirmer({ titre: '${T("Créer les étiquettes")}', prudent: true,
        texte: szPl(cotes.length, '${T("{0} étiquette sera achetée maintenant — facturée dès sa création, annulable tant que le colis n’est pas parti.")}', '${T("{0} étiquettes seront achetées maintenant — facturées dès leur création, annulables tant que le colis n’est pas parti.")}').split('{0}').join(cotes.length)
          + (tous.length > ids.length ? lotEcartes(ids, tous) : ''),
        details: [['${T("Total coté (avant taxes)")}', argent(total)]].concat(det),
        oui: szPl(cotes.length, '${T("Acheter {0} étiquette — {1}")}', '${T("Acheter {0} étiquettes — {1}")}').split('{0}').join(cotes.length).split('{1}').join(argent(total)) })
      .then(function(oui){
        if (!oui) { dire('${T("Rien n’a été acheté.")}', 'att'); return; }
        var parId = {}; cotes.forEach(function(x){ parId[x.id] = x; });
        var faites = [];
        return szLotDerouler({ titre: '${T("Création des étiquettes")}', ids: cotes.map(function(x){ return x.id; }), nom: lotNom, motif: lotMotif,
          faire: function(id){ var x = parId[id];
            return appeler('expedition:etiquette', [id, x.t, x.s, x.poids, false, { prixCents: Math.round(x.prix * 100) }]).then(function(r){ if (r && r.ok) faites.push(id); return r; }); },
          fait: function(k){ return szPl(k, '${T("{0} étiquette créée.")}', '${T("{0} étiquettes créées.")}').split('{0}').join(k); } })
        .then(function(){
          CK.vider(); charger(true);
          if (!faites.length) return;
          return szConfirmer({ titre: '${T("Imprimer les étiquettes")}',
            texte: szPl(faites.length, '${T("{0} étiquette vient d’être créée. L’imprimer maintenant ?")}', '${T("{0} étiquettes viennent d’être créées. Les imprimer maintenant ?")}').split('{0}').join(faites.length),
            non: '${T("Plus tard")}', oui: '${T("Imprimer maintenant")}' }).then(function(ok){
            if (!ok) return;
            return szLotDerouler({ titre: '${T("Impression des étiquettes")}', ids: faites, nom: lotNom, motif: lotMotif,
              faire: function(id){ return appeler('expedition:imprimer', [id, null]); },
              fait: function(k){ return szPl(k, '${T("{0} étiquette envoyée à l’impression.")}', '${T("{0} étiquettes envoyées à l’impression.")}').split('{0}').join(k); } });
          });
        });
      });
    });
  }
  // L export : les lignes COCHÉES (toutes pages), dans l ordre où elles ont été cochées.
  function lotExporter(ids){
    var lignes = ids.map(function(id){ var f = lotFiche(id);
      return [f.numero || '', (f.date || '').slice(0, 10), f.client || '', f.ville || '', f.articles || 0,
        (Number(f.total) || 0).toFixed(2), szTd(libelleStatut(f.statut)), f.transporteur || '', f.suivi || '', f.numeroFacture || '']; });
    var csv = szCSV(['${T("Commande")}', '${T("Date")}', '${T("Client")}', '${T("Ville")}', '${T("Articles")}', '${T("Total")}',
      '${T("Statut")}', '${T("Transporteur")}', '${T("Suivi")}', '${T("Facture")}'], lignes);
    szExporter((MODE === 'expeditions' ? 'expeditions-' : 'commandes-') + new Date().toISOString().slice(0, 10) + '.csv', csv,
      szPl(ids.length, '${T("{0} commande exportée")}', '${T("{0} commandes exportées")}').split('{0}').join(ids.length));
  }

  function ouvrir(op, id, quoi){
    dire('${T("Ouverture…")}');
    appeler(op, [id]).then(function(r){
      dire(r.ok ? (quoi + ' ${T("ouverte dans sa fenêtre.")}') : expliquer(r), r.ok ? 'bon' : 'err');
    });
  }

  // ══ CHARGEMENT ════════════════════════════════════════════════════════════
  var RELANCE = false;
  function charger(forcer){
    /* ⚠ NE JAMAIS AVALER UN CLIC. Avant, un appel deja en vol (le battement
       des 5 s, ou la frappe precedente) faisait simplement RETURN : le filtre
       clique n agissait qu au battement suivant — vecu comme << plusieurs
       secondes de delai >> (2026-08-07). On note la demande, et la reponse
       perimee (celle de l ANCIEN filtre) n est pas dessinee. */
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    // Kanban : la liste ENTIÈRE du mode (200 au plus, borne du site), les statuts deviennent les colonnes.
    appeler('commandes:liste', [MODE, KB() ? Object.assign({}, F, { page: 0, parPage: 200, statuts: [] })
      : (MAQ() ? Object.assign({}, F, { page: 0, parPage: 200 }) : F)]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(forcer); return; }
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      DONNEES = r;
      // La reponse arrivee APRES l ouverture d un detail ne doit pas l ecraser.
      if (VUE !== 'liste') return;
      if (!forcer) dire('');
      // On retient la position du curseur AVANT de redessiner : la barre de
      // recherche est reconstruite, et sans cela on taperait a l envers.
      var av = document.getElementById('rech');
      var focus = av && document.activeElement === av;
      var pos = focus ? av.selectionStart : null;
      dessiner();
      if (focus) {
        var neuf = document.getElementById('rech');
        if (neuf) { neuf.focus(); try { neuf.setSelectionRange(pos, pos); } catch (e) {} }
      }
    });
  }

  function demarrer(){
    appeler('commandes:contexte').then(function(c){
      if (!c || !c.ok) { vide('${T("Commandes indisponibles")}', expliquer(c)); return; }
      CTX = c;
      sous.textContent = c.peutEditer ? '' : '${T("Lecture seule")}';
      /* En fenetre fille (szBoite) : seule la boite demandee s ouvre — ni detail (il prendrait le verrou de la
         commande, que la fenetre mere detient), ni liste. */
      if (window.__szBoite && szBoiteSiDemandee({ lier: function(a){ if (a && a.id) { DET_ID = a.id; flowLier(); } } })) return;
      if (DET_DEPART) { ouvrirDetail(DET_DEPART); DET_DEPART = ''; return; }
      charger();
    });
  }

  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    var v = document.querySelector('.voile');
    if (v && v.parentNode) { v.parentNode.removeChild(v); return; }
    if (VUE === 'detail') { retourListe(); return; }
    rendreVerrou();
    P.fermer();
  });
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });

  /* (2026-10-19, audit — lot VOLUME) LA RELECTURE DES 5 S SE SUSPEND quand la fenetre est cachee et RALENTIT
     (une sur trois, soit 15 s) quand elle n a pas le focus ; au retour, une relecture immediate. Sur 10 000
     commandes, chaque relecture coute : la faire pour une fenetre que personne ne regarde n a pas de sens. */
  var SONDE_TIC = 0;
  setInterval(function(){
    if (document.hidden) return;
    SONDE_TIC++;
    if (document.hasFocus && !document.hasFocus() && (SONDE_TIC % 3)) return;
    if (enCours || VUE !== 'liste') return;
    var a = document.activeElement;
    // Une CASE à cocher garde le focus après le clic : elle ne doit pas arrêter la relecture (relecture du 2026-10-29).
    if (a && ((a.tagName === 'INPUT' && a.type !== 'checkbox') || a.tagName === 'SELECT')) return;
    if (CTX && DONNEES) charger();
  }, 5000);
  document.addEventListener('visibilitychange', function(){
    if (document.hidden || enCours || VUE !== 'liste') return;
    if (CTX && DONNEES) charger();
  });

  demarrer();
})();
</script>
</body></html>`;
}

module.exports = { pageCommandes };
