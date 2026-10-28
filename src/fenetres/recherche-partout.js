'use strict';

/*
 * LA RECHERCHE PARTOUT (Ctrl+K) — 2026-10-27, sa demande
 * =============================================================================
 * « Un seul champ pour trouver une commande, un client, un produit, une facture
 * ou un code SKU, sans savoir dans quelle fenêtre chercher. » Une petite fenêtre
 * sans cadre, posée en haut de la fenêtre active ; elle se ferme dès qu'on la
 * quitte (Échap, clic ailleurs, ou un résultat ouvert).
 *
 * ⚠ LA RÈGLE VIT DANS LE SITE (pont.js, recherchePartout) : ce qui est cherché,
 * les droits de chaque sorte, et l'opération qui ouvre chaque résultat. Cette
 * page ne fait que taper, montrer et relayer.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { CSS_JOUR, ICO, TETE, JS_MESURES } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la langue du
   poste. On ne traduit QUE ce qui se lit — jamais ce qu'on tape ni ce que la
   base rend (numéros, noms). */
const T = require('../langue').tr('recherche-partout');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:transparent;overflow:hidden}
body{color:var(--tx);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.pal{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--f-carte);border:1px solid var(--v14);
  border-radius:14px;overflow:hidden}
.ch{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.75rem 1rem;border-bottom:1px solid var(--v10)}
.ch .ic{color:var(--tx2);display:flex}
.ch .ic svg{width:18px;height:18px}
.ch input{flex:1 1 auto;min-width:0;border:0;outline:none;background:transparent;color:var(--tx);font:inherit;font-size:1.02rem}
.ch kbd{font:600 .68rem system-ui,sans-serif;color:var(--tx2);border:1px solid var(--v16);border-radius:5px;padding:.08rem .35rem}
.res{flex:1 1 auto;min-height:0;overflow:hidden;padding:.35rem}
.grp{font-size:.64rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--tx2);padding:.5rem .65rem .2rem}
.it{display:flex;align-items:center;gap:.7rem;padding:.42rem .65rem;border-radius:9px;cursor:pointer}
.it.sel{background:rgba(var(--or-rgb),.16);box-shadow:inset 3px 0 0 var(--or)}
.it .pas{flex:0 0 auto;width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:var(--v06);color:var(--tx2);overflow:hidden}
.it .pas svg{width:16px;height:16px}
.it .pas img{width:100%;height:100%;object-fit:cover}
.it .t{flex:1 1 auto;min-width:0}
.it .t b{display:block;font-size:.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it .t span{display:block;font-size:.72rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it .m{flex:0 0 auto;font-size:.8rem;font-variant-numeric:tabular-nums;color:var(--tx2)}
.vide{padding:1.6rem 1rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;gap:1rem;padding:.45rem 1rem;border-top:1px solid var(--v10);font-size:.7rem;color:var(--tx2)}
.pied .msg{margin-left:auto}
.pied kbd{font:600 .64rem system-ui,sans-serif;border:1px solid var(--v16);border-radius:4px;padding:0 .3rem;margin-right:.2rem}
`;

/* Les pictogrammes au trait, gris (sa règle : tout pictogramme en gris). */
const PICTO = {
  commande: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/></svg>',
  client: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/></svg>',
  produit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>',
  facture: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h4"/></svg>',
};

function pageRecherchePartout() {
  return `${TETE()}
<title>${T("Rechercher partout")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="pal" role="dialog" aria-label="${T("Rechercher partout")}">
  <label class="ch"><span class="ic">${ICO.loupe}</span>
    <input id="rp-q" type="search" autocomplete="off" spellcheck="false" aria-label="${T("Rechercher partout")}"
      placeholder="${T("Commande, client, produit, SKU ou facture…")}"><kbd>${T("Échap")}</kbd></label>
  <div class="res" id="rp-res" role="listbox"><div class="vide">${T("Tapez au moins deux lettres.")}</div></div>
  <div class="pied"><span><kbd>↑</kbd><kbd>↓</kbd>${T("choisir")}</span><span><kbd>${T("Entrée")}</kbd>${T("ouvrir")}</span><span><kbd>${T("Échap")}</kbd>${T("fermer")}</span><span class="msg" id="msg" role="status"></span></div>
</div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  var q = document.getElementById("rp-q"), res = document.getElementById("rp-res");
  var L = [], SEL = 0, MINUT = null, NUM = 0;
  var PICTO = ${JSON.stringify(PICTO)};
  /* (2026-10-27) szArgent vient des MESURES du socle : cette palette ne charge pas JS_DIRE (qui les porte), il faut
     les poser ici — sans elles, « Rechercher partout » tombait au premier resultat chiffre (construction 40608387952). */
${JS_MESURES()}
  var GROUPES = { commande: '${T("Commandes")}', client: '${T("Clients")}', produit: '${T("Produits")}', facture: '${T("Factures")}' };
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function argent(n){ return szArgent(Number(n) || 0); }   // la monnaie du socle, dans la langue du poste
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; }).catch(function(){ return { ok: false, motif: 'echec' }; });
  }
  function fermer(){ try { window.close(); } catch (e) {} }

  function dessiner(texte){
    if (texte) { res.innerHTML = '<div class="vide">' + esc(texte) + '</div>'; return; }
    if (!L.length) { res.innerHTML = '<div class="vide">${T("Rien ne correspond.")}</div>'; return; }
    var h = '', avant = '';
    L.forEach(function(r, i){
      if (r.sorte !== avant) { h += '<div class="grp">' + esc(GROUPES[r.sorte] || r.sorte) + '</div>'; avant = r.sorte; }
      h += '<div class="it' + (i === SEL ? ' sel' : '') + '" role="option" aria-selected="' + (i === SEL) + '" data-i="' + i + '">'
        + '<span class="pas">' + (r.image ? '<img src="' + esc(r.image) + '" alt="" referrerpolicy="no-referrer">' : (PICTO[r.sorte] || '')) + '</span>'
        + '<span class="t"><b>' + esc(r.titre) + '</b><span>' + esc(r.sous || '') + '</span></span>'
        + (r.montant ? '<span class="m">' + esc(argent(r.montant)) + '</span>' : '') + '</div>';
    });
    res.innerHTML = h;
    var s = res.querySelector('.it.sel'); if (s && s.scrollIntoView) s.scrollIntoView({ block: 'nearest' });
  }
  function chercher(){
    var v = q.value.trim(), n = ++NUM;
    if (v.length < 2) { L = []; dessiner('${T("Tapez au moins deux lettres.")}'); return; }
    appeler('recherche:partout', [v]).then(function(r){
      if (n !== NUM) return;   // une frappe plus récente a déjà relancé
      if (!r || !r.ok) { L = []; dessiner(r && r.motif === 'session' ? '${T("Connectez-vous dans la fenêtre principale.")}' : '${T("La recherche n’a pas pu se faire.")}'); return; }
      L = r.resultats || []; SEL = 0; dessiner();
    });
  }
  function ouvrir(i){
    var r = L[i]; if (!r || !r.ouvrir) return;
    appeler(r.ouvrir, [r.id]).then(function(x){
      if (x && x.ok) fermer();
      else dessiner(x && x.motif === 'droit' ? '${T("Votre rôle ne permet pas d’ouvrir ce résultat.")}' : '${T("Ce résultat n’a pas pu s’ouvrir.")}');
    });
  }
  q.addEventListener('input', function(){ clearTimeout(MINUT); MINUT = setTimeout(chercher, 160); });
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); fermer(); return; }
    if (ev.key === 'ArrowDown' && L.length) { ev.preventDefault(); SEL = (SEL + 1) % L.length; dessiner(); return; }
    if (ev.key === 'ArrowUp' && L.length) { ev.preventDefault(); SEL = (SEL - 1 + L.length) % L.length; dessiner(); return; }
    if (ev.key === 'Enter') { ev.preventDefault(); ouvrir(SEL); }
  });
  res.addEventListener('click', function(ev){
    var it = ev.target.closest && ev.target.closest('[data-i]');
    if (it) ouvrir(parseInt(it.getAttribute('data-i'), 10));
  });
  res.addEventListener('mousemove', function(ev){
    var it = ev.target.closest && ev.target.closest('[data-i]');
    if (it) { var i = parseInt(it.getAttribute('data-i'), 10); if (i !== SEL) { SEL = i; dessiner(); } }
  });
  dessiner("${T("Tapez au moins deux lettres.")}");   // l état de départ, écrit par le script comme tout le reste
  q.focus();
})();
</script></body></html>`;
}

module.exports = { pageRecherchePartout };
