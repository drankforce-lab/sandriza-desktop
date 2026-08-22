'use strict';

/*
 * FENÊTRE « CONFIGURATION DE LA NAVIGATION » — NATIVE (Configuration, palier 5)
 * =============================================================================
 * Le menu de la boutique : les éléments fixes (Accueil, catégories — jamais
 * supprimables, seulement masquables et enrichis de sous-menus) et les éléments
 * personnalisés (étiquette + lien libres). Réordonner, masquer, ajouter des
 * sous-menus (lien libre, catégorie ou collection), réinitialiser.
 *
 * ⚠ AUCUN SECRET ICI. La fenêtre porte le tableau ENTIER à chaque geste et le
 * cœur du site le réécrit (même clé `elg_nav_cfg` que l'écran web → même poussée
 * automatique vers le nuage). Le cœur VERROUILLE les éléments fixes : leur
 * étiquette et leur lien ne bougent pas, et un fixe disparu est remis d'office.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.barre{flex:0 0 auto;display:flex;align-items:center;gap:.5rem;justify-content:flex-end;
  padding:.6rem 1.05rem .2rem}
.barre .aide{margin-right:auto;font-size:.76rem;color:#6d7f96;max-width:44rem}
.corps{flex:1 1 auto;min-height:0;padding:.5rem 1.05rem .9rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.item{border:1px solid rgba(255,255,255,.08);border-radius:11px;margin-bottom:.55rem;
  background:#16202f;overflow:hidden}
.item .lg{display:flex;align-items:center;gap:.6rem;padding:.6rem .8rem}
.item .mk{font-size:.85rem;opacity:.5;flex:0 0 auto;width:1.1rem;text-align:center}
.item .co{flex:1 1 auto;min-width:0;display:flex;gap:.4rem;align-items:center;flex-wrap:wrap}
.item .co .lab{font-weight:600;font-size:.9rem}
.item .co .href{font-size:.78rem;color:#6d7f96;font-family:ui-monospace,Menlo,Consolas,monospace}
.item.masque .co .lab{opacity:.45}
.item .gestes{display:flex;align-items:center;gap:.3rem;flex:0 0 auto}
input,select{font:inherit;color:#e8edf5;background:#0f1724;border:1px solid #2b3444;
  border-radius:7px;padding:.34rem .5rem}
input:focus,select:focus{outline:none;border-color:#c9a97e}
input:disabled,select:disabled{opacity:.55}
input.lab{width:11rem}
input.href{width:15rem;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.8rem}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:7px;padding:.32rem .6rem;cursor:pointer}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.24rem .5rem;font-size:.8rem}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
button.danger{color:#f4b4b4;border-color:rgba(240,120,120,.35)}
button.danger.arme{background:#7f1d1d;border-color:#b91c1c;color:#fff}
.sous{background:#0f1724;border-top:1px solid rgba(255,255,255,.08);padding:.4rem .8rem .55rem}
.sous .tt{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6d7f96;margin-bottom:.3rem}
.enf{display:flex;align-items:center;gap:.5rem;padding:.28rem .5rem;background:#16202f;
  border:1px solid rgba(255,255,255,.07);border-radius:6px;margin-bottom:.25rem}
.enf .fl{color:#6d7f96;font-size:.8rem}
.enf .el{font-size:.85rem;font-weight:500;flex:1 1 auto;min-width:0}
.enf .eh{font-size:.76rem;color:#6d7f96;font-family:ui-monospace,Menlo,Consolas,monospace}
.form{margin-top:.4rem;padding:.6rem .7rem;background:rgba(201,169,126,.08);
  border:1px solid rgba(201,169,126,.25);border-radius:8px;
  display:flex;gap:.5rem;flex-wrap:wrap;align-items:flex-end}
.form .ch{display:flex;flex-direction:column;gap:.2rem}
.form .ch label{font-size:.7rem;color:#8fa1b8}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
.vide{padding:1.4rem;text-align:center;color:#8fa1b8;font-size:.85rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageConfigNavigation() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Configuration de la navigation — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.navmenu}</span><h1>Configuration de la navigation</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter le menu, pas le modifier.</div>
<div class="barre">
  <span class="aide"><span class="ic">🔒</span> Les éléments fixes ne se suppriment pas — masquez-les ou ajoutez-leur des sous-menus. « + Ajouter » crée un élément personnalisé.</span>
  <button class="mini danger" id="b-reset" disabled>Réinitialiser</button>
  <button class="mini prim" id="b-add" disabled>+ Ajouter un élément</button>
</div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── le meme bouton d'ancrage/detachement que les autres ecrans. */
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
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
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
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bAdd = document.getElementById('b-add');
  var bReset = document.getElementById('b-reset');
  var D = null, RO = false, OCCUPE = false;
  var FORM = null;       // id de l'element dont le formulaire "sous-menu" est ouvert
  var SUPPR = null;      // id de l'element arme pour suppression
  var RESET = false;     // reinitialisation armee
  var FOCUS_ID = null;   // element a focaliser apres redraw (nouvel ajout)

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule : le menu ne peut pas être modifié.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    nuage:              'L’enregistrement dans le nuage a échoué. Réessayez.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').'))
      + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  function items(){ return (D && Array.isArray(D.items)) ? D.items : []; }
  function trouver(id){ var l = items(); for (var i=0;i<l.length;i++){ if (l[i].id === id) return l[i]; } return null; }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    bAdd.disabled = RO || OCCUPE;
    bReset.disabled = RO || OCCUPE;
    bReset.textContent = RESET ? 'Confirmer ?' : 'Réinitialiser';
    bReset.classList.toggle('arme', !!RESET);
    var l = items();
    if (!l.length) { corps.innerHTML = '<div class="vide">Aucun élément de menu.</div>'; return; }
    var dis = RO ? ' disabled' : '';
    var h = [];
    for (var i=0;i<l.length;i++) {
      var it = l[i];
      var masque = (it.visible === false);
      h.push('<div class="item' + (masque ? ' masque' : '') + '">');
      h.push('<div class="lg"><span class="mk">' + (it.fixed ? '<span class="ic">🔒</span>' : '✎') + '</span><div class="co">');
      if (it.fixed) {
        h.push('<span class="lab">' + esc(it.label) + '</span><span class="href">' + esc(it.href) + '</span>');
      } else {
        h.push('<input class="lab" data-field="label" data-id="' + esc(it.id) + '" value="' + esc(it.label) + '" placeholder="Étiquette"' + dis + '>');
        h.push('<input class="href" data-field="href" data-id="' + esc(it.id) + '" value="' + esc(it.href) + '" placeholder="#shop ou https://…"' + dis + '>');
      }
      h.push('</div><div class="gestes">');
      h.push('<button class="mini" data-act="up" data-id="' + esc(it.id) + '" title="Monter"' + (i===0||RO?' disabled':'') + '>↑</button>');
      h.push('<button class="mini" data-act="down" data-id="' + esc(it.id) + '" title="Descendre"' + (i===l.length-1||RO?' disabled':'') + '>↓</button>');
      h.push('<button class="mini" data-act="toggle" data-id="' + esc(it.id) + '" title="' + (masque?'Afficher':'Masquer') + '"' + dis + '>' + (masque?'<span class="ic">🙈</span>':'<span class="ic">👁</span>') + '</button>');
      h.push('<button class="mini" data-act="form" data-id="' + esc(it.id) + '"' + dis + '>+ Sous-menu</button>');
      if (!it.fixed) {
        var arme = (SUPPR === it.id);
        h.push('<button class="mini danger' + (arme?' arme':'') + '" data-act="del" data-id="' + esc(it.id) + '"' + dis + '>' + (arme?'Confirmer ?':'<span class="ic">🗑</span>') + '</button>');
      }
      h.push('</div></div>');
      // sous-menu existant
      var enfants = (it.children || []);
      if (enfants.length) {
        h.push('<div class="sous"><div class="tt">Sous-menu</div>');
        for (var j=0;j<enfants.length;j++) {
          var c = enfants[j];
          h.push('<div class="enf"><span class="fl">↳</span><span class="el">' + esc(c.label) + '</span>'
            + '<span class="eh">' + esc(c.href) + '</span>'
            + '<button class="mini danger" data-act="delchild" data-id="' + esc(it.id) + '" data-cid="' + esc(c.id) + '"' + dis + '>✕</button></div>');
        }
        h.push('</div>');
      }
      // formulaire d'ajout de sous-menu
      if (FORM === it.id && !RO) {
        h.push(formulaireSousMenu(it.id));
      }
      h.push('</div>');
    }
    corps.innerHTML = h.join('');
    if (FOCUS_ID) {
      var fe = corps.querySelector('input.lab[data-id="' + FOCUS_ID + '"]');
      FOCUS_ID = null;
      if (fe) { try { fe.focus(); fe.select(); } catch (e) {} }
    }
  }

  function formulaireSousMenu(id){
    var cats = (D.categories || []);
    var cols = (D.collections || []);
    var s = '<div class="form" data-form="' + esc(id) + '">';
    s += '<div class="ch"><label>Type</label><select data-typesel="' + esc(id) + '">'
       + '<option value="custom">Lien personnalisé</option>'
       + '<option value="category">Catégorie</option>'
       + (cols.length ? '<option value="collection">Collection</option>' : '')
       + '</select></div>';
    s += '<div class="ch" data-grp="label"><label>Étiquette</label>'
       + '<input data-role="label" placeholder="Nom affiché" style="width:10rem"></div>';
    s += '<div class="ch" data-grp="href"><label>Lien</label>'
       + '<input data-role="href" placeholder="#shop?cat=robes" style="width:12rem;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.8rem"></div>';
    s += '<div class="ch" data-grp="cat" style="display:none"><label>Catégorie</label><select data-role="cat">'
       + cats.map(function(c){ return '<option value="' + esc(c.key) + '">' + esc(c.label) + '</option>'; }).join('')
       + '</select></div>';
    if (cols.length) {
      s += '<div class="ch" data-grp="col" style="display:none"><label>Collection</label><select data-role="col">'
         + cols.map(function(c){ return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('')
         + '</select></div>';
    }
    s += '<button class="mini prim" data-act="addchild" data-id="' + esc(id) + '">Ajouter</button>';
    s += '<button class="mini" data-act="form" data-id="' + esc(id) + '">Annuler</button>';
    s += '</div>';
    return s;
  }

  // Bascule d'affichage des champs du formulaire selon le type choisi (sans redraw,
  // pour ne pas perdre ce que la personne a deja saisi).
  function typeUI(id){
    var form = corps.querySelector('.form[data-form="' + id + '"]');
    if (!form) return;
    var sel = form.querySelector('select[data-typesel]');
    var type = sel ? sel.value : 'custom';
    var grp = function(n){ return form.querySelector('[data-grp="' + n + '"]'); };
    var gh = grp('href'), gc = grp('cat'), gco = grp('col');
    if (gh) gh.style.display = (type === 'custom') ? '' : 'none';
    if (gc) gc.style.display = (type === 'category') ? '' : 'none';
    if (gco) gco.style.display = (type === 'collection') ? '' : 'none';
    // auto-remplissage de l'etiquette pour categorie / collection
    var lab = form.querySelector('input[data-role="label"]');
    if (lab && !lab.value.trim()) {
      if (type === 'category') { var cs = form.querySelector('select[data-role="cat"]'); if (cs) lab.value = cs.options[cs.selectedIndex] ? cs.options[cs.selectedIndex].text : ''; }
      else if (type === 'collection') { var os = form.querySelector('select[data-role="col"]'); if (os) lab.value = os.options[os.selectedIndex] ? os.options[os.selectedIndex].text : ''; }
    }
  }

  // ── ECRITURE : on porte TOUT le tableau au coeur, qui applique les regles des fixes.
  function ecrire(redraw){
    if (RO || OCCUPE) return;
    OCCUPE = true; bAdd.disabled = true; bReset.disabled = true; dire('Enregistrement…');
    appeler('config:nav:ecrire', [items()]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) {
        D = r; RO = !r.peutModifier;
        if (redraw) dessiner(); else { bAdd.disabled = RO; bReset.disabled = RO; }
        dire('Enregistré.', 'bon');
      } else {
        if (redraw) dessiner(); else { bAdd.disabled = RO; bReset.disabled = RO; }
        dire(expliquer(r), 'err');
      }
    });
  }

  function reinit(){
    if (RO || OCCUPE) return;
    OCCUPE = true; bAdd.disabled = true; bReset.disabled = true; dire('Réinitialisation…');
    appeler('config:nav:reinit').then(function(r){
      OCCUPE = false; RESET = false;
      if (r && r.ok) { D = r; RO = !r.peutModifier; dessiner(); dire('Navigation réinitialisée.', 'bon'); }
      else { dessiner(); dire(expliquer(r), 'err'); }
    });
  }

  // ── GESTES (clic delegue) ───────────────────────────────────────────────────
  corps.addEventListener('click', function(ev){
    var b = ev.target.closest ? ev.target.closest('button[data-act]') : null;
    if (!b || RO || OCCUPE) return;
    var act = b.getAttribute('data-act');
    var id = b.getAttribute('data-id');
    var prevSuppr = SUPPR; SUPPR = null;
    var it = trouver(id);
    if (act === 'up' || act === 'down') {
      var l = items(); var idx = -1; for (var k=0;k<l.length;k++){ if (l[k].id===id){ idx=k; break; } }
      if (idx < 0) return;
      var n = idx + (act === 'up' ? -1 : 1);
      if (n < 0 || n >= l.length) { dessiner(); return; }
      var tmp = l[idx]; l[idx] = l[n]; l[n] = tmp;
      ecrire(true);
    } else if (act === 'toggle') {
      if (it) { it.visible = (it.visible === false); ecrire(true); }
    } else if (act === 'form') {
      FORM = (FORM === id) ? null : id;
      dessiner();
    } else if (act === 'del') {
      if (!it || it.fixed) { dessiner(); return; }
      if (prevSuppr === id) {
        D.items = items().filter(function(x){ return x.id !== id; });
        ecrire(true);
      } else { SUPPR = id; dessiner(); dire('Cliquez « Confirmer ? » pour supprimer cet élément.', 'att'); }
    } else if (act === 'delchild') {
      var cid = b.getAttribute('data-cid');
      if (it) { it.children = (it.children || []).filter(function(c){ return c.id !== cid; }); ecrire(true); }
    } else if (act === 'addchild') {
      ajouterEnfant(id);
    } else { dessiner(); }
  });

  // ── SAISIES (changement delegue) : etiquette/lien des elements + type du formulaire
  corps.addEventListener('change', function(ev){
    var t = ev.target;
    if (t.matches && t.matches('input[data-field]')) {
      if (RO) return;
      var it = trouver(t.getAttribute('data-id'));
      if (it && !it.fixed) { it[t.getAttribute('data-field')] = t.value; ecrire(false); }
    } else if (t.matches && (t.matches('select[data-typesel]') || t.matches('select[data-role="cat"]') || t.matches('select[data-role="col"]'))) {
      var form = t.closest('.form');
      if (form) typeUI(form.getAttribute('data-form'));
    }
  });

  function ajouterEnfant(id){
    var it = trouver(id); if (!it) return;
    var form = corps.querySelector('.form[data-form="' + id + '"]'); if (!form) return;
    var type = (form.querySelector('select[data-typesel]') || {}).value || 'custom';
    var lab = (form.querySelector('input[data-role="label"]') || {}).value || '';
    lab = lab.trim();
    if (!lab) { dire('L’étiquette du sous-menu est requise.', 'err'); return; }
    var href = '';
    if (type === 'custom') {
      href = ((form.querySelector('input[data-role="href"]') || {}).value || '').trim();
      if (!href) { dire('Le lien du sous-menu est requis.', 'err'); return; }
    } else if (type === 'category') {
      href = '#shop?cat=' + ((form.querySelector('select[data-role="cat"]') || {}).value || '');
    } else if (type === 'collection') {
      href = '#shop?collection=' + ((form.querySelector('select[data-role="col"]') || {}).value || '');
    }
    if (!it.children) it.children = [];
    it.children.push({ id: 'ch_' + Date.now(), label: lab, href: href, visible: true });
    FORM = null;
    ecrire(true);
  }

  bAdd.onclick = function(){
    if (RO || OCCUPE) return;
    var nid = 'custom_' + Date.now();
    items().push({ id: nid, label: 'Nouveau lien', href: '#shop', fixed: false, visible: true, children: [] });
    FOCUS_ID = nid;
    ecrire(true);
  };
  bReset.onclick = function(){
    if (RO || OCCUPE) return;
    if (RESET) { reinit(); }
    else { RESET = true; dessiner(); dire('Cliquez « Confirmer ? » : le menu reprend sa composition d’origine, vos ajouts sont perdus.', 'att'); }
  };

  function charger(){
    dire('Lecture…');
    appeler('config:nav:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="vide">' + expliquer(r) + '</div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r; RO = !r.peutModifier; dessiner(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageConfigNavigation };
