'use strict';

/*
 * LES BOÎTES DE DIALOGUE — EN VRAIES FENÊTRES DE L'APPLICATION (2026-11-27)
 * =============================================================================
 * Sa demande, capture à l'appui (« Supprimer la commande » dessinée PAR-DESSUS la
 * fiche) : « la fenêtre de suppression n'est pas en natif et le devrait — tu vas
 * devoir repasser le code de l'application pour convertir toutes les fenêtres qui
 * ne sont pas encore en natif ».
 *
 * Une seule page pour toutes les questions : `szConfirmer`, `szDemanderNip` et
 * `szBrouillonDemander` (socle) l'ouvrent par le pont (`szPont.dialogue`), et la
 * coquille la pose en fenêtre MODALE, fille de la fenêtre qui pose la question
 * (main.js, « dialogue:demander »). Même famille que « Déconnexion » : au thème,
 * centrée sur sa mère, Échap et la croix valent « non ».
 *
 * La question arrive DÉJÀ TRADUITE (le titre, le texte, les boutons sont écrits par
 * la fenêtre qui demande) ; cette page ne traduit que ses propres mots.
 *
 * Ce qu'elle rend (par `szPont.dialogueReponse`) :
 *   · 'oui' | 'non'            — une confirmation ;
 *   · { valeur: '1234' } | null — une saisie (NIP) ;
 *   · l'id d'un bouton | null   — un choix à plusieurs boutons.
 *
 * ⚠ La HAUTEUR suit le contenu : la page la mesure et la donne à la coquille
 * (`dialogueTaille`) avant de se montrer — une question qu'il faut faire défiler
 * pour la lire est une question à laquelle on répond sans l'avoir lue.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_DIRE, CSS_JOUR, TETE } = require('./socle.js');
const T = require('../langue').tr('dialogue');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;overflow:hidden}
body{background:radial-gradient(ellipse at 50% 0%,rgba(var(--or-rgb),0.08),transparent 60%),var(--f-page);color:var(--tx);
  font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
#boite{display:flex;flex-direction:column}
.dl-corps{padding:1.35rem 1.6rem .4rem;display:flex;flex-direction:column;gap:.75rem}
.dl-tete{display:flex;align-items:center;gap:.8rem}
.ico{flex:0 0 auto;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:rgba(var(--or-rgb),.14);color:var(--tx-or2)}
.ico svg{width:21px;height:21px}
.danger .ico{background:rgba(220,38,38,.16);color:var(--tx-err)}
html.jour .danger .ico{background:transparent;box-shadow:inset 0 0 0 1.5px currentColor}
h1{margin:0;font-size:1.28rem;line-height:1.3;font-weight:700;letter-spacing:-.005em;color:var(--tx)}
#boite .texte{margin:0;font-size:1rem;line-height:1.55;color:var(--tx2);white-space:pre-line}
dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:.35rem .9rem;padding:.7rem .9rem;border-radius:12px;background:var(--v05);border:1px solid var(--v08)}
dt{color:var(--tx2);font-size:.9rem}
dd{margin:0;color:var(--tx);font-size:.92rem;font-weight:600;text-align:right;overflow-wrap:anywhere}
.lt{margin:.1rem 0 -.3rem;font-size:.9rem;font-weight:650;color:var(--tx)}
ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:.35rem}
li{display:flex;align-items:center;gap:.6rem;padding:.55rem .8rem;border-radius:10px;background:var(--v05);border:1px solid var(--v08);font-size:.95rem}
li::before{content:"";flex:0 0 auto;width:6px;height:6px;border-radius:50%;background:var(--or)}
.danger li::before{background:var(--tx-err)}
.note{margin:0;display:flex;gap:.5rem;align-items:flex-start;font-size:.93rem;line-height:1.5;color:var(--tx2)}
.note svg{flex:0 0 auto;width:17px;height:17px;margin-top:.15rem;color:var(--tx-or2)}
.danger .note{color:var(--tx-err)}
.danger .note svg{color:var(--tx-err)}
.champ{display:flex;flex-direction:column;gap:.35rem}
.champ span{font-size:.85rem;color:var(--tx2)}
.champ input{font:inherit;font-size:1.15rem;letter-spacing:.3em;text-align:center;height:2.8rem;border-radius:10px;
  border:1px solid var(--v16);background:var(--v05);color:var(--tx);outline:0}
.champ input:focus{border-color:var(--or);box-shadow:0 0 0 3px rgba(var(--or-rgb),.25)}
.err{min-height:1.2em;font-size:.88rem;color:var(--tx-err)}
.msg{margin:0;padding:0 1.6rem .8rem;font-size:.88rem;color:var(--tx2)}
.msg:empty{display:none}
.dl-pied{display:flex;gap:.7rem;justify-content:flex-end;flex-wrap:wrap;padding:1rem 1.6rem 1.35rem}
button{font:inherit;color:var(--tx);background:var(--v05);display:inline-flex;align-items:center;justify-content:center;gap:.45rem;
  border:1px solid var(--v16);border-radius:999px;height:2.6rem;padding:0 1.35rem;cursor:pointer;font-size:.97rem;font-weight:600;
  transition:background-color .13s ease,border-color .13s ease}
button:hover{background:var(--v10)}
button.non{background:transparent}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover{background:var(--or-clair)}
button.rouge{background:#dc2626;border-color:#dc2626;color:#fff;font-weight:700}
button.rouge:hover{background:#b91c1c;border-color:#b91c1c}
html.jour button.rouge{background:#dc2626;border-color:#dc2626;color:#fff}
html.jour button.rouge:hover{background:#b91c1c;border-color:#b91c1c}
html body button:focus-visible{outline:0!important;box-shadow:0 0 0 3px rgba(var(--or-rgb),.4)!important}
html body button.rouge:focus-visible{box-shadow:0 0 0 3px rgba(220,38,38,.45)!important}
html body button:focus:not(:focus-visible){outline:0!important}
@media (prefers-reduced-motion:reduce){button{transition:none}}
`;

/* Les options reçues, bornées : une boîte ne doit jamais devenir un roman ni une injection. */
const nettoyer = (o) => {
  o = (o && typeof o === 'object') ? o : {};
  const s = (x, n) => String(x == null ? '' : x).slice(0, n || 400);
  const genre = ['confirmer', 'nip', 'choix'].indexOf(o.genre) >= 0 ? o.genre : 'confirmer';
  return {
    genre,
    titre: s(o.titre, 160),
    texte: s(o.texte, 1200),
    details: Array.isArray(o.details) ? o.details.slice(0, 12).map((d) => [s(d && d[0], 80), s(d && d[1], 200)]) : [],
    listeTitre: s(o.listeTitre, 120),
    liste: Array.isArray(o.liste) ? o.liste.slice(0, 14).map((x) => s(x, 200)) : [],
    note: s(o.note, 400),
    oui: s(o.oui, 80),
    non: s(o.non, 80),
    danger: !!o.danger,
    prudent: !!o.prudent,
    seul: !!o.seul,
    erreur: s(o.erreur, 200),
    min: Math.max(1, Math.min(12, parseInt(o.min, 10) || 4)),
    max: Math.max(1, Math.min(12, parseInt(o.max, 10) || 8)),
    boutons: Array.isArray(o.boutons) ? o.boutons.slice(0, 4).map((b) => ({ id: s(b && b.id, 40), lib: s(b && b.lib, 80), prim: !!(b && b.prim), rouge: !!(b && b.rouge) })) : [],
    echap: s(o.echap, 40),
  };
};

function pageDialogue(opt) {
  const Q = nettoyer(opt);
  // ⚠ Une balise de fin de script dans un texte fermerait le script : les chevrons sont echappes.
  const json = JSON.stringify(Q).replace(/</g, '\\u003c');
  return `${TETE('data-sans-plein')}
<title>${Q.titre ? Q.titre.replace(/[<>&"]/g, '') : T('Confirmation')}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div id="boite" role="alertdialog" aria-modal="true" aria-labelledby="d-t" aria-describedby="d-x"></div>
<p class="msg" id="msg" role="status"></p>
<script>
${JS_DIRE()}
(function(){
  'use strict';
  var P = window.szPont;
  var D = ${json};
  var repondu = false;
  var esc = function(x){ return String(x == null ? '' : x).replace(/[&<>"]/g, function(c){
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
  var ICO_ATTENTION = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>';
  var ICO_POUBELLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></svg>';
  var ICO_QUESTION = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2.2-2.4 3.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>';
  var ICO_CLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var ico = D.genre === 'nip' ? ICO_CLE : (D.danger ? ICO_POUBELLE : (D.prudent ? ICO_ATTENTION : ICO_QUESTION));

  var h = '<div class="dl-corps">'
    + '<div class="dl-tete"><span class="ico">' + ico + '</span><h1 id="d-t">' + esc(D.titre || '${T("Confirmer l’action")}') + '</h1></div>'
    + (D.texte ? '<p class="texte" id="d-x">' + esc(D.texte) + '</p>' : '<p class="texte" id="d-x" hidden></p>');
  if (D.details.length) h += '<dl>' + D.details.map(function(d){ return '<dt>' + esc(d[0]) + '</dt><dd>' + esc(d[1]) + '</dd>'; }).join('') + '</dl>';
  if (D.liste.length) h += (D.listeTitre ? '<p class="lt">' + esc(D.listeTitre) + '</p>' : '') + '<ul>' + D.liste.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  if (D.note) h += '<p class="note">' + ICO_ATTENTION + '<span>' + esc(D.note) + '</span></p>';
  if (D.genre === 'nip') h += '<label class="champ"><span>${T("NIP")}</span><input id="d-nip" type="password" inputmode="numeric" autocomplete="off" maxlength="' + D.max + '"></label>'
    + '<div class="err" id="d-err" role="alert">' + esc(D.erreur) + '</div>';
  h += '</div><div class="dl-pied">';
  if (D.genre === 'choix' && D.boutons.length) {
    h += D.boutons.map(function(b){ return '<button type="button" data-id="' + esc(b.id) + '" class="' + (b.rouge ? 'rouge' : (b.prim ? 'prim' : 'non')) + '">' + esc(b.lib) + '</button>'; }).join('');
  } else {
    if (!D.seul) h += '<button type="button" class="non" id="d-non">' + esc(D.non || '${T("Annuler")}') + '</button>';
    h += '<button type="button" class="' + (D.danger ? 'rouge' : 'prim') + '" id="d-oui">' + esc(D.oui || (D.genre === 'nip' ? '${T("Valider")}' : '${T("Continuer")}')) + '</button>';
  }
  h += '</div>';
  var boite = document.getElementById('boite');
  if (D.danger) boite.className = 'danger';
  boite.innerHTML = h;

  function repondre(r){
    if (repondu) return;
    repondu = true;
    try { if (!P || !P.dialogueReponse) throw new Error('pont'); P.dialogueReponse(r); }
    catch (e) { repondu = false; szDire('${T("La réponse n’a pas pu partir — fermez cette fenêtre et réessayez.")}', 'err'); }
  }
  var annuler = function(){
    if (D.genre === 'choix') repondre(D.echap || null);
    else if (D.genre === 'nip') repondre(null);
    else repondre('non');
  };
  var nip = document.getElementById('d-nip');
  var valider = function(){
    if (D.genre !== 'nip') { repondre('oui'); return; }
    var n = nip.value;
    if (!/^[0-9]+$/.test(n) || n.length < D.min || n.length > D.max) {
      document.getElementById('d-err').textContent = '${T("Un NIP de")} ' + D.min + ' ${T("à")} ' + D.max + ' ${T("chiffres.")}';
      nip.focus(); return;
    }
    repondre({ valeur: n });
  };
  if (nip) nip.oninput = function(){ var d = this.value.replace(/[^0-9]/g, '').slice(0, D.max); if (d !== this.value) this.value = d; };
  var bn = document.getElementById('d-non'), bo = document.getElementById('d-oui');
  if (bn) bn.onclick = annuler;
  if (bo) bo.onclick = valider;
  Array.prototype.forEach.call(document.querySelectorAll('button[data-id]'), function(b){ b.onclick = function(){ repondre(b.getAttribute('data-id')); }; });

  window.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { e.preventDefault(); annuler(); }
    else if (e.key === 'Enter') {
      if (D.genre === 'nip') { e.preventDefault(); valider(); }
      // Une action dangereuse ou prudente ne se valide JAMAIS par Entrée : le foyer est sur Annuler.
      else if (!D.danger && !D.prudent && D.genre === 'confirmer' && document.activeElement === bo) { e.preventDefault(); valider(); }
    }
  });
  // (La croix : c est la coquille qui repond « non » a la fermeture — un ecouteur beforeunload ici pouvait retenir la fenetre.)

  // Le foyer : le champ ; sinon Annuler pour une action dangereuse ou prudente ; sinon l'action.
  try {
    if (nip) nip.focus();
    else if (D.genre === 'choix') { var p = document.querySelector('button.prim') || document.querySelector('button[data-id]'); if (p) p.focus(); }
    else ((D.danger || D.prudent) && bn ? bn : bo).focus();
  } catch (e) {}

  // La hauteur réelle, donnée à la coquille avant que la fenêtre se montre.
  var dire = function(){ try { if (P && P.dialogueTaille) P.dialogueTaille(Math.ceil(boite.getBoundingClientRect().height)); } catch (e) {} };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(dire); else dire();
  setTimeout(dire, 60);
})();
</script></body></html>`;
}

module.exports = { pageDialogue, nettoyer };
