'use strict';
/*
 * PRÉVISION DES VENTES DE LA SAISON — fenêtre native (2026-11-22)
 * =============================================================================
 * Module 5 choisi sur la page « Douze nouveaux modules ». Le moteur vit côté site
 * (assets/js/prevision.js) : rythme récent de chaque pièce × saison (l'an dernier),
 * rupture prévue, quantité à commander et date limite pour commander.
 * Cette fenêtre dessine la courbe de la boutique (16 semaines passées, l'horizon prévu
 * en pointillé avec sa marge) et la liste des pièces, la plus urgente d'abord.
 *
 *   prevision:donnees ({ semaines, delai }) → { passe, futur, lignes, resume, … }
 *
 * ⚠ AUCUNE GLISSIÈRE : la liste est paginée par le socle (data-pages).
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script (littéral de gabarit).
 */
const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('prevision');

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
.tete .pv-outils{margin-left:auto;display:flex;gap:.6rem;align-items:center}
.tete label{font-size:.76rem;color:var(--tx2);font-weight:600}
select,button{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.3rem .5rem;cursor:pointer}
select:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
#corps{flex:1 1 auto;min-height:0;overflow:hidden;padding:.8rem 1.1rem .7rem;display:flex;flex-direction:column;gap:.7rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)}
.resume{font-size:.9rem;color:var(--tx);margin:0}
.resume b{font-weight:800}
.resume .alerte{color:var(--tx-err2);font-weight:700}
html.jour .resume .alerte{color:#a3302b}
.avis{font-size:.8rem;color:var(--tx2);margin:0}
.deux{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr);gap:.9rem;flex:1 1 auto;min-height:0}
.fc{background:var(--f-carte);border:1px solid var(--v08);border-radius:14px;padding:.85rem 1rem;display:flex;flex-direction:column;gap:.5rem;min-width:0;min-height:0}
.fc h2{margin:0;font-size:.95rem}
.graph{flex:1 1 auto;min-height:0;position:relative}
.graph svg{position:absolute;inset:0;width:100%;height:100%}
.graph .axe{stroke:var(--v10);stroke-width:1}
.graph .lab{fill:var(--tx2);font-size:11px;font-family:system-ui}
.graph .survol{stroke:var(--tx2);stroke-width:1;stroke-dasharray:3 3}
.graph .survol-pt{fill:var(--f-carte);stroke:var(--sz-btn-prim,#8a5a2b);stroke-width:2}
.pv-bulle{position:absolute;z-index:3;pointer-events:none;display:flex;flex-direction:column;gap:2px;padding:.45rem .65rem;border-radius:10px;
  background:var(--f-carte);border:1px solid var(--v12);box-shadow:0 6px 18px rgba(0,0,0,.16);font-size:.76rem;white-space:nowrap}
.pv-bulle .ev{color:var(--tx2)}
.graph .passe{fill:none;stroke:var(--or);stroke-width:2.2;stroke-linejoin:round}
.graph .futur{fill:none;stroke:var(--or);stroke-width:2.2;stroke-dasharray:6 5;stroke-linejoin:round}
.graph .marge{fill:rgba(var(--or-rgb),.14)}
.graph .auj{stroke:var(--tx2);stroke-width:1;stroke-dasharray:2 3}
.leg{display:flex;gap:1rem;flex-wrap:wrap;font-size:.76rem;color:var(--tx2)}
.leg i{display:inline-block;width:16px;height:0;vertical-align:middle;margin-right:.35rem;border-top:2px solid var(--or)}
.leg i.p{border-top-style:dashed}
.leg i.m{height:8px;border:0;background:rgba(var(--or-rgb),.25);border-radius:2px}
.tab-z{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.tab-z table{flex:0 0 auto}
table{width:100%;border-collapse:collapse;font-size:.82rem;table-layout:fixed}
col.c-nom{width:auto} col.c-n{width:4.6rem} col.c-cmd{width:6.6rem} col.c-quand{width:12.5rem}
thead th{text-align:left;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);padding:.4rem .4rem;border-bottom:1px solid var(--v08);font-weight:700;white-space:nowrap}
thead th.n{text-align:right}
tbody td{padding:.42rem .4rem;border-bottom:1px solid var(--v05);vertical-align:middle}
td.n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
td.nom{overflow:hidden}
td.nom .pv-n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
td.nom .pv-s{font-size:.72rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pv-pill{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;vertical-align:middle;font-size:.72rem;font-weight:700;padding:.12rem .55rem;border-radius:99px;white-space:nowrap}
.pv-pill.maintenant{background:rgba(240,138,138,.16);color:var(--tx-err2)}
.pv-pill.bientot{background:rgba(242,194,107,.16);color:var(--tx-att)}
.pv-pill.plus-tard{background:var(--v06);color:var(--tx)}
.pv-pill.ok{background:rgba(95,212,164,.14);color:var(--tx-ok)}
html.jour .pv-pill.maintenant{color:#a3302b} html.jour .pv-pill.bientot{color:#8a5a00} html.jour .pv-pill.ok{color:#1d6a3b}
.pv-act{display:flex;gap:.5rem;justify-content:flex-end}
`;

function pagePrevision() {
  return `${TETE()}
<title>${T("Prévision des ventes — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.prevision}</span><h1>${T("Prévision des ventes de la saison")}</h1>
  <div class="pv-outils">
    <label for="pv-h">${T("Horizon")}</label><select id="pv-h"><option value="4">${T("4 semaines")}</option><option value="8">${T("8 semaines")}</option><option value="12" selected>${T("12 semaines")}</option><option value="26">${T("26 semaines")}</option></select>
    <label for="pv-d">${T("Délai du fournisseur")}</label><select id="pv-d"><option value="7">${T("7 jours")}</option><option value="14">${T("14 jours")}</option><option value="21" selected>${T("21 jours")}</option><option value="30">${T("30 jours")}</option><option value="45">${T("45 jours")}</option><option value="60">${T("60 jours")}</option></select>
  </div></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var LIEU = '${LIEU()}';
  var D = null, OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas de voir la prévision des ventes.")}',
    indisponible:       '${T("Le module de prévision n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').');
    if (r && r.detail && m === 'echec') t += ' (' + String(r.detail).slice(0, 150) + ')';
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function jour(s, an){
    var p = String(s || '').split('-'); if (p.length !== 3) return String(s || '');
    var o = { day: 'numeric', month: 'short' }; if (an) o.year = 'numeric';
    try { return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(LIEU, o); } catch (e) { return s; }
  }
  var URG = { maintenant: '${T("Commander maintenant")}', bientot: '${T("Commander bientôt")}', 'plus-tard': '${T("À prévoir")}', ok: '${T("Stock suffisant")}' };

  /* La courbe de la boutique : unités par semaine, 16 passées en trait plein, l'horizon en pointillé avec sa marge. */
  /* ⚠ DESSINÉ À LA TAILLE RÉELLE DE SA CASE (mesurée) : étiré par preserveAspectRatio, le texte des axes s écrasait. */
  function graphique(d, W, H){
    var A = d.passe || [], F = d.futur || []; if (!A.length && !F.length) return '';
    W = Math.max(200, Math.round(W || 600)); H = Math.max(120, Math.round(H || 260));
    var n = A.length + F.length, g = 40, dr = 10, h = 12, b = 22;
    var vals = A.map(function(x){ return x.unites; }).concat(F.map(function(x){ return x.haut; }), [0]);
    var mx = Math.max.apply(null, vals); if (mx < 1) mx = 1; mx *= 1.1;
    /* (2026-11-22, sa capture : l'axe disait « 2, 1, 1, 0 ») Des graduations ENTIÈRES et distinctes : le pas est arrondi
       vers le haut, et le haut de l'axe en découle. */
    var pas = Math.max(1, Math.ceil(mx / 3)); mx = pas * 3;
    PV = { A: A, F: F, X: X0, n: n };
    var X0 = function(i){ return g + i / Math.max(1, n - 1) * (W - g - dr); }, X = X0;
    var Y = function(v){ return h + (mx - v) / mx * (H - h - b); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="${T("Unités vendues par semaine, et la prévision")}">';
    PV.Y = Y; PV.g = g; PV.W = W; PV.dr = dr; PV.H = H; PV.h = h; PV.b = b;
    for (var k = 0; k <= 3; k++) { var v = pas * k, y = Y(v).toFixed(1);
      s += '<line class="axe" x1="' + g + '" x2="' + (W - dr) + '" y1="' + y + '" y2="' + y + '"></line><text class="lab" x="' + (g - 6) + '" y="' + (Number(y) + 4) + '" text-anchor="end">' + Math.round(v) + '</text>'; }
    var pA = A.map(function(x, i){ return X(i).toFixed(1) + ',' + Y(x.unites).toFixed(1); });
    var i0 = A.length - 1;
    var pF = [X(i0).toFixed(1) + ',' + Y(A.length ? A[i0].unites : 0).toFixed(1)].concat(F.map(function(x, j){ return X(A.length + j).toFixed(1) + ',' + Y(x.unites).toFixed(1); }));
    var haut = F.map(function(x, j){ return X(A.length + j).toFixed(1) + ',' + Y(x.haut).toFixed(1); });
    var bas = F.map(function(x, j){ return X(A.length + j).toFixed(1) + ',' + Y(x.bas).toFixed(1); }).reverse();
    if (F.length) s += '<path class="marge" d="M' + haut.concat(bas).join(' L') + 'Z"></path>';
    var xa = X(i0 + 0.5).toFixed(1);
    s += '<line class="auj" x1="' + xa + '" x2="' + xa + '" y1="' + h + '" y2="' + (H - b) + '"></line>';
    if (pA.length) s += '<polyline class="passe" vector-effect="non-scaling-stroke" points="' + pA.join(' ') + '"></polyline>';
    if (F.length) s += '<polyline class="futur" vector-effect="non-scaling-stroke" points="' + pF.join(' ') + '"></polyline>';
    var ex = [[0, A[0]], [i0, A[i0]], [n - 1, F[F.length - 1]]];
    ex.forEach(function(e, j){ if (e[1]) s += '<text class="lab" x="' + X(e[0]).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="' + (j === 0 ? 'start' : (j === 2 ? 'end' : 'middle')) + '">' + esc(jour(e[1].debut)) + '</text>'; });
    s += '<line class="survol" id="pv-ligne" x1="0" x2="0" y1="' + h + '" y2="' + (H - b) + '" style="display:none"></line><circle class="survol-pt" id="pv-pt" r="4.5" style="display:none"></circle>';
    return s + '</svg><div class="pv-bulle" id="pv-bulle" hidden></div>';
  }
  /* (2026-11-22, sa demande : « des données au survol de la souris ») La semaine sous la souris : vendu, ou prévu et sa marge. */
  var PV = null;
  function survol(){
    var z = document.getElementById('pv-graph'); if (!z || !PV) return;
    var svg = z.querySelector('svg'), bulle = document.getElementById('pv-bulle'), ln = document.getElementById('pv-ligne'), pt = document.getElementById('pv-pt');
    if (!svg || !bulle) return;
    svg.onmousemove = function(ev){
      var r = svg.getBoundingClientRect(), x = ev.clientX - r.left;
      var i = Math.round((x - PV.g) / (PV.W - PV.g - PV.dr) * Math.max(1, PV.n - 1)); i = Math.max(0, Math.min(PV.n - 1, i));
      var passe = i < PV.A.length, e = passe ? PV.A[i] : PV.F[i - PV.A.length]; if (!e) return;
      var cx = PV.X(i), cy = PV.Y(e.unites);
      ln.setAttribute('x1', cx); ln.setAttribute('x2', cx); ln.style.display = ''; pt.setAttribute('cx', cx); pt.setAttribute('cy', cy); pt.style.display = '';
      bulle.innerHTML = '<b>' + '${T("Semaine du {0}")}'.split('{0}').join(esc(jour(e.debut))) + '</b>'
        + (passe ? '<span>${T("Vendu")} : <strong>' + e.unites + '</strong></span>'
                 : '<span>${T("Prévu")} : <strong>' + e.unites + '</strong></span><span class="ev">${T("Marge probable")} : ' + e.bas + ' – ' + e.haut + '</span>');
      bulle.hidden = false;
      var bx = cx + 12; if (bx + bulle.offsetWidth > PV.W) bx = cx - bulle.offsetWidth - 12;
      bulle.style.left = Math.max(0, bx) + 'px'; bulle.style.top = Math.max(0, Math.min(cy - 20, PV.H - bulle.offsetHeight - 4)) + 'px';
    };
    svg.onmouseleave = function(){ bulle.hidden = true; ln.style.display = 'none'; pt.style.display = 'none'; };
  }
  function resume(d){
    var r = d.resume;
    var t = '${T("D’ici {0} semaines : environ {1} pièces vendues.")}'.split('{0}').join(String(d.semaines)).split('{1}').join('<b>' + r.unitesPrevues + '</b>');
    if (r.aCommander) t += ' ' + '${T("{0} pièces à recommander ({1} unités")}'.split('{0}').join('<b>' + r.aCommander + '</b>').split('{1}').join(String(r.unitesACommander))
      + (d.peutVoirCout && r.coutACommander ? ', ' + esc(szArgent(r.coutACommander)) : '') + ').';
    if (r.maintenant) t += ' <span class="alerte">' + '${T("{0} à commander dès maintenant.")}'.split('{0}').join(String(r.maintenant)) + '</span>';
    return '<p class="resume">' + t + '</p>';
  }
  function saisonAvis(d){
    if (!d.avecSaison) return '<p class="avis">' + '${T("Moins de 64 semaines de ventes : la saison n’est pas encore comptée, la prévision suit le rythme des dernières semaines.")}' + '</p>';
    var pct = Math.round((d.saison - 1) * 100);
    return '<p class="avis">' + (pct === 0 ? '${T("D’après l’an dernier, les semaines à venir se vendent au même rythme que les dernières.")}'
      : (pct > 0 ? '${T("D’après l’an dernier, les semaines à venir se vendent {0} % de plus que les dernières.")}' : '${T("D’après l’an dernier, les semaines à venir se vendent {0} % de moins que les dernières.")}').split('{0}').join(String(Math.abs(pct)))) + '</p>';
  }
  function liste(d){
    var L = d.lignes || [];
    var h = '<section class="fc"><h2>${T("Les pièces, la plus urgente d’abord")}</h2>';
    if (!L.length) return h + '<p class="avis">${T("Aucune vente ni aucun stock à prévoir pour le moment.")}</p></section>';
    return h + '<div class="tab-z"><table><colgroup><col class="c-nom"><col class="c-n"><col class="c-n"><col class="c-cmd"><col class="c-quand"></colgroup><thead><tr><th>${T("Pièce")}</th><th class="n">${T("Prévu")}</th><th class="n">${T("Stock")}</th><th class="n">${T("À commander")}</th><th>${T("Quand")}</th></tr></thead><tbody data-pages="prevision">'
      + L.map(function(l){
        var sous = '${T("{0} par semaine · rupture {1}")}'.split('{0}').join(String(l.rythme)).split('{1}').join(l.rupture ? jour(l.rupture) : '—');
        if (l.enCommande) sous += ' · ' + '${T("{0} déjà en commande")}'.split('{0}').join(String(l.enCommande));
        var quand = l.aCommander > 0 && l.commanderAvant ? '<span class="pv-pill ' + l.urgence + '">' + esc(l.urgence === 'maintenant' ? URG.maintenant : '${T("Avant le {0}")}'.split('{0}').join(jour(l.commanderAvant))) + '</span>'
          : '<span class="pv-pill ' + l.urgence + '">' + esc(URG[l.urgence] || '') + '</span>';
        return '<tr><td class="nom"><div class="pv-n" title="' + esc(l.nom) + '">' + esc(l.nom) + '</div><div class="pv-s">' + esc(sous) + '</div></td>'
          + '<td class="n" title="' + esc('${T("Entre {0} et {1}")}'.split('{0}').join(l.bas).split('{1}').join(l.haut)) + '">' + l.prevu + '</td>'
          + '<td class="n">' + l.stock + '</td><td class="n"><b>' + (l.aCommander || '—') + '</b></td><td>' + quand + '</td></tr>';
      }).join('') + '</tbody></table></div>'
      + (d.resume.aCommander ? '<div class="pv-act"><button type="button" id="pv-reappro">${T("Passer la commande par variante →")}</button></div>' : '')
      + '</section>';
  }
  function dessiner(){
    if (!D) return;
    corps.innerHTML = resume(D) + saisonAvis(D)
      + '<div class="deux"><section class="fc"><h2>${T("La boutique, semaine par semaine")}</h2><div class="leg"><span><i></i>${T("Vendu")}</span><span><i class="p"></i>${T("Prévu")}</span><span><i class="m"></i>${T("Marge probable")}</span></div><div class="graph" id="pv-graph"></div></section>'
      + liste(D) + '</div>';
    tracer();
  }
  function tracer(){
    var z = document.getElementById('pv-graph'); if (!z || !D) return;
    z.innerHTML = graphique(D, z.clientWidth, z.clientHeight);
    survol();
  }
  try { if (window.ResizeObserver) new ResizeObserver(function(){ tracer(); }).observe(corps); } catch (e) {}
  function charger(){
    var h = document.getElementById('pv-h').value, d = document.getElementById('pv-d').value;
    appeler('prevision:donnees', [{ semaines: Number(h), delai: Number(d) }]).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; return; }
      D = r; dessiner();
    });
  }
  document.addEventListener('change', function(ev){ var t = ev.target; if (t && (t.id === 'pv-h' || t.id === 'pv-d')) charger(); });
  document.addEventListener('click', function(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if (!t) return;
    if (t.id === 'pv-reappro') {
      // La commande se passe par variante (taille, couleur) dans l Analyse des produits, qui crée les bons fournisseurs.
      appeler('prevision:reappro').then(function(r){ if (!r || !r.ok) szDire('${T("Ouvrez Catalogue › Prévision de réapprovisionnement pour créer les bons de commande.")}', ''); });
    }
  });
  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    if (document.querySelector('.szc-voile')) return;
    ev.preventDefault(); if (P && P.fermer) P.fermer();
  });
  function rechargerSiLibre(){ if (!OCCUPE) charger(); }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) rechargerSiLibre(); });
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
  charger();
})();
</script></body></html>`;
}

module.exports = { pagePrevision };
