'use strict';

/*
 * FENÊTRE « FACTURES » — NATIVE
 * =============================================================================
 * La LISTE des factures, en fenêtre de consultation : recherche, filtre par
 * statut, pagination locale. Cliquer une ligne ouvre la facture dans SA
 * fenêtre native (une par facture, celle qui existe déjà — factures:ouvrir).
 * AUCUNE écriture ici : encaisser, annuler ou renvoyer une facture reste le
 * travail de l'écran Facturation.
 *
 * ⚠ LA LISTE SE CHARGE UNE FOIS (factures:liste, lignes allégées — jamais les
 * articles) puis se filtre ICI, à chaque frappe, sans repasser par le pont.
 * L'écran se tient à jour tout seul (szActualiser après une vente, un
 * remboursement, un statut) — mais JAMAIS pendant une saisie dans la recherche.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE } = require('./socle.js');

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
input[type=search],select,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
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
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.16);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:#8fa1b8}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Factures ». */
function pageFactures() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Factures — Administration Sandriza</title>
<style>${CSS}</style></head><body>
<div class="tete"><span class="ic">🧾</span><h1>Factures</h1>
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

  var LIGNES = null;       // toutes les lignes (factures:liste), filtrees ici
  var Q = '';              // texte de recherche
  var STATUT = '';         // '' = tous
  var PAGE = 0;
  var PAR_PAGE = 25;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ msg.className = 'msg' + (cl ? ' ' + cl : ''); msg.textContent = t || ''; }
  function fmt(n){
    try { return (Number(n) || 0).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }); }
    catch (e) { return (Number(n) || 0).toFixed(2) + ' $'; }
  }
  function fmtDate(d){
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch (e) { return String(d || ''); }
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux factures.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette facture n’existe plus.',
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

  function pilule(statut, libelle){
    var ton = { paid: 'bon', demo: 'bon', unpaid: 'att', overdue: 'err', cancelled: 'err' }[statut] || 'neutre';
    return '<span class="pill ' + ton + '">' + esc(libelle || statut) + '</span>';
  }

  function filtrees(){
    var q = Q.trim().toLowerCase();
    return (LIGNES || []).filter(function(r){
      if (STATUT && r.statut !== STATUT) return false;
      if (!q) return true;
      return (String(r.numero) + ' ' + String(r.commande) + ' ' + String(r.client))
        .toLowerCase().indexOf(q) !== -1;
    });
  }

  function dessiner(){
    if (!LIGNES) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var rows = filtrees();
    var pages = Math.max(1, Math.ceil(rows.length / PAR_PAGE));
    var p = Math.min(Math.max(0, PAGE), pages - 1);
    PAGE = p;
    var vue = rows.slice(p * PAR_PAGE, p * PAR_PAGE + PAR_PAGE);

    var h = '<div class="barreoutils">'
      + '<input type="search" id="f-q" placeholder="Numéro, commande ou client…" value="' + esc(Q) + '">'
      + '<select id="f-statut">'
      + '<option value=""' + (STATUT === '' ? ' selected' : '') + '>Tous les statuts</option>'
      + '<option value="paid"' + (STATUT === 'paid' ? ' selected' : '') + '>Payée</option>'
      + '<option value="unpaid"' + (STATUT === 'unpaid' ? ' selected' : '') + '>Non payée</option>'
      + '<option value="overdue"' + (STATUT === 'overdue' ? ' selected' : '') + '>En retard</option>'
      + '<option value="cancelled"' + (STATUT === 'cancelled' ? ' selected' : '') + '>Annulée</option>'
      + '</select>'
      + '<span class="droite">' + rows.length + ' facture' + (rows.length > 1 ? 's' : '') + '</span>'
      + '</div>';

    h += '<div class="carte">';
    if (!vue.length) {
      h += '<div class="vide">Aucune facture ne correspond.</div>';
    } else {
      h += '<table><thead><tr><th>Numéro</th><th>Commande</th><th>Client</th>'
        + '<th>Échéance</th><th>Total</th><th>Statut</th></tr></thead><tbody>'
        + vue.map(function(r){
            return '<tr data-id="' + esc(r.id) + '" title="Ouvrir la facture">'
              + '<td><span class="num">' + esc(r.numero) + '</span>'
              + '<div class="dt">' + esc(fmtDate(r.date)) + '</div></td>'
              + '<td>' + esc(r.commande || '—') + '</td>'
              + '<td>' + esc(r.client || '—') + '</td>'
              + '<td>' + esc(fmtDate(r.echeance)) + '</td>'
              + '<td>' + esc(fmt(r.total)) + '</td>'
              + '<td>' + pilule(r.statut, r.statutLibelle) + '</td></tr>';
          }).join('')
        + '</tbody></table>';
      if (pages > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="f-prec"' + (p <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (p + 1) + ' / ' + pages + '</span>'
          + '<button class="mini" id="f-suiv"' + (p >= pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';
    corps.innerHTML = h;

    var q = document.getElementById('f-q');
    if (q) {
      q.oninput = function(){ Q = q.value; PAGE = 0; redessinerSansPerdreLaSaisie(); };
    }
    var s = document.getElementById('f-statut');
    if (s) s.onchange = function(){ STATUT = s.value; PAGE = 0; dessiner(); };
    var bp = document.getElementById('f-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, PAGE - 1); dessiner(); };
    var bs = document.getElementById('f-suiv');
    if (bs) bs.onclick = function(){ PAGE = PAGE + 1; dessiner(); };
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS : a chaque frappe on ne
     reecrit que la carte des resultats, pas la barre d outils — le curseur et
     la selection restent ou ils sont. */
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

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
    dire('Ouverture…');
    appeler('factures:ouvrir', [tr.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? 'Facture ouverte dans sa fenêtre.' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  function charger(){
    appeler('factures:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Factures indisponibles', expliquer(r)); return; }
      LIGNES = r.lignes || [];
      dire('');
      dessiner();
    });
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : une vente, un remboursement ou
     un statut de commande font relire la liste sans geste — mais jamais
     pendant une saisie dans la recherche (on redessinerait sous les doigts). */
  window.szActualiser = function(){
    var q = document.getElementById('f-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  // Ramenee au premier plan par le menu ou << Tout voir >> : la liste se relit.
  window.szRevenir = function(){ charger(); };

  /* ── MODE ANCRE (1.55.0) ── Le meme bouton que les autres ecrans : detacher
     la vue ancree, ou RAMENER la vue detachee dans la fenetre principale. */
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

module.exports = { pageFactures };
