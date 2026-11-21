'use strict';

/*
 * LE RAPPEL DES RACCOURCIS (Ctrl+K MAINTENU) — 2026-11-22, sa demande
 * =============================================================================
 * « N'affiche pas les raccourcis à côté des menus ; par contre, si on fait Ctrl + K, ça affiche un écran
 * temporaire pendant que l'on garde appuyé, où on voit les raccourcis en rappel. »
 * Un appui BREF sur Ctrl+K ouvre toujours la recherche partout ; MAINTENU, il montre cet écran, qui disparaît
 * au relâchement (main.js, « LE RAPPEL DES RACCOURCIS »). Il ne prend jamais le focus : c'est un coup d'œil.
 * La liste vient du MÊME modèle de menu que la barre (les entrées qui ont un raccourci), plus les gestes fixes.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans le gabarit.
 */

const { CSS_JOUR, TETE } = require('./socle.js');
const T = require('../langue').tr('raccourcis');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:transparent;overflow:hidden}
body{color:var(--tx);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.rc{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--f-carte);border:1px solid var(--v14);
  border-radius:16px;overflow:hidden}
.rc-t{flex:0 0 auto;display:flex;align-items:baseline;gap:.8rem;padding:.9rem 1.2rem .7rem;border-bottom:1px solid var(--v10)}
.rc-t h1{margin:0;font-size:1.02rem;font-weight:750}
.rc-t .aide{color:var(--tx2);font-size:.8rem}
.rc-c{flex:1 1 auto;min-height:0;overflow:hidden;padding:.7rem 1.2rem 1rem;column-width:15.5rem;column-gap:1.6rem}
.grp{break-inside:avoid;margin:0 0 .8rem}
.grp h2{margin:0 0 .3rem;font-size:.66rem;font-weight:750;text-transform:uppercase;letter-spacing:.08em;color:var(--tx2)}
.l{display:flex;align-items:center;justify-content:space-between;gap:.7rem;padding:.16rem 0;font-size:.84rem}
.l span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
kbd{flex:0 0 auto;font:650 .72rem system-ui,sans-serif;color:var(--tx);border:1px solid var(--v16);border-bottom-width:2px;
  border-radius:6px;padding:.08rem .4rem;background:var(--f-page);white-space:nowrap}
`;

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* `liste` : [{ s: section, t: libellé (déjà dans la langue du poste), k: raccourci }] — le modèle de menu. */
function pageRaccourcis(liste) {
  const l = Array.isArray(liste) ? liste : [];
  const groupes = [];
  const parSection = {};
  l.forEach((x) => {
    const s = String(x.s || '');
    if (!parSection[s]) { parSection[s] = []; groupes.push(s); }
    parSection[s].push(x);
  });
  const ligne = (x) => '<div class="l"><span>' + esc(x.t) + '</span><kbd>' + esc(x.k) + '</kbd></div>';
  let menus = '';
  groupes.forEach((s) => { menus += '<div class="grp"><h2>' + esc(s) + '</h2>' + parSection[s].map(ligne).join('') + '</div>'; });
  return `${TETE('data-sans-plein')}
<title>${T("Raccourcis clavier")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="rc" role="dialog" aria-label="${T("Raccourcis clavier")}">
  <div class="rc-t"><h1>${T("Raccourcis clavier")}</h1><span class="aide" id="rc-nb"></span><span class="aide">${T("Relâchez Ctrl+K pour fermer.")}</span></div>
  <div class="rc-c" id="rc-c">
    <div class="grp"><h2>${T("Partout")}</h2>
      <div class="l"><span>${T("Recherche partout (appui bref)")}</span><kbd>Ctrl+K</kbd></div>
      <div class="l"><span>${T("Ce rappel (maintenir)")}</span><kbd>Ctrl+K</kbd></div>
      <div class="l"><span>${T("Fermer une boîte ou un panneau")}</span><kbd>${T("Échap")}</kbd></div>
      <div class="l"><span>${T("Recharger la fenêtre")}</span><kbd>Ctrl+R</kbd></div>
    </div>${menus}
  </div>
</div>
<div class="msg" id="msg" hidden></div>
<script>
/* Un coup d oeil, rien a faire : la page compte ses raccourcis et le dit dans l en-tete. */
(function(){
  var n = document.querySelectorAll('.l').length, e = document.getElementById('rc-nb');
  if (e) e.textContent = '${T("{0} raccourcis")}'.split('{0}').join(String(n)) + ' ·';
  document.documentElement.setAttribute('data-pret', '1');
})();
</script>
</body></html>`;
}

module.exports = { pageRaccourcis };
