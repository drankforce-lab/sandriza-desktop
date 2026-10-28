'use strict';

/*
 * FENÊTRE « PRODUITS EN VENTE » — NATIVE
 * =============================================================================
 * La liste des produits en vente : recherche, catégorie, étiquette (dont vente
 * finale et liquidation), filtre d'inventaire (à commander / seuil non
 * atteint), tri par paniers actifs, pagination. Cliquer une ligne ouvre
 * l'assistant Produit sur la fiche (produits:ouvrir) ; « + Nouveau produit »
 * ouvre l'assistant vierge (produits:nouveau). AUCUNE écriture ici.
 *
 * ⚠ LE TRI, LE FILTRE ET LA PAGINATION VIVENT DANS LE SITE (le cœur
 * Admin._produitsDonnees, le même que l'écran web) : la fenêtre envoie ses
 * filtres et ne reçoit que SA page, en lignes allégées — jamais d'image ni de
 * coût par le pont. C'est le patron de la fenêtre Commandes.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('produits');

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
/* << Aucun scroll bar dans l application >> (2026-10-12) : la liste ne defile
   plus, elle est BORNEE (carte pleine, liste flex) et sa hauteur reelle decide
   du nombre de lignes demandees au site (szAutoPagination). */
.corps.plein .carte.plein{flex:1 1 0;min-height:0}
.corps.plein .carte.plein>.liste{flex:1 1 auto;min-height:0;overflow:hidden}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input[type=search],select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:210px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:var(--v04)}
tbody td{padding:.34rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.6875rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.prixbarre{color:var(--tx2);text-decoration:line-through;font-size:.76rem;margin-right:.35rem}
/* ── La refonte de l Inventaire (2026-09-25) ── */
.tuiles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.6rem;flex:0 0 auto}
.tuile{background:var(--f-carte);border:1px solid var(--v07);min-width:0}
.tuile .sub{font-size:.72rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tuile.cliq{cursor:pointer;user-select:none;position:relative}
.tuile.cliq:hover{border-color:var(--or)}
.tuile.cliq::after{content:"›";position:absolute;top:.55rem;right:.8rem;font-size:1.1rem;color:var(--tx3)}
.tuile.on{border-color:var(--or)}
.val.att{color:var(--tx-att)}.val.err{color:var(--tx-err)}
.rf-tb select{height:2.4rem;border-radius:10px;background:var(--f-0f1826);border-color:var(--v10);max-width:12rem}
/* --cc : la couleur de la categorie, posee EN LIGNE ; chaque var() a son repli. */
.rf-av.tc{background:color-mix(in srgb,var(--cc,#6d7f96) 16%,transparent);
  border-color:color-mix(in srgb,var(--cc,#6d7f96) 34%,transparent);color:color-mix(in srgb,var(--cc,#6d7f96) 72%,white)}
html.jour .rf-av.tc{color:color-mix(in srgb,var(--cc,#6d7f96) 55%,black);
  background:color-mix(in srgb,var(--cc,#6d7f96) 14%,white);border-color:color-mix(in srgb,var(--cc,#6d7f96) 32%,white)}
.stk{display:flex;align-items:center;gap:.5rem}
.stk b{font-size:.95rem;min-width:1.6rem;text-align:right}
/* LA BASCULE D AFFICHAGE (2026-10-12, sa demande : << un genre de bouton toggle >>) : deux positions
   accolees dans un rail, la position choisie en or. Un bouton d application est PLAT (pas d ombre). */
.vue-bascule{display:inline-flex;align-items:stretch;gap:2px;padding:3px;border-radius:10px;
  background:var(--v04);border:1px solid var(--v12);flex:0 0 auto}
.vue-bascule button{display:inline-flex;align-items:center;gap:.4rem;height:2rem;padding:0 .75rem;
  border:0!important;border-radius:7px;background:transparent!important;color:var(--tx2);font-size:.8rem;font-weight:600}
.vue-bascule button svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
.vue-bascule button:hover:not(.on){color:var(--tx);background:var(--v06)!important}
.vue-bascule button.on{background:var(--or)!important;color:#1a1208}
.lt-ch{display:flex;flex-direction:column;gap:.55rem;margin:.2rem 0 .4rem}
.lt-ch label{display:flex;align-items:center;gap:.5rem;font-size:.84rem}
.lt-ch select,.lt-ch input[type=number]{font:inherit;color:var(--tx);background:var(--f-champ);border:1px solid var(--v16);border-radius:8px;padding:.32rem .5rem}
.lt-ch input[type=number]{width:6.5rem}
.lot{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;
  background:var(--v04);border:1px solid rgba(var(--or-rgb),.45);border-radius:11px;
  padding:.5rem .8rem;font-size:.82rem}
.lot label{display:flex;align-items:center;gap:.4rem;cursor:pointer}
.lot input{width:auto}
tbody tr.coche td{background:rgba(var(--or-rgb),.1)}
td.c,th.c{width:2rem;text-align:center}
/* LA BARRE SUR DEUX RANGEES (2026-10-12) : les filtres en haut ; dessous, le compte a gauche et les
   gestes a droite (bascule d affichage, lot, marges, nouveau produit). Une seule rangee ecrasait la recherche. */
/* ➡ DE RETOUR SUR UNE SEULE LIGNE (2026-10-12, sa demande). La recherche cede la place en premier ; sous
   1240 px (fenetre detachee) la barre repasse sur deux lignes. */
/* ⚠ A LA LIGNE SEULEMENT S IL LE FAUT (2026-10-16) : les menus ne se compriment plus (voir plus bas) ;
   sous Linux, polices plus larges, la barre forcee sur une ligne poussait « + Nouveau produit » 58 px
   hors de la fenetre (banc-debordement, travail contrastes). Ici, elle tient sur une ligne. */
.rf-tb{flex-wrap:wrap!important;row-gap:.5rem!important}
.rf-tb>.rf-rch{flex:1 1 11rem;min-width:8rem}
.rf-tb>.rf-droite{flex:0 0 auto;display:flex;align-items:center;gap:.4rem;margin-left:auto}
.rf-tb>.rf-droite>.dt{margin-right:.3rem;white-space:nowrap}
/* Pour tenir sur une ligne : la bascule en icones seules (le libelle reste dans l infobulle et pour le
   lecteur d ecran), et des menus deroulants un peu plus etroits. */
.rf-droite .vue-bascule .tx{display:none}
.rf-droite .vue-bascule button{padding:0 .6rem}
/* ⚠ LES MENUS NE SE COMPRIMENT PAS (2026-10-16, banc-champs) : en 1400 px, la barre
   les ecrasait a 100 px — « Toutes les catég », « Toutes les étiqu » — et la croix de
   la recherche mordait sur le premier. Ils gardent leur largeur ; c est la recherche
   qui cede, jusqu a 7rem, puis la barre passe sur deux lignes (1240 px). */
.rf-tb select{flex:0 0 auto;max-width:11rem}
.rf-tb>.rf-rch{min-width:0}
.rf-tb>.rf-rch input{min-width:0}
@media (max-width:1500px){.rf-tb>.rf-droite>.dt{display:none}.rf-tb>.rf-rch{min-width:7rem}}
@media (max-width:1240px){.rf-tb{flex-wrap:wrap!important;row-gap:.5rem!important}}
/* Les boutons de la barre : meme hauteur que la recherche, libelle net. */
.rf-droite>button{height:2.4rem;padding:0 .95rem;border-radius:10px;font-weight:600;font-size:.82rem}
/* L AFFICHAGE COMPACT (2026-10-12, le meme que l Inventaire) : une ligne par produit, nom et categorie
   cote a cote, pastille plus petite. La pagination mesuree en tire plus de lignes. */
.liste.compacte tbody td{padding-top:.2rem!important;padding-bottom:.2rem!important}
.liste.compacte .rf-prod>div{display:flex;align-items:baseline;gap:.7rem;min-width:0}
.liste.compacte .rf-nom{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.liste.compacte .rf-sous{margin-top:0!important;white-space:nowrap}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:var(--tx2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
/* « Vérifier mes marges » (7.16.0) */
.voile{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;
  background:rgba(4,8,14,.62);padding:1rem}
.voile .boite{width:100%;max-width:70rem;max-height:92vh;display:flex;flex-direction:column;gap:.6rem;
  background:var(--f-carte);border:1px solid var(--v10);border-radius:12px;padding:1rem 1.1rem}
.voile h3{margin:0;font-size:1.02rem}
.mg-res{font-size:.8rem;color:var(--tx2);line-height:1.5}
/* ⚠ LE TABLEAU DES MARGES EST EN PAGES (data-pages, 2026-10-12), plus jamais
   defilant : la boite est plafonnee (92vh) et le tableau prend ce qui reste ;
   la mesure reaffiche toutes les lignes avant de compter, donc la boite qui
   retrecit apres coup ne fausse pas la mesure suivante. Les cases cochees des
   autres pages restent dans la page : << Appliquer a la selection >> les voit. */
.mg-tab{overflow:hidden;min-height:0;flex:1 1 auto;border:1px solid var(--v08);border-radius:9px}
.mg-tab table thead th{position:sticky;top:0;background:var(--f-carte);z-index:1}
.mg-tab tbody tr{cursor:default}
.mg-tab td.r,.mg-tab th.r{text-align:right;white-space:nowrap}
.mg-tab input[type=number]{width:6.5rem;font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:7px;padding:.18rem .4rem;text-align:right}
.mg-tab .sous{display:block;font-size:.7rem;color:var(--tx3)}
.mg-pied{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.mg-pied .droite{margin-left:auto;display:flex;gap:.5rem}
html.jour .voile{background:rgba(20,24,30,.35)}
`;

/** Page complète de la fenêtre native « Produits en vente ». */
function pageProduits() {
  return `${TETE()}
<title>${T("Produits en vente — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.products}</span><h1>${T("Produits en vente")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps plein" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;            // la page servie par le site (produits:liste)
  var Q = '';              // recherche
  var CAT = '';            // '' = toutes
  var TAG = '';            // '', tag, __final__, __liq__
  var STOCK = '';          // '', low, ok
  var TRI = 'recent';      // recent | cart
  var PAGE = 0;
  /* La taille de page est MESUREE (szAutoPagination, apres chaque dessin) :
     25 n est que le repli tant que la liste n a pas encore ete disposee. */
  var TAILLE = 25;
  /* L AFFICHAGE COMPACT, retenu sur le poste (sous garde), et << VENTE FINALE EN LOT >>, venu de
     l Inventaire (2026-10-12, sa demande). Les coches vivent ICI, pas dans les cases affichees :
     une selection posee puis paginee n est pas perdue. */
  var COMPACT = false;
  try { COMPACT = localStorage.getItem('sz-prod-compact') === '1'; } catch (e) {}
  var LOT = false, COCHES = {};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  /* ══ « VÉRIFIER MES MARGES » (7.16.0, 2026-10-09, sa demande) ══════════════════════════════
     Le pont (marges:analyser) compare chaque produit, coûts numériques compris (Fal.ai, Photoroom,
     aperçus 3D, répartis sur ses unités), à la marge des produits qui ont coûté le moins en
     technologie, et propose un prix. Ici on montre, on laisse modifier, et l'on applique à UN
     article ou à la SÉLECTION (marges:appliquer — inscrit à l'historique de chaque produit). */
  function argent(n){ return (typeof szArgent === 'function') ? szArgent(+n || 0) : ((+n || 0).toFixed(2) + ' $'); }
  function pct(x){ return Math.round((+x || 0) * 100) + ' %'; }
  function ouvrirMarges(){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite" role="dialog" aria-modal="true" aria-label="${T("Vérifier mes marges")}">'
      + '<h3>${T("Vérifier mes marges")}</h3><div class="mg-res" id="mg-res">${T("Analyse en cours…")}</div>'
      + '<div class="mg-tab" id="mg-tab" data-pages="marges"></div>'
      + '<div class="mg-pied"><button id="mg-tout">${T("Cocher les propositions")}</button><button id="mg-rien">${T("Tout décocher")}</button>'
      + '<span class="droite"><button id="mg-fermer">${T("Fermer")}</button><button class="prim" id="mg-appliquer" disabled>${T("Appliquer à la sélection")}</button></span></div></div>';
    document.body.appendChild(v);
    var L = [];
    function fermer(){ v.remove(); }
    function selection(){
      return L.filter(function(l){ var c = v.querySelector('input[data-c="' + l.id + '"]'); return c && c.checked; })
        .map(function(l){ var i = v.querySelector('input[data-p="' + l.id + '"]'); return { id: l.id, prix: parseFloat(String(i ? i.value : '').replace(',', '.')) }; })
        .filter(function(x){ return x.prix > 0; });
    }
    function majBouton(){ var n = selection().length; var b = document.getElementById('mg-appliquer');
      b.disabled = !n; b.textContent = n > 1 ? '${T("Appliquer aux ")}' + n + '${T(" articles")}' : '${T("Appliquer à la sélection")}'; }
    /* (2026-10-25, audit) Changer des prix EN BOUTIQUE passe par une boite a part
       qui nomme le nombre d articles et les ecarts (regle maison). */
    function appliquer(liste){
      if (!liste.length) return;
      var det = liste.slice(0, 6).map(function(x){
        var l = L.find(function(y){ return y.id === x.id; }) || {};
        return [l.nom || x.id, argent(l.prix) + ' → ' + argent(x.prix)];
      });
      if (liste.length > 6) det.push(['…', '+ ' + (liste.length - 6)]);
      szConfirmer({ prudent: true, titre: '${T("Appliquer les nouveaux prix")}',
        texte: szPl(liste.length, '${T("Le prix de {0} article sera changé en boutique, et inscrit à son historique.")}',
          '${T("Le prix de {0} articles sera changé en boutique, et inscrit à l’historique de chacun.")}').split('{0}').join(liste.length),
        details: det,
        oui: szPl(liste.length, '${T("Changer le prix")}', '${T("Changer {0} prix")}').split('{0}').join(liste.length) }).then(function(oui){
        if (oui) appliquerMaintenant(liste);
      });
    }
    function appliquerMaintenant(liste){
      dire('${T("Application des nouveaux prix…")}');
      appeler('marges:appliquer', [liste]).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.faits + (r.faits > 1 ? '${T(" prix ajustés — inscrits à l’historique de chaque produit.")}' : '${T(" prix ajusté — inscrit à l’historique du produit.")}')
          + (r.refus && r.refus.length ? ' ' + r.refus.length + '${T(" refusé(s) (prix invalide ou plus du triple).")}' : ''), 'bon');
        analyser(); try { charger(); } catch (e) {}
      });
    }
    function dessiner(d){
      L = d.lignes || [];
      var rs = d.resume || {};
      document.getElementById('mg-res').innerHTML = '${T("Marge de référence (produits qui ont le moins coûté en technologie) :")} <b>' + pct(d.reference) + '</b> · '
        + rs.produits + '${T(" produits")} · ${T("coûts numériques au total :")} <b>' + argent(rs.coutsTotal) + '</b> · '
        + '<b>' + rs.aAjuster + '</b>${T(" ajustement(s) proposé(s)")}'
        + (rs.sansAchat ? ' · ' + rs.sansAchat + '${T(" sans coût d’achat (non analysés)")}' : '');
      if (!L.length) { document.getElementById('mg-tab').innerHTML = '<div class="vide">${T("Aucun produit actif à analyser.")}</div>'; return; }
      document.getElementById('mg-tab').innerHTML = '<table><thead><tr><th></th><th>${T("Produit")}</th><th class="r">${T("Prix")}</th><th class="r">${T("Coût d’achat")}</th>'
        + '<th class="r">${T("Coûts numériques")}</th><th class="r">${T("Coût / unité")}</th><th class="r">${T("Marge")}</th><th class="r">${T("Prix proposé")}</th><th class="r">${T("Marge après")}</th><th></th></tr></thead><tbody>'
        + L.map(function(l){
          var prop = l.proposition;
          var NOMS_GESTE = { apercu3d_tnb: '${T("Aperçu 3D (The New Black)")}', vue360: '${T("Vue 360°")}', apercu3d: '${T("Aperçu 3D")}', fantome: '${T("Mannequin retiré")}' };
          var det = (l.detail || []).map(function(x){ return x.n + ' × ' + (NOMS_GESTE[x.geste] || x.geste || x.modele) + ' (' + argent(x.cout) + ')'; }).join(' · ');
          return '<tr><td><input type="checkbox" aria-label="' + esc('${T("Sélectionner")} ' + l.nom) + '" data-c="' + esc(l.id) + '"' + (prop ? ' checked' : '') + (l.sansAchat ? ' disabled' : '') + '></td>'
            + '<td>' + esc(l.nom) + '<span class="sous">' + esc(l.sku || '') + (det ? ' — ' + esc(det) : '') + '</span></td>'
            + '<td class="r">' + argent(l.prix) + '</td><td class="r">' + (l.sansAchat ? '<span class="pill neutre">${T("inconnu")}</span>' : argent(l.achat)) + '</td>'
            + '<td class="r">' + (l.ia > 0 ? argent(l.ia) + '<span class="sous">' + l.iaN + '${T(" appel(s) · ")}' + l.unites + '${T(" unité(s)")}</span>' : '—') + '</td>'
            + '<td class="r">' + argent(l.coutUnite) + '</td>'
            + '<td class="r"><span class="pill ' + (l.marge < d.reference - 0.005 ? 'att' : 'bon') + '">' + pct(l.marge) + '</span></td>'
            + '<td class="r"><input type="number" min="0" step="1" aria-label="' + esc('${T("Nouveau prix de")} ' + l.nom) + '" data-p="' + esc(l.id) + '" value="' + (prop ? prop.prix : l.prix) + '"' + (l.sansAchat ? ' disabled' : '') + '></td>'
            + '<td class="r" data-ma="' + esc(l.id) + '">' + (prop ? pct(prop.margeApres) : '—') + '</td>'
            + '<td class="r"><button class="mini" data-un="' + esc(l.id) + '"' + (l.sansAchat ? ' disabled' : '') + '>${T("Appliquer")}</button></td></tr>';
        }).join('') + '</tbody></table>';
      v.querySelectorAll('input[data-c]').forEach(function(c){ c.onchange = majBouton; });
      v.querySelectorAll('input[data-p]').forEach(function(i){ i.oninput = function(){
        var l = L.find(function(x){ return x.id === i.getAttribute('data-p'); }); var n = parseFloat(String(i.value).replace(',', '.'));
        var c = v.querySelector('[data-ma="' + l.id + '"]'); if (c) c.textContent = n > 0 ? pct((n - l.coutUnite) / n) : '—';
        var cc = v.querySelector('input[data-c="' + l.id + '"]'); if (cc && n > 0 && n !== l.prix) cc.checked = true;
        majBouton(); }; });
      v.querySelectorAll('button[data-un]').forEach(function(b){ b.onclick = function(){
        var id = b.getAttribute('data-un'); var i = v.querySelector('input[data-p="' + id + '"]');
        appliquer([{ id: id, prix: parseFloat(String(i.value).replace(',', '.')) }]); }; });
      majBouton();
    }
    function analyser(){
      appeler('marges:analyser', []).then(function(r){
        if (!r || !r.ok) { document.getElementById('mg-res').textContent = expliquer(r); return; }
        dessiner(r);
      });
    }
    document.getElementById('mg-fermer').onclick = fermer;
    document.getElementById('mg-tout').onclick = function(){ L.forEach(function(l){ var c = v.querySelector('input[data-c="' + l.id + '"]'); if (c && !c.disabled) c.checked = !!l.proposition; }); majBouton(); };
    document.getElementById('mg-rien').onclick = function(){ v.querySelectorAll('input[data-c]').forEach(function(c){ c.checked = false; }); majBouton(); };
    document.getElementById('mg-appliquer').onclick = function(){ appliquer(selection()); };
    v.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') { ev.stopPropagation(); fermer(); } });
    /* (2026-10-25, audit) Le focus restait sur #p-marges, hors du voile : Echap
       passait au document et fermait TOUTE la fenetre. On donne le focus a la
       boite, et le document sait refermer la boite (v._fermer). */
    v._fermer = fermer;
    try { document.getElementById('mg-fermer').focus(); } catch (e) {}
    analyser();
  }
  function fmt(n){
    return szArgent(n);   /* voir szArgent (socle) : le repli aussi place le symbole */
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux produits.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette fiche n’existe plus.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
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
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function pilStock(r){
    if (r.stockTotal === 0) return '<span class="rf-pill rouge" title="${T("Aucune unité en stock")}">${T("Rupture")}</span>';
    if (r.variantesBas > 0) return '<span class="rf-pill ambre" title="' + esc(r.bassesDetail) + '">'
      + r.variantesBas + ' ' + szPl(r.variantesBas, '${T("variante à commander")}', '${T("variantes à commander")}') + '</span>';
    return '<span class="rf-pill vert">${T("Seuil non atteint")}</span>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    /* ══ LA REFONTE DE L INVENTAIRE, APPLIQUEE AUX PRODUITS (2026-09-25) ══════
       Tuiles comptees par le SITE sur la liste entiere (stats), dont deux qui
       filtrent d un clic sur EXACTEMENT ce qu elles comptent (stock low /
       rupture) ; barre sur une ligne a loupe ; ligne riche a la pastille de
       categorie, comme l Inventaire. Crochets gardes : #p-q, #p-cat, #p-tag,
       #p-stock, #p-tri, #p-nouveau, #p-prec, #p-suiv, #p-exporter, tr[data-id]. */
    var ST = D.stats || {};
    var tu = function(lib, val, sous, ton, geste){
      return '<div class="tuile' + (geste != null ? ' cliq' + (STOCK === geste ? ' on' : '') + '" data-tuile="' + geste
          + '" title="${T("Cliquer pour filtrer")}' : '') + '">'
        + '<div class="lbl">' + lib + '</div><div class="val' + (ton ? ' ' + ton : '') + '">' + val + '</div>'
        + '<div class="sub">' + sous + '</div></div>';
    };
    var h = szTuiles('<div class="tuiles">'
      + tu('${T("En vente")}', ST.actifs || 0, '${T("produits actifs")}', '', '')
      + (ST.aCommander != null
          ? tu('${T("À commander")}', ST.aCommander, '${T("seuil atteint")}', ST.aCommander ? 'att' : '', 'low') : '')
      + tu('${T("En rupture")}', ST.ruptures || 0, '${T("aucune unité")}', ST.ruptures ? 'err' : '', 'rupture')
      + tu('${T("Vente finale")}', ST.venteFinale || 0, '${T("ni retour ni échange")}', '', null)
      + tu('${T("Catégories")}', ST.categories || 0, '${T("représentées")}', '', null)
      + '</div>');
    h += '<div class="carte"><div class="rf-tb">'
      + '<label class="rf-rch">${ICO.loupe}<input aria-label="${T("Rechercher un produit")}" type="search" id="p-q" placeholder="${T("Rechercher…")}" value="' + esc(Q) + '"></label>'
      + '<select id="p-cat"><option value="">${T("Toutes les catégories")}</option>'
      + (D.cats || []).map(function(c){
          return '<option value="' + esc(c.cle) + '"' + (CAT === c.cle ? ' selected' : '') + '>' + esc(c.nom) + '</option>';
        }).join('')
      + '</select>'
      + '<select id="p-tag"><option value="">${T("Toutes les étiquettes")}</option>'
      + (D.etiquettes || []).map(function(t){
          return '<option value="' + esc(t) + '"' + (TAG === t ? ' selected' : '') + '>' + esc(t) + '</option>';
        }).join('')
      + (D.aFinal ? '<option value="__final__"' + (TAG === '__final__' ? ' selected' : '') + '><span class="ic">🔴</span> ${T("Vente finale")}</option>' : '')
      + (D.aLiq ? '<option value="__liq__"' + (TAG === '__liq__' ? ' selected' : '') + '><span class="ic">🟡</span> ${T("Liquidation")}</option>' : '')
      + '</select>'
      + '<select id="p-stock">'
      + '<option value=""' + (STOCK === '' ? ' selected' : '') + '>${T("Tout l’inventaire")}</option>'
      + '<option value="low"' + (STOCK === 'low' ? ' selected' : '') + '><span class="ic">⚠</span> ${T("À commander")}</option>'
      + '<option value="ok"' + (STOCK === 'ok' ? ' selected' : '') + '>${T("✓ Seuil non atteint")}</option>'
      + '<option value="rupture"' + (STOCK === 'rupture' ? ' selected' : '') + '>${T("En rupture")}</option>'
      + '</select>'
      + '<button class="rf-jet' + (TRI === 'cart' ? ' on' : '') + '" id="p-tri" '
      + 'title="${T("Mettre en premier les produits présents dans des paniers actifs")}">'
      + (TRI === 'cart' ? '<span class="ic">🛒</span> ${T("Tri panier ✓")}' : '<span class="ic">🛒</span> ${T("Trier par panier")}') + '</button>'
      + '<span class="rf-droite"><span class="dt">' + (D.total || 0) + ' '
      + (D.total > 1 ? '${T("produits")}' : '${T("produit")}') + '</span>'
      + '<span class="vue-bascule" role="group" aria-label="${T("Affichage de la liste")}">'
      +   '<button type="button" data-vue="detail" aria-label="${T("Affichage détaillé")}" aria-pressed="' + (!COMPACT) + '" class="' + (!COMPACT ? 'on' : '') + '" title="${T("Affichage détaillé")}">'
      +     '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2.5" width="12" height="4.5" rx="1.2"/><rect x="2" y="9" width="12" height="4.5" rx="1.2"/></svg><span class="tx">${T("Détaillé")}</span></button>'
      +   '<button type="button" data-vue="compact" aria-label="${T("Affichage compact : une ligne par produit, plus de produits par page")}" aria-pressed="' + COMPACT + '" class="' + (COMPACT ? 'on' : '') + '" title="${T("Affichage compact : une ligne par produit, plus de produits par page")}">'
      +     '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3.5h12M2 6.5h12M2 9.5h12M2 12.5h12"/></svg><span class="tx">${T("Compact")}</span></button>'
      + '</span>'
      + ((D.peutVenteFinale || D.peutLot) && !LOT ? '<button id="p-lot" title="${T("Cocher plusieurs produits pour changer leur catégorie, leur prix, leur solde ou leur vente finale")}">${T("Sélectionner")}</button>' : '')
      + '<button id="p-marges" title="${T("Comparer les marges en tenant compte des coûts numériques (photos, IA, 3D)")}">${T("Vérifier mes marges")}</button>'
      + '<button class="prim" id="p-nouveau">${T("+ Nouveau produit")}</button></span>'
      + '</div></div>';

        /* ⚠ PLEINE HAUTEUR (2026-09-19) : la carte prend tout l espace restant et
       c est la LISTE qui defile. Sans ca, une liste courte s arrete a sa
       derniere ligne et laisse des centaines de pixels morts sous elle. */
    if (LOT) {
      var nCoches = Object.keys(COCHES).length;
      h += '<div class="lot">'
        + '<label><input type="checkbox" id="lot-page"> ${T("Toute la page")}</label>'
        + '<span id="lot-n">' + nCoches + ' '
        + (nCoches > 1 ? '${T("produits sélectionnés")}' : '${T("produit sélectionné")}') + '</span>'
        + '<span style="flex:1 1 auto"></span>'
        /* LES GESTES GROUPÉS (2026-10-27, sa demande) : catégorie, prix, solde — à côté de la vente finale d avant. */
        + (D.peutLot ? '<button id="lot-cat">${T("Catégorie…")}</button><button id="lot-prix">${T("Prix…")}</button><button id="lot-solde">${T("Solde…")}</button>' : '')
        + (D.peutVenteFinale ? '<button id="lot-app">${T("Appliquer vente finale")}</button><button id="lot-ret">${T("Retirer vente finale")}</button>' : '')
        + '<button id="lot-annuler">${T("Annuler")}</button></div>';
    }
    h += '<div class="carte plein">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">${T("Aucun produit ne correspond.")}</div>';
    } else {
      h += '<div class="liste' + (COMPACT ? ' compacte' : '') + '"><table><thead><tr>' + (LOT ? '<th class="c"></th>' : '') + '<th>${T("Produit")}</th>'
        + '<th>${T("Prix")}</th><th>${T("Inventaire")}</th><th style="text-align:center">${T("Paniers")}</th></tr></thead><tbody>'
        + rows.map(function(r){
            var badges = '';
            if (r.finalSale && !r.liquidation) badges += ' <span class="rf-pill ambre">${T("Vente finale")}</span>';
            if (r.liquidation) badges += ' <span class="rf-pill ambre">${T("Liquidation")}</span>';
            var prix = r.solde
              ? '<span class="rf-mont">' + esc(fmt(r.solde)) + '</span> <span class="prixbarre">' + esc(fmt(r.prix)) + '</span>'
                + '<span class="rf-pill">−' + Math.round((1 - r.solde / (r.prix || 1)) * 100) + ' %</span>'
              : '<span class="rf-mont">' + esc(fmt(r.prix)) + '</span>';
            var ini = String(r.categorie || r.nom || '?').charAt(0).toUpperCase();
            var cc = /^#[0-9a-f]{3,8}$/i.test(r.couleurCat || '') ? r.couleurCat : '';
            return '<tr data-id="' + esc(r.id) + '"' + (LOT && COCHES[r.id] ? ' class="coche"' : '')
              + ' title="' + (LOT ? '${T("Cliquer pour sélectionner")}' : '${T("Ouvrir la fiche")}') + '">'
              + (LOT ? '<td class="c"><input type="checkbox" data-coche="' + esc(r.id) + '" aria-label="' + esc('${T("Sélectionner")} ' + r.nom) + '"'
                  + (COCHES[r.id] ? ' checked' : '') + '></td>' : '')
              + '<td><div class="rf-prod">' + szVignette(r.image, ini, cc, szTd(r.categorie || ''))
              + '<div style="min-width:0"><div class="rf-nom">' + esc(r.nom) + szVerrouCase('products', r.id) + badges + '</div>'
              + '<div class="rf-sous"><span>' + esc(szTd(r.categorie || '—')) + '</span>'
              + (r.tag ? '<span>·</span><span>' + esc(r.tag) + '</span>' : '') + '</div></div></div></td>'
              + '<td>' + prix + '</td>'
              + '<td><div class="stk"><b>' + r.stockTotal + '</b>' + pilStock(r) + '</div></td>'
              + '<td style="text-align:center">' + (r.panier > 0 ? '<span class="ic">🛒</span> ' + r.panier : '<span class="dt">—</span>') + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table></div>';
      /* ⚠ Le pied de pages est TOUJOURS pose, meme sur une seule page : s il
         apparaissait apres la mesure, il mangerait la hauteur deja comptee. */
      if (rows.length) {
        h += '<div class="pagi">'
          + '<button class="mini" id="p-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>${T("Page")} ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="p-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';
    /* Le pied ferme la liste et porte l export (2026-09-19). ⚠ Ecran PAGINE :
       le pied compte ce qui est affiche SUR le total, et le fichier porte le
       numero de page — la meme regle que sur les clients. */
    if (rows.length) {
      var multiP = (D.pages || 1) > 1;
      h += szPied(
        multiP ? (rows.length + '${T(" sur ")}' + (D.total || 0))
               : (rows.length + ' ' + (rows.length > 1 ? '${T("produits")}' : '${T("produit")}')),
        '<button class="mini" id="p-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>');
    }
    corps.innerHTML = h;
    szVerrousPeindre();   // reposer les cadenas connus sur le tableau frais
    // La mesure : combien de lignes tiennent VRAIMENT dans la liste bornee.
    szAutoPagination('.liste', function(n){ if (n === TAILLE) return; TAILLE = n; PAGE = 0; charger(); });

    /* ⚠⚠ LE PRIX ET LE SOLDE SONT DEUX COLONNES, pas une chaine barree. A
       l ecran le solde se lit d un coup d oeil par-dessus le prix barre ; dans
       un fichier, cette mise en forme devient illisible et surtout
       INCALCULABLE. On envoie les deux nombres nus et le rabais en pourcentage,
       ce que l ecran n affiche que sous forme de pastille.
       ⚠ Et les deux etiquettes de vente (finale, liquidation) deviennent des
       colonnes oui/non : a l ecran ce sont des pastilles, dans un tableur ce
       sont des criteres de filtre. */
    var exp = document.getElementById('p-exporter');
    if (exp) exp.onclick = function(){
      var lignes = (D.lignes || []).map(function(r){
        var rabais = (r.solde && r.prix) ? Math.round((1 - r.solde / r.prix) * 100) : '';
        return [r.nom || '', r.categorie || '', r.tag || '', r.prix, r.solde || '', rabais,
          r.stockTotal, r.panier || 0,
          r.finalSale ? '${T("Oui")}' : '${T("Non")}',
          r.liquidation ? '${T("Oui")}' : '${T("Non")}'];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Produit")}', '${T("Catégorie")}', '${T("Étiquette")}',
        '${T("Prix")}', '${T("Solde")}', '${T("Rabais %")}', '${T("Inventaire")}',
        '${T("Paniers")}', '${T("Vente finale")}', '${T("Liquidation")}'], lignes);
      var jourP = new Date().toISOString().slice(0, 10);
      var mP = (D.pages || 1) > 1;
      szExporter('produits-' + jourP + (mP ? '-p' + ((D.page || 0) + 1) : '') + '.csv', csv,
        mP ? '${T("La page affichée")}' : '${T("La liste des produits")}');
    };

    var q = document.getElementById('p-q');
    if (q) {
      // La page vient du SITE : chaque frappe redemande, avec un court delai.
      q.oninput = function(){
        Q = q.value; PAGE = 0;
        clearTimeout(window._pq);
        window._pq = setTimeout(function(){ charger(true); }, 300);
      };
    }
    var brancher = function(id, fn){
      var e = document.getElementById(id);
      if (e) e.onchange = function(){ fn(e.value); PAGE = 0; charger(); };
    };
    brancher('p-cat', function(v){ CAT = v; });
    brancher('p-tag', function(v){ TAG = v; });
    brancher('p-stock', function(v){ STOCK = v; });
    // Les tuiles qui filtrent : un second clic sur la tuile choisie la relache.
    corps.querySelectorAll('[data-tuile]').forEach(function(b){
      b.onclick = function(){
        var g = b.getAttribute('data-tuile') || '';
        STOCK = (STOCK === g) ? '' : g; PAGE = 0; charger();
      };
    });
    var tri = document.getElementById('p-tri');
    if (tri) tri.onclick = function(){ TRI = (TRI === 'cart' ? 'recent' : 'cart'); PAGE = 0; charger(); };
    var bp = document.getElementById('p-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('p-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };
    corps.querySelectorAll('[data-vue]').forEach(function(b){
      b.onclick = function(){
        var c = b.getAttribute('data-vue') === 'compact';
        if (c === COMPACT) return;
        COMPACT = c;
        try { localStorage.setItem('sz-prod-compact', COMPACT ? '1' : '0'); } catch (e) {}
        dessiner();
      };
    });
    var bl = document.getElementById('p-lot');
    if (bl) bl.onclick = function(){ LOT = true; COCHES = {}; dessiner(); };
    var la = document.getElementById('lot-annuler');
    if (la) la.onclick = function(){ LOT = false; COCHES = {}; dessiner(); };
    var lap = document.getElementById('lot-app');
    if (lap) lap.onclick = function(){ venteFinaleLot(true); };
    var lr = document.getElementById('lot-ret');
    if (lr) lr.onclick = function(){ venteFinaleLot(false); };
    var lc = document.getElementById('lot-cat');
    if (lc) lc.onclick = function(){ lotGeste('categorie'); };
    var lpx = document.getElementById('lot-prix');
    if (lpx) lpx.onclick = function(){ lotGeste('prix'); };
    var ls = document.getElementById('lot-solde');
    if (ls) ls.onclick = function(){ lotGeste('solde'); };
    var lp = document.getElementById('lot-page');
    if (lp) lp.onchange = function(){
      // Coche ou decoche LA PAGE AFFICHEE ; la selection des autres pages reste ce qu elle etait.
      (D.lignes || []).forEach(function(r){ if (lp.checked) COCHES[r.id] = true; else delete COCHES[r.id]; });
      dessiner();
    };
    var bm = document.getElementById('p-marges');
    if (bm) bm.onclick = ouvrirMarges;
    var nv = document.getElementById('p-nouveau');
    if (nv) nv.onclick = function(){
      dire('${T("Ouverture…")}');
      appeler('produits:nouveau', []).then(function(r){
        dire(r.ok ? '${T("Assistant Produit ouvert dans sa fenêtre.")}' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
  }

  function compterLot(){
    var n = Object.keys(COCHES).length, e = document.getElementById('lot-n');
    if (e) e.textContent = n + ' ' + (n > 1 ? '${T("produits sélectionnés")}' : '${T("produit sélectionné")}');
  }
  function cocher(id, oui){
    if (oui) COCHES[id] = true; else delete COCHES[id];
    var tr = corps.querySelector('tr[data-id="' + id + '"]');
    if (tr) { tr.classList.toggle('coche', !!oui); var c = tr.querySelector('[data-coche]'); if (c) c.checked = !!oui; }
    compterLot();
  }
  corps.addEventListener('change', function(ev){
    var id = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-coche');
    if (id) cocher(id, ev.target.checked);
  });
  function venteFinaleLot(activer){
    var ids = Object.keys(COCHES);
    if (!ids.length) { dire('${T("Aucun produit sélectionné.")}', 'att'); return; }
    /* (2026-10-25, audit) Un geste en lot sur la boutique se confirme dans une boite
       a part, qui nomme le nombre de produits (activer : plus de retour possible). */
    szConfirmer({ prudent: true,
      titre: activer ? '${T("Activer la vente finale")}' : '${T("Retirer la vente finale")}',
      texte: (activer
        ? szPl(ids.length, '${T("{0} produit passera en vente finale : il ne pourra plus être retourné.")}', '${T("{0} produits passeront en vente finale : ils ne pourront plus être retournés.")}')
        : szPl(ids.length, '${T("{0} produit redeviendra retournable.")}', '${T("{0} produits redeviendront retournables.")}')).split('{0}').join(ids.length),
      oui: (activer ? '${T("Activer pour {0}")}' : '${T("Retirer pour {0}")}').split('{0}').join(ids.length) }).then(function(oui){
      if (oui) venteFinaleEcrire(ids, activer);
    });
  }
  /* ══ LES GESTES GROUPÉS SUR LES PRODUITS (2026-10-27) ══════════════════════════════
     Une boîte à part, comme toute confirmation (sa règle) : elle demande LA valeur, dit combien de produits
     changent, et le verbe du bouton nomme l action. Le calcul (arrondi, prix soldé) vit dans le site
     (pont.js, produitsLot) : la fenêtre n envoie que l intention. */
  function lotSaisie(o){
    return new Promise(function(fin){
      var v = document.createElement('div');
      v.className = 'szc-voile';
      v.innerHTML = '<div class="szc-boite" role="dialog" aria-modal="true" aria-labelledby="lt-t">'
        + '<h3 id="lt-t">' + esc(o.titre) + '</h3><p>' + esc(o.texte) + '</p>'
        + '<div class="lt-ch">' + o.champ + '</div>'
        + '<div class="szc-pied"><button type="button" class="szc-non">${T("Annuler")}</button><button type="button" class="szc-oui">' + esc(o.oui) + '</button></div></div>';
      document.body.appendChild(v);
      var ch = v.querySelector('.lt-ch select, .lt-ch input');
      var sortir = function(val){ if (v.parentNode) v.parentNode.removeChild(v); document.removeEventListener('keydown', cl, true); fin(val); };
      var valider = function(){ var x = o.lire(v); if (x === null) { if (ch) ch.focus(); return; } sortir(x); };
      var cl = function(ev){ if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); sortir(null); } else if (ev.key === 'Enter') { ev.preventDefault(); valider(); } };
      document.addEventListener('keydown', cl, true);
      v.querySelector('.szc-non').onclick = function(){ sortir(null); };
      v.querySelector('.szc-oui').onclick = valider;
      if (ch) ch.focus();
    });
  }
  function lotGeste(action){
    var ids = Object.keys(COCHES);
    if (!ids.length) { dire('${T("Aucun produit sélectionné.")}', 'att'); return; }
    var n = ids.length, combien = szPl(n, '${T("{0} produit sélectionné.")}', '${T("{0} produits sélectionnés.")}').split('{0}').join(n);
    var o;
    if (action === 'categorie') {
      o = { titre: '${T("Changer la catégorie")}', texte: combien, oui: '${T("Changer pour {0}")}'.split('{0}').join(n),
        champ: '<label>${T("Nouvelle catégorie")} <select id="lt-v">' + (D.cats || []).map(function(c){ return '<option value="' + esc(c.cle) + '">' + esc(c.nom) + '</option>'; }).join('') + '</select></label>',
        lire: function(v){ var x = v.querySelector('#lt-v'); return x && x.value ? x.value : null; } };
    } else if (action === 'prix') {
      o = { titre: '${T("Ajuster le prix")}', texte: combien + ' ${T("Un nombre négatif baisse le prix, positif le monte. Le prix soldé, s’il y en a un, suit dans la même proportion.")}',
        oui: '${T("Ajuster {0} prix")}'.split('{0}').join(n),
        champ: '<label>${T("Variation")} <input id="lt-v" type="number" step="1" min="-90" max="200" value="-10"> %</label>'
          + '<label class="lt-c"><input id="lt-99" type="checkbox"> ${T("Arrondir à ,99")}</label>',
        lire: function(v){ var x = Number(v.querySelector('#lt-v').value); if (!isFinite(x) || x === 0 || x < -90 || x > 200) return null; return { pct: x, arrondi99: !!v.querySelector('#lt-99').checked }; } };
    } else {
      o = { titre: '${T("Mettre en solde")}', texte: combien + ' ${T("Le rabais part du prix courant. 0 % retire le solde.")}',
        oui: '${T("Appliquer à {0}")}'.split('{0}').join(n),
        champ: '<label>${T("Rabais")} <input id="lt-v" type="number" step="5" min="0" max="90" value="20"> %</label>',
        lire: function(v){ var x = Number(v.querySelector('#lt-v').value); if (!isFinite(x) || x < 0 || x > 90) return null; return x; } };
    }
    lotSaisie(o).then(function(val){
      if (val === null) return;
      dire('${T("Enregistrement…")}');
      appeler('produits:lot', [ids, { action: action, valeur: val }]).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        var reste = r.nonConfirmes ? ' ' + r.nonConfirmes + ' ${T("non confirmé(s) par le serveur — relancez pour les reprendre.")}' : '';
        dire(szPl(r.n, '${T("{0} produit modifié.")}', '${T("{0} produits modifiés.")}').split('{0}').join(r.n) + reste, reste ? 'att' : 'bon');
        LOT = false; COCHES = {};
        charger();
      });
    });
  }
  function venteFinaleEcrire(ids, activer){
    appeler('stock:venteFinale', [ids, activer]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      var reste = r.nonConfirmes ? ' ' + r.nonConfirmes + ' ${T("non confirmé(s) par le serveur — relancez pour les reprendre.")}' : '';
      dire('${T("Vente finale")} ' + (activer ? '${T("activée")}' : '${T("retirée")}') + '${T(" pour ")}' + r.n + ' ' + szPl(r.n, '${T("produit.")}', '${T("produits.")}') + reste, reste ? 'att' : 'bon');
      LOT = false; COCHES = {};
      charger();
    });
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('button') || t.closest('input') || t.closest('select') || t.closest('label')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
    // En mode lot, la ligne COCHE au lieu d ouvrir la fiche.
    if (LOT) { var lid = tr.getAttribute('data-id'); cocher(lid, !COCHES[lid]); return; }
    dire('${T("Ouverture…")}');
    appeler('produits:ouvrir', [tr.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? '${T("Fiche ouverte dans l’assistant Produit.")}' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    /* ⚠ NE JAMAIS AVALER UN CLIC (la lecon de la fenetre Commandes) : un appel
       deja en vol note la demande, et la reponse perimee n est pas dessinee. */
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('produits:liste', [{ q: Q, cats: CAT ? [CAT] : [], tag: TAG,
      stock: STOCK, tri: TRI, page: PAGE, taille: TAILLE }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('${T("Produits indisponibles")}', expliquer(r)); return; }
      D = r;
      dire('');
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS : apres une frappe, le
     curseur et la selection sont remis ou ils etaient. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('p-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('p-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : un produit enregistre, une vente
     ou un ajustement de stock font relire la page — jamais pendant une saisie
     dans la recherche. */
  window.szActualiser = function(){
    var q = document.getElementById('p-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  // Ramenee au premier plan (menu, barre laterale) : la page se relit.
  window.szRevenir = function(){ charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans : detacher la vue
     ancree, ou RAMENER la vue detachee dans la fenetre principale. */
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
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    /* (2026-10-25, audit) Ce qui est par-dessus se ferme d abord : la boite de
       confirmation se gere seule, la boite des marges se referme — jamais toute
       la fenetre Produits. */
    if (document.querySelector('.szc-voile')) return;
    var vo = document.querySelector('.voile');
    if (vo) { if (vo._fermer) vo._fermer(); else vo.remove(); return; }
    P.fermer();
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
  szVerrousSuivre(['products']);
})();
</script>
</body></html>`;
}

module.exports = { pageProduits };
