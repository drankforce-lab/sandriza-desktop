'use strict';

/*
 * FENÊTRE « JOURNAL D'ENVOI » — NATIVE (1.75.0, palier 4)
 * =============================================================================
 * Qui a reçu quoi, quand, et si c'est vraiment parti. Trois compteurs, les 300
 * derniers envois avec leur campagne ou leur chaîne, la recherche par adresse
 * et le filtre « échecs seulement ».
 *
 * ⚠ C'EST LA SEULE PIÈCE qui permette de répondre à « je n'ai jamais reçu votre
 * courriel ». Les échecs sont donc comptés à part et gardent leur message
 * d'erreur : un journal qui ne montrerait que les succès ne servirait à rien
 * le jour où ça rate.
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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:210px}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err)}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2)}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .val.bon{color:var(--tx-ok)}.tuile .val.err{color:var(--tx-err)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.3rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody tr:hover td{background:var(--v04)}
.dt{font-size:.72rem;color:var(--tx2)}
.det{font-size:.74rem;color:var(--tx2);max-width:16rem;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.vide{padding:1.4rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Journal d'envoi ». */
function pageJournal() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Journal d’envoi — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.journaux}</span><h1>Journal d’envoi</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var Q = '';
  var ECHECS = false;
  var ARME = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à l’infolettre.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
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
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }

  function filtres(){
    var q = Q.trim().toLowerCase();
    return (D.lignes || []).filter(function(l){
      if (ECHECS && l.envoye) return false;
      if (!q) return true;
      return (String(l.courriel) + ' ' + String(l.reference)).toLowerCase().indexOf(q) !== -1;
    });
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div>'; return; }
    var rows = filtres();
    if (sous) sous.textContent = (D.lignes || []).length + ' derniers envois';

    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Envois enregistrés</div><div class="val">'
      + (D.total || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Partis</div><div class="val bon">'
      + (D.envoyes || 0) + '</div></div>'
      + '<div class="tuile"><div class="lbl">Échecs</div><div class="val err">'
      + (D.echecs || 0) + '</div></div>'
      + '</div>';

    h += '<div class="barreoutils">'
      + '<input type="search" id="jo-q" placeholder="Adresse ou campagne…" value="' + esc(Q) + '">'
      + '<button class="mini' + (ECHECS ? ' actif' : '') + '" id="jo-echecs">Échecs seulement</button>'
      + '<div class="droite">'
      + (D.peutModifier && (D.total || 0)
          ? '<button class="mini danger" id="jo-vider">' + (ARME ? 'Confirmer ?' : 'Effacer le journal') + '</button>' : '')
      + '<span>' + rows.length + ' ligne' + (rows.length > 1 ? 's' : '') + '</span></div></div>';

    h += '<div class="carte">';
    if (!rows.length) {
      h += '<div class="vide">' + (Q || ECHECS ? 'Rien ne correspond.' : 'Aucun envoi enregistré.') + '</div>';
    } else {
      h += '<table><thead><tr><th>Date</th><th>Genre</th><th>Référence</th>'
        + '<th>Destinataire</th><th>Résultat</th><th>Détail</th></tr></thead><tbody>'
        + rows.map(function(l){
            return '<tr><td class="dt" style="white-space:nowrap">' + esc(l.date) + '</td>'
              + '<td><span class="pill neutre">' + esc(l.genre) + '</span></td>'
              + '<td>' + esc(l.reference || '—') + '</td>'
              + '<td>' + esc(l.courriel) + '</td>'
              + '<td><span class="pill ' + (l.envoye ? 'bon' : 'err') + '">'
              + (l.envoye ? 'Parti' : 'Échec') + '</span>'
              + (l.test ? ' <span class="pill att">test</span>' : '') + '</td>'
              /* Le detail porte l identifiant Resend (preuve d envoi) OU le
                 message d erreur : c est ce qui permet de repondre a
                 << je n ai rien recu >>. */
              + '<td class="det" title="' + esc(l.detail || '') + '">' + esc(l.detail || '—') + '</td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    corps.innerHTML = h;

    var q = document.getElementById('jo-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };
    var be = document.getElementById('jo-echecs');
    if (be) be.onclick = function(){ ECHECS = !ECHECS; ARME = false; dessiner(); };
    var bv = document.getElementById('jo-vider');
    if (bv) bv.onclick = function(){
      if (!ARME) {
        ARME = true; dessiner();
        dire('Cliquez « Confirmer ? » — le journal est effacé, et avec lui la preuve '
          + 'de ce qui est parti. Les envois eux-mêmes ne sont pas annulés.', 'att');
        return;
      }
      ARME = false;
      appeler('journal:vider', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(r.efface + ' entrée' + (r.efface > 1 ? 's effacées' : ' effacée') + '.', 'bon');
        charger();
      });
    };
  }

  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('jo-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('jo-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    /* Un clic sur une commande est traite par SA commande : sans cette garde,
       il remonterait ici et desarmerait ce qu il vient d armer. */
    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = false; dessiner(); }
  });

  function charger(){
    appeler('journal:liste', []).then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="vide"><strong>Journal indisponible</strong>'
          + '<div style="margin-top:.4rem">' + esc(expliquer(r)) + '</div></div>';
        return;
      }
      D = r;
      dessiner();
    });
  }

  window.szActualiser = function(){
    var q = document.getElementById('jo-q');
    if (q && document.activeElement === q && q.value) return;
    if (ARME) return;
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
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto');
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
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (ARME) { ARME = false; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageJournal };
