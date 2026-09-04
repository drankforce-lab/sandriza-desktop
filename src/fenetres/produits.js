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

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input[type=search],select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:210px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v11)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v11)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:var(--v03)}
tbody td{padding:.34rem .4rem;border-top:1px solid var(--v05);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.prixbarre{color:var(--tx2);text-decoration:line-through;font-size:.76rem;margin-right:.35rem}
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
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Produits en vente — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.products}</span><h1>Produits en vente</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
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
    try { return (Number(n) || 0).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }); }
    catch (e) { return (Number(n) || 0).toFixed(2) + ' $'; }
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux produits.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette fiche n’existe plus.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
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
    if (r.stockTotal === 0) return '<span class="pill err" title="Aucune unité en stock">Rupture</span>';
    if (r.variantesBas > 0) return '<span class="pill att" title="' + esc(r.bassesDetail) + '">'
      + r.variantesBas + ' cat. à commander</span>';
    return '<span class="pill bon">Seuil non atteint</span>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var h = '<div class="barreoutils">'
      + '<input type="search" id="p-q" placeholder="Rechercher un produit…" value="' + esc(Q) + '">'
      + '<select id="p-cat"><option value="">Toutes les catégories</option>'
      + (D.cats || []).map(function(c){
          return '<option value="' + esc(c.cle) + '"' + (CAT === c.cle ? ' selected' : '') + '>' + esc(c.nom) + '</option>';
        }).join('')
      + '</select>'
      + '<select id="p-tag"><option value="">Toutes les étiquettes</option>'
      + (D.etiquettes || []).map(function(t){
          return '<option value="' + esc(t) + '"' + (TAG === t ? ' selected' : '') + '>' + esc(t) + '</option>';
        }).join('')
      + (D.aFinal ? '<option value="__final__"' + (TAG === '__final__' ? ' selected' : '') + '><span class="ic">🔴</span> Vente finale</option>' : '')
      + (D.aLiq ? '<option value="__liq__"' + (TAG === '__liq__' ? ' selected' : '') + '><span class="ic">🟡</span> Liquidation</option>' : '')
      + '</select>'
      + '<select id="p-stock">'
      + '<option value=""' + (STOCK === '' ? ' selected' : '') + '>Tout l’inventaire</option>'
      + '<option value="low"' + (STOCK === 'low' ? ' selected' : '') + '><span class="ic">⚠</span> À commander</option>'
      + '<option value="ok"' + (STOCK === 'ok' ? ' selected' : '') + '>✓ Seuil non atteint</option>'
      + '</select>'
      + '<button class="mini' + (TRI === 'cart' ? ' actif' : '') + '" id="p-tri" '
      + 'title="Mettre en premier les produits présents dans des paniers actifs">'
      + (TRI === 'cart' ? '<span class="ic">🛒</span> Tri panier ✓' : '<span class="ic">🛒</span> Trier par panier') + '</button>'
      + '<span class="droite">' + (D.total || 0) + ' produit' + (D.total > 1 ? 's' : '')
      + ' · ' + (D.stats && D.stats.ruptures || 0) + ' en rupture'
      + '<button class="prim" id="p-nouveau">+ Nouveau produit</button></span>'
      + '</div>';

    h += '<div class="carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">Aucun produit ne correspond.</div>';
    } else {
      h += '<table><thead><tr><th>Produit</th><th>Catégorie</th><th>Étiquette</th>'
        + '<th>Prix</th><th>Inventaire</th><th style="text-align:center">Paniers</th></tr></thead><tbody>'
        + rows.map(function(r){
            var badges = '';
            if (r.finalSale && !r.liquidation) badges += ' <span class="pill err">Vente finale</span>';
            if (r.liquidation) badges += ' <span class="pill att">Liquidation</span>';
            var prix = r.solde
              ? '<span class="prixbarre">' + esc(fmt(r.prix)) + '</span>' + esc(fmt(r.solde))
                + ' <span class="pill err">-' + Math.round((1 - r.solde / (r.prix || 1)) * 100) + '%</span>'
              : esc(fmt(r.prix));
            return '<tr data-id="' + esc(r.id) + '" title="Ouvrir la fiche">'
              + '<td><span class="num">' + esc(r.nom) + '</span>'
              + szVerrouCase('products', r.id) + badges + '</td>'
              + '<td>' + esc(r.categorie || '—') + '</td>'
              + '<td>' + (r.tag ? '<span class="pill neutre">' + esc(r.tag) + '</span>'
                : '<span class="dt">—</span>') + '</td>'
              + '<td>' + prix + '</td>'
              + '<td>' + r.stockTotal + ' ' + pilStock(r) + '</td>'
              + '<td style="text-align:center">' + (r.panier > 0 ? '<span class="ic">🛒</span> ' + r.panier : '<span class="dt">—</span>') + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table>';
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="p-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="p-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';
    corps.innerHTML = h;
    szVerrousPeindre();   // reposer les cadenas connus sur le tableau frais

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
    var tri = document.getElementById('p-tri');
    if (tri) tri.onclick = function(){ TRI = (TRI === 'cart' ? 'recent' : 'cart'); PAGE = 0; charger(); };
    var bp = document.getElementById('p-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('p-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };
    var nv = document.getElementById('p-nouveau');
    if (nv) nv.onclick = function(){
      dire('Ouverture…');
      appeler('produits:nouveau', []).then(function(r){
        dire(r.ok ? 'Assistant Produit ouvert dans sa fenêtre.' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
    dire('Ouverture…');
    appeler('produits:ouvrir', [tr.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? 'Fiche ouverte dans l’assistant Produit.' : expliquer(r), r.ok ? 'bon' : 'err');
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
      if (!r || !r.ok) { vide('Produits indisponibles', expliquer(r)); return; }
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
      b.textContent = '⧉ Détacher';
      b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '⚓ Ancrer';
      b.title = 'Ramener cet écran dans la fenêtre principale';
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
