'use strict';

/*
 * ASSISTANT « PRÉPARATION DE COMMANDE » — NATIF, PENSÉ POUR LE LECTEUR (refonte 2026-10-19, piste A)
 * =============================================================================
 * Sa demande, en cinq points : la liste des articles « disparue », un mauvais code qui
 * « bloque l'écran », une ligne complète qui ne se coche pas, le passage à l'étiquette
 * qui attendait « Suivant », et une étiquette choisie à l'aveugle. Elle a choisi la PISTE A :
 * un en-tête (commande, client, fil de 4 étapes), une colonne principale et un panneau
 * latéral d'environ 300 px qui porte la progression, l'argent et LE bouton de l'étape.
 *
 * ⚠⚠ POURQUOI LA LISTE AVAIT « DISPARU » (cause trouvée le 2026-10-19). Le moteur de liste
 * paginée du socle (Pagi) branche son FILTRE sur le PREMIER `.rech input` de sa zone — or
 * depuis le 2026-08-07, le premier était… le champ de SCAN. Chaque frappe du lecteur
 * filtrait donc la liste par le code scanné (« Aucun résultat », « 0 sur 0 »), et le
 * champ vidé après Entrée ne relançait aucun `input` : le filtre restait collé. D'où aussi
 * le « mauvais code qui bloque » : la liste vide se lisait comme un écran figé.
 * ➡ Ici, PLUS DE PAGI : la liste se dessine elle-même, toujours entière, et défile dans sa
 * colonne. Le champ de scan ne filtre rien.
 *
 * ⚠ CE QUI N'EN SORT PAS. Ni moyen de paiement, ni coût d'acquisition. L'ÉTIQUETTE montre,
 * elle, ce que le client a payé pour la livraison et le coût réel de l'étiquette (sa
 * demande du 2026-10-19) : c'est le personnel qui expédie qui choisit le transporteur.
 *
 * ⚠ L'ÉTAT DE VÉRIFICATION VIT DANS `COMPTES`, et il est GARDÉ AU SERVEUR sur la commande
 * (commande:verifEcrire) : fermer la fenêtre, l'application ou changer de poste le retrouve.
 *
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script, COMMENTAIRES COMPRIS : le
 * script vit dans un littéral de gabarit.
 */

const { CSS_SOCLE, CSS_JOUR, JS_SOCLE, ICO, TETE } = require('./socle');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('commande');

const CSS_PROPRE = `
/* ══ L EN-TETE : la commande, le client, et le fil des 4 etapes ══ */
.tete .qui{display:flex;flex-direction:column;gap:.1rem;min-width:0}
.tete .qui .cli{font-size:.8rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bas{display:inline-flex;align-items:center;gap:.35rem;font-size:.7rem;font-weight:800;letter-spacing:.06em;
  padding:.18rem .6rem;border-radius:99px;background:rgba(251,191,36,.16);color:var(--tx-att);
  border:1px solid rgba(251,191,36,.45);text-transform:uppercase;white-space:nowrap}
.bas[hidden]{display:none}
html.jour .bas{background:#fff4d6;color:#7a4b00;border-color:rgba(122,75,0,.35)}
.fil{flex:0 0 auto;display:flex;gap:1.1rem;flex-wrap:wrap;align-items:center;padding:.55rem 1.1rem;
  border-bottom:1px solid var(--v08)}
.fil button{display:inline-flex;align-items:center;gap:.5rem;background:none;border:0;padding:.2rem .1rem;
  font:inherit;font-size:.82rem;color:var(--tx2);cursor:pointer}
.fil button .n{width:1.55rem;height:1.55rem;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;
  font-weight:800;font-size:.74rem;border:1.5px solid var(--v22)}
.fil button.fait .n{background:var(--tx-ok);border-color:var(--tx-ok);color:#0e1522}
html.jour .fil button.fait .n{color:var(--tx-sur-accent)}
.fil button.on{color:var(--tx);font-weight:700}
.fil button.on .n{background:var(--or);border-color:var(--or);color:#17202c}
.fil button:disabled{cursor:default;opacity:.55}
.fil .kbd{font-size:.64rem;color:var(--tx3);margin-left:.15rem}

/* ══ LE CORPS : colonne principale + panneau lateral ══ */
.corps{gap:1.1rem;padding:1rem 1.1rem}
.etape{display:none;flex:1 1 auto;min-width:0;min-height:0;gap:1.1rem;flex-direction:row;position:relative}
.etape.on{display:flex}
.col{flex:1 1 auto;min-width:0;min-height:0;display:flex;flex-direction:column;gap:.75rem;overflow-y:auto}
.cote{flex:0 0 19rem;min-height:0;display:flex;flex-direction:column;gap:.75rem;overflow-y:auto}
.cote.fixe{overflow:hidden}
.boite{background:var(--f-carte);border:1px solid var(--v08);border-radius:13px;padding:.9rem 1rem;
  display:flex;flex-direction:column;gap:.55rem}
.boite .t{font-size:.76rem;color:var(--tx2)}
.cote .pousse{flex:1 1 auto}
.gros-btn{min-height:2.9rem;font-size:.95rem;font-weight:700;width:100%;justify-content:center;display:inline-flex;align-items:center;gap:.45rem}
.kb{font:600 .64rem/1 ui-monospace,Consolas,monospace;padding:.12rem .32rem;border-radius:5px;border:1px solid var(--v16);
  color:var(--tx3);margin-left:.35rem}
button.prim .kb{border-color:rgba(23,32,44,.35);color:#17202c}

/* ══ VERIFICATION ══ */
.reprise{display:flex;align-items:center;gap:.7rem;background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.35);
  border-radius:11px;padding:.55rem .8rem;font-size:.84rem}
.reprise[hidden]{display:none}
.reprise span{flex:1 1 auto;min-width:0}
.scan-l{font-size:.8rem;color:var(--tx2)}
.scan{display:flex;align-items:center;gap:.8rem;background:var(--f-champ);border:2px solid var(--or);border-radius:12px;
  padding:0 .9rem;height:50px;flex:0 0 auto;box-sizing:border-box}
.scan:focus-within{box-shadow:0 0 0 3px rgba(var(--or-rgb),.22)}
.scan.ok{border-color:var(--tx-ok)}
.scan.err{border-color:var(--tx-err)}
.scan svg{flex:0 0 auto;color:var(--or)}
.scan input{flex:1 1 auto;min-width:0;background:transparent;border:0;outline:none;color:var(--tx);
  font:600 1.05rem/1 ui-monospace,Consolas,monospace;letter-spacing:.02em;padding:0;height:auto;
  box-shadow:none!important;border:0!important;outline:none!important;border-radius:0}
.scan input:focus,.scan input:focus-visible{box-shadow:none!important;border:0!important;outline:none!important}
.scan svg{width:22px;height:22px}
.scan input::placeholder{color:var(--tx3);font-weight:500}
.retour{display:flex;align-items:center;gap:.6rem;border-radius:11px;padding:.55rem .8rem;font-size:.9rem;
  min-height:2.6rem;border:1px solid transparent}
.retour.cache{visibility:hidden}
.retour.err{background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.45);color:var(--tx-err2)}
.retour.ok{background:rgba(74,222,128,.1);border-color:rgba(74,222,128,.4);color:var(--tx-ok)}
.retour.att{background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.4);color:var(--tx-att)}
html.jour .retour.err{color:#9b1c1c}
html.jour .retour.ok{color:#1f6b3d}
html.jour .retour.att{color:#7a4b00}
.retour b{font-family:ui-monospace,Consolas,monospace}
.lignes{flex:1 1 auto;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:.5rem}
/* LA GRANDE LISTE = SEULEMENT CE QUI RESTE À SCANNER (2026-10-19), paginée à la hauteur disponible. */
.lg.sort{opacity:0;transform:translateX(1.5rem);transition:opacity .22s,transform .22s}
.v-pagi{flex:0 0 auto;display:flex;align-items:center;justify-content:flex-end;gap:.5rem;font-size:.8rem;color:var(--tx2);min-height:1.9rem}
.v-pagi[hidden]{display:none}
.v-pagi button{min-width:2rem;min-height:1.8rem;padding:0 .4rem}
.v-pagi .pos{font-variant-numeric:tabular-nums}
.v-pagi .reste{margin-right:auto}
/* « PROGRESSION + VALIDÉS » : la barre, puis la liste COMPACTE des articles complets, qui défile dans
   SA boîte — la colonne ne pousse jamais « Continuer » hors de la fenêtre. */
.boite.prog-v{flex:1 1 auto;min-height:9rem;overflow:hidden}
.v-tete{display:flex;justify-content:space-between;align-items:baseline;font-size:.76rem;color:var(--tx2);margin-top:.2rem}
.valides{flex:1 1 auto;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:.2rem;margin:0 -.3rem;padding:0 .3rem}
.vl{display:grid;grid-template-columns:28px minmax(0,1fr) auto auto auto;gap:.45rem;align-items:center;font-size:.8rem;
  padding:.18rem .3rem;border-radius:7px}
.vl:hover{background:var(--v05)}
.vl.arrive{background:var(--v08)}
.vl .mv{width:28px;height:28px;border-radius:6px;overflow:hidden;background:var(--f-pied);display:flex;align-items:center;justify-content:center;font-size:.66rem;font-weight:800;color:var(--tx3)}
.vl .mv .rf-av{width:28px!important;height:28px!important;border-radius:6px!important;font-size:.66rem}
.vl .mv img{width:100%;height:100%;object-fit:cover}
.vl .nm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vl .ok{color:var(--tx-ok);font-weight:800}
.vl .q{color:var(--tx2);font-variant-numeric:tabular-nums}
.vl button{min-width:1.7rem;min-height:1.6rem;padding:0;font-size:.82rem;line-height:1}
.valides .rien{font-size:.76rem;color:var(--tx3);padding:.2rem 0}
.lg{display:grid;grid-template-columns:3.4rem minmax(0,1fr) auto 7.2rem;gap:.85rem;align-items:center;
  padding:.55rem .75rem;border-radius:12px;background:var(--f-carte);border:1px solid var(--v08);
  transition:border-color .2s, background .2s}
.lg.fait{border-color:rgba(74,222,128,.55);background:rgba(74,222,128,.06)}
.lg.trop{border-color:rgba(248,113,113,.6)}
.lg.flash{background:rgba(74,222,128,.18)}
.lg .vg{width:3.4rem;height:3.4rem;border-radius:10px;overflow:hidden;background:var(--f-pied);display:flex;
  align-items:center;justify-content:center;color:var(--tx3);font-weight:800}
.lg .vg .rf-av{width:3.4rem!important;height:3.4rem!important;border-radius:10px!important;font-size:1rem}
.lg .vg img{width:100%;height:100%;object-fit:cover}
.lg .nm{font-weight:700;font-size:.98rem;line-height:1.25;overflow:hidden;text-overflow:ellipsis}
.lg .sk{font:600 .76rem/1.3 ui-monospace,Consolas,monospace;color:var(--tx2);margin-top:.12rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lg .cp{font-variant-numeric:tabular-nums;font-size:1.3rem;font-weight:800;white-space:nowrap}
.lg .cp small{font-size:.86rem;color:var(--tx2);font-weight:600}
.lg .et{display:flex;align-items:center;justify-content:flex-end;gap:.35rem;font-size:.84rem;font-weight:700}
.lg .et.ok{color:var(--tx-ok)}
.lg .et.a{color:var(--tx-bleu)}
.lg .et.tr{color:var(--tx-err)}
html.jour .lg .et.ok{color:#1f6b3d}
html.jour .lg .et.a{color:#1d4f91}
.lg .mn{display:none;gap:.3rem;justify-content:flex-end}
.main-libre .lg .mn{display:flex}
.main-libre .lg .et{display:none}
.lg .mn button{min-width:2.2rem;min-height:2.2rem;padding:0;font-size:1.05rem;font-weight:800}
.prog b{font-size:2.3rem;font-weight:800;line-height:1;font-variant-numeric:tabular-nums;color:var(--tx)}
.prog span{font-size:1rem;color:var(--tx2);font-weight:600}
.barre{height:10px;border-radius:99px;background:var(--v09);overflow:hidden}
.barre i{display:block;height:100%;width:0;background:var(--tx-ok);transition:width .25s}
.coche{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;
  opacity:0;transition:opacity .25s}
.coche.on{opacity:1}
.coche div{background:var(--f-carte);border:2px solid var(--tx-ok);color:var(--tx-ok);border-radius:18px;
  padding:1rem 1.6rem;font-size:1.25rem;font-weight:800;display:flex;align-items:center;gap:.6rem;
  box-shadow:0 18px 40px rgba(0,0,0,.35)}

/* ══ ETIQUETTE ══ */
.tt{display:flex;justify-content:space-between;align-items:baseline;gap:.8rem;flex-wrap:wrap}
.tt h2{margin:0;font-size:1rem}
.tt .note{font-size:.76rem;color:var(--tx2)}
.colis{display:flex;gap:.6rem;flex-wrap:wrap;align-items:flex-end}
.colis .ch{flex:0 0 6.2rem}
.colis .ch input{width:100%}
.tarifs{flex:1 1 auto;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:.45rem;padding-right:.2rem}
.tf{display:grid;grid-template-columns:1.6rem minmax(0,1fr) 6.5rem 5.5rem;gap:.8rem;align-items:center;
  padding:.65rem .85rem;border-radius:12px;background:var(--f-carte);border:1px solid var(--v08);cursor:pointer;
  min-height:2.9rem;text-align:left;font:inherit;color:inherit;width:100%;flex:0 0 auto;box-sizing:border-box}
.tf:hover:not(:disabled){border-color:var(--v22)}
.tf.on{border:2px solid var(--or);background:rgba(var(--or-rgb),.08)}
.tf:disabled{cursor:default;opacity:.62}
.tf .rd{width:1.15rem;height:1.15rem;border-radius:50%;border:2px solid var(--v30);display:inline-block}
.tf.on .rd{border-color:var(--or);background:radial-gradient(circle,var(--or) 0 45%,transparent 50%)}
.tf .nm{font-weight:700;font-size:.92rem;display:flex;gap:.45rem;align-items:center;flex-wrap:wrap}
.tf .sb{display:block;font-size:.76rem;line-height:1.35;color:var(--tx2);margin-top:.25rem}
.tf .px{font-size:1.08rem;font-weight:800;text-align:right;font-variant-numeric:tabular-nums}
.tf .px.moins{color:var(--tx-ok)}
.tf .ec{font-size:.8rem;text-align:right;color:var(--tx-att);font-variant-numeric:tabular-nums}
.tf .ec.zero{color:var(--tx3)}
.pl{font-size:.66rem;font-weight:800;padding:.12rem .5rem;border-radius:99px;white-space:nowrap}
.pl.vente{background:rgba(96,165,250,.16);color:var(--tx-bleu)}
.pl.moins{background:rgba(74,222,128,.16);color:var(--tx-ok)}
.pl.bas2{background:rgba(251,191,36,.16);color:var(--tx-att)}
html.jour .pl.vente{color:#1d4f91}
html.jour .pl.moins{color:#1f6b3d}
html.jour .pl.bas2{color:#7a4b00}
.argent .l{display:flex;justify-content:space-between;gap:.6rem;font-size:.9rem}
.argent .sep{height:1px;background:var(--v08)}
.argent .gain{font-size:1.45rem;font-weight:800;font-variant-numeric:tabular-nums}
.argent .gain.pos{color:var(--tx-ok)}
.argent .gain.neg{color:var(--tx-err)}
html.jour .argent .gain.pos{color:#1f6b3d}
html.jour .argent .gain.neg{color:#9b1c1c}
.e-note{font-size:.8rem;line-height:1.45;color:var(--tx2)}
.e-note b.bac{color:var(--tx-att)}
.e-note .prod{color:var(--tx-att);font-weight:700}
.e-note b,.e-note span{display:inline}
html.jour .e-note b.bac{color:#7a4b00}
html.jour .e-note .prod{color:#9a4a00}
.deja{display:flex;gap:.7rem;align-items:center;background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.35);
  border-radius:11px;padding:.55rem .8rem;font-size:.86rem}
.deja[hidden]{display:none}
.deja span{flex:1 1 auto}

/* ══ EXPEDITION ══ */
.boite.recu{flex-direction:row;gap:1.2rem;align-items:center}
/* LA VRAIE ÉTIQUETTE (2026-10-19) : la vignette du PDF du transporteur, une par page ; un clic l agrandit. */
.etq{flex:0 0 auto;display:flex;gap:.6rem;flex-wrap:wrap;max-width:34rem}
.etq button.vg-e{padding:0;border:1px solid var(--v16);border-radius:8px;background:var(--f-pied);cursor:zoom-in;overflow:hidden;
  width:16.25rem;line-height:0}
.etq button.vg-e img{width:100%;height:auto;display:block}
.etq .sans{width:16.25rem;aspect-ratio:2/3;border:1px dashed var(--v22);border-radius:8px;display:flex;align-items:center;
  justify-content:center;text-align:center;padding:1rem;font-size:.8rem;color:var(--tx2);line-height:1.4}
.etq .att{width:16.25rem;aspect-ratio:2/3;border-radius:8px;background:var(--v05)}
.agr{position:fixed;inset:0;z-index:9400;background:rgba(8,12,20,.82);display:flex;align-items:center;justify-content:center;padding:1.2rem;cursor:zoom-out}
.agr img{max-height:100%;max-width:100%;background:var(--tx-blanc);border-radius:6px}
.recu .inf{display:flex;flex-direction:column;gap:.4rem;min-width:0;flex:1 1 auto}
.recu .ok{font-size:.82rem;color:var(--tx-ok);font-weight:700}
html.jour .recu .ok{color:#1f6b3d}
.recu .qq{font-size:1.1rem;font-weight:800}
.recu .sv{font:600 .95rem/1.2 ui-monospace,Consolas,monospace;color:var(--tx2);word-break:break-all}
.recu .bt{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.2rem}
.cases{display:flex;flex-direction:column;gap:.45rem}
.cases label{display:flex;align-items:center;gap:.75rem;background:var(--f-carte);border:1px solid var(--v08);
  border-radius:11px;padding:.6rem .85rem;font-size:.92rem;min-height:2.8rem;cursor:pointer}
.cases input{width:1.2rem;height:1.2rem;accent-color:var(--tx-ok)}
.envoi div:not(.t){display:flex;gap:.5rem;align-items:flex-start;font-size:.86rem}
.envoi div:not(.t)::before{content:"✓";color:var(--tx-ok);font-weight:800}
.lien{background:none;border:0;color:var(--tx-bleu);font:inherit;font-size:.86rem;cursor:pointer;padding:.3rem;text-align:center}
.lien:hover{text-decoration:underline}
html.jour .lien{color:#1d4f91}
.petit{font-size:.78rem;color:var(--tx2)}
.petit label{display:flex;align-items:center;gap:.45rem;cursor:pointer}
@media (max-width:860px){.cote{flex-basis:15rem}.lg{grid-template-columns:2.8rem minmax(0,1fr) auto 6rem}}
`;

/** Page complète de l'assistant. `id` = commande à préparer. */
function pageCommande(id) {
  const ident = JSON.stringify(String(id || ''));
  return `${TETE()}
<title>${T("Préparation — Administration Sandriza")}</title>
<style>${CSS_SOCLE}${CSS_PROPRE}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.orders}</span>
  <div class="qui"><h1 id="titre">${T("Préparation")}</h1><span class="cli" id="cli"></span></div>
  <span class="bas" id="bas" hidden title="${T("Les étiquettes de ce transporteur se créent avec les clés de test : rien n’est facturé.")}">${T("BAC À SABLE")}</span>
  <span class="sous" id="sous"></span></div>
<div class="fil" id="fil" role="tablist" aria-label="${T("Étapes de la préparation")}"></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions"><button id="btn-prec">${T("Précédent")}</button></span></div>
<script>
(function(){
  'use strict';
  ${JS_SOCLE()}
  MOTIFS.suivi_requis = '${T("Entrez un numéro de suivi, ou cochez « expédier sans numéro ».")}';
  MOTIFS.poids_invalide = '${T("Le poids du colis doit être supérieur à zéro.")}';
  MOTIFS.deja_etiquetee = '${T("Une étiquette existe déjà pour cette commande — rien n’a été commandé.")}';
  MOTIFS.secrets = '${T("Identifiants du transporteur indisponibles. Reconnectez-vous, puis réessayez.")}';
  MOTIFS.config = '${T("Configuration du transporteur incomplète.")}';
  MOTIFS.origine = '${T("Adresse d’expédition incomplète — Configuration puis Transporteurs.")}';
  MOTIFS.destination = '${T("Adresse du destinataire incomplète dans la commande.")}';
  MOTIFS.refus_transporteur = '${T("Le transporteur a refusé la demande.")}';
  MOTIFS.etiquette_absente = '${T("Aucune étiquette enregistrée pour cette commande.")}';
  MOTIFS.impression = '${T("L’impression a échoué.")}';
  MOTIFS.deja_expediee = '${T("Cette commande est déjà expédiée — aucun second courriel n’est parti.")}';
  MOTIFS.reseau = '${T("Le réseau a échoué — rien n’a été commandé.")}';
  MOTIFS.deja_expediee = '${T("Cette commande est déjà expédiée.")}';
  // Les refus du SERVEUR à la création (2026-10-19) : le détail donne la raison exacte.
  MOTIFS.prix_different = '${T("Création refusée : le prix a changé.")}';
  MOTIFS.prix_facture_different = '${T("Prix facturé différent du prix affiché.")}';
  MOTIFS.prix_absent = '${T("Création refusée : prix affiché absent.")}';
  MOTIFS.options_non_cotees = '${T("Création refusée : option non cotée.")}';
  MOTIFS.colis_invalide = '${T("Création refusée : colis ou adresse à corriger.")}';
  MOTIFS.etiquette_existe = '${T("Une étiquette existe déjà pour cette commande.")}';
  MOTIFS.etiquette_en_cours = '${T("Une étiquette est déjà en cours de création.")}';
  MOTIFS.etiquette_bloquee = '${T("Étiquette BLOQUÉE.")}';
  MOTIFS.pas_4x6 = '${T("Ce document n’est pas une étiquette 4 × 6.")}';
  MOTIFS.commande_terminee = '${T("Cette commande est déjà terminée.")}';
  // Le DETAIL (motif du transporteur, de l imprimante) est rendu TEL QUEL : « L impression a
  // échoué. » seul ne disait pas quoi corriger (sa capture du 2026-10-19).
  function expliquerD(r){
    if (r && r.detail) return expliquer(r).replace(/[.]$/, '') + ' — ' + String(r.detail);
    return expliquer(r);
  }

  var ID = ${ident};
  var sous = document.getElementById('sous');
  var CTX = null, CMD = null, EXP = null, COMPTES = {};
  var PDF = null;            // etiquette en base64, gardee pour imprimer sans repasser par le nuage
  var LECTURE = false;       // verrou refuse : cette fenetre ne fait que regarder
  var ETAPE = 0;             // 0 verification, 1 etiquette, 2 expedition
  var BON_IMPRIME = false;   // le bon de commande est sorti (cette seance, ou la commande est deja en preparation)
  var MAIN_LIBRE = false;    // « Cocher à la main » : le lecteur est absent
  var TARIFS = {};           // transporteur -> { etat:'attente'|'ok'|'non', r }
  var CHOIX = null;          // { t, service, reel, nom }
  var AUTO_FAIT = false;     // le passage automatique a l etiquette n a lieu qu une fois
  /* ⚠ L EXPEDITION N A LIEU QU UNE FOIS (2026-10-25, audit) : '' | 'cours' | 'faite'. Sans ce drapeau, F9
     pendant l envoi, F9 apres le succes, ou une case touchee apres le succes (qui rallumait le bouton)
     expediaient une seconde fois — et le client recevait deux courriels « en route ». Le site refuse
     aussi (deja_expediee) : ceci evite d y aller. */
  var EXPEDITION = '';

  function dire(t, cl){ szDire(t, cl); }
  function vide(titre, detail){
    document.getElementById('corps').innerHTML =
      '<div class="vide"><div class="gros">' + esc(titre) + '</div><div>' + esc(detail || '') + '</div></div>';
    document.getElementById('fil').innerHTML = '';
    document.getElementById('btn-prec').disabled = true;
  }
  function argent(n){ return szArgent(Math.round((Number(n) || 0) * 100) / 100); }
  function nomT(cle){
    var t = ((CTX && CTX.transporteurs) || []).find(function(x){ return x.cle === cle; });
    return (t && t.nom) || ({ eshipper: 'eShipper', intelcom: 'Intelcom', purolator: 'Purolator' })[cle] || cle;
  }
  function infoT(cle){ return ((CTX && CTX.transporteurs) || []).find(function(x){ return x.cle === cle; }) || {}; }

  function attendus(){ return CMD.articles.reduce(function(n, a){ return n + a.quantite; }, 0); }
  function comptes(){
    var n = 0;
    CMD.articles.forEach(function(a){ n += Math.min(COMPTES[a.cle] || 0, a.quantite); });
    return n;
  }
  function toutVerifie(){
    return CMD.articles.length > 0 && CMD.articles.every(function(a){ return (COMPTES[a.cle] || 0) === a.quantite; });
  }
  function aSuivi(){ return !!String(val('c-suivi') || '').trim(); }
  function etiquetteFaite(){ return aSuivi() || coché('c-sans'); }

  /* ══ LE FIL : Bon de commande / Vérification / Étiquette / Expédition ═════════════════════
     Le bon n est pas une étape de travail : c est la question posée à l ouverture. Il porte ✓
     quand il est sorti, et un clic le réimprime. Les trois autres se suivent ; avancer par le fil
     passe par la même garde que le bouton de l étape. */
  function fil(){
    var et = [
      { k: 'bon', t: '${T("Bon de commande")}', fait: BON_IMPRIME },
      { k: 0, t: '${T("Vérification")}', fait: toutVerifie() },
      { k: 1, t: '${T("Étiquette")}', fait: etiquetteFaite() },
      { k: 2, t: '${T("Expédition")}', fait: false }
    ];
    document.getElementById('fil').innerHTML = et.map(function(e, n){
      var on = e.k === ETAPE;
      return '<button type="button" role="tab" data-fil="' + e.k + '" aria-selected="' + on + '" class="' + (on ? 'on' : (e.fait ? 'fait' : '')) + '"'
        + (e.k === 'bon' ? ' title="${T("Imprimer (ou réimprimer) le bon de commande")}"' : ' title="Alt+' + n + '"') + '>'
        + '<span class="n">' + (e.fait && !on ? '✓' : (n + 1)) + '</span>' + esc(e.t) + '</button>';
    }).join('');
  }
  document.getElementById('fil').addEventListener('click', function(ev){
    var b = ev.target.closest('[data-fil]'); if (!b) return;
    var k = b.getAttribute('data-fil');
    if (k === 'bon') { imprimer('bon', b); return; }
    aller(parseInt(k, 10) || 0);
  });

  function refusAvancer(cible){
    if (cible >= 1 && !toutVerifie()) return '${T("Vérifiez le colis d’abord —")} ' + comptes() + ' ${T("sur")} ' + attendus() + ' ' + szPl(attendus(), '${T("unité confirmée.")}', '${T("unités confirmées.")}');
    if (cible >= 2 && !etiquetteFaite()) return '${T("Créez l’étiquette, ou cochez « Expédier sans numéro de suivi ».")}';
    return '';
  }
  function aller(k){
    k = Math.max(0, Math.min(2, k));
    if (k > ETAPE) { var r = refusAvancer(k); if (r) { dire(r, 'att'); return; } }
    ETAPE = k;
    Array.prototype.forEach.call(document.querySelectorAll('.etape'), function(el, n){ el.classList.toggle('on', n === ETAPE); });
    document.getElementById('btn-prec').disabled = ETAPE === 0;
    fil();
    if (ETAPE === 0) { dessinerLignes(); focusScan(); }
    if (ETAPE === 1) { entrerEtiquette(); }
    if (ETAPE === 2) { recap(); }
    majBac();
  }
  document.getElementById('btn-prec').onclick = function(){ aller(ETAPE - 1); };

  /* ══ LE BADGE « BAC À SABLE » : le transporteur choisi crée ses étiquettes avec les clés de test ══ */
  function majBac(){
    var t = (CHOIX && CHOIX.t) || (CMD && CMD.transporteur) || '';
    var i = infoT(t);
    var b = document.getElementById('bas');
    if (b) b.hidden = !(t && i.etiquette && i.mode !== 'production');
  }

  function dessiner(){
    var h = [];
    /* 1 — VÉRIFICATION. Champ de scan EN PREMIER et TOUJOURS sous le curseur : on vérifie un
       colis le lecteur à la main, sans regarder l écran. */
    h.push('<div class="etape"><div class="col">'
      + '<div class="reprise" id="v-reprise" hidden><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 3v6h6"></path></svg>'
      + '<span id="v-reprise-t"></span><button type="button" id="v-recommencer">${T("Recommencer")}</button></div>'
      + '<label class="scan-l" for="c-scan">${T("Scannez l’étiquette de chaque article")}</label>'
      + '<div class="scan" id="v-scan"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M11 8v8M15 8v8M18 8v8"></path></svg>'
      + '<input id="c-scan" placeholder="${T("En attente du lecteur…")}" autocomplete="off" spellcheck="false"></div>'
      + '<div class="retour cache" id="v-retour" role="status" aria-live="polite"></div>'
      + '<div class="lignes" id="v-lignes" aria-label="${T("Articles à scanner")}"></div>'
      + '<div class="v-pagi" id="v-pagi" hidden><span class="reste" id="v-reste"></span>'
      + '<button type="button" data-vpg="-1" aria-label="${T("Page précédente")}">‹</button><span class="pos" id="v-pos"></span>'
      + '<button type="button" data-vpg="1" aria-label="${T("Page suivante")}">›</button></div>'
      + '</div>'
      + '<aside class="cote fixe" aria-label="${T("Progression")}">'
      + '<div class="boite prog-v"><div class="t">${T("Progression")}</div>'
      + '<div class="prog"><b id="v-n">0</b> <span id="v-sur"></span></div>'
      + '<div class="barre"><i id="v-barre"></i></div>'
      + '<div class="v-tete"><span id="v-valides-t">${T("Validés")} (0)</span></div>'
      + '<div class="valides" id="v-valides" aria-label="${T("Articles validés")}"></div></div>'
      + '<div class="boite"><div class="t">${T("Lecteur absent ?")}</div>'
      + '<button type="button" id="v-main">${T("Cocher à la main")}</button></div>'
      + '<div class="boite"><div class="t">${T("Documents")}</div>'
      + '<button type="button" id="c-bon"><span class="ic">🖨</span> ${T("Bon de commande")}<span class="kb">Ctrl+B</span></button>'
      + '<button type="button" id="c-colis"><span class="ic">🧾</span> ${T("Bordereau")}</button></div>'
      + '<button type="button" class="prim gros-btn" id="v-continuer" disabled>${T("Continuer → Étiquette")}<span class="kb">F9</span></button>'
      + '</aside><div class="coche" id="v-coche"><div><span>✓</span> ${T("Colis vérifié")}</div></div></div>');

    /* 2 — ÉTIQUETTE. Les tarifs RÉELS de tous les transporteurs configurés, lus en production
       (une cotation ne facture rien), triés ; le choix de la vente présélectionné. */
    h.push('<div class="etape"><div class="col">'
      + '<div class="deja" id="e-deja" hidden><span id="e-deja-t"></span><button type="button" id="e-deja-voir">${T("Aller à l’expédition")}</button></div>'
      + '<div class="tt"><h2 id="e-titre">${T("Tarifs réels")}</h2><span class="note">${T("Lus en production · aucune facturation")}</span></div>'
      + '<div class="colis">'
      + '<div class="ch"><label for="c-poids">${T("Poids (kg)")}</label><input id="c-poids" type="number" min="0.001" step="0.001" value="0.5"></div>'
      + '<div class="ch"><label for="c-dl">${T("Long. (cm)")}</label><input id="c-dl" type="number" min="1" step="1" value="30"></div>'
      + '<div class="ch"><label for="c-dw">${T("Larg. (cm)")}</label><input id="c-dw" type="number" min="1" step="1" value="25"></div>'
      + '<div class="ch"><label for="c-dh">${T("Haut. (cm)")}</label><input id="c-dh" type="number" min="1" step="1" value="8"></div>'
      + '<button type="button" id="e-recoter">${T("Recoter")}</button></div>'
      + '<div class="aide" id="c-poids-note"></div>'
      + '<div class="tarifs" id="e-tarifs" role="radiogroup" aria-label="${T("Tarifs des transporteurs")}"></div>'
      + '<div class="aide">${T("Écart affiché par rapport au tarif le moins cher. Coût réel hors taxes.")}</div>'
      + '</div>'
      + '<aside class="cote" aria-label="${T("Livraison de cette commande")}">'
      + '<div class="boite argent"><div class="t">${T("Livraison de cette commande")}</div>'
      + '<div class="l"><span>${T("Le client a payé")}</span><strong id="e-paye">—</strong></div>'
      + '<div class="l"><span>${T("Étiquette choisie")}</span><strong id="e-cout">—</strong></div>'
      + '<div class="sep"></div>'
      + '<div class="l" style="align-items:baseline"><span>${T("Gain sur la livraison")}</span><strong class="gain" id="e-gain">—</strong></div></div>'
      + '<div class="boite e-note"><div id="e-avis"></div></div>'
      + '<div class="petit"><label><input type="checkbox" id="c-sans"> ${T("Expédier sans numéro de suivi (remise en main propre)")}</label></div>'
      + '<div class="pousse"></div>'
      + '<button type="button" class="prim gros-btn" id="e-creer" disabled><span id="e-creer-t">${T("Créer l’étiquette")}</span><span class="kb">F9</span></button>'
      + '<button type="button" class="gros-btn" id="e-moins" disabled>${T("Prendre le moins cher")}</button>'
      + '</aside></div>');

    // 3 — EXPÉDITION
    h.push('<div class="etape"><div class="col">'
      + '<div class="boite recu"><div class="etq" id="x-etq"></div><div class="inf">'
      + '<div class="ok" id="x-etat"></div><div class="qq" id="x-quoi"></div>'
      + '<div class="ch"><label for="c-suivi">${T("Numéro de suivi")}</label><input id="c-suivi" placeholder="${T("rempli par l’étiquette")}"></div>'
      + '<div class="bt"><button type="button" class="prim" id="c-etiq-imp"><span class="ic">🖨</span> ${T("Imprimer l’étiquette")}</button>'
      + '<button type="button" id="x-bordereau"><span class="ic">🧾</span> ${T("Imprimer le bordereau")}</button>'
      /* (2026-10-20, sa question : « où va se trouver le bouton Annuler l étiquette ») ICI aussi, pas seulement dans la
         fenêtre Expédier : l envoi est annulé chez le transporteur (le site, puis le serveur décident de tout). */
      + '<button type="button" id="x-annuler-etiq" style="color:var(--tx-err)">${T("Annuler l’étiquette")}</button></div>'
      + '</div></div>'
      + '<h2 style="margin:.3rem 0 0;font-size:1rem">${T("Avant de fermer la boîte")}</h2>'
      + '<div class="cases"><label><input type="checkbox" id="x-c1"> ${T("Bordereau glissé dans le colis")}</label>'
      + '<label><input type="checkbox" id="x-c2"> ${T("Étiquette collée sur le dessus")}</label>'
      + '<label><input type="checkbox" id="x-c3"> ${T("Carte de remerciement ajoutée (facultatif)")}</label></div>'
      + '<div class="petit"><label><input type="checkbox" id="c-pret"> ${T("Marquer « prête à l’expédition » (on y revient plus tard)")}</label></div>'
      + '</div>'
      + '<aside class="cote" aria-label="${T("À l’envoi")}">'
      + '<div class="boite envoi"><div class="t">${T("À l’envoi")}</div>'
      + '<div>${T("La commande passe à « Expédiée »")}</div><div>${T("Le client reçoit son courriel avec le suivi")}</div><div>${T("Le stock est déjà ajusté")}</div></div>'
      + '<div class="boite argent"><div class="l" style="align-items:baseline"><span>${T("Gain sur la livraison")}</span><strong class="gain" id="x-gain">—</strong></div></div>'
      + '<div class="pousse"></div>'
      + '<button type="button" class="prim gros-btn" id="btn-enr" disabled>${T("Marquer comme expédiée")}<span class="kb">F9</span></button>'
      + '<button type="button" class="lien" id="x-suivante" hidden></button>'
      + '</aside></div>');

    document.getElementById('corps').innerHTML = h.join('');
    document.getElementById('c-pret').checked = !!CMD.dejaPret;
    poser('c-suivi', CMD.suivi || '');
    brancher();
    fil();
  }

  /* ══ LES LIGNES (2026-10-19, sa demande) ══════════════════════════════════════════════
     La GRANDE liste ne montre que ce qui RESTE à scanner (un article à 1/2 y reste, avec son
     compteur) ; un article COMPLET la quitte (courte sortie) pour la liste « Validés » compacte du
     panneau. La grande liste est PAGINÉE à la hauteur réellement disponible (ResizeObserver) : pas
     de défilement de la fenêtre. La règle de partage est une fonction PURE, éprouvée par le banc. */
  function vueVerif(articles, comptes, parPage, page){
    var restants = [], valides = [];
    (articles || []).forEach(function(a){ ((comptes[a.cle] || 0) >= a.quantite ? valides : restants).push(a); });
    var pp = Math.max(1, parPage | 0);
    var pages = Math.max(1, Math.ceil(restants.length / pp));
    var pg = Math.max(0, Math.min(pages - 1, page | 0));
    return { restants: restants, valides: valides, pages: pages, page: pg, vues: restants.slice(pg * pp, pg * pp + pp) };
  }
  var FLASH = '', ARRIVE = '', PAGE = 0, PAR_PAGE = 0;
  // Combien de lignes tiennent : hauteur de la zone ÷ hauteur d une ligne (mesurée, sinon 78 px).
  function mesurerParPage(){
    var z = document.getElementById('v-lignes');
    var h = z && z.clientHeight ? z.clientHeight : 0;
    var l = z && z.querySelector ? z.querySelector('.lg') : null;
    var lh = (l && l.offsetHeight) ? l.offsetHeight : 78;
    var gap = 8;
    return h > 0 ? Math.max(1, Math.floor((h + gap) / (lh + gap))) : 6;
  }
  function pageDe(cle){
    var v = vueVerif(CMD.articles, COMPTES, PAR_PAGE || mesurerParPage(), 0);
    var i = v.restants.findIndex(function(a){ return a.cle === cle; });
    return i < 0 ? -1 : Math.floor(i / Math.max(1, PAR_PAGE || mesurerParPage()));
  }
  function ligneHtml(a){
    var v = COMPTES[a.cle] || 0;
    return '<div class="lg' + (FLASH === a.cle ? ' flash' : '') + '" data-cle="' + esc(a.cle) + '" data-reste="' + esc(a.cle) + '">'
      + '<div class="vg">' + szVignette(a.image, a.nom, '', a.nom) + '</div>'
      + '<div style="min-width:0"><div class="nm">' + esc(a.nom) + '</div>'
      + '<div class="sk">' + esc([a.sku, a.couleur, a.taille].filter(Boolean).join(' · ')) + '</div></div>'
      + '<div class="cp">' + v + ' <small>/ ' + a.quantite + '</small></div>'
      + '<div><div class="et a">${T("À scanner")}</div><div class="mn"><button type="button" data-moins="' + esc(a.cle) + '" aria-label="${T("Retirer une unité")}">−</button>'
      + '<button type="button" data-plus="' + esc(a.cle) + '" aria-label="${T("Ajouter une unité")}">+</button></div></div>'
      + '</div>';
  }
  function valideHtml(a){
    return '<div class="vl' + (ARRIVE === a.cle ? ' arrive' : '') + '" data-valide="' + esc(a.cle) + '" title="' + esc(a.nom + ' — ' + [a.sku, a.couleur, a.taille].filter(Boolean).join(' · ')) + '">'
      + '<span class="mv">' + szVignette(a.image, a.nom, '', a.nom) + '</span>'
      + '<span class="nm">' + esc(a.nom) + '</span><span class="ok" aria-hidden="true">✓</span>'
      + '<span class="q">×' + a.quantite + '</span>'
      + '<button type="button" data-annuler="' + esc(a.cle) + '" title="${T("Annuler un scan — remettre à scanner")}" aria-label="${T("Annuler un scan")}">↺</button></div>';
  }
  function dessinerLignes(mesure){
    var z = document.getElementById('v-lignes'); if (!z) return;
    z.classList.toggle('main-libre', MAIN_LIBRE);
    if (!PAR_PAGE) PAR_PAGE = mesurerParPage();
    var v = vueVerif(CMD.articles, COMPTES, PAR_PAGE, PAGE);
    PAGE = v.page;
    z.innerHTML = v.vues.map(ligneHtml).join('')
      || (CMD.articles.length ? '<div class="vide">${T("Tout est scanné.")}</div>' : '<div class="vide">${T("Aucun article à préparer dans cette commande.")}</div>');
    // Une fois dessinée, on MESURE pour de vrai (la première passe a supposé 78 px par ligne).
    var pp = mesurerParPage();
    if (!mesure && pp !== PAR_PAGE && z.clientHeight) { PAR_PAGE = pp; return dessinerLignes(true); }
    var pg = document.getElementById('v-pagi');
    if (pg) {
      pg.hidden = v.pages <= 1 && !v.restants.length;
      document.getElementById('v-reste').textContent = v.restants.length + ' ' + szPl(v.restants.length, '${T("restant")}', '${T("restants")}');
      document.getElementById('v-pos').textContent = v.pages > 1 ? (v.page + 1) + ' / ' + v.pages : '';
      Array.prototype.forEach.call(pg.querySelectorAll('[data-vpg]'), function(b){
        b.hidden = v.pages <= 1;
        b.disabled = (b.getAttribute('data-vpg') === '-1') ? v.page === 0 : v.page >= v.pages - 1;
      });
    }
    var zv = document.getElementById('v-valides');
    if (zv) zv.innerHTML = v.valides.map(valideHtml).join('') || '<div class="rien">${T("Aucun article validé pour l’instant.")}</div>';
    var tv = document.getElementById('v-valides-t'); if (tv) tv.textContent = '${T("Validés")} (' + v.valides.length + ')';
    majProgres();
  }
  // La page se recalcule quand la fenêtre change de taille.
  function suivreTaille(){
    var z = document.getElementById('v-lignes');
    if (!z || typeof ResizeObserver === 'undefined') { window.addEventListener('resize', function(){ PAR_PAGE = 0; if (ETAPE === 0) dessinerLignes(); }); return; }
    var dernier = 0;
    new ResizeObserver(function(){ var h = z.clientHeight; if (h && h !== dernier) { dernier = h; PAR_PAGE = 0; if (ETAPE === 0 && CMD) dessinerLignes(); } }).observe(z);
  }
  function majProgres(){
    var att = attendus(), f = comptes();
    var n = document.getElementById('v-n'); if (n) n.textContent = f;
    var s = document.getElementById('v-sur'); if (s) s.textContent = '${T("sur")} ' + att;
    var b = document.getElementById('v-barre'); if (b) b.style.width = (att ? Math.round(f / att * 100) : 0) + '%';
    var c = document.getElementById('v-continuer'); if (c) c.disabled = !toutVerifie();
    fil();
    majExpedier();
  }
  function retour(t, genre){
    var r = document.getElementById('v-retour'); if (!r) return;
    r.className = 'retour ' + (t ? (genre || 'ok') : 'cache');
    r.innerHTML = t || '';
    var sc = document.getElementById('v-scan');
    if (sc) { sc.classList.remove('ok', 'err'); if (genre === 'ok' || genre === 'err') { sc.classList.add(genre); setTimeout(function(){ sc.classList.remove('ok', 'err'); }, 700); } }
  }
  /* ⚠ LE CHAMP DE SCAN A LE CLAVIER, TOUJOURS (2026-10-19, sa demande) — à l ouverture, au retour de
     la fenêtre (la coquille appelle szFocusScan), après chaque scan, après un clic ailleurs que dans un
     vrai champ, après une boîte de confirmation. Jamais au détriment d un VRAI champ de saisie (poids,
     suivi, NIP…) ni d une boîte ouverte. À l étape Vérification seulement. */
  function champActif(){
    var a = document.activeElement;
    if (!a || a === document.body || a.id === 'c-scan') return false;
    return /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName || '') || a.isContentEditable;
  }
  function focusScan(){
    if (ETAPE !== 0) return;
    var s = document.getElementById('c-scan');
    if (!s || document.activeElement === s || champActif() || document.querySelector('.szc-voile, #bc-voile')) return;
    try { s.focus(); } catch (e) {}
  }
  window.szFocusScan = function(){ setTimeout(focusScan, 0); };
  // Un clic ailleurs que dans un champ de saisie (pastille, ligne, fond, bouton) rend le clavier au scan.
  document.addEventListener('click', function(ev){
    if (ETAPE !== 0) return;
    var t = ev.target;
    if (t && (/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName || '') || (t.closest && (t.closest('.szc-voile') || t.closest('#bc-voile'))))) return;
    setTimeout(focusScan, 0);
  });
  // Une boîte de confirmation (szConfirmer) qui se ferme rend aussi le clavier au scan.
  try {
    new MutationObserver(function(ms){
      for (var i = 0; i < ms.length; i++) {
        var r = ms[i].removedNodes || [];
        for (var j = 0; j < r.length; j++) { if (r[j].classList && (r[j].classList.contains('szc-voile') || r[j].id === 'bc-voile')) { setTimeout(focusScan, 0); return; } }
      }
    }).observe(document.body, { childList: true });
  } catch (e) {}
  function premierPlan(){ try { if (P && P.premierPlan) P.premierPlan(); } catch (e) {} }

  /* ══ LE SCAN ══════════════════════════════════════════════════════════════════════════
     - code inconnu / article d une autre commande -> message ROUGE, rien n est compté, le champ
       se vide et GARDE le focus : on scanne le bon article tout de suite ;
     - ligne déjà complète -> message ambre (sinon on scanne deux fois le même article) ;
     - sinon +1, la ligne se coche quand elle est complète, et quand TOUT est scanné on passe
       SEUL à l étiquette, après un court ✓.
     La correspondance du code se fait dans le site (commande:scan) : le code-barres porte la
     forme COMPACTE du SKU. */
  function bip(ok){
    try {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      var a = new C(), o = a.createOscillator(), g = a.createGain();
      o.frequency.value = ok ? 1180 : 320;
      g.gain.value = 0.06;
      o.connect(g); g.connect(a.destination);
      o.start();
      setTimeout(function(){ try { o.stop(); a.close(); } catch (e) {} }, ok ? 70 : 190);
    } catch (e) { /* un poste sans son ne doit pas empecher de verifier */ }
  }
  var FILE_SCAN = Promise.resolve();
  function scanner(code){
    code = String(code || '').trim();
    if (!code) return;
    if (LECTURE) { bip(false); retour('${T("Commande en traitement ailleurs — lecture seule.")}', 'err'); return; }
    // Les scans s enchaînent dans l ORDRE (un lecteur rapide envoie deux codes avant la réponse du premier).
    FILE_SCAN = FILE_SCAN.then(function(){
      return P.appeler('commande:scan', ID, code).then(function(r){
        if (!r || !r.ok) {
          bip(false);
          if (r && r.motif === 'pas_dans_commande') {
            retour('<span><b>' + esc(r.sku || code) + '</b> ' + esc(r.nom ? '(' + r.nom + ') ' : '') + '${T("n’est pas dans cette commande. Rien n’a été compté — scannez l’article suivant.")}</span>', 'err');
          } else if (r && r.motif === 'code_inconnu') {
            retour('<span>${T("Code inconnu :")} <b>' + esc(r.code || code) + '</b>${T(". Rien n’a été compté — scannez l’article suivant.")}</span>', 'err');
          } else {
            retour(esc(expliquer(r)), 'err');
          }
          return;
        }
        var att = 0;
        CMD.articles.forEach(function(a){ if (a.cle === r.cle) att = a.quantite; });
        var v = COMPTES[r.cle] || 0;
        if (!att) { bip(false); retour('<span><b>' + esc(r.sku) + '</b> ${T("n’est plus à expédier (remboursé). Rien n’a été compté.")}</span>', 'att'); return; }
        if (v >= att) { bip(false); retour('<span>${T("Déjà complet :")} <b>' + esc(r.sku) + '</b> (' + att + '/' + att + ')</span>', 'att'); return; }
        compter(r.cle, 1);
        bip(true);
        retour('<span>✓ <b>' + esc(r.sku) + '</b> — ' + (v + 1) + '/' + att + ((v + 1) === att ? ' ${T("(ligne complète)")}' : '') + '</span>', 'ok');
      });
    }).catch(function(){ bip(false); retour('${T("Le scan n’a pas pu être vérifié — réessayez.")}', 'err'); });
  }
  function compter(cle, d){
    var a = CMD.articles.find(function(x){ return x.cle === cle; }); if (!a) return;
    var avant = COMPTES[cle] || 0;
    COMPTES[cle] = Math.max(0, Math.min(a.quantite, avant + d));
    if (d > 0) statutVerification();
    var complet = COMPTES[cle] >= a.quantite && avant < a.quantite;
    var sel = '.lg[data-cle="' + (window.CSS && CSS.escape ? CSS.escape(cle) : cle) + '"]';
    if (complet) {
      // L article COMPLET quitte la grande liste (courte sortie) et arrive dans « Validés ».
      var l = document.querySelector(sel);
      ARRIVE = cle; setTimeout(function(){ ARRIVE = ''; var x = document.querySelector('.vl.arrive'); if (x) x.classList.remove('arrive'); }, 900);
      if (l) { l.classList.add('sort'); setTimeout(dessinerLignes, 230); } else dessinerLignes();
    } else {
      // Encore à scanner : on va à SA page (il peut être sur une autre) et on le met en évidence.
      var pg = pageDe(cle); if (pg >= 0) PAGE = pg;
      FLASH = cle; setTimeout(function(){ FLASH = ''; var x = document.querySelector('.lg.flash'); if (x) x.classList.remove('flash'); }, 700);
      dessinerLignes();
    }
    garderBientot();
    if (toutVerifie() && !AUTO_FAIT) {
      AUTO_FAIT = true;
      var co = document.getElementById('v-coche'); if (co) co.classList.add('on');
      setTimeout(function(){ if (co) co.classList.remove('on'); if (ETAPE === 0 && toutVerifie()) aller((CMD.aUneEtiquette || aSuivi()) ? 2 : 1); }, 900);
    } else if (!toutVerifie()) { AUTO_FAIT = false; }
  }

  /* ══ L AVANCEMENT, GARDÉ AU SERVEUR (commande:verifEcrire) ══════════════════════════════ */
  var GARDE_T = null;
  function garderBientot(){
    if (LECTURE) return;
    clearTimeout(GARDE_T);
    GARDE_T = setTimeout(function(){
      P.appeler('commande:verifEcrire', ID, COMPTES).then(function(r){
        if (!r || !r.ok) dire('${T("L’avancement du scan n’a pas pu être gardé :")} ' + expliquer(r), 'att');
      });
    }, 500);
  }
  function majReprise(){
    var z = document.getElementById('v-reprise'); if (!z) return;
    var v = CMD.verif;
    if (!v || !v.comptes) { z.hidden = true; return; }
    var n = 0; Object.keys(v.comptes).forEach(function(k){ n += v.comptes[k]; });
    if (!n) { z.hidden = true; return; }
    z.hidden = false;
    document.getElementById('v-reprise-t').textContent = '${T("Vérification reprise là où elle avait été laissée —")} ' + n + ' '
      + szPl(n, '${T("article déjà scanné")}', '${T("articles déjà scannés")}')
      + (v.au ? ', ' + szQuand(v.au) : '') + (v.par ? ' ${T("par")} ' + v.par : '') + '.';
  }
  function recommencer(){
    szConfirmer({ titre: '${T("Recommencer la vérification")}',
      texte: '${T("Tous les articles déjà scannés de cette commande repassent à zéro, ici et sur les autres postes.")}',
      oui: '${T("Remettre à zéro")}', prudent: true }).then(function(ok){
      if (!ok) { focusScan(); return; }
      COMPTES = {}; AUTO_FAIT = false; CMD.verif = null;
      P.appeler('commande:verifEffacer', ID).then(function(r){
        if (!r || !r.ok) dire(expliquer(r), 'err'); else dire('${T("Vérification remise à zéro.")}', 'bon');
      });
      majReprise(); dessinerLignes(); retour(''); focusScan();
    });
  }

  /* ══ LE STATUT SUIT LES GESTES (voir l historique : ouverture = « En préparation », première
     unité confirmée = « Vérification »). Le site refuse de reculer un statut. */
  function avancerStatut(voulu){
    if (LECTURE || !voulu || !CTX || !CTX.peutExpedier) return;
    P.appeler('commande:statut', ID, voulu).then(function(r){
      if (r && r.ok && r.statut && !r.inchange) { CMD.statut = r.statut; }
    }).catch(function(){});
  }
  function statutVerification(){
    if (CMD && (CMD.statut === 'pending' || CMD.statut === 'confirmed' || CMD.statut === 'preparing')) avancerStatut('verification');
  }

  function imprimer(genre, b){
    if (LECTURE) { dire('${T("Commande en traitement ailleurs — lecture seule.")}', 'err'); return; }
    if (b) b.disabled = true;
    dire(genre === 'bon' ? '${T("Impression du bon de commande…")}' : '${T("Impression du bordereau…")}');
    P.appeler('commande:bon', ID, genre).then(function(r){
      if (b) b.disabled = false;
      if (!r || !r.ok) { dire(expliquerD(r), 'err'); focusScan(); return; }
      if (genre === 'bon') { BON_IMPRIME = true; fil(); }
      dire(genre === 'bon' ? '${T("Bon de commande envoyé à l’impression.")}' : '${T("Bordereau envoyé à l’impression.")}', 'bon');
      focusScan();
    });
  }

  /* ══ L ÉTIQUETTE ══════════════════════════════════════════════════════════════════════ */
  /* (2026-10-19, sa règle) SEULS les transporteurs ACTIVÉS et munis d identifiants sont interrogés et
     montrés : la liste vient du site (commande:contexte → cotables). Un transporteur désactivé n apparaît
     nulle part — ni tarif, ni ligne d erreur. */
  var COTEURS = [];
  function coteurs(){ return (CTX && Array.isArray(CTX.cotables)) ? CTX.cotables : ['postes-canada', 'fedex', 'purolator', 'intelcom', 'eshipper']; }
  var COTE_N = 0;
  function poidsDims(){
    return { poids: parseFloat(val('c-poids')) || 0,
      dims: { l: parseFloat(val('c-dl')) || 0, w: parseFloat(val('c-dw')) || 0, h: parseFloat(val('c-dh')) || 0 } };
  }
  function entrerEtiquette(){
    var d = document.getElementById('e-deja');
    if (d) {
      var deja = CMD.aUneEtiquette || aSuivi();
      d.hidden = !deja;
      if (deja) document.getElementById('e-deja-t').textContent = '${T("Une étiquette existe déjà")}' + (CMD.suivi ? ' (${T("suivi")} ' + CMD.suivi + ')' : '') + '${T(" — en créer une autre la facturerait une seconde fois.")}';
    }
    if (!Object.keys(TARIFS).length) coter();
    else dessinerTarifs();
  }
  /* Les transporteurs interrogés EN PARALLÈLE, un appel chacun : la liste se remplit à mesure
     que chacun répond, le plus lent ne retient pas les autres. */
  function coter(){
    var pd = poidsDims();
    if (!(pd.poids > 0)) { dire('${T("Le poids du colis doit être supérieur à zéro.")}', 'err'); return; }
    var n = ++COTE_N;
    COTEURS = coteurs();
    TARIFS = {};
    /* Le prix de test retenu pour l etiquette depend du poids et des dimensions (2026-10-25, audit) :
       garde d une cotation a l autre, le bouton « Créer l’étiquette · X $ » montrait le prix de l ancien
       poids, et la creation etait refusee une fois (« prix différent »). */
    PRIX_CREE = {};
    COTEURS.forEach(function(t){ TARIFS[t] = { etat: 'attente' }; });
    dessinerTarifs();
    COTEURS.forEach(function(t){
      P.appeler('expedition:comparer', ID, pd.poids, { transporteurs: [t], dims: pd.dims }).then(function(r){
        if (n !== COTE_N) return;
        if (!r || !r.ok) { TARIFS[t] = { etat: 'non', motif: expliquerD(r) }; }
        else {
          var x = (r.resultats || []).find(function(y){ return y.transporteur === t; });
          TARIFS[t] = x ? (x.ok ? { etat: 'ok', r: x } : { etat: 'non', motif: x.motif || '' }) : { etat: 'eteint' };
        }
        dessinerTarifs();
      }).catch(function(){ if (n === COTE_N) { TARIFS[t] = { etat: 'non', motif: '${T("pas de réponse")}' }; dessinerTarifs(); } });
    });
  }
  // Toutes les options cotées, à plat : une par service (Postes Canada et FedEx en donnent plusieurs).
  function options(){
    var l = [];
    COTEURS.forEach(function(t){
      var e = TARIFS[t]; if (!e || e.etat !== 'ok') return;
      var svcs = (e.r.services && e.r.services.length) ? e.r.services : [{ service: e.r.service, nomService: e.r.nomService, reel: e.r.reel, jours: e.r.jours }];
      var i = infoT(t);
      svcs.forEach(function(s){
        l.push({ t: t, service: s.service, nom: s.nomService || s.service, reel: Number(s.reel) || 0, jours: s.jours || 0,
          etiquette: !!i.etiquette && i.pret !== false, mode: i.mode || 'sandbox' });
      });
    });
    l.sort(function(a, b){ return a.reel - b.reel; });
    return l;
  }
  function venteCle(){
    var c = (EXP && EXP.choixClient) || null;
    return { t: (c && c.transporteur) || CMD.transporteur || '', service: (c && c.service) || CMD.service || '' };
  }
  function prixVente(l){
    var v = venteCle();
    var o = l.find(function(x){ return x.t === v.t && x.service === v.service; });
    if (o) return o.reel;
    var c = EXP && EXP.choixClient;
    return (c && c.coutReel && c.coutReel.reel > 0) ? Number(c.coutReel.reel) : null;
  }
  function dessinerTarifs(){
    var z = document.getElementById('e-tarifs'); if (!z) return;
    var pd = poidsDims();
    document.getElementById('e-titre').textContent = '${T("Tarifs réels — colis")} ' + szNombre(pd.poids, 3) + ' kg · '
      + szNombre(pd.dims.l) + ' × ' + szNombre(pd.dims.w) + ' × ' + szNombre(pd.dims.h) + ' cm';
    var l = options();
    var v = venteCle();
    var moins = l.length ? l[0].reel : 0;
    var creables = l.filter(function(o){ return o.etiquette; });
    // La PRÉSÉLECTION : le choix de la vente s il est coté et étiquetable, sinon le moins cher étiquetable.
    if (!CHOIX || !l.some(function(o){ return o.t === CHOIX.t && o.service === CHOIX.service; })) {
      var pv = creables.find(function(o){ return o.t === v.t && o.service === v.service; })
        || creables.find(function(o){ return o.t === v.t; }) || creables[0] || null;
      CHOIX = pv ? { t: pv.t, service: pv.service, reel: pv.reel, nom: pv.nom } : CHOIX;
    } else {
      var re = l.find(function(o){ return o.t === CHOIX.t && o.service === CHOIX.service; });
      if (re) CHOIX.reel = re.reel;
    }
    var h = l.map(function(o, i){
      var on = CHOIX && CHOIX.t === o.t && CHOIX.service === o.service;
      var vente = o.t === v.t && o.service === v.service;
      var ec = o.reel - moins;
      return '<button type="button" class="tf' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '"'
        + (o.etiquette ? '' : ' disabled') + ' data-t="' + esc(o.t) + '" data-s="' + esc(o.service) + '">'
        + '<span class="rd" aria-hidden="true"></span>'
        + '<span><span class="nm">' + esc(nomT(o.t)) + ' · ' + esc(o.nom)
        + (vente ? ' <span class="pl vente">${T("Choisi à la vente")}</span>' : '')
        + (i === 0 ? ' <span class="pl moins">${T("Le moins cher")}</span>' : '')
        + (o.etiquette && o.mode !== 'production' ? ' <span class="pl bas2">${T("bac à sable")}</span>' : '') + '</span>'
        + '<span class="sb">' + (o.jours ? o.jours + ' ' + szPl(o.jours, '${T("jour ouvrable")}', '${T("jours ouvrables")}') : '')
        + (o.etiquette ? '' : (o.jours ? ' · ' : '') + '${T("cotation seulement — étiquette non branchée dans l’application")}') + '</span></span>'
        + '<span class="px' + (i === 0 ? ' moins' : '') + '">' + argent(o.reel) + '</span>'
        + '<span class="ec' + (ec > 0.004 ? '' : ' zero') + '">' + (ec > 0.004 ? '+' + argent(ec) : '—') + '</span></button>';
    });
    var enCours = [], sans = [];
    COTEURS.forEach(function(t){
      var e = TARIFS[t];
      if (!e || e.etat === 'ok' || e.etat === 'eteint') return;
      if (e.etat === 'attente') { enCours.push(nomT(t)); return; }
      // Identifiants refusés = « sans identifiants valides » : on ne le montre pas (sa règle).
      if (/jeton refus|401|403|authent|identifiants|unauthori/i.test(String(e.motif || ''))) return;
      sans.push(nomT(t) + (e.motif ? ' (' + e.motif + ')' : ''));
    });
    if (enCours.length) h.push('<div class="aide">${T("Interrogation :")} ' + esc(enCours.join(', ')) + '…</div>');
    if (sans.length) h.push('<div class="aide">${T("Sans tarif pour ce colis :")} ' + esc(sans.join(' · ')) + '</div>');
    // Le transporteur de la vente n est plus activé : on ne le liste pas, on le DIT, et le moins cher est présélectionné.
    if (v.t && COTEURS.length && COTEURS.indexOf(v.t) < 0) {
      h.push('<div class="aide">${T("Le transporteur choisi à la vente")} (' + esc(nomT(v.t)) + ') ${T("n’est plus activé.")}</div>');
    }
    var attente = COTEURS.some(function(t){ return TARIFS[t] && TARIFS[t].etat === 'attente'; });
    if (!l.length && !attente && !COTEURS.length) h.unshift('<div class="vide">${T("Aucun transporteur activé. Configuration → Transporteurs.")}</div>');
    else if (!l.length) h.unshift('<div class="vide">' + (attente ? '${T("Interrogation des transporteurs…")}' : '${T("Aucun transporteur actif n’a donné de tarif. Vérifiez Configuration → Transporteurs.")}') + '</div>');
    z.innerHTML = h.join('');
    majArgent(l, creables);
    majBac();
  }
  function majArgent(l, creables){
    l = l || options(); creables = creables || l.filter(function(o){ return o.etiquette; });
    var paye = EXP && EXP.payeClient != null ? Number(EXP.payeClient) : null;
    var cout = CHOIX ? CHOIX.reel : null;
    document.getElementById('e-paye').textContent = paye == null ? '—' : argent(paye);
    document.getElementById('e-cout').textContent = cout == null ? '—' : '− ' + argent(cout);
    var g = document.getElementById('e-gain'), xg = document.getElementById('x-gain');
    var gain = (paye != null && cout != null) ? paye - cout : null;
    [g, xg].forEach(function(el){
      if (!el) return;
      el.textContent = gain == null ? '—' : (gain >= 0 ? '+' : '−') + argent(Math.abs(gain));
      el.className = 'gain' + (gain == null ? '' : (gain >= 0 ? ' pos' : ' neg'));
    });
    var av = document.getElementById('e-avis');
    var i = CHOIX ? infoT(CHOIX.t) : {};
    if (CHOIX && i.mode !== 'production') coterJeuActif();
    var pc = prixCreation();
    var eSb = CHOIX ? PRIX_CREE[cleChoix(CHOIX)] : null;
    if (av) av.innerHTML = !CHOIX ? '${T("Choisissez un tarif.")}'
      : (i.mode === 'production'
        ? '<span class="prod">${T("L’étiquette sera créée en PRODUCTION : elle sera facturée.")}</span>'
        : '${T("L’étiquette est créée dans le")} <b class="bac">${T("bac à sable")}</b>${T(" : rien n’est facturé pendant les essais.")}'
          + '<br>${T("En bac à sable, Postes Canada et FedEx facturent le tarif du COMPTE DE TEST :")} '
          + (eSb && eSb.etat === 'ok' ? '<b>' + argent(eSb.reel) + '</b> ${T("(prix de test vérifié à la création ; prix contrat")} ' + argent(CHOIX.reel) + ').'
             : (eSb && eSb.etat === 'non' ? '<b class="prod">${T("indisponible")}</b> (' + esc(eSb.motif || '') + ').' : '${T("cotation des clés de test…")}')))
        + (paye === 0 ? '<br>${T("Livraison offerte au client : l’étiquette est une dépense.")}' : '');
    var bc = document.getElementById('e-creer');
    if (bc) {
      // Pas de prix vérifiable = pas de création : le serveur refuserait de toute façon.
      bc.disabled = LECTURE || !CTX.peutExpedier || !CHOIX || pc == null;
      var bct = document.getElementById('e-creer-t');
      if (bct) bct.textContent = CHOIX ? '${T("Créer l’étiquette ·")} ' + (pc != null ? argent(pc) : '…') : '${T("Créer l’étiquette")}';
    }
    var bm = document.getElementById('e-moins');
    if (bm) {
      var m = creables[0];
      bm.disabled = LECTURE || !CTX.peutExpedier || !m || (CHOIX && m.t === CHOIX.t && m.service === CHOIX.service);
      bm.textContent = m ? '${T("Prendre le moins cher")} (' + argent(m.reel) + ')' : '${T("Prendre le moins cher")}';
    }
  }
  /* ══ LE PRIX AFFICHÉ = LE PRIX DU JEU QUI CRÉE (2026-10-19, sa décision) ══════════════════════════
     Le relais refuse toute création dont le prix affiché diffère d un cent de sa re-cotation, faite avec
     les clés qui créent. En BAC À SABLE, ce sont les clés de TEST : la ligne choisie est donc re-cotée
     avec elles, et c est CE prix qui part comme « prix affiché » — l écran le dit. En production, prix
     du contrat = prix affiché = prix créé. */
  var PRIX_CREE = {};      // 't|service' -> { etat:'attente'|'ok'|'non', reel }
  function cleChoix(c){ return c ? c.t + '|' + c.service : ''; }
  function prixCreation(){
    if (!CHOIX) return null;
    var i = infoT(CHOIX.t);
    if (i.mode === 'production') return CHOIX.reel;
    var e = PRIX_CREE[cleChoix(CHOIX)];
    return (e && e.etat === 'ok') ? e.reel : null;
  }
  function coterJeuActif(){
    if (!CHOIX) return;
    var i = infoT(CHOIX.t); if (i.mode === 'production') return;
    var k = cleChoix(CHOIX); if (PRIX_CREE[k]) return;
    PRIX_CREE[k] = { etat: 'attente' };
    // La table de CE poids : une reponse arrivee apres un « Recoter » (qui la remplace) est jetee.
    var pd = poidsDims(), c = CHOIX, tab = PRIX_CREE;
    P.appeler('expedition:comparer', ID, pd.poids, { transporteurs: [c.t], dims: pd.dims, jeu: 'actif' }).then(function(r){
      if (tab !== PRIX_CREE) return;
      var x = r && r.ok && (r.resultats || []).find(function(y){ return y.transporteur === c.t && y.ok; });
      var sv = x ? ((x.services && x.services.length ? x.services : [x]).find(function(z){ return z.service === c.service; })) : null;
      PRIX_CREE[k] = sv ? { etat: 'ok', reel: Number(sv.reel) } : { etat: 'non', motif: (x ? '${T("service non offert avec les clés de test")}' : ((r && r.detail) || '${T("pas de réponse")}')) };
      majArgent();
    }).catch(function(){ if (tab !== PRIX_CREE) return; PRIX_CREE[k] = { etat: 'non', motif: '${T("pas de réponse")}' }; majArgent(); });
  }
  function choisir(t, s){
    var o = options().find(function(x){ return x.t === t && x.service === s; });
    if (!o || !o.etiquette) return;
    CHOIX = { t: o.t, service: o.service, reel: o.reel, nom: o.nom };
    dessinerTarifs();
  }
  function creer(){
    if (LECTURE) { dire('${T("Commande en traitement ailleurs — lecture seule.")}', 'err'); return; }
    if (!CHOIX) { dire('${T("Choisissez un tarif.")}', 'att'); return; }
    var pd = poidsDims();
    if (!(pd.poids > 0)) { dire('${T("Le poids du colis doit être supérieur à zéro.")}', 'err'); return; }
    var etapes = [];
    var pv = prixVente(options());
    var v = venteCle();
    // Plus cher que le choix de la vente : on le DIT et on demande.
    if (pv != null && CHOIX.reel > pv + 0.004 && !(CHOIX.t === v.t && CHOIX.service === v.service)) {
      etapes.push({ titre: '${T("Étiquette plus chère que le choix de la vente")}',
        texte: '${T("Le client a choisi un autre service à la caisse. Celui-ci coûte plus cher.")}',
        details: [['${T("Choix de la vente")}', nomT(v.t) + ' · ' + argent(pv)], ['${T("Votre choix")}', nomT(CHOIX.t) + ' · ' + CHOIX.nom + ' · ' + argent(CHOIX.reel)],
          ['${T("Écart")}', '+' + argent(CHOIX.reel - pv)]],
        oui: '${T("Créer quand même")}', prudent: true });
    }
    var forcer = false;
    if (CMD.aUneEtiquette || aSuivi()) {
      forcer = true;
      etapes.push({ titre: '${T("Une étiquette existe déjà")}',
        texte: '${T("Une étiquette a déjà été créée pour cette commande. En créer une seconde la facturerait une seconde fois (sauf en bac à sable).")}',
        details: CMD.suivi ? [['${T("Suivi actuel")}', CMD.suivi]] : [], oui: '${T("Créer une seconde étiquette")}', danger: true });
    }
    var i = infoT(CHOIX.t);
    if (i.mode === 'production') {
      etapes.push({ titre: '${T("Étiquette facturée")}',
        texte: '${T("Ce transporteur est en PRODUCTION : l’étiquette sera facturée.")}',
        details: [['${T("Transporteur")}', nomT(CHOIX.t) + ' · ' + CHOIX.nom], ['${T("Coût estimé")}', argent(CHOIX.reel)]],
        oui: '${T("Créer et payer l’étiquette")}', prudent: true });
    }
    var suite = Promise.resolve(true);
    etapes.forEach(function(e){ suite = suite.then(function(ok){ return ok ? szConfirmer(e) : false; }); });
    suite.then(function(ok){ if (ok) acheter(pd.poids, forcer); });
  }
  function acheter(poids, forcer){
    var b = document.getElementById('e-creer');
    b.disabled = true; dire('${T("Demande au transporteur…")}', 'att');
    var pc = prixCreation();
    if (pc == null) { b.disabled = false; dire('${T("Prix de création non vérifié — rien n’a été envoyé.")}', 'err'); return; }
    var pd = poidsDims();
    P.appeler('expedition:etiquette', ID, CHOIX.t, CHOIX.service, poids, forcer,
      { prixCents: Math.round(pc * 100), dims: pd.dims }).then(function(r){
      b.disabled = false;
      premierPlan();   // ⚠ la fenêtre passait derrière la fenêtre principale pendant la création
      // Le refus du serveur porte sa raison EXACTE (prix affiché / re-coté, service, compte…).
      if (!r || !r.ok) { dire((r && r.detail) ? String(r.detail) : expliquerD(r), 'err'); if (r && /prix/.test(r.motif || '')) { PRIX_CREE = {}; majArgent(); } return; }
      if (!r.suivi) { dire('${T("Aucun numéro reçu : l’étiquette n’a PAS été générée.")}', 'err'); return; }
      poser('c-suivi', r.suivi);
      PDF = r.pdf || null;
      CMD.aUneEtiquette = true; CMD.suivi = r.suivi; CMD.transporteur = CHOIX.t;
      // Le prix RÉEL renvoyé par le transporteur sert au gain (sinon le prix affiché vérifié).
      CMD.etiquette = { t: CHOIX.t, nom: CHOIX.nom, reel: (r.prixFacture != null ? Number(r.prixFacture) : pc) };
      CMD.etiquetteBloquee = r.bloque || r.pdfRefus || '';
      VIGN = null; if (!CMD.etiquetteBloquee) chargerVignettes(true); else VIGN = [];
      majExpedier();
      aller(2);
      if (CMD.etiquetteBloquee) { dire(CMD.etiquetteBloquee, 'err'); return; }
      // On imprime TOUT DE SUITE l étiquette (et le bordereau qui la suit) : c est le geste suivant.
      imprimerEtiquette();
    }).catch(function(){ b.disabled = false; dire('${T("L’opération a échoué.")}', 'err'); });
  }
  function imprimerEtiquette(){
    if (LECTURE) { dire('${T("Commande en traitement ailleurs — lecture seule.")}', 'err'); return; }
    dire('${T("Impression de l’étiquette et du bordereau…")}');
    P.appeler('expedition:imprimer', ID, PDF).then(function(r){
      premierPlan();
      // ⚠ Le succès ne se dit que sur un VERDICT réel ; sinon le vrai motif (imprimante, pilote, PDF).
      if (!r || !r.ok) { dire(expliquerD(r), 'err'); return; }
      if (r.bordereau === false) { dire('${T("Étiquette imprimée — le bordereau ne l’a PAS été :")} ' + (r.bordereauMotif || '?'), 'err'); return; }
      dire(r.etat === 'running' ? '${T("Étiquette partie vers l’imprimante — plus longue que d’habitude.")}'
        : '${T("Étiquette et bordereau imprimés")}' + (r.imprimante ? ' (' + r.imprimante + ')' : '') + '.', 'bon');
    });
  }

  /* ══ L EXPÉDITION ═════════════════════════════════════════════════════════════════════ */
  /* ══ LA VIGNETTE DE L ÉTIQUETTE ══════════════════════════════════════════════════════════
     D abord le fichier TEMPORAIRE du poste ; sinon le site la dessine depuis le PDF (celui qu on vient
     de recevoir, ou celui que la commande garde) et on la range dans le dossier temporaire. Un rendu
     impossible se DIT — jamais un faux code-barres. */
  var VIGN = null;            // null : pas encore cherché · [] : indisponible · [{src}] : prête
  var VIGN_EN_COURS = false;
  function dessinerVignettes(){
    var z = document.getElementById('x-etq'); if (!z) return;
    var aEtiq = CMD && (CMD.aUneEtiquette || aSuivi());
    if (!aEtiq) { z.innerHTML = '<div class="sans">${T("Aucune étiquette — remise en main propre ou à créer.")}</div>'; return; }
    if (VIGN === null) { z.innerHTML = '<div class="att" aria-label="${T("Chargement de l’aperçu")}"></div>'; chargerVignettes(false); return; }
    if (!VIGN.length) { z.innerHTML = '<div class="sans">${T("Aperçu indisponible — l’étiquette reste imprimable.")}</div>'; return; }
    z.innerHTML = VIGN.map(function(p, i){
      return '<button type="button" class="vg-e" data-agr="' + i + '" title="${T("Agrandir")}" aria-label="${T("Agrandir l’étiquette, page")} ' + (i + 1) + '">'
        + '<img src="' + esc(p.src) + '" alt=""></button>';
    }).join('');
  }
  function chargerVignettes(neuve){
    if (VIGN_EN_COURS) return;
    VIGN_EN_COURS = true;
    var fini = function(p){ VIGN_EN_COURS = false; VIGN = p || []; if (ETAPE === 2) dessinerVignettes(); };
    var depuisSite = function(){
      P.appeler('expedition:vignettes', ID, PDF || null).then(function(r){
        if (r && r.ok && r.pages && r.pages.length) {
          fini(r.pages);
          try { if (P.vignettesGarder) P.vignettesGarder(ID, r.pages); } catch (e) {}
        } else fini([]);
      }).catch(function(){ fini([]); });
    };
    if (neuve || !P.vignettesLire) { depuisSite(); return; }
    P.vignettesLire(ID).then(function(l){ if (l && l.length) fini(l); else depuisSite(); }).catch(depuisSite);
  }
  function agrandir(i){
    if (!VIGN || !VIGN[i]) return;
    var v = document.createElement('div');
    v.className = 'agr'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', '${T("Étiquette agrandie")}');
    v.innerHTML = '<img src="' + esc(VIGN[i].src) + '" alt="">';
    var fermer = function(){ document.removeEventListener('keydown', clav, true); if (v.parentNode) v.parentNode.removeChild(v); };
    var clav = function(ev){ if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fermer(); } };
    document.addEventListener('keydown', clav, true);
    v.onclick = fermer;
    document.body.appendChild(v);
  }
  // Détruire la vignette temporaire : expédiée (ici), et au balayage de l ouverture.
  function purgerVignettes(id){ try { if (P.vignettesPurger) P.vignettesPurger(id || ID); } catch (e) {} }
  function balayerVignettes(){
    if (!P.vignettesListe) return;
    P.vignettesListe().then(function(ids){
      ids = (ids || []).filter(function(x){ return x && x !== ID; });
      if (!ids.length) return;
      return P.appeler('commandes:statuts', ids).then(function(r){
        if (!r || !r.ok || !r.statuts) return;
        Object.keys(r.statuts).forEach(function(k){
          // Expédiée, livrée, annulée, supprimée — ou remise à « Confirmée » (la préparation repart du début).
          if (/^(shipped|delivered|cancelled|absente|pending|confirmed)$/.test(r.statuts[k])) purgerVignettes(k);
        });
      });
    }).catch(function(){});
  }

  function recap(){
    var e = CMD.etiquette || {};
    var t = e.t || CMD.transporteur || (CHOIX && CHOIX.t) || '';
    var suivi = String(val('c-suivi') || '').trim();
    dessinerVignettes();
    document.getElementById('x-etat').textContent = suivi ? '${T("Étiquette créée")}' : (coché('c-sans') ? '${T("Sans étiquette — remise en main propre")}' : '${T("Aucune étiquette")}');
    document.getElementById('x-quoi').textContent = (nomT(t) || '') + (e.nom ? ' · ' + e.nom : '') + (e.reel ? ' · ' + argent(e.reel) : '');
    var bi = document.getElementById('c-etiq-imp'); if (bi) bi.disabled = !(CMD.aUneEtiquette || suivi) || !!CMD.etiquetteBloquee;
    // Annulable : un envoi de Postes Canada ou FedEx existe, et le colis n est pas parti (le serveur revérifie).
    var ba = document.getElementById('x-annuler-etiq');
    if (ba) ba.hidden = !(suivi && (t === 'postes-canada' || t === 'fedex') && CMD.statut !== 'shipped' && CMD.statut !== 'delivered');
    if (CMD.etiquetteBloquee) document.getElementById('x-etat').textContent = '${T("Étiquette BLOQUÉE :")} ' + CMD.etiquetteBloquee;
    majArgent();
    majExpedier();
  }
  function majExpedier(){
    var b = document.getElementById('btn-enr'); if (!b) return '';
    var pourquoi = '';
    if (EXPEDITION === 'cours') pourquoi = '${T("Expédition…")}';
    else if (EXPEDITION === 'faite' || (CMD && (CMD.statut === 'shipped' || CMD.statut === 'delivered'))) pourquoi = '${T("Cette commande est déjà expédiée.")}';
    else if (LECTURE) pourquoi = '${T("Commande en traitement ailleurs — lecture seule.")}';
    else if (!CTX || !CTX.peutExpedier) pourquoi = '${T("Votre rôle ne permet pas d’expédier.")}';
    else if (!toutVerifie()) pourquoi = '${T("Vérifiez le colis d’abord —")} ' + comptes() + ' ${T("sur")} ' + attendus() + ' ' + szPl(attendus(), '${T("unité confirmée.")}', '${T("unités confirmées.")}');
    else if (!etiquetteFaite()) pourquoi = '${T("Créez l’étiquette (étape Étiquette), ou cochez « Expédier sans numéro de suivi ».")}';
    else if (CMD && CMD.etiquetteBloquee) pourquoi = '${T("Étiquette BLOQUÉE :")} ' + CMD.etiquetteBloquee;
    else if (!coché('x-c1') || !coché('x-c2')) pourquoi = '${T("Cochez « Bordereau glissé » et « Étiquette collée » avant de fermer la boîte.")}';
    b.disabled = !!pourquoi;
    b.title = pourquoi || '${T("Marquer la commande expédiée et prévenir le client")}';
    return pourquoi;
  }
  function expedier(){
    var refus = majExpedier();
    if (refus) { dire(refus, 'att'); return; }
    var b = document.getElementById('btn-enr');
    EXPEDITION = 'cours';
    b.disabled = true;
    dire('${T("Expédition…")}');
    var t = (CMD.etiquette && CMD.etiquette.t) || CMD.transporteur || (CHOIX && CHOIX.t) || '';
    P.appeler('commande:prete', ID, coché('c-pret')).then(function(){
      return P.appeler('commande:expedier', ID, t, val('c-suivi'), coché('c-sans'));
    }).then(function(r){
      if (!r || !r.ok) {
        // Refus « deja_expediee » : la commande EST expediee (ailleurs, ou par un essai precedent).
        if (r && r.motif === 'deja_expediee') { EXPEDITION = 'faite'; CMD.statut = 'shipped'; } else EXPEDITION = '';
        majExpedier(); dire(expliquerD(r), 'err'); return;
      }
      EXPEDITION = 'faite'; CMD.statut = 'shipped';
      rendreVerrou();
      purgerVignettes(ID);   // commande complétée : la vignette temporaire est détruite
      dire(r.sansSuivi ? '${T("Expédiée sans numéro de suivi.")}' : '${T("Expédiée — courriel envoyé.")}', 'bon');
      var s = CMD.suivante;
      if (s && s.id) {
        b.textContent = '✓ ${T("Expédiée")}';
        var l = document.getElementById('x-suivante');
        l.hidden = false;
        l.textContent = '${T("Commande suivante")} ' + (s.numero || '') + ' (' + s.reste + ' ${T("en attente")}) →';
        l.focus();
      } else {
        setTimeout(function(){ P.fermer(); }, 900);
      }
    }).catch(function(){
      // Aucune reponse : on rend la main (le site refuserait de toute facon une seconde expedition).
      EXPEDITION = ''; majExpedier(); dire(expliquer({ motif: 'echec' }), 'err');
    });
  }
  function suivante(){
    var s = CMD && CMD.suivante; if (!s || !s.id) return;
    P.appeler('commandes:preparer', s.id).then(function(r){
      if (r && r.ok) setTimeout(function(){ P.fermer(); }, 300);
      else dire(expliquer(r), 'err');
    });
  }

  function brancher(){
    var sc = document.getElementById('c-scan');
    sc.addEventListener('keydown', function(ev){
      if (ev.key !== 'Enter') return;
      ev.preventDefault();
      var code = this.value;
      this.value = '';
      scanner(code);
    });
    // Le FOCUS RESTE sur le champ de scan : un clic ailleurs dans l étape (hors champ, hors bouton)
    // le lui rend aussitôt.
    sc.addEventListener('blur', function(){ setTimeout(function(){
      var a = document.activeElement;
      var actif = a && a !== document.body && (/^(INPUT|BUTTON|SELECT|TEXTAREA|A)$/.test(a.tagName || '') || (a.closest && a.closest('.szc-voile')));
      if (ETAPE === 0 && !actif) focusScan();
    }, 0); });
    window.addEventListener('focus', function(){ setTimeout(focusScan, 0); });
    document.getElementById('v-lignes').addEventListener('click', function(ev){
      var p = ev.target.closest('[data-plus]'), m = ev.target.closest('[data-moins]');
      if (LECTURE && (p || m)) { dire('${T("Commande en traitement ailleurs — lecture seule.")}', 'err'); return; }
      if (p) compter(p.getAttribute('data-plus'), 1);
      else if (m) { compter(m.getAttribute('data-moins'), -1); }
    });
    document.getElementById('v-pagi').addEventListener('click', function(ev){
      var b = ev.target.closest('[data-vpg]'); if (!b || b.disabled) return;
      PAGE += parseInt(b.getAttribute('data-vpg'), 10) || 0; dessinerLignes(); focusScan();
    });
    // « Annuler un scan » : l article repasse à scanner (une unité de moins), gardé au serveur.
    document.getElementById('v-valides').addEventListener('click', function(ev){
      var b = ev.target.closest('[data-annuler]'); if (!b) return;
      if (LECTURE) { dire('${T("Commande en traitement ailleurs — lecture seule.")}', 'err'); return; }
      var cle = b.getAttribute('data-annuler');
      var a = CMD.articles.find(function(x){ return x.cle === cle; }); if (!a) return;
      szConfirmer({ titre: '${T("Annuler un scan")}', texte: a.nom + ' — ${T("repasse dans les articles à scanner.")}',
        oui: '${T("Remettre à scanner")}', prudent: true }).then(function(ok){
        if (ok) { AUTO_FAIT = false; compter(cle, -1); retour('<span>↺ <b>' + esc(a.sku || a.nom) + '</b> ${T("remis à scanner.")}</span>', 'att'); }
        focusScan();
      });
    });
    suivreTaille();
    document.getElementById('v-main').onclick = function(){
      MAIN_LIBRE = !MAIN_LIBRE;
      this.textContent = MAIN_LIBRE ? '${T("Revenir au lecteur")}' : '${T("Cocher à la main")}';
      dessinerLignes();
      if (!MAIN_LIBRE) focusScan();
    };
    document.getElementById('v-recommencer').onclick = recommencer;
    document.getElementById('v-continuer').onclick = function(){ aller(1); };
    document.getElementById('c-bon').onclick = function(){ imprimer('bon', this); };
    document.getElementById('c-colis').onclick = function(){ imprimer('colisage', this); };
    document.getElementById('x-bordereau').onclick = function(){ imprimer('colisage', this); };
    document.getElementById('e-tarifs').addEventListener('click', function(ev){
      var b = ev.target.closest('.tf[data-t]'); if (!b || b.disabled) return;
      choisir(b.getAttribute('data-t'), b.getAttribute('data-s'));
    });
    document.getElementById('e-recoter').onclick = coter;
    ['c-poids', 'c-dl', 'c-dw', 'c-dh'].forEach(function(i){
      document.getElementById(i).addEventListener('keydown', function(ev){ if (ev.key === 'Enter') { ev.preventDefault(); coter(); } });
    });
    document.getElementById('e-creer').onclick = creer;
    document.getElementById('e-moins').onclick = function(){
      var m = options().filter(function(o){ return o.etiquette; })[0];
      if (m) { CHOIX = { t: m.t, service: m.service, reel: m.reel, nom: m.nom }; dessinerTarifs(); }
    };
    document.getElementById('e-deja-voir').onclick = function(){ aller(2); };
    document.getElementById('c-sans').onchange = function(){ fil(); majExpedier(); };
    document.getElementById('c-suivi').oninput = function(){ dire(''); fil(); majExpedier(); recap(); };
    document.getElementById('c-etiq-imp').onclick = imprimerEtiquette;
    document.getElementById('x-annuler-etiq').onclick = function(){
      var b = this;
      szConfirmer({ danger: true, titre: '${T("Annuler l’étiquette")}',
        texte: '${T("L’envoi est annulé chez le transporteur et l’étiquette imprimée n’est plus valable. Si elle est déjà payée (compte payé par carte), son remboursement est demandé à la place : il prend quelques jours. Le numéro de suivi est retiré de la commande ; vous pourrez ensuite créer une nouvelle étiquette. Cette action est irréversible.")}',
        oui: '${T("Annuler l’envoi")}' }).then(function(ok){
        if (!ok) return;
        b.disabled = true;
        dire('${T("Demande d’annulation au transporteur…")}', 'att');
        P.appeler('expedition:annulerEtiquette', ID).then(function(r){
          b.disabled = false;
          if (!r || !r.ok) { dire((r && r.detail) ? r.detail : expliquer(r), 'err'); return; }
          CMD.suivi = ''; CMD.aUneEtiquette = false; CMD.etiquette = null; CMD.etiquetteBloquee = '';
          PDF = null; VIGN = null; poser('c-suivi', '');
          dire(r.remboursement ? r.detail : '${T("Étiquette annulée chez le transporteur — rien n’est facturé. Vous pouvez en créer une nouvelle.")}', 'bon');
          aller(1);
        });
      });
    };
    document.getElementById('x-etq').addEventListener('click', function(ev){
      var b = ev.target.closest('[data-agr]'); if (b) agrandir(parseInt(b.getAttribute('data-agr'), 10) || 0);
    });
    ['x-c1', 'x-c2', 'x-c3'].forEach(function(i){ document.getElementById(i).onchange = majExpedier; });
    document.getElementById('btn-enr').onclick = expedier;
    document.getElementById('x-suivante').onclick = suivante;
    /* ⚠ LA CASE « PRÊTE » S ENREGISTRE AU CLIC : c est l état qu on pose pour sortir du dossier. */
    document.getElementById('c-pret').onchange = function(){
      if (LECTURE) { this.checked = !this.checked; dire('${T("Commande en traitement ailleurs — lecture seule.")}', 'err'); return; }
      var v = this.checked;
      P.appeler('commande:prete', ID, v).then(function(r){
        if (r && r.ok) { CMD.dejaPret = v; dire(v ? '${T("Marquée prête à l’expédition.")}' : '${T("Marque « prête » retirée.")}', 'bon'); }
        else dire(expliquer(r), 'err');
      });
    };
  }

  /* ══ LES RACCOURCIS CLAVIER ══
     F9 : le bouton principal de l étape · Alt+1/2/3 : les étapes · Ctrl+B : bon de commande ·
     Échap : fermer (une boîte de confirmation ouverte la ferme d abord, voir le socle). */
  document.addEventListener('keydown', function(ev){
    if (document.querySelector('.szc-voile')) return;
    if (ev.key === 'Escape') {
      if (document.getElementById('bc-voile')) return;
      ev.preventDefault(); P.fermer(); return;
    }
    if (!CMD) return;
    if (ev.key === 'F9') {
      ev.preventDefault();
      var b = ETAPE === 0 ? document.getElementById('v-continuer') : (ETAPE === 1 ? document.getElementById('e-creer') : document.getElementById('btn-enr'));
      /* Bouton desactive a l etape d expedition : on DIT pourquoi, sans jamais expedier (2026-10-25, audit —
         F9 appelait expedier() directement, pendant l envoi comme apres le succes). */
      if (b && !b.disabled) b.click(); else if (ETAPE === 2) { var pq = majExpedier(); if (pq) dire(pq, 'att'); } else if (ETAPE === 0) dire(refusAvancer(1), 'att');
      return;
    }
    if (ev.altKey && /^[1-3]$/.test(ev.key)) { ev.preventDefault(); aller(parseInt(ev.key, 10) - 1); return; }
    if (ev.ctrlKey && (ev.key === 'b' || ev.key === 'B')) { ev.preventDefault(); imprimer('bon', document.getElementById('c-bon')); return; }
    // Une frappe « perdue » (aucun champ actif) à l étape de vérification part dans le champ de scan :
    // un lecteur qui tape alors que le focus s est égaré ne perd pas son premier caractère.
    if (ETAPE === 0 && !ev.ctrlKey && !ev.altKey && ev.key.length === 1) {
      var a = document.activeElement;
      if (!a || a === document.body) focusScan();
    }
  });

  /* ══ LA QUESTION DU BON DE COMMANDE, À L OUVERTURE ══
     Entrée = imprimer, Échap = continuer sans. Elle ne bloque rien : le bon se réimprime par le
     fil (« Bon de commande ») ou par Ctrl+B. */
  function demanderBon(deja){
    var v = document.createElement('div');
    v.id = 'bc-voile';
    v.className = 'szc-voile';
    v.innerHTML = '<div class="szc-boite" role="alertdialog" aria-modal="true">'
      + '<h3><span class="ic">🚀</span> ${T("Préparation de la commande")} ' + esc(CMD.numero) + '</h3>'
      + '<p>' + (deja ? '${T("Cette commande est déjà en préparation. Réimprimer le bon de commande avant de poursuivre ?")}'
                      : '${T("Pour débuter, imprimer le bon de commande ?")}') + '</p>'
      + '<div class="szc-pied"><button type="button" class="szc-non" id="bc-non">${T("Non, continuer")}</button>'
      + '<button type="button" class="szc-oui" id="bc-oui"><span class="ic">🖨</span> ${T("Imprimer le bon")}</button></div></div>';
    document.body.appendChild(v);
    var fermer = function(){ document.removeEventListener('keydown', clav, true); if (v.parentNode) v.parentNode.removeChild(v); setTimeout(focusScan, 0); };
    var clav = function(ev){
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fermer(); }
      else if (ev.key === 'Enter') { ev.preventDefault(); ev.stopPropagation(); fermer(); imprimer('bon', document.getElementById('c-bon')); }
    };
    document.addEventListener('keydown', clav, true);
    document.getElementById('bc-non').onclick = fermer;
    document.getElementById('bc-oui').onclick = function(){ fermer(); imprimer('bon', document.getElementById('c-bon')); };
    try { document.getElementById('bc-oui').focus(); } catch (e) {}
  }

  /* ⚠ LE VERROU SE REND À LA FERMETURE (2026-08-07) — c est lui qui pilote le bouton des listes. */
  var VERROU_PRIS = false;
  function verrou(){
    return P.appeler('verrou:prendre', 'orders', ID).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      if (v.obtenu) { VERROU_PRIS = true; sous.textContent = v.horsLigne ? '${T("hors ligne")}' : '${T("Section verrouillée en modification par :")} ' + (v.par || '${T("vous")}'); return; }
      sous.textContent = '${T("en traitement par")} ' + (v.parQui || '${T("quelqu’un d’autre")}');
      // EN LECTURE POUR DE BON : ni scan, ni impression, ni ACHAT D ÉTIQUETTE (deux étiquettes facturées sinon).
      LECTURE = true;
      dire('${T("Cette commande est déjà en traitement ailleurs — lecture seule.")}', 'err');
      majExpedier();
    });
  }
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    VERROU_PRIS = false;
    try { P.appeler('verrou:rendre', 'orders', ID); } catch (e) {}   // (2026-10-19) [portée, id] : un verrou PAR fiche
  }
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });

  /* ⚠ L ÉTAPE D ARRIVÉE SUIT L ÉTAT : étiquette déjà créée -> Expédition ; colis déjà entièrement
     vérifié -> Étiquette ; sinon Vérification. La question du bon : au début du parcours, ou en
     re-entrée d une préparation sans étiquette — jamais quand on vient vérifier ou expédier. */
  function accueillir(statut){
    avancerStatut('preparing');
    if (statut !== 'pending' && statut !== 'confirmed') BON_IMPRIME = true;
    // Une étiquette existe déjà : la vérification (remise à zéro au retour à « Confirmée ») se refait, puis
    // on va DIRECTEMENT à l expédition — l étiquette est conservée, on ne la recrée pas.
    if (CMD.aUneEtiquette || aSuivi()) { if (toutVerifie()) { AUTO_FAIT = true; aller(2); } else aller(0); return; }
    if (toutVerifie()) { AUTO_FAIT = true; aller(1); return; }
    aller(0);
    if (statut === 'verification' || LECTURE) return;
    demanderBon(statut === 'preparing');
  }

  /* ══ REMISE À « CONFIRMÉE » AILLEURS (2026-10-19, sa demande) ══════════════════════════════════
     Un retour à « Confirmée » (autre poste, fenêtre Commandes…) remet la préparation À ZÉRO côté
     serveur (prepRemise). La fenêtre ouverte le voit au prochain relevé (toutes les 10 s, et à chaque
     retour de la fenêtre) : la vérification recommence ; l étiquette, elle, est conservée. */
  var PREP_REMISE_VUE = '';
  function verifierRemise(r){
    var pr = r && r.prepRemise;
    if (!pr || !pr.au || pr.au === PREP_REMISE_VUE) return false;
    PREP_REMISE_VUE = pr.au;
    COMPTES = {}; AUTO_FAIT = false; CMD.verif = null; CMD.statut = r.statut; PAGE = 0; PAR_PAGE = 0;
    if (ETAPE === 0) dessinerLignes(); else aller(0);
    majReprise(); fil(); majExpedier();
    retour('<span>${T("La commande a été remise à Confirmée par")} <b>' + esc(pr.par || '${T("quelqu’un")}') + '</b>${T(" — la préparation recommence.")}</span>', 'att');
    dire('${T("La commande a été remise à Confirmée par")} ' + (pr.par || '${T("quelqu’un")}') + '${T(" — la préparation recommence.")}', 'att');
    return true;
  }
  setInterval(function(){
    if (!CMD || document.hidden) return;
    P.appeler('commande:lire', ID).then(function(r){ if (r && r.ok) verifierRemise(r); }).catch(function(){});
  }, 10000);

  /* ⚠ APPELÉ PAR LA COQUILLE quand le bouton du site rouvre une fenêtre DÉJÀ ouverte : on relit
     la commande (statut, suivi, avancement du scan venu d un autre poste) sans perdre la saisie. */
  window.szRevenir = function(){
    var v = document.getElementById('bc-voile');
    if (v && v.parentNode) v.parentNode.removeChild(v);
    P.appeler('commande:lire', ID).then(function(r){
      if (!r || !r.ok || !CMD) return;
      if (verifierRemise(r)) return;
      CMD.statut = r.statut;
      CMD.suivante = r.suivante;
      if (r.suivi && !aSuivi()) { poser('c-suivi', r.suivi); CMD.suivi = r.suivi; CMD.aUneEtiquette = true; }
      if (r.verif && r.verif.comptes) {
        Object.keys(r.verif.comptes).forEach(function(k){ COMPTES[k] = Math.max(COMPTES[k] || 0, r.verif.comptes[k]); });
      }
      if (ETAPE === 0) dessinerLignes();
      fil(); majExpedier(); focusScan();
    });
  };

  function charger(){
    P.appeler('commande:contexte').then(function(c){
      if (!c || !c.ok) { vide('${T("Préparation indisponible")}', expliquer(c)); return; }
      CTX = c;
      return P.appeler('commande:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('${T("Commande indisponible")}', expliquer(r)); return; }
        CMD = r;
        PREP_REMISE_VUE = (r.prepRemise && r.prepRemise.au) || '';
        // L avancement GARDÉ AU SERVEUR : on reprend là où on s était arrêté.
        COMPTES = {};
        if (r.verif && r.verif.comptes) Object.keys(r.verif.comptes).forEach(function(k){ COMPTES[k] = r.verif.comptes[k]; });
        var statutOuverture = r.statut;
        document.getElementById('titre').textContent = '${T("Préparation —")} ' + r.numero;
        document.title = '${T("Préparation —")} ' + r.numero;
        document.getElementById('cli').textContent = [r.client, attendus() + ' ' + szPl(attendus(), '${T("article")}', '${T("articles")}'),
          [r.ville, r.province, r.codePostal].filter(Boolean).join(' ')].filter(Boolean).join(' · ')
          + (r.prioritaire ? ' · ${T("Prioritaire")}' : '') + (r.notes ? ' · ${T("Note :")} ' + r.notes : '');
        dessiner();
        majReprise();
        balayerVignettes();
        // Plus d étiquette sur la commande (retirée, remplacée) : la vignette temporaire du poste n a plus d objet.
        if (!CMD.aUneEtiquette && !CMD.suivi) purgerVignettes(ID);
        return verrou().then(function(){
          chargerExpedition();
          accueillir(statutOuverture);
          if (!CTX.peutExpedier) dire('${T("Votre rôle ne permet pas d’expédier.")}', 'att');
        });
      });
    });
  }
  /* Le poids NET (articles moins remboursements) et ce que le client a payé viennent du site
     (expedition:lire) — la même source que la fenêtre Expédition. Une estimation se DIT. */
  function chargerExpedition(){
    return P.appeler('expedition:lire', ID).then(function(r){
      if (!r || !r.ok) return;
      EXP = r.commande || {};
      if (r.poids) {
        var p = document.getElementById('c-poids');
        if (p && r.poids.calcule > 0) p.value = r.poids.calcule;
        var n = document.getElementById('c-poids-note');
        if (n) {
          n.textContent = r.poids.estime
            ? '${T("Certains articles n’ont pas de poids configuré — estimation à 300 g par article. Vérifiez : le poids fixe le prix.")}'
            : '${T("Poids calculé depuis les articles de la commande.")}';
          n.style.color = r.poids.estime ? 'var(--tx-att)' : 'var(--tx2)';
        }
      }
      if (ETAPE === 1) coter();
      else majArgent();
      majBac();
    }).catch(function(){});
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageCommande };
