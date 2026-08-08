'use strict';

/*
 * FENÊTRE « RAMASSAGES ET RAPPORT » — NATIVE
 * =============================================================================
 * Deux onglets d'expédition :
 *  · RAMASSAGES — les ramassages planifiés (transporteur, date, colis,
 *    confirmation, commandes), l'annulation AUPRÈS DU TRANSPORTEUR (le cœur
 *    Admin._ramassageAnnulerCoeur vit dans le site, la fenêtre ne porte que
 *    l'identifiant), et « Planifier » qui renvoie à l'assistant du site (le
 *    flux engage les transporteurs — dates, poids, XML — et reste là-bas).
 *  · RAPPORT — les sommes par transporteur et les 60 dernières expéditions
 *    (le cœur Admin._rapportTransporteursDonnees, le même que la fenêtre
 *    modale du site).
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
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:700}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .45rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:#8fa1b8;font-weight:700}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tfoot td{padding:.34rem .4rem;border-top:2px solid rgba(255,255,255,.16);font-weight:800}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:#8fa1b8}
.mono{font-family:'Courier New',monospace;font-size:.78rem}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap;
  margin-right:.2rem}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.16);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pill.info{background:rgba(59,130,246,.16);color:#93c5fd}
.ligne{padding:.55rem .7rem;background:#16202f;border:1px solid rgba(255,255,255,.07);
  border-radius:11px}
.ligne.annule{opacity:.55}
.ligne .haut{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}
.ligne .dt{font-size:.72rem;color:#8fa1b8;margin-top:.2rem}
input[type=number],input[type=text]{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem;width:100%}
input:focus{outline:none;border-color:#c9a97e}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:34rem;width:100%;max-height:84vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif}
.boite .grp{border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:.5rem .6rem;margin:.4rem 0}
.boite .champs{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.6rem}
.boite .champs .l{font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8;margin-bottom:.2rem}
.boite .pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.7rem}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Ramassages et rapport ». */
function pageRamassages() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Ramassages et rapport — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">📦</span><h1>Ramassages et rapport</h1>
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

  var ONGLET = 'ramassages';   // ramassages | rapport
  var RAM = null;              // lignes de ramassages:liste
  var RAP = null;              // donnees d expeditions:rapport
  var ANNULER_ARME = '';       // id du ramassage dont Annuler attend confirmation
  var PLAN = null;             // le formulaire de planification (ramassages:preparer)

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var _direT = null;
  function dire(t, cl){
    msg.className = 'msg' + (cl ? ' ' + cl : ''); msg.textContent = t || '';
    clearTimeout(_direT);
    if (t && cl === 'bon') _direT = setTimeout(function(){
      if (msg.textContent === t) { msg.textContent = ''; msg.className = 'msg'; }
    }, 4000);
  }
  function fmt(n){
    try { return (Number(n) || 0).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }); }
    catch (e) { return (Number(n) || 0).toFixed(2) + ' $'; }
  }
  function fmtDate(d){
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-CA'); } catch (e) { return String(d); }
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux expéditions.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    annulation:         'L’annulation a échoué auprès du transporteur.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 140)) + ')';
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

  function barre(){
    return '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'ramassages' ? ' actif' : '') + '" data-onglet="ramassages">📅 Ramassages</button>'
      + '<button class="mini' + (ONGLET === 'rapport' ? ' actif' : '') + '" data-onglet="rapport">📊 Rapport transporteurs</button>'
      + (ONGLET === 'ramassages'
          ? '<span class="droite"><button class="prim" id="rm-planifier" '
            + 'title="Le choix des colis, de la date et du poids se fait dans la fenêtre principale">'
            + '📦 Planifier un ramassage</button></span>'
          : '')
      + '</div>';
  }

  function dessinerRamassages(){
    var h = barre();
    var rows = RAM || [];
    if (!rows.length) {
      h += '<div class="vide">Aucun ramassage planifié.</div>';
    } else {
      h += rows.map(function(r){
        var etat = r.annule ? '<span class="pill err">Annulé</span>' : '<span class="pill bon">Planifié</span>';
        return '<div class="ligne' + (r.annule ? ' annule' : '') + '">'
          + '<div class="haut">'
          + '<span>' + r.logo + '</span><span class="num">' + esc(r.transporteur) + '</span>'
          + '<span class="dt">📅 ' + esc(r.date) + '</span>'
          + '<span class="pill neutre">' + r.colis + ' colis</span>'
          + etat
          + (!r.annule
              ? '<button class="mini danger" style="margin-left:auto" data-annuler="' + esc(r.id) + '">'
                + (ANNULER_ARME === r.id ? 'Confirmer l’annulation ?' : 'Annuler') + '</button>'
              : '')
          + '</div>'
          + '<div class="dt">Confirmation : <span class="mono">' + esc(r.confirmation || '—') + '</span>'
          + (r.par ? ' · planifié par ' + esc(r.par) : '')
          + (r.annule && r.annulePar ? ' · annulé par ' + esc(r.annulePar) : '') + '</div>'
          + (r.commandes.length
              ? '<div class="dt">' + r.commandes.map(function(n){
                  return '<span class="pill neutre mono">' + esc(n) + '</span>'; }).join(' ') + '</div>'
              : '')
          + '</div>';
      }).join('');
    }
    if (PLAN) h += boitePlan();
    corps.innerHTML = h;
  }

  function boitePlan(){
    var p = PLAN;
    var h = '<div class="voile" id="rm-voile"><div class="boite">'
      + '<h3>📦 Planifier les ramassages — ' + (p.total || 0) + ' colis</h3>';
    if (!p.total) {
      h += '<div class="vide">Aucun colis à ramasser pour l’instant.<br>'
        + 'Une commande doit être marquée Expédiée et avoir un numéro de suivi.</div>'
        + '<div class="pied-boite"><button id="rm-p-annuler">Fermer</button></div></div></div>';
      return h;
    }
    h += '<div class="dt">📅 Prévu le <strong>' + esc(p.date) + '</strong>, entre 09 h et 17 h'
      + (p.adresse ? ' · ' + esc(p.adresse) : '') + '</div>';
    h += (p.groupes || []).map(function(g){
      return '<div class="grp"><div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">'
        + '<span>' + g.logo + '</span><span class="num">' + esc(g.nom) + '</span>'
        + '<span class="pill neutre">' + g.colis + ' colis</span>'
        + (g.api ? '<span class="pill bon">API — demande automatique</span>'
                 : '<span class="pill att">à contacter manuellement</span>')
        + '</div><div class="dt">' + (g.commandes || []).map(function(n){
            return '<span class="pill neutre mono">' + esc(n) + '</span>'; }).join(' ') + '</div></div>';
    }).join('');
    h += '<div class="champs">'
      + '<div><div class="l">Poids estimé par colis (kg)</div>'
      + '<input type="number" id="rm-p-poids" value="0.5" min="0.05" step="0.05"></div>'
      + '<div><div class="l">Endroit du ramassage</div>'
      + '<input type="text" id="rm-p-endroit" value="Porte principale"></div>'
      + '</div>'
      + '<div class="pied-boite"><button id="rm-p-annuler">Annuler</button>'
      + '<button class="prim" id="rm-p-envoyer">📨 Envoyer les demandes</button></div>'
      + '</div></div>';
    return h;
  }

  function dessinerRapport(){
    var h = barre();
    if (!RAP || !RAP.total) {
      h += '<div class="vide">Aucune expédition enregistrée.</div>';
      corps.innerHTML = h;
      return;
    }
    h += '<div class="carte"><h2>Par transporteur — ' + RAP.total + ' expédition' + (RAP.total > 1 ? 's' : '') + '</h2>'
      + '<table><thead><tr><th>Transporteur</th><th style="text-align:center">Colis</th>'
      + '<th style="text-align:right">Total frais</th><th style="text-align:right">Moy. par colis</th></tr></thead><tbody>'
      + (RAP.transporteurs || []).map(function(t){
          return '<tr><td>' + t.logo + ' <span class="num">' + esc(t.nom) + '</span></td>'
            + '<td style="text-align:center;font-weight:700">' + t.colis + '</td>'
            + '<td style="text-align:right">' + esc(fmt(t.frais)) + '</td>'
            + '<td style="text-align:right" class="dt">' + esc(fmt(t.moyen)) + '</td></tr>';
        }).join('')
      + '</tbody><tfoot><tr><td>TOTAL</td><td style="text-align:center">' + RAP.total + '</td>'
      + '<td style="text-align:right">' + esc(fmt(RAP.totalFrais)) + '</td><td></td></tr></tfoot></table></div>';

    h += '<div class="carte"><h2>Les 60 dernières expéditions</h2>'
      + '<table><thead><tr><th>Commande</th><th>Date</th><th>Transporteur</th>'
      + '<th>Suivi</th><th style="text-align:right">Frais</th><th>Statut</th></tr></thead><tbody>'
      + (RAP.expeditions || []).map(function(o){
          return '<tr><td><span class="num">' + esc(o.numero) + '</span></td>'
            + '<td class="dt">' + esc(fmtDate(o.date)) + '</td>'
            + '<td>' + o.logo + ' ' + esc(o.transporteur) + '</td>'
            + '<td class="mono">' + esc(o.suivi || '—') + '</td>'
            + '<td style="text-align:right">' + esc(fmt(o.frais)) + '</td>'
            + '<td>' + (o.livree ? '<span class="pill bon">Livrée</span>' : '<span class="pill info">Expédiée</span>')
            + (o.ramasse ? ' <span class="pill bon">ramassé</span>' : '') + '</td></tr>';
        }).join('')
      + '</tbody></table></div>';
    corps.innerHTML = h;
  }

  function dessiner(){
    if (ONGLET === 'rapport') dessinerRapport();
    else dessinerRamassages();
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) { ONGLET = og.getAttribute('data-onglet'); ANNULER_ARME = ''; charger(); return; }
    var pl = t.closest('#rm-planifier');
    if (pl) {
      /* NATIF (1.59.1) : le formulaire s ouvre ICI — le renvoi a l assistant
         web contredisait la regle << plus rien au format web >> (releve du
         2026-08-09). */
      dire('Lecture des colis prêts…');
      appeler('ramassages:preparer', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('');
        PLAN = r;
        dessiner();
      });
      return;
    }
    if (t.closest('#rm-p-annuler')) { PLAN = null; dessiner(); return; }
    var env = t.closest('#rm-p-envoyer');
    if (env) {
      var poids = parseFloat((document.getElementById('rm-p-poids') || {}).value) || 0.5;
      var endroit = ((document.getElementById('rm-p-endroit') || {}).value || '').trim();
      env.disabled = true;
      dire('Demandes envoyées aux transporteurs…');
      appeler('ramassages:planifier', [{ poids: poids, endroit: endroit }]).then(function(r){
        if (!r.ok) {
          dire(r.motif === 'aucun_colis' ? 'Aucun colis à ramasser.' : expliquer(r), 'err');
          env.disabled = false;
          return;
        }
        dire((r.echec ? '⚠ ' : '') + 'Ramassage ' + r.date + ' — ' + r.total + ' colis'
          + ((r.parties || []).length ? ' · ' + r.parties.join(' · ') : ''), r.echec ? 'err' : 'bon');
        PLAN = null;
        charger();
      });
      return;
    }
    if (t.closest('.boite')) return;
    if (t.closest('#rm-voile')) { PLAN = null; dessiner(); return; }
    var an = t.closest('[data-annuler]');
    if (an) {
      var id = an.getAttribute('data-annuler');
      /* ⚠ L ANNULATION EST UN GESTE AUPRES DU TRANSPORTEUR : deux clics — le
         premier arme le bouton, le second confirme (et jamais de boite native). */
      if (ANNULER_ARME !== id) {
        ANNULER_ARME = id;
        dessiner();
        setTimeout(function(){ if (ANNULER_ARME === id) { ANNULER_ARME = ''; dessiner(); } }, 4000);
        return;
      }
      ANNULER_ARME = '';
      an.disabled = true;
      dire('Annulation auprès du transporteur…');
      appeler('ramassages:annuler', [id]).then(function(r){
        if (r.ok) { dire('Ramassage annulé.', 'bon'); charger(); }
        else { dire(expliquer(r), 'err'); dessiner(); }
      });
      return;
    }
  };

  var enCours = false;
  function charger(){
    if (enCours) return;
    enCours = true;
    var op = (ONGLET === 'rapport') ? 'expeditions:rapport' : 'ramassages:liste';
    appeler(op, []).then(function(r){
      enCours = false;
      if (!r || !r.ok) { vide('Expéditions indisponibles', expliquer(r)); return; }
      if (ONGLET === 'rapport') RAP = r;
      else RAM = r.lignes || [];
      dire('');
      dessiner();
    });
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : une expedition confirmee ou un
     statut qui change font relire l onglet courant. */
  window.szActualiser = function(){ if (!ANNULER_ARME && !PLAN) charger(); };
  window.szRevenir = function(){ ANNULER_ARME = ''; charger(); };

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
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (PLAN) { PLAN = null; dessiner(); return; }
      P.fermer();
    }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageRamassages };
