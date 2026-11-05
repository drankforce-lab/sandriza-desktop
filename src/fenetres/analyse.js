'use strict';

/*
 * FENÊTRE « ANALYSE DES PRODUITS » — NATIVE (8.29.0, sa demande du 2026-11-05)
 * =============================================================================
 * Deux onglets, deux portes au menu (Catalogue) :
 *   · RÉAPPROVISIONNEMENT : d'après les ventes par taille et couleur, ce qu'il faut
 *     recommander, la plus urgente d'abord ; la quantité se corrige à la ligne, et
 *     « Créer les bons de commande » en fait un par fournisseur (bc:creerGroupes) ;
 *   · RENTABILITÉ : par produit, le revenu net, les remboursements, le coût d'achat
 *     et la MARGE réelle ; export CSV.
 *
 * ⚠ LA FENÊTRE NE CALCULE RIEN : le calcul vit dans le site
 *   (assets/js/analyseproduits.js, ops analyse:reappro et analyse:rentabilite).
 * ⚠ PAS DE CASES DE CHIFFRES (sa règle du 2026-10-16) : des lignes et des tableaux.
 * ⚠ LISTES EN PAGES MESURÉES (data-pages), jamais de glissière.
 * ⚠ AUCUN CARACTÈRE accent grave NI ANTISLASH dans la portion de script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('analyse');

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
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow:hidden;display:flex;flex-direction:column;gap:.6rem}
button,select,input{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px}
button{padding:.3rem .65rem;cursor:pointer}
select,input{padding:.25rem .45rem}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button:focus,select:focus,input:focus{outline:none;border-color:var(--or)}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
.onglets{flex:0 0 auto;display:flex;gap:.25rem;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--v08);padding:0 0 .5rem}
.onglets > button{background:transparent;border:1px solid transparent;color:var(--tx2);padding:.38rem .7rem;font-weight:600;font-size:.82rem}
.onglets > button:hover{background:var(--v05);color:var(--tx)}
.outils{flex:0 0 auto;display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;font-size:.8rem}
.outils label{display:flex;align-items:center;gap:.35rem;color:var(--tx2)}
.outils input[type=number]{width:4.4rem}
.outils .droite{margin-left:auto;display:flex;gap:.5rem}
.resume{flex:0 0 auto;font-size:.82rem;color:var(--tx2)}
.resume b{color:var(--tx)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;padding:.7rem .8rem;display:flex;flex-direction:column;gap:.4rem;min-height:0}
.carte.pleine{flex:1 1 0}
.duo{flex:1 1 0;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 19rem;gap:.9rem;grid-template-rows:minmax(0,1fr)}
.duo > div{display:flex;flex-direction:column;min-width:0;min-height:0;gap:.6rem}
.tab,.tab-t{display:grid;gap:.5rem;align-items:center;padding:.34rem .35rem;font-size:.79rem}
.tab-t{flex:0 0 auto;font-size:.66rem;font-weight:650;color:var(--tx2);text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}
.tab-t > span{overflow:hidden;text-overflow:ellipsis}
.tab{border-top:1px solid var(--v08)}
.tab .n,.tab-t .n{text-align:right;font-variant-numeric:tabular-nums}
.tab .d{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tab .d small{display:block;font-size:.7rem;color:var(--tx2);overflow:hidden;text-overflow:ellipsis}
.ra{grid-template-columns:minmax(0,2.3fr) minmax(0,1.1fr) 3.6rem 3.4rem 5.2rem 3.4rem 6.2rem 5.2rem}
.rt{grid-template-columns:minmax(0,2.4fr) 3.6rem 4.2rem 6.4rem 6.2rem 6.4rem 5.2rem}
.tab input.q{width:4.4rem;text-align:right;padding:.12rem .3rem}
.pill{display:inline-block;font-size:.66rem;font-weight:700;padding:.06rem .45rem;border-radius:99px;white-space:nowrap}
.pill.rupture{background:rgba(239,68,68,.16);color:var(--tx-err2)}
.pill.urgent{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.bientot{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
html.jour .pill.rupture{color:#7a2e2e}
.neg{color:var(--tx-err2)}
.lignes{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.2rem .9rem;font-size:.82rem}
.lignes .l{color:var(--tx2)}
.lignes .v{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
.lignes .sep{grid-column:1/-1;border-top:1px solid var(--v08);margin:.25rem 0}
.aide{font-size:.75rem;color:var(--tx2);line-height:1.45}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (max-width:1150px){.duo{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page de la fenêtre. `onglet` : 'reappro' (le défaut) ou 'rentabilite'. */
function pageAnalyse(onglet) {
  const o = String(onglet || '') === 'rentabilite' ? 'rentabilite' : 'reappro';
  return `${TETE()}
<title>${T("Analyse des produits — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.analytics}</span><h1>${T("Analyse des produits")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var ONGLET = '${o}';
  var RA = null, RT = null, OCCUPE = false;
  var OPT = { jours: 90, delai: 14, couverture: 30 };
  var JOURS_RT = 90;
  var QTE = {};   /* les quantités corrigées à la main, par variante */

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  var MOTIFS = {
    session:           '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:             '${T("Votre rôle ne permet pas de consulter cette analyse.")}',
    indisponible:      '${T("Le module d’analyse n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    delai:             '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue:'${T("Cette version de l’application ne connaît pas cette opération.")}',
    fournisseur_requis:'${T("Un fournisseur est requis pour créer un bon de commande.")}',
    echec:             '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  var URG = { rupture: '${T("Rupture")}', urgent: '${T("Urgent")}', bientot: '${T("Bientôt")}' };
  function periodes(choisi, avecTout){
    var l = [30, 60, 90, 180, 365];
    var h = l.map(function(j){ return '<option value="' + j + '"' + (j === choisi ? ' selected' : '') + '>' + '${T("{0} derniers jours")}'.replace('{0}', String(j)) + '</option>'; }).join('');
    if (avecTout) h += '<option value="0"' + (choisi === 0 ? ' selected' : '') + '>${T("Depuis toujours")}</option>';
    return h;
  }
  /* Un pourcentage dans la langue de la page (virgule en français) : toLocaleString pose le séparateur. */
  function pct(x){ return (x == null) ? '—' : Number(x).toLocaleString('${LIEU()}', { maximumFractionDigits: 1 }) + ' %'; }
  function qteDe(l){ var k = l.productId + '|' + l.cle; return QTE[k] != null ? QTE[k] : l.quantite; }

  function dessiner(){
    var h = '<div class="onglets">'
      + '<button type="button" data-onglet="reappro" class="' + (ONGLET === 'reappro' ? 'actif' : '') + '">${T("Réapprovisionnement")}</button>'
      + '<button type="button" data-onglet="rentabilite" class="' + (ONGLET === 'rentabilite' ? 'actif' : '') + '">${T("Rentabilité")}</button></div>';
    h += ONGLET === 'reappro' ? vueReappro() : vueRentabilite();
    corps.innerHTML = h;
  }

  function vueReappro(){
    var h = '<div class="outils">'
      + '<label>${T("Ventes des")} <select id="o-jours">' + periodes(OPT.jours, false) + '</select></label>'
      + '<label title="${T("Le temps que met le fournisseur à livrer.")}">${T("Délai du fournisseur (jours)")} <input type="number" id="o-delai" min="1" max="120" value="' + OPT.delai + '"></label>'
      + '<label title="${T("Combien de jours de ventes la commande doit couvrir après sa réception.")}">${T("Couverture voulue (jours)")} <input type="number" id="o-couv" min="7" max="180" value="' + OPT.couverture + '"></label>'
      + '<button type="button" data-a="recalculer">${T("Recalculer")}</button>'
      + '<span class="droite"><button type="button" class="prim" data-a="bons"' + ((RA && RA.lignes.length && RA.peutCommander) ? '' : ' disabled') + '>${T("Créer les bons de commande")}</button></span></div>';
    if (!RA) return h + '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>';
    var s = RA.resume || {};
    h += '<div class="resume">' + (s.variantes
      ? '${T("{0} variantes à commander, dont {1} en rupture — {2} unités, coût d’achat estimé {3}.")}'
          .replace('{0}', '<b>' + s.variantes + '</b>').replace('{1}', '<b>' + s.ruptures + '</b>').replace('{2}', '<b>' + s.unites + '</b>').replace('{3}', '<b>' + esc(szArgent(s.cout)) + '</b>')
      : '${T("Rien à recommander : le stock couvre les ventes prévues.")}') + '</div>';
    if (!RA.lignes.length) return h + '<div class="carte pleine"><div class="vide">${T("Aucune variante n’a besoin d’être recommandée pour ces réglages.")}</div></div>';
    h += '<div class="carte pleine"><div class="tab-t ra"><span>${T("Produit")}</span><span>${T("Fournisseur")}</span><span class="n">${T("Vendus")}</span>'
      + '<span class="n">${T("Stock")}</span><span class="n">${T("Commandé")}</span><span class="n">${T("Jours")}</span><span class="n">${T("À commander")}</span><span>${T("Urgence")}</span></div>'
      + '<div class="sz-pagee"><div class="pile" data-pages="reappro">' + RA.lignes.map(function(l){
        var f = '';
        (RA.groupes || []).forEach(function(g){ if (g.fournisseurId === l.fournisseurId) f = g.fournisseurNom; });
        return '<div class="tab ra"><span class="d">' + esc(l.nom) + '<small>' + esc([l.taille, l.couleur].filter(Boolean).join(' · ')) + (l.sku ? ' · ' + esc(l.sku) : '') + '</small></span>'
          + '<span class="d">' + (l.fournisseurId ? esc(f || '—') : '<span class="neg">${T("Aucun")}</span>') + '</span>'
          + '<span class="n">' + l.vendus + '</span>'
          + '<span class="n' + (l.stock < 0 ? ' neg' : '') + '" title="' + (l.stock < 0 ? '${T("Sous zéro : des pièces promises en précommande.")}' : '') + '">' + l.stock + '</span>'
          + '<span class="n">' + l.enCommande + '</span>'
          + '<span class="n">' + (l.joursRestants == null ? '—' : l.joursRestants) + '</span>'
          + '<span class="n"><input class="q" type="number" min="0" max="9999" data-k="' + esc(l.productId + '|' + l.cle) + '" value="' + qteDe(l) + '" aria-label="${T("Quantité à commander")}"></span>'
          + '<span><span class="pill ' + l.urgence + '">' + URG[l.urgence] + '</span></span></div>';
      }).join('') + '</div></div>'
      + '<div class="aide">${T("Les variantes sans fournisseur restent hors des bons : attribuez-leur un fournisseur dans la fiche du produit.")}</div></div>';
    return h;
  }

  function vueRentabilite(){
    var h = '<div class="outils"><label>${T("Ventes des")} <select id="t-jours">' + periodes(JOURS_RT, true) + '</select></label>'
      + '<span class="droite"><button type="button" data-a="csv"' + ((RT && RT.produits.length) ? '' : ' disabled') + '>${T("Exporter le CSV")}</button></span></div>';
    if (!RT) return h + '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>';
    var t = RT.total || {};
    h += '<div class="duo"><div><div class="carte pleine">';
    if (!RT.produits.length) h += '<div class="vide">${T("Aucune vente dans cette période.")}</div>';
    else {
      h += '<div class="tab-t rt"><span>${T("Produit")}</span><span class="n">${T("Unités")}</span><span class="n">${T("Retours")}</span>'
        + '<span class="n">${T("Revenu net")}</span><span class="n">${T("Coût")}</span><span class="n">${T("Marge")}</span><span class="n">${T("Marge %")}</span></div>'
        + '<div class="sz-pagee"><div class="pile" data-pages="rentabilite">' + RT.produits.map(function(p){
          return '<div class="tab rt"><span class="d">' + esc(p.nom) + '<small>' + esc(p.sku || '') + (p.actif ? '' : ' · ${T("retiré de la vente")}') + '</small></span>'
            + '<span class="n">' + p.unites + '</span>'
            + '<span class="n">' + (p.retours ? pct(p.tauxRetour) : '—') + '</span>'
            + '<span class="n">' + esc(szArgent(p.revenu)) + '</span>'
            + '<span class="n">' + (p.sansCout ? '—' : esc(szArgent(p.cout))) + '</span>'
            + '<span class="n' + (p.marge != null && p.marge < 0 ? ' neg' : '') + '">' + (p.marge == null ? '<span title="${T("Coût d’achat manquant dans la fiche")}">—</span>' : esc(szArgent(p.marge))) + '</span>'
            + '<span class="n">' + (p.margePct == null ? '—' : pct(p.margePct)) + '</span></div>';
        }).join('') + '</div></div>';
    }
    h += '</div></div><div><div class="carte"><div class="lignes">'
      + '<span class="l">${T("Ventes brutes")}</span><span class="v">' + esc(szArgent(t.brut)) + '</span>'
      + '<span class="l">${T("Rabais")}</span><span class="v">− ' + esc(szArgent(t.rabais)) + '</span>'
      + '<span class="l">${T("Remboursé")}</span><span class="v">− ' + esc(szArgent(t.rembourse)) + '</span>'
      + '<span class="sep"></span>'
      + '<span class="l">${T("Revenu net")}</span><span class="v">' + esc(szArgent(t.revenu)) + '</span>'
      + '<span class="l">${T("Coût d’achat des pièces gardées")}</span><span class="v">− ' + esc(szArgent(t.cout)) + '</span>'
      + '<span class="sep"></span>'
      + '<span class="l">${T("Marge")}</span><span class="v' + (t.marge < 0 ? ' neg' : '') + '">' + esc(szArgent(t.marge)) + (t.margePct != null ? ' (' + pct(t.margePct) + ')' : '') + '</span>'
      + '</div></div>'
      + '<div class="aide">${T("Hors taxes, livraison et frais de paiement : ce sont des coûts de la commande, pas du produit. Les rabais d’une commande sont répartis entre ses articles selon leur valeur.")}</div>'
      + (t.sansCout === 1 ? '<div class="aide">${T("Un produit n’a pas de coût d’achat : sa marge ne peut pas être calculée et n’entre pas dans le total.")}</div>'
        : t.sansCout > 1 ? '<div class="aide">' + '${T("{0} produits n’ont pas de coût d’achat : leur marge ne peut pas être calculée et n’entre pas dans le total.")}'.replace('{0}', String(t.sansCout)) + '</div>' : '')
      + '</div></div>';
    return h;
  }

  function chargerRA(){
    RA = null; dessiner();
    appeler('analyse:reappro', [OPT]).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; dire(expliquer(r), 'err'); return; }
      RA = r; if (ONGLET === 'reappro') dessiner();
    });
  }
  function chargerRT(){
    RT = null; dessiner();
    appeler('analyse:rentabilite', [{ jours: JOURS_RT }]).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; dire(expliquer(r), 'err'); return; }
      RT = r; if (ONGLET === 'rentabilite') dessiner();
    });
  }
  function charger(){ if (ONGLET === 'reappro') chargerRA(); else chargerRT(); }

  function creerBons(){
    if (!RA || OCCUPE) return;
    var groupes = [], nbL = 0, nbU = 0, total = 0;
    (RA.groupes || []).forEach(function(g){
      if (!g.fournisseurId) return;
      var lignes = g.lignes.map(function(l){ return { productId: l.productId, cle: l.cle, quantite: qteDe(l), cout: l.cout }; })
        .filter(function(l){ return l.quantite > 0; });
      if (!lignes.length) return;
      lignes.forEach(function(l){ nbL++; nbU += l.quantite; total += l.quantite * (l.cout || 0); });
      groupes.push({ fournisseurId: g.fournisseurId, lignes: lignes, note: '${T("Créé depuis la prévision de réapprovisionnement.")}' });
    });
    if (!groupes.length) { dire('${T("Aucune ligne à commander chez un fournisseur connu.")}', 'att'); return; }
    szConfirmer({ titre: '${T("Créer les bons de commande")}',
      texte: '${T("{0} bons de commande fournisseurs seront créés en brouillon : {1} lignes, {2} unités, {3} au coût d’achat. Rien n’est envoyé aux fournisseurs.")}'
        .replace('{0}', String(groupes.length)).replace('{1}', String(nbL)).replace('{2}', String(nbU)).replace('{3}', szArgent(Math.round(total * 100) / 100)),
      oui: '${T("Créer les bons de commande")}' }).then(function(ok){
      if (!ok) return;
      OCCUPE = true; dire('${T("Création des bons…")}', 'att');
      appeler('bc:creerGroupes', [groupes]).then(function(r){
        OCCUPE = false;
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        var n = (r.faits || []).map(function(f){ return f.numero; }).join(', ');
        dire('${T("Bons créés en brouillon : {0}. Ouvrez Bons de commande fournisseurs pour les vérifier et les envoyer.")}'.replace('{0}', n)
          + ((r.refus || []).length ? ' ${T("Refusés : {0}.")}'.replace('{0}', String(r.refus.length)) : ''), (r.refus || []).length ? 'att' : 'bon');
        QTE = {}; chargerRA();
      });
    });
  }
  function exporter(){
    if (!RT || !RT.csv) return;
    var t = new Date(), z = function(n){ return (n < 10 ? '0' : '') + n; };
    var nom = 'rentabilite-produits-' + t.getFullYear() + '-' + z(t.getMonth() + 1) + '-' + z(t.getDate()) + '.csv';
    Promise.resolve(P.enregistrerExport(nom, RT.csv)).then(function(w){
      if (w && w.ok === false) { dire(expliquer(w), 'err'); return; }
      dire('${T("CSV enregistré dans le dossier des exports :")} ' + nom, 'bon');
    });
  }

  corps.onclick = function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); if (ONGLET === 'reappro' ? !RA : !RT) charger(); else dessiner(); return; }
    var a = t.closest('[data-a]'); if (!a || a.disabled) return;
    var k = a.getAttribute('data-a');
    if (k === 'recalculer') {
      OPT.jours = parseInt((document.getElementById('o-jours') || {}).value, 10) || 90;
      OPT.delai = parseInt((document.getElementById('o-delai') || {}).value, 10) || 14;
      OPT.couverture = parseInt((document.getElementById('o-couv') || {}).value, 10) || 30;
      QTE = {}; chargerRA();
    } else if (k === 'bons') creerBons();
    else if (k === 'csv') exporter();
  };
  corps.addEventListener('change', function(ev){
    var t = ev.target; if (!t) return;
    if (t.id === 'o-jours') { OPT.jours = parseInt(t.value, 10) || 90; QTE = {}; chargerRA(); }
    if (t.id === 't-jours') { JOURS_RT = parseInt(t.value, 10); if (!(JOURS_RT >= 0)) JOURS_RT = 90; chargerRT(); }
  });
  corps.addEventListener('input', function(ev){
    var t = ev.target; if (!t || !t.classList || !t.classList.contains('q')) return;
    QTE[t.getAttribute('data-k')] = Math.max(0, parseInt(t.value, 10) || 0);
  });
  window.szRevenir = function(){ charger(); };
  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); } });
  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageAnalyse };
