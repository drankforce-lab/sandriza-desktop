'use strict';

/*
 * FENÊTRE « FOURNISSEURS » — NATIVE
 * =============================================================================
 * La liste des fournisseurs : recherche (nom, contact, courriel), catégories,
 * statut. Cliquer une ligne ouvre la FICHE FOURNISSEUR native
 * (fournisseurs:ouvrir) ; « + Nouveau fournisseur » ouvre l'assistant vierge.
 * AUCUNE écriture ici : la suppression reste un geste de l'écran du site.
 *
 * ⚠ LA RECHERCHE VIT DANS LE SITE (le cœur Admin._fournisseursDonnees) : la
 * fenêtre envoie son filtre et reçoit les lignes allégées.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, CSS_JOUR } = require('./socle.js');

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
.tete .ic{font-size:1.05rem}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
input[type=search],button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:rgba(255,255,255,.04)}
tbody td{padding:.34rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap;
  margin-right:.2rem}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Fournisseurs ». */
function pageFournisseurs() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Fournisseurs — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🏭</span><h1>Fournisseurs</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;
  var Q = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var _direT = null;
  function dire(t, cl){
    msg.className = 'msg' + (cl ? ' ' + cl : ''); msg.textContent = t || '';
    clearTimeout(_direT);
    /* Un message de SUCCES s'efface seul apres quelques secondes : il restait
       sinon a l'ecran pour toujours (2026-08-09, << Facture ouverte dans sa
       fenetre >>). Les ERREURS restent : on doit pouvoir les lire. */
    if (t && cl === 'bon') _direT = setTimeout(function(){
      if (msg.textContent === t) { msg.textContent = ''; msg.className = 'msg'; }
    }, 4000);
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux fournisseurs.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette fiche n’existe plus.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var rows = D.lignes || [];
    var h = '<div class="barreoutils">'
      + '<input type="search" id="f-q" placeholder="Nom, contact ou courriel…" value="' + esc(Q) + '">'
      + '<span class="droite">' + (D.total || 0) + ' au total'
      + '<button class="prim" id="f-nouveau">+ Nouveau fournisseur</button></span>'
      + '</div>';
    h += '<div class="carte">';
    if (!rows.length) {
      h += '<div class="vide">' + (D.total ? 'Aucun résultat.' : 'Aucun fournisseur — créez-en un pour commencer.') + '</div>';
    } else {
      h += '<table><thead><tr><th>Fournisseur</th><th>Contact</th><th>Courriel / Tél.</th>'
        + '<th>Catégories</th><th>Statut</th></tr></thead><tbody>'
        + rows.map(function(r){
            return '<tr data-id="' + esc(r.id) + '" title="Ouvrir la fiche fournisseur">'
              + '<td><span class="num">' + esc(r.nom) + '</span>'
              + (r.site ? '<div class="dt">' + esc(r.site) + '</div>' : '') + '</td>'
              + '<td>' + esc(r.contact || '—') + '</td>'
              + '<td>' + esc(r.courriel || '—')
              + (r.telephone ? '<div class="dt">' + esc(r.telephone) + '</div>' : '') + '</td>'
              + '<td>' + ((r.categories || []).map(function(c){
                  return '<span class="pill neutre">' + esc(c) + '</span>'; }).join('') || '—') + '</td>'
              + '<td>' + (r.actif ? '<span class="pill bon">Actif</span>' : '<span class="pill neutre">Inactif</span>') + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';
    corps.innerHTML = h;

    var q = document.getElementById('f-q');
    if (q) {
      q.oninput = function(){
        Q = q.value;
        clearTimeout(window._fq);
        window._fq = setTimeout(function(){ charger(true); }, 300);
      };
    }
    var nv = document.getElementById('f-nouveau');
    if (nv) nv.onclick = function(){
      dire('Ouverture…');
      appeler('fournisseurs:nouveau', []).then(function(r){
        dire(r.ok ? 'Assistant fournisseur ouvert dans sa fenêtre.' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('button') || t.closest('input')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
    dire('Ouverture…');
    appeler('fournisseurs:ouvrir', [tr.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? 'Fiche fournisseur ouverte dans sa fenêtre.' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('fournisseurs:liste', [{ q: Q }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('Fournisseurs indisponibles', expliquer(r)); return; }
      D = r;
      dire('');
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('f-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('f-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  window.szActualiser = function(){
    var q = document.getElementById('f-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans. */
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);'
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '⧉ Détacher';
      b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '⚓ Ancrer';
      b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageFournisseurs };
