'use strict';

/*
 * FENÊTRE « STATISTIQUES (GOOGLE ANALYTICS) » — NATIVE (Configuration, palier 5)
 * =============================================================================
 * La configuration du suivi Google Analytics 4 : activation, ID de mesure,
 * ID de propriété, et la clé du compte de service (JSON). Le TABLEAU DE BORD
 * (visiteurs, pages vues…) vit dans la fenêtre « Statistiques » — ici, on ne
 * fait que régler l'accès.
 *
 * ⚠⚠ SECRET : la clé du compte de service (JSON) ne traverse PAS en clair — la
 * fenêtre ne reçoit qu'un booléen « configurée ». Un champ vide à l'écriture la
 * CONSERVE (conservation faite par le serveur, ga_save).
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .actif{margin-left:auto;display:inline-flex;align-items:center;gap:.45rem;cursor:pointer;
  font-weight:600;font-size:.82rem;-webkit-user-select:none;user-select:none}
.tete .actif input{accent-color:#c9a97e;cursor:pointer}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
/* ⚠ ANCRÉE = PLEINE PAGE : cartes en colonnes pour remplir la largeur. */
.zone{columns:32rem;column-gap:1.1rem}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;padding:1rem 1.1rem;
  margin:0 0 1.1rem;break-inside:avoid;-webkit-column-break-inside:avoid}
.info{background:rgba(80,120,190,.1);border:1px solid rgba(120,160,220,.28);color:#bcd2f0;
  border-radius:9px;padding:.7rem .85rem;font-size:.78rem;line-height:1.6;margin:0 0 1rem}
.info b{color:#dbe7fb}
.gr2{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
@media (max-width:640px){.gr2{grid-template-columns:1fr}}
.ch{margin:0 0 .8rem}.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.25rem;font-size:.76rem;color:var(--tx2)}
.ch input,.ch textarea{width:100%;font:inherit;font-size:.83rem;color:var(--tx);background:var(--f-champ);
  border:1px solid #2b3444;border-radius:8px;padding:.42rem .5rem}
.ch textarea{font-family:ui-monospace,Consolas,monospace;font-size:.76rem;resize:vertical;min-height:5rem}
.ch input:focus,.ch textarea:focus{outline:none;border-color:#c9a97e}
.ch input:disabled,.ch textarea:disabled{opacity:.55}
.ch .etat{font-size:.72rem;color:var(--tx2);margin-top:.25rem}
.ch .etat b{color:var(--tx-ok)}
.ch .etat.non b{color:var(--tx-jaune)}
.ch .aide{font-size:.7rem;color:var(--tx3);margin-top:.2rem}
.bascule{display:inline-flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.85rem;
  -webkit-user-select:none;user-select:none}
.bascule input{accent-color:#c9a97e;cursor:pointer}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;
  border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button.prim{font:inherit;background:#c9a97e;border:1px solid #c9a97e;color:#1a1208;font-weight:700;
  border-radius:8px;padding:.42rem .9rem;cursor:pointer}
button.prim:hover:not(:disabled){background:#d8bd97}
button.prim:disabled{opacity:.5;cursor:default}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;border:1px solid var(--v16);
  border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.mini:hover:not(:disabled){background:var(--v11)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageAnalytics() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Statistiques — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.analytics}</span><h1>Statistiques (Google Analytics)</h1>
  <label class="actif"><input type="checkbox" id="a-enabled"> Actif</label></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="corps"><div class="zone" id="corps"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>Enregistrer</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; t.appendChild(b); }
    if (actif) { b.textContent='⧉ Détacher'; b.title='Ouvrir cet écran dans sa propre fenêtre'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='⚓ Ancrer'; b.title='Ramener cet écran dans la fenêtre principale'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bsave = document.getElementById('b-save');
  var enabledEl = document.getElementById('a-enabled');
  var D = null, C = null, RO = false, OCCUPE = false;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function val(id){ var e=document.getElementById(id); return e ? String(e.value).trim() : ''; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:'Votre rôle est en lecture seule.',
    indisponible:"L'administration n'est pas encore chargée dans la fenêtre principale.",
    pont_indisponible:'La fenêtre principale ne répond pas.',
    delai:"La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    json_invalide:'La clé du compte de service n’est pas un JSON valide.',
    json_incomplet:'La clé JSON doit contenir « client_email » et « private_key ».',
    nuage:"L'enregistrement dans le nuage a échoué. Réessayez.",
    echec:"L'opération a échoué.",
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('Erreur inattendue ('+esc(m||'?')+').'))+(r&&r.detail?' ('+esc(r.detail)+')':''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }
  function occuper(o){ OCCUPE = o; bsave.disabled = o || RO; }

  function badge(has){
    return has ? '<span class="etat"><span class="ic">🔒</span> Clé <b>enregistrée</b>. Vide = conservée.</span>'
               : '<span class="etat non">Aucune clé <b>enregistrée</b>.</span>';
  }
  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    enabledEl.checked = !!C.enabled; enabledEl.disabled = RO;
    var dis = RO ? ' disabled' : '';
    var h = '<div class="carte"><div class="info">'
      + '<span class="ic">📊</span> Suit les <b>consultations</b> de la boutique via <b>Google Analytics 4</b>. Prérequis :<br>'
      + '1. Créer une propriété <b>GA4</b> → noter l’<b>ID de mesure</b> (G-XXXX) et l’<b>ID de propriété</b> (numérique).<br>'
      + '2. Dans <b>Google Cloud</b> : créer un <b>compte de service</b>, activer l’API « Google Analytics Data », télécharger sa <b>clé JSON</b>.<br>'
      + '3. Dans GA4 → Admin → Accès à la propriété : ajouter l’e-mail du compte de service comme <b>Lecteur</b>.'
      + '</div>';
    h += '<div class="gr2">'
      + '<div class="ch"><label>ID de mesure (balise gtag)</label><input id="a-mid" value="' + esc(C.measurementId||'') + '" placeholder="G-XXXXXXXXXX"' + dis + '></div>'
      + '<div class="ch"><label>ID de propriété GA4 (numérique)</label><input id="a-pid" value="' + esc(C.propertyId||'') + '" placeholder="123456789"' + dis + '></div>'
      + '</div>';
    h += '<div class="ch"><label>Clé du compte de service (JSON)</label>'
      + '<textarea id="a-sa" rows="5" placeholder="' + (C.hasServiceAccount ? 'inchangée (laisser vide pour conserver la clé existante)' : 'Collez ici tout le contenu du fichier JSON téléchargé de Google Cloud') + '"' + dis + '></textarea>'
      + badge(!!C.hasServiceAccount)
      + '<div class="aide">La clé est stockée côté serveur et n’est jamais renvoyée à l’écran.</div></div>';
    h += '</div><div class="carte"><div class="info" style="margin:0"><span class="ic">📈</span> Le <b>tableau de bord</b> (visiteurs, pages vues, sources…) s’ouvre dans la fenêtre <b>Statistiques</b> (menu Marketing).</div></div>';
    corps.innerHTML = h;
    bsave.disabled = RO || OCCUPE;
  }

  enabledEl.onchange = function(){ if (!RO) C.enabled = enabledEl.checked; };

  function enregistrer(){
    if (RO || OCCUPE) return;
    occuper(true); dire('Enregistrement…');
    var saisie = { enabled: !!enabledEl.checked, measurementId: val('a-mid'),
      propertyId: val('a-pid'), serviceAccountJson: val('a-sa') };
    appeler('config:analytics:ecrire', [saisie]).then(function(r){
      occuper(false);
      if (r && r.ok) { D = r; C = r.cfg || {}; RO = !r.peutModifier; dessiner(); dire('Statistiques enregistrées.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }
  bsave.onclick = enregistrer;

  function charger(){
    dire('Lecture…');
    appeler('config:analytics:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + expliquer(r) + '</div>'; dire(expliquer(r), 'err'); return; }
      D = r; C = r.cfg || {}; RO = !r.peutModifier; dessiner(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageAnalytics };
