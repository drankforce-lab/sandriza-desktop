'use strict';

/*
 * LA PAGE RÉGLAGES (2026-11-18, relooking — maquette « Réglages », fidèle à elle)
 * =============================================================================
 * Le menu Configuration, mis en page sur UN écran : six cartes (Apparence, Paiement et taxes, Livraison,
 * Communications, Sécurité, Système), leurs entrées sur deux colonnes, une recherche « Chercher un réglage ».
 * ⚠ AUCUNE DONNÉE PROPRE : la coquille lit son modèle de menu (reglagesPage, main.js) — aucune entrée perdue,
 * les nouvelles paraissent seules. Une entrée se déclenche par son CHEMIN (szPont.menuEntree), comme Ctrl K.
 * ⚠ AUCUNE GLISSIÈRE (sa règle) : tout tient sur l'écran ; la recherche filtre, elle ne fait pas défiler.
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script, COMMENTAIRES COMPRIS.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, TETE } = require('./socle.js');
const T = require('../langue').tr('reglages');

/* Les pictogrammes de la maquette, au trait, blancs sur un carré ardoise. */
const PICTO = {
  'Apparence': 'M12 3a9 9 0 1 0 9 9c0-1-1-1.5-2-1.5h-2a2 2 0 0 1-2-2V7c0-2-1-4-3-4Z',
  'Paiement & taxes': 'M3 7h18v10H3zM3 11h18',
  'Livraison': 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-.1M17 19a2 2 0 1 0 0-.1',
  'Communications': 'M4 5h16v11H8l-4 4z',
  'Sécurité': 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
  'Système': 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3M12 19v3M2 12h3M19 12h3',
};

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.rg{flex:1 1 auto;min-height:0;overflow:hidden;padding:26px 32px 22px;display:flex;flex-direction:column;gap:18px}
.rg-tete{display:flex;flex-wrap:wrap;align-items:center;gap:14px}
.rg-titre{display:flex;flex-direction:column;gap:2px;margin-right:auto}
.rg-titre span{font-size:12px;font-weight:600;color:var(--tx2)}
.rg-titre h1{margin:0;font-size:26px;font-weight:800;letter-spacing:-.02em}
.rg-rch{flex:0 1 420px;display:flex;align-items:center;gap:10px;height:42px;padding:0 14px;background:var(--f-champ);
  border:1px solid var(--v12);border-radius:12px}
.rg-rch svg{flex:none;color:var(--tx2)}
.rg-rch input{border:0!important;outline:none;background:transparent!important;font:inherit;font-size:14px;width:100%;color:var(--tx);padding:0!important;height:auto!important}
.rg-grille{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-items:start;min-height:0}
.rg-carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:16px;padding:14px 16px 12px;display:flex;flex-direction:column;gap:8px;min-width:0}
.rg-carte[hidden]{display:none}
.rg-ct{display:flex;align-items:center;gap:10px}
.rg-ic{flex:none;width:28px;height:28px;border-radius:8px;background:#3d4456;display:flex;align-items:center;justify-content:center}
.rg-ct h2{margin:0;font-size:15px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rg-ct .nb{margin-left:auto;flex:none;font-size:12px;font-weight:600;color:var(--tx2)}
.rg-ent{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:6px}
.rg-e{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:7px;font:inherit;font-size:13px;font-weight:500;
  color:var(--tx);background:transparent;border:0;text-align:left;cursor:pointer;min-width:0}
.rg-e span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rg-e:hover{background:var(--v05);color:var(--tx-or)}
.rg-e[hidden],.rg-ch[hidden]{display:none}
.rg-e .ok{flex:none;width:1em;color:var(--tx-or);font-weight:800}
/* Une entrée trop longue pour sa demi-colonne prend toute la largeur de la carte : jamais coupée. */
.rg-e.large{grid-column:1/-1}
.rg-ch{grid-column:1/-1;display:flex;align-items:center;gap:8px;padding:4px 8px;font-size:13px;font-weight:500;min-width:0}
.rg-ch span{flex:none;white-space:nowrap}
.rg-ch select{flex:1 1 auto;min-width:0;height:30px;font:inherit;font-size:12.5px}
.rg-note{margin:0;font-size:13px;color:var(--tx2)}
.rg-vide{font-size:13px;color:var(--tx2)}
.msg{position:fixed;left:32px;bottom:10px;font-size:.79rem;color:var(--tx2)}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
`;

function pageReglages() {
  return `${TETE()}
<title>${T("Réglages — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="rg" id="corps">
  <header class="rg-tete">
    <div class="rg-titre"><span>${T("Configuration")}</span><h1>${T("Réglages")}</h1></div>
    <label class="rg-rch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
      <input id="rg-q" aria-label="${T("Chercher un réglage")}" placeholder="${T("Chercher un réglage (taxes, logo, NIP…)")}" autocomplete="off" spellcheck="false"></label>
  </header>
  <div class="rg-grille" id="grille"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
  <p class="rg-note" id="note"></p>
</div>
<span class="msg" id="msg" role="status"></span>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var PICTO = ${JSON.stringify(PICTO)};
  var grille = document.getElementById('grille'), q = document.getElementById('rg-q');
  var G = [];
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function sansAccent(s){ try { return String(s).normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase(); } catch (e) { return String(s).toLowerCase(); } }
  function charger(){
    var p = null;
    try { p = P.reglagesPage(); } catch (e) {}
    Promise.resolve(p).then(function(r){
      if (!r || !r.ok) { grille.innerHTML = '<div class="rg-vide">${T("Les réglages ne sont pas encore disponibles — la barre de menus n’a pas fini de se charger.")}</div>'; return; }
      G = r.groupes || []; dessiner();
    });
  }
  function dessiner(){
    var n = 0;
    grille.innerHTML = G.map(function(g, gi){
      n += g.entrees.length;
      var d = PICTO[g.cle] || PICTO['Système'];
      return '<section class="rg-carte" data-g="' + gi + '"><div class="rg-ct"><span class="rg-ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" aria-hidden="true"><path d="' + d + '"></path></svg></span>'
        + '<h2>' + esc(g.nom) + '</h2><span class="nb">' + g.entrees.length + ' ' + (g.entrees.length > 1 ? '${T("réglages")}' : '${T("réglage")}') + '</span></div>'
        + '<div class="rg-ent">' + g.entrees.map(function(e, ei){
            if (e.choix) return '<label class="rg-ch" data-k="' + esc(sansAccent(e.t + ' ' + e.choix.map(function(x){ return x.t; }).join(' '))) + '"><span>' + esc(e.t) + '</span>'
              + '<select data-choix="' + gi + '.' + ei + '">' + e.choix.map(function(x, xi){ return '<option value="' + xi + '"' + (x.on ? ' selected' : '') + '>' + esc(x.t) + '</option>'; }).join('') + '</select></label>';
            return '<button type="button" class="rg-e" data-e="' + gi + '.' + ei + '" data-k="' + esc(sansAccent(e.t)) + '" title="' + esc(e.t) + '">'
              + (e.coche === null || e.coche === undefined ? '' : '<b class="ok">' + (e.coche ? '✓' : '') + '</b>') + '<span>' + esc(e.t) + '</span></button>';
          }).join('') + '</div></section>';
    }).join('');
    larges();
    // ⚠ La police embarquée arrive APRÈS le premier dessin et elle est plus large : on remesure quand elle est prête.
    // fonts.ready peut se résoudre AVANT la bascule : on demande la police elle-même, puis une remesure de sûreté.
    // ⚠ MESURÉ : la bascule arrive après 400 ms en sans-tête ; seul l avis « police chargée » est sûr.
    try { if (document.fonts && document.fonts.load) document.fonts.load('500 13px SzEpure').then(larges, larges); } catch (e) {}
    try { if (document.fonts && document.fonts.addEventListener && !window.__rgPol) { window.__rgPol = 1; document.fonts.addEventListener('loadingdone', function(){ larges(); }); } } catch (e) {}
    setTimeout(larges, 400); setTimeout(larges, 1500);
    document.getElementById('note').textContent = '${T("Les {0} entrées de Configuration tiennent sur un seul écran. Chacune ouvre la même fenêtre qu’avant.")}'.split('{0}').join(n);
    filtrer();
  }
  /* Mesuré : une entrée qui ne tient pas dans sa demi-colonne prend la largeur de la carte (jamais de « … »).
     On repart de zéro à chaque mesure (police, taille de fenêtre). */
  function larges(){
    var bs = grille.querySelectorAll('.rg-e');
    Array.prototype.forEach.call(bs, function(b){ b.classList.remove('large'); });
    Array.prototype.forEach.call(bs, function(b){
      var s = b.querySelector('span'); if (s && s.scrollWidth > s.clientWidth + 1) b.classList.add('large');
    });
  }
  var minutR = null;
  window.addEventListener('resize', function(){ clearTimeout(minutR); minutR = setTimeout(larges, 120); });
  function filtrer(){
    var v = sansAccent(q.value.trim());
    Array.prototype.forEach.call(grille.querySelectorAll('.rg-carte'), function(c){
      var vus = 0;
      Array.prototype.forEach.call(c.querySelectorAll('[data-k]'), function(e){
        var ok = !v || e.getAttribute('data-k').indexOf(v) >= 0; e.hidden = !ok; if (ok) vus++;
      });
      c.hidden = !vus;
    });
  }
  function agir(chemin){
    var p = null;
    try { p = P.menuEntree(chemin); } catch (e) {}
    Promise.resolve(p).then(function(ok){
      if (!ok) { szDire('${T("Ce réglage n’a pas pu s’ouvrir — le menu a changé ; la page a été relue.")}', 'err'); charger(); return; }
      setTimeout(charger, 700);   // une case cochée (thème sombre, barre d état…) se relit
    });
  }
  grille.addEventListener('click', function(ev){
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-e]') : null; if (!b) return;
    var k = b.getAttribute('data-e').split('.'); var e = G[+k[0]] && G[+k[0]].entrees[+k[1]];
    if (e && e.c) agir(e.c);
  });
  grille.addEventListener('change', function(ev){
    var s = ev.target; if (!s || !s.getAttribute || !s.getAttribute('data-choix')) return;
    var k = s.getAttribute('data-choix').split('.'); var e = G[+k[0]] && G[+k[0]].entrees[+k[1]];
    var x = e && e.choix && e.choix[+s.value]; if (x) agir(x.c);
  });
  q.addEventListener('input', filtrer);
  charger();
})();
</script></body></html>`;
}

module.exports = { pageReglages };
