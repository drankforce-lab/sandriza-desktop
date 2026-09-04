'use strict';

/*
 * FENÊTRE « PAGE D'ACCUEIL » — NATIVE (Configuration, palier 5)
 * =============================================================================
 * L'ordre et la visibilité des blocs de la page d'accueil, et leur contenu — dont
 * le DIAPORAMA héro (diapos : image/dégradé, voile, chapeau, titre, sous-titre,
 * deux boutons ; plus effet, intervalle, lecture auto). Bannière et sections
 * simples aussi. Pas de secret ; les images sont des URL (aucun téléversement).
 *
 * La fenêtre tient TOUT le tableau des blocs en mémoire et l'enregistre en entier
 * (le cœur réécrit par id). La traduction EN se fait en arrière-plan côté cœur.
 *
 * ⚠ ANCRÉE = PLEINE PAGE : le corps remplit la largeur (pas de max-width).
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .droite{margin-left:auto;display:flex;gap:.4rem}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;padding:1rem 1.1rem;margin:0 0 1rem}
.carte.edit{border-color:#c9a97e}
.stitre{font-size:.9rem;font-weight:700;color:var(--tx-bleute);margin:0 0 .2rem}
.sdesc{font-size:.76rem;color:var(--tx2);margin:0 0 .8rem}
.bloc{display:flex;align-items:center;gap:.7rem;padding:.6rem .7rem;background:var(--f-champ);border:1px solid #2b3444;border-radius:9px;margin:0 0 .5rem}
.bloc .em{font-size:1.3rem;filter:grayscale(1) brightness(1.5)}
.bloc .nom{flex:1;min-width:0}
.bloc .nom b{font-size:.88rem}
.bloc .nom .d{font-size:.73rem;color:var(--tx2)}
.bloc .masq{font-size:.68rem;color:var(--tx-jaune);margin-left:.35rem}
.bloc.off{opacity:.5}
.bloc .actes{display:flex;gap:.3rem;flex-shrink:0}
.gr2{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.gr4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:.5rem}
@media(max-width:720px){.gr2,.gr4{grid-template-columns:1fr 1fr}}
.ch{margin:0 0 .6rem}.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.22rem;font-size:.74rem;color:var(--tx2)}
.ch input,.ch select,.ch textarea{width:100%;font:inherit;font-size:.83rem;color:var(--tx);background:var(--f-champ);border:1px solid #2b3444;border-radius:8px;padding:.4rem .5rem}
.ch textarea{resize:vertical;min-height:2.6rem}
.ch input:focus,.ch select:focus,.ch textarea:focus{outline:none;border-color:#c9a97e}
.ch input:disabled,.ch select:disabled,.ch textarea:disabled{opacity:.55}
.diapo{background:var(--f-champ);border:1px solid #2b3444;border-radius:10px;padding:.7rem .8rem;margin:0 0 .7rem}
.diapo .tete2{display:flex;align-items:center;gap:.5rem;margin:0 0 .5rem}
.diapo .apercu{width:3.4rem;height:2.1rem;border-radius:5px;flex-shrink:0;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.diapo .apercu .t{position:relative;color:var(--tx-blanc);font-size:.55rem;text-shadow:0 1px 2px rgba(0,0,0,.7);padding:0 .2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.diapo .tete2 .nm{flex:1;font-size:.82rem;font-weight:600}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button.b{font:inherit;color:var(--tx);background:var(--v05);border:1px solid var(--v16);border-radius:8px;padding:.34rem .6rem;cursor:pointer;font-size:.78rem}
button.b:hover:not(:disabled){background:var(--v11)}
button.b:disabled{opacity:.4;cursor:default}
button.b.dgr{color:var(--tx-err2);border-color:rgba(248,113,113,.4)}
button.prim{font:inherit;background:#c9a97e;border:1px solid #c9a97e;color:#1a1208;font-weight:700;border-radius:8px;padding:.42rem .9rem;cursor:pointer;font-size:.82rem}
button.prim:hover:not(:disabled){background:#d8bd97}
button.prim:disabled{opacity:.5;cursor:default}
.vide{padding:1rem;text-align:center;color:var(--tx2);font-size:.82rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.mini:hover:not(:disabled){background:var(--v11)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageAccueil(ouverture) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Page d’accueil — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.homepage}</span><h1>Page d’accueil</h1>
  <span class="droite"><button class="mini" id="b-reinit" hidden>Réinitialiser</button></span></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="corps"><div id="corps"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='.4rem'; document.querySelector('.tete .droite').appendChild(b); }
    if (actif) { b.textContent='⧉ Détacher'; b.title='Ouvrir cet écran dans sa propre fenêtre'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='⚓ Ancrer'; b.title='Ramener cet écran dans la fenêtre principale'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}${JS_BROUILLON}
  var corps = document.getElementById('corps');
  var breinit = document.getElementById('b-reinit');
  var D = null, RO = false, OCCUPE = false;
  var BLOCS = [], GRADS = [];
  // Ouverture directe sur l'éditeur d'un bloc (banc d'essai ; vide en prod).
  var OUVERTURE = ${JSON.stringify(String(ouverture || ''))};
  var EDIT = null;      // id du bloc en cours d'édition (ou null)
  var SLIDES = [];      // diapos héro en cours d'édition
  var CONF_REINIT = false;

  var EFFETS = [['fade','Fondu (Fade)'],['slide','Glissement (Slide)'],['zoom','Zoom (Ken Burns)']];

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function val(id){ var e=document.getElementById(id); return e ? String(e.value) : ''; }
  function chk(id){ var e=document.getElementById(id); return !!(e && e.checked); }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:'Votre rôle est en lecture seule.',
    indisponible:"L'administration n'est pas encore chargée dans la fenêtre principale.",
    pont_indisponible:'La fenêtre principale ne répond pas.',
    delai:"La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    echec:"L'opération a échoué.",
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('Erreur inattendue ('+esc(m||'?')+').'))+(r&&r.detail?' ('+esc(r.detail)+')':''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }
  function occuper(o){ OCCUPE = o; }
  function gradVal(i){ return (GRADS[i] && GRADS[i].value) || (GRADS[0] && GRADS[0].value) || ''; }
  function swatch(s){
    if (s.image) return 'background-image:url(\\'' + esc(s.image) + '\\')';
    return 'background:' + esc(s.gradient || gradVal(0));
  }

  // ── ENVOI (tableau entier) ──────────────────────────────────────────────────
  function adopter(r){ D=r; BLOCS = (r.blocs||[]).slice(); RO = !r.peutModifier; GRADS = r.gradients || GRADS; }
  function ecrire(apres){
    occuper(true); dire('Enregistrement…');
    appeler('config:accueil:ecrire', [BLOCS]).then(function(r){
      occuper(false);
      if (r && r.ok) { adopter(r); if (apres) apres(); dessiner(); dire('Page d’accueil enregistrée.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  // ── LISTE DES BLOCS ───────────────────────────────────────────────────────
  function listeHtml(){
    var h = '<div class="carte"><div class="stitre">Ordre et visibilité</div>'
      + '<div class="sdesc">↑ ↓ pour réorganiser · <span class="ic">👁</span> masque un bloc sans le supprimer · ✏️ modifie le contenu.</div>';
    BLOCS.forEach(function(b, i){
      h += '<div class="bloc' + (b.visible ? '' : ' off') + '">'
        + '<span class="em">' + esc(b.icon) + '</span>'
        + '<div class="nom"><b>' + esc(b.label) + '</b>' + (b.visible ? '' : '<span class="masq">(masqué)</span>')
        + '<div class="d">' + esc(b.desc) + '</div></div>'
        + '<div class="actes">'
        + '<button class="b" type="button" data-ed="' + esc(b.id) + '" title="Modifier"><span class="ic">✏</span>️</button>'
        + (RO ? '' : '<button class="b" type="button" data-vis="' + esc(b.id) + '" title="' + (b.visible ? 'Masquer' : 'Afficher') + '">' + (b.visible ? '<span class="ic">👁</span>' : '<span class="ic">🚫</span>') + '</button>'
          + '<button class="b" type="button" data-up="' + esc(b.id) + '"' + (i===0?' disabled':'') + '>↑</button>'
          + '<button class="b" type="button" data-down="' + esc(b.id) + '"' + (i===BLOCS.length-1?' disabled':'') + '>↓</button>')
        + '</div></div>';
    });
    return h + '</div>';
  }

  // ── ÉDITEUR ─────────────────────────────────────────────────────────────────
  function chTexte(id, label, v, ph){ return '<div class="ch"><label>' + esc(label) + '</label><input id="' + id + '" value="' + esc(v||'') + '" placeholder="' + esc(ph||'') + '"' + (RO?' disabled':'') + '></div>'; }
  function chAire(id, label, v, ph){ return '<div class="ch"><label>' + esc(label) + '</label><textarea id="' + id + '" rows="2" placeholder="' + esc(ph||'') + '"' + (RO?' disabled':'') + '>' + esc(v||'') + '</textarea></div>'; }

  function diapoHtml(s, i){
    var opts = GRADS.map(function(g, gi){ return '<option value="' + gi + '"' + ((s.gradient||gradVal(0))===g.value?' selected':'') + '>' + esc(g.label) + '</option>'; }).join('');
    return '<div class="diapo"><div class="tete2">'
      + '<div class="apercu" style="' + swatch(s) + '"><span style="position:absolute;inset:0;background:rgba(0,0,0,' + (s.overlay!=null?s.overlay:0) + ')"></span><span class="t">' + esc(s.title||('Diapo '+(i+1))) + '</span></div>'
      + '<span class="nm">Diapo ' + (i+1) + '</span>'
      + (RO ? '' : '<button class="b" type="button" data-sup="' + i + '"' + (i===0?' disabled':'') + '>↑</button>'
        + '<button class="b" type="button" data-sdn="' + i + '"' + (i===SLIDES.length-1?' disabled':'') + '>↓</button>'
        + '<button class="b dgr" type="button" data-sdel="' + i + '"><span class="ic">🗑</span></button>')
      + '</div>'
      + '<div class="gr2">'
      + '<div class="ch"><label>Image URL (vide = dégradé)</label><input data-sf="image" data-si="' + i + '" value="' + esc(s.image||'') + '" placeholder="https://…"' + (RO?' disabled':'') + '></div>'
      + '<div class="ch"><label>Dégradé de fond</label><select data-sf="grad" data-si="' + i + '"' + (RO?' disabled':'') + '>' + opts + '</select></div>'
      + '</div>'
      + '<div class="ch"><label>Opacité du voile noir (0 = aucun, 0.7 = sombre)</label><input type="number" min="0" max="1" step="0.05" data-sf="overlay" data-si="' + i + '" value="' + (s.overlay!=null?s.overlay:0.4) + '"' + (RO?' disabled':'') + '></div>'
      + '<div class="gr2">'
      + '<div class="ch"><label>Texte chapeau</label><input data-sf="eyebrow" data-si="' + i + '" value="' + esc(s.eyebrow||'') + '"' + (RO?' disabled':'') + '></div>'
      + '<div class="ch"><label>Titre principal</label><input data-sf="title" data-si="' + i + '" value="' + esc(s.title||'') + '"' + (RO?' disabled':'') + '></div>'
      + '</div>'
      + '<div class="ch"><label>Sous-titre</label><textarea data-sf="subtitle" data-si="' + i + '" rows="2"' + (RO?' disabled':'') + '>' + esc(s.subtitle||'') + '</textarea></div>'
      + '<div class="gr4">'
      + '<div class="ch"><label>Bouton 1 — Texte</label><input data-sf="cta1Text" data-si="' + i + '" value="' + esc(s.cta1Text||'') + '"' + (RO?' disabled':'') + '></div>'
      + '<div class="ch"><label>Bouton 1 — Lien</label><input data-sf="cta1Href" data-si="' + i + '" value="' + esc(s.cta1Href||'') + '"' + (RO?' disabled':'') + '></div>'
      + '<div class="ch"><label>Bouton 2 — Texte (opt.)</label><input data-sf="cta2Text" data-si="' + i + '" value="' + esc(s.cta2Text||'') + '"' + (RO?' disabled':'') + '></div>'
      + '<div class="ch"><label>Bouton 2 — Lien</label><input data-sf="cta2Href" data-si="' + i + '" value="' + esc(s.cta2Href||'') + '"' + (RO?' disabled':'') + '></div>'
      + '</div></div>';
  }
  function slidesListHtml(){ return SLIDES.map(diapoHtml).join('') || '<div class="vide">Aucune diapo.</div>'; }

  function editeurHtml(){
    var b = BLOCS.filter(function(x){ return x.id === EDIT; })[0]; if (!b) { EDIT=null; return listeHtml(); }
    var c = b.content || {};
    var h = '<div class="carte edit"><div class="stitre">Modifier : ' + esc(b.label) + '</div>';
    if (b.id === 'hero') {
      h += '<div class="gr2">'
        + '<div class="ch"><label>Effet de transition</label><select id="a-effect"' + (RO?' disabled':'') + '>'
        + EFFETS.map(function(e){ return '<option value="' + e[0] + '"' + ((c.sliderEffect||'fade')===e[0]?' selected':'') + '>' + esc(e[1]) + '</option>'; }).join('') + '</select></div>'
        + '<div class="ch"><label>Intervalle (secondes)</label><input type="number" min="2" max="30" id="a-interval" value="' + (c.sliderInterval||6) + '"' + (RO?' disabled':'') + '></div></div>'
        + '<label class="ch" style="display:flex;align-items:center;gap:.5rem;cursor:pointer"><input type="checkbox" id="a-autoplay"' + (c.sliderAutoplay!==false?' checked':'') + (RO?' disabled':'') + ' style="width:auto;accent-color:#c9a97e"> Lecture automatique</label>'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin:.4rem 0 .5rem"><b style="font-size:.82rem">Diapos <span id="a-scount">(' + SLIDES.length + ')</span></b>'
        + (RO ? '' : '<button class="b" type="button" id="a-sadd">+ Ajouter une diapo</button>') + '</div>'
        + '<div id="a-slides">' + slidesListHtml() + '</div>';
    } else if (b.id === 'banner') {
      h += chTexte('a-eyebrow','Texte chapeau', c.eyebrow) + chTexte('a-title','Titre', c.title)
        + chAire('a-subtitle','Sous-titre', c.subtitle)
        + '<div class="gr2">' + chTexte('a-ctat','Bouton — Texte', c.ctaText) + chTexte('a-ctah','Bouton — Lien', c.ctaHref||'#shop') + '</div>';
    } else {
      h += chTexte('a-eyebrow','Texte chapeau', c.eyebrow) + chTexte('a-title','Titre de section', c.title);
    }
    if (!RO) h += '<div style="display:flex;gap:.6rem;margin-top:.6rem"><button class="prim" id="a-save">Enregistrer</button><button class="b" id="a-cancel">Annuler</button></div>';
    else h += '<div style="margin-top:.6rem"><button class="b" id="a-cancel">← Retour</button></div>';
    return h + '</div>';
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    breinit.hidden = RO || EDIT !== null;
    corps.innerHTML = (EDIT === null) ? listeHtml() : editeurHtml();
    brancher();
  }

  function brancher(){
    if (EDIT === null) {
      corps.querySelectorAll('[data-ed]').forEach(function(el){ el.onclick = function(){ ouvrirEdit(el.getAttribute('data-ed')); }; });
      corps.querySelectorAll('[data-vis]').forEach(function(el){ el.onclick = function(){ basculer(el.getAttribute('data-vis')); }; });
      corps.querySelectorAll('[data-up]').forEach(function(el){ el.onclick = function(){ deplacer(el.getAttribute('data-up'), -1); }; });
      corps.querySelectorAll('[data-down]').forEach(function(el){ el.onclick = function(){ deplacer(el.getAttribute('data-down'), 1); }; });
      return;
    }
    var sadd = document.getElementById('a-sadd'); if (sadd) sadd.onclick = ajouterDiapo;
    corps.querySelectorAll('[data-sdel]').forEach(function(el){ el.onclick = function(){ lireDiapos(); SLIDES.splice(parseInt(el.getAttribute('data-sdel'),10),1); rafraichirDiapos(); }; });
    corps.querySelectorAll('[data-sup]').forEach(function(el){ el.onclick = function(){ bougerDiapo(parseInt(el.getAttribute('data-sup'),10), -1); }; });
    corps.querySelectorAll('[data-sdn]').forEach(function(el){ el.onclick = function(){ bougerDiapo(parseInt(el.getAttribute('data-sdn'),10), 1); }; });
    var sv = document.getElementById('a-save'); if (sv) sv.onclick = enregistrerBloc;
    /* ⚠ << Annuler >> N'EFFACE PAS LE BROUILLON : la personne quitte le bloc, elle
       ne declare pas jeter son travail. Il lui sera propose a la reouverture, et la
       boite de reprise a son bouton pour repartir a neuf. L'ecriture est IMMEDIATE,
       avec les valeurs prises MAINTENANT : deux appels plus loin, les champs
       n'existent plus. */
    var cn = document.getElementById('a-cancel'); if (cn) cn.onclick = function(){ szBrouillonMaintenant(); EDIT=null; SLIDES=[]; dessiner(); dire(''); };
  }

  // ── Actions liste ──
  function basculer(id){ var b=BLOCS.filter(function(x){return x.id===id;})[0]; if(!b)return; b.visible=!b.visible; ecrire(); }
  function deplacer(id, dir){
    var i = BLOCS.findIndex(function(x){ return x.id===id; }); var ni=i+dir;
    if (i<0 || ni<0 || ni>=BLOCS.length) return;
    var tmp=BLOCS[i]; BLOCS[i]=BLOCS[ni]; BLOCS[ni]=tmp;
    BLOCS.forEach(function(b,k){ b.order = k; });   // renumérote l'ordre
    ecrire();
  }

  // ── Éditeur héro ──
  function ouvrirEdit(id){
    var b = BLOCS.filter(function(x){ return x.id===id; })[0]; if(!b) return;
    EDIT = id;
    if (id === 'hero') {
      var c = b.content || {};
      SLIDES = (c.slides && c.slides.length) ? JSON.parse(JSON.stringify(c.slides))
        : [{ id:'s1', image:'', gradient:gradVal(0), overlay:0.15, eyebrow:'', title:'Nouvelle diapo', subtitle:'', cta1Text:'Découvrir', cta1Href:'#shop', cta2Text:'', cta2Href:'' }];
    }
    dessiner(); dire('');
    /* Apres le dessin : la boite de reprise remplit des champs et la liste des
       diapos, qui n'existent qu'une fois l'editeur pose. */
    szBrouillonProposer();
  }
  function lireDiapos(){
    if (EDIT !== 'hero') return;
    corps.querySelectorAll('[data-sf]').forEach(function(el){
      var i = parseInt(el.getAttribute('data-si'),10), f = el.getAttribute('data-sf');
      if (!SLIDES[i]) return;
      if (f === 'grad') SLIDES[i].gradient = gradVal(parseInt(el.value,10)||0);
      else if (f === 'overlay') { var n = parseFloat(el.value); SLIDES[i].overlay = isFinite(n) ? n : 0.4; }
      else SLIDES[i][f] = el.value;
    });
  }
  function rafraichirDiapos(){
    var el = document.getElementById('a-slides'); if (el) el.innerHTML = slidesListHtml();
    var cn = document.getElementById('a-scount'); if (cn) cn.textContent = '(' + SLIDES.length + ')';
    brancher();
  }
  function ajouterDiapo(){ lireDiapos(); SLIDES.push({ id:'s'+SLIDES.length+'_'+SLIDES.length, image:'', gradient:gradVal(SLIDES.length % Math.max(1,GRADS.length)), overlay:0.15, eyebrow:'', title:'Nouvelle diapo', subtitle:'', cta1Text:'Découvrir', cta1Href:'#shop', cta2Text:'', cta2Href:'' }); rafraichirDiapos(); }
  function bougerDiapo(i, dir){ lireDiapos(); var ni=i+dir; if(ni<0||ni>=SLIDES.length)return; var t=SLIDES[i]; SLIDES[i]=SLIDES[ni]; SLIDES[ni]=t; rafraichirDiapos(); }

  /* == LE BROUILLON DES BLOCS DE LA PAGE D'ACCUEIL ==========================
     Sa consigne, le 2026-08-20 : << garde le texte sans les images >>.
     ⚠⚠ ET IL N'Y A RIEN A RETIRER ICI, VERIFIE PLUTOT QUE SUPPOSE. Je lui avais
     annonce des images a exclure ; c'est faux. Cette fenetre n'a AUCUN depot de
     fichier (ni FileReader, ni readAsDataURL, ni champ de type file) : le champ
     << Image URL >> d'une diapo est une ADRESSE tapee ou collee. Une adresse pese
     quelques dizaines d'octets et c'est du texte — la garder, c'est exactement
     appliquer sa consigne, pas la contourner.
     La regle telle qu'elle vaut vraiment, et elle vaut ailleurs : ON GARDE LE
     TRAVAIL, PAS LE FICHIER. Ce qui est exclu ailleurs l'est parce que c'est un
     FICHIER encode en base64 — la couverture d'une collection (redeposable en un
     clic) et les images inserees dans une page du site (d'ou le plafond par
     brouillon). Rien de tel dans cette fenetre-ci.

     ⚠ LES DIAPOS NE VIVENT PAS DANS LE DOM : SLIDES est une copie de travail, et
     l'ecran n'en montre pas forcement toutes. On appelle donc lireDiapos() avant
     de garder — sinon la derniere diapo modifiee serait absente du brouillon alors
     qu'elle est sous les yeux — puis on garde la VARIABLE.
     ⚠ UNE CLE PAR BLOC : le hero, la banniere et les titres de section n'ont pas
     les memes champs. Sans elle, une saisie laissee sur l'un serait proposee sur
     l'autre, avec des champs qui ne correspondent a rien. */
  var BR_HERO = ['a-effect', 'a-interval'];
  var BR_BANNIERE = ['a-eyebrow', 'a-title', 'a-subtitle', 'a-ctat', 'a-ctah'];
  var BR_SECTION = ['a-eyebrow', 'a-title'];
  function brChamps(){
    if (EDIT === 'hero') return BR_HERO;
    if (EDIT === 'banner') return BR_BANNIERE;
    return BR_SECTION;
  }
  szBrouillonBrancher({
    portee: 'accueil-bloc',
    libelle: 'Une modification de ce bloc',
    ttlMin: 720,
    cle: function(){ return EDIT ? ('b:' + EDIT) : ''; },
    actif: function(){ return !!EDIT && !RO && !!document.getElementById('a-save'); },
    valeurs: function(){
      if (!EDIT) return null;
      var v = szBrouillonDuDom(brChamps(), EDIT === 'hero' ? ['a-autoplay'] : []);
      if (!v) return null;
      v._bloc = EDIT;
      if (EDIT === 'hero') {
        if (typeof lireDiapos === 'function') lireDiapos();
        v._slides = SLIDES || [];
      }
      return v;
    },
    /* On modifie un bloc EXISTANT : ne proposer que ce qui DIFFERE de ce qui est
       enregistre. Proposer de << reprendre >> un formulaire identique a la base
       n'apprendrait rien et ferait douter. */
    rempli: function(){
      if (!EDIT) return false;
      var b = BLOCS.filter(function(x){ return x.id === EDIT; })[0];
      if (!b) return false;
      var c = b.content || {};
      var v = szBrouillonDuDom(brChamps(), EDIT === 'hero' ? ['a-autoplay'] : []);
      if (!v) return false;
      if (EDIT === 'hero') {
        if (String(v['a-effect'] || '') !== String(c.sliderEffect || 'fade')) return true;
        if (String(v['a-interval'] || '') !== String(c.sliderInterval || 6)) return true;
        if (!!(v._c && v._c['a-autoplay']) !== (c.sliderAutoplay !== false)) return true;
        if (typeof lireDiapos === 'function') lireDiapos();
        try {
          return JSON.stringify(SLIDES || []) !== JSON.stringify(c.slides || []);
        } catch (e) { return true; }
      }
      if (String(v['a-eyebrow'] || '') !== String(c.eyebrow || '')) return true;
      if (String(v['a-title'] || '') !== String(c.title || '')) return true;
      if (EDIT === 'banner') {
        if (String(v['a-subtitle'] || '') !== String(c.subtitle || '')) return true;
        if (String(v['a-ctat'] || '') !== String(c.ctaText || '')) return true;
        if (String(v['a-ctah'] || '') !== String(c.ctaHref || '#shop')) return true;
      }
      return false;
    },
    remplir: function(v){
      /* Un brouillon d'un AUTRE bloc ne se repose pas : ses champs n'ont rien a
         voir. La cle l'evite deja ; ceci est la ceinture. */
      if (v._bloc && v._bloc !== EDIT) return;
      szBrouillonAuDom(v);
      if (EDIT === 'hero' && v._slides) {
        SLIDES = v._slides;
        /* Les diapos sont DESSINEES depuis SLIDES : les reposer sans redessiner
           donnerait un ecran qui ne montre pas ce qui sera enregistre. */
        if (typeof rafraichirDiapos === 'function') rafraichirDiapos();
      }
    },
  });
  szBrouillonEcouter();

  function enregistrerBloc(){
    if (RO) return;
    var b = BLOCS.filter(function(x){ return x.id===EDIT; })[0]; if(!b) return;
    if (EDIT === 'hero') {
      lireDiapos();
      b.content = { sliderEffect: val('a-effect')||'fade', sliderInterval: parseInt(val('a-interval'),10)||6,
        sliderAutoplay: chk('a-autoplay'), slides: SLIDES };
    } else if (EDIT === 'banner') {
      b.content = Object.assign({}, b.content||{}, { eyebrow:val('a-eyebrow'), title:val('a-title'), subtitle:val('a-subtitle'), ctaText:val('a-ctat'), ctaHref:val('a-ctah') });
    } else {
      b.content = Object.assign({}, b.content||{}, { eyebrow:val('a-eyebrow'), title:val('a-title') });
    }
    /* ⚠ LE BROUILLON MEURT DANS LA SUITE D'ecrire(), donc SEULEMENT si l'ecriture
       a abouti : le jeter avant perdrait la saisie en cas d'echec. */
    ecrire(function(){ szBrouillonJeter(); EDIT=null; SLIDES=[]; });
  }

  breinit.onclick = function(){
    if (RO || OCCUPE) return;
    if (!CONF_REINIT) { CONF_REINIT = true; breinit.textContent='Confirmer ?'; setTimeout(function(){ CONF_REINIT=false; breinit.textContent='Réinitialiser'; }, 5000); return; }
    CONF_REINIT = false; breinit.textContent='Réinitialiser';
    occuper(true); dire('Réinitialisation…');
    appeler('config:accueil:reinit').then(function(r){ occuper(false);
      if (r && r.ok) { adopter(r); EDIT=null; dessiner(); dire('Blocs réinitialisés.', 'bon'); }
      else dire(expliquer(r), 'err'); });
  };

  function charger(){
    dire('Lecture…');
    appeler('config:accueil:donnees').then(function(r){
      if (!r || !r.ok) { corps.innerHTML = '<div class="vide">' + expliquer(r) + '</div>'; dire(expliquer(r), 'err'); return; }
      adopter(r);
      if (OUVERTURE && BLOCS.some(function(b){ return b.id === OUVERTURE; })) { ouvrirEdit(OUVERTURE); }
      else { EDIT=null; dessiner(); dire(''); }
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageAccueil };
