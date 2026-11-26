'use strict';
/*
 * TRÉSORERIE DES 90 PROCHAINS JOURS — fenêtre native (2026-11-21)
 * =============================================================================
 * Module choisi sur la page « Douze nouveaux modules ». Le moteur vit côté site
 * (assets/js/tresorerie.js) : il part du solde saisi et projette, jour par jour,
 * les ventes prévues (moyenne par jour de la semaine), les dépenses courantes,
 * les charges fixes, les bons de commande à payer et la remise TPS/TVQ.
 * Cette fenêtre dessine la courbe du solde, marque le CREUX et le seuil d'alerte,
 * et liste les échéances.
 *
 *   tresorerie:donnees  → { projection, peutModifier }
 *   tresorerie:reglages (reglages) → { ok }
 *
 * ⚠ AUCUNE GLISSIÈRE : les échéances sont paginées par le socle (data-pages).
 * États d'ouverture (bancs de rendu) : 'reglages'.
 */
const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('tresorerie');

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
.tete .cx-resume{color:var(--tx2);font-size:.8rem}
.tete .cx-actions{margin-left:auto;display:flex;gap:.5rem}
select,input,button{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.3rem .5rem;cursor:pointer}
input{cursor:text}
select:focus,input:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.45;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
#corps{flex:1 1 auto;min-height:0;overflow:hidden;padding:.8rem 1.1rem .7rem;display:flex;flex-direction:column;gap:.7rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)}
.resume{font-size:.9rem;color:var(--tx);margin:0}
.resume b{color:var(--tx)}
.resume .alerte{color:var(--tx-err2);font-weight:700}
html.jour .resume .alerte{color:#a3302b}
.avis{font-size:.82rem;color:var(--tx-att);margin:0}
html.jour .avis{color:#8a5a00}
.deux{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:.9rem;flex:1 1 auto;min-height:0}
.fc{background:var(--f-carte);border:1px solid var(--v08);border-radius:14px;padding:.85rem 1rem;display:flex;flex-direction:column;gap:.5rem;min-width:0;min-height:0}
.fc h2{margin:0;font-size:.95rem}
.graph{flex:1 1 auto;min-height:0;position:relative}
.graph svg{position:absolute;inset:0;width:100%;height:100%}
.graph .axe{stroke:var(--v10);stroke-width:1}
.graph .lab{fill:var(--tx2);font-size:11px;font-family:system-ui}
.graph .plancher{stroke:#f08a8a;stroke-dasharray:4 4;stroke-width:1.2}
.graph .survol{stroke:var(--tx2);stroke-width:1;stroke-dasharray:3 3}
.graph .survol-pt{fill:var(--f-carte);stroke:var(--sz-btn-prim,#8a5a2b);stroke-width:2}
.tr-bulle{position:absolute;z-index:3;pointer-events:none;display:flex;flex-direction:column;gap:2px;padding:.45rem .65rem;border-radius:10px;
  background:var(--f-carte);border:1px solid var(--v12);box-shadow:0 6px 18px rgba(0,0,0,.16);font-size:.76rem;white-space:nowrap}
.tr-bulle .ev{color:var(--tx2)}
.graph .solde{fill:none;stroke:var(--or);stroke-width:2.2;stroke-linejoin:round}
.graph .aire{fill:rgba(var(--or-rgb),.12)}
.graph .creux{fill:#f08a8a}
.graph .evt{fill:var(--tx2)}
.leg{display:flex;gap:1rem;flex-wrap:wrap;font-size:.76rem;color:var(--tx2)}
.leg i{display:inline-block;width:14px;height:2px;vertical-align:middle;margin-right:.35rem;background:var(--or)}
.leg i.p{background:none;border-top:2px dashed #f08a8a;height:0}
.tab-z{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
/* ⚠ La table ne se tasse pas : tassée, l'en-tête passait sur le trait du thème (Carbone, Lin) et « Date » devenait illisible. */
.tab-z table{flex:0 0 auto}
table{width:100%;border-collapse:collapse;font-size:.82rem}
thead th{text-align:left;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);padding:.4rem .4rem;border-bottom:1px solid var(--v08);font-weight:700}
tbody td{padding:.4rem .4rem;border-bottom:1px solid var(--v05);vertical-align:top}
td.num{font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}
td.num.e{color:var(--tx-ok)}
html.jour td.num.e{color:#1d6a3b}
.src{display:block;font-size:.7rem;color:var(--tx2)}
.reg{background:var(--f-carte);border:1px solid rgba(var(--or-rgb),.35);border-radius:14px;padding:.85rem 1rem;flex:0 0 auto;display:flex;flex-direction:column;gap:.6rem}
.reg h2{margin:0;font-size:.95rem}
.ligne{display:flex;gap:.6rem;flex-wrap:wrap;align-items:flex-end}
.ch{display:flex;flex-direction:column;gap:.2rem;min-width:0}
.ch label{font-size:.74rem;color:var(--tx2);font-weight:600}
.ch input{width:9rem}
.listes{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.9rem}
.liste h3{margin:0 0 .3rem;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--tx2)}
.rang{display:flex;gap:.35rem;margin-bottom:.3rem}
.rang input{min-width:0}
.rang input.n{flex:1}
.rang input.m{width:6.5rem;text-align:right}
.rang input.j{width:3.6rem;text-align:right}
.rang input.d{width:9rem}
.rang select{width:6.5rem}
.f-act{display:flex;gap:.5rem;justify-content:flex-end}
`;

/* ⚠ (2026-11-22, sa décision : « déplacer vraiment ») Solde, seuil, charges fixes et échéances ponctuelles se règlent dans
   Configuration › Modules › Trésorerie, qui ouvre CETTE page en mode 'config-seul'. Le module n a plus de bouton Réglages. */
function pageTresorerie(ouverture) {
  const o = String(ouverture || '');
  const etat = o === 'config-seul' ? 'config-seul' : '';
  const seul = (etat === 'config-seul');
  return `${TETE()}
<title>${seul ? T("Réglages de la trésorerie — Administration Sandriza") : T("Trésorerie — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.tresorerie}</span><h1>${seul ? T("Réglages de la trésorerie") : T("Trésorerie des 90 prochains jours")}</h1>
  <span class="cx-resume" id="sous"></span><div class="cx-actions" id="outils"></div></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var elOutils = document.getElementById('outils');
  var elSous = document.getElementById('sous');
  var LIEU = '${LIEU()}';
  var D = null;
  var ETAT = '${etat}';
  var SEUL = ${seul ? 'true' : 'false'};
  var REG = null;
  var OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var MOTIFS = {
    maj_en_cours:       '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas de modifier la trésorerie.")}',
    indisponible:       '${T("Le module de trésorerie n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    nuage:              '${T("Le nuage a refusé l’écriture : elle n’existe que sur ce poste. Vérifiez la connexion, puis refaites le geste.")}',
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
  var SOURCES = {
    fixe: '${T("Charge fixe")}', ponctuel: '${T("Échéance saisie")}', taxes: '${T("Taxes")}', bon: '${T("Bon de commande")}'
  };

  /* La courbe du solde : 90 points, la ligne du seuil, le creux, les échéances en tirets. */
  /* (2026-11-22, sa capture : « les chiffres sont tout étirés, et je veux des données au survol ») Le dessin se fait à la
     taille RÉELLE de sa carte (plus d'étirement : preserveAspectRatio par défaut), et une bulle suit la souris. */
  var GR = null;
  function graphique(p, W0, H0){
    var J = p.jours || []; if (!J.length) return '';
    var W = Math.max(320, Math.round(W0 || 1000)), H = Math.max(160, Math.round(H0 || 300)), g = 64, d = 10, h = 14, b = 26;
    var vals = J.map(function(j){ return j.solde; }).concat([Number(p.reglages.plancher) || 0, 0]);
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    if (mx - mn < 1) mx = mn + 1;
    var marge = (mx - mn) * 0.08; mn -= marge; mx += marge;
    var X = function(i){ return g + i / (J.length - 1) * (W - g - d); };
    var Y = function(v){ return h + (mx - v) / (mx - mn) * (H - h - b); };
    var pts = J.map(function(j, i){ return X(i).toFixed(1) + ',' + Y(j.solde).toFixed(1); });
    GR = { p: p, J: J, X: X, Y: Y, W: W, H: H, g: g, d: d };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="${T("Solde prévu sur 90 jours")}">';
    for (var k = 0; k <= 4; k++) {
      var v = mn + (mx - mn) * k / 4, y = Y(v).toFixed(1);
      s += '<line class="axe" x1="' + g + '" x2="' + (W - d) + '" y1="' + y + '" y2="' + y + '"></line>'
        + '<text class="lab" x="' + (g - 6) + '" y="' + (Number(y) + 4) + '" text-anchor="end">' + esc(szArgent(Math.round(v / 100) * 100).replace(/[,.]00(?=\\s|$)/, '')) + '</text>';
    }
    [0, 30, 60, 89].forEach(function(i){ if (J[i]) s += '<text class="lab" x="' + X(i).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="' + (i === 0 ? 'start' : (i === 89 ? 'end' : 'middle')) + '">' + esc(jour(J[i].date)) + '</text>'; });
    var yp = Y(Number(p.reglages.plancher) || 0).toFixed(1);
    s += '<line class="plancher" x1="' + g + '" x2="' + (W - d) + '" y1="' + yp + '" y2="' + yp + '"></line>';
    s += '<path class="aire" d="M' + pts.join(' L') + ' L' + X(J.length - 1).toFixed(1) + ',' + (H - b) + ' L' + g + ',' + (H - b) + 'Z"></path>';
    s += '<polyline class="solde" vector-effect="non-scaling-stroke" points="' + pts.join(' ') + '"></polyline>';
    if (p.creux) { var ic = 0; J.forEach(function(j, i){ if (j.date === p.creux.date) ic = i; }); s += '<circle class="creux" cx="' + X(ic).toFixed(1) + '" cy="' + Y(p.creux.solde).toFixed(1) + '" r="5"></circle>'; }
    s += '<line class="survol" id="tr-ligne" x1="0" x2="0" y1="' + h + '" y2="' + (H - b) + '" style="display:none"></line>'
      + '<circle class="survol-pt" id="tr-pt" r="4.5" style="display:none"></circle>';
    return s + '</svg><div class="tr-bulle" id="tr-bulle" hidden></div>';
  }
  /* Redessine à la taille réelle de la carte, puis branche le survol. */
  function ajusterGraphique(){
    var z = corps.querySelector('.graph'); if (!z || !GR) return;
    var w = z.clientWidth, hh = z.clientHeight; if (!(w > 50 && hh > 50)) return;
    if (Math.abs(w - GR.W) > 2 || Math.abs(hh - GR.H) > 2) z.innerHTML = graphique(GR.p, w, hh);
    var svg = z.querySelector('svg'), bulle = document.getElementById('tr-bulle'), ln = document.getElementById('tr-ligne'), pt = document.getElementById('tr-pt');
    if (!svg || !bulle) return;
    svg.onmousemove = function(ev){
      var r = svg.getBoundingClientRect(), x = ev.clientX - r.left;
      var n = GR.J.length, i = Math.round((x - GR.g) / (GR.W - GR.g - GR.d) * (n - 1)); i = Math.max(0, Math.min(n - 1, i));
      var j = GR.J[i], cx = GR.X(i), cy = GR.Y(j.solde);
      ln.setAttribute('x1', cx); ln.setAttribute('x2', cx); ln.style.display = '';
      pt.setAttribute('cx', cx); pt.setAttribute('cy', cy); pt.style.display = '';
      var evs = (GR.p.evenements || []).filter(function(e){ return e.date === j.date; });
      bulle.innerHTML = '<b>' + esc(jour(j.date, true)) + '</b><span>${T("Solde prévu")} : <strong>' + esc(szArgent(j.solde)) + '</strong></span>'
        + evs.map(function(e){ return '<span class="ev">' + esc(szTd(e.libelle)) + ' · ' + (e.entree ? '+' : '−') + esc(szArgent(e.montant)) + '</span>'; }).join('');
      bulle.hidden = false;
      var bx = Math.min(Math.max(cx + 12, 0), GR.W - bulle.offsetWidth - 4); if (cx + 12 + bulle.offsetWidth > GR.W) bx = cx - bulle.offsetWidth - 12;
      bulle.style.left = Math.max(0, bx) + 'px'; bulle.style.top = Math.max(0, Math.min(cy - 20, GR.H - bulle.offsetHeight - 4)) + 'px';
    };
    svg.onmouseleave = function(){ bulle.hidden = true; ln.style.display = 'none'; pt.style.display = 'none'; };
  }
  window.addEventListener('resize', function(){ clearTimeout(window.__trR); window.__trR = setTimeout(ajusterGraphique, 80); });
  function resume(p){
    var t = '${T("Solde de départ {0}. Dans 90 jours : {1}. Point le plus bas : {2} le {3}.")}'
      .split('{0}').join('<b>' + esc(szArgent(p.reglages.solde)) + '</b>').split('{1}').join('<b>' + esc(szArgent(p.soldeFinal)) + '</b>')
      .split('{2}').join('<b>' + esc(szArgent(p.creux ? p.creux.solde : 0)) + '</b>').split('{3}').join(esc(p.creux ? jour(p.creux.date, true) : ''));
    if (p.premierSous) t += ' <span class="alerte">' + '${T("Sous le seuil d’alerte dès le {0} ({1} jours).")}'.split('{0}').join(esc(jour(p.premierSous, true))).split('{1}').join(String(p.sousPlancher)) + '</span>';
    return '<p class="resume">' + t + '</p>';
  }
  function echeances(p){
    var L = p.evenements || [];
    var h = '<section class="fc"><h2>${T("Les échéances prévues")}</h2>';
    if (!L.length) return h + '<p class="resume">${T("Aucune échéance dans les 90 prochains jours. Ajoutez vos charges fixes dans Configuration › Modules › Trésorerie.")}</p></section>';
    return h + '<div class="tab-z"><table><thead><tr><th>${T("Date")}</th><th>${T("Quoi")}</th><th style="text-align:right">${T("Montant")}</th></tr></thead><tbody data-pages="tresorerie">'
      + L.map(function(e){
        return '<tr><td>' + esc(jour(e.date)) + '</td><td>' + esc(szTd(e.libelle)) + '<span class="src">' + esc(SOURCES[e.source] || '') + '</span></td>'
          + '<td class="num' + (e.entree ? ' e' : '') + '">' + (e.entree ? '+' : '−') + esc(szArgent(e.montant)) + '</td></tr>';
      }).join('') + '</tbody></table></div></section>';
  }
  function reglages(){
    var r = REG;
    var fixes = r.fixes.map(function(f, i){
      return '<div class="rang"><input class="n" data-fn="' + i + '" maxlength="60" value="' + esc(f.nom) + '" placeholder="${T("Loyer, assurance…")}" aria-label="${T("Nom de la charge")}">'
        + '<input class="m" data-fm="' + i + '" inputmode="decimal" value="' + esc(f.montant) + '" placeholder="0,00" aria-label="${T("Montant par mois")}">'
        + '<input class="j" data-fj="' + i + '" inputmode="numeric" value="' + esc(f.jour) + '" placeholder="1" aria-label="${T("Jour du mois")}"></div>';
    }).join('');
    var ponc = r.ponctuels.map(function(x, i){
      return '<div class="rang"><input class="n" data-pn="' + i + '" maxlength="60" value="' + esc(x.nom) + '" placeholder="${T("Salon, achat de présentoirs…")}" aria-label="${T("Nom de l’échéance")}">'
        + '<input class="d" type="date" data-pd="' + i + '" value="' + esc(x.date) + '" aria-label="${T("Date")}">'
        + '<select data-ps="' + i + '" aria-label="${T("Sens")}"><option value="sortie"' + (x.sens !== 'entree' ? ' selected' : '') + '>${T("Sortie")}</option><option value="entree"' + (x.sens === 'entree' ? ' selected' : '') + '>${T("Entrée")}</option></select>'
        + '<input class="m" data-pm="' + i + '" inputmode="decimal" value="' + esc(x.montant) + '" placeholder="0,00" aria-label="${T("Montant")}"></div>';
    }).join('');
    return '<form class="reg" onsubmit="return false"><h2>${T("Réglages de la trésorerie")}</h2>'
      + '<div class="ligne"><div class="ch"><label for="g-solde">${T("Solde du compte")}</label><input id="g-solde" inputmode="decimal" data-negatif value="' + esc(r.solde) + '"></div>'
      + '<div class="ch"><label for="g-le">${T("Au")}</label><input id="g-le" type="date" value="' + esc(r.soldeLe) + '"></div>'
      + '<div class="ch"><label for="g-plancher">${T("Seuil d’alerte")}</label><input id="g-plancher" inputmode="decimal" value="' + esc(r.plancher) + '"></div></div>'
      + '<div class="listes"><div class="liste"><h3>${T("Charges fixes (chaque mois)")}</h3>' + fixes + '</div>'
      + '<div class="liste"><h3>${T("Échéances ponctuelles")}</h3>' + ponc + '</div></div>'
      + '<div class="f-act"><button type="button" id="g-annuler">${T("Annuler")}</button><button type="button" class="prim" id="g-ok">${T("Enregistrer")}</button></div></form>';
  }
  function avecLigneVide(r){
    var vide = function(L, k){ return !L.length || (L[L.length - 1][k] !== '' && L[L.length - 1][k] != null); };
    if (vide(r.fixes, 'nom')) r.fixes.push({ nom: '', montant: '', jour: '' });
    if (vide(r.ponctuels, 'nom')) r.ponctuels.push({ nom: '', montant: '', date: '', sens: 'sortie' });
  }
  function outils(){ elOutils.innerHTML = ''; }
  function dessiner(){
    outils();
    if (!D) return;
    var p = D.projection;
    if (SEUL) {
      elSous.textContent = '';
      if (!D.peutModifier) { corps.innerHTML = '<p class="avis">${T("Votre rôle ne permet pas de modifier la trésorerie.")}</p>'; return; }
      if (!REG) ouvrirReglages();
      corps.innerHTML = reglages(); return;
    }
    elSous.textContent = '${T("au {0}")}'.split('{0}').join(jour(p.aujourdhui, true));
    var h = '';
    if (REG) h += reglages();
    if (!p.reglages.soldeLe) h += '<p class="avis">${T("Saisissez le solde actuel de votre compte dans Configuration › Modules › Trésorerie : la courbe part de là.")}</p>';
    else if (p.reglages.soldeLe < p.aujourdhui) h += '<p class="avis">' + '${T("Le solde de départ date du {0} : mettez-le à jour dans Configuration › Modules › Trésorerie.")}'.split('{0}').join(esc(jour(p.reglages.soldeLe, true))) + '</p>';
    h += resume(p);
    if (!REG) h += '<div class="deux"><section class="fc"><h2>${T("Le solde, jour par jour")}</h2><div class="leg"><span><i></i>${T("Solde prévu")}</span><span><i class="p"></i>${T("Seuil d’alerte")}</span></div><div class="graph">' + graphique(p) + '</div>'
      + '<p class="resume" style="font-size:.78rem">' + '${T("Ventes prévues : {0} par jour en moyenne. Dépenses courantes : {1} par jour.")}'
        .split('{0}').join(esc(szArgent(p.ventesParJour.reduce(function(a, b){ return a + b; }, 0) / 7))).split('{1}').join(esc(szArgent(p.depensesParJour))) + '</p></section>'
      + echeances(p) + '</div>';
    corps.innerHTML = h;
    requestAnimationFrame(ajusterGraphique);
  }
  function charger(){
    appeler('tresorerie:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; elOutils.innerHTML = ''; return; }
      D = r;
      if (SEUL && D.peutModifier) ouvrirReglages();
      ETAT = '';
      dessiner();
    });
  }
  function ouvrirReglages(){
    var R = D.projection.reglages;
    REG = { solde: String(R.solde), soldeLe: R.soldeLe || D.projection.aujourdhui, plancher: String(R.plancher),
      fixes: (R.fixes || []).map(function(f){ return { nom: f.nom, montant: String(f.montant), jour: String(f.jour) }; }),
      ponctuels: (R.ponctuels || []).map(function(x){ return { nom: x.nom, montant: String(x.montant), date: x.date, sens: x.sens }; }) };
    avecLigneVide(REG);
  }

  document.addEventListener('click', function(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if (!t) return;
    if (t.id === 'r-reglages') { if (REG) REG = null; else ouvrirReglages(); dessiner(); return; }
    if (t.id === 'g-annuler') { REG = null; dessiner(); if (SEUL && P && P.fermer) P.fermer(); return; }
    if (t.id === 'g-ok' && !OCCUPE) {
      OCCUPE = true; t.disabled = true;
      appeler('tresorerie:reglages', [REG]).then(function(r){
        OCCUPE = false; t.disabled = false;
        if (!r.ok) { szDire(expliquer(r), 'err'); return; }
        szDire('${T("Réglages enregistrés. La prévision est recalculée.")}', 'bon'); REG = null; charger();
      });
    }
  });
  document.addEventListener('input', function(ev){
    var t = ev.target; if (!t || !REG) return;
    var k, avant = REG.fixes.length + REG.ponctuels.length;
    if (t.id === 'g-solde') REG.solde = t.value;
    else if (t.id === 'g-le') REG.soldeLe = t.value;
    else if (t.id === 'g-plancher') REG.plancher = t.value;
    else if ((k = t.getAttribute('data-fn')) != null) REG.fixes[+k].nom = t.value;
    else if ((k = t.getAttribute('data-fm')) != null) REG.fixes[+k].montant = t.value;
    else if ((k = t.getAttribute('data-fj')) != null) REG.fixes[+k].jour = t.value;
    else if ((k = t.getAttribute('data-pn')) != null) REG.ponctuels[+k].nom = t.value;
    else if ((k = t.getAttribute('data-pd')) != null) REG.ponctuels[+k].date = t.value;
    else if ((k = t.getAttribute('data-pm')) != null) REG.ponctuels[+k].montant = t.value;
    else if ((k = t.getAttribute('data-ps')) != null) REG.ponctuels[+k].sens = t.value;
    avecLigneVide(REG);
    if (REG.fixes.length + REG.ponctuels.length !== avant) {
      var id = t.getAttribute('data-fn') != null ? '[data-fn="' + t.getAttribute('data-fn') + '"]' : (t.getAttribute('data-pn') != null ? '[data-pn="' + t.getAttribute('data-pn') + '"]' : '');
      dessiner();
      if (id) { var e = document.querySelector(id); if (e) { e.focus(); e.setSelectionRange(e.value.length, e.value.length); } }
    }
  });
  document.addEventListener('change', function(ev){ var t = ev.target; if (t && t.getAttribute && t.getAttribute('data-ps') != null && REG) REG.ponctuels[+t.getAttribute('data-ps')].sens = t.value; });
  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    if (document.querySelector('.szc-voile')) return;
    ev.preventDefault();
    if (REG && !SEUL) { REG = null; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });
  function rechargerSiLibre(){ if (!OCCUPE && !REG) charger(); }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) rechargerSiLibre(); });
  window.szActualiser = rechargerSiLibre;
  window.szRevenir = rechargerSiLibre;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;flex:0 0 auto');
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

  charger();
})();
</script></body></html>`;
}

module.exports = { pageTresorerie };
