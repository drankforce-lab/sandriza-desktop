'use strict';

/*
 * FENÊTRE « EXPLORATEUR DE PHOTOS » — NATIVE (#32)
 * =============================================================================
 * Sa demande, capture à l'appui : « ça doit être dans une fenêtre détachée
 * quand on clique depuis la photothèque […] un affichage par liste peut
 * suffire, mais je dois vraiment pouvoir sélectionner mes 500 photos
 * facilement et voir l'aperçu de la photo — comme un explorateur Windows ».
 *
 * ⚠ LA VRAIE RAISON DE CETTE FENÊTRE : le sélecteur du Studio vit DANS sa
 * colonne de gauche. Il est étroit, les vignettes y sont minuscules et il n'y
 * a aucune place pour un aperçu. Aucun réglage ne corrige ça — il fallait
 * sortir l'écran de la colonne.
 *
 * ⚠ LE CŒUR NE CHANGE PAS. Filtres, tris et `tousLesIds` viennent de
 * `studio:explorer` (#28), déjà en place. C'est la PRÉSENTATION qui change :
 * deux affichages (liste et grille), un volet d'aperçu, et une sélection qui
 * se manie au clavier comme celle d'un explorateur.
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
  padding:.6rem 1.05rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.barre{flex:0 0 auto;display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;
  padding:.5rem 1.05rem;border-bottom:1px solid rgba(255,255,255,.06)}
input[type=search],select,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.28rem .5rem}
input[type=search]{flex:1 1 14rem;min-width:9rem}
button{cursor:pointer}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
.jeton{font-size:.73rem;padding:.14rem .5rem;border-radius:99px}
.jeton.on{background:rgba(201,169,126,.2);border-color:#c9a97e;color:#e8dcc6;font-weight:600}
.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
.vues{display:flex;gap:.15rem;margin-left:auto}
.vues button.on{border-color:#c9a97e;background:rgba(201,169,126,.16)}
/* Le corps : la liste a gauche, l apercu a droite — comme un explorateur. */
.corps{flex:1 1 auto;min-height:0;display:flex}
.zone{flex:1 1 auto;min-width:0;overflow-y:auto;padding:.5rem .7rem}
.zone::-webkit-scrollbar{width:9px}
.zone::-webkit-scrollbar-thumb{background:rgba(255,255,255,.14);border-radius:8px}
/* Affichage LISTE : dense, une ligne par photo — c est celui qui permet de
   parcourir 500 photos sans defiler pendant une minute. */
table{width:100%;border-collapse:collapse;font-size:.82rem}
thead th{position:sticky;top:0;z-index:1;text-align:left;padding:.26rem .4rem;
  font-size:.67rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8;
  font-weight:700;background:#0e1522;border-bottom:1px solid rgba(255,255,255,.12)}
tbody tr{cursor:pointer}
tbody td{padding:.22rem .4rem;border-top:1px solid rgba(255,255,255,.05);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:16rem}
tbody tr:hover td{background:rgba(255,255,255,.045)}
tbody tr.pris td{background:rgba(201,169,126,.16)}
tbody tr.actif td{box-shadow:inset 0 0 0 1px #c9a97e}
td.vig{width:2.4rem;max-width:2.4rem;padding:.1rem .2rem}
td.vig img{width:2rem;height:2rem;object-fit:contain;border-radius:4px;background:#0b1220;display:block}
/* Affichage GRILLE : quand on cherche a l oeil plutot qu au nom. */
.grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:.5rem}
.vig{background:#16202f;border:1px solid rgba(255,255,255,.1);border-radius:9px;
  overflow:hidden;cursor:pointer;position:relative}
.vig.pris{border-color:#c9a97e;box-shadow:0 0 0 1px #c9a97e inset}
.vig.actif{outline:2px solid #c9a97e;outline-offset:-2px}
.vig img{width:100%;height:6rem;object-fit:contain;background:#0b1220;display:block}
.vig .nm{font-size:.68rem;color:#8fa1b8;padding:.18rem .3rem;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
.pastilles{display:flex;gap:.15rem}
.pt{font-size:.62rem;padding:.02rem .26rem;border-radius:4px;
  background:rgba(255,255,255,.08);color:#8fa1b8}
.pt.fait{color:#4ade80}
/* Le volet d APERCU : la raison d etre de cette fenetre. */
.apercu{flex:0 0 19rem;border-left:1px solid rgba(255,255,255,.08);
  background:#111a29;display:flex;flex-direction:column;overflow-y:auto}
.apercu .img{padding:.6rem;text-align:center;background:#0b1220}
.apercu .img img{max-width:100%;max-height:15rem;border-radius:8px}
.apercu .vide{padding:2rem .8rem;text-align:center;color:#8fa1b8;font-size:.82rem}
.apercu .infos{padding:.55rem .7rem;font-size:.78rem;display:flex;flex-direction:column;gap:.3rem}
.apercu .infos .l{display:flex;gap:.5rem;justify-content:space-between}
.apercu .infos .k{color:#8fa1b8}
.apercu .infos .v{text-align:right;word-break:break-word}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.pied .cpt{font-size:.8rem}
.pied .cpt.on{color:#e8dcc6;font-weight:700}
.pied .droite{margin-left:auto;display:flex;gap:.4rem}
.msg{font-size:.78rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
.vide{padding:2rem .8rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.aide{font-size:.72rem;color:#8fa1b8}
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.voile .boite{background:#16202f;border:1px solid rgba(255,255,255,.12);
  border-radius:13px;max-width:30rem;width:100%;padding:.9rem 1rem}
.voile h3{margin:0 0 .55rem;font:700 1.02rem/1.25 Georgia,serif}
.voile p{margin:.35rem 0;font-size:.85rem;line-height:1.5}
.voile .ch{margin:.5rem 0}
.voile .ch label{display:block;font-size:.72rem;color:#8fa1b8;margin-bottom:.15rem}
.voile .ch input,.voile .ch select{width:100%}
.voile label.rc{display:flex;align-items:flex-start;gap:.5rem;margin-top:.6rem;
  font-size:.81rem;line-height:1.5;cursor:pointer}
.voile label.rc input{width:auto;margin-top:2px}
.voile .fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Explorateur de photos ». */
function pageExplorateur() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Explorateur de photos — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🗂️</span><h1>Explorateur de photos</h1>
  <span class="sous" id="sous"></span></div>
<div class="barre" id="barre"></div>
<div class="corps" id="corps">
  <div class="zone" id="liste"><div class="vide">Lecture de la photothèque…</div></div>
  <div class="apercu" id="apercu"><div class="vide">Cliquez une photo pour la voir ici.</div></div>
</div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="cpt" id="cpt"></span>
  <span class="droite" id="actions"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var zone = document.getElementById('liste');
  var barreEl = document.getElementById('barre');
  var apercuEl = document.getElementById('apercu');
  var cptEl = document.getElementById('cpt');
  var actionsEl = document.getElementById('actions');

  var D = null;            // derniere reponse de studio:explorer
  var VUE = 'liste';       // liste | grille
  var Q = '', FILTRES = [], SANS = '', LOT = '', TRI = 'recent';
  var SEL = {};            // { id: true }
  var ANCRE = null;        // index de depart pour la selection Maj-clic
  var COURANT = null;      // la photo affichee dans l apercu
  var OCC = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function poids(n){
    var o = Number(n) || 0;
    if (!o) return '—';
    return o > 1048576 ? ((o / 1048576).toFixed(1) + ' Mo') : (Math.round(o / 1024) + ' Ko');
  }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application.',
    droit:              'Votre rôle ne donne pas accès à la photothèque.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    module_photos:      'La photothèque n’a pas pu être chargée.',
    aucune_photo:       'Aucune photo choisie.',
    toutes_deja_faites: 'Toutes ces photos ont déjà ce traitement.',
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

  /* ══ LA BARRE ═══════════════════════════════════════════════════════════ */
  function dessinerBarre(){
    var h = '<input type="search" id="q" placeholder="Rechercher (nom, code, produit, SKU)…" value="'
      + esc(Q) + '">';
    h += (D && D.filtres ? D.filtres : []).map(function(f){
      return '<button class="jeton' + (FILTRES.indexOf(f.cle) >= 0 ? ' on' : '') + '"'
        + ' data-filtre="' + esc(f.cle) + '">' + esc(f.nom) + '</button>'; }).join('');
    h += '<select id="sans"><option value="">Traitement — tous</option>'
      + (D && D.traitements ? D.traitements : []).map(function(t){
          return '<option value="' + esc(t.cle) + '"' + (SANS === t.cle ? ' selected' : '')
            + '>Sans « ' + esc(t.nom) + ' »</option>'; }).join('') + '</select>';
    if (D && (D.lots || []).length) {
      h += '<select id="lot"><option value="">Tous les lots</option>'
        + D.lots.map(function(l){
            return '<option value="' + esc(l.cle) + '"' + (LOT === l.cle ? ' selected' : '')
              + '>' + esc(l.nom) + '</option>'; }).join('') + '</select>';
    }
    h += '<select id="tri">' + [['recent', 'Plus récentes'], ['code', 'Code'], ['name', 'Nom'],
        ['linked', 'Liées d’abord'], ['size', 'Plus lourdes']].map(function(t){
        return '<option value="' + t[0] + '"' + (TRI === t[0] ? ' selected' : '') + '>'
          + t[1] + '</option>'; }).join('') + '</select>';
    h += '<span class="vues">'
      + '<button id="v-liste"' + (VUE === 'liste' ? ' class="on"' : '') + ' title="Affichage en liste">☰</button>'
      + '<button id="v-grille"' + (VUE === 'grille' ? ' class="on"' : '') + ' title="Affichage en vignettes">▦</button>'
      + '</span>';
    barreEl.innerHTML = h;
    brancherBarre();
  }

  function brancherBarre(){
    var q = document.getElementById('q');
    if (q) {
      q.oninput = function(){
        Q = q.value;
        clearTimeout(window._eq);
        window._eq = setTimeout(charger, 280);
      };
    }
    barreEl.querySelectorAll('[data-filtre]').forEach(function(el){
      el.onclick = function(){
        var c = el.getAttribute('data-filtre');
        var i = FILTRES.indexOf(c);
        if (i >= 0) FILTRES.splice(i, 1); else FILTRES.push(c);
        charger();
      };
    });
    var s = document.getElementById('sans');
    if (s) s.onchange = function(){ SANS = s.value; charger(); };
    var l = document.getElementById('lot');
    if (l) l.onchange = function(){ LOT = l.value; charger(); };
    var t = document.getElementById('tri');
    if (t) t.onchange = function(){ TRI = t.value; charger(); };
    var vl = document.getElementById('v-liste');
    if (vl) vl.onclick = function(){ VUE = 'liste'; dessiner(); };
    var vg = document.getElementById('v-grille');
    if (vg) vg.onclick = function(){ VUE = 'grille'; dessiner(); };
  }

  /* ══ LA LISTE ET LA GRILLE ══════════════════════════════════════════════ */
  function pastilles(p){
    var h = '';
    if ((p.faits || []).length) h += '<span class="pt fait" title="Déjà traitée">✓</span>';
    if (p.isole) h += '<span class="pt" title="Détourée">◇</span>';
    if (p.lieId) h += '<span class="pt" title="' + esc(p.lieNom || 'Produit lié') + '">🔗</span>';
    return h ? '<span class="pastilles">' + h + '</span>' : '';
  }

  function dessinerListe(){
    var ph = (D && D.photos) || [];
    if (!ph.length) return vueVide();
    return '<table><thead><tr><th></th><th>Nom</th><th>Code</th><th>Produit lié</th>'
      + '<th>État</th><th>Poids</th></tr></thead><tbody>'
      + ph.map(function(p, i){
          return '<tr data-i="' + i + '" data-id="' + esc(p.id) + '"'
            + (SEL[p.id] ? ' class="pris' + (COURANT === p.id ? ' actif' : '') + '"'
                         : (COURANT === p.id ? ' class="actif"' : '')) + '>'
            + '<td class="vig">' + (p.apercu ? '<img src="' + esc(p.apercu) + '" loading="lazy" alt="">' : '') + '</td>'
            + '<td>' + esc(p.nom) + '</td>'
            + '<td>' + esc(p.code || '') + '</td>'
            + '<td>' + esc(p.lieNom || '—') + '</td>'
            + '<td>' + pastilles(p) + '</td>'
            + '<td>' + poids(p.poids) + '</td></tr>'; }).join('')
      + '</tbody></table>';
  }

  function dessinerGrille(){
    var ph = (D && D.photos) || [];
    if (!ph.length) return vueVide();
    return '<div class="grille">' + ph.map(function(p, i){
      return '<div class="vig' + (SEL[p.id] ? ' pris' : '') + (COURANT === p.id ? ' actif' : '')
        + '" data-i="' + i + '" data-id="' + esc(p.id) + '" title="' + esc(p.nom) + '">'
        + (p.apercu ? '<img src="' + esc(p.apercu) + '" loading="lazy" alt="">'
                    : '<div style="height:6rem"></div>')
        + '<div class="nm">' + esc(p.nom) + '</div></div>'; }).join('') + '</div>';
  }

  function vueVide(){
    if (D && D.charge === false) return '<div class="vide">Lecture de la photothèque…</div>';
    var filtre = Q || FILTRES.length || SANS || LOT;
    return '<div class="vide">' + (filtre
      ? 'Aucune photo ne correspond à ces critères.'
      : 'Aucune photo dans la photothèque. Importez-en depuis l’écran Photothèque.') + '</div>';
  }

  /* ══ L APERCU ═══════════════════════════════════════════════════════════ */
  function dessinerApercu(){
    var p = null;
    ((D && D.photos) || []).forEach(function(x){ if (x.id === COURANT) p = x; });
    if (!p) { apercuEl.innerHTML = '<div class="vide">Cliquez une photo pour la voir ici.</div>'; return; }
    var faits = (p.faits || []).map(function(f){
      var n = f;
      ((D && D.traitements) || []).forEach(function(t){ if (t.cle === f) n = t.nom; });
      return n;
    }).join(', ');
    var ligne = function(k, v){
      return '<div class="l"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span></div>';
    };
    apercuEl.innerHTML = '<div class="img">'
      + (p.apercu ? '<img src="' + esc(p.apercu) + '" alt="' + esc(p.nom) + '">'
                  : '<div class="vide">Téléversement en cours…</div>')
      + '</div><div class="infos">'
      + ligne('Nom', p.nom)
      + ligne('Code', p.code || '—')
      + ligne('Produit lié', p.lieNom || 'aucun')
      + (p.lieSku ? ligne('SKU', p.lieSku) : '')
      + ligne('Traitements', faits || 'aucun')
      + ligne('Détourée', p.isole ? 'oui' : 'non')
      + ligne('Poids', poids(p.poids))
      + (p.lotNom ? ligne('Lot d’import', p.lotNom) : '')
      + '</div>';
  }

  /* ══ LA SELECTION ═══════════════════════════════════════════════════════
     ⚠ TROIS GESTES, COMME UN EXPLORATEUR, ET IL FAUT LES TROIS :
       clic        = ne garder que celle-ci (et l afficher) ;
       Ctrl-clic   = ajouter ou retirer une photo ;
       Maj-clic    = prendre toute la PLAGE depuis la derniere cliquee.
     C est le Maj-clic qui rend 500 photos selectionnables en deux gestes —
     sans lui, il faudrait 500 clics, ce qui est exactement le probleme. */
  function surClicLigne(i, id, ev){
    var ph = (D && D.photos) || [];
    if (ev.shiftKey && ANCRE != null) {
      var a = Math.min(ANCRE, i), b = Math.max(ANCRE, i);
      for (var k = a; k <= b; k++) if (ph[k]) SEL[ph[k].id] = true;
    } else if (ev.ctrlKey || ev.metaKey) {
      if (SEL[id]) delete SEL[id]; else SEL[id] = true;
      ANCRE = i;
    } else {
      SEL = {}; SEL[id] = true; ANCRE = i;
    }
    COURANT = id;
    dessiner();
  }

  function brancherZone(){
    zone.querySelectorAll('[data-i]').forEach(function(el){
      el.onclick = function(ev){
        surClicLigne(parseInt(el.getAttribute('data-i'), 10), el.getAttribute('data-id'), ev);
      };
    });
  }

  function dessinerPied(){
    var n = Object.keys(SEL).length;
    var dispo = (D && D.tousLesIds) ? D.tousLesIds.length : 0;
    cptEl.className = 'cpt' + (n ? ' on' : '');
    cptEl.textContent = n ? (n + ' sélectionnée' + (n > 1 ? 's' : '')) : 'Aucune sélection';
    actionsEl.innerHTML =
      '<button class="jeton" id="a-tout"' + (dispo ? '' : ' disabled') + '>Tout (' + dispo + ')</button>'
      + '<button class="jeton" id="a-inv"' + (dispo ? '' : ' disabled') + '>Inverser</button>'
      + '<button class="jeton" id="a-rien"' + (n ? '' : ' disabled') + '>Vider</button>'
      + '<button class="prim" id="a-lot"' + (n ? '' : ' disabled') + '>⚙ Traiter '
      + (n ? ('ces ' + n) : '') + ' en lot…</button>';
    var t = document.getElementById('a-tout');
    if (t) t.onclick = function(){
      ((D && D.tousLesIds) || []).forEach(function(id){ SEL[id] = true; }); dessiner(); };
    var iv = document.getElementById('a-inv');
    if (iv) iv.onclick = function(){
      ((D && D.tousLesIds) || []).forEach(function(id){
        if (SEL[id]) delete SEL[id]; else SEL[id] = true; }); dessiner(); };
    var r = document.getElementById('a-rien');
    if (r) r.onclick = function(){ SEL = {}; dessiner(); };
    var lo = document.getElementById('a-lot');
    if (lo) lo.onclick = ouvrirLot;
  }

  function dessiner(){
    zone.innerHTML = (VUE === 'liste') ? dessinerListe() : dessinerGrille();
    brancherZone();
    dessinerApercu();
    dessinerPied();
    var s = document.getElementById('sous');
    if (s && D) s.textContent = (D.trouvees || 0) + ' sur ' + (D.total || 0);
  }

  /* ══ LANCER UN LOT ══════════════════════════════════════════════════════
     ⚠ ON DIT CE QUE CA COUTE AVANT. Chaque photo est un appel facture. */
  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  function ouvrirLot(){
    var ids = Object.keys(SEL);
    if (!ids.length) return;
    var opts = (D && D.traitements) || [];
    voile('<h3>⚙ Traiter ' + ids.length + ' photo' + (ids.length > 1 ? 's' : '') + ' en lot</h3>'
      + '<div class="ch"><label for="l-quoi">Traitement à appliquer</label>'
      + '<select id="l-quoi">' + opts.map(function(t){
          return '<option value="' + esc(t.cle) + '">' + esc(t.nom) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="l-nom">Nom du lot (pour le retrouver dans le suivi)</label>'
      + '<input id="l-nom" placeholder="Collection automne — détourage"></div>'
      + '<label class="rc"><input type="checkbox" id="l-prio"> <span><strong>Priorité haute</strong> — '
      + 'ce lot passe devant ceux qui attendent.</span></label>'
      + '<label class="rc"><input type="checkbox" id="l-refaire"> <span><strong>Refaire celles déjà '
      + 'traitées.</strong> Par défaut elles sont écartées : les repasser coûte un appel chacune '
      + 'pour un résultat identique.</span></label>'
      + '<p class="aide">Chaque photo est un appel facturé. Le lot part en arrière-plan : vous pouvez '
      + 'fermer cette fenêtre, il continue et se suit depuis n’importe quel écran.</p>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Lancer le lot</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          this.disabled = true;
          var g = function(i){ var e = document.getElementById(i); return e ? e.value : ''; };
          var c = function(i){ var e = document.getElementById(i); return !!(e && e.checked); };
          appeler('lots:creer', [{ ids: ids, quoi: g('l-quoi'), nom: g('l-nom'),
            priorite: c('l-prio') ? 1 : 0, refaire: c('l-refaire'), options: {} }]).then(function(r){
            fermer();
            if (!r.ok) {
              dire(r.motif === 'toutes_deja_faites'
                ? ('Ces ' + (r.deja || ids.length) + ' photos ont déjà ce traitement. Cochez « Refaire ».')
                : expliquer(r), 'err');
              return;
            }
            SEL = {};
            dire(r.nom + ' — ' + r.total + ' photo' + (r.total > 1 ? 's' : '') + ' en traitement'
              + (r.ignorees ? ' (' + r.ignorees + ' déjà faite' + (r.ignorees > 1 ? 's' : '') + ')' : '')
              + '. Suivez-le en bas de n’importe quel écran.', 'bon');
            charger();
          });
        };
      });
  }

  /* ══ CHARGEMENT ════════════════════════════════════════════════════════ */
  function charger(){
    if (OCC) return;
    OCC = true;
    /* ⚠ TAILLE 500 : c est un explorateur, pas un defilement infini. Charger
       page par page rendrait le Maj-clic inutile — on ne peut pas prendre une
       plage qui traverse une page pas encore lue. */
    appeler('studio:explorer', [{ q: Q, filtres: FILTRES, sansTraitement: SANS, lot: LOT,
      tri: TRI, page: 0, taille: 500 }]).then(function(r){
      OCC = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      D = r;
      dessinerBarre();
      dessiner();
      dire('');
    });
  }

  window.szActualiser = function(){
    // Ne jamais recharger pendant qu on tape dans la recherche.
    var q = document.getElementById('q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ charger(); };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); P.fermer(); }
    // Ctrl+A : tout selectionner, comme partout ailleurs.
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'a' || ev.key === 'A')) {
      ev.preventDefault();
      ((D && D.tousLesIds) || []).forEach(function(id){ SEL[id] = true; });
      dessiner();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageExplorateur };
