'use strict';

/*
 * FENÊTRE « INVENTAIRE » — NATIVE, LES QUATRE ONGLETS DE L'ÉCRAN DU SITE
 * =============================================================================
 * D'abord bâtie comme « Ajustement de stock » (la liste de réachat, le scan et
 * la grille des variantes), elle porte depuis 1.35.0 l'écran d'inventaire
 * ENTIER : Produits (tuiles, recherche, filtres, SKU, vente finale en lot),
 * Réapprovisionnement, Produits endommagés (avec le rapport imprimable,
 * reconstruit des DONNÉES — celui du site lisait le tableau affiché) et
 * Entrepôt (ajout/édition en ligne, suppression refusée si utilisé).
 * La SUPPRESSION d'un produit se fait ici aussi (demandé le 2026-08-07) : même
 * cœur que la modale du site (`Admin._produitSupprimerEcrire` — nettoyage R2,
 * purge de l'historique), confirmation dans la fenêtre, droits au pont.
 * « Modifier » ouvre l'assistant Produit natif.
 * Elle ne charge aucune page du site et ne fait aucun appel web — tout passe
 * par le pont, qui interroge la fenêtre principale, seule porteuse de la
 * session.
 *
 * ⚠⚠ CE QU'IL A FALLU FAIRE AVANT D'ÉCRIRE UNE SEULE LIGNE D'ICI.
 * `Admin.saveStock` LISAIT LE DOM : elle allait chercher, pour chaque taille ×
 * couleur, les champs `stock-…`, `seuil-…`, `wh-…` de la modale du site. Appelée
 * depuis une fenêtre native — où aucun de ces champs n'existe — chaque lecture
 * aurait rendu `0`. Résultat : l'inventaire ENTIER du produit remis à zéro, sans
 * une erreur, sous un « Inventaire mis à jour. » vert. Une vente ratée se voit
 * dans la minute ; un stock effacé ne se découvre qu'au réassort, des semaines
 * plus tard, quand il n'y a plus rien à quoi le comparer.
 * La règle vit donc dans `Admin._stockEcrire`, qui ne touche à aucun élément
 * d'écran, et la modale du site en est devenue un simple lecteur de grille. Les
 * deux écrans enregistrent par le MÊME chemin.
 *
 * ⚠⚠ L'ÉTAT VIT HORS DE LA LISTE, ET C'EST VITAL ICI.
 * La grille est paginée et filtrable. Si l'on lisait les champs à
 * l'enregistrement, on n'obtiendrait que la PAGE AFFICHÉE — et le cœur, qui
 * exige une grille complète, refuserait ; ou pire, sans ce garde, on écrirait des
 * zéros partout ailleurs. Toute saisie est donc recopiée dans `VARS` à l'instant
 * où elle se fait, et c'est `VARS` — entier — qui part.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne et casse toute la fenêtre. C'est arrivé six fois ici.
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
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}

/* ⚠ LE CORPS NE DEFILE PAS. Seule la GRILLE des variantes peut defiler, et
   seulement quand une page ne tient pas — la pagination existe justement pour
   que cela n arrive pas. Le bouton d enregistrement reste toujours en vue. */
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;
  display:flex;flex-direction:column;gap:.6rem}

