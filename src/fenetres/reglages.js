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
/* ⚠ Indexé par une clé NEUTRE (premier mot du libellé d'origine, sans accent) : des noms français écrits ici
   finiraient dans le source de la page anglaise (banc-langue-residuel). */
const PICTO = {
  'apparence': 'M12 3a9 9 0 1 0 9 9c0-1-1-1.5-2-1.5h-2a2 2 0 0 1-2-2V7c0-2-1-4-3-4Z',
  'paiement': 'M3 7h18v10H3zM3 11h18',
  'livraison': 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-.1M17 19a2 2 0 1 0 0-.1',
  'communications': 'M4 5h16v11H8l-4 4z',
  'securite': 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
  'systeme': 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3M12 19v3M2 12h3M19 12h3',
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
/* (2026-11-18) Trois colonnes qui se TASSENT (plus de rangées fixes) : une carte courte ne laisse plus un trou sous elle. */
.rg-grille{display:block;columns:4 16.5rem;column-gap:14px;column-fill:balance;flex:none!important;height:auto!important;min-height:0}
.rg-grille>.rg-carte{break-inside:avoid;margin:0 0 14px}
.rg-carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:16px;padding:14px 16px 12px;display:flex;flex-direction:column;gap:8px;min-width:0}
.rg-carte[hidden]{display:none}
.rg-ct{display:flex;align-items:center;gap:10px}
.rg-ic{flex:none;width:28px;height:28px;border-radius:8px;background:#3d4456;display:flex;align-items:center;justify-content:center}
/* Le carré ardoise de la maquette reste ardoise EN JOUR (pictogramme blanc dessus) — reprise écrite exprès. */
html.jour .rg-ic{background:#3d4456}
/* (2026-11-22, sa capture : « que les titres et les menus apparaissent au complet, pas tronqués ») : ils passent à la ligne. */
.rg-ct{flex-wrap:wrap;row-gap:2px}
.rg-ct h2{margin:0;font-size:15px;font-weight:800;line-height:1.25;min-width:0;flex:1 1 auto}
.rg-ct .nb{margin-left:auto;flex:none;font-size:12px;font-weight:600;color:var(--tx2)}
/* (2026-11-22, sa capture : « les tuiles débordent et ne tiennent pas le texte sur une ligne ») Le TITRE et son compte
   restent sur une ligne (le compte devient une pastille : « 7 », le détail au survol) ; chaque ENTRÉE tient sur UNE
   ligne — larges() la mesure, et une carte dont une entrée ne tient pas dans la demi-colonne passe en une colonne. */
.rg-ct{flex-wrap:nowrap!important}
.rg-ct h2{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rg-ct .nb{min-width:22px;height:20px;padding:0 7px;border-radius:99px;background:var(--v08);display:inline-flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}
.rg-e span{white-space:nowrap;overflow:hidden}
.rg-ent{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:6px}
.rg-ent.une{grid-template-columns:minmax(0,1fr)}
.rg-e{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:7px;font:inherit;font-size:13px;font-weight:500;
  color:var(--tx);background:transparent;border:0;text-align:left;cursor:pointer;min-width:0}
.rg-e span{line-height:1.3;min-width:0}
.rg-e:hover{background:var(--v05);color:var(--tx-or)}
.rg-e[hidden],.rg-ch[hidden]{display:none}
.rg-e .ok{flex:none;width:1em;color:var(--tx-or);font-weight:800}
/* Une entrée trop longue pour sa demi-colonne prend toute la largeur de la carte : jamais coupée. */
.rg-e.large{grid-column:1/-1}
.rg-ch{grid-column:1/-1;display:flex;align-items:center;gap:8px;padding:4px 8px;font-size:13px;font-weight:500;min-width:0}
/* (2026-11-19) Le LIBELLÉ garde la priorité (entier, à la ligne s'il le faut) ; la liste prend ce qui reste, sans se
   dimensionner sur sa plus longue option. */
.rg-ch span{flex:0 1 auto;min-width:0;white-space:normal;line-height:1.25}
.rg-ch select{flex:1 1 0;width:0;min-width:6.5rem;height:30px;font:inherit;font-size:12.5px}
.rg-vide{font-size:13px;color:var(--tx2)}
/* (2026-11-22, sa capture : « ça se déforme encore » — Livraison coupée en bas, une colonne pleine, une autre à moitié vide)
   Les colonnes CSS ne s'équilibraient pas (cartes insécables de tailles très inégales). ranger() les MESURE : chaque carte
   va dans la colonne la plus courte ; si la page déborde encore, les entrées se resserrent (data-serre 1 puis 2). */
.rg-grille.rg-mas{display:flex;columns:auto;gap:14px;align-items:flex-start}
.rg-col{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:14px}
.rg-col>.rg-carte{margin:0}
/* Une entrée qui ne tient pas même sur toute la largeur de la carte passe à la ligne — jamais coupée. */
.rg-ent.une .rg-e span{white-space:normal}
.rg-grille[data-serre="1"] .rg-carte{padding:11px 14px 9px;gap:5px}
.rg-grille[data-serre="1"] .rg-e{padding:3px 8px}
.rg-grille[data-serre="2"] .rg-carte{padding:9px 12px 7px;gap:4px}
.rg-grille[data-serre="2"] .rg-e{padding:2px 6px;font-size:12.5px}
.rg-grille[data-serre="2"] .rg-ic{width:24px;height:24px}
.msg{position:fixed;left:32px;bottom:10px;font-size:.79rem;color:var(--tx2)}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
`;

function pageReglages() {
  // Les symboles des pictogrammes, bâtis HORS du gabarit (aucun accent grave dans le gabarit d'une fenêtre).
  const SYMBOLES = Object.keys(PICTO).map((k) => '<symbol id="rg-' + k + '" viewBox="0 0 24 24"><path d="' + PICTO[k] + '" fill="none" stroke="#ffffff" stroke-width="2.2"></path></symbol>').join('');
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
</div>
<span class="msg" id="msg" role="status"></span>
<!-- Les pictogrammes en SYMBOLES : les tracés restent des attributs du HTML (des chaînes dans le script seraient prises pour du texte à traduire). -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">${SYMBOLES}</svg>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var PICTOS = ${JSON.stringify(Object.keys(PICTO))};
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
      var k = sansAccent(g.cle).split(/[^a-z]/)[0]; if (PICTOS.indexOf(k) < 0) k = 'systeme';
      return '<section class="rg-carte" data-g="' + gi + '"><div class="rg-ct"><span class="rg-ic"><svg width="15" height="15" aria-hidden="true"><use href="#rg-' + k + '"></use></svg></span>'
        + '<h2>' + esc(g.nom) + '</h2><span class="nb" title="' + g.entrees.length + ' ' + (g.entrees.length > 1 ? '${T("réglages")}' : '${T("réglage")}') + '">' + g.entrees.length + '</span></div>'
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
    try { if (document.fonts && document.fonts.addEventListener && !window.__rgPol) { window.__rgPol = 1; document.fonts.addEventListener('loadingdone', function(){ larges(); }); } } catch (e) {}
    setTimeout(larges, 400); setTimeout(larges, 1500);
    filtrer();
  }
  /* Mesuré : une entrée qui ne tient pas dans sa demi-colonne prend la largeur de la carte (jamais de « … »).
     On repart de zéro à chaque mesure (police, taille de fenêtre). */
  function larges(niv){
    niv = niv || 0;
    if (niv) grille.setAttribute('data-serre', String(niv)); else grille.removeAttribute('data-serre');
    var bs = grille.querySelectorAll('.rg-e');
    Array.prototype.forEach.call(bs, function(b){ b.classList.remove('large'); });
    Array.prototype.forEach.call(grille.querySelectorAll('.rg-ent'), function(z){ z.classList.remove('une'); });
    Array.prototype.forEach.call(bs, function(b){
      var s = b.querySelector('span'); if (s && s.scrollWidth > s.clientWidth + 1) b.classList.add('large');
    });
    /* (2026-11-18, sa capture : « pourquoi Imprimantes n'est pas en dessous ») Une carte dont UNE entrée est trop longue
       pour la demi-colonne passe TOUTE en une colonne : plus de « Transporteurs | Imprimantes » côte à côte sous des
       entrées pleine largeur. */
    Array.prototype.forEach.call(grille.querySelectorAll('.rg-ent'), function(z){ if (z.querySelector('.rg-e.large')) z.classList.add('une'); });
    var haut = ranger();
    var dispo = window.innerHeight - grille.getBoundingClientRect().top - 14;
    if (haut > dispo && niv < 2) larges(niv + 1);
  }
  /* Chaque carte, dans l'ordre, va dans la colonne la plus COURTE (mesurée). Rend la hauteur de la plus haute. */
  function ranger(){
    var cartes = Array.prototype.slice.call(grille.querySelectorAll('.rg-carte'));
    if (!cartes.length) return 0;
    cartes.sort(function(a, b){ return (+a.getAttribute('data-g')) - (+b.getAttribute('data-g')); });
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var n = Math.max(1, Math.min(4, Math.floor((grille.clientWidth + 14) / (16.5 * rem + 14))));
    Array.prototype.forEach.call(grille.querySelectorAll('.rg-col'), function(c){ c.remove(); });
    grille.classList.add('rg-mas');
    var cols = [];
    for (var i = 0; i < n; i++) { var c = document.createElement('div'); c.className = 'rg-col'; grille.appendChild(c); cols.push(c); }
    cartes.forEach(function(k){
      var m = cols[0];
      cols.forEach(function(c){ if (c.offsetHeight < m.offsetHeight) m = c; });
      m.appendChild(k);
    });
    return Math.max.apply(null, cols.map(function(c){ return c.offsetHeight; }));
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
    ranger();
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
