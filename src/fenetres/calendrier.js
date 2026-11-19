'use strict';

/*
 * LE CALENDRIER (2026-11-18, relooking — ajout choisi par elle)
 * =============================================================================
 * « Précommandes, ramassages, échéances fiscales et rappels sur un même mois. » Une fenêtre de LECTURE :
 * chaque événement ouvre le module qui le porte (Rappels, Ramassages, Produits) — on n'y modifie rien ici.
 * ⚠ LA RÈGLE VIT DANS LE SITE (pont.js, calendrierMois) : quelles sources, avec quels droits, quel ton.
 * ⚠ AUCUNE GLISSIÈRE (sa règle) : la grille du mois remplit la fenêtre, chaque case montre ce qui y TIENT
 * (mesuré) et « + k » ouvre le détail du jour dans le panneau de droite, lui-même mesuré.
 * ⚠ TROIS TONS : rouge (en retard), ambre (aujourd'hui ou dans la semaine, une précommande à livrer),
 * neutre (le reste) — rf-pill bleu/ambre/rouge, que le jeu Épuré convertit aux trois tons.
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script, COMMENTAIRES COMPRIS : le script vit dans un
 * littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('calendrier');

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
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or,var(--or))}
.tete .ico svg{width:100%;height:100%}
#corps{overflow:hidden}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
/* (même base que Rappels) */
.cx{gap:.7rem}
.cal-nav{display:flex;align-items:center;gap:.45rem;flex:0 0 auto}
.cal-nav h2{margin:0 .4rem;font-size:1rem;min-width:11rem;text-align:center;text-transform:capitalize;white-space:nowrap}
.cal-leg{display:flex;align-items:center;gap:.5rem;margin-left:auto;flex-wrap:wrap}
.cx>.cal-deux{flex:1 1 0;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 19rem;gap:.8rem}
.cal-grille{min-height:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;
  grid-template-rows:auto repeat(var(--cal-rangs,5),minmax(0,1fr))}
.cal-jsem{font-size:.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);padding:0 .3rem .15rem}
.cal-case{min-height:0;min-width:0;overflow:hidden;display:flex;flex-direction:column;gap:3px;padding:.3rem .35rem;
  border:1px solid var(--v08);border-radius:9px;background:var(--f-carte);cursor:pointer}
.cal-case.hors{opacity:.45}
.cal-case.auj{border-color:var(--or);box-shadow:inset 0 0 0 1px var(--or)}
.cal-case.choisi{background:var(--f-carte2);border-color:var(--v20)}
.cal-case .n{flex:none;font-size:.74rem;font-weight:700;color:var(--tx2)}
.cal-case.auj .n{color:var(--tx)}
.rf-pill.cal-ev{flex:none;display:block;max-width:100%;font-size:.66rem;font-weight:600;padding:.08rem .45rem;border-radius:6px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal-ev::before{display:none}
.cal-ev[hidden]{display:none}
.cal-plus{flex:none;font-size:.66rem;color:var(--tx2);padding:0 .3rem}
.cal-jour{min-height:0;display:flex;flex-direction:column;gap:.45rem;overflow:hidden}
.cal-jour h3{margin:0;font-size:.9rem}
.cal-jour h3::first-letter{text-transform:uppercase}
.cal-items{flex:1 1 0;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:.4rem}
.cal-item{flex:none;display:flex;flex-direction:column;gap:.15rem;padding:.5rem .6rem;border:1px solid var(--v08);border-radius:10px;
  background:var(--f-carte);text-align:left;font:inherit;color:inherit;cursor:pointer}
.cal-item[hidden]{display:none}
.cal-item:hover{background:var(--v05)}
.cal-item .l1{display:flex;align-items:center;gap:.45rem;min-width:0}
.cal-item .l1 b{flex:1 1 auto;min-width:0;font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal-item .l2{font-size:.72rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal-reste{flex:none;font-size:.72rem;color:var(--tx2)}
.cal-vide{font-size:.8rem;color:var(--tx2);padding:.4rem 0}
`;

function pageCalendrier() {
  return `${TETE()}
<title>${T("Calendrier — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.rappels}</span><h1>${T("Calendrier")}</h1>
  <span class="cx-resume" id="sous"></span><div class="cx-actions" id="outils"></div></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var elSous = document.getElementById('sous');
  var D = null, AN = 0, MO = 0, JOUR = '';
  var MOIS = ['${T("janvier")}', '${T("février")}', '${T("mars")}', '${T("avril")}', '${T("mai")}', '${T("juin")}',
    '${T("juillet")}', '${T("août")}', '${T("septembre")}', '${T("octobre")}', '${T("novembre")}', '${T("décembre")}'];
  var JSEM = ['${T("lun.")}', '${T("mar.")}', '${T("mer.")}', '${T("jeu.")}', '${T("ven.")}', '${T("sam.")}', '${T("dim.")}'];
  var SORTES = { rappel: '${T("Rappel")}', fiscal: '${T("Échéance fiscale")}', ramassage: '${T("Ramassage")}', precommande: '${T("Précommande")}' };
  var TON = { n: 'bleu', a: 'ambre', r: 'rouge' };
  var MOTIFS = {
  maj_en_cours: '${T("Une mise à jour s’installe : cette opération est suspendue jusqu’au redémarrage de l’application.")}',
    session: '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    pont_indisponible: '${T("La fenêtre principale ne répond pas.")}',
    delai: '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec: '${T("L’opération a échoué.")}'
  };
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; }).catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  function deux(n){ return (n < 10 ? '0' : '') + n; }
  function iso(a, m, j){ return a + '-' + deux(m) + '-' + deux(j); }
  function libJour(d){
    var p = String(d).split('-'); var dt = new Date(+p[0], +p[1] - 1, +p[2]);
    return JSEM[(dt.getDay() + 6) % 7] + ' ' + (+p[2]) + ' ' + MOIS[+p[1] - 1];
  }
  /* La ligne de détail se compose ICI, dans la langue du poste : le site n'envoie que des données. */
  function sousDe(e){
    if (e.sorte === 'ramassage') return '${T("Colis :")} ' + e.colis;
    if (e.sorte === 'precommande') return '${T("Livraison promise des précommandes")}';
    return e.sous || '';
  }
  function duJour(d){ return ((D && D.evenements) || []).filter(function(e){ return e.date === d; }); }

  function charger(){
    appeler('calendrier:mois', [AN, MO]).then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="cal-vide">' + esc(expliquer(r)) + '</div>'; return; }
      D = r;
      if (!AN) { AN = r.annee; MO = r.mois; }
      if (!JOUR || JOUR.slice(0, 7) !== iso(AN, MO, 1).slice(0, 7)) JOUR = (r.aujourdhui && r.aujourdhui.slice(0, 7) === iso(AN, MO, 1).slice(0, 7)) ? r.aujourdhui : iso(AN, MO, 1);
      dessiner();
    });
  }

  function dessiner(){
    var ev = (D && D.evenements) || [];
    elSous.textContent = ev.length ? (ev.length + ' ' + (ev.length > 1 ? '${T("événements ce mois-ci")}' : '${T("événement ce mois-ci")}')) : '';
    var premier = new Date(AN, MO - 1, 1), decal = (premier.getDay() + 6) % 7;
    var nbJours = new Date(AN, MO, 0).getDate();
    var rangs = Math.ceil((decal + nbJours) / 7);
    var h = '<div class="cal-nav"><button type="button" class="mini" data-nav="-1" aria-label="${T("Mois précédent")}">‹</button>'
      + '<h2>' + esc(MOIS[MO - 1]) + ' ' + AN + '</h2>'
      + '<button type="button" class="mini" data-nav="1" aria-label="${T("Mois suivant")}">›</button>'
      + '<button type="button" class="mini" data-nav="0">${T("Aujourd’hui")}</button>'
      + '<span class="cal-leg"><span class="rf-pill rouge">${T("En retard")}</span><span class="rf-pill ambre">${T("Cette semaine")}</span>'
      + '<span class="rf-pill bleu">${T("À venir")}</span></span></div>';
    h += '<div class="cal-deux"><div class="cal-grille" style="--cal-rangs:' + rangs + '">'
      + JSEM.map(function(j){ return '<div class="cal-jsem">' + esc(j) + '</div>'; }).join('');
    for (var c = 0; c < rangs * 7; c++) {
      var j = c - decal + 1;
      if (j < 1 || j > nbJours) { h += '<div class="cal-case hors" aria-hidden="true"></div>'; continue; }
      var d = iso(AN, MO, j), l = duJour(d);
      h += '<div class="cal-case' + (d === (D && D.aujourdhui) ? ' auj' : '') + (d === JOUR ? ' choisi' : '') + '" data-jour="' + d + '">'
        + '<span class="n">' + j + '</span>'
        + l.map(function(e){ return '<span class="rf-pill cal-ev ' + (TON[e.ton] || 'bleu') + '" title="' + esc(SORTES[e.sorte] || '') + ' — ' + esc(e.titre) + '">' + esc(e.titre) + '</span>'; }).join('')
        + '<span class="cal-plus" hidden></span></div>';
    }
    h += '</div><div class="carte cal-jour" id="cal-jour"></div></div>';
    corps.innerHTML = h;
    dessinerJour();
    ajusterCases();
  }

  function dessinerJour(){
    var z = document.getElementById('cal-jour'); if (!z) return;
    var l = duJour(JOUR);
    var h = '<h3>' + esc(libJour(JOUR)) + '</h3>';
    if (!l.length) h += '<div class="cal-vide">${T("Rien ce jour-là.")}</div>';
    else h += '<div class="cal-items">' + l.map(function(e, i){
      return '<button type="button" class="cal-item" data-i="' + i + '" title="${T("Ouvrir dans son module")}">'
        + '<span class="l1"><span class="rf-pill ' + (TON[e.ton] || 'bleu') + '">' + esc(SORTES[e.sorte] || '') + '</span><b>' + esc(e.titre) + '</b></span>'
        + (sousDe(e) ? '<span class="l2">' + esc(sousDe(e)) + '</span>' : '') + '</button>'; }).join('') + '</div>'
      + '<div class="cal-reste" id="cal-reste" hidden></div>';
    z.innerHTML = h;
    ajusterJour();
  }

  /* Mesuré, jamais défilé : ce qui ne tient pas se cache et se compte. */
  function ajusterCases(){
    Array.prototype.forEach.call(corps.querySelectorAll('.cal-case[data-jour]'), function(c){
      var evs = c.querySelectorAll('.cal-ev'), plus = c.querySelector('.cal-plus');
      Array.prototype.forEach.call(evs, function(e){ e.hidden = false; });
      plus.hidden = true;
      if (c.scrollHeight <= c.clientHeight + 1) return;
      plus.hidden = false; var k = 0;
      for (var i = evs.length - 1; i >= 0 && c.scrollHeight > c.clientHeight + 1; i--) { evs[i].hidden = true; k++; plus.textContent = '+ ' + k; }
      if (!k) plus.hidden = true;
    });
  }
  function ajusterJour(){
    var z = document.querySelector('.cal-items'), r = document.getElementById('cal-reste'); if (!z || !r) return;
    var it = z.querySelectorAll('.cal-item');
    Array.prototype.forEach.call(it, function(e){ e.hidden = false; });
    r.hidden = true;
    if (z.scrollHeight <= z.clientHeight + 1) return;
    var k = 0;
    for (var i = it.length - 1; i >= 0 && z.scrollHeight > z.clientHeight + 1; i--) { it[i].hidden = true; k++; }
    r.hidden = !k; r.textContent = '${T("+ {0} autres ce jour-là — ouvrez leur module.")}'.split('{0}').join(k);
  }

  corps.onclick = function(ev){
    var t = ev.target; if (!t || !t.closest) return;
    var n = t.closest('[data-nav]');
    if (n) {
      var v = +n.getAttribute('data-nav');
      if (v === 0) { var a = String((D && D.aujourdhui) || '').split('-'); AN = +a[0]; MO = +a[1]; JOUR = D.aujourdhui; }
      else { MO += v; if (MO < 1) { MO = 12; AN--; } if (MO > 12) { MO = 1; AN++; } JOUR = ''; }
      charger(); return;
    }
    var it = t.closest('.cal-item');
    if (it) {
      var e = duJour(JOUR)[+it.getAttribute('data-i')];
      if (e && e.ouvrir && P && P.ouvrirModule) { P.ouvrirModule(e.ouvrir); szDire('${T("Ouverture du module…")}'); }
      return;
    }
    var c = t.closest('.cal-case[data-jour]');
    if (c) { JOUR = c.getAttribute('data-jour');
      Array.prototype.forEach.call(corps.querySelectorAll('.cal-case.choisi'), function(x){ x.classList.remove('choisi'); });
      c.classList.add('choisi'); dessinerJour(); }
  };
  var minut = null;
  window.addEventListener('resize', function(){ clearTimeout(minut); minut = setTimeout(function(){ ajusterCases(); ajusterJour(); }, 120); });
  charger();
})();
</script></body></html>`;
}

module.exports = { pageCalendrier };
