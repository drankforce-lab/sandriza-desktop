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
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input[type=search],select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:210px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:var(--v04)}
tbody td{padding:.34rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
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
.tuile.cliq:hover{border-color:#c9a97e}
.tuile.cliq::after{content:"›";position:absolute;top:.55rem;right:.8rem;font-size:1.1rem;color:var(--tx3)}
.tuile.on{border-color:#c9a97e}
.val.att{color:var(--tx-att)}.val.err{color:var(--tx-err)}
.rf-tb select{height:2.4rem;border-radius:10px;background:var(--f-0f1826);border-color:var(--v10);max-width:12rem}
/* --cc : la couleur de la categorie, posee EN LIGNE ; chaque var() a son repli. */
.rf-av.tc{background:color-mix(in srgb,var(--cc,#6d7f96) 16%,transparent);
  border-color:color-mix(in srgb,var(--cc,#6d7f96) 34%,transparent);color:color-mix(in srgb,var(--cc,#6d7f96) 72%,white)}
html.jour .rf-av.tc{color:color-mix(in srgb,var(--cc,#6d7f96) 55%,black);
  background:color-mix(in srgb,var(--cc,#6d7f96) 14%,white);border-color:color-mix(in srgb,var(--cc,#6d7f96) 32%,white)}
.stk{display:flex;align-items:center;gap:.5rem}
.stk b{font-size:.95rem;min-width:1.6rem;text-align:right}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:var(--tx2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
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
  var TAILLE = 25;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
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
      + r.variantesBas + ' ${T("cat. à commander")}</span>';
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
      + '<label class="rf-rch">${ICO.loupe}<input aria-label="${T("Rechercher un produit")}" type="search" id="p-q" placeholder="${T("Rechercher un produit…")}" value="' + esc(Q) + '"></label>'
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
      + '<button class="prim" id="p-nouveau" style="height:2.4rem;padding:0 .9rem">${T("+ Nouveau produit")}</button></span>'
      + '</div></div>';

        /* ⚠ PLEINE HAUTEUR (2026-09-19) : la carte prend tout l espace restant et
       c est la LISTE qui defile. Sans ca, une liste courte s arrete a sa
       derniere ligne et laisse des centaines de pixels morts sous elle. */
    h += '<div class="carte plein">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">${T("Aucun produit ne correspond.")}</div>';
    } else {
      h += '<div class="liste"><table><thead><tr><th>${T("Produit")}</th>'
        + '<th>${T("Prix")}</th><th>${T("Inventaire")}</th><th style="text-align:center">${T("Paniers")}</th></tr></thead><tbody>'
        + rows.map(function(r){
            var badges = '';
            if (r.finalSale && !r.liquidation) badges += ' <span class="rf-pill rouge">${T("Vente finale")}</span>';
            if (r.liquidation) badges += ' <span class="rf-pill ambre">${T("Liquidation")}</span>';
            var prix = r.solde
              ? '<span class="rf-mont">' + esc(fmt(r.solde)) + '</span> <span class="prixbarre">' + esc(fmt(r.prix)) + '</span>'
                + '<span class="rf-pill rouge">-' + Math.round((1 - r.solde / (r.prix || 1)) * 100) + '%</span>'
              : '<span class="rf-mont">' + esc(fmt(r.prix)) + '</span>';
            var ini = String(r.categorie || r.nom || '?').charAt(0).toUpperCase();
            var cc = /^#[0-9a-f]{3,8}$/i.test(r.couleurCat || '') ? r.couleurCat : '';
            return '<tr data-id="' + esc(r.id) + '" title="${T("Ouvrir la fiche")}">'
              + '<td><div class="rf-prod"><span class="rf-av' + (cc ? ' tc" style="--cc:' + cc : '') + '" title="'
              + esc(r.categorie || '') + '" aria-hidden="true">' + esc(ini) + '</span>'
              + '<div style="min-width:0"><div class="rf-nom">' + esc(r.nom) + szVerrouCase('products', r.id) + badges + '</div>'
              + '<div class="rf-sous"><span>' + esc(r.categorie || '—') + '</span>'
              + (r.tag ? '<span>·</span><span>' + esc(r.tag) + '</span>' : '') + '</div></div></div></td>'
              + '<td>' + prix + '</td>'
              + '<td><div class="stk"><b>' + r.stockTotal + '</b>' + pilStock(r) + '</div></td>'
              + '<td style="text-align:center">' + (r.panier > 0 ? '<span class="ic">🛒</span> ' + r.panier : '<span class="dt">—</span>') + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table></div>';
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="p-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
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
    var nv = document.getElementById('p-nouveau');
    if (nv) nv.onclick = function(){
      dire('${T("Ouverture…")}');
      appeler('produits:nouveau', []).then(function(r){
        dire(r.ok ? '${T("Assistant Produit ouvert dans sa fenêtre.")}' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
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
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
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
