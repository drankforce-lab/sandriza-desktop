'use strict';

/*
 * FENÊTRE « GABARITS COURRIEL » — NATIVE (Communications, palier 5)
 * =============================================================================
 * Le style des courriels : dégradés d'en-tête et de pied, sous-titre, effet
 * animé CSS, bannière GIF ; plus l'attribution d'un gabarit à chaque fonction
 * (confirmation de commande, expédition, retours, campagnes…). Aucun secret :
 * ce sont des couleurs.
 *
 * ⚠ L'APERÇU DE LA BANNIÈRE GIF passe par le pont (config:gabarits:gifApercu) :
 * la fenêtre native n'a pas d'origine pour appeler email-gif.php ; la fenêtre
 * principale la récupère et rend un dataURL.
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
.tete .droite{margin-left:auto}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
/* ⚠ ANCRÉE = PLEINE PAGE : cartes en colonnes pour remplir la largeur. */
.zone{columns:36rem;column-gap:1.1rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:1rem 1.1rem;
  margin:0 0 1.1rem;break-inside:avoid;-webkit-column-break-inside:avoid}
.carte.edit{border-color:#c9a97e}
.stitre{font-size:.9rem;font-weight:700;color:var(--tx-bleute);margin:0 0 .1rem;display:flex;align-items:center;justify-content:space-between;gap:.6rem}
.sdesc{font-size:.76rem;color:var(--tx2);margin:.1rem 0 .8rem}
.gr2{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
@media (max-width:640px){.gr2{grid-template-columns:1fr}}
.ch{margin:0 0 .7rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.22rem;font-size:.75rem;color:var(--tx2)}
.ch input[type=text],.ch select{width:100%;font:inherit;font-size:.83rem;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v12);border-radius:8px;padding:.4rem .5rem}
.ch input:focus,.ch select:focus{outline:none;border-color:#c9a97e}
.ch input:disabled,.ch select:disabled{opacity:.55}
.coul{display:flex;gap:.5rem;align-items:center}
.coul input[type=color]{height:36px;width:48px;padding:0;border:1px solid var(--v12);border-radius:8px;background:var(--f-champ);cursor:pointer;flex:0 0 auto}
.coul input[type=text]{flex:1;font-family:ui-monospace,Consolas,monospace}
.bascule{display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;padding:.55rem .7rem;background:var(--f-champ);
  border:1px solid var(--v12);border-radius:9px;margin:0 0 .7rem;-webkit-user-select:none;user-select:none}
.bascule input{margin-top:.15rem;accent-color:#c9a97e;cursor:pointer;flex:0 0 auto}
.bascule .t{font-size:.82rem;font-weight:600}
.bascule .d{font-size:.72rem;color:var(--tx2);line-height:1.45}
.apercu{border-radius:9px;overflow:hidden;font-size:12px;max-width:420px;margin:.2rem 0 .8rem;border:1px solid var(--v12)}
.apercu .head{padding:16px 24px;text-align:center}
.apercu .head .ti{font-family:Georgia,serif;font-size:16px;font-weight:700;letter-spacing:4px;color:var(--tx-blanc)}
.apercu .head .su{font-size:8px;letter-spacing:2px;text-transform:uppercase;margin-top:4px}
.apercu .body{background:#fff;padding:10px 20px;color:#555;font-size:11px}
.apercu .foot{padding:10px 24px;text-align:center}
.apercu .foot .cp{font-size:10px}
.gifwrap{max-width:420px;margin:0 0 .8rem}
.gifwrap .lg{font-size:.73rem;color:var(--tx2);margin-bottom:.3rem;display:flex;align-items:center;gap:.5rem}
.gifwrap img{display:block;width:100%;border-radius:8px;border:1px solid var(--v12);background:var(--f-champ);min-height:60px}
@keyframes szshine{0%{background-position:0% 50%}100%{background-position:220% 50%}}
.anim{animation:szshine 6s linear infinite}
.ligne{display:flex;align-items:center;gap:1rem;padding:.6rem .8rem;background:var(--f-champ);border:1px solid var(--v12);border-radius:9px;margin:0 0 .55rem}
.ligne .nom{flex:1;font-size:.85rem;font-weight:600}
.ligne .def{font-size:.7rem;color:var(--tx2);font-weight:400;margin-left:.4rem}
.swatch{display:flex;gap:6px;align-items:center;margin-top:4px}
.swatch .b1{width:44px;height:11px;border-radius:3px}
.swatch .b2{width:11px;height:11px;border-radius:3px}
.swatch .lb{font-size:.68rem;color:var(--tx2)}
.tbl{width:100%;border-collapse:collapse;font-size:.8rem}
.tbl th{text-align:left;color:var(--tx2);font-weight:600;padding:.45rem .6rem;border-bottom:1px solid var(--v10);font-size:.72rem;text-transform:uppercase}
.tbl td{padding:.4rem .6rem;border-bottom:1px solid var(--v05);vertical-align:middle}
.tbl td .mod{color:var(--tx2)}
.tbl select{width:100%;font:inherit;font-size:.8rem;color:var(--tx);background:var(--f-page);border:1px solid var(--v12);border-radius:7px;padding:.3rem .4rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button.b{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);
  border-radius:8px;padding:.34rem .7rem;cursor:pointer;font-size:.78rem}
button.b:hover:not(:disabled){background:var(--v10)}
button.b:disabled{opacity:.5;cursor:default}
button.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.4)}
button.prim{font:inherit;background:#c9a97e;border:1px solid #c9a97e;color:#1a1208;font-weight:700;border-radius:8px;padding:.42rem .9rem;cursor:pointer;font-size:.82rem}
button.prim:hover:not(:disabled){background:#d8bd97}
button.prim:disabled{opacity:.5;cursor:default}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;border:1px solid var(--v16);
  border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.mini:hover:not(:disabled){background:var(--v10)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

function pageGabarits(ouverture) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Gabarits courriel — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.gabarit}</span><h1>Gabarits courriel</h1><span class="droite"></span></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="corps"><div class="zone" id="corps"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-nouveau" style="display:none">+ Nouveau gabarit</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id = 'sz-detacher'; b.type = 'button'; b.className = 'mini'; t.appendChild(b); }
    if (actif) { b.textContent = '⧉ Détacher'; b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); }; }
    else { b.textContent = '⚓ Ancrer'; b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bnouveau = document.getElementById('b-nouveau');
  var D = null, RO = false, OCCUPE = false;
  // Ouverture directe sur un éditeur (utilisé par le banc d'essai ; vide en prod).
  var OUVERTURE = ${JSON.stringify(String(ouverture || ''))};
  var EDIT = null;      // null = liste ; '' = nouveau ; id = modification
  var DELCONF = '';     // id en attente de confirmation de suppression
  var gifTimer = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function val(id){ var e = document.getElementById(id); return e ? String(e.value) : ''; }
  function chk(id){ var e = document.getElementById(id); return !!(e && e.checked); }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:'Votre rôle est en lecture seule.',
    indisponible:"L'administration n'est pas encore chargée dans la fenêtre principale.",
    pont_indisponible:'La fenêtre principale ne répond pas.',
    delai:"La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    nom_requis:'Le nom du gabarit est requis.',
    introuvable:'Ce gabarit n’existe plus.',
    defaut_protege:'Le gabarit « Défaut » ne peut pas être supprimé.',
    echec:"L'opération a échoué.",
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').')) + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function occuper(o){ OCCUPE = o; bnouveau.disabled = o || RO; }

  function gabParId(id){ var g = (D && D.gabarits) || []; for (var i = 0; i < g.length; i++) if (g[i].id === id) return g[i]; return null; }

  // ── VUE LISTE + ATTRIBUTIONS ────────────────────────────────────────────────
  function coulChamp(id, label, v){
    return '<div class="ch"><label>' + esc(label) + '</label><div class="coul">'
      + '<input type="color" id="' + id + '" value="' + esc(v) + '"' + (RO ? ' disabled' : '') + '>'
      + '<input type="text" id="' + id + '-t" value="' + esc(v) + '"' + (RO ? ' disabled' : '') + '></div></div>';
  }
  function editeurHtml(){
    var t = (EDIT ? gabParId(EDIT) : null) || { name: '', headerBgFrom: '#1a1a2e', headerBgTo: '#2d1b69',
      headerSubtitle: '', footerBg: '#1a1a2e', footerTextColor: '#c4a882', animated: false, gifBanner: false };
    var brand = (D && D.marque) || 'SANDRIZA';
    var h = '<div class="carte edit"><div class="stitre">' + (EDIT ? '✏️ Modifier — ' + esc(t.name || '') : '✨ Nouveau gabarit') + '</div>';
    h += '<div class="ch"><label>Nom du gabarit</label><input type="text" id="g-name" value="' + esc(t.name || '') + '"' + (RO ? ' disabled' : '') + '></div>';
    h += '<div class="gr2">' + coulChamp('g-hfrom', 'En-tête : couleur de départ', t.headerBgFrom || '#1a1a2e')
      + coulChamp('g-hto', 'En-tête : couleur de fin', t.headerBgTo || '#2d1b69') + '</div>';
    h += '<div class="ch"><label>Sous-titre (vide = tagline du pied de page)</label>'
      + '<input type="text" id="g-sub" value="' + esc(t.headerSubtitle || '') + '" placeholder="ÉLÉGANCE · RAFFINEMENT · STYLE"' + (RO ? ' disabled' : '') + '></div>';
    h += '<label class="bascule"><input type="checkbox" id="g-anim"' + (t.animated ? ' checked' : '') + (RO ? ' disabled' : '') + '>'
      + '<span><span class="t"><span class="ic">✨</span> Effet animé CSS (en-tête &amp; pied)</span><br><span class="d">Léger dégradé chatoyant, sans image. Visible dans Apple Mail / Mail iOS ; ailleurs (Gmail, Outlook) le dégradé reste fixe.</span></span></label>';
    h += '<label class="bascule"><input type="checkbox" id="g-gif"' + (t.gifBanner ? ' checked' : '') + (RO ? ' disabled' : '') + '>'
      + '<span><span class="t"><span class="ic">🖼️</span> Bannière animée GIF (compatible Gmail)</span><br><span class="d">Remplace l’en-tête par une bannière GIF générée à partir des couleurs. S’anime dans Gmail et Outlook. Nom de marque et sous-titre intégrés à l’image.</span></span></label>';
    h += '<div class="gr2">' + coulChamp('g-fbg', 'Pied : couleur de fond', t.footerBg || '#1a1a2e')
      + coulChamp('g-fcol', 'Pied : couleur du texte', t.footerTextColor || '#c4a882') + '</div>';
    // Aperçu CSS
    h += '<div class="apercu" id="g-prev">'
      + '<div class="head" id="g-prev-head"><div class="ti">' + esc(brand.toUpperCase()) + '</div><div class="su" id="g-prev-sub"></div></div>'
      + '<div class="body">…contenu du courriel…</div>'
      + '<div class="foot" id="g-prev-foot"><div class="cp" id="g-prev-cp">© ' + esc(brand) + '.</div></div></div>';
    // Aperçu GIF (relayé)
    h += '<div class="gifwrap" id="g-gifwrap" style="display:' + (t.gifBanner ? 'block' : 'none') + '">'
      + '<div class="lg"><span class="ic">🖼️</span> Aperçu de la bannière GIF <button class="b" type="button" id="g-gifrefr" style="padding:.1rem .5rem">↻</button></div>'
      + '<img id="g-gifimg" alt="Aperçu bannière"></div>';
    if (!RO) {
      h += '<div style="display:flex;gap:.6rem;margin-top:.3rem">'
        + '<button class="prim" id="g-save"><span class="ic">💾</span> Enregistrer</button>'
        + '<button class="b" id="g-cancel">Annuler</button></div>';
    } else {
      h += '<div style="margin-top:.3rem"><button class="b" id="g-cancel">← Retour</button></div>';
    }
    return h + '</div>';
  }
  function listeHtml(){
    var g = (D && D.gabarits) || [];
    var h = '<div class="carte"><div class="stitre"><span class="ic">🎨</span> Gabarits disponibles</div><div class="sdesc">Le style (couleurs, sous-titre, bannière) partagé par les courriels.</div>';
    for (var i = 0; i < g.length; i++) {
      var t = g[i];
      h += '<div class="ligne"><div class="nom">' + esc(t.name) + (t.id === 'default' ? '<span class="def">(défaut)</span>' : '')
        + '<div class="swatch"><div class="b1" style="background:linear-gradient(90deg,' + esc(t.headerBgFrom) + ',' + esc(t.headerBgTo) + ')"></div>'
        + '<span class="lb">en-tête</span><div class="b2" style="background:' + esc(t.footerBg) + '"></div><span class="lb">pied</span></div></div>'
        + '<div style="display:flex;gap:.35rem">'
        + '<button class="b" type="button" data-edit="' + esc(t.id) + '"><span class="ic">✏</span>️ Modifier</button>'
        + (RO ? '' : '<button class="b" type="button" data-copy="' + esc(t.id) + '"><span class="ic">📋</span> Copier</button>')
        + ((!RO && t.supprimable) ? ('<button class="b dgr" type="button" data-del="' + esc(t.id) + '">' + (DELCONF === t.id ? 'Confirmer ?' : '<span class="ic">🗑</span>') + '</button>') : '')
        + '</div></div>';
    }
    h += '</div>';
    // Attributions
    var fns = (D && D.fonctions) || [];
    var opts = g.map(function(t){ return { id: t.id, name: t.name }; });
    h += '<div class="carte"><div class="stitre"><span class="ic">📋</span> Attribution par module / fonction</div><div class="sdesc">Choisissez quel gabarit s’applique à chaque type de courriel.</div>';
    h += '<table class="tbl"><thead><tr><th>Module</th><th>Fonction</th><th>Gabarit</th></tr></thead><tbody>';
    for (var j = 0; j < fns.length; j++) {
      var f = fns[j], cur = (D.attributions && D.attributions[f.key]) || 'default';
      var sel = '<select data-assign="' + esc(f.key) + '"' + (RO ? ' disabled' : '') + '>';
      for (var k = 0; k < opts.length; k++) sel += '<option value="' + esc(opts[k].id) + '"' + (cur === opts[k].id ? ' selected' : '') + '>' + esc(opts[k].name) + '</option>';
      sel += '</select>';
      h += '<tr><td class="mod">' + esc(f.module) + '</td><td>' + esc(f.label) + '</td><td>' + sel + '</td></tr>';
    }
    h += '</tbody></table>';
    if (!RO) h += '<div style="margin-top:.8rem"><button class="prim" id="g-assign-save"><span class="ic">💾</span> Enregistrer les attributions</button></div>';
    return h + '</div>';
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    bnouveau.style.display = (EDIT === null && !RO) ? 'inline-block' : 'none';
    corps.innerHTML = (EDIT === null) ? listeHtml() : editeurHtml();
    brancher();
    if (EDIT !== null) { majApercu(); if (chk('g-gif')) rafraichirGif(); }
  }

  function brancher(){
    if (EDIT === null) {
      var eds = corps.querySelectorAll('[data-edit]'); for (var i = 0; i < eds.length; i++) eds[i].onclick = function(){ DELCONF = ''; EDIT = this.getAttribute('data-edit'); dessiner(); };
      var cps = corps.querySelectorAll('[data-copy]'); for (var c = 0; c < cps.length; c++) cps[c].onclick = function(){ copier(this.getAttribute('data-copy')); };
      var dls = corps.querySelectorAll('[data-del]'); for (var d = 0; d < dls.length; d++) dls[d].onclick = function(){ var id = this.getAttribute('data-del'); if (DELCONF === id) { DELCONF = ''; supprimer(id); } else { DELCONF = id; dessiner(); } };
      var asv = document.getElementById('g-assign-save'); if (asv) asv.onclick = enregistrerAttributions;
      return;
    }
    // Éditeur : synchro couleur + aperçu
    ['g-hfrom','g-hto','g-fbg','g-fcol'].forEach(function(id){
      var c = document.getElementById(id), tx = document.getElementById(id + '-t');
      if (c) c.oninput = function(){ var tt = document.getElementById(this.id + '-t'); if (tt) tt.value = this.value; majApercu(); planGif(); };
      if (tx) tx.oninput = function(){ var cc = document.getElementById(this.id.replace('-t','')); if (cc && /^#[0-9a-fA-F]{6}$/.test(this.value)) cc.value = this.value; majApercu(); planGif(); };
    });
    var sub = document.getElementById('g-sub'); if (sub) sub.oninput = function(){ majApercu(); planGif(); };
    var anim = document.getElementById('g-anim'); if (anim) anim.onchange = majApercu;
    var gif = document.getElementById('g-gif'); if (gif) gif.onchange = function(){ var w = document.getElementById('g-gifwrap'); if (w) w.style.display = this.checked ? 'block' : 'none'; if (this.checked) rafraichirGif(); };
    var gr = document.getElementById('g-gifrefr'); if (gr) gr.onclick = rafraichirGif;
    var sv = document.getElementById('g-save'); if (sv) sv.onclick = enregistrer;
    var cn = document.getElementById('g-cancel'); if (cn) cn.onclick = function(){ EDIT = null; dessiner(); dire(''); };
  }

  function majApercu(){
    var hFrom = val('g-hfrom') || '#1a1a2e', hTo = val('g-hto') || '#2d1b69';
    var fBg = val('g-fbg') || '#1a1a2e', fCol = val('g-fcol') || '#c4a882';
    var sub = val('g-sub'), anim = chk('g-anim');
    var head = document.getElementById('g-prev-head'), foot = document.getElementById('g-prev-foot');
    if (head) {
      head.style.background = anim ? ('linear-gradient(120deg,' + hFrom + ' 0%,' + hTo + ' 45%,' + hFrom + ' 90%)') : ('linear-gradient(135deg,' + hFrom + ' 0%,' + hTo + ' 100%)');
      head.style.backgroundSize = anim ? '220% 220%' : ''; if (anim) head.classList.add('anim'); else head.classList.remove('anim');
    }
    if (foot) {
      foot.style.background = anim ? ('linear-gradient(120deg,' + fBg + ' 0%,' + hTo + ' 50%,' + fBg + ' 100%)') : fBg;
      foot.style.backgroundSize = anim ? '220% 220%' : ''; if (anim) foot.classList.add('anim'); else foot.classList.remove('anim');
    }
    var ps = document.getElementById('g-prev-sub'); if (ps) { ps.style.color = fCol; ps.textContent = sub; }
    var cp = document.getElementById('g-prev-cp'); if (cp) cp.style.color = fCol;
  }
  function planGif(){ if (!chk('g-gif')) return; if (gifTimer) clearTimeout(gifTimer); gifTimer = setTimeout(rafraichirGif, 600); }
  function rafraichirGif(){
    if (gifTimer) { clearTimeout(gifTimer); gifTimer = null; }
    var img = document.getElementById('g-gifimg'); if (!img) return;
    var sub = val('g-sub') || (D && D.tagline) || '';
    appeler('config:gabarits:gifApercu', [{ h1: val('g-hfrom'), h2: val('g-hto'), tc: val('g-fcol'),
      brand: (D && D.marque) || 'SANDRIZA', sub: sub }]).then(function(r){
      if (r && r.ok && r.dataUrl) img.src = r.dataUrl;
      else { img.removeAttribute('src'); dire('Aperçu GIF indisponible : ' + expliquer(r), 'att'); }
    });
  }

  function saisieEditeur(){
    return { id: (EDIT || '__new__'), name: val('g-name'),
      headerBgFrom: val('g-hfrom'), headerBgTo: val('g-hto'), headerSubtitle: val('g-sub'),
      footerBg: val('g-fbg'), footerTextColor: val('g-fcol'), animated: chk('g-anim'), gifBanner: chk('g-gif') };
  }
  function adopter(r){ D = r; RO = !r.peutModifier; }

  function enregistrer(){
    if (RO || OCCUPE) return;
    if (!val('g-name').trim()) { dire('Le nom du gabarit est requis.', 'err'); return; }
    occuper(true); dire('Enregistrement…');
    appeler('config:gabarits:ecrire', [saisieEditeur()]).then(function(r){
      occuper(false);
      if (r && r.ok) { adopter(r); EDIT = null; dessiner(); dire('Gabarit enregistré.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }
  function copier(id){
    if (RO || OCCUPE) return;
    occuper(true); dire('Duplication…');
    appeler('config:gabarits:copier', [id]).then(function(r){
      occuper(false);
      if (r && r.ok) { adopter(r); EDIT = r.id || null; dessiner(); dire('Gabarit dupliqué.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }
  function supprimer(id){
    if (RO || OCCUPE) return;
    occuper(true); dire('Suppression…');
    appeler('config:gabarits:supprimer', [id]).then(function(r){
      occuper(false);
      if (r && r.ok) { adopter(r); dessiner(); dire('Gabarit supprimé — attributions au défaut.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }
  function enregistrerAttributions(){
    if (RO || OCCUPE) return;
    var map = {};
    var sels = corps.querySelectorAll('[data-assign]');
    for (var i = 0; i < sels.length; i++) map[sels[i].getAttribute('data-assign')] = sels[i].value;
    occuper(true); dire('Enregistrement des attributions…');
    appeler('config:gabarits:attributions', [map]).then(function(r){
      occuper(false);
      if (r && r.ok) { adopter(r); dessiner(); dire('Attributions enregistrées.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  bnouveau.onclick = function(){ if (RO) return; DELCONF = ''; EDIT = ''; dessiner(); dire(''); };

  function charger(){
    dire('Lecture…');
    appeler('config:gabarits:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + expliquer(r) + '</div>'; dire(expliquer(r), 'err'); return; }
      adopter(r); EDIT = (OUVERTURE && gabParId(OUVERTURE)) ? OUVERTURE : null; dessiner(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageGabarits };
