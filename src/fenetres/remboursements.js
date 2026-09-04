'use strict';

/*
 * FENÊTRE « REMBOURSEMENTS ET CRÉDITS » — NATIVE (2.7.0)
 * =============================================================================
 * Deux tables qui répondent à deux questions différentes : ce qui est SORTI
 * (les remboursements) et ce qu'on DOIT ENCORE (les crédits boutique — un crédit
 * non dépensé est un passif, pas une dépense passée).
 *
 * ⚠ ÉCRAN DE CONSULTATION, ET C'EST DÉLIBÉRÉ. Rembourser engage de l'argent et
 * se fait depuis la COMMANDE, dans la fenêtre Remboursement qui existe déjà et
 * qui porte toutes les gardes (montant restant, frais retenus, code
 * d'autorisation). Doubler ce geste ici aurait donné deux chemins pour sortir de
 * l'argent, donc deux règles à tenir d'accord. Le clic sur une ligne ouvre la
 * commande concernée.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;font-size:.78rem;color:var(--tx2)}
input[type=search],button{font:inherit;color:var(--tx);background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.stats{display:flex;gap:.5rem;flex-wrap:wrap}
.stats .s{flex:1 1 9rem;background:rgba(255,255,255,.04);border-radius:9px;padding:.45rem .65rem}
.stats .s .n{font:700 1.05rem/1.2 Georgia,serif;color:var(--tx-or)}
.stats .s .n.sort{color:var(--tx-att)}
.stats .s .n.du{color:var(--tx-ok)}
.stats .s .l{font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.stats .s .sub{font-size:.66rem;color:var(--tx3)}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:rgba(255,255,255,.04)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:top}
tbody .num{font-weight:700;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
tbody .arg{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
tbody .arg.sort{color:var(--tx-att);font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
tr.eteint td{opacity:.55}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.info{background:rgba(59,130,246,.18);color:var(--tx-bleu)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.usages{margin-top:.2rem;display:flex;flex-direction:column;gap:1px}
.usages span{font-size:.7rem;color:var(--tx2);white-space:nowrap}
.usages b{color:var(--tx-err)}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:var(--tx2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.aide{font-size:.75rem;color:var(--tx2);line-height:1.45}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Remboursements et crédits ».
 * `onglet` = 'credits' pour ouvrir sur les crédits boutique.
 * ⚠ Il n'est pas décoratif : le garde-fou ne simule aucun clic, donc sans lui
 * la table des CRÉDITS — la moitié de cette fenêtre, et celle qui porte le
 * passif — ne serait jamais dessinée par un jeu d'essai.
 */
function pageRemboursements(onglet) {
  const depart = (String(onglet || '') === 'credits') ? 'credits' : 'remboursements';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Remboursements et crédits — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.refunds}</span><h1>Remboursements et crédits</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');

  var D = null;
  var ONGLET = '${depart}';
  var Q = '';
  var PAGE = 0;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux remboursements.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette commande n’existe plus.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 150)) + ')';
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
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var t = D.tuiles || {}, c = D.comptes || {};
    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'remboursements' ? ' actif' : '') + '" data-onglet="remboursements">'
      + 'Remboursements<span class="n">' + (c.remboursements || 0) + '</span></button>'
      + '<button class="mini' + (ONGLET === 'credits' ? ' actif' : '') + '" data-onglet="credits">'
      + 'Crédits boutique<span class="n">' + (c.credits || 0) + '</span></button>'
      + '<input type="search" id="r-q" placeholder="Numéro, commande, client…" value="' + esc(Q) + '">'
      + '</div>';

    /* ⚠ QUATRE CHIFFRES QUI NE DISENT PAS LA MEME CHOSE. << Rembourse >> est de
       l argent SORTI ; << Solde a honorer >> est de l argent qu on DOIT ENCORE.
       Les melanger dans un total unique donnerait un chiffre qui ne veut rien
       dire ni pour la caisse ni pour le comptable. */
    h += '<div class="stats">'
      + '<div class="s"><div class="n sort">' + esc(t.rembourse) + '</div>'
      + '<div class="l">Total remboursé</div><div class="sub">' + (t.nbRemb || 0)
      + ' remboursement' + ((t.nbRemb || 0) > 1 ? 's' : '') + '</div></div>'
      + '<div class="s"><div class="n">' + esc(t.emis) + '</div>'
      + '<div class="l">Crédits émis</div><div class="sub">' + (t.nbCredits || 0)
      + ' crédit' + ((t.nbCredits || 0) > 1 ? 's' : '') + '</div></div>'
      + '<div class="s"><div class="n">' + esc(t.utilise) + '</div>'
      + '<div class="l">Crédits utilisés</div><div class="sub">déjà dépensés</div></div>'
      + '<div class="s"><div class="n du">' + esc(t.solde) + '</div>'
      + '<div class="l">Solde à honorer</div><div class="sub">passif · ' + (t.nbActifs || 0)
      + ' actif' + ((t.nbActifs || 0) > 1 ? 's' : '') + '</div></div>'
      + '</div>';

    h += '<div class="carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">' + (ONGLET === 'credits'
        ? 'Aucun crédit boutique.' : 'Aucun remboursement.') + '</div>';
    } else {
      h += (ONGLET === 'credits' ? tableCredits(rows) : tableRemb(rows));
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="r-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="r-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';

    h += '<div class="aide" style="padding:.1rem">'
      + '<strong>Rembourser</strong> se fait depuis la commande — cliquez une ligne pour l’ouvrir. '
      + 'Les remboursements de commandes livrées depuis plus de 45 jours sont dans '
      + '<strong>Archives</strong>, et ne sont pas comptés ici.</div>';

    corps.innerHTML = h;
    szVerrousPeindre();   // reposer les cadenas connus sur la liste fraiche
    brancher();
  }

  function typePastille(t){
    if (t === 'credit') return '<span class="pill info">Crédit</span>';
    if (t === 'fees_refund') return '<span class="pill att">Frais</span>';
    return '<span class="pill neutre">Moyen original</span>';
  }
  function tableRemb(rows){
    return '<table><thead><tr><th>N°</th><th>Date</th><th>Commande</th><th>Client</th>'
      + '<th>Mode</th><th>Motif</th><th style="text-align:right">Sous-total</th>'
      + '<th style="text-align:right">TPS</th><th style="text-align:right">TVQ</th>'
      + '<th style="text-align:right">Total</th></tr></thead><tbody>'
      + rows.map(function(r){
          return '<tr data-cmd="' + esc(r.commandeId) + '" title="Ouvrir la commande">'
            // ⚠ LE VERROU EST CELUI DE LA COMMANDE, pas du remboursement : la
            // fenetre de remboursement verrouille la COMMANDE (deux personnes
            // qui remboursent la meme, c est un double remboursement). Un
            // cadenas sur une portee << refunds >> ne pourrait jamais
            // s allumer — il a d ailleurs ete retire du site pour cette raison.
            + '<td><span class="num">' + esc(r.numero) + '</span>'
            + szVerrouCase('orders', r.commandeId) + '</td>'
            + '<td class="dt">' + esc(r.date) + '</td>'
            + '<td>' + esc(r.commande) + '</td>'
            + '<td>' + esc(r.client) + '</td>'
            + '<td>' + typePastille(r.type) + '</td>'
            + '<td class="dt" style="max-width:14rem;overflow:hidden;text-overflow:ellipsis;'
            + 'white-space:nowrap" title="' + esc(r.motif) + '">' + esc(r.motif || '—') + '</td>'
            + '<td class="arg">' + esc(r.sousTotal) + '</td>'
            + '<td class="arg">' + esc(r.tps) + '</td>'
            + '<td class="arg">' + esc(r.tvq) + '</td>'
            + '<td class="arg sort">' + esc(r.total) + '</td></tr>';
        }).join('') + '</tbody></table>';
  }
  function tableCredits(rows){
    var STATUT = { actif: ['bon', 'Actif'], epuise: ['neutre', 'Épuisé'], expire: ['neutre', 'Expiré'] };
    return '<table><thead><tr><th>N°</th><th>Client</th><th>Émis le</th><th>Expiration</th>'
      + '<th style="text-align:right">Montant</th><th style="text-align:right">Utilisé</th>'
      + '<th style="text-align:right">Solde</th><th>Statut</th></tr></thead><tbody>'
      + rows.map(function(c){
          var st = STATUT[c.statut] || STATUT.actif;
          return '<tr class="' + (c.statut === 'expire' ? 'eteint' : '') + '">'
            + '<td><span class="num">' + esc(c.numero) + '</span>'
            + (c.refund ? '<div class="dt">' + esc(c.refund) + '</div>' : '') + '</td>'
            + '<td>' + esc(c.client) + '</td>'
            + '<td class="dt">' + esc(c.emisLe)
            + (c.commande ? '<div class="dt">' + esc(c.commande) + '</div>' : '') + '</td>'
            + '<td class="dt">' + esc(c.expiration) + '</td>'
            + '<td class="arg">' + esc(c.montant) + '</td>'
            + '<td class="arg">' + esc(c.utilise)
            /* ⚠ LE DETAIL DES UTILISATIONS EST VISIBLE, pas cache derriere un
               depliant : c est la seule piece qui explique pourquoi un solde a
               baisse, et c est exactement la question qu on se pose. */
            + (c.usages && c.usages.length
                ? '<div class="usages">' + c.usages.map(function(u){
                    return '<span>' + esc(u.date) + ' · ' + esc(u.commande)
                      + ' <b>−' + esc(u.montant) + '</b></span>'; }).join('') + '</div>'
                : '') + '</td>'
            + '<td class="arg">' + esc(c.solde) + '</td>'
            + '<td><span class="pill ' + st[0] + '">' + st[1] + '</span></td></tr>';
        }).join('') + '</tbody></table>';
  }

  function brancher(){
    var q = document.getElementById('r-q');
    if (q) q.oninput = function(){
      Q = q.value; PAGE = 0;
      clearTimeout(window._rq);
      window._rq = setTimeout(function(){ charger(true); }, 300);
    };
    var bp = document.getElementById('r-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('r-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); PAGE = 0; charger(); return; }
    if (t.closest('button') || t.closest('input')) return;
    var tr = t.closest('tr[data-cmd]');
    if (tr) {
      var id = tr.getAttribute('data-cmd');
      if (!id) { dire('Ce remboursement n’est rattaché à aucune commande.', 'att'); return; }
      dire('Ouverture de la commande…');
      appeler('remboursements:ouvrir', [id]).then(function(r){
        dire(r.ok ? 'Commande ouverte.' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    }
  };

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('remboursements:liste', [{ onglet: ONGLET, q: Q, page: PAGE, taille: 25 }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('Remboursements indisponibles', expliquer(r)); return; }
      D = r;
      ONGLET = D.onglet;
      var s = document.getElementById('sous');
      if (s) s.textContent = (D.tuiles || {}).rembourse + ' remboursés · '
        + (D.tuiles || {}).solde + ' à honorer';
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
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  charger();
  szVerrousSuivre(['orders']);
})();
</script>
</body></html>`;
}

module.exports = { pageRemboursements };
