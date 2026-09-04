'use strict';

/*
 * FENÊTRE « IMPRESSION DE CODES-BARRES » — NATIVE
 * =============================================================================
 * Le geste d'entrepôt : choisir des variantes, bâtir une FILE d'étiquettes,
 * l'imprimer. La liste des produits vient du cœur du site
 * (Admin._codesbarresDonnees, la même règle que l'écran web) ; la grille des
 * variantes d'un produit vient de codesbarres:produit ; l'impression passe
 * par stock:etiquettes — la même voie et le même verdict que la fenêtre
 * Inventaire (imprimante du poste, jamais de boîte de dialogue muette).
 *
 * ⚠ LA FILE EST UNE LISTE EN MÉMOIRE DE CETTE PAGE, jamais le tableau
 * affiché : c'était le piège de l'écran web (une file lue dans le DOM), et la
 * raison d'extraire le cœur AVANT de dessiner cette fenêtre.
 *
 * ⚠ PAS D'IMPRESSION BLUETOOTH, ET PLUS NULLE PART — le 2026-08-21, sur sa
 * décision. Ce commentaire disait jusqu'ici « le Bluetooth reste le chemin de
 * la tablette web » : c'était FAUX depuis le lot 4a, où l'écran web des
 * codes-barres est devenu l'avis natif et a emporté le bouton avec lui. La
 * moitié vraie tenait : Web Bluetooth exige un geste dans la page qui l'appelle,
 * donc il ne peut PAS être rappelé d'ici, à travers le pont.
 * Ce qui a tranché n'est pas le code mais l'APPAREIL : l'administration se fait
 * depuis une Surface Windows depuis le 2026-07-27, où le Phomemo D245BT
 * s'appaire comme imprimante du poste et rentre par stock:etiquettes, comme
 * tout le reste. Web Bluetooth n'existait que parce qu'Android/Chrome ne voyait
 * pas la thermique comme une imprimante. `btprint.js` et
 * `Admin._bcPrintBluetooth` sont donc supprimés du site.
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
input[type=search],input[type=number],select,button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
input[type=number]{width:4.2rem;text-align:center;padding:.2rem .3rem}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err)}
.deux{display:flex;gap:.7rem;align-items:flex-start}
.deux .principal{flex:1 1 auto;min-width:0}
.deux .cote{flex:0 0 320px}
@media (max-width:920px){.deux{flex-direction:column}.deux .cote{flex:1 1 auto;width:100%}}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .45rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:var(--tx2);font-weight:700;display:flex;align-items:center;gap:.5rem}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.3rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody .num{font-weight:700}
tbody .dt{font-size:.72rem;color:var(--tx2)}
.sku{font-family:'Courier New',monospace;font-size:.74rem;font-weight:800;color:var(--tx-or)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.err{background:rgba(239,68,68,.16);color:var(--tx-err)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:var(--tx2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.stats{display:flex;gap:.45rem;margin-bottom:.5rem}
.stats .s{flex:1;text-align:center;background:var(--v04);border-radius:9px;padding:.4rem .3rem}
.stats .s .n{font:800 1.15rem/1.2 Georgia,serif;color:var(--tx-or)}
.stats .s .l{font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.fileligne{display:flex;align-items:center;gap:.45rem;padding:.3rem 0;
  border-top:1px solid var(--v055);font-size:.8rem}
.fileligne .info{flex:1 1 auto;min-width:0}
.fileligne .info .dt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--v14);border-radius:13px;
  max-width:34rem;width:100%;max-height:82vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .6rem;font:700 .95rem/1.3 Georgia,serif}
.boite .rangs{display:flex;flex-direction:column}
.boite .rang{display:flex;align-items:center;gap:.55rem;padding:.3rem 0;
  border-top:1px solid var(--v055)}
.boite .rang label{flex:1 1 auto;display:flex;align-items:center;gap:.5rem;cursor:pointer}
.boite .pied-boite{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.7rem}
.boite p{margin:.35rem 0;font-size:.85rem;line-height:1.55}
.boite ul{margin:.5rem 0 0;padding-left:0}
.boite li.item{list-style:none;background:var(--v05);border-radius:7px;
  padding:.35rem .55rem;margin-bottom:.3rem;font-size:.82rem;line-height:1.45}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Impression de codes-barres ». */
function pageCodesbarres(mode) {
  /* ⚠ IDENTIFIANT D OUVERTURE << lisibilite >> : le banc ne clique pas, et la
     surcouche du garde-fou n apparait qu au moment d imprimer. Sans lui,
     l ECRAN QUI EMPECHE L ERREUR resterait hors de tout controle — c est
     exactement le defaut qu on est en train de corriger. */
  const essai = String(mode || '') === 'lisibilite';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Impression de codes-barres — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.barcode}</span><h1>Impression de codes-barres</h1>
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

  var D = null;
  var Q = '';
  var CAT = '';
  var PAGE = 0;
  var TAILLE = 20;
  /* ⚠ LA FILE : une liste en memoire — { pid, sku, name, size, color, qty }.
     Jamais relue du tableau affiche. */
  var FILE = [];
  var ESSAI_LISIBILITE = ${essai ? 'true' : 'false'};
  var PICKER = null;       // { id, nom, variantes } — le choix des variantes
  var VIDER_ARME = false;  // le bouton Vider demande une confirmation

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à l’inventaire.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable:        'Cette fiche n’existe plus.',
    sans_sku:           'Ce produit n’a pas de SKU — assignez-lui un SKU d’abord.',
    agent_absent:       'L’impression n’est pas disponible dans la fenêtre principale.',
    aucune_etiquette:   'La file d’impression est vide.',
    imprimante:         'Aucune imprimante d’étiquettes prête. Vérifiez Configuration → Imprimantes.',
    impression:         'L’impression a échoué. Vérifiez l’imprimante, puis réessayez.',
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
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function fileHtml(){
    var lignes = FILE.length;
    var etiquettes = FILE.reduce(function(n, it){ return n + (parseInt(it.qty, 10) || 0); }, 0);
    var produits = {};
    FILE.forEach(function(it){ produits[it.pid] = true; });
    var h = '<div class="carte"><h2>File d’impression</h2>'
      + '<div class="stats">'
      + '<div class="s"><div class="n">' + Object.keys(produits).length + '</div><div class="l">produit' + (Object.keys(produits).length > 1 ? 's' : '') + '</div></div>'
      + '<div class="s"><div class="n">' + lignes + '</div><div class="l">ligne' + (lignes > 1 ? 's' : '') + '</div></div>'
      + '<div class="s"><div class="n">' + etiquettes + '</div><div class="l">étiquette' + (etiquettes > 1 ? 's' : '') + '</div></div>'
      + '</div>';
    if (!FILE.length) {
      h += '<div class="vide">Rien à imprimer. Choisissez des variantes à gauche.</div>';
    } else {
      h += FILE.map(function(it, i){
        return '<div class="fileligne">'
          + '<div class="info"><div class="dt"><strong>' + esc(it.name) + '</strong></div>'
          + '<div class="dt">' + esc(it.size) + ' / ' + esc(it.color)
          + ' · <span class="sku">' + esc(it.sku) + '</span></div></div>'
          + '<button class="mini" data-fmoins="' + i + '" title="Moins">−</button>'
          + '<span style="min-width:1.8rem;text-align:center;font-weight:800">' + it.qty + '</span>'
          + '<button class="mini" data-fplus="' + i + '" title="Plus">+</button>'
          + '<button class="mini" data-fret="' + i + '" title="Retirer">✕</button>'
          + '</div>';
      }).join('');
    }
    h += '<div style="display:flex;gap:.5rem;margin-top:.6rem">'
      + '<button class="danger" id="cb-vider"' + (FILE.length ? '' : ' disabled') + '>'
      + (VIDER_ARME ? 'Confirmer ?' : '<span class="ic">🗑</span> Vider') + '</button>'
      + '<button class="prim" id="cb-imprimer" style="flex:1"' + (FILE.length ? '' : ' disabled') + '><span class="ic">🖨</span> Imprimer '
      + (etiquettes ? etiquettes + ' étiquette' + (etiquettes > 1 ? 's' : '') : '') + '</button>'
      + '</div></div>';
    return h;
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div>'; return; }
    var h = '<div class="barreoutils">'
      + '<input type="search" id="cb-q" placeholder="Nom ou SKU…" value="' + esc(Q) + '">'
      + '<select id="cb-cat"><option value="">Toutes les catégories</option>'
      + (D.cats || []).map(function(c){
          return '<option value="' + esc(c.cle) + '"' + (CAT === c.cle ? ' selected' : '') + '>' + esc(c.nom) + '</option>';
        }).join('')
      + '</select>'
      + '<span class="droite">' + (D.total || 0) + ' produit' + (D.total > 1 ? 's' : '') + '</span>'
      + '</div>';

    h += '<div class="deux"><div class="principal"><div class="carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">Aucun produit trouvé.</div>';
    } else {
      h += '<table><thead><tr><th>SKU</th><th>Produit</th><th>Catégorie</th>'
        + '<th>Stock</th><th style="text-align:right">Ajouter</th></tr></thead><tbody>'
        + rows.map(function(r){
            var actions = r.sku
              ? '<button class="mini" data-choisir="' + esc(r.id) + '"><span class="ic">🏷️</span> Étiquettes</button>'
                + (r.stock > 0 ? ' <button class="mini" data-toutstock="' + esc(r.id) + '" title="Ajouter toutes les variantes en stock (quantité = stock)">+ Stock</button>' : '')
              : '<span class="dt">SKU requis</span>';
            return '<tr>'
              + '<td>' + (r.sku ? '<span class="sku">' + esc(r.sku) + '</span>' : '<span class="dt">sans SKU</span>') + '</td>'
              + '<td><span class="num">' + esc(r.nom) + '</span></td>'
              + '<td>' + esc(r.categorie || '—') + '</td>'
              + '<td>' + r.stock + ' ' + (r.stock === 0 ? '<span class="pill err">Rupture</span>'
                : r.bas ? '<span class="pill att">bas</span>' : '') + '</td>'
              + '<td style="text-align:right;white-space:nowrap">' + actions + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table>';
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="cb-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="cb-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div></div><div class="cote" id="cb-file">' + fileHtml() + '</div></div>';

    if (PICKER) {
      h += '<div class="voile" id="cb-voile"><div class="boite">'
        + '<h3><span class="ic">🏷️</span> ' + esc(PICKER.nom) + ' — choisir les variantes</h3>'
        + '<div class="rangs">'
        + PICKER.variantes.map(function(v, i){
            var deja = null;
            FILE.forEach(function(it){ if (it.sku === v.sku) deja = it; });
            var qte = deja ? deja.qty : (v.stock > 0 ? v.stock : 1);
            return '<div class="rang">'
              + '<label><input type="checkbox" data-vcoche="' + i + '"' + ((deja || v.stock > 0) ? ' checked' : '') + '>'
              + '<span>' + esc(v.taille) + ' / ' + esc(v.couleur) + '</span>'
              + '<span class="sku">' + esc(v.sku) + '</span>'
              + '<span class="dt">stock : ' + v.stock + '</span></label>'
              + '<input type="number" min="1" value="' + qte + '" data-vqte="' + i + '">'
              + '</div>';
          }).join('')
        + '</div>'
        + '<div class="pied-boite">'
        + '<button id="cb-p-annuler">Annuler</button>'
        + '<button class="prim" id="cb-p-ajouter">➕ Ajouter à la file</button>'
        + '</div></div></div>';
    }
    corps.innerHTML = h;
    brancher();
  }

  function redessinerFile(){
    var el = document.getElementById('cb-file');
    if (el) { el.innerHTML = fileHtml(); brancherFile(); }
    else dessiner();
  }

  function brancherFile(){
    var v = document.getElementById('cb-vider');
    if (v) v.onclick = function(){
      if (!FILE.length) return;
      if (!VIDER_ARME) {
        VIDER_ARME = true; redessinerFile();
        setTimeout(function(){ if (VIDER_ARME) { VIDER_ARME = false; redessinerFile(); } }, 3500);
        return;
      }
      VIDER_ARME = false; FILE = []; redessinerFile();
      dire('File vidée.');
    };
    var imp = document.getElementById('cb-imprimer');
    if (imp) imp.onclick = imprimer;
  }

  function brancher(){
    var q = document.getElementById('cb-q');
    if (q) {
      q.oninput = function(){
        Q = q.value; PAGE = 0;
        clearTimeout(window._cbq);
        window._cbq = setTimeout(function(){ charger(true); }, 300);
      };
    }
    var cat = document.getElementById('cb-cat');
    if (cat) cat.onchange = function(){ CAT = cat.value; PAGE = 0; charger(); };
    var bp = document.getElementById('cb-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('cb-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };
    brancherFile();
    var pa = document.getElementById('cb-p-annuler');
    if (pa) pa.onclick = function(){ PICKER = null; dessiner(); };
    var pj = document.getElementById('cb-p-ajouter');
    if (pj) pj.onclick = ajouterDuPicker;
  }

  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var ch = t.closest('[data-choisir]');
    if (ch) { ouvrirPicker(ch.getAttribute('data-choisir'), false); return; }
    var ts = t.closest('[data-toutstock]');
    if (ts) { ouvrirPicker(ts.getAttribute('data-toutstock'), true); return; }
    var fm = t.closest('[data-fmoins]');
    if (fm) { var i = +fm.getAttribute('data-fmoins'); if (FILE[i]) { FILE[i].qty -= 1; if (FILE[i].qty <= 0) FILE.splice(i, 1); redessinerFile(); } return; }
    var fp = t.closest('[data-fplus]');
    if (fp) { var j = +fp.getAttribute('data-fplus'); if (FILE[j]) { FILE[j].qty += 1; redessinerFile(); } return; }
    var fr = t.closest('[data-fret]');
    if (fr) { FILE.splice(+fr.getAttribute('data-fret'), 1); redessinerFile(); return; }
  };

  /* Le choix des variantes. toutStock = le raccourci << + Stock >> : toutes
     les variantes en stock partent dans la file, quantite = stock, sans boite. */
  function ouvrirPicker(pid, toutStock){
    dire('Lecture des variantes…');
    appeler('codesbarres:produit', [pid]).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      dire('');
      if (toutStock) {
        var ajouts = 0;
        (r.variantes || []).forEach(function(v){
          if ((v.stock || 0) <= 0) return;
          var deja = null;
          FILE.forEach(function(it){ if (it.sku === v.sku) deja = it; });
          if (deja) deja.qty = v.stock;
          else FILE.push({ pid: r.id, sku: v.sku, name: r.nom, size: v.taille, color: v.couleur, qty: v.stock });
          ajouts++;
        });
        if (!ajouts) { dire('Aucune variante en stock pour ce produit.', 'err'); return; }
        redessinerFile();
        return;
      }
      PICKER = r;
      dessiner();
    });
  }

  function ajouterDuPicker(){
    if (!PICKER) return;
    var ajouts = 0;
    PICKER.variantes.forEach(function(v, i){
      var cb = document.querySelector('[data-vcoche="' + i + '"]');
      if (!cb || !cb.checked) return;
      var qi = document.querySelector('[data-vqte="' + i + '"]');
      var qte = parseInt(qi && qi.value, 10) || 0;
      if (qte <= 0) return;
      var deja = null;
      FILE.forEach(function(it){ if (it.sku === v.sku) deja = it; });
      if (deja) deja.qty = qte;
      else FILE.push({ pid: PICKER.id, sku: v.sku, name: PICKER.nom, size: v.taille, color: v.couleur, qty: qte });
      ajouts++;
    });
    PICKER = null;
    dessiner();
    if (!ajouts) dire('Aucune variante cochée avec une quantité au-dessus de zéro.', 'err');
  }

  /* Une surcouche jetable, posee dans le corps du document. La surcouche du
     choix de variantes, elle, est dessinee par l etat PICKER : celle-ci est
     ponctuelle et ne survit pas a un redessin, ce qui est exactement voulu. */
  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  /* ══ LE GARDE-FOU DU CODE ILLISIBLE ══════════════════════════════════════
     Le pire defaut du lot, vecu a l entrepot : l etiquette sort JOLIE et ne se
     scanne pas. Le controle existait deja cote site, mais il criait dans une
     bulle de la fenetre PRINCIPALE — invisible derriere celle-ci — et il
     criait PENDANT que les etiquettes partaient. On demande donc le verdict
     AVANT le premier envoi, et on laisse le choix. */
  function imprimer(){
    if (!FILE.length) return;
    var imp = document.getElementById('cb-imprimer');
    if (imp) imp.disabled = true;
    dire('Vérification de la lisibilité…');
    appeler('etiquettes:lisibilite', [FILE.slice()]).then(function(v){
      // ⚠ Un controle qui ECHOUE ne doit pas bloquer l impression : ce serait
      // remplacer un defaut rare par une panne totale. On le dit, et on passe.
      if (!v || !v.ok) { dire('Lisibilité non vérifiable — impression lancée.', 'att'); lancer(); return; }
      if (!(v.problemes || []).length) { lancer(); return; }
      avertirLisibilite(v);
    });
  }

  function avertirLisibilite(v){
    var p = v.problemes;
    var h = '<h3 style="color:var(--tx-att)"><span class="ic">⚠</span> Ces codes ne se scanneront pas</h3>'
      + '<p>Sur une étiquette de <strong>' + v.largeurPo + ' po</strong> à <strong>'
      + v.dpi + ' ppp</strong>, ' + (p.length > 1 ? 'ces codes sont' : 'ce code est')
      + ' trop long' + (p.length > 1 ? 's' : '') + ' : la barre la plus fine tomberait à '
      + '<strong>1 point</strong>, sous le seuil de lecture des lecteurs. '
      + 'L’étiquette s’imprimera correctement — mais elle ne se lira pas.</p>'
      + '<ul style="padding-left:0">' + p.map(function(x){
          return '<li class="item"><strong>' + esc(x.sku) + '</strong>'
            + (x.nom ? ' — ' + esc(x.nom) : '')
            + '<br><span style="color:var(--tx2)">' + x.modules + ' modules · il faudrait une '
            + 'étiquette d’au moins ' + x.largeurMiniPo + ' po</span></li>'; }).join('')
      + '</ul>'
      + '<p style="color:var(--tx2)">Deux leviers : raccourcir le <strong>code couleur</strong> '
      + '(Inventaire → Attributs → Couleurs) ou passer à une étiquette plus large. '
      + 'Une imprimante 300 ppp règle aussi le cas.</p>'
      + '<div class="pied-boite"><button id="v-non">Annuler</button>'
      + '<button id="v-oui">Imprimer quand même</button></div>';
    voile(h, function(fermer){
      document.getElementById('v-non').onclick = function(){
        fermer();
        var b = document.getElementById('cb-imprimer');
        if (b) b.disabled = false;
        dire('Impression annulée.', 'att');
      };
      // ⚠ PAS la classe << prim >> sur ce bouton-la : imprimer quand meme est
      // le choix par defaut de personne. Annuler doit rester le geste facile.
      document.getElementById('v-oui').onclick = function(){ fermer(); lancer(); };
    });
  }

  function lancer(){
    var total = FILE.reduce(function(n, it){ return n + (parseInt(it.qty, 10) || 0); }, 0);
    dire('Impression de ' + total + ' étiquette' + (total > 1 ? 's' : '') + '…');
    var imp = document.getElementById('cb-imprimer');
    if (imp) imp.disabled = true;
    appeler('stock:etiquettes', [FILE.slice()]).then(function(r){
      if (r && r.ok) {
        var n = (r.envoyees || total);
        // ⚠ FILET : si l impression a quand meme rencontre un code illisible
        // (controle contourne, ou un cas que le calcul n avait pas vu), on le
        // DIT ici. Cet avertissement se perdait dans la fenetre principale.
        var av = r.avertissements || [];
        dire(n + ' étiquette' + (n > 1 ? 's' : '') + ' envoyée' + (n > 1 ? 's' : '')
          + (r.imprimante ? ' à « ' + r.imprimante + ' »' : '') + '.'
          + (av.length ? ' ⚠ ' + esc(av[0].sku) + ' ne se scannera pas ('
             + av[0].points + ' point par barre).' : ''), av.length ? 'att' : 'bon');
        FILE = [];
        redessinerFile();
      } else {
        dire(expliquer(r), 'err');
        if (imp) imp.disabled = false;
      }
    });
  }

  var enCours = false, RELANCE = false;
  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('codesbarres:liste', [{ q: Q, cat: CAT, page: PAGE, taille: TAILLE }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('Codes-barres indisponibles', expliquer(r)); return; }
      D = r;
      dire('');
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('cb-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('cb-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ ACTUALISATION POUSSEE PAR LA COQUILLE : un stock qui bouge fait relire
     la page — jamais pendant une saisie, ni pendant le CHOIX des variantes
     (on redessinerait la boite sous les doigts). La FILE, elle, ne bouge pas. */
  window.szActualiser = function(){
    if (PICKER) return;
    var q = document.getElementById('cb-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ if (!PICKER) charger(); };

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
      if (PICKER) { PICKER = null; dessiner(); return; }
      P.fermer();
    }
  });

  var sous = document.getElementById('sous');
  if (sous) sous.textContent = '';
  charger();
  // Ouverture directe sur le garde-fou, avec une file d essai : la surcouche
  // ne s atteint autrement qu apres avoir coche des variantes et clique.
  if (ESSAI_LISIBILITE) {
    FILE = [{ pid: 'prod_1', sku: 'ROB-0001-XXL-BOURGOGNE', name: 'Robe Élégance mi-longue',
              size: 'XXL', color: 'Bourgogne', qty: 3 }];
    imprimer();
  }
})();
</script>
</body></html>`;
}

module.exports = { pageCodesbarres };
