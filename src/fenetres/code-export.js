'use strict';

/*
 * LE CODE À 6 CHIFFRES AVANT D'EXPORTER UN FICHIER — EN NATIF (2026-10-08)
 * =============================================================================
 * Sa décision : « oui fais le code pour les exportations de fichiers ». Le
 * palier 2c de la défense contre un intrus : une session volée, ou un poste
 * laissé ouvert, ne doit pas pouvoir SORTIR un fichier (clients, commandes,
 * comptabilité) en quelques clics.
 *
 * ⚠ LA FENÊTRE NE VÉRIFIE RIEN. Elle rend le code tapé (ou « annulé ») au
 * processus principal, qui le fait vérifier par le SERVEUR (op
 * `export_autoriser`, turso-proxy.php) et lui répond par `szCodeRefus` ou
 * `szCodeAccepte`. Une fenêtre qui jugerait le code serait un verrou dont la
 * clé est posée sur la porte.
 *
 * ⚠ L'AUTORISATION VAUT 5 MINUTES pour toutes les exportations : exporter
 * trois rapports d'affilée ne demande le code qu'une fois. La fenêtre le dit.
 *
 * ⚠ LE FOYER PART DANS LE CHAMP : c'est la seule chose à faire ici. Échap et
 * la croix annulent (« non » : rien n'est écrit).
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_DIRE, CSS_JOUR, TETE } = require('./socle.js');
const T = require('../langue').tr('code-export');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.85rem 1.05rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#1b2233,#0e1522)}
.tete h1{margin:0;font-weight:700;font-size:.98rem;line-height:1.3;font-family:inherit;color:var(--tx)}
.rond{flex:0 0 auto;width:30px;height:30px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  background:rgba(201,169,126,0.16);color:var(--tx-or2)}
.rond svg{width:17px;height:17px}
html.jour .rond{background:rgba(125,95,60,0.14);color:#6f5535}
.corps{flex:1 1 auto;min-height:0;overflow-y:auto;padding:1.05rem}
.q{margin:0;font-weight:600;font-size:.95rem;line-height:1.45;color:var(--tx)}
.quoi{margin:.5rem 0 0;font-size:.82rem;color:var(--tx2);word-break:break-all}
.quoi b{color:var(--tx);font-weight:600}
.champ{margin:.85rem 0 0;width:100%;font:600 1.35rem/1.2 ui-monospace,Consolas,monospace;
  letter-spacing:.45em;text-align:center;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:9px;padding:.55rem .6rem}
.champ:focus-visible{outline:2px solid #c9a97e;outline-offset:2px}
.note{margin:.7rem 0 0;font-size:.78rem;color:var(--tx2)}
.pied{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;
  padding:.7rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.ecart{flex:1 1 auto}
.msg{font-size:.78rem;color:var(--tx2);min-height:1em}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:9px;padding:.5rem .95rem;cursor:pointer;
  transition:background-color .13s ease,border-color .13s ease}
button:hover{background:var(--v10)}
button:focus-visible{outline:2px solid #c9a97e;outline-offset:2px}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover{background:#d8bc95}
button[disabled]{opacity:.55;cursor:wait}
@media (prefers-reduced-motion:reduce){button{transition:none}}
`;

/** `arg` : le nom du fichier demandé (facultatif — la boîte s'ouvre sans). */
function pageCodeExport(arg) {
  const quoi = String(arg || '').replace(/[<>&"]/g, '').slice(0, 120);
  return `${TETE('data-sans-plein')}
<title>${T("Code requis pour exporter")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete">
  <span class="rond"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"
    ><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>
  <h1>${T("Code requis pour exporter")}</h1>
</div>
<div class="corps" id="corps"></div>
<div class="pied" id="pied"></div>
<script>
${JS_DIRE()}
(function(){
  'use strict';
  var P = window.szPont;
  var D = ${JSON.stringify({ quoi })};
  var envoye = false;

  document.getElementById('corps').innerHTML =
    '<p class="q">${T("Entrez le code à 6 chiffres de votre application d’authentification pour enregistrer ce fichier.")}</p>'
    + (D.quoi ? ('<p class="quoi">${T("Fichier : ")}<b>' + D.quoi + '</b></p>') : '')
    + '<input class="champ" id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="${T("Code à 6 chiffres")}">'
    + '<p class="note">${T("Le code vaut 5 minutes pour toutes les exportations. Chaque exportation est inscrite au journal de sécurité.")}</p>';
  document.getElementById('pied').innerHTML =
    '<span class="msg" id="msg"></span><span class="ecart"></span>'
    + '<button type="button" id="non">${T("Annuler")}</button>'
    + '<button type="button" id="oui" class="prim">${T("Autoriser")}</button>';

  var champ = document.getElementById('code');
  var oui = document.getElementById('oui');
  var non = document.getElementById('non');

  function envoyer(code){
    if (envoye) return;
    try {
      if (!P || !P.codeExportReponse) { throw new Error('pont indisponible'); }
      envoye = true;
      if (code !== null) { oui.disabled = true; szDire('${T("Vérification du code…")}', ''); }
      P.codeExportReponse(code);
    } catch (e) {
      envoye = false;
      szDire('${T("La réponse n’a pas pu partir (")}' + ((e && e.message) || e) + '${T(") — fermez cette fenêtre et réessayez.")}', 'err');
    }
  }
  function valider(){
    var c = String(champ.value || '').replace(/[^0-9]/g, '');
    if (c.length !== 6) { szDire('${T("Le code a 6 chiffres.")}', 'err'); champ.focus(); return; }
    envoyer(c);
  }

  /* Les réponses du processus principal, une fois le SERVEUR consulté. */
  window.szCodeRefus = function(motif, restant){
    envoye = false;
    oui.disabled = false;
    champ.value = '';
    champ.focus();
    if (motif === 'code') szDire('${T("Code refusé. Essais restants : ")}' + (restant | 0), 'err');
    else if (motif === 'sans_code') szDire('${T("Ce compte n’a pas de second facteur : activez le code à 6 chiffres dans votre profil pour pouvoir exporter.")}', 'err');
    else if (motif === 'essais') { oui.disabled = true; szDire('${T("Trop de codes faux : la session est fermée. Reconnectez-vous.")}', 'err'); }
    else if (motif === 'session') szDire('${T("Votre session n’est plus active : reconnectez-vous, puis réessayez.")}', 'err');
    else szDire('${T("Le serveur n’a pas répondu. Vérifiez la connexion et réessayez.")}', 'err');
  };
  window.szCodeAccepte = function(){
    oui.disabled = true; non.disabled = true; champ.disabled = true;
    szDire('${T("Code accepté. Si le fichier ne s’est pas enregistré, relancez l’exportation : vous avez 5 minutes.")}', '');
  };

  oui.onclick = valider;
  non.onclick = function(){ envoyer(null); };
  champ.addEventListener('input', function(){ champ.value = String(champ.value || '').replace(/[^0-9]/g, '').slice(0, 6); });
  window.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { e.preventDefault(); envoyer(null); }
    else if (e.key === 'Enter') { e.preventDefault(); valider(); }
  });
  window.addEventListener('beforeunload', function(){ if (!envoye) { try { P && P.codeExportReponse && P.codeExportReponse(null); } catch (e) {} } });
  champ.focus();
})();
</script></body></html>`;
}

module.exports = { pageCodeExport };
