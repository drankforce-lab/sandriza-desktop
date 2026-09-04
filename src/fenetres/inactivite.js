'use strict';

/*
 * DÉCOMPTE D'INACTIVITÉ — FENÊTRE NATIVE, TOUJOURS AU-DESSUS
 * =============================================================================
 * Les soixante secondes avant la fermeture de session. Rien d'autre.
 *
 * ⚠⚠ POURQUOI CETTE FENÊTRE EXISTE (signalé DEUX FOIS : 2026-08-07, puis
 * 2026-08-09 — « je ne vois plus encore le décompte, la session se ferme toute
 * seule »). L'avertissement vivait dans la fenêtre PRINCIPALE, et dans
 * l'application c'est justement la fenêtre qu'on ne regarde pas : le travail se
 * fait dans les fenêtres natives. La boîte s'ouvrait donc derrière une fenêtre
 * détachée, sous une vue ancrée, ou sur l'autre écran. Deux rustines ont été
 * tentées — ramener la principale au premier plan, voiler la vue ancrée — et
 * aucune ne règle le cas d'un second écran ou d'un système qui refuse le premier
 * plan. Un avertissement dont la visibilité DÉPEND de l'endroit où se trouve une
 * autre fenêtre n'est pas un avertissement.
 *
 * Celle-ci est petite, sans cadre de menu, NON REDIMENSIONNABLE et surtout
 * TOUJOURS AU-DESSUS : elle n'a rien derrière quoi se cacher.
 *
 * ⚠ ELLE NE DÉCIDE RIEN. Elle affiche un nombre et rend deux gestes. Le
 * minuteur, le seuil, la déconnexion restent au site — une deuxième horloge
 * finirait par ne plus dire la même heure que la première.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem .95rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#1b1216,#0e1522)}
/* ⚠ ON NE GARDE QUE LA COULEUR : elle est voulue — c est le decompte avant
   fermeture, il doit alarmer. La police vient du socle, comme partout. */
.tete h1{color:var(--tx-err2)}
.corps{flex:1 1 auto;min-height:0;display:flex;align-items:center;gap:1rem;
  padding:.9rem 1rem}
.anneau{flex:0 0 auto;width:84px;height:84px;border-radius:50%;display:flex;
  align-items:center;justify-content:center;font:800 1.7rem/1 system-ui;color:var(--tx-blanc);
  background:conic-gradient(#ef4444 100%,var(--v11) 0)}
.txt{min-width:0}
.txt p{margin:0 0 .25rem;font-size:.9rem}
.txt .sec{font-size:.78rem;color:var(--tx2);margin:0}
.pied{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;
  padding:.55rem .95rem;border-top:1px solid var(--v08);background:var(--f-pied)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.4rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v11)}
button:focus{outline:none;border-color:#c9a97e}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700;margin-left:auto}
button.prim:hover:not(:disabled){background:#d8bc95}
button.dgr{border-color:rgba(248,113,113,.5);color:var(--tx-err2)}
.msg{font-size:.75rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * @param {number|string} secondes durée totale du décompte, décidée par le site
 */
function pageInactivite(secondes) {
  const total = Math.max(5, parseInt(secondes, 10) || 60);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Déconnexion imminente</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><h1>Déconnexion imminente</h1></div>
<div class="corps" id="corps"></div>
<div class="pied">
  <button class="dgr" id="b-fermer">Se déconnecter</button>
  <span class="msg" id="msg"></span>
  <button class="prim" id="b-rester">✓ Rester connecté</button>
</div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_DIRE}
  var TOTAL = ${total};
  var depart = Date.now();

  /* ⚠ LE CORPS EST ECRIT PAR LE SCRIPT, et non fige dans le gabarit. Une page
     dont le contenu est deja la ne prouve rien : le garde-fou verifie qu un
     SCRIPT produit un ecran, et un script mort passerait inapercu derriere un
     joli HTML statique. C est exactement le trou qui a laisse passer une
     fenetre morte le 2026-08-06. */
  document.getElementById('corps').innerHTML =
    '<div class="anneau" id="anneau"><span id="n">' + TOTAL + '</span></div>'
    + '<div class="txt">'
    + '<p>Vous n’avez rien fait depuis un moment.</p>'
    + '<p class="sec">Votre session d’administration se fermera à la fin du décompte.</p>'
    + '</div>';

  var n = document.getElementById('n');
  var anneau = document.getElementById('anneau');

  /* ⚠ LE DECOMPTE EST DESSINE ICI, MAIS L HEURE RESTE CELLE DU SITE. Cette
     fenetre s efface quand le site le lui dit ; si elle arrivait a zero avant
     que le site n agisse, elle ne ferme rien d elle-meme — elle s immobilise.
     Deux horloges qui decident, c est une qui se trompe. */
  var tic = setInterval(function(){
    var reste = Math.max(TOTAL * 1000 - (Date.now() - depart), 0);
    var s = Math.ceil(reste / 1000);
    n.textContent = s;
    var pct = Math.max(0, Math.min(100, (reste / (TOTAL * 1000)) * 100));
    anneau.style.background = 'conic-gradient(#ef4444 ' + pct + '%,var(--v11) 0)';
    if (reste <= 0) clearInterval(tic);
  }, 250);

  function agir(op, mot){
    var b1 = document.getElementById('b-rester');
    var b2 = document.getElementById('b-fermer');
    b1.disabled = true; b2.disabled = true;
    szDire(mot);
    var p;
    try { p = P.appeler(op); } catch (e) { p = null; }
    if (!p || typeof p.then !== 'function') {
      b1.disabled = false; b2.disabled = false;
      szDire('La fenêtre principale ne répond pas.', 'err');
      return;
    }
    p.then(function(r){
      if (r && r.ok) return;                 // le site refermera cette fenetre
      b1.disabled = false; b2.disabled = false;
      szDire((r && r.motif) ? ('Refusé (' + r.motif + ').') : 'L’opération a échoué.', 'err');
    }).catch(function(){
      b1.disabled = false; b2.disabled = false;
      szDire('L’opération a échoué.', 'err');
    });
  }

  document.getElementById('b-rester').onclick = function(){ agir('session:rester', 'Prolongation…'); };
  document.getElementById('b-fermer').onclick = function(){ agir('session:fermer', 'Fermeture…'); };
  document.getElementById('b-rester').focus();
})();
</script></body></html>`;
}

module.exports = { pageInactivite };
