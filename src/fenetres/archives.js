'use strict';

/*
 * FENÊTRE « ARCHIVES » — NATIVE (1.60.0, palier 4)
 * =============================================================================
 * Les archives (commandes livrées depuis plus de 45 jours, conservées 6 ans) :
 * quatre onglets — Commandes, Retours, Factures, Remboursements — avec
 * recherche et pagination locales. Les quatre piles arrivent d'un seul appel
 * (archives:liste, lignes allégées du cœur du site) puis se filtrent ICI.
 *
 * Les gestes : l'œil ouvre le détail dans la fenêtre native appropriée
 * (archives:ouvrir → commande, retour ou facture) ; « Rembourser » réactive la
 * commande pour 45 jours ET l'ouvre dans sa fenêtre pour y traiter le
 * remboursement ; « Réactiver » la remet simplement dans les commandes
 * actives. Après un geste, la liste se relit (la ligne quitte l'archive).
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
input[type=search],button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:220px}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.att{border-color:rgba(245,158,11,.55);color:var(--tx-att)}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;
  padding:.6rem .75rem}
.avis{font-size:.76rem;color:var(--tx2);line-height:1.5;padding:.1rem .15rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v11)}
tbody td{padding:.34rem .4rem;border-top:1px solid var(--v05);vertical-align:middle}
tbody tr:hover td{background:var(--v04)}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
tbody .fin{white-space:nowrap;text-align:right}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:var(--tx2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Archives ». */
function pageArchives() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Archives — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.archives}</span><h1>Archives</h1>
  <span class="sous" id="sous">livrées il y a plus de 45 jours · conservées 6 ans</span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;            // les quatre piles (archives:liste)
  var ONGLET = 'commandes';
  var Q = '';
  var PAGE = 0;
  var PAR_PAGE = 25;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux archives.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet élément n’existe plus dans l’archive.',
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
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  var ONGLETS = [
    { k: 'commandes', l: 'Commandes' },
    { k: 'retours', l: 'Retours' },
    { k: 'factures', l: 'Factures' },
    { k: 'remboursements', l: 'Remboursements' }
  ];

  function filtrees(){
    var pile = (D && D[ONGLET]) || [];
    var q = Q.trim().toLowerCase();
    if (!q) return pile;
    return pile.filter(function(r){
      return (String(r.num || '') + ' ' + String(r.commande || '') + ' '
        + String(r.client || '') + ' ' + String(r.courriel || ''))
        .toLowerCase().indexOf(q) !== -1;
    });
  }

  function ligneCommande(o){
    var gestes = '<button class="mini geste" data-voir="commande" data-id="' + esc(o.id) + '" title="Détails">&#128065;</button>';
    if (D.peutRembourser) gestes += ' <button class="mini geste att" data-rembourser="' + esc(o.id) + '" title="Réactiver 45 jours et traiter le remboursement dans la fenêtre Commande">Rembourser</button>';
    if (D.peutReactiver) gestes += ' <button class="mini geste" data-reactiver="' + esc(o.id) + '" title="Sortir de l’archive et remettre en commandes actives pour 45 jours">Réactiver</button>';
    return '<tr><td class="num">' + esc(o.num) + '<div class="dt">' + esc(o.date) + '</div></td>'
      + '<td>' + esc(o.client) + '<div class="dt">' + esc(o.courriel) + '</div></td>'
      + '<td style="white-space:nowrap"><strong>' + esc(o.total) + '</strong></td>'
      + '<td><span class="pill neutre">' + esc(o.statut) + '</span>'
      + (o.rembourse ? ' <span class="pill bon">Remboursé</span>' : '') + '</td>'
      + '<td class="dt" style="white-space:nowrap">' + esc(o.archivee) + '</td>'
      + '<td class="fin">' + gestes + '</td></tr>';
  }
  function ligneRetour(r){
    return '<tr><td class="num">' + esc(r.num) + '<div class="dt">' + esc(r.date) + '</div></td>'
      + '<td>' + esc(r.client) + '<div class="dt">' + esc(r.courriel) + '</div></td>'
      + '<td><span class="pill neutre">' + esc(r.statut) + '</span></td>'
      + '<td class="dt" style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(r.motif || '—') + '</td>'
      + '<td class="dt" style="white-space:nowrap">' + esc(r.archivee) + '</td>'
      + '<td class="fin"><button class="mini geste" data-voir="retour" data-id="' + esc(r.id) + '" title="Détails">&#128065;</button></td></tr>';
  }
  function ligneFacture(f){
    return '<tr><td class="num">' + esc(f.num) + '<div class="dt">' + esc(f.commande || '—') + ' · ' + esc(f.date) + '</div></td>'
      + '<td>' + esc(f.client) + (f.manuel ? ' <span class="pill neutre" title="Vente saisie à la main dans Vente au comptoir">comptoir</span>' : '')
      + '<div class="dt">' + esc(f.courriel) + '</div></td>'
      + '<td style="white-space:nowrap"><strong>' + esc(f.total) + '</strong></td>'
      + '<td><span class="pill neutre">' + esc(f.statut) + '</span></td>'
      + '<td class="dt" style="white-space:nowrap">' + esc(f.archivee) + '</td>'
      + '<td class="fin"><button class="mini geste" data-voir="facture" data-id="' + esc(f.id) + '" title="Détails">&#128065;</button></td></tr>';
  }
  function ligneRemboursement(r){
    return '<tr><td class="num" style="font-family:monospace;font-size:.78rem">' + esc(r.num) + '</td>'
      + '<td class="dt" style="white-space:nowrap">' + esc(r.date) + '</td>'
      + '<td>' + esc(r.commande) + '</td>'
      + '<td>' + esc(r.client) + '</td>'
      + '<td><span class="pill ' + (r.type === 'Crédit' ? 'neutre' : r.type === 'Frais' ? 'att' : 'neutre') + '">' + esc(r.type) + '</span></td>'
      + '<td class="fin" style="font-family:monospace;font-weight:700">' + esc(r.total) + '</td>'
      + '<td class="dt" style="white-space:nowrap">' + esc(r.archivee) + '</td>'
      + '<td class="fin">' + (r.commandeId ? '<button class="mini geste" data-voir="commande" data-id="' + esc(r.commandeId) + '" title="Voir la commande">&#128065;</button>' : '') + '</td></tr>';
  }

  var TETES = {
    commandes: '<th>Commande</th><th>Client</th><th>Total</th><th>Statut</th><th>Archivée le</th><th></th>',
    retours: '<th>Commande</th><th>Client</th><th>Statut</th><th>Motif</th><th>Archivé le</th><th></th>',
    factures: '<th>Facture</th><th>Client</th><th>Montant</th><th>Statut</th><th>Archivée le</th><th></th>',
    remboursements: '<th>N&#176;</th><th>Date</th><th>Commande</th><th>Client</th><th>Mode</th><th style="text-align:right">Total</th><th>Archivé le</th><th></th>'
  };
  var VIDES = {
    commandes: 'Aucune commande archivée.',
    retours: 'Aucun retour archivé.',
    factures: 'Aucune facture archivée.',
    remboursements: 'Aucun remboursement archivé.'
  };

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var rows = filtrees();
    var pages = Math.max(1, Math.ceil(rows.length / PAR_PAGE));
    var p = Math.min(Math.max(0, PAGE), pages - 1);
    PAGE = p;
    var vue = rows.slice(p * PAR_PAGE, p * PAR_PAGE + PAR_PAGE);

    var h = '<div class="barreoutils">';
    ONGLETS.forEach(function(g){
      var n = (D[g.k] || []).length;
      h += '<button class="mini' + (ONGLET === g.k ? ' actif' : '') + '" data-onglet="' + g.k + '">'
        + g.l + (n ? '<span class="n">' + n + '</span>' : '') + '</button>';
    });
    h += '<div class="droite"><input type="search" id="a-q" placeholder="Rechercher…" value="' + esc(Q) + '">'
      + '<span>' + rows.length + ' élément' + (rows.length > 1 ? 's' : '') + '</span></div></div>';

    h += '<div class="carte"><div class="avis">Les commandes livrées sont archivées automatiquement '
      + '45 jours après leur livraison, avec leurs factures et remboursements associés, puis conservées 6 ans. '
      + 'Pour rembourser une commande archivée, « Rembourser » la réactive pour un nouveau délai de 45 jours '
      + 'et l’ouvre dans sa fenêtre.</div></div>';

    h += '<div class="carte">';
    if (!vue.length) {
      h += '<div class="vide">' + (Q ? 'Rien ne correspond à la recherche.' : VIDES[ONGLET]) + '</div>';
    } else {
      var dessine = ONGLET === 'commandes' ? ligneCommande
        : ONGLET === 'retours' ? ligneRetour
        : ONGLET === 'factures' ? ligneFacture : ligneRemboursement;
      h += '<table><thead><tr>' + TETES[ONGLET] + '</tr></thead><tbody>'
        + vue.map(dessine).join('') + '</tbody></table>';
      if (pages > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="a-prec"' + (p <= 0 ? ' disabled' : '') + '>&#9664;</button>'
          + '<span>Page ' + (p + 1) + ' / ' + pages + '</span>'
          + '<button class="mini" id="a-suiv"' + (p >= pages - 1 ? ' disabled' : '') + '>&#9654;</button>'
          + '</div>';
      }
    }
    h += '</div>';
    corps.innerHTML = h;

    var q = document.getElementById('a-q');
    if (q) q.oninput = function(){ Q = q.value; PAGE = 0; redessinerSansPerdreLaSaisie(); };
    var bp = document.getElementById('a-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, PAGE - 1); dessiner(); };
    var bs = document.getElementById('a-suiv');
    if (bs) bs.onclick = function(){ PAGE = PAGE + 1; dessiner(); };
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS : le curseur et la
     selection restent ou ils sont. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('a-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('a-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); PAGE = 0; Q = ''; dessiner(); return; }
    var bv = t.closest('[data-voir]');
    if (bv) {
      dire('Ouverture…');
      appeler('archives:ouvrir', [bv.getAttribute('data-voir'), bv.getAttribute('data-id')]).then(function(r){
        dire(r.ok ? 'Détail ouvert dans sa fenêtre.' : expliquer(r), r.ok ? 'bon' : 'err');
      });
      return;
    }
    var br = t.closest('[data-rembourser]');
    if (br) {
      br.disabled = true;
      dire('Réactivation…');
      appeler('archives:reactiver', [br.getAttribute('data-rembourser'), true]).then(function(r){
        if (!r.ok) { br.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('Commande ' + (r.num || '') + ' réactivée pour 45 jours — traitez le remboursement dans sa fenêtre.', 'bon');
        charger();
      });
      return;
    }
    var ba = t.closest('[data-reactiver]');
    if (ba) {
      ba.disabled = true;
      dire('Réactivation…');
      appeler('archives:reactiver', [ba.getAttribute('data-reactiver'), false]).then(function(r){
        if (!r.ok) { ba.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('Commande ' + (r.num || '') + ' réactivée — de retour dans les commandes actives pour 45 jours.', 'bon');
        charger();
      });
    }
  };

  function charger(){
    appeler('archives:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Archives indisponibles', expliquer(r)); return; }
      D = r;
      dire('');
      dessiner();
    });
  }

  /* Actualisation poussee par la coquille (une commande change, une vente
     passe) — mais jamais pendant une saisie dans la recherche. */
  window.szActualiser = function(){
    var q = document.getElementById('a-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans : detacher la vue
     ancree, ou RAMENER la vue detachee dans la fenetre principale. */
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
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageArchives };
