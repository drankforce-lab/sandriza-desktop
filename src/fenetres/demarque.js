'use strict';
/*
 * DÉMARQUE INTELLIGENTE — fenêtre native (2026-11-22, grand chantier)
 * =============================================================================
 * Le moteur vit côté site (assets/js/demarque.js) : les pièces qui dorment, le rabais gradué proposé (plafonné au
 * coût d'achat + 10 %), et son effet. Cette fenêtre montre la liste, laisse cocher et ajuster le rabais, puis crée les
 * promotions (une par palier de rabais) pour la durée choisie.
 *
 *   demarque:donnees → { lignes, minces, resume, peutAppliquer }
 *   demarque:appliquer ([{ productId, rabais }], { jours }) → { ok, faites, refus, fin }
 *
 * ⚠ AUCUNE GLISSIÈRE : la liste est paginée par le socle (data-pages).
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script.
 */
const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
const T = require('../langue').tr('demarque');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{margin:0;font:700 .95rem/1.2 system-ui}
.tete .ico{display:inline-flex;width:19px;height:19px;color:var(--or)}
.tete .ico svg{width:100%;height:100%}
.tete .dm-outils{margin-left:auto;display:flex;gap:.6rem;align-items:center}
.tete label{font-size:.76rem;color:var(--tx2);font-weight:600}
select,button{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.3rem .5rem;cursor:pointer}
select:focus,button:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
#corps{flex:1 1 auto;min-height:0;overflow:hidden;padding:.8rem 1.1rem .7rem;display:flex;flex-direction:column;gap:.65rem}
.pied{flex:0 0 auto;padding:.35rem 1.1rem;border-top:1px solid var(--v08);min-height:1.9rem;font-size:.8rem}
.msg.bon{color:var(--tx-ok)} .msg.err{color:var(--tx-err)} .msg.att{color:var(--tx-att)}
.resume{font-size:.9rem;color:var(--tx);margin:0}
.resume b{font-weight:800}
.avis{font-size:.8rem;color:var(--tx2);margin:0}
.fc{background:var(--f-carte);border:1px solid var(--v08);border-radius:14px;padding:.8rem 1rem;display:flex;flex-direction:column;gap:.5rem;min-height:0;flex:1 1 auto}
.tab-z{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.tab-z table{flex:0 0 auto}
table{width:100%;border-collapse:collapse;font-size:.82rem;table-layout:fixed}
col.c-x{width:2.2rem} col.c-nom{width:auto} col.c-n{width:5rem} col.c-px{width:9.5rem} col.c-r{width:6.2rem} col.c-m{width:8.5rem}
thead th{text-align:left;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);padding:.4rem .4rem;border-bottom:1px solid var(--v08);font-weight:700;white-space:nowrap}
thead th.n{text-align:right}
tbody td{padding:.42rem .4rem;border-bottom:1px solid var(--v05);vertical-align:middle}
td.n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
td.nom{overflow:hidden}
td.nom .dm-n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
td.nom .dm-s{font-size:.72rem;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
tr.deja td{opacity:1;color:var(--tx2)}
tr.deja td.nom .dm-n{color:var(--tx2)}
.barre{text-decoration:line-through;color:var(--tx2);margin-right:.3rem}
.dm-r select{width:100%}
.dm-act{display:flex;gap:.6rem;justify-content:flex-end;align-items:center}
input[type=checkbox]{width:16px;height:16px;accent-color:var(--or)}
`;

function pageDemarque() {
  return `${TETE()}
<title>${T("Démarque intelligente — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.demarque}</span><h1>${T("Démarque intelligente")}</h1>
  <div class="dm-outils"><label for="dm-j">${T("Durée des promotions")}</label><select id="dm-j"><option value="14">${T("14 jours")}</option><option value="21" selected>${T("21 jours")}</option><option value="30">${T("30 jours")}</option><option value="45">${T("45 jours")}</option></select></div></div>
<div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var D = null, SEL = {}, RAB = {}, OCCUPE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne permet pas de créer des promotions.")}',
    indisponible:       '${T("Le module de démarque n’est pas chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    priorite:           '${T("Une autre promotion occupe déjà cette priorité. Réessayez.")}',
    nuage:              '${T("Le serveur n’a pas pris la promotion. Vérifiez la connexion, puis réessayez.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m = r && r.motif; return MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').'); }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  var RAISONS = {
    'dort-180': '${T("{0} jours sans vente")}', 'dort-90': '${T("{0} jours sans vente")}', 'dort-60': '${T("{0} jours sans vente")}',
    orphelines: '${T("Tailles orphelines")}', lent: '${T("Écoulement lent ({1} % en 90 jours)")}'
  };
  function raison(l){ return (RAISONS[l.raison] || '').split('{0}').join(String(l.sansVente)).split('{1}').join(String(l.ecoulement)); }
  function nbSel(){ var n = 0; for (var k in SEL) if (SEL[k]) n++; return n; }
  function prixApres(l){ var r = RAB[l.productId] || l.rabais; return Math.round(l.prix * (1 - r / 100) * 100) / 100; }

  function dessiner(){
    if (!D) return;
    var r = D.resume;
    var h = '<p class="resume">' + (r.pieces
      ? '${T("{0} pièces dorment : {1} unités, {2} immobilisés au coût d’achat. Démarquées, elles rapporteraient environ {3}.")}'
          .split('{0}').join('<b>' + r.pieces + '</b>').split('{1}').join(String(r.unites)).split('{2}').join('<b>' + esc(szArgent(r.immobilise)) + '</b>').split('{3}').join('<b>' + esc(szArgent(r.revenu)) + '</b>')
      : '${T("Aucune pièce ne dort : rien à démarquer pour le moment.")}') + '</p>';
    var notes = [];
    if (r.dejaPromo) notes.push('${T("{0} déjà en promotion (non proposées).")}'.split('{0}').join(String(r.dejaPromo)));
    if (r.minces) notes.push('${T("{0} à marge trop mince (sous le coût + 10 %) : non proposées.")}'.split('{0}').join(String(r.minces)));
    notes.push('${T("Le rabais ne descend jamais sous le coût d’achat + 10 %.")}');
    h += '<p class="avis">' + notes.join(' ') + '</p>';
    var L = D.lignes || [];
    h += '<section class="fc"><div class="tab-z"><table><colgroup><col class="c-x"><col class="c-nom"><col class="c-n"><col class="c-px"><col class="c-r"><col class="c-m"></colgroup>'
      + '<thead><tr><th><input type="checkbox" id="dm-tout" aria-label="${T("Tout cocher")}"></th><th>${T("Pièce")}</th><th class="n">${T("Stock")}</th><th class="n">${T("Prix")}</th><th>${T("Rabais")}</th><th class="n">${T("Marge / pièce")}</th></tr></thead>'
      + '<tbody data-pages="demarque">' + L.map(function(l){
        var deja = l.dejaPromo, r2 = RAB[l.productId] || l.rabais, np = prixApres(l);
        var opts = ''; for (var v = 10; v <= l.rabais; v += 5) opts += '<option value="' + v + '"' + (v === r2 ? ' selected' : '') + '>' + v + ' %</option>';
        var m = deja ? '—' : (l.sansCout ? '<span class="dm-s">${T("coût inconnu")}</span>' : esc(szArgent(Math.round((np - l.cout) * 100) / 100)));
        return '<tr class="' + (deja ? 'deja' : '') + '"><td>' + (deja ? '' : '<input type="checkbox" data-dm="' + esc(l.productId) + '"' + (SEL[l.productId] ? ' checked' : '') + ' aria-label="' + esc(l.nom) + '">') + '</td>'
          + '<td class="nom"><div class="dm-n" title="' + esc(l.nom) + '">' + esc(l.nom) + '</div><div class="dm-s">' + esc(deja ? '${T("Déjà en promotion")}' : raison(l)) + '</div></td>'
          + '<td class="n">' + l.stock + '</td><td class="n">' + (deja ? esc(szArgent(l.prix)) : '<span class="barre">' + esc(szArgent(l.prix)) + '</span>' + esc(szArgent(np))) + '</td>'
          + '<td class="dm-r">' + (deja ? '—' : '<select data-dmr="' + esc(l.productId) + '" aria-label="${T("Rabais")}">' + opts + '</select>') + '</td>'
          + '<td class="n">' + m + '</td></tr>';
      }).join('') + '</tbody></table></div>'
      + (D.peutAppliquer && r.pieces ? '<div class="dm-act"><button type="button" class="prim" id="dm-ok"' + (nbSel() ? '' : ' disabled') + '>' + '${T("Créer les promotions ({0})")}'.split('{0}').join(String(nbSel())) + '</button></div>' : '')
      + '</section>';
    corps.innerHTML = h;
  }
  function charger(){
    appeler('demarque:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + esc(expliquer(r)) + '</div>'; return; }
      D = r; dessiner();
    });
  }
  document.addEventListener('change', function(ev){
    var t = ev.target; if (!t || !D) return;
    var id = t.getAttribute && t.getAttribute('data-dm');
    if (id) { SEL[id] = !!t.checked; dessiner(); return; }
    var idr = t.getAttribute && t.getAttribute('data-dmr');
    if (idr) { RAB[idr] = Number(t.value) || 0; dessiner(); return; }
    if (t.id === 'dm-tout') { SEL = {}; if (t.checked) D.lignes.forEach(function(l){ if (!l.dejaPromo) SEL[l.productId] = true; }); dessiner(); }
  });
  document.addEventListener('click', function(ev){
    var b = ev.target && ev.target.closest ? ev.target.closest('#dm-ok') : null;
    if (!b || OCCUPE || !D) return;
    var choix = D.lignes.filter(function(l){ return SEL[l.productId] && !l.dejaPromo; }).map(function(l){ return { productId: l.productId, rabais: RAB[l.productId] || l.rabais }; });
    if (!choix.length) return;
    var j = Number(document.getElementById('dm-j').value) || 21;
    szConfirmer({ titre: '${T("Créer les promotions")}',
      texte: '${T("{0} pièces seront démarquées pendant {1} jours, une promotion par palier de rabais. Elles paraîtront aussitôt dans la boutique.")}'.split('{0}').join(String(choix.length)).split('{1}').join(String(j)),
      oui: '${T("Créer les promotions")}' }).then(function(ok){
      if (!ok) return;
      OCCUPE = true; szDire('${T("Création des promotions…")}', 'att');
      appeler('demarque:appliquer', [choix, { jours: j }]).then(function(r){
        OCCUPE = false;
        if (!r || !r.ok) { szDire(expliquer(r && r.refus && r.refus[0] ? r.refus[0] : r), 'err'); return; }
        var f = (r.faites || []).map(function(x){ return x.produits + ' × ' + x.rabais + ' %'; }).join(', ');
        szDire('${T("Promotions créées jusqu’au {0} : {1}.")}'.split('{0}').join(String(r.fin)).split('{1}').join(f)
          + ((r.refus || []).length ? ' ${T("Refusées : {0}.")}'.split('{0}').join(String(r.refus.length)) : ''), (r.refus || []).length ? 'att' : 'bon');
        SEL = {}; RAB = {}; charger();
      });
    });
  });
  document.addEventListener('keydown', function(ev){
    if (ev.key !== 'Escape') return;
    if (document.querySelector('.szc-voile')) return;
    ev.preventDefault(); if (P && P.fermer) P.fermer();
  });
  function rechargerSiLibre(){ if (!OCCUPE) charger(); }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) rechargerSiLibre(); });
  window.szActualiser = rechargerSiLibre;
  window.szRevenir = rechargerSiLibre;
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id = 'sz-detacher'; b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;flex:0 0 auto');
      t.appendChild(b); }
    if (actif) { b.textContent = '${T("⧉ Détacher")}'; b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}'; b.onclick = function(){ if (P && P.detacher) P.detacher(); }; }
    else { b.textContent = '${T("⚓ Ancrer")}'; b.title = '${T("Ramener cet écran dans la fenêtre principale")}'; b.onclick = function(){ if (P && P.ancrer) P.ancrer(); }; }
  };
  charger();
})();
</script></body></html>`;
}

module.exports = { pageDemarque };
