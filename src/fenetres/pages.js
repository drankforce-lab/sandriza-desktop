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
 * ÉTAPE 5b (à venir) : l'ÉDITEUR RICHE (contenteditable) pour « Nos politiques »
 * (retours / expédition / codes promo) et le CONTENU des pages personnalisées.
 * En attendant, ces deux surfaces renvoient vers le repli web — rien n'est cassé.
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
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
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
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pagePages() {
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
  var ONGLET = 'list';
  var FAQ = null;          // copie de travail : { title, subtitle, items:[{id,q,a}] }
  var GUIDES = null;       // copie de travail des tableaux de tailles
  var DELP = '';           // id de page personnalisée en attente de confirmation
  var VIDECONF = false;    // vider la boîte de réception, 2e clic

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
    invalide:'Libellé et lien sont requis.',
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
    var h='<div class="carte"><div class="entete"><h3>Toutes les pages <span style="font-size:.8rem;font-weight:400;color:#8fa1b8">'+(builtins.length+cp.length)+' page(s)</span></h3></div>';
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
    h+='<div class="note">ℹ Le contenu de <b>Nos politiques</b> (retours, expédition, codes promo) et le corps des <b>pages personnalisées</b> se rédigent avec l’éditeur riche — porté à la prochaine étape. En attendant, « Modifier » y renvoie vers l’écran web.</div>';
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
    var eds=corps.querySelectorAll('[data-cedit]');
    for (var e=0;e<eds.length;e++) eds[e].onclick=function(){ dire('Le contenu des pages personnalisées se modifie dans l’écran web (éditeur riche) — étape 5b à venir.', 'att'); };
    var dls=corps.querySelectorAll('[data-cdel]');
    for (var d=0;d<dls.length;d++) dls[d].onclick=function(){ var id=this.getAttribute('data-cdel');
      if (DELP===id){ DELP=''; supprimerPage(id); } else { DELP=id; vueListe(); dire('Cliquez encore pour supprimer cette page.', 'att'); } };
  }
  function supprimerPage(id){
    if (RO||OCCUPE) return; OCCUPE=true; dire('Suppression…');
    appeler('pages:custom:supprimer',[id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ recharger('Page supprimée.', 'bon'); } else dire('Échec : '+expliquer(r), 'err'); });
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
      +'<button class="b" id="ct-inbox">📬 Messages'+badge+'</button>'+boutonEnr('ctEnr')+'</div></div>'
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

  // ── NOS POLITIQUES (5b) ──────────────────────────────────────────
  function vueRetours(){
    corps.innerHTML='<div class="carte"><h3>Nos politiques</h3>'
      +'<div class="note" style="margin-top:.6rem">✍ Les sections <b>Retours & échanges</b>, <b>Expédition & livraison</b> et <b>Conditions des codes promotionnels</b> se rédigent avec l’<b>éditeur riche</b> (contenteditable) — porté à la <b>prochaine étape (5b)</b>.'
      +'<br><br>En attendant, ouvrez ces sections dans l’écran web : menu <b>Configuration → Pages du site → Nos politiques</b> (repli web), où l’éditeur complet reste disponible.</div></div>';
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
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pagePages };
