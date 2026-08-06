'use strict';

/*
 * MENU INTÉGRÉ — barre ancrable, redimensionnable et détachable
 * =============================================================================
 * La barre de menus native de Windows est une bande grise plate, sans thème et
 * sans réglage. Ce module la remplace par un menu DESSINÉ, qui suit le thème
 * clair/sombre de l'administration et que l'on peut :
 *   • ancrer EN HAUT (barre horizontale), À GAUCHE ou À DROITE (rail vertical) ;
 *   • DÉTACHER dans sa propre fenêtre, déplaçable sur un second écran ;
 *   • agrandir ou réduire (facteur d'échelle).
 * Le choix est retenu par poste (voir reglages.js).
 *
 * ── POURQUOI L'INJECTION PLUTÔT QU'UNE FENÊTRE À PART (mode ancré) ───────────
 * L'application n'embarque aucune copie du site : elle ouvre adm.sandriza.com.
 * Une barre en HTML local ne pourrait pas appeler `Admin.renderSection()` — elle
 * serait dans un autre document. Injectée DANS la page, chaque entrée appelle
 * exactement le même code que les boutons du site : les gardes de permission et
 * de lecture seule s'appliquent telles quelles, sans rien réécrire.
 * (En mode détaché, la fenêtre transmet l'appel au processus principal, qui
 * l'exécute dans la page — même code au bout du compte.)
 *
 * ⚠ LA BARRE NATIVE RESTE ENREGISTRÉE, MAIS MASQUÉE (voir main.js) : c'est elle
 * qui porte les raccourcis clavier. Les supprimer obligerait à les réenregistrer
 * en raccourcis GLOBAUX, qui voleraient les touches aux autres applications.
 *
 * ⚠ PAS DE `backdrop-filter` ICI. Un ancêtre qui en porte neutralise
 * `position:fixed` chez ses descendants (piège déjà rencontré sur les panneaux).
 * Fond plein : même rendu, aucun effet de bord.
 */

// Hauteur/largeur de base, avant application du facteur d'échelle.
const H_BASE = 44;   // barre horizontale
const L_BASE = 210;  // rail vertical

const dims = (taille) => ({
  h: Math.round(H_BASE * taille),
  l: Math.round(L_BASE * taille),
  police: (13.5 * taille).toFixed(1),
});

/** Feuille de style commune aux trois modes ancrés ET à la fenêtre détachée. */
function css(taille, mode) {
  const d = dims(taille);
  const vertical = (mode === 'gauche' || mode === 'droite');
  return `
/* ⚠ Les variables sont posées AUSSI sur .sz-panneau : depuis la correction du
   rognage, les panneaux ne sont plus des enfants de la barre (ils vivent dans
   <body>), donc ils n'héritent plus de rien d'elle. Sans cette ligne, un menu
   ouvert perdrait ses couleurs et son thème sombre. */
#sz-menubar,.sz-racine,.sz-panneau{
  --sz-h:${d.h}px; --sz-l:${d.l}px;
  --sz-bg:#ffffff; --sz-bg2:#f6f7f9; --sz-fg:#1f2937; --sz-fg-doux:#6b7280;
  --sz-bord:rgba(15,23,42,0.10); --sz-surv:rgba(15,23,42,0.055);
  --sz-accent:#C49A6C; --sz-ombre:0 12px 34px rgba(15,23,42,0.14),0 2px 6px rgba(15,23,42,0.07);
  font:500 ${d.police}px/1.25 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  color:var(--sz-fg);
  /* La selection de texte avalait le clic sur les controles (piege connu). */
  user-select:none; -webkit-user-select:none;
}
/* La classe sz-sombre est posee par le processus principal quand la page n'a PAS
   d'attribut data-admin-ui — c'est le cas de l'ECRAN DE CONNEXION, qui n'a pas
   encore de session donc pas de preference chargee. Sans elle, le menu serait
   clair a la connexion puis sombre juste apres : deux apparences pour une meme
   barre, a une seconde d'intervalle.
   ⚠ AUCUN ACCENT GRAVE DANS CES COMMENTAIRES — voir l'avertissement plus bas. */
html[data-admin-ui="dark"] #sz-menubar,html[data-admin-ui="dark"] .sz-racine,html[data-admin-ui="dark"] .sz-panneau,
#sz-menubar.sz-sombre,.sz-panneau.sz-sombre,.sz-racine.sz-sombre{
  --sz-bg:#131b2a; --sz-bg2:#0e1522; --sz-fg:#e5e7eb; --sz-fg-doux:#9ca3af;
  --sz-bord:rgba(255,255,255,0.09); --sz-surv:rgba(255,255,255,0.075);
  --sz-ombre:0 12px 34px rgba(0,0,0,0.55),0 2px 6px rgba(0,0,0,0.35);
  color-scheme:dark;
}
#sz-menubar{
  position:${vertical ? 'fixed' : 'relative'}; z-index:300;
  background:linear-gradient(${vertical ? '90deg' : '180deg'},var(--sz-bg) 0%,var(--sz-bg2) 100%);
  display:flex; align-items:${vertical ? 'stretch' : 'center'};
  flex-direction:${vertical ? 'column' : 'row'};
  gap:${vertical ? '3px' : '2px'};
  padding:${vertical ? '10px 8px' : '0 10px'};
  ${vertical
    ? `top:var(--nav-h); bottom:0; width:var(--sz-l); ${mode === 'gauche' ? 'left:0; border-right' : 'right:0; border-left'}:1px solid var(--sz-bord); overflow-y:auto; overflow-x:visible;`
    : 'height:var(--sz-h); border-bottom:1px solid var(--sz-bord);'}
}
#sz-menubar::-webkit-scrollbar{width:8px}
#sz-menubar::-webkit-scrollbar-thumb{background:var(--sz-surv);border-radius:8px}

.sz-marque{
  display:flex; align-items:center; gap:9px; flex-shrink:0;
  ${vertical
    ? 'padding:2px 6px 12px; border-bottom:1px solid var(--sz-bord); margin-bottom:6px;'
    : 'padding:0 12px 0 4px; margin-right:6px; border-right:1px solid var(--sz-bord); height:26px;'}
}
.sz-pastille{
  width:${Math.round(24 * taille)}px;height:${Math.round(24 * taille)}px;border-radius:7px;flex-shrink:0;
  background:linear-gradient(135deg,#1e3a8a,#0f172a);
  color:var(--sz-accent);font-weight:700;font-size:${(13 * taille).toFixed(1)}px;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 1px 4px rgba(0,0,0,0.28);
}
.sz-nom{
  font-size:${(11 * taille).toFixed(1)}px;letter-spacing:1.7px;text-transform:uppercase;
  color:var(--sz-fg-doux);font-weight:600;white-space:nowrap;
}
.sz-btn{
  appearance:none;border:0;background:transparent;color:inherit;font:inherit;
  padding:${vertical ? '9px 11px' : '8px 12px'};border-radius:9px;cursor:pointer;white-space:nowrap;
  transition:background .13s ease,color .13s ease;
  ${vertical ? 'text-align:left;width:100%;display:flex;align-items:center;gap:9px;' : ''}
}
.sz-btn:hover{background:var(--sz-surv)}
.sz-btn.sz-ouvert{background:var(--sz-surv);color:var(--sz-fg)}
.sz-droite{
  ${vertical ? 'margin-top:auto;padding-top:10px;border-top:1px solid var(--sz-bord);display:flex;align-items:center;gap:2px;'
             : 'margin-left:auto;display:flex;align-items:center;gap:2px;'}
}
.sz-icone{
  width:${Math.round(32 * taille)}px;height:${Math.round(30 * taille)}px;
  display:flex;align-items:center;justify-content:center;padding:0;border-radius:9px;flex-shrink:0;
}
.sz-icone svg{width:${Math.round(16 * taille)}px;height:${Math.round(16 * taille)}px;display:block}
.sz-ver{font-size:${(11 * taille).toFixed(1)}px;color:var(--sz-fg-doux);padding:0 8px;letter-spacing:.3px}

/* ── Panneaux déroulants ─────────────────────────────────────────────────── */
/* ⚠ position:fixed ET PLACÉS DANS le body, PAS DANS LA BARRE — correctif du
   2026-08-06. Ancré à gauche ou à droite, le rail a besoin d'overflow-y:auto
   pour défiler quand la liste est longue ; or un conteneur qui défile sur UN axe
   devient un conteneur de ROGNAGE sur les DEUX (CSS calcule overflow-x:visible
   en auto dès que l'autre axe ne vaut pas visible). Les panneaux, qui sortent
   latéralement, étaient donc coupés net : les sous-menus « ne marchaient plus »
   alors qu'ils s'ouvraient bel et bien, invisibles. Hors du rail, plus rien ne
   peut les rogner ; les coordonnées sont calculées en JS.
   (position:fixed est sûr ici : aucun ancêtre ne porte de backdrop-filter, qui
   l'aurait neutralisé — voir les pièges CSS des panneaux.)
   ⚠ AUCUN ACCENT GRAVE DANS CES COMMENTAIRES : cette feuille de style vit dans
   un gabarit JS, un accent grave y termine la chaîne et casse le fichier. */
.sz-panneau{
  position:fixed;min-width:${Math.round(236 * taille)}px;max-width:${Math.round(360 * taille)}px;
  background:var(--sz-bg);border:1px solid var(--sz-bord);border-radius:13px;
  box-shadow:var(--sz-ombre);padding:6px;z-index:310;
  animation:sz-ouvre .13s ease-out;
}
@keyframes sz-ouvre{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
.sz-item{
  display:flex;align-items:center;gap:10px;width:100%;
  padding:${(8.5 * taille).toFixed(0)}px 10px;border-radius:9px;border:0;background:transparent;
  color:var(--sz-fg);font:inherit;font-weight:450;text-align:left;cursor:pointer;
  transition:background .1s ease;
}
.sz-item:hover{background:var(--sz-surv)}
.sz-item .sz-lbl{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sz-item .sz-acc{font-size:${(11 * taille).toFixed(1)}px;color:var(--sz-fg-doux);letter-spacing:.4px;flex-shrink:0}
.sz-item .sz-fleche{font-size:10px;color:var(--sz-fg-doux);flex-shrink:0}
.sz-item .sz-coche{width:14px;flex-shrink:0;color:var(--sz-accent)}
.sz-sep{height:1px;background:var(--sz-bord);margin:5px 8px;border:0}
.sz-titre{
  padding:9px 10px 4px;font-size:${(10.5 * taille).toFixed(1)}px;letter-spacing:1.2px;
  text-transform:uppercase;color:var(--sz-fg-doux);font-weight:700;
}
/* Le sous-panneau est placé lui aussi en JS, pour la même raison. */
.sz-souspanneau{position:fixed}
`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Corps du dessinateur, commun à la page injectée et à la fenêtre détachée.
   `AGIR` est le seul point de divergence : ancré, on exécute dans la page ;
   détaché, on transmet au processus principal.
   ───────────────────────────────────────────────────────────────────────── */
function corpsDessin(AGIR) {
  return `
  // Place un panneau EN COORDONNÉES ÉCRAN, et le fait basculer de l'autre côté
  // plutôt que de le laisser sortir de la fenêtre. Le panneau doit déjà être
  // dans le document pour qu'on puisse le mesurer.
  function placer(pan, rect, cote){
    document.body.appendChild(pan);
    var w=pan.offsetWidth, h=pan.offsetHeight;
    var vw=window.innerWidth, vh=window.innerHeight, x, y;
    if(cote==='bas'){ x=rect.left; y=rect.bottom+3; }
    else if(cote==='droite'){ x=rect.right+4; y=rect.top; }
    else { x=rect.left-w-4; y=rect.top; }
    if(cote==='droite' && x+w>vw-6) x=rect.left-w-4;   // pas la place a droite
    if(cote==='gauche' && x<6)      x=rect.right+4;    // ni a gauche
    pan.style.left=Math.max(6,Math.min(x,vw-w-6))+'px';
    pan.style.top =Math.max(6,Math.min(y,vh-h-6))+'px';
    return pan;
  }

  function panneau(items, ancre, sousMenu, racine){
    var pan=document.createElement('div');
    pan.className='sz-panneau'+(sousMenu?' sz-souspanneau':'')
      +((typeof D!=='undefined'&&D.sombre)?' sz-sombre':'');
    items.forEach(function(it){
      if(it.sep){ var h=document.createElement('div'); h.className='sz-sep'; pan.appendChild(h); return; }
      var b=document.createElement('button');
      b.type='button'; b.className='sz-item';
      if(it.coche!==undefined){ var ck=document.createElement('span'); ck.className='sz-coche'; ck.textContent=it.coche?'\\u2713':''; b.appendChild(ck); }
      var l=document.createElement('span'); l.className='sz-lbl'; l.textContent=it.label; b.appendChild(l);
      if(it.sub){ var f=document.createElement('span'); f.className='sz-fleche'; f.textContent='\\u25B8'; b.appendChild(f); }
      else if(it.accel){ var ac=document.createElement('span'); ac.className='sz-acc'; ac.textContent=it.accel; b.appendChild(ac); }
      // onclick : marche a la souris ET au doigt. Jamais de survol seul.
      b.onclick=function(ev){
        ev.stopPropagation();
        if(it.sub){
          // Un seul sous-panneau ouvert a la fois. Ils vivent dans <body>, donc
          // on les retrouve par leur classe et non parmi les enfants du parent.
          var ouverts=document.querySelectorAll('.sz-souspanneau');
          var etaitLui=false;
          for(var k=0;k<ouverts.length;k++){
            if(ouverts[k].__szParent===b) etaitLui=true;
            ouverts[k].remove();
          }
          if(etaitLui) return;                       // 2e clic = on referme
          var sp=panneau(it.sub,null,true,racine);
          sp.__szParent=b;
          var rp=pan.getBoundingClientRect(), rb=b.getBoundingClientRect();
          placer(sp,{left:rp.left,right:rp.right,top:rb.top-6,bottom:rb.bottom},'droite');
          return;
        }
        ${AGIR}
      };
      pan.appendChild(b);
    });
    return pan;
  }`;
}

/**
 * Script injecté dans la page de l'administration (modes ancrés).
 * @param {object} desc { menus, version, mode, taille }
 */
function scriptBarre(desc) {
  const taille = desc.taille || 1;
  const mode = desc.mode || 'haut';
  const d = dims(taille);
  const vertical = (mode === 'gauche' || mode === 'droite');
  // Comment la page fait de la place au menu, selon l'ancrage.
  // ⚠ DEUX MISES EN PAGE À AJUSTER, PAS UNE. `.admin-layout` est le panneau
  // d'administration ; `.admlogin-root` est l'ÉCRAN DE CONNEXION, qui a sa
  // propre coquille en `min-height:100vh`. Sans sa ligne à lui, la barre le
  // pousserait hors de l'écran et la page se mettrait à défiler.
  const ajustement = !desc.menus.length ? ''
    : vertical
      ? (mode === 'gauche'
        ? `.admin-layout{padding-left:${d.l}px!important}.admin-sidebar{left:${d.l}px!important}`
          + `.admlogin-root{padding-left:${d.l}px!important}`
        : `.admin-layout{padding-right:${d.l}px!important}`
          + `.admlogin-root{padding-right:${d.l}px!important}`)
      : `.admin-layout{height:calc(100vh - var(--nav-h) - ${d.h}px)!important}`
        + `.admlogin-root{min-height:calc(100vh - ${d.h}px)!important}`
        + `.admlogin-split{min-height:calc(100vh - ${d.h}px)!important}`;

  return `(function(){
  try{
    var D=${JSON.stringify({ ...desc, mode, taille })};
    var ID='sz-menubar';

    var st=document.getElementById('sz-menubar-css');
    if(!st){ st=document.createElement('style'); st.id='sz-menubar-css'; (document.head||document.documentElement).appendChild(st); }
    st.textContent=${JSON.stringify('')}+${JSON.stringify(css(taille, mode))};

    var fit=document.getElementById('sz-menubar-fit');
    if(!fit){ fit=document.createElement('style'); fit.id='sz-menubar-fit'; (document.head||document.documentElement).appendChild(fit); }
    fit.textContent=${JSON.stringify(ajustement)};

    var vieux=document.getElementById(ID);
    if(vieux) vieux.remove();

    // Rien a montrer : ecran de connexion, ou menu detache dans sa fenetre.
    if(!D.menus||!D.menus.length) return;

    // En mode HAUT, la barre se glisse dans le flux JUSTE AU-DESSUS du panneau :
    // elle n'a rien a recouvrir et se place bien, que la barre du site soit
    // affichee ou non. En mode vertical, elle est fixe sur le cote.
    // L'ancre est le panneau d'administration OU, avant la connexion, la
    // coquille de l'ecran de connexion : le menu doit exister aux deux endroits,
    // avec la meme allure. Il n'y porte que les entrees utilisables.
    var layout=document.querySelector('.admin-layout')||document.querySelector('.admlogin-root');
    if(!layout||!layout.parentNode) return;

    var bar=document.createElement('div'); bar.id=ID;
    if(D.sombre) bar.classList.add('sz-sombre');
    var ouvert=null;

    function fermer(){
      var p=document.querySelectorAll('.sz-panneau');
      for(var i=0;i<p.length;i++) p[i].remove();
      var o=bar.querySelectorAll('.sz-ouvert');
      for(var j=0;j<o.length;j++) o[j].classList.remove('sz-ouvert');
      ouvert=null;
    }
    function envoyer(it){
      fermer();
      try{
        if(it.app&&window.sandrizaDesktop&&window.sandrizaDesktop.menuAction){ window.sandrizaDesktop.menuAction(it.app); return; }
        if(it.run){ (0,eval)(it.run); }
      }catch(e){ if(typeof Toast!=='undefined') Toast.show('Action indisponible','error'); }
    }
    ${corpsDessin('envoyer(it);')}

    D.menus.forEach(function(m){
      var b=document.createElement('button');
      b.type='button'; b.className='sz-btn'; b.textContent=m.label;
      b.onclick=function(ev){
        ev.stopPropagation();
        var deja=(ouvert===m.label);
        fermer();
        if(deja) return;
        b.classList.add('sz-ouvert'); ouvert=m.label;
        var pan=panneau(m.items,b,false,bar);
        // Le panneau est place dans <body>, en coordonnees ecran : le rail
        // vertical defile (overflow-y:auto) et rognerait tout ce qui en sort.
        placer(pan,b.getBoundingClientRect(),${JSON.stringify(vertical ? (mode === 'gauche' ? 'droite' : 'gauche') : 'bas')});
      };
      bar.appendChild(b);
    });

    var SOLEIL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg>';
    var LUNE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
    var GRIP='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';

    var d=document.createElement('div'); d.className='sz-droite';

    // Reglages du menu : ancrage, taille, detachement.
    var gr=document.createElement('button');
    gr.type='button'; gr.className='sz-btn sz-icone'; gr.innerHTML=GRIP;
    gr.title='Position et taille du menu';
    gr.onclick=function(ev){
      ev.stopPropagation();
      var deja=(ouvert==='__reglages');
      fermer();
      if(deja) return;
      gr.classList.add('sz-ouvert'); ouvert='__reglages';
      var items=[
        {label:'Ancrer en haut',app:'dock:haut',coche:D.mode==='haut'},
        {label:'Ancrer à gauche',app:'dock:gauche',coche:D.mode==='gauche'},
        {label:'Ancrer à droite',app:'dock:droite',coche:D.mode==='droite'},
        {label:'Fenêtre séparée (autre écran)',app:'dock:fenetre',coche:D.mode==='fenetre'},
        {sep:true},
        {label:'Agrandir le menu',app:'taille:+'},
        {label:'Réduire le menu',app:'taille:-'},
        {label:'Taille par défaut',app:'taille:0'}
      ];
      var pan=panneau(items,gr,false,bar);
      placer(pan,gr.getBoundingClientRect(),${JSON.stringify(vertical ? (mode === 'gauche' ? 'droite' : 'gauche') : 'bas')});
    };
    d.appendChild(gr);

    var th=document.createElement('button');
    th.type='button'; th.className='sz-btn sz-icone';
    function majTheme(){
      var sombre=(localStorage.getItem('elg_admin_ui_theme')||'light')==='dark';
      th.innerHTML=sombre?SOLEIL:LUNE;
      th.title=sombre?'Passer au thème clair':'Passer au thème sombre';
    }
    majTheme();
    th.onclick=function(ev){
      ev.stopPropagation(); fermer();
      // On appelle la bascule DU SITE : le theme est une preference de COMPTE
      // synchronisee en Turso (cle adm_ui_theme). Ecrire nous-memes dans
      // localStorage la laisserait sur ce poste seulement.
      try{
        if(typeof Admin!=='undefined'&&Admin._toggleUiTheme) Admin._toggleUiTheme();
        else{
          var n=(localStorage.getItem('elg_admin_ui_theme')||'light')==='dark'?'light':'dark';
          localStorage.setItem('elg_admin_ui_theme',n);
          if(n==='dark') document.documentElement.setAttribute('data-admin-ui','dark');
          else document.documentElement.removeAttribute('data-admin-ui');
        }
      }catch(e){}
      setTimeout(majTheme,60);
    };
    d.appendChild(th);
    bar.appendChild(d);

    var marque=document.createElement('div'); marque.className='sz-marque';
    var pa=document.createElement('div'); pa.className='sz-pastille'; pa.textContent='S';
    var nom=document.createElement('span'); nom.className='sz-nom'; nom.textContent='Sandriza';
    marque.appendChild(pa); marque.appendChild(nom);
    bar.insertBefore(marque,bar.firstChild);

    if(${vertical ? 'true' : 'false'}) document.body.appendChild(bar);
    else layout.parentNode.insertBefore(bar,layout);

    // ⚠ Un panneau en coordonnees ECRAN ne suit pas ce qui bouge sous lui : si
    // le rail defile ou la fenetre change de taille, il resterait plante au
    // mauvais endroit. On le referme plutot que de le laisser mentir.
    bar.addEventListener('scroll', fermer);
    window.addEventListener('resize', fermer);

    if(!window.__szMenuGlobal){
      window.__szMenuGlobal=true;
      var vide=function(){
        var p=document.querySelectorAll('.sz-panneau');
        for(var i=0;i<p.length;i++) p[i].remove();
        var b2=document.getElementById('sz-menubar');
        if(!b2) return;
        var o=b2.querySelectorAll('.sz-ouvert');
        for(var j=0;j<o.length;j++) o[j].classList.remove('sz-ouvert');
      };
      document.addEventListener('click',vide,true);
      document.addEventListener('keydown',function(e){ if(e.key==='Escape') vide(); });
    }
  }catch(e){}
})();`;
}

/**
 * Page complète de la FENÊTRE DÉTACHÉE (mode 'fenetre').
 * Rendu en accordéon plutôt qu'en menus volants : dans une palette étroite,
 * un sous-panneau qui sort du cadre serait coupé par le bord de la fenêtre.
 */
function pageDetachee(desc) {
  const taille = desc.taille || 1;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Menu — Administration Sandriza</title>
<style>
html,body{margin:0;height:100%;overflow:hidden}
body{background:var(--sz-bg,#fff)}
.sz-racine{height:100%;display:flex;flex-direction:column;background:linear-gradient(180deg,var(--sz-bg),var(--sz-bg2));overflow-y:auto;padding:10px}
.sz-racine::-webkit-scrollbar{width:8px}
.sz-racine::-webkit-scrollbar-thumb{background:var(--sz-surv);border-radius:8px}
.sz-groupe{margin-bottom:2px}
.sz-groupe>.sz-btn{width:100%;display:flex;align-items:center;gap:8px;text-align:left;font-weight:600}
.sz-corps{padding:2px 0 6px 6px;display:none}
.sz-corps.sz-on{display:block}
${css(taille, 'fenetre')}
</style></head><body>
<div class="sz-racine" id="racine"></div>
<script>
(function(){
  var D=${JSON.stringify(desc)};
  var racine=document.getElementById('racine');
  function appliqueTheme(sombre){ racine.classList.toggle('sz-sombre',!!sombre); }
  appliqueTheme(D.sombre);
  function envoyer(it){ try{ window.szPalette && window.szPalette.action(it); }catch(e){} }
  ${corpsDessin('envoyer(it);')}
  var marque=document.createElement('div'); marque.className='sz-marque';
  var pa=document.createElement('div'); pa.className='sz-pastille'; pa.textContent='S';
  var nom=document.createElement('span'); nom.className='sz-nom'; nom.textContent='Sandriza';
  marque.appendChild(pa); marque.appendChild(nom); racine.appendChild(marque);

  (D.menus||[]).forEach(function(m){
    var g=document.createElement('div'); g.className='sz-groupe';
    var b=document.createElement('button'); b.type='button'; b.className='sz-btn';
    var fl=document.createElement('span'); fl.className='sz-fleche'; fl.textContent='\\u25B8';
    var lb=document.createElement('span'); lb.style.flex='1'; lb.textContent=m.label;
    b.appendChild(lb); b.appendChild(fl);
    var corps=document.createElement('div'); corps.className='sz-corps';
    corps.appendChild(panneau(m.items,null,false,racine));
    corps.firstChild.style.position='static';
    corps.firstChild.style.boxShadow='none';
    corps.firstChild.style.border='0';
    corps.firstChild.style.padding='0';
    corps.firstChild.style.minWidth='0';
    b.onclick=function(){
      var on=corps.classList.toggle('sz-on');
      fl.textContent=on?'\\u25BE':'\\u25B8';
    };
    g.appendChild(b); g.appendChild(corps); racine.appendChild(g);
  });

  var pied=document.createElement('div'); pied.className='sz-droite';
  [['Ancrer en haut','dock:haut'],['À gauche','dock:gauche'],['À droite','dock:droite']].forEach(function(p){
    var b=document.createElement('button'); b.type='button'; b.className='sz-btn';
    b.textContent=p[0]; b.style.fontSize='11px';
    b.onclick=function(){ envoyer({app:p[1]}); };
    pied.appendChild(b);
  });
  racine.appendChild(pied);
})();
</script></body></html>`;
}

module.exports = { scriptBarre, pageDetachee, dims };
