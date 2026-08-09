'use strict';

/*
 * FENÊTRE « RECOMMANDATIONS » — NATIVE (1.72.0, palier 4)
 * =============================================================================
 * Trois onglets : RÈGLES (l'ordre décide de ce que la cliente voit en premier
 * sur une fiche), LIAISONS MANUELLES (rapprocher deux produits à la main) et
 * STATISTIQUES (la couverture de chaque règle, les articles qui reviennent).
 *
 * ⚠ NE COUVRE PAS LE GÉNÉRATEUR D'AGENCEMENT : c'est un composeur visuel, où
 * l'on assemble une tenue à l'œil. Le porter en fenêtre demanderait de refaire
 * l'assemblage lui-même, pas seulement son cadre — il reste à l'écran web.
 *
 * ⚠ UNE RÈGLE PAR DÉFAUT SUPPRIMÉE N'EST PAS DÉTRUITE : elle est mise de côté
 * et se restaure. La fenêtre les montre, sans quoi on croirait les avoir
 * perdues.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

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
input,select,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:190px}
input[type=checkbox]{width:auto;margin:0}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.geste{padding:.14rem .5rem;font-size:.73rem;white-space:nowrap}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
button .n{display:inline-block;margin-left:.3rem;font-size:.66rem;font-weight:700;
  background:rgba(148,163,184,.18);border-radius:99px;padding:0 .4rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:#8fa1b8;font-weight:700}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.32rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody tr:hover td{background:rgba(255,255,255,.04)}
.num{text-align:right;white-space:nowrap}
.fin{white-space:nowrap;text-align:right}
.rang{font-family:'Courier New',monospace;color:#8fa1b8;width:2.2rem}
.dt{font-size:.72rem;color:#8fa1b8}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap;margin-right:.2rem}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.jauge{height:.4rem;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;min-width:5rem}
.jauge i{display:block;height:100%;background:#c9a97e}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  max-width:36rem;width:100%;max-height:86vh;display:flex;flex-direction:column;padding:.9rem 1rem}
.boite h3{margin:0 0 .6rem;font:700 .98rem/1.3 Georgia,serif}
.choix{flex:1 1 auto;min-height:6rem;overflow:auto;border:1px solid rgba(255,255,255,.1);
  border-radius:9px;padding:.4rem .5rem}
.choix label{display:flex;align-items:center;gap:.45rem;padding:.14rem 0;font-size:.83rem}
.choix .sku{font-family:'Courier New',monospace;font-size:.72rem;color:#8fa1b8;margin-left:auto}
.pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.8rem;flex-wrap:wrap}
.vide{padding:1.3rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Recommandations ». */
function pageRecommandations() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Recommandations — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">✨</span><h1>Recommandations</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
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
  var STATS = null;
  var ONGLET = 'regles';     // regles | liaisons | stats
  var ARME = '';
  var LIAISON = null;        // { id, nom, choisis:[] } en cours d'édition
  var QPROD = '';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux recommandations.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cet élément n’existe plus.',
    bord:               'Cette règle est déjà au bout de la liste.',
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
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function vueRegles(){
    var h = '<div class="carte"><h2>Ordre d’affichage</h2>'
      + '<div class="dt" style="margin-bottom:.45rem">Une règle plus haute passe avant : '
      + 'c’est elle que la cliente voit en premier sur une fiche.</div>';
    if (!(D.regles || []).length) {
      h += '<div class="vide">Aucune règle. La création se fait dans l’écran Recommandations '
        + 'de la fenêtre principale.</div>';
    } else {
      h += '<table><thead><tr><th></th><th>Règle</th><th>Type</th><th>Affichée sur</th>'
        + '<th class="num">Max</th><th>État</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + D.regles.map(function(r, i){
            var gestes = '';
            if (D.peutModifier) {
              gestes = '<button class="mini geste" data-monter="' + esc(r.id) + '"'
                + (r.premiere ? ' disabled' : '') + ' title="Monter">&#9650;</button> '
                + '<button class="mini geste" data-descendre="' + esc(r.id) + '"'
                + (r.derniere ? ' disabled' : '') + ' title="Descendre">&#9660;</button> '
                + '<button class="mini geste" data-basculer="' + esc(r.id) + '" data-actif="'
                + (r.active ? '0' : '1') + '">' + (r.active ? 'Désactiver' : 'Activer') + '</button> '
                + '<button class="mini geste danger" data-suppr="' + esc(r.id) + '" data-defaut="'
                + (r.pardefaut ? '1' : '0') + '">' + (ARME === r.id ? 'Confirmer ?' : 'Supprimer') + '</button>';
            }
            return '<tr><td class="rang">' + (i + 1) + '</td>'
              + '<td><strong>' + esc(r.nom) + '</strong>'
              + (r.pardefaut ? ' <span class="pill neutre">par défaut</span>' : '') + '</td>'
              + '<td class="dt">' + esc(r.typeLibelle) + '</td>'
              + '<td>' + (r.ou.length
                  ? r.ou.map(function(x){ return '<span class="pill neutre">' + esc(x) + '</span>'; }).join('')
                  : '<span class="dt">—</span>') + '</td>'
              + '<td class="num">' + (r.max || '—') + '</td>'
              + '<td><span class="pill ' + (r.active ? 'bon' : 'neutre') + '">'
              + (r.active ? 'Active' : 'Inactive') + '</span></td>'
              + (D.peutModifier ? '<td class="fin">' + gestes + '</td>' : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    /* Les regles par defaut RETIREES : sans cette liste on les croirait
       perdues, alors qu elles se restaurent d un clic. */
    if ((D.supprimees || []).length) {
      h += '<div class="carte"><h2>Règles par défaut retirées</h2>'
        + '<div class="dt" style="margin-bottom:.4rem">Elles ne sont pas détruites : '
        + 'vous pouvez les remettre en service.</div>'
        + D.supprimees.map(function(s){
            return '<div style="display:flex;align-items:center;gap:.5rem;padding:.25rem 0">'
              + '<strong>' + esc(s.nom) + '</strong>'
              + '<span class="dt">' + esc(s.typeLibelle) + '</span>'
              + (D.peutModifier
                  ? '<button class="mini geste" style="margin-left:auto" data-restaurer="' + esc(s.id) + '">Restaurer</button>'
                  : '') + '</div>';
          }).join('')
        + '</div>';
    }
    return h;
  }

  function vueLiaisons(){
    var ls = D.liaisons || [];
    var h = '<div class="barreoutils">'
      + (D.peutModifier ? '<button class="mini prim" id="rc-lier">Associer des produits</button>' : '')
      + '<div class="droite">'
      + (D.peutModifier && ls.length
          ? '<button class="mini danger" id="rc-vider">'
            + (ARME === '__liaisons' ? 'Confirmer ?' : 'Tout effacer') + '</button>' : '')
      + '<span>' + ls.length + ' produit' + (ls.length > 1 ? 's liés' : ' lié') + '</span></div></div>';
    h += '<div class="carte">';
    if (!ls.length) {
      h += '<div class="vide">Aucune liaison manuelle.'
        + '<div style="margin-top:.35rem">Les recommandations automatiques s’appliquent seules.</div></div>';
    } else {
      h += ls.map(function(l){
        return '<div style="border-top:1px solid rgba(255,255,255,.055);padding:.4rem 0">'
          + '<div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">'
          + '<strong>' + esc(l.nom) + '</strong>'
          + '<span class="dt">' + l.lies.length + ' article' + (l.lies.length > 1 ? 's' : '') + '</span>'
          + (D.peutModifier
              ? '<button class="mini geste" style="margin-left:auto" data-modifier-liaison="' + esc(l.id) + '">Modifier</button>'
              : '') + '</div>'
          + '<div class="dt" style="margin-top:.15rem">'
          + l.lies.map(function(x){ return esc(x.nom); }).join(' · ') + '</div></div>';
      }).join('');
    }
    h += '</div>';
    return h;
  }

  function vueStats(){
    if (!STATS) return '<div class="vide">Chargement des statistiques…</div>';
    var max = 0;
    (STATS.regles || []).forEach(function(r){ if (r.couverture > max) max = r.couverture; });
    var h = '<div class="carte"><h2>Couverture des règles</h2>';
    if (!(STATS.regles || []).length) {
      h += '<div class="vide">Aucune règle.</div>';
    } else {
      h += '<table><thead><tr><th>Règle</th><th>État</th><th class="num">Articles couverts</th>'
        + '<th style="width:40%"></th></tr></thead><tbody>'
        + STATS.regles.map(function(r){
            var pc = max ? Math.round(r.couverture / max * 100) : 0;
            return '<tr><td>' + esc(r.nom) + '</td>'
              + '<td><span class="pill ' + (r.active ? 'bon' : 'neutre') + '">'
              + (r.active ? 'Active' : 'Inactive') + '</span></td>'
              + '<td class="num">' + r.couverture + '</td>'
              + '<td><div class="jauge"><i style="width:' + pc + '%"></i></div></td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    h += '<div class="carte"><h2>Articles les plus demandés</h2>';
    if (!(STATS.populaires || []).length) {
      h += '<div class="vide">Pas encore assez de commandes pour en tirer un classement.</div>';
    } else {
      h += '<table><thead><tr><th></th><th>Article</th><th class="num">Score</th></tr></thead><tbody>'
        + STATS.populaires.map(function(p, i){
            return '<tr><td class="rang">' + (i + 1) + '</td><td>' + esc(p.nom) + '</td>'
              + '<td class="num">' + p.score + '</td></tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';
    return h;
  }

  function boiteLiaison(){
    var L = LIAISON;
    if (!L) return '';
    var q = QPROD.trim().toLowerCase();
    var tout = D.catalogue || [];
    var choisis = tout.filter(function(p){ return L.choisis.indexOf(p.id) >= 0; });
    var reste = tout.filter(function(p){
      if (p.id === L.id || L.choisis.indexOf(p.id) >= 0) return false;
      if (!q) return true;
      return (String(p.nom) + ' ' + String(p.sku)).toLowerCase().indexOf(q) !== -1;
    });
    var vus = choisis.concat(q ? reste.slice(0, 120) : reste.slice(0, 40));

    return '<div class="voile" id="rc-voile"><div class="boite">'
      + '<h3>' + (L.nom ? 'Articles liés à « ' + esc(L.nom) + ' »' : 'Associer des produits') + '</h3>'
      + (L.id ? '' : '<div class="ch" style="margin-bottom:.5rem"><select id="rc-source">'
          + '<option value="">— Choisir le produit source —</option>'
          + tout.map(function(p){ return '<option value="' + esc(p.id) + '">' + esc(p.nom) + '</option>'; }).join('')
          + '</select></div>')
      + '<input type="search" id="rc-qprod" placeholder="Chercher un nom ou un SKU…" value="' + esc(QPROD) + '" style="margin-bottom:.4rem">'
      + '<div class="choix" id="rc-choix">'
      + (vus.length ? vus.map(function(p){
          return '<label><input type="checkbox" class="rc-p" value="' + esc(p.id) + '"'
            + (L.choisis.indexOf(p.id) >= 0 ? ' checked' : '') + '> ' + esc(p.nom)
            + '<span class="sku">' + esc(p.sku || '') + '</span></label>';
        }).join('') : '<div class="dt">Aucun produit ne correspond.</div>')
      + '</div>'
      + '<div class="dt" style="margin-top:.35rem" id="rc-cpt">' + L.choisis.length
      + ' article' + (L.choisis.length > 1 ? 's choisis' : ' choisi') + '</div>'
      + '<div class="pied-boite"><button class="mini" id="rc-annuler">Annuler</button>'
      + '<button class="mini prim" id="rc-enr">Enregistrer</button></div>'
      + '</div></div>';
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    if (sous) sous.textContent = D.peutModifier ? '' : 'consultation seulement';

    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'regles' ? ' actif' : '') + '" data-onglet="regles">Règles'
      + ((D.regles || []).length ? '<span class="n">' + D.regles.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'liaisons' ? ' actif' : '') + '" data-onglet="liaisons">Liaisons manuelles'
      + ((D.liaisons || []).length ? '<span class="n">' + D.liaisons.length + '</span>' : '') + '</button>'
      + '<button class="mini' + (ONGLET === 'stats' ? ' actif' : '') + '" data-onglet="stats">Statistiques</button>'
      + '<div class="droite"><span class="dt">Générateur d’agencement : écran Recommandations, '
      + 'fenêtre principale</span></div></div>';

    h += ONGLET === 'liaisons' ? vueLiaisons() : ONGLET === 'stats' ? vueStats() : vueRegles();
    if (LIAISON) h += boiteLiaison();
    corps.innerHTML = h;
    brancher();
  }

  function brancher(){
    var bl = document.getElementById('rc-lier');
    if (bl) bl.onclick = function(){ LIAISON = { id: '', nom: '', choisis: [] }; QPROD = ''; dessiner(); };
    var ba = document.getElementById('rc-annuler');
    if (ba) ba.onclick = function(){ LIAISON = null; dessiner(); };
    var vo = document.getElementById('rc-voile');
    if (vo) vo.onclick = function(ev){ if (ev.target === vo) { LIAISON = null; dessiner(); } };

    var src = document.getElementById('rc-source');
    if (src) src.onchange = function(){
      var p = (D.catalogue || []).filter(function(x){ return x.id === src.value; })[0];
      var l = (D.liaisons || []).filter(function(x){ return x.id === src.value; })[0];
      LIAISON = { id: src.value, nom: (p && p.nom) || '',
                  choisis: l ? l.lies.map(function(x){ return x.id; }) : [] };
      dessiner();
    };

    var qp = document.getElementById('rc-qprod');
    if (qp) qp.oninput = function(){
      QPROD = qp.value;
      var z = document.getElementById('rc-choix');
      if (!z) return;
      // On ne redessine QUE la liste : le champ garde le curseur.
      var deb = qp.selectionStart, fin = qp.selectionEnd;
      dessiner();
      var q2 = document.getElementById('rc-qprod');
      if (q2) { q2.focus({ preventScroll: true }); try { q2.setSelectionRange(deb, fin); } catch (e) {} }
    };

    [].forEach.call(document.querySelectorAll('.rc-p'), function(cb){
      cb.onchange = function(){
        if (!LIAISON) return;
        var i = LIAISON.choisis.indexOf(cb.value);
        if (cb.checked && i < 0) LIAISON.choisis.push(cb.value);
        if (!cb.checked && i >= 0) LIAISON.choisis.splice(i, 1);
        var c = document.getElementById('rc-cpt');
        if (c) c.textContent = LIAISON.choisis.length + ' article'
          + (LIAISON.choisis.length > 1 ? 's choisis' : ' choisi');
      };
    });

    var be = document.getElementById('rc-enr');
    if (be) be.onclick = function(){
      if (!LIAISON || !LIAISON.id) { dire('Choisissez d’abord le produit source.', 'err'); return; }
      be.disabled = true;
      appeler('reco:liaisons', [LIAISON.id, LIAISON.choisis]).then(function(r){
        be.disabled = false;
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        LIAISON = null;
        dire(r.nb ? ('« ' + r.nom + ' » : ' + r.nb + ' article' + (r.nb > 1 ? 's liés.' : ' lié.'))
                  : ('Liaisons de « ' + r.nom + ' » retirées.'), 'bon');
        charger();
      });
    };

    var bv = document.getElementById('rc-vider');
    if (bv) bv.onclick = function(){
      if (ARME !== '__liaisons') {
        ARME = '__liaisons'; dessiner();
        dire('Cliquez « Confirmer ? » — tous les rapprochements faits à la main seront perdus, '
          + 'les recommandations automatiques reprennent seules.', 'att');
        return;
      }
      ARME = '';
      appeler('reco:viderLiaisons', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(r.efface + ' liaison' + (r.efface > 1 ? 's effacées' : ' effacée') + '.', 'bon');
        charger();
      });
    };
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest || t.closest('.boite')) return;

    var og = t.closest('[data-onglet]');
    if (og) {
      ONGLET = og.getAttribute('data-onglet'); ARME = '';
      if (ONGLET === 'stats' && !STATS) { chargerStats(); return; }
      dessiner();
      return;
    }

    var bm = t.closest('[data-monter]');
    var bd = t.closest('[data-descendre]');
    if (bm || bd) {
      var b = bm || bd;
      b.disabled = true;
      appeler('reco:deplacer', [b.getAttribute(bm ? 'data-monter' : 'data-descendre'), bm ? -1 : 1])
        .then(function(r){
          if (!r.ok) { b.disabled = false; dire(expliquer(r), 'err'); return; }
          dire('Ordre modifié — « ' + (r.nom || '') + ' » a changé de place.', 'bon');
          charger();
        });
      return;
    }

    var bb = t.closest('[data-basculer]');
    if (bb) {
      bb.disabled = true;
      appeler('reco:basculer', [bb.getAttribute('data-basculer'), bb.getAttribute('data-actif') === '1'])
        .then(function(r){
          if (!r.ok) { bb.disabled = false; dire(expliquer(r), 'err'); return; }
          dire('« ' + (r.nom || '') + ' » ' + (r.active ? 'activée.' : 'désactivée.'), 'bon');
          charger();
        });
      return;
    }

    var bs = t.closest('[data-suppr]');
    if (bs) {
      var idS = bs.getAttribute('data-suppr');
      var pard = bs.getAttribute('data-defaut') === '1';
      if (ARME !== idS) {
        ARME = idS; dessiner();
        dire(pard
          ? 'Cliquez « Confirmer ? » — cette règle par défaut sera retirée, mais vous pourrez la restaurer.'
          : 'Cliquez « Confirmer ? » pour supprimer cette règle.', 'att');
        return;
      }
      ARME = '';
      appeler('reco:supprimer', [idS, pard]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire('« ' + (r.nom || '') + ' » supprimée'
          + (r.restaurable ? ' — restaurable plus bas.' : '.'), 'bon');
        charger();
      });
      return;
    }

    var br = t.closest('[data-restaurer]');
    if (br) {
      br.disabled = true;
      appeler('reco:restaurer', [br.getAttribute('data-restaurer')]).then(function(r){
        if (!r.ok) { br.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('« ' + (r.nom || '') + ' » remise en service.', 'bon');
        charger();
      });
      return;
    }

    var bml = t.closest('[data-modifier-liaison]');
    if (bml) {
      var idL = bml.getAttribute('data-modifier-liaison');
      var l = (D.liaisons || []).filter(function(x){ return x.id === idL; })[0];
      if (l) { LIAISON = { id: l.id, nom: l.nom, choisis: l.lies.map(function(x){ return x.id; }) }; QPROD = ''; dessiner(); }
      return;
    }

    /* ⚠⚠ UN CLIC SUR UN BOUTON NE DOIT PAS DÉSARMER CE QU'IL VIENT D'ARMER.
       Les boutons branches par la fonction de branchement posent l armement,
       puis le clic REMONTE jusqu ici : la ligne de desarmement ci-dessous
       s executait dans la foulee, et le bouton revenait a son libelle
       d origine : on voyait l avertissement sans jamais voir Confirmer ?
       (2026-08-09). Un clic sur une commande est traite par SA commande. */
    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = ''; dessiner(); }
  });

  function charger(){
    appeler('reco:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Recommandations indisponibles', expliquer(r)); return; }
      D = r;
      if (ONGLET === 'stats') { chargerStats(); return; }
      dessiner();
    });
  }
  function chargerStats(){
    appeler('reco:stats', []).then(function(r){
      STATS = r && r.ok ? r : { regles: [], populaires: [] };
      dessiner();
    });
  }

  window.szActualiser = function(){ if (!LIAISON && !ARME) charger(); };
  window.szRevenir = function(){ if (!LIAISON) charger(); };

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
      if (LIAISON) { LIAISON = null; dessiner(); return; }
      if (ARME) { ARME = ''; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageRecommandations };
