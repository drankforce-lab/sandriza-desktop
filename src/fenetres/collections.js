'use strict';

/*
 * FENÊTRE « NOS COLLECTIONS » — NATIVE
 * =============================================================================
 * La liste des collections : saison, nombre d'articles, statut. Cliquer une
 * ligne ouvre l'ASSISTANT DE COLLECTION natif sur la fiche (collections:ouvrir) ;
 * « + Nouvelle collection » ouvre l'assistant vierge. AUCUNE écriture ici :
 * activer, désactiver ou supprimer restent des gestes de la fiche.
 *
 * Les collections sont peu nombreuses : la liste entière arrive d'un coup
 * (collections:liste), sans pagination ni recherche.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠ On ne traduit QUE ce qui se lit (voir src/langue/collections.js). */
const T = require('../langue').tr('collections');

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
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem;cursor:pointer}
button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:var(--v04)}
tbody td{padding:.34rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Nos Collections ». */
function pageCollections() {
  return `${TETE()}
<title>${T("Nos Collections — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.collections}</span><h1>${T("Nos Collections")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');

  var D = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux collections.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Cette collection n’existe plus.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
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
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var rows = D.lignes || [];
    var h = '<div class="barreoutils">'
      + '<span>' + rows.length + ' '
      + (rows.length > 1 ? '${T("collections")}' : '${T("collection")}') + '</span>'
      + '<span class="droite"><button class="prim" id="col-nouvelle">${T("+ Nouvelle collection")}</button></span>'
      + '</div>';
    h += '<div class="carte">';
    if (!rows.length) {
      h += '<div class="vide">${T("Pas de collection en ce moment.")}</div>';
    } else {
      h += '<table><thead><tr><th>${T("Collection")}</th><th>${T("Saison")}</th>'
        + '<th style="text-align:center">${T("Articles")}</th><th>${T("Statut")}</th></tr></thead><tbody>'
        + rows.map(function(r){
            return '<tr data-id="' + esc(r.id) + '" title="${T("Ouvrir la collection")}">'
              + '<td><span class="num">' + esc(r.nom) + '</span>'
              + szVerrouCase('collections', r.id)
              + (r.description ? '<div class="dt">' + esc(r.description).slice(0, 120) + '</div>' : '') + '</td>'
              + '<td>' + esc(r.saison || '—') + '</td>'
              + '<td style="text-align:center;font-weight:600">' + r.articles + '</td>'
              + '<td>' + (r.active ? '<span class="pill bon">Active</span>' : '<span class="pill neutre">Inactive</span>') + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';
    /* Le pied ferme la liste et porte l export (2026-09-19). Pas de pagination
       ici : ce que l ecran montre EST tout ce qu il y a. */
    if (rows.length) {
      h += szPied(
        rows.length + ' ' + (rows.length > 1 ? '${T("collections")}' : '${T("collection")}'),
        '<button class="mini" id="col-exporter"><span class="ic">⬇</span>${T(" Exporter")}</button>');
    }
    corps.innerHTML = h;
    szVerrousPeindre();   // reposer les cadenas connus sur le tableau frais

    /* ⚠ LA DESCRIPTION PART ENTIERE DANS LE FICHIER. A l ecran elle est coupee
       a 120 caracteres pour que la ligne tienne ; un fichier n a pas cette
       contrainte, et une description tronquee dans un export est une donnee
       perdue sans qu on le sache. */
    var exc = document.getElementById('col-exporter');
    if (exc) exc.onclick = function(){
      var lignes = (D.lignes || []).map(function(r){
        return [r.nom || '', r.saison || '', r.articles,
          r.active ? '${T("Active")}' : '${T("Inactive")}', r.description || ''];
      });
      if (!lignes.length) { dire('${T("Rien à exporter.")}', 'att'); return; }
      var csv = szCSV(['${T("Collection")}', '${T("Saison")}', '${T("Articles")}',
        '${T("Statut")}', '${T("Description")}'], lignes);
      szExporter('collections-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
        '${T("La liste des collections")}');
    };

    var nv = document.getElementById('col-nouvelle');
    if (nv) nv.onclick = function(){
      dire('${T("Ouverture…")}');
      appeler('collections:nouvelle', []).then(function(r){
        dire(r.ok ? '${T("Assistant de collection ouvert dans sa fenêtre.")}' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('button')) return;
    var tr = t.closest('tr[data-id]');
    if (!tr) return;
    dire('${T("Ouverture…")}');
    appeler('collections:ouvrir', [tr.getAttribute('data-id')]).then(function(r){
      dire(r.ok ? '${T("Collection ouverte dans son assistant.")}' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  function charger(){
    appeler('collections:liste', []).then(function(r){
      if (!r || !r.ok) { vide('${T("Collections indisponibles")}', expliquer(r)); return; }
      D = r;
      dire('');
      dessiner();
    });
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : un enregistrement de collection
     fait relire la liste sans geste. */
  window.szActualiser = function(){ charger(); };
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
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
  szVerrousSuivre(['collections']);
})();
</script>
</body></html>`;
}

module.exports = { pageCollections };
