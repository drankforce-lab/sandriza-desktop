'use strict';

/*
 * FENÊTRE « PUBLICITÉ CIBLÉE & ANALYTIQUE » — NATIVE (3.16.0, #30)
 * =============================================================================
 * LE DERNIER écran du portage. SIX onglets : Vue d'ensemble, Segments clients,
 * Performance des promotions, Attribution sociale, Campagnes, Satisfaction chat.
 *
 * ⚠ Cinq onglets sont de la LECTURE : les cœurs (`_analytics*Coeur`,
 * analytics.js) calculent depuis les ventes/clients/promos/réseaux/chat et
 * renvoient du JSON ; la fenêtre ne fait que dessiner. Seul « Campagnes » écrit
 * (créer / lancer / supprimer, revérifié `analytics:edit`). L'export CSV d'un
 * segment part de la page principale (comme la sauvegarde). Le générateur de
 * liens UTM se construit dans la fenêtre à partir de l'URL du site (fournie par
 * le cœur — `window.location` de la fenêtre est un file:// inutile ici).
 *
 * ⚠ CLÉ DE FENÊTRE `publicite`, pas `analytics` : ce nom sert déjà à la config
 * Google Analytics (`config-analytics`).
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, commentaires
 * compris : tout ce script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;
  border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.onglets{flex:0 0 auto;display:flex;gap:.2rem;padding:.5rem 1.05rem 0;flex-wrap:wrap;border-bottom:1px solid rgba(255,255,255,.08)}
.onglets button{background:transparent;border:none;border-bottom:2px solid transparent;color:#8fa1b8;
  padding:.38rem .6rem;font-weight:600;font-size:.82rem;border-radius:6px 6px 0 0}
.onglets button:hover{background:rgba(255,255,255,.05);color:#e8edf5}
.onglets button.actif{color:#e8dcc6;border-bottom-color:#c9a97e}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;display:flex;flex-direction:column;gap:.85rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
input,button,select,textarea{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.36rem .5rem}
textarea{resize:vertical;min-height:60px;width:100%}
button{cursor:pointer;-webkit-user-select:none;user-select:none}
input:focus,button:focus,select:focus,textarea:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600;padding:.36rem .7rem}
button.prim:hover:not(:disabled){background:#a3824f}
button.ghost{background:transparent}
button.mini{padding:.14rem .5rem;font-size:.75rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.6rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:.55rem .75rem}
.tuile .k{font-size:.64rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}
.tuile .v{font-size:1.35rem;font-weight:800;margin-top:.12rem}
.tuile .z{font-size:.66rem;color:#8fa1b8;margin-top:.08rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:.7rem .8rem}
.carte h2{margin:0 0 .55rem;font-size:.76rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8;font-weight:700;display:flex;justify-content:space-between;align-items:center}
.deux{display:grid;grid-template-columns:2fr 1fr;gap:1rem;align-items:start}
.deuxb{display:grid;grid-template-columns:1fr 340px;gap:1rem;align-items:start}
@media(max-width:760px){.deux,.deuxb{grid-template-columns:1fr}}
table{width:100%;border-collapse:collapse;font-size:.82rem}
thead th{text-align:left;padding:.26rem .4rem;font-size:.64rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.32rem .4rem;border-top:1px solid rgba(255,255,255,.055)}
.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.ctr{text-align:center}
code{font:.75rem/1.4 Consolas,monospace;color:#cbd8e6}
.badge{display:inline-block;font-size:.66rem;font-weight:700;padding:.05rem .5rem;border-radius:99px}
.badge.ok{background:rgba(22,163,74,.2);color:#86efac}
.badge.warn{background:rgba(217,119,6,.2);color:#fcd34d}
.badge.err{background:rgba(220,38,38,.2);color:#fca5a5}
.badge.info{background:rgba(59,130,246,.2);color:#93c5fd}
.badge.def{background:rgba(148,163,184,.18);color:#cbd5e1}
.graph{display:flex;align-items:flex-end;gap:.4rem;height:150px}
.graph .col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}
.graph .val{font-size:.56rem;color:#8fa1b8;font-weight:600;margin-bottom:2px;white-space:nowrap}
.graph .barz{width:100%;display:flex;gap:2px;align-items:flex-end;height:110px}
.graph .b1{flex:1;background:#c9a97e;border-radius:3px 3px 0 0}
.graph .b2{flex:1;background:#dc2626;opacity:.7;border-radius:3px 3px 0 0}
.graph .lbl{font-size:.64rem;color:#8fa1b8;margin-top:.3rem}
.legend{display:flex;gap:1rem;font-size:.68rem;color:#8fa1b8}
.legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:middle}
.rang{display:flex;align-items:center;gap:.6rem;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.055)}
.rang .pos{width:1.3rem;height:1.3rem;border-radius:50%;background:#c9a97e;color:#1a1a1a;font-size:.6rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rang .nm{flex:1;min-width:0;font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.segc{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:.55rem;margin-bottom:.9rem}
.seg{background:#16202f;border:2px solid transparent;border-radius:11px;padding:.6rem .7rem;cursor:pointer}
.seg.pris{border-color:#c9a97e}
.seg .n{font-size:1.5rem;font-weight:800}
.seg .l{font-size:.78rem;font-weight:600}
.seg .d{font-size:.66rem;color:#8fa1b8;margin-top:.1rem}
.pill{display:inline-block;padding:.1rem .55rem;border-radius:99px;font-size:.7rem;font-weight:600;background:rgba(148,163,184,.18);color:#cbd5e1}
.champ{margin-bottom:.65rem}
.champ label{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;color:#8fa1b8;margin:0 0 .22rem}
.champ input,.champ select,.champ textarea{width:100%}
.aud{background:rgba(201,169,126,.14);border-radius:8px;padding:.5rem;text-align:center;font-weight:800;font-size:1.05rem;color:#e8dcc6}
.chans{display:flex;flex-wrap:wrap;gap:.7rem}
.chans label{display:flex;align-items:center;gap:.35rem;font-size:.85rem;cursor:pointer}
.rec{padding:.45rem 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:.82rem;line-height:1.5}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.78);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;max-width:34rem;width:100%;max-height:88vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .7rem;font:700 .98rem/1.3 Georgia,serif}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.85rem;flex-wrap:wrap}
.pied-boite .gauche{margin-right:auto}
.satbar{display:flex;align-items:center;gap:.7rem;margin-bottom:.4rem}
.satbar .track{flex:1;height:10px;background:rgba(255,255,255,.1);border-radius:5px;overflow:hidden}
.satbar .track>div{height:100%;border-radius:5px}
.vide{padding:1.5rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * `ouverture` : '' (Vue d'ensemble) · un id d'onglet (segments, promos, social,
 * campaigns, satisfaction) · 'camp-nouvelle' (Campagnes, formulaire ouvert).
 */
function pagePublicite(ouverture) {
  const ouv = String(ouverture || '');
  const ONGLETS = ['overview', 'segments', 'promos', 'social', 'campaigns', 'satisfaction'];
  const tabDepart = ouv === 'camp-nouvelle' ? 'campaigns' : (ONGLETS.indexOf(ouv) >= 0 ? ouv : 'overview');
  const ouvreForm = (ouv === 'camp-nouvelle');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Publicité ciblée — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.mktstats}</span><h1>Publicité ciblée &amp; analytique</h1><span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');
  var ongletsEl = document.getElementById('onglets');

  var TAB = '${tabDepart}';
  var D = null;
  var PEUT = { vue:true, edit:false };
  var SEGF = 'all';           // filtre de segment
  var FORM = null;            // surcouche nouvelle campagne : { seg0, audienceCount, promos }
  var UTM = { source:'facebook', campaign:'promo-2026', dest:'#shop' };

  var LBL = { overview:'📊 Vue d’ensemble', segments:'👥 Segments', promos:'🎯 Promotions',
    social:'📱 Attribution sociale', campaigns:'📢 Campagnes', satisfaction:'★ Satisfaction' };
  var OP = { overview:'analytics:overview', segments:'analytics:segments', promos:'analytics:promos',
    social:'analytics:social', campaigns:'analytics:campaigns', satisfaction:'analytics:satisfaction' };
  var STATUTS = { confirmed:['ok','Confirmée'], pending:['warn','En attente'], shipped:['info','Expédiée'],
    delivered:['ok','Livrée'], cancelled:['def','Annulée'], preparing:['info','Préparation'], verification:['warn','Vérif.'] };

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function plur(n){ return n === 1 ? '' : 's'; }
  function argent(n){ return (Math.round((Number(n)||0)*100)/100).toFixed(2) + ' $'; }
  function argentK(n){ n = Number(n)||0; return n >= 1000 ? ((n/1000).toFixed(1) + 'k $') : argent(n); }
  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }
  function chk(id){ var e = document.getElementById(id); return e ? e.checked : false; }

  var MOTIFS = { session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne permet pas cette action.', indisponible:'L’administration n’est pas chargée.',
    nom:'Nom requis.', message:'Message requis.', introuvable:'Campagne introuvable.', echec:'L’opération a échoué.' };
  function expliquer(r){ if (!r) return 'Aucune réponse de la fenêtre principale.'; if (r.detail) return String(r.detail); return MOTIFS[r.motif] || MOTIFS.echec; }
  function appeler(op, arg){ if (!P || !P.appeler) return Promise.resolve({ ok:false, motif:'indisponible' }); return P.appeler(op, arg).catch(function(){ return { ok:false, motif:'echec' }; }); }

  function charger(){
    var arg = TAB === 'segments' ? { filtre:SEGF } : {};
    return appeler(OP[TAB], arg).then(function(r){
      if (!r || !r.ok) { vide('Analytique indisponible', expliquer(r)); return false; }
      D = r; if (r.peut) PEUT = r.peut; return true;
    });
  }
  function vide(titre, detail){
    ongletsEl.innerHTML = '';
    corps.innerHTML = '<div class="vide"><div style="font:700 1.3rem/1 Georgia,serif;color:#e8dcc6">' + esc(titre) + '</div><div style="margin-top:.35rem">' + esc(detail || '') + '</div></div>';
  }
  function relire(){ return charger().then(function(ok){ if (ok) dessiner(); return ok; }); }

  function dessinerOnglets(){
    ongletsEl.innerHTML = ['overview','segments','promos','social','campaigns','satisfaction']
      .map(function(id){ return '<button data-tab="' + id + '" class="' + (TAB === id ? 'actif' : '') + '">' + LBL[id] + '</button>'; }).join('');
  }

  /* ══ VUE D ENSEMBLE ════════════════════════════════════════════════════════ */
  function vueOverview(){
    var maxRev = Math.max.apply(null, D.monthly.map(function(m){ return m.rev; }).concat([1]));
    var graph = D.monthly.map(function(m){
      var h1 = maxRev > 0 ? Math.max(m.rev > 0 ? 4 : 0, Math.round(m.rev / maxRev * 110)) : 0;
      var h2 = maxRev > 0 ? Math.max(m.promoRev > 0 ? 3 : 0, Math.round(m.promoRev / maxRev * 110)) : 0;
      return '<div class="col"><div class="val">' + (m.rev > 0 ? argentK(m.rev) : '') + '</div>'
        + '<div class="barz"><div class="b1" style="height:' + h1 + 'px"></div><div class="b2" style="height:' + h2 + 'px"></div></div>'
        + '<div class="lbl">' + esc(m.label) + '</div></div>';
    }).join('');
    var tops = D.topProds.length ? D.topProds.map(function(p, i){
      return '<div class="rang"><span class="pos">' + (i + 1) + '</span><div class="nm"><div>' + esc(p.name) + '</div>'
        + '<div style="font-size:.66rem;color:#8fa1b8">' + p.qty + ' vendu' + plur(p.qty) + '</div></div>'
        + '<div class="num" style="color:#e8dcc6;font-weight:700">' + argent(p.rev) + '</div></div>';
    }).join('') : '<div class="vide">Aucune vente.</div>';
    var recent = D.recent.length ? D.recent.map(function(o){
      var st = STATUTS[o.status] || ['def', o.status];
      return '<tr><td><code>' + esc(o.num) + '</code></td><td>' + esc(o.client || '—') + '</td>'
        + '<td style="color:#8fa1b8">' + esc(o.date) + '</td>'
        + '<td>' + (o.promo ? '<span class="badge err">' + esc(o.promo) + '</span>' : '<span style="color:#8fa1b8">—</span>') + '</td>'
        + '<td class="num" style="font-weight:700">' + argent(o.total) + '</td>'
        + '<td><span class="badge ' + st[0] + '">' + esc(st[1]) + '</span></td></tr>';
    }).join('') : '<tr><td colspan="6" class="vide">Aucune commande.</td></tr>';
    return '<div class="tuiles">'
      + '<div class="tuile"><div class="k"><span class="ic">💰</span> Revenu total</div><div class="v">' + argentK(D.totalRev) + '</div><div class="z">' + D.orderCount + ' commande' + plur(D.orderCount) + '</div></div>'
      + '<div class="tuile"><div class="k"><span class="ic">🎯</span> Revenu promo</div><div class="v">' + argentK(D.promoRev) + '</div><div class="z">' + D.pctPromo + '% des commandes</div></div>'
      + '<div class="tuile"><div class="k"><span class="ic">👥</span> Clients actifs</div><div class="v">' + D.activeCustomers + '</div><div class="z">' + D.totalCustomers + ' inscrits</div></div>'
      + '<div class="tuile"><div class="k"><span class="ic">🛒</span> Panier moyen</div><div class="v">' + argent(D.avgOrder) + '</div><div class="z">par commande</div></div>'
      + (D.loy ? '<div class="tuile"><div class="k"><span class="ic">💌</span> Réponse sondage</div><div class="v">' + D.loy.responseRate + '%</div><div class="z">' + D.loy.totalResponses + '/' + D.loy.totalInvites + (D.loy.avgRating ? ' · ' + D.loy.avgRating + '★' : '') + '</div></div>' : '')
      + '</div>'
      + '<div class="deux">'
      +   '<div class="carte"><h2>Revenu mensuel — 6 mois<span class="legend"><span><i style="background:#c9a97e"></i>Total</span><span><i style="background:#dc2626;opacity:.7"></i>Promo</span></span></h2><div class="graph">' + graph + '</div></div>'
      +   '<div class="carte"><h2><span class="ic">🏆</span> Top 5 produits</h2>' + tops + '</div>'
      + '</div>'
      + '<div class="carte"><h2>Commandes récentes</h2><table><thead><tr><th>Commande</th><th>Client</th><th>Date</th><th>Promo</th><th class="num">Total</th><th>Statut</th></tr></thead><tbody>' + recent + '</tbody></table></div>';
  }

  /* ══ SEGMENTS ══════════════════════════════════════════════════════════════ */
  function vueSegments(){
    var cards = D.segMeta.map(function(m){
      return '<div class="seg' + (SEGF === m.key ? ' pris' : '') + '" data-seg="' + m.key + '"><div class="n">' + (D.segCounts[m.key] || 0) + '</div><div class="l">' + esc(m.label) + '</div><div class="d">' + esc(m.desc) + '</div></div>';
    }).join('') + '<div class="seg' + (SEGF === 'promo' ? ' pris' : '') + '" data-seg="promo"><div class="n" style="color:#fca5a5">' + D.promoCnt + '</div><div class="l">Acheteurs promo</div><div class="d">Ont utilisé une offre</div></div>';
    var titre = SEGF === 'all' ? 'Tous les clients' : SEGF === 'promo' ? 'Acheteurs promo' : (function(){ var mm = D.segMeta.filter(function(x){ return x.key === SEGF; })[0]; return mm ? mm.label : SEGF; })();
    var rows = D.clients.length ? D.clients.map(function(c){
      var col = c.daysSince > 60 ? '#f87171' : c.daysSince > 30 ? '#fbbf24' : '#4ade80';
      return '<tr><td><strong>' + esc(c.nom || '—') + '</strong></td><td style="color:#8fa1b8">' + esc(c.email || '—') + '</td>'
        + '<td><span class="pill">' + esc(c.segLabel) + '</span></td><td class="ctr" style="font-weight:700">' + c.orderCount + '</td>'
        + '<td class="num" style="color:#e8dcc6;font-weight:600">' + argent(c.totalSpent) + '</td>'
        + '<td style="color:#8fa1b8">' + esc(c.lastO || '—') + (c.daysSince !== null ? ' <span style="color:' + col + ';font-size:.7rem">(' + c.daysSince + 'j)</span>' : '') + '</td>'
        + '<td class="ctr">' + (c.isPromo ? '<span style="color:#fca5a5;font-weight:700">✓</span>' : '<span style="color:#8fa1b8">—</span>') + '</td></tr>';
    }).join('') : '<tr><td colspan="7" class="vide">Aucun client dans ce segment.</td></tr>';
    var reste = (D.filteredTotal > 50) ? '<tr><td colspan="7" class="vide">+' + (D.filteredTotal - 50) + ' autres — exportez en CSV pour la liste complète</td></tr>' : '';
    return '<div class="segc">' + cards + '</div>'
      + '<div class="carte"><h2>' + esc(titre) + ' — ' + D.filteredTotal + ' client' + plur(D.filteredTotal) + '<span style="display:flex;gap:.5rem">'
      +   '<button class="ghost mini" data-act="export">⬇ Exporter CSV</button>'
      +   (D.avecCourriel > 0 && PEUT.edit ? '<button class="prim mini" data-act="cibler"><span class="ic">📢</span> Cibler ce segment</button>' : '')
      + '</span></h2>'
      + '<table><thead><tr><th>Client</th><th>Courriel</th><th>Segment</th><th class="ctr">Cmd</th><th class="num">Dépense</th><th>Dernière cmd</th><th class="ctr">Promo</th></tr></thead><tbody>' + rows + reste + '</tbody></table></div>';
  }

  /* ══ PROMOTIONS ════════════════════════════════════════════════════════════ */
  function vuePromos(){
    var t = D.totaux;
    var rows = D.perfs.length ? D.perfs.map(function(p){
      return '<tr><td><strong>' + esc(p.name) + '</strong><div style="font-size:.66rem;color:#8fa1b8">' + esc(p.period) + '</div></td>'
        + '<td><span class="badge ' + (p.type === 'discount' ? 'err' : 'info') + '">' + (p.type === 'discount' ? 'Rabais auto' : 'Coupon') + '</span></td>'
        + '<td><strong style="color:#fca5a5">' + esc(p.badge) + '</strong></td>'
        + '<td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.76rem">' + esc(p.scope) + '</td>'
        + '<td class="ctr" style="font-weight:700">' + p.orders + '</td>'
        + '<td class="num">' + (p.orders > 0 ? argent(p.revenue) : '—') + '</td>'
        + '<td class="num" style="color:#fca5a5">' + (p.savings > 0 ? '-' + argent(p.savings) : '—') + '</td>'
        + '<td><span class="badge ' + (p.active ? 'ok' : 'def') + '">' + (p.active ? 'Actif' : 'Inactif') + '</span></td></tr>';
    }).join('') : '<tr><td colspan="8" class="vide">Aucune promotion.</td></tr>';
    return '<div class="tuiles">'
      + '<div class="tuile"><div class="k"><span class="ic">📣</span> Promotions</div><div class="v">' + t.count + '</div><div class="z">' + t.active + ' active' + plur(t.active) + '</div></div>'
      + '<div class="tuile"><div class="k"><span class="ic">📦</span> Cmd sous promo</div><div class="v">' + t.promoOrders + '</div><div class="z">' + t.promoConvRate + '% des cmd</div></div>'
      + '<div class="tuile"><div class="k"><span class="ic">💰</span> Revenu (promo)</div><div class="v">' + argentK(t.totalPromoRev) + '</div></div>'
      + '<div class="tuile"><div class="k"><span class="ic">🎁</span> Économies accordées</div><div class="v">' + argentK(t.totalSavings) + '</div></div>'
      + '</div>'
      + '<div class="carte"><h2>Toutes les offres &amp; coupons</h2><table><thead><tr><th>Nom</th><th>Type</th><th>Rabais</th><th>Portée</th><th class="ctr">Cmd</th><th class="num">Revenu</th><th class="num">Économies</th><th>Statut</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /* ══ ATTRIBUTION SOCIALE + UTM ═════════════════════════════════════════════ */
  function lienUtm(){
    var med = UTM.source === 'email' ? 'email' : 'social';
    return (D.base || '') + '?utm_source=' + encodeURIComponent(UTM.source) + '&utm_medium=' + med + '&utm_campaign=' + encodeURIComponent(UTM.campaign) + UTM.dest;
  }
  function vueSocial(){
    var posts = D.posts.length ? D.posts.map(function(p){
      return '<tr><td style="white-space:nowrap;font-size:.74rem">' + esc(p.date) + '</td><td style="font-size:.74rem">' + esc(p.networks) + '</td>'
        + '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.76rem" title="' + esc(p.content) + '">' + esc(p.content || '—') + '</td>'
        + '<td class="ctr"><strong style="color:' + (p.orders48h > 0 ? '#4ade80' : '#8fa1b8') + '">' + p.orders48h + '</strong></td>'
        + '<td class="num" style="color:' + (p.revenue48h > 0 ? '#e8dcc6' : '#8fa1b8') + '">' + (p.revenue48h > 0 ? argent(p.revenue48h) : '—') + '</td></tr>';
    }).join('') : '<tr><td colspan="5" class="vide">Aucune publication dans l’historique.</td></tr>';
    var recs = D.recs.length ? D.recs.map(function(r){
      return '<div class="rec">' + r.icon + ' ' + esc(r.txt) + ' <button class="ghost mini" data-cibler="' + esc(r.seg) + '">Cibler →</button></div>';
    }).join('') : '<div style="color:#8fa1b8;font-size:.82rem">Continuez à accumuler des données pour obtenir des recommandations.</div>';
    var src = ['facebook','instagram','pinterest','tiktok','email'].map(function(s){ return '<option value="' + s + '"' + (UTM.source === s ? ' selected' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>'; }).join('');
    var dst = [['#shop','Boutique'],['#shop?cat=robes','Robes'],['#shop?cat=hauts','Hauts'],['#shop?cat=accessoires','Accessoires'],['#giftcard','Cartes-cadeaux']].map(function(d){ return '<option value="' + d[0] + '"' + (UTM.dest === d[0] ? ' selected' : '') + '>' + d[1] + '</option>'; }).join('');
    return '<div class="deuxb">'
      + '<div class="carte"><h2>Publications sociales &amp; impact ventes</h2>'
      +   '<div style="font-size:.72rem;color:#8fa1b8;margin:-.3rem 0 .4rem">Commandes passées dans les 48 h suivant chaque publication</div>'
      +   '<table><thead><tr><th>Date</th><th>Réseaux</th><th>Contenu</th><th class="ctr">Cmd 48h</th><th class="num">Revenu 48h</th></tr></thead><tbody>' + posts + '</tbody></table></div>'
      + '<div style="display:flex;flex-direction:column;gap:.85rem">'
      +   '<div class="carte"><h2><span class="ic">🔗</span> Liens UTM trackés</h2>'
      +     '<div class="champ"><label>Source</label><select id="utm-source" data-utm="source">' + src + '</select></div>'
      +     '<div class="champ"><label>Campagne</label><input id="utm-campaign" data-utm="campaign" value="' + esc(UTM.campaign) + '"></div>'
      +     '<div class="champ"><label>Destination</label><select id="utm-dest" data-utm="dest">' + dst + '</select></div>'
      +     '<div class="champ" style="margin-bottom:0"><label>Lien généré</label><div style="display:flex;gap:.35rem">'
      +       '<input id="utm-result" readonly class="mono" style="font-size:.66rem" value="' + esc(lienUtm()) + '"><button class="ghost mini" data-act="copyutm">Copier</button></div></div>'
      +   '</div>'
      +   '<div class="carte"><h2><span class="ic">💡</span> Recommandations</h2>' + recs + '</div>'
      + '</div></div>';
  }

  /* ══ CAMPAGNES ═════════════════════════════════════════════════════════════ */
  function vueCampaigns(){
    var rows = D.camps.length ? D.camps.map(function(c){
      return '<tr><td><strong>' + esc(c.name) + '</strong>' + (c.promoLabel ? '<div style="font-size:.68rem;color:#e8dcc6"><span class="ic">🎯</span> ' + esc(c.promoLabel) + '</div>' : '') + '</td>'
        + '<td>' + esc(c.segLabel) + '</td><td><strong>' + c.audienceCount + '</strong> contact' + plur(c.audienceCount) + '</td>'
        + '<td style="font-size:.74rem;color:#8fa1b8">' + esc(c.channels || '—') + '</td><td style="font-size:.74rem;color:#8fa1b8">' + esc(c.date) + '</td>'
        + '<td><span class="badge ' + (c.status === 'sent' ? 'ok' : 'warn') + '">' + (c.status === 'sent' ? 'Envoyée' : 'Brouillon') + '</span></td>'
        + '<td class="num">' + (PEUT.edit ? ((c.status !== 'sent' ? '<button class="prim mini" data-launch="' + esc(c.id) + '">Lancer</button> ' : '') + '<button class="ghost mini" data-del="' + esc(c.id) + '" style="color:#f87171">✕</button>') : '') + '</td></tr>';
    }).join('') : '<tr><td colspan="7" class="vide">Aucune campagne. Créez la première !</td></tr>';
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">'
      + '<div style="font-size:.82rem;color:#8fa1b8">Créez des campagnes ciblées combinant publication sociale et infolettre selon les segments.</div>'
      + (PEUT.edit ? '<button class="prim" data-act="newcamp">+ Nouvelle campagne</button>' : '') + '</div>'
      + '<div class="carte"><table><thead><tr><th>Nom</th><th>Segment</th><th>Audience</th><th>Canaux</th><th>Date</th><th>Statut</th><th class="num">Actions</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  function vueForm(){
    var segs = [['all','Tous les clients'],['nouveau','Nouveaux (1 cmd)'],['regulier','Réguliers (2-4 cmd)'],['vip','VIP (5+ cmd ou 500 $+)'],['inactif','Inactifs (90j+)'],['promo','Acheteurs promo']]
      .map(function(s){ return '<option value="' + s[0] + '"' + (FORM.seg0 === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('');
    var promos = '<option value="">Aucune promotion liée</option>' + FORM.promos.map(function(p){ return '<option value="' + esc(p.id) + '">' + esc(p.label) + '</option>'; }).join('');
    return '<div class="voile" id="cf-voile"><div class="boite"><h3>Nouvelle campagne ciblée</h3>'
      + '<div class="champ"><label>Nom de la campagne *</label><input id="cf-name" placeholder="Promo Été 2026"></div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.7rem">'
      +   '<div class="champ"><label>Segment ciblé</label><select id="cf-seg">' + segs + '</select></div>'
      +   '<div class="champ"><label>Audience estimée</label><div class="aud" id="cf-aud">' + FORM.audienceCount + ' contact' + plur(FORM.audienceCount) + '</div></div>'
      + '</div>'
      + '<div class="champ"><label>Promotion associée (optionnel)</label><select id="cf-promo">' + promos + '</select></div>'
      + '<div class="champ"><label>Message *</label><textarea id="cf-msg" rows="3" placeholder="Découvrez nos offres exclusives ! 🎉"></textarea></div>'
      + '<div class="champ"><label>Canaux de diffusion</label><div class="chans">'
      +   '<label><input type="checkbox" id="cf-ch-facebook" checked> <span class="ic">📘</span> Facebook</label>'
      +   '<label><input type="checkbox" id="cf-ch-instagram" checked> <span class="ic">📷</span> Instagram</label>'
      +   '<label><input type="checkbox" id="cf-ch-newsletter"> <span class="ic">📧</span> Infolettre</label>'
      +   '<label><input type="checkbox" id="cf-ch-pinterest"> <span class="ic">📌</span> Pinterest</label>'
      + '</div></div>'
      + '<div class="pied-boite"><button class="gauche" data-cf="annuler">Annuler</button>'
      +   '<button data-cf="brouillon">Sauvegarder brouillon</button>'
      +   '<button class="prim" data-cf="lancer">Sauvegarder &amp; Lancer</button></div>'
      + '</div></div>';
  }

  /* ══ SATISFACTION ══════════════════════════════════════════════════════════ */
  function vueSatisfaction(){
    if (D.indisponible) return '<div class="vide">Module chat non chargé.</div>';
    if (!D.rated) return '<div class="carte"><div class="vide"><div style="font-size:2rem"><span class="ic">💬</span></div>Aucune évaluation chat pour le moment.<br><span style="font-size:.8rem">Les données apparaissent après que des clients aient noté leur conversation.</span></div></div>';
    var bar = function(v, tot, col){ var pct = tot ? Math.round(v / tot * 100) : 0; return '<div class="satbar"><div class="track"><div style="width:' + pct + '%;background:' + col + '"></div></div><span style="font-size:.78rem;color:#8fa1b8;width:66px;text-align:right">' + v + ' (' + pct + '%)</span></div>'; };
    var comments = D.comments.length ? '<div class="carte"><h2>Commentaires récents</h2>' + D.comments.map(function(c){
      return '<div style="display:flex;gap:.7rem;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,.055)"><span style="font-size:1.1rem">' + (c.score ? '<span class="ic">👍</span>' : '<span class="ic">👎</span>') + '</span>'
        + '<div style="flex:1;min-width:0"><div style="font-size:.83rem">"' + esc(c.comment) + '"</div><div style="font-size:.7rem;color:#8fa1b8;margin-top:.1rem">' + esc(c.name) + ' · ' + esc(c.date) + '</div></div></div>';
    }).join('') + '</div>' : '';
    return '<div class="tuiles">'
      + '<div class="tuile" style="text-align:center"><div class="v" style="color:' + (D.rate >= 70 ? '#4ade80' : '#f87171') + ';font-size:2rem">' + D.rate + '%</div><div class="z">Taux de satisfaction</div></div>'
      + '<div class="carte" style="grid-column:span 2"><h2>Répartition des évaluations</h2>'
      +   '<div style="font-size:.8rem;margin-bottom:.2rem"><span class="ic">👍</span> Satisfaits</div>' + bar(D.satisfied, D.rated, '#4ade80')
      +   '<div style="font-size:.8rem;margin-bottom:.2rem"><span class="ic">👎</span> Insatisfaits</div>' + bar(D.unsatisfied, D.rated, '#f87171')
      +   '<div style="font-size:.74rem;color:#8fa1b8;margin-top:.4rem">' + D.rated + ' éval. sur ' + D.total + ' conversations (' + (D.total ? Math.round(D.rated / D.total * 100) : 0) + '% de couverture)</div></div>'
      + '</div>' + comments;
  }

  /* ══ DESSIN ════════════════════════════════════════════════════════════════ */
  function dessiner(){
    if (!D) return;
    dessinerOnglets();
    sous.textContent = PEUT.edit ? '' : 'Lecture seule';
    var h = TAB === 'segments' ? vueSegments() : TAB === 'promos' ? vuePromos()
      : TAB === 'social' ? vueSocial() : TAB === 'campaigns' ? vueCampaigns()
      : TAB === 'satisfaction' ? vueSatisfaction() : vueOverview();
    if (FORM && TAB === 'campaigns') h += vueForm();
    corps.innerHTML = h;
  }

  /* ══ GESTES ════════════════════════════════════════════════════════════════ */
  function exporter(){
    appeler('analytics:segExport', { seg:SEGF }).then(function(r){
      if (r && r.ok) dire(r.n + ' client' + plur(r.n) + ' exporté' + plur(r.n) + ' dans la fenêtre principale.', 'bon');
      else dire('⚠ ' + expliquer(r), 'err');
    });
  }
  function ouvrirForm(seg){
    appeler('analytics:campForm', { seg: seg || 'all' }).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      FORM = { seg0:r.seg0, audienceCount:r.audienceCount, promos:r.promos };
      if (TAB !== 'campaigns') { TAB = 'campaigns'; charger().then(function(ok){ if (ok) dessiner(); }); }
      else dessiner();
    });
  }
  function majAudience(){
    var seg = val('cf-seg');
    appeler('analytics:audience', { seg:seg }).then(function(r){
      var el = document.getElementById('cf-aud');
      if (el && r && r.ok) el.textContent = r.count + ' contact' + (r.count !== 1 ? 's' : '');
    });
  }
  function enregistrerCamp(launch){
    var channels = ['facebook','instagram','newsletter','pinterest'].filter(function(c){ return chk('cf-ch-' + c); });
    var d = { name:val('cf-name'), segment:val('cf-seg'), promoId:val('cf-promo') || null, message:val('cf-msg'), channels:channels, launch:launch };
    dire('Enregistrement…');
    appeler('analytics:campSave', d).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      FORM = null;
      relire().then(function(){
        var m = r.launched ? ('Campagne lancée ! ' + r.audienceCount + ' contact' + plur(r.audienceCount) + (r.mailCount ? ' · ' + r.mailCount + ' courriel' + plur(r.mailCount) + ' ciblé' + plur(r.mailCount) : '')) : 'Brouillon enregistré.';
        dire(m, 'bon');
      });
    });
  }
  function copierUtm(){
    var el = document.getElementById('utm-result'); if (!el) return;
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(el.value).then(function(){ dire('Lien copié.', 'bon'); }).catch(function(){ el.select(); document.execCommand('copy'); dire('Lien copié.', 'bon'); });
      else { el.select(); document.execCommand('copy'); dire('Lien copié.', 'bon'); }
    } catch(e){ dire('Copie impossible.', 'err'); }
  }

  document.addEventListener('click', function(e){
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('button'); var seg = t.closest('[data-seg]');
    if (FORM) {
      if (!b) return;
      var cf = b.getAttribute('data-cf');
      if (cf === 'annuler') { FORM = null; dessiner(); return; }
      if (cf === 'brouillon') { enregistrerCamp(false); return; }
      if (cf === 'lancer') { enregistrerCamp(true); return; }
      return;
    }
    if (seg && !b) { SEGF = seg.getAttribute('data-seg'); charger().then(function(ok){ if (ok) dessiner(); }); return; }
    if (!b) return;
    var g = function(n){ return b.getAttribute(n); };
    if (g('data-tab')) { TAB = g('data-tab'); charger().then(function(ok){ if (ok) dessiner(); }); return; }
    var act = g('data-act');
    if (act === 'export') exporter();
    else if (act === 'cibler') ouvrirForm(SEGF);
    else if (act === 'newcamp') ouvrirForm('all');
    else if (act === 'copyutm') copierUtm();
    else if (g('data-cibler')) { SEGF = g('data-cibler'); TAB = 'segments'; charger().then(function(ok){ if (ok) dessiner(); }); }
    else if (g('data-launch')) { appeler('analytics:campLaunch', { id:g('data-launch') }).then(function(r){ if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; } relire().then(function(){ dire('Campagne lancée.', 'bon'); }); }); }
    else if (g('data-del')) { appeler('analytics:campDelete', { id:g('data-del') }).then(function(r){ if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; } relire().then(function(){ dire('Campagne supprimée.', 'att'); }); }); }
  });

  document.addEventListener('change', function(e){
    var t = e.target; if (!t || !t.getAttribute) return;
    if (t.id === 'cf-seg') { majAudience(); return; }
    var u = t.getAttribute('data-utm');
    if (u) { UTM[u] = t.value; var r = document.getElementById('utm-result'); if (r) r.value = lienUtm(); }
  });
  document.addEventListener('input', function(e){
    var t = e.target; if (!t || !t.getAttribute) return;
    if (t.getAttribute('data-utm') === 'campaign') { UTM.campaign = t.value; var r = document.getElementById('utm-result'); if (r) r.value = lienUtm(); }
  });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    if (FORM) { FORM = null; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });

  window.szModeAncre = function(actif){ document.documentElement.classList.toggle('ancre', !!actif); };

  charger().then(function(ok){
    if (!ok) return;
    dessiner();
    ${ouvreForm ? 'if (PEUT.edit) ouvrirForm("all");' : ''}
  });
})();
</script></body></html>`;
}

module.exports = { pagePublicite };
