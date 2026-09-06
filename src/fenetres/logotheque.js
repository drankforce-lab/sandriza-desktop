'use strict';

/*
 * FENÊTRE « LOGOTHÈQUE » — NATIVE (Configuration, palier 5)
 * =============================================================================
 * Des images (logos, visuels) stockées dans Cloudflare R2, réutilisables partout
 * (éditeur d'objets promotionnels notamment). La fenêtre fait TOUT le recadrage
 * elle-même (canvas local : rogner au centre, ajuster avec marges transparentes,
 * plafond de résolution, calcul du DPI d'impression) et n'envoie au cœur que le
 * PNG final + les métadonnées ; le cœur téléverse dans R2 et tient la liste.
 * Aucun secret : ce sont des images.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .droite{margin-left:auto}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
/* ⚠ ANCRÉE = PLEINE PAGE : pas de cap de largeur ; la grille des logos remplit. */
.zone{width:100%}
.barre{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin:0 0 1rem}
.grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(11rem,1fr));gap:.9rem}
.lcard{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;overflow:hidden;display:flex;flex-direction:column}
.lcard .th{height:110px;background:var(--f-champ) url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22><rect width=%228%22 height=%228%22 fill=%22%23172233%22/><rect x=%228%22 y=%228%22 width=%228%22 height=%228%22 fill=%22%23172233%22/></svg>');display:flex;align-items:center;justify-content:center}
.lcard .th img{max-width:100%;max-height:100%;object-fit:contain;display:block}
.lcard .bd{padding:.5rem .6rem;display:flex;flex-direction:column;gap:.25rem}
.lcard .nm{font-size:.82rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lcard .mt{font-size:.7rem;color:var(--tx2);display:flex;flex-wrap:wrap;gap:.35rem}
.lcard .pr{font-size:.7rem;border:1px solid;border-radius:6px;padding:0 .35rem;align-self:flex-start}
.lcard .acts{display:flex;gap:.3rem;margin-top:.2rem}
.lcard .nmedit{width:100%;font:inherit;font-size:.8rem;color:var(--tx);background:var(--f-champ);border:1px solid var(--v12);border-radius:6px;padding:.25rem .4rem}
.vide{padding:2rem 1rem;text-align:center;color:var(--tx2);font-size:.85rem}
/* Import / recadrage */
.imp{display:grid;grid-template-columns:minmax(16rem,22rem) 1fr;gap:1.2rem;max-width:60rem}
@media (max-width:680px){.imp{grid-template-columns:1fr}}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;padding:1rem 1.1rem}
.h{font-size:.74rem;font-weight:700;color:var(--tx-bleute);text-transform:uppercase;letter-spacing:.04em;margin:.2rem 0 .5rem}
.det .row{display:flex;justify-content:space-between;gap:.6rem;font-size:.8rem;padding:.15rem 0}
.det .row span{color:var(--tx2)}
.prevbox{background:var(--f-champ) url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22><rect width=%228%22 height=%228%22 fill=%22%23172233%22/><rect x=%228%22 y=%228%22 width=%228%22 height=%228%22 fill=%22%23172233%22/></svg>');border:1px solid var(--v12);border-radius:9px;min-height:150px;display:flex;align-items:center;justify-content:center;padding:.5rem}
.prevbox canvas{max-width:100%;display:block}
.ch{margin:0 0 .7rem}.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.22rem;font-size:.75rem;color:var(--tx2)}
.ch input{width:100%;font:inherit;font-size:.83rem;color:var(--tx);background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;padding:.4rem .5rem}
.ch input:focus{outline:none;border-color:#c9a97e}
.modes,.rrow{display:flex;gap:.4rem;flex-wrap:wrap;margin:0 0 .6rem}
.modes button,.rrow button{font:inherit;font-size:.78rem;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.32rem .6rem;cursor:pointer}
.modes button.on,.rrow button.on{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
.hint{font-size:.72rem;color:var(--tx3);line-height:1.5;margin:.2rem 0 .6rem}
.deux{display:flex;gap:.6rem;flex-wrap:wrap}
.deux .ch{flex:1;min-width:8rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button.b{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.32rem .7rem;cursor:pointer;font-size:.78rem}
button.b:hover:not(:disabled){background:var(--v10)}
button.b:disabled{opacity:.5;cursor:default}
button.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.4)}
button.prim{font:inherit;background:#c9a97e;border:1px solid #c9a97e;color:#1a1208;font-weight:700;border-radius:8px;padding:.42rem .9rem;cursor:pointer;font-size:.82rem}
button.prim:hover:not(:disabled){background:#d8bd97}
button.prim:disabled{opacity:.5;cursor:default}
label.upl{display:inline-flex;align-items:center;gap:.4rem;cursor:pointer}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.mini:hover:not(:disabled){background:var(--v10)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageLogotheque() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Logothèque — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.image}</span><h1>Logothèque</h1><span class="droite"></span></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="corps"><div class="zone" id="corps"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div></div>
<input type="file" id="fichier" accept="image/*" style="display:none">
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; t.appendChild(b); }
    if (actif) { b.textContent='⧉ Détacher'; b.title='Ouvrir cet écran dans sa propre fenêtre'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='⚓ Ancrer'; b.title='Ramener cet écran dans la fenêtre principale'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var fichier = document.getElementById('fichier');
  var D = null, RO = false, OCCUPE = false;
  var VUE = 'liste';       // 'liste' | 'import'
  var IMP = null;          // etat du recadrage en cours
  var DELCONF = '';        // id en attente de confirmation de suppression
  var MAXPX = 1400;
  var RATIOS = [['1:1',1,1],['4:3',4,3],['3:2',3,2],['2:1',2,1],['16:9',16,9],['3:4',3,4],['libre',0,0]];

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function fr(v){ return (Math.round(v*100)/100).toString().replace('.', ','); }
  function num(v, d){ var n = parseFloat(v); return isFinite(n) ? n : d; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:'Votre rôle est en lecture seule.',
    indisponible:"L'administration n'est pas encore chargée dans la fenêtre principale.",
    pont_indisponible:'La fenêtre principale ne répond pas.',
    delai:"La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    image_invalide:'Le fichier choisi n’est pas une image.',
    nom_requis:'Le nom est requis.',
    introuvable:'Cette image n’existe plus.',
    nuage:'Le téléversement a échoué. Réessayez.',
    echec:"L'opération a échoué.",
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('Erreur inattendue ('+esc(m||'?')+').'))+(r&&r.detail?' ('+esc(r.detail)+')':''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }
  function occuper(o){ OCCUPE = o; }

  function ratioLbl(w, h){
    if (!w || !h) return '—';
    var g = function(a,b){ return b ? g(b, a%b) : a; };
    var d = g(w,h), rw = w/d, rh = h/d;
    if (rw <= 32 && rh <= 32) return rw + ':' + rh;
    return fr(w/h) + ':1';
  }
  /* ⚠ DEUX CHAMPS, ET C EST VOULU. << c >> est l ENCRE : elle passe par un jeton,
     donc elle suit le mode jour comme le reste — un vert de nuit sur une carte
     blanche donnait 1.74 de contraste, illisible. << b >> est la BORDURE, qui se
     construisait par q.c + 55 : un jeton ne se concatene pas a une paire
     hexadecimale, et la bordure serait devenue invalide, donc invisible. Un
     trait a 33 % d opacite n a pas besoin de reprise ; le texte, si. */
  function quality(dpi){
    return dpi>=300 ? {lbl:'Excellent pour l’impression',c:'var(--tx-ok)',b:'#4ade8055'}
         : dpi>=200 ? {lbl:'Correct pour l’impression',c:'var(--tx-jaune)',b:'#facc1555'}
                    : {lbl:'Insuffisant pour l’impression',c:'var(--tx-err)',b:'#f8717155'};
  }

  // ── LISTE ───────────────────────────────────────────────────────────────────
  function carteHtml(l){
    var q = l.dpi ? quality(l.dpi) : null;
    var meta = '<span>' + (l.w && l.h ? l.w + ' × ' + l.h + ' px' : 'dimensions ?') + '</span>'
      + (l.w && l.h ? '<span>' + ratioLbl(l.w, l.h) + '</span>' : '')
      + (l.alpha ? '<span>transparent</span>' : '');
    var editing = (DELCONF === '') ? false : false; // (rename gere par data-ren)
    return '<div class="lcard" data-card="' + esc(l.id) + '">'
      + '<div class="th"><img src="' + esc(l.url) + '" alt="' + esc(l.name) + '" loading="lazy"></div>'
      + '<div class="bd">'
      + '<div class="nm" data-nm="' + esc(l.id) + '" title="' + esc(l.name) + '">' + esc(l.name || 'Sans nom') + '</div>'
      + '<div class="mt">' + meta + '</div>'
      + (l.printW ? '<div class="pr" style="border-color:' + q.b + ';color:' + q.c + '">' + fr(l.printW) + ' × ' + fr(l.printH) + ' po · ' + l.dpi + ' dpi</div>' : '')
      + (RO ? '' : '<div class="acts">'
        + '<button class="b" type="button" data-ren="' + esc(l.id) + '" title="Renommer"><span class="ic">✎</span></button>'
        + '<button class="b" type="button" data-cp="' + esc(l.id) + '" title="Copier l’adresse"><span class="ic">🔗</span></button>'
        + '<button class="b dgr" type="button" data-del="' + esc(l.id) + '" title="Retirer">' + (DELCONF === l.id ? '✓?' : '<span class="ic">🗑</span>') + '</button>'
        + '</div>')
      + '</div></div>';
  }
  function listeHtml(){
    var logos = (D && D.logos) || [];
    var h = '<div class="barre">'
      + (RO ? '' : '<label class="prim upl"><span class="ic">⭱</span> Téléverser une image<input type="file" accept="image/*" id="upl-input" style="display:none"></label>')
      + '<span style="font-size:.78rem;color:var(--tx2)">Les dimensions vous seront présentées avant l’envoi. Stockage Cloudflare R2, réutilisable partout.</span></div>';
    h += logos.length ? ('<div class="grille">' + logos.map(carteHtml).join('') + '</div>')
      : '<div class="vide">Aucune image dans la logothèque.' + (RO ? '' : ' Téléversez-en une ci-dessus.') + '</div>';
    return h;
  }

  // ── IMPORT / RECADRAGE ──────────────────────────────────────────────────────
  function plan(){
    var st = IMP;
    var ar = (st.ratio[0] && st.ratio[1]) ? (st.ratio[0]/st.ratio[1]) : (st.natW/st.natH);
    var srcAr = st.natW/st.natH;
    var cw, ch, sx=0, sy=0, sw=st.natW, sh=st.natH, dx=0, dy=0, dw, dh;
    if (st.mode === 'crop' && st.ratio[0]) {
      if (srcAr > ar) { sh = st.natH; sw = sh*ar; } else { sw = st.natW; sh = sw/ar; }
      sx = (st.natW - sw)/2; sy = (st.natH - sh)/2; cw = sw; ch = sh; dw = cw; dh = ch;
    } else if (st.mode === 'fit' && st.ratio[0]) {
      if (srcAr > ar) { cw = st.natW; ch = cw/ar; } else { ch = st.natH; cw = ch*ar; }
      dw = st.natW; dh = st.natH; dx = (cw-dw)/2; dy = (ch-dh)/2;
    } else { cw = st.natW; ch = st.natH; dw = cw; dh = ch; }
    var cap = st.maxW > 0 ? Math.min(st.maxW, MAXPX) : MAXPX;
    var k = 1; if (cw > cap) k = cap/cw;
    return { cw: Math.max(1,Math.round(cw*k)), ch: Math.max(1,Math.round(ch*k)),
      sx:sx, sy:sy, sw:sw, sh:sh, dx:dx*k, dy:dy*k, dw:dw*k, dh:dh*k,
      cropped: st.mode==='crop' && st.ratio[0] && Math.abs(srcAr-ar) > 0.001,
      padded: st.mode==='fit' && st.ratio[0] && Math.abs(srcAr-ar) > 0.001 };
  }
  function dessinerCanvas(){
    var st = IMP; if (!st) return;
    var p = plan();
    var cv = document.getElementById('lg-canvas');
    if (cv) {
      var box = 240, k = Math.min(box/p.cw, box/p.ch, 1);
      cv.width = p.cw; cv.height = p.ch;
      cv.style.width = Math.max(24, Math.round(p.cw*k)) + 'px';
      cv.style.height = Math.max(24, Math.round(p.ch*k)) + 'px';
      var x = cv.getContext('2d'); x.clearRect(0,0,p.cw,p.ch);
      x.drawImage(st.img, p.sx, p.sy, p.sw, p.sh, p.dx, p.dy, p.dw, p.dh);
    }
    var out = document.getElementById('lg-out');
    if (out) {
      var printW = num((document.getElementById('lg-printw')||{}).value, 0);
      var dpi = printW > 0 ? Math.round(p.cw/printW) : 0;
      var q = dpi ? quality(dpi) : null;
      out.innerHTML = '<div class="row"><span>Image produite</span><strong>' + p.cw + ' × ' + p.ch + ' px</strong></div>'
        + '<div class="row"><span>Rapport</span><strong>' + ratioLbl(p.cw, p.ch) + '</strong></div>'
        + (p.cropped ? '<div class="row"><span>Recadrage</span><strong>centré, ' + Math.round((1-(p.sw*p.sh)/(st.natW*st.natH))*100) + ' % retiré</strong></div>' : '')
        + (p.padded ? '<div class="row"><span>Ajustement</span><strong>marges transparentes</strong></div>' : '')
        + (printW > 0
            ? '<div class="row"><span>Taille prévue</span><strong>' + fr(printW) + ' × ' + fr(printW/(p.cw/p.ch)) + ' po</strong></div>'
              + '<div class="row"><span>Résolution</span><strong style="color:' + q.c + '">' + dpi + ' dpi — ' + q.lbl + '</strong></div>'
            : '<div class="row"><span>Taille d’impression</span><strong>non précisée</strong></div>');
    }
  }
  function importHtml(){
    var st = IMP;
    var modeBtn = function(k, lbl){ return '<button type="button" data-mode="' + k + '" class="' + (st.mode===k?'on':'') + '">' + esc(lbl) + '</button>'; };
    var ratioBtn = function(r){ return '<button type="button" data-ratio="' + r[1] + ',' + r[2] + '" class="' + ((st.ratio[0]===r[1]&&st.ratio[1]===r[2])?'on':'') + '">' + esc(r[0]) + '</button>'; };
    return '<div class="imp">'
      + '<div class="carte">'
      +   '<div class="h">Détecté dans le fichier</div><div class="det">'
      +     '<div class="row"><span>Dimensions</span><strong>' + st.natW + ' × ' + st.natH + ' px</strong></div>'
      +     '<div class="row"><span>Rapport</span><strong>' + ratioLbl(st.natW, st.natH) + ' · ' + (Math.abs(st.natW-st.natH)<2?'carré':st.natW>st.natH?'paysage':'portrait') + '</strong></div>'
      +     '<div class="row"><span>Transparence</span><strong>' + (st.alpha?'oui':'non') + '</strong></div>'
      +     '<div class="row"><span>Fichier</span><strong>' + esc(st.mime.replace('image/','').toUpperCase()) + ' · ' + Math.max(1,Math.round(st.bytes/1024)) + ' Ko</strong></div>'
      +   '</div>'
      +   '<div class="h" style="margin-top:1rem">Aperçu du résultat</div>'
      +   '<div class="prevbox"><canvas id="lg-canvas"></canvas></div>'
      +   '<div class="det" id="lg-out" style="margin-top:.6rem"></div>'
      + '</div>'
      + '<div class="carte">'
      +   '<div class="ch"><label>Nom</label><input id="lg-name" value="' + esc(st.name) + '" placeholder="Nom du logo ou de l’image"></div>'
      +   '<div class="h">Format</div><div class="modes">' + modeBtn('keep','Conserver') + modeBtn('crop','Rogner') + modeBtn('fit','Ajuster (marges)') + '</div>'
      +   '<div id="lg-ratios" style="' + (st.mode==='keep'?'display:none':'') + '"><div class="h">Rapport visé</div><div class="rrow">' + RATIOS.map(ratioBtn).join('') + '</div>'
      +     '<p class="hint">« Rogner » coupe au centre pour atteindre le rapport (rien n’est déformé). « Ajuster » n’enlève rien et complète avec des marges transparentes.</p></div>'
      +   '<div class="h">Taille d’impression prévue</div><div class="deux">'
      +     '<div class="ch"><label>Largeur (po)</label><input id="lg-printw" type="number" step="0.05" min="0" value="" placeholder="ex. 2"></div>'
      +     '<div class="ch"><label>Largeur max (px)</label><input id="lg-maxw" type="number" step="50" min="0" max="' + MAXPX + '" value="" placeholder="' + MAXPX + '"></div>'
      +   '</div>'
      +   '<p class="hint">La largeur en pouces sert à calculer la résolution (dpi) — affichée sur la vignette. Au-delà de ' + MAXPX + ' px, l’image est réduite au téléversement.</p>'
      +   '<div style="display:flex;gap:.6rem;margin-top:.3rem"><button class="prim" id="lg-ok">Confirmer et téléverser</button><button class="b" id="lg-cancel">Annuler</button></div>'
      + '</div></div>';
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    corps.innerHTML = (VUE === 'import' && IMP) ? importHtml() : listeHtml();
    brancher();
    if (VUE === 'import' && IMP) dessinerCanvas();
  }

  function brancher(){
    if (VUE === 'import' && IMP) {
      var modes = corps.querySelectorAll('[data-mode]');
      for (var i=0;i<modes.length;i++) modes[i].onclick = function(){ IMP.mode = this.getAttribute('data-mode'); if (IMP.mode!=='keep' && !IMP.ratio[0]) IMP.ratio=[1,1]; dessiner(); };
      var rs = corps.querySelectorAll('[data-ratio]');
      for (var j=0;j<rs.length;j++) rs[j].onclick = function(){ var v=this.getAttribute('data-ratio').split(','); IMP.ratio=[parseInt(v[0],10),parseInt(v[1],10)]; dessiner(); };
      var pw = document.getElementById('lg-printw'); if (pw) pw.oninput = dessinerCanvas;
      var mw = document.getElementById('lg-maxw'); if (mw) mw.oninput = function(){ IMP.maxW = num(this.value,0); dessinerCanvas(); };
      var ok = document.getElementById('lg-ok'); if (ok) ok.onclick = confirmer;
      var cn = document.getElementById('lg-cancel'); if (cn) cn.onclick = function(){ IMP=null; VUE='liste'; dessiner(); dire(''); };
      return;
    }
    var upl = document.getElementById('upl-input'); if (upl) upl.onchange = function(){ var f=upl.files&&upl.files[0]; upl.value=''; if (f) ouvrirImport(f); };
    var rens = corps.querySelectorAll('[data-ren]'); for (var a=0;a<rens.length;a++) rens[a].onclick = function(){ renommer(this.getAttribute('data-ren')); };
    var cps = corps.querySelectorAll('[data-cp]'); for (var b=0;b<cps.length;b++) cps[b].onclick = function(){ copier(this.getAttribute('data-cp')); };
    var dls = corps.querySelectorAll('[data-del]'); for (var c=0;c<dls.length;c++) dls[c].onclick = function(){ var id=this.getAttribute('data-del'); if (DELCONF===id){ DELCONF=''; retirer(id); } else { DELCONF=id; dessiner(); } };
  }

  function ouvrirImport(f){
    if (RO) return;
    if (String(f.type||'').indexOf('image/') !== 0) { dire('Le fichier choisi n’est pas une image.', 'err'); return; }
    dire('Lecture de l’image…');
    var fr2 = new FileReader();
    fr2.onerror = function(){ dire('Lecture du fichier impossible.', 'err'); };
    fr2.onload = function(){
      var dataUrl = String(fr2.result||'');
      var im = new Image();
      im.onerror = function(){ dire('Ce fichier n’est pas une image lisible.', 'err'); };
      im.onload = function(){
        IMP = { dataUrl: dataUrl, img: im, name: (f.name||'image').replace(/\.[a-z0-9]+$/i, ''),
          natW: im.naturalWidth||im.width, natH: im.naturalHeight||im.height, bytes: f.size||0, mime: f.type||'image/*',
          alpha: detecterAlpha(im), mode: 'keep', ratio: [0,0], maxW: 0 };
        VUE = 'import'; dessiner(); dire('');
      };
      im.src = dataUrl;
    };
    fr2.readAsDataURL(f);
  }
  function detecterAlpha(im){
    try {
      var c = document.createElement('canvas');
      var s = Math.min(120, Math.max(im.width, im.height));
      c.width = Math.max(1, Math.round(im.width/Math.max(im.width,im.height)*s));
      c.height = Math.max(1, Math.round(im.height/Math.max(im.width,im.height)*s));
      var x = c.getContext('2d'); x.drawImage(im, 0, 0, c.width, c.height);
      var px = x.getImageData(0, 0, c.width, c.height).data;
      for (var i=3;i<px.length;i+=4) if (px[i] < 250) return true;
      return false;
    } catch(e){ return false; }
  }

  function confirmer(){
    if (!IMP || OCCUPE) return;
    var name = ((document.getElementById('lg-name')||{}).value||'').trim() || IMP.name;
    var printW = num((document.getElementById('lg-printw')||{}).value, 0);
    var p = plan();
    var cv = document.createElement('canvas'); cv.width = p.cw; cv.height = p.ch;
    var x = cv.getContext('2d'); x.drawImage(IMP.img, p.sx, p.sy, p.sw, p.sh, p.dx, p.dy, p.dw, p.dh);
    var dataUrl = cv.toDataURL('image/png');
    var meta = { name: name, w: p.cw, h: p.ch, alpha: IMP.alpha,
      printW: printW>0?printW:0, printH: printW>0?(printW/(p.cw/p.ch)):0,
      dpi: printW>0?Math.round(p.cw/printW):0, mode: IMP.mode, srcW: IMP.natW, srcH: IMP.natH };
    occuper(true); dire('Téléversement…');
    appeler('config:logotheque:ajouter', [{ dataUrl: dataUrl, meta: meta }]).then(function(r){
      occuper(false);
      if (r && r.ok) { D = r; RO = !r.peutModifier; IMP=null; VUE='liste'; dessiner(); dire('Image ajoutée (' + meta.w + ' × ' + meta.h + ' px).', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  function renommer(id){
    var l = (D.logos||[]).find(function(x){ return x.id===id; }); if (!l) return;
    var nm = corps.querySelector('[data-nm="' + id.replace(/"/g,'') + '"]');
    if (!nm) return;
    var cur = l.name || '';
    nm.innerHTML = '<input class="nmedit" id="ren-inp" value="' + esc(cur) + '">';
    var inp = document.getElementById('ren-inp'); if (!inp) return;
    inp.focus(); try { inp.select(); } catch(e){}
    var fini = false;
    var valider = function(){ if (fini) return; fini = true; var v=(inp.value||'').trim(); if (!v || v===cur) { dessiner(); return; }
      occuper(true); dire('Renommage…');
      appeler('config:logotheque:renommer', [{ id: id, name: v }]).then(function(r){ occuper(false);
        if (r && r.ok) { D=r; RO=!r.peutModifier; dessiner(); dire('Renommé.', 'bon'); } else { dessiner(); dire(expliquer(r), 'err'); } }); };
    inp.onblur = valider;
    inp.onkeydown = function(e){ if (e.key==='Enter'){ e.preventDefault(); valider(); } else if (e.key==='Escape'){ fini=true; dessiner(); } };
  }
  function retirer(id){
    if (OCCUPE) return;
    occuper(true); dire('Retrait…');
    appeler('config:logotheque:retirer', [id]).then(function(r){ occuper(false);
      if (r && r.ok) { D=r; RO=!r.peutModifier; dessiner(); dire('Image retirée.', 'bon'); } else dire(expliquer(r), 'err'); });
  }
  function copier(id){
    var l = (D.logos||[]).find(function(x){ return x.id===id; }); if (!l) return;
    var ok = false;
    try { var ta = document.createElement('textarea'); ta.value = l.url; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta); } catch(e){ ok = false; }
    dire(ok ? 'Adresse copiée.' : l.url, ok ? 'bon' : 'att');
  }

  fichier.onchange = function(){ var f=fichier.files&&fichier.files[0]; fichier.value=''; if (f) ouvrirImport(f); };

  function charger(){
    dire('Lecture…');
    appeler('config:logotheque:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div>'; dire(expliquer(r), 'err'); return; }
      D = r; RO = !r.peutModifier; VUE='liste'; dessiner(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageLogotheque };
