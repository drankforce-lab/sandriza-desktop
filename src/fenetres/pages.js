'use strict';

/*
 * FENÊTRE « PAGES DU SITE » — NATIVE (palier 5, #5)
 * =============================================================================
 * ÉTAPE 5a : éditeurs STRUCTURÉS (sans éditeur riche) —
 *   • Liste des pages + bascules « pied de page »
 *   • FAQ (titre, sous-titre, questions/réponses ordonnables)
 *   • Contact (coordonnées + boîte de réception des messages)
 *   • Guide des tailles (page + tableaux ajustables)
 *   • Menu Vêtements « En vedette » (liens ajout/retrait)
 *
 * ÉTAPE 5b (FAITE) : l'ÉDITEUR RICHE pour « Nos politiques » — retours,
 *   expédition, codes promo, en trois SOUS-ONGLETS (trois éditeurs empilés dans
 *   une fenêtre ancrée, c'était un défilement sans fin). Format de bloc, police,
 *   taille, gras/italique/souligné, listes, liens, variables, images, tableaux,
 *   aperçu à variables résolues, plein écran ; barres flottantes pour
 *   redimensionner/aligner une image et pour manipuler les lignes et colonnes
 *   d'un tableau.
 *
 *   ⚠⚠ LES IMAGES N'ONT PAS BESOIN D'UNE ORIGINE. Elles entrent en `data:` dans
 *   le contenu — donc du texte — et c'est le CŒUR, dans la page, qui les dépose
 *   dans R2 au moment d'enregistrer (`TursoDB.uploadInlineImages`), puis renvoie
 *   le contenu réécrit, que la fenêtre reprend. C'est ce qui evite qu'une
 *   politique parte en base avec une photo encastree dans son HTML, et cela
 *   règle la seule vraie inconnue de cette étape.
 *
 * ÉTAPE 5c (FAITE) : le CONTENU des pages personnalisées, avec ce même éditeur
 *   riche. « Modifier » et « ＋ Nouvelle page » ouvrent l'éditeur EN SURCOUCHE
 *   (titre, slug, sous-titre, libellé de pied de page, visibilité + contenu). Les
 *   images suivent la même route que les politiques : elles entrent en `data:` et
 *   le cœur (admin.js) les dépose dans R2 à l'enregistrement, puis renvoie le
 *   contenu réécrit. On FERME après enregistrement : rouvrir relit un contenu déjà
 *   pointé vers R2, donc pas de `data:` résiduel ni de second dépôt.
 *   ⚠ Le banc ne peut pas CLIQUER : l'éditeur s'atteint aussi par un id
 *   d'ouverture ('custom-nouvelle' / 'custom-<id>'), comme les politiques par
 *   l'onglet 'retours'.
 *
 * Les clés elg_page_… , elg_size_guides, elg_custom_pages, elg_builtin_pages_footer
 * sont dans _CFG_MAP : côté cœur (admin.js), un simple localStorage.setItem est
 * intercepté par data.js et poussé vers Turso. Rien n'est « local seulement ».
 *
 * ⚠ ANCRÉE = PLEINE PAGE. ⚠ Aucun caractère accent-grave dans la portion script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.55rem 1.1rem;
  border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.ro{flex:0 0 auto;margin:.55rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;padding:.45rem .7rem;font-size:.78rem}
.onglets{flex:0 0 auto;display:flex;gap:.1rem;flex-wrap:wrap;overflow-x:auto;
  padding:.35rem 1rem 0;border-bottom:1px solid rgba(255,255,255,.08)}
.onglets button{font:inherit;font-size:.82rem;white-space:nowrap;background:none;border:none;
  color:#8fa1b8;padding:.5rem .85rem;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.onglets button.on{color:#c9a97e;border-bottom-color:#c9a97e;font-weight:700}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1.1rem 1.2rem;margin:0 0 1.1rem}
.carte h3{margin:0 0 .2rem;font:700 1rem/1.2 Georgia,serif}
.entete{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
label.champ{display:block;margin:0 0 .8rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8;margin:0 0 .25rem}
input.t,textarea.t,select.t{width:100%;background:#0f1724;border:1px solid #2b3444;border-radius:8px;color:#e8edf5;
  font:inherit;padding:.5rem .65rem}
textarea.t{resize:vertical;min-height:3.2rem;line-height:1.5}
input.t:focus,textarea.t:focus{outline:none;border-color:#c9a97e}
.grille2{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
@media(max-width:640px){.grille2{grid-template-columns:1fr}}
button.prim{font:inherit;font-weight:700;background:#c9a97e;color:#1a1408;border:none;border-radius:8px;padding:.5rem 1rem;cursor:pointer}
button.prim:disabled{opacity:.5;cursor:default}
button.b{font:inherit;font-size:.82rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.16);
  color:#e8edf5;border-radius:7px;padding:.35rem .7rem;cursor:pointer}
button.b.dgr{border-color:rgba(248,113,113,.4);color:#f6a6a6}
button.b:disabled{opacity:.4;cursor:default}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);color:#e8edf5;cursor:pointer;-webkit-user-select:none;user-select:none}
.qa{border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:.7rem .8rem;margin:0 0 .6rem;background:rgba(255,255,255,.02)}
.qa .barre{display:flex;gap:.3rem;justify-content:flex-end;margin-top:.5rem}
.lien{display:flex;align-items:center;gap:.75rem;padding:.55rem .8rem;border:1px solid rgba(255,255,255,.09);border-radius:9px;margin:0 0 .5rem}
.lien .g{flex:1;min-width:0}
.lien code{font-size:.76rem;color:#8fa1b8;word-break:break-all}
table.tb{width:100%;border-collapse:collapse;font-size:.83rem}
table.tb th,table.tb td{border:1px solid rgba(255,255,255,.12);padding:.25rem}
table.tb input.t{padding:.3rem .45rem;font-size:.8rem;min-width:70px}
.pastille{padding:.15rem .55rem;border-radius:20px;font-size:.7rem;font-weight:700}
.pastille.int{background:rgba(201,169,126,.18);color:#d9bd94}
.pastille.perso{background:rgba(99,102,241,.16);color:#a6a8f6}
.note{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:.85rem 1rem;font-size:.82rem;color:#8fa1b8;line-height:1.6}
.note b{color:#e8edf5}
.chk{display:inline-flex;align-items:center;gap:.4rem;cursor:pointer;font-size:.82rem;color:#cdd7e5}
.chk input{width:16px;height:16px;accent-color:#c9a97e}
.badge{display:inline-block;min-width:1.2rem;text-align:center;background:#c9a97e;color:#1a1408;border-radius:20px;font-size:.7rem;font-weight:700;padding:0 .35rem;margin-left:.3rem}
.vide{padding:1rem;text-align:center;color:#8fa1b8;font-size:.82rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
.sur{position:fixed;inset:0;background:rgba(4,8,15,.72);display:flex;align-items:center;justify-content:center;z-index:50;padding:1.5rem}
.sur .boite{background:#131c2b;border:1px solid rgba(255,255,255,.12);border-radius:14px;max-width:640px;width:100%;max-height:80vh;display:flex;flex-direction:column}
.sur .tt{display:flex;justify-content:space-between;align-items:center;padding:.9rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08)}
.sur .tt h3{margin:0;font:700 1rem/1.2 Georgia,serif}
.sur .liste{padding:1rem 1.1rem;overflow-y:auto}
.mailmsg{border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:.7rem .8rem;margin:0 0 .6rem;background:rgba(255,255,255,.02)}
.mailmsg .hh{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.35rem}
.mailmsg a{color:#c9a97e;text-decoration:none}

/* ══ ÉDITEUR RICHE (étape 5b) ══════════════════════════════════════════════
   Porté depuis l'écran web. Deux différences assumées :
   . les sections sont en SOUS-ONGLETS et non empilées — trois éditeurs riches
     l'un sous l'autre dans une fenêtre ancrée, c'est un défilement sans fin et
     trois barres d'outils qui se ressemblent ;
   . les barres flottantes (image, tableau) sont posées en position fixe, hors
     de la zone modifiable : un outil DANS le contenteditable finit toujours par
     se retrouver dans le HTML enregistré. */
.souso{display:flex;gap:.2rem;margin:0 0 .9rem;flex-wrap:wrap}
.souso button{font:inherit;font-size:.82rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
  color:#8fa1b8;padding:.4rem .8rem;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:.4rem}
.souso button.on{background:rgba(201,169,126,.16);border-color:rgba(201,169,126,.45);color:#e6cfa8;font-weight:700}
.souso .pt{width:6px;height:6px;border-radius:50%;background:#facc15}

.ed{border:1px solid #2b3444;border-radius:10px;overflow:hidden;background:#0f1724;display:flex;flex-direction:column}
.ed.plein{position:fixed;inset:0;z-index:70;border-radius:0;border:0}
.ed .barre{display:flex;flex-wrap:wrap;align-items:center;gap:.15rem;padding:.35rem .45rem;
  background:#131c2b;border-bottom:1px solid #2b3444;flex:0 0 auto}
.ed .barre button{font:inherit;font-size:.8rem;background:none;border:1px solid transparent;color:#c3cede;
  border-radius:7px;padding:.28rem .42rem;cursor:pointer;display:flex;align-items:center;gap:.3rem;line-height:1}
.ed .barre button:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.1)}
.ed .barre button svg{width:15px;height:15px;display:block;fill:currentColor}
.ed .barre select{font:inherit;font-size:.78rem;background:#0f1724;border:1px solid #2b3444;color:#c3cede;
  border-radius:7px;padding:.25rem .35rem;cursor:pointer;max-width:120px}
.ed .barre .fil{width:1px;align-self:stretch;background:#2b3444;margin:.1rem .3rem}
.ed .barre .pousse{flex:1}
.ed .zone{flex:1 1 auto;min-height:270px;max-height:46vh;overflow-y:auto;padding:1rem 1.15rem;
  color:#e8edf5;line-height:1.65;font-size:.88rem;outline:none}
.ed.plein .zone{max-height:none}
.ed .zone::-webkit-scrollbar{width:9px}
.ed .zone::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:9px}
.ed .zone:empty:before{content:attr(data-vide);color:#5c6b80}
.ed .zone h2{font:700 1.15rem/1.3 Georgia,serif;margin:1.1rem 0 .5rem}
.ed .zone h3{font:700 1rem/1.3 Georgia,serif;margin:1rem 0 .4rem;color:#e6cfa8}
.ed .zone h4{font:700 .92rem/1.3 Georgia,serif;margin:.9rem 0 .35rem}
.ed .zone p{margin:0 0 .7rem}
.ed .zone ul,.ed .zone ol{margin:0 0 .8rem;padding-left:1.4rem}
.ed .zone li{margin:0 0 .25rem}
.ed .zone blockquote{margin:.8rem 0;padding:.5rem .9rem;border-left:3px solid #c9a97e;
  background:rgba(201,169,126,.07);color:#cfd8e4}
.ed .zone a{color:#c9a97e}
.ed .zone img{max-width:100%;height:auto;border-radius:5px;display:block;margin:.6rem 0}
.ed .zone table{border-collapse:collapse;width:100%;margin:.9rem 0}
.ed .zone th,.ed .zone td{border:1px solid #3a465a;padding:.4rem .6rem;text-align:left}
.ed .zone th{background:rgba(255,255,255,.05);font-weight:700}
/* Une variable est un BLOC INSECABLE, pas du texte : sans cela, une frappe au
   milieu de {{MARQUE}} produisait une variable a demi ecrite, qui ne se resout
   plus et part telle quelle sur la boutique. */
/* ⚠⚠ LA CLASSE EST << re-var-token >> ET RIEN D AUTRE, PAS MEME AVEC UNE CLASSE
   EN PLUS. Le resolveur du site cherche la chaine class="re-var-token" TELLE
   QUELLE dans le HTML : class="re-var-token jeton" ne correspondrait PAS, et la
   variable partirait sur la boutique sans jamais etre remplacee. */
.ed .zone .re-var-token{background:rgba(201,169,126,.2);color:#e0c49a;border:1px solid rgba(201,169,126,.35);
  border-radius:5px;padding:0 .3rem;font-size:.82em;white-space:nowrap}
.apr .re-var-token{background:rgba(196,154,108,.16);border-radius:4px;padding:0 .25rem}

/* Grille de choix des dimensions du tableau. */
.grtb{position:fixed;z-index:80;background:#131c2b;border:1px solid rgba(255,255,255,.14);
  border-radius:10px;padding:.55rem;box-shadow:0 12px 34px rgba(0,0,0,.55)}
.grtb .cases{display:grid;grid-template-columns:repeat(10,15px);gap:2px}
.grtb .c{width:15px;height:15px;border:1px solid #3a465a;border-radius:2px;cursor:pointer}
.grtb .c.on{background:rgba(201,169,126,.55);border-color:#c9a97e}
.grtb .lgd{margin-top:.4rem;font-size:.74rem;color:#8fa1b8;text-align:center}

/* Barres flottantes : image selectionnee, cellule de tableau. */
.flot{position:fixed;z-index:80;display:flex;gap:.15rem;background:#131c2b;
  border:1px solid rgba(255,255,255,.16);border-radius:9px;padding:.25rem;
  box-shadow:0 10px 28px rgba(0,0,0,.5)}
.flot button{font:inherit;font-size:.74rem;background:none;border:0;color:#c3cede;border-radius:6px;
  padding:.24rem .45rem;cursor:pointer;white-space:nowrap}
.flot button:hover{background:rgba(255,255,255,.09)}
.flot button.dgr:hover{background:rgba(248,113,113,.18);color:#f6a6a6}
.flot .fil{width:1px;background:rgba(255,255,255,.14);margin:.1rem .2rem}
.imgsel{outline:2px solid #c9a97e;outline-offset:2px}

/* Aperçu et liste des variables : memes surfaces que la boite de reception. */
.apr{padding:1rem 1.15rem;overflow-y:auto;background:#fdfcfa;color:#2c2c2c;line-height:1.7;font-size:.88rem}
.apr h2,.apr h3,.apr h4{font-family:Georgia,serif;color:#1a1a1a}
.apr a{color:#a67c4e}
.apr table{border-collapse:collapse;width:100%;margin:.9rem 0}
.apr th,.apr td{border:1px solid #ddd;padding:.4rem .6rem;text-align:left}
.apr img{max-width:100%;height:auto}
.vgrp{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#8fa1b8;margin:.9rem 0 .4rem}
.vbtn{display:flex;justify-content:space-between;align-items:center;gap:1rem;width:100%;
  padding:.5rem .75rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
  border-radius:8px;cursor:pointer;margin:0 0 .3rem;text-align:left;font:inherit;color:#e8edf5}
.vbtn:hover{border-color:rgba(201,169,126,.45)}
.vbtn code{font-size:.79rem;color:#c9a97e;font-weight:600}
.vbtn span{font-size:.77rem;color:#8fa1b8}

@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ⚠ LA FENETRE ACCEPTE UN ONGLET D OUVERTURE, et ce n est pas un ajout pour le
   banc : la charpente le prevoit deja (verifier-fenetres.js appelle
   `fabrique(cas.id)`), et main.js peut s en servir pour ouvrir directement sur
   une section. Sans cela, le banc ne peut PAS atteindre l onglet des politiques
   — son DOM est factice, un clic simule ne navigue nulle part — et l editeur
   riche ne serait jamais dessine, donc jamais eprouve. */
function pagePages(onglet) {
  var brut = String(onglet||'');
  /* ⚠ OUVERTURE DIRECTE SUR L EDITEUR D UNE PAGE PERSO (etape 5c). L editeur
     est une surcouche ouverte par un CLIC dans la liste — or le banc a un DOM
     factice, un clic n y ouvre rien. On accepte donc un id d ouverture :
     'custom-nouvelle' (creation) ou 'custom-<id>' (modification). C est ainsi
     que verifier-fenetres.js atteint l editeur, comme il atteint deja les
     politiques par l onglet 'retours'. En usage reel, l id reste vide et
     l editeur s ouvre au clic. */
  var CPOUV0 = '';
  if (brut.indexOf('custom-') === 0) { CPOUV0 = brut.slice(7).replace(/[^A-Za-z0-9_-]/g,''); brut = 'list'; }
  const ONGLET0 = (['list','faq','contact','retours','tailles','vedette'].indexOf(brut) >= 0)
    ? brut : 'list';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Pages du site — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">📄</span><h1>Pages du site</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter, pas modifier.</div>
<div class="onglets" id="onglets"></div>
<div class="corps"><div id="corps"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='auto'; t.appendChild(b); }
    if (actif) { b.textContent='⧉ Détacher'; b.title='Ouvrir cet écran dans sa propre fenêtre'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='⚓ Ancrer'; b.title='Ramener cet écran dans la fenêtre principale'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var ongletsEl = document.getElementById('onglets');
  var D = null, RO = false, OCCUPE = false;
  var ONGLET = '${ONGLET0}';
  var CPOUV = '${CPOUV0}';  // ouverture directe de l editeur de page perso (banc)
  var CPSEL = '';          // id de la page perso en cours d edition ('' = creation)
  var FAQ = null;          // copie de travail : { title, subtitle, items:[{id,q,a}] }
  var GUIDES = null;       // copie de travail des tableaux de tailles
  var DELP = '';           // id de page personnalisée en attente de confirmation
  var VIDECONF = false;    // vider la boîte de réception, 2e clic
  /* ⚠ POL SURVIT AU CHANGEMENT D ONGLET, contrairement à FAQ et GUIDES.
     Un texte de politique se rédige en plusieurs minutes ; le remettre à zéro en
     passant voir la liste des pages effacerait un travail long sans rien dire.
     SALE retient, section par section, ce qui n est pas encore enregistré, et le
     signale par une pastille. */
  var POL = null;          // copie de travail des trois politiques
  var SECP = 'returns';    // section affichée dans l onglet Nos politiques
  var SALE = { returns:false, shipping:false, promocodes:false };

  var ONGLETS = [
    { k:'list',    n:'Liste' },
    { k:'faq',     n:'FAQ' },
    { k:'contact', n:'Contact' },
    { k:'retours', n:'Nos politiques' },
    { k:'tailles', n:'Guide des tailles' },
    { k:'vedette', n:'En vedette' }
  ];

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function val(id){ var e=document.getElementById(id); return e?String(e.value||'').trim():''; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès aux pages du site.',
    lecture_seule:'Votre rôle est en lecture seule.',
    invalide:'Titre et slug sont requis.',
    slug_pris:'Ce slug est déjà utilisé par une autre page.',
    introuvable:'Élément introuvable.',
    protege:'Cette page est protégée et ne peut pas être supprimée.',
    pont_indisponible:'La fenêtre principale ne répond pas.',
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    echec:'L’opération a échoué.'
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('Erreur inattendue ('+esc(m||'?')+').'))+(r&&r.detail?' — '+esc(r.detail):''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }

  function tabs(){
    var h='';
    for (var i=0;i<ONGLETS.length;i++){ var o=ONGLETS[i];
      h+='<button data-k="'+o.k+'" class="'+(ONGLET===o.k?'on':'')+'">'+esc(o.n)+'</button>'; }
    ongletsEl.innerHTML=h;
    var bs=ongletsEl.querySelectorAll('button');
    for (var j=0;j<bs.length;j++) bs[j].onclick=function(){ ONGLET=this.getAttribute('data-k'); FAQ=null; GUIDES=null; DELP=''; VIDECONF=false; rendre(); };
  }

  // ── LISTE ────────────────────────────────────────────────────────
  function vueListe(){
    var f=D.footer||{};
    var builtins=[
      { k:'faq',     nom:'FAQ',                route:'#faq',     onglet:'faq',     foot:true },
      { k:'contact', nom:'Contactez-nous',     route:'#contact', onglet:'contact', foot:true },
      { k:'retours', nom:'Nos politiques',     route:'#retours', onglet:'retours', foot:true },
      { k:'tailles', nom:'Guide des Tailles',  route:'#tailles', onglet:'tailles', foot:true },
      { k:'vedette', nom:'Menu Vêtements — En vedette', route:'(menu)', onglet:'vedette', foot:false }
    ];
    var cp=D.customPages||[];
    var boutonNouv = (D.peutAjouter && !RO) ? '<button class="prim" id="cp-nouvelle">＋ Nouvelle page</button>' : '';
    var h='<div class="carte"><div class="entete"><h3>Toutes les pages <span style="font-size:.8rem;font-weight:400;color:#8fa1b8">'+(builtins.length+cp.length)+' page(s)</span></h3>'+boutonNouv+'</div>';
    h+='<table class="tb"><thead><tr><th style="text-align:left">Page</th><th style="text-align:left">Route</th><th>Type</th><th>Pied de page</th><th></th></tr></thead><tbody>';
    for (var i=0;i<builtins.length;i++){ var b=builtins[i];
      var coche = f[b.k]!==false;
      h+='<tr><td style="text-align:left;font-weight:600">'+esc(b.nom)+'</td>'
        +'<td style="text-align:left"><code>'+esc(b.route)+'</code></td>'
        +'<td style="text-align:center"><span class="pastille int">Intégrée</span></td>'
        +'<td style="text-align:center">'+(b.foot?('<label class="chk"><input type="checkbox" data-foot="'+b.k+'" '+(coche?'checked':'')+(RO?' disabled':'')+'></label>'):'—')+'</td>'
        +'<td style="text-align:right"><button class="b" data-go="'+b.onglet+'">Modifier</button></td></tr>';
    }
    for (var c=0;c<cp.length;c++){ var p=cp[c];
      h+='<tr><td style="text-align:left;font-weight:600">'+esc(p.title)+'</td>'
        +'<td style="text-align:left"><code>#page/'+esc(p.slug)+'</code></td>'
        +'<td style="text-align:center"><span class="pastille perso">Personnalisée</span></td>'
        +'<td style="text-align:center"><label class="chk"><input type="checkbox" data-cfoot="'+esc(p.id)+'" '+(p.footerVisible?'checked':'')+(RO?' disabled':'')+'></label></td>'
        +'<td style="text-align:right;white-space:nowrap"><button class="b" data-cedit="'+esc(p.id)+'">Modifier</button>'
        +(D.peutSupprimer && !p.protege ? ' <button class="b dgr" data-cdel="'+esc(p.id)+'">'+(DELP===p.id?'✓ Confirmer':'Supprimer')+'</button>' : '')+'</td></tr>';
    }
    h+='</tbody></table></div>';
    h+='<div class="note">ℹ <b>Nos politiques</b> et le <b>contenu des pages personnalisées</b> se rédigent ici, avec l’éditeur riche complet (titres, listes, liens, variables, images, tableaux, aperçu). Cliquez sur « Modifier » ou « ＋ Nouvelle page ».</div>';
    corps.innerHTML=h;
    brancherListe();
  }
  function brancherListe(){
    var fts=corps.querySelectorAll('[data-foot]');
    for (var i=0;i<fts.length;i++) fts[i].onchange=function(){ var k=this.getAttribute('data-foot'); enregistrer('pages:footer',[k,this.checked],'Pied de page mis à jour.'); };
    var cfs=corps.querySelectorAll('[data-cfoot]');
    for (var j=0;j<cfs.length;j++) cfs[j].onchange=function(){ var id=this.getAttribute('data-cfoot'); enregistrer('pages:custom:footer',[id,this.checked],'Pied de page mis à jour.'); };
    var gos=corps.querySelectorAll('[data-go]');
    for (var g=0;g<gos.length;g++) gos[g].onclick=function(){ ONGLET=this.getAttribute('data-go'); FAQ=null; GUIDES=null; rendre(); };
    var nv=document.getElementById('cp-nouvelle'); if (nv) nv.onclick=function(){ ouvrirEditeurPage(''); };
    var eds=corps.querySelectorAll('[data-cedit]');
    for (var e=0;e<eds.length;e++) eds[e].onclick=function(){ ouvrirEditeurPage(this.getAttribute('data-cedit')); };
    var dls=corps.querySelectorAll('[data-cdel]');
    for (var d=0;d<dls.length;d++) dls[d].onclick=function(){ var id=this.getAttribute('data-cdel');
      if (DELP===id){ DELP=''; supprimerPage(id); } else { DELP=id; vueListe(); dire('Cliquez encore pour supprimer cette page.', 'att'); } };
  }
  function supprimerPage(id){
    if (RO||OCCUPE) return; OCCUPE=true; dire('Suppression…');
    appeler('pages:custom:supprimer',[id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ recharger('Page supprimée.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }

  // ── PAGES PERSONNALISÉES — ÉDITEUR RICHE DU CONTENU (5c) ─────────
  // L editeur ouvre en SURCOUCHE (la liste reste derriere) ; son bouton plein
  // ecran passe par-dessus tout. On FERME apres enregistrement : rouvrir relira
  // le contenu deja reecrit (adresses R2), donc aucun data: residuel a l ecran et
  // pas de second depot des memes images. Meme edHtml/edLier que les politiques.
  function ouvrirEditeurPage(id){
    if (OCCUPE) return;
    if (!id){ dessinerEditeurPage(null); return; }
    OCCUPE=true; dire('Ouverture de la page…');
    appeler('pages:custom:donnees',[id]).then(function(r){ OCCUPE=false;
      if (r && r.ok){ dire(''); dessinerEditeurPage(r.page); }
      else dire('Échec : '+expliquer(r), 'err'); });
  }
  function fermerEditeurPage(){ var s=document.getElementById('sur-cp'); if (s) s.remove(); fermerFlot(); CPSEL=''; }
  function dessinerEditeurPage(page){
    fermerFlot();
    var nouv=!page;
    var p=page||{ id:'', slug:'', title:'', subtitle:'', footerLabel:'', footerVisible:false, content:'', protege:false };
    CPSEL=p.id||'';
    var dis=RO?' disabled':'';
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-cp';
    var h='<div class="boite" style="max-width:960px;max-height:92vh">'
      +'<div class="tt"><h3>'+(nouv?'Nouvelle page':'Modifier — '+esc(p.title))+'</h3>'
      +'<button class="mini" id="cp-x">Fermer</button></div>'
      +'<div class="liste" id="cp-corps">'
      +'<div class="grille2">'
      +'<label class="champ"><span class="lbl">Titre <span style="color:#f87171">*</span></span><input class="t" id="cp-title" value="'+esc(p.title)+'"'+dis+'></label>'
      +'<label class="champ"><span class="lbl">Slug (URL) <span style="color:#f87171">*</span></span><input class="t" id="cp-slug" value="'+esc(p.slug)+'" placeholder="ma-page"'+dis+(p.protege?' readonly title="Slug protégé (Loi 25)"':'')+'></label>'
      +'<label class="champ"><span class="lbl">Sous-titre</span><input class="t" id="cp-sub" value="'+esc(p.subtitle)+'"'+dis+'></label>'
      +'<label class="champ"><span class="lbl">Libellé pied de page</span><input class="t" id="cp-flabel" value="'+esc(p.footerLabel)+'"'+dis+'></label>'
      +'</div>'
      +'<label class="chk" style="margin:.2rem 0 .9rem"><input type="checkbox" id="cp-foot" '+(p.footerVisible?'checked':'')+dis+'> Afficher dans le pied de page</label>'
      +'<label class="champ" style="margin:0"><span class="lbl">Contenu de la page</span></label>'
      +edHtml('cp-ed', p.content)
      +'</div>'
      +'<div class="tt" style="justify-content:flex-end;gap:.5rem;border-bottom:0;border-top:1px solid rgba(255,255,255,.08)">'
      +'<button class="b" id="cp-annuler">Annuler</button>'
      +(RO?'':'<button class="prim" id="cp-enr">'+(nouv?'Créer la page':'Enregistrer')+'</button>')
      +'</div></div>';
    sur.innerHTML=h;
    document.body.appendChild(sur);
    edLier('cp-ed');
    var bx=document.getElementById('cp-x'); if (bx) bx.onclick=fermerEditeurPage;
    var ba=document.getElementById('cp-annuler'); if (ba) ba.onclick=fermerEditeurPage;
    var be=document.getElementById('cp-enr'); if (be) be.onclick=function(){ enregistrerPage(nouv); };
    // Slug : nettoye a la frappe ; se remplit depuis le titre tant qu on n y a pas
    // touche (nouvelle page seulement). NFD par point de code pour eviter tout
    // caractere accentue dans le script (les accents graves fermeraient le gabarit).
    var sl=document.getElementById('cp-slug');
    if (sl && !p.protege) sl.oninput=function(){ sl._touche=true; sl.value=sl.value.toLowerCase().replace(/[^a-z0-9-]/g,''); };
    if (nouv){ var ti=document.getElementById('cp-title');
      if (ti && sl) ti.oninput=function(){ if (sl._touche) return;
        sl.value=String(ti.value||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }; }
  }
  function enregistrerPage(nouv){
    if (RO||OCCUPE) return;
    var title=val('cp-title');
    var se=document.getElementById('cp-slug');
    var slug=String((se&&se.value)||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'');
    var subtitle=val('cp-sub');
    var flabel=val('cp-flabel');
    var fe=document.getElementById('cp-foot'); var foot=!!(fe&&fe.checked);
    var ze=document.getElementById('cp-ed'); var content=(ze&&ze.innerHTML)||'';
    if (!title || !slug){ dire('Titre et slug sont requis.', 'err'); return; }
    OCCUPE=true; dire('Enregistrement… (dépôt des images dans le nuage si besoin)');
    var d={ title:title, slug:slug, subtitle:subtitle, footerLabel:flabel, footerVisible:foot, content:content };
    appeler('pages:custom:ecrire',[CPSEL||'', d]).then(function(r){ OCCUPE=false;
      if (r && r.ok){
        if (r.customPages) D.customPages=r.customPages;
        fermerEditeurPage();
        if (ONGLET==='list') vueListe();
        dire(nouv?'Page créée.':'Page modifiée.', 'bon');
      } else dire('Échec : '+expliquer(r), 'err'); });
  }

  // ── FAQ ──────────────────────────────────────────────────────────
  function vueFaq(){
    if (!FAQ){ var s=D.faq||{}; FAQ={ title:s.title||'Foire aux questions', subtitle:s.subtitle||'', items:(s.items||[]).map(function(it){ return {id:it.id,q:it.q||'',a:it.a||''}; }) }; }
    var h='<div class="carte"><div class="entete"><h3>Foire aux questions</h3>'+boutonEnr('faqEnr')+'</div>'
      +'<div class="grille2">'
      +champ('faq-title','Titre de la page',FAQ.title)
      +champ('faq-sub','Sous-titre',FAQ.subtitle)
      +'</div></div>';
    h+='<div class="carte"><div class="entete"><h3>Questions & réponses <span style="font-size:.8rem;font-weight:400;color:#8fa1b8">'+FAQ.items.length+' entrée(s)</span></h3>'+(RO?'':'<button class="b" id="faq-add">＋ Ajouter</button>')+'</div><div id="faq-liste">';
    if (!FAQ.items.length) h+='<div class="vide">Aucune question.</div>';
    for (var i=0;i<FAQ.items.length;i++){ var it=FAQ.items[i];
      h+='<div class="qa">'
        +'<label class="champ"><span class="lbl">Question</span><input class="t" data-fq="'+i+'" value="'+esc(it.q)+'"'+(RO?' disabled':'')+'></label>'
        +'<label class="champ" style="margin:0"><span class="lbl">Réponse</span><textarea class="t" rows="3" data-fa="'+i+'"'+(RO?' disabled':'')+'>'+esc(it.a)+'</textarea></label>';
      if (!RO) h+='<div class="barre">'
        +(i>0?'<button class="b" data-fup="'+i+'">↑</button>':'')
        +(i<FAQ.items.length-1?'<button class="b" data-fdn="'+i+'">↓</button>':'')
        +'<button class="b dgr" data-frm="'+i+'">Retirer</button></div>';
      h+='</div>';
    }
    h+='</div></div>';
    corps.innerHTML=h;
    lierEnr('faqEnr', enregistrerFaq);
    var a=document.getElementById('faq-add'); if (a) a.onclick=function(){ syncFaq(); FAQ.items.push({id:null,q:'',a:''}); vueFaq(); };
    lierFaqLignes();
  }
  function lierFaqLignes(){
    var qs=corps.querySelectorAll('[data-fq]'); for (var i=0;i<qs.length;i++) qs[i].oninput=function(){ FAQ.items[+this.getAttribute('data-fq')].q=this.value; };
    var as=corps.querySelectorAll('[data-fa]'); for (var j=0;j<as.length;j++) as[j].oninput=function(){ FAQ.items[+this.getAttribute('data-fa')].a=this.value; };
    var up=corps.querySelectorAll('[data-fup]'); for (var u=0;u<up.length;u++) up[u].onclick=function(){ syncFaq(); var k=+this.getAttribute('data-fup'); var t=FAQ.items[k-1]; FAQ.items[k-1]=FAQ.items[k]; FAQ.items[k]=t; vueFaq(); };
    var dn=corps.querySelectorAll('[data-fdn]'); for (var d=0;d<dn.length;d++) dn[d].onclick=function(){ syncFaq(); var k=+this.getAttribute('data-fdn'); var t=FAQ.items[k+1]; FAQ.items[k+1]=FAQ.items[k]; FAQ.items[k]=t; vueFaq(); };
    var rm=corps.querySelectorAll('[data-frm]'); for (var r=0;r<rm.length;r++) rm[r].onclick=function(){ syncFaq(); FAQ.items.splice(+this.getAttribute('data-frm'),1); vueFaq(); };
  }
  function syncFaq(){ FAQ.title=val('faq-title'); FAQ.subtitle=val('faq-sub');
    var qs=corps.querySelectorAll('[data-fq]'); for (var i=0;i<qs.length;i++) FAQ.items[+qs[i].getAttribute('data-fq')].q=qs[i].value;
    var as=corps.querySelectorAll('[data-fa]'); for (var j=0;j<as.length;j++) FAQ.items[+as[j].getAttribute('data-fa')].a=as[j].value;
  }
  function enregistrerFaq(){ if (RO||OCCUPE) return; syncFaq();
    var items=FAQ.items.filter(function(x){ return String(x.q||'').trim(); }).map(function(x){ return {id:x.id,q:x.q,a:x.a}; });
    OCCUPE=true; dire('Enregistrement…');
    appeler('pages:faq:ecrire',[{title:FAQ.title,subtitle:FAQ.subtitle,items:items}]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ if (r.faq) D.faq=r.faq; FAQ=null; vueFaq(); dire('FAQ enregistrée.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }

  // ── CONTACT ──────────────────────────────────────────────────────
  function vueContact(){
    var d=D.contact||{};
    var badge = D.contactNouveaux>0 ? '<span class="badge">'+D.contactNouveaux+'</span>' : (' ('+(D.contactTotal||0)+')');
    var h='<div class="carte"><div class="entete"><h3>Page Contact</h3><div style="display:flex;gap:.4rem;align-items:center">'
      +'<button class="b" id="ct-inbox"><span class="ic">📬</span> Messages'+badge+'</button>'+boutonEnr('ctEnr')+'</div></div>'
      +'<div class="grille2">'
      +champ('ct-title','Titre de la page',d.title||'')
      +champ('ct-sub','Sous-titre',d.subtitle||'')
      +champ('ct-email','Courriel de contact',d.email||'')
      +champ('ct-phone','Téléphone',d.phone||'')
      +champ('ct-addr','Adresse',d.address||'')
      +champ('ct-hours','Heures d’ouverture',d.hours||'')
      +'</div>'
      +'<label class="champ" style="margin-top:.2rem"><span class="lbl">Texte d’introduction</span><textarea class="t" id="ct-intro" rows="2"'+(RO?' disabled':'')+'>'+esc(d.intro||'')+'</textarea></label>'
      +'</div>';
    corps.innerHTML=h;
    lierEnr('ctEnr', enregistrerContact);
    document.getElementById('ct-inbox').onclick=ouvrirBoite;
  }
  function enregistrerContact(){ if (RO||OCCUPE) return; OCCUPE=true; dire('Enregistrement…');
    var d={ title:val('ct-title'), subtitle:val('ct-sub'), email:val('ct-email'), phone:val('ct-phone'), address:val('ct-addr'), hours:val('ct-hours'), intro:val('ct-intro') };
    appeler('pages:contact:ecrire',[d]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D.contact=d; dire('Page Contact enregistrée.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }
  function ouvrirBoite(){
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-inbox';
    sur.innerHTML='<div class="boite"><div class="tt"><h3>Messages reçus</h3><button class="mini" id="ib-x">Fermer</button></div><div class="liste" id="ib-liste"><div class="vide">⏳ Chargement…</div></div></div>';
    document.body.appendChild(sur);
    sur.addEventListener('click', function(e){ if (e.target===sur) fermerBoite(); });
    document.getElementById('ib-x').onclick=fermerBoite;
    VIDECONF=false;
    appeler('pages:inbox',[]).then(function(r){ peindreBoite(r); });
  }
  function fermerBoite(){ var s=document.getElementById('sur-inbox'); if (s) s.remove(); }
  function peindreBoite(r){
    var l=document.getElementById('ib-liste'); if (!l) return;
    if (!r||!r.ok){ l.innerHTML='<div class="vide">'+expliquer(r)+'</div>'; return; }
    var m=r.messages||[];
    var tete='<div class="entete" style="margin-bottom:.7rem"><span style="font-size:.82rem;color:#8fa1b8">'+m.length+' message(s)</span>'
      +(m.length&&!RO?'<button class="b dgr" id="ib-vider">'+(VIDECONF?'✓ Confirmer':'Tout supprimer')+'</button>':'')+'</div>';
    if (r.etat==='reseau') tete+='<div class="note" style="margin-bottom:.7rem">⚠ Relecture depuis le nuage impossible (réseau) — rien n’est perdu. Rouvrez pour réessayer.</div>';
    var corpsl='';
    if (!m.length) corpsl='<div class="vide">Aucun message reçu.</div>';
    for (var i=m.length-1;i>=0;i--){ var s=m[i];
      var dt=''; try{ dt=new Date(s.createdAt).toLocaleDateString('fr-CA'); }catch(e){}
      corpsl+='<div class="mailmsg"><div class="hh"><div><b>'+esc(s.name)+'</b> <a href="mailto:'+esc(s.email)+'">'+esc(s.email)+'</a></div>'
        +'<div style="display:flex;gap:.5rem;align-items:center">'+(s.status==='new'?'<span class="pastille" style="background:rgba(234,179,8,.2);color:#e0b93a">Nouveau</span>':'')
        +'<span style="font-size:.76rem;color:#8fa1b8">'+esc(dt)+'</span>'+(RO?'':'<button class="mini" data-mdel="'+esc(s.id)+'">✕</button>')+'</div></div>'
        +'<div style="font-size:.85rem;font-weight:600;margin-bottom:.2rem">'+esc(s.subject)+'</div>'
        +'<div style="font-size:.84rem;color:#c0cad8;line-height:1.5">'+esc(s.message)+'</div></div>';
    }
    l.innerHTML=tete+corpsl;
    var vd=document.getElementById('ib-vider'); if (vd) vd.onclick=function(){ if (VIDECONF){ viderBoite(); } else { VIDECONF=true; peindreBoite(r); } };
    var dels=l.querySelectorAll('[data-mdel]'); for (var d=0;d<dels.length;d++) dels[d].onclick=function(){ supprimerMsg(this.getAttribute('data-mdel')); };
  }
  function supprimerMsg(id){ appeler('pages:inbox:supprimer',[id]).then(function(r){ if (r&&r.ok){ appeler('pages:inbox',[]).then(peindreBoite); recharger('', ''); } else dire('Échec : '+expliquer(r), 'err'); }); }
  function viderBoite(){ appeler('pages:inbox:vider',[]).then(function(r){ if (r&&r.ok){ VIDECONF=false; appeler('pages:inbox',[]).then(peindreBoite); recharger('Boîte vidée.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); }); }

  // ── NOS POLITIQUES — ÉDITEUR RICHE (5b) ──────────────────────────
  var SECS = [
    { k:'returns',    n:'Retours & échanges' },
    { k:'shipping',   n:'Expédition & livraison' },
    { k:'promocodes', n:'Codes promotionnels' }
  ];

  var IC = {
    g:'<svg viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>',
    i:'<svg viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>',
    s:'<svg viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>',
    ul:'<svg viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>',
    ol:'<svg viewBox="0 0 24 24"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>',
    a:'<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
    na:'<svg viewBox="0 0 24 24"><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.6 15.74 22 14.02 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16v-2zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l2.54 2.54L18.73 18 3.27 2.54 2 4.27z"/></svg>',
    x:'<svg viewBox="0 0 24 24"><path d="M6 19h4l2-2H6v2zm0-4h8l2-2H6v2zm0-4h8V9H6v2zm0-6v2h8V5H6zm9.41 5.17L14 12.58 9.83 8.41 11.24 7l3.59 3.59 1.17-1.17-1.59-1.59 1.41-1.41 3 3-3.41 3.17z"/></svg>',
    img:'<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
    tb:'<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>',
    oe:'<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
    pl:'<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
    var:'<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>'
  };

  // ⚠ LA SÉLECTION SE PERD DÈS QU ON CLIQUE AILLEURS. Toute commande qui ouvre
  // une fenêtre (lien, image, variables) doit donc la mémoriser AVANT, et la
  // remettre en place après — sinon l insertion atterrit au début du document.
  var EDSEL = {};
  function edGarder(id){
    var s=window.getSelection();
    if (s && s.rangeCount) { var r=s.getRangeAt(0); var z=document.getElementById(id);
      if (z && z.contains(r.commonAncestorContainer)) EDSEL[id]=r.cloneRange(); }
  }
  function edRendre(id){
    var z=document.getElementById(id); if (!z) return null;
    z.focus();
    var r=EDSEL[id]; if (!r) return z;
    var s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
    return z;
  }
  function edCmd(id,cmd,arg){ edRendre(id); document.execCommand(cmd,false,arg===undefined?null:arg); edGarder(id); }

  function edBtn(cmd,ico,titre){
    return '<button type="button" data-cmd="'+cmd+'" title="'+esc(titre)+'">'+ico+'</button>';
  }
  function edHtml(id,contenu){
    var h='<div class="ed" id="wrap-'+id+'"><div class="barre">'
      +'<select data-bloc title="Format du paragraphe"><option value="" selected disabled>Format</option>'
      +'<option value="p">Paragraphe</option><option value="h2">Titre H2</option>'
      +'<option value="h3">Titre H3</option><option value="blockquote">Citation</option></select>'
      +'<select data-police title="Police"><option value="" selected disabled>Police</option>'
      +'<option value="Inter,sans-serif">Inter</option><option value="Georgia,serif">Georgia</option>'
      +'<option value="Arial,sans-serif">Arial</option><option value="Courier New,monospace">Courier</option></select>'
      +'<select data-taille title="Taille du texte"><option value="" selected disabled>Taille</option>'
      +'<option value="0.75rem">Très petit</option><option value="0.875rem">Petit</option>'
      +'<option value="1rem">Normal</option><option value="1.2rem">Grand</option>'
      +'<option value="1.5rem">Très grand</option><option value="2rem">Énorme</option></select>'
      +'<span class="fil"></span>'
      +edBtn('bold',IC.g,'Gras (Ctrl+B)')+edBtn('italic',IC.i,'Italique (Ctrl+I)')+edBtn('underline',IC.s,'Souligné (Ctrl+U)')
      +'<span class="fil"></span>'
      +edBtn('insertUnorderedList',IC.ul,'Liste à puces')+edBtn('insertOrderedList',IC.ol,'Liste numérotée')
      +'<span class="fil"></span>'
      +'<button type="button" data-lien title="Insérer un lien">'+IC.a+'</button>'
      +edBtn('unlink',IC.na,'Retirer le lien')
      +edBtn('removeFormat',IC.x,'Effacer la mise en forme')
      +'<span class="fil"></span>'
      +'<button type="button" data-vars title="Insérer une variable">'+IC.var+' Variables</button>'
      +'<button type="button" data-img title="Insérer une image">'+IC.img+' Image</button>'
      +'<button type="button" data-tbl title="Insérer un tableau">'+IC.tb+' Tableau</button>'
      +'<span class="pousse"></span>'
      +'<button type="button" data-apercu title="Aperçu avec les variables résolues">'+IC.oe+' Aperçu</button>'
      +'<button type="button" data-plein title="Plein écran">'+IC.pl+'</button>'
      +'</div>'
      +'<div class="zone" id="'+id+'" contenteditable="'+(RO?'false':'true')+'" spellcheck="false" '
      +'data-vide="Rédigez le contenu de cette section…">'+(contenu||'<p><br></p>')+'</div>'
      +'<input type="file" accept="image/*" id="f-'+id+'" style="display:none"></div>';
    return h;
  }

  function edLier(id){
    var w=document.getElementById('wrap-'+id); if (!w) return;
    var z=document.getElementById(id);
    z.addEventListener('keyup', function(){ edGarder(id); marquerSale(); });
    z.addEventListener('mouseup', function(){ edGarder(id); });
    z.addEventListener('input', marquerSale);
    z.addEventListener('blur', function(){ edGarder(id); });
    z.addEventListener('click', function(e){ edClic(e,id); });

    var bs=w.querySelectorAll('.barre button[data-cmd]');
    for (var i=0;i<bs.length;i++) bs[i].onmousedown=function(e){ e.preventDefault();
      edCmd(id,this.getAttribute('data-cmd')); marquerSale(); };

    var bl=w.querySelector('[data-bloc]');
    bl.onchange=function(){ edCmd(id,'formatBlock',this.value); this.selectedIndex=0; marquerSale(); };
    var bp=w.querySelector('[data-police]');
    bp.onchange=function(){ var v=this.value; edRendre(id);
      document.execCommand('styleWithCSS',false,true); document.execCommand('fontName',false,v);
      this.selectedIndex=0; edGarder(id); marquerSale(); };
    // ⚠ La taille passe par fontSize=7 puis remplacement des <font> : execCommand
    // ne connaît que les sept tailles historiques, pas les rem.
    var bt=w.querySelector('[data-taille]');
    bt.onchange=function(){ var v=this.value; edRendre(id);
      document.execCommand('fontSize',false,'7');
      var fs=z.querySelectorAll('font[size="7"]');
      for (var k=0;k<fs.length;k++){ var f=fs[k]; var sp=document.createElement('span');
        sp.style.fontSize=v; while (f.firstChild) sp.appendChild(f.firstChild);
        f.parentNode.replaceChild(sp,f); }
      this.selectedIndex=0; edGarder(id); marquerSale(); };

    w.querySelector('[data-lien]').onmousedown=function(e){ e.preventDefault(); edGarder(id); edLien(id); };
    w.querySelector('[data-vars]').onmousedown=function(e){ e.preventDefault(); edGarder(id); edVars(id); };
    w.querySelector('[data-img]').onmousedown=function(e){ e.preventDefault(); edGarder(id);
      var f=document.getElementById('f-'+id); f.value=''; setTimeout(function(){ f.click(); },10); };
    document.getElementById('f-'+id).onchange=function(){ edImage(id,this); };
    w.querySelector('[data-tbl]').onmousedown=function(e){ e.preventDefault(); edGarder(id); edGrille(id,this); };
    w.querySelector('[data-apercu]').onmousedown=function(e){ e.preventDefault(); edApercu(id); };
    w.querySelector('[data-plein]').onmousedown=function(e){ e.preventDefault();
      w.classList.toggle('plein'); setTimeout(function(){ z.focus(); },40); };
  }

  function edLien(id){
    demanderTexte('Insérer un lien','Adresse du lien','https://', function(url){
      if (!url) return;
      var z=edRendre(id); if (!z) return;
      var s=window.getSelection();
      var txt=(s && s.toString())||'';
      if (txt) document.execCommand('createLink',false,url);
      else document.execCommand('insertHTML',false,'<a href="'+esc(url)+'" target="_blank">'+esc(url)+'</a>');
      edGarder(id); marquerSale();
    });
  }

  // ⚠ L IMAGE ENTRE EN data:, ET C EST VOULU. Elle n est PAS deposee ici : la
  // fenetre n a pas d origine. C est le coeur, dans la page, qui la depose dans
  // R2 au moment d enregistrer, puis renvoie le contenu reecrit. Le plafond de
  // 600 Ko est celui de l ecran web — une photo pleine resolution ferait un
  // enregistrement de plusieurs secondes pour une image que personne ne verra
  // a cette taille.
  function edImage(id,input){
    var f=input && input.files && input.files[0]; if (!f) return;
    if (f.size>600000){ dire('Image trop grande (600 Ko maximum).', 'err'); return; }
    var fr=new FileReader();
    fr.onload=function(e){
      var nom=String(f.name||'image').replace(/\.[^.]+$/,'');
      var html='<img src="'+e.target.result+'" alt="'+esc(nom)+'" style="max-width:100%;height:auto;border-radius:4px;display:block;margin:.5rem 0"><p><br></p>';
      var z=edRendre(id); if (!z) return;
      document.execCommand('insertHTML',false,html);
      edGarder(id); marquerSale();
      dire('Image insérée — elle sera déposée dans le nuage à l’enregistrement.', 'att');
    };
    fr.readAsDataURL(f);
  }

  function edGrille(id,btn){
    fermerFlot();
    var g=document.createElement('div'); g.className='grtb';
    var h='<div class="cases">';
    for (var r=1;r<=8;r++) for (var c=1;c<=10;c++) h+='<div class="c" data-r="'+r+'" data-c="'+c+'"></div>';
    h+='</div><div class="lgd" id="lgd-tb">Choisissez les dimensions</div>';
    g.innerHTML=h;
    document.body.appendChild(g);
    var b=btn.getBoundingClientRect();
    g.style.left=Math.min(b.left, window.innerWidth-g.offsetWidth-8)+'px';
    g.style.top=(b.bottom+4)+'px';
    var cs=g.querySelectorAll('.c');
    for (var i=0;i<cs.length;i++){
      cs[i].onmouseenter=function(){ var R=+this.getAttribute('data-r'), C=+this.getAttribute('data-c');
        for (var j=0;j<cs.length;j++){ var el=cs[j];
          el.classList.toggle('on', +el.getAttribute('data-r')<=R && +el.getAttribute('data-c')<=C); }
        document.getElementById('lgd-tb').textContent=C+' × '+R+' tableau'; };
      cs[i].onclick=function(){ var R=+this.getAttribute('data-r'), C=+this.getAttribute('data-c');
        g.remove(); edPoserTableau(id,R,C); };
    }
    setTimeout(function(){
      var f=function(e){ if (!g.contains(e.target)){ g.remove(); document.removeEventListener('pointerdown',f,true); } };
      document.addEventListener('pointerdown',f,true);
    },0);
  }
  function edPoserTableau(id,lignes,cols){
    var cs='padding:.5rem .75rem;border:1px solid #ddd;text-align:left;';
    var th='<th style="'+cs+'background:#f5f2ee;font-weight:600">En-tête</th>';
    var td='<td style="'+cs+'">&nbsp;</td>';
    var tete='', ligne='';
    for (var c=0;c<cols;c++){ tete+=th; ligne+=td; }
    var corpsT='';
    for (var r=0;r<lignes;r++) corpsT+='<tr>'+ligne+'</tr>';
    var html='<table style="width:100%;border-collapse:collapse;margin:1rem 0"><thead><tr>'+tete+'</tr></thead><tbody>'+corpsT+'</tbody></table><p><br></p>';
    var z=edRendre(id); if (!z) return;
    document.execCommand('insertHTML',false,html);
    edGarder(id); marquerSale();
  }

  // ── Barres flottantes : image sélectionnée, cellule de tableau ────
  var FLOT=null, IMGSEL=null;
  function fermerFlot(){
    if (FLOT){ FLOT.remove(); FLOT=null; }
    if (IMGSEL){ IMGSEL.classList.remove('imgsel'); IMGSEL=null; }
    var g=document.querySelector('.grtb'); if (g) g.remove();
  }
  function poserFlot(cible,html){
    fermerFlot();
    FLOT=document.createElement('div'); FLOT.className='flot'; FLOT.innerHTML=html;
    document.body.appendChild(FLOT);
    var r=cible.getBoundingClientRect();
    var x=Math.max(6, Math.min(r.left, window.innerWidth-FLOT.offsetWidth-8));
    var y=r.top-FLOT.offsetHeight-6; if (y<6) y=r.bottom+6;
    FLOT.style.left=x+'px'; FLOT.style.top=y+'px';
    return FLOT;
  }
  function edClic(e,id){
    var t=e.target;
    if (t && t.tagName==='IMG'){ edFlotImage(t,id); return; }
    var cel=t && t.closest ? t.closest('td,th') : null;
    if (cel && document.getElementById(id).contains(cel)){ edFlotTableau(cel,id); return; }
    fermerFlot();
  }
  function edFlotImage(img,id){
    var f=poserFlot(img,
      '<button data-l="25">25 %</button><button data-l="50">50 %</button>'
      +'<button data-l="75">75 %</button><button data-l="100">100 %</button>'
      +'<span class="fil"></span>'
      +'<button data-a="left">⯇</button><button data-a="center">⬍</button><button data-a="right">⯈</button>'
      +'<span class="fil"></span><button class="dgr" data-sup>Supprimer</button>');
    IMGSEL=img; img.classList.add('imgsel');
    var ls=f.querySelectorAll('[data-l]');
    for (var i=0;i<ls.length;i++) ls[i].onclick=function(){ img.style.width=this.getAttribute('data-l')+'%'; img.style.height='auto'; marquerSale(); };
    var as=f.querySelectorAll('[data-a]');
    for (var j=0;j<as.length;j++) as[j].onclick=function(){ var a=this.getAttribute('data-a');
      img.style.display='block';
      img.style.marginLeft = (a==='left')?'0':'auto';
      img.style.marginRight = (a==='right')?'0':'auto';
      marquerSale(); };
    f.querySelector('[data-sup]').onclick=function(){ img.remove(); fermerFlot(); marquerSale(); };
  }
  function edFlotTableau(cel,id){
    var tr=cel.parentNode, table=cel.closest('table');
    var f=poserFlot(cel,
      '<button data-lig="+">＋ Ligne</button><button data-lig="-">－ Ligne</button>'
      +'<span class="fil"></span><button data-col="+">＋ Colonne</button><button data-col="-">－ Colonne</button>'
      +'<span class="fil"></span><button class="dgr" data-sup>Supprimer le tableau</button>');
    f.querySelector('[data-lig="+"]').onclick=function(){
      var n=tr.cloneNode(true);
      var tds=n.querySelectorAll('td,th');
      for (var i=0;i<tds.length;i++) tds[i].innerHTML='&nbsp;';
      tr.parentNode.insertBefore(n, tr.nextSibling); fermerFlot(); marquerSale(); };
    f.querySelector('[data-lig="-"]').onclick=function(){
      // ⚠ On ne retire jamais la DERNIÈRE ligne du corps : un tableau sans corps
      // reste dans le HTML sans rien montrer, et il devient impossible à
      // reprendre. Pour s en débarrasser, il y a « Supprimer le tableau ».
      var tb=tr.parentNode;
      if (tb.rows && tb.rows.length<=1){ dire('Un tableau garde au moins une ligne.', 'att'); return; }
      tr.remove(); fermerFlot(); marquerSale(); };
    f.querySelector('[data-col="+"]').onclick=function(){
      var i=cel.cellIndex, rs=table.rows;
      for (var r=0;r<rs.length;r++){ var src=rs[r].cells[i]||rs[r].cells[rs[r].cells.length-1];
        var c=document.createElement(src?src.tagName:'TD');
        c.setAttribute('style', src?src.getAttribute('style')||'':''); c.innerHTML='&nbsp;';
        rs[r].insertBefore(c, rs[r].cells[i+1]||null); }
      fermerFlot(); marquerSale(); };
    f.querySelector('[data-col="-"]').onclick=function(){
      var i=cel.cellIndex, rs=table.rows;
      if (rs[0] && rs[0].cells.length<=1){ dire('Un tableau garde au moins une colonne.', 'att'); return; }
      for (var r=0;r<rs.length;r++){ if (rs[r].cells[i]) rs[r].deleteCell(i); }
      fermerFlot(); marquerSale(); };
    f.querySelector('[data-sup]').onclick=function(){ table.remove(); fermerFlot(); marquerSale(); };
  }

  // ── Variables ────────────────────────────────────────────────────
  function edVars(id){
    var groupes=D.variables||[];
    var h='<div class="boite"><div class="tt"><h3>Variables disponibles</h3><button class="mini" id="v-x">Fermer</button></div><div class="liste">'
      +'<div class="note" style="margin-bottom:.8rem">Elles sont remplacées par la vraie valeur au moment de l’affichage sur la boutique. Cliquez pour insérer à la position du curseur.</div>';
    if (!groupes.length) h+='<div class="vide">Aucune variable.</div>';
    for (var i=0;i<groupes.length;i++){
      h+='<div class="vgrp">'+esc(groupes[i].groupe)+'</div>';
      var vs=groupes[i].vars||[];
      for (var j=0;j<vs.length;j++)
        h+='<button class="vbtn" data-code="'+esc(vs[j].code)+'"><code>'+esc(vs[j].code)+'</code><span>'+esc(vs[j].desc)+'</span></button>';
    }
    h+='</div></div>';
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-vars'; sur.innerHTML=h;
    document.body.appendChild(sur);
    sur.addEventListener('click', function(e){ if (e.target===sur) sur.remove(); });
    document.getElementById('v-x').onclick=function(){ sur.remove(); };
    var bs=sur.querySelectorAll('[data-code]');
    for (var k=0;k<bs.length;k++) bs[k].onclick=function(){
      var code=this.getAttribute('data-code');
      sur.remove();
      var z=edRendre(id); if (!z) return;
      // ⚠ class="re-var-token" EXACTEMENT — voir la note dans la feuille de style.
      document.execCommand('insertHTML',false,
        '<span class="re-var-token" contenteditable="false" data-var="'+esc(code)+'">'+esc(code)+'</span>&nbsp;');
      edGarder(id); marquerSale();
    };
  }

  // ── Aperçu ───────────────────────────────────────────────────────
  function edApercu(id){
    var z=document.getElementById(id); if (!z) return;
    var brut=z.innerHTML||'';
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-apr';
    sur.innerHTML='<div class="boite" style="max-width:820px"><div class="tt"><h3>Aperçu du contenu</h3>'
      +'<button class="mini" id="a-x">Fermer</button></div>'
      +'<div class="apr" id="a-corps"><div class="vide">⏳ Résolution des variables…</div></div></div>';
    document.body.appendChild(sur);
    sur.addEventListener('click', function(e){ if (e.target===sur) sur.remove(); });
    document.getElementById('a-x').onclick=function(){ sur.remove(); };
    // La résolution se fait DANS LA PAGE : elle a besoin du nom de marque, du
    // courriel, du délai de retour et des collections. Les recopier ici ferait
    // un aperçu qui ment dès que l’un d’eux change.
    appeler('pages:politique:apercu',[brut]).then(function(r){
      var c=document.getElementById('a-corps'); if (!c) return;
      if (r && r.ok) c.innerHTML=r.html||'<div class="vide">Section vide.</div>';
      else c.innerHTML='<div class="vide">'+expliquer(r)+'</div>';
    });
  }

  // ── Petite fenêtre de saisie (les boîtes natives sont proscrites) ─
  function demanderTexte(titre,label,valeur,suite){
    var sur=document.createElement('div'); sur.className='sur';
    sur.innerHTML='<div class="boite" style="max-width:460px"><div class="tt"><h3>'+esc(titre)+'</h3></div>'
      +'<div class="liste"><label class="champ" style="margin:0"><span class="lbl">'+esc(label)+'</span>'
      +'<input class="t" id="dt-v" value="'+esc(valeur||'')+'"></label>'
      +'<div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.9rem">'
      +'<button class="b" id="dt-n">Annuler</button><button class="prim" id="dt-o">Insérer</button></div></div></div>';
    document.body.appendChild(sur);
    var champ=document.getElementById('dt-v');
    champ.focus(); champ.select();
    var fin=function(v){ sur.remove(); suite(v); };
    document.getElementById('dt-n').onclick=function(){ sur.remove(); };
    document.getElementById('dt-o').onclick=function(){ fin(String(champ.value||'').trim()); };
    champ.onkeydown=function(e){ if (e.key==='Enter'){ e.preventDefault(); fin(String(champ.value||'').trim()); }
      else if (e.key==='Escape'){ sur.remove(); } };
  }

  // ── La vue ───────────────────────────────────────────────────────
  function polCourante(){
    if (!POL){ POL={}; var src=D.politiques||{};
      for (var i=0;i<SECS.length;i++){ var k=SECS[i].k; var s=src[k]||{};
        POL[k]={ title:s.title||'', subtitle:s.subtitle||'', content:s.content||'' }; } }
    return POL[SECP];
  }
  function marquerSale(){ if (SALE[SECP]) return; SALE[SECP]=true; peindreSousOnglets(); }
  function syncPol(){
    if (!POL) return;
    var p=POL[SECP]; if (!p) return;
    var t=document.getElementById('pol-t'), s=document.getElementById('pol-s'), z=document.getElementById('pol-ed');
    if (t) p.title=String(t.value||'').trim();
    if (s) p.subtitle=String(s.value||'').trim();
    if (z) p.content=z.innerHTML||'';
  }
  function peindreSousOnglets(){
    var el=document.getElementById('souso'); if (!el) return;
    var h='';
    for (var i=0;i<SECS.length;i++){ var o=SECS[i];
      h+='<button data-sec="'+o.k+'" class="'+(SECP===o.k?'on':'')+'">'+esc(o.n)
        +(SALE[o.k]?'<span class="pt" title="Modifications non enregistrées"></span>':'')+'</button>'; }
    el.innerHTML=h;
    var bs=el.querySelectorAll('[data-sec]');
    for (var j=0;j<bs.length;j++) bs[j].onclick=function(){
      var k=this.getAttribute('data-sec'); if (k===SECP) return;
      syncPol(); fermerFlot(); SECP=k; vueRetours(); };
  }
  function vueRetours(){
    fermerFlot();
    var p=polCourante();
    var nom=''; for (var i=0;i<SECS.length;i++) if (SECS[i].k===SECP) nom=SECS[i].n;
    var h='<div id="souso" class="souso"></div>'
      +'<div class="carte"><div class="entete"><h3>'+esc(nom)+'</h3>'
      +'<div style="display:flex;gap:.4rem;align-items:center">'
      +(SALE[SECP]?'<span style="font-size:.76rem;color:#facc15">Modifications non enregistrées</span>':'')
      +boutonEnr('polEnr')+'</div></div>'
      +'<div class="grille2">'+champ('pol-t','Titre de la section',p.title)+champ('pol-s','Sous-titre',p.subtitle)+'</div>'
      +'<label class="champ" style="margin:0"><span class="lbl">Contenu de la section</span></label>'
      +edHtml('pol-ed',p.content)
      +'</div>';
    corps.innerHTML=h;
    peindreSousOnglets();
    edLier('pol-ed');
    var t=document.getElementById('pol-t'), s=document.getElementById('pol-s');
    if (t) t.oninput=marquerSale;
    if (s) s.oninput=marquerSale;
    lierEnr('polEnr', enregistrerPolitique);
  }
  function enregistrerPolitique(){
    if (RO||OCCUPE) return;
    syncPol();
    var sec=SECP, p=POL[sec];
    OCCUPE=true;
    dire('Enregistrement… (dépôt des images dans le nuage si besoin)');
    appeler('pages:politique:ecrire',[sec,{title:p.title,subtitle:p.subtitle,content:p.content}]).then(function(r){
      OCCUPE=false;
      if (r && r.ok){
        // ⚠ ON REPREND LE CONTENU RENVOYÉ. Le cœur y a remplacé les images
        // data: par leur adresse dans R2 : sans cette reprise, l’écran garderait
        // les data: et le prochain enregistrement redéposerait les mêmes images.
        if (r.politique) POL[sec]=r.politique;
        if (D.politiques) D.politiques[sec]=POL[sec];
        SALE[sec]=false;
        if (SECP===sec) vueRetours();
        dire('Section enregistrée.', 'bon');
      } else dire('Échec : '+expliquer(r), 'err');
    });
  }

  // ── GUIDE DES TAILLES ────────────────────────────────────────────
  function vueTailles(){
    if (!GUIDES){ GUIDES=(D.sizeGuides||[]).map(function(g){ return { id:g.id, name:g.name||'', nameEN:g.nameEN||'', headers:(g.headers||[]).slice(), rows:(g.rows||[]).map(function(r){ return r.slice(); }) }; }); }
    var sp=D.sizesPage||{};
    var h='<div class="carte"><div class="entete"><h3>Guide des tailles</h3>'+boutonEnr('tzEnr')+'</div>'
      +'<div class="grille2">'+champ('tz-title','Titre de la page',sp.title||'')+champ('tz-sub','Sous-titre',sp.subtitle||'')+'</div>'
      +'<label class="champ" style="margin:0"><span class="lbl">Texte d’introduction</span><textarea class="t" id="tz-intro" rows="2"'+(RO?' disabled':'')+'>'+esc(sp.intro||'')+'</textarea></label>'
      +'</div>';
    h+='<div id="tz-guides">';
    if (!GUIDES.length) h+='<div class="vide">Aucun guide.</div>';
    for (var gi=0; gi<GUIDES.length; gi++){ var g=GUIDES[gi];
      h+='<div class="carte"><div class="entete" style="margin-bottom:.7rem"><div style="display:flex;gap:.4rem;flex:1;flex-wrap:wrap">'
        +'<input class="t" data-gname="'+gi+'" value="'+esc(g.name)+'" placeholder="Nom du guide" style="max-width:280px;font-weight:600"'+(RO?' disabled':'')+'>'
        +'<input class="t" data-gnameen="'+gi+'" value="'+esc(g.nameEN)+'" placeholder="Nom (EN)" style="max-width:240px"'+(RO?' disabled':'')+'></div>'
        +(RO?'':'<div style="display:flex;gap:.3rem"><button class="b" data-grow="'+gi+'">＋ Ligne</button><button class="b dgr" data-gdel="'+gi+'">Supprimer</button></div>')+'</div>';
      h+='<div style="overflow-x:auto"><table class="tb"><thead><tr>';
      for (var hh=0; hh<g.headers.length; hh++) h+='<th><input class="t" data-gh="'+gi+'-'+hh+'" value="'+esc(g.headers[hh])+'" style="font-weight:600"'+(RO?' disabled':'')+'></th>';
      h+='<th style="width:30px"></th></tr></thead><tbody>';
      for (var ri=0; ri<g.rows.length; ri++){ h+='<tr>';
        for (var ci=0; ci<g.rows[ri].length; ci++) h+='<td><input class="t" data-gc="'+gi+'-'+ri+'-'+ci+'" value="'+esc(g.rows[ri][ci])+'"'+(RO?' disabled':'')+'></td>';
        h+='<td style="text-align:center">'+(RO?'':'<button class="b dgr" data-grrm="'+gi+'-'+ri+'" style="padding:.1rem .4rem">✕</button>')+'</td></tr>';
      }
      h+='</tbody></table></div></div>';
    }
    h+='</div>';
    if (!RO) h+='<button class="b" id="tz-addguide">＋ Ajouter un guide</button>';
    corps.innerHTML=h;
    lierEnr('tzEnr', enregistrerTailles);
    lierTailles();
  }
  function lierTailles(){
    var q=function(sel,fn){ var e=corps.querySelectorAll(sel); for (var i=0;i<e.length;i++) fn(e[i]); };
    q('[data-gname]', function(e){ e.oninput=function(){ GUIDES[+this.getAttribute('data-gname')].name=this.value; }; });
    q('[data-gnameen]', function(e){ e.oninput=function(){ GUIDES[+this.getAttribute('data-gnameen')].nameEN=this.value; }; });
    q('[data-gh]', function(e){ e.oninput=function(){ var p=this.getAttribute('data-gh').split('-'); GUIDES[+p[0]].headers[+p[1]]=this.value; }; });
    q('[data-gc]', function(e){ e.oninput=function(){ var p=this.getAttribute('data-gc').split('-'); GUIDES[+p[0]].rows[+p[1]][+p[2]]=this.value; }; });
    q('[data-grow]', function(e){ e.onclick=function(){ syncTailles(); var gi=+this.getAttribute('data-grow'); var n=GUIDES[gi].headers.length; var row=[]; for (var i=0;i<n;i++) row.push(''); GUIDES[gi].rows.push(row); vueTailles(); }; });
    q('[data-grrm]', function(e){ e.onclick=function(){ syncTailles(); var p=this.getAttribute('data-grrm').split('-'); GUIDES[+p[0]].rows.splice(+p[1],1); vueTailles(); }; });
    q('[data-gdel]', function(e){ e.onclick=function(){ syncTailles(); GUIDES.splice(+this.getAttribute('data-gdel'),1); vueTailles(); }; });
    var ag=document.getElementById('tz-addguide'); if (ag) ag.onclick=function(){ syncTailles(); GUIDES.push({ id:null, name:'Nouveau guide', nameEN:'', headers:['Taille','Mesure 1 (cm)','Mesure 2 (cm)'], rows:[['','','']] }); vueTailles(); };
  }
  function syncTailles(){
    var q=function(sel,fn){ var e=corps.querySelectorAll(sel); for (var i=0;i<e.length;i++) fn(e[i]); };
    q('[data-gname]', function(e){ GUIDES[+e.getAttribute('data-gname')].name=e.value; });
    q('[data-gnameen]', function(e){ GUIDES[+e.getAttribute('data-gnameen')].nameEN=e.value; });
    q('[data-gh]', function(e){ var p=e.getAttribute('data-gh').split('-'); GUIDES[+p[0]].headers[+p[1]]=e.value; });
    q('[data-gc]', function(e){ var p=e.getAttribute('data-gc').split('-'); GUIDES[+p[0]].rows[+p[1]][+p[2]]=e.value; });
  }
  function enregistrerTailles(){ if (RO||OCCUPE) return; syncTailles();
    var guides=GUIDES.filter(function(g){ return String(g.name||'').trim(); });
    var page={ title:val('tz-title'), subtitle:val('tz-sub'), intro:val('tz-intro') };
    OCCUPE=true; dire('Enregistrement…');
    appeler('pages:sizes:ecrire',[{page:page,guides:guides}]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ if (r.sizeGuides) D.sizeGuides=r.sizeGuides; D.sizesPage=page; GUIDES=null; vueTailles(); dire('Guide des tailles enregistré.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }

  // ── EN VEDETTE ───────────────────────────────────────────────────
  function vueVedette(){
    var items=D.vedette||[];
    var h='<div class="carte"><h3>Menu Vêtements — En vedette</h3>'
      +'<div class="note" style="margin:.6rem 0 1rem">Les 4 sections du méga-menu « Vêtements » sont fixes. Vous pouvez ajouter ou retirer des liens dans la section « En vedette ».</div>';
    if (!RO) h+='<div class="grille2" style="align-items:end;gap:.6rem"><label class="champ" style="margin:0"><span class="lbl">Libellé</span><input class="t" id="ved-label" placeholder="ex. Meilleures ventes"></label>'
      +'<div style="display:flex;gap:.5rem;align-items:end"><label class="champ" style="margin:0;flex:1"><span class="lbl">Lien</span><input class="t" id="ved-href" placeholder="ex. #shop?cat=robes"></label><button class="prim" id="ved-add">Ajouter</button></div></div>';
    h+='<div id="ved-liste" style="margin-top:1rem">';
    if (!items.length) h+='<div class="vide">Aucun lien — la section sera vide dans le menu.</div>';
    for (var i=0;i<items.length;i++){ var it=items[i];
      h+='<div class="lien"><div class="g"><strong>'+esc(it.label)+'</strong><div><code>'+esc(it.href)+'</code></div></div>'
        +(RO?'':'<button class="b dgr" data-vrm="'+i+'">Retirer</button>')+'</div>';
    }
    h+='</div></div>';
    corps.innerHTML=h;
    var add=document.getElementById('ved-add'); if (add) add.onclick=ajouterVedette;
    var rms=corps.querySelectorAll('[data-vrm]'); for (var r=0;r<rms.length;r++) rms[r].onclick=function(){ retirerVedette(+this.getAttribute('data-vrm')); };
  }
  function ajouterVedette(){ if (RO||OCCUPE) return; var label=val('ved-label'), href=val('ved-href');
    if (!label||!href){ dire('Libellé et lien requis.', 'err'); return; }
    OCCUPE=true; dire('Ajout…');
    appeler('pages:vedette:ajouter',[{label:label,href:href}]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D.vedette=r.vedette||[]; vueVedette(); dire('Lien ajouté.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }
  function retirerVedette(i){ if (RO||OCCUPE) return; OCCUPE=true; dire('Retrait…');
    appeler('pages:vedette:retirer',[i]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D.vedette=r.vedette||[]; vueVedette(); dire('Lien retiré.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
  }

  // ── COMMUN ───────────────────────────────────────────────────────
  function champ(id,label,v){ return '<label class="champ"><span class="lbl">'+esc(label)+'</span><input class="t" id="'+id+'" value="'+esc(v)+'"'+(RO?' disabled':'')+'></label>'; }
  function boutonEnr(id){ return RO?'':'<button class="prim" id="'+id+'">Enregistrer</button>'; }
  function lierEnr(id, fn){ var b=document.getElementById(id); if (b) b.onclick=fn; }
  function enregistrer(op, args, ok){ if (RO||OCCUPE) return; OCCUPE=true;
    appeler(op,args).then(function(r){ OCCUPE=false; if (r&&r.ok){ dire(ok, 'bon'); } else { dire('Échec : '+expliquer(r), 'err'); recharger('', ''); } });
  }

  function rendre(){
    var av=document.getElementById('ro'); if (av) av.hidden=!RO;
    tabs();
    if (ONGLET==='faq') vueFaq();
    else if (ONGLET==='contact') vueContact();
    else if (ONGLET==='retours') vueRetours();
    else if (ONGLET==='tailles') vueTailles();
    else if (ONGLET==='vedette') vueVedette();
    else vueListe();
  }

  function recharger(msg, cl){
    appeler('pages:donnees',[]).then(function(r){ if (r&&r.ok){ D=r; RO=!r.peutModifier; if (msg) dire(msg, cl); } });
  }
  function charger(){
    dire('Chargement…');
    appeler('pages:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; RO=!r.peutModifier; rendre(); dire('');
      // Ouverture directe de l editeur (banc, ou lien profond) : apres le dessin
      // de la liste, une fois D disponible.
      if (CPOUV){ if (CPOUV==='nouvelle') ouvrirEditeurPage(''); else ouvrirEditeurPage(CPOUV); CPOUV=''; }
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pagePages };
