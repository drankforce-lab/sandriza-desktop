'use strict';

/*
 * FENÊTRE « AUTOMATISATIONS » — NATIVE (Communications, palier 5)
 * =============================================================================
 * Les tâches planifiées (cron) exécutées par un planificateur externe gratuit :
 * on copie l'URL de chaque tâche dans le planificateur, on choisit le courriel
 * destinataire pour celles qui en ont un, et on coche les métriques du courriel
 * de statistiques.
 *
 * ⚠ PAS DE SECRET : les jetons des URL sont des constantes du client (déjà
 * publiques dans le bundle) — ils sont là POUR être copiés.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.intro{flex:0 0 auto;padding:.75rem 1.05rem .2rem;font-size:.8rem;color:var(--tx2);line-height:1.5}
.corps{flex:1 1 auto;min-height:0;padding:.7rem 1.05rem .9rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.8rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.85rem 1rem}
.th{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin:0 0 .3rem}
.th .em{font-size:1.05rem;filter:grayscale(1) brightness(1.55);opacity:.9}
.th .nom{font-weight:700;font-size:.9rem}
.pill{font-size:.68rem;color:var(--tx2);background:var(--f-pill);border:1px solid var(--v08);
  border-radius:99px;padding:.1rem .5rem}
.desc{font-size:.8rem;color:var(--tx2);margin:0 0 .5rem}
.reco{font-size:.76rem;color:var(--tx-bleute);background:var(--f-pill);border-left:3px solid #c9a97e;
  border-radius:0 7px 7px 0;padding:.4rem .6rem;margin:0 0 .7rem}
.rangee{display:flex;gap:.5rem;align-items:flex-end;flex-wrap:wrap;margin:0 0 .6rem}
.ch{flex:1 1 16rem;min-width:0}
.ch.plein{flex:1 1 100%}
.ch label{display:block;margin-bottom:.22rem;font-size:.73rem;color:var(--tx2)}
.ch input{width:100%;font:inherit;font-size:.82rem;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:8px;padding:.4rem .5rem}
.ch input.mono{font-family:ui-monospace,Consolas,monospace;font-size:.76rem}
.ch input:focus{outline:none;border-color:#c9a97e}
.ch input:disabled{opacity:.55}
.metriques{border-top:1px solid var(--v08);margin-top:.4rem;padding-top:.6rem}
.metriques .t{font-size:.78rem;font-weight:700;margin:0 0 .1rem}
.metriques .s{font-size:.72rem;color:var(--tx3);margin:0 0 .5rem}
.mgrille{display:grid;grid-template-columns:repeat(auto-fill,minmax(13rem,1fr));gap:.25rem .8rem;margin:0 0 .6rem}
.mgrille label{display:flex;align-items:center;gap:.45rem;font-size:.8rem;cursor:pointer;
  -webkit-user-select:none;user-select:none}
.mgrille input{accent-color:#c9a97e;cursor:pointer}
button{font:inherit;font-size:.8rem;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.36rem .7rem;cursor:pointer;white-space:nowrap}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
.pied{flex:0 0 auto;display:flex;align-items:center;padding:.5rem 1.05rem;
  border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageAutomations() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Automatisations — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.config}</span><h1>Automatisations</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="intro">Chaque tâche s'exécute par un planificateur externe gratuit (cron-job.org). Copiez son URL dans le planificateur ; définissez le courriel destinataire pour celles qui en ont un.</div>
<div class="corps" id="corps"><div class="carte"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── le meme bouton d'ancrage/detachement que les autres ecrans. */
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id = 'sz-detacher'; b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
      t.appendChild(b); }
    if (actif) { b.textContent = '⧉ Détacher'; b.onclick = function(){ if (P && P.detacher) P.detacher(); }; }
    else { b.textContent = '⚓ Ancrer'; b.onclick = function(){ if (P && P.ancrer) P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var D = null, RO = false, OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session: 'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit: 'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule: 'Votre rôle est en lecture seule.',
    introuvable: 'Cette tâche n’existe plus.',
    indisponible: 'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible: 'La fenêtre principale ne répond pas.',
    delai: 'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    echec: 'L’opération a échoué.'
  };
  function expliquer(r){ var m = r && r.motif;
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').')) + (r && r.detail ? ' (' + esc(r.detail) + ')' : ''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }

  function badgeDest(rec){
    if (rec === 'perStaff')    return '<span class="pill">à chaque membre concerné</span>';
    if (rec === 'perCustomer') return '<span class="pill">au client concerné</span>';
    if (rec === 'none')        return '<span class="pill">aucun courriel</span>';
    return '';
  }

  function carteHtml(j){
    var h = '<div class="carte"><div class="th"><span class="em">' + (j.icon || '⚙️') + '</span>'
      + '<span class="nom">' + esc(j.name) + '</span>'
      + '<span class="pill">' + esc(j.schedule) + '</span>' + badgeDest(j.recipient) + '</div>';
    h += '<p class="desc">' + esc(j.desc) + '</p>';
    if (j.recommendation) h += '<div class="reco"><span class="ic">💡</span> Fréquence recommandée : ' + esc(j.recommendation) + '</div>';
    if (j.recipient === 'single') {
      h += '<div class="rangee"><div class="ch"><label>Courriel destinataire</label>'
        + '<input id="em-' + j.key + '" value="' + esc(j.email) + '" placeholder="Vide = courriel professionnel"'
        + (RO ? ' disabled' : '') + '></div>'
        + '<button class="prim" data-email="' + j.key + '"' + (RO ? ' disabled' : '') + '>Enregistrer</button></div>';
    }
    if (j.key === 'stats' && D.statsMetrics && D.statsMetrics.length) {
      h += '<div class="metriques"><div class="t"><span class="ic">📋</span> Métriques du courriel</div>'
        + '<div class="s">Cochez ce que vous voulez recevoir (données de la veille).</div><div class="mgrille">'
        + D.statsMetrics.map(function(m){ return '<label><input type="checkbox" id="mt-' + m.key + '"'
            + (m.actif ? ' checked' : '') + (RO ? ' disabled' : '') + '> ' + esc(m.label) + '</label>'; }).join('')
        + '</div><button class="prim" id="b-stats"' + (RO ? ' disabled' : '') + '>Enregistrer les métriques</button></div>';
    }
    h += '<div class="rangee" style="margin:0"><div class="ch plein"><label>URL à configurer ('
      + esc(String(j.schedule).toLowerCase()) + ')</label>'
      + '<input class="mono" readonly value="' + esc(j.url) + '" data-url="1"></div>'
      + '<button data-copier="' + esc(j.url) + '"><span class="ic">📋</span> Copier</button></div>';
    return h + '</div>';
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    var jobs = (D && D.jobs) || [];
    corps.innerHTML = jobs.length ? jobs.map(carteHtml).join('')
      : '<div class="carte"><div class="vide">Aucune tâche.</div></div>';
    brancher();
  }

  function brancher(){
    corps.querySelectorAll('[data-copier]').forEach(function(b){
      b.onclick = function(){ copier(b.getAttribute('data-copier')); };
    });
    corps.querySelectorAll('[data-email]').forEach(function(b){
      b.onclick = function(){ enregistrerEmail(b.getAttribute('data-email')); };
    });
    corps.querySelectorAll('[data-url]').forEach(function(i){ i.onclick = function(){ i.select(); }; });
    var st = document.getElementById('b-stats'); if (st) st.onclick = enregistrerStats;
  }

  function copier(url){
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function(){ dire('URL copiée.', 'bon'); },
          function(){ dire('Copie impossible — sélectionnez et copiez à la main.', 'att'); });
      } else { dire('Sélectionnez le champ et copiez à la main.', 'att'); }
    } catch (e) { dire('Copie impossible.', 'err'); }
  }

  function enregistrerEmail(key){
    if (RO || OCCUPE) return;
    OCCUPE = true; dire('Enregistrement…');
    appeler('config:automations:email', [{ key: key, email: val('em-' + key) }]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) { D = r; RO = !r.peutModifier; dire('Courriel enregistré.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  function enregistrerStats(){
    if (RO || OCCUPE) return;
    var actifs = {};
    (D.statsMetrics || []).forEach(function(m){ var e = document.getElementById('mt-' + m.key); actifs[m.key] = !!(e && e.checked); });
    OCCUPE = true; dire('Enregistrement…');
    appeler('config:automations:stats', [actifs]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) { D = r; RO = !r.peutModifier; dire('Métriques enregistrées.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  function charger(){
    dire('Lecture…');
    appeler('config:automations:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err'); return;
      }
      D = r; RO = !r.peutModifier; dessiner(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageAutomations };
