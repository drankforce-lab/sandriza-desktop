'use strict';

/*
 * FENÊTRE « HEURES D'OUVERTURE » — NATIVE (Configuration, palier 5)
 * =============================================================================
 * Le PREMIER onglet de Configuration porté en fenêtre native. Un formulaire
 * simple, sans secret : l'horaire de la boutique, affiché dans le pied de page.
 *
 * ⚠ AUCUNE RÈGLE ICI. La fenêtre lit (`config:heures:donnees`) et écrit
 * (`config:heures:ecrire`) par le pont ; c'est le cœur `Admin._hoursEcrire` qui
 * VALIDE et NORMALISE les sept jours et qui persiste en Turso. La fenêtre ne fait
 * que présenter et transmettre — si elle envoyait n'importe quoi, le cœur le
 * corrige. Le droit d'écriture (`config:edit`) est décidé au cœur, jamais ici.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:1rem 1.1rem;max-width:44rem}
.chef{display:flex;align-items:flex-start;gap:1rem;flex-wrap:wrap;margin-bottom:1rem}
.chef p{margin:.15rem 0 0;font-size:.8rem;color:#8fa1b8;max-width:32rem}
.chef .bascule{margin-left:auto;display:flex;align-items:center;gap:.5rem;font-size:.8rem;color:#8fa1b8}
label{cursor:pointer}
input[type=checkbox]{accent-color:#c9a97e;width:1.1rem;height:1.1rem;cursor:pointer}
input[type=time]{font:inherit;color:#e8edf5;background:#0f1724;border:1px solid #2b3444;
  border-radius:8px;padding:.3rem .5rem;width:9rem}
input[type=time]:disabled{opacity:.4}
table{width:100%;border-collapse:collapse;font-size:.86rem}
th{text-align:left;padding:.4rem .5rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;border-bottom:1px solid rgba(255,255,255,.12)}
th.c,td.c{text-align:center}
td{padding:.45rem .5rem;border-bottom:1px solid rgba(255,255,255,.06)}
td.jour{font-weight:600}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.4rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
.vide{padding:1.1rem .6rem;text-align:center;color:#8fa1b8;font-size:.82rem}
.ro{margin:0 0 .8rem;border:1px solid rgba(240,180,80,.35);background:rgba(200,140,40,.1);
  color:#f0d6a0;border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageHeures() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Heures d’ouverture — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🕐</span><h1>Heures d’ouverture</h1>
  <span class="sous">Heure de l’Est — Montréal / Québec</span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>Enregistrer</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bsave = document.getElementById('b-save');
  var CFG = null, RO = false;
  var JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule : les heures ne peuvent pas être modifiées.',
    indisponible:       'La configuration n’est pas prête dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    nuage:              'L’enregistrement dans le nuage a échoué. Réessayez.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').'))
      + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  function dessiner(){
    var days = (CFG && CFG.days) || [];
    var h = [];
    if (RO) { h.push('<div class="ro">Lecture seule : vous pouvez consulter les heures, pas les modifier.</div>'); }
    h.push('<div class="carte">');
    h.push('<div class="chef"><div><strong>Afficher les heures dans le pied de page</strong>'
      + '<p>Statut « ouvert / fermé » calculé en temps réel à l’heure de l’Est.</p></div>'
      + '<label class="bascule"><input type="checkbox" id="h-on"' + (CFG && CFG.enabled ? ' checked' : '')
      + (RO ? ' disabled' : '') + '> Afficher</label></div>');
    h.push('<table><thead><tr><th>Jour</th><th>Ouverture</th><th>Fermeture</th>'
      + '<th class="c">Fermé ce jour</th></tr></thead><tbody>');
    JOURS.forEach(function(nom, i){
      var d = days[i] || {};
      var fer = !!d.closed, dis = (RO || fer) ? ' disabled' : '';
      h.push('<tr>'
        + '<td class="jour">' + esc(nom) + '</td>'
        + '<td><input type="time" id="h-o' + i + '" value="' + esc(d.open || '') + '"' + dis + '></td>'
        + '<td><input type="time" id="h-c' + i + '" value="' + esc(d.close || '') + '"' + dis + '></td>'
        + '<td class="c"><input type="checkbox" id="h-x' + i + '"' + (fer ? ' checked' : '')
        + (RO ? ' disabled' : '') + '></td>'
        + '</tr>');
    });
    h.push('</tbody></table></div>');
    corps.innerHTML = h.join('');
    // Fermer un jour grise ses heures, sur-le-champ.
    JOURS.forEach(function(nom, i){
      var x = document.getElementById('h-x' + i);
      if (x) x.onchange = function(){
        var o = document.getElementById('h-o' + i), c = document.getElementById('h-c' + i);
        if (o) o.disabled = x.checked; if (c) c.disabled = x.checked;
      };
    });
    bsave.disabled = RO;
  }

  function lire(){
    var days = JOURS.map(function(nom, i){
      var x = document.getElementById('h-x' + i);
      return {
        closed: !!(x && x.checked),
        open: (document.getElementById('h-o' + i) || {}).value || '',
        close: (document.getElementById('h-c' + i) || {}).value || ''
      };
    });
    var on = document.getElementById('h-on');
    return { enabled: !!(on && on.checked), days: days };
  }

  function enregistrer(){
    if (RO) return;
    bsave.disabled = true;
    dire('Enregistrement…');
    appeler('config:heures:ecrire', [lire()]).then(function(r){
      bsave.disabled = false;
      if (r && r.ok) { CFG = r.cfg || CFG; dire('Heures enregistrées.', 'bon'); }
      else { dire(expliquer(r), 'err'); }
    });
  }
  bsave.onclick = enregistrer;

  function charger(){
    dire('Lecture…');
    appeler('config:heures:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      CFG = r.cfg || { enabled: false, days: [] };
      RO = !r.peutModifier;
      dessiner();
      dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageHeures };
