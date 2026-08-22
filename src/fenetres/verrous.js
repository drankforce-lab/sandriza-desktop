'use strict';

/*
 * FENÊTRE « VERROUS » — NATIVE (#35)
 * =============================================================================
 * Sortie de la fenêtre Journaux, et c'est tout l'objet de ce module.
 *
 * ⚠⚠ UN VERROU N'EST PAS UNE ARCHIVE, C'EST UN ÉTAT VIVANT. Les Journaux
 * répondent à « qu'est-ce qui s'est passé ? » — on les consulte après coup, on
 * ne les regarde pas changer. Les verrous répondent à « qui travaille sur quoi
 * EN CE MOMENT ? ». Rangé parmi les journaux, l'écran était figé : il fallait
 * cliquer « Actualiser » pour voir la vérité, et un verrou libéré entre-temps
 * restait affiché comme s'il bloquait encore.
 *
 * Il se rafraîchit donc TOUT SEUL, toutes les 3 s — comme les cadenas des
 * listes (#22) et le tableau de bord (#38).
 *
 * ⚠ SUPER-ADMINISTRATEUR SEULEMENT. Forcer un déverrouillage peut faire perdre
 * le travail en cours de quelqu'un d'autre : son enregistrement sera refusé.
 * Le droit est vérifié par le SITE (`journal:verrous` le refuse autrement) —
 * cette fenêtre ne fait que ne pas dessiner ce qu'elle n'a pas le droit de
 * montrer.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.05rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barre{display:flex;gap:.45rem;align-items:center;flex-wrap:wrap}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);cursor:pointer;
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.28rem .55rem}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button:focus{outline:none;border-color:#c9a97e}
button.dgr{border-color:rgba(239,68,68,.5);color:#f87171}
button.dgr:hover:not(:disabled){background:rgba(239,68,68,.14)}
button.mini{font-size:.74rem;padding:.14rem .45rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h3{margin:0 0 .5rem;font:700 .92rem/1.2 Georgia,serif}
.note{font-size:.78rem;color:#8fa1b8;line-height:1.6;background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:.5rem .7rem}
table{width:100%;border-collapse:collapse;font-size:.82rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.67rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.05);vertical-align:top}
.sub{font-size:.71rem;color:#8fa1b8}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.72rem}
.mut{color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.vif{background:rgba(22,163,74,.2);color:#6ee7a0}
.pill.mort{background:rgba(220,38,38,.18);color:#fca5a5}
.pill.moi{background:rgba(201,169,126,.2);color:#dcc39b}
.vide{padding:1.4rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Verrous ». */
function pageVerrous() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Verrous — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.verrou}</span><h1>Verrous</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Lecture des verrous…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var sousEl = document.getElementById('sous');

  var VERR = null;      // null = pas encore lu ; [] = lu, et il n y en a pas
  var PEUT = false;     // droit d ecriture (deverrouiller)
  var CONF = '';        // confirmation deux clics : '' | 'tout' | scope+SEP+id
  var OCC = false;
  var TIMER = null;
  var SEP = '\\u0001';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function fdate(ts){ if (!ts) return ''; try { return new Date(ts).toLocaleString('fr-CA'); } catch (e) { return ''; } }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application.',
    droit:              'Seul un super-administrateur peut voir et forcer les verrous.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 120)) + ')';
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  function tableau(liste, vide){
    if (!liste.length) return '<div class="vide">' + vide + '</div>';
    var h = '<table><thead><tr><th>Section</th><th>Enregistrement</th><th>Détenu par</th>'
      + '<th>Depuis</th><th>État</th>' + (PEUT ? '<th></th>' : '') + '</tr></thead><tbody>';
    for (var i = 0; i < liste.length; i++) {
      var l = liste[i];
      var mort = l.expired || l.sessionAlive === false;
      var motif = l.expired ? 'Périmé' : (l.sessionAlive === false ? 'Session fermée' : '');
      var cle = l.scope + SEP + l.id;
      h += '<tr><td><strong>' + esc(l.scopeLabel || l.scope) + '</strong>'
        + '<div class="sub mono">' + esc(l.scope) + '</div></td>'
        + '<td>' + (l.label ? '<strong>' + esc(l.label) + '</strong>' : '<em class="mut">sans libellé</em>')
        + '<div class="sub mono">' + esc(l.id) + '</div></td>'
        + '<td>' + esc(l.who || '—') + (l.mine ? ' <span class="pill moi">vous</span>' : '') + '</td>'
        + '<td style="white-space:nowrap">' + esc(l.age || '')
        + '<div class="sub">' + esc(l.since ? fdate(l.since) : '') + '</div></td>'
        + '<td>' + (mort
            ? '<span class="pill mort">' + esc(motif) + '</span>'
            : '<span class="pill vif">actif · ' + Math.max(0, l.expiresIn) + ' s</span>') + '</td>'
        + (PEUT ? '<td style="text-align:right"><button class="mini dgr" data-unl="' + esc(cle) + '">'
            + (CONF === cle ? '✓ Confirmer' : '<span class="ic">🔓</span> Déverrouiller') + '</button></td>' : '')
        + '</tr>';
    }
    return h + '</tbody></table>';
  }

  function dessiner(){
    if (VERR === null) { corps.innerHTML = '<div class="vide">Lecture des verrous…</div>'; return; }
    var actifs = VERR.filter(function(l){ return !l.expired && l.sessionAlive !== false; });
    var morts = VERR.filter(function(l){ return l.expired || l.sessionAlive === false; });
    sousEl.textContent = actifs.length
      ? (actifs.length + ' fiche' + (actifs.length > 1 ? 's' : '') + ' en cours de modification')
      : 'personne ne tient de fiche';

    var h = '<div class="note"><b>Ce que vous regardez.</b> Une fiche ouverte par quelqu’un est '
      + 'verrouillée le temps qu’il travaille, pour éviter que deux personnes écrasent leur travail. '
      + 'Cette page se rafraîchit <b>toute seule</b> : elle montre l’état réel, en direct.<br>'
      + 'Un verrou se libère seul — à la fermeture de la fiche, après 90 s sans activité, ou à la fin '
      + 'de la session. <b>Normalement, il n’y a rien à faire ici.</b> Forcer un déverrouillage ne sert '
      + 'que si un poste est parti en laissant une fiche ouverte : la personne se fera alors refuser '
      + 'son enregistrement. Chaque déverrouillage forcé est inscrit au journal d’accès.</div>';

    h += '<div class="barre"><button class="mini" id="v-reload"><span class="ic">🔄</span> Actualiser</button>'
      + (VERR.length && PEUT
          ? '<button class="mini dgr" id="v-all">'
            + (CONF === 'tout' ? '✓ Confirmer — tout déverrouiller'
                               : '<span class="ic">🔓</span> Tout déverrouiller (' + VERR.length + ')') + '</button>'
          : '') + '</div>';

    h += '<div class="carte"><h3>Verrous actifs (' + actifs.length + ')</h3>'
      + tableau(actifs, 'Aucun verrou actif — personne ne tient de fiche en ce moment.') + '</div>';
    h += '<div class="carte"><h3>Verrous éteints (' + morts.length + ')</h3>'
      + '<div class="sub" style="margin:0 0 .5rem">Ne bloquent personne — affichés pour information.</div>'
      + tableau(morts, 'Aucun.') + '</div>';

    corps.innerHTML = h;
    var vr = document.getElementById('v-reload');
    if (vr) vr.onclick = function(){ CONF = ''; charger(true); };
    var va = document.getElementById('v-all');
    if (va) va.onclick = function(){
      if (CONF === 'tout') { CONF = ''; deverrouillerTout(); }
      else { CONF = 'tout'; dessiner(); dire('Cliquez encore pour tout déverrouiller.', 'att'); }
    };
    var us = corps.querySelectorAll('[data-unl]');
    for (var u = 0; u < us.length; u++) {
      us[u].onclick = function(){
        var cle = this.getAttribute('data-unl');
        if (CONF === cle) { CONF = ''; var p = cle.split(SEP); deverrouiller(p[0], p[1]); }
        else { CONF = cle; dessiner(); dire('Cliquez encore pour forcer ce déverrouillage.', 'att'); }
      };
    }
  }

  function deverrouiller(scope, id){
    if (OCC) return; OCC = true; dire('Déverrouillage…');
    appeler('journal:deverrouiller', [scope, id]).then(function(r){
      OCC = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Verrou libéré.', 'bon');
      charger(true);
    });
  }
  function deverrouillerTout(){
    if (OCC) return; OCC = true; dire('Libération de tous les verrous…');
    appeler('journal:deverrouiller:tout', []).then(function(r){
      OCC = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Verrous libérés.', 'bon');
      charger(true);
    });
  }

  function charger(fort){
    if (OCC) return;
    appeler('journal:verrous', []).then(function(r){
      if (!r || !r.ok) {
        if (VERR === null) corps.innerHTML = '<div class="carte"><div class="vide">'
          + expliquer(r) + '</div></div>';
        if (fort) dire(expliquer(r), 'err');
        return;
      }
      VERR = r.locks || [];
      PEUT = !!r.peutModifier;
      dessiner();
      if (fort) dire('');
    });
  }

  /* ⚠ RAFRAICHISSEMENT VIVANT — C EST LA RAISON D ETRE DU MODULE. Range dans
     les Journaux, l ecran etait fige : un verrou libere restait affiche comme
     s il bloquait encore, et il fallait cliquer pour voir la verite.
     ⚠ ON NE REDESSINE PAS PENDANT UNE CONFIRMATION : le bouton arme
     disparaitrait sous le doigt, et le second clic tomberait dans le vide. */
  function suivre(){
    if (TIMER) return;
    TIMER = setInterval(function(){
      if (document.hidden || OCC || CONF) return;
      charger(false);
    }, 3000);
  }
  window.addEventListener('pagehide', function(){ if (TIMER) { clearInterval(TIMER); TIMER = null; } });

  window.szActualiser = function(){ if (!CONF) charger(false); };
  window.szRevenir = function(){ charger(true); };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  charger(true);
  suivre();
})();
</script>
</body></html>`;
}

module.exports = { pageVerrous };