.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem;flex:0 0 auto;min-height:0}
.carte.plein{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}
.carte h2{margin:0 0 .45rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:#8fa1b8;font-weight:700}
.carte h2 .note{font-weight:400;text-transform:none;letter-spacing:0;color:#6d7f96}

input,select{font:inherit;color:#e8edf5;background:#0f1826;
  border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:.3rem .45rem;
  width:100%;min-width:0}
input:focus,select:focus{outline:none;border-color:#c9a97e}
input.manque,select.manque{border-color:#f87171}
#rech{font-size:1rem;padding:.45rem .6rem}

button{font:inherit;cursor:pointer;border-radius:8px;padding:.32rem .7rem;
  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);
  color:#e8edf5;transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.prim:hover:not(:disabled){background:#d8bd97;border-color:#d8bd97}
button.mini{padding:.12rem .42rem;font-size:.74rem}

/* Encarts d avertissement : le meme jaune que l administration. */
.avis{font-size:.78rem;line-height:1.45;border-radius:9px;padding:.45rem .7rem;
  background:rgba(245,158,11,.11);border:1px solid rgba(245,158,11,.42);color:#f0c987}
.aide{font-size:.73rem;color:#8fa1b8;line-height:1.45}
.aide b{color:#cbd8e6;font-weight:600}

/* ── Filtres couleur / taille ─────────────────────────────────────────────── */
.filtres{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;margin-bottom:.45rem}
.filtres .lbl{font-size:.72rem;color:#8fa1b8}
.menu{position:relative}
.menu .voile2{position:fixed;inset:0;z-index:39}
.menu .liste{position:absolute;top:calc(100% + 5px);left:0;z-index:40;min-width:170px;
  max-height:240px;overflow-y:auto;background:#16202f;border:1px solid rgba(255,255,255,.14);
  border-radius:9px;box-shadow:0 12px 30px rgba(0,0,0,.45);padding:.3rem}
.menu .liste label{display:flex;align-items:center;gap:.5rem;padding:.3rem .45rem;
  cursor:pointer;font-size:.8rem;border-radius:5px}
.menu .liste label:hover{background:rgba(255,255,255,.06)}
.menu .liste input{width:auto}

/* ── La grille des variantes ──────────────────────────────────────────────── */
.grille{flex:1 1 auto;min-height:0;overflow-y:auto}
.grille::-webkit-scrollbar{width:8px}
.grille::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
table{width:100%;border-collapse:collapse;font-size:.86rem}
thead th{position:sticky;top:0;background:#1b2635;text-align:left;
  padding:.34rem .5rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700}
thead th.c{text-align:center}
tbody td{padding:.24rem .5rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody td.c{text-align:center}
tbody tr.a{background:rgba(34,197,94,.07)}
tbody .var{display:inline-flex;align-items:center;gap:.5rem;white-space:nowrap}
tbody .pastille{width:14px;height:14px;border-radius:50%;flex:0 0 auto;
  border:1px solid rgba(0,0,0,.3)}
tbody .pastille.deg{border-radius:4px}
tbody .nom{font-size:.85rem;font-weight:600}
tbody tr.a .nom{color:#4ade80}
tbody .code{font-family:ui-monospace,monospace;font-size:.72rem;color:#c9a97e}
tbody .rien{color:#6d7f96}
td.q input,td.s input{width:4.6rem;text-align:center}
td.e select{min-width:8rem}

.pagi{flex:0 0 auto;display:flex;align-items:center;gap:.55rem;padding-top:.45rem;
  margin-top:.35rem;border-top:1px solid rgba(255,255,255,.07);
  font-size:.78rem;color:#8fa1b8;flex-wrap:wrap}
.pagi .pos{margin-left:auto}
.pagi select{width:auto;padding:.16rem .35rem;font-size:.76rem}

/* ── Liste de reachat et resultats de recherche ───────────────────────────── */
.lignes{flex:1 1 auto;min-height:0;overflow-y:auto}
.lignes::-webkit-scrollbar{width:8px}
.lignes::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.lg{display:flex;align-items:center;gap:.6rem;padding:.3rem .45rem;border-radius:7px;
  cursor:pointer;font-size:.85rem;border-top:1px solid rgba(255,255,255,.05)}
.lg:first-child{border-top:0}
.lg:hover{background:rgba(255,255,255,.055)}
.lg .principal{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lg .det{color:#8fa1b8;font-size:.78rem}
.lg .fin{flex:0 0 auto;font-size:.78rem;color:#8fa1b8;white-space:nowrap}
.lg .q{font-weight:700}
.lg .q.rup{color:#f87171}
.lg .q.bas{color:#fbbf24}

.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);
  background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
.actions{flex:0 0 auto;display:flex;gap:.4rem}
.vide{padding:1.5rem 1rem;text-align:center;color:#8fa1b8;font-size:.86rem}

/* Le compte rendu : un voile, pas une boite du systeme — celle-ci s ouvrirait
   DERRIERE la fenetre, comme le decompte d inactivite l a fait. */
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.5rem;z-index:50}
.voile .boite{background:#16202f;border:1px solid rgba(255,255,255,.12);
  border-radius:13px;padding:1.1rem 1.25rem;max-width:34rem;width:100%;
  max-height:80vh;overflow-y:auto}
.voile h3{margin:0 0 .55rem;font:700 1.05rem/1.25 Georgia,serif}
.voile p{margin:.35rem 0;font-size:.86rem}
.voile .rangee{display:flex;justify-content:space-between;gap:1rem;padding:.22rem 0;
  font-size:.84rem;border-top:1px solid rgba(255,255,255,.06)}
.voile .fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.85rem}
.voile textarea{width:100%;font:inherit;font-size:.78rem;color:#e8edf5;
  background:#0f1826;border:1px solid rgba(255,255,255,.14);border-radius:8px;
  padding:.4rem .5rem;resize:none}
/* ── Les quatre onglets ───────────────────────────────────────────────────── */
.onglets{flex:0 0 auto;display:flex;gap:.25rem;padding:.5rem 1.05rem 0;
  border-bottom:1px solid rgba(255,255,255,.08);background:#0e1522}
.onglets button{border:1px solid transparent;border-bottom:none;
  border-radius:9px 9px 0 0;background:transparent;color:#8fa1b8;
  padding:.42rem .85rem;font-size:.82rem}
.onglets button.actif{background:#16202f;border-color:rgba(255,255,255,.09);
  color:#e8edf5;font-weight:600}
.onglets button:hover:not(.actif){background:rgba(255,255,255,.05)}

/* ── Tuiles de statistiques (onglet Produits) ─────────────────────────────── */
.tuiles{display:grid;grid-template-columns:repeat(5,1fr);gap:.5rem;flex:0 0 auto}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);
  border-radius:10px;padding:.45rem .65rem;min-width:0}
.tuile .lbl{font-size:.64rem;text-transform:uppercase;letter-spacing:.07em;
  color:#8fa1b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile .val{font-size:1.22rem;font-weight:700;line-height:1.25}
.tuile .sub{font-size:.67rem;color:#6d7f96;white-space:nowrap;overflow:hidden;
  text-overflow:ellipsis}
.tuile.att{border-color:rgba(245,158,11,.5)}
.tuile.err{border-color:rgba(239,68,68,.5)}
.val.att{color:#fbbf24}.val.err{color:#f87171}.val.bon{color:#4ade80}
/* Une tuile qui FILTRE se reconnait au survol — et au clavier de la souris
   seulement : pas de :hover-only pour l information, juste pour l affordance. */
.tuile.cliq{cursor:pointer;user-select:none}
.tuile.cliq:hover{border-color:#c9a97e}
/* La ligne entiere ouvre la fiche (demande le 2026-08-08) : la selection de
   texte avalerait le clic (le bug connu des controles cliquables), donc
   user-select:none sur la ligne — les codes se copient depuis la fiche. */
tbody tr[data-ligne]{cursor:pointer;user-select:none}
tbody tr[data-ligne]:hover td{background:rgba(255,255,255,.045)}

/* Pastilles d etat, badges et puce de categorie */
.pill{display:inline-block;font-size:.65rem;padding:.05rem .5rem;
  border-radius:99px;white-space:nowrap}
.pill.rup{background:rgba(239,68,68,.16);color:#f87171}
.pill.bas{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.ok{background:rgba(34,197,94,.14);color:#4ade80}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.badge{display:inline-block;font-size:.6rem;padding:0 .4rem;border-radius:99px;
  margin-left:.35rem;vertical-align:1px}
.badge.vente{background:#c9a97e;color:#17202c}
.badge.finale{background:#dc2626;color:#fff}
.puce{width:10px;height:10px;border-radius:50%;display:inline-block;
  vertical-align:middle}

/* Barre du mode << vente finale en lot >> */
.lot{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;
  background:#241a08;border:1px solid rgba(245,158,11,.4);border-radius:9px;
  padding:.45rem .7rem;font-size:.8rem}
.lot label{display:flex;align-items:center;gap:.4rem;cursor:pointer}
.lot input{width:auto}
button.rouge{background:#dc2626;border-color:#dc2626;color:#fff;font-weight:600}
button.rouge:hover:not(:disabled){background:#ef4444;border-color:#ef4444}
button.vert{background:#16a34a;border-color:#16a34a;color:#fff;font-weight:600}
button.vert:hover:not(:disabled){background:#22c55e;border-color:#22c55e}

.toolbar{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;
  margin-bottom:.45rem}
.toolbar input[type=text]{width:15rem}
.toolbar select{width:auto}
.toolbar .droite{margin-left:auto;display:flex;gap:.4rem;align-items:center}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Inventaire » (les quatre onglets).
 *  `id` : vide = onglet Produits ; « onglet:reappro » (ou endommages,
 *  entrepots) = ouvrir sur cet onglet ; tout autre = ouvrir la grille de ce
 *  produit directement. */
function pageInventaire(id) {
  const depart = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Inventaire — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">📦</span><h1 id="titre">Inventaire</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="corps" id="corps"></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions" id="actions"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var actions = document.getElementById('actions');
  var sous = document.getElementById('sous');

  var onglets = document.getElementById('onglets');

  var CTX = null;      // contexte : entrepots, droit d ecriture, seuil general
  // L onglet courant, et — a l interieur de Reapprovisionnement — la sous-vue.
  var ONGLET = 'produits'; // 'produits' | 'reappro' | 'endommages' | 'entrepots'
  var VUE = 'reappro'; // 'reappro' | 'recherche' | 'produit' (la grille)
  var REAPPRO = [];    // lignes de la liste de reachat
  var TROUVES = [];    // resultats de la recherche par nom
  var PROD = null;     // { id, nom, sku, seuilHerite }
  var VARS = [];       // ⚠ L ETAT DE LA GRILLE, HORS de la liste affichee
  var BASE = null;     // instantane pris a l OUVERTURE — reference du conflit
  var ENTREPOTS = [];
  var FILTRE = { couleur: [], taille: [], menu: null };
  var PAGE = 0, TAILLE_PAGE = 25, GRILLE_AUTO = true;
  var enCours = false;

  // ── Onglet Produits ── La liste est paginee et filtree PAR LE SITE
  // (stock:produits) : la fenetre n envoie que le filtre, jamais un catalogue.
  var PRODS = null;    // derniere reponse de stock:produits
  var FP = { q: '', etat: '', cats: [], page: 0, parPage: 25, menu: false, auto: true };
  // ⚠ Mode << vente finale en lot >> : les coches vivent ICI, pas dans les cases
  // affichees — l ecran du site ne lisait que la PAGE VISIBLE de ses cases, une
  // selection posee puis paginee etait perdue sans un mot.
  var LOT = false, COCHES = {};
  var NB_REAPPRO = null; // compte pour le libelle de l onglet (des qu on le sait)

  // ── Onglet Produits endommages ──
  var DMG = null, DMG_AN = 'all';

  // ── Onglet Entrepot ──
  var WHS = null;
  var WH_EDIT = null;  // null | { id:'' (ajout) | id (edition) }

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  // ⚠ Une BONNE nouvelle s efface d elle-meme : << Fiche produit ouverte dans sa
  // fenetre >> qui reste affiche des heures finit par mentir. Les ERREURS et les
  // avertissements, eux, restent — on doit pouvoir les lire en revenant.
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  // ⚠ CHAQUE REFUS A SA PHRASE. Un ecran muet sur un refus de droit ressemble a
  // une panne, et l on cherche partout sauf dans les permissions.
  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne permet pas de modifier l’inventaire.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps. Réessayez ; si cela persiste, rechargez-la (Ctrl+R).',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Ce produit n’existe plus.',
    verrou:             'Produit ouvert par quelqu’un d’autre.',
    session_expiree:    'Inventaire NON enregistré — session expirée (inactivité, ou même compte utilisé ailleurs). Reconnectez-vous, puis refaites la saisie.',
    reseau:             'Inventaire NON enregistré (réseau). Réessayez.',
    agent_absent:       'Impression indisponible dans cette fenêtre.',
    aucune_etiquette:   'Aucune étiquette à imprimer (quantité 0).',
    imprimante:         'Aucune imprimante de codes-barres prête — voir Configuration puis Imprimantes.',
    impression:         'L’impression a échoué.',
    categorie_sans_code: 'Aucun code de catégorie configuré.',
    aucun_produit:      'Aucun produit sélectionné.',
    code_requis:        'Donnez un nom à l’emplacement.',
    version_coquille:   'Cette version de l’application ne sait pas ouvrir cette fenêtre — quittez et relancez pour la mettre à jour.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (m === 'verrou') return MOTIFS.verrou + (r.parQui ? ' (' + r.parQui + ')' : '');
    if ((m === 'imprimante' || m === 'impression') && r.detail) return MOTIFS[m] + ' ' + esc(r.detail);
    // Les refus RACONTES du nouvel onglet Produits / Entrepot.
    if (m === 'collision') return 'Impossible : ' + esc(r.avant) + ' deviendrait ' + esc(r.apres) + ', déjà utilisé.';
    if (m === 'emplacement_utilise') return 'Suppression impossible — ' + (r.n || '?')
      + ' variante(s) utilisent l’emplacement ' + esc(r.code || '') + '. Réassignez-les d’abord.';
    return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
  }

  /* ⚠ UN SEUL POINT D APPEL, AVEC LE RATTRAPAGE CHAINE. Le second argument de
     << then >> ne rattrape que le rejet de la promesse d avant : ce que le premier
     LEVE lui passe a cote et devient un rejet non traite, invisible dans une
     fenetre native. Cette nuance a couche la fenetre Imprimantes pendant quatre
     versions publiees. Ici, tout passe par appeler(). */
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
    brancherFermer();
  }

  // ══ DESSIN ════════════════════════════════════════════════════════════════
  // ⚠ TOUT LE DESSIN PASSE PAR ICI, et rien d autre n ecrit dans le corps : c est
  // ce qui rend la fenetre eprouvable au chargement (voir le garde-fou).
  function dessiner(){
    // La grille d un produit prend la fenetre entiere : les onglets s effacent,
    // le << Retour >> ramene a l onglet d ou l on vient.
    if (VUE === 'produit') { onglets.style.display = 'none'; dessinerProduit(); return; }
    onglets.style.display = '';
    dessinerOnglets();
    if (ONGLET === 'produits') { dessinerProduits(); return; }
    if (ONGLET === 'endommages') { dessinerEndommages(); return; }
    if (ONGLET === 'entrepots') { dessinerEntrepots(); return; }
    dessinerListe();
  }

  function dessinerOnglets(){
    var reappro = (NB_REAPPRO === null) ? '' : (NB_REAPPRO ? ' (' + NB_REAPPRO + ')' : '');
    var defs = [
      ['produits', '📦 Produits'],
      ['reappro', '⚠ Réapprovisionnement' + reappro],
      ['endommages', '🔧 Produits endommagés'],
      ['entrepots', '🏬 Entrepôt']
    ];
    onglets.innerHTML = defs.map(function(d){
      return '<button data-onglet="' + d[0] + '"' + (ONGLET === d[0] ? ' class="actif"' : '')
        + '>' + d[1] + '</button>';
    }).join('');
  }

  // Pose UNE fois : le conteneur des onglets n est jamais remplace, seulement
  // son contenu — l ecouteur delegue survit donc a tous les redessins.
  onglets.onclick = function(ev){
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-onglet]') : null;
    if (!b) return;
    var cible = b.getAttribute('data-onglet');
    if (cible === ONGLET) return;
    // Quitter l Entrepot referme toute ligne d ajout/edition en cours — comme
    // l ecran du site. Quitter Produits sort du mode lot : une selection
    // invisible qui s appliquerait plus tard serait un piege.
    if (cible !== 'entrepots') WH_EDIT = null;
    if (cible !== 'produits') { LOT = false; COCHES = {}; }
    ONGLET = cible;
    VUE = 'reappro';
    dire('');
    // Redessine tout de suite (cache ou << Chargement… >>) : un onglet qui ne
    // reagit qu a l arrivee de la reponse semble mort.
    dessiner();
    chargerOnglet();
  };

  function dessinerListe(){
    var enRecherche = VUE === 'recherche';
    var lignes = enRecherche ? TROUVES : REAPPRO;
    var h = '<div class="carte">'
      + '<input id="rech" autocomplete="off" placeholder="Scannez une étiquette, ou tapez un nom de produit…">'
      + '<div class="aide" style="margin-top:.35rem">Un code de variante scanné ouvre directement sa fiche. '
      + 'Trois caractères minimum pour une recherche par nom.</div>'
      + '</div>';

    h += '<div class="carte plein"><h2>' + (enRecherche
        ? 'Résultats <span class="note">— ' + lignes.length + ' produit' + (lignes.length > 1 ? 's' : '') + '</span>'
        : 'À réapprovisionner <span class="note">— ' + lignes.length + ' variante'
          + (lignes.length > 1 ? 's' : '') + ' sous leur seuil</span>') + '</h2>';

    if (!lignes.length) {
      h += '<div class="vide">' + (enRecherche
        ? 'Aucun produit trouvé.'
        : '✓ Aucune variante à réapprovisionner — toutes sont au-dessus de leur seuil.')
        + '</div>';
    } else {
      h += '<div class="lignes">';
      if (enRecherche) {
        lignes.forEach(function(a){
          h += '<div class="lg" data-pid="' + esc(a.id) + '">'
            + '<span class="principal"><strong>' + esc(a.nom) + '</strong>'
            + (a.code ? ' <span class="code">' + esc(a.code) + '</span>' : '')
            + '</span>'
            + '<span class="fin">' + a.unites + ' unité' + (a.unites > 1 ? 's' : '')
            + ' · ' + a.variantes + ' variante' + (a.variantes > 1 ? 's' : '')
            + (a.alertes ? ' · <span class="q bas">' + a.alertes + ' à commander</span>' : '')
            + '</span></div>';
        });
      } else {
        // ⚠ MEME TRI QUE L ECRAN DU SITE (il vient deja trie du pont) : ce qui est
        // a zero d abord, puis le plus proche de la rupture EN PROPORTION.
        lignes.forEach(function(r){
          h += '<div class="lg" data-pid="' + esc(r.produitId) + '">'
            + '<span class="principal"><strong>' + esc(r.nom) + '</strong>'
            + ' <span class="det">' + esc(r.taille) + ' / ' + esc(r.couleur) + '</span>'
            + (r.sku ? ' <span class="code">' + esc(r.sku) + '</span>' : '')
            + '</span>'
            + '<span class="fin"><span class="q ' + (r.rupture ? 'rup' : 'bas') + '">' + r.qte
            + '</span> / seuil ' + r.seuil + '</span></div>';
        });
      }
      h += '</div>';
    }
    h += '</div>';
    corps.innerHTML = h;

    actions.innerHTML = enRecherche ? '<button id="btn-retour">← Réapprovisionnement</button>' : '';
    brancherListe();
  }

  // ── La grille d un produit ────────────────────────────────────────────────
  function visibles(){
    return VARS.filter(function(v){
      return (!FILTRE.couleur.length || FILTRE.couleur.indexOf(v.couleur) >= 0)
          && (!FILTRE.taille.length || FILTRE.taille.indexOf(v.taille) >= 0);
    });
  }

  function dessinerProduit(){
    var lot = visibles();
    var pages = Math.max(1, Math.ceil(lot.length / TAILLE_PAGE));
    if (PAGE > pages - 1) PAGE = pages - 1;
    if (PAGE < 0) PAGE = 0;
    var debut = PAGE * TAILLE_PAGE;
    var page = lot.slice(debut, debut + TAILLE_PAGE);

    var h = '';
    // ⚠ LES DEUX AVERTISSEMENTS DE L ECRAN DU SITE, repris au mot : sans entrepot
    // on ne peut pas assigner d emplacement, et sans SKU de base il n y a ni code
    // de variante ni etiquette.
    if (!ENTREPOTS.length) {
      h += '<div class="avis">⚠ Aucun emplacement configuré — créez-en un dans '
        + 'Inventaire puis Entrepôt pour pouvoir en assigner un aux variantes en stock.</div>';
    }
    if (!PROD.sku) {
      h += '<div class="avis">⚠ Ce produit n’a pas de SKU de base — assignez-lui un SKU '
        + 'dans la liste d’inventaire pour générer les codes de variante et les étiquettes.</div>';
    }

    h += '<div class="carte plein">';
    h += '<h2>' + esc(PROD.nom)
      + (PROD.sku ? ' <span class="note">— ' + esc(PROD.sku) + '</span>' : '')
      + ' <span class="note">· ' + VARS.length + ' variante' + (VARS.length > 1 ? 's' : '')
      + '</span></h2>';

    h += dessinerFiltres();

    if (!lot.length) {
      h += '<div class="vide">Aucune variante ne correspond aux filtres.</div>';
    } else {
      h += '<div class="grille"><table><thead><tr>'
        + '<th>Variante</th><th>Code</th><th class="c">Qté</th>'
        + '<th class="c">Seuil</th><th>Emplacement</th><th class="c"></th>'
        + '</tr></thead><tbody>';
      page.forEach(function(v){
        var i = VARS.indexOf(v);
        var actif = (parseInt(v.qte, 10) || 0) > 0;
        var deg = String(v.teinte || '').indexOf('linear-gradient') === 0;
        var manqueLieu = actif && !v.entrepot && ENTREPOTS.length;
        h += '<tr class="' + (actif ? 'a' : '') + '" data-l="' + i + '">'
          + '<td><span class="var">'
          +   '<span class="pastille' + (deg ? ' deg' : '') + '" style="background:'
          +   esc(v.teinte || '#ccc') + '"></span>'
          +   '<span class="nom">' + esc(v.taille) + ' / ' + esc(v.couleur) + '</span></span></td>'
          + '<td>' + (v.sku ? '<span class="code">' + esc(v.sku) + '</span>'
                            : '<span class="rien">—</span>') + '</td>'
          + '<td class="q"><input type="number" min="0" data-q="' + i + '" value="' + (parseInt(v.qte, 10) || 0) + '"></td>'
          // ⚠ TEXTE DE REMPLACEMENT = LE SEUIL HERITE, jamais une valeur posee dans
          // le champ : la poser en ferait une EXCEPTION que vider n effacerait plus.
          + '<td class="s"><input type="number" min="0" data-s="' + i + '" value="' + esc(v.seuil)
          +   '" placeholder="' + esc(PROD.seuilHerite == null ? '' : PROD.seuilHerite)
          +   '" title="Seuil de cette variante — vide = celui du produit"'
          +   (v.seuil === '' ? ' style="opacity:.6"' : '') + '></td>'
          + '<td class="e"><select data-e="' + i + '"' + (manqueLieu ? ' class="manque"' : '') + '>'
          +   '<option value="">—</option>'
          +   ENTREPOTS.map(function(w){
                return '<option value="' + esc(w.id) + '"' + (v.entrepot === w.id ? ' selected' : '')
                  + '>' + esc(w.code || w.nom || w.id) + '</option>'; }).join('')
          +   '</select></td>'
          + '<td class="c">' + (v.sku
              ? '<button class="mini" data-etiq="' + i + '" title="Imprimer les étiquettes de cette variante"><span class="ic">🖨</span></button>'
              : '') + '</td>'
          + '</tr>';
      });
      h += '</tbody></table></div>';

      h += '<div class="pagi">'
        + '<span>Afficher</span><select id="pg-taille">'
        + '<option value="auto"' + (GRILLE_AUTO ? ' selected' : '') + '>Auto</option>'
        + [5, 10, 25, 50, 9999].map(function(n){
            return '<option value="' + n + '"' + (!GRILLE_AUTO && TAILLE_PAGE === n ? ' selected' : '') + '>'
              + (n === 9999 ? 'Tout' : n) + '</option>'; }).join('')
        + '</select><span>par page</span>'
        + '<span class="pos">'
        + (pages > 1
            ? '<button class="mini" id="pg-prec"' + (PAGE <= 0 ? ' disabled' : '') + '>← Préc.</button>'
              + ' Page <strong>' + (PAGE + 1) + '</strong> / ' + pages + ' '
              + '<button class="mini" id="pg-suiv"' + (PAGE >= pages - 1 ? ' disabled' : '') + '>Suiv. →</button>'
            : lot.length + ' variante' + (lot.length > 1 ? 's' : ''))
        + '</span></div>';
    }

    h += '<div class="aide" style="margin-top:.4rem">'
      + 'Un <b>emplacement</b> est obligatoire pour chaque variante ayant une quantité. '
      + 'La colonne <b>Seuil</b> ne se remplit que pour une variante qui fait exception ; '
      + 'laissée vide, elle suit le seuil du produit'
      + (PROD.seuilHerite == null ? '' : ' (<b>' + esc(PROD.seuilHerite) + '</b>)') + '.'
      + '</div>';
    h += '</div>';
    corps.innerHTML = h;

    actions.innerHTML = '<button id="btn-retour">← Liste</button>'
      + (PROD.sku ? '<button id="btn-tout"><span class="ic">🖨</span> Tous les codes-barres</button>' : '')
      + '<button class="prim" id="btn-enr">Enregistrer l’inventaire</button>';
    brancherProduit();
    majBouton();
    grilleAutoAjuste();
  }

  // La grille des variantes suit la meme regle Auto que l onglet Produits :
  // autant de lignes que la hauteur reelle le permet, jamais de glissiere.
  function grilleAutoAjuste(){
    if (!GRILLE_AUTO || VUE !== 'produit') return;
    var g = corps.querySelector('.grille');
    if (!g) return;
    var th = g.querySelector('thead');
    var tr = g.querySelector('tbody tr');
    var hL = tr ? tr.offsetHeight : 0;
    if (!(hL > 0)) hL = 34;
    var dispo = g.clientHeight - ((th && th.offsetHeight) || 30);
    if (!(dispo > 0)) return; // le banc mesure NaN : on ne touche a rien
    var n = Math.max(3, Math.floor(dispo / hL));
    if (isFinite(n) && n !== TAILLE_PAGE) { TAILLE_PAGE = n; PAGE = 0; dessiner(); }
  }

  function dessinerFiltres(){
    var couleurs = [], tailles = [];
    VARS.forEach(function(v){
      if (couleurs.indexOf(v.couleur) < 0) couleurs.push(v.couleur);
      if (tailles.indexOf(v.taille) < 0) tailles.push(v.taille);
    });
    function menu(type, libelle, toutes, choisies){
      if (toutes.length < 2) return '';
      var ouvert = FILTRE.menu === type;
      var h = '<div class="menu">';
      if (ouvert) h += '<div class="voile2" data-menu="' + type + '"></div>';
      h += '<button class="mini' + (choisies.length ? ' prim' : '') + '" data-menu="' + type + '"'
        + ' style="position:relative;z-index:41">' + libelle
        + (choisies.length ? ' (' + choisies.length + ')' : '') + (ouvert ? ' ▴' : ' ▾') + '</button>';
      if (ouvert) {
        h += '<div class="liste">';
        if (choisies.length) h += '<button class="mini" data-vider="' + type + '" style="width:100%;margin-bottom:.2rem">Tout afficher</button>';
        toutes.forEach(function(v, k){
          h += '<label><input type="checkbox" data-f="' + type + '" data-fi="' + k + '"'
            + (choisies.indexOf(v) >= 0 ? ' checked' : '') + '><span>' + esc(v) + '</span></label>';
        });
        h += '</div>';
      }
      return h + '</div>';
    }
    // ⚠ FILTRER NE PERD AUCUNE SAISIE : les valeurs vivent dans VARS, pas dans les
    // champs. C etait deja la promesse de l ecran du site, elle est tenue ici par
    // construction et non par precaution.
    var h = '<div class="filtres"><span class="lbl">Filtrer :</span>'
      + menu('couleur', 'Couleur', couleurs, FILTRE.couleur)
      + menu('taille', 'Taille', tailles, FILTRE.taille) + '</div>';
    // Les index servent au clic (voir brancherProduit) : on les retient.
    window._fCouleurs = couleurs; window._fTailles = tailles;
    return h;
  }

  function majBouton(){
    var b = document.getElementById('btn-enr');
    if (!b) return;
    var peut = !!(CTX && CTX.peutEcrire) && !enCours;
    b.disabled = !peut;
    b.textContent = enCours ? 'Enregistrement…'
      : (CTX && CTX.peutEcrire ? 'Enregistrer l’inventaire' : 'Lecture seule');
  }

  // ══ ECOUTEURS ═════════════════════════════════════════════════════════════
  // ⚠ PLUS DE BOUTON << Fermer >> AU PIED (retire sur demande, 2026-08-07) : la
  // barre de titre et Echap ferment, et les deux passent par quitter() — le
  // verrou est donc toujours rendu. La fonction reste comme point d ancrage des
  // dessins, vide.
  function brancherFermer(){}

  var rechT = null;
  function brancherListe(){
    brancherFermer();
    var r = document.getElementById('btn-retour');
    if (r) r.onclick = function(){ VUE = 'reappro'; dessiner(); };
    var champ = document.getElementById('rech');
    if (champ) {
      champ.oninput = function(){
        var q = this.value;
        clearTimeout(rechT);
        rechT = setTimeout(function(){ chercher(q); }, 220);
      };
      champ.onkeydown = function(ev){
        if (ev.key === 'Enter') { ev.preventDefault(); clearTimeout(rechT); chercher(this.value); }
      };
      champ.focus();
    }
    // ⚠ ECOUTEUR DELEGUE : les lignes sont redessinees a chaque recherche, un
    // ecouteur pose sur chacune serait reperdu au premier redessin.
    corps.onclick = function(ev){
      var t = ev.target;
      if (!t || !t.closest) return;
      var l = t.closest('.lg');
      if (l) ouvrirProduit(l.getAttribute('data-pid'));
    };
  }

  function brancherProduit(){
    brancherFermer();
    var r = document.getElementById('btn-retour');
    if (r) r.onclick = function(){ rendreVerrou(); VUE = 'reappro'; PROD = null; charger(); };
    var e = document.getElementById('btn-enr');
    if (e) e.onclick = enregistrer;
    var tt = document.getElementById('btn-tout');
    if (tt) tt.onclick = toutesLesEtiquettes;
    var pt = document.getElementById('pg-taille');
    if (pt) pt.onchange = function(){
      if (this.value === 'auto') { GRILLE_AUTO = true; PAGE = 0; dessiner(); }
      else { GRILLE_AUTO = false; TAILLE_PAGE = parseInt(this.value, 10) || 25; PAGE = 0; dessiner(); }
    };
    var pp = document.getElementById('pg-prec');
    if (pp) pp.onclick = function(){ PAGE--; dessiner(); };
    var ps = document.getElementById('pg-suiv');
    if (ps) ps.onclick = function(){ PAGE++; dessiner(); };

    /* ⚠⚠ TOUTE SAISIE PART DANS VARS A L INSTANT MEME. C est le point qui rend
       cette fenetre sure : la grille est paginee et filtrable, lire les champs a
       l enregistrement ne rendrait que la page affichee — et le reste partirait a
       zero, sans un mot. On ecoute donc en delegue, sur le corps, et l on recopie. */
    corps.oninput = function(ev){
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var iq = t.getAttribute('data-q');
      if (iq !== null) {
        var v = VARS[parseInt(iq, 10)];
        if (!v) return;
        v.qte = Math.max(0, parseInt(t.value, 10) || 0);
        var tr = t.closest ? t.closest('tr') : null;
        if (tr) tr.className = v.qte > 0 ? 'a' : '';
        var sel = tr ? tr.querySelector('select') : null;
        if (sel) sel.className = (v.qte > 0 && !v.entrepot && ENTREPOTS.length) ? 'manque' : '';
        return;
      }
      var is = t.getAttribute('data-s');
      if (is !== null) {
        var w = VARS[parseInt(is, 10)];
        if (!w) return;
        w.seuil = String(t.value || '').trim();
        t.style.opacity = w.seuil === '' ? '.6' : '1';
      }
    };
    corps.onchange = function(ev){
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var ie = t.getAttribute('data-e');
      if (ie === null) return;
      var v = VARS[parseInt(ie, 10)];
      if (!v) return;
      v.entrepot = t.value || '';
      t.className = ((parseInt(v.qte, 10) || 0) > 0 && !v.entrepot && ENTREPOTS.length) ? 'manque' : '';
    };
    corps.onclick = function(ev){
      var t = ev.target;
      if (!t || !t.closest) return;
      var m = t.closest('[data-menu]');
      if (m) { var n = m.getAttribute('data-menu'); FILTRE.menu = (FILTRE.menu === n) ? null : n; dessiner(); return; }
      var vd = t.closest('[data-vider]');
      if (vd) { FILTRE[vd.getAttribute('data-vider')] = []; PAGE = 0; dessiner(); return; }
      if (t.getAttribute && t.getAttribute('data-f')) {
        var type = t.getAttribute('data-f');
        var liste = type === 'couleur' ? (window._fCouleurs || []) : (window._fTailles || []);
        var val = liste[parseInt(t.getAttribute('data-fi'), 10)];
        var k = FILTRE[type].indexOf(val);
        if (k >= 0) FILTRE[type].splice(k, 1); else FILTRE[type].push(val);
        PAGE = 0; dessiner();
        return;
      }
      var et = t.closest('[data-etiq]');
      if (et) etiquettesVariante(parseInt(et.getAttribute('data-etiq'), 10));
    };
  }

  // ══ ONGLET PRODUITS ═══════════════════════════════════════════════════════
  // « geste » : la tuile devient cliquable et pose ce filtre (ou ouvre cet
  // onglet). Les compteurs qui invitent a agir doivent mener a la liste qu ils
  // comptent — lire << 3 en rupture >> et devoir chercher ou les voir est le
  // genre de detour qu on ne fait qu une fois.
  function tuile(libelle, valeur, sousTitre, ton, geste){
    return '<div class="tuile' + (ton ? ' ' + ton : '') + (geste ? ' cliq" data-tuile="' + geste : '')
      + '"' + (geste ? ' title="Cliquer pour voir la liste"' : '') + '>'
      + '<div class="lbl">' + libelle + '</div>'
      + '<div class="val' + (ton ? ' ' + ton : '') + '">' + valeur + '</div>'
      + '<div class="sub">' + sousTitre + '</div></div>';
  }

  function pilule(l){
    if (!l.sku) return '<span class="pill neutre">Non inventorié (sans SKU)</span>';
    if (l.unites === 0) return '<span class="pill rup">Rupture</span>';
    if (l.basses > 0) return '<span class="pill bas">' + l.basses + ' à commander</span>';
    return '<span class="pill ok">Seuil non atteint</span>';
  }

  function dessinerProduits(){
    var d = PRODS;
    if (!d) {
      corps.innerHTML = '<div class="carte plein"><div class="vide">Chargement…</div></div>';
      actions.innerHTML = '';
      brancherFermer();
      return;
    }
    var st = d.stats;
    var h = '<div class="tuiles">'
      + tuile('Produits inventoriés', st.inventories, st.total + ' produits au total', '')
      + tuile('Sans code SKU', st.sansSku,
          st.sansSku > 0 ? 'non disponibles à l’achat' : 'tous assignés ✓',
          st.sansSku > 0 ? 'att' : 'bon')
      + tuile('En rupture', st.rupture, 'inventaire = 0', st.rupture > 0 ? 'err' : 'bon',
          st.rupture > 0 ? 'rupture' : '')
      + tuile('À réapprovisionner', st.aCommander,
          st.aCommander ? 'voir l’onglet Réapprovisionnement' : 'tout est au-dessus du seuil ✓',
          st.aCommander ? 'att' : 'bon',
          st.aCommander > 0 ? 'reappro' : '')
      + tuile('Unités en inventaire', st.unites, 'toutes variantes', '')
      + '</div>';

    // ⚠ LES DEUX BANDEAUX DE L ECRAN DU SITE, repris au mot — et comme lui, ils
    // disparaissent d eux-memes une fois la reprise faite.
    if (st.sansSku > 0 && d.peutEcrire) {
      h += '<div class="avis" style="display:flex;align-items:center;gap:.8rem;flex-wrap:wrap">'
        + '<span style="flex:1 1 auto">⚠ <b>' + st.sansSku + ' produit(s)</b> sans code SKU '
        + '— ils sont bloqués à l’achat en boutique.</span>'
        + '<button class="mini" id="btn-skus-tous">Assigner automatiquement</button></div>';
    }
    if (d.pad6 && d.pad6.n > 0 && d.peutEcrire) {
      h += '<div class="avis" style="display:flex;align-items:center;gap:.8rem;flex-wrap:wrap">'
        + '<span style="flex:1 1 auto"><span class="ic">🏷</span> <b>' + d.pad6.n + ' produit(s)</b> portent encore un '
        + 'numéro à quatre chiffres (' + esc(d.pad6.avant || '') + '). Les nouveaux en comptent six '
        + '— ' + esc(d.pad6.apres || '') + '. <em>Renuméroter oblige à réimprimer les étiquettes '
        + 'déjà collées.</em></span>'
        + '<button class="mini" id="btn-pad6">Passer à six chiffres</button></div>';
    }

    if (LOT) {
      var nCoches = Object.keys(COCHES).length;
      h += '<div class="lot">'
        + '<label><input type="checkbox" id="lot-page"> Toute la page</label>'
        + '<span>' + nCoches + ' produit' + (nCoches > 1 ? 's' : '') + ' sélectionné'
        + (nCoches > 1 ? 's' : '') + '</span>'
        + '<span style="flex:1 1 auto"></span>'
        + '<button class="mini rouge" id="lot-app"><span class="ic">🔴</span> Appliquer vente finale</button>'
        + '<button class="mini vert" id="lot-ret">✅ Retirer vente finale</button>'
        + '<button class="mini" id="lot-annuler">Annuler</button></div>';
    }

    h += '<div class="carte plein">';
    h += '<div class="toolbar">'
      + '<input type="text" id="fp-q" autocomplete="off" placeholder="SKU, nom produit…" value="' + esc(FP.q) + '">'
      + '<select id="fp-etat">'
      + '<option value=""><span class="ic">📦</span> Tout l’inventaire</option>'
      + '<option value="rupture"' + (FP.etat === 'rupture' ? ' selected' : '') + '><span class="ic">🔴</span> En rupture</option>'
      + '<option value="low"' + (FP.etat === 'low' ? ' selected' : '') + '>⚠ À commander</option>'
      + '<option value="ok"' + (FP.etat === 'ok' ? ' selected' : '') + '>✓ Seuil non atteint</option>'
      + '</select>'
      + menuCats(d.cats || [])
      + '<span class="droite">'
      // ⚠ CE BOUTON MANQUAIT (#6) : depuis l inventaire, il fallait sortir vers
      // l ecran Produits pour en creer un. L op existait deja cote pont, elle
      // n etait simplement offerte nulle part ici.
      + (d.peutAjouterProduit ? '<button class="mini prim" id="btn-nouveau-produit">+ Ajouter un produit</button>' : '')
      + (d.peutEcrire && !LOT ? '<button class="mini" id="btn-lot" title="Appliquer ou retirer la vente finale sur plusieurs produits à la fois">Vente finale en lot</button>' : '')
      + '</span></div>';

    if (!d.lignes.length) {
      h += '<div class="vide">Aucun produit trouvé.</div>';
    } else {
      h += '<div class="grille"><table><thead><tr>'
        + (LOT ? '<th class="c" style="width:2rem"></th>' : '')
        + '<th>SKU</th><th>Produit</th><th class="c" title="Catégorie">Cat.</th>'
        + '<th class="c">Tailles</th><th class="c">Couleurs</th>'
        + '<th>Inventaire</th><th class="c">Actions</th>'
        + '</tr></thead><tbody>';
      d.lignes.forEach(function(l){
        // La ligne entiere est cliquable : elle ouvre la fiche (ou coche, en
        // mode lot). Les boutons de la colonne Actions restent prioritaires.
        h += '<tr data-ligne="' + esc(l.id) + '" title="'
          + (LOT ? 'Cliquer pour sélectionner' : 'Cliquer pour modifier la fiche produit') + '">'
          + (LOT ? '<td class="c"><input type="checkbox" data-coche="' + esc(l.id) + '"'
              + (COCHES[l.id] ? ' checked' : '') + '></td>' : '')
          + '<td>' + (l.sku ? '<span class="code">' + esc(l.sku) + '</span>'
                            : '<span class="rien">sans SKU</span>') + '</td>'
          + '<td><span class="nom">' + esc(l.nom) + '</span>'
          +   (l.enVente ? '<span class="badge vente">En vente</span>' : '')
          +   (l.venteFinale ? '<span class="badge finale">Vente finale</span>' : '') + '</td>'
          + '<td class="c" title="' + esc(l.categorieNom) + '"><span class="puce" style="background:'
          +   esc(l.couleurCat || '#6d7f96') + '"></span></td>'
          + '<td class="c">' + l.tailles + '</td>'
          + '<td class="c">' + l.couleurs + '</td>'
          + '<td><b' + (l.unites === 0 ? ' style="color:#f87171"' : '') + '>' + l.unites + '</b> '
          +   'unité' + (l.unites > 1 ? 's' : '') + ' ' + pilule(l) + '</td>'
          + '<td class="c" style="white-space:nowrap">'
          +   '<button class="mini" data-inv="' + esc(l.id) + '" title="Gérer l’inventaire"><span class="ic">📦</span> Inventaire</button> '
          +   (!l.sku && d.peutEcrire ? '<button class="mini" data-sku="' + esc(l.id) + '" title="Assigner un SKU"><span class="ic">🏷</span> SKU</button> ' : '')
          +   (d.peutEcrire ? '<button class="mini" data-mod="' + esc(l.id) + '" title="Modifier la fiche produit">✎ Modifier</button> ' : '')
          +   (l.sku && !l.enVente && d.peutEcrire ? '<button class="mini" data-vendre="' + esc(l.id) + '" title="Mettre en vente"><span class="ic">🛒</span> Vendre</button> ' : '')
          +   (d.peutSupprimer ? '<button class="mini" data-suppr="' + esc(l.id) + '" data-nom="' + esc(l.nom) + '" title="Supprimer de l’inventaire" style="border-color:rgba(239,68,68,.45)"><span class="ic">🗑</span></button>' : '')
          + '</td></tr>';
      });
      h += '</tbody></table></div>';

      var debut = d.page * d.parPage + 1;
      var fin = Math.min((d.page + 1) * d.parPage, d.total);
      h += '<div class="pagi">'
        + '<span>Afficher</span><select id="fp-taille">'
        + '<option value="auto"' + (FP.auto ? ' selected' : '') + '>Auto</option>'
        + [10, 25, 50, 100].map(function(n){
            return '<option value="' + n + '"' + (!FP.auto && FP.parPage === n ? ' selected' : '') + '>' + n + '</option>'; }).join('')
        + '</select><span>par page</span>'
        + '<span class="pos">' + debut + '–' + fin + ' sur ' + d.total + ' '
        + (d.pages > 1
            ? '<button class="mini" id="fp-prec"' + (d.page <= 0 ? ' disabled' : '') + '>← Préc.</button>'
              + ' Page <strong>' + (d.page + 1) + '</strong> / ' + d.pages + ' '
              + '<button class="mini" id="fp-suiv"' + (d.page >= d.pages - 1 ? ' disabled' : '') + '>Suiv. →</button>'
            : '')
        + '</span></div>';
    }
    h += '</div>';
    corps.innerHTML = h;

    actions.innerHTML = '';
    brancherProduits();
    pageAutoAjuste();
  }

  /* ⚠ PAGINATION << AUTO >> : autant de lignes que la hauteur REELLE le permet
     — quand ca arriverait a la glissiere, ca change de page a la place. Mesure,
     jamais devine (meme choix que les listes paginees du socle) : une valeur
     fixe deborde sur un petit ecran et laisse du vide sur un grand.
     Stable par construction : on ne recharge que si le compte mesure differe de
     la cadence courante, et la mesure ne depend pas du nombre de lignes recues
     (la grille est en flex, sa hauteur est celle de la place disponible). */
  var autoT = null;
  function pageAutoAjuste(){
    if (!FP.auto || ONGLET !== 'produits' || VUE === 'produit' || !PRODS) return;
    var g = corps.querySelector('.grille');
    if (!g) return;
    var th = g.querySelector('thead');
    var tr = g.querySelector('tbody tr');
    var hL = tr ? tr.offsetHeight : 0;
    if (!(hL > 0)) hL = 34;
    var dispo = g.clientHeight - ((th && th.offsetHeight) || 30);
    // Un faux document (le banc) mesure NaN : on ne touche a rien dans ce cas.
    if (!(dispo > 0)) return;
    var n = Math.max(5, Math.floor(dispo / hL));
    if (isFinite(n) && n !== FP.parPage) { FP.parPage = n; FP.page = 0; chargerOnglet(); }
  }
  window.addEventListener('resize', function(){
    clearTimeout(autoT);
    autoT = setTimeout(function(){
      if (VUE === 'produit') grilleAutoAjuste(); else pageAutoAjuste();
    }, 180);
  });

  function menuCats(cats){
    if (!cats.length) return '';
    var n = FP.cats.length;
    var h = '<div class="menu">';
    if (FP.menu) h += '<div class="voile2" data-menu-cats="1"></div>';
    h += '<button class="mini' + (n ? ' prim' : '') + '" data-menu-cats="1"'
      + ' style="position:relative;z-index:41">Catégorie à afficher'
      + (n ? ' (' + n + ')' : '') + (FP.menu ? ' ▴' : ' ▾') + '</button>';
    if (FP.menu) {
      h += '<div class="liste">';
      if (n) h += '<button class="mini" data-vider-cats="1" style="width:100%;margin-bottom:.2rem">Réinitialiser</button>';
      cats.forEach(function(c){
        h += '<label><input type="checkbox" data-cat="' + esc(c.cle) + '"'
          + (FP.cats.indexOf(c.cle) >= 0 ? ' checked' : '') + '>'
          + '<span class="puce" style="background:' + esc(c.couleur || '#6d7f96') + '"></span>'
          + '<span>' + esc(c.nom) + '</span></label>';
      });
      h += '</div>';
    }
    return h + '</div>';
  }

  var fpT = null;
  function brancherProduits(){
    brancherFermer();
    corps.onkeydown = null;
    corps.oninput = function(ev){
      var t = ev.target;
      if (t && t.id === 'fp-q') {
        var q = t.value;
        clearTimeout(fpT);
        fpT = setTimeout(function(){ FP.q = q; FP.page = 0; chargerOnglet(true); }, 280);
      }
    };
    corps.onchange = function(ev){
      var t = ev.target;
      if (!t) return;
      if (t.id === 'fp-etat') { FP.etat = t.value; FP.page = 0; chargerOnglet(); return; }
      if (t.id === 'fp-taille') {
        if (t.value === 'auto') { FP.auto = true; FP.page = 0; dessiner(); pageAutoAjuste(); }
        else { FP.auto = false; FP.parPage = parseInt(t.value, 10) || 25; FP.page = 0; chargerOnglet(); }
        return;
      }
      if (t.id === 'lot-page') {
        // Coche ou decoche LA PAGE AFFICHEE — la selection des autres pages
        // reste ce qu elle etait, et elle est comptee sous les yeux.
        (PRODS.lignes || []).forEach(function(l){
          if (t.checked) COCHES[l.id] = true; else delete COCHES[l.id];
        });
        dessiner();
        return;
      }
      var id = t.getAttribute && t.getAttribute('data-coche');
      if (id) {
        if (t.checked) COCHES[id] = true; else delete COCHES[id];
        // On ne redessine pas : seule la barre compte, et la mettre a jour
        // suffit — redessiner ferait perdre la position de defilement.
        var lot = corps.querySelector('.lot span:nth-child(2)');
        var nc = Object.keys(COCHES).length;
        if (lot) lot.textContent = nc + ' produit' + (nc > 1 ? 's' : '') + ' sélectionné' + (nc > 1 ? 's' : '');
      }
    };
    corps.onclick = function(ev){
      var t = ev.target;
      if (!t || !t.closest) return;
      if (t.closest('[data-menu-cats]')) { FP.menu = !FP.menu; dessiner(); return; }
      if (t.closest('[data-vider-cats]')) { FP.cats = []; FP.page = 0; FP.menu = false; chargerOnglet(); return; }
      // Les tuiles-compteurs menent a leur liste : « En rupture » pose le
      // filtre, « À réapprovisionner » ouvre son onglet (demande 2026-08-08).
      var tu = t.closest('[data-tuile]');
      if (tu) {
        var geste = tu.getAttribute('data-tuile');
        if (geste === 'rupture') { FP.etat = 'rupture'; FP.page = 0; chargerOnglet(); return; }
        if (geste === 'reappro') {
          LOT = false; COCHES = {}; ONGLET = 'reappro'; VUE = 'reappro';
          dire(''); dessiner(); chargerOnglet();
        }
        return;
      }
      var cat = t.getAttribute && t.getAttribute('data-cat');
      if (cat) {
        var k = FP.cats.indexOf(cat);
        if (k >= 0) FP.cats.splice(k, 1); else FP.cats.push(cat);
        FP.page = 0; chargerOnglet();
        return;
      }
      var b = t.closest('button');
      if (!b) {
        // ⚠ Le clic sur la LIGNE, en dernier : apres les boutons et jamais sur
        // un champ — la case a cocher a deja bascule par onchange, la rejouer
        // ici l annulerait aussitot.
        if (t.closest('input') || t.closest('select') || t.closest('label')) return;
        var tr = t.closest('tr[data-ligne]');
        if (!tr) return;
        var lid = tr.getAttribute('data-ligne');
        if (LOT) {
          if (COCHES[lid]) delete COCHES[lid]; else COCHES[lid] = true;
          var cc = tr.querySelector('[data-coche]');
          if (cc) cc.checked = !!COCHES[lid];
          var lot = corps.querySelector('.lot span:nth-child(2)');
          var nc = Object.keys(COCHES).length;
          if (lot) lot.textContent = nc + ' produit' + (nc > 1 ? 's' : '') + ' sélectionné' + (nc > 1 ? 's' : '');
          return;
        }
        // Le geste principal de la ligne : MODIFIER la fiche. En lecture seule
        // on ouvre la grille d inventaire, qui sait se mettre en consultation.
        if (PRODS && PRODS.peutEcrire) modifier(lid); else ouvrirProduit(lid);
        return;
      }
      if (b.id === 'fp-prec') { FP.page--; chargerOnglet(); return; }
      if (b.id === 'fp-suiv') { FP.page++; chargerOnglet(); return; }
      if (b.id === 'btn-nouveau-produit') {
        // L assistant Produit natif, en mode creation — le meme que celui de
        // l ecran Produits. Rien n est duplique ici.
        appeler('produits:nouveau', []).then(function(r){
          dire(r && r.ok ? 'Nouveau produit ouvert dans sa fenêtre.' : expliquer(r),
            (r && r.ok) ? 'bon' : 'err');
        });
        return;
      }
      if (b.id === 'btn-lot') { LOT = true; COCHES = {}; dessiner(); return; }
      if (b.id === 'lot-annuler') { LOT = false; COCHES = {}; dessiner(); return; }
      if (b.id === 'lot-app' || b.id === 'lot-ret') { venteFinaleLot(b.id === 'lot-app'); return; }
      if (b.id === 'btn-skus-tous') { skusTous(b); return; }
      if (b.id === 'btn-pad6') { pad6(); return; }
      var pid = b.getAttribute('data-inv');
      if (pid) { ouvrirProduit(pid); return; }
      pid = b.getAttribute('data-sku');
      if (pid) { skuUn(pid, b); return; }
      pid = b.getAttribute('data-mod');
      if (pid) { modifier(pid); return; }
      pid = b.getAttribute('data-vendre');
      if (pid) { vendre(pid, b); return; }
      pid = b.getAttribute('data-suppr');
      if (pid) { supprimer(pid, b.getAttribute('data-nom') || ''); return; }
    };
  }

  // ── Les gestes de l onglet Produits ── Comme l ecran du site : l assignation
  // de SKU et la mise en vente agissent DIRECTEMENT (avec leur message) ; seule
  // la renumerotation 4 → 6 exige une confirmation, parce qu elle perime des
  // etiquettes deja collees.
  function skuUn(pid, b){
    b.disabled = true;
    appeler('stock:skuUn', [pid]).then(function(r){
      dire(r.ok ? 'SKU assigné : ' + r.sku : expliquer(r), r.ok ? 'bon' : 'err');
      if (r.ok) chargerOnglet();
      else b.disabled = false;
    });
  }
  function skusTous(b){
    b.disabled = true;
    appeler('stock:skuTous').then(function(r){
      dire(r.ok ? r.n + ' SKU assigné(s) automatiquement.' : expliquer(r), r.ok ? 'bon' : 'err');
      if (r.ok) chargerOnglet();
      else b.disabled = false;
    });
  }
  function pad6(){
    var d = PRODS && PRODS.pad6;
    if (!d || !d.n) return;
    voile('<h3>Passer les SKU à six chiffres</h3>'
      + '<p>' + d.n + ' produit(s) seront renumérotés (ex. ' + esc(d.avant || '') + ' → '
      + esc(d.apres || '') + '). Les étiquettes <strong>déjà imprimées</strong> ne correspondront '
      + 'plus au nouveau code — il faudra les réimprimer pour la marchandise concernée. '
      + '<strong>Irréversible.</strong></p>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Renuméroter</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          this.disabled = true;
          appeler('stock:skuPad6').then(function(r){
            fermer();
            dire(r.ok ? r.n + ' SKU normalisé(s).' : expliquer(r), r.ok ? 'bon' : 'err');
            if (r.ok) chargerOnglet();
          });
        };
      });
  }
  function modifier(pid){
    dire('Ouverture…');
    appeler('stock:modifier', [pid]).then(function(r){
      dire(r.ok ? 'Fiche produit ouverte dans sa fenêtre.' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  }
  function vendre(pid, b){
    b.disabled = true;
    appeler('stock:vendre', [pid]).then(function(r){
      dire(r.ok ? (r.nom || 'Le produit') + ' est maintenant en vente.' : expliquer(r), r.ok ? 'bon' : 'err');
      if (r.ok) chargerOnglet();
      else b.disabled = false;
    });
  }
  function supprimer(pid, nom){
    // L apercu d abord : si la fiche emploie des photos de la MEDIATHEQUE, la
    // question de les retirer aussi se pose ICI — et elle reste VOLONTAIRE, la
    // case part decochee (regle du 2026-08-08). Un apercu qui echoue n empeche
    // pas la suppression : on pose la question sans la partie phototheque.
    appeler('stock:supprimerApercu', [pid]).then(function(a){
      var photos = (a && a.ok && a.phototheque) || [];
      var q = photos.length
        ? '<label style="display:flex;align-items:flex-start;gap:.5rem;margin-top:.6rem;'
          + 'font-size:.83rem;cursor:pointer;text-align:left">'
          + '<input type="checkbox" id="v-ph" style="width:auto;margin-top:.2rem">'
          + '<span>Retirer aussi ' + (photos.length > 1 ? 'ses ' + photos.length + ' photos' : 'sa photo')
          + ' de la photothèque (' + photos.map(function(x){ return esc(x.code); }).join(', ') + '). '
          + 'Sans cette case, ' + (photos.length > 1 ? 'elles y restent' : 'elle y reste')
          + ' pour servir à d’autres fiches.</span></label>'
        : '';
      voile('<h3>Supprimer de l’inventaire</h3>'
        + '<p>Supprimer définitivement <strong>' + esc(nom) + '</strong> de l’inventaire ? '
        + 'Cette action est <strong>irréversible</strong>.</p>' + q
        + '<div class="fin2"><button id="v-non">Annuler</button>'
        + '<button class="prim" id="v-oui" style="background:#dc2626;border-color:#dc2626;color:#fff">Supprimer</button></div>',
        function(fermer){
          document.getElementById('v-non').onclick = fermer;
          document.getElementById('v-oui').onclick = function(){
            this.disabled = true;
            var coche = document.getElementById('v-ph');
            appeler('stock:supprimer', [pid, !!(coche && coche.checked)]).then(function(r){
              fermer();
              dire(r.ok ? ('Produit supprimé' + (r.photosRetirees
                  ? ' — ' + r.photosRetirees + ' photo(s) retirée(s) de la photothèque' : '') + '.')
                : expliquer(r), r.ok ? 'bon' : 'err');
              if (r.ok) chargerOnglet();
            });
          };
        });
    });
  }

  function venteFinaleLot(activer){
    var ids = Object.keys(COCHES);
    if (!ids.length) { dire(MOTIFS.aucun_produit, 'att'); return; }
    appeler('stock:venteFinale', [ids, activer]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Vente finale ' + (activer ? 'activée' : 'retirée') + ' pour ' + r.n + ' produit(s).', 'bon');
      LOT = false; COCHES = {};
      chargerOnglet();
    });
  }

  // ══ ONGLET PRODUITS ENDOMMAGES ════════════════════════════════════════════
  function dessinerEndommages(){
    var d = DMG;
    if (!d) {
      corps.innerHTML = '<div class="carte plein"><div class="vide">Chargement…</div></div>';
      actions.innerHTML = '';
      brancherFermer();
      return;
    }
    var h = '<div class="carte plein">'
      + '<h2>Produits endommagés <span class="note">— articles de retours non remis en inventaire</span></h2>'
      + '<div class="toolbar">'
      + '<select id="dmg-an"><option value="all">Tout cumulé</option>'
      + (d.annees || []).map(function(a){
          return '<option value="' + a + '"' + (String(DMG_AN) === String(a) ? ' selected' : '') + '>' + a + '</option>'; }).join('')
      + '</select>'
      + '<button class="mini" id="dmg-imp"><span class="ic">🖨</span> Imprimer le rapport</button>'
      + '<span class="droite aide"><span class="ic">🔧</span> <b>' + d.totalQte + '</b> article' + (d.totalQte > 1 ? 's' : '')
      + ' endommagé' + (d.totalQte > 1 ? 's' : '') + ' · <span class="ic">💸</span> <b>' + d.totalValeur.toFixed(2)
      + ' $</b> valeur perdue (avant taxes)</span>'
      + '</div>';

    if (!d.lignes.length) {
      h += '<div class="vide">Aucun article endommagé'
        + (DMG_AN === 'all' ? '' : ' pour ' + esc(String(DMG_AN))) + '.</div>';
    } else {
      h += '<div class="grille"><table><thead><tr>'
        + '<th>Date</th><th>Commande</th><th>Article</th><th class="c">Qté</th>'
        + '<th style="text-align:right">Prix</th><th style="text-align:right">Valeur</th><th>Raison</th>'
        + '</tr></thead><tbody>';
      d.lignes.forEach(function(l){
        h += '<tr>'
          + '<td>' + new Date(l.date).toLocaleDateString('fr-CA') + '</td>'
          + '<td><span class="code">' + esc(l.commande) + '</span></td>'
          + '<td>' + esc(l.nom) + '</td>'
          + '<td class="c">' + l.qte + '</td>'
          + '<td style="text-align:right">' + l.prix.toFixed(2) + ' $</td>'
          + '<td style="text-align:right;font-weight:600">' + (l.qte * l.prix).toFixed(2) + ' $</td>'
          + '<td>' + esc(l.raison) + '</td></tr>';
      });
      h += '</tbody><tfoot><tr style="font-weight:700">'
        + '<td colspan="3" style="padding:.34rem .5rem;border-top:1px solid rgba(255,255,255,.14)">Total</td>'
        + '<td class="c" style="border-top:1px solid rgba(255,255,255,.14)">' + d.totalQte + '</td>'
        + '<td style="border-top:1px solid rgba(255,255,255,.14)"></td>'
        + '<td style="text-align:right;border-top:1px solid rgba(255,255,255,.14)">' + d.totalValeur.toFixed(2) + ' $</td>'
        + '<td style="border-top:1px solid rgba(255,255,255,.14)"></td></tr></tfoot></table></div>';
    }
    h += '</div>';
    corps.innerHTML = h;
    actions.innerHTML = '';
    brancherEndommages();
  }

  function brancherEndommages(){
    brancherFermer();
    corps.onkeydown = null;
    corps.oninput = null;
    corps.onchange = function(ev){
      if (ev.target && ev.target.id === 'dmg-an') {
        DMG_AN = ev.target.value;
        chargerOnglet();
      }
    };
    corps.onclick = function(ev){
      var b = ev.target && ev.target.closest ? ev.target.closest('button') : null;
      if (!b || b.id !== 'dmg-imp') return;
      b.disabled = true;
      dire('Impression…');
      // Le rapport se reconstruit des DONNEES cote site et s imprime par
      // l application — jamais en relisant le tableau affiche ici.
      appeler('stock:endommagesRapport', [DMG_AN]).then(function(r){
        b.disabled = false;
        dire(r.ok ? 'Rapport envoyé à l’impression.' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
  }

  // ══ ONGLET ENTREPOT ═══════════════════════════════════════════════════════
  function dessinerEntrepots(){
    var d = WHS;
    if (!d) {
      corps.innerHTML = '<div class="carte plein"><div class="vide">Chargement…</div></div>';
      actions.innerHTML = '';
      brancherFermer();
      return;
    }
    function ligneEdition(w){
      return '<tr style="background:rgba(201,169,126,.08)">'
        + '<td><input type="text" id="wh-code" value="' + esc(w ? w.code : '') + '" placeholder="Ex : Casier 1, Section A"></td>'
        + '<td><input type="text" id="wh-ref" value="' + esc(w ? w.reference : '') + '" placeholder="Référence (optionnel)"></td>'
        + '<td class="c"><span class="rien">' + (w ? w.usage : '—') + '</span></td>'
        + '<td class="c" style="white-space:nowrap">'
        + '<button class="mini prim" id="wh-enr" title="Enregistrer (Entrée)">✓</button> '
        + '<button class="mini" id="wh-annuler" title="Annuler (Échap)">✕</button></td></tr>';
    }
    var h = '<div class="carte plein">'
      + '<h2>Entrepôt <span class="note">— les emplacements où ranger les variantes</span></h2>';
    if (d.peutAjouter) {
      h += '<div class="toolbar"><span class="droite">'
        + '<button class="mini" id="wh-ajouter"' + (WH_EDIT && WH_EDIT.id === '' ? ' disabled' : '')
        + '>+ Ajouter un emplacement</button></span></div>';
    }
    h += '<div class="grille"><table><thead><tr>'
      + '<th>Emplacement</th><th>Référence</th><th class="c">Variantes assignées</th><th class="c">Actions</th>'
      + '</tr></thead><tbody>';
    if (WH_EDIT && WH_EDIT.id === '') h += ligneEdition(null);
    if (!d.lignes.length && !(WH_EDIT && WH_EDIT.id === '')) {
      h += '<tr><td colspan="4"><div class="vide">Aucun emplacement — cliquez sur '
        + '<b>+ Ajouter un emplacement</b> pour en créer un.</div></td></tr>';
    }
    d.lignes.forEach(function(w){
      if (WH_EDIT && WH_EDIT.id === w.id) { h += ligneEdition(w); return; }
      h += '<tr>'
        + '<td style="font-weight:600">' + esc(w.code) + '</td>'
        + '<td>' + (w.reference ? esc(w.reference) : '<span class="rien">—</span>') + '</td>'
        + '<td class="c">' + w.usage + '</td>'
        + '<td class="c" style="white-space:nowrap">'
        + (d.peutEcrire ? '<button class="mini" data-wh-mod="' + esc(w.id) + '" title="Modifier">✎</button> ' : '')
        + (d.peutSupprimer ? '<button class="mini" data-wh-del="' + esc(w.id) + '" title="'
            + (w.usage > 0 ? w.usage + ' variante(s) utilisent cet emplacement' : 'Supprimer') + '"><span class="ic">🗑</span></button>' : '')
        + '</td></tr>';
    });
    h += '</tbody></table></div></div>';
    corps.innerHTML = h;
    actions.innerHTML = '';
    brancherEntrepots();
    var champ = document.getElementById('wh-code');
    if (champ) { champ.focus(); try { champ.setSelectionRange(champ.value.length, champ.value.length); } catch (e) {} }
  }

  function brancherEntrepots(){
    brancherFermer();
    corps.oninput = null;
    corps.onchange = null;
    corps.onclick = function(ev){
      var b = ev.target && ev.target.closest ? ev.target.closest('button') : null;
      if (!b) return;
      if (b.id === 'wh-ajouter') { WH_EDIT = { id: '' }; dessiner(); return; }
      if (b.id === 'wh-annuler') { WH_EDIT = null; dessiner(); return; }
      if (b.id === 'wh-enr') { entrepotEnregistrer(); return; }
      var id = b.getAttribute('data-wh-mod');
      if (id) { WH_EDIT = { id: id }; dessiner(); return; }
      id = b.getAttribute('data-wh-del');
      if (id) { entrepotSupprimer(id); return; }
    };
    // Entree enregistre, Echap referme la ligne (sans fermer la fenetre : le
    // gestionnaire global d Echap ne joue que s il n y a pas de voile, mais la
    // ligne d edition n en est pas un — on arrete donc la propagation ici).
    corps.onkeydown = function(ev){
      var t = ev.target;
      if (!t || (t.id !== 'wh-code' && t.id !== 'wh-ref')) return;
      if (ev.key === 'Enter') { ev.preventDefault(); entrepotEnregistrer(); }
      else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); WH_EDIT = null; dessiner(); }
    };
  }

  function entrepotEnregistrer(){
    if (!WH_EDIT) return;
    var code = (document.getElementById('wh-code') || {}).value || '';
    var ref = (document.getElementById('wh-ref') || {}).value || '';
    if (!String(code).trim()) {
      dire(MOTIFS.code_requis, 'err');
      var c = document.getElementById('wh-code');
      if (c) { c.className = 'manque'; c.focus(); }
      return;
    }
    appeler('stock:entrepotEcrire', [WH_EDIT.id || '', code, ref]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(WH_EDIT.id ? 'Emplacement modifié.' : 'Emplacement créé.', 'bon');
      WH_EDIT = null;
      chargerOnglet();
    });
  }

  function entrepotSupprimer(id){
    var w = (WHS && WHS.lignes || []).filter(function(x){ return x.id === id; })[0];
    if (!w) return;
    // ⚠ MEME REGLE QUE L ECRAN DU SITE : utilise = pas supprimable, on
    // reassigne d abord. Le pont refuse aussi — ceci n est que le recit.
    if (w.usage > 0) {
      voile('<h3>Suppression impossible</h3>'
        + '<p>L’emplacement <strong>' + esc(w.code) + '</strong> est utilisé par <strong>'
        + w.usage + ' variante(s)</strong> de produit.</p>'
        + '<p style="color:#8fa1b8;font-size:.8rem">Réassignez ces variantes à un autre '
        + 'emplacement avant de supprimer celui-ci.</p>'
        + '<div class="fin2"><button class="prim" id="v-ok">Compris</button></div>',
        function(fermer){ document.getElementById('v-ok').onclick = fermer; });
      return;
    }
    voile('<h3>Supprimer l’emplacement</h3>'
      + '<p>Supprimer <strong>' + esc(w.code) + '</strong> ? Aucune variante ne l’utilise.</p>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Supprimer</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          this.disabled = true;
          appeler('stock:entrepotSupprimer', [id]).then(function(r){
            fermer();
            dire(r.ok ? 'Emplacement « ' + (r.code || '') + ' » supprimé.' : expliquer(r), r.ok ? 'bon' : 'err');
            chargerOnglet();
          });
        };
      });
  }

  // ══ CHARGEMENT ════════════════════════════════════════════════════════════
  function chercher(texte){
    var q = String(texte || '').trim();
    if (!q) { VUE = 'reappro'; dessinerListe(); return; }
    appeler('stock:chercher', [q]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      if (r.sku) { dire(''); ouvrirProduit(r.sku.produitId, r.sku.cle); return; }
      if (r.court) { dire('Trois caractères minimum.', 'att'); return; }
      dire('');
      TROUVES = r.articles || [];
      VUE = 'recherche';
      // ⚠ ON REDESSINE SANS RENDRE LE FOCUS : la personne est en train de taper.
      var champ = document.getElementById('rech');
      var pos = champ ? champ.selectionStart : null;
      var val = champ ? champ.value : '';
      dessinerListe();
      var neuf = document.getElementById('rech');
      if (neuf) { neuf.value = val; if (pos !== null) { try { neuf.setSelectionRange(pos, pos); } catch (e) {} } }
    });
  }

  function ouvrirProduit(pid, cleEnAvant){
    if (!pid) return;
    dire('Ouverture…');
    appeler('stock:lire', [pid]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      PROD = r.produit;
      ENTREPOTS = r.entrepots || [];
      // ⚠ L INSTANTANE VIENT DU SITE ET NE BOUGE PLUS : c est la reference de la
      // detection de conflit. Le recalculer au moment d enregistrer reviendrait a
      // comparer l etat courant a lui-meme, donc a ne rien detecter du tout.
      BASE = r.base;
      VARS = (r.variantes || []).map(function(v){
        return { cle: v.cle, taille: v.taille, couleur: v.couleur, sku: v.sku,
                 teinte: v.teinte, qte: v.qte, seuil: v.seuil, entrepot: v.entrepot };
      });
      FILTRE = { couleur: [], taille: [], menu: null };
      PAGE = 0;
      // Un code scanne designe une variante : on la met en avant en filtrant sur
      // sa couleur, plutot que de laisser chercher une ligne parmi trente.
      if (cleEnAvant) {
        var v = VARS.filter(function(x){ return x.cle === cleEnAvant; })[0];
        if (v) FILTRE.couleur = [v.couleur];
      }
      VUE = 'produit';
      document.getElementById('titre').textContent = 'Ajustement de stock';
      dire('');
      dessiner();
      prendreVerrou(pid);
    });
  }

  var VERROU_PRIS = false;
  function prendreVerrou(pid){
    // ⚠ A L OUVERTURE, PAS A L ENREGISTREMENT : decouvrir le verrou apres avoir
    // saisi trente quantites, c est perdre la saisie.
    appeler('verrou:prendre', ['products', pid]).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      VERROU_PRIS = !!v.obtenu;
      if (v.obtenu) { sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 Section verrouillée en modification par : ' + (v.par || 'vous'); return; }
      sous.textContent = '⚠ ouverte par ' + (v.parQui || 'quelqu’un d’autre');
      var b = document.getElementById('btn-enr');
      if (b) { b.disabled = true; b.textContent = 'Ouverte ailleurs'; }
      dire('Enregistrement bloqué : ce produit est ouvert ailleurs.', 'err');
    });
  }
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    VERROU_PRIS = false;
    sous.textContent = '';
    appeler('verrou:rendre');
  }

  // Recharge les donnees de L ONGLET COURANT, et lui seul : la fenetre ne
  // demande jamais les quatre a la fois.
  function chargerOnglet(garderFocus){
    dessinerOnglets();
    if (ONGLET === 'produits') {
      appeler('stock:produits', [FP]).then(function(r){
        if (!r || !r.ok) { vide('Inventaire indisponible', expliquer(r)); return; }
        PRODS = r;
        // Le site borne page et cadence : on reprend SES valeurs, pas les notres.
        FP.page = r.page; FP.parPage = r.parPage;
        NB_REAPPRO = r.stats.aCommander;
        // ⚠ On redessine SANS voler le focus : la personne est en train de taper.
        var av = document.getElementById('fp-q');
        var focus = garderFocus && av && document.activeElement === av;
        var pos = focus ? av.selectionStart : null;
        dessiner();
        if (focus) {
          var neuf = document.getElementById('fp-q');
          if (neuf) { neuf.focus(); try { neuf.setSelectionRange(pos, pos); } catch (e) {} }
        }
      });
      return;
    }
    if (ONGLET === 'reappro') {
      appeler('stock:reappro').then(function(r){
        if (!r || !r.ok) { vide('Inventaire indisponible', expliquer(r)); return; }
        REAPPRO = r.lignes || [];
        NB_REAPPRO = REAPPRO.length;
        dessiner();
      });
      return;
    }
    if (ONGLET === 'endommages') {
      appeler('stock:endommages', [DMG_AN]).then(function(r){
        if (!r || !r.ok) { vide('Inventaire indisponible', expliquer(r)); return; }
        DMG = r;
        dessiner();
      });
      return;
    }
    appeler('stock:entrepots').then(function(r){
      if (!r || !r.ok) { vide('Inventaire indisponible', expliquer(r)); return; }
      WHS = r;
      dessiner();
    });
  }

  function charger(){
    appeler('stock:contexte').then(function(c){
      if (!c || !c.ok) { vide('Inventaire indisponible', expliquer(c)); return; }
      CTX = c;
      sous.textContent = c.peutEcrire ? '' : '👁 Lecture seule';
      chargerOnglet();
    });
  }

  // ══ ENREGISTREMENT ════════════════════════════════════════════════════════
  function enregistrer(){
    if (enCours || !PROD) return;
    enCours = true; majBouton(); dire('Enregistrement…');
    // ⚠ LA GRILLE PART ENTIERE, filtres et pagination ignores. Les cartes stock et
    // lowStockVar font autorite pour le produit : une saisie
    // partielle mettrait le reste a zero. Le coeur refuse d ailleurs une grille
    // incomplete plutot que d ecrire une version amputee.
    var saisie = {
      variantes: VARS.map(function(v){
        return { cle: v.cle, taille: v.taille, couleur: v.couleur,
                 qte: v.qte, seuil: v.seuil, entrepot: v.entrepot };
      }),
      base: BASE
    };
    appeler('stock:enregistrer', [PROD.id, saisie]).then(function(r){
      enCours = false;
      if (r.ok) { majBouton(); apresSucces(r); return; }
      majBouton();
      echec(r);
    });
  }

  function nommer(cle){
    var v = VARS.filter(function(x){ return x.cle === cle; })[0];
    return v ? (v.taille + ' / ' + v.couleur) : cle;
  }

  function echec(r){
    if (r.motif === 'seuil_invalide') {
      dire('Seuil invalide pour : ' + (r.seuilsInvalides || []).map(nommer).join(', ') + '.', 'err');
      return;
    }
    if (r.motif === 'emplacement_requis') {
      var m = r.manquants || [];
      dire('Sélectionnez un emplacement pour : ' + m.map(nommer).join(', ') + '.', 'err');
      // On amene la personne SUR la variante fautive : sans cela, la ligne
      // nommee peut se trouver sur une autre page et le message ne sert a rien.
      if (m.length) {
        FILTRE = { couleur: [], taille: [], menu: null };
        var v = VARS.filter(function(x){ return x.cle === m[0]; })[0];
        if (v) { var k = VARS.indexOf(v); PAGE = Math.floor(k / TAILLE_PAGE); }
        dessiner();
      }
      return;
    }
    if (r.motif === 'conflit') {
      conflit(r);
      return;
    }
    if (r.motif === 'grille_incomplete') {
      dire('Inventaire NON enregistré — la grille est incomplète ('
        + (r.absentes || []).slice(0, 3).join(', ') + '). Rouvrez le produit.', 'err');
      return;
    }
    dire(expliquer(r), 'err');
  }

  /* ⚠ UN CONFLIT N EST PAS UNE PANNE, ET IL SE RACONTE. Le collegue a touche la
     MEME variante que moi : rien n a ete ecrit, et la grille est rechargee avec
     les quantites a jour pour que la saisie se refasse par-dessus, en connaissance
     de cause. (Quand il a touche d AUTRES variantes, le site a deja fusionne et
     rejoue tout seul — on n arrive jamais ici dans ce cas.) */
  function conflit(r){
    var lignes = (r.conflits || []).map(function(c){
      return '<div class="rangee"><span>' + esc(nommer(c.cle)) + '</span><strong>' + c.actuel + '</strong></div>';
    }).join('');
    voile('<h3>⚠ Inventaire non enregistré</h3>'
      + '<p>Un collègue vient de modifier ' + ((r.conflits || []).length > 1 ? 'ces variantes' : 'cette variante')
      + '. <strong>Rien n’a été écrit.</strong></p>'
      + lignes
      + '<p style="color:#8fa1b8;font-size:.8rem">La grille est rechargée avec les quantités à jour : '
      + 'refaites votre saisie par-dessus.</p>'
      + '<div class="fin2"><button class="prim" id="v-ok">Recharger la grille</button></div>',
      function(fermer){
        document.getElementById('v-ok').onclick = function(){
          fermer();
          var pid = PROD.id;
          rendreVerrou();
          ouvrirProduit(pid);
        };
      });
  }

  function apresSucces(r){
    var h = '<h3>✅ Inventaire enregistré</h3><p>' + esc(r.nom || '') + '</p>';
    var c = r.courriels;
    if (c && c.manuel) {
      // ⚠ ON NE PRETEND PAS QUE C EST PARTI. Resend n est pas configure : aucun
      // courriel n a ete envoye, et les demandes restent en attente en base.
      h += '<p class="" style="color:#fbbf24">⚠ ' + c.adresses.length + ' client'
        + (c.adresses.length > 1 ? 's attendent' : ' attend') + ' cette variante, et '
        + '<strong>aucun courriel n’est parti</strong> — la clé d’envoi n’est pas configurée '
        + '(Configuration puis Infolettre). Les demandes restent en attente.</p>'
        + '<textarea rows="2" readonly>' + esc(c.adresses.join(', ')) + '</textarea>';
    } else if (c) {
      h += '<p style="color:#4ade80">✉ ' + c.envoyes + ' courriel' + (c.envoyes > 1 ? 's' : '')
        + ' de retour en inventaire envoyé' + (c.envoyes > 1 ? 's' : '')
        + (c.echecs ? ', <span style="color:#f87171">' + c.echecs + ' échec'
            + (c.echecs > 1 ? 's' : '') + '</span>' : '') + '.</p>';
    }
    var etiq = r.etiquettes || [];
    var total = 0;
    etiq.forEach(function(it){ total += (parseInt(it.qty, 10) || 0); });
    if (etiq.length) {
      h += '<p>Imprimer les étiquettes code-barres selon les quantités saisies ? '
        + '<strong>' + total + '</strong> étiquette' + (total > 1 ? 's' : '')
        + ' pour ' + etiq.length + ' variante' + (etiq.length > 1 ? 's' : '') + '.</p>';
    }
    h += '<div class="fin2">'
      + (etiq.length ? '<button id="v-plus-tard">Plus tard</button>'
                       + '<button class="prim" id="v-imprimer"><span class="ic">🖨</span> Imprimer maintenant</button>'
                     : '<button class="prim" id="v-ok">Fermer</button>')
      + '</div>';
    voile(h, function(fermer){
      var ok = document.getElementById('v-ok');
      if (ok) ok.onclick = function(){ fermer(); retourListe(); };
      var pt = document.getElementById('v-plus-tard');
      if (pt) pt.onclick = function(){ fermer(); retourListe(); };
      var im = document.getElementById('v-imprimer');
      if (im) im.onclick = function(){
        im.disabled = true; im.textContent = 'Impression…';
        appeler('stock:etiquettes', [etiq]).then(function(z){
          fermer();
          dire(z.ok ? (z.envoyees + ' étiquette(s) envoyée(s) à « ' + z.imprimante + ' ».')
                    : expliquer(z), z.ok ? 'bon' : 'err');
          retourListe();
        });
      };
    });
  }

  // Apres un enregistrement reussi on revient a la liste, RECHARGEE : la variante
  // qu on vient de remplir ne doit plus figurer parmi celles a commander.
  function retourListe(){
    rendreVerrou();
    PROD = null; VARS = []; BASE = null;
    VUE = 'reappro';
    charger();
  }

  // ══ ETIQUETTES ════════════════════════════════════════════════════════════
  function etiquettesVariante(i){
    var v = VARS[i];
    if (!v || !v.sku) return;
    var defaut = Math.max(1, parseInt(v.qte, 10) || 1);
    voile('<h3><span class="ic">🏷</span> Imprimer des étiquettes</h3>'
      + '<p><span class="code">' + esc(v.sku) + '</span> — ' + esc(v.taille) + ' / ' + esc(v.couleur) + '</p>'
      + '<p><label>Nombre d’étiquettes<input type="number" min="1" id="v-qte" value="' + defaut + '"></label></p>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Imprimer</button></div>',
      function(fermer){
        var champ = document.getElementById('v-qte');
        if (champ) champ.focus();
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          var n = parseInt(champ.value, 10);
          if (!(n > 0)) { dire('Quantité invalide.', 'err'); return; }
          fermer();
          imprimer([{ sku: v.sku, name: PROD.nom, size: v.taille, color: v.couleur, qty: n }]);
        };
      });
  }

  // ⚠ LES QUANTITES SAISIES, PAS CELLES EN BASE — comme le bouton de l ecran du
  // site : on imprime pour la marchandise qu on vient de recevoir et d entrer,
  // pas pour celle d avant.
  function toutesLesEtiquettes(){
    var items = [];
    var total = 0;
    VARS.forEach(function(v){
      var q = parseInt(v.qte, 10) || 0;
      if (v.sku && q > 0) { items.push({ sku: v.sku, name: PROD.nom, size: v.taille, color: v.couleur, qty: q }); total += q; }
    });
    if (!items.length) { dire('Aucune variante en stock à imprimer.', 'att'); return; }
    voile('<h3><span class="ic">🏷</span> Imprimer les étiquettes</h3>'
      + '<p>Imprimer <strong>' + total + '</strong> étiquette' + (total > 1 ? 's' : '')
      + ' pour ' + items.length + ' variante' + (items.length > 1 ? 's' : '') + ' en stock ?</p>'
      + '<p style="color:#8fa1b8;font-size:.8rem">Quantités telles qu’elles sont saisies à l’écran, '
      + 'même si l’inventaire n’est pas encore enregistré.</p>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Imprimer</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){ fermer(); imprimer(items); };
      });
  }

  function imprimer(items){
    dire('Impression…');
    appeler('stock:etiquettes', [items]).then(function(z){
      dire(z.ok ? (z.envoyees + ' étiquette(s) envoyée(s) à « ' + z.imprimante + ' ».')
                : expliquer(z), z.ok ? 'bon' : 'err');
    });
  }

  // ══ VOILE ═════════════════════════════════════════════════════════════════
  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  function quitter(){ rendreVerrou(); P.fermer(); }

  // Echap ferme, comme partout ailleurs — mais pas quand un voile est ouvert :
  // il fermerait la fenetre entiere au lieu de la question posee.
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); quitter(); }
  });
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE (2026-08-08) : un produit modifie
     AILLEURS (assistant Produit, caisse, retour, remboursement) fait relire
     cette fenetre sans geste. JAMAIS pendant un travail en cours : la grille
     d un produit, un voile ouvert ou une ligne d entrepot en edition se
     laissent finir — leurs chemins de sortie rechargent deja tout. */
  window.szActualiser = function(){
    if (VUE === 'produit') return;
    if (WH_EDIT) return;
    if (document.querySelector('.voile')) return;
    chargerOnglet(true);
  };


  /* ── MODE ANCRE ── La coquille appelle szModeAncre(true) quand cette page
     vit DANS la fenetre principale : on offre alors << Detacher >>, qui
     emporte la vue — et tout son etat — dans une vraie fenetre. */
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
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    // Le meme bouton dit l inverse selon le mode : detacher la vue ancree,
    // ou RAMENER la vue detachee dans la fenetre principale (etat retenu).
    if (actif) {
      b.textContent = '\u29c9 D\u00e9tacher';
      b.title = 'Ouvrir cet \u00e9cran dans sa propre fen\u00eatre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '\u2693 Ancrer';
      b.title = 'Ramener cet \u00e9cran dans la fen\u00eatre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  var DEPART = ${depart};
  // << onglet:… >> ouvre la fenetre sur un onglet precis ; tout autre identifiant
  // est un produit dont on ouvre la grille directement.
  if (DEPART.indexOf('onglet:') === 0) {
    var ong = DEPART.slice(7);
    if (['produits', 'reappro', 'endommages', 'entrepots'].indexOf(ong) >= 0) ONGLET = ong;
    DEPART = '';
  }
  dessiner();
  charger();
  if (DEPART) ouvrirProduit(DEPART);
})();
</script>
</body></html>`;
}

module.exports = { pageInventaire };
