'use strict';
/*
 * SANTÉ DES DONNÉES — fenêtre native (2026-11-22, sa demande : « vas-y avec la fiabilité des données »)
 * =============================================================================
 * Le contrôle vit AU SERVEUR (lib-fiabilite.php) : chaque nuit, il relit les commandes, les factures, les
 * remboursements et le stock, et cherche ce qui ne tient pas ensemble. Cette fenêtre montre le dernier rapport,
 * la tendance des 14 derniers, et permet de relancer le contrôle tout de suite.
 *
 *   fiabilite:rapport → { rapports: [{ au, total, origine, rapport }], libelles }
 *   fiabilite:lancer  → la même chose, après un contrôle fait à l'instant
 *
 * ⚠ RIEN N'EST CORRIGÉ ICI, NI AU SERVEUR : chaque écart s'ouvre dans son écran (la commande, le produit), et une
 *   personne tranche.
 * ⚠ AUCUNE GLISSIÈRE : les écarts sont paginés par le socle (data-pages).
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script.
 */
const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('fiabilite');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .fb-outils{margin-left:auto;display:flex;gap:.7rem;align-items:center}
.tete .fb-quand{font-size:.78rem;color:var(--tx2)}
button{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.3rem .65rem;cursor:pointer}
button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.mini{font-size:.76rem;padding:.16rem .55rem}
#corps{flex:1 1 auto;min-height:0;overflow:hidden;padding:.8rem 1.1rem .7rem;display:flex;flex-direction:column;gap:.7rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)} .msg.att{color:var(--tx-att)}
.fb-haut{flex:0 0 auto;display:grid;grid-template-columns:minmax(0,1fr) 19rem;gap:.7rem}
.fc{background:var(--f-carte);border:1px solid var(--v08);border-radius:14px;padding:.85rem 1.05rem}
.fb-etat{display:flex;align-items:center;gap:1rem}
.fb-pastille{flex:0 0 auto;width:3rem;height:3rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font:800 1.15rem system-ui}
.fb-pastille.ok{background:rgba(52,199,123,.16);color:var(--tx-ok);border:1px solid rgba(52,199,123,.4)}
.fb-pastille.ecart{background:rgba(255,176,32,.14);color:var(--tx-att);border:1px solid rgba(255,176,32,.42)}
.fb-titre{margin:0;font-size:1.05rem;font-weight:750}
.fb-sous{margin:.15rem 0 0;font-size:.8rem;color:var(--tx2)}
.fb-tend h2,.fb-z h2{margin:0 0 .45rem;font-size:.68rem;letter-spacing:.07em;text-transform:uppercase;color:var(--tx2);font-weight:700}
.fb-barres{display:flex;align-items:flex-end;gap:4px;height:3.1rem}
.fb-barres i{flex:1 1 0;min-width:4px;border-radius:3px 3px 0 0;background:var(--v16)}
.fb-barres i.e{background:var(--or)}
.fb-z{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.fb-liste{flex:1 1 auto;min-height:0}
.fb-ctl{border-top:1px solid var(--v06);padding:.55rem 0}
.fb-ctl:first-child{border-top:0}
.fb-ctl-t{display:flex;align-items:baseline;gap:.6rem}
.fb-ctl-t b{font-size:.9rem}
.fb-nb{font:800 .78rem system-ui;color:var(--tx-att);background:rgba(255,176,32,.12);border-radius:99px;padding:.05rem .5rem}
.fb-ctl-d{margin:.15rem 0 .35rem;font-size:.78rem;color:var(--tx2)}
.fb-ex{display:flex;align-items:center;gap:.7rem;padding:.22rem 0 .22rem .7rem;font-size:.8rem}
.fb-ex .no{font-weight:650;white-space:nowrap}
.fb-ex .dt{color:var(--tx2);white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis;flex:1 1 auto}
.fb-ok{font-size:.8rem;color:var(--tx2);margin:.2rem 0 0}
.fb-ok b{color:var(--tx-ok);font-weight:700}
html.jour .fb-pastille.ok{color:#1d6438}
`;

function pageFiabilite() {
  return `${TETE()}
<title>${T("Santé des données — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.fiabilite}</span><h1>${T("Santé des données")}</h1>
  <div class="fb-outils"><span class="fb-quand" id="fb-quand"></span><button type="button" class="prim" id="fb-lancer">${T("Contrôler maintenant")}</button></div></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var D = null, OCCUPE = false;
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas de consulter la santé des données.")}',
    indisponible:       '${T("L’administration n’est pas chargée dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("Le contrôle a pris trop de temps. Réessayez dans un moment.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    reseau:             '${T("Le serveur n’a pas répondu. Vérifiez la connexion, puis réessayez.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  /* Les libellés des contrôles : ceux de la fenêtre (traduits) ; un contrôle ajouté au serveur demain paraît avec
     le libellé que le serveur lui donne. */
  var LIB = {
    stock_non_decompte: ['${T("Ventes dont le stock n’a jamais été décompté")}', '${T("La commande est payée (ou livrée) depuis plus de 2 heures, mais le stock de ses articles n’a pas été retiré : l’inventaire affiche des pièces déjà vendues.")}'],
    sans_facture:       ['${T("Commandes sans facture")}', '${T("La commande n’a pas de facture, ou sa facture n’existe plus : la vente manque aux pièces comptables.")}'],
    facture_orpheline:  ['${T("Factures sans commande")}', '${T("La facture renvoie à une commande qui n’existe pas (supprimée, ou jamais arrivée au nuage).")}'],
    totaux_differents:  ['${T("Total de la facture différent de la commande")}', '${T("La facture et sa commande ne portent pas le même total : l’une des deux a été modifiée après coup.")}'],
    livree_impayee:     ['${T("Commandes livrées, facture impayée")}', '${T("La commande est expédiée ou livrée, mais sa facture dit encore « impayée ».")}'],
    numero_double:      ['${T("Numéros en double")}', '${T("Deux commandes, ou deux factures, portent le même numéro.")}'],
    rembourse_trop:     ['${T("Remboursé plus que payé")}', '${T("La somme des remboursements dépasse le total de la commande.")}'],
    stock_negatif:      ['${T("Stock négatif")}', '${T("Une variante affiche moins de zéro pièce alors que l’article n’est pas en précommande.")}'],
    hors_ligne_coincee: ['${T("Ventes faites hors ligne, pas encore parties")}', '${T("Une vente faite à la caisse sans réseau il y a plus d’une journée n’a toujours pas son stock décompté au nuage : la caisse qui la garde n’a peut-être pas été rouverte.")}']
  };
  function lib(k){ var l = LIB[k]; if (l) return l; var s = (D && D.libelles && D.libelles[k]) || []; return [s[0] || k, s[2] || '']; }
  function argent(n){ return szArgent(+n || 0); }
  function quand(iso){
    var d = new Date(iso); if (isNaN(d)) return '';
    return d.toLocaleString('${LIEU()}', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  function ligneEx(k, e){
    var no = '', dt = '', bouton = '';
    if (k === 'stock_negatif') {
      no = e.produit || ''; dt = '${T("variante {0} : {1}")}'.split('{0}').join(String(e.variante || '')).split('{1}').join(String(e.quantite));
      if (e.id) bouton = '<button type="button" class="mini" data-prod="' + esc(e.id) + '">${T("Ouvrir")}</button>';
    } else if (k === 'numero_double') {
      no = e.numero || ''; dt = (e.sorte === 'facture' ? '${T("facture")}' : '${T("commande")}') + ' · ' + '${T("{0} pièces")}'.split('{0}').join(String(e.nb || 2));
    } else {
      no = e.numero || e.id || '';
      var p = [];
      if (e.date) p.push(e.date);
      if (e.total != null) p.push(argent(e.total));
      if (e.totalFacture != null) p.push('${T("facture {0} : {1}")}'.split('{0}').join(String(e.facture || '')).split('{1}').join(argent(e.totalFacture)));
      else if (e.facture) p.push('${T("facture {0}")}'.split('{0}').join(String(e.facture)));
      if (e.rembourse != null) p.push('${T("remboursé {0}")}'.split('{0}').join(argent(e.rembourse)));
      dt = p.join(' · ');
      if (e.id && k !== 'facture_orpheline') bouton = '<button type="button" class="mini" data-cmd="' + esc(e.id) + '">${T("Ouvrir")}</button>';
    }
    return '<div class="fb-ex"><span class="no">' + esc(no) + '</span><span class="dt">' + esc(dt) + '</span>' + bouton + '</div>';
  }
  function dessiner(){
    var rs = (D && D.rapports) || [];
    var der = rs[0], r = der && der.rapport;
    var q = document.getElementById('fb-quand');
    if (q) q.textContent = der ? ('${T("Dernier contrôle : {0}")}'.split('{0}').join(quand(der.au)) + (der.origine === 'nuit' ? ' ${T("(cette nuit)")}' : '')) : '';
    if (!r) {
      corps.innerHTML = '<div class="fc"><p class="fb-titre">${T("Aucun contrôle encore")}</p><p class="fb-sous">${T("Le contrôle passe chaque nuit. Pressez « Contrôler maintenant » pour le faire tout de suite.")}</p></div>';
      return;
    }
    var tot = +r.total || 0, lus = r.lus || {};
    var h = '<div class="fb-haut"><div class="fc fb-etat"><span class="fb-pastille ' + (tot ? 'ecart' : 'ok') + '">' + (tot ? esc(tot) : '0') + '</span><div>'
      + '<p class="fb-titre">' + (tot ? '${T("{0} écart(s) à regarder")}'.split('{0}').join(String(tot)) : '${T("Tout concorde")}') + '</p>'
      + '<p class="fb-sous">' + '${T("Relu : {0} commandes, {1} factures, {2} produits, {3} remboursements. Rien n’est corrigé automatiquement.")}'
          .split('{0}').join(String(lus.commandes || 0)).split('{1}').join(String(lus.factures || 0)).split('{2}').join(String(lus.produits || 0)).split('{3}').join(String(lus.remboursements || 0)) + '</p>'
      + '</div></div><div class="fc fb-tend"><h2>${T("Les 14 derniers contrôles")}</h2><div class="fb-barres">';
    var mx = 1; rs.forEach(function(x){ if (x.total > mx) mx = x.total; });
    rs.slice().reverse().forEach(function(x){
      h += '<i class="' + (x.total ? 'e' : '') + '" style="height:' + Math.max(8, Math.round((x.total / mx) * 100)) + '%" title="' + esc(quand(x.au) + ' — ' + x.total) + '"></i>';
    });
    h += '</div></div></div><div class="fc fb-z"><h2>${T("Écarts")}</h2><div class="fb-liste" data-pages="fiabilite">';
    var sans = [];
    Object.keys(r.controles || {}).forEach(function(k){
      var c = r.controles[k];
      if (!c || !c.nb) { sans.push(lib(k)[0]); return; }
      h += '<div class="fb-ctl"><div class="fb-ctl-t"><b>' + esc(lib(k)[0]) + '</b><span class="fb-nb">' + esc(c.nb) + '</span></div>'
        + '<p class="fb-ctl-d">' + esc(lib(k)[1]) + '</p>'
        + (c.exemples || []).map(function(e){ return ligneEx(k, e); }).join('')
        + (c.nb > (c.exemples || []).length ? '<p class="fb-ctl-d">' + '${T("… et {0} autre(s).")}'.split('{0}').join(String(c.nb - c.exemples.length)) + '</p>' : '')
        + '</div>';
    });
    if (!tot) h += '<p class="fb-sous">${T("Aucun écart : le stock, les ventes et les pièces comptables tiennent ensemble.")}</p>';
    h += '</div>' + (sans.length && tot ? '<p class="fb-ok"><b>${T("Sans écart :")}</b> ' + esc(sans.join(' · ')) + '</p>' : '') + '</div>';
    corps.innerHTML = h;
  }
  function charger(lancer){
    if (OCCUPE) return;
    OCCUPE = true;
    var b = document.getElementById('fb-lancer'); if (b) b.disabled = true;
    if (lancer) szDire('${T("Contrôle en cours… (quelques secondes)")}', 'att');
    appeler(lancer ? 'fiabilite:lancer' : 'fiabilite:rapport').then(function(r){
      OCCUPE = false; if (b) b.disabled = false;
      if (!r || !r.ok) { szDire(expliquer(r), 'err'); if (!D) corps.innerHTML = '<div class="fc"><p class="fb-sous">' + esc(expliquer(r)) + '</p></div>'; return; }
      D = r; dessiner();
      if (lancer) { var t = r.rapports && r.rapports[0] ? r.rapports[0].total : 0; szDire(t ? '${T("Contrôle terminé : {0} écart(s).")}'.split('{0}').join(String(t)) : '${T("Contrôle terminé : tout concorde.")}', t ? 'att' : 'bon'); }
    });
  }
  document.getElementById('fb-lancer').addEventListener('click', function(){ charger(true); });
  corps.addEventListener('click', function(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest('button') : null; if (!t) return;
    if (t.getAttribute('data-cmd')) appeler('commandes:ouvrirDetail', [t.getAttribute('data-cmd')]).then(function(r){ if (!r.ok) szDire(expliquer(r), 'err'); });
    if (t.getAttribute('data-prod')) appeler('produits:ouvrir', [t.getAttribute('data-prod')]).then(function(r){ if (!r.ok) szDire(expliquer(r), 'err'); });
  });
  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    if (document.querySelector('.szc-voile')) return;
    ev.preventDefault(); if (P && P.fermer) P.fermer();
  });
  function rechargerSiLibre(){ if (!OCCUPE) charger(false); }
  window.szActualiser = rechargerSiLibre;
  window.szRevenir = rechargerSiLibre;
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id = 'sz-detacher'; b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;flex:0 0 auto');
      t.appendChild(b); }
    if (actif) { b.textContent = '${T("⧉ Détacher")}'; b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}'; b.onclick = function(){ if (P && P.detacher) P.detacher(); }; }
    else { b.textContent = '${T("⚓ Ancrer")}'; b.title = '${T("Ramener cet écran dans la fenêtre principale")}'; b.onclick = function(){ if (P && P.ancrer) P.ancrer(); }; }
  };
  charger(false);
})();
</script></body></html>`;
}

module.exports = { pageFiabilite };
