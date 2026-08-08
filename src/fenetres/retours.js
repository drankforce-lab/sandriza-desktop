'use strict';

/*
 * FENÊTRE « NOS RETOURS » — NATIVE
 * =============================================================================
 * La liste des demandes de retour : les neuf onglets de statut avec compteurs
 * (la sémantique — « complétées » = remboursées + complétées, « expire
 * bientôt » — vit dans le cœur du site, Admin._retoursDonnees), la recherche
 * (nom, courriel, numéro de commande), l'alerte d'expiration. Cliquer une
 * ligne ouvre la FENÊTRE DE RETOUR native (retours:ouvrir). AUCUNE écriture
 * ici : approuver, rembourser, marquer reçu sont des gestes de la fenêtre.
 *
 * ⚠ retours:liste ATTEND LA RESYNCHRONISATION des demandes avant de répondre
 * (le site relit le nuage, comme son écran) : le premier chargement peut
 * prendre quelques secondes — c'est la fraîcheur, pas une panne.
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
.barreoutils{flex:0 0 auto;display:flex;gap:.4rem;align-items:center;flex-wrap:wrap}
input[type=search],button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px;margin-left:auto}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
button .n.hi{background:rgba(245,158,11,.25);color:#fbbf24}
.ligne{display:flex;align-items:center;gap:.8rem;padding:.6rem .75rem;cursor:pointer;
  background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px}
.ligne:hover{border-color:#c9a97e}
.ligne .gauche{flex:1 1 auto;min-width:0}
.ligne .haut{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}
.ligne .num{font-weight:700}
.ligne .dt{font-size:.72rem;color:#8fa1b8}
.ligne .droite{flex:0 0 auto;text-align:right;font-size:.74rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.16);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pill.info{background:rgba(59,130,246,.16);color:#93c5fd}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Nos Retours ». */
function pageRetours() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Nos Retours — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">↩</span><h1>Nos Retours</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement… (les demandes se resynchronisent)</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;
  var ONGLET = 'pending';
  var Q = '';

  var ONGLETS = [
    ['pending', 'En attente'], ['approved', 'Approuvées'], ['in_transit', 'En transit'],
    ['expiring_soon', 'Expire bientôt'], ['received', 'Reçues'], ['disputed', 'À analyser'],
    ['rejected', 'Rejetées'], ['completed', 'Complétées'], ['all', 'Toutes']
  ];
  var TONS = { pending: 'att', approved: 'bon', in_transit: 'info', received: 'att',
    refunded: 'bon', completed: 'bon', rejected: 'err', disputed: 'err', awaiting_photo: 'neutre' };

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
  function fmtDate(d){
    try { return new Date(d).toLocaleDateString('fr-CA'); } catch (e) { return String(d || ''); }
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux retours.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette demande n’existe plus.',
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
    if (!D) { corps.innerHTML = '<div class="vide">Chargement… (les demandes se resynchronisent)</div>'; return; }
    var c = D.comptes || {};
    var h = '<div class="barreoutils">'
      + ONGLETS.map(function(o){
          var n = c[o[0]] || 0;
          return '<button class="mini' + (ONGLET === o[0] ? ' actif' : '') + '" data-onglet="' + o[0] + '">'
            + o[1] + '<span class="n' + (o[0] === 'pending' && n > 0 ? ' hi' : '') + '">' + n + '</span></button>';
        }).join('')
      + '<input type="search" id="r-q" placeholder="Nom, courriel, n° commande…" value="' + esc(Q) + '">'
      + '</div>';

    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">Aucune demande' + (ONGLET !== 'all' ? ' dans cette catégorie' : '') + '.</div>';
    } else {
      h += rows.map(function(r){
        var badges = '<span class="pill ' + (TONS[r.statut] || 'neutre') + '">' + esc(r.statutLibelle) + '</span>';
        if (r.expireAuto) badges += ' <span class="pill err">Expirée automatiquement</span>';
        if (r.expireBientot) badges += ' <span class="pill err">⏳ Expire le ' + esc(r.expireLe) + '</span>';
        if (r.suivi) badges += ' <span class="pill neutre">📦 ' + esc(r.suivi) + '</span>';
        if (r.etiquette === 'reelle') badges += ' <span class="pill info">🏷️ Étiquette réelle</span>';
        else if (r.etiquette === 'generee') badges += ' <span class="pill info">🏷️ Étiquette générée</span>';
        if (r.fraisBoutique) badges += ' <span class="pill info">Frais pris en charge</span>';
        return '<div class="ligne" data-id="' + esc(r.id) + '" title="Ouvrir la demande de retour">'
          + '<div class="gauche">'
          + '<div class="haut"><span class="num">' + esc(r.commande) + '</span>' + badges + '</div>'
          + '<div class="dt"><strong>' + esc(r.client) + '</strong>'
          + (r.courriel ? ' · ' + esc(r.courriel) : '') + '</div>'
          + '<div class="dt">Motif : ' + esc(r.motif || '–') + '</div>'
          + '</div>'
          + '<div class="droite">' + esc(fmtDate(r.date)) + '</div>'
          + '</div>';
      }).join('');
    }
    corps.innerHTML = h;

    var q = document.getElementById('r-q');
    if (q) {
      q.oninput = function(){
        Q = q.value;
        clearTimeout(window._rq);
        window._rq = setTimeout(function(){ charger(true); }, 300);
      };
    }
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); charger(); return; }
    if (t.closest('button') || t.closest('input')) return;
    var li = t.closest('.ligne[data-id]');
    if (!li) return;
    dire('Ouverture…');
    appeler('retours:ouvrir', [li.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? 'Demande ouverte dans sa fenêtre.' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('retours:liste', [{ onglet: ONGLET, q: Q }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('Retours indisponibles', expliquer(r)); return; }
      D = r;
      dire('');
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('r-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('r-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : un retour enregistré, reçu ou
     finalisé fait relire la liste — jamais pendant une saisie. */
  window.szActualiser = function(){
    var q = document.getElementById('r-q');
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

module.exports = { pageRetours };
